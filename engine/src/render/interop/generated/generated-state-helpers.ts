/**
 * @file generated-state-helpers.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import { AnimationStateMachine, type AnimationStateMachineConfig } from '../../../animation/state-machine.js';
import type { AnimationClip } from '../../../animation/clip.js';


/** [Three.js] Dựng state machine từ cấu hình. */
export function createThreeStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [Three.js] Bảng duration clip phục vụ update machine. */
export function threeClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [Three.js] Tiến machine một bước với durations đã map. */
export function threeAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [Three.js] Đặt tham số machine nhanh. */
export function threeSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [Babylon.js] Dựng state machine từ cấu hình. */
export function createBabylonStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [Babylon.js] Bảng duration clip phục vụ update machine. */
export function babylonClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [Babylon.js] Tiến machine một bước với durations đã map. */
export function babylonAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [Babylon.js] Đặt tham số machine nhanh. */
export function babylonSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [Babylon Native] Dựng state machine từ cấu hình. */
export function createBabylonNativeStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [Babylon Native] Bảng duration clip phục vụ update machine. */
export function babylonnativeClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [Babylon Native] Tiến machine một bước với durations đã map. */
export function babylonnativeAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [Babylon Native] Đặt tham số machine nhanh. */
export function babylonnativeSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [PlayCanvas Engine] Dựng state machine từ cấu hình. */
export function createPlaycanvasStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [PlayCanvas Engine] Bảng duration clip phục vụ update machine. */
export function playcanvasClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [PlayCanvas Engine] Tiến machine một bước với durations đã map. */
export function playcanvasAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [PlayCanvas Engine] Đặt tham số machine nhanh. */
export function playcanvasSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [Verge3D] Dựng state machine từ cấu hình. */
export function createVerge3dStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [Verge3D] Bảng duration clip phục vụ update machine. */
export function verge3dClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [Verge3D] Tiến machine một bước với durations đã map. */
export function verge3dAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [Verge3D] Đặt tham số machine nhanh. */
export function verge3dSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [A-Frame] Dựng state machine từ cấu hình. */
export function createAframeStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [A-Frame] Bảng duration clip phục vụ update machine. */
export function aframeClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [A-Frame] Tiến machine một bước với durations đã map. */
export function aframeAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [A-Frame] Đặt tham số machine nhanh. */
export function aframeSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [React Three Fiber] Dựng state machine từ cấu hình. */
export function createR3fStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [React Three Fiber] Bảng duration clip phục vụ update machine. */
export function r3fClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [React Three Fiber] Tiến machine một bước với durations đã map. */
export function r3fAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [React Three Fiber] Đặt tham số machine nhanh. */
export function r3fSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [Threlte] Dựng state machine từ cấu hình. */
export function createThrelteStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [Threlte] Bảng duration clip phục vụ update machine. */
export function threlteClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [Threlte] Tiến machine một bước với durations đã map. */
export function threlteAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [Threlte] Đặt tham số machine nhanh. */
export function threlteSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [OGL] Dựng state machine từ cấu hình. */
export function createOglStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [OGL] Bảng duration clip phục vụ update machine. */
export function oglClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [OGL] Tiến machine một bước với durations đã map. */
export function oglAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [OGL] Đặt tham số machine nhanh. */
export function oglSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [regl] Dựng state machine từ cấu hình. */
export function createReglStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [regl] Bảng duration clip phục vụ update machine. */
export function reglClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [regl] Tiến machine một bước với durations đã map. */
export function reglAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [regl] Đặt tham số machine nhanh. */
export function reglSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [twgl.js] Dựng state machine từ cấu hình. */
export function createTwglStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [twgl.js] Bảng duration clip phục vụ update machine. */
export function twglClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [twgl.js] Tiến machine một bước với durations đã map. */
export function twglAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [twgl.js] Đặt tham số machine nhanh. */
export function twglSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [luma.gl] Dựng state machine từ cấu hình. */
export function createLumaStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [luma.gl] Bảng duration clip phục vụ update machine. */
export function lumaClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [luma.gl] Tiến machine một bước với durations đã map. */
export function lumaAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [luma.gl] Đặt tham số machine nhanh. */
export function lumaSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [vtk.js] Dựng state machine từ cấu hình. */
export function createVtkStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [vtk.js] Bảng duration clip phục vụ update machine. */
export function vtkClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [vtk.js] Tiến machine một bước với durations đã map. */
export function vtkAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [vtk.js] Đặt tham số machine nhanh. */
export function vtkSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [deck.gl] Dựng state machine từ cấu hình. */
export function createDeckStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [deck.gl] Bảng duration clip phục vụ update machine. */
export function deckClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [deck.gl] Tiến machine một bước với durations đã map. */
export function deckAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [deck.gl] Đặt tham số machine nhanh. */
export function deckSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [xeokit] Dựng state machine từ cấu hình. */
export function createXeokitStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [xeokit] Bảng duration clip phục vụ update machine. */
export function xeokitClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [xeokit] Tiến machine một bước với durations đã map. */
export function xeokitAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [xeokit] Đặt tham số machine nhanh. */
export function xeokitSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [CesiumJS] Dựng state machine từ cấu hình. */
export function createCesiumStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [CesiumJS] Bảng duration clip phục vụ update machine. */
export function cesiumClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [CesiumJS] Tiến machine một bước với durations đã map. */
export function cesiumAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [CesiumJS] Đặt tham số machine nhanh. */
export function cesiumSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [Zdog] Dựng state machine từ cấu hình. */
export function createZdogStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [Zdog] Bảng duration clip phục vụ update machine. */
export function zdogClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [Zdog] Tiến machine một bước với durations đã map. */
export function zdogAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [Zdog] Đặt tham số machine nhanh. */
export function zdogSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [Filament] Dựng state machine từ cấu hình. */
export function createFilamentStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [Filament] Bảng duration clip phục vụ update machine. */
export function filamentClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [Filament] Tiến machine một bước với durations đã map. */
export function filamentAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [Filament] Đặt tham số machine nhanh. */
export function filamentSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [OpenSceneGraph] Dựng state machine từ cấu hình. */
export function createOsgStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [OpenSceneGraph] Bảng duration clip phục vụ update machine. */
export function osgClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [OpenSceneGraph] Tiến machine một bước với durations đã map. */
export function osgAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [OpenSceneGraph] Đặt tham số machine nhanh. */
export function osgSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}

/** [OGRE] Dựng state machine từ cấu hình. */
export function createOgreStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** [OGRE] Bảng duration clip phục vụ update machine. */
export function ogreClipDurations(clips: readonly AnimationClip[]): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const clip of clips) durations[clip.name] = clip.duration;
  return durations;
}

/** [OGRE] Tiến machine một bước với durations đã map. */
export function ogreAdvanceMachine(machine: AnimationStateMachine, dt: number, durations: Record<string, number>): ReturnType<AnimationStateMachine['update']> {
  return machine.update(dt, durations);
}

/** [OGRE] Đặt tham số machine nhanh. */
export function ogreSetParameter(machine: AnimationStateMachine, name: string, value: number | boolean): void {
  machine.setParameter(name, value);
}
