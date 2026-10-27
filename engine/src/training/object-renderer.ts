/**
 * @file object-renderer.ts
 * @module @aetheria/engine/training/object-renderer
 * @description Train agent RENDER RA ĐƯỢC KHỐI OBJECT (người, vật, cây…):
 * - **Dataset đúng, điểm ảnh đúng**: `validatePixelDatasetCorrectness` rà từng
 *   mẫu pixel — cell ngoài biên, groundTruthQuality lệch, kích thước phi lý
 *   đều bị chặn trước khi vào train.
 * - **Blueprint theo category**: `trainObjectBlueprint` học tỉ lệ khung, độ
 *   đặc, trọng tâm từ shape samples (mỗi nền văn minh/category một chuẩn).
 * - **Sinh hình từ kiến thức**: `generateObjectShape` tạo polygon cho category
 *   (cây đầu to chân nhỏ, người thon đứng, vũ khí thon dài…) — rồi TỰ KIỂM
 *   CHỨNG bằng perceiveShape và TỰ HIỆU CHỈNH từng vòng (render không sai).
 * - **Cổng chất lượng**: `RenderQualityGate.verify` chốt"render lên không sai,
 *   chuẩn đúng" — lệch blueprint là fail, ghi drift.
 */

import type { Shape, Vec2 } from '../worldview/types.js';
import { perceiveShape, type ShapePerception } from '../worldview/shape-cognition.js';
import type { PixelSample } from './dataset.js';
import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';

// ===========================================================================
// Dataset đúng, điểm ảnh đúng — validate pixel trước khi train
// ===========================================================================

export interface PixelDatasetIssue {
  sampleIndex: number;
  cellIndex?: number;
  reason: string;
}

export interface PixelDatasetValidation {
  valid: boolean;
  issues: PixelDatasetIssue[];
  validSamples: PixelSample[];
}

/** Rà soát toàn bộ pixel dataset — chặn điểm ảnh sai trước khi train. */
export function validatePixelDatasetCorrectness(samples: readonly PixelSample[]): PixelDatasetValidation {
  const issues: PixelDatasetIssue[] = [];
  const validSamples: PixelSample[] = [];
  samples.forEach((sample, sampleIndex) => {
    let sampleValid = true;
    if (!Number.isFinite(sample.width) || sample.width < 1 || sample.height < 1) {
      issues.push({ sampleIndex, reason: `kích thước grid phi lý (${sample.width}×${sample.height})` });
      sampleValid = false;
    }
    if (sample.groundTruthQuality < 0 || sample.groundTruthQuality > 1 || !Number.isFinite(sample.groundTruthQuality)) {
      issues.push({ sampleIndex, reason: `groundTruthQuality ${sample.groundTruthQuality} ngoài [0, 1]` });
      sampleValid = false;
    }
    const seen = new Set<string>();
    sample.cells.forEach((cell, cellIndex) => {
      if (cell.x < 0 || cell.y < 0 || cell.x >= sample.width || cell.y >= sample.height) {
        issues.push({ sampleIndex, cellIndex, reason: `cell (${cell.x},${cell.y}) ngoài biên ${sample.width}×${sample.height}` });
        sampleValid = false;
      }
      const key = `${cell.x},${cell.y}`;
      if (seen.has(key)) {
        issues.push({ sampleIndex, cellIndex, reason: `cell (${cell.x},${cell.y}) trùng lặp` });
        sampleValid = false;
      }
      seen.add(key);
      if (!/^#[0-9a-fA-F]{3,8}$/.test(cell.color) && !/^rgb\(/.test(cell.color)) {
        issues.push({ sampleIndex, cellIndex, reason: `màu "${cell.color}" không phải hex/rgb` });
        sampleValid = false;
      }
    });
    if (sampleValid) validSamples.push(sample);
  });
  return { valid: issues.length === 0, issues, validSamples };
}

// ===========================================================================
// Blueprint — chuẩn hình dạng của một category học từ samples
// ===========================================================================

/** Giới hạn vật lý theo category — render ra ngoài khoảng này là SAI. */
export interface CategoryPhysics {
  aspectRatioRange: [number, number];
  solidityRange: [number, number];
  centerHeightRange: [number, number];
  /** Gợi ý dáng: top_heavy (cây), bottom_heavy (người), elongated (vũ khí)… */
  silhouette: 'balanced' | 'top_heavy' | 'bottom_heavy' | 'elongated' | 'blob';
}

/** Chuẩn vật lý mặc định cho từng category object. */
export const CATEGORY_PHYSICS: Readonly<Record<string, CategoryPhysics>> = Object.freeze({
  tree: { aspectRatioRange: [0.3, 1.1], solidityRange: [0.2, 0.7], centerHeightRange: [0.35, 0.7], silhouette: 'top_heavy' },
  house: { aspectRatioRange: [0.5, 2], solidityRange: [0.5, 0.95], centerHeightRange: [0.3, 0.6], silhouette: 'balanced' },
  player: { aspectRatioRange: [0.2, 0.6], solidityRange: [0.3, 0.8], centerHeightRange: [0.45, 0.7], silhouette: 'bottom_heavy' },
  npc: { aspectRatioRange: [0.2, 0.6], solidityRange: [0.3, 0.8], centerHeightRange: [0.45, 0.7], silhouette: 'bottom_heavy' },
  monster: { aspectRatioRange: [0.3, 1.4], solidityRange: [0.3, 0.9], centerHeightRange: [0.35, 0.7], silhouette: 'blob' },
  animal: { aspectRatioRange: [0.8, 3], solidityRange: [0.3, 0.85], centerHeightRange: [0.4, 0.7], silhouette: 'elongated' },
  weapon: { aspectRatioRange: [0.08, 0.5], solidityRange: [0.1, 0.5], centerHeightRange: [0.4, 0.6], silhouette: 'elongated' },
  clothing: { aspectRatioRange: [0.5, 1.5], solidityRange: [0.4, 0.9], centerHeightRange: [0.35, 0.65], silhouette: 'balanced' },
  volcano: { aspectRatioRange: [0.5, 1.6], solidityRange: [0.35, 0.85], centerHeightRange: [0.3, 0.55], silhouette: 'bottom_heavy' },
  water: { aspectRatioRange: [1, 8], solidityRange: [0.3, 0.9], centerHeightRange: [0.3, 0.6], silhouette: 'elongated' },
  food: { aspectRatioRange: [0.4, 2], solidityRange: [0.4, 0.95], centerHeightRange: [0.3, 0.7], silhouette: 'blob' },
  rice_field: { aspectRatioRange: [1, 6], solidityRange: [0.2, 0.7], centerHeightRange: [0.3, 0.6], silhouette: 'elongated' },
  cave: { aspectRatioRange: [0.5, 2.5], solidityRange: [0.3, 0.9], centerHeightRange: [0.25, 0.6], silhouette: 'bottom_heavy' },
  event: { aspectRatioRange: [0.3, 3], solidityRange: [0.1, 0.9], centerHeightRange: [0.25, 0.75], silhouette: 'blob' },
  dragon: { aspectRatioRange: [0.6, 3], solidityRange: [0.2, 0.8], centerHeightRange: [0.3, 0.7], silhouette: 'elongated' },
  weather: { aspectRatioRange: [0.8, 6], solidityRange: [0.05, 0.5], centerHeightRange: [0.3, 0.7], silhouette: 'blob' },
  supernatural: { aspectRatioRange: [0.2, 2], solidityRange: [0.05, 0.6], centerHeightRange: [0.3, 0.8], silhouette: 'blob' },
  grass: { aspectRatioRange: [1, 8], solidityRange: [0.05, 0.4], centerHeightRange: [0.5, 0.85], silhouette: 'bottom_heavy' },
  forest: { aspectRatioRange: [0.8, 4], solidityRange: [0.3, 0.8], centerHeightRange: [0.3, 0.6], silhouette: 'top_heavy' },
});

/** Blueprint hình dạng của một category sau khi train. */
export interface ObjectRenderBlueprint {
  category: string;
  /** Đặc trưng trung bình từ samples. */
  prototype: {
    aspectRatio: number;
    solidity: number;
    centerHeightRatio: number;
    vertexCount: number;
    relativeArea: number;
  };
  /** Khoảng cho phép sinh ra (min/max từ samples, nới 10%). */
  aspectRatioRange: [number, number];
  solidityRange: [number, number];
  physics: CategoryPhysics;
  sampleCount: number;
  trainedAt: number;
}

/** Train blueprint cho một category từ shape samples (đã qua validate). */
export function trainObjectBlueprint(
  category: string,
  samples: ReadonlyArray<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }>,
  options: { physics?: CategoryPhysics } = {},
): ObjectRenderBlueprint {
  if (samples.length === 0) throw new RangeError(`Category "${category}" cần ít nhất một shape sample để train blueprint`);
  const avg = (pick: (s: { aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }) => number) =>
    samples.reduce((sum, s) => sum + pick(s), 0) / samples.length;
  const ratios = samples.map((s) => s.aspectRatio).sort((a, b) => a - b);
  const solidities = samples.map((s) => s.solidity).sort((a, b) => a - b);
  const physics = options.physics ?? CATEGORY_PHYSICS[category] ?? { aspectRatioRange: [0.2, 3], solidityRange: [0.1, 0.95], centerHeightRange: [0.25, 0.75], silhouette: 'blob' };
  return {
    category,
    prototype: {
      aspectRatio: Math.round(avg((s) => s.aspectRatio) * 100) / 100,
      solidity: Math.round(avg((s) => s.solidity) * 100) / 100,
      centerHeightRatio: Math.round(avg((s) => s.centerHeightRatio) * 100) / 100,
      vertexCount: Math.round(avg((s) => s.vertexCount)),
      relativeArea: Math.round(avg((s) => s.relativeArea) * 100) / 100,
    },
    aspectRatioRange: [
      Math.max(physics.aspectRatioRange[0], ratios[0] * 0.9),
      Math.min(physics.aspectRatioRange[1], ratios[ratios.length - 1] * 1.1),
    ],
    solidityRange: [
      Math.max(physics.solidityRange[0], solidities[0] * 0.9),
      Math.min(physics.solidityRange[1], solidities[solidities.length - 1] * 1.1),
    ],
    physics,
    sampleCount: samples.length,
    trainedAt: Date.now(),
  };
}

// ===========================================================================
// Sinh hình từ blueprint — tự kiểm chứng, tự hiệu chỉnh (render không sai)
// ===========================================================================

export interface GeneratedObject {
  category: string;
  shape: Shape;
  perception: ShapePerception;
  /** Đã đạt chuẩn blueprint sau tự hiệu chỉnh chưa. */
  withinTolerance: boolean;
  /** Số vòng hiệu chỉnh đã chạy. */
  correctionRounds: number;
  /** Khoảng cách đặc trưng tới blueprint. */
  blueprintDistance: number;
  note: string;
}

/** BBox của tập điểm. */
function shapeBBox(points: readonly Vec2[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

/** Khoảng cách đặc trưng tới blueprint (trọng số bằng nhau, chuẩn hoá). */
export function blueprintDistance(blueprint: ObjectRenderBlueprint, perception: ShapePerception): number {
  const d = (a: number, b: number, scale: number) => Math.abs(a - b) / Math.max(1e-6, scale);
  return Math.round((
    d(blueprint.prototype.aspectRatio, perception.aspectRatio, Math.max(1, blueprint.prototype.aspectRatio)) +
    d(blueprint.prototype.solidity, perception.solidity, Math.max(0.1, blueprint.prototype.solidity)) +
    d(blueprint.prototype.centerHeightRatio, perception.centerHeightRatio, 1)
  ) / 3 * 1000) / 1000;
}

/** Chuyển vector perception thành metrics đối chiếu blueprint. */
function perceptionMetrics(perception: ShapePerception) {
  return { aspectRatio: perception.aspectRatio, solidity: perception.solidity, centerHeightRatio: perception.centerHeightRatio };
}

/**
 * Sinh polygon object cho category từ blueprint, TỰ KIỂM CHỨNG và TỰ HIỆU
 * CHỈNH tối đa `maxRounds` vòng: mỗi vòng đo perceiveShape → so blueprint →
 * chỉnh wobble (solidity), tỉ lệ y (centerHeight), kích thước (aspectRatio).
 * Kết quả: hình "render lên không sai, chuẩn đúng" theo kiến thức đã train.
 */
export function generateObjectShape(
  blueprint: ObjectRenderBlueprint,
  seed: number | string,
  options: { scale?: number; maxRounds?: number } = {},
): GeneratedObject {
  const random = new DeepRandom(`genobj:${blueprint.category}:${seed}`);
  const scale = clampRange(options.scale ?? 10, 1, 200);
  const maxRounds = clampRange(options.maxRounds ?? 12, 1, 30);
  const silhouette = blueprint.physics.silhouette;

  // Hệ số ban đầu từ prototype.
  const targetAspect = clampRange(
    blueprint.prototype.aspectRatio,
    blueprint.aspectRatioRange[0],
    blueprint.aspectRatioRange[1],
  );
  let wobble = silhouette === 'blob' ? 0.45 : silhouette === 'top_heavy' ? 0.3 : 0.2;
  let heightBias = silhouette === 'top_heavy' ? 0.8 : silhouette === 'bottom_heavy' ? 1.2 : 1;
  // Hệ số bù aspect: silhouette bias làm méo tỉ lệ khung — vòng sau nhân lại.
  let aspectScale = 1;

  let bestShape: Shape | null = null;
  let bestPerception: ShapePerception | null = null;
  let bestDistance = Infinity;
  let rounds = 0;

  for (let round = 0; round < maxRounds; round++) {
    rounds++;
    const height = scale;
    const width = height * targetAspect;
    const cx = width / 2;
    const points: Vec2[] = [];
    const segments = 14;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Silhouette bias: top_heavy → phần trên (sin < 0) nở ra; bottom_heavy → ngược lại.
      const verticalFactor = Math.sin(angle); // -1 trên, +1 dưới (y hướng xuống)
      const silhouetteBias =
        silhouette === 'top_heavy' ? 1 - clamp01(verticalFactor) * 0.45
        : silhouette === 'bottom_heavy' ? 1 + clamp01(-verticalFactor) * 0.45 * heightBias
        : silhouette === 'elongated' ? 1 - Math.abs(Math.cos(angle)) * 0.55
        : 1;
      const noise = (random.next() - 0.5) * wobble;
      const rx = (width / 2) * silhouetteBias * aspectScale * (1 + noise);
      const ry = (height / 2) * silhouetteBias * (1 + noise);
      points.push({ x: cx + Math.cos(angle) * rx, y: height / 2 + Math.sin(angle) * ry });
    }
    const shape: Shape = { kind: 'polygon', points };
    const perception = perceiveShape(shape);

    // Đo khoảng cách tới blueprint.
    const metrics = perceptionMetrics(perception);
    const aspectDrift = Math.abs(metrics.aspectRatio - targetAspect) / Math.max(1, targetAspect);
    const solidityTarget = clampRange(blueprint.prototype.solidity, blueprint.solidityRange[0], blueprint.solidityRange[1]);
    const solidityDrift = Math.abs(metrics.solidity - solidityTarget) / Math.max(0.1, solidityTarget);
    const centerTarget = clampRange(blueprint.prototype.centerHeightRatio, blueprint.physics.centerHeightRange[0], blueprint.physics.centerHeightRange[1]);
    const centerDrift = Math.abs(metrics.centerHeightRatio - centerTarget);
    const distance = Math.round(((aspectDrift + solidityDrift + centerDrift) / 3) * 1000) / 1000;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestShape = shape;
      bestPerception = perception;
    }

    // Đạt chuẩn → dừng sớm.
    if (aspectDrift < 0.12 && solidityDrift < 0.2 && centerDrift < 0.15) {
      bestShape = shape;
      bestPerception = perception;
      bestDistance = Math.round(((aspectDrift + solidityDrift + centerDrift) / 3) * 1000) / 1000;
      break;
    }

    // Hiệu chỉnh: solidity lệch → chỉnh wobble; aspect lệch → nhân hệ số bù;
    // trọng tâm lệch → chỉnh độ dày dưới.
    if (metrics.solidity < solidityTarget) wobble = Math.max(0.05, wobble - 0.06);
    else wobble = Math.min(0.85, wobble + 0.06);
    aspectScale *= clampRange(targetAspect / Math.max(0.05, metrics.aspectRatio), 0.5, 2);
    if (metrics.centerHeightRatio < centerTarget) heightBias = Math.max(0.5, heightBias - 0.08);
    else heightBias = Math.min(1.8, heightBias + 0.08);
  }

  // Lượt kẹp vật lý cuối: aspect ngoài khoảng category thì co giãn quanh tâm
  // bbox để luôn nằm trong chuẩn — render lên không sai vật lý.
  if (bestShape && bestShape.kind === 'polygon') {
    const bounds0 = shapeBBox(bestShape.points);
    const measured0 = (bounds0.maxX - bounds0.minX) / Math.max(1e-6, bounds0.maxY - bounds0.minY);
    const [minA, maxA] = blueprint.physics.aspectRatioRange;
    if (measured0 < minA || measured0 > maxA) {
      const targetA = clampRange(measured0, minA, maxA);
      const factor = targetA / Math.max(0.05, measured0);
      const cx = (bounds0.minX + bounds0.maxX) / 2;
      bestShape = { kind: 'polygon', points: bestShape.points.map((p) => ({ x: cx + (p.x - cx) * factor, y: p.y })) };
      bestPerception = perceiveShape(bestShape);
    }
  }

  const finalPerception = bestPerception!;
  const finalDistance = blueprintDistance(blueprint, finalPerception);
  // Trong tolerance blueprint + đúng khoảng vật lý category.
  const inPhysics =
    finalPerception.aspectRatio >= blueprint.physics.aspectRatioRange[0] &&
    finalPerception.aspectRatio <= blueprint.physics.aspectRatioRange[1] &&
    finalPerception.solidity >= blueprint.physics.solidityRange[0] &&
    finalPerception.solidity <= blueprint.physics.solidityRange[1];
  const withinTolerance = finalDistance <= Math.max(0.25, blueprint.prototype.solidity * 0.3) && inPhysics;

  return {
    category: blueprint.category,
    shape: bestShape!,
    perception: finalPerception,
    withinTolerance,
    correctionRounds: rounds,
    blueprintDistance: Math.round(finalDistance * 1000) / 1000,
    note: withinTolerance
      ? `"${blueprint.category}" sinh đúng chuẩn sau ${rounds} vòng tự hiệu chỉnh (distance ${finalDistance})`
      : `"${blueprint.category}" vẫn lệch chuẩn sau ${rounds} vòng — cần thêm training samples`,
  };
}

// ===========================================================================
// Cổng chất lượng — chốt "render lên không sai, chuẩn đúng"
// ===========================================================================

export interface RenderQualityGate {
  /** Blueprint đã train theo category. */
  blueprints: Map<string, ObjectRenderBlueprint>;
  /** Số object đã kiểm và số fail. */
  verified: number;
  failed: number;
  /** Train blueprint cho category (nội bộ dùng bởi Trainer). */
  train(category: string, samples: ReadonlyArray<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }>): ObjectRenderBlueprint;
  /** Sinh object từ kiến thức đã train — kèm tự kiểm chứng. */
  generate(category: string, seed: number | string, options?: { scale?: number }): GeneratedObject | null;
  /** Kiểm một shape đang render có đúng chuẩn category không. */
  verify(category: string, shape: Shape, tolerance?: number): { pass: boolean; distance: number; drifts: string[] };
}

/** Tạo cổng chất lượng render — giữ blueprint toàn hệ thống. */
export function createRenderQualityGate(): RenderQualityGate {
  const blueprints = new Map<string, ObjectRenderBlueprint>();
  return {
    blueprints,
    verified: 0,
    failed: 0,
    train(category, samples) {
      const blueprint = trainObjectBlueprint(category, samples, { physics: CATEGORY_PHYSICS[category] });
      blueprints.set(category, blueprint);
      return blueprint;
    },
    generate(category, seed, options) {
      const blueprint = blueprints.get(category);
      if (!blueprint) return null;
      return generateObjectShape(blueprint, seed, options);
    },
    verify(category, shape, tolerance?: number) {
      const tol = tolerance ?? 0.35;
      const blueprint = blueprints.get(category);
      const perception = perceiveShape(shape);
      if (!blueprint) return { pass: false, distance: 1, drifts: [`chưa train blueprint cho "${category}"`] };
      const distance = blueprintDistance(blueprint, perception);
      const drifts: string[] = [];
      if (distance > tol) drifts.push(`distance ${distance} > tolerance ${tol}`);
      if (perception.aspectRatio < blueprint.physics.aspectRatioRange[0] || perception.aspectRatio > blueprint.physics.aspectRatioRange[1]) {
        drifts.push(`aspectRatio ${perception.aspectRatio} ngoài vật lý category [${blueprint.physics.aspectRatioRange.join(', ')}]`);
      }
      return { pass: drifts.length === 0, distance, drifts };
    },
  };
}
