// engine/src/combiner/socket-binder.ts — Gắn kết phụ kiện, vũ khí, áo giáp vào xương (Sockets)
import * as THREE from 'three';
import type { SocketBinding, Transform } from '../types/transform.types';

const warnCache = new Set<string>();
function warnOnce(key: string, msg: string): void {
  if (warnCache.has(key)) return;
  warnCache.add(key);
  console.warn('[socket-binder]', msg);
}

export function normalizeBoneName(name: string): string {
  let n = name.toLowerCase();
  const colon = n.lastIndexOf(':');
  if (colon >= 0) n = n.slice(colon + 1);
  n = n.replace(/[._\-\s()[\]]/g, '');
  n = n.replace(/right/g, 'r').replace(/left/g, 'l');
  return n;
}

export function findBone(rig: THREE.Object3D, name: string): THREE.Object3D | null {
  let exact: THREE.Object3D | null = null;
  if (rig.name === name) return rig;
  rig.traverse((o) => {
    if (exact || o === rig) return;
    if (o.name === name) exact = o;
  });
  if (exact) return exact;

  const target = normalizeBoneName(name);
  let fuzzy: THREE.Object3D | null = null;
  rig.traverse((o) => {
    if (fuzzy || o === rig) return;
    if (o.name && normalizeBoneName(o.name) === target) fuzzy = o;
  });
  return fuzzy;
}

export function listSockets(rig: THREE.Object3D): string[] {
  const bones: string[] = [];
  const named: string[] = [];
  rig.traverse((o) => {
    if (o === rig || !o.name) return;
    const isBone = (o as THREE.Bone).isBone === true;
    if (isBone) bones.push(o.name);
    else named.push(o.name);
  });
  return bones.length > 0 ? bones : named;
}

import type { SocketHandle } from '../types/combiner.types';
export type { SocketHandle };

function applyOffset(group: THREE.Group, offset?: Partial<Transform>): void {
  if (!offset) return;
  if (offset.position) group.position.set(offset.position.x ?? 0, offset.position.y ?? 0, offset.position.z ?? 0);
  if (offset.rotation) group.rotation.set(offset.rotation.x ?? 0, offset.rotation.y ?? 0, offset.rotation.z ?? 0);
  if (offset.scale !== undefined) {
    if (typeof offset.scale === 'number') group.scale.setScalar(offset.scale);
    else group.scale.set(offset.scale.x ?? 1, offset.scale.y ?? 1, offset.scale.z ?? 1);
  }
}

export class SocketBinder {
  private registry = new Map<string, SocketHandle>();
  private seq = 0;

  bind(rig: THREE.Object3D, binding: SocketBinding): SocketHandle | null {
    const bone = findBone(rig, binding.socket);
    if (!bone) {
      warnOnce(`missing:${binding.socket}`, `Không tìm thấy socket/bone "${binding.socket}" trên rig "${rig.name || rig.uuid}"`);
      return null;
    }
    const group = new THREE.Group();
    group.name = `socket_${binding.socket}_${binding.assetId}`;
    applyOffset(group, binding.offset);

    if (binding.scaleMultiplier && binding.scaleMultiplier !== 1) {
      group.scale.multiplyScalar(binding.scaleMultiplier);
    }

    const follow = binding.followBone !== false;
    if (follow) {
      bone.add(group);
    } else {
      bone.updateWorldMatrix(true, false);
      group.applyMatrix4(bone.matrixWorld);
      rig.add(group);
    }

    const handleId = `${binding.socket}_${++this.seq}`;
    const handle: SocketHandle = {
      id: handleId,
      socket: binding.socket,
      bone,
      group,
      binding: { ...binding, followBone: follow },
    };

    this.registry.set(this.makeKey(rig, handleId), handle);
    return handle;
  }

  attachAsset(handle: SocketHandle, asset: THREE.Object3D): void {
    handle.group.add(asset);
  }

  static attachToSocket(
    socketTarget: THREE.Object3D,
    attachment: THREE.Object3D,
    options: {
      position?: { x?: number; y?: number; z?: number } | [number, number, number];
      rotation?: { x?: number; y?: number; z?: number } | [number, number, number];
      scale?: { x?: number; y?: number; z?: number } | [number, number, number] | number;
      preserveWorldTransform?: boolean;
    } = {}
  ): void {
    if (options.preserveWorldTransform) {
      socketTarget.attach(attachment);
    } else {
      if (options.position) {
        if (Array.isArray(options.position)) {
          attachment.position.set(options.position[0], options.position[1], options.position[2]);
        } else {
          attachment.position.set(options.position.x ?? 0, options.position.y ?? 0, options.position.z ?? 0);
        }
      }
      if (options.rotation) {
        if (Array.isArray(options.rotation)) {
          attachment.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
        } else {
          attachment.rotation.set(options.rotation.x ?? 0, options.rotation.y ?? 0, options.rotation.z ?? 0);
        }
      }
      if (options.scale !== undefined) {
        if (typeof options.scale === 'number') {
          attachment.scale.setScalar(options.scale);
        } else if (Array.isArray(options.scale)) {
          attachment.scale.set(options.scale[0], options.scale[1], options.scale[2]);
        } else {
          attachment.scale.set(options.scale.x ?? 1, options.scale.y ?? 1, options.scale.z ?? 1);
        }
      }
      socketTarget.add(attachment);
    }
  }

  unbind(rig: THREE.Object3D, handleId: string): boolean {
    const key = this.makeKey(rig, handleId);
    const handle = this.registry.get(key);
    if (!handle) return false;

    handle.group.removeFromParent();
    while (handle.group.children.length > 0) {
      handle.group.children[0].removeFromParent();
    }
    this.registry.delete(key);
    return true;
  }

  unbindAll(rig: THREE.Object3D): void {
    const prefix = `${rig.uuid}|`;
    for (const [key, handle] of Array.from(this.registry.entries())) {
      if (key.startsWith(prefix)) {
        handle.group.removeFromParent();
        this.registry.delete(key);
      }
    }
  }

  getHandle(rig: THREE.Object3D, handleId: string): SocketHandle | undefined {
    return this.registry.get(this.makeKey(rig, handleId));
  }

  listBindings(rig: THREE.Object3D): SocketHandle[] {
    const prefix = `${rig.uuid}|`;
    const res: SocketHandle[] = [];
    for (const [key, handle] of this.registry.entries()) {
      if (key.startsWith(prefix)) res.push(handle);
    }
    return res;
  }

  private makeKey(rig: THREE.Object3D, id: string): string {
    return `${rig.uuid}|${id}`;
  }
}
