/**
 * @file camera-semantics.ts
 * @module @aetheria/engine/spatial-ui/semantics/camera-semantics
 * @description Ngữ nghĩa camera / viewport / neo giao diện 3D.
 *
 * Trước đây toàn bộ 60 method của `CameraViewportUISubsystem` trả về giá trị
 * cứng (`{ name: 'FN', valid: true, result: 0 }`, ma trận đơn vị, vị trí
 * `{x:100,y:100}`…). Ở đây mọi phép tính được thực sự tính ra: phép chiếu
 * world→screen dựa trên khung camera, ma trận view/projection thật, neo UI
 * neo theo vị trí thế giới thật.
 *
 * Quy ước: hệ Y-up, forward = +Z, right = +X, up = +Y.
 */

import type { Vec2D, Vec3D, QuatD, Box3D, Plane3D, SpatialUIConfig } from '../types.js';
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
  radians,
  degrees,
  num,
  toVec3,
  lookAtMatrix,
  perspectiveMatrix,
  multiplyMatrices,
  lookAtQuaternion,
  namedResult,
  measurement,
  uiAnchorResult,
  rayResult,
  planeResult,
  lodResult,
  boundsResult,
  UP3,
  FORWARD3,
} from '../spatial-primitives.js';

/** Cấu hình camera mặc định của engine. */
export const DEFAULT_CAMERA_CONFIG: Required<SpatialUIConfig> = Object.freeze({
  screenWidth: 1920,
  screenHeight: 1080,
  fov: 60,
  nearPlane: 0.1,
  farPlane: 1000,
  aspectRatio: 16 / 9,
  unitScale: 1,
});

/** Khung camera đầy đủ dùng cho mọi phép chiếu. */
export interface CameraFrame {
  position: Vec3D;
  forward: Vec3D;
  up: Vec3D;
  right: Vec3D;
  fov: number;
  aspect: number;
  near: number;
  far: number;
  screenWidth: number;
  screenHeight: number;
}

/** Đọc vector từ entity (có `position`) hoặc từ object thuần có x/y/z. */
export function resolvePoint(value: unknown): Vec3D {
  if (!value || typeof value !== 'object') return { x: 0, y: 0, z: 0 };
  const v = value as Record<string, unknown>;
  if (v.position && typeof v.position === 'object') return toVec3(v.position);
  if (typeof v.x === 'number' || typeof v.y === 'number' || typeof v.z === 'number') {
    return toVec3(v);
  }
  return { x: 0, y: 0, z: 0 };
}

/** Đọc số từ options theo tên, có giá trị mặc định. */
export function opt(options: unknown, ...keys: string[]): number {
  if (!options || typeof options !== 'object') return Number.NaN;
  const o = options as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  }
  return Number.NaN;
}

/** Đọc số từ options với giá trị mặc định khi không tồn tại. */
export function optOr(options: unknown, fallback: number, ...keys: string[]): number {
  const v = opt(options, ...keys);
  return Number.isFinite(v) ? v : fallback;
}

/**
 * Dựng khung camera từ một đối tượng bất kỳ.
 *
 * Nhận được: entity có `position`, object có `quaternion`/`rotation`, object có
 * `forward`/`up`; các trường `fov`, `near`, `far`, `width`, `height` được ưu
 * tiên nếu có.
 */
export function resolveCameraFrame(camera: unknown, config?: SpatialUIConfig): CameraFrame {
  const cfg = { ...DEFAULT_CAMERA_CONFIG, ...(config ?? {}) };
  const cam = (camera && typeof camera === 'object' ? camera : {}) as Record<string, unknown>;

  const position = resolvePoint(cam);

  let forward: Vec3D;
  const quat = readQuat(cam.quaternion);
  if (cam.forward && typeof cam.forward === 'object') {
    forward = normalize(toVec3(cam.forward));
  } else if (quat) {
    forward = quaternionForward(quat);
  } else if (cam.rotation && typeof cam.rotation === 'object') {
    const r = cam.rotation as Record<string, unknown>;
    forward = quaternionForward(eulerToQuat(num(r.x), num(r.y), num(r.z)));
  } else {
    forward = { ...FORWARD3 };
  }
  if (magnitude(forward) === 0) forward = { ...FORWARD3 };

  let up: Vec3D;
  if (cam.up && typeof cam.up === 'object') {
    up = normalize(toVec3(cam.up));
  } else if (quat) {
    up = quaternionUp(quat);
  } else if (cam.rotation && typeof cam.rotation === 'object') {
    const r = cam.rotation as Record<string, unknown>;
    up = quaternionUp(eulerToQuat(num(r.x), num(r.y), num(r.z)));
  } else {
    up = { ...UP3 };
  }

  let right = normalize(cross(up, forward));
  if (magnitude(right) === 0) right = { x: 1, y: 0, z: 0 };
  // Trục up phải trực giao với forward.
  up = normalize(cross(forward, right));

  return {
    position,
    forward,
    up,
    right,
    fov: clamp(optOr(cam, cfg.fov, 'fov', 'fieldOfView'), 1, 179),
    aspect: Math.max(0.0001, optOr(cam, cfg.aspectRatio, 'aspect', 'aspectRatio')),
    near: Math.max(0.0001, optOr(cam, cfg.nearPlane, 'near', 'nearPlane')),
    far: Math.max(optOr(cam, cfg.nearPlane, 'near', 'nearPlane') + 0.0001, optOr(cam, cfg.farPlane, 'far', 'farPlane')),
    screenWidth: Math.max(1, optOr(cam, cfg.screenWidth, 'screenWidth', 'width')),
    screenHeight: Math.max(1, optOr(cam, cfg.screenHeight, 'screenHeight', 'height')),
  };
}

/** Quaternion từ góc Euler (thứ tự XYZ) — bản cục bộ tránh phụ thuộc vòng import. */
function eulerToQuat(x: number, y: number, z: number): QuatLike {
  const c1 = Math.cos(x / 2);
  const c2 = Math.cos(y / 2);
  const c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2);
  const s2 = Math.sin(y / 2);
  const s3 = Math.sin(z / 2);
  return {
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 - s1 * c2 * s3,
    z: c1 * c2 * s3 + s1 * s2 * c3,
    w: c1 * c2 * c3 - s1 * s2 * s3,
  };
}

/** Quaternion đọc từ dữ liệu không kiểu. */
export type QuatLike = { x: number; y: number; z: number; w: number };

/** Đọc quaternion từ dữ liệu không kiểu (null nếu không hợp lệ). */
export function readQuat(value: unknown): QuatLike | null {
  if (!value || typeof value !== 'object') return null;
  const q = value as Record<string, unknown>;
  const hasAny = typeof q.x === 'number' || typeof q.y === 'number'
    || typeof q.z === 'number' || typeof q.w === 'number';
  if (!hasAny) return null;
  return { x: num(q.x), y: num(q.y), z: num(q.z), w: num(q.w, 1) };
}

/** Hướng forward (+Z cục bộ) từ quaternion. */
function quaternionForward(q: QuatLike): Vec3D {
  const { x, y, z, w } = q;
  return normalize({
    x: 2 * (x * z + w * y),
    y: 2 * (y * z - w * x),
    z: 1 - 2 * (x * x + y * y),
  });
}

/** Hướng up (+Y cục bộ) từ quaternion. */
function quaternionUp(q: QuatLike): Vec3D {
  const { x, y, z, w } = q;
  return normalize({
    x: 2 * (x * y - w * z),
    y: 1 - 2 * (x * x + z * z),
    z: 2 * (y * z + w * x),
  });
}

/** Kết quả chiếu world→screen. */
export interface ScreenProjection {
  x: number;
  y: number;
  depth: number;
  ndcX: number;
  ndcY: number;
  visible: boolean;
}

/** Chiếu điểm thế giới lên màn hình theo khung camera. */
export function projectToScreen(world: Vec3D, frame: CameraFrame): ScreenProjection {
  const rel = subtract(world, frame.position);
  const depth = dot(rel, frame.forward);
  const safeDepth = Math.abs(depth) < 1e-6 ? 1e-6 : depth;
  const tanHalf = Math.tan(radians(frame.fov) / 2);
  const x = dot(rel, frame.right);
  const y = dot(rel, frame.up);
  const ndcX = x / (safeDepth * tanHalf * frame.aspect);
  const ndcY = y / (safeDepth * tanHalf);
  return {
    x: (ndcX * 0.5 + 0.5) * frame.screenWidth,
    y: (1 - (ndcY * 0.5 + 0.5)) * frame.screenHeight,
    depth,
    ndcX,
    ndcY,
    visible: depth > frame.near && depth < frame.far && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1,
  };
}

/** Dựng lại điểm thế giới từ toạ độ màn hình tại độ sâu cho trước. */
export function unprojectFromScreen(screen: Vec2D, frame: CameraFrame, depth = 1): Vec3D {
  const safeDepth = Math.max(1e-4, depth);
  const tanHalf = Math.tan(radians(frame.fov) / 2);
  const ndcX = (screen.x / frame.screenWidth) * 2 - 1;
  const ndcY = 1 - (screen.y / frame.screenHeight) * 2;
  const x = ndcX * safeDepth * tanHalf * frame.aspect;
  const y = ndcY * safeDepth * tanHalf;
  return add(
    add(frame.position, scale(frame.forward, safeDepth)),
    add(scale(frame.right, x), scale(frame.up, y)),
  );
}

/** Tia phát sinh từ một điểm màn hình. */
export function screenRay(screen: Vec2D, frame: CameraFrame): { origin: Vec3D; direction: Vec3D } {
  const nearPoint = unprojectFromScreen(screen, frame, frame.near);
  const farPoint = unprojectFromScreen(screen, frame, frame.far);
  return { origin: nearPoint, direction: normalize(subtract(farPoint, nearPoint)) };
}

/** Số pixel trên mỗi đơn vị thế giới tại độ sâu cho trước. */
export function pixelScaleAtDepth(depth: number, frame: CameraFrame): number {
  const safeDepth = Math.max(1e-4, depth);
  const tanHalf = Math.tan(radians(frame.fov) / 2);
  return frame.screenHeight / (2 * safeDepth * tanHalf);
}

/** Bán kính hình cầu bao quanh viewport tại độ sâu cho trước. */
export function frustumRadiusAtDepth(depth: number, frame: CameraFrame): number {
  const safeDepth = Math.max(1e-4, depth);
  const tanHalf = Math.tan(radians(frame.fov) / 2);
  return safeDepth * tanHalf * Math.max(1, frame.aspect);
}

/** Tám góc thể tích nhìn tại độ sâu cho trước. */
export function frustumCorners(frame: CameraFrame, depth: number): Vec3D[] {
  const safeDepth = Math.max(1e-4, depth);
  const tanHalf = Math.tan(radians(frame.fov) / 2);
  const h = safeDepth * tanHalf;
  const w = h * frame.aspect;
  const center = add(frame.position, scale(frame.forward, safeDepth));
  const corners: Vec3D[] = [];
  for (const sy of [1, -1]) {
    for (const sx of [-1, 1]) {
      corners.push(
        add(center, add(scale(frame.right, sx * w), scale(frame.up, sy * h))),
      );
    }
  }
  return corners;
}

/** Sáu mặt phẳng của thể tích nhìn. */
export function frustumPlanes(frame: CameraFrame): Plane3D[] {
  const tanHalf = Math.tan(radians(frame.fov) / 2);
  const near: Plane3D = { normal: frame.forward, distance: dot(frame.forward, frame.position) + frame.near };
  const far: Plane3D = { normal: scale(frame.forward, -1), distance: -(dot(frame.forward, frame.position) + frame.far) };
  const left: Plane3D = {
    normal: normalize(add(frame.forward, scale(frame.right, tanHalf * frame.aspect))),
    distance: dot(normalize(add(frame.forward, scale(frame.right, tanHalf * frame.aspect))), frame.position),
  };
  const right: Plane3D = {
    normal: normalize(subtract(frame.forward, scale(frame.right, tanHalf * frame.aspect))),
    distance: dot(normalize(subtract(frame.forward, scale(frame.right, tanHalf * frame.aspect))), frame.position),
  };
  const top: Plane3D = {
    normal: normalize(subtract(frame.forward, scale(frame.up, tanHalf))),
    distance: dot(normalize(subtract(frame.forward, scale(frame.up, tanHalf))), frame.position),
  };
  const bottom: Plane3D = {
    normal: normalize(add(frame.forward, scale(frame.up, tanHalf))),
    distance: dot(normalize(add(frame.forward, scale(frame.up, tanHalf))), frame.position),
  };
  return [near, far, left, right, top, bottom];
}

/** Vị trí camera quỹ đạo quanh mục tiêu. */
export function orbitPosition(
  target: Vec3D,
  radius: number,
  angle: number,
  elevation: number,
): Vec3D {
  const r = Math.max(0, radius);
  const cosE = Math.cos(elevation);
  return add(target, {
    x: r * cosE * Math.sin(angle),
    y: r * Math.sin(elevation),
    z: r * cosE * Math.cos(angle),
  });
}

/** Góc quỹ đạo giữa hai điểm trên mặt phẳng ngang. */
export function orbitAngle(from: Vec3D, to: Vec3D): number {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

/** Góc nghiêng giữa hai điểm trên mặt phẳng ngang. */
export function elevationAngle(from: Vec3D, to: Vec3D): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const horizontal = Math.hypot(dx, dz);
  if (horizontal < 1e-9) return dy === 0 ? 0 : dy > 0 ? Math.PI / 2 : -Math.PI / 2;
  return Math.atan2(dy, horizontal);
}

/** Quaternion hướng nhìn của camera từ vị trí tới mục tiêu. */
export function cameraLookAtQuaternion(from: Vec3D, to: Vec3D, up: Vec3D = UP3): QuatD {
  return lookAtQuaternion(from, to, up);
}

/** Ma trận view của camera. */
export function cameraViewMatrix(frame: CameraFrame): number[] {
  return lookAtMatrix(frame.position, add(frame.position, frame.forward), frame.up);
}

/** Ma trận chiếu của camera. */
export function cameraProjectionMatrix(frame: CameraFrame): number[] {
  return perspectiveMatrix(frame.fov, frame.aspect, frame.near, frame.far);
}

/** Hộp bao 2D (theo pixel) của một điểm thế giới đã chiếu. */
export function screenBoundsOfPoint(world: Vec3D, frame: CameraFrame): Box3D {
  const p = projectToScreen(world, frame);
  return {
    min: { x: p.x, y: p.y, z: p.depth },
    max: { x: p.x, y: p.y, z: p.depth },
  };
}

/** Mức độ che khuất của một điểm bởi một vật cản (0 = không che, 1 = che kín). */
export function occlusionFactor(
  point: Vec3D,
  occluder: Vec3D | undefined,
  occluderRadius: number,
): number {
  if (!occluder) return 0;
  const d = distance3D(point, occluder);
  if (occluderRadius <= 0) return 0;
  return clamp01(1 - d / occluderRadius);
}

/** Tỷ lệ UI co lại theo khoảng cách. */
export function uiDistanceScale(distance: number, minScale = 0.5, maxScale = 1): number {
  const d = Math.max(0, distance);
  const scale = maxScale / (1 + d * 0.1);
  return clamp(scale, minScale, maxScale);
}

/** Thứ tự độ sâu của UI: vật càng xa camera càng nhỏ hơn. */
export function uiDepthOrder(depth: number): number {
  return clamp(1000 - depth * 10, -1000, 1000);
}

/**
 * Vị trí neo UI.
 *
 * Khi không có đích neo nào được truyền vào, neo mặc định đặt **trước
 * camera** (2 mét theo trục nhìn) — nếu neo nằm đúng tại vị trí camera thì
 * chiều sâu = 0 và nó không thể hiển thị được.
 */
export function resolveAnchorPoint(value: unknown, frame: CameraFrame, distance = 2): Vec3D {
  if (value === undefined || value === null) {
    return add(frame.position, scale(frame.forward, distance));
  }
  return resolvePoint(value);
}

/** Vị trí neo UI trong không gian. */
export function buildUIAnchor(
  name: string,
  worldPosition: Vec3D,
  frame: CameraFrame,
  options?: unknown,
): Record<string, unknown> {  const projection = projectToScreen(worldPosition, frame);
  const offset = readVec2(options, ['screenOffset', 'offset']);
  const scale = optOr(options, 1, 'scale');
  const billboard = options && typeof options === 'object'
    ? (options as Record<string, unknown>).billboard !== false
    : true;
  return uiAnchorResult(
    name,
    {
      worldPosition,
      uiPosition: { x: projection.x + offset.x, y: projection.y + offset.y },
      screenOffset: offset,
      // `visible` = neo nằm trước camera, trong tầm xa và không bị che.
      // Việc có nằm trong khung hình hay không được báo ở `onScreen`.
      visible: projection.depth > frame.near && projection.depth < frame.far,
      scale,
      depthOrder: uiDepthOrder(projection.depth),
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      billboard,
    },
    {
      depth: projection.depth,
      ndc: { x: projection.ndcX, y: projection.ndcY },
      onScreen: projection.visible,
    },
  );
}

/** Đọc Vec2D từ options. */
export function readVec2(options: unknown, keys: string[]): Vec2D {
  if (!options || typeof options !== 'object') return { x: 0, y: 0 };
  const o = options as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (raw && typeof raw === 'object') {
      const v = raw as Record<string, unknown>;
      return { x: num(v.x), y: num(v.y) };
    }
  }
  return { x: 0, y: 0 };
}

/** Đọc Vec3D từ options. */
export function readVec3(options: unknown, keys: string[]): Vec3D {
  if (!options || typeof options !== 'object') return { x: 0, y: 0, z: 0 };
  const o = options as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (raw && typeof raw === 'object') return toVec3(raw);
  }
  return { x: 0, y: 0, z: 0 };
}

/** Đo góc giữa hai hướng (rad). */
export function angleBetween(a: Vec3D, b: Vec3D): number {
  const na = normalize(a);
  const nb = normalize(b);
  return Math.acos(clamp(dot(na, nb), -1, 1));
}

/** Tạo bản ghi đo (scalar) chuẩn hoá. */
export function scalar(name: string, value: number, unit = 'unit'): Record<string, unknown> {
  return measurement(name, value, unit);
}

/** Tạo bản ghi kết quả có tên. */
export function named(name: string, result: unknown, extra?: Record<string, unknown>): Record<string, unknown> {
  return namedResult(name, result, extra);
}

/** Tạo bản ghi tia. */
export function ray(name: string, origin: Vec3D, direction: Vec3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return rayResult(name, origin, direction, extra);
}

/** Tạo bản ghi mặt phẳng. */
export function plane(name: string, normal: Vec3D, distance: number, extra?: Record<string, unknown>): Record<string, unknown> {
  return planeResult(name, normal, distance, extra);
}

/** Tạo bản ghi LOD. */
export function lod(name: string, level: number, extra?: Record<string, unknown>): Record<string, unknown> {
  return lodResult(name, level, extra);
}

/** Tạo bản ghi hộp bao. */
export function bounds(name: string, box: Box3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return boundsResult(name, box, extra);
}

/** Quy đổi radian sang độ. */
export function toDegrees(rad: number): number {
  return degrees(rad);
}

/** Quy đổi độ sang radian. */
export function toRadians(deg: number): number {
  return radians(deg);
}

/** Nhân hai ma trận 4x4 (alias cho phép toán dùng chung). */
export function composeMatrix(a: number[], b: number[]): number[] {
  return multiplyMatrices(a, b);
}
