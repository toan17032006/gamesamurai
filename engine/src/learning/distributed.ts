/**
 * @file distributed.ts
 * @module @aetheria/engine/learning/distributed
 * @description Hạ tầng học phân tán và học liên tục cho learning runtime:
 *
 * - `ParameterServer`: đồng bộ tham số/gradient theo vòng (FedAvg) hoặc bất đồng
 *   bộ có xử lý staleness.
 * - `FederatedClient` / `FederatedLearningServer`: mô phỏng hoặc điều phối
 *   federated learning trên nhiều tập dữ liệu cục bộ.
 * - `SampleReplayBuffer`, `EWCRegularizer`, `ContinualLearningTrainer`: chống
 *   quên thảm họa bằng rehearsal và Elastic Weight Consolidation.
 *
 * Module chỉ thao tác trên vector tham số và `NeuralNetwork` công khai; không
 * phụ thuộc DOM/WebGL/Next.js nên có thể chạy trong Web Worker hoặc Node.
 */

import { NeuralNetwork, type NeuralNetworkSnapshot } from '../deeplearning/nn.js';
import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';
import {
  applyNetworkGradient,
  applyNetworkParameters,
  averageParameters,
  backpropagateNetwork,
  binaryCrossEntropyGradient,
  clipNetworkGradient,
  createNetworkGradient,
  flattenNetworkParameters,
  huberLossGradient,
  meanSquaredErrorGradient,
  networkParameterCount,
  softmaxCrossEntropyGradient,
} from './network.js';
import { SupervisedTrainer, type SupervisedLoss } from './supervised.js';
import type {
  EvaluationResult,
  LearningOptions,
  LearningReport,
  MetricMap,
  NumericVector,
  SupervisedSample,
} from './types.js';

/** Chế độ đồng bộ của parameter server. */
export type ParameterServerMode = 'synchronous' | 'asynchronous';

/** Cấu hình parameter server. */
export interface ParameterServerConfig {
  /** Tham số khởi tạo; độ dài quyết định số chiều của toàn bộ tham số. */
  initialParameters: readonly number[];
  /** `synchronous` gom đủ worker rồi mới cập nhật; `asynchronous` cập nhật ngay. */
  mode?: ParameterServerMode;
  /** Số worker mong đợi cho một vòng đồng bộ; mặc định 1. */
  workers?: number;
  /** Số phiên bản tối đa được chấp nhận; 0 = không giới hạn. */
  maxStaleness?: number;
  /** Learning rate phía server cho cập nhật gradient. */
  learningRate?: number;
  /** Hệ số trộn cho cập nhật tham số bất đồng bộ; mặc định 0.5. */
  mixingRate?: number;
  /** Momentum của server khi áp gradient; mặc định 0.9. */
  momentum?: number;
  /** L2 weight decay phía server. */
  weightDecay?: number;
  /** Mức phạt staleness cho gradient; 0 = không phạt. */
  stalenessDecay?: number;
}

/** Một lượt gửi toàn bộ tham số từ worker (FedAvg). */
export interface ParameterUpdate {
  workerId: string;
  parameters: NumericVector;
  /** Trọng số gộp, thường là số mẫu cục bộ; mặc định 1. */
  weight?: number;
  /** Số mẫu đã dùng để tạo cập nhật. */
  samples?: number;
  /** Phiên bản server mà worker dựa vào; mặc định phiên bản hiện tại. */
  baseVersion?: number;
  metrics?: MetricMap;
}

/** Một lượt gửi gradient từ worker (async SGD / gradient averaging). */
export interface GradientUpdate {
  workerId: string;
  gradient: NumericVector;
  weight?: number;
  samples?: number;
  baseVersion?: number;
  metrics?: MetricMap;
}

/** Lý do một cập nhật được chấp nhận hoặc bị từ chối. */
export type UpdateAcceptanceReason =
  | 'accepted'
  | 'buffered'
  | 'stale'
  | 'invalid';

/** Kết quả nhận một cập nhật. */
export interface UpdateAcceptance {
  accepted: boolean;
  reason: UpdateAcceptanceReason;
  /** Phiên bản server sau khi xử lý (hoặc phiên bản hiện tại nếu bị từ chối). */
  version: number;
  /** Độ lệch phiên bản so với lúc worker bắt đầu. */
  staleness: number;
  /** Số cập nhật đang chờ trong vòng đồng bộ. */
  pending: number;
}

/** Kết quả một lần gộp cập nhật. */
export interface ParameterFlushResult {
  version: number;
  updates: number;
  samples: number;
  strategy: 'parameters' | 'gradient';
  parameters: number[];
  /** Khoảng cách Euclid giữa tham số trước và sau khi gộp. */
  parameterChange: number;
  averageStaleness: number;
}

/** Ảnh chụp parameter server (không gồm cập nhật đang chờ). */
export interface ParameterServerSnapshot {
  config: ParameterServerConfig;
  parameters: number[];
  velocity: number[];
  version: number;
  updates: number;
  samples: number;
}

/** Thống kê nhanh của server. */
export interface ParameterServerStatistics {
  version: number;
  updates: number;
  samples: number;
  pending: number;
  parameterNorm: number;
}

/** Một cập nhật đang chờ trong buffer nội bộ. */
interface BufferedUpdate {
  workerId: string;
  values: number[];
  weight: number;
  samples: number;
  baseVersion: number;
}

/**
 * Parameter server dùng chung cho federated learning và async SGD.
 *
 * Chế độ đồng bộ gom cập nhật vào buffer; gọi `flush()` (hoặc `flush(true)`)
 * để lấy trung bình có trọng số. Chế độ bất đồng bộ áp dụng ngay và giảm learning
 * rate theo độ trễ phiên bản để tránh worker cũ kéo lệch mô hình.
 */
export class ParameterServer {
  public readonly mode: ParameterServerMode;
  public readonly workers: number;
  public readonly maxStaleness: number;
  public readonly momentum: number;
  public readonly weightDecay: number;
  public readonly stalenessDecay: number;

  private parameters: number[];
  private readonly initialParameters: number[];
  private velocity: number[];
  private currentVersion = 0;
  private totalUpdates = 0;
  private totalSamples = 0;
  private learningRate: number;
  private readonly mixingRate: number;
  private readonly parameterBuffer: BufferedUpdate[] = [];
  private readonly gradientBuffer: BufferedUpdate[] = [];
  private readonly workerMetrics = new Map<string, MetricMap>();

  constructor(config: ParameterServerConfig) {
    if (config.initialParameters.length === 0) {
      throw new RangeError('Parameter server cần ít nhất một tham số');
    }
    if (config.workers !== undefined && config.workers <= 0) {
      throw new RangeError('Số worker phải dương');
    }
    this.initialParameters = [...config.initialParameters];
    this.parameters = [...config.initialParameters];
    this.velocity = new Array<number>(this.parameters.length).fill(0);
    this.mode = config.mode ?? 'synchronous';
    this.workers = Math.max(1, Math.floor(config.workers ?? 1));
    this.maxStaleness = Math.max(0, Math.floor(config.maxStaleness ?? 0));
    this.learningRate = Math.max(1e-12, config.learningRate ?? 0.01);
    this.mixingRate = clamp01(config.mixingRate ?? 0.5);
    this.momentum = clampRange(config.momentum ?? 0.9, 0, 0.9999);
    this.weightDecay = Math.max(0, config.weightDecay ?? 0);
    this.stalenessDecay = Math.max(0, config.stalenessDecay ?? 0.25);
  }

  /** Phiên bản hiện tại; tăng sau mỗi lần gộp/cập nhật async. */
  public get version(): number {
    return this.currentVersion;
  }

  /** Bản sao tham số toàn cục. */
  public get currentParameters(): number[] {
    return [...this.parameters];
  }

  /** Số chiều tham số. */
  public get parameterCount(): number {
    return this.parameters.length;
  }

  /** Số cập nhật đang chờ trong buffer đồng bộ. */
  public get pending(): number {
    return this.parameterBuffer.length + this.gradientBuffer.length;
  }

  /** Thống kê phục vụ telemetry. */
  public get statistics(): ParameterServerStatistics {
    let norm = 0;
    for (const value of this.parameters) norm += value * value;
    return {
      version: this.currentVersion,
      updates: this.totalUpdates,
      samples: this.totalSamples,
      pending: this.pending,
      parameterNorm: Math.sqrt(norm),
    };
  }

  /** Bản sao chỉ số gần nhất của từng worker. */
  public metricsSnapshot(): Record<string, MetricMap> {
    const result: Record<string, MetricMap> = {};
    for (const [workerId, metrics] of this.workerMetrics) {
      result[workerId] = { ...metrics };
    }
    return result;
  }

  /** Đổi learning rate phía server. */
  public setLearningRate(learningRate: number): void {
    this.learningRate = Math.max(1e-12, learningRate);
  }

  /**
   * Gửi cập nhật tham số.
   *
   * @returns Trạng thái chấp nhận; cập nhật cũ vượt `maxStaleness` bị từ chối.
   */
  public submitParameters(update: ParameterUpdate): UpdateAcceptance {
    return this.submit(
      'parameters',
      update.workerId,
      update.parameters,
      update.weight,
      update.samples,
      update.baseVersion,
      update.metrics,
    );
  }

  /** Gửi cập nhật gradient. */
  public submitGradient(update: GradientUpdate): UpdateAcceptance {
    return this.submit(
      'gradient',
      update.workerId,
      update.gradient,
      update.weight,
      update.samples,
      update.baseVersion,
      update.metrics,
    );
  }

  /**
   * Gộp các cập nhật đang chờ.
   *
   * @param force Gộp dù chưa đủ `workers`; hữu ích khi kết thúc một vòng có
   *   danh sách client động.
   * @returns `null` nếu chưa đủ điều kiện hoặc không có cập nhật.
   */
  public flush(force = false): ParameterFlushResult | null {
    const hasParameters = this.parameterBuffer.length > 0;
    const hasGradients = this.gradientBuffer.length > 0;
    if (!hasParameters && !hasGradients) return null;
    if (hasParameters && hasGradients) {
      throw new RangeError('Không thể trộn cập nhật tham số và gradient trong cùng một vòng');
    }

    const buffer = hasParameters ? this.parameterBuffer : this.gradientBuffer;
    if (!force && buffer.length < this.workers) return null;

    const previous = [...this.parameters];
    const strategy: 'parameters' | 'gradient' = hasParameters ? 'parameters' : 'gradient';
    let samples = 0;
    let stalenessTotal = 0;

    if (hasParameters) {
      const averaged = averageParameters(
        buffer.map((update) => ({ parameters: update.values, weight: update.weight })),
      );
      this.parameters = averaged;
    } else {
      const totalWeight = buffer.reduce((sum, update) => sum + update.weight, 0);
      const average = new Array<number>(this.parameters.length).fill(0);
      for (const update of buffer) {
        const scale = totalWeight > 0 ? update.weight / totalWeight : 0;
        for (let i = 0; i < average.length; i++) average[i] += update.values[i] * scale;
      }
      const averageStaleness = buffer.reduce(
        (sum, update) => sum + Math.max(0, this.currentVersion - update.baseVersion),
        0,
      ) / buffer.length;
      this.applyGradientVector(average, 1 / (1 + this.stalenessDecay * averageStaleness));
    }

    for (const update of buffer) {
      samples += update.samples;
      stalenessTotal += Math.max(0, this.currentVersion - update.baseVersion);
    }

    const updates = buffer.length;
    buffer.length = 0;
    this.currentVersion++;
    this.totalUpdates += updates;
    this.totalSamples += samples;

    return {
      version: this.currentVersion,
      updates,
      samples,
      strategy,
      parameters: [...this.parameters],
      parameterChange: euclideanDistance(previous, this.parameters),
      averageStaleness: updates > 0 ? stalenessTotal / updates : 0,
    };
  }

  /**
   * Xóa trạng thái học (không đổi cấu hình).
   *
   * @param parameters Tham số mới; mặc định quay về tham số khởi tạo.
   */
  public reset(parameters?: readonly number[]): void {
    if (parameters && parameters.length !== this.parameters.length) {
      throw new RangeError('Tham số reset khác số chiều hiện tại');
    }
    this.parameters = parameters ? [...parameters] : [...this.initialParameters];
    this.velocity = new Array<number>(this.parameters.length).fill(0);
    this.parameterBuffer.length = 0;
    this.gradientBuffer.length = 0;
    this.currentVersion = 0;
    this.totalUpdates = 0;
    this.totalSamples = 0;
  }

  /** Ảnh chụp trạng thái (không gồm buffer tạm). */
  public snapshot(): ParameterServerSnapshot {
    return {
      config: {
        initialParameters: [...this.parameters],
        mode: this.mode,
        workers: this.workers,
        maxStaleness: this.maxStaleness,
        learningRate: this.learningRate,
        mixingRate: this.mixingRate,
        momentum: this.momentum,
        weightDecay: this.weightDecay,
        stalenessDecay: this.stalenessDecay,
      },
      parameters: [...this.parameters],
      velocity: [...this.velocity],
      version: this.currentVersion,
      updates: this.totalUpdates,
      samples: this.totalSamples,
    };
  }

  /** Khôi phục server từ ảnh chụp. */
  public static fromSnapshot(snapshot: ParameterServerSnapshot): ParameterServer {
    const server = new ParameterServer(snapshot.config);
    server.parameters = [...snapshot.parameters];
    server.velocity = [...snapshot.velocity];
    server.currentVersion = snapshot.version;
    server.totalUpdates = snapshot.updates;
    server.totalSamples = snapshot.samples;
    return server;
  }

  /** Nhận cập nhật chung cho cả tham số và gradient. */
  private submit(
    kind: 'parameters' | 'gradient',
    workerId: string,
    values: NumericVector,
    weightInput: number | undefined,
    samplesInput: number | undefined,
    baseVersion: number | undefined,
    metrics: MetricMap | undefined,
  ): UpdateAcceptance {
    if (values.length !== this.parameters.length) {
      throw new RangeError(
        `Cập nhật cần ${this.parameters.length} phần tử, nhận ${values.length}`,
      );
    }
    if (!workerId.trim()) throw new TypeError('workerId không được rỗng');
    for (const value of values) {
      if (!Number.isFinite(value)) throw new RangeError('Cập nhật chứa giá trị không hữu hạn');
    }

    const base = baseVersion ?? this.currentVersion;
    if (!Number.isInteger(base) || base < 0 || base > this.currentVersion) {
      return this.rejection('invalid', 0);
    }
    const staleness = this.currentVersion - base;
    if (this.maxStaleness > 0 && staleness > this.maxStaleness) {
      return this.rejection('stale', staleness);
    }

    const weight = weightInput ?? 1;
    if (!Number.isFinite(weight) || weight < 0) {
      return this.rejection('invalid', staleness);
    }
    if (weight === 0) return this.rejection('invalid', staleness);

    const samples = Math.max(0, Math.floor(samplesInput ?? 0));
    if (metrics) this.workerMetrics.set(workerId, { ...metrics });
    const buffered: BufferedUpdate = {
      workerId,
      values: [...values],
      weight,
      samples,
      baseVersion: base,
    };

    if (this.mode === 'asynchronous') {
      const stalenessScale = 1 / (1 + this.stalenessDecay * staleness);
      if (kind === 'parameters') {
        const alpha = clamp01(this.mixingRate * stalenessScale);
        for (let i = 0; i < this.parameters.length; i++) {
          this.parameters[i] = this.parameters[i] * (1 - alpha) + buffered.values[i] * alpha;
        }
      } else {
        this.applyGradientVector(buffered.values, stalenessScale);
      }
      this.currentVersion++;
      this.totalUpdates++;
      this.totalSamples += samples;
      return {
        accepted: true,
        reason: 'accepted',
        version: this.currentVersion,
        staleness,
        pending: this.pending,
      };
    }

    const target = kind === 'parameters' ? this.parameterBuffer : this.gradientBuffer;
    const other = kind === 'parameters' ? this.gradientBuffer : this.parameterBuffer;
    if (other.length > 0) {
      throw new RangeError('Không thể trộn cập nhật tham số và gradient trong cùng một vòng');
    }
    if (target.some((existing) => existing.workerId === workerId)) {
      return this.rejection('invalid', staleness);
    }
    target.push(buffered);
    return {
      accepted: true,
      reason: 'buffered',
      version: this.currentVersion,
      staleness,
      pending: this.pending,
    };
  }

  /** Áp một vector gradient với momentum + weight decay. */
  private applyGradientVector(gradient: readonly number[], scale: number): void {
    const effective = this.learningRate * scale;
    for (let i = 0; i < this.parameters.length; i++) {
      const value = gradient[i] + this.weightDecay * this.parameters[i];
      this.velocity[i] = this.momentum * this.velocity[i] - effective * value;
      this.parameters[i] += this.velocity[i];
    }
  }

  /** Tạo kết quả từ chối nhất quán. */
  private rejection(reason: 'invalid' | 'stale', staleness: number): UpdateAcceptance {
    return {
      accepted: false,
      reason,
      version: this.currentVersion,
      staleness,
      pending: this.pending,
    };
  }
}

// ---------------------------------------------------------------------------
// Federated learning
// ---------------------------------------------------------------------------

/** Cấu hình một federated client. */
export interface FederatedClientConfig {
  id: string;
  network: NeuralNetwork;
  samples: readonly SupervisedSample[];
  loss?: SupervisedLoss;
  huberDelta?: number;
  /** Số epoch cục bộ mỗi vòng. */
  epochs?: number;
  batchSize?: number;
  /** Learning rate cục bộ; nếu bỏ qua giữ nguyên cấu hình mạng. */
  learningRate?: number;
  seed?: number | string;
}

/** Cập nhật federated kèm báo cáo huấn luyện cục bộ. */
export interface FederatedClientUpdate extends ParameterUpdate {
  samples: number;
  report: LearningReport;
}

/**
 * Một client federated: sở hữu mạng cục bộ và dữ liệu riêng, chỉ trao đổi
 * tham số với server.
 */
export class FederatedClient {
  public readonly id: string;
  public readonly network: NeuralNetwork;
  public readonly samples: readonly SupervisedSample[];
  public readonly loss: SupervisedLoss;
  public readonly epochs: number;
  public readonly batchSize: number;

  private readonly trainer: SupervisedTrainer;
  private readonly learningRate: number | undefined;

  constructor(config: FederatedClientConfig) {
    if (!config.id.trim()) throw new TypeError('Federated client cần id');
    if (config.samples.length === 0) throw new RangeError('Federated client cần dữ liệu');
    validateSampleDimensions(config.samples, config.network);
    this.id = config.id;
    this.network = config.network;
    this.samples = config.samples.map(cloneSample);
    this.loss = config.loss ?? 'mse';
    this.epochs = Math.max(1, Math.floor(config.epochs ?? 1));
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 16));
    this.learningRate = config.learningRate;
    this.trainer = new SupervisedTrainer(this.network, {
      loss: this.loss,
      huberDelta: config.huberDelta,
    });
  }

  /** Tham số cục bộ hiện tại. */
  public get parameters(): number[] {
    return flattenNetworkParameters(this.network);
  }

  /**
   * Huấn luyện cục bộ từ tham số toàn cục.
   *
   * Khi `proximalMu > 0` (FedProx), thuật ngữ proximal `0.5·μ·‖w − w*‖²` được
   * cộng vào loss cục bộ với `w*` là tham số toàn cục vừa nạp.
   *
   * @returns Cập nhật kèm báo cáo để server có thể ghi telemetry.
   */
  public trainRound(
    globalParameters: readonly number[],
    options: {
      baseVersion?: number;
      epochs?: number;
      learningRate?: number;
      seed?: number | string;
      /** Hệ số μ của FedProx; 0 hoặc bỏ qua = FedAvg thuần. */
      proximalMu?: number;
    } = {},
  ): FederatedClientUpdate {
    applyNetworkParameters(this.network, globalParameters);
    const learningRate = options.learningRate ?? this.learningRate;
    if (learningRate !== undefined) this.network.setLearningRate(learningRate);
    const proximalMu = Math.max(0, options.proximalMu ?? 0);
    const report = this.trainer.fit(this.samples, {
      epochs: options.epochs ?? this.epochs,
      batchSize: this.batchSize,
      shuffle: true,
      seed: options.seed,
      ...(proximalMu > 0
        ? { proximal: { point: [...globalParameters], mu: proximalMu } }
        : {}),
    });
    return {
      workerId: this.id,
      parameters: this.parameters,
      weight: this.samples.length,
      samples: this.samples.length,
      baseVersion: options.baseVersion,
      metrics: {
        localLoss: report.finalLoss,
        localSamples: this.samples.length,
        elapsedMs: report.elapsedMs,
        proximalMu,
      },
      report,
    };
  }

  /** Đánh giá mạng cục bộ; có thể nạp tham số toàn cục trước khi đo. */
  public evaluate(parameters?: readonly number[]): EvaluationResult {
    if (parameters) applyNetworkParameters(this.network, parameters);
    return this.trainer.evaluate(this.samples);
  }
}

/** Cấu hình federated server. */
export interface FederatedLearningConfig {
  clients: readonly FederatedClientConfig[];
  /** Tham số khởi tạo; nếu bỏ qua dùng tham số mạng của client đầu tiên. */
  initialParameters?: readonly number[];
  /** Số epoch cục bộ mặc định mỗi vòng. */
  localEpochs?: number;
  /** Tỉ lệ client tham gia mỗi vòng trong `(0, 1]`; mặc định 1. */
  clientFraction?: number;
  /**
   * Hệ số μ của FedProx (Li et al. 2020): client cộng thuật ngữ proximal
   * `0.5·μ·‖w − w_global‖²` vào loss cục bộ. `0` hoặc bỏ qua = FedAvg thuần.
   */
  proximalMu?: number;
  server?: Omit<ParameterServerConfig, 'initialParameters' | 'workers'>;
  seed?: number | string;
}

/** Kết quả một vòng federated. */
export interface FederatedRoundResult {
  round: number;
  selectedClients: number;
  samples: number;
  meanLoss: number;
  parameters: number[];
  parameterChange: number;
  averageStaleness: number;
  serverVersion: number;
  clientMetrics: Record<string, MetricMap>;
}

/** Kết quả đánh giá toàn cục. */
export interface FederatedEvaluationResult {
  loss: number;
  accuracy: number | null;
  samples: number;
  perClient: Record<string, EvaluationResult>;
}

/** Báo cáo toàn bộ chiến dịch federated. */
export interface FederatedLearningReport {
  rounds: FederatedRoundResult[];
  finalParameters: number[];
  initialLoss: number;
  finalLoss: number;
  bestLoss: number;
  lossHistory: number[];
  samples: number;
  clients: number;
  serverVersion: number;
  elapsedMs: number;
  stoppedEarly: boolean;
}

/**
 * Điều phối federated learning theo FedAvg và FedProx.
 *
 * Server không bao giờ nhìn thấy dữ liệu thô: mỗi client chỉ gửi tham số sau khi
 * huấn luyện cục bộ. Trọng số gộp mặc định là số mẫu của client. Khi cấu hình
 * `proximalMu > 0` chuyển sang FedProx: client bị phạt nếu trôi quá xa tham số
 * toàn cục, giúp ổn định khi dữ liệu client không IID.
 */
export class FederatedLearningServer {
  public readonly server: ParameterServer;
  public readonly clients: readonly FederatedClient[];
  /** Hệ số proximal FedProx; 0 = FedAvg thuần. */
  public readonly proximalMu: number;

  private readonly random: DeepRandom;
  private readonly clientFraction: number;
  private readonly localEpochs: number;
  private roundIndex = 0;

  constructor(config: FederatedLearningConfig) {
    if (config.clients.length === 0) throw new RangeError('Cần ít nhất một federated client');
    this.clients = config.clients.map((client) => new FederatedClient(client));
    const reference = this.clients[0].network;
    const dimension = networkParameterCount(reference);
    const initial = config.initialParameters ?? flattenNetworkParameters(reference);
    if (initial.length !== dimension) {
      throw new RangeError(`Cần ${dimension} tham số khởi tạo, nhận ${initial.length}`);
    }
    this.server = new ParameterServer({
      ...config.server,
      initialParameters: initial,
      workers: this.clients.length,
    });
    this.clientFraction = clampRange(config.clientFraction ?? 1, 0.01, 1);
    this.localEpochs = Math.max(1, Math.floor(config.localEpochs ?? 1));
    this.proximalMu = Math.max(0, config.proximalMu ?? 0);
    this.random = new DeepRandom(config.seed ?? 1);
  }

  /** Tham số toàn cục hiện tại. */
  public get parameters(): number[] {
    return this.server.currentParameters;
  }

  /**
   * Chạy một vòng: chọn client, huấn luyện cục bộ và gộp tham số.
   *
   * @param clientIds Danh sách client cố định; nếu bỏ qua sẽ chọn theo
   *   `clientFraction`.
   */
  public runRound(clientIds?: readonly string[]): FederatedRoundResult {
    const selected = this.selectClients(clientIds);
    if (selected.length === 0) throw new RangeError('Vòng federated không có client nào');
    const globalParameters = this.server.currentParameters;
    const baseVersion = this.server.version;
    const updates: FederatedClientUpdate[] = [];
    const clientMetrics: Record<string, MetricMap> = {};

    for (const client of selected) {
      const update = client.trainRound(globalParameters, {
        baseVersion,
        epochs: this.localEpochs,
        seed: this.random.int(0, 1_000_000),
        proximalMu: this.proximalMu,
      });
      updates.push(update);
      clientMetrics[client.id] = { ...update.metrics };
      const acceptance = this.server.submitParameters(update);
      if (!acceptance.accepted) {
        throw new Error(
          `Cập nhật của client ${client.id} bị từ chối: ${acceptance.reason}`,
        );
      }
    }

    const flush = this.server.flush(true);
    const samples = updates.reduce((sum, update) => sum + update.samples, 0);
    const weightedLoss = updates.reduce(
      (sum, update) => sum + update.report.finalLoss * update.samples,
      0,
    );
    const round = ++this.roundIndex;
    return {
      round,
      selectedClients: selected.length,
      samples,
      meanLoss: samples > 0 ? weightedLoss / samples : 0,
      parameters: this.server.currentParameters,
      parameterChange: flush?.parameterChange ?? 0,
      averageStaleness: flush?.averageStaleness ?? 0,
      serverVersion: this.server.version,
      clientMetrics,
    };
  }

  /**
   * Chạy nhiều vòng và trả báo cáo tổng hợp.
   *
   * @param rounds Số vòng; mặc định 10.
   * @param evaluateEvery Đánh giá toàn cục mỗi N vòng; 0 = tắt.
   */
  public run(rounds = 10, evaluateEvery = 0): FederatedLearningReport {
    const startedAt = Date.now();
    const total = Math.max(1, Math.floor(rounds));
    const results: FederatedRoundResult[] = [];
    let initialLoss = 0;
    let bestLoss = Infinity;
    let samples = 0;

    const initialEvaluation = this.evaluate();
    initialLoss = initialEvaluation.loss;

    for (let round = 0; round < total; round++) {
      const result = this.runRound();
      results.push(result);
      samples += result.samples;
      bestLoss = Math.min(bestLoss, result.meanLoss);
      if (evaluateEvery > 0 && (round + 1) % evaluateEvery === 0) {
        const evaluation = this.evaluate();
        bestLoss = Math.min(bestLoss, evaluation.loss);
      }
    }

    const finalEvaluation = this.evaluate();
    return {
      rounds: results,
      finalParameters: this.server.currentParameters,
      initialLoss,
      finalLoss: finalEvaluation.loss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : finalEvaluation.loss,
      lossHistory: results.map((result) => result.meanLoss),
      samples,
      clients: this.clients.length,
      serverVersion: this.server.version,
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá tổng hợp có trọng số theo số mẫu. */
  public evaluate(parameters: readonly number[] = this.server.currentParameters): FederatedEvaluationResult {
    const perClient: Record<string, EvaluationResult> = {};
    let loss = 0;
    let samples = 0;
    let weightedAccuracy = 0;
    let accuracySamples = 0;

    for (const client of this.clients) {
      const result = client.evaluate(parameters);
      perClient[client.id] = result;
      loss += result.loss * result.samples;
      samples += result.samples;
      if (result.accuracy !== null) {
        weightedAccuracy += result.accuracy * result.samples;
        accuracySamples += result.samples;
      }
    }

    return {
      loss: samples > 0 ? loss / samples : 0,
      accuracy: accuracySamples > 0 ? weightedAccuracy / accuracySamples : null,
      samples,
      perClient,
    };
  }

  /** Chọn client theo tỉ lệ tham gia, giữ thứ tự ổn định. */
  private selectClients(clientIds?: readonly string[]): FederatedClient[] {
    if (clientIds) {
      const requested = new Set(clientIds);
      return this.clients.filter((client) => requested.has(client.id));
    }
    if (this.clientFraction >= 1) return [...this.clients];
    const shuffled = [...this.clients];
    this.random.shuffle(shuffled);
    const count = Math.max(1, Math.ceil(shuffled.length * this.clientFraction));
    return shuffled.slice(0, count);
  }
}

// ---------------------------------------------------------------------------
// Continual learning: rehearsal + EWC
// ---------------------------------------------------------------------------

/** Ảnh chụp bộ nhớ rehearsal. */
export interface SampleReplayBufferSnapshot {
  capacity: number;
  seen: number;
  seedState: number;
  items: SupervisedSample[];
}

/**
 * Bộ nhớ rehearsal cho học liên tục.
 *
 * Dùng reservoir sampling để giữ phân phối đại diện khi luồng dữ liệu dài hơn
 * sức chứa, tránh việc chỉ nhớ các task gần nhất.
 */
export class SampleReplayBuffer {
  public readonly capacity: number;

  private items: SupervisedSample[] = [];
  private seen = 0;
  private readonly random: DeepRandom;
  private readonly seedState: number;

  constructor(capacity: number, seed: number | string = 1) {
    if (capacity <= 0) throw new RangeError('Sức chứa replay phải dương');
    this.capacity = Math.floor(capacity);
    this.random = new DeepRandom(seed);
    this.seedState = this.random.getState();
  }

  /** Số mẫu đang giữ. */
  public get size(): number {
    return this.items.length;
  }

  /** Số mẫu đã từng thấy. */
  public get totalSeen(): number {
    return this.seen;
  }

  /** Thêm một mẫu theo reservoir sampling. */
  public add(sample: SupervisedSample): void {
    const normalized = cloneSample(sample);
    this.seen++;
    if (this.items.length < this.capacity) {
      this.items.push(normalized);
      return;
    }
    const index = Math.floor(this.random.next() * this.seen);
    if (index < this.capacity) this.items[index] = normalized;
  }

  /** Thêm nhiều mẫu. */
  public addMany(samples: readonly SupervisedSample[]): void {
    for (const sample of samples) this.add(sample);
  }

  /** Lấy mẫu không hoàn lại; trả bản sao để tránh sửa bộ nhớ. */
  public sample(count: number): SupervisedSample[] {
    if (count <= 0 || this.items.length === 0) return [];
    const take = Math.min(Math.floor(count), this.items.length);
    const order = Array.from({ length: this.items.length }, (_, index) => index);
    this.random.shuffle(order);
    const result: SupervisedSample[] = [];
    for (let i = 0; i < take; i++) result.push(cloneSample(this.items[order[i]]));
    return result;
  }

  /** Toàn bộ mẫu hiện có (bản sao). */
  public all(): SupervisedSample[] {
    return this.items.map(cloneSample);
  }

  /** Xóa bộ nhớ. */
  public clear(): void {
    this.items = [];
    this.seen = 0;
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): SampleReplayBufferSnapshot {
    return {
      capacity: this.capacity,
      seen: this.seen,
      seedState: this.seedState,
      items: this.items.map(cloneSample),
    };
  }

  /** Khôi phục bộ nhớ. */
  public static fromSnapshot(snapshot: SampleReplayBufferSnapshot): SampleReplayBuffer {
    const buffer = new SampleReplayBuffer(snapshot.capacity, snapshot.seedState);
    buffer.items = snapshot.items.map(cloneSample);
    buffer.seen = snapshot.seen;
    return buffer;
  }
}

/** Cấu hình EWC. */
export interface EWCConfig {
  /** Hệ số phạt; càng lớn càng giữ chặt tham số cũ. */
  lambda?: number;
  /** Cộng thêm vào Fisher để tránh chia 0/khóa tuyệt đối. */
  damping?: number;
  /** Số mẫu tối đa dùng ước lượng Fisher; 0 = toàn bộ. */
  maxSamples?: number;
  seed?: number | string;
}

/** Ảnh chụp EWC. */
export interface EWCSnapshot {
  lambda: number;
  damping: number;
  fisher: number[] | null;
  anchor: number[] | null;
  samples: number;
}

/** Kết quả một lần ước lượng Fisher. */
export interface EWCConsolidationResult {
  samples: number;
  parameters: number;
  meanFisher: number;
}

/**
 * Elastic Weight Consolidation.
 *
 * Fisher chéo được xấp xỉ bằng trung bình bình phương gradient từng mẫu. Khi
 * huấn luyện task mới, phạt `λ/2 · Σ F_i (θ_i − θ*_i)²` giữ các tham số quan
 * trọng của task cũ.
 */
export class EWCRegularizer {
  public readonly network: NeuralNetwork;
  public lambda: number;
  public readonly damping: number;
  public readonly maxSamples: number;

  private fisher: number[] | null = null;
  private anchor: number[] | null = null;
  private samples = 0;
  private readonly random: DeepRandom;

  constructor(network: NeuralNetwork, config: EWCConfig = {}) {
    this.network = network;
    this.lambda = Math.max(0, config.lambda ?? 1000);
    this.damping = Math.max(0, config.damping ?? 1e-4);
    this.maxSamples = Math.max(0, Math.floor(config.maxSamples ?? 0));
    this.random = new DeepRandom(config.seed ?? 1);
  }

  /** Đã có Fisher/anchor chưa. */
  public get consolidated(): boolean {
    return this.fisher !== null && this.anchor !== null;
  }

  /** Số mẫu dùng cho lần ước lượng gần nhất. */
  public get sampleCount(): number {
    return this.samples;
  }

  /** Fisher hiện tại (bản sao). */
  public get fisherDiagonal(): number[] {
    return this.fisher ? [...this.fisher] : [];
  }

  /**
   * Ước lượng Fisher và chốt anchor tại tham số hiện tại.
   *
   * @param samples Dữ liệu đại diện cho task vừa học.
   * @param loss Loss dùng để lấy gradient; mặc định MSE.
   */
  public consolidate(
    samples: readonly SupervisedSample[],
    loss: SupervisedLoss = 'mse',
    huberDelta = 1,
  ): EWCConsolidationResult {
    if (samples.length === 0) throw new RangeError('EWC cần mẫu để ước lượng Fisher');
    validateSampleDimensions(samples, this.network);

    const dimension = networkParameterCount(this.network);
    const fisher = new Array<number>(dimension).fill(0);
    const order = Array.from({ length: samples.length }, (_, index) => index);
    this.random.shuffle(order);
    const limit = this.maxSamples > 0 ? Math.min(this.maxSamples, samples.length) : samples.length;

    for (let n = 0; n < limit; n++) {
      const sample = samples[order[n]];
      const weight = Math.max(0, sample.weight ?? 1);
      if (weight === 0) continue;
      const gradient = createNetworkGradient(this.network);
      const output = this.network.forward(sample.input, false);
      const { gradOutput, skipOutputActivation } = supervisedGradient(
        output,
        sample.target,
        loss,
        huberDelta,
        weight,
      );
      backpropagateNetwork(this.network, gradOutput, {
        gradient,
        skipOutputActivation,
        apply: false,
      });
      const flat = flattenGradient(gradient);
      for (let i = 0; i < dimension; i++) fisher[i] += flat[i] * flat[i];
    }

    const scale = 1 / limit;
    let sum = 0;
    for (let i = 0; i < dimension; i++) {
      fisher[i] = fisher[i] * scale + this.damping;
      sum += fisher[i];
    }
    this.fisher = fisher;
    this.anchor = flattenNetworkParameters(this.network);
    this.samples = limit;
    return {
      samples: limit,
      parameters: dimension,
      meanFisher: sum / dimension,
    };
  }

  /** Giá trị phạt tại tham số hiện tại hoặc tham số truyền vào. */
  public penalty(parameters?: readonly number[]): number {
    if (!this.fisher || !this.anchor) return 0;
    const current = parameters ?? flattenNetworkParameters(this.network);
    assertParameterLength(current, this.fisher.length);
    let sum = 0;
    for (let i = 0; i < this.fisher.length; i++) {
      const delta = current[i] - this.anchor[i];
      sum += this.fisher[i] * delta * delta;
    }
    return (this.lambda / 2) * sum;
  }

  /** Gradient của giá trị phạt theo tham số. */
  public penaltyGradient(parameters?: readonly number[]): number[] {
    if (!this.fisher || !this.anchor) return [];
    const current = parameters ?? flattenNetworkParameters(this.network);
    assertParameterLength(current, this.fisher.length);
    const gradient = new Array<number>(this.fisher.length);
    for (let i = 0; i < this.fisher.length; i++) {
      gradient[i] = this.lambda * this.fisher[i] * (current[i] - this.anchor[i]);
    }
    return gradient;
  }

  /** Xóa Fisher/anchor để bắt đầu task mới. */
  public reset(): void {
    this.fisher = null;
    this.anchor = null;
    this.samples = 0;
  }

  /** Ảnh chụp EWC. */
  public snapshot(): EWCSnapshot {
    return {
      lambda: this.lambda,
      damping: this.damping,
      fisher: this.fisher ? [...this.fisher] : null,
      anchor: this.anchor ? [...this.anchor] : null,
      samples: this.samples,
    };
  }

  /** Phục hồi Fisher/anchor từ ảnh chụp. */
  public restore(snapshot: EWCSnapshot): void {
    this.lambda = Math.max(0, snapshot.lambda);
    this.fisher = snapshot.fisher ? [...snapshot.fisher] : null;
    this.anchor = snapshot.anchor ? [...snapshot.anchor] : null;
    if (this.fisher && this.anchor && this.fisher.length !== this.anchor.length) {
      throw new RangeError('Fisher và anchor khác số chiều');
    }
    this.samples = Math.max(0, Math.floor(snapshot.samples));
  }
}

/** Tùy chọn huấn luyện liên tục. */
export interface ContinualLearningOptions extends LearningOptions {
  validation?: readonly SupervisedSample[];
  /** Tỉ lệ mẫu replay trong mỗi batch; 0 = tắt. */
  replayRatio?: number;
}

/** Cấu hình bộ huấn luyện liên tục. */
export interface ContinualLearningConfig {
  network: NeuralNetwork;
  loss?: SupervisedLoss;
  huberDelta?: number;
  /** Cấu hình EWC; `false` để tắt. */
  ewc?: EWCConfig | false;
  /** Sức chứa rehearsal; 0 để tắt. */
  replayCapacity?: number;
  /** Tỉ lệ replay mặc định `[0, 1)`; mặc định 0.3. */
  replayRatio?: number;
  seed?: number | string;
}

/**
 * Huấn luyện liên tục trên chuỗi task.
 *
 * Mỗi batch trộn dữ liệu mới với rehearsal và cộng gradient phạt EWC. Nhờ vậy
 * mô hình học task mới mà không quên kỹ năng cũ, phù hợp NPC tiến hóa theo mùa
 * hoặc policy cập nhật dần trong game live-service.
 */
export class ContinualLearningTrainer {
  public readonly network: NeuralNetwork;
  public readonly loss: SupervisedLoss;
  public readonly huberDelta: number;
  public readonly ewc: EWCRegularizer | null;
  public readonly replay: SampleReplayBuffer | null;
  public readonly replayRatio: number;

  private readonly evaluator: SupervisedTrainer;
  private readonly random: DeepRandom;

  constructor(config: ContinualLearningConfig) {
    this.network = config.network;
    this.loss = config.loss ?? 'mse';
    this.huberDelta = config.huberDelta ?? 1;
    this.ewc = config.ewc === false ? null : new EWCRegularizer(this.network, config.ewc);
    const capacity = Math.max(0, Math.floor(config.replayCapacity ?? 2048));
    this.replay = capacity > 0 ? new SampleReplayBuffer(capacity, config.seed ?? 1) : null;
    this.replayRatio = clampRange(config.replayRatio ?? 0.3, 0, 0.95);
    this.random = new DeepRandom(config.seed ?? 1);
    this.evaluator = new SupervisedTrainer(this.network, {
      loss: this.loss,
      huberDelta: this.huberDelta,
    });
  }

  /**
   * Huấn luyện trên một task mới.
   *
   * @param samples Dữ liệu task mới.
   * @returns Báo cáo chuẩn hóa; dữ liệu mới được thêm vào rehearsal sau khi học.
   */
  public fit(
    samples: readonly SupervisedSample[],
    options: ContinualLearningOptions = {},
  ): LearningReport {
    const startedAt = Date.now();
    if (samples.length === 0) {
      return {
        epochs: 0,
        steps: 0,
        samples: 0,
        initialLoss: 0,
        finalLoss: 0,
        bestLoss: 0,
        lossHistory: [],
        metrics: { replaySize: this.replay?.size ?? 0 },
        elapsedMs: Date.now() - startedAt,
        stoppedEarly: false,
      };
    }
    validateSampleDimensions(samples, this.network);

    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const validation = options.validation ?? [];
    const clipNorm = options.gradientClip ?? 0;
    const patience = options.earlyStopping?.patience;
    const minDelta = options.earlyStopping?.minDelta ?? 0;
    const replayRatio = clampRange(options.replayRatio ?? this.replayRatio, 0, 0.95);
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];

    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let bestMonitor = Infinity;
    let staleEpochs = 0;
    let completedEpochs = 0;
    let steps = 0;
    let lastAccuracy: number | null = null;
    let lastPenalty = this.ewc?.penalty() ?? 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      let weightTotal = 0;
      let correct = 0;
      let classifiedCount = 0;

      for (let start = 0; start < order.length; start += batchSize) {
        const indices = order.slice(start, start + batchSize);
        const fresh = indices.map((index) => samples[index]);
        const replayCount = this.replay && replayRatio > 0
          ? Math.max(1, Math.round(fresh.length * replayRatio / (1 - replayRatio)))
          : 0;
        const replaySamples = this.replay && replayCount > 0
          ? this.replay.sample(replayCount)
          : [];
        const batch = [...fresh, ...replaySamples];
        const gradient = createNetworkGradient(this.network);
        let batchLoss = 0;

        for (const sample of batch) {
          const weight = Math.max(0, sample.weight ?? 1);
          if (weight === 0) continue;
          const output = this.network.forward(sample.input, true);
          const { loss, gradOutput, skipOutputActivation } = supervisedGradient(
            output,
            sample.target,
            this.loss,
            this.huberDelta,
            weight,
          );
          batchLoss += loss;
          weightTotal += weight;
          backpropagateNetwork(this.network, gradOutput, {
            gradient,
            skipOutputActivation,
            apply: false,
          });
          if (this.loss === 'crossEntropy') {
            if (argmaxOf(output) === argmaxOf(sample.target)) correct++;
            classifiedCount++;
          } else if (this.loss === 'binaryCrossEntropy') {
            if ((output[0] >= 0 ? 1 : 0) === (sample.target[0] >= 0.5 ? 1 : 0)) correct++;
            classifiedCount++;
          }
        }

        if (this.ewc?.consolidated) {
          const penaltyGradient = this.ewc.penaltyGradient();
          // Nhân với kích thước batch để bù việc `applyNetworkGradient` chia
          // gradient cho batchSize, giữ nguyên cường độ phạt EWC.
          addFlattenedGradient(gradient, penaltyGradient, batch.length);
          lastPenalty = this.ewc.penalty();
        }
        if (clipNorm) clipNetworkGradient(gradient, clipNorm);
        applyNetworkGradient(this.network, gradient, {
          optimizer: this.network.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }

      const average = weightTotal > 0 ? epochLoss / weightTotal : 0;
      const validationLoss = validation.length > 0 ? this.evaluator.evaluate(validation).loss : undefined;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
      completedEpochs = epoch + 1;
      lastAccuracy = classificationAccuracyFor(this.loss, correct, classifiedCount);

      const monitor = validationLoss ?? average;
      if (monitor < bestMonitor - minDelta) {
        bestMonitor = monitor;
        staleEpochs = 0;
      } else {
        staleEpochs++;
      }
      if (patience !== undefined && staleEpochs >= Math.max(1, patience)) break;
    }

    this.replay?.addMany(samples);

    return {
      epochs: completedEpochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : finalLoss,
      lossHistory,
      metrics: {
        replaySize: this.replay?.size ?? 0,
        replaySeen: this.replay?.totalSeen ?? 0,
        ewcPenalty: lastPenalty,
        ewcSamples: this.ewc?.sampleCount ?? 0,
        ...(lastAccuracy !== null ? { accuracy: lastAccuracy } : {}),
        ...(bestMonitor !== Infinity ? { monitorLoss: bestMonitor } : {}),
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: completedEpochs < epochs,
    };
  }

  /** Học task mới rồi chốt Fisher/anchor cho task đó. */
  public fitTask(
    samples: readonly SupervisedSample[],
    options: ContinualLearningOptions = {},
  ): LearningReport {
    const report = this.fit(samples, options);
    if (this.ewc) this.ewc.consolidate(samples, this.loss, this.huberDelta);
    return report;
  }

  /** Chốt task hiện tại bằng EWC. */
  public consolidate(
    samples: readonly SupervisedSample[],
    loss: SupervisedLoss = this.loss,
  ): EWCConsolidationResult {
    if (!this.ewc) throw new Error('EWC đã bị tắt trong cấu hình');
    return this.ewc.consolidate(samples, loss, this.huberDelta);
  }

  /** Đánh giá không cập nhật trọng số. */
  public evaluate(samples: readonly SupervisedSample[]): EvaluationResult {
    return this.evaluator.evaluate(samples);
  }

  /** Dự đoán đầu ra mạng. */
  public predict(input: NumericVector): number[] {
    return this.network.predict(input);
  }
}

// ---------------------------------------------------------------------------
// Tiện ích nội bộ
// ---------------------------------------------------------------------------

/** Chuẩn hóa dữ liệu mẫu, tách khỏi mảng người dùng. */
function cloneSample(sample: SupervisedSample): SupervisedSample {
  return {
    input: [...sample.input],
    target: [...sample.target],
    weight: sample.weight,
  };
}

/** Kiểm tra chiều dữ liệu so với mạng. */
function validateSampleDimensions(
  samples: readonly SupervisedSample[],
  network: NeuralNetwork,
): void {
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    if (sample.input.length !== network.inputSize) {
      throw new RangeError(
        `Mẫu ${i}: input cần ${network.inputSize} chiều, nhận ${sample.input.length}`,
      );
    }
    if (sample.target.length !== network.outputSize) {
      throw new RangeError(
        `Mẫu ${i}: target cần ${network.outputSize} chiều, nhận ${sample.target.length}`,
      );
    }
  }
}

/** Chuẩn hóa tham số đầu vào. */
function assertParameterLength(parameters: readonly number[], expected: number): void {
  if (parameters.length !== expected) {
    throw new RangeError(`Cần ${expected} tham số, nhận ${parameters.length}`);
  }
}

/** Lấy loss + gradient output tương ứng với từng hàm loss. */
function supervisedGradient(
  predicted: readonly number[],
  target: readonly number[],
  loss: SupervisedLoss,
  huberDelta: number,
  weight: number,
): { loss: number; gradOutput: number[]; skipOutputActivation: boolean } {
  if (loss === 'crossEntropy') {
    const result = softmaxCrossEntropyGradient(predicted, target, weight);
    return { loss: result.loss, gradOutput: result.gradLogits, skipOutputActivation: true };
  }
  if (loss === 'binaryCrossEntropy') {
    const result = binaryCrossEntropyGradient(predicted, target, weight);
    return { loss: result.loss, gradOutput: result.gradLogits, skipOutputActivation: true };
  }
  if (loss === 'huber') {
    const result = huberLossGradient(predicted, target, huberDelta, weight);
    return { loss: result.loss, gradOutput: result.gradOutput, skipOutputActivation: false };
  }
  const result = meanSquaredErrorGradient(predicted, target, weight);
  return { loss: result.loss, gradOutput: result.gradOutput, skipOutputActivation: false };
}

/** Trải gradient theo đúng thứ tự `flattenNetworkParameters`. */
function flattenGradient(gradient: ReturnType<typeof createNetworkGradient>): number[] {
  const flat: number[] = [];
  for (let l = 0; l < gradient.weights.length; l++) {
    for (const row of gradient.weights[l]) flat.push(...row);
    flat.push(...gradient.biases[l]);
  }
  return flat;
}

/** Cộng vector gradient phẳng vào cấu trúc gradient hiện có. */
function addFlattenedGradient(
  gradient: ReturnType<typeof createNetworkGradient>,
  values: readonly number[],
  scale: number,
): void {
  let cursor = 0;
  for (let l = 0; l < gradient.weights.length; l++) {
    for (let o = 0; o < gradient.weights[l].length; o++) {
      const row = gradient.weights[l][o];
      for (let i = 0; i < row.length; i++) row[i] += values[cursor++] * scale;
    }
    const biases = gradient.biases[l];
    for (let o = 0; o < biases.length; o++) biases[o] += values[cursor++] * scale;
  }
}

/** Khoảng cách Euclid giữa hai vector. */
function euclideanDistance(a: readonly number[], b: readonly number[]): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

/** Chỉ số phần tử lớn nhất, không ném lỗi với vector rỗng. */
function argmaxOf(values: readonly number[]): number {
  let best = -1;
  let bestValue = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > bestValue) {
      bestValue = values[i];
      best = i;
    }
  }
  return best;
}

/** Accuracy chỉ có ý nghĩa với loss phân loại. */
function classificationAccuracyFor(
  loss: SupervisedLoss,
  correct: number,
  evaluated: number,
): number | null {
  if (loss !== 'crossEntropy' && loss !== 'binaryCrossEntropy') return null;
  if (evaluated === 0) return null;
  return correct / evaluated;
}
