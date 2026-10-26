// Spawn — mọi vị trí quái/vật phẩm lấy từ CONFIG, không còn
// mảng spawn rải rác trong Game.
import { CONFIG } from './config.js';
import { Monster } from './monster.js';
import { Pickup } from './items.js';

export function spawnMonsters(scene, world) {
  return CONFIG.monsterSpawns.map(
    ([x, z, seed]) => new Monster(scene, x, z, world.heightAt(x, z), { seed }),
  );
}

export function spawnPickups(scene, world) {
  return CONFIG.pickupSpawns.map(
    ([x, z, kind]) => new Pickup(scene, x, z, world.heightAt(x, z), kind),
  );
}
