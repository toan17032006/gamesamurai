/**
 * @file physics-semantics.ts
 * @module @aetheria/engine/spatial-ui/semantics/physics-semantics
 * @description Ngữ nghĩa vật lý — va chạm, tia, tích phân, đạn, vật phẩm, hạt, hiệu ứng.
 *
 * Trước đây 100 method của `PhysicsCollisionProjectileSubsystem` trả về
 * `{ hit: true, collision: true, overlap: true, ... }` giống nhau cho mọi
 * cặp hình, và mọi vector lực đều bằng `{x:0,y:0,z:0}`. Ở đây mỗi phép tính
 * được thực sự thực hiện trên hình học thật.
 *
 * Quy ước: hệ Y-up, trọng lực -9.81 m/s², khối lượng mặc định 1 kg.
 */

import type { Vec3D, QuatD, Box3D, Sphere3D, Capsule3D, Cylinder3D, Ray3D, Plane3D, Triangle3D } from '../types.js';
import {
  add,
  subtract,
  scale,
  normalize,
  dot,
  cross,
  magnitude,
  distance3D,
  clamp,
  clamp01,
  lerp,
  num,
  toVec3,
  boundingBox,
  boundingSphere,
  boxesOverlap,
  distanceBetweenBoxes,
  distanceToBox,
  distanceToSegment,
  distanceBetweenSegments,
  distanceBetweenSpheres,
  distanceBetweenCapsules,
  rayPlaneIntersection,
  rayBoxIntersection,
  namedResult,
  collisionResult,
  aabbResult,
  boundsResult,
  UP3,
  FORWARD3,
} from '../spatial-primitives.js';

/** Gia trọng chuẩn của engine (m/s²). */
export const GRAVITY: Vec3D = Object.freeze({ x: 0, y: -9.81, z: 0 });
/** Khối lượng mặc định (kg). */
export const DEFAULT_MASS = 1;
/** Hằng số hấp dẫn phục vụ phép tính quỹ đạo (m/s²). */
export const GRAVITY_MAGNITUDE = 9.81;

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

/** Đọc mảng từ object theo danh sách khoá. */
export function readArray(source: unknown, keys: string[]): unknown[] {
  if (!source || typeof source !== 'object') return [];
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (Array.isArray(raw)) return raw;
  }
  return [];
}

/** Đọc quat từ object theo danh sách khoá. */
export function readQuat(source: unknown, keys: string[]): QuatD {
  if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0, w: 1 };
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (raw && typeof raw === 'object') {
      const q = raw as Record<string, unknown>;
      return { x: num(q.x), y: num(q.y), z: num(q.z), w: num(q.w, 1) };
    }
  }
  return { x: 0, y: 0, z: 0, w: 1 };
}

// ---------------------------------------------------------------------------
// Đọc hình học từ dữ liệu tùy ý
// ---------------------------------------------------------------------------

/** Đọc AABB từ dữ liệu bất kỳ (entity có position/size, hoặc {min,max}). */
export function resolveBox(value: unknown, fallbackSize = 1): Box3D {
  if (!value || typeof value !== 'object') {
    return boundingBox({ x: 0, y: 0, z: 0 }, { x: fallbackSize, y: fallbackSize, z: fallbackSize });
  }
  const o = value as Record<string, unknown>;
  if (o.min && o.max && typeof o.min === 'object' && typeof o.max === 'object') {
    const min = toVec3(o.min);
    const max = toVec3(o.max);
    return {
      min: { x: Math.min(min.x, max.x), y: Math.min(min.y, max.y), z: Math.min(min.z, max.z) },
      max: { x: Math.max(min.x, max.x), y: Math.max(min.y, max.y), z: Math.max(min.z, max.z) },
    };
  }
  const center = o.position && typeof o.position === 'object'
    ? toVec3(o.position)
    : (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') ? toVec3(o) : { x: 0, y: 0, z: 0 };
  const size = o.size && typeof o.size === 'object' ? toVec3(o.size) : { x: fallbackSize, y: fallbackSize, z: fallbackSize };
  return boundingBox(center, size);
}

/** Đọc hình cầu từ dữ liệu bất kỳ. */
export function resolveSphere(value: unknown, fallbackRadius = 0.5): Sphere3D {
  if (!value || typeof value !== 'object') return boundingSphere({ x: 0, y: 0, z: 0 }, fallbackRadius);
  const o = value as Record<string, unknown>;
  const center = o.center && typeof o.center === 'object'
    ? toVec3(o.center)
    : o.position && typeof o.position === 'object'
      ? toVec3(o.position)
      : (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') ? toVec3(o) : { x: 0, y: 0, z: 0 };
  return boundingSphere(center, readNum(value, ['radius', 'r'], fallbackRadius));
}

/** Đọc capsule từ dữ liệu bất kỳ. */
export function resolveCapsule(value: unknown, fallbackRadius = 0.5, fallbackHeight = 2): Capsule3D {
  if (!value || typeof value !== 'object') {
    return { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: fallbackHeight, z: 0 }, radius: fallbackRadius };
  }
  const o = value as Record<string, unknown>;
  const radius = readNum(value, ['radius', 'r'], fallbackRadius);
  if (o.start && o.end) {
    return { start: toVec3(o.start), end: toVec3(o.end), radius };
  }
  const center = o.center && typeof o.center === 'object'
    ? toVec3(o.center)
    : o.position && typeof o.position === 'object' ? toVec3(o.position) : { x: 0, y: 0, z: 0 };
  const height = readNum(value, ['height', 'h'], fallbackHeight);
  return {
    start: { x: center.x, y: center.y - height / 2, z: center.z },
    end: { x: center.x, y: center.y + height / 2, z: center.z },
    radius,
  };
}

/** Đọc hình trụ từ dữ liệu bất kỳ. */
export function resolveCylinder(value: unknown, fallbackRadius = 0.5, fallbackHeight = 2): Cylinder3D {
  const o = (value ?? {}) as Record<string, unknown>;
  const center = o.center && typeof o.center === 'object'
    ? toVec3(o.center)
    : o.position && typeof o.position === 'object' ? toVec3(o.position) : { x: 0, y: 0, z: 0 };
  return {
    center,
    height: readNum(value, ['height', 'h'], fallbackHeight),
    radius: readNum(value, ['radius', 'r'], fallbackRadius),
  };
}

/** Đọc mặt phẳng từ dữ liệu bất kỳ. */
export function resolvePlane(value: unknown, fallbackNormal: Vec3D = UP3, fallbackDistance = 0): Plane3D {
  if (!value || typeof value !== 'object') return { normal: { ...fallbackNormal }, distance: fallbackDistance };
  const o = value as Record<string, unknown>;
  const normal = o.normal && typeof o.normal === 'object' ? toVec3(o.normal) : { ...fallbackNormal };
  return { normal, distance: readNum(value, ['distance', 'd'], fallbackDistance) };
}

/** Đọc tam giác từ dữ liệu bất kỳ. */
export function resolveTriangle(value: unknown): Triangle3D {
  const o = (value ?? {}) as Record<string, unknown>;
  const a = o.a && typeof o.a === 'object' ? toVec3(o.a) : readVec(o, ['a', 'v0', 'vertex0']);
  const b = o.b && typeof o.b === 'object' ? toVec3(o.b) : readVec(o, ['b', 'v1', 'vertex1']);
  const c = o.c && typeof o.c === 'object' ? toVec3(o.c) : readVec(o, ['c', 'v2', 'vertex2']);
  return { a, b, c };
}

/** Đọc tia từ dữ liệu bất kỳ. */
export function resolveRay(value: unknown): Ray3D {
  const o = (value ?? {}) as Record<string, unknown>;
  return {
    origin: o.origin && typeof o.origin === 'object' ? toVec3(o.origin) : readVec(o, ['origin', 'start']),
    direction: o.direction && typeof o.direction === 'object' ? toVec3(o.direction) : readVec(o, ['direction', 'dir']),
  };
}

/** Đọc danh sách điểm (mesh vertices) từ dữ liệu bất kỳ. */
export function resolvePoints(value: unknown): Vec3D[] {
  const raw = readArray(value, ['points', 'vertices', 'positions', 'mesh']);
  if (raw.length === 0 && value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (o.geometry && typeof o.geometry === 'object') {
      const geometry = o.geometry as Record<string, unknown>;
      const position = geometry.position;
      if (position && typeof position === 'object') {
        const attr = position as Record<string, unknown>;
        const array = attr.array;
        const itemSize = readNum(attr, ['itemSize'], 3);
        if (Array.isArray(array)) {
          const points: Vec3D[] = [];
          for (let i = 0; i + 2 < array.length; i += itemSize) {
            points.push({ x: num(array[i]), y: num(array[i + 1]), z: num(array[i + 2]) });
          }
          return points;
        }
      }
    }
  }
  return raw.map((p) => toVec3(p));
}

// ---------------------------------------------------------------------------
// Va chạm hình học
// ---------------------------------------------------------------------------

/** Va chạm hai hộp có hướng (OBB) — dùng SAT trên 3 trục. */
export function obbOverlap(a: Box3D, b: Box3D, qa: QuatD, qb: QuatD): Record<string, unknown> {
  const axes = [
    quatAxis(qa, 0), quatAxis(qa, 1), quatAxis(qa, 2),
    quatAxis(qb, 0), quatAxis(qb, 1), quatAxis(qb, 2),
  ];
  const crossAxes = [
    cross(quatAxis(qa, 0), quatAxis(qb, 0)),
    cross(quatAxis(qa, 0), quatAxis(qb, 1)),
    cross(quatAxis(qa, 0), quatAxis(qb, 2)),
    cross(quatAxis(qa, 1), quatAxis(qb, 0)),
    cross(quatAxis(qa, 1), quatAxis(qb, 1)),
    cross(quatAxis(qa, 1), quatAxis(qb, 2)),
    cross(quatAxis(qa, 2), quatAxis(qb, 0)),
    cross(quatAxis(qa, 2), quatAxis(qb, 1)),
    cross(quatAxis(qa, 2), quatAxis(qb, 2)),
  ];
  const centerA = boxCenter(a);
  const centerB = boxCenter(b);
  const halfA = boxHalf(a);
  const halfB = boxHalf(b);
  const t = subtract(centerB, centerA);
  let minPenetration = Infinity;
  let hit = true;
  let axis: Vec3D = { x: 0, y: 1, z: 0 };

  for (const candidate of [...axes, ...crossAxes]) {
    if (magnitude(candidate) < 1e-6) continue;
    const axisN = normalize(candidate);
    const projA = projectRadius(halfA, axisN, [quatAxis(qa, 0), quatAxis(qa, 1), quatAxis(qa, 2)]);
    const projB = projectRadius(halfB, axisN, [quatAxis(qb, 0), quatAxis(qb, 1), quatAxis(qb, 2)]);
    const distance = Math.abs(dot(t, axisN));
    const overlap = projA + projB - distance;
    if (overlap <= 0) {
      hit = false;
      break;
    }
    if (overlap < minPenetration) {
      minPenetration = overlap;
      axis = dot(t, axisN) < 0 ? scale(axisN, -1) : axisN;
    }
  }

  const point = add(centerA, scale(axis, halfA.x));
  return collisionResult('obbOverlap', hit, hit ? minPenetration : distanceBetweenBoxes(a, b), point, axis, hit ? minPenetration : 0);
}

/** Trục cục bộ của quaternion (0=X, 1=Y, 2=Z). */
export function quatAxis(q: QuatD, index: 0 | 1 | 2): Vec3D {
  const { x, y, z, w } = q;
  const matrix = [
    1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
    2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
    2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y),
  ];
  return normalize({ x: matrix[index * 3], y: matrix[index * 3 + 1], z: matrix[index * 3 + 2] });
}

/** Tâm AABB. */
export function boxCenter(box: Box3D): Vec3D {
  return {
    x: (box.min.x + box.max.x) / 2,
    y: (box.min.y + box.max.y) / 2,
    z: (box.min.z + box.max.z) / 2,
  };
}

/** Nửa kích thước AABB. */
export function boxHalf(box: Box3D): Vec3D {
  return {
    x: Math.abs(box.max.x - box.min.x) / 2,
    y: Math.abs(box.max.y - box.min.y) / 2,
    z: Math.abs(box.max.z - box.min.z) / 2,
  };
}

/** Bán kính chiếu của hộp lên trục. */
function projectRadius(half: Vec3D, axis: Vec3D, localAxes: Vec3D[]): number {
  return Math.abs(dot(half.x === 0 ? { x: 1, y: 0, z: 0 } : localAxes[0], axis)) * half.x
    + Math.abs(dot(localAxes[1], axis)) * half.y
    + Math.abs(dot(localAxes[2], axis)) * half.z;
}

/** Giao điểm tia với hình cầu. */
export function raySphereIntersection(ray: Ray3D, sphere: Sphere3D): { hit: boolean; point: Vec3D; distance: number } {
  const oc = subtract(ray.origin, sphere.center);
  const d = normalize(ray.direction);
  const a = dot(d, d);
  const b = 2 * dot(oc, d);
  const c = dot(oc, oc) - sphere.radius * sphere.radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return { hit: false, point: { ...ray.origin }, distance: Infinity };
  const sq = Math.sqrt(disc);
  let t = (-b - sq) / (2 * a);
  if (t < 0) t = (-b + sq) / (2 * a);
  if (t < 0) return { hit: false, point: { ...ray.origin }, distance: Infinity };
  return { hit: true, point: add(ray.origin, scale(d, t)), distance: t };
}

/** Giao điểm tia với capsule (đoạn thẳng + bán kính). */
export function rayCapsuleIntersection(ray: Ray3D, capsule: Capsule3D): { hit: boolean; point: Vec3D; distance: number } {
  const axis = subtract(capsule.end, capsule.start);
  const lenSq = dot(axis, axis);
  const d = normalize(ray.direction);
  let best = Infinity;
  let bestPoint = { ...ray.origin };

  // Thân trụ.
  if (lenSq > 1e-9) {
    const aoa = subtract(ray.origin, capsule.start);
    const b = dot(axis, d);
    const c = dot(axis, aoa);
    const denom = lenSq - b * b;
    if (Math.abs(denom) > 1e-9) {
      const t = (c - b * dot(aoa, d)) / denom;
      const s = (c - b * t) / lenSq;
      if (t >= 0 && s >= 0 && s <= 1 && t < best) {
        best = t;
        bestPoint = add(ray.origin, scale(d, t));
      }
    }
  }
  // Hai đầu cầu.
  for (const cap of [capsule.start, capsule.end]) {
    const sphere: Sphere3D = { center: cap, radius: capsule.radius };
    const res = raySphereIntersection(ray, sphere);
    if (res.hit && res.distance < best) {
      best = res.distance;
      bestPoint = res.point;
    }
  }
  if (best === Infinity) return { hit: false, point: { ...ray.origin }, distance: Infinity };
  return { hit: true, point: bestPoint, distance: best };
}

/** Giao điểm tia với tam giác (thuật toán Möller–Trumbore). */
export function rayTriangleIntersection(ray: Ray3D, tri: Triangle3D): { hit: boolean; point: Vec3D; distance: number; barycentric: Vec3D } {
  const edge1 = subtract(tri.b, tri.a);
  const edge2 = subtract(tri.c, tri.a);
  const h = cross(ray.direction, edge2);
  const a = dot(edge1, h);
  if (Math.abs(a) < 1e-9) {
    return { hit: false, point: { ...ray.origin }, distance: Infinity, barycentric: { x: 0, y: 0, z: 0 } };
  }
  const f = 1 / a;
  const s = subtract(ray.origin, tri.a);
  const u = f * dot(s, h);
  if (u < -1e-6 || u > 1 + 1e-6) {
    return { hit: false, point: { ...ray.origin }, distance: Infinity, barycentric: { x: 0, y: 0, z: 0 } };
  }
  const q = cross(s, edge1);
  const v = f * dot(ray.direction, q);
  if (v < -1e-6 || u + v > 1 + 1e-6) {
    return { hit: false, point: { ...ray.origin }, distance: Infinity, barycentric: { x: 0, y: 0, z: 0 } };
  }
  const t = f * dot(edge2, q);
  if (t < 0) {
    return { hit: false, point: { ...ray.origin }, distance: Infinity, barycentric: { x: 0, y: 0, z: 0 } };
  }
  return {
    hit: true,
    point: add(ray.origin, scale(ray.direction, t)),
    distance: t,
    barycentric: { x: 1 - u - v, y: u, z: v },
  };
}

/** Điểm gần nhất trên tam giác. */
export function closestPointOnTriangle(point: Vec3D, tri: Triangle3D): Vec3D {
  const ab = subtract(tri.b, tri.a);
  const ac = subtract(tri.c, tri.a);
  const ap = subtract(point, tri.a);
  const d1 = dot(ab, ap);
  const d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return { ...tri.a };

  const bp = subtract(point, tri.b);
  const d3 = dot(ab, bp);
  const d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return { ...tri.b };

  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return add(tri.a, scale(ab, v));
  }

  const cp = subtract(point, tri.c);
  const d5 = dot(ab, cp);
  const d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return { ...tri.c };

  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return add(tri.a, scale(ac, w));
  }

  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    return add(tri.b, scale(subtract(tri.c, tri.b), w));
  }

  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  return add(tri.a, add(scale(ab, v), scale(ac, w)));
}

/** Điểm gần nhất trên đoạn thẳng. */
export function closestPointOnSegment(point: Vec3D, start: Vec3D, end: Vec3D): Vec3D {
  const ab = subtract(end, start);
  const lenSq = dot(ab, ab);
  if (lenSq < 1e-12) return { ...start };
  const t = clamp(dot(subtract(point, start), ab) / lenSq, 0, 1);
  return add(start, scale(ab, t));
}

/** Điểm gần nhất trên mặt phẳng. */
export function closestPointOnPlane(point: Vec3D, plane: Plane3D): Vec3D {
  const n = normalize(plane.normal);
  const distance = dot(n, point) - plane.distance;
  return subtract(point, scale(n, distance));
}

/** Điểm gần nhất trên bề mặt hình cầu. */
export function closestPointOnSphere(point: Vec3D, sphere: Sphere3D): Vec3D {
  const dir = subtract(point, sphere.center);
  const len = magnitude(dir);
  if (len < 1e-9) return add(sphere.center, { x: 0, y: sphere.radius, z: 0 });
  return add(sphere.center, scale(dir, sphere.radius / len));
}

/** Điểm gần nhất trên bề mặt AABB. */
export function closestPointOnBox(point: Vec3D, box: Box3D): Vec3D {
  return {
    x: clamp(point.x, box.min.x, box.max.x),
    y: clamp(point.y, box.min.y, box.max.y),
    z: clamp(point.z, box.min.z, box.max.z),
  };
}

/** Điểm gần nhất trên bề mặt capsule. */
export function closestPointOnCapsule(point: Vec3D, capsule: Capsule3D): Vec3D {
  const axis = closestPointOnSegment(point, capsule.start, capsule.end);
  const dir = subtract(point, axis);
  const len = magnitude(dir);
  if (len < 1e-9) return { ...axis };
  return add(axis, scale(dir, capsule.radius / len));
}

/** Giao hai tam giác (kiểm tra cạnh cắt nhau + nằm trong mặt phẳng). */
export function triangleTriangleIntersection(a: Triangle3D, b: Triangle3D): boolean {
  const normalA = normalize(cross(subtract(a.b, a.a), subtract(a.c, a.a)));
  const normalB = normalize(cross(subtract(b.b, b.a), subtract(b.c, b.a)));
  if (Math.abs(dot(normalA, normalB)) > 0.9999) return false;

  const verticesA = [a.a, a.b, a.c];
  const verticesB = [b.a, b.b, b.c];
  for (const vertex of verticesA) {
    if (magnitude(subtract(closestPointOnPlane(vertex, { normal: normalB, distance: dot(normalB, b.a) }), vertex)) < 1e-6) return true;
  }
  for (const vertex of verticesB) {
    if (magnitude(subtract(closestPointOnPlane(vertex, { normal: normalA, distance: dot(normalA, a.a) }), vertex)) < 1e-6) return true;
  }
  // Kiểm tra cạnh cắt cạnh.
  const edgesA: Array<[Vec3D, Vec3D]> = [[a.a, a.b], [a.b, a.c], [a.c, a.a]];
  const edgesB: Array<[Vec3D, Vec3D]> = [[b.a, b.b], [b.b, b.c], [b.c, b.a]];
  for (const [p1, p2] of edgesA) {
    for (const [q1, q2] of edgesB) {
      if (segmentsIntersect(p1, p2, q1, q2)) return true;
    }
  }
  return false;
}

/** Hai đoạn thẳng có cắt nhau không. */
export function segmentsIntersect(p1: Vec3D, p2: Vec3D, q1: Vec3D, q2: Vec3D): boolean {
  const d1 = cross(subtract(p2, p1), subtract(q1, p1));
  const d2 = cross(subtract(p2, p1), subtract(q2, p1));
  const d3 = cross(subtract(q2, q1), subtract(p1, q1));
  const d4 = cross(subtract(q2, q1), subtract(p2, q1));
  return dot(d1, d2) < 0 && dot(d3, d4) < 0;
}

/** Khoảng cách bề mặt giữa hai lưới tam giác. */
export function meshSurfaceDistance(pointsA: Vec3D[], pointsB: Vec3D[]): number {
  let min = Infinity;
  for (const p of pointsA) {
    for (const q of pointsB) {
      min = Math.min(min, distance3D(p, q));
    }
  }
  return Number.isFinite(min) ? min : 0;
}

/** Bán kính hình cầu bao quanh một lưới điểm. */
export function meshBoundingRadius(points: Vec3D[]): number {
  if (points.length === 0) return 0;
  const center = points.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 });
  const centroid = scale(center, 1 / points.length);
  return Math.max(...points.map((p) => distance3D(p, centroid)));
}

// ---------------------------------------------------------------------------
// Động lực học
// ---------------------------------------------------------------------------

/** Vận tốc của thân cứng từ vị trí hiện tại / trước đó. */
export function rigidBodyVelocity(entity: unknown, dt: number): Vec3D {
  const velocity = readVec(entity, ['velocity', 'linearVelocity']);
  if (magnitude(velocity) > 0) return velocity;
  const position = readVec(entity, ['position', 'currentPosition']);
  const previous = readVec(entity, ['previousPosition', 'lastPosition']);
  const step = Math.max(1e-6, dt);
  return scale(subtract(position, previous), 1 / step);
}

/** Gia tốc của thân cứng. */
export function rigidBodyAcceleration(entity: unknown, dt: number): Vec3D {
  const explicit = readVec(entity, ['acceleration', 'linearAcceleration']);
  if (magnitude(explicit) > 0) return explicit;
  const velocity = readVec(entity, ['velocity', 'linearVelocity']);
  const previous = readVec(entity, ['previousVelocity', 'lastVelocity']);
  const step = Math.max(1e-6, dt);
  return scale(subtract(velocity, previous), 1 / step);
}

/** Vận tốc góc. */
export function angularVelocity(entity: unknown, dt: number): Vec3D {
  const explicit = readVec(entity, ['angularVelocity', 'rotationVelocity']);
  if (magnitude(explicit) > 0) return explicit;
  const quaternion = readQuat(entity, ['quaternion', 'rotation']);
  const previous = readQuat(entity, ['previousQuaternion', 'lastRotation']);
  const delta = multiplyQuat(quaternion, inverseQuat(previous));
  const angle = 2 * Math.acos(clamp(delta.w, -1, 1));
  if (angle < 1e-9) return { x: 0, y: 0, z: 0 };
  const sinHalf = Math.sqrt(Math.max(0, 1 - delta.w * delta.w));
  const step = Math.max(1e-6, dt);
  const axis = { x: delta.x / sinHalf, y: delta.y / sinHalf, z: delta.z / sinHalf };
  return scale(axis, angle / step);
}

/** Gia tốc góc. */
export function angularAcceleration(entity: unknown, dt: number): Vec3D {
  const explicit = readVec(entity, ['angularAcceleration']);
  if (magnitude(explicit) > 0) return explicit;
  const current = angularVelocity(entity, dt);
  const previous = readVec(entity, ['previousAngularVelocity']);
  if (magnitude(previous) === 0) return { x: 0, y: 0, z: 0 };
  const step = Math.max(1e-6, dt);
  return scale(subtract(current, previous), 1 / step);
}

/** Nhân quaternion. */
export function multiplyQuat(a: QuatD, b: QuatD): QuatD {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

/** Nghịch đảo quaternion. */
export function inverseQuat(q: QuatD): QuatD {
  const len = Math.hypot(q.x, q.y, q.z, q.w) || 1;
  return { x: -q.x / len, y: -q.y / len, z: -q.z / len, w: q.w / len };
}

/** Động lượng tuyến tính. */
export function momentum(entity: unknown, dt: number): Vec3D {
  const mass = readNum(entity, ['mass'], DEFAULT_MASS);
  return scale(rigidBodyVelocity(entity, dt), mass);
}

/** Động lượng góc. */
export function angularMomentum(entity: unknown, dt: number): Vec3D {
  const inertia = readNum(entity, ['inertia', 'momentOfInertia'], 1);
  return scale(angularVelocity(entity, dt), inertia);
}

/** Xung lượng. */
export function impulse(entity: unknown, dt: number): Vec3D {
  const explicit = readVec(entity, ['impulse', 'impulseVector']);
  if (magnitude(explicit) > 0) return explicit;
  const force = readVec(entity, ['force']);
  if (magnitude(force) > 0) return scale(force, Math.max(1e-6, dt));
  const mass = readNum(entity, ['mass'], DEFAULT_MASS);
  const acceleration = rigidBodyAcceleration(entity, dt);
  return scale(acceleration, mass * Math.max(1e-6, dt));
}

/** Vận tốc sau va chạm có hồi phục. */
export function restitutionVelocity(entity: unknown, dt: number): Vec3D {
  const restitution = clamp(readNum(entity, ['restitution', 'bounciness'], 0.3), 0, 1);
  const velocity = rigidBodyVelocity(entity, dt);
  const normal = readVec(entity, ['normal', 'contactNormal']);
  const n = magnitude(normal) > 0 ? normalize(normal) : { ...UP3 };
  const normalComponent = dot(velocity, n);
  const reflected = subtract(velocity, scale(n, (1 + restitution) * normalComponent));
  return reflected;
}

/** Xung ma sát. */
export function frictionImpulse(entity: unknown, dt: number): Vec3D {
  const friction = clamp(readNum(entity, ['friction', 'frictionCoefficient'], 0.5), 0, 2);
  const velocity = rigidBodyVelocity(entity, dt);
  const tangent = subtract(velocity, scale({ x: 0, y: 1, z: 0 }, dot(velocity, { x: 0, y: 1, z: 0 })));
  const mass = readNum(entity, ['mass'], DEFAULT_MASS);
  return scale(normalize(tangent), -friction * mass * magnitude(velocity));
}

/** Gia tốc trọng trường. */
export function gravityAcceleration(entity: unknown): Vec3D {
  const explicit = readVec(entity, ['gravity', 'gravityAcceleration']);
  if (magnitude(explicit) > 0) return explicit;
  const scaleFactor = readNum(entity, ['gravityScale'], 1);
  return scale(GRAVITY, scaleFactor);
}

/** Lực lò xo Hooke. */
export function springForce(entity: unknown, dt: number): Vec3D {
  const stiffness = readNum(entity, ['stiffness', 'springConstant', 'k'], 100);
  const anchor = readVec(entity, ['anchor', 'restPosition', 'target']);
  const position = readVec(entity, ['position', 'currentPosition']);
  const displacement = subtract(position, anchor);
  return scale(displacement, -stiffness);
}

/** Lực giảm chấn. */
export function dampingForce(entity: unknown, dt: number): Vec3D {
  const damping = readNum(entity, ['damping', 'dampingCoefficient', 'c'], 10);
  const velocity = rigidBodyVelocity(entity, dt);
  return scale(velocity, -damping);
}

/** Lực ràng buộc. */
export function constraintForce(entity: unknown, dt: number): Vec3D {
  const stiffness = readNum(entity, ['stiffness', 'constraintStiffness'], 200);
  const target = readVec(entity, ['target', 'anchor', 'restPosition']);
  const position = readVec(entity, ['position', 'currentPosition']);
  return scale(subtract(position, target), -stiffness);
}

/** Sai số ràng buộc. */
export function constraintError(a: unknown, b: unknown): number {
  return distance3D(resolvePointOf(a), resolvePointOf(b));
}

/** Lấy vị trí từ dữ liệu bất kỳ. */
export function resolvePointOf(value: unknown): Vec3D {
  if (!value || typeof value !== 'object') return { x: 0, y: 0, z: 0 };
  const o = value as Record<string, unknown>;
  if (o.position && typeof o.position === 'object') return toVec3(o.position);
  if (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') return toVec3(o);
  return { x: 0, y: 0, z: 0 };
}

/** Bước tích phân Euler. */
export function eulerIntegrate(position: Vec3D, velocity: Vec3D, acceleration: Vec3D, dt: number): Vec3D {
  return add(position, add(scale(velocity, dt), scale(acceleration, 0.5 * dt * dt)));
}

/** Bước tích phân Verlet. */
export function verletIntegrate(position: Vec3D, previous: Vec3D, acceleration: Vec3D, dt: number): Vec3D {
  const velocity = subtract(position, previous);
  return add(add(position, velocity), scale(acceleration, dt * dt));
}

/** Bước tích phân Runge–Kutta bậc 4 cho vị trí. */
export function rungeKuttaIntegrate(position: Vec3D, velocity: Vec3D, acceleration: Vec3D, dt: number): Vec3D {
  const k1v = velocity;
  const k1a = acceleration;
  const k2v = add(velocity, scale(k1a, dt / 2));
  const k2a = acceleration;
  const k3v = add(velocity, scale(k2a, dt / 2));
  const k3a = acceleration;
  const k4v = add(velocity, scale(k3a, dt));
  const k4a = acceleration;
  const dv = scale(add(add(add(k1v, scale(k2v, 2)), scale(k3v, 2)), k4v), dt / 6);
  const da = scale(add(add(add(k1a, scale(k2a, 2)), scale(k3a, 2)), k4a), dt / 6);
  return add(add(position, scale(dv, dt)), scale(da, dt * dt / 6));
}

/** Số bước con cần thiết để mô phỏng ổn định. */
export function physicsSubsteps(dt: number, maxStep = 1 / 120): number {
  const safeDt = Math.max(1e-6, dt);
  return Math.max(1, Math.ceil(safeDt / Math.max(1e-6, maxStep)));
}

/** Đánh giá độ ổn định của bước mô phỏng. */
export function physicsStability(dt: number, maxStep = 1 / 120): number {
  const steps = physicsSubsteps(dt, maxStep);
  const effective = dt / steps;
  return clamp(1 - effective / Math.max(1e-6, maxStep), 0, 1);
}

// ---------------------------------------------------------------------------
// Đạn
// ---------------------------------------------------------------------------

/** Hướng bắn từ gốc tới mục tiêu. */
export function projectileDirection(origin: Vec3D, target: Vec3D): Vec3D {
  const dir = normalize(subtract(target, origin));
  return magnitude(dir) > 0 ? dir : { ...FORWARD3 };
}

/**
 * Góc nâng tầm bắn để đạn trúng mục tiêu (giải pháp ném xiên cảm ứng).
 *
 * `tan(θ) = (v² − √(v⁴ − g(g·D² + 2·Δy·v²))) / (g·D)` — chọn nhánh thấp
 * (arc thấp) vì ổn định hơn. Khi mục tiêu ngoài tầm với, dùng 45° (tầm xa tối đa).
 */
export function ballisticLaunchElevation(
  horizontalDistance: number,
  heightDelta: number,
  speed: number,
  gravityMagnitude = GRAVITY_MAGNITUDE,
): number {
  const v = Math.max(1e-6, speed);
  const g = Math.max(1e-6, gravityMagnitude);
  if (horizontalDistance < 1e-6) return heightDelta >= 0 ? Math.PI / 2 : Math.PI / 4;
  const v2 = v * v;
  const discriminant = v2 * v2 - g * (g * horizontalDistance * horizontalDistance + 2 * heightDelta * v2);
  const tanElevation = discriminant < 0
    ? 1
    : (v2 - Math.sqrt(Math.max(0, discriminant))) / (g * horizontalDistance);
  return Math.atan(tanElevation);
}

/** Nghiệm nhỏ nhất > 0 của ½g·t² − v·t − Δy = 0 (bắn dọc). */
function verticalFlightTime(verticalSpeed: number, gravityMagnitude: number, heightDelta: number): number {
  const g = Math.max(1e-6, gravityMagnitude);
  const discriminant = verticalSpeed * verticalSpeed + 2 * g * heightDelta;
  if (discriminant < 0) return 0;
  const root = Math.sqrt(discriminant);
  const t1 = (verticalSpeed + root) / g;
  const t2 = (verticalSpeed - root) / g;
  const candidates = [t1, t2].filter((t) => Number.isFinite(t) && t > 0);
  return candidates.length > 0 ? Math.min(...candidates) : 0;
}

/**
 * Quỹ đạo đạn (ném xiên với gia tốc hằng).
 *
 * Quỹ đạo được dựng theo **góc nâng giải pháp** nên điểm cuối trùng đúng
 * mục tiêu — trước đây công thức dùng thời gian rơi nên đạn không bao giờ
 * chạm mục tiêu và quãng ngang bị nhân sai hệ số.
 */
export function projectileTrajectory(
  origin: Vec3D,
  target: Vec3D,
  speed: number,
  gravity: Vec3D = GRAVITY,
  samples = 24,
): Vec3D[] {
  const count = Math.max(2, Math.floor(samples));
  const g = gravity.y === 0 ? -GRAVITY_MAGNITUDE : gravity.y;
  const gMag = Math.abs(g);
  const v = Math.max(1e-6, speed);

  const dx = target.x - origin.x;
  const dz = target.z - origin.z;
  const dy = target.y - origin.y;
  const horizontalDistance = Math.hypot(dx, dz);

  const elevation = ballisticLaunchElevation(horizontalDistance, dy, v, gMag);
  const azimuth = horizontalDistance > 1e-6 ? Math.atan2(dx, dz) : 0;
  const horizontalSpeed = v * Math.cos(elevation);
  const verticalSpeed = v * Math.sin(elevation);

  let duration: number;
  if (horizontalSpeed > 1e-6) {
    duration = horizontalDistance / horizontalSpeed;
  } else {
    duration = verticalFlightTime(v, gMag, dy);
  }
  if (!Number.isFinite(duration) || duration <= 0) duration = 1;

  const points: Vec3D[] = [];
  for (let i = 0; i < count; i++) {
    const t = (duration * i) / (count - 1);
    points.push({
      x: origin.x + Math.sin(azimuth) * horizontalSpeed * t,
      y: origin.y + verticalSpeed * t + 0.5 * g * t * t,
      z: origin.z + Math.cos(azimuth) * horizontalSpeed * t,
    });
  }
  return points;
}

/** Thời gian bay của đạn (dùng cùng góc nâng với quỹ đạo). */
export function projectileFlightTime(origin: Vec3D, target: Vec3D, speed: number, gravity: Vec3D = GRAVITY): number {
  const gMag = Math.abs(gravity.y === 0 ? -GRAVITY_MAGNITUDE : gravity.y);
  const v = Math.max(1e-6, speed);
  const dx = target.x - origin.x;
  const dz = target.z - origin.z;
  const dy = target.y - origin.y;
  const horizontalDistance = Math.hypot(dx, dz);

  if (horizontalDistance < 1e-6) {
    return verticalFlightTime(v, gMag, dy);
  }
  const elevation = ballisticLaunchElevation(horizontalDistance, dy, v, gMag);
  const horizontalSpeed = v * Math.cos(elevation);
  if (horizontalSpeed < 1e-6) return verticalFlightTime(v, gMag, dy);
  return horizontalDistance / horizontalSpeed;
}

/** Điểm va chạm của đạn với mặt phẳng đất. */
export function projectileImpactPoint(origin: Vec3D, direction: Vec3D, speed: number, groundY = 0): Vec3D {
  const g = -GRAVITY_MAGNITUDE;
  const vy = direction.y * speed;
  const t = vy > 0 ? (2 * vy) / g : 0;
  return {
    x: origin.x + direction.x * speed * t,
    y: groundY,
    z: origin.z + direction.z * speed * t,
  };
}

/** Lệch độ do gió tác động lên đạn. */
export function projectileWindDrift(
  origin: Vec3D,
  direction: Vec3D,
  speed: number,
  wind: Vec3D,
  flightTime: number,
): Vec3D {
  const horizontalWind = { x: wind.x, y: 0, z: wind.z };
  return scale(horizontalWind, flightTime * flightTime * 0.5);
}

/** Góc sai lệch do tán sai. */
export function projectileSpreadAngle(spread: number): number {
  return Math.abs(spread);
}

// ---------------------------------------------------------------------------
// Vật phẩm
// ---------------------------------------------------------------------------

/** Hướng hút vật phẩm về người chơi. */
export function magnetDirection(item: Vec3D, player: Vec3D): Vec3D {
  const dir = normalize(subtract(player, item));
  return magnitude(dir) > 0 ? dir : { ...FORWARD3 };
}

/** Vận tốc hút vật phẩm (tăng dần khi gần). */
export function magnetVelocity(item: Vec3D, player: Vec3D, strength = 10, dt = 0.016): Vec3D {
  const distance = distance3D(item, player);
  const falloff = 1 / (1 + distance * distance * 0.01);
  return scale(magnetDirection(item, player), strength * falloff * dt);
}

/** Chiều cao lơ lửng của vật phẩm. */
export function itemHoverHeight(entity: unknown): number {
  const base = readNum(entity, ['hoverHeight'], 0.2);
  const amplitude = readNum(entity, ['bobAmplitude', 'bobHeight'], 0.05);
  return base + amplitude;
}

/** Biên độ dao động (bob) của vật phẩm. */
export function itemBobAmplitude(entity: unknown): number {
  return readNum(entity, ['bobAmplitude', 'bobHeight'], 0.05);
}

/** Tần số dao động của vật phẩm (Hz). */
export function itemBobFrequency(entity: unknown): number {
  return readNum(entity, ['bobFrequency', 'hoverFrequency'], 0.5);
}

/** Tốc độ xoay của vật phẩm (rad/s). */
export function itemRotationSpeed(entity: unknown): number {
  return readNum(entity, ['rotationSpeed', 'spinSpeed'], 1);
}

/** Phạm vi nhặt vật phẩm. */
export function itemPickupRange(entity: unknown): number {
  return readNum(entity, ['pickupRange', 'interactionRange'], 2);
}

/** Độ lệch vị trí nhặt so với vật phẩm. */
export function itemPickupOffset(entity: unknown): Vec3D {
  return readVec(entity, ['pickupOffset', 'grabOffset']);
}

// ---------------------------------------------------------------------------
// Hạt & hiệu ứng
// ---------------------------------------------------------------------------

/** Nội suy màu giữa hai màu. */
export function lerpColor(from: unknown, to: unknown, t: number): { r: number; g: number; b: number; a: number } {
  const a = readColor(from);
  const b = readColor(to);
  const k = clamp01(t);
  return {
    r: lerp(a.r, b.r, k),
    g: lerp(a.g, b.g, k),
    b: lerp(a.b, b.b, k),
    a: lerp(a.a, b.a, k),
  };
}

/** Đọc màu từ dữ liệu bất kỳ (hỗ trợ mảng 0..1, số, hex). */
export function readColor(source: unknown): { r: number; g: number; b: number; a: number } {
  if (Array.isArray(source)) {
    return {
      r: num(source[0]),
      g: num(source[1]),
      b: num(source[2]),
      a: source.length > 3 ? num(source[3], 1) : 1,
    };
  }
  if (typeof source === 'number') return { r: source, g: source, b: source, a: 1 };
  if (source && typeof source === 'object') {
    const o = source as Record<string, unknown>;
    if (typeof o.r === 'number' || typeof o.g === 'number' || typeof o.b === 'number') {
      return { r: num(o.r), g: num(o.g), b: num(o.b), a: num(o.a, 1) };
    }
  }
  return { r: 1, g: 1, b: 1, a: 1 };
}

/** Độ mờ của hạt theo tuổi. */
export function particleOpacity(age: number, lifetime: number): number {
  if (lifetime <= 0) return 1;
  return clamp01(1 - age / lifetime);
}

/** Lực hút của hạt về l attractor. */
export function attractorForce(particle: Vec3D, attractor: Vec3D, strength = 10): Vec3D {
  const dir = normalize(subtract(attractor, particle));
  const distance = distance3D(particle, attractor);
  const falloff = 1 / (1 + distance * distance * 0.01);
  return scale(dir, strength * falloff);
}

/** Hướng của trường lực tại điểm. */
export function fieldDirection(origin: Vec3D, sample: Vec3D): Vec3D {
  const dir = normalize(subtract(sample, origin));
  return magnitude(dir) > 0 ? dir : { ...FORWARD3 };
}

/** Bán kính hiệu ứng. */
export function effectRadius(entity: unknown): number {
  return readNum(entity, ['radius', 'effectRadius', 'size'], 1);
}

/** Mức độ giãn nở của hiệu ứng theo thời gian. */
export function effectExpansion(age: number, lifetime: number): number {
  if (lifetime <= 0) return 1;
  return clamp01(age / lifetime);
}

/** Suy giảm cường độ theo khoảng cách. */
export function effectFalloff(distance: number, radius: number): number {
  if (radius <= 0) return 0;
  return clamp01(1 - distance / radius);
}

/** Thời lượng hiệu ứng. */
export function effectDuration(entity: unknown): number {
  return readNum(entity, ['duration', 'lifetime', 'effectDuration'], 1);
}

/** Cường độ hiệu ứng. */
export function effectIntensity(entity: unknown): number {
  return readNum(entity, ['intensity', 'strength', 'power'], 1);
}

/** Tạo bản ghi kết quả chuẩn hoá. */
export function named(name: string, result: unknown, extra?: Record<string, unknown>): Record<string, unknown> {
  return namedResult(name, result, extra);
}

/** Tạo bản ghi va chạm chuẩn hoá. */
export function collide(
  name: string,
  hit: boolean,
  distance: number,
  point?: Vec3D,
  normal?: Vec3D,
  penetration = 0,
): Record<string, unknown> {
  return collisionResult(name, hit, distance, point, normal, penetration);
}

/** Tạo bản ghi hộp bao chuẩn hoá. */
export function bounds(name: string, box: Box3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return boundsResult(name, box, extra);
}

/** Tạo bản ghi va chạm AABB chuẩn hoá. */
export function aabb(name: string, a: Box3D, b: Box3D): Record<string, unknown> {
  return aabbResult(name, a, b);
}
