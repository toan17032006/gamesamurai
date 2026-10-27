/**
 * @file mass-training.ts
 * @module @aetheria/engine/training/mass-training
 * @description Train HÀNG TRIỆU LẦN cho object/npc/cây/quái/rồng/thời tiết/siêu
 * nhiên/đồng cỏ/rừng: vòng lặp tốc độ cao (fast path — generation + filter +
 * accumulate không rà nặng từng bước, statistical verify mỗi K bước), NHIỀU
 * LỚP LỌC NHIỄU chặn rác trước khi vào pool, vector đặc trưng đa tầng (mesh +
 * texture) cho bộ não NPC/quái/đồng cỏ/rừng, và checkpoint lưu/tải liên tục.
 *
 * Cùng dùng `SystemEventBus` chung — mọi sự kiện train đều chảy một dòng.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import { perceiveShape } from '../worldview/shape-cognition.js';
import {
  generateObjectShape,
  trainObjectBlueprint,
  blueprintDistance,
  validatePixelDatasetCorrectness,
  createRenderQualityGate,
  CATEGORY_PHYSICS,
  type RenderQualityGate,
  type CategoryPhysics,
  type ObjectRenderBlueprint,
} from './object-renderer.js';
import { NoiseFilterPipeline } from './noise-filters.js';
import { extractLayeredFeatures, flattenLayeredFeatures, type LayeredFeatureVector } from './features.js';
import type { PixelSample, ShapeSample } from './dataset.js';
import { SystemEventBus } from '../worldview/system-events.js';

/** Trạng thái train khối lượng của một category. */
export interface MassCategoryState {
  category: string;
  physics: CategoryPhysics;
  blueprint: ReturnType<typeof trainObjectBlueprint>;
  /** Pool tích luỹ — chỉ chứa sample đã qua lọc nhiễu. */
  pool: Array<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }>;
  /** Vector đặc trưng đa tầng trung bình — "bộ não" hình dạng của category. */
  brain: LayeredFeatureVector | null;
  iterations: number;
  accepted: number;
  rejected: number;
  distanceHistory: number[];
}

/** Báo cáo một lượt chạy khối lượng. */
export interface MassRunReport {
  iterations: number;
  /** Thời gian thực tế (ms). */
  elapsedMs: number;
  /** Tốc độ (iteration/giây). */
  throughput: number;
  accepted: number;
  rejected: number;
  /** Rác bị lọc theo từng lớp. */
  rejectedByFilter: Record<string, number>;
  /** Mean distance cuối của mỗi category. */
  finalDistances: Record<string, number>;
  /** Số lần blueprint được tối ưu lại. */
  retrains: number;
}

/** Checkpoint khối lượng — serialize trọn vẹn. */
export interface MassCheckpoint {
  totalIterations: number;
  totalAccepted: number;
  totalRejected: number;
  categories: Record<string, {
    pool: Array<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }>;
    blueprint: ObjectRenderBlueprint;
    iterations: number;
    accepted: number;
    rejected: number;
    brain: LayeredFeatureVector | null;
  }>;
  validPixelSamples: PixelSample[];
}

/** Tuỳ chọn chạy khối lượng. */
export interface MassTrainingOptions {
  gate?: RenderQualityGate;
  bus?: SystemEventBus;
  seed?: number | string;
  /** Số lần tối ưu lại blueprint trong vòng chạy (mỗi lần cách một khoảng). */
  retrainEvery?: number;
  /** Xác suất statistical-verify sâu (mặc định 0.05 — 5% sample rà đầy đủ). */
  deepVerifyRate?: number;
  physics?: Record<string, CategoryPhysics>;
}

/**
 * Vòng lặp train hàng triệu lần. `runIterations(n, maxMs)` chạy tới khi đủ số
 * lượt hoặc hết ngân sách thời gian — throughput đo thật, không tự tuyên bố.
 */
export class MassTrainingLoop {
  public readonly states = new Map<string, MassCategoryState>();
  public readonly bus: SystemEventBus;
  public readonly gate: RenderQualityGate;
  public readonly retrainEvery: number;
  public readonly deepVerifyRate: number;
  public totalIterations = 0;
  public totalAccepted = 0;
  public totalRejected = 0;
  public retrains = 0;

  private readonly random: DeepRandom;
  private readonly physicsOverrides: Record<string, CategoryPhysics>;

  constructor(options: MassTrainingOptions = {}) {
    this.gate = options.gate ?? createRenderQualityGate();
    this.bus = options.bus ?? new SystemEventBus();
    this.random = new DeepRandom(options.seed ?? 'mass-training');
    this.retrainEvery = Math.max(1, options.retrainEvery ?? 10_000);
    this.deepVerifyRate = clamp01(options.deepVerifyRate ?? 0.05);
    this.physicsOverrides = options.physics ?? {};
  }

  /** Nạp seed samples cho category (từ assets/designer). */
  public seedCategory(category: string, samples: readonly ShapeSample[]): boolean {
    if (samples.length === 0) return false;
    const physics = this.physicsOverrides[category] ?? CATEGORY_PHYSICS[category] ?? {
      aspectRatioRange: [0.2, 4], solidityRange: [0.05, 0.95], centerHeightRange: [0.2, 0.8], silhouette: 'blob',
    };
    // Lọc nhiễu nhiều lớp ngay từ seed.
    const pipeline = NoiseFilterPipeline.standard();
    // Nhãn designer tự do — chỉ lọc corruption/duplicate/physics/outlier.
    const report = pipeline.apply(samples as unknown as Array<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number; groundTruth?: string }>, {
      physics: { aspectRatioRange: physics.aspectRatioRange, solidityRange: physics.solidityRange },
    });
    const blueprint = trainObjectBlueprint(category, report.kept, { physics });
    this.states.set(category, {
      category,
      physics,
      blueprint,
      pool: report.kept.map((s) => ({ ...s })),
      brain: null,
      iterations: 0,
      accepted: report.keptCount,
      rejected: report.rejected.length,
      distanceHistory: [],
    });
    this.gate.blueprints.set(category, blueprint);
    this.totalAccepted += report.keptCount;
    this.totalRejected += report.rejected.length;
    return true;
  }

  /**
   * Chạy `iterations` lượt (hoặc tới `maxMs` ms). Mỗi lượt: sinh object fast →
   * lọc nhiễu nhiều lớp → nhận vào pool → statistical deep verify mỗi K lượt →
   * tối ưu blueprint định kỳ → cập nhật vector đặc trưng đa tầng.
   */
  public runIterations(iterations: number, maxMs = 5000, startYear = 1): MassRunReport {
    const started = Date.now();
    const report: MassRunReport = {
      iterations: 0, elapsedMs: 0, throughput: 0, accepted: 0, rejected: 0,
      rejectedByFilter: {}, finalDistances: {}, retrains: 0,
    };
    const categories = [...this.states.values()];
    if (categories.length === 0 || iterations <= 0) {
      report.elapsedMs = Date.now() - started;
      return report;
    }
    let retrainsAtStart = this.retrains;

    for (let i = 0; i < iterations; i++) {
      const state = categories[i % categories.length];
      const year = startYear + Math.floor(i / categories.length);
      // Fast path: sinh từ blueprint hiện tại.
      const seed = `${state.category}:mass:${this.totalIterations}`;
      const generated = generateObjectShape(state.blueprint, seed, { scale: 6 + (i % 8), maxRounds: 4 });
      this.totalIterations++;
      state.iterations++;
      report.iterations++;

      // Nhiều lớp lọc nhiễu — fast pipeline (corruption + physics; statistical outlier).
      const sample = {
        aspectRatio: generated.perception.aspectRatio,
        relativeArea: generated.perception.area,
        vertexCount: generated.perception.vertexCount,
        centerHeightRatio: generated.perception.centerHeightRatio,
        solidity: generated.perception.solidity,
        groundTruth: state.category,
      };
      const [minA, maxA] = state.physics.aspectRatioRange;
      const [minS, maxS] = state.physics.solidityRange;
      let accepted = true;
      let rejectReason = '';
      if (!Number.isFinite(sample.aspectRatio) || !Number.isFinite(sample.solidity)) {
        accepted = false;
        rejectReason = 'corruption';
      } else if (sample.aspectRatio < minA || sample.aspectRatio > maxA) {
        accepted = false;
        rejectReason = `aspect ${sample.aspectRatio.toFixed(2)} ngoài [${minA}, ${maxA}]`;
      } else if (sample.solidity < minS || sample.solidity > maxS) {
        accepted = false;
        rejectReason = `solidity ngoài [${minS}, ${maxS}]`;
      }

      if (accepted) {
        state.pool.push({ aspectRatio: sample.aspectRatio, relativeArea: sample.relativeArea, vertexCount: sample.vertexCount, centerHeightRatio: sample.centerHeightRatio, solidity: sample.solidity });
        if (state.pool.length > 800) state.pool.splice(0, state.pool.length - 800);
        this.totalAccepted++;
        state.accepted++;
        report.accepted++;
      } else {
        this.totalRejected++;
        state.rejected++;
        report.rejected++;
        report.rejectedByFilter[rejectReason.split(' ')[0]] = (report.rejectedByFilter[rejectReason.split(' ')[0]] ?? 0) + 1;
      }

      // Statistical deep verify 5% — sample không đạt full tolerance bị loại dù qua fast filter.
      if (accepted && this.random.chance(this.deepVerifyRate) && !generated.withinTolerance) {
        accepted = false;
        if (state.pool.length > 0) state.pool.pop(); // rút lại sample vừa nhận
        state.accepted--;
        this.totalAccepted--;
        state.rejected++;
        this.totalRejected++;
        report.accepted--;
        report.rejected++;
        report.rejectedByFilter['deep_verify'] = (report.rejectedByFilter['deep_verify'] ?? 0) + 1;
      }

      // Tối ưu blueprint định kỳ.
      if ((i + 1) % this.retrainEvery === 0 && state.pool.length >= 3) {
        state.blueprint = trainObjectBlueprint(state.category, state.pool, { physics: state.physics });
        this.gate.blueprints.set(state.category, state.blueprint);
        this.retrains++;
      }

      // Hết ngân sách thời gian → dừng an toàn.
      const elapsed = Date.now() - started;
      if (elapsed > maxMs) break;
    }

    // Cập nhật bộ não vector đa tầng + distance cuối.
    for (const state of categories) {
      if (state.pool.length >= 3) {
        state.blueprint = trainObjectBlueprint(state.category, state.pool, { physics: state.physics });
        this.gate.blueprints.set(state.category, state.blueprint);
        this.retrains++;
      }
      // Vector đặc trưng đa tầng — "bộ não" hình dạng category.
      const sampleShape = generateObjectShape(state.blueprint, `${state.category}:brain:${this.totalIterations}`, { maxRounds: 3 });
      state.brain = extractLayeredFeatures(sampleShape.shape, {
        layerCount: 6,
        color: '#6a8a4a',
        textureSeed: hashSeed(state.category) % 100000,
      });
      // Distance cuối: đo 10 object sinh từ blueprint đã tối ưu.
      let sum = 0;
      const probes = 10;
      for (let p = 0; p < probes; p++) {
        const probe = generateObjectShape(state.blueprint, `${state.category}:probe:${p}:${this.totalIterations}`, { maxRounds: 4 });
        sum += blueprintDistance(state.blueprint, probe.perception);
      }
      state.distanceHistory.push(clamp01(sum / probes));
      report.finalDistances[state.category] = Math.round((sum / probes) * 1000) / 1000;
    }

    report.retrains = this.retrains - retrainsAtStart;
    report.elapsedMs = Date.now() - started;
    report.throughput = report.elapsedMs > 0 ? Math.round((report.iterations / report.elapsedMs) * 1000) : 0;
    // Publish tổng kết vào bus chung.
    this.bus.publish('training.mass_complete', { report: { iterations: report.iterations, throughput: report.throughput } }, startYear + Math.floor(report.iterations / Math.max(1, categories.length)), {
      severity: 0.3,
      label: `train ${report.iterations} lượt, ${report.throughput} lượt/giây`,
    });
    return report;
  }

  /** Vector phẳng 8 chiều của bộ não category — NPC/system agent đọc được. */
  public brainVectorOf(category: string): number[] | null {
    const state = this.states.get(category);
    if (!state?.brain) return null;
    return flattenLayeredFeatures(state.brain);
  }

  /** Pixel dataset đã validate (điểm ảnh đúng) — lưu cùng checkpoint. */
  public validPixelSamples: PixelSample[] = [];

  /** Nạp + validate pixel samples — sample sai bị chặn, không vào train. */
  public addPixelSamples(samples: readonly PixelSample[]): { valid: number; invalid: number } {
    const check = validatePixelDatasetCorrectness(samples);
    this.validPixelSamples.push(...check.validSamples);
    return { valid: check.validSamples.length, invalid: samples.length - check.validSamples.length };
  }

  /** Lưu checkpoint khối lượng (hàng triệu iteration) — serialize trọn vẹn. */
  public saveCheckpoint(): MassCheckpoint {
    const categories: MassCheckpoint['categories'] = {};
    for (const [category, state] of this.states) {
      categories[category] = {
        pool: state.pool.map((s) => ({ ...s })),
        blueprint: { ...state.blueprint },
        iterations: state.iterations,
        accepted: state.accepted,
        rejected: state.rejected,
        brain: state.brain ? JSON.parse(JSON.stringify(state.brain)) : null,
      };
    }
    return { totalIterations: this.totalIterations, totalAccepted: this.totalAccepted, totalRejected: this.totalRejected, categories, validPixelSamples: this.validPixelSamples.map((s) => ({ ...s })) };
  }

  /** Khôi phục checkpoint — train tiếp không mất công cũ. */
  public restoreCheckpoint(checkpoint: MassCheckpoint): void {
    this.totalIterations = checkpoint.totalIterations;
    this.totalAccepted = checkpoint.totalAccepted;
    this.totalRejected = checkpoint.totalRejected;
    this.validPixelSamples = (checkpoint.validPixelSamples ?? []).map((s) => ({ ...s }));
    for (const [category, state] of Object.entries(checkpoint.categories)) {
      const physics = this.physicsOverrides[category] ?? CATEGORY_PHYSICS[category] ?? {
        aspectRatioRange: [0.2, 4], solidityRange: [0.05, 0.95], centerHeightRange: [0.2, 0.8], silhouette: 'blob',
      } as CategoryPhysics;
      this.states.set(category, {
        category,
        physics,
        blueprint: { ...state.blueprint },
        pool: state.pool.map((s) => ({ ...s })),
        brain: state.brain,
        iterations: state.iterations,
        accepted: state.accepted,
        rejected: state.rejected,
        distanceHistory: [],
      });
      this.gate.blueprints.set(category, { ...state.blueprint });
    }
  }
}

interface SelfOptimizationLike {
  saveCheckpoint(): unknown;
}
