// Smoke test không cần trình duyệt: dựng nhân vật/quái bằng engine,
// kiểm tra socket vũ khí + bao kiếm theo đúng quy tắc đã sửa ở fde8324.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Player, Monster } from '../../web/src/game/actor.js';

const scene = new THREE.Scene();

test('katana: có bao ở hông, rút -> tay phải, tra -> hông', () => {
  const p = new Player(scene, { weaponStyle: 'katana' });
  assert.ok(p.saya, 'katana phải có saya');
  assert.equal(p.sheath.sheathed, false);
  assert.equal(p.weapon.parent.name, 'socket_hand_r_weapon');
  p.sheath.sheath();
  p.placeWeapon();
  assert.equal(p.weapon.parent.name, 'socket_hips_saya');
  assert.ok(p.saya.visible, 'saya vẫn ở hông kể cả khi kiếm đã rút');
});

test('nodachi: không có bao hông, tra -> lưng', () => {
  const p = new Player(scene, { weaponStyle: 'nodachi' });
  assert.equal(p.saya, null);
  p.sheath.sheath();
  p.placeWeapon();
  assert.equal(p.weapon.parent.name, 'socket_spine_back');
});

test('quái: buildMonster dựng được, nhận sát thương và chết', () => {
  const m = new Monster(scene, 0, 0, 0, { seed: 5 });
  assert.equal(m.hp, 60);
  assert.equal(m.takeDamage(25), false);
  assert.equal(m.takeDamage(35), true);
  assert.equal(m.dead, true);
});
