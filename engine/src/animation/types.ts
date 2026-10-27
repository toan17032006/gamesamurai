/**
 * @file types.ts
 * @module @aetheria/engine/animation/types
 * @description Hợp đồng dữ liệu và kiểu dùng chung cho module quản lý render
 * hoạt ảnh (animation management). Module này trung tính với mọi thư viện đồ
 * họa (Three.js, Babylon.js, PlayCanvas, OGL, regl, vtk.js, CesiumJS...) —
 * dữ liệu ở đây là chuẩn trung gian (IR) mà các cầu nối `render/interop`
 * chuyển sang descriptor/idiom của từng thư viện.
 *
 * Quy ước:
 * - Thời gian đo bằng giây; góc đo bằng radian; quaternion thứ tự (x, y, z, w).
 * - Track ánh xạ tới *đường dẫn thuộc tính* trên object đích (ví dụ
 *   `position`, `rotation`, `scale.x`, `morphWeights.smile`) — tầng render của
 *   từng thư viện tự giải path sang API của nó.
 * - Mọi kiểu đều tuần tự hóa được (JSON) để phục vụ checkpoint/network-sync.
 */

/** Kiểu nội suy giữa hai keyframe. */
export type InterpolationKind = 'step' | 'linear' | 'catmull-rom' | 'cubic-hermite';

/** Chế độ lặp khi thời gian vượt chiều dài clip. */
export type WrapMode = 'once' | 'loop' | 'ping-pong' | 'clamp';

/** Keyframe vô hướng: thời điểm + giá trị (+ tay cầm bezier cho hermite). */
export interface ScalarKeyframe {
  /** Thời điểm (giây) — bắt buộc tăng dần trong track. */
  time: number;
  value: number;
  /** Đạo hàm ngoài trái (cubic-hermite); bỏ qua = tự tính catmull-rom. */
  inTangent?: number;
  /** Đạo hàm ngoài phải (cubic-hermite). */
  outTangent?: number;
  /** Hệ số easing áp dụng trên đoạn bắt đầu từ keyframe này (`[0,1]`). */
  easing?: string;
}

/** Loại giá trị mà track điều khiển. */
export type TrackValueKind = 'scalar' | 'vector2' | 'vector3' | 'quaternion' | 'color';

/** Track hoạt ảnh: đường dẫn thuộc tính + dãy keyframe vô hướng/vectors. */
export interface AnimationTrack {
  /** Định danh track (thường trùng đường dẫn thuộc tính). */
  name: string;
  /** Đường dẫn thuộc tính trên object đích (ví dụ `position`, `scale.y`). */
  targetPath: string;
  kind: TrackValueKind;
  /**
   * Keyframe: với kind khác `scalar`, mảng phẳng theo thành phần
   * (`time`, rồi `components.length` giá trị).
   */
  keys: number[];
  /** Số thành phần mỗi keyframe giá trị (1 với scalar, 3 với vector3...). */
  readonly componentCount: number;
  interpolation: InterpolationKind;
  /** Easing theo từng đoạn (keyframe trái); thiếu = linear. */
  keyEasings?: string[];
  /** Keyframe sự kiện (không điều khiển giá trị, chỉ phát tín hiệu). */
  events?: AnimationEventKey[];
}

/** Một sự kiện gắn vào mốc thời gian của track/clip. */
export interface AnimationEventKey {
  time: number;
  /** Tên sự kiện do game định nghĩa (vd `footstep`, `shoot`). */
  name: string;
  /** Payload tùy ý tuần tự hóa được. */
  payload?: Record<string, unknown>;
}

/** Clip hoạt ảnh: tập track + độ dài + siêu dữ liệu. */
export interface AnimationClipData {
  name: string;
  /** Độ dài clip (giây) — luôn >= 0. */
  duration: number;
  tracks: AnimationTrack[];
  /** Sự kiện cấp clip (độc lập track). */
  events?: AnimationEventKey[];
  /** Siêu dữ liệu tùy ý (tên rig, fps gốc, nguồn BVH/VMD...). */
  metadata?: Record<string, unknown>;
}

/** Trọng số/điều hòa của một layer trộn. */
export interface ClipLayerState {
  clipName: string;
  weight: number;
  /** Chế độ trộn của layer: override hay cộng dồn lên layer dưới. */
  blendMode: 'override' | 'additive';
  /** Mask property-path được layer này tác động (bỏ qua = toàn bộ). */
  mask?: readonly string[];
  timeScale: number;
}

/** Kết quả đánh giá một track tại thời điểm t — đầu vào cho tầng render. */
export interface TrackEvaluation {
  trackName: string;
  targetPath: string;
  kind: TrackValueKind;
  /** Giá trị phẳng theo thành phần. */
  values: number[];
}

/** Bản ghi pose sau khi trộn mọi layer — đầu vào cho `render/interop`. */
export interface AnimationPose {
  /** `targetPath -> TrackEvaluation`. */
  bindings: Map<string, TrackEvaluation>;
  /** Sự kiện phát sinh trong khung thời gian vừa chơi. */
  firedEvents: AnimationEventKey[];
}

/** Descriptor chuyển đổi sang một thư viện đồ họa cụ thể. */
export interface LibraryAnimationExport {
  library: string;
  /** Định dạng payload: `json` (descriptor), `markup` (chuỗi), `text` (định dạng văn bản). */
  payloadKind: 'json' | 'markup' | 'text';
  /** Nội dung descriptor (đã tuần tự hóa được). */
  payload: unknown;
}

/** Tham chiếu một clip trong state machine. */
export interface AnimationStateDefinition {
  name: string;
  clipName: string;
  /** Tốc độ chơi mặc định của state. */
  speed?: number;
  /** Có lặp vô hạn hay không (mặc định lấy từ cấu hình machine). */
  loop?: boolean;
}

/** Điều kiện chuyển state: so sánh tham số hoặc trigger. */
export interface TransitionCondition {
  parameter: string;
  /** `trigger` chỉ cần từng set; còn lại so sánh số/bool. */
  comparison: 'equals' | 'notEquals' | 'greater' | 'less' | 'trigger';
  value?: number | boolean;
}

/** Chuyển tiếp giữa hai state. */
export interface TransitionDefinition {
  from: string;
  to: string;
  /** Thời lượng crossfade (giây). */
  duration: number;
  conditions?: TransitionCondition[];
  /** Thời điểm clip nguồn kết thúc mới chuyển (exit time); bỏ qua = khi đủ điều kiện. */
  exitTime?: number;
  /** Có được phép chuyển lại ngay cả giữa chừng hay không. */
  canInterrupt?: boolean;
}

/** Hợp đồng cho object nhận giá trị pose (tầng render của game). */
export interface PoseTarget {
  /** Ghi giá trị vào đường dẫn thuộc tính; trả `false` nếu path không tồn tại. */
  apply(path: string, values: readonly number[], kind: TrackValueKind): boolean;
}
