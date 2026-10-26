/**
 * @file geometry.types.ts
 * @module @aetheria/engine/types/geometry
 * @description Comprehensive geometric, buffer, and generic spatial mathematics type contracts.
 * Zero-dependency pure TypeScript definitions with full type-safety.
 */

// ============================================================================
// Generic Mathematics Contracts
// ============================================================================

export interface Vector2D<T = number> {
  x: T;
  y: T;
}

export interface Vector3D<T = number> {
  x: T;
  y: T;
  z: T;
}

export interface Vector4D<T = number> {
  x: T;
  y: T;
  z: T;
  w: T;
}

export interface Quaternion<T = number> {
  x: T;
  y: T;
  z: T;
  w: T;
}

export interface EulerAngles<T = number> {
  pitch: T;
  yaw: T;
  roll: T;
  order?: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY';
}

/** 4x4 Column-major Transformation Matrix representation */
export interface Matrix4x4<T = number> {
  elements: [
    T, T, T, T,
    T, T, T, T,
    T, T, T, T,
    T, T, T, T
  ];
}

// ============================================================================
// Vertex & Index Buffer Contracts
// ============================================================================

export type VertexAttributeFormat =
  | 'float32'
  | 'float16'
  | 'uint32'
  | 'uint16'
  | 'uint8'
  | 'int8';

export type VertexAttributeSemantic =
  | 'position'
  | 'normal'
  | 'tangent'
  | 'uv0'
  | 'uv1'
  | 'uv2'
  | 'uv3'
  | 'color'
  | 'weights'
  | 'indices'
  | 'custom';

export interface VertexAttributeDescriptor {
  semantic: VertexAttributeSemantic;
  name: string;
  itemSize: number; // e.g. 3 for position, 2 for uv, 4 for color
  format: VertexAttributeFormat;
  normalized?: boolean;
  offset: number; // byte offset in buffer
  stride?: number; // byte stride
}

export interface VertexBufferDescriptor {
  attributes: Record<string, VertexAttributeDescriptor>;
  data: Float32Array;
  vertexCount: number;
  isInterleaved?: boolean;
}

export interface IndexBufferDescriptor {
  format: 'uint16' | 'uint32';
  data: Uint16Array | Uint32Array;
  count: number;
}

export interface GeometryBuffers {
  vertex: VertexBufferDescriptor;
  index?: IndexBufferDescriptor;
  primitiveType?: 'triangles' | 'triangle-strip' | 'points' | 'lines';
}

// ============================================================================
// Node Hierarchy & Scene Graph Contracts
// ============================================================================

export interface NodeFlags {
  visible: boolean;
  isStatic: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  pickable: boolean;
}

export interface TransformNode<
  TData = Record<string, unknown>,
  TMeta = Record<string, unknown>
> {
  uid: string;
  name: string;
  parentUid?: string;
  childrenUids: string[];
  position: Vector3D<number>;
  rotation: Quaternion<number>;
  scale: Vector3D<number>;
  localMatrix: Matrix4x4<number>;
  worldMatrix: Matrix4x4<number>;
  layerMask: number;
  flags: NodeFlags;
  lodIndex?: number;
  data: TData;
  meta: TMeta;
}

export interface MeshTopologyMetrics {
  vertexCount: number;
  triangleCount: number;
  edgeCount: number;
  boundaryEdgeCount: number;
  isManifold: boolean;
  hasUVs: boolean;
  hasNormals: boolean;
  hasTangents: boolean;
  hasBones: boolean;
}
