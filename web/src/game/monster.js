// Quái: chỉ dùng buildMonster của engine + AI đuổi/đánh đơn giản.
// Không chứa combat của người chơi hay hiệu ứng.
import * as THREE from 'three';
import { buildMonster } from '../assets/engine-lib.js';
import { CONFIG } from './config.js';

export class Monster {
  constructor(scene, x, z, groundY, opts = {}) {
    this.built = buildMonster({ seed: opts.seed ?? 3, posture: opts.posture ?? 'biped', height: opts.height ?? CONFIG.monsterHeight });
    this.root = this.built.root;
    this.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(this.root);
    this.pos = new THREE.Vector3(x, groundY, z);
    this.hp = CONFIG.monsterHp;
    this.maxHp = CONFIG.monsterHp;
    this.attackCd = 0;
    this.dead = false;
    this.deadTimer = 0;
  }

  // Trả về true nếu quái vừa đánh trúng người chơi trong frame này.
  update(dt, playerPos, groundY) {
    if (this.dead) { this.deadTimer += dt; return null; }
    this.attackCd = Math.max(0, this.attackCd - dt);
    const d = new THREE.Vector3().subVectors(playerPos, this.pos);
    d.y = 0;
    const dist = d.length();
    if (dist > 0.1) this.root.rotation.y = Math.atan2(d.x, d.z);
    let hitPlayer = false;
    if (dist < CONFIG.monsterAggroRange && dist > CONFIG.monsterAttackRange) {
      d.normalize();
      this.pos.addScaledVector(d, CONFIG.monsterSpeed * dt);
    } else if (dist <= CONFIG.monsterAttackRange && this.attackCd <= 0) {
      this.attackCd = CONFIG.monsterAttackCooldown;
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
