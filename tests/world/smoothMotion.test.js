// Test thuần cho web/src/core/smoothMotion.js (không cần three.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyGravity, integratePosition, stepBody, stepWithSubsteps,
  interpolatePosition, renderPosition, FixedStepper, GRAVITY, TERMINAL_VELOCITY,
} from '../../web/src/core/smoothMotion.js';

function body(x = 0, y = 10, z = 0, vx = 0, vy = 0, vz = 0) {
  return { pos: { x, y, z }, vel: { x: vx, y: vy, z: vz }, grounded: false, prevPos: null };
}

test('gravity: vel.y giảm đúng g*dt và không vượt vận tốc rơi tối đa', () => {
  const b = body(0, 10, 0, 0, 0, 0);
  applyGravity(b, 0.5);
  assert.equal(b.vel.y, GRAVITY * 0.5);
  applyGravity(b, 10);
  assert.equal(b.vel.y, TERMINAL_VELOCITY);
});

test('position: rơi tự do chạm đất thì dừng đúng mặt đất, grounded=true', () => {
  const b = body(0, 1, 0, 0, 0, 0);
  const r = stepBody(b, 0.5, { groundY: 0 });
  assert.equal(b.pos.y, 0);
  assert.equal(b.vel.y, 0);
  assert.equal(b.grounded, true);
  assert.equal(r.landed, true);
  assert.ok(r.impact < 0);
});

test('position: đang đứng yên trên đất thì không bị lún / không rơi', () => {
  const b = body(0, 0, 0); b.grounded = true;
  stepBody(b, 1 / 60, { groundY: 0 });
  assert.equal(b.pos.y, 0);
  assert.equal(b.grounded, true);
});

test('position: ngang + kẹp biên + va chạm tròn', () => {
  const b = body(0, 5, 0, 10, 0, 0);
  integratePosition(b, 1, {
    groundY: 0,
    collide: (p) => { if (p.x > 5) p.x = 5; },
    boundLimit: 100,
  });
  assert.equal(b.pos.x, 5);
  const c = body(200, 5, 0, 0, 0, 0);
  integratePosition(c, 0.1, { groundY: 0, boundLimit: 60 });
  assert.equal(c.pos.x, 60);
});

test('substep: frame dài 0.05s không xuyên đất (so với bước lớn)', () => {
  const b = body(0, 0.3, 0, 0, -20, 0);
  const r = stepWithSubsteps(b, 0.05, () => ({ groundY: 0 }));
  assert.ok(b.pos.y >= 0, 'không được lún dưới đất');
  assert.equal(b.grounded, true);
  assert.equal(r.landed, true);
});

test('substep: cùng tổng thời gian, chia nhỏ hay 1 bước đều gần như nhau (ổn định)', () => {
  const a = body(0, 10, 0, 3, 0, 0);
  const bb = body(0, 10, 0, 3, 0, 0);
  stepWithSubsteps(a, 0.5, () => ({ groundY: 0 }));
  // 30 bước 1/60
  for (let i = 0; i < 30; i++) stepBody(bb, 1 / 60, { groundY: 0 });
  assert.ok(Math.abs(a.pos.x - bb.pos.x) < 0.05);
  assert.ok(Math.abs(a.pos.y - bb.pos.y) < 0.5);
});

test('render: nội suy vị trí đúng alpha, kẹp 0..1', () => {
  const out = { x: 0, y: 0, z: 0 };
  interpolatePosition({ x: 0, y: 0, z: 0 }, { x: 10, y: 20, z: 30 }, 0.5, out);
  assert.deepEqual(out, { x: 5, y: 10, z: 15 });
  interpolatePosition({ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }, 2, out);
  assert.equal(out.x, 10);
  const b = body(10, 0, 0); b.prevPos = { x: 0, y: 0, z: 0 };
  renderPosition(b, 0.25, out);
  assert.equal(out.x, 2.5);
});

test('FixedStepper: bước cố định + alpha, và chống spiral-of-death', () => {
  let calls = 0;
  const s = new FixedStepper(() => calls++, 1 / 60);
  const alpha = s.update(1 / 30); // đúng 2 bước
  assert.equal(calls, 2);
  assert.ok(alpha >= 0 && alpha < 1);
  calls = 0;
  s.update(10); // tab ẩn lâu: tối đa 5 bước, không kẹt
  assert.equal(calls, 5);
});
