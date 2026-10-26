// engine/src/procedural/monster-factory.ts — Tự tạo quái thú, trùm quái procedural từ seed
import * as THREE from 'three';
import { blob, spike, tentacle, eyeball, limbBone, seededRandom, displace } from './primitive-factory';
import type { PrimitiveOpts } from './primitive-factory';

export interface MonsterSpec {
  seed: number;
  height?: number;
  palette?: { body: number; accent: number; eye: number };
  tentacles?: number;
  spikes?: number;
  arms?: number;
  legs?: number;
  eyes?: number;
  wings?: boolean;
  posture?: 'biped' | 'quad' | 'blob' | 'flyer';
  roughness?: number;
  metalness?: number;
}

export interface BuiltMonster {
  root: THREE.Group;
  spec: Required<Pick<MonsterSpec, 'seed'>> & MonsterSpec;
  sockets: { name: string; node: THREE.Object3D }[];
  animationsHint: string[];
}

export type ProceduralMonsterResult = BuiltMonster;

export const PALETTES: { body: number; accent: number; eye: number }[] = [
  { body: 0x3a2a4a, accent: 0x8a4adf, eye: 0xffd23e }, // tím bóng tối
  { body: 0x24343a, accent: 0x3ec8b0, eye: 0x7cff5e }, // swamp
  { body: 0x4a2020, accent: 0xd04a2a, eye: 0xffe08a }, // magma
  { body: 0x1c2430, accent: 0x4a7ad0, eye: 0xb8e8ff }, // abyss
  { body: 0x3c3226, accent: 0xa8904a, eye: 0xff6a5a }, // bone
];

function mat(color: number, roughness: number, metalness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addEye(
  parent: THREE.Object3D,
  rng: () => number,
  spec: MonsterSpec,
  r: number,
  pos: THREE.Vector3,
  mats: { body: THREE.MeshStandardMaterial; accent: THREE.MeshStandardMaterial; eye: THREE.MeshStandardMaterial },
): void {
  const { white, pupil } = eyeball(r);
  const g = new THREE.Group();
  const w = new THREE.Mesh(white, mat(spec.palette?.eye ?? 0xffffff, 0.35, 0));
  const p = new THREE.Mesh(pupil, mats.eye);
  p.position.z = r * 0.72;
  g.add(w, p);
  g.position.copy(pos);
  g.lookAt(pos.clone().multiplyScalar(2).add(new THREE.Vector3(rng() - 0.5, 0.1, 1)));
  parent.add(g);
}

export function buildMonster(specIn: MonsterSpec): BuiltMonster {
  const spec: MonsterSpec = { ...specIn };
  const rng = seededRandom(spec.seed);
  const palette = spec.palette ?? PALETTES[Math.floor(rng() * PALETTES.length) % PALETTES.length];
  spec.palette = palette;
  const posture = spec.posture ?? (['biped', 'quad', 'blob', 'flyer'] as const)[Math.floor(rng() * 4) % 4];
  const height = spec.height ?? 1.6 + rng() * 1.8;
  const rough = spec.roughness ?? 0.75;
  const metal = spec.metalness ?? 0.08;
  const mats = {
    body: mat(palette.body, rough, metal),
    accent: mat(palette.accent, rough * 0.7, metal + 0.15),
    eye: mat(palette.eye, 0.2, 0),
  };
  const root = new THREE.Group();
  root.name = `monster_${spec.seed}`;
  const sockets: { name: string; node: THREE.Object3D }[] = [];

  const nTent = spec.tentacles ?? (posture === 'blob' ? 4 + Math.floor(rng() * 6) : 0);
  const nSpike = spec.spikes ?? Math.floor(rng() * 10);
  const nEye = spec.eyes ?? 1 + Math.floor(rng() * 4);
  const wings = spec.wings ?? posture === 'flyer';

  if (posture === 'blob') {
    const r = height * 0.42;
    const bodyGeo = displace(new THREE.IcosahedronGeometry(r, 3), 0.3, 1.2, spec.seed);
    const body = new THREE.Mesh(bodyGeo, mats.body);
    body.position.y = r * 0.95;
    root.add(body);
    sockets.push({ name: 'core', node: body });
    for (let i = 0; i < nTent; i++) {
      const t = new THREE.Mesh(tentacle(r * (0.9 + rng() * 0.8), r * 0.14, spec.seed + i), mats.accent);
      const a = (i / nTent) * Math.PI * 2;
      t.position.set(Math.cos(a) * r * 0.7, r * 0.9, Math.sin(a) * r * 0.7);
      t.rotation.x = 0.4;
      root.add(t);
    }
    for (let i = 0; i < nEye; i++) {
      const a = rng() * Math.PI * 2;
      const rr = r * (0.5 + rng() * 0.4);
      addEye(
        body,
        rng,
        spec,
        r * (0.1 + rng() * 0.1),
        new THREE.Vector3(Math.cos(a) * rr * 0.7, r * (0.3 + rng() * 0.6), Math.sin(a) * rr * 0.7),
        mats,
      );
    }
    for (let i = 0; i < nSpike; i++) {
      const s = new THREE.Mesh(spike(r * (0.3 + rng() * 0.5), r * 0.09), mats.accent);
      const a = rng() * Math.PI * 2;
      const rr = r * rng() * 0.7;
      s.position.set(Math.cos(a) * rr, r * (1.3 + rng() * 0.5), Math.sin(a) * rr);
      root.add(s);
    }
    sockets.push({ name: 'head', node: body });
  } else {
    const bodyH = height * (posture === 'quad' ? 0.34 : 0.42);
    const bodyW = height * (posture === 'quad' ? 0.55 : 0.32);
    const torso = new THREE.Mesh(
      displace(new THREE.CapsuleGeometry(bodyW * 0.55, bodyH, 4, 10), 0.18, 1, spec.seed),
      mats.body,
    );
    torso.position.y = posture === 'quad' ? height * 0.52 : height * 0.62;
    if (posture === 'quad') torso.rotation.z = Math.PI / 2;
    root.add(torso);
    sockets.push({ name: 'core', node: torso });

    const headR = height * 0.16;
    const head = new THREE.Mesh(
      displace(new THREE.IcosahedronGeometry(headR, 2), 0.2, 1.5, spec.seed + 7),
      mats.body,
    );
    const headY = posture === 'quad' ? height * 0.52 + bodyW * 0.5 : height * 0.62 + bodyH * 0.5 + headR * 0.6;
    const headZ = posture === 'quad' ? height * 0.34 : 0;
    head.position.set(0, headY, headZ);
    root.add(head);
    sockets.push({ name: 'head', node: head });

    const horns = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < horns; i++) {
      const s = new THREE.Mesh(spike(headR * (0.8 + rng()), headR * 0.18), mats.accent);
      s.position.set((rng() - 0.5) * headR, headR * (0.7 + rng() * 0.5), (rng() - 0.5) * headR);
      s.rotation.z = (rng() - 0.5) * 1.2;
      head.add(s);
    }
    for (let i = 0; i < nEye; i++) {
      addEye(
        head,
        rng,
        spec,
        headR * (0.18 + rng() * 0.12),
        new THREE.Vector3((rng() - 0.5) * headR * 0.8, rng() * headR * 0.4, headR * 0.75),
        mats,
      );
    }

    const legs = posture === 'quad' ? 4 : (spec.legs ?? 2);
    const armCount = posture === 'quad' ? 0 : (spec.arms ?? 2);
    const legLen = height * (posture === 'quad' ? 0.32 : 0.4);
    for (let i = 0; i < legs; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const leg = new THREE.Mesh(limbBone(bodyW * 0.12, legLen * 0.7), mats.accent);
      const lx = posture === 'quad' ? (i < 2 ? 1 : -1) * height * 0.2 : side * bodyW * 0.4;
      leg.position.set(lx, legLen * 0.35, posture === 'quad' ? (i % 2 === 0 ? 1 : -1) * height * 0.16 : 0);
      root.add(leg);
    }
    for (let i = 0; i < armCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const arm = new THREE.Mesh(limbBone(bodyW * 0.1, height * 0.22), mats.accent);
      arm.position.set(side * bodyW * 0.75, height * 0.55, 0);
      arm.rotation.z = side * (0.5 + rng() * 0.4);
      root.add(arm);
      if (i === 0) sockets.push({ name: 'hand_r', node: arm });
      if (i === 1) sockets.push({ name: 'hand_l', node: arm });
    }

    for (let i = 0; i < nSpike; i++) {
      const s = new THREE.Mesh(spike(height * (0.1 + rng() * 0.15), height * 0.03), mats.accent);
      s.position.set((rng() - 0.5) * bodyW * 0.6, torso.position.y + bodyH * (0.4 + rng() * 0.4), (rng() - 0.5) * 0.1);
      root.add(s);
    }

    if (wings) {
      for (const side of [1, -1]) {
        const wing = new THREE.Mesh(
          displace(new THREE.CircleGeometry(height * 0.4, 3), 0.15, 1.5, spec.seed + 3),
          mats.accent,
        );
        (wing.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
        wing.position.set(side * bodyW * 0.7, height * 0.72, -height * 0.05);
        wing.rotation.y = side * 1.1;
        root.add(wing);
      }
    }

    for (let i = 0; i < nTent; i++) {
      const t = new THREE.Mesh(tentacle(height * (0.3 + rng() * 0.4), height * 0.03, spec.seed + i), mats.accent);
      t.position.set((rng() - 0.5) * bodyW, torso.position.y - bodyH * 0.3, -height * 0.15);
      root.add(t);
    }
  }

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.children.forEach((c) => {
    c.position.y -= box.min.y;
  });
  root.userData.posture = posture;
  root.userData.seed = spec.seed;

  return {
    root,
    spec: { ...spec, seed: spec.seed, height, posture },
    sockets,
    animationsHint: ['Idle', 'Walk', 'Attack', 'Death'],
  };
}

export const MONSTER_FACTORY = { buildMonster, PALETTES };
export const MonsterFactory = MONSTER_FACTORY;
