/**
 * @file clip.ts
 * @module @aetheria/engine/animation/clip
 * @description `AnimationClip` — đơn vị hoạt ảnh tái sử dụng: tên, độ dài, tập
 * track và event. Cung cấp builder từ mẫu thời gian (nạp từ BVH/VMD/gltf qua
 * `asset-parser`), các phép biến đổi clip (cắt, giãn thời gian, đảo ngược, nối,
 * clone) và thống kê phục vụ UI/telemetry.
 */

import {
  evaluateTrack,
  insertKey,
  keyCount,
  keyTime,
  offsetKeyTimes,
  scaleKeyTimes,
  sliceTrack,
  trackFromSamples,
  trackStats,
} from './curve.js';
import type {
  AnimationClipData,
  AnimationEventKey,
  AnimationTrack,
  InterpolationKind,
  TrackValueKind,
} from './types.js';

/** Clip hoạt ảnh thao tác được (bọc `AnimationClipData` tuần tự hóa được). */
export class AnimationClip {
  public name: string;
  public duration: number;
  public readonly tracks: AnimationTrack[] = [];
  public readonly events: AnimationEventKey[] = [];
  public metadata: Record<string, unknown>;

  constructor(data: AnimationClipData) {
    if (!data.name.trim()) throw new TypeError('Clip cần tên');
    if (data.duration < 0) throw new RangeError('duration không được âm');
    this.name = data.name;
    this.duration = data.duration;
    this.metadata = { ...data.metadata };
    for (const track of data.tracks) this.tracks.push({ ...track, keys: [...track.keys] });
    for (const event of data.events ?? []) this.events.push({ ...event });
  }

  /** Tìm track theo tên; `null` nếu không có. */
  public findTrack(name: string): AnimationTrack | null {
    return this.tracks.find((track) => track.name === name) ?? null;
  }

  /** Thêm track; thay thế nếu trùng tên. */
  public addTrack(track: AnimationTrack): void {
    const existing = this.tracks.findIndex((item) => item.name === track.name);
    if (existing >= 0) this.tracks[existing] = { ...track, keys: [...track.keys] };
    else this.tracks.push({ ...track, keys: [...track.keys] });
    this.extendDuration(track);
  }

  /** Gắn sự kiện vào clip. */
  public addEvent(event: AnimationEventKey): void {
    this.events.push({ ...event });
    this.events.sort((a, b) => a.time - b.time);
  }

  /** Đánh giá mọi track tại thời điểm `time` → danh sách giá trị phẳng. */
  public sample(time: number): Map<string, number[]> {
    const result = new Map<string, number[]>();
    for (const track of this.tracks) {
      result.set(track.targetPath, evaluateTrack(track, time));
    }
    return result;
  }

  /** Cắt clip về đoạn `[start, end]` (giây). */
  public slice(start: number, end: number, slicedName = `${this.name}_slice`): AnimationClip {
    const clampedEnd = Math.min(Math.max(end, start), this.duration);
    const tracks = this.tracks.map((track) => sliceTrack(track, start, clampedEnd));
    const events = this.events
      .filter((event) => event.time >= start && event.time <= clampedEnd)
      .map((event) => ({ ...event, time: event.time - start }));
    return new AnimationClip({
      name: slicedName,
      duration: clampedEnd - start,
      tracks,
      events,
      metadata: { ...this.metadata, slicedFrom: this.name },
    });
  }

  /** Giãn/nén thời gian toàn clip theo hệ số. */
  public scaleTime(factor: number): AnimationClip {
    const tracks = this.tracks.map((track) => {
      const scaled = { ...track, keys: [...track.keys] };
      scaleKeyTimes(scaled, factor);
      return scaled;
    });
    return new AnimationClip({
      name: `${this.name}_x${factor.toFixed(3)}`,
      duration: this.duration * factor,
      tracks,
      events: this.events.map((event) => ({ ...event, time: event.time * factor })),
      metadata: { ...this.metadata },
    });
  }

  /** Đảo ngược clip (đổi chiều thời gian — dễ cho hiệu ứng ping-pong). */
  public reversed(): AnimationClip {
    const tracks = this.tracks.map((track) => {
      const reversed = { ...track, keys: [...track.keys] };
      offsetKeyTimes(reversed, this.duration);
      scaleKeyTimes(reversed, -1);
      offsetKeyTimes(reversed, 0);
      return reversed;
    });
    return new AnimationClip({
      name: `${this.name}_reverse`,
      duration: this.duration,
      tracks,
      events: this.events.map((event) => ({ ...event, time: this.duration - event.time })),
      metadata: { ...this.metadata },
    });
  }

  /** Nối clip khác vào cuối (cùng tập targetPath là lý tưởng). */
  public concatenated(other: AnimationClip, joinedName = `${this.name}+${other.name}`): AnimationClip {
    const tracks: AnimationTrack[] = [];
    for (const track of this.tracks) {
      const otherTrack = other.findTrack(track.name);
      if (!otherTrack) continue;
      const keys = [...track.keys];
      const stride = 1 + track.componentCount;
      const otherKeys = otherTrack.keys;
      for (let i = 0; i < otherKeys.length; i += stride) {
        keys.push(otherKeys[i] + this.duration);
        for (let c = 1; c < stride; c++) keys.push(otherKeys[i + c] ?? 0);
      }
      tracks.push({ ...track, keys });
    }
    const events = [
      ...this.events.map((event) => ({ ...event })),
      ...other.events.map((event) => ({ ...event, time: event.time + this.duration })),
    ];
    return new AnimationClip({
      name: joinedName,
      duration: this.duration + other.duration,
      tracks,
      events,
      metadata: { ...this.metadata, concatenatedWith: other.name },
    });
  }

  /** Bản sao độc lập. */
  public clone(): AnimationClip {
    return new AnimationClip(this.toData());
  }

  /** Xuất dữ liệu thuần tuần tự hóa được. */
  public toData(): AnimationClipData {
    return {
      name: this.name,
      duration: this.duration,
      tracks: this.tracks.map((track) => ({ ...track, keys: [...track.keys] })),
      events: this.events.map((event) => ({ ...event })),
      metadata: { ...this.metadata },
    };
  }

  /** Thống kê phục vụ UI: số track, số key, target path. */
  public stats(): {
    tracks: number;
    totalKeys: number;
    eventCount: number;
    targets: string[];
    perTrack: Array<{ name: string; keys: number; duration: number }>;
  } {
    const perTrack = this.tracks.map((track) => {
      const stats = trackStats(track);
      return { name: track.name, keys: stats.keys, duration: stats.duration };
    });
    return {
      tracks: this.tracks.length,
      totalKeys: perTrack.reduce((sum, item) => sum + item.keys, 0),
      eventCount: this.events.length,
      targets: [...new Set(this.tracks.map((track) => track.targetPath))],
      perTrack,
    };
  }

  /** Ép độ dài clip (giãn keyframe nếu cần). */
  public ensureDuration(duration: number): void {
    const target = Math.max(0, duration);
    if (target <= this.duration || this.duration <= 0) {
      this.duration = Math.max(this.duration, target);
      return;
    }
    const factor = target / this.duration;
    const scaled = this.scaleTime(factor);
    this.name = scaled.name;
    this.duration = scaled.duration;
    this.tracks.length = 0;
    for (const track of scaled.tracks) this.tracks.push(track);
  }

  /** Mở rộng duration nếu track vượt quá độ dài hiện tại. */
  private extendDuration(track: AnimationTrack): void {
    const count = keyCount(track);
    if (count === 0) return;
    this.duration = Math.max(this.duration, keyTime(track, count - 1));
  }
}

/** Builder: tạo clip từ mẫu thời gian/giá trị cho nhiều target path. */
export function buildClip(
  name: string,
  sources: ReadonlyArray<{
    targetPath: string;
    kind: TrackValueKind;
    times: readonly number[];
    values: ReadonlyArray<readonly number[]>;
    interpolation?: InterpolationKind;
  }>,
  options: { events?: AnimationEventKey[]; metadata?: Record<string, unknown> } = {},
): AnimationClip {
  let duration = 0;
  const tracks = sources.map((source) => {
    const track = trackFromSamples(
      source.targetPath,
      source.targetPath,
      source.kind,
      source.times,
      source.values,
      source.interpolation ?? 'linear',
    );
    duration = Math.max(duration, source.times[source.times.length - 1] ?? 0);
    return track;
  });
  return new AnimationClip({ name, duration, tracks, events: options.events, metadata: options.metadata });
}

/** Builder: clip "idle" hằng giá trị — giữ pose hiện tại. */
export function constantClip(
  name: string,
  bindings: ReadonlyArray<{ targetPath: string; kind: TrackValueKind; values: readonly number[] }>,
): AnimationClip {
  return new AnimationClip({
    name,
    duration: 0,
    tracks: bindings.map((binding) => ({
      name: binding.targetPath,
      targetPath: binding.targetPath,
      kind: binding.kind,
      keys: [0, ...binding.values],
      componentCount: binding.values.length,
      interpolation: 'linear',
    })),
  });
}

/** Chèn keyframe vào clip theo target path (tiện editor). */
export function insertClipKey(
  clip: AnimationClip,
  targetPath: string,
  time: number,
  values: readonly number[],
): boolean {
  const track = clip.findTrack(targetPath);
  if (!track) return false;
  insertKey(track, time, values);
  clip.ensureDuration(time);
  return true;
}

/** Gộp hai clip theo layer: clip trên override các path nó điều khiển. */
export function mergeClips(under: AnimationClip, over: AnimationClip, name?: string): AnimationClip {
  const merged = under.clone();
  merged.name = name ?? `${under.name}|${over.name}`;
  for (const track of over.tracks) merged.addTrack(track);
  for (const event of over.events) merged.addEvent(event);
  return merged;
}
