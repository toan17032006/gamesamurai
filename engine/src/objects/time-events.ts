/**
 * @file time-events.ts
 * @module @aetheria/engine/objects/time-events
 * @description In-game clocks, day/night cycles, seasons, cooldown timers, and event dispatchers.
 */

export type TimeOfDayPhase = 'dawn' | 'noon' | 'dusk' | 'midnight';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export interface GameTimestamp {
  hour: number;
  minute: number;
  day: number;
  month: number;
  year: number;
}

/**
 * In-game Game Clock managing time progression, day-night cycles, and phases.
 */
export class GameClock {
  public hour = 8;
  public minute = 0;
  public day = 1;
  public month = 1;
  public year = 1;
  public timeScale = 60; // 1 real second = 60 game seconds (1 real min = 1 game hr)

  public onHourPassed?: (clock: GameTimestamp) => void;
  public onDayPassed?: (clock: GameTimestamp) => void;

  constructor(initialHour = 8, timeScale = 60) {
    this.hour = initialHour;
    this.timeScale = timeScale;
  }

  public advance(realDeltaSeconds: number): void {
    const gameSeconds = realDeltaSeconds * this.timeScale;
    const addMinutes = gameSeconds / 60;
    this.minute += addMinutes;

    while (this.minute >= 60) {
      this.minute -= 60;
      this.hour++;
      this.onHourPassed?.(this.getTimestamp());

      if (this.hour >= 24) {
        this.hour -= 24;
        this.day++;
        this.onDayPassed?.(this.getTimestamp());

        if (this.day > 30) {
          this.day = 1;
          this.month++;
          if (this.month > 12) {
            this.month = 1;
            this.year++;
          }
        }
      }
    }
  }

  public setTime(hour: number, minute = 0): void {
    this.hour = Math.max(0, Math.min(23, hour));
    this.minute = Math.max(0, Math.min(59, minute));
  }

  public getPhase(): TimeOfDayPhase {
    if (this.hour >= 5 && this.hour < 9) return 'dawn';
    if (this.hour >= 9 && this.hour < 17) return 'noon';
    if (this.hour >= 17 && this.hour < 21) return 'dusk';
    return 'midnight';
  }

  public get isNight(): boolean {
    return this.hour < 6 || this.hour >= 20;
  }

  public getTimestamp(): GameTimestamp {
    return {
      hour: Math.floor(this.hour),
      minute: Math.floor(this.minute),
      day: this.day,
      month: this.month,
      year: this.year,
    };
  }

  public get formattedTime(): string {
    const h = String(Math.floor(this.hour)).padStart(2, '0');
    const m = String(Math.floor(this.minute)).padStart(2, '0');
    return `${h}:${m}`;
  }
}

/**
 * Seasonal progression impacting weather, vegetation, and temperatures.
 */
export class SeasonManager {
  public currentSeason: SeasonType = 'spring';
  public dayOfSeason = 1;
  public daysPerSeason = 30;

  public onSeasonChangeCallbacks: ((newSeason: SeasonType) => void)[] = [];

  constructor(initialSeason: SeasonType = 'spring', daysPerSeason = 30) {
    this.currentSeason = initialSeason;
    this.daysPerSeason = daysPerSeason;
  }

  public advanceDay(): void {
    this.dayOfSeason++;
    if (this.dayOfSeason > this.daysPerSeason) {
      this.dayOfSeason = 1;
      this._transitionToNextSeason();
    }
  }

  private _transitionToNextSeason(): void {
    const seasons: SeasonType[] = ['spring', 'summer', 'autumn', 'winter'];
    const idx = seasons.indexOf(this.currentSeason);
    this.currentSeason = seasons[(idx + 1) % seasons.length];

    for (const cb of this.onSeasonChangeCallbacks) {
      cb(this.currentSeason);
    }
  }

  public getTemperatureModifier(): number {
    switch (this.currentSeason) {
      case 'summer':
        return 10.0;
      case 'winter':
        return -15.0;
      case 'autumn':
        return -2.0;
      case 'spring':
      default:
        return 0.0;
    }
  }
}

/**
 * Cooldown Timer tracking active action cooldowns across arbitrary keys.
 */
export class CooldownTimer<TKey extends string = string> {
  private _durations: Map<TKey, number> = new Map();
  private _remaining: Map<TKey, number> = new Map();

  public setCooldown(key: TKey, durationSeconds: number): void {
    this._durations.set(key, durationSeconds);
    this._remaining.set(key, durationSeconds);
  }

  public isReady(key: TKey): boolean {
    return (this._remaining.get(key) ?? 0) <= 0;
  }

  public getRemaining(key: TKey): number {
    return Math.max(0, this._remaining.get(key) ?? 0);
  }

  public getPercent(key: TKey): number {
    const dur = this._durations.get(key) ?? 0;
    if (dur <= 0) return 0;
    return this.getRemaining(key) / dur;
  }

  public reset(key: TKey): void {
    this._remaining.delete(key);
  }

  public tick(dt: number): void {
    for (const [key, rem] of this._remaining.entries()) {
      const next = rem - dt;
      if (next <= 0) {
        this._remaining.delete(key);
      } else {
        this._remaining.set(key, next);
      }
    }
  }
}

/**
 * Cancellable Game Event wrapper.
 */
export class GameEvent<TPayload = unknown> {
  public readonly name: string;
  public readonly timestamp: number;
  public payload: TPayload;
  public isCancelled = false;

  constructor(name: string, payload: TPayload) {
    this.name = name;
    this.payload = payload;
    this.timestamp = Date.now();
  }

  public cancel(): void {
    this.isCancelled = true;
  }
}

/**
 * Strongly typed Event Dispatcher pub/sub system.
 */
export class EventDispatcher<TEventMap extends Record<string, unknown> = Record<string, unknown>> {
  private _listeners: Map<string, Set<(payload: never) => void>> = new Map();

  public on<K extends keyof TEventMap>(
    event: K,
    listener: (payload: TEventMap[K]) => void
  ): () => void {
    const key = String(event);
    const set = this._listeners.get(key) ?? new Set();
    set.add(listener);
    this._listeners.set(key, set);

    return () => {
      this.off(event, listener);
    };
  }

  public off<K extends keyof TEventMap>(
    event: K,
    listener: (payload: TEventMap[K]) => void
  ): void {
    const key = String(event);
    const set = this._listeners.get(key);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        this._listeners.delete(key);
      }
    }
  }

  public emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
    const key = String(event);
    const set = this._listeners.get(key);
    if (set) {
      for (const listener of set) {
        (listener as unknown as (payload: TEventMap[K]) => void)(payload);
      }
    }
  }

  public clear(): void {
    this._listeners.clear();
  }
}

/**
 * Scheduled Task Manager supporting one-off delays and repeating timers.
 */
export class ScheduledTaskManager<TContext = unknown> {
  private _tasks: Map<
    string,
    {
      delay: number;
      elapsed: number;
      repeat: boolean;
      fn: (ctx: TContext) => void;
    }
  > = new Map();

  public schedule(
    id: string,
    delaySeconds: number,
    taskFn: (ctx: TContext) => void,
    repeat = false
  ): void {
    this._tasks.set(id, {
      delay: delaySeconds,
      elapsed: 0,
      repeat,
      fn: taskFn,
    });
  }

  public cancel(id: string): boolean {
    return this._tasks.delete(id);
  }

  public tick(dt: number, ctx: TContext): void {
    for (const [id, task] of this._tasks.entries()) {
      task.elapsed += dt;
      if (task.elapsed >= task.delay) {
        task.fn(ctx);
        if (task.repeat) {
          task.elapsed = 0;
        } else {
          this._tasks.delete(id);
        }
      }
    }
  }
}
