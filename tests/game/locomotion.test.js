import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Locomotion } from '../../web/src/game/locomotion.js';
import { CONFIG } from '../../web/src/game/config.js';

test('đứng trên mặt đất: giữ nguyên độ cao, vận tốc 0', () => {
  const l = new Locomotion(new THREE.Vector3(0, 0, 0));
  const grounded = l.stepVertical(1 / 60, 0, false);
  assert.equal(grounded, true);
  assert.equal(l.pos.y, 0);
  assert.equal(l.velY, 0);
});

test('nhảy: rời mặt đất ngay trong frame bấm, frame sau tiếp tục lên', () => {
  const l = new Locomotion(new THREE.Vector3(0, 0, 0));
  const grounded = l.stepVertical(1 / 60, 0, true);
  assert.equal(grounded, true);
  assert.equal(l.velY, CONFIG.jumpVelocity);
  assert.ok(l.pos.y > 0, 'nhảy phải rời mặt đất ngay, không bị reset về 0');
  const y1 = l.pos.y;
  l.stepVertical(1 / 60, 0, false);
  assert.ok(l.pos.y > y1, 'đang lên thì độ cao tiếp tục tăng');
});

test('rơi từ trên cao: vận tốc âm, độ cao giảm', () => {
  const l2 = new Locomotion(new THREE.Vector3(0, 5, 0));
  l2.stepVertical(1 / 60, 0, false);
  assert.ok(l2.velY < 0 && l2.pos.y < 5);
});

test('rơi không vượt terminal velocity', () => {
  const l = new Locomotion(new THREE.Vector3(0, 1000, 0));
  for (let i = 0; i < 600; i++) l.stepVertical(1 / 60, 0, false);
  assert.ok(l.velY >= -CONFIG.terminalVelocity);
});

test('lăn: di chuyển theo hướng đối mặt trong thời gian dodge', () => {
  const l = new Locomotion(new THREE.Vector3(0, 0, 0));
  l.stepDodge(1 / 60, true, 0); // facing +z
  assert.ok(l.pos.z > 0);
  assert.ok(l.dodgeTimer > 0 && l.dodgeTimer < CONFIG.dodgeTime);
});
