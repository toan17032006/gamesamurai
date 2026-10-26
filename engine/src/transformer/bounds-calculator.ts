// engine/src/transformer/bounds-calculator.ts — Tính toán Bounding Box và Bounding Sphere đa trục
import * as THREE from 'three';
import type { Bounds } from '../types/asset.types';

const cache = new Map<string, Bounds>();

function emptyBounds(): Bounds {
  return {
    box: { min: [0, 0, 0], max: [0, 0, 0] },
    sphere: { center: [0, 0, 0], radius: 0 },
    height: 0,
    width: 0,
    depth: 0,
    size: [0, 0, 0],
  };
}

export function computeBounds(obj: THREE.Object3D): Bounds {
  const cached = cache.get(obj.uuid);
  if (cached) return cached;

  const box = new THREE.Box3().setFromObject(obj);
  if (box.isEmpty()) {
    const empty = emptyBounds();
    cache.set(obj.uuid, empty);
    return empty;
  }

  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;

  const bounds: Bounds = {
    box: {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
    },
    sphere: { center: [sphere.center.x, sphere.center.y, sphere.center.z], radius: sphere.radius },
    height,
    width,
    depth,
    size: [width, height, depth],
  };
  cache.set(obj.uuid, bounds);
  return bounds;
}

export function invalidateBounds(obj?: THREE.Object3D): void {
  if (obj) cache.delete(obj.uuid);
  else cache.clear();
}

export const BoundsCalculator = {
  computeBounds,
  invalidateBounds,
};

