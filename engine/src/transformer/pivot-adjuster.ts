// engine/src/transformer/pivot-adjuster.ts — Dời điểm tâm (Pivot point / Anchor) của mô hình
import * as THREE from 'three';
import type { PivotSpec } from '../types/transform.types';
import { invalidateBounds } from './bounds-calculator';

const PIVOT_RESTORE_KEY = '__enginePivotRestore';

interface PivotRestore {
  position: THREE.Vector3;
}

export function applyPivot(obj: THREE.Object3D, spec: PivotSpec): THREE.Object3D {
  if (spec.mode === 'origin') return obj;

  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj);
  if (!box.isEmpty()) {
    box.applyMatrix4(new THREE.Matrix4().copy(obj.matrixWorld).invert());
  }
  if (box.isEmpty()) return obj;

  let shift: THREE.Vector3;
  switch (spec.mode) {
    case 'bottom':
      shift = new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2);
      break;
    case 'center':
      shift = new THREE.Vector3(
        (box.min.x + box.max.x) / 2,
        (box.min.y + box.max.y) / 2,
        (box.min.z + box.max.z) / 2,
      );
      break;
    case 'top':
      shift = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2);
      break;
    case 'custom': {
      const c = spec.custom;
      shift = new THREE.Vector3(c?.x ?? 0, c?.y ?? 0, c?.z ?? 0);
      break;
    }
    default:
      return obj;
  }

  if (spec.bakeIntoGeometry) {
    obj.traverse((child) => {
      const m = child as THREE.Mesh;
      if (m.isMesh && m.geometry) {
        m.geometry.translate(-shift.x, -shift.y, -shift.z);
      }
    });
    invalidateBounds(obj);
    return obj;
  }

  (obj as unknown as Record<string, unknown>)[PIVOT_RESTORE_KEY] = {
    position: obj.position.clone(),
  } satisfies PivotRestore;

  const wrapper = new THREE.Group();
  wrapper.name = `${obj.name || 'object'}_pivot`;
  wrapper.position.copy(obj.position);
  wrapper.quaternion.copy(obj.quaternion);
  wrapper.scale.copy(obj.scale);

  const parent = obj.parent;
  if (parent) {
    const index = parent.children.indexOf(obj);
    parent.children.splice(index === -1 ? parent.children.length : index, 1, wrapper);
    obj.parent = null;
    wrapper.parent = parent;
  }

  obj.position.sub(shift);
  wrapper.add(obj);
  return wrapper;
}

export function unwrapPivot(wrapper: THREE.Object3D): THREE.Object3D | null {
  const inner = wrapper.children.find(
    (c) => (c as unknown as Record<string, unknown>)[PIVOT_RESTORE_KEY] !== undefined,
  );
  if (!inner) return null;
  const restore = (inner as unknown as Record<string, unknown>)[PIVOT_RESTORE_KEY] as PivotRestore;
  delete (inner as unknown as Record<string, unknown>)[PIVOT_RESTORE_KEY];
  inner.position.copy(restore.position);

  const parent = wrapper.parent;
  wrapper.remove(inner);
  if (parent) {
    const index = parent.children.indexOf(wrapper);
    parent.children.splice(index === -1 ? parent.children.length : index, 1, inner);
    inner.parent = parent;
  }
  return inner;
}

export function restorePivot(wrapper: THREE.Object3D): THREE.Object3D | null {
  return unwrapPivot(wrapper);
}

export function createPivotOffset(obj: THREE.Object3D, modeOrOffset: PivotSpec['mode'] | [number, number, number]): THREE.Object3D {
  if (Array.isArray(modeOrOffset)) {
    return applyPivot(obj, { mode: 'custom', custom: { x: modeOrOffset[0], y: modeOrOffset[1], z: modeOrOffset[2] } });
  }
  return applyPivot(obj, { mode: modeOrOffset });
}

export const PivotAdjuster = {
  apply: applyPivot,
  applyPivot,
  restorePivot,
  createPivotOffset,
  unwrapPivot,
  adjustPivotToCenterOfMass,
  adjustPivotToBottomCenter,
  createTransformChain,
};

// ============================================================================
// Enhanced Type-Safe & Fluent Transform Chain Operations
// ============================================================================

import { EngineResult, engineOk, engineErr, TransformChain } from '../types/engine.types.js';

export function applyPivotResult(
  obj: THREE.Object3D,
  spec: PivotSpec
): EngineResult<THREE.Object3D> {
  try {
    const result = applyPivot(obj, spec);
    return engineOk(result, { mode: spec.mode });
  } catch (err: any) {
    return engineErr({
      code: 'PIVOT_APPLY_FAILED',
      message: `Failed to apply pivot: ${err.message}`,
      subsystem: 'PivotAdjuster',
      stack: err.stack
    });
  }
}

export function adjustPivotToCenterOfMass(obj: THREE.Object3D): EngineResult<THREE.Object3D> {
  return applyPivotResult(obj, { mode: 'center', bakeIntoGeometry: true });
}

export function adjustPivotToBottomCenter(obj: THREE.Object3D): EngineResult<THREE.Object3D> {
  return applyPivotResult(obj, { mode: 'bottom', bakeIntoGeometry: true });
}

export function createTransformChain(obj: THREE.Object3D): TransformChain<THREE.Object3D> {
  return {
    target: obj,
    translate(x: number, y: number, z: number) {
      obj.position.x += x;
      obj.position.y += y;
      obj.position.z += z;
      return this;
    },
    rotate(yaw: number, pitch: number, roll: number) {
      obj.rotation.x += pitch;
      obj.rotation.y += yaw;
      obj.rotation.z += roll;
      return this;
    },
    scale(factor: number) {
      obj.scale.multiplyScalar(factor);
      return this;
    },
    setPivot(pivotX: number, pivotY: number, pivotZ: number) {
      applyPivot(obj, { mode: 'custom', custom: { x: pivotX, y: pivotY, z: pivotZ }, bakeIntoGeometry: true });
      return this;
    },
    apply() {
      obj.updateMatrixWorld(true);
      return obj;
    }
  };
}


