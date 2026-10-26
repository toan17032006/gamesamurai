// engine/src/behavior/behavior-random.ts — Số ngẫu nhiên có seed cho mô phỏng hành vi
//
// Trước đây toàn bộ module Hành Vi dùng `Math.random()` trực tiếp (~110 chỗ).
// Hệ quả trong engine 3D có `network-sync`:
//   • mô phỏng **không tái lập được** — chạy lại cùng một kịch bản cho kết quả khác,
//   • không thể replay hay rollback,
//   • test không ổn định (giá trị đổi mỗi lần chạy).
//
// Nay dùng PRNG mulberry32 có seed. `setBehaviorSeed(seed)` cho phép game chạy
// lại đúng một kịch bản; `behaviorRandomFor(label)` tạo luồng riêng cho từng
// subsystem nên thứ tự gọi ở subsystem khác không ảnh hưởng tới luồng này.

/** Hàm băm chuỗi → số nguyên 32 bit (FNV-1a). */
export function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * PRNG mulberry32 — nhanh, chu kỳ 2³², chất lượng đủ cho mô phỏng gameplay.
 */
export class BehaviorRandom {
  private state: number;

  constructor(seed: number | string = 0x9e3779b9) {
    this.state = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1;
  }

  /** Số thực trong [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Số thực trong [min, max). */
  float(min = 0, max = 1): number {
    return min + this.next() * (max - min);
  }

  /** Số nguyên trong [min, max] (bao gồm cả hai đầu). */
  int(min: number, max: number): number {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  /** Xác suất `p` (0..1) xảy ra. */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Chọn 1 phần tử ngẫu nhiên trong mảng (trả về `undefined` nếu rỗng). */
  pick<T>(items: readonly T[]): T | undefined {
    if (!items || items.length === 0) return undefined;
    return items[this.int(0, items.length - 1)];
  }

  /** Phân phối chuẩn (Box–Muller), cắt tại ±3σ. */
  gaussian(mean = 0, standardDeviation = 1): number {
    const u = Math.max(1e-12, this.next());
    const v = this.next();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + standardDeviation * Math.max(-3, Math.min(3, z));
  }

  /** Trộn (Fisher–Yates) — trả về mảng MỚI, không sửa mảng gốc. */
  shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  /** Tạo luồng con độc lập từ luồng hiện tại (dùng cho subsystem). */
  fork(label: string): BehaviorRandom {
    return new BehaviorRandom((hashString(label) ^ this.state) >>> 0);
  }

  /** Đặt lại về một seed cụ thể. */
  reseed(seed: number | string): void {
    this.state = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1;
  }

  /** Seed hiện tại (để lưu/snapshot). */
  getSeed(): number {
    return this.state >>> 0;
  }
}

/** Seed mặc định của engine. */
export const DEFAULT_BEHAVIOR_SEED = 0x9e3779b9;

let globalSeed: number = DEFAULT_BEHAVIOR_SEED;
let globalRandom = new BehaviorRandom(globalSeed);
const streams = new Map<string, BehaviorRandom>();

/** Đặt seed toàn cục cho toàn bộ mô phỏng hành vi. */
export function setBehaviorSeed(seed: number | string): number {
  globalSeed = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  globalRandom = new BehaviorRandom(globalSeed);
  streams.clear();
  return globalSeed;
}

/** Seed toàn cục hiện tại. */
export function getBehaviorSeed(): number {
  return globalSeed;
}

/** Đặt lại toàn bộ luồng ngẫu nhiên về seed hiện tại. */
export function resetBehaviorRandom(seed?: number | string): void {
  if (seed !== undefined) setBehaviorSeed(seed);
  else {
    globalRandom = new BehaviorRandom(globalSeed);
    streams.clear();
  }
}

/** Luồng ngẫu nhiên toàn cục. */
export function getBehaviorRandom(): BehaviorRandom {
  return globalRandom;
}

/**
 * Luồng ngẫu nhiên riêng theo nhãn (ví dụ tên subsystem).
 * Luồng của nhãn A không bị ảnh hưởng bởi số lần gọi ở nhãn B.
 */
export function behaviorRandomFor(label: string): BehaviorRandom {
  let stream = streams.get(label);
  if (!stream) {
    stream = globalRandom.fork(label);
    streams.set(label, stream);
  }
  return stream;
}

/** Số thực trong [0,1) từ luồng toàn cục. */
export function behaviorRandomFloat(min = 0, max = 1): number {
  return globalRandom.float(min, max);
}

/** Xác suất `p` từ luồng toàn cục. */
export function behaviorRandomChance(p: number): boolean {
  return globalRandom.chance(p);
}

/** Chọn 1 phần tử từ luồng toàn cục. */
export function behaviorRandomPick<T>(items: readonly T[]): T | undefined {
  return globalRandom.pick(items);
}
