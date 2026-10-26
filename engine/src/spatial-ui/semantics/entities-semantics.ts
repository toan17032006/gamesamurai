/**
 * @file entities-semantics.ts
 * @module @aetheria/engine/spatial-ui/semantics/entities-semantics
 * @description Ngữ nghĩa sinh vật & thực vật — NPC, boss, động vật, chim, cây, vật thể.
 *
 * Trước đây 290 method của `EntitiesFaunaFloraSubsystem` trả về offset rỗng
 * cho 67 method, `1.0` cho 66 method, kết quả "có tên" rỗng cho 63 method và
 * vector không cho 41 method. Ở đây kích thước sinh vật, hành vi đàn, lực
 * bay và phân tích vật thể đều được tính thật.
 */

import type { Vec3D, QuatD, Box3D } from '../types.js';
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
  UP3,
  FORWARD3,
  RIGHT3,
} from '../spatial-primitives.js';

// ---------------------------------------------------------------------------
// Kích thước chuẩn của các loài
// ---------------------------------------------------------------------------

/** Kích thước boss (m). */
export const BOSS_DIMENSIONS = Object.freeze({
  height: 3.5,
  width: 1.6,
  depth: 1.6,
  radius: 0.8,
  speed: 3.5,
  mass: 800,
  attackRadius: 4,
  detectionRange: 25,
});

/** Kích thước động vật bốn chân (m). */
export const ANIMAL_DIMENSIONS = Object.freeze({
  bodyLength: 1.2,
  bodyHeight: 0.7,
  bodyWidth: 0.4,
  legLength: 0.45,
  strideLength: 0.6,
  strideFrequency: 1.8,
  walkingSpeed: 1.2,
  runningSpeed: 6.5,
  jumpHeight: 0.8,
  hearingRange: 12,
  smellRange: 20,
  attackRange: 2,
});

/** Kích thước chim (m). */
export const BIRD_DIMENSIONS = Object.freeze({
  bodyLength: 0.45,
  bodyHeight: 0.3,
  wingspan: 1.2,
  wingLength: 0.55,
  wingArea: 0.12,
  flapAmplitude: 0.6,
  flapFrequency: 6,
  flightSpeed: 12,
  turnRadius: 3,
  mass: 0.8,
});

/** Kích thước cây & thực vật (m). */
export const PLANT_DIMENSIONS = Object.freeze({
  plantHeight: 0.6,
  treeHeight: 12,
  trunkDiameter: 0.4,
  trunkRadius: 0.2,
  canopyRadius: 2.5,
  branchLength: 1.5,
  leafLength: 0.12,
  leafWidth: 0.06,
  flowerRadius: 0.05,
  fruitRadius: 0.04,
  rootDepth: 0.5,
  rootSpread: 0.4,
});

/** Kích thước vật thể chung (m). */
export const OBJECT_DIMENSIONS = Object.freeze({
  length: 1,
  width: 1,
  height: 1,
  depth: 1,
  density: 1000,
});

/** Kích thước NPC (m). */
export const NPC_DIMENSIONS = Object.freeze({
  height: 1.8,
  radius: 0.35,
  groupRadius: 5,
  patrolRadius: 8,
  detectionRange: 15,
  fieldOfView: 1.22, // ~70° tính bằng rad
  attackRange: 2,
  interactionRange: 2.5,
  pathfindingCost: 1,
});

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
export function readPoints(source: unknown, keys: string[] = ['points', 'positions', 'group', 'members', 'flock']): Vec3D[] {
  if (Array.isArray(source)) return source.map((p) => toVec3(p));
  if (!source || typeof source !== 'object') return [];
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (Array.isArray(raw)) return raw.map((p) => toVec3(p));
  }
  return [];
}

/** Vị trí điểm trong thế giới từ entity hoặc object thường. */
export function worldPoint(source: unknown): Vec3D {
  if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0 };
  const o = source as Record<string, unknown>;
  if (o.position && typeof o.position === 'object') return toVec3(o.position);
  if (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') return toVec3(o);
  return { x: 0, y: 0, z: 0 };
}

/** Đọc số từ options với giá trị mặc định. */
export function opt(options: unknown, keys: string[], fallback: number): number {
  const v = readNum(options, keys, Number.NaN);
  return Number.isFinite(v) ? v : fallback;
}

// ---------------------------------------------------------------------------
// Hành vi đàn (flocking)
// ---------------------------------------------------------------------------

/** Lực tách khỏi đồng loại. */
export function separationForce(position: Vec3D, neighbors: Vec3D[], radius = 2): Vec3D {
  let force = { x: 0, y: 0, z: 0 };
  for (const other of neighbors) {
    const away = subtract(position, other);
    const distance = magnitude(away);
    if (distance > 1e-6 && distance < radius) {
      force = add(force, scale(normalize(away), (radius - distance) / radius));
    }
  }
  return force;
}

/** Lực đồng hướng với đồng loại. */
export function alignmentForce(position: Vec3D, neighbors: Vec3D[]): Vec3D {
  if (neighbors.length === 0) return { x: 0, y: 0, z: 0 };
  const sum = neighbors.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 });
  const average = scale(sum, 1 / neighbors.length);
  const direction = normalize(subtract(average, position));
  return magnitude(direction) > 0 ? direction : { x: 0, y: 0, z: 0 };
}

/** Lực giữ gần trung tâm đàn. */
export function cohesionForce(position: Vec3D, neighbors: Vec3D[]): Vec3D {
  if (neighbors.length === 0) return { x: 0, y: 0, z: 0 };
  const sum = neighbors.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 });
  const center = scale(sum, 1 / neighbors.length);
  return normalize(subtract(center, position));
}

/** Trọng tâm của đàn. */
export function groupCenter(members: Vec3D[]): Vec3D {
  if (members.length === 0) return { x: 0, y: 0, z: 0 };
  const sum = members.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 });
  return scale(sum, 1 / members.length);
}

/** Lực tránh vật cản (đẩy ra khỏi vùng va chạm). */
export function avoidanceForce(position: Vec3D, obstacles: Vec3D[], radius = 3): Vec3D {
  let force = { x: 0, y: 0, z: 0 };
  for (const obstacle of obstacles) {
    const away = subtract(position, obstacle);
    const distance = magnitude(away);
    if (distance > 1e-6 && distance < radius) {
      force = add(force, scale(normalize(away), (radius - distance) / radius));
    }
  }
  return force;
}

// ---------------------------------------------------------------------------
// Vật lý sinh vật
// ---------------------------------------------------------------------------

/** Lực nâng của chim (theo tốc độ và diện tích cánh). */
export function liftForce(velocity: Vec3D, wingArea: number, density = 1.225): Vec3D {
  const speed = magnitude(velocity);
  if (speed < 1e-6) return { x: 0, y: 0, z: 0 };
  const lift = 0.5 * density * wingArea * speed * speed;
  return scale(normalize(velocity), lift);
}

/** Lực cản (vuông phương với vận tốc). */
export function dragForce(velocity: Vec3D, coefficient = 0.5, density = 1.225): Vec3D {
  const speed = magnitude(velocity);
  if (speed < 1e-6) return { x: 0, y: 0, z: 0 };
  return scale(normalize(velocity), -0.5 * density * coefficient * speed * speed);
}

/** Lực ma sát giữa vật thể và mặt phẳng. */
export function frictionForce(velocity: Vec3D, normal: Vec3D, coefficient = 0.5): Vec3D {
  const n = normalize(normal);
  const normalComponent = dot(velocity, n);
  const tangent = subtract(velocity, scale(n, normalComponent));
  if (magnitude(tangent) < 1e-9) return { x: 0, y: 0, z: 0 };
  return scale(normalize(tangent), -coefficient * Math.abs(normalComponent));
}

/** Lực đẩy của nước cho vật thể. */
export function buoyancyForce(volume: number, density: number, waterDensity = 1000): Vec3D {
  const net = waterDensity - density;
  return { x: 0, y: net * volume * 9.81, z: 0 };
}

/** Tỷ lệ chất lỏng của vật thể chìm trong nước. */
export function submergedFraction(height: number, waterLevel: number): number {
  if (height <= 0) return 0;
  return clamp01((waterLevel - height) / height + 0.5);
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
export function orientation(name: string, value: QuatD, extra?: Record<string, unknown>): Record<string, unknown> {
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
