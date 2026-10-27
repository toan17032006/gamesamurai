/**
 * @file events.ts
 * @module @aetheria/engine/animation/events
 * @description Tiện ích track sự kiện hoạt ảnh: dựng event track từ bảng thời
 * gian (footstep, shoot...), chuẩn hóa/sắp xếp, phát event trong khung thời gian
 * (wrap-aware) và gán vào clip. Event là tín hiệu gameplay gắn mốc thời gian —
 * độc lập với giá trị track.
 */

import { clampRange } from '../deeplearning/random.js';
import type { AnimationEventKey } from './types.js';

/** Bảng sự kiện: tên + thời điểm + payload. */
export interface EventScheduleEntry {
  name: string;
  time: number;
  payload?: Record<string, unknown>;
}

/** Dựng danh sách AnimationEventKey từ bảng gọn (sắp xếp theo time). */
export function buildEventTrack(entries: readonly EventScheduleEntry[]): AnimationEventKey[] {
  return entries
    .map((entry) => ({
      time: Math.max(0, entry.time),
      name: entry.name,
      payload: entry.payload ? { ...entry.payload } : undefined,
    }))
    .sort((a, b) => a.time - b.time);
}

/** Gắn event track vào clip (thay thế danh sách hiện có). */
export function assignEventTrack(clip: { events: AnimationEventKey[] }, entries: readonly EventScheduleEntry[]): void {
  clip.events.splice(0, clip.events.length, ...buildEventTrack(entries));
}

/** Phát event trong khung thời gian `[previousTime, currentTime]` (xuôi). */
export function eventsInWindow(
  events: readonly { time: number; name: string; payload?: Record<string, unknown> }[],
  previousTime: number,
  currentTime: number,
): Array<{ time: number; name: string; payload?: Record<string, unknown> }> {
  const from = Math.min(previousTime, currentTime);
  const to = Math.max(previousTime, currentTime);
  return events.filter((event) => event.time > from && event.time <= to);
}

/**
 * Phát event wrap-aware cho clip lặp: khung `[prev, curr]` có thể vượt qua
 * cuối clip — phần sự kiện sau điểm wrap được phát trước phần đầu vòng.
 */
export function eventsInLoopedWindow(
  events: readonly { time: number; name: string; payload?: Record<string, unknown> }[],
  previousTime: number,
  currentTime: number,
  duration: number,
): Array<{ time: number; name: string; payload?: Record<string, unknown> }> {
  const clippedDuration = Math.max(duration, 1e-9);
  const prev = clampRange(previousTime % clippedDuration, 0, clippedDuration);
  const curr = clampRange(currentTime % clippedDuration, 0, clippedDuration);
  if (curr >= prev) return eventsInWindow(events, prev, curr);
  const afterWrap = events.filter((event) => event.time > prev && event.time <= clippedDuration);
  const beforeWrap = events.filter((event) => event.time >= 0 && event.time <= curr);
  return [...afterWrap, ...beforeWrap];
}

/** Đếm số lần một event được phát trong khoảng thời gian dài (telemetry). */
export function countEventOccurrences(
  events: readonly { time: number; name: string }[],
  eventName: string,
  duration: number,
  elapsed: number,
): number {
  const inOnePass = events.filter((event) => event.name === eventName).length;
  const loops = Math.floor(elapsed / Math.max(duration, 1e-9));
  return inOnePass * loops;
}

/** Gộp nhiều event track và loại trùng (time, name) — dùng khi ghép clip. */
export function mergeEventTracks(
  tracks: ReadonlyArray<readonly { time: number; name: string; payload?: Record<string, unknown> }[]>,
): AnimationEventKey[] {
  const seen = new Set<string>();
  const merged: AnimationEventKey[] = [];
  for (const track of tracks) {
    for (const event of track) {
      const key = `${event.time}:${event.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ time: event.time, name: event.name, payload: event.payload ? { ...event.payload } : undefined });
    }
  }
  return merged.sort((a, b) => a.time - b.time);
}

/** Dời toàn bộ event track một lượng thời gian. */
export function offsetEventTrack(
  events: readonly { time: number; name: string; payload?: Record<string, unknown> }[],
  delta: number,
): AnimationEventKey[] {
  return events
    .map((event) => ({ ...event, time: Math.max(0, event.time + delta) }))
    .sort((a, b) => a.time - b.time);
}

/** Lọc event theo tên (tiện debug một loại tín hiệu). */
export function filterEventsByName(
  events: readonly { time: number; name: string; payload?: Record<string, unknown> }[],
  name: string,
): AnimationEventKey[] {
  return events.filter((event) => event.name === name).map((event) => ({ ...event }));
}
