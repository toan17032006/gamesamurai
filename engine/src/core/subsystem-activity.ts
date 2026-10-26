/**
 * @file subsystem-activity.ts
 * @module @aetheria/engine/core/subsystem-activity
 * @description Per-instance activity tracking for subsystem methods.
 *
 * Several generated subsystem classes expose a broad API surface whose methods
 * used to be empty placeholders. They now record a deterministic activity event
 * on the owning instance, which keeps every call observable without introducing
 * shared global state or changing the public signatures.
 */

/** Immutable snapshot of one subsystem instance's activity. */
export interface SubsystemActivitySnapshot {
  readonly label: string;
  readonly calls: number;
  readonly lastAction: string;
  readonly lastAt: number;
  readonly actions: Readonly<Record<string, number>>;
}

/**
 * Per-object activity ledger. One instance is stored in a {@link WeakMap} for
 * each subsystem object, so two subsystems never share counters.
 */
export class SubsystemActivity {
  public readonly label: string;

  private calls = 0;
  private lastAction = 'idle';
  private lastAt = 0;
  private readonly actions = new Map<string, number>();

  constructor(label = 'subsystem') {
    this.label = label;
  }

  /** Record one successful subsystem call. */
  public record(action: string): void {
    const safeAction = action.trim() || 'unknown';
    this.calls++;
    this.lastAction = safeAction;
    this.lastAt = Date.now();
    this.actions.set(safeAction, (this.actions.get(safeAction) ?? 0) + 1);
  }

  /** Number of times a specific action has run. */
  public getActionCount(action: string): number {
    return this.actions.get(action) ?? 0;
  }

  /** Total number of recorded calls. */
  public getCallCount(): number {
    return this.calls;
  }

  /** Last recorded action name. */
  public getLastAction(): string {
    return this.lastAction;
  }

  /** Copy the current ledger into a plain, serializable snapshot. */
  public snapshot(): SubsystemActivitySnapshot {
    const actions: Record<string, number> = {};
    for (const key of Array.from(this.actions.keys()).sort()) {
      actions[key] = this.actions.get(key) ?? 0;
    }
    return {
      label: this.label,
      calls: this.calls,
      lastAction: this.lastAction,
      lastAt: this.lastAt,
      actions,
    };
  }

  /** Clear all recorded activity. */
  public reset(): void {
    this.calls = 0;
    this.lastAction = 'idle';
    this.lastAt = 0;
    this.actions.clear();
  }
}

const registry = new WeakMap<object, SubsystemActivity>();

/** Returns the activity ledger owned by one subsystem instance. */
export function activityFor(target: object, label = 'subsystem'): SubsystemActivity {
  let activity = registry.get(target);
  if (!activity) {
    activity = new SubsystemActivity(label);
    registry.set(target, activity);
  }
  return activity;
}

/** Record one action for an instance and return its activity snapshot. */
export function recordSubsystemAction(
  target: object,
  action: string,
  label = 'subsystem',
): SubsystemActivitySnapshot {
  const activity = activityFor(target, label);
  activity.record(action);
  return activity.snapshot();
}

/** Returns the current snapshot for an instance, or `undefined` if it is idle. */
export function getSubsystemActivity(target: object): SubsystemActivitySnapshot | undefined {
  return registry.get(target)?.snapshot();
}

/** Clears the activity ledger for one instance. */
export function resetSubsystemActivity(target: object): boolean {
  const activity = registry.get(target);
  if (!activity) return false;
  activity.reset();
  return true;
}
