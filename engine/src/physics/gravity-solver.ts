/**
 * @file gravity-solver.ts
 * @module @aetheria/engine/physics/gravity-solver
 * @description Advanced regional gravity zones, planetary point attractors, fluid buoyancy,
 * aerodynamic drag, terminal velocity, and contact friction solvers.
 */

import type { Vec3 } from '../types/transform.types.js';
import type { PhysicsBody, FluidVolume, ForceField } from '../types/physics.types.js';
import { EngineResult, engineOk } from '../types/engine.types.js';

export type GravityZoneType =
  | 'directional'
  | 'point-attractor'
  | 'vortex'
  | 'inverted'
  | 'zero-g';

export interface GravityZone {
  id: string;
  type: GravityZoneType;
  priority: number; // Higher priority overrides lower
  origin?: Vec3;
  direction?: Vec3;
  strength: number; // e.g. 9.81
  radius?: number; // for point attractor / vortex
  damping?: number; // for zero-g
}

export interface EnvironmentalMedium {
  density: number; // e.g. 1.225 for air, 1000 for water
  viscosity: number;
  flowVelocity?: Vec3;
}

export interface GravityStepResult {
  appliedGravity: Vec3;
  appliedDrag: Vec3;
  appliedBuoyancy: Vec3;
  netForce: Vec3;
  terminalVelocity: number;
  inFluid: boolean;
}

export class GravitySolver {
  private zones: GravityZone[] = [];
  private defaultGravity: Vec3 = { x: 0, y: -9.81, z: 0 };
  private defaultMedium: EnvironmentalMedium = { density: 1.225, viscosity: 0.000018 };

  constructor(defaultGravityY = -9.81) {
    this.defaultGravity = { x: 0, y: defaultGravityY, z: 0 };
  }

  public addZone(zone: GravityZone): void {
    this.zones.push(zone);
    this.zones.sort((a, b) => b.priority - a.priority);
  }

  public removeZone(id: string): boolean {
    const idx = this.zones.findIndex(z => z.id === id);
    if (idx !== -1) {
      this.zones.splice(idx, 1);
      return true;
    }
    return false;
  }

  public clearZones(): void {
    this.zones = [];
  }

  /**
   * Computes gravitational acceleration at a 3D position based on active zones
   */
  public computeGravityAt(pos: Vec3): Vec3 {
    for (const zone of this.zones) {
      if (zone.type === 'directional' && zone.direction) {
        const len = Math.sqrt(zone.direction.x ** 2 + zone.direction.y ** 2 + zone.direction.z ** 2) || 1;
        return {
          x: (zone.direction.x / len) * zone.strength,
          y: (zone.direction.y / len) * zone.strength,
          z: (zone.direction.z / len) * zone.strength
        };
      } else if (zone.type === 'point-attractor' && zone.origin) {
        const dx = zone.origin.x - pos.x;
        const dy = zone.origin.y - pos.y;
        const dz = zone.origin.z - pos.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (!zone.radius || dist <= zone.radius) {
          if (dist > 0.001) {
            // Newton's law: F = G * M / r^2
            const accel = zone.strength / Math.max(distSq, 1.0);
            return {
              x: (dx / dist) * accel,
              y: (dy / dist) * accel,
              z: (dz / dist) * accel
            };
          }
        }
      } else if (zone.type === 'vortex' && zone.origin) {
        const dx = pos.x - zone.origin.x;
        const dz = pos.z - zone.origin.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (!zone.radius || dist <= zone.radius) {
          // Tangential vortex velocity + inward pull
          const tangentX = -dz / (dist || 1);
          const tangentZ = dx / (dist || 1);
          return {
            x: (tangentX - (dx / (dist || 1)) * 0.5) * zone.strength,
            y: this.defaultGravity.y,
            z: (tangentZ - (dz / (dist || 1)) * 0.5) * zone.strength
          };
        }
      } else if (zone.type === 'zero-g') {
        return { x: 0, y: 0, z: 0 };
      } else if (zone.type === 'inverted') {
        return { x: 0, y: Math.abs(zone.strength), z: 0 };
      }
    }

    return this.defaultGravity;
  }

  /**
   * Evaluates net forces acting on a body including gravity, aerodynamic drag, and buoyancy
   */
  public stepBodyForces(
    body: PhysicsBody,
    fluids: FluidVolume[] = [],
    dt: number
  ): EngineResult<GravityStepResult> {
    const grav = this.computeGravityAt(body.position);
    const gravityScale = body.gravityScale ?? 1.0;

    const gravityForce: Vec3 = {
      x: grav.x * body.mass * gravityScale,
      y: grav.y * body.mass * gravityScale,
      z: grav.z * body.mass * gravityScale
    };

    // Check fluid immersion
    let activeMedium = this.defaultMedium;
    let inFluid = false;
    let buoyancyForce: Vec3 = { x: 0, y: 0, z: 0 };

    for (const fluid of fluids) {
      const b = fluid.bounds;
      if (
        body.position.x >= b.min.x && body.position.x <= b.max.x &&
        body.position.y >= b.min.y && body.position.y <= b.max.y &&
        body.position.z >= b.min.z && body.position.z <= b.max.z
      ) {
        inFluid = true;
        activeMedium = {
          density: fluid.density,
          viscosity: fluid.viscosity ?? 0.001,
          flowVelocity: fluid.flowVelocity
        };

        // Archimedes Buoyancy: F_b = rho * V * g (displaced volume estimated by mass / density)
        const estVolume = body.mass / (body.material?.density ?? 1000);
        buoyancyForce = {
          x: -grav.x * activeMedium.density * estVolume,
          y: -grav.y * activeMedium.density * estVolume,
          z: -grav.z * activeMedium.density * estVolume
        };
        break;
      }
    }

    // Aerodynamic / Fluid Drag: F_d = -0.5 * rho * v^2 * Cd * A
    const relVx = body.velocity.x - (activeMedium.flowVelocity?.x ?? 0);
    const relVy = body.velocity.y - (activeMedium.flowVelocity?.y ?? 0);
    const relVz = body.velocity.z - (activeMedium.flowVelocity?.z ?? 0);
    const speed = Math.sqrt(relVx * relVx + relVy * relVy + relVz * relVz);

    const dragCoeff = body.drag ?? (inFluid ? 1.5 : 0.47);
    const crossArea = 0.5; // Average cross-sectional area (m^2)
    const dragMagnitude = 0.5 * activeMedium.density * speed * speed * dragCoeff * crossArea;

    const dragForce: Vec3 = {
      x: speed > 0.001 ? -(relVx / speed) * dragMagnitude : 0,
      y: speed > 0.001 ? -(relVy / speed) * dragMagnitude : 0,
      z: speed > 0.001 ? -(relVz / speed) * dragMagnitude : 0
    };

    // Calculate terminal velocity: v_t = sqrt( (2 * m * g) / (rho * A * Cd) )
    const gMagnitude = Math.sqrt(grav.x * grav.x + grav.y * grav.y + grav.z * grav.z);
    const terminalVelocity = Math.sqrt(
      (2 * body.mass * gMagnitude) / Math.max(activeMedium.density * crossArea * dragCoeff, 0.0001)
    );

    const netForce: Vec3 = {
      x: gravityForce.x + dragForce.x + buoyancyForce.x + (body.force?.x ?? 0),
      y: gravityForce.y + dragForce.y + buoyancyForce.y + (body.force?.y ?? 0),
      z: gravityForce.z + dragForce.z + buoyancyForce.z + (body.force?.z ?? 0)
    };

    return engineOk({
      appliedGravity: gravityForce,
      appliedDrag: dragForce,
      appliedBuoyancy: buoyancyForce,
      netForce,
      terminalVelocity,
      inFluid
    });
  }

  /**
   * Computes contact friction impulse between two colliding bodies
   */
  public static computeFrictionImpulse(
    normalImpulse: number,
    relativeVelocity: Vec3,
    contactNormal: Vec3,
    frictionCoeff: number
  ): Vec3 {
    // Tangent velocity = v - (v . n) * n
    const normalDot = relativeVelocity.x * contactNormal.x +
                      relativeVelocity.y * contactNormal.y +
                      relativeVelocity.z * contactNormal.z;

    const tangentVx = relativeVelocity.x - normalDot * contactNormal.x;
    const tangentVy = relativeVelocity.y - normalDot * contactNormal.y;
    const tangentVz = relativeVelocity.z - normalDot * contactNormal.z;

    const tangentSpeed = Math.sqrt(tangentVx * tangentVx + tangentVy * tangentVy + tangentVz * tangentVz);
    if (tangentSpeed < 1e-4) {
      return { x: 0, y: 0, z: 0 };
    }

    // Coulomb friction: max friction force = mu * normalImpulse
    const maxFriction = Math.abs(frictionCoeff * normalImpulse);
    const frictionMagnitude = Math.min(tangentSpeed, maxFriction);

    return {
      x: -(tangentVx / tangentSpeed) * frictionMagnitude,
      y: -(tangentVy / tangentSpeed) * frictionMagnitude,
      z: -(tangentVz / tangentSpeed) * frictionMagnitude
    };
  }
}
