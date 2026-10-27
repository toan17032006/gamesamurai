// engine/src/physics/index.ts — Facade hệ thống vật lý toàn diện
import * as THREE from 'three';
import type { HitResult, PhysicsBody, RaycastHit, CollisionShape, SweepHit } from '../types/physics.types';
import { GravityEngine, type GravityConfig } from './gravity-engine';
import { collideBodies, raySphere, rayBox, rayCapsule, shapeCenter } from './collision-detector';
import { resolveGround, type GroundConfig } from './rigid-body';
import { RagdollSolver, type RagdollOptions } from './ragdoll-solver';
import { FluidSimulator } from './fluid-dynamics';
import { DestructionEngine } from './destruction-engine';
import {
  AABB as SpatialAABB,
  Sphere as SpatialSphere,
  Vec3 as SpatialVec3,
  type Vec3Like,
  type SweepHitResult,
  type SweepShape,
} from '../spatial/index.js';
import {
  bodyBounds,
  collisionShapeBounds,
  raycastCollisionShape,
  sweepCollisionShapeAgainstAABB,
  type SweepBodyHit,
} from './spatial-bridge.js';
import {
  SweepAndPruneBroadphase,
  bruteForcePairs,
  type BroadphaseConfig,
  type BroadphasePair,
  type BroadphaseStats,
} from './broadphase.js';

export { GravityEngine } from './gravity-engine';
export type { GravityConfig } from './gravity-engine';
export * from './collision-detector';
export { RigidBody, resolveGround } from './rigid-body';
export type { GroundConfig } from './rigid-body';
export { RagdollSolver } from './ragdoll-solver';
export type { RagdollPoint, RagdollConstraint, RagdollOptions } from './ragdoll-solver';
export { FluidSimulator } from './fluid-dynamics';
export { DestructionEngine } from './destruction-engine';

// ---------------------------------------------------------------------------
// Advanced Collision, Regional Gravity & Spatial Partitioning Solvers
// ---------------------------------------------------------------------------
export * from './gravity-solver.js';
export * from './collision-algorithms.js';
export * from './spatial-partitioning.js';
export * from './spatial-bridge.js';
export * from './broadphase.js';

export interface PhysicsWorldOptions {
  gravity?: GravityConfig;
  ground?: GroundConfig;
  /**
   * Broadphase tuning. Pass `false` to use the legacy O(n²) pair loop (useful
   * for debugging or exact differential tests).
   */
  broadphase?: BroadphaseConfig | false;
}

export class PhysicsWorld {
  readonly gravity: GravityEngine;
  readonly fluids = new FluidSimulator();
  readonly destruction = new DestructionEngine();
  private bodies = new Map<string, PhysicsBody>();
  private groundCfg: GroundConfig;
  private ragdolls: RagdollSolver[] = [];
  private readonly broadphase: SweepAndPruneBroadphase | null;
  private lastBroadphaseStats: BroadphaseStats = {
    bodies: 0,
    candidatePairs: 0,
    overlapChecks: 0,
    expired: 0,
    staticPairsSkipped: 0,
  };

  constructor(opts: PhysicsWorldOptions = {}) {
    this.gravity = new GravityEngine(opts.gravity);
    this.groundCfg = opts.ground ?? { y: 0, restitution: 0.2, friction: 0.85 };
    this.broadphase =
      opts.broadphase === false ? null : new SweepAndPruneBroadphase(opts.broadphase ?? {});
  }

  /** Broadphase statistics from the last `step`. */
  get broadphaseStats(): BroadphaseStats {
    return { ...this.lastBroadphaseStats };
  }

  /** True when the sweep-and-prune broadphase is active. */
  get usesBroadphase(): boolean {
    return this.broadphase !== null;
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
    const pairs: BroadphasePair[] = this.broadphase
      ? this.broadphase.computePairs(list)
      : bruteForcePairs(list);
    if (this.broadphase) {
      this.lastBroadphaseStats = this.broadphase.stats;
    } else {
      this.lastBroadphaseStats = {
        bodies: list.length,
        candidatePairs: pairs.length,
        overlapChecks: (list.length * (list.length - 1)) / 2,
        expired: 0,
        staticPairsSkipped: 0,
      };
    }

    for (const { a, b } of pairs) {
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

  // -------------------------------------------------------------------------
  // Spatial queries, multi-hit raycasts and continuous sweeps
  // -------------------------------------------------------------------------

  /** All bodies whose world-space AABB overlaps `bounds`. */
  queryAABB(bounds: SpatialAABB): PhysicsBody[] {
    const results: PhysicsBody[] = [];
    for (const body of this.bodies.values()) {
      if (bodyBounds(body).intersects(bounds)) results.push(body);
    }
    return results;
  }

  /** All bodies whose AABB is within `radius` of `center`. */
  querySphere(center: Vec3Like | THREE.Vector3, radius: number): PhysicsBody[] {
    const c = new SpatialVec3(center.x, center.y, center.z);
    const sphere = new SpatialSphere(c, radius);
    const results: PhysicsBody[] = [];
    for (const body of this.bodies.values()) {
      if (bodyBounds(body).distanceSqToPoint(c) <= radius * radius) results.push(body);
    }
    return results;
  }

  /**
   * Every ray hit along the ray, sorted by distance. Unlike `raycast`, this
   * does not stop at the first body and returns the full `RaycastHit` contract.
   */
  raycastAll(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number): RaycastHit[] {
    const dir = direction.clone().normalize();
    const hits: RaycastHit[] = [];
    for (const body of this.bodies.values()) {
      const hit = raycastCollisionShape(origin, dir, maxDistance, body.shape, body.position);
      if (hit?.hit) {
        hits.push({ ...hit, bodyId: body.id, colliderShape: body.shape.kind });
      }
    }
    return hits.sort((a, b) => a.distance - b.distance);
  }

  /** Sweep a sphere against all bodies and return sorted time-of-impact hits. */
  sweepSphere(center: Vec3Like, radius: number, displacement: Vec3Like, maxTime = 1): SweepBodyHit[] {
    return this.sweepShape({ kind: 'sphere', radius }, center, displacement, maxTime);
  }

  /** Sweep an arbitrary primitive collision shape against all bodies. */
  sweepShape(
    shape: CollisionShape,
    position: Vec3Like,
    displacement: Vec3Like,
    maxTime = 1,
  ): SweepBodyHit[] {
    const travel = {
      x: displacement.x * maxTime,
      y: displacement.y * maxTime,
      z: displacement.z * maxTime,
    };
    const startBounds = collisionShapeBounds(shape, position);
    const sweptBounds = new SpatialAABB(
      new SpatialVec3(
        Math.min(startBounds.min.x, startBounds.min.x + travel.x),
        Math.min(startBounds.min.y, startBounds.min.y + travel.y),
        Math.min(startBounds.min.z, startBounds.min.z + travel.z),
      ),
      new SpatialVec3(
        Math.max(startBounds.max.x, startBounds.max.x + travel.x),
        Math.max(startBounds.max.y, startBounds.max.y + travel.y),
        Math.max(startBounds.max.z, startBounds.max.z + travel.z),
      ),
    );

    const hits: SweepBodyHit[] = [];
    for (const body of this.bodies.values()) {
      const targetBounds = bodyBounds(body);
      if (!sweptBounds.intersects(targetBounds)) continue;

      const hit = sweepCollisionShapeAgainstAABB(shape, position, travel, targetBounds);
      if (!hit.hit) continue;
      hits.push({
        hit: true,
        timeOfImpact: hit.timeOfImpact,
        distance: hit.distance,
        point: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
        normal: { x: hit.normal.x, y: hit.normal.y, z: hit.normal.z },
        bodyId: body.id,
        colliderShape: body.shape.kind,
      });
    }

    return hits.sort((a, b) => a.timeOfImpact - b.timeOfImpact);
  }

  /** Sweep a raw spatial shape against the physics bodies. */
  sweepSpatialShape(shape: SweepShape, displacement: Vec3Like, maxTime = 1): Array<SweepHit & { bodyId?: string }> {
    const position = shape.kind === 'sphere'
      ? shape.center
      : shape.kind === 'box'
        ? shape.box.center
        : shape.kind === 'obb'
          ? shape.box.center
          : shape.capsule.center;

    const collisionShape: CollisionShape = shape.kind === 'sphere'
      ? { kind: 'sphere', radius: shape.radius }
      : shape.kind === 'box'
        ? { kind: 'box', half: shape.box.halfExtents }
        : shape.kind === 'obb'
          ? { kind: 'box', half: shape.box.halfExtents }
          : { kind: 'capsule', radius: shape.capsule.radius, height: shape.capsule.height };

    return this.sweepShape(collisionShape, position, displacement, maxTime).map((hit) => ({
      hit: hit.hit,
      timeOfImpact: hit.timeOfImpact,
      point: hit.point,
      normal: hit.normal,
      distance: hit.distance,
      bodyId: hit.bodyId,
    }));
  }
}
