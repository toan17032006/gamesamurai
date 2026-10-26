// Người chơi: dựng thân engine + kiếm/bảo kiếm + tra/rút kiếm + nhịp chém.
// Di chuyển/vật lý/lăn ở locomotion.js, hướng di chuyển ở movement.js,
// hoạt ảnh ở animation.js. Không chứa combat, camera hay HUD.
import * as THREE from 'three';
import { buildCharacter } from '../assets/engine-lib.js';
import { WeaponSheath } from './sheath.js';
import { WeaponRig } from './weapon.js';
import { posePlayer } from './animation.js';
import { Locomotion } from './locomotion.js';
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

    this.locomotion = new Locomotion(new THREE.Vector3(CONFIG.spawn.x, 0, CONFIG.spawn.z));
    this.attackApplied = true;
    this.hp = CONFIG.playerHp;
    this.maxHp = CONFIG.playerHp;
    this.attackTimer = 0;
    this.attackCd = 0;
    this.coins = 0;
    this.kills = 0;
  }

  get drawn() { return !this.sheath.sheathed; }
  get pos() { return this.locomotion.pos; }
  get dodgeTimer() { return this.locomotion.dodgeTimer; }
  get walkPhase() { return this.locomotion.walkPhase; }
  placeWeapon() { this.rig.placeWeapon(this.drawn); }

  // Trả về true đúng 1 lần mỗi nhát chém, trong khung gây sát thương.
  update(dt, input, groundY, camYaw = CONFIG.camera.yaw) {
    const sprint = input.isActionPressed('sprint');
    const { moving, dir } = this.locomotion.stepHorizontal(dt, input.getMovementVector(), camYaw, sprint);
    if (dir) this.root.rotation.y = Math.atan2(dir.x, dir.z);
    const grounded = this.locomotion.stepVertical(dt, groundY, input.isActionJustPressed('jump'));
    this.locomotion.stepDodge(dt, input.isActionJustPressed('dodge'), this.root.rotation.y);

    const attacking = input.isActionJustPressed('attack');
    if (attacking && this.attackCd <= 0) {
      this.sheath.draw();
      this.attackTimer = CONFIG.attackTime;
      this.attackCd = CONFIG.attackCooldown;
      this.attackApplied = false;
    }
    this.attackCd = Math.max(0, this.attackCd - dt);
    if (this.attackTimer > 0) this.attackTimer -= dt;
    const blocking = input.isActionPressed('block');
    const aiming = input.isActionPressed('aim');
    if (input.isActionJustPressed('sheath')) this.sheath.toggle();
    const changed = this.sheath.update({
      moving, running: moving && sprint, grounded: grounded && this.locomotion.velY === 0,
      attacking, blocking, aiming, dt,
    });
    // Toggle thủ công đổi trạng thái trước khi update() chạy nên phải đặt lại vũ khí trực tiếp.
    if (changed || input.isActionJustPressed('sheath')) this.placeWeapon();

    posePlayer(this.built, { moving, walkPhase: this.locomotion.walkPhase, attackTimer: this.attackTimer });
    this.root.position.copy(this.locomotion.pos);
    const hitFrame = !this.attackApplied && this.attackTimer > 0 && this.attackTimer < CONFIG.attackHitWindow;
    if (hitFrame) this.attackApplied = true;
    return hitFrame;
  }
}
