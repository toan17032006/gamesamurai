// engine/src/core/loop.ts — Ticker & Game Loop với fixed timestep + variable render + FPS cap
import { clamp } from './math';

export interface TickerStats {
  fps: number;
  frameMs: number;
  ticks: number;
  frames: number;
}

export type RafFn = (cb: (time: number) => void) => () => void;
export type NowFn = () => number;

export interface TickerOptions {
  update: (dt: number, rawDt: number) => void;
  render?: (dt: number, rawDt: number) => void;
  fixedStep?: number;
  fpsCap?: number;
  background?: boolean;
  maxFrameTime?: number;
  maxStepsPerFrame?: number;
  raf?: RafFn;
  now?: NowFn;
}

export const MAX_FPS_CAP = 500;

function defaultNow(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function defaultRaf(cb: (time: number) => void): () => void {
  if (typeof requestAnimationFrame === 'function') {
    const id = requestAnimationFrame(cb);
    return () => cancelAnimationFrame(id);
  }
  const id = setTimeout(() => cb(defaultNow()), 1000 / 60);
  return () => clearTimeout(id);
}

export class Ticker {
  private opts: Required<
    Pick<TickerOptions, 'update' | 'fixedStep' | 'fpsCap' | 'background' | 'maxFrameTime' | 'maxStepsPerFrame'>
  > &
    TickerOptions;
  private raf: RafFn;
  private now: NowFn;
  private cancelRaf: (() => void) | null = null;
  private capAcc = 0;
  private stepAcc = 0;
  private lastTime = -1;
  private fpsEma = 0;
  private frameMsEma = 0;
  private _ticks = 0;
  private _frames = 0;
  private _running = false;
  private _paused = false;

  constructor(opts: TickerOptions) {
    const cap = opts.fpsCap ?? 0;
    this.opts = {
      ...opts,
      fixedStep: opts.fixedStep ?? 1 / 60,
      fpsCap: cap === 0 ? 0 : clamp(Math.round(cap), 1, MAX_FPS_CAP),
      background: opts.background ?? true,
      maxFrameTime: opts.maxFrameTime ?? 0.25,
      maxStepsPerFrame: opts.maxStepsPerFrame ?? 8,
    };
    this.raf = opts.raf ?? defaultRaf;
    this.now = opts.now ?? defaultNow;
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this.lastTime = -1;
    this.schedule();
  }

  stop(): void {
    this._running = false;
    this.cancelRaf?.();
    this.cancelRaf = null;
  }

  pause(): void {
    this._paused = true;
  }

  resume(): void {
    this._paused = false;
  }

  get isRunning(): boolean {
    return this._running;
  }

  get isPaused(): boolean {
    return this._paused;
  }

  get stats(): TickerStats {
    return {
      fps: Math.round(this.fpsEma * 10) / 10,
      frameMs: Math.round(this.frameMsEma * 100) / 100,
      ticks: this._ticks,
      frames: this._frames,
    };
  }

  setFpsCap(cap: number): void {
    this.opts.fpsCap = cap === 0 ? 0 : clamp(Math.round(cap), 1, MAX_FPS_CAP);
    this.capAcc = 0;
  }

  getFpsCap(): number {
    return this.opts.fpsCap;
  }

  private schedule(): void {
    if (!this._running) return;
    this.cancelRaf = this.raf((timestamp) => this.onFrame(timestamp));
  }

  private onFrame(timestamp: number): void {
    if (!this._running) return;
    this.schedule();

    if (this._paused) {
      this.lastTime = timestamp;
      return;
    }

    if (!this.opts.background && typeof document !== 'undefined' && document.hidden) {
      this.lastTime = timestamp;
      return;
    }

    if (this.lastTime < 0) {
      this.lastTime = timestamp;
      return;
    }

    const rawMs = timestamp - this.lastTime;
    this.lastTime = timestamp;
    if (rawMs <= 0) return;

    const rawDt = Math.min(rawMs / 1000, this.opts.maxFrameTime);

    // FPS cap accumulator
    if (this.opts.fpsCap > 0) {
      this.capAcc += rawDt;
      const targetFrame = 1 / this.opts.fpsCap;
      if (this.capAcc < targetFrame) return;
      this.capAcc = Math.min(this.capAcc - targetFrame, targetFrame);
    } else {
      this.capAcc = 0;
    }

    const t0 = this.now();

    // Fixed timestep update
    if (this.opts.fixedStep > 0) {
      this.stepAcc += rawDt;
      let steps = 0;
      while (this.stepAcc >= this.opts.fixedStep && steps < this.opts.maxStepsPerFrame) {
        this.opts.update(this.opts.fixedStep, rawDt);
        this.stepAcc -= this.opts.fixedStep;
        this._ticks++;
        steps++;
      }
      if (steps >= this.opts.maxStepsPerFrame) {
        this.stepAcc = 0;
      }
    } else {
      this.opts.update(rawDt, rawDt);
      this._ticks++;
    }

    // Render callback
    if (this.opts.render) {
      this.opts.render(rawDt, rawDt);
    }
    this._frames++;

    const workMs = this.now() - t0;
    const currentFps = rawDt > 0 ? 1 / rawDt : 0;
    const alpha = 0.1;
    this.fpsEma = this.fpsEma === 0 ? currentFps : this.fpsEma * (1 - alpha) + currentFps * alpha;
    this.frameMsEma = this.frameMsEma === 0 ? workMs : this.frameMsEma * (1 - alpha) + workMs * alpha;
  }
}
