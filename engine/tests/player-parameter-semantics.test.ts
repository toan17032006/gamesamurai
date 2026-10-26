// engine/tests/player-parameter-semantics.test.ts
//
// Kiểm chứng: các method của người chơi phải THỰC SỰ dùng tham số mình nhận.
// Trước đây 37 method bỏ qua tham số (vd `detectNearbyObjects(radius)` trả toàn
// bộ vật gần đó, `updateCameraFollow(deltaTime)` bỏ qua dt, `expressEmotion(e, i)`
// bỏ qua cường độ) — tức là "return có sẵn, không phù hợp".
import { describe, it, expect, beforeEach } from 'vitest';
import { RealisticHumanPlayer } from '../src/player/realistic-human-player.js';

function makePlayer(): RealisticHumanPlayer {
  const player = new RealisticHumanPlayer();
  player.initializeSkeleton();
  return player;
}

describe('detectNearbyObjects — lọc theo bán kính thật', () => {
  it('chỉ trả vật nằm trong bán kính', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };
    player.nearbyObjects = [
      { id: 'near', name: 'Near', type: 'chest', position: { x: 1, y: 0, z: 0 } },
      { id: 'far', name: 'Far', type: 'chest', position: { x: 10, y: 0, z: 0 } },
    ];

    const close = player.detectNearbyObjects(3);
    expect(close.map((o) => o.id)).toEqual(['near']);

    const wide = player.detectNearbyObjects(20);
    expect(wide.map((o) => o.id)).toEqual(['near', 'far']);
  });

  it('bán kính khác nhau cho kết quả khác nhau', () => {
    const player = makePlayer();
    player.nearbyObjects = [
      { id: 'a', name: 'A', type: 'chest', position: { x: 2, y: 0, z: 0 } },
      { id: 'b', name: 'B', type: 'chest', position: { x: 5, y: 0, z: 0 } },
    ];
    expect(player.detectNearbyObjects(3)).toHaveLength(1);
    expect(player.detectNearbyObjects(10)).toHaveLength(2);
  });
});

describe('reachWith…(target) — hướng tay theo đích', () => {
  it('vai xoay theo hướng tới đích, khác nhau với đích khác nhau', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };

    player.reachWithRightHand({ x: 10, y: 0, z: 0 });
    const right = player.bones.get('shoulder_R')!.rotation.y;

    player.reachWithRightHand({ x: 0, y: 0, z: 10 });
    const forward = player.bones.get('shoulder_R')!.rotation.y;

    expect(right).not.toBeCloseTo(forward, 3);
    // Hướng +X → yaw dương; hướng +Z → yaw ≈ 0.
    expect(right).toBeGreaterThan(0.5);
    expect(forward).toBeCloseTo(0, 3);
  });

  it('tay trái và tay phải ngắm độc lập', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };
    player.reachWithLeftHand({ x: -10, y: 0, z: 0 });
    player.reachWithRightHand({ x: 10, y: 0, z: 0 });

    const left = player.bones.get('shoulder_L')!.rotation.y;
    const right = player.bones.get('shoulder_R')!.rotation.y;
    expect(left).toBeLessThan(-0.5);
    expect(right).toBeGreaterThan(0.5);
  });
});

describe('inspectObject / pointAtObject — nhìn đúng đối tượng', () => {
  it('inspectObject nhìn vào vị trí đối tượng, không nhìn vào chính mình', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };
    player.inspectObject({ position: { x: 5, y: 1, z: 0 } });

    expect(player.gazeTarget).toEqual({ x: 5, y: 1, z: 0 });
    expect(player.headRotation.y).toBeGreaterThan(0.5);
  });

  it('pointAtObject cũng ngắm theo đối tượng', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };
    player.pointAtObject({ position: { x: 0, y: 1, z: 8 } });
    expect(player.gazeTarget).toEqual({ x: 0, y: 1, z: 8 });
  });
});

describe('expressEmotion — cường độ có tác dụng', () => {
  it('cường độ thấp cho biểu cản yếu hơn cường độ cao', () => {
    const strong = makePlayer();
    strong.expressEmotion('joy', 1.0);
    const strongSmile = strong.facialMuscles.mouthSmile;

    const weak = makePlayer();
    weak.expressEmotion('joy', 0.2);
    const weakSmile = weak.facialMuscles.mouthSmile;

    expect(strongSmile).toBeGreaterThan(0);
    expect(weakSmile).toBeCloseTo(strongSmile * 0.2, 5);
  });
});

describe('transitionEmotion — ghi lại cảm xúc nguồn và thời lượng', () => {
  it('lưu trạng thái chuyển cảm xúc', () => {
    const player = makePlayer();
    player.transitionEmotion('joy', 'anger', 0.75);

    expect(player.previousEmotion).toBe('joy');
    expect(player.emotionTransition).toMatchObject({
      from: 'joy',
      to: 'anger',
      duration: 0.75,
    });
    expect(player.currentEmotion).toBe('anger');
  });
});

describe('transitionBetweenPoses — ghi lại tư thế nguồn', () => {
  it('lưu tư thế trước và tư thế đang chuyển tới', () => {
    const player = makePlayer();
    player.currentPosture = 'standing';
    player.transitionBetweenPoses('standing', 'sitting');

    expect(player.currentPosture).toBe('sitting');
    expect(player.previousPosture).toBe('standing');
    expect(player.poseTransition).toMatchObject({ from: 'standing', to: 'sitting' });
  });
});

describe('calculateAcceleration — suy ra từ chênh lệch vận tốc', () => {
  it('gia tốc = Δv / Δt', () => {
    const player = makePlayer();
    player.previousVelocity = { x: 0, y: 0, z: 0 };
    player.physics.velocity = { x: 2, y: 0, z: 0 };

    const accel = player.calculateAcceleration(0.5);
    expect(accel.x).toBeCloseTo(4, 6);
    expect(accel.y).toBeCloseTo(0, 6);
  });

  it('gia tốc bằng 0 khi vận tốc không đổi', () => {
    const player = makePlayer();
    player.previousVelocity = { x: 3, y: 0, z: 0 };
    player.physics.velocity = { x: 3, y: 0, z: 0 };

    const accel = player.calculateAcceleration(0.016);
    expect(accel.x).toBeCloseTo(0, 6);
  });
});

describe('updateCameraFollow — dùng deltaTime', () => {
  it('lần đầu đặt thẳng camera vào vị trí bám', () => {
    const player = makePlayer();
    const camera: any = { position: { x: 0, y: 0, z: 0 } };
    player.attachCamera(camera);
    player.position = { x: 0, y: 0, z: 0 };

    player.updateCameraFollow(0.016);
    expect(camera.position.z).toBeCloseTo(-3, 5);
    expect(camera.position.y).toBeCloseTo(1.6, 5);
  });

  it('các lần sau nội suy dần, không nhảy tức thời', () => {
    const player = makePlayer();
    const camera: any = { position: { x: 0, y: 0, z: 0 } };
    player.attachCamera(camera);
    player.position = { x: 0, y: 0, z: 0 };

    player.updateCameraFollow(0.016); // đặt vị trí
    camera.position = { x: 0, y: 0, z: 0 }; // giả lập camera bị lệch
    player.updateCameraFollow(0.016);

    // Nội suy một phần: chưa tới đích, nhưng đã tiến gần hơn 0.
    expect(camera.position.z).toBeLessThan(0);
    expect(camera.position.z).toBeGreaterThan(-3);
  });
});

describe('Tương tác với đối tượng — dùng đúng tham số', () => {
  it('pressKeyboardKey ghi lại phím', () => {
    const player = makePlayer();
    player.pressKeyboardKey('E');
    expect(player.lastPressedKey).toBe('E');
    expect(player.pressedKeys).toContain('E');
  });

  it('operateMouse ghi lại trạng thái chuột', () => {
    const player = makePlayer();
    player.operateMouse({ x: 12, y: 34, button: 'right' });
    expect(player.lastMouseState).toEqual({ x: 12, y: 34, button: 'right' });
  });

  it('adjustGripPressure áp áp lực cho vật đang cầm', () => {
    const player = makePlayer();
    const held: any = { id: 'cup' };
    player.heldObjects.right = held;

    player.adjustGripPressure(held, 0.4);
    expect(player.rightHand.gripPressure).toBeCloseTo(0.4, 5);
    expect(held.gripPressure).toBeCloseTo(0.4, 5);
  });

  it('adjustGripPressure không đụng vật khác đang cầm', () => {
    const player = makePlayer();
    const held: any = { id: 'cup' };
    player.heldObjects.right = held;

    player.adjustGripPressure({ id: 'other' }, 0.4);
    expect(held.gripPressure).toBeUndefined();
  });
});
