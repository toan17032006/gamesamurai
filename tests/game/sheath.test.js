import test from 'node:test';
import assert from 'node:assert/strict';
import { WeaponSheath, SHEATH_IDLE_SECONDS } from '../../web/src/game/sheath.js';

const base = { moving: false, grounded: true, attacking: false, blocking: false, aiming: false, dt: 1 };

test('đứng yên đủ 3s -> tự tra kiếm', () => {
  const s = new WeaponSheath();
  assert.equal(s.sheathed, false);
  for (let i = 0; i < SHEATH_IDLE_SECONDS; i++) s.update({ ...base });
  assert.equal(s.sheathed, true);
});

test('chưa đủ 3s thì chưa tra', () => {
  const s = new WeaponSheath();
  s.update({ ...base, dt: 2.9 });
  assert.equal(s.sheathed, false);
});

test('chạy khi đang rút -> tra ngay; đã tra thì chạy vẫn giữ trong bao', () => {
  const s = new WeaponSheath();
  s.update({ ...base, moving: true, running: true });
  assert.equal(s.sheathed, true);
  s.update({ ...base, moving: true, running: true });
  assert.equal(s.sheathed, true);
});

test('đi bộ khi đang rút -> giữ kiếm, không tra', () => {
  const s = new WeaponSheath();
  s.update({ ...base, moving: true, running: false });
  assert.equal(s.sheathed, false);
});

test('nhảy khi đang rút -> tra ngay', () => {
  const s = new WeaponSheath();
  s.update({ ...base, grounded: false });
  assert.equal(s.sheathed, true);
});

test('tấn công / đỡ / ngắm -> rút kiếm ngay', () => {
  const s = new WeaponSheath();
  s.sheath();
  s.update({ ...base, attacking: true });
  assert.equal(s.sheathed, false);
  s.sheath();
  s.update({ ...base, blocking: true });
  assert.equal(s.sheathed, false);
  s.sheath();
  s.update({ ...base, aiming: true });
  assert.equal(s.sheathed, false);
});

test('đi bộ không tra kiếm và reset đồng hồ đứng yên', () => {
  const s = new WeaponSheath();
  s.update({ ...base, dt: 2.5 });
  s.update({ ...base, moving: true });
  s.update({ ...base, dt: 2.5 });
  assert.equal(s.sheathed, false);
});
