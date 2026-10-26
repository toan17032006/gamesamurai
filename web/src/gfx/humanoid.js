// Humanoid rig — 100% ENGINE RENDER (bước 3).
// Toàn bộ mesh nhân vật/bot giờ do engine buildCharacter() dựng (bone hierarchy
// hips/spine/head/arm_r/forearm_r/hand_r/thigh_r/shin_r/foot_r), không còn rig
// tự vẽ bằng box/sphere/cylinder thủ công nữa. File này chỉ là ADAPTER giữ
// nguyên API rig cũ của game (joints/body/weaponAnchor/trailBase/trailTip/
// mats/extra/saya/hairSway/setWeapon/setArmor/setHelmet/setVisible/dispose)
// để Animator, Character, Npc, Boss, Combat, Trail chạy lại không đổi code.
//
// CĂN CHỈNH TỌA ĐỘ (đã đo từ engine character-factory, height = H):
//   hips.y = H*0.52, spine.y = +H*0.12, neck = +H*0.26, head = +H*0.06
//   vai: x = ±H*0.22, y = +H*0.22 (từ spine); tay: arm -H*0.18, forearm -H*0.16
//   chân: thigh x = ±H*0.09, y = -H*0.04; shin -H*0.22; foot -H*0.20, z = +H*0.04
//   chân chạm đất đúng khi hips.y = H*0.52 (Box3.min.y = 0 sau khi engine
//   tự trừ box.min.y) — vì vậy Animator phải dùng rig.hipsBaseY thay vì
//   hằng 0.98 cũ (xem gfx/animator.js: hipsBaseY = H*0.52).
//   Vũ khí: weaponAnchor gắn vào hand_r, vị trí (0,-0.06,0.02), xoay cầm
//   theo từng style như rig cũ; saya gắn vào hips (-0.16,0.02,-0.04).
import * as THREE from 'three';
import {
  createSamuraiCharacter, enginePrimitives, createEngineAsset,
  engineFindBone,
} from '../assets/engineAssets.js';
import { GAME_TO_ENGINE_BONES } from '../assets/engineAnimation.js';

// Vật liệu lấy trực tiếp từ mesh engine (không tự tạo material mới cho thân):
// skinMat = material của head mesh, armorMat = torso/armor mesh, accentMat =
// helmet/pauldron mesh. Các slot còn lại trỏ về cùng 3 material engine này.
function collectEngineMats(root, colors) {
  const mats = { skin: null, armor: null, accent: null };
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const c = o.material.color ? o.material.color.getHex() : 0;
    if (!mats.skin && o.parent && o.parent.name === 'head') mats.skin = o.material;
    if (!mats.armor && (o.parent && (o.parent.name === 'spine' || o.parent.name === 'hips'))) mats.armor = o.material;
    if (!mats.accent && o.parent && o.parent.name === 'head' && c === colors.accent) mats.accent = o.material;
  });
  const seen = [];
  root.traverse((o) => { if (o.isMesh && o.material && !seen.includes(o.material)) seen.push(o.material); });
  mats.skin = mats.skin || seen[0];
  mats.armor = mats.armor || seen[1] || seen[0];
  mats.accent = mats.accent || seen[2] || seen[0];
  return mats;
}

export function charMaterials(colors, ghost) {
  const asset = createEngineAsset('charMats', [
    { shape: 'box', size: [0.1, 0.1, 0.1], position: [0, 0, 0], rotation: [0, 0, 0], color: colors.cloth, roughness: 0.9 },
  ]);
  let cloth = null;
  asset.traverse((o) => { if (o.isMesh) cloth = o.material; });
  return {
    cloth, accent: cloth, skin: cloth, hair: cloth, plate: cloth, lacquer: cloth,
    dispose() { /* material thuộc engine asset, dispose cùng rig */ },
  };
}

const ARCHETYPE_BY_CLASS = { warrior: 'warrior', knight: 'knight', mage: 'mage', rogue: 'rogue', cultist: 'cultist', boss: 'boss' };

export function buildHumanoid(opts = {}) {
  const colors = { cloth: 0x3a4a5a, skin: 0xc9a284, hair: 0x14100c, accent: 0x8a2a2a, plate: 0x4a4f58, ...opts.colors };
  const scale = opts.scale || 1;
  const height = 1.72 * scale;
  const archetype = ARCHETYPE_BY_CLASS[opts.archetype] || (opts.isBoss ? 'boss' : 'warrior');
  let seed = 1;
  const nameStr = String(opts.name || archetype);
  for (let i = 0; i < nameStr.length; i++) seed = (seed * 31 + nameStr.charCodeAt(i)) >>> 0;
  const built = createSamuraiCharacter(archetype, seed % 100000 + 1, {
    height,
    skinColor: colors.skin, armorColor: colors.plate ?? colors.cloth, accentColor: colors.accent,
    helmet: false,
    cape: false,
    shoulderPlates: true,
  });
  const engineRoot = built.root;
  const bones = {};
  for (const b of built.boneHierarchy) bones[b.name] = b.node;

  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  body.add(engineRoot);
  engineRoot.position.set(0, 0, 0);

  const joints = {
    hips: bones.hips, torso: bones.spine, head: bones.head,
    armR_sh: bones.arm_r, armR_el: bones.forearm_r, armR_hand: bones.hand_r,
    armL_sh: bones.arm_l, armL_el: bones.forearm_l, armL_hand: bones.hand_l,
    legR_hip: bones.thigh_r, legR_knee: bones.shin_r, legR_foot: bones.foot_r,
    legL_hip: bones.thigh_l, legL_knee: bones.shin_l, legL_foot: bones.foot_l,
  };

  const eng = collectEngineMats(engineRoot, colors);
  if (opts.ghost) {
    for (const m of [eng.skin, eng.armor, eng.accent]) { if (m) { m.transparent = true; m.opacity = 0.55; } }
  }
  const mats = {
    cloth: eng.armor, accent: eng.accent, skin: eng.skin, hair: eng.accent,
    plate: eng.armor, lacquer: eng.accent,
    dispose() { for (const m of new Set([eng.skin, eng.armor, eng.accent])) m && m.dispose(); },
  };

  const hairSway = new THREE.Group();
  hairSway.position.set(0, 0.1, -0.03);
  if (joints.head) {
    joints.head.add(hairSway);
    const hairMesh = new THREE.Mesh(enginePrimitives.cubeBox(height * 0.16, height * 0.16, height * 0.06), eng.accent);
    hairMesh.position.set(0, 0.02, -0.06);
    hairSway.add(hairMesh);
  }
  const saya = new THREE.Group();
  saya.position.set(-0.16, 0.02, -0.04);
  saya.rotation.set(1.5, 0, -0.35);
  if (joints.hips) joints.hips.add(saya);

  const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
  const blob = new THREE.Mesh(enginePrimitives.cubeBox(1.5, 0.02, 1.5), blobMat);
  blob.position.y = 0.035;
  blob.renderOrder = 1;
  group.add(blob);

  const weaponAnchor = new THREE.Group();
  weaponAnchor.position.set(0, -0.06, 0.02);
  weaponAnchor.rotation.set(0.65, 0, 0);
  if (joints.armR_hand) joints.armR_hand.add(weaponAnchor);
  const trailBase = new THREE.Group(), trailTip = new THREE.Group();
  weaponAnchor.add(trailBase, trailTip);

  let weaponGroup = null, helmetGroup = null;
  const dummyPart = () => ({ visible: false });
  const extra = {
    chestPlate: dummyPart(), sash: dummyPart(), pauldronL: dummyPart(), pauldronR: dummyPart(),
    fur: dummyPart(), thighL: dummyPart(), thighR: dummyPart(), mats,
  };

  function engineWeaponMesh(style, len, color) {
    if (style === 'katana' || style === 'nodachi') {
      const wide = style === 'nodachi' ? 1.5 : 1.0;
      return createEngineAsset('weapon_' + style, [
        { shape: 'box', size: [0.032 * wide, 0.24, 0.026 * wide], position: [0, -0.11, 0], rotation: [0, 0, 0], color: 0x241c14, roughness: 0.9 },
        { shape: 'box', size: [0.1 * wide, 0.02, 0.1 * wide], position: [0, 0.015, 0], rotation: [0, 0, 0], color: 0x3a3a44, metalness: 0.85, roughness: 0.3 },
        { shape: 'box', size: [0.026 * wide, len, 0.011 * wide], position: [0, 0.03 + len / 2, 0], rotation: [0, 0, 0], color, metalness: 0.95, roughness: 0.18 },
        { shape: 'cone', size: [0.016 * wide, 0.12, 0.016 * wide], position: [0, 0.05 + len + 0.02, 0], rotation: [0, 0, 0], color, metalness: 0.95, roughness: 0.18 },
      ]);
    }
    if (style === 'club') {
      return createEngineAsset('weapon_club', [
        { shape: 'cylinder', size: [0.075, len, 0.075], position: [0, 0.12 + len / 2, 0], rotation: [0, 0, 0], color: 0x5a4632, roughness: 0.95 },
        { shape: 'sphere', size: [0.08, 0.08, 0.08], position: [0, 0.12 + len, 0], rotation: [0, 0, 0], color: 0x3a3230, roughness: 0.9 },
      ]);
    }
    if (style === 'spear') {
      return createEngineAsset('weapon_spear', [
        { shape: 'cylinder', size: [0.024, len, 0.024], position: [0, len / 2 - 0.2, 0], rotation: [0, 0, 0], color: 0x6a5238, roughness: 0.85 },
        { shape: 'cone', size: [0.05, 0.26, 0.05], position: [0, len - 0.08, 0], rotation: [0, 0, 0], color, metalness: 0.9, roughness: 0.2 },
      ]);
    }
    if (style === 'bow') {
      return createEngineAsset('weapon_bow', [
        { shape: 'torus', size: [0.42, 0.018, 0.42], position: [0, 0.15, 0], rotation: [0, 90, 0], color: 0x5a4632, roughness: 0.6 },
        { shape: 'cylinder', size: [0.005, 0.82, 0.005], position: [0, 0.15, 0], rotation: [0, 0, 0], color: 0xd8d4c8 },
      ]);
    }
    if (style === 'claw') {
      return createEngineAsset('weapon_claw', [
        { shape: 'cone', size: [0.02, 0.24, 0.02], position: [-0.05, 0.1, 0], rotation: [0, 0, 0], color, metalness: 0.9, roughness: 0.2 },
        { shape: 'cone', size: [0.02, 0.24, 0.02], position: [0, 0.1, 0], rotation: [0, 0, 0], color, metalness: 0.9, roughness: 0.2 },
        { shape: 'cone', size: [0.02, 0.24, 0.02], position: [0.05, 0.1, 0], rotation: [0, 0, 0], color, metalness: 0.9, roughness: 0.2 },
      ]);
    }
    return createEngineAsset('weapon_default', [
      { shape: 'box', size: [0.03, len, 0.02], position: [0, len / 2, 0], rotation: [0, 0, 0], color, metalness: 0.9, roughness: 0.2 },
    ]);
  }

  function setWeapon(model) {
    if (weaponGroup) weaponAnchor.remove(weaponGroup);
    weaponGroup = new THREE.Group();
    trailBase.position.set(0, 0, 0);
    trailTip.position.set(0, 0, 0);
    saya.children.length = 0;
    if (!model) { weaponAnchor.add(weaponGroup); return; }
    weaponGroup.userData.style = model.style;
    const grip = {
      katana: [1.15, 0, 0.05], nodachi: [1.2, 0, 0.05], club: [1.15, 0, 0],
      spear: [1.5, 0, 0], bow: [0, 0, 0.1], claw: [1.3, 0, 0],
    }[model.style] || [1.25, 0, 0];
    weaponAnchor.rotation.set(grip[0], grip[1], grip[2]);
    const len = model.len || 1.1;
    const wg = engineWeaponMesh(model.style, len, model.color || 0xd8dee8);
    weaponGroup.add(wg);
    if (model.style === 'katana' || model.style === 'nodachi') {
      const wide = model.style === 'nodachi' ? 1.5 : 1.0;
      trailBase.position.set(0, 0.03 + len * 0.42, 0);
      trailTip.position.set(0, 0.05 + len, 0);
      const sayaMesh = new THREE.Mesh(enginePrimitives.cubeBox(0.034 * wide, len + 0.1, 0.02 * wide), eng.accent);
      sayaMesh.position.set(0, (len + 0.1) / 2 - 0.15, 0);
      saya.add(sayaMesh);
    } else if (model.style === 'club') { trailBase.position.set(0, 0.1, 0); trailTip.position.set(0, 0.12 + len, 0); }
    else if (model.style === 'spear') { trailBase.position.set(0, len * 0.4, 0); trailTip.position.set(0, len, 0); }
    weaponGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    weaponAnchor.add(weaponGroup);
  }

  function setArmor(armor) {
    if (!armor || !armor.model) { if (eng.armor) eng.armor.color.setHex(colors.plate ?? colors.cloth); return; }
    if (eng.armor && armor.model.tint) eng.armor.color.setHex(armor.model.tint);
    const parts = armor.model.parts || [];
    const cape = engineFindBone(engineRoot, 'cape');
    if (cape) cape.visible = parts.includes('fur');
  }

  function setHelmet(helmet) {
    if (helmetGroup && joints.head) { joints.head.remove(helmetGroup); helmetGroup = null; }
    if (!helmet || !helmet.model || !joints.head) return;
    helmetGroup = new THREE.Group();
    const style = helmet.model.style;
    let hg = null;
    if (style === 'straw') {
      hg = createEngineAsset('helmet_straw', [
        { shape: 'cylinder', size: [0.36, 0.05, 0.36], position: [0, 0.21, 0], rotation: [0, 0, 0], color: 0xb8a878, roughness: 1 },
        { shape: 'sphere', size: [0.17, 0.085, 0.17], position: [0, 0.22, 0], rotation: [0, 0, 0], color: 0xb8a878, roughness: 1 },
      ]);
    } else if (style === 'mask') {
      hg = createEngineAsset('helmet_mask', [
        { shape: 'box', size: [0.2, 0.13, 0.05], position: [0, 0.045, 0.095], rotation: [0, 0, 0], color: 0x5a5f6a, metalness: 0.85, roughness: 0.3 },
      ]);
    } else if (style === 'kabuto') {
      hg = createEngineAsset('helmet_kabuto', [
        { shape: 'sphere', size: [0.145, 0.123, 0.145], position: [0, 0.19, 0], rotation: [0, 0, 0], color: 0x5a5f6a, metalness: 0.85, roughness: 0.3 },
        { shape: 'cylinder', size: [0.24, 0.05, 0.24], position: [0, 0.15, 0], rotation: [0, 0, 0], color: 0x5a5f6a, metalness: 0.85, roughness: 0.3 },
        { shape: 'box', size: [0.02, 0.16, 0.1], position: [0, 0.32, 0.03], rotation: [0, 0, 0], color: 0xb8912e, metalness: 0.95, roughness: 0.22 },
      ]);
    }
    if (hg) { helmetGroup.add(hg); helmetGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; }); joints.head.add(helmetGroup); }
  }

  setWeapon(opts.weapon || null);
  setArmor(opts.armor || null);
  if (opts.helmet) setHelmet(opts.helmet);
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  blob.castShadow = false;

  return {
    group, body, joints, weaponAnchor, trailBase, trailTip, mats, extra, saya, hairSway,
    engineBoneMap: null, GAME_TO_ENGINE_BONES,
    hipsBaseY: height * 0.52,
    sayaBase: [1.5, 0, -0.35],
    hasWeapon() { return (weaponGroup && weaponGroup.userData.style) || null; },
    height,
    setWeapon, setArmor, setHelmet,
    setVisible(v) { group.visible = v; },
    dispose() { mats.dispose(); blobMat.dispose(); },
  };
}
