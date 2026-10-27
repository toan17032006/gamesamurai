/**
 * @file random.ts
 * @module @aetheria/engine/deeplearning/random
 * @description Bộ sinh số giả ngẫu nhiên tất định dùng cho khởi tạo trọng số,
 * chọn hành động epsilon-greedy và lấy mẫu replay. Không dùng `Math.random()`
 * để mọi lần huấn luyện có cùng seed cho kết quả giống nhau.
 */

/** PRNG Mulberry32 — nhanh, chu kỳ 2³², đủ tốt cho mô phỏng game. */
export class DeepRandom {
  private state: number;

  constructor(seed: number | string = 0x9e3779b9) {
    this.state = (typeof seed === 'string' ? hashSeed(seed) : seed) >>> 0 || 0x6d2b79f5;
  }

  /** Giá trị kế tiếp trong `[0, 1)`. */
  public next(): number {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Số thực trong `[min, max)`. */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Số nguyên trong `[min, max]`. */
  public int(min: number, max: number): number {
    if (max < min) return min;
    return Math.floor(this.range(min, max + 1));
  }

  /** Xác suất `chance` (0..1). */
  public chance(probability: number): boolean {
    return this.next() < clamp01(probability);
  }

  /** Chọn một phần tử; trả `undefined` nếu mảng rỗng. */
  public pick<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) return undefined;
    return items[this.int(0, items.length - 1)];
  }

  /** Lấy mẫu Gaussian (Box–Muller) với giá trị trung bình `mean`, độ lệch `stdDev`. */
  public gaussian(mean = 0, stdDev = 1): number {
    const u = Math.max(this.next(), Number.EPSILON);
    const v = this.next();
    return mean + Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * stdDev;
  }

  /** Lấy mẫu Poisson bằng thuật toán Knuth cho `lambda` nhỏ, xấp xỉ Gaussian cho lớn. */
  public poisson(lambda: number): number {
    const rate = Math.max(0, lambda);
    if (rate === 0) return 0;
    if (rate > 30) return Math.max(0, Math.round(this.gaussian(rate, Math.sqrt(rate))));
    const limit = Math.exp(-rate);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= this.next();
    } while (p > limit);
    return k - 1;
  }

  /** Thời gian chờ theo phân phối mũ (dùng cho sự kiện ngẫu nhiên). */
  public exponential(rate: number): number {
    const r = Math.max(this.next(), Number.EPSILON);
    return -Math.log(r) / Math.max(rate, Number.EPSILON);
  }

  /** Xáo trộn Fisher–Yates tại chỗ, trả về chính mảng. */
  public shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }

  /** Trạng thái nội bộ (dùng để lưu/khôi phục replay). */
  public getState(): number {
    return this.state >>> 0;
  }

  /** Khôi phục trạng thái đã lưu. */
  public setState(state: number): this {
    this.state = state >>> 0 || 0x6d2b79f5;
    return this;
  }
}

/** Băm chuỗi thành số nguyên 32 bit (FNV-1a). */
export function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Kẹp giá trị vào `[0, 1]`. */
export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Kẹp giá trị vào `[min, max]`. */
export function clampRange(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
