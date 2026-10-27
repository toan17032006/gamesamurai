/**
 * @file generated-converters.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import {
  convertPositionToLibrary,
  convertPositionFromLibrary,
  convertQuaternionToLibrary,
  convertScaleToLibrary,
  type CoordinateConvention,
} from '../matrix-core.js';

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


/** [Three.js] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toThreePosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Three);
}

/** [Three.js] Đổi vị trí từ quy ước thư viện về engine. */
export function fromThreePosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Three);
}

/** [Three.js] Đổi quaternion engine sang quy ước thư viện. */
export function toThreeQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Three);
}

/** [Three.js] Đổi vector scale theo đơn vị thư viện. */
export function toThreeScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Three.unitScale);
}

/** [Three.js] Trục lên của thư viện. */
export function threeUpAxis(): 'y' | 'z' {
  return CONVENTION_Three.upAxis;
}

/** [Three.js] Tay hệ trục của thư viện. */
export function threeHandedness(): 'left' | 'right' {
  return CONVENTION_Three.handedness;
}

/** [Three.js] Hệ số đơn vị (nhân từ mét). */
export function threeUnitScale(): number {
  return CONVENTION_Three.unitScale;
}

/** [Three.js] Bản sao quy ước hệ trục đầy đủ. */
export function threeConvention(): CoordinateConvention {
  return { ...CONVENTION_Three };
}

/** [Babylon.js] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toBabylonPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Babylon);
}

/** [Babylon.js] Đổi vị trí từ quy ước thư viện về engine. */
export function fromBabylonPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Babylon);
}

/** [Babylon.js] Đổi quaternion engine sang quy ước thư viện. */
export function toBabylonQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Babylon);
}

/** [Babylon.js] Đổi vector scale theo đơn vị thư viện. */
export function toBabylonScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Babylon.unitScale);
}

/** [Babylon.js] Trục lên của thư viện. */
export function babylonUpAxis(): 'y' | 'z' {
  return CONVENTION_Babylon.upAxis;
}

/** [Babylon.js] Tay hệ trục của thư viện. */
export function babylonHandedness(): 'left' | 'right' {
  return CONVENTION_Babylon.handedness;
}

/** [Babylon.js] Hệ số đơn vị (nhân từ mét). */
export function babylonUnitScale(): number {
  return CONVENTION_Babylon.unitScale;
}

/** [Babylon.js] Bản sao quy ước hệ trục đầy đủ. */
export function babylonConvention(): CoordinateConvention {
  return { ...CONVENTION_Babylon };
}

/** [Babylon Native] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toBabylonNativePosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_BabylonNative);
}

/** [Babylon Native] Đổi vị trí từ quy ước thư viện về engine. */
export function fromBabylonNativePosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_BabylonNative);
}

/** [Babylon Native] Đổi quaternion engine sang quy ước thư viện. */
export function toBabylonNativeQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_BabylonNative);
}

/** [Babylon Native] Đổi vector scale theo đơn vị thư viện. */
export function toBabylonNativeScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_BabylonNative.unitScale);
}

/** [Babylon Native] Trục lên của thư viện. */
export function babylonnativeUpAxis(): 'y' | 'z' {
  return CONVENTION_BabylonNative.upAxis;
}

/** [Babylon Native] Tay hệ trục của thư viện. */
export function babylonnativeHandedness(): 'left' | 'right' {
  return CONVENTION_BabylonNative.handedness;
}

/** [Babylon Native] Hệ số đơn vị (nhân từ mét). */
export function babylonnativeUnitScale(): number {
  return CONVENTION_BabylonNative.unitScale;
}

/** [Babylon Native] Bản sao quy ước hệ trục đầy đủ. */
export function babylonnativeConvention(): CoordinateConvention {
  return { ...CONVENTION_BabylonNative };
}

/** [PlayCanvas Engine] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toPlaycanvasPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Playcanvas);
}

/** [PlayCanvas Engine] Đổi vị trí từ quy ước thư viện về engine. */
export function fromPlaycanvasPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Playcanvas);
}

/** [PlayCanvas Engine] Đổi quaternion engine sang quy ước thư viện. */
export function toPlaycanvasQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Playcanvas);
}

/** [PlayCanvas Engine] Đổi vector scale theo đơn vị thư viện. */
export function toPlaycanvasScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Playcanvas.unitScale);
}

/** [PlayCanvas Engine] Trục lên của thư viện. */
export function playcanvasUpAxis(): 'y' | 'z' {
  return CONVENTION_Playcanvas.upAxis;
}

/** [PlayCanvas Engine] Tay hệ trục của thư viện. */
export function playcanvasHandedness(): 'left' | 'right' {
  return CONVENTION_Playcanvas.handedness;
}

/** [PlayCanvas Engine] Hệ số đơn vị (nhân từ mét). */
export function playcanvasUnitScale(): number {
  return CONVENTION_Playcanvas.unitScale;
}

/** [PlayCanvas Engine] Bản sao quy ước hệ trục đầy đủ. */
export function playcanvasConvention(): CoordinateConvention {
  return { ...CONVENTION_Playcanvas };
}

/** [Verge3D] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toVerge3dPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Verge3d);
}

/** [Verge3D] Đổi vị trí từ quy ước thư viện về engine. */
export function fromVerge3dPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Verge3d);
}

/** [Verge3D] Đổi quaternion engine sang quy ước thư viện. */
export function toVerge3dQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Verge3d);
}

/** [Verge3D] Đổi vector scale theo đơn vị thư viện. */
export function toVerge3dScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Verge3d.unitScale);
}

/** [Verge3D] Trục lên của thư viện. */
export function verge3dUpAxis(): 'y' | 'z' {
  return CONVENTION_Verge3d.upAxis;
}

/** [Verge3D] Tay hệ trục của thư viện. */
export function verge3dHandedness(): 'left' | 'right' {
  return CONVENTION_Verge3d.handedness;
}

/** [Verge3D] Hệ số đơn vị (nhân từ mét). */
export function verge3dUnitScale(): number {
  return CONVENTION_Verge3d.unitScale;
}

/** [Verge3D] Bản sao quy ước hệ trục đầy đủ. */
export function verge3dConvention(): CoordinateConvention {
  return { ...CONVENTION_Verge3d };
}

/** [A-Frame] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toAframePosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Aframe);
}

/** [A-Frame] Đổi vị trí từ quy ước thư viện về engine. */
export function fromAframePosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Aframe);
}

/** [A-Frame] Đổi quaternion engine sang quy ước thư viện. */
export function toAframeQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Aframe);
}

/** [A-Frame] Đổi vector scale theo đơn vị thư viện. */
export function toAframeScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Aframe.unitScale);
}

/** [A-Frame] Trục lên của thư viện. */
export function aframeUpAxis(): 'y' | 'z' {
  return CONVENTION_Aframe.upAxis;
}

/** [A-Frame] Tay hệ trục của thư viện. */
export function aframeHandedness(): 'left' | 'right' {
  return CONVENTION_Aframe.handedness;
}

/** [A-Frame] Hệ số đơn vị (nhân từ mét). */
export function aframeUnitScale(): number {
  return CONVENTION_Aframe.unitScale;
}

/** [A-Frame] Bản sao quy ước hệ trục đầy đủ. */
export function aframeConvention(): CoordinateConvention {
  return { ...CONVENTION_Aframe };
}

/** [React Three Fiber] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toR3fPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_R3f);
}

/** [React Three Fiber] Đổi vị trí từ quy ước thư viện về engine. */
export function fromR3fPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_R3f);
}

/** [React Three Fiber] Đổi quaternion engine sang quy ước thư viện. */
export function toR3fQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_R3f);
}

/** [React Three Fiber] Đổi vector scale theo đơn vị thư viện. */
export function toR3fScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_R3f.unitScale);
}

/** [React Three Fiber] Trục lên của thư viện. */
export function r3fUpAxis(): 'y' | 'z' {
  return CONVENTION_R3f.upAxis;
}

/** [React Three Fiber] Tay hệ trục của thư viện. */
export function r3fHandedness(): 'left' | 'right' {
  return CONVENTION_R3f.handedness;
}

/** [React Three Fiber] Hệ số đơn vị (nhân từ mét). */
export function r3fUnitScale(): number {
  return CONVENTION_R3f.unitScale;
}

/** [React Three Fiber] Bản sao quy ước hệ trục đầy đủ. */
export function r3fConvention(): CoordinateConvention {
  return { ...CONVENTION_R3f };
}

/** [Threlte] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toThreltePosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Threlte);
}

/** [Threlte] Đổi vị trí từ quy ước thư viện về engine. */
export function fromThreltePosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Threlte);
}

/** [Threlte] Đổi quaternion engine sang quy ước thư viện. */
export function toThrelteQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Threlte);
}

/** [Threlte] Đổi vector scale theo đơn vị thư viện. */
export function toThrelteScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Threlte.unitScale);
}

/** [Threlte] Trục lên của thư viện. */
export function threlteUpAxis(): 'y' | 'z' {
  return CONVENTION_Threlte.upAxis;
}

/** [Threlte] Tay hệ trục của thư viện. */
export function threlteHandedness(): 'left' | 'right' {
  return CONVENTION_Threlte.handedness;
}

/** [Threlte] Hệ số đơn vị (nhân từ mét). */
export function threlteUnitScale(): number {
  return CONVENTION_Threlte.unitScale;
}

/** [Threlte] Bản sao quy ước hệ trục đầy đủ. */
export function threlteConvention(): CoordinateConvention {
  return { ...CONVENTION_Threlte };
}

/** [OGL] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toOglPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Ogl);
}

/** [OGL] Đổi vị trí từ quy ước thư viện về engine. */
export function fromOglPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Ogl);
}

/** [OGL] Đổi quaternion engine sang quy ước thư viện. */
export function toOglQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Ogl);
}

/** [OGL] Đổi vector scale theo đơn vị thư viện. */
export function toOglScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Ogl.unitScale);
}

/** [OGL] Trục lên của thư viện. */
export function oglUpAxis(): 'y' | 'z' {
  return CONVENTION_Ogl.upAxis;
}

/** [OGL] Tay hệ trục của thư viện. */
export function oglHandedness(): 'left' | 'right' {
  return CONVENTION_Ogl.handedness;
}

/** [OGL] Hệ số đơn vị (nhân từ mét). */
export function oglUnitScale(): number {
  return CONVENTION_Ogl.unitScale;
}

/** [OGL] Bản sao quy ước hệ trục đầy đủ. */
export function oglConvention(): CoordinateConvention {
  return { ...CONVENTION_Ogl };
}

/** [regl] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toReglPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Regl);
}

/** [regl] Đổi vị trí từ quy ước thư viện về engine. */
export function fromReglPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Regl);
}

/** [regl] Đổi quaternion engine sang quy ước thư viện. */
export function toReglQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Regl);
}

/** [regl] Đổi vector scale theo đơn vị thư viện. */
export function toReglScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Regl.unitScale);
}

/** [regl] Trục lên của thư viện. */
export function reglUpAxis(): 'y' | 'z' {
  return CONVENTION_Regl.upAxis;
}

/** [regl] Tay hệ trục của thư viện. */
export function reglHandedness(): 'left' | 'right' {
  return CONVENTION_Regl.handedness;
}

/** [regl] Hệ số đơn vị (nhân từ mét). */
export function reglUnitScale(): number {
  return CONVENTION_Regl.unitScale;
}

/** [regl] Bản sao quy ước hệ trục đầy đủ. */
export function reglConvention(): CoordinateConvention {
  return { ...CONVENTION_Regl };
}

/** [twgl.js] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toTwglPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Twgl);
}

/** [twgl.js] Đổi vị trí từ quy ước thư viện về engine. */
export function fromTwglPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Twgl);
}

/** [twgl.js] Đổi quaternion engine sang quy ước thư viện. */
export function toTwglQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Twgl);
}

/** [twgl.js] Đổi vector scale theo đơn vị thư viện. */
export function toTwglScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Twgl.unitScale);
}

/** [twgl.js] Trục lên của thư viện. */
export function twglUpAxis(): 'y' | 'z' {
  return CONVENTION_Twgl.upAxis;
}

/** [twgl.js] Tay hệ trục của thư viện. */
export function twglHandedness(): 'left' | 'right' {
  return CONVENTION_Twgl.handedness;
}

/** [twgl.js] Hệ số đơn vị (nhân từ mét). */
export function twglUnitScale(): number {
  return CONVENTION_Twgl.unitScale;
}

/** [twgl.js] Bản sao quy ước hệ trục đầy đủ. */
export function twglConvention(): CoordinateConvention {
  return { ...CONVENTION_Twgl };
}

/** [luma.gl] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toLumaPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Luma);
}

/** [luma.gl] Đổi vị trí từ quy ước thư viện về engine. */
export function fromLumaPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Luma);
}

/** [luma.gl] Đổi quaternion engine sang quy ước thư viện. */
export function toLumaQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Luma);
}

/** [luma.gl] Đổi vector scale theo đơn vị thư viện. */
export function toLumaScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Luma.unitScale);
}

/** [luma.gl] Trục lên của thư viện. */
export function lumaUpAxis(): 'y' | 'z' {
  return CONVENTION_Luma.upAxis;
}

/** [luma.gl] Tay hệ trục của thư viện. */
export function lumaHandedness(): 'left' | 'right' {
  return CONVENTION_Luma.handedness;
}

/** [luma.gl] Hệ số đơn vị (nhân từ mét). */
export function lumaUnitScale(): number {
  return CONVENTION_Luma.unitScale;
}

/** [luma.gl] Bản sao quy ước hệ trục đầy đủ. */
export function lumaConvention(): CoordinateConvention {
  return { ...CONVENTION_Luma };
}

/** [vtk.js] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toVtkPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Vtk);
}

/** [vtk.js] Đổi vị trí từ quy ước thư viện về engine. */
export function fromVtkPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Vtk);
}

/** [vtk.js] Đổi quaternion engine sang quy ước thư viện. */
export function toVtkQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Vtk);
}

/** [vtk.js] Đổi vector scale theo đơn vị thư viện. */
export function toVtkScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Vtk.unitScale);
}

/** [vtk.js] Trục lên của thư viện. */
export function vtkUpAxis(): 'y' | 'z' {
  return CONVENTION_Vtk.upAxis;
}

/** [vtk.js] Tay hệ trục của thư viện. */
export function vtkHandedness(): 'left' | 'right' {
  return CONVENTION_Vtk.handedness;
}

/** [vtk.js] Hệ số đơn vị (nhân từ mét). */
export function vtkUnitScale(): number {
  return CONVENTION_Vtk.unitScale;
}

/** [vtk.js] Bản sao quy ước hệ trục đầy đủ. */
export function vtkConvention(): CoordinateConvention {
  return { ...CONVENTION_Vtk };
}

/** [deck.gl] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toDeckPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Deck);
}

/** [deck.gl] Đổi vị trí từ quy ước thư viện về engine. */
export function fromDeckPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Deck);
}

/** [deck.gl] Đổi quaternion engine sang quy ước thư viện. */
export function toDeckQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Deck);
}

/** [deck.gl] Đổi vector scale theo đơn vị thư viện. */
export function toDeckScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Deck.unitScale);
}

/** [deck.gl] Trục lên của thư viện. */
export function deckUpAxis(): 'y' | 'z' {
  return CONVENTION_Deck.upAxis;
}

/** [deck.gl] Tay hệ trục của thư viện. */
export function deckHandedness(): 'left' | 'right' {
  return CONVENTION_Deck.handedness;
}

/** [deck.gl] Hệ số đơn vị (nhân từ mét). */
export function deckUnitScale(): number {
  return CONVENTION_Deck.unitScale;
}

/** [deck.gl] Bản sao quy ước hệ trục đầy đủ. */
export function deckConvention(): CoordinateConvention {
  return { ...CONVENTION_Deck };
}

/** [xeokit] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toXeokitPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Xeokit);
}

/** [xeokit] Đổi vị trí từ quy ước thư viện về engine. */
export function fromXeokitPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Xeokit);
}

/** [xeokit] Đổi quaternion engine sang quy ước thư viện. */
export function toXeokitQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Xeokit);
}

/** [xeokit] Đổi vector scale theo đơn vị thư viện. */
export function toXeokitScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Xeokit.unitScale);
}

/** [xeokit] Trục lên của thư viện. */
export function xeokitUpAxis(): 'y' | 'z' {
  return CONVENTION_Xeokit.upAxis;
}

/** [xeokit] Tay hệ trục của thư viện. */
export function xeokitHandedness(): 'left' | 'right' {
  return CONVENTION_Xeokit.handedness;
}

/** [xeokit] Hệ số đơn vị (nhân từ mét). */
export function xeokitUnitScale(): number {
  return CONVENTION_Xeokit.unitScale;
}

/** [xeokit] Bản sao quy ước hệ trục đầy đủ. */
export function xeokitConvention(): CoordinateConvention {
  return { ...CONVENTION_Xeokit };
}

/** [CesiumJS] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toCesiumPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Cesium);
}

/** [CesiumJS] Đổi vị trí từ quy ước thư viện về engine. */
export function fromCesiumPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Cesium);
}

/** [CesiumJS] Đổi quaternion engine sang quy ước thư viện. */
export function toCesiumQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Cesium);
}

/** [CesiumJS] Đổi vector scale theo đơn vị thư viện. */
export function toCesiumScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Cesium.unitScale);
}

/** [CesiumJS] Trục lên của thư viện. */
export function cesiumUpAxis(): 'y' | 'z' {
  return CONVENTION_Cesium.upAxis;
}

/** [CesiumJS] Tay hệ trục của thư viện. */
export function cesiumHandedness(): 'left' | 'right' {
  return CONVENTION_Cesium.handedness;
}

/** [CesiumJS] Hệ số đơn vị (nhân từ mét). */
export function cesiumUnitScale(): number {
  return CONVENTION_Cesium.unitScale;
}

/** [CesiumJS] Bản sao quy ước hệ trục đầy đủ. */
export function cesiumConvention(): CoordinateConvention {
  return { ...CONVENTION_Cesium };
}

/** [Zdog] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toZdogPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Zdog);
}

/** [Zdog] Đổi vị trí từ quy ước thư viện về engine. */
export function fromZdogPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Zdog);
}

/** [Zdog] Đổi quaternion engine sang quy ước thư viện. */
export function toZdogQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Zdog);
}

/** [Zdog] Đổi vector scale theo đơn vị thư viện. */
export function toZdogScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Zdog.unitScale);
}

/** [Zdog] Trục lên của thư viện. */
export function zdogUpAxis(): 'y' | 'z' {
  return CONVENTION_Zdog.upAxis;
}

/** [Zdog] Tay hệ trục của thư viện. */
export function zdogHandedness(): 'left' | 'right' {
  return CONVENTION_Zdog.handedness;
}

/** [Zdog] Hệ số đơn vị (nhân từ mét). */
export function zdogUnitScale(): number {
  return CONVENTION_Zdog.unitScale;
}

/** [Zdog] Bản sao quy ước hệ trục đầy đủ. */
export function zdogConvention(): CoordinateConvention {
  return { ...CONVENTION_Zdog };
}

/** [Filament] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toFilamentPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Filament);
}

/** [Filament] Đổi vị trí từ quy ước thư viện về engine. */
export function fromFilamentPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Filament);
}

/** [Filament] Đổi quaternion engine sang quy ước thư viện. */
export function toFilamentQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Filament);
}

/** [Filament] Đổi vector scale theo đơn vị thư viện. */
export function toFilamentScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Filament.unitScale);
}

/** [Filament] Trục lên của thư viện. */
export function filamentUpAxis(): 'y' | 'z' {
  return CONVENTION_Filament.upAxis;
}

/** [Filament] Tay hệ trục của thư viện. */
export function filamentHandedness(): 'left' | 'right' {
  return CONVENTION_Filament.handedness;
}

/** [Filament] Hệ số đơn vị (nhân từ mét). */
export function filamentUnitScale(): number {
  return CONVENTION_Filament.unitScale;
}

/** [Filament] Bản sao quy ước hệ trục đầy đủ. */
export function filamentConvention(): CoordinateConvention {
  return { ...CONVENTION_Filament };
}

/** [OpenSceneGraph] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toOsgPosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Osg);
}

/** [OpenSceneGraph] Đổi vị trí từ quy ước thư viện về engine. */
export function fromOsgPosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Osg);
}

/** [OpenSceneGraph] Đổi quaternion engine sang quy ước thư viện. */
export function toOsgQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Osg);
}

/** [OpenSceneGraph] Đổi vector scale theo đơn vị thư viện. */
export function toOsgScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Osg.unitScale);
}

/** [OpenSceneGraph] Trục lên của thư viện. */
export function osgUpAxis(): 'y' | 'z' {
  return CONVENTION_Osg.upAxis;
}

/** [OpenSceneGraph] Tay hệ trục của thư viện. */
export function osgHandedness(): 'left' | 'right' {
  return CONVENTION_Osg.handedness;
}

/** [OpenSceneGraph] Hệ số đơn vị (nhân từ mét). */
export function osgUnitScale(): number {
  return CONVENTION_Osg.unitScale;
}

/** [OpenSceneGraph] Bản sao quy ước hệ trục đầy đủ. */
export function osgConvention(): CoordinateConvention {
  return { ...CONVENTION_Osg };
}

/** [OGRE] Đổi vị trí engine (Y-up, RH, m) sang quy ước thư viện. */
export function toOgrePosition(position: readonly number[]): number[] {
  return convertPositionToLibrary(position, CONVENTION_Ogre);
}

/** [OGRE] Đổi vị trí từ quy ước thư viện về engine. */
export function fromOgrePosition(position: readonly number[]): number[] {
  return convertPositionFromLibrary(position, CONVENTION_Ogre);
}

/** [OGRE] Đổi quaternion engine sang quy ước thư viện. */
export function toOgreQuaternion(quaternion: readonly number[]): number[] {
  return convertQuaternionToLibrary(quaternion, CONVENTION_Ogre);
}

/** [OGRE] Đổi vector scale theo đơn vị thư viện. */
export function toOgreScale(scale: readonly number[]): number[] {
  return convertScaleToLibrary(scale, CONVENTION_Ogre.unitScale);
}

/** [OGRE] Trục lên của thư viện. */
export function ogreUpAxis(): 'y' | 'z' {
  return CONVENTION_Ogre.upAxis;
}

/** [OGRE] Tay hệ trục của thư viện. */
export function ogreHandedness(): 'left' | 'right' {
  return CONVENTION_Ogre.handedness;
}

/** [OGRE] Hệ số đơn vị (nhân từ mét). */
export function ogreUnitScale(): number {
  return CONVENTION_Ogre.unitScale;
}

/** [OGRE] Bản sao quy ước hệ trục đầy đủ. */
export function ogreConvention(): CoordinateConvention {
  return { ...CONVENTION_Ogre };
}
