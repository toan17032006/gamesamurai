/**
 * @file bounds.ts
 * @module @aetheria/engine/spatial/bounds
 * @description Typed bounding volumes with intersection, containment, projection,
 * clipping, volume/surface calculations and ray queries.
 */

import {
  AABBDistanceSq,
  EPSILON,
  EPSILON_SQ,
  Quat,
  Vec3,
  Vec3Like,
  closestPointOnAABB,
  closestPointOnSegment,
  closestPointsBetweenSegments,
  clamp,
  pointAABBDistanceSq,
  segmentDistanceSq,
  type RayLike,
  type SpatialHit,
} from './math.js';

type Axis = 'x' | 'y' | 'z';
const AXES: readonly Axis[] = ['x', 'y', 'z'];

/** Project an oriented box onto an axis and return its radius. */
function obbRadiusOnAxis(axes: readonly Vec3[], halfExtents: Vec3Like, axis: Vec3Like): number {
  const axisLen = Math.hypot(axis.x, axis.y, axis.z);
  if (axisLen < EPSILON) return 0;
  const nx = axis.x / axisLen;
  const ny = axis.y / axisLen;
  const nz = axis.z / axisLen;
  return Math.abs(axes[0].x * nx + axes[0].y * ny + axes[0].z * nz) * halfExtents.x
    + Math.abs(axes[1].x * nx + axes[1].y * ny + axes[1].z * nz) * halfExtents.y
    + Math.abs(axes[2].x * nx + axes[2].y * ny + axes[2].z * nz) * halfExtents.z;
}

/** Project an axis-aligned box onto an axis and return its radius. */
function aabbRadiusOnAxis(halfExtents: Vec3Like, axis: Vec3Like): number {
  return Math.abs(axis.x) * halfExtents.x
    + Math.abs(axis.y) * halfExtents.y
    + Math.abs(axis.z) * halfExtents.z;
}

/**
 * Axis-aligned bounding box.
 *
 * The constructor is deliberately permissive: passing no arguments creates a
 * zero box at the origin, while `AABB.empty()` creates an inverted box suitable
 * for incremental expansion.
 */
export class AABB {
  public min: Vec3;
  public max: Vec3;

  constructor(min: Vec3Like = Vec3.zero(), max: Vec3Like = Vec3.zero()) {
    this.min = Vec3.from(min);
    this.max = Vec3.from(max);
  }

  public static empty(): AABB {
    return new AABB(
      new Vec3(Infinity, Infinity, Infinity),
      new Vec3(-Infinity, -Infinity, -Infinity),
    );
  }

  public static fromCenterSize(center: Vec3Like, size: Vec3Like): AABB {
    const half = { x: size.x * 0.5, y: size.y * 0.5, z: size.z * 0.5 };
    return new AABB(
      new Vec3(center.x - half.x, center.y - half.y, center.z - half.z),
      new Vec3(center.x + half.x, center.y + half.y, center.z + half.z),
    );
  }

  public static fromPoints(points: Iterable<Vec3Like>): AABB {
    const result = AABB.empty();
    let found = false;
    for (const p of points) {
      result.expandByPoint(p);
      found = true;
    }
    return found ? result : new AABB();
  }

  public static fromMinMax(min: Vec3Like, max: Vec3Like): AABB {
    return new AABB(min, max);
  }

  public set(min: Vec3Like, max: Vec3Like): this {
    this.min.setFrom(min);
    this.max.setFrom(max);
    return this;
  }

  public copy(box: AABB): this {
    return this.set(box.min, box.max);
  }

  public clone(): AABB {
    return new AABB(this.min, this.max);
  }

  public makeEmpty(): this {
    this.min.set(Infinity, Infinity, Infinity);
    this.max.set(-Infinity, -Infinity, -Infinity);
    return this;
  }

  public isEmpty(): boolean {
    return this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z;
  }

  public get center(): Vec3 {
    return new Vec3(
      (this.min.x + this.max.x) * 0.5,
      (this.min.y + this.max.y) * 0.5,
      (this.min.z + this.max.z) * 0.5,
    );
  }

  public get size(): Vec3 {
    return new Vec3(
      Math.max(0, this.max.x - this.min.x),
      Math.max(0, this.max.y - this.min.y),
      Math.max(0, this.max.z - this.min.z),
    );
  }

  public get halfExtents(): Vec3 {
    return this.size.mulScalar(0.5);
  }

  public get volume(): number {
    if (this.isEmpty()) return 0;
    const size = this.size;
    return size.x * size.y * size.z;
  }

  public get surfaceArea(): number {
    if (this.isEmpty()) return 0;
    const size = this.size;
    return 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
  }

  public expandByPoint(p: Vec3Like): this {
    this.min.min(p);
    this.max.max(p);
    return this;
  }

  public expandByScalar(scalar: number): this {
    this.min.x -= scalar;
    this.min.y -= scalar;
    this.min.z -= scalar;
    this.max.x += scalar;
    this.max.y += scalar;
    this.max.z += scalar;
    return this;
  }

  public union(box: AABB): this {
    if (box.isEmpty()) return this;
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  }

  public intersection(box: AABB): AABB {
    const min = Vec3.max(this.min, box.min);
    const max = Vec3.min(this.max, box.max);
    if (min.x > max.x || min.y > max.y || min.z > max.z) return AABB.empty();
    return new AABB(min, max);
  }

  public intersects(box: AABB): boolean {
    return this.min.x <= box.max.x && this.max.x >= box.min.x
      && this.min.y <= box.max.y && this.max.y >= box.min.y
      && this.min.z <= box.max.z && this.max.z >= box.min.z;
  }

  public containsPoint(p: Vec3Like): boolean {
    return p.x >= this.min.x && p.x <= this.max.x
      && p.y >= this.min.y && p.y <= this.max.y
      && p.z >= this.min.z && p.z <= this.max.z;
  }

  public containsAABB(box: AABB): boolean {
    return box.min.x >= this.min.x && box.max.x <= this.max.x
      && box.min.y >= this.min.y && box.max.y <= this.max.y
      && box.min.z >= this.min.z && box.max.z <= this.max.z;
  }

  public closestPoint(p: Vec3Like): Vec3 {
    return closestPointOnAABB(p, this.min, this.max);
  }

  public distanceToPoint(p: Vec3Like): number {
    return Math.sqrt(pointAABBDistanceSq(p, this.min, this.max));
  }

  public distanceSqToPoint(p: Vec3Like): number {
    return pointAABBDistanceSq(p, this.min, this.max);
  }

  public distanceTo(box: AABB): number {
    return Math.sqrt(AABBDistanceSq(this.min, this.max, box.min, box.max));
  }

  public getCorners(): [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3] {
    const { min, max } = this;
    return [
      new Vec3(min.x, min.y, min.z),
      new Vec3(max.x, min.y, min.z),
      new Vec3(min.x, max.y, min.z),
      new Vec3(max.x, max.y, min.z),
      new Vec3(min.x, min.y, max.z),
      new Vec3(max.x, min.y, max.z),
      new Vec3(min.x, max.y, max.z),
      new Vec3(max.x, max.y, max.z),
    ];
  }

  /**
   * Slab ray test. Direction does not need to be normalised; the returned
   * distance is expressed in multiples of the direction length.
   */
  public rayIntersection(ray: RayLike): SpatialHit {
    const far = ray.maxDistance ?? Infinity;
    let tMin = 0;
    let tMax = far;
    let normalAxis: Axis = 'x';
    let normalSign = -1;

    for (const axis of AXES) {
      const o = ray.origin[axis];
      const d = ray.direction[axis];
      const lo = this.min[axis];
      const hi = this.max[axis];

      if (Math.abs(d) < EPSILON) {
        if (o < lo || o > hi) {
          return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
        }
        continue;
      }

      const inv = 1 / d;
      let t1 = (lo - o) * inv;
      let t2 = (hi - o) * inv;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }

      if (t1 > tMin) {
        tMin = t1;
        normalAxis = axis;
        normalSign = d > 0 ? -1 : 1;
      }
      if (t2 < tMax) tMax = t2;
      if (tMin > tMax) {
        return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
      }
    }

    const hitInside = tMin <= 0;
    const distance = hitInside ? 0 : tMin;
    const normal = hitInside
      ? Vec3.scale(ray.direction, -1).normalize()
      : new Vec3(
        normalAxis === 'x' ? normalSign : 0,
        normalAxis === 'y' ? normalSign : 0,
        normalAxis === 'z' ? normalSign : 0,
      );
    const point = Vec3.from(ray.origin).addScaled(ray.direction, distance);
    return { hit: true, distance, point, normal };
  }

  public toOBB(): OBB {
    return OBB.fromAABB(this);
  }

  public toSphere(): Sphere {
    return Sphere.fromAABB(this);
  }

  public toString(): string {
    return `AABB(min=${this.min.x},${this.min.y},${this.min.z} max=${this.max.x},${this.max.y},${this.max.z})`;
  }
}

/**
 * Oriented bounding box represented by a center, half extents and quaternion.
 * The three local axes are derived on demand and can also be supplied directly.
 */
export class OBB {
  public center: Vec3;
  public halfExtents: Vec3;
  public orientation: Quat;

  constructor(center: Vec3Like = Vec3.zero(), halfExtents: Vec3Like = Vec3.one(), orientation: Quat = Quat.identity()) {
    this.center = Vec3.from(center);
    this.halfExtents = Vec3.from(halfExtents);
    this.orientation = orientation.clone().normalize();
  }

  public static fromAABB(box: AABB): OBB {
    return new OBB(box.center, box.halfExtents, Quat.identity());
  }

  public static fromCenterSize(center: Vec3Like, size: Vec3Like, orientation: Quat = Quat.identity()): OBB {
    return new OBB(center, Vec3.from(size).mulScalar(0.5), orientation);
  }

  public set(center: Vec3Like, halfExtents: Vec3Like, orientation?: Quat): this {
    this.center.setFrom(center);
    this.halfExtents.setFrom(halfExtents);
    if (orientation) this.orientation.copy(orientation).normalize();
    return this;
  }

  public copy(box: OBB): this {
    return this.set(box.center, box.halfExtents, box.orientation);
  }

  public clone(): OBB {
    return new OBB(this.center, this.halfExtents, this.orientation);
  }

  /** World-space local axes: X, Y, Z. */
  public getAxes(): [Vec3, Vec3, Vec3] {
    return [
      new Vec3(1, 0, 0).applyQuat(this.orientation),
      new Vec3(0, 1, 0).applyQuat(this.orientation),
      new Vec3(0, 0, 1).applyQuat(this.orientation),
    ];
  }

  public get volume(): number {
    return this.halfExtents.x * this.halfExtents.y * this.halfExtents.z * 8;
  }

  public get surfaceArea(): number {
    const h = this.halfExtents;
    return 8 * (h.x * h.y + h.y * h.z + h.z * h.x);
  }

  public getCorners(): Vec3[] {
    const axes = this.getAxes();
    const h = this.halfExtents;
    const corners: Vec3[] = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          corners.push(new Vec3()
            .copy(this.center)
            .addScaled(axes[0], h.x * sx)
            .addScaled(axes[1], h.y * sy)
            .addScaled(axes[2], h.z * sz));
        }
      }
    }
    return corners;
  }

  public toAABB(): AABB {
    const axes = this.getAxes();
    const h = this.halfExtents;
    const extentX = Math.abs(axes[0].x) * h.x + Math.abs(axes[1].x) * h.y + Math.abs(axes[2].x) * h.z;
    const extentY = Math.abs(axes[0].y) * h.x + Math.abs(axes[1].y) * h.y + Math.abs(axes[2].y) * h.z;
    const extentZ = Math.abs(axes[0].z) * h.x + Math.abs(axes[1].z) * h.y + Math.abs(axes[2].z) * h.z;
    return new AABB(
      new Vec3(this.center.x - extentX, this.center.y - extentY, this.center.z - extentZ),
      new Vec3(this.center.x + extentX, this.center.y + extentY, this.center.z + extentZ),
    );
  }

  /** Convert a world point to the box-local coordinate system. */
  public toLocalPoint(p: Vec3Like): Vec3 {
    const axes = this.getAxes();
    const delta = Vec3.sub(p, this.center);
    return new Vec3(delta.dot(axes[0]), delta.dot(axes[1]), delta.dot(axes[2]));
  }

  public toWorldPoint(local: Vec3Like): Vec3 {
    const axes = this.getAxes();
    return new Vec3()
      .copy(this.center)
      .addScaled(axes[0], local.x)
      .addScaled(axes[1], local.y)
      .addScaled(axes[2], local.z);
  }

  public containsPoint(p: Vec3Like): boolean {
    const local = this.toLocalPoint(p);
    return Math.abs(local.x) <= this.halfExtents.x + EPSILON
      && Math.abs(local.y) <= this.halfExtents.y + EPSILON
      && Math.abs(local.z) <= this.halfExtents.z + EPSILON;
  }

  public closestPoint(p: Vec3Like): Vec3 {
    const local = this.toLocalPoint(p);
    local.set(
      clamp(local.x, -this.halfExtents.x, this.halfExtents.x),
      clamp(local.y, -this.halfExtents.y, this.halfExtents.y),
      clamp(local.z, -this.halfExtents.z, this.halfExtents.z),
    );
    return this.toWorldPoint(local);
  }

  public distanceToPoint(p: Vec3Like): number {
    return this.closestPoint(p).distanceTo(p);
  }

  private static sat(
    axesA: readonly Vec3[],
    halfA: Vec3Like,
    centerA: Vec3Like,
    axesB: readonly Vec3[],
    halfB: Vec3Like,
    centerB: Vec3Like,
  ): boolean {
    const delta = Vec3.sub(centerB, centerA);
    const testAxes: Vec3[] = [...axesA, ...axesB];

    for (const a of axesA) {
      for (const b of axesB) {
        const cross = Vec3.cross(a, b);
        if (cross.lengthSq() > EPSILON_SQ) testAxes.push(cross.normalized());
      }
    }

    for (const axis of testAxes) {
      const radiusA = obbRadiusOnAxis(axesA, halfA, axis);
      const radiusB = obbRadiusOnAxis(axesB, halfB, axis);
      const distance = Math.abs(delta.dot(axis));
      if (distance > radiusA + radiusB + EPSILON) return false;
    }
    return true;
  }

  public intersectsOBB(box: OBB): boolean {
    return OBB.sat(
      this.getAxes(), this.halfExtents, this.center,
      box.getAxes(), box.halfExtents, box.center,
    );
  }

  public intersectsAABB(box: AABB): boolean {
    const boxAxes = [new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1)];
    return OBB.sat(
      this.getAxes(), this.halfExtents, this.center,
      boxAxes, box.halfExtents, box.center,
    );
  }

  public intersectsSphere(sphere: Sphere): boolean {
    return this.closestPoint(sphere.center).distanceSqTo(sphere.center) <= sphere.radius * sphere.radius;
  }

  /** Ray test in OBB-local space, with normal transformed back to world space. */
  public rayIntersection(ray: RayLike): SpatialHit {
    const axes = this.getAxes();
    const delta = Vec3.sub(ray.origin, this.center);
    const localOrigin = new Vec3(
      delta.dot(axes[0]),
      delta.dot(axes[1]),
      delta.dot(axes[2]),
    );
    const localDir = new Vec3(
      Vec3.dot(ray.direction, axes[0]),
      Vec3.dot(ray.direction, axes[1]),
      Vec3.dot(ray.direction, axes[2]),
    );
    const localBox = new AABB(
      Vec3.scale(this.halfExtents, -1),
      this.halfExtents,
    );
    const hit = localBox.rayIntersection({
      origin: localOrigin,
      direction: localDir,
      maxDistance: ray.maxDistance,
    });
    if (!hit.hit) return hit;

    const worldPoint = this.toWorldPoint(localOrigin.addScaled(localDir, hit.distance));
    const worldNormal = new Vec3()
      .addScaled(axes[0], hit.normal.x)
      .addScaled(axes[1], hit.normal.y)
      .addScaled(axes[2], hit.normal.z)
      .normalize();
    return { hit: true, distance: hit.distance, point: worldPoint, normal: worldNormal };
  }
}

/** Bounding sphere with Ritter-style construction from point clouds. */
export class Sphere {
  public center: Vec3;
  public radius: number;

  constructor(center: Vec3Like = Vec3.zero(), radius = 0) {
    this.center = Vec3.from(center);
    this.radius = Math.max(0, radius);
  }

  /** Ritter's approximate minimal enclosing sphere. */
  public static fromPoints(points: Iterable<Vec3Like>): Sphere {
    const list: Vec3[] = [];
    for (const p of points) list.push(Vec3.from(p));
    if (list.length === 0) return new Sphere();
    if (list.length === 1) return new Sphere(list[0], 0);

    let minX = list[0], maxX = list[0], minY = list[0], maxY = list[0], minZ = list[0], maxZ = list[0];
    for (const p of list) {
      if (p.x < minX.x) minX = p;
      if (p.x > maxX.x) maxX = p;
      if (p.y < minY.y) minY = p;
      if (p.y > maxY.y) maxY = p;
      if (p.z < minZ.z) minZ = p;
      if (p.z > maxZ.z) maxZ = p;
    }

    const pairs: Array<[Vec3, Vec3]> = [[minX, maxX], [minY, maxY], [minZ, maxZ]];
    let d1 = pairs[0][0], d2 = pairs[0][1];
    let maxDist = 0;
    for (const [a, b] of pairs) {
      const d = a.distanceSqTo(b);
      if (d > maxDist) {
        maxDist = d;
        d1 = a;
        d2 = b;
      }
    }

    const center = Vec3.lerp(d1, d2, 0.5);
    let radius = Math.sqrt(maxDist) * 0.5;

    for (const p of list) {
      const distance = center.distanceTo(p);
      if (distance > radius) {
        const newRadius = (radius + distance) * 0.5;
        center.addScaled(Vec3.sub(p, center).normalize(), newRadius - radius);
        radius = newRadius;
      }
    }

    return new Sphere(center, radius);
  }

  public static fromAABB(box: AABB): Sphere {
    return new Sphere(box.center, box.halfExtents.length());
  }

  public static fromCenterRadius(center: Vec3Like, radius: number): Sphere {
    return new Sphere(center, radius);
  }

  public set(center: Vec3Like, radius: number): this {
    this.center.setFrom(center);
    this.radius = Math.max(0, radius);
    return this;
  }

  public copy(sphere: Sphere): this {
    return this.set(sphere.center, sphere.radius);
  }

  public clone(): Sphere {
    return new Sphere(this.center, this.radius);
  }

  public get volume(): number {
    return (4 / 3) * Math.PI * this.radius ** 3;
  }

  public get surfaceArea(): number {
    return 4 * Math.PI * this.radius * this.radius;
  }

  public get aabb(): AABB {
    return new AABB(
      new Vec3(this.center.x - this.radius, this.center.y - this.radius, this.center.z - this.radius),
      new Vec3(this.center.x + this.radius, this.center.y + this.radius, this.center.z + this.radius),
    );
  }

  public containsPoint(p: Vec3Like): boolean {
    return this.center.distanceSqTo(p) <= this.radius * this.radius + EPSILON;
  }

  public intersects(sphere: Sphere): boolean {
    const sum = this.radius + sphere.radius;
    return this.center.distanceSqTo(sphere.center) <= sum * sum + EPSILON;
  }

  public intersectsAABB(box: AABB): boolean {
    return box.distanceSqToPoint(this.center) <= this.radius * this.radius + EPSILON;
  }

  public intersectsOBB(box: OBB): boolean {
    return box.closestPoint(this.center).distanceSqTo(this.center) <= this.radius * this.radius + EPSILON;
  }

  public closestPoint(p: Vec3Like): Vec3 {
    const delta = Vec3.sub(p, this.center);
    const length = delta.length();
    if (length < EPSILON) return this.center.clone().add(new Vec3(this.radius, 0, 0));
    return this.center.clone().addScaled(delta, this.radius / length);
  }

  public distanceToPoint(p: Vec3Like): number {
    return Math.max(0, this.center.distanceTo(p) - this.radius);
  }

  public rayIntersection(ray: RayLike): SpatialHit {
    const far = ray.maxDistance ?? Infinity;
    const m = Vec3.sub(ray.origin, this.center);
    const dir = Vec3.from(ray.direction);
    const a = dir.lengthSq();
    if (a < EPSILON_SQ) return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
    const b = m.dot(dir);
    const c = m.lengthSq() - this.radius * this.radius;
    if (c > 0 && b > 0) return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
    const discriminant = b * b - a * c;
    if (discriminant < 0) return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
    let t = (-b - Math.sqrt(discriminant)) / a;
    if (t < 0) t = 0;
    if (t > far) return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
    const point = Vec3.from(ray.origin).addScaled(ray.direction, t);
    const normal = Vec3.sub(point, this.center).normalize();
    return { hit: true, distance: t, point, normal };
  }
}

/**
 * Capsule (line segment with radius). Height follows the segment length plus
 * the two hemispherical caps, matching the physics `CollisionShape` contract.
 */
export class Capsule {
  public start: Vec3;
  public end: Vec3;
  public radius: number;

  constructor(start: Vec3Like = new Vec3(0, -0.5, 0), end: Vec3Like = new Vec3(0, 0.5, 0), radius = 0.5) {
    this.start = Vec3.from(start);
    this.end = Vec3.from(end);
    this.radius = Math.max(0, radius);
  }

  public static fromCenterHeight(center: Vec3Like, radius: number, height: number, axis: Axis = 'y'): Capsule {
    const half = Math.max(0, height * 0.5 - radius);
    const offset = new Vec3(
      axis === 'x' ? half : 0,
      axis === 'y' ? half : 0,
      axis === 'z' ? half : 0,
    );
    return new Capsule(
      Vec3.sub(center, offset),
      Vec3.add(center, offset),
      radius,
    );
  }

  public get center(): Vec3 {
    return Vec3.lerp(this.start, this.end, 0.5);
  }

  public get height(): number {
    return this.start.distanceTo(this.end) + this.radius * 2;
  }

  public get aabb(): AABB {
    const r = this.radius;
    return new AABB(
      new Vec3(Math.min(this.start.x, this.end.x) - r, Math.min(this.start.y, this.end.y) - r, Math.min(this.start.z, this.end.z) - r),
      new Vec3(Math.max(this.start.x, this.end.x) + r, Math.max(this.start.y, this.end.y) + r, Math.max(this.start.z, this.end.z) + r),
    );
  }

  public get volume(): number {
    const length = this.start.distanceTo(this.end);
    return Math.PI * this.radius * this.radius * length + (4 / 3) * Math.PI * this.radius ** 3;
  }

  public get surfaceArea(): number {
    const length = this.start.distanceTo(this.end);
    return 2 * Math.PI * this.radius * length + 4 * Math.PI * this.radius * this.radius;
  }

  public closestPoint(p: Vec3Like): Vec3 {
    return closestPointOnSegment(p, this.start, this.end);
  }

  public distanceToPoint(p: Vec3Like): number {
    return Math.max(0, this.closestPoint(p).distanceTo(p) - this.radius);
  }

  public containsPoint(p: Vec3Like): boolean {
    return this.closestPoint(p).distanceSqTo(p) <= this.radius * this.radius + EPSILON;
  }

  public intersectsSphere(sphere: Sphere): boolean {
    const closest = this.closestPoint(sphere.center);
    const sum = this.radius + sphere.radius;
    return closest.distanceSqTo(sphere.center) <= sum * sum + EPSILON;
  }

  public intersectsCapsule(capsule: Capsule): boolean {
    const sum = this.radius + capsule.radius;
    return segmentDistanceSq(this.start, this.end, capsule.start, capsule.end) <= sum * sum + EPSILON;
  }

  public intersectsAABB(box: AABB): boolean {
    return this.distanceSqToAABB(box) <= this.radius * this.radius + EPSILON;
  }

  /** Distance from the capsule segment to an AABB, found with ternary search. */
  public distanceSqToAABB(box: AABB): number {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 40; i += 1) {
      const m1 = lo + (hi - lo) / 3;
      const m2 = hi - (hi - lo) / 3;
      const p1 = Vec3.lerp(this.start, this.end, m1);
      const p2 = Vec3.lerp(this.start, this.end, m2);
      const d1 = pointAABBDistanceSq(p1, box.min, box.max);
      const d2 = pointAABBDistanceSq(p2, box.min, box.max);
      if (d1 < d2) hi = m2;
      else lo = m1;
    }
    const p = Vec3.lerp(this.start, this.end, (lo + hi) * 0.5);
    return pointAABBDistanceSq(p, box.min, box.max);
  }

  public intersectsOBB(box: OBB): boolean {
    for (let i = 0; i <= 16; i += 1) {
      const p = Vec3.lerp(this.start, this.end, i / 16);
      if (box.distanceToPoint(p) <= this.radius + EPSILON) return true;
    }
    return false;
  }

  /** Ray/capsule intersection using the closest-approach quadratic. */
  public rayIntersection(ray: RayLike): SpatialHit {
    const far = ray.maxDistance ?? Infinity;
    const ba = Vec3.sub(this.end, this.start);
    const oa = Vec3.sub(ray.origin, this.start);
    const baba = ba.dot(ba);
    const rd = Vec3.from(ray.direction).normalize();
    const bard = ba.dot(rd);
    const baoa = ba.dot(oa);
    const rdoa = rd.dot(oa);
    const oaoa = oa.dot(oa);
    const r2 = this.radius * this.radius;
    const a = baba - bard * bard;
    const b = baba * rdoa - baoa * bard;
    const c = baba * oaoa - baoa * baoa - r2 * baba;

    if (Math.abs(a) > EPSILON) {
      const h = b * b - a * c;
      if (h >= 0) {
        const t = (-b - Math.sqrt(h)) / a;
        const y = baoa + t * bard;
        if (t >= 0 && t <= far && y > 0 && y < baba) {
          const point = Vec3.from(ray.origin).addScaled(rd, t);
          const normal = Vec3.sub(point, this.start).addScaled(ba, -y / baba).normalize();
          return { hit: true, distance: t, point, normal };
        }

        const oc = y <= 0 ? oa : Vec3.sub(ray.origin, this.end);
        const b2 = rd.dot(oc);
        const c2 = oc.dot(oc) - r2;
        const h2 = b2 * b2 - c2;
        if (h2 > 0) {
          const t2 = -b2 - Math.sqrt(h2);
          if (t2 >= 0 && t2 <= far) {
            const point = Vec3.from(ray.origin).addScaled(rd, t2);
            const capCenter = y <= 0 ? this.start : this.end;
            const normal = Vec3.sub(point, capCenter).normalize();
            return { hit: true, distance: t2, point, normal };
          }
        }
      }
    }

    return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
  }
}

/** Plane represented by a unit normal and signed distance from the origin. */
export class Plane {
  public normal: Vec3;
  public constant: number;

  constructor(normal: Vec3Like = Vec3.up(), constant = 0) {
    this.normal = Vec3.from(normal).normalize();
    this.constant = constant;
  }

  public static fromPointNormal(point: Vec3Like, normal: Vec3Like): Plane {
    const n = Vec3.from(normal).normalize();
    return new Plane(n, -n.dot(point));
  }

  public static fromPoints(a: Vec3Like, b: Vec3Like, c: Vec3Like): Plane {
    const n = Vec3.cross(Vec3.sub(b, a), Vec3.sub(c, a)).normalize();
    return new Plane(n, -n.dot(a));
  }

  public set(normal: Vec3Like, constant: number): this {
    this.normal.setFrom(normal).normalize();
    this.constant = constant;
    return this;
  }

  public copy(plane: Plane): this {
    return this.set(plane.normal, plane.constant);
  }

  public clone(): Plane {
    return new Plane(this.normal, this.constant);
  }

  public distanceToPoint(point: Vec3Like): number {
    return this.normal.dot(point) + this.constant;
  }

  public projectPoint(point: Vec3Like): Vec3 {
    return Vec3.from(point).addScaled(this.normal, -this.distanceToPoint(point));
  }

  public intersectsSphere(sphere: Sphere): boolean {
    return Math.abs(this.distanceToPoint(sphere.center)) <= sphere.radius;
  }

  public intersectsAABB(box: AABB): boolean {
    const center = box.center;
    const half = box.halfExtents;
    const radius = Math.abs(this.normal.x) * half.x
      + Math.abs(this.normal.y) * half.y
      + Math.abs(this.normal.z) * half.z;
    return Math.abs(this.distanceToPoint(center)) <= radius;
  }

  public rayIntersection(ray: RayLike): SpatialHit {
    const denominator = this.normal.dot(ray.direction);
    if (Math.abs(denominator) < EPSILON) {
      return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
    }
    const t = -(this.normal.dot(ray.origin) + this.constant) / denominator;
    if (t < 0 || t > (ray.maxDistance ?? Infinity)) {
      return { hit: false, distance: Infinity, point: new Vec3(), normal: new Vec3() };
    }
    const point = Vec3.from(ray.origin).addScaled(ray.direction, t);
    const normal = denominator < 0 ? this.normal.clone() : this.normal.clone().negate();
    return { hit: true, distance: t, point, normal };
  }
}

/**
 * Convex hull utility used for collision proxies. Builds a conservative AABB,
 * OBB and sphere from an arbitrary point cloud.
 */
export interface HullBounds {
  aabb: AABB;
  obb: OBB;
  sphere: Sphere;
  centroid: Vec3;
  volume: number;
  surfaceArea: number;
}

/** Approximate the bounds of a point cloud using a PCA-aligned OBB. */
export function computeHullBounds(points: readonly Vec3Like[]): HullBounds {
  const aabb = AABB.fromPoints(points);
  const centroid = points.length > 0
    ? points.reduce<Vec3>((acc, p) => acc.add(p), new Vec3()).mulScalar(1 / points.length)
    : new Vec3();

  // Covariance matrix (symmetric 3x3) for PCA.
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (const p of points) {
    const dx = p.x - centroid.x;
    const dy = p.y - centroid.y;
    const dz = p.z - centroid.z;
    xx += dx * dx;
    xy += dx * dy;
    xz += dx * dz;
    yy += dy * dy;
    yz += dy * dz;
    zz += dz * dz;
  }
  const n = Math.max(1, points.length);
  xx /= n; xy /= n; xz /= n; yy /= n; yz /= n; zz /= n;

  const axisX = dominantEigenvector(xx, xy, xz, yy, yz, zz);
  const helper = Math.abs(axisX.y) < 0.9 ? new Vec3(0, 1, 0) : new Vec3(1, 0, 0);
  const axisY = Vec3.cross(axisX, helper).normalize();
  const axisZ = Vec3.cross(axisX, axisY).normalize();

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const p of points) {
    const d = Vec3.sub(p, centroid);
    const x = d.dot(axisX);
    const y = d.dot(axisY);
    const z = d.dot(axisZ);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  if (!Number.isFinite(minX)) {
    minX = maxX = minY = maxY = minZ = maxZ = 0;
  }

  const localCenter = new Vec3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
  const center = new Vec3()
    .copy(centroid)
    .addScaled(axisX, localCenter.x)
    .addScaled(axisY, localCenter.y)
    .addScaled(axisZ, localCenter.z);

  const halfExtents = new Vec3(
    Math.max(EPSILON, (maxX - minX) / 2),
    Math.max(EPSILON, (maxY - minY) / 2),
    Math.max(EPSILON, (maxZ - minZ) / 2),
  );

  // Convert the basis into a quaternion by constructing a rotation matrix.
  const orientation = quatFromBasis(axisX, axisY, axisZ);
  const obb = new OBB(center, halfExtents, orientation);

  return {
    aabb,
    obb,
    sphere: Sphere.fromPoints(points),
    centroid,
    volume: obb.volume,
    surfaceArea: obb.surfaceArea,
  };
}

/** Determinant of a 3x3 symmetric matrix from its six unique entries. */
function det3(xx: number, xy: number, xz: number, yy: number, yz: number, zz: number): number {
  return xx * (yy * zz - yz * yz)
    - xy * (xy * zz - yz * xz)
    + xz * (xy * yz - yy * xz);
}

/** Dominant eigenvector of a symmetric 3x3 covariance matrix via cross products. */
function dominantEigenvector(xx: number, xy: number, xz: number, yy: number, yz: number, zz: number): Vec3 {
  // The row vectors of (C - lambda I) have cross products close to the
  // eigenvector; try the largest cross product and fall back to an axis.
  const row0 = new Vec3(xx, xy, xz);
  const row1 = new Vec3(xy, yy, yz);
  const row2 = new Vec3(xz, yz, zz);
  const candidates = [
    Vec3.cross(row0, row1),
    Vec3.cross(row0, row2),
    Vec3.cross(row1, row2),
  ];
  let best = candidates[0];
  for (const c of candidates) {
    if (c.lengthSq() > best.lengthSq()) best = c;
  }
  if (best.lengthSq() < EPSILON_SQ) {
    const det = Math.abs(det3(xx, xy, xz, yy, yz, zz));
    if (det < EPSILON) return new Vec3(1, 0, 0);
    return new Vec3(1, 0, 0);
  }
  return best.normalize();
}

/** Build a quaternion from orthonormal basis vectors. */
function quatFromBasis(x: Vec3, y: Vec3, z: Vec3): Quat {
  const m00 = x.x, m01 = y.x, m02 = z.x;
  const m10 = x.y, m11 = y.y, m12 = z.y;
  const m20 = x.z, m21 = y.z, m22 = z.z;
  const trace = m00 + m11 + m22;

  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    return new Quat((m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, 0.25 * s).normalize();
  }
  if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    return new Quat(0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s).normalize();
  }
  if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    return new Quat((m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s).normalize();
  }
  const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
  return new Quat((m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s).normalize();
}

/** Re-export useful helpers for consumers that only import the bounds module. */
export { closestPointOnSegment, closestPointsBetweenSegments, segmentDistanceSq };
