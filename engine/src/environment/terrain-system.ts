/**
 * @file terrain-system.ts
 * @module @aetheria/engine/environment/terrain-system
 * @description Dynamic terrain deformation, craters, earthquake fissures, and mound generation.
 */

import type { TerrainDeformation } from '../types/environment.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface FissureDeformation extends TerrainDeformation {
  start: Vec3;
  end: Vec3;
  width: number;
}

export class TerrainSystem {
  private deformations: TerrainDeformation[] = [];

  /**
   * Apply an explosive crater impact on the terrain.
   */
  public applyCrater(center: Vec3, radius: number = 3.0, depth: number = 1.5): TerrainDeformation {
    const deformation: TerrainDeformation = {
      center: { ...center },
      radius,
      depth,
      type: 'crater',
    };
    this.deformations.push(deformation);
    return deformation;
  }

  /**
   * Apply an earthquake fissure line on the terrain.
   */
  public applyFissure(start: Vec3, end: Vec3, width: number = 1.5, depth: number = 2.0): FissureDeformation {
    const center: Vec3 = {
      x: (start.x + end.x) * 0.5,
      y: (start.y + end.y) * 0.5,
      z: (start.z + end.z) * 0.5,
    };
    const length = Math.hypot(end.x - start.x, end.z - start.z);

    const fissure: FissureDeformation = {
      center,
      radius: length * 0.5,
      depth,
      type: 'fissure',
      start: { ...start },
      end: { ...end },
      width,
    };

    this.deformations.push(fissure);
    return fissure;
  }

  /**
   * Calculate adjusted terrain height at world coordinates (x, z).
   */
  public getDeformedHeight(x: number, z: number, baseHeight: number = 0): number {
    let heightOffset = 0;

    for (const d of this.deformations) {
      if (d.type === 'crater') {
        const dist = Math.hypot(x - d.center.x, z - d.center.z);
        if (dist <= d.radius) {
          // Bowl profile: deep center, slight lip at edges
          const normDist = dist / d.radius;
          const craterShape = Math.cos(normDist * Math.PI * 0.5); // 1 at center, 0 at edge
          const rimEjecta = Math.sin(normDist * Math.PI) * (d.depth * 0.15); // small rim mound
          heightOffset -= craterShape * d.depth - rimEjecta;
        }
      } else if (d.type === 'fissure') {
        const f = d as FissureDeformation;
        // Distance from point to line segment
        const distToSegment = this.distanceToSegment(x, z, f.start.x, f.start.z, f.end.x, f.end.z);
        if (distToSegment <= f.width) {
          const falloff = 1 - distToSegment / f.width;
          heightOffset -= falloff * f.depth;
        }
      } else if (d.type === 'mound') {
        const dist = Math.hypot(x - d.center.x, z - d.center.z);
        if (dist <= d.radius) {
          const falloff = 1 - dist / d.radius;
          heightOffset += falloff * d.depth;
        }
      }
    }

    return baseHeight + heightOffset;
  }

  private distanceToSegment(px: number, pz: number, x1: number, z1: number, x2: number, z2: number): number {
    const l2 = (x2 - x1) ** 2 + (z2 - z1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, pz - z1);
    let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projZ = z1 + t * (z2 - z1);
    return Math.hypot(px - projX, pz - projZ);
  }

  public getDeformations(): TerrainDeformation[] {
    return [...this.deformations];
  }

  public clear(): void {
    this.deformations = [];
  }
}
