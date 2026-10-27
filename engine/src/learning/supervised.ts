/**
 * @file supervised.ts
 * @module @aetheria/engine/learning/supervised
 * @description Các bộ huấn luyện có giám sát dùng chung cho agent trong game:
 *
 * - `SupervisedTrainer`: fit/evaluate trên mạng MLP, hỗ trợ MSE, Huber,
 *   cross-entropy và BCE; mini-batch, gradient accumulation, cắt gradient và
 *   early stopping.
 * - `FineTuneTrainer`: fine-tune toàn bộ hoặc chỉ một số tầng (layer freezing).
 * - `DistillationTrainer`: teacher-student với soft target + temperature.
 * - `MaskedAutoencodingTrainer`: tự giám sát kiểu masked autoencoder.
 * - `ContrastiveTrainer`: InfoNCE/SimCLR cho biểu diễn vector.
 * - `LowRankAdapter`: adapter hạng thấp (LoRA head) trên mạng đóng băng, phù hợp
 *   PEFT cho policy nhỏ trong game.
 * - `PrefixTuner` / `BottleneckAdapter`: PEFT prefix tuning và adapter cổ chai
 *   (Houlsby) trên mạng đóng băng.
 * - `SupervisedOptions.proximal`: thuật ngữ FedProx để federated client giữ
 *   gần tham số toàn cục khi dữ liệu cục bộ không IID.
 *
 * Các mạng phân loại/chính sách nên tạo với `outputActivation: 'linear'`; module
 * tự áp softmax để gradient ổn định và tránh nhân đạo hàm hai lần.
 */

import {
  NeuralNetwork,
  type OptimizerConfig,
} from '../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../deeplearning/random.js';
import {
  ArrayDataset,
  type EvaluationResult,
  type LearningOptions,
  type LearningReport,
  type NumericVector,
  type SupervisedSample,
} from './types.js';
import {
  applyNetworkGradient,
  argmaxIndex,
  backpropagateNetwork,
  binaryCrossEntropyGradient,
  categoricalCrossEntropy,
  clipNetworkGradient,
  createNetworkGradient,
  huberLossGradient,
  meanSquaredErrorGradient,
  networkParameterCount,
  oneHot,
  softmaxCrossEntropyGradient,
  softmaxVector,
  trainableLayerMask,
} from './network.js';

/** Hàm loss được hỗ trợ bởi `SupervisedTrainer`. */
export type SupervisedLoss = 'mse' | 'huber' | 'crossEntropy' | 'binaryCrossEntropy';

/** Tùy chọn riêng của supervised trainer. */
export interface SupervisedOptions extends LearningOptions {
  loss?: SupervisedLoss;
  /** Delta cho Huber. */
  huberDelta?: number;
  /** Dữ liệu validation để theo dõi quá khớp. */
  validation?: readonly SupervisedSample[];
  /** Mask tầng được cập nhật; dùng cho fine-tuning. */
  trainable?: readonly boolean[];
  /**
   * Thuật ngữ proximal của FedProx (Li et al. 2020): cộng `0.5·μ·‖w − w*‖²`
   * vào loss và `μ·(w − w*)` vào gradient, với `w*` là tham số toàn cục.
   * Dùng để hạn chế client lệch mạnh khỏi mô hình toàn cục khi dữ liệu
   * không IID; bỏ qua khi không cung cấp.
   */
  proximal?: {
    /** Tham số toàn cục `w*` (vector phẳng theo thứ tự flatten chuẩn). */
    point: readonly number[];
    /** Hệ số μ ≥ 0. */
    mu: number;
  };
}

/** Kết quả một epoch nội bộ. */
interface EpochOutcome {
  loss: number;
  steps: number;
  gradientNorm: number;
  accuracy: number | null;
}

/** Bộ huấn luyện có giám sát cấp thấp, không phụ thuộc framework UI. */
export class SupervisedTrainer {
  public readonly network: NeuralNetwork;
  public readonly loss: SupervisedLoss;
  public readonly huberDelta: number;

  constructor(
    network: NeuralNetwork,
    options: { loss?: SupervisedLoss; huberDelta?: number } = {},
  ) {
    this.network = network;
    this.loss = options.loss ?? 'mse';
    this.huberDelta = options.huberDelta ?? 1;
  }

  /**
   * Huấn luyện trên tập mẫu.
   *
   * @param samples Mẫu học; với cross-entropy, target là vector one-hot/soft.
   * @param options Cấu hình epoch/batch/early stopping/tầng trainable.
   * @returns Báo cáo chuẩn hóa dùng cho telemetry.
   */
  public fit(
    samples: readonly SupervisedSample[],
    options: SupervisedOptions = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const random = new DeepRandom(options.seed ?? 1);
    const validation = options.validation ?? [];
    const trainable = options.trainable;
    const clipNorm = options.gradientClip ?? 0;
    const patience = options.earlyStopping?.patience;
    const minDelta = options.earlyStopping?.minDelta ?? 0;

    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let bestValidation = Infinity;
    let staleEpochs = 0;
    let completedEpochs = 0;
    let steps = 0;
    const lossHistory: number[] = [];
    let lastAccuracy: number | null = null;

    for (let epoch = 0; epoch < epochs; epoch++) {
      const outcome = this.trainEpoch(samples, batchSize, random, options, trainable, clipNorm);
      steps += outcome.steps;
      const validationLoss = validation.length > 0 ? this.evaluate(validation).loss : undefined;
      lossHistory.push(outcome.loss);
      if (epoch === 0) initialLoss = outcome.loss;
      finalLoss = outcome.loss;
      bestLoss = Math.min(bestLoss, outcome.loss);
      lastAccuracy = outcome.accuracy;
      completedEpochs = epoch + 1;

      const monitor = validationLoss ?? outcome.loss;
      if (monitor < bestValidation - minDelta) {
        bestValidation = monitor;
        staleEpochs = 0;
      } else {
        staleEpochs++;
      }
      if (patience !== undefined && staleEpochs >= Math.max(1, patience)) break;
    }

    return {
      epochs: completedEpochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: {
        learningRate: this.network.optimizer.learningRate,
        parameters: this.network.layers.reduce(
          (sum, layer) => sum + layer.inputSize * layer.outputSize + layer.outputSize,
          0,
        ),
        ...(lastAccuracy !== null ? { accuracy: lastAccuracy } : {}),
        ...(bestValidation !== Infinity ? { validationLoss: bestValidation } : {}),
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: completedEpochs < epochs,
    };
  }

  /** Fine-tune chỉ một số tầng; các tầng còn lại bị đóng băng. */
  public fineTune(
    samples: readonly SupervisedSample[],
    options: SupervisedOptions & {
      freeze?: 'all' | 'last' | 'except-first' | readonly number[];
      /** Số tầng cuối được huấn luyện khi `freeze: 'last'`. */
      lastLayers?: number;
    } = {},
  ): LearningReport {
    const trainable = trainableLayerMask(
      this.network.layers.length,
      options.freeze ?? 'last',
      options.lastLayers ?? 1,
    );
    return this.fit(samples, { ...options, trainable });
  }

  /** Đánh giá loss/accuracy mà không cập nhật trọng số. */
  public evaluate(samples: readonly SupervisedSample[]): EvaluationResult {
    if (samples.length === 0) {
      return { loss: 0, accuracy: null, samples: 0, metrics: {} };
    }
    let totalLoss = 0;
    let weightTotal = 0;
    let correct = 0;
    for (const sample of samples) {
      const weight = Math.max(0, sample.weight ?? 1);
      weightTotal += weight;
      const output = this.network.forward(sample.input, false);
      const { loss } = this.sampleLoss(output, sample.target, weight);
      totalLoss += loss;
      if (this.loss === 'crossEntropy') {
        if (argmaxIndex(output) === argmaxIndex(sample.target)) correct++;
      } else if (this.loss === 'binaryCrossEntropy') {
        const predicted = output[0] >= 0 ? 1 : 0;
        const expected = sample.target[0] >= 0.5 ? 1 : 0;
        if (predicted === expected) correct++;
      }
    }
    const classification = this.loss === 'crossEntropy' || this.loss === 'binaryCrossEntropy';
    return {
      loss: totalLoss / (weightTotal || samples.length),
      accuracy: classification ? correct / samples.length : null,
      samples: samples.length,
      metrics: classification ? { accuracy: correct / samples.length } : {},
    };
  }

  /** Dự đoán logits/xác suất cho một vector. */
  public predict(input: NumericVector): number[] {
    const output = this.network.forward(input, false);
    return this.loss === 'crossEntropy' ? softmaxVector(output) : output;
  }

  /** Huấn luyện một epoch và trả thống kê. */
  private trainEpoch(
    samples: readonly SupervisedSample[],
    batchSize: number,
    random: DeepRandom,
    options: SupervisedOptions,
    trainable: readonly boolean[] | undefined,
    clipNorm: number,
  ): EpochOutcome {
    if (samples.length === 0) return { loss: 0, steps: 0, gradientNorm: 0, accuracy: null };
    const order = Array.from({ length: samples.length }, (_, index) => index);
    if (options.shuffle !== false) random.shuffle(order);
    let totalLoss = 0;
    let weightTotal = 0;
    let steps = 0;
    let lastGradientNorm = 0;
    let correct = 0;
    const classification = this.loss === 'crossEntropy' || this.loss === 'binaryCrossEntropy';

    for (let start = 0; start < order.length; start += batchSize) {
      const indices = order.slice(start, start + batchSize);
      const gradient = createNetworkGradient(this.network);
      let batchLoss = 0;
      let batchWeight = 0;
      for (const index of indices) {
        const sample = samples[index];
        const weight = Math.max(0, sample.weight ?? 1);
        batchWeight += weight;
        weightTotal += weight;
        const output = this.network.forward(sample.input, true);
        const { loss, gradOutput, skipOutputActivation } = this.sampleLoss(
          output,
          sample.target,
          weight,
        );
        batchLoss += loss;
        backpropagateNetwork(this.network, gradOutput, {
          gradient,
          skipOutputActivation,
          apply: false,
        });
        if (classification) {
          const predicted = this.loss === 'crossEntropy'
            ? argmaxIndex(output)
            : output[0] >= 0 ? 1 : 0;
          const expected = this.loss === 'crossEntropy'
            ? argmaxIndex(sample.target)
            : sample.target[0] >= 0.5 ? 1 : 0;
          if (predicted === expected) correct++;
        }
      }
      // FedProx: cộng thuật ngữ proximal vào gradient/loss của batch.
      if (options.proximal && options.proximal.mu > 0) {
        batchLoss += addProximalGradient(
          this.network,
          gradient,
          options.proximal.point,
          options.proximal.mu,
        );
      }
      if (clipNorm > 0) lastGradientNorm = clipNetworkGradient(gradient, clipNorm);
      applyNetworkGradient(this.network, gradient, {
        optimizer: this.network.optimizer,
        batchSize: Math.max(1, batchWeight),
        trainable,
      });
      totalLoss += batchLoss;
      steps++;
    }

    return {
      loss: totalLoss / (weightTotal || samples.length),
      steps,
      gradientNorm: lastGradientNorm,
      accuracy: classification ? correct / samples.length : null,
    };
  }

  /** Tính loss và gradient đầu ra cho một mẫu. */
  private sampleLoss(
    output: readonly number[],
    target: readonly number[],
    weight: number,
  ): { loss: number; gradOutput: number[]; skipOutputActivation: boolean } {
    switch (this.loss) {
      case 'crossEntropy': {
        const result = softmaxCrossEntropyGradient(output, target, weight);
        return {
          loss: result.loss,
          gradOutput: result.gradLogits,
          skipOutputActivation: true,
        };
      }
      case 'binaryCrossEntropy': {
        const result = binaryCrossEntropyGradient(output, target, weight);
        return {
          loss: result.loss,
          gradOutput: result.gradLogits,
          skipOutputActivation: true,
        };
      }
      case 'huber': {
        const result = huberLossGradient(output, target, this.huberDelta, weight);
        return { loss: result.loss, gradOutput: result.gradOutput, skipOutputActivation: false };
      }
      case 'mse':
      default: {
        const result = meanSquaredErrorGradient(output, target, weight);
        return { loss: result.loss, gradOutput: result.gradOutput, skipOutputActivation: false };
      }
    }
  }
}

/**
 * Teacher-student distillation.
 *
 * Hàm loss kết hợp hard-label CE (nếu target là one-hot) và KL mềm ở nhiệt độ T.
 * Gradient mềm theo logits student là `T * (softmax(s/T) - softmax(t/T))`.
 */
export class DistillationTrainer {
  public readonly student: NeuralNetwork;
  public readonly teacher: NeuralNetwork;

  constructor(student: NeuralNetwork, teacher: NeuralNetwork) {
    if (student.inputSize !== teacher.inputSize) throw new RangeError('Teacher/student khác input');
    if (student.outputSize !== teacher.outputSize) throw new RangeError('Teacher/student khác output');
    this.student = student;
    this.teacher = teacher;
  }

  /** Huấn luyện student từ phân phối mềm của teacher. */
  public fit(
    samples: readonly { input: NumericVector; target?: NumericVector; weight?: number }[],
    options: LearningOptions & {
      temperature?: number;
      alpha?: number;
      validation?: readonly { input: NumericVector; target?: NumericVector; weight?: number }[];
    } = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const temperature = Math.max(0.1, options.temperature ?? 2);
    const alpha = clampRange(options.alpha ?? 0.3, 0, 1);
    const random = new DeepRandom(options.seed ?? 1);
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.student);
        for (const index of batch) {
          const sample = samples[index];
          const weight = sample.weight ?? 1;
          const studentLogits = this.student.forward(sample.input, true);
          const teacherLogits = this.teacher.forward(sample.input, false);
          const studentNormal = softmaxVector(studentLogits);
          const teacherNormal = softmaxVector(teacherLogits);
          const studentSoft = softmaxVector(studentLogits.map((value) => value / temperature));
          const teacherSoft = softmaxVector(teacherLogits.map((value) => value / temperature));

          let loss = 0;
          let grad = new Array<number>(studentLogits.length).fill(0);
          if (sample.target && sample.target.length === studentLogits.length) {
            const target = sample.target;
            loss += categoricalCrossEntropy(studentNormal, target) * alpha;
            for (let i = 0; i < grad.length; i++) grad[i] += (studentNormal[i] - target[i]) * alpha;
          }
          const softCe = categoricalCrossEntropy(studentSoft, teacherSoft);
          loss += softCe * (1 - alpha) * temperature * temperature;
          for (let i = 0; i < grad.length; i++) {
            grad[i] += (studentSoft[i] - teacherSoft[i]) * (1 - alpha) * temperature;
          }
          for (let i = 0; i < grad.length; i++) grad[i] *= weight;
          epochLoss += loss * weight;
          backpropagateNetwork(this.student, grad, {
            gradient,
            skipOutputActivation: true,
            apply: false,
          });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.student, gradient, {
          optimizer: this.student.optimizer,
          batchSize: batch.length,
        });
        steps++;
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { temperature, alpha },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }
}

/**
 * Masked autoencoding cho vector số: che ngẫu nhiên một tỉ lệ chiều vào, buộc
 * mạng tái tạo đúng vector gốc. Đây là self-supervised learning không cần nhãn.
 */
export class MaskedAutoencodingTrainer {
  public readonly network: NeuralNetwork;

  constructor(network: NeuralNetwork) {
    if (network.inputSize !== network.outputSize) {
      throw new RangeError('Masked autoencoder cần inputSize === outputSize');
    }
    this.network = network;
  }

  public fit(
    samples: readonly NumericVector[],
    options: LearningOptions & { maskRatio?: number; maskValue?: number } = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const maskRatio = clampRange(options.maskRatio ?? 0.3, 0.05, 0.9);
    const maskValue = options.maskValue ?? 0;
    const random = new DeepRandom(options.seed ?? 1);
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.network);
        for (const index of batch) {
          const original = samples[index];
          const masked = [...original];
          const maskedIndices: number[] = [];
          for (let i = 0; i < masked.length; i++) {
            if (random.chance(maskRatio)) {
              masked[i] = maskValue;
              maskedIndices.push(i);
            }
          }
          const reconstruction = this.network.forward(masked, true);
          const result = meanSquaredErrorGradient(reconstruction, original);
          const gradOutput = result.gradOutput.map((value, i) =>
            maskedIndices.includes(i) ? value * (masked.length / Math.max(1, maskedIndices.length)) : 0,
          );
          epochLoss += result.loss;
          backpropagateNetwork(this.network, gradOutput, {
            gradient,
            apply: false,
          });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.network, gradient, {
          optimizer: this.network.optimizer,
          batchSize: batch.length,
        });
        steps++;
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { maskRatio },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }
}

/** Kết quả gradient InfoNCE cho hai view. */
interface InfoNceGradient {
  loss: number;
  gradA: number[][];
  gradB: number[][];
}

/**
 * Contrastive learning kiểu SimCLR với InfoNCE đối xứng.
 *
 * Mỗi mẫu tạo hai view; positive là cùng mẫu ở view kia, negative là tất cả mẫu
 * còn lại trong batch. Gradient được tính giải tích theo embedding đã chuẩn hóa
 * nên không cần autograd toàn phần.
 */
export class ContrastiveTrainer {
  public readonly encoder: NeuralNetwork;

  constructor(encoder: NeuralNetwork) {
    this.encoder = encoder;
  }

  public fit(
    samples: readonly NumericVector[],
    augment: (sample: NumericVector, view: 'a' | 'b', random: DeepRandom) => NumericVector,
    options: LearningOptions & { temperature?: number } = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(2, Math.floor(options.batchSize ?? 16));
    const temperature = Math.max(0.01, options.temperature ?? 0.2);
    const random = new DeepRandom(options.seed ?? 1);
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        if (batch.length < 2) continue;
        const gradient = createNetworkGradient(this.encoder);
        const inputsA: number[][] = [];
        const inputsB: number[][] = [];
        const viewA: number[][] = [];
        const viewB: number[][] = [];
        for (const index of batch) {
          const sample = samples[index];
          const inputA = [...augment(sample, 'a', random)];
          const inputB = [...augment(sample, 'b', random)];
          inputsA.push(inputA);
          inputsB.push(inputB);
          viewA.push(this.encoder.forward(inputA, true));
          viewB.push(this.encoder.forward(inputB, true));
        }
        const info = infoNceGradients(viewA, viewB, temperature);
        epochLoss += info.loss;
        for (let i = 0; i < batch.length; i++) {
          // Cache forward phải khớp đúng input đã dùng để tính embedding.
          this.encoder.forward(inputsA[i], true);
          backpropagateNetwork(this.encoder, info.gradA[i], { gradient, apply: false });
          this.encoder.forward(inputsB[i], true);
          backpropagateNetwork(this.encoder, info.gradB[i], { gradient, apply: false });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.encoder, gradient, {
          optimizer: this.encoder.optimizer,
          batchSize: batch.length * 2,
        });
        steps++;
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { temperature },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }
}

/**
 * Adapter hạng thấp (LoRA head) gắn vào output của mạng đóng băng.
 *
 * `base` giữ nguyên trọng số; adapter học phần hiệu chỉnh `scale * up(down(x))`.
 * Với policy logits, adapter cho phép thích nghi tác vụ mới mà chỉ train
 * `input*rank + rank*output` tham số.
 */
export class LowRankAdapter {
  public readonly base: NeuralNetwork;
  public readonly adapter: NeuralNetwork;
  public readonly scale: number;

  constructor(
    base: NeuralNetwork,
    options: {
      rank?: number;
      scale?: number;
      seed?: number;
      learningRate?: number;
      loss?: SupervisedLoss;
    } = {},
  ) {
    this.base = base;
    this.scale = options.scale ?? 1;
    const rank = Math.max(1, Math.floor(options.rank ?? 4));
    this.adapter = new NeuralNetwork({
      inputSize: base.inputSize,
      hiddenSizes: [rank],
      outputSize: base.outputSize,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: options.learningRate ?? 0.005,
        weightDecay: 0,
      },
      seed: options.seed ?? 1,
    });
  }

  /** Dự đoán kết hợp base + adapter. */
  public predict(input: NumericVector): number[] {
    const baseOutput = this.base.forward(input, false);
    const delta = this.adapter.forward(input, false);
    return baseOutput.map((value, index) => value + this.scale * (delta[index] ?? 0));
  }

  /** Huấn luyện adapter, giữ nguyên base. */
  public fit(samples: readonly SupervisedSample[], options: SupervisedOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const random = new DeepRandom(options.seed ?? 1);
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.adapter);
        for (const index of batch) {
          const sample = samples[index];
          const baseOutput = this.base.forward(sample.input, false);
          const delta = this.adapter.forward(sample.input, true);
          const logits = baseOutput.map((value, i) => value + this.scale * (delta[i] ?? 0));
          let gradLogits: number[];
          let skipOutputActivation = true;
          let loss = 0;
          if (options.loss === 'crossEntropy' || (options.loss === undefined && isProbabilityTarget(sample.target))) {
            const result = softmaxCrossEntropyGradient(logits, sample.target, sample.weight ?? 1);
            loss = result.loss;
            gradLogits = result.gradLogits;
          } else if (options.loss === 'binaryCrossEntropy') {
            const result = binaryCrossEntropyGradient(logits, sample.target, sample.weight ?? 1);
            loss = result.loss;
            gradLogits = result.gradLogits;
          } else if (options.loss === 'huber') {
            const result = huberLossGradient(logits, sample.target, 1, sample.weight ?? 1);
            loss = result.loss;
            gradLogits = result.gradOutput;
            skipOutputActivation = false;
          } else {
            const result = meanSquaredErrorGradient(logits, sample.target, sample.weight ?? 1);
            loss = result.loss;
            gradLogits = result.gradOutput;
            skipOutputActivation = false;
          }
          const gradAdapter = gradLogits.map((value) => value * this.scale);
          epochLoss += loss;
          backpropagateNetwork(this.adapter, gradAdapter, {
            gradient,
            skipOutputActivation,
            apply: false,
          });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.adapter, gradient, {
          optimizer: this.adapter.optimizer,
          batchSize: batch.length,
        });
        steps++;
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { rank: this.adapter.layers[0]?.outputSize ?? 0, scale: this.scale },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Xuất trọng số adapter để lưu checkpoint. */
  public snapshot(): ReturnType<NeuralNetwork['snapshot']> {
    return this.adapter.snapshot();
  }

  /** Đánh giá loss/accuracy của mô hình ghép. */
  public evaluate(samples: readonly SupervisedSample[], loss: SupervisedLoss = 'mse'): EvaluationResult {
    if (samples.length === 0) return { loss: 0, accuracy: null, samples: 0, metrics: {} };
    let total = 0;
    let correct = 0;
    for (const sample of samples) {
      const output = this.predict(sample.input);
      if (loss === 'crossEntropy') {
        total += categoricalCrossEntropy(softmaxVector(output), sample.target);
        if (argmaxIndex(output) === argmaxIndex(sample.target)) correct++;
      } else {
        total += output.reduce((sum, value, i) => sum + (value - sample.target[i]) ** 2, 0) / output.length;
      }
    }
    return {
      loss: total / samples.length,
      accuracy: loss === 'crossEntropy' ? correct / samples.length : null,
      samples: samples.length,
      metrics: loss === 'crossEntropy' ? { accuracy: correct / samples.length } : {},
    };
  }
}

/** Chuyển nhãn rời rạc thành mẫu one-hot. */
export function classificationSamples(
  samples: readonly { input: NumericVector; label: number; weight?: number }[],
  classCount: number,
): SupervisedSample[] {
  return samples.map((sample) => ({
    input: sample.input,
    target: oneHot(sample.label, classCount),
    weight: sample.weight,
  }));
}

/** Kiểm tra target có phải phân phối xác suất (tổng ~1, không âm) không. */
function isProbabilityTarget(target: readonly number[]): boolean {
  let sum = 0;
  for (const value of target) {
    if (value < 0) return false;
    sum += value;
  }
  return Math.abs(sum - 1) < 1e-6;
}

/** Tính InfoNCE đối xứng + gradient theo hai view. */
function infoNceGradients(
  viewA: readonly number[][],
  viewB: readonly number[][],
  temperature: number,
): InfoNceGradient {
  const count = Math.min(viewA.length, viewB.length);
  const emptyA = viewA.map((vector) => new Array<number>(vector.length).fill(0));
  const emptyB = viewB.map((vector) => new Array<number>(vector.length).fill(0));
  if (count < 2) {
    return { loss: 0, gradA: emptyA, gradB: emptyB };
  }

  const rawA = viewA.slice(0, count);
  const rawB = viewB.slice(0, count);
  const normalizedA = rawA.map(normalize);
  const normalizedB = rawB.map(normalize);
  const gradNormalizedA = normalizedA.map((vector) => new Array<number>(vector.length).fill(0));
  const gradNormalizedB = normalizedB.map((vector) => new Array<number>(vector.length).fill(0));
  let loss = 0;

  // Một lượt A->B và một lượt B->A; mỗi lượt coi positive cùng chỉ số là mẫu
  // duy nhất, còn toàn bộ mẫu khác trong batch là negative.
  const pass = (
    anchors: readonly number[][],
    positives: readonly number[][],
    gradAnchor: number[][],
    gradPositive: number[][],
  ): void => {
    for (let i = 0; i < count; i++) {
      const anchor = anchors[i];
      const logits = positives.map((positive) => dot(anchor, positive) / temperature);
      const probabilities = softmaxVector(logits);
      loss -= Math.log(Math.max(probabilities[i], 1e-12));
      for (let j = 0; j < count; j++) {
        const coefficient = probabilities[j] / temperature;
        for (let d = 0; d < anchor.length; d++) {
          gradAnchor[i][d] += coefficient * positives[j][d];
          gradPositive[j][d] +=
            (anchor[d] / temperature) * (probabilities[j] - (j === i ? 1 : 0));
        }
      }
      for (let d = 0; d < anchor.length; d++) {
        gradAnchor[i][d] -= positives[i][d] / temperature;
      }
    }
  };

  pass(normalizedA, normalizedB, gradNormalizedA, gradNormalizedB);
  pass(normalizedB, normalizedA, gradNormalizedB, gradNormalizedA);

  const scale = 1 / (2 * count);
  const convert = (raw: readonly number[], gradNormalized: readonly number[]): number[] => {
    const norm = Math.sqrt(raw.reduce((sum, value) => sum + value * value, 0));
    if (norm <= 1e-9) return raw.map(() => 0);
    const normalized = raw.map((value) => value / norm);
    const projection = normalized.reduce(
      (sum, value, index) => sum + value * gradNormalized[index],
      0,
    );
    return normalized.map(
      (value, index) => (gradNormalized[index] - projection * value) * scale / norm,
    );
  };

  return {
    loss: loss * scale,
    gradA: rawA.map((raw, index) => convert(raw, gradNormalizedA[index])),
    gradB: rawB.map((raw, index) => convert(raw, gradNormalizedB[index])),
  };
}

function normalize(vector: readonly number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm > 1e-9 ? vector.map((value) => value / norm) : vector.map(() => 0);
}

function dot(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) sum += a[i] * b[i];
  return sum;
}

/** Utility tạo bộ optimizer mặc định cho policy nhỏ. */
export function createLearningOptimizer(
  learningRate = 0.001,
  overrides: Partial<OptimizerConfig> = {},
): Partial<OptimizerConfig> {
  return { kind: 'adam', learningRate, weightDecay: 0.0001, ...overrides };
}

/** Dataset supervised tiện dụng. */
export function supervisedDataset(samples: readonly SupervisedSample[]): ArrayDataset<SupervisedSample> {
  return new ArrayDataset(samples);
}

/**
 * Cộng gradient proximal `μ·(w − w*)` của FedProx vào gradient batch và trả
 * giá trị phạt `0.5·μ·‖w − w*‖²` để báo cáo loss.
 *
 * Thứ tự duyệt tham số phải khớp với `flattenNetworkParameters`: weights
 * từng tầng (hàng × cột) rồi biases.
 */
function addProximalGradient(
  network: NeuralNetwork,
  gradient: { weights: number[][][]; biases: number[][] },
  point: readonly number[],
  mu: number,
): number {
  let penalty = 0;
  let cursor = 0;
  const parameterAt = () => point[cursor++] ?? 0;
  for (let l = 0; l < network.layers.length; l++) {
    const layer = network.layers[l];
    for (let o = 0; o < layer.outputSize; o++) {
      for (let i = 0; i < layer.inputSize; i++) {
        const reference = parameterAt();
        const offset = layer.weights[o][i] - reference;
        gradient.weights[l][o][i] += mu * offset;
        penalty += offset * offset;
      }
    }
    for (let o = 0; o < layer.outputSize; o++) {
      const reference = parameterAt();
      const offset = layer.biases[o] - reference;
      gradient.biases[l][o] += mu * offset;
      penalty += offset * offset;
    }
  }
  if (point.length !== cursor) {
    throw new RangeError(`Proximal point cần ${cursor} tham số, nhận ${point.length}`);
  }
  return 0.5 * mu * penalty;
}

// ---------------------------------------------------------------------------
// PEFT: Bottleneck adapter (Houlsby) và Prefix tuning
// ---------------------------------------------------------------------------

/** Tùy chọn tạo `BottleneckAdapter`. */
export interface BottleneckAdapterOptions {
  /** Số chiều cổ chai; mặc định `max(4, outputSize / 4)`. */
  bottleneck?: number;
  /** Hệ số residual của nhánh adapter; mặc định 1. */
  scale?: number;
  seed?: number;
  learningRate?: number;
  loss?: SupervisedLoss;
}

/**
 * Adapter cổ chai kiểu Houlsby trên mạng đóng băng.
 *
 * Khác LoRA (bottleneck tuyến tính trên input), adapter cổ chai hoạt động trên
 * *biểu diễn output* của base: `y = h + scale·up(relu(down(h)))` với
 * `h = base(x)`. Chỉ nhánh adapter được huấn luyện — phù hợp thích nghi từng
 * NPC/tác vụ trong game mà không đụng trọng số gốc (tránh quên catastrophic,
 * tiết kiệm bộ nhớ checkpoint).
 */
export class BottleneckAdapter {
  public readonly base: NeuralNetwork;
  public readonly adapter: NeuralNetwork;
  public readonly scale: number;

  constructor(base: NeuralNetwork, options: BottleneckAdapterOptions = {}) {
    this.base = base;
    this.scale = Math.max(0, options.scale ?? 1);
    const bottleneck = Math.max(2, Math.floor(
      options.bottleneck ?? Math.max(4, Math.floor(base.outputSize / 4)),
    ));
    this.adapter = new NeuralNetwork({
      inputSize: base.outputSize,
      hiddenSizes: [bottleneck],
      outputSize: base.outputSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: options.learningRate ?? 0.005,
        weightDecay: 0,
      },
      seed: options.seed ?? 1,
    });
  }

  /** Số tham số trainable của nhánh adapter. */
  public get trainableParameters(): number {
    return networkParameterCount(this.adapter);
  }

  /** Dự đoán kết hợp base (đóng băng) + adapter. */
  public predict(input: NumericVector): number[] {
    const h = this.base.forward(input, false);
    const delta = this.adapter.forward(h, false);
    return h.map((value, index) => value + this.scale * (delta[index] ?? 0));
  }

  /** Huấn luyện nhánh adapter; base giữ nguyên trọng số. */
  public fit(samples: readonly SupervisedSample[], options: SupervisedOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const random = new DeepRandom(options.seed ?? 1);
    const lossKind = options.loss ?? 'mse';
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.adapter);
        for (const index of batch) {
          const sample = samples[index];
          const weight = Math.max(0, sample.weight ?? 1);
          const h = this.base.forward(sample.input, false);
          const delta = this.adapter.forward(h, true);
          const logits = h.map((value, i) => value + this.scale * (delta[i] ?? 0));
          let gradDelta: number[];
          let loss = 0;
          if (lossKind === 'crossEntropy') {
            const result = softmaxCrossEntropyGradient(logits, sample.target, weight);
            loss = result.loss;
            gradDelta = result.gradLogits.map((value) => value * this.scale);
          } else if (lossKind === 'binaryCrossEntropy') {
            const result = binaryCrossEntropyGradient(logits, sample.target, weight);
            loss = result.loss;
            gradDelta = result.gradLogits.map((value) => value * this.scale);
          } else if (lossKind === 'huber') {
            const result = huberLossGradient(logits, sample.target, options.huberDelta ?? 1, weight);
            loss = result.loss;
            gradDelta = result.gradOutput.map((value) => value * this.scale);
          } else {
            const result = meanSquaredErrorGradient(logits, sample.target, weight);
            loss = result.loss;
            gradDelta = result.gradOutput.map((value) => value * this.scale);
          }
          epochLoss += loss;
          backpropagateNetwork(this.adapter, gradDelta, {
            gradient,
            apply: false,
          });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.adapter, gradient, {
          optimizer: this.adapter.optimizer,
          batchSize: batch.length,
        });
        steps++;
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: {
        bottleneck: this.adapter.layers[0]?.outputSize ?? 0,
        scale: this.scale,
        trainableParameters: this.trainableParameters,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá loss/accuracy của mô hình ghép. */
  public evaluate(samples: readonly SupervisedSample[], loss: SupervisedLoss = 'mse'): EvaluationResult {
    if (samples.length === 0) return { loss: 0, accuracy: null, samples: 0, metrics: {} };
    let total = 0;
    let correct = 0;
    for (const sample of samples) {
      const output = this.predict(sample.input);
      if (loss === 'crossEntropy') {
        total += categoricalCrossEntropy(softmaxVector(output), sample.target);
        if (argmaxIndex(output) === argmaxIndex(sample.target)) correct++;
      } else if (loss === 'binaryCrossEntropy') {
        const result = binaryCrossEntropyGradient(output, sample.target, 1);
        total += result.loss;
        const predicted = output[0] >= 0 ? 1 : 0;
        if (predicted === (sample.target[0] >= 0.5 ? 1 : 0)) correct++;
      } else {
        total += output.reduce((sum, value, i) => sum + (value - (sample.target[i] ?? 0)) ** 2, 0) / output.length;
      }
    }
    return {
      loss: total / samples.length,
      accuracy: loss === 'crossEntropy' || loss === 'binaryCrossEntropy'
        ? correct / samples.length
        : null,
      samples: samples.length,
      metrics: loss === 'crossEntropy' ? { accuracy: correct / samples.length } : {},
    };
  }

  /** Xuất trọng số adapter để lưu checkpoint. */
  public snapshot(): ReturnType<NeuralNetwork['snapshot']> {
    return this.adapter.snapshot();
  }
}

/** Tùy chọn tạo `PrefixTuner`. */
export interface PrefixTunerOptions {
  /** Số chiều quan sát thật (không tính prefix). */
  inputDim: number;
  /** Độ dài prefix (số token/vị trí nối trước input); mặc định 4. */
  prefixLength?: number;
  seed?: number;
  learningRate?: number;
  loss?: SupervisedLoss;
}

/**
 * Prefix tuning cho MLP: học một vector prefix được nối trước input của mạng
 * đóng băng (mạng base phải được tạo với `inputSize = inputDim + prefixLength`).
 *
 * Prefix là tham số tự do (mạng 1 tầng tuyến tính nhận hằng số 1) được tối ưu
 * bằng Adam sẵn có của engine. Chỉ prefix được huấn luyện — PEFT nhẹ cho việc
 * điều khiển hành vi NPC mà không fine-tune toàn bộ.
 */
export class PrefixTuner {
  public readonly base: NeuralNetwork;
  public readonly inputDim: number;
  public readonly prefixLength: number;
  public readonly prefix: NeuralNetwork;

  constructor(base: NeuralNetwork, options: PrefixTunerOptions) {
    const prefixLength = Math.max(1, Math.floor(options.prefixLength ?? 4));
    if (base.inputSize !== options.inputDim + prefixLength) {
      throw new RangeError(
        `PrefixTuner cần mạng base inputSize = ${options.inputDim} + ${prefixLength}, nhận ${base.inputSize}`,
      );
    }
    this.base = base;
    this.inputDim = options.inputDim;
    this.prefixLength = prefixLength;
    // Prefix là vector tham số tự do: mạng 1 tầng tuyến tính nhận hằng số 1,
    // nhờ đó dùng sẵn optimizer Adam của engine mà không viết riêng.
    this.prefix = new NeuralNetwork({
      inputSize: 1,
      hiddenSizes: [],
      outputSize: prefixLength,
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: options.learningRate ?? 0.01,
        weightDecay: 0,
      },
      seed: options.seed ?? 1,
    });
  }

  /** Vector prefix hiện tại. */
  public prefixVector(): number[] {
    return this.prefix.forward([1], false);
  }

  /** Số tham số trainable của prefix. */
  public get trainableParameters(): number {
    return networkParameterCount(this.prefix);
  }

  /** Dự đoán: nối prefix trước input rồi chạy mạng base (đóng băng). */
  public predict(input: NumericVector): number[] {
    const z = [...this.prefixVector(), ...input];
    return this.base.predict(z);
  }

  /** Huấn luyện prefix; base giữ nguyên trọng số. */
  public fit(samples: readonly SupervisedSample[], options: SupervisedOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const random = new DeepRandom(options.seed ?? 1);
    const lossKind = options.loss ?? 'mse';
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.prefix);
        for (const index of batch) {
          const sample = samples[index];
          const weight = Math.max(0, sample.weight ?? 1);
          const prefixValues = this.prefix.forward([1], true);
          const z = [...prefixValues, ...sample.input];
          const logits = this.base.forward(z, false);
          let gradY: number[];
          let loss = 0;
          if (lossKind === 'crossEntropy') {
            const result = softmaxCrossEntropyGradient(logits, sample.target, weight);
            loss = result.loss;
            gradY = result.gradLogits;
          } else if (lossKind === 'binaryCrossEntropy') {
            const result = binaryCrossEntropyGradient(logits, sample.target, weight);
            loss = result.loss;
            gradY = result.gradLogits;
          } else if (lossKind === 'huber') {
            const result = huberLossGradient(logits, sample.target, options.huberDelta ?? 1, weight);
            loss = result.loss;
            gradY = result.gradOutput;
          } else {
            const result = meanSquaredErrorGradient(logits, sample.target, weight);
            loss = result.loss;
            gradY = result.gradOutput;
          }
          epochLoss += loss;
          // Gradient qua base (đóng băng, không cập nhật): lấy gradInput rồi
          // cắt phần prefix để cập nhật tham số prefix.
          const gradZ = backpropagateNetwork(this.base, gradY, { apply: false }).gradInput;
          const gradPrefix = gradZ.slice(0, this.prefixLength);
          backpropagateNetwork(this.prefix, gradPrefix, {
            gradient,
            apply: false,
          });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.prefix, gradient, {
          optimizer: this.prefix.optimizer,
          batchSize: batch.length,
        });
        steps++;
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: {
        prefixLength: this.prefixLength,
        trainableParameters: this.trainableParameters,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá loss/accuracy của mô hình ghép. */
  public evaluate(samples: readonly SupervisedSample[], loss: SupervisedLoss = 'mse'): EvaluationResult {
    if (samples.length === 0) return { loss: 0, accuracy: null, samples: 0, metrics: {} };
    let total = 0;
    let correct = 0;
    for (const sample of samples) {
      const output = this.predict(sample.input);
      if (loss === 'crossEntropy') {
        total += categoricalCrossEntropy(softmaxVector(output), sample.target);
        if (argmaxIndex(output) === argmaxIndex(sample.target)) correct++;
      } else {
        total += output.reduce((sum, value, i) => sum + (value - (sample.target[i] ?? 0)) ** 2, 0) / output.length;
      }
    }
    return {
      loss: total / samples.length,
      accuracy: loss === 'crossEntropy' ? correct / samples.length : null,
      samples: samples.length,
      metrics: loss === 'crossEntropy' ? { accuracy: correct / samples.length } : {},
    };
  }

  /** Xuất trọng số prefix để lưu checkpoint. */
  public snapshot(): ReturnType<NeuralNetwork['snapshot']> {
    return this.prefix.snapshot();
  }
}

// ---------------------------------------------------------------------------
// QLoRA: base lượng tử hóa k-bit + adapter hạng thấp
// ---------------------------------------------------------------------------

/** Tùy chọn tạo `QuantizedLowRankAdapter`. */
export interface QuantizedLowRankAdapterOptions {
  /** Hạng của adapter; mặc định 4. */
  rank?: number;
  /** Hệ số residual của nhánh adapter; mặc định 1. */
  scale?: number;
  /** Số bit lượng tử hóa base: 2 | 4 | 8; mặc định 4 (đúng tinh thần QLoRA). */
  bits?: 2 | 4 | 8;
  /** Kích thước block lượng tử (mỗi block một scale absmax); mặc định 64. */
  blockSize?: number;
  seed?: number;
  learningRate?: number;
  loss?: SupervisedLoss;
}

/**
 * QLoRA: base đóng băng được *lượng tử hóa k-bit theo block absmax* ngay trong
 * bộ nhớ (fake quantization — giá trị lưu là bậc thang k-bit), chỉ adapter hạng
 * thấp (LoRA) được huấn luyện bằng Adam.
 *
 * Khác `LowRankAdapter` (base giữ float đầy đủ), QLoRA mô phỏng ràng buộc bộ
 * nhớ khi fine-tune mô hình lớn: trọng số base chỉ tồn tại ở các mức rời rạc
 * `round(w/scale)·scale` với scale riêng từng block, nhờ đó checkpoint base
 * nén mạnh mà chất lượng hậu huấn luyện vẫn được bù bằng nhánh adapter.
 */
export class QuantizedLowRankAdapter {
  public readonly base: NeuralNetwork;
  public readonly adapter: NeuralNetwork;
  public readonly scale: number;
  public readonly bits: 2 | 4 | 8;
  public readonly blockSize: number;
  /** Sai số MSE trung bình giữa trọng số gốc và trọng số đã lượng tử hóa. */
  public readonly quantizationError: number;

  constructor(base: NeuralNetwork, options: QuantizedLowRankAdapterOptions = {}) {
    this.base = base;
    this.scale = options.scale ?? 1;
    this.bits = options.bits ?? 4;
    this.blockSize = Math.max(1, Math.floor(options.blockSize ?? 64));
    this.quantizationError = quantizeNetworkInPlace(base, this.bits, this.blockSize);

    const rank = Math.max(1, Math.floor(options.rank ?? 4));
    this.adapter = new NeuralNetwork({
      inputSize: base.inputSize,
      hiddenSizes: [rank],
      outputSize: base.outputSize,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: options.learningRate ?? 0.005,
        weightDecay: 0,
      },
      seed: options.seed ?? 1,
    });
  }

  /** Số tham số trainable (chỉ adapter). */
  public get trainableParameters(): number {
    return networkParameterCount(this.adapter);
  }

  /** Dự đoán kết hợp base lượng tử hóa + adapter. */
  public predict(input: NumericVector): number[] {
    const baseOutput = this.base.forward(input, false);
    const delta = this.adapter.forward(input, false);
    return baseOutput.map((value, index) => value + this.scale * (delta[index] ?? 0));
  }

  /** Huấn luyện adapter trên base lượng tử hóa đóng băng. */
  public fit(samples: readonly SupervisedSample[], options: SupervisedOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const random = new DeepRandom(options.seed ?? 1);
    const lossKind = options.loss ?? 'mse';
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.adapter);
        for (const index of batch) {
          const sample = samples[index];
          const weight = Math.max(0, sample.weight ?? 1);
          const baseOutput = this.base.forward(sample.input, false);
          const delta = this.adapter.forward(sample.input, true);
          const logits = baseOutput.map((value, i) => value + this.scale * (delta[i] ?? 0));
          let gradDelta: number[];
          let loss = 0;
          if (lossKind === 'crossEntropy') {
            const result = softmaxCrossEntropyGradient(logits, sample.target, weight);
            loss = result.loss;
            gradDelta = result.gradLogits.map((value) => value * this.scale);
          } else if (lossKind === 'binaryCrossEntropy') {
            const result = binaryCrossEntropyGradient(logits, sample.target, weight);
            loss = result.loss;
            gradDelta = result.gradLogits.map((value) => value * this.scale);
          } else if (lossKind === 'huber') {
            const result = huberLossGradient(logits, sample.target, options.huberDelta ?? 1, weight);
            loss = result.loss;
            gradDelta = result.gradOutput.map((value) => value * this.scale);
          } else {
            const result = meanSquaredErrorGradient(logits, sample.target, weight);
            loss = result.loss;
            gradDelta = result.gradOutput.map((value) => value * this.scale);
          }
          epochLoss += loss;
          backpropagateNetwork(this.adapter, gradDelta, {
            gradient,
            apply: false,
          });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.adapter, gradient, {
          optimizer: this.adapter.optimizer,
          batchSize: batch.length,
        });
        steps++;
      }
      const average = samples.length > 0 ? epochLoss / samples.length : 0;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: {
        rank: this.adapter.layers[0]?.outputSize ?? 0,
        bits: this.bits,
        blockSize: this.blockSize,
        quantizationError: this.quantizationError,
        trainableParameters: this.trainableParameters,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá loss/accuracy của mô hình ghép. */
  public evaluate(samples: readonly SupervisedSample[], loss: SupervisedLoss = 'mse'): EvaluationResult {
    if (samples.length === 0) return { loss: 0, accuracy: null, samples: 0, metrics: {} };
    let total = 0;
    let correct = 0;
    for (const sample of samples) {
      const output = this.predict(sample.input);
      if (loss === 'crossEntropy') {
        total += categoricalCrossEntropy(softmaxVector(output), sample.target);
        if (argmaxIndex(output) === argmaxIndex(sample.target)) correct++;
      } else {
        total += output.reduce((sum, value, i) => sum + (value - (sample.target[i] ?? 0)) ** 2, 0) / output.length;
      }
    }
    return {
      loss: total / samples.length,
      accuracy: loss === 'crossEntropy' ? correct / samples.length : null,
      samples: samples.length,
      metrics: loss === 'crossEntropy' ? { accuracy: correct / samples.length } : {},
    };
  }

  /** Xuất trọng số adapter để lưu checkpoint. */
  public snapshot(): ReturnType<NeuralNetwork['snapshot']> {
    return this.adapter.snapshot();
  }
}

/**
 * Lượng tử hóa tại chỗ toàn bộ trọng số của mạng theo block absmax.
 *
 * Mỗi block `blockSize` trọng số liên tiếp (duyệt theo hàng) có scale riêng
 * `max|w| / (2^(bits−1) − 1)`; giá trị lưu là bậc thang `round(w/scale)·scale`.
 * Trả sai số MSE chuẩn hóa toàn mạng sau lượng tử hóa.
 */
function quantizeNetworkInPlace(
  network: NeuralNetwork,
  bits: 2 | 4 | 8,
  blockSize: number,
): number {
  const levels = 2 ** (bits - 1) - 1;
  let squaredError = 0;
  let count = 0;
  for (const layer of network.layers) {
    for (const row of layer.weights) {
      for (let start = 0; start < row.length; start += blockSize) {
        const end = Math.min(row.length, start + blockSize);
        let absMax = 0;
        for (let i = start; i < end; i++) absMax = Math.max(absMax, Math.abs(row[i]));
        const step = absMax / levels;
        if (step === 0) continue;
        for (let i = start; i < end; i++) {
          const quantized = Math.round(row[i] / step) * step;
          squaredError += (row[i] - quantized) ** 2;
          count++;
          row[i] = quantized;
        }
      }
    }
  }
  return count > 0 ? squaredError / count : 0;
}
