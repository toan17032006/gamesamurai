/**
 * @file anatomy-metrics.ts
 * @module @aetheria/engine/spatial-ui/anatomy-metrics
 * @description Số đo giải phẫu chuẩn dùng chung cho các subsystem cơ thể.
 *
 * **Quy ước neo (anchor):** mỗi hàm `getXxxPosition(entity)` nhận entity có
 * `position` là **điểm neo của chính vị trí đó**. Ví dụ
 * `getIndexFingerTipPosition(entity)` coi `entity.position` là khớp MCP của
 * ngón trỏ, nên đầu ngón = MCP + độ dài ngón theo hướng cụ thể.
 * Nhờ quy ước này mọi phép cộng offset đều có ý nghĩa giải phẫu thật.
 *
 * Đơn vị: mét, hệ Y-up, +X sang phải, +Y lên, +Z về phía trước.
 * Số đo lấy theo người trưởng thành cao ~1,75 m.
 */

import type { Vec3D } from './types.js';

/** Kích thước cơ thể chuẩn (mét). */
export const BODY_DIMENSIONS = {
  height: 1.75,
  headHeight: 0.23,
  headRadius: 0.095,
  neckLength: 0.11,
  neckRadius: 0.055,
  shoulderWidth: 0.4,
  shoulderHeight: 0.145,
  clavicleLength: 0.15,
  upperArmLength: 0.3,
  upperArmRadius: 0.05,
  forearmLength: 0.26,
  forearmRadius: 0.04,
  wristWidth: 0.05,
  wristThickness: 0.035,
  palmLength: 0.1,
  palmWidth: 0.085,
  palmThickness: 0.028,
  handLength: 0.19,
  handWidth: 0.095,
  handSpan: 0.22,
  hipWidth: 0.35,
  thighLength: 0.43,
  thighRadius: 0.085,
  shinLength: 0.42,
  shinRadius: 0.055,
  footLength: 0.26,
  footWidth: 0.1,
  torsoHeight: 0.55,
  eyeSeparation: 0.065,
  earHeight: 0.06,
  noseLength: 0.05,
  mouthWidth: 0.05,
} as const;

/** Độ dài từng ngón tay (mét). */
export const FINGER_LENGTHS = {
  thumb: 0.08,
  index: 0.095,
  middle: 0.1,
  ring: 0.095,
  little: 0.08,
} as const;

/** Bề rộng ngang tay giữa các ngón (mét). */
export const FINGER_SPACING = {
  thumb: -0.035,
  index: -0.02,
  middle: 0.0,
  ring: 0.019,
  little: 0.036,
} as const;

/** Tỉ lệ phân đoạn của một ngón (từ gốc xuống ngón): gốc → khớp → đốt → đầu. */
export const FINGER_SEGMENTS = {
  proximal: 0.45,
  middle: 0.3,
  distal: 0.25,
} as const;

/**
 * Offset giải phẫu của các mốc trên đầu, tính từ tâm đầu.
 * +Y lên, +Z về phía trước, +X sang phải.
 */
export const HEAD_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  getHeadPosition: { x: 0, y: 0, z: 0 },
  getHeadCenter: { x: 0, y: 0, z: 0 },
  getHeadTopPosition: { x: 0, y: 0.115, z: 0 },
  getHeadBottomPosition: { x: 0, y: -0.115, z: 0 },
  getHeadFrontPosition: { x: 0, y: 0, z: 0.1 },
  getHeadBackPosition: { x: 0, y: 0, z: -0.1 },
  getHeadLeftPosition: { x: -0.095, y: 0, z: 0 },
  getHeadRightPosition: { x: 0.095, y: 0, z: 0 },
  getFaceCenter: { x: 0, y: -0.01, z: 0.075 },
  getForeheadPosition: { x: 0, y: 0.075, z: 0.075 },
  getChinPosition: { x: 0, y: -0.1, z: 0.045 },
  getJawPosition: { x: 0, y: -0.075, z: 0.05 },
  getLeftEyePosition: { x: -0.0325, y: 0.015, z: 0.085 },
  getRightEyePosition: { x: 0.0325, y: 0.015, z: 0.085 },
  getLeftPupilPosition: { x: -0.0325, y: 0.015, z: 0.093 },
  getRightPupilPosition: { x: 0.0325, y: 0.015, z: 0.093 },
  getNosePosition: { x: 0, y: -0.015, z: 0.09 },
  getNoseTipPosition: { x: 0, y: -0.03, z: 0.11 },
  getMouthCenter: { x: 0, y: -0.065, z: 0.082 },
  getUpperLipPosition: { x: 0, y: -0.055, z: 0.086 },
  getLowerLipPosition: { x: 0, y: -0.075, z: 0.084 },
  getLeftEarPosition: { x: -0.088, y: 0.005, z: -0.005 },
  getRightEarPosition: { x: 0.088, y: 0.005, z: -0.005 },
  getLeftEyebrowPosition: { x: -0.0325, y: 0.04, z: 0.088 },
  getRightEyebrowPosition: { x: 0.0325, y: 0.04, z: 0.088 },
  getLeftCheekPosition: { x: -0.055, y: -0.03, z: 0.06 },
  getRightCheekPosition: { x: 0.055, y: -0.03, z: 0.06 },
};

/** Offset của các mốc cổ, tính từ gốc cổ. */
export const NECK_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  getNeckPosition: { x: 0, y: 0, z: 0 },
  getNeckCenter: { x: 0, y: 0.055, z: 0 },
  getNeckBasePosition: { x: 0, y: 0, z: 0 },
  getNeckTopPosition: { x: 0, y: 0.11, z: 0 },
};

/** Offset của các mốc vai, tính từ giữa hai vai. */
export const SHOULDER_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  getLeftShoulderPosition: { x: -0.2, y: 0, z: 0 },
  getRightShoulderPosition: { x: 0.2, y: 0, z: 0 },
  getShoulderCenter: { x: 0, y: 0, z: 0 },
  getLeftShoulderTip: { x: -0.2, y: 0, z: 0.03 },
  getRightShoulderTip: { x: 0.2, y: 0, z: 0.03 },
  getLeftClaviclePosition: { x: -0.09, y: 0.02, z: 0.03 },
  getRightClaviclePosition: { x: 0.09, y: 0.02, z: 0.03 },
  getLeftScapulaPosition: { x: -0.11, y: 0.03, z: -0.06 },
  getRightScapulaPosition: { x: 0.11, y: 0.03, z: -0.06 },
};

/** Offset của các mốc cánh tay, tính từ tâm xương tương ứng. */
export const ARM_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  getLeftUpperArmPosition: { x: -0.2, y: 0, z: 0 },
  getRightUpperArmPosition: { x: 0.2, y: 0, z: 0 },
  getLeftUpperArmCenter: { x: -0.2, y: -0.15, z: 0 },
  getRightUpperArmCenter: { x: 0.2, y: -0.15, z: 0 },
  getLeftElbowPosition: { x: -0.2, y: -0.3, z: 0 },
  getRightElbowPosition: { x: 0.2, y: -0.3, z: 0 },
  getLeftElbowCenter: { x: -0.2, y: -0.3, z: 0 },
  getRightElbowCenter: { x: 0.2, y: -0.3, z: 0 },
  getLeftElbowTip: { x: -0.2, y: -0.3, z: 0.04 },
  getRightElbowTip: { x: 0.2, y: -0.3, z: 0.04 },
  getLeftForearmPosition: { x: -0.2, y: -0.3, z: 0 },
  getRightForearmPosition: { x: 0.2, y: -0.3, z: 0 },
  getLeftForearmCenter: { x: -0.2, y: -0.43, z: 0 },
  getRightForearmCenter: { x: 0.2, y: -0.43, z: 0 },
  getLeftWristPosition: { x: -0.2, y: -0.56, z: 0 },
  getRightWristPosition: { x: 0.2, y: -0.56, z: 0 },
  getLeftWristCenter: { x: -0.2, y: -0.56, z: 0 },
  getRightWristCenter: { x: 0.2, y: -0.56, z: 0 },
  getLeftWristJointPosition: { x: -0.2, y: -0.56, z: 0 },
  getRightWristJointPosition: { x: 0.2, y: -0.56, z: 0 },
  getLeftWristFrontPosition: { x: -0.2, y: -0.56, z: 0.02 },
  getRightWristFrontPosition: { x: 0.2, y: -0.56, z: 0.02 },
  getLeftWristBackPosition: { x: -0.2, y: -0.56, z: -0.02 },
  getRightWristBackPosition: { x: 0.2, y: -0.56, z: -0.02 },
  getLeftHandPosition: { x: -0.2, y: -0.62, z: 0 },
  getRightHandPosition: { x: 0.2, y: -0.62, z: 0 },
  getLeftHandCenter: { x: -0.2, y: -0.62, z: 0 },
  getRightHandCenter: { x: 0.2, y: -0.62, z: 0 },
  getPalmCenter: { x: 0, y: 0, z: 0 },
  getPalmBasePosition: { x: 0, y: 0, z: -0.05 },
  getPalmTopPosition: { x: 0, y: 0, z: 0.05 },
  getPalmLeftEdge: { x: -0.0425, y: 0, z: 0 },
  getPalmRightEdge: { x: 0.0425, y: 0, z: 0 },
  getPalmFrontPosition: { x: 0, y: 0, z: 0.028 },
  getPalmBackPosition: { x: 0, y: 0, z: -0.028 },
};

/** Offset của các mốc chân, tính từ hông. */
export const LEG_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  getHipPosition: { x: 0, y: 0, z: 0 },
  getHipCenter: { x: 0, y: 0, z: 0 },
  getLeftHipPosition: { x: -0.09, y: 0, z: 0 },
  getRightHipPosition: { x: 0.09, y: 0, z: 0 },
  getPelvisPosition: { x: 0, y: 0, z: 0 },
  getThighPosition: { x: -0.09, y: 0, z: 0 },
  getRightThighPosition: { x: 0.09, y: 0, z: 0 },
  getKneePosition: { x: -0.09, y: -0.43, z: 0 },
  getRightKneePosition: { x: 0.09, y: -0.43, z: 0 },
  getLeftKneePosition: { x: -0.09, y: -0.43, z: 0 },
  getShinPosition: { x: -0.09, y: -0.43, z: 0 },
  getRightShinPosition: { x: 0.09, y: -0.43, z: 0 },
  getLeftShinPosition: { x: -0.09, y: -0.43, z: 0 },
  getFootPosition: { x: -0.09, y: -0.85, z: 0 },
  getRightFootPosition: { x: 0.09, y: -0.85, z: 0 },
  getLeftFootPosition: { x: -0.09, y: -0.85, z: 0 },
  getAnklePosition: { x: -0.09, y: -0.85, z: 0 },
  getRightAnklePosition: { x: 0.09, y: -0.85, z: 0 },
  getLeftAnklePosition: { x: -0.09, y: -0.85, z: 0 },
  getTorsoPosition: { x: 0, y: 0, z: 0 },
  getTorsoCenter: { x: 0, y: 0.28, z: 0 },
  getWaistPosition: { x: 0, y: 0.12, z: 0 },
  getSpinePosition: { x: 0, y: 0.28, z: 0 },

  // --- Đùi (thigh): gốc ở hông, kẻo xuống 0,43 m tới đầu gối ---
  getLeftLegPosition: { x: -0.09, y: 0, z: 0 },
  getRightLegPosition: { x: 0.09, y: 0, z: 0 },
  getLeftLegCenter: { x: -0.09, y: -0.215, z: 0 },
  getRightLegCenter: { x: 0.09, y: -0.215, z: 0 },
  getLeftThighPosition: { x: -0.09, y: 0, z: 0 },
  getLeftThighCenter: { x: -0.09, y: -0.215, z: 0 },
  getRightThighCenter: { x: 0.09, y: -0.215, z: 0 },
  getLeftThighStart: { x: -0.09, y: 0, z: 0 },
  getRightThighStart: { x: 0.09, y: 0, z: 0 },
  getLeftThighEnd: { x: -0.09, y: -0.43, z: 0 },
  getRightThighEnd: { x: 0.09, y: -0.43, z: 0 },

  // --- Gối (knee) ---
  getLeftKneeCenter: { x: -0.09, y: -0.43, z: 0 },
  getRightKneeCenter: { x: 0.09, y: -0.43, z: 0 },
  getLeftKneeCapPosition: { x: -0.09, y: -0.42, z: 0.045 },
  getRightKneeCapPosition: { x: 0.09, y: -0.42, z: 0.045 },

  // --- Cẳng chân (shin): gốc ở gối, dài 0,42 m tới mắt cá ---
  getLeftShinCenter: { x: -0.09, y: -0.64, z: 0 },
  getRightShinCenter: { x: 0.09, y: -0.64, z: 0 },
  getLeftShinStart: { x: -0.09, y: -0.43, z: 0 },
  getRightShinStart: { x: 0.09, y: -0.43, z: 0 },
  getLeftShinEnd: { x: -0.09, y: -0.85, z: 0 },
  getRightShinEnd: { x: 0.09, y: -0.85, z: 0 },

  // --- Mắt cá chân (ankle) ---
  getLeftAnkleCenter: { x: -0.09, y: -0.85, z: 0 },
  getRightAnkleCenter: { x: 0.09, y: -0.85, z: 0 },

  // --- Bàn chân (foot): dài 0,26 m, gót lùi về sau ---
  getLeftFootCenter: { x: -0.09, y: -0.88, z: 0.01 },
  getRightFootCenter: { x: 0.09, y: -0.88, z: 0.01 },
  getLeftHeelPosition: { x: -0.09, y: -0.87, z: -0.055 },
  getRightHeelPosition: { x: 0.09, y: -0.87, z: -0.055 },
  getFootCenter: { x: 0, y: -0.88, z: 0.01 },
  getFootSolePosition: { x: 0, y: -0.91, z: 0.01 },
  getFootToePosition: { x: 0, y: -0.885, z: 0.13 },
  getFootHeelPosition: { x: 0, y: -0.88, z: -0.055 },
  getFootArchPosition: { x: 0, y: -0.895, z: 0.02 },
  getFootTopPosition: { x: 0, y: -0.855, z: 0.02 },
  getFootInnerEdge: { x: -0.045, y: -0.885, z: 0.01 },
  getFootOuterEdge: { x: 0.045, y: -0.885, z: 0.01 },

  // --- Ngón chân (toe) ---
  getBigToePosition: { x: -0.03, y: -0.885, z: 0.115 },
  getSecondToePosition: { x: -0.012, y: -0.885, z: 0.12 },
  getThirdToePosition: { x: 0.004, y: -0.885, z: 0.12 },
  getFourthToePosition: { x: 0.018, y: -0.885, z: 0.115 },
  getLittleToePosition: { x: 0.03, y: -0.885, z: 0.105 },
  getToeTipPosition: { x: 0, y: -0.885, z: 0.125 },
  getToeBasePosition: { x: 0, y: -0.885, z: 0.075 },
  getToeJointPosition: { x: 0, y: -0.885, z: 0.1 },
  getToeNailPosition: { x: 0, y: -0.877, z: 0.122 },
};

/**
 * Offset của các mốc thân (ngực, bụng, cột sống, hông), tính từ gốc hông.
 * +Y lên, +Z về phía trước, +X sang phải.
 */
export const TORSO_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  // Thân
  getTorsoTopPosition: { x: 0, y: 0.55, z: 0 },
  getTorsoBottomPosition: { x: 0, y: 0, z: 0 },
  getTorsoFrontPosition: { x: 0, y: 0.28, z: 0.11 },
  getTorsoBackPosition: { x: 0, y: 0.28, z: -0.11 },
  getTorsoLeftPosition: { x: -0.18, y: 0.28, z: 0 },
  getTorsoRightPosition: { x: 0.18, y: 0.28, z: 0 },

  // Ngực
  getChestPosition: { x: 0, y: 0.42, z: 0 },
  getChestCenter: { x: 0, y: 0.42, z: 0 },
  getChestFrontPosition: { x: 0, y: 0.42, z: 0.12 },
  getChestBackPosition: { x: 0, y: 0.42, z: -0.11 },
  getRibcageCenter: { x: 0, y: 0.4, z: 0 },
  getSternumPosition: { x: 0, y: 0.4, z: 0.1 },

  // Cột sống
  getUpperSpinePosition: { x: 0, y: 0.5, z: -0.05 },
  getMiddleSpinePosition: { x: 0, y: 0.36, z: -0.06 },
  getLowerSpinePosition: { x: 0, y: 0.16, z: -0.06 },

  // Bụng
  getAbdomenPosition: { x: 0, y: 0.16, z: 0 },
  getAbdomenCenter: { x: 0, y: 0.16, z: 0 },
  getUpperAbdomenPosition: { x: 0, y: 0.24, z: 0 },
  getLowerAbdomenPosition: { x: 0, y: 0.08, z: 0 },
  getNavelPosition: { x: 0, y: 0.12, z: 0.08 },

  // Hông
  getPelvisCenter: { x: 0, y: 0, z: 0 },
  getPelvisFrontPosition: { x: 0, y: 0, z: 0.1 },
  getPelvisBackPosition: { x: 0, y: 0, z: -0.1 },
  getHipJointPosition: { x: -0.09, y: 0, z: 0 },
  getSacrumPosition: { x: 0, y: 0.02, z: -0.08 },
  getTailbonePosition: { x: 0, y: -0.04, z: -0.11 },
};

/**
 * Offset của vật thể đang cầm, tính từ điểm nắm của bàn tay.
 * Vật thể mặc định là khối 0,15 m (khớp với `BODY_BOX_SIZES.heldObject`).
 */
export const HELD_OBJECT_LANDMARKS: Readonly<Record<string, Vec3D>> = {
  getHeldObjectPosition: { x: 0, y: 0, z: 0 },
  getHeldObjectCenter: { x: 0, y: 0, z: 0 },
  getHeldObjectWorldPosition: { x: 0, y: 0, z: 0 },
  getHeldObjectLocalPosition: { x: 0, y: 0, z: 0 },
  getHeldObjectAnchor: { x: 0, y: 0, z: 0 },
  getHeldObjectPivot: { x: 0, y: 0, z: 0 },
  getHeldObjectTipPosition: { x: 0, y: 0, z: 0.075 },
  getHeldObjectBasePosition: { x: 0, y: 0, z: -0.075 },
  getHeldObjectFrontPosition: { x: 0, y: 0, z: 0.075 },
  getHeldObjectBackPosition: { x: 0, y: 0, z: -0.075 },
  getHeldObjectLeftPosition: { x: -0.075, y: 0, z: 0 },
  getHeldObjectRightPosition: { x: 0.075, y: 0, z: 0 },
  getHeldObjectUpPosition: { x: 0, y: 0.075, z: 0 },
  getHeldObjectDownPosition: { x: 0, y: -0.075, z: 0 },
};

/** Kích thước hộp bao theo vùng cơ thể (mét) — dùng cho bounding box. */
export const BODY_BOX_SIZES: Readonly<Record<string, Vec3D>> = {
  head: { x: 0.19, y: 0.23, z: 0.2 },
  neck: { x: 0.11, y: 0.11, z: 0.11 },
  shoulder: { x: 0.4, y: 0.16, z: 0.2 },
  upperArm: { x: 0.1, y: 0.3, z: 0.1 },
  elbow: { x: 0.09, y: 0.09, z: 0.09 },
  forearm: { x: 0.08, y: 0.26, z: 0.08 },
  wrist: { x: 0.05, y: 0.05, z: 0.05 },
  palm: { x: 0.085, y: 0.028, z: 0.1 },
  hand: { x: 0.095, y: 0.03, z: 0.19 },
  thumb: { x: 0.022, y: 0.022, z: 0.08 },
  indexFinger: { x: 0.018, y: 0.018, z: 0.095 },
  middleFinger: { x: 0.019, y: 0.019, z: 0.1 },
  ringFinger: { x: 0.018, y: 0.018, z: 0.095 },
  littleFinger: { x: 0.016, y: 0.016, z: 0.08 },
  torso: { x: 0.36, y: 0.55, z: 0.22 },
  pelvis: { x: 0.35, y: 0.2, z: 0.2 },
  thigh: { x: 0.17, y: 0.43, z: 0.17 },
  knee: { x: 0.12, y: 0.12, z: 0.12 },
  shin: { x: 0.11, y: 0.42, z: 0.11 },
  foot: { x: 0.1, y: 0.08, z: 0.26 },
  heldObject: { x: 0.15, y: 0.15, z: 0.15 },
};

/**
 * Offset của các khớp ngón tay, tính từ gốc ngón.
 * @param finger - 'thumb' | 'index' | 'middle' | 'ring' | 'little'
 * @param joint - 'root' | 'mcp' | 'pip' | 'dip' | 'tip' | ...
 */
export function fingerJointOffset(finger: keyof typeof FINGER_LENGTHS, joint: string): Vec3D {
  const length = FINGER_LENGTHS[finger];
  const spread = FINGER_SPACING[finger];
  const { proximal, middle, distal } = FINGER_SEGMENTS;

  // Ngón cái khác cấu trúc: bám sang bên, hướng về ngón trỏ.
  if (finger === 'thumb') {
    switch (joint) {
      case 'root':
      case 'base':
        return { x: spread, y: 0, z: -0.02 };
      case 'cmc':
        return { x: spread, y: -0.005, z: -0.01 };
      case 'mcp':
        return { x: spread + 0.012, y: -0.02, z: 0.012 };
      case 'ip':
        return { x: spread + 0.022, y: -0.035, z: 0.028 };
      case 'tip':
        return { x: spread + 0.03, y: -0.05, z: 0.042 };
      case 'nail':
        return { x: spread + 0.03, y: -0.053, z: 0.048 };
      case 'pad':
        return { x: spread + 0.03, y: -0.052, z: 0.04 };
      default:
        return { x: spread, y: 0, z: 0 };
    }
  }

  // Các ngón dài: kéo dài theo trục -Y (xuống), hơi nghiêng về phía trước.
  const down = -1;
  switch (joint) {
    case 'root':
    case 'base':
      return { x: spread, y: 0, z: 0 };
    case 'mcp':
    case 'proximal':
      return { x: spread, y: 0, z: 0 };
    case 'pip':
    case 'distal':
      return { x: spread, y: down * length * proximal, z: length * 0.06 };
    case 'dip':
      return { x: spread, y: down * length * (proximal + middle), z: length * 0.11 };
    case 'tip':
      return { x: spread, y: down * length, z: length * 0.14 };
    case 'nail':
      return { x: spread, y: down * length * 0.99, z: length * 0.15 };
    case 'pad':
      return { x: spread, y: down * length * 0.96, z: length * 0.13 };
    default:
      return { x: spread, y: 0, z: 0 };
  }
}

/** Bảng tra cứu nhanh offset của mốc cơ thể. */
export function bodyOffset(name: string): Vec3D | undefined {
  return (
    HEAD_LANDMARKS[name] ??
    NECK_LANDMARKS[name] ??
    SHOULDER_LANDMARKS[name] ??
    ARM_LANDMARKS[name] ??
    TORSO_LANDMARKS[name] ??
    LEG_LANDMARKS[name] ??
    HELD_OBJECT_LANDMARKS[name]
  );
}

/** Bảng tra cứu nhanh kích thước hộp bao theo vùng. */
export function bodyBoxSize(name: string): Vec3D | undefined {
  return BODY_BOX_SIZES[name];
}
