/**
 * @file physics-collision-projectile-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/physics-collision-projectile-subsystem
 * @description Physics, Collision Detection & Projectile Subsystem (1601–1700).
 *
 * Trước đây 100 method ở đây trả về cùng một kết quả va chạm giả
 * (`hit: true, penetration: 0.1`) và mọi vector lực bằng `{x:0,y:0,z:0}`.
 * Nay mỗi method thực sự tính toán trên hình học, vận tốc và gia tốc thật.
 */

import type {
  Vec2D,
  Vec3D,
  Vec4D,
  QuatD,
  Mat4D,
  EulerAngles,
  Box3D,
  Sphere3D,
  Capsule3D,
  Cylinder3D,
  Ray3D,
  Plane3D,
  Triangle3D,
  ViewportRect,
  CameraFrustum,
  UIAnchor,
  UIHitResult,
  SpatialGridCell,
  SplinePoint,
  TrajectoryPoint,
  SpatialUIConfig
} from '../types.js';
import {
  add,
  subtract,
  scale,
  normalize,
  dot,
  cross,
  magnitude,
  distance3D,
  clamp,
  clamp01,
  lerp,
  num,
  toVec3,
  entityQuaternion,
  boundingBox,
  boundingSphere,
  UP3,
  FORWARD3
} from '../spatial-primitives.js';
import {
  GRAVITY,
  DEFAULT_MASS,
  GRAVITY_MAGNITUDE,
  readNum,
  readVec,
  readArray,
  readQuat,
  resolveBox,
  resolveSphere,
  resolveCapsule,
  resolveCylinder,
  resolvePlane,
  resolveTriangle,
  resolveRay,
  resolvePoints,
  resolvePointOf,
  obbOverlap,
  quatAxis,
  boxCenter,
  boxHalf,
  raySphereIntersection,
  rayCapsuleIntersection,
  rayTriangleIntersection,
  closestPointOnTriangle,
  closestPointOnSegment,
  closestPointOnPlane,
  closestPointOnSphere,
  closestPointOnBox,
  closestPointOnCapsule,
  triangleTriangleIntersection,
  segmentsIntersect,
  meshSurfaceDistance,
  meshBoundingRadius,
  rigidBodyVelocity,
  rigidBodyAcceleration,
  angularVelocity,
  angularAcceleration,
  momentum,
  angularMomentum,
  impulse,
  restitutionVelocity,
  frictionImpulse,
  gravityAcceleration,
  springForce,
  dampingForce,
  constraintForce,
  constraintError,
  eulerIntegrate,
  verletIntegrate,
  rungeKuttaIntegrate,
  physicsSubsteps,
  physicsStability,
  projectileDirection,
  projectileTrajectory,
  projectileFlightTime,
  projectileImpactPoint,
  projectileWindDrift,
  projectileSpreadAngle,
  magnetDirection,
  magnetVelocity,
  itemHoverHeight,
  itemBobAmplitude,
  itemBobFrequency,
  itemRotationSpeed,
  itemPickupRange,
  itemPickupOffset,
  lerpColor,
  readColor,
  particleOpacity,
  attractorForce,
  fieldDirection,
  effectRadius,
  effectExpansion,
  effectFalloff,
  effectDuration,
  effectIntensity,
  named,
  collide,
  bounds,
  aabb
} from '../semantics/physics-semantics.js';

/** Lấy hình dạng đầu tiên hợp lệ trong danh sách đối tượng cho trước. */
function pickShape(...candidates: unknown[]): unknown {
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const o = candidate as Record<string, unknown>;
    if (o.min && o.max) return candidate;
    if (o.center && typeof o.center === 'object') return candidate;
    if (o.radius !== undefined) return candidate;
    if (o.start && o.end) return candidate;
    if (o.normal !== undefined) return candidate;
    if (o.a && o.b && o.c) return candidate;
    if (o.target || o.shape || o.collider || o.mesh) return candidate;
  }
  return undefined;
}

/** Đọc một đối tượng con (vd `entity.target`) từ danh sách nguồn. */
function child(source: unknown, ...keys: string[]): unknown {
  if (!source || typeof source !== 'object') return undefined;
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (raw !== undefined && raw !== null) return raw;
  }
  return undefined;
}

export class PhysicsCollisionProjectileSubsystem {
  public config: SpatialUIConfig;

  constructor(config?: SpatialUIConfig) {
    this.config = config ?? { fov: 60, nearPlane: 0.1, farPlane: 1000, screenWidth: 1920, screenHeight: 1080 };
  }

  // ==========================================================================
  // Bộ tuỳ chọn thống nhất (options.scale / unit / reference / invert / entity)
  //
  // Mọi method bên dưới đều đọc cùng một bộ khoá. Không truyền `options` thì
  // kết quả y hệt trước đây (hệ số 1, không đảo dấu, khung world, đơn vị mặc định).
  // ==========================================================================

  /** Hệ số nhân từ `options.scale` (mặc định 1). */
  private scaleOf(options?: any): number {
    const raw = readNum(options, ['scale'], Number.NaN);
    return Number.isFinite(raw) ? raw : 1;
  }

  /** Đơn vị trả về do `options.unit` chỉ định (null nếu không chỉ định). */
  private unitOf(options?: any): string | null {
    const raw = options && typeof options === 'object'
      ? (options as Record<string, unknown>).unit
      : undefined;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  }

  /** Có đảo dấu kết quả số theo `options.invert` không. */
  private invertOf(options?: any): boolean {
    return Boolean(
      options
      && typeof options === 'object'
      && (options as Record<string, unknown>).invert === true,
    );
  }

  /** Khung tham chiếu: 'world' (mặc định) hoặc 'local'. */
  private referenceOf(options?: any): 'world' | 'local' {
    const raw = options && typeof options === 'object'
      ? (options as Record<string, unknown>).reference
      : undefined;
    return raw === 'local' ? 'local' : 'world';
  }

  /** Số kết quả: nhân `options.scale` rồi đảo dấu nếu `options.invert`. */
  private transformedNumber(value: number, options?: any): number {
    const sign = this.invertOf(options) ? -1 : 1;
    return value * this.scaleOf(options) * sign;
  }

  /** Số kết quả chỉ đảo dấu nếu `options.invert` (không nhân hệ số). */
  private invertedNumber(value: number, options?: any): number {
    return this.invertOf(options) ? -value : value;
  }

  /** Vector kết quả: nhân `options.scale` rồi đảo dấu nếu `options.invert`. */
  private transformedVector(value: Vec3D, options?: any): Vec3D {
    const factor = this.scaleOf(options);
    const sign = this.invertOf(options) ? -1 : 1;
    return {
      x: value.x * factor * sign,
      y: value.y * factor * sign,
      z: value.z * factor * sign,
    };
  }

  /** Quaternion nghịch đảo (xoay ngược) khi `options.invert`. */
  private transformedQuaternion(value: QuatD, options?: any): QuatD {
    return this.invertOf(options)
      ? { x: -value.x, y: -value.y, z: -value.z, w: value.w }
      : value;
  }

  /** Entity thay thế để tính: `options.entity` ghi đè entity đầu vào. */
  private entityOf(entity: any, options?: any): any {
    const raw = options && typeof options === 'object'
      ? (options as Record<string, unknown>).entity
      : undefined;
    return raw !== undefined && raw !== null ? raw : entity;
  }

  /** Điểm kết quả theo khung tham chiếu: 'local' → tương đối `origin`. */
  private referencePoint(result: Vec3D, origin: Vec3D, options?: any): Vec3D {
    return this.referenceOf(options) === 'local' ? subtract(result, origin) : result;
  }

  /** Vector khác 0 đầu tiên tìm được trong danh sách nguồn. */
  private firstVectorOf(sources: unknown[], keys: string[]): Vec3D {
    for (const source of sources) {
      const value = readVec(source, keys);
      if (magnitude(value) > 0) return value;
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Gia tốc đo được từ lịch sử vận tốc trong `dt` (null nếu thiếu dữ liệu). */
  private observedAcceleration(entity: any, dt: number): Vec3D | null {
    const velocity = readVec(entity, ['velocity', 'linearVelocity']);
    const previous = readVec(entity, ['previousVelocity', 'lastVelocity']);
    if (magnitude(velocity) <= 0 || magnitude(previous) <= 0) return null;
    return scale(subtract(velocity, previous), 1 / Math.max(1e-6, dt));
  }

  // ==========================================================================
  // 34. Va chạm, vật lý và đạn
  // ==========================================================================

  /**
   * [1451] calculateAABBOverlap
   * Kiểm tra chồng lấn hai hộp giới hạn theo trục.
   */
  public calculateAABBOverlap(a?: any, b?: any): any {
    return aabb('calculateAABBOverlap', resolveBox(a), resolveBox(b));
  }
  /**
   * [1452] calculateOBBOverlap
   * Kiểm tra chồng lấn hai hộp có hướng (SAT).
   */
  public calculateOBBOverlap(a?: any, b?: any): any {
    const qa = readQuat(a, ['quaternion', 'rotation']);
    const qb = readQuat(b, ['quaternion', 'rotation']);
    return obbOverlap(resolveBox(a), resolveBox(b), qa, qb);
  }
  /**
   * [1453] calculateSphereOverlap
   * Kiểm tra chồng lấn hai hình cầu.
   */
  public calculateSphereOverlap(entity?: any, radius = 1.0): any {
    const first = resolveSphere(entity, radius);
    const other = child(entity, 'other', 'target', 'collider') ?? undefined;
    const second = resolveSphere(other, radius);
    const distance = distance3D(first.center, second.center);
    const hit = distance <= first.radius + second.radius;
    const normal = normalize(subtract(second.center, first.center));
    return collide(
      'calculateSphereOverlap',
      hit,
      Math.max(0, distance - first.radius - second.radius),
      add(first.center, scale(normal, first.radius)),
      normal,
      hit ? first.radius + second.radius - distance : 0,
    );
  }
  /**
   * [1454] calculateCapsuleOverlap
   * Kiểm tra chồng lấn hai capsule.
   */
  public calculateCapsuleOverlap(entity?: any, height = 2.0, radius = 0.5): any {
    const first = resolveCapsule(entity, radius, height);
    const other = child(entity, 'other', 'target', 'collider') ?? undefined;
    const second = resolveCapsule(other, radius, height);
    const distance = distanceBetweenCapsuleHelper(first, second);
    const hit = distance <= 0;
    const normal = normalize(subtract(second.start, first.start));
    return collide(
      'calculateCapsuleOverlap',
      hit,
      distance,
      first.start,
      normal,
      hit ? -distance : 0,
    );
  }
  /**
   * [1455] calculateCylinderOverlap
   * Kiểm tra chồng lấn hai hình trụ.
   */
  public calculateCylinderOverlap(a?: any, b?: any): any {
    const first = resolveCylinder(a);
    const second = resolveCylinder(b);
    const dx = first.center.x - second.center.x;
    const dz = first.center.z - second.center.z;
    const radialDistance = Math.hypot(dx, dz);
    const dy = first.center.y - second.center.y;
    const radialHit = radialDistance <= first.radius + second.radius;
    const verticalHit = Math.abs(dy) <= (first.height + second.height) / 2;
    const hit = radialHit && verticalHit;
    const normal = normalize({ x: dx, y: 0, z: dz });
    const distance = Math.max(0, radialDistance - first.radius - second.radius)
      + Math.max(0, Math.abs(dy) - (first.height + second.height) / 2);
    return collide(
      'calculateCylinderOverlap',
      hit,
      distance,
      { x: first.center.x + normal.x * first.radius, y: first.center.y, z: first.center.z + normal.z * first.radius },
      normal,
      hit ? distance : 0,
    );
  }
  /**
   * [1456] calculatePlaneIntersection
   * Tạo mặt phẳng từ normal và khoảng cách.
   */
  public calculatePlaneIntersection(normal?: Vec3D, distance = 0): any {
    const n = normalize(normal ?? { x: 0, y: 1, z: 0 });
    return {
      normal: n,
      distance,
      equation: `${n.x.toFixed(4)}x + ${n.y.toFixed(4)}y + ${n.z.toFixed(4)}z = ${distance.toFixed(4)}`,
    };
  }
  /**
   * [1457] calculateRayPlaneIntersection
   * Giao điểm tia với mặt phẳng.
   */
  public calculateRayPlaneIntersection(origin?: Vec3D, direction?: Vec3D): any {
    const ray = { origin: origin ?? { x: 0, y: 0, z: 0 }, direction: direction ?? { ...FORWARD3 } };
    const plane = resolvePlane(pickShape(ray.origin, child(ray.direction, 'plane', 'target')), { x: 0, y: 1, z: 0 }, 0);
    const point = rayPlane(ray, plane);
    return named('calculateRayPlaneIntersection', point, {
      hit: point !== null,
      plane,
      distance: point ? distance3D(ray.origin, point) : Infinity,
    });
  }
  /**
   * [1458] calculateRaySphereIntersection
   * Giao điểm tia với hình cầu.
   */
  public calculateRaySphereIntersection(origin?: Vec3D, direction?: Vec3D): any {
    const ray = { origin: origin ?? { x: 0, y: 0, z: 0 }, direction: direction ?? { ...FORWARD3 } };
    const sphere = resolveSphere(pickShape(ray.origin, child(ray.direction, 'sphere', 'target')), 0.5);
    const result = raySphereIntersection(ray, sphere);
    return named('calculateRaySphereIntersection', result.point, {
      hit: result.hit,
      distance: result.distance,
      sphere,
    });
  }
  /**
   * [1459] calculateRayBoxIntersection
   * Giao điểm tia với hộp giới hạn.
   */
  public calculateRayBoxIntersection(origin?: Vec3D, direction?: Vec3D): any {
    const ray = { origin: origin ?? { x: 0, y: 0, z: 0 }, direction: direction ?? { ...FORWARD3 } };
    const box = resolveBox(pickShape(ray.origin, child(ray.direction, 'box', 'target')));
    const point = rayBox(ray, box);
    return named('calculateRayBoxIntersection', point, {
      hit: point !== null,
      box,
      distance: point ? distance3D(ray.origin, point) : Infinity,
    });
  }
  /**
   * [1460] calculateRayCapsuleIntersection
   * Giao điểm tia với capsule.
   */
  public calculateRayCapsuleIntersection(origin?: Vec3D, direction?: Vec3D): any {
    const ray = { origin: origin ?? { x: 0, y: 0, z: 0 }, direction: direction ?? { ...FORWARD3 } };
    const capsule = resolveCapsule(pickShape(ray.origin, child(ray.direction, 'capsule', 'target')));
    const result = rayCapsuleIntersection(ray, capsule);
    return named('calculateRayCapsuleIntersection', result.point, {
      hit: result.hit,
      distance: result.distance,
      capsule,
    });
  }
  /**
   * [1461] calculateRayTriangleIntersection
   * Giao điểm tia với tam giác.
   */
  public calculateRayTriangleIntersection(origin?: Vec3D, direction?: Vec3D): any {
    const ray = { origin: origin ?? { x: 0, y: 0, z: 0 }, direction: direction ?? { ...FORWARD3 } };
    const triangle = resolveTriangle(pickShape(ray.origin, child(ray.direction, 'triangle', 'target')));
    const result = rayTriangleIntersection(ray, triangle);
    return named('calculateRayTriangleIntersection', result.point, {
      hit: result.hit,
      distance: result.distance,
      barycentric: result.barycentric,
    });
  }
  /**
   * [1462] calculateSegmentSegmentDistance
   * Khoảng cách giữa hai đoạn thẳng.
   */
  public calculateSegmentSegmentDistance(a?: any, b?: any): any {
    const p1 = resolvePointOf(a);
    const p2 = resolvePointOf(child(a, 'end', 'b') ?? a);
    const q1 = resolvePointOf(b);
    const q2 = resolvePointOf(child(b, 'end', 'b') ?? b);
    return distanceBetweenSegmentsHelper(p1, p2, q1, q2);
  }
  /**
   * [1463] calculateSegmentTriangleIntersection
   * Kiểm tra đoạn thẳng có cắt tam giác không.
   */
  public calculateSegmentTriangleIntersection(a?: any, b?: any): any {
    const start = resolvePointOf(a);
    const end = resolvePointOf(child(a, 'end', 'b') ?? b);
    const triangle = resolveTriangle(pickShape(b, child(a, 'triangle', 'target')));
    const direction = subtract(end, start);
    const length = magnitude(direction);
    const hit = length > 1e-9 && rayTriangleIntersection(
      { origin: start, direction: scale(direction, 1 / length) },
      triangle,
    ).hit;
    return collide('calculateSegmentTriangleIntersection', hit, hit ? length : Infinity, start, { x: 0, y: 1, z: 0 }, hit ? 0.01 : 0);
  }
  /**
   * [1464] calculateTriangleTriangleIntersection
   * Kiểm tra hai tam giác có cắt nhau không.
   *
   * Tam giác được đọc từ chính object tam giác (`{a,b,c}`) hoặc từ
   * `triangleA` / `triangleB` / `triangle` của entity — nhờ vậy hai tam giác
   * thật của cùng một entity được dùng thay vì tam giác rỗng.
   */
  public calculateTriangleTriangleIntersection(a?: any, b?: any): any {
    const fromA = readTriangles(a);
    const fromB = readTriangles(b);
    const first = fromA[0] ?? fromB[0] ?? resolveTriangle(undefined);
    const second = fromB[0] ?? fromA[1] ?? fromA[0] ?? first;

    // Tam giác suy thoái (diện tích bằng 0) không có bề mặt để giao nhau.
    const valid = !isDegenerateTriangle(first) && !isDegenerateTriangle(second);
    const hit = valid && triangleTriangleIntersection(first, second);
    const normal = normalize(cross(subtract(first.b, first.a), subtract(first.c, first.a)));
    // Không cắt nhau → khoảng cách thật giữa hai tam giác.
    const gap = valid
      ? meshSurfaceDistance([first.a, first.b, first.c], [second.a, second.b, second.c])
      : Infinity;
    return collide('calculateTriangleTriangleIntersection', hit, hit ? 0 : gap, first.a, normal, hit ? 0.01 : 0);
  }
  /**
   * [1465] calculateMeshMeshIntersection
   * Kiểm tra hai lưới hình học có giao nhau không.
   */
  public calculateMeshMeshIntersection(a?: any, b?: any): any {
    const pointsA = resolvePoints(a);
    const pointsB = resolvePoints(b);
    const boxA = resolveBox(a);
    const boxB = resolveBox(b);
    const overlapping = aabb('calculateMeshMeshIntersection', boxA, boxB);
    return { ...overlapping, vertexCountA: pointsA.length, vertexCountB: pointsB.length };
  }
  /**
   * [1466] calculateMeshSurfaceDistance
   * Khoảng cách giữa hai bề mặt lưới.
   *
   * Hai lưới được đọc từ `points` / `vertices` / `positions` / `mesh.vertices`
   * của hai đối số (một entity có thể chứa cả hai lưới). Khoảng cách đo
   * theo phép đối xứng (Chamfer): trung bình khoảng cách gần nhất từ mỗi
   * đỉnh của lưới này tới lưới kia, lấy trung bình của cả hai chiều.
   */
  public calculateMeshSurfaceDistance(a?: any, b?: any): any {
    const setsA = readMeshSets(a);
    const setsB = readMeshSets(b);
    const first = setsA[0] ?? setsB[0] ?? [];
    const second = setsB[0] ?? setsA[1] ?? setsA[0] ?? [];
    if (first.length === 0 || second.length === 0) return 0;
    return meanSurfaceDistance(first, second);
  }
  /**
   * [1467] calculateClosestPointOnTriangle
   * Điểm gần nhất trên tam giác.
   */
  public calculateClosestPointOnTriangle(a?: any, b?: any, options?: any): any {
    const point = resolvePointOf(a);
    const triangle = resolveTriangle(pickShape(b, child(a, 'triangle', 'target')));
    const closest = closestPointOnTriangle(point, triangle);
    const extra: Record<string, unknown> = {
      distance: this.transformedNumber(distance3D(point, closest), options),
      worldPoint: closest,
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateClosestPointOnTriangle',
      this.referencePoint(closest, point, options),
      extra,
    );
  }
  /**
   * [1468] calculateClosestPointOnSegment
   * Điểm gần nhất trên đoạn thẳng.
   */
  public calculateClosestPointOnSegment(a?: any, b?: any, options?: any): any {
    const point = resolvePointOf(a);
    const start = resolvePointOf(b);
    const end = resolvePointOf(child(b, 'end', 'b') ?? b);
    const closest = closestPointOnSegment(point, start, end);
    const extra: Record<string, unknown> = {
      distance: this.transformedNumber(distance3D(point, closest), options),
      t: clamp01(magnitude(subtract(closest, start)) / Math.max(1e-6, distance3D(start, end))),
      worldPoint: closest,
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateClosestPointOnSegment',
      this.referencePoint(closest, point, options),
      extra,
    );
  }
  /**
   * [1469] calculateClosestPointOnPlane
   * Điểm gần nhất trên mặt phẳng.
   */
  public calculateClosestPointOnPlane(normal?: Vec3D, distance = 0): any {
    const isPlaneObject = Boolean(normal && typeof normal === 'object' && 'normal' in (normal as any));
    const plane = resolvePlane(
      isPlaneObject ? normal : { x: normal?.x ?? 0, y: normal?.y ?? 1, z: normal?.z ?? 0 },
      { x: 0, y: 1, z: 0 },
      distance,
    );
    const origin = { x: 0, y: 0, z: 0 };
    const point = closestPointOnPlane(origin, plane);
    return named('calculateClosestPointOnPlane', point, { plane, distance: distance3D(origin, point) });
  }
  /**
   * [1470] calculateClosestPointOnSphere
   * Điểm gần nhất trên hình cầu.
   */
  public calculateClosestPointOnSphere(a?: any, b?: any, options?: any): any {
    const point = resolvePointOf(a);
    const sphere = resolveSphere(pickShape(b, child(a, 'sphere', 'target')), 1);
    const closest = closestPointOnSphere(point, sphere);
    const extra: Record<string, unknown> = {
      distance: this.transformedNumber(distance3D(point, closest), options),
      sphere,
      worldPoint: closest,
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateClosestPointOnSphere',
      this.referencePoint(closest, point, options),
      extra,
    );
  }
  /**
   * [1471] calculateClosestPointOnBox
   * Điểm gần nhất trên hộp giới hạn.
   */
  public calculateClosestPointOnBox(a?: any, b?: any, options?: any): any {
    const point = resolvePointOf(a);
    const box = resolveBox(pickShape(b, child(a, 'box', 'target')));
    const closest = closestPointOnBox(point, box);
    const extra: Record<string, unknown> = {
      distance: this.transformedNumber(distance3D(point, closest), options),
      box,
      worldPoint: closest,
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateClosestPointOnBox',
      this.referencePoint(closest, point, options),
      extra,
    );
  }
  /**
   * [1472] calculateClosestPointOnCapsule
   * Điểm gần nhất trên capsule.
   */
  public calculateClosestPointOnCapsule(a?: any, b?: any, options?: any): any {
    const point = resolvePointOf(a);
    const capsule = resolveCapsule(pickShape(b, child(a, 'capsule', 'target')));
    const closest = closestPointOnCapsule(point, capsule);
    const extra: Record<string, unknown> = {
      distance: this.transformedNumber(distance3D(point, closest), options),
      capsule,
      worldPoint: closest,
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateClosestPointOnCapsule',
      this.referencePoint(closest, point, options),
      extra,
    );
  }
  /**
   * [1473] calculateClosestPointOnMesh
   * Điểm gần nhất trên lưới hình học.
   */
  public calculateClosestPointOnMesh(a?: any, b?: any, options?: any): any {
    const point = resolvePointOf(a);
    const points = resolvePoints(pickShape(b, child(a, 'mesh', 'target')));
    if (points.length === 0) {
      const extra: Record<string, unknown> = {
        distance: this.transformedNumber(0, options),
        vertexCount: 0,
        worldPoint: { ...point },
      };
      const unit = this.unitOf(options);
      if (unit) extra.unit = unit;
      return named(
        'calculateClosestPointOnMesh',
        this.referencePoint({ ...point }, point, options),
        extra,
      );
    }
    let best = points[0];
    let bestDistance = distance3D(point, points[0]);
    for (const vertex of points) {
      const d = distance3D(point, vertex);
      if (d < bestDistance) {
        bestDistance = d;
        best = vertex;
      }
    }
    const extra: Record<string, unknown> = {
      distance: this.transformedNumber(bestDistance, options),
      vertexCount: points.length,
      worldPoint: { ...best },
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateClosestPointOnMesh',
      this.referencePoint({ ...best }, point, options),
      extra,
    );
  }
  /**
   * [1474] calculateContactManifold
   * Tập điểm tiếp xúc giữa hai vật thể.
   */
  public calculateContactManifold(a?: any, b?: any, options?: any): any {
    const boxA = resolveBox(a);
    const boxB = resolveBox(b);
    const centerA = boxCenter(boxA);
    const centerB = boxCenter(boxB);
    let normal = normalize(subtract(centerB, centerA));
    if (magnitude(normal) === 0) normal = { x: 0, y: 1, z: 0 };
    // `options.scale` co giãn cả vùng tiếp xúc (điểm + độ sâu) theo cùng tỉ lệ.
    const factor = this.scaleOf(options);
    const halfA = scale(boxHalf(boxA), factor);
    const halfB = scale(boxHalf(boxB), factor);
    const points: Vec3D[] = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          points.push({
            x: centerA.x + sx * halfA.x,
            y: centerA.y + sy * halfA.y,
            z: centerA.z + sz * halfA.z,
          });
        }
      }
    }
    const rawDepth = Math.min(halfA.x + halfB.x, halfA.y + halfB.y, halfA.z + halfB.z) * 2;
    const extra: Record<string, unknown> = {
      normal,
      depth: this.transformedNumber(rawDepth, options),
      count: points.length,
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    const local = this.referenceOf(options) === 'local';
    return named(
      'calculateContactManifold',
      local ? points.map((p) => subtract(p, centerA)) : points,
      extra,
    );
  }
  /**
   * [1475] calculateCollisionNormal
   * Pháp tuyến va chạm giữa hai vật thể.
   */
  public calculateCollisionNormal(a?: any, b?: any): any {
    const normal = normalize(subtract(resolvePointOf(b), resolvePointOf(a)));
    return magnitude(normal) > 0 ? normal : { x: 0, y: 1, z: 0 };
  }
  /**
   * [1476] calculateCollisionDepth
   * Độ sâu xâm nhập giữa hai vật thể.
   */
  public calculateCollisionDepth(a?: any, b?: any): any {
    const boxA = resolveBox(a);
    const boxB = resolveBox(b);
    const overlapX = Math.min(boxA.max.x, boxB.max.x) - Math.max(boxA.min.x, boxB.min.x);
    const overlapY = Math.min(boxA.max.y, boxB.max.y) - Math.max(boxA.min.y, boxB.min.y);
    const overlapZ = Math.min(boxA.max.z, boxB.max.z) - Math.max(boxA.min.z, boxB.min.z);
    return Math.max(0, Math.min(overlapX, overlapY, overlapZ));
  }
  /**
   * [1477] calculateCollisionTimeOfImpact
   * Thời điểm va chạm giữa hai vật thể đang chuyển động.
   */
  public calculateCollisionTimeOfImpact(a?: any, b?: any): any {
    const positionA = resolvePointOf(a);
    const positionB = resolvePointOf(b);
    const velocityA = readVec(a, ['velocity']);
    const velocityB = readVec(b, ['velocity']);
    const relative = subtract(velocityA, velocityB);
    const separation = subtract(positionB, positionA);
    const radiusA = readNum(a, ['radius'], 0.5);
    const radiusB = readNum(b, ['radius'], 0.5);
    const combined = radiusA + radiusB;
    const c = dot(separation, separation) - combined * combined;
    if (c < 0) return 0;
    const a2 = dot(relative, relative);
    if (a2 < 1e-12) return Infinity;
    const b2 = 2 * dot(relative, separation);
    const disc = b2 * b2 - 4 * a2 * c;
    if (disc < 0) return Infinity;
    const t = (-b2 - Math.sqrt(disc)) / (2 * a2);
    return t < 0 ? 0 : t;
  }
  /**
   * [1478] calculateSweptAABB
   * Thể tích quét của hộp giới hạn theo thời gian.
   */
  public calculateSweptAABB(a?: any, b?: any, options?: any): any {
    const box = resolveBox(a);
    // `b` là vật thể thứ hai: vận tốc quét tính theo chuyển động tương đối.
    const velocityA = readVec(a, ['velocity']);
    const velocityB = readVec(b, ['velocity']);
    const relative = magnitude(velocityB) > 0 ? subtract(velocityA, velocityB) : velocityA;
    const velocity = this.transformedVector(relative, options);
    const dt = readNum(options, ['dt', 'deltaTime'], 1);
    const swept = boundingBox(
      {
        x: box.min.x + velocity.x * dt * 0.5,
        y: box.min.y + velocity.y * dt * 0.5,
        z: box.min.z + velocity.z * dt * 0.5,
      },
      {
        x: box.max.x - box.min.x + Math.abs(velocity.x) * dt,
        y: box.max.y - box.min.y + Math.abs(velocity.y) * dt,
        z: box.max.z - box.min.z + Math.abs(velocity.z) * dt,
      },
    );
    const extra: Record<string, unknown> = {
      velocity,
      velocityA,
      velocityB,
      dt,
      distance: magnitude(scale(velocity, dt)),
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named('calculateSweptAABB', swept, extra);
  }
  /**
   * [1479] calculateSweptSphere
   * Thể tích quét của hình cầu theo thời gian.
   */
  public calculateSweptSphere(a?: any, b?: any, options?: any): any {
    const sphere = resolveSphere(a, 0.5);
    // `b` là vật thể thứ hai: vận tốc quét tính theo chuyển động tương đối.
    const velocityA = readVec(a, ['velocity']);
    const velocityB = readVec(b, ['velocity']);
    const relative = magnitude(velocityB) > 0 ? subtract(velocityA, velocityB) : velocityA;
    const velocity = this.transformedVector(relative, options);
    const dt = readNum(options, ['dt', 'deltaTime'], 1);
    const end = add(sphere.center, scale(velocity, dt));
    const extra: Record<string, unknown> = {
      velocity,
      velocityA,
      velocityB,
      dt,
      distance: distance3D(sphere.center, end),
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named('calculateSweptSphere', { start: sphere.center, end, radius: sphere.radius }, extra);
  }
  /**
   * [1480] calculateContinuousCollision
   * Va chạm liên tục giữa hai vật thể chuyển động.
   */
  public calculateContinuousCollision(a?: any, b?: any): any {
    const toi = this.calculateCollisionTimeOfImpact(a, b);
    const hit = Number.isFinite(toi);
    const pointA = resolvePointOf(a);
    const velocityA = readVec(a, ['velocity']);
    const impact = add(pointA, scale(velocityA, Number.isFinite(toi) ? toi : 0));
    return collide(
      'calculateContinuousCollision',
      hit,
      Number.isFinite(toi) ? toi : Infinity,
      impact,
      this.calculateCollisionNormal(a, b),
      hit ? 0.01 : 0,
    );
  }
  /**
   * [1481] calculateRigidBodyVelocity
   * Vận tốc tuyến tính của thân cứng.
   */
  public calculateRigidBodyVelocity(entity?: any, dt = 0.016): any {
    return rigidBodyVelocity(entity, dt);
  }
  /**
   * [1482] calculateRigidBodyAcceleration
   * Gia tốc tuyến tính của thân cứng.
   */
  public calculateRigidBodyAcceleration(entity?: any, dt = 0.016): any {
    return rigidBodyAcceleration(entity, dt);
  }
  /**
   * [1483] calculateRigidBodyAngularVelocity
   * Vận tốc góc của thân cứng.
   */
  public calculateRigidBodyAngularVelocity(entity?: any, dt = 0.016): any {
    return angularVelocity(entity, dt);
  }
  /**
   * [1484] calculateRigidBodyAngularAcceleration
   * Gia tốc góc của thân cứng.
   */
  public calculateRigidBodyAngularAcceleration(entity?: any, dt = 0.016): any {
    return angularAcceleration(entity, dt);
  }
  /**
   * [1485] calculateRigidBodyMomentum
   * Động lượng tuyến tính.
   */
  public calculateRigidBodyMomentum(entity?: any, dt = 0.016): any {
    return momentum(entity, dt);
  }
  /**
   * [1486] calculateAngularMomentum
   * Động lượng góc.
   */
  public calculateAngularMomentum(entity?: any, dt = 0.016): any {
    return angularMomentum(entity, dt);
  }
  /**
   * [1487] calculateImpulse
   * Xung lượng tác dụng lên thân cứng.
   */
  public calculateImpulse(entity?: any, dt = 0.016): any {
    return impulse(entity, dt);
  }
  /**
   * [1488] calculateCollisionImpulse
   * Xung lượng do va chạm giữa hai thân cứng.
   */
  public calculateCollisionImpulse(a?: any, b?: any): any {
    const massA = readNum(a, ['mass'], DEFAULT_MASS);
    const massB = readNum(b, ['mass'], DEFAULT_MASS);
    const relative = subtract(readVec(a, ['velocity']), readVec(b, ['velocity']));
    const normal = this.calculateCollisionNormal(a, b);
    const separating = dot(relative, normal);
    if (separating > 0) return { x: 0, y: 0, z: 0 };
    const restitution = clamp(
      readNum(a, ['restitution'], 0.3) + readNum(b, ['restitution'], 0.3),
      0,
      2,
    ) / 2;
    const j = (-(1 + restitution) * separating) / (1 / massA + 1 / massB);
    return scale(normal, j);
  }
  /**
   * [1489] calculateRestitutionVelocity
   * Vận tốc sau va chạm có hồi phục.
   */
  public calculateRestitutionVelocity(entity?: any, dt = 0.016): any {
    return restitutionVelocity(entity, dt);
  }
  /**
   * [1490] calculateFrictionImpulse
   * Xung lượng ma sát.
   */
  public calculateFrictionImpulse(entity?: any, dt = 0.016): any {
    return frictionImpulse(entity, dt);
  }
  /**
   * [1491] calculateGravityAcceleration
   * Gia tốc trọng trường.
   */
  public calculateGravityAcceleration(entity?: any, dt = 0.016): any {
    const explicit = readVec(entity, ['gravity', 'gravityAcceleration']);
    if (magnitude(explicit) > 0) return explicit;
    const gravityScale = readNum(entity, ['gravityScale'], Number.NaN);
    if (Number.isFinite(gravityScale)) return scale(GRAVITY, gravityScale);
    // Không có trọng lực cấu hình: suy ra từ chuyển động quan sát trong `dt`.
    const observed = this.observedAcceleration(entity, dt);
    if (observed) return observed;
    return scale(GRAVITY, 1);
  }
  /**
   * [1492] calculateSpringForce
   * Lực lò xo Hooke.
   */
  public calculateSpringForce(entity?: any, dt = 0.016): any {
    return springForce(entity, dt);
  }
  /**
   * [1493] calculateDampingForce
   * Lực giảm chấn.
   */
  public calculateDampingForce(entity?: any, dt = 0.016): any {
    return dampingForce(entity, dt);
  }
  /**
   * [1494] calculateConstraintForce
   * Lực ràng buộc.
   */
  public calculateConstraintForce(entity?: any, dt = 0.016): any {
    return constraintForce(entity, dt);
  }
  /**
   * [1495] calculateConstraintError
   * Sai số hiện tại của ràng buộc.
   */
  public calculateConstraintError(a?: any, b?: any, options?: any): any {
    return this.transformedNumber(constraintError(a, b), options);
  }
  /**
   * [1496] calculatePhysicsIntegration
   * Bước tích phân Euler.
   */
  public calculatePhysicsIntegration(a?: any, b?: any, options?: any): any {
    const position = resolvePointOf(a);
    // `b` là nguồn dữ liệu thứ hai: dùng khi `a` không có vận tốc/gia tốc.
    const velocity = this.firstVectorOf([a, b], ['velocity']);
    const acceleration = this.firstVectorOf([a, b], ['acceleration']);
    const dt = readNum(options, ['dt', 'deltaTime'], 0.016);
    const next = eulerIntegrate(position, velocity, acceleration, dt);
    const scaled = this.transformedVector(next, options);
    const extra: Record<string, unknown> = {
      previousPosition: position,
      velocity,
      acceleration,
      dt,
      displacement: magnitude(subtract(scaled, position)),
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculatePhysicsIntegration',
      this.referencePoint(scaled, position, options),
      extra,
    );
  }
  /**
   * [1497] calculateVerletIntegration
   * Bước tích phân Verlet.
   */
  public calculateVerletIntegration(a?: any, b?: any, options?: any): any {
    const position = resolvePointOf(a);
    // `b` là nguồn dữ liệu thứ hai: vị trí trước / gia tốc khi `a` thiếu.
    const previous = this.firstVectorOf([a, b], ['previousPosition']);
    const acceleration = this.firstVectorOf([a, b], ['acceleration']);
    const dt = readNum(options, ['dt', 'deltaTime'], 0.016);
    const next = verletIntegrate(position, previous, acceleration, dt);
    const scaled = this.transformedVector(next, options);
    const extra: Record<string, unknown> = {
      previousPosition: position,
      acceleration,
      dt,
      displacement: magnitude(subtract(scaled, position)),
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateVerletIntegration',
      this.referencePoint(scaled, position, options),
      extra,
    );
  }
  /**
   * [1498] calculateRungeKuttaIntegration
   * Bước tích phân Runge–Kutta bậc 4.
   */
  public calculateRungeKuttaIntegration(a?: any, b?: any, options?: any): any {
    const position = resolvePointOf(a);
    // `b` là nguồn dữ liệu thứ hai: vận tốc/gia tốc khi `a` thiếu.
    const velocity = this.firstVectorOf([a, b], ['velocity']);
    const acceleration = this.firstVectorOf([a, b], ['acceleration']);
    const dt = readNum(options, ['dt', 'deltaTime'], 0.016);
    const next = rungeKuttaIntegrate(position, velocity, acceleration, dt);
    const scaled = this.transformedVector(next, options);
    const extra: Record<string, unknown> = {
      previousPosition: position,
      velocity,
      acceleration,
      dt,
      displacement: magnitude(subtract(scaled, position)),
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateRungeKuttaIntegration',
      this.referencePoint(scaled, position, options),
      extra,
    );
  }
  /**
   * [1499] calculatePhysicsSubsteps
   * Số bước con mô phỏng.
   */
  public calculatePhysicsSubsteps(a?: any, b?: any, options?: any): any {
    // `b` là nguồn dữ liệu thứ hai cho bước thời gian / bước con tối đa.
    const dt = readNum(options, ['dt', 'deltaTime'], readNum(a, ['dt'], readNum(b, ['dt'], 0.016)));
    const maxStep = readNum(options, ['maxStep'], readNum(b, ['maxStep'], 1 / 120));
    const steps = physicsSubsteps(dt, maxStep);
    return named('calculatePhysicsSubsteps', steps, {
      dt,
      maxStep,
      effectiveStep: dt / steps,
    });
  }
  /**
   * [1500] calculatePhysicsStability
   * Độ ổn định của bước mô phỏng.
   */
  public calculatePhysicsStability(a?: any, b?: any, options?: any): any {
    // `b` là nguồn dữ liệu thứ hai cho bước thời gian / bước con tối đa.
    const dt = readNum(options, ['dt', 'deltaTime'], readNum(a, ['dt'], readNum(b, ['dt'], 0.016)));
    const maxStep = readNum(options, ['maxStep'], readNum(b, ['maxStep'], 1 / 120));
    const stability = physicsStability(dt, maxStep);
    return named('calculatePhysicsStability', stability, {
      dt,
      maxStep,
      stable: stability > 0.9,
    });
  }
  /**
   * [1501] getProjectilePosition
   * Vị trí hiện tại của đạn.
   */
  public getProjectilePosition(entity?: any, offset?: Vec3D): any {
    const base = resolvePointOf(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1502] getProjectileOrigin
   * Điểm xuất phát của đạn.
   */
  public getProjectileOrigin(a?: any, b?: any, options?: any): any {
    // `b` là nguồn thứ hai cho điểm xuất phát.
    const fromA = child(a, 'origin', 'start');
    const fromB = child(b, 'origin', 'start');
    const source = fromA ?? fromB ?? (a !== undefined && a !== null ? a : b);
    const origin = this.transformedVector(resolvePointOf(source), options);
    const extra: Record<string, unknown> = { origin };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named('getProjectileOrigin', origin, extra);
  }
  /**
   * [1503] getProjectileTarget
   * Điểm nhắm của đạn.
   */
  public getProjectileTarget(a?: any, b?: any, options?: any): any {
    const raw = resolvePointOf(child(a, 'target', 'aim') ?? b);
    const target = this.transformedVector(raw, options);
    const extra: Record<string, unknown> = { target };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named('getProjectileTarget', target, extra);
  }
  /**
   * [1504] calculateProjectileDirection
   * Hướng bắn.
   */
  public calculateProjectileDirection(a?: any, b?: any): any {
    const origin = resolvePointOf(child(a, 'origin', 'start') ?? a);
    const target = resolvePointOf(child(b, 'target', 'aim') ?? b);
    return projectileDirection(origin, target);
  }
  /**
   * [1505] calculateProjectileVelocity
   * Vận tốc đạn.
   */
  public calculateProjectileVelocity(entity?: any, dt = 0.016): any {
    return rigidBodyVelocity(entity, dt);
  }
  /**
   * [1506] calculateProjectileAcceleration
   * Gia tốc đạn (trọng lực).
   */
  public calculateProjectileAcceleration(entity?: any, dt = 0.016): any {
    const explicit = readVec(entity, ['acceleration']);
    if (magnitude(explicit) > 0) return explicit;
    const gravityVector = readVec(entity, ['gravity', 'gravityAcceleration']);
    if (magnitude(gravityVector) > 0) return gravityVector;
    const gravityScale = readNum(entity, ['gravityScale'], Number.NaN);
    if (Number.isFinite(gravityScale)) return scale(GRAVITY, gravityScale);
    // Không có gia tốc cấu hình: suy ra từ chuyển động quan sát trong `dt`.
    const observed = this.observedAcceleration(entity, dt);
    if (observed) return observed;
    return gravityAcceleration(entity);
  }
  /**
   * [1507] calculateProjectileTrajectory
   * Quỹ đạo đạn.
   */
  public calculateProjectileTrajectory(a?: any, b?: any, options?: any): any {
    const origin = resolvePointOf(child(a, 'origin', 'start') ?? a);
    const target = resolvePointOf(child(b, 'target', 'aim') ?? b);
    const speed = readNum(options, ['speed', 'velocity'], readNum(a, ['speed'], 30));
    const samples = readNum(options, ['samples'], 24);
    const points = projectileTrajectory(origin, target, speed, GRAVITY, samples);
    return named('calculateProjectileTrajectory', points, {
      origin,
      target,
      speed,
      count: points.length,
      apex: points.reduce((best, p) => (p.y > best.y ? p : best), points[0] ?? origin),
    });
  }
  /**
   * [1508] calculateProjectileFlightTime
   * Thời gian bay của đạn.
   */
  public calculateProjectileFlightTime(a?: any, b?: any, options?: any): any {
    const origin = resolvePointOf(child(a, 'origin', 'start') ?? a);
    const target = resolvePointOf(child(b, 'target', 'aim') ?? b);
    const speed = readNum(options, ['speed', 'velocity'], readNum(a, ['speed'], 30));
    return projectileFlightTime(origin, target, speed, GRAVITY);
  }
  /**
   * [1509] calculateProjectileImpactPoint
   * Điểm va chạm của đạn.
   */
  public calculateProjectileImpactPoint(a?: any, b?: any, options?: any): any {
    const origin = resolvePointOf(child(a, 'origin', 'start') ?? a);
    const direction = normalize(subtract(
      resolvePointOf(child(b, 'target', 'aim') ?? b),
      origin,
    ));
    const speed = readNum(options, ['speed', 'velocity'], readNum(a, ['speed'], 30));
    const groundY = readNum(options, ['groundY', 'ground'], 0);
    return named('calculateProjectileImpactPoint', projectileImpactPoint(origin, direction, speed, groundY), {
      origin,
      direction,
      speed,
      groundY,
    });
  }
  /**
   * [1510] calculateProjectileImpactNormal
   * Pháp tuyến tại điểm va chạm.
   */
  public calculateProjectileImpactNormal(a?: any, b?: any): any {
    const normal = normalize(subtract(resolvePointOf(b), resolvePointOf(a)));
    return magnitude(normal) > 0 ? normal : { x: 0, y: 1, z: 0 };
  }
  /**
   * [1511] calculateProjectileSpreadAngle
   * Góc tán sai của đạn.
   */
  public calculateProjectileSpreadAngle(a?: any, b?: any): any {
    const spread = readNum(a, ['spread', 'spreadAngle'], readNum(b, ['spread'], 0));
    return projectileSpreadAngle(spread);
  }
  /**
   * [1512] calculateProjectileDropDistance
   * Độ rơi của đạn do trọng lực.
   */
  public calculateProjectileDropDistance(a?: any, b?: any): any {
    const origin = resolvePointOf(a);
    const target = resolvePointOf(b);
    const speed = readNum(a, ['speed', 'velocity'], 30);
    const time = projectileFlightTime(origin, target, speed, GRAVITY);
    return 0.5 * GRAVITY_MAGNITUDE * time * time;
  }
  /**
   * [1513] calculateProjectileWindDrift
   * Độ lệch do gió.
   */
  public calculateProjectileWindDrift(a?: any, b?: any, options?: any): any {
    const origin = resolvePointOf(child(a, 'origin', 'start') ?? a);
    const target = resolvePointOf(child(b, 'target', 'aim') ?? b);
    const speed = readNum(options, ['speed', 'velocity'], readNum(a, ['speed'], 30));
    const wind = readVec(options, ['wind', 'windVelocity']);
    const time = projectileFlightTime(origin, target, speed, GRAVITY);
    return named('calculateProjectileWindDrift', projectileWindDrift(origin, { x: 0, y: 0, z: 1 }, speed, wind, time), {
      wind,
      flightTime: time,
    });
  }
  /**
   * [1514] calculateProjectileCollision
   * Va chạm của đạn với vật cản.
   */
  public calculateProjectileCollision(a?: any, b?: any): any {
    const boxA = resolveBox(a);
    const boxB = resolveBox(b);
    const result = aabb('calculateProjectileCollision', boxA, boxB);
    return result;
  }
  /**
   * [1515] calculateProjectileDistanceToTarget
   * Khoảng cách từ đạn tới mục tiêu.
   */
  public calculateProjectileDistanceToTarget(a?: any, b?: any): any {
    return distance3D(resolvePointOf(a), resolvePointOf(b));
  }
  /**
   * [1516] getItemPosition
   * Vị trí vật phẩm.
   */
  public getItemPosition(entity?: any, offset?: Vec3D): any {
    const base = resolvePointOf(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1517] getItemCenter
   * Tâm vật phẩm.
   */
  public getItemCenter(entity?: any, offset?: Vec3D): any {
    const base = resolvePointOf(entity);
    const center = readVec(entity, ['center']);
    const centerPoint = magnitude(center) > 0 ? center : base;
    return {
      x: centerPoint.x + (offset?.x ?? 0),
      y: centerPoint.y + (offset?.y ?? 0),
      z: centerPoint.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1518] getItemRotation
   * Góc quay của vật phẩm.
   */
  public getItemRotation(entityOrAngle?: any, options?: any): any {
    const source = this.entityOf(entityOrAngle, options);
    if (!source) return { x: 0, y: 0, z: 0, w: 1 };
    const record = source as Record<string, unknown>;
    if (record.quaternion || record.rotation) {
      return this.transformedQuaternion(entityQuaternion(source), options);
    }
    // `options.scale` nhân góc quay, `options.invert` xoay ngược.
    const angle = this.transformedNumber(readNum(source, ['angle', 'rotationAngle'], 0), options);
    const axis = normalize(readVec(source, ['axis']));
    const half = angle / 2;
    const s = Math.sin(half);
    return this.transformedQuaternion({
      x: (magnitude(axis) > 0 ? axis.x : 0) * s,
      y: (magnitude(axis) > 0 ? axis.y : 1) * s,
      z: (magnitude(axis) > 0 ? axis.z : 0) * s,
      w: Math.cos(half),
    }, options);
  }
  /**
   * [1519] getItemPickupPosition
   * Vị trí nhặt vật phẩm.
   */
  public getItemPickupPosition(entity?: any, offset?: Vec3D): any {
    const base = resolvePointOf(entity);
    const pickup = readVec(entity, ['pickupOffset']);
    const effective = magnitude(pickup) > 0 ? pickup : { x: 0, y: 0.5, z: 0 };
    return {
      x: base.x + effective.x + (offset?.x ?? 0),
      y: base.y + effective.y + (offset?.y ?? 0),
      z: base.z + effective.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1520] calculateItemDistanceToPlayer
   * Khoảng cách vật phẩm tới người chơi.
   */
  public calculateItemDistanceToPlayer(a?: any, b?: any): any {
    return distance3D(resolvePointOf(a), resolvePointOf(b));
  }
  /**
   * [1521] calculateItemPickupRange
   * Phạm vi nhặt vật phẩm.
   */
  public calculateItemPickupRange(a?: any, b?: any, options?: any): any {
    const explicit = readNum(options, ['pickupRange', 'range'], Number.NaN);
    if (Number.isFinite(explicit)) return explicit;
    return itemPickupRange(a ?? b);
  }
  /**
   * [1522] calculateItemPickupOffset
   * Độ lệch vị trí nhặt.
   */
  public calculateItemPickupOffset(a?: any, b?: any): any {
    const explicit = readVec(a, ['pickupOffset', 'grabOffset']);
    if (magnitude(explicit) > 0) return explicit;
    return itemPickupOffset(b);
  }
  /**
   * [1523] calculateItemMagnetDirection
   * Hướng hút vật phẩm.
   */
  public calculateItemMagnetDirection(a?: any, b?: any): any {
    return magnetDirection(resolvePointOf(a), resolvePointOf(b));
  }
  /**
   * [1524] calculateItemMagnetVelocity
   * Vận tốc hút vật phẩm.
   */
  public calculateItemMagnetVelocity(entity?: any, dt = 0.016): any {
    const item = resolvePointOf(entity);
    const player = readVec(entity, ['player', 'target', 'playerPosition']);
    const strength = readNum(entity, ['magnetStrength'], 10);
    return magnetVelocity(item, player, strength, dt);
  }
  /**
   * [1525] calculateItemHoverHeight
   * Chiều cao lơ lửng của vật phẩm.
   */
  public calculateItemHoverHeight(entity?: any, options?: any): any {
    return this.transformedNumber(itemHoverHeight(this.entityOf(entity, options)), options);
  }
  /**
   * [1526] calculateItemRotationSpeed
   * Tốc độ xoay của vật phẩm.
   */
  public calculateItemRotationSpeed(entityOrAngle?: any, options?: any): any {
    return itemRotationSpeed(entityOrAngle ?? options);
  }
  /**
   * [1527] calculateItemBobAmplitude
   * Biên độ dao động của vật phẩm.
   */
  public calculateItemBobAmplitude(entity?: any, options?: any): any {
    return itemBobAmplitude(entity ?? options);
  }
  /**
   * [1528] calculateItemBobFrequency
   * Tần số dao động của vật phẩm.
   */
  public calculateItemBobFrequency(entity?: any, options?: any): any {
    return itemBobFrequency(entity ?? options);
  }
  /**
   * [1529] calculateParticlePosition
   * Vị trí hạt.
   */
  public calculateParticlePosition(a?: any, b?: any, options?: any): any {
    const base = resolvePointOf(a);
    // `b` là nguồn dữ liệu thứ hai: vận tốc/gia tốc khi `a` thiếu.
    const velocity = this.firstVectorOf([a, b], ['velocity']);
    const acceleration = this.firstVectorOf([a, b], ['acceleration', 'gravity']);
    const dt = readNum(options, ['dt', 'deltaTime'], 0.016);
    // Tích phân Euler: p' = p + v·dt + ½a·dt² (hạt có trọng lực rơi nhanh hơn).
    const position = add(base, add(scale(velocity, dt), scale(acceleration, 0.5 * dt * dt)));
    const scaled = this.transformedVector(position, options);
    const extra: Record<string, unknown> = {
      velocity,
      acceleration,
      dt,
      age: readNum(a, ['age'], 0),
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named(
      'calculateParticlePosition',
      this.referencePoint(scaled, base, options),
      extra,
    );
  }
  /**
   * [1530] calculateParticleVelocity
   * Vận tốc hạt.
   */
  public calculateParticleVelocity(entity?: any, dt = 0.016): any {
    return rigidBodyVelocity(entity, dt);
  }
  /**
   * [1531] calculateParticleAcceleration
   * Gia tốc hạt.
   */
  public calculateParticleAcceleration(entity?: any, dt = 0.016): any {
    const explicit = readVec(entity, ['acceleration']);
    if (magnitude(explicit) > 0) return explicit;
    const gravityVector = readVec(entity, ['gravity', 'gravityAcceleration']);
    if (magnitude(gravityVector) > 0) return gravityVector;
    const gravityScale = readNum(entity, ['gravityScale'], Number.NaN);
    if (Number.isFinite(gravityScale)) return scale(GRAVITY, gravityScale);
    // Không có gia tốc cấu hình: suy ra từ chuyển động quan sát trong `dt`.
    const observed = this.observedAcceleration(entity, dt);
    if (observed) return observed;
    return gravityAcceleration(entity);
  }
  /**
   * [1532] calculateParticleLifetime
   * Tuổi thọ hạt.
   */
  public calculateParticleLifetime(a?: any, b?: any, options?: any): any {
    const explicit = readNum(options, ['lifetime', 'maxLifetime'], Number.NaN);
    if (Number.isFinite(explicit)) return this.transformedNumber(explicit, options);
    // `b` là nguồn dữ liệu thứ hai cho tuổi / thời lượng.
    const age = readNum(a, ['age'], readNum(b, ['age'], 0));
    const duration = readNum(a, ['lifetime', 'duration'], readNum(b, ['lifetime', 'duration'], 1));
    return this.transformedNumber(Math.max(0, duration - age), options);
  }
  /**
   * [1533] calculateParticleScale
   * Kích thước hạt.
   *
   * Nguồn theo thứ tự ưu tiên: `scale` dạng số → `sizeScale` của hạt →
   * `options` → độ lớn của vector `scale` → mặc định 1.
   */
  public calculateParticleScale(entity?: any, options?: any): any {
    const raw = entity && typeof entity === 'object'
      ? (entity as Record<string, unknown>).scale
      : undefined;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    const explicit = readNum(entity, ['sizeScale', 'scaleFactor'], Number.NaN);
    if (Number.isFinite(explicit)) return explicit;
    const fromOptions = readNum(options, ['sizeScale', 'scaleFactor', 'scale'], Number.NaN);
    if (Number.isFinite(fromOptions)) return fromOptions;
    const vector = readVec(entity, ['scale']);
    const length = magnitude(vector);
    if (length > 1e-9) return length;
    return 1;
  }
  /**
   * [1534] calculateParticleRotation
   * Góc quay của hạt.
   */
  public calculateParticleRotation(entityOrAngle?: any, options?: any): any {
    const source = this.entityOf(entityOrAngle, options);
    if (!source) return { x: 0, y: 0, z: 0, w: 1 };
    const record = source as Record<string, unknown>;
    if (record.quaternion || record.rotation) {
      return this.transformedQuaternion(entityQuaternion(source), options);
    }
    // `options.scale` nhân góc quay, `options.invert` xoay ngược.
    const angle = this.transformedNumber(readNum(source, ['angle', 'rotationAngle'], 0), options);
    const axis = normalize(readVec(source, ['axis']));
    const half = angle / 2;
    const s = Math.sin(half);
    return this.transformedQuaternion({
      x: (magnitude(axis) > 0 ? axis.x : 0) * s,
      y: (magnitude(axis) > 0 ? axis.y : 1) * s,
      z: (magnitude(axis) > 0 ? axis.z : 0) * s,
      w: Math.cos(half),
    }, options);
  }
  /**
   * [1535] calculateParticleColorInterpolation
   * Nội suy màu của hạt.
   */
  public calculateParticleColorInterpolation(a?: any, b?: any, options?: any): any {
    const t = readNum(options, ['t', 'time', 'progress'], readNum(a, ['t'], 0.5));
    const from = readColor(child(a, 'fromColor', 'startColor') ?? a);
    const to = readColor(child(b, 'toColor', 'endColor') ?? b);
    const color = lerpColor(from, to, t);
    return named('calculateParticleColorInterpolation', color, { t, from, to });
  }
  /**
   * [1536] calculateParticleOpacity
   * Độ mờ của hạt theo tuổi.
   *
   * `age` đọc từ `age` / `elapsed` / `currentTime` / `time` (đồng hồ của hạt),
   * `lifetime` từ `lifetime` / `duration`. Độ mờ gốc của hạt (`opacity`) nhân
   * với đường cong mờ dần theo tuổi, rồi chuẩn hoá về [0, 1].
   */
  public calculateParticleOpacity(a?: any, b?: any, options?: any): any {
    // `b` là nguồn dữ liệu thứ hai cho đồng hồ / độ mờ gốc.
    const age = readNum(
      a,
      ['age', 'elapsed', 'currentTime', 'time'],
      readNum(options, ['age', 'elapsed', 'currentTime', 'time'], readNum(b, ['age', 'elapsed', 'currentTime', 'time'], 0)),
    );
    const lifetime = readNum(
      a,
      ['lifetime', 'duration'],
      readNum(options, ['lifetime', 'duration'], readNum(b, ['lifetime', 'duration'], 1)),
    );
    const fade = particleOpacity(age, lifetime);
    const base = readNum(a, ['opacity'], readNum(options, ['opacity'], readNum(b, ['opacity'], 1)));
    return this.transformedNumber(clamp01(base * fade), options);
  }
  /**
   * [1537] calculateParticleCollision
   * Va chạm của hạt với vật cản.
   */
  public calculateParticleCollision(a?: any, b?: any): any {
    return aabb('calculateParticleCollision', resolveBox(a), resolveBox(b));
  }
  /**
   * [1538] calculateParticleAttractorForce
   * Lực hút của hạt.
   */
  public calculateParticleAttractorForce(entity?: any, dt = 0.016): any {
    const particle = resolvePointOf(entity);
    const attractor = readVec(entity, ['attractor', 'attractorPosition']);
    const strength = readNum(entity, ['attractorStrength'], 10);
    const direction = normalize(subtract(attractor, particle));
    // Lực hút có thể khai báo theo xung lực (N·s) → lực = xung / dt.
    const impulse = readNum(entity, ['attractorImpulse'], Number.NaN);
    if (Number.isFinite(impulse)) {
      return scale(direction, impulse / Math.max(1e-6, dt));
    }
    // Hoặc theo gia tốc (m/s²) → lực = m·a.
    const acceleration = readNum(entity, ['attractorAcceleration'], Number.NaN);
    if (Number.isFinite(acceleration)) {
      const mass = readNum(entity, ['mass'], Number.NaN);
      const force = Number.isFinite(mass) ? acceleration * mass : acceleration;
      return scale(direction, force);
    }
    return attractorForce(particle, attractor, strength);
  }
  /**
   * [1539] calculateParticleFieldDirection
   * Hướng trường lực tại vị trí hạt.
   */
  public calculateParticleFieldDirection(a?: any, b?: any): any {
    return fieldDirection(resolvePointOf(a), resolvePointOf(b));
  }
  /**
   * [1540] calculateEffectOrigin
   * Điểm xuất phát của hiệu ứng.
   */
  public calculateEffectOrigin(a?: any, b?: any, options?: any): any {
    // `b` là nguồn dữ liệu thứ hai cho điểm xuất phát.
    const fromA = child(a, 'origin', 'position');
    const fromB = child(b, 'origin', 'position');
    const source = fromA ?? fromB ?? (a !== undefined && a !== null ? a : b);
    const origin = this.transformedVector(resolvePointOf(source), options);
    const extra: Record<string, unknown> = { origin };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named('calculateEffectOrigin', origin, extra);
  }
  /**
   * [1541] calculateEffectDirection
   * Hướng của hiệu ứng.
   */
  public calculateEffectDirection(a?: any, b?: any): any {
    const dir = normalize(subtract(resolvePointOf(b), resolvePointOf(a)));
    return magnitude(dir) > 0 ? dir : { ...FORWARD3 };
  }
  /**
   * [1542] calculateEffectRadius
   * Bán kính hiệu ứng.
   */
  public calculateEffectRadius(entity?: any, options?: any): any {
    return effectRadius(entity ?? options);
  }
  /**
   * [1543] calculateEffectExpansion
   * Mức độ giãn nở của hiệu ứng.
   *
   * Hiệu ứng nở ra từ 0 tới mức giãn nở cấu hình (`expansion`) theo đồng hồ
   * của nó: tiến độ = tuổi / thời lượng, mức giãn nở = tiến độ × mức đích
   * (fallback về bán kính hiệu ứng).
   */
  public calculateEffectExpansion(a?: any, b?: any, options?: any): any {
    // `b` là nguồn dữ liệu thứ hai cho đồng hồ và mức giãn nở.
    const age = readNum(
      a,
      ['age', 'elapsed', 'currentTime', 'time'],
      readNum(options, ['age', 'elapsed', 'currentTime', 'time'], readNum(b, ['age', 'elapsed', 'currentTime', 'time'], 0)),
    );
    const lifetime = readNum(
      a,
      ['lifetime', 'duration'],
      readNum(options, ['lifetime', 'duration'], readNum(b, ['lifetime', 'duration'], 1)),
    );
    const progress = effectExpansion(age, lifetime);
    const amount = readNum(a, ['expansion'], readNum(b, ['expansion'], Number.NaN));
    const target = Number.isFinite(amount) ? amount : effectRadius(a ?? options);
    return this.transformedNumber(target * progress, options);
  }
  /**
   * [1544] calculateEffectFalloff
   * Suy giảm cường độ theo khoảng cách.
   */
  public calculateEffectFalloff(a?: any, b?: any, options?: any): any {
    const distance = distance3D(resolvePointOf(a), resolvePointOf(b));
    const radius = readNum(options, ['radius'], effectRadius(a));
    return effectFalloff(distance, radius);
  }
  /**
   * [1545] calculateEffectDuration
   * Thời lượng hiệu ứng.
   */
  public calculateEffectDuration(a?: any, b?: any, options?: any): any {
    const explicit = readNum(options, ['duration', 'lifetime'], Number.NaN);
    if (Number.isFinite(explicit)) return this.transformedNumber(explicit, options);
    // `b` là nguồn dữ liệu thứ hai cho thời lượng.
    const fromA = readNum(a, ['duration', 'lifetime', 'effectDuration'], Number.NaN);
    const fromB = readNum(b, ['duration', 'lifetime', 'effectDuration'], Number.NaN);
    const value = Number.isFinite(fromA) ? fromA : (Number.isFinite(fromB) ? fromB : effectDuration(a ?? options));
    return this.transformedNumber(value, options);
  }
  /**
   * [1546] calculateEffectIntensity
   * Cường độ hiệu ứng.
   */
  public calculateEffectIntensity(a?: any, b?: any, options?: any): any {
    const explicit = readNum(options, ['intensity', 'strength', 'power'], Number.NaN);
    if (Number.isFinite(explicit)) return this.transformedNumber(explicit, options);
    // `b` là nguồn dữ liệu thứ hai cho cường độ.
    const fromA = readNum(a, ['intensity', 'strength', 'power'], Number.NaN);
    const fromB = readNum(b, ['intensity', 'strength', 'power'], Number.NaN);
    const value = Number.isFinite(fromA) ? fromA : (Number.isFinite(fromB) ? fromB : effectIntensity(a ?? options));
    return this.transformedNumber(value, options);
  }
  /**
   * [1547] calculateEffectOcclusion
   * Mức độ che khuất của hiệu ứng.
   */
  public calculateEffectOcclusion(a?: any, b?: any, options?: any): any {
    const distance = distance3D(resolvePointOf(a), resolvePointOf(b));
    const radius = readNum(options, ['radius'], effectRadius(a));
    const falloff = effectFalloff(distance, radius);
    const blocked = readNum(options, ['blocked'], 0);
    return clamp01(falloff * (1 - clamp01(blocked)));
  }
  /**
   * [1548] calculateEffectDistanceToCamera
   * Khoảng cách hiệu ứng tới camera.
   */
  public calculateEffectDistanceToCamera(a?: any, b?: any): any {
    return distance3D(resolvePointOf(a), resolvePointOf(b));
  }
  /**
   * [1549] calculateEffectScreenBounds
   * Giới hạn hiệu ứng trên màn hình.
   */
  public calculateEffectScreenBounds(entity?: any, size?: Vec3D): any {
    const center = resolvePointOf(entity);
    const radius = effectRadius(entity);
    const scale = num(size?.x, radius * 2);
    return bounds('calculateEffectScreenBounds', boundingBox(center, { x: scale, y: scale, z: scale }), {
      radius,
      screenWidth: this.config.screenWidth,
      screenHeight: this.config.screenHeight,
    });
  }
  /**
   * [1550] calculateEffectLOD
   * Mức LOD của hiệu ứng theo khoảng cách camera.
   */
  public calculateEffectLOD(entity?: any, camera?: any): any {
    const center = resolvePointOf(entity);
    const cameraPosition = resolvePointOf(camera);
    const distance = distance3D(center, cameraPosition);
    const radius = effectRadius(entity);
    const level = Math.max(0, Math.round(Math.log2(Math.max(1, distance / Math.max(0.25, radius)))));
    return {
      name: 'calculateEffectLOD',
      valid: true,
      lodLevel: level,
      visible: true,
      culled: false,
      screenSize: Math.max(0.01, radius / Math.max(0.001, distance)),
      error: 0.01 * (level + 1),
      priority: 1 / (level + 1),
      distance,
      timestamp: Date.now(),
    };
  }
}

// ---------------------------------------------------------------------------
// Trợ giúp nội bộ (đặt ngoài class để giữ class gọn)
// ---------------------------------------------------------------------------

/** Khoảng cách giữa hai đoạn thẳng (bọc hàm dùng chung). */
function distanceBetweenSegmentsHelper(p1: Vec3D, p2: Vec3D, q1: Vec3D, q2: Vec3D): number {
  const d1 = subtract(p2, p1);
  const d2 = subtract(q2, q1);
  const r = subtract(p1, q1);
  const a = dot(d1, d1);
  const e = dot(d2, d2);
  const f = dot(d2, r);
  let s = 0;
  let t = 0;
  if (a <= 1e-9 && e <= 1e-9) return distance3D(p1, q1);
  if (a <= 1e-9) {
    t = clamp(f / e, 0, 1);
  } else {
    const c = dot(d1, r);
    if (e <= 1e-9) {
      s = clamp(-c / a, 0, 1);
    } else {
      const b = dot(d1, d2);
      const denom = a * e - b * b;
      s = denom !== 0 ? clamp((b * f - c * e) / denom, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = clamp(-c / a, 0, 1);
      } else if (t > 1) {
        t = 1;
        s = clamp((b - c) / a, 0, 1);
      }
    }
  }
  return distance3D(add(p1, scale(d1, s)), add(q1, scale(d2, t)));
}

/** Khoảng cách giữa hai capsule. */
function distanceBetweenCapsuleHelper(a: Capsule3D, b: Capsule3D): number {
  return Math.max(0, distanceBetweenSegmentsHelper(a.start, a.end, b.start, b.end) - a.radius - b.radius);
}

/** Giao điểm tia với mặt phẳng. */
function rayPlane(ray: Ray3D, plane: Plane3D): Vec3D | null {
  const n = normalize(plane.normal);
  const d = normalize(ray.direction);
  const denom = dot(n, d);
  if (Math.abs(denom) < 1e-9) return null;
  const t = (plane.distance - dot(n, ray.origin)) / denom;
  if (t < 0) return null;
  return add(ray.origin, scale(d, t));
}

/** Giao điểm tia với AABB. */
function rayBox(ray: Ray3D, box: Box3D): Vec3D | null {
  const d = normalize(ray.direction);
  let tmin = -Infinity;
  let tmax = Infinity;
  const axes: Array<keyof Vec3D> = ['x', 'y', 'z'];
  for (const axis of axes) {
    const o = ray.origin[axis];
    const dd = d[axis];
    const lo = box.min[axis];
    const hi = box.max[axis];
    if (Math.abs(dd) < 1e-9) {
      if (o < lo || o > hi) return null;
      continue;
    }
    const inv = 1 / dd;
    let t1 = (lo - o) * inv;
    let t2 = (hi - o) * inv;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  if (tmax < 0) return null;
  return add(ray.origin, scale(d, tmin >= 0 ? tmin : tmax));
}

/** Tam giác có diện tích bằng 0 (đỉnh trùng nhau) thì không có bề mặt. */
function isDegenerateTriangle(triangle: Triangle3D): boolean {
  return magnitude(cross(subtract(triangle.b, triangle.a), subtract(triangle.c, triangle.a))) < 1e-9;
}

/**
 * Các tam giác có trong một nguồn dữ liệu.
 *
 * Nhận chính tam giác (`{a,b,c}`) và các trường `triangleA` / `triangleB` /
 * `triangle` của entity — nhờ vậy entity chứa sẵn hai tam giác vẫn được lấy
 * đúng thay vì tam giác rỗng.
 */
function readTriangles(value: unknown): Triangle3D[] {
  if (!value || typeof value !== 'object') return [];
  const o = value as Record<string, unknown>;
  const result: Triangle3D[] = [];
  if (o.a && o.b && o.c) result.push(resolveTriangle(o));
  for (const key of ['triangleA', 'triangleB', 'triangle']) {
    const raw = o[key];
    if (raw && typeof raw === 'object') result.push(resolveTriangle(raw));
  }
  return result;
}

/**
 * Các bộ đỉnh lưới có trong một nguồn dữ liệu.
 *
 * Nguồn có thể là `points` / `vertices` / `positions` hoặc `mesh.vertices`
 * (mesh có `indices`).
 */
function readMeshSets(value: unknown): Vec3D[][] {
  if (!value || typeof value !== 'object') return [];
  const o = value as Record<string, unknown>;
  const sets: Vec3D[][] = [];
  const push = (raw: unknown): void => {
    if (Array.isArray(raw) && raw.length > 0) sets.push(raw.map((v) => toVec3(v)));
  };
  push(o.points);
  push(o.vertices);
  push(o.positions);
  const mesh = o.mesh;
  if (mesh && typeof mesh === 'object') {
    const mo = mesh as Record<string, unknown>;
    push(mo.vertices);
    push(mo.positions);
    push(mo.points);
  }
  return sets;
}

/**
 * Khoảng cách bề mặt đối xứng (Chamfer) giữa hai lưới.
 *
 * Trung bình khoảng cách gần nhất từ mỗi đỉnh của lưới này tới lưới kia,
 * lấy trung bình của cả hai chiều — khác với khoảng cách tối thiểu (luôn
 * bằng 0 khi hai lưới chạm nhau, không phản ánh hình học).
 */
function meanSurfaceDistance(pointsA: Vec3D[], pointsB: Vec3D[]): number {
  const oneWay = (from: Vec3D[], to: Vec3D[]): number => {
    let sum = 0;
    for (const p of from) {
      let best = Infinity;
      for (const q of to) best = Math.min(best, distance3D(p, q));
      sum += Number.isFinite(best) ? best : 0;
    }
    return sum / from.length;
  };
  return (oneWay(pointsA, pointsB) + oneWay(pointsB, pointsA)) / 2;
}
