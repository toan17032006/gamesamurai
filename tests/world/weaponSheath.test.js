// Test thuần cho web/src/entities/weaponSheath.js (không cần three.js,
// rig giả chỉ cần hasWeapon/isSheathed/drawWeapon/sheathWeapon).
import test from 'node:test';
import assert from 'node:assert/strict';
import { WeaponSheath, SHEATH_IDLE_SECONDS } from '../../web/src/entities/weaponSheath.js';

function fakeRig() {
  const rig = {
    _sheathed: false,
    hasWeapon() { return 'katana'; },
    isSheathed() { return this._sheathed; },
    drawWeapon() { this._sheathed = false; },
    sheathWeapon() { this._sheathed = true; },
  };
  return rig;
}

test('đứng yên đủ 3s -> tự tra kiếm vào bao', () => {
  const rig = fakeRig(); const s = new WeaponSheath(rig);
  s.update(1, { idle: true }); assert.equal(rig._sheathed, false);
  s.update(1, { idle: true }); assert.equal(rig._sheathed, false);
  s.update(1, { idle: true }); assert.equal(rig._sheathed, true);
  assert.equal(SHEATH_IDLE_SECONDS, 3);
});

test('đi bộ reset đồng hồ nhưng không tra kiếm', () => {
  const rig = fakeRig(); const s = new WeaponSheath(rig);
  s.update(2, { idle: true });
  s.update(0.1, {}); // đi bộ / tương tác
  s.update(2, { idle: true }); // tổng idle sau reset chỉ 2s
  assert.equal(rig._sheathed, false);
});

test('chạy / nhảy mà đang cầm -> tra vào ngay, không chờ 3s', () => {
  const rig = fakeRig(); const s = new WeaponSheath(rig);
  s.update(0.1, { running: true }); assert.equal(rig._sheathed, true);
  rig._sheathed = false;
  s.update(0.1, { jumping: true }); assert.equal(rig._sheathed, true);
  rig._sheathed = false;
  s.update(0.1, { airborne: true }); assert.equal(rig._sheathed, true);
});

test('đã tra vào rồi thì chạy / nhảy KHÔNG tự rút lại', () => {
  const rig = fakeRig(); rig._sheathed = true; const s = new WeaponSheath(rig);
  s.update(1, { running: true }); assert.equal(rig._sheathed, true);
  s.update(1, { jumping: true }); assert.equal(rig._sheathed, true);
  s.update(5, { idle: true }); assert.equal(rig._sheathed, true);
});

test('đánh / đỡ / ngắm -> rút ra ngay, kể cả khi đang tra trong bao', () => {
  const rig = fakeRig(); rig._sheathed = true; const s = new WeaponSheath(rig);
  s.update(0.1, { attacking: true }); assert.equal(rig._sheathed, false);
  rig._sheathed = true;
  s.update(0.1, { blocking: true }); assert.equal(rig._sheathed, false);
  rig._sheathed = true;
  s.update(0.1, { aiming: true }); assert.equal(rig._sheathed, false);
});

test('lăn giữ nguyên trạng thái (không tra, không rút giữa chừng)', () => {
  const rig = fakeRig(); const s = new WeaponSheath(rig);
  s.update(1, { dodging: true }); assert.equal(rig._sheathed, false);
  rig._sheathed = true;
  s.update(1, { dodging: true }); assert.equal(rig._sheathed, true);
});

test('nhân vật không có vũ khí thì không làm gì', () => {
  const rig = fakeRig(); rig.hasWeapon = () => null; const s = new WeaponSheath(rig);
  s.update(5, { idle: true }); assert.equal(rig._sheathed, false);
});
