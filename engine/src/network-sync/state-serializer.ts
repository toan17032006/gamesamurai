// engine/src/network-sync/state-serializer.ts — Đóng gói trạng thái ghép nối, vị trí, scale thành gói tin
import type { Vec3 } from '../types/transform.types';

export const POS_STEP = 0.01; // mét (1 cm)
export const ROT_STEP = Math.PI / 180; // 1 độ (radian)
export const SCALE_DECIMALS = 2;

export interface EntityState {
  assetId: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  data?: number[];
}

export interface StatePacket {
  v: 1;
  id: string;
  p: number[];
  r: number[];
  s: number[];
  d?: number[];
}

const q = (value: number, step: number) => Math.round(value / step);
const round = (value: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
};

export function quantizePosition(v: Vec3): number[] {
  return [q(v.x, POS_STEP), q(v.y, POS_STEP), q(v.z, POS_STEP)];
}

export function quantizeRotation(v: Vec3): number[] {
  return [q(v.x, ROT_STEP), q(v.y, ROT_STEP), q(v.z, ROT_STEP)];
}

export function quantizeScale(v: Vec3): number[] {
  return [round(v.x, SCALE_DECIMALS), round(v.y, SCALE_DECIMALS), round(v.z, SCALE_DECIMALS)];
}

export function serializeEntity(entity: EntityState): StatePacket {
  const packet: StatePacket = {
    v: 1,
    id: entity.assetId,
    p: quantizePosition(entity.position),
    r: quantizeRotation(entity.rotation),
    s: quantizeScale(entity.scale),
  };
  if (entity.data && entity.data.length > 0) {
    packet.d = entity.data.map((n) => round(n, 3));
  }
  return packet;
}

export function serializeScale(scale: Vec3 | number): number[] {
  const v: Vec3 = typeof scale === 'number' ? { x: scale, y: scale, z: scale } : scale;
  return quantizeScale(v);
}
