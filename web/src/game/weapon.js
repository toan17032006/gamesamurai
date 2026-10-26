// Vũ khí + bao — chỉ dùng engine: AssetFactory dựng kiếm/bảo kiếm,
// SocketBinder gắn vào xương của buildCharacter.
// Quy tắc bao (từ fde8324, giữ nguyên):
//  - Katana: bao ở hông (socket hips). Nodachi quá dài (1.9m) -> đeo chéo lưng.
//  - Saya KHÔNG bị xoay lại mỗi frame — chỉ đặt quaternion một lần lúc dựng.
import * as THREE from 'three';
import { AssetFactory, EngineSocketBinder } from '../assets/engine-lib.js';

export const SAYA_DIR = new THREE.Vector3(0, -0.30, -0.95).normalize();

export function makeKatana(len = 1.1) {
  return AssetFactory.create({
    name: 'katana',
    parts: [
      { name: 'blade', shape: 'box', size: [0.05, len, 0.012], position: [0, len / 2, 0], color: 0xd8dee6, metalness: 0.9, roughness: 0.25 },
      { name: 'guard', shape: 'box', size: [0.12, 0.03, 0.12], position: [0, 0, 0], color: 0xc9a227, metalness: 0.8 },
      { name: 'grip', shape: 'box', size: [0.04, 0.28, 0.04], position: [0, -0.14, 0], color: 0x1a1a1a },
    ],
  }).root;
}

export function makeSaya(len = 1.1) {
  // Gốc ở miệng bao, thân dọc +Y; hướng bao từ quaternion +Y -> SAYA_DIR.
  const saya = AssetFactory.create({
    name: 'saya',
    parts: [
      { name: 'body', shape: 'box', size: [0.07, len, 0.05], position: [0, len / 2, 0], color: 0x111111, roughness: 0.6 },
      { name: 'mouth', shape: 'box', size: [0.09, 0.06, 0.07], position: [0, 0.02, 0], color: 0x8a6b2f, metalness: 0.6 },
      { name: 'tip', shape: 'box', size: [0.06, 0.08, 0.04], position: [0, len + 0.02, 0], color: 0x8a6b2f },
    ],
  }).root;
  saya.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), SAYA_DIR);
  return saya;
}

export class WeaponRig {
  constructor(root, style = 'katana') {
    this.style = style;
    this.binder = new EngineSocketBinder();
    this.hand = this.binder.bind(root, { socket: 'hand_r', assetId: 'weapon' });
    this.hips = this.binder.bind(root, { socket: 'hips', assetId: 'saya' });
    this.back = this.binder.bind(root, { socket: 'spine', assetId: 'back' });
    this.weapon = makeKatana(style === 'nodachi' ? 1.9 : 1.1);
    this.saya = style === 'katana' ? makeSaya(1.1) : null;
    if (this.saya && this.hips) this.binder.attachAsset(this.hips, this.saya);
  }

  // drawn=true: kiếm ở tay phải. drawn=false: katana vào bao hông,
  // nodachi đeo chéo lưng. Bao luôn ở hông kể cả khi kiếm đã rút.
  placeWeapon(drawn) {
    if (!this.weapon) return;
    this.weapon.removeFromParent();
    if (drawn) {
      if (this.hand) this.binder.attachAsset(this.hand, this.weapon);
      this.weapon.position.set(0, 0, 0);
      this.weapon.rotation.set(0, 0, 0);
    } else if (this.style === 'nodachi') {
      if (this.back) this.binder.attachAsset(this.back, this.weapon);
      this.weapon.position.set(0.02, 0.1, 0);
      this.weapon.rotation.set(0, 0, 0.6);
    } else {
      if (this.hips) this.binder.attachAsset(this.hips, this.weapon);
      this.weapon.position.set(0, 0, 0);
      if (this.saya) this.weapon.quaternion.copy(this.saya.quaternion);
      else this.weapon.rotation.set(0, 0, 0);
    }
    if (this.saya) this.saya.visible = true;
  }
}
