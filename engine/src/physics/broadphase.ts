/**
 * @file broadphase.ts
 * @module @aetheria/engine/physics/broadphase
 * @description Sweep-and-prune broadphase for rigid-body pair generation.
 *
 * Bodies are sorted by the minimum X of their world AABB, then an active list is
 * swept along X while Y/Z overlaps are rejected. Candidate pairs are returned in
 * the original body-index order so sequential collision resolution stays
 * deterministic and identical to the legacy O(n²) loop.
 */

import type { PhysicsBody } from '../types/physics.types.js';
import { bodyBounds } from './spatial-bridge.js';

/** Tuning for the sweep-and-prune broadphase. */
export interface BroadphaseConfig {
  /** Expand every AABB by this many world units (default 0). */
  margin?: number;
  /** Skip pairs where both bodies are static (default true). */
  skipStaticPairs?: boolean;
}

/** One candidate pair, ordered by the bodies' positions in the input list. */
export interface BroadphasePair {
  a: PhysicsBody;
  b: PhysicsBody;
}

export interface BroadphaseStats {
  bodies: number;
  /** Pairs that survived AABB overlap tests. */
  candidatePairs: number;
  /** Y/Z overlap tests performed against the active list. */
  overlapChecks: number;
  /** Active entries discarded because their X interval ended. */
  expired: number;
  /** Pairs removed because both bodies are static. */
  staticPairsSkipped: number;
}

interface Entry {
  body: PhysicsBody;
  index: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/** Reusable sweep-and-prune implementation. */
export class SweepAndPruneBroadphase {
  public readonly margin: number;
  public readonly skipStaticPairs: boolean;
  private lastStats: BroadphaseStats = {
    bodies: 0,
    candidatePairs: 0,
    overlapChecks: 0,
    expired: 0,
    staticPairsSkipped: 0,
  };
  /** Scratch tái sử dụng giữa các frame — không cấp phát lại mỗi lần gọi. */
  private entryScratch: Entry[] = [];
  private pairScratch: Array<{ a: PhysicsBody; b: PhysicsBody; ai: number; bi: number }> = [];

  constructor(config: BroadphaseConfig = {}) {
    this.margin = Math.max(0, finite(config.margin ?? 0));
    this.skipStaticPairs = config.skipStaticPairs ?? true;
  }

  public get stats(): BroadphaseStats {
    return { ...this.lastStats };
  }

  /** Compute every potentially colliding pair in `bodies`. */
  public computePairs(bodies: readonly PhysicsBody[]): BroadphasePair[] {
    return this.computePairsInto(bodies, []);
  }

  /**
   * Như `computePairs` nhưng ghi kết quả vào mảng `out` do caller tái sử dụng —
   * dùng trong vòng lặp vật lý nóng để loại toàn bộ cấp phát.
   */
  public computePairsInto(bodies: readonly PhysicsBody[], out: BroadphasePair[]): BroadphasePair[] {
    out.length = 0;
    const margin = this.margin;
    const entries = this.entryScratch;
    entries.length = bodies.length;
    for (let index = 0; index < bodies.length; index++) {
      const body = bodies[index];
      const bounds = bodyBounds(body);
      const reused = entries[index] ?? (entries[index] = { body: body, index: 0, minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 });
      reused.body = body;
      reused.index = index;
      reused.minX = bounds.min.x - margin;
      reused.maxX = bounds.max.x + margin;
      reused.minY = bounds.min.y - margin;
      reused.maxY = bounds.max.y + margin;
      reused.minZ = bounds.min.z - margin;
      reused.maxZ = bounds.max.z + margin;
    }

    entries.sort((a, b) => a.minX - b.minX || a.maxX - b.maxX || a.index - b.index);

    const active: Entry[] = [];
    const indexedPairs = this.pairScratch;
    indexedPairs.length = 0;
    let overlapChecks = 0;
    let expired = 0;
    let staticPairsSkipped = 0;

    for (const entry of entries) {
      // Retire entries whose X interval has ended. The active list is small on
      // average, so a backwards compaction pass beats a heap here.
      let write = 0;
      for (let read = 0; read < active.length; read++) {
        const candidate = active[read];
        if (candidate.maxX < entry.minX) {
          expired++;
          continue;
        }
        active[write++] = candidate;
      }
      active.length = write;

      for (const other of active) {
        overlapChecks++;
        if (other.maxY < entry.minY || entry.maxY < other.minY) continue;
        if (other.maxZ < entry.minZ || entry.maxZ < other.minZ) continue;
        if (this.skipStaticPairs && other.body.isStatic && entry.body.isStatic) {
          staticPairsSkipped++;
          continue;
        }
        const first = other.index < entry.index ? other : entry;
        const second = other.index < entry.index ? entry : other;
        indexedPairs.push({ a: first.body, b: second.body, ai: first.index, bi: second.index });
      }
      active.push(entry);
    }

    // Sequential impulse resolution expects pairs in the original nested-loop
    // order: (0,1), (0,2), ... (1,2), ...
    indexedPairs.sort((left, right) => left.ai - right.ai || left.bi - right.bi);
    for (const pair of indexedPairs) out.push({ a: pair.a, b: pair.b });

    this.lastStats = {
      bodies: bodies.length,
      candidatePairs: out.length,
      overlapChecks,
      expired,
      staticPairsSkipped,
    };
    return out;
  }
}

/** Brute-force pair list used when the broadphase is disabled. */
export function bruteForcePairs(bodies: readonly PhysicsBody[]): BroadphasePair[] {
  const pairs: BroadphasePair[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      if (a.isStatic && b.isStatic) continue;
      pairs.push({ a, b });
    }
  }
  return pairs;
}
