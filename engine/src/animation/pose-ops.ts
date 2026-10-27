/**
 * @file pose-ops.ts
 * @module @aetheria/engine/animation/pose-ops
 * @description Đại số pose: biến đổi giá trị pose theo pattern đường dẫn
 * (dịch/xoay/scale có chọn lọc), đối xứng gương (mirror) theo trục, đo khoảng
 * cách/độ lệch giữa hai pose, hiệu pose (delta), ghép chuỗi pose, nội suy chuỗi
 * và tiện ích hierarchy — phục vụ hiệu chỉnh animation tại runtime.
 */

import { clampRange } from '../deeplearning/random.js';
import { lerp, quatSlerpVector } from './curve.js';
import type { AnimationPose, TrackEvaluation, TrackValueKind } from './types.js';

/** Kiểu biến đổi áp lên giá trị pose. */
export type PoseValueTransform = (values: number[], path: string) => number[];

/** Áp biến transform lên mọi binding của pose (trả pose mới). */
export function transformPose(pose: AnimationPose, transform: PoseValueTransform): AnimationPose {
  const result: AnimationPose = { bindings: new Map(), firedEvents: [...pose.firedEvents] };
  for (const [path, evaluation] of pose.bindings) {
    result.bindings.set(path, {
      ...evaluation,
      values: transform([...evaluation.values], path),
    });
  }
  return result;
}

/** Dịch toàn bộ track translation (pattern `*.translation`) một offset. */
export function translatePose(
  pose: AnimationPose,
  offset: readonly number[],
  bonePattern?: RegExp,
): AnimationPose {
  return transformPose(pose, (values, path) => {
    if (!path.endsWith('.translation')) return values;
    if (bonePattern && !bonePattern.test(path)) return values;
    return values.map((value, index) => value + (offset[index] ?? 0));
  });
}

/** Scale toàn bộ translation (rig khác kích thước). */
export function scalePoseTranslation(pose: AnimationPose, factor: number): AnimationPose {
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? values.map((value) => value * factor) : values);
}

/** Scale toàn bộ scale-track (phục vụ squash/stretch). */
export function scalePoseScale(pose: AnimationPose, factor: number, bonePattern?: RegExp): AnimationPose {
  return transformPose(pose, (values, path) => {
    if (!path.endsWith('.scale')) return values;
    if (bonePattern && !bonePattern.test(path)) return values;
    return values.map((value) => value * factor);
  });
}

/** Trục đối xứng cho mirror: 'x' | 'y' | 'z'. */
export type MirrorAxis = 'x' | 'y' | 'z';

/**
 * Gương pose theo trục: dịch thành phần tương ứng đổi dấu, quaternion đổi dấu
 * thành phần yaw/pitch (mirror quay quanh trục gương), đổi tên xương trái↔phải
 * nếu `swapSides` bật.
 */
export function mirrorPose(pose: AnimationPose, axis: MirrorAxis, swapSides = true): AnimationPose {
  const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
  const sidePattern = /(left|right|_l|_r|\.l|\.r)(\.|$)/i;
  const result: AnimationPose = { bindings: new Map(), firedEvents: [...pose.firedEvents] };
  for (const [path, evaluation] of pose.bindings) {
    const newPath = swapSides ? swapSidesInPath(path, sidePattern) : path;
    let values = [...evaluation.values];
    if (path.endsWith('.translation')) {
      values[axisIndex] = -values[axisIndex];
    } else if (path.endsWith('.rotation') && evaluation.kind === 'quaternion') {
      // Mirror quaternion: đổi dấu hai thành phần không thuộc trục gương.
      const flip = [1, 1, 1, 1];
      if (axis === 'x') { flip[2] = -1; flip[3] = -1; }
      else if (axis === 'y') { flip[0] = -1; flip[3] = -1; }
      else { flip[0] = -1; flip[1] = -1; }
      values = values.map((value, index) => value * flip[index]);
    }
    result.bindings.set(newPath, { ...evaluation, values });
  }
  return result;
}

/** Đổi trái↔phải trong path (hips.translation giữ nguyên). */
function swapSidesInPath(path: string, pattern: RegExp): string {
  return path.replace(pattern, (match, side, suffix) => {
    const lower = side.toLowerCase();
    if (lower === 'left' || lower === '_l' || lower === '.l') {
      return match.replace(side, lower === 'left' ? 'right' : '_r');
    }
    return match.replace(side, lower === 'right' ? 'left' : '_l');
  }) as string;
}

/** Khoảng cách L2 giữa hai pose (chỉ trên path chung). */
export function poseDistance(a: AnimationPose, b: AnimationPose): number {
  let sum = 0;
  for (const [path, evaluation] of a.bindings) {
    const other = b.bindings.get(path);
    if (!other) continue;
    for (let i = 0; i < evaluation.values.length; i++) {
      const diff = (evaluation.values[i] ?? 0) - (other.values[i] ?? 0);
      sum += diff * diff;
    }
  }
  return Math.sqrt(sum);
}

/** Hiệu pose `a − b` theo từng path (additive delta). */
export function poseDelta(a: AnimationPose, b: AnimationPose): AnimationPose {
  const result: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const [path, evaluation] of a.bindings) {
    const other = b.bindings.get(path);
    result.bindings.set(path, {
      ...evaluation,
      values: evaluation.values.map((value, index) => value - (other?.values[index] ?? 0)),
    });
  }
  return result;
}

/** Ghép chuỗi pose nối tiếp theo thời lượng mỗi pose (dùng dựng timeline). */
export function concatPoseStreams(
  streams: ReadonlyArray<{ pose: AnimationPose; duration: number }>,
  time: number,
): AnimationPose {
  const total = streams.reduce((sum, stream) => sum + Math.max(0, stream.duration), 0);
  let cursor = clampRange(time, 0, total);
  for (const stream of streams) {
    if (cursor <= stream.duration) {
      return stream.pose;
    }
    cursor -= stream.duration;
  }
  return streams.length > 0 ? streams[streams.length - 1].pose : emptyPoseSafe();
}

function emptyPoseSafe(): AnimationPose {
  return { bindings: new Map(), firedEvents: [] };
}

/** Nội suy chuỗi pose theo danh sách mốc thời gian (catmull-like tuyến tính). */
export function interpolatePoseSeries(
  samples: ReadonlyArray<{ time: number; pose: AnimationPose }>,
  time: number,
): AnimationPose {
  if (samples.length === 0) return emptyPoseSafe();
  if (time <= samples[0].time) return samples[0].pose;
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    if (time >= a.time && time <= b.time) {
      const span = Math.max(b.time - a.time, 1e-9);
      const alpha = (time - a.time) / span;
      const merged: AnimationPose = { bindings: new Map(), firedEvents: [...a.pose.firedEvents, ...b.pose.firedEvents] };
      const paths = new Set([...a.pose.bindings.keys(), ...b.pose.bindings.keys()]);
      for (const path of paths) {
        const ea = a.pose.bindings.get(path);
        const eb = b.pose.bindings.get(path);
        const kind: TrackValueKind = ea?.kind ?? eb?.kind ?? 'scalar';
        if (ea && eb && kind === 'quaternion') {
          merged.bindings.set(path, {
            trackName: path,
            targetPath: path,
            kind,
            values: quatSlerpVector(ea.values, eb.values, alpha),
          });
        } else {
          merged.bindings.set(path, {
            trackName: path,
            targetPath: path,
            kind,
            values: ea && eb
              ? ea.values.map((value, index) => lerp(value, eb.values[index] ?? value, alpha))
              : (ea ?? eb)?.values ?? [],
          });
        }
      }
      return merged;
    }
  }
  return samples[samples.length - 1].pose;
}

/** Lấy danh sách path mà pose điều khiển. */
export function posePaths(pose: AnimationPose): string[] {
  return [...pose.bindings.keys()].sort();
}

/** Đếm số binding và tổng số thành phần (telemetry pose). */
export function poseStats(pose: AnimationPose): { bindings: number; components: number } {
  let components = 0;
  for (const evaluation of pose.bindings.values()) components += evaluation.values.length;
  return { bindings: pose.bindings.size, components };
}

/** Pose rỗng type-safe. */
export function createEmptyPose(): AnimationPose {
  return { bindings: new Map(), firedEvents: [] };
}

/** Đóng gói evaluation nhanh (dựng pose thủ công). */
export function makeEvaluation(
  targetPath: string,
  kind: TrackValueKind,
  values: readonly number[],
): TrackEvaluation {
  return { trackName: targetPath, targetPath, kind, values: [...values] };
}

/** Sao chép pose an toàn (deep copy bindings). */
export function clonePose(pose: AnimationPose): AnimationPose {
  const result: AnimationPose = { bindings: new Map(), firedEvents: pose.firedEvents.map((event) => ({ ...event })) };
  for (const [path, evaluation] of pose.bindings) {
    result.bindings.set(path, { ...evaluation, values: [...evaluation.values] });
  }
  return result;
}

/** Chọn một tập path khỏi pose (giống mask nhưng trả pose mới). */
export function selectPosePaths(pose: AnimationPose, paths: readonly string[]): AnimationPose {
  const allowed = new Set(paths);
  const result: AnimationPose = { bindings: new Map(), firedEvents: [...pose.firedEvents] };
  for (const [path, evaluation] of pose.bindings) {
    if (allowed.has(path)) result.bindings.set(path, { ...evaluation, values: [...evaluation.values] });
  }
  return result;
}

/** Loại một tập path khỏi pose. */
export function excludePosePaths(pose: AnimationPose, paths: readonly string[]): AnimationPose {
  const excluded = new Set(paths);
  const result: AnimationPose = { bindings: new Map(), firedEvents: [...pose.firedEvents] };
  for (const [path, evaluation] of pose.bindings) {
    if (!excluded.has(path)) result.bindings.set(path, { ...evaluation, values: [...evaluation.values] });
  }
  return result;
}

/** Gộp hai pose: đích ghi đè path trùng (bổ sung cho mergePoses có alpha). */
export function overridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  const result = clonePose(base);
  for (const [path, evaluation] of overlay.bindings) {
    result.bindings.set(path, { ...evaluation, values: [...evaluation.values] });
  }
  result.firedEvents = [...result.firedEvents, ...overlay.firedEvents];
  return result;
}
