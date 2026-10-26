// engine/src/types/asset.types.ts — Hệ thống định nghĩa kiểu dữ liệu tài sản 3D hoàn chỉnh
import type * as THREE from 'three';
import type { Vec3, Transform } from './transform.types';

/**
 * Định dạng tài sản 3D mà Engine bóc tách được.
 *
 * - Mô hình:        gltf, glb, fbx, obj, dae, 3ds, stl, ply
 * - Cảnh / trao đổi: usd, usda, usdc, abc
 * - Vật liệu/texture: mtl, png, jpg, jpeg, webp, tga, exr, hdr
 * - Chuyển động:    bvh, vmd
 * - Riêng của Engine: forge-design, bot-spec, asset-manifest, asset-sidecar
 */
export type AssetFormat =
  // Mô hình / hình học
  | 'gltf'
  | 'glb'
  | 'fbx'
  | 'obj'
  | 'dae'
  | '3ds'
  | 'stl'
  | 'ply'
  // Cảnh & trao đổi dữ liệu
  | 'usd'
  | 'usda'
  | 'usdc'
  | 'abc'
  // Vật liệu & texture
  | 'mtl'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'tga'
  | 'exr'
  | 'hdr'
  // Animation & dữ liệu chuyển động
  | 'bvh'
  | 'vmd'
  // Định dạng riêng của Engine
  | 'forge-design'
  | 'bot-spec'
  | 'asset-manifest'
  | 'asset-sidecar'
  // Sinh bằng mã / không xác định
  | 'procedural'
  | 'custom';

/** Nhóm định dạng — quyết định pipeline bóc tách nào được dùng. */
export type AssetKind =
  | 'geometry' // lưới tam giác (stl, ply, obj, glb…)
  | 'scene' // cảnh có thứ bậc (gltf, fbx, dae, usd, abc…)
  | 'material' // định nghĩa vật liệu (mtl)
  | 'texture' // ảnh (png, jpg, exr, hdr…)
  | 'motion' // dữ liệu chuyển động (bvh, vmd)
  | 'data'; // dữ liệu Engine (forge-design, bot-spec, manifest)

export type AssetCategory =
  | 'character'
  | 'monster'
  | 'boss'
  | 'npc'
  | 'weapon'
  | 'shield'
  | 'armor'
  | 'helmet'
  | 'accessory'
  | 'prop'
  | 'interactive'
  | 'building'
  | 'structure'
  | 'vegetation'
  | 'tree'
  | 'rock'
  | 'water'
  | 'terrain'
  | 'vfx'
  | 'environment'
  | 'mount'
  | 'misc';

export type RigKind = 'humanoid' | 'quadruped' | 'bird' | 'fish' | 'insect' | 'reptile' | 'tentacle' | 'custom' | 'static';

export interface VertexBufferData {
  positions: Float32Array;
  normals?: Float32Array;
  uvs?: Float32Array;
  uv2s?: Float32Array;
  colors?: Float32Array;
  tangents?: Float32Array;
  skinIndices?: Uint16Array | Float32Array;
  skinWeights?: Float32Array;
  indices?: Uint32Array | Uint16Array;
}

export interface GeometryStats {
  meshes: number;
  vertices: number;
  triangles: number;
  materials: number;
  bones: number;
  submeshes?: number;
  hasSkinning?: boolean;
  hasMorphTargets?: boolean;
  hasTangents?: boolean;
}

export type TextureSlot =
  | 'albedo'
  | 'diffuse'
  | 'normal'
  | 'roughness'
  | 'metalness'
  | 'ao'
  | 'emissive'
  | 'displacement'
  | 'alpha'
  | 'specular'
  | 'transmission'
  | 'other';

export interface TextureMapInfo {
  slot: TextureSlot;
  uri: string;
  width?: number;
  height?: number;
  format?: string;
  hasAlpha?: boolean;
  isEmbedded?: boolean;
}

export interface BoneNodeInfo {
  name: string;
  parentName?: string;
  index: number;
  localTransform: Transform;
  worldPosition?: Vec3;
}

export interface SocketDefinition {
  name: string;
  parentBone: string;
  offset: Transform;
  categoryAllowed?: AssetCategory[];
}

export interface AssetMetadata {
  name: string;
  category: AssetCategory;
  tags: string[];
  scaleHint?: number;
  pivot?: 'origin' | 'bottom' | 'center' | 'socket' | 'custom';
  rig?: RigKind;
  format: string;
  author?: string;
  version?: string;
  license?: string;
  sockets?: SocketDefinition[];
  lodDistances?: number[];
  collisionPreset?: 'box' | 'sphere' | 'capsule' | 'convexMesh' | 'trimesh' | 'none';
  mass?: number;
  friction?: number;
  restitution?: number;
  isDestructible?: boolean;
  shatterPieces?: number;
}

export interface Bounds {
  box: {
    min: [number, number, number];
    max: [number, number, number];
  };
  sphere: {
    center: [number, number, number];
    radius: number;
  };
  size: [number, number, number];
  height: number;
  width: number;
  depth: number;
}

export interface ParsedAsset {
  id: string;
  sourcePath: string;
  format: AssetFormat;
  /** Nhóm định dạng — bóc tách theo pipeline nào. */
  kind: AssetKind;
  /** Toàn bộ cảnh đã bóc tách (gốc của cây). */
  scene: THREE.Object3D;
  /**
   * Đối tượng mô hình chính — mesh đầu tiên tìm được, hoặc chính `scene`
   * khi tài sản không có mesh (dữ liệu, texture, motion).
   */
  model: THREE.Object3D;
  /** Phân loại tài sản — suy ra từ đường dẫn hoặc sidecar. */
  category: AssetCategory;
  animations: THREE.AnimationClip[];
  geometryStats: GeometryStats;
  textures: TextureMapInfo[];
  metadata: AssetMetadata;
  bounds: Bounds;
  bones?: BoneNodeInfo[];
  sockets?: SocketDefinition[];
  /** Vật liệu theo tên — luôn có (rỗng nếu tài sản không dùng vật liệu). */
  materials: Record<string, THREE.Material>;
  /** Dữ liệu đỉnh thô theo tên mesh — luôn có (rỗng nếu không có mesh). */
  rawBuffers: Record<string, VertexBufferData>;
  /** Tệp nguồn (texture/motion/data) — chỉ có với kind texture/motion/data. */
  texture?: THREE.Texture;
  /** Payload chuyển động đã giải mã (BVH/VMD). */
  motion?: MotionData;
  /** Payload dữ liệu Engine (ForgeDesignSpec/BotSpec/manifest). */
  data?: unknown;
  /** Tệp ngoài được tham chiếu (mtl, texture, bin) — phải nạp theo. */
  dependencies: string[];
  /** Cảnh báo khi bóc tách (thiếu dữ liệu, fallback, v.v.). */
  warnings: string[];
  /** Kích thước tệp nguồn (byte). */
  sizeBytes: number;
  /** Tên các clip animation đã nạp — luôn có (rỗng nếu không có animation). */
  animationNames: string[];
  /** Tên các vật liệu đã nạp — luôn có (rỗng nếu không có vật liệu). */
  materialNames: string[];
  /** Số texture đã nạp. */
  textureCount: number;
  /** Số mức LOD trong cảnh (0 = không có). */
  lodCount: number;
  /** Số đèn trong cảnh. */
  lightCount: number;
  /** Số camera trong cảnh. */
  cameraCount: number;
  /** Cảnh có rig xương hay không. */
  hasSkeleton: boolean;
  /** Cảnh có animation hay không. */
  hasAnimation: boolean;
}

export interface MotionBone {
  name: string;
  parent?: string;
  offset: Vec3;
  rotation?: Vec3;
}

export interface MotionFrame {
  time: number;
  positions: Record<string, Vec3>;
  rotations?: Record<string, Vec3>;
}

export interface MotionData {
  /** Loại motion: 'bvh' | 'vmd'. */
  kind: 'bvh' | 'vmd';
  /** Tên chuyển động (VMD) hoặc tên hierarchy (BVH). */
  name: string;
  /** Số khung hình. */
  frameCount: number;
  /** Tổng thời lượng (giây). */
  duration: number;
  /** Khung hình hình ảnh giây. */
  fps: number;
  /** Cây xương. */
  bones: MotionBone[];
  /** Các khung hình đã giải mã (rỗng nếu chỉ cần hierarchy). */
  frames: MotionFrame[];
}

export interface AssetManifestEntry {
  id: string;
  path: string;
  format: AssetFormat;
  category: AssetCategory;
  name: string;
  tags: string[];
  bounds?: Bounds;
  animations?: string[];
  sizeBytes?: number;
  rig?: RigKind;
  mtlPath?: string;
  sidecarPath?: string;
  lodPaths?: string[];
  thumbnail?: string;
}

export interface AssetManifest {
  version: number;
  generatedAt: string;
  entries: AssetManifestEntry[];
}
