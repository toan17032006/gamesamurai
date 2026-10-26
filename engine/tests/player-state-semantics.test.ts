// engine/tests/player-state-semantics.test.ts
//
// Kiểm chứng đợt tối ưu "loại bỏ return có sẵn" cho RealisticHumanPlayer.
//
// 9 method sau đây trước đây BỎ QUA tham số hoàn toàn (chỉ "bấm phím" hoặc
// trả về giá trị cố định):
//   turnLightOn / turnLightOff / putOnBackpack / unlockDoor / lockDoor /
//   updateClothPhysics / updateHairPhysics / crossFadeAnimation / updatePlayerAI
//
// Nay chúng phải thực sự dùng đối số và ghi lại trạng thái quan sát được.
import { describe, it, expect } from 'vitest';
import { RealisticHumanPlayer } from '../src/player/realistic-human-player.js';

function makePlayer(): RealisticHumanPlayer {
  const player = new RealisticHumanPlayer();
  player.initializeSkeleton();
  return player;
}

describe('turnLightOn / turnLightOff — thao tác đúng đèn được chỉ định', () => {
  it('bật đèn: cờ on/isOn và cường độ sáng được cập nhật', () => {
    const player = makePlayer();
    const lamp: any = { id: 'lamp', on: false, isOn: false, intensity: 0, position: { x: 1, y: 1, z: 1 } };

    player.turnLightOn(lamp);

    expect(lamp.on).toBe(true);
    expect(lamp.isOn).toBe(true);
    expect(lamp.intensity).toBeGreaterThan(0);
    expect(player.activeInteraction).toBe(lamp);
  });

  it('tắt đèn: cờ on/isOn về false và cường độ về 0', () => {
    const player = makePlayer();
    const lamp: any = { id: 'lamp', on: true, isOn: true, intensity: 2, position: { x: 1, y: 1, z: 1 } };

    player.turnLightOff(lamp);

    expect(lamp.on).toBe(false);
    expect(lamp.isOn).toBe(false);
    expect(lamp.intensity).toBe(0);
  });

  it('hai đèn khác nhau cho kết quả khác nhau', () => {
    const player = makePlayer();
    const lampA: any = { id: 'a', on: false, isOn: false, intensity: 0 };
    const lampB: any = { id: 'b', on: false, isOn: false, intensity: 0 };

    player.turnLightOn(lampA);
    expect(lampA.on).toBe(true);
    expect(lampB.on).toBe(false);
  });
});

describe('putOnBackpack — ba lô được đeo lên lưng', () => {
  it('gắn ba lô vào vị trí lưng của người chơi', () => {
    const player = makePlayer();
    player.position = { x: 4, y: 0, z: -2 };
    const backpack: any = { id: 'bag' };

    player.putOnBackpack(backpack);

    expect(backpack.worn).toBe(true);
    expect(backpack.position.x).toBeCloseTo(4, 6);
    expect(backpack.position.y).toBeCloseTo(1.15, 6);
    expect(backpack.position.z).toBeCloseTo(-2.18, 6);
    expect(player.activeInteraction).toBe(backpack);
  });

  it('hai người chơi ở hai vị trí khác nhau cho ba lô ở hai vị trí khác nhau', () => {
    const a = makePlayer();
    a.position = { x: 0, y: 0, z: 0 };
    const bagA: any = { id: 'a' };
    a.putOnBackpack(bagA);

    const b = makePlayer();
    b.position = { x: 10, y: 0, z: 0 };
    const bagB: any = { id: 'b' };
    b.putOnBackpack(bagB);

    expect(bagA.position.x).not.toBeCloseTo(bagB.position.x, 3);
  });
});

describe('unlockDoor / lockDoor — dùng chìa khóa và đổi trạng thái khóa', () => {
  it('mở khóa: cửa được mở khóa và chìa khóa được cầm', () => {
    const player = makePlayer();
    const door: any = { id: 'door', locked: true, isLocked: true, position: { x: 1, y: 1, z: 2 } };
    const key: any = { id: 'key' };

    player.unlockDoor(door, key);

    expect(door.locked).toBe(false);
    expect(door.isLocked).toBe(false);
    expect(player.heldObjects.right).toBe(key);
  });

  it('khóa: cửa bị khóa lại', () => {
    const player = makePlayer();
    const door: any = { id: 'door', locked: false, isLocked: false, position: { x: 1, y: 1, z: 2 } };
    const key: any = { id: 'key' };

    player.lockDoor(door, key);

    expect(door.locked).toBe(true);
    expect(door.isLocked).toBe(true);
  });
});

describe('updateClothPhysics / updateHairPhysics — vật lý thứ cấp theo deltaTime', () => {
  it('vải bị đẩy khi người chơi di chuyển, và không đẩy khi đứng yên', () => {
    const moving = makePlayer();
    moving.physics.velocity = { x: 3, y: 0, z: 0 };
    moving.updateClothPhysics(0.016);
    expect(Math.abs(moving.clothState.sway.x)).toBeGreaterThan(0);

    const still = makePlayer();
    still.physics.velocity = { x: 0, y: 0, z: 0 };
    still.updateClothPhysics(0.016);
    expect(still.clothState.sway.x).toBeCloseTo(0, 6);
  });

  it('bước thời gian lớn làm vải lệch nhiều hơn bước nhỏ', () => {
    const fast = makePlayer();
    fast.physics.velocity = { x: 3, y: 0, z: 0 };
    fast.updateClothPhysics(0.1);

    const slow = makePlayer();
    slow.physics.velocity = { x: 3, y: 0, z: 0 };
    slow.updateClothPhysics(0.01);

    expect(Math.abs(fast.clothState.sway.x)).toBeGreaterThan(Math.abs(slow.clothState.sway.x));
  });

  it('tóc cũng phản ứng với vận tốc', () => {
    const player = makePlayer();
    player.physics.velocity = { x: 0, y: 0, z: 2 };
    player.updateHairPhysics(0.016);
    expect(Math.abs(player.hairState.sway.z)).toBeGreaterThan(0);
  });

  it('biên độ lệch bị giới hạn', () => {
    const player = makePlayer();
    player.physics.velocity = { x: 500, y: 0, z: 0 };
    for (let i = 0; i < 200; i++) player.updateClothPhysics(0.05);
    expect(Math.abs(player.clothState.sway.x)).toBeLessThanOrEqual(player.clothState.maxSway + 1e-9);
  });
});

describe('crossFadeAnimation — có blend thật giữa hai animation', () => {
  it('ghi lại animation nguồn và hệ số blend tiến triển theo thời gian', () => {
    const player = makePlayer();
    player.activeAnimation = 'walk';

    player.crossFadeAnimation('walk', 'run', 0.5);
    expect(player.activeAnimation).toBe('run');
    expect(player.previousAnimation).toBe('walk');
    expect(player.animationBlend.from).toBe('walk');
    expect(player.animationBlend.to).toBe('run');
    expect(player.animationBlend.duration).toBe(0.5);
    expect(player.animationBlend.weight).toBeCloseTo(0, 6);

    player.updateAnimationMixer(0.25);
    expect(player.animationBlend.weight).toBeCloseTo(0.5, 6);

    player.updateAnimationMixer(0.25);
    expect(player.animationBlend.weight).toBeCloseTo(1, 6);
    expect(player.previousAnimation).toBeNull();
  });

  it('thời lượng khác nhau cho hệ số blend khác nhau', () => {
    const short = makePlayer();
    short.crossFadeAnimation('idle', 'walk', 0.2);
    short.updateAnimationMixer(0.1);
    const shortWeight = short.animationBlend.weight;

    const long = makePlayer();
    long.crossFadeAnimation('idle', 'walk', 1.0);
    long.updateAnimationMixer(0.1);
    const longWeight = long.animationBlend.weight;

    expect(shortWeight).toBeGreaterThan(longWeight);
  });
});

describe('updatePlayerAI / chooseNextAction — quyết định theo tình huống', () => {
  it('có vật cản gần thì chọn né', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };
    player.obstacles = [{ id: 'rock', name: 'Rock', type: 'rock', position: { x: 1, y: 0, z: 0 } }];
    expect(player.chooseNextAction()).toBe('avoid');
  });

  it('có vật tương tác trong tầm thì chọn tương tác', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };
    player.obstacles = [];
    player.nearbyObjects = [{ id: 'cup', name: 'Cup', type: 'cup', position: { x: 1, y: 0, z: 0 } }];
    expect(player.chooseNextAction()).toBe('interact');
  });

  it('đang di chuyển thì chọn đi, đứng yên thì nghỉ', () => {
    const walking = makePlayer();
    walking.physics.velocity = { x: 2, y: 0, z: 0 };
    expect(walking.chooseNextAction()).toBe('walk');

    const idle = makePlayer();
    expect(idle.chooseNextAction()).toBe('idle');
  });

  it('AI chỉ ra quyết định mới sau khi hết thời gian chờ', () => {
    const player = makePlayer();
    player.position = { x: 0, y: 0, z: 0 };
    player.obstacles = [];
    player.nearbyObjects = [{ id: 'cup', name: 'Cup', type: 'cup', position: { x: 1, y: 0, z: 0 } }];

    player.updatePlayerAI(0.1);
    expect(player.aiState.action).toBe('interact');

    // Trong khoảng cooldown, AI không đổi quyết định.
    player.nearbyObjects = [];
    player.updatePlayerAI(0.1);
    expect(player.aiState.action).toBe('interact');

    // Hết cooldown → nhận tình huống mới.
    player.updatePlayerAI(1.0);
    expect(player.aiState.action).toBe('idle');
  });
});
