/**
 * @file blend.ts
 * @module @aetheria/engine/animation/blend
 * @description Trộn pose hoạt ảnh: blend tuyến tính, blend 1D/2D theo tham số,
 * lớp cộng dồn (additive) với pose tham chiếu, mask theo target path và
 * crossfade. Đầu vào là danh sách `Map<targetPath, values>` từ các clip —
 * đầu ra là pose hợp nhất cho tầng render.
 */

import { clampRange } from '../deeplearning/random.js';
import { applyEasing } from './easing.js';
import type { AnimationPose, TrackEvaluation, TrackValueKind } from './types.js';

/** Trộn tuyến tính hai giá trị phẳng cùng số thành phần. */
export function blendValues(
  a: readonly number[],
  b: readonly number[],
  alpha: number,
): number[] {
  const beta = clampRange(alpha, 0, 1);
  const length = Math.max(a.length, b.length);
  const result = new Array<number>(length);
  for (let i = 0; i < length; i++) {
    const left = a[i] ?? 0;
    const right = b[i] ?? 0;
    result[i] = left + (right - left) * beta;
  }
  return result;
}

/** Cộng dồn hai giá trị (additive layer). */
export function addValues(a: readonly number[], b: readonly number[]): number[] {
  const length = Math.max(a.length, b.length);
  const result = new Array<number>(length);
  for (let i = 0; i < length; i++) result[i] = (a[i] ?? 0) + (b[i] ?? 0);
  return result;
}

/** Pose rỗng (không binding, không event). */
export function emptyPose(): AnimationPose {
  return { bindings: new Map<string, TrackEvaluation>(), firedEvents: [] };
}

/** Ghi một đánh giá track vào pose (thay thế hoặc tạo mới). */
export function setPoseBinding(pose: AnimationPose, evaluation: TrackEvaluation): void {
  pose.bindings.set(evaluation.targetPath, { ...evaluation, values: [...evaluation.values] });
}

/** Ghi một target path từ values + kind (tiện dựng pose thủ công). */
export function setPoseValues(
  pose: AnimationPose,
  targetPath: string,
  values: readonly number[],
  kind: TrackValueKind,
): void {
  setPoseBinding(pose, {
    trackName: targetPath,
    targetPath,
    kind,
    values: [...values],
  });
}

/**
 * Blend 1D: nội suy giữa các clip theo một tham số vô hướng có các mốc
 * `thresholds` tăng dần (giống Blend Tree 1D của Unity).
 */
export function blend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  if (samples.length === 0) return emptyPose();
  if (samples.length === 1) return samples[0].pose;
  let lower = samples[0];
  let upper = samples[samples.length - 1];
  for (let i = 0; i < samples.length - 1; i++) {
    if (parameter >= samples[i].threshold && parameter <= samples[i + 1].threshold) {
      lower = samples[i];
      upper = samples[i + 1];
      break;
    }
  }
  const span = upper.threshold - lower.threshold;
  const alpha = span > 1e-9 ? clampRange((parameter - lower.threshold) / span, 0, 1) : 0;
  return mergePoses(lower.pose, upper.pose, alpha);
}

/**
 * Blend 2D theo tam giác/delaunay đơn giản: nội suy trọng số barycentric giữa
 * 3 mẫu gần nhất; nếu ít hơn 3 mẫu thì rơi về blend 1D.
 */
export function blend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  if (samples.length === 0) return emptyPose();
  if (samples.length < 3) {
    return blend1D(
      samples.map((sample) => ({ threshold: sample.x, pose: sample.pose })),
      x,
    );
  }
  // Tìm 3 mẫu gần nhất (khoảng cách Euclid) và nội suy barycentric.
  const sorted = [...samples].sort(
    (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
  );
  const [p0, p1, p2] = sorted;
  const denominator = (p1.y - p2.y) * (p0.x - p2.x) + (p2.x - p1.x) * (p0.y - p2.y);
  if (Math.abs(denominator) < 1e-9) {
    return blend1D(
      samples.map((sample) => ({ threshold: sample.x, pose: sample.pose })),
      x,
    );
  }
  const w0 = ((p1.y - p2.y) * (x - p2.x) + (p2.x - p1.x) * (y - p2.y)) / denominator;
  const w1 = ((p2.y - p0.y) * (x - p2.x) + (p0.x - p2.x) * (y - p2.y)) / denominator;
  const w2 = 1 - w0 - w1;
  const weights = [
    { pose: p0.pose, weight: w0 },
    { pose: p1.pose, weight: w1 },
    { pose: p2.pose, weight: w2 },
  ];
  return blendWeightedPoses(weights);
}

/** Trộn N pose theo trọng số (không nhất thiết tổng 1 — tự chuẩn hóa). */
export function blendWeightedPoses(
  entries: ReadonlyArray<{ pose: AnimationPose; weight: number }>,
): AnimationPose {
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  const result = emptyPose();
  if (totalWeight <= 1e-9) return result;
  const seen = new Set<string>();
  for (const entry of entries) {
    const weight = Math.max(0, entry.weight) / totalWeight;
    if (weight <= 0) continue;
    for (const [path, evaluation] of entry.pose.bindings) {
      const existing = result.bindings.get(path);
      if (!existing) {
        if (seen.has(path)) continue;
        result.bindings.set(path, {
          ...evaluation,
          values: evaluation.values.map((value) => value * weight),
        });
      } else {
        existing.values = existing.values.map(
          (value, index) => value + weight * (evaluation.values[index] ?? 0),
        );
      }
      seen.add(path);
    }
  }
  return result;
}

/** Merge hai pose với hệ số alpha (override theo alpha); giữ event của cả hai. */
export function mergePoses(under: AnimationPose, over: AnimationPose, alpha: number): AnimationPose {
  const result = emptyPose();
  for (const [path, evaluation] of under.bindings) {
    result.bindings.set(path, { ...evaluation, values: [...evaluation.values] });
  }
  for (const [path, evaluation] of over.bindings) {
    const underEvaluation = under.bindings.get(path);
    const blended = underEvaluation
      ? blendValues(underEvaluation.values, evaluation.values, alpha)
      : evaluation.values.map((value) => value * clampRange(alpha, 0, 1));
    result.bindings.set(path, {
      trackName: evaluation.trackName,
      targetPath: path,
      kind: evaluation.kind,
      values: blended,
    });
  }
  result.firedEvents = [...under.firedEvents, ...over.firedEvents];
  return result;
}

/**
 * Trộn nhiều layer theo thứ tự: layer `override` ghi đè path nó điều khiển;
 * layer `additive` cộng dồn lên kết quả; mask giới hạn path bị tác động.
 */
export function blendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  const result = emptyPose();
  for (const layer of layers) {
    const weight = clampRange(layer.weight, 0, 1);
    if (weight <= 0) continue;
    for (const [path, evaluation] of layer.pose.bindings) {
      if (layer.mask && !layer.mask.includes(path)) continue;
      const scaled: TrackEvaluation = {
        ...evaluation,
        values: evaluation.values.map((value) => value * weight),
      };
      if (layer.blendMode === 'additive' && result.bindings.has(path)) {
        const base = result.bindings.get(path);
        result.bindings.set(path, {
          ...scaled,
          values: addValues(base?.values ?? [], scaled.values),
        });
      } else if (layer.blendMode === 'override' || !result.bindings.has(path)) {
        result.bindings.set(path, scaled);
      }
    }
    result.firedEvents.push(...layer.pose.firedEvents);
  }
  return result;
}

/** Trích pose cộng dồn: hiệu giữa clip đầy đủ và pose tham chiếu (rest pose). */
export function extractAdditive(
  clipPose: AnimationPose,
  referencePose: AnimationPose,
): AnimationPose {
  const result = emptyPose();
  for (const [path, evaluation] of clipPose.bindings) {
    const reference = referencePose.bindings.get(path);
    if (!reference) continue;
    result.bindings.set(path, {
      ...evaluation,
      values: evaluation.values.map((value, index) => value - (reference.values[index] ?? 0)),
    });
  }
  return result;
}

/** Áp easing lên trọng số pose (dùng cho crossfade mềm). */
export function easePoseWeight(weight: number, easing?: string): number {
  return applyEasing(easing, clampRange(weight, 0, 1));
}

/** Crossfade hai pose với đường cong easing (mặc định smoothStep). */
export function crossfadePoses(
  from: AnimationPose,
  to: AnimationPose,
  alpha: number,
  easing?: string,
): AnimationPose {
  const eased = applyEasing(easing ?? 'smoothStep', clampRange(alpha, 0, 1));
  const merged = mergePoses(from, to, eased);
  // Loại event của pose nguồn khi đã fade xong (tránh phát trùng).
  if (eased >= 1) merged.firedEvents = to.firedEvents;
  if (eased <= 0) merged.firedEvents = from.firedEvents;
  return merged;
}

/** Hợp event từ nhiều pose và loại trùng theo (time, name). */
export function dedupeEvents(
  poses: ReadonlyArray<AnimationPose>,
): AnimationPose['firedEvents'] {
  const seen = new Set<string>();
  const result: AnimationPose['firedEvents'] = [];
  for (const pose of poses) {
    for (const event of pose.firedEvents) {
      const key = `${event.time}:${event.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ ...event });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}
