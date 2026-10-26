// Nhân vật + quái — viết lại từ đầu, chỉ dùng engine:
// buildCharacter / buildMonster dựng thân, SocketBinder gắn vũ khí vào
// xương, AssetFactory dựng kiếm/bow/bảo kiếm. Không còn rig tự chế nào.
// Quy tắc bao (giữ từ bản cũ, đã sửa ở fde8324):
//  - Katana: bao ở hông (socket hips). Nodachi quá dài (1.9m) -> đeo chéo lưng.
//  - Saya KHÔNG bị sway làm lệch: không có code nào xoay lại saya mỗi frame.
import * as THREE from 'three';
import { buildCharacter, buildMonster, AssetFactory, EngineSocketBinder } from '../assets/engine-lib.js';
import { WeaponSheath } from './sheath.js';

function boneOf(built, name) {
  const b = built.boneHierarchy?.find((e) => e.name === name);
  return b ? b.node : null;
}

function makeKatana(len = 1.1) {
  return AssetFactory.create({
    name: 'katana',
    parts: [
      { name: 'blade', shape: 'box', size: [0.05, len, 0.012], position: [0, len / 2, 0], color: 0xd8dee6, metalness: 0.9, roughness: 0.25 },
      { name: 'guard', shape: 'box', size: [0.12, 0.03, 0.12], position: [0, 0, 0], color: 0xc9a227, metalness: 0.8 },
      { name: 'grip', shape: 'box', size: [0.04, 0.28, 0.04], position: [0, -0.14, 0], color: 0x1a1a1a },
    ],
  }).root;
}

function makeSaya(len = 1.1) {
  // Gốc ở miệng bao, thân dọc +Y; hướng bao được đặt bằng quaternion
  // từ +Y sang (0,-0.30,-0.95) — mặt phẳng dọc thân, không xòe ngang.
  const saya = AssetFactory.create({
    name: 'saya',
    parts: [
      { name: 'body', shape: 'box', size: [0.07, len, 0.05], position: [0, len / 2, 0], color: 0x111111, roughness: 0.6 },
      { name: 'mouth', shape: 'box', size: [0.09, 0.06, 0.07], position: [0, 0.02, 0], color: 0x8a6b2f, metalness: 0.6 },
      { name: 'tip', shape: 'box', size: [0.06, 0.08, 0.04], position: [0, len + 0.02, 0], color: 0x8a6b2f },
    ],
  }).root;
  saya.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -0.30, -0.95).normalize());
  return saya;
}

export class Player {
  constructor(scene, opts = {}) {
    this.weaponStyle = opts.weaponStyle || 'katana'; // 'katana' | 'nodachi'
    this.built = buildCharacter({ archetype: 'warrior', seed: 7, height: 1.8, skinColor: 0xd2a679, armorColor: 0x3a3a4a, accentColor: 0xc0392b });
    this.root = this.built.root;
    this.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(this.root);

    this.binder = new EngineSocketBinder();
    const bind = (socket, assetId) => this.binder.bind(this.root, { socket, assetId });
    this.hand = bind('hand_r', 'weapon');
    this.hips = bind('hips', 'saya');
    this.back = bind('spine', 'back');

    this.weapon = makeKatana(this.weaponStyle === 'nodachi' ? 1.9 : 1.1);
    this.saya = this.weaponStyle === 'katana' ? makeSaya(1.1) : null;
    if (this.saya && this.hips) this.binder.attachAsset(this.hips, this.saya);
    this.sheath = new WeaponSheath();
    this.placeWeapon();

    this.pos = new THREE.Vector3(0, 0, 8);
    this.velY = 0;
    this.attackApplied = true;
    this.hp = 100; this.maxHp = 100;
    this.attackTimer = 0; this.attackCd = 0; this.dodgeTimer = 0;
    this.walkPhase = 0;
    this.coins = 0; this.kills = 0;
  }

  get drawn() { return !this.sheath.sheathed; }

  placeWeapon() {
    if (!this.weapon) return;
    this.weapon.removeFromParent();
    if (this.drawn) {
      if (this.hand) this.binder.attachAsset(this.hand, this.weapon);
      else this.root.add(this.weapon);
      this.weapon.position.set(0, 0, 0); this.weapon.rotation.set(0, 0, 0);
    } else if (this.weaponStyle === 'nodachi') {
      if (this.back) this.binder.attachAsset(this.back, this.weapon);
      this.weapon.position.set(0.02, 0.1, 0); this.weapon.rotation.set(0, 0, 0.6);
    } else {
      // Katana: nằm trong bao — cùng gốc, cùng quaternion với saya.
      if (this.hips) this.binder.attachAsset(this.hips, this.weapon);
      this.weapon.position.set(0, 0, 0);
      if (this.saya) this.weapon.quaternion.copy(this.saya.quaternion);
      else this.weapon.rotation.set(0, 0, 0);
    }
  }

  // Trả về true đúng 1 lần mỗi nhát chém, trong khung gây sát thương.
  update(dt, input, groundY, camYaw = Math.PI) {
    const fwd = input.getMovementVector();
    const moving = fwd.x !== 0 || fwd.y !== 0;
    const sprint = input.isActionPressed('sprint');
    const speed = sprint ? 7.5 : 4.5;
    if (moving) {
      // Di chuyển theo hướng camera: forward=(sin yaw, cos yaw), right=(cos yaw, -sin yaw).
      const dir = new THREE.Vector3(
        Math.sin(camYaw) * fwd.y + Math.cos(camYaw) * fwd.x,
        0,
        Math.cos(camYaw) * fwd.y - Math.sin(camYaw) * fwd.x,
      ).normalize();
      this.root.rotation.y = Math.atan2(dir.x, dir.z);
      this.pos.addScaledVector(dir, speed * dt);
      this.walkPhase += dt * (sprint ? 11 : 8);
    }
    // Nhảy: trọng lực qua GravityEngine của engine (g=18, terminal -50).
    const grounded = this.pos.y <= groundY + 0.001;
    if (grounded) {
      this.pos.y = groundY;
      if (input.isActionJustPressed('jump')) this.velY = 7.5;
      else this.velY = 0;
    } else {
      this.velY = Math.max(this.velY - 18 * dt, -50);
      this.pos.y += this.velY * dt;
      if (this.pos.y < groundY) { this.pos.y = groundY; this.velY = 0; }
    }
    const attacking = input.isActionJustPressed('attack');
    if (attacking && this.attackCd <= 0) {
      this.sheath.draw();
      this.attackTimer = 0.32; this.attackCd = 0.45; this.attackApplied = false;
    }
    this.attackCd = Math.max(0, this.attackCd - dt);
    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (input.isActionJustPressed('dodge') && this.dodgeTimer <= 0) this.dodgeTimer = 0.35;
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      const dir = new THREE.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
      this.pos.addScaledVector(dir, 8 * dt);
    }
    const blocking = input.isActionPressed('block');
    const aiming = input.isActionPressed('aim');
    if (input.isActionJustPressed('sheath')) this.sheath.toggle();
    const changed = this.sheath.update({ moving, running: moving && sprint, grounded: grounded && this.velY === 0, attacking, blocking, aiming, dt });
    // Toggle thủ công đổi trạng thái trước khi update() chạy nên phải đặt lại vũ khí trực tiếp.
    if (changed || input.isActionJustPressed('sheath')) this.placeWeapon();
    // Saya luôn nằm ở hông (kể cả khi kiếm đã rút — bao rỗng vẫn ở đó).
    if (this.saya) this.saya.visible = true;

    // Hoạt ảnh thủ tục đơn giản trên xương của engine (đi / chém).
    const armR = boneOf(this.built, 'arm_r'), armL = boneOf(this.built, 'arm_l');
    const legR = boneOf(this.built, 'thigh_r'), legL = boneOf(this.built, 'thigh_l');
    const swing = moving ? Math.sin(this.walkPhase) * 0.55 : 0;
    if (legR) legR.rotation.x = swing;
    if (legL) legL.rotation.x = -swing;
    if (armR) armR.rotation.x = this.attackTimer > 0 ? -1.6 + (0.32 - this.attackTimer) * 6 : -swing * 0.7;
    if (armL) armL.rotation.x = swing * 0.7;

    this.root.position.copy(this.pos);
    const hitFrame = !this.attackApplied && this.attackTimer > 0 && this.attackTimer < 0.22;
    if (hitFrame) this.attackApplied = true;
    return hitFrame;
  }
}

export class Monster {
  constructor(scene, x, z, groundY, opts = {}) {
    this.built = buildMonster({ seed: opts.seed ?? 3, posture: opts.posture ?? 'biped', height: opts.height ?? 1.7 });
    this.root = this.built.root;
    this.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(this.root);
    this.pos = new THREE.Vector3(x, groundY, z);
    this.hp = 60; this.maxHp = 60;
    this.attackCd = 0; this.dead = false; this.deadTimer = 0;
  }

  update(dt, playerPos, groundY) {
    if (this.dead) { this.deadTimer += dt; return null; }
    this.attackCd = Math.max(0, this.attackCd - dt);
    const d = new THREE.Vector3().subVectors(playerPos, this.pos);
    d.y = 0;
    const dist = d.length();
    if (dist > 0.1) this.root.rotation.y = Math.atan2(d.x, d.z);
    let hitPlayer = false;
    if (dist < 14 && dist > 1.6) {
      d.normalize();
      this.pos.addScaledVector(d, 3.2 * dt);
    } else if (dist <= 1.6 && this.attackCd <= 0) {
      this.attackCd = 1.0;
      hitPlayer = true;
    }
    this.pos.y = groundY;
    this.root.position.copy(this.pos);
    return hitPlayer;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) { this.dead = true; this.deadTimer = 0; }
    return this.dead;
  }
}
