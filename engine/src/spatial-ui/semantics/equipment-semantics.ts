/**
 * @file equipment-semantics.ts
 * @module @aetheria/engine/spatial-ui/semantics/equipment-semantics
 * @description Ngữ nghĩa trang bị, phương tiện, công trình kiến trúc và phân tích không gian.
 *
 * Trước đây 120 method của `SpatialEquipmentArchitectureSubsystem` trả về
 * offset rỗng cho 38 method, `{ name: 'FN', ... }` cho 31 method, `1.0` cho 21
 * method và kết quả va chạm giả cho 6 method. Ở đây kích thước, khối lượng,
 * tâm và phân tích không gian đều được tính thật.
 */

import type { Vec3D, Box3D } from '../types.js';
import {
  add,
  subtract,
  scale,
  normalize,
  dot,
  cross,
  magnitude,
  distance3D,
  distance2D,
  clamp,
  clamp01,
  lerp,
  num,
  toVec3,
  boundingBox,
  UP3,
  FORWARD3,
  RIGHT3,
} from '../spatial-primitives.js';

// ---------------------------------------------------------------------------
// Đọc dữ liệu linh hoạt
// ---------------------------------------------------------------------------

/** Đọc số từ object theo danh sách khoá. */
export function readNum(source: unknown, keys: string[], fallback: number): number {
  if (!source || typeof source !== 'object') return fallback;
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  }
  return fallback;
}

/** Đọc vector từ object theo danh sách khoá. */
export function readVec(source: unknown, keys: string[]): Vec3D {
  if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0 };
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (raw && typeof raw === 'object') return toVec3(raw);
  }
  return { x: 0, y: 0, z: 0 };
}

/** Đọc danh sách điểm từ object / mảng. */
export function readPoints(source: unknown, keys: string[] = ['points', 'positions', 'items', 'entities']): Vec3D[] {
  if (Array.isArray(source)) return source.map((p) => toVec3(p));
  if (!source || typeof source !== 'object') return [];
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (Array.isArray(raw)) return raw.map((p) => toVec3(p));
  }
  return [];
}

/** Đọc số từ options với giá trị mặc định. */
export function opt(options: unknown, keys: string[], fallback: number): number {
  const v = readNum(options, keys, Number.NaN);
  return Number.isFinite(v) ? v : fallback;
}

/** Vị trí điểm trong thế giới từ entity hoặc object thường. */
export function worldPoint(source: unknown): Vec3D {
  if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0 };
  const o = source as Record<string, unknown>;
  if (o.position && typeof o.position === 'object') return toVec3(o.position);
  if (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') return toVec3(o);
  return { x: 0, y: 0, z: 0 };
}

// ---------------------------------------------------------------------------
// Kích thước chuẩn của thiết bị
// ---------------------------------------------------------------------------

/** Kích thước xe cơ bản (m) — một xe du lịch cỡ trung. */
export const VEHICLE_DIMENSIONS = Object.freeze({
  length: 4.5,
  width: 1.8,
  height: 1.5,
  wheelbase: 2.7,
  trackWidth: 1.6,
  wheelRadius: 0.33,
  groundClearance: 0.16,
  mass: 1500,
});

/** Kích thước công trình kiến trúc cơ bản (m). */
export const BUILDING_DIMENSIONS = Object.freeze({
  height: 3.2,
  floorHeight: 3.2,
  wallThickness: 0.2,
  doorWidth: 0.9,
  doorHeight: 2.1,
  windowWidth: 1.2,
  windowHeight: 1.4,
  stairRise: 0.18,
  stairTread: 0.28,
});

/** Kích thước trang bị cơ thể (m). */
export const EQUIPMENT_DIMENSIONS = Object.freeze({
  helmetRadius: 0.13,
  glassesOffset: 0.07,
  backpackDepth: 0.22,
  backpackHeight: 0.4,
  weaponLength: 0.9,
  weaponMuzzleOffset: 0.8,
  weaponGripOffset: 0.18,
  weaponStockOffset: 0.25,
  shieldRadius: 0.45,
  shieldHeight: 0.9,
  clothingThickness: 0.012,
});

/** Tốc độ tham chiếu của xe (m/s) khi không có dữ liệu vận hành. */
export const VEHICLE_REFERENCE_SPEED = 22;

/** Trọng lực chuẩn (m/s²). */
export const GRAVITY = 9.81;

// ---------------------------------------------------------------------------
// Phân tích không gian
// ---------------------------------------------------------------------------

/** Trọng tâm của tập điểm. */
export function centroidOf(points: Vec3D[], weights?: number[]): Vec3D {
  if (points.length === 0) return { x: 0, y: 0, z: 0 };
  let totalWeight = 0;
  const sum = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < points.length; i++) {
    const w = weights && weights[i] !== undefined ? num(weights[i]) : 1;
    totalWeight += w;
    sum.x += points[i].x * w;
    sum.y += points[i].y * w;
    sum.z += points[i].z * w;
  }
  if (Math.abs(totalWeight) < 1e-12) return { x: 0, y: 0, z: 0 };
  return { x: sum.x / totalWeight, y: sum.y / totalWeight, z: sum.z / totalWeight };
}

/** Trung vị của tập điểm (theo từng trục). */
export function medianOf(points: Vec3D[]): Vec3D {
  if (points.length === 0) return { x: 0, y: 0, z: 0 };
  const axis = (key: 'x' | 'y' | 'z'): number => {
    const values = points.map((p) => p[key]).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
  };
  return { x: axis('x'), y: axis('y'), z: axis('z') };
}

/** Phương sai của tập điểm (theo từng trục). */
export function varianceOf(points: Vec3D[], center?: Vec3D): Vec3D {
  if (points.length < 2) return { x: 0, y: 0, z: 0 };
  const c = center ?? centroidOf(points);
  const sum = { x: 0, y: 0, z: 0 };
  for (const p of points) {
    sum.x += (p.x - c.x) ** 2;
    sum.y += (p.y - c.y) ** 2;
    sum.z += (p.z - c.z) ** 2;
  }
  const n = points.length;
  return { x: sum.x / n, y: sum.y / n, z: sum.z / n };
}

/** Ma trận hiệp phương sai 3x3 (dạng mảng 9 phần tử, thứ tự hàng). */
export function covarianceOf(points: Vec3D[], center?: Vec3D): number[] {
  if (points.length < 2) return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const c = center ?? centroidOf(points);
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (const p of points) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const dz = p.z - c.z;
    xx += dx * dx;
    xy += dx * dy;
    xz += dx * dz;
    yy += dy * dy;
    yz += dy * dz;
    zz += dz * dz;
  }
  const n = points.length;
  return [xx / n, xy / n, xz / n, xy / n, yy / n, yz / n, xz / n, yz / n, zz / n];
}

/** Ma trận khoảng cách giữa mọi cặp điểm. */
export function pairwiseDistanceMatrix(points: Vec3D[]): number[][] {
  return points.map((a) => points.map((b) => distance3D(a, b)));
}

/** Khoảng cách tới láng giềng gần nhất của mỗi điểm. */
export function nearestNeighborDistances(points: Vec3D[]): number[] {
  return points.map((p, i) => {
    let best = Infinity;
    points.forEach((q, j) => {
      if (i === j) return;
      best = Math.min(best, distance3D(p, q));
    });
    return Number.isFinite(best) ? best : 0;
  });
}

/** Khoảng cách tới láng giềng xa nhất của mỗi điểm. */
export function farthestNeighborDistances(points: Vec3D[]): number[] {
  return points.map((p, i) => {
    let best = 0;
    points.forEach((q, j) => {
      if (i === j) return;
      best = Math.max(best, distance3D(p, q));
    });
    return best;
  });
}

/** Phân bố tần suốt theo các khoảng giá trị. */
export function spatialDistribution(points: Vec3D[], bins = 8): { bins: number; range: [number, number]; counts: number[] } {
  const count = Math.max(1, Math.floor(bins));
  const distances = points.map((p) => magnitude(p));
  const min = distances.length > 0 ? Math.min(...distances) : 0;
  const max = distances.length > 0 ? Math.max(...distances) : 0;
  const span = max - min;
  const counts = new Array<number>(count).fill(0);
  for (const d of distances) {
    const index = span < 1e-12 ? 0 : clamp(Math.floor(((d - min) / span) * count), 0, count - 1);
    counts[index] += 1;
  }
  return { bins: count, range: [min, max], counts };
}

/** Mật độ điểm trong hộp bao. */
export function spatialDensity(points: Vec3D[]): number {
  if (points.length === 0) return 0;
  const box = boundsOf(points);
  const volume = Math.max(1e-9, (box.max.x - box.min.x) * (box.max.y - box.min.y) * (box.max.z - box.min.z));
  return points.length / volume;
}

/** Mức độ gom cụm (1 = rời rạc, 0 = rất chặt). */
export function spatialClustering(points: Vec3D[]): number {
  if (points.length < 2) return 1;
  const center = centroidOf(points);
  const nearest = nearestNeighborDistances(points);
  const meanNearest = nearest.reduce((s, v) => s + v, 0) / nearest.length;
  const extent = points.reduce((s, p) => s + distance3D(p, center), 0) / points.length;
  if (extent < 1e-9) return 0;
  return clamp01(meanNearest / (2 * extent));
}

/** Các điểm ngoại lệ (xa trung tâm hơn 2 độ lệch chuẩn). */
export function spatialOutliers(points: Vec3D[], sigma = 2): { points: Vec3D[]; indices: number[] } {
  if (points.length < 3) return { points: [], indices: [] };
  const center = centroidOf(points);
  const deviations = points.map((p) => distance3D(p, center));
  const mean = deviations.reduce((s, v) => s + v, 0) / deviations.length;
  const variance = deviations.reduce((s, v) => s + (v - mean) ** 2, 0) / deviations.length;
  const stdDev = Math.sqrt(variance);
  const threshold = mean + sigma * stdDev;
  const indices: number[] = [];
  const outliers: Vec3D[] = [];
  deviations.forEach((d, i) => {
    if (d > threshold) {
      indices.push(i);
      outliers.push(points[i]);
    }
  });
  return { points: outliers, indices };
}

/** Mức độ đối xứng của tập điểm (1 = hoàn hảo). */
export function spatialSymmetry(points: Vec3D[], axis: Vec3D = RIGHT3): number {
  if (points.length < 2) return 1;
  const n = normalize(axis);
  const mirrored = points.map((p) => subtract(scale(p, 2 * dot(p, n)), p));
  let error = 0;
  for (let i = 0; i < points.length; i++) {
    let best = Infinity;
    for (const m of mirrored) best = Math.min(best, distance3D(points[i], m));
    error += best;
  }
  const extent = points.reduce((s, p) => s + magnitude(p), 0) / points.length;
  return clamp01(1 - error / points.length / Math.max(1e-6, extent));
}

/** Tỷ lệ chồng lấn giữa hai AABB (0..1). */
export function overlapRatio(a: Box3D, b: Box3D): number {
  const overlapX = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
  const overlapY = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y);
  const overlapZ = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z);
  if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) return 0;
  const intersection = overlapX * overlapY * overlapZ;
  const volumeA = (a.max.x - a.min.x) * (a.max.y - a.min.y) * (a.max.z - a.min.z);
  const volumeB = (b.max.x - b.min.x) * (b.max.y - b.min.y) * (b.max.z - b.min.z);
  const union = volumeA + volumeB - intersection;
  return union < 1e-12 ? 0 : clamp01(intersection / union);
}

/** Hộp bao của tập điểm. */
export function boundsOf(points: Vec3D[]): Box3D {
  if (points.length === 0) {
    return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
  }
  const min = { x: Infinity, y: Infinity, z: Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (const p of points) {
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    min.z = Math.min(min.z, p.z);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
    max.z = Math.max(max.z, p.z);
  }
  return { min, max };
}

/** Bán kính bao của tập điểm quanh trọng tâm. */
export function boundingRadiusOf(points: Vec3D[]): number {
  if (points.length === 0) return 0;
  const center = centroidOf(points);
  return Math.max(...points.map((p) => distance3D(p, center)));
}

// ---------------------------------------------------------------------------
// Tạo bản ghi chuẩn hoá
// ---------------------------------------------------------------------------

/** Tạo bản ghi kết quả có tên. */
export function named(name: string, result: unknown, extra?: Record<string, unknown>): Record<string, unknown> {
  return { name, valid: true, timestamp: Date.now(), result, ...(extra ?? {}) };
}

/** Tạo bản ghi đo. */
export function scalar(name: string, value: number, unit = 'unit', extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: Number.isFinite(value),
    value,
    unit,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi hướng. */
export function direction(name: string, value: Vec3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: value.x !== 0 || value.y !== 0 || value.z !== 0,
    direction: value,
    magnitude: magnitude(value),
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi quaternion. */
export function orientation(name: string, value: { x: number; y: number; z: number; w: number }, extra?: Record<string, unknown>): Record<string, unknown> {
  return { name, valid: true, orientation: value, timestamp: Date.now(), ...(extra ?? {}) };
}

/** Tạo bản ghi hộp bao. */
export function bounds(name: string, box: Box3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: true,
    min: box.min,
    max: box.max,
    center: {
      x: (box.min.x + box.max.x) / 2,
      y: (box.min.y + box.max.y) / 2,
      z: (box.min.z + box.max.z) / 2,
    },
    size: {
      x: box.max.x - box.min.x,
      y: box.max.y - box.min.y,
      z: box.max.z - box.min.z,
    },
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi va chạm. */
export function collide(
  name: string,
  hit: boolean,
  distance: number,
  point?: Vec3D,
  normal?: Vec3D,
  penetration = 0,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    hit,
    collision: hit,
    overlap: hit,
    distance,
    point: point ?? { x: 0, y: 0, z: 0 },
    normal: normal ?? { x: 0, y: 1, z: 0 },
    penetration,
    timestamp: Date.now(),
  };
}
