/**
 * @file generated-facades.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import { AnimationClip } from '../../../animation/clip.js';
import { exportClipForLibrary } from '../../../animation/library-export.js';
import { trackStats } from '../../../animation/curve.js';
import type { AnimationTrack } from '../../../animation/types.js';
import { combineExports, validatePayloadKeys } from '../matrix-core.js';


/** [Three.js] Facade hoạt ảnh: exportClip. */
export function threeExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'three');
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportClipStats. */
export function threeExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportTracks. */
export function threeExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportTrackStats. */
export function threeExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportEventTimes. */
export function threeExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportEventNames. */
export function threeExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportDuration. */
export function threeExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportTargets. */
export function threeExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportKeyCounts. */
export function threeExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportInterpolations. */
export function threeExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportMetadata. */
export function threeExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [Three.js] Facade hoạt ảnh: exportFullPayload. */
export function threeExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'three').payload, exportClipForLibrary(clip, 'three').payload);
  return operation(clip);
}

/** [Three.js] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function threeFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [Babylon.js] Facade hoạt ảnh: exportClip. */
export function babylonExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'babylon');
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportClipStats. */
export function babylonExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportTracks. */
export function babylonExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportTrackStats. */
export function babylonExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportEventTimes. */
export function babylonExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportEventNames. */
export function babylonExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportDuration. */
export function babylonExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportTargets. */
export function babylonExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportKeyCounts. */
export function babylonExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportInterpolations. */
export function babylonExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportMetadata. */
export function babylonExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [Babylon.js] Facade hoạt ảnh: exportFullPayload. */
export function babylonExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'babylon').payload, exportClipForLibrary(clip, 'babylon').payload);
  return operation(clip);
}

/** [Babylon.js] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function babylonFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [Babylon Native] Facade hoạt ảnh: exportClip. */
export function babylonnativeExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'babylon-native');
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportClipStats. */
export function babylonnativeExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportTracks. */
export function babylonnativeExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportTrackStats. */
export function babylonnativeExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportEventTimes. */
export function babylonnativeExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportEventNames. */
export function babylonnativeExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportDuration. */
export function babylonnativeExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportTargets. */
export function babylonnativeExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportKeyCounts. */
export function babylonnativeExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportInterpolations. */
export function babylonnativeExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportMetadata. */
export function babylonnativeExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [Babylon Native] Facade hoạt ảnh: exportFullPayload. */
export function babylonnativeExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'babylon-native').payload, exportClipForLibrary(clip, 'babylon-native').payload);
  return operation(clip);
}

/** [Babylon Native] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function babylonnativeFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportClip. */
export function playcanvasExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'playcanvas');
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportClipStats. */
export function playcanvasExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportTracks. */
export function playcanvasExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportTrackStats. */
export function playcanvasExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportEventTimes. */
export function playcanvasExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportEventNames. */
export function playcanvasExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportDuration. */
export function playcanvasExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportTargets. */
export function playcanvasExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportKeyCounts. */
export function playcanvasExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportInterpolations. */
export function playcanvasExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportMetadata. */
export function playcanvasExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [PlayCanvas Engine] Facade hoạt ảnh: exportFullPayload. */
export function playcanvasExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'playcanvas').payload, exportClipForLibrary(clip, 'playcanvas').payload);
  return operation(clip);
}

/** [PlayCanvas Engine] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function playcanvasFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [Verge3D] Facade hoạt ảnh: exportClip. */
export function verge3dExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'verge3d');
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportClipStats. */
export function verge3dExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportTracks. */
export function verge3dExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportTrackStats. */
export function verge3dExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportEventTimes. */
export function verge3dExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportEventNames. */
export function verge3dExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportDuration. */
export function verge3dExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportTargets. */
export function verge3dExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportKeyCounts. */
export function verge3dExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportInterpolations. */
export function verge3dExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportMetadata. */
export function verge3dExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [Verge3D] Facade hoạt ảnh: exportFullPayload. */
export function verge3dExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'verge3d').payload, exportClipForLibrary(clip, 'verge3d').payload);
  return operation(clip);
}

/** [Verge3D] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function verge3dFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [A-Frame] Facade hoạt ảnh: exportClip. */
export function aframeExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'a-frame');
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportClipStats. */
export function aframeExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportTracks. */
export function aframeExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportTrackStats. */
export function aframeExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportEventTimes. */
export function aframeExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportEventNames. */
export function aframeExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportDuration. */
export function aframeExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportTargets. */
export function aframeExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportKeyCounts. */
export function aframeExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportInterpolations. */
export function aframeExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportMetadata. */
export function aframeExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [A-Frame] Facade hoạt ảnh: exportFullPayload. */
export function aframeExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'a-frame').payload, exportClipForLibrary(clip, 'a-frame').payload);
  return operation(clip);
}

/** [A-Frame] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function aframeFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [React Three Fiber] Facade hoạt ảnh: exportClip. */
export function r3fExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'react-three-fiber');
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportClipStats. */
export function r3fExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportTracks. */
export function r3fExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportTrackStats. */
export function r3fExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportEventTimes. */
export function r3fExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportEventNames. */
export function r3fExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportDuration. */
export function r3fExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportTargets. */
export function r3fExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportKeyCounts. */
export function r3fExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportInterpolations. */
export function r3fExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportMetadata. */
export function r3fExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [React Three Fiber] Facade hoạt ảnh: exportFullPayload. */
export function r3fExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'react-three-fiber').payload, exportClipForLibrary(clip, 'react-three-fiber').payload);
  return operation(clip);
}

/** [React Three Fiber] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function r3fFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [Threlte] Facade hoạt ảnh: exportClip. */
export function threlteExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'threlte');
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportClipStats. */
export function threlteExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportTracks. */
export function threlteExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportTrackStats. */
export function threlteExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportEventTimes. */
export function threlteExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportEventNames. */
export function threlteExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportDuration. */
export function threlteExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportTargets. */
export function threlteExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportKeyCounts. */
export function threlteExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportInterpolations. */
export function threlteExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportMetadata. */
export function threlteExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [Threlte] Facade hoạt ảnh: exportFullPayload. */
export function threlteExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'threlte').payload, exportClipForLibrary(clip, 'threlte').payload);
  return operation(clip);
}

/** [Threlte] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function threlteFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [OGL] Facade hoạt ảnh: exportClip. */
export function oglExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'ogl');
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportClipStats. */
export function oglExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportTracks. */
export function oglExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportTrackStats. */
export function oglExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportEventTimes. */
export function oglExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportEventNames. */
export function oglExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportDuration. */
export function oglExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportTargets. */
export function oglExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportKeyCounts. */
export function oglExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportInterpolations. */
export function oglExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportMetadata. */
export function oglExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [OGL] Facade hoạt ảnh: exportFullPayload. */
export function oglExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'ogl').payload, exportClipForLibrary(clip, 'ogl').payload);
  return operation(clip);
}

/** [OGL] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function oglFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [regl] Facade hoạt ảnh: exportClip. */
export function reglExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'regl');
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportClipStats. */
export function reglExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportTracks. */
export function reglExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportTrackStats. */
export function reglExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportEventTimes. */
export function reglExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportEventNames. */
export function reglExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportDuration. */
export function reglExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportTargets. */
export function reglExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportKeyCounts. */
export function reglExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportInterpolations. */
export function reglExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportMetadata. */
export function reglExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [regl] Facade hoạt ảnh: exportFullPayload. */
export function reglExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'regl').payload, exportClipForLibrary(clip, 'regl').payload);
  return operation(clip);
}

/** [regl] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function reglFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [twgl.js] Facade hoạt ảnh: exportClip. */
export function twglExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'twgl');
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportClipStats. */
export function twglExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportTracks. */
export function twglExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportTrackStats. */
export function twglExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportEventTimes. */
export function twglExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportEventNames. */
export function twglExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportDuration. */
export function twglExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportTargets. */
export function twglExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportKeyCounts. */
export function twglExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportInterpolations. */
export function twglExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportMetadata. */
export function twglExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [twgl.js] Facade hoạt ảnh: exportFullPayload. */
export function twglExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'twgl').payload, exportClipForLibrary(clip, 'twgl').payload);
  return operation(clip);
}

/** [twgl.js] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function twglFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [luma.gl] Facade hoạt ảnh: exportClip. */
export function lumaExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'luma.gl');
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportClipStats. */
export function lumaExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportTracks. */
export function lumaExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportTrackStats. */
export function lumaExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportEventTimes. */
export function lumaExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportEventNames. */
export function lumaExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportDuration. */
export function lumaExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportTargets. */
export function lumaExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportKeyCounts. */
export function lumaExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportInterpolations. */
export function lumaExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportMetadata. */
export function lumaExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [luma.gl] Facade hoạt ảnh: exportFullPayload. */
export function lumaExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'luma.gl').payload, exportClipForLibrary(clip, 'luma.gl').payload);
  return operation(clip);
}

/** [luma.gl] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function lumaFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [vtk.js] Facade hoạt ảnh: exportClip. */
export function vtkExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'vtk.js');
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportClipStats. */
export function vtkExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportTracks. */
export function vtkExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportTrackStats. */
export function vtkExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportEventTimes. */
export function vtkExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportEventNames. */
export function vtkExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportDuration. */
export function vtkExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportTargets. */
export function vtkExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportKeyCounts. */
export function vtkExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportInterpolations. */
export function vtkExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportMetadata. */
export function vtkExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [vtk.js] Facade hoạt ảnh: exportFullPayload. */
export function vtkExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'vtk.js').payload, exportClipForLibrary(clip, 'vtk.js').payload);
  return operation(clip);
}

/** [vtk.js] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function vtkFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [deck.gl] Facade hoạt ảnh: exportClip. */
export function deckExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'deck.gl');
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportClipStats. */
export function deckExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportTracks. */
export function deckExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportTrackStats. */
export function deckExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportEventTimes. */
export function deckExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportEventNames. */
export function deckExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportDuration. */
export function deckExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportTargets. */
export function deckExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportKeyCounts. */
export function deckExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportInterpolations. */
export function deckExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportMetadata. */
export function deckExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [deck.gl] Facade hoạt ảnh: exportFullPayload. */
export function deckExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'deck.gl').payload, exportClipForLibrary(clip, 'deck.gl').payload);
  return operation(clip);
}

/** [deck.gl] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function deckFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [xeokit] Facade hoạt ảnh: exportClip. */
export function xeokitExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'xeokit');
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportClipStats. */
export function xeokitExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportTracks. */
export function xeokitExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportTrackStats. */
export function xeokitExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportEventTimes. */
export function xeokitExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportEventNames. */
export function xeokitExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportDuration. */
export function xeokitExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportTargets. */
export function xeokitExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportKeyCounts. */
export function xeokitExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportInterpolations. */
export function xeokitExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportMetadata. */
export function xeokitExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [xeokit] Facade hoạt ảnh: exportFullPayload. */
export function xeokitExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'xeokit').payload, exportClipForLibrary(clip, 'xeokit').payload);
  return operation(clip);
}

/** [xeokit] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function xeokitFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [CesiumJS] Facade hoạt ảnh: exportClip. */
export function cesiumExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'cesium');
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportClipStats. */
export function cesiumExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportTracks. */
export function cesiumExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportTrackStats. */
export function cesiumExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportEventTimes. */
export function cesiumExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportEventNames. */
export function cesiumExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportDuration. */
export function cesiumExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportTargets. */
export function cesiumExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportKeyCounts. */
export function cesiumExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportInterpolations. */
export function cesiumExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportMetadata. */
export function cesiumExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [CesiumJS] Facade hoạt ảnh: exportFullPayload. */
export function cesiumExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'cesium').payload, exportClipForLibrary(clip, 'cesium').payload);
  return operation(clip);
}

/** [CesiumJS] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function cesiumFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [Zdog] Facade hoạt ảnh: exportClip. */
export function zdogExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'zdog');
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportClipStats. */
export function zdogExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportTracks. */
export function zdogExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportTrackStats. */
export function zdogExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportEventTimes. */
export function zdogExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportEventNames. */
export function zdogExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportDuration. */
export function zdogExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportTargets. */
export function zdogExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportKeyCounts. */
export function zdogExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportInterpolations. */
export function zdogExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportMetadata. */
export function zdogExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [Zdog] Facade hoạt ảnh: exportFullPayload. */
export function zdogExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'zdog').payload, exportClipForLibrary(clip, 'zdog').payload);
  return operation(clip);
}

/** [Zdog] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function zdogFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [Filament] Facade hoạt ảnh: exportClip. */
export function filamentExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'filament');
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportClipStats. */
export function filamentExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportTracks. */
export function filamentExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportTrackStats. */
export function filamentExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportEventTimes. */
export function filamentExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportEventNames. */
export function filamentExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportDuration. */
export function filamentExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportTargets. */
export function filamentExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportKeyCounts. */
export function filamentExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportInterpolations. */
export function filamentExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportMetadata. */
export function filamentExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [Filament] Facade hoạt ảnh: exportFullPayload. */
export function filamentExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'filament').payload, exportClipForLibrary(clip, 'filament').payload);
  return operation(clip);
}

/** [Filament] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function filamentFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportClip. */
export function osgExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'openscenegraph');
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportClipStats. */
export function osgExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportTracks. */
export function osgExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportTrackStats. */
export function osgExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportEventTimes. */
export function osgExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportEventNames. */
export function osgExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportDuration. */
export function osgExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportTargets. */
export function osgExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportKeyCounts. */
export function osgExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportInterpolations. */
export function osgExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportMetadata. */
export function osgExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [OpenSceneGraph] Facade hoạt ảnh: exportFullPayload. */
export function osgExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'openscenegraph').payload, exportClipForLibrary(clip, 'openscenegraph').payload);
  return operation(clip);
}

/** [OpenSceneGraph] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function osgFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}

/** [OGRE] Facade hoạt ảnh: exportClip. */
export function ogreExportClip(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => exportClipForLibrary(clip, 'ogre');
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportClipStats. */
export function ogreExportClipStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.stats();
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportTracks. */
export function ogreExportTracks(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.name);
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportTrackStats. */
export function ogreExportTrackStats(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => trackStats(track));
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportEventTimes. */
export function ogreExportEventTimes(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.time);
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportEventNames. */
export function ogreExportEventNames(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.events.map((event) => event.name);
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportDuration. */
export function ogreExportDuration(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.duration;
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportTargets. */
export function ogreExportTargets(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => [...new Set(clip.tracks.map((track: AnimationTrack) => track.targetPath))];
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportKeyCounts. */
export function ogreExportKeyCounts(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.keys.length);
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportInterpolations. */
export function ogreExportInterpolations(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.tracks.map((track: AnimationTrack) => track.interpolation);
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportMetadata. */
export function ogreExportMetadata(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => clip.metadata;
  return operation(clip);
}

/** [OGRE] Facade hoạt ảnh: exportFullPayload. */
export function ogreExportFullPayload(clip: AnimationClip): unknown {
  const operation = (clip: AnimationClip) => combineExports(exportClipForLibrary(clip, 'ogre').payload, exportClipForLibrary(clip, 'ogre').payload);
  return operation(clip);
}

/** [OGRE] Kiểm tra nhanh payload facade có đủ khóa scene. */
export function ogreFacadeIsValid(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['scene']);
}
