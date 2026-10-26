// Người chơi: di chuyển theo camera, nhảy bằng trọng lực engine,
// tra/rút kiếm theo sheath.js. Không chứa combat, camera hay HUD nữa.
import * as THREE from 'three';
import { buildCharacter } from '../assets/engine-lib.js';
import { WeaponSheath } from './sheath.js';
import { WeaponRig } from './weapon.js';
import { posePlayer } from './animation.js';
import { CONFIG } from './config.js';

export class Player {
  constructor(scene, opts = {}) {
    this.weaponStyle = opts.weaponStyle || 'katana';
    this.built = buildCharacter({
      archetype: 'warrior', seed: 7, height: CONFIG.playerHeight,
      skinColor: 0xd2a679, armorColor: 0x3a3a4a, accentColor: 0xc0392b,
    });
    this.root = this.built.root;
    this.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(this.root);
    this.rig = new WeaponRig(this.root, this.weaponStyle);
    this.weapon = this.rig.weapon;
    this.saya = this.rig.saya;
    this.sheath = new WeaponSheath();
    this.placeWeapon();

    this.pos = new THREE.Vector3(CONFIG.spawn.x, 0, CONFIG.spawn.z);
    this.velY = 0;
    this.attackApplied = true;
    this.hp = CONFIG.playerHp;
    this.maxHp = CONFIG.playerHp;
    this.attackTimer = 0;
    this.attackCd = 0;
    this.dodgeTimer = 0;
    this.walkPhase = 0;
    this.coins = 0;
    this.kills = 0;
  }

  get drawn() { return !this.sheath.sheathed; }
  placeWeapon() { this.rig.placeWeapon(this.drawn); }

  // Trả về true đúng 1 lần mỗi nhát chém, trong khung gây sát thương.
  update(dt, input, groundY, camYaw = CONFIG.camera.yaw) {
    const fwd = input.getMovementVector();
    const moving = fwd.x !== 0 || fwd.y !== 0;
    const sprint = input.isActionPressed('sprint');
    const speed = sprint ? CONFIG.sprintSpeed : CONFIG.walkSpeed;
    if (moving) {
      // Di chuyển theo hướng camera: forward=(sin yaw, cos yaw), right=(cos yaw, -sin yaw).
      const dir = new THREE.Vector3(
        Math.sin(camYaw) * fwd.y + Math.cos(camYaw) * fwd.x,
        0,
        Math.cos(camYaw) * fwd.y - Math.sin(camYaw) * fwd.x,
      ).normalize();
      this.root.rotation.y = Math.atan2(dir.x, dir.z);
      this.pos.addScaledVector(dir, speed * dt);
      this.walkPhase += dt * (sprint ? CONFIG.sprintCycleRate : CONFIG.walkCycleRate);
    }
    // Nhảy: trọng lực qua GravityEngine của engine (g=18, terminal -50).
    const grounded = this.pos.y <= groundY + 0.001;
    if (grounded) {
      this.pos.y = groundY;
      if (input.isActionJustPressed('jump')) this.velY = CONFIG.jumpVelocity;
      else this.velY = 0;
    } else {
      this.velY = Math.max(this.velY - CONFIG.gravity * dt, -CONFIG.terminalVelocity);
      this.pos.y += this.velY * dt;
      if (this.pos.y < groundY) { this.pos.y = groundY; this.velY = 0; }
    }
    const attacking = input.isActionJustPressed('attack');
    if (attacking && this.attackCd <= 0) {
      this.sheath.draw();
      this.attackTimer = CONFIG.attackTime;
      this.attackCd = CONFIG.attackCooldown;
      this.attackApplied = false;
    }
    this.attackCd = Math.max(0, this.attackCd - dt);
    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (input.isActionJustPressed('dodge') && this.dodgeTimer <= 0) this.dodgeTimer = CONFIG.dodgeTime;
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      const dir = new THREE.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
      this.pos.addScaledVector(dir, CONFIG.dodgeSpeed * dt);
    }
    const blocking = input.isActionPressed('block');
    const aiming = input.isActionPressed('aim');
    if (input.isActionJustPressed('sheath')) this.sheath.toggle();
    const changed = this.sheath.update({
      moving, running: moving && sprint, grounded: grounded && this.velY === 0,
      attacking, blocking, aiming, dt,
    });
    // Toggle thủ công đổi trạng thái trước khi update() chạy nên phải đặt lại vũ khí trực tiếp.
    if (changed || input.isActionJustPressed('sheath')) this.placeWeapon();

    posePlayer(this.built, { moving, walkPhase: this.walkPhase, attackTimer: this.attackTimer });
    this.root.position.copy(this.pos);
    const hitFrame = !this.attackApplied && this.attackTimer > 0 && this.attackTimer < CONFIG.attackHitWindow;
    if (hitFrame) this.attackApplied = true;
    return hitFrame;
  }
}
