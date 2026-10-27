/**
 * @file samplers.ts
 * @module @aetheria/engine/animation/samplers
 * @description Bộ lấy mẫu (sampler) cho hoạt ảnh: đánh giá batch nhiều track,
 * đạo hàm/tốc độ, chuẩn hóa thời gian vòng lặp, pha chân (foot-phase), warp
 * thời gian (slow-motion theo đường cong), đồng bộ nhịp (beat sync) và thống
 * kê mẫu — phục vụ tầng render và gameplay đọc pose hiệu quả.
 */

import { clampRange } from '../deeplearning/random.js';
import { evaluateTrack, keyCount, keyTime, trackStride } from './curve.js';
import type { AnimationTrack, TrackEvaluation } from './types.js';

/** Kết quả lấy mẫu batch: giá trị theo từng target path. */
export interface BatchSample {
  time: number;
  evaluations: TrackEvaluation[];
}

/** Lấy mẫu nhiều track tại cùng thời điểm (batch cho tầng render). */
export function sampleTracksBatch(
  tracks: readonly AnimationTrack[],
  time: number,
): BatchSample {
  return {
    time,
    evaluations: tracks.map((track) => ({
      trackName: track.name,
      targetPath: track.targetPath,
      kind: track.kind,
      values: evaluateTrack(track, time),
    })),
  };
}

/** Lấy mẫu chuỗi thời điểm đều → mảng pose phẳng theo từng track. */
export function sampleTrackSeries(
  track: AnimationTrack,
  startTime: number,
  step: number,
  count: number,
): number[][] {
  const series: number[][] = [];
  for (let i = 0; i < Math.max(0, Math.floor(count)); i++) {
    series.push(evaluateTrack(track, startTime + i * step));
  }
  return series;
}

/** Đạo hàm số (tốc độ) của track tại thời điểm t — sai phân trung tâm. */
export function trackVelocity(track: AnimationTrack, time: number, epsilon = 1 / 120): number[] {
  const h = Math.max(1e-5, epsilon);
  const before = evaluateTrack(track, time - h);
  const after = evaluateTrack(track, time + h);
  return after.map((value, index) => (value - (before[index] ?? value)) / (2 * h));
}

/** Gia tốc (đạo hàm cấp 2) — sai phân trung tâm của velocity. */
export function trackAcceleration(track: AnimationTrack, time: number, epsilon = 1 / 60): number[] {
  const h = Math.max(1e-4, epsilon);
  const before = evaluateTrack(track, time - h);
  const center = evaluateTrack(track, time);
  const after = evaluateTrack(track, time + h);
  return center.map(
    (value, index) => ((after[index] ?? value) - 2 * value + (before[index] ?? value)) / (h * h),
  );
}

/** Chuẩn hóa thời gian theo wrap mode — hàm thuần dùng mọi nơi. */
export function normalizeLoopTime(time: number, duration: number, mode: 'loop' | 'ping-pong' | 'clamp' | 'once'): number {
  const clipped = Math.max(1e-9, duration);
  if (mode === 'clamp' || mode === 'once') return clampRange(time, 0, clipped);
  if (mode === 'ping-pong') {
    const cycle = 2 * clipped;
    const phase = ((time % cycle) + cycle) % cycle;
    return phase <= clipped ? phase : cycle - phase;
  }
  const phase = ((time % clipped) + clipped) % clipped;
  return phase;
}

/** Pha chuẩn hóa trong vòng lặp `[0, 1)` — dùng cho foot-phase/blend theo pha. */
export function cyclicPhase(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop') / Math.max(1e-9, duration);
}

/**
 * Pha chân từ track translation: trả `[0, 1)` — 0 khi chân ở điểm thấp nhất
 * trong chu kỳ (đổ bộ mặt đất). Dùng sync bước chân với event 'footstep'.
 */
export function footPhase(verticalTrack: AnimationTrack, time: number, duration: number): number {
  const count = keyCount(verticalTrack);
  if (count === 0) return 0;
  let lowestTime = 0;
  let lowestValue = Infinity;
  const stride = trackStride('vector3') + 1;
  void stride;
  for (let i = 0; i < count; i++) {
    const value = evaluateTrack(verticalTrack, keyTime(verticalTrack, i))[1]
      ?? evaluateTrack(verticalTrack, keyTime(verticalTrack, i))[0] ?? 0;
    if (value < lowestValue) {
      lowestValue = value;
      lowestTime = keyTime(verticalTrack, i);
    }
  }
  const phase = cyclicPhase(time - lowestTime, duration);
  return phase;
}

/** Warp thời gian theo đường cong tốc độ: `warped = ∫ speed(u) du` xấp xỉ. */
export function timeWarp(
  baseTime: number,
  speedCurve: ReadonlyArray<{ time: number; speed: number }>,
  step = 1 / 60,
): number {
  const sorted = [...speedCurve].sort((a, b) => a.time - b.time);
  if (sorted.length === 0) return baseTime;
  let warped = 0;
  for (let t = 0; t < baseTime; t += step) {
    const sample = Math.min(t, baseTime);
    warped += speedAt(sorted, sample) * Math.min(step, baseTime - sample);
  }
  return warped;
}

/** Tốc độ tức thời từ bảng speed curve (nội suy tuyến tính). */
export function speedAt(
  curve: ReadonlyArray<{ time: number; speed: number }>,
  time: number,
): number {
  if (curve.length === 0) return 1;
  if (time <= curve[0].time) return curve[0].speed;
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i];
    const b = curve[i + 1];
    if (time >= a.time && time <= b.time) {
      const span = Math.max(b.time - a.time, 1e-9);
      const alpha = (time - a.time) / span;
      return a.speed + (b.speed - a.speed) * alpha;
    }
  }
  return curve[curve.length - 1].speed;
}

/** Đồng bộ nhịp: trả thời điểm clip gần nhất khớp BPM (giây mỗi nhịp). */
export function beatsPerSecond(bpm: number): number {
  return Math.max(1e-6, bpm / 60);
}

/** Dịch thời gian để mốc clip khớp nhịp nhạc gần nhất. */
export function snapToBeat(time: number, bpm: number, offset = 0): number {
  const beat = beatsPerSecond(bpm);
  return Math.round((time - offset) / beat) * beat + offset;
}

/** Kiểm tra track có tuần hoàn (loop) sạch: giá trị đầu ≡ cuối trong dung sai. */
export function isCyclic(track: AnimationTrack, tolerance = 1e-3): boolean {
  const count = keyCount(track);
  if (count < 2) return false;
  const first = evaluateTrack(track, keyTime(track, 0));
  const last = evaluateTrack(track, keyTime(track, count - 1));
  return first.every((value, index) => Math.abs(value - (last[index] ?? value)) <= tolerance);
}

/** Thời lượng chu kỳ ước lượng: khoảng cách giữa hai đỉnh (scalar track). */
export function estimateCycleDuration(track: AnimationTrack): number {
  const count = keyCount(track);
  if (count < 3) return 0;
  const peaks: number[] = [];
  for (let i = 1; i < count - 1; i++) {
    const prev = evaluateTrack(track, keyTime(track, i - 1))[0] ?? 0;
    const current = evaluateTrack(track, keyTime(track, i))[0] ?? 0;
    const next = evaluateTrack(track, keyTime(track, i + 1))[0] ?? 0;
    if (current > prev && current >= next) peaks.push(keyTime(track, i));
  }
  if (peaks.length < 2) return 0;
  const gaps = peaks.slice(1).map((peak, index) => peak - peaks[index]);
  return gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
}

/** Giá trị trung bình của track trên khoảng (mean pooling cho telemetry). */
export function averageTrackValue(track: AnimationTrack, start: number, end: number, steps = 32): number {
  if (steps <= 0) return 0;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    sum += evaluateTrack(track, start + ((end - start) * i) / steps)[0] ?? 0;
  }
  return sum / steps;
}

/** Giá trị lớn nhất/nhỏ nhất trên khoảng (cho camera shake bounds...). */
export function trackRangeOnInterval(
  track: AnimationTrack,
  start: number,
  end: number,
  steps = 32,
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i <= Math.max(1, steps); i++) {
    const value = evaluateTrack(track, start + ((end - start) * i) / Math.max(1, steps))[0] ?? 0;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 0 };
}
