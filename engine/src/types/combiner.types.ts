// engine/src/types/combiner.types.ts — Kiểu dữ liệu cho toàn bộ hệ thống ghép nối
import type * as THREE from 'three';
import type { BlendMode, Transform } from './transform.types';
import type { CollisionShape } from './physics.types';

/** Tuple 3 thành phần dùng cho dữ liệu không phụ thuộc `three`. */
export type CombinerVec3Tuple = readonly [number, number, number];

/** Tuple quaternion `[x, y, z, w]`. */
export type CombinerQuatTuple = readonly [number, number, number, number];

/** Loại bao hình không gian mà một combiner có thể tính/yêu cầu. */
export type SpatialBoundsKind = 'aabb' | 'obb' | 'sphere' | 'capsule';

/** Ảnh chụp bao hình không gian, JSON-friendly và độc lập với `three`. */
export interface SpatialBoundsSnapshot {
  aabb: {
    min: CombinerVec3Tuple;
    max: CombinerVec3Tuple;
  };
  obb: {
    center: CombinerVec3Tuple;
    halfExtents: CombinerVec3Tuple;
    orientation: CombinerQuatTuple;
  };
  sphere: {
    center: CombinerVec3Tuple;
    radius: number;
  };
  capsule: {
    start: CombinerVec3Tuple;
    end: CombinerVec3Tuple;
    radius: number;
  } | null;
  volume: number;
  surfaceArea: number;
  centerOfMass: CombinerVec3Tuple;
  vertexCount: number;
  triangleCount: number;
}

/** Mô tả proxy vật lý do combiner tính toán. */
export interface CombinerPhysicsProxy {
  shape: CollisionShape;
  position: CombinerVec3Tuple;
  mass: number;
  gravityScale: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
}

/** Trạng thái layer rút gọn — không lộ chi tiết `AnimationAction` ra public API. */
export interface CombinerLayerSummary {
  readonly name: string;
  readonly mode: BlendMode;
  readonly weight: number;
  readonly timeScale: number;
  readonly enabled: boolean;
  readonly clipName?: string | null;
}

/** Chẩn đoán có cấu trúc trả về cùng kết quả combiner. */
export interface CombineDiagnostics {
  readonly missingClips: readonly string[];
  readonly missingBones: readonly string[];
  readonly warnings: readonly string[];
  readonly durationMs: number;
}

/** Mô tả khả năng vật lý của một combiner. */
export interface CombinerPhysicsMetadata {
  /** Collider mặc định khi combiner tạo proxy vật lý. */
  readonly collider: 'none' | 'box' | 'sphere' | 'capsule' | 'mesh';
  /** Hệ số trọng lực mặc định (`0` = không chịu trọng lực). */
  readonly gravity: number;
  readonly mass?: number;
  readonly friction?: number;
  readonly restitution?: number;
  /** Combiner có phát sinh lực/va chạm trong lúc chạy hay không. */
  readonly dynamic: boolean;
}

/** Mô tả yêu cầu bao hình của một combiner. */
export interface CombinerBoundsMetadata {
  /** Có cần dữ liệu bao hình để chạy chính xác hay không. */
  readonly required: boolean;
  /** Bao hình chính được tính. */
  readonly volumeKind: SpatialBoundsKind;
  /** Truy vấn không gian tuỳ chọn đi kèm. */
  readonly query: 'none' | 'aabb' | 'sphere' | 'segment' | 'ray';
}

/** Thống kê chi phí/phân tích tĩnh của combiner. */
export interface CombinerAnalyticsMetadata {
  readonly cost: 'low' | 'medium' | 'high';
  /** Số clip/layer tối đa mà combiner có thể trộn. */
  readonly mixes: number;
  readonly usesPhysics: boolean;
  readonly usesSpatial: boolean;
  readonly deterministic: boolean;
}

/** Phân loại không gian áp dụng cho phép biến đổi của combiner. */
export interface CombinerTransformMetadata {
  readonly space: 'local' | 'world';
  readonly affectsRoot: boolean;
  readonly animated: boolean;
}

/**
 * Siêu dữ liệu đầy đủ cho một combiner.
 *
 * Trường `custom` cho phép dự án mở rộng mà không phá vỡ kiểu lõi; các trường
 * còn lại được tính tự động từ tên + nhóm trong `combine.ts`.
 */
export interface CombinerMetadata {
  readonly category: CombinerGroup;
  readonly bounds: CombinerBoundsMetadata;
  readonly physics: CombinerPhysicsMetadata;
  readonly transform: CombinerTransformMetadata;
  readonly analytics: CombinerAnalyticsMetadata;
  readonly tags?: readonly string[];
  readonly custom?: Readonly<Record<string, unknown>>;
}

export interface IBlenderLayer {
  name: string;
  action: THREE.AnimationAction | null;
  mode: BlendMode;
  weight: number;
  timeScale: number;
  enabled: boolean;
  maskBones?: string[];
  /** Tên clip đang phát. */
  clipName?: string | null;
  /** Chế độ lặp của action. */
  loop?: THREE.AnimationActionLoopStyles;
  /** Số lần lặp (Infinity = lặp vô hạn). */
  repetitions?: number;
  /** Giữ pose cuối khi hết clip. */
  clampWhenFinished?: boolean;
  /** Layer tạm dừng. */
  paused?: boolean;
}

export interface SocketHandle {
  id?: string;
  socket?: string;
  bone: THREE.Object3D;
  asset?: THREE.Object3D;
  /** Nhóm chứa asset gắn vào socket — luôn tồn tại với handle do SocketBinder tạo. */
  group: THREE.Group;
  binding: {
    socket: string;
    assetId: string;
    offset?: Partial<Transform>;
    followBone?: boolean;
    scaleMultiplier?: number;
    slotTag?: string;
  };
}

export type UtilArg = number | string | boolean | Record<string, unknown> | THREE.Object3D;

/** Mô tả ray đầu vào cho các combiner truy vấn không gian. */
export interface CombinerRayInput {
  origin: CombinerVec3Tuple;
  direction: CombinerVec3Tuple;
  maxDistance?: number;
}

/** Mô tả hộp truy vấn đầu vào. */
export interface CombinerBoundsInput {
  min: CombinerVec3Tuple;
  max: CombinerVec3Tuple;
}

/**
 * Tuỳ chọn dùng chung cho mọi combiner.
 *
 * `TData` cho phép dự án truyền payload riêng đã được định kiểu thay vì
 * `Record<string, unknown>` chung chung.
 */
export interface CombineOptions<TData extends UtilArg = UtilArg> {
  speed?: number;
  weight?: number;
  fade?: number;
  assetId?: string;
  offset?: Partial<Transform>;
  followBone?: boolean;
  scaleMultiplier?: number;
  slotTag?: string;
  data?: TData;
  intensity?: number;
  duration?: number;
  /** Chọn bao hình cần tính (`all` trả đầy đủ AABB/OBB/Sphere/Capsule). */
  boundsMode?: SpatialBoundsKind | 'all';
  /** Hộp truy vấn không gian cho combiner util. */
  queryBounds?: CombinerBoundsInput;
  /** Ray truy vấn không gian cho combiner util. */
  ray?: CombinerRayInput;
  /** Collider cần kiểm định/tạo proxy. */
  collisionShape?: CollisionShape;
  /** Vị trí đặt collider (mặc định gốc toạ độ). */
  shapePosition?: CombinerVec3Tuple;
  /** Vector dịch chuyển cho bài kiểm tra sweep. */
  displacement?: CombinerVec3Tuple;
  /** Khối lượng ghi đè khi tạo proxy vật lý. */
  mass?: number;
  /** Hệ số trọng lực ghi đè. */
  gravity?: number;
}

/**
 * Kết quả combiner có kiểu.
 *
 * `TInfo` mặc định là `Record<string, unknown>` để tương thích ngược; các
 * combiner mới có thể khai báo interface payload riêng.
 */
export interface CombineResult<TInfo extends Record<string, unknown> = Record<string, unknown>> {
  ok: boolean;
  fn: string;
  group?: string;
  layers?: CombinerLayerSummary[];
  socket?: SocketHandle | null;
  info?: TInfo;
  /** Bao hình đã tính (nếu combiner có yêu cầu không gian). */
  bounds?: SpatialBoundsSnapshot;
  /** Proxy vật lý đã tạo (nếu combiner có yêu cầu vật lý). */
  physics?: CombinerPhysicsProxy;
  diagnostics?: CombineDiagnostics;
}

export type CombinerGroup =
  | 'move'
  | 'attach'
  | 'creature'
  | 'blend'
  | 'util'
  | 'creatureCombat'
  | 'action'
  | 'acro'
  | 'env'
  | 'humanoid'
  | 'destructible'
  | 'foliage'
  | 'structure'
  | 'water'
  | 'atmosphere'
  | 'earth'
  | 'props'
  | 'animalAdvanced';

/**
 * Đặc tả bất biến của một combiner.
 *
 * `TMetadata` cho phép mở rộng metadata theo từng dự án; mặc định là
 * `CombinerMetadata` đã bao gồm bounds/physics/analytics.
 */
export interface CombinatorSpec<TMetadata extends CombinerMetadata = CombinerMetadata> {
  readonly name: string;
  readonly group: CombinerGroup;
  readonly kind: 'move' | 'attach' | 'blend' | 'util' | 'physics' | 'environment';
  readonly baseClip?: string;
  readonly overlayClip?: string;
  readonly socket?: string;
  readonly mode: BlendMode;
  readonly timeScaleKey: 'speed' | 'none';
  readonly description?: string;
  /** Siêu dữ liệu không gian/vật lý/phân tích. */
  readonly metadata?: TMetadata;
  /** Combiner cần root hợp lệ để chạy (util/environment thường cần). */
  readonly requiresRoot?: boolean;
  /** Độ ưu tiên khi nhiều combiner cùng ghi một thuộc tính. */
  readonly priority?: number;
  readonly tags?: readonly string[];
}
