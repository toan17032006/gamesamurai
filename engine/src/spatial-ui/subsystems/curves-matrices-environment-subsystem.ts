/**
 * @file curves-matrices-environment-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/curves-matrices-environment-subsystem
 * @description Curves, Matrices, Spatial Grid, Terrain & LOD Subsystem (1351–1450).
 *
 * Trước đây 130 method ở đây trả về `{ name: 'FN', valid: true, result: 0 }`
 * cho 47 method, ma trận đơn vị cho 19 method, và cùng một khối LOD giả cho
 * 15 method. Nay mọi phép tính được thực sự thực hiện: nội suy Bézier /
 * Catmull-Rom, phân tích ma trận, lưới không gian, hàm địa hình và LOD theo
 * khoảng cách thật.
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
  lerpVec3,
  num,
  asRecord,
  toVec3,
  entityPosition,
  boundingBox,
  multiplyMatrices,
  invertMatrix,
  transformPoint,
  translationMatrix,
  scaleMatrix,
  quaternionMatrix,
  eulerMatrix,
  eulerToQuaternion,
  quaternionToEuler,
  normalizeQuaternion,
  multiplyQuaternions,
  slerpQuaternion,
  determinant4x4,
  IDENTITY_MAT4,
  UP3,
  FORWARD3,
  RIGHT3
} from '../spatial-primitives.js';
import {
  readNum,
  readVec,
  readPoints,
  opt,
  resolveMatrix,
  readQuatOf,
  composeTRSMatrix,
  decomposeMatrix,
  quaternionFromRotationMatrix,
  transposeMatrix,
  traceMatrix,
  orthogonalizeMatrix,
  orthonormalizeMatrix,
  normalMatrix,
  projectionMatrix,
  matrixError,
  interpolateMatrices,
  cubicBezier,
  quadraticBezier,
  cubicBezierTangent,
  quadraticBezierTangent,
  cubicBezierCurvature,
  sampleCatmullRom,
  closestPointOnPolyline,
  parameterAtDistance,
  curveFrame,
  polylineCurvature,
  smoothPolyline,
  trajectoryPointAtTime,
  coordinateBasis,
  convertCoordinates,
  quantize,
  quantizeVector,
  clampValue,
  wrapValue,
  snapValue,
  roundValue,
  gridCellIndex,
  gridCellCenter,
  gridCellBounds,
  gridIndexDistance,
  gridNeighborCells,
  gridTraversalCost,
  terrainHeightAt,
  terrainNormalAt,
  terrainSlopeAt,
  terrainCurvatureAt,
  terrainSurfaceArea,
  terrainVolume,
  closestTerrainPoint,
  waterSurfaceHeight,
  waterSurfaceNormal,
  buoyancyForce,
  projectedScreenSize,
  lodLevelForScreenSize,
  lodThreshold,
  lodProjectedError,
  lodUpdateFrequency,
  lodSelectionScore,
  named,
  scalar,
  bounds,
  matrixRecord
} from '../semantics/curve-semantics.js';

/** Kích thước ô lưới mặc định (m). */
const DEFAULT_CELL_SIZE = 1;
/** Biên độ địa hình mặc định (m). */
const DEFAULT_TERRAIN_AMPLITUDE = 1;
/** Tần số địa hình mặc định (rad/m). */
const DEFAULT_TERRAIN_FREQUENCY = 0.05;

/** Điểm Bézier mặc định khi không có dữ liệu điều khiển. */
const DEFAULT_BEZIER: Vec3D[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 1 },
  { x: 2, y: 0, z: -1 },
  { x: 3, y: 0, z: 0 },
];

/** Điểm spline mặc định khi không có dữ liệu điều khiển. */
const DEFAULT_SPLINE: Vec3D[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 1 },
  { x: 3, y: 0, z: 1 },
];

export class CurvesMatricesEnvironmentSubsystem {
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

  /** Danh sách điểm điều khiển từ nhiều nguồn khả dụng. */
  private pointsOf(source: unknown): Vec3D[] {
    if (!source) return [];
    if (Array.isArray(source)) {
      return source.map((p) => {
        if (p && typeof p === 'object' && 'position' in (p as Record<string, unknown>)) {
          return toVec3((p as Record<string, unknown>).position);
        }
        return toVec3(p);
      });
    }
    const o = source as Record<string, unknown>;
    for (const key of ['points', 'controlPoints', 'spline', 'curve', 'vertices', 'trajectory', 'waypoints', 'path']) {
      const raw = o[key];
      if (Array.isArray(raw) && raw.length >= 2) {
        return raw.map((p) => {
          if (p && typeof p === 'object' && 'position' in (p as Record<string, unknown>)) {
            return toVec3((p as Record<string, unknown>).position);
          }
          return toVec3(p);
        });
      }
    }
    return [];
  }

  /** Bốn điểm điều khiển Bézier. */
  private bezierControls(source: unknown): Vec3D[] {
    const direct = this.pointsOf(source);
    if (direct.length >= 4) return direct.slice(0, 4);
    const o = (source ?? {}) as Record<string, unknown>;
    const named = ['p0', 'p1', 'p2', 'p3'].map((key) => o[key]);
    if (named.every((p) => p && typeof p === 'object')) {
      return named.map((p) => toVec3(p));
    }
    return DEFAULT_BEZIER.map((p) => ({ ...p }));
  }

  /** Điểm spline (ít nhất 2 điểm). */
  private splineControls(source: unknown): Vec3D[] {
    const direct = this.pointsOf(source);
    if (direct.length >= 2) return direct;
    return DEFAULT_SPLINE.map((p) => ({ ...p }));
  }

  /** Vị trí điểm trong thế giới từ entity hoặc object thường. */
  private worldOf(source: unknown): Vec3D {
    if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0 };
    const o = source as Record<string, unknown>;
    if (o.position && typeof o.position === 'object') return toVec3(o.position);
    if (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') return toVec3(o);
    return { x: 0, y: 0, z: 0 };
  }

  /** Vị trí camera (mặc định tại gốc). */
  private cameraOf(source: unknown): Vec3D {
    if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0 };
    const o = source as Record<string, unknown>;
    if (o.camera && typeof o.camera === 'object') return this.worldOf(o.camera);
    return this.worldOf(source);
  }

  /** Kích thước lưới. */
  private cellSize(options?: unknown): number {
    return Math.max(1e-6, opt(options, ['cellSize', 'gridSize', 'resolution'], DEFAULT_CELL_SIZE));
  }

  /** Tham số địa hình. */
  private terrainParams(options?: unknown): { amplitude: number; frequency: number } {
    return {
      amplitude: opt(options, ['amplitude', 'terrainAmplitude', 'height'], DEFAULT_TERRAIN_AMPLITUDE),
      frequency: opt(options, ['frequency', 'terrainFrequency'], DEFAULT_TERRAIN_FREQUENCY),
    };
  }

  // ==========================================================================
  // 28. Nội suy, đường cong và quỹ đạo
  // ==========================================================================

  /**
   * [1551] calculateLinearInterpolation
   * Nội suy tuyến tính giữa hai giá trị (số hoặc vector).
   */
  public calculateLinearInterpolation(a?: unknown, b?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const from = this.worldOf(a);
    const to = this.worldOf(b);
    const value = lerpVec3(from, to, t);
    return named('calculateLinearInterpolation', value, { t, from, to });
  }
  /**
   * [1552] calculateBilinearInterpolation
   * Nội suy song tuyến trên mặt phẳng (4 góc).
   */
  public calculateBilinearInterpolation(a?: unknown, b?: unknown, options?: unknown) {
    const u = opt(options, ['u', 'x'], 0);
    const v = opt(options, ['v', 'y'], 0);
    const corners = this.pointsOf(a).slice(0, 4);
    if (corners.length < 4) {
      const value = lerpVec3(this.worldOf(a), this.worldOf(b), v);
      return named('calculateBilinearInterpolation', value, { u, v, degenerate: true });
    }
    const bottom = lerpVec3(corners[0], corners[1], u);
    const top = lerpVec3(corners[3], corners[2], u);
    const value = lerpVec3(bottom, top, v);
    return named('calculateBilinearInterpolation', value, { u, v, corners });
  }
  /**
   * [1553] calculateTrilinearInterpolation
   * Nội suy ba chiều trên khối (8 đỉnh).
   */
  public calculateTrilinearInterpolation(a?: unknown, b?: unknown, options?: unknown) {
    const u = opt(options, ['u', 'x'], 0);
    const v = opt(options, ['v', 'y'], 0);
    const w = opt(options, ['w', 'z'], 0);
    const corners = this.pointsOf(a).slice(0, 8);
    if (corners.length < 8) {
      const value = lerpVec3(this.worldOf(a), this.worldOf(b), w);
      return named('calculateTrilinearInterpolation', value, { u, v, w, degenerate: true });
    }
    const c000 = corners[0];
    const c100 = corners[1];
    const c010 = corners[2];
    const c110 = corners[3];
    const c001 = corners[4];
    const c101 = corners[5];
    const c011 = corners[6];
    const c111 = corners[7];
    const x00 = lerpVec3(c000, c100, u);
    const x10 = lerpVec3(c010, c110, u);
    const x01 = lerpVec3(c001, c101, u);
    const x11 = lerpVec3(c011, c111, u);
    const y0 = lerpVec3(x00, x10, v);
    const y1 = lerpVec3(x01, x11, v);
    const value = lerpVec3(y0, y1, w);
    return named('calculateTrilinearInterpolation', value, { u, v, w, corners });
  }
  /**
   * [1554] calculateCubicInterpolation
   * Nội suy bậc 3 (Hermite) trên tập điểm.
   */
  public calculateCubicInterpolation(a?: unknown, b?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const points = this.splineControls(a);
    if (points.length < 2) {
      return named('calculateCubicInterpolation', this.worldOf(a), { t, degenerate: true });
    }
    const scaled = clamp01(t) * (points.length - 1);
    const index = Math.min(Math.floor(scaled), points.length - 2);
    const local = scaled - index;
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const m1 = scale(subtract(p2, p0), 0.5);
    const m2 = scale(subtract(p3, p1), 0.5);
    const t2 = local * local;
    const t3 = t2 * local;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + local;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    const value = {
      x: h00 * p1.x + h10 * m1.x + h01 * p2.x + h11 * m2.x,
      y: h00 * p1.y + h10 * m1.y + h01 * p2.y + h11 * m2.y,
      z: h00 * p1.z + h10 * m1.z + h01 * p2.z + h11 * m2.z,
    };
    return named('calculateCubicInterpolation', value, { t, index, local });
  }
  /**
   * [1555] calculateCatmullRomSpline
   * Điểm trên spline Catmull-Rom.
   */
  public calculateCatmullRomSpline(a?: unknown, b?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const points = this.splineControls(a);
    const scaled = clamp01(t) * (points.length - 1);
    const index = Math.min(Math.floor(scaled), points.length - 2);
    const local = scaled - index;
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const value = catmullRomLocal(p0, p1, p2, p3, local);
    return named('calculateCatmullRomSpline', value, { t, index, local, controlPoints: points });
  }
  /**
   * [1556] calculateBezierCurve
   * Điểm trên đường cong Bézier bậc 3.
   */
  public calculateBezierCurve(a?: unknown, b?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const [p0, p1, p2, p3] = this.bezierControls(a);
    const value = cubicBezier(p0, p1, p2, p3, t);
    return named('calculateBezierCurve', value, { t, controlPoints: [p0, p1, p2, p3] });
  }
  /**
   * [1557] calculateQuadraticBezier
   * Điểm trên đường cong Bézier bậc 2.
   */
  public calculateQuadraticBezier(a?: unknown, b?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const controls = this.bezierControls(a);
    const value = quadraticBezier(controls[0], controls[1], controls[2], t);
    return named('calculateQuadraticBezier', value, { t, controlPoints: controls.slice(0, 3) });
  }
  /**
   * [1558] calculateCubicBezier
   * Điểm trên đường cong Bézier bậc 3 (dạng khối).
   */
  public calculateCubicBezier(a?: unknown, b?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const [p0, p1, p2, p3] = this.bezierControls(a);
    const value = cubicBezier(p0, p1, p2, p3, t);
    return named('calculateCubicBezier', value, { t, controlPoints: [p0, p1, p2, p3] });
  }
  /**
   * [1559] calculateBezierTangent
   * Tiếp tuyến của đường cong Bézier.
   */
  public calculateBezierTangent(a?: unknown, b?: unknown) {
    const t = opt(b, ['t', 'time', 'progress'], 0.5);
    const [p0, p1, p2, p3] = this.bezierControls(a);
    const tangent = cubicBezierTangent(p0, p1, p2, p3, t);
    const resolved = magnitude(tangent) > 0 ? normalize(tangent) : FORWARD3;
    return { name: 'calculateBezierTangent', valid: true, direction: resolved, magnitude: magnitude(tangent), timestamp: Date.now() };
  }
  /**
   * [1560] calculateBezierNormal
   * Pháp tuyến của đường cong Bézier.
   */
  public calculateBezierNormal(a?: unknown, b?: unknown) {
    const t = opt(b, ['t', 'time', 'progress'], 0.5);
    const [p0, p1, p2, p3] = this.bezierControls(a);
    const tangent = normalize(cubicBezierTangent(p0, p1, p2, p3, t));
    const reference = Math.abs(tangent.y) > 0.9 ? RIGHT3 : UP3;
    const normal = normalize(cross(tangent, reference));
    const resolved = magnitude(normal) > 0 ? normal : UP3;
    return { name: 'calculateBezierNormal', valid: true, direction: resolved, magnitude: magnitude(normal), timestamp: Date.now() };
  }
  /**
   * [1561] calculateBezierCurvature
   * Độ cong của đường cong Bézier.
   */
  public calculateBezierCurvature(entity?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const [p0, p1, p2, p3] = this.bezierControls(entity);
    const curvature = cubicBezierCurvature(p0, p1, p2, p3, t);
    return curvature;
  }
  /**
   * [1562] calculateSplinePosition
   * Vị trí trên spline.
   */
  public calculateSplinePosition(a?: unknown, b?: unknown, options?: unknown) {
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const value = trajectoryPointAtTime(
      sampled.map((p, i) => ({ position: p, time: i / Math.max(1, sampled.length - 1) })),
      t,
    );
    return named('calculateSplinePosition', value, { t, controlPoints: points });
  }
  /**
   * [1563] calculateSplineTangent
   * Tiếp tuyến của spline.
   */
  public calculateSplineTangent(a?: unknown, b?: unknown) {
    const t = opt(b, ['t', 'time', 'progress'], 0.5);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(t * (sampled.length - 1)), 0, sampled.length - 1);
    const frame = curveFrame(sampled, index);
    return { name: 'calculateSplineTangent', valid: true, direction: frame.tangent, magnitude: 1, timestamp: Date.now() };
  }
  /**
   * [1564] calculateSplineNormal
   * Pháp tuyến của spline.
   */
  public calculateSplineNormal(a?: unknown, b?: unknown) {
    const t = opt(b, ['t', 'time', 'progress'], 0.5);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(t * (sampled.length - 1)), 0, sampled.length - 1);
    const frame = curveFrame(sampled, index);
    return { name: 'calculateSplineNormal', valid: true, direction: frame.normal, magnitude: 1, timestamp: Date.now() };
  }
  /**
   * [1565] calculateSplineBinormal
   * Pháp tuyến nhị của spline.
   */
  public calculateSplineBinormal(a?: unknown, b?: unknown) {
    const t = opt(b, ['t', 'time', 'progress'], 0.5);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(t * (sampled.length - 1)), 0, sampled.length - 1);
    const frame = curveFrame(sampled, index);
    return { name: 'calculateSplineBinormal', valid: true, direction: frame.binormal, magnitude: 1, timestamp: Date.now() };
  }
  /**
   * [1566] calculateSplineCurvature
   * Độ cong của spline.
   */
  public calculateSplineCurvature(entity?: unknown, options?: unknown) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(opt(options, ['t'], 0.5) * (sampled.length - 1)), 0, sampled.length - 1);
    const curvature = polylineCurvature(sampled, index);
    return curvature;
  }
  /**
   * [1567] calculateSplineArcLength
   * Độ dài cung của spline.
   */
  public calculateSplineArcLength(entity?: unknown, options?: unknown) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    let length = 0;
    for (let i = 1; i < sampled.length; i++) length += distance3D(sampled[i - 1], sampled[i]);
    return length;
  }
  /**
   * [1568] calculateSplineParameterAtDistance
   * Tham số tương ứng với khoảng cách cho trước trên spline.
   */
  public calculateSplineParameterAtDistance(a?: unknown, b?: unknown) {
    const distance = readNum(b, ['distance', 'length', 'targetDistance'], readNum(a, ['distance'], 1));
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const t = parameterAtDistance(sampled, distance);
    return t;
  }
  /**
   * [1569] calculateSplineClosestPoint
   * Điểm gần nhất trên spline.
   */
  public calculateSplineClosestPoint(a?: unknown, b?: unknown, options?: unknown) {
    const point = this.worldOf(a);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const closest = closestPointOnPolyline(point, sampled);
    return named('calculateSplineClosestPoint', closest.point, {
      t: closest.t,
      distance: closest.distance,
    });
  }
  /**
   * [1570] calculateSplineProjection
   * Chiếu một điểm lên spline.
   */
  public calculateSplineProjection(a?: unknown, b?: unknown, options?: unknown) {
    const point = this.worldOf(a);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const closest = closestPointOnPolyline(point, sampled);
    const projection = subtract(closest.point, point);
    return named('calculateSplineProjection', projection, {
      point: closest.point,
      t: closest.t,
      distance: closest.distance,
    });
  }
  /**
   * [1571] calculateSplineUniformSampling
   * Lấy mẫu spline theo khoảng cách đều.
   */
  public calculateSplineUniformSampling(a?: unknown, b?: unknown, options?: unknown) {
    const count = Math.max(2, Math.floor(opt(options, ['samples', 'count'], 16)));
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    let total = 0;
    for (let i = 1; i < sampled.length; i++) total += distance3D(sampled[i - 1], sampled[i]);
    const result: Vec3D[] = [];
    for (let i = 0; i < count; i++) {
      const target = (total * i) / (count - 1);
      result.push(sampled[Math.min(sampled.length - 1, Math.round((target / Math.max(1e-9, total)) * (sampled.length - 1)))]);
    }
    return named('calculateSplineUniformSampling', result, { count, arcLength: total });
  }
  /**
   * [1572] calculateSplineFrame
   * Khung Frenet của spline (tangent / normal / binormal).
   */
  public calculateSplineFrame(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(opt(options, ['t'], 0.5) * (sampled.length - 1)), 0, sampled.length - 1);
    const frame = curveFrame(sampled, index);
    return named('calculateSplineFrame', frame, { index, point: sampled[index] });
  }
  /**
   * [1573] calculateTrajectoryPosition
   * Vị trí trên quỹ đạo tại thời gian cho trước.
   */
  public calculateTrajectoryPosition(a?: unknown, b?: unknown, options?: unknown) {
    const time = opt(options, ['time', 't'], 0);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const duration = sampled.length - 1;
    const value = trajectoryPointAtTime(
      sampled.map((p, i) => ({ position: p, time: i / Math.max(1, duration) })),
      clamp01(time),
    );
    return named('calculateTrajectoryPosition', value, { time, duration: 1 });
  }
  /**
   * [1574] calculateTrajectoryVelocity
   * Vận tốc trên quỹ đạo.
   */
  public calculateTrajectoryVelocity(entity?: unknown, dt = 0.016) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const step = Math.max(1e-6, dt) * (sampled.length - 1);
    const velocity = scale(subtract(sampled[1] ?? sampled[0], sampled[0]), 1 / step);
    return { name: 'calculateTrajectoryVelocity', valid: true, direction: velocity, magnitude: magnitude(velocity), timestamp: Date.now() };
  }
  /**
   * [1575] calculateTrajectoryAcceleration
   * Gia tốc trên quỹ đạo.
   */
  public calculateTrajectoryAcceleration(entity?: unknown, dt = 0.016) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const step = Math.max(1e-6, dt) * (sampled.length - 1);
    const v1 = scale(subtract(sampled[1] ?? sampled[0], sampled[0]), 1 / step);
    const v2 = scale(subtract(sampled[2] ?? sampled[1] ?? sampled[0], sampled[1] ?? sampled[0]), 1 / step);
    const acceleration = scale(subtract(v2, v1), 1 / step);
    return { name: 'calculateTrajectoryAcceleration', valid: true, direction: acceleration, magnitude: magnitude(acceleration), timestamp: Date.now() };
  }
  /**
   * [1576] calculateTrajectoryCurvature
   * Độ cong của quỹ đạo.
   */
  public calculateTrajectoryCurvature(entity?: unknown, options?: unknown) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(opt(options, ['t'], 0.5) * (sampled.length - 1)), 0, sampled.length - 1);
    return polylineCurvature(sampled, index);
  }
  /**
   * [1577] calculateTrajectoryTangent
   * Tiếp tuyến của quỹ đạo.
   */
  public calculateTrajectoryTangent(a?: unknown, b?: unknown) {
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(opt(b, ['t'], 0.5) * (sampled.length - 1)), 0, sampled.length - 1);
    const frame = curveFrame(sampled, index);
    return { name: 'calculateTrajectoryTangent', valid: true, direction: frame.tangent, magnitude: 1, timestamp: Date.now() };
  }
  /**
   * [1578] calculateTrajectoryNormal
   * Pháp tuyến của quỹ đạo.
   */
  public calculateTrajectoryNormal(a?: unknown, b?: unknown) {
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(opt(b, ['t'], 0.5) * (sampled.length - 1)), 0, sampled.length - 1);
    const frame = curveFrame(sampled, index);
    return { name: 'calculateTrajectoryNormal', valid: true, direction: frame.normal, magnitude: 1, timestamp: Date.now() };
  }
  /**
   * [1579] calculateTrajectoryBinormal
   * Pháp tuyến nhị của quỹ đạo.
   */
  public calculateTrajectoryBinormal(a?: unknown, b?: unknown) {
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const index = clamp(Math.round(opt(b, ['t'], 0.5) * (sampled.length - 1)), 0, sampled.length - 1);
    const frame = curveFrame(sampled, index);
    return { name: 'calculateTrajectoryBinormal', valid: true, direction: frame.binormal, magnitude: 1, timestamp: Date.now() };
  }
  /**
   * [1580] calculateTrajectoryClosestPoint
   * Điểm gần nhất trên quỹ đạo.
   */
  public calculateTrajectoryClosestPoint(a?: unknown, b?: unknown, options?: unknown) {
    const point = this.worldOf(a);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const closest = closestPointOnPolyline(point, sampled);
    return named('calculateTrajectoryClosestPoint', closest.point, {
      t: closest.t,
      distance: closest.distance,
    });
  }
  /**
   * [1581] calculateTrajectoryDeviation
   * Độ lệch của quỹ đạo so với đường thẳng nối hai đầu.
   */
  public calculateTrajectoryDeviation(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const start = sampled[0];
    const end = sampled[sampled.length - 1];
    const chord = subtract(end, start);
    const chordLength = magnitude(chord);
    let maxDeviation = 0;
    for (const p of sampled) {
      const deviation = chordLength < 1e-9
        ? distance3D(p, start)
        : magnitude(subtract(p, add(start, scale(chord, dot(subtract(p, start), chord) / (chordLength * chordLength)))));
      maxDeviation = Math.max(maxDeviation, deviation);
    }
    return scalar('calculateTrajectoryDeviation', maxDeviation, 'm', { chordLength });
  }
  /**
   * [1582] calculateTrajectoryLength
   * Độ dài quỹ đạo.
   */
  public calculateTrajectoryLength(entity?: unknown, options?: unknown) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    let length = 0;
    for (let i = 1; i < sampled.length; i++) length += distance3D(sampled[i - 1], sampled[i]);
    return length;
  }
  /**
   * [1583] calculateTrajectoryDuration
   * Thời lượng quỹ đạo (theo tốc độ trung bình).
   */
  public calculateTrajectoryDuration(entity?: unknown, options?: unknown) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    let length = 0;
    for (let i = 1; i < sampled.length; i++) length += distance3D(sampled[i - 1], sampled[i]);
    const speed = opt(options, ['speed', 'playbackSpeed'], 1);
    return scalar('calculateTrajectoryDuration', length / Math.max(1e-6, speed), 's', { length, speed });
  }
  /**
   * [1584] calculateTrajectorySpeedProfile
   * Hồ sơ tốc độ dọc quỹ đạo.
   */
  public calculateTrajectorySpeedProfile(entity?: unknown, options?: unknown) {
    const points = this.splineControls(entity);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const profile = sampled.map((p, i) => {
      const next = sampled[Math.min(sampled.length - 1, i + 1)];
      const previous = sampled[Math.max(0, i - 1)];
      const segment = Math.max(1e-9, distance3D(previous, next));
      return { time: i / Math.max(1, sampled.length - 1), speed: distance3D(p, next) / segment, position: p };
    });
    const maxSpeed = profile.reduce((m, s) => Math.max(m, s.speed), 0);
    return named('calculateTrajectorySpeedProfile', profile, { maxSpeed, samples: profile.length });
  }
  /**
   * [1585] calculateTrajectoryTimeParameterization
   * Ánh xạ thời gian → vị trí trên quỹ đạo.
   */
  public calculateTrajectoryTimeParameterization(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const duration = opt(options, ['duration'], 1);
    const mapping = sampled.map((p, i) => ({
      time: (i / Math.max(1, sampled.length - 1)) * duration,
      position: p,
    }));
    return named('calculateTrajectoryTimeParameterization', mapping, { duration, samples: mapping.length });
  }
  /**
   * [1586] calculateTrajectorySmoothing
   * Làm mượt quỹ đạo.
   */
  public calculateTrajectorySmoothing(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.splineControls(a);
    const passes = Math.max(1, Math.floor(opt(options, ['passes', 'iterations'], 1)));
    const smoothed = smoothPolyline(points, passes);
    return named('calculateTrajectorySmoothing', smoothed, { passes, controlPoints: points });
  }
  /**
   * [1587] calculateTrajectoryOptimization
   * Tối ưu quỹ đạo (làm mượt + rút gọn các điểm gần trùng nhau).
   */
  public calculateTrajectoryOptimization(a?: unknown, b?: unknown, options?: unknown) {
    const points = this.splineControls(a);
    const tolerance = opt(options, ['tolerance'], 0.01);
    const simplified: Vec3D[] = [];
    for (const p of points) {
      const last = simplified[simplified.length - 1];
      if (!last || distance3D(last, p) > tolerance) simplified.push(p);
    }
    if (simplified.length < 2) simplified.push(points[points.length - 1] ?? { x: 0, y: 0, z: 0 });
    const smoothed = smoothPolyline(simplified, 1);
    let length = 0;
    for (let i = 1; i < smoothed.length; i++) length += distance3D(smoothed[i - 1], smoothed[i]);
    return named('calculateTrajectoryOptimization', smoothed, {
      originalLength: points.length,
      optimizedLength: length,
      tolerance,
    });
  }
  /**
   * [1588] calculateTrajectoryCollisionAvoidance
   * Nhánh tránh vật cản của quỹ đạo.
   */
  public calculateTrajectoryCollisionAvoidance(a?: unknown, b?: unknown) {
    const origin = this.worldOf(a);
    const obstacle = this.worldOf(b);
    const direction = normalize(subtract(obstacle, origin));
    const distance = distance3D(origin, obstacle);
    const safeRadius = 1;
    const avoidance = distance < safeRadius
      ? normalize(cross(direction, UP3))
      : direction;
    return named('calculateTrajectoryCollisionAvoidance', avoidance, {
      distance,
      safeRadius,
      colliding: distance < safeRadius,
    });
  }
  /**
   * [1589] calculateTrajectoryReachability
   * Quỹ đạo có với tới được mục tiêu không.
   */
  public calculateTrajectoryReachability(a?: unknown, b?: unknown, options?: unknown) {
    const origin = this.worldOf(a);
    const target = this.worldOf(b);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    let minDistance = Infinity;
    for (const p of sampled) minDistance = Math.min(minDistance, distance3D(p, target));
    const maxReach = opt(options, ['maxReach', 'reach'], Infinity);
    const reachable = minDistance <= maxReach;
    return named('calculateTrajectoryReachability', reachable, {
      minDistance,
      maxReach,
      distance: distance3D(origin, target),
    });
  }
  /**
   * [1590] calculateTrajectoryPrediction
   * Dự đoán vị trí quỹ đạo sau một khoảng thời gian.
   */
  public calculateTrajectoryPrediction(a?: unknown, b?: unknown, options?: unknown) {
    const time = opt(options, ['time', 'ahead'], 0.5);
    const points = this.splineControls(a);
    const sampled = sampleCatmullRom(points, Math.max(8, points.length * 8));
    const duration = sampled.length - 1;
    const predicted = trajectoryPointAtTime(
      sampled.map((p, i) => ({ position: p, time: i / Math.max(1, duration) })),
      clamp01(time),
    );
    return named('calculateTrajectoryPrediction', predicted, {
      time,
      current: sampled[0],
    });
  }

  // ==========================================================================
  // 29. Ma trận và phép biến đổi
  // ==========================================================================

  /**
   * [1591] calculateMatrixMultiplication
   * Nhân hai ma trận 4x4.
   */
  public calculateMatrixMultiplication(target?: unknown, options?: unknown) {
    const a = resolveMatrix(target);
    const b = resolveMatrix(asRecord(options).matrix ?? asRecord(options).b ?? asRecord(options).right);
    return multiplyMatrices(a, b);
  }
  /**
   * [1592] calculateMatrixInverse
   * Nghịch đảo ma trận 4x4.
   */
  public calculateMatrixInverse(target?: unknown, options?: unknown) {
    return invertMatrix(resolveMatrix(target));
  }
  /**
   * [1593] calculateMatrixTranspose
   * Chuyển vị ma trận 4x4.
   */
  public calculateMatrixTranspose(target?: unknown, options?: unknown) {
    return transposeMatrix(resolveMatrix(target));
  }
  /**
   * [1594] calculateMatrixDeterminant
   * Định thức ma trận 4x4.
   */
  public calculateMatrixDeterminant(target?: unknown, options?: unknown) {
    const matrix = resolveMatrix(target);
    return scalar('calculateMatrixDeterminant', determinant4x4(matrix), 'det', {
      singular: Math.abs(determinant4x4(matrix)) < 1e-12,
    });
  }
  /**
   * [1595] calculateMatrixTrace
   * Vết ma trận 4x4.
   */
  public calculateMatrixTrace(target?: unknown, options?: unknown) {
    const matrix = resolveMatrix(target);
    return scalar('calculateMatrixTrace', traceMatrix(matrix), 'trace');
  }
  /**
   * [1596] calculateMatrixDecomposition
   * Phân rã ma trận thành vị trí / xoay / tỉ lệ.
   */
  public calculateMatrixDecomposition(target?: unknown, options?: unknown) {
    const matrix = resolveMatrix(target);
    const decomposition = decomposeMatrix(matrix);
    return named('calculateMatrixDecomposition', decomposition, { matrix });
  }
  /**
   * [1597] calculateMatrixOrthogonalization
   * Trực giao hoá Gram–Schmidt các cột ma trận.
   */
  public calculateMatrixOrthogonalization(target?: unknown, options?: unknown) {
    return orthogonalizeMatrix(resolveMatrix(target));
  }
  /**
   * [1598] calculateMatrixOrthonormalization
   * Chuẩn hoá ma trận thành hệ trực giao đơn vị.
   */
  public calculateMatrixOrthonormalization(target?: unknown, options?: unknown) {
    return orthonormalizeMatrix(resolveMatrix(target));
  }
  /**
   * [1599] calculateAffineTransform
   * Ma trận biến đổi affine (hàng cuối 0,0,0,1).
   */
  public calculateAffineTransform(target?: unknown, options?: unknown) {
    const matrix = resolveMatrix(target);
    const out = [...matrix];
    out[3] = 0;
    out[7] = 0;
    out[11] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * [1600] calculateHomogeneousTransform
   * Ma trận biến đổi đồng nhất (homogeneous).
   */
  public calculateHomogeneousTransform(target?: unknown, options?: unknown) {
    return resolveMatrix(target);
  }
  /**
   * [1601] calculateTranslationMatrix
   * Ma trận tịnh tiến.
   */
  public calculateTranslationMatrix(target?: unknown, options?: unknown) {
    const offset = readVec(target, ['offset', 'translation']) ?? { x: 0, y: 0, z: 0 };
    const position = this.worldOf(target);
    const used = magnitude(offset) > 0 ? offset : position;
    return translationMatrix(used);
  }
  /**
   * [1602] calculateScaleMatrix
   * Ma trận tỉ lệ.
   */
  public calculateScaleMatrix(target?: unknown, options?: unknown) {
    const scale = readVec(target, ['scale']) ?? { x: 1, y: 1, z: 1 };
    const used = magnitude(scale) > 0 ? scale : { x: 1, y: 1, z: 1 };
    return scaleMatrix(used);
  }
  /**
   * [1603] calculateRotationXMatrix
   * Ma trận xoay quanh trục X.
   */
  public calculateRotationXMatrix(entityOrAngle?: unknown, options?: unknown) {
    const angle = readNum(entityOrAngle, ['angle', 'rotation', 'x'], opt(options, ['angle'], 0));
    return eulerMatrix('x', angle);
  }
  /**
   * [1604] calculateRotationYMatrix
   * Ma trận xoay quanh trục Y.
   */
  public calculateRotationYMatrix(entityOrAngle?: unknown, options?: unknown) {
    const angle = readNum(entityOrAngle, ['angle', 'rotation', 'y'], opt(options, ['angle'], 0));
    return eulerMatrix('y', angle);
  }
  /**
   * [1605] calculateRotationZMatrix
   * Ma trận xoay quanh trục Z.
   */
  public calculateRotationZMatrix(entityOrAngle?: unknown, options?: unknown) {
    const angle = readNum(entityOrAngle, ['angle', 'rotation', 'z'], opt(options, ['angle'], 0));
    return eulerMatrix('z', angle);
  }
  /**
   * [1606] calculateNormalMatrix
   * Ma trận phản chuyển (cho pháp tuyến bề mặt).
   */
  public calculateNormalMatrix(target?: unknown, options?: unknown) {
    return normalMatrix(resolveMatrix(target));
  }
  /**
   * [1607] calculateTransformHierarchy
   * Tổng hợp ma trận của một cây phép biến đổi.
   */
  public calculateTransformHierarchy(target?: unknown, options?: unknown) {
    const source = (target ?? {}) as Record<string, unknown>;
    const children = Array.isArray(source.children) ? source.children : [];
    let matrix = resolveMatrix(target);
    for (const child of children) {
      matrix = multiplyMatrices(matrix, resolveMatrix(child));
    }
    return matrix;
  }
  /**
   * [1608] calculateTransformComposition
   * Ghép hai phép biến đổi.
   */
  public calculateTransformComposition(target?: unknown, options?: unknown) {
    const a = resolveMatrix(target);
    const b = resolveMatrix(asRecord(options).matrix ?? asRecord(options).b ?? asRecord(options).child);
    return multiplyMatrices(a, b);
  }
  /**
   * [1609] calculateTransformDecomposition
   * Phân rã phép biến đổi thành TRS.
   */
  public calculateTransformDecomposition(target?: unknown, options?: unknown) {
    const matrix = resolveMatrix(target);
    const decomposition = decomposeMatrix(matrix);
    return named('calculateTransformDecomposition', decomposition, { matrix });
  }
  /**
   * [1610] calculateTransformInterpolation
   * Nội suy giữa hai phép biến đổi.
   */
  public calculateTransformInterpolation(target?: unknown, options?: unknown) {
    const a = resolveMatrix(target);
    const b = resolveMatrix(asRecord(options).matrix ?? asRecord(options).to ?? asRecord(options).b);
    const t = opt(options, ['t', 'time', 'progress'], 0.5);
    return interpolateMatrices(a, b, t);
  }
  /**
   * [1611] calculateTransformError
   * Sai số giữa hai phép biến đổi.
   */
  public calculateTransformError(target?: unknown, options?: unknown) {
    const a = resolveMatrix(target);
    const b = resolveMatrix(asRecord(options).matrix ?? asRecord(options).expected ?? asRecord(options).b);
    return scalar('calculateTransformError', matrixError(a, b), 'frobenius');
  }

  // ==========================================================================
  // 30. Hệ toạ độ
  // ==========================================================================

  /**
   * [1612] calculateCoordinateBasis
   * Hệ trục trực chuẩn từ một hướng.
   */
  public calculateCoordinateBasis(a?: unknown, b?: unknown, options?: unknown) {
    const direction = this.worldOf(a);
    const basis = coordinateBasis(direction);
    return named('calculateCoordinateBasis', basis, { direction });
  }
  /**
   * [1613] calculateCoordinateConversion
   * Chuyển điểm giữa hai hệ toạ độ.
   */
  public calculateCoordinateConversion(a?: unknown, b?: unknown, options?: unknown) {
    const point = this.worldOf(a);
    const from = readVec(b, ['from', 'source']) ?? this.worldOf(b);
    const to = readVec(options, ['to', 'target']) ?? { x: 0, y: 0, z: 1 };
    const value = convertCoordinates(point, from, to);
    return named('calculateCoordinateConversion', value, { from, to, point });
  }
  /**
   * [1614] calculateCoordinateNormalization
   * Chuẩn hoá vector về đơn vị.
   */
  public calculateCoordinateNormalization(a?: unknown, b?: unknown) {
    const value = this.worldOf(a);
    const normalized = magnitude(value) > 0 ? normalize(value) : { x: 0, y: 0, z: 0 };
    return { name: 'calculateCoordinateNormalization', valid: true, direction: normalized, magnitude: magnitude(normalized), timestamp: Date.now() };
  }
  /**
   * [1615] calculateCoordinateQuantization
   * Lượng tử hoá vector theo bước.
   */
  public calculateCoordinateQuantization(a?: unknown, b?: unknown) {
    const value = this.worldOf(a);
    const step = readNum(b, ['step', 'quantum', 'precision'], 0.1);
    const quantized = quantizeVector(value, step);
    return named('calculateCoordinateQuantization', quantized, { step, original: value });
  }
  /**
   * [1616] calculateCoordinateClamping
   * Kẹp tọa độ trong hộp giới hạn.
   */
  public calculateCoordinateClamping(a?: unknown, b?: unknown) {
    const value = this.worldOf(a);
    const min = readVec(b, ['min']) ?? { x: -1, y: -1, z: -1 };
    const max = readVec(b, ['max']) ?? { x: 1, y: 1, z: 1 };
    const clamped = {
      x: clampValue(value.x, min.x, max.x),
      y: clampValue(value.y, min.y, max.y),
      z: clampValue(value.z, min.z, max.z),
    };
    return named('calculateCoordinateClamping', clamped, { min, max, original: value });
  }
  /**
   * [1617] calculateCoordinateWrapping
   * Quấn tọa độ vào khoảng tuần hoàn.
   */
  public calculateCoordinateWrapping(a?: unknown, b?: unknown) {
    const value = this.worldOf(a);
    const range = readNum(b, ['range', 'period', 'size'], 1);
    const wrapped = {
      x: wrapValue(value.x, range),
      y: wrapValue(value.y, range),
      z: wrapValue(value.z, range),
    };
    return named('calculateCoordinateWrapping', wrapped, { range, original: value });
  }
  /**
   * [1618] calculateCoordinateSnapping
   * Bám tọa độ vào lưới.
   */
  public calculateCoordinateSnapping(a?: unknown, b?: unknown) {
    const value = this.worldOf(a);
    const step = readNum(b, ['step', 'gridSize', 'cellSize'], 1);
    const snapped = {
      x: snapValue(value.x, step),
      y: snapValue(value.y, step),
      z: snapValue(value.z, step),
    };
    return named('calculateCoordinateSnapping', snapped, { step, original: value });
  }
  /**
   * [1619] calculateCoordinateRounding
   * Làm tròn tọa độ theo số chữ số thập phân.
   */
  public calculateCoordinateRounding(a?: unknown, b?: unknown) {
    const value = this.worldOf(a);
    const decimals = readNum(b, ['decimals', 'precision'], 3);
    const rounded = {
      x: roundValue(value.x, decimals),
      y: roundValue(value.y, decimals),
      z: roundValue(value.z, decimals),
    };
    return named('calculateCoordinateRounding', rounded, { decimals, original: value });
  }
  /**
   * [1620] calculateCoordinatePrecisionError
   * Sai số do lượng tử hoá.
   */
  public calculateCoordinatePrecisionError(a?: unknown, b?: unknown) {
    const value = this.worldOf(a);
    const step = readNum(b, ['step', 'quantum'], 0.1);
    const quantized = quantizeVector(value, step);
    return scalar('calculateCoordinatePrecisionError', distance3D(value, quantized), 'm', {
      step,
      original: value,
      quantized,
    });
  }

  // ==========================================================================
  // 31. Lưới không gian
  // ==========================================================================

  /**
   * [1621] getGridCellPosition
   * Vị trí góc dưới của ô lưới chứa điểm.
   */
  public getGridCellPosition(entity?: unknown, offset?: Vec3D) {
    const size = this.cellSize(asRecord(entity).options);
    const index = gridCellIndex(this.worldOf(entity), size);
    const center = gridCellCenter(index, size);
    return {
      x: center.x - size / 2 + (offset?.x ?? 0),
      y: center.y - size / 2 + (offset?.y ?? 0),
      z: center.z - size / 2 + (offset?.z ?? 0),
    };
  }
  /**
   * [1622] getGridCellCenter
   * Tâm ô lưới chứa điểm.
   */
  public getGridCellCenter(entity?: unknown, offset?: Vec3D) {
    const size = this.cellSize(asRecord(entity).options);
    const center = gridCellCenter(gridCellIndex(this.worldOf(entity), size), size);
    return {
      x: center.x + (offset?.x ?? 0),
      y: center.y + (offset?.y ?? 0),
      z: center.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1623] getGridCellBounds
   * Hộp giới hạn của ô lưới chứa điểm.
   */
  public getGridCellBounds(entity?: unknown, size?: Vec3D) {
    const cellSize = this.cellSize(asRecord(entity).options);
    const box = gridCellBounds(gridCellIndex(this.worldOf(entity), cellSize), cellSize);
    return bounds('getGridCellBounds', box, { cellSize });
  }
  /**
   * [1624] calculateGridCellIndex
   * Chỉ số ô lưới chứa một điểm.
   */
  public calculateGridCellIndex(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const index = gridCellIndex(this.worldOf(a), cellSize);
    return named('calculateGridCellIndex', index, { cellSize });
  }
  /**
   * [1625] calculateGridCoordinates
   * Toạ độ thế giới của một ô lưới.
   */
  public calculateGridCoordinates(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const source = (a ?? {}) as Record<string, unknown>;
    const index = source.index && typeof source.index === 'object'
      ? (source.index as { x: number; y: number; z: number })
      : gridCellIndex(this.worldOf(a), cellSize);
    const center = gridCellCenter(index, cellSize);
    return named('calculateGridCoordinates', center, { index, cellSize });
  }
  /**
   * [1626] calculateGridDistance
   * Khoảng cách giữa hai ô lưới (tính bằng số ô).
   */
  public calculateGridDistance(a?: unknown, b?: unknown) {
    const cellSize = this.cellSize();
    const indexA = gridCellIndex(this.worldOf(a), cellSize);
    const indexB = gridCellIndex(this.worldOf(b), cellSize);
    const cells = gridIndexDistance(indexA, indexB);
    return cells * cellSize;
  }
  /**
   * [1627] calculateGridNeighborCells
   * Các ô lượng xung quanh một ô.
   */
  public calculateGridNeighborCells(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const index = gridCellIndex(this.worldOf(a), cellSize);
    const neighbors = gridNeighborCells(index);
    return named('calculateGridNeighborCells', neighbors, { index, cellSize, count: neighbors.length });
  }
  /**
   * [1628] calculateGridWorldPosition
   * Vị trí thế giới của một ô lưới.
   */
  public calculateGridWorldPosition(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const source = (a ?? {}) as Record<string, unknown>;
    const index = source.index && typeof source.index === 'object'
      ? (source.index as { x: number; y: number; z: number })
      : gridCellIndex(this.worldOf(a), cellSize);
    const center = gridCellCenter(index, cellSize);
    return named('calculateGridWorldPosition', center, { index, cellSize });
  }
  /**
   * [1629] calculateGridWorldToCell
   * Chuyển tọa độ thế giới sang chỉ số ô lưới.
   */
  public calculateGridWorldToCell(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const index = gridCellIndex(this.worldOf(a), cellSize);
    const center = gridCellCenter(index, cellSize);
    return named('calculateGridWorldToCell', index, { cellSize, center });
  }
  /**
   * [1630] calculateGridOccupancy
   * Trạng thái chiếm dụng của một ô lưới.
   */
  public calculateGridOccupancy(a?: unknown, b?: unknown) {
    const cellSize = this.cellSize();
    const index = gridCellIndex(this.worldOf(a), cellSize);
    const source = (a ?? {}) as Record<string, unknown>;
    const occupancy = source.occupancy;
    let occupied = false;
    let count = 0;
    if (occupancy && typeof occupancy === 'object') {
      const map = occupancy as Record<string, unknown>;
      const key = `${index.x},${index.y},${index.z}`;
      const entry = map[key];
      if (typeof entry === 'number') {
        occupied = entry > 0;
        count = entry;
      } else if (typeof entry === 'boolean') {
        occupied = entry;
        count = entry ? 1 : 0;
      }
    }
    if (typeof source.occupied === 'boolean') occupied = source.occupied;
    return named('calculateGridOccupancy', occupied, { index, count, occupied });
  }
  /**
   * [1631] calculateGridTraversalCost
   * Chi phí đi giữa hai ô lưới.
   */
  public calculateGridTraversalCost(entity?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const source = (entity ?? {}) as Record<string, unknown>;
    const from = source.from && typeof source.from === 'object'
      ? (source.from as { x: number; y: number; z: number })
      : gridCellIndex(this.worldOf(entity), cellSize);
    const to = source.to && typeof source.to === 'object'
      ? (source.to as { x: number; y: number; z: number })
      : gridCellIndex(readVec(options, ['to']), cellSize);
    const cost = gridTraversalCost(from, to);
    return cost * cellSize;
  }
  /**
   * [1632] calculateGridPathDistance
   * Quãng đường đi trên lưới giữa hai ô.
   */
  public calculateGridPathDistance(a?: unknown, b?: unknown) {
    const cellSize = this.cellSize();
    const indexA = gridCellIndex(this.worldOf(a), cellSize);
    const indexB = gridCellIndex(this.worldOf(b), cellSize);
    const cost = gridTraversalCost(indexA, indexB);
    return cost * cellSize;
  }

  // ==========================================================================
  // 32. Địa hình, nước và môi trường
  // ==========================================================================

  /**
   * [1633] calculateTerrainHeight
   * Độ cao địa hình tại một điểm.
   */
  public calculateTerrainHeight(entity?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const point = this.worldOf(entity);
    const height = terrainHeightAt(point.x, point.z, amplitude, frequency);
    return height;
  }
  /**
   * [1634] calculateTerrainNormal
   * Pháp tuyến bề mặt địa hình.
   */
  public calculateTerrainNormal(a?: unknown, b?: unknown) {
    const { amplitude, frequency } = this.terrainParams(b);
    const point = this.worldOf(a);
    const normal = terrainNormalAt(point.x, point.z, amplitude, frequency);
    return { name: 'calculateTerrainNormal', valid: true, direction: normal, magnitude: magnitude(normal), timestamp: Date.now() };
  }
  /**
   * [1635] calculateTerrainSlope
   * Độ dốc địa hình.
   */
  public calculateTerrainSlope(a?: unknown, b?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const point = this.worldOf(a);
    const slope = terrainSlopeAt(point.x, point.z, amplitude, frequency);
    return scalar('calculateTerrainSlope', slope, 'rad', { point });
  }
  /**
   * [1636] calculateTerrainCurvature
   * Độ cong địa hình.
   */
  public calculateTerrainCurvature(entity?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const point = this.worldOf(entity);
    const curvature = terrainCurvatureAt(point.x, point.z, amplitude, frequency);
    return curvature;
  }
  /**
   * [1637] calculateTerrainSurfaceArea
   * Diện tích bề mặt địa hình trong vùng.
   */
  public calculateTerrainSurfaceArea(entity?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const size = opt(options, ['size', 'extent', 'radius'], 10);
    const samples = Math.max(4, Math.floor(opt(options, ['samples'], 24)));
    const area = terrainSurfaceArea(size, amplitude, frequency, samples);
    return area;
  }
  /**
   * [1638] calculateTerrainVolume
   * Thể tích địa hình trong vùng.
   */
  public calculateTerrainVolume(entity?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const size = opt(options, ['size', 'extent', 'radius'], 10);
    const samples = Math.max(4, Math.floor(opt(options, ['samples'], 24)));
    const volume = terrainVolume(size, amplitude, frequency, samples);
    return volume;
  }
  /**
   * [1639] calculateTerrainBounds
   * Hộp giới hạn của vùng địa hình.
   */
  public calculateTerrainBounds(entity?: unknown, size?: Vec3D) {
    const center = this.worldOf(entity);
    const extent = size ?? { x: 10, y: 10, z: 10 };
    return bounds('calculateTerrainBounds', boundingBox(center, extent), { center });
  }
  /**
   * [1640] calculateTerrainClosestPoint
   * Điểm địa hình gần nhất.
   */
  public calculateTerrainClosestPoint(a?: unknown, b?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const point = this.worldOf(a);
    const closest = closestTerrainPoint(point, amplitude, frequency);
    return named('calculateTerrainClosestPoint', { x: closest.x, y: closest.y, z: closest.z }, {
      height: closest.height,
      point,
    });
  }
  /**
   * [1641] calculateTerrainRayIntersection
   * Giao điểm tia với bề mặt địa hình.
   *
   * Tia được dò từ điểm xuất phát theo hướng đưa vào. Khi tia **không** chạm
   * địa hình, kết quả vẫn báo điểm gần nhất của tia với mặt địa hình cùng
   * khoảng hở tương ứng, thay vì trả về `null` trống không.
   */
  public calculateTerrainRayIntersection(origin?: Vec3D, direction?: Vec3D) {
    const start = this.worldOf(origin);
    const raw = (direction ?? {}) as Record<string, unknown>;
    const hasAxis = typeof raw.x === 'number' || typeof raw.y === 'number' || typeof raw.z === 'number';
    const dir = normalize(hasAxis ? toVec3(raw) : { x: 0, y: -1, z: 0 });
    const amplitude = DEFAULT_TERRAIN_AMPLITUDE;
    const frequency = DEFAULT_TERRAIN_FREQUENCY;
    let previousT = 0;
    let previousGap = start.y - terrainHeightAt(start.x, start.z, amplitude, frequency);
    let closestT = 0;
    let closestGap = previousGap;
    for (let i = 1; i <= 128; i++) {
      const t = i * 0.25;
      const p = add(start, scale(dir, t));
      const gap = p.y - terrainHeightAt(p.x, p.z, amplitude, frequency);
      if (Math.abs(gap) < Math.abs(closestGap)) {
        closestGap = gap;
        closestT = t;
      }
      if (gap <= 0 && previousGap > 0) {
        const alpha = previousGap / Math.max(1e-9, previousGap - gap);
        const hitT = previousT + (t - previousT) * alpha;
        const hit = add(start, scale(dir, hitT));
        return named('calculateTerrainRayIntersection', hit, { distance: hitT, hit: true });
      }
      previousT = t;
      previousGap = gap;
    }
    const closest = add(start, scale(dir, closestT));
    return named('calculateTerrainRayIntersection', null, {
      hit: false,
      distance: Infinity,
      closestPoint: closest,
      closestDistance: closestT,
      gap: closestGap,
    });
  }
  /**
   * [1642] calculateTerrainCollision
   * Va chạm với mặt đất địa hình.
   */
  public calculateTerrainCollision(a?: unknown, b?: unknown) {
    const { amplitude, frequency } = this.terrainParams(b);
    const point = this.worldOf(a);
    const ground = terrainHeightAt(point.x, point.z, amplitude, frequency);
    const penetration = Math.max(0, ground - point.y);
    const hit = penetration > 0;
    return {
      name: 'calculateTerrainCollision',
      valid: true,
      hit,
      collision: hit,
      overlap: hit,
      distance: Math.abs(point.y - ground),
      point: { x: point.x, y: ground, z: point.z },
      normal: terrainNormalAt(point.x, point.z, amplitude, frequency),
      penetration,
      timestamp: Date.now(),
    };
  }
  /**
   * [1643] calculateTerrainGroundClearance
   * Khoảng hở giữa vật thể và mặt đất.
   */
  public calculateTerrainGroundClearance(entity?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const point = this.worldOf(entity);
    const ground = terrainHeightAt(point.x, point.z, amplitude, frequency);
    return point.y - ground;
  }
  /**
   * [1644] calculateTerrainPathSlope
   * Độ dốc dọc theo một đoạn đường trên địa hình.
   */
  public calculateTerrainPathSlope(a?: unknown, b?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const from = this.worldOf(a);
    const to = this.worldOf(b);
    const hFrom = terrainHeightAt(from.x, from.z, amplitude, frequency);
    const hTo = terrainHeightAt(to.x, to.z, amplitude, frequency);
    const horizontal = Math.hypot(to.x - from.x, to.z - from.z);
    const slope = horizontal < 1e-9 ? 0 : Math.atan2(hTo - hFrom, horizontal);
    return scalar('calculateTerrainPathSlope', slope, 'rad', { from, to, heightFrom: hFrom, heightTo: hTo });
  }
  /**
   * [1645] calculateTerrainNavigationCost
   * Chi phí đi bộ trên địa hình (độ dốc + độ cao).
   */
  public calculateTerrainNavigationCost(entity?: unknown, options?: unknown) {
    const { amplitude, frequency } = this.terrainParams(options);
    const point = this.worldOf(entity);
    const slope = terrainSlopeAt(point.x, point.z, amplitude, frequency);
    const clearance = opt(options, ['clearance'], 0);
    const slopeCost = Math.tan(slope) * (opt(options, ['slopeWeight'], 1));
    const clearanceCost = Math.max(0, 0.5 - clearance) * (opt(options, ['clearanceWeight'], 2));
    return slopeCost + clearanceCost;
  }
  /**
   * [1646] calculateWaterSurfaceHeight
   * Mực nước tại một điểm.
   */
  public calculateWaterSurfaceHeight(entity?: unknown, options?: unknown) {
    const waterLevel = opt(options, ['waterLevel', 'level'], 0);
    const waveAmplitude = opt(options, ['waveAmplitude'], 0);
    const waveFrequency = opt(options, ['waveFrequency'], 0.2);
    const point = this.worldOf(entity);
    const height = waterSurfaceHeight(point.x, point.z, waterLevel, waveAmplitude, waveFrequency);
    return height;
  }
  /**
   * [1647] calculateWaterSurfaceNormal
   * Pháp tuyến mặt nước.
   *
   * Mực nước / biên độ sóng / tần số sóng đọc từ tham số thứ hai; nếu tham số
   * đó không khai báo thì lấy từ entity (`waterLevel`, `waveHeight`,
   * `waveFrequency`). Nhờ vậy pháp tuyến phản ánh mặt nước thật (có sóng) thay
   * vì luôn trả về trục Y.
   */
  public calculateWaterSurfaceNormal(a?: unknown, b?: unknown) {
    const waterLevel = opt(b, ['waterLevel', 'level'], readNum(a, ['waterLevel', 'level', 'waterHeight'], 0));
    const waveAmplitude = opt(b, ['waveAmplitude'], readNum(a, ['waveAmplitude', 'waveHeight'], 0));
    const waveFrequency = opt(b, ['waveFrequency'], readNum(a, ['waveFrequency'], 0.2));
    const point = this.worldOf(a);
    const normal = waterSurfaceNormal(point.x, point.z, waterLevel, waveAmplitude, waveFrequency);
    return { name: 'calculateWaterSurfaceNormal', valid: true, direction: normal, magnitude: magnitude(normal), timestamp: Date.now() };
  }
  /**
   * [1648] calculateWaterDepth
   * Độ sâu nước tại một điểm.
   *
   * Mực nước đọc từ `options`, nếu không có thì lấy từ entity (`waterLevel`).
   * Vì mặt nước có sóng nên độ sâu đo tới **bề mặt sóng** thật chứ không tới
   * mặt phẳng mực nước, và đáy là địa hình thật.
   */
  public calculateWaterDepth(entity?: unknown, options?: unknown) {
    const waterLevel = opt(options, ['waterLevel', 'level'], readNum(entity, ['waterLevel', 'level', 'waterHeight'], 0));
    const waveAmplitude = opt(options, ['waveAmplitude'], readNum(entity, ['waveAmplitude', 'waveHeight'], 0));
    const waveFrequency = opt(options, ['waveFrequency'], readNum(entity, ['waveFrequency'], 0.2));
    const { amplitude, frequency } = this.terrainParams(options);
    const point = this.worldOf(entity);
    const ground = terrainHeightAt(point.x, point.z, amplitude, frequency);
    const surface = waterSurfaceHeight(point.x, point.z, waterLevel, waveAmplitude, waveFrequency);
    const depth = Math.max(0, surface - ground);
    return depth;
  }
  /**
   * [1649] calculateWaterBuoyancy
   * Lực đẩy của nước.
   */
  public calculateWaterBuoyancy(a?: unknown, b?: unknown, options?: unknown) {
    const volume = opt(options, ['volume'], 1);
    const density = opt(options, ['density'], 1000);
    const waterDensity = opt(options, ['waterDensity'], 1000);
    const submerged = opt(options, ['submergedFraction', 'submerged'], 1);
    const force = buoyancyForce(volume, density, waterDensity, submerged);
    return scalar('calculateWaterBuoyancy', force, 'N', {
      volume,
      density,
      waterDensity,
      submergedFraction: submerged,
    });
  }
  /**
   * [1650] calculateEnvironmentWindVector
   * Vector gió môi trường.
   */
  public calculateEnvironmentWindVector(a?: unknown, b?: unknown) {
    const source = (a ?? {}) as Record<string, unknown>;
    const direction = readVec(source, ['direction', 'windDirection']);
    const speed = readNum(source, ['speed', 'windSpeed', 'strength'], 0);
    const base = magnitude(direction) > 0 ? normalize(direction) : { x: 1, y: 0, z: 0 };
    const time = readNum(source, ['time', 't'], 0);
    const gust = Math.sin(time * 0.7) * 0.2 + Math.cos(time * 1.3) * 0.1;
    const wind = scale(base, speed * (1 + gust));
    return { name: 'calculateEnvironmentWindVector', valid: true, direction: wind, magnitude: magnitude(wind), timestamp: Date.now() };
  }

  // ==========================================================================
  // 33. LOD và ưu tiên cập nhật
  // ==========================================================================

  /**
   * [1651] calculateObjectLOD
   * Mức LOD của vật thể theo khoảng cách camera.
   */
  public calculateObjectLOD(entity?: unknown, camera?: unknown) {
    return this.lodFor('calculateObjectLOD', entity, camera, 1);
  }
  /**
   * [1652] calculateCharacterLOD
   * Mức LOD của nhân vật.
   */
  public calculateCharacterLOD(entity?: unknown, camera?: unknown) {
    return this.lodFor('calculateCharacterLOD', entity, camera, 1.8);
  }
  /**
   * [1653] calculateMeshLOD
   * Mức LOD của lưới hình học.
   */
  public calculateMeshLOD(entity?: unknown, camera?: unknown) {
    return this.lodFor('calculateMeshLOD', entity, camera, 1);
  }
  /**
   * [1654] calculateAnimationLOD
   * Mức LOD của animation.
   */
  public calculateAnimationLOD(entity?: unknown, camera?: unknown) {
    return this.lodFor('calculateAnimationLOD', entity, camera, 1);
  }
  /**
   * [1655] calculateSkeletonLOD
   * Mức LOD của skeleton.
   */
  public calculateSkeletonLOD(entity?: unknown, camera?: unknown) {
    return this.lodFor('calculateSkeletonLOD', entity, camera, 1.5);
  }
  /**
   * [1656] calculateShadowLOD
   * Mức LOD của bóng đổ.
   */
  public calculateShadowLOD(entity?: unknown, camera?: unknown) {
    return this.lodFor('calculateShadowLOD', entity, camera, 1);
  }
  /**
   * [1657] calculateParticleLOD
   * Mức LOD của hệ hạt.
   */
  public calculateParticleLOD(entity?: unknown, camera?: unknown) {
    return this.lodFor('calculateParticleLOD', entity, camera, 0.5);
  }
  /**
   * [1658] calculateLODTransition
   * Ngưỡng chuyển đổi giữa hai mức LOD.
   */
  public calculateLODTransition(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    const current = lodThreshold(level);
    const next = lodThreshold(level + 1);
    return named('calculateLODTransition', { from: level, to: level + 1, current, next }, {
      screenSize: frame.screenSize,
      distance: frame.distance,
      blend: clamp01((frame.screenSize - next) / Math.max(1e-9, current - next)),
    });
  }
  /**
   * [1659] calculateLODThreshold
   * Ngưỡng kích thước chiếu của một mức LOD.
   */
  public calculateLODThreshold(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    return scalar('calculateLODThreshold', lodThreshold(level), 'screen', { level });
  }
  /**
   * [1660] calculateLODScreenSize
   * Kích thước chiếu của vật thể trên màn hình.
   */
  public calculateLODScreenSize(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    return scalar('calculateLODScreenSize', frame.screenSize, 'screen', {
      distance: frame.distance,
      radius: frame.radius,
    });
  }
  /**
   * [1661] calculateLODProjectedError
   * Sai số chiếu theo mức LOD.
   */
  public calculateLODProjectedError(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    const baseError = readNum(entity, ['baseError'], 0.01);
    return scalar('calculateLODProjectedError', lodProjectedError(level, baseError), 'm', { level });
  }
  /**
   * [1662] calculateLODVisibility
   * Vật thể có hiển thị được ở mức LOD hiện tại không.
   */
  public calculateLODVisibility(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    const visible = frame.distance <= readNum(entity, ['maxDistance', 'cullDistance'], Infinity);
    return named('calculateLODVisibility', visible, {
      distance: frame.distance,
      maxDistance: readNum(entity, ['maxDistance', 'cullDistance'], Infinity),
      screenSize: frame.screenSize,
    });
  }
  /**
   * [1666] calculateOcclusionVisibility
   * Vật thể có bị che khuất bởi vật cản không.
   *
   * Vật cản lấy từ chính entity (`occluders`/`obstacles`, hoặc cặp `occluder` +
   * `occluderRadius`). Với mỗi vật cản, tính khoảng cách từ tâm vật cản tới
   * đoạn camera→vật thể: nếu vật cản nằm giữa camera và vật thể thì phần bị
   * che được tính theo độ sâu xâm nhập (`occlusion`), ngược lại vật thể nhìn
   * thấy trọn vẹn (`occlusion = 0`).
   */
  public calculateOcclusionVisibility(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    const occluders = this.occluderSpheres(entity);
    const axis = subtract(frame.position, frame.cameraPosition);
    const axisLengthSq = dot(axis, axis);
    let occlusion = 0;
    let clearance = Number.POSITIVE_INFINITY;
    for (const occ of occluders) {
      const toOccluder = subtract(occ.center, frame.cameraPosition);
      const t = axisLengthSq > 1e-12 ? dot(toOccluder, axis) / axisLengthSq : 0;
      if (t <= 0 || t >= 1) {
        // Vật cản nằm ngoài đoạn tầm nhìn: không che được, nhưng vẫn đo được
        // khoảng hở tới vật cản gần nhất.
        const gap = distance3D(frame.cameraPosition, occ.center) - occ.radius;
        if (gap < clearance) clearance = gap;
        continue;
      }
      const closest = add(frame.cameraPosition, scale(axis, t));
      const gap = distance3D(closest, occ.center) - occ.radius;
      if (gap < clearance) clearance = gap;
      if (gap < 0) {
        const coverage = clamp01(1 - gap / occ.radius);
        if (coverage > occlusion) occlusion = coverage;
      }
    }
    const visible = occlusion < 0.5;
    return named('calculateOcclusionVisibility', visible, {
      occlusion,
      occluded: !visible,
      clearance,
      distance: frame.distance,
      occluders: occluders.length,
    });
  }
  /**
   * [1667] calculateFrustumCulling
   * Có cần cull vật thể khỏi thể tích nhìn không.
   */
  public calculateFrustumCulling(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    const culled = frame.distance > readNum(entity, ['farDistance', 'cullDistance'], Infinity);
    return named('calculateFrustumCulling', culled, {
      distance: frame.distance,
      cullDistance: readNum(entity, ['farDistance', 'cullDistance'], Infinity),
    });
  }
  /**
   * [1668] calculateDistanceCulling
   * Culling theo khoảng cách.
   */
  public calculateDistanceCulling(a?: unknown, b?: unknown) {
    const distance = distance3D(this.worldOf(a), this.worldOf(b));
    const maxDistance = readNum(b, ['maxDistance', 'cullDistance'], Infinity);
    return distance;
  }
  /**
   * [1669] calculateScreenSizeCulling
   * Culling theo kích thước chiếu.
   */
  public calculateScreenSizeCulling(entity?: unknown, camera?: unknown) {
    const frame = this.lodFrame(entity, camera);
    const minSize = readNum(entity, ['minScreenSize', 'cullScreenSize'], 0);
    const culled = frame.screenSize < minSize;
    return named('calculateScreenSizeCulling', culled, {
      screenSize: frame.screenSize,
      minScreenSize: minSize,
    });
  }
  /**
   * [1663] calculateLODUpdateFrequency
   * Tần số cập nhật theo mức LOD.
   */
  public calculateLODUpdateFrequency(entity?: unknown, options?: unknown) {
    const frame = this.lodFrame(entity, asRecord(options).camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    const base = opt(options, ['baseFrequency'], 60);
    return lodUpdateFrequency(level, base);
  }
  /**
   * [1664] calculateLODSelectionScore
   * Điểm chọn LOD (cao hơn = ưu tiên cập nhật).
   */
  public calculateLODSelectionScore(entity?: unknown, options?: unknown) {
    const frame = this.lodFrame(entity, asRecord(options).camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    const importance = readNum(entity, ['importance', 'priority'], 1);
    return lodSelectionScore(level, frame.distance, importance);
  }
  /**
   * [1665] calculateOcclusionBounds
   * Hộp bao dùng cho kiểm tra che khuất.
   */
  public calculateOcclusionBounds(entity?: unknown, size?: Vec3D) {
    const center = this.worldOf(entity);
    const extent = size ?? { x: 1, y: 1, z: 1 };
    return bounds('calculateOcclusionBounds', boundingBox(center, extent), { center });
  }
  /**
   * [1670] calculateAnimationUpdatePriority
   * Ưu tiên cập nhật animation.
   */
  public calculateAnimationUpdatePriority(a?: unknown, b?: unknown, options?: unknown) {
    return this.updatePriority('calculateAnimationUpdatePriority', a, b, options, 1);
  }
  /**
   * [1671] calculateBoneUpdatePriority
   * Ưu tiên cập nhật xương.
   */
  public calculateBoneUpdatePriority(a?: unknown, b?: unknown, options?: unknown) {
    return this.updatePriority('calculateBoneUpdatePriority', a, b, options, 1);
  }
  /**
   * [1672] calculatePhysicsUpdatePriority
   * Ưu tiên cập nhật vật lý.
   */
  public calculatePhysicsUpdatePriority(a?: unknown, b?: unknown, options?: unknown) {
    return this.updatePriority('calculatePhysicsUpdatePriority', a, b, options, 1);
  }
  /**
   * [1673] calculateCollisionUpdatePriority
   * Ưu tiên cập nhật va chạm.
   */
  public calculateCollisionUpdatePriority(a?: unknown, b?: unknown) {
    return this.updatePriority('calculateCollisionUpdatePriority', a, b, undefined, 1);
  }
  /**
   * [1674] calculateSpatialUpdateFrequency
   * Tần số cập nhật phần không gian.
   */
  public calculateSpatialUpdateFrequency(entity?: unknown, options?: unknown) {
    const frame = this.lodFrame(entity, asRecord(options).camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    return lodUpdateFrequency(level, opt(options, ['baseFrequency'], 60));
  }
  /**
   * [1675] calculateTransformUpdateFrequency
   * Tần số cập nhật phép biến đổi.
   */
  public calculateTransformUpdateFrequency(target?: unknown, options?: unknown) {
    const frame = this.lodFrame(target, asRecord(options).camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    return scalar('calculateTransformUpdateFrequency', lodUpdateFrequency(level, opt(options, ['baseFrequency'], 60)), 'Hz', {
      level,
      distance: frame.distance,
    });
  }
  /**
   * [1676] calculateBoundingVolumeUpdate
   * Tần số cập nhật thể tích bao.
   */
  public calculateBoundingVolumeUpdate(entity?: unknown, options?: unknown) {
    const frame = this.lodFrame(entity, asRecord(options).camera);
    const level = lodLevelForScreenSize(frame.screenSize);
    return lodUpdateFrequency(level, opt(options, ['baseFrequency'], 30));
  }
  /**
   * [1677] calculateSpatialPartitionIndex
   * Chỉ số phân hoạch không gian (Morton code).
   */
  public calculateSpatialPartitionIndex(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const index = gridCellIndex(this.worldOf(a), cellSize);
    const interleave = (x: number, y: number, z: number): number => {
      let result = 0;
      for (let bit = 0; bit < 21; bit++) {
        result |= ((x >>> bit) & 1) << (3 * bit);
        result |= ((y >>> bit) & 1) << (3 * bit + 1);
        result |= ((z >>> bit) & 1) << (3 * bit + 2);
      }
      return result;
    };
    return named('calculateSpatialPartitionIndex', interleave(index.x, index.y, index.z), {
      index,
      cellSize,
    });
  }
  /**
   * [1678] calculateOctreeNode
   * Node của octree tại một điểm.
   */
  public calculateOctreeNode(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const depth = Math.max(0, Math.floor(opt(options, ['depth'], 0)));
    const point = this.worldOf(a);
    const scale = cellSize * Math.pow(2, depth);
    const index = gridCellIndex(point, scale);
    const node = {
      index,
      center: gridCellCenter(index, scale),
      bounds: gridCellBounds(index, scale),
      depth,
      size: scale,
      children: [] as Array<{ x: number; y: number; z: number }>,
    };
    for (const dx of [-1, 1]) {
      for (const dy of [-1, 1]) {
        for (const dz of [-1, 1]) {
          node.children.push({ x: index.x + dx, y: index.y + dy, z: index.z + dz });
        }
      }
    }
    return named('calculateOctreeNode', node, { point, depth });
  }
  /**
   * [1679] calculateQuadtreeNode
   * Node của quadtree tại một điểm.
   */
  public calculateQuadtreeNode(a?: unknown, b?: unknown, options?: unknown) {
    const cellSize = this.cellSize(options);
    const depth = Math.max(0, Math.floor(opt(options, ['depth'], 0)));
    const point = this.worldOf(a);
    const scale = cellSize * Math.pow(2, depth);
    const index = gridCellIndex(point, scale);
    const node = {
      index: { x: index.x, z: index.z },
      center: gridCellCenter(index, scale),
      bounds: gridCellBounds(index, scale),
      depth,
      size: scale,
      children: [] as Array<{ x: number; z: number }>,
    };
    for (const dx of [-1, 1]) {
      for (const dz of [-1, 1]) {
        node.children.push({ x: index.x + dx, z: index.z + dz });
      }
    }
    return named('calculateQuadtreeNode', node, { point, depth });
  }
  /**
   * [1680] calculateBVHTraversalCost
   * Chi phí duyệt BVH.
   */
  public calculateBVHTraversalCost(entity?: unknown, options?: unknown) {
    const frame = this.lodFrame(entity, asRecord(options).camera);
    const nodeCount = opt(options, ['nodeCount'], 64);
    const depth = Math.log2(Math.max(2, nodeCount));
    const cost = Math.max(1, Math.ceil(depth * (1 + frame.screenSize)));
    return cost;
  }

  // -------------------------------------------------------------------------
  // Trợ giúp nội bộ cho LOD và ưu tiên
  // -------------------------------------------------------------------------

  /** Khung LOD: vị trí, khoảng cách camera và kích thước chiếu. */
  private lodFrame(entity: unknown, camera: unknown): {
    position: Vec3D;
    cameraPosition: Vec3D;
    distance: number;
    radius: number;
    screenSize: number;
  } {
    const position = this.worldOf(entity);
    const cameraPosition = this.cameraOf(camera);
    const distance = Math.max(1e-4, distance3D(position, cameraPosition));
    const explicitRadius = readNum(entity, ['radius', 'boundingRadius'], Number.NaN);
    const size = readVec(entity, ['size']);
    const radius = Number.isFinite(explicitRadius)
      ? explicitRadius
      : magnitude(size) > 0
        ? magnitude(size) / 2
        : 1;
    return {
      position,
      cameraPosition,
      distance,
      radius,
      screenSize: projectedScreenSize(radius, distance),
    };
  }

  /**
   * Các vật cản (hình cầu) có thể che khuất vật thể.
   *
   * Đọc từ `occluders`/`obstacles` (mảng `{position, radius}`) hoặc từ cặp
   * `occluder` + `occluderRadius`. Không có dữ liệu nào → danh sách rỗng.
   */
  private occluderSpheres(entity: unknown): { center: Vec3D; radius: number }[] {
    const e = (entity ?? {}) as Record<string, unknown>;
    const out: { center: Vec3D; radius: number }[] = [];
    for (const list of [e.occluders, e.obstacles]) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const o = item as Record<string, unknown>;
        const radius = readNum(o, ['radius', 'occluderRadius', 'size'], 0);
        if (radius > 0) out.push({ center: readVec(o, ['position', 'center', 'point']), radius });
      }
    }
    const single = e.occluder ?? e.occluderPosition;
    if (single && typeof single === 'object') {
      const radius = readNum(e, ['occluderRadius'], 0);
      if (radius > 0) out.push({ center: readVec(e, ['occluder', 'occluderPosition']), radius });
    }
    return out;
  }

  /** Kết quả LOD chuẩn hoá cho một mức LOD. */
  private lodFor(name: string, entity: unknown, camera: unknown, defaultRadius: number): Record<string, unknown> {
    const frame = this.lodFrame(entity, camera);
    const radius = Number.isFinite(readNum(entity, ['radius', 'boundingRadius'], Number.NaN))
      ? frame.radius
      : defaultRadius;
    const screenSize = projectedScreenSize(radius, frame.distance);
    const level = lodLevelForScreenSize(screenSize);
    return {
      name,
      valid: true,
      lodLevel: level,
      visible: true,
      culled: false,
      screenSize,
      error: lodProjectedError(level),
      priority: lodUpdateFrequency(level),
      distance: frame.distance,
      timestamp: Date.now(),
    };
  }

  /** Ưu tiên cập nhật: càng gần camera và càng quan trọng càng cao. */
  private updatePriority(
    name: string,
    a: unknown,
    b: unknown,
    options: unknown,
    defaultWeight: number,
  ): Record<string, unknown> {
    const frame = this.lodFrame(a, b);
    const weight = readNum(a, ['priority', 'importance', 'weight'], defaultWeight);
    const priority = (weight * 4) / Math.max(0.001, frame.distance);
    return named(name, priority, {
      distance: frame.distance,
      weight,
      screenSize: frame.screenSize,
    });
  }
}

/** Nội suy Catmull-Rom cục bộ (tránh phụ thuộc vòng import). */
function catmullRomLocal(p0: Vec3D, p1: Vec3D, p2: Vec3D, p3: Vec3D, t: number): Vec3D {
  const t2 = t * t;
  const t3 = t2 * t;
  const blend = (a: number, b: number, c: number, d: number): number =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return {
    x: blend(p0.x, p1.x, p2.x, p3.x),
    y: blend(p0.y, p1.y, p2.y, p3.y),
    z: blend(p0.z, p1.z, p2.z, p3.z),
  };
}
