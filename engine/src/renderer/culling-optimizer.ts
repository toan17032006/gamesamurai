// engine/src/renderer/culling-optimizer.ts — Cấu hình hiển thị tầm nhìn, Frustum Culling, SpatialGrid và LOD switching.
// Tối ưu: remove O(1) nhờ bản đồ cell-key theo id, query non-alloc (queryInto),
// frustum cull tái sử dụng Frustum/Matrix4 scratch và bán kính thật từ
// bounding sphere của geometry thay vì bán kính cứng.
import * as THREE from 'three';
import type { LODLevel } from '../types/transform.types';
import { buildLOD } from '../transformer/geometry-optimizer';

export class SpatialGrid {
  private cellSize: number;
  private cells = new Map<string, Set<string>>();
  private positions = new Map<string, THREE.Vector3>();
  /** Chỉ mục ngược id → danh sách cell-key nó đang chiếm — cho remove O(1). */
  private idCells = new Map<string, string[]>();

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
    const keys: string[] = [];
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const key = this.keyFor(cx, cy, cz);
          keys.push(key);
          let set = this.cells.get(key);
          if (!set) {
            set = new Set<string>();
            this.cells.set(key, set);
          }
          set.add(id);
        }
      }
    }
    this.idCells.set(id, keys);
  }

  /** Gỡ id khỏi toàn bộ cell nó đang chiếm — O(số cell của id) thay vì O(toàn bộ grid). */
  remove(id: string): boolean {
    const pos = this.positions.get(id);
    if (!pos) return false;
    const keys = this.idCells.get(id);
    if (keys) {
      for (const key of keys) {
        const set = this.cells.get(key);
        if (set) {
          set.delete(id);
          if (set.size === 0) this.cells.delete(key);
        }
      }
      this.idCells.delete(id);
    } else {
      // Dữ liệu cũ trước khi có chỉ mục ngược: quét tất cả (an toàn hoá).
      for (const [key, set] of this.cells) {
        if (set.delete(id) && set.size === 0) this.cells.delete(key);
      }
    }
    this.positions.delete(id);
    return true;
  }

  query(position: THREE.Vector3, radius: number): string[] {
    return this.queryInto(position, radius, []);
  }

  /**
   * Query không cấp phát: ghi kết quả vào mảng `out` do caller tái sử dụng
   * (được `clear()` nội bộ). Trả chính `out` — dùng trong vòng lặp nóng render.
   */
  queryInto(position: THREE.Vector3, radius: number, out: string[]): string[] {
    out.length = 0;
    const seen = queryScratch;
    seen.clear();
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
          if (set) {
            for (const id of set) {
              if (!seen.has(id)) {
                seen.add(id);
                out.push(id);
              }
            }
          }
        }
      }
    }
    return out;
  }

  queryBox(box: THREE.Box3): string[] {
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getSize(new THREE.Vector3()).length() * 0.5;
    return this.query(center, radius);
  }

  clear(): void {
    this.cells.clear();
    this.positions.clear();
    this.idCells.clear();
  }
}

/** Scratch dùng chung giữa các lần gọi — tránh cấp phát trong vòng lặp render. */
const queryScratch = new Set<string>();
const cullFrustum = new THREE.Frustum();
const cullMatrix = new THREE.Matrix4();
const cullSphere = new THREE.Sphere();
const cullBox = new THREE.Box3();
const cullVec = new THREE.Vector3();

export function frustumCull(objects: THREE.Object3D[], camera: THREE.Camera): THREE.Object3D[] {
  return frustumCullInto(objects, camera, []);
}

/**
 * Frustum cull không cấp phát — ghi vào `out`. Bán kính culling lấy từ
 * bounding sphere thật của geometry khi có (chính xác hơn bán kính cứng),
 * tuỳ chọn `radiusOf` cho phép caller chỉ định bán kính riêng từng object.
 */
export function frustumCullInto(
  objects: THREE.Object3D[],
  camera: THREE.Camera,
  out: THREE.Object3D[],
  radiusOf?: (obj: THREE.Object3D) => number,
): THREE.Object3D[] {
  out.length = 0;
  cullMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  cullFrustum.setFromProjectionMatrix(cullMatrix);

  for (const obj of objects) {
    if (!obj.visible) continue;
    let radius = radiusOf?.(obj) ?? 2.0;
    if (radiusOf === undefined) {
      // Dùng bounding sphere thật nếu geometry đã tính — chính xác hơn ước tính 2.0.
      const mesh = obj as THREE.Mesh;
      const geometry = mesh.geometry as THREE.BufferGeometry | undefined;
      if (geometry?.boundingSphere) {
        // Bán kính world = bán kính local × scale lớn nhất.
        const s = Math.max(Math.abs(obj.scale.x), Math.abs(obj.scale.y), Math.abs(obj.scale.z), 1e-6);
        radius = geometry.boundingSphere.radius * s;
      }
    }
    cullSphere.set(obj.position, radius);
    if (cullFrustum.intersectsSphere(cullSphere)) {
      out.push(obj);
    }
  }
  return out;
}

/** Chuẩn bị bounding sphere cho danh sách mesh (gọi một lần sau khi nạp asset). */
export function precomputeBoundingSpheres(objects: THREE.Object3D[]): number {
  let computed = 0;
  for (const obj of objects) {
    const geometry = (obj as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
    if (geometry && !geometry.boundingSphere) {
      if (!geometry.attributes.position) continue;
      geometry.computeBoundingSphere();
      computed++;
    }
  }
  return computed;
}

/** Đếm số object còn hiển thị trong một hộp giới hạn (dùng cho LOD quyết định). */
export function countInBox(objects: THREE.Object3D[], box: THREE.Box3): number {
  let count = 0;
  for (const obj of objects) {
    if (!obj.visible) continue;
    if (box.containsPoint(cullVec.set(obj.position.x, obj.position.y, obj.position.z))) count++;
  }
  return count;
}

export function setupLevelOfDetail(root: THREE.Object3D, levels: LODLevel[]): THREE.LOD {
  return buildLOD(root, levels);
}
