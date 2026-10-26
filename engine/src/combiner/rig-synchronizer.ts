// engine/src/combiner/rig-synchronizer.ts — Đồng bộ khung xương chéo giữa các loại rig khác nhau
import * as THREE from 'three';
import { normalizeBoneName, listSockets } from './socket-binder';

export interface BoneMap {
  readonly bySource: Readonly<Record<string, string>>;
  readonly byTarget: Readonly<Record<string, string>>;
  getTarget(sourceBone: string): string | undefined;
  getSource(targetBone: string): string | undefined;
  readonly size: number;
}

export function mapBoneNames(sourceRig: THREE.Object3D, targetRig: THREE.Object3D): BoneMap {
  const targetIndex = new Map<string, string>();
  for (const name of listSockets(targetRig)) {
    const key = normalizeBoneName(name);
    if (!targetIndex.has(key)) targetIndex.set(key, name);
  }
  const bySource: Record<string, string> = {};
  const byTarget: Record<string, string> = {};
  for (const src of listSockets(sourceRig)) {
    const dst = targetIndex.get(normalizeBoneName(src));
    if (dst && byTarget[dst] === undefined) {
      bySource[src] = dst;
      byTarget[dst] = src;
    }
  }
  return {
    bySource,
    byTarget,
    getTarget: (b) => bySource[b] ?? targetIndex.get(normalizeBoneName(b)),
    getSource: (b) => byTarget[b],
    size: Object.keys(bySource).length,
  };
}

interface ParsedTrack {
  nodeName: string;
  objectName?: string;
  propertyName: string;
  propertyIndex?: string;
}

function parseTrackNameSafe(name: string): ParsedTrack | null {
  try {
    const p = THREE.PropertyBinding.parseTrackName(name) as ParsedTrack;
    if (!p.propertyName) return null;
    return p;
  } catch {
    return null;
  }
}

function rebuildTrackName(p: ParsedTrack, newNode: string): string {
  let out = `${newNode}.${p.propertyName}`;
  if (p.objectName) out = `${newNode}.${p.objectName}.${p.propertyName}`;
  if (p.propertyIndex) out += `.${p.propertyIndex}`;
  return out;
}

export interface RetargetReport {
  clip: THREE.AnimationClip;
  mappedTracks: number;
  droppedTracks: number;
  boneMap: BoneMap;
}

export function retargetRigClip(
  sourceRig: THREE.Object3D,
  targetRig: THREE.Object3D,
  clip: THREE.AnimationClip,
): THREE.AnimationClip {
  const report = retargetClipDetailed(sourceRig, targetRig, clip);
  return report.clip;
}
export { retargetRigClip as retargetRigAnimation };

export function retargetClipDetailed(
  sourceRig: THREE.Object3D,
  targetRig: THREE.Object3D,
  clip: THREE.AnimationClip,
): RetargetReport {
  const boneMap = mapBoneNames(sourceRig, targetRig);
  const mapped: THREE.KeyframeTrack[] = [];
  let dropped = 0;

  for (const track of clip.tracks) {
    const parsed = parseTrackNameSafe(track.name);
    if (!parsed) {
      dropped++;
      continue;
    }
    const targetNode = boneMap.getTarget(parsed.nodeName);
    if (!targetNode) {
      dropped++;
      continue;
    }
    const newName = rebuildTrackName(parsed, targetNode);
    const Ctor = track.constructor as new (
      n: string,
      t: ArrayLike<number>,
      v: ArrayLike<number>,
      i?: THREE.InterpolationModes,
    ) => THREE.KeyframeTrack;
    mapped.push(new Ctor(newName, track.times, track.values, track.getInterpolation()));
  }

  const newClip = new THREE.AnimationClip(clip.name, clip.duration, mapped);
  return {
    clip: newClip,
    mappedTracks: mapped.length,
    droppedTracks: dropped,
    boneMap,
  };
}
