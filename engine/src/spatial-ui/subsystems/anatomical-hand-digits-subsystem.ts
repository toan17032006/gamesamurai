/**
 * @file anatomical-hand-digits-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/anatomical-hand-digits-subsystem
 * @description Thumb, Index, Middle, Ring & Little Finger Kinematics Subsystem (401–600).
 *
 * Mọi hàm ở đây trả về **đúng phép tính mà tên hàm mô tả**. Trước đây 200 method
 * dùng chung ~11 body nên: mọi khớp của mọi ngón rơi về cùng một điểm, mọi phép
 * đo trả `1.0`, mọi góc trả `0.0`, mọi hướng trả `{x:0,y:0,z:1}`, mọi quaternion
 * trả identity và mọi va chạm trả `hit: true` cố định.
 *
 * **Quy ước neo (anchor) — hai quy tắc, mỗi quy tắc đúng cho câu hỏi của nó:**
 *
 * 1. *Vị trí khớp* (`getXxxPosition`): `entity.position` là neo của **gốc ngón**
 *    (root/base) và mang sẵn vị trí ngang của ngón trong lòng bàn tay. Vì vậy mỗi
 *    khớp được đặt tại offset giải phẫu **tính từ gốc ngón**
 *    (`fingerJointOffset(finger, joint) − fingerJointOffset(finger, 'root')`).
 *    Nhờ vậy `getThumbTipPosition` khác `getThumbMCPPosition` một lệch thật, ngón
 *    cái giữ được độ vươn sang bên và ra trước, các ngón dài giữ trục thẳng.
 * 2. *Khoảng cách giữa hai ngón* (`calculateXxxDistance`): dùng offset **tuyệt đối**
 *    của đầu ngón (`anchor + fingerJointOffset(finger, 'tip')`) theo đặc tả, vì ở
 *    đây cần cả khoảng cách ngang thật giữa hai ngón (ngón trỏ – ngón áp út
 *    ≈ 3,9 cm; ngón trỏ – ngón giữa ≈ 2,1 cm).
 *
 * Đơn vị: mét, radian, hệ Y-up, +X sang phải, +Y lên, +Z về phía trước.
 */

import type {
  Vec2D,
  Vec3D,
  Vec4D,
  QuatD,
  Mat4D,
  EulerAngles,
  Box3D,
  Sphere3D,
  Capsule3D,
  Cylinder3D,
  Ray3D,
  Plane3D,
  Triangle3D,
  ViewportRect,
  CameraFrustum,
  UIAnchor,
  UIHitResult,
  SpatialGridCell,
  SplinePoint,
  TrajectoryPoint,
  SpatialUIConfig
} from '../types.js';

import {
  UP3,
  RIGHT3,
  toVec3,
  entityPosition,
  entityQuaternion,
  entityForward,
  clamp,
  normalize,
  dot,
  add,
  subtract,
  magnitude,
  distance3D,
  signedAngle,
  quaternionToEuler,
  normalizeQuaternion,
  boundingBox,
  offsetPosition,
  namedResult,
  measurement,
  directionResult,
  orientationResult,
  boundsResult,
  aabbResult
} from '../spatial-primitives.js';

import {
  BODY_BOX_SIZES,
  FINGER_LENGTHS,
  FINGER_SEGMENTS,
  FINGER_SPACING,
  fingerJointOffset
} from '../anatomy-metrics.js';

/** Tập ngón tay mà subsystem này phục vụ. */
type FingerId = 'thumb' | 'index' | 'middle' | 'ring' | 'little';

/** Khoá bảng `BODY_BOX_SIZES` tương ứng với từng ngón. */
const FINGER_BOX_KEY: Readonly<Record<FingerId, string>> = {
  thumb: 'thumb',
  index: 'indexFinger',
  middle: 'middleFinger',
  ring: 'ringFinger',
  little: 'littleFinger'
};

/** Các tên xương (bone) có thể mang tên ngón — dùng để tra quaternion thật. */
const FINGER_BONE_NAMES: Readonly<Record<FingerId, readonly string[]>> = {
  thumb: ['thumb', 'thumbbone', 'thumb_1', 'thumb1'],
  index: ['index', 'indexfinger', 'indexfingerbone', 'index_1', 'index1'],
  middle: ['middle', 'middlefinger', 'middlefingerbone', 'middle_1', 'middle1'],
  ring: ['ring', 'ringfinger', 'ringfingerbone', 'ring_1', 'ring1'],
  little: ['little', 'littlefinger', 'littlefingerbone', 'little_1', 'little1', 'pinky']
};

/** Chuỗi khớp + tỉ trọng góc gập của từng ngón (ngón cái có CMC/MCP/IP). */
const JOINT_LAYOUT: Readonly<Record<FingerId, { joints: string[]; weights: number[] }>> = {
  thumb: { joints: ['cmc', 'mcp', 'ip'], weights: [0.3, 0.4, 0.3] },
  index: { joints: ['mcp', 'pip', 'dip'], weights: [0.4, 0.35, 0.25] },
  middle: { joints: ['mcp', 'pip', 'dip'], weights: [0.4, 0.35, 0.25] },
  ring: { joints: ['mcp', 'pip', 'dip'], weights: [0.4, 0.35, 0.25] },
  little: { joints: ['mcp', 'pip', 'dip'], weights: [0.4, 0.35, 0.25] }
};

/** Ngón liền kề (dùng cho độ xòe giữa hai trục ngón). */
const ADJACENT_FINGER: Readonly<Record<FingerId, FingerId>> = {
  thumb: 'index',
  index: 'middle',
  middle: 'ring',
  ring: 'little',
  little: 'ring'
};

/** Gia tốc tối đa coi là "độ mượt" bằng 0 (m/s²). */
const MAX_SMOOTH_ACCELERATION = 10;

// ---------------------------------------------------------------------------
// Hàm phụ (module-level) — chỉ dùng nội bộ file này
// ---------------------------------------------------------------------------

/**
 * Offset của một khớp tính từ gốc ngón (root) — đơn vị đo trong không gian ngón.
 *
 * `side` chọn bàn tay trái hay phải: 'right' phản chiếu offset theo trục X
 * (mô hình mặc định 'left' là bàn tay trái — ngón cái nằm ở phía −X).
 */
function jointOffset(finger: FingerId, joint: string, side: 'left' | 'right' = 'left'): Vec3D {
  const root = fingerJointOffset(finger, 'root');
  const off = fingerJointOffset(finger, joint);
  const dx = off.x - root.x;
  const dy = off.y - root.y;
  const dz = off.z - root.z;
  return side === 'right' ? { x: -dx, y: dy, z: dz } : { x: dx, y: dy, z: dz };
}

/**
 * Offset TUYỆT ĐỐI của một mốc ngón — giữ nguyên khoảng cách ngang giữa các
 * ngón (ngón trỏ – ngón út ≈ 3,9 cm), khác với offset tương đối tới gốc ngón.
 */
function absoluteOffset(finger: FingerId, joint: string, side: 'left' | 'right' = 'left'): Vec3D {
  const off = fingerJointOffset(finger, joint);
  return side === 'right' ? { x: -off.x, y: off.y, z: off.z } : { x: off.x, y: off.y, z: off.z };
}

/** Vị trí tuyệt đối của một khớp: neo của entity + offset giải phẫu. */
function jointPoint(anchor: unknown, finger: FingerId, joint: string, side: 'left' | 'right' = 'left'): Vec3D {
  const base = entityPosition(anchor);
  const off = jointOffset(finger, joint, side);
  return { x: base.x + off.x, y: base.y + off.y, z: base.z + off.z };
}

/** Trục giải phẫu của ngón: hướng từ gốc ngón tới đầu ngón. */
function fingerAxis(finger: FingerId, side: 'left' | 'right' = 'left'): Vec3D {
  const root = jointOffset(finger, 'root', side);
  const tip = jointOffset(finger, 'tip', side);
  return normalize(subtract(tip, root));
}

/** Kích thước hộp bao theo vùng của ngón. */
function fingerBoxSize(finger: FingerId): Vec3D {
  const key = FINGER_BOX_KEY[finger];
  const size = BODY_BOX_SIZES[key];
  return size ? { x: size.x, y: size.y, z: size.z } : { x: 0.018, y: 0.018, z: FINGER_LENGTHS[finger] };
}

/** Đường kính (bề ngang) của ngón. */
function fingerDiameter(finger: FingerId): number {
  return fingerBoxSize(finger).x;
}

/** Chiều dài ba đốt của ngón (mét). */
function fingerSegmentLengths(finger: FingerId): { proximal: number; middle: number; distal: number } {
  const length = FINGER_LENGTHS[finger];
  return {
    proximal: length * FINGER_SEGMENTS.proximal,
    middle: length * FINGER_SEGMENTS.middle,
    distal: length * FINGER_SEGMENTS.distal
  };
}

/** Bán kính cong của ngón (1 / chiều dài đốt giữa) — đơn vị m⁻¹. */
function fingerCurvature(finger: FingerId): number {
  const segment = FINGER_LENGTHS[finger] * FINGER_SEGMENTS.middle;
  return segment > 0 ? 1 / segment : 0;
}

/** Lệch ngang giữa trục ngón này và ngón kề bên (mét). */
function fingerSpread(finger: FingerId): number {
  return Math.abs(FINGER_SPACING[finger] - FINGER_SPACING[ADJACENT_FINGER[finger]]);
}

/** Tâm hộp bao của ngón (giữa gốc và đầu ngón). */
function fingerCenter(finger: FingerId, anchor: unknown, side: 'left' | 'right' = 'left'): Vec3D {
  const base = entityPosition(anchor);
  const root = jointOffset(finger, 'root', side);
  const tip = jointOffset(finger, 'tip', side);
  return {
    x: base.x + (root.x + tip.x) / 2,
    y: base.y + (root.y + tip.y) / 2,
    z: base.z + (root.z + tip.z) / 2
  };
}

/** Hộp bao AABB của ngón. */
function fingerBox(finger: FingerId, anchor: unknown, size?: Vec3D): Box3D {
  return boundingBox(fingerCenter(finger, anchor), size ? toVec3(size) : fingerBoxSize(finger));
}

/** Bán kính bao của ngón = nửa đường chéo hộp (trừ khi người gọi truyền bán kính). */
function fingerBoundingRadius(finger: FingerId, radius?: number): number {
  if (typeof radius === 'number' && Number.isFinite(radius) && radius > 0) return radius;
  const size = fingerBoxSize(finger);
  return 0.5 * Math.hypot(size.x, size.y, size.z);
}

/** Pháp tuyến mặt bàn tay (vuông góc mặt phẳng lòng bàn tay) = trục +Z của bàn tay. */
function palmNormal(entity: unknown): Vec3D {
  return entityForward(entity);
}

/** Kiểm tra giá trị có phải vector điểm (x/y/z) thuần túy hay không. */
function isVectorLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.x !== 'number' || typeof v.y !== 'number' || typeof v.z !== 'number') return false;
  if ('position' in v || 'quaternion' in v || 'rotation' in v) return false;
  return true;
}

/** Góc (rad) giữa hai trục. */
function axisAngle(a: Vec3D, b: Vec3D): number {
  return Math.acos(clamp(dot(normalize(a), normalize(b)), -1, 1));
}

/** Xoay một vector bằng quaternion (công thức three.js applyQuaternion). */
function rotateVec(q: QuatD, v: Vec3D): Vec3D {
  const { x, y, z, w } = q;
  const ix = w * v.x + y * v.z - z * v.y;
  const iy = w * v.y + z * v.x - x * v.z;
  const iz = w * v.z + x * v.y - y * v.x;
  const iw = -x * v.x - y * v.y - z * v.z;
  return {
    x: ix * w + iw * -x + iy * -z - iz * -y,
    y: iy * w + iw * -y + iz * -x - ix * -z,
    z: iz * w + iw * -z + ix * -y - iy * -x
  };
}

/** Trục ngón ở tư thế hiện tại (trục giải phẫu xoay theo quaternion của entity). */
function currentFingerAxis(finger: FingerId, entity: unknown, side: 'left' | 'right' = 'left'): Vec3D {
  const rest = fingerAxis(finger, side);
  const q = entityQuaternion(entity);
  return normalize(rotateVec(q, rest));
}

/** Bộ góc khớp của một ngón (rad). */
interface FingerAngleSet {
  flexion: number;
  extension: number;
  abduction: number;
  adduction: number;
}

/**
 * Đọc góc khớp từ entity (quaternion) hoặc từ cặp vector hướng hai đốt xương.
 * Không có dữ liệu → 0 (tư thế giải phẫu chuẩn).
 */
function readAngles(entityOrAngle: unknown, other: unknown): FingerAngleSet {
  if (isVectorLike(entityOrAngle) && isVectorLike(other)) {
    const bend = signedAngle(entityOrAngle as Vec3D, other as Vec3D, RIGHT3);
    const spread = signedAngle(entityOrAngle as Vec3D, other as Vec3D, UP3);
    return {
      flexion: Math.max(0, bend),
      extension: Math.max(0, -bend),
      abduction: Math.max(0, spread),
      adduction: Math.max(0, -spread)
    };
  }
  const euler = quaternionToEuler(entityQuaternion(entityOrAngle));
  return {
    flexion: Math.max(0, euler.x),
    extension: Math.max(0, -euler.x),
    abduction: Math.max(0, euler.z),
    adduction: Math.max(0, -euler.z)
  };
}

/** Payload góc theo từng khớp (tổng các góc gập của từng khớp). */
function jointAnglePayload(finger: FingerId, entityOrAngle: unknown, other: unknown): Record<string, unknown> {
  const layout = JOINT_LAYOUT[finger];
  const angles = readAngles(entityOrAngle, other);
  const joints: Record<string, number> = {};
  const extensionJoints: Record<string, number> = {};
  layout.joints.forEach((joint, index) => {
    joints[joint] = angles.flexion * layout.weights[index];
    extensionJoints[joint] = angles.extension * layout.weights[index];
  });
  return {
    finger,
    total: angles.flexion,
    flexion: angles.flexion,
    extension: angles.extension,
    joints,
    extensionJoints
  };
}

/** Tìm xương (bone) theo tên trong `entity.children` / `options.bones`. */
function findBone(entity: unknown, options: unknown, names: readonly string[]): any {
  const candidates: any[] = [];
  const collect = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    candidates.push(value);
    const rec = value as Record<string, any>;
    if (Array.isArray(rec.bones)) rec.bones.forEach(collect);
    if (Array.isArray(rec.children)) rec.children.forEach(collect);
  };

  const opt = (options ?? {}) as Record<string, any>;
  const ent = (entity ?? {}) as Record<string, any>;
  collect(opt.bones);
  collect(opt.bone);
  collect(opt.skeleton?.bones);
  collect(ent.bones);
  collect(ent.bone);
  collect(ent.skeleton?.bones);
  collect(ent.children);
  collect(entity);

  const matches = (value: unknown): boolean =>
    typeof value === 'string' && names.includes(value.toLowerCase());

  // Xương có tên riêng ("indexFinger", "thumb", …).
  for (const candidate of candidates) {
    if (matches(candidate.name) || matches(candidate.id) || matches(candidate.boneName)) return candidate;
  }
  // Bảng tra cứu theo tên: { thumb: {...}, indexFinger: {...} }.
  for (const candidate of candidates) {
    for (const [key, value] of Object.entries(candidate)) {
      if (matches(key) && value && typeof value === 'object') return value;
    }
  }
  return null;
}

/** Quaternion thật của ngón: tìm được xương → dùng xương, không thì dùng entity, cuối cùng identity. */
function fingerOrientation(finger: FingerId, entityOrAngle: unknown, options: unknown): QuatD {
  const bone = findBone(entityOrAngle, options, FINGER_BONE_NAMES[finger]);
  if (bone) return normalizeQuaternion(entityQuaternion(bone));
  return normalizeQuaternion(entityQuaternion(entityOrAngle));
}

/** Đọc một vector động (velocity / acceleration) từ entity. */
function readVector(entity: unknown, key: string): Vec3D {
  if (!entity || typeof entity !== 'object') return { x: 0, y: 0, z: 0 };
  const raw = (entity as Record<string, unknown>)[key];
  if (raw && typeof raw === 'object') return toVec3(raw);
  if (typeof raw === 'number' && Number.isFinite(raw)) return { x: raw, y: 0, z: 0 };
  return { x: 0, y: 0, z: 0 };
}

/** Đọc hộp bao từ nhiều dạng dữ liệu ({min,max} / {center,size} / entity). */
function readBox(value: unknown, fallbackCenter: Vec3D, fallbackSize: Vec3D): Box3D {
  if (!value || typeof value !== 'object') return boundingBox(fallbackCenter, fallbackSize);
  const v = value as Record<string, any>;
  if (v.min && v.max && typeof v.min === 'object' && typeof v.max === 'object') {
    return { min: toVec3(v.min), max: toVec3(v.max) };
  }
  // Tâm: ưu tiên `center`, sau đó là vị trí của chính entity, cuối cùng tâm dự phòng.
  const hasPosition =
    !!v.position || (typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number');
  const center = v.center ? toVec3(v.center) : hasPosition ? entityPosition(value) : fallbackCenter;
  const size = v.size
    ? toVec3(v.size)
    : v.bounds && typeof v.bounds === 'object' && v.bounds.size
      ? toVec3(v.bounds.size)
      : fallbackSize;
  return boundingBox(center, size);
}

/** Điểm trên hộp bao gần nhất với một điểm cho trước (dùng cho điểm tiếp xúc). */
function closestPointOnBox(box: Box3D, point: Vec3D): Vec3D {
  return {
    x: clamp(point.x, box.min.x, box.max.x),
    y: clamp(point.y, box.min.y, box.max.y),
    z: clamp(point.z, box.min.z, box.max.z)
  };
}

/**
 * Khoảng cách giữa hai đầu ngón.
 *
 * Dùng offset **tuyệt đối** của đầu ngón (`fingerJointOffset(finger, 'tip')`) theo
 * đặc tả: nhờ vậy khoảng cách giữa hai ngón khác nhau luôn khác 0 và phản ánh
 * đúng khoảng cách ngang thật của bàn tay (ngón trỏ – ngón áp út ≈ 3,9 cm).
 */
function tipDistance(from: FingerId, to: FingerId, anchorA: unknown, anchorB: unknown, side: 'left' | 'right' = 'left'): number {
  const a = entityPosition(anchorA);
  const b = entityPosition(anchorB);
  const tipA = absoluteOffset(from, 'tip', side);
  const tipB = absoluteOffset(to, 'tip', side);
  return distance3D(
    { x: a.x + tipA.x, y: a.y + tipA.y, z: a.z + tipA.z },
    { x: b.x + tipB.x, y: b.y + tipB.y, z: b.z + tipB.z }
  );
}

/**
 * Payload độ dày ngón (độ dày mu-pad + đường kính).
 *
 * `anchor` là bàn tay sở hữu ngón: vị trí móng/đệm trong không gian thế giới
 * được bổ sung ở `nailWorld`/`padWorld` (bàn tay không có vị trí ⇒ bằng offset tương đối).
 */
function thicknessPayload(finger: FingerId, anchor?: unknown, side: 'left' | 'right' = 'left'): Record<string, unknown> {
  const nail = jointOffset(finger, 'nail', side);
  const pad = jointOffset(finger, 'pad', side);
  const base = entityPosition(anchor);
  return {
    finger,
    thickness: distance3D(nail, pad),
    diameter: fingerDiameter(finger),
    nail: { x: nail.x, y: nail.y, z: nail.z },
    pad: { x: pad.x, y: pad.y, z: pad.z },
    nailWorld: { x: base.x + nail.x, y: base.y + nail.y, z: base.z + nail.z },
    padWorld: { x: base.x + pad.x, y: base.y + pad.y, z: base.z + pad.z },
    unit: 'm'
  };
}

/** Payload vùng với tới của ngón. */
function reachEnvelopePayload(finger: FingerId, anchor: unknown): Record<string, unknown> {
  const base = entityPosition(anchor);
  const reach = FINGER_LENGTHS[finger];
  return {
    finger,
    center: { x: base.x, y: base.y, z: base.z },
    radius: reach,
    maxReach: reach,
    box: boundingBox(base, { x: reach * 2, y: reach * 2, z: reach * 2 }),
    unit: 'm'
  };
}

/** Payload điểm tiếp xúc (đệm ngón) của ngón. */
function contactPayload(finger: FingerId, anchor: unknown, side: 'left' | 'right' = 'left'): Record<string, unknown> {
  return {
    finger,
    point: jointPoint(anchor, finger, 'pad', side),
    surface: 'pad',
    normal: palmNormal(anchor),
    unit: 'm'
  };
}

/** Payload sai lệch tư thế so với tư thế giải phẫu chuẩn. */
function poseErrorPayload(finger: FingerId, entity: unknown, reference: unknown, side: 'left' | 'right' = 'left'): Record<string, unknown> {
  const rest = fingerAxis(finger, side);
  const current = currentFingerAxis(finger, entity, side);
  const orientationError = axisAngle(current, rest);
  const positionError =
    reference === undefined || reference === null ? 0 : distance3D(entityPosition(entity), entityPosition(reference));
  return {
    finger,
    orientationError,
    positionError,
    totalError: orientationError + positionError,
    angleRad: orientationError,
    axis: current,
    unit: 'rad'
  };
}

/** Payload độ mượt chuyển động của ngón. */
function motionPayload(finger: FingerId, entity: unknown): Record<string, unknown> {
  const velocity = readVector(entity, 'velocity');
  const acceleration = readVector(entity, 'acceleration');
  const speed = magnitude(velocity);
  const accel = magnitude(acceleration);
  return {
    finger,
    smoothness: clamp(1 - accel / MAX_SMOOTH_ACCELERATION, 0, 1),
    speed,
    acceleration: accel,
    velocity,
    unit: 'normalized'
  };
}

/** Payload độ thẳng hàng của ngón với trục giải phẫu. */
function alignmentPayload(finger: FingerId, entity: unknown, side: 'left' | 'right' = 'left'): Record<string, unknown> {
  const rest = fingerAxis(finger, side);
  const current = currentFingerAxis(finger, entity, side);
  const angleRad = axisAngle(current, rest);
  const palmAngle = axisAngle(rest, palmNormal(entity));
  return {
    finger,
    alignment: 1 - clamp(angleRad / (Math.PI / 2), 0, 1),
    angleRad,
    axis: current,
    palmAlignment: 1 - clamp(palmAngle / (Math.PI / 2), 0, 1),
    unit: 'normalized'
  };
}

export class AnatomicalHandDigitsSubsystem {
  public config: SpatialUIConfig;

  constructor(config?: SpatialUIConfig) {
    this.config = config ?? {
      screenWidth: 1920,
      screenHeight: 1080,
      fov: 60,
      nearPlane: 0.1,
      farPlane: 1000,
      aspectRatio: 16 / 9,
      unitScale: 1.0,
    };
  }

  // ==========================================================================
  // Trợ giúp nội bộ — tuỳ chọn của người gọi
  // ==========================================================================

  /** Đọc số tuỳ chọn — trả `fallback` khi không có giá trị hữu hạn. */
  private optNumber(options: any, fallback: number, ...keys: string[]): number {
    if (!options || typeof options !== 'object') return fallback;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    }
    return fallback;
  }

  /** Đọc cờ boolean tuỳ chọn. */
  private optBoolean(options: any, fallback: boolean, ...keys: string[]): boolean {
    if (!options || typeof options !== 'object') return fallback;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'boolean') return raw;
    }
    return fallback;
  }

  /** Đọc chuỗi tuỳ chọn (không phân biệt hoa thường, cắt khoảng trắng). */
  private optString(options: any, fallback: string, ...keys: string[]): string {
    if (!options || typeof options !== 'object') return fallback;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'string' && raw.trim()) return raw.trim().toLowerCase();
    }
    return fallback;
  }

  /** Đọc đối tượng tuỳ chọn — dùng để chỉ định nguồn dữ liệu khác. */
  private optObject(options: any, ...keys: string[]): any {
    if (!options || typeof options !== 'object') return undefined;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (raw && typeof raw === 'object') return raw;
    }
    return undefined;
  }

  /** Đọc vector tuỳ chọn (mốc/đường chiều tham chiếu). */
  private optVector(options: any, ...keys: string[]): Vec3D | undefined {
    const found = this.optObject(options, ...keys);
    if (!found) return undefined;
    const record = found as Record<string, unknown>;
    if (
      typeof record.x !== 'number' ||
      typeof record.y !== 'number' ||
      typeof record.z !== 'number' ||
      !Number.isFinite(record.x) ||
      !Number.isFinite(record.y) ||
      !Number.isFinite(record.z)
    ) {
      return undefined;
    }
    return { x: record.x, y: record.y, z: record.z };
  }

  /**
   * Hệ số quy đổi đơn vị đo theo `options.unit`.
   *
   * Mặc định là đơn vị gốc của phép đo (mét cho độ dài, m⁻¹ cho độ cong).
   * Đơn vị dạng `cm^-1`/`mm^-1` được hiểu là nghịch đảo của đơn vị độ dài tương ứng.
   */
  private unitFactor(options: any, fallbackUnit: string): { unit: string; factor: number } {
    const requested = this.optString(options, fallbackUnit, 'unit');
    const inverse = requested.endsWith('^-1');
    const base = inverse ? requested.slice(0, -3) : requested;
    const meters: Record<string, number> = {
      m: 1,
      cm: 100,
      mm: 1000,
      km: 0.001,
      in: 39.3700787,
      ft: 3.2808399
    };
    const factor = meters[base];
    if (factor === undefined) return { unit: fallbackUnit, factor: 1 };
    return { unit: requested, factor: inverse ? 1 / factor : factor };
  }

  /**
   * Bàn tay dùng để đo — người gọi có thể chỉ định lại nguồn dữ liệu qua
   * `options.entity` (mặc định: chính `entity` truyền vào).
   */
  private handOf(entity: any, options: any): any {
    return this.optObject(options, 'entity', 'hand') ?? entity;
  }

  /**
   * Tỉ lệ kích thước của bàn tay theo `entity.scale` (số hoặc Vec3) — bàn tay
   * lớn hơn thì ngón dài hơn theo cùng tỉ lệ. Không có `scale` ⇒ tỉ lệ 1.
   */
  private anatomyScale(entity: any): number {
    if (!entity || typeof entity !== 'object') return 1;
    const record = entity as Record<string, unknown>;
    const raw = record.scale ?? record.handScale;
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (raw && typeof raw === 'object') {
      const v = raw as Record<string, unknown>;
      const parts = [v.x, v.y, v.z].filter(
        (n): n is number => typeof n === 'number' && Number.isFinite(n)
      );
      if (parts.length > 0) {
        const mean = parts.reduce((sum, n) => sum + n, 0) / parts.length;
        if (mean > 0) return mean;
      }
    }
    return 1;
  }

  /** Bàn tay trái hay phải — 'right' phản chiếu mô hình giải phẫu theo trục X. */
  private sideOf(options: any): 'left' | 'right' {
    return this.optString(options, 'left', 'side', 'hand') === 'right' ? 'right' : 'left';
  }

  /** Giới hạn giá trị chuẩn hoá theo `options.min`/`options.max` (mặc định 0..1). */
  private clampToRange(value: number, options: any): number {
    const min = this.optNumber(options, 0, 'min');
    const max = this.optNumber(options, 1, 'max');
    if (max < min) return value;
    return clamp(value, min, max);
  }

  /** Chiều dài ngón (mét → đơn vị tuỳ chọn), nhân theo tỉ lệ bàn tay. */
  private fingerLength(finger: FingerId, name: string, entity: any, options: any): any {
    const size = this.anatomyScale(this.handOf(entity, options));
    const { unit, factor } = this.unitFactor(options, 'm');
    const meters = FINGER_LENGTHS[finger] * size;
    return measurement(name, meters * this.optNumber(options, 1, 'scale') * factor, unit, {
      finger,
      scale: size,
      meters
    });
  }

  /** Bề rộng ngón (mét → đơn vị tuỳ chọn), nhân theo tỉ lệ bàn tay. */
  private fingerWidth(finger: FingerId, name: string, entity: any, options: any): any {
    const size = this.anatomyScale(this.handOf(entity, options));
    const { unit, factor } = this.unitFactor(options, 'm');
    const meters = fingerDiameter(finger) * size;
    return measurement(name, meters * this.optNumber(options, 1, 'scale') * factor, unit, {
      finger,
      scale: size,
      meters
    });
  }

  /** Độ cong ngón (m⁻¹) — bàn tay lớn hơn thì bán kính cong lớn hơn ⇒ độ cong nhỏ hơn. */
  private fingerCurvatureValue(finger: FingerId, name: string, entity: any, options: any): any {
    const size = this.anatomyScale(this.handOf(entity, options));
    const { unit, factor } = this.unitFactor(options, 'm^-1');
    const perMeter = fingerCurvature(finger) / size;
    return measurement(name, perMeter * this.optNumber(options, 1, 'scale') * factor, unit, {
      finger,
      scale: size
    });
  }

  /** Chiều dài từng đốt ngón. */
  private fingerSegments(finger: FingerId, name: string, entity: any, options: any): any {
    const size = this.anatomyScale(this.handOf(entity, options));
    const { unit, factor } = this.unitFactor(options, 'm');
    const scale = this.optNumber(options, 1, 'scale');
    const base = fingerSegmentLengths(finger);
    const proximal = base.proximal * size * scale * factor;
    const middle = base.middle * size * scale * factor;
    const distal = base.distal * size * scale * factor;
    return measurement(name, proximal + middle + distal, unit, {
      finger,
      proximal,
      middle,
      distal,
      segments: { proximal, middle, distal },
      scale: size
    });
  }

  /**
   * Độ dày ngón: neo theo bàn tay `a`, đối chiếu tương đối với bàn tay `b`
   * (giá trị `relative` = độ dày so với bàn tay tham chiếu).
   */
  private fingerThickness(finger: FingerId, name: string, a: any, b: any, options: any): any {
    const hand = this.handOf(a, options);
    const reference = this.optObject(options, 'reference') ?? b;
    const side = this.sideOf(options);
    const size = this.anatomyScale(hand);
    const scale = this.optNumber(options, 1, 'scale');
    const { unit, factor } = this.unitFactor(options, 'm');
    const payload = thicknessPayload(finger, hand, side);
    return namedResult(name, {
      finger,
      thickness: (payload.thickness as number) * size * scale * factor,
      diameter: (payload.diameter as number) * size * scale * factor,
      nail: payload.nail,
      pad: payload.pad,
      nailWorld: payload.nailWorld,
      padWorld: payload.padWorld,
      unit,
      scale: size,
      relative: (size * scale) / this.anatomyScale(reference)
    });
  }

  /**
   * Hướng ngón trong tư thế hiện tại.
   *
   * Ưu tiên xương thật (nếu người gọi truyền xương của ngón), sau đó tới
   * quaternion của entity, cuối cùng là trục giải phẫu tĩnh.
   */
  private fingerDirection(finger: FingerId, a: any, b: any): Vec3D {
    const side = this.sideOf(b ?? a);
    const bone = findBone(b ?? a, undefined, FINGER_BONE_NAMES[finger]);
    if (bone) {
      const q = normalizeQuaternion(entityQuaternion(bone));
      return normalize(rotateVec(q, fingerAxis(finger, side)));
    }
    return currentFingerAxis(finger, a, side);
  }

  /** Mức độ đối chiếu giữa ngón cái và ngón trỏ. */
  private thumbOpposition(a: any, b: any, options: any): any {
    const side = this.sideOf(options);
    const reference = this.optObject(options, 'reference') ?? b;
    const thumbAxis = currentFingerAxis('thumb', a, side);
    const indexAxis = currentFingerAxis('index', reference, side);
    const angleRad = axisAngle(thumbAxis, indexAxis);
    const tolerance = this.optNumber(options, 0, 'tolerance');
    let opposition = this.clampToRange(angleRad / (Math.PI / 2), options);
    if (this.optBoolean(options, false, 'invert')) opposition = 1 - opposition;
    return namedResult('calculateThumbOpposition', {
      finger: 'thumb',
      opposition,
      angleRad,
      thumbAxis,
      indexAxis,
      tolerance,
      withinTolerance: tolerance > 0 && angleRad <= tolerance,
      unit: 'rad'
    });
  }

  /** Lực kẹp giữa ngón cái và ngón trỏ. */
  private thumbPinchStrength(a: any, b: any, options: any): any {
    const side = this.sideOf(options);
    const size = this.anatomyScale(a);
    const gap = tipDistance('thumb', 'index', a, b, side);
    const maxGap = (FINGER_LENGTHS.thumb + FINGER_LENGTHS.index) * size;
    const contactDistance = this.optNumber(options, fingerDiameter('thumb') * size, 'contactDistance');
    let strength = clamp(1 - gap / maxGap, 0, 1);
    if (this.optBoolean(options, false, 'invert')) strength = 1 - strength;
    return namedResult('calculateThumbPinchStrength', {
      finger: 'thumb',
      strength,
      gap,
      maxGap,
      inContact: gap <= contactDistance,
      contactDistance,
      unit: 'normalized'
    });
  }

  /** Vùng với tới của ngón; `b` là mục tiêu cần với tới (nếu có). */
  private reachEnvelope(finger: FingerId, name: string, a: any, b: any, options: any): any {
    const size = this.anatomyScale(a);
    const scale = this.optNumber(options, 1, 'scale');
    const { unit, factor } = this.unitFactor(options, 'm');
    const base = entityPosition(a);
    const reach = FINGER_LENGTHS[finger] * size * scale;
    const target = b === undefined || b === null ? null : entityPosition(b);
    const distanceToTarget = target ? distance3D(base, target) : null;
    const radius = distanceToTarget === null ? reach : Math.min(reach, distanceToTarget);
    return namedResult(name, {
      finger,
      center: { x: base.x, y: base.y, z: base.z },
      radius: radius * factor,
      maxReach: reach * factor,
      box: boundingBox(base, { x: reach * 2, y: reach * 2, z: reach * 2 }),
      unit,
      target,
      distanceToTarget: distanceToTarget === null ? 0 : distanceToTarget * factor,
      scale: size
    });
  }

  /**
   * Điểm tiếp xúc: mặc định là đệm ngón; nếu có `b` thì là điểm trên bề mặt
   * `b` gần bộ phận tiếp xúc nhất (kèm pháp tuyến hướng ra khỏi vật cản).
   *
   * `options.surface` chọn bộ phận tiếp xúc: 'pad' (mặc định), 'nail' hoặc 'tip'.
   */
  private contactPoint(finger: FingerId, name: string, a: any, b: any, options: any): any {
    const side = this.sideOf(options);
    const surface = this.optString(options, 'pad', 'surface');
    const joint = surface === 'nail' || surface === 'tip' ? surface : 'pad';
    const payload = contactPayload(finger, a, side);
    const pad = payload.point as Vec3D;
    const contactPointWorld = jointPoint(a, finger, joint, side);
    const box = b === undefined || b === null ? undefined : readBox(b, pad, BODY_BOX_SIZES.palm);
    const objectPoint = box ? closestPointOnBox(box, contactPointWorld) : contactPointWorld;
    const outward = box ? subtract(contactPointWorld, objectPoint) : { x: 0, y: 0, z: 0 };
    const normal = box && magnitude(outward) > 1e-9 ? normalize(outward) : (payload.normal as Vec3D);
    return namedResult(name, {
      finger,
      point: box ? objectPoint : contactPointWorld,
      surface: 'pad',
      normal,
      unit: 'm',
      objectPoint,
      objectDistance: box ? distance3D(contactPointWorld, objectPoint) : 0
    });
  }

  /**
   * Pháp tuyến bề mặt: mặc định là pháp tuyến lòng bàn tay; nếu có `b` thì là
   * hướng từ vật cản `b` ra ngoài tại điểm tiếp xúc.
   */
  private surfaceNormal(finger: FingerId, name: string, a: any, b: any): any {
    const side = this.sideOf(b ?? a);
    if (b === undefined || b === null) {
      return directionResult(name, palmNormal(a), { finger });
    }
    const pad = jointPoint(a, finger, 'pad', side);
    const box = readBox(b, pad, BODY_BOX_SIZES.palm);
    const contact = closestPointOnBox(box, pad);
    const outward = subtract(pad, contact);
    const normal = magnitude(outward) > 1e-9 ? normalize(outward) : palmNormal(a);
    return directionResult(name, normal, { finger });
  }

  /** Sai lệch tư thế so với tư thế tham chiếu `b`. */
  private poseError(finger: FingerId, name: string, a: any, b: any, options: any): any {
    const side = this.sideOf(options);
    const reference = this.optObject(options, 'reference') ?? b;
    const payload = poseErrorPayload(finger, a, reference, side);
    const mode = this.optString(options, 'total', 'mode', 'method');
    const tolerance = this.optNumber(options, 0, 'tolerance');
    const orientationError = payload.orientationError as number;
    const positionError = payload.positionError as number;
    const totalError = payload.totalError as number;
    const error =
      mode === 'orientation' ? orientationError : mode === 'position' ? positionError : totalError;
    return namedResult(name, {
      ...payload,
      error,
      mode,
      tolerance,
      withinTolerance: tolerance > 0 && error <= tolerance
    });
  }

  /** Độ mượt chuyển động; `b` là mẫu trước để đo biến thiên vận tốc. */
  private motionSmoothness(finger: FingerId, name: string, a: any, b: any, options: any): any {
    const payload = motionPayload(finger, a);
    const maxAcceleration = this.optNumber(options, MAX_SMOOTH_ACCELERATION, 'maxAcceleration');
    const current = payload.velocity as Vec3D;
    let acceleration = payload.acceleration as number;
    let deltaVelocity: Vec3D | null = null;
    if (b !== undefined && b !== null) {
      deltaVelocity = subtract(current, readVector(b, 'velocity'));
      acceleration = magnitude(deltaVelocity);
    }
    return namedResult(name, {
      finger,
      smoothness: clamp(1 - acceleration / maxAcceleration, 0, 1),
      speed: payload.speed,
      acceleration,
      velocity: payload.velocity,
      deltaVelocity,
      maxAcceleration,
      unit: 'normalized'
    });
  }

  /**
   * Độ cuộn ngón — `options.direction` là hướng tham chiếu để đo, `options.mode`
   * chọn góc được báo ra (total / flexion / extension / abduction / adduction).
   *
   * Khi có `options.direction` và entity không phải vector, độ cuộn được đo là
   * góc giữa trục ngón ở tư thế hiện tại và hướng tham chiếu đó.
   */
  private fingerCurl(finger: FingerId, name: string, entity: any, options: any): any {
    const reference = this.optVector(options, 'direction', 'axis', 'reference');
    const side = this.sideOf(options);
    const payload = jointAnglePayload(finger, entity, reference);
    const mode = this.optString(options, 'total', 'mode', 'method');
    const angles = readAngles(entity, reference);
    let value =
      mode === 'flexion'
        ? angles.flexion
        : mode === 'extension'
          ? angles.extension
          : mode === 'abduction'
            ? angles.abduction
            : mode === 'adduction'
              ? angles.adduction
              : (payload.total as number);
    if (reference && mode === 'total' && !isVectorLike(entity)) {
      value = axisAngle(currentFingerAxis(finger, entity, side), reference);
    }
    return measurement(name, value, 'rad', payload);
  }

  /** Độ xòe ngón (khoảng cách ngang với ngón kề bên). */
  private fingerSpreadValue(finger: FingerId, name: string, entity: any, options: any): any {
    const size = this.anatomyScale(this.handOf(entity, options));
    const { unit, factor } = this.unitFactor(options, 'm');
    const meters = fingerSpread(finger) * size;
    return measurement(name, meters * this.optNumber(options, 1, 'scale') * factor, unit, {
      finger,
      scale: size,
      meters
    });
  }

  /** Độ thẳng hàng ngón; `b` là bàn tay tham chiếu để so sánh. */
  private fingerAlignment(finger: FingerId, name: string, a: any, b: any, options: any): any {
    const side = this.sideOf(options);
    const reference = this.optObject(options, 'reference') ?? b;
    const rest = reference ? currentFingerAxis(finger, reference, side) : fingerAxis(finger, side);
    const current = currentFingerAxis(finger, a, side);
    const angleRad = axisAngle(current, rest);
    const palmAngle = axisAngle(rest, palmNormal(a));
    const mode = this.optString(options, 'finger', 'mode', 'method');
    const tolerance = this.optNumber(options, 0, 'tolerance');
    return namedResult(name, {
      finger,
      alignment: this.clampToRange(1 - clamp(angleRad / (Math.PI / 2), 0, 1), options),
      angleRad,
      axis: current,
      palmAlignment: this.clampToRange(1 - clamp(palmAngle / (Math.PI / 2), 0, 1), options),
      mode,
      tolerance,
      withinTolerance: tolerance > 0 && angleRad <= tolerance,
      unit: 'normalized'
    });
  }

  // ==========================================================================
  // 9. Tọa độ ngón cái
  // ==========================================================================

  /**
   * [0401] getThumbRootPosition
   * Lấy tọa độ gốc ngón cái.
   */
  public getThumbRootPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'root'), toVec3(offset)));
  }
  /**
   * [0402] getThumbCMCPosition
   * Lấy tọa độ khớp CMC ngón cái.
   */
  public getThumbCMCPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'cmc'), toVec3(offset)));
  }
  /**
   * [0403] getThumbMCPPosition
   * Lấy tọa độ khớp MCP ngón cái.
   */
  public getThumbMCPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'mcp'), toVec3(offset)));
  }
  /**
   * [0404] getThumbIPPosition
   * Lấy tọa độ khớp IP ngón cái.
   */
  public getThumbIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'ip'), toVec3(offset)));
  }
  /**
   * [0405] getThumbTipPosition
   * Lấy tọa độ đầu ngón cái.
   */
  public getThumbTipPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'tip'), toVec3(offset)));
  }
  /**
   * [0406] getThumbNailPosition
   * Lấy tọa độ móng ngón cái.
   */
  public getThumbNailPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'nail'), toVec3(offset)));
  }
  /**
   * [0407] getThumbPadPosition
   * Lấy tọa độ đệm ngón cái.
   */
  public getThumbPadPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'pad'), toVec3(offset)));
  }
  /**
   * [0408] getThumbBasePosition
   * Lấy tọa độ đáy ngón cái.
   */
  public getThumbBasePosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'base'), toVec3(offset)));
  }
  /**
   * [0409] getThumbProximalJoint
   * Lấy tọa độ khớp gần ngón cái.
   */
  public getThumbProximalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'mcp'), toVec3(offset)));
  }
  /**
   * [0410] getThumbDistalJoint
   * Lấy tọa độ khớp xa ngón cái.
   */
  public getThumbDistalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('thumb', 'ip'), toVec3(offset)));
  }
  /**
   * [0411] calculateThumbLength
   * Tính chiều dài ngón cái.
   */
  public calculateThumbLength(entity?: any, options?: any): any {
    return this.fingerLength('thumb', 'calculateThumbLength', entity, options);
  }
  /**
   * [0412] calculateThumbWidth
   * Tính chiều rộng ngón cái.
   */
  public calculateThumbWidth(entity?: any, options?: any): any {
    return this.fingerWidth('thumb', 'calculateThumbWidth', entity, options);
  }
  /**
   * [0413] calculateThumbThickness
   * Tính độ dày ngón cái.
   */
  public calculateThumbThickness(a?: any, b?: any, options?: any): any {
    return this.fingerThickness('thumb', 'calculateThumbThickness', a, b, options);
  }
  /**
   * [0414] calculateThumbCurvature
   * Tính độ cong ngón cái.
   */
  public calculateThumbCurvature(entity?: any, options?: any): any {
    return this.fingerCurvatureValue('thumb', 'calculateThumbCurvature', entity, options);
  }
  /**
   * [0415] calculateThumbDirection
   * Tính hướng ngón cái.
   */
  public calculateThumbDirection(a?: any, b?: any): any {
    return directionResult('calculateThumbDirection', this.fingerDirection('thumb', a, b), {
      finger: 'thumb'
    });
  }
  /**
   * [0416] calculateThumbOrientation
   * Tính hướng quay ngón cái.
   */
  public calculateThumbOrientation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateThumbOrientation', fingerOrientation('thumb', entityOrAngle, options), {
      finger: 'thumb'
    });
  }
  /**
   * [0417] calculateThumbFlexion
   * Tính góc gập ngón cái.
   */
  public calculateThumbFlexion(a?: any, b?: any): any {
    return measurement('calculateThumbFlexion', readAngles(a, b).flexion, 'rad', { finger: 'thumb' });
  }
  /**
   * [0418] calculateThumbExtension
   * Tính góc duỗi ngón cái.
   */
  public calculateThumbExtension(a?: any, b?: any): any {
    return measurement('calculateThumbExtension', readAngles(a, b).extension, 'rad', { finger: 'thumb' });
  }
  /**
   * [0419] calculateThumbAbduction
   * Tính góc dạng ngón cái.
   */
  public calculateThumbAbduction(a?: any, b?: any): any {
    return measurement('calculateThumbAbduction', readAngles(a, b).abduction, 'rad', { finger: 'thumb' });
  }
  /**
   * [0420] calculateThumbAdduction
   * Tính góc khép ngón cái.
   */
  public calculateThumbAdduction(a?: any, b?: any): any {
    return measurement('calculateThumbAdduction', readAngles(a, b).adduction, 'rad', { finger: 'thumb' });
  }
  /**
   * [0421] calculateThumbOpposition
   * Tính mức độ đối chiếu ngón cái.
   */
  public calculateThumbOpposition(a?: any, b?: any, options?: any): any {
    return this.thumbOpposition(a, b, options);
  }
  /**
   * [0422] calculateThumbRotation
   * Tính góc quay ngón cái.
   */
  public calculateThumbRotation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateThumbRotation', fingerOrientation('thumb', entityOrAngle, options), {
      finger: 'thumb'
    });
  }
  /**
   * [0423] calculateThumbTipVelocity
   * Tính vận tốc đầu ngón cái.
   */
  public calculateThumbTipVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateThumbTipVelocity', readVector(entity, 'velocity'), { finger: 'thumb', dt });
  }
  /**
   * [0424] calculateThumbTipAcceleration
   * Tính gia tốc đầu ngón cái.
   */
  public calculateThumbTipAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateThumbTipAcceleration', readVector(entity, 'acceleration'), {
      finger: 'thumb',
      dt
    });
  }
  /**
   * [0425] calculateThumbJointAngles
   * Tính các góc khớp ngón cái.
   */
  public calculateThumbJointAngles(a?: any, b?: any): any {
    const payload = jointAnglePayload('thumb', a, b);
    return measurement('calculateThumbJointAngles', payload.total as number, 'rad', payload);
  }
  /**
   * [0426] calculateThumbSegmentLengths
   * Tính chiều dài các đốt ngón cái.
   */
  public calculateThumbSegmentLengths(entity?: any, options?: any): any {
    return this.fingerSegments('thumb', 'calculateThumbSegmentLengths', entity, options);
  }
  /**
   * [0427] calculateThumbBoundingBox
   * Tính hộp bao ngón cái.
   */
  public calculateThumbBoundingBox(entity?: any, size?: Vec3D): any {
    return boundsResult('calculateThumbBoundingBox', fingerBox('thumb', entity, size), { finger: 'thumb' });
  }
  /**
   * [0428] calculateThumbBoundingSphere
   * Tính hình cầu bao ngón cái.
   */
  public calculateThumbBoundingSphere(entity?: any, radius?: number): any {
    return {
      name: 'calculateThumbBoundingSphere',
      valid: true,
      center: fingerCenter('thumb', entity),
      radius: fingerBoundingRadius('thumb', radius),
      timestamp: Date.now()
    };
  }
  /**
   * [0429] calculateThumbTipDistanceToIndex
   * Tính khoảng cách đầu ngón cái đến ngón trỏ.
   */
  public calculateThumbTipDistanceToIndex(a?: any, b?: any): any {
    return measurement('calculateThumbTipDistanceToIndex', tipDistance('thumb', 'index', a, b), 'm', {
      from: 'thumb',
      to: 'index'
    });
  }
  /**
   * [0430] calculateThumbTipDistanceToMiddle
   * Tính khoảng cách đầu ngón cái đến ngón giữa.
   */
  public calculateThumbTipDistanceToMiddle(a?: any, b?: any): any {
    return measurement('calculateThumbTipDistanceToMiddle', tipDistance('thumb', 'middle', a, b), 'm', {
      from: 'thumb',
      to: 'middle'
    });
  }
  /**
   * [0431] calculateThumbTipDistanceToRing
   * Tính khoảng cách đầu ngón cái đến ngón áp út.
   */
  public calculateThumbTipDistanceToRing(a?: any, b?: any): any {
    return measurement('calculateThumbTipDistanceToRing', tipDistance('thumb', 'ring', a, b), 'm', {
      from: 'thumb',
      to: 'ring'
    });
  }
  /**
   * [0432] calculateThumbTipDistanceToLittle
   * Tính khoảng cách đầu ngón cái đến ngón út.
   */
  public calculateThumbTipDistanceToLittle(a?: any, b?: any): any {
    return measurement('calculateThumbTipDistanceToLittle', tipDistance('thumb', 'little', a, b), 'm', {
      from: 'thumb',
      to: 'little'
    });
  }
  /**
   * [0433] calculateThumbPinchDistance
   * Tính khoảng cách kẹp giữa ngón cái và ngón khác.
   */
  public calculateThumbPinchDistance(a?: any, b?: any): any {
    return measurement('calculateThumbPinchDistance', tipDistance('thumb', 'index', a, b), 'm', {
      from: 'thumb',
      to: 'index'
    });
  }
  /**
   * [0434] calculateThumbPinchStrength
   * Ước lượng lực kẹp từ mô hình vật lý.
   */
  public calculateThumbPinchStrength(a?: any, b?: any, options?: any): any {
    return this.thumbPinchStrength(a, b, options);
  }
  /**
   * [0435] calculateThumbReachEnvelope
   * Tính vùng với tới của ngón cái.
   */
  public calculateThumbReachEnvelope(a?: any, b?: any, options?: any): any {
    return this.reachEnvelope('thumb', 'calculateThumbReachEnvelope', a, b, options);
  }
  /**
   * [0436] calculateThumbContactPoint
   * Tính điểm tiếp xúc ngón cái.
   */
  public calculateThumbContactPoint(a?: any, b?: any, options?: any): any {
    return this.contactPoint('thumb', 'calculateThumbContactPoint', a, b, options);
  }
  /**
   * [0437] calculateThumbSurfaceNormal
   * Tính pháp tuyến bề mặt ngón cái.
   */
  public calculateThumbSurfaceNormal(a?: any, b?: any): any {
    return this.surfaceNormal('thumb', 'calculateThumbSurfaceNormal', a, b);
  }
  /**
   * [0438] calculateThumbPoseError
   * Tính sai lệch tư thế ngón cái.
   */
  public calculateThumbPoseError(a?: any, b?: any, options?: any): any {
    return this.poseError('thumb', 'calculateThumbPoseError', a, b, options);
  }
  /**
   * [0439] calculateThumbMotionSmoothness
   * Tính độ mượt chuyển động ngón cái.
   */
  public calculateThumbMotionSmoothness(a?: any, b?: any, options?: any): any {
    return this.motionSmoothness('thumb', 'calculateThumbMotionSmoothness', a, b, options);
  }
  /**
   * [0440] calculateThumbCollision
   * Kiểm tra va chạm ngón cái.
   */
  public calculateThumbCollision(a?: any, b?: any): any {
    return aabbResult(
      'calculateThumbCollision',
      fingerBox('thumb', a),
      readBox(b, entityPosition(a), BODY_BOX_SIZES.palm)
    );
  }
  // ==========================================================================
  // 10. Tọa độ ngón trỏ
  // ==========================================================================

  /**
   * [0441] getIndexFingerRootPosition
   * Lấy tọa độ gốc ngón trỏ.
   */
  public getIndexFingerRootPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'root'), toVec3(offset)));
  }
  /**
   * [0442] getIndexFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón trỏ.
   */
  public getIndexFingerMCPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'mcp'), toVec3(offset)));
  }
  /**
   * [0443] getIndexFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón trỏ.
   */
  public getIndexFingerPIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'pip'), toVec3(offset)));
  }
  /**
   * [0444] getIndexFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón trỏ.
   */
  public getIndexFingerDIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'dip'), toVec3(offset)));
  }
  /**
   * [0445] getIndexFingerTipPosition
   * Lấy tọa độ đầu ngón trỏ.
   */
  public getIndexFingerTipPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'tip'), toVec3(offset)));
  }
  /**
   * [0446] getIndexFingerNailPosition
   * Lấy tọa độ móng ngón trỏ.
   */
  public getIndexFingerNailPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'nail'), toVec3(offset)));
  }
  /**
   * [0447] getIndexFingerPadPosition
   * Lấy tọa độ đệm ngón trỏ.
   */
  public getIndexFingerPadPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'pad'), toVec3(offset)));
  }
  /**
   * [0448] getIndexFingerBasePosition
   * Lấy tọa độ đáy ngón trỏ.
   */
  public getIndexFingerBasePosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'base'), toVec3(offset)));
  }
  /**
   * [0449] getIndexFingerProximalJoint
   * Lấy tọa độ khớp gần ngón trỏ.
   */
  public getIndexFingerProximalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'pip'), toVec3(offset)));
  }
  /**
   * [0450] getIndexFingerDistalJoint
   * Lấy tọa độ khớp xa ngón trỏ.
   */
  public getIndexFingerDistalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('index', 'dip'), toVec3(offset)));
  }
  /**
   * [0451] calculateIndexFingerLength
   * Tính chiều dài ngón trỏ.
   */
  public calculateIndexFingerLength(entity?: any, options?: any): any {
    return this.fingerLength('index', 'calculateIndexFingerLength', entity, options);
  }
  /**
   * [0452] calculateIndexFingerWidth
   * Tính chiều rộng ngón trỏ.
   */
  public calculateIndexFingerWidth(entity?: any, options?: any): any {
    return this.fingerWidth('index', 'calculateIndexFingerWidth', entity, options);
  }
  /**
   * [0453] calculateIndexFingerThickness
   * Tính độ dày ngón trỏ.
   */
  public calculateIndexFingerThickness(a?: any, b?: any, options?: any): any {
    return this.fingerThickness('index', 'calculateIndexFingerThickness', a, b, options);
  }
  /**
   * [0454] calculateIndexFingerCurvature
   * Tính độ cong ngón trỏ.
   */
  public calculateIndexFingerCurvature(entity?: any, options?: any): any {
    return this.fingerCurvatureValue('index', 'calculateIndexFingerCurvature', entity, options);
  }
  /**
   * [0455] calculateIndexFingerDirection
   * Tính hướng ngón trỏ.
   */
  public calculateIndexFingerDirection(a?: any, b?: any): any {
    return directionResult('calculateIndexFingerDirection', this.fingerDirection('index', a, b), {
      finger: 'index'
    });
  }
  /**
   * [0456] calculateIndexFingerOrientation
   * Tính hướng quay ngón trỏ.
   */
  public calculateIndexFingerOrientation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateIndexFingerOrientation', fingerOrientation('index', entityOrAngle, options), {
      finger: 'index'
    });
  }
  /**
   * [0457] calculateIndexFingerFlexion
   * Tính góc gập ngón trỏ.
   */
  public calculateIndexFingerFlexion(a?: any, b?: any): any {
    return measurement('calculateIndexFingerFlexion', readAngles(a, b).flexion, 'rad', { finger: 'index' });
  }
  /**
   * [0458] calculateIndexFingerExtension
   * Tính góc duỗi ngón trỏ.
   */
  public calculateIndexFingerExtension(a?: any, b?: any): any {
    return measurement('calculateIndexFingerExtension', readAngles(a, b).extension, 'rad', { finger: 'index' });
  }
  /**
   * [0459] calculateIndexFingerAbduction
   * Tính góc dạng ngón trỏ.
   */
  public calculateIndexFingerAbduction(a?: any, b?: any): any {
    return measurement('calculateIndexFingerAbduction', readAngles(a, b).abduction, 'rad', { finger: 'index' });
  }
  /**
   * [0460] calculateIndexFingerAdduction
   * Tính góc khép ngón trỏ.
   */
  public calculateIndexFingerAdduction(a?: any, b?: any): any {
    return measurement('calculateIndexFingerAdduction', readAngles(a, b).adduction, 'rad', { finger: 'index' });
  }
  /**
   * [0461] calculateIndexFingerRotation
   * Tính góc quay ngón trỏ.
   */
  public calculateIndexFingerRotation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateIndexFingerRotation', fingerOrientation('index', entityOrAngle, options), {
      finger: 'index'
    });
  }
  /**
   * [0462] calculateIndexFingerTipVelocity
   * Tính vận tốc đầu ngón trỏ.
   */
  public calculateIndexFingerTipVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateIndexFingerTipVelocity', readVector(entity, 'velocity'), { finger: 'index', dt });
  }
  /**
   * [0463] calculateIndexFingerTipAcceleration
   * Tính gia tốc đầu ngón trỏ.
   */
  public calculateIndexFingerTipAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateIndexFingerTipAcceleration', readVector(entity, 'acceleration'), {
      finger: 'index',
      dt
    });
  }
  /**
   * [0464] calculateIndexFingerJointAngles
   * Tính các góc khớp ngón trỏ.
   */
  public calculateIndexFingerJointAngles(a?: any, b?: any): any {
    const payload = jointAnglePayload('index', a, b);
    return measurement('calculateIndexFingerJointAngles', payload.total as number, 'rad', payload);
  }
  /**
   * [0465] calculateIndexFingerSegmentLengths
   * Tính chiều dài các đốt ngón trỏ.
   */
  public calculateIndexFingerSegmentLengths(entity?: any, options?: any): any {
    return this.fingerSegments('index', 'calculateIndexFingerSegmentLengths', entity, options);
  }
  /**
   * [0466] calculateIndexFingerBoundingBox
   * Tính hộp bao ngón trỏ.
   */
  public calculateIndexFingerBoundingBox(entity?: any, size?: Vec3D): any {
    return boundsResult('calculateIndexFingerBoundingBox', fingerBox('index', entity, size), { finger: 'index' });
  }
  /**
   * [0467] calculateIndexFingerBoundingSphere
   * Tính hình cầu bao ngón trỏ.
   */
  public calculateIndexFingerBoundingSphere(entity?: any, radius?: number): any {
    return {
      name: 'calculateIndexFingerBoundingSphere',
      valid: true,
      center: fingerCenter('index', entity),
      radius: fingerBoundingRadius('index', radius),
      timestamp: Date.now()
    };
  }
  /**
   * [0468] calculateIndexToThumbDistance
   * Tính khoảng cách ngón trỏ đến ngón cái.
   */
  public calculateIndexToThumbDistance(a?: any, b?: any): any {
    return measurement('calculateIndexToThumbDistance', tipDistance('index', 'thumb', a, b), 'm', {
      from: 'index',
      to: 'thumb'
    });
  }
  /**
   * [0469] calculateIndexToMiddleDistance
   * Tính khoảng cách ngón trỏ đến ngón giữa.
   */
  public calculateIndexToMiddleDistance(a?: any, b?: any): any {
    return measurement('calculateIndexToMiddleDistance', tipDistance('index', 'middle', a, b), 'm', {
      from: 'index',
      to: 'middle'
    });
  }
  /**
   * [0470] calculateIndexToRingDistance
   * Tính khoảng cách ngón trỏ đến ngón áp út.
   */
  public calculateIndexToRingDistance(a?: any, b?: any): any {
    return measurement('calculateIndexToRingDistance', tipDistance('index', 'ring', a, b), 'm', {
      from: 'index',
      to: 'ring'
    });
  }
  /**
   * [0471] calculateIndexToLittleDistance
   * Tính khoảng cách ngón trỏ đến ngón út.
   */
  public calculateIndexToLittleDistance(a?: any, b?: any): any {
    return measurement('calculateIndexToLittleDistance', tipDistance('index', 'little', a, b), 'm', {
      from: 'index',
      to: 'little'
    });
  }
  /**
   * [0472] calculateIndexPointingDirection
   * Tính hướng chỉ của ngón trỏ.
   */
  public calculateIndexPointingDirection(a?: any, b?: any): any {
    const side = this.sideOf(b ?? a);
    const from = jointOffset('index', 'pip', side);
    const to = jointOffset('index', 'tip', side);
    const rest = normalize(subtract(to, from));
    const bone = findBone(b ?? a, undefined, FINGER_BONE_NAMES.index);
    const q = bone ? normalizeQuaternion(entityQuaternion(bone)) : entityQuaternion(a);
    return directionResult('calculateIndexPointingDirection', normalize(rotateVec(q, rest)), {
      finger: 'index'
    });
  }
  /**
   * [0473] calculateIndexReachEnvelope
   * Tính vùng với tới của ngón trỏ.
   */
  public calculateIndexReachEnvelope(a?: any, b?: any, options?: any): any {
    return this.reachEnvelope('index', 'calculateIndexReachEnvelope', a, b, options);
  }
  /**
   * [0474] calculateIndexContactPoint
   * Tính điểm tiếp xúc ngón trỏ.
   */
  public calculateIndexContactPoint(a?: any, b?: any, options?: any): any {
    return this.contactPoint('index', 'calculateIndexContactPoint', a, b, options);
  }
  /**
   * [0475] calculateIndexSurfaceNormal
   * Tính pháp tuyến bề mặt ngón trỏ.
   */
  public calculateIndexSurfaceNormal(a?: any, b?: any): any {
    return this.surfaceNormal('index', 'calculateIndexSurfaceNormal', a, b);
  }
  /**
   * [0476] calculateIndexPoseError
   * Tính sai lệch tư thế ngón trỏ.
   */
  public calculateIndexPoseError(a?: any, b?: any, options?: any): any {
    return this.poseError('index', 'calculateIndexPoseError', a, b, options);
  }
  /**
   * [0477] calculateIndexMotionSmoothness
   * Tính độ mượt chuyển động ngón trỏ.
   */
  public calculateIndexMotionSmoothness(a?: any, b?: any, options?: any): any {
    return this.motionSmoothness('index', 'calculateIndexMotionSmoothness', a, b, options);
  }
  /**
   * [0478] calculateIndexCollision
   * Kiểm tra va chạm ngón trỏ.
   */
  public calculateIndexCollision(a?: any, b?: any): any {
    return aabbResult(
      'calculateIndexCollision',
      fingerBox('index', a),
      readBox(b, entityPosition(a), BODY_BOX_SIZES.palm)
    );
  }
  /**
   * [0479] calculateIndexFingerCurl
   * Tính độ cuộn ngón trỏ.
   */
  public calculateIndexFingerCurl(entity?: any, options?: any): any {
    return this.fingerCurl('index', 'calculateIndexFingerCurl', entity, options);
  }
  /**
   * [0480] calculateIndexFingerSpread
   * Tính độ xòe ngón trỏ.
   */
  public calculateIndexFingerSpread(entity?: any, options?: any): any {
    return this.fingerSpreadValue('index', 'calculateIndexFingerSpread', entity, options);
  }
  // ==========================================================================
  // 11. Tọa độ ngón giữa
  // ==========================================================================

  /**
   * [0481] getMiddleFingerRootPosition
   * Lấy tọa độ gốc ngón giữa.
   */
  public getMiddleFingerRootPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'root'), toVec3(offset)));
  }
  /**
   * [0482] getMiddleFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón giữa.
   */
  public getMiddleFingerMCPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'mcp'), toVec3(offset)));
  }
  /**
   * [0483] getMiddleFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón giữa.
   */
  public getMiddleFingerPIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'pip'), toVec3(offset)));
  }
  /**
   * [0484] getMiddleFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón giữa.
   */
  public getMiddleFingerDIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'dip'), toVec3(offset)));
  }
  /**
   * [0485] getMiddleFingerTipPosition
   * Lấy tọa độ đầu ngón giữa.
   */
  public getMiddleFingerTipPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'tip'), toVec3(offset)));
  }
  /**
   * [0486] getMiddleFingerNailPosition
   * Lấy tọa độ móng ngón giữa.
   */
  public getMiddleFingerNailPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'nail'), toVec3(offset)));
  }
  /**
   * [0487] getMiddleFingerPadPosition
   * Lấy tọa độ đệm ngón giữa.
   */
  public getMiddleFingerPadPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'pad'), toVec3(offset)));
  }
  /**
   * [0488] getMiddleFingerBasePosition
   * Lấy tọa độ đáy ngón giữa.
   */
  public getMiddleFingerBasePosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'base'), toVec3(offset)));
  }
  /**
   * [0489] getMiddleFingerProximalJoint
   * Lấy tọa độ khớp gần ngón giữa.
   */
  public getMiddleFingerProximalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'pip'), toVec3(offset)));
  }
  /**
   * [0490] getMiddleFingerDistalJoint
   * Lấy tọa độ khớp xa ngón giữa.
   */
  public getMiddleFingerDistalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('middle', 'dip'), toVec3(offset)));
  }
  /**
   * [0491] calculateMiddleFingerLength
   * Tính chiều dài ngón giữa.
   */
  public calculateMiddleFingerLength(entity?: any, options?: any): any {
    return this.fingerLength('middle', 'calculateMiddleFingerLength', entity, options);
  }
  /**
   * [0492] calculateMiddleFingerWidth
   * Tính chiều rộng ngón giữa.
   */
  public calculateMiddleFingerWidth(entity?: any, options?: any): any {
    return this.fingerWidth('middle', 'calculateMiddleFingerWidth', entity, options);
  }
  /**
   * [0493] calculateMiddleFingerThickness
   * Tính độ dày ngón giữa.
   */
  public calculateMiddleFingerThickness(a?: any, b?: any, options?: any): any {
    return this.fingerThickness('middle', 'calculateMiddleFingerThickness', a, b, options);
  }
  /**
   * [0494] calculateMiddleFingerCurvature
   * Tính độ cong ngón giữa.
   */
  public calculateMiddleFingerCurvature(entity?: any, options?: any): any {
    return this.fingerCurvatureValue('middle', 'calculateMiddleFingerCurvature', entity, options);
  }
  /**
   * [0495] calculateMiddleFingerDirection
   * Tính hướng ngón giữa.
   */
  public calculateMiddleFingerDirection(a?: any, b?: any): any {
    return directionResult('calculateMiddleFingerDirection', this.fingerDirection('middle', a, b), {
      finger: 'middle'
    });
  }
  /**
   * [0496] calculateMiddleFingerOrientation
   * Tính hướng quay ngón giữa.
   */
  public calculateMiddleFingerOrientation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateMiddleFingerOrientation', fingerOrientation('middle', entityOrAngle, options), {
      finger: 'middle'
    });
  }
  /**
   * [0497] calculateMiddleFingerFlexion
   * Tính góc gập ngón giữa.
   */
  public calculateMiddleFingerFlexion(a?: any, b?: any): any {
    return measurement('calculateMiddleFingerFlexion', readAngles(a, b).flexion, 'rad', { finger: 'middle' });
  }
  /**
   * [0498] calculateMiddleFingerExtension
   * Tính góc duỗi ngón giữa.
   */
  public calculateMiddleFingerExtension(a?: any, b?: any): any {
    return measurement('calculateMiddleFingerExtension', readAngles(a, b).extension, 'rad', { finger: 'middle' });
  }
  /**
   * [0499] calculateMiddleFingerAbduction
   * Tính góc dạng ngón giữa.
   */
  public calculateMiddleFingerAbduction(a?: any, b?: any): any {
    return measurement('calculateMiddleFingerAbduction', readAngles(a, b).abduction, 'rad', { finger: 'middle' });
  }
  /**
   * [0500] calculateMiddleFingerAdduction
   * Tính góc khép ngón giữa.
   */
  public calculateMiddleFingerAdduction(a?: any, b?: any): any {
    return measurement('calculateMiddleFingerAdduction', readAngles(a, b).adduction, 'rad', { finger: 'middle' });
  }
  /**
   * [0501] calculateMiddleFingerRotation
   * Tính góc quay ngón giữa.
   */
  public calculateMiddleFingerRotation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateMiddleFingerRotation', fingerOrientation('middle', entityOrAngle, options), {
      finger: 'middle'
    });
  }
  /**
   * [0502] calculateMiddleFingerTipVelocity
   * Tính vận tốc đầu ngón giữa.
   */
  public calculateMiddleFingerTipVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateMiddleFingerTipVelocity', readVector(entity, 'velocity'), {
      finger: 'middle',
      dt
    });
  }
  /**
   * [0503] calculateMiddleFingerTipAcceleration
   * Tính gia tốc đầu ngón giữa.
   */
  public calculateMiddleFingerTipAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateMiddleFingerTipAcceleration', readVector(entity, 'acceleration'), {
      finger: 'middle',
      dt
    });
  }
  /**
   * [0504] calculateMiddleFingerJointAngles
   * Tính các góc khớp ngón giữa.
   */
  public calculateMiddleFingerJointAngles(a?: any, b?: any): any {
    const payload = jointAnglePayload('middle', a, b);
    return measurement('calculateMiddleFingerJointAngles', payload.total as number, 'rad', payload);
  }
  /**
   * [0505] calculateMiddleFingerSegmentLengths
   * Tính chiều dài các đốt ngón giữa.
   */
  public calculateMiddleFingerSegmentLengths(entity?: any, options?: any): any {
    return this.fingerSegments('middle', 'calculateMiddleFingerSegmentLengths', entity, options);
  }
  /**
   * [0506] calculateMiddleFingerBoundingBox
   * Tính hộp bao ngón giữa.
   */
  public calculateMiddleFingerBoundingBox(entity?: any, size?: Vec3D): any {
    return boundsResult('calculateMiddleFingerBoundingBox', fingerBox('middle', entity, size), { finger: 'middle' });
  }
  /**
   * [0507] calculateMiddleFingerBoundingSphere
   * Tính hình cầu bao ngón giữa.
   */
  public calculateMiddleFingerBoundingSphere(entity?: any, radius?: number): any {
    return {
      name: 'calculateMiddleFingerBoundingSphere',
      valid: true,
      center: fingerCenter('middle', entity),
      radius: fingerBoundingRadius('middle', radius),
      timestamp: Date.now()
    };
  }
  /**
   * [0508] calculateMiddleToThumbDistance
   * Tính khoảng cách ngón giữa đến ngón cái.
   */
  public calculateMiddleToThumbDistance(a?: any, b?: any): any {
    return measurement('calculateMiddleToThumbDistance', tipDistance('middle', 'thumb', a, b), 'm', {
      from: 'middle',
      to: 'thumb'
    });
  }
  /**
   * [0509] calculateMiddleToIndexDistance
   * Tính khoảng cách ngón giữa đến ngón trỏ.
   */
  public calculateMiddleToIndexDistance(a?: any, b?: any): any {
    return measurement('calculateMiddleToIndexDistance', tipDistance('middle', 'index', a, b), 'm', {
      from: 'middle',
      to: 'index'
    });
  }
  /**
   * [0510] calculateMiddleToRingDistance
   * Tính khoảng cách ngón giữa đến ngón áp út.
   */
  public calculateMiddleToRingDistance(a?: any, b?: any): any {
    return measurement('calculateMiddleToRingDistance', tipDistance('middle', 'ring', a, b), 'm', {
      from: 'middle',
      to: 'ring'
    });
  }
  /**
   * [0511] calculateMiddleToLittleDistance
   * Tính khoảng cách ngón giữa đến ngón út.
   */
  public calculateMiddleToLittleDistance(a?: any, b?: any): any {
    return measurement('calculateMiddleToLittleDistance', tipDistance('middle', 'little', a, b), 'm', {
      from: 'middle',
      to: 'little'
    });
  }
  /**
   * [0512] calculateMiddleFingerReachEnvelope
   * Tính vùng với tới của ngón giữa.
   */
  public calculateMiddleFingerReachEnvelope(a?: any, b?: any, options?: any): any {
    return this.reachEnvelope('middle', 'calculateMiddleFingerReachEnvelope', a, b, options);
  }
  /**
   * [0513] calculateMiddleFingerContactPoint
   * Tính điểm tiếp xúc ngón giữa.
   */
  public calculateMiddleFingerContactPoint(a?: any, b?: any, options?: any): any {
    return this.contactPoint('middle', 'calculateMiddleFingerContactPoint', a, b, options);
  }
  /**
   * [0514] calculateMiddleFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón giữa.
   */
  public calculateMiddleFingerSurfaceNormal(a?: any, b?: any): any {
    return this.surfaceNormal('middle', 'calculateMiddleFingerSurfaceNormal', a, b);
  }
  /**
   * [0515] calculateMiddleFingerPoseError
   * Tính sai lệch tư thế ngón giữa.
   */
  public calculateMiddleFingerPoseError(a?: any, b?: any, options?: any): any {
    return this.poseError('middle', 'calculateMiddleFingerPoseError', a, b, options);
  }
  /**
   * [0516] calculateMiddleFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón giữa.
   */
  public calculateMiddleFingerMotionSmoothness(a?: any, b?: any, options?: any): any {
    return this.motionSmoothness('middle', 'calculateMiddleFingerMotionSmoothness', a, b, options);
  }
  /**
   * [0517] calculateMiddleFingerCollision
   * Kiểm tra va chạm ngón giữa.
   */
  public calculateMiddleFingerCollision(a?: any, b?: any): any {
    return aabbResult(
      'calculateMiddleFingerCollision',
      fingerBox('middle', a),
      readBox(b, entityPosition(a), BODY_BOX_SIZES.palm)
    );
  }
  /**
   * [0518] calculateMiddleFingerCurl
   * Tính độ cuộn ngón giữa.
   */
  public calculateMiddleFingerCurl(entity?: any, options?: any): any {
    return this.fingerCurl('middle', 'calculateMiddleFingerCurl', entity, options);
  }
  /**
   * [0519] calculateMiddleFingerSpread
   * Tính độ xòe ngón giữa.
   */
  public calculateMiddleFingerSpread(entity?: any, options?: any): any {
    return this.fingerSpreadValue('middle', 'calculateMiddleFingerSpread', entity, options);
  }
  /**
   * [0520] calculateMiddleFingerAlignment
   * Tính độ thẳng hàng ngón giữa.
   */
  public calculateMiddleFingerAlignment(a?: any, b?: any, options?: any): any {
    return this.fingerAlignment('middle', 'calculateMiddleFingerAlignment', a, b, options);
  }
  // ==========================================================================
  // 12. Tọa độ ngón áp út
  // ==========================================================================

  /**
   * [0521] getRingFingerRootPosition
   * Lấy tọa độ gốc ngón áp út.
   */
  public getRingFingerRootPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'root'), toVec3(offset)));
  }
  /**
   * [0522] getRingFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón áp út.
   */
  public getRingFingerMCPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'mcp'), toVec3(offset)));
  }
  /**
   * [0523] getRingFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón áp út.
   */
  public getRingFingerPIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'pip'), toVec3(offset)));
  }
  /**
   * [0524] getRingFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón áp út.
   */
  public getRingFingerDIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'dip'), toVec3(offset)));
  }
  /**
   * [0525] getRingFingerTipPosition
   * Lấy tọa độ đầu ngón áp út.
   */
  public getRingFingerTipPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'tip'), toVec3(offset)));
  }
  /**
   * [0526] getRingFingerNailPosition
   * Lấy tọa độ móng ngón áp út.
   */
  public getRingFingerNailPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'nail'), toVec3(offset)));
  }
  /**
   * [0527] getRingFingerPadPosition
   * Lấy tọa độ đệm ngón áp út.
   */
  public getRingFingerPadPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'pad'), toVec3(offset)));
  }
  /**
   * [0528] getRingFingerBasePosition
   * Lấy tọa độ đáy ngón áp út.
   */
  public getRingFingerBasePosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'base'), toVec3(offset)));
  }
  /**
   * [0529] getRingFingerProximalJoint
   * Lấy tọa độ khớp gần ngón áp út.
   */
  public getRingFingerProximalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'pip'), toVec3(offset)));
  }
  /**
   * [0530] getRingFingerDistalJoint
   * Lấy tọa độ khớp xa ngón áp út.
   */
  public getRingFingerDistalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('ring', 'dip'), toVec3(offset)));
  }
  /**
   * [0531] calculateRingFingerLength
   * Tính chiều dài ngón áp út.
   */
  public calculateRingFingerLength(entity?: any, options?: any): any {
    return this.fingerLength('ring', 'calculateRingFingerLength', entity, options);
  }
  /**
   * [0532] calculateRingFingerWidth
   * Tính chiều rộng ngón áp út.
   */
  public calculateRingFingerWidth(entity?: any, options?: any): any {
    return this.fingerWidth('ring', 'calculateRingFingerWidth', entity, options);
  }
  /**
   * [0533] calculateRingFingerThickness
   * Tính độ dày ngón áp út.
   */
  public calculateRingFingerThickness(a?: any, b?: any, options?: any): any {
    return this.fingerThickness('ring', 'calculateRingFingerThickness', a, b, options);
  }
  /**
   * [0534] calculateRingFingerCurvature
   * Tính độ cong ngón áp út.
   */
  public calculateRingFingerCurvature(entity?: any, options?: any): any {
    return this.fingerCurvatureValue('ring', 'calculateRingFingerCurvature', entity, options);
  }
  /**
   * [0535] calculateRingFingerDirection
   * Tính hướng ngón áp út.
   */
  public calculateRingFingerDirection(a?: any, b?: any): any {
    return directionResult('calculateRingFingerDirection', this.fingerDirection('ring', a, b), {
      finger: 'ring'
    });
  }
  /**
   * [0536] calculateRingFingerOrientation
   * Tính hướng quay ngón áp út.
   */
  public calculateRingFingerOrientation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateRingFingerOrientation', fingerOrientation('ring', entityOrAngle, options), {
      finger: 'ring'
    });
  }
  /**
   * [0537] calculateRingFingerFlexion
   * Tính góc gập ngón áp út.
   */
  public calculateRingFingerFlexion(a?: any, b?: any): any {
    return measurement('calculateRingFingerFlexion', readAngles(a, b).flexion, 'rad', { finger: 'ring' });
  }
  /**
   * [0538] calculateRingFingerExtension
   * Tính góc duỗi ngón áp út.
   */
  public calculateRingFingerExtension(a?: any, b?: any): any {
    return measurement('calculateRingFingerExtension', readAngles(a, b).extension, 'rad', { finger: 'ring' });
  }
  /**
   * [0539] calculateRingFingerAbduction
   * Tính góc dạng ngón áp út.
   */
  public calculateRingFingerAbduction(a?: any, b?: any): any {
    return measurement('calculateRingFingerAbduction', readAngles(a, b).abduction, 'rad', { finger: 'ring' });
  }
  /**
   * [0540] calculateRingFingerAdduction
   * Tính góc khép ngón áp út.
   */
  public calculateRingFingerAdduction(a?: any, b?: any): any {
    return measurement('calculateRingFingerAdduction', readAngles(a, b).adduction, 'rad', { finger: 'ring' });
  }
  /**
   * [0541] calculateRingFingerRotation
   * Tính góc quay ngón áp út.
   */
  public calculateRingFingerRotation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateRingFingerRotation', fingerOrientation('ring', entityOrAngle, options), {
      finger: 'ring'
    });
  }
  /**
   * [0542] calculateRingFingerTipVelocity
   * Tính vận tốc đầu ngón áp út.
   */
  public calculateRingFingerTipVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateRingFingerTipVelocity', readVector(entity, 'velocity'), { finger: 'ring', dt });
  }
  /**
   * [0543] calculateRingFingerTipAcceleration
   * Tính gia tốc đầu ngón áp út.
   */
  public calculateRingFingerTipAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateRingFingerTipAcceleration', readVector(entity, 'acceleration'), {
      finger: 'ring',
      dt
    });
  }
  /**
   * [0544] calculateRingFingerJointAngles
   * Tính các góc khớp ngón áp út.
   */
  public calculateRingFingerJointAngles(a?: any, b?: any): any {
    const payload = jointAnglePayload('ring', a, b);
    return measurement('calculateRingFingerJointAngles', payload.total as number, 'rad', payload);
  }
  /**
   * [0545] calculateRingFingerSegmentLengths
   * Tính chiều dài các đốt ngón áp út.
   */
  public calculateRingFingerSegmentLengths(entity?: any, options?: any): any {
    return this.fingerSegments('ring', 'calculateRingFingerSegmentLengths', entity, options);
  }
  /**
   * [0546] calculateRingFingerBoundingBox
   * Tính hộp bao ngón áp út.
   */
  public calculateRingFingerBoundingBox(entity?: any, size?: Vec3D): any {
    return boundsResult('calculateRingFingerBoundingBox', fingerBox('ring', entity, size), { finger: 'ring' });
  }
  /**
   * [0547] calculateRingFingerBoundingSphere
   * Tính hình cầu bao ngón áp út.
   */
  public calculateRingFingerBoundingSphere(entity?: any, radius?: number): any {
    return {
      name: 'calculateRingFingerBoundingSphere',
      valid: true,
      center: fingerCenter('ring', entity),
      radius: fingerBoundingRadius('ring', radius),
      timestamp: Date.now()
    };
  }
  /**
   * [0548] calculateRingToThumbDistance
   * Tính khoảng cách ngón áp út đến ngón cái.
   */
  public calculateRingToThumbDistance(a?: any, b?: any): any {
    return measurement('calculateRingToThumbDistance', tipDistance('ring', 'thumb', a, b), 'm', {
      from: 'ring',
      to: 'thumb'
    });
  }
  /**
   * [0549] calculateRingToIndexDistance
   * Tính khoảng cách ngón áp út đến ngón trỏ.
   */
  public calculateRingToIndexDistance(a?: any, b?: any): any {
    return measurement('calculateRingToIndexDistance', tipDistance('ring', 'index', a, b), 'm', {
      from: 'ring',
      to: 'index'
    });
  }
  /**
   * [0550] calculateRingToMiddleDistance
   * Tính khoảng cách ngón áp út đến ngón giữa.
   */
  public calculateRingToMiddleDistance(a?: any, b?: any): any {
    return measurement('calculateRingToMiddleDistance', tipDistance('ring', 'middle', a, b), 'm', {
      from: 'ring',
      to: 'middle'
    });
  }
  /**
   * [0551] calculateRingToLittleDistance
   * Tính khoảng cách ngón áp út đến ngón út.
   */
  public calculateRingToLittleDistance(a?: any, b?: any): any {
    return measurement('calculateRingToLittleDistance', tipDistance('ring', 'little', a, b), 'm', {
      from: 'ring',
      to: 'little'
    });
  }
  /**
   * [0552] calculateRingFingerReachEnvelope
   * Tính vùng với tới của ngón áp út.
   */
  public calculateRingFingerReachEnvelope(a?: any, b?: any, options?: any): any {
    return this.reachEnvelope('ring', 'calculateRingFingerReachEnvelope', a, b, options);
  }
  /**
   * [0553] calculateRingFingerContactPoint
   * Tính điểm tiếp xúc ngón áp út.
   */
  public calculateRingFingerContactPoint(a?: any, b?: any, options?: any): any {
    return this.contactPoint('ring', 'calculateRingFingerContactPoint', a, b, options);
  }
  /**
   * [0554] calculateRingFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón áp út.
   */
  public calculateRingFingerSurfaceNormal(a?: any, b?: any): any {
    return this.surfaceNormal('ring', 'calculateRingFingerSurfaceNormal', a, b);
  }
  /**
   * [0555] calculateRingFingerPoseError
   * Tính sai lệch tư thế ngón áp út.
   */
  public calculateRingFingerPoseError(a?: any, b?: any, options?: any): any {
    return this.poseError('ring', 'calculateRingFingerPoseError', a, b, options);
  }
  /**
   * [0556] calculateRingFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón áp út.
   */
  public calculateRingFingerMotionSmoothness(a?: any, b?: any, options?: any): any {
    return this.motionSmoothness('ring', 'calculateRingFingerMotionSmoothness', a, b, options);
  }
  /**
   * [0557] calculateRingFingerCollision
   * Kiểm tra va chạm ngón áp út.
   */
  public calculateRingFingerCollision(a?: any, b?: any): any {
    return aabbResult(
      'calculateRingFingerCollision',
      fingerBox('ring', a),
      readBox(b, entityPosition(a), BODY_BOX_SIZES.palm)
    );
  }
  /**
   * [0558] calculateRingFingerCurl
   * Tính độ cuộn ngón áp út.
   */
  public calculateRingFingerCurl(entity?: any, options?: any): any {
    return this.fingerCurl('ring', 'calculateRingFingerCurl', entity, options);
  }
  /**
   * [0559] calculateRingFingerSpread
   * Tính độ xòe ngón áp út.
   */
  public calculateRingFingerSpread(entity?: any, options?: any): any {
    return this.fingerSpreadValue('ring', 'calculateRingFingerSpread', entity, options);
  }
  /**
   * [0560] calculateRingFingerAlignment
   * Tính độ thẳng hàng ngón áp út.
   */
  public calculateRingFingerAlignment(a?: any, b?: any, options?: any): any {
    return this.fingerAlignment('ring', 'calculateRingFingerAlignment', a, b, options);
  }
  // ==========================================================================
  // 13. Tọa độ ngón út
  // ==========================================================================

  /**
   * [0561] getLittleFingerRootPosition
   * Lấy tọa độ gốc ngón út.
   */
  public getLittleFingerRootPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'root'), toVec3(offset)));
  }
  /**
   * [0562] getLittleFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón út.
   */
  public getLittleFingerMCPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'mcp'), toVec3(offset)));
  }
  /**
   * [0563] getLittleFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón út.
   */
  public getLittleFingerPIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'pip'), toVec3(offset)));
  }
  /**
   * [0564] getLittleFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón út.
   */
  public getLittleFingerDIPPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'dip'), toVec3(offset)));
  }
  /**
   * [0565] getLittleFingerTipPosition
   * Lấy tọa độ đầu ngón út.
   */
  public getLittleFingerTipPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'tip'), toVec3(offset)));
  }
  /**
   * [0566] getLittleFingerNailPosition
   * Lấy tọa độ móng ngón út.
   */
  public getLittleFingerNailPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'nail'), toVec3(offset)));
  }
  /**
   * [0567] getLittleFingerPadPosition
   * Lấy tọa độ đệm ngón út.
   */
  public getLittleFingerPadPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'pad'), toVec3(offset)));
  }
  /**
   * [0568] getLittleFingerBasePosition
   * Lấy tọa độ đáy ngón út.
   */
  public getLittleFingerBasePosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'base'), toVec3(offset)));
  }
  /**
   * [0569] getLittleFingerProximalJoint
   * Lấy tọa độ khớp gần ngón út.
   */
  public getLittleFingerProximalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'pip'), toVec3(offset)));
  }
  /**
   * [0570] getLittleFingerDistalJoint
   * Lấy tọa độ khớp xa ngón út.
   */
  public getLittleFingerDistalJoint(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, add(jointOffset('little', 'dip'), toVec3(offset)));
  }
  /**
   * [0571] calculateLittleFingerLength
   * Tính chiều dài ngón út.
   */
  public calculateLittleFingerLength(entity?: any, options?: any): any {
    return this.fingerLength('little', 'calculateLittleFingerLength', entity, options);
  }
  /**
   * [0572] calculateLittleFingerWidth
   * Tính chiều rộng ngón út.
   */
  public calculateLittleFingerWidth(entity?: any, options?: any): any {
    return this.fingerWidth('little', 'calculateLittleFingerWidth', entity, options);
  }
  /**
   * [0573] calculateLittleFingerThickness
   * Tính độ dày ngón út.
   */
  public calculateLittleFingerThickness(a?: any, b?: any, options?: any): any {
    return this.fingerThickness('little', 'calculateLittleFingerThickness', a, b, options);
  }
  /**
   * [0574] calculateLittleFingerCurvature
   * Tính độ cong ngón út.
   */
  public calculateLittleFingerCurvature(entity?: any, options?: any): any {
    return this.fingerCurvatureValue('little', 'calculateLittleFingerCurvature', entity, options);
  }
  /**
   * [0575] calculateLittleFingerDirection
   * Tính hướng ngón út.
   */
  public calculateLittleFingerDirection(a?: any, b?: any): any {
    return directionResult('calculateLittleFingerDirection', this.fingerDirection('little', a, b), {
      finger: 'little'
    });
  }
  /**
   * [0576] calculateLittleFingerOrientation
   * Tính hướng quay ngón út.
   */
  public calculateLittleFingerOrientation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateLittleFingerOrientation', fingerOrientation('little', entityOrAngle, options), {
      finger: 'little'
    });
  }
  /**
   * [0577] calculateLittleFingerFlexion
   * Tính góc gập ngón út.
   */
  public calculateLittleFingerFlexion(a?: any, b?: any): any {
    return measurement('calculateLittleFingerFlexion', readAngles(a, b).flexion, 'rad', { finger: 'little' });
  }
  /**
   * [0578] calculateLittleFingerExtension
   * Tính góc duỗi ngón út.
   */
  public calculateLittleFingerExtension(a?: any, b?: any): any {
    return measurement('calculateLittleFingerExtension', readAngles(a, b).extension, 'rad', { finger: 'little' });
  }
  /**
   * [0579] calculateLittleFingerAbduction
   * Tính góc dạng ngón út.
   */
  public calculateLittleFingerAbduction(a?: any, b?: any): any {
    return measurement('calculateLittleFingerAbduction', readAngles(a, b).abduction, 'rad', { finger: 'little' });
  }
  /**
   * [0580] calculateLittleFingerAdduction
   * Tính góc khép ngón út.
   */
  public calculateLittleFingerAdduction(a?: any, b?: any): any {
    return measurement('calculateLittleFingerAdduction', readAngles(a, b).adduction, 'rad', { finger: 'little' });
  }
  /**
   * [0581] calculateLittleFingerRotation
   * Tính góc quay ngón út.
   */
  public calculateLittleFingerRotation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateLittleFingerRotation', fingerOrientation('little', entityOrAngle, options), {
      finger: 'little'
    });
  }
  /**
   * [0582] calculateLittleFingerTipVelocity
   * Tính vận tốc đầu ngón út.
   */
  public calculateLittleFingerTipVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateLittleFingerTipVelocity', readVector(entity, 'velocity'), {
      finger: 'little',
      dt
    });
  }
  /**
   * [0583] calculateLittleFingerTipAcceleration
   * Tính gia tốc đầu ngón út.
   */
  public calculateLittleFingerTipAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateLittleFingerTipAcceleration', readVector(entity, 'acceleration'), {
      finger: 'little',
      dt
    });
  }
  /**
   * [0584] calculateLittleFingerJointAngles
   * Tính các góc khớp ngón út.
   */
  public calculateLittleFingerJointAngles(a?: any, b?: any): any {
    const payload = jointAnglePayload('little', a, b);
    return measurement('calculateLittleFingerJointAngles', payload.total as number, 'rad', payload);
  }
  /**
   * [0585] calculateLittleFingerSegmentLengths
   * Tính chiều dài các đốt ngón út.
   */
  public calculateLittleFingerSegmentLengths(entity?: any, options?: any): any {
    return this.fingerSegments('little', 'calculateLittleFingerSegmentLengths', entity, options);
  }
  /**
   * [0586] calculateLittleFingerBoundingBox
   * Tính hộp bao ngón út.
   */
  public calculateLittleFingerBoundingBox(entity?: any, size?: Vec3D): any {
    return boundsResult('calculateLittleFingerBoundingBox', fingerBox('little', entity, size), { finger: 'little' });
  }
  /**
   * [0587] calculateLittleFingerBoundingSphere
   * Tính hình cầu bao ngón út.
   */
  public calculateLittleFingerBoundingSphere(entity?: any, radius?: number): any {
    return {
      name: 'calculateLittleFingerBoundingSphere',
      valid: true,
      center: fingerCenter('little', entity),
      radius: fingerBoundingRadius('little', radius),
      timestamp: Date.now()
    };
  }
  /**
   * [0588] calculateLittleToThumbDistance
   * Tính khoảng cách ngón út đến ngón cái.
   */
  public calculateLittleToThumbDistance(a?: any, b?: any): any {
    return measurement('calculateLittleToThumbDistance', tipDistance('little', 'thumb', a, b), 'm', {
      from: 'little',
      to: 'thumb'
    });
  }
  /**
   * [0589] calculateLittleToIndexDistance
   * Tính khoảng cách ngón út đến ngón trỏ.
   */
  public calculateLittleToIndexDistance(a?: any, b?: any): any {
    return measurement('calculateLittleToIndexDistance', tipDistance('little', 'index', a, b), 'm', {
      from: 'little',
      to: 'index'
    });
  }
  /**
   * [0590] calculateLittleToMiddleDistance
   * Tính khoảng cách ngón út đến ngón giữa.
   */
  public calculateLittleToMiddleDistance(a?: any, b?: any): any {
    return measurement('calculateLittleToMiddleDistance', tipDistance('little', 'middle', a, b), 'm', {
      from: 'little',
      to: 'middle'
    });
  }
  /**
   * [0591] calculateLittleToRingDistance
   * Tính khoảng cách ngón út đến ngón áp út.
   */
  public calculateLittleToRingDistance(a?: any, b?: any): any {
    return measurement('calculateLittleToRingDistance', tipDistance('little', 'ring', a, b), 'm', {
      from: 'little',
      to: 'ring'
    });
  }
  /**
   * [0592] calculateLittleFingerReachEnvelope
   * Tính vùng với tới của ngón út.
   */
  public calculateLittleFingerReachEnvelope(a?: any, b?: any, options?: any): any {
    return this.reachEnvelope('little', 'calculateLittleFingerReachEnvelope', a, b, options);
  }
  /**
   * [0593] calculateLittleFingerContactPoint
   * Tính điểm tiếp xúc ngón út.
   */
  public calculateLittleFingerContactPoint(a?: any, b?: any, options?: any): any {
    return this.contactPoint('little', 'calculateLittleFingerContactPoint', a, b, options);
  }
  /**
   * [0594] calculateLittleFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón út.
   */
  public calculateLittleFingerSurfaceNormal(a?: any, b?: any): any {
    return this.surfaceNormal('little', 'calculateLittleFingerSurfaceNormal', a, b);
  }
  /**
   * [0595] calculateLittleFingerPoseError
   * Tính sai lệch tư thế ngón út.
   */
  public calculateLittleFingerPoseError(a?: any, b?: any, options?: any): any {
    return this.poseError('little', 'calculateLittleFingerPoseError', a, b, options);
  }
  /**
   * [0596] calculateLittleFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón út.
   */
  public calculateLittleFingerMotionSmoothness(a?: any, b?: any, options?: any): any {
    return this.motionSmoothness('little', 'calculateLittleFingerMotionSmoothness', a, b, options);
  }
  /**
   * [0597] calculateLittleFingerCollision
   * Kiểm tra va chạm ngón út.
   */
  public calculateLittleFingerCollision(a?: any, b?: any): any {
    return aabbResult(
      'calculateLittleFingerCollision',
      fingerBox('little', a),
      readBox(b, entityPosition(a), BODY_BOX_SIZES.palm)
    );
  }
  /**
   * [0598] calculateLittleFingerCurl
   * Tính độ cuộn ngón út.
   */
  public calculateLittleFingerCurl(entity?: any, options?: any): any {
    return this.fingerCurl('little', 'calculateLittleFingerCurl', entity, options);
  }
  /**
   * [0599] calculateLittleFingerSpread
   * Tính độ xòe ngón út.
   */
  public calculateLittleFingerSpread(entity?: any, options?: any): any {
    return this.fingerSpreadValue('little', 'calculateLittleFingerSpread', entity, options);
  }
  /**
   * [0600] calculateLittleFingerAlignment
   * Tính độ thẳng hàng ngón út.
   */
  public calculateLittleFingerAlignment(a?: any, b?: any, options?: any): any {
    return this.fingerAlignment('little', 'calculateLittleFingerAlignment', a, b, options);
  }
}
