// Dragon: world-boss bay (Infinite World danger cells) — bay lượn, lao xuống,
// phun lửa, 3 pha (bay → đáp đất → cuồng nộ). Rig rồng procedural riêng.
import * as THREE from 'three';
import { Entity } from './entity.js';
import { bosses, BOSS_ATTACKS } from '../data/bosses.js';
import { NPC_ATTACKS } from '../data/enemies.js';
import { G, M } from '../gfx/materials.js';
import { angleWrap, clamp } from '../core/utils.js';

export const DRAGON_DEF = {
  id: 'fire_dragon', name: 'Tatsu no Ou - Rồng Vực Lửa', title: 'Chúa tể bầu trời biến động',
  hp: 1500, attack: 36, defense: 16, speed: 7.5, poise: 160, xp: 1600, coins: 1000,
  scale: 2.2, intro: '"Ma quỷ rung động... bầu trời là của ta."',
  phases: [
    { hpPct: 1.0, cooldownMul: 1.0, speedMul: 1.0, moves: ['d_fire_fan', 'd_dive'] },
    { hpPct: 0.66, cooldownMul: 0.8, speedMul: 1.1, moves: ['d_dive', 'd_slam', 'd_fire_fan'], summons: [] },
    { hpPct: 0.33, cooldownMul: 0.6, speedMul: 1.25, moves: ['d_fire_fan', 'd_dive', 'd_slam', 'fire_ring'] },
  ],
  loot: [{ id: 'demon_fang', chance: 1, qty: 5 }, { id: 'oni_cleaver', chance: 0.4, qty: 1 }, { id: 'shade_ash', chance: 1, qty: 2 }],
};

// đòn riêng của rồng (tái dùng resolver của combat: aoe / projectileFan)
export const DRAGON_ATTACKS = {
  d_fire_fan: { name: 'Hỏa Long Tán', dmgMul: 1.2, dur: 1.8, hitAt: 0.55, range: 0, arc: 0, anim: 'e_cast',
    stamina: 0, knockback: 5, moveImpulse: 0, projectileFan: { count: 7, speed: 17, fire: true, spread: 1.5 }, telegraph: 0.6 },
  d_dive: { name: 'Phó Ảnh Lao', dmgMul: 1.7, dur: 1.6, hitAt: 0.62, range: 3.6, arc: 6.3, anim: 'e_slam',
    stamina: 0, knockback: 9, moveImpulse: 0, aoe: true, fire: false },
  d_slam: { name: 'Vũ Đoàn Đập Đất', dmgMul: 1.5, dur: 1.8, hitAt: 0.66, range: 4.2, arc: 6.3, anim: 'e_slam',
    stamina: 0, knockback: 8, moveImpulse: 0, aoe: true },
};
// fire_ring mượn từ BOSS_ATTACKS (resolve trên đất)

export class Dragon extends Entity {
  constructor(game, { x, z, levelScale = 1 }) {
    const def = DRAGON_DEF;
    super(x, game.world ? game.world.groundAt(x, z) : 0, z);
    this.game = game;
    this.bossDef = def;
    this.def = def; // pipeline kill (xp/coins/loot) đọc npc.def
    this.isBoss = true;
    this.enemyId = 'fire_dragon';
    this.name = def.name;
    this.faction = 'dragon';
    this.levelScale = levelScale;
    this.radius = 1.6;
    this.stats = { maxHp: Math.round(def.hp * levelScale), attack: def.attack, defense: def.defense, speed: def.speed, poise: def.poise };
    this.hp = this.stats.maxHp;
    this.maxHp = this.stats.maxHp;
    this.scale = def.scale;
    this.combat = { dead: false, iframes: 1.2, attack: null, blocking: false, staggered: 0, parried: 0 };
    this.phaseIdx = 0;
    this.state = 'hover';        // hover | dive | grounded
    this.attackCd = 2.5;
    this.introT = 2.4;
    this.flyAngle = 0;
    this.flyH = 11;
    this.decideT = 0;
    this.lastMove = -1;
    this.yaw = 0;
    this.fadeT = 0;
    this.disposed = false;

    this.rig = this.buildRig();
    game.engine.scene.add(this.rig.group);
    this.pos.y = game.world.groundAt(x, z) + this.flyH;

    game.ui.notify('boss', def.intro || 'Rồng hiện hình!');
    game.ui.hud.setBoss(this);
    game.player.combat.iframes = 2.6;
  }

  buildRig() {
    const g = new THREE.Group();
    const s = 1;
    const scaleMat = M(0x7a1e12, { rough: 0.6 });
    const bellyMat = M(0xc8a050, { rough: 0.7 });
    const spikeMat = M(0x2a1010, { rough: 0.8 });
    // thân
    const body = new THREE.Mesh(G('sph', 0.75, 10, 8), scaleMat);
    body.scale.set(0.8, 0.75, 1.5);
    body.castShadow = true;
    g.add(body);
    const belly = new THREE.Mesh(G('sph', 0.6, 9, 7), bellyMat);
    belly.scale.set(0.66, 0.55, 1.3);
    belly.position.y = -0.18;
    g.add(belly);
    // cổ + đầu
    const neck = new THREE.Group();
    neck.position.set(0, 0.3, 0.85);
    const nseg = new THREE.Mesh(G('cyl', 0.28, 0.38, 1.2, 8), scaleMat);
    nseg.rotation.x = 1.15;
    nseg.position.z = 0.45;
    neck.add(nseg);
    const head = new THREE.Group();
    head.position.set(0, 0.42, 1.15);
    const skull = new THREE.Mesh(G('sph', 0.34, 9, 7), scaleMat);
    skull.scale.set(0.85, 0.75, 1.4);
    skull.castShadow = true;
    head.add(skull);
    const snout = new THREE.Mesh(G('box', 0.3, 0.22, 0.55), scaleMat);
    snout.position.set(0, -0.06, 0.45);
    head.add(snout);
    const jaw = new THREE.Mesh(G('box', 0.26, 0.1, 0.5), bellyMat);
    jaw.position.set(0, -0.2, 0.42);
    head.add(jaw);
    for (const h of [-1, 1]) {
      const horn = new THREE.Mesh(G('cone', 0.07, 0.5, 6), spikeMat);
      horn.position.set(h * 0.16, 0.26, -0.05);
      horn.rotation.set(-0.6, 0, -h * 0.5);
      head.add(horn);
    }
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffd257, emissive: 0xff8a10, emissiveIntensity: 3, roughness: 0.3 });
    for (const e of [-1, 1]) {
      const eye = new THREE.Mesh(G('sph', 0.05, 6, 5), eyeMat);
      eye.position.set(e * 0.16, 0.08, 0.28);
      head.add(eye);
    }
    neck.add(head);
    g.add(neck);
    // cánh (2 khớp xoay vẫy)
    const wings = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.5, 0.35, 0.1);
      const arm = new THREE.Mesh(G('box', 1.5, 0.1, 0.28), scaleMat);
      arm.position.x = side * 0.75;
      pivot.add(arm);
      const membrane = new THREE.Mesh(G('plane', 2.3, 1.7),
        M(0x8a2a1a, { rough: 0.75, extra: { side: THREE.DoubleSide, transparent: true, opacity: 0.92 } }));
      membrane.position.set(side * 1.35, -0.45, -0.5);
      membrane.rotation.set(-0.35, side * 0.55, side * -0.25);
      pivot.add(membrane);
      g.add(pivot);
      wings.push(pivot);
    }
    // đuôi (2 đoạn lắc lư)
    const tail = new THREE.Group();
    tail.position.set(0, 0.1, -1.0);
    const t1 = new THREE.Mesh(G('cone', 0.3, 1.6, 7), scaleMat);
    t1.rotation.x = Math.PI / 2;
    t1.position.z = -0.8;
    tail.add(t1);
    const t2 = new THREE.Mesh(G('cone', 0.14, 1.2, 6), scaleMat);
    t2.rotation.x = Math.PI / 2;
    t2.position.z = -1.9;
    tail.add(t2);
    const spike = new THREE.Mesh(G('cone', 0.12, 0.4, 5), spikeMat);
    spike.position.z = -2.5;
    spike.rotation.x = -Math.PI / 2;
    tail.add(spike);
    g.add(tail);
    // gai lưng
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Mesh(G('cone', 0.09, 0.3, 5), spikeMat);
      sp.position.set(0, 0.55 - i * 0.02, 0.55 - i * 0.42);
      g.add(sp);
    }
    return { group: g, joints: { wings, neck, tail, head } };
  }

  distTo(p) { return Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z); }
  effAttack() { return this.stats.attack; }
  effDefense() { return this.stats.defense; }
  faceToward(x, z, dt, rate = 8) {
    const want = Math.atan2(x - this.pos.x, z - this.pos.z);
    let d = want - this.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.yaw += d * (1 - Math.exp(-rate * dt));
  }

  currentPhase() {
    const hpPct = this.hp / this.maxHp;
    let idx = 0;
    for (let i = 0; i < this.bossDef.phases.length; i++) if (hpPct <= this.bossDef.phases[i].hpPct) idx = i;
    return idx;
  }

  takeDamage(amount, opts = {}) {
    if (this.combat.dead) return { result: 'dead' };
    if (this.combat.iframes > 0 && !opts.pure) return { result: 'iframes' };
    if (this.introT > 0) return { result: 'iframes' };
    const dmg = Math.max(1, Math.round(amount * (100 / (100 + this.effDefense())) * (opts.crit ? 1.6 : 1)));
    this.hp -= dmg;
    this.game.vfx.popup({ x: this.pos.x, y: this.pos.y, z: this.pos.z }, String(dmg), opts.crit ? '#ffd257' : '#ffffff', opts.crit);
    this.game.particles.spawn({ x: this.pos.x, y: this.pos.y + 0.5, z: this.pos.z },
      { count: 10, color: [0xff5a4a, 0xffd257], speed: 5, life: 0.35, spread: 0.6 });
    if (this.hp <= 0) { this.die(); return { result: 'killed', dmg }; }
    return { result: 'hit', dmg };
  }

  die() {
    if (this.combat.dead) return;
    this.combat.dead = true;
    this.hp = 0;
    const game = this.game;
    game.audio.sfx('roar');
    game.cameraRig.shake(0.8);
    game.particles.spawn({ x: this.pos.x, y: this.pos.y, z: this.pos.z },
      { count: 80, color: [0xff5a2a, 0xffd257, 0xffffff], speed: 11, life: 1.2, spread: 2, gravity: -3 });
    game.combat.onNpcKilled(this);
    game.ui.hud.setBoss(null);
  }

  dispose(game) {
    if (this.disposed) return;
    this.disposed = true;
    game.engine.scene.remove(this.rig.group);
    game.ui.hud.setBoss(null);
  }

  update(dt, game) {
    if (this.disposed) return;
    const player = game.player;
    if (this.combat.dead) {
      this.fadeT += dt;
      this.pos.y -= dt * 1.2;
      this.rig.group.position.copy(this.pos);
      this.rig.group.rotation.z = Math.min(1.4, this.fadeT * 1.2);
      if (this.fadeT > 4) game.removeNpc(this);
      return;
    }

    // intro bay vòng chào mừng
    if (this.introT > 0) {
      this.introT -= dt;
      this.flyAngle += dt * 0.8;
      const t = game.world.groundAt(player.pos.x, player.pos.z);
      this.pos.x = player.pos.x + Math.cos(this.flyAngle) * 18;
      this.pos.z = player.pos.z + Math.sin(this.flyAngle) * 18;
      this.pos.y = t + this.flyH;
      this.faceToward(player.pos.x, player.pos.z, dt, 4);
      this.flap(dt, 1);
      this.syncRig();
      return;
    }

    // chuyển pha
    const ph = this.currentPhase();
    if (ph !== this.phaseIdx) {
      this.phaseIdx = ph;
      this.combat.iframes = 0.6;
      game.audio.sfx('roar');
      game.cameraRig.shake(0.6);
      game.vfx.popup(this.pos, 'GIAI ĐOẠN ' + (ph + 1), '#ff6a5a', true);
      if (ph >= 1) { this.state = 'grounded'; } // đáp đất từ pha 2
      if (ph >= 2) { this.state = 'hover'; this.flyH = 13; }
    }

    this.attackCd -= dt;
    this.decideT -= dt;
    const d = this.distTo(player);
    const def = this.bossDef;
    const speedMul = def.phases[this.phaseIdx].speedMul;

    if (this.state === 'hover') {
      // bay quanh player, thi thoảng lao/lửa
      this.flyAngle += dt * 0.55 * speedMul;
      const r = d > 14 ? d * 0.8 : 13;
      const tx = player.pos.x + Math.cos(this.flyAngle) * r;
      const tz = player.pos.z + Math.sin(this.flyAngle) * r;
      const ty = game.world.groundAt(tx, tz) + this.flyH;
      this.pos.x += (tx - this.pos.x) * Math.min(1, dt * 1.2);
      this.pos.z += (tz - this.pos.z) * Math.min(1, dt * 1.2);
      this.pos.y += (ty - this.pos.y) * Math.min(1, dt * 1.5);
      this.faceToward(player.pos.x, player.pos.z, dt, 5);
      this.flap(dt, 1);
      // phun lửa khi bay (tầm xa)
      if (this.attackCd <= 0 && this.decideT <= 0) {
        const moves = def.phases[this.phaseIdx].moves.filter((m) => m === 'd_fire_fan' || m === 'fire_ring');
        const move = moves[(Math.random() * moves.length) | 0] || 'd_fire_fan';
        this.castMove(move, game);
        this.decideT = 2.2 * def.phases[this.phaseIdx].cooldownMul;
        // thi thoảng đáp xuống lao
        if (Math.random() < 0.45) this.state = 'dive';
      }
    } else if (this.state === 'dive') {
      // lao xuống vị trí player rồi nổ AoE
      const tx = player.pos.x, tz = player.pos.z;
      const ty = game.world.groundAt(tx, tz) + 1.2;
      const dx = tx - this.pos.x, dy = ty - this.pos.y, dz = tz - this.pos.z;
      const l = Math.hypot(dx, dy, dz) || 1;
      const sp = 20 * speedMul;
      this.pos.x += (dx / l) * sp * dt;
      this.pos.y += (dy / l) * sp * dt;
      this.pos.z += (dz / l) * sp * dt;
      this.faceToward(tx, tz, dt, 6);
      this.flap(dt, 0.4);
      if (l < 1.6 || this.pos.y <= ty + 0.2) {
        // chạm đất: AoE thật qua combat resolver
        game.vfx.telegraph(this.pos, 3.6, 0.1, 0xff5a2a);
        game.audio.sfx('thud');
        game.cameraRig.shake(0.45);
        for (const t of game.combat.candidatesFor(this)) {
          const dd = Math.hypot(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
          if (dd <= 3.9 && t.faction !== this.faction) {
            t.takeDamage(this.effAttack() * 1.7, { from: this, knockback: 8, poiseDamage: 30 });
          }
        }
        game.particles.spawn(this.pos, { count: 30, color: [0xff5a2a, 0xc8b090], speed: 8, life: 0.6, spread: 2.5, gravity: -6 });
        this.state = 'grounded';
        this.attackCd = 1.6 * def.phases[this.phaseIdx].cooldownMul;
      }
    } else {
      // grounded: đi bộ áp sát + đòn cận chiến (dùng telegraph như boss thường)
      const ground = game.world.groundAt(this.pos.x, this.pos.z);
      this.pos.y += (ground - this.pos.y) * Math.min(1, dt * 8);
      this.flap(dt, 0.15);
      if (d > 4.5) {
        const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z;
        const l = Math.hypot(dx, dz) || 1;
        this.pos.x += (dx / l) * this.stats.speed * 0.55 * speedMul * dt;
        this.pos.z += (dz / l) * this.stats.speed * 0.55 * speedMul * dt;
        this.faceToward(player.pos.x, player.pos.z, dt, 6);
      } else {
        this.faceToward(player.pos.x, player.pos.z, dt, 8);
        if (this.attackCd <= 0 && this.decideT <= 0) {
          const move = Math.random() < 0.5 ? 'd_slam' : 'd_dive';
          this.castMove(move, game);
          this.decideT = 2.0 * def.phases[this.phaseIdx].cooldownMul;
          this.attackCd = 1.2;
        }
      }
      // sau một lúc trên đất → bay lại (pha 3 hay bay hơn)
      if (!this._groundT) this._groundT = 0;
      this._groundT += dt;
      if (this._groundT > 6 && this.phaseIdx !== 1) { this.state = 'hover'; this._groundT = 0; }
      if (this._groundT > 9) { this.state = 'hover'; this._groundT = 0; }
    }

    // đuôi + cổ lắc lư
    if (this.rig.joints.tail) this.rig.joints.tail.rotation.y = Math.sin(this.animT2(dt) * 2.2) * 0.25;
    this.syncRig();
  }

  _t2 = 0;
  animT2(dt) { this._t2 += dt; return this._t2; }

  flap(dt, k) {
    const f = Math.sin(this._t2 * 9) * 0.7 * k;
    this.rig.joints.wings[0].rotation.z = f;
    this.rig.joints.wings[1].rotation.z = -f;
  }

  castMove(moveName, game) {
    const atk = DRAGON_ATTACKS[moveName] || BOSS_ATTACKS[moveName] || NPC_ATTACKS[moveName];
    if (!atk) return;
    if (atk.telegraph) game.vfx.telegraph(this.pos, 3, atk.telegraph, 0xff5a2a);
    game.audio.sfx(atk.projectileFan ? 'fire' : 'roar');
    // bắn qua hệ projectile có sẵn (resolveStrike xử lý projectileFan khi có combat.attack)
    // với rồng, bắn trực tiếp cho gọn:
    if (atk.projectileFan) {
      const fan = atk.projectileFan;
      const baseYaw = this.yaw;
      for (let i = 0; i < fan.count; i++) {
        const spread = fan.count > 1 ? (i / (fan.count - 1) - 0.5) * fan.spread : 0;
        const a = baseYaw + spread;
        game.spawnProjectile({
          owner: this,
          pos: { x: this.pos.x, y: this.pos.y + 0.5, z: this.pos.z },
          vel: { x: Math.sin(a) * fan.speed, y: fan.fire ? 0.15 : 0, z: Math.cos(a) * fan.speed },
          dmg: this.effAttack() * atk.dmgMul, gravity: fan.fire ? -1 : -4, fire: !!fan.fire, life: 3.2,
        });
      }
    } else if (atk.aoe) {
      game.vfx.telegraph(this.pos, atk.range, 0.75, 0xff5a2a);
      setTimeoutGame(game, 0.75, () => {
        if (this.combat.dead) return;
        for (const t of game.combat.candidatesFor(this)) {
          const dd = Math.hypot(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
          if (dd <= atk.range && t.faction !== this.faction) {
            t.takeDamage(this.effAttack() * atk.dmgMul, { from: this, knockback: atk.knockback, poiseDamage: 30 });
          }
        }
        game.audio.sfx('thud');
        game.cameraRig.shake(0.35);
      });
    }
  }

  syncRig() {
    this.rig.group.position.copy(this.pos);
    this.rig.group.rotation.y = this.yaw;
    this.rig.group.rotation.z = this.state === 'hover' ? Math.sin(this._t2 * 1.3) * 0.05 : 0;
  }
}

// setTimeout tôn trọng game time (đơn giản: chạy qua mảng pending của game)
function setTimeoutGame(game, delay, fn) {
  game.delayed = game.delayed || [];
  game.delayed.push({ t: delay, fn });
}
