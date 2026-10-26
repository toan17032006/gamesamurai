// engine/src/boot/boot-sequence.ts — Pipeline khởi động hệ thống phân tầng (staged bootloader)
import { EventBus } from '../core/events';

export interface BootStageContext {
  setProgress(value: number, message?: string): void;
  readonly stageName: string;
  readonly stageIndex: number;
  readonly signal: AbortSignal;
}

export interface BootStage {
  readonly name: string;
  run(ctx: BootStageContext): void | Promise<void>;
}

export interface BootProgress {
  readonly stage: string;
  readonly stageIndex: number;
  readonly totalStages: number;
  readonly stageProgress: number;
  readonly overall: number;
  readonly message: string;
}

export interface BootEvents {
  'stage:start': { name: string; index: number; total: number };
  'stage:progress': BootProgress;
  'stage:done': { name: string; index: number; durationMs: number };
  complete: { stages: number; durationMs: number };
  abort: { atStage: string; index: number };
  error: { stage: string; message: string };
}

export class BootError extends Error {
  constructor(
    readonly stage: string,
    readonly cause: unknown,
  ) {
    super(`Boot stage '${stage}' failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'BootError';
  }
}

export interface BootSequenceOptions {
  bus?: EventBus<BootEvents>;
}

function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

export class BootSequence {
  readonly bus: EventBus<BootEvents>;
  private stages: BootStage[];
  private abortController: AbortController | null = null;
  private _aborted = false;
  private _running = false;

  private constructor(stages: BootStage[], opts?: BootSequenceOptions) {
    this.stages = stages.slice();
    this.bus = opts?.bus ?? new EventBus<BootEvents>();
  }

  static create(stages: BootStage[], opts?: BootSequenceOptions): BootSequence {
    if (stages.length === 0) throw new Error('BootSequence.create: cần ít nhất 1 stage');
    return new BootSequence(stages, opts);
  }

  get isRunning(): boolean {
    return this._running;
  }

  get wasAborted(): boolean {
    return this._aborted;
  }

  abort(): void {
    this._aborted = true;
    this.abortController?.abort();
  }

  async run(onProgress?: (p: BootProgress) => void): Promise<boolean> {
    if (this._running) throw new Error('BootSequence.run: đang chạy');
    this._running = true;
    this._aborted = false;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const total = this.stages.length;
    const startedAt = now();
    let reachedIndex = 0;

    const unsubProgress = onProgress ? this.bus.on('stage:progress', onProgress) : () => undefined;

    try {
      for (let i = 0; i < total; i++) {
        if (signal.aborted || this._aborted) {
          this.bus.emit('abort', { atStage: this.stages[i].name, index: i });
          return false;
        }

        const stage = this.stages[i];
        reachedIndex = i;
        const stageStart = now();
        this.bus.emit('stage:start', { name: stage.name, index: i, total });

        let currentStageProgress = 0;
        const ctx: BootStageContext = {
          stageName: stage.name,
          stageIndex: i,
          signal,
          setProgress: (val: number, msg = '') => {
            currentStageProgress = Math.max(0, Math.min(1, val));
            const overall = (i + currentStageProgress) / total;
            this.bus.emit('stage:progress', {
              stage: stage.name,
              stageIndex: i,
              totalStages: total,
              stageProgress: currentStageProgress,
              overall,
              message: msg,
            });
          },
        };

        try {
          await stage.run(ctx);
        } catch (err) {
          if (signal.aborted || this._aborted) {
            this.bus.emit('abort', { atStage: stage.name, index: i });
            return false;
          }
          const msg = err instanceof Error ? err.message : String(err);
          this.bus.emit('error', { stage: stage.name, message: msg });
          throw new BootError(stage.name, err);
        }

        if (signal.aborted || this._aborted) {
          this.bus.emit('abort', { atStage: stage.name, index: i });
          return false;
        }

        const durationMs = now() - stageStart;
        this.bus.emit('stage:done', { name: stage.name, index: i, durationMs });
      }

      const totalDuration = now() - startedAt;
      this.bus.emit('complete', { stages: total, durationMs: totalDuration });
      return true;
    } finally {
      this._running = false;
      this.abortController = null;
      unsubProgress();
    }
  }
}
