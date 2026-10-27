/**
 * @file world-streamer.ts
 * @module @aetheria/engine/open-world/world-streamer
 * @description Distance-driven streaming of world regions/chunks with
 * hysteresis, priorities, pinning, concurrency limits and retry support.
 *
 * Loaders are supplied per region and may be synchronous or asynchronous. The
 * streamer owns no rendering or I/O policy, which keeps it portable across
 * browser, worker and server runtimes.
 */

import type {
  StreamerCallbacks,
  StreamerConfig,
  StreamerStats,
  StreamRegion,
  StreamRegionView,
  StreamState,
  WorldPoint,
} from './types.js';

const DEFAULTS: Required<StreamerConfig> = {
  loadRadius: 200,
  unloadRadius: 250,
  maxConcurrentLoads: 2,
  maxLoadedRegions: 0,
  retryLimit: 2,
  autoUnload: true,
  planar: true,
};

interface RegionRecord<T> {
  id: string;
  source: StreamRegion<T>;
  center: WorldPoint;
  radius: number;
  priority: number;
  pinned: boolean;
  state: StreamState;
  payload: T | undefined;
  error: string | null;
  attempts: number;
  generation: number;
  lastStateChange: number;
}

interface Candidate<T> {
  record: RegionRecord<T>;
  distance: number;
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function copyPoint(point: WorldPoint): WorldPoint {
  return { x: finite(point.x, 0), y: finite(point.y, 0), z: finite(point.z, 0) };
}

function distanceBetween(a: WorldPoint, b: WorldPoint, planar: boolean): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return planar ? Math.hypot(dx, dz) : Math.hypot(dx, a.y - b.y, dz);
}

function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

/**
 * Loads and releases regions around a moving viewer. Loaded payloads are
 * opaque to the streamer; the region's `unload` callback (or the caller) owns
 * their disposal.
 */
export class WorldStreamer<T = unknown> {
  private readonly config: Required<StreamerConfig>;
  private readonly callbacks: StreamerCallbacks;
  private readonly regions = new Map<string, RegionRecord<T>>();
  private readonly pending = new Set<Promise<void>>();
  private idleResolvers: Array<() => void> = [];

  private viewer: WorldPoint | null = null;
  private time = 0;
  private totalLoads = 0;
  private totalUnloads = 0;
  private loadFailures = 0;
  private loadedThisFrame = 0;
  private unloadedThisFrame = 0;

  constructor(config: StreamerConfig = {}, callbacks: StreamerCallbacks = {}) {
    const loadRadius = Math.max(0, finite(config.loadRadius ?? DEFAULTS.loadRadius, DEFAULTS.loadRadius));
    this.config = {
      loadRadius,
      unloadRadius: Math.max(
        loadRadius,
        finite(config.unloadRadius ?? DEFAULTS.unloadRadius, Math.max(loadRadius, DEFAULTS.unloadRadius)),
      ),
      maxConcurrentLoads: Math.max(
        1,
        Math.floor(finite(config.maxConcurrentLoads ?? DEFAULTS.maxConcurrentLoads, DEFAULTS.maxConcurrentLoads)),
      ),
      maxLoadedRegions: Math.max(
        0,
        Math.floor(finite(config.maxLoadedRegions ?? DEFAULTS.maxLoadedRegions, DEFAULTS.maxLoadedRegions)),
      ),
      retryLimit: Math.max(
        0,
        Math.floor(finite(config.retryLimit ?? DEFAULTS.retryLimit, DEFAULTS.retryLimit)),
      ),
      autoUnload: config.autoUnload ?? DEFAULTS.autoUnload,
      planar: config.planar ?? DEFAULTS.planar,
    };
    this.callbacks = callbacks;
  }

  public get size(): number {
    return this.regions.size;
  }

  public get viewerPosition(): WorldPoint | null {
    return this.viewer ? { ...this.viewer } : null;
  }

  public get pendingCount(): number {
    return this.pending.size;
  }

  public get expectedLoadRadius(): number {
    return this.config.loadRadius;
  }

  public get expectedUnloadRadius(): number {
    return this.config.unloadRadius;
  }

  public has(id: string): boolean {
    return this.regions.has(id);
  }

  /** Register a region. Duplicate ids are rejected to keep payload ownership clear. */
  public add(region: StreamRegion<T>): StreamRegionView<T> {
    if (!region.id) throw new Error('WorldStreamer.add requires a non-empty id');
    if (this.regions.has(region.id)) {
      throw new Error(`WorldStreamer already contains region "${region.id}"`);
    }
    const record: RegionRecord<T> = {
      id: region.id,
      source: region,
      center: copyPoint(region.center),
      radius: Math.max(0, finite(region.radius ?? 0, 0)),
      priority: finite(region.priority ?? 0, 0),
      pinned: region.pinned ?? false,
      state: 'unloaded',
      payload: undefined,
      error: null,
      attempts: 0,
      generation: 0,
      lastStateChange: this.time,
    };
    this.regions.set(record.id, record);
    return this.view(record);
  }

  /** Register if missing, otherwise update the region's spatial description. */
  public upsert(region: StreamRegion<T>): StreamRegionView<T> {
    const existing = this.regions.get(region.id);
    if (!existing) return this.add(region);
    existing.source = region;
    existing.center = copyPoint(region.center);
    existing.radius = Math.max(0, finite(region.radius ?? 0, 0));
    existing.priority = finite(region.priority ?? 0, 0);
    existing.pinned = region.pinned ?? existing.pinned;
    return this.view(existing);
  }

  /**
   * Remove a region. A loaded payload is released through its `unload` hook; a
   * load that is still in flight is invalidated and its eventual payload is
   * released immediately.
   */
  public remove(id: string): boolean {
    const record = this.regions.get(id);
    if (!record) return false;
    record.generation++;
    if (record.state === 'loaded') this.release(record);
    this.regions.delete(id);
    return true;
  }

  public pin(id: string, pinned = true): boolean {
    const record = this.regions.get(id);
    if (!record) return false;
    record.pinned = pinned;
    return true;
  }

  public get(id: string): StreamRegionView<T> | undefined {
    const record = this.regions.get(id);
    return record ? this.view(record) : undefined;
  }

  public list(): StreamRegionView<T>[] {
    return Array.from(this.regions.values()).map((record) => this.view(record));
  }

  public setViewer(viewer: WorldPoint): void {
    this.viewer = copyPoint(viewer);
  }

  /**
   * Release far regions and start the nearest pending loads. Safe to call every
   * frame; in-flight loads are never started twice.
   */
  public update(viewer?: WorldPoint, dt = 0): StreamerStats {
    this.time += Math.max(0, finite(dt, 0));
    if (viewer) this.viewer = copyPoint(viewer);
    this.loadedThisFrame = 0;
    this.unloadedThisFrame = 0;

    if (this.viewer) {
      const distances = new Map<string, number>();
      for (const record of this.regions.values()) {
        distances.set(record.id, this.distanceTo(record));
      }

      if (this.config.autoUnload) {
        for (const record of this.regions.values()) {
          if (record.state !== 'loaded' || record.pinned) continue;
          const distance = distances.get(record.id) ?? Number.POSITIVE_INFINITY;
          if (distance > this.config.unloadRadius) this.release(record);
        }
      }

      if (this.config.maxLoadedRegions > 0) {
        const excess = Array.from(this.regions.values())
          .filter((record) => record.state === 'loaded' && !record.pinned)
          .sort((a, b) => {
            const da = distances.get(a.id) ?? 0;
            const db = distances.get(b.id) ?? 0;
            return db - da || a.id.localeCompare(b.id);
          });
        let loadedCount = this.countState('loaded') + this.countState('loading');
        for (const record of excess) {
          if (loadedCount <= this.config.maxLoadedRegions) break;
          const distance = distances.get(record.id) ?? 0;
          if (distance <= this.config.loadRadius) break;
          this.release(record);
          loadedCount--;
        }
      }

      const candidates: Array<Candidate<T>> = [];
      for (const record of this.regions.values()) {
        if (record.state === 'loaded' || record.state === 'loading') continue;
        if (record.state === 'failed' && record.attempts > this.config.retryLimit) continue;
        const distance = distances.get(record.id) ?? Number.POSITIVE_INFINITY;
        if (!record.pinned && distance > this.config.loadRadius) continue;
        candidates.push({ record, distance });
      }

      candidates.sort((a, b) => {
        if (a.record.pinned !== b.record.pinned) return a.record.pinned ? -1 : 1;
        if (a.distance !== b.distance) return a.distance - b.distance;
        if (a.record.priority !== b.record.priority) return b.record.priority - a.record.priority;
        return a.record.id.localeCompare(b.record.id);
      });

      for (const candidate of candidates) {
        if (this.pending.size >= this.config.maxConcurrentLoads) break;
        if (
          this.config.maxLoadedRegions > 0 &&
          this.countState('loaded') + this.countState('loading') >= this.config.maxLoadedRegions
        ) {
          break;
        }
        this.startLoad(candidate.record);
      }
    }

    return this.getStats();
  }

  /** Resolves when every in-flight load has settled. */
  public waitForIdle(): Promise<void> {
    if (this.pending.size === 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      this.idleResolvers.push(resolve);
    });
  }

  /** Alias for {@link waitForIdle}. */
  public flush(): Promise<void> {
    return this.waitForIdle();
  }

  public getStats(): StreamerStats {
    let loaded = 0;
    let loading = 0;
    let unloaded = 0;
    let failed = 0;
    for (const record of this.regions.values()) {
      switch (record.state) {
        case 'loaded':
          loaded++;
          break;
        case 'loading':
          loading++;
          break;
        case 'unloaded':
          unloaded++;
          break;
        case 'failed':
          failed++;
          break;
      }
    }
    return {
      totalRegions: this.regions.size,
      loaded,
      loading,
      unloaded,
      failed,
      pendingLoads: this.pending.size,
      loadedThisFrame: this.loadedThisFrame,
      unloadedThisFrame: this.unloadedThisFrame,
      totalLoads: this.totalLoads,
      totalUnloads: this.totalUnloads,
      loadFailures: this.loadFailures,
      lastViewer: this.viewer ? { ...this.viewer } : null,
      lastUpdateAt: this.time,
    };
  }

  /** Release every payload and forget all regions. */
  public clear(): void {
    for (const record of this.regions.values()) {
      record.generation++;
      if (record.state === 'loaded') this.release(record);
      else if (record.state === 'loading') {
        // The in-flight completion sees a stale generation and releases its payload.
        record.state = 'unloaded';
      }
    }
    this.regions.clear();
    this.viewer = null;
    this.loadedThisFrame = 0;
    this.unloadedThisFrame = 0;
  }

  private startLoad(record: RegionRecord<T>): void {
    const generation = ++record.generation;
    record.attempts++;
    record.error = null;
    this.setState(record, 'loading');
    const loader = record.source.load;

    if (!loader) {
      this.finishLoad(record, generation, undefined);
      return;
    }

    let result: T | Promise<T>;
    try {
      result = loader(record.source);
    } catch (error) {
      this.failLoad(record, generation, error);
      return;
    }

    if (!isPromiseLike(result)) {
      this.finishLoad(record, generation, result);
      return;
    }

    const task: Promise<void> = result
      .then((payload) => {
        this.finishLoad(record, generation, payload);
      })
      .catch((error: unknown) => {
        this.failLoad(record, generation, error);
      })
      .finally(() => {
        this.pending.delete(task);
        this.resolveIdleIfNeeded();
      });
    this.pending.add(task);
  }

  private finishLoad(record: RegionRecord<T>, generation: number, payload: T | undefined): void {
    if (record.generation !== generation || !this.regions.has(record.id)) {
      this.runUnload(record, payload, 'unload');
      return;
    }
    record.payload = payload;
    record.error = null;
    this.totalLoads++;
    this.loadedThisFrame++;
    this.setState(record, 'loaded');
    this.callbacks.onLoad?.(this.view(record), payload);
    this.resolveIdleIfNeeded();
  }

  private failLoad(record: RegionRecord<T>, generation: number, cause: unknown): void {
    if (record.generation !== generation || !this.regions.has(record.id)) return;
    const error = toError(cause);
    record.error = error.message;
    this.loadFailures++;
    this.setState(record, 'failed');
    this.callbacks.onError?.(this.view(record), error, 'load');
    this.resolveIdleIfNeeded();
  }

  private release(record: RegionRecord<T>): void {
    if (record.state !== 'loaded') return;
    const payload = record.payload;
    record.generation++;
    record.payload = undefined;
    record.error = null;
    this.totalUnloads++;
    this.unloadedThisFrame++;
    this.setState(record, 'unloaded');
    this.runUnload(record, payload, 'unload');
    this.callbacks.onUnload?.(this.view(record), payload);
  }

  private runUnload(
    record: RegionRecord<T>,
    payload: T | undefined,
    phase: 'unload',
  ): void {
    if (payload === undefined || !record.source.unload) return;
    try {
      record.source.unload(record.source, payload);
    } catch (cause) {
      this.callbacks.onError?.(this.view(record), toError(cause), phase);
    }
  }

  private setState(record: RegionRecord<T>, next: StreamState): void {
    const previous = record.state;
    if (previous === next) return;
    record.state = next;
    record.lastStateChange = this.time;
    this.callbacks.onStateChange?.(this.view(record), previous, next);
  }

  private resolveIdleIfNeeded(): void {
    if (this.pending.size > 0 || this.idleResolvers.length === 0) return;
    const resolvers = this.idleResolvers;
    this.idleResolvers = [];
    for (const resolve of resolvers) resolve();
  }

  private countState(state: StreamState): number {
    let count = 0;
    for (const record of this.regions.values()) {
      if (record.state === state) count++;
    }
    return count;
  }

  private distanceTo(record: RegionRecord<T>): number {
    if (!this.viewer) return Number.POSITIVE_INFINITY;
    const distance = distanceBetween(this.viewer, record.center, this.config.planar);
    return Math.max(0, distance - record.radius);
  }

  private view(record: RegionRecord<T>): StreamRegionView<T> {
    return {
      id: record.id,
      center: { ...record.center },
      radius: record.radius,
      priority: record.priority,
      pinned: record.pinned,
      kind: record.source.kind,
      metadata: { ...(record.source.metadata ?? {}) },
      state: record.state,
      payload: record.payload,
      error: record.error,
      attempts: record.attempts,
      pending: record.state === 'loading',
      lastStateChange: record.lastStateChange,
    };
  }
}

/** Convenience factory mirroring the engine's other create* helpers. */
export function createWorldStreamer<T = unknown>(
  config?: StreamerConfig,
  callbacks?: StreamerCallbacks,
): WorldStreamer<T> {
  return new WorldStreamer<T>(config, callbacks);
}
