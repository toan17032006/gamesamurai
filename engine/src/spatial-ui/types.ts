/**
 * @file types.ts
 * @module @aetheria/engine/spatial-ui/types
 * @description Comprehensive domain interfaces and geometric types for 3D UI & Spatial Math (1,800 functions).
 */

export interface Vec2D {
  x: number;
  y: number;
}

export interface Vec3D {
  x: number;
  y: number;
  z: number;
}

export interface Vec4D {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface QuatD {
  x: number;
  y: number;
  z: number;
  w: number;
}

export type Mat4D = number[]; // 16 elements column-major or row-major

export interface EulerAngles {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface Box3D {
  min: Vec3D;
  max: Vec3D;
}

export interface Sphere3D {
  center: Vec3D;
  radius: number;
}

export interface Capsule3D {
  start: Vec3D;
  end: Vec3D;
  radius: number;
}

export interface Cylinder3D {
  center: Vec3D;
  height: number;
  radius: number;
}

export interface Ray3D {
  origin: Vec3D;
  direction: Vec3D;
}

export interface Plane3D {
  normal: Vec3D;
  distance: number;
}

export interface Triangle3D {
  a: Vec3D;
  b: Vec3D;
  c: Vec3D;
}

export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CameraFrustum {
  near: Plane3D;
  far: Plane3D;
  left: Plane3D;
  right: Plane3D;
  top: Plane3D;
  bottom: Plane3D;
  corners?: Vec3D[];
}

export interface UIAnchor {
  id?: string;
  worldPosition: Vec3D;
  screenOffset?: Vec2D;
  billboard?: boolean;
  scaleWithDistance?: boolean;
  minScale?: number;
  maxScale?: number;
  depthOrder?: number;
  visible?: boolean;
}

export interface UIHitResult {
  hit: boolean;
  point?: Vec3D;
  screenPoint?: Vec2D;
  distance?: number;
  targetId?: string;
}

export interface SpatialGridCell {
  index: { x: number; y: number; z: number };
  center: Vec3D;
  bounds: Box3D;
  occupied?: boolean;
  cost?: number;
}

export interface SplinePoint {
  position: Vec3D;
  tangent?: Vec3D;
  normal?: Vec3D;
  t?: number;
}

export interface TrajectoryPoint {
  position: Vec3D;
  velocity?: Vec3D;
  acceleration?: Vec3D;
  time: number;
}

export interface SpatialUIConfig {
  screenWidth?: number;
  screenHeight?: number;
  fov?: number;
  nearPlane?: number;
  farPlane?: number;
  aspectRatio?: number;
  unitScale?: number;
}
