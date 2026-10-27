// engine/src/physics/gravity-engine.ts — Tính toán gia tốc trọng trường và sức cản không khí
import type { PhysicsBody } from '../types/physics.types';

export interface GravityConfig {
  g?: number;
  terminalVelocity?: number;
}

export class GravityEngine {
  readonly g: number;
  readonly terminalVelocity: number;

  constructor(cfg: GravityConfig = {}) {
    this.g = cfg.g ?? 9.81;
    this.terminalVelocity = cfg.terminalVelocity ?? 100;
  }

  applyVelocity(body: PhysicsBody, dt: number): void {
    const scale = body.gravityScale ?? 1;
    body.velocity.y -= this.g * scale * dt;
    if (body.velocity.y < -this.terminalVelocity) body.velocity.y = -this.terminalVelocity;

    if (body.force && body.mass > 0) {
      body.velocity.x += (body.force.x / body.mass) * dt;
      body.velocity.y += (body.force.y / body.mass) * dt;
      body.velocity.z += (body.force.z / body.mass) * dt;
    }
    const drag = body.drag ?? 0;
    if (drag > 0) {
      // Kẹp về [0, 1]: drag*dt > 1 sẽ đảo dấu và khuếch đại vận tốc (bug).
      const f = Math.max(0, Math.min(1, 1 - drag * dt));
      body.velocity.x *= f;
      body.velocity.y *= f;
      body.velocity.z *= f;
    }
  }

  integrate(body: PhysicsBody, dt: number): void {
    this.applyVelocity(body, dt);
    body.position.x += body.velocity.x * dt;
    body.position.y += body.velocity.y * dt;
    body.position.z += body.velocity.z * dt;
  }
}
