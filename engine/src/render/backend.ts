// engine/src/render/backend.ts — Abstraction RenderBackend TRUNG TÍNH (Three.js, Babylon.js, PlayCanvas, WebGL2, WebGPU)
import type {
  GeometryData,
  MaterialData,
  MeshData,
  AmbientLightData,
  DirectionalLightData,
  PointLightData,
  SpotLightData,
  LightsData,
  CameraData,
  PointsData,
  RenderSceneData,
  BackendCapabilities,
  RenderBackend,
} from '../types/renderer.types';

export type {
  GeometryData,
  MaterialData,
  MeshData,
  AmbientLightData,
  DirectionalLightData,
  PointLightData,
  SpotLightData,
  LightsData,
  CameraData,
  PointsData,
  RenderSceneData,
  BackendCapabilities,
  RenderBackend,
};

export function emptySceneData(): RenderSceneData {
  const view = new Float32Array(16);
  const proj = new Float32Array(16);
  view[0] = view[5] = view[10] = view[15] = 1;
  proj[0] = proj[5] = proj[10] = proj[15] = 1;
  return {
    camera: { view, projection: proj },
    lights: {
      ambient: { color: 0xffffff, intensity: 0.6 },
      directional: { direction: [0, -1, 0], color: 0xffffff, intensity: 1 },
    },
    meshes: [],
    points: null,
  };
}
