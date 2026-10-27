/**
 * @file types.ts
 * @module @aetheria/engine/learning/types
 * @description Hợp đồng dữ liệu và kiểu dùng chung cho toàn bộ runtime học tập
 * (learning runtime). Module này cố ý chỉ chứa kiểu thuần TypeScript, không phụ
 * thuộc DOM/Three.js/Next.js để mọi tầng Application, Adapter và game đều có thể
 * import mà không kéo theo hạ tầng đồ họa.
 *
 * Quy ước:
 * - Một "sample" là dữ liệu huấn luyện tối thiểu; trainer chuyên biệt tự mở rộng.
 * - Dataset là bất biến với người dùng; mọi thao tác tạo bản sao mới.
 * - Report luôn hội tụ về một dạng chung để UI/telemetry có thể hiển thị đồng nhất.
 */

import { DeepRandom } from '../deeplearning/random.js';

/** Vector số thực bất biến. */
export type NumericVector = readonly number[];

/** Vector số thực có thể ghi. */
export type MutableNumericVector = number[];

/** Bản ghi chỉ số đơn giản dùng cho telemetry huấn luyện. */
export type MetricMap = Record<string, number>;

/** Một mẫu học có giám sát tối thiểu. */
export interface SupervisedSample {
  input: NumericVector;
  target: NumericVector;
  /** Trọng số mẫu trong loss; mặc định 1. */
  weight?: number;
}

/** Một mẫu phân loại rời rạc (nhãn là chỉ số hành động/lớp). */
export interface ClassificationSample {
  input: NumericVector;
  label: number;
  weight?: number;
}

/** Một mẫu dự đoán chuỗi/giá trị liên tục. */
export interface RegressionSample {
  input: NumericVector;
  target: NumericVector;
  weight?: number;
}

/** Một mẫu có nhãn xác suất mềm (dùng cho knowledge distillation). */
export interface SoftTargetSample {
  input: NumericVector;
  /** Phân phối xác suất hoặc vector logits đã chuyển về xác suất. */
  target: NumericVector;
  weight?: number;
}

/** Kết quả một lần đánh giá mô hình. */
export interface EvaluationResult {
  loss: number;
  accuracy: number | null;
  samples: number;
  metrics: MetricMap;
}

/** Báo cáo thống nhất sau một chiến dịch huấn luyện. */
export interface LearningReport {
  epochs: number;
  steps: number;
  samples: number;
  initialLoss: number;
  finalLoss: number;
  bestLoss: number;
  lossHistory: number[];
  metrics: MetricMap;
  elapsedMs: number;
  stoppedEarly: boolean;
}

/** Tùy chọn chung cho vòng lặp huấn luyện. */
export interface LearningOptions {
  epochs?: number;
  batchSize?: number;
  shuffle?: boolean;
  /** Seed cho xáo trộn/khởi tạo phụ trợ. */
  seed?: number | string;
  /** Ngưỡng cắt norm gradient; 0 hoặc Infinity = tắt. */
  gradientClip?: number;
  /** Dừng sớm khi loss không cải thiện. */
  earlyStopping?: {
    patience: number;
    minDelta?: number;
  };
}

/** Tùy chọn chia dữ liệu. */
export interface DatasetSplit<T> {
  train: ArrayDataset<T>;
  validation: ArrayDataset<T>;
}

/**
 * Dataset bất biến, có thể lặp và chia batch theo seed.
 * Lớp này là abstraction tối thiểu để các trainer không phụ thuộc mảng thô.
 */
export interface TrainingDataset<T> {
  readonly size: number;
  at(index: number): T;
  all(): readonly T[];
  batches(batchSize: number, options?: { shuffle?: boolean; random?: DeepRandom }): T[][];
}

/** Cài đặt dataset trên mảng, không copy dữ liệu con. */
export class ArrayDataset<T> implements TrainingDataset<T> {
  private readonly items: readonly T[];

  constructor(items: readonly T[]) {
    this.items = [...items];
  }

  public get size(): number {
    return this.items.length;
  }

  public at(index: number): T {
    const item = this.items[index];
    if (item === undefined) throw new RangeError(`Chỉ số dataset ${index} nằm ngoài phạm vi`);
    return item;
  }

  public all(): readonly T[] {
    return this.items;
  }

  public batches(
    batchSize: number,
    options: { shuffle?: boolean; random?: DeepRandom } = {},
  ): T[][] {
    if (batchSize <= 0) throw new RangeError('batchSize phải dương');
    const order = Array.from({ length: this.items.length }, (_, index) => index);
    if (options.shuffle) (options.random ?? new DeepRandom(1)).shuffle(order);
    const result: T[][] = [];
    for (let start = 0; start < order.length; start += batchSize) {
      result.push(order.slice(start, start + batchSize).map((index) => this.items[index]));
    }
    return result;
  }

  /** Chia train/validation theo tỉ lệ validation `[0, 1)`. */
  public split(validationRatio: number, seed: number | string = 1): DatasetSplit<T> {
    const ratio = Math.min(0.95, Math.max(0, validationRatio));
    const order = Array.from({ length: this.items.length }, (_, index) => index);
    new DeepRandom(seed).shuffle(order);
    const validationCount = Math.floor(this.items.length * ratio);
    const validationIndices = new Set(order.slice(0, validationCount));
    const train: T[] = [];
    const validation: T[] = [];
    for (let i = 0; i < this.items.length; i++) {
      (validationIndices.has(i) ? validation : train).push(this.items[i]);
    }
    return { train: new ArrayDataset(train), validation: new ArrayDataset(validation) };
  }

  /** Biến đổi từng phần tử, trả dataset mới. */
  public map<U>(mapper: (item: T, index: number) => U): ArrayDataset<U> {
    return new ArrayDataset(this.items.map(mapper));
  }

  /** Lọc phần tử, trả dataset mới. */
  public filter(predicate: (item: T, index: number) => boolean): ArrayDataset<T> {
    return new ArrayDataset(this.items.filter(predicate));
  }

  /** Lấy một phần dataset; hỗ trợ cả chỉ số âm như `Array.slice`. */
  public slice(start: number, end?: number): ArrayDataset<T> {
    return new ArrayDataset(this.items.slice(start, end));
  }

  /** Nối thêm dữ liệu mà không thay đổi dataset gốc. */
  public concat(other: TrainingDataset<T>): ArrayDataset<T> {
    return new ArrayDataset([...this.items, ...other.all()]);
  }
}

/** Dataset mẫu học có giám sát. */
export class SupervisedDataset extends ArrayDataset<SupervisedSample> {
  /** Kiểm tra tính nhất quán chiều input/target; trả danh sách lỗi. */
  public validate(inputSize?: number, outputSize?: number): string[] {
    const issues: string[] = [];
    for (let i = 0; i < this.size; i++) {
      const sample = this.at(i);
      if (inputSize !== undefined && sample.input.length !== inputSize) {
        issues.push(`Mẫu ${i}: input ${sample.input.length} != ${inputSize}`);
      }
      if (outputSize !== undefined && sample.target.length !== outputSize) {
        issues.push(`Mẫu ${i}: target ${sample.target.length} != ${outputSize}`);
      }
      if (sample.input.length === 0 || sample.target.length === 0) {
        issues.push(`Mẫu ${i}: input/target rỗng`);
      }
    }
    return issues;
  }
}

/** Điểm dữ liệu trong lịch sử hội tụ. */
export interface TrainingPoint {
  epoch: number;
  loss: number;
  validationLoss?: number;
  metrics?: MetricMap;
}

/** Lịch sử huấn luyện có thể serialize cho UI/telemetry. */
export class TrainingHistory {
  private readonly points: TrainingPoint[] = [];

  public push(point: TrainingPoint): void {
    this.points.push({ ...point, metrics: point.metrics ? { ...point.metrics } : undefined });
  }

  public all(): readonly TrainingPoint[] {
    return this.points.map((point) => ({
      ...point,
      metrics: point.metrics ? { ...point.metrics } : undefined,
    }));
  }

  public get length(): number {
    return this.points.length;
  }

  public best(): TrainingPoint | null {
    if (this.points.length === 0) return null;
    return this.points.reduce((best, point) => (point.loss < best.loss ? point : best), this.points[0]);
  }

  public trend(window = 5): 'improving' | 'stable' | 'worsening' {
    if (this.points.length < 2) return 'stable';
    const count = Math.max(1, Math.min(window, Math.floor(this.points.length / 2)));
    const first = this.points.slice(0, count).reduce((sum, point) => sum + point.loss, 0) / count;
    const last = this.points.slice(-count).reduce((sum, point) => sum + point.loss, 0) / count;
    if (last < first * 0.98) return 'improving';
    if (last > first * 1.02) return 'worsening';
    return 'stable';
  }

  /** Giá trị loss gần nhất; trả `Infinity` nếu chưa có điểm. */
  public latestLoss(): number {
    return this.points[this.points.length - 1]?.loss ?? Infinity;
  }
}

/** Checkpoint JSON-compatible cho mọi runtime. */
export interface TrainingCheckpoint<TState> {
  version: 1;
  id: string;
  createdAt: number;
  /** Siêu dữ liệu do ứng dụng tự đặt (không được dùng để phục hồi logic lõi). */
  metadata: Record<string, unknown>;
  state: TState;
}

/** Kho checkpoint trong bộ nhớ, dùng cho test và game session. */
export class InMemoryCheckpointStore<TState> {
  private readonly checkpoints = new Map<string, TrainingCheckpoint<TState>>();

  public save(checkpoint: TrainingCheckpoint<TState>): void {
    this.checkpoints.set(checkpoint.id, {
      ...checkpoint,
      metadata: { ...checkpoint.metadata },
    });
  }

  public load(id: string): TrainingCheckpoint<TState> | null {
    const checkpoint = this.checkpoints.get(id);
    return checkpoint ? { ...checkpoint, metadata: { ...checkpoint.metadata } } : null;
  }

  public latest(): TrainingCheckpoint<TState> | null {
    let best: TrainingCheckpoint<TState> | null = null;
    for (const checkpoint of this.checkpoints.values()) {
      if (!best || checkpoint.createdAt >= best.createdAt) best = checkpoint;
    }
    return best ? { ...best, metadata: { ...best.metadata } } : null;
  }

  public list(): TrainingCheckpoint<TState>[] {
    return [...this.checkpoints.values()]
      .map((checkpoint) => ({ ...checkpoint, metadata: { ...checkpoint.metadata } }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  public remove(id: string): boolean {
    return this.checkpoints.delete(id);
  }
}

/** Hàm chuẩn hóa vector về `[0, 1]`; trả vector mới. */
export function normalize01(values: NumericVector): number[] {
  if (values.length === 0) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return values.map(() => 0.5);
  return values.map((value) => (value - min) / (max - min));
}

/** Hàm chuẩn hóa z-score; trả vector mới và thống kê để tái sử dụng lúc inference. */
export function standardize(values: NumericVector): {
  values: number[];
  mean: number;
  std: number;
} {
  if (values.length === 0) return { values: [], mean: 0, std: 1 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance) || 1;
  return { values: values.map((value) => (value - mean) / std), mean, std };
}

/** Tạo id checkpoint không phụ thuộc DOM. */
export function createCheckpointId(prefix: string, sequence: number): string {
  return `${prefix}_${sequence}_${Date.now().toString(36)}`;
}
