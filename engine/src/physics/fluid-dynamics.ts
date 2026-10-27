// engine/src/physics/fluid-dynamics.ts — Động lực học chất lỏng, lực nổi (Buoyancy) & sóng nước
import * as THREE from 'three';
import type { FluidVolume, PhysicsBody } from '../types/physics.types';
import { bottomOffset, collisionBottomOffset } from './rigid-body';

export interface Ripple {
  x: number;
  z: number;
  startTime: number;
  intensity: number;
  speed: number;
}

export class FluidSimulator {
  private volumes: FluidVolume[] = [];
  private ripples: Ripple[] = [];
  private currentTime = 0;

  addVolume(vol: FluidVolume): void {
    this.volumes.push(vol);
  }

  getVolumes(): FluidVolume[] {
    return this.volumes;
  }

  triggerRipple(x: number, z: number, intensity = 1.0, speed = 2.0): void {
    this.ripples.push({
      x,
      z,
      startTime: this.currentTime,
      intensity,
      speed,
    });
    if (this.ripples.length > 50) this.ripples.shift();
  }

  getWaveHeight(x: number, z: number, t: number, baseLevel = 0): number {
    const wave1 = Math.sin(x * 0.4 + t * 1.5) * 0.15;
    const wave2 = Math.cos(z * 0.3 + t * 1.2) * 0.12;

    let rippleHeight = 0;
    for (const r of this.ripples) {
      const age = t - r.startTime;
      if (age < 0 || age > 4) continue;
      const dist = Math.hypot(x - r.x, z - r.z);
      const waveFront = age * r.speed;
      const d = dist - waveFront;
      if (Math.abs(d) < 1.0) {
        const decay = Math.max(0, 1 - age / 4) * (1 - Math.abs(d));
        rippleHeight += Math.sin(d * Math.PI * 2) * r.intensity * decay * 0.2;
      }
    }

    return baseLevel + wave1 + wave2 + rippleHeight;
  }

  step(bodies: PhysicsBody[], dt: number): void {
    this.currentTime += dt;

    for (const vol of this.volumes) {
      for (const body of bodies) {
        if (body.isStatic) continue;

        const bx = body.position.x;
        const by = body.position.y;
        const bz = body.position.z;

        if (
          bx >= vol.bounds.min.x &&
          bx <= vol.bounds.max.x &&
          bz >= vol.bounds.min.z &&
          bz <= vol.bounds.max.z
        ) {
          const waterY = this.getWaveHeight(bx, bz, this.currentTime, vol.surfaceY);
          const bRadius = bottomOffset(body.shape);
          // Đáy va chạm gồm shape.center offset (nhất quán với resolveGround).
          const bodyBottom = by - collisionBottomOffset(body.shape);

          if (bodyBottom < waterY) {
            const submergedDepth = Math.min(bRadius * 2, waterY - bodyBottom);
            const submergedRatio = Math.max(0, Math.min(1, submergedDepth / (bRadius * 2)));

            // Lực nổi Archimedes: F_b = rho * V_submerged * g
            const volumeApprox = (4 / 3) * Math.PI * Math.pow(bRadius, 3);
            const buoyancyForce = vol.density * volumeApprox * submergedRatio * 9.81 * 1.5;

            body.velocity.y += (buoyancyForce / Math.max(1e-4, body.mass)) * dt;

            // Sức cản nước (Water Drag)
            const viscosity = vol.viscosity ?? 1.0;
            const waterDrag = viscosity * submergedRatio * 3.0;
            const dragFactor = Math.max(0, 1 - waterDrag * dt);
            body.velocity.x *= dragFactor;
            body.velocity.y *= dragFactor;
            body.velocity.z *= dragFactor;

            // Dòng chảy cuốn theo
            const flowX = vol.flowVelocity?.x ?? 0;
            const flowZ = vol.flowVelocity?.z ?? 0;
            body.velocity.x += flowX * submergedRatio * dt * 2.0;
            body.velocity.z += flowZ * submergedRatio * dt * 2.0;

            if (Math.abs(body.velocity.y) > 1.5 && submergedDepth < 0.3) {
              this.triggerRipple(bx, bz, 0.5);
            }
          }
        }
      }
    }
  }
}
