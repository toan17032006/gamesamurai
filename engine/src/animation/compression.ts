/**
 * @file compression.ts
 * @module @aetheria/engine/animation/compression
 * @description Nén dữ liệu hoạt ảnh: lượng tử hóa keyframe 8/16-bit, giảm keyframe
 * theo dung sai sai số, mã hóa đoạn hằng (RLE) và đóng gói/mở gói — giảm dung
 * lượng checkpoint/network-sync của clip.
 */

import { clampRange } from '../deeplearning/random.js';
import { evaluateTrack, keyCount, keyTime, keyValue, trackFromSamples } from './curve.js';
import type { AnimationTrack } from './types.js';

/** Kết quả nén track. */
export interface CompressionResult {
  track: AnimationTrack;
  originalKeys: number;
  compressedKeys: number;
  ratio: number;
  /** Sai số tối đa giữa bản nén và bản gốc (đo sample). */
  maxError: number;
}

/** Lượng tử hóa giá trị keyframe về k-bit với per-track absmax (tại bản sao). */
export function quantizeTrack(track: AnimationTrack, bits: 8 | 16): AnimationTrack {
  const levels = 2 ** (bits - 1) - 1;
  const count = keyCount(track);
  const stride = 1 + track.componentCount;
  const keys = [...track.keys];
  for (let c = 0; c < track.componentCount; c++) {
    let absMax = 0;
    for (let i = 0; i < count; i++) {
      absMax = Math.max(absMax, Math.abs(keys[i * stride + 1 + c] ?? 0));
    }
    if (absMax <= 1e-12) continue;
    const step = absMax / levels;
    for (let i = 0; i < count; i++) {
      const index = i * stride + 1 + c;
      keys[index] = Math.round((keys[index] ?? 0) / step) * step;
    }
  }
  return { ...track, keys };
}

/**
 * Giảm keyframe theo dung sai: giữ key nếu giá trị nội suy tuyến tính giữa hai
 * key giữ lệch quá `tolerance` (greedy từ trái sang phải).
 */
export function reduceTrackKeys(track: AnimationTrack, tolerance = 0.01): AnimationTrack {
  const count = keyCount(track);
  if (count <= 2) return { ...track, keys: [...track.keys] };
  const stride = 1 + track.componentCount;
  const keys: number[] = [];
  let anchor = 0;
  keys.push(keyTime(track, 0), ...keyValue(track, 0));
  for (let i = 1; i < count - 1; i++) {
    const time = keyTime(track, i);
    const anchorTime = keyTime(track, anchor);
    const nextTime = keyTime(track, i + 1);
    const anchorValue = keyValue(track, anchor);
    const nextValue = keyValue(track, i + 1);
    const span = Math.max(nextTime - anchorTime, 1e-9);
    const alpha = (time - anchorTime) / span;
    const predicted = anchorValue.map((value, c) => value + ((nextValue[c] ?? value) - value) * alpha);
    const actual = keyValue(track, i);
    const error = Math.max(...actual.map((value, c) => Math.abs(value - (predicted[c] ?? value))));
    if (error > tolerance) {
      keys.push(time, ...actual);
      anchor = i;
    }
  }
  keys.push(keyTime(track, count - 1), ...keyValue(track, count - 1));
  return { ...track, keys };
}

/** Nén track kết hợp: lượng tử hóa + giảm key; trả thống kê. */
export function compressTrack(
  track: AnimationTrack,
  options: { bits?: 8 | 16; tolerance?: number; probeSteps?: number } = {},
): CompressionResult {
  const originalKeys = keyCount(track);
  const quantized = options.bits ? quantizeTrack(track, options.bits) : track;
  const reduced = options.tolerance ? reduceTrackKeys(quantized, options.tolerance) : quantized;
  const probeSteps = options.probeSteps ?? 64;
  const duration = originalKeys > 0 ? keyTime(track, keyCount(track) - 1) : 0;
  let maxError = 0;
  for (let i = 0; i <= probeSteps; i++) {
    const time = (duration * i) / probeSteps;
    const original = evaluateTrack(track, time);
    const compressed = evaluateTrack(reduced, time);
    for (let c = 0; c < Math.max(original.length, compressed.length); c++) {
      maxError = Math.max(maxError, Math.abs((original[c] ?? 0) - (compressed[c] ?? 0)));
    }
  }
  return {
    track: reduced,
    originalKeys,
    compressedKeys: keyCount(reduced),
    ratio: originalKeys > 0 ? keyCount(reduced) / originalKeys : 1,
    maxError,
  };
}

/** Mã hóa độ dài run cho chuỗi giá trị hằng (RLE số học, phục vụ lưu trữ). */
export function runLengthEncode(values: readonly number[], tolerance = 1e-6): Array<{ value: number; count: number }> {
  const runs: Array<{ value: number; count: number }> = [];
  for (const value of values) {
    const last = runs[runs.length - 1];
    if (last && Math.abs(last.value - value) <= tolerance) last.count++;
    else runs.push({ value, count: 1 });
  }
  return runs;
}

/** Giải mã RLE thành chuỗi giá trị. */
export function runLengthDecode(runs: ReadonlyArray<{ value: number; count: number }>): number[] {
  const values: number[] = [];
  for (const run of runs) {
    for (let i = 0; i < run.count; i++) values.push(run.value);
  }
  return values;
}

/** Đóng gói mảng float thành Int16 lượng tử (mỗi phần tử scale riêng toàn cục). */
export function packFloat16(values: readonly number[]): { quantized: Int16Array; scale: number } {
  const absMax = Math.max(...values.map((value) => Math.abs(value)), 1e-12);
  const scale = absMax / 32767;
  const quantized = new Int16Array(values.length);
  for (let i = 0; i < values.length; i++) {
    quantized[i] = Math.round((values[i] ?? 0) / scale);
  }
  return { quantized, scale };
}

/** Mở gói Int16 lượng tử về float (kèm scale đã lưu). */
export function unpackFloat16(quantized: Int16Array, scale: number): number[] {
  return Array.from(quantized, (value) => value * scale);
}

/** Thống kê nén toàn clip: tổng key trước/sau (không đổi clip gốc). */
export function compressClipStats(
  tracks: readonly AnimationTrack[],
  options: { bits?: 8 | 16; tolerance?: number } = {},
): { totalBefore: number; totalAfter: number; ratio: number; maxError: number } {
  let totalBefore = 0;
  let totalAfter = 0;
  let maxError = 0;
  for (const track of tracks) {
    const result = compressTrack(track, options);
    totalBefore += result.originalKeys;
    totalAfter += result.compressedKeys;
    maxError = Math.max(maxError, result.maxError);
  }
  return {
    totalBefore,
    totalAfter,
    ratio: totalBefore > 0 ? totalAfter / totalBefore : 1,
    maxError,
  };
}

/** Tái dựng track từ mẫu đã nén (tiện sau khi unpack). */
export function rebuildTrack(
  name: string,
  targetPath: string,
  kind: AnimationTrack['kind'],
  times: readonly number[],
  values: ReadonlyArray<readonly number[]>,
): AnimationTrack {
  return trackFromSamples(name, targetPath, kind, times, values, 'linear');
}

/** Giới hạn số keyframe tối đa (downsample nếu vượt). */
export function capTrackKeys(track: AnimationTrack, maxKeys: number): AnimationTrack {
  const count = keyCount(track);
  if (count <= Math.max(2, maxKeys)) return { ...track, keys: [...track.keys] };
  const step = count / Math.max(2, maxKeys);
  const stride = 1 + track.componentCount;
  const keys: number[] = [];
  for (let i = 0; i < maxKeys; i++) {
    const index = Math.min(count - 1, Math.floor(i * step));
    keys.push(keyTime(track, index), ...keyValue(track, index));
  }
  // Luôn giữ key cuối.
  const last = count - 1;
  keys.push(keyTime(track, last), ...keyValue(track, last));
  void clampRange;
  return { ...track, keys };
}
