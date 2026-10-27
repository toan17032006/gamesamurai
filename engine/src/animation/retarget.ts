/**
 * @file retarget.ts
 * @module @aetheria/engine/animation/retarget
 * @description Retarget hoạt ảnh giữa hai rig: ánh xạ xương nguồn → xương đích,
 * hệ số scale kích thước, tự đoán map theo quy ước đặt tên (mixamo/UE/vroid...)
 * và áp map lên tập track của clip. Dùng khi tái sử dụng animation marketplace
 * cho nhân vật khác cấu trúc xương.
 */

import { AnimationClip } from './clip.js';
import type { AnimationClipData, AnimationTrack } from './types.js';

/** Quy tắc ánh xạ một xương. */
export interface BoneMapping {
  /** Tên xương/bone trong rig nguồn (thường trùng targetPath prefix). */
  source: string;
  /** Tên xương trong rig đích. */
  target: string;
  /** Hệ số scale độ dịch (chiều cao rig khác nhau); mặc định 1. */
  translationScale?: number;
}

/** Cấu hình retarget. */
export interface RetargetConfig {
  mappings: readonly BoneMapping[];
  /** Các path không khớp map: giữ nguyên hay bỏ đi; mặc định bỏ. */
  keepUnmapped?: boolean;
  /** Các suffix thành phần giữ nguyên (mặc định translation/rotation/scale). */
  channels?: readonly ('translation' | 'rotation' | 'scale')[];
}

/** Tách `boneName.channel` từ targetPath; trả null nếu không đúng dạng. */
export function splitBonePath(targetPath: string): { bone: string; channel: string } | null {
  const match = targetPath.match(/^(.+)\.(translation|rotation|scale)$/);
  return match ? { bone: match[1], channel: match[2] } : null;
}

/**
 * Tự đoán bone mapping giữa hai rig: khớp trực tiếp theo tên (bỏ hoa thường,
 * ký tự `_:- .`) và khớp gián tiếp qua `HUMANOID_BONE_ALIASES` (mixamo/UE/
 * VRoid/Rigify cùng canonical key).
 */
export function guessBoneMapping(
  sourceBones: readonly string[],
  targetBones: readonly string[],
): BoneMapping[] {
  const normalize = (name: string): string => name.toLowerCase().replace(/[\s_:\-.]/g, '');
  const canonicalOf = (name: string): string => {
    const normalized = normalize(name);
    for (const [canonical, aliases] of Object.entries(HUMANOID_BONE_ALIASES)) {
      if (aliases.includes(normalized)) return canonical;
    }
    return normalized;
  };
  const targetByCanonical = new Map<string, string>();
  for (const bone of targetBones) {
    const canonical = canonicalOf(bone);
    if (!targetByCanonical.has(canonical)) targetByCanonical.set(canonical, bone);
  }
  const mappings: BoneMapping[] = [];
  for (const sourceBone of sourceBones) {
    const matched = targetByCanonical.get(canonicalOf(sourceBone));
    if (matched) mappings.push({ source: sourceBone, target: matched });
  }
  return mappings;
}

/** Áp retarget lên một track: đổi targetPath theo map, scale translation. */
export function retargetTrack(track: AnimationTrack, config: RetargetConfig): AnimationTrack | null {
  const split = splitBonePath(track.targetPath);
  const channel = split?.channel ?? (
    track.targetPath.endsWith('.position')
      ? 'translation'
      : track.targetPath.endsWith('.rotation')
        ? 'rotation'
        : track.targetPath.endsWith('.scale')
          ? 'scale'
          : undefined
  );
  const bone = split?.bone ?? track.targetPath;
  // Không cấu hình `channels` = cho phép mọi kênh.
  if (channel && config.channels && !config.channels.includes(channel as 'translation' | 'rotation' | 'scale')) {
    return config.keepUnmapped ? { ...track, keys: [...track.keys] } : null;
  }
  const mapping = config.mappings.find((item) => item.source === bone);
  if (!mapping) {
    return config.keepUnmapped ? { ...track, keys: [...track.keys] } : null;
  }
  const scale = mapping.translationScale ?? 1;
  const targetPath = split ? `${mapping.target}.${channel}` : mapping.target;
  // Quy ước: track.name khớp targetPath — retarget phải đồng bộ cả hai.
  if (scale === 1 || !split || channel !== 'translation') {
    return { ...track, name: targetPath, targetPath, keys: [...track.keys] };
  }
  // Scale thành phần dịch (bỏ thành phần time theo stride).
  const stride = 1 + track.componentCount;
  const keys = [...track.keys];
  for (let base = 0; base < keys.length; base += stride) {
    for (let c = 1; c < stride; c++) {
      keys[base + c] = (keys[base + c] ?? 0) * scale;
    }
  }
  return { ...track, name: targetPath, targetPath, keys };
}

/** Retarget toàn clip sang rig đích; clip kết quả giữ metadata nguồn. */
export function retargetClip(clip: AnimationClip, config: RetargetConfig, name?: string): AnimationClip {
  const tracks: AnimationTrack[] = [];
  for (const track of clip.tracks) {
    const mapped = retargetTrack(track, config);
    if (mapped) tracks.push(mapped);
  }
  const data: AnimationClipData = {
    name: name ?? `${clip.name}_retargeted`,
    duration: clip.duration,
    tracks,
    events: clip.events.map((event) => ({ ...event })),
    metadata: { ...clip.metadata, retargeted: true, mappedBones: config.mappings.length },
  };
  return new AnimationClip(data);
}

/** Danh sách xương xuất hiện trong clip (từ targetPath). */
export function bonesOfClip(clip: AnimationClip): string[] {
  const bones = new Set<string>();
  for (const track of clip.tracks) {
    const split = splitBonePath(track.targetPath);
    bones.add(split?.bone ?? track.targetPath);
  }
  return [...bones].sort();
}

/** Bảng alias humanoid phổ biến: chuẩn hóa tên về một canonical key. */
export const HUMANOID_BONE_ALIASES: Readonly<Record<string, readonly string[]>> = Object.freeze({
  hips: ['hips', 'pelvis', 'root', 'j_bip_c_hips'],
  spine: ['spine', 'spine_01', 'j_bip_c_spine'],
  chest: ['chest', 'spine_02', 'upperchest', 'j_bip_c_chest'],
  head: ['head', 'j_bip_c_head'],
  leftUpperLeg: ['leftupleg', 'thigh_l', 'leftthigh', 'j_bip_l_upperleg'],
  leftLowerLeg: ['leftleg', 'shin_l', 'leftshin', 'j_bip_l_lowerleg'],
  leftFoot: ['leftfoot', 'foot_l', 'j_bip_l_foot'],
  rightUpperLeg: ['rightupleg', 'thigh_r', 'rightthigh', 'j_bip_r_upperleg'],
  rightLowerLeg: ['rightleg', 'shin_r', 'rightshin', 'j_bip_r_lowerleg'],
  rightFoot: ['rightfoot', 'foot_r', 'j_bip_r_foot'],
  leftArm: ['leftarm', 'upperarm_l', 'leftupperarm', 'j_bip_l_upperarm'],
  leftForeArm: ['leftforearm', 'lowerarm_l', 'j_bip_l_lowerarm'],
  leftHand: ['lefthand', 'hand_l', 'j_bip_l_hand'],
  rightArm: ['rightarm', 'upperarm_r', 'rightupperarm', 'j_bip_r_upperarm'],
  rightForeArm: ['rightforearm', 'lowerarm_r', 'j_bip_r_lowerarm'],
  rightHand: ['righthand', 'hand_r', 'j_bip_r_hand'],
});

/** Retarget humanoid tự động: đoán map theo alias rồi retarget clip. */
export function retargetHumanoid(
  clip: AnimationClip,
  targetBones: readonly string[],
  translationScale = 1,
  name?: string,
): AnimationClip {
  const sourceBones = bonesOfClip(clip);
  const mappings = guessBoneMapping(sourceBones, targetBones).map((mapping) => ({
    ...mapping,
    translationScale,
  }));
  return retargetClip(clip, { mappings }, name);
}
