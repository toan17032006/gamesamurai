/**
 * @file atmosphere-system.ts
 * @module @aetheria/engine/environment/atmosphere-system
 * @description Atmosphere simulation, global wind, gusts, localized updrafts, and vortexes.
 */

import type { WindState } from '../types/environment.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface UpdraftZone {
  center: Vec3;
  radius: number;
  height: number;
  upwardVelocity: number;
}

export interface VortexZone {
  center: Vec3;
  radius: number;
  height: number;
  rotationalVelocity: number;
  inwardPull: number;
}

export class AtmosphereSystem {
  private wind: WindState = {
    direction: { x: 1, y: 0, z: 0.2 },
    speed: 5.0, // m/s
    gustiness: 0.3,
    turbulence: 0.2,
  };

  private updrafts: UpdraftZone[] = [];
  private vortexes: VortexZone[] = [];
  private time = 0;

  public setWind(wind: Partial<WindState>): void {
    if (wind.direction) {
      const len = Math.hypot(wind.direction.x, wind.direction.y, wind.direction.z) || 1;
      this.wind.direction = {
        x: wind.direction.x / len,
        y: wind.direction.y / len,
        z: wind.direction.z / len,
      };
    }
    if (wind.speed !== undefined) this.wind.speed = wind.speed;
    if (wind.gustiness !== undefined) this.wind.gustiness = wind.gustiness;
    if (wind.turbulence !== undefined) this.wind.turbulence = wind.turbulence;
  }

  public getWind(): WindState {
    return { ...this.wind, direction: { ...this.wind.direction } };
  }

  public addUpdraft(zone: UpdraftZone): void {
    this.updrafts.push(zone);
  }

  public addVortex(zone: VortexZone): void {
    this.vortexes.push(zone);
  }

  /**
   * Sample net atmospheric velocity at a specific 3D location.
   */
  public getWindVelocityAt(pos: Vec3): Vec3 {
    // Base wind with gust wave
    const gustFactor = 1.0 + Math.sin(this.time * 0.8 + pos.x * 0.05 + pos.z * 0.05) * this.wind.gustiness;
    const turbX = Math.sin(this.time * 2.3 + pos.y * 0.1) * this.wind.turbulence * this.wind.speed * 0.2;
    const turbZ = Math.cos(this.time * 1.9 + pos.x * 0.1) * this.wind.turbulence * this.wind.speed * 0.2;

    const vel: Vec3 = {
      x: this.wind.direction.x * this.wind.speed * gustFactor + turbX,
      y: this.wind.direction.y * this.wind.speed + (Math.sin(this.time * 1.2) * 0.1),
      z: this.wind.direction.z * this.wind.speed * gustFactor + turbZ,
    };

    // Add updrafts
    for (const u of this.updrafts) {
      const dx = pos.x - u.center.x;
      const dz = pos.z - u.center.z;
      const dy = pos.y - u.center.y;
      if (dy >= 0 && dy <= u.height) {
        const dist = Math.hypot(dx, dz);
        if (dist <= u.radius) {
          const falloff = 1 - dist / u.radius;
          vel.y += u.upwardVelocity * falloff;
        }
      }
    }

    // Add vortexes
    for (const v of this.vortexes) {
      const dx = pos.x - v.center.x;
      const dz = pos.z - v.center.z;
      const dy = pos.y - v.center.y;
      if (dy >= 0 && dy <= v.height) {
        const dist = Math.hypot(dx, dz);
        if (dist <= v.radius && dist > 0.001) {
          const falloff = 1 - dist / v.radius;
          // Tangential direction
          const tx = -dz / dist;
          const tz = dx / dist;
          // Inward direction
          const ix = -dx / dist;
          const iz = -dz / dist;

          vel.x += (tx * v.rotationalVelocity + ix * v.inwardPull) * falloff;
          vel.z += (tz * v.rotationalVelocity + iz * v.inwardPull) * falloff;
          vel.y += v.rotationalVelocity * 0.3 * falloff;
        }
      }
    }

    return vel;
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
  }

  public clearZones(): void {
    this.updrafts = [];
    this.vortexes = [];
  }
}
