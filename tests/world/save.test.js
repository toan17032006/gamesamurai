// Test save schema v2: migration v1→v2, chặn schema tương lai, dữ liệu world vô cực.
import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateSave } from '../../web/src/systems/saveSystem.js';

test('migrate v1 → v2: thêm world.mode campaign + weather null, giữ nguyên phần còn lại', () => {
  const v1 = {
    version: 1,
    data: {
      meta: { slotName: 'test', savedAt: 1, playtime: 356, levelId: 'L02' },
      player: { level: 2, xp: 10, inventory: { coins: 142, items: [], equipped: {} } },
      progress: { levels: { states: { L01: 'completed', L02: 'unlocked' } }, quests: {} },
    },
  };
  const out = migrateSave(JSON.parse(JSON.stringify(v1)));
  assert.equal(out.version, 2);
  assert.equal(out.data.world.mode, 'campaign');
  assert.equal(out.data.weather, null);
  assert.equal(out.data.player.level, 2);
  assert.deepEqual(out.data.progress.levels.states, { L01: 'completed', L02: 'unlocked' });
});

test('migrate v2: pass-through không đổi', () => {
  const v2 = { version: 2, data: { meta: {}, player: {}, progress: {}, world: { mode: 'infinite', seed: 123 }, weather: { type: 'rain' } } };
  const out = migrateSave(v2);
  assert.equal(out, v2);
});

test('schema tương lai (v3+) → null (không đoán mò)', () => {
  assert.equal(migrateSave({ version: 3, data: {} }), null);
  assert.equal(migrateSave(null), null);
  assert.equal(migrateSave('rác'), null);
});

test('save vô cực: buildSaveData nhúng seed + states (tích hợp nhẹ qua class)', async () => {
  // import class cần mock game đủ dùng
  const { SaveSystem } = await import('../../web/src/systems/saveSystem.js');
  const game = {
    mode: 'infinite',
    progression: { stats: { playtime: 12 }, serialize: () => ({ level: 3 }) },
    inventory: { serialize: () => ({ coins: 5 }) },
    quests: { serialize: () => ({}) },
    levelManager: { currentId: null, serialize: () => ({}) },
    player: { hp: 80, pos: { x: 170, y: 1.2, z: -40 } },
    world: { def: null },
    weatherSys: { serialize: () => ({ type: 'rain', t: 50, sup: null }) },
    infinite: {
      serialize: () => ({ seed: 424242, cell: { cx: 1, cz: 0 }, waypoint: { x: 1, z: 2 }, states: { '0,0': { e: 1, c: 0, b: 0 } } }),
    },
  };
  const payload = new SaveSystem(game).buildSaveData('slot1');
  assert.equal(payload.version, 2);
  assert.equal(payload.data.world.mode, 'infinite');
  assert.equal(payload.data.world.seed, 424242);
  assert.equal(payload.data.meta.mode, 'infinite');
  assert.equal(payload.data.meta.levelId, 'INFINITE');
  assert.deepEqual(payload.data.world.pos, { x: 170, z: -40 });
  assert.equal(payload.data.weather.type, 'rain');
  // vòng lại qua migration không phá v2
  assert.equal(migrateSave(payload), payload);
});
