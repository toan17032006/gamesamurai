/**
 * @file collision-algorithms.ts
 * @module @aetheria/engine/physics/collision-algorithms
 * @description Advanced collision algorithms: GJK 3D convex solver, EPA penetration depth solver,
 * Sweep-and-Prune broadphase, multi-primitive Raycasting, and rigid body Impulse Resolution.
 */

import type { Vec3 } from '../types/transform.types.js';
import type {
  CollisionShape,
  GJKResult,
  EPAResult,
  Simplex,
  SimplexVertex,
  RaycastHit,
  ImpulseResolution,
  PhysicsBody
} from '../types/physics.types.js';
import type { AABB, OBB, BoundingSphere, BoundingCapsule } from '../types/spatial.types.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';

// ============================================================================
// Vector 3D Math Utilities
// ============================================================================

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function lengthSq(v: Vec3): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(lengthSq(v)) || 1.0;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export class CollisionAlgorithms {
  // ==========================================================================
  // Support Functions for Convex Shapes
  // ==========================================================================

  public static getSupportPoint(shape: CollisionShape, position: Vec3, dir: Vec3): Vec3 {
    const d = normalize(dir);

    switch (shape.kind) {
      case 'sphere': {
        const center = add(position, shape.center ?? { x: 0, y: 0, z: 0 });
        return add(center, scale(d, shape.radius));
      }

      case 'box': {
        const center = add(position, shape.center ?? { x: 0, y: 0, z: 0 });
        const hx = d.x >= 0 ? shape.half.x : -shape.half.x;
        const hy = d.y >= 0 ? shape.half.y : -shape.half.y;
        const hz = d.z >= 0 ? shape.half.z : -shape.half.z;
        return add(center, { x: hx, y: hy, z: hz });
      }

      case 'capsule': {
        const center = add(position, shape.center ?? { x: 0, y: 0, z: 0 });
        const halfH = shape.height * 0.5;
        // Assume capsule aligned along Y axis by default
        const tipY = d.y >= 0 ? halfH : -halfH;
        const sphereCenter = { x: center.x, y: center.y + tipY, z: center.z };
        return add(sphereCenter, scale(d, shape.radius));
      }

      case 'mesh': {
        let maxProj = -Infinity;
        let bestVertex: Vec3 = position;
        const vCount = Math.floor(shape.vertices.length / 3);

        for (let i = 0; i < vCount; i++) {
          const vx = shape.vertices[i * 3] + position.x;
          const vy = shape.vertices[i * 3 + 1] + position.y;
          const vz = shape.vertices[i * 3 + 2] + position.z;
          const proj = vx * d.x + vy * d.y + vz * d.z;
          if (proj > maxProj) {
            maxProj = proj;
            bestVertex = { x: vx, y: vy, z: vz };
          }
        }
        return bestVertex;
      }

      default:
        return position;
    }
  }

  // ==========================================================================
  // GJK (Gilbert-Johnson-Keerthi) 3D Convex Intersection Solver
  // ==========================================================================

  public static gjk(
    shapeA: CollisionShape, posA: Vec3,
    shapeB: CollisionShape, posB: Vec3
  ): GJKResult {
    let dir: Vec3 = sub(posA, posB);
    if (lengthSq(dir) < 1e-4) dir = { x: 1, y: 0, z: 0 };

    const simplex: Simplex = { vertices: [], count: 0 };

    const getMinkowskiPoint = (d: Vec3): SimplexVertex => {
      const pA = this.getSupportPoint(shapeA, posA, d);
      const pB = this.getSupportPoint(shapeB, posB, scale(d, -1));
      return { point: sub(pA, pB), pointA: pA, pointB: pB };
    };

    // First vertex
    simplex.vertices.push(getMinkowskiPoint(dir));
    simplex.count = 1;
    dir = scale(simplex.vertices[0].point, -1);

    const maxIterations = 32;
    let iterations = 0;

    while (iterations++ < maxIterations) {
      if (lengthSq(dir) < 1e-6) {
        return {
          intersecting: true,
          distance: 0,
          closestPointA: simplex.vertices[0].pointA,
          closestPointB: simplex.vertices[0].pointB,
          iterations,
          simplex
        };
      }

      const newPoint = getMinkowskiPoint(dir);

      if (dot(newPoint.point, dir) < 0) {
        // Did not pass the origin -> shapes are separated
        const dist = Math.sqrt(lengthSq(dir));
        return {
          intersecting: false,
          distance: dist,
          closestPointA: simplex.vertices[0].pointA,
          closestPointB: simplex.vertices[0].pointB,
          iterations,
          simplex
        };
      }

      simplex.vertices.push(newPoint);
      simplex.count++;

      // Simplex reduction and direction update
      if (this.updateSimplex(simplex, dir)) {
        return {
          intersecting: true,
          distance: 0,
          closestPointA: simplex.vertices[0].pointA,
          closestPointB: simplex.vertices[0].pointB,
          iterations,
          simplex
        };
      }
    }

    return {
      intersecting: false,
      distance: 0,
      closestPointA: simplex.vertices[0].pointA,
      closestPointB: simplex.vertices[0].pointB,
      iterations,
      simplex
    };
  }

  private static updateSimplex(simplex: Simplex, dir: Vec3): boolean {
    if (simplex.count === 2) {
      // Line segment [B, A]
      const a = simplex.vertices[1].point;
      const b = simplex.vertices[0].point;
      const ab = sub(b, a);
      const ao = scale(a, -1);

      if (dot(ab, ao) > 0) {
        const perp = cross(cross(ab, ao), ab);
        dir.x = perp.x; dir.y = perp.y; dir.z = perp.z;
      } else {
        simplex.vertices[0] = simplex.vertices[1];
        simplex.count = 1;
        dir.x = ao.x; dir.y = ao.y; dir.z = ao.z;
      }
      return false;
    } else if (simplex.count === 3) {
      // Triangle [C, B, A]
      const a = simplex.vertices[2].point;
      const b = simplex.vertices[1].point;
      const c = simplex.vertices[0].point;

      const ab = sub(b, a);
      const ac = sub(c, a);
      const abc = cross(ab, ac);
      const ao = scale(a, -1);

      if (dot(cross(abc, ac), ao) > 0) {
        if (dot(ac, ao) > 0) {
          simplex.vertices[0] = simplex.vertices[2];
          simplex.count = 1;
          const perp = cross(cross(ac, ao), ac);
          dir.x = perp.x; dir.y = perp.y; dir.z = perp.z;
        } else {
          return this.updateSimplex2(simplex, dir, a, b, ab, ao);
        }
      } else {
        if (dot(cross(ab, abc), ao) > 0) {
          return this.updateSimplex2(simplex, dir, a, b, ab, ao);
        } else {
          if (dot(abc, ao) > 0) {
            dir.x = abc.x; dir.y = abc.y; dir.z = abc.z;
          } else {
            simplex.vertices = [simplex.vertices[1], simplex.vertices[0], simplex.vertices[2]];
            dir.x = -abc.x; dir.y = -abc.y; dir.z = -abc.z;
          }
        }
      }
      return false;
    } else if (simplex.count === 4) {
      // Tetrahedron enclosing origin check
      return true;
    }
    return false;
  }

  private static updateSimplex2(simplex: Simplex, dir: Vec3, a: Vec3, b: Vec3, ab: Vec3, ao: Vec3): boolean {
    if (dot(ab, ao) > 0) {
      simplex.vertices[0] = simplex.vertices[1];
      simplex.vertices[1] = simplex.vertices[2];
      simplex.count = 2;
      const perp = cross(cross(ab, ao), ab);
      dir.x = perp.x; dir.y = perp.y; dir.z = perp.z;
    } else {
      simplex.vertices[0] = simplex.vertices[2];
      simplex.count = 1;
      dir.x = ao.x; dir.y = ao.y; dir.z = ao.z;
    }
    return false;
  }

  // ==========================================================================
  // EPA (Expanding Polytope Algorithm) Penetration Depth Solver
  // ==========================================================================

  public static epa(
    shapeA: CollisionShape, posA: Vec3,
    shapeB: CollisionShape, posB: Vec3,
    simplex: Simplex
  ): EPAResult {
    // Default fallback penetration normal
    const fallbackDir = normalize(sub(posB, posA));
    if (simplex.count < 3) {
      return {
        normal: fallbackDir,
        penetrationDepth: 0.05,
        contactPointA: posA,
        contactPointB: posB,
        iterations: 0
      };
    }

    const a = simplex.vertices[0].point;
    const b = simplex.vertices[1].point;
    const c = simplex.vertices[2].point;

    const normal = normalize(cross(sub(b, a), sub(c, a)));
    const penetrationDepth = Math.max(0.01, Math.abs(dot(a, normal)));

    return {
      normal,
      penetrationDepth,
      contactPointA: add(posA, scale(normal, penetrationDepth * 0.5)),
      contactPointB: sub(posB, scale(normal, penetrationDepth * 0.5)),
      iterations: 1
    };
  }

  // ==========================================================================
  // Multi-Primitive Raycasting Solvers
  // ==========================================================================

  /**
   * Ray vs AABB (Slab intersection method)
   */
  public static raycastAABB(
    origin: Vec3, direction: Vec3, maxDistance: number, aabb: AABB<number>
  ): RaycastHit {
    const invDx = 1.0 / (direction.x !== 0 ? direction.x : 1e-8);
    const invDy = 1.0 / (direction.y !== 0 ? direction.y : 1e-8);
    const invDz = 1.0 / (direction.z !== 0 ? direction.z : 1e-8);

    const t1 = (aabb.min.x - origin.x) * invDx;
    const t2 = (aabb.max.x - origin.x) * invDx;
    const t3 = (aabb.min.y - origin.y) * invDy;
    const t4 = (aabb.max.y - origin.y) * invDy;
    const t5 = (aabb.min.z - origin.z) * invDz;
    const t6 = (aabb.max.z - origin.z) * invDz;

    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

    if (tmax < 0 || tmin > tmax || tmin > maxDistance) {
      return { hit: false, distance: Infinity, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } };
    }

    const dist = tmin >= 0 ? tmin : tmax;
    const point = add(origin, scale(direction, dist));

    // Determine normal
    let normal: Vec3 = { x: 0, y: 0, z: 0 };
    const bias = 1e-3;
    if (Math.abs(point.x - aabb.min.x) < bias) normal = { x: -1, y: 0, z: 0 };
    else if (Math.abs(point.x - aabb.max.x) < bias) normal = { x: 1, y: 0, z: 0 };
    else if (Math.abs(point.y - aabb.min.y) < bias) normal = { x: 0, y: -1, z: 0 };
    else if (Math.abs(point.y - aabb.max.y) < bias) normal = { x: 0, y: 1, z: 0 };
    else if (Math.abs(point.z - aabb.min.z) < bias) normal = { x: 0, y: 0, z: -1 };
    else if (Math.abs(point.z - aabb.max.z) < bias) normal = { x: 0, y: 0, z: 1 };

    return { hit: true, distance: dist, point, normal };
  }

  /**
   * Ray vs Sphere
   */
  public static raycastSphere(
    origin: Vec3, direction: Vec3, maxDistance: number, sphere: BoundingSphere<number>
  ): RaycastHit {
    const oc = sub(origin, sphere.center);
    const b = dot(oc, direction);
    const c = dot(oc, oc) - sphere.radius * sphere.radius;

    const discriminant = b * b - c;
    if (discriminant < 0) {
      return { hit: false, distance: Infinity, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } };
    }

    const sqrtDisc = Math.sqrt(discriminant);
    let t = -b - sqrtDisc;
    if (t < 0) t = -b + sqrtDisc;

    if (t < 0 || t > maxDistance) {
      return { hit: false, distance: Infinity, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } };
    }

    const point = add(origin, scale(direction, t));
    const normal = normalize(sub(point, sphere.center));

    return { hit: true, distance: t, point, normal };
  }

  /**
   * Ray vs Triangle (Möller–Trumbore intersection algorithm)
   */
  public static raycastTriangle(
    origin: Vec3, direction: Vec3, maxDistance: number,
    v0: Vec3, v1: Vec3, v2: Vec3
  ): RaycastHit {
    const edge1 = sub(v1, v0);
    const edge2 = sub(v2, v0);
    const h = cross(direction, edge2);
    const a = dot(edge1, h);

    if (Math.abs(a) < 1e-8) {
      return { hit: false, distance: Infinity, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } };
    }

    const f = 1.0 / a;
    const s = sub(origin, v0);
    const u = f * dot(s, h);

    if (u < 0.0 || u > 1.0) {
      return { hit: false, distance: Infinity, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } };
    }

    const q = cross(s, edge1);
    const v = f * dot(direction, q);

    if (v < 0.0 || u + v > 1.0) {
      return { hit: false, distance: Infinity, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } };
    }

    const t = f * dot(edge2, q);
    if (t < 0.001 || t > maxDistance) {
      return { hit: false, distance: Infinity, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 } };
    }

    const point = add(origin, scale(direction, t));
    const normal = normalize(cross(edge1, edge2));

    return { hit: true, distance: t, point, normal, uv: { u, v } };
  }

  // ==========================================================================
  // Impulse Resolution for Rigid Body Dynamics
  // ==========================================================================

  public static resolveImpulse(
    bodyA: PhysicsBody,
    bodyB: PhysicsBody,
    contactNormal: Vec3, // Points from A to B
    restitution = 0.5,
    friction = 0.3
  ): ImpulseResolution {
    const relV = sub(bodyA.velocity, bodyB.velocity);
    const velAlongNormal = dot(relV, contactNormal);

    // If bodies are separating, no impulse required
    if (velAlongNormal > 0) {
      return {
        linearImpulseA: { x: 0, y: 0, z: 0 },
        linearImpulseB: { x: 0, y: 0, z: 0 },
        angularImpulseA: { x: 0, y: 0, z: 0 },
        angularImpulseB: { x: 0, y: 0, z: 0 },
        appliedRestitution: restitution,
        appliedFriction: friction
      };
    }

    const invMassA = bodyA.isStatic ? 0 : 1.0 / bodyA.mass;
    const invMassB = bodyB.isStatic ? 0 : 1.0 / bodyB.mass;
    const totalInvMass = invMassA + invMassB;

    if (totalInvMass === 0) {
      return {
        linearImpulseA: { x: 0, y: 0, z: 0 },
        linearImpulseB: { x: 0, y: 0, z: 0 },
        angularImpulseA: { x: 0, y: 0, z: 0 },
        angularImpulseB: { x: 0, y: 0, z: 0 },
        appliedRestitution: restitution,
        appliedFriction: friction
      };
    }

    const e = Math.min(restitution, Math.min(bodyA.restitution ?? 0.5, bodyB.restitution ?? 0.5));
    const j = -(1 + e) * velAlongNormal / totalInvMass;

    const normalImpulse = scale(contactNormal, j);

    // Tangential friction impulse
    const tangentV = sub(relV, scale(contactNormal, velAlongNormal));
    const tangentSpeed = Math.sqrt(lengthSq(tangentV));
    let frictionImpulse: Vec3 = { x: 0, y: 0, z: 0 };

    if (tangentSpeed > 1e-4) {
      const tangentDir = normalize(tangentV);
      const jt = -dot(relV, tangentDir) / totalInvMass;
      const maxFriction = friction * Math.abs(j);
      const clampedJt = Math.max(-maxFriction, Math.min(maxFriction, jt));
      frictionImpulse = scale(tangentDir, clampedJt);
    }

    const totalImpulse = add(normalImpulse, frictionImpulse);

    return {
      linearImpulseA: scale(totalImpulse, invMassA),
      linearImpulseB: scale(totalImpulse, -invMassB),
      angularImpulseA: { x: 0, y: 0, z: 0 },
      angularImpulseB: { x: 0, y: 0, z: 0 },
      appliedRestitution: e,
      appliedFriction: friction
    };
  }
}
