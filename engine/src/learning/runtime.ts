/**
 * @file runtime.ts
 * @module @aetheria/engine/learning/runtime
 * @description Runtime điều phối học tập và suy luận cho agent game:
 *
 * - `TrainerRegistry`: đăng ký thuật toán có kiểm tra config/snapshot, không
 *   dùng `any` và không ép kiểu mù.
 * - `LearningSession` / `LearningRuntime`: quản lý phiên huấn luyện, telemetry,
 *   checkpoint và khôi phục mô hình.
 * - `ThinkingEngine`: kết hợp policy với MCTS để ra quyết định "suy nghĩ".
 * - `ReasoningController`: xếp hạng chuỗi suy luận bằng process reward model.
 * - Bộ adapter dựng sẵn cho MLP, PPO, Dueling DQN, behavior cloning, AlphaZero,
 *   REINFORCE, TRPO, QMIX, MAPPO, MADDPG, IPO, KTO và NEAT.
 *
 * Mọi kiểu dữ liệu ở đây đều tuần tự hóa được (trừ model sống trong session),
 * nhờ đó tầng UI/Next.js chỉ cần làm việc với `SessionSummary` và checkpoint.
 */

import {
  NeuralNetwork,
  type ActivationName,
  type LRScheduleConfig,
  type NeuralNetworkConfig,
  type NeuralNetworkSnapshot,
  type OptimizerConfig,
} from '../deeplearning/nn.js';
import type { ReplaySnapshot } from '../deeplearning/replay.js';
import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';
import {
  argmaxIndex,
  oneHot,
  softmaxVector,
} from './network.js';
import {
  AlphaZeroTrainer,
  MonteCarloTreeSearch,
  ProcessRewardModelTrainer,
  type AlphaZeroConfig,
  type AlphaZeroSnapshot,
  type MCTSConfig,
  type MCTSEnvironment,
  type MCTSResult,
} from './alignment.js';
import {
  BehaviorCloningTrainer,
  type BehaviorCloningConfig,
  type BehaviorCloningSnapshot,
} from './reinforcement/imitation.js';
import {
  DuelingDQNTrainer,
  type DuelingDQNConfig,
  type DuelingDQNSnapshot,
} from './reinforcement/dqn.js';
import { PPOTrainer, type PPOConfig, type PPOSnapshot } from './reinforcement/ppo.js';
import {
  MADDPGTrainer,
  MAPPOTrainer,
  QMIXTrainer,
  type MADDPGConfig,
  type MADDPGSnapshot,
  type MAPPOConfig,
  type MAPPOSnapshot,
  type QMIXConfig,
  type QMIXSnapshot,
} from './reinforcement/marl.js';
import {
  REINFORCETrainer,
  TRPOTrainer,
  type PolicyGradientConfig,
  type REINFORCESnapshot,
  type TRPOConfig,
  type TRPOSnapshot,
} from './reinforcement/policy-gradient.js';
import {
  IPOTrainer,
  KTOTrainer,
  type IPOConfig,
  type IPOSnapshot,
  type KTOConfig,
  type KTOSnapshot,
} from './preference.js';
import { NEATTrainer, type NeatConfig, type NeatSnapshot } from './neat.js';
import {
  HyperNEATTrainer,
  type HyperNEATConfig,
  type HyperNEATSnapshot,
} from './hyperneat.js';
import {
  RainbowDQNTrainer,
  type RainbowDQNConfig,
  type RainbowDQNSnapshot,
} from './reinforcement/rainbow.js';
import {
  MuZeroTrainer,
  type MuZeroConfig,
  type MuZeroSnapshot,
} from './muzero.js';
import { WGANTrainer, type WGANConfig, type WGANSnapshot } from './generative.js';
import { DreamerTrainer, type DreamerConfig, type DreamerSnapshot } from './dreamer.js';
import {
  StyleGANLiteTrainer,
  type StyleGANConfig,
  type StyleGANSnapshot,
} from './generative.js';
import { SupervisedTrainer, type SupervisedLoss, type SupervisedOptions } from './supervised.js';
import {
  InMemoryCheckpointStore,
  TrainingHistory,
  createCheckpointId,
  type EvaluationResult,
  type LearningReport,
  type NumericVector,
  type SupervisedSample,
  type TrainingCheckpoint,
  type TrainingPoint,
} from './types.js';

/** Trạng thái vòng đời một phiên học. */
export type SessionStatus = 'idle' | 'training' | 'ready' | 'failed';

/** Một lần đánh giá được lưu trong phiên. */
export interface SessionEvaluation {
  label: string;
  result: EvaluationResult;
  at: number;
}

/** Tóm tắt phiên dành cho UI/telemetry (không chứa model sống). */
export interface SessionSummary {
  id: string;
  algorithm: string;
  status: SessionStatus;
  step: number;
  createdAt: number;
  updatedAt: number;
  latestLoss: number | null;
  latestAccuracy: number | null;
  checkpoints: number;
  metadata: Record<string, unknown>;
}

/** Trạng thái checkpoint của runtime. */
export interface RuntimeCheckpointState {
  algorithm: string;
  /** Ảnh chụp model do adapter tạo; kiểu cụ thể do adapter quyết định. */
  model: unknown;
  status: SessionStatus;
  step: number;
  metadata: Record<string, unknown>;
  history: TrainingPoint[];
  lastReport: LearningReport | null;
  lastEvaluation: EvaluationResult | null;
  createdAt: number;
  updatedAt: number;
}

/** Khởi tạo phiên học. */
export interface LearningSessionInit<TModel> {
  id: string;
  algorithm: string;
  model: TModel;
  metadata?: Record<string, unknown>;
  createdAt?: number;
  updatedAt?: number;
  status?: SessionStatus;
  step?: number;
  history?: readonly TrainingPoint[];
  lastReport?: LearningReport | null;
  lastEvaluation?: EvaluationResult | null;
}

/**
 * Một phiên học do runtime quản lý.
 *
 * Model được giữ nguyên kiểu để tầng game gọi trực tiếp; phần telemetry chỉ lưu
 * dữ liệu tuần tự hóa được.
 */
export class LearningSession<TModel> {
  public readonly id: string;
  public readonly algorithm: string;
  public readonly model: TModel;
  public readonly createdAt: number;
  public readonly history = new TrainingHistory();
  public readonly evaluations: SessionEvaluation[] = [];
  public readonly checkpoints: string[] = [];

  public metadata: Record<string, unknown>;
  public status: SessionStatus;
  public step: number;
  public updatedAt: number;
  public lastReport: LearningReport | null;
  public lastEvaluation: EvaluationResult | null;
  public lastError: string | null = null;

  constructor(init: LearningSessionInit<TModel>) {
    if (!init.id.trim()) throw new TypeError('Session id không được rỗng');
    if (!init.algorithm.trim()) throw new TypeError('Session algorithm không được rỗng');
    this.id = init.id;
    this.algorithm = init.algorithm;
    this.model = init.model;
    const now = Date.now();
    this.createdAt = init.createdAt ?? now;
    this.updatedAt = init.updatedAt ?? now;
    this.status = init.status ?? 'idle';
    this.step = Math.max(0, Math.floor(init.step ?? 0));
    this.metadata = { ...init.metadata };
    this.lastReport = init.lastReport ? cloneReport(init.lastReport) : null;
    this.lastEvaluation = init.lastEvaluation ? cloneEvaluation(init.lastEvaluation) : null;
    for (const point of init.history ?? []) this.history.push(point);
  }

  /** Đánh dấu bắt đầu huấn luyện. */
  public markTraining(): void {
    this.status = 'training';
    this.lastError = null;
    this.updatedAt = Date.now();
  }

  /** Đánh dấu sẵn sàng suy luận. */
  public markReady(): void {
    this.status = 'ready';
    this.updatedAt = Date.now();
  }

  /** Đánh dấu thất bại và lưu thông điệp lỗi. */
  public markFailed(message: string): void {
    this.status = 'failed';
    this.lastError = message;
    this.updatedAt = Date.now();
  }

  /** Ghi báo cáo huấn luyện vào lịch sử và telemetry. */
  public recordReport(report: LearningReport): void {
    this.lastReport = cloneReport(report);
    this.step += Math.max(0, report.steps);
    this.status = 'ready';
    this.lastError = null;
    this.updatedAt = Date.now();
    if (report.lossHistory.length === 0) {
      this.history.push({
        epoch: this.history.length + 1,
        loss: report.finalLoss,
        metrics: { ...report.metrics },
      });
      return;
    }
    for (let index = 0; index < report.lossHistory.length; index++) {
      const final = index === report.lossHistory.length - 1;
      this.history.push({
        epoch: this.history.length + 1,
        loss: report.lossHistory[index],
        metrics: final ? { ...report.metrics } : undefined,
      });
    }
  }

  /** Ghi kết quả đánh giá. */
  public recordEvaluation(result: EvaluationResult, label = 'validation'): void {
    const evaluation = cloneEvaluation(result);
    this.evaluations.push({ label, result: evaluation, at: Date.now() });
    this.lastEvaluation = evaluation;
    this.updatedAt = Date.now();
  }

  /** Ghi id checkpoint đã lưu cho phiên. */
  public recordCheckpoint(id: string): void {
    if (!this.checkpoints.includes(id)) this.checkpoints.push(id);
    this.updatedAt = Date.now();
  }

  /** Tóm tắt tuần tự hóa được. */
  public summary(): SessionSummary {
    return {
      id: this.id,
      algorithm: this.algorithm,
      status: this.status,
      step: this.step,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      latestLoss: this.lastReport?.finalLoss ?? finiteOrNull(this.history.latestLoss()),
      latestAccuracy: this.lastEvaluation?.accuracy ?? null,
      checkpoints: this.checkpoints.length,
      metadata: { ...this.metadata },
    };
  }
}

// ---------------------------------------------------------------------------
// Trainer registry
// ---------------------------------------------------------------------------

/**
 * Hợp đồng adapter thuật toán.
 *
 * `validateConfig`/`validateSnapshot` là ranh giới tin cậy duy nhất: registry
 * chỉ gọi code người dùng sau khi các guard này xác nhận dữ liệu.
 */
export interface TrainerAdapter<TConfig, TModel, TSnapshot> {
  readonly algorithm: string;
  readonly description: string;
  validateConfig(value: unknown): value is TConfig;
  validateModel(value: unknown): value is TModel;
  validateSnapshot(value: unknown): value is TSnapshot;
  create(config: TConfig): TModel;
  snapshot(model: TModel): TSnapshot;
  restore(snapshot: TSnapshot): TModel;
}

/** Adapter đã xóa kiểu, dùng nội bộ cho registry và checkpoint. */
export interface OpaqueTrainerAdapter {
  readonly algorithm: string;
  readonly description: string;
  create(config: unknown): unknown;
  snapshot(model: unknown): unknown;
  restore(snapshot: unknown): unknown;
}

/** Mô tả thuật toán đã đăng ký. */
export interface RegisteredAlgorithmInfo {
  algorithm: string;
  description: string;
}

/**
 * Registry thuật toán có kiểm tra kiểu tại biên.
 *
 * Mỗi adapter chỉ được đăng ký một lần; gọi `ensure` với cùng đối tượng adapter
 * là idempotent, còn adapter khác trùng tên sẽ bị từ chối.
 */
export class TrainerRegistry {
  private readonly entries = new Map<string, OpaqueTrainerAdapter>();
  private readonly sources = new Map<string, object>();

  /** Đăng ký adapter mới và trả lại chính adapter để giữ kiểu. */
  public register<TConfig, TModel, TSnapshot>(
    adapter: TrainerAdapter<TConfig, TModel, TSnapshot>,
  ): TrainerAdapter<TConfig, TModel, TSnapshot> {
    if (!adapter.algorithm.trim()) throw new TypeError('Algorithm id không được rỗng');
    if (this.entries.has(adapter.algorithm)) {
      throw new Error(`Thuật toán ${adapter.algorithm} đã được đăng ký`);
    }
    const opaque: OpaqueTrainerAdapter = {
      algorithm: adapter.algorithm,
      description: adapter.description,
      create: (config) => {
        if (!adapter.validateConfig(config)) {
          throw new TypeError(`Config không hợp lệ cho ${adapter.algorithm}`);
        }
        return adapter.create(config);
      },
      snapshot: (model) => {
        if (!adapter.validateModel(model)) {
          throw new TypeError(`Model không khớp adapter ${adapter.algorithm}`);
        }
        return adapter.snapshot(model);
      },
      restore: (snapshot) => {
        if (!adapter.validateSnapshot(snapshot)) {
          throw new TypeError(`Snapshot không hợp lệ cho ${adapter.algorithm}`);
        }
        return adapter.restore(snapshot);
      },
    };
    this.entries.set(adapter.algorithm, opaque);
    this.sources.set(adapter.algorithm, adapter);
    return adapter;
  }

  /** Đăng ký nếu chưa có; ném lỗi nếu trùng tên nhưng khác đối tượng. */
  public ensure<TConfig, TModel, TSnapshot>(
    adapter: TrainerAdapter<TConfig, TModel, TSnapshot>,
  ): void {
    const source = this.sources.get(adapter.algorithm);
    if (!source) {
      this.register(adapter);
      return;
    }
    if (source !== adapter) {
      throw new Error(`Thuật toán ${adapter.algorithm} đã được đăng ký bởi adapter khác`);
    }
  }

  /** Kiểm tra tên thuật toán. */
  public has(algorithm: string): boolean {
    return this.entries.has(algorithm);
  }

  /** Danh sách thuật toán đã đăng ký. */
  public list(): RegisteredAlgorithmInfo[] {
    return [...this.entries.values()].map((entry) => ({
      algorithm: entry.algorithm,
      description: entry.description,
    }));
  }

  /** Tạo model theo tên; trả `unknown` vì registry không thể biết kiểu cụ thể. */
  public create(algorithm: string, config: unknown): unknown {
    return this.require(algorithm).create(config);
  }

  /** Chụp model theo tên; adapter sẽ kiểm tra model trước khi chụp. */
  public snapshot(algorithm: string, model: unknown): unknown {
    return this.require(algorithm).snapshot(model);
  }

  /** Khôi phục model theo tên. */
  public restore(algorithm: string, snapshot: unknown): unknown {
    return this.require(algorithm).restore(snapshot);
  }

  /** Lấy adapter đã xóa kiểu; `null` nếu chưa đăng ký. */
  public getOpaque(algorithm: string): OpaqueTrainerAdapter | null {
    return this.entries.get(algorithm) ?? null;
  }

  private require(algorithm: string): OpaqueTrainerAdapter {
    const entry = this.entries.get(algorithm);
    if (!entry) throw new Error(`Thuật toán ${algorithm} chưa được đăng ký`);
    return entry;
  }
}

// ---------------------------------------------------------------------------
// Runtime
// ---------------------------------------------------------------------------

/** Cấu hình runtime. */
export interface LearningRuntimeConfig {
  registry?: TrainerRegistry;
  checkpointStore?: InMemoryCheckpointStore<RuntimeCheckpointState>;
  /** Đăng ký sẵn các adapter built-in; mặc định bật. */
  registerDefaults?: boolean;
}

/** Tùy chọn tạo/khôi phục phiên. */
export interface SessionOptions {
  id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Runtime quản lý nhiều phiên học song song.
 *
 * Runtime không giả định cấu trúc model: mọi thao tác checkpoint đi qua adapter
 * đã đăng ký. Tầng Application có thể dùng `train`/`evaluate` để bọc bất kỳ
 * trainer nào, hoặc `trainSupervised` cho MLP có sẵn.
 */
export class LearningRuntime {
  public readonly registry: TrainerRegistry;

  private readonly checkpointStore: InMemoryCheckpointStore<RuntimeCheckpointState>;
  private readonly sessions = new Map<string, LearningSession<unknown>>();
  private sessionSequence = 0;
  private checkpointSequence = 0;

  constructor(config: LearningRuntimeConfig = {}) {
    this.registry = config.registry ?? new TrainerRegistry();
    this.checkpointStore =
      config.checkpointStore ?? new InMemoryCheckpointStore<RuntimeCheckpointState>();
    if (config.registerDefaults !== false) registerDefaultAdapters(this.registry);
  }

  /**
   * Tạo phiên từ adapter có kiểu.
   *
   * @param adapter Adapter do người dùng giữ; được tự động đăng ký.
   * @param config Config đã được kiểm tra bởi adapter.
   */
  public createSession<TConfig, TModel, TSnapshot>(
    adapter: TrainerAdapter<TConfig, TModel, TSnapshot>,
    config: TConfig,
    options: SessionOptions = {},
  ): LearningSession<TModel> {
    this.registry.ensure(adapter);
    const model = adapter.create(config);
    return this.addSession(adapter.algorithm, model, options);
  }

  /** Tạo phiên theo tên thuật toán; model trả về ở dạng `unknown`. */
  public createSessionByName(
    algorithm: string,
    config: unknown,
    options: SessionOptions = {},
  ): LearningSession<unknown> {
    const model = this.registry.create(algorithm, config);
    return this.addSession(algorithm, model, options);
  }

  /** Lấy phiên theo id. */
  public getSession(id: string): LearningSession<unknown> | null {
    return this.sessions.get(id) ?? null;
  }

  /** Danh sách tóm tắt, mới cập nhật trước. */
  public listSessions(): SessionSummary[] {
    return [...this.sessions.values()]
      .map((session) => session.summary())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /** Xóa phiên khỏi bộ nhớ (checkpoint vẫn giữ). */
  public removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Chạy một hàm huấn luyện và ghi telemetry.
   *
   * Hàm nhận model sống nên có thể dùng bất kỳ trainer nào. Nếu hàm ném lỗi,
   * phiên chuyển sang `failed` và lỗi được ném lại cho caller.
   */
  public train<TModel>(
    session: LearningSession<TModel>,
    run: (model: TModel) => LearningReport,
  ): LearningReport {
    this.assertManaged(session);
    session.markTraining();
    try {
      const report = run(session.model);
      session.recordReport(report);
      return report;
    } catch (error) {
      session.markFailed(describeError(error));
      throw error;
    }
  }

  /** Huấn luyện MLP bằng `SupervisedTrainer` và ghi vào phiên. */
  public trainSupervised(
    session: LearningSession<NeuralNetwork>,
    samples: readonly SupervisedSample[],
    options: SupervisedOptions = {},
  ): LearningReport {
    const trainer = new SupervisedTrainer(session.model, {
      loss: options.loss,
      huberDelta: options.huberDelta,
    });
    return this.train(session, () => trainer.fit(samples, options));
  }

  /** Chạy đánh giá và ghi kết quả vào phiên. */
  public evaluate<TModel>(
    session: LearningSession<TModel>,
    run: (model: TModel) => EvaluationResult,
    label = 'validation',
  ): EvaluationResult {
    this.assertManaged(session);
    try {
      const result = run(session.model);
      session.recordEvaluation(result, label);
      return result;
    } catch (error) {
      session.markFailed(describeError(error));
      throw error;
    }
  }

  /**
   * Lưu checkpoint của phiên.
   *
   * @param sessionId Id phiên đang quản lý.
   * @param metadata Siêu dữ liệu ứng dụng (không dùng để phục hồi logic lõi).
   */
  public saveCheckpoint(
    sessionId: string,
    metadata: Record<string, unknown> = {},
  ): TrainingCheckpoint<RuntimeCheckpointState> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Không tìm thấy phiên ${sessionId}`);
    const adapter = this.registry.getOpaque(session.algorithm);
    if (!adapter) throw new Error(`Thuật toán ${session.algorithm} chưa được đăng ký`);

    const now = Date.now();
    const state: RuntimeCheckpointState = {
      algorithm: session.algorithm,
      model: adapter.snapshot(session.model),
      status: session.status,
      step: session.step,
      metadata: { ...session.metadata },
      history: session.history.all().map(clonePoint),
      lastReport: session.lastReport ? cloneReport(session.lastReport) : null,
      lastEvaluation: session.lastEvaluation
        ? cloneEvaluation(session.lastEvaluation)
        : null,
      createdAt: session.createdAt,
      updatedAt: now,
    };
    const checkpoint: TrainingCheckpoint<RuntimeCheckpointState> = {
      version: 1,
      id: createCheckpointId(`learning_${session.algorithm}`, ++this.checkpointSequence),
      createdAt: now,
      metadata: {
        sessionId: session.id,
        algorithm: session.algorithm,
        ...metadata,
      },
      state,
    };
    this.checkpointStore.save(checkpoint);
    session.recordCheckpoint(checkpoint.id);
    return checkpoint;
  }

  /** Đọc checkpoint theo id. */
  public loadCheckpoint(id: string): TrainingCheckpoint<RuntimeCheckpointState> | null {
    return this.checkpointStore.load(id);
  }

  /** Danh sách checkpoint, mới nhất trước. */
  public listCheckpoints(): TrainingCheckpoint<RuntimeCheckpointState>[] {
    return this.checkpointStore.list();
  }

  /** Xóa checkpoint. */
  public removeCheckpoint(id: string): boolean {
    return this.checkpointStore.remove(id);
  }

  /**
   * Khôi phục phiên từ checkpoint bằng adapter có kiểu.
   *
   * Adapter phải trùng `algorithm` đã lưu; snapshot được kiểm tra trước khi
   * chuyển cho `restore`, nên dữ liệu hỏng không thể lọt vào model.
   */
  public restoreSession<TConfig, TModel, TSnapshot>(
    adapter: TrainerAdapter<TConfig, TModel, TSnapshot>,
    checkpointId: string,
    options: SessionOptions = {},
  ): LearningSession<TModel> {
    this.registry.ensure(adapter);
    const checkpoint = this.checkpointStore.load(checkpointId);
    if (!checkpoint) throw new Error(`Không tìm thấy checkpoint ${checkpointId}`);
    if (checkpoint.state.algorithm !== adapter.algorithm) {
      throw new Error(
        `Checkpoint thuộc ${checkpoint.state.algorithm}, không phải ${adapter.algorithm}`,
      );
    }
    if (!adapter.validateSnapshot(checkpoint.state.model)) {
      throw new TypeError(`Snapshot checkpoint không hợp lệ cho ${adapter.algorithm}`);
    }
    const model = adapter.restore(checkpoint.state.model);
    const state = checkpoint.state;
    return this.addSession(adapter.algorithm, model, {
      id: options.id,
      metadata: { ...state.metadata, ...options.metadata },
      restored: state,
    });
  }

  /** Đăng ký adapter và trả lại chính adapter. */
  public register<TConfig, TModel, TSnapshot>(
    adapter: TrainerAdapter<TConfig, TModel, TSnapshot>,
  ): TrainerAdapter<TConfig, TModel, TSnapshot> {
    return this.registry.register(adapter);
  }

  /** Tạo phiên mới và gắn vào bộ nhớ runtime. */
  private addSession<TModel>(
    algorithm: string,
    model: TModel,
    options: SessionOptions & { restored?: RuntimeCheckpointState } = {},
  ): LearningSession<TModel> {
    const id = options.id ?? `session_${++this.sessionSequence}`;
    if (this.sessions.has(id)) throw new Error(`Phiên ${id} đã tồn tại`);
    const restored = options.restored;
    const session = new LearningSession<TModel>({
      id,
      algorithm,
      model,
      metadata: options.metadata ?? restored?.metadata,
      createdAt: restored?.createdAt,
      updatedAt: restored?.updatedAt,
      status: restored?.status,
      step: restored?.step,
      history: restored?.history,
      lastReport: restored?.lastReport,
      lastEvaluation: restored?.lastEvaluation,
    });
    this.sessions.set(id, session);
    return session;
  }

  /** Đảm bảo phiên do runtime này quản lý. */
  private assertManaged<TModel>(session: LearningSession<TModel>): void {
    if (!this.sessions.has(session.id)) {
      throw new Error(`Phiên ${session.id} không thuộc runtime này`);
    }
  }
}

// ---------------------------------------------------------------------------
// Thinking / inference
// ---------------------------------------------------------------------------

/** Policy rời rạc tối thiểu để suy luận và tìm kiếm. */
export interface DiscretePolicy {
  readonly actionCount: number;
  probabilities(state: NumericVector): number[];
  value?(state: NumericVector): number;
}

/** Tùy chọn cho ThinkingEngine. */
export interface ThinkingOptions<TState extends NumericVector> {
  /** Nhiệt độ lấy mẫu; 0 = tham lam. */
  temperature?: number;
  /** Số simulation MCTS; 0 = chỉ dùng policy. */
  simulations?: number;
  /** Hằng số khám phá UCT. */
  exploration?: number;
  discount?: number;
  maxDepth?: number;
  /** Trọng số trộn phân phối thăm MCTS; mặc định 0.5. */
  searchWeight?: number;
  seed?: number;
  /** Môi trường mô phỏng; bắt buộc nếu `simulations > 0`. */
  environment?: MCTSEnvironment<TState>;
}

/** Kết quả một lần "suy nghĩ". */
export interface ThinkingResult {
  action: number;
  probabilities: number[];
  confidence: number;
  entropy: number;
  value: number;
  source: 'policy' | 'search';
  search: MCTSResult | null;
}

/**
 * Suy luận có tìm kiếm.
 *
 * Nếu có môi trường và `simulations > 0`, MCTS chạy trước; phân phối thăm được
 * trộn với policy neural để cân bằng trực giác và tính toán trước. Nhiệt độ
 * điều khiển việc lấy mẫu, phù hợp khám phá trong lúc train và tham lam khi thi
 * đấu.
 */
export class ThinkingEngine<TState extends NumericVector> {
  public readonly policy: DiscretePolicy;
  public readonly actionCount: number;
  public readonly temperature: number;
  public readonly searchWeight: number;
  public readonly search: MonteCarloTreeSearch<TState> | null;

  private readonly random: DeepRandom;

  constructor(policy: DiscretePolicy, options: ThinkingOptions<TState> = {}) {
    if (policy.actionCount <= 0) throw new RangeError('Policy cần ít nhất một hành động');
    this.policy = policy;
    this.actionCount = Math.floor(policy.actionCount);
    this.temperature = Math.max(0, options.temperature ?? 0);
    this.searchWeight = clamp01(options.searchWeight ?? 0.5);
    this.random = new DeepRandom(options.seed ?? 1);
    const simulations = Math.max(0, Math.floor(options.simulations ?? 0));
    if (simulations > 0) {
      if (!options.environment) {
        throw new Error('ThinkingEngine cần environment khi bật MCTS');
      }
      const config: MCTSConfig = {
        simulations,
        exploration: options.exploration,
        discount: options.discount,
        maxDepth: options.maxDepth,
        seed: options.seed,
      };
      this.search = new MonteCarloTreeSearch(options.environment, config);
    } else {
      this.search = null;
    }
  }

  /** Xác suất policy đã chuẩn hóa và kiểm tra số chiều. */
  public probabilities(state: TState): number[] {
    return sanitizeProbabilities(this.policy.probabilities(state), this.actionCount);
  }

  /**
   * Ra quyết định cho một trạng thái.
   *
   * @returns Hành động, phân phối cuối, độ tin cậy và kết quả MCTS (nếu có).
   */
  public think(state: TState): ThinkingResult {
    const policyProbabilities = this.probabilities(state);
    let probabilities = policyProbabilities;
    let searchResult: MCTSResult | null = null;
    let value = this.policy.value?.(state) ?? 0;
    let source: 'policy' | 'search' = 'policy';

    if (this.search) {
      searchResult = this.search.search(state);
      const visit = new Array<number>(this.actionCount).fill(0);
      for (let i = 0; i < searchResult.actions.length; i++) {
        const action = searchResult.actions[i];
        if (action >= 0 && action < this.actionCount) {
          visit[action] += searchResult.visitDistribution[i] ?? 0;
        }
      }
      const total = visit.reduce((sum, probability) => sum + probability, 0);
      if (total > 0) {
        probabilities = policyProbabilities.map(
          (probability, index) =>
            (1 - this.searchWeight) * probability + this.searchWeight * (visit[index] / total),
        );
        source = 'search';
      }
      if (Number.isFinite(searchResult.rootValue)) value = searchResult.rootValue;
    }

    probabilities = sanitizeProbabilities(probabilities, this.actionCount);
    const action = this.sampleAction(probabilities);
    return {
      action,
      probabilities,
      confidence: probabilities[action] ?? 0,
      entropy: entropyOf(probabilities),
      value,
      source,
      search: searchResult,
    };
  }

  /** Chọn hành động, không trả toàn bộ thông tin suy luận. */
  public act(state: TState): number {
    return this.think(state).action;
  }

  /** Lấy mẫu theo nhiệt độ; 0 = argmax. */
  private sampleAction(probabilities: readonly number[]): number {
    if (this.temperature <= 0) return argmaxIndex(probabilities);
    const exponent = 1 / this.temperature;
    const weights = probabilities.map((probability) =>
      probability > 0 ? probability ** exponent : 0,
    );
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (total <= 0) return this.random.int(0, probabilities.length - 1);
    let roll = this.random.next() * total;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return i;
    }
    return weights.length - 1;
  }
}

/** Một chuỗi suy luận gồm các vector trạng thái từng bước. */
export interface ReasoningTrace {
  id?: string;
  steps: readonly NumericVector[];
}

/** Kết quả xếp hạng một chuỗi suy luận. */
export interface ReasoningSelection {
  index: number;
  score: number;
  scores: number[];
  trace: ReasoningTrace | null;
}

/**
 * Bộ chọn chuỗi suy luận bằng process reward model.
 *
 * PRM chấm từng bước thay vì chỉ điểm cuối, nhờ đó có thể dừng sớm hoặc chọn
 * trajectory ổn định nhất trong beam search.
 */
export class ReasoningController {
  public readonly prm: ProcessRewardModelTrainer;
  public readonly aggregation: 'mean' | 'min' | 'last';

  constructor(
    prm: ProcessRewardModelTrainer,
    aggregation: 'mean' | 'min' | 'last' = 'mean',
  ) {
    this.prm = prm;
    this.aggregation = aggregation;
  }

  /** Điểm một chuỗi. */
  public score(trace: ReasoningTrace): number {
    return this.prm.scoreTrajectory(trace.steps, this.aggregation);
  }

  /** Xếp hạng giảm dần; trả cả mảng điểm theo thứ tự gốc. */
  public rank(traces: readonly ReasoningTrace[]): ReasoningSelection[] {
    const scores = traces.map((trace) => this.score(trace));
    return traces
      .map((trace, index) => ({ index, score: scores[index], scores, trace }))
      .sort((a, b) => b.score - a.score);
  }

  /** Chọn chuỗi tốt nhất; `null` nếu không có ứng viên. */
  public select(traces: readonly ReasoningTrace[]): ReasoningSelection | null {
    return this.rank(traces)[0] ?? null;
  }

  /** Có nên tiếp tục suy luận với ngưỡng điểm cho trước không. */
  public shouldContinue(trace: ReasoningTrace, threshold = 0.5): boolean {
    return this.score(trace) >= threshold;
  }
}

// ---------------------------------------------------------------------------
// Policy adapter cho trainer có sẵn
// ---------------------------------------------------------------------------

/** Bọc PPO thành policy rời rạc cho ThinkingEngine. */
export function ppoPolicy(trainer: PPOTrainer): DiscretePolicy {
  return {
    actionCount: trainer.actions.length,
    probabilities: (state) => trainer.probabilities(state),
    value: (state) => trainer.value(state),
  };
}

/** Bọc DQN thành policy softmax trên Q-value. */
export function dqnPolicy(trainer: DuelingDQNTrainer, temperature = 1): DiscretePolicy {
  if (temperature < 0) throw new RangeError('Nhiệt độ DQN phải không âm');
  return {
    actionCount: trainer.actions.length,
    probabilities: (state) => {
      const qValues = trainer.qValues(state);
      if (temperature === 0) return oneHot(argmaxIndex(qValues), qValues.length);
      return softmaxVector(qValues.map((value) => value / temperature));
    },
    value: (state) => Math.max(...trainer.qValues(state)),
  };
}

/** Bọc behavior cloning rời rạc thành policy. */
export function behaviorCloningPolicy(trainer: BehaviorCloningTrainer): DiscretePolicy {
  if (trainer.mode !== 'discrete') {
    throw new Error('Behavior cloning liên tục không dùng được với ThinkingEngine rời rạc');
  }
  return {
    actionCount: trainer.actionCount,
    probabilities: (state) => trainer.predict(state),
  };
}

/** Bọc AlphaZero policy/value. */
export function alphaZeroPolicy(trainer: AlphaZeroTrainer): DiscretePolicy {
  return {
    actionCount: trainer.policy.outputSize,
    probabilities: (state) => trainer.probabilities(state),
    value: (state) => trainer.stateValue(state),
  };
}

// ---------------------------------------------------------------------------
// Built-in adapters
// ---------------------------------------------------------------------------

/** Adapter MLP cơ bản. */
export const neuralNetworkAdapter: TrainerAdapter<
  NeuralNetworkConfig,
  NeuralNetwork,
  NeuralNetworkSnapshot
> = {
  algorithm: 'neural-network',
  description: 'MLP truyền thẳng với optimizer, dropout và lịch learning rate',
  validateConfig: isNeuralNetworkConfig,
  validateModel: (value): value is NeuralNetwork => value instanceof NeuralNetwork,
  validateSnapshot: isNeuralNetworkSnapshot,
  create: (config) => new NeuralNetwork(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => NeuralNetwork.fromSnapshot(snapshot),
};

/** Adapter PPO rời rạc. */
export const ppoAdapter: TrainerAdapter<PPOConfig, PPOTrainer, PPOSnapshot> = {
  algorithm: 'ppo',
  description: 'Proximal Policy Optimization rời rạc với GAE và clipped objective',
  validateConfig: isPPOConfig,
  validateModel: (value): value is PPOTrainer => value instanceof PPOTrainer,
  validateSnapshot: isPPOSnapshot,
  create: (config) => new PPOTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => PPOTrainer.fromSnapshot(snapshot),
};

/** Adapter Dueling Double DQN. */
export const duelingDQNAdapter: TrainerAdapter<
  DuelingDQNConfig,
  DuelingDQNTrainer,
  DuelingDQNSnapshot
> = {
  algorithm: 'dueling-dqn',
  description: 'Dueling Double DQN với prioritized replay và target network',
  validateConfig: isDuelingDQNConfig,
  validateModel: (value): value is DuelingDQNTrainer => value instanceof DuelingDQNTrainer,
  validateSnapshot: isDuelingDQNSnapshot,
  create: (config) => new DuelingDQNTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => DuelingDQNTrainer.fromSnapshot(snapshot),
};

/** Adapter behavior cloning. */
export const behaviorCloningAdapter: TrainerAdapter<
  BehaviorCloningConfig,
  BehaviorCloningTrainer,
  BehaviorCloningSnapshot
> = {
  algorithm: 'behavior-cloning',
  description: 'Imitation learning rời rạc/liên tục từ chuyên gia',
  validateConfig: isBehaviorCloningConfig,
  validateModel: (value): value is BehaviorCloningTrainer =>
    value instanceof BehaviorCloningTrainer,
  validateSnapshot: isBehaviorCloningSnapshot,
  create: (config) => new BehaviorCloningTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => BehaviorCloningTrainer.fromSnapshot(snapshot),
};

/** Adapter AlphaZero. */
export const alphaZeroAdapter: TrainerAdapter<
  AlphaZeroConfig,
  AlphaZeroTrainer,
  AlphaZeroSnapshot
> = {
  algorithm: 'alpha-zero',
  description: 'Policy/value học từ phân phối thăm MCTS và kết quả tự chơi',
  validateConfig: isAlphaZeroConfig,
  validateModel: (value): value is AlphaZeroTrainer => value instanceof AlphaZeroTrainer,
  validateSnapshot: isAlphaZeroSnapshot,
  create: (config) => new AlphaZeroTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => AlphaZeroTrainer.fromSnapshot(snapshot),
};

/** Adapter REINFORCE (vanilla policy gradient). */
export const reinforceAdapter: TrainerAdapter<
  PolicyGradientConfig & { useBaseline?: boolean },
  REINFORCETrainer,
  REINFORCESnapshot
> = {
  algorithm: 'reinforce',
  description: 'Vanilla policy gradient với baseline trung bình trượt hoặc mạng value',
  validateConfig: isReinforceConfig,
  validateModel: (value): value is REINFORCETrainer => value instanceof REINFORCETrainer,
  validateSnapshot: isReinforceSnapshot,
  create: (config) => new REINFORCETrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => REINFORCETrainer.fromSnapshot(snapshot),
};

/** Adapter TRPO (trust region với conjugate gradient). */
export const trpoAdapter: TrainerAdapter<TRPOConfig, TRPOTrainer, TRPOSnapshot> = {
  algorithm: 'trpo',
  description: 'Trust Region Policy Optimization với Fisher–CG và ràng buộc KL',
  validateConfig: isTRPOConfig,
  validateModel: (value): value is TRPOTrainer => value instanceof TRPOTrainer,
  validateSnapshot: isTRPOSnapshot,
  create: (config) => new TRPOTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => TRPOTrainer.fromSnapshot(snapshot),
};

/** Adapter QMIX (multi-agent value factorization). */
export const qmixAdapter: TrainerAdapter<QMIXConfig, QMIXTrainer, QMIXSnapshot> = {
  algorithm: 'qmix',
  description: 'QMIX: phân rã Q_tot đơn điệu cho đội agent hợp tác',
  validateConfig: isQMIXConfig,
  validateModel: (value): value is QMIXTrainer => value instanceof QMIXTrainer,
  validateSnapshot: isQMIXSnapshot,
  create: (config) => new QMIXTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => QMIXTrainer.fromSnapshot(snapshot),
};

/** Adapter MAPPO (multi-agent PPO với critic tập trung). */
export const mappoAdapter: TrainerAdapter<MAPPOConfig, MAPPOTrainer, MAPPOSnapshot> = {
  algorithm: 'mappo',
  description: 'MAPPO: actor phi tập trung, critic tập trung, GAE phần thưởng đội',
  validateConfig: isMAPPOConfig,
  validateModel: (value): value is MAPPOTrainer => value instanceof MAPPOTrainer,
  validateSnapshot: isMAPPOSnapshot,
  create: (config) => new MAPPOTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => MAPPOTrainer.fromSnapshot(snapshot),
};

/** Adapter MADDPG (multi-agent DDPG liên tục). */
export const maddpgAdapter: TrainerAdapter<MADDPGConfig, MADDPGTrainer, MADDPGSnapshot> = {
  algorithm: 'maddpg',
  description: 'MADDPG: actor-critic liên tục đa agent theo mô hình CTDE',
  validateConfig: isMADDPGConfig,
  validateModel: (value): value is MADDPGTrainer => value instanceof MADDPGTrainer,
  validateSnapshot: isMADDPGSnapshot,
  create: (config) => new MADDPGTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => MADDPGTrainer.fromSnapshot(snapshot),
};

/** Adapter IPO (Identity Preference Optimization). */
export const ipoAdapter: TrainerAdapter<IPOConfig, IPOTrainer, IPOSnapshot> = {
  algorithm: 'ipo',
  description: 'IPO: loss bình phương thay log-sigmoid, chặn overfit cặp ưu tiên',
  validateConfig: isIPOConfig,
  validateModel: (value): value is IPOTrainer => value instanceof IPOTrainer,
  validateSnapshot: isIPOSnapshot,
  create: (config) => new IPOTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => IPOTrainer.fromSnapshot(snapshot),
};

/** Adapter KTO (Kahneman-Tversky Optimization). */
export const ktoAdapter: TrainerAdapter<KTOConfig, KTOTrainer, KTOSnapshot> = {
  algorithm: 'kto',
  description: 'KTO: học từ mẫu đơn có nhãn desirable, mô phỏng lý thuyết triển vọng',
  validateConfig: isKTOConfig,
  validateModel: (value): value is KTOTrainer => value instanceof KTOTrainer,
  validateSnapshot: isKTOSnapshot,
  create: (config) => new KTOTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => KTOTrainer.fromSnapshot(snapshot),
};

/** Adapter NEAT (neuroevolution topology tăng dần). */
export const neatAdapter: TrainerAdapter<NeatConfig, NEATTrainer, NeatSnapshot> = {
  algorithm: 'neat',
  description: 'NEAT: tiến hóa topology mạng nơ-ron với speciation và innovation',
  validateConfig: isNeatConfig,
  validateModel: (value): value is NEATTrainer => value instanceof NEATTrainer,
  validateSnapshot: isNeatSnapshot,
  create: (config) => new NEATTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => NEATTrainer.fromSnapshot(snapshot),
};

/** Adapter Rainbow DQN (Double + Dueling + Prioritized + n-step + NoisyNet). */
export const rainbowAdapter: TrainerAdapter<RainbowDQNConfig, RainbowDQNTrainer, RainbowDQNSnapshot> = {
  algorithm: 'rainbow-dqn',
  description: 'Rainbow DQN: double, dueling, prioritized, n-step returns, NoisyNet',
  validateConfig: isRainbowConfig,
  validateModel: (value): value is RainbowDQNTrainer => value instanceof RainbowDQNTrainer,
  validateSnapshot: isRainbowSnapshot,
  create: (config) => new RainbowDQNTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => RainbowDQNTrainer.fromSnapshot(snapshot),
};

/** Adapter HyperNEAT (CPPN + substrate). */
export const hyperneatAdapter: TrainerAdapter<HyperNEATConfig, HyperNEATTrainer, HyperNEATSnapshot> = {
  algorithm: 'hyperneat',
  description: 'HyperNEAT: CPPN sinh trọng số substrate theo tọa độ hình học',
  validateConfig: isHyperNEATConfig,
  validateModel: (value): value is HyperNEATTrainer => value instanceof HyperNEATTrainer,
  validateSnapshot: isHyperNEATSnapshot,
  create: (config) => new HyperNEATTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => HyperNEATTrainer.fromSnapshot(snapshot),
};

/** Adapter MuZero (model học được + MCTS latent). */
export const muzeroAdapter: TrainerAdapter<MuZeroConfig, MuZeroTrainer, MuZeroSnapshot> = {
  algorithm: 'muzero',
  description: 'MuZero-lite: representation/dynamics/prediction + MCTS trong không gian ẩn',
  validateConfig: isMuZeroConfig,
  validateModel: (value): value is MuZeroTrainer => value instanceof MuZeroTrainer,
  validateSnapshot: isMuZeroSnapshot,
  create: (config) => new MuZeroTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => MuZeroTrainer.fromSnapshot(snapshot),
};

/** Adapter WGAN-GP. */
export const wganAdapter: TrainerAdapter<WGANConfig, WGANTrainer, WGANSnapshot> = {
  algorithm: 'wgan-gp',
  description: 'WGAN-GP: critic Lipschitz bằng gradient penalty trên điểm nội suy',
  validateConfig: isWGANConfig,
  validateModel: (value): value is WGANTrainer => value instanceof WGANTrainer,
  validateSnapshot: isWGANSnapshot,
  create: (config) => new WGANTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => WGANTrainer.fromSnapshot(snapshot),
};

/** Adapter Dreamer-lite (world model latent + actor-critic trong giấc mơ). */
export const dreamerAdapter: TrainerAdapter<DreamerConfig, DreamerTrainer, DreamerSnapshot> = {
  algorithm: 'dreamer',
  description: 'Dreamer-lite: RSSM rút gọn + actor-critic học trên imagined rollouts',
  validateConfig: isDreamerConfig,
  validateModel: (value): value is DreamerTrainer => value instanceof DreamerTrainer,
  validateSnapshot: isDreamerSnapshot,
  create: (config) => new DreamerTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => DreamerTrainer.fromSnapshot(snapshot),
};

/** Adapter StyleGAN-lite (mapping network + style điều biến generator). */
export const styleganAdapter: TrainerAdapter<StyleGANConfig, StyleGANLiteTrainer, StyleGANSnapshot> = {
  algorithm: 'stylegan',
  description: 'StyleGAN-lite: mapping z→w, synthesis điều biến style, train WGAN-GP',
  validateConfig: isStyleGANConfig,
  validateModel: (value): value is StyleGANLiteTrainer => value instanceof StyleGANLiteTrainer,
  validateSnapshot: isStyleGANSnapshot,
  create: (config) => new StyleGANLiteTrainer(config),
  snapshot: (model) => model.snapshot(),
  restore: (snapshot) => StyleGANLiteTrainer.fromSnapshot(snapshot),
};

/** Đăng ký toàn bộ adapter built-in. */
export function registerDefaultAdapters(registry: TrainerRegistry): void {
  registry.ensure(neuralNetworkAdapter);
  registry.ensure(ppoAdapter);
  registry.ensure(duelingDQNAdapter);
  registry.ensure(behaviorCloningAdapter);
  registry.ensure(alphaZeroAdapter);
  registry.ensure(reinforceAdapter);
  registry.ensure(trpoAdapter);
  registry.ensure(qmixAdapter);
  registry.ensure(mappoAdapter);
  registry.ensure(maddpgAdapter);
  registry.ensure(ipoAdapter);
  registry.ensure(ktoAdapter);
  registry.ensure(neatAdapter);
  registry.ensure(rainbowAdapter);
  registry.ensure(hyperneatAdapter);
  registry.ensure(muzeroAdapter);
  registry.ensure(wganAdapter);
  registry.ensure(dreamerAdapter);
  registry.ensure(styleganAdapter);
}

/** Runtime với các thuật toán built-in đã đăng ký. */
export function createDefaultLearningRuntime(
  config: Omit<LearningRuntimeConfig, 'registerDefaults'> = {},
): LearningRuntime {
  return new LearningRuntime({ ...config, registerDefaults: true });
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
}

function isActivationName(value: unknown): value is ActivationName {
  return (
    value === 'linear' ||
    value === 'relu' ||
    value === 'leakyRelu' ||
    value === 'tanh' ||
    value === 'sigmoid' ||
    value === 'softmax'
  );
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isFiniteNumber);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function hasOptionalNumber(record: Record<string, unknown>, keys: readonly string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && !isFiniteNumber(value)) return false;
  }
  return true;
}

function hasOptionalPositiveInteger(
  record: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && !isPositiveInteger(value)) return false;
  }
  return true;
}

function isOptimizerConfig(value: unknown): value is OptimizerConfig {
  if (!isRecord(value)) return false;
  return (
    (value.kind === 'sgd' || value.kind === 'adam' || value.kind === 'adamw') &&
    isFiniteNumber(value.learningRate) &&
    value.learningRate > 0 &&
    isFiniteNumber(value.momentum) &&
    isFiniteNumber(value.beta1) &&
    isFiniteNumber(value.beta2) &&
    isFiniteNumber(value.epsilon) &&
    value.epsilon > 0 &&
    isFiniteNumber(value.weightDecay) &&
    value.weightDecay >= 0 &&
    isNumber(value.maxGradNorm) &&
    value.maxGradNorm > 0
  );
}

function isPartialOptimizerConfig(value: unknown): value is Partial<OptimizerConfig> {
  if (!isRecord(value)) return false;
  if (
    value.kind !== undefined &&
    value.kind !== 'sgd' &&
    value.kind !== 'adam' &&
    value.kind !== 'adamw'
  ) {
    return false;
  }
  if (
    !hasOptionalNumber(value, [
      'learningRate',
      'momentum',
      'beta1',
      'beta2',
      'epsilon',
      'weightDecay',
    ])
  ) {
    return false;
  }
  const learningRate = value.learningRate;
  const epsilon = value.epsilon;
  const weightDecay = value.weightDecay;
  const maxGradNorm = value.maxGradNorm;
  if (learningRate !== undefined && (!isFiniteNumber(learningRate) || learningRate <= 0)) {
    return false;
  }
  if (epsilon !== undefined && (!isFiniteNumber(epsilon) || epsilon <= 0)) return false;
  if (weightDecay !== undefined && (!isFiniteNumber(weightDecay) || weightDecay < 0)) {
    return false;
  }
  if (maxGradNorm !== undefined && (!isNumber(maxGradNorm) || maxGradNorm <= 0)) return false;
  return true;
}

function isLRScheduleConfig(value: unknown): value is LRScheduleConfig {
  if (!isRecord(value)) return false;
  if (
    value.kind !== 'constant' &&
    value.kind !== 'step' &&
    value.kind !== 'exponential' &&
    value.kind !== 'cosine'
  ) {
    return false;
  }
  if (
    !hasOptionalPositiveInteger(value, ['decaySteps']) ||
    !hasOptionalNumber(value, ['decayRate', 'minLr'])
  ) {
    return false;
  }
  const decayRate = value.decayRate;
  const minLr = value.minLr;
  if (decayRate !== undefined && (!isFiniteNumber(decayRate) || decayRate < 0)) return false;
  if (minLr !== undefined && (!isFiniteNumber(minLr) || minLr < 0)) return false;
  return true;
}

function isNeuralNetworkConfig(value: unknown): value is NeuralNetworkConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize) || !isPositiveInteger(value.outputSize)) {
    return false;
  }
  if (value.hiddenSizes !== undefined) {
    if (!Array.isArray(value.hiddenSizes) || !value.hiddenSizes.every(isPositiveInteger)) {
      return false;
    }
  }
  if (
    value.hiddenActivation !== undefined &&
    !isActivationName(value.hiddenActivation)
  ) {
    return false;
  }
  if (
    value.outputActivation !== undefined &&
    !isActivationName(value.outputActivation)
  ) {
    return false;
  }
  if (value.optimizer !== undefined && !isPartialOptimizerConfig(value.optimizer)) {
    return false;
  }
  if (value.lrSchedule !== undefined && !isLRScheduleConfig(value.lrSchedule)) {
    return false;
  }
  if (
    value.dropout !== undefined &&
    (!isFiniteNumber(value.dropout) || value.dropout < 0 || value.dropout >= 1)
  ) {
    return false;
  }
  if (value.seed !== undefined && !isFiniteNumber(value.seed)) return false;
  return true;
}

function isNeuralNetworkSnapshot(value: unknown): value is NeuralNetworkSnapshot {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize) || !isPositiveInteger(value.outputSize)) {
    return false;
  }
  if (!Array.isArray(value.layers) || value.layers.length === 0) return false;
  for (const layer of value.layers) {
    if (!isRecord(layer)) return false;
    if (!isPositiveInteger(layer.inputSize) || !isPositiveInteger(layer.outputSize)) {
      return false;
    }
    if (!isActivationName(layer.activation)) return false;
    if (!isFiniteNumber(layer.dropout) || layer.dropout < 0 || layer.dropout >= 1) {
      return false;
    }
    if (!Array.isArray(layer.weights) || layer.weights.length !== layer.outputSize) {
      return false;
    }
    for (const row of layer.weights) {
      if (!isNumberArray(row) || row.length !== layer.inputSize) return false;
    }
    if (!isNumberArray(layer.biases) || layer.biases.length !== layer.outputSize) {
      return false;
    }
  }
  return isOptimizerConfig(value.optimizer);
}

function isPPOConfig(value: unknown): value is PPOConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize)) return false;
  if (!isStringArray(value.actions) || value.actions.length === 0) return false;
  if (value.hiddenSizes !== undefined) {
    if (!Array.isArray(value.hiddenSizes) || !value.hiddenSizes.every(isPositiveInteger)) {
      return false;
    }
  }
  if (
    !hasOptionalNumber(value, [
      'learningRate',
      'criticLearningRate',
      'gamma',
      'gaeLambda',
      'clipRatio',
      'entropyCoef',
      'valueCoef',
      'gradientClip',
      'seed',
    ])
  ) {
    return false;
  }
  if (
    !hasOptionalPositiveInteger(value, ['epochs', 'miniBatchSize'])
  ) {
    return false;
  }
  return true;
}

function isPPOSnapshot(value: unknown): value is PPOSnapshot {
  if (!isRecord(value)) return false;
  return (
    isPPOConfig(value.config) &&
    isNeuralNetworkSnapshot(value.policy) &&
    isNeuralNetworkSnapshot(value.critic)
  );
}

function isDuelingDQNConfig(value: unknown): value is DuelingDQNConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize)) return false;
  if (!isStringArray(value.actions) || value.actions.length === 0) return false;
  if (value.hiddenSizes !== undefined) {
    if (!Array.isArray(value.hiddenSizes) || !value.hiddenSizes.every(isPositiveInteger)) {
      return false;
    }
  }
  if (
    !hasOptionalNumber(value, [
      'learningRate',
      'gamma',
      'epsilon',
      'epsilonMin',
      'epsilonDecay',
      'tau',
      'gradientClip',
      'seed',
    ])
  ) {
    return false;
  }
  if (
    !hasOptionalPositiveInteger(value, [
      'batchSize',
      'capacity',
      'targetSyncInterval',
    ])
  ) {
    return false;
  }
  for (const key of ['doubleQ', 'softTargetUpdate', 'prioritized']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') return false;
  }
  return true;
}

function isReplaySnapshot(value: unknown): value is ReplaySnapshot<number[], number> {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.capacity)) return false;
  if (!isFiniteNumber(value.seedState)) return false;
  if (!Array.isArray(value.items)) return false;
  for (const item of value.items) {
    if (!isRecord(item)) return false;
    if (!isNumberArray(item.state) || !isNumberArray(item.nextState)) return false;
    if (!isFiniteNumber(item.action)) return false;
    if (!isFiniteNumber(item.reward)) return false;
    if (typeof item.done !== 'boolean') return false;
    if (item.priority !== undefined && !isFiniteNumber(item.priority)) return false;
  }
  return true;
}

function isDuelingDQNSnapshot(value: unknown): value is DuelingDQNSnapshot {
  if (!isRecord(value)) return false;
  return (
    isDuelingDQNConfig(value.config) &&
    isNeuralNetworkSnapshot(value.trunk) &&
    isNeuralNetworkSnapshot(value.value) &&
    isNeuralNetworkSnapshot(value.advantage) &&
    isNeuralNetworkSnapshot(value.targetTrunk) &&
    isNeuralNetworkSnapshot(value.targetValue) &&
    isNeuralNetworkSnapshot(value.targetAdvantage) &&
    isFiniteNumber(value.epsilon) &&
    isNonNegativeInteger(value.steps) &&
    isReplaySnapshot(value.replay)
  );
}

function isBehaviorCloningConfig(value: unknown): value is BehaviorCloningConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.stateSize)) return false;
  if (value.mode !== 'discrete' && value.mode !== 'continuous') return false;
  if (value.mode === 'discrete' && !isPositiveInteger(value.actionCount)) return false;
  if (value.mode === 'continuous' && !isPositiveInteger(value.actionSize)) return false;
  if (value.hiddenSizes !== undefined) {
    if (!Array.isArray(value.hiddenSizes) || !value.hiddenSizes.every(isPositiveInteger)) {
      return false;
    }
  }
  return hasOptionalNumber(value, ['learningRate', 'seed']);
}

function isBehaviorCloningSnapshot(value: unknown): value is BehaviorCloningSnapshot {
  if (!isRecord(value)) return false;
  return isBehaviorCloningConfig(value.config) && isNeuralNetworkSnapshot(value.policy);
}

function isAlphaZeroConfig(value: unknown): value is AlphaZeroConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize) || !isPositiveInteger(value.actionCount)) {
    return false;
  }
  if (value.hiddenSizes !== undefined) {
    if (!Array.isArray(value.hiddenSizes) || !value.hiddenSizes.every(isPositiveInteger)) {
      return false;
    }
  }
  return hasOptionalNumber(value, ['policyLearningRate', 'valueLearningRate', 'seed']);
}

function isAlphaZeroSnapshot(value: unknown): value is AlphaZeroSnapshot {
  if (!isRecord(value)) return false;
  return (
    isAlphaZeroConfig(value.config) &&
    isNeuralNetworkSnapshot(value.policy) &&
    isNeuralNetworkSnapshot(value.value)
  );
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

/** Chuẩn hóa xác suất, loại NaN/âm và bù vector 0 bằng phân phối đều. */
function sanitizeProbabilities(values: readonly number[], actionCount: number): number[] {
  if (values.length !== actionCount) {
    throw new RangeError(`Policy cần ${actionCount} xác suất, nhận ${values.length}`);
  }
  let total = 0;
  const cleaned = values.map((value) => {
    if (!Number.isFinite(value) || value <= 0) return 0;
    total += value;
    return value;
  });
  if (total <= 0) return new Array<number>(actionCount).fill(1 / actionCount);
  return cleaned.map((value) => value / total);
}

/** Entropy tự nhiên của phân phối. */
function entropyOf(probabilities: readonly number[]): number {
  let entropy = 0;
  for (const probability of probabilities) {
    if (probability > 0) entropy -= probability * Math.log(probability);
  }
  return entropy;
}

/** Chuẩn hóa thông điệp lỗi từ `unknown`. */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Trả `null` cho `Infinity`/`NaN` để telemetry JSON hợp lệ. */
function finiteOrNull(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

/** Bản sao báo cáo để tránh người dùng sửa telemetry trong phiên. */
function cloneReport(report: LearningReport): LearningReport {
  return {
    ...report,
    lossHistory: [...report.lossHistory],
    metrics: { ...report.metrics },
  };
}

/** Bản sao đánh giá. */
function cloneEvaluation(result: EvaluationResult): EvaluationResult {
  return {
    ...result,
    metrics: { ...result.metrics },
  };
}

/** Bản sao điểm lịch sử. */
function clonePoint(point: TrainingPoint): TrainingPoint {
  return {
    ...point,
    metrics: point.metrics ? { ...point.metrics } : undefined,
  };
}

// ---------------------------------------------------------------------------
// Validation helpers cho adapter bổ sung (REINFORCE/TRPO/MARL/IPO/KTO/NEAT)
// ---------------------------------------------------------------------------

/** Kiểm tra snapshot mạng nơ-ron ở dạng cấu trúc tầng chuẩn. */
function isNetworkSnapshotLike(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.layers)) return false;
  return value.layers.every((layer) => {
    if (!isRecord(layer) || !Array.isArray(layer.weights) || !Array.isArray(layer.biases)) {
      return false;
    }
    return (
      layer.weights.every((row) => Array.isArray(row) && row.every(isFiniteNumber)) &&
      layer.biases.every(isFiniteNumber)
    );
  });
}

/** Kiểm tra danh sách snapshot mạng. */
function isNetworkSnapshotList(value: unknown): boolean {
  return Array.isArray(value) && value.every(isNetworkSnapshotLike);
}

/** Kiểm tra mọi phần tử là số nguyên dương (mảng tầng ẩn...). */
function hasPositiveIntegers(value: unknown): value is number[] {
  return Array.isArray(value) && value.length > 0 && value.every(isPositiveInteger);
}

/** Cấu hình policy gradient rời rạc dùng chung REINFORCE/TRPO. */
function isPolicyGradientConfig(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize)) return false;
  if (!isStringArray(value.actions) || value.actions.length === 0) return false;
  if (value.hiddenSizes !== undefined && !hasPositiveIntegers(value.hiddenSizes)) return false;
  return hasOptionalNumber(value, ['learningRate', 'criticLearningRate', 'gamma', 'entropyCoef', 'gradientClip']);
}

function isReinforceConfig(value: unknown): value is PolicyGradientConfig & { useBaseline?: boolean } {
  if (!isPolicyGradientConfig(value)) return false;
  return value.useBaseline === undefined || typeof value.useBaseline === 'boolean';
}

function isReinforceSnapshot(value: unknown): value is REINFORCESnapshot {
  return (
    isRecord(value) &&
    isPolicyGradientConfig(value.config) &&
    isNetworkSnapshotLike(value.policy) &&
    (value.baseline === null || isNetworkSnapshotLike(value.baseline))
  );
}

function isTRPOConfig(value: unknown): value is TRPOConfig {
  if (!isPolicyGradientConfig(value)) return false;
  return hasOptionalNumber(value, ['damping', 'maxKL', 'gaeLambda', 'valueCoef', 'backtrackCoef']) &&
    hasOptionalPositiveInteger(value, ['cgIterations', 'maxBacktracks']);
}

function isTRPOSnapshot(value: unknown): value is TRPOSnapshot {
  return (
    isRecord(value) &&
    isTRPOConfig(value.config) &&
    isNetworkSnapshotLike(value.policy) &&
    isNetworkSnapshotLike(value.critic)
  );
}

/** Cấu hình MARL rời rạc dùng chung QMIX/MAPPO. */
function isMARLDiscreteConfig(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return (
    isPositiveInteger(value.agentCount) &&
    isPositiveInteger(value.observationSize) &&
    isPositiveInteger(value.stateSize) &&
    isPositiveInteger(value.actionCount)
  );
}

function isQMIXConfig(value: unknown): value is QMIXConfig {
  return isMARLDiscreteConfig(value) &&
    hasOptionalNumber(value, ['learningRate', 'gamma', 'epsilon', 'epsilonMin', 'epsilonDecay', 'tau', 'gradientClip']) &&
    hasOptionalPositiveInteger(value, ['batchSize', 'capacity', 'targetSyncInterval']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isQMIXSnapshot(value: unknown): value is QMIXSnapshot {
  return (
    isRecord(value) &&
    isQMIXConfig(value.config) &&
    isNetworkSnapshotList(value.agents) &&
    isNetworkSnapshotList(value.mixingWeights) &&
    isNetworkSnapshotList(value.targetAgents) &&
    isNetworkSnapshotList(value.targetMixingWeights) &&
    isFiniteNumber(value.epsilon) &&
    isFiniteNumber(value.steps) &&
    Array.isArray(value.transitions)
  );
}

function isMAPPOConfig(value: unknown): value is MAPPOConfig {
  return isMARLDiscreteConfig(value) &&
    hasOptionalNumber(value, ['learningRate', 'criticLearningRate', 'gamma', 'gaeLambda', 'clipRatio', 'entropyCoef', 'valueCoef', 'gradientClip']) &&
    hasOptionalPositiveInteger(value, ['epochs', 'miniBatchSize']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isMAPPOSnapshot(value: unknown): value is MAPPOSnapshot {
  return (
    isRecord(value) &&
    isMAPPOConfig(value.config) &&
    isNetworkSnapshotList(value.actors) &&
    isNetworkSnapshotLike(value.critic)
  );
}

function isMADDPGConfig(value: unknown): value is MADDPGConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.agentCount)) return false;
  if (!isPositiveInteger(value.observationSize)) return false;
  if (!isPositiveInteger(value.stateSize)) return false;
  if (!Array.isArray(value.actionSizes) || value.actionSizes.length === 0) return false;
  if (!value.actionSizes.every(isPositiveInteger)) return false;
  return hasOptionalNumber(value, ['actorLearningRate', 'criticLearningRate', 'gamma', 'tau', 'gradientClip']) &&
    hasOptionalPositiveInteger(value, ['batchSize', 'capacity']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isMADDPGSnapshot(value: unknown): value is MADDPGSnapshot {
  return (
    isRecord(value) &&
    isMADDPGConfig(value.config) &&
    isNetworkSnapshotList(value.actors) &&
    isNetworkSnapshotList(value.actorTargets) &&
    isNetworkSnapshotList(value.critics) &&
    isNetworkSnapshotList(value.criticTargets) &&
    Array.isArray(value.transitions)
  );
}

/** Cấu hình preference (IPO/KTO) dùng chung. */
function isPreferenceConfig(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize)) return false;
  if (!isStringArray(value.actions) || value.actions.length === 0) return false;
  if (value.hiddenSizes !== undefined && !hasPositiveIntegers(value.hiddenSizes)) return false;
  return hasOptionalNumber(value, ['learningRate', 'beta']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isIPOConfig(value: unknown): value is IPOConfig {
  return isPreferenceConfig(value);
}

function isIPOSnapshot(value: unknown): value is IPOSnapshot {
  return (
    isRecord(value) &&
    isPreferenceConfig(value.config) &&
    isNetworkSnapshotLike(value.policy) &&
    isNetworkSnapshotLike(value.reference)
  );
}

function isKTOConfig(value: unknown): value is KTOConfig {
  return isPreferenceConfig(value) &&
    hasOptionalNumber(value, ['desirableWeight', 'undesirableWeight', 'klMomentum']);
}

function isKTOSnapshot(value: unknown): value is KTOSnapshot {
  return (
    isRecord(value) &&
    isKTOConfig(value.config) &&
    isNetworkSnapshotLike(value.policy) &&
    isNetworkSnapshotLike(value.reference) &&
    isFiniteNumber(value.klEstimate)
  );
}

function isNeatConfig(value: unknown): value is NeatConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize) || !isPositiveInteger(value.outputSize)) return false;
  return hasOptionalNumber(value, [
    'survivalRate',
    'crossoverRate',
    'weightMutationRate',
    'weightMutationPower',
    'weightResetRate',
    'addConnectionRate',
    'addNodeRate',
    'compatibilityThreshold',
    'excessCoef',
    'disjointCoef',
    'weightCoef',
  ]) && hasOptionalPositiveInteger(value, [
    'populationSize',
    'elitismPerSpecies',
    'maxStagnation',
  ]) && (value.seed === undefined || isFiniteNumber(value.seed));
}

function isNeatSnapshot(value: unknown): value is NeatSnapshot {
  if (!isRecord(value) || !isNeatConfig(value.config)) return false;
  if (!Array.isArray(value.population) || !Array.isArray(value.fitness)) return false;
  if (!Array.isArray(value.species) || !Array.isArray(value.innovations)) return false;
  return (
    isFiniteNumber(value.nextNodeId) &&
    isFiniteNumber(value.nextInnovation) &&
    isFiniteNumber(value.nextSpeciesId) &&
    isFiniteNumber(value.generation) &&
    isFiniteNumber(value.bestFitness)
  );
}

function isRainbowConfig(value: unknown): value is RainbowDQNConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.inputSize)) return false;
  if (!isStringArray(value.actions) || value.actions.length === 0) return false;
  if (value.hiddenSizes !== undefined && !hasPositiveIntegers(value.hiddenSizes)) return false;
  return hasOptionalNumber(value, ['learningRate', 'gamma', 'noisySigma', 'tau', 'gradientClip']) &&
    hasOptionalPositiveInteger(value, ['nStep', 'batchSize', 'capacity', 'targetSyncInterval']) &&
    (value.seed === undefined || isFiniteNumber(value.seed)) &&
    (value.softTargetUpdate === undefined || typeof value.softTargetUpdate === 'boolean');
}

function isRainbowSnapshot(value: unknown): value is RainbowDQNSnapshot {
  if (!isRecord(value) || !isRainbowConfig(value.config)) return false;
  const noisyLike = (snapshot: unknown): boolean =>
    isRecord(snapshot) &&
    Array.isArray(snapshot.layers) &&
    snapshot.layers.every((layer) =>
      isRecord(layer) &&
      Array.isArray(layer.muW) && layer.muW.every((row) => Array.isArray(row) && row.every(isFiniteNumber)) &&
      Array.isArray(layer.sigmaW) && layer.sigmaW.every((row) => Array.isArray(row) && row.every(isFiniteNumber)) &&
      Array.isArray(layer.muB) && layer.muB.every(isFiniteNumber) &&
      Array.isArray(layer.sigmaB) && layer.sigmaB.every(isFiniteNumber),
    );
  return (
    noisyLike(value.trunk) &&
    noisyLike(value.value) &&
    noisyLike(value.advantage) &&
    noisyLike(value.targetTrunk) &&
    noisyLike(value.targetValue) &&
    noisyLike(value.targetAdvantage) &&
    isFiniteNumber(value.steps) &&
    isRecord(value.replay)
  );
}

function isHyperNEATConfig(value: unknown): value is HyperNEATConfig {
  if (!isRecord(value)) return false;
  const substrate = value.substrate;
  if (!isRecord(substrate)) return false;
  if (!Array.isArray(substrate.layerSizes) || substrate.layerSizes.length < 2) return false;
  if (!substrate.layerSizes.every(isPositiveInteger)) return false;
  if (
    substrate.positions !== undefined &&
    (!Array.isArray(substrate.positions) ||
      substrate.positions.some((layer) =>
        !Array.isArray(layer) ||
        layer.some((point) => !isRecord(point) || !isFiniteNumber(point.x) || !isFiniteNumber(point.y)),
      ))
  ) {
    return false;
  }
  if (!isRecord(value.cppn)) return false;
  if (!isNeatConfig({ inputSize: 1, outputSize: 1, ...value.cppn })) return false;
  return hasOptionalNumber(substrate, ['connectionThreshold', 'weightScale']);
}

function isHyperNEATSnapshot(value: unknown): value is HyperNEATSnapshot {
  if (!isRecord(value)) return false;
  if (!isRecord(value.cppn)) return false;
  if (!isHyperNEATConfig({ substrate: value.substrate, cppn: value.cppn.config })) return false;
  return isNeatSnapshot(value.cppn);
}

function isMuZeroConfig(value: unknown): value is MuZeroConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.observationSize)) return false;
  if (!isPositiveInteger(value.actionCount)) return false;
  return hasOptionalNumber(value, [
    'hiddenSize',
    'gamma',
    'puctInit',
    'puctBase',
    'temperature',
    'learningRate',
    'policyCoef',
    'valueCoef',
    'rewardCoef',
    'gradientClip',
  ]) && hasOptionalPositiveInteger(value, ['unrollSteps', 'mctsSimulations']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isMuZeroSnapshot(value: unknown): value is MuZeroSnapshot {
  return (
    isRecord(value) &&
    isMuZeroConfig(value.config) &&
    isNetworkSnapshotLike(value.representation) &&
    isNetworkSnapshotLike(value.dynamics) &&
    isNetworkSnapshotLike(value.prediction)
  );
}

function isWGANConfig(value: unknown): value is WGANConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.noiseSize)) return false;
  if (!isPositiveInteger(value.sampleSize)) return false;
  return hasOptionalNumber(value, [
    'generatorLearningRate',
    'criticLearningRate',
    'gradientPenaltyCoef',
  ]) && hasOptionalPositiveInteger(value, ['batchSize', 'criticStepsPerGenerator']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isWGANSnapshot(value: unknown): value is WGANSnapshot {
  return (
    isRecord(value) &&
    isWGANConfig(value.config) &&
    isNetworkSnapshotLike(value.generator) &&
    isNetworkSnapshotLike(value.critic)
  );
}

function isDreamerConfig(value: unknown): value is DreamerConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.observationSize)) return false;
  if (!isPositiveInteger(value.actionCount)) return false;
  return hasOptionalNumber(value, [
    'stateSize',
    'embedSize',
    'gamma',
    'returnLambda',
    'learningRate',
    'reconstructionCoef',
    'rewardCoef',
    'continueCoef',
    'priorCoef',
    'gradientClip',
  ]) && hasOptionalPositiveInteger(value, ['horizon', 'imaginationBatch', 'capacity']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isDreamerSnapshot(value: unknown): value is DreamerSnapshot {
  return (
    isRecord(value) &&
    isDreamerConfig(value.config) &&
    isNetworkSnapshotLike(value.encoder) &&
    isNetworkSnapshotLike(value.sequence) &&
    isNetworkSnapshotLike(value.imagination) &&
    isNetworkSnapshotLike(value.decoder) &&
    isNetworkSnapshotLike(value.rewardHead) &&
    isNetworkSnapshotLike(value.continueHead) &&
    isNetworkSnapshotLike(value.actor) &&
    isNetworkSnapshotLike(value.critic)
  );
}

function isStyleGANConfig(value: unknown): value is StyleGANConfig {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.noiseSize)) return false;
  if (!isPositiveInteger(value.styleSize)) return false;
  if (!isPositiveInteger(value.sampleSize)) return false;
  return hasOptionalNumber(value, [
    'mappingLearningRate',
    'synthesisLearningRate',
    'criticLearningRate',
    'gradientPenaltyCoef',
  ]) && hasOptionalPositiveInteger(value, ['batchSize', 'criticStepsPerGenerator']) &&
    (value.seed === undefined || isFiniteNumber(value.seed));
}

function isStyleGANSnapshot(value: unknown): value is StyleGANSnapshot {
  return (
    isRecord(value) &&
    isStyleGANConfig(value.config) &&
    isNetworkSnapshotLike(value.mapping) &&
    isNetworkSnapshotLike(value.synthesis) &&
    isNetworkSnapshotLike(value.gate) &&
    isNetworkSnapshotLike(value.critic)
  );
}
