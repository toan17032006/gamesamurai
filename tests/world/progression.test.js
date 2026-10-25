// Test progression: cap 25 cấp + phần thưởng theo cấp có ý nghĩa gameplay.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Progression, MAX_LEVEL, LEVEL_REWARDS, rewardsForLevel } from '../../web/src/systems/progression.js';

function mockGame() {
  const game = {
    notifications: [],
    coins: 0,
    items: [],
    ui: { notify(type, text) { game.notifications.push(text); }, hud: { dirty: false } },
    audio: { sfx() {} },
    particles: { spawn() {} },
    player: { pos: { x: 0, y: 0, z: 0 }, stats: {}, hp: 100, stamina: 90, maxStamina: 100 },
    inventory: {
      addCoins(n) { game.coins += n; },
      addItem(id, qty) { game.items.push([id, qty]); },
      equippedStats: () => ({ weapon: { damage: 10, speed: 1, combo: 3, range: 2.3, crit: 5 }, defense: 0 }),
    },
    weatherSys: null,
  };
  return game;
}

test('MAX_LEVEL = 25 và bảng thưởng phủ mọi cấp 2..25', () => {
  assert.equal(MAX_LEVEL, 25);
  for (let lv = 2; lv <= 25; lv++) {
    const r = rewardsForLevel(lv);
    assert.ok(r && typeof r === 'object', `thiếu thưởng cấp ${lv}`);
    // mỗi cấp có ít nhất một loại thưởng ngoài +1 attr mặc định
    const meaningful = (r.skill || 0) + (r.attr || 0) + (r.coins ? 1 : 0) + (r.items?.length ? 1 : 0) + (r.title ? 1 : 0);
    assert.ok(meaningful >= 1, `cấp ${lv} không có phần thưởng ý nghĩa`);
  }
});

test('Cấp 25 tặng Triệt Nguyệt + danh hiệu', () => {
  const r = LEVEL_REWARDS[25];
  assert.ok(r.items.some((i) => i.id === 'moon_sever'));
  assert.equal(r.title, 'Kiếm Thánh');
});

test('grantXp: lên cấp đúng, thưởng tự cấp, và CHẶN ở cấp 25', () => {
  const g = mockGame();
  const p = new Progression(g);
  // XP khổng lồ: phải dừng ở 25
  p.grantXp(1e9);
  assert.equal(p.level, MAX_LEVEL, 'phải chặn ở cấp 25');
  assert.equal(p.xp, 0, 'max cấp không cộng dồn xp');
  assert.ok(p.pointsAttr >= 24, 'mỗi cấp +1 điểm thuộc tính');
  assert.ok(p.pointsSkill >= 13, 'cấp chẵn +1 điểm kỹ năng (12 cấp chẵn + 1 khởi đầu)');
  assert.ok(g.coins > 0, 'có thưởng vàng theo bảng');
  assert.ok(g.items.some(([id]) => id === 'moon_sever'), 'nhận vũ khí thưởng cấp 25');
  // tiếp tục grant: không lên thêm, không Notify level mới
  const before = p.level;
  p.grantXp(1e9);
  assert.equal(p.level, before);
});

test('grantXp: mưa linh khí nhân XP (weatherSys.xpMul)', () => {
  const g = mockGame();
  g.weatherSys = { xpMul: () => 1.5 };
  const p = new Progression(g);
  p.grantXp(100);
  assert.ok(p.xp === 150 || p.level > 1, 'XP phải được nhân 1.5');
});

test('serialize/apply vòng trọn + clamp level theo MAX_LEVEL', () => {
  const g = mockGame();
  const p = new Progression(g);
  p.grantXp(5000);
  const s = p.serialize();
  const p2 = new Progression(mockGame());
  p2.apply(JSON.parse(JSON.stringify(s)));
  assert.equal(p2.level, p.level);
  assert.equal(p2.xp, p.xp);
  assert.deepEqual(p2.attrs, p.attrs);
  // save cũ ghi level > 25 (không thể xảy ra nhưng phòng thủ) → clamp
  const p3 = new Progression(mockGame());
  p3.apply({ level: 99 });
  assert.equal(p3.level, MAX_LEVEL);
});
