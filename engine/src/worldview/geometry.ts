/**
 * @file geometry.ts
 * @module @aetheria/engine/worldview/geometry
 * @description Toán hình học tự tính cho render thế giới: noise tất định (không
 * phụ thuộc Math.random), builder đa giác (circle/ellipse/blob/sao), dao động
 * gió và sóng nước bằng hàm sin, và phép đo bounds cho culling/sắp layout.
 */

import type { Shape, Vec2 } from './types.js';

// ---------------------------------------------------------------------------
// Noise tất định — hash-based value noise 1D/2D, không Math.random
// ---------------------------------------------------------------------------

/** Hash 32-bit nhanh (mulberry-ish) cho toạ độ nguyên + seed. */
export function hash2(x: number, y: number, seed: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2246822519)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Noise 1D mượt (nội suy cosine giữa hai giá trị hash). */
export function noise1D(x: number, seed: number): number {
  const x0 = Math.floor(x);
  const t = x - x0;
  const smooth = t * t * (3 - 2 * t);
  const a = hash2(x0, 0, seed);
  const b = hash2(x0 + 1, 0, seed);
  return a + (b - a) * smooth;
}

/** Noise 2D mượt — dùng cho terrain và mép nước. */
export function noise2D(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const n00 = hash2(x0, y0, seed);
  const n10 = hash2(x0 + 1, y0, seed);
  const n01 = hash2(x0, y0 + 1, seed);
  const n11 = hash2(x0 + 1, y0 + 1, seed);
  const top = n00 + (n10 - n00) * sx;
  const bottom = n01 + (n11 - n01) * sx;
  return top + (bottom - top) * sy;
}

/** Fractal noise 1D — cộng nhiều tầng để terrain tự nhiên. */
export function fractal1D(x: number, seed: number, octaves = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += noise1D(x * frequency, seed + i * 7919) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Dao động — gió và sóng nước tự tính theo thời gian
// ---------------------------------------------------------------------------

/**
 * Lệch gió tại vị trí x và thời gian t: tổ hợp sóng sin di chuyển theo hướng
 * gió — cây/ngô lớn lên lay đúng pha theo vị trí, không cần file animation.
 */
export function swayAt(x: number, worldTime: number, windStrength: number): number {
  const w = clampAbs(windStrength, 1.2);
  return (
    Math.sin(worldTime * 1.7 + x * 0.02) * 0.6 * w +
    Math.sin(worldTime * 3.1 + x * 0.05 + 1.3) * 0.25 * w +
    Math.sin(worldTime * 0.6 + x * 0.004) * 0.15 * w
  );
}

/** Sóng nước tại điểm x, thời gian t — biên độ theo sức gió. */
export function waveAt(x: number, worldTime: number, windStrength: number): number {
  const w = clampAbs(windStrength, 1);
  return (
    Math.sin(worldTime * 1.2 + x * 0.08) * 1.6 * (0.4 + Math.abs(w)) +
    Math.sin(worldTime * 2.4 - x * 0.13) * 0.8
  );
}

function clampAbs(v: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, v));
}

// ---------------------------------------------------------------------------
// Builder hình học
// ---------------------------------------------------------------------------

/** Đa giác xấp xỉ đường tròn. */
export function circlePoints(center: Vec2, radius: number, segments = 16): Vec2[] {
  const points: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius });
  }
  return points;
}

/** Blob — đường tròn mép gợn bằng noise: tán cây, đám mây, đám đông. */
export function blobPoints(center: Vec2, radius: number, seed: number, wobble = 0.25, segments = 14): Vec2[] {
  const points: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = radius * (1 - wobble / 2 + noise2D(Math.cos(angle) * 2, Math.sin(angle) * 2, seed) * wobble);
    points.push({ x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r });
  }
  return points;
}

/** Đường cong mượt (Catmull-Rom → polyline dày đặc) cho sông/đường. */
export function smoothPathPoints(anchors: Vec2[], stepsPerSegment = 6): Vec2[] {
  if (anchors.length < 3) return [...anchors];
  const points: Vec2[] = [];
  const padded = [anchors[0], ...anchors, anchors[anchors.length - 1]];
  for (let i = 1; i < padded.length - 2; i++) {
    const p0 = padded[i - 1];
    const p1 = padded[i];
    const p2 = padded[i + 1];
    const p3 = padded[i + 2];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      points.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  points.push(anchors[anchors.length - 1]);
  return points;
}

/** Bounds của một shape — dùng cho culling và căn layout tự động. */
export function shapeBounds(shape: Shape): { minX: number; minY: number; maxX: number; maxY: number } {
  switch (shape.kind) {
    case 'circle':
      return { minX: shape.center.x - shape.radius, maxX: shape.center.x + shape.radius, minY: shape.center.y - shape.radius, maxY: shape.center.y + shape.radius };
    case 'ellipse':
      return { minX: shape.center.x - shape.rx, maxX: shape.center.x + shape.rx, minY: shape.center.y - shape.ry, maxY: shape.center.y + shape.ry };
    case 'rect':
      return { minX: shape.topLeft.x, maxX: shape.topLeft.x + shape.width, minY: shape.topLeft.y, maxY: shape.topLeft.y + shape.height };
    case 'line':
      return {
        minX: Math.min(shape.from.x, shape.to.x), maxX: Math.max(shape.from.x, shape.to.x),
        minY: Math.min(shape.from.y, shape.to.y), maxY: Math.max(shape.from.y, shape.to.y),
      };
    case 'polygon':
    case 'path': {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of shape.points) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      return { minX, minY, maxX, maxY };
    }
  }
}

/** Bounds tổng của một node (hợp mọi shape). */
export function nodeBounds(shapes: Shape[]): { minX: number; minY: number; maxX: number; maxY: number } {
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

/** Hai bounds có giao nhau không (culling theo camera). */
export function boundsIntersect(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}
