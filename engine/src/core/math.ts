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
  return Math.sqrt(vecDot(a, a));
}

export function vecDistance(a: Vec3, b: Vec3): number {
  return vecLength(vecSub(a, b));
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
