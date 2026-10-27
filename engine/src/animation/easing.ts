/**
 * @file easing.ts
 * @module @aetheria/engine/animation/easing
 * @description Thư viện easing dùng chung cho hoạt ảnh — mỗi hàm nhận tiến độ
 * chuẩn hóa `t ∈ [0, 1]` và trả về giá trị tiến độ đã biến dạng. Sử dụng bởi
 * `curve.ts` (easing theo keyframe), `blend.ts` (đường cong crossfade) và bất
 * kỳ tầng render/library nào cần đường cong thời gian.
 *
 * Đặt tên theo quy ước phổ biến (CSS/Unity/GSAP): `<family><Mode>` với
 * `Mode ∈ {In, Out, InOut}` và family gồm quad, cubic, quart, quint, sine,
 * expo, circ, elastic, back, bounce.
 */

import { clampRange } from '../deeplearning/random.js';

export type EasingFunction = (t: number) => number;

const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;
const c4 = (2 * Math.PI) / 3;
const c5 = (2 * Math.PI) / 4.5;

// --- Polynomial families ---------------------------------------------------

export function linear(t: number): number {
  return t;
}

export function quadIn(t: number): number {
  return t * t;
}

export function quadOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function quadInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function cubicIn(t: number): number {
  return t * t * t;
}

export function cubicOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function cubicInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function quartIn(t: number): number {
  return t * t * t * t;
}

export function quartOut(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function quartInOut(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function quintIn(t: number): number {
  return t * t * t * t * t;
}

export function quintOut(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export function quintInOut(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

// --- Sine / Expo / Circ ------------------------------------------------------

export function sineIn(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

export function sineOut(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

export function sineInOut(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function expoIn(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

export function expoOut(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function expoInOut(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

export function circIn(t: number): number {
  return 1 - Math.sqrt(1 - t * t);
}

export function circOut(t: number): number {
  return Math.sqrt(1 - Math.pow(t - 1, 2));
}

export function circInOut(t: number): number {
  return t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
}

// --- Back / Elastic -----------------------------------------------------------

export function backIn(t: number): number {
  return c3 * t * t * t - c1 * t * t;
}

export function backOut(t: number): number {
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function backInOut(t: number): number {
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
}

export function elasticIn(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
}

export function elasticOut(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function elasticInOut(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
}

// --- Bounce --------------------------------------------------------------------

export function bounceOut(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

export function bounceIn(t: number): number {
  return 1 - bounceOut(1 - t);
}

export function bounceInOut(t: number): number {
  return t < 0.5
    ? (1 - bounceOut(1 - 2 * t)) / 2
    : (1 + bounceOut(2 * t - 1)) / 2;
}

// --- Step / Smoothstep -----------------------------------------------------------

export function stepStart(t: number): number {
  return t > 0 ? 1 : 0;
}

export function stepEnd(t: number): number {
  return t < 1 ? 0 : 1;
}

export function smoothStep(t: number): number {
  const clamped = clampRange(t, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export function smootherStep(t: number): number {
  const clamped = clampRange(t, 0, 1);
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}

// --- Registry --------------------------------------------------------------------

/** Registry easing chuẩn — khóa tên như `cubicInOut`, `elasticOut`... */
export const EASING_FUNCTIONS: Readonly<Record<string, EasingFunction>> = Object.freeze({
  linear,
  quadIn, quadOut, quadInOut,
  cubicIn, cubicOut, cubicInOut,
  quartIn, quartOut, quartInOut,
  quintIn, quintOut, quintInOut,
  sineIn, sineOut, sineInOut,
  expoIn, expoOut, expoInOut,
  circIn, circOut, circInOut,
  backIn, backOut, backInOut,
  elasticIn, elasticOut, elasticInOut,
  bounceIn, bounceOut, bounceInOut,
  stepStart, stepEnd,
  smoothStep, smootherStep,
});

/** Danh sách tên easing đã đăng ký (sắp xếp). */
export function easingNames(): string[] {
  return Object.keys(EASING_FUNCTIONS).sort();
}

/** Tra easing theo tên; trả `linear` khi không tìm thấy (an toàn cho dữ liệu). */
export function easingByName(name: string | undefined): EasingFunction {
  if (!name) return linear;
  return EASING_FUNCTIONS[name] ?? linear;
}

/** Áp easing có kẹp t vào `[0, 1]`. */
export function applyEasing(name: string | undefined, t: number): number {
  return easingByName(name)(clampRange(t, 0, 1));
}

/** Đảo ngược easing (easing(t) → 1 − easing(1 − t)) — dùng cho ping-pong. */
export function reverseEasing(easing: EasingFunction): EasingFunction {
  return (t: number) => 1 - easing(1 - t);
}

/** Hợp hai easing: easingOut(easingIn(t)) — dùng cho chuỗi chuyển động. */
export function composeEasing(outer: EasingFunction, inner: EasingFunction): EasingFunction {
  return (t: number) => outer(inner(t));
}

/** Cân đối easing trong khoảng giá trị `[from, to]` — trả giá trị nội suy. */
export function easedLerp(easing: EasingFunction, from: number, to: number, t: number): number {
  return from + (to - from) * easing(clampRange(t, 0, 1));
}
