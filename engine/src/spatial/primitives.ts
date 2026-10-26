/**
 * @file primitives.ts
 * @module @aetheria/engine/spatial/primitives
 * @description Ray, triangle and view-frustum primitives built on the spatial math
 * and bounding-volume modules.
 */

import {
  AABB,
  OBB,
  Plane,
  Sphere,
  Capsule,
} from './bounds.js';
import {
  EPSILON,
  EPSILON_SQ,
  Mat4,
  Vec3,
  Vec3Like,
  clamp,
  closestPointOnAABB,
  type RayLike,
  type SpatialHit,
} from './math.js';

/** Ray with a normalized direction and an optional maximum travel distance. */
export class Ray implements RayLike {
  public origin: Vec3;
  public direction: Vec3;
  public maxDistance: number;

  constructor(origin: Vec3Like = Vec3.zero(), direction: Vec3Like = Vec3.forward(), maxDistance = Infinity) {
    this.origin = Vec3.from(origin);
    this.direction = Vec3.from(direction);
    this.maxDistance = Math.max(0, maxDistance);
  }

  public static fromPoints(from: Vec3Like, to: Vec3Like, extend = 0): Ray {
    const direction = Vec3.sub(to, from);
    const distance = direction.length();
    return new Ray(from, direction.normalize(), distance + extend);
  }

  public set(origin: Vec3Like, direction: Vec3Like, maxDistance = Infinity): this {
    this.origin.setFrom(origin);
    this.direction.setFrom(direction).normalize();
    this.maxDistance = Math.max(0, maxDistance);
    return this;
  }

  public at(distance: number): Vec3 {
    return this.origin.clone().addScaled(this.direction, distance);
  }

  public clone(): Ray {
    return new Ray(this.origin, this.direction, this.maxDistance);
  }

  public intersectAABB(box: AABB): SpatialHit {
    return box.rayIntersection(this);
  }

  public intersectOBB(box: OBB): SpatialHit {
    return box.rayIntersection(this);
  }

  public intersectSphere(sphere: Sphere): SpatialHit {
    return sphere.rayIntersection(this);
  }

  public intersectCapsule(capsule: Capsule): SpatialHit {
    return capsule.rayIntersection(this);
  }

  public intersectPlane(plane: Plane): SpatialHit {
    return plane.rayIntersection(this);
  }

  public intersectTriangle(triangle: Triangle): TriangleHit {
    return triangle.rayIntersection(this);
  }
}

/** Result of a ray/triangle intersection. */
export interface TriangleHit extends SpatialHit {
  barycentric: Vec3;
  u: number;
  v: number;
  triangleIndex?: number;
}

/** Immutable triangle primitive with geometrical helpers. */
export class Triangle {
  public a: Vec3;
  public b: Vec3;
  public c: Vec3;

  constructor(a: Vec3Like = Vec3.zero(), b: Vec3Like = new Vec3(1, 0, 0), c: Vec3Like = new Vec3(0, 1, 0)) {
    this.a = Vec3.from(a);
    this.b = Vec3.from(b);
    this.c = Vec3.from(c);
  }

  public get normal(): Vec3 {
    return Vec3.cross(Vec3.sub(this.b, this.a), Vec3.sub(this.c, this.a)).normalize();
  }

  public get centroid(): Vec3 {
    return new Vec3(
      (this.a.x + this.b.x + this.c.x) / 3,
      (this.a.y + this.b.y + this.c.y) / 3,
      (this.a.z + this.b.z + this.c.z) / 3,
    );
  }

  public get area(): number {
    return Vec3.cross(Vec3.sub(this.b, this.a), Vec3.sub(this.c, this.a)).length() * 0.5;
  }

  public get aabb(): AABB {
    return AABB.fromPoints([this.a, this.b, this.c]);
  }

  public getEdges(): [Vec3, Vec3, Vec3] {
    return [
      Vec3.sub(this.b, this.a),
      Vec3.sub(this.c, this.b),
      Vec3.sub(this.a, this.c),
    ];
  }

  public getPlane(): Plane {
    return Plane.fromPoints(this.a, this.b, this.c);
  }

  public barycentric(point: Vec3Like): Vec3 {
    const v0 = Vec3.sub(this.c, this.a);
    const v1 = Vec3.sub(this.b, this.a);
    const v2 = Vec3.sub(point, this.a);
    const d00 = v0.dot(v0);
    const d01 = v0.dot(v1);
    const d11 = v1.dot(v1);
    const d20 = v2.dot(v0);
    const d21 = v2.dot(v1);
    const denom = d00 * d11 - d01 * d01;
    if (Math.abs(denom) < EPSILON) return new Vec3(1, 0, 0);
    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    return new Vec3(1 - v - w, v, w);
  }

  public closestPoint(point: Vec3Like): Vec3 {
    const ab = Vec3.sub(this.b, this.a);
    const ac = Vec3.sub(this.c, this.a);
    const ap = Vec3.sub(point, this.a);
    const d1 = ab.dot(ap);
    const d2 = ac.dot(ap);
    if (d1 <= 0 && d2 <= 0) return this.a.clone();

    const bp = Vec3.sub(point, this.b);
    const d3 = ab.dot(bp);
    const d4 = ac.dot(bp);
    if (d3 >= 0 && d4 <= d3) return this.b.clone();

    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
      const v = d1 / (d1 - d3);
      return this.a.clone().addScaled(ab, v);
    }

    const cp = Vec3.sub(point, this.c);
    const d5 = ab.dot(cp);
    const d6 = ac.dot(cp);
    if (d6 >= 0 && d5 <= d6) return this.c.clone();

    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
      const w = d2 / (d2 - d6);
      return this.a.clone().addScaled(ac, w);
    }

    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
      const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
      return this.b.clone().addScaled(Vec3.sub(this.c, this.b), w);
    }

    const denom = 1 / (va + vb + vc);
    const v = vb * denom;
    const w = vc * denom;
    return this.a.clone().addScaled(ab, v).addScaled(ac, w);
  }

  public distanceToPoint(point: Vec3Like): number {
    return this.closestPoint(point).distanceTo(point);
  }

  public containsPoint(point: Vec3Like, tolerance = 1e-6): boolean {
    const bary = this.barycentric(point);
    return bary.x >= -tolerance && bary.y >= -tolerance && bary.z >= -tolerance;
  }

  /** Möller-Trumbore ray/triangle intersection, double sided. */
  public rayIntersection(ray: RayLike): TriangleHit {
    const far = ray.maxDistance ?? Infinity;
    const edge1 = Vec3.sub(this.b, this.a);
    const edge2 = Vec3.sub(this.c, this.a);
    const h = Vec3.cross(ray.direction, edge2);
    const det = edge1.dot(h);

    const empty = (): TriangleHit => ({
      hit: false,
      distance: Infinity,
      point: new Vec3(),
      normal: new Vec3(),
      barycentric: new Vec3(),
      u: 0,
      v: 0,
    });

    if (Math.abs(det) < EPSILON) return empty();
    const invDet = 1 / det;
    const s = Vec3.sub(ray.origin, this.a);
    const u = invDet * s.dot(h);
    if (u < -EPSILON || u > 1 + EPSILON) return empty();

    const q = Vec3.cross(s, edge1);
    const dir = Vec3.from(ray.direction);
    const v = invDet * dir.dot(q);
    if (v < -EPSILON || u + v > 1 + EPSILON) return empty();

    const distance = invDet * edge2.dot(q);
    if (distance < 0 || distance > far) return empty();

    const point = Vec3.from(ray.origin).addScaled(ray.direction, distance);
    const normal = this.normal;
    if (normal.dot(ray.direction) > 0) normal.negate();
    return {
      hit: true,
      distance,
      point,
      normal,
      barycentric: new Vec3(1 - u - v, u, v),
      u,
      v,
    };
  }

  public intersectsAABB(box: AABB): boolean {
    // Separating axis theorem: three box normals, triangle normal and nine
    // cross products between box axes and triangle edges.
    const center = box.center;
    const half = box.halfExtents;
    const v0 = Vec3.sub(this.a, center);
    const v1 = Vec3.sub(this.b, center);
    const v2 = Vec3.sub(this.c, center);
    const edges: Vec3[] = [Vec3.sub(v1, v0), Vec3.sub(v2, v1), Vec3.sub(v0, v2)];
    const axes: Vec3[] = [new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1), this.normal];

    for (const edge of edges) {
      axes.push(Vec3.cross(new Vec3(1, 0, 0), edge));
      axes.push(Vec3.cross(new Vec3(0, 1, 0), edge));
      axes.push(Vec3.cross(new Vec3(0, 0, 1), edge));
    }

    for (const rawAxis of axes) {
      if (rawAxis.lengthSq() < EPSILON_SQ) continue;
      const axis = rawAxis.normalized();
      const p0 = v0.dot(axis);
      const p1 = v1.dot(axis);
      const p2 = v2.dot(axis);
      const radius = Math.abs(axis.x) * half.x + Math.abs(axis.y) * half.y + Math.abs(axis.z) * half.z;
      const min = Math.min(p0, p1, p2);
      const max = Math.max(p0, p1, p2);
      if (min > radius + EPSILON || max < -radius - EPSILON) return false;
    }
    return true;
  }

  public toString(): string {
    return `Triangle(a=${this.a.toArray().join(',')} b=${this.b.toArray().join(',')} c=${this.c.toArray().join(',')})`;
  }
}

/** Six-plane view frustum, typically extracted from a view-projection matrix. */
export class Frustum {
  public planes: [Plane, Plane, Plane, Plane, Plane, Plane];

  constructor(planes?: [Plane, Plane, Plane, Plane, Plane, Plane]) {
    this.planes = planes ?? [
      new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane(),
    ];
  }

  /**
   * Extract planes from a column-major view-projection matrix using the
   * Gribb-Hartmann method.
   */
  public static fromViewProjection(matrix: Mat4 | ArrayLike<number>): Frustum {
    const e = matrix instanceof Mat4 ? matrix.elements : matrix;
    if (e.length < 16) throw new Error('Frustum.fromViewProjection requires 16 matrix elements');

    const row = (r: number): [number, number, number, number] => [
      e[r] ?? 0,
      e[4 + r] ?? 0,
      e[8 + r] ?? 0,
      e[12 + r] ?? 0,
    ];

    const r0 = row(0);
    const r1 = row(1);
    const r2 = row(2);
    const r3 = row(3);

    const makePlane = (a: number, b: number, c: number, d: number): Plane => {
      const normal = new Vec3(a, b, c);
      const len = normal.length();
      if (len < EPSILON) return new Plane();
      normal.mulScalar(1 / len);
      return new Plane(normal, d / len);
    };

    return new Frustum([
      makePlane(r3[0] + r0[0], r3[1] + r0[1], r3[2] + r0[2], r3[3] + r0[3]), // left
      makePlane(r3[0] - r0[0], r3[1] - r0[1], r3[2] - r0[2], r3[3] - r0[3]), // right
      makePlane(r3[0] + r1[0], r3[1] + r1[1], r3[2] + r1[2], r3[3] + r1[3]), // bottom
      makePlane(r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2], r3[3] - r1[3]), // top
      makePlane(r3[0] + r2[0], r3[1] + r2[1], r3[2] + r2[2], r3[3] + r2[3]), // near
      makePlane(r3[0] - r2[0], r3[1] - r2[1], r3[2] - r2[2], r3[3] - r2[3]), // far
    ]);
  }

  /** Build a frustum from camera position/orientation and perspective parameters. */
  public static fromPerspective(
    position: Vec3Like,
    orientation: { x: number; y: number; z: number; w: number },
    fovYRadians: number,
    aspect: number,
    near: number,
    far: number,
  ): Frustum {
    const forward = new Vec3(0, 0, -1).applyQuat(orientation).normalize();
    const up = new Vec3(0, 1, 0).applyQuat(orientation).normalize();
    const right = Vec3.cross(forward, up).normalize();
    const trueUp = Vec3.cross(right, forward).normalize();

    const tanY = Math.tan(fovYRadians * 0.5);
    const tanX = tanY * aspect;
    const nearCenter = Vec3.from(position).addScaled(forward, near);
    const farCenter = Vec3.from(position).addScaled(forward, far);

    const nearH = tanY * near;
    const nearW = tanX * near;
    const farH = tanY * far;
    const farW = tanX * far;

    const pNearBL = nearCenter.clone().addScaled(right, -nearW).addScaled(trueUp, -nearH);
    const pNearBR = nearCenter.clone().addScaled(right, nearW).addScaled(trueUp, -nearH);
    const pNearTR = nearCenter.clone().addScaled(right, nearW).addScaled(trueUp, nearH);
    const pNearTL = nearCenter.clone().addScaled(right, -nearW).addScaled(trueUp, nearH);
    const pFarBL = farCenter.clone().addScaled(right, -farW).addScaled(trueUp, -farH);
    const pFarBR = farCenter.clone().addScaled(right, farW).addScaled(trueUp, -farH);
    const pFarTR = farCenter.clone().addScaled(right, farW).addScaled(trueUp, farH);
    const pFarTL = farCenter.clone().addScaled(right, -farW).addScaled(trueUp, farH);

    const inward = (a: Vec3, b: Vec3, c: Vec3, point: Vec3Like): Plane => {
      const plane = Plane.fromPoints(a, b, c);
      if (plane.distanceToPoint(point) < 0) {
        plane.normal.negate();
        plane.constant = -plane.constant;
      }
      return plane;
    };

    return new Frustum([
      inward(pNearBL, pFarBL, pFarTL, position), // left
      inward(pNearBR, pFarBR, pFarTR, position), // right
      inward(pNearBL, pNearBR, pFarBR, position), // bottom
      inward(pNearTL, pNearTR, pFarTR, position), // top
      inward(pNearBL, pNearTR, pNearBR, position), // near
      inward(pFarBL, pFarTR, pFarBR, position), // far
    ]);
  }

  public containsPoint(point: Vec3Like): boolean {
    for (const plane of this.planes) {
      if (plane.distanceToPoint(point) < 0) return false;
    }
    return true;
  }

  public containsSphere(sphere: Sphere): boolean {
    for (const plane of this.planes) {
      if (plane.distanceToPoint(sphere.center) < -sphere.radius) return false;
    }
    return true;
  }

  public intersectsSphere(sphere: Sphere): boolean {
    for (const plane of this.planes) {
      if (plane.distanceToPoint(sphere.center) < -sphere.radius) return false;
    }
    return true;
  }

  public intersectsAABB(box: AABB): boolean {
    for (const plane of this.planes) {
      const center = box.center;
      const half = box.halfExtents;
      const radius = Math.abs(plane.normal.x) * half.x
        + Math.abs(plane.normal.y) * half.y
        + Math.abs(plane.normal.z) * half.z;
      if (plane.distanceToPoint(center) < -radius) return false;
    }
    return true;
  }

  public intersectsOBB(box: OBB): boolean {
    const axes = box.getAxes();
    for (const plane of this.planes) {
      const radius = Math.abs(plane.normal.dot(axes[0])) * box.halfExtents.x
        + Math.abs(plane.normal.dot(axes[1])) * box.halfExtents.y
        + Math.abs(plane.normal.dot(axes[2])) * box.halfExtents.z;
      if (plane.distanceToPoint(box.center) < -radius) return false;
    }
    return true;
  }

  public intersectsTriangle(triangle: Triangle): boolean {
    // Conservative: test the triangle AABB and all vertices.
    if (this.containsPoint(triangle.a) || this.containsPoint(triangle.b) || this.containsPoint(triangle.c)) {
      return true;
    }
    return this.intersectsAABB(triangle.aabb);
  }
}

/** Closest point on a ray to a point (clamped to the ray's max distance). */
export function closestPointOnRay(ray: RayLike, point: Vec3Like): Vec3 {
  const dir = Vec3.from(ray.direction);
  const dirLenSq = dir.lengthSq();
  if (dirLenSq < EPSILON_SQ) return Vec3.from(ray.origin);
  const t = clamp(Vec3.sub(point, ray.origin).dot(dir) / dirLenSq, 0, ray.maxDistance ?? Infinity);
  return Vec3.from(ray.origin).addScaled(dir, t);
}

/** Calculate a ray's impact angle with a surface normal, in radians. */
export function rayImpactAngle(ray: RayLike, normal: Vec3Like): number {
  const dir = Vec3.from(ray.direction).normalize();
  const n = Vec3.from(normal).normalize();
  return Math.acos(clamp(-dir.dot(n), -1, 1));
}

/** Clamp a point to the interior of an AABB. */
export function clampPointToAABB(point: Vec3Like, box: AABB): Vec3 {
  return closestPointOnAABB(point, box.min, box.max);
}
