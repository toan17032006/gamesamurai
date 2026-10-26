// Props — PHIÊN BẢN ENGINE: toàn bộ prop đều tạo bằng engine @aetheria/engine.
// Trước đây là code procedural tự viết trong file này; nay mọi prop đều qua
// AssetFactory.create (engineAssets.engineProp) hoặc PrimitiveFactory.displace,
// giữ nguyên tên hàm + chữ ký để game logic (world, interactable, combat)
// không phải sửa. Chất lượng cao hơn: segment lớn hơn, shadow bật sẵn,
// vật liệu MeshStandard với envMapIntensity.
import * as THREE from 'three';
import { engineProp, createEngineAsset, displacedRock } from '../assets/engineAssets.js';
import { G, M } from './materials.js';
import { makeSwayMaterial } from './wind.js';

// Đá hữu cơ qua engine displace (thay displacedIco tự viết cũ).
export function displacedIco(radius, detail, amp, seed) {
  return displacedRock(radius, detail, amp, seed);
}

function cloneProp(group) {
  // AssetFactory trả về Group đã có shadow; clone để mỗi vị trí dùng 1 instance riêng.
  return group.clone(true);
}

export function makeTree(rng, kind = 'pine') {
  const g = engineProp('tree', rng);
  const h = 3.2 + rng() * 3;
  g.scale.setScalar(h / 4.5);
  if (kind === 'maple') g.traverse((o) => { if (o.isMesh && o.material) o.material = o.material.clone(); });
  return g;
}

export function makeRock(rng, scale = 1) {
  const g = engineProp('rock', rng);
  g.scale.setScalar(scale);
  return g;
}

export function makeMountain(rng, tint) {
  const g = new THREE.Group();
  const r = 55 + rng() * 45;
  const mat = new THREE.MeshStandardMaterial({ color: tint, roughness: 1, flatShading: true, envMapIntensity: 0.15 });
  const m = new THREE.Mesh(displacedRock(r, 2, 0.22, (rng() * 1000) | 0), mat);
  m.position.y = r * 0.18; m.scale.y = 0.68 + rng() * 0.5; m.rotation.y = rng() * Math.PI * 2;
  g.add(m);
  if (m.scale.y > 0.95) {
    const cap = new THREE.Mesh(displacedRock(r * 0.45, 1, 0.2, (rng() * 1000) | 0), M(0xe8ecf0, { rough: 0.9 }));
    cap.position.y = r * 0.62; cap.scale.y = 0.5; g.add(cap);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  return g;
}

export function makeBambooField(count, rng) {
  const group = new THREE.Group();
  const stemMat = makeSwayMaterial({ color: 0x7a9a4e, roughness: 0.55 }, { amp: 0.07, freq: 1.6, heightRef: 4 });
  for (let i = 0; i < count; i++) {
    const h = 3 + rng() * 2;
    const stem = new THREE.Mesh(G('cyl', 0.05, 0.075, h, 5), stemMat);
    stem.position.set((rng() - 0.5) * 8, h / 2, (rng() - 0.5) * 8);
    stem.castShadow = true; group.add(stem);
  }
  return group;
}

export function makeLantern(lit = true) { return engineProp('lantern'); }
export function makeHouse(rng, tint = 0xd8d0bc) { return engineProp('house', rng); }
export function makeTorii(scale = 1) { const g = engineProp('torii'); g.scale.setScalar(scale); return g; }
export function makeBanner(color = 0x8a2a2a) { return engineProp('banner'); }
export function makeShrineHall() {
  const g = engineProp('house'); g.scale.setScalar(2.2); return g;
}
export function makeCampfire() {
  const g = engineProp('campfire');
  const light = new THREE.PointLight(0xff9a40, 4, 11, 1.7); light.position.y = 1.0; g.add(light);
  return g;
}
export function makeStatue() { return engineProp('statue'); }
export function makeGrave(rng) { return engineProp('grave', rng); }
export function makeChest() {
  const g = engineProp('chest');
  g.userData.lid = g.children[1] || null; // giữ API cũ: interactable mở nắp qua userData.lid
  return g;
}
export function makeWallSegment(len = 8, h = 3.2) {
  const g = engineProp('wall'); g.scale.set(len / 4, h / 2, 1); return g;
}
export function makeKeepTower() { const g = engineProp('tower'); g.scale.setScalar(3); return g; }
export function makeCastleGate() { return engineProp('gate'); }
export function makeBridge(len = 14, width = 3.2) {
  const g = engineProp('bridge'); g.scale.set(len / 6, 1, width / 2); return g;
}
export function makeDeadTree(rng) {
  const g = engineProp('tree', rng);
  g.traverse((o) => { if (o.isMesh) o.material = M(0x4a4038, { rough: 0.95 }); });
  return g;
}
export function makeReeds(rng) { return makeBambooField(6, rng); }
export function makeSnowPine(rng) {
  const g = engineProp('tree', rng);
  g.traverse((o) => { if (o.isMesh && o.position.y > 2) o.material = M(0xe8ecf0, { rough: 0.9 }); });
  return g;
}
export function makeLilyPad(rng) {
  return createEngineAsset('lilypad', [
    { shape: 'cylinder', size: [0.5, 0.08, 0.5], position: [0, 0.04, 0], color: 0x3e7a3a, roughness: 0.8 },
  ]);
}
export function makeMushroom(rng) { return engineProp('mushroom', rng); }
export function makeLavaRock(rng) { return engineProp('lavaRock', rng); }
export function makeArrow(ang = 0) { return engineProp('arrow'); }
export function makeFireball() { return engineProp('fireball'); }

export function makeNode(type, rng) {
  const g = new THREE.Group();
  switch (type) {
    case 'bamboo_node': g.add(makeBambooField(3, rng)); break;
    case 'ore_node': {
      g.add(engineProp('rock', rng));
      for (let i = 0; i < 5; i++) {
        const c = new THREE.Mesh(displacedRock(0.16, 0, 0.4, (rng() * 1000) | 0),
          new THREE.MeshStandardMaterial({ color: 0x9a6a4a, metalness: 0.65, roughness: 0.35, emissive: 0x351408, emissiveIntensity: 0.4 }));
        c.name = 'oreBit'; c.position.set((rng() - 0.5) * 1.1, 0.4 + rng() * 0.7, (rng() - 0.5) * 1.1); g.add(c);
      }
      break;
    }
    case 'herb_node': g.add(engineProp('mushroom', rng)); break;
    case 'ember_node': g.add(engineProp('lavaRock', rng)); break;
    default: g.add(engineProp('rock', rng));
  }
  return g;
}

export { cloneProp };
