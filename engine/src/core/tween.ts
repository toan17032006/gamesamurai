// engine/src/core/tween.ts — Tweening engine với easing functions, yoyo, loop
import { clamp } from './math';

export type Easing = (t: number) => number;

function clamp01(v: number): number {
  return clamp(v, 0, 1);
}

const c4 = (2 * Math.PI) / 3;
const n1 = 7.5625;
const d1 = 2.75;

export const Easings = {
  linear: (t: number): number => t,
  quadIn: (t: number): number => t * t,
  quadOut: (t: number): number => 1 - (1 - t) * (1 - t),
  quadInOut: (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  cubicIn: (t: number): number => t * t * t,
  cubicOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  cubicInOut: (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  elasticOut: (t: number): number =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1,
  bounceOut: (t: number): number => {
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
} as const;

export type EasingName = keyof typeof Easings;

export interface TweenConfig {
  from: number;
  to: number;
  duration: number;
  delay?: number;
  loop?: number;
  yoyo?: boolean;
  ease?: Easing | EasingName;
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

  update(dt: number): boolean {
    if (this.done) return true;
    if (this.delayLeft > 0) {
      this.delayLeft -= dt;
      if (this.delayLeft > 0) return false;
      dt = -this.delayLeft;
      this.delayLeft = 0;
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
    const easeFn = typeof cfg.ease === 'function' ? cfg.ease : Easings[cfg.ease ?? 'quadOut'];
    const easedT = easeFn(directedT);
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

  to(config: TweenConfig): Tween {
    const tw = new Tween(config);
    this.tweens.add(tw);
    return tw;
  }

  update(dt: number): void {
    if (this.tweens.size === 0) return;
    for (const tw of Array.from(this.tweens)) {
      if (tw.update(dt)) {
        this.tweens.delete(tw);
      }
    }
  }

  clear(): void {
    for (const tw of this.tweens) tw.stop();
    this.tweens.clear();
  }

  get count(): number {
    return this.tweens.size;
  }
}
