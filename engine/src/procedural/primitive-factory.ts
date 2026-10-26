// engine/src/procedural/primitive-factory.ts — Khối hình học nguyên thủy có tham số cho procedural generation
import * as THREE from 'three';

export interface PrimitiveOpts {
  seed?: number;
  noiseAmp?: number;
  noiseFreq?: number;
}

export function seededRandom(seed: number): () => number {
  let h = seed >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashNoise(x: number, y: number, z: number, seed: number): number {
  let h = Math.imul(x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1274126177, 2654435761);
  h ^= h >>> 13;
  h = Math.imul(h, 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function displace(geo: THREE.BufferGeometry, amp: number, freq: number, seed: number): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = hashNoise(
      Math.round(v.x * freq * 10),
      Math.round(v.y * freq * 10),
      Math.round(v.z * freq * 10),
      seed,
    );
    v.multiplyScalar(1 + (n - 0.5) * amp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function blob(radius = 1, detail = 2, opts: PrimitiveOpts = {}): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const seed = opts.seed ?? 1;
  return displace(geo, opts.noiseAmp ?? 0.25, opts.noiseFreq ?? 1, seed);
}

export function spike(height = 0.5, radius = 0.12, seg = 6): THREE.BufferGeometry {
  return new THREE.ConeGeometry(radius, height, seg);
}

export function tentacle(length = 1.2, radius = 0.12, seed = 1, seg = 24): THREE.BufferGeometry {
  const rng = seededRandom(seed);
  const pts: THREE.Vector3[] = [];
  let x = 0, z = 0;
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    x += (rng() - 0.5) * length * 0.25;
    z += (rng() - 0.5) * length * 0.25;
    pts.push(new THREE.Vector3(x, -t * length, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, seg, radius, 6, false);
}

export function eyeball(radius = 0.14): { white: THREE.BufferGeometry; pupil: THREE.BufferGeometry } {
  return {
    white: new THREE.SphereGeometry(radius, 12, 10),
    pupil: new THREE.SphereGeometry(radius * 0.45, 10, 8),
  };
}

export function limbBone(radius = 0.08, length = 0.6): THREE.BufferGeometry {
  return new THREE.CapsuleGeometry(radius, length, 4, 8);
}

export function cubeBox(width = 1, height = 1, depth = 1): THREE.BufferGeometry {
  return new THREE.BoxGeometry(width, height, depth);
}

export function cylinder(radius = 0.5, height = 1, seg = 16): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(radius, radius, height, seg);
}

export function createConeMesh(opts: { radius?: number; height?: number; segments?: number; color?: number; roughness?: number } = {}): THREE.Mesh {
  const geo = new THREE.ConeGeometry(opts.radius ?? 0.5, opts.height ?? 1, opts.segments ?? 16);
  const mat = new THREE.MeshStandardMaterial({ color: opts.color ?? 0x888888, roughness: opts.roughness ?? 0.5 });
  return new THREE.Mesh(geo, mat);
}

export function createCylinderMesh(opts: { radiusTop?: number; radiusBottom?: number; height?: number; segments?: number; color?: number; roughness?: number; metalness?: number } = {}): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(opts.radiusTop ?? 0.5, opts.radiusBottom ?? 0.5, opts.height ?? 1, opts.segments ?? 16);
  const mat = new THREE.MeshStandardMaterial({ color: opts.color ?? 0x888888, roughness: opts.roughness ?? 0.5, metalness: opts.metalness ?? 0.1 });
  return new THREE.Mesh(geo, mat);
}

export function createBoxMesh(opts: { width?: number; height?: number; depth?: number; color?: number; roughness?: number } = {}): THREE.Mesh {
  const geo = new THREE.BoxGeometry(opts.width ?? 1, opts.height ?? 1, opts.depth ?? 1);
  const mat = new THREE.MeshStandardMaterial({ color: opts.color ?? 0x888888, roughness: opts.roughness ?? 0.5 });
  return new THREE.Mesh(geo, mat);
}

export const PRIMITIVES = {
  blob,
  spike,
  tentacle,
  eyeball,
  limbBone,
  cubeBox,
  cylinder,
  displace,
  seededRandom,
  createConeMesh,
  createCylinderMesh,
  createBoxMesh,
};

export const PrimitiveFactory = PRIMITIVES;

