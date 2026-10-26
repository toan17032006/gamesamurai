// Vật phẩm — viết lại từ đầu, chỉ dùng AssetFactory của engine.
import * as THREE from 'three';
import { AssetFactory } from '../assets/engine-lib.js';

export class Pickup {
  constructor(scene, x, z, groundY, kind = 'coin') {
    this.kind = kind; // 'coin' | 'heal'
    this.taken = false;
    const color = kind === 'heal' ? 0x2ecc71 : 0xf1c40f;
    const shape = kind === 'heal' ? 'sphere' : 'torus';
    this.root = AssetFactory.create({
      name: `pickup_${kind}`,
      parts: [{ name: 'body', shape, size: [0.4, 0.4, 0.15], color, metalness: 0.6, roughness: 0.3 }],
    }).root;
    this.baseY = groundY + 0.6;
    this.root.position.set(x, this.baseY, z);
    this.phase = Math.random() * Math.PI * 2;
    scene.add(this.root);
  }

  update(dt, playerPos) {
    if (this.taken) return null;
    this.phase += dt * 2;
    this.root.position.y = this.baseY + Math.sin(this.phase) * 0.15;
    this.root.rotation.y += dt * 2;
    const d = new THREE.Vector3().subVectors(playerPos, this.root.position);
    d.y = 0;
    if (d.length() < 1.2) {
      this.taken = true;
      this.root.visible = false;
      return this.kind;
    }
    return null;
  }
}
