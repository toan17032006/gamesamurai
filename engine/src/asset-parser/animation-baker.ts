// engine/src/asset-parser/animation-baker.ts — Nướng và tối ưu clip hoạt ảnh, retargeting bone
//
// Trước đây module chỉ "nướng" clip bằng cách resample + lược keyframe trùng và
// **bỏ qua hoàn toàn track xoay (quaternion)**: hai quaternions cùng một hướng
// nhưng khác dấu (q và -q) bị coi là khác nhau → giữ thừa keyframe; quaternions
// không chuẩn hoá cũng được giữ nguyên và làm nội suy sai.
//
// Nay:
//   • nướng track xoay bằng **khoảng cách góc** (|dot|) và chuẩn hoá quaternion,
//   • giữ **liên tục dấu** quaternion (q ↔ -q) để nội suy tuyến tính không đảo chiều,
//   • giữ `blendMode` của clip gốc (clip additive bị mất additive khi nướng),
//   • thêm API giàu thông tin: `analyzeClip`, `bakeClipDetailed`, `bakeClipsDetailed`,
//     `optimizeClipKeyframes`, `retargetClipWithReport`, `estimateClipBytes`.
import * as THREE from 'three';

export interface BakeOptions {
  /** Tần số lấy mẫu (Hz). Mặc định 30. */
  sampleHz?: number;
  /** Ngưỡng coi 2 giá trị là trùng nhau (đơn vị giá trị track). Mặc định 1e-4. */
  tolerance?: number;
  /** Ngưỡng sai số góc (radian) cho track xoay. Mặc định 1e-3. */
  angleTolerance?: number;
  /** Chuẩn hoá quaternion sau khi nướng. Mặc định true. */
  normalizeQuaternions?: boolean;
  /** Bảo đảm dấu quaternion liên tục (tránh q ↔ -q). Mặc định true. */
  fixQuaternionSigns?: boolean;
  /** Giữ `blendMode` của clip gốc. Mặc định true. */
  preserveBlendMode?: boolean;
}

export interface RetargetOptions {
  /** Ánh xạ tên bone nguồn → bone đích. */
  boneMap: Record<string, string>;
  /** Tiền tố cần bỏ khỏi tên bone trước khi tra map. */
  prefixToRemove?: string;
  /** Tiền tố thêm vào sau khi tra map. */
  prefixToAdd?: string;
  /** true = chỉ giữ track của bone có trong map (bỏ track gốc khác). */
  onlyMapped?: boolean;
}

type TrackCtor = new (
  name: string,
  times: number[] | Float32Array,
  values: number[] | Float32Array,
  interpolation?: THREE.InterpolationModes,
) => THREE.KeyframeTrack;

/** Loại kênh hoạt ảnh của một track. */
export type TrackKind = 'position' | 'quaternion' | 'scale' | 'morph' | 'number' | 'unknown';

/** Thống kê nướng cho từng track. */
export interface TrackBakeStats {
  /** Tên track đầy đủ (`Bone.quaternion`). */
  name: string;
  /** Loại kênh. */
  kind: TrackKind;
  /** Số thành phần mỗi key (1 / 2 / 3 / 4 / N). */
  componentSize: number;
  /** Số key trước khi nướng. */
  originalKeyCount: number;
  /** Số key sau khi nướng. */
  bakedKeyCount: number;
  /** Số key đã bị lược bỏ. */
  removedKeyCount: number;
  /** Số lần phải đảo dấu quaternion để giữ liên tục. */
  quaternionSignFlips: number;
}

/** Báo cáo đầy đủ cho một lần nướng clip. */
export interface BakeReport {
  /** Clip đã nướng. */
  clip: THREE.AnimationClip;
  /** Tên clip. */
  clipName: string;
  /** Thời lượng clip (giây). */
  duration: number;
  /** Tần số lấy mẫu đã dùng. */
  sampleHz: number;
  /** Ngưỡng giá trị đã dùng. */
  tolerance: number;
  /** Ngưỡng góc đã dùng (radian). */
  angleTolerance: number;
  /** Số track của clip gốc. */
  trackCount: number;
  /** Số track còn lại sau khi nướng. */
  bakedTrackCount: number;
  /** Số track bị loại (không sample được). */
  droppedTrackCount: number;
  /** Tổng số key của clip gốc (trước nướng). */
  originalKeyCount: number;
  /** Tổng số mẫu đã đánh giá trong lúc nướng (trước khi lược trùng). */
  sampledKeyCount: number;
  /** Tổng số key còn lại sau khi nướng. */
  bakedKeyCount: number;
  /** Số mẫu bị lược bỏ (sampledKeyCount - bakedKeyCount). */
  removedKeyCount: number;
  /** Độ chênh lệch số key so với clip gốc (âm = nhỏ hơn, dương = lớn hơn). */
  keyCountDelta: number;
  /** Tỷ lệ giữ lại sau khi lược trùng (0..1): 1 = giữ hết, 0 = mất hết. */
  compressionRatio: number;
  /** Ước lượng dung lượng (byte) trước khi nướng. */
  estimatedBytesBefore: number;
  /** Ước lượng dung lượng (byte) sau khi nướng. */
  estimatedBytesAfter: number;
  /** Số track xoay. */
  quaternionTrackCount: number;
  /** Số track vị trí. */
  positionTrackCount: number;
  /** Số track tỉ lệ. */
  scaleTrackCount: number;
  /** Số track morph target. */
  morphTrackCount: number;
  /** Thống kê chi tiết từng track. */
  tracks: TrackBakeStats[];
}

/** Phân tích clip (không sửa clip). */
export interface ClipAnalysis {
  /** Tên clip. */
  name: string;
  /** UUID của clip. */
  uuid: string;
  /** Thời lượng (giây). */
  duration: number;
  /** Blend mode của clip. */
  blendMode: THREE.AnimationBlendMode;
  /** Số track. */
  trackCount: number;
  /** Tổng số key. */
  keyCount: number;
  /** Số track theo từng loại. */
  byKind: Record<TrackKind, number>;
  /** Ước lượng dung lượng (byte). */
  estimatedBytes: number;
  /** Danh sách node được animate (không trùng). */
  animatedNodes: string[];
  /** Thời điểm bắt đầu sớm nhất trong clip. */
  startTime: number;
  /** Thời điểm kết thúc muộn nhất trong clip. */
  endTime: number;
}

/** Báo cáo retarget. */
export interface ClipRetargetReport {
  /** Clip sau khi retarget. */
  clip: THREE.AnimationClip;
  /** Tên clip. */
  clipName: string;
  /** Số track được map thành công. */
  mappedTracks: number;
  /** Số track bị loại (không có trong map hoặc không parse được). */
  droppedTracks: number;
  /** Tổng số track của clip gốc. */
  originalTrackCount: number;
  /** Danh sách tên track bị loại. */
  droppedTrackNames: string[];
  /** Danh sách bone nguồn không tìm thấy trong map. */
  unmappedBones: string[];
  /** Tỷ lệ track được giữ (0..1). */
  keepRatio: number;
}

// ---------------------------------------------------------------------------
// Tiện ích nội bộ
// ---------------------------------------------------------------------------

/** Nhận diện loại kênh của một track dựa trên tên track. */
export function trackKind(track: THREE.KeyframeTrack): TrackKind {
  const name = track.name.toLowerCase();
  if (name.endsWith('.quaternion') || name.endsWith('.rotationquaternion')) return 'quaternion';
  if (name.endsWith('.position') || name.endsWith('.translation')) return 'position';
  if (name.endsWith('.scale')) return 'scale';
  if (name.includes('morphtargetinfluences')) return 'morph';
  const size = track.values.length / Math.max(1, track.times.length);
  if (size === 1) return 'number';
  return 'unknown';
}

/** Số thành phần của một key trong track. */
export function trackComponentSize(track: THREE.KeyframeTrack): number {
  return Math.max(1, Math.floor(track.values.length / Math.max(1, track.times.length)));
}

/** Ước lượng dung lượng của clip (byte) — times/values đều là Float32Array. */
export function estimateClipBytes(clip: THREE.AnimationClip): number {
  let bytes = 0;
  for (const track of clip.tracks) {
    bytes += (track.times.length + track.values.length) * 4;
  }
  return bytes;
}

/** Trích node name từ tên track (vd `Bone.quaternion` → `Bone`). */
function nodeNameOf(trackName: string): string {
  try {
    const parsed = THREE.PropertyBinding.parseTrackName(trackName) as { nodeName?: string };
    if (parsed.nodeName) return parsed.nodeName;
  } catch {
    // bỏ qua — dùng cách tách thủ công
  }
  const dot = trackName.indexOf('.');
  return dot > 0 ? trackName.slice(0, dot) : trackName;
}

/** Chuẩn hoá 1 quaternion (mảng 4 số) về đơn vị. */
function normalizeQuatValues(values: number[], offset: number): void {
  const x = values[offset] ?? 0;
  const y = values[offset + 1] ?? 0;
  const z = values[offset + 2] ?? 0;
  const w = values[offset + 3] ?? 1;
  const len = Math.hypot(x, y, z, w);
  if (len < 1e-9) {
    values[offset] = 0;
    values[offset + 1] = 0;
    values[offset + 2] = 0;
    values[offset + 3] = 1;
    return;
  }
  values[offset] = x / len;
  values[offset + 1] = y / len;
  values[offset + 2] = z / len;
  values[offset + 3] = w / len;
}

/** Bảo đảm dấu quaternion liên tục so với key trước (trả về số lần đảo dấu). */
function enforceQuaternionSigns(values: number[], componentSize: number): number {
  let flips = 0;
  for (let k = 1; k * componentSize + 3 < values.length; k++) {
    const prev = (k - 1) * componentSize;
    const cur = k * componentSize;
    const dot =
      (values[prev] ?? 0) * (values[cur] ?? 0) +
      (values[prev + 1] ?? 0) * (values[cur + 1] ?? 0) +
      (values[prev + 2] ?? 0) * (values[cur + 2] ?? 0) +
      (values[prev + 3] ?? 1) * (values[cur + 3] ?? 1);
    if (dot < 0) {
      values[cur] = -(values[cur] ?? 0);
      values[cur + 1] = -(values[cur + 1] ?? 0);
      values[cur + 2] = -(values[cur + 2] ?? 0);
      values[cur + 3] = -(values[cur + 3] ?? 1);
      flips++;
    }
  }
  return flips;
}

/** Khoảng cách góc (radian) giữa 2 quaternion từ mảng giá trị. */
function quaternionAngleBetween(values: ArrayLike<number>, a: number, b: number): number {
  const ax = values[a] ?? 0;
  const ay = values[a + 1] ?? 0;
  const az = values[a + 2] ?? 0;
  const aw = values[a + 3] ?? 1;
  const bx = values[b] ?? 0;
  const by = values[b + 1] ?? 0;
  const bz = values[b + 2] ?? 0;
  const bw = values[b + 3] ?? 1;
  let dot = ax * bx + ay * by + az * bz + aw * bw;
  dot = Math.min(1, Math.abs(dot));
  return 2 * Math.acos(dot);
}

/** So sánh 2 giá trị track — dùng khoảng cách góc cho track xoay. */
function valuesMatch(
  values: number[],
  offset: number,
  evaluated: ArrayLike<number>,
  size: number,
  tolerance: number,
  angleTolerance: number,
  isQuaternion: boolean,
): boolean {
  if (isQuaternion && size === 4) {
    const prevX = values[offset] ?? 0;
    const prevY = values[offset + 1] ?? 0;
    const prevZ = values[offset + 2] ?? 0;
    const prevW = values[offset + 3] ?? 1;
    const nextX = evaluated[0] ?? 0;
    const nextY = evaluated[1] ?? 0;
    const nextZ = evaluated[2] ?? 0;
    const nextW = evaluated[3] ?? 1;
    const dot = Math.abs(prevX * nextX + prevY * nextY + prevZ * nextZ + prevW * nextW);
    const clamped = Math.min(1, dot);
    return 2 * Math.acos(clamped) <= angleTolerance;
  }
  for (let i = 0; i < size; i++) {
    if (Math.abs((values[offset + i] ?? 0) - (evaluated[i] ?? 0)) > tolerance) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Phân tích clip
// ---------------------------------------------------------------------------

/** Phân tích clip: số track, số key, loại kênh, dung lượng, node animate. */
export function analyzeClip(clip: THREE.AnimationClip): ClipAnalysis {
  const byKind: Record<TrackKind, number> = {
    position: 0,
    quaternion: 0,
    scale: 0,
    morph: 0,
    number: 0,
    unknown: 0,
  };
  const nodes = new Set<string>();
  let keyCount = 0;
  let startTime = Number.POSITIVE_INFINITY;
  let endTime = Number.NEGATIVE_INFINITY;

  for (const track of clip.tracks) {
    byKind[trackKind(track)]++;
    keyCount += track.times.length;
    nodes.add(nodeNameOf(track.name));
    if (track.times.length > 0) {
      startTime = Math.min(startTime, track.times[0]);
      endTime = Math.max(endTime, track.times[track.times.length - 1]);
    }
  }

  return {
    name: clip.name,
    uuid: clip.uuid,
    duration: clip.duration,
    blendMode: clip.blendMode,
    trackCount: clip.tracks.length,
    keyCount,
    byKind,
    estimatedBytes: estimateClipBytes(clip),
    animatedNodes: Array.from(nodes).sort(),
    startTime: Number.isFinite(startTime) ? startTime : 0,
    endTime: Number.isFinite(endTime) ? endTime : 0,
  };
}

// ---------------------------------------------------------------------------
// Nướng clip
// ---------------------------------------------------------------------------

/**
 * Nướng 1 clip: mỗi track được resample đều theo `sampleHz`, lược keyframe trùng
 * (dùng khoảng cách góc cho track xoay), chuẩn hoá & giữ liên tục dấu quaternion.
 */
export function bakeClip(clip: THREE.AnimationClip, opts: BakeOptions = {}): THREE.AnimationClip {
  const report = bakeClipDetailed(clip, opts);
  return report.clip;
}

/** Nướng nhiều clip cùng lúc. */
export function bakeClips(clips: THREE.AnimationClip[], opts: BakeOptions = {}): THREE.AnimationClip[] {
  return clips.map((c) => bakeClip(c, opts));
}

/** Nướng clip và trả về báo cáo chi tiết kèm clip đã nướng. */
export function bakeClipDetailed(clip: THREE.AnimationClip, opts: BakeOptions = {}): BakeReport {
  const sampleHz = opts.sampleHz && opts.sampleHz > 0 ? opts.sampleHz : 30;
  const tolerance = opts.tolerance ?? 1e-4;
  const angleTolerance = opts.angleTolerance ?? 1e-3;
  const normalizeQuaternions = opts.normalizeQuaternions !== false;
  const fixQuaternionSigns = opts.fixQuaternionSigns !== false;
  const preserveBlendMode = opts.preserveBlendMode !== false;
  const duration = Math.max(0, clip.duration);

  const bakedTracks: THREE.KeyframeTrack[] = [];
  const stats: TrackBakeStats[] = [];
  let droppedTrackCount = 0;
  let originalKeyCount = 0;
  let sampledKeyCount = 0;
  let bakedKeyCount = 0;

  for (const track of clip.tracks) {
    const kind = trackKind(track);
    originalKeyCount += track.times.length;
    const baked = bakeTrack(track, duration, sampleHz, tolerance, angleTolerance, kind, normalizeQuaternions);
    if (!baked) {
      droppedTrackCount++;
      continue;
    }
    const flips = fixQuaternionSigns && kind === 'quaternion' ? countSignFlips(baked.values) : 0;
    bakedTracks.push(baked);
    sampledKeyCount += Math.floor(duration * sampleHz) + 1;
    bakedKeyCount += baked.times.length;
    stats.push({
      name: track.name,
      kind,
      componentSize: trackComponentSize(track),
      originalKeyCount: track.times.length,
      bakedKeyCount: baked.times.length,
      removedKeyCount: Math.max(0, track.times.length - baked.times.length),
      quaternionSignFlips: flips,
    });
  }

  const bakedClip = new THREE.AnimationClip(
    clip.name,
    duration,
    bakedTracks,
    preserveBlendMode ? clip.blendMode : THREE.NormalAnimationBlendMode,
  );
  bakedClip.uuid = clip.uuid;

  const byKind = { position: 0, quaternion: 0, scale: 0, morph: 0, number: 0, unknown: 0 };
  for (const s of stats) byKind[s.kind]++;

  const bytesBefore = estimateClipBytes(clip);
  const bytesAfter = estimateClipBytes(bakedClip);

  return {
    clip: bakedClip,
    clipName: clip.name,
    duration,
    sampleHz,
    tolerance,
    angleTolerance,
    trackCount: clip.tracks.length,
    bakedTrackCount: bakedTracks.length,
    droppedTrackCount,
    originalKeyCount,
    sampledKeyCount,
    bakedKeyCount,
    removedKeyCount: Math.max(0, sampledKeyCount - bakedKeyCount),
    keyCountDelta: bakedKeyCount - originalKeyCount,
    compressionRatio: sampledKeyCount > 0 ? bakedKeyCount / sampledKeyCount : 0,
    estimatedBytesBefore: bytesBefore,
    estimatedBytesAfter: bytesAfter,
    quaternionTrackCount: byKind.quaternion,
    positionTrackCount: byKind.position,
    scaleTrackCount: byKind.scale,
    morphTrackCount: byKind.morph,
    tracks: stats,
  };
}

/** Nướng nhiều clip + tổng hợp báo cáo. */
export function bakeClipsDetailed(
  clips: readonly THREE.AnimationClip[],
  opts: BakeOptions = {},
): {
  clips: THREE.AnimationClip[];
  reports: BakeReport[];
  totalOriginalKeys: number;
  totalSampledKeys: number;
  totalBakedKeys: number;
  compressionRatio: number;
} {
  const reports = clips.map((c) => bakeClipDetailed(c, opts));
  const totalOriginalKeys = reports.reduce((sum, r) => sum + r.originalKeyCount, 0);
  const totalSampledKeys = reports.reduce((sum, r) => sum + r.sampledKeyCount, 0);
  const totalBakedKeys = reports.reduce((sum, r) => sum + r.bakedKeyCount, 0);
  return {
    clips: reports.map((r) => r.clip),
    reports,
    totalOriginalKeys,
    totalSampledKeys,
    totalBakedKeys,
    compressionRatio: totalSampledKeys > 0 ? totalBakedKeys / totalSampledKeys : 0,
  };
}

/** Đếm số cặp quaternion đổi dấu trong một mảng giá trị. */
function countSignFlips(values: ArrayLike<number>): number {
  let flips = 0;
  for (let k = 1; k * 4 + 3 < values.length; k++) {
    const prev = (k - 1) * 4;
    const cur = k * 4;
    const dot =
      (values[prev] ?? 0) * (values[cur] ?? 0) +
      (values[prev + 1] ?? 0) * (values[cur + 1] ?? 0) +
      (values[prev + 2] ?? 0) * (values[cur + 2] ?? 0) +
      (values[prev + 3] ?? 1) * (values[cur + 3] ?? 1);
    if (dot < 0) flips++;
  }
  return flips;
}

/** Resample + lược bỏ keyframe trùng cho 1 track. Trả null nếu track không sample được. */
function bakeTrack(
  track: THREE.KeyframeTrack,
  duration: number,
  sampleHz: number,
  tolerance: number,
  angleTolerance: number,
  kind: TrackKind,
  normalizeQuaternions: boolean,
): THREE.KeyframeTrack | null {
  if (track.times.length === 0 || duration <= 0) return null;

  let interpolant: THREE.Interpolant;
  try {
    interpolant = track.createInterpolant();
  } catch {
    return null;
  }

  const step = 1 / sampleHz;
  const sampleCount = Math.floor(duration * sampleHz) + 1;
  const componentSize = trackComponentSize(track);
  const isQuaternion = kind === 'quaternion' && componentSize === 4;

  const times: number[] = [];
  const values: number[] = [];
  let kept = 0;

  for (let i = 0; i < sampleCount; i++) {
    const t = Math.min(i * step, duration);
    // thời điểm cuối lưới: luôn đảm bảo có key đúng = duration
    const time = i === sampleCount - 1 && Math.abs(duration - t) > 1e-6 ? duration : t;
    const value = interpolant.evaluate(time);

    // lược keyframe trùng: so với key đã giữ ngay trước đó
    if (
      kept > 0 &&
      i < sampleCount - 1 &&
      valuesMatch(values, (kept - 1) * componentSize, value, componentSize, tolerance, angleTolerance, isQuaternion)
    ) {
      continue;
    }
    times.push(time);
    for (let c = 0; c < componentSize; c++) values.push(value[c] as number);
    kept++;
  }

  if (times.length === 0) return null;

  if (isQuaternion && normalizeQuaternions) {
    for (let k = 0; k * 4 + 3 < values.length; k++) normalizeQuatValues(values, k * 4);
  }

  const Ctor = (track.constructor as TrackCtor) ?? THREE.KeyframeTrack;
  return new Ctor(track.name, times, values, track.getInterpolation());
}

// ---------------------------------------------------------------------------
// Tối ưu keyframe (giảm key theo sai số cho phép)
// ---------------------------------------------------------------------------

export interface OptimizeOptions {
  /** Sai số cho phép trên giá trị track (đơn vị track). */
  tolerance?: number;
  /** Sai số góc cho phép trên track xoay (radian). */
  angleTolerance?: number;
  /** Chuẩn hoá & giữ liên tục dấu quaternion sau khi tối ưu. */
  normalizeQuaternions?: boolean;
}

/** Báo cáo tối ưu keyframe. */
export interface OptimizeReport {
  clip: THREE.AnimationClip;
  clipName: string;
  trackCount: number;
  originalKeyCount: number;
  optimizedKeyCount: number;
  removedKeyCount: number;
  compressionRatio: number;
  estimatedBytesBefore: number;
  estimatedBytesAfter: number;
}

/**
 * Giảm keyframe mà không vỡ hình dạng: giữ lại key đầu/cuối và mọi key mà
 * đường nội suy tuyến tính giữa 2 key đã giữ lệch quá sai số cho phép.
 */
export function optimizeClipKeyframes(
  clip: THREE.AnimationClip,
  opts: OptimizeOptions = {},
): OptimizeReport {
  const tolerance = opts.tolerance ?? 1e-3;
  const angleTolerance = opts.angleTolerance ?? 1e-2;
  const normalizeQuaternions = opts.normalizeQuaternions !== false;

  const optimizedTracks: THREE.KeyframeTrack[] = [];
  let originalKeyCount = 0;
  let optimizedKeyCount = 0;

  for (const track of clip.tracks) {
    originalKeyCount += track.times.length;
    const kind = trackKind(track);
    const size = trackComponentSize(track);
    const isQuaternion = kind === 'quaternion' && size === 4;
    const keep = isQuaternion
      ? selectQuaternionKeys(track, angleTolerance)
      : selectScalarKeys(track, size, tolerance);

    const times: number[] = [];
    const values: number[] = [];
    for (const idx of keep) {
      times.push(track.times[idx]);
      for (let c = 0; c < size; c++) values.push(track.values[idx * size + c]);
    }
    if (times.length === 0) continue;

    if (isQuaternion && size === 4) {
      enforceQuaternionSigns(values, 4);
      if (normalizeQuaternions) {
        for (let k = 0; k * 4 + 3 < values.length; k++) normalizeQuatValues(values, k * 4);
      }
    }

    const Ctor = (track.constructor as TrackCtor) ?? THREE.KeyframeTrack;
    optimizedTracks.push(new Ctor(track.name, times, values, track.getInterpolation()));
    optimizedKeyCount += times.length;
  }

  const optimizedClip = new THREE.AnimationClip(
    clip.name,
    clip.duration,
    optimizedTracks,
    clip.blendMode,
  );
  optimizedClip.uuid = clip.uuid;

  const bytesBefore = estimateClipBytes(clip);
  const bytesAfter = estimateClipBytes(optimizedClip);

  return {
    clip: optimizedClip,
    clipName: clip.name,
    trackCount: optimizedTracks.length,
    originalKeyCount,
    optimizedKeyCount,
    removedKeyCount: Math.max(0, originalKeyCount - optimizedKeyCount),
    compressionRatio: originalKeyCount > 0 ? optimizedKeyCount / originalKeyCount : 0,
    estimatedBytesBefore: bytesBefore,
    estimatedBytesAfter: bytesAfter,
  };
}

/** Chọn key cần giữ cho track giá trị vô hướng (Douglas–Peucker trên từng thành phần). */
function selectScalarKeys(track: THREE.KeyframeTrack, size: number, tolerance: number): number[] {
  const count = track.times.length;
  if (count <= 2) return Array.from({ length: count }, (_, i) => i);

  const times = Array.from(track.times as ArrayLike<number>);
  const keep = new Set<number>([0, count - 1]);

  for (let c = 0; c < size; c++) {
    const ys = new Array<number>(count);
    for (let i = 0; i < count; i++) ys[i] = track.values[i * size + c];
    for (const idx of douglasPeucker(times, ys, tolerance)) keep.add(idx);
  }

  return Array.from(keep).sort((a, b) => a - b);
}

/**
 * Douglas–Peucker trên đường (thời gian, giá trị) với sai số **đo theo giá trị**
 * (không theo khoảng cách vuông góc) để `tolerance` có đơn vị nhất quán với track.
 */
function douglasPeucker(xs: number[], ys: number[], tolerance: number): number[] {
  const count = xs.length;
  const keep = new Set<number>([0, count - 1]);
  if (count <= 2) return Array.from(keep);

  const stack: Array<[number, number]> = [[0, count - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop() as [number, number];
    if (last <= first + 1) continue;

    const x1 = xs[first];
    const y1 = ys[first];
    const x2 = xs[last];
    const y2 = ys[last];
    const span = x2 - x1;

    let maxError = -1;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const alpha = span > 1e-9 ? (xs[i] - x1) / span : 0;
      const interpolated = y1 + (y2 - y1) * alpha;
      const error = Math.abs(ys[i] - interpolated);
      if (error > maxError) {
        maxError = error;
        index = i;
      }
    }

    if (maxError > tolerance && index > 0) {
      keep.add(index);
      stack.push([first, index], [index, last]);
    }
  }

  return Array.from(keep);
}

/** Chọn key cần giữ cho track xoay (so sánh bằng khoảng cách góc). */
function selectQuaternionKeys(track: THREE.KeyframeTrack, angleTolerance: number): number[] {
  const count = track.times.length;
  if (count <= 2) return Array.from({ length: count }, (_, i) => i);
  const keep = new Set<number>([0, count - 1]);
  const values = track.values as ArrayLike<number>;
  let lastKept = 0;
  for (let i = 1; i < count - 1; i++) {
    const angle = quaternionAngleBetween(values, lastKept * 4, i * 4);
    if (angle > angleTolerance) {
      keep.add(i);
      lastKept = i;
    }
  }
  return Array.from(keep).sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Retarget
// ---------------------------------------------------------------------------

/**
 * Retarget clip sang bộ xương khác: đổi tên node trong track theo `boneMap`
 * (hỗ trợ bỏ/add tiền tố) và giữ nguyên giá trị track.
 */
export function retargetClip(clip: THREE.AnimationClip, opts: RetargetOptions): THREE.AnimationClip {
  return retargetClipWithReport(clip, opts).clip;
}

/** Retarget clip + báo cáo chi tiết (track bị loại, bone chưa map). */
export function retargetClipWithReport(clip: THREE.AnimationClip, opts: RetargetOptions): ClipRetargetReport {
  const onlyMapped = opts.onlyMapped ?? false;
  const newTracks: THREE.KeyframeTrack[] = [];
  const droppedTrackNames: string[] = [];
  const unmappedBones = new Set<string>();
  let mappedTracks = 0;

  for (const track of clip.tracks) {
    const dotIdx = track.name.indexOf('.');
    const trackProp = dotIdx >= 0 ? track.name.slice(dotIdx) : '';
    let boneName = dotIdx >= 0 ? track.name.slice(0, dotIdx) : track.name;

    if (opts.prefixToRemove && boneName.startsWith(opts.prefixToRemove)) {
      boneName = boneName.slice(opts.prefixToRemove.length);
    }
    const mapped = opts.boneMap[boneName];
    if (mapped !== undefined) {
      boneName = mapped;
    } else {
      unmappedBones.add(boneName);
      if (onlyMapped) {
        droppedTrackNames.push(track.name);
        continue;
      }
    }
    if (opts.prefixToAdd) {
      boneName = opts.prefixToAdd + boneName;
    }

    const newTrackName = `${boneName}${trackProp}`;
    const Ctor = (track.constructor as TrackCtor) ?? THREE.KeyframeTrack;
    newTracks.push(new Ctor(newTrackName, track.times, track.values, track.getInterpolation()));
    mappedTracks++;
  }

  const retargeted = new THREE.AnimationClip(clip.name, clip.duration, newTracks, clip.blendMode);
  retargeted.uuid = clip.uuid;

  return {
    clip: retargeted,
    clipName: clip.name,
    mappedTracks,
    droppedTracks: droppedTrackNames.length,
    originalTrackCount: clip.tracks.length,
    droppedTrackNames,
    unmappedBones: Array.from(unmappedBones).sort(),
    keepRatio: clip.tracks.length > 0 ? mappedTracks / clip.tracks.length : 0,
  };
}

/** Đổi tên bone theo map cho toàn bộ danh sách clip. */
export function retargetClips(clips: THREE.AnimationClip[], opts: RetargetOptions): THREE.AnimationClip[] {
  return clips.map((c) => retargetClip(c, opts));
}

/** Đổi tên bone theo map cho toàn bộ danh sách clip + báo cáo tổng hợp. */
export function retargetClipsWithReport(
  clips: readonly THREE.AnimationClip[],
  opts: RetargetOptions,
): { clips: THREE.AnimationClip[]; reports: ClipRetargetReport[]; mappedTracks: number; droppedTracks: number } {
  const reports = clips.map((c) => retargetClipWithReport(c, opts));
  return {
    clips: reports.map((r) => r.clip),
    reports,
    mappedTracks: reports.reduce((s, r) => s + r.mappedTracks, 0),
    droppedTracks: reports.reduce((s, r) => s + r.droppedTracks, 0),
  };
}
