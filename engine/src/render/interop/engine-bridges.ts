/**
 * @file engine-bridges.ts
 * @module @aetheria/engine/render/interop/engine-bridges
 * @description Cầu nối descriptor cho nhóm **engine 3D đầy đủ**: Three.js,
 * Babylon.js, Babylon Native, PlayCanvas và Verge3D. Payload là JSON descriptor
 * theo đúng idiom từng engine (Object3D/Node/Entity) để tầng Application nạp
 * trực tiếp mà engine không phải phụ thuộc thư viện nào.
 */

import type { IntermediateScene, MeshNodeDescriptor } from './scene-descriptors.js';
import { matrixScale, matrixPosition } from './scene-descriptors.js';
import type { InteropOptions, LibraryInterop, LibrarySceneExport } from './types.js';

/** Payload Three.js: Object3D descriptor kiểu JSON (ThreeEditor-compatible). */
export interface ThreeScenePayload {
  metadata: { type: string; generator: string };
  root: {
    name: string;
    type: 'Group';
    children: Array<
      | { type: 'Mesh'; name: string; geometry: Record<string, unknown>; material: Record<string, unknown>; matrix: number[] }
      | { type: 'Light'; kind: string; color: number; intensity: number; data: Record<string, unknown> }
    >;
    camera: Record<string, unknown>;
    fog: Record<string, unknown> | null;
  };
}

/** Descriptor Three.js từ scene trung gian. */
export function buildThreePayload(scene: IntermediateScene, options: InteropOptions = {}): ThreeScenePayload {
  return {
    metadata: { type: 'AetheriaScene', generator: 'aetheria-engine-interop' },
    root: {
      name: options.rootName ?? scene.rootName,
      type: 'Group',
      children: [
        ...scene.meshes.map((mesh) => ({
          type: 'Mesh' as const,
          name: mesh.id,
          geometry: {
            positions: mesh.geometry.positions,
            normals: mesh.geometry.normals,
            indices: mesh.geometry.indices,
          },
          material: {
            color: mesh.material.color,
            roughness: mesh.material.roughness,
            metalness: mesh.material.metalness,
            opacity: mesh.material.opacity,
            wireframe: mesh.material.wireframe,
            ...(mesh.material.textureUri ? { map: mesh.material.textureUri } : {}),
          },
          matrix: mesh.transform.matrix,
        })),
        ...scene.lights.map((light) => ({
          type: 'Light' as const,
          kind: light.kind,
          color: light.color,
          intensity: light.intensity,
          data: light.data,
        })),
      ],
      camera: scene.camera,
      fog: scene.fog ? { ...scene.fog } : null,
    },
  };
}

/** Payload Babylon.js: node/mesh theo lưới Scene/AbstractMesh. */
export function buildBabylonPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    meshes: scene.meshes.map((mesh) => ({
      name: mesh.id,
      position: mesh.transform.position,
      scaling: mesh.transform.scale,
      vertices: mesh.geometry.positions,
      indices: mesh.geometry.indices,
      material: {
        diffuseColor: hexToRgb01(mesh.material.color),
        roughness: mesh.material.roughness,
        metallic: mesh.material.metalness,
        alpha: mesh.material.opacity,
        ...(mesh.material.textureUri ? { albedoTexture: mesh.material.textureUri } : {}),
      },
    })),
    lights: scene.lights.map((light) => ({
      type: light.kind,
      intensity: light.intensity,
      ...colorToRgb01(light.color),
      ...light.data,
    })),
    camera: scene.camera
      ? {
          alpha: 0,
          beta: 0,
          radius: 10,
          target: scene.camera.target,
          fov: scene.camera.fov,
          minZ: scene.camera.near,
          maxZ: scene.camera.far,
        }
      : null,
    ...(scene.points ? { points: scene.points } : {}),
  };
}

/** Payload PlayCanvas: entity/component theo PC graph. */
export function buildPlayCanvasPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    entities: scene.meshes.map((mesh) => ({
      name: mesh.id,
      components: {
        render: { enabled: true, material: mesh.material, mesh: mesh.geometry },
        ...(mesh.instancing ? { instance: { count: mesh.instancing.count } } : {}),
      },
      position: mesh.transform.position,
      scale: mesh.transform.scale,
    })),
    lights: scene.lights.map((light) => ({ entity: light.kind, ...light.data, color: light.color, intensity: light.intensity })),
    camera: scene.camera,
  };
}

/** Payload Verge3D: glTF-compatible + puzzling hooks. */
export function buildVerge3dPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    gltfCompatible: true,
    nodes: scene.meshes.map((mesh) => ({
      name: mesh.id,
      mesh: mesh.geometry,
      material: mesh.material,
      translation: matrixPosition(mesh.transform.matrix),
      scale: matrixScale(mesh.transform.matrix),
    })),
    app: { puzzling: true, loadingScreen: true },
  };
}

/** Payload Babylon Native: giống Babylon + hints native (no DOM). */
export function buildBabylonNativePayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    ...buildBabylonPayload(scene),
    native: { noDom: true, engineFactory: 'NativeEngine' },
  };
}

/** Cầu nối Three.js. */
export const threeInterop: LibraryInterop = {
  id: 'three',
  label: 'Three.js',
  category: 'engine',
  backends: ['webgl', 'webgpu'],
  capabilities: ['scene3d', 'mesh', 'material', 'light', 'camera', 'animation'],
  buildScene: (scene, options): LibrarySceneExport => ({
    library: 'three',
    payloadKind: 'json',
    counts: requireCounts(scene),
    payload: buildThreePayload(scene, options),
  }),
};

/** Cầu nối Babylon.js. */
export const babylonInterop: LibraryInterop = {
  id: 'babylon',
  label: 'Babylon.js',
  category: 'engine',
  backends: ['webgl', 'webgpu'],
  capabilities: ['engine3d', 'pbr', 'animation', 'physics-integration', 'xr'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'babylon',
    payloadKind: 'json',
    counts: requireCounts(scene),
    payload: buildBabylonPayload(scene),
  }),
};

/** Cầu nối Babylon Native. */
export const babylonNativeInterop: LibraryInterop = {
  id: 'babylon-native',
  label: 'Babylon Native',
  category: 'native',
  backends: ['native-graphics'],
  capabilities: ['native-render', 'no-dom'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'babylon-native',
    payloadKind: 'json',
    counts: requireCounts(scene),
    payload: buildBabylonNativePayload(scene),
  }),
};

/** Cầu nối PlayCanvas. */
export const playcanvasInterop: LibraryInterop = {
  id: 'playcanvas',
  label: 'PlayCanvas Engine',
  category: 'engine',
  backends: ['webgl', 'webgpu'],
  capabilities: ['engine3d', 'entity-component', 'editor-tools'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'playcanvas',
    payloadKind: 'json',
    counts: requireCounts(scene),
    payload: buildPlayCanvasPayload(scene),
  }),
};

/** Cầu nối Verge3D. */
export const verge3dInterop: LibraryInterop = {
  id: 'verge3d',
  label: 'Verge3D',
  category: 'engine',
  backends: ['webgl'],
  capabilities: ['blender-import', '3ds-max-import', 'puzzles'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'verge3d',
    payloadKind: 'json',
    counts: requireCounts(scene),
    payload: buildVerge3dPayload(scene),
  }),
};

/** Đếm thống kê — chấp nhận IntermediateScene hoặc RenderSceneData. */
function requireCounts(scene: IntermediateScene): { meshes: number; lights: number; hasCamera: boolean } {
  return {
    meshes: scene.meshes.length,
    lights: scene.lights.length,
    hasCamera: true,
  };
}

/** Chuyển hex color sang mảng [r, g, b] chuẩn hóa 0..1 (idiom Babylon). */
export function hexToRgb01(hex: number): [number, number, number] {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

/** Đóng gói color hex thành `{ color: [r,g,b] }` chuẩn hóa. */
export function colorToRgb01(hex: number): { color: [number, number, number] } {
  return { color: hexToRgb01(hex) };
}

/** Kiểm tra hai mesh node descriptor có cùng cấu trúc geometry (tiện test). */
export function sameGeometryShape(a: MeshNodeDescriptor, b: MeshNodeDescriptor): boolean {
  return a.geometry.vertexCount === b.geometry.vertexCount &&
    a.geometry.indexCount === b.geometry.indexCount;
}
