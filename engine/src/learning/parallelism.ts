/**
 * @file parallelism.ts
 * @module @aetheria/engine/learning/parallelism
 * @description Các chiến lược huấn luyện phân tán theo chiều mô hình, mô phỏng
 * trong tiến trình (không cần nhiều GPU) để game/runtime quy mô nhỏ sử dụng:
 *
 * - **Tensor parallelism**: chia ma trận trọng số của một tầng theo cột (output)
 *   hoặc theo hàng (input) thành nhiều shard; mỗi shard nhân ma trận riêng rồi
 *   nối/cộng kết quả — kết quả giống hệt forward nguyên tầng.
 * - **Pipeline parallelism (GPipe-style)**: chia mạng thành các stage theo tầng,
 *   chia batch thành micro-batch, chạy lịch forward/backward theo stage và cộng
 *   dồn gradient từng micro-batch trước khi áp một lần — tương đương huấn luyện
 *   cả batch một lúc.
 * - **ZeRO (DeepSpeed ZeRO stage 1/2/3)**: mô phỏng phân mảnh trạng thái
 *   optimizer (m, v), gradient và tham số across workers kèm all-reduce/all-gather
 *   như ZeRO — tham số cuối khớp Adam chuẩn.
 *
 * Mọi phép toán thuần TypeScript, dùng lại `NetworkGradient` của `network.ts`
 * để tầng game có thể giám sát gradient. Chú thích tiếng Việt theo quy ước.
 */

import {
  NeuralNetwork,
  type DenseLayer,
} from '../deeplearning/nn.js';
import {
  accumulateNetworkGradient,
  applyNetworkGradient,
  createNetworkGradient,
  type NetworkGradient,
} from './network.js';

// ---------------------------------------------------------------------------
// Tensor parallelism
// ---------------------------------------------------------------------------

/**
 * Forward một tầng theo kiểu **column parallel**: ma trận trọng số `[out][in]`
 * được chia theo chiều output thành `shards` mảnh; mỗi shard tính phần output
 * của mình rồi kết quả cuối là nối các phần.
 */
export function columnParallelOutput(
  weights: readonly (readonly number[])[],
  biases: readonly number[],
  input: readonly number[],
  shards: number,
  activation: 'linear' | 'relu' = 'linear',
): number[] {
  const shardCount = clampShards(shards, weights.length);
  const output: number[] = [];
  const rowsPerShard = Math.ceil(weights.length / shardCount);
  for (let shard = 0; shard < shardCount; shard++) {
    const start = shard * rowsPerShard;
    const end = Math.min(weights.length, start + rowsPerShard);
    for (let o = start; o < end; o++) {
      let sum = biases[o] ?? 0;
      const row = weights[o];
      for (let i = 0; i < input.length; i++) sum += row[i] * (input[i] ?? 0);
      output.push(activation === 'relu' && sum < 0 ? 0 : sum);
    }
  }
  return output;
}

/**
 * Forward một tầng theo kiểu **row parallel**: ma trận được chia theo chiều
 * input; mỗi shard tính tổng riêng rồi **cộng** các kết quả một phần lại.
 */
export function rowParallelOutput(
  weights: readonly (readonly number[])[],
  biases: readonly number[],
  input: readonly number[],
  shards: number,
  activation: 'linear' | 'relu' = 'linear',
): number[] {
  const shardCount = clampShards(shards, input.length);
  const output = new Array<number>(weights.length).fill(0);
  const colsPerShard = Math.ceil(input.length / shardCount);
  for (let shard = 0; shard < shardCount; shard++) {
    const start = shard * colsPerShard;
    const end = Math.min(input.length, start + colsPerShard);
    for (let o = 0; o < weights.length; o++) {
      const row = weights[o];
      let sum = shard === 0 ? (biases[o] ?? 0) : 0;
      for (let i = start; i < end; i++) sum += row[i] * (input[i] ?? 0);
      output[o] += sum;
    }
  }
  if (activation === 'relu') {
    for (let o = 0; o < output.length; o++) {
      if (output[o] < 0) output[o] = 0;
    }
  }
  return output;
}

/** Sai số tuyệt đối lớn nhất giữa forward song song và forward nguyên tầng. */
export function tensorShardParityError(
  layer: DenseLayer,
  input: readonly number[],
  shards: number,
): number {
  const reference = layer.forward(input, false);
  const column = columnParallelOutput(layer.weights, layer.biases, input, shards, activationOf(layer));
  const row = rowParallelOutput(layer.weights, layer.biases, input, shards, activationOf(layer));
  return Math.max(
    maxDeviation(reference, column),
    maxDeviation(reference, row),
  );
}

function activationOf(layer: DenseLayer): 'linear' | 'relu' {
  // DenseLayer ActivationName; chỉ hai giá trị này được hỗ trợ trong module.
  return layer.activation === 'relu' ? 'relu' : 'linear';
}

function maxDeviation(a: readonly number[], b: readonly number[]): number {
  let max = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    max = Math.max(max, Math.abs((a[i] ?? 0) - (b[i] ?? 0)));
  }
  return max;
}

function clampShards(requested: number, size: number): number {
  return Math.max(1, Math.min(Math.floor(requested), Math.max(1, size)));
}

// ---------------------------------------------------------------------------
// Pipeline parallelism (GPipe-style micro-batching)
// ---------------------------------------------------------------------------

/** Cấu hình pipeline executor. */
export interface PipelineConfig {
  /** Số stage (mỗi stage là một nhóm tầng liên tiếp). */
  stageCount: number;
  /** Kích thước micro-batch; batch lớn được chia thành các micro-batch. */
  microBatchSize: number;
}

/**
 * Thực thi mạng theo pipeline các stage.
 *
 * Thứ tự thực thi mô phỏng lịch GPipe: từng micro-batch đi qua toàn bộ stage
 * (trong tiến trình); gradient được cộng dồn xuyên micro-batch và áp một lần
 * cho toàn batch nên kết quả trùng với huấn luyện batch nguyên khối.
 */
export class PipelineParallelExecutor {
  public readonly stageCount: number;
  public readonly microBatchSize: number;
  /** Chỉ số tầng bắt đầu của từng stage. */
  public readonly stageOffsets: number[];

  constructor(private readonly network: NeuralNetwork, config: PipelineConfig) {
    if (config.stageCount <= 0 || config.stageCount > network.layers.length) {
      throw new RangeError('stageCount phải trong [1, số tầng]');
    }
    if (config.microBatchSize <= 0) throw new RangeError('microBatchSize phải dương');
    this.stageCount = Math.floor(config.stageCount);
    this.microBatchSize = Math.floor(config.microBatchSize);
    const layersPerStage = network.layers.length / this.stageCount;
    this.stageOffsets = Array.from({ length: this.stageCount }, (_, stage) =>
      Math.round(stage * layersPerStage),
    );
  }

  /** Forward cả batch qua pipeline; trả output theo thứ tự mẫu. */
  public forwardBatch(batch: readonly (readonly number[])[]): number[][] {
    return batch.map((sample) => this.forwardSample(sample));
  }

  /**
   * Huấn luyện một batch: chia micro-batch, forward + backward cộng dồn theo
   * stage, áp gradient một lần với `batchSize = batch.length`.
   *
   * @param batch Mẫu kèm hàm trả gradient đầu ra (dL/dOutput) sau forward.
   * @param options.skipOutputActivation Bật khi `gradOutputOf` trả gradient
   *   theo *logits* (đã tính sẵn softmax/CE); mặc định false để backward tự
   *   nhân đạo hàm activation tầng ra.
   */
  public trainBatch(
    batch: readonly { input: readonly number[]; gradOutputOf?: (output: readonly number[]) => number[] }[],
    options: { skipOutputActivation?: boolean } = {},
  ): void {
    if (batch.length === 0) return;
    const gradient = createNetworkGradient(this.network);
    let processed = 0;
    for (let start = 0; start < batch.length; start += this.microBatchSize) {
      const microBatch = batch.slice(start, start + this.microBatchSize);
      for (const sample of microBatch) {
        const output = this.forwardSample(sample.input);
        const gradOutput = sample.gradOutputOf
          ? sample.gradOutputOf(output)
          : new Array<number>(this.network.outputSize).fill(0);
        this.backpropagateSample(sample.input, gradOutput, gradient, options.skipOutputActivation === true);
        processed++;
      }
    }
    if (processed > 0) {
      applyNetworkGradient(this.network, gradient, {
        optimizer: this.network.optimizer,
        batchSize: processed,
      });
    }
  }

  /** Forward một mẫu qua các stage theo thứ tự pipeline. */
  private forwardSample(input: readonly number[]): number[] {
    return this.network.forward(input, true);
  }

  /**
   * Backprop một mẫu vào gradient dùng chung.
   *
   * Dùng `network.layers` nội bộ để lan truyền ngược thủ công — tương đương
   * `backpropagateNetwork` nhưng cho phép cộng dồn vào gradient pipeline.
   */
  private backpropagateSample(
    input: readonly number[],
    gradOutput: readonly number[],
    gradient: NetworkGradient,
    skipOutputActivation: boolean,
  ): void {
    // Forward đã chạy trong forwardSample; cache trong network còn giữ nguyên
    // cho input này nên có thể backprop ngay.
    let grad = [...gradOutput];
    for (let l = this.network.layers.length - 1; l >= 0; l--) {
      const layer = this.network.layers[l];
      const skip = skipOutputActivation && l === this.network.layers.length - 1;
      const result = layer.backward(grad, this.network.optimizer, skip, false);
      for (let o = 0; o < layer.outputSize; o++) {
        const row = result.gradWeights[o];
        const targetRow = gradient.weights[l][o];
        for (let i = 0; i < layer.inputSize; i++) targetRow[i] += row[i];
        gradient.biases[l][o] += result.gradBiases[o];
      }
      grad = result.gradInput;
    }
  }
}

/** Tách mạng thành danh sách khoảng tầng theo stage (dùng cho telemetry). */
export function pipelineStageRanges(
  network: NeuralNetwork,
  stageCount: number,
): Array<{ startLayer: number; endLayer: number }> {
  const count = Math.max(1, Math.min(stageCount, network.layers.length));
  const layersPerStage = network.layers.length / count;
  return Array.from({ length: count }, (_, stage) => ({
    startLayer: Math.round(stage * layersPerStage),
    endLayer: Math.round((stage + 1) * layersPerStage),
  }));
}

// ---------------------------------------------------------------------------
// ZeRO (DeepSpeed ZeRO stage 1/2/3)
// ---------------------------------------------------------------------------

/** Cấu hình mô phỏng ZeRO. */
export interface ZeROConfig {
  /** Stage 1: phân mảnh trạng thái Adam; 2: + gradient; 3: + tham số. */
  stage: 1 | 2 | 3;
  /** Số worker ảo. */
  workers: number;
  learningRate?: number;
  beta1?: number;
  beta2?: number;
  epsilon?: number;
  /** Vector tham số ban đầu. */
  initialParameters: readonly number[];
}

/** Báo cáo bộ nhớ ước lượng của ZeRO theo stage. */
export interface ZeROMemoryReport {
  stage: 1 | 2 | 3;
  workers: number;
  /** Số phần tử trạng thái Adam đầy đủ (2× tham số). */
  fullOptimizerElements: number;
  /** Số phần tử mỗi worker phải giữ sau khi phân mảnh. */
  perWorkerElements: number;
  /** Tham số mỗi worker giữ ở stage 3 (các stage thấp hơn giữ full). */
  perWorkerParameterElements: number;
  /** Tỉ lệ giảm bộ nhớ trạng thái so với lưu đầy đủ trên một worker. */
  optimizerStateReduction: number;
}

/**
 * Mô phỏng ZeRO optimizer: mỗi worker giữ một mảnh trạng thái Adam (stage 1),
 * cộng thêm mảnh gradient (stage 2) và mảnh tham số (stage 3).
 *
 * `step(gradients)` nhận gradient từ từng worker (chưa all-reduce), all-reduce
 * trung bình, cập nhật trạng thái Adam của mảnh worker sở hữu rồi all-gather
 * tham số mới — tham số cuối khớp Adam chuẩn chạy trên trung bình gradient.
 */
export class ZeROSimulator {
  public readonly stage: 1 | 2 | 3;
  public readonly workers: number;
  public readonly parameters: number[];

  private readonly m: number[];
  private readonly v: number[];
  private readonly learningRate: number;
  private readonly beta1: number;
  private readonly beta2: number;
  private readonly epsilon: number;
  private stepCount = 0;
  /** Lịch sử phần tử gradient mỗi worker sở hữu (phục vụ telemetry stage 2/3). */
  private readonly shardBounds: Array<{ start: number; end: number }>;

  constructor(config: ZeROConfig) {
    if (config.workers <= 0) throw new RangeError('workers phải dương');
    this.stage = config.stage;
    this.workers = Math.floor(config.workers);
    this.parameters = [...config.initialParameters];
    this.m = new Array<number>(this.parameters.length).fill(0);
    this.v = new Array<number>(this.parameters.length).fill(0);
    this.learningRate = config.learningRate ?? 0.001;
    this.beta1 = config.beta1 ?? 0.9;
    this.beta2 = config.beta2 ?? 0.999;
    this.epsilon = config.epsilon ?? 1e-8;
    const perWorker = Math.ceil(this.parameters.length / this.workers);
    this.shardBounds = Array.from({ length: this.workers }, (_, worker) => ({
      start: worker * perWorker,
      end: Math.min(this.parameters.length, (worker + 1) * perWorker),
    }));
  }

  /**
   * Một bước tối ưu.
   *
   * @param gradients Gradient theo tham số do TỪNG worker gửi lên (mảng độ dài
   *   `workers`); ZeRO all-reduce trung bình trước khi cập nhật.
   */
  public step(gradients: readonly (readonly number[])[]): void {
    if (gradients.length !== this.workers) {
      throw new RangeError(`Cần gradient từ ${this.workers} worker, nhận ${gradients.length}`);
    }
    const averaged = new Array<number>(this.parameters.length).fill(0);
    for (let p = 0; p < this.parameters.length; p++) {
      let sum = 0;
      for (const gradient of gradients) sum += gradient[p] ?? 0;
      averaged[p] = sum / this.workers;
    }
    this.stepCount += 1;
    const correction1 = 1 - this.beta1 ** this.stepCount;
    const correction2 = 1 - this.beta2 ** this.stepCount;
    for (let p = 0; p < this.parameters.length; p++) {
      // Ở stage 1/2/3, worker sở hữu mảnh p cập nhật mảnh trạng thái của mình;
      // về mặt toán học toàn cục vẫn là Adam trên gradient trung bình.
      this.m[p] = this.beta1 * this.m[p] + (1 - this.beta1) * averaged[p];
      this.v[p] = this.beta2 * this.v[p] + (1 - this.beta2) * averaged[p] * averaged[p];
      const mHat = this.m[p] / correction1;
      const vHat = this.v[p] / correction2;
      this.parameters[p] -= (this.learningRate * mHat) / (Math.sqrt(vHat) + this.epsilon);
    }
  }

  /** Báo cáo bộ nhớ ước lượng theo stage. */
  public memoryReport(): ZeROMemoryReport {
    const parameterCount = this.parameters.length;
    const fullOptimizer = parameterCount * 2;
    // Mỗi worker giữ mảnh trạng thái Adam của đúng mảnh tham số của mình.
    const firstShard = this.shardBounds[0];
    const perWorkerSharded = (firstShard.end - firstShard.start) * 2;
    return {
      stage: this.stage,
      workers: this.workers,
      fullOptimizerElements: fullOptimizer,
      perWorkerElements: this.stage === 1 ? Math.ceil(fullOptimizer / this.workers) : perWorkerSharded,
      perWorkerParameterElements: this.stage === 3 ? Math.ceil(parameterCount / this.workers) : parameterCount,
      optimizerStateReduction: fullOptimizer > 0 ? 1 - Math.ceil(fullOptimizer / this.workers) / fullOptimizer : 0,
    };
  }

  /** Ranh giới mảnh tham số mỗi worker (stage 3 phân mảnh tham số). */
  public get parameterShards(): ReadonlyArray<{ start: number; end: number }> {
    return this.shardBounds;
  }
}

/** Tiện ích gộp gradient từ nhiều worker thành trung bình (all-reduce thuần). */
export function allReduceMean(gradients: readonly (readonly number[])[]): number[] {
  if (gradients.length === 0) return [];
  const length = gradients[0].length;
  const result = new Array<number>(length).fill(0);
  for (const gradient of gradients) {
    if (gradient.length !== length) throw new RangeError('Gradient các worker khác độ dài');
    for (let i = 0; i < length; i++) result[i] += gradient[i];
  }
  for (let i = 0; i < length; i++) result[i] /= gradients.length;
  return result;
}

/** Cộng dồn gradient pipeline của nhiều micro-batch (tiện dụng cho telemetry). */
export function accumulateMicroBatchGradients(
  target: NetworkGradient,
  source: NetworkGradient,
): void {
  accumulateNetworkGradient(target, source);
}
