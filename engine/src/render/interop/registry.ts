/**
 * @file registry.ts
 * @module @aetheria/engine/render/interop/registry
 * @description Registry cầu nối thư viện đồ họa: tra cứu theo id, liệt kê theo
 * nhóm, export scene + hoạt ảnh một lượt (`exportForLibrary`). Bổ sung library
 * mới = một entry `LibraryInterop` + một exporter trong animation module.
 */

import { AnimationClip } from '../../animation/clip.js';
import { exportClipForLibrary } from '../../animation/library-export.js';
import type { LibraryAnimationExport } from '../../animation/types.js';
import type { RenderSceneData } from '../../types/renderer.types.js';
import { toIntermediateScene, sceneCounts, type IntermediateScene } from './scene-descriptors.js';
import {
  threeInterop,
  babylonInterop,
  babylonNativeInterop,
  playcanvasInterop,
  verge3dInterop,
} from './engine-bridges.js';
import { aframeInterop, r3fInterop, threlteInterop } from './framework-glue.js';
import { oglInterop, reglInterop, twglInterop, lumaInterop } from './webgl-utility.js';
import {
  vtkInterop,
  deckInterop,
  xeokitInterop,
  cesiumInterop,
  zdogInterop,
  filamentInterop,
  osgInterop,
  ogreInterop,
} from './data-viz-minimal.js';
import type {
  FullLibraryExport,
  InteropCategory,
  InteropOptions,
  LibraryInterop,
  LibrarySceneExport,
} from './types.js';

/** Toàn bộ cầu nối built-in (19 thư viện + 5 engine đã có sẵn backend). */
export const BUILT_IN_INTEROPS: readonly LibraryInterop[] = Object.freeze([
  threeInterop,
  babylonInterop,
  babylonNativeInterop,
  playcanvasInterop,
  verge3dInterop,
  aframeInterop,
  r3fInterop,
  threlteInterop,
  oglInterop,
  reglInterop,
  twglInterop,
  lumaInterop,
  vtkInterop,
  deckInterop,
  xeokitInterop,
  cesiumInterop,
  zdogInterop,
  filamentInterop,
  osgInterop,
  ogreInterop,
]);

/** Tra cầu nối theo id; `null` nếu chưa có. */
export function getInterop(libraryId: string): LibraryInterop | null {
  return BUILT_IN_INTEROPS.find((interop) => interop.id === libraryId) ?? null;
}

/** Danh sách id của mọi cầu nối built-in (sắp xếp). */
export function interopLibraryIds(): string[] {
  return BUILT_IN_INTEROPS.map((interop) => interop.id).sort();
}

/** Lọc cầu nối theo nhóm. */
export function interopsByCategory(category: InteropCategory): LibraryInterop[] {
  return BUILT_IN_INTEROPS.filter((interop) => interop.category === category);
}

/** Export scene cho một thư viện; ném lỗi nếu id không tồn tại. */
export function exportSceneForLibrary(
  scene: RenderSceneData,
  libraryId: string,
  options: InteropOptions = {},
): LibrarySceneExport {
  const interop = getInterop(libraryId);
  if (!interop) throw new RangeError(`Chưa có cầu nối cho thư viện "${libraryId}"`);
  return interop.buildScene(toIntermediateScene(scene, options), options);
}

/**
 * Export scene + hoạt ảnh cho một thư viện trong một lượt.
 *
 * @param scene Scene trung tính của engine.
 * @param clip Clip hoạt ảnh trung tính (tùy chọn).
 * @param libraryId Id thư viện đích.
 */
export function exportForLibrary(
  scene: RenderSceneData,
  libraryId: string,
  clip?: AnimationClip,
  options: InteropOptions = {},
): FullLibraryExport {
  const sceneExport = exportSceneForLibrary(scene, libraryId, options);
  let animationExport: LibraryAnimationExport | null = null;
  if (clip) {
    animationExport = exportClipForLibrary(clip, libraryId);
  }
  return { scene: sceneExport, animation: animationExport };
}

/** Export scene cho MỌI thư viện built-in (tiện pipeline import/export). */
export function exportAllLibraries(
  scene: RenderSceneData,
  options: InteropOptions = {},
): Array<{ library: string; export: LibrarySceneExport }> {
  const intermediate: IntermediateScene = toIntermediateScene(scene, options);
  return BUILT_IN_INTEROPS.map((interop) => ({
    library: interop.id,
    export: interop.buildScene(intermediate, options),
  }));
}

/** Thống kê scene trung tính nhanh (meshes/lights/camera). */
export function summarizeScene(scene: RenderSceneData): {
  meshes: number;
  lights: number;
  hasCamera: boolean;
} {
  return sceneCounts(toIntermediateScene(scene));
}
