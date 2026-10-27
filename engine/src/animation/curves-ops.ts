/**
 * @file curves-ops.ts
 * @module @aetheria/engine/animation/curves-ops
 * @description Phân tích và biên tập đường cong keyframe: đơn giản hóa
 * (Ramer–Douglas–Peucker), làm mượt (trung bình động), tạo vòng lặp liền mạch,
 * suy diễn track đạo hàm, bảng arc-length, đổi miền giá trị, so sánh hai track
 * và phát hiện đoạn hằng — công cụ tối ưu dữ liệu hoạt ảnh.
 */

import { clampRange } from '../deeplearning/random.js';
import { evaluateTrack, keyCount, keyTime, keyValue, resampleTrack, trackFromSamples } from './curve.js';
import type { AnimationTrack } from './types.js';

/** Đơn giản hóa track bằng Ramer–Douglas–Peucker trên giá trị scalar/vectors. */
export function simplifyTrack(track: AnimationTrack, tolerance = 0.01): AnimationTrack {
  const count = keyCount(track);
  if (count <= 2) return { ...track, keys: [...track.keys] };
  const keep = new Set<number>([0, count - 1]);
  rdpRange(track, 0, count - 1, tolerance, keep);
  const indices = [...keep].sort((a, b) => a - b);
  const keys: number[] = [];
  for (const index of indices) {
    keys.push(keyTime(track, index), ...keyValue(track, index));
  }
  return { ...track, keys };
}

/** RDP đệ quy trên chỉ số keyframe (khoảng cách vuông góc trong không gian giá trị). */
function rdpRange(track: AnimationTrack, start: number, end: number, tolerance: number, keep: Set<number>): void {
  if (end <= start + 1) return;
  const a = keyValue(track, start);
  const b = keyValue(track, end);
  let maxDistance = -1;
  let maxIndex = -1;
  for (let i = start + 1; i < end; i++) {
    const point = keyValue(track, i);
    const distance = pointToSegmentDistance(point, a, b);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }
  if (maxDistance > tolerance && maxIndex > 0) {
    keep.add(maxIndex);
    rdpRange(track, start, maxIndex, tolerance, keep);
    rdpRange(track, maxIndex, end, tolerance, keep);
  }
}

/** Khoảng cách từ điểm tới đoạn thẳng trong không gian N chiều. */
function pointToSegmentDistance(
  point: readonly number[],
  a: readonly number[],
  b: readonly number[],
): number {
  const ab = b.map((value, index) => value - (a[index] ?? 0));
  const ap = point.map((value, index) => value - (a[index] ?? 0));
  const abLengthSq = ab.reduce((sum, value) => sum + value * value, 0);
  if (abLengthSq < 1e-12) return Math.hypot(...ap);
  const t = clampRange(
    ap.reduce((sum, value, index) => sum + value * (ab[index] ?? 0), 0) / abLengthSq,
    0,
    1,
  );
  const projection = ab.map((value, index) => (a[index] ?? 0) + value * t);
  return Math.hypot(...point.map((value, index) => value - (projection[index] ?? value)));
}

/** Làm mượt track bằng trung bình động cửa sổ (giữ keyframe thời gian). */
export function smoothTrack(track: AnimationTrack, window = 3): AnimationTrack {
  const size = Math.max(1, Math.floor(window / 2));
  const count = keyCount(track);
  const keys: number[] = [];
  for (let i = 0; i < count; i++) {
    const from = Math.max(0, i - size);
    const to = Math.min(count - 1, i + size);
    const components = track.componentCount;
    const averaged = new Array<number>(components).fill(0);
    for (let j = from; j <= to; j++) {
      const value = keyValue(track, j);
      for (let c = 0; c < components; c++) averaged[c] += (value[c] ?? 0) / (to - from + 1);
    }
    keys.push(keyTime(track, i), ...averaged);
  }
  return { ...track, keys };
}

/** Biến track thành vòng lặp liền mạch: bù offset tuyến tính để đầu ≡ cuối. */
export function makeLoopable(track: AnimationTrack): AnimationTrack {
  const count = keyCount(track);
  if (count < 2) return { ...track, keys: [...track.keys] };
  const first = keyValue(track, 0);
  const last = keyValue(track, count - 1);
  const duration = keyTime(track, count - 1);
  const stride = 1 + track.componentCount;
  const keys = [...track.keys];
  for (let i = 0; i < count; i++) {
    const alpha = (keyTime(track, i)) / Math.max(duration, 1e-9);
    for (let c = 0; c < track.componentCount; c++) {
      keys[i * stride + 1 + c] = (keys[i * stride + 1 + c] ?? 0) +
        ((first[c] ?? 0) - (last[c] ?? 0)) * alpha;
    }
  }
  return { ...track, keys };
}

/** Phát hiện đoạn giá trị hằng (nén được): trả danh sách `[start, end]`. */
export function findConstantSegments(
  track: AnimationTrack,
  tolerance = 1e-4,
): Array<[number, number]> {
  const count = keyCount(track);
  const segments: Array<[number, number]> = [];
  let segmentStart: number | null = null;
  let reference: number[] | null = null;
  for (let i = 0; i < count; i++) {
    const value = keyValue(track, i);
    const referenceValue: number[] | null = reference;
    const isConstant = referenceValue !== null &&
      value.every((component, index) => Math.abs(component - (referenceValue[index] ?? 0)) <= tolerance);
    if (isConstant && segmentStart !== null) continue;
    if (isConstant && segmentStart === null) {
      segmentStart = keyTime(track, Math.max(0, i - 1));
      continue;
    }
    if (!isConstant && segmentStart !== null) {
      segments.push([segmentStart, keyTime(track, Math.max(0, i - 1))]);
      segmentStart = null;
    }
    reference = value;
  }
  if (segmentStart !== null) segments.push([segmentStart, keyTime(track, count - 1)]);
  return segments;
}

/** Suy diễn track đạo hàm (tốc độ) bằng sai phân giữa các keyframe. */
export function derivativeTrack(track: AnimationTrack, name?: string): AnimationTrack {
  const count = keyCount(track);
  const times: number[] = [];
  const values: number[][] = [];
  for (let i = 0; i < count - 1; i++) {
    const t0 = keyTime(track, i);
    const t1 = keyTime(track, i + 1);
    const span = Math.max(t1 - t0, 1e-9);
    const a = keyValue(track, i);
    const b = keyValue(track, i + 1);
    times.push((t0 + t1) / 2);
    values.push(b.map((value, index) => (value - (a[index] ?? value)) / span));
  }
  return trackFromSamples(
    name ?? `${track.name}_derivative`,
    track.targetPath,
    track.kind,
    times,
    values,
    'linear',
  );
}

/** Bảng arc-length tích lũy của track translation (3D) — cho vận tốc đều. */
export function arcLengthTable(track: AnimationTrack, steps = 64): { times: number[]; lengths: number[]; total: number } {
  const times: number[] = [];
  const lengths: number[] = [];
  let total = 0;
  let previous: number[] | null = null;
  const duration = keyCount(track) > 0 ? keyTime(track, keyCount(track) - 1) : 0;
  for (let i = 0; i <= steps; i++) {
    const time = (duration * i) / steps;
    const value = evaluateTrack(track, time);
    if (previous) {
      total += Math.hypot(
        (value[0] ?? 0) - (previous[0] ?? 0),
        (value[1] ?? 0) - (previous[1] ?? 0),
        (value[2] ?? 0) - (previous[2] ?? 0),
      );
    }
    times.push(time);
    lengths.push(total);
    previous = value;
  }
  return { times, lengths, total };
}

/** Thời điểm đạt tỉ lệ arc-length `ratio ∈ [0,1]` (cho di chuyển vận tốc đều). */
export function timeAtArcRatio(track: AnimationTrack, ratio: number, steps = 64): number {
  const table = arcLengthTable(track, steps);
  if (table.total <= 1e-9) return 0;
  const target = clampRange(ratio, 0, 1) * table.total;
  for (let i = 1; i < table.lengths.length; i++) {
    if (table.lengths[i] >= target) {
      const t0 = table.times[i - 1];
      const t1 = table.times[i];
      const span = Math.max(table.lengths[i] - table.lengths[i - 1], 1e-9);
      return t0 + ((target - table.lengths[i - 1]) / span) * (t1 - t0);
    }
  }
  return table.times[table.times.length - 1] ?? 0;
}

/** Đổi miền giá trị track từ `[inMin, inMax]` sang `[outMin, outMax]`. */
export function remapTrackValues(
  track: AnimationTrack,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): AnimationTrack {
  const inSpan = Math.max(inMax - inMin, 1e-9);
  const count = keyCount(track);
  const stride = 1 + track.componentCount;
  const keys = [...track.keys];
  for (let i = 0; i < count; i++) {
    for (let c = 0; c < track.componentCount; c++) {
      const index = i * stride + 1 + c;
      const normalized = ((keys[index] ?? 0) - inMin) / inSpan;
      keys[index] = outMin + normalized * (outMax - outMin);
    }
  }
  return { ...track, keys };
}

/** Cộng offset vào mọi giá trị (không đụng thời gian). */
export function offsetTrackValues(track: AnimationTrack, delta: number): AnimationTrack {
  const count = keyCount(track);
  const stride = 1 + track.componentCount;
  const keys = [...track.keys];
  for (let i = 0; i < count; i++) {
    for (let c = 0; c < track.componentCount; c++) {
      keys[i * stride + 1 + c] = (keys[i * stride + 1 + c] ?? 0) + delta;
    }
  }
  return { ...track, keys };
}

/** Nhân hệ số với mọi giá trị (biên độ). */
export function amplifyTrackValues(track: AnimationTrack, factor: number): AnimationTrack {
  return remapTrackValues(track, 0, 1, 0, factor);
}

/** Độ lệch tối đa giữa hai track trên cùng khoảng (kiểm chứng parity). */
export function maxTrackDeviation(
  a: AnimationTrack,
  b: AnimationTrack,
  start: number,
  end: number,
  steps = 32,
): number {
  let max = 0;
  for (let i = 0; i <= steps; i++) {
    const time = start + ((end - start) * i) / steps;
    const va = evaluateTrack(a, time);
    const vb = evaluateTrack(b, time);
    for (let c = 0; c < Math.max(va.length, vb.length); c++) {
      max = Math.max(max, Math.abs((va[c] ?? 0) - (vb[c] ?? 0)));
    }
  }
  return max;
}

/** Resample track về FPS cụ thể (chuẩn hóa dữ liệu trước khi export). */
export function resampleTrackAtFps(track: AnimationTrack, fps: number): AnimationTrack {
  return resampleTrack(track, 1 / Math.max(1, fps));
}
