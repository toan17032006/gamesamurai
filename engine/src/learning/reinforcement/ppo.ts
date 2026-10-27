/**
 * @file ppo.ts
 * @module @aetheria/engine/learning/reinforcement/ppo
 * @description Proximal Policy Optimization (PPO) và Advantage Actor-Critic (A2C)
 * cho không gian hành động rời rạc.
 *
 * Cài đặt gồm hai mạng tách biệt:
 * - `policy`: MLP tuyến tính ở đầu ra, logits được đưa qua softmax bên ngoài.
 * - `critic`: MLP dự đoán giá trị trạng thái `V(s)`.
 *
 * Công thức cốt lõi:
 * - GAE: `A_t = δ_t + γλ(1−done_t)A_{t+1}` với `δ_t = r_t + γV(s_{t+1}) − V(s_t)`.
 * - Clipped surrogate: `L = −min(ρA, clip(ρ,1−ε,1+ε)A)`.
 * - Gradient logits của tỉ lệ: `∂ρ/∂z_i = ρ(1[a=i] − π_i)`.
 *
 * Mọi chú thích và thông báo lỗi dùng tiếng Việt theo quy ước dự án.
 */

import { NeuralNetwork, type OptimizerConfig } from '../../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../../deeplearning/random.js';
import {
  applyNetworkGradient,
  argmaxIndex,
  backpropagateNetwork,
  clipNetworkGradient,
  createNetworkGradient,
  logSoftmaxVector,
  softmaxVector,
} from '../network.js';
import type { LearningReport } from '../types.js';

/** Cấu hình PPO/A2C. */
export interface PPOConfig {
  /** Số chiều vector trạng thái. */
  inputSize: number;
  /** Tên hành động rời rạc; chỉ số mảng là action id. */
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  /** Learning rate cho policy. */
  learningRate?: number;
  /** Learning rate cho critic; mặc định bằng policy. */
  criticLearningRate?: number;
  gamma?: number;
  /** Hệ số GAE λ. */
  gaeLambda?: number;
  /** Biên clip tỉ lệ π/π_old. */
  clipRatio?: number;
  /** Hệ số entropy bonus. */
  entropyCoef?: number;
  /** Hệ số loss value. */
  valueCoef?: number;
  /** Số epoch tối ưu lại trên cùng rollout. */
  epochs?: number;
  /** Kích thước mini-batch. */
  miniBatchSize?: number;
  /** Cắt norm gradient; 0 = tắt. */
  gradientClip?: number;
  seed?: number;
}

/** Một bước rollout do agent thu thập. */
export interface PPORolloutStep {
  state: readonly number[];
  action: number;
  reward: number;
  done: boolean;
  /** Giá trị V(s) tại thời điểm thu thập; nếu bỏ trống sẽ tính lại. */
  value?: number;
  /** Log xác suất hành động tại thời điểm thu thập; nếu bỏ trống sẽ tính lại. */
  logProbability?: number;
}

/** Tùy chọn cho một lần cập nhật PPO. */
export interface PPOUpdateOptions {
  epochs?: number;
  miniBatchSize?: number;
  clipRatio?: number;
  entropyCoef?: number;
  valueCoef?: number;
  gradientClip?: number;
  /** Chuẩn hóa advantage theo batch (mặc định bật). */
  normalizeAdvantage?: boolean;
}

/** Kết quả một lần cập nhật PPO. */
export interface PPOTrainResult {
  policyLoss: number;
  valueLoss: number;
  entropy: number;
  /** Xấp xỉ KL giữa policy cũ và mới. */
  approxKL: number;
  /** Tỉ lệ mẫu bị clip. */
  clipFraction: number;
  meanReturn: number;
  epochs: number;
  samples: number;
}

/** Hành động kèm thông tin suy luận. */
export interface PPOActionDecision {
  action: number;
  probability: number;
  logProbability: number;
  value: number;
  probabilities: number[];
}

/** Ảnh chụp PPO để lưu checkpoint. */
export interface PPOSnapshot {
  config: PPOConfig;
  policy: ReturnType<NeuralNetwork['snapshot']>;
  critic: ReturnType<NeuralNetwork['snapshot']>;
}

/** Dữ liệu đã chuẩn bị cho tối ưu. */
interface PreparedRollout {
  state: readonly number[];
  action: number;
  oldLogProbability: number;
  advantage: number;
  returnValue: number;
  value: number;
}

/**
 * PPO rời rạc với GAE và clipped objective.
 *
 * Agent có thể dùng trực tiếp trong vòng lặp game:
 * 1. `decide(state)` để chọn hành động và lưu lại `logProbability/value`.
 * 2. Ghi phần thưởng rồi gọi `train(rollout)` khi kết thúc episode.
 */
export class PPOTrainer {
  public readonly actions: readonly string[];
  public readonly policy: NeuralNetwork;
  public readonly critic: NeuralNetwork;
  public readonly gamma: number;
  public readonly gaeLambda: number;
  public readonly clipRatio: number;
  public readonly entropyCoef: number;
  public readonly valueCoef: number;
  public readonly epochs: number;
  public readonly miniBatchSize: number;

  private readonly config: PPOConfig;
  private readonly random: DeepRandom;
  private readonly gradientClip: number;

  constructor(config: PPOConfig) {
    if (config.inputSize <= 0) throw new RangeError('PPO cần inputSize dương');
    if (config.actions.length === 0) throw new RangeError('PPO cần ít nhất một hành động');

    this.config = { ...config, actions: [...config.actions] };
    this.actions = [...config.actions];
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.gaeLambda = clampRange(config.gaeLambda ?? 0.95, 0, 1);
    this.clipRatio = clampRange(config.clipRatio ?? 0.2, 0, 1);
    this.entropyCoef = Math.max(0, config.entropyCoef ?? 0.01);
    this.valueCoef = Math.max(0, config.valueCoef ?? 0.5);
    this.epochs = Math.max(1, Math.floor(config.epochs ?? 4));
    this.miniBatchSize = Math.max(1, Math.floor(config.miniBatchSize ?? 32));
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.random = new DeepRandom(config.seed ?? 1);

    const hiddenSizes = config.hiddenSizes ?? [64, 64];
    const policyOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.0003,
      weightDecay: 0.0001,
    };
    const criticOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.criticLearningRate ?? config.learningRate ?? 0.001,
      weightDecay: 0.0001,
    };

    this.policy = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes,
      outputSize: this.actions.length,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: policyOptimizer,
      seed: config.seed ?? 1,
    });
    this.critic = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes,
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: criticOptimizer,
      seed: (config.seed ?? 1) + 1,
    });
  }

  /** Xác suất hành động hiện tại. */
  public probabilities(state: readonly number[]): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Giá trị trạng thái `V(s)`. */
  public value(state: readonly number[]): number {
    return this.critic.predict(state)[0] ?? 0;
  }

  /** Chọn hành động (epsilon-free) theo phân phối hoặc tham lam. */
  public selectAction(state: readonly number[], explore = true): number {
    const probabilities = this.probabilities(state);
    if (!explore) return argmaxIndex(probabilities);
    return sampleCategorical(probabilities, this.random);
  }

  /** Chọn hành động kèm log-probability và value để lưu vào rollout. */
  public decide(state: readonly number[], explore = true): PPOActionDecision {
    const logits = this.policy.predict(state);
    const logProbabilities = logSoftmaxVector(logits);
    const probabilities = softmaxVector(logits);
    const action = explore
      ? sampleCategorical(probabilities, this.random)
      : argmaxIndex(probabilities);
    return {
      action,
      probability: probabilities[action] ?? 0,
      logProbability: logProbabilities[action] ?? Math.log(1e-12),
      value: this.critic.predict(state)[0] ?? 0,
      probabilities,
    };
  }

  /**
   * Cập nhật policy/critic từ một rollout hoàn chỉnh.
   *
   * `rollout` phải theo thứ tự thời gian; `done` đánh dấu ranh giới episode để
   * GAE không bootstrap qua trạng thái kết thúc.
   */
  public train(
    rollout: readonly PPORolloutStep[],
    options: PPOUpdateOptions = {},
  ): PPOTrainResult {
    if (rollout.length === 0) {
      return {
        policyLoss: 0,
        valueLoss: 0,
        entropy: 0,
        approxKL: 0,
        clipFraction: 0,
        meanReturn: 0,
        epochs: 0,
        samples: 0,
      };
    }

    const prepared = this.prepareRollout(rollout, options.normalizeAdvantage !== false);
    const epochs = Math.max(1, Math.floor(options.epochs ?? this.epochs));
    const miniBatchSize = Math.max(1, Math.floor(options.miniBatchSize ?? this.miniBatchSize));
    const clipRatio = clampRange(options.clipRatio ?? this.clipRatio, 0, 1);
    const entropyCoef = Math.max(0, options.entropyCoef ?? this.entropyCoef);
    const valueCoef = Math.max(0, options.valueCoef ?? this.valueCoef);
    const gradientClip = Math.max(0, options.gradientClip ?? this.gradientClip);
    const order = Array.from({ length: prepared.length }, (_, index) => index);

    let policyLossTotal = 0;
    let valueLossTotal = 0;
    let entropyTotal = 0;
    let approxKLTotal = 0;
    let clipFractionTotal = 0;
    let updates = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      this.random.shuffle(order);
      for (let start = 0; start < order.length; start += miniBatchSize) {
        const indices = order.slice(start, start + miniBatchSize);
        const actorGradient = createNetworkGradient(this.policy);
        const criticGradient = createNetworkGradient(this.critic);
        let batchPolicyLoss = 0;
        let batchValueLoss = 0;
        let batchEntropy = 0;
        let batchKL = 0;
        let clipped = 0;

        for (const index of indices) {
          const item = prepared[index];
          const logits = this.policy.forward(item.state, true);
          const logProbabilities = logSoftmaxVector(logits);
          const probabilities = softmaxVector(logits);
          const newLogProbability = logProbabilities[item.action] ?? Math.log(1e-12);
          const ratio = Math.exp(clampRange(newLogProbability - item.oldLogProbability, -20, 20));
          const surrogateUnclipped = ratio * item.advantage;
          const clippedRatio = clampRange(ratio, 1 - clipRatio, 1 + clipRatio);
          const surrogateClipped = clippedRatio * item.advantage;

          // Chọn nhánh min; chỉ nhánh chưa bị clip mới có gradient theo ratio.
          const useUnclipped = surrogateUnclipped <= surrogateClipped;
          const gradientActive = useUnclipped || ratio === clippedRatio;
          const entropy = categoricalEntropy(probabilities);
          const policyLoss = -Math.min(surrogateUnclipped, surrogateClipped);
          batchPolicyLoss += policyLoss;
          batchEntropy += entropy;
          batchKL += item.oldLogProbability - newLogProbability;
          if (!useUnclipped && ratio !== clippedRatio) clipped++;

          const gradLogits = new Array<number>(probabilities.length).fill(0);
          if (gradientActive) {
            const coefficient = -item.advantage * ratio;
            for (let action = 0; action < gradLogits.length; action++) {
              const indicator = action === item.action ? 1 : 0;
              gradLogits[action] += coefficient * (indicator - probabilities[action]);
            }
          }
          // Tối đa hóa entropy: dH/dz_i = −p_i(log p_i + H); loss −βH nên cộng β·dH.
          for (let action = 0; action < gradLogits.length; action++) {
            gradLogits[action] += entropyCoef * probabilities[action] * (logProbabilities[action] + entropy);
          }

          backpropagateNetwork(this.policy, gradLogits, {
            gradient: actorGradient,
            skipOutputActivation: true,
            apply: false,
          });

          const predictedValue = this.critic.forward(item.state, true)[0] ?? 0;
          const valueError = predictedValue - item.returnValue;
          batchValueLoss += valueError * valueError;
          const gradValue = [2 * valueError * valueCoef];
          backpropagateNetwork(this.critic, gradValue, {
            gradient: criticGradient,
            apply: false,
          });
        }

        applyGradient(this.policy, actorGradient, indices.length, gradientClip);
        applyGradient(this.critic, criticGradient, indices.length, gradientClip);

        policyLossTotal += batchPolicyLoss / indices.length;
        valueLossTotal += batchValueLoss / indices.length;
        entropyTotal += batchEntropy / indices.length;
        approxKLTotal += batchKL / indices.length;
        clipFractionTotal += clipped / indices.length;
        updates++;
      }
    }

    const meanReturn =
      prepared.reduce((sum, item) => sum + item.returnValue, 0) / prepared.length;

    return {
      policyLoss: safeAverage(policyLossTotal, updates),
      valueLoss: safeAverage(valueLossTotal, updates),
      entropy: safeAverage(entropyTotal, updates),
      approxKL: safeAverage(approxKLTotal, updates),
      clipFraction: safeAverage(clipFractionTotal, updates),
      meanReturn,
      epochs,
      samples: prepared.length,
    };
  }

  /** Bao kết quả PPO thành `LearningReport` để telemetry dùng chung. */
  public trainReport(
    rollout: readonly PPORolloutStep[],
    options: PPOUpdateOptions = {},
  ): LearningReport {
    const startedAt = Date.now();
    const result = this.train(rollout, options);
    const meanReturn = result.meanReturn;
    return {
      epochs: result.epochs,
      steps: result.samples,
      samples: result.samples,
      initialLoss: meanReturn,
      finalLoss: result.policyLoss,
      bestLoss: result.policyLoss,
      lossHistory: [result.policyLoss],
      metrics: {
        valueLoss: result.valueLoss,
        entropy: result.entropy,
        approxKL: result.approxKL,
        clipFraction: result.clipFraction,
        meanReturn,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): PPOSnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      policy: this.policy.snapshot(),
      critic: this.critic.snapshot(),
    };
  }

  /** Khôi phục PPO từ checkpoint. */
  public static fromSnapshot(snapshot: PPOSnapshot): PPOTrainer {
    const trainer = new PPOTrainer(snapshot.config);
    copySnapshot(snapshot.policy, trainer.policy);
    copySnapshot(snapshot.critic, trainer.critic);
    return trainer;
  }

  /** Tính GAE, return và các giá trị cũ cho từng bước. */
  private prepareRollout(
    rollout: readonly PPORolloutStep[],
    normalizeAdvantage: boolean,
  ): PreparedRollout[] {
    const values = rollout.map((step) => step.value ?? this.value(step.state));
    const oldLogProbabilities = rollout.map((step) => {
      if (step.logProbability !== undefined) return step.logProbability;
      const logits = this.policy.predict(step.state);
      return logSoftmaxVector(logits)[step.action] ?? Math.log(1e-12);
    });

    const advantages = new Array<number>(rollout.length).fill(0);
    let nextValue = 0;
    let runningAdvantage = 0;
    for (let i = rollout.length - 1; i >= 0; i--) {
      const step = rollout[i];
      const notDone = step.done ? 0 : 1;
      const delta = step.reward + this.gamma * nextValue * notDone - values[i];
      runningAdvantage = delta + this.gamma * this.gaeLambda * notDone * runningAdvantage;
      advantages[i] = runningAdvantage;
      nextValue = values[i];
    }

    if (normalizeAdvantage && advantages.length > 1) {
      const mean = advantages.reduce((sum, value) => sum + value, 0) / advantages.length;
      const variance =
        advantages.reduce((sum, value) => sum + (value - mean) ** 2, 0) / advantages.length;
      const std = Math.sqrt(variance) || 1;
      for (let i = 0; i < advantages.length; i++) advantages[i] = (advantages[i] - mean) / std;
    }

    return rollout.map((step, index) => ({
      state: step.state,
      action: clampRange(step.action, 0, this.actions.length - 1),
      oldLogProbability: oldLogProbabilities[index],
      advantage: advantages[index],
      returnValue: advantages[index] + values[index],
      value: values[index],
    }));
  }
}

/**
 * A2C là PPO một epoch, không clip tỉ lệ.
 *
 * Lớp kế thừa chỉ đổi mặc định cấu hình; toàn bộ GAE/actor-critic dùng chung.
 */
export class A2CTrainer extends PPOTrainer {
  constructor(config: PPOConfig) {
    super({
      ...config,
      epochs: 1,
      clipRatio: 1,
      gaeLambda: config.gaeLambda ?? 1,
    });
  }
}

/** Lấy mẫu phân phối rời rạc bằng biến đổi nghịch đảo. */
export function sampleCategorical(
  probabilities: readonly number[],
  random: DeepRandom = new DeepRandom(1),
): number {
  if (probabilities.length === 0) throw new RangeError('Không thể lấy mẫu từ phân phối rỗng');
  const roll = random.next();
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (roll <= cumulative) return i;
  }
  return probabilities.length - 1;
}

/** Entropy Shannon của phân phối xác suất. */
export function categoricalEntropy(probabilities: readonly number[]): number {
  let entropy = 0;
  for (const probability of probabilities) {
    if (probability > 0) entropy -= probability * Math.log(probability);
  }
  return entropy;
}

/** Áp gradient và cắt norm nếu cần. */
function applyGradient(
  network: NeuralNetwork,
  gradient: ReturnType<typeof createNetworkGradient>,
  batchSize: number,
  clipNorm: number,
): void {
  if (clipNorm > 0) clipNetworkGradient(gradient, clipNorm);
  applyNetworkGradient(network, gradient, {
    optimizer: network.optimizer,
    batchSize,
  });
}

/** Trung bình an toàn khi chưa có cập nhật nào. */
function safeAverage(total: number, count: number): number {
  return count > 0 ? total / count : 0;
}

/** Ghi đè trọng số từ snapshot. */
function copySnapshot(
  snapshot: ReturnType<NeuralNetwork['snapshot']>,
  target: NeuralNetwork,
): void {
  for (let l = 0; l < target.layers.length; l++) {
    const saved = snapshot.layers[l];
    const layer = target.layers[l];
    if (!saved) continue;
    for (let o = 0; o < layer.outputSize; o++) {
      layer.biases[o] = saved.biases[o] ?? 0;
      for (let i = 0; i < layer.inputSize; i++) {
        layer.weights[o][i] = saved.weights[o]?.[i] ?? 0;
      }
    }
  }
}
