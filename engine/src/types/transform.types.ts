// engine/src/types/transform.types.ts — Không gian, tọa độ, scale, pivot & zoom types
import type * as THREE from 'three';
export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  position: Vec3;
  rotation: Vec3; // Euler góc radian (XYZ)
  scale: Vec3 | number;
}

export interface SocketBinding {
  /** Tên socket/bone trên rig đích (ví dụ: 'hand_r', 'spine', 'head', 'belt', 'foot_l') */
  socket: string;
  /** Đường dẫn hoặc asset ID của phụ kiện gắn vào */
  assetId: string;
  name?: string;
  boneName?: string;
  attachment?: THREE.Object3D;
  /** Offset tương đối so với socket */
  offset?: Partial<Transform>;
  /** Có liên tục đồng bộ theo ma trận của bone mỗi frame không */
  followBone?: boolean;
  /** Tỷ lệ scale bổ sung khi gắn socket */
  scaleMultiplier?: number;
  /** Tên tag để tra cứu hoặc thay thế trang bị nhanh */
  slotTag?: string;
}

export interface PivotSpec {
  mode: 'origin' | 'bottom' | 'center' | 'top' | 'socket' | 'bone' | 'custom';
  custom?: Vec3;
  targetBone?: string;
  bakeIntoGeometry?: boolean;
}

export interface ZoomSpec {
  /** Hệ số zoom đồng nhất (ví dụ: 1.5, 0.5) */
  factor?: number;
  /** Hoặc hệ số 3 trục riêng biệt */
  scaleAxes?: Vec3;
  /** Chiều cao mục tiêu sau khi zoom */
  targetHeight?: number;
  /** Kích thước hộp bao mục tiêu sau khi zoom [width, height, depth] */
  targetBox?: Vec3;
  /** Tự động vừa vặn vào khoảng nhìn viewport */
  fitExtent?: number;
  /** Giữ nguyên điểm tâm anchor (không bị nhảy vị trí thế giới) */
  preservePivot?: boolean;
  /** Tâm anchor khi phóng to/thu nhỏ */
  anchorPoint?: Vec3 | 'bottom' | 'center' | 'top';
  /** Nướng tỉ lệ trực tiếp vào vertex buffers */
  bakeGeometry?: boolean;
}

export interface BoundingBoxData {
  min: Vec3;
  max: Vec3;
  center: Vec3;
  size: Vec3;
}

export interface BoundingSphereData {
  center: Vec3;
  radius: number;
}

export interface LODLevel {
  distance: number;
  /** Số tam giác mục tiêu hoặc tỷ lệ thu gọn mesh (0..1) so với bản gốc */
  detail: number;
  /** Có dùng mesh đơn giản hóa riêng không */
  customMeshId?: string;
  object?: THREE.Object3D;
}

export interface BlendMask {
  /** Tên các bone được phép áp dụng lớp hoạt ảnh */
  bones: string[];
  /** Trọng số riêng cho từng bone (0..1) */
  weights?: Record<string, number>;
  /** Tự động bao gồm toàn bộ xương con của các bone chỉ định */
  includeChildren?: boolean;
}

export type BlendMode =
  | 'override'
  | 'additive'
  | 'upperBody'
  | 'lowerBody'
  | 'additiveBase'
  | 'masked'
  | 'crossfade'
  | 'layered';
