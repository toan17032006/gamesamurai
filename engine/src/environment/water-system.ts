/**
 * @file water-system.ts
 * @module @aetheria/engine/environment/water-system
 * @description Water surface simulation, dynamic wave height sampling, ripples, currents, and freezing.
 */

import type { WaterSurfaceState } from '../types/environment.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface Ripple {
  x: number;
  z: number;
  strength: number;
  radius: number;
  maxRadius: number;
  lifetime: number;
  maxLifetime: number;
}

export class WaterSystem {
  private surfaces = new Map<string, WaterSurfaceState>();
  private ripples: Ripple[] = [];
  private currentTime = 0;

  /**
   * Register a body of water (ocean, lake, river, swamp).
   */
  public registerSurface(
    id: string,
    level: number = 0,
    options: {
      currentVelocity?: Vec3;
      waveAmplitude?: number;
      waveFrequency?: number;
      isFrozen?: boolean;
    } = {}
  ): WaterSurfaceState {
    const surface: WaterSurfaceState = {
      id,
      level,
      currentVelocity: options.currentVelocity ?? { x: 0, y: 0, z: 0 },
      waveAmplitude: options.waveAmplitude ?? 0.5,
      waveFrequency: options.waveFrequency ?? 0.8,
      isFrozen: options.isFrozen ?? false,
    };
    this.surfaces.set(id, surface);
    return surface;
  }

  /**
   * Calculate wave height at given world coordinates.
   */
  public getHeightAt(surfaceId: string, x: number, z: number, time?: number): number {
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return 0;
    if (surface.isFrozen) return surface.level;

    const t = time ?? this.currentTime;
    const { waveAmplitude, waveFrequency, level } = surface;

    // Multi-frequency directional waves
    const wave1 = Math.sin(x * waveFrequency * 0.5 + t * 1.5) * waveAmplitude;
    const wave2 = Math.cos(z * waveFrequency * 0.7 + t * 1.2) * (waveAmplitude * 0.6);
    const wave3 = Math.sin((x + z) * waveFrequency * 0.3 + t * 2.0) * (waveAmplitude * 0.3);

    let rippleOffset = 0;
    for (const r of this.ripples) {
      const dist = Math.hypot(x - r.x, z - r.z);
      if (dist < r.radius && dist > r.radius - 2.0) {
        const decay = 1 - r.lifetime / r.maxLifetime;
        rippleOffset += Math.sin(dist * 3.0 - t * 10) * r.strength * decay;
      }
    }

    return level + wave1 + wave2 + wave3 + rippleOffset;
  }

  /**
   * Create a ripple at specific coordinates (e.g. footsteps, splash, projectile impact).
   */
  public addRipple(x: number, z: number, strength: number = 0.5, maxRadius: number = 8.0, duration: number = 2.0): void {
    this.ripples.push({
      x,
      z,
      strength,
      radius: 0.1,
      maxRadius,
      lifetime: 0,
      maxLifetime: duration,
    });
  }

  /**
   * Update active ripples and global water clock.
   */
  public update(deltaTime: number): void {
    this.currentTime += deltaTime;

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.lifetime += deltaTime;
      const progress = r.lifetime / r.maxLifetime;
      r.radius = progress * r.maxRadius;

      if (r.lifetime >= r.maxLifetime) {
        this.ripples.splice(i, 1);
      }
    }
  }

  public setFrozen(surfaceId: string, frozen: boolean): void {
    const s = this.surfaces.get(surfaceId);
    if (s) s.isFrozen = frozen;
  }

  public getSurface(id: string): WaterSurfaceState | undefined {
    return this.surfaces.get(id);
  }

  public getAllSurfaces(): WaterSurfaceState[] {
    return Array.from(this.surfaces.values());
  }

  public clear(): void {
    this.surfaces.clear();
    this.ripples = [];
  }
}
