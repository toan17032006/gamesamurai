/**
 * @file foliage-system.ts
 * @module @aetheria/engine/environment/foliage-system
 * @description Foliage, tree chopping, falling physics, wind sway, and vegetation simulation.
 */

import type { TreeState, WindState } from '../types/environment.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface ChopResult {
  felled: boolean;
  woodYield: number;
  remainingHealth: number;
  tree: TreeState;
}

export class FoliageSystem {
  private trees = new Map<string, TreeState>();
  private time = 0;

  /**
   * Register or spawn a tree into the ecosystem.
   */
  public registerTree(
    id: string,
    position: Vec3,
    options: { maxHealth?: number; woodYield?: number } = {}
  ): TreeState {
    const maxHealth = options.maxHealth ?? 100;
    const tree: TreeState = {
      id,
      position: { ...position },
      health: maxHealth,
      maxHealth,
      isFelled: false,
      fallDirection: { x: 1, y: 0, z: 0 },
      fallProgress: 0,
      woodYield: options.woodYield ?? 15,
      swayIntensity: 0.1,
    };
    this.trees.set(id, tree);
    return tree;
  }

  /**
   * Apply axe chop damage to a tree, checking for felling threshold.
   */
  public chopTree(id: string, damage: number, hitDirection?: Vec3): ChopResult {
    const tree = this.trees.get(id);
    if (!tree) {
      throw new Error(`Tree ${id} not found in FoliageSystem.`);
    }

    if (tree.isFelled) {
      return { felled: true, woodYield: 0, remainingHealth: 0, tree };
    }

    tree.health = Math.max(0, tree.health - damage);

    if (tree.health <= 0) {
      tree.isFelled = true;
      tree.fallProgress = 0;
      if (hitDirection) {
        const len = Math.hypot(hitDirection.x, hitDirection.z) || 1;
        tree.fallDirection = { x: hitDirection.x / len, y: 0, z: hitDirection.z / len };
      }
      return {
        felled: true,
        woodYield: tree.woodYield,
        remainingHealth: 0,
        tree,
      };
    }

    return {
      felled: false,
      woodYield: 0,
      remainingHealth: tree.health,
      tree,
    };
  }

  /**
   * Update wind sway and falling animation progress.
   */
  public update(deltaTime: number, wind: WindState): void {
    this.time += deltaTime;

    for (const tree of this.trees.values()) {
      if (tree.isFelled) {
        if (tree.fallProgress !== undefined && tree.fallProgress < 1) {
          // Accelerate fall down towards 90 degrees
          tree.fallProgress = Math.min(1, tree.fallProgress + deltaTime * 1.5);
        }
      } else {
        // Wind sway computation
        const spatialPhase = (tree.position.x * 0.3 + tree.position.z * 0.2);
        const swayWave = Math.sin(this.time * (1.5 + wind.speed * 0.5) + spatialPhase);
        tree.swayIntensity = 0.05 + Math.abs(swayWave) * (wind.speed * 0.02 + wind.gustiness * 0.05);
      }
    }
  }

  /**
   * Get all registered trees.
   */
  public getTrees(): TreeState[] {
    return Array.from(this.trees.values());
  }

  /**
   * Get a specific tree by ID.
   */
  public getTree(id: string): TreeState | undefined {
    return this.trees.get(id);
  }

  /**
   * Remove a tree once completely harvested.
   */
  public removeTree(id: string): boolean {
    return this.trees.delete(id);
  }

  /**
   * Clear all trees.
   */
  public clear(): void {
    this.trees.clear();
  }
}
