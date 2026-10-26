/**
 * @file spatial.types.ts
 * @module @aetheria/engine/types/spatial
 * @description Generic spatial bounding volumes, partitioning structures, frustum culling, and query types.
 */

import type { Vector3D, Quaternion, Matrix4x4 } from './geometry.types.js';

// ============================================================================
// Bounding Volume Contracts
// ============================================================================

export interface AABB<T = number> {
  min: Vector3D<T>;
  max: Vector3D<T>;
}

export interface OBB<T = number> {
  center: Vector3D<T>;
  halfExtents: Vector3D<T>;
  axes: [Vector3D<T>, Vector3D<T>, Vector3D<T>];
  orientation?: Quaternion<T>;
}

export interface BoundingSphere<T = number> {
  center: Vector3D<T>;
  radius: T;
}

export interface BoundingCapsule<T = number> {
  start: Vector3D<T>;
  end: Vector3D<T>;
  radius: T;
}

export interface ConvexHull<T = number> {
  vertices: Vector3D<T>[];
  faces: number[][]; // index lists per face
  normals: Vector3D<T>[];
}

export interface SpatialBoundsReport {
  aabb: AABB<number>;
  obb: OBB<number>;
  sphere: BoundingSphere<number>;
  capsule: BoundingCapsule<number>;
  centerOfMass: Vector3D<number>;
  dimensions: Vector3D<number>;
  volume: number;
  surfaceArea: number;
}

// ============================================================================
// Spatial Partitioning Trees & Structures
// ============================================================================

export interface OctreeNode<T = unknown> {
  id: string;
  bounds: AABB<number>;
  depth: number;
  maxDepth: number;
  elements: T[];
  children?: [
    OctreeNode<T>,
    OctreeNode<T>,
    OctreeNode<T>,
    OctreeNode<T>,
    OctreeNode<T>,
    OctreeNode<T>,
    OctreeNode<T>,
    OctreeNode<T>
  ];
}

export interface SpatialGridStructure<T = unknown> {
  cellSize: number;
  bounds: AABB<number>;
  cells: Map<string, T[]>;
  totalItems: number;
}

export interface BVHNode<T = unknown> {
  bounds: AABB<number>;
  left?: BVHNode<T>;
  right?: BVHNode<T>;
  elements?: T[];
  isLeaf: boolean;
}

export interface BVHTree<T = unknown> {
  root: BVHNode<T>;
  totalNodes: number;
  maxDepth: number;
}

// ============================================================================
// Frustum & Spatial Queries
// ============================================================================

export interface FrustumPlane<T = number> {
  normal: Vector3D<T>;
  distance: T;
}

export interface CameraFrustum<T = number> {
  /** [left, right, bottom, top, near, far] */
  planes: [
    FrustumPlane<T>,
    FrustumPlane<T>,
    FrustumPlane<T>,
    FrustumPlane<T>,
    FrustumPlane<T>,
    FrustumPlane<T>
  ];
}

export type LayerMask = number;

export interface SpatialQuery<T = unknown> {
  type: 'ray' | 'sphere' | 'box' | 'frustum';
  origin?: Vector3D<number>;
  direction?: Vector3D<number>;
  maxDistance?: number;
  radius?: number;
  bounds?: AABB<number>;
  frustum?: CameraFrustum<number>;
  layerMask?: LayerMask;
  predicate?: (item: T) => boolean;
}

export interface SpatialQueryResult<T = unknown> {
  items: T[];
  hitCount: number;
  queryTimeMs: number;
}
