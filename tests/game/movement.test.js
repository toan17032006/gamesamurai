import test from 'node:test';
import assert from 'node:assert/strict';
import { moveDirection, speedFor } from '../../web/src/game/movement.js';
import { CONFIG } from '../../web/src/game/config.js';

const approx = (a, b) => Math.abs(a - b) < 1e-9;

test('tiến với yaw=PI: hướng (0,-1) — quay lưng về camera', () => {
  const d = moveDirection(Math.PI, { x: 0, y: 1 });
  assert.ok(approx(d.x, 0) && approx(d.z, -1));
});

test('sang phải với yaw=0: hướng (1,0)', () => {
  const d = moveDirection(0, { x: 1, y: 0 });
  assert.ok(approx(d.x, 1) && approx(d.z, 0));
});

test('chéo được chuẩn hóa về độ dài 1', () => {
  const d = moveDirection(0, { x: 1, y: 1 });
  assert.ok(approx(Math.hypot(d.x, d.z), 1));
});

test('không input -> null', () => {
  assert.equal(moveDirection(0, { x: 0, y: 0 }), null);
});

test('tốc độ chạy > tốc độ đi bộ', () => {
  assert.equal(speedFor(false), CONFIG.walkSpeed);
  assert.equal(speedFor(true), CONFIG.sprintSpeed);
  assert.ok(CONFIG.sprintSpeed > CONFIG.walkSpeed);
});
