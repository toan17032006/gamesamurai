/**
 * @file policy-gradient.ts
 * @module @aetheria/engine/learning/reinforcement/policy-gradient
 * @description Họ policy gradient chuẩn cho agent game, bổ sung cạnh PPO/A2C:
 *
 * - `REINFORCETrainer`: vanilla policy gradient (Williams 1992) với baseline
 *   mạng value tùy chọn, return Monte-Carlo và entropy bonus.
 * - `TRPOTrainer`: Trust Region Policy Optimization (Schulman 2015) — gradient
 *   surrogate nhân với nghịch đảo Fisher bằng Conjugate Gradient, bước cập nhật
 *   giới hạn bởi ràng buộc KL và line search backtracking.
 *
 * Cả hai dùng chung giao diện rollout với `PPORolloutStep` nhờ đó agent có thể
 * hoán đổi thuật toán mà không đổi vòng lặp thu thập dữ liệu.
 *
 * Gradient theo logits của log π(a|s): `∂logπ(a)/∂z_j = δ_ja − π_j`.
 * Mọi chú thích dùng tiếng Việt theo quy ước dự án.
 */

import { NeuralNetwork, type OptimizerConfig } from '../../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../../deeplearning/random.js';
import {
  applyNetworkGradient,
  applyNetworkParameters,
  argmaxIndex,
  backpropagateNetwork,
  clipNetworkGradient,
  createNetworkGradient,
  flattenNetworkParameters,
  logSoftmaxVector,
  networkParameterCount,
  softmaxVector,
  type NetworkGradient,
} from '../network.js';
import type { LearningReport } from '../types.js';
import { categoricalEntropy, sampleCategorical, type PPORolloutStep } from './ppo.js';
import { restoreWeightsFromSnapshot } from '../internal.js';

// ---------------------------------------------------------------------------
// Hạ tầng dùng chung: policy + value network
// ---------------------------------------------------------------------------

/** Cấu hình chung policy gradient rời rạc. */
export interface PolicyGradientConfig {
  /** Số chiều vector trạng thái. */
  inputSize: number;
  /** Tên hành động rời rạc; chỉ số mảng là action id. */
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  /** Learning rate cho policy (TRPO: dùng làm hệ số nhân hướng tự nhiên). */
  learningRate?: number;
  /** Learning rate cho value baseline. */
  criticLearningRate?: number;
  gamma?: number;
  /** Hệ số entropy bonus để khuyến khích thăm dò. */
  entropyCoef?: number;
  /** Cắt norm gradient; 0 = tắt. */
  gradientClip?: number;
  seed?: number;
}

/** Quyết định hành động kèm log-probability và value. */
export interface PolicyGradientDecision {
  action: number;
  probability: number;
  logProbability: number;
  value: number;
  probabilities: number[];
}

/** Kết quả chung một lần cập nhật policy gradient. */
export interface PolicyGradientTrainResult {
  policyLoss: number;
  valueLoss: number;
  entropy: number;
  meanReturn: number;
  samples: number;
}

/** Dựng cặp policy/value network dùng chung cho REINFORCE và TRPO. */
function buildActorCritic(
  config: PolicyGradientConfig,
  policyLearningRate: number,
): { policy: NeuralNetwork; critic: NeuralNetwork } {
  const hiddenSizes = config.hiddenSizes ?? [64, 64];
  const policyOptimizer: Partial<OptimizerConfig> = {
    kind: 'adam',
    learningRate: policyLearningRate,
    weightDecay: 0.0001,
  };
  const criticOptimizer: Partial<OptimizerConfig> = {
    kind: 'adam',
    learningRate: config.criticLearningRate ?? config.learningRate ?? 0.001,
    weightDecay: 0.0001,
  };
  const policy = new NeuralNetwork({
    inputSize: config.inputSize,
    hiddenSizes,
    outputSize: config.actions.length,
    hiddenActivation: 'tanh',
    outputActivation: 'linear',
    optimizer: policyOptimizer,
    seed: config.seed ?? 1,
  });
  const critic = new NeuralNetwork({
    inputSize: config.inputSize,
    hiddenSizes,
    outputSize: 1,
    hiddenActivation: 'tanh',
    outputActivation: 'linear',
    optimizer: criticOptimizer,
    seed: (config.seed ?? 1) + 1,
  });
  return { policy, critic };
}

/** Áp gradient đã tích lũy vào mạng (có cắt norm). */
function applyGradient(
  network: NeuralNetwork,
  gradient: NetworkGradient,
  batchSize: number,
  clipNorm: number,
): void {
  if (clipNorm > 0) clipNetworkGradient(gradient, clipNorm);
  applyNetworkGradient(network, gradient, {
    optimizer: network.optimizer,
    batchSize,
  });
}


/** Tính return Monte-Carlo theo rollout; ranh giới `done` reset tích lũy. */
function computeMonteCarloReturns(
  rollout: readonly PPORolloutStep[],
  gamma: number,
): number[] {
  const returns = new Array<number>(rollout.length).fill(0);
  let running = 0;
  for (let i = rollout.length - 1; i >= 0; i--) {
    const step = rollout[i];
    running = step.reward + gamma * (step.done ? 0 : running);
    returns[i] = running;
  }
  return returns;
}

// ---------------------------------------------------------------------------
// REINFORCE
// ---------------------------------------------------------------------------

/** Ảnh chụp REINFORCE để lưu checkpoint. */
export interface REINFORCESnapshot {
  config: PolicyGradientConfig & { useBaseline: boolean };
  policy: ReturnType<NeuralNetwork['snapshot']>;
  baseline: ReturnType<NeuralNetwork['snapshot']> | null;
}

/**
 * Vanilla Policy Gradient (REINFORCE) có baseline.
 *
 * Loss policy: `−(G_t − b(s))·log π(a|s)`; gradient theo logits của từng mẫu là
 * `(G_t − b(s))·(δ_a − π)`. Baseline có thể là giá trị trung bình trượt hoặc
 * mạng value học bằng MSE trên return Monte-Carlo.
 */
export class REINFORCETrainer {
  public readonly actions: readonly string[];
  public readonly policy: NeuralNetwork;
  public readonly useBaseline: boolean;
  public readonly baseline: NeuralNetwork | null;
  public readonly gamma: number;
  public readonly entropyCoef: number;

  private readonly config: PolicyGradientConfig & { useBaseline: boolean };
  private readonly random: DeepRandom;
  private readonly gradientClip: number;
  private readonly baselineLearningRate: number;
  private runningMeanReturn = 0;

  constructor(config: PolicyGradientConfig & { useBaseline?: boolean }) {
    if (config.inputSize <= 0) throw new RangeError('REINFORCE cần inputSize dương');
    if (config.actions.length === 0) throw new RangeError('REINFORCE cần ít nhất một hành động');
    const useBaseline = config.useBaseline ?? true;
    this.config = { ...config, actions: [...config.actions], useBaseline };
    this.actions = [...config.actions];
    this.useBaseline = useBaseline;
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.entropyCoef = Math.max(0, config.entropyCoef ?? 0.01);
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.baselineLearningRate = config.criticLearningRate ?? 0.001;
    this.random = new DeepRandom(config.seed ?? 1);
    const { policy, critic } = buildActorCritic(config, config.learningRate ?? 0.0005);
    this.policy = policy;
    this.baseline = useBaseline ? critic : null;
  }

  /** Xác suất hành động hiện tại. */
  public probabilities(state: readonly number[]): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Value baseline hiện tại; trả trung bình trượt nếu tắt baseline mạng. */
  public baselineValue(state: readonly number[]): number {
    if (this.baseline) return this.baseline.predict(state)[0] ?? 0;
    return this.runningMeanReturn;
  }

  /** Chọn hành động theo phân phối (hoặc tham lam khi `explore = false`). */
  public selectAction(state: readonly number[], explore = true): number {
    const probabilities = this.probabilities(state);
    return explore ? sampleCategorical(probabilities, this.random) : argmaxIndex(probabilities);
  }

  /** Chọn hành động kèm log-probability để lưu vào rollout. */
  public decide(state: readonly number[], explore = true): PolicyGradientDecision {
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
      value: this.baselineValue(state),
      probabilities,
    };
  }

  /**
   * Cập nhật policy từ rollout Monte-Carlo.
   *
   * Rollout phải theo thứ tự thời gian; `done` đánh dấu ranh giới episode.
   */
  public train(rollout: readonly PPORolloutStep[]): PolicyGradientTrainResult {
    if (rollout.length === 0) {
      return { policyLoss: 0, valueLoss: 0, entropy: 0, meanReturn: 0, samples: 0 };
    }
    const returns = computeMonteCarloReturns(rollout, this.gamma);
    const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    // Trung bình trượt dùng làm baseline đơn giản khi tắt mạng value.
    this.runningMeanReturn = 0.95 * this.runningMeanReturn + 0.05 * meanReturn;

    const policyGradient = createNetworkGradient(this.policy);
    const baselineGradient = this.baseline ? createNetworkGradient(this.baseline) : null;
    let policyLossTotal = 0;
    let valueLossTotal = 0;
    let entropyTotal = 0;

    for (let i = 0; i < rollout.length; i++) {
      const step = rollout[i];
      const logits = this.policy.forward(step.state, true);
      const logProbabilities = logSoftmaxVector(logits);
      const probabilities = softmaxVector(logits);
      const entropy = categoricalEntropy(probabilities);
      const baseline = this.baselineValue(step.state);
      const advantage = returns[i] - baseline;

      policyLossTotal += -advantage * (logProbabilities[step.action] ?? Math.log(1e-12));
      entropyTotal += entropy;

      const gradLogits = new Array<number>(probabilities.length).fill(0);
      for (let action = 0; action < gradLogits.length; action++) {
        const indicator = action === clampRange(step.action, 0, this.actions.length - 1) ? 1 : 0;
        gradLogits[action] += -advantage * (indicator - probabilities[action]);
        // Tối đa hóa entropy: cộng gradient dH/dz vào loss −βH.
        gradLogits[action] += this.entropyCoef * probabilities[action] * (logProbabilities[action] + entropy);
      }
      backpropagateNetwork(this.policy, gradLogits, {
        gradient: policyGradient,
        skipOutputActivation: true,
        apply: false,
      });

      if (this.baseline && baselineGradient) {
        const predicted = this.baseline.forward(step.state, true)[0] ?? 0;
        const valueError = predicted - returns[i];
        valueLossTotal += valueError * valueError;
        backpropagateNetwork(this.baseline, [2 * valueError], {
          gradient: baselineGradient,
          apply: false,
        });
      }
    }

    applyGradient(this.policy, policyGradient, rollout.length, this.gradientClip);
    if (this.baseline && baselineGradient) {
      applyGradient(this.baseline, baselineGradient, rollout.length, this.gradientClip);
    }

    return {
      policyLoss: policyLossTotal / rollout.length,
      valueLoss: valueLossTotal / rollout.length,
      entropy: entropyTotal / rollout.length,
      meanReturn,
      samples: rollout.length,
    };
  }

  /** Bọc kết quả thành `LearningReport` cho telemetry dùng chung. */
  public trainReport(rollout: readonly PPORolloutStep[]): LearningReport {
    const startedAt = Date.now();
    const result = this.train(rollout);
    return {
      epochs: 1,
      steps: result.samples,
      samples: result.samples,
      initialLoss: result.policyLoss,
      finalLoss: result.policyLoss,
      bestLoss: result.policyLoss,
      lossHistory: [result.policyLoss],
      metrics: {
        valueLoss: result.valueLoss,
        entropy: result.entropy,
        meanReturn: result.meanReturn,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): REINFORCESnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      policy: this.policy.snapshot(),
      baseline: this.baseline ? this.baseline.snapshot() : null,
    };
  }

  /** Khôi phục REINFORCE từ checkpoint. */
  public static fromSnapshot(snapshot: REINFORCESnapshot): REINFORCETrainer {
    const trainer = new REINFORCETrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    if (trainer.baseline && snapshot.baseline) {
      restoreWeightsFromSnapshot(snapshot.baseline, trainer.baseline);
    }
    return trainer;
  }
}

// ---------------------------------------------------------------------------
// TRPO
// ---------------------------------------------------------------------------

/** Cấu hình TRPO. */
export interface TRPOConfig extends PolicyGradientConfig {
  /** Hệ số suy giảm (damping) của ma trận Fisher khi giải hệ tuyến tính. */
  damping?: number;
  /** Số vòng lặp Conjugate Gradient tối đa. */
  cgIterations?: number;
  /** Ràng buộc KL tối đa (δ) cho một bước cập nhật. */
  maxKL?: number;
  /** Hệ số backtracking của line search (candidate = β^k·step). */
  backtrackCoef?: number;
  /** Số lần backtracking tối đa. */
  maxBacktracks?: number;
  /** Hệ số GAE λ. */
  gaeLambda?: number;
  /** Hệ số loss value. */
  valueCoef?: number;
}

/** Kết quả một lần cập nhật TRPO. */
export interface TRPOTrainResult {
  policyLoss: number;
  valueLoss: number;
  entropy: number;
  /** KL trung bình giữa policy cũ và policy sau cập nhật. */
  approxKL: number;
  /** Số bước backtracking đã dùng; −1 nếu line search thất bại hoàn toàn. */
  backtracks: number;
  /** Surrogate objective trước và sau cập nhật. */
  surrogateBefore: number;
  surrogateAfter: number;
  meanReturn: number;
  samples: number;
}

/** Ảnh chụp TRPO để lưu checkpoint. */
export interface TRPOSnapshot {
  config: TRPOConfig;
  policy: ReturnType<NeuralNetwork['snapshot']>;
  critic: ReturnType<NeuralNetwork['snapshot']>;
}

/** Một mẫu đã chuẩn bị cho tối ưu TRPO. */
interface TRPOSample {
  state: readonly number[];
  action: number;
  oldLogProbability: number;
  advantage: number;
  returnValue: number;
}

/**
 * Trust Region Policy Optimization rời rạc.
 *
 * Quy trình mỗi lần `train`:
 * 1. Tính GAE advantage (giống PPO).
 * 2. Gradient surrogate `g = mean(A·∇logπ)` trong không gian tham số phẳng.
 * 3. Giải `F·x = g` bằng Conjugate Gradient với tích Fisher–vector
 *    `Fv = mean((∇logπ·v)·∇logπ) + damping·v` (estimator Gauss–Newton).
 * 4. Hướng tự nhiên `s = x·sqrt(2δ/(xᵀFx))` thỏa xấp xỉ ràng buộc KL.
 * 5. Line search backtracking: chấp nhận candidate đầu tiên có KL ≤ δ và
 *    surrogate cải thiện; nếu thất bại giữ nguyên tham số.
 */
export class TRPOTrainer {
  public readonly actions: readonly string[];
  public readonly policy: NeuralNetwork;
  public readonly critic: NeuralNetwork;
  public readonly gamma: number;
  public readonly gaeLambda: number;
  public readonly maxKL: number;
  public readonly damping: number;
  public readonly cgIterations: number;
  public readonly entropyCoef: number;
  public readonly valueCoef: number;

  private readonly config: TRPOConfig;
  private readonly random: DeepRandom;
  private readonly gradientClip: number;
  private readonly backtrackCoef: number;
  private readonly maxBacktracks: number;

  constructor(config: TRPOConfig) {
    if (config.inputSize <= 0) throw new RangeError('TRPO cần inputSize dương');
    if (config.actions.length === 0) throw new RangeError('TRPO cần ít nhất một hành động');
    this.config = { ...config, actions: [...config.actions] };
    this.actions = [...config.actions];
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.gaeLambda = clampRange(config.gaeLambda ?? 0.95, 0, 1);
    this.maxKL = Math.max(1e-6, config.maxKL ?? 0.01);
    this.damping = Math.max(0, config.damping ?? 0.1);
    this.cgIterations = Math.max(1, Math.floor(config.cgIterations ?? 10));
    this.entropyCoef = Math.max(0, config.entropyCoef ?? 0);
    this.valueCoef = Math.max(0, config.valueCoef ?? 0.5);
    this.gradientClip = Math.max(0, config.gradientClip ?? 0);
    this.backtrackCoef = clampRange(config.backtrackCoef ?? 0.8, 0.1, 1);
    this.maxBacktracks = Math.max(0, Math.floor(config.maxBacktracks ?? 10));
    this.random = new DeepRandom(config.seed ?? 1);
    const { policy, critic } = buildActorCritic(config, config.learningRate ?? 0.01);
    this.policy = policy;
    this.critic = critic;
  }

  /** Xác suất hành động hiện tại. */
  public probabilities(state: readonly number[]): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Giá trị trạng thái `V(s)`. */
  public value(state: readonly number[]): number {
    return this.critic.predict(state)[0] ?? 0;
  }

  /** Chọn hành động (epsilon-free). */
  public selectAction(state: readonly number[], explore = true): number {
    const probabilities = this.probabilities(state);
    return explore ? sampleCategorical(probabilities, this.random) : argmaxIndex(probabilities);
  }

  /** Chọn hành động kèm log-probability và value để lưu rollout. */
  public decide(state: readonly number[], explore = true): PolicyGradientDecision {
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
   * Cập nhật policy/critic từ một rollout hoàn chỉnh (theo thứ tự thời gian).
   */
  public train(rollout: readonly PPORolloutStep[]): TRPOTrainResult {
    if (rollout.length === 0) {
      return {
        policyLoss: 0,
        valueLoss: 0,
        entropy: 0,
        approxKL: 0,
        backtracks: -1,
        surrogateBefore: 0,
        surrogateAfter: 0,
        meanReturn: 0,
        samples: 0,
      };
    }

    const samples = this.prepareRollout(rollout);
    const meanReturn = samples.reduce((sum, item) => sum + item.returnValue, 0) / samples.length;

    // Bước critic: MSE trên return (tách khỏi policy update).
    let valueLossTotal = 0;
    const criticGradient = createNetworkGradient(this.critic);
    for (const sample of samples) {
      const predicted = this.critic.forward(sample.state, true)[0] ?? 0;
      const valueError = predicted - sample.returnValue;
      valueLossTotal += valueError * valueError;
      backpropagateNetwork(this.critic, [2 * valueError * this.valueCoef], {
        gradient: criticGradient,
        apply: false,
      });
    }
    applyGradient(this.critic, criticGradient, samples.length, this.gradientClip);

    // Gradient surrogate trong không gian tham số phẳng.
    const parameterCount = networkParameterCount(this.policy);
    const surrogateGradient = new Array<number>(parameterCount).fill(0);
    for (const sample of samples) {
      const gradient = this.logProbabilityParameterGradient(sample.state, sample.action);
      for (let p = 0; p < parameterCount; p++) {
        surrogateGradient[p] += (sample.advantage * gradient[p]) / samples.length;
      }
    }
    const surrogateBefore = samples.reduce(
      (sum, sample) => sum + sample.advantage * (this.policyLogProbability(sample.state, sample.action) - sample.oldLogProbability),
      0,
    ) / samples.length;

    // Hướng tự nhiên bằng CG.
    const direction = this.solveNaturalGradient(surrogateGradient, samples);
    const quadrant = this.fisherQuadratic(direction, samples);
    let stepScale = 0;
    if (quadrant > 0) {
      stepScale = Math.sqrt((2 * this.maxKL) / quadrant);
    }

    // Line search backtracking trên tham số.
    const originalParameters = flattenNetworkParameters(this.policy);
    let accepted = false;
    let backtracks = -1;
    let approxKL = 0;
    let surrogateAfter = surrogateBefore;
    let policyLossTotal = 0;
    let entropyTotal = 0;

    if (stepScale > 0) {
      for (let attempt = 0; attempt <= this.maxBacktracks; attempt++) {
        backtracks = attempt;
        const coefficient = Math.pow(this.backtrackCoef, attempt) * stepScale;
        const candidate = originalParameters.map(
          (value, index) => value + coefficient * direction[index],
        );
        applyNetworkParameters(this.policy, candidate);

        let kl = 0;
        let surrogate = 0;
        let policyLoss = 0;
        let entropy = 0;
        for (const sample of samples) {
          const logits = this.policy.predict(sample.state);
          const logProbabilities = logSoftmaxVector(logits);
          const newLogProbability = logProbabilities[sample.action] ?? Math.log(1e-12);
          const probabilities = softmaxVector(logits);
          kl += sample.oldLogProbability - newLogProbability;
          surrogate += sample.advantage * (newLogProbability - sample.oldLogProbability);
          policyLoss += -sample.advantage * newLogProbability;
          entropy += categoricalEntropy(probabilities);
        }
        kl /= samples.length;
        surrogate /= samples.length;
        policyLoss /= samples.length;
        entropy /= samples.length;

        if (kl <= this.maxKL && surrogate >= surrogateBefore) {
          accepted = true;
          approxKL = kl;
          surrogateAfter = surrogate;
          policyLossTotal = policyLoss;
          entropyTotal = entropy;
          break;
        }
        applyNetworkParameters(this.policy, originalParameters);
      }
    }

    return {
      policyLoss: policyLossTotal,
      valueLoss: valueLossTotal / samples.length,
      entropy: entropyTotal,
      approxKL,
      backtracks: accepted ? backtracks : -1,
      surrogateBefore,
      surrogateAfter,
      meanReturn,
      samples: samples.length,
    };
  }

  /** Bọc kết quả thành `LearningReport` cho telemetry dùng chung. */
  public trainReport(rollout: readonly PPORolloutStep[]): LearningReport {
    const startedAt = Date.now();
    const result = this.train(rollout);
    return {
      epochs: 1,
      steps: result.samples,
      samples: result.samples,
      initialLoss: result.surrogateBefore,
      finalLoss: -result.surrogateAfter,
      bestLoss: -result.surrogateAfter,
      lossHistory: [-result.surrogateAfter],
      metrics: {
        valueLoss: result.valueLoss,
        entropy: result.entropy,
        approxKL: result.approxKL,
        backtracks: result.backtracks,
        meanReturn: result.meanReturn,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): TRPOSnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      policy: this.policy.snapshot(),
      critic: this.critic.snapshot(),
    };
  }

  /** Khôi phục TRPO từ checkpoint. */
  public static fromSnapshot(snapshot: TRPOSnapshot): TRPOTrainer {
    const trainer = new TRPOTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    restoreWeightsFromSnapshot(snapshot.critic, trainer.critic);
    return trainer;
  }

  /** Tính GAE advantage (chuẩn PPO) và return tương ứng. */
  private prepareRollout(rollout: readonly PPORolloutStep[]): TRPOSample[] {
    const values = rollout.map((step) => step.value ?? this.value(step.state));
    const oldLogProbabilities = rollout.map((step) => {
      if (step.logProbability !== undefined) return step.logProbability;
      return this.policyLogProbability(step.state, step.action);
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

    return rollout.map((step, index) => ({
      state: step.state,
      action: clampRange(step.action, 0, this.actions.length - 1),
      oldLogProbability: oldLogProbabilities[index],
      advantage: advantages[index],
      returnValue: advantages[index] + values[index],
    }));
  }

  /** log π(a|s) của policy hiện tại. */
  private policyLogProbability(state: readonly number[], action: number): number {
    return logSoftmaxVector(this.policy.predict(state))[action] ?? Math.log(1e-12);
  }

  /**
   * Gradient tham số phẳng của `log π(a|s)`.
   *
   * Forward một lần rồi backprop với gradient logits `(δ_a − π)`; kết quả
   * `gradInput` bị bỏ qua, chỉ lấy gradient tham số để flatten.
   */
  private logProbabilityParameterGradient(
    state: readonly number[],
    action: number,
  ): number[] {
    const logits = this.policy.forward(state, false);
    const probabilities = softmaxVector(logits);
    const gradLogits = probabilities.map((probability, index) => (index === action ? 1 - probability : -probability));
    const gradient = backpropagateNetwork(this.policy, gradLogits, {
      skipOutputActivation: true,
      apply: false,
    }).gradient;
    return flattenGradient(gradient);
  }

  /** Tích Fisher–vector `Fv ≈ mean((∇logπ·v)∇logπ) + damping·v`. */
  private fisherVectorProduct(
    vector: readonly number[],
    samples: readonly TRPOSample[],
  ): number[] {
    const parameterCount = vector.length;
    const result = new Array<number>(parameterCount).fill(0);
    for (const sample of samples) {
      const gradient = this.logProbabilityParameterGradient(sample.state, sample.action);
      let projection = 0;
      for (let p = 0; p < parameterCount; p++) projection += gradient[p] * vector[p];
      for (let p = 0; p < parameterCount; p++) result[p] += (projection * gradient[p]) / samples.length;
    }
    for (let p = 0; p < parameterCount; p++) result[p] += this.damping * vector[p];
    return result;
  }

  /** Form second-order `xᵀFx` dùng cho hệ số bước tự nhiên. */
  private fisherQuadratic(vector: readonly number[], samples: readonly TRPOSample[]): number {
    const product = this.fisherVectorProduct(vector, samples);
    let value = 0;
    for (let p = 0; p < vector.length; p++) value += vector[p] * product[p];
    return value;
  }

  /** Conjugate Gradient giải `F·x = g` (F ước lượng qua Fisher–vector). */
  private solveNaturalGradient(
    gradient: readonly number[],
    samples: readonly TRPOSample[],
  ): number[] {
    const count = gradient.length;
    let x = new Array<number>(count).fill(0);
    let r = [...gradient];
    let p = [...r];
    let residualDot = 0;
    for (let i = 0; i < count; i++) residualDot += r[i] * r[i];
    let residualNorm = residualDot;

    for (let iteration = 0; iteration < this.cgIterations && residualNorm > 1e-10; iteration++) {
      const fisherP = this.fisherVectorProduct(p, samples);
      let pAp = 0;
      for (let i = 0; i < count; i++) pAp += p[i] * fisherP[i];
      if (pAp <= 1e-12) break;
      const alpha = residualNorm / pAp;
      for (let i = 0; i < count; i++) {
        x[i] += alpha * p[i];
        r[i] -= alpha * fisherP[i];
      }
      const newResidualDot = r.reduce((sum, value) => sum + value * value, 0);
      if (!Number.isFinite(newResidualDot)) break;
      const beta = newResidualDot / (residualNorm || 1);
      for (let i = 0; i < count; i++) p[i] = r[i] + beta * p[i];
      residualNorm = newResidualDot;
    }
    return x;
  }
}

/** Chuyển gradient theo cấu trúc tầng thành vector tham số phẳng. */
function flattenGradient(gradient: NetworkGradient): number[] {
  const parameters: number[] = [];
  for (let l = 0; l < gradient.weights.length; l++) {
    for (const row of gradient.weights[l]) parameters.push(...row);
    parameters.push(...gradient.biases[l]);
  }
  return parameters;
}
