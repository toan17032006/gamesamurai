// engine/src/transformer/scaler.ts — Zoom assets 3D (OBJ, GLTF, FBX...), scale theo tỷ lệ, targetHeight, targetBox & anchor
import * as THREE from 'three';
import { computeBounds, invalidateBounds } from './bounds-calculator';
import type { ZoomSpec } from '../types/transform.types';

export interface ScaleOptions {
  targetHeight?: number;
  factor?: number;
}

export function applyScale(obj: THREE.Object3D, opts: ScaleOptions = {}): number {
  let factor = opts.factor ?? 1;

  if (opts.targetHeight !== undefined && opts.targetHeight > 0) {
    const bounds = computeBounds(obj);
    const height = bounds.height;
    if (height > 1e-6) factor = opts.targetHeight / height;
    else factor = 1;
  }

  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return 0;

  obj.scale.multiplyScalar(factor);
  invalidateBounds(obj);
  return factor;
}

export function zoomAsset(obj: THREE.Object3D, spec: ZoomSpec): number {
  const bounds = computeBounds(obj);
  let factor = spec.factor ?? 1;

  if (spec.targetHeight !== undefined && spec.targetHeight > 0) {
    if (bounds.height > 1e-6) {
      factor = spec.targetHeight / bounds.height;
    }
  } else if (spec.fitExtent !== undefined && spec.fitExtent > 0) {
    const maxDim = Math.max(bounds.width, bounds.height, bounds.depth);
    if (maxDim > 1e-6) {
      factor = spec.fitExtent / maxDim;
    }
  } else if (spec.targetBox) {
    const scaleX = bounds.width > 1e-6 ? spec.targetBox.x / bounds.width : 1;
    const scaleY = bounds.height > 1e-6 ? spec.targetBox.y / bounds.height : 1;
    const scaleZ = bounds.depth > 1e-6 ? spec.targetBox.z / bounds.depth : 1;
    obj.scale.x *= scaleX;
    obj.scale.y *= scaleY;
    obj.scale.z *= scaleZ;
    invalidateBounds(obj);
    return Math.max(scaleX, scaleY, scaleZ);
  }

  if (spec.scaleAxes) {
    obj.scale.x *= spec.scaleAxes.x;
    obj.scale.y *= spec.scaleAxes.y;
    obj.scale.z *= spec.scaleAxes.z;
    invalidateBounds(obj);
    return factor;
  }

  if (!Number.isFinite(factor) || factor <= 0) return 1;

  // Xử lý giữ nguyên anchor/pivot khi zoom
  if (spec.preservePivot || spec.anchorPoint) {
    const anchor = spec.anchorPoint ?? 'bottom';
    let anchorY = bounds.box.min[1];
    if (anchor === 'center') anchorY = (bounds.box.min[1] + bounds.box.max[1]) / 2;
    else if (anchor === 'top') anchorY = bounds.box.max[1];
    else if (typeof anchor === 'object') anchorY = anchor.y;

    const currentY = obj.position.y;
    const deltaY = (anchorY - currentY) * (factor - 1);
    obj.position.y -= deltaY;
  }

  obj.scale.multiplyScalar(factor);

  // Nếu yêu cầu nướng tỉ lệ thẳng vào geometry
  if (spec.bakeGeometry) {
    bakeScaleIntoGeometry(obj);
  }

  invalidateBounds(obj);
  return factor;
}

export function bakeScaleIntoGeometry(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      mesh.geometry.scale(mesh.scale.x, mesh.scale.y, mesh.scale.z);
      mesh.scale.set(1, 1, 1);
      if (mesh.geometry.attributes.normal) {
        mesh.geometry.computeVertexNormals();
      }
    }
  });
  invalidateBounds(root);
}

export function normalizeMaterials(root: THREE.Object3D): void {
  const seen = new Set<string>();
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat || seen.has(mat.uuid)) continue;
      seen.add(mat.uuid);
      normalizeOneMaterial(mat);
    }
  });
}

function normalizeOneMaterial(mat: THREE.Material): void {
  const props = mat as unknown as Record<string, unknown>;
  let changed = false;

  for (const key of ['metalness', 'roughness', 'opacity', 'emissiveIntensity', 'normalScale']) {
    const value = props[key];
    if (typeof value === 'number' && !Number.isFinite(value)) {
      props[key] = 1;
      changed = true;
    }
  }

  if ('envMapIntensity' in props && typeof props.envMapIntensity !== 'number') {
    props.envMapIntensity = 1;
    changed = true;
  }

  const color = props.color as THREE.Color | undefined;
  if (color && (!Number.isFinite(color.r) || !Number.isFinite(color.g) || !Number.isFinite(color.b))) {
    color.setRGB(1, 1, 1);
    changed = true;
  }

  if (changed) mat.needsUpdate = true;
}

export const Scaler = {
  applyScale: (obj: THREE.Object3D, targetHeight?: number, factor?: number) => {
    return applyScale(obj, { targetHeight, factor });
  },
  zoomAsset,
  bakeScaleIntoGeometry,
  normalizeMaterials,
  normalizeMeshScale: (obj: THREE.Object3D, targetHeight?: number) => applyScale(obj, { targetHeight }),
  sanitizeMaterialParams: normalizeMaterials,
};

