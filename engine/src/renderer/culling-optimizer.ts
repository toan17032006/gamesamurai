// engine/src/renderer/culling-optimizer.ts — Cấu hình hiển thị tầm nhìn, Frustum Culling, SpatialGrid và LOD switching
import * as THREE from 'three';
import type { LODLevel } from '../types/transform.types';
import { buildLOD } from '../transformer/geometry-optimizer';

export class SpatialGrid {
  private cellSize: number;
  private cells = new Map<string, Set<string>>();
  private positions = new Map<string, THREE.Vector3>();

  constructor(cellSize = 5) {
    this.cellSize = Math.max(0.1, cellSize);
  }

  get cellCount(): number {
    return this.cells.size;
  }

  get size(): number {
    return this.positions.size;
  }

  private keyFor(cx: number, cy: number, cz: number): string {
    return `${cx},${cy},${cz}`;
  }

  insert(id: string, position: THREE.Vector3, radius = 0): void {
    this.remove(id);
    this.positions.set(id, position.clone());
    const r = Math.max(0, radius);
    const minCx = Math.floor((position.x - r) / this.cellSize);
    const maxCx = Math.floor((position.x + r) / this.cellSize);
    const minCy = Math.floor((position.y - r) / this.cellSize);
    const maxCy = Math.floor((position.y + r) / this.cellSize);
    const minCz = Math.floor((position.z - r) / this.cellSize);
    const maxCz = Math.floor((position.z + r) / this.cellSize);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const key = this.keyFor(cx, cy, cz);
          let set = this.cells.get(key);
          if (!set) {
            set = new Set<string>();
            this.cells.set(key, set);
          }
          set.add(id);
        }
      }
    }
  }

  remove(id: string): boolean {
    const pos = this.positions.get(id);
    if (!pos) return false;
    for (const [key, set] of this.cells) {
      if (set.delete(id) && set.size === 0) this.cells.delete(key);
    }
    this.positions.delete(id);
    return true;
  }

  query(position: THREE.Vector3, radius: number): string[] {
    const out = new Set<string>();
    const minCx = Math.floor((position.x - radius) / this.cellSize);
    const maxCx = Math.floor((position.x + radius) / this.cellSize);
    const minCy = Math.floor((position.y - radius) / this.cellSize);
    const maxCy = Math.floor((position.y + radius) / this.cellSize);
    const minCz = Math.floor((position.z - radius) / this.cellSize);
    const maxCz = Math.floor((position.z + radius) / this.cellSize);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const set = this.cells.get(this.keyFor(cx, cy, cz));
          if (set) for (const id of set) out.add(id);
        }
      }
    }
    return Array.from(out);
  }

  queryBox(box: THREE.Box3): string[] {
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getSize(new THREE.Vector3()).length() * 0.5;
    return this.query(center, radius);
  }

  clear(): void {
    this.cells.clear();
    this.positions.clear();
  }
}

export function frustumCull(objects: THREE.Object3D[], camera: THREE.Camera): THREE.Object3D[] {
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);

  const visible: THREE.Object3D[] = [];
  const sphere = new THREE.Sphere();

  for (const obj of objects) {
    if (!obj.visible) continue;
    sphere.set(obj.position, 2.0); // Bán kính ước tính an toàn
    if (frustum.intersectsSphere(sphere)) {
      visible.push(obj);
    }
  }
  return visible;
}

export function setupLevelOfDetail(root: THREE.Object3D, levels: LODLevel[]): THREE.LOD {
  return buildLOD(root, levels);
}
