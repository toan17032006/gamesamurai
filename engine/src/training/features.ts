/**
 * @file features.ts
 * @module @aetheria/engine/training/features
 * @description Vector đặc trưng đa tầng cho agent tư duy vật thể: **cấu trúc
 * mesh đa tầng** (chia silhouette theo dải chiều cao — mỗi tầng một profile
 * rộng/narrow, kiến trúc trong/ngoài), và **texture** (bucket màu, phương sai
 * màu, hạt noise). Vector này là "bộ não thị giác" rút gọn — NPC/system agent
 * đều đọc được để xây/phá/render đúng form.
 */

import type { SceneNode, Shape, Vec2 } from '../worldview/types.js';
import { shapeBounds, noise2D } from '../worldview/geometry.js';
import { clamp01, clampRange } from '../deeplearning/random.js';

/** Một tầng mesh — dải ngang của vật thể. */
export interface MeshLayer {
  /** Tầng thứ mấy (0 = đáy). */
  index: number;
  /** Chiều cao tầng tương đối `[0, 1]`. */
  relativeY: number;
  /** Bề rộng vật thể ở tầng này (đơn vị thế giới). */
  width: number;
  /** Bề rộng chuẩn hoá theo bề rộng max `[0, 1]`. */
  relativeWidth: number;
  /** Số điểm của mesh ở tầng này. */
  vertices: number;
}

/** Vector texture — màu sắc của vật thể. */
export interface TextureVector {
  /** Số bucket màu `[0, 1]` chuẩn hoá theo 12 bucket. */
  colorBuckets: number;
  /** Màu chủ đạo. */
  dominantColor: string;
  /** Phương sai màu `[0, 1]` — đơn sắc vs sặc sỡ. */
  colorVariance: number;
  /** Độ hạt noise `[0, 1]` — texture thô/mịn tự tính từ seed. */
  graininess: number;
}

/** Vector đặc trưng đa tầng trọn vẹn. */
export interface LayeredFeatureVector {
  silhouette: {
    aspectRatio: number;
    solidity: number;
    centerHeightRatio: number;
  };
  /** Cấu trúc mesh đa tầng — profile bề rộng theo chiều cao. */
  mesh: {
    layers: MeshLayer[];
    layerCount: number;
    /** Hệ số thon: tầng trên / tầng dưới `[0, ∞)` — cây > 1, người < 1. */
    taperRatio: number;
  };
  texture: TextureVector;
}

/** Tách các điểm polygon từ Shape (nếu có). */
function polygonPoints(shape: Shape): Vec2[] | null {
  if (shape.kind === 'polygon') return shape.points;
  if (shape.kind === 'path' && shape.closed) return shape.points;
  return null;
}

/**
 * Trích vector đặc trưng đa tầng từ một Shape:
 * `layers` dải ngang cắt silhouette, `texture` từ màu + seed noise.
 */
export function extractLayeredFeatures(
  shape: Shape,
  options: { layerCount?: number; color?: string; textureSeed?: number } = {},
): LayeredFeatureVector {
  const layerCount = clampRange(Math.floor(options.layerCount ?? 5), 2, 12);
  const bounds = shapeBounds(shape);
  const width = Math.max(1e-6, bounds.maxX - bounds.minX);
  const height = Math.max(1e-6, bounds.maxY - bounds.minY);
  // Cấu trúc mesh đa tầng: quét từng dải ngang, đo bề rộng material.
  const layers: MeshLayer[] = [];
  let topWidth = 0;
  let bottomWidth = 0;
  for (let layer = 0; layer < layerCount; layer++) {
    // Tầng 0 = ĐÁY (maxY) — đo từ dưới lên.
    const y = bounds.maxY - ((layer + 0.5) / layerCount) * height;
    const rowPoints: Vec2[] = [];
    // Quét ngang dải: lấy 9 mẫu điểm trong dải.
    for (let s = 0; s < 9; s++) {
      const sampleY = bounds.minY + ((layer + (s + 0.5) / 9) / layerCount) * height;
      rowPoints.push({ x: 0, y: sampleY });
    }
    const widthAtLayer = measureWidthAtHeight(shape, bounds.minY, bounds.maxY, y);
    const relativeWidth = clamp01(widthAtLayer / width);
    if (layer === 0) bottomWidth = relativeWidth;
    if (layer === layerCount - 1) topWidth = relativeWidth;
    layers.push({
      index: layer,
      relativeY: clamp01((layer + 0.5) / layerCount),
      width: Math.round(widthAtLayer * 100) / 100,
      relativeWidth: Math.round(relativeWidth * 100) / 100,
      vertices: rowPoints.length,
    });
  }

  // Hệ số thon: tầng trên rộng hơn tầng dưới → cây (>1); ngược lại → người (<1).
  const taperRatio = bottomWidth > 1e-6 ? Math.round((topWidth / bottomWidth) * 100) / 100 : 1;

  // Texture: bucket màu từ fill + noise grain từ seed.
  const color = options.color ?? '#888888';
  const textureSeed = options.textureSeed ?? Math.round(bounds.minX + bounds.minY);
  const buckets = new Set<number>();
  let varianceAccum = 0;
  const samples = 16;
  for (let i = 0; i < samples; i++) {
    const n = noise2D(i * 1.3, textureSeed * 0.7, textureSeed);
    buckets.add(Math.floor(n * 12));
    varianceAccum += (n - 0.5) ** 2;
  }
  const texture: TextureVector = {
    colorBuckets: clamp01(buckets.size / 12),
    dominantColor: color,
    colorVariance: clamp01(varianceAccum / samples * 4),
    graininess: clamp01(noise2D(textureSeed * 0.31, 7.7, textureSeed)),
  };

  const area = estimateArea(shape);
  return {
    silhouette: {
      aspectRatio: Math.round((width / height) * 100) / 100,
      solidity: clamp01(area / (width * height)),
      centerHeightRatio: clamp01((bounds.maxY - centroidY(shape)) / height),
    },
    mesh: { layers, layerCount, taperRatio },
    texture,
  };
}

/** Đo bề rộng material tại một chiều cao — quét giao điểm cạnh polygon. */
function measureWidthAtHeight(shape: Shape, minY: number, maxY: number, y: number): number {
  const points = polygonPoints(shape);
  if (!points || points.length < 3) {
    // Không phải polygon: trả bề rộng bbox.
    const bounds = shapeBounds(shape);
    return bounds.maxX - bounds.minX;
  }
  const xs: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
      xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
    }
  }
  if (xs.length < 2) return 0;
  xs.sort((m, n) => m - n);
  return xs[xs.length - 1] - xs[0];
}

function centroidY(shape: Shape): number {
  const points = polygonPoints(shape);
  if (points && points.length > 0) {
    return points.reduce((sum, p) => sum + p.y, 0) / points.length;
  }
  const bounds = shapeBounds(shape);
  return (bounds.minY + bounds.maxY) / 2;
}

function estimateArea(shape: Shape): number {
  const points = polygonPoints(shape);
  if (points && points.length >= 3) {
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      sum += a.x * b.y - b.x * a.y;
    }
    return Math.abs(sum) / 2;
  }
  if (shape.kind === 'circle') return Math.PI * shape.radius ** 2;
  if (shape.kind === 'ellipse') return Math.PI * shape.rx * shape.ry;
  if (shape.kind === 'rect') return shape.width * shape.height;
  return 0;
}

/** Vector đặc trưng phẳng (cho mạng nơ-ron) từ layered features — 8 chiều. */
export function flattenLayeredFeatures(features: LayeredFeatureVector): number[] {
  const layers = features.mesh.layers;
  const sampled = [0, layers.length - 1].map((i) => layers[Math.max(0, Math.min(layers.length - 1, i))]?.relativeWidth ?? 0);
  return [
    features.silhouette.aspectRatio,
    features.silhouette.solidity,
    features.silhouette.centerHeightRatio,
    features.mesh.taperRatio,
    ...sampled,
    features.texture.colorVariance,
    features.texture.graininess,
  ];
}

/** Giao rộng material của TẤT CẢ shape tại một chiều cao (tổng hợp cả node). */
function measureWidthForShapes(shapes: readonly Shape[], y: number): number {
  let total = 0;
  for (const shape of shapes) {
    total += measureWidthAtHeight(shape, 0, 0, y);
  }
  return total;
}

/**
 * Trích layered features từ TOÀN BỘ node (hợp mọi shape): profile bề rộng theo
 * chiều cao tổng hợp cả thân + tán — cây (tán rộng thân nhỏ, taper > 1) và nhà
 * (đều nhau, taper ≈ 1) phân biệt được đúng bản chất kết cấu.
 */
export function extractNodeFeatures(node: SceneNode, options: { layerCount?: number; textureSeed?: number } = {}): LayeredFeatureVector {
  if (node.shapes.length === 0) {
    return {
      silhouette: { aspectRatio: 1, solidity: 0, centerHeightRatio: 0.5 },
      mesh: { layers: [], layerCount: 0, taperRatio: 1 },
      texture: { colorBuckets: 0, dominantColor: node.style.fill ?? '#888', colorVariance: 0, graininess: 0 },
    };
  }
  const layerCount = clampRange(Math.floor(options.layerCount ?? 5), 2, 12);
  const bounds = nodeBoundsOfShapes(node.shapes);
  const width = Math.max(1e-6, bounds.maxX - bounds.minX);
  const height = Math.max(1e-6, bounds.maxY - bounds.minY);

  const layers: MeshLayer[] = [];
  let bottomWidth = 0;
  let topWidth = 0;
  for (let layer = 0; layer < layerCount; layer++) {
    const y = bounds.maxY - ((layer + 0.5) / layerCount) * height;
    const widthAtLayer = measureWidthForShapes(node.shapes, y);
    const relativeWidth = clamp01(widthAtLayer / width);
    if (layer === 0) bottomWidth = relativeWidth;
    if (layer === layerCount - 1) topWidth = relativeWidth;
    layers.push({
      index: layer,
      relativeY: clamp01((layer + 0.5) / layerCount),
      width: Math.round(widthAtLayer * 100) / 100,
      relativeWidth: Math.round(relativeWidth * 100) / 100,
      vertices: node.shapes.length,
    });
  }
  const taperRatio = bottomWidth > 1e-6 ? Math.round((topWidth / bottomWidth) * 100) / 100 : 1;

  // Texture từ màu node + seed.
  const color = node.style.fill ?? '#888888';
  const textureSeed = options.textureSeed ?? Math.round(bounds.minX + bounds.minY);
  const buckets = new Set<number>();
  let varianceAccum = 0;
  const samples = 16;
  for (let i = 0; i < samples; i++) {
    const n = noise2D(i * 1.3, textureSeed * 0.7, textureSeed);
    buckets.add(Math.floor(n * 12));
    varianceAccum += (n - 0.5) ** 2;
  }

  // Diện tích + trọng tâm hợp nhất.
  const totalArea = node.shapes.reduce((sum, shape) => sum + estimateArea(shape), 0);
  const centroidY = (() => {
    let weighted = 0;
    let areaSum = 0;
    for (const shape of node.shapes) {
      const area = estimateArea(shape);
      const b = shapeBounds(shape);
      weighted += ((b.minY + b.maxY) / 2) * area;
      areaSum += area;
    }
    return areaSum > 1e-9 ? weighted / areaSum : (bounds.minY + bounds.maxY) / 2;
  })();

  return {
    silhouette: {
      aspectRatio: Math.round((width / height) * 100) / 100,
      solidity: clamp01(totalArea / (width * height)),
      centerHeightRatio: clamp01((bounds.maxY - centroidY) / height),
    },
    mesh: { layers, layerCount, taperRatio },
    texture: {
      colorBuckets: clamp01(buckets.size / 12),
      dominantColor: color,
      colorVariance: clamp01(varianceAccum / samples * 4),
      graininess: clamp01(noise2D(textureSeed * 0.31, 7.7, textureSeed)),
    },
  };
}

function nodeBoundsOfShapes(shapes: readonly Shape[]): { minX: number; minY: number; maxX: number; maxY: number } {
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
