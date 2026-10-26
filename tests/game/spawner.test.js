import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnMonsters, spawnPickups } from '../../web/src/game/spawner.js';
import { CONFIG } from '../../web/src/game/config.js';

// Scene giả: Monster/Pickup chỉ cần scene.add, không cần renderer.
const fakeScene = { add() {} };
const fakeWorld = { heightAt: () => 0 };

test('spawn quái/vật phẩm đúng số lượng trong CONFIG', () => {
  const monsters = spawnMonsters(fakeScene, fakeWorld);
  const pickups = spawnPickups(fakeScene, fakeWorld);
  assert.equal(monsters.length, CONFIG.monsterSpawns.length);
  assert.equal(pickups.length, CONFIG.pickupSpawns.length);
  assert.ok(monsters.every((m) => m.hp === CONFIG.monsterHp));
  assert.deepEqual(pickups.map((p) => p.kind), CONFIG.pickupSpawns.map((s) => s[2]));
});
