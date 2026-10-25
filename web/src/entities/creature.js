// Creature: sinh vật hoang dã (chim/cá/tứ thú) — rig procedural riêng, FSM đơn giản,
// tích hợp pipeline chiến đấu (takeDamage/loot/xp) và AI LOD theo khoảng cách.
import * as THREE from 'three';
import { Entity } from './entity.js';
import { WILDLIFE } from '../data/wildlife.js';
import { G, M } from '../gfx/materials.js';
import { clamp, angleWrap, mulberry32 } from '../core/utils.js';

// ---- rig builders ----------------------------------------------------------
function buildQuadRig(def) {
  const g = new THREE.Group();
  const c = def.colors;
  const bodyMat = M(c.body, { rough: 0.85 });
  const bellyMat = M(c.belly, { rough: 0.9 });
  const darkMat = M(c.dark, { rough: 0.9 });
  const s = def.scale;
  const bl = 1.15 * s, bh = 0.52 * s;          // body length/height
  const body = new THREE.Mesh(G('sph', 0.5, 9, 7), bodyMat);
  body.scale.set(0.62 * s, bh, bl * 0.55);
  body.position.y = 0.62 * s;
  body.castShadow = true;
  g.add(body);
  const belly = new THREE.Mesh(G('sph', 0.42, 8, 6), bellyMat);
  belly.scale.set(0.5 * s, 0.3 * s, bl * 0.5);
  belly.position.set(0, 0.44 * s, 0.05 * s);
  g.add(belly);
  // neck + head
  const head = new THREE.Group();
  head.position.set(0, 0.85 * s, bl * 0.52);
  const skull = new THREE.Mesh(G('sph', 0.26 * s, 8, 6), bodyMat);
  skull.scale.set(0.85, 0.8, 1.25);
  skull.castShadow = true;
  head.add(skull);
  const snout = new THREE.Mesh(G('box', 0.16 * s, 0.14 * s, 0.3 * s), darkMat);
  snout.position.set(0, -0.04 * s, 0.3 * s);
  head.add(snout);
  for (const ear of [-1, 1]) {
    const e = new THREE.Mesh(G('cone', 0.07 * s, 0.2 * s, 5), bodyMat);
    e.position.set(ear * 0.13 * s, 0.24 * s, -0.02 * s);
    e.rotation.z = -ear * 0.25;
    head.add(e);
  }
  if (def.horns) {
    for (const horn of [-1, 1]) {
      const h = new THREE.Mesh(G('cyl', 0.02 * s, 0.05 * s, 0.34 * s, 5), darkMat);
      h.position.set(horn * 0.12 * s, 0.28 * s, 0.05 * s);
      h.rotation.set(-0.7, 0, -horn * 0.5);
      head.add(h);
    }
  }
  if (def.tusks) {
    for (const t of [-1, 1]) {
      const tk = new THREE.Mesh(G('cone', 0.025 * s, 0.14 * s, 5), M(0xd8ccae, { rough: 0.5 }));
      tk.position.set(t * 0.1 * s, -0.06 * s, 0.36 * s);
      tk.rotation.x = 0.9;
      head.add(tk);
    }
  }
  g.add(head);
  // 4 legs (pivot trên khớp để xoay vẫy)
  const legs = [];
  const legGeo = G('cyl', 0.055 * s, 0.075 * s, 0.52 * s, 6);
  for (const [lx, lz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const pivot = new THREE.Group();
    pivot.position.set(lx * 0.2 * s, 0.5 * s, lz * bl * 0.32);
    const leg = new THREE.Mesh(legGeo, darkMat);
    leg.position.y = -0.26 * s;
    leg.castShadow = true;
    pivot.add(leg);
    g.add(pivot);
    legs.push(pivot);
  }
  // tail
  const tail = new THREE.Mesh(G('cone', 0.06 * s, 0.42 * s, 5), darkMat);
  tail.position.set(0, 0.72 * s, -bl * 0.55);
  tail.rotation.x = -1.9;
  g.add(tail);
  return { group: g, joints: { legs, head, tail }, mats: { body: bodyMat } };
}

function buildBirdRig(def) {
  const g = new THREE.Group();
  const c = def.colors;
  const bodyMat = M(c.body, { rough: 0.8 });
  const body = new THREE.Mesh(G('sph', 0.16, 7, 6), bodyMat);
  body.scale.set(0.8, 0.75, 1.5);
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(G('sph', 0.09, 6, 5), bodyMat);
  head.position.set(0, 0.1, 0.2);
  g.add(head);
  const beak = new THREE.Mesh(G('cone', 0.03, 0.1, 5), M(0xd8a030, { rough: 0.5 }));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.09, 0.32);
  g.add(beak);
  const tail = new THREE.Mesh(G('box', 0.09, 0.02, 0.18), bodyMat);
  tail.position.set(0, 0.02, -0.24);
  g.add(tail);
  const wingGeo = G('plane', 0.5, 0.2);
  const wings = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.1, 0.06, 0);
    const wing = new THREE.Mesh(wingGeo, M(c.wing, { rough: 0.85, extra: { side: THREE.DoubleSide } }));
    wing.position.x = side * 0.25;
    wing.rotation.y = side * 0.12;
    pivot.add(wing);
    g.add(pivot);
    wings.push(pivot);
  }
  return { group: g, joints: { wings }, mats: { body: bodyMat } };
}

function buildFishRig(def) {
  const g = new THREE.Group();
  const c = def.colors;
  const bodyMat = M(c.body, { rough: 0.35, metal: 0.25 });
  const body = new THREE.Mesh(G('sph', 0.2, 8, 6), bodyMat);
  body.scale.set(0.55, 0.8, 1.7);
  g.add(body);
  const belly = new THREE.Mesh(G('sph', 0.16, 7, 5), M(c.belly, { rough: 0.4 }));
  belly.scale.set(0.5, 0.6, 1.5);
  belly.position.y = -0.05;
  g.add(belly);
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0, -0.32);
  const tail = new THREE.Mesh(G('cone', 0.14, 0.24, 4), M(c.fin, { rough: 0.5, extra: { side: THREE.DoubleSide } }));
  tail.rotation.x = -Math.PI / 2;
  tail.position.z = -0.1;
  tailPivot.add(tail);
  g.add(tailPivot);
  const fin = new THREE.Mesh(G('cone', 0.06, 0.14, 4), M(c.fin, { rough: 0.5 }));
  fin.position.set(0, 0.14, 0);
  fin.rotation.x = -0.4;
  g.add(fin);
  return { group: g, joints: { tail: tailPivot }, mats: { body: bodyMat } };
}

const RIG_BUILDERS = { quad: buildQuadRig, bird: buildBirdRig, fish: buildFishRig };

// ---- Creature ---------------------------------------------------------------
export class Creature extends Entity {
  constructor(game, { kind, x, z, levelScale = 1, seed = 1 }) {
    const def = WILDLIFE[kind];
    super(x, game.world ? game.world.groundAt(x, z) : 0, z);
    this.game = game;
    this.kind = kind;
    // def dùng chung pipeline kill (xp/coins/loot của combat.onNpcKilled)
    this.def = { ...def, loot: def.drops || [] };
    this.enemyId = def.id;
    this.name = def.name;
    this.faction = 'wild';
    this.levelScale = levelScale;
    this.isBoss = false;
    this.scale = def.scale;
    this.stats = { maxHp: Math.round(def.hp * levelScale), attack: def.attack || 0, defense: def.defense, speed: def.speed, poise: def.poise };
    this.hp = this.stats.maxHp;
    this.maxHp = this.stats.maxHp;
    this.radius = 0.32 * def.scale + (def.kind === 'quad' ? 0.25 : 0);
    this.combat = { dead: false, iframes: 0, attack: null, blocking: false };
    this.disposed = false;
    this.yaw = Math.random() * Math.PI * 2;

    const rig = RIG_BUILDERS[def.kind](def);
    this.rig = rig;
    game.engine.scene.add(rig.group);
    rig.group.scale.setScalar(1);

    // trạng thái hành vi
    this.home = { x, z };
    this.state = def.kind === 'bird' ? 'fly' : def.kind === 'fish' ? 'swim' : 'wander';
    this.stateT = Math.random() * 2;
    this.wanderGoal = null;
    this.aggro = false;
    this.attackCd = 0;
    this.lungeT = 0;
    this.animT = Math.random() * 10;
    this.speedNow = 0;
    this.flyAlt = def.flyAlt ? def.flyAlt[0] + Math.random() * (def.flyAlt[1] - def.flyAlt[0]) : 0;
    this.flyAngle = Math.random() * Math.PI * 2;
    this.perchT = 0;
    this.rng = mulberry32((seed + x * 31 + z * 17) | 0);
    this.fadeT = 0;
  }

  distTo(p) { return Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z); }
  effAttack() { return this.stats.attack; }
  effDefense() { return this.stats.defense; }

  // mô phỏng đơn giản hóa khi ở xa (AI LOD)
  get farFromPlayer() {
    const p = this.game.player;
    return !p || this.distTo(p) > 90;
  }

  update(dt, game) {
    if (this.disposed) return;
    const def = this.def;
    this.animT += dt;
    this.stateT -= dt;
    this.attackCd -= dt;
    const player = game.player;

    if (this.combat.dead) {
      this.fadeT += dt;
      if (this.fadeT > 4) { game.removeCreature(this); return; }
      if (this.fadeT > 2.6) {
        const o = Math.max(0, 1 - (this.fadeT - 2.6) / 1.4);
        this.rig.mats.body.transparent = true;
        this.rig.mats.body.opacity = o;
      }
      this.rig.group.position.copy(this.pos);
      return;
    }

    // LOD: xa → đứng yên, không tốn AI/animation
    if (this.farFromPlayer) {
      this.rig.group.position.copy(this.pos);
      this.rig.group.rotation.y = this.yaw;
      return;
    }

    if (def.kind === 'bird') this.updateBird(dt, game, player);
    else if (def.kind === 'fish') this.updateFish(dt, game, player);
    else this.updateQuad(dt, game, player);

    // vật lý: bám đất (trừ cá/chim đang bay)
    if (def.kind !== 'fish' && !(def.kind === 'bird')) {
      const ground = game.world.groundAt(this.pos.x, this.pos.z);
      this.pos.y += (ground - this.pos.y) * Math.min(1, dt * 10);
      // không đi vào nước sâu
      const wl = game.world.waterLevelAt ? game.world.waterLevelAt(this.pos.x, this.pos.z) : -Infinity;
      if (Number.isFinite(wl) && wl > this.pos.y && wl - game.world.groundAt(this.pos.x, this.pos.z) > 0.5) {
        // lùi về home nếu dính nước sâu
        const dx = this.home.x - this.pos.x, dz = this.home.z - this.pos.z;
        const l = Math.hypot(dx, dz) || 1;
        this.pos.x += (dx / l) * def.speed * dt;
        this.pos.z += (dz / l) * def.speed * dt;
      }
      game.world.collideCircle && game.world.collideCircle(this.pos, this.radius);
    }
    this.rig.group.position.copy(this.pos);
    this.rig.group.rotation.y = this.yaw;
  }

  // ---- chim: bay vòng, đậu, sợ người --------------------------------------
  updateBird(dt, game, player) {
    const dist = player ? this.distTo(player) : 99;
    if (this.state === 'perch') {
      this.wings(0);
      if (dist < this.def.flee * 0.8 || this.stateT <= 0) { this.state = 'fly'; this.pos.y += 0.5; }
      return;
    }
    // fly: vòng quanh home
    if (dist < this.def.flee && this.state !== 'flee') { this.state = 'flee'; this.flyAlt += 3; }
    if (this.state === 'flee' && dist > this.def.flee * 2.2) { this.state = 'fly'; this.flyAlt = this.def.flyAlt[0] + this.rng() * 3; }
    this.flyAngle += dt * (this.state === 'flee' ? 1.4 : 0.35);
    const r = this.state === 'flee' ? 26 : 12 + this.rng() * 6;
    const tx = this.home.x + Math.cos(this.flyAngle) * r;
    const tz = this.home.z + Math.sin(this.flyAngle) * r;
    const ty = game.world.groundAt(tx, tz) + this.flyAlt;
    const dx = tx - this.pos.x, dz = tz - this.pos.z, dy = ty - this.pos.y;
    const l = Math.hypot(dx, dy, dz) || 1;
    const sp = this.def.speed * (this.state === 'flee' ? 1.2 : 0.7);
    this.pos.x += (dx / l) * sp * dt;
    this.pos.y += (dy / l) * sp * dt;
    this.pos.z += (dz / l) * sp * dt;
    this.yaw = Math.atan2(dx, dz);
    this.speedNow = sp;
    this.wings(dt, 1);
    // thi thoảng tìm chỗ đậu
    if (this.state === 'fly' && this.stateT <= 0 && this.rng() < 0.25) {
      this.state = 'perch';
      this.stateT = 3 + this.rng() * 6;
      const a = this.rng() * Math.PI * 2;
      this.pos.x = this.home.x + Math.cos(a) * 8;
      this.pos.z = this.home.z + Math.sin(a) * 8;
      this.pos.y = game.world.groundAt(this.pos.x, this.pos.z) + 0.25;
    }
  }

  wings(dt, flying) {
    const J = this.rig.joints;
    if (!J.wings) return;
    if (flying) {
      const f = Math.sin(this.animT * 16) * 0.75;
      J.wings[0].rotation.z = f;
      J.wings[1].rotation.z = -f;
    } else {
      J.wings[0].rotation.z += (0.12 - J.wings[0].rotation.z) * 0.2;
      J.wings[1].rotation.z += (-0.12 - J.wings[1].rotation.z) * 0.2;
    }
  }

  // ---- cá: bơi trong vùng nước, né người -----------------------------------
  updateFish(dt, game, player) {
    const wl = game.world.waterLevelAt ? game.world.waterLevelAt(this.pos.x, this.pos.z) : -Infinity;
    const inWater = Number.isFinite(wl) && wl > game.world.groundAt(this.pos.x, this.pos.z) + 0.15;
    if (!inWater) {
      // trôi về home (nước)
      const dx = this.home.x - this.pos.x, dz = this.home.z - this.pos.z;
      this.faceDir(dx, dz, dt, 6);
      this.pos.x += Math.sin(this.yaw) * this.def.speed * dt;
      this.pos.z += Math.cos(this.yaw) * this.def.speed * dt;
      this.pos.y = Math.min(wl - 0.25, game.world.groundAt(this.pos.x, this.pos.z) + 0.2);
      this.tail(dt, 1);
      return;
    }
    const dist = player ? this.distTo(player) : 99;
    let tx, tz, sp = this.def.speed * 0.5;
    if (dist < this.def.flee) {
      // né: bơi ngược hướng người
      const dx = this.pos.x - player.pos.x, dz = this.pos.z - player.pos.z;
      const l = Math.hypot(dx, dz) || 1;
      tx = this.pos.x + (dx / l) * 6; tz = this.pos.z + (dz / l) * 6;
      sp = this.def.speed;
    } else {
      if (!this.wanderGoal || this.stateT <= 0) {
        this.stateT = 2 + this.rng() * 3;
        const a = this.rng() * Math.PI * 2, r = 2 + this.rng() * 6;
        this.wanderGoal = { x: this.home.x + Math.cos(a) * r, z: this.home.z + Math.sin(a) * r };
      }
      tx = this.wanderGoal.x; tz = this.wanderGoal.z;
    }
    const dx = tx - this.pos.x, dz = tz - this.pos.z;
    const l = Math.hypot(dx, dz) || 1;
    this.pos.x += (dx / l) * sp * dt;
    this.pos.z += (dz / l) * sp * dt;
    this.pos.y = wl - 0.28 - Math.sin(this.animT * 2) * 0.08;
    this.yaw = Math.atan2(dx, dz);
    this.tail(dt, sp / this.def.speed);
  }

  tail(dt, k) {
    const J = this.rig.joints;
    if (J.tail) J.tail.rotation.y = Math.sin(this.animT * 7) * 0.5 * k;
  }

  // ---- tứ thú: lang thang/gặm ở/flee/săn ------------------------------------
  updateQuad(dt, game, player) {
    const def = this.def;
    const dist = player ? this.distTo(player) : 99;
    let wishX = 0, wishZ = 0, sp = 0;

    if (def.aggroRange && player && !player.combat.dead && dist < (this.aggro ? 26 : def.aggroRange)) {
      this.aggro = true;
    }
    if (this.aggro && player && (player.combat.dead || dist > 30)) this.aggro = false;

    if (def.flee > 0 && dist < def.flee) {
      // bỏ chạy
      const dx = this.pos.x - player.pos.x, dz = this.pos.z - player.pos.z;
      const l = Math.hypot(dx, dz) || 1;
      wishX = dx / l; wishZ = dz / l;
      sp = def.speed;
      this.state = 'flee';
    } else if (this.aggro) {
      // lùng/săn
      if (dist > 1.35) {
        const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z;
        const l = Math.hypot(dx, dz) || 1;
        wishX = dx / l; wishZ = dz / l;
        sp = def.speed;
        this.state = 'chase';
      } else {
        // cắn (direct damage, không cần clip)
        this.faceToward(player.pos.x, player.pos.z, dt, 10);
        if (this.attackCd <= 0) {
          this.attackCd = 1.25;
          this.lungeT = 0.28;
          setTimeoutSafe(this, 0.22, () => {
            if (!this.combat.dead && !player.combat.dead && this.distTo(player) < 2.0) {
              player.takeDamage(this.effAttack() * (0.85 + Math.random() * 0.3),
                { from: this, knockback: 2.4, poiseDamage: 10 });
            }
          });
          game.audio.sfx('thud');
        }
        this.state = 'attack';
      }
    } else if (def.retreatAt && this.hp / this.maxHp < def.retreatAt) {
      this.aggro = false;
      const dx = this.pos.x - (player ? player.pos.x : 0), dz = this.pos.z - (player ? player.pos.z : 0);
      const l = Math.hypot(dx, dz) || 1;
      wishX = dx / l; wishZ = dz / l;
      sp = def.speed * 0.9;
    } else {
      // wander + graze
      if (this.state === 'attack') this.state = 'wander';
      if (!this.wanderGoal || this.stateT <= 0) {
        this.stateT = 2.5 + this.rng() * 3.5;
        if (def.graze && this.rng() < 0.35) { this.state = 'graze'; }
        else {
          this.state = 'wander';
          const a = this.rng() * Math.PI * 2, r = 3 + this.rng() * 8;
          this.wanderGoal = { x: this.home.x + Math.cos(a) * r, z: this.home.z + Math.sin(a) * r };
        }
      }
      if (this.state === 'graze') {
        sp = 0;
        if (this.stateT <= 0) this.state = 'wander';
      } else {
        const dx = this.wanderGoal.x - this.pos.x, dz = this.wanderGoal.z - this.pos.z;
        const l = Math.hypot(dx, dz);
        if (l > 0.6) { wishX = dx / l; wishZ = dz / l; sp = def.speed * 0.35; }
      }
    }

    // lunge animation (pitch thân khi cắn)
    if (this.lungeT > 0) {
      this.lungeT -= dt;
      this.rig.group.rotation.x = -0.35 * Math.sin((1 - this.lungeT / 0.28) * Math.PI);
    } else this.rig.group.rotation.x = 0;

    if (sp > 0) {
      this.pos.x += wishX * sp * dt;
      this.pos.z += wishZ * sp * dt;
      this.faceDir(wishX, wishZ, dt, 8);
    }
    this.speedNow = sp;
    this.animateLegs(dt, sp / def.speed);
  }

  animateLegs(dt, k) {
    const J = this.rig.joints;
    if (!J.legs) return;
    const phase = this.animT * 9 * Math.max(k, 0.15);
    const amp = 0.55 * Math.min(1, k * 2.2);
    // chéo nhau: FL+BR cùng pha
    J.legs[0].rotation.x = Math.sin(phase) * amp;
    J.legs[1].rotation.x = Math.sin(phase + Math.PI) * amp;
    J.legs[2].rotation.x = Math.sin(phase + Math.PI) * amp;
    J.legs[3].rotation.x = Math.sin(phase) * amp;
    if (J.head) J.head.rotation.x = Math.sin(phase * 0.5) * 0.06 * k;
    if (J.tail) J.tail.rotation.y = Math.sin(this.animT * 3) * 0.25;
  }

  faceToward(x, z, dt, rate = 12) {
    const want = Math.atan2(x - this.pos.x, z - this.pos.z);
    this.yaw += angleWrap(want - this.yaw) * (1 - Math.exp(-rate * dt));
  }
  faceDir(dx, dz, dt, rate = 14) {
    if (dx === 0 && dz === 0) return;
    this.faceToward(this.pos.x + dx, this.pos.z + dz, dt, rate);
  }

  // ---- combat integration ---------------------------------------------------
  takeDamage(amount, opts = {}) {
    if (this.combat.dead) return { result: 'dead' };
    if (this.combat.iframes > 0 && !opts.pure) return { result: 'iframes' };
    const dmg = Math.max(1, Math.round(amount * (100 / (100 + this.effDefense())) * (opts.crit ? 1.6 : 1)));
    this.hp -= dmg;
    this.game.vfx.popup(this.pos, String(dmg), opts.crit ? '#ffd257' : '#ffffff', opts.crit);
    this.game.particles.spawn({ x: this.pos.x, y: this.pos.y + 0.6, z: this.pos.z },
      { count: 8, color: [0xff5a4a, 0xc03a2a, 0xffffff], speed: 4, life: 0.3, spread: 0.4 });
    if (opts.from && opts.knockback) {
      const dx = this.pos.x - opts.from.pos.x, dz = this.pos.z - opts.from.pos.z;
      const l = Math.hypot(dx, dz) || 1;
      this.pos.x += (dx / l) * opts.knockback * 0.12;
      this.pos.z += (dz / l) * opts.knockback * 0.12;
    }
    if (this.hp <= 0) { this.die(); return { result: 'killed', dmg }; }
    // phản ứng: prey bỏ chạy, thú săn nổi điên
    if (this.def.aggroRange && opts.from) { this.aggro = true; }
    else if (this.state !== 'flee') { this.state = 'flee'; this.stateT = 3; }
    return { result: 'hit', dmg };
  }

  die() {
    if (this.combat.dead) return;
    this.combat.dead = true;
    this.hp = 0;
    this.fadeT = 0;
    this.game.combat.onNpcKilled(this);
    this.game.particles.spawn({ x: this.pos.x, y: this.pos.y + 0.5, z: this.pos.z },
      { count: 14, color: [0x8a2a2a, 0xc05a4a], speed: 3, life: 0.5, gravity: -3, spread: 0.5 });
  }

  dispose(game) {
    if (this.disposed) return;
    this.disposed = true;
    game.engine.scene.remove(this.rig.group);
  }
}

// hẹn giờ ngắn cho đòn cắn (không dùng setTimeout thật để tôn trọng pause)
function setTimeoutSafe(self, delay, fn) {
  self._pending = self._pending || [];
  self._pending.push({ t: delay, fn });
}
// gọi trong updateQuad sau khi tính dt: (được nhúng qua update chính)
Object.defineProperty(Creature.prototype, '_tickPending', {
  value: function (dt) {
    if (!this._pending) return;
    for (let i = this._pending.length - 1; i >= 0; i--) {
      this._pending[i].t -= dt;
      if (this._pending[i].t <= 0) { const f = this._pending[i].fn; this._pending.splice(i, 1); f(); }
    }
  },
});
const _origUpdateQuad = Creature.prototype.updateQuad;
Creature.prototype.updateQuad = function (dt, game, player) {
  this._tickPending(dt);
  _origUpdateQuad.call(this, dt, game, player);
};
