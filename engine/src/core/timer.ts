// engine/src/core/timer.ts — Timer, Interval & Stopwatch hỗ trợ fixed update trong engine

export interface TimerTask {
  id: string;
  delay: number;
  elapsed: number;
  repeat: boolean;
  callback: () => void;
  cancelled: boolean;
}

export class Timer {
  private tasks = new Map<string, TimerTask>();
  private nextId = 1;

  after(seconds: number, fn: () => void): string {
    const id = `timer_${this.nextId++}`;
    this.tasks.set(id, {
      id,
      delay: Math.max(0, seconds),
      elapsed: 0,
      repeat: false,
      callback: fn,
      cancelled: false,
    });
    return id;
  }

  every(seconds: number, fn: () => void): string {
    const id = `timer_${this.nextId++}`;
    this.tasks.set(id, {
      id,
      delay: Math.max(0.001, seconds),
      elapsed: 0,
      repeat: true,
      callback: fn,
      cancelled: false,
    });
    return id;
  }

  cancel(id: string): void {
    const t = this.tasks.get(id);
    if (t) {
      t.cancelled = true;
      this.tasks.delete(id);
    }
  }

  clear(): void {
    for (const t of this.tasks.values()) t.cancelled = true;
    this.tasks.clear();
  }

  update(dt: number): void {
    if (this.tasks.size === 0) return;
    for (const [id, task] of Array.from(this.tasks.entries())) {
      if (task.cancelled) {
        this.tasks.delete(id);
        continue;
      }
      task.elapsed += dt;
      if (task.elapsed >= task.delay) {
        try {
          task.callback();
        } catch (err) {
          console.error(`Timer error on task ${id}:`, err);
        }
        if (task.repeat && !task.cancelled) {
          task.elapsed -= task.delay;
        } else {
          this.tasks.delete(id);
        }
      }
    }
  }

  get count(): number {
    return this.tasks.size;
  }
}
