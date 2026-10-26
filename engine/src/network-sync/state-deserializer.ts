// engine/src/network-sync/state-deserializer.ts — Giải mã gói tin mạng để tái tạo assets ở client khác
import * as THREE from 'three';
import type { EntityState, StatePacket } from './state-serializer';
import { POS_STEP, ROT_STEP } from './state-serializer';

const p = (n: number | undefined, fallback = 0) => (typeof n === 'number' && Number.isFinite(n) ? n : fallback);

export function deserializeEntity(packet: StatePacket): EntityState {
  return {
    assetId: packet.id,
    position: { x: p(packet.p[0]) * POS_STEP, y: p(packet.p[1]) * POS_STEP, z: p(packet.p[2]) * POS_STEP },
    rotation: {
      x: p(packet.r[0]) * ROT_STEP,
      y: p(packet.r[1]) * ROT_STEP,
      z: p(packet.r[2]) * ROT_STEP,
    },
    scale: { x: p(packet.s[0], 1), y: p(packet.s[1], 1), z: p(packet.s[2], 1) },
    data: packet.d ? [...packet.d] : undefined,
  };
}

export function applyPacketToObject3D(packet: StatePacket, obj: THREE.Object3D): void {
  const state = deserializeEntity(packet);
  obj.position.set(state.position.x, state.position.y, state.position.z);
  obj.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
  obj.scale.set(state.scale.x, state.scale.y, state.scale.z);
}

export function packetToObject3D(packet: StatePacket): THREE.Object3D {
  const obj = new THREE.Object3D();
  obj.name = packet.id;
  applyPacketToObject3D(packet, obj);
  return obj;
}
