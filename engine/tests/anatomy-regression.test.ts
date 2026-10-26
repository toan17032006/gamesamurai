// engine/tests/anatomy-regression.test.ts — Hồi quy ngữ nghĩa 3 subsystem giải phẫu
// (thân trên 250 method, thân dưới 350 method, bàn tay & ngón 200 method).
// Khẳng định quan hệ giải phẫu thật: mốc nào cao hơn, nào xa hơn, hộp bao ra sao.
import { describe, it, expect } from 'vitest';
import { AnatomicalUpperBodySubsystem } from '../src/spatial-ui/subsystems/anatomical-upper-body-subsystem.js';
import { AnatomicalLowerBodySubsystem } from '../src/spatial-ui/subsystems/anatomical-lower-body-subsystem.js';
import { AnatomicalHandDigitsSubsystem } from '../src/spatial-ui/subsystems/anatomical-hand-digits-subsystem.js';
import {
  BODY_DIMENSIONS,
  BODY_BOX_SIZES,
  bodyOffset,
  HEAD_LANDMARKS,
  ARM_LANDMARKS,
  LEG_LANDMARKS,
  TORSO_LANDMARKS,
  HELD_OBJECT_LANDMARKS,
  FINGER_LENGTHS,
  FINGER_SPACING,
} from '../src/spatial-ui/anatomy-metrics.js';

const upper = new AnatomicalUpperBodySubsystem();
const lower = new AnatomicalLowerBodySubsystem();
const hand = new AnatomicalHandDigitsSubsystem();

/** Neo chuẩn: entity.position là điểm neo của chính vị trí đó. */
const ANCHOR = { position: { x: 0, y: 0, z: 0 } };
const pos = (v: any) => v as { x: number; y: number; z: number };

describe('Giải phẫu — bảng mốc đầy đủ', () => {
  it('mọi mốc được dùng trong các subsystem đều có trong bảng (không rơi fallback)', () => {
    // 178 mốc được gọi từ 3 file — đã kiểm bằng script .check-landmarks.mjs.
    const used = [
      ...Object.keys(HEAD_LANDMARKS),
      ...Object.keys(ARM_LANDMARKS),
      ...Object.keys(LEG_LANDMARKS),
      ...Object.keys(TORSO_LANDMARKS),
      ...Object.keys(HELD_OBJECT_LANDMARKS),
    ];
    for (const name of used) {
      expect(bodyOffset(name), `mốc ${name} phải có offset`).toBeDefined();
    }
  });

  it('offset của các mốc "trung tâm" bằng 0 (đúng quy ước neo)', () => {
    expect(bodyOffset('getHeadPosition')).toEqual({ x: 0, y: 0, z: 0 });
    expect(bodyOffset('getHeadCenter')).toEqual({ x: 0, y: 0, z: 0 });
    expect(bodyOffset('getPelvisCenter')).toEqual({ x: 0, y: 0, z: 0 });
    expect(bodyOffset('getHeldObjectCenter')).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('kích thước hộp bao theo vùng là số dương', () => {
    for (const [region, size] of Object.entries(BODY_BOX_SIZES)) {
      expect(size.x, region).toBeGreaterThan(0);
      expect(size.y, region).toBeGreaterThan(0);
      expect(size.z, region).toBeGreaterThan(0);
    }
  });
});

describe('Giải phẫu — thân trên', () => {
  it('getHeadPosition giữ nguyên vị trí entity (offset 0)', () => {
    const p = pos(upper.getHeadPosition({ position: { x: 1, y: 2, z: 3 } }));
    expect(p).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('đỉnh đầu cao hơn đáy đầu; mặt trước đầu trước gáy', () => {
    const top = pos(upper.getHeadTopPosition(ANCHOR));
    const bottom = pos(upper.getHeadBottomPosition(ANCHOR));
    const front = pos(upper.getHeadFrontPosition(ANCHOR));
    const back = pos(upper.getHeadBackPosition(ANCHOR));

    expect(top.y).toBeGreaterThan(bottom.y);
    expect(front.z).toBeGreaterThan(back.z);
  });

  it('mắt trái nằm bên trái, mắt phải bên phải', () => {
    const left = pos(upper.getLeftEyePosition(ANCHOR));
    const right = pos(upper.getRightEyePosition(ANCHOR));
    expect(left.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
    expect(left.x).toBeCloseTo(-right.x, 6);
  });

  it('vai trái ở bên trái, khuỷu tay thấp hơn vai, cổ tay thấp hơn khuỷu', () => {
    const shoulder = pos(upper.getLeftShoulderPosition(ANCHOR));
    const rightShoulder = pos(upper.getRightShoulderPosition(ANCHOR));
    const elbow = pos(upper.getLeftElbowPosition(ANCHOR));
    const wrist = pos(upper.getLeftWristPosition(ANCHOR));

    expect(shoulder.x).toBeLessThan(0);
    expect(rightShoulder.x).toBeGreaterThan(0);
    expect(elbow.y).toBeLessThan(shoulder.y);
    expect(wrist.y).toBeLessThan(elbow.y);
  });

  it('chiều dài cánh tay khớp số đo giải phẫu', () => {
    const shoulder = pos(upper.getLeftUpperArmPosition(ANCHOR));
    const elbow = pos(upper.getLeftElbowPosition(ANCHOR));
    const forearm = shoulder.y - elbow.y;
    expect(forearm).toBeCloseTo(BODY_DIMENSIONS.upperArmLength, 4);
  });

  it('calculateHeadBoundingBox dùng kích thước đầu và quanh tâm entity', () => {
    const box = upper.calculateHeadBoundingBox({ position: { x: 0, y: 1.7, z: 0 } }, { x: 0.3, y: 0.3, z: 0.3 });
    expect(box.min.y).toBeCloseTo(1.55, 4);
    expect(box.max.y).toBeCloseTo(1.85, 4);
    expect(box.min.x).toBeCloseTo(-0.15, 4);
    expect(box.max.x).toBeCloseTo(0.15, 4);
  });

  it('hộp bao đầu mặc định dùng BODY_BOX_SIZES.head', () => {
    const box = upper.calculateHeadBoundingBox({ position: { x: 0, y: 0, z: 0 } });
    expect(box.max.y).toBeCloseTo(BODY_BOX_SIZES.head.y / 2, 4);
  });

  it('các phép đo vô hướng trả về số kèm đơn vị', () => {
    const distance = upper.calculateShoulderToHandDistance(ANCHOR, ANCHOR);
    expect(typeof distance.value).toBe('number');
    expect(distance.unit).toBe('m');
    expect(distance.valid).toBe(true);
  });
});

describe('Giải phẫu — thân dưới', () => {
  it('gối thấp hơn hông đúng chiều dài đùi; bàn chân thấp hơn gối đúng chiều dài cẳng', () => {
    const hip = pos(lower.getLeftHipPosition(ANCHOR));
    const knee = pos(lower.getLeftKneePosition(ANCHOR));
    const foot = pos(lower.getLeftFootPosition(ANCHOR));

    expect(hip.y - knee.y).toBeCloseTo(BODY_DIMENSIONS.thighLength, 4);
    expect(knee.y - foot.y).toBeCloseTo(BODY_DIMENSIONS.shinLength, 4);
  });

  it('bàn chân trái ở bên trái, bàn chân phải ở bên phải', () => {
    const left = pos(lower.getLeftFootPosition(ANCHOR));
    const right = pos(lower.getRightFootPosition(ANCHOR));
    expect(left.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
  });

  it('ngón chân ở phía trước gót chân', () => {
    const toe = pos(lower.getFootToePosition(ANCHOR));
    const heel = pos(lower.getFootHeelPosition(ANCHOR));
    expect(toe.z).toBeGreaterThan(heel.z);
  });

  it('đầu ngón chân cái ở trong (gần giữa) ngón chân út', () => {
    const big = pos(lower.getBigToePosition(ANCHOR));
    const little = pos(lower.getLittleToePosition(ANCHOR));
    expect(big.x).toBeLessThan(little.x);
  });

  it('mông nằm dưới ngực; rốn nằm dưới ngực', () => {
    const chest = pos(lower.getChestPosition(ANCHOR));
    const navel = pos(lower.getNavelPosition(ANCHOR));
    const pelvis = pos(lower.getPelvisCenter(ANCHOR));
    expect(chest.y).toBeGreaterThan(navel.y);
    expect(pelvis.y).toBeLessThan(navel.y);
  });

  it('vật thể đang cầm có các mốc theo hướng thật', () => {
    const center = pos(lower.getHeldObjectCenter(ANCHOR));
    const tip = pos(lower.getHeldObjectTipPosition(ANCHOR));
    const base = pos(lower.getHeldObjectBasePosition(ANCHOR));
    const left = pos(lower.getHeldObjectLeftPosition(ANCHOR));
    const right = pos(lower.getHeldObjectRightPosition(ANCHOR));

    expect(tip.z).toBeGreaterThan(center.z);
    expect(base.z).toBeLessThan(center.z);
    expect(left.x).toBeLessThan(right.x);
  });

  it('calculateFootRotation() trả quaternion đơn vị', () => {
    const q = lower.calculateFootRotation();
    expect(q.w).toBe(1);
  });

  it('calculateKneeRotation() trả quaternion đơn vị', () => {
    const q = lower.calculateKneeRotation();
    expect(q.w).toBe(1);
  });
});

describe('Giải phẫu — bàn tay & ngón tay', () => {
  it('đầu ngón trỏ nằm dưới gốc ngón (theo hướng -Y) và nghiêng nhẹ về phía trước', () => {
    const anchor = { position: { x: 0.2, y: 1.1, z: 0.4 } };
    const tip = pos(hand.getIndexFingerTipPosition(anchor));
    const root = pos(hand.getIndexFingerRootPosition(anchor));
    expect(tip.y).toBeLessThan(root.y);
    // Ngón duỗi thẳng theo trục -Y nên X không đổi; Z hơi lệch về phía trước.
    expect(tip.x).toBeCloseTo(root.x, 6);
    expect(tip.z).toBeGreaterThan(root.z);
    // Hợp đồng cũ (spatial-ui-system.test.ts): tip.x ≈ 0,2 khi neo ở x = 0,2.
    expect(tip.x).toBeCloseTo(0.2, 1);
  });

  it('ngón giữa dài hơn ngón trỏ, ngón út ngắn hơn ngón trỏ', () => {
    const middle = pos(hand.getMiddleFingerTipPosition(ANCHOR));
    const index = pos(hand.getIndexFingerTipPosition(ANCHOR));
    const little = pos(hand.getLittleFingerTipPosition(ANCHOR));
    expect(middle.y).toBeLessThan(index.y);
    expect(little.y).toBeGreaterThan(index.y);
  });

  it('đầu ngón nằm dọc theo trục -Y (cùng chiều dài ngón)', () => {
    const root = pos(hand.getIndexFingerRootPosition(ANCHOR));
    const tip = pos(hand.getIndexFingerTipPosition(ANCHOR));
    const length = root.y - tip.y;
    expect(length).toBeCloseTo(FINGER_LENGTHS.index, 2);
    expect(length).toBeGreaterThan(0.08);
    expect(length).toBeLessThan(0.11);
  });

  it('các đốt ngón tay nằm dọc theo chiều dài ngón', () => {
    const mcp = pos(hand.getIndexFingerMCPPosition(ANCHOR));
    const pip = pos(hand.getIndexFingerPIPPosition(ANCHOR));
    const dip = pos(hand.getIndexFingerDIPPosition(ANCHOR));
    const tip = pos(hand.getIndexFingerTipPosition(ANCHOR));
    expect(mcp.y).toBeGreaterThan(pip.y);
    expect(pip.y).toBeGreaterThan(dip.y);
    expect(dip.y).toBeGreaterThan(tip.y);
  });
});

describe('Giải phẫu — quy ước neo chung', () => {
  it('offset tùy chọn được cộng vào vị trí mốc', () => {
    const base = pos(lower.getLeftKneePosition(ANCHOR));
    const shifted = pos(lower.getLeftKneePosition(ANCHOR, { x: 1, y: 2, z: 3 }));
    expect(shifted.x).toBeCloseTo(base.x + 1, 6);
    expect(shifted.y).toBeCloseTo(base.y + 2, 6);
    expect(shifted.z).toBeCloseTo(base.z + 3, 6);
  });

  it('entity.position là neo: dịch entity dịch mốc theo như nhau', () => {
    const a = pos(upper.getHeadPosition({ position: { x: 0, y: 0, z: 0 } }));
    const b = pos(upper.getHeadPosition({ position: { x: 5, y: 0, z: 0 } }));
    expect(b.x - a.x).toBeCloseTo(5, 6);
  });

  it('hộp bao vùng cơ thể có kích thước khác 0', () => {
    const box = lower.calculateTorsoBoundingBox(ANCHOR);
    expect(box.max.x - box.min.x).toBeGreaterThan(0);
    expect(box.max.y - box.min.y).toBeGreaterThan(0);
  });
});
