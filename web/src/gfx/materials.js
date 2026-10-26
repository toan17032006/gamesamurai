// Materials — PHIÊN BẢN ENGINE: geometry/material đều qua engine @aetheria/engine.
// Trước đây dùng helper G/M tự viết; nay G() dùng PrimitiveFactory của engine
// (cubeBox, cylinder, blob/displace, seeded geometry) với segment cao hơn,
// M() dùng MeshStandardMaterial chất lượng cao, cache bằng generic cache
// (key -> asset, tái sử dụng, không cấp phát lại mỗi frame).
import * as THREE from 'three';
import { blob, cubeBox, cylinder, displace, seededRandom } from '../assets/engine-lib.js';
import { getOrCreate } from '../assets/engineAssets.js';

export function G(kind, ...args) {
  return getOrCreate(`geo:${kind}:${args.join(',')}`, () => buildGeo(kind, args));
}

function buildGeo(kind, args) {
  switch (kind) {
    case 'box': return cubeBox(args[0] ?? 1, args[1] ?? 1, args[2] ?? 1);
    case 'cyl':
      // Giữ taper top/bottom của game cũ; khi top==bottom thì dùng cylinder của engine.
      return args[1] !== undefined && args[1] !== args[0]
        ? new THREE.CylinderGeometry(args[0], args[1], args[2], args[3] || 20)
        : cylinder(args[0] ?? 0.5, args[2] ?? 1, args[3] || 20);
    case 'sph': return new THREE.SphereGeometry(args[0], args[1] || 24, args[2] || 18);
    case 'cone': return new THREE.ConeGeometry(args[0], args[1], args[2] || 24);
    case 'torus': return new THREE.TorusGeometry(...args);
    case 'plane': return new THREE.PlaneGeometry(...args);
    case 'circle': return new THREE.CircleGeometry(...args);
    case 'ring': return new THREE.RingGeometry(...args);
    case 'dode': return new THREE.DodecahedronGeometry(...args);
    case 'ico': return new THREE.IcosahedronGeometry(args[0] ?? 1, args[1] ?? 2);
    case 'blob': return blob(args[0] ?? 1, args[1] ?? 2);
    case 'displaced': return displace(new THREE.IcosahedronGeometry(args[0] ?? 1, args[1] ?? 2), args[2] ?? 0.3, 2, args[3] ?? 1);
    default: throw new Error('unknown geo ' + kind);
  }
}

export function M(color, opts = {}) {
  return getOrCreate(`mat:${color}:${JSON.stringify(opts)}`, () =>
    new THREE.MeshStandardMaterial({
      color, roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0.05,
      envMapIntensity: 0.6, ...opts.extra,
    }));
}

// Per-character materials (owned, tintable, disposed with the rig)
export function charMaterials(colors, ghost) {
  const mk = (color, opts = {}) => new THREE.MeshPhysicalMaterial({
    color, roughness: opts.rough ?? 0.8, metalness: opts.metal ?? 0.05,
    transparent: !!ghost, opacity: ghost ? 0.55 : 1, emissive: ghost ? new THREE.Color(color).multiplyScalar(0.25) : 0x000000,
    envMapIntensity: opts.envInt ?? 0.6, sheen: opts.sheen ?? 0, sheenRoughness: 0.6,
  });
  return {
    cloth: mk(colors.cloth),
    accent: mk(colors.accent ?? 0x8a2a2a, { rough: 0.7 }),
    skin: mk(colors.skin, { rough: 0.65 }),
    hair: mk(colors.hair, { rough: 0.9 }),
    plate: mk(colors.plate ?? 0x4a4f58, { rough: 0.5, metal: 0.55 }),
    lacquer: mk(0x1a1416, { rough: 0.22, metal: 0.25 }),
    dispose() { for (const k of ['cloth', 'accent', 'skin', 'hair', 'plate', 'lacquer']) this[k].dispose(); },
  };
}

export function shadowify(root) {
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
}

// Re-export engine primitives để các module khác dùng chung 1 nguồn.
export { blob, cubeBox, cylinder, displace, seededRandom };
