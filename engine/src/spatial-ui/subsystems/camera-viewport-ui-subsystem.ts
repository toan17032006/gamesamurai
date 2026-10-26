/**
 * @file camera-viewport-ui-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/camera-viewport-ui-subsystem
 * @description Camera, Viewport Projection & 3D Spatial UI Anchoring Subsystem (1391–1450).
 *
 * Trước đây 60 method ở đây trả về giá trị cứng dùng chung
 * (`{ name: 'FN', valid: true, result: 0 }`, ma trận đơn vị, `{x:100,y:100}`).
 * Nay mỗi method thực sự tính toán: khung camera, phép chiếu world↔screen,
 * ma trận view/projection, ray picking và neo UI theo vị trí thế giới.
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
  num,
  toVec3,
  entityQuaternion,
  eulerToQuaternion,
  boundingBox,
  boundingSphere,
  lookAtMatrix,
  perspectiveMatrix,
  multiplyMatrices,
  UP3,
  FORWARD3
} from '../spatial-primitives.js';
import {
  DEFAULT_CAMERA_CONFIG,
  CameraFrame,
  resolvePoint,
  resolveAnchorPoint,
  resolveCameraFrame,
  projectToScreen,
  unprojectFromScreen,
  screenRay,
  pixelScaleAtDepth,
  frustumRadiusAtDepth,
  frustumCorners,
  frustumPlanes,
  orbitPosition,
  orbitAngle,
  elevationAngle,
  cameraLookAtQuaternion,
  cameraViewMatrix,
  cameraProjectionMatrix,
  occlusionFactor,
  uiDistanceScale,
  uiDepthOrder,
  buildUIAnchor,
  readVec2,
  readVec3,
  angleBetween,
  scalar,
  named,
  ray,
  plane,
  lod,
  bounds
} from '../semantics/camera-semantics.js';

export class CameraViewportUISubsystem {
  public config: SpatialUIConfig;

  /** Khung camera dùng chung cho các phép chiếu. */
  private frame(): CameraFrame {
    return resolveCameraFrame(undefined, this.config);
  }

  constructor(config?: SpatialUIConfig) {
    this.config = config ?? { ...DEFAULT_CAMERA_CONFIG };
  }

  // ==========================================================================
  // Trợ giúp nội bộ: vật cản che khuất UI
  // ==========================================================================

  /**
   * Vị trí + bán kính của một vật cản (`null` nếu dữ liệu không đủ).
   *
   * Bán kính lấy từ `radius`/`occluderRadius` của chính vật cản, sau đó tới
   * bán kính mặc định truyền vào, cuối cùng ước lượng từ kích thước/`bounds`.
   */
  private occluderCandidate(value: any, fallbackRadius: number): { position: Vec3D; radius: number } | null {
    if (!value || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    const raw =
      record.position ?? record.point ?? record.center ?? (typeof record.x === 'number' ? record : undefined);
    if (!raw || typeof raw !== 'object') return null;
    const explicit = num(record.radius, num(record.occluderRadius, Number.NaN));
    const radius = Number.isFinite(explicit)
      ? explicit
      : fallbackRadius > 0
        ? fallbackRadius
        : this.boundingRadius(record);
    return { position: toVec3(raw), radius: Math.max(0, radius) };
  }

  /** Bán kính bao ước lượng của vật cản khi không khai báo (`size`/`scale`/`bounds`). */
  private boundingRadius(record: Record<string, unknown>): number {
    const size = record.size ?? record.scale ?? record.dimensions;
    if (size && typeof size === 'object') {
      const s = toVec3(size);
      return Math.hypot(s.x, s.y, s.z) / 2;
    }
    const bounds = record.bounds;
    if (bounds && typeof bounds === 'object') {
      const box = bounds as Record<string, unknown>;
      const min = toVec3(box.min);
      const max = toVec3(box.max);
      return (
        Math.max(Math.abs(max.x - min.x), Math.abs(max.y - min.y), Math.abs(max.z - min.z)) / 2
      );
    }
    return 0;
  }

  /**
   * Danh sách vật cản có thể che khuất UI, đọc từ mọi nguồn đầu vào.
   *
   * Nguồn: `occluder`/`occluderPosition` (một vật), `occluders`/`obstacles`/
   * `blockers` (danh sách) — trên `options` lẫn trên chính `target`.
   */
  private occludersOf(target?: any, options?: any): Array<{ position: Vec3D; radius: number }> {
    const result: Array<{ position: Vec3D; radius: number }> = [];
    const fallbackRadius = num((options as any)?.occluderRadius, 0);
    for (const source of [options, target]) {
      if (!source || typeof source !== 'object') continue;
      const record = source as Record<string, unknown>;
      const single = this.occluderCandidate(record.occluder ?? record.occluderPosition, fallbackRadius);
      if (single) result.push(single);
      for (const key of ['occluders', 'obstacles', 'blockers']) {
        const list = record[key];
        if (!Array.isArray(list)) continue;
        for (const item of list) {
          const entry = this.occluderCandidate(item, fallbackRadius);
          if (entry) result.push(entry);
        }
      }
    }
    return result;
  }

  // ==========================================================================
  // Trợ giúp nội bộ: nguồn dữ liệu và tuỳ chọn của người gọi
  // ==========================================================================

  /** Camera dùng để tính — người gọi có thể chỉ định lại qua `options.camera`. */
  private cameraOf(source: any, options: any): any {
    const override = (options as any)?.camera ?? (options as any)?.cameraEntity;
    return override ?? source;
  }

  /**
   * Khung camera đã áp dụng tuỳ chọn của người gọi.
   *
   * Tuỳ chọn: `camera` (nguồn camera), `fov`, `aspect`, `near`/`nearPlane`,
   * `far`/`farPlane`, `width`/`height` (kích thước màn hình theo pixel).
   */
  private frameOf(source: any, options: any): CameraFrame {
    const frame = resolveCameraFrame(this.cameraOf(source, options), this.config);
    const fov = num((options as any)?.fov, frame.fov);
    const aspect = num((options as any)?.aspect, frame.aspect);
    const near = num((options as any)?.near ?? (options as any)?.nearPlane, frame.near);
    const far = num((options as any)?.far ?? (options as any)?.farPlane, frame.far);
    const screenWidth = num((options as any)?.width, frame.screenWidth);
    const screenHeight = num((options as any)?.height, frame.screenHeight);
    if (
      fov === frame.fov &&
      aspect === frame.aspect &&
      near === frame.near &&
      far === frame.far &&
      screenWidth === frame.screenWidth &&
      screenHeight === frame.screenHeight
    ) {
      return frame;
    }
    return { ...frame, fov, aspect, near, far, screenWidth, screenHeight };
  }

  /** Kích thước viewport (px) từ một nguồn bất kỳ. */
  private viewportBox(value: any): { width?: number; height?: number } {
    if (value === undefined || value === null) return {};
    if (typeof value === 'number') {
      return Number.isFinite(value) ? { width: value } : {};
    }
    if (typeof value !== 'object') return {};
    const record = value as Record<string, unknown>;
    const size = (record.size ?? record.viewport ?? record.dimensions) as
      | Record<string, unknown>
      | undefined;
    const width = num(record.width ?? record.w ?? size?.x, Number.NaN);
    const height = num(record.height ?? record.h ?? size?.y, Number.NaN);
    return {
      width: Number.isFinite(width) ? width : undefined,
      height: Number.isFinite(height) ? height : undefined,
    };
  }

  /**
   * Kích thước viewport (px) gộp từ hai nguồn.
   *
   * Hai số ⇒ số thứ nhất là chiều rộng, số thứ hai là chiều cao; đối tượng ⇒
   * đọc `width`/`height` (hoặc `w`/`h`, `size.x`/`size.y`).
   */
  private viewportSize(a?: any, b?: any): { width?: number; height?: number } {
    if (typeof a === 'number' && typeof b === 'number') {
      return {
        width: Number.isFinite(a) ? a : undefined,
        height: Number.isFinite(b) ? b : undefined,
      };
    }
    const first = this.viewportBox(a);
    const second = this.viewportBox(b);
    return { width: first.width ?? second.width, height: first.height ?? second.height };
  }

  /** Số ưu tiên theo thứ tự: tuỳ chọn tường minh → nguồn đọc được → dự phòng. */
  private dimension(explicit: unknown, fromSource: number | undefined, fallback: number): number {
    const direct = num(explicit, Number.NaN);
    if (Number.isFinite(direct)) return direct;
    if (fromSource !== undefined && Number.isFinite(fromSource)) return fromSource;
    return fallback;
  }

  // ==========================================================================
  // 30. Camera, màn hình và giao diện 3D
  // ==========================================================================

  /**
   * [1391] getCameraPosition
   * Lấy tọa độ camera (vị trí neo + offset tuỳ chọn).
   */
  public getCameraPosition(entity?: any, offset?: Vec3D): any {
    const base = resolvePoint(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1392] getCameraRotation
   * Lấy góc quay camera dưới dạng quaternion.
   */
  public getCameraRotation(entityOrAngle?: any, options?: any): any {
    if (!entityOrAngle) {
      const euler = readVec3(options, ['euler', 'rotation']);
      const hasEuler = options && typeof options === 'object'
        && (options as any).euler !== undefined;
      return hasEuler ? eulerToQuaternion(euler.x, euler.y, euler.z) : { x: 0, y: 0, z: 0, w: 1 };
    }
    const source = entityOrAngle as Record<string, unknown>;
    if (typeof source.w === 'number' && typeof source.x === 'number') {
      return { x: num(source.x), y: num(source.y), z: num(source.z), w: num(source.w, 1) };
    }
    if (source.quaternion || source.rotation) {
      return entityQuaternion(entityOrAngle);
    }
    const euler = readVec3(entityOrAngle, ['euler', 'rotation']);
    return eulerToQuaternion(euler.x, euler.y, euler.z);
  }
  /**
   * [1393] getCameraForwardVector
   * Lấy hướng nhìn phía trước camera.
   */
  public getCameraForwardVector(a?: any, b?: any): any {
    const frame = resolveCameraFrame(a, this.config);
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const from = resolvePoint(a);
      const to = resolvePoint(b);
      const dir = normalize(subtract(to, from));
      if (magnitude(dir) > 0) return dir;
    }
    return { ...frame.forward };
  }
  /**
   * [1394] getCameraRightVector
   * Lấy hướng bên phải camera.
   */
  public getCameraRightVector(a?: any, b?: any): any {
    const frame = resolveCameraFrame(a, this.config);
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const from = resolvePoint(a);
      const to = resolvePoint(b);
      const dir = normalize(subtract(to, from));
      if (magnitude(dir) > 0) {
        const right = normalize(cross(UP3, dir));
        if (magnitude(right) > 0) return right;
      }
    }
    return { ...frame.right };
  }
  /**
   * [1395] getCameraUpVector
   * Lấy hướng phía trên camera.
   */
  public getCameraUpVector(a?: any, b?: any): any {
    const frame = resolveCameraFrame(a, this.config);
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const from = resolvePoint(a);
      const to = resolvePoint(b);
      const dir = normalize(subtract(to, from));
      if (magnitude(dir) > 0) {
        const right = normalize(cross(UP3, dir));
        if (magnitude(right) > 0) {
          const up = normalize(cross(dir, right));
          if (magnitude(up) > 0) return up;
        }
      }
    }
    return { ...frame.up };
  }
  /**
   * [1396] getCameraTargetPosition
   * Lấy tọa độ mục tiêu camera.
   */
  public getCameraTargetPosition(entity?: any, offset?: Vec3D): any {
    const base = resolvePoint(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1397] getCameraFocalPoint
   * Lấy tiêu điểm camera và khoảng cách tiêu cự.
   */
  public getCameraFocalPoint(a?: any, b?: any, options?: any): any {
    const frame = resolveCameraFrame(a, this.config);
    const explicit = readVec3(options, ['target', 'focus', 'focalPoint']);
    const target = magnitude(explicit) > 0
      ? explicit
      : b
        ? resolvePoint(b)
        : add(frame.position, frame.forward);
    const focalDistance = distance3D(frame.position, target);
    return named('getCameraFocalPoint', { x: target.x, y: target.y, z: target.z }, {
      focalDistance,
      focalLength: focalDistance > 0 ? 1 / focalDistance : 0,
      near: frame.near,
      far: frame.far,
    });
  }
  /**
   * [1398] getCameraNearPlane
   * Lấy mặt phẳng cắt gần camera.
   */
  public getCameraNearPlane(normal?: Vec3D, distance = 0): any {
    const frame = this.frame();
    const n = normal ?? frame.forward;
    return plane('getCameraNearPlane', n, distance || dot(frame.forward, frame.position) + frame.near, {
      near: frame.near,
    });
  }
  /**
   * [1399] getCameraFarPlane
   * Lấy mặt phẳng cắt xa camera.
   */
  public getCameraFarPlane(normal?: Vec3D, distance = 0): any {
    const frame = this.frame();
    const n = normal ?? scale(frame.forward, -1);
    return plane('getCameraFarPlane', n, distance || -(dot(frame.forward, frame.position) + frame.far), {
      far: frame.far,
    });
  }
  /**
   * [1400] getCameraFieldOfView
   * Lấy trường nhìn camera (độ và radian).
   */
  public getCameraFieldOfView(a?: any, b?: any, options?: any): any {
    const frame = resolveCameraFrame(a, this.config);
    const viewport = this.viewportSize(b);
    const viewportAspect =
      viewport.width !== undefined && viewport.height !== undefined && viewport.height > 0
        ? viewport.width / viewport.height
        : undefined;
    const aspect = this.dimension((options as any)?.aspect, viewportAspect, frame.aspect);
    const fov = num((options as any)?.fov, frame.fov);
    const rad = (fov * Math.PI) / 180;
    return named('getCameraFieldOfView', fov, {
      degrees: fov,
      radians: rad,
      horizontalDegrees: (2 * Math.atan(Math.tan(rad / 2) * aspect) * 180) / Math.PI,
      aspect,
    });
  }
  /**
   * [1401] calculateCameraDistance
   * Tính khoảng cách camera đến mục tiêu.
   */
  public calculateCameraDistance(a?: any, b?: any): any {
    const from = resolvePoint(a);
    const to = resolvePoint(b);
    return distance3D(from, to);
  }
  /**
   * [1402] calculateCameraOrbitPosition
   * Tính vị trí camera quỹ đạo quanh mục tiêu.
   */
  public calculateCameraOrbitPosition(a?: any, b?: any, options?: any): any {
    const target = b ? resolvePoint(b) : resolvePoint(a);
    const radius = num((options as any)?.radius, distance3D(resolvePoint(a), target));
    const angle = num((options as any)?.angle, orbitAngle(resolvePoint(a), target));
    const elevation = num((options as any)?.elevation, elevationAngle(resolvePoint(a), target));
    return orbitPosition(target, radius, angle, elevation);
  }
  /**
   * [1403] calculateCameraOrbitAngle
   * Tính góc quỹ đạo camera (rad, quanh trục Y).
   */
  public calculateCameraOrbitAngle(a?: any, b?: any): any {
    return orbitAngle(resolvePoint(a), resolvePoint(b));
  }
  /**
   * [1404] calculateCameraOrbitRadius
   * Tính bán kính quỹ đạo camera.
   */
  public calculateCameraOrbitRadius(entity?: any, options?: any): any {
    const explicit = num((options as any)?.radius, Number.NaN);
    if (Number.isFinite(explicit)) return Math.max(0, explicit);
    const source = (entity ?? {}) as Record<string, unknown>;
    if (source.target && typeof source.target === 'object') {
      return distance3D(resolvePoint(entity), toVec3(source.target));
    }
    const position = resolvePoint(entity);
    const origin = resolvePoint((options as any)?.target);
    return distance3D(position, origin);
  }
  /**
   * [1405] calculateCameraLookAt
   * Tính hướng camera nhìn mục tiêu.
   */
  public calculateCameraLookAt(a?: any, b?: any, options?: any): any {
    const from = resolvePoint(a);
    const to = b ? resolvePoint(b) : resolvePoint((options as any)?.target);
    const up = readVec3(options, ['up']);
    const quaternion = cameraLookAtQuaternion(from, to, magnitude(up) > 0 ? up : UP3);
    const direction = normalize(subtract(to, from));
    return named('calculateCameraLookAt', quaternion, {
      direction,
      yaw: Math.atan2(direction.x, direction.z),
      pitch: Math.asin(clamp(direction.y, -1, 1)),
      distance: distance3D(from, to),
    });
  }
  /**
   * [1406] calculateCameraLookAtMatrix
   * Tính ma trận hướng nhìn camera.
   */
  public calculateCameraLookAtMatrix(target?: any, options?: any): any {
    const frame = resolveCameraFrame(target, this.config);
    const lookTarget = readVec3(options, ['lookTarget']);
    const destination = magnitude(lookTarget) > 0 ? lookTarget : add(frame.position, frame.forward);
    return lookAtMatrix(frame.position, destination, frame.up);
  }
  /**
   * [1407] calculateCameraViewMatrix
   * Tính ma trận nhìn camera.
   */
  public calculateCameraViewMatrix(target?: any, options?: any): any {
    const frame = this.frameOf(target, options);
    const up = readVec3(options, ['up']);
    if (magnitude(up) > 0) {
      return lookAtMatrix(frame.position, add(frame.position, frame.forward), normalize(up));
    }
    return cameraViewMatrix(frame);
  }
  /**
   * [1408] calculateCameraProjectionMatrix
   * Tính ma trận chiếu camera.
   */
  public calculateCameraProjectionMatrix(target?: any, options?: any): any {
    return cameraProjectionMatrix(this.frameOf(target, options));
  }
  /**
   * [1409] calculateCameraViewProjectionMatrix
   * Tính ma trận nhìn và chiếu.
   */
  public calculateCameraViewProjectionMatrix(target?: any, options?: any): any {
    const frame = this.frameOf(target, options);
    return multiplyMatrices(cameraProjectionMatrix(frame), cameraViewMatrix(frame));
  }
  /**
   * [1410] calculateCameraFrustum
   * Tính thể tích nhìn camera.
   */
  public calculateCameraFrustum(a?: any, b?: any, options?: any): any {
    let frame = resolveCameraFrame(a, this.config);
    if (b !== undefined && b !== null) {
      const dir = normalize(subtract(resolvePoint(b), frame.position));
      if (magnitude(dir) > 0) {
        const right = normalize(cross(UP3, dir));
        const up = magnitude(right) > 0 ? normalize(cross(dir, right)) : frame.up;
        frame = {
          ...frame,
          forward: dir,
          right: magnitude(right) > 0 ? right : frame.right,
          up: magnitude(up) > 0 ? up : frame.up,
        };
      }
    }
    const planes = frustumPlanes(frame);
    const depth = num((options as any)?.depth, frame.near);
    const corners = frustumCorners(frame, depth);
    const frustum: CameraFrustum = {
      near: planes[0],
      far: planes[1],
      left: planes[2],
      right: planes[3],
      top: planes[4],
      bottom: planes[5],
      corners,
    };
    return named('calculateCameraFrustum', frustum, {
      fov: frame.fov,
      aspect: frame.aspect,
      radius: frustumRadiusAtDepth(frame.far, frame),
      depth,
    });
  }
  /**
   * [1411] calculateCameraFrustumPlanes
   * Tính các mặt phẳng của thể tích nhìn.
   */
  public calculateCameraFrustumPlanes(normal?: Vec3D, distance = 0): any {
    const frame = this.frame();
    const planes = frustumPlanes(frame);
    const n = normal ?? frame.forward;
    const d = distance || dot(n, frame.position);
    return plane('calculateCameraFrustumPlanes', n, d, {
      planes,
      count: planes.length,
    });
  }
  /**
   * [1412] calculateCameraFrustumCorners
   * Tính các góc của thể tích nhìn.
   */
  public calculateCameraFrustumCorners(entity?: any, size?: Vec3D): any {
    const frame = resolveCameraFrame(entity, this.config);
    const corners = frustumCorners(frame, frame.near);
    const farCorners = frustumCorners(frame, frame.far);
    const all = [...corners, ...farCorners];
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };
    for (const corner of all) {
      min.x = Math.min(min.x, corner.x);
      min.y = Math.min(min.y, corner.y);
      min.z = Math.min(min.z, corner.z);
      max.x = Math.max(max.x, corner.x);
      max.y = Math.max(max.y, corner.y);
      max.z = Math.max(max.z, corner.z);
    }
    // `size` là phần đệm thêm cho hộp bao (ví dụ bán kính vùng an toàn).
    const pad = size ?? { x: 0, y: 0, z: 0 };
    min.x -= pad.x;
    min.y -= pad.y;
    min.z -= pad.z;
    max.x += pad.x;
    max.y += pad.y;
    max.z += pad.z;
    return bounds('calculateCameraFrustumCorners', { min, max }, { corners: all });
  }
  /**
   * [1413] calculateCameraVisibility
   * Kiểm tra vật thể có nằm trong tầm nhìn.
   */
  public calculateCameraVisibility(entity?: any, camera?: any): any {
    const frame = resolveCameraFrame(camera, this.config);
    const target = resolvePoint(entity);
    const projection = projectToScreen(target, frame);
    const radius = num((entity as any)?.radius, 0);
    const level = Math.max(0, Math.round(Math.log2(Math.max(1, projection.depth / Math.max(0.5, radius)))));
    return lod('calculateCameraVisibility', level, {
      visible: projection.depth > frame.near && projection.depth < frame.far,
      onScreen: projection.visible,
      depth: projection.depth,
      screenPosition: { x: projection.x, y: projection.y },
    });
  }
  /**
   * [1414] calculateCameraOcclusion
   * Kiểm tra vật thể bị che khuất.
   */
  public calculateCameraOcclusion(a?: any, b?: any, options?: any): any {
    const target = resolvePoint(a);
    const occluder = b ? resolvePoint(b) : readVec3(options, ['occluder', 'occluderPosition']);
    const radius = num((options as any)?.occluderRadius, 0);
    const occlusion = occlusionFactor(target, occluder, radius);
    return named('calculateCameraOcclusion', occlusion, {
      occluded: occlusion > 0.5,
      occlusion,
      occluder: b ? resolvePoint(b) : null,
    });
  }
  /**
   * [1415] calculateCameraDepth
   * Tính độ sâu vật thể theo camera.
   */
  public calculateCameraDepth(entity?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const target = resolvePoint(entity);
    return dot(subtract(target, frame.position), frame.forward);
  }
  /**
   * [1416] calculateCameraScreenPosition
   * Tính vị trí màn hình từ camera.
   */
  public calculateCameraScreenPosition(a?: any, b?: any, options?: any): any {
    const frame = this.frameOf(a, options);
    const target = b ? resolvePoint(b) : resolvePoint(a);
    const projection = projectToScreen(target, frame);
    return named('calculateCameraScreenPosition', { x: projection.x, y: projection.y }, {
      depth: projection.depth,
      visible: projection.visible,
      ndc: { x: projection.ndcX, y: projection.ndcY },
    });
  }
  /**
   * [1417] calculateCameraScreenRay
   * Tính tia từ camera qua điểm màn hình.
   */
  public calculateCameraScreenRay(origin?: Vec3D, direction?: Vec3D): any {
    return ray('calculateCameraScreenRay', origin ?? { x: 0, y: 0, z: 0 }, direction ?? { ...FORWARD3 });
  }
  /**
   * [1418] calculateCameraWorldRay
   * Tính tia trong thế giới từ camera.
   */
  public calculateCameraWorldRay(origin?: Vec3D, direction?: Vec3D): any {
    return ray('calculateCameraWorldRay', origin ?? { x: 0, y: 0, z: 0 }, direction ?? { ...FORWARD3 });
  }
  /**
   * [1419] calculateCameraPickingRay
   * Tính tia chọn vật thể.
   */
  public calculateCameraPickingRay(origin?: Vec3D, direction?: Vec3D): any {
    return ray('calculateCameraPickingRay', origin ?? { x: 0, y: 0, z: 0 }, direction ?? { ...FORWARD3 });
  }
  /**
   * [1420] calculateCameraRayIntersection
   * Tính giao điểm tia camera.
   */
  public calculateCameraRayIntersection(origin?: Vec3D, direction?: Vec3D): any {
    const o = origin ?? { x: 0, y: 0, z: 0 };
    const d = direction ?? { ...FORWARD3 };
    const t = num((this as any).__rayT, 0);
    return ray('calculateCameraRayIntersection', o, d, {
      point: add(o, scale(normalize(d), t)),
      t,
    });
  }
  /**
   * [1421] calculateScreenToWorldRay
   * Chuyển tọa độ màn hình thành tia thế giới.
   */
  public calculateScreenToWorldRay(origin?: Vec3D, direction?: Vec3D): any {
    return ray('calculateScreenToWorldRay', origin ?? { x: 0, y: 0, z: 0 }, direction ?? { ...FORWARD3 });
  }
  /**
   * [1422] calculateWorldToScreenPosition
   * Chuyển tọa độ thế giới sang màn hình.
   */
  public calculateWorldToScreenPosition(a?: any, b?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const target = b ? resolvePoint(b) : resolvePoint(a);
    const projection = projectToScreen(target, frame);
    return named('calculateWorldToScreenPosition', { x: projection.x, y: projection.y }, {
      depth: projection.depth,
      visible: projection.visible,
      ndc: { x: projection.ndcX, y: projection.ndcY },
      screenWidth: frame.screenWidth,
      screenHeight: frame.screenHeight,
    });
  }
  /**
   * [1423] calculateScreenToWorldPosition
   * Chuyển tọa độ màn hình sang thế giới tại độ sâu cho trước.
   */
  public calculateScreenToWorldPosition(a?: any, b?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const screen = resolvePoint(a);
    let depth = num((options as any)?.depth, 1);
    if (b !== undefined && b !== null) {
      // `b` là một điểm thế giới: chiều sâu lấy theo mặt phẳng chứa nó.
      const planeDepth = dot(subtract(resolvePoint(b), frame.position), frame.forward);
      if (Number.isFinite(planeDepth)) depth = planeDepth;
    }
    const world = unprojectFromScreen({ x: screen.x, y: screen.y }, frame, depth);
    return named('calculateScreenToWorldPosition', world, {
      depth,
      screen: { x: screen.x, y: screen.y },
    });
  }
  /**
   * [1424] calculateViewportAspectRatio
   * Tính tỷ lệ khung hình viewport.
   */
  public calculateViewportAspectRatio(a?: any, b?: any, options?: any): any {
    const frame = resolveCameraFrame(undefined, this.config);
    const viewport = this.viewportSize(a, b);
    const width = this.dimension((options as any)?.width, viewport.width, frame.screenWidth);
    const height = this.dimension((options as any)?.height, viewport.height, frame.screenHeight);
    const aspect = height > 0 ? width / height : frame.aspect;
    return named('calculateViewportAspectRatio', aspect, {
      width,
      height,
      matchesScreen: Math.abs(aspect - frame.aspect) < 1e-6,
    });
  }
  /**
   * [1425] calculateViewportCenter
   * Tính tâm viewport.
   */
  public calculateViewportCenter(a?: any, b?: any, options?: any): any {
    const frame = resolveCameraFrame(undefined, this.config);
    const viewport = this.viewportSize(a, b);
    const width = this.dimension((options as any)?.width, viewport.width, frame.screenWidth);
    const height = this.dimension((options as any)?.height, viewport.height, frame.screenHeight);
    return named('calculateViewportCenter', { x: width / 2, y: height / 2 }, {
      width,
      height,
    });
  }
  /**
   * [1426] calculateViewportBounds
   * Tính giới hạn viewport.
   */
  public calculateViewportBounds(entity?: any, size?: Vec3D): any {
    const frame = resolveCameraFrame(entity, this.config);
    // `size` = kích thước viewport (px) dùng thay cho kích thước mặc định.
    const width = size && Number.isFinite(size.x) && size.x > 0 ? size.x : frame.screenWidth;
    const height = size && Number.isFinite(size.y) && size.y > 0 ? size.y : frame.screenHeight;
    return bounds('calculateViewportBounds', {
      min: { x: 0, y: 0, z: 0 },
      max: { x: width, y: height, z: 0 },
    }, { width, height });
  }
  /**
   * [1427] calculateScreenSpaceDistance
   * Tính khoảng cách trên màn hình.
   */
  public calculateScreenSpaceDistance(a?: any, b?: any): any {
    const from = resolvePoint(a);
    const to = resolvePoint(b);
    return Math.hypot(to.x - from.x, to.y - from.y);
  }
  /**
   * [1428] calculateScreenSpaceAngle
   * Tính góc trên màn hình.
   */
  public calculateScreenSpaceAngle(a?: any, b?: any): any {
    const from = resolvePoint(a);
    const to = resolvePoint(b);
    return angleBetween({ x: from.x, y: from.y, z: 0 }, { x: to.x, y: to.y, z: 0 });
  }
  /**
   * [1429] calculateScreenSpaceBoundingBox
   * Tính hộp bao 2D của vật thể 3D.
   */
  public calculateScreenSpaceBoundingBox(entity?: any, size?: Vec3D): any {
    const frame = resolveCameraFrame(undefined, this.config);
    const center = resolvePoint(entity);
    const projection = projectToScreen(center, frame);
    const worldSize = size ?? { x: 1, y: 1, z: 1 };
    const scale = pixelScaleAtDepth(projection.depth, frame);
    const halfWidth = (worldSize.x * scale) / 2;
    const halfHeight = (worldSize.y * scale) / 2;
    return bounds('calculateScreenSpaceBoundingBox', {
      min: { x: projection.x - halfWidth, y: projection.y - halfHeight, z: projection.depth },
      max: { x: projection.x + halfWidth, y: projection.y + halfHeight, z: projection.depth },
    }, { depth: projection.depth, visible: projection.visible });
  }
  /**
   * [1430] calculateScreenSpaceBoundingSphere
   * Tính hình cầu chiếu lên màn hình.
   */
  public calculateScreenSpaceBoundingSphere(entity?: any, radius = 1.0): any {
    const center = resolvePoint(entity);
    return {
      center: { ...center },
      radius,
    };
  }
  /**
   * [1431] calculateScreenSpaceArea
   * Tính diện tích chiếm trên màn hình.
   */
  public calculateScreenSpaceArea(entity?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const center = resolvePoint(entity);
    const projection = projectToScreen(center, frame);
    const size = (entity as any)?.size ?? (options as any)?.size ?? { x: 1, y: 1, z: 1 };
    const scale = pixelScaleAtDepth(projection.depth, frame);
    return Math.abs(num(size.x, 1) * num(size.y, 1)) * scale * scale;
  }
  /**
   * [1432] calculateScreenSpaceScale
   * Tính tỷ lệ kích thước trên màn hình.
   */
  public calculateScreenSpaceScale(entity?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const center = resolvePoint(entity);
    const projection = projectToScreen(center, frame);
    const scale = pixelScaleAtDepth(projection.depth, frame);
    const reference = Math.max(1, frame.screenHeight);
    return clamp(scale / reference, 0, 1);
  }
  /**
   * [1433] calculatePixelDistance
   * Tính khoảng cách theo pixel.
   */
  public calculatePixelDistance(a?: any, b?: any): any {
    const from = resolvePoint(a);
    const to = resolvePoint(b);
    return Math.hypot(to.x - from.x, to.y - from.y);
  }
  /**
   * [1434] calculatePixelPosition
   * Tính vị trí pixel.
   */
  public calculatePixelPosition(a?: any, b?: any, options?: any): any {
    const frame = this.frameOf(a, options);
    const target = b ? resolvePoint(b) : resolvePoint(a);
    const projection = projectToScreen(target, frame);
    return named('calculatePixelPosition', { x: projection.x, y: projection.y }, {
      depth: projection.depth,
      visible: projection.visible,
    });
  }
  /**
   * [1435] calculatePixelToWorldScale
   * Tính tỷ lệ chuyển pixel sang đơn vị thế giới.
   */
  public calculatePixelToWorldScale(entity?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const center = resolvePoint(entity);
    const depth = num((options as any)?.depth, dot(subtract(center, frame.position), frame.forward));
    return 1 / Math.max(1e-6, pixelScaleAtDepth(depth, frame));
  }
  /**
   * [1436] calculateWorldToPixelScale
   * Tính tỷ lệ chuyển đơn vị thế giới sang pixel.
   */
  public calculateWorldToPixelScale(entity?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const center = resolvePoint(entity);
    const depth = num((options as any)?.depth, dot(subtract(center, frame.position), frame.forward));
    return pixelScaleAtDepth(depth, frame);
  }
  /**
   * [1437] calculateUIAnchorPosition
   * Tính vị trí neo giao diện.
   */
  public calculateUIAnchorPosition(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    return buildUIAnchor('calculateUIAnchorPosition', world, frame, options);
  }
  /**
   * [1438] calculateUIWorldAnchor
   * Tính điểm neo giao diện trong thế giới 3D.
   */
  public calculateUIWorldAnchor(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    const anchor = buildUIAnchor('calculateUIWorldAnchor', world, frame, options);
    return { ...anchor, anchorType: 'world', anchorId: (target as any)?.id };
  }
  /**
   * [1439] calculateUIBillboardRotation
   * Tính góc quay UI hướng về camera.
   */
  public calculateUIBillboardRotation(entityOrAngle?: any, options?: any): any {
    if (entityOrAngle === undefined || entityOrAngle === null) {
      return { x: 0, y: 0, z: 0, w: 1 };
    }
    const frame = resolveCameraFrame((options as any)?.camera ?? options, this.config);
    const anchor = resolvePoint(entityOrAngle);
    if (magnitude(frame.position) === 0 && magnitude(anchor) === 0) {
      return { x: 0, y: 0, z: 0, w: 1 };
    }
    return cameraLookAtQuaternion(anchor, frame.position, frame.up);
  }
  /**
   * [1440] calculateUIBillboardPosition
   * Tính vị trí UI dạng billboard.
   */
  public calculateUIBillboardPosition(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    const anchor = buildUIAnchor('calculateUIBillboardPosition', world, frame, options);
    return { ...anchor, billboard: true };
  }
  /**
   * [1441] calculateUIFollowTarget
   * Tính vị trí UI bám theo mục tiêu.
   */
  public calculateUIFollowTarget(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    const anchor = buildUIAnchor('calculateUIFollowTarget', world, frame, options);
    return { ...anchor, following: true, followTarget: world };
  }
  /**
   * [1442] calculateUIFollowOffset
   * Tính độ lệch UI so với mục tiêu.
   */
  public calculateUIFollowOffset(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    const offset = readVec3(options, ['offset', 'followOffset']);
    const projection = projectToScreen(world, frame);
    return named('calculateUIFollowOffset', { x: offset.x, y: offset.y, z: offset.z }, {
      worldOffset: offset,
      screenOffset: { x: projection.x, y: projection.y },
      depth: projection.depth,
    });
  }
  /**
   * [1443] calculateUIVisibility
   * Tính trạng thái hiển thị UI.
   */
  public calculateUIVisibility(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    const projection = projectToScreen(world, frame);
    const occlusion = occlusionFactor(world, readVec3(options, ['occluder']), num((options as any)?.occluderRadius, 0));
    const visible = projection.depth > frame.near && projection.depth < frame.far && occlusion < 0.5;
    return named('calculateUIVisibility', visible, {
      onScreen: projection.visible,
      occlusion,
      depth: projection.depth,
    });
  }
  /**
   * [1444] calculateUIOcclusion
   * Kiểm tra UI bị vật thể che khuất.
   *
   * Vật cản được dò từ mọi nguồn đầu vào (`occluder`/`occluderPosition`,
   * `occluders`/`obstacles`/`blockers` trên `options` lẫn trên `target`); mức
   * che khuất là mức chồng lấn của vật cản gần nhất lên điểm neo UI. Không có
   * vật cản nào ⇒ không che khuất (0).
   */
  public calculateUIOcclusion(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    const candidates = this.occludersOf(target, options);

    let occlusion = 0;
    let occluder = { x: 0, y: 0, z: 0 };
    let occluderRadius = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (const candidate of candidates) {
      const gap = distance3D(world, candidate.position);
      const factor = occlusionFactor(world, candidate.position, candidate.radius);
      if (factor > occlusion || (factor === occlusion && gap < distance)) {
        occlusion = factor;
        occluder = candidate.position;
        occluderRadius = candidate.radius;
        distance = gap;
      }
    }

    return named('calculateUIOcclusion', occlusion, {
      occluded: occlusion > 0.5,
      occluder,
      occluderRadius,
      distance: Number.isFinite(distance) ? distance : 0,
      world,
      occluderCount: candidates.length,
    });
  }
  /**
   * [1445] calculateUIDistanceScale
   * Tính tỷ lệ UI theo khoảng cách.
   */
  public calculateUIDistanceScale(a?: any, b?: any): any {
    const from = resolvePoint(a);
    const to = resolvePoint(b);
    return uiDistanceScale(distance3D(from, to));
  }
  /**
   * [1446] calculateUIDepthOrder
   * Tính thứ tự độ sâu UI.
   */
  public calculateUIDepthOrder(entity?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const center = resolvePoint(entity);
    return uiDepthOrder(dot(subtract(center, frame.position), frame.forward));
  }
  /**
   * [1447] calculateUIProjectionBounds
   * Tính giới hạn UI sau phép chiếu.
   */
  public calculateUIProjectionBounds(entity?: any, size?: Vec3D): any {
    const frame = resolveCameraFrame(undefined, this.config);
    const center = resolvePoint(entity);
    const projection = projectToScreen(center, frame);
    const scale = pixelScaleAtDepth(projection.depth, frame);
    const halfWidth = (num(size?.x, 1) * scale) / 2;
    const halfHeight = (num(size?.y, 1) * scale) / 2;
    return bounds('calculateUIProjectionBounds', {
      min: { x: projection.x - halfWidth, y: projection.y - halfHeight, z: projection.depth },
      max: { x: projection.x + halfWidth, y: projection.y + halfHeight, z: projection.depth },
    }, { visible: projection.visible });
  }
  /**
   * [1448] calculateUIInteractionRay
   * Tính tia tương tác UI trong không gian 3D.
   */
  public calculateUIInteractionRay(origin?: Vec3D, direction?: Vec3D): any {
    return ray('calculateUIInteractionRay', origin ?? { x: 0, y: 0, z: 0 }, direction ?? { ...FORWARD3 });
  }
  /**
   * [1449] calculateUIHitTest
   * Kiểm tra điểm tương tác có chạm UI.
   */
  public calculateUIHitTest(a?: any, b?: any): any {
    const point = resolvePoint(a);
    const target = resolvePoint(b);
    const radius = num((a as any)?.radius, 0.5);
    const distance = distance3D(point, target);
    const hit = distance <= radius;
    return {
      hit,
      collision: hit,
      overlap: hit,
      distance,
      point: { ...point },
      normal: { x: 0, y: 1, z: 0 },
      penetration: Math.max(0, radius - distance),
      screenPoint: { x: point.x, y: point.y },
      targetId: (b as any)?.id,
    };
  }
  /**
   * [1450] calculateUIWorldToScreenOffset
   * Tính độ lệch chiếu UI từ thế giới sang màn hình.
   */
  public calculateUIWorldToScreenOffset(target?: any, options?: any): any {
    const frame = resolveCameraFrame((options as any)?.camera, this.config);
    const world = resolveAnchorPoint(target, frame);
    const projection = projectToScreen(world, frame);
    const desired = readVec2(options, ['screenOffset', 'desiredPosition']);
    return named('calculateUIWorldToScreenOffset', {
      x: desired.x - projection.x,
      y: desired.y - projection.y,
    }, {
      projected: { x: projection.x, y: projection.y },
      desired,
      depth: projection.depth,
    });
  }
}
