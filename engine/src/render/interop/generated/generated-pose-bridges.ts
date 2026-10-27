/**
 * @file generated-pose-bridges.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import {
  transformPose,
  mirrorPose,
  scalePoseTranslation,
  poseDistance,
  clonePose,
  type MirrorAxis,
} from '../../../animation/pose-ops.js';
import type { AnimationPose } from '../../../animation/types.js';
import { extractRootMotion, displacementBetween, averageRootSpeed } from '../../../animation/root-motion.js';
import { sampleTracksBatch, footPhase, cyclicPhase, normalizeLoopTime } from '../../../animation/samplers.js';
import type { AnimationClip } from '../../../animation/clip.js';
import type { AnimationTrack } from '../../../animation/types.js';
import { convertPositionToLibrary, convertPositionFromLibrary, type CoordinateConvention } from '../matrix-core.js';

const CONVENTION_Three: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Babylon: CoordinateConvention = { upAxis: 'y', handedness: 'left', unitScale: 1 };
const CONVENTION_BabylonNative: CoordinateConvention = { upAxis: 'y', handedness: 'left', unitScale: 1 };
const CONVENTION_Playcanvas: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Verge3d: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Aframe: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_R3f: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Threlte: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Ogl: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Regl: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Twgl: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Luma: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Vtk: CoordinateConvention = { upAxis: 'z', handedness: 'right', unitScale: 1 };
const CONVENTION_Deck: CoordinateConvention = { upAxis: 'z', handedness: 'right', unitScale: 1 };
const CONVENTION_Xeokit: CoordinateConvention = { upAxis: 'z', handedness: 'right', unitScale: 0.001 };
const CONVENTION_Cesium: CoordinateConvention = { upAxis: 'z', handedness: 'right', unitScale: 1 };
const CONVENTION_Zdog: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Filament: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };
const CONVENTION_Osg: CoordinateConvention = { upAxis: 'z', handedness: 'right', unitScale: 1 };
const CONVENTION_Ogre: CoordinateConvention = { upAxis: 'y', handedness: 'right', unitScale: 1 };


/** [Three.js] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toThreePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Three;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [Three.js] Đổi pose từ quy ước thư viện về engine. */
export function fromThreePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Three;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [Three.js] Gương pose theo trục (mặc định trục X). */
export function mirrorThreePose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [Three.js] Scale translation pose theo đơn vị thư viện. */
export function scaleThreePose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [Three.js] Khoảng cách hai pose. */
export function threePoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [Three.js] Bản sao pose an toàn. */
export function cloneThreePose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [Three.js] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleThreeTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toThreePose(pose);
}

/** [Three.js] Pha chân theo track dọc (chuẩn hóa duration). */
export function threeFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [Three.js] Pha vòng chuẩn hóa [0,1). */
export function threeCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [Three.js] Chuẩn hóa thời gian theo wrap mode loop. */
export function threeNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [Three.js] Tách root motion của clip. */
export function extractThreeRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [Three.js] Displacement giữa hai mốc (đơn vị thư viện). */
export function threeDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Three);
}

/** [Three.js] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function threeRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Three.unitScale;
}

/** [Babylon.js] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toBabylonPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Babylon;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [Babylon.js] Đổi pose từ quy ước thư viện về engine. */
export function fromBabylonPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Babylon;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [Babylon.js] Gương pose theo trục (mặc định trục X). */
export function mirrorBabylonPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [Babylon.js] Scale translation pose theo đơn vị thư viện. */
export function scaleBabylonPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [Babylon.js] Khoảng cách hai pose. */
export function babylonPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [Babylon.js] Bản sao pose an toàn. */
export function cloneBabylonPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [Babylon.js] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleBabylonTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toBabylonPose(pose);
}

/** [Babylon.js] Pha chân theo track dọc (chuẩn hóa duration). */
export function babylonFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [Babylon.js] Pha vòng chuẩn hóa [0,1). */
export function babylonCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [Babylon.js] Chuẩn hóa thời gian theo wrap mode loop. */
export function babylonNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [Babylon.js] Tách root motion của clip. */
export function extractBabylonRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [Babylon.js] Displacement giữa hai mốc (đơn vị thư viện). */
export function babylonDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Babylon);
}

/** [Babylon.js] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function babylonRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Babylon.unitScale;
}

/** [Babylon Native] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toBabylonNativePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_BabylonNative;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [Babylon Native] Đổi pose từ quy ước thư viện về engine. */
export function fromBabylonNativePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_BabylonNative;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [Babylon Native] Gương pose theo trục (mặc định trục X). */
export function mirrorBabylonNativePose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [Babylon Native] Scale translation pose theo đơn vị thư viện. */
export function scaleBabylonNativePose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [Babylon Native] Khoảng cách hai pose. */
export function babylonnativePoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [Babylon Native] Bản sao pose an toàn. */
export function cloneBabylonNativePose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [Babylon Native] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleBabylonNativeTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toBabylonNativePose(pose);
}

/** [Babylon Native] Pha chân theo track dọc (chuẩn hóa duration). */
export function babylonnativeFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [Babylon Native] Pha vòng chuẩn hóa [0,1). */
export function babylonnativeCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [Babylon Native] Chuẩn hóa thời gian theo wrap mode loop. */
export function babylonnativeNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [Babylon Native] Tách root motion của clip. */
export function extractBabylonNativeRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [Babylon Native] Displacement giữa hai mốc (đơn vị thư viện). */
export function babylonnativeDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_BabylonNative);
}

/** [Babylon Native] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function babylonnativeRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_BabylonNative.unitScale;
}

/** [PlayCanvas Engine] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toPlaycanvasPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Playcanvas;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [PlayCanvas Engine] Đổi pose từ quy ước thư viện về engine. */
export function fromPlaycanvasPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Playcanvas;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [PlayCanvas Engine] Gương pose theo trục (mặc định trục X). */
export function mirrorPlaycanvasPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [PlayCanvas Engine] Scale translation pose theo đơn vị thư viện. */
export function scalePlaycanvasPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [PlayCanvas Engine] Khoảng cách hai pose. */
export function playcanvasPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [PlayCanvas Engine] Bản sao pose an toàn. */
export function clonePlaycanvasPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [PlayCanvas Engine] Lấy mẫu batch các track theo quy ước thư viện. */
export function samplePlaycanvasTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toPlaycanvasPose(pose);
}

/** [PlayCanvas Engine] Pha chân theo track dọc (chuẩn hóa duration). */
export function playcanvasFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [PlayCanvas Engine] Pha vòng chuẩn hóa [0,1). */
export function playcanvasCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [PlayCanvas Engine] Chuẩn hóa thời gian theo wrap mode loop. */
export function playcanvasNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [PlayCanvas Engine] Tách root motion của clip. */
export function extractPlaycanvasRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [PlayCanvas Engine] Displacement giữa hai mốc (đơn vị thư viện). */
export function playcanvasDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Playcanvas);
}

/** [PlayCanvas Engine] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function playcanvasRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Playcanvas.unitScale;
}

/** [Verge3D] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toVerge3dPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Verge3d;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [Verge3D] Đổi pose từ quy ước thư viện về engine. */
export function fromVerge3dPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Verge3d;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [Verge3D] Gương pose theo trục (mặc định trục X). */
export function mirrorVerge3dPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [Verge3D] Scale translation pose theo đơn vị thư viện. */
export function scaleVerge3dPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [Verge3D] Khoảng cách hai pose. */
export function verge3dPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [Verge3D] Bản sao pose an toàn. */
export function cloneVerge3dPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [Verge3D] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleVerge3dTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toVerge3dPose(pose);
}

/** [Verge3D] Pha chân theo track dọc (chuẩn hóa duration). */
export function verge3dFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [Verge3D] Pha vòng chuẩn hóa [0,1). */
export function verge3dCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [Verge3D] Chuẩn hóa thời gian theo wrap mode loop. */
export function verge3dNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [Verge3D] Tách root motion của clip. */
export function extractVerge3dRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [Verge3D] Displacement giữa hai mốc (đơn vị thư viện). */
export function verge3dDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Verge3d);
}

/** [Verge3D] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function verge3dRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Verge3d.unitScale;
}

/** [A-Frame] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toAframePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Aframe;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [A-Frame] Đổi pose từ quy ước thư viện về engine. */
export function fromAframePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Aframe;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [A-Frame] Gương pose theo trục (mặc định trục X). */
export function mirrorAframePose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [A-Frame] Scale translation pose theo đơn vị thư viện. */
export function scaleAframePose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [A-Frame] Khoảng cách hai pose. */
export function aframePoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [A-Frame] Bản sao pose an toàn. */
export function cloneAframePose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [A-Frame] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleAframeTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toAframePose(pose);
}

/** [A-Frame] Pha chân theo track dọc (chuẩn hóa duration). */
export function aframeFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [A-Frame] Pha vòng chuẩn hóa [0,1). */
export function aframeCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [A-Frame] Chuẩn hóa thời gian theo wrap mode loop. */
export function aframeNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [A-Frame] Tách root motion của clip. */
export function extractAframeRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [A-Frame] Displacement giữa hai mốc (đơn vị thư viện). */
export function aframeDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Aframe);
}

/** [A-Frame] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function aframeRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Aframe.unitScale;
}

/** [React Three Fiber] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toR3fPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_R3f;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [React Three Fiber] Đổi pose từ quy ước thư viện về engine. */
export function fromR3fPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_R3f;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [React Three Fiber] Gương pose theo trục (mặc định trục X). */
export function mirrorR3fPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [React Three Fiber] Scale translation pose theo đơn vị thư viện. */
export function scaleR3fPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [React Three Fiber] Khoảng cách hai pose. */
export function r3fPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [React Three Fiber] Bản sao pose an toàn. */
export function cloneR3fPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [React Three Fiber] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleR3fTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toR3fPose(pose);
}

/** [React Three Fiber] Pha chân theo track dọc (chuẩn hóa duration). */
export function r3fFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [React Three Fiber] Pha vòng chuẩn hóa [0,1). */
export function r3fCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [React Three Fiber] Chuẩn hóa thời gian theo wrap mode loop. */
export function r3fNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [React Three Fiber] Tách root motion của clip. */
export function extractR3fRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [React Three Fiber] Displacement giữa hai mốc (đơn vị thư viện). */
export function r3fDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_R3f);
}

/** [React Three Fiber] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function r3fRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_R3f.unitScale;
}

/** [Threlte] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toThreltePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Threlte;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [Threlte] Đổi pose từ quy ước thư viện về engine. */
export function fromThreltePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Threlte;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [Threlte] Gương pose theo trục (mặc định trục X). */
export function mirrorThreltePose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [Threlte] Scale translation pose theo đơn vị thư viện. */
export function scaleThreltePose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [Threlte] Khoảng cách hai pose. */
export function threltePoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [Threlte] Bản sao pose an toàn. */
export function cloneThreltePose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [Threlte] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleThrelteTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toThreltePose(pose);
}

/** [Threlte] Pha chân theo track dọc (chuẩn hóa duration). */
export function threlteFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [Threlte] Pha vòng chuẩn hóa [0,1). */
export function threlteCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [Threlte] Chuẩn hóa thời gian theo wrap mode loop. */
export function threlteNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [Threlte] Tách root motion của clip. */
export function extractThrelteRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [Threlte] Displacement giữa hai mốc (đơn vị thư viện). */
export function threlteDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Threlte);
}

/** [Threlte] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function threlteRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Threlte.unitScale;
}

/** [OGL] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toOglPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Ogl;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [OGL] Đổi pose từ quy ước thư viện về engine. */
export function fromOglPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Ogl;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [OGL] Gương pose theo trục (mặc định trục X). */
export function mirrorOglPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [OGL] Scale translation pose theo đơn vị thư viện. */
export function scaleOglPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [OGL] Khoảng cách hai pose. */
export function oglPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [OGL] Bản sao pose an toàn. */
export function cloneOglPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [OGL] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleOglTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toOglPose(pose);
}

/** [OGL] Pha chân theo track dọc (chuẩn hóa duration). */
export function oglFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [OGL] Pha vòng chuẩn hóa [0,1). */
export function oglCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [OGL] Chuẩn hóa thời gian theo wrap mode loop. */
export function oglNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [OGL] Tách root motion của clip. */
export function extractOglRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [OGL] Displacement giữa hai mốc (đơn vị thư viện). */
export function oglDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Ogl);
}

/** [OGL] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function oglRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Ogl.unitScale;
}

/** [regl] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toReglPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Regl;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [regl] Đổi pose từ quy ước thư viện về engine. */
export function fromReglPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Regl;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [regl] Gương pose theo trục (mặc định trục X). */
export function mirrorReglPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [regl] Scale translation pose theo đơn vị thư viện. */
export function scaleReglPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [regl] Khoảng cách hai pose. */
export function reglPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [regl] Bản sao pose an toàn. */
export function cloneReglPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [regl] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleReglTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toReglPose(pose);
}

/** [regl] Pha chân theo track dọc (chuẩn hóa duration). */
export function reglFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [regl] Pha vòng chuẩn hóa [0,1). */
export function reglCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [regl] Chuẩn hóa thời gian theo wrap mode loop. */
export function reglNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [regl] Tách root motion của clip. */
export function extractReglRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [regl] Displacement giữa hai mốc (đơn vị thư viện). */
export function reglDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Regl);
}

/** [regl] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function reglRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Regl.unitScale;
}

/** [twgl.js] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toTwglPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Twgl;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [twgl.js] Đổi pose từ quy ước thư viện về engine. */
export function fromTwglPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Twgl;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [twgl.js] Gương pose theo trục (mặc định trục X). */
export function mirrorTwglPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [twgl.js] Scale translation pose theo đơn vị thư viện. */
export function scaleTwglPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [twgl.js] Khoảng cách hai pose. */
export function twglPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [twgl.js] Bản sao pose an toàn. */
export function cloneTwglPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [twgl.js] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleTwglTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toTwglPose(pose);
}

/** [twgl.js] Pha chân theo track dọc (chuẩn hóa duration). */
export function twglFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [twgl.js] Pha vòng chuẩn hóa [0,1). */
export function twglCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [twgl.js] Chuẩn hóa thời gian theo wrap mode loop. */
export function twglNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [twgl.js] Tách root motion của clip. */
export function extractTwglRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [twgl.js] Displacement giữa hai mốc (đơn vị thư viện). */
export function twglDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Twgl);
}

/** [twgl.js] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function twglRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Twgl.unitScale;
}

/** [luma.gl] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toLumaPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Luma;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [luma.gl] Đổi pose từ quy ước thư viện về engine. */
export function fromLumaPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Luma;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [luma.gl] Gương pose theo trục (mặc định trục X). */
export function mirrorLumaPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [luma.gl] Scale translation pose theo đơn vị thư viện. */
export function scaleLumaPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [luma.gl] Khoảng cách hai pose. */
export function lumaPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [luma.gl] Bản sao pose an toàn. */
export function cloneLumaPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [luma.gl] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleLumaTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toLumaPose(pose);
}

/** [luma.gl] Pha chân theo track dọc (chuẩn hóa duration). */
export function lumaFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [luma.gl] Pha vòng chuẩn hóa [0,1). */
export function lumaCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [luma.gl] Chuẩn hóa thời gian theo wrap mode loop. */
export function lumaNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [luma.gl] Tách root motion của clip. */
export function extractLumaRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [luma.gl] Displacement giữa hai mốc (đơn vị thư viện). */
export function lumaDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Luma);
}

/** [luma.gl] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function lumaRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Luma.unitScale;
}

/** [vtk.js] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toVtkPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Vtk;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [vtk.js] Đổi pose từ quy ước thư viện về engine. */
export function fromVtkPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Vtk;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [vtk.js] Gương pose theo trục (mặc định trục X). */
export function mirrorVtkPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [vtk.js] Scale translation pose theo đơn vị thư viện. */
export function scaleVtkPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [vtk.js] Khoảng cách hai pose. */
export function vtkPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [vtk.js] Bản sao pose an toàn. */
export function cloneVtkPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [vtk.js] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleVtkTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toVtkPose(pose);
}

/** [vtk.js] Pha chân theo track dọc (chuẩn hóa duration). */
export function vtkFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [vtk.js] Pha vòng chuẩn hóa [0,1). */
export function vtkCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [vtk.js] Chuẩn hóa thời gian theo wrap mode loop. */
export function vtkNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [vtk.js] Tách root motion của clip. */
export function extractVtkRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [vtk.js] Displacement giữa hai mốc (đơn vị thư viện). */
export function vtkDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Vtk);
}

/** [vtk.js] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function vtkRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Vtk.unitScale;
}

/** [deck.gl] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toDeckPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Deck;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [deck.gl] Đổi pose từ quy ước thư viện về engine. */
export function fromDeckPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Deck;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [deck.gl] Gương pose theo trục (mặc định trục X). */
export function mirrorDeckPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [deck.gl] Scale translation pose theo đơn vị thư viện. */
export function scaleDeckPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [deck.gl] Khoảng cách hai pose. */
export function deckPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [deck.gl] Bản sao pose an toàn. */
export function cloneDeckPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [deck.gl] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleDeckTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toDeckPose(pose);
}

/** [deck.gl] Pha chân theo track dọc (chuẩn hóa duration). */
export function deckFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [deck.gl] Pha vòng chuẩn hóa [0,1). */
export function deckCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [deck.gl] Chuẩn hóa thời gian theo wrap mode loop. */
export function deckNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [deck.gl] Tách root motion của clip. */
export function extractDeckRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [deck.gl] Displacement giữa hai mốc (đơn vị thư viện). */
export function deckDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Deck);
}

/** [deck.gl] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function deckRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Deck.unitScale;
}

/** [xeokit] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toXeokitPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Xeokit;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [xeokit] Đổi pose từ quy ước thư viện về engine. */
export function fromXeokitPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Xeokit;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [xeokit] Gương pose theo trục (mặc định trục X). */
export function mirrorXeokitPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [xeokit] Scale translation pose theo đơn vị thư viện. */
export function scaleXeokitPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [xeokit] Khoảng cách hai pose. */
export function xeokitPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [xeokit] Bản sao pose an toàn. */
export function cloneXeokitPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [xeokit] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleXeokitTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toXeokitPose(pose);
}

/** [xeokit] Pha chân theo track dọc (chuẩn hóa duration). */
export function xeokitFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [xeokit] Pha vòng chuẩn hóa [0,1). */
export function xeokitCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [xeokit] Chuẩn hóa thời gian theo wrap mode loop. */
export function xeokitNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [xeokit] Tách root motion của clip. */
export function extractXeokitRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [xeokit] Displacement giữa hai mốc (đơn vị thư viện). */
export function xeokitDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Xeokit);
}

/** [xeokit] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function xeokitRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Xeokit.unitScale;
}

/** [CesiumJS] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toCesiumPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Cesium;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [CesiumJS] Đổi pose từ quy ước thư viện về engine. */
export function fromCesiumPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Cesium;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [CesiumJS] Gương pose theo trục (mặc định trục X). */
export function mirrorCesiumPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [CesiumJS] Scale translation pose theo đơn vị thư viện. */
export function scaleCesiumPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [CesiumJS] Khoảng cách hai pose. */
export function cesiumPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [CesiumJS] Bản sao pose an toàn. */
export function cloneCesiumPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [CesiumJS] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleCesiumTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toCesiumPose(pose);
}

/** [CesiumJS] Pha chân theo track dọc (chuẩn hóa duration). */
export function cesiumFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [CesiumJS] Pha vòng chuẩn hóa [0,1). */
export function cesiumCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [CesiumJS] Chuẩn hóa thời gian theo wrap mode loop. */
export function cesiumNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [CesiumJS] Tách root motion của clip. */
export function extractCesiumRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [CesiumJS] Displacement giữa hai mốc (đơn vị thư viện). */
export function cesiumDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Cesium);
}

/** [CesiumJS] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function cesiumRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Cesium.unitScale;
}

/** [Zdog] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toZdogPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Zdog;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [Zdog] Đổi pose từ quy ước thư viện về engine. */
export function fromZdogPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Zdog;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [Zdog] Gương pose theo trục (mặc định trục X). */
export function mirrorZdogPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [Zdog] Scale translation pose theo đơn vị thư viện. */
export function scaleZdogPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [Zdog] Khoảng cách hai pose. */
export function zdogPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [Zdog] Bản sao pose an toàn. */
export function cloneZdogPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [Zdog] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleZdogTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toZdogPose(pose);
}

/** [Zdog] Pha chân theo track dọc (chuẩn hóa duration). */
export function zdogFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [Zdog] Pha vòng chuẩn hóa [0,1). */
export function zdogCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [Zdog] Chuẩn hóa thời gian theo wrap mode loop. */
export function zdogNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [Zdog] Tách root motion của clip. */
export function extractZdogRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [Zdog] Displacement giữa hai mốc (đơn vị thư viện). */
export function zdogDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Zdog);
}

/** [Zdog] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function zdogRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Zdog.unitScale;
}

/** [Filament] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toFilamentPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Filament;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [Filament] Đổi pose từ quy ước thư viện về engine. */
export function fromFilamentPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Filament;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [Filament] Gương pose theo trục (mặc định trục X). */
export function mirrorFilamentPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [Filament] Scale translation pose theo đơn vị thư viện. */
export function scaleFilamentPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [Filament] Khoảng cách hai pose. */
export function filamentPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [Filament] Bản sao pose an toàn. */
export function cloneFilamentPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [Filament] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleFilamentTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toFilamentPose(pose);
}

/** [Filament] Pha chân theo track dọc (chuẩn hóa duration). */
export function filamentFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [Filament] Pha vòng chuẩn hóa [0,1). */
export function filamentCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [Filament] Chuẩn hóa thời gian theo wrap mode loop. */
export function filamentNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [Filament] Tách root motion của clip. */
export function extractFilamentRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [Filament] Displacement giữa hai mốc (đơn vị thư viện). */
export function filamentDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Filament);
}

/** [Filament] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function filamentRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Filament.unitScale;
}

/** [OpenSceneGraph] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toOsgPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Osg;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [OpenSceneGraph] Đổi pose từ quy ước thư viện về engine. */
export function fromOsgPose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Osg;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [OpenSceneGraph] Gương pose theo trục (mặc định trục X). */
export function mirrorOsgPose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [OpenSceneGraph] Scale translation pose theo đơn vị thư viện. */
export function scaleOsgPose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [OpenSceneGraph] Khoảng cách hai pose. */
export function osgPoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [OpenSceneGraph] Bản sao pose an toàn. */
export function cloneOsgPose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [OpenSceneGraph] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleOsgTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toOsgPose(pose);
}

/** [OpenSceneGraph] Pha chân theo track dọc (chuẩn hóa duration). */
export function osgFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [OpenSceneGraph] Pha vòng chuẩn hóa [0,1). */
export function osgCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [OpenSceneGraph] Chuẩn hóa thời gian theo wrap mode loop. */
export function osgNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [OpenSceneGraph] Tách root motion của clip. */
export function extractOsgRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [OpenSceneGraph] Displacement giữa hai mốc (đơn vị thư viện). */
export function osgDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Osg);
}

/** [OpenSceneGraph] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function osgRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Osg.unitScale;
}

/** [OGRE] Đổi toàn bộ pose translation sang quy ước thư viện. */
export function toOgrePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Ogre;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionToLibrary(values, convention) : values);
}

/** [OGRE] Đổi pose từ quy ước thư viện về engine. */
export function fromOgrePose(pose: AnimationPose): AnimationPose {
  const convention = CONVENTION_Ogre;
  return transformPose(pose, (values, path) =>
    path.endsWith('.translation') ? convertPositionFromLibrary(values, convention) : values);
}

/** [OGRE] Gương pose theo trục (mặc định trục X). */
export function mirrorOgrePose(pose: AnimationPose, axis: MirrorAxis = 'x'): AnimationPose {
  return mirrorPose(pose, axis);
}

/** [OGRE] Scale translation pose theo đơn vị thư viện. */
export function scaleOgrePose(pose: AnimationPose, factor: number): AnimationPose {
  return scalePoseTranslation(pose, factor);
}

/** [OGRE] Khoảng cách hai pose. */
export function ogrePoseDistance(a: AnimationPose, b: AnimationPose): number {
  return poseDistance(a, b);
}

/** [OGRE] Bản sao pose an toàn. */
export function cloneOgrePose(pose: AnimationPose): AnimationPose {
  return clonePose(pose);
}

/** [OGRE] Lấy mẫu batch các track theo quy ước thư viện. */
export function sampleOgreTracks(tracks: readonly AnimationTrack[], time: number): AnimationPose {
  const batch = sampleTracksBatch(tracks, time);
  const pose: AnimationPose = { bindings: new Map(), firedEvents: [] };
  for (const evaluation of batch.evaluations) {
    pose.bindings.set(evaluation.targetPath, evaluation);
  }
  return toOgrePose(pose);
}

/** [OGRE] Pha chân theo track dọc (chuẩn hóa duration). */
export function ogreFootPhase(track: AnimationTrack, time: number, duration: number): number {
  return footPhase(track, time, duration);
}

/** [OGRE] Pha vòng chuẩn hóa [0,1). */
export function ogreCyclicPhase(time: number, duration: number): number {
  return cyclicPhase(time, duration);
}

/** [OGRE] Chuẩn hóa thời gian theo wrap mode loop. */
export function ogreNormalizeTime(time: number, duration: number): number {
  return normalizeLoopTime(time, duration, 'loop');
}

/** [OGRE] Tách root motion của clip. */
export function extractOgreRootMotion(clip: AnimationClip, rootBone = 'root'): ReturnType<typeof extractRootMotion> {
  return extractRootMotion(clip, rootBone);
}

/** [OGRE] Displacement giữa hai mốc (đơn vị thư viện). */
export function ogreDisplacement(clip: AnimationClip, fromTime: number, toTime: number): number[] {
  const extraction = extractRootMotion(clip);
  return convertPositionToLibrary(displacementBetween(extraction, fromTime, toTime), CONVENTION_Ogre);
}

/** [OGRE] Tốc độ root trung bình (đơn vị thư viện/giây). */
export function ogreRootSpeed(clip: AnimationClip): number {
  return averageRootSpeed(extractRootMotion(clip)) / CONVENTION_Ogre.unitScale;
}
