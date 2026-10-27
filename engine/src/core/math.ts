// engine/src/core/math.ts — Các hàm toán học vector, ma trận, nội suy thuần không phụ thuộc Three.js

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function angleWrap(rad: number): number {
  const twoPi = Math.PI * 2;
  let a = rad % twoPi;
  if (a > Math.PI) a -= twoPi;
  if (a < -Math.PI) a += twoPi;
  return a;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-8), 0, 1);
  return t * t * (3 - 2 * t);
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

import type { Vec3 } from '../types/transform.types';
export type { Vec3 };

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function vecAdd(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vecSub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vecScale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function vecDot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vecCross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vecLength(a: Vec3): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

export function vecDistance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function vecNormalize(a: Vec3): Vec3 {
  const len = vecLength(a);
  if (len < 1e-9) return vec3(0, 0, 0);
  return vecScale(a, 1 / len);
}

export function vecLerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

export function vecDamp(current: Vec3, target: Vec3, lambda: number, dt: number): Vec3 {
  return {
    x: damp(current.x, target.x, lambda, dt),
    y: damp(current.y, target.y, lambda, dt),
    z: damp(current.z, target.z, lambda, dt),
  };
}

export function vecClone(v: Vec3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

// ---------------------------------------------------------------------------
// Nội suy nâng cao — nâng cấp họ lerp/smoothstep lên nội suy đa dạng
// ---------------------------------------------------------------------------

/** Nội suy ngược: t sao cho `lerp(a, b, t) = v`. An toàn khi a === b. */
export function inverseLerp(a: number, b: number, v: number): number {
  const span = b - a;
  return Math.abs(span) < 1e-12 ? 0 : (v - a) / span;
}

/** Chuyển giá trị từ đoạn [inMin, inMax] sang [outMin, outMax], kẹp trong đoạn ra. */
export function remap(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = clamp(inverseLerp(inMin, inMax, v), 0, 1);
  return lerp(outMin, outMax, t);
}

/** Smoothstep bậc 5 (Perlin quintic) — mượt hơn smoothstep bậc 3 ở cả hai đầu. */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-8), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Nội suy Catmull–Rom 1D qua 4 điểm kiểm soát — mượt C1, đi qua mọi điểm. */
export function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** Catmull–Rom 3D — quỹ đạo mượt qua dãy điểm kiểm soát. */
export function vecCatmullRom(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  return {
    x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
    y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
    z: catmullRom(p0.z, p1.z, p2.z, p3.z, t),
  };
}

/** Bezier bậc 3 (cubic) 1D. */
export function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return 3 * uu * t * p1 + 3 * u * tt * p2 + uu * u * p0 + tt * t * p3;
}

/** Bezier bậc 3 3D. */
export function vecCubicBezier(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  return {
    x: cubicBezier(p0.x, p1.x, p2.x, p3.x, t),
    y: cubicBezier(p0.y, p1.y, p2.y, p3.y, t),
    z: cubicBezier(p0.z, p1.z, p2.z, p3.z, t),
  };
}

/** Hermite cơ bản với tiếp tuyến đầu/cuối — nội suy C1 có kiểm soát độ dốc. */
export function hermite(t0: number, t1: number, m0: number, m1: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  return h00 * t0 + h10 * m0 + h01 * t1 + h11 * m1;
}

/** Bình phương khoảng cách — tránh sqrt khi chỉ so sánh. */
export function vecDistanceSquared(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/** Bình phương độ dài. */
export function vecLengthSquared(a: Vec3): number {
  return vecDot(a, a);
}

/**
 * Lò xo suy tán (damped spring) nửa ẩn — mô phỏng chuyển động vật lý thực:
 * cứng `stiffness`, tắt dần `damping`, bước thời gian `dt`. Ổn định với dt lớn
 * nhờ tích phân semi-implicit Euler. Trả giá trị và vận tốc mới.
 */
export function spring(
  current: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): { value: number; velocity: number } {
  const force = (target - current) * stiffness - velocity * damping;
  const newVelocity = velocity + force * dt;
  const value = current + newVelocity * dt;
  return { value, velocity: newVelocity };
}

/** Di chuyển tới đích tối đa `maxDelta` — không vượt qua đích. */
export function moveTowards(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) return target;
  return current + Math.sign(delta) * maxDelta;
}

/** Di chuyển 3D tới đích với bước tối đa theo khoảng cách thật. */
export function vecMoveTowards(current: Vec3, target: Vec3, maxDelta: number): Vec3 {
  const distSq = vecDistanceSquared(current, target);
  if (distSq <= maxDelta * maxDelta || distSq < 1e-20) return vecClone(target);
  const dist = Math.sqrt(distSq);
  const step = maxDelta / dist;
  return {
    x: current.x + (target.x - current.x) * step,
    y: current.y + (target.y - current.y) * step,
    z: current.z + (target.z - current.z) * step,
  };
}

/** Nội suy góc theo cung ngắn nhất (không quay vòng dài). */
export function angleLerp(a: number, b: number, t: number): number {
  return a + angleWrap(b - a) * t;
}

/** Damp góc theo cung ngắn nhất. */
export function angleDamp(current: number, target: number, lambda: number, dt: number): number {
  return angleLerp(current, target, 1 - Math.exp(-lambda * dt));
}
