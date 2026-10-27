// engine/src/core/tween.ts — Tweening engine: easing đầy đủ, registry tuỳ biến,
// yoyo, loop, timeScale, pause/resume và vòng update không cấp phát lại mảng.
import { clamp } from './math';

export type Easing = (t: number) => number;

function clamp01(v: number): number {
  return clamp(v, 0, 1);
}

const c1 = 1.70158;
const c3 = c1 + 1;
const c4 = (2 * Math.PI) / 3;
const c5 = (2 * Math.PI) / 4.5;
const n1 = 7.5625;
const d1 = 2.75;

/** Đầy đủ họ easing chuẩn (linear, power, sine, expo, circ, back, elastic, bounce). */
export const Easings = {
  linear: (t: number): number => t,
  quadIn: (t: number): number => t * t,
  quadOut: (t: number): number => 1 - (1 - t) * (1 - t),
  quadInOut: (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  cubicIn: (t: number): number => t * t * t,
  cubicOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  cubicInOut: (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sineIn: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),
  sineOut: (t: number): number => Math.sin((t * Math.PI) / 2),
  sineInOut: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
  expoIn: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  expoOut: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  expoInOut: (t: number): number =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  circIn: (t: number): number => 1 - Math.sqrt(1 - t * t),
  circOut: (t: number): number => Math.sqrt(1 - Math.pow(t - 1, 2)),
  circInOut: (t: number): number =>
    t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  backIn: (t: number): number => c3 * t * t * t - c1 * t * t,
  backOut: (t: number): number => 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2),
  backInOut: (t: number): number =>
    t < 0.5
      ? (Math.pow(2 * t, 2) * ((c1 + 1) * 2 * t - c1)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c1 + 1) * (t * 2 - 2) + c1) + 2) / 2,
  elasticIn: (t: number): number =>
    t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c5),
  elasticOut: (t: number): number =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1,
  elasticInOut: (t: number): number =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1,
  bounceOut: (t: number): number => {
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  bounceIn: (t: number): number => 1 - Easings.bounceOut(1 - t),
  bounceInOut: (t: number): number =>
    t < 0.5 ? (1 - Easings.bounceOut(1 - 2 * t)) / 2 : (1 + Easings.bounceOut(2 * t - 1)) / 2,
} as const;

export type EasingName = keyof typeof Easings;

/** Registry easing tuỳ biến — game có thể đăng thêm easing riêng của mình. */
const customEasings = new Map<string, Easing>();

/** Đăng ký một easing tuỳ biến (ghi đè nếu trùng tên). */
export function registerEasing(name: string, easing: Easing): void {
  customEasings.set(name, easing);
}

/** Bỏ một easing tuỳ biến. */
export function unregisterEasing(name: string): boolean {
  return customEasings.delete(name);
}

/** Giải tên easing thành hàm: ưu tiên registry tuỳ biến, sau đó họ chuẩn. */
export function resolveEasing(ease: Easing | EasingName | string | undefined): Easing {
  if (typeof ease === 'function') return ease;
  if (ease !== undefined) {
    const custom = customEasings.get(ease);
    if (custom) return custom;
    const builtin = (Easings as Record<string, Easing | undefined>)[ease];
    if (builtin) return builtin;
  }
  return Easings.quadOut;
}

export interface TweenConfig {
  from: number;
  to: number;
  duration: number;
  delay?: number;
  loop?: number;
  yoyo?: boolean;
  ease?: Easing | EasingName;
  /** Tốc độ phát (1 = bình thường, 2 = nhanh gấp đôi, 0 = đứng). */
  timeScale?: number;
  onUpdate?: (value: number, t: number) => void;
  onComplete?: () => void;
}

export class Tween {
  readonly config: Required<Pick<TweenConfig, 'from' | 'to' | 'duration'>> & TweenConfig;
  loopsDone = 0;
  private elapsed = 0;
  private delayLeft: number;
  private direction = 1;
  private done = false;
  private paused = false;

  constructor(config: TweenConfig) {
    this.config = {
      ...config,
      duration: Math.max(1e-6, config.duration),
      loop: config.loop ?? 1,
    };
    this.delayLeft = Math.max(0, config.delay ?? 0);
  }

  get finished(): boolean {
    return this.done;
  }

  get progress(): number {
    return clamp01(this.elapsed / this.config.duration);
  }

  /** Tạm dừng — update không tiêu thời gian. */
  pause(): void {
    this.paused = true;
  }

  /** Tiếp tục sau khi tạm dừng. */
  resume(): void {
    this.paused = false;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  update(dt: number): boolean {
    if (this.done) return true;
    if (this.paused) return false;
    const scaled = dt * (this.config.timeScale ?? 1);
    if (scaled === 0) return false;
    if (this.delayLeft > 0) {
      this.delayLeft -= scaled;
      if (this.delayLeft > 0) return false;
      dt = -this.delayLeft;
      this.delayLeft = 0;
    } else {
      dt = scaled;
    }

    const cfg = this.config;
    this.elapsed += dt;

    let guard = 0;
    while (this.elapsed >= cfg.duration && !this.done && guard++ < 10000) {
      this.elapsed -= cfg.duration;
      this.loopsDone++;
      const finishedLoopForward = this.direction > 0;
      if (cfg.yoyo) this.direction = -this.direction;
      if (this.loopsDone >= (cfg.loop ?? 1)) {
        this.done = true;
        const finalVal = finishedLoopForward ? cfg.to : cfg.from;
        cfg.onUpdate?.(finalVal, 1);
        cfg.onComplete?.();
        return true;
      }
    }

    if (this.done) return true;

    const rawT = clamp01(this.elapsed / cfg.duration);
    const directedT = this.direction > 0 ? rawT : 1 - rawT;
    const easedT = resolveEasing(cfg.ease)(directedT);
    const value = cfg.from + (cfg.to - cfg.from) * easedT;
    cfg.onUpdate?.(value, easedT);
    return false;
  }

  stop(): void {
    this.done = true;
  }
}

export class Tweener {
  private tweens: Set<Tween> = new Set();
  /** Bộ đệm tái sử dụng cho vòng update — không cấp phát mỗi frame. */
  private finishedBuffer: Tween[] = [];

  to(config: TweenConfig): Tween {
    const tw = new Tween(config);
    this.tweens.add(tw);
    return tw;
  }

  /** Bỏ một tween đang chạy. */
  kill(tween: Tween): void {
    tween.stop();
    this.tweens.delete(tween);
  }

  update(dt: number): void {
    if (this.tweens.size === 0) return;
    const finished = this.finishedBuffer;
    finished.length = 0;
    for (const tw of this.tweens) {
      if (tw.update(dt)) finished.push(tw);
    }
    for (let i = 0; i < finished.length; i++) this.tweens.delete(finished[i]);
  }

  clear(): void {
    for (const tw of this.tweens) tw.stop();
    this.tweens.clear();
  }

  get count(): number {
    return this.tweens.size;
  }
}
