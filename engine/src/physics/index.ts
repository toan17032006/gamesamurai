// engine/src/physics/index.ts — Facade hệ thống vật lý toàn diện
import * as THREE from 'three';
import type { HitResult, PhysicsBody } from '../types/physics.types';
import { GravityEngine, type GravityConfig } from './gravity-engine';
import { collideBodies, raySphere, rayBox, rayCapsule, shapeCenter } from './collision-detector';
import { resolveGround, type GroundConfig } from './rigid-body';
import { RagdollSolver, type RagdollOptions } from './ragdoll-solver';
import { FluidSimulator } from './fluid-dynamics';
import { DestructionEngine } from './destruction-engine';

export { GravityEngine } from './gravity-engine';
export type { GravityConfig } from './gravity-engine';
export * from './collision-detector';
export { RigidBody, resolveGround } from './rigid-body';
export type { GroundConfig } from './rigid-body';
export { RagdollSolver } from './ragdoll-solver';
export type { RagdollPoint, RagdollConstraint, RagdollOptions } from './ragdoll-solver';
export { FluidSimulator } from './fluid-dynamics';
export { DestructionEngine } from './destruction-engine';

export interface PhysicsWorldOptions {
  gravity?: GravityConfig;
  ground?: GroundConfig;
}

export class PhysicsWorld {
  readonly gravity: GravityEngine;
  readonly fluids = new FluidSimulator();
  readonly destruction = new DestructionEngine();
  private bodies = new Map<string, PhysicsBody>();
  private groundCfg: GroundConfig;
  private ragdolls: RagdollSolver[] = [];

  constructor(opts: PhysicsWorldOptions = {}) {
    this.gravity = new GravityEngine(opts.gravity);
    this.groundCfg = opts.ground ?? { y: 0, restitution: 0.2, friction: 0.85 };
  }

  addBody(body: PhysicsBody): void {
    if (this.bodies.has(body.id)) {
      console.warn(`[physics] body "${body.id}" đã tồn tại — ghi đè`);
    }
    this.bodies.set(body.id, body);
  }

  removeBody(id: string): boolean {
    return this.bodies.delete(id);
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  get bodyCount(): number {
    return this.bodies.size;
  }

  get bodiesList(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  getAllBodies(): PhysicsBody[] {
    return this.bodiesList;
  }

  clear(): void {
    this.bodies.clear();
    this.ragdolls = [];
    this.destruction.clear();
  }

  setGround(cfg: GroundConfig): void {
    this.groundCfg = { ...this.groundCfg, ...cfg };
  }

  addRagdoll(ragdoll: RagdollSolver): void {
    this.ragdolls.push(ragdoll);
  }

  step(dt: number): void {
    const list = this.bodiesList;

    // 1) Tích phân trọng lực & ngoại lực
    for (const b of list) {
      if (b.isStatic) continue;
      this.gravity.integrate(b, dt);
    }

    // 2) Tương tác chất lỏng (buoyancy & water drag)
    this.fluids.step(list, dt);

    // 3) Va chạm cặp
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.isStatic && b.isStatic) continue;
        const hit = collideBodies(a, b);
        if (!hit?.hit || !hit.normal) continue;
        const depth = hit.depth;
        if (depth <= 0) continue;
        const nrm = new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z);
        const invMassA = a.isStatic ? 0 : 1 / Math.max(1e-6, a.mass);
        const invMassB = b.isStatic ? 0 : 1 / Math.max(1e-6, b.mass);
        const total = invMassA + invMassB;
        if (total <= 0) continue;

        const pa = a.position;
        const pb = b.position;
        pa.x += nrm.x * -depth * (invMassA / total);
        pa.y += nrm.y * -depth * (invMassA / total);
        pa.z += nrm.z * -depth * (invMassA / total);
        pb.x += nrm.x * depth * (invMassB / total);
        pb.y += nrm.y * depth * (invMassB / total);
        pb.z += nrm.z * depth * (invMassB / total);
      }
    }

    // 4) Mặt đất
    for (const b of list) {
      resolveGround(b, this.groundCfg);
    }

    // 5) Ragdolls
    for (const r of this.ragdolls) {
      r.step(dt, this.groundCfg.y ?? 0);
    }

    // 6) Debris / Destruction pieces
    this.destruction.step(dt, this.groundCfg.y ?? 0);
  }

  stepPhysics(dt: number): void {
    this.step(dt);
  }

  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): HitResult {
    let closest: HitResult = { hit: false };
    let bestDist = maxDist;

    for (const b of this.bodies.values()) {
      const c = shapeCenter(b.position, b.shape);
      let hit: HitResult = { hit: false };

      if (b.shape.kind === 'sphere') {
        hit = raySphere(origin, dir, { center: c, radius: b.shape.radius }, bestDist);
      } else if (b.shape.kind === 'box') {
        const half = new THREE.Vector3(b.shape.half.x, b.shape.half.y, b.shape.half.z);
        hit = rayBox(origin, dir, { center: c, half }, bestDist);
      } else if (b.shape.kind === 'capsule') {
        hit = rayCapsule(origin, dir, { center: c, radius: b.shape.radius, height: b.shape.height }, bestDist);
      }

      if (hit.hit && hit.distance !== undefined && hit.distance < bestDist) {
        bestDist = hit.distance;
        closest = { ...hit, bodyId: b.id };
      }
    }

    return closest;
  }
}
