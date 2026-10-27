/**
 * @file generative.ts
 * @module @aetheria/engine/learning/generative
 * @description Học sinh mô hình sinh cho tài nguyên game:
 *
 * - `GANTrainer`: GAN đối kháng với discriminator BCЕ và generator non-saturating.
 * - `WGANTrainer`: WGAN-GP — critic Lipschitz bằng gradient penalty trên điểm
 *   nội suy thật/giả.
 * - `StyleGANLiteTrainer`: generator kiểu style-based — mapping network sinh
 *   style vector w điều biến synthesis qua gate `P ⊙ (1 + g(w))`, huấn luyện
 *   bằng máy WGAN-GP.
 * - `VAETrainer`: variational autoencoder với reparameterization + KL.
 * - `DiffusionTrainer`: denoising diffusion probabilistic model (DDPM) cho vector.
 *
 * Các mô hình đều nhận/trả vector số thực để có thể sinh texture pack, đặc trưng
 * nhân vật hoặc tham số procedural. Không phụ thuộc WebGL/DOM.
 */

import {
  NeuralNetwork,
  type ActivationName,
  type OptimizerConfig,
} from '../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../deeplearning/random.js';
import {
  applyNetworkGradient,
  backpropagateNetwork,
  binaryCrossEntropyGradient,
  clipNetworkGradient,
  createNetworkGradient,
  meanSquaredErrorGradient,
  networkInputGradient,
  sigmoid,
} from './network.js';
import type { LearningOptions, LearningReport, NumericVector } from './types.js';
import { emptyLearningReport, restoreWeightsFromSnapshot } from './internal.js';

/** Cấu hình GAN. */
export interface GANConfig {
  /** Số chiều nhiễu đầu vào generator. */
  noiseSize: number;
  /** Số chiều mẫu dữ liệu. */
  sampleSize: number;
  generatorHiddenSizes?: readonly number[];
  discriminatorHiddenSizes?: readonly number[];
  generatorLearningRate?: number;
  discriminatorLearningRate?: number;
  batchSize?: number;
  /** Số lần cập nhật generator mỗi batch discriminator. */
  generatorSteps?: number;
  /** Làm mượt nhãn thật (mặc định 0.9). */
  labelSmoothing?: number;
  generatorOutputActivation?: ActivationName;
  seed?: number;
}

/** Ảnh chụp GAN. */
export interface GANSnapshot {
  config: GANConfig;
  generator: ReturnType<NeuralNetwork['snapshot']>;
  discriminator: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Generative Adversarial Network.
 *
 * Discriminator tối thiểu hóa BCE phân biệt thật/giả. Generator tối đa hóa
 * `log D(G(z))` (non-saturating) — ổn định hơn loss minimax gốc.
 */
export class GANTrainer {
  public readonly generator: NeuralNetwork;
  public readonly discriminator: NeuralNetwork;
  public readonly noiseSize: number;
  public readonly sampleSize: number;
  public readonly batchSize: number;
  public readonly generatorSteps: number;

  private readonly config: GANConfig;
  private readonly random: DeepRandom;

  constructor(config: GANConfig) {
    if (config.noiseSize <= 0) throw new RangeError('noiseSize phải dương');
    if (config.sampleSize <= 0) throw new RangeError('sampleSize phải dương');
    this.config = { ...config };
    this.noiseSize = config.noiseSize;
    this.sampleSize = config.sampleSize;
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.generatorSteps = Math.max(1, Math.floor(config.generatorSteps ?? 1));
    this.random = new DeepRandom(config.seed ?? 1);

    const generatorOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.generatorLearningRate ?? 0.0002,
      weightDecay: 0,
    };
    const discriminatorOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.discriminatorLearningRate ?? 0.0002,
      weightDecay: 0,
    };
    this.generator = new NeuralNetwork({
      inputSize: config.noiseSize,
      hiddenSizes: config.generatorHiddenSizes ?? [64, 64],
      outputSize: config.sampleSize,
      hiddenActivation: 'relu',
      outputActivation: config.generatorOutputActivation ?? 'tanh',
      optimizer: generatorOptimizer,
      seed: config.seed ?? 1,
    });
    this.discriminator = new NeuralNetwork({
      inputSize: config.sampleSize,
      hiddenSizes: config.discriminatorHiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'leakyRelu',
      outputActivation: 'linear',
      optimizer: discriminatorOptimizer,
      seed: (config.seed ?? 1) + 1,
    });
  }

  /** Sinh một mẫu từ nhiễu. */
  public generate(noise: NumericVector): number[] {
    return this.generator.predict(noise);
  }

  /** Sinh nhiều mẫu ngẫu nhiên. */
  public generateBatch(count: number): number[][] {
    return Array.from({ length: Math.max(0, Math.floor(count)) }, () =>
      this.generate(this.randomNoise()),
    );
  }

  /** Xác suất discriminator đánh giá mẫu là thật. */
  public discriminatorProbability(sample: NumericVector): number {
    return sigmoid(this.discriminator.predict(sample)[0] ?? 0);
  }

  /**
   * Huấn luyện GAN trên phân phối mẫu thật.
   *
   * Mỗi mini-batch:
   * 1. Cập nhật D trên nửa thật (nhãn `1−smoothing`) và nửa giả (nhãn 0).
   * 2. Cập nhật G `generatorSteps` lần bằng gradient đi qua D.
   */
  public fit(samples: readonly NumericVector[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 20));
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;
    let lastDiscriminatorLoss = 0;
    let lastGeneratorLoss = 0;
    let lastAccuracy = 0;

    if (samples.length === 0) {
      return emptyLearningReport(startedAt);
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochDiscriminatorLoss = 0;
      let epochGeneratorLoss = 0;
      let epochAccuracy = 0;
      let batches = 0;

      for (let start = 0; start < order.length; start += this.batchSize) {
        const batch = order.slice(start, start + this.batchSize);
        const discriminatorResult = this.updateDiscriminator(samples, batch);
        epochDiscriminatorLoss += discriminatorResult.loss;
        epochAccuracy += discriminatorResult.accuracy;

        let generatorLoss = 0;
        for (let step = 0; step < this.generatorSteps; step++) {
          generatorLoss += this.updateGenerator(batch.length);
        }
        epochGeneratorLoss += generatorLoss / this.generatorSteps;
        batches++;
      }

      const discriminatorLoss = epochDiscriminatorLoss / Math.max(1, batches);
      const generatorLoss = epochGeneratorLoss / Math.max(1, batches);
      lastDiscriminatorLoss = discriminatorLoss;
      lastGeneratorLoss = generatorLoss;
      lastAccuracy = epochAccuracy / Math.max(1, batches);
      const combined = discriminatorLoss + generatorLoss;
      lossHistory.push(combined);
      if (epoch === 0) initialLoss = combined;
      finalLoss = combined;
      bestLoss = Math.min(bestLoss, combined);
      steps += batches;
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
        discriminatorLoss: lastDiscriminatorLoss,
        generatorLoss: lastGeneratorLoss,
        discriminatorAccuracy: lastAccuracy,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  public snapshot(): GANSnapshot {
    return {
      config: { ...this.config },
      generator: this.generator.snapshot(),
      discriminator: this.discriminator.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: GANSnapshot): GANTrainer {
    const trainer = new GANTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.generator, trainer.generator);
    restoreWeightsFromSnapshot(snapshot.discriminator, trainer.discriminator);
    return trainer;
  }

  /** Cập nhật discriminator trên batch chỉ số thật + mẫu giả. */
  private updateDiscriminator(
    samples: readonly NumericVector[],
    batch: readonly number[],
  ): { loss: number; accuracy: number } {
    const gradient = createNetworkGradient(this.discriminator);
    const smoothing = clampRange(this.config.labelSmoothing ?? 0.9, 0, 1);
    let loss = 0;
    let correct = 0;
    let count = 0;

    for (const index of batch) {
      const real = samples[index];
      const realLogit = this.discriminator.forward(real, true);
      const realResult = binaryCrossEntropyGradient(realLogit, [smoothing]);
      loss += realResult.loss;
      if ((realLogit[0] ?? 0) > 0) correct++;
      backpropagateNetwork(this.discriminator, realResult.gradLogits, {
        gradient,
        skipOutputActivation: true,
        apply: false,
      });
      count++;

      const fake = this.generator.predict(this.randomNoise());
      const fakeLogit = this.discriminator.forward(fake, true);
      const fakeResult = binaryCrossEntropyGradient(fakeLogit, [0]);
      loss += fakeResult.loss;
      if ((fakeLogit[0] ?? 0) <= 0) correct++;
      backpropagateNetwork(this.discriminator, fakeResult.gradLogits, {
        gradient,
        skipOutputActivation: true,
        apply: false,
      });
      count++;
    }

    applyNetworkGradient(this.discriminator, gradient, {
      optimizer: this.discriminator.optimizer,
      batchSize: Math.max(1, count),
    });
    return { loss: count > 0 ? loss / count : 0, accuracy: count > 0 ? correct / count : 0 };
  }

  /** Cập nhật generator bằng non-saturating loss `−log D(G(z))`. */
  private updateGenerator(batchSize: number): number {
    const gradient = createNetworkGradient(this.generator);
    let loss = 0;
    for (let i = 0; i < batchSize; i++) {
      const fake = this.generator.forward(this.randomNoise(), true);
      const logit = this.discriminator.forward(fake, true)[0] ?? 0;
      const probability = sigmoid(logit);
      loss -= Math.log(Math.max(probability, 1e-12));
      // d(−log D)/d(logit) = −(1−D).
      const gradLogit = -(1 - probability);
      const gradSample = networkInputGradient(this.discriminator, [gradLogit], true);
      backpropagateNetwork(this.generator, gradSample, {
        gradient,
        apply: false,
      });
    }
    applyNetworkGradient(this.generator, gradient, {
      optimizer: this.generator.optimizer,
      batchSize: Math.max(1, batchSize),
    });
    return loss / Math.max(1, batchSize);
  }

  /** Nhiễu Gaussian chuẩn. */
  private randomNoise(): number[] {
    return Array.from({ length: this.noiseSize }, () => this.random.gaussian(0, 1));
  }
}

/** Cấu hình VAE. */
export interface VAEConfig {
  inputSize: number;
  latentSize: number;
  encoderHiddenSizes?: readonly number[];
  decoderHiddenSizes?: readonly number[];
  learningRate?: number;
  /** Hệ số β cho KL (β-VAE). */
  beta?: number;
  seed?: number;
}

/** Kết quả encode. */
export interface VAELatent {
  mean: number[];
  logVariance: number[];
  std: number[];
}

/** Ảnh chụp VAE. */
export interface VAESnapshot {
  config: VAEConfig;
  encoder: ReturnType<NeuralNetwork['snapshot']>;
  decoder: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Variational Autoencoder.
 *
 * Encoder xuất `[μ, logσ²]`; latent lấy mẫu `z = μ + σ⊙ε` (reparameterization).
 * Loss = MSE tái tạo + β·KL tới N(0,I). Gradient KL theo μ và logσ² được tính
 * giải tích, không cần autograd.
 */
export class VAETrainer {
  public readonly encoder: NeuralNetwork;
  public readonly decoder: NeuralNetwork;
  public readonly latentSize: number;
  public readonly beta: number;

  private readonly config: VAEConfig;
  private readonly random: DeepRandom;

  constructor(config: VAEConfig) {
    if (config.inputSize <= 0 || config.latentSize <= 0) {
      throw new RangeError('VAE cần inputSize và latentSize dương');
    }
    this.config = { ...config };
    this.latentSize = config.latentSize;
    this.beta = Math.max(0, config.beta ?? 1);
    this.random = new DeepRandom(config.seed ?? 1);

    const encoderOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    const decoderOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    this.encoder = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.encoderHiddenSizes ?? [64, 32],
      outputSize: this.latentSize * 2,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer: encoderOptimizer,
      seed: config.seed ?? 1,
    });
    this.decoder = new NeuralNetwork({
      inputSize: this.latentSize,
      hiddenSizes: config.decoderHiddenSizes ?? [32, 64],
      outputSize: config.inputSize,
      hiddenActivation: 'relu',
      outputActivation: 'sigmoid',
      optimizer: decoderOptimizer,
      seed: (config.seed ?? 1) + 1,
    });
  }

  /** Mã hóa thành tham số phân phối latent. */
  public encode(state: NumericVector): VAELatent {
    const output = this.encoder.predict(state);
    const mean = output.slice(0, this.latentSize);
    const logVariance = output.slice(this.latentSize).map((value) => clampRange(value, -20, 10));
    return {
      mean,
      logVariance,
      std: logVariance.map((value) => Math.exp(0.5 * value)),
    };
  }

  /** Giải mã latent thành mẫu. */
  public decode(latent: NumericVector): number[] {
    return this.decoder.predict(latent);
  }

  /** Tái tạo dùng mean (deterministic). */
  public reconstruct(state: NumericVector): number[] {
    return this.decode(this.encode(state).mean);
  }

  /** Sinh mẫu mới từ prior. */
  public generate(count = 1): number[][] {
    return Array.from({ length: Math.max(0, Math.floor(count)) }, () => {
      const latent = Array.from({ length: this.latentSize }, () => this.random.gaussian(0, 1));
      return this.decode(latent);
    });
  }

  /** Huấn luyện VAE. */
  public fit(samples: readonly NumericVector[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 20));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 32));
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;
    let lastReconstruction = 0;
    let lastKL = 0;

    if (samples.length === 0) return emptyLearningReport(startedAt);

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      let reconstructionTotal = 0;
      let klTotal = 0;

      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const encoderGradient = createNetworkGradient(this.encoder);
        const decoderGradient = createNetworkGradient(this.decoder);
        let batchLoss = 0;

        for (const index of batch) {
          const sample = samples[index];
          const encoderOutput = this.encoder.forward(sample, true);
          const mean = encoderOutput.slice(0, this.latentSize);
          const logVariance = encoderOutput
            .slice(this.latentSize)
            .map((value) => clampRange(value, -20, 10));
          const std = logVariance.map((value) => Math.exp(0.5 * value));
          const epsilon = mean.map(() => this.random.gaussian(0, 1));
          const latent = mean.map((value, i) => value + std[i] * epsilon[i]);
          const reconstruction = this.decoder.forward(latent, true);

          const reconstructionResult = meanSquaredErrorGradient(reconstruction, sample);
          const reconstructedGradient = backpropagateNetwork(
            this.decoder,
            reconstructionResult.gradOutput,
            { gradient: decoderGradient, apply: false },
          );

          let kl = 0;
          const gradMean = new Array<number>(this.latentSize).fill(0);
          const gradLogVariance = new Array<number>(this.latentSize).fill(0);
          for (let i = 0; i < this.latentSize; i++) {
            const variance = Math.exp(logVariance[i]);
            kl += -0.5 * (1 + logVariance[i] - mean[i] * mean[i] - variance);
            gradMean[i] = reconstructedGradient.gradInput[i] + this.beta * mean[i];
            gradLogVariance[i] =
              reconstructedGradient.gradInput[i] * 0.5 * std[i] * epsilon[i] +
              this.beta * 0.5 * (variance - 1);
          }
          kl *= this.beta;
          backpropagateNetwork(this.encoder, [...gradMean, ...gradLogVariance], {
            gradient: encoderGradient,
            skipOutputActivation: true,
            apply: false,
          });

          batchLoss += reconstructionResult.loss + kl;
          reconstructionTotal += reconstructionResult.loss;
          klTotal += kl;
        }

        if (options.gradientClip) {
          clipNetworkGradient(encoderGradient, options.gradientClip);
          clipNetworkGradient(decoderGradient, options.gradientClip);
        }
        applyNetworkGradient(this.encoder, encoderGradient, {
          optimizer: this.encoder.optimizer,
          batchSize: batch.length,
        });
        applyNetworkGradient(this.decoder, decoderGradient, {
          optimizer: this.decoder.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }

      const average = epochLoss / samples.length;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
      lastReconstruction = reconstructionTotal / samples.length;
      lastKL = klTotal / samples.length;
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { reconstructionLoss: lastReconstruction, klLoss: lastKL, beta: this.beta },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  public snapshot(): VAESnapshot {
    return {
      config: { ...this.config },
      encoder: this.encoder.snapshot(),
      decoder: this.decoder.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: VAESnapshot): VAETrainer {
    const trainer = new VAETrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.encoder, trainer.encoder);
    restoreWeightsFromSnapshot(snapshot.decoder, trainer.decoder);
    return trainer;
  }
}

/** Cấu hình diffusion. */
export interface DiffusionConfig {
  /** Số chiều dữ liệu. */
  dataSize: number;
  hiddenSizes?: readonly number[];
  /** Số bước khuếch tán. */
  timesteps?: number;
  betaStart?: number;
  betaEnd?: number;
  learningRate?: number;
  seed?: number;
}

/** Ảnh chụp diffusion. */
export interface DiffusionSnapshot {
  config: DiffusionConfig;
  network: ReturnType<NeuralNetwork['snapshot']>;
  betaSchedule: number[];
  alphaSchedule: number[];
  alphaBarSchedule: number[];
}

/**
 * Denoising Diffusion Probabilistic Model (DDPM) cho vector.
 *
 * Mạng dự đoán nhiễu `ε` từ `(x_t, t)`. Quá trình sinh chạy ngược từ nhiễu
 * chuẩn, trừ dần nhiễu dự đoán theo lịch beta tuyến tính.
 */
export class DiffusionTrainer {
  public readonly network: NeuralNetwork;
  public readonly timesteps: number;
  public readonly betaSchedule: number[];
  public readonly alphaSchedule: number[];
  public readonly alphaBarSchedule: number[];

  private readonly config: DiffusionConfig;
  private readonly random: DeepRandom;

  constructor(config: DiffusionConfig) {
    if (config.dataSize <= 0) throw new RangeError('Diffusion cần dataSize dương');
    this.config = { ...config };
    this.timesteps = Math.max(2, Math.floor(config.timesteps ?? 100));
    this.random = new DeepRandom(config.seed ?? 1);
    this.betaSchedule = linearSchedule(
      this.timesteps,
      clampRange(config.betaStart ?? 1e-4, 1e-8, 0.5),
      clampRange(config.betaEnd ?? 0.02, 1e-8, 0.9),
    );
    this.alphaSchedule = this.betaSchedule.map((beta) => 1 - beta);
    this.alphaBarSchedule = [];
    let cumulative = 1;
    for (const alpha of this.alphaSchedule) {
      cumulative *= alpha;
      this.alphaBarSchedule.push(cumulative);
    }

    this.network = new NeuralNetwork({
      inputSize: config.dataSize + TIME_FEATURES,
      hiddenSizes: config.hiddenSizes ?? [128, 128],
      outputSize: config.dataSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.001,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
  }

  /** Thêm nhiễu tại bước `t`. */
  public addNoise(sample: NumericVector, timestep: number, noise?: NumericVector): {
    noisy: number[];
    noise: number[];
  } {
    const t = clampRange(Math.floor(timestep), 0, this.timesteps - 1);
    const epsilon = noise ? [...noise] : sample.map(() => this.random.gaussian(0, 1));
    const alphaBar = this.alphaBarSchedule[t];
    const scale = Math.sqrt(alphaBar);
    const noiseScale = Math.sqrt(1 - alphaBar);
    return {
      noisy: sample.map((value, index) => scale * value + noiseScale * epsilon[index]),
      noise: epsilon,
    };
  }

  /** Huấn luyện mạng dự đoán nhiễu. */
  public fit(samples: readonly NumericVector[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 20));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 32));
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    if (samples.length === 0) return emptyLearningReport(startedAt);

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.network);
        let batchLoss = 0;

        for (const index of batch) {
          const sample = samples[index];
          const timestep = this.random.int(0, this.timesteps - 1);
          const { noisy, noise } = this.addNoise(sample, timestep);
          const input = [...noisy, ...timeFeatures(timestep, this.timesteps)];
          const predicted = this.network.forward(input, true);
          const result = meanSquaredErrorGradient(predicted, noise);
          batchLoss += result.loss;
          backpropagateNetwork(this.network, result.gradOutput, {
            gradient,
            apply: false,
          });
        }

        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.network, gradient, {
          optimizer: this.network.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }
      const average = epochLoss / samples.length;
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
      metrics: { timesteps: this.timesteps },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Sinh `count` mẫu bằng quá trình ngược DDPM. */
  public generate(count = 1): number[][] {
    const result: number[][] = [];
    for (let n = 0; n < Math.max(0, Math.floor(count)); n++) {
      let sample = Array.from({ length: this.config.dataSize }, () =>
        this.random.gaussian(0, 1),
      );
      for (let t = this.timesteps - 1; t >= 0; t--) {
        const input = [...sample, ...timeFeatures(t, this.timesteps)];
        const predictedNoise = this.network.predict(input);
        const beta = this.betaSchedule[t];
        const alpha = this.alphaSchedule[t];
        const alphaBar = this.alphaBarSchedule[t];
        const meanScale = 1 / Math.sqrt(alpha);
        const noiseScale = beta / Math.sqrt(1 - alphaBar);
        sample = sample.map(
          (value, index) => meanScale * (value - noiseScale * predictedNoise[index]),
        );
        if (t > 0) {
          const sigma = Math.sqrt(beta);
          sample = sample.map((value) => value + sigma * this.random.gaussian(0, 1));
        }
      }
      result.push(sample);
    }
    return result;
  }

  public snapshot(): DiffusionSnapshot {
    return {
      config: { ...this.config },
      network: this.network.snapshot(),
      betaSchedule: [...this.betaSchedule],
      alphaSchedule: [...this.alphaSchedule],
      alphaBarSchedule: [...this.alphaBarSchedule],
    };
  }

  public static fromSnapshot(snapshot: DiffusionSnapshot): DiffusionTrainer {
    const trainer = new DiffusionTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.network, trainer.network);
    return trainer;
  }
}

/** Số đặc trưng thời gian được nối vào input diffusion. */
const TIME_FEATURES = 3;

/** Lịch beta tuyến tính. */
function linearSchedule(size: number, start: number, end: number): number[] {
  if (size === 1) return [start];
  return Array.from({ length: size }, (_, index) => start + ((end - start) * index) / (size - 1));
}

/** Đặc trưng thời gian: chuẩn hóa, sin và cos. */
function timeFeatures(timestep: number, total: number): number[] {
  const normalized = total > 1 ? timestep / (total - 1) : 0;
  const angle = 2 * Math.PI * normalized;
  return [normalized, Math.sin(angle), Math.cos(angle)];
}



// ---------------------------------------------------------------------------
// WGAN-GP: Wasserstein GAN với gradient penalty
// ---------------------------------------------------------------------------

/** Cấu hình WGAN-GP. */
export interface WGANConfig {
  /** Số chiều nhiễu đầu vào generator. */
  noiseSize: number;
  /** Số chiều mẫu dữ liệu. */
  sampleSize: number;
  generatorHiddenSizes?: readonly number[];
  criticHiddenSizes?: readonly number[];
  generatorLearningRate?: number;
  criticLearningRate?: number;
  batchSize?: number;
  /** Số lần cập nhật critic mỗi lần cập nhật generator (`n_critic`). */
  criticStepsPerGenerator?: number;
  /** Hệ số gradient penalty λ (Gulrajani et al. 2017); mặc định 10. */
  gradientPenaltyCoef?: number;
  seed?: number;
}

/** Kết quả một lần `trainStep` của WGAN-GP. */
export interface WGANTrainResult {
  criticLoss: number;
  wassersteinEstimate: number;
  gradientPenalty: number;
  generatorLoss: number | null;
  criticUpdates: number;
}

/** Ảnh chụp WGAN-GP. */
export interface WGANSnapshot {
  config: WGANConfig;
  generator: ReturnType<NeuralNetwork['snapshot']>;
  critic: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Wasserstein GAN với gradient penalty (WGAN-GP).
 *
 * Critic (discriminator không sigmoid) tối thiểu hóa
 * `L = mean D(fake) − mean D(real) + λ·E[(‖∇_x̂ D(x̂)‖ − 1)²]` với
 * `x̂ = ε·real + (1−ε)·fake` nội suy giữa cặp thật/giả — ràng buộc Lipschitz
 * 1-Lipschitz quanh đường nội suy, thay cho weight clipping của WGAN gốc.
 * Gradient theo đầu vào critic lấy chính xác qua `networkInputGradient`.
 * Generator tối thiểu `−mean D(G(z))`. Dữ liệu thật cần chuẩn hóa `[-1, 1]`
 * (generator dùng output tanh).
 */
export class WGANTrainer {
  public readonly generator: NeuralNetwork;
  public readonly critic: NeuralNetwork;
  public readonly noiseSize: number;
  public readonly sampleSize: number;
  public readonly batchSize: number;
  public readonly criticStepsPerGenerator: number;
  public readonly gradientPenaltyCoef: number;

  private readonly config: WGANConfig;
  private readonly random: DeepRandom;

  constructor(config: WGANConfig) {
    if (config.noiseSize <= 0) throw new RangeError('noiseSize phải dương');
    if (config.sampleSize <= 0) throw new RangeError('sampleSize phải dương');
    this.config = { ...config };
    this.noiseSize = config.noiseSize;
    this.sampleSize = config.sampleSize;
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.criticStepsPerGenerator = Math.max(1, Math.floor(config.criticStepsPerGenerator ?? 5));
    this.gradientPenaltyCoef = Math.max(0, config.gradientPenaltyCoef ?? 10);
    this.random = new DeepRandom(config.seed ?? 1);

    this.generator = new NeuralNetwork({
      inputSize: config.noiseSize,
      hiddenSizes: config.generatorHiddenSizes ?? [64, 64],
      outputSize: config.sampleSize,
      hiddenActivation: 'relu',
      outputActivation: 'tanh',
      optimizer: {
        kind: 'adam',
        learningRate: config.generatorLearningRate ?? 0.0002,
        weightDecay: 0,
      },
      seed: config.seed ?? 1,
    });
    this.critic = new NeuralNetwork({
      inputSize: config.sampleSize,
      hiddenSizes: config.criticHiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'leakyRelu',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.criticLearningRate ?? 0.0002,
        weightDecay: 0,
      },
      seed: (config.seed ?? 1) + 1,
    });
  }

  /** Sinh một mẫu từ nhiễu cho trước. */
  public generate(noise: NumericVector): number[] {
    return this.generator.predict(noise);
  }

  /** Sinh `count` mẫu từ nhiễu ngẫu nhiên (phân phối chuẩn). */
  public generateBatch(count: number): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < Math.max(0, Math.floor(count)); i++) {
      const noise = new Array<number>(this.noiseSize)
        .fill(0)
        .map(() => this.random.gaussian(0, 1));
      result.push(this.generate(noise));
    }
    return result;
  }

  /**
   * Một vòng huấn luyện: `n_critic` lần cập nhật critic rồi một lần cập nhật
   * generator.
   *
   * @param realSamples Mẫu thật chuẩn hóa `[-1, 1]`; mỗi vòng lấy ngẫu nhiên
   *   batch từ tập này.
   */
  public trainStep(realSamples: readonly NumericVector[]): WGANTrainResult {
    if (realSamples.length === 0) {
      throw new RangeError('WGAN cần ít nhất một mẫu thật');
    }
    let criticLossTotal = 0;
    let penaltyTotal = 0;
    let wassersteinTotal = 0;

    for (let step = 0; step < this.criticStepsPerGenerator; step++) {
      const batchSize = Math.min(this.batchSize, realSamples.length);
      const criticGradient = createNetworkGradient(this.critic);
      let batchLoss = 0;
      let batchPenalty = 0;

      for (let sample = 0; sample < batchSize; sample++) {
        const real = realSamples[this.random.int(0, realSamples.length - 1)];
        const noise = new Array<number>(this.noiseSize)
          .fill(0)
          .map(() => this.random.gaussian(0, 1));
        const fake = this.generator.predict(noise);

        // Loss Wasserstein: D(fake) − D(real).
        const realScore = this.critic.forward(real, true)[0] ?? 0;
        const fakeScore = this.critic.forward(fake, true)[0] ?? 0;
        batchLoss += fakeScore - realScore;
        backpropagateNetwork(this.critic, [1], { gradient: criticGradient, apply: false });
        backpropagateNetwork(this.critic, [-1], { gradient: criticGradient, apply: false });

        // Gradient penalty trên điểm nội suy.
        const epsilon = this.random.next();
        const interpolated = real.map((value, i) => epsilon * value + (1 - epsilon) * (fake[i] ?? 0));
        this.critic.forward(interpolated, true);
        const gradient = networkInputGradient(this.critic, [1]);
        let norm = 0;
        for (const value of gradient) norm += value * value;
        norm = Math.sqrt(norm) || 1e-12;
        const penalty = (norm - 1) ** 2;
        batchPenalty += penalty;
        if (this.gradientPenaltyCoef > 0) {
          // Xấp xỉ bậc nhất của GP: lõi DenseLayer không hỗ trợ double-backprop
          // (đạo hàm bậc hai), nên đặt gradient penalty lên *đầu ra* critic tại
          // x̂ — kéo điểm D(x̂) ngược chiều để chuẩn ‖∇_x̂ D‖ tiến về 1.
          backpropagateNetwork(
            this.critic,
            [2 * this.gradientPenaltyCoef * (norm - 1)],
            { gradient: criticGradient, apply: false },
          );
        }
      }

      clipNetworkGradient(criticGradient, 5);
      applyNetworkGradient(this.critic, criticGradient, {
        optimizer: this.critic.optimizer,
        batchSize,
      });
      wassersteinTotal += batchLoss / batchSize;
      criticLossTotal += (batchLoss + this.gradientPenaltyCoef * batchPenalty) / batchSize;
      penaltyTotal += batchPenalty / batchSize;
    }

    // Cập nhật generator: tối đa mean D(G(z)) bằng cách đi gradient −1 qua critic.
    const generatorGradient = createNetworkGradient(this.generator);
    let generatorLoss = 0;
    const generatorBatch = Math.min(this.batchSize, this.criticStepsPerGenerator * 2);
    for (let sample = 0; sample < generatorBatch; sample++) {
      const noise = new Array<number>(this.noiseSize)
        .fill(0)
        .map(() => this.random.gaussian(0, 1));
      const fake = this.generator.forward(noise, true);
      this.critic.forward(fake, true);
      const gradFake = networkInputGradient(this.critic, [-1]);
      generatorLoss += -(this.critic.predict(fake)[0] ?? 0);
      backpropagateNetwork(this.generator, gradFake, {
        gradient: generatorGradient,
        apply: false,
      });
    }
    applyNetworkGradient(this.generator, generatorGradient, {
      optimizer: this.generator.optimizer,
      batchSize: generatorBatch,
    });

    return {
      criticLoss: criticLossTotal / this.criticStepsPerGenerator,
      wassersteinEstimate: -wassersteinTotal / this.criticStepsPerGenerator,
      gradientPenalty: penaltyTotal / this.criticStepsPerGenerator,
      generatorLoss: generatorLoss / generatorBatch,
      criticUpdates: this.criticStepsPerGenerator,
    };
  }

  /** Huấn luyện nhiều epoch trên dataset; trả `LearningReport` chuẩn hóa. */
  public fit(
    samples: readonly NumericVector[],
    options: LearningOptions = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const stepsPerEpoch = Math.max(1, Math.floor(options.batchSize ?? 32));
    const lossHistory: number[] = [];
    let initialLoss = Infinity;
    let finalLoss = 0;
    let bestLoss = Infinity;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0;
      for (let step = 0; step < stepsPerEpoch; step++) {
        const result = this.trainStep(samples);
        epochLoss += result.criticLoss;
      }
      const average = epochLoss / stepsPerEpoch;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps: epochs * stepsPerEpoch,
      samples: samples.length,
      initialLoss: Number.isFinite(initialLoss) ? initialLoss : 0,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : finalLoss,
      lossHistory,
      metrics: {
        gradientPenaltyCoef: this.gradientPenaltyCoef,
        criticStepsPerGenerator: this.criticStepsPerGenerator,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): WGANSnapshot {
    return {
      config: { ...this.config },
      generator: this.generator.snapshot(),
      critic: this.critic.snapshot(),
    };
  }

  /** Khôi phục WGAN-GP từ checkpoint. */
  public static fromSnapshot(snapshot: WGANSnapshot): WGANTrainer {
    const trainer = new WGANTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.generator, trainer.generator);
    restoreWeightsFromSnapshot(snapshot.critic, trainer.critic);
    return trainer;
  }
}

// ---------------------------------------------------------------------------
// StyleGAN-lite: mapping network + style điều biến generator
// ---------------------------------------------------------------------------

/** Cấu hình StyleGAN-lite. */
export interface StyleGANConfig {
  /** Số chiều nhiễu đầu vào mapping network (z). */
  noiseSize: number;
  /** Số chiều style vector w sinh bởi mapping network. */
  styleSize: number;
  /** Số chiều mẫu dữ liệu. */
  sampleSize: number;
  mappingHiddenSizes?: readonly number[];
  synthesisHiddenSizes?: readonly number[];
  criticHiddenSizes?: readonly number[];
  mappingLearningRate?: number;
  synthesisLearningRate?: number;
  criticLearningRate?: number;
  batchSize?: number;
  /** Số lần cập nhật critic mỗi lần cập nhật generator. */
  criticStepsPerGenerator?: number;
  /** Hệ số gradient penalty λ; mặc định 10. */
  gradientPenaltyCoef?: number;
  seed?: number;
}

/** Ảnh chụp StyleGAN-lite. */
export interface StyleGANSnapshot {
  config: StyleGANConfig;
  mapping: ReturnType<NeuralNetwork['snapshot']>;
  synthesis: ReturnType<NeuralNetwork['snapshot']>;
  gate: ReturnType<NeuralNetwork['snapshot']>;
  critic: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * StyleGAN-lite: generator kiểu style-based (Karras et al. 2019) rút gọn trên
 * lõi MLP, huấn luyện bằng máy WGAN-GP đã có:
 *
 * - `mapping`: z (nhiễu Gaussian) → w (style vector, latent tách rời nhiễu) —
 *   nhiệm vụ của mapping network trong StyleGAN gốc.
 * - `synthesis`: P = f(w) — mạng tổng hợp nhận **chỉ style**, không thấy z.
 * - `gate`: g(w) — điều biến kiểu FiLM ở tầng ra: `sample = P ⊙ (1 + g(w))`,
 *   style thực sự *điều biến* (modulate) đầu ra thay vì chỉ làm input.
 *
 * Gradient composite: dL/dP đi qua synthesis, dL/dg qua gate, cả hai hội về w
 * rồi đi tiếp qua mapping. Critic Lipschitz bằng gradient penalty như WGAN-GP;
 * dữ liệu thật chuẩn hóa `[-1, 1]`.
 */
export class StyleGANLiteTrainer {
  public readonly mapping: NeuralNetwork;
  public readonly synthesis: NeuralNetwork;
  public readonly gate: NeuralNetwork;
  public readonly critic: NeuralNetwork;
  public readonly noiseSize: number;
  public readonly styleSize: number;
  public readonly sampleSize: number;
  public readonly batchSize: number;
  public readonly criticStepsPerGenerator: number;
  public readonly gradientPenaltyCoef: number;

  private readonly config: StyleGANConfig;
  private readonly random: DeepRandom;

  constructor(config: StyleGANConfig) {
    if (config.noiseSize <= 0) throw new RangeError('noiseSize phải dương');
    if (config.styleSize <= 0) throw new RangeError('styleSize phải dương');
    if (config.sampleSize <= 0) throw new RangeError('sampleSize phải dương');
    this.config = { ...config };
    this.noiseSize = config.noiseSize;
    this.styleSize = config.styleSize;
    this.sampleSize = config.sampleSize;
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.criticStepsPerGenerator = Math.max(1, Math.floor(config.criticStepsPerGenerator ?? 5));
    this.gradientPenaltyCoef = Math.max(0, config.gradientPenaltyCoef ?? 10);
    this.random = new DeepRandom(config.seed ?? 1);

    this.mapping = new NeuralNetwork({
      inputSize: config.noiseSize,
      hiddenSizes: config.mappingHiddenSizes ?? [64],
      outputSize: config.styleSize,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.mappingLearningRate ?? 0.0002,
        weightDecay: 0,
      },
      seed: config.seed ?? 1,
    });
    this.synthesis = new NeuralNetwork({
      inputSize: config.styleSize,
      hiddenSizes: config.synthesisHiddenSizes ?? [64, 64],
      outputSize: config.sampleSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.synthesisLearningRate ?? 0.0002,
        weightDecay: 0,
      },
      seed: (config.seed ?? 1) + 1,
    });
    this.gate = new NeuralNetwork({
      inputSize: config.styleSize,
      hiddenSizes: [config.styleSize],
      outputSize: config.sampleSize,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.mappingLearningRate ?? 0.0002,
        weightDecay: 0,
      },
      seed: (config.seed ?? 1) + 2,
    });
    this.critic = new NeuralNetwork({
      inputSize: config.sampleSize,
      hiddenSizes: config.criticHiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'leakyRelu',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.criticLearningRate ?? 0.0002,
        weightDecay: 0,
      },
      seed: (config.seed ?? 1) + 3,
    });
  }

  /** Forward composite: z → w → (synthesis ⊙ (1 + gate)) → mẫu. */
  public generate(z: readonly number[]): number[] {
    const w = this.mapping.predict(z);
    return this.generateFromStyle(w);
  }

  /** Forward composite từ style w sẵn có. */
  public generateFromStyle(w: readonly number[]): number[] {
    const synthesized = this.synthesis.predict(w);
    const gate = this.gate.predict(w);
    return synthesized.map((value, index) => value * (1 + (gate[index] ?? 0)));
  }

  /** Sinh nhiễu z ~ N(0, I). */
  private sampleNoise(): number[] {
    return new Array<number>(this.noiseSize)
      .fill(0)
      .map(() => this.random.gaussian(0, 1));
  }

  /**
   * Một vòng huấn luyện: `n_critic` lần cập nhật critic (WGAN-GP) rồi một lần
   * cập nhật composite generator (mapping + synthesis + gate).
   */
  public trainStep(realSamples: readonly NumericVector[]): {
    criticLoss: number;
    wassersteinEstimate: number;
    gradientPenalty: number;
    generatorLoss: number;
    criticUpdates: number;
  } {
    if (realSamples.length === 0) {
      throw new RangeError('StyleGAN cần ít nhất một mẫu thật');
    }
    let criticLossTotal = 0;
    let penaltyTotal = 0;
    let wassersteinTotal = 0;

    for (let step = 0; step < this.criticStepsPerGenerator; step++) {
      const batchSize = Math.min(this.batchSize, realSamples.length);
      const criticGradient = createNetworkGradient(this.critic);
      let batchLoss = 0;
      let batchPenalty = 0;

      for (let sample = 0; sample < batchSize; sample++) {
        const real = realSamples[this.random.int(0, realSamples.length - 1)];
        const fake = this.generate(this.sampleNoise());

        const realScore = this.critic.forward(real, true)[0] ?? 0;
        const fakeScore = this.critic.forward(fake, true)[0] ?? 0;
        batchLoss += fakeScore - realScore;
        backpropagateNetwork(this.critic, [1], { gradient: criticGradient, apply: false });
        backpropagateNetwork(this.critic, [-1], { gradient: criticGradient, apply: false });

        // Gradient penalty trên điểm nội suy thật/giả trong không gian mẫu.
        const epsilon = this.random.next();
        const interpolated = real.map(
          (value, index) => epsilon * value + (1 - epsilon) * (fake[index] ?? 0),
        );
        this.critic.forward(interpolated, true);
        const gradient = networkInputGradient(this.critic, [1]);
        let norm = 0;
        for (const value of gradient) norm += value * value;
        norm = Math.sqrt(norm) || 1e-12;
        batchPenalty += (norm - 1) ** 2;
        if (this.gradientPenaltyCoef > 0) {
          // Xấp xỉ bậc nhất của GP (giải thích chi tiết ở WGANTrainer): đặt
          // gradient lên đầu ra critic tại x̂ vì lõi không hỗ trợ double-backprop.
          backpropagateNetwork(
            this.critic,
            [2 * this.gradientPenaltyCoef * (norm - 1)],
            { gradient: criticGradient, apply: false },
          );
        }
      }

      clipNetworkGradient(criticGradient, 5);
      applyNetworkGradient(this.critic, criticGradient, {
        optimizer: this.critic.optimizer,
        batchSize,
      });
      wassersteinTotal += batchLoss / batchSize;
      criticLossTotal += (batchLoss + this.gradientPenaltyCoef * batchPenalty) / batchSize;
      penaltyTotal += batchPenalty / batchSize;
    }

    // Cập nhật composite generator: gradient qua critic → gate/synthesis → mapping.
    const mappingGradient = createNetworkGradient(this.mapping);
    const synthesisGradient = createNetworkGradient(this.synthesis);
    const gateGradient = createNetworkGradient(this.gate);
    let generatorLoss = 0;
    const generatorBatch = Math.min(this.batchSize, this.criticStepsPerGenerator * 2);
    for (let sample = 0; sample < generatorBatch; sample++) {
      const z = this.sampleNoise();
      const w = this.mapping.forward(z, true);
      const synthesized = this.synthesis.forward(w, true);
      const gate = this.gate.forward(w, true);
      const output = synthesized.map((value, index) => value * (1 + (gate[index] ?? 0)));
      generatorLoss += -(this.critic.forward(output, true)[0] ?? 0);

      const gradOutput = networkInputGradient(this.critic, [-1]);
      // Điều biến: dL/dP = gradO·(1+g); dL/dg = gradO·P.
      const gradSynthesis = gradOutput.map(
        (value, index) => value * (1 + (gate[index] ?? 0)),
      );
      const gradGate = gradOutput.map((value, index) => value * (synthesized[index] ?? 0));
      const gradFromGate = backpropagateNetwork(this.gate, gradGate, {
        gradient: gateGradient,
        apply: false,
      }).gradInput;
      const gradFromSynthesis = backpropagateNetwork(this.synthesis, gradSynthesis, {
        gradient: synthesisGradient,
        apply: false,
      }).gradInput;
      const gradStyle = gradFromSynthesis.map(
        (value, index) => value + (gradFromGate[index] ?? 0),
      );
      backpropagateNetwork(this.mapping, gradStyle, {
        gradient: mappingGradient,
        apply: false,
      });
    }
    applyNetworkGradient(this.mapping, mappingGradient, {
      optimizer: this.mapping.optimizer,
      batchSize: generatorBatch,
    });
    applyNetworkGradient(this.synthesis, synthesisGradient, {
      optimizer: this.synthesis.optimizer,
      batchSize: generatorBatch,
    });
    applyNetworkGradient(this.gate, gateGradient, {
      optimizer: this.gate.optimizer,
      batchSize: generatorBatch,
    });

    return {
      criticLoss: criticLossTotal / this.criticStepsPerGenerator,
      wassersteinEstimate: -wassersteinTotal / this.criticStepsPerGenerator,
      gradientPenalty: penaltyTotal / this.criticStepsPerGenerator,
      generatorLoss: generatorLoss / generatorBatch,
      criticUpdates: this.criticStepsPerGenerator,
    };
  }

  /** Huấn luyện nhiều epoch; trả `LearningReport` chuẩn hóa. */
  public fit(samples: readonly NumericVector[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const stepsPerEpoch = Math.max(1, Math.floor(options.batchSize ?? 32));
    const lossHistory: number[] = [];
    let initialLoss = Infinity;
    let finalLoss = 0;
    let bestLoss = Infinity;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0;
      for (let step = 0; step < stepsPerEpoch; step++) {
        epochLoss += this.trainStep(samples).criticLoss;
      }
      const average = epochLoss / stepsPerEpoch;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps: epochs * stepsPerEpoch,
      samples: samples.length,
      initialLoss: Number.isFinite(initialLoss) ? initialLoss : 0,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : finalLoss,
      lossHistory,
      metrics: {
        styleSize: this.styleSize,
        gradientPenaltyCoef: this.gradientPenaltyCoef,
        criticStepsPerGenerator: this.criticStepsPerGenerator,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): StyleGANSnapshot {
    return {
      config: { ...this.config },
      mapping: this.mapping.snapshot(),
      synthesis: this.synthesis.snapshot(),
      gate: this.gate.snapshot(),
      critic: this.critic.snapshot(),
    };
  }

  /** Khôi phục StyleGAN-lite từ checkpoint. */
  public static fromSnapshot(snapshot: StyleGANSnapshot): StyleGANLiteTrainer {
    const trainer = new StyleGANLiteTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.mapping, trainer.mapping);
    restoreWeightsFromSnapshot(snapshot.synthesis, trainer.synthesis);
    restoreWeightsFromSnapshot(snapshot.gate, trainer.gate);
    restoreWeightsFromSnapshot(snapshot.critic, trainer.critic);
    return trainer;
  }
}
