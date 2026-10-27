/**
 * @file noise-filters.ts
 * @module @aetheria/engine/training/noise-filters
 * @description Nhiều lớp lọc nhiễu trong quá trình train — loại bỏ rác trước
 * khi dữ liệu chạm vào bộ não agent: dữ liệu hỏng (NaN/phi lý), trùng lặp,
 * ngoài vật lý category, ngoại lai (outlier z-score), sai nhãn. Pipeline xếp
 * lớp: mỗi lớp một lý do loại riêng — báo cáo đầy đủ để designer sửa data.
 */

import { clamp01 } from '../deeplearning/random.js';

/** Đặc trưng tối thiểu một sample cần để lọc. */
export interface FilterableSample {
  aspectRatio: number;
  relativeArea: number;
  vertexCount: number;
  centerHeightRatio: number;
  solidity: number;
  /** Nhãn thật (tuỳ chọn — có thì lọc sai nhãn). */
  groundTruth?: string;
}

/** Kết quả một lớp lọc trên một sample. */
export interface FilterVerdict {
  keep: boolean;
  filterName: string;
  reason?: string;
}

/** Một lớp lọc generic — có tên để pipeline định tuyến (duplicate cần seen riêng). */
export interface NoiseFilter<T extends FilterableSample> {
  name: string;
  filter(sample: T, context: FilterContext): FilterVerdict;
}

/** Bối cảnh lọc — thống kê pool hiện tại cho outlier. */
export interface FilterContext {
  /** Category đang lọc (so nhãn). */
  category?: string;
  conceptName?: string;
  /** Trung bình/độ lệch chuẩn các metric của pool — do pipeline tính. */
  stats: {
    aspectMean: number;
    aspectStd: number;
    solidityMean: number;
    solidityStd: number;
    areaMean: number;
    areaStd: number;
  };
  /** Khoảng vật lý category. */
  physics?: { aspectRatioRange: [number, number]; solidityRange: [number, number] };
  /** Ngưỡng z-score để coi là ngoại lai. */
  outlierZ?: number;
}

// ---------------------------------------------------------------------------
// Các lớp lọc dựng sẵn
// ---------------------------------------------------------------------------

/** Lớp 1: dữ liệu hỏng — NaN, Infinity, giá trị phi lý. */
export function corruptionFilter<T extends FilterableSample>(sample: T): FilterVerdict {
  const fields: Array<[string, number]> = [
    ['aspectRatio', sample.aspectRatio],
    ['relativeArea', sample.relativeArea],
    ['vertexCount', sample.vertexCount],
    ['centerHeightRatio', sample.centerHeightRatio],
    ['solidity', sample.solidity],
  ];
  for (const [name, value] of fields) {
    if (!Number.isFinite(value)) {
      return { keep: false, filterName: 'corruption', reason: `${name} = ${value} (NaN/Infinity)` };
    }
  }
  if (sample.aspectRatio <= 0 || sample.relativeArea < 0 || sample.vertexCount < 0) {
    return { keep: false, filterName: 'corruption', reason: 'giá trị âm/0 phi lý' };
  }
  return { keep: true, filterName: 'corruption' };
}

/** Lớp 2: trùng lặp — cùng signature metric (đã biết rồi thì không dạy lại). */
export function sampleSignature(sample: FilterableSample): string {
  return `${sample.aspectRatio.toFixed(3)}|${sample.relativeArea.toFixed(2)}|${sample.vertexCount}|${sample.solidity.toFixed(3)}`;
}

export function duplicateFilter<T extends FilterableSample>(sample: T, seen: Set<string>): FilterVerdict {
  const signature = sampleSignature(sample);
  if (seen.has(signature)) {
    return { keep: false, filterName: 'duplicate', reason: `trùng mẫu đã có (${signature})` };
  }
  seen.add(signature);
  return { keep: true, filterName: 'duplicate' };
}

/** Lớp 3: ngoài vật lý category — aspect/solidity vượt khoảng cho phép. */
export function physicsFilter<T extends FilterableSample>(sample: T, context: FilterContext): FilterVerdict {
  if (!context.physics) return { keep: true, filterName: 'physics' };
  const [minA, maxA] = context.physics.aspectRatioRange;
  const [minS, maxS] = context.physics.solidityRange;
  if (sample.aspectRatio < minA || sample.aspectRatio > maxA) {
    return { keep: false, filterName: 'physics', reason: `aspectRatio ${sample.aspectRatio.toFixed(2)} ngoài [${minA}, ${maxA}]` };
  }
  if (sample.solidity < minS || sample.solidity > maxS) {
    return { keep: false, filterName: 'physics', reason: `solidity ${sample.solidity.toFixed(2)} ngoài [${minS}, ${maxS}]` };
  }
  return { keep: true, filterName: 'physics' };
}

/** Lớp 4: ngoại lai — z-score vượt ngưỡng so với pool. */
export function outlierFilter<T extends FilterableSample>(sample: T, context: FilterContext): FilterVerdict {
  const z = context.outlierZ ?? 3.5;
  const checks: Array<[string, number, number, number]> = [
    ['aspectRatio', sample.aspectRatio, context.stats.aspectMean, context.stats.aspectStd],
    ['solidity', sample.solidity, context.stats.solidityMean, context.stats.solidityStd],
    ['relativeArea', sample.relativeArea, context.stats.areaMean, context.stats.areaStd],
  ];
  for (const [name, value, mean, std] of checks) {
    if (std > 1e-9) {
      const score = Math.abs(value - mean) / std;
      if (score > z) {
        return { keep: false, filterName: 'outlier', reason: `${name} z-score ${score.toFixed(2)} > ${z}` };
      }
    }
  }
  return { keep: true, filterName: 'outlier' };
}

/** Lớp 5: sai nhãn — groundTruth lệch khái niệm của category. */
export function mislabelFilter<T extends FilterableSample>(sample: T, context: FilterContext): FilterVerdict {
  if (!context.conceptName || sample.groundTruth === undefined) return { keep: true, filterName: 'mislabel' };
  if (sample.groundTruth.trim().toLowerCase() !== context.conceptName.toLowerCase()) {
    return { keep: false, filterName: 'mislabel', reason: `nhãn "${sample.groundTruth}" ≠ khái niệm "${context.conceptName}"` };
  }
  return { keep: true, filterName: 'mislabel' };
}

// ---------------------------------------------------------------------------
// Pipeline xếp lớp
// ---------------------------------------------------------------------------

export interface FilterReport<T extends FilterableSample> {
  kept: T[];
  rejected: Array<{ index: number; filter: string; reason?: string }>;
  /** Số bị loại theo từng lớp. */
  rejectedByFilter: Record<string, number>;
  keptCount: number;
}

/** Pipeline nhiều lớp lọc nhiễu — áp tuần tự, sample sống qua tất cả mới giữ. */
export class NoiseFilterPipeline<T extends FilterableSample> {
  private readonly filters: Array<{ name: string; filter: (sample: T, context: FilterContext) => FilterVerdict }> = [];

  /** Thêm một lớp lọc tuỳ chỉnh (game tự định nghĩa) — có tên để định tuyến. */
  public addLayer(name: string, filter: (sample: T, context: FilterContext) => FilterVerdict): this {
    this.filters.push({ name, filter });
    return this;
  }

  /** Pipeline chuẩn: corruption → duplicate → physics → outlier → mislabel. */
  public static standard<T extends FilterableSample>(options: {
    physics?: FilterContext['physics'];
    conceptName?: string;
    outlierZ?: number;
  } = {}): NoiseFilterPipeline<T> {
    const pipeline = new NoiseFilterPipeline<T>();
    pipeline.addLayer('corruption', (sample) => corruptionFilter(sample));
    const seen = new Set<string>();
    pipeline.addLayer('duplicate', (sample) => duplicateFilter(sample, seen));
    pipeline.addLayer('physics', (sample, context) => physicsFilter(sample, context));
    pipeline.addLayer('outlier', (sample, context) => outlierFilter(sample, context));
    pipeline.addLayer('mislabel', (sample, context) => mislabelFilter(sample, context));
    return pipeline;
  }

  /** Áp pipeline lên tập samples — chạy TUẦN TỰ this.filters (custom có hiệu lực). */
  public apply(samples: readonly T[], context: Omit<FilterContext, 'stats'> = {}): FilterReport<T> {
    // Stats pool từ giá trị finite — NaN không được đầu độc outlier.
    const finite = samples.filter((s) =>
      Number.isFinite(s.aspectRatio) && Number.isFinite(s.solidity) && Number.isFinite(s.relativeArea),
    );
    const stats = {
      aspectMean: mean(finite.map((s) => s.aspectRatio)),
      aspectStd: std(finite.map((s) => s.aspectRatio)),
      solidityMean: mean(finite.map((s) => s.solidity)),
      solidityStd: std(finite.map((s) => s.solidity)),
      areaMean: mean(finite.map((s) => s.relativeArea)),
      areaStd: std(finite.map((s) => s.relativeArea)),
    };
    const fullContext: FilterContext = { ...context, stats };
    const kept: T[] = [];
    const rejected: FilterReport<T>['rejected'] = [];
    const rejectedByFilter: Record<string, number> = {};
    // Duplicate layer dùng seen riêng của pipeline — tích luỹ qua các lần apply.
    const seenBatch = new Set<string>();

    samples.forEach((sample, index) => {
      let alive = true;
      for (const layer of this.filters) {
        const verdict = layer.name === 'duplicate'
          ? duplicateFilter(sample, seenBatch)
          : layer.filter(sample, fullContext);
        if (!verdict.keep) {
          rejected.push({ index, filter: layer.name, reason: verdict.reason });
          rejectedByFilter[verdict.filterName] = (rejectedByFilter[verdict.filterName] ?? 0) + 1;
          alive = false;
          break;
        }
      }
      if (alive) kept.push(sample);
    });

    return { kept, rejected, rejectedByFilter, keptCount: kept.length };
  }
}

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function std(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length);
}

/** Utility kẹp an toàn (tái dùng). */
export function safeClamp01(value: number): number {
  return clamp01(Number.isFinite(value) ? value : 0);
}
