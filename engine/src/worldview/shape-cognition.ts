/**
 * @file shape-cognition.ts
 * @module @aetheria/engine/worldview/shape-cognition
 * @description Agent CẢM NHẬN và TƯ DUY được hình dạng: mọi `Shape` render được
 * quy thành vector nhận thức (diện tích, tỉ lệ khung, số đỉnh, đối xứng, độ
 * đặc); agent học **khái niệm hình dạng** ("cái nhà", "cái cây") từ mẫu — nội
 * bộ hoặc **dữ liệu mẫu từ BÊN NGOÀI** (external samples) — rồi tự phân loại
 * những gì mình thấy; và **kiểm chứng render == thế giới thực**: so khớp hình
 * đang render với logic kỳ vọng để bắt sai lệch trước khi hiện lên UI.
 */

import type { SceneNode, Shape, Vec2 } from './types.js';
import type { LayeredFeatureVector } from '../training/features.js';
import { shapeBounds } from './geometry.js';
import { clamp01, clampRange } from '../deeplearning/random.js';

// ===========================================================================
// Nhận thức hình học — Shape → vector đặc trưng agent đọc được
// ===========================================================================

/** Vector nhận thức một hình. */
export interface ShapePerception {
  kind: Shape['kind'];
  /** Bounding box. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  width: number;
  height: number;
  /** Tỉ lệ khung w/h `[0, ∞)`. */
  aspectRatio: number;
  /** Diện tích xấp xỉ (shoelace cho đa giác, πr² cho tròn…). */
  area: number;
  /** Số đỉnh (polygon/path). */
  vertexCount: number;
  /** Trọng tâm. */
  centroid: Vec2;
  /** Độ đối xứng dọc trục đứng `[0, 1]`. */
  verticalSymmetry: number;
  /** Độ đặc = area / bbox area `[0, 1]` — hình thưa (cây) vs đặc (tường). */
  solidity: number;
  /** Vị trí trọng tâm tương đối trong bbox `[0, 1]` — thấp = đế nặng (nhà). */
  centerHeightRatio: number;
}

/** Diện tích đa giác bằng shoelace (tắt dấu). */
function polygonArea(points: Vec2[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/** Nhận thức generic cho mọi Shape. */
export function perceiveShape<T extends Shape>(shape: T): ShapePerception {
  const bounds = shapeBounds(shape);
  const width = Math.max(1e-6, bounds.maxX - bounds.minX);
  const height = Math.max(1e-6, bounds.maxY - bounds.minY);
  let area = 0;
  let vertexCount = 0;
  let centroid = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };

  switch (shape.kind) {
    case 'circle':
      area = Math.PI * shape.radius ** 2;
      centroid = { ...shape.center };
      vertexCount = 0;
      break;
    case 'ellipse':
      area = Math.PI * shape.rx * shape.ry;
      centroid = { ...shape.center };
      vertexCount = 0;
      break;
    case 'rect':
      area = shape.width * shape.height;
      centroid = { x: shape.topLeft.x + shape.width / 2, y: shape.topLeft.y + shape.height / 2 };
      vertexCount = 4;
      break;
    case 'polygon':
      area = polygonArea(shape.points);
      vertexCount = shape.points.length;
      centroid = {
        x: shape.points.reduce((s, p) => s + p.x, 0) / Math.max(1, shape.points.length),
        y: shape.points.reduce((s, p) => s + p.y, 0) / Math.max(1, shape.points.length),
      };
      break;
    case 'path': {
      // Đường mở: diện tích gần đúng bằng shoelace nếu khép — băng qua mép.
      const pts = shape.closed ? shape.points : [...shape.points, shape.points[0]];
      area = polygonArea(pts);
      vertexCount = shape.points.length;
      centroid = {
        x: shape.points.reduce((s, p) => s + p.x, 0) / Math.max(1, shape.points.length),
        y: shape.points.reduce((s, p) => s + p.y, 0) / Math.max(1, shape.points.length),
      };
      break;
    }
    case 'line':
      area = 0;
      vertexCount = 2;
      centroid = { x: (shape.from.x + shape.to.x) / 2, y: (shape.from.y + shape.to.y) / 2 };
      break;
  }

  // Đối xứng dọc: mirror từng điểm quanh trục giữa bbox, đo sai số trung bình.
  let symmetry = 0;
  const mirroredPoints =
    shape.kind === 'polygon' || shape.kind === 'path'
      ? shape.points
      : circlePointsApprox(shape, bounds);
  if (mirroredPoints.length >= 3) {
    let error = 0;
    for (const p of mirroredPoints) {
      const mirroredX = bounds.minX + bounds.maxX - p.x;
      let best = Infinity;
      for (const q of mirroredPoints) best = Math.min(best, Math.abs(q.x - mirroredX));
      error += best;
    }
    symmetry = clamp01(1 - error / mirroredPoints.length / Math.max(1, width));
  }

  const solidArea = width * height;
  return {
    kind: shape.kind,
    bounds,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
    aspectRatio: Math.round((width / height) * 100) / 100,
    area: Math.round(area * 100) / 100,
    vertexCount,
    centroid: { x: Math.round(centroid.x * 100) / 100, y: Math.round(centroid.y * 100) / 100 },
    verticalSymmetry: Math.round(symmetry * 100) / 100,
    solidity: clamp01(area / solidArea),
    centerHeightRatio: clamp01((bounds.maxY - centroid.y) / height),
  };
}

function circlePointsApprox(shape: Shape, bounds: { minX: number; minY: number; maxX: number; maxY: number }): Vec2[] {
  const samples: Vec2[] = [];
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const rx = (bounds.maxX - bounds.minX) / 2;
  const ry = (bounds.maxY - bounds.minY) / 2;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    samples.push({ x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry });
  }
  void shape;
  return samples;
}

/** Nhận thức cả một node (hợp mọi shape con — tổng diện tích, bbox đầy). */
export function perceiveNode(node: SceneNode): { node: SceneNode; perceptions: ShapePerception[]; merged: ShapePerception } {
  const perceptions = node.shapes.map(perceiveShape);
  const bounds = nodeBoundsOf(node.shapes);
  const totalArea = perceptions.reduce((sum, p) => sum + p.area, 0);
  const width = Math.max(1e-6, bounds.maxX - bounds.minX);
  const height = Math.max(1e-6, bounds.maxY - bounds.minY);
  const centroid = {
    x: perceptions.reduce((s, p) => s + p.centroid.x * p.area, 0) / Math.max(1e-6, totalArea),
    y: perceptions.reduce((s, p) => s + p.centroid.y * p.area, 0) / Math.max(1e-6, totalArea),
  };
  const merged: ShapePerception = {
    kind: node.shapes[0]?.kind ?? 'rect',
    bounds,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
    aspectRatio: Math.round((width / height) * 100) / 100,
    area: Math.round(totalArea * 100) / 100,
    vertexCount: perceptions.reduce((sum, p) => sum + p.vertexCount, 0),
    centroid: { x: Math.round(centroid.x * 100) / 100, y: Math.round(centroid.y * 100) / 100 },
    verticalSymmetry: perceptions.length > 0 ? perceptions.reduce((s, p) => s + p.verticalSymmetry, 0) / perceptions.length : 0,
    solidity: clamp01(totalArea / (width * height)),
    centerHeightRatio: clamp01((bounds.maxY - centroid.y) / height),
  };
  return { node, perceptions, merged };
}

function nodeBoundsOf(shapes: Shape[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const shape of shapes) {
    const b = shapeBounds(shape);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

// ===========================================================================
// Khái niệm hình dạng — học từ mẫu (nội bộ + bên ngoài) và phân loại
// ===========================================================================

/** Khái niệm hình dạng agent đã học. */
export interface FormConcept {
  id: string;
  name: string;
  /** Đặc trưng trung bình của mẫu. */
  prototype: {
    aspectRatio: number;
    relativeArea: number;
    vertexCount: number;
    centerHeightRatio: number;
    solidity: number;
    /** Tuỳ chọn — từ vector đa tầng: hệ số thon (cây > 1, người < 1). */
    taperRatio?: number;
    /** Tuỳ chọn — texture. */
    colorVariance?: number;
    graininess?: number;
  };
  /** Độ cho phép khi khớp — càng học nhiều càng chặt. */
  tolerance: number;
  samples: number;
  /** Nguồn mẫu: 'world' (tự render) hoặc id nguồn ngoài. */
  sources: string[];
}

/** Mẫu dữ liệu từ BÊN NGOÀI — game/data pipeline nạp vào để train agent. */
export interface ExternalShapeSample {
  /** Nguồn: 'dataset:medieval_houses', 'human_annotation', 'photo_trace'… */
  source: string;
  aspectRatio: number;
  relativeArea: number;
  vertexCount: number;
  centerHeightRatio: number;
  solidity: number;
  /** Nhãn thật từ nguồn ngoài — khẳng định form đúng logic thực tế. */
  groundTruth: string;
}

/** Kết quả phân loại. */
export interface Classification {
  conceptId: string | null;
  name: string | null;
  confidence: number;
  /** Khoảng cách đặc trưng tới prototype (nhỏ = giống). */
  distance: number;
}

/** Thang chuẩn hoá TOÀN CỤC từng trục — so sánh chéo concept nhất quán. */
const PERCEPTION_SCALES: Readonly<{ aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number }> = Object.freeze({
  aspectRatio: 3,
  relativeArea: 500,
  vertexCount: 24,
  centerHeightRatio: 1,
  solidity: 1,
});

function distanceTo(
  p: FormConcept['prototype'],
  s: { aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number },
  layeredP?: { taperRatio?: number; colorVariance?: number; graininess?: number },
  layeredS?: { taperRatio?: number; colorVariance?: number; graininess?: number },
): number {
  // Mỗi trục chia cho thang toàn cục — không phụ thuộc prototype đang so.
  const d = (a: number, b: number, scale: number) => Math.abs(a - b) / scale;
  let base =
    d(p.aspectRatio, s.aspectRatio, PERCEPTION_SCALES.aspectRatio) +
    d(p.relativeArea, s.relativeArea, PERCEPTION_SCALES.relativeArea) +
    d(p.vertexCount, s.vertexCount, PERCEPTION_SCALES.vertexCount) +
    d(p.centerHeightRatio, s.centerHeightRatio, PERCEPTION_SCALES.centerHeightRatio) +
    d(p.solidity, s.solidity, PERCEPTION_SCALES.solidity);
  let count = 5;
  // Lớp đa tầng: taper + texture — phân biệt cây/nhà khi bbox metrics trùng nhau.
  if (layeredP && layeredS) {
    if (layeredP.taperRatio !== undefined && layeredS.taperRatio !== undefined) {
      base += d(layeredP.taperRatio, layeredS.taperRatio, 3);
      count++;
    }
    if (layeredP.colorVariance !== undefined && layeredS.colorVariance !== undefined) {
      base += d(layeredP.colorVariance, layeredS.colorVariance, 1);
      count++;
    }
    if (layeredP.graininess !== undefined && layeredS.graininess !== undefined) {
      base += d(layeredP.graininess, layeredS.graininess, 1);
      count++;
    }
  }
  return base / count;
}

/** Động cơ tư duy hình dạng. */
export class FormCognitionEngine {
  public readonly concepts = new Map<string, FormConcept>();
  /** Nhật ký kiểm chứng — sai lệch render vs thực tế bị ghi lại. */
  public readonly driftLog: Array<{ conceptId: string; year: number; drifts: string[] }> = [];

  /**
   * Học khái niệm từ các perception mẫu (lấy từ render thật của thế giới hoặc
   * dữ liệu ngoài đã quy về perception). Mẫu càng nhiều tolerance càng chặt.
   */
  public learnConcept(id: string, name: string, samples: ShapePerception[], layered?: ReadonlyArray<LayeredFeatureVector>): FormConcept {
    if (samples.length === 0) throw new RangeError(`Khái niệm "${id}" cần ít nhất một mẫu`);
    const avg = (pick: (p: ShapePerception) => number) => samples.reduce((sum, p) => sum + pick(p), 0) / samples.length;
    const avgL = (pick: (f: LayeredFeatureVector) => number) =>
      layered && layered.length > 0 ? layered.reduce((sum, f) => sum + pick(f), 0) / layered.length : undefined;
    const concept: FormConcept = {
      id,
      name,
      prototype: {
        aspectRatio: Math.round(avg((p) => p.aspectRatio) * 100) / 100,
        relativeArea: Math.round(avg((p) => p.area) * 100) / 100,
        vertexCount: Math.round(avg((p) => p.vertexCount)),
        centerHeightRatio: Math.round(avg((p) => p.centerHeightRatio) * 100) / 100,
        solidity: Math.round(avg((p) => p.solidity) * 100) / 100,
        taperRatio: avgL((f) => f.mesh.taperRatio),
        colorVariance: avgL((f) => f.texture.colorVariance),
        graininess: avgL((f) => f.texture.graininess),
      },
      // Càng nhiều mẫu càng tự tin → tolerance co lại.
      tolerance: clampRange(0.5 - Math.min(0.3, samples.length * 0.02), 0.15, 0.5),
      samples: samples.length,
      sources: ['world'],
    };
    this.concepts.set(id, concept);
    return concept;
  }

  /**
   * Nhập dữ liệu mẫu TỪ BÊN NGOÀI (dataset/game/human annotation) để train:
   * mỗi mẫu external cập nhật prototype (trung bình chạy) và ghi nguồn.
   * `groundTruth` phải khớp concept — nguồn sai nhãn bị từ chối (chống nhiễu).
   */
  public importExternalSamples(conceptId: string, external: readonly ExternalShapeSample[]): { accepted: number; rejected: number; concept: FormConcept | null } {
    const concept = this.concepts.get(conceptId);
    if (!concept) return { accepted: 0, rejected: external.length, concept: null };
    let accepted = 0;
    let rejected = 0;
    for (const sample of external) {
      if (sample.groundTruth.toLowerCase() !== concept.name.toLowerCase()) {
        rejected++;
        continue;
      }
      const w = 1 / (concept.samples + 1);
      concept.prototype.aspectRatio = Math.round((concept.prototype.aspectRatio * (1 - w) + sample.aspectRatio * w) * 100) / 100;
      concept.prototype.relativeArea = Math.round((concept.prototype.relativeArea * (1 - w) + sample.relativeArea * w) * 100) / 100;
      concept.prototype.vertexCount = Math.round(concept.prototype.vertexCount * (1 - w) + sample.vertexCount * w);
      concept.prototype.centerHeightRatio = Math.round((concept.prototype.centerHeightRatio * (1 - w) + sample.centerHeightRatio * w) * 100) / 100;
      concept.prototype.solidity = Math.round((concept.prototype.solidity * (1 - w) + sample.solidity * w) * 100) / 100;
      concept.samples++;
      if (!concept.sources.includes(sample.source)) concept.sources.push(sample.source);
      accepted++;
    }
    return { accepted, rejected, concept };
  }

  /** Phân loại một perception: khớp concept gần nhất trong bán kính tolerance. */
  public classify(perception: ShapePerception, layered?: LayeredFeatureVector): Classification {
    let best: FormConcept | null = null;
    let bestDistance = Infinity;
    for (const concept of this.concepts.values()) {
      const distance = distanceTo(concept.prototype, {
        aspectRatio: perception.aspectRatio,
        relativeArea: perception.area,
        vertexCount: perception.vertexCount,
        centerHeightRatio: perception.centerHeightRatio,
        solidity: perception.solidity,
      }, concept.prototype.taperRatio !== undefined ? { taperRatio: concept.prototype.taperRatio, colorVariance: concept.prototype.colorVariance, graininess: concept.prototype.graininess } : undefined,
      layered ? { taperRatio: layered.mesh.taperRatio, colorVariance: layered.texture.colorVariance, graininess: layered.texture.graininess } : undefined);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = concept;
      }
    }
    if (!best || bestDistance > best.tolerance) {
      return { conceptId: null, name: null, confidence: 0, distance: Math.round(bestDistance * 1000) / 1000 };
    }
    return {
      conceptId: best.id,
      name: best.name,
      confidence: Math.round(clamp01(1 - bestDistance / Math.max(1e-6, best.tolerance)) * 100) / 100,
      distance: Math.round(bestDistance * 1000) / 1000,
    };
  }

  /**
   * KIỂM CHỨNG RENDER == THỰC TẾ: một node đang render được kỳ vọng thuộc
   * concept nào — nếu phân loại lệch hoặc đặc trưng vượt giới hạn logic thì
   * ghi sai lệch vào driftLog. Đây là "UI không sai lệch so với thế giới thực".
   */
  public verifyAgainstReality(
    conceptId: string,
    node: SceneNode,
    year: number,
    expectations: { aspectRatioRange?: [number, number]; minVertexCount?: number; maxSolidity?: number } = {},
  ): { match: boolean; drifts: string[] } {
    const concept = this.concepts.get(conceptId);
    const { merged } = perceiveNode(node);
    const drifts: string[] = [];
    if (!concept) {
      drifts.push(`chưa học khái niệm "${conceptId}" — không đối chiếu được`);
      this.driftLog.push({ conceptId, year, drifts });
      return { match: false, drifts };
    }
    const classification = this.classify(merged);
    if (classification.conceptId !== conceptId) {
      drifts.push(`render ra node "${node.id}" nhưng agent nhận diện là "${classification.name ?? 'không rõ'}" (distance ${classification.distance})`);
    }
    if (expectations.aspectRatioRange) {
      const [min, max] = expectations.aspectRatioRange;
      if (merged.aspectRatio < min || merged.aspectRatio > max) {
        drifts.push(`aspectRatio ${merged.aspectRatio} ngoài logic thực tế [${min}, ${max}]`);
      }
    }
    if (expectations.minVertexCount !== undefined && merged.vertexCount < expectations.minVertexCount) {
      drifts.push(`vertexCount ${merged.vertexCount} < tối thiểu ${expectations.minVertexCount} — form bị thiếu chi tiết`);
    }
    if (expectations.maxSolidity !== undefined && merged.solidity > expectations.maxSolidity) {
      drifts.push(`solidity ${merged.solidity} vượt ngưỡng ${expectations.maxSolidity} — hình đặc bất thường`);
    }
    const match = drifts.length === 0;
    if (!match) this.driftLog.push({ conceptId, year, drifts });
    return { match, drifts };
  }

  /** Agent mô tả những gì nó nhìn thấy bằng lời — tư duy hình dạng ra ngôn ngữ. */
  public describe(perception: ShapePerception): string {
    const shapeWord =
      perception.verticalSymmetry > 0.7 ? 'đối xứng' : perception.verticalSymmetry > 0.4 ? 'hơi lệch' : 'lộn xộn';
    const tallness = perception.aspectRatio < 0.7 ? 'cao lênh lênh' : perception.aspectRatio > 1.6 ? 'trải dài ngang' : 'cân đối';
    const solidityWord = perception.solidity > 0.7 ? 'đặc chắc' : perception.solidity > 0.3 ? 'thưa vừa' : 'thưa thớt';
    return `hình ${perception.kind} ${tallness}, ${shapeWord}, ${solidityWord} (diện tích ~${perception.area}, ${perception.vertexCount} đỉnh)`;
  }

  public stats(): { concepts: number; trainedSamples: number; drifts: number } {
    let trainedSamples = 0;
    for (const concept of this.concepts.values()) trainedSamples += concept.samples;
    return { concepts: this.concepts.size, trainedSamples, drifts: this.driftLog.length };
  }
}
