/**
 * @file population-manager.ts
 * @module @aetheria/engine/open-world/population-manager
 * @description Distance-based population LOD with time-sliced update budgets.
 *
 * A crowd of 10,000 NPCs can be registered once; every frame the manager
 * assigns each actor a fidelity tier, then invokes only the updates that fit the
 * frame budget. Round-robin ordering guarantees that low-priority actors still
 * receive simulation time instead of starving behind the nearest ones.
 */

import {
  POPULATION_TIERS,
  type PopulationAgent,
  type PopulationCallbacks,
  type PopulationConfig,
  type PopulationEntry,
  type PopulationStats,
  type PopulationTier,
  type PopulationUpdate,
  type WorldPoint,
} from './types.js';

const DEFAULTS: Required<PopulationConfig> = {
  fullDistance: 60,
  reducedDistance: 140,
  minimalDistance: 260,
  reducedInterval: 0.2,
  minimalInterval: 1,
  dormantInterval: 5,
  maxFullUpdates: 0,
  maxReducedUpdates: 0,
  maxMinimalUpdates: 0,
  maxDormantUpdates: 4,
  tierHysteresis: 0.15,
  frameBudgetMs: 0,
  planar: true,
};

interface AgentRecord extends Omit<PopulationAgent, 'forcedTier'> {
  forcedTier?: PopulationTier;
  nextUpdateAt: number;
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function copyPoint(point: WorldPoint): WorldPoint {
  return { x: finite(point.x, 0), y: finite(point.y, 0), z: finite(point.z, 0) };
}

function distanceBetween(a: WorldPoint, b: WorldPoint, planar: boolean): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  if (planar) return Math.hypot(dx, dz);
  return Math.hypot(dx, a.y - b.y, dz);
}

function tierIndex(tier: PopulationTier): number {
  return POPULATION_TIERS.indexOf(tier);
}

function emptyTierCounts(): Record<PopulationTier, number> {
  return { full: 0, reduced: 0, minimal: 0, dormant: 0 };
}

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Owns the population and decides which actors receive simulation time. */
export class PopulationManager {
  private readonly config: Required<PopulationConfig>;
  private readonly callbacks: PopulationCallbacks;
  private readonly agents = new Map<string, AgentRecord>();

  private time = 0;
  private frame = 0;
  private totalUpdates = 0;
  private tierChanges = 0;
  private lastViewer: WorldPoint | null = null;
  private lastDelta = 0;
  private lastStats: PopulationStats = {
    total: 0,
    byTier: emptyTierCounts(),
    updatedThisFrame: 0,
    updatedByTier: emptyTierCounts(),
    skippedThisFrame: 0,
    budgetExhausted: false,
    totalUpdates: 0,
    tierChanges: 0,
    frame: 0,
    elapsed: 0,
    lastViewer: null,
    lastDelta: 0,
  };

  constructor(config: PopulationConfig = {}, callbacks: PopulationCallbacks = {}) {
    this.config = {
      fullDistance: Math.max(0, finite(config.fullDistance ?? DEFAULTS.fullDistance, DEFAULTS.fullDistance)),
      reducedDistance: Math.max(0, finite(config.reducedDistance ?? DEFAULTS.reducedDistance, DEFAULTS.reducedDistance)),
      minimalDistance: Math.max(0, finite(config.minimalDistance ?? DEFAULTS.minimalDistance, DEFAULTS.minimalDistance)),
      reducedInterval: Math.max(0, finite(config.reducedInterval ?? DEFAULTS.reducedInterval, DEFAULTS.reducedInterval)),
      minimalInterval: Math.max(0, finite(config.minimalInterval ?? DEFAULTS.minimalInterval, DEFAULTS.minimalInterval)),
      dormantInterval: Math.max(0, finite(config.dormantInterval ?? DEFAULTS.dormantInterval, DEFAULTS.dormantInterval)),
      maxFullUpdates: Math.max(0, Math.floor(finite(config.maxFullUpdates ?? DEFAULTS.maxFullUpdates, DEFAULTS.maxFullUpdates))),
      maxReducedUpdates: Math.max(0, Math.floor(finite(config.maxReducedUpdates ?? DEFAULTS.maxReducedUpdates, DEFAULTS.maxReducedUpdates))),
      maxMinimalUpdates: Math.max(0, Math.floor(finite(config.maxMinimalUpdates ?? DEFAULTS.maxMinimalUpdates, DEFAULTS.maxMinimalUpdates))),
      maxDormantUpdates: Math.max(0, Math.floor(finite(config.maxDormantUpdates ?? DEFAULTS.maxDormantUpdates, DEFAULTS.maxDormantUpdates))),
      tierHysteresis: clamp(finite(config.tierHysteresis ?? DEFAULTS.tierHysteresis, DEFAULTS.tierHysteresis), 0, 1),
      frameBudgetMs: Math.max(0, finite(config.frameBudgetMs ?? DEFAULTS.frameBudgetMs, DEFAULTS.frameBudgetMs)),
      planar: config.planar ?? DEFAULTS.planar,
    };
    // Keep the distance bands monotonic even if a caller passes them out of order.
    this.config.reducedDistance = Math.max(this.config.fullDistance, this.config.reducedDistance);
    this.config.minimalDistance = Math.max(this.config.reducedDistance, this.config.minimalDistance);
    this.callbacks = callbacks;
  }

  public get size(): number {
    return this.agents.size;
  }

  public get elapsed(): number {
    return this.time;
  }

  public get frameIndex(): number {
    return this.frame;
  }

  public has(id: string): boolean {
    return this.agents.has(id);
  }

  /** Register a new actor. Duplicate ids are rejected to protect identity. */
  public add(entry: PopulationEntry): PopulationAgent {
    if (!entry.id) throw new Error('PopulationManager.add requires a non-empty id');
    if (this.agents.has(entry.id)) {
      throw new Error(`PopulationManager already contains agent "${entry.id}"`);
    }
    const tier = this.validTier(entry.tier) ?? 'dormant';
    const agent: AgentRecord = {
      id: entry.id,
      position: copyPoint(entry.position),
      radius: Math.max(0, finite(entry.radius ?? 0, 0)),
      importance: clamp(finite(entry.importance ?? 0.5, 0.5), 0, 1),
      tier,
      forcedTier: this.validTier(entry.tier),
      pinned: entry.pinned ?? false,
      tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
      metadata: { ...(entry.metadata ?? {}) },
      distance: Number.POSITIVE_INFINITY,
      lastUpdatedAt: this.time,
      lastDelta: 0,
      updateCount: 0,
      skippedCount: 0,
      nextUpdateAt: this.time,
    };
    this.agents.set(agent.id, agent);
    this.callbacks.onAdd?.(agent);
    return this.copyAgent(agent);
  }

  /** Register if missing, otherwise update the existing record's position. */
  public upsert(entry: PopulationEntry): PopulationAgent {
    if (!this.agents.has(entry.id)) return this.add(entry);
    this.setPosition(entry.id, entry.position);
    if (entry.radius !== undefined) this.agents.get(entry.id)!.radius = Math.max(0, entry.radius);
    if (entry.importance !== undefined) {
      this.agents.get(entry.id)!.importance = clamp(entry.importance, 0, 1);
    }
    if (entry.pinned !== undefined) this.agents.get(entry.id)!.pinned = entry.pinned;
    if (entry.tier !== undefined) this.setTier(entry.id, entry.tier);
    return this.get(entry.id)!;
  }

  public remove(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    this.agents.delete(id);
    this.callbacks.onRemove?.(agent);
    return true;
  }

  public clear(): void {
    for (const agent of Array.from(this.agents.values())) {
      this.agents.delete(agent.id);
      this.callbacks.onRemove?.(agent);
    }
    this.time = 0;
    this.frame = 0;
    this.totalUpdates = 0;
    this.tierChanges = 0;
    this.lastStats = {
      total: 0,
      byTier: emptyTierCounts(),
      updatedThisFrame: 0,
      updatedByTier: emptyTierCounts(),
      skippedThisFrame: 0,
      budgetExhausted: false,
      totalUpdates: 0,
      tierChanges: 0,
      frame: 0,
      elapsed: 0,
      lastViewer: null,
      lastDelta: 0,
    };
  }

  public get(id: string): PopulationAgent | undefined {
    const agent = this.agents.get(id);
    return agent ? this.copyAgent(agent) : undefined;
  }

  public list(): PopulationAgent[] {
    return Array.from(this.agents.values()).map((agent) => this.copyAgent(agent));
  }

  public setPosition(id: string, position: WorldPoint): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.position = copyPoint(position);
    return true;
  }

  public setImportance(id: string, importance: number): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.importance = clamp(finite(importance, 0), 0, 1);
    return true;
  }

  public setPinned(id: string, pinned = true): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.pinned = pinned;
    return true;
  }

  /** Force a tier (`null` returns the actor to distance-based assignment). */
  public setTier(id: string, tier: PopulationTier | null): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    if (tier === null) {
      agent.forcedTier = undefined;
      agent.nextUpdateAt = this.time;
      return true;
    }
    const validated = this.validTier(tier);
    if (!validated) throw new Error(`Unknown population tier "${String(tier)}"`);
    agent.forcedTier = validated;
    agent.tier = validated;
    agent.nextUpdateAt = this.time;
    return true;
  }

  public setTags(id: string, tags: readonly string[]): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.tags = [...tags];
    return true;
  }

  /** Agents within `radius` of `center`, nearest first. */
  public queryRadius(
    center: WorldPoint,
    radius: number,
    options: { maxTier?: PopulationTier; tier?: PopulationTier } = {},
  ): PopulationAgent[] {
    const maxIndex = options.maxTier ? tierIndex(options.maxTier) : POPULATION_TIERS.length - 1;
    const wanted = options.tier;
    const results: Array<{ agent: AgentRecord; distance: number }> = [];
    for (const agent of this.agents.values()) {
      if (wanted && agent.tier !== wanted) continue;
      if (tierIndex(agent.tier) > maxIndex) continue;
      const distance = distanceBetween(center, agent.position, this.config.planar);
      if (distance <= radius + agent.radius) results.push({ agent, distance });
    }
    results.sort((a, b) => a.distance - b.distance || a.agent.id.localeCompare(b.agent.id));
    return results.map((entry) => this.copyAgent(entry.agent));
  }

  /**
   * Advance the population. `viewer` is normally the camera or player position;
   * `dt` is the frame delta in seconds.
   */
  public update(viewer: WorldPoint, dt: number): PopulationStats {
    const delta = Math.max(0, finite(dt, 0));
    this.time += delta;
    this.frame++;
    this.lastDelta = delta;
    this.lastViewer = copyPoint(viewer);

    const all = Array.from(this.agents.values());
    const byTier = emptyTierCounts();
    for (const agent of all) {
      const distance = Math.max(
        0,
        distanceBetween(viewer, agent.position, this.config.planar) - agent.radius,
      );
      agent.distance = distance;
      const nextTier = this.resolveTier(agent, distance);
      if (nextTier !== agent.tier) {
        const previous = agent.tier;
        agent.tier = nextTier;
        agent.nextUpdateAt = this.time;
        this.tierChanges++;
        this.callbacks.onTierChange?.(agent, previous, nextTier);
      }
      byTier[agent.tier]++;
    }

    const due = all.filter((agent) => this.time + 1e-9 >= agent.nextUpdateAt);
    due.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const tierDiff = tierIndex(a.tier) - tierIndex(b.tier);
      if (tierDiff !== 0) return tierDiff;
      if (a.lastUpdatedAt !== b.lastUpdatedAt) return a.lastUpdatedAt - b.lastUpdatedAt;
      if (a.importance !== b.importance) return b.importance - a.importance;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.id.localeCompare(b.id);
    });

    const updatedByTier = emptyTierCounts();
    const budgetedByTier = emptyTierCounts();
    let updated = 0;
    let budgetExhausted = false;
    const started = this.config.frameBudgetMs > 0 ? nowMs() : 0;

    for (const agent of due) {
      const cap = this.capFor(agent.tier);
      if (!agent.pinned && cap > 0 && budgetedByTier[agent.tier] >= cap) continue;
      if (
        this.config.frameBudgetMs > 0 &&
        updated > 0 &&
        nowMs() - started >= this.config.frameBudgetMs
      ) {
        budgetExhausted = true;
        break;
      }

      const elapsed = Math.max(0, this.time - agent.lastUpdatedAt);
      const effectiveDelta = agent.lastUpdatedAt === 0 ? delta : elapsed;
      agent.lastUpdatedAt = this.time;
      agent.lastDelta = effectiveDelta;
      agent.updateCount++;
      agent.nextUpdateAt = this.time + this.intervalFor(agent);
      updated++;
      updatedByTier[agent.tier]++;
      if (!agent.pinned) budgetedByTier[agent.tier]++;

      const update: PopulationUpdate = {
        id: agent.id,
        tier: agent.tier,
        dt: effectiveDelta,
        distance: agent.distance,
        frame: this.frame,
      };
      this.callbacks.onUpdate?.(agent, update);
    }

    this.totalUpdates += updated;
    this.lastStats = {
      total: all.length,
      byTier,
      updatedThisFrame: updated,
      updatedByTier,
      skippedThisFrame: Math.max(0, all.length - updated),
      budgetExhausted,
      totalUpdates: this.totalUpdates,
      tierChanges: this.tierChanges,
      frame: this.frame,
      elapsed: this.time,
      lastViewer: { ...this.lastViewer },
      lastDelta: delta,
    };
    return this.copyStats(this.lastStats);
  }

  public getStats(): PopulationStats {
    const byTier = emptyTierCounts();
    for (const agent of this.agents.values()) {
      byTier[agent.tier]++;
    }
    return this.copyStats({ ...this.lastStats, total: this.agents.size, byTier });
  }

  /** Drop every actor (returns the number removed). */
  public clearAgents(): number {
    const count = this.agents.size;
    this.clear();
    return count;
  }

  private capFor(tier: PopulationTier): number {
    switch (tier) {
      case 'full':
        return this.config.maxFullUpdates;
      case 'reduced':
        return this.config.maxReducedUpdates;
      case 'minimal':
        return this.config.maxMinimalUpdates;
      case 'dormant':
        return this.config.maxDormantUpdates;
    }
  }

  private intervalFor(agent: AgentRecord): number {
    if (agent.pinned) return 0;
    switch (agent.tier) {
      case 'full':
        return 0;
      case 'reduced':
        return this.config.reducedInterval;
      case 'minimal':
        return this.config.minimalInterval;
      case 'dormant':
        return this.config.dormantInterval;
    }
  }

  private resolveTier(agent: AgentRecord, distance: number): PopulationTier {
    if (agent.forcedTier) return agent.forcedTier;
    const candidate = this.tierForDistance(distance);
    if (candidate === agent.tier) return candidate;
    const hysteresis = this.config.tierHysteresis;
    if (hysteresis <= 0) return candidate;
    const currentIndex = tierIndex(agent.tier);
    const candidateIndex = tierIndex(candidate);
    if (candidateIndex > currentIndex) {
      const boundary = this.tierLimit(agent.tier);
      return distance <= boundary * (1 + hysteresis) ? agent.tier : candidate;
    }
    const boundary = this.tierLimit(candidate);
    return distance >= boundary * (1 - hysteresis) ? agent.tier : candidate;
  }

  private tierForDistance(distance: number): PopulationTier {
    if (distance <= this.config.fullDistance) return 'full';
    if (distance <= this.config.reducedDistance) return 'reduced';
    if (distance <= this.config.minimalDistance) return 'minimal';
    return 'dormant';
  }

  private tierLimit(tier: PopulationTier): number {
    switch (tier) {
      case 'full':
        return this.config.fullDistance;
      case 'reduced':
        return this.config.reducedDistance;
      case 'minimal':
        return this.config.minimalDistance;
      case 'dormant':
        return Number.POSITIVE_INFINITY;
    }
  }

  private validTier(tier: PopulationTier | undefined): PopulationTier | undefined {
    if (!tier) return undefined;
    return tierIndex(tier) >= 0 ? tier : undefined;
  }

  private copyAgent(agent: AgentRecord): PopulationAgent {
    return {
      id: agent.id,
      position: { ...agent.position },
      radius: agent.radius,
      importance: agent.importance,
      tier: agent.tier,
      forcedTier: agent.forcedTier,
      pinned: agent.pinned,
      tags: [...agent.tags],
      metadata: { ...agent.metadata },
      distance: agent.distance,
      lastUpdatedAt: agent.lastUpdatedAt,
      lastDelta: agent.lastDelta,
      updateCount: agent.updateCount,
      skippedCount: agent.skippedCount,
    };
  }

  private copyStats(stats: PopulationStats): PopulationStats {
    return {
      ...stats,
      byTier: { ...stats.byTier },
      updatedByTier: { ...stats.updatedByTier },
      lastViewer: stats.lastViewer ? { ...stats.lastViewer } : null,
    };
  }
}

/** Convenience factory mirroring the engine's other create* helpers. */
export function createPopulationManager(
  config?: PopulationConfig,
  callbacks?: PopulationCallbacks,
): PopulationManager {
  return new PopulationManager(config, callbacks);
}
