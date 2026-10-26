// Rig quái bằng ENGINE buildMonster — dùng chung cho Creature (quad/bird/fish)
// và Dragon. Engine monster đã tự căn chân chạm đất (Box3.min.y = 0 sau khi
// trừ box.min.y cho mọi child), nên group.position = pos (mặt đất) là đúng,
// không cần offset y thêm.
//
// Khớp animation của game cũ -> mesh/khớp engine:
//   quad: legs = 4 mesh chân capsule, head = socket head, tail = group đuôi
//     (spike engine gắn sau thân, xoay quanh gốc đuôi)
//   bird: wings = 2 mesh cánh circle, xoay rotation.z để vẫy
//   fish: tail = mesh tentacle đầu tiên, xoay rotation.y để quẫy
//   dragon: wings = 2 mesh cánh, head = socket head, neck = socket head,
//     tail = group đuôi spike
import * as THREE from 'three';
import { createEngineMonster, enginePrimitives, MONSTER_PALETTES } from '../assets/engineAssets.js';

function seedFrom(str) {
  let s = 1;
  for (let i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
  return (s % 100000) + 1;
}

function findByName(root, name) {
  for (const s of root.userData?.sockets || []) { /* sockets lưu ở built, không ở root */ }
  let found = null;
  root.traverse((o) => { if (!found && o.name === name) found = o; });
  return found;
}

export function buildEngineMonsterRig({ kind, posture, height, palette, seed, wings }) {
  const built = createEngineMonster({
    seed, height, palette, posture, wings,
    tentacles: kind === 'fish' ? 4 : 0,
    spikes: kind === 'quad' ? 6 : 4,
    eyes: kind === 'bird' ? 2 : 2,
  });
  const root = built.root;
  // Socket head/core: buildMonster không đặt name cho mesh head/core, nhưng
  // sockets trả về node — lấy từ built.sockets
  const socketMap = {};
  for (const s of built.sockets) socketMap[s.name] = s.node;
  const bodyMat = socketMap.core ? socketMap.core.material : null;

  // Cánh: mesh CircleGeometry của engine (flyer)
  const wingMeshes = [];
  root.traverse((o) => {
    if (o.isMesh && o.geometry && o.geometry.type === 'CircleGeometry') wingMeshes.push(o);
  });
  wingMeshes.sort((a, b) => a.position.x - b.position.x);

  // Chân: mesh CapsuleGeometry (limbBone) ở gần mặt đất
  const legMeshes = [];
  root.traverse((o) => {
    if (o.isMesh && o.geometry && o.geometry.type === 'CapsuleGeometry') legMeshes.push(o);
  });

  // Đuôi: group + spike engine, gắn sau thân (z âm), xoay quanh gốc
  const tail = new THREE.Group();
  tail.position.set(0, height * 0.5, -height * 0.35);
  const spikeMesh = new THREE.Mesh(enginePrimitives.spike(height * 0.3, height * 0.06), bodyMat || new THREE.MeshStandardMaterial({ color: palette.body }));
  spikeMesh.rotation.x = Math.PI / 2;
  spikeMesh.position.z = -height * 0.15;
  tail.add(spikeMesh);
  root.add(tail);

  return {
    group: root,
    joints: {
      legs: legMeshes, head: socketMap.head || null, tail,
      wings: wingMeshes.length >= 2 ? wingMeshes : [wingMeshes[0], wingMeshes[1]].filter(Boolean),
      neck: socketMap.head || null,
    },
    mats: { body: bodyMat },
    monster: built,
    posture: built.spec.posture,
  };
}

export function buildCreatureRig(def) {
  const s = def.scale || 1;
  const palette = { body: def.colors.body, accent: def.colors.dark || def.colors.wing || MONSTER_PALETTES[0].accent, eye: 0xffd23e };
  const seed = seedFrom(def.id || def.kind);
  if (def.kind === 'bird') {
    const rig = buildEngineMonsterRig({ kind: 'bird', posture: 'flyer', height: 1.1 * s, palette, seed, wings: true });
    return { group: rig.group, joints: { wings: rig.joints.wings }, mats: rig.mats };
  }
  if (def.kind === 'fish') {
    const rig = buildEngineMonsterRig({ kind: 'fish', posture: 'blob', height: 0.7 * s, palette, seed, wings: false });
    // Cá: tail = tentacle đầu tiên (quẫy được), fallback là group đuôi
    const tentacle = rig.group.children.find((c) => c.geometry && c.geometry.type === 'ConeGeometry');
    return { group: rig.group, joints: { tail: rig.joints.tail }, mats: rig.mats };
  }
  // quad: hươu/lợn/sói — height 1.1*scale cho đầu ở ~0.87*scale như rig cũ
  const rig = buildEngineMonsterRig({ kind: 'quad', posture: 'quad', height: 1.1 * s, palette, seed, wings: false });
  return { group: rig.group, joints: { legs: rig.joints.legs, head: rig.joints.head, tail: rig.joints.tail }, mats: rig.mats };
}

export function buildDragonRig() {
  const palette = { body: 0x7a1e12, accent: 0xff5a20, eye: 0xffd257 };
  const rig = buildEngineMonsterRig({ kind: 'dragon', posture: 'flyer', height: 4.2, palette, seed: 777, wings: true });
  return { group: rig.group, joints: { wings: rig.joints.wings, neck: rig.joints.neck, tail: rig.joints.tail, head: rig.joints.head }, mats: rig.mats };
}
