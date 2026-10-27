/**
 * @file rainbow.ts
 * @module @aetheria/engine/learning/reinforcement/rainbow
 * @description Hai thành phần còn thiếu của Rainbow DQN (Hessel et al. 2018),
 * ghép với Double + Dueling + Prioritized replay đã có trong `dqn.ts`:
 *
 * - **n-step returns**: bộ đệm chuyển đổi transition trực tuyến thành transition
 *   n-bước `R_t^(n) = Σ_{i=0}^{n-1} γ^i r_{t+i}` với bootstrap `s_{t+n}`, giúp
 *   tín hiệu TD lan truyền nhanh hơn.
 * - **NoisyNet**: tầng tuyến tính với tham số `μ` (trọng số học) và `σ` (độ lệch
 *   nhiễu học) dùng noise phân tích nhân tử Gaussian (factorized) — thay thế
 *   epsilon-greedy bằng thăm dò học được; lúc suy luận dùng `μ` (kỳ vọng).
 *
 * `RainbowDQNTrainer` kết hợp đủ: Double DQN + Dueling + prioritized replay +
 * n-step + NoisyNet trên ba mạng Noisy (trunk/value/advantage). Không sửa lõi
 * `NeuralNetwork`/`DenseLayer` — tầng noisy tự chứa kèm Adam riêng cho `μ, σ`.
 * Chú thích tiếng Việt theo quy ước dự án.
 */

import type { OptimizerConfig } from '../../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../../deeplearning/random.js';
import { ExperienceReplay, type Transition } from '../../deeplearning/replay.js';
import {
  argmaxIndex,
  type NetworkGradient,
} from '../network.js';
import type { DQNTrainResult } from '../../deeplearning/q-network.js';

// ---------------------------------------------------------------------------
// NoisyNet
// ---------------------------------------------------------------------------

/** Gradient đầy đủ của một NoisyNetwork: phần `μ` và phần `σ`. */
export interface NoisyNetworkGradient {
  mu: NetworkGradient;
  sigma: NetworkGradient;
}

/** Trạng thái Adam nội bộ cho một ma trận tham số (dùng cho `μ` và `σ`). */
interface AdamState {
  m: number[][];
  v: number[][];
  mB: number[];
  vB: number[];
  step: number;
}

function createAdamState(rows: number, cols: number): AdamState {
  return {
    m: Array.from({ length: rows }, () => new Array<number>(cols).fill(0)),
    v: Array.from({ length: rows }, () => new Array<number>(cols).fill(0)),
    mB: new Array<number>(rows).fill(0),
    vB: new Array<number>(rows).fill(0),
    step: 0,
  };
}

/** Một bước Adam decoupled (weight decay 0) tại chỗ. */
function adamStep(
  parameters: number[][],
  biases: number[],
  gradWeights: readonly (readonly number[])[],
  gradBiases: readonly number[],
  state: AdamState,
  optimizer: OptimizerConfig,
  batchSize: number,
): void {
  const scale = 1 / Math.max(1, batchSize);
  state.step += 1;
  const beta1 = optimizer.beta1;
  const beta2 = optimizer.beta2;
  const correction1 = 1 - beta1 ** state.step;
  const correction2 = 1 - beta2 ** state.step;
  for (let o = 0; o < parameters.length; o++) {
    for (let i = 0; i < parameters[o].length; i++) {
      const grad = gradWeights[o][i] * scale;
      state.m[o][i] = beta1 * state.m[o][i] + (1 - beta1) * grad;
      state.v[o][i] = beta2 * state.v[o][i] + (1 - beta2) * grad * grad;
      const mHat = state.m[o][i] / correction1;
      const vHat = state.v[o][i] / correction2;
      parameters[o][i] -= (optimizer.learningRate * mHat) / (Math.sqrt(vHat) + optimizer.epsilon);
    }
    const gradB = gradBiases[o] * scale;
    state.mB[o] = beta1 * state.mB[o] + (1 - beta1) * gradB;
    state.vB[o] = beta2 * state.vB[o] + (1 - beta2) * gradB * gradB;
    const mHatB = state.mB[o] / correction1;
    const vHatB = state.vB[o] / correction2;
    biases[o] -= (optimizer.learningRate * mHatB) / (Math.sqrt(vHatB) + optimizer.epsilon);
  }
}

/**
 * Tầng tuyến tính NoisyNet với factorized Gaussian noise.
 *
 * Trọng số hiệu dụng khi huấn luyện: `W = μ + σ·(ε_out ⊗ ε_in)`,
 * `b = μ_b + σ_b·ε_out`, với `ε` được lấy mẫu lại mỗi lần forward training.
 * Gradient lan qua `W` hiệu dụng rồi tách cho `μ` (đạo hàm 1) và `σ`
 * (đạo hàm theo ε_out·ε_in); cả hai đều học bằng Adam.
 */
class NoisyLinearLayer {
  public readonly inputSize: number;
  public readonly outputSize: number;
  public readonly activationName: 'linear' | 'relu';
  public readonly muW: number[][];
  public readonly sigmaW: number[][];
  public readonly muB: number[];
  public readonly sigmaB: number[];

  private readonly muState: AdamState;
  private readonly sigmaState: AdamState;
  private readonly random: DeepRandom;
  private epsInput: number[];
  private epsOutput: number[];
  /** Cache forward phục vụ backprop. */
  private lastInput: number[] | null = null;
  private lastEffectiveW: number[][] | null = null;
  private lastUsedNoise = false;

  constructor(
    inputSize: number,
    outputSize: number,
    activation: 'linear' | 'relu',
    optimizer: OptimizerConfig,
    sigma0: number,
    random: DeepRandom,
  ) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.activationName = activation;
    // Khởi tạo μ đều trong [-bound, bound], σ khởi tạo bằng sigma0/√input.
    const bound = 1 / Math.sqrt(inputSize);
    this.muW = Array.from({ length: outputSize }, () =>
      Array.from({ length: inputSize }, () => (random.next() * 2 - 1) * bound),
    );
    this.muB = new Array<number>(outputSize).fill(0);
    const sigmaValue = sigma0 / Math.sqrt(inputSize);
    this.sigmaW = Array.from({ length: outputSize }, () =>
      new Array<number>(inputSize).fill(sigmaValue),
    );
    this.sigmaB = new Array<number>(outputSize).fill(sigma0 / Math.sqrt(inputSize));
    this.muState = createAdamState(outputSize, inputSize);
    this.sigmaState = createAdamState(outputSize, inputSize);
    this.random = random;
    this.epsInput = new Array<number>(inputSize).fill(0);
    this.epsOutput = new Array<number>(outputSize).fill(0);
  }

  /** Lấy mẫu lại nhiễu factorized (hàm f(ε) = sign(ε)·√|ε|). */
  private resampleNoise(): void {
    this.epsInput = this.epsInput.map(() => factorizedNoise(this.random));
    this.epsOutput = this.epsOutput.map(() => factorizedNoise(this.random));
  }

  /** Forward; `training = true` bật nhiễu (lấy mẫu lại mỗi lần gọi). */
  public forward(input: readonly number[], training: boolean): number[] {
    this.lastInput = [...input];
    this.lastUsedNoise = training;
    if (training) this.resampleNoise();
    const effectiveW = this.effectiveWeights();
    this.lastEffectiveW = effectiveW;
    const output = new Array<number>(this.outputSize);
    for (let o = 0; o < this.outputSize; o++) {
      let sum = this.effectiveBias(o);
      const row = effectiveW[o];
      for (let i = 0; i < this.inputSize; i++) sum += row[i] * (input[i] ?? 0);
      output[o] = this.activationName === 'relu' && sum < 0 ? 0 : sum;
    }
    return output;
  }

  /** Dự đoán kỳ vọng (không nhiễu). */
  public predict(input: readonly number[]): number[] {
    return this.forward(input, false);
  }

  /**
   * Backprop một tầng.
   *
   * @returns gradInput và gradient cộng dồn cho `μ`/`σ` của tầng này.
   */
  public backward(
    gradOutput: readonly number[],
    gradient: NoisyNetworkGradient,
  ): number[] {
    if (!this.lastInput || !this.lastEffectiveW) {
      throw new Error('NoisyLinearLayer cần forward trước khi backprop');
    }
    const gradInput = new Array<number>(this.inputSize).fill(0);
    const gradMuW = gradient.mu.weights[this.index];
    const gradMuB = gradient.mu.biases[this.index];
    const gradSigmaW = gradient.sigma.weights[this.index];
    const gradSigmaB = gradient.sigma.biases[this.index];

    for (let o = 0; o < this.outputSize; o++) {
      const gradOut = gradOutput[o] ?? 0;
      const row = this.lastEffectiveW[o];
      for (let i = 0; i < this.inputSize; i++) {
        // dL/din[j] = Σ_o gradOut·W_eff[o][j].
        gradInput[i] += gradOut * row[i];
        const gradEffW = gradOut * (this.lastInput[i] ?? 0);
        gradMuW[o][i] += gradEffW;
        if (this.lastUsedNoise) {
          gradSigmaW[o][i] += gradEffW * this.epsOutput[o] * this.epsInput[i];
        }
      }
      gradMuB[o] += gradOut;
      if (this.lastUsedNoise) {
        gradSigmaB[o] += gradOut * this.epsOutput[o];
      }
    }
    return gradInput;
  }

  /** Áp gradient đã tích lũy cho cả `μ` và `σ`. */
  public applyGradients(
    gradient: NoisyNetworkGradient,
    optimizer: OptimizerConfig,
    batchSize: number,
  ): void {
    adamStep(
      this.muW,
      this.muB,
      gradient.mu.weights[this.index],
      gradient.mu.biases[this.index],
      this.muState,
      optimizer,
      batchSize,
    );
    adamStep(
      this.sigmaW,
      this.sigmaB,
      gradient.sigma.weights[this.index],
      gradient.sigma.biases[this.index],
      this.sigmaState,
      optimizer,
      batchSize,
    );
  }

  /** Cặp trọng số hiệu dụng (training: μ + σ·ε⊗ε; suy luận: μ). */
  private effectiveWeights(): number[][] {
    if (!this.lastUsedNoise) return this.muW;
    return this.muW.map((row, o) =>
      row.map((value, i) => value + this.sigmaW[o][i] * this.epsOutput[o] * this.epsInput[i]),
    );
  }

  private effectiveBias(o: number): number {
    return this.lastUsedNoise ? this.muB[o] + this.sigmaB[o] * this.epsOutput[o] : this.muB[o];
  }

  /** Chỉ số tầng trong mạng — gán khi tạo NoisyNetwork. */
  public index = 0;
}

/** Nhiễu factorized: f(ε) = sign(u−0.5)·√|u−0.5|·√2 với u ~ U(0,1) có seed. */
function factorizedNoise(random: DeepRandom): number {
  const u = random.next();
  return Math.sign(u - 0.5) * Math.sqrt(Math.abs(u - 0.5)) * Math.SQRT2;
}

/** Mạng MLP gồm các NoisyLinearLayer. */
export class NoisyNetwork {
  public readonly inputSize: number;
  public readonly outputSize: number;
  public readonly layers: NoisyLinearLayer[];
  public readonly optimizer: OptimizerConfig;

  constructor(
    config: {
      inputSize: number;
      hiddenSizes: readonly number[];
      outputSize: number;
      hiddenActivation?: 'linear' | 'relu';
      outputActivation?: 'linear' | 'relu';
      optimizer: OptimizerConfig;
      sigma0?: number;
      seed?: number;
    },
  ) {
    this.inputSize = config.inputSize;
    this.outputSize = config.outputSize;
    this.optimizer = config.optimizer;
    const sizes = [config.inputSize, ...config.hiddenSizes, config.outputSize];
    this.layers = [];
    for (let l = 0; l < sizes.length - 1; l++) {
      const isOutput = l === sizes.length - 2;
      const activation = isOutput
        ? config.outputActivation ?? 'linear'
        : config.hiddenActivation ?? 'relu';
      this.layers.push(
        new NoisyLinearLayer(
          sizes[l],
          sizes[l + 1],
          activation,
          config.optimizer,
          config.sigma0 ?? 0.5,
          new DeepRandom((config.seed ?? 1) * 7919 + l * 17),
        ),
      );
      this.layers[l].index = l;
    }
  }

  /** Forward không nhiễu (kỳ vọng của NoisyNet). */
  public predict(input: readonly number[]): number[] {
    return this.forward(input, false);
  }

  /** Forward; bật nhiễu khi `training = true`. */
  public forward(input: readonly number[], training: boolean): number[] {
    let current = [...input];
    for (const layer of this.layers) current = layer.forward(current, training);
    return current;
  }

  /** Tạo bộ gradient rỗng cho cả `μ` và `σ`. */
  public createGradient(): NoisyNetworkGradient {
    const build = (): NetworkGradient => ({
      weights: this.layers.map((layer) =>
        Array.from({ length: layer.outputSize }, () => new Array<number>(layer.inputSize).fill(0)),
      ),
      biases: this.layers.map((layer) => new Array<number>(layer.outputSize).fill(0)),
    });
    return { mu: build(), sigma: build() };
  }

  /**
   * Lan truyền ngược toàn mạng.
   *
   * @param skipOutputActivation Bật khi gradOutput là gradient theo logits
   *   (đầu ra tuyến tính nên mặc định không cần).
   */
  public backpropagate(
    gradOutput: readonly number[],
    gradient: NoisyNetworkGradient,
  ): number[] {
    let grad = [...gradOutput];
    for (let l = this.layers.length - 1; l >= 0; l--) {
      grad = this.layers[l].backward(grad, gradient);
    }
    return grad;
  }

  /** Cắt norm toàn cục trên cả hai phần `μ`/`σ` tại chỗ. */
  public clipGradient(gradient: NoisyNetworkGradient, maxNorm: number): void {
    const total = normOf(gradient.mu) + normOf(gradient.sigma);
    const norm = Math.sqrt(total);
    if (!Number.isFinite(maxNorm) || maxNorm <= 0 || norm <= maxNorm || norm === 0) return;
    const scale = maxNorm / norm;
    scaleGradient(gradient.mu, scale);
    scaleGradient(gradient.sigma, scale);
  }

  /** Áp gradient cho toàn mạng (mỗi tầng tự chạy Adam cho μ và σ). */
  public applyGradient(
    gradient: NoisyNetworkGradient,
    batchSize: number,
    clipNorm = 0,
  ): void {
    if (clipNorm > 0) this.clipGradient(gradient, clipNorm);
    for (const layer of this.layers) {
      layer.applyGradients(gradient, this.optimizer, batchSize);
    }
  }

  /** Sao chép cứng tham số từ mạng khác (dùng cho target network). */
  public copyFrom(source: NoisyNetwork): void {
    for (let l = 0; l < this.layers.length; l++) {
      const target = this.layers[l];
      const origin = source.layers[l];
      for (let o = 0; o < target.outputSize; o++) {
        target.muB[o] = origin.muB[o];
        target.sigmaB[o] = origin.sigmaB[o];
        for (let i = 0; i < target.inputSize; i++) {
          target.muW[o][i] = origin.muW[o][i];
          target.sigmaW[o][i] = origin.sigmaW[o][i];
        }
      }
    }
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): NoisyNetworkSnapshot {
    return {
      layers: this.layers.map((layer) => ({
        muW: layer.muW.map((row) => [...row]),
        sigmaW: layer.sigmaW.map((row) => [...row]),
        muB: [...layer.muB],
        sigmaB: [...layer.sigmaB],
      })),
    };
  }

  /** Ghi snapshot vào mạng đích. */
  public restore(snapshot: NoisyNetworkSnapshot): void {
    for (let l = 0; l < this.layers.length && l < snapshot.layers.length; l++) {
      const layer = this.layers[l];
      const saved = snapshot.layers[l];
      if (!saved) continue;
      for (let o = 0; o < layer.outputSize; o++) {
        layer.muB[o] = saved.muB[o] ?? 0;
        layer.sigmaB[o] = saved.sigmaB[o] ?? 0;
        for (let i = 0; i < layer.inputSize; i++) {
          layer.muW[o][i] = saved.muW[o]?.[i] ?? 0;
          layer.sigmaW[o][i] = saved.sigmaW[o]?.[i] ?? 0;
        }
      }
    }
  }
}

/** Snapshot một NoisyNetwork. */
export interface NoisyNetworkSnapshot {
  layers: Array<{
    muW: number[][];
    sigmaW: number[][];
    muB: number[];
    sigmaB: number[];
  }>;
}

/** Norm bình phương của một NetworkGradient. */
function normOf(gradient: NetworkGradient): number {
  let sum = 0;
  for (const layer of gradient.weights) {
    for (const row of layer) for (const value of row) sum += value * value;
  }
  for (const layer of gradient.biases) for (const value of layer) sum += value * value;
  return sum;
}

/** Nhân toàn bộ gradient với hệ số (dùng khi cắt norm). */
function scaleGradient(gradient: NetworkGradient, scale: number): void {
  for (const layer of gradient.weights) {
    for (const row of layer) for (let i = 0; i < row.length; i++) row[i] *= scale;
  }
  for (const layer of gradient.biases) for (let i = 0; i < layer.length; i++) layer[i] *= scale;
}

// ---------------------------------------------------------------------------
// Bộ đệm n-step
// ---------------------------------------------------------------------------

/** Cấu hình bộ đệm n-step. */
export interface NStepBufferConfig {
  /** Số bước cộng dồn phần thưởng (n-step). */
  nStep: number;
  gamma: number;
}

/**
 * Chuyển transition trực tuyến thành transition n-bước.
 *
 * Khi push, giữ deque tối đa `nStep` phần tử; deque đầy hoặc gặp `done` thì
 * phát transition cộng dồn: `reward = Σ γ^i·r_i`, `state/action` của phần tử
 * đầu, `nextState/done` của phần tử hiện tại. `flush()` phát phần còn lại khi
 * episode kết thúc.
 */
export class NStepTransitionBuffer {
  private readonly deque: Transition<number[], number>[] = [];

  constructor(private readonly config: NStepBufferConfig) {
    if (config.nStep < 1) throw new RangeError('nStep phải >= 1');
    if (config.gamma <= 0 || config.gamma >= 1) throw new RangeError('gamma phải trong (0, 1)');
  }

  /** Số transition đang chờ trong deque. */
  public get pending(): number {
    return this.deque.length;
  }

  /**
   * Đẩy một transition; trả danh sách transition n-bước sẵn sàng cho replay.
   */
  public push(transition: Transition<number[], number>): Transition<number[], number>[] {
    this.deque.push({
      ...transition,
      state: [...transition.state],
      nextState: [...transition.nextState],
      action: transition.action,
    });
    const emitted: Transition<number[], number>[] = [];
    if (this.deque.length >= this.config.nStep || transition.done) {
      emitted.push(this.composeFromDeque());
      while (this.deque.length > 0 && transition.done) {
        emitted.push(this.composeFromDeque());
      }
    }
    return emitted;
  }

  /** Phát toàn bộ phần còn lại (gọi khi kết thúc episode). */
  public flush(): Transition<number[], number>[] {
    const emitted: Transition<number[], number>[] = [];
    while (this.deque.length > 0) emitted.push(this.composeFromDeque());
    return emitted;
  }

  /** Gộp deque hiện tại thành một transition n-bước rồi shift phần tử đầu. */
  private composeFromDeque(): Transition<number[], number> {
    const first = this.deque[0];
    let discountedReward = 0;
    let gammaPower = 1;
    let lastIndex = 0;
    for (; lastIndex < this.deque.length && lastIndex < this.config.nStep; lastIndex++) {
      const item = this.deque[lastIndex];
      discountedReward += gammaPower * item.reward;
      gammaPower *= this.config.gamma;
      if (item.done) break;
    }
    const last = this.deque[Math.min(lastIndex, this.deque.length - 1)];
    this.deque.shift();
    return {
      state: first.state,
      action: first.action,
      reward: discountedReward,
      nextState: last.nextState,
      done: last.done,
    };
  }
}

// ---------------------------------------------------------------------------
// Rainbow DQN
// ---------------------------------------------------------------------------

/** Cấu hình Rainbow DQN (Double + Dueling + Prioritized + n-step + NoisyNet). */
export interface RainbowDQNConfig {
  inputSize: number;
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  learningRate?: number;
  gamma?: number;
  /** Độ lệch chuẩn khởi tạo σ của NoisyNet. */
  noisySigma?: number;
  /** Số bước n-step returns. */
  nStep?: number;
  batchSize?: number;
  capacity?: number;
  targetSyncInterval?: number;
  softTargetUpdate?: boolean;
  tau?: number;
  gradientClip?: number;
  seed?: number;
}

/** Ảnh chụp Rainbow DQN. */
export interface RainbowDQNSnapshot {
  config: RainbowDQNConfig;
  trunk: NoisyNetworkSnapshot;
  value: NoisyNetworkSnapshot;
  advantage: NoisyNetworkSnapshot;
  targetTrunk: NoisyNetworkSnapshot;
  targetValue: NoisyNetworkSnapshot;
  targetAdvantage: NoisyNetworkSnapshot;
  steps: number;
  replay: ReturnType<ExperienceReplay<number[], number>['snapshot']>;
}

/**
 * Rainbow DQN đầy đủ các thành phần khả thi trên lõi MLP hiện có:
 * Double DQN, Dueling, prioritized replay, n-step returns, NoisyNet.
 *
 * Thăm dò do nhiễu trọng số học được đảm nhiệm — `selectAction` luôn greedy
 * trên mạng noisy (forward training mode để lấy mẫu nhiễu mới).
 */
export class RainbowDQNTrainer {
  public readonly actions: readonly string[];
  public readonly trunk: NoisyNetwork;
  public readonly value: NoisyNetwork;
  public readonly advantage: NoisyNetwork;
  public readonly targetTrunk: NoisyNetwork;
  public readonly targetValue: NoisyNetwork;
  public readonly targetAdvantage: NoisyNetwork;
  public readonly replay: ExperienceReplay<number[], number>;
  public readonly gamma: number;
  public readonly batchSize: number;
  public readonly nStep: number;

  private readonly config: RainbowDQNConfig;
  private readonly random: DeepRandom;
  private readonly nStepBuffer: NStepTransitionBuffer;
  private readonly targetSyncInterval: number;
  private readonly softTargetUpdate: boolean;
  private readonly tau: number;
  private readonly gradientClip: number;
  private steps = 0;

  constructor(config: RainbowDQNConfig) {
    if (config.inputSize <= 0) throw new RangeError('Rainbow DQN cần inputSize dương');
    if (config.actions.length === 0) throw new RangeError('Rainbow DQN cần ít nhất một hành động');
    this.config = { ...config, actions: [...config.actions] };
    this.actions = [...config.actions];
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.nStep = Math.max(1, Math.floor(config.nStep ?? 3));
    this.targetSyncInterval = Math.max(1, Math.floor(config.targetSyncInterval ?? 200));
    this.softTargetUpdate = config.softTargetUpdate ?? false;
    this.tau = clampRange(config.tau ?? 0.005, 0.0001, 1);
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.random = new DeepRandom(config.seed ?? 1);
    this.nStepBuffer = new NStepTransitionBuffer({ nStep: this.nStep, gamma: this.gamma });

    const optimizer: OptimizerConfig = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.0005,
      momentum: 0.9,
      beta1: 0.9,
      beta2: 0.999,
      epsilon: 1e-8,
      weightDecay: 0,
      maxGradNorm: Infinity,
    };
    const hiddenSizes = config.hiddenSizes ?? [64, 64];
    const seed = config.seed ?? 1;
    const featureSize = hiddenSizes[hiddenSizes.length - 1] ?? 64;
    this.trunk = new NoisyNetwork({
      inputSize: config.inputSize,
      hiddenSizes,
      outputSize: featureSize,
      hiddenActivation: 'relu',
      outputActivation: 'relu',
      optimizer,
      sigma0: config.noisySigma ?? 0.5,
      seed,
    });
    this.value = new NoisyNetwork({
      inputSize: featureSize,
      hiddenSizes: [Math.max(8, Math.floor(featureSize / 2))],
      outputSize: 1,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      sigma0: config.noisySigma ?? 0.5,
      seed: seed + 101,
    });
    this.advantage = new NoisyNetwork({
      inputSize: featureSize,
      hiddenSizes: [Math.max(8, Math.floor(featureSize / 2))],
      outputSize: this.actions.length,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      sigma0: config.noisySigma ?? 0.5,
      seed: seed + 202,
    });
    this.targetTrunk = this.cloneNetwork(this.trunk);
    this.targetValue = this.cloneNetwork(this.value);
    this.targetAdvantage = this.cloneNetwork(this.advantage);
    this.replay = new ExperienceReplay<number[], number>(
      config.capacity ?? 20_000,
      (config.seed ?? 1) + 303,
    );
  }

  /** Số bước tương tác đã ghi. */
  public get interactionCount(): number {
    return this.steps;
  }

  /** Q-value kỳ vọng (không nhiễu) của mạng online. */
  public qValues(state: readonly number[]): number[] {
    return this.composeQ(this.trunk, this.value, this.advantage, state, false);
  }

  /** Q-value của mạng target (không nhiễu). */
  public targetQValues(state: readonly number[]): number[] {
    return this.composeQ(this.targetTrunk, this.targetValue, this.targetAdvantage, state, false);
  }

  /**
   * Chọn hành động: greedy trên mạng noisy với nhiễu lấy mẫu mới (NoisyNet
   * exploration). Truyền `explore = false` để dùng kỳ vọng không nhiễu.
   */
  public selectAction(state: readonly number[], explore = true): number {
    if (explore) {
      return argmaxIndex(this.composeQ(this.trunk, this.value, this.advantage, state, true));
    }
    return argmaxIndex(this.qValues(state));
  }

  /** Ghi transition vào bộ đệm n-step rồi chuyển vào prioritized replay. */
  public observe(transition: Transition<number[], number>): void {
    for (const converted of this.nStepBuffer.push(transition)) {
      this.replay.push({ ...converted, priority: Math.abs(converted.reward) });
    }
    this.steps += 1;
  }

  /** Xả phần còn lại của bộ đệm n-step (cuối episode). */
  public flushEpisode(): void {
    for (const converted of this.nStepBuffer.flush()) {
      this.replay.push({ ...converted, priority: Math.abs(converted.reward) });
    }
  }

  /** Số transition n-bước trong replay. */
  public get replaySize(): number {
    return this.replay.size;
  }

  /** Một bước cập nhật từ replay; trả `null` nếu chưa đủ mẫu. */
  public trainStep(): DQNTrainResult | null {
    if (this.replay.size < this.batchSize) return null;
    const batch = this.replay.samplePrioritized(this.batchSize);
    const trunkGradient = this.trunk.createGradient();
    const valueGradient = this.value.createGradient();
    const advantageGradient = this.advantage.createGradient();
    let totalLoss = 0;
    let totalTD = 0;

    for (const transition of batch) {
      const action = clampRange(transition.action, 0, this.actions.length - 1);
      // Double DQN trên transition n-bước: chọn bằng online, đánh giá bằng target.
      let target = transition.reward;
      if (!transition.done) {
        const nextAction = argmaxIndex(this.qValues(transition.nextState));
        const targetQ = this.targetQValues(transition.nextState);
        target += Math.pow(this.gamma, this.nStep) * (targetQ[nextAction] ?? 0);
      }

      const qValues = this.qValues(transition.state);
      const td = target - qValues[action];
      totalTD += Math.abs(td);
      totalLoss += td * td;
      transition.priority = Math.abs(td);

      // Tách gradient dueling: dQ/dV = 1, dQ/dA(b) = δ(a,b) − 1/|A|.
      const gradQ = new Array<number>(this.actions.length).fill(0);
      gradQ[action] = 2 * (qValues[action] - target);
      const gradValueSum = gradQ.reduce((sum, value) => sum + value, 0);
      const meanGrad = gradValueSum / this.actions.length;
      const gradAdvantage = gradQ.map((value) => value - meanGrad);

      const valueBackprop = this.value.backpropagate([gradValueSum], valueGradient);
      const advantageBackprop = this.advantage.backpropagate(gradAdvantage, advantageGradient);
      const gradFeatures = valueBackprop.map(
        (value, index) => value + (advantageBackprop[index] ?? 0),
      );
      this.trunk.backpropagate(gradFeatures, trunkGradient);
    }

    this.replay.refreshPriorities();
    this.trunk.applyGradient(trunkGradient, batch.length, this.gradientClip);
    this.value.applyGradient(valueGradient, batch.length, this.gradientClip);
    this.advantage.applyGradient(advantageGradient, batch.length, this.gradientClip);

    if (this.softTargetUpdate) {
      this.softUpdateTargets(this.tau);
    } else if (this.steps % this.targetSyncInterval === 0) {
      this.syncTargets();
    }

    return {
      loss: totalLoss / batch.length,
      batchSize: batch.length,
      epsilon: 0,
      meanTDError: totalTD / batch.length,
    };
  }

  /** Chạy nhiều bước cập nhật liên tiếp. */
  public train(steps: number): DQNTrainResult[] {
    const results: DQNTrainResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(steps)); i++) {
      const result = this.trainStep();
      if (!result) break;
      results.push(result);
    }
    return results;
  }

  /** Đồng bộ cứng mạng target. */
  public syncTargets(): void {
    this.targetTrunk.copyFrom(this.trunk);
    this.targetValue.copyFrom(this.value);
    this.targetAdvantage.copyFrom(this.advantage);
  }

  /** Cập nhật mềm Polyak mạng target. */
  public softUpdateTargets(tau = this.tau): void {
    const blend = (target: NoisyNetwork, online: NoisyNetwork): void => {
      for (let l = 0; l < target.layers.length; l++) {
        const targetLayer = target.layers[l];
        const onlineLayer = online.layers[l];
        for (let o = 0; o < targetLayer.outputSize; o++) {
          targetLayer.muB[o] = (1 - tau) * targetLayer.muB[o] + tau * onlineLayer.muB[o];
          targetLayer.sigmaB[o] = (1 - tau) * targetLayer.sigmaB[o] + tau * onlineLayer.sigmaB[o];
          for (let i = 0; i < targetLayer.inputSize; i++) {
            targetLayer.muW[o][i] =
              (1 - tau) * targetLayer.muW[o][i] + tau * onlineLayer.muW[o][i];
            targetLayer.sigmaW[o][i] =
              (1 - tau) * targetLayer.sigmaW[o][i] + tau * onlineLayer.sigmaW[o][i];
          }
        }
      }
    };
    blend(this.targetTrunk, this.trunk);
    blend(this.targetValue, this.value);
    blend(this.targetAdvantage, this.advantage);
  }

  /** Ảnh chụp đầy đủ. */
  public snapshot(): RainbowDQNSnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      trunk: this.trunk.snapshot(),
      value: this.value.snapshot(),
      advantage: this.advantage.snapshot(),
      targetTrunk: this.targetTrunk.snapshot(),
      targetValue: this.targetValue.snapshot(),
      targetAdvantage: this.targetAdvantage.snapshot(),
      steps: this.steps,
      replay: this.replay.snapshot(),
    };
  }

  /** Khôi phục Rainbow DQN từ checkpoint. */
  public static fromSnapshot(snapshot: RainbowDQNSnapshot): RainbowDQNTrainer {
    const trainer = new RainbowDQNTrainer(snapshot.config);
    trainer.trunk.restore(snapshot.trunk);
    trainer.value.restore(snapshot.value);
    trainer.advantage.restore(snapshot.advantage);
    trainer.targetTrunk.restore(snapshot.targetTrunk);
    trainer.targetValue.restore(snapshot.targetValue);
    trainer.targetAdvantage.restore(snapshot.targetAdvantage);
    trainer.steps = snapshot.steps;
    const replay = ExperienceReplay.fromSnapshot(snapshot.replay);
    trainer.replay.pushMany(replay.latest(replay.size));
    return trainer;
  }

  /** Ghép Q dueling: Q = V + A − mean(A). */
  private composeQ(
    trunk: NoisyNetwork,
    value: NoisyNetwork,
    advantage: NoisyNetwork,
    state: readonly number[],
    training: boolean,
  ): number[] {
    const features = trunk.forward(state, training);
    const stateValue = value.forward(features, training)[0] ?? 0;
    const advantageOutput = advantage.forward(features, training);
    if (advantageOutput.length === 0) return [];
    const mean = advantageOutput.reduce((sum, item) => sum + item, 0) / advantageOutput.length;
    return advantageOutput.map((item) => stateValue + item - mean);
  }

  /** Bản sao noisy network (chỉ tham số, không kèm trạng thái Adam). */
  private cloneNetwork(source: NoisyNetwork): NoisyNetwork {
    const clone = new NoisyNetwork({
      inputSize: source.inputSize,
      hiddenSizes: source.layers.slice(0, -1).map((layer) => layer.outputSize),
      outputSize: source.outputSize,
      hiddenActivation: 'relu',
      outputActivation: source.layers[source.layers.length - 1].activationName,
      optimizer: source.optimizer,
      seed: this.random.int(0, 1_000_000),
    });
    clone.copyFrom(source);
    return clone;
  }
}
