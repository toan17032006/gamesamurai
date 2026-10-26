import test from 'node:test';
import assert from 'node:assert/strict';
import { findAttackHits } from '../../web/src/game/combat.js';

// Nhân vật ở (0,0), hướng yaw=0 => forward=(sin 0, cos 0)=(0,1) => hướng +z.
const attacker = { x: 0, z: 0 };
const target = (x, z, dead = false) => ({ pos: { x, z }, dead });

test('chém trúng mục tiêu phía trước trong tầm', () => {
  const hits = findAttackHits(attacker, 0, [target(0, 2)]);
  assert.equal(hits.length, 1);
});

test('không trúng mục tiêu sau lưng, ngoài tầm, hoặc đã chết', () => {
  const hits = findAttackHits(attacker, 0, [target(0, -2), target(0, 3), target(0, 2, true)]);
  assert.equal(hits.length, 0);
});

test('không trúng mục tiêu ngoài góc chém (lệch 90 độ)', () => {
  const hits = findAttackHits(attacker, 0, [target(2, 0)]);
  assert.equal(hits.length, 0);
});
