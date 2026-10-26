// engine/src/procedural/character-factory.ts — Xây dựng nhân vật hoàn chỉnh (Humanoid, class, gear, sockets)
import * as THREE from 'three';
import { limbBone, cubeBox, cylinder, seededRandom, displace } from './primitive-factory';

export interface CharacterSpec {
  seed: number;
  archetype?: 'warrior' | 'mage' | 'rogue' | 'knight' | 'cultist' | 'boss';
  height?: number;
  skinColor?: number;
  armorColor?: number;
  accentColor?: number;
  helmet?: boolean;
  cape?: boolean;
  shoulderPlates?: boolean;
  roughness?: number;
  metalness?: number;
}

export interface BuiltCharacter {
  root: THREE.Group;
  spec: CharacterSpec;
  sockets: { name: string; node: THREE.Object3D }[] & Record<string, any>;
  boneHierarchy: { name: string; node: THREE.Object3D; parentName?: string }[];
}

export type ProceduralCharacterResult = BuiltCharacter;

export function buildCharacter(specIn: CharacterSpec): BuiltCharacter {
  const spec = { ...specIn };
  const rng = seededRandom(spec.seed);
  const height = spec.height ?? 1.8;
  const archetype = spec.archetype ?? 'warrior';

  const skinColor = spec.skinColor ?? 0xd2a679;
  const armorColor = spec.armorColor ?? (archetype === 'mage' ? 0x2b2b52 : archetype === 'knight' ? 0x8c8c94 : 0x4a3728);
  const accentColor = spec.accentColor ?? (archetype === 'mage' ? 0x9b59b6 : archetype === 'boss' ? 0xc0392b : 0xe67e22);

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8, metalness: 0.05 });
  const armorMat = new THREE.MeshStandardMaterial({
    color: armorColor,
    roughness: spec.roughness ?? 0.4,
    metalness: spec.metalness ?? (archetype === 'knight' || archetype === 'warrior' ? 0.7 : 0.2),
  });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.5, metalness: 0.3 });

  const root = new THREE.Group();
  root.name = `character_${archetype}_${spec.seed}`;

  const sockets: { name: string; node: THREE.Object3D }[] = [];
  const boneHierarchy: { name: string; node: THREE.Object3D; parentName?: string }[] = [];

  // 1. Hips (Pelvis)
  const hips = new THREE.Group();
  hips.name = 'hips';
  hips.position.y = height * 0.52;
  const hipsMesh = new THREE.Mesh(cubeBox(height * 0.2, height * 0.12, height * 0.14), armorMat);
  hips.add(hipsMesh);
  root.add(hips);
  boneHierarchy.push({ name: 'hips', node: hips });
  sockets.push({ name: 'belt', node: hips });

  // 2. Spine & Torso
  const spine = new THREE.Group();
  spine.name = 'spine';
  spine.position.y = height * 0.12;
  const torsoMesh = new THREE.Mesh(
    displace(new THREE.BoxGeometry(height * 0.24, height * 0.26, height * 0.16), 0.1, 2, spec.seed),
    armorMat,
  );
  torsoMesh.position.y = height * 0.13;
  spine.add(torsoMesh);
  hips.add(spine);
  boneHierarchy.push({ name: 'spine', node: spine, parentName: 'hips' });
  sockets.push({ name: 'spine', node: spine });

  // 3. Head & Neck
  const neck = new THREE.Group();
  neck.name = 'neck';
  neck.position.y = height * 0.26;
  spine.add(neck);

  const head = new THREE.Group();
  head.name = 'head';
  head.position.y = height * 0.06;
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(height * 0.1, 16, 14), skinMat);
  head.add(headMesh);

  if (spec.helmet !== false && (archetype === 'knight' || archetype === 'warrior' || archetype === 'boss')) {
    const helmetMesh = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.11, height * 0.11, height * 0.14, 16), accentMat);
    helmetMesh.position.y = height * 0.02;
    head.add(helmetMesh);
  }
  neck.add(head);
  boneHierarchy.push({ name: 'head', node: head, parentName: 'spine' });
  sockets.push({ name: 'head', node: head });

  // 4. Arms (Left & Right)
  const shoulderWidth = height * 0.22;
  for (const side of [1, -1]) {
    const sidePrefix = side === 1 ? 'r' : 'l';
    const shoulder = new THREE.Group();
    shoulder.name = `shoulder_${sidePrefix}`;
    shoulder.position.set(side * shoulderWidth, height * 0.22, 0);
    spine.add(shoulder);

    if (spec.shoulderPlates !== false && (archetype === 'knight' || archetype === 'warrior' || archetype === 'boss')) {
      const pauldron = new THREE.Mesh(new THREE.SphereGeometry(height * 0.08, 8, 8), accentMat);
      pauldron.scale.set(1.2, 0.9, 1.2);
      shoulder.add(pauldron);
    }

    const upperArm = new THREE.Group();
    upperArm.name = `arm_${sidePrefix}`;
    const upperArmMesh = new THREE.Mesh(limbBone(height * 0.045, height * 0.18), armorMat);
    upperArmMesh.position.y = -height * 0.09;
    upperArm.add(upperArmMesh);
    shoulder.add(upperArm);
    boneHierarchy.push({ name: `arm_${sidePrefix}`, node: upperArm, parentName: 'spine' });

    const forearm = new THREE.Group();
    forearm.name = `forearm_${sidePrefix}`;
    forearm.position.y = -height * 0.18;
    const forearmMesh = new THREE.Mesh(limbBone(height * 0.04, height * 0.16), skinMat);
    forearmMesh.position.y = -height * 0.08;
    forearm.add(forearmMesh);
    upperArm.add(forearm);
    boneHierarchy.push({ name: `forearm_${sidePrefix}`, node: forearm, parentName: `arm_${sidePrefix}` });

    const hand = new THREE.Group();
    hand.name = `hand_${sidePrefix}`;
    hand.position.y = -height * 0.16;
    const handMesh = new THREE.Mesh(cubeBox(height * 0.05, height * 0.06, height * 0.03), armorMat);
    hand.add(handMesh);
    forearm.add(hand);
    boneHierarchy.push({ name: `hand_${sidePrefix}`, node: hand, parentName: `forearm_${sidePrefix}` });

    sockets.push({ name: `hand_${sidePrefix}`, node: hand });
    if (side === -1) sockets.push({ name: 'arm_l', node: forearm });
  }

  // 5. Legs (Left & Right)
  const hipWidth = height * 0.09;
  for (const side of [1, -1]) {
    const sidePrefix = side === 1 ? 'r' : 'l';
    const thigh = new THREE.Group();
    thigh.name = `thigh_${sidePrefix}`;
    thigh.position.set(side * hipWidth, -height * 0.04, 0);
    const thighMesh = new THREE.Mesh(limbBone(height * 0.055, height * 0.22), armorMat);
    thighMesh.position.y = -height * 0.11;
    thigh.add(thighMesh);
    hips.add(thigh);
    boneHierarchy.push({ name: `thigh_${sidePrefix}`, node: thigh, parentName: 'hips' });

    const shin = new THREE.Group();
    shin.name = `shin_${sidePrefix}`;
    shin.position.y = -height * 0.22;
    const shinMesh = new THREE.Mesh(limbBone(height * 0.05, height * 0.2), armorMat);
    shinMesh.position.y = -height * 0.1;
    shin.add(shinMesh);
    thigh.add(shin);
    boneHierarchy.push({ name: `shin_${sidePrefix}`, node: shin, parentName: `thigh_${sidePrefix}` });

    const foot = new THREE.Group();
    foot.name = `foot_${sidePrefix}`;
    foot.position.set(0, -height * 0.2, height * 0.04);
    const footMesh = new THREE.Mesh(cubeBox(height * 0.06, height * 0.04, height * 0.12), accentMat);
    foot.add(footMesh);
    shin.add(foot);
    boneHierarchy.push({ name: `foot_${sidePrefix}`, node: foot, parentName: `shin_${sidePrefix}` });
    sockets.push({ name: `foot_${sidePrefix}`, node: foot });
  }

  // 6. Cape (nếu bật)
  if (spec.cape || archetype === 'mage' || archetype === 'boss') {
    const capeGeo = new THREE.PlaneGeometry(height * 0.26, height * 0.45, 4, 6);
    const capeMat = new THREE.MeshStandardMaterial({ color: accentColor, side: THREE.DoubleSide, roughness: 0.9 });
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.name = 'cape';
    cape.position.set(0, height * 0.18, -height * 0.09);
    cape.rotation.x = 0.1;
    spine.add(cape);
  }

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;

  const socketsRecord = sockets as any;
  socketsRecord.spine = spine;
  socketsRecord.head = head;
  socketsRecord.hips = hips;
  socketsRecord.root = root;

  return {
    root,
    spec,
    sockets,
    boneHierarchy,
  };
}

export const CharacterFactory = {
  buildCharacter,
};

