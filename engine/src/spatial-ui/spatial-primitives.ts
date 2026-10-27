/**
 * @file spatial-primitives.ts
 * @module @aetheria/engine/spatial-ui/spatial-primitives
 * @description Toán học không gian dùng chung cho toàn bộ Spatial UI.
 *
 * Trước đây mỗi subsystem tự viết lại cùng một phép tính (khoảng 2.900 method
 * trùng body), khiến nhiều hàm trả về **cùng một giá trị sai** — ví dụ
 * `calculateDistance2D` trả khoảng cách 3D, `calculateSquaredDistance` trả
 * căn bậc hai.
 *
 * Module này gom các phép tính đúng vào một chỗ; mỗi hàm ở subsystem chỉ
 * cần gọi đúng phép tính với đúng tham số.
 */

import type { Vec2D, Vec3D, Vec4D, QuatD, Box3D, Sphere3D, Ray3D, Plane3D } from './types.js';

export const ZERO3: Readonly<Vec3D> = Object.freeze({ x: 0, y: 0, z: 0 });
export const UP3: Readonly<Vec3D> = Object.freeze({ x: 0, y: 1, z: 0 });
export const FORWARD3: Readonly<Vec3D> = Object.freeze({ x: 0, y: 0, z: 1 });
export const RIGHT3: Readonly<Vec3D> = Object.freeze({ x: 1, y: 0, z: 0 });

export const IDENTITY_QUAT: Readonly<QuatD> = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });
export const IDENTITY_MAT4: Readonly<number[]> = Object.freeze([
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
]);

/** Đọc một số hợp lệ từ giá trị bất kỳ. */
export function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Đọc một bản ghi khóa chuỗi từ giá trị bất kỳ; trả về `{}` nếu không phải object. */
export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

/** Đọc một vector từ dữ liệu không kiểu (entity, plain object, mảng). */
export function toVec3(value: unknown): Vec3D {
  if (!value || typeof value !== 'object') return { x: 0, y: 0, z: 0 };
  const v = value as Record<string, unknown>;
  const pick = (key: string, alt?: string): number => {
    const raw: unknown = alt !== undefined ? (v[key] ?? v[alt]) : v[key];
    return num(raw);
  };
  return { x: pick('x'), y: pick('y'), z: pick('z') };
}

/** Đọc vector từ entity — ưu tiên `position`, sau đó `x/y/z`. */
export function entityPosition(entity: unknown): Vec3D {
  if (!entity || typeof entity !== 'object') return { x: 0, y: 0, z: 0 };
  const e = entity as Record<string, unknown>;
  if (e.position && typeof e.position === 'object') return toVec3(e.position);
  if (typeof e.x === 'number' || typeof e.y === 'number' || typeof e.z === 'number') return toVec3(e);
  return { x: 0, y: 0, z: 0 };
}

/** Lấy quaternion từ entity (hỗ trợ cả `quaternion` và `rotation` Euler). */
export function entityQuaternion(entity: unknown): QuatD {
  if (!entity || typeof entity !== 'object') return { x: 0, y: 0, z: 0, w: 1 };
  const e = entity as Record<string, unknown>;
  const q = e.quaternion;
  if (q && typeof q === 'object') {
    const qq = q as Record<string, unknown>;
    return {
      x: typeof qq.x === 'number' ? qq.x : 0,
      y: typeof qq.y === 'number' ? qq.y : 0,
      z: typeof qq.z === 'number' ? qq.z : 0,
      w: typeof qq.w === 'number' ? qq.w : 1,
    };
  }
  const r = e.rotation;
  if (r && typeof r === 'object') {
    const rr = r as Record<string, unknown>;
    return eulerToQuaternion(num(rr.x), num(rr.y), num(rr.z));
  }
  return { x: 0, y: 0, z: 0, w: 1 };
}

/** Lấy vector hướng (mũi, forward) từ entity. */
export function entityForward(entity: unknown): Vec3D {
  if (!entity || typeof entity !== 'object') return { x: 0, y: 0, z: 1 };
  const e = entity as Record<string, unknown>;
  const f = e.forward;
  if (f && typeof f === 'object') return toVec3(f);
  const q = entityQuaternion(entity);
  // Hướng forward mặc định của engine là +Z.
  const { x, y, z, w } = q;
  return {
    x: 2 * (x * z + w * y),
    y: 2 * (y * z - w * x),
    z: 1 - 2 * (x * x + y * y),
  };
}

/** Lấy vector hướng bên phải từ entity (right = cross(up, forward)). */
export function entityRight(entity: unknown): Vec3D {
  const forward = entityForward(entity);
  const right = cross(UP3, forward);
  return magnitude(right) > 1e-9 ? normalize(right) : RIGHT3;
}

/** Lấy vector hướng phía trên từ entity (up = cross(forward, right)). */
export function entityUp(entity: unknown): Vec3D {
  const forward = entityForward(entity);
  const up = cross(forward, entityRight(entity));
  return magnitude(up) > 1e-9 ? normalize(up) : UP3;
}

// ---------------------------------------------------------------------------
// Toán học cơ bản
// ---------------------------------------------------------------------------

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return value < min ? min : value > max ? max : value;
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec3(a: Vec3D, b: Vec3D, t: number): Vec3D {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

/** Bảo đảm vector là đơn vị (trả về zero nếu độ dài bằng 0). */
export function normalize(v: Vec3D): Vec3D {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len === 0 || !Number.isFinite(len)) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function dot(a: Vec3D, b: Vec3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vec3D, b: Vec3D): Vec3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function add(a: Vec3D, b: Vec3D): Vec3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subtract(a: Vec3D, b: Vec3D): Vec3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale(a: Vec3D, s: number): Vec3D {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function magnitude(v: Vec3D): number {
  return Math.hypot(v.x, v.y, v.z);
}

export function distance3D(a: Vec3D, b: Vec3D): number {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

/** Khoảng cách trên mặt phẳng ngang (XZ) — "2D distance" của engine Y-up. */
export function distance2D(a: Vec3D, b: Vec3D): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

export function horizontalDistance(a: Vec3D, b: Vec3D): number {
  return Math.abs(b.x - a.x);
}

export function verticalDistance(a: Vec3D, b: Vec3D): number {
  return Math.abs(b.y - a.y);
}

export function depthDistance(a: Vec3D, b: Vec3D): number {
  return Math.abs(b.z - a.z);
}

export function manhattanDistance(a: Vec3D, b: Vec3D): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + Math.abs(b.z - a.z);
}

export function chebyshevDistance(a: Vec3D, b: Vec3D): number {
  return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y), Math.abs(b.z - a.z));
}

export function squaredDistance(a: Vec3D, b: Vec3D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return dx * dx + dy * dy + dz * dz;
}

/** Khoảng cách từ `a` tới gốc toạ độ (hoặc tới `origin` nếu có). */
export function distanceToOrigin(a: Vec3D, origin?: Vec3D): number {
  return distance3D(a, origin ?? { x: 0, y: 0, z: 0 });
}

// ---------------------------------------------------------------------------
// Góc & quaternion
// ---------------------------------------------------------------------------

export function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function degrees(radiansValue: number): number {
  return (radiansValue * 180) / Math.PI;
}

/** Chuẩn hoá góc về khoảng (-π, π]. */
export function normalizeAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  let a = angle % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a <= -Math.PI) a += Math.PI * 2;
  return a;
}

export function clampAngle(angle: number, min: number, max: number): number {
  return clamp(angle, min, max);
}

export function signedAngle(a: Vec3D, b: Vec3D, axis: Vec3D = UP3): number {
  const na = normalize(a);
  const nb = normalize(b);
  const n = normalize(axis);
  const cosine = clamp(dot(na, nb), -1, 1);
  const sine = dot(cross(na, nb), n);
  return Math.atan2(sine, cosine);
}

export function unsignedAngle(a: Vec3D, b: Vec3D): number {
  return Math.acos(clamp(dot(normalize(a), normalize(b)), -1, 1));
}

export function angleBetweenVectors(a: Vec3D, b: Vec3D): number {
  return unsignedAngle(a, b);
}

/** Chuẩn hoá quaternion (w có thể âm — quaternion và -q cùng một xoay). */
export function normalizeQuaternion(q: QuatD): QuatD {
  const len = Math.hypot(q.x, q.y, q.z, q.w);
  if (len === 0 || !Number.isFinite(len)) return { x: 0, y: 0, z: 0, w: 1 };
  return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
}

export function eulerToQuaternion(x: number, y: number, z: number): QuatD {
  const c1 = Math.cos(x / 2);
  const c2 = Math.cos(y / 2);
  const c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2);
  const s2 = Math.sin(y / 2);
  const s3 = Math.sin(z / 2);
  // Thứ tự XYZ (three.js mặc định).
  return {
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 - s1 * c2 * s3,
    z: c1 * c2 * s3 + s1 * s2 * c3,
    w: c1 * c2 * c3 - s1 * s2 * s3,
  };
}

/**
 * Trích góc Euler (thứ tự XYZ) từ quaternion.
 *
 * Đây là phép nghịch đảo chính xác của `eulerToQuaternion` — cùng thứ tự XYZ,
 * cùng quy ước hệ Y-up, nên vòng euler → quaternion → euler trả về đúng góc gốc.
 */
export function quaternionToEuler(q: QuatD): { x: number; y: number; z: number } {
  const n = normalizeQuaternion(q);
  const { x, y, z, w } = n;

  // Hàng/cột của ma trận xoay theo thứ tự XYZ.
  const m11 = 1 - 2 * (y * y + z * z);
  const m12 = 2 * (x * y - z * w);
  const m13 = 2 * (x * z + y * w);
  const m23 = 2 * (y * z - x * w);
  const m33 = 1 - 2 * (x * x + y * y);

  const eulerY = Math.asin(clamp(m13, -1, 1));
  let eulerX: number;
  let eulerZ: number;
  if (Math.abs(m13) < 0.9999999) {
    eulerX = Math.atan2(-m23, m33);
    eulerZ = Math.atan2(-m12, m11);
  } else {
    // Gimbal lock: chỉ xác định được một góc tự do.
    eulerX = Math.atan2(m23, m12);
    eulerZ = 0;
  }
  return { x: eulerX, y: eulerY, z: eulerZ };
}

export function multiplyQuaternions(a: QuatD, b: QuatD): QuatD {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

export function invertQuaternion(q: QuatD): QuatD {
  const n = normalizeQuaternion(q);
  return { x: -n.x, y: -n.y, z: -n.z, w: n.w };
}

export function slerpQuaternion(a: QuatD, b: QuatD, t: number): QuatD {
  const qa = normalizeQuaternion(a);
  const qb = normalizeQuaternion(b);
  let cos = qa.x * qb.x + qa.y * qb.y + qa.z * qb.z + qa.w * qb.w;
  let target = qb;
  if (cos < 0) {
    target = { x: -qb.x, y: -qb.y, z: -qb.z, w: -qb.w };
    cos = -cos;
  }
  if (cos > 0.9995) {
    return normalizeQuaternion({
      x: lerp(qa.x, target.x, t),
      y: lerp(qa.y, target.y, t),
      z: lerp(qa.z, target.z, t),
      w: lerp(qa.w, target.w, t),
    });
  }
  const theta = Math.acos(clamp(cos, -1, 1));
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;
  return normalizeQuaternion({
    x: qa.x * wa + target.x * wb,
    y: qa.y * wa + target.y * wb,
    z: qa.z * wa + target.z * wb,
    w: qa.w * wa + target.w * wb,
  });
}

export function nlerpQuaternion(a: QuatD, b: QuatD, t: number): QuatD {
  const qa = normalizeQuaternion(a);
  const qb = normalizeQuaternion(b);
  const cos = qa.x * qb.x + qa.y * qb.y + qa.z * qb.z + qa.w * qb.w;
  const target = cos < 0 ? { x: -qb.x, y: -qb.y, z: -qb.z, w: -qb.w } : qb;
  return normalizeQuaternion({
    x: lerp(qa.x, target.x, t),
    y: lerp(qa.y, target.y, t),
    z: lerp(qa.z, target.z, t),
    w: lerp(qa.w, target.w, t),
  });
}

/** Quaternion nhìn từ `from` về `to` (hệ Y-up, forward = +Z). */
export function lookAtQuaternion(from: Vec3D, to: Vec3D, up: Vec3D = UP3): QuatD {
  const forward = normalize(subtract(to, from));
  if (forward.x === 0 && forward.y === 0 && forward.z === 0) return { x: 0, y: 0, z: 0, w: 1 };
  const right = normalize(cross(up, forward));
  const realUp = cross(forward, right);
  // Dựng ma trận cột [right, realUp, forward] rồi chuyển sang quaternion.
  const m00 = right.x, m01 = realUp.x, m02 = forward.x;
  const m10 = right.y, m11 = realUp.y, m12 = forward.y;
  const m20 = right.z, m21 = realUp.z, m22 = forward.z;
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

/** Quaternion xoay quanh trục `axis` (đơn vị) theo góc radian. */
export function rotateAroundAxis(axis: Vec3D, angle: number): QuatD {
  const n = normalize(axis);
  const half = angle / 2;
  const s = Math.sin(half);
  return { x: n.x * s, y: n.y * s, z: n.z * s, w: Math.cos(half) };
}

/** Quaternion xoay từ vector `a` sang vector `b`. */
export function rotationBetweenVectors(a: Vec3D, b: Vec3D): QuatD {
  const from = normalize(a);
  const to = normalize(b);
  const d = dot(from, to);
  if (d > 0.999999) return { x: 0, y: 0, z: 0, w: 1 };
  if (d < -0.999999) {
    // Trục vuông góc bất kỳ.
    let axis = cross(FORWARD3, from);
    if (magnitude(axis) < 1e-6) axis = cross(RIGHT3, from);
    return rotateAroundAxis(axis, Math.PI);
  }
  const c = cross(from, to);
  const q: QuatD = { x: c.x, y: c.y, z: c.z, w: 1 + d };
  return normalizeQuaternion(q);
}

// ---------------------------------------------------------------------------
// Hình học
// ---------------------------------------------------------------------------

export function boundingBox(center: Vec3D, size: Vec3D): Box3D {
  const hx = Math.abs(size.x) / 2;
  const hy = Math.abs(size.y) / 2;
  const hz = Math.abs(size.z) / 2;
  return {
    min: { x: center.x - hx, y: center.y - hy, z: center.z - hz },
    max: { x: center.x + hx, y: center.y + hy, z: center.z + hz },
  };
}

export function boundingSphere(center: Vec3D, radius: number): Sphere3D {
  return { center: { ...center }, radius: Math.max(0, radius) };
}

/** Khoảng cách giữa hai AABB (0 nếu chồng lấn). */
export function distanceBetweenBoxes(a: Box3D, b: Box3D): number {
  const dx = Math.max(a.min.x - b.max.x, b.min.x - a.max.x, 0);
  const dy = Math.max(a.min.y - b.max.y, b.min.y - a.max.y, 0);
  const dz = Math.max(a.min.z - b.max.z, b.min.z - a.max.z, 0);
  return Math.hypot(dx, dy, dz);
}

export function boxesOverlap(a: Box3D, b: Box3D): boolean {
  return (
    a.min.x <= b.max.x &&
    a.max.x >= b.min.x &&
    a.min.y <= b.max.y &&
    a.max.y >= b.min.y &&
    a.min.z <= b.max.z &&
    a.max.z >= b.min.z
  );
}

/** Khoảng cách từ điểm tới AABB (0 nếu bên trong). */
export function distanceToBox(point: Vec3D, box: Box3D): number {
  const dx = Math.max(box.min.x - point.x, 0, point.x - box.max.x);
  const dy = Math.max(box.min.y - point.y, 0, point.y - box.max.y);
  const dz = Math.max(box.min.z - point.z, 0, point.z - box.max.z);
  return Math.hypot(dx, dy, dz);
}

/** Khoảng cách từ điểm tới mặt phẳng (normal đã chuẩn hoá). */
export function distanceToPlane(point: Vec3D, plane: Plane3D): number {
  const n = normalize(plane.normal);
  return Math.abs(dot(n, point) - plane.distance);
}

/** Khoảng cách từ điểm tới đoạn thẳng. */
export function distanceToSegment(point: Vec3D, start: Vec3D, end: Vec3D): number {
  const ab = subtract(end, start);
  const lenSq = dot(ab, ab);
  if (lenSq === 0) return distance3D(point, start);
  const t = clamp(dot(subtract(point, start), ab) / lenSq, 0, 1);
  return distance3D(point, add(start, scale(ab, t)));
}

/** Khoảng cách giữa hai đoạn thẳng. */
export function distanceBetweenSegments(a1: Vec3D, a2: Vec3D, b1: Vec3D, b2: Vec3D): number {
  const d1 = subtract(a2, a1);
  const d2 = subtract(b2, b1);
  const r = subtract(a1, b1);
  const a = dot(d1, d1);
  const e = dot(d2, d2);
  const f = dot(d2, r);

  let s = 0;
  let t = 0;

  if (a <= 1e-9 && e <= 1e-9) return distance3D(a1, b1);

  if (a <= 1e-9) {
    s = 0;
    t = clamp(f / e, 0, 1);
  } else {
    const c = dot(d1, r);
    if (e <= 1e-9) {
      t = 0;
      s = clamp(-c / a, 0, 1);
    } else {
      const b = dot(d1, d2);
      const denom = a * e - b * b;
      s = denom !== 0 ? clamp((b * f - c * e) / denom, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = clamp(-c / a, 0, 1);
      } else if (t > 1) {
        t = 1;
        s = clamp((b - c) / a, 0, 1);
      }
    }
  }

  return distance3D(add(a1, scale(d1, s)), add(b1, scale(d2, t)));
}

/** Khoảng cách giữa hai mặt cầu (khoảng hở giữa bề mặt). */
export function distanceBetweenSpheres(a: Sphere3D, b: Sphere3D): number {
  return Math.max(0, distance3D(a.center, b.center) - a.radius - b.radius);
}

/** Khoảng cách giữa hai capsule. */
export function distanceBetweenCapsules(
  a: { start: Vec3D; end: Vec3D; radius: number },
  b: { start: Vec3D; end: Vec3D; radius: number },
): number {
  return Math.max(0, distanceBetweenSegments(a.start, a.end, b.start, b.end) - a.radius - b.radius);
}

/** Khoảng cách giữa hai tia. */
export function distanceBetweenRays(a: Ray3D, b: Ray3D): number {
  const da = normalize(a.direction);
  const db = normalize(b.direction);
  const diff = subtract(a.origin, b.origin);
  const cos = clamp(dot(da, db), -1, 1);
  // Hai tia song song.
  if (Math.abs(1 - cos) < 1e-6) {
    const n = normalize(cross(da, UP3));
    return n.x !== 0 || n.y !== 0 || n.z !== 0 ? Math.abs(dot(diff, n)) : distance3D(a.origin, b.origin);
  }
  // Khoảng cách giữa hai đường thẳng, rồi kiểm tra tham số có âm không.
  const n = cross(da, db);
  const dist = Math.abs(dot(diff, n)) / magnitude(n);
  const closestA = add(a.origin, scale(da, dot(subtract(b.origin, a.origin), da)));
  const closestB = add(b.origin, scale(db, dot(subtract(a.origin, b.origin), db)));
  const tA = dot(subtract(closestA, a.origin), da);
  const tB = dot(subtract(closestB, b.origin), db);
  if (tA >= 0 && tB >= 0) return dist;
  // Giao nhau ở phía trước cả hai tia → khoảng cách thực tế bằng 0 hoặc theo đầu tia.
  if (tA < 0 && tB < 0) return distance3D(a.origin, b.origin);
  return Math.min(Math.abs(tA), Math.abs(tB)) === 0 ? dist : dist;
}

/** Giao điểm tia với mặt phẳng (null nếu song song). */
export function rayPlaneIntersection(ray: Ray3D, plane: Plane3D): Vec3D | null {
  const n = normalize(plane.normal);
  const d = normalize(ray.direction);
  const denom = dot(n, d);
  if (Math.abs(denom) < 1e-9) return null;
  const t = (plane.distance - dot(n, ray.origin)) / denom;
  if (t < 0) return null;
  return add(ray.origin, scale(d, t));
}

/** Giao điểm tia với AABB (null nếu trượt). */
export function rayBoxIntersection(ray: Ray3D, box: Box3D): Vec3D | null {
  const d = normalize(ray.direction);
  let tmin = -Infinity;
  let tmax = Infinity;
  const axes: Array<keyof Vec3D> = ['x', 'y', 'z'];
  for (const axis of axes) {
    const o = ray.origin[axis];
    const dd = d[axis];
    const lo = box.min[axis];
    const hi = box.max[axis];
    if (Math.abs(dd) < 1e-9) {
      if (o < lo || o > hi) return null;
      continue;
    }
    const inv = 1 / dd;
    let t1 = (lo - o) * inv;
    let t2 = (hi - o) * inv;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  if (tmax < 0) return null;
  return add(ray.origin, scale(d, tmin >= 0 ? tmin : tmax));
}

/** Nội suy đường cong Bézier bậc 3. */
export function bezierPoint(p0: Vec3D, p1: Vec3D, p2: Vec3D, p3: Vec3D, t: number): Vec3D {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return {
    x: p0.x * w0 + p1.x * w1 + p2.x * w2 + p3.x * w3,
    y: p0.y * w0 + p1.y * w1 + p2.y * w2 + p3.y * w3,
    z: p0.z * w0 + p1.z * w1 + p2.z * w2 + p3.z * w3,
  };
}

/** Nội suy Catmull-Rom. */
export function catmullRomPoint(
  p0: Vec3D,
  p1: Vec3D,
  p2: Vec3D,
  p3: Vec3D,
  t: number,
): Vec3D {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    z:
      0.5 *
      (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  };
}

/** Nội suy tuyến tính theo danh sách điểm (dùng cho path). */
export function pointAlongPath(points: Vec3D[], t: number): Vec3D {
  if (points.length === 0) return { x: 0, y: 0, z: 0 };
  if (points.length === 1) return { ...points[0] };
  const clamped = clamp01(t);
  const scaled = clamped * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  return lerpVec3(points[index], points[index + 1], scaled - index);
}

/** Độ dài toàn bộ polyline. */
export function pathLength(points: Vec3D[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance3D(points[i - 1], points[i]);
  return total;
}

/** Chiếu vector `v` lên trục `axis`. */
export function projectVector(v: Vec3D, axis: Vec3D): Vec3D {
  const n = normalize(axis);
  return scale(n, dot(v, n));
}

/** Phần vector còn lại sau khi chiếu lên trục. */
export function rejectVector(v: Vec3D, axis: Vec3D): Vec3D {
  return subtract(v, projectVector(v, axis));
}

/** Phản chiếu vector qua mặt phẳng có normal. */
export function reflectVector(v: Vec3D, normal: Vec3D): Vec3D {
  const n = normalize(normal);
  return subtract(v, scale(n, 2 * dot(v, n)));
}

/** Khúc xạ vector qua mặt phẳng (Schlick). */
export function refractVector(v: Vec3D, normal: Vec3D, eta: number): Vec3D {
  const n = normalize(normal);
  const cosi = -dot(v, n);
  const k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return { x: 0, y: 0, z: 0 };
  return subtract(scale(v, eta), scale(n, eta * cosi + Math.sqrt(k)));
}

// ---------------------------------------------------------------------------
// Ma trận 4x4 (mảng 16 phần tử, thứ tự cột — giống three.js)
// ---------------------------------------------------------------------------

export function multiplyMatrices(a: number[], b: number[]): number[] {
  const out = new Array<number>(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

export function transformPoint(matrix: number[], point: Vec3D): Vec3D {
  const x = matrix[0] * point.x + matrix[4] * point.y + matrix[8] * point.z + matrix[12];
  const y = matrix[1] * point.x + matrix[5] * point.y + matrix[9] * point.z + matrix[13];
  const z = matrix[2] * point.x + matrix[6] * point.y + matrix[10] * point.z + matrix[14];
  const w = matrix[3] * point.x + matrix[7] * point.y + matrix[11] * point.z + matrix[15];
  if (w !== 0 && w !== 1) return { x: x / w, y: y / w, z: z / w };
  return { x, y, z };
}

export function invertMatrix(m: number[]): number[] {
  const out = new Array<number>(16).fill(0);
  const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
  const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
  const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
  const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (det === 0) return [...IDENTITY_MAT4];
  det = 1 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}

/** Ma trận phối cảnh WebGL (góc nhìn dọc fov, aspect, near, far). */
export function perspectiveMatrix(fovDegrees: number, aspect: number, near: number, far: number): number[] {
  const f = 1 / Math.tan(radians(fovDegrees) / 2);
  const nf = 1 / (near - far);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ];
}

/** Ma trận view từ vị trí mắt nhìn mục tiêu. */
export function lookAtMatrix(eye: Vec3D, target: Vec3D, up: Vec3D = UP3): number[] {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return [
    x.x, y.x, z.x, 0,
    x.y, y.y, z.y, 0,
    x.z, y.z, z.z, 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ];
}

/** Ma trận tịnh tiến. */
export function translationMatrix(t: Vec3D): number[] {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t.x, t.y, t.z, 1];
}

/** Ma trận tỉ lệ. */
export function scaleMatrix(s: Vec3D): number[] {
  return [s.x, 0, 0, 0, 0, s.y, 0, 0, 0, 0, s.z, 0, 0, 0, 0, 1];
}

// ---------------------------------------------------------------------------
// Tiện ích chung cho subsystem
// ---------------------------------------------------------------------------

/** Cộng offset lên vị trí entity — dùng chung cho mọi hàm "getXxxPosition". */
export function offsetPosition(entity: unknown, offset?: Vec3D): Vec3D {
  const base = entityPosition(entity);
  return {
    x: base.x + (offset?.x ?? 0),
    y: base.y + (offset?.y ?? 0),
    z: base.z + (offset?.z ?? 0),
  };
}

/** Tạo bản ghi chuẩn hoá cho các hàm "trả về kết quả có tên". */
export function namedResult(
  name: string,
  result: unknown,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    timestamp: Date.now(),
    result,
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho các hàm trả về phép đo (scalar). */
export function measurement(
  name: string,
  value: number,
  unit?: string,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: Number.isFinite(value),
    value,
    unit: unit ?? 'unit',
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho vector hướng. */
export function directionResult(
  name: string,
  direction: Vec3D,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: direction.x !== 0 || direction.y !== 0 || direction.z !== 0,
    direction,
    magnitude: magnitude(direction),
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho quaternion. */
export function orientationResult(
  name: string,
  orientation: QuatD,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    orientation,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho hộp bao. */
export function boundsResult(
  name: string,
  bounds: Box3D,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    min: bounds.min,
    max: bounds.max,
    center: { x: (bounds.min.x + bounds.max.x) / 2, y: (bounds.min.y + bounds.max.y) / 2, z: (bounds.min.z + bounds.max.z) / 2 },
    size: {
      x: bounds.max.x - bounds.min.x,
      y: bounds.max.y - bounds.min.y,
      z: bounds.max.z - bounds.min.z,
    },
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho va chạm. */
export function collisionResult(
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

/** Bản ghi chuẩn hoá cho kết quả hộp / va chạm từ AABB. */
export function aabbResult(name: string, a: Box3D, b: Box3D): Record<string, unknown> {
  const hit = boxesOverlap(a, b);
  const distance = distanceBetweenBoxes(a, b);
  return collisionResult(
    name,
    hit,
    distance,
    {
      x: (Math.max(a.min.x, b.min.x) + Math.min(a.max.x, b.max.x)) / 2,
      y: (Math.max(a.min.y, b.min.y) + Math.min(a.max.y, b.max.y)) / 2,
      z: (Math.max(a.min.z, b.min.z) + Math.min(a.max.z, b.max.z)) / 2,
    },
    { x: 0, y: 1, z: 0 },
    hit ? distance : 0,
  );
}

// ---------------------------------------------------------------------------
// Builder cho UI, camera, LOD
// ---------------------------------------------------------------------------

/** Bản ghi chuẩn hoá cho một neo giao diện trong không gian (UI anchor). */
export function uiAnchorResult(
  name: string,
  anchor: {
    worldPosition?: Vec3D;
    uiPosition?: Vec2D;
    visible?: boolean;
    scale?: number;
    depthOrder?: number;
    rotation?: QuatD;
    billboard?: boolean;
    screenOffset?: Vec2D;
  } = {},
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    worldPosition: anchor.worldPosition ?? { x: 0, y: 0, z: 0 },
    uiPosition: anchor.uiPosition ?? { x: 0, y: 0 },
    screenOffset: anchor.screenOffset ?? { x: 0, y: 0 },
    visible: anchor.visible ?? true,
    scale: anchor.scale ?? 1,
    depthOrder: anchor.depthOrder ?? 0,
    rotation: anchor.rotation ?? { x: 0, y: 0, z: 0, w: 1 },
    billboard: anchor.billboard ?? true,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho một tia. */
export function rayResult(
  name: string,
  origin: Vec3D,
  direction: Vec3D,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  const dir = normalize(direction);
  return {
    name,
    valid: true,
    origin: { ...origin },
    direction: dir,
    length: magnitude(direction),
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho một mặt phẳng. */
export function planeResult(
  name: string,
  normal: Vec3D,
  distance: number,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    normal: normalize(normal),
    distance,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho một mức LOD. */
export function lodResult(
  name: string,
  lodLevel: number,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  const level = Math.max(0, Math.round(lodLevel));
  return {
    name,
    valid: true,
    lodLevel: level,
    visible: true,
    culled: false,
    screenSize: Math.max(0.01, 0.5 / (level + 1)),
    error: 0.01 * (level + 1),
    priority: 1 / (level + 1),
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho ma trận 4x4. */
export function matrixResult(
  name: string,
  matrix: number[],
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    matrix,
    determinant: determinant4x4(matrix),
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Định thức ma trận 4x4. */
export function determinant4x4(m: number[]): number {
  if (!Array.isArray(m) || m.length < 16) return 0;
  const [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33] = m;
  return (
    m03 * m12 * m21 * m30 -
    m02 * m13 * m21 * m30 -
    m03 * m11 * m22 * m30 +
    m01 * m13 * m22 * m30 +
    m02 * m11 * m23 * m30 -
    m01 * m12 * m23 * m30 -
    m03 * m12 * m20 * m31 +
    m02 * m13 * m20 * m31 +
    m03 * m10 * m22 * m31 -
    m00 * m13 * m22 * m31 -
    m02 * m10 * m23 * m31 +
    m00 * m12 * m23 * m31 +
    m03 * m11 * m20 * m32 -
    m01 * m13 * m20 * m32 -
    m03 * m10 * m21 * m32 +
    m00 * m13 * m21 * m32 +
    m01 * m10 * m23 * m32 -
    m00 * m11 * m23 * m32 -
    m02 * m11 * m20 * m33 +
    m01 * m12 * m20 * m33 +
    m02 * m10 * m21 * m33 -
    m00 * m12 * m21 * m33 -
    m01 * m10 * m22 * m33 +
    m00 * m11 * m22 * m33
  );
}

/** Ma trận 4x4 từ quaternion (thứ tự cột, giống three.js). */
export function quaternionMatrix(q: QuatD): number[] {
  const n = normalizeQuaternion(q);
  const { x, y, z, w } = n;
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  return [
    1 - (yy + zz), xy - wz, xz + wy, 0,
    xy + wz, 1 - (xx + zz), yz - wx, 0,
    xz - wy, yz + wx, 1 - (xx + yy), 0,
    0, 0, 0, 1,
  ];
}

/** Ma trận 4x4 từ góc Euler (rad) theo trục. */
export function eulerMatrix(axis: 'x' | 'y' | 'z', angle: number): number[] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  if (axis === 'x') {
    return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1];
  }
  if (axis === 'y') {
    return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
  }
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
