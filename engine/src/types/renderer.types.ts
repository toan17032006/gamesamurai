// engine/src/types/renderer.types.ts — Kiểu dữ liệu trung tính cho đa Backend Renderer
import type { Vec3 } from './transform.types';

export interface GeometryData {
  positions: Float32Array; // 3 floats / vertex
  normals: Float32Array;   // 3 floats / vertex
  uvs: Float32Array | null; // 2 floats / vertex
  indices: Uint32Array | Uint16Array | null;
  colors?: Float32Array | null;
  tangents?: Float32Array | null;
}

export interface MaterialData {
  color: number;
  roughness: number;
  metalness: number;
  textureUri?: string;
  normalMapUri?: string;
  roughnessMapUri?: string;
  metalnessMapUri?: string;
  emissive?: number;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
  wireframe?: boolean;
}

export interface MeshData {
  id: string;
  geometry: GeometryData;
  transform: Float32Array; // 16 floats matrix column-major
  material: MaterialData;
  instanceTransforms?: Float32Array; // N * 16 floats
  instanceCount?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface AmbientLightData {
  color: number;
  intensity: number;
}

export interface DirectionalLightData {
  direction: [number, number, number];
  color: number;
  intensity: number;
  castShadow?: boolean;
}

export interface PointLightData {
  position: [number, number, number];
  color: number;
  intensity: number;
  distance: number;
  decay?: number;
}

export interface SpotLightData {
  position: [number, number, number];
  direction: [number, number, number];
  color: number;
  intensity: number;
  distance: number;
  angle: number;
  penumbra: number;
}

export interface LightsData {
  ambient: AmbientLightData;
  directional: DirectionalLightData;
  points?: PointLightData[];
  spots?: SpotLightData[];
}

export interface CameraData {
  view: Float32Array; // 16 floats
  projection: Float32Array; // 16 floats
  position?: Vec3;
  target?: Vec3;
  fov?: number;
  near?: number;
  far?: number;
}

export interface PointsData {
  positions: Float32Array;
  colors: Float32Array | null;
  sizes: Float32Array | null;
  count: number;
  size?: number;
  textureUri?: string;
}

export interface RenderSceneData {
  camera: CameraData;
  lights: LightsData;
  meshes: MeshData[];
  points: PointsData | null;
  environmentMapUri?: string;
  fogColor?: number;
  fogNear?: number;
  fogFar?: number;
}

export interface BackendCapabilities {
  shadows: boolean;
  postFx: boolean;
  maxLights: number;
  instancing: boolean;
  webgpuSupported: boolean;
  computeShaders: boolean;
}

export interface RenderBackend {
  readonly name: string;
  init(canvas: HTMLCanvasElement): Promise<void> | void;
  resize(width: number, height: number, pixelRatio: number): void;
  render(scene: RenderSceneData, dt: number): void;
  dispose(): void;
  capabilities(): BackendCapabilities;
}
