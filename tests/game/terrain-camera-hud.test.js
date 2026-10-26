import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { baseHeight, buildTerrainMesh } from '../../web/src/game/terrain.js';
import { ThirdPersonCamera } from '../../web/src/game/camera.js';
import { renderHud } from '../../web/src/game/hud.js';
import { CONFIG } from '../../web/src/game/config.js';

test('baseHeight ổn định và hữu hạn', () => {
  assert.equal(baseHeight(3, -2), baseHeight(3, -2));
  assert.ok(Number.isFinite(baseHeight(0, 0)));
  assert.ok(Math.abs(baseHeight(0, 0) - Math.sin(1.7) * 3.2) < 1e-9);
});

test('buildTerrainMesh: số đỉnh đúng lưới, đỉnh khớp heightAt', () => {
  const scene = new THREE.Scene();
  const mesh = buildTerrainMesh(scene, (x, z) => baseHeight(x, z));
  const seg = CONFIG.world.terrainSegments;
  assert.equal(mesh.geometry.attributes.position.count, (seg + 1) * (seg + 1));
  const pos = mesh.geometry.attributes.position;
  assert.ok(Math.abs(pos.getY(0) - baseHeight(pos.getX(0), pos.getZ(0))) < 1e-6);
});

test('camera thứ ba: yaw=PI thì camera ở +z sau lưng nhân vật', () => {
  const cam = new ThirdPersonCamera();
  const got = {};
  const fakeCamera = {
    position: { set(x, y, z) { got.x = x; got.y = y; got.z = z; } },
    lookAt(x, y, z) { got.lx = x; got.ly = y; got.lz = z; },
  };
  cam.follow(fakeCamera, new THREE.Vector3(0, 0, 0));
  assert.ok(Math.abs(got.z - CONFIG.camera.distance) < 1e-9);
  assert.ok(Math.abs(got.x) < 1e-9);
  assert.ok(Math.abs(got.ly - CONFIG.camera.lookHeight) < 1e-9);
});

test('HUD: hiển thị HP, xu, FPS, trạng thái kiếm', () => {
  const el = {};
  const player = { hp: 80, maxHp: 100, coins: 3, kills: 2, drawn: false };
  renderHud(el, { player, monsters: [{ dead: false }, { dead: true }], fps: 59.5 });
  assert.match(el.innerHTML, /HP 80\/100/);
  assert.match(el.innerHTML, /Xu 3/);
  assert.match(el.innerHTML, /FPS 59.5/);
  assert.match(el.innerHTML, /Kiếm trong bao/);
  assert.match(el.innerHTML, /Quái còn 1/);
  renderHud(null, { player, monsters: [], fps: 60 }); // el null không vỡ
});
