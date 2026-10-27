/**
 * @file asset-quality.ts
 * @module @aetheria/engine/training/asset-quality
 * @description Chấm điểm CHẤT LƯỢNG assets sinh ra theo 4 tiêu chí đặc tả
 * ("chuẩn, mượt, đẹp, nét") và **bám theo xu hướng chất lượng qua các batch**
 * — bằng chứng engine tối ưu sau khi đối chiếu mẫu:
 *
 * - **chuẩn** (`standard`): metric nằm trung tâm vùng vật lý của category
 *   (aspectRatio/solidity/centerHeightRatio càng gần midpoint càng chuẩn).
 * - **mượt** (`smooth`): độ biến động giữa các sample kế tiếp trong pool thấp
 *   (jitter thấp = đường nét mượt, không răng cưa thống kê).
 * - **đẹp** (`beauty`): cân bằng bố cục — aspectRatio và centerHeightRatio
 *   ổn định quanh trung vị pool, lệch chuẩn nhỏ.
 * - **nét** (`sharp`): mật độ chi tiết — vertexCount tương xớp diện tích,
 *   đủ nét nhưng không rác (trên ngưỡng tối thiểu).
 *
 * `QualityGuidedCampaign` bọc `MassiveTrainingRunner`: sau mỗi batch chấm
 * điểm pool, **nâng dần ngưỡng nhận** khi xu hướng tăng (engine tự siết chuẩn
 * theo thời gian) và xuất báo cáo xu hướng để đối chiếu.
 */

import { clamp01 } from '../deeplearning/random.js';
import { MassiveTrainingRunner, loadCheckpointFile, type CampaignResult } from './scale.js';
import { CATEGORY_PHYSICS, type CategoryPhysics } from './object-renderer.js';

/** Một sample shape trong pool (khớp MassTrainingLoop). */
export interface AssetShapeSample {
  aspectRatio: number;
  relativeArea: number;
  vertexCount: number;
  centerHeightRatio: number;
  solidity: number;
}

/** Trọng số 4 tiêu chí (tổng không cần = 1, sẽ chuẩn hóa). */
export interface AssetQualityWeights {
  standard: number;
  smooth: number;
  beauty: number;
  sharp: number;
}

/** Trọng số mặc định: chuẩn 35%, mượt 25%, đẹp 25%, nét 15%. */
export const DEFAULT_QUALITY_WEIGHTS: Readonly<AssetQualityWeights> = Object.freeze({
  standard: 0.35,
  smooth: 0.25,
  beauty: 0.25,
  sharp: 0.15,
});

/** Điểm chất lượng chi tiết. */
export interface AssetQualityScore {
  standard: number;
  smooth: number;
  beauty: number;
  sharp: number;
  /** Tổng hợp có trọng số ∈ [0, 1]. */
  overall: number;
}

/** Center của một khoảng. */
function centerOf(range: readonly [number, number]): number {
  return (range[0] + range[1]) / 2;
}

/** Nửa độ rộng khoảng (để chuẩn hóa khoảng cách). */
function halfSpanOf(range: readonly [number, number]): number {
  return Math.max(1e-9, (range[1] - range[0]) / 2);
}

/** Điểm "gần tâm": 1 khi đúng tâm khoảng, giảm tuyến tính về 0 tại biên. */
function centerCloseness(value: number, range: readonly [number, number]): number {
  const distance = Math.abs(value - centerOf(range)) / halfSpanOf(range);
  return clamp01(1 - distance);
}

/** Điểm "nằm trong khoảng" (0 ngoài, 1 trong — mép ≈ 0.5 qua closeness biên). */
function insideRange(value: number, range: readonly [number, number]): number {
  const [low, high] = range;
  if (value >= low && value <= high) return 1;
  const distance = value < low ? low - value : value - high;
  return clamp01(1 - distance / halfSpanOf(range));
}

/**
 * Chấm điểm một sample theo physics của category.
 * `poolStats` cho điểm mượt/đẹp dựa trên phân phối pool hiện tại.
 */
export function scoreAssetSample(
  sample: AssetShapeSample,
  physics: CategoryPhysics,
  poolStats: { aspectRatioStd: number; solidityStd: number; vertexPerAreaMedian: number },
): AssetQualityScore {
  // CHUẨN: cả 3 metric nằm gần tâm vùng vật lý.
  const standard =
    0.4 * centerCloseness(sample.aspectRatio, physics.aspectRatioRange) +
    0.35 * centerCloseness(sample.solidity, physics.solidityRange) +
    0.25 * centerCloseness(sample.centerHeightRatio, physics.centerHeightRange);

  // MƯỢT: độ lệch sample khỏi trung bình pool thấp (ít jitter thống kê).
  const jitter =
    Math.abs(sample.aspectRatio - centerOf(physics.aspectRatioRange)) / halfSpanOf(physics.aspectRatioRange) * 0.5 +
    Math.abs(sample.solidity - centerOf(physics.solidityRange)) / halfSpanOf(physics.solidityRange) * 0.5;
  const smooth = clamp01(1 - jitter / 2) * (1 - clamp01(poolStats.aspectRatioStd));

  // ĐẸP: cân bằng bố cục — solidity ổn định + centerHeight ở nửa trên (cấu trúc đứng vững).
  const solidityStability = 1 - clamp01(poolStats.solidityStd);
  const balance = insideRange(sample.centerHeightRatio, physics.centerHeightRange) *
    insideRange(sample.aspectRatio, physics.aspectRatioRange);
  const beauty = clamp01(0.5 * solidityStability + 0.5 * balance);

  // NÉT: mật độ đỉnh so với trung vị pool — đủ chi tiết, quá dày cũng giảm.
  const vertexPerArea = sample.vertexCount / Math.max(1e-6, sample.relativeArea);
  const ratio = vertexPerArea / Math.max(1e-9, poolStats.vertexPerAreaMedian);
  const sharp = ratio >= 1 ? clamp01(1 - (ratio - 1) / 2) : clamp01(ratio);

  const weights = DEFAULT_QUALITY_WEIGHTS;
  const overall = clamp01(
    (weights.standard * standard + weights.smooth * smooth + weights.beauty * beauty + weights.sharp * sharp) /
      (weights.standard + weights.smooth + weights.beauty + weights.sharp),
  );
  return { standard, smooth, beauty, sharp, overall };
}

/** Thống kê pool phục vụ chấm điểm (độ lệch chuẩn + trung vị mật độ). */
export function computePoolStats(pool: readonly AssetShapeSample[]): {
  aspectRatioStd: number;
  solidityStd: number;
  vertexPerAreaMedian: number;
} {
  if (pool.length === 0) {
    return { aspectRatioStd: 0, solidityStd: 0, vertexPerAreaMedian: 1 };
  }
  const mean = (values: number[]): number => values.reduce((sum, v) => sum + v, 0) / values.length;
  const std = (values: number[]): number => {
    const m = mean(values);
    return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length);
  };
  const median = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  return {
    aspectRatioStd: std(pool.map((s) => s.aspectRatio)),
    solidityStd: std(pool.map((s) => s.solidity)),
    vertexPerAreaMedian: median(pool.map((s) => s.vertexCount / Math.max(1e-6, s.relativeArea))),
  };
}

/** Chấm điểm trung bình một batch pool (mỗi category một điểm). */
export function scorePool(
  pool: readonly AssetShapeSample[],
  category: string,
): AssetQualityScore {
  const physics = CATEGORY_PHYSICS[category] ?? {
    aspectRatioRange: [0.2, 3] as [number, number],
    solidityRange: [0.1, 0.95] as [number, number],
    centerHeightRange: [0.25, 0.75] as [number, number],
    silhouette: 'blob' as const,
  };
  const poolStats = computePoolStats(pool);
  if (pool.length === 0) {
    return { standard: 0, smooth: 0, beauty: 0, sharp: 0, overall: 0 };
  }
  const sum: AssetQualityScore = { standard: 0, smooth: 0, beauty: 0, sharp: 0, overall: 0 };
  for (const sample of pool) {
    const score = scoreAssetSample(sample, physics, poolStats);
    sum.standard += score.standard;
    sum.smooth += score.smooth;
    sum.beauty += score.beauty;
    sum.sharp += score.sharp;
    sum.overall += score.overall;
  }
  return {
    standard: sum.standard / pool.length,
    smooth: sum.smooth / pool.length,
    beauty: sum.beauty / pool.length,
    sharp: sum.sharp / pool.length,
    overall: sum.overall / pool.length,
  };
}

/** Xu hướng chất lượng qua các batch. */
export type QualityTrend = 'improving' | 'stable' | 'worsening';

/** Báo cáo chất lượng một batch. */
export interface BatchQualityReport {
  batchIndex: number;
  campaignTotal: number;
  perCategory: Record<string, AssetQualityScore>;
  /** Mean overall của batch (trọng số theo số sample). */
  overall: number;
  threshold: number;
  /** Mean blueprint distance của batch (sai số model — giảm = engine đang tối ưu). */
  meanBlueprintDistance: number;
}

/** Kết quả chiến dịch có định hướng chất lượng. */
export interface QualityCampaignResult {
  campaign: CampaignResult;
  batchReports: BatchQualityReport[];
  /** Xu hướng overall giữa batch đầu và batch cuối của lần chạy này. */
  trend: QualityTrend;
  /** Ngưỡng chất lượng cuối (đã được nâng dần nếu trend improving). */
  finalThreshold: number;
  /** Throughput trung bình (iteration/giây) đo thật. */
  meanThroughput: number;
  /** Blueprint distance đầu → cuối (giảm = đối chiếu mẫu đang tối ưu model). */
  distanceStart: number;
  distanceEnd: number;
}

/** Tuỳ chọn chiến dịch định hướng chất lượng. */
export interface QualityCampaignOptions {
  totalTargetIterations?: number;
  batchIterations?: number;
  maxMsPerBatch?: number;
  maxBatches?: number;
  root?: string;
  /** Ngưỡng chất lượng khởi đầu (chỉ đo, runner vẫn nhận theo filter nội bộ). */
  initialThreshold?: number;
  /** Mỗi batch trend improving nâng ngưỡng thêm bao nhiêu. */
  thresholdRatchet?: number;
  /** Trần ngưỡng (không siết vô hạn). */
  maxThreshold?: number;
}

/**
 * Chiến dịch train assets CÓ ĐO CHẤT LƯỢNG: mỗi batch đối chiếu pool mẫu,
 * chấm 4 tiêu chí, nâng ngưỡng khi đang cải thiện — chính là vòng
 * "kiểm chứng → tối ưu engine sau khi đối chiếu các mẫu".
 */
export class QualityGuidedCampaign {
  public threshold: number;
  public readonly reports: BatchQualityReport[] = [];

  private readonly runner: MassiveTrainingRunner;
  private readonly ratchet: number;
  private readonly maxThreshold: number;

  constructor(options: QualityCampaignOptions = {}) {
    this.runner = new MassiveTrainingRunner({
      totalTargetIterations: options.totalTargetIterations ?? 1e12,
      batchIterations: options.batchIterations ?? 100_000,
      maxMsPerBatch: options.maxMsPerBatch ?? 4000,
      maxBatches: options.maxBatches ?? 8,
      root: options.root,
    });
    this.threshold = options.initialThreshold ?? 0.45;
    this.ratchet = options.thresholdRatchet ?? 0.02;
    this.maxThreshold = options.maxThreshold ?? 0.9;
  }

  /** Tổng iteration tích luỹ qua mọi phiên (checkpoint cộng dồn). */
  public get campaignTotal(): number {
    return this.runner.campaignTotal;
  }

  /** Target hiện tại của runner. */
  public get totalTarget(): number {
    return this.runner.totalTargetIterations;
  }

  /** Chạy chiến dịch (theo batch, persist sau mỗi batch). */
  public run(): QualityCampaignResult {
    const campaign = this.runner.runCampaign();
    let previousOverall: number | null = null;

    let distanceTrendSum = 0;
    let distanceTrendCount = 0;
    for (const batch of campaign.batches) {
      const perCategory: Record<string, AssetQualityScore> = {};
      let weightedSum = 0;
      let weightTotal = 0;
      const distanceValues = Object.values(batch.report.finalDistances);
      const meanDistance = distanceValues.length > 0
        ? distanceValues.reduce((sum, value) => sum + value, 0) / distanceValues.length
        : 0;
      for (const state of this.runner.loop.states.values()) {
        if (state.pool.length === 0) continue;
        const score = scorePool(state.pool, state.category);
        perCategory[state.category] = score;
        weightedSum += score.overall * state.pool.length;
        weightTotal += state.pool.length;
      }
      const overall = weightTotal > 0 ? weightedSum / weightTotal : 0;
      const trend = previousOverall === null ? 'stable' : overall > previousOverall + 0.005 ? 'improving' : 'worsening';
      if (trend === 'improving') {
        this.threshold = Math.min(this.maxThreshold, this.threshold + this.ratchet);
      }
      this.reports.push({
        batchIndex: batch.batchIndex,
        campaignTotal: batch.campaignTotal,
        perCategory,
        overall,
        threshold: this.threshold,
        meanBlueprintDistance: meanDistance,
      });
      distanceTrendSum += meanDistance;
      distanceTrendCount++;
      previousOverall = overall;
    }

    const first = this.reports[0]?.overall ?? 0;
    const last = this.reports[this.reports.length - 1]?.overall ?? 0;
    const qualityTrend: QualityTrend = last > first + 0.005 ? 'improving' : last < first - 0.005 ? 'worsening' : 'stable';
    // Ưu tiên bằng chứng tối ưu model: blueprint distance giảm giữa batch đầu/cuối.
    const distanceStart = this.reports[0]?.meanBlueprintDistance ?? 0;
    const distanceEnd = this.reports[this.reports.length - 1]?.meanBlueprintDistance ?? 0;
    const trend: QualityTrend = distanceEnd < distanceStart * 0.995
      ? 'improving'
      : qualityTrend;
    const throughputs = campaign.batches.map((batch) => batch.report.throughput);
    const meanThroughput = throughputs.length > 0
      ? throughputs.reduce((sum, value) => sum + value, 0) / throughputs.length
      : 0;

    return {
      campaign,
      batchReports: this.reports,
      trend,
      finalThreshold: this.threshold,
      meanThroughput,
      distanceStart,
      distanceEnd,
    };
  }

  /** Đọc checkpoint đã persist (bằng chứng train thật được lưu). */
  public checkpointOnDisk(): { totalIterations: number; totalAccepted: number; totalRejected: number } | null {
    const saved = loadCheckpointFile(this.runner.root);
    return saved
      ? { totalIterations: saved.totalIterations, totalAccepted: saved.totalAccepted, totalRejected: saved.totalRejected }
      : null;
  }
}
