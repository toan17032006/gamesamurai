/**
 * @file timeline.ts
 * @module @aetheria/engine/animation/timeline
 * @description Timeline tổng hợp: xếp nhiều clip tại mốc thời gian, chuỗi tuần
 * tự, phát hiện chồng lấn, trích sub-timeline và scrub — dùng dựng cutscene /
 * chuỗi hành động của NPC.
 */

import { AnimationClip } from './clip.js';
import { clampRange } from '../deeplearning/random.js';

/** Một mục trên timeline. */
export interface TimelineEntry {
  clip: AnimationClip;
  /** Thời điểm bắt đầu trên timeline (giây). */
  start: number;
  /** Trọng số chơi (cho crossfade xếp chồng). */
  weight?: number;
  label?: string;
}

/** Timeline tổng hợp nhiều clip. */
export class AnimationTimeline {
  public readonly entries: TimelineEntry[] = [];

  /** Thêm clip tại mốc thời gian. */
  public add(clip: AnimationClip, start: number, options: { weight?: number; label?: string } = {}): void {
    this.entries.push({
      clip,
      start: Math.max(0, start),
      weight: options.weight ?? 1,
      label: options.label,
    });
  }

  /** Chuỗi tuần tự: nối clip sau cuối clip trước. */
  public appendSequential(clip: AnimationClip, label?: string): void {
    this.add(clip, this.duration, { label });
  }

  /** Tổng thời lượng timeline. */
  public get duration(): number {
    return this.entries.reduce(
      (max, entry) => Math.max(max, entry.start + entry.clip.duration),
      0,
    );
  }

  /** Các mục đang phát tại thời điểm t. */
  public activeAt(time: number): TimelineEntry[] {
    return this.entries.filter(
      (entry) => time >= entry.start && time <= entry.start + entry.clip.duration,
    );
  }

  /** Phát hiện các cặp mục chồng lấn về thời gian (debug/editor). */
  public overlaps(): Array<[TimelineEntry, TimelineEntry]> {
    const result: Array<[TimelineEntry, TimelineEntry]> = [];
    const sorted = [...this.entries].sort((a, b) => a.start - b.start);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        if (b.start < a.start + a.clip.duration) result.push([a, b]);
      }
    }
    return result;
  }

  /** Trích sub-timeline trong `[start, end]` (clip bị cắt theo biên). */
  public slice(start: number, end: number, name = 'timeline_slice'): AnimationTimeline {
    const sliced = new AnimationTimeline();
    const clampedEnd = Math.max(start, end);
    for (const entry of this.entries) {
      const entryEnd = entry.start + entry.clip.duration;
      if (entryEnd <= start || entry.start >= clampedEnd) continue;
      const localStart = Math.max(0, start - entry.start);
      const localEnd = Math.min(entry.clip.duration, clampedEnd - entry.start);
      sliced.add(
        entry.clip.slice(localStart, localEnd),
        Math.max(0, entry.start - start),
        { weight: entry.weight, label: entry.label },
      );
    }
    void name;
    return sliced;
  }

  /** Xuất dữ liệu tuần tự hóa được (checkpoint/UI). */
  public toData(): Array<{ clipName: string; start: number; duration: number; weight: number; label?: string }> {
    return this.entries.map((entry) => ({
      clipName: entry.clip.name,
      start: entry.start,
      duration: entry.clip.duration,
      weight: entry.weight ?? 1,
      ...(entry.label ? { label: entry.label } : {}),
    }));
  }
}

/** Builder chuỗi tuần tự nhanh từ danh sách clip. */
export function sequentialTimeline(clips: readonly AnimationClip[], gap = 0): AnimationTimeline {
  const timeline = new AnimationTimeline();
  let cursor = 0;
  for (const clip of clips) {
    timeline.add(clip, cursor);
    cursor += clip.duration + Math.max(0, gap);
  }
  return timeline;
}

/** Timeline trống type-safe. */
export function emptyTimeline(): AnimationTimeline {
  return new AnimationTimeline();
}

/** Thời điểm phù hợp chèn clip mới không chồng lấn (sau mục cuối). */
export function nextFreeSlot(timeline: AnimationTimeline, duration: number): number {
  let cursor = 0;
  const sorted = [...timeline.entries].sort((a, b) => a.start - b.start);
  for (const entry of sorted) {
    if (entry.start >= cursor + duration) return cursor;
    cursor = Math.max(cursor, entry.start + entry.clip.duration);
  }
  return cursor;
}

/** Scrub: giới hạn thời gian vào `[0, duration]` của timeline. */
export function scrubTime(timeline: AnimationTimeline, time: number): number {
  return clampRange(time, 0, timeline.duration);
}
