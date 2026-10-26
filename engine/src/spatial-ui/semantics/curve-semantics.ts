/**
 * @file curve-semantics.ts
 * @module @aetheria/engine/spatial-ui/semantics/curve-semantics
 * @description Ngữ nghĩa đường cong, ma trận, lưới không gian, địa hình, nước và LOD.
 *
 * Trước đây 130 method của `CurvesMatricesEnvironmentSubsystem` trả về
 * `{ name: 'FN', valid: true, result: 0 }` cho 47 method, ma trận đơn vị cho
 * 19 method và cùng một khối LOD giả cho 15 method. Ở đây mọi phép tính
 * được thực sự thực hiện: nội suy, đạo hàm đường cong, phân tích ma trận,
 * lưới không gian, hàm địa hình và tính LOD theo khoảng cách.
 */

import type { Vec3D, QuatD, Box3D, SpatialGridCell } from '../types.js';
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
  lerpVec3,
  num,
  toVec3,
  multiplyMatrices,
  invertMatrix,
  transformPoint,
  perspectiveMatrix,
  lookAtMatrix,
  translationMatrix,
  scaleMatrix,
  quaternionMatrix,
  eulerMatrix,
  eulerToQuaternion,
  quaternionToEuler,
  determinant4x4,
  normalizeQuaternion,
  multiplyQuaternions,
  slerpQuaternion,
  bezierPoint,
  catmullRomPoint,
  pointAlongPath,
  pathLength,
  projectVector,
  rejectVector,
  reflectVector,
  namedResult,
  measurement,
  boundsResult,
  IDENTITY_MAT4,
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

/** Đọc danh sách điểm từ object. */
export function readPoints(source: unknown, keys: string[]): Vec3D[] {
  if (!source || typeof source !== 'object') return [];
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (Array.isArray(raw)) {
      return raw.map((p) => {
        if (p && typeof p === 'object' && 'position' in (p as Record<string, unknown>)) {
          return toVec3((p as Record<string, unknown>).position);
        }
        return toVec3(p);
      });
    }
  }
  return [];
}

/** Đọc số từ options với giá trị mặc định. */
export function opt(options: unknown, keys: string[], fallback: number): number {
  const v = readNum(options, keys, Number.NaN);
  return Number.isFinite(v) ? v : fallback;
}

// ---------------------------------------------------------------------------
// Ma trận
// ---------------------------------------------------------------------------

/** Đọc ma trận 4x4 từ dữ liệu bất kỳ. */
export function resolveMatrix(value: unknown): number[] {
  if (Array.isArray(value) && value.length >= 16) {
    const out = new Array<number>(16).fill(0);
    for (let i = 0; i < 16; i++) out[i] = num(value[i]);
    return out;
  }
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const matrix = o.matrix ?? o.elements;
    if (Array.isArray(matrix) && matrix.length >= 16) {
      const out = new Array<number>(16).fill(0);
      for (let i = 0; i < 16; i++) out[i] = num(matrix[i]);
      return out;
    }
    if (o.position || o.quaternion || o.rotation || o.scale) {
      return composeTRSMatrix(
        o.position && typeof o.position === 'object' ? toVec3(o.position) : { x: 0, y: 0, z: 0 },
        readQuatOf(o),
        o.scale && typeof o.scale === 'object' ? toVec3(o.scale) : { x: 1, y: 1, z: 1 },
      );
    }
  }
  return [...IDENTITY_MAT4];
}

/** Đọc quaternion từ object. */
export function readQuatOf(o: Record<string, unknown>): QuatD {
  const q = o.quaternion;
  if (q && typeof q === 'object') {
    const qq = q as Record<string, unknown>;
    return { x: num(qq.x), y: num(qq.y), z: num(qq.z), w: num(qq.w, 1) };
  }
  const r = o.rotation;
  if (r && typeof r === 'object') {
    const rr = r as Record<string, unknown>;
    return eulerToQuaternion(num(rr.x), num(rr.y), num(rr.z));
  }
  return { x: 0, y: 0, z: 0, w: 1 };
}

/** Ghép ma trận TRS (dịch · xoay · tỉ lệ). */
export function composeTRSMatrix(position: Vec3D, quaternion: QuatD, scale: Vec3D): number[] {
  return multiplyMatrices(
    multiplyMatrices(translationMatrix(position), quaternionMatrix(quaternion)),
    scaleMatrix(scale),
  );
}

/** Tách ma trận thành vị trí / xoay / tỉ lệ. */
export function decomposeMatrix(matrix: number[]): {
  position: Vec3D;
  quaternion: QuatD;
  scale: Vec3D;
} {
  const position = { x: matrix[12], y: matrix[13], z: matrix[14] };
  const basis = [
    { x: matrix[0], y: matrix[1], z: matrix[2] },
    { x: matrix[4], y: matrix[5], z: matrix[6] },
    { x: matrix[8], y: matrix[9], z: matrix[10] },
  ];
  const scale = {
    x: magnitude(basis[0]),
    y: magnitude(basis[1]),
    z: magnitude(basis[2]),
  };
  const safeScale = {
    x: Math.max(1e-9, scale.x),
    y: Math.max(1e-9, scale.y),
    z: Math.max(1e-9, scale.z),
  };
  const rotationMatrix = [
    basis[0].x / safeScale.x, basis[0].y / safeScale.x, basis[0].z / safeScale.x,
    basis[1].x / safeScale.y, basis[1].y / safeScale.y, basis[1].z / safeScale.y,
    basis[2].x / safeScale.z, basis[2].y / safeScale.z, basis[2].z / safeScale.z,
  ];
  return { position, quaternion: quaternionFromRotationMatrix(rotationMatrix), scale };
}

/** Quaternion từ ma trận xoay 3x3 (thứ tự cột). */
export function quaternionFromRotationMatrix(m: number[]): QuatD {
  const m00 = m[0], m01 = m[3], m02 = m[6];
  const m10 = m[1], m11 = m[4], m12 = m[7];
  const m20 = m[2], m21 = m[5], m22 = m[8];
  const trace = m00 + m11 + m22;
  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    return normalizeQuaternion({ x: (m21 - m12) / s, y: (m02 - m20) / s, z: (m10 - m01) / s, w: 0.25 * s });
  }
  if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    return normalizeQuaternion({ x: 0.25 * s, y: (m01 + m10) / s, z: (m02 + m20) / s, w: (m21 - m12) / s });
  }
  if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    return normalizeQuaternion({ x: (m01 + m10) / s, y: 0.25 * s, z: (m12 + m21) / s, w: (m02 - m20) / s });
  }
  const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
  return normalizeQuaternion({ x: (m02 + m20) / s, y: (m12 + m21) / s, z: 0.25 * s, w: (m10 - m01) / s });
}

/** Chuyển vị ma trận 4x4. */
export function transposeMatrix(m: number[]): number[] {
  const out = new Array<number>(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) out[row * 4 + col] = m[col * 4 + row];
  }
  return out;
}

/** Vết ma trận 4x4. */
export function traceMatrix(m: number[]): number {
  return m[0] + m[5] + m[10] + m[15];
}

/** Trực giao hoá Gram–Schmidt (giữ cấu trúc ma trận xoay). */
export function orthogonalizeMatrix(m: number[]): number[] {
  const out = [...m];
  const columns = [
    { x: out[0], y: out[1], z: out[2] },
    { x: out[4], y: out[5], z: out[6] },
    { x: out[8], y: out[9], z: out[10] },
  ];
  const result: Vec3D[] = [];
  for (const column of columns) {
    let v = { ...column };
    for (const basis of result) {
      const projection = dot(v, basis);
      v = subtract(v, scale(basis, projection));
    }
    result.push(v);
  }
  for (let i = 0; i < 3; i++) {
    out[i * 4 + 0] = result[i].x;
    out[i * 4 + 1] = result[i].y;
    out[i * 4 + 2] = result[i].z;
  }
  return out;
}

/** Chuẩn hoá ma trận thành trực giao đơn vị (cột). */
export function orthonormalizeMatrix(m: number[]): number[] {
  const orthogonal = orthogonalizeMatrix(m);
  const out = [...orthogonal];
  for (let col = 0; col < 3; col++) {
    const v = { x: out[col * 4], y: out[col * 4 + 1], z: out[col * 4 + 2] };
    const len = magnitude(v);
    if (len < 1e-9) continue;
    out[col * 4] = v.x / len;
    out[col * 4 + 1] = v.y / len;
    out[col * 4 + 2] = v.z / len;
  }
  return out;
}

/** Ma trận phản chuyển (normal matrix) cho phép biến đổi pháp tuyến. */
export function normalMatrix(m: number[]): number[] {
  const inverted = invertMatrix(m);
  const transposed = transposeMatrix(inverted);
  return [
    transposed[0], transposed[1], transposed[2], 0,
    transposed[4], transposed[5], transposed[6], 0,
    transposed[8], transposed[9], transposed[10], 0,
    0, 0, 0, 1,
  ];
}

/** Ma trận phối cảnh từ tham số camera. */
export function projectionMatrix(fov: number, aspect: number, near: number, far: number): number[] {
  return perspectiveMatrix(fov, aspect, near, far);
}

/** Sai số giữa hai ma trận (chuẩn Frobenius). */
export function matrixError(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Nội suy hai ma trận (phân rã rồi trộn quaternion + vị trí + tỉ lệ). */
export function interpolateMatrices(a: number[], b: number[], t: number): number[] {
  const k = clamp01(t);
  const da = decomposeMatrix(a);
  const db = decomposeMatrix(b);
  return composeTRSMatrix(
    lerpVec3(da.position, db.position, k),
    slerpQuaternion(da.quaternion, db.quaternion, k),
    lerpVec3(da.scale, db.scale, k),
  );
}

// ---------------------------------------------------------------------------
// Đường cong
// ---------------------------------------------------------------------------

/** Điểm Bézier bậc 3 tại tham số t. */
export function cubicBezier(p0: Vec3D, p1: Vec3D, p2: Vec3D, p3: Vec3D, t: number): Vec3D {
  return bezierPoint(p0, p1, p2, p3, t);
}

/** Điểm Bézier bậc 2 tại tham số t. */
export function quadraticBezier(p0: Vec3D, p1: Vec3D, p2: Vec3D, t: number): Vec3D {
  const u = 1 - t;
  return {
    x: p0.x * u * u + p1.x * 2 * u * t + p2.x * t * t,
    y: p0.y * u * u + p1.y * 2 * u * t + p2.y * t * t,
    z: p0.z * u * u + p1.z * 2 * u * t + p2.z * t * t,
  };
}

/** Đạo hàm Bézier bậc 3. */
export function cubicBezierTangent(p0: Vec3D, p1: Vec3D, p2: Vec3D, p3: Vec3D, t: number): Vec3D {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
    z: 3 * u * u * (p1.z - p0.z) + 6 * u * t * (p2.z - p1.z) + 3 * t * t * (p3.z - p2.z),
  };
}

/** Đạo hàm Bézier bậc 2. */
export function quadraticBezierTangent(p0: Vec3D, p1: Vec3D, p2: Vec3D, t: number): Vec3D {
  return {
    x: 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
    y: 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
    z: 2 * (1 - t) * (p1.z - p0.z) + 2 * t * (p2.z - p1.z),
  };
}

/** Độ cong của Bézier bậc 3 tại t. */
export function cubicBezierCurvature(p0: Vec3D, p1: Vec3D, p2: Vec3D, p3: Vec3D, t: number): number {
  const d1 = cubicBezierTangent(p0, p1, p2, p3, t);
  const d2 = {
    x: 6 * (1 - t) * (p2.x - 2 * p1.x + p0.x) + 6 * t * (p3.x - 2 * p2.x + p1.x),
    y: 6 * (1 - t) * (p2.y - 2 * p1.y + p0.y) + 6 * t * (p3.y - 2 * p2.y + p1.y),
    z: 6 * (1 - t) * (p2.z - 2 * p1.z + p0.z) + 6 * t * (p3.z - 2 * p2.z + p1.z),
  };
  const speed = magnitude(d1);
  if (speed < 1e-9) return 0;
  return magnitude(cross(d1, d2)) / (speed * speed * speed);
}

/** Lấy mẫu đều một đường cong Catmull-Rom. */
export function sampleCatmullRom(points: Vec3D[], samples: number): Vec3D[] {
  if (points.length === 0) return [];
  if (points.length === 1) return [{ ...points[0] }];
  const count = Math.max(2, Math.floor(samples));
  const result: Vec3D[] = [];
  const segments = points.length - 1;
  for (let i = 0; i < count; i++) {
    const u = (i / (count - 1)) * segments;
    const index = Math.min(Math.floor(u), segments - 1);
    const t = u - index;
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    result.push(catmullRomPoint(p0, p1, p2, p3, t));
  }
  return result;
}

/** Điểm gần nhất trên đa giác tuyến tính. */
export function closestPointOnPolyline(point: Vec3D, points: Vec3D[]): { point: Vec3D; t: number; distance: number } {
  if (points.length === 0) return { point: { ...point }, t: 0, distance: 0 };
  if (points.length === 1) {
    return { point: { ...points[0] }, t: 0, distance: distance3D(point, points[0]) };
  }
  let best = points[0];
  let bestT = 0;
  let bestDistance = Infinity;
  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1];
    const end = points[i];
    const segment = subtract(end, start);
    const lenSq = dot(segment, segment);
    const t = lenSq < 1e-12 ? 0 : clamp(dot(subtract(point, start), segment) / lenSq, 0, 1);
    const candidate = add(start, scale(segment, t));
    const d = distance3D(point, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
      bestT = (i - 1 + t) / (points.length - 1);
    }
  }
  return { point: best, t: bestT, distance: bestDistance };
}

/** Tham số ứng với khoảng cách cho trước trên một đường cong. */
export function parameterAtDistance(points: Vec3D[], targetDistance: number): number {
  if (points.length < 2) return 0;
  let accumulated = 0;
  for (let i = 1; i < points.length; i++) {
    const segmentLength = distance3D(points[i - 1], points[i]);
    if (accumulated + segmentLength >= targetDistance) {
      const remaining = targetDistance - accumulated;
      const local = segmentLength < 1e-9 ? 0 : remaining / segmentLength;
      return (i - 1 + local) / (points.length - 1);
    }
    accumulated += segmentLength;
  }
  return 1;
}

/** Khung Frenet của một đường cong (tangent, normal, binormal). */
export function curveFrame(points: Vec3D[], index: number): {
  tangent: Vec3D;
  normal: Vec3D;
  binormal: Vec3D;
} {
  const count = points.length;
  const previous = points[Math.max(0, index - 1)];
  const next = points[Math.min(count - 1, index + 1)];
  const tangent = normalize(subtract(next, previous));
  let reference: Vec3D = Math.abs(tangent.y) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const normal = normalize(cross(reference, tangent));
  const binormal = normalize(cross(tangent, normal));
  return { tangent, normal, binormal };
}

/** Độ cong của đa giác tại chỉ số. */
export function polylineCurvature(points: Vec3D[], index: number): number {
  if (points.length < 3) return 0;
  const a = points[Math.max(0, index - 1)];
  const b = points[clamp(index, 0, points.length - 1)];
  const c = points[Math.min(points.length - 1, index + 1)];
  const d1 = subtract(b, a);
  const d2 = subtract(c, b);
  const speed = magnitude(d1) * magnitude(d2) * magnitude(subtract(c, a));
  if (speed < 1e-9) return 0;
  return (2 * magnitude(cross(d1, d2))) / speed;
}

/** Làm mượt đa giác bằng trung bình có trọng số. */
export function smoothPolyline(points: Vec3D[], passes = 1): Vec3D[] {
  let current = points.map((p) => ({ ...p }));
  for (let pass = 0; pass < Math.max(1, passes); pass++) {
    const next: Vec3D[] = [current[0] ?? { x: 0, y: 0, z: 0 }];
    for (let i = 1; i < current.length - 1; i++) {
      next.push({
        x: (current[i - 1].x + 2 * current[i].x + current[i + 1].x) / 4,
        y: (current[i - 1].y + 2 * current[i].y + current[i + 1].y) / 4,
        z: (current[i - 1].z + 2 * current[i].z + current[i + 1].z) / 4,
      });
    }
    if (current.length > 1) next.push(current[current.length - 1]);
    current = next;
  }
  return current;
}

/** Điểm trên quỹ đạo tại thời gian t (nội suy tuyến tính theo mốc thời gian). */
export function trajectoryPointAtTime(
  samples: Array<{ position: Vec3D; time: number }>,
  time: number,
): Vec3D {
  if (samples.length === 0) return { x: 0, y: 0, z: 0 };
  if (samples.length === 1) return { ...samples[0].position };
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].time >= time) {
      const span = samples[i].time - samples[i - 1].time;
      const t = span < 1e-9 ? 0 : (time - samples[i - 1].time) / span;
      return lerpVec3(samples[i - 1].position, samples[i].position, t);
    }
  }
  return { ...samples[samples.length - 1].position };
}

// ---------------------------------------------------------------------------
// Toạ độ
// ---------------------------------------------------------------------------

/** Trục từ một hướng chuẩn hoá. */
export function coordinateBasis(direction: Vec3D): { x: Vec3D; y: Vec3D; z: Vec3D } {
  const z = normalize(direction);
  if (magnitude(z) === 0) return { x: { ...RIGHT3 }, y: { ...UP3 }, z: { ...FORWARD3 } };
  const reference = Math.abs(z.y) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const x = normalize(cross(reference, z));
  const y = normalize(cross(z, x));
  return { x, y, z };
}

/** Chuyển đổi giữa hai hệ toạ độ. */
export function convertCoordinates(point: Vec3D, from: Vec3D, to: Vec3D): Vec3D {
  const source = coordinateBasis(from);
  const destination = coordinateBasis(to);
  const local = {
    x: dot(point, source.x),
    y: dot(point, source.y),
    z: dot(point, source.z),
  };
  return add(
    add(scale(destination.x, local.x), scale(destination.y, local.y)),
    scale(destination.z, local.z),
  );
}

/** Lượng tử hoá giá trị theo bước. */
export function quantize(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

/** Lượng tử hoá vector. */
export function quantizeVector(v: Vec3D, step: number): Vec3D {
  return { x: quantize(v.x, step), y: quantize(v.y, step), z: quantize(v.z, step) };
}

/** Kẹp giá trị trong khoảng. */
export function clampValue(value: number, min: number, max: number): number {
  return clamp(value, min, max);
}

/** Quấn giá trị vào khoảng [0, range). */
export function wrapValue(value: number, range: number): number {
  if (range <= 0) return value;
  return ((value % range) + range) % range;
}

/** Bám theo lưới. */
export function snapValue(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

/** Làm tròn theo số chữ số thập phân. */
export function roundValue(value: number, decimals: number): number {
  const factor = Math.pow(10, Math.max(0, Math.floor(decimals)));
  return Math.round(value * factor) / factor;
}

// ---------------------------------------------------------------------------
// Lưới không gian
// ---------------------------------------------------------------------------

/** Chỉ số ô lưới chứa một điểm thế giới. */
export function gridCellIndex(world: Vec3D, cellSize: number): { x: number; y: number; z: number } {
  const size = Math.max(1e-6, cellSize);
  return {
    x: Math.floor(world.x / size),
    y: Math.floor(world.y / size),
    z: Math.floor(world.z / size),
  };
}

/** Tâm thế giới của một ô lưới. */
export function gridCellCenter(index: { x: number; y: number; z: number }, cellSize: number): Vec3D {
  const size = Math.max(1e-6, cellSize);
  return {
    x: (index.x + 0.5) * size,
    y: (index.y + 0.5) * size,
    z: (index.z + 0.5) * size,
  };
}

/** Hộp giới hạn của một ô lưới. */
export function gridCellBounds(index: { x: number; y: number; z: number }, cellSize: number): Box3D {
  const size = Math.max(1e-6, cellSize);
  return {
    min: { x: index.x * size, y: index.y * size, z: index.z * size },
    max: { x: (index.x + 1) * size, y: (index.y + 1) * size, z: (index.z + 1) * size },
  };
}

/** Khoảng cách giữa hai chỉ số ô (theo số ô). */
export function gridIndexDistance(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

/** Sáu ô lượng xung quanh. */
export function gridNeighborCells(index: { x: number; y: number; z: number }): Array<{ x: number; y: number; z: number }> {
  const { x, y, z } = index;
  return [
    { x: x + 1, y, z },
    { x: x - 1, y, z },
    { x, y: y + 1, z },
    { x, y: y - 1, z },
    { x, y, z: z + 1 },
    { x, y, z: z - 1 },
  ];
}

/** Chi phí đi giữa hai ô (chéo tốn √2). */
export function gridTraversalCost(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = Math.abs(b.x - a.x);
  const dy = Math.abs(b.y - a.y);
  const dz = Math.abs(b.z - a.z);
  const diagonal = Math.min(dx, dy, dz);
  const straight = dx + dy + dz - 3 * diagonal;
  return straight + diagonal * Math.SQRT2;
}

// ---------------------------------------------------------------------------
// Địa hình & nước
// ---------------------------------------------------------------------------

/**
 * Hàm độ cao địa hình.
 *
 * Đây là hàm **tất định** (tổng các hình sin) thay cho giá trị cứng — cùng
 * một điểm luôn cho cùng một độ cao, và độ dốc/độ cong được suy ra từ đúng
 * hàm đó nên nhất quán với nhau.
 */
export function terrainHeightAt(x: number, z: number, amplitude = 1, frequency = 0.05): number {
  return (
    Math.sin(x * frequency) * amplitude
    + Math.cos(z * frequency * 1.3) * amplitude * 0.6
    + Math.sin((x + z) * frequency * 0.7) * amplitude * 0.3
  );
}

/** Pháp tuyến địa hình (gradient âm). */
export function terrainNormalAt(x: number, z: number, amplitude = 1, frequency = 0.05, epsilon = 0.05): Vec3D {
  const hx = terrainHeightAt(x + epsilon, z, amplitude, frequency) - terrainHeightAt(x - epsilon, z, amplitude, frequency);
  const hz = terrainHeightAt(x, z + epsilon, amplitude, frequency) - terrainHeightAt(x, z - epsilon, amplitude, frequency);
  return normalize({ x: -hx / (2 * epsilon), y: 1, z: -hz / (2 * epsilon) });
}

/** Độ dốc địa hình (rad). */
export function terrainSlopeAt(x: number, z: number, amplitude = 1, frequency = 0.05): number {
  const normal = terrainNormalAt(x, z, amplitude, frequency);
  return Math.acos(clamp(normal.y, -1, 1));
}

/** Độ cong địa hình. */
export function terrainCurvatureAt(x: number, z: number, amplitude = 1, frequency = 0.05, epsilon = 0.1): number {
  const hx = terrainHeightAt(x + epsilon, z, amplitude, frequency) - 2 * terrainHeightAt(x, z, amplitude, frequency) + terrainHeightAt(x - epsilon, z, amplitude, frequency);
  const hz = terrainHeightAt(x, z + epsilon, amplitude, frequency) - 2 * terrainHeightAt(x, z, amplitude, frequency) + terrainHeightAt(x, z - epsilon, amplitude, frequency);
  return (hx + hz) / (epsilon * epsilon);
}

/** Diện tích bề mặt địa hình trên một vùng. */
export function terrainSurfaceArea(size: number, amplitude = 1, frequency = 0.05, samples = 24): number {
  const count = Math.max(2, Math.floor(samples));
  const step = size / count;
  let area = 0;
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      const x = -size / 2 + (i + 0.5) * step;
      const z = -size / 2 + (j + 0.5) * step;
      const normal = terrainNormalAt(x, z, amplitude, frequency);
      area += (step * step) / Math.max(1e-6, normal.y);
    }
  }
  return area;
}

/** Thể tích địa hình trên một vùng. */
export function terrainVolume(size: number, amplitude = 1, frequency = 0.05, samples = 24): number {
  const count = Math.max(2, Math.floor(samples));
  const step = size / count;
  let volume = 0;
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      const x = -size / 2 + (i + 0.5) * step;
      const z = -size / 2 + (j + 0.5) * step;
      volume += terrainHeightAt(x, z, amplitude, frequency) * step * step;
    }
  }
  return volume;
}

/** Điểm địa hình gần nhất với một điểm (dò từ trên xuống). */
export function closestTerrainPoint(
  point: Vec3D,
  amplitude = 1,
  frequency = 0.05,
  maxDrop = 100,
): Vec3D & { height: number } {
  const ground = terrainHeightAt(point.x, point.z, amplitude, frequency);
  const height = point.y - ground;
  return { x: point.x, y: ground, z: point.z, height };
}

/** Mặt nước: sóng đơn giản trên mực nước. */
export function waterSurfaceHeight(x: number, z: number, waterLevel = 0, waveAmplitude = 0, waveFrequency = 0.2): number {
  return waterLevel + Math.sin(x * waveFrequency) * Math.cos(z * waveFrequency) * waveAmplitude;
}

/** Pháp tuyến mặt nước. */
export function waterSurfaceNormal(x: number, z: number, waterLevel = 0, waveAmplitude = 0, waveFrequency = 0.2): Vec3D {
  const epsilon = 0.05;
  const hx = waterSurfaceHeight(x + epsilon, z, waterLevel, waveAmplitude, waveFrequency)
    - waterSurfaceHeight(x - epsilon, z, waterLevel, waveAmplitude, waveFrequency);
  const hz = waterSurfaceHeight(x, z + epsilon, waterLevel, waveAmplitude, waveFrequency)
    - waterSurfaceHeight(x, z - epsilon, waterLevel, waveAmplitude, waveFrequency);
  return normalize({ x: -hx / (2 * epsilon), y: 1, z: -hz / (2 * epsilon) });
}

/** Lực đẩy (Archimedes) của vật thể chìm một phần. */
export function buoyancyForce(
  volume: number,
  density: number,
  waterDensity: number,
  submergedFraction: number,
): number {
  return clamp(submergedFraction, 0, 1) * volume * (waterDensity - density) * 9.81;
}

// ---------------------------------------------------------------------------
// LOD
// ---------------------------------------------------------------------------

/** Kích thước hình chiếu của vật thể trên màn hình (đơn vị tương đối). */
export function projectedScreenSize(radius: number, distance: number): number {
  return radius / Math.max(0.0001, distance);
}

/** Mức LOD theo kích thước chiếu (0 = chi tiết nhất). */
export function lodLevelForScreenSize(screenSize: number, levels = 4): number {
  if (screenSize >= 0.5) return 0;
  if (screenSize >= 0.25) return 1;
  if (screenSize >= 0.1) return 2;
  return Math.min(levels - 1, 3);
}

/** Ngưỡng chuyển LOD. */
export function lodThreshold(level: number): number {
  return [0.5, 0.25, 0.1, 0.05][clamp(level, 0, 3)];
}

/** Sai số chiếu theo mức LOD. */
export function lodProjectedError(level: number, baseError = 0.01): number {
  return baseError * Math.pow(2, Math.max(0, level));
}

/** Tần số cập nhật theo mức LOD. */
export function lodUpdateFrequency(level: number, baseFrequency = 60): number {
  return Math.max(1, baseFrequency / Math.pow(2, Math.max(0, level)));
}

/** Điểm số chọn LOD (cao hơn = ưu tiên cập nhật). */
export function lodSelectionScore(level: number, distance: number, importance = 1): number {
  return (importance * 4) / (Math.max(1, level + 1) * Math.max(0.001, distance));
}

/** Tạo bản ghi kết quả chuẩn hoá. */
export function named(name: string, result: unknown, extra?: Record<string, unknown>): Record<string, unknown> {
  return namedResult(name, result, extra);
}

/** Tạo bản ghi đo chuẩn hoá. */
export function scalar(name: string, value: number, unit = 'unit', extra?: Record<string, unknown>): Record<string, unknown> {
  return measurement(name, value, unit, extra);
}

/** Tạo bản ghi hộp bao chuẩn hoá. */
export function bounds(name: string, box: Box3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return boundsResult(name, box, extra);
}

/** Tạo bản ghi ma trận chuẩn hoá. */
export function matrixRecord(name: string, matrix: number[], extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: true,
    matrix,
    determinant: determinant4x4(matrix),
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}
