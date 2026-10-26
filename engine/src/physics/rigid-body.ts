// engine/src/physics/rigid-body.ts — Mô phỏng động lực học vật rắn (Mass, velocity, forces) & mặt phẳng
import type { PhysicsBody } from '../types/physics.types';
import { GravityEngine, type GravityConfig } from './gravity-engine';

export interface GroundConfig {
  y?: number;
  restitution?: number;
  friction?: number;
}

export function bottomOffset(shape: PhysicsBody['shape']): number {
  if (shape.kind === 'sphere') return shape.radius;
  if (shape.kind === 'box') return shape.half.y;
  if (shape.kind === 'capsule' || shape.kind === 'cylinder') return shape.height / 2;
  return 0.5;
}

export function resolveGround(body: PhysicsBody, cfg: GroundConfig = {}): boolean {
  if (body.isStatic) return false;
  const groundY = cfg.y ?? 0;
  const restitution = cfg.restitution ?? 0.2;
  const friction = cfg.friction ?? 0.85;
  const bottom = body.position.y - bottomOffset(body.shape);
  if (bottom >= groundY) return false;
  body.position.y += groundY - bottom;
  if (body.velocity.y < 0) {
    body.velocity.y = -body.velocity.y * restitution;
    if (Math.abs(body.velocity.y) < 0.5) body.velocity.y = 0;
  }
  body.velocity.x *= friction;
  body.velocity.z *= friction;
  return true;
}

export class RigidBody {
  readonly body: PhysicsBody;
  readonly gravity: GravityEngine;

  constructor(body: PhysicsBody, gravityCfg: GravityConfig = {}) {
    this.body = body;
    this.gravity = new GravityEngine(gravityCfg);
  }

  get id(): string {
    return this.body.id;
  }

  integrate(dt: number): void {
    if (this.body.isStatic) return;
    this.gravity.integrate(this.body, dt);
  }

  resolveGround(cfg: GroundConfig = {}): boolean {
    return resolveGround(this.body, cfg);
  }
}
