/**
 * @file nn.ts
 * @module @aetheria/engine/deeplearning/nn
 * @description Mạng nơ-ron truyền thẳng (MLP) với lan truyền ngược thật:
 * Dense layer, ReLU/LeakyReLU/Tanh/Sigmoid/Linear/Softmax, loss MSE/Huber và
 * cross-entropy, optimizer SGD (momentum), Adam hoặc AdamW (weight decay tách
 * khỏi gradient), L2 weight decay, gradient clipping, lịch giảm learning rate
 * (step/exponential/cosine), mini-batch với tích luỹ gradient, dropout,
 * mutation/crossover và serialize.
 */

import { DeepRandom, clampRange } from './random.js';
import { vectorNorm } from './tensor.js';

/** Hàm kích hoạt được hỗ trợ. */
export type ActivationName =
  | 'linear'
  | 'relu'
  | 'leakyRelu'
  | 'tanh'
  | 'sigmoid'
  | 'softmax';

/** Kiểu loss. */
export type LossName = 'mse' | 'crossEntropy' | 'huber';

/** Loại lịch giảm learning rate. */
export type LRScheduleKind = 'constant' | 'step' | 'exponential' | 'cosine';

/** Cấu hình lịch learning rate. */
export interface LRScheduleConfig {
  kind: LRScheduleKind;
  /** Số epoch mỗi lần giảm (cho 'step'). */
  decaySteps?: number;
  /** Hệ số giảm (cho 'step'/'exponential'). */
  decayRate?: number;
  /** LR sàn (cho 'cosine'). */
  minLr?: number;
}

/** Cấu hình optimizer. */
export interface OptimizerConfig {
  kind: 'sgd' | 'adam' | 'adamw';
  learningRate: number;
  /** Hệ số momentum cho SGD. */
  momentum: number;
  /** Adam beta1. */
  beta1: number;
  /** Adam beta2. */
  beta2: number;
  /** Adam epsilon. */
  epsilon: number;
  /**
   * Hệ số weight decay.
   * - `sgd`/`adam`: L2 tiêu chuẩn — decay cộng vào gradient trước khi cập nhật.
   * - `adamw`: decoupled weight decay — trừ trực tiếp khỏi trọng số theo lr,
   *   tách biệt với gradient (AdamW, Loshchilov & Hutter 2019).
   */
  weightDecay: number;
  /** Chuẩn gradient tối đa; `Infinity` = không cắt (mặc định). */
  maxGradNorm: number;
}

/** Cấu hình mặc định cho optimizer. */
export const DEFAULT_OPTIMIZER: OptimizerConfig = Object.freeze({
  kind: 'adam',
  learningRate: 0.01,
  momentum: 0.9,
  beta1: 0.9,
  beta2: 0.999,
  epsilon: 1e-8,
  weightDecay: 0.0001,
  maxGradNorm: Infinity,
});

/** Cấu hình một lớp dense. */
export interface DenseLayerConfig {
  inputSize: number;
  outputSize: number;
  activation?: ActivationName;
  /** Tỷ lệ dropout `[0, 1)` — 0 = tắt (mặc định). */
  dropout?: number;
}

/** Một mẫu huấn luyện. */
export interface TrainingSample {
  input: readonly number[];
  target: readonly number[];
}

/** Báo cáo sau khi huấn luyện. */
export interface TrainingReport {
  epochs: number;
  samples: number;
  initialLoss: number;
  finalLoss: number;
  bestLoss: number;
  lossHistory: number[];
}

/** Ảnh chụp để lưu game. */
export interface NeuralNetworkSnapshot {
  inputSize: number;
  outputSize: number;
  layers: Array<{
    inputSize: number;
    outputSize: number;
    activation: ActivationName;
    dropout: number;
    weights: number[][];
    biases: number[];
  }>;
  optimizer: OptimizerConfig;
}

/** Kẹp giá trị vào `[min, max]`. */
function clamp(value: number, min: number, max: number): number {
  return clampRange(value, min, max);
}

/** Giá trị hàm kích hoạt. */
export function activate(name: ActivationName, x: number): number {
  switch (name) {
    case 'relu':
      return Math.max(0, x);
    case 'leakyRelu':
      return x >= 0 ? x : x * 0.01;
    case 'tanh':
      return Math.tanh(x);
    case 'sigmoid':
      return 1 / (1 + Math.exp(-clamp(x, -60, 60)));
    case 'softmax':
      // Softmax cần toàn vector; xử lý ở cấp layer. Ở đây trả sigmoid như xấp xỉ.
      return 1 / (1 + Math.exp(-clamp(x, -60, 60)));
    case 'linear':
    default:
      return x;
  }
}

/** Đạo hàm hàm kích hoạt theo giá trị trước kích hoạt `z`. */
export function activationDerivative(name: ActivationName, z: number): number {
  switch (name) {
    case 'relu':
      return z > 0 ? 1 : 0;
    case 'leakyRelu':
      return z >= 0 ? 1 : 0.01;
    case 'tanh': {
      const t = Math.tanh(z);
      return 1 - t * t;
    }
    case 'sigmoid': {
      const s = 1 / (1 + Math.exp(-clamp(z, -60, 60)));
      return s * (1 - s);
    }
    case 'softmax':
      // Lan truyền ngược qua softmax được xử lý ở NeuralNetwork với cross-entropy.
      return 1;
    case 'linear':
    default:
      return 1;
  }
}

/** Kích hoạt cả vector; softmax được xử lý ổn định. */
export function activateVector(name: ActivationName, values: readonly number[]): number[] {
  if (name !== 'softmax') return values.map((value) => activate(name, value));
  let max = -Infinity;
  for (const value of values) max = Math.max(max, value);
  const exps = values.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0) || 1;
  return exps.map((value) => value / total);
}

/** Trả chỉ số phần tử lớn nhất. */
export function argmax(values: readonly number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}

/** Sai số bình phương trung bình. */
export function meanSquaredError(predicted: readonly number[], target: readonly number[]): number {
  if (predicted.length !== target.length) throw new RangeError('Độ dài dự đoán và target không khớp');
  if (predicted.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) sum += (predicted[i] - target[i]) ** 2;
  return sum / predicted.length;
}

/** Cross-entropy cho phân bố xác suất. */
export function crossEntropy(predicted: readonly number[], target: readonly number[]): number {
  if (predicted.length !== target.length) throw new RangeError('Độ dài dự đoán và target không khớp');
  let loss = 0;
  for (let i = 0; i < predicted.length; i++) {
    const p = clamp(predicted[i], 1e-12, 1);
    if (target[i] !== 0) loss -= target[i] * Math.log(p);
  }
  return loss;
}

/** Delta mặc định của Huber loss. */
export const HUBER_DELTA = 1;

/** Huber loss — MSE gần 0, MAE xa 0: bền với ngoại lai hơn MSE. */
export function huberLoss(predicted: readonly number[], target: readonly number[], delta = HUBER_DELTA): number {
  if (predicted.length !== target.length) throw new RangeError('Độ dài dự đoán và target không khớp');
  if (predicted.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    const error = Math.abs(predicted[i] - target[i]);
    sum += error <= delta ? 0.5 * error * error : delta * (error - 0.5 * delta);
  }
  return sum / predicted.length;
}

/** Kết quả trung gian của loss + gradient đầu ra. */
interface LossGradient {
  lossValue: number;
  gradOutput: number[];
}

/** Tính loss và gradient theo đầu ra cho một mẫu (dùng chung bởi các chế độ train). */
function computeLossGradient(
  output: readonly number[],
  target: readonly number[],
  loss: LossName,
  outputActivation: ActivationName,
): LossGradient {
  if (loss === 'crossEntropy' && outputActivation === 'softmax') {
    return {
      lossValue: crossEntropy(output, target),
      gradOutput: output.map((value, index) => value - target[index]),
    };
  }
  const count = Math.max(1, output.length);
  if (loss === 'huber') {
    return {
      lossValue: huberLoss(output, target),
      gradOutput: output.map((value, index) => {
        const error = value - target[index];
        return (Math.abs(error) <= HUBER_DELTA ? error : Math.sign(error) * HUBER_DELTA) / count;
      }),
    };
  }
  return {
    lossValue: meanSquaredError(output, target),
    gradOutput: output.map((value, index) => (2 * (value - target[index])) / count),
  };
}

/** Một lớp kết nối đầy đủ. */
export class DenseLayer {
  public readonly inputSize: number;
  public readonly outputSize: number;
  public readonly activation: ActivationName;
  public readonly weights: number[][];
  public readonly biases: number[];
  public readonly dropout: number;

  private readonly mWeights: number[][];
  private readonly vWeights: number[][];
  private readonly mBiases: number[];
  private readonly vBiases: number[];
  private updateCount = 0;

  private lastInput: number[] = [];
  private lastZ: number[] = [];
  private lastOutput: number[] = [];
  /** Mặt nạ dropout của lần forward gần nhất (null = không dropout). */
  private lastMask: boolean[] | null = null;

  constructor(config: DenseLayerConfig, random: DeepRandom = new DeepRandom(1)) {
    if (config.inputSize <= 0 || config.outputSize <= 0) {
      throw new RangeError('Kích thước lớp phải dương');
    }
    this.inputSize = config.inputSize;
    this.outputSize = config.outputSize;
    this.activation = config.activation ?? 'linear';
    this.dropout = clampRange(config.dropout ?? 0, 0, 0.9);
    this.random = random;

    // Khởi tạo He cho ReLU/LeakyReLU, Xavier cho các hàm còn lại.
    const isRelu = this.activation === 'relu' || this.activation === 'leakyRelu';
    const limit = Math.sqrt((isRelu ? 2 : 1) * 6 / (this.inputSize + this.outputSize));
    this.weights = Array.from({ length: this.outputSize }, () =>
      Array.from({ length: this.inputSize }, () => clampRange(random.gaussian(0, limit / 2), -limit, limit)),
    );
    this.biases = new Array(this.outputSize).fill(0);
    this.mWeights = this.weights.map((row) => row.map(() => 0));
    this.vWeights = this.weights.map((row) => row.map(() => 0));
    this.mBiases = new Array(this.outputSize).fill(0);
    this.vBiases = new Array(this.outputSize).fill(0);
  }

  private readonly random: DeepRandom;

  /**
   * Lan truyền xuôi một vector.
   * @param training bật dropout (nếu cấu hình > 0) theo kiểu inverted dropout.
   */
  public forward(input: readonly number[], training = false): number[] {
    if (input.length !== this.inputSize) {
      throw new RangeError(`Lớp cần ${this.inputSize} đầu vào, nhận ${input.length}`);
    }
    const z = new Array<number>(this.outputSize);
    let effectiveInput: number[];
    if (training && this.dropout > 0) {
      const keep = 1 - this.dropout;
      const mask = new Array<boolean>(this.inputSize);
      effectiveInput = new Array<number>(this.inputSize);
      for (let i = 0; i < this.inputSize; i++) {
        const kept = !this.random.chance(this.dropout);
        mask[i] = kept;
        effectiveInput[i] = kept ? input[i] / keep : 0;
      }
      this.lastMask = mask;
    } else {
      effectiveInput = [...input];
      this.lastMask = null;
    }
    for (let o = 0; o < this.outputSize; o++) {
      let sum = this.biases[o];
      const row = this.weights[o];
      for (let i = 0; i < this.inputSize; i++) sum += row[i] * effectiveInput[i];
      z[o] = sum;
    }
    const output = activateVector(this.activation, z);
    this.lastInput = effectiveInput;
    this.lastZ = z;
    this.lastOutput = output;
    return output;
  }

  /**
   * Lan truyền ngược.
   * @param gradOutput đạo hàm loss theo output của lớp.
   * @param optimizer cấu hình cập nhật.
   * @param skipActivationDerivative dùng khi softmax + cross-entropy (gradient đã gộp).
   * @param apply `false` để chỉ tính gradient mà không cập nhật trọng số
   *   (dùng cho mini-batch tích luỹ gradient).
   */
  public backward(
    gradOutput: readonly number[],
    optimizer: OptimizerConfig,
    skipActivationDerivative = false,
    apply = true,
  ): { gradInput: number[]; gradWeights: number[][]; gradBiases: number[] } {
    if (gradOutput.length !== this.outputSize) {
      throw new RangeError(`Gradient cần ${this.outputSize} phần tử, nhận ${gradOutput.length}`);
    }
    const delta = new Array<number>(this.outputSize);
    for (let o = 0; o < this.outputSize; o++) {
      const derivative = skipActivationDerivative ? 1 : activationDerivative(this.activation, this.lastZ[o]);
      delta[o] = gradOutput[o] * derivative;
    }

    const gradInput = new Array<number>(this.inputSize).fill(0);
    const gradWeights = Array.from({ length: this.outputSize }, () => new Array<number>(this.inputSize).fill(0));
    const gradBiases = new Array<number>(this.outputSize).fill(0);
    const mask = this.lastMask;
    const keepInv = mask ? 1 / (1 - this.dropout) : 1;

    for (let o = 0; o < this.outputSize; o++) {
      gradBiases[o] = delta[o];
      const deltaO = delta[o];
      if (deltaO === 0) continue;
      const row = this.weights[o];
      for (let i = 0; i < this.inputSize; i++) {
        gradWeights[o][i] = deltaO * this.lastInput[i];
        // Gradient đi qua mặt nạ dropout về lớp trước.
        gradInput[i] += row[i] * deltaO * (mask ? (mask[i] ? keepInv : 0) : 1);
      }
    }

    if (apply) this.applyGradients(gradWeights, gradBiases, optimizer, 1);
    return { gradInput, gradWeights, gradBiases };
  }

  /** Cập nhật trọng số theo gradient đã tính (trung bình theo batch). */
  public applyGradients(
    gradWeights: readonly (readonly number[])[],
    gradBiases: readonly number[],
    optimizer: OptimizerConfig,
    batchSize: number,
  ): void {
    const scale = 1 / Math.max(1, batchSize);
    this.updateCount += 1;
    const lr = optimizer.learningRate;
    // AdamW: weight decay tách khỏi gradient (decoupled), không áp lên bias.
    const isAdamFamily = optimizer.kind === 'adam' || optimizer.kind === 'adamw';
    const decoupledDecay =
      optimizer.kind === 'adamw' ? lr * optimizer.weightDecay * scale : 0;

    for (let o = 0; o < this.outputSize; o++) {
      for (let i = 0; i < this.inputSize; i++) {
        const grad =
          optimizer.kind === 'adamw'
            ? gradWeights[o][i] * scale
            : gradWeights[o][i] * scale + optimizer.weightDecay * this.weights[o][i];
        if (isAdamFamily) {
          this.mWeights[o][i] = optimizer.beta1 * this.mWeights[o][i] + (1 - optimizer.beta1) * grad;
          this.vWeights[o][i] = optimizer.beta2 * this.vWeights[o][i] + (1 - optimizer.beta2) * grad * grad;
          const mHat = this.mWeights[o][i] / (1 - optimizer.beta1 ** this.updateCount);
          const vHat = this.vWeights[o][i] / (1 - optimizer.beta2 ** this.updateCount);
          this.weights[o][i] -=
            lr * mHat / (Math.sqrt(vHat) + optimizer.epsilon) + decoupledDecay * this.weights[o][i];
        } else {
          const velocity =
            optimizer.momentum * this.mWeights[o][i] - lr * grad;
          this.mWeights[o][i] = velocity;
          this.weights[o][i] += velocity;
        }
      }

      const gradB = gradBiases[o] * scale;
      if (isAdamFamily) {
        this.mBiases[o] = optimizer.beta1 * this.mBiases[o] + (1 - optimizer.beta1) * gradB;
        this.vBiases[o] = optimizer.beta2 * this.vBiases[o] + (1 - optimizer.beta2) * gradB * gradB;
        const mHat = this.mBiases[o] / (1 - optimizer.beta1 ** this.updateCount);
        const vHat = this.vBiases[o] / (1 - optimizer.beta2 ** this.updateCount);
        this.biases[o] -= lr * mHat / (Math.sqrt(vHat) + optimizer.epsilon);
      } else {
        const velocity = optimizer.momentum * this.mBiases[o] - lr * gradB;
        this.mBiases[o] = velocity;
        this.biases[o] += velocity;
      }
    }
  }

  /** Ảnh chụp lớp. */
  public snapshot(): NeuralNetworkSnapshot['layers'][number] {
    return {
      inputSize: this.inputSize,
      outputSize: this.outputSize,
      activation: this.activation,
      dropout: this.dropout,
      weights: this.weights.map((row) => [...row]),
      biases: [...this.biases],
    };
  }

  /** Khôi phục từ ảnh chụp. */
  public static fromSnapshot(
    snapshot: NeuralNetworkSnapshot['layers'][number],
  ): DenseLayer {
    const layer = new DenseLayer(
      {
        inputSize: snapshot.inputSize,
        outputSize: snapshot.outputSize,
        activation: snapshot.activation,
        dropout: snapshot.dropout ?? 0,
      },
      new DeepRandom(1),
    );
    for (let o = 0; o < layer.outputSize; o++) {
      layer.biases[o] = snapshot.biases[o] ?? 0;
      for (let i = 0; i < layer.inputSize; i++) {
        layer.weights[o][i] = snapshot.weights[o]?.[i] ?? 0;
      }
    }
    return layer;
  }
}

/** Cấu hình mạng nơ-ron. */
export interface NeuralNetworkConfig {
  inputSize: number;
  hiddenSizes?: readonly number[];
  outputSize: number;
  hiddenActivation?: ActivationName;
  outputActivation?: ActivationName;
  optimizer?: Partial<OptimizerConfig>;
  /** Lịch giảm learning rate áp dụng khi gọi `applyLRSchedule`/`trainBatch`. */
  lrSchedule?: LRScheduleConfig;
  /** Dropout cho các lớp ẩn (áp dụng khi `training = true`). */
  dropout?: number;
  seed?: number;
}

/** MLP truyền thẳng. */
export class NeuralNetwork {
  public readonly inputSize: number;
  public readonly outputSize: number;
  public readonly layers: DenseLayer[];
  public readonly optimizer: OptimizerConfig;
  public readonly lrSchedule: LRScheduleConfig | undefined;
  /** Chế độ huấn luyện — bật dropout ở các lớp ẩn khi forward. */
  public training = false;
  private readonly random: DeepRandom;
  private readonly initialLearningRate: number;

  constructor(config: NeuralNetworkConfig) {
    if (config.inputSize <= 0 || config.outputSize <= 0) {
      throw new RangeError('Kích thước đầu vào/ra phải dương');
    }
    this.inputSize = config.inputSize;
    this.outputSize = config.outputSize;
    this.optimizer = { ...DEFAULT_OPTIMIZER, ...config.optimizer };
    this.lrSchedule = config.lrSchedule;
    this.initialLearningRate = this.optimizer.learningRate;
    this.random = new DeepRandom(config.seed ?? 1);

    const hidden = config.hiddenSizes ?? [];
    const sizes = [config.inputSize, ...hidden, config.outputSize];
    const hiddenActivation = config.hiddenActivation ?? 'relu';
    this.layers = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      const isOutput = i === sizes.length - 2;
      this.layers.push(
        new DenseLayer(
          {
            inputSize: sizes[i],
            outputSize: sizes[i + 1],
            activation: isOutput ? config.outputActivation ?? 'linear' : hiddenActivation,
            dropout: isOutput ? 0 : config.dropout ?? 0,
          },
          this.random,
        ),
      );
    }
  }

  /** Learning rate hiện hành. */
  public get learningRate(): number {
    return this.optimizer.learningRate;
  }

  /** Đặt learning rate thủ công. */
  public setLearningRate(lr: number): void {
    this.optimizer.learningRate = Math.max(1e-12, lr);
  }

  /**
   * Áp lịch learning rate cho epoch `epoch` trong tổng số `totalEpochs`:
   * `step` giảm theo bậc, `exponential` giảm liên tục, `cosine` annealing về `minLr`.
   */
  public applyLRSchedule(epoch: number, totalEpochs: number): number {
    if (!this.lrSchedule || this.lrSchedule.kind === 'constant') return this.optimizer.learningRate;
    const lr0 = this.initialLearningRate;
    const schedule = this.lrSchedule;
    let lr = lr0;
    if (schedule.kind === 'step') {
      const steps = Math.max(1, schedule.decaySteps ?? 10);
      lr = lr0 * Math.pow(schedule.decayRate ?? 0.5, Math.floor(epoch / steps));
    } else if (schedule.kind === 'exponential') {
      lr = lr0 * Math.pow(schedule.decayRate ?? 0.95, Math.max(0, epoch));
    } else if (schedule.kind === 'cosine') {
      const minLr = Math.max(0, schedule.minLr ?? lr0 * 0.01);
      const progress = clampRange(totalEpochs <= 1 ? 1 : epoch / Math.max(1, totalEpochs - 1), 0, 1);
      lr = minLr + (lr0 - minLr) * (1 + Math.cos(Math.PI * progress)) / 2;
    }
    this.optimizer.learningRate = Math.max(1e-12, lr);
    return this.optimizer.learningRate;
  }

  /** Lan truyền xuôi. */
  public forward(input: readonly number[], training = this.training): number[] {
    if (input.length !== this.inputSize) {
      throw new RangeError(`Mạng cần ${this.inputSize} đầu vào, nhận ${input.length}`);
    }
    let values = [...input];
    for (const layer of this.layers) values = layer.forward(values, training);
    return values;
  }

  /** Dự đoán (alias của forward, trả bản sao). */
  public predict(input: readonly number[]): number[] {
    return this.forward(input, false);
  }

  /** Xác suất softmax của logits đầu ra. */
  public probabilities(input: readonly number[]): number[] {
    return activateVector('softmax', this.forward(input, false));
  }

  /** Huấn luyện một mẫu, trả loss trước cập nhật. */
  public trainSample(sample: TrainingSample, loss: LossName = 'mse'): number {
    if (sample.target.length !== this.outputSize) {
      throw new RangeError(`Target cần ${this.outputSize} phần tử, nhận ${sample.target.length}`);
    }
    const previousTraining = this.training;
    this.training = true;
    try {
      const output = this.forward(sample.input, true);
      const outputActivation = this.layers[this.layers.length - 1]?.activation ?? 'linear';
      const { lossValue, gradOutput } = computeLossGradient(output, sample.target, loss, outputActivation);
      const clipped = this.clipGradients(gradOutput);
      let grad = clipped;
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const layer = this.layers[i];
        const skip = i === this.layers.length - 1 && loss === 'crossEntropy' && outputActivation === 'softmax';
        grad = layer.backward(grad, this.optimizer, skip).gradInput;
      }
      return lossValue;
    } finally {
      this.training = previousTraining;
    }
  }

  /** Cắt gradient theo chuẩn toàn cục nếu vượt `maxGradNorm`. */
  private clipGradients(gradOutput: number[]): number[] {
    const maxNorm = this.optimizer.maxGradNorm;
    if (!Number.isFinite(maxNorm) || maxNorm <= 0) return gradOutput;
    const norm = vectorNorm(gradOutput);
    if (norm <= maxNorm || norm === 0) return gradOutput;
    const scale = maxNorm / norm;
    for (let i = 0; i < gradOutput.length; i++) gradOutput[i] *= scale;
    return gradOutput;
  }

  /**
   * Huấn luyện theo batch với xáo trộn tất định, lịch LR và early stopping.
   * @param options.patience dừng sớm nếu `patience` epoch liên tiếp không cải thiện.
   * @param options.minDelta mức cải thiện tối thiểu được tính là tiến bộ.
   */
  public trainBatch(
    samples: readonly TrainingSample[],
    options: {
      epochs?: number;
      loss?: LossName;
      shuffle?: boolean;
      patience?: number;
      minDelta?: number;
      /** Dùng lịch LR cấu hình trong mạng. */
      useSchedule?: boolean;
    } = {},
  ): TrainingReport {
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const lossName = options.loss ?? 'mse';
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];

    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let epochsSinceImprovement = 0;
    let stoppedAt = epochs;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.useSchedule) this.applyLRSchedule(epoch, epochs);
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      for (const index of order) {
        epochLoss += this.trainSample(samples[index], lossName);
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      if (average < bestLoss - (options.minDelta ?? 0)) {
        bestLoss = average;
        epochsSinceImprovement = 0;
      } else {
        epochsSinceImprovement++;
        if (options.patience !== undefined && epochsSinceImprovement >= Math.max(1, options.patience)) {
          stoppedAt = epoch + 1;
          break;
        }
      }
    }

    return {
      epochs: stoppedAt,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
    };
  }

  /**
   * Huấn luyện mini-batch với tích luỹ gradient thật: gradient của toàn batch
   * được gộp rồi mới cập nhật một lần — ổn định hơn SGD từng mẫu.
   */
  public trainMiniBatch(
    samples: readonly TrainingSample[],
    options: { batchSize?: number; epochs?: number; loss?: LossName; shuffle?: boolean; useSchedule?: boolean } = {},
  ): TrainingReport {
    if (samples.length === 0) {
      return { epochs: 0, samples: 0, initialLoss: 0, finalLoss: 0, bestLoss: 0, lossHistory: [] };
    }
    const batchSize = clampRange(Math.floor(options.batchSize ?? 32), 1, samples.length);
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const lossName = options.loss ?? 'mse';
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    const outputActivation = this.layers[this.layers.length - 1]?.activation ?? 'linear';

    // Bộ đệm tích luỹ gradient theo lớp — cấp phát một lần.
    const accumulators = this.layers.map((layer) => ({
      weights: Array.from({ length: layer.outputSize }, () => new Array<number>(layer.inputSize).fill(0)),
      biases: new Array<number>(layer.outputSize).fill(0),
    }));

    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;

    const previousTraining = this.training;
    this.training = true;
    try {
      for (let epoch = 0; epoch < epochs; epoch++) {
        if (options.useSchedule) this.applyLRSchedule(epoch, epochs);
        if (options.shuffle !== false) this.random.shuffle(order);
        let epochLoss = 0;

        for (let batchStart = 0; batchStart < order.length; batchStart += batchSize) {
          const batch = order.slice(batchStart, batchStart + batchSize);
          for (const acc of accumulators) {
            for (const row of acc.weights) row.fill(0);
            acc.biases.fill(0);
          }

          let batchLoss = 0;
          for (const index of batch) {
            const sample = samples[index];
            const output = this.forward(sample.input, true);
            const { lossValue, gradOutput } = computeLossGradient(output, sample.target, lossName, outputActivation);
            const clipped = this.clipGradients(gradOutput);
            batchLoss += lossValue;
            let grad = clipped;
            for (let l = this.layers.length - 1; l >= 0; l--) {
              const layer = this.layers[l];
              const skip = l === this.layers.length - 1 && lossName === 'crossEntropy' && outputActivation === 'softmax';
              const { gradInput, gradWeights, gradBiases } = layer.backward(grad, this.optimizer, skip, false);
              const acc = accumulators[l];
              for (let o = 0; o < layer.outputSize; o++) {
                const gw = gradWeights[o];
                const aw = acc.weights[o];
                for (let i = 0; i < layer.inputSize; i++) aw[i] += gw[i];
                acc.biases[o] += gradBiases[o];
              }
              grad = gradInput;
            }
          }

          for (let l = 0; l < this.layers.length; l++) {
            this.layers[l].applyGradients(
              accumulators[l].weights,
              accumulators[l].biases,
              this.optimizer,
              batch.length,
            );
          }
          epochLoss += batchLoss;
        }

        const average = epochLoss / samples.length;
        lossHistory.push(average);
        if (epoch === 0) initialLoss = average;
        finalLoss = average;
        bestLoss = Math.min(bestLoss, average);
      }
    } finally {
      this.training = previousTraining;
    }

    return {
      epochs,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
    };
  }

  /** Đánh giá loss trung bình không cập nhật trọng số. */
  public evaluate(samples: readonly TrainingSample[], loss: LossName = 'mse'): number {
    if (samples.length === 0) return 0;
    let total = 0;
    for (const sample of samples) {
      const output = this.forward(sample.input);
      total += loss === 'crossEntropy' ? crossEntropy(output, sample.target) : meanSquaredError(output, sample.target);
    }
    return total / samples.length;
  }

  /** Đột biến trọng số phục vụ giải thuật tiến hoá. */
  public mutate(rate: number, scale: number, random: DeepRandom = this.random): this {
    const probability = clampRange(rate, 0, 1);
    for (const layer of this.layers) {
      for (let o = 0; o < layer.outputSize; o++) {
        for (let i = 0; i < layer.inputSize; i++) {
          if (random.chance(probability)) {
            layer.weights[o][i] += random.gaussian(0, scale);
          }
        }
        if (random.chance(probability)) layer.biases[o] += random.gaussian(0, scale);
      }
    }
    return this;
  }

  /** Lai ghép đồng nhất hai mạng cùng cấu trúc. */
  public static crossover(a: NeuralNetwork, b: NeuralNetwork, random: DeepRandom, seed?: number): NeuralNetwork {
    if (a.inputSize !== b.inputSize || a.outputSize !== b.outputSize || a.layers.length !== b.layers.length) {
      throw new RangeError('Không thể lai ghép hai mạng khác cấu trúc');
    }
    const child = new NeuralNetwork({
      inputSize: a.inputSize,
      outputSize: a.outputSize,
      hiddenSizes: a.layers.slice(0, -1).map((layer) => layer.outputSize),
      hiddenActivation: a.layers[0]?.activation === 'softmax' ? 'tanh' : a.layers[0]?.activation,
      outputActivation: a.layers[a.layers.length - 1]?.activation,
      optimizer: a.optimizer,
      seed: seed ?? 1,
    });
    for (let l = 0; l < child.layers.length; l++) {
      const layer = child.layers[l];
      const left = a.layers[l];
      const right = b.layers[l];
      for (let o = 0; o < layer.outputSize; o++) {
        for (let i = 0; i < layer.inputSize; i++) {
          layer.weights[o][i] = random.chance(0.5) ? left.weights[o][i] : right.weights[o][i];
        }
        layer.biases[o] = random.chance(0.5) ? left.biases[o] : right.biases[o];
      }
    }
    return child;
  }

  /** Bản sao độc lập. */
  public clone(): NeuralNetwork {
    return NeuralNetwork.fromSnapshot(this.snapshot());
  }

  /** Ảnh chụp để lưu. */
  public snapshot(): NeuralNetworkSnapshot {
    return {
      inputSize: this.inputSize,
      outputSize: this.outputSize,
      layers: this.layers.map((layer) => layer.snapshot()),
      optimizer: { ...this.optimizer },
    };
  }

  /** Khôi phục mạng từ ảnh chụp. */
  public static fromSnapshot(snapshot: NeuralNetworkSnapshot): NeuralNetwork {
    // Dropout chỉ áp cho lớp ẩn — lấy mức cao nhất các lớp ẩn đã lưu.
    const hiddenDropout = snapshot.layers.slice(0, -1).reduce((max, layer) => Math.max(max, layer.dropout ?? 0), 0);
    const network = new NeuralNetwork({
      inputSize: snapshot.inputSize,
      hiddenSizes: snapshot.layers.slice(0, -1).map((layer) => layer.outputSize),
      outputSize: snapshot.outputSize,
      hiddenActivation: snapshot.layers[0]?.activation ?? 'relu',
      outputActivation: snapshot.layers[snapshot.layers.length - 1]?.activation ?? 'linear',
      optimizer: snapshot.optimizer,
      dropout: hiddenDropout,
      seed: 1,
    });
    for (let i = 0; i < network.layers.length; i++) {
      const layer = network.layers[i];
      const saved = snapshot.layers[i];
      if (!saved) continue;
      for (let o = 0; o < layer.outputSize; o++) {
        layer.biases[o] = saved.biases[o] ?? 0;
        for (let j = 0; j < layer.inputSize; j++) {
          layer.weights[o][j] = saved.weights[o]?.[j] ?? 0;
        }
      }
    }
    return network;
  }
}
