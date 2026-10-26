// Player controller: camera-relative movement, LMB combos, aim, 4 characters, skills, dodge.
import { Character } from './character.js';
import { PARTY, characterAppearance } from '../data/characters.js';
import { clamp } from '../core/utils.js';

const CLIP_DUR = { light1: 0.55, light2: 0.5, light3: 0.62, heavy1: 0.85, heavy2: 0.9, bow: 0.68 };

export class Player extends Character {
  constructor(game, cfg) {
    super(game, { ...cfg, ...characterAppearance(PARTY[0]), isPlayer: true, faction: 'player' });
    this.character = PARTY[0];
    this.characterIndex = 0;
    this.state = 'move';          // move | dodge | attack | skill | interact | dead
    this.moveMode = 'idle';       // idle | walk | run | sprint
    this.comboIdx = 0;
    this.comboKind = null;
    this.buffered = null;
    this.dodgeCount = 0;
    this.dodgeCd = 0;
    this.stepT = 0;
    this.skillCd = {};
    this.lockOn = false;
    this.lockTarget = null;
    this.exhausted = false;
    this.interactTarget = null;
    this.aimMode = false;
    this.meditating = false;
    this._meditateT = 0;
    this._switchFx = 0;
  }

  // ---- attacks -----------------------------------------------------------
  attackDef(kind, idx) {
    const w = this.game.inventory.equippedStats().weapon;
    const asp = this.character;
    if (asp.attack) {
      const a = asp.attack;
      const fan = this.aimMode && a.projectileFan
        ? { ...a.projectileFan, spread: 0, speed: a.projectileFan.speed * 1.15 }
        : a.projectileFan;
      return {
        ...a, id: `p_${asp.id}`, name: a.anim, dur: a.dur / w.speed,
        isSkill: false, range: 0, arc: 0, hitAt: a.hitAt,
        stamina: a.stamina * (1 + this.game.progression.p().staminaCostMul),
        projectileFan: fan, poiseDamage: 10,
      };
    }
    const anims = kind === 'light'
      ? ['light1', 'light2', 'light3']
      : ['heavy1', 'heavy2'];
    const anim = anims[Math.min(idx, anims.length - 1)];
    const clipDur = CLIP_DUR[anim];
    const heavy = kind === 'heavy';
    return {
      id: `p_${kind}${idx}`, name: anim, dmgMul: heavy ? 1.65 : 1.0, dur: clipDur / w.speed,
      hitAt: 0.52, range: w.range + 0.35, arc: heavy ? 1.3 : 1.9, anim,
      stamina: heavy ? 16 : 10, knockback: heavy ? 4 : 2, moveImpulse: heavy ? 3.2 : 2.6,
      isSkill: false, poiseDamage: heavy ? 30 : 14,
    };
  }

  tryAttack(kind) {
    if (this.state === 'attack' || this.state === 'skill') {
      const atk = this.combat.attack;
      if (atk && atk.t / atk.def.dur > 0.6) this.buffered = kind;
      return;
    }
    if (!this.canAct()) return;
    this.meditating = false;
    const cost = (kind === 'heavy' ? 16 : 10) * (1 + this.game.progression.p().staminaCostMul);
    if (this.stamina < 5) { this.exhausted = true; return; }
    if (this.comboKind === kind && this.comboIdx < this.game.inventory.equippedStats().weapon.combo - 1) this.comboIdx++;
    else this.comboIdx = 0;
    this.comboKind = kind;
    this.spendStamina(cost);
    this.state = 'attack';
    this.combat.blocking = false;
    const def = this.attackDef(kind, this.comboIdx);
    if (this.aimMode || def.projectileFan) this.faceCameraOrTarget();
    else if (this.lockTarget && !this.lockTarget.combat.dead) this.faceToward(this.lockTarget.pos.x, this.lockTarget.pos.z, 0.016, 40);
    else if (!this.moving) this.faceDir(this.game.cameraRig.flatForward().x, this.game.cameraRig.flatForward().z, 0.016, 40);
    this.startAttack(def);
    if (this._trail) this._trail.setColor(kind === 'heavy' ? 0xffd8a8 : (this.character.color || 0xbfd8ff));
    this.game.audio.sfx(def.projectileFan ? 'arrow' : def.name.startsWith('heavy') ? 'swingHeavy' : 'swing');
  }

  faceCameraOrTarget() {
    const t = this.lockTarget;
    if (this.aimMode && t && !t.combat.dead && !t.disposed) {
      this.faceToward(t.pos.x, t.pos.z, 0.016, 60);
    } else {
      const f = this.game.cameraRig.flatForward();
      this.faceDir(f.x, f.z, 0.016, 60);
    }
  }

  tryDodge(inputDir) {
    if (!this.canAct() || this.dodgeCd > 0 || this.dodgeCount >= 2 || this.aimMode) return;
    const cost = 22 * (1 + this.game.progression.p().staminaCostMul);
    if (this.stamina < 8) { this.exhausted = true; return; }
    this.spendStamina(cost);
    this.meditating = false;
    this.state = 'dodge';
    this.combat.blocking = false;
    this.anim.play('dodge', { restart: true, blend: 0.02 });
    let dx = inputDir.x, dz = inputDir.z;
    if (dx === 0 && dz === 0) { dx = -Math.sin(this.yaw); dz = -Math.cos(this.yaw); }
    const want = Math.atan2(dx, dz);
    this.yaw = want;
    this.vel.x = Math.sin(want) * 11;
    this.vel.z = Math.cos(want) * 11;
    this.combat.iframes = 0.34 + this.game.progression.p().dodgeIframes;
    this.dodgeCd = 0.45;
    this.dodgeCount++;
    this.dodgeT = 0.5;
    this.game.audio.sfx('dodge');
  }

  // E = nguyên tố, Q = nộ — lấy từ nhân vật đang điều khiển (1-4).
  trySkill(branch) {
    if (this.state === 'attack' || !this.canAct()) return;
    const def = this.character.skills[branch];
    if (!def) return;
    if ((this.skillCd[def.id] || 0) > 0) return;
    if (this.stamina < def.stamina) { this.exhausted = true; this.game.ui.notify('info', 'Không đủ khí lực'); return; }
    this.meditating = false;
    this.spendStamina(def.stamina);
    this.skillCd[def.id] = def.cooldown;
    this.state = 'skill';
    this.combat.blocking = false;
    this.faceCameraOrTarget();
    const atk = { ...def, name: def.name, hitAt: def.hitAt ?? 0.5 };
    this.startAttack(atk, { isSkill: true });
    if (this._trail) this._trail.setColor(def.color || 0xc8a0ff);
    this.game.audio.sfx(def.projectileFan ? (def.projectileFan.fire ? 'fire' : 'arrow') : 'swingHeavy');
    this.game.vfx.popup(this.pos, def.name, this.character.css, true);
    this.game.particles.spawn({ x: this.pos.x, y: this.pos.y + 0.6, z: this.pos.z },
      { count: 22, color: [def.color || 0xffffff, 0xffffff], speed: 4, life: 0.6, gravity: 1, spread: 0.8 });
    if (def.aoe) this.game.cameraRig.shake(0.16);
    if (def.selfBuff) {
      this.addBuff('defensePct', def.selfBuff.defensePct, def.selfBuff.duration);
      if (def.selfBuff.noStagger) this.addBuff('noStagger', 1, def.selfBuff.duration);
    }
    if (def.buff) this.addBuff('nextHitPct', def.buff.nextHitPct, def.buff.duration);
  }

  toggleAim() {
    if (!this.canAct() && !this.aimMode) return;
    this.aimMode = !this.aimMode;
    this.meditating = false;
    this.game.cameraRig.setAim(this.aimMode);
    if (this.aimMode) {
      const t = this.game.combat.findLockTarget(this, null, 0);
      if (t) { this.lockOn = true; this.setLockTarget(t); }
      this.game.ui.notify('info', `${this.character.aimSupported ? 'Ngắm hỗ trợ' : 'Ngắm'} · ${this.lockTarget ? 'đã khoá mục tiêu' : 'bắn theo hướng nhìn'}`);
    } else {
      this.lockOn = false;
      this.setLockTarget(null);
    }
  }

  toggleMeditate() {
    if (!this.canAct() || !this.grounded) return;
    this.meditating = !this.meditating;
    if (this.meditating) {
      this.aimMode = false;
      this.game.cameraRig.setAim(false);
      this.game.ui.notify('good', 'Thiền định — hồi máu và khí lực (di chuyển để dừng)');
    }
  }

  switchCharacter(index) {
    if (index === this.characterIndex) return false;
    if (this.combat.dead || this.combat.attack || this.state === 'dodge') {
      this.game.ui.notify('bad', 'Không thể đổi nhân vật lúc này');
      return false;
    }
    const next = PARTY[index];
    if (!next) return false;
    const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 1;
    this.characterIndex = index;
    this.character = next;
    this.rebuildAppearance(this.game, characterAppearance(next));
    this.game.inventory.applyToRig();
    this.game.progression.applyToPlayer();
    this.hp = Math.max(1, Math.round(this.maxHp * ratio));
    this.stamina = this.maxStamina;
    this.state = 'move';
    this.combat.attack = null;
    this.combat.blocking = false;
    this.meditating = false;
    this.skillCd = {};
    this.comboIdx = 0;
    this.aimMode = false;
    this.game.cameraRig.setAim(false);
    this.setLockTarget(null);
    this.lockOn = false;
    this.anim.play('idle', { restart: true });
    this.game.particles.spawn({ x: this.pos.x, y: this.pos.y + 0.8, z: this.pos.z },
      { count: 36, color: [next.color, 0xffffff], speed: 5, life: 0.8, gravity: 0.6, spread: 0.6 });
    this.game.cameraRig.shake(0.12);
    this.game.audio.sfx('unlock');
    this.game.ui.notify('good', `${next.name} — ${next.title} (${next.element})`);
    this.game.ui.hud.dirty = true;
    this.game.ui.hud.refreshParty?.();
    return true;
  }

  toggleLock() {
    if (this.lockOn) {
      this.lockOn = false; this.lockTarget = null;
      this.game.cameraRig.setLockTarget(null);
      this.game.vfx.setLockMarker(null);
    } else {
      const t = this.game.combat.findLockTarget(this, null, 0);
      if (t) { this.lockOn = true; this.setLockTarget(t); }
      else this.game.ui.notify('info', 'Không có mục tiêu trong tầm khoá');
    }
  }

  setLockTarget(t) {
    this.lockTarget = t;
    this.game.cameraRig.setLockTarget(t);
    this.game.vfx.setLockMarker(t);
  }

  updateLock(dt) {
    if (!this.lockOn && !this.aimMode) return;
    if (!this.lockTarget || this.lockTarget.combat.dead || this.lockTarget.disposed) {
      const next = this.game.combat.findLockTarget(this, null, 0);
      if (next) this.setLockTarget(next);
      else {
        this.lockOn = false;
        this.setLockTarget(null);
        if (this.aimMode) this.game.cameraRig.setLockTarget(null);
      }
    }
  }

  update(dt, game) {
    if (this.combat.dead) {
      super.update(dt, game);
      if (this.combat.deadT > 1.6 && game.state === 'playing') game.onPlayerDeath();
      return;
    }

    const input = game.input;
    const prog = game.progression.p();
    this.dodgeCd = Math.max(0, this.dodgeCd - dt);
    this.dodgeT = Math.max(0, (this.dodgeT || 0) - dt);
    if (this.dodgeT <= 0) this.dodgeCount = 0;
    for (const k in this.skillCd) this.skillCd[k] = Math.max(0, this.skillCd[k] - dt);
    if (this.stamina > this.maxStamina * 0.25) this.exhausted = false;

    // ---- one-shot actions ----
    if (input.wasPressed('interact')) this.tryInteract(game);
    if (input.wasPressed('quickItem')) game.inventory.quickUse();
    if (input.wasPressed('special')) this.toggleMeditate();
    if (input.wasPressed('aim')) this.toggleAim();
    if (input.wasPressed('sheath') && this.sheath) this.sheath.toggle();
    if (input.wasTapped('sprint')) {
      const axis = input.moveAxis();
      const cam = game.cameraRig;
      const f = cam.flatForward(), r = cam.flatRight();
      this.tryDodge({ x: f.x * axis.z + r.x * axis.x, z: f.z * axis.z + r.z * axis.x });
    }
    if (input.wasPressed('attack')) this.tryAttack('light');
    if (input.wasPressed('elemental')) this.trySkill('elemental');
    if (input.wasPressed('ultimate')) this.trySkill('ultimate');
    for (let i = 0; i < 4; i++) if (input.wasPressed(`switch${i + 1}`)) game.switchCharacter(i);

    this.updateLock(dt);

    const axis = input.moveAxis();
    const cam = game.cameraRig;
    const f = cam.flatForward(), r = cam.flatRight();
    const wishX = f.x * axis.z + r.x * axis.x;
    const wishZ = f.z * axis.z + r.z * axis.x;
    this.moving = axis.len > 0;

    // ---- thiền định: đứng yên hồi phục, mọi hành động sẽ phá thiền ----
    if (this.meditating) {
      if (this.moving || input.wasPressed('attack') || input.wasPressed('elemental') ||
          input.wasPressed('ultimate') || input.wasPressed('jump') || input.wasPressed('block')) {
        this.meditating = false;
      } else {
        this.vel.x *= Math.max(0, 1 - dt * 8);
        this.vel.z *= Math.max(0, 1 - dt * 8);
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.025 * dt);
        this.stamina = Math.min(this.maxStamina, this.stamina + 22 * dt);
        this._meditateT += dt;
        if (this._meditateT > 0.45) {
          this._meditateT = 0;
          game.particles.spawn({ x: this.pos.x + (Math.random() - 0.5) * 0.6, y: this.pos.y + 0.2, z: this.pos.z + (Math.random() - 0.5) * 0.6 },
            { count: 2, color: [0x7ae0ff, 0xd8f0ff], speed: 0.5, life: 1.1, gravity: 1.2, spread: 0.2 });
        }
        if (this.anim.name !== 'idle') this.anim.play('idle', { blend: 0.2 });
        this.moveMode = 'idle';
        super.update(dt, game);
        return;
      }
    }

    // ---- state machine ----
    if (this.state === 'dodge') {
      if (this.anim.name !== 'dodge' || this.anim.timeNorm >= 1) this.state = 'move';
    } else if (this.state === 'attack' || this.state === 'skill') {
      const atk = this.combat.attack;
      if (!atk) {
        this.state = 'move';
        if (this.buffered) { const b = this.buffered; this.buffered = null; this.tryAttack(b); }
      } else {
        this.moveGrounded(dt, game, wishX * 0.22, wishZ * 0.22, 2);
      }
    } else if (this.combat.staggered > 0) {
      this.state = 'move';
      this.moveGrounded(dt, game, 0, 0, 0);
    } else {
      const walking = input.isDown('walk');
      const sprint = input.isDown('sprint') && this.moving && !this.exhausted && !this.combat.blocking && !walking && !this.aimMode;
      let speed = this.combat.blocking ? 2.2 : this.aimMode ? 2.7 : walking ? 2.4 : sprint ? 7.2 : this.moving ? 5.0 : 0;
      if (sprint) {
        this.spendStamina(7 * dt * (1 + prog.staminaCostMul));
        if (this.stamina <= 0) this.exhausted = true;
      }
      const speedMul = (this.character.mods?.speed || 1) * (1 + prog.moveSpeed);
      this.moveGrounded(dt, game, wishX, wishZ, speed * speedMul);

      if (this.aimMode) {
        this.faceCameraOrTarget();
      } else if (this.lockOn && this.lockTarget) {
        this.faceToward(this.lockTarget.pos.x, this.lockTarget.pos.z, dt, 10);
      } else if (this.moving) {
        this.faceDir(wishX, wishZ, dt, 13);
      }

      if (input.isDown('block') && !this.combat.attack && !this.aimMode) {
        if (!this.combat.blocking) {
          this.combat.blocking = true;
          this.combat.blockPressT = 0;
          this.anim.play('block', { blend: 0.08 });
        }
      } else if (this.combat.blocking) {
        this.combat.blocking = false;
      }

      if (input.wasPressed('jump') && this.grounded && this.canAct()) {
        this.vel.y = 6.8;
        this.grounded = false;
        this.anim.play('jump', { restart: true });
      }

      if (!this.combat.attack && this.grounded) {
        if (this.combat.blocking) { /* block clip holds */ }
        else if (this.aimMode) { this.moveMode = 'walk'; if (this.anim.name !== 'walk') this.anim.play('walk'); }
        else if (walking && this.moving) { this.moveMode = 'walk'; if (this.anim.name !== 'walk') this.anim.play('walk'); }
        else if (sprint) { if (this.anim.name !== 'sprint') this.anim.play('sprint'); this.moveMode = 'sprint'; }
        else if (this.moving) { if (this.anim.name !== 'run' && this.anim.name !== 'walk') this.anim.play('run'); this.moveMode = 'run'; }
        else if (this.anim.name !== 'idle' && !this.anim.current.clip.loop) {
          if (this.anim.timeNorm >= 1) this.anim.play('idle');
        }
        else if (this.anim.name !== 'idle') this.anim.play('idle');
        if (!this.moving && this.anim.name === 'run') this.anim.play('idle');
        if (!this.moving && this.anim.name === 'sprint') this.anim.play('idle');
      }

      if (this.moving && this.grounded) {
        this.stepT -= dt * (sprint ? 2.6 : walking ? 1.0 : 1.6);
        if (this.stepT <= 0) {
          this.stepT = 0.4;
          game.audio.sfx(this.inWater ? 'splash' : 'step');
          if (this.inWater) {
            const wl = game.world.waterLevelAt ? game.world.waterLevelAt(this.pos.x, this.pos.z) : this.pos.y;
            game.particles.spawn({ x: this.pos.x, y: (Number.isFinite(wl) ? wl : this.pos.y) + 0.06, z: this.pos.z },
              { count: 3, color: [0xbfd8e8, 0xffffff], speed: 1.4, life: 0.4, gravity: -3, spread: 0.4 });
          } else {
            const dust = game.world.def ? game.world.def.palette.dirt : 0x9a8a6a;
            game.particles.spawn({ x: this.pos.x, y: this.pos.y + 0.08, z: this.pos.z },
              { count: sprint ? 5 : 2, color: [dust, 0xbcae94], speed: 1.3, life: 0.45, gravity: -1.5, spread: 0.35 });
          }
        }
      }
      this.moveMode = sprint ? 'sprint' : this.moving ? (walking || this.aimMode ? 'walk' : 'run') : 'idle';
    }

    super.update(dt, game);
  }

  tryInteract(game) {
    const t = game.world.nearestInteractable(this.pos, 2.6);
    if (t) game.world.useInteractable(t, this);
  }

  respawn(shrine) {
    const game = this.game;
    const [x, z] = shrine || game.world.spawnPoint;
    this.respawnAt(x, z, game);
    this.state = 'move';
    this.combat.iframes = 2;
    this.meditating = false;
    this.aimMode = false;
    game.cameraRig.setAim(false);
  }

  serializeCharacter() {
    return { characterId: this.character.id, index: this.characterIndex };
  }

  applyCharacter(data) {
    if (!data) return;
    const idx = PARTY.findIndex((c) => c.id === data.characterId);
    const i = idx >= 0 ? idx : clamp(Number(data.index) || 0, 0, PARTY.length - 1);
    if (i === this.characterIndex && idx < 0) return;
    this.characterIndex = i;
    this.character = PARTY[i];
    this.rebuildAppearance(this.game, characterAppearance(this.character));
    this.game.inventory.applyToRig();
    this.game.progression.applyToPlayer();
  }
}
