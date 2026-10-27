/**
 * @file root-motion.ts
 * @module @aetheria/engine/animation/root-motion
 * @description Root motion: tách/chuyển chuyển động dịch chuyển của xương gốc
 * ra khỏi clip (để vật lý/điều khiển gameplay đảm nhiệm), tích lũy displacement
 * theo thời gian và áp dịch chuyển tích lũy vào transform của object.
 */

import { evaluateTrack, keyCount, keyTime } from './curve.js';
import { AnimationClip } from './clip.js';
import type { AnimationTrack } from './types.js';

/** Kết quả tách root motion. */
export interface RootMotionExtraction {
  /** Clip sau khi đã bỏ track gốc (giữ các track khác). */
  clip: AnimationClip;
  /** Track displacement tích lũy theo thời gian `[time, x, y, z]`. */
  displacementTrack: AnimationTrack;
  /** Tổng displacement cuối chu kỳ. */
  totalDisplacement: [number, number, number];
}

/** Tìm track translation của xương gốc trong clip. */
export function findRootTrack(clip: AnimationClip, rootBone = 'root'): AnimationTrack | null {
  return (
    clip.findTrack(`${rootBone}.translation`) ??
    clip.findTrack('root.translation') ??
    clip.findTrack('hips.translation') ??
    clip.tracks.find((track) => track.targetPath.endsWith('.translation')) ??
    null
  );
}

/**
 * Tách root motion khỏi clip: bỏ track translation gốc và thay bằng track
 * displacement tích lũy (điểm đầu = 0) — gameplay đọc displacement để di chuyển
 * object thật, tầng render không nhân đôi chuyển động.
 */
export function extractRootMotion(clip: AnimationClip, rootBone = 'root', name?: string): RootMotionExtraction {
  const rootTrack = findRootTrack(clip, rootBone);
  const remainingTracks: AnimationTrack[] = [];
  for (const track of clip.tracks) {
    if (rootTrack && track.targetPath === rootTrack.targetPath) continue;
    remainingTracks.push({ ...track, keys: [...track.keys] });
  }

  const times: number[] = [];
  const displacements: number[][] = [];
  let accumulated: [number, number, number] = [0, 0, 0];
  let previous: [number, number, number] = [0, 0, 0];
  if (rootTrack) {
    const count = keyCount(rootTrack);
    for (let i = 0; i < count; i++) {
      const time = keyTime(rootTrack, i);
      const values = evaluateTrack(rootTrack, time);
      if (i > 0) {
        accumulated = [
          accumulated[0] + (values[0] ?? 0) - previous[0],
          accumulated[1] + (values[1] ?? 0) - previous[1],
          accumulated[2] + (values[2] ?? 0) - previous[2],
        ];
      }
      previous = [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0];
      times.push(time);
      displacements.push([...accumulated]);
    }
  } else {
    times.push(0, clip.duration);
    displacements.push([0, 0, 0], [0, 0, 0]);
  }

  const displacementTrack: AnimationTrack = {
    name: 'rootMotion.displacement',
    targetPath: 'rootMotion.displacement',
    kind: 'vector3',
    keys: times.flatMap((time, index) => [time, ...(displacements[index] ?? [0, 0, 0])]),
    componentCount: 3,
    interpolation: 'linear',
  };

  return {
    clip: new AnimationClip({
      name: name ?? `${clip.name}_rootmotion_free`,
      duration: clip.duration,
      tracks: remainingTracks,
      events: clip.events.map((event) => ({ ...event })),
      metadata: { ...clip.metadata, rootMotionExtracted: true, rootBone: rootTrack?.targetPath ?? null },
    }),
    displacementTrack,
    totalDisplacement: accumulated,
  };
}

/** Vị trí displacement tại thời điểm t (nội suy tuyến tính trên track tích lũy). */
export function sampleRootDisplacement(extraction: RootMotionExtraction, time: number): [number, number, number] {
  const values = evaluateTrack(extraction.displacementTrack, time);
  return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0];
}

/** Tốc độ di chuyển trung bình của root (độ dài displacement / duration). */
export function averageRootSpeed(extraction: RootMotionExtraction): number {
  if (extraction.clip.duration <= 1e-9) return 0;
  const [x, y, z] = extraction.totalDisplacement;
  return Math.hypot(x, y, z) / extraction.clip.duration;
}

/** Tích lũy displacement giữa hai mốc thời gian (cho gameplay frame update). */
export function displacementBetween(
  extraction: RootMotionExtraction,
  fromTime: number,
  toTime: number,
): [number, number, number] {
  const from = sampleRootDisplacement(extraction, fromTime);
  const to = sampleRootDisplacement(extraction, toTime);
  return [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
}

/** Áp displacement vào một matrix transform column-major 16 floats (tại chỗ). */
export function applyDisplacementToMatrix(
  matrix: Float32Array,
  displacement: readonly number[],
): void {
  matrix[12] = (matrix[12] ?? 0) + (displacement[0] ?? 0);
  matrix[13] = (matrix[13] ?? 0) + (displacement[1] ?? 0);
  matrix[14] = (matrix[14] ?? 0) + (displacement[2] ?? 0);
}

/** Loại hoàn toàn các track của xương gốc (giữ rotation/scale nếu cần). */
export function stripRootTracks(clip: AnimationClip, rootBone = 'root'): AnimationClip {
  const prefix = `${rootBone}.`;
  const tracks = clip.tracks
    .filter((track) => track.targetPath !== `${rootBone}.translation`)
    .map((track) => ({ ...track, keys: [...track.keys] }));
  void prefix;
  return new AnimationClip({
    name: `${clip.name}_stripped`,
    duration: clip.duration,
    tracks,
    events: clip.events.map((event) => ({ ...event })),
    metadata: { ...clip.metadata, rootStripped: rootBone },
  });
}
