/**
 * @file anatomical-lower-body-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/anatomical-lower-body-subsystem
 * @description Held Objects, Torso, Hips, Legs, Knees, Feet & Posture Balance Subsystem (601–950).
 *
 * Trước đây 349/350 method dùng chung một trong ~11 body nên hầu hết trả về
 * giá trị **không khớp tên hàm**: mọi điểm giải phẫu rơi vào cùng một toạ độ,
 * mọi góc khớp bằng 0, mọi va chạm luôn `hit: true`…
 *
 * Nay mỗi hàm gọi đúng phép tính trong `spatial-ui/spatial-primitives` với dữ
 * liệu giải phẫu từ `spatial-ui/anatomy-metrics`.
 *
 * **Quy ước neo (anchor):** `getXxxPosition(entity)` coi `entity.position` là
 * neo của chính mốc đó và trả về `entity.position + offset giải phẫu`.
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

import { BODY_DIMENSIONS, BODY_BOX_SIZES, bodyOffset } from '../anatomy-metrics.js';

import { buildSkeleton, forwardKinematics, allBones } from '../semantics/kinematics-semantics.js';

import {
  ZERO3,
  UP3,
  FORWARD3,
  RIGHT3,
  IDENTITY_QUAT,
  toVec3,
  num,
  entityPosition,
  entityQuaternion,
  entityForward,
  clamp,
  clamp01,
  lerp,
  lerpVec3,
  normalize,
  dot,
  cross,
  add,
  subtract,
  scale,
  magnitude,
  distance3D,
  distance2D,
  quaternionToEuler,
  normalizeQuaternion,
  boundingBox,
  boundingSphere,
  boxesOverlap,
  distanceBetweenBoxes,
  distanceToBox,
  offsetPosition,
  namedResult,
  measurement,
  directionResult,
  orientationResult,
  boundsResult,
  collisionResult,
  aabbResult
} from '../spatial-primitives.js';

// ---------------------------------------------------------------------------
// Bảng dữ liệu giải phẫu dùng riêng cho subsystem này
// ---------------------------------------------------------------------------

/**
 * Kích thước hộp bao theo vùng cơ thể.
 *
 * Các vùng đã có trong `BODY_BOX_SIZES` dùng lại đúng bảng chuẩn; các vùng
 * riêng của thân dưới (bụng, ngực, cổ chân, ngón chân…) bổ sung từ
 * `BODY_DIMENSIONS`.
 */
const REGION_SIZES: Readonly<Record<string, Vec3D>> = {
  heldObject: BODY_BOX_SIZES.heldObject,
  torso: BODY_BOX_SIZES.torso,
  pelvis: BODY_BOX_SIZES.pelvis,
  hip: BODY_BOX_SIZES.pelvis,
  thigh: BODY_BOX_SIZES.thigh,
  knee: BODY_BOX_SIZES.knee,
  shin: BODY_BOX_SIZES.shin,
  foot: BODY_BOX_SIZES.foot,
  leg: { x: 0.17, y: 0.85, z: 0.17 },
  abdomen: { x: 0.32, y: 0.24, z: 0.2 },
  chest: { x: 0.34, y: 0.2, z: 0.22 },
  ankle: { x: 0.08, y: 0.08, z: 0.08 },
  toe: { x: 0.09, y: 0.05, z: 0.08 },
  spine: { x: 0.12, y: 0.5, z: 0.1 },
  ribcage: { x: 0.3, y: 0.22, z: 0.2 },
  sternum: { x: 0.06, y: 0.24, z: 0.04 },
  navel: { x: 0.04, y: 0.04, z: 0.04 },
  sacrum: { x: 0.12, y: 0.1, z: 0.08 },
  tailbone: { x: 0.06, y: 0.08, z: 0.06 }
};

/**
 * Offset giải phẫu của các mốc **không** có sẵn trong `LEG_LANDMARKS`.
 *
 * Quy tắc dẫn xuất: lấy vùng cơ thể làm gốc, rồi áp dụng biến thiên theo
 * phía (trái ⇒ −X, phải ⇒ +X) và theo chiều (trên ⇒ +Y, đáy/gót ⇒ −Y,
 * trước/mũi ⇒ +Z). Các mốc chung (hông, đầu gối, bàn chân…) lấy nguyên vẹn
 * từ `bodyOffset()`.
 */
const LANDMARK_OFFSETS: Readonly<Record<string, Vec3D>> = {
  // --- Vật thể đang cầm: neo tại `entity.position`, kích thước 0.15³ ---
  getHeldObjectPosition: { x: 0, y: 0, z: 0 }, // neo vật thể
  getHeldObjectCenter: { x: 0, y: 0, z: 0 }, // tâm vật thể
  getHeldObjectWorldPosition: { x: 0, y: 0, z: 0 }, // toạ độ thế giới
  getHeldObjectLocalPosition: { x: 0, y: 0, z: 0 }, // toạ độ cục bộ
  getHeldObjectAnchor: { x: 0, y: 0, z: 0 }, // điểm neo
  getHeldObjectPivot: { x: 0, y: 0, z: 0 }, // điểm xoay
  getHeldObjectTipPosition: { x: 0, y: 0, z: 0.075 }, // đầu vật thể: +Z
  getHeldObjectBasePosition: { x: 0, y: 0, z: -0.075 }, // đáy vật thể: −Z
  getHeldObjectFrontPosition: { x: 0, y: 0, z: 0.075 }, // mặt trước: +Z
  getHeldObjectBackPosition: { x: 0, y: 0, z: -0.075 }, // mặt sau: −Z
  getHeldObjectLeftPosition: { x: -0.075, y: 0, z: 0 }, // bên trái: −X
  getHeldObjectRightPosition: { x: 0.075, y: 0, z: 0 }, // bên phải: +X
  getHeldObjectUpPosition: { x: 0, y: 0.075, z: 0 }, // phía trên: +Y
  getHeldObjectDownPosition: { x: 0, y: -0.075, z: 0 }, // phía dưới: −Y

  // --- Thân ---
  getTorsoTopPosition: { x: 0, y: 0.55, z: 0 }, // đỉnh thân: +Y
  getTorsoBottomPosition: { x: 0, y: 0, z: 0 }, // đáy thân: −Y
  getTorsoFrontPosition: { x: 0, y: 0.275, z: 0.11 }, // trước: +Z
  getTorsoBackPosition: { x: 0, y: 0.275, z: -0.11 }, // sau: −Z
  getTorsoLeftPosition: { x: -0.18, y: 0.275, z: 0 }, // trái: −X
  getTorsoRightPosition: { x: 0.18, y: 0.275, z: 0 }, // phải: +X

  // --- Ngực & lồng ngực ---
  getChestPosition: { x: 0, y: 0.3, z: 0 }, // gốc ngực
  getChestCenter: { x: 0, y: 0.38, z: 0 }, // tâm ngực
  getChestFrontPosition: { x: 0, y: 0.38, z: 0.11 }, // trước: +Z
  getChestBackPosition: { x: 0, y: 0.38, z: -0.11 }, // sau: −Z
  getRibcageCenter: { x: 0, y: 0.3, z: 0 }, // tâm lồng ngực
  getSternumPosition: { x: 0, y: 0.28, z: 0.1 }, // xương ức: phía trước (+Z)

  // --- Cột sống ---
  getUpperSpinePosition: { x: 0, y: 0.42, z: 0 }, // đoạn trên: +Y
  getMiddleSpinePosition: { x: 0, y: 0.28, z: 0 }, // đoạn giữa
  getLowerSpinePosition: { x: 0, y: 0.12, z: 0 }, // đoạn dưới: −Y

  // --- Bụng ---
  getAbdomenPosition: { x: 0, y: 0.14, z: 0 }, // tâm bụng
  getAbdomenCenter: { x: 0, y: 0.14, z: 0 }, // tâm bụng
  getUpperAbdomenPosition: { x: 0, y: 0.22, z: 0 }, // bụng trên: +Y
  getLowerAbdomenPosition: { x: 0, y: 0.07, z: 0 }, // bụng dưới: −Y
  getNavelPosition: { x: 0, y: 0.14, z: 0.1 }, // rốn: phía trước (+Z)

  // --- Xương chậu & hông ---
  getPelvisCenter: { x: 0, y: 0, z: 0 }, // tâm xương chậu
  getPelvisFrontPosition: { x: 0, y: 0, z: 0.1 }, // trước: +Z
  getPelvisBackPosition: { x: 0, y: 0, z: -0.1 }, // sau: −Z
  getHipJointPosition: { x: -0.09, y: 0, z: 0 }, // khớp hông bên trái: −X
  getSacrumPosition: { x: 0, y: -0.04, z: -0.08 }, // xương cùng: sau (−Z) + dưới (−Y)
  getTailbonePosition: { x: 0, y: -0.12, z: -0.1 }, // đuôi cụt: sau (−Z) + dưới (−Y)

  // --- Chân & đùi ---
  getLeftLegPosition: { x: -0.09, y: 0, z: 0 }, // gốc chân trái tại hông
  getRightLegPosition: { x: 0.09, y: 0, z: 0 }, // gốc chân phải
  getLeftLegCenter: { x: -0.09, y: -0.425, z: 0 }, // giữa đùi + cẳng
  getRightLegCenter: { x: 0.09, y: -0.425, z: 0 },
  getLeftThighCenter: { x: -0.09, y: -0.215, z: 0 }, // giữa đùi
  getRightThighCenter: { x: 0.09, y: -0.215, z: 0 },
  getLeftThighStart: { x: -0.09, y: 0, z: 0 }, // đầu gần (hông): +Y
  getRightThighStart: { x: 0.09, y: 0, z: 0 },
  getLeftThighEnd: { x: -0.09, y: -0.43, z: 0 }, // đầu xa (đầu gối): −Y
  getRightThighEnd: { x: 0.09, y: -0.43, z: 0 },

  // --- Đầu gối ---
  getLeftKneeCenter: { x: -0.09, y: -0.43, z: 0 }, // tâm khớp gối
  getRightKneeCenter: { x: 0.09, y: -0.43, z: 0 },
  getLeftKneeCapPosition: { x: -0.09, y: -0.43, z: 0.06 }, // xương ống chày: trước (+Z)
  getRightKneeCapPosition: { x: 0.09, y: -0.43, z: 0.06 },

  // --- Cẳng chân ---
  getLeftShinCenter: { x: -0.09, y: -0.64, z: 0 }, // giữa cẳng
  getRightShinCenter: { x: 0.09, y: -0.64, z: 0 },
  getLeftShinStart: { x: -0.09, y: -0.43, z: 0 }, // đầu gần (gối)
  getRightShinStart: { x: 0.09, y: -0.43, z: 0 },
  getLeftShinEnd: { x: -0.09, y: -0.85, z: 0 }, // đầu xa (mắt cá)
  getRightShinEnd: { x: 0.09, y: -0.85, z: 0 },

  // --- Cổ chân & bàn chân ---
  getLeftAnkleCenter: { x: -0.09, y: -0.85, z: 0 }, // tâm khớp cổ chân
  getRightAnkleCenter: { x: 0.09, y: -0.85, z: 0 },
  getLeftHeelPosition: { x: -0.09, y: -0.89, z: -0.08 }, // gót chân: −Y + −Z
  getRightHeelPosition: { x: 0.09, y: -0.89, z: -0.08 },
  getLeftFootCenter: { x: -0.09, y: -0.89, z: 0.04 }, // tâm bàn chân
  getRightFootCenter: { x: 0.09, y: -0.89, z: 0.04 },
  getFootToePosition: { x: -0.09, y: -0.89, z: 0.13 }, // mũi chân: +Z
  getFootHeelPosition: { x: -0.09, y: -0.89, z: -0.08 }, // gót chân: −Z
  getFootArchPosition: { x: -0.09, y: -0.93, z: 0.02 }, // vòm chân: −Y
  getFootSolePosition: { x: -0.09, y: -0.93, z: 0.04 }, // đáy bàn chân: −Y
  getFootTopPosition: { x: -0.09, y: -0.85, z: 0.04 }, // mu bàn chân: +Y
  getFootInnerEdge: { x: -0.04, y: -0.89, z: 0.04 }, // mép trong (về trục giữa): +X
  getFootOuterEdge: { x: -0.14, y: -0.89, z: 0.04 }, // mép ngoài: −X

  // --- Ngón chân (bàn chân chung là bên trái, ngón cái sát trục giữa) ---
  getBigToePosition: { x: -0.055, y: -0.89, z: 0.11 }, // ngón cái: +X
  getSecondToePosition: { x: -0.078, y: -0.89, z: 0.12 },
  getThirdToePosition: { x: -0.096, y: -0.89, z: 0.12 },
  getFourthToePosition: { x: -0.114, y: -0.89, z: 0.115 },
  getLittleToePosition: { x: -0.13, y: -0.89, z: 0.105 },
  getToeTipPosition: { x: -0.09, y: -0.89, z: 0.135 }, // đầu mũi chân: +Z
  getToeBasePosition: { x: -0.09, y: -0.89, z: 0.075 }, // gốc ngón: −Z
  getToeJointPosition: { x: -0.09, y: -0.885, z: 0.105 }, // khớp ngón chân
  getToeNailPosition: { x: -0.09, y: -0.875, z: 0.125 } // móng chân: trên + trước
};

/**
 * Hằng số mô hình cho người trưởng thành cao 1.75 m, khối lượng 72 kg.
 *
 * Dùng cho các đại lượng không có dữ liệu động (tốc độ đi bộ, chu kỳ bước,
 * lực phản lực mặt đất…).
 */
const REFERENCE = {
  bodyMass: 72,
  walkingSpeed: 1.4,
  runningSpeed: 3.5,
  strideRatio: 0.78,
  stepHeight: 0.05,
  gravity: 9.81
} as const;

/**
 * Mốc dùng cho các phép đo khoảng cách giữa hai mốc (khung hông, đơn vị mét).
 *
 * Các mốc nằm ngoài thân dưới (đầu, vai, tay, cổ tay, camera, mục tiêu) được
 * đặt theo cùng khung hông: hông ở gốc, thân đi lên +Y, chi đi xuống −Y.
 */
const PAIR_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  hip: { x: 0, y: 0, z: 0 },
  pelvis: { x: 0, y: 0, z: 0 },
  thigh: { x: -0.09, y: -0.215, z: 0 },
  knee: { x: -0.09, y: -0.43, z: 0 },
  shin: { x: -0.09, y: -0.64, z: 0 },
  ankle: { x: -0.09, y: -0.85, z: 0 },
  foot: { x: -0.09, y: -0.89, z: 0.04 },
  toe: { x: -0.09, y: -0.89, z: 0.135 },
  torso: { x: 0, y: 0.275, z: 0 },
  chest: { x: 0, y: 0.38, z: 0 },
  head: { x: 0, y: 0.665, z: 0 },
  shoulder: { x: 0, y: 0.55, z: 0 },
  hand: { x: -0.2, y: -0.07, z: 0 },
  wrist: { x: -0.2, y: -0.01, z: 0 },
  elbow: { x: -0.2, y: 0.25, z: 0 },
  camera: { x: 0, y: 1.6, z: 0 },
  target: { x: 0, y: 1.2, z: 1 }
};

// ---------------------------------------------------------------------------
// Hàm tiện ích cấp module
// ---------------------------------------------------------------------------

/** Đọc một điểm từ nhiều dạng dữ liệu (entity, object thường, mảng). */
function pointOf(value: unknown): Vec3D {
  if (Array.isArray(value)) return value.length > 0 ? toVec3(value[0]) : { x: 0, y: 0, z: 0 };
  return entityPosition(value);
}

/** Đọc quaternion từ nhiều dạng (quaternion, Euler `rotation`, kết quả bọc sẵn). */
function asQuaternion(value: unknown): QuatD {
  if (!value || typeof value !== 'object') return { ...IDENTITY_QUAT };
  const v = value as Record<string, unknown>;
  if (typeof v.w === 'number') return { x: num(v.x), y: num(v.y), z: num(v.z), w: num(v.w, 1) };
  if (v.orientation && typeof v.orientation === 'object') return asQuaternion(v.orientation);
  if (v.quaternion) return asQuaternion(v.quaternion);
  if (v.rotation && typeof v.rotation === 'object') return entityQuaternion({ rotation: v.rotation });
  return { ...IDENTITY_QUAT };
}

/** Đối số có phải entity (có `position`) hay không. */
function isAnchored(value: unknown): boolean {
  return !!value && typeof value === 'object' && 'position' in (value as Record<string, unknown>);
}

/** Kết quả hình cầu bao — giữ shape `{ center, radius }` tương thích API cũ. */
function sphereResult(name: string, center: Vec3D, radius: number): Record<string, unknown> {
  return {
    name,
    valid: true,
    center: { ...center },
    radius: Math.max(0, radius),
    timestamp: Date.now()
  };
}

/** Kết quả capsule bao — giữ shape `{ start, end, radius }` tương thích API cũ. */
function capsuleResult(name: string, center: Vec3D, height: number, radius: number): Record<string, unknown> {
  return {
    name,
    valid: true,
    start: { x: center.x, y: center.y - height * 0.5, z: center.z },
    end: { x: center.x, y: center.y + height * 0.5, z: center.z },
    radius: Math.max(0, radius),
    timestamp: Date.now()
  };
}

export class AnatomicalLowerBodySubsystem {
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
  // 14. Tọa độ vật thể cầm trên tay
  // ==========================================================================

  /**
   * [0601] getHeldObjectPosition
   * Lấy tọa độ vật thể đang cầm.
   */
  public getHeldObjectPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectPosition', entity, offset);
    return p;
  }
  /**
   * [0602] getHeldObjectCenter
   * Lấy tâm vật thể đang cầm.
   */
  public getHeldObjectCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectCenter', entity, offset);
    return p;
  }
  /**
   * [0603] getHeldObjectRotation
   * Lấy góc quay vật thể đang cầm.
   */
  public getHeldObjectRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['heldobject', 'hand', 'object']);
    return this.orientation('getHeldObjectRotation', found.q, { bone: found.bone });
  }
  /**
   * [0604] getHeldObjectScale
   * Lấy tỷ lệ kích thước vật thể đang cầm.
   */
  public getHeldObjectScale(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const size = this.heldObjectSize(subject);
    const value = Math.max(size.x, size.y, size.z) / REGION_SIZES.heldObject.x;
    return this.measureWith('getHeldObjectScale', value, 'scale', options, { size });
  }
  /**
   * [0605] getHeldObjectWorldPosition
   * Lấy tọa độ thế giới của vật thể đang cầm.
   */
  public getHeldObjectWorldPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectWorldPosition', entity, offset);
    return p;
  }
  /**
   * [0606] getHeldObjectLocalPosition
   * Lấy tọa độ cục bộ của vật thể đang cầm.
   */
  public getHeldObjectLocalPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectLocalPosition', entity, offset);
    return p;
  }
  /**
   * [0607] getHeldObjectAnchor
   * Lấy điểm neo vật thể đang cầm.
   */
  public getHeldObjectAnchor(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectAnchor', entity, offset);
    return p;
  }
  /**
   * [0608] getHeldObjectPivot
   * Lấy điểm xoay vật thể đang cầm.
   */
  public getHeldObjectPivot(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectPivot', entity, offset);
    return p;
  }
  /**
   * [0609] getHeldObjectGripPoint
   * Lấy điểm nắm vật thể.
   */
  public getHeldObjectGripPoint(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const hand = this.isPoint(b) ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const grip = lerpVec3(object, hand, 0.5);
    return this.pointWith(grip, a, options);
  }
  /**
   * [0610] getHeldObjectContactPoint
   * Lấy điểm tiếp xúc vật thể.
   */
  public getHeldObjectContactPoint(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const other = this.isPoint(b) ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const delta = subtract(other, object);
    const length = magnitude(delta);
    const dir = length > 1e-6 ? scale(delta, 1 / length) : { x: 0, y: 1, z: 0 };
    const reach = Math.min(REGION_SIZES.heldObject.x * 0.5, length) * this.optScale(options);
    return this.pointWith(add(object, scale(dir, reach)), a, options);
  }
  /**
   * [0611] getHeldObjectTipPosition
   * Lấy tọa độ đầu vật thể.
   */
  public getHeldObjectTipPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectTipPosition', entity, offset);
    return p;
  }
  /**
   * [0612] getHeldObjectBasePosition
   * Lấy tọa độ đáy vật thể.
   */
  public getHeldObjectBasePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectBasePosition', entity, offset);
    return p;
  }
  /**
   * [0613] getHeldObjectFrontPosition
   * Lấy tọa độ mặt trước vật thể.
   */
  public getHeldObjectFrontPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectFrontPosition', entity, offset);
    return p;
  }
  /**
   * [0614] getHeldObjectBackPosition
   * Lấy tọa độ mặt sau vật thể.
   */
  public getHeldObjectBackPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectBackPosition', entity, offset);
    return p;
  }
  /**
   * [0615] getHeldObjectLeftPosition
   * Lấy tọa độ bên trái vật thể.
   */
  public getHeldObjectLeftPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectLeftPosition', entity, offset);
    return p;
  }
  /**
   * [0616] getHeldObjectRightPosition
   * Lấy tọa độ bên phải vật thể.
   */
  public getHeldObjectRightPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectRightPosition', entity, offset);
    return p;
  }
  /**
   * [0617] getHeldObjectUpPosition
   * Lấy tọa độ phía trên vật thể.
   */
  public getHeldObjectUpPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectUpPosition', entity, offset);
    return p;
  }
  /**
   * [0618] getHeldObjectDownPosition
   * Lấy tọa độ phía dưới vật thể.
   */
  public getHeldObjectDownPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHeldObjectDownPosition', entity, offset);
    return p;
  }
  /**
   * [0619] calculateHeldObjectLength
   * Tính chiều dài vật thể đang cầm.
   */
  public calculateHeldObjectLength(entity?: any, options?: any): any {
    const size = this.heldObjectSize(this.optEntity(options, entity));
    return this.measureWith('calculateHeldObjectLength', Math.max(size.x, size.y, size.z), 'm', options, { size });
  }
  /**
   * [0620] calculateHeldObjectWidth
   * Tính chiều rộng vật thể đang cầm.
   */
  public calculateHeldObjectWidth(entity?: any, options?: any): any {
    const size = this.heldObjectSize(this.optEntity(options, entity));
    return this.measureWith('calculateHeldObjectWidth', size.x, 'm', options, { size });
  }
  /**
   * [0621] calculateHeldObjectHeight
   * Tính chiều cao vật thể đang cầm.
   */
  public calculateHeldObjectHeight(entity?: any, options?: any): any {
    const size = this.heldObjectSize(this.optEntity(options, entity));
    return this.measureWith('calculateHeldObjectHeight', size.y, 'm', options, { size });
  }
  /**
   * [0622] calculateHeldObjectVolume
   * Tính thể tích vật thể đang cầm.
   */
  public calculateHeldObjectVolume(entity?: any, options?: any): any {
    const size = this.heldObjectSize(this.optEntity(options, entity));
    return this.measureWith('calculateHeldObjectVolume', size.x * size.y * size.z, 'm^3', options, { size });
  }
  /**
   * [0623] calculateHeldObjectSurfaceArea
   * Tính diện tích bề mặt vật thể.
   */
  public calculateHeldObjectSurfaceArea(entity?: any, options?: any): any {
    const size = this.heldObjectSize(this.optEntity(options, entity));
    const area = 2 * (size.x * size.y + size.x * size.z + size.y * size.z);
    return this.measureWith('calculateHeldObjectSurfaceArea', area, 'm^2', options, { size });
  }
  /**
   * [0624] calculateHeldObjectMass
   * Tính khối lượng vật thể.
   */
  public calculateHeldObjectMass(entity?: any, options?: any): any {
    const size = this.heldObjectSize(entity);
    const density = num(options?.density, 1000);
    const mass = size.x * size.y * size.z * density;
    return this.measure('calculateHeldObjectMass', mass, 'kg', { density, size });
  }
  /**
   * [0625] calculateHeldObjectCenterOfMass
   * Tính tâm khối lượng vật thể.
   */
  public calculateHeldObjectCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const size = scale(this.heldObjectSize(subject), this.optScale(options));
    const center = add(entityPosition(subject), { x: 0, y: 0, z: 0 });
    const point = this.pointWith(center, subject, options);
    return { ...namedResult('calculateHeldObjectCenterOfMass', point, { size }), center: point, position: point };
  }
  /**
   * [0626] calculateHeldObjectInertiaTensor
   * Tính tensor quán tính vật thể.
   */
  public calculateHeldObjectInertiaTensor(a?: any, b?: any, options?: any): any {
    const subject = this.optEntity(options, a);
    const size = this.heldObjectSize(subject);
    const mass = size.x * size.y * size.z * num(options?.density, 1000);
    const k = mass / 12;
    const tensor = {
    xx: k * (size.y * size.y + size.z * size.z),
    yy: k * (size.x * size.x + size.z * size.z),
    zz: k * (size.x * size.x + size.y * size.y),
    xy: 0,
    xz: 0,
    yz: 0
    };
    // Định lý trục song song: `b` là khoảng cách tâm khối so với neo ⇒ cộng m·d².
    const offset = this.markerFrom(b, [], 'getHeldObjectCenter');
    if (offset) {
    tensor.xx += mass * (offset.y * offset.y + offset.z * offset.z);
    tensor.yy += mass * (offset.x * offset.x + offset.z * offset.z);
    tensor.zz += mass * (offset.x * offset.x + offset.y * offset.y);
    }
    const factor = this.optScale(options);
    const scaled = {
    xx: tensor.xx * factor,
    yy: tensor.yy * factor,
    zz: tensor.zz * factor,
    xy: tensor.xy,
    xz: tensor.xz,
    yz: tensor.yz
    };
    const inverted = this.optInvert(options)
    ? { xx: -scaled.xx, yy: -scaled.yy, zz: -scaled.zz, xy: scaled.xy, xz: scaled.xz, yz: scaled.yz }
    : scaled;
    return namedResult('calculateHeldObjectInertiaTensor', inverted, { mass, size });
  }
  /**
   * [0627] calculateHeldObjectBoundingBox
   * Tính hộp bao vật thể.
   */
  public calculateHeldObjectBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('heldObject', entity, size);
    return boundsResult('calculateHeldObjectBoundingBox', box);
  }
  /**
   * [0628] calculateHeldObjectBoundingSphere
   * Tính hình cầu bao vật thể.
   */
  public calculateHeldObjectBoundingSphere(entity?: any, radius = 1.0): any {
    const regionSize = this.regionSize('heldObject');
    return sphereResult('calculateHeldObjectBoundingSphere', entityPosition(entity), this.autoRadius(radius, regionSize));
  }
  /**
   * [0629] calculateHeldObjectBoundingCapsule
   * Tính capsule bao vật thể.
   */
  public calculateHeldObjectBoundingCapsule(entity?: any, height = 2.0, radius = 0.5): any {
    const regionSize = this.regionSize('heldObject');
    const capsuleHeight = this.autoValue(height, 2.0, regionSize.y);
    const capsuleRadius = this.autoValue(radius, 0.5, Math.min(regionSize.x, regionSize.z) * 0.5);
    return capsuleResult('calculateHeldObjectBoundingCapsule', entityPosition(entity), capsuleHeight, capsuleRadius);
  }
  /**
   * [0630] calculateHeldObjectBoundingCylinder
   * Tính hình trụ bao vật thể.
   */
  public calculateHeldObjectBoundingCylinder(a?: any, b?: any, options?: any): any {
    const subject = this.optEntity(options, a);
    const regionSize = this.regionSize('heldObject');
    const factor = this.optScale(options);
    // `b` là điểm đối diện ⇒ trục bao chạy giữa hai điểm.
    const other = this.landmarkFrom(b, 'getHeldObjectBasePosition');
    const center = other
    ? { x: (entityPosition(subject).x + other.x) * 0.5, y: (entityPosition(subject).y + other.y) * 0.5, z: (entityPosition(subject).z + other.z) * 0.5 }
    : entityPosition(subject);
    const height = other ? distance3D(entityPosition(subject), other) : regionSize.y;
    const cylinder = {
    center: this.pointWith(center, subject, options),
    radius: Math.min(regionSize.x, regionSize.z) * 0.5 * factor,
    height: height * factor
    };
    return namedResult('calculateHeldObjectBoundingCylinder', cylinder, { size: regionSize });
  }
  /**
   * [0631] calculateHeldObjectDistanceToHand
   * Tính khoảng cách vật thể đến bàn tay.
   */
  public calculateHeldObjectDistanceToHand(a?: any, b?: any): any {
    return this.measure('calculateHeldObjectDistanceToHand', this.heldObjectDistance(a, b, 'hand'), 'm');
  }
  /**
   * [0632] calculateHeldObjectDistanceToWrist
   * Tính khoảng cách vật thể đến cổ tay.
   */
  public calculateHeldObjectDistanceToWrist(a?: any, b?: any): any {
    return this.measure('calculateHeldObjectDistanceToWrist', this.heldObjectDistance(a, b, 'wrist'), 'm');
  }
  /**
   * [0633] calculateHeldObjectDistanceToCamera
   * Tính khoảng cách vật thể đến camera.
   */
  public calculateHeldObjectDistanceToCamera(a?: any, b?: any): any {
    return this.measure('calculateHeldObjectDistanceToCamera', this.heldObjectDistance(a, b, 'camera'), 'm');
  }
  /**
   * [0634] calculateHeldObjectDistanceToTarget
   * Tính khoảng cách vật thể đến mục tiêu.
   */
  public calculateHeldObjectDistanceToTarget(a?: any, b?: any): any {
    return this.measure('calculateHeldObjectDistanceToTarget', this.heldObjectDistance(a, b, 'target'), 'm');
  }
  /**
   * [0635] calculateHeldObjectGripAlignment
   * Tính độ thẳng hàng giữa tay và điểm nắm.
   */
  public calculateHeldObjectGripAlignment(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const hand = this.isPoint(b) ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const gripDirection = normalize(subtract(object, hand));
    const handAxis = normalize(subtract(PAIR_LANDMARKS.wrist, PAIR_LANDMARKS.hand));
    const alignment = clamp01(dot(gripDirection, handAxis));
    const angle = Math.acos(clamp(dot(gripDirection, handAxis), -1, 1));
    const payload = this.applyOptions(
    { alignment, angle, distance: distance3D(object, hand) },
    options,
    { numeric: ['alignment', 'angle', 'distance'] },
    a,
    );
    return namedResult('calculateHeldObjectGripAlignment', payload, { object, hand });
  }
  /**
   * [0636] calculateHeldObjectGripOffset
   * Tính độ lệch điểm nắm.
   */
  public calculateHeldObjectGripOffset(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const hand = this.isPoint(b) ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const offset = subtract(object, hand);
    const payload = this.applyOptions(
    { offset, distance: magnitude(offset) },
    options,
    { numeric: ['distance'], vectors: ['offset'] },
    a,
    );
    return namedResult('calculateHeldObjectGripOffset', payload, { object, hand });
  }
  /**
   * [0637] calculateHeldObjectGripRotation
   * Tính góc xoay khi cầm.
   */
  public calculateHeldObjectGripRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['hand', 'wrist']);
    return this.orientation('calculateHeldObjectGripRotation', found.q, { bone: found.bone });
  }
  /**
   * [0638] calculateHeldObjectGripStability
   * Tính độ ổn định khi cầm.
   */
  public calculateHeldObjectGripStability(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const hand = this.isPoint(b) ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const offset = subtract(object, hand);
    const factor = this.optScale(options);
    const distance = magnitude(offset);
    // Ổn định tính trên khoảng cách đã nhân ⇒ `options.scale` tác động thật.
    const stability = clamp01(1 - (distance * factor) / (REGION_SIZES.heldObject.x * 2));
    const payload = this.applyOptions(
    { stability, distance, offset },
    options,
    { numeric: ['distance'], vectors: ['offset'], invertOnly: ['stability'] },
    a,
    );
    return namedResult('calculateHeldObjectGripStability', payload, { object, hand });
  }
  /**
   * [0639] calculateHeldObjectHandPose
   * Tính tư thế bàn tay khi cầm.
   */
  public calculateHeldObjectHandPose(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const hand = b !== undefined && b !== null ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const found = this.boneQuaternion(options?.hand ?? options, options, ['hand']);
    const pose = {
    position: hand,
    rotation: found.q,
    grip: lerpVec3(object, hand, 0.5),
    object: object
    };
    return namedResult('calculateHeldObjectHandPose', pose, { bone: found.bone });
  }
  /**
   * [0640] calculateHeldObjectFingerContact
   * Tính tiếp xúc giữa ngón tay và vật thể.
   */
  public calculateHeldObjectFingerContact(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const hand = this.isPoint(b) ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const regionSize = this.regionSize('heldObject');
    const factor = this.optScale(options);
    const fingers = ['thumb', 'index', 'middle', 'ring', 'little'];
    const contacts = fingers.map((finger, i) => {
    const contact = add(object, { x: (i - 2) * regionSize.x * 0.2 * factor, y: regionSize.y * 0.25 * factor, z: 0 });
    return {
    finger: finger,
    contact: contact,
    depth: Math.max(0, magnitude(subtract(contact, hand)) - regionSize.x * 0.5)
    };
    });
    return namedResult('calculateHeldObjectFingerContact', { contacts: contacts, contactCount: contacts.length }, { object, hand });
  }
  /**
   * [0641] calculateHeldObjectCollision
   * Kiểm tra va chạm vật thể đang cầm.
   */
  public calculateHeldObjectCollision(a?: any, b?: any): any {
    const boxA = this.regionBox('heldObject', a);
    const boxB = this.regionBox('heldObject', b);
    return aabbResult('calculateHeldObjectCollision', boxA, boxB);
  }
  /**
   * [0642] calculateHeldObjectPenetrationDepth
   * Tính độ xuyên lấn khi va chạm.
   */
  public calculateHeldObjectPenetrationDepth(entity?: any, options?: any): any {
    const box = this.regionBox('heldObject', entity);
    const ground = num(options?.groundY, 0);
    const depth = Math.max(0, ground - box.min.y);
    return this.measure('calculateHeldObjectPenetrationDepth', depth, 'm', { ground });
  }
  /**
   * [0643] calculateHeldObjectVelocity
   * Tính vận tốc vật thể đang cầm.
   */
  public calculateHeldObjectVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateHeldObjectVelocity', velocity);
  }
  /**
   * [0644] calculateHeldObjectAcceleration
   * Tính gia tốc vật thể đang cầm.
   */
  public calculateHeldObjectAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateHeldObjectAcceleration', acceleration);
  }
  /**
   * [0645] calculateHeldObjectAngularVelocity
   * Tính vận tốc góc vật thể.
   */
  public calculateHeldObjectAngularVelocity(entity?: any, dt = 0.016): any {
    const angular = this.angularVelocityFrom(entity, dt);
    return this.vector('calculateHeldObjectAngularVelocity', angular);
  }
  /**
   * [0646] calculateHeldObjectAngularAcceleration
   * Tính gia tốc góc vật thể.
   */
  public calculateHeldObjectAngularAcceleration(entity?: any, dt = 0.016): any {
    const angular = this.angularAccelerationFrom(entity, dt);
    return this.vector('calculateHeldObjectAngularAcceleration', angular);
  }
  /**
   * [0647] calculateHeldObjectTrajectory
   * Tính quỹ đạo vật thể đang cầm.
   */
  public calculateHeldObjectTrajectory(a?: any, b?: any, options?: any): any {
    const start = pointOf(a);
    const end = b !== undefined && b !== null ? pointOf(b) : add(start, scale(entityForward(a), 1));
    const steps = Math.max(2, Math.round(num(options?.steps, 16)));
    const points: Vec3D[] = [];
    for (let i = 0; i <= steps; i++) points.push(lerpVec3(start, end, i / steps));
    return namedResult('calculateHeldObjectTrajectory', { points: points, start: start, end: end }, { duration: num(options?.duration, 1), steps: steps });
  }
  /**
   * [0648] calculateHeldObjectThrowVelocity
   * Tính vận tốc ném vật thể.
   */
  public calculateHeldObjectThrowVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    const speed = magnitude(velocity) > 1e-6 ? magnitude(velocity) * 1.5 : 6;
    const direction = magnitude(velocity) > 1e-6 ? normalize(velocity) : scale(entityForward(entity), 1);
    return this.vector('calculateHeldObjectThrowVelocity', scale(direction, speed));
  }
  /**
   * [0649] calculateHeldObjectReleasePosition
   * Tính vị trí thả vật thể.
   */
  public calculateHeldObjectReleasePosition(a?: any, b?: any, options?: any): any {
    const object = pointOf(a);
    const hand = this.isPoint(b) ? pointOf(b) : add(object, PAIR_LANDMARKS.hand);
    const away = normalize(subtract(object, hand));
    const release = this.pointWith(add(object, scale(away, REGION_SIZES.heldObject.x * 0.5 * this.optScale(options))), a, options);
    return { ...namedResult('calculateHeldObjectReleasePosition', release), position: release, release: release };
  }
  /**
   * [0650] calculateHeldObjectReleaseRotation
   * Tính góc quay lúc thả vật thể.
   */
  public calculateHeldObjectReleaseRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['hand', 'wrist']);
    return this.orientation('calculateHeldObjectReleaseRotation', found.q, { bone: found.bone });
  }
  // ==========================================================================
  // 15. Tọa độ thân và ngực
  // ==========================================================================

  /**
   * [0651] getTorsoPosition
   * Lấy tọa độ thân.
   */
  public getTorsoPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoPosition', entity, offset);
    return p;
  }
  /**
   * [0652] getTorsoCenter
   * Lấy tâm thân.
   */
  public getTorsoCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoCenter', entity, offset);
    return p;
  }
  /**
   * [0653] getTorsoTopPosition
   * Lấy tọa độ đỉnh thân.
   */
  public getTorsoTopPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoTopPosition', entity, offset);
    return p;
  }
  /**
   * [0654] getTorsoBottomPosition
   * Lấy tọa độ đáy thân.
   */
  public getTorsoBottomPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoBottomPosition', entity, offset);
    return p;
  }
  /**
   * [0655] getTorsoFrontPosition
   * Lấy tọa độ mặt trước thân.
   */
  public getTorsoFrontPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoFrontPosition', entity, offset);
    return p;
  }
  /**
   * [0656] getTorsoBackPosition
   * Lấy tọa độ mặt sau thân.
   */
  public getTorsoBackPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoBackPosition', entity, offset);
    return p;
  }
  /**
   * [0657] getTorsoLeftPosition
   * Lấy tọa độ bên trái thân.
   */
  public getTorsoLeftPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoLeftPosition', entity, offset);
    return p;
  }
  /**
   * [0658] getTorsoRightPosition
   * Lấy tọa độ bên phải thân.
   */
  public getTorsoRightPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTorsoRightPosition', entity, offset);
    return p;
  }
  /**
   * [0659] getChestPosition
   * Lấy tọa độ ngực.
   */
  public getChestPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getChestPosition', entity, offset);
    return p;
  }
  /**
   * [0660] getChestCenter
   * Lấy tâm ngực.
   */
  public getChestCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getChestCenter', entity, offset);
    return p;
  }
  /**
   * [0661] getChestFrontPosition
   * Lấy tọa độ phía trước ngực.
   */
  public getChestFrontPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getChestFrontPosition', entity, offset);
    return p;
  }
  /**
   * [0662] getChestBackPosition
   * Lấy tọa độ phía sau ngực.
   */
  public getChestBackPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getChestBackPosition', entity, offset);
    return p;
  }
  /**
   * [0663] getRibcageCenter
   * Lấy tâm lồng ngực.
   */
  public getRibcageCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRibcageCenter', entity, offset);
    return p;
  }
  /**
   * [0664] getSternumPosition
   * Lấy tọa độ xương ức.
   */
  public getSternumPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getSternumPosition', entity, offset);
    return p;
  }
  /**
   * [0665] getSpinePosition
   * Lấy tọa độ cột sống.
   */
  public getSpinePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getSpinePosition', entity, offset);
    return p;
  }
  /**
   * [0666] getUpperSpinePosition
   * Lấy tọa độ cột sống trên.
   */
  public getUpperSpinePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getUpperSpinePosition', entity, offset);
    return p;
  }
  /**
   * [0667] getMiddleSpinePosition
   * Lấy tọa độ cột sống giữa.
   */
  public getMiddleSpinePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getMiddleSpinePosition', entity, offset);
    return p;
  }
  /**
   * [0668] getLowerSpinePosition
   * Lấy tọa độ cột sống dưới.
   */
  public getLowerSpinePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLowerSpinePosition', entity, offset);
    return p;
  }
  /**
   * [0669] calculateTorsoLength
   * Tính chiều dài thân.
   */
  public calculateTorsoLength(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'torso');
    const diagonal = Math.hypot(size.x, size.y, size.z);
    return this.measureWith('calculateTorsoLength', diagonal, 'm', options, { size });
  }
  /**
   * [0670] calculateTorsoWidth
   * Tính chiều rộng thân.
   */
  public calculateTorsoWidth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'torso');
    return this.measureWith('calculateTorsoWidth', size.x, 'm', options, { size });
  }
  /**
   * [0671] calculateTorsoHeight
   * Tính chiều cao thân.
   */
  public calculateTorsoHeight(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'torso');
    return this.measureWith('calculateTorsoHeight', size.y, 'm', options, { size });
  }
  /**
   * [0672] calculateTorsoDepth
   * Tính chiều sâu thân.
   */
  public calculateTorsoDepth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'torso');
    return this.measureWith('calculateTorsoDepth', size.z, 'm', options, { size });
  }
  /**
   * [0673] calculateTorsoVolume
   * Tính thể tích thân.
   */
  public calculateTorsoVolume(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'torso');
    return this.measureWith('calculateTorsoVolume', size.x * size.y * size.z, 'm^3', options, { size });
  }
  /**
   * [0674] calculateTorsoSurfaceArea
   * Tính diện tích bề mặt thân.
   */
  public calculateTorsoSurfaceArea(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'torso');
    const area = 2 * (size.x * size.y + size.x * size.z + size.y * size.z);
    return this.measureWith('calculateTorsoSurfaceArea', area, 'm^2', options, { size });
  }
  /**
   * [0675] calculateTorsoBoundingBox
   * Tính hộp bao thân.
   */
  public calculateTorsoBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('torso', entity, size);
    return boundsResult('calculateTorsoBoundingBox', box);
  }
  /**
   * [0676] calculateTorsoBoundingSphere
   * Tính hình cầu bao thân.
   */
  public calculateTorsoBoundingSphere(entity?: any, radius = 1.0): any {
    const size = this.regionSize('torso');
    return sphereResult('calculateTorsoBoundingSphere', entityPosition(entity), this.autoRadius(radius, size));
  }
  /**
   * [0677] calculateTorsoCenterOfMass
   * Tính tâm khối lượng thân.
   */
  public calculateTorsoCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const size = this.regionSizeFor(subject, 'torso');
    const center = this.pointWith(this.centerOfMassPoint(subject, 0, size.y), subject, options);
    return { ...namedResult('calculateTorsoCenterOfMass', center, { size }), center: center, position: center };
  }
  /**
   * [0678] calculateTorsoOrientation
   * Tính hướng thân.
   */
  public calculateTorsoOrientation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['torso', 'spine', 'chest']);
    return this.orientation('calculateTorsoOrientation', found.q, { bone: found.bone });
  }
  /**
   * [0679] calculateTorsoRotation
   * Tính góc quay thân.
   */
  public calculateTorsoRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['torso', 'spine', 'chest']);
    return this.orientation('calculateTorsoRotation', found.q, { bone: found.bone });
  }
  /**
   * [0680] calculateTorsoTilt
   * Tính độ nghiêng thân.
   */
  public calculateTorsoTilt(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    return this.measure('calculateTorsoTilt', e.x, 'rad');
  }
  /**
   * [0681] calculateTorsoTwist
   * Tính góc xoắn thân.
   */
  public calculateTorsoTwist(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    return this.measure('calculateTorsoTwist', e.y, 'rad');
  }
  /**
   * [0682] calculateTorsoBend
   * Tính độ gập thân.
   */
  public calculateTorsoBend(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    return this.measure('calculateTorsoBend', e.z, 'rad');
  }
  /**
   * [0683] calculateTorsoLeanAngle
   * Tính góc nghiêng người.
   */
  public calculateTorsoLeanAngle(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    return this.measure('calculateTorsoLeanAngle', Math.hypot(e.x, e.z), 'rad');
  }
  /**
   * [0684] calculateTorsoFlexion
   * Tính góc gập thân về trước.
   */
  public calculateTorsoFlexion(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    return this.measure('calculateTorsoFlexion', Math.max(0, e.x), 'rad');
  }
  /**
   * [0685] calculateTorsoExtension
   * Tính góc ngả thân về sau.
   */
  public calculateTorsoExtension(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    return this.measure('calculateTorsoExtension', Math.max(0, -e.x), 'rad');
  }
  /**
   * [0686] calculateTorsoLateralBend
   * Tính góc nghiêng thân sang bên.
   */
  public calculateTorsoLateralBend(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    return this.measure('calculateTorsoLateralBend', e.z, 'rad');
  }
  /**
   * [0687] calculateTorsoVelocity
   * Tính vận tốc thân.
   */
  public calculateTorsoVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateTorsoVelocity', velocity);
  }
  /**
   * [0688] calculateTorsoAcceleration
   * Tính gia tốc thân.
   */
  public calculateTorsoAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateTorsoAcceleration', acceleration);
  }
  /**
   * [0689] calculateTorsoAngularVelocity
   * Tính vận tốc góc thân.
   */
  public calculateTorsoAngularVelocity(entity?: any, dt = 0.016): any {
    const angular = this.angularVelocityFrom(entity, dt);
    return this.vector('calculateTorsoAngularVelocity', angular);
  }
  /**
   * [0690] calculateTorsoAngularAcceleration
   * Tính gia tốc góc thân.
   */
  public calculateTorsoAngularAcceleration(entity?: any, dt = 0.016): any {
    const angular = this.angularAccelerationFrom(entity, dt);
    return this.vector('calculateTorsoAngularAcceleration', angular);
  }
  /**
   * [0691] calculateTorsoToHeadDistance
   * Tính khoảng cách thân đến đầu.
   */
  public calculateTorsoToHeadDistance(a?: any, b?: any): any {
    return this.measure('calculateTorsoToHeadDistance', this.pairDistance(a, b, 'torso', 'head'), 'm');
  }
  /**
   * [0692] calculateTorsoToHipDistance
   * Tính khoảng cách thân đến hông.
   */
  public calculateTorsoToHipDistance(a?: any, b?: any): any {
    return this.measure('calculateTorsoToHipDistance', this.pairDistance(a, b, 'torso', 'hip'), 'm');
  }
  /**
   * [0693] calculateTorsoToShoulderDistance
   * Tính khoảng cách thân đến vai.
   */
  public calculateTorsoToShoulderDistance(a?: any, b?: any): any {
    return this.measure('calculateTorsoToShoulderDistance', this.pairDistance(a, b, 'torso', 'shoulder'), 'm');
  }
  /**
   * [0694] calculateTorsoSymmetry
   * Tính độ đối xứng thân.
   */
  public calculateTorsoSymmetry(a?: any, b?: any, options?: any): any {
    const score = this.symmetryScore(a, b, this.regionSizeFor(a, 'torso').x);
    return namedResult('calculateTorsoSymmetry', this.applyOptions(score, options, { numeric: ['symmetry', 'difference'], points: ['left', 'right'] }, a));
  }
  /**
   * [0695] calculateTorsoPoseError
   * Tính sai lệch tư thế thân.
   */
  public calculateTorsoPoseError(a?: any, b?: any, options?: any): any {
    const error = this.poseError(a, b);
    return namedResult('calculateTorsoPoseError', this.applyOptions(error, options, { numeric: ['positionError', 'rotationError'] }, a));
  }
  /**
   * [0696] calculateTorsoMotionSmoothness
   * Tính độ mượt chuyển động thân.
   */
  public calculateTorsoMotionSmoothness(a?: any, b?: any, options?: any): any {
    // `b` là nguồn chuyển động thay thế cho `a`.
    const source = b !== undefined && b !== null ? b : a;
    const smoothness = this.motionSmoothness(source);
    return namedResult('calculateTorsoMotionSmoothness', this.applyOptions(smoothness, options, { numeric: ['jerk', 'acceleration', 'velocity'], invertOnly: ['smoothness'] }, source));
  }
  /**
   * [0697] calculateTorsoSurfaceNormal
   * Tính pháp tuyến bề mặt thân.
   */
  public calculateTorsoSurfaceNormal(a?: any, b?: any): any {
    const normal = this.surfaceNormal(a, b, entityForward(a));
    return this.vector('calculateTorsoSurfaceNormal', normal);
  }
  /**
   * [0698] calculateTorsoCollision
   * Kiểm tra va chạm thân.
   */
  public calculateTorsoCollision(a?: any, b?: any): any {
    const boxA = this.regionBox('torso', a);
    const boxB = this.regionBox('torso', b);
    return aabbResult('calculateTorsoCollision', boxA, boxB);
  }
  /**
   * [0699] calculateTorsoGroundClearance
   * Tính khoảng cách thân đến mặt đất.
   */
  public calculateTorsoGroundClearance(entity?: any, options?: any): any {
    const size = this.regionSize('torso');
    const clearance = this.groundClearance(entity, -size.y * 0.5, options);
    return this.measure('calculateTorsoGroundClearance', clearance, 'm');
  }
  /**
   * [0700] calculateTorsoJointChain
   * Tính chuỗi khớp thân.
   */
  public calculateTorsoJointChain(a?: any, b?: any, options?: any): any {
    const chain = ['getPelvisPosition', 'getLowerSpinePosition', 'getMiddleSpinePosition', 'getUpperSpinePosition', 'getChestPosition'];
    return this.jointChainWith('calculateTorsoJointChain', a, b, chain, options);
  }
  // ==========================================================================
  // 16. Tọa độ bụng, hông và xương chậu
  // ==========================================================================

  /**
   * [0701] getAbdomenPosition
   * Lấy tọa độ bụng.
   */
  public getAbdomenPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getAbdomenPosition', entity, offset);
    return p;
  }
  /**
   * [0702] getAbdomenCenter
   * Lấy tâm bụng.
   */
  public getAbdomenCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getAbdomenCenter', entity, offset);
    return p;
  }
  /**
   * [0703] getUpperAbdomenPosition
   * Lấy tọa độ bụng trên.
   */
  public getUpperAbdomenPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getUpperAbdomenPosition', entity, offset);
    return p;
  }
  /**
   * [0704] getLowerAbdomenPosition
   * Lấy tọa độ bụng dưới.
   */
  public getLowerAbdomenPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLowerAbdomenPosition', entity, offset);
    return p;
  }
  /**
   * [0705] getNavelPosition
   * Lấy tọa độ rốn.
   */
  public getNavelPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getNavelPosition', entity, offset);
    return p;
  }
  /**
   * [0706] getPelvisPosition
   * Lấy tọa độ xương chậu.
   */
  public getPelvisPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getPelvisPosition', entity, offset);
    return p;
  }
  /**
   * [0707] getPelvisCenter
   * Lấy tâm xương chậu.
   */
  public getPelvisCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getPelvisCenter', entity, offset);
    return p;
  }
  /**
   * [0708] getPelvisFrontPosition
   * Lấy tọa độ phía trước xương chậu.
   */
  public getPelvisFrontPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getPelvisFrontPosition', entity, offset);
    return p;
  }
  /**
   * [0709] getPelvisBackPosition
   * Lấy tọa độ phía sau xương chậu.
   */
  public getPelvisBackPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getPelvisBackPosition', entity, offset);
    return p;
  }
  /**
   * [0710] getLeftHipPosition
   * Lấy tọa độ hông trái.
   */
  public getLeftHipPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftHipPosition', entity, offset);
    return p;
  }
  /**
   * [0711] getRightHipPosition
   * Lấy tọa độ hông phải.
   */
  public getRightHipPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightHipPosition', entity, offset);
    return p;
  }
  /**
   * [0712] getHipCenter
   * Lấy tâm hai hông.
   */
  public getHipCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHipCenter', entity, offset);
    return p;
  }
  /**
   * [0713] getHipJointPosition
   * Lấy tọa độ khớp hông.
   */
  public getHipJointPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getHipJointPosition', entity, offset);
    return p;
  }
  /**
   * [0714] getSacrumPosition
   * Lấy tọa độ xương cùng.
   */
  public getSacrumPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getSacrumPosition', entity, offset);
    return p;
  }
  /**
   * [0715] getTailbonePosition
   * Lấy tọa độ xương cụt.
   */
  public getTailbonePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getTailbonePosition', entity, offset);
    return p;
  }
  /**
   * [0716] calculateAbdomenWidth
   * Tính chiều rộng bụng.
   */
  public calculateAbdomenWidth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'abdomen');
    return this.measureWith('calculateAbdomenWidth', size.x, 'm', options, { size });
  }
  /**
   * [0717] calculateAbdomenHeight
   * Tính chiều cao bụng.
   */
  public calculateAbdomenHeight(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'abdomen');
    return this.measureWith('calculateAbdomenHeight', size.y, 'm', options, { size });
  }
  /**
   * [0718] calculateAbdomenDepth
   * Tính chiều sâu bụng.
   */
  public calculateAbdomenDepth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'abdomen');
    return this.measureWith('calculateAbdomenDepth', size.z, 'm', options, { size });
  }
  /**
   * [0719] calculateAbdomenVolume
   * Tính thể tích bụng.
   */
  public calculateAbdomenVolume(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'abdomen');
    return this.measureWith('calculateAbdomenVolume', size.x * size.y * size.z, 'm^3', options, { size });
  }
  /**
   * [0720] calculateAbdomenCenterOfMass
   * Tính tâm khối lượng bụng.
   */
  public calculateAbdomenCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const size = this.regionSizeFor(subject, 'abdomen');
    const center = this.pointWith(this.centerOfMassPoint(subject, 0.02, size.y), subject, options);
    return { ...namedResult('calculateAbdomenCenterOfMass', center, { size }), center: center, position: center };
  }
  /**
   * [0721] calculatePelvisWidth
   * Tính chiều rộng xương chậu.
   */
  public calculatePelvisWidth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'pelvis');
    return this.measureWith('calculatePelvisWidth', size.x, 'm', options, { size });
  }
  /**
   * [0722] calculatePelvisHeight
   * Tính chiều cao xương chậu.
   */
  public calculatePelvisHeight(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'pelvis');
    return this.measureWith('calculatePelvisHeight', size.y, 'm', options, { size });
  }
  /**
   * [0723] calculatePelvisDepth
   * Tính chiều sâu xương chậu.
   */
  public calculatePelvisDepth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'pelvis');
    return this.measureWith('calculatePelvisDepth', size.z, 'm', options, { size });
  }
  /**
   * [0724] calculatePelvisOrientation
   * Tính hướng xương chậu.
   */
  public calculatePelvisOrientation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['pelvis', 'hip']);
    return this.orientation('calculatePelvisOrientation', found.q, { bone: found.bone });
  }
  /**
   * [0725] calculatePelvisRotation
   * Tính góc quay xương chậu.
   */
  public calculatePelvisRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['pelvis', 'hip']);
    return this.orientation('calculatePelvisRotation', found.q, { bone: found.bone });
  }
  /**
   * [0726] calculatePelvisTilt
   * Tính độ nghiêng xương chậu.
   */
  public calculatePelvisTilt(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['pelvis', 'hip']);
    return this.measure('calculatePelvisTilt', e.x, 'rad');
  }
  /**
   * [0727] calculatePelvisTwist
   * Tính góc xoay xương chậu.
   */
  public calculatePelvisTwist(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['pelvis', 'hip']);
    return this.measure('calculatePelvisTwist', e.y, 'rad');
  }
  /**
   * [0728] calculateHipWidth
   * Tính chiều rộng hông.
   */
  public calculateHipWidth(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const width = this.declaredNumber(subject, 'hipWidth', BODY_DIMENSIONS.hipWidth);
    return this.measureWith('calculateHipWidth', width, 'm');
  }
  /**
   * [0729] calculateHipSymmetry
   * Tính độ đối xứng hông.
   */
  public calculateHipSymmetry(a?: any, b?: any, options?: any): any {
    const score = this.symmetryScore(a, b, BODY_DIMENSIONS.hipWidth);
    return namedResult('calculateHipSymmetry', this.applyOptions(score, options, { numeric: ['symmetry', 'difference'], points: ['left', 'right'] }, a));
  }
  /**
   * [0730] calculateHipJointAngle
   * Tính góc khớp hông.
   */
  public calculateHipJointAngle(a?: any, b?: any): any {
    const hip = this.landmarkPosition('getHipJointPosition', a);
    // `b` là vị trí đầu gối tùy chọn (entity khác hoặc điểm tọa độ).
    const knee = this.landmarkFrom(b, 'getKneePosition') ?? this.landmarkPosition('getKneePosition', a);
    const limb = normalize(subtract(knee, hip));
    const angle = Math.acos(clamp(dot(limb, { x: 0, y: -1, z: 0 }), -1, 1));
    return this.measure('calculateHipJointAngle', angle, 'rad', { hip: hip, knee: knee });
  }
  /**
   * [0731] calculateHipFlexion
   * Tính góc gập hông.
   */
  public calculateHipFlexion(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh', 'hip']);
    return this.measure('calculateHipFlexion', Math.max(0, e.x), 'rad');
  }
  /**
   * [0732] calculateHipExtension
   * Tính góc duỗi hông.
   */
  public calculateHipExtension(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh', 'hip']);
    return this.measure('calculateHipExtension', Math.max(0, -e.x), 'rad');
  }
  /**
   * [0733] calculateHipAbduction
   * Tính góc dạng hông.
   */
  public calculateHipAbduction(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh', 'hip']);
    return this.measure('calculateHipAbduction', Math.max(0, e.z), 'rad');
  }
  /**
   * [0734] calculateHipAdduction
   * Tính góc khép hông.
   */
  public calculateHipAdduction(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh', 'hip']);
    return this.measure('calculateHipAdduction', Math.max(0, -e.z), 'rad');
  }
  /**
   * [0735] calculateHipInternalRotation
   * Tính góc xoay trong hông.
   */
  public calculateHipInternalRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['thigh', 'hip']);
    return this.orientation('calculateHipInternalRotation', found.q, { bone: found.bone });
  }
  /**
   * [0736] calculateHipExternalRotation
   * Tính góc xoay ngoài hông.
   */
  public calculateHipExternalRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['thigh', 'hip']);
    return this.orientation('calculateHipExternalRotation', found.q, { bone: found.bone });
  }
  /**
   * [0737] calculateHipVelocity
   * Tính vận tốc hông.
   */
  public calculateHipVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateHipVelocity', velocity);
  }
  /**
   * [0738] calculateHipAcceleration
   * Tính gia tốc hông.
   */
  public calculateHipAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateHipAcceleration', acceleration);
  }
  /**
   * [0739] calculateHipBoundingBox
   * Tính hộp bao hông.
   */
  public calculateHipBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('hip', entity, size);
    return boundsResult('calculateHipBoundingBox', box);
  }
  /**
   * [0740] calculateHipCenterOfMass
   * Tính tâm khối lượng hông.
   */
  public calculateHipCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const size = this.regionSizeFor(subject, 'hip');
    const center = this.pointWith(this.centerOfMassPoint(subject, -size.y * 0.5, size.y), subject, options);
    return { ...namedResult('calculateHipCenterOfMass', center, { size }), center: center, position: center };
  }
  /**
   * [0741] calculateHipToKneeDistance
   * Tính khoảng cách hông đến đầu gối.
   */
  public calculateHipToKneeDistance(a?: any, b?: any): any {
    return this.measure('calculateHipToKneeDistance', this.pairDistance(a, b, 'hip', 'knee'), 'm');
  }
  /**
   * [0742] calculateHipToAnkleDistance
   * Tính khoảng cách hông đến mắt cá.
   */
  public calculateHipToAnkleDistance(a?: any, b?: any): any {
    return this.measure('calculateHipToAnkleDistance', this.pairDistance(a, b, 'hip', 'ankle'), 'm');
  }
  /**
   * [0743] calculateHipToFootDistance
   * Tính khoảng cách hông đến bàn chân.
   */
  public calculateHipToFootDistance(a?: any, b?: any): any {
    return this.measure('calculateHipToFootDistance', this.pairDistance(a, b, 'hip', 'foot'), 'm');
  }
  /**
   * [0744] calculatePelvisGroundClearance
   * Tính khoảng cách xương chậu đến mặt đất.
   */
  public calculatePelvisGroundClearance(entity?: any, options?: any): any {
    const size = this.regionSize('pelvis');
    const clearance = this.groundClearance(entity, -size.y * 0.5, options);
    return this.measure('calculatePelvisGroundClearance', clearance, 'm');
  }
  /**
   * [0745] calculatePelvisMotionVector
   * Tính vector chuyển động xương chậu.
   */
  public calculatePelvisMotionVector(a?: any, b?: any): any {
    const motion = this.motionVector(a, b);
    return this.vector('calculatePelvisMotionVector', motion);
  }
  /**
   * [0746] calculatePelvisPoseError
   * Tính sai lệch tư thế xương chậu.
   */
  public calculatePelvisPoseError(a?: any, b?: any, options?: any): any {
    const error = this.poseError(a, b);
    return namedResult('calculatePelvisPoseError', this.applyOptions(error, options, { numeric: ['positionError', 'rotationError'] }, a));
  }
  /**
   * [0747] calculatePelvisStability
   * Tính độ ổn định xương chậu.
   */
  public calculatePelvisStability(a?: any, b?: any, options?: any): any {
    const e = this.jointEuler(a, b, ['pelvis', 'hip']);
    const tilt = Math.abs(e.x);
    const twist = Math.abs(e.y);
    const stability = clamp01(1 - (tilt + twist) / Math.PI);
    return namedResult('calculatePelvisStability', this.applyOptions({ stability: stability, tilt: tilt, twist: twist }, options, { numeric: ['tilt', 'twist'], invertOnly: ['stability'] }, a), { angle: e });
  }
  /**
   * [0748] calculatePelvisCollision
   * Kiểm tra va chạm xương chậu.
   */
  public calculatePelvisCollision(a?: any, b?: any): any {
    const boxA = this.regionBox('pelvis', a);
    const boxB = this.regionBox('pelvis', b);
    return aabbResult('calculatePelvisCollision', boxA, boxB);
  }
  /**
   * [0749] calculateHipJointAxis
   * Tính trục khớp hông.
   */
  public calculateHipJointAxis(a?: any, b?: any, options?: any): any {
    const subject = this.optEntity(options, a);
    const hip = this.landmarkPosition('getHipJointPosition', subject);
    // `b` là vị trí đầu gối tùy chọn (entity khác hoặc điểm tọa độ).
    const knee = this.landmarkFrom(b, 'getKneePosition') ?? this.landmarkPosition('getKneePosition', subject);
    const limbAxis = normalize(subtract(knee, hip));
    const axis = normalize(cross(FORWARD3, limbAxis));
    const payload = this.applyOptions(
      { axis: axis, limbAxis: limbAxis, origin: hip },
      options,
      { directions: ['axis', 'limbAxis'] },
      subject,
    );
    payload.origin = this.pointWith(hip, subject, options);
    return namedResult('calculateHipJointAxis', payload, { bone: 'hip' });
  }
  /**
   * [0750] calculateHipJointNormal
   * Tính pháp tuyến khớp hông.
   */
  public calculateHipJointNormal(a?: any, b?: any): any {
    const hip = this.markerPosition(a, ['hip', 'pelvis'], 'getHipJointPosition');
    // `b` là vị trí đầu gối tùy chọn (entity khác hoặc điểm tọa độ).
    const knee = this.markerFrom(b, ['knee'], 'getKneePosition') ?? this.markerPosition(a, ['knee'], 'getKneePosition');
    const limbAxis = normalize(subtract(knee, hip));
    const normal = normalize(cross(FORWARD3, limbAxis));
    return this.vector('calculateHipJointNormal', normal);
  }
  // ==========================================================================
  // 17. Tọa độ chân và đùi
  // ==========================================================================

  /**
   * [0751] getLeftLegPosition
   * Lấy tọa độ chân trái.
   */
  public getLeftLegPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftLegPosition', entity, offset);
    return p;
  }
  /**
   * [0752] getRightLegPosition
   * Lấy tọa độ chân phải.
   */
  public getRightLegPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightLegPosition', entity, offset);
    return p;
  }
  /**
   * [0753] getLeftLegCenter
   * Lấy tâm chân trái.
   */
  public getLeftLegCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftLegCenter', entity, offset);
    return p;
  }
  /**
   * [0754] getRightLegCenter
   * Lấy tâm chân phải.
   */
  public getRightLegCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightLegCenter', entity, offset);
    return p;
  }
  /**
   * [0755] getLeftThighPosition
   * Lấy tọa độ đùi trái.
   */
  public getLeftThighPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftThighPosition', entity, offset);
    return p;
  }
  /**
   * [0756] getRightThighPosition
   * Lấy tọa độ đùi phải.
   */
  public getRightThighPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightThighPosition', entity, offset);
    return p;
  }
  /**
   * [0757] getLeftThighCenter
   * Lấy tâm đùi trái.
   */
  public getLeftThighCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftThighCenter', entity, offset);
    return p;
  }
  /**
   * [0758] getRightThighCenter
   * Lấy tâm đùi phải.
   */
  public getRightThighCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightThighCenter', entity, offset);
    return p;
  }
  /**
   * [0759] getLeftThighStart
   * Lấy điểm đầu đùi trái.
   */
  public getLeftThighStart(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getLeftThighStart', a, b, options, 'left');
  }
  /**
   * [0760] getRightThighStart
   * Lấy điểm đầu đùi phải.
   */
  public getRightThighStart(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getRightThighStart', a, b, options, 'right');
  }
  /**
   * [0761] getLeftThighEnd
   * Lấy điểm cuối đùi trái.
   */
  public getLeftThighEnd(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getLeftThighEnd', a, b, options, 'left');
  }
  /**
   * [0762] getRightThighEnd
   * Lấy điểm cuối đùi phải.
   */
  public getRightThighEnd(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getRightThighEnd', a, b, options, 'right');
  }
  /**
   * [0763] calculateThighLength
   * Tính chiều dài đùi.
   */
  public calculateThighLength(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const length = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength);
    return this.measureWith('calculateThighLength', length, 'm');
  }
  /**
   * [0764] calculateThighWidth
   * Tính chiều rộng đùi.
   */
  public calculateThighWidth(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const radius = this.declaredNumber(subject, 'thighRadius', BODY_DIMENSIONS.thighRadius);
    return this.measureWith('calculateThighWidth', radius * 2, 'm');
  }
  /**
   * [0765] calculateThighThickness
   * Tính độ dày đùi.
   */
  public calculateThighThickness(a?: any, b?: any, options?: any): any {
    return this.thickness('calculateThighThickness', a, b, 'thigh', options);
  }
  /**
   * [0766] calculateThighVolume
   * Tính thể tích đùi.
   */
  public calculateThighVolume(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const r = this.declaredNumber(subject, 'thighRadius', BODY_DIMENSIONS.thighRadius);
    const l = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength);
    const volume = Math.PI * r * r * l;
    return this.measureWith('calculateThighVolume', volume, 'm^3', options, { radius: r, length: l });
  }
  /**
   * [0767] calculateThighSurfaceArea
   * Tính diện tích bề mặt đùi.
   */
  public calculateThighSurfaceArea(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const r = this.declaredNumber(subject, 'thighRadius', BODY_DIMENSIONS.thighRadius);
    const l = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength);
    const area = 2 * Math.PI * r * l + 2 * Math.PI * r * r;
    return this.measureWith('calculateThighSurfaceArea', area, 'm^2', options, { radius: r, length: l });
  }
  /**
   * [0768] calculateThighDirection
   * Tính hướng đùi.
   */
  public calculateThighDirection(a?: any, b?: any): any {
    const hip = this.landmarkPosition('getHipPosition', a);
    // `b` là vị trí đầu gối tùy chọn (entity khác hoặc điểm tọa độ).
    const knee = this.landmarkFrom(b, 'getKneePosition') ?? this.landmarkPosition('getKneePosition', a);
    const direction = normalize(subtract(knee, hip));
    return this.vector('calculateThighDirection', direction);
  }
  /**
   * [0769] calculateThighOrientation
   * Tính hướng quay đùi.
   */
  public calculateThighOrientation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['thigh']);
    return this.orientation('calculateThighOrientation', found.q, { bone: found.bone });
  }
  /**
   * [0770] calculateThighRotation
   * Tính góc quay đùi.
   */
  public calculateThighRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['thigh']);
    return this.orientation('calculateThighRotation', found.q, { bone: found.bone });
  }
  /**
   * [0771] calculateThighVelocity
   * Tính vận tốc đùi.
   */
  public calculateThighVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateThighVelocity', velocity);
  }
  /**
   * [0772] calculateThighAcceleration
   * Tính gia tốc đùi.
   */
  public calculateThighAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateThighAcceleration', acceleration);
  }
  /**
   * [0773] calculateThighBoundingBox
   * Tính hộp bao đùi.
   */
  public calculateThighBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('thigh', entity, size);
    return boundsResult('calculateThighBoundingBox', box);
  }
  /**
   * [0774] calculateThighBoundingSphere
   * Tính hình cầu bao đùi.
   */
  public calculateThighBoundingSphere(entity?: any, radius = 1.0): any {
    const size = this.regionSize('thigh');
    return sphereResult('calculateThighBoundingSphere', entityPosition(entity), this.autoRadius(radius, size));
  }
  /**
   * [0775] calculateThighCenterOfMass
   * Tính tâm khối lượng đùi.
   */
  public calculateThighCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const length = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength);
    const center = this.pointWith(this.centerOfMassPoint(subject, -length, length), subject, options);
    return { ...namedResult('calculateThighCenterOfMass', center), center: center, position: center };
  }
  /**
   * [0776] calculateThighToHipDistance
   * Tính khoảng cách đùi đến hông.
   */
  public calculateThighToHipDistance(a?: any, b?: any): any {
    return this.measure('calculateThighToHipDistance', this.pairDistance(a, b, 'thigh', 'hip'), 'm');
  }
  /**
   * [0777] calculateThighToKneeDistance
   * Tính khoảng cách đùi đến đầu gối.
   */
  public calculateThighToKneeDistance(a?: any, b?: any): any {
    return this.measure('calculateThighToKneeDistance', this.pairDistance(a, b, 'thigh', 'knee'), 'm');
  }
  /**
   * [0778] calculateThighSymmetry
   * Tính độ đối xứng đùi.
   */
  public calculateThighSymmetry(a?: any, b?: any, options?: any): any {
    const score = this.symmetryScore(a, b, BODY_DIMENSIONS.hipWidth);
    return namedResult('calculateThighSymmetry', this.applyOptions(score, options, { numeric: ['symmetry', 'difference'], points: ['left', 'right'] }, a));
  }
  /**
   * [0779] calculateThighFlexion
   * Tính góc gập đùi.
   */
  public calculateThighFlexion(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh']);
    return this.measure('calculateThighFlexion', Math.max(0, e.x), 'rad');
  }
  /**
   * [0780] calculateThighExtension
   * Tính góc duỗi đùi.
   */
  public calculateThighExtension(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh']);
    return this.measure('calculateThighExtension', Math.max(0, -e.x), 'rad');
  }
  /**
   * [0781] calculateThighAbduction
   * Tính góc dạng đùi.
   */
  public calculateThighAbduction(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh']);
    return this.measure('calculateThighAbduction', Math.max(0, e.z), 'rad');
  }
  /**
   * [0782] calculateThighAdduction
   * Tính góc khép đùi.
   */
  public calculateThighAdduction(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['thigh']);
    return this.measure('calculateThighAdduction', Math.max(0, -e.z), 'rad');
  }
  /**
   * [0783] calculateThighInternalRotation
   * Tính góc xoay trong đùi.
   */
  public calculateThighInternalRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['thigh']);
    return this.orientation('calculateThighInternalRotation', found.q, { bone: found.bone });
  }
  /**
   * [0784] calculateThighExternalRotation
   * Tính góc xoay ngoài đùi.
   */
  public calculateThighExternalRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['thigh']);
    return this.orientation('calculateThighExternalRotation', found.q, { bone: found.bone });
  }
  /**
   * [0785] calculateLegLength
   * Tính chiều dài chân.
   */
  public calculateLegLength(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const length = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    return this.measureWith('calculateLegLength', length, 'm', options);
  }
  /**
   * [0786] calculateLegDirection
   * Tính hướng chân.
   */
  public calculateLegDirection(a?: any, b?: any): any {
    const hip = this.landmarkPosition('getHipPosition', a);
    // `b` là vị trí bàn chân tùy chọn (entity khác hoặc điểm tọa độ).
    const foot = this.landmarkFrom(b, 'getFootCenter') ?? this.landmarkPosition('getFootCenter', a);
    const direction = normalize(subtract(foot, hip));
    return this.vector('calculateLegDirection', direction);
  }
  /**
   * [0787] calculateLegOrientation
   * Tính hướng quay chân.
   */
  public calculateLegOrientation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['leg', 'thigh']);
    return this.orientation('calculateLegOrientation', found.q, { bone: found.bone });
  }
  /**
   * [0788] calculateLegVelocity
   * Tính vận tốc chân.
   */
  public calculateLegVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateLegVelocity', velocity);
  }
  /**
   * [0789] calculateLegAcceleration
   * Tính gia tốc chân.
   */
  public calculateLegAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateLegAcceleration', acceleration);
  }
  /**
   * [0790] calculateLegBoundingBox
   * Tính hộp bao chân.
   */
  public calculateLegBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('leg', entity, size);
    return boundsResult('calculateLegBoundingBox', box);
  }
  /**
   * [0791] calculateLegCenterOfMass
   * Tính tâm khối lượng chân.
   */
  public calculateLegCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const length = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    const center = this.pointWith(this.centerOfMassPoint(subject, -length, length), subject, options);
    return { ...namedResult('calculateLegCenterOfMass', center), center: center, position: center };
  }
  /**
   * [0792] calculateLegSwingAngle
   * Tính góc vung chân.
   */
  public calculateLegSwingAngle(a?: any, b?: any): any {
    const hip = this.landmarkPosition('getHipPosition', a);
    // `b` là vị trí bàn chân tùy chọn (entity khác hoặc điểm tọa độ).
    const foot = this.landmarkFrom(b, 'getFootCenter') ?? this.landmarkPosition('getFootCenter', a);
    const limb = normalize(subtract(foot, hip));
    const angle = Math.acos(clamp(dot(limb, { x: 0, y: -1, z: 0 }), -1, 1));
    return this.measure('calculateLegSwingAngle', angle, 'rad');
  }
  /**
   * [0793] calculateLegStrideLength
   * Tính chiều dài bước chân.
   */
  public calculateLegStrideLength(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    const stride = legLength * REFERENCE.strideRatio;
    return this.measureWith('calculateLegStrideLength', stride, 'm', options, { legLength: legLength });
  }
  /**
   * [0794] calculateLegStrideFrequency
   * Tính tần số bước chân.
   */
  public calculateLegStrideFrequency(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    const stride = legLength * REFERENCE.strideRatio;
    const frequency = REFERENCE.walkingSpeed / stride;
    return this.measureWith('calculateLegStrideFrequency', frequency, 'Hz', options, { stride: stride });
  }
  /**
   * [0795] calculateLegGroundClearance
   * Tính khoảng cách chân đến mặt đất.
   */
  public calculateLegGroundClearance(entity?: any, options?: any): any {
    const clearance = this.groundClearance(entity, -0.93, options);
    return this.measure('calculateLegGroundClearance', clearance, 'm');
  }
  /**
   * [0796] calculateLegContactPoint
   * Tính điểm tiếp xúc chân.
   */
  public calculateLegContactPoint(a?: any, b?: any, options?: any): any {
    const foot = this.landmarkPosition('getFootSolePosition', a);
    const contact = b !== undefined && b !== null ? pointOf(b) : { x: foot.x, y: 0, z: foot.z };
    const payload = this.applyOptions({ point: contact, contact: contact, sole: foot }, options, { points: ['point', 'contact', 'sole'] }, a);
    return namedResult('calculateLegContactPoint', payload, { foot: foot });
  }
  /**
   * [0797] calculateLegContactNormal
   * Tính pháp tuyến điểm tiếp xúc chân.
   */
  public calculateLegContactNormal(a?: any, b?: any): any {
    const normal = this.surfaceNormal(a, b, { x: 0, y: 1, z: 0 });
    return this.vector('calculateLegContactNormal', normal);
  }
  /**
   * [0798] calculateLegPoseError
   * Tính sai lệch tư thế chân.
   */
  public calculateLegPoseError(a?: any, b?: any, options?: any): any {
    const error = this.poseError(a, b);
    return namedResult('calculateLegPoseError', this.applyOptions(error, options, { numeric: ['positionError', 'rotationError'] }, a));
  }
  /**
   * [0799] calculateLegMotionSmoothness
   * Tính độ mượt chuyển động chân.
   */
  public calculateLegMotionSmoothness(a?: any, b?: any, options?: any): any {
    // `b` là nguồn chuyển động thay thế cho `a`.
    const source = b !== undefined && b !== null ? b : a;
    const smoothness = this.motionSmoothness(source);
    return namedResult('calculateLegMotionSmoothness', this.applyOptions(smoothness, options, { numeric: ['jerk', 'acceleration', 'velocity'], invertOnly: ['smoothness'] }, source));
  }
  /**
   * [0800] calculateLegInverseKinematics
   * Tính động học ngược chân.
   */
  public calculateLegInverseKinematics(a?: any, b?: any, options?: any): any {
    const chain = ['getHipPosition', 'getKneePosition', 'getAnklePosition', 'getFootCenter'];
    return this.inverseKinematics('calculateLegInverseKinematics', a, b, options, chain);
  }
  // ==========================================================================
  // 18. Tọa độ đầu gối và cẳng chân
  // ==========================================================================

  /**
   * [0801] getLeftKneePosition
   * Lấy tọa độ đầu gối trái.
   */
  public getLeftKneePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftKneePosition', entity, offset);
    return p;
  }
  /**
   * [0802] getRightKneePosition
   * Lấy tọa độ đầu gối phải.
   */
  public getRightKneePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightKneePosition', entity, offset);
    return p;
  }
  /**
   * [0803] getLeftKneeCenter
   * Lấy tâm đầu gối trái.
   */
  public getLeftKneeCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftKneeCenter', entity, offset);
    return p;
  }
  /**
   * [0804] getRightKneeCenter
   * Lấy tâm đầu gối phải.
   */
  public getRightKneeCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightKneeCenter', entity, offset);
    return p;
  }
  /**
   * [0805] getLeftKneeCapPosition
   * Lấy tọa độ xương bánh chè trái.
   */
  public getLeftKneeCapPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftKneeCapPosition', entity, offset);
    return p;
  }
  /**
   * [0806] getRightKneeCapPosition
   * Lấy tọa độ xương bánh chè phải.
   */
  public getRightKneeCapPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightKneeCapPosition', entity, offset);
    return p;
  }
  /**
   * [0807] calculateKneeWidth
   * Tính chiều rộng đầu gối.
   */
  public calculateKneeWidth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'knee');
    return this.measureWith('calculateKneeWidth', size.x, 'm', options, { size });
  }
  /**
   * [0808] calculateKneeThickness
   * Tính độ dày đầu gối.
   */
  public calculateKneeThickness(a?: any, b?: any, options?: any): any {
    return this.thickness('calculateKneeThickness', a, b, 'knee', options);
  }
  /**
   * [0809] calculateKneeFlexion
   * Tính góc gập đầu gối.
   */
  public calculateKneeFlexion(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['knee', 'shin']);
    return this.measure('calculateKneeFlexion', Math.max(0, e.x), 'rad');
  }
  /**
   * [0810] calculateKneeExtension
   * Tính góc duỗi đầu gối.
   */
  public calculateKneeExtension(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['knee', 'shin']);
    return this.measure('calculateKneeExtension', Math.max(0, -e.x), 'rad');
  }
  /**
   * [0811] calculateKneeRotation
   * Tính góc quay đầu gối.
   */
  public calculateKneeRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['knee']);
    return this.orientation('calculateKneeRotation', found.q, { bone: found.bone });
  }
  /**
   * [0812] calculateKneeJointAxis
   * Tính trục khớp gối.
   */
  public calculateKneeJointAxis(a?: any, b?: any, options?: any): any {
    const subject = this.optEntity(options, a);
    const knee = this.landmarkPosition('getKneePosition', subject);
    // `b` là vị trí mắt cái tùy chọn (entity khác hoặc điểm tọa độ).
    const ankle = this.landmarkFrom(b, 'getAnklePosition') ?? this.landmarkPosition('getAnklePosition', subject);
    const limbAxis = normalize(subtract(ankle, knee));
    const axis = normalize(cross(FORWARD3, limbAxis));
    const payload = this.applyOptions(
      { axis: axis, limbAxis: limbAxis, origin: knee },
      options,
      { directions: ['axis', 'limbAxis'] },
      subject,
    );
    payload.origin = this.pointWith(knee, subject, options);
    return namedResult('calculateKneeJointAxis', payload, { bone: 'knee' });
  }
  /**
   * [0813] calculateKneeJointNormal
   * Tính pháp tuyến khớp gối.
   */
  public calculateKneeJointNormal(a?: any, b?: any): any {
    const knee = this.markerPosition(a, ['knee'], 'getKneePosition');
    // `b` là vị trí mắt cái tùy chọn (entity khác hoặc điểm tọa độ).
    const ankle = this.markerFrom(b, ['ankle'], 'getAnklePosition') ?? this.markerPosition(a, ['ankle'], 'getAnklePosition');
    const thighAxis = normalize(subtract(knee, this.markerPosition(a, ['hip', 'pelvis'], 'getHipPosition')));
    const shinAxis = normalize(subtract(ankle, knee));
    const normal = normalize(cross(thighAxis, shinAxis));
    return this.vector('calculateKneeJointNormal', normal);
  }
  /**
   * [0814] calculateKneeVelocity
   * Tính vận tốc đầu gối.
   */
  public calculateKneeVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateKneeVelocity', velocity);
  }
  /**
   * [0815] calculateKneeAcceleration
   * Tính gia tốc đầu gối.
   */
  public calculateKneeAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateKneeAcceleration', acceleration);
  }
  /**
   * [0816] calculateKneeBoundingBox
   * Tính hộp bao đầu gối.
   */
  public calculateKneeBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('knee', entity, size);
    return boundsResult('calculateKneeBoundingBox', box);
  }
  /**
   * [0817] calculateKneeBoundingSphere
   * Tính hình cầu bao đầu gối.
   */
  public calculateKneeBoundingSphere(entity?: any, radius = 1.0): any {
    const size = this.regionSize('knee');
    return sphereResult('calculateKneeBoundingSphere', entityPosition(entity), this.autoRadius(radius, size));
  }
  /**
   * [0818] calculateKneeToHipDistance
   * Tính khoảng cách đầu gối đến hông.
   */
  public calculateKneeToHipDistance(a?: any, b?: any): any {
    return this.measure('calculateKneeToHipDistance', this.pairDistance(a, b, 'knee', 'hip'), 'm');
  }
  /**
   * [0819] calculateKneeToAnkleDistance
   * Tính khoảng cách đầu gối đến mắt cá.
   */
  public calculateKneeToAnkleDistance(a?: any, b?: any): any {
    return this.measure('calculateKneeToAnkleDistance', this.pairDistance(a, b, 'knee', 'ankle'), 'm');
  }
  /**
   * [0820] calculateKneeSymmetry
   * Tính độ đối xứng đầu gối.
   */
  public calculateKneeSymmetry(a?: any, b?: any, options?: any): any {
    const score = this.symmetryScore(a, b, BODY_DIMENSIONS.hipWidth);
    return namedResult('calculateKneeSymmetry', this.applyOptions(score, options, { numeric: ['symmetry', 'difference'], points: ['left', 'right'] }, a));
  }
  /**
   * [0821] getLeftShinPosition
   * Lấy tọa độ cẳng chân trái.
   */
  public getLeftShinPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftShinPosition', entity, offset);
    return p;
  }
  /**
   * [0822] getRightShinPosition
   * Lấy tọa độ cẳng chân phải.
   */
  public getRightShinPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightShinPosition', entity, offset);
    return p;
  }
  /**
   * [0823] getLeftShinCenter
   * Lấy tâm cẳng chân trái.
   */
  public getLeftShinCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftShinCenter', entity, offset);
    return p;
  }
  /**
   * [0824] getRightShinCenter
   * Lấy tâm cẳng chân phải.
   */
  public getRightShinCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightShinCenter', entity, offset);
    return p;
  }
  /**
   * [0825] getLeftShinStart
   * Lấy điểm đầu cẳng chân trái.
   */
  public getLeftShinStart(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getLeftShinStart', a, b, options, 'left');
  }
  /**
   * [0826] getRightShinStart
   * Lấy điểm đầu cẳng chân phải.
   */
  public getRightShinStart(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getRightShinStart', a, b, options, 'right');
  }
  /**
   * [0827] getLeftShinEnd
   * Lấy điểm cuối cẳng chân trái.
   */
  public getLeftShinEnd(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getLeftShinEnd', a, b, options, 'left');
  }
  /**
   * [0828] getRightShinEnd
   * Lấy điểm cuối cẳng chân phải.
   */
  public getRightShinEnd(a?: any, b?: any, options?: any): any {
    return this.landmarkWith('getRightShinEnd', a, b, options, 'right');
  }
  /**
   * [0829] calculateShinLength
   * Tính chiều dài cẳng chân.
   */
  public calculateShinLength(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const length = this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    return this.measureWith('calculateShinLength', length, 'm');
  }
  /**
   * [0830] calculateShinWidth
   * Tính chiều rộng cẳng chân.
   */
  public calculateShinWidth(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const radius = this.declaredNumber(subject, 'shinRadius', BODY_DIMENSIONS.shinRadius);
    return this.measureWith('calculateShinWidth', radius * 2, 'm');
  }
  /**
   * [0831] calculateShinThickness
   * Tính độ dày cẳng chân.
   */
  public calculateShinThickness(a?: any, b?: any, options?: any): any {
    return this.thickness('calculateShinThickness', a, b, 'shin', options);
  }
  /**
   * [0832] calculateShinVolume
   * Tính thể tích cẳng chân.
   */
  public calculateShinVolume(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const r = this.declaredNumber(subject, 'shinRadius', BODY_DIMENSIONS.shinRadius);
    const l = this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    const volume = Math.PI * r * r * l;
    return this.measureWith('calculateShinVolume', volume, 'm^3', options, { radius: r, length: l });
  }
  /**
   * [0833] calculateShinDirection
   * Tính hướng cẳng chân.
   */
  public calculateShinDirection(a?: any, b?: any): any {
    const knee = this.markerPosition(a, ['knee'], 'getKneePosition');
    // `b` là vị trí mắt cái tùy chọn (entity khác hoặc điểm tọa độ).
    const ankle = this.markerFrom(b, ['ankle'], 'getAnklePosition') ?? this.markerPosition(a, ['ankle'], 'getAnklePosition');
    const direction = normalize(subtract(ankle, knee));
    return this.vector('calculateShinDirection', direction);
  }
  /**
   * [0834] calculateShinOrientation
   * Tính hướng quay cẳng chân.
   */
  public calculateShinOrientation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['shin', 'calf']);
    return this.orientation('calculateShinOrientation', found.q, { bone: found.bone });
  }
  /**
   * [0835] calculateShinVelocity
   * Tính vận tốc cẳng chân.
   */
  public calculateShinVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateShinVelocity', velocity);
  }
  /**
   * [0836] calculateShinAcceleration
   * Tính gia tốc cẳng chân.
   */
  public calculateShinAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateShinAcceleration', acceleration);
  }
  /**
   * [0837] calculateShinBoundingBox
   * Tính hộp bao cẳng chân.
   */
  public calculateShinBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('shin', entity, size);
    return boundsResult('calculateShinBoundingBox', box);
  }
  /**
   * [0838] calculateShinCenterOfMass
   * Tính tâm khối lượng cẳng chân.
   */
  public calculateShinCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const length = this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    const center = this.pointWith(this.centerOfMassPoint(subject, -length, length), subject, options);
    return { ...namedResult('calculateShinCenterOfMass', center), center: center, position: center };
  }
  /**
   * [0839] calculateShinToKneeDistance
   * Tính khoảng cách cẳng chân đến đầu gối.
   */
  public calculateShinToKneeDistance(a?: any, b?: any): any {
    return this.measure('calculateShinToKneeDistance', this.pairDistance(a, b, 'shin', 'knee'), 'm');
  }
  /**
   * [0840] calculateShinToAnkleDistance
   * Tính khoảng cách cẳng chân đến mắt cá.
   */
  public calculateShinToAnkleDistance(a?: any, b?: any): any {
    return this.measure('calculateShinToAnkleDistance', this.pairDistance(a, b, 'shin', 'ankle'), 'm');
  }
  /**
   * [0841] calculateShinRotation
   * Tính góc quay cẳng chân.
   */
  public calculateShinRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['shin', 'calf']);
    return this.orientation('calculateShinRotation', found.q, { bone: found.bone });
  }
  /**
   * [0842] calculateShinTwist
   * Tính góc xoắn cẳng chân.
   */
  public calculateShinTwist(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['shin', 'calf']);
    return this.measure('calculateShinTwist', e.y, 'rad');
  }
  /**
   * [0843] calculateShinSurfaceNormal
   * Tính pháp tuyến bề mặt cẳng chân.
   */
  public calculateShinSurfaceNormal(a?: any, b?: any): any {
    const normal = this.surfaceNormal(a, b, entityForward(a));
    return this.vector('calculateShinSurfaceNormal', normal);
  }
  /**
   * [0844] calculateShinGroundClearance
   * Tính khoảng cách cẳng chân đến mặt đất.
   */
  public calculateShinGroundClearance(entity?: any, options?: any): any {
    const clearance = this.groundClearance(entity, -0.85, options);
    return this.measure('calculateShinGroundClearance', clearance, 'm');
  }
  /**
   * [0845] calculateShinCollision
   * Kiểm tra va chạm cẳng chân.
   */
  public calculateShinCollision(a?: any, b?: any): any {
    const boxA = this.regionBox('shin', a);
    const boxB = this.regionBox('shin', b);
    return aabbResult('calculateShinCollision', boxA, boxB);
  }
  /**
   * [0846] calculateShinPoseError
   * Tính sai lệch tư thế cẳng chân.
   */
  public calculateShinPoseError(a?: any, b?: any, options?: any): any {
    const error = this.poseError(a, b);
    return namedResult('calculateShinPoseError', this.applyOptions(error, options, { numeric: ['positionError', 'rotationError'] }, a));
  }
  /**
   * [0847] calculateShinMotionSmoothness
   * Tính độ mượt chuyển động cẳng chân.
   */
  public calculateShinMotionSmoothness(a?: any, b?: any, options?: any): any {
    // `b` là nguồn chuyển động thay thế cho `a`.
    const source = b !== undefined && b !== null ? b : a;
    const smoothness = this.motionSmoothness(source);
    return namedResult('calculateShinMotionSmoothness', this.applyOptions(smoothness, options, { numeric: ['jerk', 'acceleration', 'velocity'], invertOnly: ['smoothness'] }, source));
  }
  /**
   * [0848] calculateShinSegmentAlignment
   * Tính độ thẳng hàng cẳng chân.
   */
  public calculateShinSegmentAlignment(a?: any, b?: any, options?: any): any {
    const knee = this.landmarkPosition('getKneePosition', a);
    // `b` là vị trí mắt cái tùy chọn (entity khác hoặc điểm tọa độ).
    const ankle = this.landmarkFrom(b, 'getAnklePosition') ?? this.landmarkPosition('getAnklePosition', a);
    const limbAxis = normalize(subtract(ankle, knee));
    const alignment = clamp01(dot(limbAxis, { x: 0, y: -1, z: 0 }));
    const angle = Math.acos(clamp(dot(limbAxis, { x: 0, y: -1, z: 0 }), -1, 1));
    const payload = this.applyOptions({ alignment: alignment, angle: angle, axis: limbAxis }, options, { numeric: ['angle'], invertOnly: ['alignment'], directions: ['axis'] }, a);
    return namedResult('calculateShinSegmentAlignment', payload, { knee: knee, ankle: ankle });
  }
  /**
   * [0849] calculateShinJointChain
   * Tính chuỗi khớp cẳng chân.
   */
  public calculateShinJointChain(a?: any, b?: any, options?: any): any {
    const chain = ['getKneePosition', 'getShinPosition', 'getAnklePosition'];
    return this.jointChainWith('calculateShinJointChain', a, b, chain, options);
  }
  /**
   * [0850] calculateShinInverseKinematics
   * Tính động học ngược cẳng chân.
   */
  public calculateShinInverseKinematics(a?: any, b?: any, options?: any): any {
    const chain = ['getKneePosition', 'getShinPosition', 'getAnklePosition'];
    return this.inverseKinematics('calculateShinInverseKinematics', a, b, options, chain);
  }
  // ==========================================================================
  // 19. Tọa độ mắt cá và bàn chân
  // ==========================================================================

  /**
   * [0851] getLeftAnklePosition
   * Lấy tọa độ mắt cá trái.
   */
  public getLeftAnklePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftAnklePosition', entity, offset);
    return p;
  }
  /**
   * [0852] getRightAnklePosition
   * Lấy tọa độ mắt cá phải.
   */
  public getRightAnklePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightAnklePosition', entity, offset);
    return p;
  }
  /**
   * [0853] getLeftAnkleCenter
   * Lấy tâm mắt cá trái.
   */
  public getLeftAnkleCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftAnkleCenter', entity, offset);
    return p;
  }
  /**
   * [0854] getRightAnkleCenter
   * Lấy tâm mắt cá phải.
   */
  public getRightAnkleCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightAnkleCenter', entity, offset);
    return p;
  }
  /**
   * [0855] getLeftHeelPosition
   * Lấy tọa độ gót chân trái.
   */
  public getLeftHeelPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftHeelPosition', entity, offset);
    return p;
  }
  /**
   * [0856] getRightHeelPosition
   * Lấy tọa độ gót chân phải.
   */
  public getRightHeelPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightHeelPosition', entity, offset);
    return p;
  }
  /**
   * [0857] getLeftFootPosition
   * Lấy tọa độ bàn chân trái.
   */
  public getLeftFootPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftFootPosition', entity, offset);
    return p;
  }
  /**
   * [0858] getRightFootPosition
   * Lấy tọa độ bàn chân phải.
   */
  public getRightFootPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightFootPosition', entity, offset);
    return p;
  }
  /**
   * [0859] getLeftFootCenter
   * Lấy tâm bàn chân trái.
   */
  public getLeftFootCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLeftFootCenter', entity, offset);
    return p;
  }
  /**
   * [0860] getRightFootCenter
   * Lấy tâm bàn chân phải.
   */
  public getRightFootCenter(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getRightFootCenter', entity, offset);
    return p;
  }
  /**
   * [0861] getFootToePosition
   * Lấy tọa độ đầu bàn chân.
   */
  public getFootToePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFootToePosition', entity, offset);
    return p;
  }
  /**
   * [0862] getFootHeelPosition
   * Lấy tọa độ gót bàn chân.
   */
  public getFootHeelPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFootHeelPosition', entity, offset);
    return p;
  }
  /**
   * [0863] getFootArchPosition
   * Lấy tọa độ vòm bàn chân.
   */
  public getFootArchPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFootArchPosition', entity, offset);
    return p;
  }
  /**
   * [0864] getFootSolePosition
   * Lấy tọa độ lòng bàn chân.
   */
  public getFootSolePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFootSolePosition', entity, offset);
    return p;
  }
  /**
   * [0865] getFootTopPosition
   * Lấy tọa độ mu bàn chân.
   */
  public getFootTopPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFootTopPosition', entity, offset);
    return p;
  }
  /**
   * [0866] getFootInnerEdge
   * Lấy tọa độ mép trong bàn chân.
   */
  public getFootInnerEdge(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFootInnerEdge', entity, offset);
    return p;
  }
  /**
   * [0867] getFootOuterEdge
   * Lấy tọa độ mép ngoài bàn chân.
   */
  public getFootOuterEdge(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFootOuterEdge', entity, offset);
    return p;
  }
  /**
   * [0868] calculateAnkleWidth
   * Tính chiều rộng mắt cá.
   */
  public calculateAnkleWidth(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'ankle');
    return this.measureWith('calculateAnkleWidth', size.x, 'm', options, { size });
  }
  /**
   * [0869] calculateAnkleFlexion
   * Tính góc gập mắt cá.
   */
  public calculateAnkleFlexion(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['ankle', 'foot']);
    return this.measure('calculateAnkleFlexion', Math.max(0, e.x), 'rad');
  }
  /**
   * [0870] calculateAnkleExtension
   * Tính góc duỗi mắt cá.
   */
  public calculateAnkleExtension(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['ankle', 'foot']);
    return this.measure('calculateAnkleExtension', Math.max(0, -e.x), 'rad');
  }
  /**
   * [0871] calculateAnkleInversion
   * Tính góc nghiêng lòng bàn chân vào trong.
   */
  public calculateAnkleInversion(a?: any, b?: any, options?: any): any {
    const e = this.jointEuler(a, b, ['ankle', 'foot']);
    const angle = Math.max(0, e.z);
    const payload = this.applyOptions({ angle: angle, axis: { x: 0, y: 0, z: 1 } }, options, { numeric: ['angle'] }, a);
    return namedResult('calculateAnkleInversion', payload, { euler: e });
  }
  /**
   * [0872] calculateAnkleEversion
   * Tính góc nghiêng lòng bàn chân ra ngoài.
   */
  public calculateAnkleEversion(a?: any, b?: any, options?: any): any {
    const e = this.jointEuler(a, b, ['ankle', 'foot']);
    const angle = Math.max(0, -e.z);
    const payload = this.applyOptions({ angle: angle, axis: { x: 0, y: 0, z: 1 } }, options, { numeric: ['angle'] }, a);
    return namedResult('calculateAnkleEversion', payload, { euler: e });
  }
  /**
   * [0873] calculateAnkleRotation
   * Tính góc quay mắt cá.
   */
  public calculateAnkleRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['ankle', 'foot']);
    return this.orientation('calculateAnkleRotation', found.q, { bone: found.bone });
  }
  /**
   * [0874] calculateAnkleVelocity
   * Tính vận tốc mắt cá.
   */
  public calculateAnkleVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateAnkleVelocity', velocity);
  }
  /**
   * [0875] calculateAnkleAcceleration
   * Tính gia tốc mắt cá.
   */
  public calculateAnkleAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateAnkleAcceleration', acceleration);
  }
  /**
   * [0876] calculateFootLength
   * Tính chiều dài bàn chân.
   */
  public calculateFootLength(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const length = this.declaredNumber(subject, 'footLength', BODY_DIMENSIONS.footLength);
    return this.measureWith('calculateFootLength', length, 'm');
  }
  /**
   * [0877] calculateFootWidth
   * Tính chiều rộng bàn chân.
   */
  public calculateFootWidth(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const width = this.declaredNumber(subject, 'footWidth', BODY_DIMENSIONS.footWidth);
    return this.measureWith('calculateFootWidth', width, 'm');
  }
  /**
   * [0878] calculateFootHeight
   * Tính chiều cao bàn chân.
   */
  public calculateFootHeight(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'foot');
    return this.measureWith('calculateFootHeight', size.y, 'm', options, { size });
  }
  /**
   * [0879] calculateFootThickness
   * Tính độ dày bàn chân.
   */
  public calculateFootThickness(a?: any, b?: any, options?: any): any {
    return this.thickness('calculateFootThickness', a, b, 'foot', options);
  }
  /**
   * [0880] calculateFootVolume
   * Tính thể tích bàn chân.
   */
  public calculateFootVolume(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'foot');
    return this.measureWith('calculateFootVolume', size.x * size.y * size.z, 'm^3', options, { size });
  }
  /**
   * [0881] calculateFootSurfaceArea
   * Tính diện tích bề mặt bàn chân.
   */
  public calculateFootSurfaceArea(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'foot');
    const area = 2 * (size.x * size.y + size.x * size.z + size.y * size.z);
    return this.measureWith('calculateFootSurfaceArea', area, 'm^2', options, { size });
  }
  /**
   * [0882] calculateFootOrientation
   * Tính hướng bàn chân.
   */
  public calculateFootOrientation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['foot', 'ankle']);
    return this.orientation('calculateFootOrientation', found.q, { bone: found.bone });
  }
  /**
   * [0883] calculateFootDirection
   * Tính hướng di chuyển của bàn chân.
   */
  public calculateFootDirection(a?: any, b?: any): any {
    const heel = this.landmarkPosition('getFootHeelPosition', a);
    // `b` là vị trí ngón chân tùy chọn (entity khác hoặc điểm tọa độ).
    const toe = this.landmarkFrom(b, 'getFootToePosition') ?? this.landmarkPosition('getFootToePosition', a);
    const direction = normalize(subtract(toe, heel));
    return this.vector('calculateFootDirection', direction);
  }
  /**
   * [0884] calculateFootRotation
   * Tính góc quay bàn chân.
   */
  public calculateFootRotation(entityOrAngle?: any, options?: any): any {
    const found = this.boneQuaternion(entityOrAngle, options, ['foot', 'ankle']);
    return this.orientation('calculateFootRotation', found.q, { bone: found.bone });
  }
  /**
   * [0885] calculateFootPitch
   * Tính góc chúi/ngẩng bàn chân.
   */
  public calculateFootPitch(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['foot', 'ankle']);
    return this.measure('calculateFootPitch', e.x, 'rad');
  }
  /**
   * [0886] calculateFootRoll
   * Tính góc lăn bàn chân.
   */
  public calculateFootRoll(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['foot', 'ankle']);
    return this.measure('calculateFootRoll', e.z, 'rad');
  }
  /**
   * [0887] calculateFootYaw
   * Tính góc quay ngang bàn chân.
   */
  public calculateFootYaw(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['foot', 'ankle']);
    return this.measure('calculateFootYaw', e.y, 'rad');
  }
  /**
   * [0888] calculateFootVelocity
   * Tính vận tốc bàn chân.
   */
  public calculateFootVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateFootVelocity', velocity);
  }
  /**
   * [0889] calculateFootAcceleration
   * Tính gia tốc bàn chân.
   */
  public calculateFootAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateFootAcceleration', acceleration);
  }
  /**
   * [0890] calculateFootAngularVelocity
   * Tính vận tốc góc bàn chân.
   */
  public calculateFootAngularVelocity(entity?: any, dt = 0.016): any {
    const angular = this.angularVelocityFrom(entity, dt);
    return this.vector('calculateFootAngularVelocity', angular);
  }
  /**
   * [0891] calculateFootBoundingBox
   * Tính hộp bao bàn chân.
   */
  public calculateFootBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('foot', entity, size);
    return boundsResult('calculateFootBoundingBox', box);
  }
  /**
   * [0892] calculateFootBoundingSphere
   * Tính hình cầu bao bàn chân.
   */
  public calculateFootBoundingSphere(entity?: any, radius = 1.0): any {
    const size = this.regionSize('foot');
    return sphereResult('calculateFootBoundingSphere', entityPosition(entity), this.autoRadius(radius, size));
  }
  /**
   * [0893] calculateFootCenterOfMass
   * Tính tâm khối lượng bàn chân.
   */
  public calculateFootCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const center = this.pointWith(add(entityPosition(subject), { x: 0, y: -0.04, z: 0.014 }), subject, options);
    return { ...namedResult('calculateFootCenterOfMass', center), center: center, position: center };
  }
  /**
   * [0894] calculateFootGroundContact
   * Kiểm tra bàn chân tiếp xúc mặt đất.
   */
  public calculateFootGroundContact(a?: any, b?: any, options?: any): any {
    return this.footGroundContact('calculateFootGroundContact', a, b, options);
  }
  /**
   * [0895] calculateFootGroundClearance
   * Tính khoảng cách bàn chân đến mặt đất.
   */
  public calculateFootGroundClearance(entity?: any, options?: any): any {
    const clearance = this.groundClearance(entity, -0.93, options);
    return this.measure('calculateFootGroundClearance', clearance, 'm');
  }
  /**
   * [0896] calculateFootPressureCenter
   * Tính tâm áp lực bàn chân.
   */
  public calculateFootPressureCenter(a?: any, b?: any, options?: any): any {
    const contact = this.footGroundContact('calculateFootPressureCenter', a, b, options);
    const pressure = REFERENCE.bodyMass * REFERENCE.gravity / Math.max(1e-6, num(contact.area, 0.01));
    const payload = this.applyOptions({ center: contact.contact, pressure: pressure, area: contact.area }, options, { numeric: ['pressure', 'area'], points: ['center'] }, a);
    return namedResult('calculateFootPressureCenter', payload, { contact: contact });
  }
  /**
   * [0897] calculateFootContactArea
   * Tính diện tích tiếp xúc bàn chân.
   */
  public calculateFootContactArea(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'foot');
    const area = size.x * size.z * 0.25;
    return this.measureWith('calculateFootContactArea', area, 'm^2', options, { size });
  }
  /**
   * [0898] calculateFootSlipVelocity
   * Tính vận tốc trượt bàn chân.
   */
  public calculateFootSlipVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    const slip = { x: velocity.x, y: 0, z: velocity.z };
    return this.vector('calculateFootSlipVelocity', slip);
  }
  /**
   * [0899] calculateFootStrideLength
   * Tính chiều dài bước chân.
   */
  public calculateFootStrideLength(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    const stride = legLength * REFERENCE.strideRatio;
    return this.measureWith('calculateFootStrideLength', stride, 'm', options, { legLength: legLength });
  }
  /**
   * [0900] calculateFootInverseKinematics
   * Tính động học ngược bàn chân.
   */
  public calculateFootInverseKinematics(a?: any, b?: any, options?: any): any {
    const chain = ['getAnklePosition', 'getFootCenter', 'getToeTipPosition'];
    return this.inverseKinematics('calculateFootInverseKinematics', a, b, options, chain);
  }
  // ==========================================================================
  // 20. Tọa độ ngón chân và tư thế đứng
  // ==========================================================================

  /**
   * [0901] getBigToePosition
   * Lấy tọa độ ngón chân cái.
   */
  public getBigToePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getBigToePosition', entity, offset);
    return p;
  }
  /**
   * [0902] getSecondToePosition
   * Lấy tọa độ ngón chân thứ hai.
   */
  public getSecondToePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getSecondToePosition', entity, offset);
    return p;
  }
  /**
   * [0903] getThirdToePosition
   * Lấy tọa độ ngón chân thứ ba.
   */
  public getThirdToePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getThirdToePosition', entity, offset);
    return p;
  }
  /**
   * [0904] getFourthToePosition
   * Lấy tọa độ ngón chân thứ tư.
   */
  public getFourthToePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getFourthToePosition', entity, offset);
    return p;
  }
  /**
   * [0905] getLittleToePosition
   * Lấy tọa độ ngón chân út.
   */
  public getLittleToePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getLittleToePosition', entity, offset);
    return p;
  }
  /**
   * [0906] getToeTipPosition
   * Lấy tọa độ đầu ngón chân.
   */
  public getToeTipPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getToeTipPosition', entity, offset);
    return p;
  }
  /**
   * [0907] getToeBasePosition
   * Lấy tọa độ gốc ngón chân.
   */
  public getToeBasePosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getToeBasePosition', entity, offset);
    return p;
  }
  /**
   * [0908] getToeJointPosition
   * Lấy tọa độ khớp ngón chân.
   */
  public getToeJointPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getToeJointPosition', entity, offset);
    return p;
  }
  /**
   * [0909] getToeNailPosition
   * Lấy tọa độ móng ngón chân.
   */
  public getToeNailPosition(entity?: any, offset?: Vec3D): any {
    const p = this.landmarkPosition('getToeNailPosition', entity, offset);
    return p;
  }
  /**
   * [0910] calculateToeLength
   * Tính chiều dài ngón chân.
   */
  public calculateToeLength(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'toe');
    return this.measureWith('calculateToeLength', size.z, 'm', options, { size });
  }
  /**
   * [0911] calculateToeWidth
   * Tính chiều rộng ngón chân.
   */
  public calculateToeWidth(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const width = this.declaredNumber(subject, 'toeWidth', 0.025);
    return this.measureWith('calculateToeWidth', width, 'm');
  }
  /**
   * [0912] calculateToeFlexion
   * Tính góc gập ngón chân.
   */
  public calculateToeFlexion(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['toe']);
    return this.measure('calculateToeFlexion', Math.max(0, e.x), 'rad');
  }
  /**
   * [0913] calculateToeExtension
   * Tính góc duỗi ngón chân.
   */
  public calculateToeExtension(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['toe']);
    return this.measure('calculateToeExtension', Math.max(0, -e.x), 'rad');
  }
  /**
   * [0914] calculateToeSpread
   * Tính độ xòe ngón chân.
   */
  public calculateToeSpread(entity?: any, options?: any): any {
    const size = this.regionSizeFor(this.optEntity(options, entity), 'toe');
    return this.measureWith('calculateToeSpread', size.x, 'm', options, { size });
  }
  /**
   * [0915] calculateToeCurl
   * Tính độ cuộn ngón chân.
   */
  public calculateToeCurl(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const e = this.jointEuler(subject, options, ['toe']);
    return this.measureWith('calculateToeCurl', Math.abs(e.x), 'rad', options);
  }
  /**
   * [0916] calculateToeDirection
   * Tính hướng ngón chân.
   */
  public calculateToeDirection(a?: any, b?: any): any {
    // Gốc ngón chân là bàn chân; đầu ngón là xương ngón.
    const base = this.markerPosition(a, ['ankle', 'foot'], 'getToeBasePosition');
    // `b` là vị trí đầu ngón tùy chọn (entity khác hoặc điểm tọa độ).
    const tip = this.markerFrom(b, ['toe'], 'getToeTipPosition') ?? this.markerPosition(a, ['toe'], 'getToeTipPosition');
    const direction = normalize(subtract(tip, base));
    return this.vector('calculateToeDirection', direction);
  }
  /**
   * [0917] calculateToeVelocity
   * Tính vận tốc ngón chân.
   */
  public calculateToeVelocity(entity?: any, dt = 0.016): any {
    const velocity = this.velocityFrom(entity, dt);
    return this.vector('calculateToeVelocity', velocity);
  }
  /**
   * [0918] calculateToeAcceleration
   * Tính gia tốc ngón chân.
   */
  public calculateToeAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    return this.vector('calculateToeAcceleration', acceleration);
  }
  /**
   * [0919] calculateToeJointAngles
   * Tính các góc khớp ngón chân.
   */
  public calculateToeJointAngles(a?: any, b?: any): any {
    const e = this.jointEuler(a, b, ['toe']);
    const angles = {
    metatarsophalangeal: e.x,
    proximal: e.x * 0.6,
    distal: e.x * 0.4
    };
    return { ...namedResult('calculateToeJointAngles', angles, { unit: 'rad' }), ...angles, unit: 'rad' };
  }
  /**
   * [0920] calculateToeBoundingBox
   * Tính hộp bao ngón chân.
   */
  public calculateToeBoundingBox(entity?: any, size?: Vec3D): any {
    const box = this.regionBox('toe', entity, size);
    return boundsResult('calculateToeBoundingBox', box);
  }
  /**
   * [0921] calculateStandingHeight
   * Tính chiều cao khi đứng.
   */
  public calculateStandingHeight(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const height = this.declaredNumber(subject, 'bodyHeight', BODY_DIMENSIONS.height);
    return this.measureWith('calculateStandingHeight', height, 'm', options);
  }
  /**
   * [0922] calculateBodyBalance
   * Tính độ cân bằng cơ thể.
   */
  public calculateBodyBalance(a?: any, b?: any, options?: any): any {
    // `b` là entity chân đế (vùng đỡ) thay thế cho `a`.
    const stance = b !== undefined && b !== null ? b : a;
    const support = this.baseOfSupportBox(stance);
    const gravity = this.centerOfGravityPoint(a);
    const inside =
    gravity.x >= support.min.x &&
    gravity.x <= support.max.x &&
    gravity.z >= support.min.z &&
    gravity.z <= support.max.z;
    const margin = Math.min(
    Math.min(gravity.x - support.min.x, support.max.x - gravity.x),
    Math.min(gravity.z - support.min.z, support.max.z - gravity.z)
    );
    const payload = this.applyOptions(
    { balanced: inside, margin: margin, centerOfGravity: gravity, baseOfSupport: support },
    options,
    { numeric: ['margin'], points: ['centerOfGravity'] },
    a,
    );
    return namedResult('calculateBodyBalance', payload);
  }
  /**
   * [0923] calculateCenterOfGravity
   * Tính trọng tâm cơ thể.
   */
  public calculateCenterOfGravity(a?: any, b?: any, options?: any): any {
    // `b` là entity chân đế (vùng đỡ) thay thế cho `a`.
    const stance = b !== undefined && b !== null ? b : a;
    const gravity = this.centerOfGravityPoint(a);
    const support = this.baseOfSupportBox(stance);
    const supported =
    gravity.x >= support.min.x &&
    gravity.x <= support.max.x &&
    gravity.z >= support.min.z &&
    gravity.z <= support.max.z;
    const payload = this.applyOptions(
    { position: gravity, height: gravity.y, supported: supported, baseOfSupport: support },
    options,
    { numeric: ['height'], points: ['position'] },
    a,
    );
    return namedResult('calculateCenterOfGravity', payload);
  }
  /**
   * [0924] calculateCenterOfMass
   * Tính tâm khối lượng cơ thể.
   */
  public calculateCenterOfMass(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const center = this.pointWith(this.centerOfGravityPoint(subject), subject, options);
    return {
    ...namedResult('calculateCenterOfMass', center, { mass: REFERENCE.bodyMass }),
    center: center,
    position: center,
    mass: REFERENCE.bodyMass
    };
  }
  /**
   * [0925] calculateBaseOfSupport
   * Tính vùng chân đế hỗ trợ cơ thể.
   */
  public calculateBaseOfSupport(a?: any, b?: any, options?: any): any {
    // `b` là entity chân đế (vùng đỡ) thay thế cho `a`.
    const stance = b !== undefined && b !== null ? b : a;
    const support = this.baseOfSupportBox(stance);
    const width = support.max.x - support.min.x;
    const depth = support.max.z - support.min.z;
    const center = { x: (support.min.x + support.max.x) * 0.5, y: 0, z: (support.min.z + support.max.z) * 0.5 };
    const payload = this.applyOptions(
    { box: support, area: width * depth, center: center, width: width, depth: depth },
    options,
    { numeric: ['area', 'width', 'depth'], points: ['center'] },
    a,
    );
    return namedResult('calculateBaseOfSupport', payload);
  }
  /**
   * [0926] calculateBalanceMargin
   * Tính biên an toàn cân bằng.
   */
  public calculateBalanceMargin(a?: any, b?: any, options?: any): any {
    // `b` là entity chân đế (vùng đỡ) thay thế cho `a`.
    const stance = b !== undefined && b !== null ? b : a;
    const gravity = this.centerOfGravityPoint(a);
    const support = this.baseOfSupportBox(stance);
    const margin = Math.min(
    Math.min(gravity.x - support.min.x, support.max.x - gravity.x),
    Math.min(gravity.z - support.min.z, support.max.z - gravity.z)
    );
    const payload = this.applyOptions({ margin: margin, stable: margin >= 0 }, options, { numeric: ['margin'] }, a);
    return namedResult('calculateBalanceMargin', payload, { support: support });
  }
  /**
   * [0927] calculateBodySway
   * Tính độ lắc cơ thể.
   */
  public calculateBodySway(a?: any, b?: any, options?: any): any {
    // `b` là entity chân đế (vùng đỡ) thay thế cho `a`.
    const stance = b !== undefined && b !== null ? b : a;
    const gravity = this.centerOfGravityPoint(a);
    const support = this.baseOfSupportBox(stance);
    const center = { x: (support.min.x + support.max.x) * 0.5, y: 0, z: (support.min.z + support.max.z) * 0.5 };
    const offset = { x: gravity.x - center.x, y: 0, z: gravity.z - center.z };
    const payload = this.applyOptions({ sway: distance2D(gravity, center), offset: offset }, options, { numeric: ['sway'], vectors: ['offset'] }, a);
    return namedResult('calculateBodySway', payload, { center: center });
  }
  /**
   * [0928] calculateBodyLean
   * Tính độ nghiêng cơ thể.
   */
  public calculateBodyLean(a?: any, b?: any, options?: any): any {
    const e = this.jointEuler(a, b, ['torso', 'spine']);
    const lean = Math.hypot(e.x, e.z);
    const direction = normalize({ x: Math.sin(e.z), y: 0, z: Math.sin(e.x) });
    const payload = this.applyOptions({ lean: lean, angle: lean, direction: direction, euler: e }, options, { numeric: ['lean', 'angle'], directions: ['direction'] }, a);
    return namedResult('calculateBodyLean', payload);
  }
  /**
   * [0929] calculatePostureStability
   * Tính độ ổn định tư thế.
   */
  public calculatePostureStability(a?: any, b?: any, options?: any): any {
    const torso = this.jointEuler(a, b, ['torso', 'spine']);
    const leg = this.jointEuler(a, b, ['thigh']);
    const deviation = Math.hypot(torso.x, torso.y, torso.z) + Math.hypot(leg.x, leg.y, leg.z);
    const stability = clamp01(1 - deviation / (2 * Math.PI));
    const payload = this.applyOptions({ stability: stability, deviation: deviation, torso: torso, leg: leg }, options, { numeric: ['deviation'], invertOnly: ['stability'] }, a);
    return namedResult('calculatePostureStability', payload);
  }
  /**
   * [0930] calculateStandingPoseError
   * Tính sai lệch tư thế đứng.
   */
  public calculateStandingPoseError(a?: any, b?: any, options?: any): any {
    const error = this.poseError(a, b);
    return namedResult('calculateStandingPoseError', this.applyOptions(error, options, { numeric: ['positionError', 'rotationError'] }, a));
  }
  /**
   * [0931] calculateSittingHeight
   * Tính chiều cao khi ngồi.
   */
  public calculateSittingHeight(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const height = this.declaredNumber(subject, 'bodyHeight', BODY_DIMENSIONS.height) * 0.52;
    return this.measureWith('calculateSittingHeight', height, 'm', options);
  }
  /**
   * [0932] calculateSittingPose
   * Tính tư thế ngồi.
   */
  public calculateSittingPose(a?: any, b?: any, options?: any): any {
    const hip = this.jointEuler(a, b, ['thigh']);
    const knee = this.jointEuler(a, b, ['knee', 'shin']);
    const ankle = this.jointEuler(a, b, ['ankle', 'foot']);
    const seated = Math.abs(hip.x) > Math.PI / 6;
    const payload = this.applyOptions(
    { seated: seated, hipAngle: Math.abs(hip.x), kneeAngle: Math.abs(knee.x), ankleAngle: Math.abs(ankle.x) },
    options,
    { numeric: ['hipAngle', 'kneeAngle', 'ankleAngle'] },
    a,
    );
    return namedResult('calculateSittingPose', payload);
  }
  /**
   * [0933] calculateSquatDepth
   * Tính độ sâu động tác ngồi xổm.
   */
  public calculateSquatDepth(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    return this.measureWith('calculateSquatDepth', legLength * 0.4, 'm', options, { legLength: legLength });
  }
  /**
   * [0934] calculateJumpHeight
   * Tính độ cao nhảy.
   */
  public calculateJumpHeight(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const velocity = this.entityVector(subject, 'velocity');
    const takeoff = Math.max(0, velocity.y);
    const height = (takeoff * takeoff) / (2 * REFERENCE.gravity);
    return this.measureWith('calculateJumpHeight', height, 'm', options, { takeoffVelocity: takeoff });
  }
  /**
   * [0935] calculateLandingImpact
   * Ước lượng lực va chạm khi tiếp đất.
   */
  public calculateLandingImpact(a?: any, b?: any, options?: any): any {
    // `b` là entity mang vận tốc tiếp đất thay thế cho `a`.
    const source = b !== undefined && b !== null ? b : a;
    const velocity = this.entityVector(source, 'velocity');
    const speed = Math.max(0, -velocity.y);
    const force = REFERENCE.bodyMass * (REFERENCE.gravity + speed);
    const sole = this.landmarkPosition('getFootSolePosition', a);
    const penetration = Math.max(0, -sole.y);
    const payload = this.applyOptions(
    { impact: speed, force: force, penetration: penetration, speed: speed },
    options,
    { numeric: ['impact', 'force', 'penetration', 'speed'] },
    a,
    );
    return namedResult('calculateLandingImpact', payload, { sole: sole });
  }
  /**
   * [0936] calculateGroundReactionForce
   * Ước lượng phản lực mặt đất.
   */
  public calculateGroundReactionForce(entity?: any, dt = 0.016): any {
    const acceleration = this.accelerationFrom(entity, dt);
    const force = scale(add({ x: 0, y: REFERENCE.gravity, z: 0 }, acceleration), REFERENCE.bodyMass);
    return this.vector('calculateGroundReactionForce', force);
  }
  /**
   * [0937] calculateGaitCycle
   * Tính chu kỳ dáng đi.
   */
  public calculateGaitCycle(a?: any, b?: any, options?: any): any {
    // `b` là entity mang vị trí thay thế cho `a`.
    const source = b !== undefined && b !== null ? b : a;
    const legLength = this.declaredNumber(source, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(source, 'shinLength', BODY_DIMENSIONS.shinLength);
    // `options.scale` co giãn bước chân ⇒ đổi cả pha và chu kỳ.
    const stride = legLength * REFERENCE.strideRatio * this.optScale(options);
    const position = entityPosition(source);
    const phase = ((position.z / stride) % 1 + 1) % 1;
    const payload = this.applyOptions(
    { phase: phase, stance: 0.6, swing: 0.4, cycle: stride * 2, stride: stride },
    options,
    { invertOnly: ['phase'] },
    source,
    );
    return namedResult('calculateGaitCycle', payload);
  }
  /**
   * [0938] calculateGaitPhase
   * Xác định pha của chu kỳ dáng đi.
   */
  public calculateGaitPhase(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    // `options.scale` co giãn bước chân ⇒ pha dáng đi thay đổi theo.
    const stride = legLength * REFERENCE.strideRatio * this.optScale(options);
    const position = entityPosition(subject);
    let phase = ((position.z / stride) % 1 + 1) % 1;
    if (this.optInvert(options)) phase = -phase;
    return this.measure('calculateGaitPhase', phase, this.optUnit(options, 'phase'), { stride: stride });
  }
  /**
   * [0939] calculateStepFrequency
   * Tính tần số bước chân.
   */
  public calculateStepFrequency(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    const stride = legLength * REFERENCE.strideRatio;
    const frequency = REFERENCE.walkingSpeed / stride;
    return this.measureWith('calculateStepFrequency', frequency, 'Hz', options, { stride: stride });
  }
  /**
   * [0940] calculateWalkingSpeed
   * Tính tốc độ đi bộ.
   */
  public calculateWalkingSpeed(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const velocity = this.entityVector(subject, 'velocity');
    const speed = Math.hypot(velocity.x, velocity.z);
    const value = speed > 1e-6 ? speed : REFERENCE.walkingSpeed;
    return this.measureWith('calculateWalkingSpeed', value, 'm/s', options);
  }
  /**
   * [0941] calculateRunningSpeed
   * Tính tốc độ chạy.
   */
  public calculateRunningSpeed(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const velocity = this.entityVector(subject, 'velocity');
    const speed = Math.hypot(velocity.x, velocity.z);
    const value = Math.max(REFERENCE.runningSpeed, speed);
    return this.measureWith('calculateRunningSpeed', value, 'm/s', options);
  }
  /**
   * [0942] calculateStrideWidth
   * Tính chiều rộng bước chân.
   */
  public calculateStrideWidth(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const left = this.landmarkPosition('getLeftFootPosition', subject);
    const right = this.landmarkPosition('getRightFootPosition', subject);
    return this.measureWith('calculateStrideWidth', Math.abs(right.x - left.x), 'm', options);
  }
  /**
   * [0943] calculateStrideSymmetry
   * Tính độ đối xứng bước chân.
   */
  public calculateStrideSymmetry(a?: any, b?: any, options?: any): any {
    const score = this.symmetryScore(a, b, BODY_DIMENSIONS.hipWidth);
    return namedResult('calculateStrideSymmetry', this.applyOptions(score, options, { numeric: ['symmetry', 'difference'], points: ['left', 'right'] }, a));
  }
  /**
   * [0944] calculateFootPlacement
   * Tính vị trí đặt chân.
   */
  public calculateFootPlacement(a?: any, b?: any, options?: any): any {
    const foot = this.landmarkPosition('getFootCenter', a);
    const target = b !== undefined && b !== null ? pointOf(b) : foot;
    const error = distance3D(foot, target);
    const payload = this.applyOptions({ position: foot, target: target, error: error }, options, { numeric: ['error'], points: ['position', 'target'] }, a);
    return namedResult('calculateFootPlacement', payload);
  }
  /**
   * [0945] calculateFootPlacementError
   * Tính sai lệch vị trí đặt chân.
   */
  public calculateFootPlacementError(a?: any, b?: any, options?: any): any {
    const foot = this.landmarkPosition('getFootCenter', a);
    const target = b !== undefined && b !== null ? pointOf(b) : foot;
    const error = distance3D(foot, target);
    const payload = this.applyOptions({ error: error, offset: subtract(foot, target) }, options, { numeric: ['error'], vectors: ['offset'] }, a);
    return namedResult('calculateFootPlacementError', payload);
  }
  /**
   * [0946] calculateGroundPenetration
   * Tính độ xuyên chân xuống mặt đất.
   */
  public calculateGroundPenetration(a?: any, b?: any, options?: any): any {
    // `b` là vị trí đế bàn chân tùy chọn (entity khác hoặc điểm tọa độ).
    const sole = this.landmarkFrom(b, 'getFootSolePosition') ?? this.landmarkPosition('getFootSolePosition', a);
    const ground = num(options?.groundY, 0);
    const penetration = Math.max(0, ground - sole.y);
    const payload = this.applyOptions(
    { penetration: penetration, depth: penetration, sole: sole, ground: ground },
    options,
    { numeric: ['penetration', 'depth'], points: ['sole'] },
    a,
    );
    return namedResult('calculateGroundPenetration', payload);
  }
  /**
   * [0947] calculateGroundAlignment
   * Tính độ căn chỉnh chân với mặt đất.
   */
  public calculateGroundAlignment(a?: any, b?: any, options?: any): any {
    const heel = this.landmarkPosition('getFootHeelPosition', a);
    // `b` là vị trí ngón chân tùy chọn (entity khác hoặc điểm tọa độ).
    const toe = this.landmarkFrom(b, 'getFootToePosition') ?? this.landmarkPosition('getFootToePosition', a);
    const tilt = Math.atan2(toe.y - heel.y, Math.max(1e-6, distance2D(heel, toe)));
    const alignment = clamp01(1 - Math.abs(tilt) / (Math.PI / 4));
    const payload = this.applyOptions({ alignment: alignment, tilt: tilt, heel: heel, toe: toe }, options, { numeric: ['tilt'], invertOnly: ['alignment'], points: ['heel', 'toe'] }, a);
    return namedResult('calculateGroundAlignment', payload);
  }
  /**
   * [0948] calculateLegSupportPhase
   * Xác định pha chân trụ.
   */
  public calculateLegSupportPhase(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    // `options.scale` co giãn bước chân ⇒ pha chu kỳ thay đổi theo.
    const stride = legLength * REFERENCE.strideRatio * this.optScale(options);
    const position = entityPosition(subject);
    const phase = ((position.z / stride) % 1 + 1) % 1;
    const stance = this.optInvert(options) ? -0.6 : 0.6;
    return this.measure('calculateLegSupportPhase', stance, this.optUnit(options, 'phase'), { stance: stance, cyclePhase: phase });
  }
  /**
   * [0949] calculateSwingPhase
   * Xác định pha chân vung.
   */
  public calculateSwingPhase(entity?: any, options?: any): any {
    const subject = this.optEntity(options, entity);
    const legLength = this.declaredNumber(subject, 'thighLength', BODY_DIMENSIONS.thighLength)
      + this.declaredNumber(subject, 'shinLength', BODY_DIMENSIONS.shinLength);
    // `options.scale` co giãn bước chân ⇒ pha chu kỳ thay đổi theo.
    const stride = legLength * REFERENCE.strideRatio * this.optScale(options);
    const position = entityPosition(subject);
    const phase = ((position.z / stride) % 1 + 1) % 1;
    const swing = this.optInvert(options) ? -0.4 : 0.4;
    return this.measure('calculateSwingPhase', swing, this.optUnit(options, 'phase'), { swing: swing, cyclePhase: phase });
  }
  /**
   * [0950] calculateLocomotionDirection
   * Tính hướng di chuyển cơ thể.
   */
  public calculateLocomotionDirection(a?: any, b?: any): any {
    const motion = this.motionVector(a, b);
    return this.vector('calculateLocomotionDirection', normalize(motion));
  }

  // ==========================================================================
  // Hỗ trợ nội bộ
  // ==========================================================================

  /**
   * Offset giải phẫu của một mốc.
   *
   * Ưu tiên bảng chuẩn `bodyOffset()` (LEG_LANDMARKS…), sau đó tới bảng dẫn xuất
   * `LANDMARK_OFFSETS` cho các mốc chỉ có trong subsystem này.
   */
  private landmarkOffset(name: string): Vec3D {
    const standard = bodyOffset(name);
    if (standard) return { ...standard };
    const derived = LANDMARK_OFFSETS[name];
    return derived ? { ...derived } : { x: 0, y: 0, z: 0 };
  }

  /** Vị trí tuyệt đối của một mốc: neo của entity + offset giải phẫu + offset thêm. */
  private landmarkPosition(name: string, entity: unknown, extra?: Vec3D): Vec3D {
    const base = entityPosition(entity);
    const off = this.landmarkOffset(name);
    return {
      x: base.x + off.x + (extra?.x ?? 0),
      y: base.y + off.y + (extra?.y ?? 0),
      z: base.z + off.z + (extra?.z ?? 0)
    };
  }

  /**
   * Vị trí thế giới của một xương theo tên — `null` nếu entity không có cây
   * xương (skeleton/bones/children).
   *
   * Dùng forward kinematics nên vị trí xương phản ánh TƯ THẾ thật, không phải
   * offset giải phẫu tĩnh.
   */
  private boneWorldPosition(entity: any, boneNames: string[]): Vec3D | null {
    const skeleton = buildSkeleton(entity);
    if (!skeleton) return null;
    const positions = forwardKinematics(skeleton);
    const names = allBones(skeleton).map((b) => b.name);
    for (const wanted of boneNames) {
      const key = names.find((n) => n.toLowerCase().includes(wanted.toLowerCase()));
      if (!key) continue;
      const found = positions[key];
      if (found) return { ...found };
    }
    return null;
  }

  /**
   * Vị trí một mốc: ưu tiên XƯƠNG THẬT (nếu entity có cây xương), fallback về
   * offset giải phẫu tĩnh khi không có dữ liệu xương.
   *
   * Nhờ vậy hướng/pháp tuyến của khớp phản ánh tư thế thay vì luôn trả về
   * cùng một hằng số.
   */
  private markerPosition(entity: any, boneNames: string[], landmark: string): Vec3D {
    const fromBone = this.boneWorldPosition(entity, boneNames);
    if (fromBone) return fromBone;
    return this.landmarkPosition(landmark, entity);
  }

  /** Kích thước hộp bao của một vùng cơ thể. */
  private regionSize(region: string): Vec3D {
    return { ...(REGION_SIZES[region] ?? { x: 1, y: 1, z: 1 }) };
  }

  /** Hộp bao AABB của vùng cơ thể, tâm tại vị trí entity. */
  private regionBox(region: string, entity: unknown, size?: Vec3D): Box3D {
    const s = size ? toVec3(size) : this.regionSize(region);
    return boundingBox(entityPosition(entity), s);
  }

  /** Số đo vô hướng kèm đơn vị (`name`, `value`, `unit`, `valid`, `timestamp`). */
  private measure(name: string, value: number, unit: string, extra?: Record<string, unknown>): Record<string, unknown> {
    return measurement(name, value, unit, extra);
  }

  /**
   * Kết quả vector (hướng / vận tốc / gia tốc).
   *
   * Giữ luôn `x`/`y`/`z` ở cấp trên cùng để tương thích với API cũ trả
   * `{x, y, z}`, đồng thời bọc theo `directionResult` của spatial-primitives.
   */
  private vector(name: string, v: Vec3D, extra?: Record<string, unknown>): Record<string, unknown> {
    return { ...v, ...directionResult(name, v, extra) };
  }

  /**
   * Kết quả quaternion.
   *
   * Giữ `x`/`y`/`z`/`w` ở cấp trên cùng (API cũ trả quaternion trần) và
   * `orientation` bên trong (chuẩn `orientationResult`).
   */
  private orientation(name: string, q: QuatD, extra?: Record<string, unknown>): Record<string, unknown> {
    return { ...q, ...orientationResult(name, q, extra) };
  }

  /** Đọc một trường vector của entity (`velocity`, `acceleration`, `angularVelocity`…). */
  private entityVector(entity: any, field: string): Vec3D {
    if (!entity || typeof entity !== 'object') return { x: 0, y: 0, z: 0 };
    const v = (entity as Record<string, unknown>)[field];
    return v && typeof v === 'object' ? toVec3(v) : { x: 0, y: 0, z: 0 };
  }

  /**
   * Tìm quaternion của xương theo tên.
   *
   * Thứ tự ưu tiên: `options.bones` → `entity.children` → `options.children`;
   * nếu không có xương nào thì dùng quaternion của chính entity; cuối cùng là
   * quaternion đơn vị (`w = 1`).
   */
  private boneQuaternion(entityOrAngle: any, options: any, boneNames: string[]): { q: QuatD; bone: string } {
    const pool: any[] = [];
    if (Array.isArray(options?.bones)) pool.push(...options.bones);
    if (Array.isArray(entityOrAngle?.children)) pool.push(...entityOrAngle.children);
    if (Array.isArray(options?.children)) pool.push(...options.children);

    // `options.bone` ghi đè xương mặc định của hàm.
    const wanted = this.optBone(options);
    const searchNames = wanted !== undefined ? [wanted, ...boneNames] : boneNames;
    for (const boneName of searchNames) {
      const found = pool.find(
        (b: any) => typeof b?.name === 'string' && b.name.toLowerCase().includes(boneName.toLowerCase()),
      );
      if (found) return { q: asQuaternion(found), bone: String(found.name) };
    }

    for (const src of [entityOrAngle, options]) {
      if (src && typeof src === 'object') {
        const v = src as Record<string, unknown>;
        if (v.quaternion || v.rotation || typeof v.w === 'number') {
          return { q: asQuaternion(src), bone: typeof v.name === 'string' ? String(v.name) : 'entity' };
        }
      }
    }
    return { q: { ...IDENTITY_QUAT }, bone: 'none' };
  }

  /**
   * Góc Euler (XYZ) của khớp.
   *
   * Tìm xương khớp trong `children` của các đối số đầu vào; nếu không có thì
   * dùng quaternion của chính entity; không có dữ liệu ⇒ góc bằng 0.
   */
  private jointEuler(a: any, b: any, boneNames: string[]): { x: number; y: number; z: number } {
    for (const src of [a, b]) {
      if (!src || typeof src !== 'object') continue;
      const record = src as Record<string, unknown>;
      const children = record.children;
      if (Array.isArray(children)) {
        for (const boneName of boneNames) {
          const found = children.find(
            (c: any) => typeof c?.name === 'string' && c.name.toLowerCase().includes(boneName.toLowerCase()),
          );
          if (found) return quaternionToEuler(asQuaternion(found));
        }
      }
      if (record.quaternion || record.rotation) return quaternionToEuler(asQuaternion(src));
    }
    return { x: 0, y: 0, z: 0 };
  }

  /**
   * Khoảng cách giữa hai mốc giải phẫu.
   *
   * - Có cả hai đối số: entity (`có position`) được xem là neo của mốc tương
   *   ứng; điểm thô được dùng trực tiếp làm vị trí mốc.
   * - Thiếu một đối số: đo giữa hai mốc tính từ cùng một neo.
   */
  private pairDistance(a: any, b: any, keyA: string, keyB: string): number {
    const hasA = a !== undefined && a !== null;
    const hasB = b !== undefined && b !== null;
    if (hasA && hasB) {
      const pa = isAnchored(a) ? add(entityPosition(a), PAIR_LANDMARKS[keyA]) : pointOf(a);
      const pb = isAnchored(b) ? add(entityPosition(b), PAIR_LANDMARKS[keyB]) : pointOf(b);
      return distance3D(pa, pb);
    }
    const anchor = hasA ? pointOf(a) : { x: 0, y: 0, z: 0 };
    return distance3D(add(anchor, PAIR_LANDMARKS[keyA]), add(anchor, PAIR_LANDMARKS[keyB]));
  }

  /** Khoảng cách từ vật thể đang cầm tới một mốc bên ngoài (tay, cổ tay, camera…). */
  private heldObjectDistance(a: any, b: any, key: string): number {
    const object = pointOf(a);
    const other = b !== undefined && b !== null ? pointOf(b) : add(object, PAIR_LANDMARKS[key]);
    return distance3D(object, other);
  }

  /** Kích thước vật thể đang cầm (theo `size`/`scale` của entity, mặc định 0.15³). */
  private heldObjectSize(entity: any): Vec3D {
    const base = REGION_SIZES.heldObject;
    const source = entity?.size ?? entity?.dimensions ?? entity?.bounds;
    if (source && typeof source === 'object') {
      const s = toVec3(source);
      if (s.x > 0 && s.y > 0 && s.z > 0) return s;
    }
    const scalar = entity?.scale;
    if (typeof scalar === 'number' && scalar > 0) {
      return { x: base.x * scalar, y: base.y * scalar, z: base.z * scalar };
    }
    if (scalar && typeof scalar === 'object') {
      const s = toVec3(scalar);
      if (s.x > 0 && s.y > 0 && s.z > 0) return s;
    }
    return { ...base };
  }

  /**
   * Giá trị tham số mặc định (sentinel) được hiểu là "tự tính".
   *
   * Ví dụ `calculateThighBoundingSphere(entity, radius = 1.0)`: `radius = 1.0`
   * là giá trị mặc định của chữ ký nên khi đó bán kính được tính từ nửa đường
   * chéo hộp bao của vùng; người gọi truyền giá trị khác thì dùng giá trị đó.
   */
  private autoValue(value: number, sentinel: number, fallback: number): number {
    return value === sentinel ? fallback : value;
  }

  /** Bán kính bao: nửa đường chéo hộp bao của vùng, trừ khi người gọi ghi đè. */
  private autoRadius(radius: number, size: Vec3D): number {
    return this.autoValue(radius, 1.0, Math.hypot(size.x, size.y, size.z) * 0.5);
  }

  /** Pháp tuyến bề mặt: hướng từ `a` tới `b`, nếu không có dữ liệu thì dùng `fallback`. */
  private surfaceNormal(a: any, b: any, fallback: Vec3D): Vec3D {
    if (b !== undefined && b !== null) {
      const n = normalize(subtract(pointOf(b), pointOf(a)));
      if (n.x !== 0 || n.y !== 0 || n.z !== 0) return n;
    }
    return { ...fallback };
  }

  /** Vector chuyển động: độ dời `a → b`, nếu không có thì vận tốc của entity. */
  private motionVector(a: any, b: any): Vec3D {
    if (b !== undefined && b !== null) {
      const v = subtract(pointOf(b), pointOf(a));
      if (magnitude(v) > 1e-9) return v;
    }
    const velocity = this.entityVector(a, 'velocity');
    if (magnitude(velocity) > 1e-9) return velocity;
    return { ...entityForward(a) };
  }

  /** Tâm khối lượng của một vùng: 0.4·chiều dài tính từ đầu gần (proximal). */
  private centerOfMassPoint(entity: unknown, baseY: number, sizeY: number): Vec3D {
    return add(entityPosition(entity), { x: 0, y: baseY + sizeY * 0.6, z: 0 });
  }

  /**
   * Trọng tâm cơ thể.
   *
   * Người trưởng thành có trọng tâm ở khoảng 0.55·chiều cao tính từ mặt đất;
   * khung hông đặt hông ở 0.53·chiều cao nên trọng tâm nằm nhẹ phía trên hông.
   */
  private centerOfGravityPoint(entity: unknown): Vec3D {
    const height = BODY_DIMENSIONS.height;
    const gravityHeight = height * 0.55;
    const hipHeight = height * 0.53;
    return add(entityPosition(entity), { x: 0, y: gravityHeight - hipHeight, z: 0 });
  }

  /** Vùng chân đế hỗ trợ: hộp bao bao quanh cả hai bàn chân. */
  private baseOfSupportBox(entity: unknown): Box3D {
    const size = this.regionSize('foot');
    const left = this.landmarkPosition('getLeftFootPosition', entity);
    const right = this.landmarkPosition('getRightFootPosition', entity);
    return {
      min: {
        x: Math.min(left.x, right.x) - size.x * 0.5,
        y: 0,
        z: Math.min(left.z, right.z) - size.z * 0.5
      },
      max: {
        x: Math.max(left.x, right.x) + size.x * 0.5,
        y: 0,
        z: Math.max(left.z, right.z) + size.z * 0.5
      }
    };
  }

  /** Khoảng cách từ điểm thấp nhất của vùng tới mặt đất (y = 0 nếu không chỉ định). */
  private groundClearance(entity: unknown, lowestY: number, options?: any): number {
    const ground = num(options?.groundY, 0);
    const position = entityPosition(entity);
    return Math.max(0, position.y + lowestY - ground);
  }

  /**
   * Độ đối xứng giữa hai phía của cơ thể.
   *
   * Một bên được phản chiếu qua trục giữa rồi so với bên còn lại; đối xứng
   * hoàn hảo ⇒ 1, lệch nhiều ⇒ 0.
   */
  private symmetryScore(a: any, b: any, width: number): { symmetry: number; difference: number; left: Vec3D; right: Vec3D } {
    const left = pointOf(a);
    const right = b !== undefined && b !== null ? pointOf(b) : { x: left.x + width, y: left.y, z: left.z };
    const midX = left.x + width * 0.5;
    const mirrored = { x: 2 * midX - right.x, y: right.y, z: right.z };
    const difference = distance3D(left, mirrored);
    const symmetry = clamp01(1 - difference / Math.max(1e-6, width));
    return { symmetry, difference, left, right };
  }

  /** Sai lệch tư thế giữa tư thế đích (`a`) và tư thế hiện tại (`b`). */
  private poseError(a: any, b: any): { positionError: number; rotationError: number } {
    const target = pointOf(a);
    const current = b !== undefined && b !== null ? pointOf(b) : target;
    const ea = this.jointEuler(a, b, []);
    const eb = b !== undefined && b !== null ? this.jointEuler(b, undefined, []) : ea;
    const rotationError = Math.hypot(ea.x - eb.x, ea.y - eb.y, ea.z - eb.z);
    return { positionError: distance3D(target, current), rotationError };
  }

  /** Độ mượt của chuyển động, dựa trên gia tốc của entity. */
  private motionSmoothness(entity: any): {
    smoothness: number;
    jerk: number;
    acceleration: number;
    velocity: number;
  } {
    const velocity = this.entityVector(entity, 'velocity');
    const acceleration = this.entityVector(entity, 'acceleration');
    const jerk = magnitude(acceleration);
    return {
      smoothness: clamp01(1 - jerk / 20),
      jerk,
      acceleration: magnitude(acceleration),
      velocity: magnitude(velocity)
    };
  }

  /** Chuỗi khớp: vị trí từng khớp và tổng chiều dài chuỗi. */
  private jointChain(name: string, a: any, chainNames: string[]): Record<string, unknown> {
    const joints = chainNames.map((n) => this.landmarkPosition(n, a));
    let length = 0;
    for (let i = 1; i < joints.length; i++) length += distance3D(joints[i - 1], joints[i]);
    return namedResult(name, { joints, names: chainNames, length, count: joints.length });
  }

  /**
   * Chuỗi khớp có tuỳ chọn.
   *
   * `b` là mảng khớp tùy biến (điểm tọa độ hoặc tên mốc) ⇒ thay chuỗi mặc
   * định; `options.scale` nhân tổng chiều dài chuỗi.
   */
  private jointChainWith(name: string, a: any, b: any, chainNames: string[], options?: any): Record<string, unknown> {
    if (Array.isArray(b)) {
      const joints = b.map((p) => (typeof p === 'string' ? this.landmarkPosition(p, a) : pointOf(p)));
      const names = b.map((p) => (typeof p === 'string' ? p : chainNames[chainNames.length - 1]));
      let length = 0;
      for (let i = 1; i < joints.length; i++) length += distance3D(joints[i - 1], joints[i]);
      return namedResult(name, this.applyOptions({ joints: joints, names: names, length: length, count: joints.length }, options, { numeric: ['length'] }, a));
    }
    return this.applyOptions(this.jointChain(name, a, chainNames), options, { numeric: ['length'] }, a);
  }

  /** Giải pháp IK: vị trí đạt được, sai số tới đích và góc các khớp. */
  private inverseKinematics(
    name: string,
    a: any,
    b: any,
    options: any,
    chain: string[],
  ): Record<string, unknown> {
    const reached = this.landmarkPosition(chain[chain.length - 1], a);
    const target = b !== undefined && b !== null ? pointOf(b) : reached;
    const error = distance3D(target, reached);
    const e = this.jointEuler(a, b, chain);
    return namedResult(
      name,
      {
        target,
        reached,
        error,
        iterations: num(options?.iterations, 1),
        angles: { hip: e.x, knee: e.y, ankle: e.z }
      },
      { chain },
    );
  }

  /** Độ dày của vùng giữa hai mặt đối diện. */
  private thickness(name: string, a: any, b: any, region: string, options?: any): Record<string, unknown> {
    const size = this.regionSize(region);
    const from = pointOf(a);
    const to = b !== undefined && b !== null ? pointOf(b) : add(from, { x: 0, y: 0, z: size.z });
    const payload = this.applyOptions(
      { thickness: distance3D(from, to), from, to },
      options,
      { numeric: ['thickness'], points: ['from', 'to'] },
      a,
    );
    return namedResult(name, payload, { region, size });
  }

  /** Tiếp xúc bàn chân – mặt đất: điểm, pháp tuyến, diện tích và độ xuyên lấn. */
  private footGroundContact(name: string, a: any, b: any, options?: any): Record<string, unknown> {
    const foot = pointOf(a);
    const sole = add(foot, { x: 0, y: -0.04, z: 0.04 });
    const contact = b !== undefined && b !== null ? pointOf(b) : { x: sole.x, y: 0, z: sole.z };
    const penetration = Math.max(0, -sole.y);
    const area = REGION_SIZES.foot.x * REGION_SIZES.foot.z * 0.25;
    const payload = this.applyOptions(
      { contact: contact, point: contact, normal: { x: 0, y: 1, z: 0 }, penetration: penetration, area: area },
      options,
      { numeric: ['penetration', 'area'], points: ['contact', 'point'] },
      a,
    );
    return namedResult(name, payload, { sole });
  }

  // ==========================================================================
  // Bộ tuỳ chọn thống nhất (options.*) — dùng chung cho mọi hàm của subsystem
  // ==========================================================================

  /**
   * Hệ số nhân `options.scale` — mặc định 1.
   */
  private optScale(options: any): number {
    const s = num(options?.scale, 1);
    return Number.isFinite(s) ? s : 1;
  }

  /**
   * Đơn vị trả về `options.unit` — mặc định theo hợp đồng của hàm.
   */
  private optUnit(options: any, fallback: string): string {
    const u = options?.unit;
    return typeof u === 'string' && u.length > 0 ? u : fallback;
  }

  /**
   * Khung tham chiếu `options.reference` — `'world'` (mặc định) | `'local'`.
   */
  private optReference(options: any): 'world' | 'local' {
    return options?.reference === 'local' ? 'local' : 'world';
  }

  /**
   * Cờ đảo dấu `options.invert` — mặc định `false`.
   */
  private optInvert(options: any): boolean {
    return options?.invert === true;
  }

  /**
   * Phía cơ thể `options.side` — mặc định là phía mà hàm đại diện.
   */
  private optSide(options: any, fallback: 'left' | 'right' = 'left'): 'left' | 'right' {
    if (options?.side === 'right') return 'right';
    if (options?.side === 'left') return 'left';
    return fallback;
  }

  /**
   * Tên xương cụ thể `options.bone` — `undefined` nếu không chỉ định.
   */
  private optBone(options: any): string | undefined {
    const b = options?.bone;
    return typeof b === 'string' && b.length > 0 ? b : undefined;
  }

  /**
   * Entity thay thế `options.entity` — mặc định là chính tham số `entity`.
   */
  private optEntity(options: any, fallback: any): any {
    const e = options?.entity;
    return e !== undefined && e !== null ? e : fallback;
  }

  /**
   * Phép đo vô hướng đã áp dụng tuỳ chọn.
   *
   * `options.scale` nhân vào giá trị, `options.invert` đảo dấu, `options.unit`
   * ghi đè đơn vị. Không truyền `options` ⇒ kết quả y hệt `measure()`.
   */
  private measureWith(
    name: string,
    value: number,
    unit: string,
    options?: any,
    extra?: Record<string, unknown>,
  ): Record<string, unknown> {
    const scaled = value * this.optScale(options);
    const finalValue = this.optInvert(options) ? -scaled : scaled;
    return this.measure(name, finalValue, this.optUnit(options, unit), extra);
  }

  /**
   * Vector đã áp dụng tuỳ chọn.
   *
   * `options.scale` nhân vector, `options.invert` đảo dấu, `options.reference`
   * = `'local'` ⇒ đưa vector về khung cục bộ của entity.
   */
  private vectorWith(
    name: string,
    v: Vec3D,
    options: any,
    entity?: any,
    extra?: Record<string, unknown>,
  ): Record<string, unknown> {
    let out = scale(v, this.optScale(options));
    if (this.optReference(options) === 'local' && entity !== undefined && entity !== null) {
      out = this.toLocalDirection(entity, out);
    }
    if (this.optInvert(options)) out = { x: -out.x, y: -out.y, z: -out.z };
    return this.vector(name, out, extra);
  }

  /**
   * Điểm đã áp dụng tuỳ chọn.
   *
   * `options.scale` nhân khoảng cách từ neo của entity; `options.reference` =
   * `'local'` ⇒ trả về khoảng cách tương đối so với neo.
   */
  private pointWith(p: Vec3D, entity: any, options: any): Vec3D {
    const anchor = entityPosition(entity);
    const offset = scale(subtract(p, anchor), this.optScale(options));
    return this.optReference(options) === 'local' ? offset : add(anchor, offset);
  }

  /**
   * Áp dụng tuỳ chọn lên payload của một kết quả có tên.
   *
   * - `numeric`: trường số được nhân theo `options.scale`, đảo dấu theo
   *   `options.invert`.
   * - `vectors`: trường vector được nhân theo `options.scale`, đảo dấu theo
   *   `options.invert`.
   * - `invertOnly`: trường chỉ được đảo dấu theo `options.invert` (dành cho
   *   điểm số đã tính từ hình học đã nhân sẵn).
   * - `points`: trường điểm được đổi khung theo `options.reference`.
   * - `directions`: trường hướng được đưa về khung cục bộ theo `options.reference`.
   */
  private applyOptions(
    payload: Record<string, unknown>,
    options: any,
    spec: {
    numeric?: string[];
    vectors?: string[];
    invertOnly?: string[];
    points?: string[];
    directions?: string[];
    },
    entity?: any,
  ): Record<string, unknown> {
    const factor = this.optScale(options);
    const invert = this.optInvert(options);
    const out: Record<string, unknown> = { ...payload };
    for (const key of spec.numeric ?? []) {
      const v = out[key];
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      const scaled = v * factor;
      out[key] = invert ? -scaled : scaled;
    }
    for (const key of spec.vectors ?? []) {
      const v = out[key];
      if (!v || typeof v !== 'object') continue;
      const s = scale(toVec3(v), factor);
      out[key] = invert ? { x: -s.x, y: -s.y, z: -s.z } : s;
    }
    for (const key of spec.invertOnly ?? []) {
      const v = out[key];
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      out[key] = invert ? -v : v;
    }
    if (this.optReference(options) === 'local' && entity !== undefined && entity !== null) {
      for (const key of spec.points ?? []) {
        const v = out[key];
        if (v && typeof v === 'object') out[key] = this.pointWith(toVec3(v), entity, options);
      }
      for (const key of spec.directions ?? []) {
        const v = out[key];
        if (v && typeof v === 'object') out[key] = this.toLocalDirection(entity, toVec3(v));
      }
    }
    return out;
  }

  /**
   * Kích thước vùng cơ thể của một entity cụ thể.
   *
   * Entity có thể khai báo kích thước riêng cho từng vùng qua
   * `entity.regionSizes = { torso: { x, y, z } }`; không khai báo ⇒ dùng bảng
   * chuẩn `REGION_SIZES` (hành vi mặc định không đổi).
   */
  private regionSizeFor(entity: unknown, region: string): Vec3D {
    const declared = (entity as any)?.regionSizes?.[region];
    if (declared && typeof declared === 'object') {
      const v = toVec3(declared);
      if (v.x > 0 && v.y > 0 && v.z > 0) return v;
    }
    return this.regionSize(region);
  }

  /**
   * Đại lượng giải phẫu do entity khai báo (vd `entity.thighLength`).
   *
   * Cho phép mô hình cơ thể riêng; không khai báo ⇒ giá trị mặc định của bảng
   * chuẩn (hành vi mặc định không đổi).
   */
  private declaredNumber(entity: unknown, key: string, fallback: number): number {
    const v = (entity as any)?.[key];
    return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  }

  /** Đối số này có phải một điểm tọa độ không? */
  private isPoint(value: unknown): boolean {
    if (Array.isArray(value)) return value.length >= 3;
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    if (typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number') return true;
    return 'position' in v;
  }

  /**
   * Mốc thứ hai lấy từ tham số `b`.
   *
   * `b` là entity ⇒ lấy cùng mốc đó trên entity kia; `b` là điểm thô ⇒ dùng
   * trực tiếp; không truyền ⇒ `undefined` (giữ nguyên hành vi mặc định).
   */
  private landmarkFrom(b: any, landmark: string): Vec3D | undefined {
    if (b === undefined || b === null) return undefined;
    if (isAnchored(b)) return this.landmarkPosition(landmark, b);
    if (this.isPoint(b)) return pointOf(b);
    return undefined;
  }

  /** Mốc thứ hai lấy từ tham số `b` (có ưu tiên forward kinematics). */
  private markerFrom(b: any, boneNames: string[], landmark: string): Vec3D | undefined {
    if (b === undefined || b === null) return undefined;
    if (isAnchored(b)) return this.markerPosition(b, boneNames, landmark);
    if (this.isPoint(b)) return pointOf(b);
    return undefined;
  }

  /**
   * Vị trí mốc có đầy đủ tuỳ chọn.
   *
   * - `b` (nếu là một điểm) ⇒ dùng làm vị trí trực tiếp.
   * - `options.side` ⇒ đổi sang mốc cùng loại ở phía kia.
   * - `options.bone` ⇒ ưu tiên xương được chỉ định (forward kinematics).
   * - `options.scale` ⇒ nhân offset giải phẫu; `options.reference` = `'local'`
   *   ⇒ trả offset tương đối so với neo.
   */
  private landmarkWith(
    name: string,
    a: any,
    b: any,
    options: any,
    side: 'left' | 'right' = 'left',
  ): Vec3D {
    const subject = this.optEntity(options, a);
    const chosen = this.optSide(options, side) !== side ? this.mirrorLandmark(name) : name;
    const bone = this.optBone(options);
    if (bone !== undefined) {
      const fromBone = this.boneWorldPosition(subject, [bone]);
      if (fromBone) return this.pointWith(fromBone, subject, options);
    }
    const explicit = this.landmarkFrom(b, chosen);
    if (explicit) return this.pointWith(explicit, subject, options);
    return this.pointWith(this.landmarkPosition(chosen, subject), subject, options);
  }

  /** Tên mốc đối xứng (trái ⇄ phải). */
  private mirrorLandmark(name: string): string {
    if (name.includes('Left')) return name.replace('Left', 'Right');
    if (name.includes('Right')) return name.replace('Right', 'Left');
    return name;
  }

  /** Bước thời gian hợp lệ (chặn 0 và số 0 tuyệt đối). */
  private timeStep(dt: number): number {
    const t = num(dt, 0.016);
    return Number.isFinite(t) && Math.abs(t) > 1e-9 ? t : 1e-9;
  }

  /** Đọc trường lịch sử đầu tiên có mặt trong entity. */
  private historyRaw(entity: any, keys: string[]): unknown {
    if (!entity || typeof entity !== 'object') return undefined;
    const rec = entity as Record<string, unknown>;
    for (const key of keys) {
      const v = rec[key];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  }

  /**
   * Vận tốc: nếu entity lưu vị trí trước đó thì suy ra bằng Δvị trí / `dt`;
   * ngược lại dùng `entity.velocity` có sẵn (hành vi mặc định không đổi).
   */
  private velocityFrom(entity: any, dt: number): Vec3D {
    const prev = this.historyRaw(entity, ['previousPosition', 'prevPosition', 'lastPosition']);
    if (prev && typeof prev === 'object') {
      return scale(subtract(entityPosition(entity), toVec3(prev)), 1 / this.timeStep(dt));
    }
    return this.entityVector(entity, 'velocity');
  }

  /** Gia tốc: nếu entity lưu vận tốc trước đó thì suy ra bằng Δvận tốc / `dt`. */
  private accelerationFrom(entity: any, dt: number): Vec3D {
    const prev = this.historyRaw(entity, ['previousVelocity', 'prevVelocity', 'lastVelocity']);
    if (prev && typeof prev === 'object') {
      return scale(subtract(this.entityVector(entity, 'velocity'), toVec3(prev)), 1 / this.timeStep(dt));
    }
    return this.entityVector(entity, 'acceleration');
  }

  /** Vận tốc góc: nếu entity lưu quaternion trước đó thì suy ra từ Δquaternion / `dt`. */
  private angularVelocityFrom(entity: any, dt: number): Vec3D {
    const prev = this.historyRaw(entity, ['previousQuaternion', 'previousRotation', 'prevQuaternion']);
    if (prev && typeof prev === 'object') {
      const axis = this.quaternionDeltaAxis(asQuaternion(entity), asQuaternion(prev));
      if (axis) return scale(axis, 1 / this.timeStep(dt));
    }
    return this.entityVector(entity, 'angularVelocity');
  }

  /** Gia tốc góc: nếu entity lưu vận tốc góc trước đó thì suy ra bằng Δω / `dt`. */
  private angularAccelerationFrom(entity: any, dt: number): Vec3D {
    const prev = this.historyRaw(entity, ['previousAngularVelocity', 'prevAngularVelocity']);
    if (prev && typeof prev === 'object') {
      return scale(subtract(this.entityVector(entity, 'angularVelocity'), toVec3(prev)), 1 / this.timeStep(dt));
    }
    return this.entityVector(entity, 'angularAcceleration');
  }

  /** Vector quay (trục × góc) giữa hai quaternion. */
  private quaternionDeltaAxis(q: QuatD, p: QuatD): Vec3D | null {
    const inv = { x: -p.x, y: -p.y, z: -p.z, w: p.w };
    const d = {
      w: q.w * inv.w - q.x * inv.x - q.y * inv.y - q.z * inv.z,
      x: q.w * inv.x + q.x * inv.w + q.y * inv.z - q.z * inv.y,
      y: q.w * inv.y - q.x * inv.z + q.y * inv.w + q.z * inv.x,
      z: q.w * inv.z + q.x * inv.y - q.y * inv.x + q.z * inv.w
    };
    const sinHalf = Math.hypot(d.x, d.y, d.z);
    if (sinHalf < 1e-9) return null;
    const angle = 2 * Math.atan2(sinHalf, d.w);
    return { x: (d.x / sinHalf) * angle, y: (d.y / sinHalf) * angle, z: (d.z / sinHalf) * angle };
  }

  /** Đưa một vector hướng thế giới về khung cục bộ của entity. */
  private toLocalDirection(entity: any, v: Vec3D): Vec3D {
    const q = entityQuaternion(entity);
    return this.rotateByQuaternion({ x: -q.x, y: -q.y, z: -q.z, w: q.w }, v);
  }

  /** Xoay vector theo quaternion. */
  private rotateByQuaternion(q: QuatD, v: Vec3D): Vec3D {
    const u = { x: q.x, y: q.y, z: q.z };
    const uv = cross(u, v);
    const uuv = cross(u, uv);
    return {
      x: v.x + 2 * (uv.x * q.w + uuv.x),
      y: v.y + 2 * (uv.y * q.w + uuv.y),
      z: v.z + 2 * (uv.z * q.w + uuv.z)
    };
  }
}