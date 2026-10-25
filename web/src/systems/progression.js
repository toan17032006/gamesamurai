// XP/levels (tối đa 25), thuộc tính, skill tree, phần thưởng theo cấp.
import { aggregatePassives, ALL_SKILLS, SKILL_TREE } from '../data/skills.js';
import { itemDef } from '../data/items.js';

export const ATTRS = [
  { id: 'str', name: 'Lực', desc: '+2 công kích mỗi điểm' },
  { id: 'agi', name: 'Mẫn', desc: '+0.5% chí mạng mỗi điểm' },
  { id: 'vit', name: 'Thể', desc: '+12 máu, +0.5 phòng thủ mỗi điểm' },
  { id: 'end', name: 'Nội', desc: '+8 khí lực mỗi điểm' },
];

export const MAX_LEVEL = 25;

// Phần thưởng theo cấp — mỗi cấp đều có ý nghĩa gameplay, không chỉ đổi con số:
// mọi cấp +1 điểm thuộc tính; cấp chẵn +1 điểm kỹ năng; cột mốc tặng vật phẩm/vàng/điểm cộng thêm.
export const LEVEL_REWARDS = {
  2:  { skill: 1 },
  3:  { coins: 100 },
  4:  { skill: 1, items: [{ id: 'war_bell', qty: 1 }] },
  5:  { coins: 150, items: [{ id: 'healing_draught', qty: 2 }] },
  6:  { skill: 1 },
  7:  { coins: 200, items: [{ id: 'focus_tonic', qty: 2 }] },
  8:  { skill: 1, items: [{ id: 'iron_talisman', qty: 1 }] },
  9:  { coins: 250 },
  10: { skill: 2, attr: 1, coins: 300 },
  11: { coins: 300 },
  12: { skill: 1, items: [{ id: 'healing_draught', qty: 3 }] },
  13: { coins: 350 },
  14: { skill: 1, items: [{ id: 'fox_bead', qty: 1 }] },
  15: { skill: 2, attr: 1, coins: 400 },
  16: { coins: 450 },
  17: { skill: 1 },
  18: { coins: 500, items: [{ id: 'war_drum', qty: 1 }] },
  19: { skill: 1 },
  20: { skill: 2, attr: 1, coins: 600 },
  21: { coins: 700 },
  22: { skill: 1, items: [{ id: 'kabuto', qty: 1 }] },
  23: { skill: 1 },
  24: { attr: 1, coins: 900 },
  25: { skill: 2, attr: 1, items: [{ id: 'moon_sever', qty: 1 }], title: 'Kiếm Thánh' },
};

export function rewardsForLevel(n) { return LEVEL_REWARDS[n] || { attr: 0 }; }

export class Progression {
  constructor(game) {
    this.game = game;
    this.level = 1;
    this.xp = 0;
    this.attrs = { str: 1, agi: 1, vit: 1, end: 1 };
    this.pointsAttr = 0;
    this.pointsSkill = 1;
    this.learned = ['blade_2'];          // Nhất Đao Trảm miễn phí lúc đầu
    this.equippedActive = 'blade_2';
    this.respawnPoint = null;
    this.stats = { kills: 0, deaths: 0, playtime: 0 };
    this._passives = aggregatePassives(this.learned);
  }

  xpForLevel(n) { return Math.round(60 * Math.pow(n, 1.55)); }
  xpProgress() { return { cur: this.level >= MAX_LEVEL ? 0 : this.xp, need: this.xpForLevel(this.level) }; }

  p() { return this._passives; }

  grantXp(amount) {
    if (this.level >= MAX_LEVEL) return; // đã max cấp
    const weatherMul = this.game.weatherSys ? this.game.weatherSys.xpMul() : 1;
    const gain = Math.round(amount * (1 + this._passives.xpGain) * weatherMul);
    this.xp += gain;
    this.game.ui.notify('xp', `+${gain} kinh nghiệm`);
    let leveled = false;
    while (this.level < MAX_LEVEL && this.xp >= this.xpForLevel(this.level)) {
      this.xp -= this.xpForLevel(this.level);
      this.level++;
      this.pointsAttr++;
      this.pointsSkill++;
      this.grantLevelRewards(this.level);
      leveled = true;
    }
    if (this.level >= MAX_LEVEL) this.xp = 0; // max: không cộng dồn
    if (leveled) {
      this.game.audio.sfx('levelup');
      this.game.particles.spawn({ x: this.game.player.pos.x, y: this.game.player.pos.y + 0.5, z: this.game.player.pos.z },
        { count: 30, color: [0xffd257, 0xfff0b0, 0x7ae0ff], speed: 4, life: 0.9, gravity: 2, spread: 0.8 });
      this.applyToPlayer();
      this.game.player.hp = this.game.player.maxHp;
    }
    this.game.ui.hud.dirty = true;
  }

  // phần thưởng lên cấp: +1 attr mỗi cấp (đã cộng ở grantXp), cộng thêm theo bảng
  grantLevelRewards(level) {
    const g = this.game;
    const r = rewardsForLevel(level);
    const lines = [`LÊN CẤP ${level}/${MAX_LEVEL}! +1 điểm thuộc tính`];
    if (r.skill) { this.pointsSkill += r.skill; lines.push(`+${r.skill} điểm kỹ năng`); }
    if (r.attr) { this.pointsAttr += r.attr; lines.push(`+${r.attr} điểm thuộc tính thêm`); }
    if (r.coins) { g.inventory.addCoins(r.coins); lines.push(`+${r.coins} vàng`); }
    for (const it of r.items || []) {
      g.inventory.addItem(it.id, it.qty);
      lines.push(`${it.qty}x ${itemDef(it.id)?.name || it.id}`);
    }
    if (r.title) lines.push(`Danh hiệu mới: ${r.title}`);
    g.ui.notify('level', lines.join(' · '));
  }

  applyToPlayer() {
    const player = this.game.player;
    if (!player) return;
    this._passives = aggregatePassives(this.learned);
    const w = this.game.inventory.equippedStats().weapon;
    const armorDef = this.game.inventory.equippedStats().defense;
    const a = this.attrs;
    const mods = player.character?.mods || {};
    player.stats.maxHp = Math.round((80 + a.vit * 12 + (this.level - 1) * 5 + this._passives.maxHp) * (mods.hp || 1));
    player.stats.attack = Math.round((w.damage + a.str * 2 + (this.level - 1) * 1.2 + this._passives.attackFlat) * (mods.atk || 1));
    player.stats.defense = Math.round((armorDef + a.vit * 0.5 + this._passives.defense) * (mods.def || 1));
    player.maxStamina = Math.round((90 + a.end * 8 + (this.level - 1) * 3 + this._passives.maxStamina) * (mods.stamina || 1));
    player.hp = Math.min(player.hp, player.stats.maxHp);
    player.stamina = Math.min(player.stamina, player.maxStamina);
  }

  canLearn(id) {
    const node = ALL_SKILLS[id];
    if (!node || this.learned.includes(id)) return { ok: false, reason: 'Đã học' };
    if (this.pointsSkill < node.cost) return { ok: false, reason: 'Không đủ điểm kỹ năng' };
    for (const req of node.requires) if (!this.learned.includes(req)) return { ok: false, reason: 'Cột mốc trước chưa mở' };
    return { ok: true };
  }

  learn(id) {
    const chk = this.canLearn(id);
    if (!chk.ok) { this.game.ui.notify('bad', chk.reason); return false; }
    const node = ALL_SKILLS[id];
    this.pointsSkill -= node.cost;
    this.learned.push(id);
    if (node.active) this.equippedActive = id;
    this._passives = aggregatePassives(this.learned);
    this.applyToPlayer();
    this.game.ui.notify('good', `Đã học: ${node.name}`);
    this.game.audio.sfx('unlock');
    return true;
  }

  activeSkill() {
    const node = ALL_SKILLS[this.equippedActive];
    if (!node || !node.active || !this.learned.includes(this.equippedActive)) return null;
    return { skill: node.active.skill, ...node.active, name: node.name };
  }

  spendAttr(id) {
    if (this.pointsAttr <= 0) return false;
    this.pointsAttr--;
    this.attrs[id]++;
    this.applyToPlayer();
    return true;
  }

  serialize() {
    return {
      level: this.level, xp: this.xp, attrs: { ...this.attrs },
      pointsAttr: this.pointsAttr, pointsSkill: this.pointsSkill,
      learned: [...this.learned], equippedActive: this.equippedActive,
      respawnPoint: this.respawnPoint ? { ...this.respawnPoint } : null,
      stats: { ...this.stats },
    };
  }

  apply(data) {
    if (!data) return;
    this.level = Math.min(MAX_LEVEL, data.level || 1);
    this.xp = data.xp || 0;
    this.attrs = { str: 1, agi: 1, vit: 1, end: 1, ...(data.attrs || {}) };
    this.pointsAttr = data.pointsAttr || 0;
    this.pointsSkill = data.pointsSkill ?? 0;
    this.learned = Array.isArray(data.learned) ? data.learned.filter((id) => ALL_SKILLS[id]) : [];
    this.equippedActive = data.equippedActive && this.learned.includes(data.equippedActive) ? data.equippedActive : (this.learned.find((id) => ALL_SKILLS[id]?.active) || null);
    this.respawnPoint = data.respawnPoint || null;
    this.stats = { kills: 0, deaths: 0, playtime: 0, ...(data.stats || {}) };
    this._passives = aggregatePassives(this.learned);
  }
}
