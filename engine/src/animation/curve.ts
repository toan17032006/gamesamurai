/**
 * @file curve.ts
 * @module @aetheria/engine/animation/curve
 * @description Đường cong keyframe cho track hoạt ảnh: đánh giá giá trị tại
 * thời điểm bất kỳ với các kiểu nội suy `step | linear | catmull-rom |
 * cubic-hermite`, thao tác keyframe (chèn/xóa/giãn thời gian/cắt đoạn) và
 * tiện ích quaternion (slerp) cho track rotation.
 *
 * Quy ước lưu trữ khớp `AnimationTrack` (types.ts): `keys` là mảng phẳng
 * `[time₀, c₀... , time₁, c₁...]` với `stride = 1 + componentCount`.
 */

import { clampRange } from '../deeplearning/random.js';
import { applyEasing } from './easing.js';
import type { AnimationTrack, InterpolationKind, ScalarKeyframe } from './types.js';

/** Số bước (stride) của một track theo kind. */
export function trackStride(kind: AnimationTrack['kind']): number {
  switch (kind) {
    case 'vector2': return 2;
    case 'vector3': return 3;
    case 'quaternion': return 4;
    case 'color': return 3;
    case 'scalar':
    default: return 1;
  }
}

/** Số keyframe của track. */
export function keyCount(track: AnimationTrack): number {
  const stride = 1 + track.componentCount;
  return Math.floor(track.keys.length / stride);
}

/** Thời điểm keyframe thứ `index`. */
export function keyTime(track: AnimationTrack, index: number): number {
  return track.keys[index * (1 + track.componentCount)] ?? 0;
}

/** Đọc vector thành phần của keyframe `index` (bản sao mảng mới). */
export function keyValue(track: AnimationTrack, index: number): number[] {
  const stride = 1 + track.componentCount;
  const base = index * stride;
  return Array.from({ length: track.componentCount }, (_, c) => track.keys[base + 1 + c] ?? 0);
}

/** Tìm chỉ số keyframe lớn nhất có `time <= t` (nhị phân). */
export function findKeyIndex(track: AnimationTrack, time: number): number {
  const count = keyCount(track);
  if (count === 0) return -1;
  let low = 0;
  let high = count - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (keyTime(track, mid) <= time) low = mid;
    else high = mid - 1;
  }
  return low;
}

/**
 * Đánh giá track tại thời điểm `time` (giây) — trả vector phẳng theo thành phần.
 *
 * Với `quaternion`, nội suy slerp giữa hai keyframe để giữ đúng địa chất quay.
 */
export function evaluateTrack(track: AnimationTrack, time: number): number[] {
  const count = keyCount(track);
  if (count === 0) return new Array<number>(track.componentCount).fill(0);
  if (count === 1) return keyValue(track, 0);
  const clampedTime = clampRange(time, keyTime(track, 0), keyTime(track, count - 1));
  const index = findKeyIndex(track, clampedTime);
  if (index >= count - 1) return keyValue(track, count - 1);

  const t0 = keyTime(track, index);
  const t1 = keyTime(track, index + 1);
  const span = Math.max(t1 - t0, 1e-9);
  let alpha = (clampedTime - t0) / span;
  if (track.interpolation === 'step') return keyValue(track, index);
  // Easing gắn với keyframe trái áp cho đoạn này.
  alpha = applyEasing(track.keyEasings?.[index], alpha);

  if (track.kind === 'quaternion') {
    const q0 = keyValue(track, index);
    const q1 = keyValue(track, index + 1);
    return quatSlerpVector(q0, q1, alpha);
  }
  if (track.interpolation === 'catmull-rom' || track.interpolation === 'cubic-hermite') {
    return hermiteSegment(track, index, alpha);
  }
  const a = keyValue(track, index);
  const b = keyValue(track, index + 1);
  return a.map((value, c) => value + ((b[c] ?? value) - value) * alpha);
}

/** Đánh giá keyframe scalar đơn lẻ (tiện cho track vô hướng). */
export function evaluateScalar(track: AnimationTrack, time: number): number {
  return evaluateTrack(track, time)[0] ?? 0;
}

/** Đoạn hermite/catmull-rom giữa keyframe `index` và `index + 1`. */
function hermiteSegment(track: AnimationTrack, index: number, alpha: number): number[] {
  const stride = 1 + track.componentCount;
  const components = track.componentCount;
  const base = index * stride;
  const nextBase = (index + 1) * stride;
  const out: number[] = [];
  for (let c = 0; c < components; c++) {
    const p0 = track.keys[base + 1 + c] ?? 0;
    const p1 = track.keys[nextBase + 1 + c] ?? 0;
    let m0: number;
    let m1: number;
    if (track.interpolation === 'cubic-hermite') {
      m0 = track.keys[base + 1 + c + components] ?? (p1 - p0);
      m1 = track.keys[nextBase + 1 + c + components] ?? (p1 - p0);
    } else {
      // Catmull-Rom: đạo hàm từ keyframe kề trước/sau (biên dùng chính nó).
      const pm = index > 0 ? track.keys[base - stride + 1 + c] : p0;
      const pp = index + 2 < keyCount(track) ? track.keys[nextBase + stride + 1 + c] : p1;
      m0 = (p1 - pm) / 2;
      m1 = (pp - p0) / 2;
    }
    out.push(hermitePoint(p0, p1, m0, m1, alpha));
  }
  return out;
}

/** Giá trị hermite cơ bản tại `alpha ∈ [0,1]`. */
function hermitePoint(p0: number, p1: number, m0: number, m1: number, alpha: number): number {
  const t2 = alpha * alpha;
  const t3 = t2 * alpha;
  return (
    (2 * t3 - 3 * t2 + 1) * p0 +
    (t3 - 2 * t2 + alpha) * m0 +
    (-2 * t3 + 3 * t2) * p1 +
    (t3 - t2) * m1
  );
}

/** Nội suy tuyến tính. */
export function lerp(a: number, b: number, alpha: number): number {
  return a + (b - a) * alpha;
}

/**
 * Slerp quaternion (thứ tự x, y, z, w) — rơi về nlerp khi hai quaternion gần
 * nhau; chuẩn hóa đầu ra để tránh trôi số học.
 */
export function quatSlerpVector(
  a: readonly number[],
  b: readonly number[],
  alpha: number,
): number[] {
  const ax = a[0] ?? 0;
  const ay = a[1] ?? 0;
  const az = a[2] ?? 0;
  const aw = a[3] ?? 1;
  let bx = b[0] ?? 0;
  let by = b[1] ?? 0;
  let bz = b[2] ?? 0;
  let bw = b[3] ?? 1;
  let dot = ax * bx + ay * by + az * bz + aw * bw;
  if (dot < 0) {
    bx = -bx; by = -by; bz = -bz; bw = -bw;
    dot = -dot;
  }
  let s0: number;
  let s1: number;
  if (dot > 0.9995) {
    s0 = 1 - alpha;
    s1 = alpha;
  } else {
    const theta = Math.acos(clampRange(dot, -1, 1));
    const sinTheta = Math.sin(theta);
    s0 = Math.sin((1 - alpha) * theta) / sinTheta;
    s1 = Math.sin(alpha * theta) / sinTheta;
  }
  const x = s0 * ax + s1 * bx;
  const y = s0 * ay + s1 * by;
  const z = s0 * az + s1 * bz;
  const w = s0 * aw + s1 * bw;
  const length = Math.hypot(x, y, z, w) || 1;
  return [x / length, y / length, z / length, w / length];
}

// --- Thao tác keyframe -------------------------------------------------------

/** Chèn keyframe vô hướng/vector vào track (giữ thứ tự thời gian). */
export function insertKey(track: AnimationTrack, time: number, values: readonly number[]): number {
  const stride = 1 + track.componentCount;
  const count = keyCount(track);
  const flat: number[] = [];
  for (let i = 0; i < count; i++) {
    flat.push(keyTime(track, i), ...keyValue(track, i));
  }
  const payload = [time, ...Array.from({ length: track.componentCount }, (_, c) => values[c] ?? 0)];
  let insertAt = flat.length;
  for (let i = 0; i < count; i++) {
    if (keyTime(track, i) > time) {
      insertAt = i * stride;
      break;
    }
  }
  flat.splice(insertAt, 0, ...payload);
  track.keys = flat;
  return Math.floor(insertAt / stride);
}

/** Xóa keyframe theo chỉ số; trả `false` nếu ngoài phạm vi. */
export function removeKey(track: AnimationTrack, index: number): boolean {
  const stride = 1 + track.componentCount;
  if (index < 0 || index >= keyCount(track)) return false;
  track.keys.splice(index * stride, stride);
  return true;
}

/** Giãn/nén thời gian toàn bộ keyframe theo hệ số (đổi FPS, scale clip). */
export function scaleKeyTimes(track: AnimationTrack, factor: number): void {
  if (!Number.isFinite(factor) || factor <= 0) return;
  const stride = 1 + track.componentCount;
  for (let i = 0; i < track.keys.length; i += stride) {
    track.keys[i] *= factor;
  }
}

/** Dời toàn bộ keyframe một lượng thời gian (offset). */
export function offsetKeyTimes(track: AnimationTrack, delta: number): void {
  const stride = 1 + track.componentCount;
  for (let i = 0; i < track.keys.length; i += stride) {
    track.keys[i] = Math.max(0, track.keys[i] + delta);
  }
}

/** Cắt track về đoạn `[start, end]` — luôn giữ key biên nội suy sẵn. */
export function sliceTrack(track: AnimationTrack, start: number, end: number): AnimationTrack {
  const count = keyCount(track);
  const stride = 1 + track.componentCount;
  const flat: number[] = [];
  // Key biên trái (nội suy) + các key nằm trong (start, end) + key biên phải.
  flat.push(start, ...evaluateTrack(track, start));
  for (let i = 0; i < count; i++) {
    const time = keyTime(track, i);
    if (time > start && time < end) {
      flat.push(time, ...keyValue(track, i));
    }
  }
  flat.push(end, ...evaluateTrack(track, end));
  return { ...track, keys: flat };
}

/** Tách keyframe track thành danh sách ScalarKeyframe (dành cho scalar). */
export function toScalarKeyframes(track: AnimationTrack): ScalarKeyframe[] {
  const count = keyCount(track);
  const result: ScalarKeyframe[] = [];
  for (let i = 0; i < count; i++) {
    result.push({ time: keyTime(track, i), value: evaluateScalar(track, keyTime(track, i)) });
  }
  return result;
}

/** Resample track đều theo bước `step` (giảm dữ liệu, chuẩn hóa nội suy). */
export function resampleTrack(track: AnimationTrack, step: number): AnimationTrack {
  const sampling = Math.max(1e-4, step);
  const duration = keyCount(track) > 0 ? keyTime(track, keyCount(track) - 1) : 0;
  const stride = 1 + track.componentCount;
  const flat: number[] = [];
  for (let time = 0; time <= duration + 1e-9; time += sampling) {
    flat.push(time, ...evaluateTrack(track, time));
  }
  return { ...track, interpolation: 'linear', keys: flat.length > 0 ? flat : new Array<number>(stride).fill(0) };
}

/** Thống kê nhanh track: số key, thời lượng, min/max giá trị (scalar). */
export function trackStats(track: AnimationTrack): {
  keys: number;
  duration: number;
  minValue: number;
  maxValue: number;
} {
  const count = keyCount(track);
  let minValue = Infinity;
  let maxValue = -Infinity;
  for (let i = 0; i < count; i++) {
    for (const value of keyValue(track, i)) {
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    }
  }
  return {
    keys: count,
    duration: count > 0 ? keyTime(track, count - 1) : 0,
    minValue: Number.isFinite(minValue) ? minValue : 0,
    maxValue: Number.isFinite(maxValue) ? maxValue : 0,
  };
}

/** Xây dựng track từ mẫu thời gian/giá trị đều (tiện nạp BVH/VMD/gltf). */
export function trackFromSamples(
  name: string,
  targetPath: string,
  kind: AnimationTrack['kind'],
  times: readonly number[],
  valuesPerKey: ReadonlyArray<readonly number[]>,
  interpolation: InterpolationKind = 'linear',
): AnimationTrack {
  const componentCount = trackStride(kind);
  const keys: number[] = [];
  for (let i = 0; i < times.length; i++) {
    keys.push(times[i] ?? 0);
    const values = valuesPerKey[i] ?? [];
    for (let c = 0; c < componentCount; c++) keys.push(values[c] ?? 0);
  }
  return { name, targetPath, kind, keys, componentCount, interpolation };
}

/** Track hằng giá trị (một keyframe) — dùng cho phần pose không động. */
export function constantTrack(
  name: string,
  targetPath: string,
  kind: AnimationTrack['kind'],
  values: readonly number[],
): AnimationTrack {
  return trackFromSamples(name, targetPath, kind, [0], [values], 'linear');
}
