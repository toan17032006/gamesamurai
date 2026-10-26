/**
 * @file spatial-mapper.ts
 * @module @aetheria/engine/combiner/spatial-mapper
 * @description Bridges the animation/combiner layer to the pure spatial bounds,
 * raycast and sweep systems.
 *
 * The mapper deliberately works on `THREE.Object3D` inputs (the unit every
 * combiner receives) while returning JSON-friendly snapshots that can be put in
 * `CombineResult`, serialized into an asset manifest, or fed into `PhysicsWorld`
 * without leaking renderer types.
 */

import * as THREE from 'three';
import {
  AABB,
  Capsule,
  OBB,
  Sphere,
  Triangle,
  TriangleBVH,
  Vec3 as SpatialVec3,
  computeHullBounds,
  sweepAABBAABB,
  sweepCapsuleAABB,
  sweepSphereAABB,
  type HullBounds,
  type SweepHitResult,
  type Vec3Like,
} from '../spatial/index.js';
import type { CollisionShape } from '../types/physics.types.js';
import type {
  CombinerBoundsInput,
  CombinerLayerSummary,
  CombinerPhysicsProxy,
  CombinerRayInput,
  CombinerVec3Tuple,
  CombineDiagnostics,
  SpatialBoundsSnapshot,
} from '../types/combiner.types.js';

/** Collider kinds accepted when deriving a physics proxy from bounds. */
export type CombinerColliderKind = 'auto' | 'none' | 'box' | 'sphere' | 'capsule' | 'mesh';

/** Result of validating a collision shape before it reaches the physics world. */
export interface CollisionShapeValidation {
  readonly valid: boolean;
  readonly kind: CollisionShape['kind'] | 'none';
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/** Hit returned by a scene raycast through the combiner bridge. */
export interface CombinerRaycastHit {
  readonly hit: true;
  readonly distance: number;
  readonly point: [number, number, number];
  readonly normal: [number, number, number];
  readonly triangleIndex: number;
  readonly objectName: string;
  readonly objectUuid: string;
}

/** One object returned by an AABB/sphere scene query. */
export interface CombinerSpatialQueryHit {
  readonly name: string;
  readonly uuid: string;
  readonly distance: number;
  readonly bounds: {
    readonly min: [number, number, number];
    readonly max: [number, number, number];
  };
}

interface TriangleCacheEntry {
  readonly key: string;
  readonly triangles: readonly Triangle[];
  readonly bvh: TriangleBVH;
}

const triangleCache = new WeakMap<THREE.Object3D, TriangleCacheEntry>();

function tuple3(v: Vec3Like): [number, number, number] {
  return [v.x, v.y, v.z];
}

/** Convert a tuple into a spatial vector. */
export function toSpatialVec3(value: readonly [number, number, number]): SpatialVec3 {
  return new SpatialVec3(value[0], value[1], value[2]);
}

/** Convert a `THREE.Vector3` to the structural vector used by spatial math. */
export function threeToSpatial(v: THREE.Vector3): Vec3Like {
  return { x: v.x, y: v.y, z: v.z };
}

/** Convert a spatial vector to a `THREE.Vector3`. */
export function spatialToThree(v: Vec3Like): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}

/** Snapshot a spatial hull into the typed combiner contract. */
export function boundsSnapshot(
  hull: HullBounds,
  vertexCount = 0,
  triangleCount = 0,
): SpatialBoundsSnapshot {
  const { aabb, obb, sphere } = hull;
  const radius = Math.max(1e-4, Math.max(aabb.halfExtents.x, aabb.halfExtents.z));
  const halfSegment = Math.max(0, aabb.halfExtents.y - radius);

  return {
    aabb: { min: tuple3(aabb.min), max: tuple3(aabb.max) },
    obb: {
      center: tuple3(obb.center),
      halfExtents: tuple3(obb.halfExtents),
      orientation: [obb.orientation.x, obb.orientation.y, obb.orientation.z, obb.orientation.w],
    },
    sphere: {
      center: tuple3(sphere.center),
      radius: sphere.radius,
    },
    capsule: {
      start: tuple3(aabb.center.clone().add(new SpatialVec3(0, -halfSegment, 0))),
      end: tuple3(aabb.center.clone().add(new SpatialVec3(0, halfSegment, 0))),
      radius,
    },
    volume: hull.volume,
    surfaceArea: hull.surfaceArea,
    centerOfMass: tuple3(hull.centroid),
    vertexCount,
    triangleCount,
  };
}

/** Collect every world-space vertex in a scene graph. */
export function collectCombinerVertices(root: THREE.Object3D): Vec3Like[] {
  root.updateMatrixWorld(true);
  const points: Vec3Like[] = [];
  const vertex = new THREE.Vector3();

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const position = mesh.geometry.getAttribute('position');
    if (!position) return;
    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      points.push({ x: vertex.x, y: vertex.y, z: vertex.z });
    }
  });
  return points;
}

/** Collect every world-space triangle in a scene graph. */
export function collectCombinerTriangles(root: THREE.Object3D): Triangle[] {
  root.updateMatrixWorld(true);
  const triangles: Triangle[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry;
    const position = geometry.getAttribute('position');
    if (!position) return;
    const index = geometry.getIndex();
    const count = index ? index.count : position.count;

    for (let i = 0; i + 2 < count; i += 3) {
      const i0 = index ? index.getX(i) : i;
      const i1 = index ? index.getX(i + 1) : i + 1;
      const i2 = index ? index.getX(i + 2) : i + 2;
      a.fromBufferAttribute(position, i0).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(position, i1).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(position, i2).applyMatrix4(mesh.matrixWorld);
      triangles.push(new Triangle(threeToSpatial(a), threeToSpatial(b), threeToSpatial(c)));
    }
  });
  return triangles;
}

function meshSignature(root: THREE.Object3D): string {
  const parts: string[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const position = mesh.geometry.getAttribute('position');
    const version = position && 'version' in position ? String(position.version) : '0';
    parts.push(`${mesh.uuid}:${mesh.geometry.uuid}:${version}:${mesh.matrixWorld.elements.join(',')}`);
  });
  return parts.join('|');
}

/** Build or reuse a triangle BVH for the current scene state. */
export function combinerTriangleBVH(root: THREE.Object3D): TriangleBVH {
  root.updateMatrixWorld(true);
  const key = meshSignature(root);
  const cached = triangleCache.get(root);
  if (cached && cached.key === key) return cached.bvh;

  const triangles = collectCombinerTriangles(root);
  const bvh = new TriangleBVH(triangles);
  triangleCache.set(root, { key, triangles, bvh });
  return bvh;
}

/** Drop the cached BVH for one root (or every root when omitted). */
export function invalidateCombinerSpatialCache(root?: THREE.Object3D): void {
  if (root) {
    triangleCache.delete(root);
    return;
  }
  // WeakMap has no clear(); replacing this module-level map is not possible,
  // so callers should pass the root they mutated. This branch is intentionally a
  // no-op for API symmetry and to avoid retaining strong references.
}

/** Compute typed AABB/OBB/sphere/capsule bounds for a scene graph. */
export function computeCombinerBounds(root: THREE.Object3D): SpatialBoundsSnapshot {
  const points = collectCombinerVertices(root);
  const triangles = collectCombinerTriangles(root);
  const hull = computeHullBounds(points);
  return boundsSnapshot(hull, points.length, triangles.length);
}

/** Convert a combiner bounds snapshot into a spatial AABB. */
export function snapshotToAABB(snapshot: SpatialBoundsSnapshot): AABB {
  return new AABB(
    new SpatialVec3(...snapshot.aabb.min),
    new SpatialVec3(...snapshot.aabb.max),
  );
}

/**
 * Derive a primitive collision shape from a bounds snapshot.
 *
 * `mesh` requires the original vertex cloud; without it the function falls back
 * to a box so the caller still receives a usable proxy.
 */
export function collisionShapeFromBounds(
  snapshot: SpatialBoundsSnapshot,
  kind: CombinerColliderKind = 'box',
  vertices?: readonly Vec3Like[],
): CollisionShape | null {
  if (kind === 'none') return null;

  const sizeX = snapshot.aabb.max[0] - snapshot.aabb.min[0];
  const sizeY = snapshot.aabb.max[1] - snapshot.aabb.min[1];
  const sizeZ = snapshot.aabb.max[2] - snapshot.aabb.min[2];
  const half = {
    x: Math.max(1e-4, sizeX / 2),
    y: Math.max(1e-4, sizeY / 2),
    z: Math.max(1e-4, sizeZ / 2),
  };
  const center = new SpatialVec3(...snapshot.centerOfMass);

  switch (kind) {
    case 'sphere':
      return { kind: 'sphere', radius: Math.max(1e-4, snapshot.sphere.radius) };
    case 'capsule': {
      const radius = Math.max(1e-4, Math.max(half.x, half.z));
      return {
        kind: 'capsule',
        radius,
        height: Math.max(half.y * 2, radius * 2),
        axis: 'y',
      };
    }
    case 'mesh': {
      if (!vertices || vertices.length < 4) {
        return { kind: 'box', half };
      }
      const data = new Float32Array(vertices.length * 3);
      for (let i = 0; i < vertices.length; i += 1) {
        data[i * 3] = vertices[i].x - center.x;
        data[i * 3 + 1] = vertices[i].y - center.y;
        data[i * 3 + 2] = vertices[i].z - center.z;
      }
      return { kind: 'mesh', vertices: data, isConvex: true };
    }
    case 'auto':
    case 'box':
    default:
      return { kind: 'box', half };
  }
}

/** Build a complete physics proxy configuration from computed bounds. */
export function buildCombinerPhysicsProxy(
  snapshot: SpatialBoundsSnapshot,
  options: {
    kind?: CombinerColliderKind;
    mass?: number;
    gravityScale?: number;
    friction?: number;
    restitution?: number;
    isStatic?: boolean;
    vertices?: readonly Vec3Like[];
  } = {},
): CombinerPhysicsProxy | null {
  const shape = collisionShapeFromBounds(snapshot, options.kind ?? 'box', options.vertices);
  if (!shape) return null;

  return {
    shape,
    position: snapshot.centerOfMass,
    mass: Math.max(0, options.mass ?? 1),
    gravityScale: options.gravityScale ?? 1,
    friction: options.friction ?? 0.7,
    restitution: options.restitution ?? 0.15,
    isStatic: options.isStatic ?? false,
  };
}

/** Validate a collision shape without throwing. */
export function validateCombinerCollisionShape(shape?: CollisionShape): CollisionShapeValidation {
  if (!shape) {
    return { valid: false, kind: 'none', errors: ['shape_missing'], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  switch (shape.kind) {
    case 'sphere':
      if (!Number.isFinite(shape.radius) || shape.radius <= 0) errors.push('sphere_radius_must_be_positive');
      break;
    case 'box':
      if (!Number.isFinite(shape.half.x) || shape.half.x <= 0) errors.push('box_half_x_must_be_positive');
      if (!Number.isFinite(shape.half.y) || shape.half.y <= 0) errors.push('box_half_y_must_be_positive');
      if (!Number.isFinite(shape.half.z) || shape.half.z <= 0) errors.push('box_half_z_must_be_positive');
      break;
    case 'capsule':
    case 'cylinder':
      if (!Number.isFinite(shape.radius) || shape.radius <= 0) errors.push('radius_must_be_positive');
      if (!Number.isFinite(shape.height) || shape.height <= 0) errors.push('height_must_be_positive');
      if (shape.kind === 'capsule' && shape.height < shape.radius * 2) {
        warnings.push('capsule_height_shorter_than_diameter');
      }
      break;
    case 'mesh': {
      if (!(shape.vertices instanceof Float32Array)) errors.push('mesh_vertices_must_be_float32array');
      if (shape.vertices.length < 12 || shape.vertices.length % 3 !== 0) {
        errors.push('mesh_requires_at_least_four_triplets');
      }
      for (let i = 0; i < shape.vertices.length; i += 1) {
        if (!Number.isFinite(shape.vertices[i])) {
          errors.push('mesh_vertices_contain_non_finite');
          break;
        }
      }
      if (shape.indices) {
        const vertexCount = shape.vertices.length / 3;
        for (let i = 0; i < shape.indices.length; i += 1) {
          if (shape.indices[i] >= vertexCount) {
            errors.push('mesh_index_out_of_range');
            break;
          }
        }
      }
      break;
    }
    case 'compound': {
      if (shape.children.length === 0) errors.push('compound_requires_children');
      shape.children.forEach((child, index) => {
        if (!Number.isFinite(child.offset.x) || !Number.isFinite(child.offset.y) || !Number.isFinite(child.offset.z)) {
          errors.push(`compound_child_${index}_offset_invalid`);
        }
        const childValidation = validateCombinerCollisionShape(child.shape);
        errors.push(...childValidation.errors.map((error) => `compound_child_${index}:${error}`));
        warnings.push(...childValidation.warnings.map((warning) => `compound_child_${index}:${warning}`));
      });
      break;
    }
    default: {
      const exhaustive: never = shape;
      errors.push(`unsupported_shape:${String(exhaustive)}`);
    }
  }

  return { valid: errors.length === 0, kind: shape.kind, errors, warnings };
}

/** Raycast the scene graph through a BVH. */
export function combinerRaycast(
  root: THREE.Object3D,
  ray: CombinerRayInput,
): CombinerRaycastHit | null {
  const bvh = combinerTriangleBVH(root);
  const hit = bvh.raycast(
    {
      origin: toSpatialVec3(ray.origin),
      direction: toSpatialVec3(ray.direction),
      maxDistance: ray.maxDistance,
    },
    ray.maxDistance ?? Infinity,
  );
  if (!hit) return null;

  const object = root.getObjectByProperty('uuid', root.uuid) ?? root;
  return {
    hit: true,
    distance: hit.distance,
    point: tuple3(hit.point),
    normal: tuple3(hit.normal),
    triangleIndex: hit.triangleIndex,
    objectName: object.name || 'root',
    objectUuid: object.uuid,
  };
}

function meshWorldBox(mesh: THREE.Mesh): THREE.Box3 {
  const geometry = mesh.geometry;
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const box = geometry.boundingBox
    ? geometry.boundingBox.clone()
    : new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
  return box.applyMatrix4(mesh.matrixWorld);
}

function collectMeshBoxes(root: THREE.Object3D): Array<{ mesh: THREE.Mesh; box: THREE.Box3 }> {
  root.updateMatrixWorld(true);
  const entries: Array<{ mesh: THREE.Mesh; box: THREE.Box3 }> = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    entries.push({ mesh, box: meshWorldBox(mesh) });
  });
  return entries;
}

function boxIntersectsAABB(box: THREE.Box3, query: AABB): boolean {
  const q = box;
  return q.min.x <= query.max.x && q.max.x >= query.min.x
    && q.min.y <= query.max.y && q.max.y >= query.min.y
    && q.min.z <= query.max.z && q.max.z >= query.min.z;
}

function toQueryHit(mesh: THREE.Mesh, box: THREE.Box3, distance: number): CombinerSpatialQueryHit {
  return {
    name: mesh.name || mesh.uuid,
    uuid: mesh.uuid,
    distance,
    bounds: {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
    },
  };
}

/** Return all meshes whose world bounds overlap an axis-aligned query box. */
export function combinerQueryAABB(
  root: THREE.Object3D,
  query: CombinerBoundsInput,
): CombinerSpatialQueryHit[] {
  const box = new AABB(
    new SpatialVec3(...query.min),
    new SpatialVec3(...query.max),
  );
  const hits: CombinerSpatialQueryHit[] = [];
  for (const { mesh, box: worldBox } of collectMeshBoxes(root)) {
    if (!boxIntersectsAABB(worldBox, box)) continue;
    const center = worldBox.getCenter(new THREE.Vector3());
    const distance = box.closestPoint(threeToSpatial(center)).distanceTo(center);
    hits.push(toQueryHit(mesh, worldBox, distance));
  }
  return hits.sort((a, b) => a.distance - b.distance);
}

/** Return all meshes whose world bounds intersect a query sphere. */
export function combinerQuerySphere(
  root: THREE.Object3D,
  center: readonly [number, number, number],
  radius: number,
): CombinerSpatialQueryHit[] {
  const sphere = new Sphere(toSpatialVec3(center), Math.max(0, radius));
  const hits: CombinerSpatialQueryHit[] = [];
  for (const { mesh, box: worldBox } of collectMeshBoxes(root)) {
    const distance = worldBox.distanceToPoint(new THREE.Vector3(center[0], center[1], center[2]));
    if (distance > sphere.radius) continue;
    hits.push(toQueryHit(mesh, worldBox, distance));
  }
  return hits.sort((a, b) => a.distance - b.distance);
}

/** Sweep a primitive collider against an axis-aligned target. */
export function sweepColliderAgainstAABB(
  shape: CollisionShape,
  position: Vec3Like,
  displacement: Vec3Like,
  target: AABB,
): SweepHitResult {
  switch (shape.kind) {
    case 'sphere':
      return sweepSphereAABB(position, shape.radius, displacement, target);
    case 'box': {
      const box = new AABB(
        new SpatialVec3(position.x - shape.half.x, position.y - shape.half.y, position.z - shape.half.z),
        new SpatialVec3(position.x + shape.half.x, position.y + shape.half.y, position.z + shape.half.z),
      );
      return sweepAABBAABB(box, displacement, target);
    }
    case 'capsule': {
      const capsule = Capsule.fromCenterHeight(position, shape.radius, shape.height, shape.axis ?? 'y');
      return sweepCapsuleAABB(capsule, displacement, target);
    }
    case 'cylinder':
    case 'mesh': {
      const size = shape.kind === 'cylinder'
        ? { x: shape.radius, y: shape.height / 2, z: shape.radius }
        : meshExtents(shape.vertices);
      const box = new AABB(
        new SpatialVec3(position.x - size.x, position.y - size.y, position.z - size.z),
        new SpatialVec3(position.x + size.x, position.y + size.y, position.z + size.z),
      );
      return sweepAABBAABB(box, displacement, target);
    }
    case 'compound': {
      let closest: SweepHitResult | null = null;
      for (const child of shape.children) {
        const childPos = {
          x: position.x + child.offset.x,
          y: position.y + child.offset.y,
          z: position.z + child.offset.z,
        };
        const hit = sweepColliderAgainstAABB(child.shape, childPos, displacement, target);
        if (hit.hit && (!closest || hit.timeOfImpact < closest.timeOfImpact)) closest = hit;
      }
      return closest ?? {
        hit: false,
        timeOfImpact: 1,
        distance: Infinity,
        point: new SpatialVec3(),
        normal: new SpatialVec3(),
      };
    }
  }
}

function meshExtents(vertices: Float32Array): { x: number; y: number; z: number } {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i + 2 < vertices.length; i += 3) {
    x = Math.max(x, Math.abs(vertices[i]));
    y = Math.max(y, Math.abs(vertices[i + 1]));
    z = Math.max(z, Math.abs(vertices[i + 2]));
  }
  return { x: Math.max(x, 1e-4), y: Math.max(y, 1e-4), z: Math.max(z, 1e-4) };
}

/**
 * Sweep a collider against the triangles of a scene graph.
 *
 * Uses the scene BVH's broadphase boxes to skip far triangles and a
 * conservative AABB sweep for the narrow phase. This keeps the combiner layer
 * independent from the full physics solver.
 */
export function sweepColliderAgainstScene(
  root: THREE.Object3D,
  shape: CollisionShape,
  position: Vec3Like,
  displacement: Vec3Like,
): SweepHitResult {
  const bvh = combinerTriangleBVH(root);
  const travelBox = new AABB(
    new SpatialVec3(position.x, position.y, position.z),
    new SpatialVec3(position.x, position.y, position.z),
  );
  travelBox.expandByScalar(shape.kind === 'sphere' ? shape.radius : 1);
  const end = new AABB(
    new SpatialVec3(position.x + displacement.x, position.y + displacement.y, position.z + displacement.z),
    new SpatialVec3(position.x + displacement.x, position.y + displacement.y, position.z + displacement.z),
  );
  end.expandByScalar(shape.kind === 'sphere' ? shape.radius : 1);
  travelBox.union(end);

  let best: SweepHitResult | null = null;
  for (const item of bvh.bvh.queryAABBItems(travelBox)) {
    const target = item.data.triangle.aabb;
    const hit = sweepColliderAgainstAABB(shape, position, displacement, target);
    if (hit.hit && (!best || hit.timeOfImpact < best.timeOfImpact)) best = hit;
  }

  return best ?? {
    hit: false,
    timeOfImpact: 1,
    distance: Infinity,
    point: new SpatialVec3(),
    normal: new SpatialVec3(),
  };
}

/** Convert runtime layers into the public, serializable summary. */
export function toCombinerLayerSummaries(
  layers: readonly CombinerLayerSummary[] | undefined,
): CombinerLayerSummary[] | undefined {
  if (!layers) return undefined;
  return layers.map((layer) => ({
    name: layer.name,
    mode: layer.mode,
    weight: layer.weight,
    timeScale: layer.timeScale,
    enabled: layer.enabled,
    clipName: layer.clipName,
  }));
}

/** Build a diagnostics record with an elapsed duration in milliseconds. */
export function makeCombineDiagnostics(
  startedAt: number,
  missingClips: readonly string[] = [],
  missingBones: readonly string[] = [],
  warnings: readonly string[] = [],
): CombineDiagnostics {
  return {
    missingClips: [...missingClips],
    missingBones: [...missingBones],
    warnings: [...warnings],
    durationMs: Math.max(0, (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt),
  };
}

/** Expand an OBB into its eight world-space corners. */
export function obbCorners(obb: OBB): Array<[number, number, number]> {
  return obb.getCorners().map((corner) => tuple3(corner));
}

/** Convenience export for code that only needs the bounding sphere. */
export function combinerBoundingSphere(root: THREE.Object3D): { center: CombinerVec3Tuple; radius: number } {
  const bounds = computeCombinerBounds(root);
  return { center: bounds.sphere.center, radius: bounds.sphere.radius };
}
