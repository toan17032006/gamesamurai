/**
 * @file generated-blend-matrices.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import { mergePoses, crossfadePoses, blend1D, blend2D, blendLayers } from '../../../animation/blend.js';
import { overridePose, clonePose } from '../../../animation/pose-ops.js';
import type { AnimationPose } from '../../../animation/types.js';


/** [Three.js] Blend hai pose theo alpha. */
export function threeBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [Three.js] Ghi đè hoàn toàn: overlay phủ lên base. */
export function threeBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [Three.js] Blend 1D theo tham số vô hướng. */
export function threeBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [Three.js] Blend 2D barycentric theo (x, y). */
export function threeBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [Three.js] Crossfade có easing giữa hai pose. */
export function threeCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [Three.js] Trộn danh sách layer override/additive. */
export function threeBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [Three.js] Ghi đè pose: overlay phủ lên base. */
export function threeOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [Three.js] Nội suy giá trị phẳng theo alpha. */
export function threeBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [Babylon.js] Blend hai pose theo alpha. */
export function babylonBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [Babylon.js] Ghi đè hoàn toàn: overlay phủ lên base. */
export function babylonBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [Babylon.js] Blend 1D theo tham số vô hướng. */
export function babylonBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [Babylon.js] Blend 2D barycentric theo (x, y). */
export function babylonBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [Babylon.js] Crossfade có easing giữa hai pose. */
export function babylonCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [Babylon.js] Trộn danh sách layer override/additive. */
export function babylonBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [Babylon.js] Ghi đè pose: overlay phủ lên base. */
export function babylonOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [Babylon.js] Nội suy giá trị phẳng theo alpha. */
export function babylonBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [Babylon Native] Blend hai pose theo alpha. */
export function babylonnativeBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [Babylon Native] Ghi đè hoàn toàn: overlay phủ lên base. */
export function babylonnativeBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [Babylon Native] Blend 1D theo tham số vô hướng. */
export function babylonnativeBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [Babylon Native] Blend 2D barycentric theo (x, y). */
export function babylonnativeBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [Babylon Native] Crossfade có easing giữa hai pose. */
export function babylonnativeCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [Babylon Native] Trộn danh sách layer override/additive. */
export function babylonnativeBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [Babylon Native] Ghi đè pose: overlay phủ lên base. */
export function babylonnativeOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [Babylon Native] Nội suy giá trị phẳng theo alpha. */
export function babylonnativeBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [PlayCanvas Engine] Blend hai pose theo alpha. */
export function playcanvasBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [PlayCanvas Engine] Ghi đè hoàn toàn: overlay phủ lên base. */
export function playcanvasBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [PlayCanvas Engine] Blend 1D theo tham số vô hướng. */
export function playcanvasBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [PlayCanvas Engine] Blend 2D barycentric theo (x, y). */
export function playcanvasBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [PlayCanvas Engine] Crossfade có easing giữa hai pose. */
export function playcanvasCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [PlayCanvas Engine] Trộn danh sách layer override/additive. */
export function playcanvasBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [PlayCanvas Engine] Ghi đè pose: overlay phủ lên base. */
export function playcanvasOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [PlayCanvas Engine] Nội suy giá trị phẳng theo alpha. */
export function playcanvasBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [Verge3D] Blend hai pose theo alpha. */
export function verge3dBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [Verge3D] Ghi đè hoàn toàn: overlay phủ lên base. */
export function verge3dBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [Verge3D] Blend 1D theo tham số vô hướng. */
export function verge3dBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [Verge3D] Blend 2D barycentric theo (x, y). */
export function verge3dBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [Verge3D] Crossfade có easing giữa hai pose. */
export function verge3dCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [Verge3D] Trộn danh sách layer override/additive. */
export function verge3dBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [Verge3D] Ghi đè pose: overlay phủ lên base. */
export function verge3dOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [Verge3D] Nội suy giá trị phẳng theo alpha. */
export function verge3dBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [A-Frame] Blend hai pose theo alpha. */
export function aframeBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [A-Frame] Ghi đè hoàn toàn: overlay phủ lên base. */
export function aframeBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [A-Frame] Blend 1D theo tham số vô hướng. */
export function aframeBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [A-Frame] Blend 2D barycentric theo (x, y). */
export function aframeBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [A-Frame] Crossfade có easing giữa hai pose. */
export function aframeCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [A-Frame] Trộn danh sách layer override/additive. */
export function aframeBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [A-Frame] Ghi đè pose: overlay phủ lên base. */
export function aframeOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [A-Frame] Nội suy giá trị phẳng theo alpha. */
export function aframeBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [React Three Fiber] Blend hai pose theo alpha. */
export function r3fBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [React Three Fiber] Ghi đè hoàn toàn: overlay phủ lên base. */
export function r3fBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [React Three Fiber] Blend 1D theo tham số vô hướng. */
export function r3fBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [React Three Fiber] Blend 2D barycentric theo (x, y). */
export function r3fBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [React Three Fiber] Crossfade có easing giữa hai pose. */
export function r3fCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [React Three Fiber] Trộn danh sách layer override/additive. */
export function r3fBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [React Three Fiber] Ghi đè pose: overlay phủ lên base. */
export function r3fOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [React Three Fiber] Nội suy giá trị phẳng theo alpha. */
export function r3fBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [Threlte] Blend hai pose theo alpha. */
export function threlteBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [Threlte] Ghi đè hoàn toàn: overlay phủ lên base. */
export function threlteBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [Threlte] Blend 1D theo tham số vô hướng. */
export function threlteBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [Threlte] Blend 2D barycentric theo (x, y). */
export function threlteBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [Threlte] Crossfade có easing giữa hai pose. */
export function threlteCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [Threlte] Trộn danh sách layer override/additive. */
export function threlteBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [Threlte] Ghi đè pose: overlay phủ lên base. */
export function threlteOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [Threlte] Nội suy giá trị phẳng theo alpha. */
export function threlteBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [OGL] Blend hai pose theo alpha. */
export function oglBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [OGL] Ghi đè hoàn toàn: overlay phủ lên base. */
export function oglBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [OGL] Blend 1D theo tham số vô hướng. */
export function oglBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [OGL] Blend 2D barycentric theo (x, y). */
export function oglBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [OGL] Crossfade có easing giữa hai pose. */
export function oglCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [OGL] Trộn danh sách layer override/additive. */
export function oglBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [OGL] Ghi đè pose: overlay phủ lên base. */
export function oglOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [OGL] Nội suy giá trị phẳng theo alpha. */
export function oglBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [regl] Blend hai pose theo alpha. */
export function reglBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [regl] Ghi đè hoàn toàn: overlay phủ lên base. */
export function reglBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [regl] Blend 1D theo tham số vô hướng. */
export function reglBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [regl] Blend 2D barycentric theo (x, y). */
export function reglBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [regl] Crossfade có easing giữa hai pose. */
export function reglCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [regl] Trộn danh sách layer override/additive. */
export function reglBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [regl] Ghi đè pose: overlay phủ lên base. */
export function reglOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [regl] Nội suy giá trị phẳng theo alpha. */
export function reglBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [twgl.js] Blend hai pose theo alpha. */
export function twglBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [twgl.js] Ghi đè hoàn toàn: overlay phủ lên base. */
export function twglBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [twgl.js] Blend 1D theo tham số vô hướng. */
export function twglBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [twgl.js] Blend 2D barycentric theo (x, y). */
export function twglBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [twgl.js] Crossfade có easing giữa hai pose. */
export function twglCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [twgl.js] Trộn danh sách layer override/additive. */
export function twglBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [twgl.js] Ghi đè pose: overlay phủ lên base. */
export function twglOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [twgl.js] Nội suy giá trị phẳng theo alpha. */
export function twglBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [luma.gl] Blend hai pose theo alpha. */
export function lumaBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [luma.gl] Ghi đè hoàn toàn: overlay phủ lên base. */
export function lumaBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [luma.gl] Blend 1D theo tham số vô hướng. */
export function lumaBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [luma.gl] Blend 2D barycentric theo (x, y). */
export function lumaBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [luma.gl] Crossfade có easing giữa hai pose. */
export function lumaCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [luma.gl] Trộn danh sách layer override/additive. */
export function lumaBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [luma.gl] Ghi đè pose: overlay phủ lên base. */
export function lumaOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [luma.gl] Nội suy giá trị phẳng theo alpha. */
export function lumaBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [vtk.js] Blend hai pose theo alpha. */
export function vtkBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [vtk.js] Ghi đè hoàn toàn: overlay phủ lên base. */
export function vtkBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [vtk.js] Blend 1D theo tham số vô hướng. */
export function vtkBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [vtk.js] Blend 2D barycentric theo (x, y). */
export function vtkBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [vtk.js] Crossfade có easing giữa hai pose. */
export function vtkCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [vtk.js] Trộn danh sách layer override/additive. */
export function vtkBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [vtk.js] Ghi đè pose: overlay phủ lên base. */
export function vtkOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [vtk.js] Nội suy giá trị phẳng theo alpha. */
export function vtkBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [deck.gl] Blend hai pose theo alpha. */
export function deckBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [deck.gl] Ghi đè hoàn toàn: overlay phủ lên base. */
export function deckBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [deck.gl] Blend 1D theo tham số vô hướng. */
export function deckBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [deck.gl] Blend 2D barycentric theo (x, y). */
export function deckBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [deck.gl] Crossfade có easing giữa hai pose. */
export function deckCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [deck.gl] Trộn danh sách layer override/additive. */
export function deckBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [deck.gl] Ghi đè pose: overlay phủ lên base. */
export function deckOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [deck.gl] Nội suy giá trị phẳng theo alpha. */
export function deckBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [xeokit] Blend hai pose theo alpha. */
export function xeokitBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [xeokit] Ghi đè hoàn toàn: overlay phủ lên base. */
export function xeokitBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [xeokit] Blend 1D theo tham số vô hướng. */
export function xeokitBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [xeokit] Blend 2D barycentric theo (x, y). */
export function xeokitBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [xeokit] Crossfade có easing giữa hai pose. */
export function xeokitCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [xeokit] Trộn danh sách layer override/additive. */
export function xeokitBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [xeokit] Ghi đè pose: overlay phủ lên base. */
export function xeokitOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [xeokit] Nội suy giá trị phẳng theo alpha. */
export function xeokitBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [CesiumJS] Blend hai pose theo alpha. */
export function cesiumBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [CesiumJS] Ghi đè hoàn toàn: overlay phủ lên base. */
export function cesiumBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [CesiumJS] Blend 1D theo tham số vô hướng. */
export function cesiumBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [CesiumJS] Blend 2D barycentric theo (x, y). */
export function cesiumBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [CesiumJS] Crossfade có easing giữa hai pose. */
export function cesiumCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [CesiumJS] Trộn danh sách layer override/additive. */
export function cesiumBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [CesiumJS] Ghi đè pose: overlay phủ lên base. */
export function cesiumOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [CesiumJS] Nội suy giá trị phẳng theo alpha. */
export function cesiumBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [Zdog] Blend hai pose theo alpha. */
export function zdogBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [Zdog] Ghi đè hoàn toàn: overlay phủ lên base. */
export function zdogBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [Zdog] Blend 1D theo tham số vô hướng. */
export function zdogBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [Zdog] Blend 2D barycentric theo (x, y). */
export function zdogBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [Zdog] Crossfade có easing giữa hai pose. */
export function zdogCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [Zdog] Trộn danh sách layer override/additive. */
export function zdogBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [Zdog] Ghi đè pose: overlay phủ lên base. */
export function zdogOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [Zdog] Nội suy giá trị phẳng theo alpha. */
export function zdogBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [Filament] Blend hai pose theo alpha. */
export function filamentBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [Filament] Ghi đè hoàn toàn: overlay phủ lên base. */
export function filamentBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [Filament] Blend 1D theo tham số vô hướng. */
export function filamentBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [Filament] Blend 2D barycentric theo (x, y). */
export function filamentBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [Filament] Crossfade có easing giữa hai pose. */
export function filamentCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [Filament] Trộn danh sách layer override/additive. */
export function filamentBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [Filament] Ghi đè pose: overlay phủ lên base. */
export function filamentOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [Filament] Nội suy giá trị phẳng theo alpha. */
export function filamentBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [OpenSceneGraph] Blend hai pose theo alpha. */
export function osgBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [OpenSceneGraph] Ghi đè hoàn toàn: overlay phủ lên base. */
export function osgBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [OpenSceneGraph] Blend 1D theo tham số vô hướng. */
export function osgBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [OpenSceneGraph] Blend 2D barycentric theo (x, y). */
export function osgBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [OpenSceneGraph] Crossfade có easing giữa hai pose. */
export function osgCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [OpenSceneGraph] Trộn danh sách layer override/additive. */
export function osgBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [OpenSceneGraph] Ghi đè pose: overlay phủ lên base. */
export function osgOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [OpenSceneGraph] Nội suy giá trị phẳng theo alpha. */
export function osgBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}

/** [OGRE] Blend hai pose theo alpha. */
export function ogreBlend(a: AnimationPose, b: AnimationPose, alpha: number): AnimationPose {
  return clonePose(mergePoses(a, b, alpha));
}

/** [OGRE] Ghi đè hoàn toàn: overlay phủ lên base. */
export function ogreBlendAdditive(a: AnimationPose, b: AnimationPose): AnimationPose {
  return overridePose(a, b);
}

/** [OGRE] Blend 1D theo tham số vô hướng. */
export function ogreBlend1D(
  samples: ReadonlyArray<{ threshold: number; pose: AnimationPose }>,
  parameter: number,
): AnimationPose {
  return blend1D(samples, parameter);
}

/** [OGRE] Blend 2D barycentric theo (x, y). */
export function ogreBlend2D(
  samples: ReadonlyArray<{ x: number; y: number; pose: AnimationPose }>,
  x: number,
  y: number,
): AnimationPose {
  return blend2D(samples, x, y);
}

/** [OGRE] Crossfade có easing giữa hai pose. */
export function ogreCrossfade(from: AnimationPose, to: AnimationPose, alpha: number): AnimationPose {
  return crossfadePoses(from, to, alpha);
}

/** [OGRE] Trộn danh sách layer override/additive. */
export function ogreBlendLayers(
  layers: ReadonlyArray<{ pose: AnimationPose; weight: number; blendMode: 'override' | 'additive'; mask?: readonly string[] }>,
): AnimationPose {
  return blendLayers(layers);
}

/** [OGRE] Ghi đè pose: overlay phủ lên base. */
export function ogreOverridePose(base: AnimationPose, overlay: AnimationPose): AnimationPose {
  return overridePose(base, overlay);
}

/** [OGRE] Nội suy giá trị phẳng theo alpha. */
export function ogreBlendValues(a: readonly number[], b: readonly number[], alpha: number): number[] {
  return a.map((value, index) => value + ((b[index] ?? value) - value) * alpha);
}
