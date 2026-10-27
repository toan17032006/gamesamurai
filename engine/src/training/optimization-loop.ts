/**
 * @file optimization-loop.ts
 * @module @aetheria/engine/training/optimization-loop
 * @description Vòng lặp TỰ TỐI ƯU hàng trăm lần: train object/npc → sinh object
 * từ blueprint → THU TOÀN BỘ dataset từ chính những object đạt chuẩn → tối ưu
 * lại blueprint trên dataset tích luỹ → LƯU CHECKPOINT vào engine → train tiếp
 * từ checkpoint. Mỗi epoch đo mean blueprint distance — tối ưu thật hay chỉ
 * nhiễu đều được đo bằng số, không tự tuyên bố.
 *
 * Chu trình một epoch (mỗi category):
 *   1. SINH   — generateObjectShape từ blueprint hiện tại (seed đổi mỗi epoch).
 *   2. THU    — chỉ nhận object `withinTolerance` vào dataset tích luỹ.
 *   3. TỐI ƯU — trainObjectBlueprint lại trên TOÀN BỘ pool tích luỹ.
 *   4. ĐO     — mean distance trước/sau; checkpoint khi có cải thiện.
 */

import type { Shape, Vec2 } from '../worldview/types.js';
import { perceiveShape, type ShapePerception } from '../worldview/shape-cognition.js';
import { clamp01, hashSeed } from '../deeplearning/random.js';
import {
  createRenderQualityGate,
  generateObjectShape,
  trainObjectBlueprint,
  blueprintDistance,
  validatePixelDatasetCorrectness,
  type RenderQualityGate,
  type ObjectRenderBlueprint,
} from './object-renderer.js';
import type { PixelSample, ShapeSample } from './dataset.js';

/** Trạng thái tích luỹ của một category trong vòng lặp. */
export interface CategoryLoopState {
  category: string;
  /** Dataset tích luỹ: mẫu gốc từ assets + mẫu tự sinh đã qua cổng chất lượng. */
  accumulated: Array<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }>;
  blueprint: ObjectRenderBlueprint;
  /** Lịch sử mean distance mỗi epoch. */
  distanceHistory: number[];
  generatedTotal: number;
  acceptedTotal: number;
}

/** Báo cáo một epoch tối ưu. */
export interface OptimizationEpoch {
  epoch: number;
  categories: Array<{
    category: string;
    generated: number;
    accepted: number;
    poolSize: number;
    /** Mean blueprint distance của object sinh ra epoch này (TRƯỚC khi tối ưu lại). */
    meanDistanceBefore: number;
    /** Mean distance sau khi tái train trên pool mới (đo bằng sinh thử lại). */
    meanDistanceAfter: number;
    improved: boolean;
  }>;
  totalPool: number;
  /** Điểm ảnh dataset đã được rà soát (nếu có pixel samples). */
  pixelSamplesChecked: number;
}

/** Checkpoint lưu vào engine — serialize trọn vẹn để train tiếp. */
export interface OptimizationCheckpoint {
  id: string;
  epochsCompleted: number;
  savedAt: number;
  categories: Record<string, {
    accumulated: Array<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }>;
    blueprint: ObjectRenderBlueprint;
    distanceHistory: number[];
    generatedTotal: number;
    acceptedTotal: number;
  }>;
  /** Dataset pixel đã validate — lưu lại để train NPC mà không rà lại. */
  validPixelSamples: PixelSample[];
}

/** Tuỳ chọn vòng lặp. */
export interface SelfOptimizationOptions {
  gate?: RenderQualityGate;
  /** Số object sinh mỗi category mỗi epoch. */
  objectsPerEpoch?: number;
  /** Chấp nhận object vào pool nếu distance ≤ ngưỡng này. */
  acceptThreshold?: number;
  /** Đẩy checkpoint khi cải thiện bao nhiêu epoch liên tiếp. */
  checkpointEvery?: number;
  onDiseaseSpawnedNever?: never;
}

/** Tuổi thọ mặc định pool: giới hạn để tránh phình vô hạn (giữ mẫu mới nhất). */
const MAX_POOL_PER_CATEGORY = 500;

/**
 * Vòng lặp tự tối ưu — chạy hàng trăm lần, dataset tích luỹ dày lên, blueprint
 * tối ưu dần, checkpoint lưu/tải để train tiếp không mất công cũ.
 */
export class SelfOptimizationLoop {
  public readonly states = new Map<string, CategoryLoopState>();
  public readonly gate: RenderQualityGate;
  public readonly objectsPerEpoch: number;
  public readonly acceptThreshold: number;
  public readonly checkpointEvery: number;
  public epochsCompleted = 0;
  /** Dataset pixel đã validate (từ AgentTrainer nạp vào). */
  public validPixelSamples: PixelSample[] = [];

  constructor(options: SelfOptimizationOptions = {}) {
    this.gate = options.gate ?? createRenderQualityGate();
    this.objectsPerEpoch = Math.max(1, Math.floor(options.objectsPerEpoch ?? 6));
    this.acceptThreshold = clamp01(options.acceptThreshold ?? 0.3);
    this.checkpointEvery = Math.max(1, options.checkpointEvery ?? 10);
  }

  /** Nạp seed samples ban đầu cho một category (từ assets/designer). */
  public seedCategory(
    category: string,
    samples: ReadonlyArray<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }>,
    options: { physics?: import('./object-renderer.js').CategoryPhysics } = {},
  ): ObjectRenderBlueprint | null {
    if (samples.length === 0) return null;
    const blueprint = trainObjectBlueprint(category, samples, { physics: options.physics });
    this.states.set(category, {
      category,
      accumulated: samples.map((s) => ({ ...s })),
      blueprint,
      distanceHistory: [],
      generatedTotal: 0,
      acceptedTotal: 0,
    });
    this.gate.blueprints.set(category, blueprint);
    return blueprint;
  }

  /** Nạp pixel dataset đã validate (điểm ảnh đúng) vào vòng lặp. */
  public addPixelSamples(samples: readonly PixelSample[]): { valid: number; invalid: number } {
    const check = validatePixelDatasetCorrectness(samples);
    this.validPixelSamples.push(...check.validSamples);
    return { valid: check.validSamples.length, invalid: check.issues.length > 0 ? samples.length - check.validSamples.length : 0 };
  }

  /** Một epoch tối ưu: SINH → THU → TỐI ƯU → ĐO cho từng category. */
  public runEpoch(year: number): OptimizationEpoch {
    this.epochsCompleted++;
    const epoch: OptimizationEpoch = { epoch: this.epochsCompleted, categories: [], totalPool: 0, pixelSamplesChecked: this.validPixelSamples.length };

    for (const state of this.states.values()) {
      // 1) SINH: object từ blueprint hiện tại — seed đổi mỗi epoch.
      const distancesBefore: number[] = [];
      const acceptedSamples: Array<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }> = [];
      let generated = 0;
      for (let i = 0; i < this.objectsPerEpoch; i++) {
        const seed = `${state.category}:e${this.epochsCompleted}:${i}:${year}`;
        const generatedObject = generateObjectShape(state.blueprint, seed, { scale: 8 + (i % 6) });
        generated++;
        state.generatedTotal++;
        const perception = generatedObject.perception;
        distancesBefore.push(blueprintDistance(state.blueprint, perception));
        // 2) THU: chỉ nhận object đạt chuẩn vào dataset tích luỹ.
        if (generatedObject.withinTolerance && generatedObject.blueprintDistance <= this.acceptThreshold + 0.15) {
          acceptedSamples.push({
            aspectRatio: perception.aspectRatio,
            relativeArea: perception.area,
            vertexCount: perception.vertexCount,
            centerHeightRatio: perception.centerHeightRatio,
            solidity: perception.solidity,
          });
          state.acceptedTotal++;
        }
      }
      const meanDistanceBefore = average(distancesBefore);

      // 3) TỐI ƯU: train lại blueprint trên TOÀN BỘ pool tích luỹ (giới hạn pool).
      state.accumulated.push(...acceptedSamples);
      if (state.accumulated.length > MAX_POOL_PER_CATEGORY) {
        state.accumulated.splice(0, state.accumulated.length - MAX_POOL_PER_CATEGORY);
      }
      state.blueprint = trainObjectBlueprint(state.category, state.accumulated, { physics: state.blueprint.physics });
      this.gate.blueprints.set(state.category, state.blueprint);

      // 4) ĐO: sinh thử lại bằng blueprint mới — distance sau tối ưu.
      const distancesAfter: number[] = [];
      for (let i = 0; i < this.objectsPerEpoch; i++) {
        const seed = `${state.category}:verify:${this.epochsCompleted}:${i}`;
        const verifyObject = generateObjectShape(state.blueprint, seed, { scale: 8 + (i % 6) });
        distancesAfter.push(blueprintDistance(state.blueprint, verifyObject.perception));
      }
      const meanDistanceAfter = average(distancesAfter);
      const improved = meanDistanceAfter <= meanDistanceBefore || meanDistanceAfter < 0.15;

      state.distanceHistory.push(meanDistanceAfter);
      epoch.categories.push({
        category: state.category,
        generated,
        accepted: acceptedSamples.length,
        poolSize: state.accumulated.length,
        meanDistanceBefore: Math.round(meanDistanceBefore * 1000) / 1000,
        meanDistanceAfter: Math.round(meanDistanceAfter * 1000) / 1000,
        improved,
      });
    }

    epoch.totalPool = [...this.states.values()].reduce((sum, s) => sum + s.accumulated.length, 0);
    return epoch;
  }

  /**
   * Chạy HÀNG TRĂM lần: `epochs` epoch liên tiếp; trả toàn bộ lịch sử để phân
   * tích xu hướng tối ưu (mean distance theo epoch).
   */
  public runMany(epochs: number, startYear = 1): OptimizationEpoch[] {
    const history: OptimizationEpoch[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(epochs)); i++) {
      history.push(this.runEpoch(startYear + i));
    }
    return history;
  }

  /** Xu hướng tối ưu: mean distance epoch đầu vs epoch cuối của một category. */
  public trendOf(category: string): { first: number; last: number; improved: boolean; poolGrew: boolean; history: number[] } {
    const state = this.states.get(category);
    if (!state || state.distanceHistory.length === 0) {
      return { first: 0, last: 0, improved: false, poolGrew: false, history: [] };
    }
    const history = state.distanceHistory;
    const firstSlice = history.slice(0, Math.max(1, Math.floor(history.length * 0.2)));
    const lastSlice = history.slice(-Math.max(1, Math.floor(history.length * 0.2)));
    const first = average(firstSlice);
    const last = average(lastSlice);
    return {
      first: Math.round(first * 1000) / 1000,
      last: Math.round(last * 1000) / 1000,
      improved: last <= first + 0.02,
      poolGrew: state.accumulated.length > Math.min(MAX_POOL_PER_CATEGORY, 3),
      history: [...history],
    };
  }

  /** LƯU VÀO ENGINE: checkpoint serialize trọn vẹn. */
  public saveCheckpoint(id?: string): OptimizationCheckpoint {
    const categories: OptimizationCheckpoint['categories'] = {};
    for (const [category, state] of this.states) {
      categories[category] = {
        accumulated: state.accumulated.map((s) => ({ ...s })),
        blueprint: { ...state.blueprint, trainedAt: state.blueprint.trainedAt },
        distanceHistory: [...state.distanceHistory],
        generatedTotal: state.generatedTotal,
        acceptedTotal: state.acceptedTotal,
      };
    }
    return {
      id: id ?? `ckpt_${this.epochsCompleted}_${hashSeed(`ckpt:${this.epochsCompleted}`).toString(16)}`,
      epochsCompleted: this.epochsCompleted,
      savedAt: Date.now(),
      categories,
      validPixelSamples: this.validPixelSamples.map((s) => ({ ...s })),
    };
  }

  /** TRAIN TIẾP: khôi phục checkpoint vào vòng lặp — công cũ không mất. */
  public static restore(checkpoint: OptimizationCheckpoint, options: SelfOptimizationOptions = {}): SelfOptimizationLoop {
    const loop = new SelfOptimizationLoop({ ...options, gate: options.gate ?? createRenderQualityGate() });
    loop.epochsCompleted = checkpoint.epochsCompleted;
    loop.validPixelSamples = checkpoint.validPixelSamples.map((s) => ({ ...s }));
    for (const [category, state] of Object.entries(checkpoint.categories)) {
      loop.states.set(category, {
        category,
        accumulated: state.accumulated.map((s) => ({ ...s })),
        blueprint: { ...state.blueprint },
        distanceHistory: [...state.distanceHistory],
        generatedTotal: state.generatedTotal,
        acceptedTotal: state.acceptedTotal,
      });
      loop.gate.blueprints.set(category, { ...state.blueprint });
    }
    return loop;
  }

  /** Sinh object từ kiến thức đã tối ưu — kết quả cuối cho renderer. */
  public generate(category: string, seed: number | string): { shape: Shape; perception: ShapePerception; location?: Vec2 } | null {
    const state = this.states.get(category);
    if (!state) return null;
    const generated = generateObjectShape(state.blueprint, seed);
    return { shape: generated.shape, perception: generated.perception };
  }
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
