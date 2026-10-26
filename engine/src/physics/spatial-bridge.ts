/**
 * @file spatial-bridge.ts
 * @module @aetheria/engine/physics/spatial-bridge
 * @description Bridges the engine's physics collision shapes to the pure spatial
 * bounds/sweep module. Keeps physics independent from render meshes.
 */

import * as THREE from 'three';
import type { CollisionShape, PhysicsBody, RaycastHit, SweepHit } from '../types/physics.types.js';
import {
  AABB,
  Capsule,
  OBB,
  Quat,
  Sphere,
  Vec3 as SpatialVec3,
  Vec3Like,
  sweepCapsuleAABB,
  sweepCapsuleOBB,
  sweepSphereAABB,
  sweepSphereOBB,
  sweepAABBAABB,
  type SpatialHit,
  type SweepHitResult,
  type SweepShape,
} from '../spatial/index.js';

export interface SweepBodyHit extends SweepHit {
  bodyId: string;
  colliderShape: CollisionShape['kind'];
}

export interface ShapeTransform {
  position: Vec3Like;
  /** Optional body orientation as a quaternion. */
  orientation?: { x: number; y: number; z: number; w: number };
}

function shapeOffset(shape: CollisionShape): Vec3Like {
  if ('center' in shape && shape.center) return shape.center;
  return { x: 0, y: 0, z: 0 };
}

/** World-space center of a collision shape attached to a body. */
export function collisionShapeCenter(shape: CollisionShape, position: Vec3Like): SpatialVec3 {
  const offset = shapeOffset(shape);
  return new SpatialVec3(
    position.x + offset.x,
    position.y + offset.y,
    position.z + offset.z,
  );
}

/** Compute an AABB for any primitive collision shape. */
export function collisionShapeBounds(shape: CollisionShape, position: Vec3Like): AABB {
  const center = collisionShapeCenter(shape, position);
  switch (shape.kind) {
    case 'sphere':
      return new Sphere(center, shape.radius).aabb;
    case 'box':
      return new AABB(
        new SpatialVec3(center.x - shape.half.x, center.y - shape.half.y, center.z - shape.half.z),
        new SpatialVec3(center.x + shape.half.x, center.y + shape.half.y, center.z + shape.half.z),
      );
    case 'capsule':
      return Capsule.fromCenterHeight(center, shape.radius, shape.height, shape.axis ?? 'y').aabb;
    case 'cylinder': {
      const r = shape.radius;
      const half = shape.height / 2;
      return new AABB(
        new SpatialVec3(center.x - r, center.y - half, center.z - r),
        new SpatialVec3(center.x + r, center.y + half, center.z + r),
      );
    }
    case 'mesh': {
      const box = AABB.empty();
      const vertices = shape.vertices;
      for (let i = 0; i + 2 < vertices.length; i += 3) {
        box.expandByPoint(new SpatialVec3(
          center.x + vertices[i],
          center.y + vertices[i + 1],
          center.z + vertices[i + 2],
        ));
      }
      return box.isEmpty() ? new AABB(center, center) : box;
    }
    case 'compound': {
      const box = AABB.empty();
      for (const child of shape.children) {
        const childPos = new SpatialVec3(
          center.x + child.offset.x,
          center.y + child.offset.y,
          center.z + child.offset.z,
        );
        box.union(collisionShapeBounds(child.shape, childPos));
      }
      return box.isEmpty() ? new AABB(center, center) : box;
    }
  }
}

/** AABB of a body in world space. */
export function bodyBounds(body: PhysicsBody): AABB {
  return collisionShapeBounds(body.shape, body.position);
}

/** Convert a collision shape into a spatial sweep primitive. */
export function collisionShapeToSweep(shape: CollisionShape, position: Vec3Like): SweepShape | null {
  const center = collisionShapeCenter(shape, position);
  switch (shape.kind) {
    case 'sphere':
      return { kind: 'sphere', center, radius: shape.radius };
    case 'box': {
      const orientation = new Quat();
      return { kind: 'obb', box: OBB.fromCenterSize(center, shape.half, orientation) };
    }
    case 'capsule': {
      const capsule = Capsule.fromCenterHeight(center, shape.radius, shape.height, shape.axis ?? 'y');
      return { kind: 'capsule', capsule };
    }
    default:
      return null;
  }
}

/** Raycast against a primitive collision shape. */
export function raycastCollisionShape(
  origin: Vec3Like,
  direction: Vec3Like,
  maxDistance: number,
  shape: CollisionShape,
  position: Vec3Like,
): RaycastHit | null {
  const center = collisionShapeCenter(shape, position);
  const ray = { origin, direction, maxDistance };

  let result: SpatialHit | null = null;
  switch (shape.kind) {
    case 'sphere':
      result = new Sphere(center, shape.radius).rayIntersection(ray);
      break;
    case 'box': {
      const box = new OBB(center, shape.half, new Quat());
      result = box.rayIntersection(ray);
      break;
    }
    case 'capsule': {
      const capsule = Capsule.fromCenterHeight(center, shape.radius, shape.height, shape.axis ?? 'y');
      result = capsule.rayIntersection(ray);
      break;
    }
    case 'cylinder': {
      // Cylinder is conservatively raycast through its enclosing box plus caps.
      const box = new AABB(
        new SpatialVec3(center.x - shape.radius, center.y - shape.height / 2, center.z - shape.radius),
        new SpatialVec3(center.x + shape.radius, center.y + shape.height / 2, center.z + shape.radius),
      );
      result = box.rayIntersection(ray);
      break;
    }
    case 'mesh':
      return null;
    case 'compound':
      return null;
  }

  if (!result || !result.hit) return null;
  return {
    hit: true,
    distance: result.distance,
    point: { x: result.point.x, y: result.point.y, z: result.point.z },
    normal: { x: result.normal.x, y: result.normal.y, z: result.normal.z },
    colliderShape: shape.kind,
  };
}

/** Sweep a collision shape against a target OBB. */
export function sweepCollisionShapeAgainstOBB(
  shape: CollisionShape,
  position: Vec3Like,
  displacement: Vec3Like,
  target: OBB,
): SweepHitResult {
  const center = collisionShapeCenter(shape, position);
  switch (shape.kind) {
    case 'sphere':
      return sweepSphereOBB(center, shape.radius, displacement, target);
    case 'box': {
      const source = OBB.fromCenterSize(center, shape.half);
      // OBB/OBB continuous tests reduce to ray/sweep against the expanded
      // target; use a conservative AABB proxy for non-axis-aligned boxes.
      const sourceAABB = source.toAABB();
      return sweepAABBAABB(sourceAABB, displacement, target.toAABB());
    }
    case 'capsule': {
      const capsule = Capsule.fromCenterHeight(center, shape.radius, shape.height, shape.axis ?? 'y');
      return sweepCapsuleOBB(capsule, displacement, target);
    }
    default:
      return sweepShapeAABBProxy(shape, position, displacement, target.toAABB());
  }
}

/** Sweep a collision shape against an AABB. */
export function sweepCollisionShapeAgainstAABB(
  shape: CollisionShape,
  position: Vec3Like,
  displacement: Vec3Like,
  target: AABB,
): SweepHitResult {
  return sweepShapeAABBProxy(shape, position, displacement, target);
}

function sweepShapeAABBProxy(
  shape: CollisionShape,
  position: Vec3Like,
  displacement: Vec3Like,
  target: AABB,
): SweepHitResult {
  const center = collisionShapeCenter(shape, position);
  switch (shape.kind) {
    case 'sphere':
      return sweepSphereAABB(center, shape.radius, displacement, target);
    case 'box': {
      const box = new AABB(
        new SpatialVec3(center.x - shape.half.x, center.y - shape.half.y, center.z - shape.half.z),
        new SpatialVec3(center.x + shape.half.x, center.y + shape.half.y, center.z + shape.half.z),
      );
      return sweepAABBAABB(box, displacement, target);
    }
    case 'capsule': {
      const capsule = Capsule.fromCenterHeight(center, shape.radius, shape.height, shape.axis ?? 'y');
      return sweepCapsuleAABB(capsule, displacement, target);
    }
    case 'cylinder':
    case 'mesh':
    case 'compound': {
      const bounds = collisionShapeBounds(shape, position);
      return sweepAABBAABB(bounds, displacement, target);
    }
  }
}

/** Convert a spatial hit to the physics-facing `RaycastHit` contract. */
export function toRaycastHit(
  hit: SweepHitResult,
  bodyId?: string,
  colliderShape?: CollisionShape['kind'],
): RaycastHit {
  return {
    hit: hit.hit,
    distance: hit.distance,
    point: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
    normal: { x: hit.normal.x, y: hit.normal.y, z: hit.normal.z },
    bodyId,
    colliderShape,
  };
}

/** Build a `THREE.Box3` from a spatial AABB (renderer/debug convenience). */
export function toBox3(box: AABB): THREE.Box3 {
  return new THREE.Box3(
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  );
}

/** Convert a `THREE.Vector3` into the structural vector used by spatial math. */
export function fromThree(v: THREE.Vector3): Vec3Like {
  return { x: v.x, y: v.y, z: v.z };
}
