/**
 * @file webgl-utility.ts
 * @module @aetheria/engine/render/interop/webgl-utility
 * @description Cầu nối cho nhóm **tiện ích WebGL**: OGL (buffer thô), regl
 * (draw command khai báo), twgl.js (buffer info) và luma.gl (pipeline/vertex
 * array). Payload là JSON mô tả buffer/pipeline để game nạp bằng thư viện của
 * mình mà không cần engine biết chi tiết.
 */

import type { IntermediateScene } from './scene-descriptors.js';
import type { InteropOptions, LibraryInterop, LibrarySceneExport } from './types.js';

/** Thuộc tính geometry dùng chung cho các WebGL utility. */
export interface GeometryAttributesPayload {
  aPosition: { data: number[]; size: 3 };
  aNormal: { data: number[]; size: 3 };
  aIndex: { data: number[] };
}

/** Gói attribute của một mesh. */
export function meshAttributes(mesh: { geometry: { positions: number[]; normals: number[]; indices: number[] } }): GeometryAttributesPayload {
  return {
    aPosition: { data: mesh.geometry.positions, size: 3 },
    aNormal: { data: mesh.geometry.normals, size: 3 },
    aIndex: { data: mesh.geometry.indices },
  };
}

/** Payload OGL: program + geometry + mesh list (kiểu OGL Camera/Program). */
export function buildOglPayload(scene: IntermediateScene, options: InteropOptions = {}): Record<string, unknown> {
  return {
    root: options.rootName ?? scene.rootName,
    meshes: scene.meshes.map((mesh) => ({
      id: mesh.id,
      geometry: { attributes: meshAttributes(mesh), drawRange: mesh.geometry.indexCount },
      uniforms: { uColor: hexToRgb01Value(mesh.material.color), uOpacity: mesh.material.opacity },
      modelMatrix: mesh.transform.matrix,
    })),
    lights: scene.lights,
  };
}

/** Payload regl: draw commands khai báo (props + attributes + uniforms). */
export function buildReglPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    commands: scene.meshes.map((mesh) => ({
      id: mesh.id,
      attributes: meshAttributes(mesh),
      uniforms: { model: mesh.transform.matrix, color: hexToRgb01Value(mesh.material.color) },
      count: mesh.geometry.indexCount,
      primitive: 'triangles',
    })),
    clear: scene.fog ? { color: hexToRgb01Value(scene.fog.color) } : { color: [0, 0, 0, 1] },
  };
}

/** Payload twgl.js: bufferInfo + programInfo descriptors. */
export function buildTwglPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    bufferInfos: scene.meshes.map((mesh) => ({
      id: mesh.id,
      arrays: {
        position: { numComponents: 3, data: mesh.geometry.positions },
        normal: { numComponents: 3, data: mesh.geometry.normals },
        indices: mesh.geometry.indices,
      },
    })),
    programInfos: scene.meshes.map((mesh) => ({
      id: mesh.id,
      vertexShaderSource: 'aetheria://shaders/pbr.vert',
      fragmentShaderSource: 'aetheria://shaders/pbr.frag',
      uniforms: { u_model: mesh.transform.matrix },
    })),
  };
}

/** Payload luma.gl: pipeline + vertex array descriptors (WebGL2/WebGPU). */
export function buildLumaPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    pipelines: scene.meshes.map((mesh) => ({
      id: mesh.id,
      vs: 'aetheria-pbr-vs',
      fs: 'aetheria-pbr-fs',
      topology: 'triangle-list',
      vertexArrays: {
        attributes: meshAttributes(mesh),
        indexBuffer: mesh.geometry.indices,
      },
      bindings: { u_Model: mesh.transform.matrix },
    })),
    webgpuCompatible: true,
  };
}

/** Cầu nối OGL. */
export const oglInterop: LibraryInterop = {
  id: 'ogl',
  label: 'OGL',
  category: 'webgl-utility',
  backends: ['webgl'],
  capabilities: ['low-level', 'lightweight', 'program-uniforms'],
  buildScene: (scene, options): LibrarySceneExport => ({
    library: 'ogl',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildOglPayload(scene, options),
  }),
};

/** Cầu nối regl. */
export const reglInterop: LibraryInterop = {
  id: 'regl',
  label: 'regl',
  category: 'webgl-utility',
  backends: ['webgl'],
  capabilities: ['declarative-commands', 'functional-render'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'regl',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildReglPayload(scene),
  }),
};

/** Cầu nối twgl.js. */
export const twglInterop: LibraryInterop = {
  id: 'twgl',
  label: 'twgl.js',
  category: 'webgl-utility',
  backends: ['webgl'],
  capabilities: ['buffer-info', 'program-info', 'shader-helpers'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'twgl',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildTwglPayload(scene),
  }),
};

/** Cầu nối luma.gl. */
export const lumaInterop: LibraryInterop = {
  id: 'luma.gl',
  label: 'luma.gl',
  category: 'webgl-utility',
  backends: ['webgl', 'webgpu'],
  capabilities: ['pipeline', 'gpu-compute', 'visualization'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'luma.gl',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildLumaPayload(scene),
  }),
};

/** Chuyển hex 0xRRGGBB sang [r, g, b] chuẩn hóa (dùng cho uniforms). */
function hexToRgb01Value(hex: number): [number, number, number] {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}
