/**
 * @file types.ts
 * @module @aetheria/engine/open-world/types
 * @description Contracts for population LOD scheduling and region streaming.
 *
 * Both managers are renderer-agnostic and deterministic: they operate on plain
 * data and callbacks, so they can run inside a game loop, a worker, or a
 * headless server simulation.
 */

/** Structural world point (y = height). */
export interface WorldPoint {
  x: number;
  y: number;
  z: number;
}

/** Simulation fidelity assigned to a population member. */
export type PopulationTier = 'full' | 'reduced' | 'minimal' | 'dormant';

/** Ordered from nearest to farthest. */
export const POPULATION_TIERS: readonly PopulationTier[] = [
  'full',
  'reduced',
  'minimal',
  'dormant',
];

/** Description of an object, NPC, animal or vehicle tracked by the population. */
export interface PopulationEntry {
  id: string;
  position: WorldPoint;
  /** Bounding radius used to soften distance calculations (default 0). */
  radius?: number;
  /** 0..1 priority; important actors update before filler when budgets are hit. */
  importance?: number;
  /** Force this tier instead of using distance-based assignment. */
  tier?: PopulationTier;
  /** Pinned actors ignore tier throttling and update on every frame. */
  pinned?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/** Live population record. */
export interface PopulationAgent {
  readonly id: string;
  position: WorldPoint;
  radius: number;
  importance: number;
  tier: PopulationTier;
  readonly forcedTier?: PopulationTier;
  pinned: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
  distance: number;
  lastUpdatedAt: number;
  lastDelta: number;
  updateCount: number;
  skippedCount: number;
}

/** Payload delivered to the update callback. */
export interface PopulationUpdate {
  id: string;
  tier: PopulationTier;
  /** Seconds simulated since this agent was last updated (or frame dt). */
  dt: number;
  distance: number;
  frame: number;
}

export interface PopulationCallbacks {
  onUpdate?: (agent: PopulationAgent, update: PopulationUpdate) => void;
  onTierChange?: (
    agent: PopulationAgent,
    previous: PopulationTier,
    next: PopulationTier,
  ) => void;
  onAdd?: (agent: PopulationAgent) => void;
  onRemove?: (agent: PopulationAgent) => void;
}

export interface PopulationConfig {
  /** Distance (world units) at which `full` ends (default 60). */
  fullDistance?: number;
  /** Distance at which `reduced` ends (default 140). */
  reducedDistance?: number;
  /** Distance at which `minimal` ends (default 260). */
  minimalDistance?: number;
  /** Update interval in seconds for reduced agents (default 0.2). */
  reducedInterval?: number;
  /** Update interval in seconds for minimal agents (default 1). */
  minimalInterval?: number;
  /** Update interval in seconds for dormant agents (default 5). */
  dormantInterval?: number;
  /** Max full-fidelity updates per frame (0 = unlimited, default 0). */
  maxFullUpdates?: number;
  /** Max reduced updates per frame (0 = unlimited, default 0). */
  maxReducedUpdates?: number;
  /** Max minimal updates per frame (0 = unlimited, default 0). */
  maxMinimalUpdates?: number;
  /** Max dormant updates per frame (default 4). */
  maxDormantUpdates?: number;
  /** Tier hysteresis as a fraction of the boundary (default 0.15). */
  tierHysteresis?: number;
  /** Soft per-frame time budget in ms (0 = unlimited, default 0). */
  frameBudgetMs?: number;
  /** Distance measured on the X/Z plane (default true). */
  planar?: boolean;
}

export interface PopulationStats {
  total: number;
  byTier: Record<PopulationTier, number>;
  updatedThisFrame: number;
  updatedByTier: Record<PopulationTier, number>;
  skippedThisFrame: number;
  budgetExhausted: boolean;
  totalUpdates: number;
  tierChanges: number;
  frame: number;
  elapsed: number;
  lastViewer: WorldPoint | null;
  lastDelta: number;
}

// ============================================================================
// Streaming
// ============================================================================

export type StreamState = 'unloaded' | 'loading' | 'loaded' | 'failed';

/** A streamable region, chunk, cell or POI. */
export interface StreamRegion<T = unknown> {
  id: string;
  center: WorldPoint;
  /** Horizontal radius of the region (default 0). */
  radius?: number;
  /** Higher values load before lower values at the same distance. */
  priority?: number;
  /** Pinned regions are never distance-unloaded. */
  pinned?: boolean;
  /** Optional adapter tag understood by the caller's loader. */
  kind?: string;
  metadata?: Record<string, unknown>;
  load?: (region: StreamRegion<T>) => Promise<T> | T;
  unload?: (region: StreamRegion<T>, payload: T) => void;
}

/** Read-only view of a streamed region's runtime state. */
export interface StreamRegionView<T = unknown> {
  id: string;
  center: WorldPoint;
  radius: number;
  priority: number;
  pinned: boolean;
  kind?: string;
  metadata: Record<string, unknown>;
  state: StreamState;
  payload: T | undefined;
  error: string | null;
  attempts: number;
  /** True while a load promise is in flight. */
  pending: boolean;
  lastStateChange: number;
}

export interface StreamerCallbacks {
  onLoad?: (region: StreamRegionView, payload: unknown) => void;
  onUnload?: (region: StreamRegionView, payload: unknown) => void;
  onError?: (
    region: StreamRegionView,
    error: Error,
    phase: 'load' | 'unload',
  ) => void;
  onStateChange?: (
    region: StreamRegionView,
    previous: StreamState,
    next: StreamState,
  ) => void;
}

export interface StreamerConfig {
  /** Regions closer than this are requested (default 200). */
  loadRadius?: number;
  /** Loaded regions beyond this distance are released (default loadRadius * 1.25). */
  unloadRadius?: number;
  /** Maximum simultaneous async loads (default 2). */
  maxConcurrentLoads?: number;
  /** Maximum retained regions; farthest non-pinned are released first (0 = unlimited). */
  maxLoadedRegions?: number;
  /** Load retries after a failure (default 2). */
  retryLimit?: number;
  /** Automatically release regions outside `unloadRadius` (default true). */
  autoUnload?: boolean;
  /** Distance measured on the X/Z plane (default true). */
  planar?: boolean;
}

export interface StreamerStats {
  totalRegions: number;
  loaded: number;
  loading: number;
  unloaded: number;
  failed: number;
  pendingLoads: number;
  loadedThisFrame: number;
  unloadedThisFrame: number;
  totalLoads: number;
  totalUnloads: number;
  loadFailures: number;
  lastViewer: WorldPoint | null;
  lastUpdateAt: number;
}
