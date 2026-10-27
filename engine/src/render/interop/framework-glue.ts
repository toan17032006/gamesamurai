/**
 * @file framework-glue.ts
 * @module @aetheria/engine/render/interop/framework-glue
 * @description Cầu nối cho nhóm **framework glue UI**: A-Frame (markup
 * entity-component), React Three Fiber (useFrame keyframe descriptor) và
 * Threlte (Svelte component descriptor). Các payload này dùng cho codegen/tầng
 * hiển thị của game, không phụ thuộc runtime của framework.
 */

import type { IntermediateScene } from './scene-descriptors.js';
import { matrixPosition, matrixScale } from './scene-descriptors.js';
import type { InteropOptions, LibraryInterop, LibrarySceneExport } from './types.js';

/** Payload A-Frame: chuỗi markup `<a-scene>` với entity + animation. */
export function buildAFramePayload(scene: IntermediateScene, options: InteropOptions = {}): string {
  const lines: string[] = [`<a-scene name="${options.rootName ?? scene.rootName}">`];
  for (const mesh of scene.meshes) {
    const position = matrixPosition(mesh.transform.matrix).map((value) => value.toFixed(3)).join(' ');
    const scale = matrixScale(mesh.transform.matrix).map((value) => value.toFixed(3)).join(' ');
    const color = `#${mesh.material.color.toString(16).padStart(6, '0')}`;
    lines.push(
      `  <a-entity id="${mesh.id}" geometry="primitive: box" material="color: ${color}; opacity: ${mesh.material.opacity}" position="${position}" scale="${scale}"></a-entity>`,
    );
  }
  for (const light of scene.lights) {
    lines.push(
      `  <a-light type="${light.kind}" intensity="${light.intensity.toFixed(2)}"></a-light>`,
    );
  }
  lines.push('</a-scene>');
  return lines.join('\n');
}

/** Payload React Three Fiber: cây element + useFrame keyframe hooks. */
export function buildR3fPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    elements: scene.meshes.map((mesh) => ({
      component: 'mesh',
      key: mesh.id,
      props: {
        position: matrixPosition(mesh.transform.matrix),
        scale: matrixScale(mesh.transform.matrix),
      },
      children: [
        { component: 'bufferGeometry', props: { attributes: { position: mesh.geometry.positions, normal: mesh.geometry.normals } } },
        { component: 'meshStandardMaterial', props: { color: `#${mesh.material.color.toString(16).padStart(6, '0')}`, roughness: mesh.material.roughness, metalness: mesh.material.metalness } },
      ],
    })),
    hooks: scene.meshes.map((mesh) => ({ component: 'useFrame', target: mesh.id })),
    lights: scene.lights.map((light) => ({ component: `${light.kind}Light`, props: { intensity: light.intensity, ...light.data } })),
  };
}

/** Payload Threlte: cây component Svelte descriptor. */
export function buildThreltePayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    components: scene.meshes.map((mesh) => ({
      name: 'T.Mesh',
      props: { id: mesh.id, position: matrixPosition(mesh.transform.matrix) },
      children: [
        { name: 'T.BufferGeometry', props: { attributes: { position: mesh.geometry.positions } } },
        { name: 'T.MeshStandardMaterial', props: { color: mesh.material.color, roughness: mesh.material.roughness } },
      ],
    })),
    camera: { name: 'T.PerspectiveCamera', props: { fov: scene.camera.fov, near: scene.camera.near, far: scene.camera.far } },
  };
}

/** Cầu nối A-Frame. */
export const aframeInterop: LibraryInterop = {
  id: 'a-frame',
  label: 'A-Frame',
  category: 'framework',
  backends: ['webgl'],
  capabilities: ['vr', 'entity-component', 'html-declarative'],
  buildScene: (scene, options): LibrarySceneExport => ({
    library: 'a-frame',
    payloadKind: 'markup',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildAFramePayload(scene, options),
  }),
};

/** Cầu nối React Three Fiber. */
export const r3fInterop: LibraryInterop = {
  id: 'react-three-fiber',
  label: 'React Three Fiber',
  category: 'framework',
  backends: ['webgl'],
  capabilities: ['react-components', 'useframe-hooks', 'three-underlying'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'react-three-fiber',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildR3fPayload(scene),
  }),
};

/** Cầu nối Threlte. */
export const threlteInterop: LibraryInterop = {
  id: 'threlte',
  label: 'Threlte',
  category: 'framework',
  backends: ['webgl'],
  capabilities: ['svelte-components', 'three-underlying'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'threlte',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildThreltePayload(scene),
  }),
};
