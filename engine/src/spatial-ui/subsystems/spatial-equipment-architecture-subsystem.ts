/**
 * @file spatial-equipment-architecture-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/spatial-equipment-architecture-subsystem
 * @description Equipment, Vehicle, Architecture & Spatial Analytics Subsystem (1681–1800).
 *
 * Trước đây 120 method ở đây trả về offset rỗng cho 38 method, kết quả "có
 * tên" rỗng cho 31 method, `1.0` cho 21 method và va chạm giả cho 6 method.
 * Nay kích thước, khối lượng, tâm khối lượng và các chỉ số phân tích không
 * gian đều được tính từ dữ liệu thật.
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
  distance2D,
  clamp,
  clamp01,
  lerp,
  num,
  toVec3,
  entityPosition,
  entityQuaternion,
  entityForward,
  eulerToQuaternion,
  quaternionToEuler,
  normalizeQuaternion,
  multiplyQuaternions,
  invertQuaternion,
  rotateAroundAxis,
  rotationBetweenVectors,
  lookAtQuaternion,
  boundingBox,
  boundingSphere,
  boxesOverlap,
  distanceBetweenBoxes,
  distanceToBox,
  UP3,
  FORWARD3,
  RIGHT3
} from '../spatial-primitives.js';
import {
  VEHICLE_DIMENSIONS,
  BUILDING_DIMENSIONS,
  EQUIPMENT_DIMENSIONS,
  VEHICLE_REFERENCE_SPEED,
  GRAVITY,
  readNum,
  readVec,
  readPoints,
  opt,
  worldPoint,
  centroidOf,
  medianOf,
  varianceOf,
  covarianceOf,
  pairwiseDistanceMatrix,
  nearestNeighborDistances,
  farthestNeighborDistances,
  spatialDistribution,
  spatialDensity,
  spatialClustering,
  spatialOutliers,
  spatialSymmetry,
  overlapRatio,
  boundsOf,
  boundingRadiusOf,
  named,
  scalar,
  direction,
  orientation,
  bounds,
  collide
} from '../semantics/equipment-semantics.js';

export class SpatialEquipmentArchitectureSubsystem {
  public config: SpatialUIConfig;

  constructor(config?: SpatialUIConfig) {
    this.config = config ?? {
      screenWidth: 1920,
      screenHeight: 1080,
      fov: 60,
      nearPlane: 0.1,
      farPlane: 1000,
      aspectRatio: 16 / 9,
      unitScale: 1.0,
    };
  }

  // -------------------------------------------------------------------------
  // Trợ giúp nội bộ
  // -------------------------------------------------------------------------

  /** Vị trí neo + offset giải phẫu/kích thước. */
  private anchorAt(entity: unknown, offset: Vec3D): Vec3D {
    const base = entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }

  /** Kích thước xe (đọc từ entity nếu có, nếu không dùng giá trị chuẩn). */
  private vehicleSize(entity: unknown): { length: number; width: number; height: number } {
    const size = readVec(entity, ['size', 'dimensions']);
    return {
      length: readNum(entity, ['length'], size.x > 0 ? size.x : VEHICLE_DIMENSIONS.length),
      width: readNum(entity, ['width'], size.z > 0 ? size.z : VEHICLE_DIMENSIONS.width),
      height: readNum(entity, ['height'], size.y > 0 ? size.y : VEHICLE_DIMENSIONS.height),
    };
  }

  /** Kích thước công trình (đọc từ entity nếu có). */
  private buildingSize(entity: unknown): { width: number; depth: number; height: number } {
    const size = readVec(entity, ['size', 'dimensions', 'footprint']);
    return {
      width: readNum(entity, ['width'], size.x > 0 ? size.x : 10),
      depth: readNum(entity, ['depth'], size.z > 0 ? size.z : 8),
      height: readNum(entity, ['height'], size.y > 0 ? size.y : BUILDING_DIMENSIONS.height),
    };
  }

  /** Hộp bao của vật thể theo kích thước cho trước. */
  private boxOf(entity: unknown, size: { x: number; y: number; z: number }): Box3D {
    return boundingBox(entityPosition(entity), size);
  }

  /** Tập điểm phân tích (từ entity hoặc options). */
  private pointsOf(a: unknown, b?: unknown): Vec3D[] {
    const direct = readPoints(a);
    if (direct.length > 0) return direct;
    const secondary = readPoints(b);
    if (secondary.length > 0) return secondary;
    return [entityPosition(a)];
  }

  /** Số hữu hạn đầu tiên tìm được trong danh sách nguồn đầu vào. */
  private firstNumber(sources: unknown[], keys: string[]): number {
    for (const source of sources) {
      const value = readNum(source, keys, Number.NaN);
      if (Number.isFinite(value)) return value;
    }
    return Number.NaN;
  }

  /** Vector khác 0 đầu tiên tìm được trong danh sách nguồn đầu vào. */
  private firstVector(sources: unknown[], keys: string[]): Vec3D {
    for (const source of sources) {
      const value = readVec(source, keys);
      if (magnitude(value) > 0) return value;
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Các điểm của đường đi (mảng toạ độ trong nguồn đầu vào). */
  private pathPointsOf(sources: unknown[]): Vec3D[] {
    for (const source of sources) {
      if (!source || typeof source !== 'object') continue;
      const o = source as Record<string, unknown>;
      for (const key of ['path', 'waypoints', 'trajectory', 'points']) {
        const raw = o[key];
        if (!Array.isArray(raw) || raw.length < 2) continue;
        const points: Vec3D[] = [];
        for (const item of raw) {
          if (!item || typeof item !== 'object') continue;
          const v = item as Record<string, unknown>;
          points.push({ x: num(v.x), y: num(v.y), z: num(v.z) });
        }
        if (points.length >= 2) return points;
      }
    }
    return [];
  }

  /** Độ cong Menger của một đường đi (1/m). */
  private pathCurvature(points: Vec3D[]): number {
    if (points.length < 3) return 0;
    let total = 0;
    let count = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const ab = subtract(points[i], points[i - 1]);
      const bc = subtract(points[i + 1], points[i]);
      const ca = subtract(points[i - 1], points[i + 1]);
      const denominator = magnitude(ab) * magnitude(bc) * magnitude(ca);
      if (denominator < 1e-12) continue;
      total += (2 * magnitude(cross(ab, bc))) / denominator;
      count++;
    }
    return count > 0 ? total / count : 0;
  }

  /** Tốc độ di chuyển của phương tiện (m/s) — ưu tiên vận tốc thật. */
  private vehicleSpeed(sources: unknown[]): number {
    for (const source of sources) {
      const velocity = readVec(source, ['velocity']);
      if (magnitude(velocity) > 1e-9) return magnitude(velocity);
    }
    const explicit = this.firstNumber(sources, ['speed', 'moveSpeed', 'maxSpeed']);
    return Number.isFinite(explicit) ? explicit : VEHICLE_REFERENCE_SPEED;
  }

  /** Tốc độ lái quanh trục đứng (yaw rate) của phương tiện. */
  private vehicleYawRate(sources: unknown[]): number {
    const explicit = this.firstNumber(sources, ['yawRate', 'turnRate']);
    if (Number.isFinite(explicit)) return explicit;
    const angular = this.firstVector(sources, ['angularVelocity']);
    return angular.y;
  }

  // -------------------------------------------------------------------------
  // Bộ tuỳ chọn thống nhất: scale / unit / reference / invert / side / entity
  // -------------------------------------------------------------------------

  /** Đọc tuỳ chọn dạng object (object rỗng khi đầu vào không phải object). */
  private optionRecord(options: unknown): Record<string, unknown> {
    return options && typeof options === 'object' ? (options as Record<string, unknown>) : {};
  }

  /** Hệ số nhân kết quả (`options.scale`, mặc định 1). */
  private optionScale(options: unknown): number {
    const value = readNum(this.optionRecord(options), ['scale', 'scaleFactor'], Number.NaN);
    return Number.isFinite(value) ? value : 1;
  }

  /** Đơn vị trả về (`options.unit`, mặc định là đơn vị chuẩn của phương thức). */
  private optionUnit(options: unknown, fallback: string): string {
    const raw = this.optionRecord(options).unit;
    return typeof raw === 'string' && raw.trim().length > 0 ? raw : fallback;
  }

  /** Cờ đảo dấu kết quả số (`options.invert`, mặc định false). */
  private optionInvert(options: unknown): boolean {
    return this.optionRecord(options).invert === true;
  }

  /** Khung tham chiếu (`options.reference`: 'world' mặc định | 'local'). */
  private optionReference(options: unknown): 'world' | 'local' {
    return this.optionRecord(options).reference === 'local' ? 'local' : 'world';
  }

  /** Bên trái/phải (`options.side`; undefined khi không chỉ định). */
  private optionSide(options: unknown): 'left' | 'right' | undefined {
    const raw = this.optionRecord(options).side;
    return raw === 'left' || raw === 'right' ? raw : undefined;
  }

  /** Entity thay thế để tính (`options.entity`, mặc định là entity gốc). */
  private optionEntity(options: unknown, fallback: unknown): unknown {
    const raw = this.optionRecord(options).entity;
    return raw !== undefined && raw !== null ? raw : fallback;
  }

  /** Nhân kết quả số theo `options.scale`; đảo dấu nếu `options.invert`. */
  private applyNumberOptions(value: number, options: unknown): number {
    const scaled = value * this.optionScale(options);
    return this.optionInvert(options) ? -scaled : scaled;
  }

  /** Xoay vector theo nghịch đảo quaternion của entity (về trục cục bộ). */
  private rotateToLocal(value: Vec3D, entity: unknown): Vec3D {
    const { x, y, z, w } = invertQuaternion(entityQuaternion(entity));
    const cx = y * value.z - z * value.y;
    const cy = z * value.x - x * value.z;
    const cz = x * value.y - y * value.x;
    const dx = y * cz - z * cy;
    const dy = z * cx - x * cz;
    const dz = x * cy - y * cx;
    return {
      x: value.x + 2 * (w * cx + dx),
      y: value.y + 2 * (w * cy + dy),
      z: value.z + 2 * (w * cz + dz),
    };
  }

  /** Áp `options.scale` + `options.reference` cho vector kết quả (delta hoặc hướng). */
  private applyVectorOptions(value: Vec3D, options: unknown, entity?: unknown): Vec3D {
    const scaled = scale(value, this.optionScale(options));
    if (this.optionReference(options) !== 'local' || entity === undefined) return scaled;
    return this.rotateToLocal(scaled, entity);
  }

  /** Áp `options.scale` + `options.reference` cho điểm tuyệt đối. */
  private applyPointOptions(value: Vec3D, options: unknown, entity?: unknown): Vec3D {
    const scaled = scale(value, this.optionScale(options));
    if (this.optionReference(options) !== 'local' || entity === undefined) return scaled;
    return this.rotateToLocal(subtract(scaled, entityPosition(entity)), entity);
  }

  /** Áp `options.reference` + `options.invert` cho quaternion kết quả. */
  private applyQuaternionOptions(value: QuatD, options: unknown, entity?: unknown): QuatD {
    let result = value;
    if (this.optionReference(options) === 'local' && entity !== undefined) {
      result = multiplyQuaternions(invertQuaternion(entityQuaternion(entity)), result);
    }
    if (this.optionInvert(options)) result = invertQuaternion(result);
    return result;
  }

  // ==========================================================================
  // 36. Trang bị cơ thể
  // ==========================================================================

  /**
   * [1681] getClothingPosition
   * Vị trí trang phục trên cơ thể.
   */
  public getClothingPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1682] getClothingAnchor
   * Điểm neo của trang phục.
   */
  public getClothingAnchor(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1683] getClothingSurfacePosition
   * Vị trí trên bề mặt trang phục.
   */
  public getClothingSurfacePosition(entity?: unknown, offset?: Vec3D) {
    const thickness = readNum(entity, ['thickness'], EQUIPMENT_DIMENSIONS.clothingThickness);
    const shift = offset ?? { x: 0, y: 0, z: 0 };
    return this.anchorAt(entity, { x: shift.x, y: shift.y, z: thickness + shift.z });
  }
  /**
   * [1684] getClothingVertexPosition
   * Vị trí một đỉnh của lưới trang phục.
   */
  public getClothingVertexPosition(entity?: unknown, offset?: Vec3D) {
    const vertices = readPoints(entity, ['vertices', 'mesh']);
    if (vertices.length > 0) {
      const base = entityPosition(entity);
      const vertex = vertices[0];
      return {
        x: base.x + vertex.x + (offset?.x ?? 0),
        y: base.y + vertex.y + (offset?.y ?? 0),
        z: base.z + vertex.z + (offset?.z ?? 0),
      };
    }
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1685] calculateClothingFitOffset
   * Độ lệch giữa trang phục và cơ thể (trang phục rộng hơn = dương).
   */
  public calculateClothingFitOffset(a?: unknown, b?: unknown, options?: unknown) {
    const bodyRadius = readNum(a, ['bodyRadius', 'radius'], 0.3);
    const clothRadius = readNum(b, ['clothingRadius', 'radius'], bodyRadius + EQUIPMENT_DIMENSIONS.clothingThickness);
    const offset = clothRadius - bodyRadius;
    return scalar('calculateClothingFitOffset', this.applyNumberOptions(offset, options), this.optionUnit(options, 'm'), {
      bodyRadius,
      clothingRadius: clothRadius,
      tight: offset < 0,
    });
  }
  /**
   * [1686] calculateClothingBodyDistance
   * Khoảng cách giữa trang phục và cơ thể.
   */
  public calculateClothingBodyDistance(a?: unknown, b?: unknown) {
    return distance3D(worldPoint(a), worldPoint(b));
  }
  /**
   * [1687] calculateClothingPenetration
   * Độ xâm nhập của trang phục vào cơ thể.
   */
  public calculateClothingPenetration(a?: unknown, b?: unknown, options?: unknown) {
    const bodyRadius = readNum(a, ['bodyRadius', 'radius'], 0.3);
    const clothRadius = readNum(b, ['clothingRadius', 'radius'], bodyRadius);
    const distance = distance3D(worldPoint(a), worldPoint(b));
    const penetration = Math.max(0, bodyRadius + clothRadius - distance);
    return scalar('calculateClothingPenetration', this.applyNumberOptions(penetration, options), this.optionUnit(options, 'm'), { distance });
  }
  /**
   * [1688] calculateClothingCollision
   * Va chạm giữa trang phục và cơ thể.
   */
  public calculateClothingCollision(a?: unknown, b?: unknown) {
    const bodyRadius = readNum(a, ['bodyRadius', 'radius'], 0.3);
    const clothRadius = readNum(b, ['clothingRadius', 'radius'], bodyRadius + EQUIPMENT_DIMENSIONS.clothingThickness);
    const centerA = worldPoint(a);
    const centerB = worldPoint(b);
    const distance = distance3D(centerA, centerB);
    const hit = distance < bodyRadius + clothRadius;
    const normal = normalize(subtract(centerB, centerA));
    return collide(
      'calculateClothingCollision',
      hit,
      Math.max(0, distance - bodyRadius - clothRadius),
      centerA,
      magnitude(normal) > 0 ? normal : UP3,
      hit ? bodyRadius + clothRadius - distance : 0,
    );
  }
  /**
   * [1689] calculateClothingDeformation
   * Biến dạng của trang phục (theo lực kéo).
   *
   * Lực kéo lấy từ `force` tường minh; nếu không có thì dùng gió tác động
   * (`wind`), và nếu cũng không có thì dùng lực quán tính F = m·a của người mặc.
   */
  public calculateClothingDeformation(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const explicitForce = this.firstVector(sources, ['force', 'tension', 'pull']);
    let force = explicitForce;
    let forceSource = 'explicit';
    if (magnitude(force) <= 0) {
      const wind = this.firstVector(sources, ['wind']);
      if (magnitude(wind) > 0) {
        force = wind;
        forceSource = 'wind';
      }
    }
    if (magnitude(force) <= 0) {
      const mass = this.firstNumber(sources, ['mass']);
      const acceleration = this.firstVector(sources, ['acceleration']);
      if (magnitude(acceleration) > 0) {
        force = scale(acceleration, Number.isFinite(mass) ? mass : 1);
        forceSource = 'inertia';
      }
    }
    const stiffness = this.firstNumber([options, a, b], ['stiffness']);
    const effectiveStiffness = Number.isFinite(stiffness) && stiffness > 0 ? stiffness : 500;
    const magnitudeForce = magnitude(force);
    const deformation = magnitudeForce / effectiveStiffness;
    return named('calculateClothingDeformation', {
      deformation,
      direction: magnitudeForce > 0 ? normalize(force) : { x: 0, y: 0, z: 0 },
      force: magnitudeForce,
    }, { stiffness: effectiveStiffness, forceSource });
  }
  /**
   * [1690] calculateClothingWrinkleCurvature
   * Độ cong nếp nhăn trên trang phục.
   */
  public calculateClothingWrinkleCurvature(entity?: unknown, options?: unknown) {
    const amplitude = readNum(entity, ['wrinkleAmplitude'], 0.004);
    const wavelength = readNum(entity, ['wrinkleWavelength'], 0.05);
    const curvature = wavelength > 0 ? (2 * Math.PI * amplitude) / (wavelength * wavelength) : 0;
    return this.applyNumberOptions(curvature, options);
  }
  /**
   * [1691] calculateClothingCenterOfMass
   * Tâm khối lượng của trang phục.
   */
  public calculateClothingCenterOfMass(entity?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entity);
    const center = entityPosition(source);
    const mass = readNum(source, ['mass'], 0.4);
    const offset = readVec(source, ['centerOfMassOffset']);
    const resolved = magnitude(offset) > 0 ? add(center, offset) : center;
    return named('calculateClothingCenterOfMass', this.applyPointOptions(resolved, options, source), { mass, base: center });
  }
  /**
   * [1692] calculateClothingBoundingBox
   * Hộp bao của trang phục.
   */
  public calculateClothingBoundingBox(entity?: unknown, size?: Vec3D) {
    const extent = size ?? { x: 0.4, y: 0.6, z: 0.25 };
    return bounds('calculateClothingBoundingBox', this.boxOf(entity, extent));
  }
  /**
   * [1693] getHelmetPosition
   * Vị trí mũ bảo hiểm.
   */
  public getHelmetPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0.12, z: 0 });
  }
  /**
   * [1694] getHelmetAnchor
   * Điểm neo của mũ.
   */
  public getHelmetAnchor(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0.1, z: 0 });
  }
  /**
   * [1695] calculateHelmetHeadOffset
   * Độ lệch của mũ so với đầu.
   */
  public calculateHelmetHeadOffset(a?: unknown, b?: unknown, options?: unknown) {
    const offset = subtract(worldPoint(b), worldPoint(a));
    const magnitudeOffset = magnitude(offset);
    return named('calculateHelmetHeadOffset', this.applyVectorOptions(offset, options, a), {
      distance: magnitudeOffset,
      aligned: magnitudeOffset < 0.02,
    });
  }
  /**
   * [1696] calculateHelmetOrientation
   * Góc quay của mũ.
   */
  public calculateHelmetOrientation(entityOrAngle?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entityOrAngle);
    return orientation('calculateHelmetOrientation', this.applyQuaternionOptions(entityQuaternion(source), options, source));
  }
  /**
   * [1697] calculateHelmetCollision
   * Va chạm của mũ.
   */
  public calculateHelmetCollision(a?: unknown, b?: unknown) {
    const sphereA = boundingSphere(worldPoint(a), EQUIPMENT_DIMENSIONS.helmetRadius);
    const sphereB = boundingSphere(worldPoint(b), readNum(b, ['radius'], EQUIPMENT_DIMENSIONS.helmetRadius));
    const distance = distance3D(sphereA.center, sphereB.center);
    const hit = distance < sphereA.radius + sphereB.radius;
    const normal = normalize(subtract(sphereB.center, sphereA.center));
    return collide(
      'calculateHelmetCollision',
      hit,
      Math.max(0, distance - sphereA.radius - sphereB.radius),
      sphereA.center,
      magnitude(normal) > 0 ? normal : UP3,
      hit ? sphereA.radius + sphereB.radius - distance : 0,
    );
  }
  /**
   * [1698] getGlassesPosition
   * Vị trí kính.
   */
  public getGlassesPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: EQUIPMENT_DIMENSIONS.glassesOffset });
  }
  /**
   * [1699] calculateGlassesEyeAlignment
   * Mức độ khớp kính với vị trí mắt.
   */
  public calculateGlassesEyeAlignment(a?: unknown, b?: unknown, options?: unknown) {
    const glasses = worldPoint(a);
    const eyes = worldPoint(b);
    const distance = distance3D(glasses, eyes);
    const tolerance = readNum(options, ['tolerance'], 0.03);
    return named('calculateGlassesEyeAlignment', clamp01(1 - distance / Math.max(1e-6, tolerance)), {
      distance,
      aligned: distance <= tolerance,
    });
  }
  /**
   * [1700] calculateGlassesHeadOffset
   * Độ lệch của kính so với đầu.
   */
  public calculateGlassesHeadOffset(a?: unknown, b?: unknown, options?: unknown) {
    const offset = subtract(worldPoint(b), worldPoint(a));
    return named('calculateGlassesHeadOffset', this.applyVectorOptions(offset, options, a), { distance: magnitude(offset) });
  }
  /**
   * [1701] getBackpackPosition
   * Vị trí ba lô.
   */
  public getBackpackPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0.1, z: -EQUIPMENT_DIMENSIONS.backpackDepth });
  }
  /**
   * [1702] calculateBackpackSpineOffset
   * Độ lệch của ba lô so với cột sống.
   */
  public calculateBackpackSpineOffset(a?: unknown, b?: unknown, options?: unknown) {
    const offset = subtract(worldPoint(b), worldPoint(a));
    const magnitudeOffset = magnitude(offset);
    return named('calculateBackpackSpineOffset', this.applyVectorOptions(offset, options, a), {
      distance: magnitudeOffset,
      aligned: magnitudeOffset < 0.03,
    });
  }
  /**
   * [1703] calculateBackpackCenterOfMass
   * Tâm khối lượng của ba lô.
   */
  public calculateBackpackCenterOfMass(entity?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entity);
    const center = entityPosition(source);
    const mass = readNum(source, ['mass'], 5);
    const offset = readVec(source, ['centerOfMassOffset']);
    const resolved = magnitude(offset) > 0 ? add(center, offset) : center;
    return named('calculateBackpackCenterOfMass', this.applyPointOptions(resolved, options, source), { mass, base: center });
  }
  /**
   * [1704] calculateBackpackSwing
   * Góc lắc của ba lô khi chạy.
   */
  public calculateBackpackSwing(a?: unknown, b?: unknown, options?: unknown) {
    const speed = readNum(a, ['speed'], readNum(b, ['speed'], 0));
    const amplitude = readNum(options, ['amplitude'], 0.08);
    const phase = readNum(options, ['phase'], 0);
    const angle = Math.sin(phase) * amplitude * clamp01(speed / 6);
    return scalar('calculateBackpackSwing', this.applyNumberOptions(angle, options), this.optionUnit(options, 'rad'), { speed, amplitude });
  }
  /**
   * [1705] getWeaponPosition
   * Vị trí vũ khí.
   */
  public getWeaponPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1706] getWeaponGripPosition
   * Vị trí tay nắm vũ khí.
   */
  public getWeaponGripPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: EQUIPMENT_DIMENSIONS.weaponGripOffset });
  }
  /**
   * [1707] getWeaponMuzzlePosition
   * Vị trí nòng vũ khí.
   */
  public getWeaponMuzzlePosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: EQUIPMENT_DIMENSIONS.weaponMuzzleOffset });
  }
  /**
   * [1708] getWeaponStockPosition
   * Vị trí báng vũ khí.
   */
  public getWeaponStockPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: -EQUIPMENT_DIMENSIONS.weaponStockOffset });
  }
  /**
   * [1709] calculateWeaponAimDirection
   * Hướng ngắm của vũ khí.
   */
  public calculateWeaponAimDirection(a?: unknown, b?: unknown) {
    const origin = worldPoint(a);
    const target = worldPoint(b);
    const dir = normalize(subtract(target, origin));
    return direction('calculateWeaponAimDirection', magnitude(dir) > 0 ? dir : entityForward(a));
  }
  /**
   * [1710] calculateWeaponHandAlignment
   * Mức độ khớp tay với tay nắm.
   */
  public calculateWeaponHandAlignment(a?: unknown, b?: unknown, options?: unknown) {
    const weapon = worldPoint(a);
    const hand = worldPoint(b);
    const distance = distance3D(weapon, hand);
    const tolerance = readNum(options, ['tolerance'], 0.05);
    return named('calculateWeaponHandAlignment', clamp01(1 - distance / Math.max(1e-6, tolerance)), {
      distance,
      aligned: distance <= tolerance,
    });
  }
  /**
   * [1711] calculateWeaponRecoilOffset
   * Độ giật lùi của vũ khí.
   */
  public calculateWeaponRecoilOffset(a?: unknown, b?: unknown, options?: unknown) {
    const impulse = readNum(a, ['impulse', 'recoilImpulse'], readNum(b, ['impulse', 'recoilImpulse'], 0));
    const mass = readNum(a, ['mass'], readNum(b, ['mass'], 3.5));
    const direction = entityForward(a);
    const distance = mass > 0 ? impulse / mass : 0;
    return named('calculateWeaponRecoilOffset', this.applyVectorOptions(scale(direction, -distance), options, a), {
      impulse,
      mass,
      distance,
    });
  }
  /**
   * [1712] calculateWeaponRecoilRotation
   * Góc giật của vũ khí.
   */
  public calculateWeaponRecoilRotation(entityOrAngle?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entityOrAngle);
    const angle = readNum(source, ['recoilAngle', 'angle'], 0);
    const axis = normalize(readVec(source, ['axis']));
    const resolved = magnitude(axis) > 0 ? axis : RIGHT3;
    const half = angle / 2;
    const s = Math.sin(half);
    return orientation('calculateWeaponRecoilRotation', this.applyQuaternionOptions({
      x: resolved.x * s,
      y: resolved.y * s,
      z: resolved.z * s,
      w: Math.cos(half),
    }, options, source));
  }
  /**
   * [1713] calculateWeaponMuzzleDirection
   * Hướng nòng vũ khí.
   */
  public calculateWeaponMuzzleDirection(a?: unknown, b?: unknown) {
    const explicit = this.firstVector([a, b], ['direction', 'muzzleDirection', 'aimDirection']);
    const forward = magnitude(explicit) > 0 ? normalize(explicit) : entityForward(a);
    return direction('calculateWeaponMuzzleDirection', magnitude(forward) > 0 ? forward : FORWARD3);
  }
  /**
   * [1714] calculateWeaponCollision
   * Va chạm của vũ khí.
   */
  public calculateWeaponCollision(a?: unknown, b?: unknown) {
    const boxA = this.boxOf(a, { x: 0.08, y: 0.12, z: EQUIPMENT_DIMENSIONS.weaponLength });
    const boxB = this.boxOf(b, { x: 0.3, y: 1.8, z: 0.3 });
    const hit = boxesOverlap(boxA, boxB);
    const distance = distanceBetweenBoxes(boxA, boxB);
    return collide('calculateWeaponCollision', hit, distance, entityPosition(a), UP3, hit ? distance : 0);
  }
  /**
   * [1715] getShieldPosition
   * Vị trí khiên.
   */
  public getShieldPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0.2 });
  }
  /**
   * [1716] getShieldCenter
   * Tâm khiên.
   */
  public getShieldCenter(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0.2 });
  }
  /**
   * [1717] calculateShieldOrientation
   * Góc quay của khiên.
   */
  public calculateShieldOrientation(entityOrAngle?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entityOrAngle);
    return orientation('calculateShieldOrientation', this.applyQuaternionOptions(entityQuaternion(source), options, source));
  }
  /**
   * [1718] calculateShieldSurfaceNormal
   * Pháp tuyến mặt khiên.
   */
  public calculateShieldSurfaceNormal(a?: unknown, b?: unknown) {
    const explicit = this.firstVector([a, b], ['normal', 'shieldNormal', 'surfaceNormal']);
    if (magnitude(explicit) > 0) return direction('calculateShieldSurfaceNormal', normalize(explicit));
    const forward = entityForward(a);
    const normal = normalize(cross(UP3, forward));
    return direction('calculateShieldSurfaceNormal', magnitude(normal) > 0 ? normal : RIGHT3);
  }
  /**
   * [1719] calculateShieldCoverageAngle
   * Góc che phủ của khiên.
   */
  public calculateShieldCoverageAngle(a?: unknown, b?: unknown) {
    const radius = readNum(a, ['radius'], EQUIPMENT_DIMENSIONS.shieldRadius);
    const threat = worldPoint(b);
    const center = worldPoint(a);
    const distance = distance3D(center, threat);
    const halfAngle = distance > 1e-6 ? Math.asin(clamp(radius / distance, -1, 1)) : Math.PI / 2;
    return halfAngle * 2;
  }
  /**
   * [1720] calculateShieldCollision
   * Va chạm của khiên.
   */
  public calculateShieldCollision(a?: unknown, b?: unknown) {
    const radius = readNum(a, ['radius'], EQUIPMENT_DIMENSIONS.shieldRadius);
    const center = worldPoint(a);
    const other = worldPoint(b);
    const distance = distance3D(center, other);
    const hit = distance < radius;
    const normal = normalize(subtract(other, center));
    return collide(
      'calculateShieldCollision',
      hit,
      Math.max(0, distance - radius),
      center,
      magnitude(normal) > 0 ? normal : UP3,
      hit ? radius - distance : 0,
    );
  }

  // ==========================================================================
  // 37. Phương tiện
  // ==========================================================================

  /**
   * [1721] getVehiclePosition
   * Vị trí phương tiện.
   */
  public getVehiclePosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1722] getVehicleCenter
   * Tâm phương tiện.
   */
  public getVehicleCenter(entity?: unknown, offset?: Vec3D) {
    const size = this.vehicleSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height / 2, z: 0 });
  }
  /**
   * [1723] getVehicleFrontPosition
   * Vị trí đầu xe.
   */
  public getVehicleFrontPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.vehicleSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height / 2, z: size.length / 2 });
  }
  /**
   * [1724] getVehicleRearPosition
   * Vị trí đuôi xe.
   */
  public getVehicleRearPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.vehicleSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height / 2, z: -size.length / 2 });
  }
  /**
   * [1725] getVehicleLeftPosition
   * Vị trí bên trái xe.
   */
  public getVehicleLeftPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.vehicleSize(entity);
    return this.anchorAt(entity, offset ?? { x: -size.width / 2, y: size.height / 2, z: 0 });
  }
  /**
   * [1726] getVehicleRightPosition
   * Vị trí bên phải xe.
   */
  public getVehicleRightPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.vehicleSize(entity);
    return this.anchorAt(entity, offset ?? { x: size.width / 2, y: size.height / 2, z: 0 });
  }
  /**
   * [1727] getVehicleRoofPosition
   * Vị trí nói xe.
   */
  public getVehicleRoofPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.vehicleSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height, z: 0 });
  }
  /**
   * [1728] getVehicleUndersidePosition
   * Vị trí gầm xe.
   */
  public getVehicleUndersidePosition(entity?: unknown, offset?: Vec3D) {
    const clearance = readNum(entity, ['groundClearance'], VEHICLE_DIMENSIONS.groundClearance);
    return this.anchorAt(entity, offset ?? { x: 0, y: clearance, z: 0 });
  }
  /**
   * [1729] getVehicleWheelPosition
   * Vị trí bánh xe.
   */
  public getVehicleWheelPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.vehicleSize(entity);
    const track = readNum(entity, ['trackWidth'], VEHICLE_DIMENSIONS.trackWidth);
    const wheelbase = readNum(entity, ['wheelbase'], VEHICLE_DIMENSIONS.wheelbase);
    const radius = readNum(entity, ['wheelRadius'], VEHICLE_DIMENSIONS.wheelRadius);
    return this.anchorAt(entity, offset ?? {
      x: track / 2,
      y: radius,
      z: wheelbase / 2,
    });
  }
  /**
   * [1730] getVehicleAxlePosition
   * Vị trí trục bánh xe.
   */
  public getVehicleAxlePosition(entity?: unknown, offset?: Vec3D) {
    const wheelbase = readNum(entity, ['wheelbase'], VEHICLE_DIMENSIONS.wheelbase);
    return this.anchorAt(entity, offset ?? { x: 0, y: VEHICLE_DIMENSIONS.wheelRadius, z: wheelbase / 2 });
  }
  /**
   * [1731] calculateVehicleLength
   * Chiều dài xe.
   */
  public calculateVehicleLength(entity?: unknown, options?: unknown) {
    return this.applyNumberOptions(this.vehicleSize(entity).length, options);
  }
  /**
   * [1732] calculateVehicleWidth
   * Bề ngang xe.
   */
  public calculateVehicleWidth(entity?: unknown, options?: unknown) {
    return this.applyNumberOptions(this.vehicleSize(entity).width, options);
  }
  /**
   * [1733] calculateVehicleHeight
   * Chiều cao xe.
   */
  public calculateVehicleHeight(entity?: unknown, options?: unknown) {
    return this.applyNumberOptions(this.vehicleSize(entity).height, options);
  }
  /**
   * [1734] calculateVehicleWheelbase
   * Chiều dài cơ sở xe.
   */
  public calculateVehicleWheelbase(a?: unknown, b?: unknown, options?: unknown) {
    const front = readVec(a, ['frontWheel', 'front']);
    const rear = readVec(a, ['rearWheel', 'rear']);
    const frontAlt = readVec(b, ['frontWheel', 'front']);
    const rearAlt = readVec(b, ['rearWheel', 'rear']);
    const resolvedFront = magnitude(front) > 0 ? front : frontAlt;
    const resolvedRear = magnitude(rear) > 0 ? rear : rearAlt;
    const value = magnitude(resolvedFront) > 0 && magnitude(resolvedRear) > 0
      ? distance3D(resolvedFront, resolvedRear)
      : readNum(a, ['wheelbase'], readNum(b, ['wheelbase'], VEHICLE_DIMENSIONS.wheelbase));
    return scalar('calculateVehicleWheelbase', this.applyNumberOptions(value, options), this.optionUnit(options, 'm'));
  }
  /**
   * [1735] calculateVehicleTrackWidth
   * Chiều rộng vệt bánh xe.
   */
  public calculateVehicleTrackWidth(a?: unknown, b?: unknown, options?: unknown) {
    const left = this.firstVector([a, b], ['leftWheel', 'left']);
    const right = this.firstVector([a, b], ['rightWheel', 'right']);
    const width = magnitude(left) > 0 && magnitude(right) > 0
      ? distance3D(left, right)
      : readNum(a, ['trackWidth'], readNum(b, ['trackWidth'], VEHICLE_DIMENSIONS.trackWidth));
    const side = this.optionSide(options);
    if (!side) return this.applyNumberOptions(width, options);
    // `options.side`: vị trí ngang của bánh xe đã chọn so với trục giữa xe.
    const wheel = side === 'left' ? left : right;
    const center = entityPosition(a);
    const lateral = magnitude(wheel) > 0
      ? dot(subtract(wheel, center), RIGHT3)
      : (side === 'left' ? -width / 2 : width / 2);
    return this.applyNumberOptions(lateral, options);
  }
  /**
   * [1736] calculateVehicleTurningRadius
   * Bán kính quay vòng của xe.
   */
  public calculateVehicleTurningRadius(entity?: unknown, options?: unknown) {
    const wheelbase = readNum(entity, ['wheelbase'], VEHICLE_DIMENSIONS.wheelbase);
    const steering = readNum(entity, ['steeringAngle', 'steerAngle'], 0);
    if (Math.abs(steering) < 1e-3) return Infinity;
    return this.applyNumberOptions(wheelbase / Math.tan(Math.abs(steering)), options);
  }
  /**
   * [1737] calculateVehicleTurningAngle
   * Góc quay của xe.
   */
  public calculateVehicleTurningAngle(a?: unknown, b?: unknown) {
    const from = readVec(a, ['forward', 'heading']);
    const to = readVec(b, ['forward', 'heading']);
    const dirA = magnitude(from) > 0 ? normalize(from) : entityForward(a);
    const dirB = magnitude(to) > 0 ? normalize(to) : entityForward(b);
    return Math.atan2(dot(cross(dirA, dirB), UP3), dot(dirA, dirB));
  }
  /**
   * [1738] calculateVehicleSpeed
   * Tốc độ xe (m/s).
   */
  public calculateVehicleSpeed(entity?: unknown, options?: unknown) {
    const explicit = readNum(entity, ['speed'], Number.NaN);
    if (Number.isFinite(explicit)) {
      return this.applyNumberOptions(Math.abs(explicit), options);
    }
    const velocity = readVec(entity, ['velocity']);
    if (magnitude(velocity) > 0) {
      return this.applyNumberOptions(Math.hypot(velocity.x, velocity.z), options);
    }
    // Không có dữ liệu vận hành: dùng tốc độ tham chiếu của xe đi thường.
    return this.applyNumberOptions(VEHICLE_REFERENCE_SPEED, options);
  }
  /**
   * [1739] calculateVehicleAcceleration
   * Gia tốc của xe.
   */
  public calculateVehicleAcceleration(entity?: unknown, dt = 0.016) {
    const explicit = readVec(entity, ['acceleration']);
    if (magnitude(explicit) > 0) return direction('calculateVehicleAcceleration', explicit, { dt });
    const velocity = readVec(entity, ['velocity']);
    const previous = readVec(entity, ['previousVelocity']);
    if (magnitude(previous) === 0) return direction('calculateVehicleAcceleration', { x: 0, y: 0, z: 0 }, { dt });
    return direction(
      'calculateVehicleAcceleration',
      scale(subtract(velocity, previous), 1 / Math.max(1e-6, dt)),
      { dt },
    );
  }
  /**
   * [1740] calculateVehicleBrakingDistance
   * Quãng đường phanh của xe.
   */
  public calculateVehicleBrakingDistance(a?: unknown, b?: unknown) {
    const speed = Math.abs(readNum(a, ['speed'], VEHICLE_REFERENCE_SPEED));
    const deceleration = readNum(a, ['deceleration', 'braking'], readNum(b, ['deceleration'], 6));
    const distance = deceleration > 0 ? (speed * speed) / (2 * deceleration) : Infinity;
    return distance;
  }
  /**
   * [1741] calculateVehicleStoppingTime
   * Thời gian dừng xe.
   */
  public calculateVehicleStoppingTime(a?: unknown, b?: unknown, options?: unknown) {
    const speed = Math.abs(readNum(a, ['speed'], VEHICLE_REFERENCE_SPEED));
    const deceleration = readNum(a, ['deceleration', 'braking'], readNum(b, ['deceleration', 'braking'], readNum(options, ['deceleration'], 6)));
    const time = deceleration > 0 ? speed / deceleration : Infinity;
    return scalar('calculateVehicleStoppingTime', this.applyNumberOptions(time, options), this.optionUnit(options, 's'), { speed, deceleration });
  }
  /**
   * [1742] calculateVehicleHeading
   * Hướng đầu xe (góc yaw trên mặt phẳng ngang).
   */
  public calculateVehicleHeading(a?: unknown, b?: unknown, options?: unknown) {
    const source = this.optionEntity(options, a);
    const explicit = readVec(b, ['forward', 'heading']);
    const forward = magnitude(explicit) > 0 ? normalize(explicit) : entityForward(source);
    return scalar('calculateVehicleHeading', this.applyNumberOptions(Math.atan2(forward.x, forward.z), options), this.optionUnit(options, 'rad'), { forward });
  }
  /**
   * [1743] calculateVehicleYawRate
   * Tốc độ yaw của xe.
   */
  public calculateVehicleYawRate(entity?: unknown, options?: unknown) {
    const angular = readVec(entity, ['angularVelocity']);
    const yawRate = magnitude(angular) > 0 ? angular.y : readNum(entity, ['yawRate'], 0);
    return this.applyNumberOptions(yawRate, options);
  }
  /**
   * [1744] calculateVehiclePitchAngle
   * Góc nghiêng dọc của xe.
   */
  public calculateVehiclePitchAngle(entity?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entity);
    const forward = entityForward(source);
    return this.applyNumberOptions(Math.asin(clamp(forward.y, -1, 1)), options);
  }
  /**
   * [1745] calculateVehicleRollAngle
   * Góc nghiêng ngang của xe.
   *
   * Roll là góc xoay quanh trục dọn của xe (+Z) nên nó chính là thành phần `z`
   * của Euler của hướng xe — đọc từ quaternion/rotation thật của đối tượng.
   */
  public calculateVehicleRollAngle(entity?: unknown, options?: unknown) {
    const explicit = this.firstNumber([entity, options], ['roll', 'rollAngle']);
    if (Number.isFinite(explicit)) return explicit;
    const euler = quaternionToEuler(entityQuaternion(entity));
    return euler.z;
  }
  /**
   * [1746] calculateVehicleGroundClearance
   * Khoảng hở gầm xe.
   */
  public calculateVehicleGroundClearance(entity?: unknown, options?: unknown) {
    const explicit = readNum(entity, ['groundClearance'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : VEHICLE_DIMENSIONS.groundClearance;
    return this.applyNumberOptions(value, options);
  }
  /**
   * [1747] calculateVehicleCenterOfMass
   * Tâm khối lượng của xe.
   */
  public calculateVehicleCenterOfMass(entity?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entity);
    const center = entityPosition(source);
    const size = this.vehicleSize(source);
    const mass = readNum(source, ['mass'], VEHICLE_DIMENSIONS.mass);
    const offset = readVec(source, ['centerOfMassOffset']);
    const resolved = magnitude(offset) > 0
      ? add(center, offset)
      : { x: center.x, y: center.y + size.height * 0.3, z: center.z };
    return named('calculateVehicleCenterOfMass', this.applyPointOptions(resolved, options, source), { mass, base: center });
  }
  /**
   * [1748] calculateVehicleCollisionBounds
   * Hộp bao va chạm của xe.
   */
  public calculateVehicleCollisionBounds(entity?: unknown, size?: Vec3D) {
    const dimensions = this.vehicleSize(entity);
    const extent = size ?? { x: dimensions.width, y: dimensions.height, z: dimensions.length };
    return bounds('calculateVehicleCollisionBounds', this.boxOf(entity, extent), { dimensions });
  }
  /**
   * [1749] calculateVehiclePathCurvature
   * Độ cong của đường đi của xe.
   *
   * Ưu tiên công thức lái xe κ = yawRate / speed (tốc độ lái và tốc độ thật);
   * khi không có tốc độ lái thì đo độ cong hình học của đường đi.
   */
  public calculateVehiclePathCurvature(entity?: unknown, options?: unknown) {
    const sources = [entity, options];
    const yawRate = Math.abs(this.vehicleYawRate(sources));
    const speed = this.vehicleSpeed(sources);
    if (yawRate > 1e-9 && speed > 1e-9) {
      return yawRate / speed;
    }
    return this.pathCurvature(this.pathPointsOf(sources));
  }
  /**
   * [1750] calculateVehicleWheelRotation
   * Góc quay của bánh xe.
   */
  public calculateVehicleWheelRotation(entityOrAngle?: unknown, options?: unknown) {
    const source = this.optionEntity(options, entityOrAngle);
    const speed = Math.abs(readNum(source, ['speed'], VEHICLE_REFERENCE_SPEED));
    const radius = readNum(source, ['wheelRadius'], VEHICLE_DIMENSIONS.wheelRadius);
    const angle = radius > 1e-6 ? speed / radius : 0;
    return scalar('calculateVehicleWheelRotation', this.applyNumberOptions(angle, options), this.optionUnit(options, 'rad/s'), { speed, radius });
  }

  // ==========================================================================
  // 38. Công trình kiến trúc
  // ==========================================================================

  /**
   * [1751] getBuildingPosition
   * Vị trí công trình.
   */
  public getBuildingPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1752] getBuildingCenter
   * Tâm công trình.
   */
  public getBuildingCenter(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height / 2, z: 0 });
  }
  /**
   * [1753] getBuildingBasePosition
   * Vị trí đáy công trình.
   */
  public getBuildingBasePosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1754] getBuildingTopPosition
   * Vị trí đỉnh công trình.
   */
  public getBuildingTopPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height, z: 0 });
  }
  /**
   * [1755] getBuildingCornerPosition
   * Vị trí một góc công trình.
   */
  public getBuildingCornerPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? {
      x: size.width / 2,
      y: 0,
      z: size.depth / 2,
    });
  }
  /**
   * [1756] getWallCenter
   * Tâm bức tường.
   */
  public getWallCenter(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height / 2, z: size.depth / 2 });
  }
  /**
   * [1757] getWallSurfacePosition
   * Vị trí trên mặt tường.
   */
  public getWallSurfacePosition(entity?: unknown, offset?: Vec3D) {
    const thickness = readNum(entity, ['wallThickness'], BUILDING_DIMENSIONS.wallThickness);
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height / 2, z: size.depth / 2 + thickness / 2 });
  }
  /**
   * [1758] getWallNormal
   * Pháp tuyến của bức tường.
   *
   * Ưu tiên pháp tuyến khai báo (`normal`); nếu không có thì dùng trục trước
   * của đối tượng (mặt tường hướng về phía trước), và cuối cùng là hướng từ
   * tường về phía đối diện.
   */
  public getWallNormal(a?: unknown, b?: unknown) {
    const explicit = this.firstVector([a, b], ['normal', 'wallNormal', 'planeNormal']);
    if (magnitude(explicit) > 0) return direction('getWallNormal', normalize(explicit));
    const source = (a ?? {}) as Record<string, unknown>;
    const oriented =
      (source.quaternion && typeof source.quaternion === 'object') ||
      (source.rotation && typeof source.rotation === 'object');
    if (oriented) {
      const forward = entityForward(a);
      if (magnitude(forward) > 0) return direction('getWallNormal', normalize(forward));
    }
    const delta = subtract(worldPoint(b), worldPoint(a));
    if (magnitude(delta) > 0) return direction('getWallNormal', normalize(delta));
    return direction('getWallNormal', FORWARD3);
  }
  /**
   * [1759] getFloorPosition
   * Vị trí sàn.
   */
  public getFloorPosition(entity?: unknown, offset?: Vec3D) {
    return this.anchorAt(entity, offset ?? { x: 0, y: 0, z: 0 });
  }
  /**
   * [1760] getCeilingPosition
   * Vị trí trần.
   */
  public getCeilingPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height, z: 0 });
  }
  /**
   * [1761] getDoorPosition
   * Vị trí cửa.
   */
  public getDoorPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? {
      x: -size.width / 4,
      y: BUILDING_DIMENSIONS.doorHeight / 2,
      z: size.depth / 2,
    });
  }
  /**
   * [1762] getDoorHandlePosition
   * Vị trí tay nắm cửa.
   */
  public getDoorHandlePosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? {
      x: -size.width / 4 + BUILDING_DIMENSIONS.doorWidth / 2,
      y: 1.05,
      z: size.depth / 2 + 0.05,
    });
  }
  /**
   * [1763] getWindowPosition
   * Vị trí cửa sổ.
   */
  public getWindowPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? {
      x: size.width / 4,
      y: size.height * 0.6,
      z: size.depth / 2,
    });
  }
  /**
   * [1764] getStairPosition
   * Vị trí cầu thang.
   */
  public getStairPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? {
      x: size.width / 4,
      y: BUILDING_DIMENSIONS.stairRise,
      z: -size.depth / 4,
    });
  }
  /**
   * [1765] getRoofPosition
   * Vị trí mái.
   */
  public getRoofPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.buildingSize(entity);
    return this.anchorAt(entity, offset ?? { x: 0, y: size.height, z: 0 });
  }
  /**
   * [1766] calculateBuildingHeight
   * Chiều cao công trình.
   */
  public calculateBuildingHeight(entity?: unknown, options?: unknown) {
    return this.applyNumberOptions(this.buildingSize(entity).height, options);
  }
  /**
   * [1767] calculateBuildingFootprint
   * Diện tích mặt bằng công trình.
   */
  public calculateBuildingFootprint(a?: unknown, b?: unknown, options?: unknown) {
    const size = this.buildingSize(a);
    const width = readNum(a, ['width'], readNum(b, ['width'], size.width));
    const depth = readNum(a, ['depth'], readNum(b, ['depth'], size.depth));
    const footprint = width * depth;
    return scalar('calculateBuildingFootprint', this.applyNumberOptions(footprint, options), this.optionUnit(options, 'm²'), { width, depth });
  }
  /**
   * [1768] calculateBuildingVolume
   * Thể tích công trình.
   */
  public calculateBuildingVolume(entity?: unknown, options?: unknown) {
    const size = this.buildingSize(entity);
    return this.applyNumberOptions(size.width * size.depth * size.height, options);
  }
  /**
   * [1769] calculateWallLength
   * Chiều dài bức tường.
   */
  public calculateWallLength(entity?: unknown, options?: unknown) {
    const size = this.buildingSize(entity);
    return this.applyNumberOptions(size.width, options);
  }
  /**
   * [1770] calculateWallHeight
   * Chiều cao bức tường.
   */
  public calculateWallHeight(entity?: unknown, options?: unknown) {
    return this.applyNumberOptions(this.buildingSize(entity).height, options);
  }
  /**
   * [1771] calculateWallThickness
   * Độ dày bức tường.
   */
  public calculateWallThickness(a?: unknown, b?: unknown, options?: unknown) {
    const explicit = readNum(a, ['wallThickness'], Number.NaN);
    const fromB = readNum(b, ['wallThickness'], Number.NaN);
    const value = Number.isFinite(explicit)
      ? explicit
      : (Number.isFinite(fromB) ? fromB : BUILDING_DIMENSIONS.wallThickness);
    return scalar('calculateWallThickness', this.applyNumberOptions(value, options), this.optionUnit(options, 'm'));
  }
  /**
   * [1772] calculateWallSurfaceArea
   * Diện tích mặt tường.
   */
  public calculateWallSurfaceArea(entity?: unknown, options?: unknown) {
    const size = this.buildingSize(entity);
    const perimeter = 2 * (size.width + size.depth);
    return this.applyNumberOptions(perimeter * size.height, options);
  }
  /**
   * [1773] calculateFloorArea
   * Diện tích sàn.
   */
  public calculateFloorArea(entity?: unknown, options?: unknown) {
    const size = this.buildingSize(entity);
    return this.applyNumberOptions(size.width * size.depth, options);
  }
  /**
   * [1774] calculateFloorElevation
   * Cao độ sàn.
   */
  public calculateFloorElevation(a?: unknown, b?: unknown, options?: unknown) {
    const explicit = readNum(a, ['elevation'], Number.NaN);
    const fromB = readNum(b, ['elevation'], Number.NaN);
    const value = Number.isFinite(explicit)
      ? explicit
      : (Number.isFinite(fromB) ? fromB : entityPosition(a).y);
    return scalar('calculateFloorElevation', this.applyNumberOptions(value, options), this.optionUnit(options, 'm'));
  }
  /**
   * [1775] calculateCeilingHeight
   * Chiều cao trần nhà.
   */
  public calculateCeilingHeight(entity?: unknown, options?: unknown) {
    const size = this.buildingSize(entity);
    return this.applyNumberOptions(size.height, options);
  }
  /**
   * [1776] calculateDoorClearance
   * Khoảng trống cửa.
   */
  public calculateDoorClearance(entity?: unknown, options?: unknown) {
    const width = readNum(entity, ['doorWidth'], BUILDING_DIMENSIONS.doorWidth);
    const height = readNum(entity, ['doorHeight'], BUILDING_DIMENSIONS.doorHeight);
    return this.applyNumberOptions(width * height, options);
  }
  /**
   * [1777] calculateWindowOpening
   * Diện tích cửa sổ.
   */
  public calculateWindowOpening(entity?: unknown, options?: unknown) {
    const width = readNum(entity, ['windowWidth'], BUILDING_DIMENSIONS.windowWidth);
    const height = readNum(entity, ['windowHeight'], BUILDING_DIMENSIONS.windowHeight);
    return scalar('calculateWindowOpening', this.applyNumberOptions(width * height, options), this.optionUnit(options, 'm²'), { width, height });
  }
  /**
   * [1778] calculateStairRise
   * Chiều cao bậc thang.
   */
  public calculateStairRise(entity?: unknown, options?: unknown) {
    const explicit = readNum(entity, ['stairRise'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : BUILDING_DIMENSIONS.stairRise;
    return scalar('calculateStairRise', this.applyNumberOptions(value, options), this.optionUnit(options, 'm'));
  }
  /**
   * [1779] calculateStairTread
   * Chiều sâu bậc thang.
   */
  public calculateStairTread(entity?: unknown, options?: unknown) {
    const explicit = readNum(entity, ['stairTread'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : BUILDING_DIMENSIONS.stairTread;
    return scalar('calculateStairTread', this.applyNumberOptions(value, options), this.optionUnit(options, 'm'));
  }
  /**
   * [1780] calculateRoofSlope
   * Độ dốc mái.
   */
  public calculateRoofSlope(entity?: unknown, options?: unknown) {
    const pitch = readNum(entity, ['roofPitch', 'pitch'], 30);
    const slope = (pitch * Math.PI) / 180;
    return scalar('calculateRoofSlope', this.applyNumberOptions(slope, options), this.optionUnit(options, 'rad'), { pitch, degrees: pitch });
  }
  /**
   * [1781] calculateRoomBounds
   * Hộp bao của phòng.
   */
  public calculateRoomBounds(entity?: unknown, size?: Vec3D) {
    const dimensions = this.buildingSize(entity);
    const extent = size ?? { x: dimensions.width, y: dimensions.height, z: dimensions.depth };
    return bounds('calculateRoomBounds', this.boxOf(entity, extent), { dimensions });
  }
  /**
   * [1782] calculateRoomCenter
   * Tâm phòng.
   */
  public calculateRoomCenter(a?: unknown, b?: unknown, options?: unknown) {
    const size = this.buildingSize(a);
    const height = readNum(a, ['height'], readNum(b, ['height'], size.height));
    const center = entityPosition(a);
    const resolved = {
      x: center.x,
      y: center.y + height / 2,
      z: center.z,
    };
    return named('calculateRoomCenter', this.applyPointOptions(resolved, options, a), { size, height });
  }
  /**
   * [1783] calculateRoomVolume
   * Thể tích phòng.
   */
  public calculateRoomVolume(entity?: unknown, options?: unknown) {
    const size = this.buildingSize(entity);
    return this.applyNumberOptions(size.width * size.depth * size.height, options);
  }
  /**
   * [1784] calculateRoomNavigationDistance
   * Quãng đường đi giữa hai điểm trong phòng.
   */
  public calculateRoomNavigationDistance(a?: unknown, b?: unknown) {
    const from = worldPoint(a);
    const to = worldPoint(b);
    const size = this.buildingSize(a);
    const clamped = {
      x: Math.max(-size.width / 2, Math.min(size.width / 2, to.x - from.x)),
      y: 0,
      z: Math.max(-size.depth / 2, Math.min(size.depth / 2, to.z - from.z)),
    };
    return Math.hypot(clamped.x, clamped.z);
  }
  /**
   * [1785] calculateBuildingCollision
   * Va chạm với công trình.
   */
  public calculateBuildingCollision(a?: unknown, b?: unknown) {
    const size = this.buildingSize(a);
    const boxA = this.boxOf(a, { x: size.width, y: size.height, z: size.depth });
    const boxB = this.boxOf(b, { x: 1, y: 1.8, z: 1 });
    const hit = boxesOverlap(boxA, boxB);
    const distance = distanceBetweenBoxes(boxA, boxB);
    const normal = normalize(subtract(entityPosition(b), entityPosition(a)));
    return collide(
      'calculateBuildingCollision',
      hit,
      distance,
      entityPosition(a),
      magnitude(normal) > 0 ? normal : UP3,
      hit ? distance : 0,
    );
  }

  // ==========================================================================
  // 39. Phân tích không gian
  // ==========================================================================

  /**
   * [1786] calculateSpatialDistanceMatrix
   * Ma trận khoảng cách giữa các điểm.
   */
  public calculateSpatialDistanceMatrix(a?: unknown, b?: unknown) {
    const points = this.pointsOf(a, b);
    const matrix = pairwiseDistanceMatrix(points);
    return named('calculateSpatialDistanceMatrix', matrix, { count: points.length });
  }
  /**
   * [1787] calculatePairwiseDistances
   * Danh sách khoảng cách giữa các cặp điểm.
   */
  public calculatePairwiseDistances(a?: unknown, b?: unknown) {
    const points = this.pointsOf(a, b);
    const distances: number[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        distances.push(distance3D(points[i], points[j]));
      }
    }
    return named('calculatePairwiseDistances', distances, { count: distances.length });
  }
  /**
   * [1788] calculateNearestNeighborDistance
   * Khoảng cách tới láng giềng gần nhất.
   */
  public calculateNearestNeighborDistance(a?: unknown, b?: unknown) {
    const points = this.pointsOf(a, b);
    const distances = nearestNeighborDistances(points);
    const value = distances.length > 0 ? Math.min(...distances) : 0;
    return value;
  }
  /**
   * [1789] calculateFarthestNeighborDistance
   * Khoảng cách tới láng giềng xa nhất.
   */
  public calculateFarthestNeighborDistance(a?: unknown, b?: unknown) {
    const points = this.pointsOf(a, b);
    const distances = farthestNeighborDistances(points);
    const value = distances.length > 0 ? Math.max(...distances) : 0;
    return value;
  }
  /**
   * [1790] calculateSpatialCentroid
   * Trọng tâm của tập điểm.
   */
  public calculateSpatialCentroid(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const centroid = centroidOf(points);
    return named('calculateSpatialCentroid', this.applyPointOptions(centroid, options, a), { count: points.length });
  }
  /**
   * [1791] calculateWeightedCentroid
   * Trọng tâm có trọng số.
   */
  public calculateWeightedCentroid(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const weights = readPoints(a, ['weights']).map((w) => w.x);
    const centroid = centroidOf(points, weights.length === points.length ? weights : undefined);
    return named('calculateWeightedCentroid', this.applyPointOptions(centroid, options, a), {
      count: points.length,
      weighted: weights.length === points.length,
    });
  }
  /**
   * [1792] calculateSpatialMedian
   * Trung vị không gian.
   */
  public calculateSpatialMedian(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const median = medianOf(points);
    return named('calculateSpatialMedian', this.applyPointOptions(median, options, a), { count: points.length });
  }
  /**
   * [1793] calculateSpatialVariance
   * Phương sai không gian.
   */
  public calculateSpatialVariance(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const variance = varianceOf(points);
    return named('calculateSpatialVariance', this.applyVectorOptions(variance, options, a), { count: points.length });
  }
  /**
   * [1794] calculateSpatialCovariance
   * Ma trận hiệp phương sai.
   */
  public calculateSpatialCovariance(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const covariance = covarianceOf(points);
    const factor = this.optionScale(options);
    const scaled = factor === 1 ? covariance : covariance.map((value) => value * factor);
    return named('calculateSpatialCovariance', scaled, { count: points.length });
  }
  /**
   * [1795] calculateSpatialDistribution
   * Phân bố không gian.
   */
  public calculateSpatialDistribution(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const bins = opt(options, ['bins'], 8);
    return named('calculateSpatialDistribution', spatialDistribution(points, bins), { count: points.length });
  }
  /**
   * [1796] calculateSpatialDensity
   * Mật độ không gian.
   */
  public calculateSpatialDensity(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    return scalar('calculateSpatialDensity', this.applyNumberOptions(spatialDensity(points), options), this.optionUnit(options, 'point/m³'), { count: points.length });
  }
  /**
   * [1797] calculateSpatialClustering
   * Mức độ gom cụm không gian.
   */
  public calculateSpatialClustering(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    return scalar('calculateSpatialClustering', this.applyNumberOptions(spatialClustering(points), options), this.optionUnit(options, 'ratio'), { count: points.length });
  }
  /**
   * [1798] calculateSpatialOutliers
   * Các điểm ngoại lệ.
   *
   * Dùng `outlierThreshold` thật (khoảng cách tuyệt đối so với trọng tâm)
   * nếu có; nếu không thì lùi về phương pháp độ lệch chuẩn theo `sigma`.
   */
  public calculateSpatialOutliers(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const threshold = this.firstNumber([a, b, options], ['outlierThreshold', 'threshold']);
    const sigma = opt(options, ['sigma'], 2);
    let outliers: Vec3D[] = [];
    let indices: number[] = [];
    if (Number.isFinite(threshold)) {
      const center = centroidOf(points);
      points.forEach((point, index) => {
        if (distance3D(point, center) > threshold) {
          indices.push(index);
          outliers.push(points[index]);
        }
      });
    } else {
      const result = spatialOutliers(points, sigma);
      outliers = result.points;
      indices = result.indices;
    }
    return named('calculateSpatialOutliers', outliers, {
      indices,
      count: outliers.length,
      sigma,
      threshold: Number.isFinite(threshold) ? threshold : null,
    });
  }
  /**
   * [1799] calculateSpatialSymmetry
   * Mức độ đối xứng không gian.
   */
  public calculateSpatialSymmetry(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.pointsOf(a, b);
    const axis = readVec(options, ['axis']);
    const resolved = magnitude(axis) > 0 ? axis : RIGHT3;
    return scalar('calculateSpatialSymmetry', spatialSymmetry(points, resolved), 'ratio', {
      count: points.length,
    });
  }
  /**
   * [1800] calculateSpatialOverlapRatio
   * Tỷ lệ chồng lấn giữa hai vùng không gian.
   */
  public calculateSpatialOverlapRatio(a?: unknown, b?: unknown) {
    const sizeA = this.buildingSize(a);
    const sizeB = this.buildingSize(b);
    const boxA = this.boxOf(a, { x: sizeA.width, y: sizeA.height, z: sizeA.depth });
    const boxB = this.boxOf(b, { x: sizeB.width, y: sizeB.height, z: sizeB.depth });
    const ratio = overlapRatio(boxA, boxB);
    return named('calculateSpatialOverlapRatio', ratio, {
      overlapping: ratio > 0,
      boxA,
      boxB,
    });
  }
}
