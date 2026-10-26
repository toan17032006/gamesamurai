/**
 * @file sweep.ts
 * @module @aetheria/engine/spatial/sweep
 * @description Continuous collision detection: sphere/box/capsule sweeps against
 * AABB, OBB, triangle meshes and BVHs using conservative advancement.
 */

import { AABB, Capsule, OBB, Sphere } from './bounds.js';
import { TriangleBVH, type TriangleBVHHit } from './bvh.js';
import { Triangle } from './primitives.js';
import {
  EPSILON,
  Vec3,
  Vec3Like,
  clamp,
  closestPointOnAABB,
  closestPointOnSegment,
  type SweepHitResult,
} from './math.js';

export type SweepShape =
  | { kind: 'sphere'; center: Vec3Like; radius: number }
  | { kind: 'box'; box: AABB }
  | { kind: 'obb'; box: OBB }
  | { kind: 'capsule'; capsule: Capsule };

export interface SweepOptions {
  /** Maximum time of impact in `[0, 1]` (default 1). */
  maxTime?: number;
  /** Numerical tolerance for conservative advancement. */
  tolerance?: number;
  /** Maximum conservative-advancement iterations. */
  maxIterations?: number;
}

export interface BoundsSweepHit extends SweepHitResult {
  /** Bounding volume that was hit (when sweeping a BVH). */
  normal: Vec3;
}

const DEFAULT_TOLERANCE = 1e-5;
const DEFAULT_ITERATIONS = 64;

function emptySweep(): SweepHitResult {
  return {
    hit: false,
    timeOfImpact: 1,
    distance: Infinity,
    point: new Vec3(),
    normal: new Vec3(),
  };
}

/** Normal to escape an AABB from an interior point along the shallowest axis. */
function interiorNormal(point: Vec3Like, box: AABB): Vec3 {
  const center = box.center;
  const half = box.halfExtents;
  const dx = half.x - Math.abs(point.x - center.x);
  const dy = half.y - Math.abs(point.y - center.y);
  const dz = half.z - Math.abs(point.z - center.z);
  if (dx <= dy && dx <= dz) return new Vec3(point.x >= center.x ? 1 : -1, 0, 0);
  if (dy <= dz) return new Vec3(0, point.y >= center.y ? 1 : -1, 0);
  return new Vec3(0, 0, point.z >= center.z ? 1 : -1);
}

/**
 * Sweep a sphere against an AABB. Returns the first time of impact and a
 * contact normal pointing from the box toward the sphere.
 */
export function sweepSphereAABB(
  center: Vec3Like,
  radius: number,
  displacement: Vec3Like,
  box: AABB,
  options: SweepOptions = {},
): SweepHitResult {
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const maxTime = clamp(options.maxTime ?? 1, 0, 1);
  const iterations = Math.max(1, options.maxIterations ?? DEFAULT_ITERATIONS);
  const travel = Vec3.from(displacement).mulScalar(maxTime);
  const length = travel.length();
  const start = Vec3.from(center);

  const at = (t: number): Vec3 => start.clone().addScaled(travel, t);
  const distanceAt = (t: number): { dist: number; closest: Vec3 } => {
    const p = at(t);
    const closest = box.closestPoint(p);
    return { dist: p.distanceTo(closest), closest };
  };

  const initial = distanceAt(0);
  if (initial.dist <= radius + tolerance) {
    const normal = initial.dist > EPSILON
      ? Vec3.sub(at(0), initial.closest).normalize()
      : interiorNormal(at(0), box);
    return {
      hit: true,
      timeOfImpact: 0,
      distance: 0,
      point: at(0).addScaled(normal, -radius),
      normal,
    };
  }

  if (length < EPSILON) return emptySweep();

  let t = 0;
  for (let i = 0; i < iterations; i += 1) {
    const sample = distanceAt(t);
    if (sample.dist <= radius + tolerance) {
      const normal = sample.dist > EPSILON
        ? Vec3.sub(at(t), sample.closest).normalize()
        : interiorNormal(at(t), box);
      return {
        hit: true,
        timeOfImpact: t,
        distance: t * length,
        point: at(t).addScaled(normal, -radius),
        normal,
      };
    }

    // The distance field is 1-Lipschitz along the sweep, so this step can
    // never tunnel through the box.
    const step = (sample.dist - radius) / length;
    if (step < tolerance) return emptySweep();
    t += step;
    if (t > maxTime + tolerance) return emptySweep();
  }

  return emptySweep();
}

/** Sweep an axis-aligned box against another AABB via Minkowski expansion. */
export function sweepAABBAABB(
  box: AABB,
  displacement: Vec3Like,
  target: AABB,
  options: SweepOptions = {},
): SweepHitResult {
  const maxTime = clamp(options.maxTime ?? 1, 0, 1);
  const half = box.halfExtents;
  const expanded = new AABB(
    new Vec3(target.min.x - half.x, target.min.y - half.y, target.min.z - half.z),
    new Vec3(target.max.x + half.x, target.max.y + half.y, target.max.z + half.z),
  );
  const travel = Vec3.from(displacement).mulScalar(maxTime);
  const center = box.center;

  if (expanded.containsPoint(center)) {
    return {
      hit: true,
      timeOfImpact: 0,
      distance: 0,
      point: center.clone(),
      normal: interiorNormal(center, target),
    };
  }

  const hit = expanded.rayIntersection({ origin: center, direction: travel, maxDistance: 1 });
  if (!hit.hit) return emptySweep();

  return {
    hit: true,
    timeOfImpact: hit.distance,
    distance: hit.distance * travel.length(),
    point: center.clone().addScaled(travel, hit.distance),
    normal: hit.normal,
  };
}

/** Sweep a sphere against an OBB by transforming into the box's local space. */
export function sweepSphereOBB(
  center: Vec3Like,
  radius: number,
  displacement: Vec3Like,
  box: OBB,
  options: SweepOptions = {},
): SweepHitResult {
  const axes = box.getAxes();
  const delta = Vec3.sub(center, box.center);
  const localCenter = new Vec3(delta.dot(axes[0]), delta.dot(axes[1]), delta.dot(axes[2]));
  const localDisplacement = new Vec3(
    displacement.x * axes[0].x + displacement.y * axes[0].y + displacement.z * axes[0].z,
    displacement.x * axes[1].x + displacement.y * axes[1].y + displacement.z * axes[1].z,
    displacement.x * axes[2].x + displacement.y * axes[2].y + displacement.z * axes[2].z,
  );
  const localBox = new AABB(Vec3.scale(box.halfExtents, -1), box.halfExtents);
  const hit = sweepSphereAABB(localCenter, radius, localDisplacement, localBox, options);
  if (!hit.hit) return hit;

  const worldPoint = new Vec3()
    .copy(box.center)
    .addScaled(axes[0], hit.point.x)
    .addScaled(axes[1], hit.point.y)
    .addScaled(axes[2], hit.point.z);
  const worldNormal = new Vec3()
    .addScaled(axes[0], hit.normal.x)
    .addScaled(axes[1], hit.normal.y)
    .addScaled(axes[2], hit.normal.z)
    .normalize();

  return { ...hit, point: worldPoint, normal: worldNormal };
}

/** Squared distance between a segment and an AABB via ternary search. */
export function segmentAABBDistanceSq(a: Vec3Like, b: Vec3Like, box: AABB): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i += 1) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    const p1 = Vec3.lerp(a, b, m1);
    const p2 = Vec3.lerp(a, b, m2);
    if (p1.distanceSqTo(box.closestPoint(p1)) < p2.distanceSqTo(box.closestPoint(p2))) hi = m2;
    else lo = m1;
  }
  const point = Vec3.lerp(a, b, (lo + hi) * 0.5);
  return point.distanceSqTo(box.closestPoint(point));
}

/** Closest point on a segment to an AABB. */
export function closestSegmentPointToAABB(a: Vec3Like, b: Vec3Like, box: AABB): Vec3 {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i += 1) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    const p1 = Vec3.lerp(a, b, m1);
    const p2 = Vec3.lerp(a, b, m2);
    if (p1.distanceSqTo(box.closestPoint(p1)) < p2.distanceSqTo(box.closestPoint(p2))) hi = m2;
    else lo = m1;
  }
  return Vec3.lerp(a, b, (lo + hi) * 0.5);
}

/** Sweep a capsule against an AABB using conservative advancement. */
export function sweepCapsuleAABB(
  capsule: Capsule,
  displacement: Vec3Like,
  box: AABB,
  options: SweepOptions = {},
): SweepHitResult {
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const maxTime = clamp(options.maxTime ?? 1, 0, 1);
  const iterations = Math.max(1, options.maxIterations ?? DEFAULT_ITERATIONS);
  const travel = Vec3.from(displacement).mulScalar(maxTime);
  const length = travel.length();

  const at = (t: number): { a: Vec3; b: Vec3 } => ({
    a: capsule.start.clone().addScaled(travel, t),
    b: capsule.end.clone().addScaled(travel, t),
  });

  const initial = at(0);
  if (segmentAABBDistanceSq(initial.a, initial.b, box) <= capsule.radius * capsule.radius) {
    const segPoint = closestSegmentPointToAABB(initial.a, initial.b, box);
    const closest = box.closestPoint(segPoint);
    const normal = segPoint.distanceSqTo(closest) > 1e-12
      ? Vec3.sub(segPoint, closest).normalize()
      : interiorNormal(segPoint, box);
    return {
      hit: true,
      timeOfImpact: 0,
      distance: 0,
      point: segPoint.clone().addScaled(normal, -capsule.radius),
      normal,
    };
  }

  if (length < EPSILON) return emptySweep();

  let t = 0;
  for (let i = 0; i < iterations; i += 1) {
    const segment = at(t);
    const distSq = segmentAABBDistanceSq(segment.a, segment.b, box);
    const distance = Math.sqrt(distSq);
    const segPoint = closestSegmentPointToAABB(segment.a, segment.b, box);
    const closest = box.closestPoint(segPoint);

    if (distance <= capsule.radius + tolerance) {
      const normal = segPoint.distanceSqTo(closest) > 1e-12
        ? Vec3.sub(segPoint, closest).normalize()
        : interiorNormal(segPoint, box);
      return {
        hit: true,
        timeOfImpact: t,
        distance: t * length,
        point: segPoint.addScaled(normal, -capsule.radius),
        normal,
      };
    }

    const step = (distance - capsule.radius) / length;
    if (step < tolerance) return emptySweep();
    t += step;
    if (t > maxTime + tolerance) return emptySweep();
  }

  return emptySweep();
}

/** Sweep a capsule against an OBB through its local space. */
export function sweepCapsuleOBB(
  capsule: Capsule,
  displacement: Vec3Like,
  box: OBB,
  options: SweepOptions = {},
): SweepHitResult {
  const axes = box.getAxes();
  const toLocal = (p: Vec3Like): Vec3 => {
    const d = Vec3.sub(p, box.center);
    return new Vec3(d.dot(axes[0]), d.dot(axes[1]), d.dot(axes[2]));
  };
  const toLocalVec = (v: Vec3Like): Vec3 => new Vec3(
    Vec3.dot(v, axes[0]),
    Vec3.dot(v, axes[1]),
    Vec3.dot(v, axes[2]),
  );
  const localCapsule = new Capsule(toLocal(capsule.start), toLocal(capsule.end), capsule.radius);
  const localBox = new AABB(Vec3.scale(box.halfExtents, -1), box.halfExtents);
  const hit = sweepCapsuleAABB(localCapsule, toLocalVec(displacement), localBox, options);
  if (!hit.hit) return hit;

  const worldPoint = new Vec3()
    .copy(box.center)
    .addScaled(axes[0], hit.point.x)
    .addScaled(axes[1], hit.point.y)
    .addScaled(axes[2], hit.point.z);
  const worldNormal = new Vec3()
    .addScaled(axes[0], hit.normal.x)
    .addScaled(axes[1], hit.normal.y)
    .addScaled(axes[2], hit.normal.z)
    .normalize();
  return { ...hit, point: worldPoint, normal: worldNormal };
}

/** Sweep a sphere against a triangle using conservative advancement. */
export function sweepSphereTriangle(
  center: Vec3Like,
  radius: number,
  displacement: Vec3Like,
  triangle: Triangle,
  options: SweepOptions = {},
): SweepHitResult {
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const maxTime = clamp(options.maxTime ?? 1, 0, 1);
  const iterations = Math.max(1, options.maxIterations ?? DEFAULT_ITERATIONS);
  const travel = Vec3.from(displacement).mulScalar(maxTime);
  const length = travel.length();
  const start = Vec3.from(center);

  const at = (t: number): Vec3 => start.clone().addScaled(travel, t);
  const distanceAt = (t: number): { dist: number; closest: Vec3 } => {
    const p = at(t);
    const closest = triangle.closestPoint(p);
    return { dist: p.distanceTo(closest), closest };
  };

  const initial = distanceAt(0);
  if (initial.dist <= radius + tolerance) {
    const normal = initial.dist > EPSILON ? Vec3.sub(at(0), initial.closest).normalize() : triangle.normal;
    return {
      hit: true,
      timeOfImpact: 0,
      distance: 0,
      point: at(0).addScaled(normal, -radius),
      normal,
    };
  }

  if (length < EPSILON) return emptySweep();

  let t = 0;
  for (let i = 0; i < iterations; i += 1) {
    const sample = distanceAt(t);
    if (sample.dist <= radius + tolerance) {
      const normal = sample.dist > EPSILON
        ? Vec3.sub(at(t), sample.closest).normalize()
        : triangle.normal;
      return {
        hit: true,
        timeOfImpact: t,
        distance: t * length,
        point: at(t).addScaled(normal, -radius),
        normal,
      };
    }
    const step = (sample.dist - radius) / length;
    if (step < tolerance) return emptySweep();
    t += step;
    if (t > maxTime + tolerance) return emptySweep();
  }
  return emptySweep();
}

/** Sweep a sphere against a triangle BVH and return the closest triangle hit. */
export function sweepSphereBVH(
  center: Vec3Like,
  radius: number,
  displacement: Vec3Like,
  bvh: TriangleBVH,
  options: SweepOptions = {},
): (SweepHitResult & { triangleIndex: number; triangle: Triangle }) | null {
  const travel = Vec3.from(displacement).mulScalar(options.maxTime ?? 1);
  const sweptAABB = AABB.fromPoints([
    center,
    Vec3.add(center, travel),
  ]).expandByScalar(radius);
  const candidates = bvh.bvh.queryAABB(sweptAABB);

  let best: (SweepHitResult & { triangleIndex: number; triangle: Triangle }) | null = null;
  for (const candidate of candidates) {
    const hit = sweepSphereTriangle(center, radius, displacement, candidate.triangle, options);
    if (hit.hit && (!best || hit.timeOfImpact < best.timeOfImpact)) {
      best = {
        ...hit,
        triangle: candidate.triangle,
        triangleIndex: candidate.index,
      };
    }
  }
  return best;
}

/** Cast a ray against a triangle BVH (thin wrapper for API symmetry). */
export function raycastTriangleBVH(
  origin: Vec3Like,
  direction: Vec3Like,
  bvh: TriangleBVH,
  maxDistance = Infinity,
): TriangleBVHHit | null {
  return bvh.raycast(
    { origin, direction: Vec3.from(direction).normalize(), maxDistance },
    maxDistance,
  );
}

/** Dispatch a typed sweep shape against a single AABB. */
export function sweepShapeAABB(
  shape: SweepShape,
  displacement: Vec3Like,
  target: AABB,
  options: SweepOptions = {},
): SweepHitResult {
  switch (shape.kind) {
    case 'sphere':
      return sweepSphereAABB(shape.center, shape.radius, displacement, target, options);
    case 'box':
      return sweepAABBAABB(shape.box, displacement, target, options);
    case 'obb':
      return sweepAABBAABB(shape.box.toAABB(), displacement, target, options);
    case 'capsule':
      return sweepCapsuleAABB(shape.capsule, displacement, target, options);
  }
}

/** Compute the world-space AABB covered by a sweep. */
export function sweptBounds(shape: SweepShape, displacement: Vec3Like, maxTime = 1): AABB {
  const travel = Vec3.from(displacement).mulScalar(maxTime);
  switch (shape.kind) {
    case 'sphere': {
      const startBox = new Sphere(shape.center, shape.radius).aabb;
      const endBox = new Sphere(Vec3.add(shape.center, travel), shape.radius).aabb;
      return startBox.union(endBox);
    }
    case 'box': {
      const startBox = shape.box.clone();
      const endBox = new AABB(
        Vec3.add(shape.box.min, travel),
        Vec3.add(shape.box.max, travel),
      );
      return startBox.union(endBox);
    }
    case 'obb': {
      const startBox = shape.box.toAABB();
      const endBox = shape.box.toAABB();
      endBox.min.add(travel);
      endBox.max.add(travel);
      return startBox.union(endBox);
    }
    case 'capsule': {
      const startBox = shape.capsule.aabb;
      const endCapsule = new Capsule(
        Vec3.add(shape.capsule.start, travel),
        Vec3.add(shape.capsule.end, travel),
        shape.capsule.radius,
      );
      return startBox.union(endCapsule.aabb);
    }
  }
}

export { closestPointOnSegment, closestPointOnAABB };
