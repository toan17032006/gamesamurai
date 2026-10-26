// engine/src/network-sync/delta-compressor.ts — Nén dữ liệu thay đổi (Delta compression) tối ưu băng thông
import { POS_STEP, ROT_STEP, SCALE_DECIMALS, type StatePacket } from './state-serializer';

export interface DeltaPacket {
  id: string;
  p?: number[];
  r?: number[];
  s?: number[];
  d?: number[];
}

function arrayEquals(a: number[] | undefined, b: number[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function compressDelta(prev: StatePacket, next: StatePacket): DeltaPacket | null {
  const delta: DeltaPacket = { id: next.id };
  let changed = false;

  if (!arrayEquals(prev.p, next.p)) {
    delta.p = next.p;
    changed = true;
  }
  if (!arrayEquals(prev.r, next.r)) {
    delta.r = next.r;
    changed = true;
  }
  if (!arrayEquals(prev.s, next.s)) {
    delta.s = next.s;
    changed = true;
  }
  if (!arrayEquals(prev.d, next.d)) {
    delta.d = next.d ? [...next.d] : undefined;
    changed = true;
  }

  return changed ? delta : null;
}

export function applyDelta(prev: StatePacket, delta: DeltaPacket): StatePacket {
  return {
    v: 1,
    id: delta.id || prev.id,
    p: delta.p ?? prev.p,
    r: delta.r ?? prev.r,
    s: delta.s ?? prev.s,
    d: delta.d ?? prev.d,
  };
}

export { POS_STEP, ROT_STEP, SCALE_DECIMALS };
