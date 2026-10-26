// engineAnimation: cầu nối animation game <-> engine @aetheria/engine.
//  - GAME_TO_ENGINE_BONES: map khớp game (hips/torso/armR_sh/...) -> khớp engine
//    (hips/spine/arm_r/forearm_r/hand_r/thigh_r/shin_r/foot_r/...)
//  - mapBoneNames của engine: map tự động theo tên đã chuẩn hóa giữa 2 rig.
//  - clipToThreeClip: chuyển pose clip game (CLIPS) sang THREE.AnimationClip
//    để dùng với StateBlender / retargetRigClip của engine khi cần.
import * as THREE from 'three';
import { mapBoneNames, retargetRigClip } from './engine-lib.js';
import { buildCharacter } from './engine-lib.js';
import { getOrCreate } from './engineAssets.js';

export const GAME_TO_ENGINE_BONES = {
  hips: 'hips', torso: 'spine', head: 'head',
  armR_sh: 'arm_r', armR_el: 'forearm_r', armR_hand: 'hand_r',
  armL_sh: 'arm_l', armL_el: 'forearm_l', armL_hand: 'hand_l',
  legR_hip: 'thigh_r', legR_knee: 'shin_r', legR_foot: 'foot_r',
  legL_hip: 'thigh_l', legL_knee: 'shin_l', legL_foot: 'foot_l',
};

function engineCharacterRoot() {
  return getOrCreate('engineCharacterRoot:warrior', () => buildCharacter({ seed: 1, archetype: 'warrior' }).root);
}

/** Map tên khớp engine -> khớp game cho 1 rig game (dùng mapBoneNames của engine). */
export function buildBoneMap(gameRigGroup) {
  try {
    const map = mapBoneNames(engineCharacterRoot(), gameRigGroup);
    return map;
  } catch {
    return null;
  }
}

/** Chuyển 1 pose clip game sang THREE.AnimationClip (rotation tracks). */
export function clipToThreeClip(name, clip) {
  const tracks = [];
  for (const joint in clip.tracks) {
    const track = clip.tracks[joint];
    const times = track.map((k) => k.t);
    const values = [];
    for (const k of track) {
      const v = Array.isArray(k.v) ? k.v : [k.v, 0, 0];
      values.push(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0);
    }
    const engineJoint = GAME_TO_ENGINE_BONES[joint] || joint;
    tracks.push(new THREE.VectorKeyframeTrack(`${engineJoint}.rotation`, times, values));
  }
  return new THREE.AnimationClip(name, clip.dur, tracks);
}

/** Retarget 1 THREE.AnimationClip từ rig engine sang rig game (qua engine). */
export function retargetClipToGameRig(gameRigGroup, threeClip) {
  try {
    return retargetRigClip(engineCharacterRoot(), gameRigGroup, threeClip);
  } catch {
    return threeClip;
  }
}
