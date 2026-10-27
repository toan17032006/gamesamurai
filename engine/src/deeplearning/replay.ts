/**
 * @file replay.ts
 * @module @aetheria/engine/deeplearning/replay
 * @description Bộ nhớ trải nghiệm (experience replay) tổng quát cho học tăng
 * cường. Hỗ trợ sức chứa cố định, lấy mẫu có seed, ưu tiên theo |TD error| và
 * ảnh chụp để lưu game.
 */

import { DeepRandom } from './random.js';

/** Một bước chuyển trạng thái. */
export interface Transition<TObservation, TAction> {
  state: TObservation;
  action: TAction;
  reward: number;
  nextState: TObservation;
  done: boolean;
  /** Sai số TD gần nhất — dùng cho prioritized replay. */
  priority?: number;
}

/** Ảnh chụp bộ nhớ. */
export interface ReplaySnapshot<TObservation, TAction> {
  capacity: number;
  items: Transition<TObservation, TAction>[];
  seedState: number;
}

/** Hàng đợi vòng có lấy mẫu ngẫu nhiên hoặc theo ưu tiên. */
export class ExperienceReplay<TObservation, TAction> {
  public readonly capacity: number;
  private readonly items: Transition<TObservation, TAction>[] = [];
  private cursor = 0;
  private readonly random: DeepRandom;
  /** Bộ đệm chỉ mục tái sử dụng cho lấy mẫu đều — không cấp phát mỗi lần gọi. */
  private indexPool: number[] = [];
  /** Tổng cộng dồn trọng số ưu tiên; `null` = cần dựng lại. */
  private cumulativePriorities: Float64Array | null = null;

  constructor(capacity = 10_000, seed: number | string = 1) {
    if (capacity <= 0) throw new RangeError('Sức chứa replay phải dương');
    this.capacity = Math.floor(capacity);
    this.random = new DeepRandom(seed);
  }

  /** Số mẫu hiện có. */
  public get size(): number {
    return this.items.length;
  }

  /** Đã đầy chưa. */
  public get isFull(): boolean {
    return this.items.length >= this.capacity;
  }

  /** Thêm một bước chuyển; ghi đè mẫu cũ nhất khi đầy. */
  public push(transition: Transition<TObservation, TAction>): void {
    const normalized: Transition<TObservation, TAction> = {
      ...transition,
      reward: Number.isFinite(transition.reward) ? transition.reward : 0,
      priority: Math.abs(transition.priority ?? 0),
    };
    if (this.items.length < this.capacity) {
      this.items.push(normalized);
    } else {
      this.items[this.cursor] = normalized;
      this.cursor = (this.cursor + 1) % this.capacity;
    }
    this.cumulativePriorities = null;
  }

  /** Thêm nhiều bước chuyển. */
  public pushMany(transitions: readonly Transition<TObservation, TAction>[]): void {
    for (const transition of transitions) this.push(transition);
  }

  /** Lấy mẫu đều — dùng partial Fisher–Yates trên pool tái sử dụng, O(batch). */
  public sample(batchSize: number): Transition<TObservation, TAction>[] {
    if (this.items.length === 0 || batchSize <= 0) return [];
    const count = Math.min(Math.floor(batchSize), this.items.length);
    if (this.indexPool.length !== this.items.length) {
      this.indexPool = Array.from({ length: this.items.length }, (_, index) => index);
    }
    // Xáo trộn chỉ `count` phần tử đầu — đủ để lấy mẫu mà không xáo toàn mảng.
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(this.random.next() * (this.indexPool.length - i));
      const tmp = this.indexPool[i];
      this.indexPool[i] = this.indexPool[j];
      this.indexPool[j] = tmp;
    }
    const result: Transition<TObservation, TAction>[] = new Array(count);
    for (let i = 0; i < count; i++) result[i] = this.items[this.indexPool[i]];
    return result;
  }

  /** Lấy mẫu theo ưu tiên với prefix-sum nhị phân — O(n log n) thay O(n²). */
  public samplePrioritized(batchSize: number, alpha = 0.6): Transition<TObservation, TAction>[] {
    if (this.items.length === 0 || batchSize <= 0) return [];
    const count = Math.min(Math.floor(batchSize), this.items.length);
    const cumulative = this.ensureCumulativePriorities(alpha);
    const total = cumulative[cumulative.length - 1];
    const chosen: Transition<TObservation, TAction>[] = new Array(count);
    for (let n = 0; n < count; n++) {
      const roll = this.random.next() * total;
      // Tìm kiếm nhị phân chỉ số đầu tiên có prefix > roll.
      let low = 0;
      let high = cumulative.length - 1;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (cumulative[mid] > roll) high = mid;
        else low = mid + 1;
      }
      chosen[n] = this.items[low];
    }
    return chosen;
  }

  /** Dựng (nếu cần) mảng tổng cộng dồn trọng số ưu tiên^alpha. */
  private ensureCumulativePriorities(alpha: number): Float64Array {
    if (this.cumulativePriorities && this.cumulativePriorities.length === this.items.length) {
      return this.cumulativePriorities;
    }
    const cumulative = new Float64Array(this.items.length);
    let running = 0;
    for (let i = 0; i < this.items.length; i++) {
      running += Math.max(1e-6, (this.items[i].priority ?? 0) + 1e-3) ** alpha;
      cumulative[i] = running;
    }
    this.cumulativePriorities = cumulative;
    return cumulative;
  }

  /**
   * Buộc dựng lại cây ưu tiên ở lần lấy mẫu kế tiếp.
   *
   * Trainer ưu tiên thường cập nhật `priority` trực tiếp trên transition nhận từ
   * `samplePrioritized`; khi đó prefix-sum đã cache không còn đúng và cần gọi
   * hàm này sau khi cập nhật.
   */
  public refreshPriorities(): void {
    this.cumulativePriorities = null;
  }

  /** Cập nhật ưu tiên của một mẫu (theo tham chiếu hoặc theo chỉ số). */
  public updatePriority(index: number, priority: number): boolean {
    const item = this.items[index];
    if (!item) return false;
    item.priority = Math.abs(Number.isFinite(priority) ? priority : 0);
    this.cumulativePriorities = null;
    return true;
  }

  /** Các mẫu gần nhất (mới nhất ở cuối). */
  public latest(limit = 10): Transition<TObservation, TAction>[] {
    return this.items.slice(Math.max(0, this.items.length - Math.max(0, limit)));
  }

  /** Xoá toàn bộ. */
  public clear(): void {
    this.items.length = 0;
    this.cursor = 0;
    this.cumulativePriorities = null;
  }

  /** Ảnh chụp trạng thái. */
  public snapshot(): ReplaySnapshot<TObservation, TAction> {
    return {
      capacity: this.capacity,
      items: this.items.map((item) => ({ ...item })),
      seedState: this.random.getState(),
    };
  }

  /** Khôi phục từ ảnh chụp. */
  public static fromSnapshot<TObservation, TAction>(
    snapshot: ReplaySnapshot<TObservation, TAction>,
  ): ExperienceReplay<TObservation, TAction> {
    const replay = new ExperienceReplay<TObservation, TAction>(snapshot.capacity, snapshot.seedState);
    replay.pushMany(snapshot.items);
    return replay;
  }
}
