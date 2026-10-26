// engine/src/core/rng.ts — RNG xác định (deterministic) theo seed: mulberry32 + xxhash32

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function xxhash32(input: string, seed = 0): number {
  const PRIME1 = 0x9e3779b1;
  const PRIME2 = 0x85ebca77;
  const PRIME3 = 0xc2b2ae3d;
  const PRIME4 = 0x27d4eb2f;
  const PRIME5 = 0x165667b1;
  let h32 = (seed + PRIME5) >>> 0;
  for (let i = 0; i < input.length; i++) {
    h32 = (h32 + input.charCodeAt(i)) >>> 0;
    h32 = Math.imul(h32, PRIME1) >>> 0;
    h32 = (h32 ^ (h32 >>> 13)) >>> 0;
    h32 = Math.imul(h32, PRIME2) >>> 0;
    h32 = (h32 ^ (h32 >>> 16)) >>> 0;
  }
  h32 = Math.imul(h32 ^ (h32 >>> 15), PRIME2) >>> 0;
  h32 = Math.imul(h32 ^ (h32 >>> 13), PRIME3) >>> 0;
  return (h32 ^ (h32 >>> 16)) >>> 0;
}

export function hashSeed(input: string | number): number {
  return typeof input === 'number' ? input >>> 0 : xxhash32(input);
}

export function weightedIndex(rng: () => number, weights: readonly number[]): number {
  let total = 0;
  for (const w of weights) total += w > 0 ? w : 0;
  if (total <= 0) return -1;
  let roll = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] > 0 ? weights[i] : 0;
    roll -= w;
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

export function shuffle<T>(rng: () => number, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export class Random {
  private rng: () => number;

  constructor(seed: string | number) {
    this.rng = mulberry32(hashSeed(seed));
  }

  next(): number {
    return this.rng();
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.rng();
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  bool(p = 0.5): boolean {
    return this.rng() < p;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.rng() * items.length)];
  }

  weightedPick<T>(items: readonly T[], weight: (item: T) => number): T | undefined {
    const idx = weightedIndex(
      this.rng,
      items.map((it) => weight(it)),
    );
    return idx >= 0 ? items[idx] : undefined;
  }

  shuffle<T>(arr: T[]): T[] {
    return shuffle(this.rng, arr);
  }
}
