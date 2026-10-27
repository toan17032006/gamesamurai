/**
 * @file scene-descriptors.ts
 * @module @aetheria/engine/render/interop/scene-descriptors
 * @description Tiện ích chung chuyển scene trung tính (`RenderSceneData`) thành
 * cấu trúc trung gian phục vụ các cầu nối thư viện: giải matrix transform
 * (column-major 16 floats) thành position/scale, ánh xạ mesh/lights/camera/points
 * và thống kê. Các cầu nối cụ thể chỉ việc biến bản trung gian này sang idiom
 * của thư viện mình.
 */

import type {
  CameraData,
  LightsData,
  MeshData,
  PointsData,
  RenderSceneData,
} from '../../types/renderer.types.js';
import type { InteropOptions } from './types.js';

/** Descriptor node trung gian cho một mesh. */
export interface MeshNodeDescriptor {
  id: string;
  geometry: {
    /** Positions phẳng (3 floats/vertex). */
    positions: number[];
    /** Normals phẳng (3 floats/vertex). */
    normals: number[];
    indices: number[];
    vertexCount: number;
    indexCount: number;
  };
  material: {
    color: number;
    roughness: number;
    metalness: number;
    opacity: number;
    wireframe: boolean;
    transparent: boolean;
    textureUri?: string;
  };
  transform: {
    /** Matrix column-major 16 floats (nguyên gốc từ engine). */
    matrix: number[];
    position: [number, number, number];
    scale: [number, number, number];
  };
  instancing: { count: number; matrices: number[] } | null;
  shadows: { cast: boolean; receive: boolean };
}

/** Descriptor ánh sáng trung gian. */
export interface LightDescriptor {
  kind: 'ambient' | 'directional' | 'point' | 'spot';
  color: number;
  intensity: number;
  /** Dữ liệu bổ sung theo loại (direction/position/distance...). */
  data: Record<string, number | number[]>;
}

/** Descriptor points (điểm ảnh/hạt). */
export interface PointsDescriptor {
  count: number;
  positions: number[];
  colors: number[] | null;
  sizes: number[] | null;
  size: number;
  textureUri?: string;
}

/** Bản trung gian scene: node + lights + camera + points. */
export interface IntermediateScene {
  rootName: string;
  meshes: MeshNodeDescriptor[];
  lights: LightDescriptor[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
    near: number;
    far: number;
    /** Ma trận view/projection nguyên gốc (column-major). */
    view: number[];
    projection: number[];
  };
  points: PointsDescriptor | null;
  environmentMapUri?: string;
  fog: { color: number; near: number; far: number } | null;
  metadata: Record<string, unknown>;
}

/** Chuyển `RenderSceneData` thành bản trung gian (dùng chung mọi cầu nối). */
export function toIntermediateScene(scene: RenderSceneData, options: InteropOptions = {}): IntermediateScene {
  return {
    rootName: options.rootName ?? 'AetheriaRoot',
    meshes: scene.meshes.map((mesh) => meshToNode(mesh)),
    lights: lightsToDescriptors(scene.lights),
    camera: cameraToDescriptor(scene.camera),
    points: scene.points ? pointsToDescriptor(scene.points) : null,
    environmentMapUri: scene.environmentMapUri,
    fog: scene.fogColor !== undefined
      ? { color: scene.fogColor, near: scene.fogNear ?? 0, far: scene.fogFar ?? 0 }
      : null,
    metadata: { ...(options.metadata ?? {}) },
  };
}

/**
 * Chuẩn hóa đầu vào của cầu nối: chấp nhận scene thô (chuyển đổi tại chỗ) hoặc
 * bản trung gian có sẵn (dùng lại).
 */
export function ensureIntermediate(
  scene: RenderSceneData | IntermediateScene,
  options: InteropOptions = {},
): IntermediateScene {
  return 'rootName' in scene ? scene : toIntermediateScene(scene, options);
}

/** Đếm thống kê scene (phục vụ `LibrarySceneExport.counts`). */
export function sceneCounts(scene: IntermediateScene): {
  meshes: number;
  lights: number;
  hasCamera: boolean;
} {
  return {
    meshes: scene.meshes.length,
    lights: scene.lights.length,
    hasCamera: true,
  };
}

/** Giải position từ matrix column-major 4x4. */
export function matrixPosition(matrix: ArrayLike<number>): [number, number, number] {
  return [matrix[12] ?? 0, matrix[13] ?? 0, matrix[14] ?? 0];
}

/** Giải scale từ độ dài các cột của matrix. */
export function matrixScale(matrix: ArrayLike<number>): [number, number, number] {
  const columnLength = (offset: number): number =>
    Math.hypot(matrix[offset] ?? 0, matrix[offset + 1] ?? 0, matrix[offset + 2] ?? 0);
  return [columnLength(0), columnLength(4), columnLength(8)];
}

/** Mesh trung tính → node descriptor. */
function meshToNode(mesh: MeshData): MeshNodeDescriptor {
  const geometry = mesh.geometry;
  return {
    id: mesh.id,
    geometry: {
      positions: Array.from(geometry.positions),
      normals: Array.from(geometry.normals),
      indices: geometry.indices ? Array.from(geometry.indices) : [],
      vertexCount: Math.floor(geometry.positions.length / 3),
      indexCount: geometry.indices ? geometry.indices.length : 0,
    },
    material: {
      color: mesh.material.color,
      roughness: mesh.material.roughness,
      metalness: mesh.material.metalness,
      opacity: mesh.material.opacity ?? 1,
      wireframe: mesh.material.wireframe ?? false,
      transparent: mesh.material.transparent ?? false,
      ...(mesh.material.textureUri ? { textureUri: mesh.material.textureUri } : {}),
    },
    transform: {
      matrix: Array.from(mesh.transform),
      position: matrixPosition(mesh.transform),
      scale: matrixScale(mesh.transform),
    },
    instancing: mesh.instanceCount && mesh.instanceCount > 0
      ? { count: mesh.instanceCount, matrices: Array.from(mesh.instanceTransforms ?? []) }
      : null,
    shadows: { cast: mesh.castShadow ?? false, receive: mesh.receiveShadow ?? false },
  };
}

/** Đóng gói lights trung tính thành descriptor theo loại. */
function lightsToDescriptors(lights: LightsData): LightDescriptor[] {
  const result: LightDescriptor[] = [];
  if (lights.ambient) {
    result.push({
      kind: 'ambient',
      color: lights.ambient.color,
      intensity: lights.ambient.intensity,
      data: {},
    });
  }
  if (lights.directional) {
    result.push({
      kind: 'directional',
      color: lights.directional.color,
      intensity: lights.directional.intensity,
      data: { direction: [...lights.directional.direction] },
    });
  }
  for (const point of lights.points ?? []) {
    result.push({
      kind: 'point',
      color: point.color,
      intensity: point.intensity,
      data: { position: [...point.position], distance: point.distance, decay: point.decay ?? 2 },
    });
  }
  for (const spot of lights.spots ?? []) {
    result.push({
      kind: 'spot',
      color: spot.color,
      intensity: spot.intensity,
      data: {
        position: [...spot.position],
        direction: [...spot.direction],
        distance: spot.distance,
        angle: spot.angle,
        penumbra: spot.penumbra,
      },
    });
  }
  return result;
}

/** Camera trung tính → descriptor. */
function cameraToDescriptor(camera: CameraData): IntermediateScene['camera'] {
  const position = camera.position;
  const target = camera.target;
  return {
    position: position
      ? [position.x, position.y, position.z]
      : [0, 0, 0],
    target: target
      ? [target.x, target.y, target.z]
      : [0, 0, 0],
    fov: camera.fov ?? 60,
    near: camera.near ?? 0.1,
    far: camera.far ?? 1000,
    view: Array.from(camera.view),
    projection: Array.from(camera.projection),
  };
}

/** Points trung tính → descriptor. */
function pointsToDescriptor(points: PointsData): PointsDescriptor {
  return {
    count: points.count,
    positions: Array.from(points.positions),
    colors: points.colors ? Array.from(points.colors) : null,
    sizes: points.sizes ? Array.from(points.sizes) : null,
    size: points.size ?? 1,
    ...(points.textureUri ? { textureUri: points.textureUri } : {}),
  };
}
