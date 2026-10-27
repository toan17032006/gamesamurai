/**
 * @file preference.ts
 * @module @aetheria/engine/learning/preference
 * @description Họ thuật toán tối ưu ưu tiên mở rộng cho DPO, dùng chung kiểu
 * cặp ưu tiên rời rạc:
 *
 * - `IPOTrainer`: Identity Preference Optimization (Azar et al. 2023) — thay
 *   loss log-sigmoid của DPO bằng loss bình phương, chặn overfit trên cặp ưu
 *   tiên và không đẩy xác suất tích vô hạn.
 * - `KTOTrainer`: Kahneman-Tversky Optimization (Ethayarajh et al. 2024) — học
 *   từ mẫu đơn (không cần cặp), chỉ cần nhãn desirable/undesirable, mô phỏng
 *   lý thuyết triển vọng: lợi nhuận giảm dần, tổn thất nhạy hơn lợi ích.
 *
 * Gradient theo logits của log π(a|s): `∂logπ(a)/∂z_j = δ_ja − π_j`.
 * Chú thích tiếng Việt theo quy ước dự án.
 */

import { NeuralNetwork, type OptimizerConfig } from '../deeplearning/nn.js';
import { DeepRandom } from '../deeplearning/random.js';
import {
  applyNetworkGradient,
  backpropagateNetwork,
  clipNetworkGradient,
  createNetworkGradient,
  logSoftmaxVector,
  sigmoid,
  softmaxVector,
} from './network.js';
import type { LearningOptions, LearningReport, NumericVector } from './types.js';
import { emptyLearningReport, restoreWeightsFromSnapshot } from './internal.js';



// ---------------------------------------------------------------------------
// IPO
// ---------------------------------------------------------------------------

/** Cấu hình IPO. */
export interface IPOConfig {
  inputSize: number;
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  learningRate?: number;
  /** Hệ số β của IPO; loss mục tiêu là `(margin − 1/(2β))²`. */
  beta?: number;
  seed?: number;
  /** Reference policy; mặc định bản sao đóng băng của policy khởi tạo. */
  reference?: NeuralNetwork;
}

/** Một cặp hành động ưu tiên (giống DPO). */
export interface IPOActionPair {
  state: NumericVector;
  chosen: number;
  rejected: number;
  weight?: number;
}

/** Ảnh chụp IPO. */
export interface IPOSnapshot {
  config: Omit<IPOConfig, 'reference'>;
  policy: ReturnType<NeuralNetwork['snapshot']>;
  reference: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Identity Preference Optimization rời rạc.
 *
 * `L = (β·Δ − 1/(2β))²` với `Δ = (logπ(c) − logπ_ref(c)) − (logπ(r) − logπ_ref(r))`.
 * Gradient theo logits policy: `∂L/∂z_j = 2(βΔ − 1/(2β))·β·(δ_jc − δ_jr)`.
 */
export class IPOTrainer {
  public readonly actions: readonly string[];
  public readonly policy: NeuralNetwork;
  public readonly reference: NeuralNetwork;
  public readonly beta: number;

  private readonly config: Omit<IPOConfig, 'reference'>;
  private readonly random: DeepRandom;

  constructor(config: IPOConfig) {
    if (config.actions.length === 0) throw new RangeError('IPO cần ít nhất một hành động');
    const { reference: _reference, ...rest } = config;
    this.config = { ...rest, actions: [...config.actions] };
    this.actions = [...config.actions];
    this.beta = Math.max(1e-6, config.beta ?? 0.1);
    this.random = new DeepRandom(config.seed ?? 1);
    this.policy = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: this.actions.length,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.0005,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
    this.reference = config.reference ?? this.policy.clone();
    if (
      this.reference.inputSize !== this.policy.inputSize ||
      this.reference.outputSize !== this.policy.outputSize
    ) {
      throw new RangeError('Reference policy khác kiến trúc với policy IPO');
    }
  }

  /** Xác suất hành động của policy. */
  public probabilities(state: NumericVector): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Huấn luyện IPO từ các cặp ưu tiên. */
  public fit(pairs: readonly IPOActionPair[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const order = Array.from({ length: pairs.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;
    let lastAccuracy = 0;

    if (pairs.length === 0) return emptyLearningReport(startedAt);

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      let correct = 0;

      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.policy);
        let batchLoss = 0;

        for (const index of batch) {
          const pair = pairs[index];
          const chosen = Math.max(0, Math.min(this.actions.length - 1, Math.floor(pair.chosen)));
          const rejected = Math.max(0, Math.min(this.actions.length - 1, Math.floor(pair.rejected)));
          const weight = Math.max(0, pair.weight ?? 1);
          const policyLogs = logSoftmaxVector(this.policy.forward(pair.state, true));
          const referenceLogs = logSoftmaxVector(this.reference.predict(pair.state));
          const delta =
            (policyLogs[chosen] ?? 0) -
            (referenceLogs[chosen] ?? 0) -
            (policyLogs[rejected] ?? 0) +
            (referenceLogs[rejected] ?? 0);
          const margin = this.beta * delta - 1 / (2 * this.beta);
          const loss = margin * margin * weight;
          batchLoss += loss;
          if (delta > 0) correct++;

          const gradScale = 2 * margin * this.beta * weight;
          const gradLogits = new Array<number>(this.actions.length).fill(0);
          gradLogits[chosen] += gradScale;
          gradLogits[rejected] -= gradScale;
          backpropagateNetwork(this.policy, gradLogits, {
            gradient,
            skipOutputActivation: true,
            apply: false,
          });
        }

        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.policy, gradient, {
          optimizer: this.policy.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }

      const average = epochLoss / pairs.length;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
      lastAccuracy = correct / pairs.length;
    }

    return {
      epochs,
      steps,
      samples: pairs.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { accuracy: lastAccuracy, beta: this.beta },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá loss/accuracy ưu tiên trên tập kiểm tra. */
  public evaluate(pairs: readonly IPOActionPair[]): { loss: number; accuracy: number } {
    if (pairs.length === 0) return { loss: 0, accuracy: 0 };
    let loss = 0;
    let correct = 0;
    for (const pair of pairs) {
      const policyLogs = logSoftmaxVector(this.policy.predict(pair.state));
      const referenceLogs = logSoftmaxVector(this.reference.predict(pair.state));
      const delta =
        (policyLogs[pair.chosen] ?? 0) -
        (referenceLogs[pair.chosen] ?? 0) -
        (policyLogs[pair.rejected] ?? 0) +
        (referenceLogs[pair.rejected] ?? 0);
      const margin = this.beta * delta - 1 / (2 * this.beta);
      loss += margin * margin;
      if (delta > 0) correct++;
    }
    return { loss: loss / pairs.length, accuracy: correct / pairs.length };
  }

  public snapshot(): IPOSnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      policy: this.policy.snapshot(),
      reference: this.reference.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: IPOSnapshot): IPOTrainer {
    const trainer = new IPOTrainer({
      ...snapshot.config,
      reference: NeuralNetwork.fromSnapshot(snapshot.reference),
    });
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    restoreWeightsFromSnapshot(snapshot.reference, trainer.reference);
    return trainer;
  }
}

// ---------------------------------------------------------------------------
// KTO
// ---------------------------------------------------------------------------

/** Cấu hình KTO. */
export interface KTOConfig {
  inputSize: number;
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  learningRate?: number;
  /** Hệ số β điều chỉnh độ mạnh tín hiệu. */
  beta?: number;
  /** Trọng số loss cho mẫu desirable (Kahneman–Tversky: mất heavier hơn được). */
  desirableWeight?: number;
  /** Trọng số loss cho mẫu undesirable. */
  undesirableWeight?: number;
  /** Hệ số trung bình trượt của ước lượng KL dùng làm điểm quy chiếu z_ref. */
  klMomentum?: number;
  seed?: number;
  /** Reference policy; mặc định bản sao đóng băng của policy khởi tạo. */
  reference?: NeuralNetwork;
}

/** Một mẫu đơn cho KTO: hành động + nhãn desirable. */
export interface KTOExample {
  state: NumericVector;
  action: number;
  /** `true` = hành vi nên khuyến khích, `false` = nên hạn chế. */
  desirable: boolean;
  weight?: number;
}

/** Ảnh chụp KTO. */
export interface KTOSnapshot {
  config: Omit<KTOConfig, 'reference'>;
  policy: ReturnType<NeuralNetwork['snapshot']>;
  reference: ReturnType<NeuralNetwork['snapshot']>;
  klEstimate: number;
}

/**
 * Kahneman-Tversky Optimization rời rạc.
 *
 * Với `r = logπθ(a|x) − logπ_ref(a|x)` và `z_ref` là ước lượng KL trượt:
 * - desirable: `L = λ_D·(1 − σ(β(r − z_ref)))`
 * - undesirable: `L = λ_U·(1 − σ(β(z_ref − r)))`
 *
 * KTO học từ mẫu đơn nên phù hợp log phần thưởng game thưa, không ghép được cặp.
 */
export class KTOTrainer {
  public readonly actions: readonly string[];
  public readonly policy: NeuralNetwork;
  public readonly reference: NeuralNetwork;
  public readonly beta: number;
  public readonly desirableWeight: number;
  public readonly undesirableWeight: number;
  /** Ướ lượng KL hiện tại (điểm quy chiếu z_ref). */
  public klEstimate = 0;

  private readonly config: Omit<KTOConfig, 'reference'>;
  private readonly random: DeepRandom;
  private readonly klMomentum: number;

  constructor(config: KTOConfig) {
    if (config.actions.length === 0) throw new RangeError('KTO cần ít nhất một hành động');
    const { reference: _reference, ...rest } = config;
    this.config = { ...rest, actions: [...config.actions] };
    this.actions = [...config.actions];
    this.beta = Math.max(1e-6, config.beta ?? 0.1);
    this.desirableWeight = Math.max(0, config.desirableWeight ?? 1.33);
    this.undesirableWeight = Math.max(0, config.undesirableWeight ?? 1);
    this.klMomentum = Math.min(1, Math.max(0, config.klMomentum ?? 0.1));
    this.random = new DeepRandom(config.seed ?? 1);
    this.policy = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: this.actions.length,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.0005,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
    this.reference = config.reference ?? this.policy.clone();
    if (
      this.reference.inputSize !== this.policy.inputSize ||
      this.reference.outputSize !== this.policy.outputSize
    ) {
      throw new RangeError('Reference policy khác kiến trúc với policy KTO');
    }
  }

  /** Xác suất hành động của policy. */
  public probabilities(state: NumericVector): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Huấn luyện KTO từ các mẫu đơn có nhãn desirable. */
  public fit(examples: readonly KTOExample[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const order = Array.from({ length: examples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;
    let lastAccuracy = 0;

    if (examples.length === 0) return emptyLearningReport(startedAt);

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      let correct = 0;

      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.policy);
        let batchLoss = 0;
        let batchKl = 0;

        for (const index of batch) {
          const example = examples[index];
          const action = Math.max(0, Math.min(this.actions.length - 1, Math.floor(example.action)));
          const weight = Math.max(0, example.weight ?? 1);
          const policyLogs = logSoftmaxVector(this.policy.forward(example.state, true));
          const referenceLogs = logSoftmaxVector(this.reference.predict(example.state));
          const relative = (policyLogs[action] ?? 0) - (referenceLogs[action] ?? 0);
          batchKl += relative;
          // z_ref là hằng số (không lan truyền gradient) — chỉ là điểm quy chiếu.
          const value = this.beta * (relative - this.klEstimate);
          const lambda = example.desirable ? this.desirableWeight : this.undesirableWeight;
          const probability = example.desirable
            ? sigmoid(value)
            : sigmoid(-value);
          const loss = lambda * (1 - probability) * weight;
          batchLoss += loss;
          if ((example.desirable && probability > 0.5) || (!example.desirable && probability <= 0.5)) {
            correct++;
          }

          // dL/dr: desirable = −λβσ(1−σ); undesirable = +λβσ(1−σ).
          const sigma = sigmoid(example.desirable ? value : -value);
          const dLossDr = example.desirable
            ? -lambda * this.beta * sigma * (1 - sigma) * weight
            : lambda * this.beta * sigma * (1 - sigma) * weight;
          const probabilities = softmaxVector(policyLogs);
          const gradLogits = new Array<number>(this.actions.length).fill(0);
          for (let j = 0; j < gradLogits.length; j++) {
            const indicator = j === action ? 1 : 0;
            gradLogits[j] = dLossDr * (indicator - probabilities[j]);
          }
          backpropagateNetwork(this.policy, gradLogits, {
            gradient,
            skipOutputActivation: true,
            apply: false,
          });
        }

        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.policy, gradient, {
          optimizer: this.policy.optimizer,
          batchSize: batch.length,
        });
        // Cập nhật ước lượng KL sau mỗi batch (giống thực hành KTO chuẩn).
        const batchKlMean = batchKl / batch.length;
        this.klEstimate =
          (1 - this.klMomentum) * this.klEstimate + this.klMomentum * batchKlMean;
        epochLoss += batchLoss;
        steps++;
      }

      const average = epochLoss / examples.length;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
      lastAccuracy = correct / examples.length;
    }

    return {
      epochs,
      steps,
      samples: examples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { accuracy: lastAccuracy, beta: this.beta, klEstimate: this.klEstimate },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá loss/accuracy trên tập kiểm tra. */
  public evaluate(examples: readonly KTOExample[]): { loss: number; accuracy: number } {
    if (examples.length === 0) return { loss: 0, accuracy: 0 };
    let loss = 0;
    let correct = 0;
    for (const example of examples) {
      const action = Math.max(0, Math.min(this.actions.length - 1, Math.floor(example.action)));
      const policyLogs = logSoftmaxVector(this.policy.predict(example.state));
      const referenceLogs = logSoftmaxVector(this.reference.predict(example.state));
      const relative = (policyLogs[action] ?? 0) - (referenceLogs[action] ?? 0);
      const value = this.beta * (relative - this.klEstimate);
      const lambda = example.desirable ? this.desirableWeight : this.undesirableWeight;
      const probability = example.desirable ? sigmoid(value) : sigmoid(-value);
      loss += lambda * (1 - probability);
      if ((example.desirable && probability > 0.5) || (!example.desirable && probability <= 0.5)) {
        correct++;
      }
    }
    return { loss: loss / examples.length, accuracy: correct / examples.length };
  }

  public snapshot(): KTOSnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      policy: this.policy.snapshot(),
      reference: this.reference.snapshot(),
      klEstimate: this.klEstimate,
    };
  }

  public static fromSnapshot(snapshot: KTOSnapshot): KTOTrainer {
    const trainer = new KTOTrainer({
      ...snapshot.config,
      reference: NeuralNetwork.fromSnapshot(snapshot.reference),
    });
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    restoreWeightsFromSnapshot(snapshot.reference, trainer.reference);
    trainer.klEstimate = snapshot.klEstimate;
    return trainer;
  }
}
