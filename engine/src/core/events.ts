// engine/src/core/events.ts — Type-safe EventBus cho hệ thống engine

export type EventMap = object;

export type EventHandler<T> = (payload: T) => void;

export class EventBus<M extends EventMap = Record<string, unknown>> {
  private handlers = new Map<string, Set<EventHandler<never>>>();

  on<K extends keyof M & string>(type: K, fn: EventHandler<M[K]>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(fn as EventHandler<never>);
    return () => this.off(type, fn);
  }

  off<K extends keyof M & string>(type: K, fn: EventHandler<M[K]>): void {
    const set = this.handlers.get(type);
    if (!set) return;
    set.delete(fn as EventHandler<never>);
    if (set.size === 0) this.handlers.delete(type);
  }

  once<K extends keyof M & string>(type: K, fn: EventHandler<M[K]>): () => void {
    const off = this.on(type, (payload) => {
      off();
      fn(payload);
    });
    return off;
  }

  emit<K extends keyof M & string>(type: K, payload: M[K]): void {
    const set = this.handlers.get(type);
    if (!set || set.size === 0) return;
    for (const fn of Array.from(set)) {
      (fn as EventHandler<M[K]>)(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }

  listenerCount<K extends keyof M & string>(type: K): number {
    return this.handlers.get(type)?.size ?? 0;
  }
}
