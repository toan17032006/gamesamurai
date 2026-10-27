/**
 * @file generated-event-mappings.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import {
  mapEventNameToLibrary,
  mapEventNameFromLibrary,
} from '../matrix-core.js';


/** [Three.js] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToThree(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'three'), payload: { ...event.payload } };
}

/** [Three.js] Đổi event thư viện về sự kiện gameplay. */
export function threeEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'three'), payload: { ...event.payload } };
}

/** [Three.js] Danh sách event name đã ánh xạ cho thư viện. */
export function threeEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'three'));
}

/** [Babylon.js] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToBabylon(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'babylon'), payload: { ...event.payload } };
}

/** [Babylon.js] Đổi event thư viện về sự kiện gameplay. */
export function babylonEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'babylon'), payload: { ...event.payload } };
}

/** [Babylon.js] Danh sách event name đã ánh xạ cho thư viện. */
export function babylonEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'babylon'));
}

/** [Babylon Native] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToBabylonNative(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'bnative'), payload: { ...event.payload } };
}

/** [Babylon Native] Đổi event thư viện về sự kiện gameplay. */
export function babylonnativeEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'bnative'), payload: { ...event.payload } };
}

/** [Babylon Native] Danh sách event name đã ánh xạ cho thư viện. */
export function babylonnativeEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'bnative'));
}

/** [PlayCanvas Engine] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToPlaycanvas(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'pc'), payload: { ...event.payload } };
}

/** [PlayCanvas Engine] Đổi event thư viện về sự kiện gameplay. */
export function playcanvasEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'pc'), payload: { ...event.payload } };
}

/** [PlayCanvas Engine] Danh sách event name đã ánh xạ cho thư viện. */
export function playcanvasEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'pc'));
}

/** [Verge3D] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToVerge3d(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'v3d'), payload: { ...event.payload } };
}

/** [Verge3D] Đổi event thư viện về sự kiện gameplay. */
export function verge3dEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'v3d'), payload: { ...event.payload } };
}

/** [Verge3D] Danh sách event name đã ánh xạ cho thư viện. */
export function verge3dEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'v3d'));
}

/** [A-Frame] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToAframe(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'aframe'), payload: { ...event.payload } };
}

/** [A-Frame] Đổi event thư viện về sự kiện gameplay. */
export function aframeEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'aframe'), payload: { ...event.payload } };
}

/** [A-Frame] Danh sách event name đã ánh xạ cho thư viện. */
export function aframeEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'aframe'));
}

/** [React Three Fiber] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToR3f(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'r3f'), payload: { ...event.payload } };
}

/** [React Three Fiber] Đổi event thư viện về sự kiện gameplay. */
export function r3fEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'r3f'), payload: { ...event.payload } };
}

/** [React Three Fiber] Danh sách event name đã ánh xạ cho thư viện. */
export function r3fEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'r3f'));
}

/** [Threlte] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToThrelte(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'threlte'), payload: { ...event.payload } };
}

/** [Threlte] Đổi event thư viện về sự kiện gameplay. */
export function threlteEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'threlte'), payload: { ...event.payload } };
}

/** [Threlte] Danh sách event name đã ánh xạ cho thư viện. */
export function threlteEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'threlte'));
}

/** [OGL] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToOgl(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'ogl'), payload: { ...event.payload } };
}

/** [OGL] Đổi event thư viện về sự kiện gameplay. */
export function oglEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'ogl'), payload: { ...event.payload } };
}

/** [OGL] Danh sách event name đã ánh xạ cho thư viện. */
export function oglEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'ogl'));
}

/** [regl] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToRegl(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'regl'), payload: { ...event.payload } };
}

/** [regl] Đổi event thư viện về sự kiện gameplay. */
export function reglEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'regl'), payload: { ...event.payload } };
}

/** [regl] Danh sách event name đã ánh xạ cho thư viện. */
export function reglEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'regl'));
}

/** [twgl.js] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToTwgl(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'twgl'), payload: { ...event.payload } };
}

/** [twgl.js] Đổi event thư viện về sự kiện gameplay. */
export function twglEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'twgl'), payload: { ...event.payload } };
}

/** [twgl.js] Danh sách event name đã ánh xạ cho thư viện. */
export function twglEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'twgl'));
}

/** [luma.gl] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToLuma(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'luma'), payload: { ...event.payload } };
}

/** [luma.gl] Đổi event thư viện về sự kiện gameplay. */
export function lumaEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'luma'), payload: { ...event.payload } };
}

/** [luma.gl] Danh sách event name đã ánh xạ cho thư viện. */
export function lumaEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'luma'));
}

/** [vtk.js] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToVtk(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'vtk'), payload: { ...event.payload } };
}

/** [vtk.js] Đổi event thư viện về sự kiện gameplay. */
export function vtkEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'vtk'), payload: { ...event.payload } };
}

/** [vtk.js] Danh sách event name đã ánh xạ cho thư viện. */
export function vtkEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'vtk'));
}

/** [deck.gl] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToDeck(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'deck'), payload: { ...event.payload } };
}

/** [deck.gl] Đổi event thư viện về sự kiện gameplay. */
export function deckEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'deck'), payload: { ...event.payload } };
}

/** [deck.gl] Danh sách event name đã ánh xạ cho thư viện. */
export function deckEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'deck'));
}

/** [xeokit] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToXeokit(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'xeo'), payload: { ...event.payload } };
}

/** [xeokit] Đổi event thư viện về sự kiện gameplay. */
export function xeokitEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'xeo'), payload: { ...event.payload } };
}

/** [xeokit] Danh sách event name đã ánh xạ cho thư viện. */
export function xeokitEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'xeo'));
}

/** [CesiumJS] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToCesium(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'cesium'), payload: { ...event.payload } };
}

/** [CesiumJS] Đổi event thư viện về sự kiện gameplay. */
export function cesiumEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'cesium'), payload: { ...event.payload } };
}

/** [CesiumJS] Danh sách event name đã ánh xạ cho thư viện. */
export function cesiumEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'cesium'));
}

/** [Zdog] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToZdog(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'zdog'), payload: { ...event.payload } };
}

/** [Zdog] Đổi event thư viện về sự kiện gameplay. */
export function zdogEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'zdog'), payload: { ...event.payload } };
}

/** [Zdog] Danh sách event name đã ánh xạ cho thư viện. */
export function zdogEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'zdog'));
}

/** [Filament] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToFilament(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'filament'), payload: { ...event.payload } };
}

/** [Filament] Đổi event thư viện về sự kiện gameplay. */
export function filamentEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'filament'), payload: { ...event.payload } };
}

/** [Filament] Danh sách event name đã ánh xạ cho thư viện. */
export function filamentEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'filament'));
}

/** [OpenSceneGraph] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToOsg(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'osg'), payload: { ...event.payload } };
}

/** [OpenSceneGraph] Đổi event thư viện về sự kiện gameplay. */
export function osgEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'osg'), payload: { ...event.payload } };
}

/** [OpenSceneGraph] Danh sách event name đã ánh xạ cho thư viện. */
export function osgEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'osg'));
}

/** [OGRE] Đổi sự kiện gameplay sang định dạng event thư viện. */
export function animationEventToOgre(event: { time: number; name: string; payload?: Record<string, unknown> }): Record<string, unknown> {
  return { time: event.time, name: mapEventNameToLibrary(event.name, 'ogre'), payload: { ...event.payload } };
}

/** [OGRE] Đổi event thư viện về sự kiện gameplay. */
export function ogreEventToAnimation(event: { time: number; name: string; payload?: Record<string, unknown> }): { time: number; name: string; payload?: Record<string, unknown> } {
  return { time: event.time, name: mapEventNameFromLibrary(event.name, 'ogre'), payload: { ...event.payload } };
}

/** [OGRE] Danh sách event name đã ánh xạ cho thư viện. */
export function ogreEventNames(names: readonly string[]): string[] {
  return names.map((name) => mapEventNameToLibrary(name, 'ogre'));
}
