/**
 * @file generated-clip-inspectors.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import type { AnimationClip } from '../../../animation/clip.js';
import { estimateCycleDuration, isCyclic, trackRangeOnInterval } from '../../../animation/samplers.js';
import { keyCount } from '../../../animation/curve.js';


/** [Three.js] Clip có track quaternion không. */
export function threeClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [Three.js] Số event của clip. */
export function threeClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [Three.js] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function threeClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [Three.js] Chu kỳ ước lượng từ track đầu tiên. */
export function threeClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [Three.js] Số keyframe tổng của clip. */
export function threeClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [Three.js] Miễn giá trị track đầu trên khoảng (min/max). */
export function threeClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [Babylon.js] Clip có track quaternion không. */
export function babylonClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [Babylon.js] Số event của clip. */
export function babylonClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [Babylon.js] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function babylonClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [Babylon.js] Chu kỳ ước lượng từ track đầu tiên. */
export function babylonClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [Babylon.js] Số keyframe tổng của clip. */
export function babylonClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [Babylon.js] Miễn giá trị track đầu trên khoảng (min/max). */
export function babylonClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [Babylon Native] Clip có track quaternion không. */
export function babylonnativeClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [Babylon Native] Số event của clip. */
export function babylonnativeClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [Babylon Native] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function babylonnativeClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [Babylon Native] Chu kỳ ước lượng từ track đầu tiên. */
export function babylonnativeClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [Babylon Native] Số keyframe tổng của clip. */
export function babylonnativeClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [Babylon Native] Miễn giá trị track đầu trên khoảng (min/max). */
export function babylonnativeClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [PlayCanvas Engine] Clip có track quaternion không. */
export function playcanvasClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [PlayCanvas Engine] Số event của clip. */
export function playcanvasClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [PlayCanvas Engine] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function playcanvasClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [PlayCanvas Engine] Chu kỳ ước lượng từ track đầu tiên. */
export function playcanvasClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [PlayCanvas Engine] Số keyframe tổng của clip. */
export function playcanvasClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [PlayCanvas Engine] Miễn giá trị track đầu trên khoảng (min/max). */
export function playcanvasClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [Verge3D] Clip có track quaternion không. */
export function verge3dClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [Verge3D] Số event của clip. */
export function verge3dClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [Verge3D] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function verge3dClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [Verge3D] Chu kỳ ước lượng từ track đầu tiên. */
export function verge3dClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [Verge3D] Số keyframe tổng của clip. */
export function verge3dClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [Verge3D] Miễn giá trị track đầu trên khoảng (min/max). */
export function verge3dClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [A-Frame] Clip có track quaternion không. */
export function aframeClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [A-Frame] Số event của clip. */
export function aframeClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [A-Frame] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function aframeClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [A-Frame] Chu kỳ ước lượng từ track đầu tiên. */
export function aframeClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [A-Frame] Số keyframe tổng của clip. */
export function aframeClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [A-Frame] Miễn giá trị track đầu trên khoảng (min/max). */
export function aframeClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [React Three Fiber] Clip có track quaternion không. */
export function r3fClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [React Three Fiber] Số event của clip. */
export function r3fClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [React Three Fiber] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function r3fClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [React Three Fiber] Chu kỳ ước lượng từ track đầu tiên. */
export function r3fClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [React Three Fiber] Số keyframe tổng của clip. */
export function r3fClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [React Three Fiber] Miễn giá trị track đầu trên khoảng (min/max). */
export function r3fClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [Threlte] Clip có track quaternion không. */
export function threlteClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [Threlte] Số event của clip. */
export function threlteClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [Threlte] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function threlteClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [Threlte] Chu kỳ ước lượng từ track đầu tiên. */
export function threlteClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [Threlte] Số keyframe tổng của clip. */
export function threlteClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [Threlte] Miễn giá trị track đầu trên khoảng (min/max). */
export function threlteClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [OGL] Clip có track quaternion không. */
export function oglClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [OGL] Số event của clip. */
export function oglClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [OGL] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function oglClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [OGL] Chu kỳ ước lượng từ track đầu tiên. */
export function oglClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [OGL] Số keyframe tổng của clip. */
export function oglClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [OGL] Miễn giá trị track đầu trên khoảng (min/max). */
export function oglClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [regl] Clip có track quaternion không. */
export function reglClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [regl] Số event của clip. */
export function reglClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [regl] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function reglClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [regl] Chu kỳ ước lượng từ track đầu tiên. */
export function reglClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [regl] Số keyframe tổng của clip. */
export function reglClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [regl] Miễn giá trị track đầu trên khoảng (min/max). */
export function reglClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [twgl.js] Clip có track quaternion không. */
export function twglClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [twgl.js] Số event của clip. */
export function twglClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [twgl.js] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function twglClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [twgl.js] Chu kỳ ước lượng từ track đầu tiên. */
export function twglClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [twgl.js] Số keyframe tổng của clip. */
export function twglClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [twgl.js] Miễn giá trị track đầu trên khoảng (min/max). */
export function twglClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [luma.gl] Clip có track quaternion không. */
export function lumaClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [luma.gl] Số event của clip. */
export function lumaClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [luma.gl] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function lumaClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [luma.gl] Chu kỳ ước lượng từ track đầu tiên. */
export function lumaClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [luma.gl] Số keyframe tổng của clip. */
export function lumaClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [luma.gl] Miễn giá trị track đầu trên khoảng (min/max). */
export function lumaClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [vtk.js] Clip có track quaternion không. */
export function vtkClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [vtk.js] Số event của clip. */
export function vtkClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [vtk.js] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function vtkClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [vtk.js] Chu kỳ ước lượng từ track đầu tiên. */
export function vtkClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [vtk.js] Số keyframe tổng của clip. */
export function vtkClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [vtk.js] Miễn giá trị track đầu trên khoảng (min/max). */
export function vtkClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [deck.gl] Clip có track quaternion không. */
export function deckClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [deck.gl] Số event của clip. */
export function deckClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [deck.gl] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function deckClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [deck.gl] Chu kỳ ước lượng từ track đầu tiên. */
export function deckClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [deck.gl] Số keyframe tổng của clip. */
export function deckClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [deck.gl] Miễn giá trị track đầu trên khoảng (min/max). */
export function deckClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [xeokit] Clip có track quaternion không. */
export function xeokitClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [xeokit] Số event của clip. */
export function xeokitClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [xeokit] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function xeokitClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [xeokit] Chu kỳ ước lượng từ track đầu tiên. */
export function xeokitClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [xeokit] Số keyframe tổng của clip. */
export function xeokitClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [xeokit] Miễn giá trị track đầu trên khoảng (min/max). */
export function xeokitClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [CesiumJS] Clip có track quaternion không. */
export function cesiumClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [CesiumJS] Số event của clip. */
export function cesiumClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [CesiumJS] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function cesiumClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [CesiumJS] Chu kỳ ước lượng từ track đầu tiên. */
export function cesiumClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [CesiumJS] Số keyframe tổng của clip. */
export function cesiumClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [CesiumJS] Miễn giá trị track đầu trên khoảng (min/max). */
export function cesiumClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [Zdog] Clip có track quaternion không. */
export function zdogClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [Zdog] Số event của clip. */
export function zdogClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [Zdog] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function zdogClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [Zdog] Chu kỳ ước lượng từ track đầu tiên. */
export function zdogClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [Zdog] Số keyframe tổng của clip. */
export function zdogClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [Zdog] Miễn giá trị track đầu trên khoảng (min/max). */
export function zdogClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [Filament] Clip có track quaternion không. */
export function filamentClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [Filament] Số event của clip. */
export function filamentClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [Filament] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function filamentClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [Filament] Chu kỳ ước lượng từ track đầu tiên. */
export function filamentClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [Filament] Số keyframe tổng của clip. */
export function filamentClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [Filament] Miễn giá trị track đầu trên khoảng (min/max). */
export function filamentClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [OpenSceneGraph] Clip có track quaternion không. */
export function osgClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [OpenSceneGraph] Số event của clip. */
export function osgClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [OpenSceneGraph] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function osgClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [OpenSceneGraph] Chu kỳ ước lượng từ track đầu tiên. */
export function osgClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [OpenSceneGraph] Số keyframe tổng của clip. */
export function osgClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [OpenSceneGraph] Miễn giá trị track đầu trên khoảng (min/max). */
export function osgClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}

/** [OGRE] Clip có track quaternion không. */
export function ogreClipHasQuaternion(clip: AnimationClip): boolean {
  return clip.tracks.some((track) => track.kind === 'quaternion');
}

/** [OGRE] Số event của clip. */
export function ogreClipEventCount(clip: AnimationClip): number {
  return clip.events.length;
}

/** [OGRE] Clip tuần hoàn sạch (giá trị đầu ≡ cuối). */
export function ogreClipIsCyclic(clip: AnimationClip, tolerance = 1e-3): boolean {
  return clip.tracks.length > 0 && clip.tracks.every((track) => isCyclic(track, tolerance));
}

/** [OGRE] Chu kỳ ước lượng từ track đầu tiên. */
export function ogreClipCycleDuration(clip: AnimationClip): number {
  return clip.tracks.length > 0 ? estimateCycleDuration(clip.tracks[0]) : 0;
}

/** [OGRE] Số keyframe tổng của clip. */
export function ogreClipKeyCount(clip: AnimationClip): number {
  return clip.tracks.reduce((sum, track) => sum + keyCount(track), 0);
}

/** [OGRE] Miễn giá trị track đầu trên khoảng (min/max). */
export function ogreClipTrackRange(clip: AnimationClip, start: number, end: number): { min: number; max: number } {
  return clip.tracks.length > 0 ? trackRangeOnInterval(clip.tracks[0], start, end) : { min: 0, max: 0 };
}
