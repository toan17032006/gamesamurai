/**
 * @file data-viz-minimal.ts
 * @module @aetheria/engine/render/interop/data-viz-minimal
 * @description Cầu nối cho nhóm **dữ liệu/khoa học/BIM/địa lý** (vtk.js, deck.gl,
 * xeokit, CesiumJS) và **đồ họa tối giản** (Zdog) cùng **native/external**
 * (Filament, OpenSceneGraph, OGRE). Mỗi payload theo đúng idiom dữ liệu của
 * từng thư viện.
 */

import { matrixPosition, matrixScale, type IntermediateScene } from './scene-descriptors.js';
import type { InteropOptions, LibraryInterop, LibrarySceneExport } from './types.js';

/** Payload vtk.js: polydata + actor descriptor. */
export function buildVtkPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    polyData: scene.meshes.map((mesh) => ({
      id: mesh.id,
      points: mesh.geometry.positions,
      polys: mesh.geometry.indices,
      pointData: { normals: mesh.geometry.normals },
    })),
    actors: scene.meshes.map((mesh) => ({
      id: mesh.id,
      position: matrixPosition(mesh.transform.matrix),
      scale: matrixScale(mesh.transform.matrix),
      color: mesh.material.color,
    })),
  };
}

/** Payload deck.gl: layers array (SolidPolygonLayer/PointCloudLayer). */
export function buildDeckPayload(scene: IntermediateScene): Record<string, unknown> {
  const layers: Array<Record<string, unknown>> = scene.meshes.map((mesh) => ({
    type: 'SolidPolygonLayer',
    id: mesh.id,
    data: [{ polygon: [mesh.geometry.positions.slice(0, 9)], color: mesh.material.color }],
    visible: true,
  }));
  if (scene.points) {
    layers.push({
      type: 'PointCloudLayer',
      id: 'aetheria-points',
      data: { position: scene.points.positions, color: scene.points.colors },
      pointSize: scene.points.size,
    });
  }
  return { layers, initialViewState: { fov: scene.camera.fov, target: scene.camera.position } };
}

/** Payload xeokit: BIM model metadata (object id/layer/property). */
export function buildXeokitPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    modelId: scene.rootName,
    objects: scene.meshes.map((mesh) => ({
      id: mesh.id,
      layer: mesh.shadows.receive ? 'opaque' : 'transparent',
      positions: mesh.geometry.positions,
      indices: mesh.geometry.indices,
      worldMatrix: mesh.transform.matrix,
      properties: { color: mesh.material.color, roughness: mesh.material.roughness },
    })),
  };
}

/** Payload CesiumJS: tileset/geo descriptor với cartographic position. */
export function buildCesiumPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    tileset: {
      geometricError: 16,
      root: {
        transform: scene.meshes.length > 0 ? scene.meshes[0].transform.matrix : [],
        content: scene.meshes.map((mesh) => ({ uri: `${mesh.id}.glb` })),
      },
    },
    entities: scene.meshes.map((mesh) => ({
      id: mesh.id,
      position: {
        // Quy ước engine: position world metric; Cesium tự chuyển sang cartographic.
        cartesian: matrixPosition(mesh.transform.matrix),
      },
      orientation: matrixScale(mesh.transform.matrix),
    })),
    camera: scene.camera,
  };
}

/** Payload Zdog: shape/anchor timeline tối giản. */
export function buildZdogPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    illustration: { resize: 'fullscreen', rotate: true },
    shapes: scene.meshes.map((mesh) => ({
      addTo: scene.rootName,
      translate: matrixPosition(mesh.transform.matrix),
      color: `#${mesh.material.color.toString(16).padStart(6, '0')}`,
      stroke: Math.max(...matrixScale(mesh.transform.matrix)),
    })),
  };
}

/** Payload Filament: glTF resource descriptor + material params. */
export function buildFilamentPayload(scene: IntermediateScene): Record<string, unknown> {
  return {
    resources: scene.meshes.map((mesh) => ({
      name: mesh.id,
      renderable: { geometry: mesh.geometry, material: 'aetheria_pbr' },
      materialParams: {
        baseColor: mesh.material.color,
        roughness: mesh.material.roughness,
        metallic: mesh.material.metalness,
      },
      transform: mesh.transform.matrix,
    })),
  };
}

/** Payload OpenSceneGraph: text node osg::Group + Geode. */
export function buildOsgText(scene: IntermediateScene): string {
  const lines: string[] = ['osg::Group {'];
  for (const mesh of scene.meshes) {
    lines.push(`  osg::Geode { name "${mesh.id}"`);
    lines.push(`    position ${matrixPosition(mesh.transform.matrix).map((value) => value.toFixed(4)).join(' ')}`);
    lines.push('  }');
  }
  lines.push('}');
  return lines.join('\n');
}

/** Payload OGRE: khối XML mesh/scene node. */
export function buildOgreText(scene: IntermediateScene): string {
  const lines: string[] = ['<scene>', `  <nodes>`];
  for (const mesh of scene.meshes) {
    const position = matrixPosition(mesh.transform.matrix).map((value) => value.toFixed(4)).join(' ');
    lines.push(`    <node id="${mesh.id}"><position x="..." y="..." z="..." data="${position}"/></node>`);
  }
  lines.push('  </nodes>', '</scene>');
  return lines.join('\n');
}

/** Cầu nối vtk.js. */
export const vtkInterop: LibraryInterop = {
  id: 'vtk.js',
  label: 'vtk.js',
  category: 'data-viz',
  backends: ['webgl'],
  capabilities: ['scientific-data', 'polydata', 'volume'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'vtk.js',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildVtkPayload(scene),
  }),
};

/** Cầu nối deck.gl. */
export const deckInterop: LibraryInterop = {
  id: 'deck.gl',
  label: 'deck.gl',
  category: 'data-viz',
  backends: ['webgl'],
  capabilities: ['large-datasets', 'geo-layers', 'visualization'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'deck.gl',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildDeckPayload(scene),
  }),
};

/** Cầu nối xeokit. */
export const xeokitInterop: LibraryInterop = {
  id: 'xeokit',
  label: 'xeokit',
  category: 'data-viz',
  backends: ['webgl'],
  capabilities: ['bim', 'cad', 'large-models'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'xeokit',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildXeokitPayload(scene),
  }),
};

/** Cầu nối CesiumJS. */
export const cesiumInterop: LibraryInterop = {
  id: 'cesium',
  label: 'CesiumJS',
  category: 'data-viz',
  backends: ['webgl'],
  capabilities: ['globe3d', 'terrain', 'geospatial'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'cesium',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildCesiumPayload(scene),
  }),
};

/** Cầu nối Zdog. */
export const zdogInterop: LibraryInterop = {
  id: 'zdog',
  label: 'Zdog',
  category: 'minimal',
  backends: ['canvas', 'svg'],
  capabilities: ['minimal-3d', 'flat-design'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'zdog',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildZdogPayload(scene),
  }),
};

/** Cầu nối Filament. */
export const filamentInterop: LibraryInterop = {
  id: 'filament',
  label: 'Filament',
  category: 'native',
  backends: ['native-graphics'],
  capabilities: ['pbr', 'real-time', 'gltf-consumption'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'filament',
    payloadKind: 'json',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildFilamentPayload(scene),
  }),
};

/** Cầu nối OpenSceneGraph. */
export const osgInterop: LibraryInterop = {
  id: 'openscenegraph',
  label: 'OpenSceneGraph',
  category: 'native',
  backends: ['native-opengl'],
  capabilities: ['scene-graph', 'native'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'openscenegraph',
    payloadKind: 'text',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildOsgText(scene),
  }),
};

/** Cầu nối OGRE. */
export const ogreInterop: LibraryInterop = {
  id: 'ogre',
  label: 'OGRE',
  category: 'native',
  backends: ['native-graphics'],
  capabilities: ['rendering', 'native'],
  buildScene: (scene): LibrarySceneExport => ({
    library: 'ogre',
    payloadKind: 'text',
    counts: { meshes: scene.meshes.length, lights: scene.lights.length, hasCamera: true },
    payload: buildOgreText(scene),
  }),
};
