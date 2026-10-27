/**
 * @file imitation.ts
 * @module @aetheria/engine/learning/reinforcement/imitation
 * @description Học bắt chước (imitation learning) cho agent game:
 *
 * - `BehaviorCloningTrainer`: học có giám sát trực tiếp từ cặp (state, action).
 * - `DAggerTrainer`: tổng hợp dữ liệu lặp lại bằng cách hỏi chuyên gia tại các
 *   trạng thái do policy hiện tại ghé thăm.
 * - `GAILTrainer`: adversarial imitation — discriminator phân biệt expert/policy,
 *   reward đối kháng được đưa vào PPO.
 *
 * Module không tự chạy môi trường; game gọi `aggregate`/`trainRound` với các
 * trạng thái thu được từ vòng lặp mô phỏng của mình.
 */

import { NeuralNetwork, type OptimizerConfig } from '../../deeplearning/nn.js';
import { DeepRandom } from '../../deeplearning/random.js';
import type { NumericVector } from '../types.js';
import type { EvaluationResult, LearningReport, SupervisedSample } from '../types.js';
import {
  applyNetworkGradient,
  argmaxIndex,
  backpropagateNetwork,
  binaryCrossEntropyGradient,
  createNetworkGradient,
  oneHot,
  softmaxVector,
} from '../network.js';
import { SupervisedTrainer, type SupervisedOptions } from '../supervised.js';
import {
  PPOTrainer,
  sampleCategorical,
  type PPOConfig,
  type PPORolloutStep,
  type PPOTrainResult,
  type PPOSnapshot,
} from './ppo.js';
import { restoreWeightsFromSnapshot } from '../internal.js';

/** Hành động trong bài toán bắt chước: rời rạc hoặc vector liên tục. */
export type ImitationAction = number | readonly number[];

/** Một mẫu chuyên gia. */
export interface ImitationDemonstration {
  state: NumericVector;
  action: ImitationAction;
  weight?: number;
}

/** Cấu hình behavior cloning. */
export interface BehaviorCloningConfig {
  stateSize: number;
  mode: 'discrete' | 'continuous';
  /** Số hành động rời rạc (bắt buộc với `mode: 'discrete'`). */
  actionCount?: number;
  /** Số chiều hành động liên tục (bắt buộc với `mode: 'continuous'`). */
  actionSize?: number;
  hiddenSizes?: readonly number[];
  learningRate?: number;
  seed?: number;
}

/** Ảnh chụp behavior cloning. */
export interface BehaviorCloningSnapshot {
  config: BehaviorCloningConfig;
  policy: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Behavior cloning dùng `SupervisedTrainer` với cross-entropy (rời rạc) hoặc
 * MSE (liên tục). Policy rời rạc xuất logits tuyến tính; policy liên tục xuất
 * vector hành động tuyến tính.
 */
export class BehaviorCloningTrainer {
  public readonly policy: NeuralNetwork;
  public readonly mode: 'discrete' | 'continuous';
  public readonly actionCount: number;
  public readonly actionSize: number;

  private readonly config: BehaviorCloningConfig;
  private readonly trainer: SupervisedTrainer;
  private readonly random: DeepRandom;

  constructor(config: BehaviorCloningConfig) {
    if (config.stateSize <= 0) throw new RangeError('stateSize phải dương');
    if (config.mode === 'discrete' && (!config.actionCount || config.actionCount <= 0)) {
      throw new RangeError('Behavior cloning rời rạc cần actionCount dương');
    }
    if (config.mode === 'continuous' && (!config.actionSize || config.actionSize <= 0)) {
      throw new RangeError('Behavior cloning liên tục cần actionSize dương');
    }
    this.config = { ...config };
    this.mode = config.mode;
    this.actionCount = config.actionCount ?? 0;
    this.actionSize = config.actionSize ?? 0;
    this.random = new DeepRandom(config.seed ?? 1);

    const outputSize = this.mode === 'discrete' ? this.actionCount : this.actionSize;
    this.policy = new NeuralNetwork({
      inputSize: config.stateSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.001,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
    this.trainer = new SupervisedTrainer(this.policy, {
      loss: this.mode === 'discrete' ? 'crossEntropy' : 'mse',
    });
  }

  /** Huấn luyện policy từ danh sách mẫu chuyên gia. */
  public fit(
    demonstrations: readonly ImitationDemonstration[],
    options: SupervisedOptions = {},
  ): LearningReport {
    return this.trainer.fit(this.toSamples(demonstrations), options);
  }

  /** Đánh giá loss/accuracy trên tập chuyên gia. */
  public evaluate(demonstrations: readonly ImitationDemonstration[]): EvaluationResult {
    return this.trainer.evaluate(this.toSamples(demonstrations));
  }

  /** Logits (rời rạc) hoặc vector hành động (liên tục). */
  public predictRaw(state: NumericVector): number[] {
    return this.policy.predict(state);
  }

  /** Xác suất hành động (rời rạc) hoặc hành động liên tục. */
  public predict(state: NumericVector): number[] {
    const output = this.predictRaw(state);
    return this.mode === 'discrete' ? softmaxVector(output) : output;
  }

  /** Chọn hành động theo policy đã học. */
  public selectAction(state: NumericVector, explore = true): ImitationAction {
    if (this.mode === 'continuous') return this.predictRaw(state);
    const probabilities = this.predict(state);
    return explore ? sampleCategorical(probabilities, this.random) : argmaxIndex(probabilities);
  }

  /** Ảnh chụp policy. */
  public snapshot(): BehaviorCloningSnapshot {
    return {
      config: { ...this.config },
      policy: this.policy.snapshot(),
    };
  }

  /** Khôi phục policy. */
  public static fromSnapshot(snapshot: BehaviorCloningSnapshot): BehaviorCloningTrainer {
    const trainer = new BehaviorCloningTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    return trainer;
  }

  /** Chuyển mẫu chuyên gia thành mẫu học có giám sát. */
  private toSamples(demonstrations: readonly ImitationDemonstration[]): SupervisedSample[] {
    return demonstrations.map((demonstration, index) => {
      if (demonstration.state.length !== this.config.stateSize) {
        throw new RangeError(
          `Mẫu ${index}: state cần ${this.config.stateSize} chiều, nhận ${demonstration.state.length}`,
        );
      }
      if (this.mode === 'discrete') {
        if (typeof demonstration.action !== 'number') {
          throw new TypeError(`Mẫu ${index}: hành động rời rạc phải là number`);
        }
        if (demonstration.action < 0 || demonstration.action >= this.actionCount) {
          throw new RangeError(`Mẫu ${index}: action ${demonstration.action} ngoài phạm vi`);
        }
        return {
          input: demonstration.state,
          target: oneHot(demonstration.action, this.actionCount),
          weight: demonstration.weight,
        };
      }
      if (typeof demonstration.action === 'number') {
        throw new TypeError(`Mẫu ${index}: hành động liên tục phải là vector`);
      }
      if (demonstration.action.length !== this.actionSize) {
        throw new RangeError(
          `Mẫu ${index}: action cần ${this.actionSize} chiều, nhận ${demonstration.action.length}`,
        );
      }
      return {
        input: demonstration.state,
        target: demonstration.action,
        weight: demonstration.weight,
      };
    });
  }
}

/**
 * DAgger (Dataset Aggregation).
 *
 * Ở mỗi vòng, game cung cấp các trạng thái do policy hiện tại ghé thăm; trainer
 * hỏi chuyên gia nhãn đúng, thêm vào dataset tổng hợp rồi huấn luyện lại. Nhờ
 * vậy policy dần phủ cả những trạng thái ngoài phân phối chuyên gia ban đầu.
 */
export class DAggerTrainer {
  public readonly policy: BehaviorCloningTrainer;
  public readonly expert: (state: NumericVector) => ImitationAction;

  private readonly demonstrations: ImitationDemonstration[] = [];

  constructor(
    config: BehaviorCloningConfig,
    expert: (state: NumericVector) => ImitationAction,
  ) {
    this.policy = new BehaviorCloningTrainer(config);
    this.expert = expert;
  }

  /** Số mẫu đã tổng hợp. */
  public get datasetSize(): number {
    return this.demonstrations.length;
  }

  /** Toàn bộ mẫu hiện có (bản sao nông). */
  public dataset(): readonly ImitationDemonstration[] {
    return [...this.demonstrations];
  }

  /** Thêm mẫu ban đầu của chuyên gia. */
  public seed(demonstrations: readonly ImitationDemonstration[]): void {
    this.demonstrations.push(...cloneDemonstrations(demonstrations));
  }

  /** Hỏi chuyên gia tại các trạng thái mới và thêm vào dataset. */
  public aggregate(states: readonly NumericVector[]): number {
    let added = 0;
    for (const state of states) {
      this.demonstrations.push({
        state: [...state],
        action: cloneAction(this.expert(state)),
      });
      added++;
    }
    return added;
  }

  /** Một vòng DAgger: tổng hợp trạng thái mới rồi huấn luyện lại toàn bộ. */
  public trainRound(
    states: readonly NumericVector[],
    options: SupervisedOptions = {},
  ): LearningReport {
    this.aggregate(states);
    return this.policy.fit(this.demonstrations, options);
  }

  /** Huấn luyện trên dataset hiện có. */
  public fit(options: SupervisedOptions = {}): LearningReport {
    return this.policy.fit(this.demonstrations, options);
  }

  /** Đánh giá trên dataset tổng hợp. */
  public evaluate(): EvaluationResult {
    return this.policy.evaluate(this.demonstrations);
  }

  /** Chọn hành động từ policy hiện tại. */
  public selectAction(state: NumericVector, explore = true): ImitationAction {
    return this.policy.selectAction(state, explore);
  }

  /** Ảnh chụp policy và dataset. */
  public snapshot(): {
    policy: BehaviorCloningSnapshot;
    demonstrations: ImitationDemonstration[];
  } {
    return {
      policy: this.policy.snapshot(),
      demonstrations: cloneDemonstrations(this.demonstrations),
    };
  }
}

/** Cấu hình GAIL. */
export interface GAILConfig extends PPOConfig {
  discriminatorHiddenSizes?: readonly number[];
  discriminatorLearningRate?: number;
  /** Hệ số nhân reward đối kháng trước khi cộng vào reward gốc. */
  rewardScale?: number;
}

/** Kết quả một vòng GAIL. */
export interface GAILTrainResult {
  policy: PPOTrainResult;
  discriminatorLoss: number;
  expertAccuracy: number;
  policyAccuracy: number;
  meanGAILReward: number;
}

/** Ảnh chụp GAIL. */
export interface GAILSnapshot {
  config: GAILConfig;
  policy: PPOSnapshot;
  discriminator: ReturnType<NeuralNetwork['snapshot']>;
  expertSamples: ImitationDemonstration[];
}

/**
 * Generative Adversarial Imitation Learning.
 *
 * Discriminator `D(s,a)` học phân biệt mẫu chuyên gia (nhãn 1) và mẫu policy
 * (nhãn 0). Policy nhận reward đối kháng `−log(1 − D(s,a))`, khuyến khích hành
 * vi giống chuyên gia. GAIL ở đây hỗ trợ hành động rời rạc qua PPO.
 */
export class GAILTrainer {
  public readonly policy: PPOTrainer;
  public readonly discriminator: NeuralNetwork;
  public readonly actions: readonly string[];

  private readonly config: GAILConfig;
  private readonly random: DeepRandom;
  private readonly rewardScale: number;
  private readonly expertSamples: ImitationDemonstration[] = [];

  constructor(config: GAILConfig) {
    if (config.actions.length === 0) throw new RangeError('GAIL cần ít nhất một hành động');
    this.config = { ...config, actions: [...config.actions] };
    this.actions = [...config.actions];
    this.policy = new PPOTrainer(config);
    this.rewardScale = config.rewardScale ?? 1;
    this.random = new DeepRandom((config.seed ?? 1) + 7);

    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.discriminatorLearningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    this.discriminator = new NeuralNetwork({
      inputSize: config.inputSize + this.actions.length,
      hiddenSizes: config.discriminatorHiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: (config.seed ?? 1) + 2,
    });
  }

  /** Thêm mẫu chuyên gia rời rạc. */
  public addExpertSamples(samples: readonly ImitationDemonstration[]): void {
    for (const sample of samples) {
      if (typeof sample.action !== 'number') {
        throw new TypeError('GAIL chỉ hỗ trợ hành động rời rạc');
      }
      if (sample.action < 0 || sample.action >= this.actions.length) {
        throw new RangeError(`Hành động chuyên gia ${sample.action} ngoài phạm vi`);
      }
      this.expertSamples.push({
        state: [...sample.state],
        action: sample.action,
        weight: sample.weight,
      });
    }
  }

  /** Số mẫu chuyên gia đang có. */
  public get expertCount(): number {
    return this.expertSamples.length;
  }

  /** Xác suất discriminator cho rằng cặp (state, action) là chuyên gia. */
  public expertProbability(state: NumericVector, action: number): number {
    const logit = this.discriminator.predict(this.discriminatorInput(state, action))[0] ?? 0;
    return 1 / (1 + Math.exp(-logit));
  }

  /** Reward đối kháng `−log(1 − D(s,a))`, chặn dưới để tránh log 0. */
  public imitationReward(state: NumericVector, action: number): number {
    const probability = Math.min(0.999, Math.max(0.001, this.expertProbability(state, action)));
    return -Math.log(Math.max(1e-6, 1 - probability));
  }

  /**
   * Một vòng GAIL: cập nhật discriminator trên expert + policy, sau đó dùng
   * reward đối kháng để cập nhật PPO.
   */
  public train(
    rollout: readonly PPORolloutStep[],
    options: { discriminatorSteps?: number; discriminatorBatchSize?: number } = {},
  ): GAILTrainResult {
    if (rollout.length === 0) {
      return {
        policy: {
          policyLoss: 0,
          valueLoss: 0,
          entropy: 0,
          approxKL: 0,
          clipFraction: 0,
          meanReturn: 0,
          epochs: 0,
          samples: 0,
        },
        discriminatorLoss: 0,
        expertAccuracy: 0,
        policyAccuracy: 0,
        meanGAILReward: 0,
      };
    }

    const expertBatch = this.sampleExpert(Math.max(1, Math.floor(options.discriminatorBatchSize ?? 32)));
    const discriminatorResult = this.updateDiscriminator(
      rollout,
      expertBatch,
      Math.max(1, Math.floor(options.discriminatorSteps ?? 1)),
    );

    const augmented: PPORolloutStep[] = rollout.map((step) => ({
      ...step,
      state: [...step.state],
      reward:
        step.reward +
        this.rewardScale * this.imitationReward(step.state, clampActionId(step.action, this.actions.length)),
    }));
    const policyResult = this.policy.train(augmented);
    const meanGAILReward =
      augmented.reduce((sum, step, index) => {
        const base = rollout[index]?.reward ?? 0;
        return sum + (step.reward - base);
      }, 0) / augmented.length;

    return {
      policy: policyResult,
      discriminatorLoss: discriminatorResult.loss,
      expertAccuracy: discriminatorResult.expertAccuracy,
      policyAccuracy: discriminatorResult.policyAccuracy,
      meanGAILReward,
    };
  }

  /** Chọn hành động từ policy PPO. */
  public selectAction(state: NumericVector, explore = true): number {
    return this.policy.selectAction(state, explore);
  }

  /** Ảnh chụp toàn bộ. */
  public snapshot(): GAILSnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      policy: this.policy.snapshot(),
      discriminator: this.discriminator.snapshot(),
      expertSamples: cloneDemonstrations(this.expertSamples),
    };
  }

  /** Khôi phục GAIL. */
  public static fromSnapshot(snapshot: GAILSnapshot): GAILTrainer {
    const trainer = new GAILTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.policy.policy, trainer.policy.policy);
    restoreWeightsFromSnapshot(snapshot.policy.critic, trainer.policy.critic);
    restoreWeightsFromSnapshot(snapshot.discriminator, trainer.discriminator);
    trainer.addExpertSamples(snapshot.expertSamples);
    return trainer;
  }

  /** Một bước cập nhật discriminator. */
  private updateDiscriminator(
    rollout: readonly PPORolloutStep[],
    expertBatch: readonly ImitationDemonstration[],
    steps: number,
  ): { loss: number; expertAccuracy: number; policyAccuracy: number } {
    const gradient = createNetworkGradient(this.discriminator);
    let loss = 0;
    let expertCorrect = 0;
    let policyCorrect = 0;
    let expertCount = 0;
    let policyCount = 0;

    for (let step = 0; step < steps; step++) {
      const policyBatch = sampleArray(rollout, Math.min(32, rollout.length), this.random);
      for (const sample of expertBatch) {
        if (typeof sample.action !== 'number') continue;
        const input = this.discriminatorInput(sample.state, sample.action);
        const logit = this.discriminator.forward(input, true);
        const result = binaryCrossEntropyGradient(logit, [1]);
        loss += result.loss;
        expertCorrect += (logit[0] ?? 0) > 0 ? 1 : 0;
        expertCount++;
        backpropagateNetwork(this.discriminator, result.gradLogits, {
          gradient,
          skipOutputActivation: true,
          apply: false,
        });
      }
      for (const sample of policyBatch) {
        const action = clampActionId(sample.action, this.actions.length);
        const input = this.discriminatorInput(sample.state, action);
        const logit = this.discriminator.forward(input, true);
        const result = binaryCrossEntropyGradient(logit, [0]);
        loss += result.loss;
        policyCorrect += (logit[0] ?? 0) < 0 ? 1 : 0;
        policyCount++;
        backpropagateNetwork(this.discriminator, result.gradLogits, {
          gradient,
          skipOutputActivation: true,
          apply: false,
        });
      }
    }

    const count = expertCount + policyCount;
    applyNetworkGradient(this.discriminator, gradient, {
      optimizer: this.discriminator.optimizer,
      batchSize: Math.max(1, count),
    });
    return {
      loss: count > 0 ? loss / count : 0,
      expertAccuracy: expertCount > 0 ? expertCorrect / expertCount : 0,
      policyAccuracy: policyCount > 0 ? policyCorrect / policyCount : 0,
    };
  }

  /** Lấy mẫu chuyên gia ngẫu nhiên có hoàn lại. */
  private sampleExpert(count: number): ImitationDemonstration[] {
    if (this.expertSamples.length === 0) {
      throw new RangeError('GAIL chưa có mẫu chuyên gia — hãy gọi addExpertSamples');
    }
    const result: ImitationDemonstration[] = [];
    for (let i = 0; i < count; i++) {
      const sample = this.expertSamples[this.random.int(0, this.expertSamples.length - 1)];
      result.push(sample);
    }
    return result;
  }

  /** Nối state với one-hot action. */
  private discriminatorInput(state: NumericVector, action: number): number[] {
    return [...state, ...oneHot(action, this.actions.length)];
  }
}

/** Kẹp action id vào phạm vi hợp lệ. */
function clampActionId(action: number, count: number): number {
  if (!Number.isFinite(action)) return 0;
  return Math.min(count - 1, Math.max(0, Math.floor(action)));
}

/** Lấy mẫu mảng có hoàn lại (dùng RNG tất định). */
function sampleArray<T>(items: readonly T[], count: number, random: DeepRandom): T[] {
  if (items.length === 0) return [];
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(items[random.int(0, items.length - 1)]);
  }
  return result;
}

/** Sao chép mẫu chuyên gia. */
function cloneDemonstrations(
  samples: readonly ImitationDemonstration[],
): ImitationDemonstration[] {
  return samples.map((sample) => ({
    state: [...sample.state],
    action: cloneAction(sample.action),
    weight: sample.weight,
  }));
}

/** Sao chép hành động. */
function cloneAction(action: ImitationAction): ImitationAction {
  return typeof action === 'number' ? action : [...action];
}

