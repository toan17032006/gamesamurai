/**
 * @file skeletal-kinematics-character-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/skeletal-kinematics-character-subsystem
 * @description Skeletal Kinematics, IK, Animation & Character Subsystem (0951–1100).
 *
 * Trước đây 150 method ở đây trả về `{ name: 'FN', valid: true, result: 0 }`
 * cho 62 method, `1.0` cho 19 method, `{x:0,y:0,z:0}` cho 18 method và ma trận
 * đơn vị cho 3 method. Nay mọi phép tính được thực sự thực hiện trên một mô
 * hình xương thật: cây xương, động học tiền/ngược, đường cong animation và
 * vật lý nhân vật.
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
  scale as scaleVec,
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
  toVec3,
  entityPosition,
  entityQuaternion,
  entityForward,
  eulerToQuaternion,
  quaternionToEuler,
  normalizeQuaternion,
  multiplyQuaternions,
  invertQuaternion,
  slerpQuaternion,
  lookAtQuaternion,
  rotateAroundAxis,
  rotationBetweenVectors,
  boundingBox,
  boundingSphere,
  distanceBetweenBoxes,
  boxesOverlap,
  distanceToSegment,
  UP3,
  FORWARD3,
  RIGHT3
} from '../spatial-primitives.js';
import {
  BoneDesc,
  PoseMap,
  CHARACTER_DIMENSIONS,
  readNum,
  readVec,
  readQuat,
  worldPoint,
  rotateVec,
  buildSkeleton,
  walkSkeleton,
  findBone,
  allBones,
  forwardKinematics,
  hierarchyDepth,
  chainLength,
  boneEndpoints,
  boneDirection,
  readPose,
  blendPoses,
  poseDifference,
  poseSimilarity,
  ikWeights,
  twoBoneIK,
  threeBoneIK,
  fullBodyIK,
  CurveKey,
  readCurveKeys,
  curveValue,
  curveDerivative,
  curveIntegral,
  characterSpeed,
  characterVelocity,
  characterAcceleration,
  jumpVelocityForHeight,
  stoppingDistance,
  fallKinematics,
  named,
  scalar,
  direction as directionRecord,
  orientation,
  bounds,
  collide,
  angleAroundAxis,
  angleBetween,
  trsMatrix,
  aimQuaternion,
  alignQuaternion,
  eulerOf
} from '../semantics/kinematics-semantics.js';

export class SkeletalKinematicsCharacterSubsystem {
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
  // Bộ tuỳ chọn thống nhất (options.scale / unit / reference / invert / side /
  // bone / entity)
  //
  // Mọi method bên dưới đều đọc cùng một bộ khoá. Không truyền `options` thì
  // kết quả y hệt trước đây (hệ số 1, không đảo dấu, khung world, đơn vị mặc định).
  // -------------------------------------------------------------------------

  /** Hệ số nhân từ `options.scale` (mặc định 1). */
  private scaleOf(options?: unknown): number {
    const raw = readNum(options, ['scale'], Number.NaN);
    return Number.isFinite(raw) ? raw : 1;
  }

  /** Đơn vị trả về do `options.unit` chỉ định (null nếu không chỉ định). */
  private unitOf(options?: unknown): string | null {
    const raw = options && typeof options === 'object'
      ? (options as Record<string, unknown>).unit
      : undefined;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  }

  /** Đơn vị trả về: `options.unit` ghi đè đơn vị mặc định. */
  private unitWithFallback(options: unknown, fallback: string): string {
    return this.unitOf(options) ?? fallback;
  }

  /** Có đảo dấu kết quả số theo `options.invert` không. */
  private invertOf(options?: unknown): boolean {
    return Boolean(
      options
      && typeof options === 'object'
      && (options as Record<string, unknown>).invert === true,
    );
  }

  /** Khung tham chiếu: 'world' (mặc định) hoặc 'local'. */
  private referenceOf(options?: unknown): 'world' | 'local' {
    const raw = options && typeof options === 'object'
      ? (options as Record<string, unknown>).reference
      : undefined;
    return raw === 'local' ? 'local' : 'world';
  }

  /** Bên trái/phải theo `options.side` (null nếu không chỉ định). */
  private sideOf(options?: unknown): 'left' | 'right' | null {
    const raw = options && typeof options === 'object'
      ? (options as Record<string, unknown>).side
      : undefined;
    if (raw === 'left' || raw === 'right') return raw;
    return null;
  }

  /** Số kết quả: nhân `options.scale` rồi đảo dấu nếu `options.invert`. */
  private transformedNumber(value: number, options?: unknown): number {
    const sign = this.invertOf(options) ? -1 : 1;
    return value * this.scaleOf(options) * sign;
  }

  /** Số kết quả chỉ đảo dấu nếu `options.invert` (không nhân hệ số). */
  private invertedNumber(value: number, options?: unknown): number {
    return this.invertOf(options) ? -value : value;
  }

  /** Vector kết quả: nhân `options.scale` rồi đảo dấu nếu `options.invert`. */
  private transformedVector(value: Vec3D, options?: unknown): Vec3D {
    const factor = this.scaleOf(options);
    const sign = this.invertOf(options) ? -1 : 1;
    return {
      x: value.x * factor * sign,
      y: value.y * factor * sign,
      z: value.z * factor * sign,
    };
  }

  /** Quaternion nghịch đảo (xoay ngược) khi `options.invert`. */
  private transformedQuaternion(value: QuatD, options?: unknown): QuatD {
    return this.invertOf(options)
      ? { x: -value.x, y: -value.y, z: -value.z, w: value.w }
      : value;
  }

  /** Entity thay thế để tính: `options.entity` ghi đè entity đầu vào. */
  private entityOf(entity: unknown, options?: unknown) {
    const raw = options && typeof options === 'object'
      ? (options as Record<string, unknown>).entity
      : undefined;
    return raw !== undefined && raw !== null ? raw : entity;
  }

  /** Điểm kết quả theo khung tham chiếu: 'local' → tương đối `origin`. */
  private referencePoint(result: Vec3D, origin: Vec3D, options?: unknown): Vec3D {
    return this.referenceOf(options) === 'local' ? subtract(result, origin) : result;
  }

  /**
   * Tên xương do `options.bone` yêu cầu, đã áp `options.side` (trái/phải).
   *
   * CHỈ đọc từ `options` — không suy ra từ entity, để hành vi mặc định (khi
   * không truyền `options`) giữ nguyên như trước.
   */
  private optionBoneName(options: unknown): string | undefined {
    const explicit = this.firstText([options], ['bone', 'boneName']);
    const side = this.sideOf(options);
    return explicit && side ? this.sidedBoneName(explicit, side) : explicit ?? undefined;
  }

  /**
   * Tên xương theo bên: 'hand' → 'hand_L' (trái) / 'hand_R' (phải),
   * 'LeftHand' → 'RightHand' khi đổi bên.
   */
  private sidedBoneName(name: string, side: 'left' | 'right'): string {
    const suffix = side === 'left' ? '_L' : '_R';
    const other = side === 'left' ? '_R' : '_L';
    if (name.endsWith(other)) return `${name.slice(0, name.length - other.length)}${suffix}`;
    if (name.endsWith(suffix)) return name;
    if (/^left/i.test(name)) return `Right${name.slice(4)}`;
    if (/^right/i.test(name)) return `Left${name.slice(5)}`;
    return `${name}${suffix}`;
  }

  /**
   * Nguồn xương chính: `options.entity` ghi đè, không thì `a` (khi có cây
   * xương), rồi `b` (nguồn dữ liệu thứ hai).
   */
  private boneSource(a: unknown, b: unknown, options?: unknown) {
    const override = this.entityOf(a, options);
    if (override !== a) return override;
    if (this.skeletonOf(a)) return a;
    if (this.skeletonOf(b)) return b;
    return a;
  }

  /**
   * Hướng nhìn của nhân vật: `a` trước, `b` là nguồn thứ hai khi `a` không
   * có hướng tường minh.
   */
  private characterForwardOf(a: unknown, b: unknown): Vec3D {
    const explicit = readVec(a, ['forward', 'direction']);
    if (magnitude(explicit) > 0) return explicit;
    const fromB = readVec(b, ['forward', 'direction']);
    if (magnitude(fromB) > 0) return fromB;
    const forward = entityForward(a);
    return magnitude(forward) > 0 ? forward : FORWARD3;
  }

  // -------------------------------------------------------------------------
  // Trợ giúp nội bộ
  // -------------------------------------------------------------------------

  /** Cây xương từ dữ liệu. */
  private skeletonOf(source: unknown): BoneDesc | undefined {
    return buildSkeleton(source);
  }

  /** Danh sách xương từ dữ liệu. */
  private bonesOf(source: unknown): BoneDesc[] {
    return allBones(this.skeletonOf(source));
  }

  /** Xương được chỉ định (theo tên trong `options.bone` hoặc chính entity). */
  private boneOf(source: unknown, names?: string[]): BoneDesc | undefined {
    const skeleton = this.skeletonOf(source);
    const wanted = names ?? [];
    if (skeleton) {
      for (const name of wanted) {
        const found = findBone(skeleton, name);
        if (found) return found;
      }
      if (wanted.length === 0) return skeleton;
    }
    const o = (source ?? {}) as Record<string, unknown>;
    if (typeof o.bone === 'string') return findBone(skeleton, o.bone);
    return undefined;
  }

  /** Vị trí thế giới của các xương. */
  private worldPositions(source: unknown): Record<string, Vec3D> {
    return forwardKinematics(this.skeletonOf(source));
  }

  /** Vị trí thế giới của một xương cụ thể (hoặc vị trí entity). */
  private boneWorld(source: unknown, names: string[]): Vec3D {
    const positions = this.worldPositions(source);
    for (const name of names) {
      const found = positions[name];
      if (found) return found;
    }
    const bone = this.boneOf(source, names);
    if (bone) {
      const endpoints = boneEndpoints(bone);
      return endpoints.end;
    }
    return worldPoint(source);
  }

  /** Kích thước xương (chiều dài). */
  private lengthOf(source: unknown, names: string[], fallback: number): number {
    const bone = this.boneOf(source, names);
    if (bone && bone.length > 0) return bone.length;
    const explicit = readNum(source, ['length', 'boneLength'], Number.NaN);
    if (Number.isFinite(explicit)) return explicit;
    return fallback;
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

  /** Chuỗi không rỗng đầu tiên tìm được trong danh sách nguồn đầu vào. */
  private firstText(sources: unknown[], keys: string[]): string | null {
    for (const source of sources) {
      if (!source || typeof source !== 'object') continue;
      const o = source as Record<string, unknown>;
      for (const key of keys) {
        const raw = o[key];
        if (typeof raw === 'string' && raw.length > 0) return raw;
      }
    }
    return null;
  }

  /** Tên xương/khớp được yêu cầu trong các nguồn đầu vào (`bone`, `boneName`…). */
  private requestedBoneName(sources: unknown[]): string | undefined {
    for (const source of sources) {
      if (!source || typeof source !== 'object') continue;
      const o = source as Record<string, unknown>;
      for (const key of ['bone', 'boneName', 'joint', 'jointName']) {
        const raw = o[key];
        if (typeof raw === 'string' && raw.length > 0) return raw;
      }
    }
    return undefined;
  }

  /** Xương được chỉ định, tìm trong cây xương của các nguồn đầu vào. */
  private resolveBone(sources: unknown[], names: string[]): BoneDesc | undefined {
    for (const source of sources) {
      const skeleton = this.skeletonOf(source);
      if (!skeleton) continue;
      for (const name of names) {
        const found = findBone(skeleton, name);
        if (found) return found;
      }
      if (names.length === 0) return skeleton;
    }
    return undefined;
  }

  /** Tư thế đầy đủ (vị trí + xoay thế giới) của cây xương. */
  private fullPose(source: unknown): PoseMap {
    const skeleton = this.skeletonOf(source);
    if (!skeleton) return {};
    const positions = forwardKinematics(skeleton);
    const rotations: Record<string, QuatD> = {};
    const walk = (bone: BoneDesc, parentRotation: QuatD): void => {
      const world = normalizeQuaternion(multiplyQuaternions(parentRotation, bone.quaternion));
      rotations[bone.name] = world;
      for (const child of bone.children) walk(child, world);
    };
    walk(skeleton, { x: 0, y: 0, z: 0, w: 1 });
    const pose: PoseMap = {};
    for (const [name, position] of Object.entries(positions)) {
      pose[name] = {
        position,
        quaternion: rotations[name] ?? { x: 0, y: 0, z: 0, w: 1 },
      };
    }
    return pose;
  }

  /** Bản sao cây xương với mọi khớp thẳng (xoay = 0) — tư thế nghỉ. */
  private restSkeleton(skeleton: BoneDesc): BoneDesc {
    const clone = (bone: BoneDesc, parent?: BoneDesc): BoneDesc => {
      const copy: BoneDesc = {
        name: bone.name,
        position: bone.position,
        quaternion: { x: 0, y: 0, z: 0, w: 1 },
        scale: bone.scale,
        length: bone.length,
        children: [],
        parent,
      };
      for (const child of bone.children) copy.children.push(clone(child, copy));
      return copy;
    };
    return clone(skeleton);
  }

  /** Tư thế nghỉ (bind pose): cùng cây xương nhưng các khớp thẳng. */
  private restPose(source: unknown): PoseMap {
    const skeleton = this.skeletonOf(source);
    if (!skeleton) return {};
    const positions = forwardKinematics(this.restSkeleton(skeleton));
    const pose: PoseMap = {};
    for (const [name, position] of Object.entries(positions)) {
      pose[name] = { position, quaternion: { x: 0, y: 0, z: 0, w: 1 } };
    }
    return pose;
  }

  /** Tư thế của nguồn: map `pose` rõ ràng, hoặc cây xương có phân cấp. */
  private poseOf(source: unknown): PoseMap {
    if (!source || typeof source !== 'object') return {};
    const o = source as Record<string, unknown>;
    if (o.pose && typeof o.pose === 'object') return readPose(source);
    const skeleton = this.skeletonOf(source);
    if (!skeleton || skeleton.children.length === 0) return {};
    return this.fullPose(source);
  }

  /** Nguồn chứa tư thế thật đầu tiên trong danh sách đầu vào. */
  private poseSource(sources: unknown[]): { source: unknown; pose: PoseMap } | undefined {
    for (const source of sources) {
      const pose = this.poseOf(source);
      if (Object.keys(pose).length > 0) return { source, pose };
    }
    return undefined;
  }

  /**
   * Tư thế tham chiếu: tư thế của nguồn khác nếu có, nếu không thì tư thế nghỉ
   * của chính cây xương hiện tại (đo độ lệch so với tư thế bind).
   */
  private referencePose(sources: unknown[], current: unknown): PoseMap {
    for (const source of sources) {
      if (source === current) continue;
      const pose = this.poseOf(source);
      if (Object.keys(pose).length > 0) return pose;
    }
    return this.restPose(current);
  }

  /**
   * Sai lệch giữa hai tư thế.
   *
   * Xương chỉ có ở một tư thế được coi như tư thế nghỉ (vị trí giữ nguyên,
   * xoay bằng 0) nên sai lệch vẫn phản ánh tư thế thật của cây xương.
   */
  private poseError(a: PoseMap, b: PoseMap): { distance: number; angle: number; bones: string[] } {
    const names = new Set([...Object.keys(a), ...Object.keys(b)]);
    const identity = { x: 0, y: 0, z: 0, w: 1 };
    let distance = 0;
    let angle = 0;
    const bones: string[] = [];
    for (const name of names) {
      const pa = a[name];
      const pb = b[name];
      const base = pa ?? pb;
      if (!base) continue;
      const positionA = pa?.position ?? base.position;
      const positionB = pb?.position ?? base.position;
      const quaternionA = pa?.quaternion ?? identity;
      const quaternionB = pb?.quaternion ?? identity;
      distance += distance3D(positionA, positionB);
      angle += Math.acos(clamp(Math.abs(dot(quaternionA, quaternionB)), -1, 1));
      bones.push(name);
    }
    const count = Math.max(1, bones.length);
    return { distance: distance / count, angle: angle / count, bones };
  }

  /** Độ dời của cây xương so với tư thế nghỉ (vector + độ lớn trung bình). */
  private poseDisplacement(source: unknown, boneName?: string): { vector: Vec3D; distance: number } {
    const current = this.fullPose(source);
    const rest = this.restPose(source);
    let x = 0;
    let y = 0;
    let z = 0;
    let distance = 0;
    let count = 0;
    for (const name of Object.keys(current)) {
      if (boneName && name !== boneName) continue;
      const to = current[name].position;
      const from = rest[name]?.position ?? to;
      x += to.x - from.x;
      y += to.y - from.y;
      z += to.z - from.z;
      distance += distance3D(to, from);
      count++;
    }
    if (count === 0) return { vector: { x: 0, y: 0, z: 0 }, distance: 0 };
    return {
      vector: { x: x / count, y: y / count, z: z / count },
      distance: distance / count,
    };
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

  /** Tốc độ lái quanh trục đứng (yaw rate) của đối tượng. */
  private yawRateOf(sources: unknown[]): number {
    const explicit = this.firstNumber(sources, ['yawRate', 'turnRate']);
    if (Number.isFinite(explicit)) return explicit;
    const angular = this.firstVector(sources, ['angularVelocity']);
    return angular.y;
  }

  /** Tốc độ di chuyển (m/s) — ưu tiên vận tốc thật. */
  private speedOf(sources: unknown[]): number {
    for (const source of sources) {
      const velocity = readVec(source, ['velocity']);
      if (magnitude(velocity) > 1e-9) return magnitude(velocity);
    }
    const explicit = this.firstNumber(sources, ['speed', 'moveSpeed', 'maxSpeed']);
    return Number.isFinite(explicit) ? explicit : 0;
  }

  /**
   * Góc dốc ước lượng từ hướng di chuyển.
   *
   * Khi không có pháp tuyến mặt đất, hướng đi của nhân vật là dấu hiệu duy
   * nhất về độ nghiêng bề mặt (đi lên dốc → thành phần `y` của vận tốc dương).
   */
  private slopeFromMotion(sources: unknown[]): number {
    for (const source of sources) {
      const velocity = readVec(source, ['velocity']);
      const speed = magnitude(velocity);
      if (speed < 1e-9) continue;
      return Math.asin(clamp(velocity.y / speed, -1, 1));
    }
    return 0;
  }

  /**
   * Pháp tuyến mặt đất ước lượng từ hướng di chuyển.
   *
   * Pháp tuyến phải vuông góc với hướng đi và nghiêng cùng góc dốc, nên nó
   * được suy ra từ vận tốc thật thay vì trả về một hằng số.
   */
  private groundNormalFromMotion(sources: unknown[]): Vec3D {
    for (const source of sources) {
      const velocity = readVec(source, ['velocity']);
      const speed = magnitude(velocity);
      if (speed < 1e-9) continue;
      const horizontal = Math.hypot(velocity.x, velocity.z);
      if (horizontal < 1e-9) return UP3;
      const sinPhi = clamp(velocity.y / speed, -1, 1);
      const cosPhi = clamp(horizontal / speed, 0, 1);
      const h = { x: velocity.x / horizontal, y: 0, z: velocity.z / horizontal };
      const normal = {
        x: -sinPhi * h.x,
        y: cosPhi,
        z: -sinPhi * h.z,
      };
      return magnitude(normal) > 0 ? normalize(normal) : UP3;
    }
    return UP3;
  }

  // ==========================================================================
  // 21. Xương
  // ==========================================================================

  /**
   * [0951] getBonePosition
   * Vị trí của xương (neo: `entity.position` + offset).
   */
  public getBonePosition(entity?: unknown, offset?: Vec3D) {
    const base = entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [0952] getBoneStartPosition
   * Đầu gần của xương.
   */
  public getBoneStartPosition(entity?: unknown, offset?: Vec3D) {
    const bone = this.boneOf(entity);
    const base = bone ? boneEndpoints(bone).start : entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [0953] getBoneEndPosition
   * Đầu xa của xương.
   */
  public getBoneEndPosition(entity?: unknown, offset?: Vec3D) {
    const bone = this.boneOf(entity);
    const base = bone ? boneEndpoints(bone).end : entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [0954] getBoneCenter
   * Tâm xương.
   */
  public getBoneCenter(entity?: unknown, offset?: Vec3D) {
    const bone = this.boneOf(entity);
    const base = bone
      ? (() => {
        const e = boneEndpoints(bone);
        return lerpVec3(e.start, e.end, 0.5);
      })()
      : entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [0955] getBoneDirection
   * Hướng của xương.
   */
  public getBoneDirection(a?: unknown, b?: unknown) {
    const bone = this.boneOf(a);
    if (bone) return directionRecord('getBoneDirection', boneDirection(bone));
    const from = worldPoint(a);
    const to = worldPoint(b);
    const dir = normalize(subtract(to, from));
    return directionRecord('getBoneDirection', magnitude(dir) > 0 ? dir : FORWARD3);
  }
  /**
   * [0956] getBoneOrientation
   * Góc quay của xương.
   */
  public getBoneOrientation(entityOrAngle?: unknown, options?: unknown) {
    const source = this.entityOf(entityOrAngle, options);
    const name = this.optionBoneName(options);
    const bone = name ? this.boneOf(source, [name]) : this.boneOf(source);
    if (bone) return orientation('getBoneOrientation', this.transformedQuaternion(bone.quaternion, options));
    const explicit = readQuat(source, ['quaternion', 'rotation']);
    if (explicit) return orientation('getBoneOrientation', this.transformedQuaternion(explicit, options));
    return orientation('getBoneOrientation', this.transformedQuaternion(entityQuaternion(source), options));
  }
  /**
   * [0957] getBoneLength
   * Chiều dài xương.
   */
  public getBoneLength(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const name = this.optionBoneName(options);
    const length = name ? this.lengthOf(source, [name], 1) : this.lengthOf(source, [], 1);
    return this.transformedNumber(length, options);
  }
  /**
   * [0958] getBoneScale
   * Tỉ lệ của xương.
   */
  public getBoneScale(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const name = this.optionBoneName(options);
    const bone = name ? this.boneOf(source, [name]) : this.boneOf(source);
    const raw = bone ? bone.scale : readVec(source, ['scale']);
    const base = magnitude(raw) > 0 ? raw : { x: 1, y: 1, z: 1 };
    const used = this.transformedVector(base, options);
    return named('getBoneScale', used, { uniform: used.x === used.y && used.y === used.z });
  }
  /**
   * [0959] getBoneParent
   * Xương cha.
   *
   * Xương được tra theo tên (`options.bone` / `options.boneName` / `bone` của
   * entity) rồi trả về cha THẬT trong cây xương; chỉ khi không tìm thấy
   * xương nào thì mới trả `null`.
   */
  public getBoneParent(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const name = this.requestedBoneName(sources);
    const bone = this.resolveBone(sources, name ? [name] : []);
    const parent = bone?.parent;
    return named('getBoneParent', parent ? parent.name : null, {
      parent: parent ? { name: parent.name, position: parent.position } : null,
      hasParent: Boolean(parent),
      bone: bone?.name ?? null,
    });
  }
  /**
   * [0960] getBoneChildren
   * Các xương con.
   */
  public getBoneChildren(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn xương thứ hai khi `a` không có cây xương.
    const source = this.boneSource(a, b, options);
    const name = this.optionBoneName(options);
    const bone = name ? this.boneOf(source, [name]) : this.boneOf(source);
    const children = bone ? bone.children.map((c) => c.name) : [];
    return named('getBoneChildren', children, { count: children.length, bone: bone?.name ?? null });
  }
  /**
   * [0961] calculateBoneDistance
   * Khoảng cách giữa hai xương.
   */
  public calculateBoneDistance(a?: unknown, b?: unknown) {
    return distance3D(this.boneWorld(a, []), this.boneWorld(b, []));
  }
  /**
   * [0962] calculateBoneAngle
   * Góc giữa hai xương.
   */
  public calculateBoneAngle(a?: unknown, b?: unknown) {
    const boneA = this.boneOf(a);
    const boneB = this.boneOf(b);
    const dirA = boneA ? boneDirection(boneA) : normalize(subtract(worldPoint(b), worldPoint(a)));
    const dirB = boneB ? boneDirection(boneB) : FORWARD3;
    return angleBetween(dirA, dirB);
  }
  /**
   * [0963] calculateBoneAlignment
   * Mức độ thẳng hàng của hai xương.
   */
  public calculateBoneAlignment(a?: unknown, b?: unknown, options?: unknown) {
    const boneA = this.boneOf(a);
    const boneB = this.boneOf(b);
    const dirA = boneA ? boneDirection(boneA) : FORWARD3;
    const dirB = boneB ? boneDirection(boneB) : FORWARD3;
    const alignment = clamp01(dot(dirA, dirB));
    return named('calculateBoneAlignment', this.transformedNumber(alignment, options), {
      directionA: dirA,
      directionB: dirB,
    });
  }
  /**
   * [0964] calculateBoneChainLength
   * Tổng chiều dài chuỗi xương.
   */
  public calculateBoneChainLength(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const bone = this.boneOf(source);
    // `options.bone` ghi đè xương mặc định (xương của entity, nếu không thì xương gốc).
    const requested = this.optionBoneName(options);
    const sourceBone = source == null ? undefined : (source as { bone?: unknown }).bone;
    const name = requested
      ?? (typeof sourceBone === 'string' ? sourceBone : (bone?.name ?? ''));
    const length = name ? chainLength(this.skeletonOf(source), name) : this.lengthOf(source, [], 0);
    return this.transformedNumber(length, options);
  }
  /**
   * [0965] calculateBoneHierarchyDepth
   * Độ sâu của cây xương.
   */
  public calculateBoneHierarchyDepth(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const requested = this.optionBoneName(options);
    // `options.bone` → đo độ sâu của nhánh xương đó, không phải của cả cây.
    const root = requested ? this.boneOf(source, [requested]) : this.skeletonOf(source);
    const depth = hierarchyDepth(root);
    return this.transformedNumber(depth, options);
  }
  /**
   * [0966] calculateBoneWorldTransform
   * Ma trận biến đổi thế giới của xương.
   */
  public calculateBoneWorldTransform(target?: unknown, options?: unknown) {
    const source = this.entityOf(target, options);
    const requested = this.optionBoneName(options);
    const bone = requested ? this.boneOf(source, [requested]) : this.boneOf(source);
    const position = bone ? this.boneWorld(source, [bone.name]) : worldPoint(source);
    const quaternion = bone ? bone.quaternion : entityQuaternion(source);
    const raw = bone ? bone.scale : readVec(source, ['scale']);
    const base = magnitude(raw) > 0 ? raw : { x: 1, y: 1, z: 1 };
    return trsMatrix(position, quaternion, this.transformedVector(base, options));
  }
  /**
   * [0967] calculateBoneLocalTransform
   * Ma trận biến đổi cục bộ của xương.
   */
  public calculateBoneLocalTransform(target?: unknown, options?: unknown) {
    const source = this.entityOf(target, options);
    const requested = this.optionBoneName(options);
    const bone = requested ? this.boneOf(source, [requested]) : this.boneOf(source);
    const position = bone ? bone.position : { x: 0, y: 0, z: 0 };
    const quaternion = bone ? bone.quaternion : { x: 0, y: 0, z: 0, w: 1 };
    const raw = bone ? bone.scale : { x: 1, y: 1, z: 1 };
    return trsMatrix(position, quaternion, this.transformedVector(raw, options));
  }
  /**
   * [0968] calculateBoneInverseTransform
   * Ma trận biến đổi nghịch của xương.
   */
  public calculateBoneInverseTransform(target?: unknown, options?: unknown) {
    const world = this.calculateBoneWorldTransform(target, options);
    // Nghịch đảo affine nhanh: nghịch đảo phần 3x3 + phép tịnh tiến nghịch.
    const inverse = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const a = world[col * 4 + row];
        const b = world[col * 4 + (row + 1) % 3];
        const c = world[col * 4 + (row + 2) % 3];
        inverse[col * 4 + row] = a - b - c;
      }
    }
    const tx = world[12];
    const ty = world[13];
    const tz = world[14];
    inverse[12] = -(inverse[0] * tx + inverse[4] * ty + inverse[8] * tz);
    inverse[13] = -(inverse[1] * tx + inverse[5] * ty + inverse[9] * tz);
    inverse[14] = -(inverse[2] * tx + inverse[6] * ty + inverse[10] * tz);
    return inverse;
  }
  /**
   * [0969] calculateBoneBindPose
   * Tư thế bind của xương.
   */
  public calculateBoneBindPose(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn xương thứ hai khi `a` không có cây xương.
    const source = this.boneSource(a, b, options);
    const name = this.optionBoneName(options);
    const bone = name ? this.boneOf(source, [name]) : this.boneOf(source);
    const pose = bone
      ? {
        position: this.transformedVector(bone.position, options),
        quaternion: this.transformedQuaternion(bone.quaternion, options),
      }
      : {
        position: this.transformedVector(worldPoint(source), options),
        quaternion: this.transformedQuaternion(entityQuaternion(source), options),
      };
    return named('calculateBoneBindPose', pose, { bone: bone?.name ?? null });
  }
  /**
   * [0970] calculateBonePoseDelta
   * Chênh lệch tư thế của xương.
   */
  public calculateBonePoseDelta(a?: unknown, b?: unknown, options?: unknown) {
    const boneA = this.boneOf(a);
    const boneB = this.boneOf(b);
    const pa = boneA ? { position: boneA.position, quaternion: boneA.quaternion } : { position: worldPoint(a), quaternion: entityQuaternion(a) };
    const pb = boneB ? { position: boneB.position, quaternion: boneB.quaternion } : { position: worldPoint(b), quaternion: entityQuaternion(b) };
    const positionDelta = this.transformedVector(subtract(pb.position, pa.position), options);
    const relative = multiplyQuaternions(invertQuaternion(pa.quaternion), pb.quaternion);
    const angle = 2 * Math.acos(clamp(relative.w, -1, 1));
    return named('calculateBonePoseDelta', {
      positionDelta,
      distance: magnitude(positionDelta),
      rotationDelta: relative,
      angle: this.transformedNumber(angle, options),
    });
  }
  /**
   * [0971] calculateBoneVelocity
   * Vận tốc của xương.
   */
  public calculateBoneVelocity(entity?: unknown, dt = 0.016) {
    const velocity = readVec(entity, ['velocity']);
    return directionRecord('calculateBoneVelocity', magnitude(velocity) > 0 ? velocity : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [0972] calculateBoneAcceleration
   * Gia tốc của xương.
   */
  public calculateBoneAcceleration(entity?: unknown, dt = 0.016) {
    const acceleration = readVec(entity, ['acceleration']);
    return directionRecord('calculateBoneAcceleration', magnitude(acceleration) > 0 ? acceleration : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [0973] calculateBoneAngularVelocity
   * Vận tốc góc của xương.
   */
  public calculateBoneAngularVelocity(entity?: unknown, dt = 0.016) {
    const angular = readVec(entity, ['angularVelocity']);
    return directionRecord('calculateBoneAngularVelocity', magnitude(angular) > 0 ? angular : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [0974] calculateBoneAngularAcceleration
   * Gia tốc góc của xương.
   */
  public calculateBoneAngularAcceleration(entity?: unknown, dt = 0.016) {
    const angular = readVec(entity, ['angularAcceleration']);
    return directionRecord('calculateBoneAngularAcceleration', magnitude(angular) > 0 ? angular : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [0975] calculateBoneBoundingBox
   * Hộp bao của xương.
   */
  public calculateBoneBoundingBox(entity?: unknown, size?: Vec3D) {
    const bone = this.boneOf(entity);
    const center = bone
      ? lerpVec3(boneEndpoints(bone).start, boneEndpoints(bone).end, 0.5)
      : entityPosition(entity);
    const extent = size ?? { x: 0.1, y: Math.max(0.1, this.lengthOf(entity, [], 1)), z: 0.1 };
    return bounds('calculateBoneBoundingBox', boundingBox(center, extent), { bone: bone?.name ?? null });
  }
  /**
   * [0976] calculateBoneBoundingSphere
   * Hình cầu bao của xương.
   */
  public calculateBoneBoundingSphere(entity?: unknown, radius = 1.0) {
    const bone = this.boneOf(entity);
    const center = bone
      ? lerpVec3(boneEndpoints(bone).start, boneEndpoints(bone).end, 0.5)
      : entityPosition(entity);
    return {
      name: 'calculateBoneBoundingSphere',
      valid: true,
      center,
      radius: Math.max(0, radius),
      timestamp: Date.now(),
    };
  }
  /**
   * [0977] calculateBoneCapsule
   * Capsule bao của xương.
   */
  public calculateBoneCapsule(a?: unknown, b?: unknown, options?: unknown) {
    const bone = this.boneOf(a);
    const endpoints = bone ? boneEndpoints(bone) : { start: worldPoint(a), end: worldPoint(b) };
    const radius = readNum(options, ['radius'], 0.05);
    return named('calculateBoneCapsule', {
      start: endpoints.start,
      end: endpoints.end,
      radius,
      length: distance3D(endpoints.start, endpoints.end),
    });
  }
  /**
   * [0978] calculateBoneCollision
   * Va chạm giữa hai xương.
   */
  public calculateBoneCollision(a?: unknown, b?: unknown) {
    const capsuleA = this.calculateBoneCapsule(a, b).result as { start: Vec3D; end: Vec3D; radius: number };
    const boxA = boundingBox(capsuleA.start, {
      x: capsuleA.radius * 2,
      y: distance3D(capsuleA.start, capsuleA.end) + capsuleA.radius * 2,
      z: capsuleA.radius * 2,
    });
    const boneB = this.boneOf(b);
    const boxB = boneB
      ? boundingBox(lerpVec3(boneEndpoints(boneB).start, boneEndpoints(boneB).end, 0.5), {
        x: 0.1,
        y: Math.max(0.1, boneB.length),
        z: 0.1,
      })
      : boundingBox(worldPoint(b), { x: 0.1, y: 0.1, z: 0.1 });
    const hit = boxesOverlap(boxA, boxB);
    const distance = distanceBetweenBoxes(boxA, boxB);
    const normal = normalize(subtract(boxCenterOf(boxB), boxCenterOf(boxA)));
    return collide('calculateBoneCollision', hit, distance, boxCenterOf(boxA), magnitude(normal) > 0 ? normal : UP3, hit ? distance : 0);
  }
  /**
   * [0979] calculateBoneIntersection
   * Giao điểm hai đoạn xương.
   */
  public calculateBoneIntersection(a?: unknown, b?: unknown) {
    const boneA = this.boneOf(a);
    const boneB = this.boneOf(b);
    const a1 = boneA ? boneEndpoints(boneA).start : worldPoint(a);
    const a2 = boneA ? boneEndpoints(boneA).end : worldPoint(a);
    const b1 = boneB ? boneEndpoints(boneB).start : worldPoint(b);
    const b2 = boneB ? boneEndpoints(boneB).end : worldPoint(b);
    const hit = segmentsCross(a1, a2, b1, b2);
    return collide('calculateBoneIntersection', hit, hit ? 0 : Infinity, hit ? lerpVec3(a1, a2, 0.5) : a1, UP3, hit ? 0.01 : 0);
  }
  /**
   * [0980] calculateBoneClosestPoint
   * Điểm gần nhất trên xương.
   */
  public calculateBoneClosestPoint(a?: unknown, b?: unknown, options?: unknown) {
    const bone = this.boneOf(a);
    const endpoints = bone ? boneEndpoints(bone) : { start: worldPoint(a), end: worldPoint(a) };
    const point = worldPoint(b);
    const ab = subtract(endpoints.end, endpoints.start);
    const lenSq = dot(ab, ab);
    const t = lenSq < 1e-12 ? 0 : clamp(dot(subtract(point, endpoints.start), ab) / lenSq, 0, 1);
    const closest = add(endpoints.start, scaleVec(ab, t));
    const extra: Record<string, unknown> = {
      t,
      distance: this.transformedNumber(distance3D(point, closest), options),
      worldPoint: closest,
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    return named('calculateBoneClosestPoint', this.referencePoint(closest, point, options), extra);
  }

  // ==========================================================================
  // 22. Khớp
  // ==========================================================================

  /**
   * [0981] getJointPosition
   * Vị trí khớp.
   */
  public getJointPosition(entity?: unknown, offset?: Vec3D) {
    const base = entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [0982] getJointCenter
   * Tâm khớp.
   */
  public getJointCenter(entity?: unknown, offset?: Vec3D) {
    const base = entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [0983] getJointAxis
   * Trục bản lề của khớp.
   */
  public getJointAxis(a?: unknown, b?: unknown, options?: unknown) {
    const boneA = this.boneOf(a);
    const boneB = this.boneOf(b);
    const axisA = boneA ? boneDirection(boneA) : FORWARD3;
    const axisB = boneB ? boneDirection(boneB) : FORWARD3;
    const axis = normalize(cross(axisA, axisB));
    const used = this.transformedVector(magnitude(axis) > 0 ? axis : RIGHT3, options);
    return directionRecord('getJointAxis', used, { axisA, axisB });
  }
  /**
   * [0984] getJointNormal
   * Pháp tuyến khớp.
   */
  public getJointNormal(a?: unknown, b?: unknown) {
    const boneA = this.boneOf(a);
    const boneB = this.boneOf(b);
    const axisA = boneA ? boneDirection(boneA) : FORWARD3;
    const axisB = boneB ? boneDirection(boneB) : FORWARD3;
    const normal = normalize(cross(axisA, axisB));
    return directionRecord('getJointNormal', magnitude(normal) > 0 ? normal : UP3);
  }
  /**
   * [0985] getJointParentBone
   * Xương cha của khớp.
   *
   * Tìm khớp theo tên rồi trả về xương cha THẬT trong cây xương.
   */
  public getJointParentBone(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const name = this.requestedBoneName(sources);
    const bone = this.resolveBone(sources, name ? [name] : []);
    const parent = bone?.parent;
    return named('getJointParentBone', parent ? parent.name : null, {
      hasParent: Boolean(parent),
      bone: bone?.name ?? null,
      parent: parent ? { name: parent.name, position: parent.position } : null,
    });
  }
  /**
   * [0986] getJointChildBone
   * Xương con của khớp.
   */
  public getJointChildBone(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn xương thứ hai khi `a` không có cây xương.
    const source = this.boneSource(a, b, options);
    const name = this.optionBoneName(options);
    const bone = name ? this.boneOf(source, [name]) : this.boneOf(source);
    const child = bone?.children[0];
    return named('getJointChildBone', child ? child.name : null, {
      hasChild: Boolean(child),
      bone: bone?.name ?? null,
    });
  }
  /**
   * [0987] calculateJointAngle
   * Góc của khớp.
   */
  public calculateJointAngle(a?: unknown, b?: unknown) {
    const boneA = this.boneOf(a);
    const boneB = this.boneOf(b);
    const dirA = boneA ? boneDirection(boneA) : normalize(subtract(worldPoint(b), worldPoint(a)));
    const dirB = boneB ? boneDirection(boneB) : FORWARD3;
    return angleBetween(dirA, dirB);
  }
  /**
   * [0988] calculateJointLimit
   * Giới hạn góc của khớp.
   */
  public calculateJointLimit(a?: unknown, b?: unknown, options?: unknown) {
    // `a` / `b` là nguồn giới hạn thứ hai/thứ ba khi `options` không chỉ định.
    const min = readNum(options, ['min', 'minAngle'], readNum(a, ['minAngle'], readNum(b, ['minAngle'], 0)));
    const max = readNum(options, ['max', 'maxAngle'], readNum(a, ['maxAngle'], readNum(b, ['maxAngle'], Math.PI)));
    return named('calculateJointLimit', { min, max, range: max - min }, { min, max });
  }
  /**
   * [0989] calculateJointConstraint
   * Ràng buộc của khớp.
   */
  public calculateJointConstraint(a?: unknown, b?: unknown, options?: unknown) {
    const limit = this.calculateJointLimit(a, b, options).result as { min: number; max: number };
    const angle = this.calculateJointAngle(a, b);
    const violated = angle < limit.min || angle > limit.max;
    return named('calculateJointConstraint', {
      angle,
      min: limit.min,
      max: limit.max,
      violated,
      error: violated ? Math.min(Math.abs(angle - limit.min), Math.abs(angle - limit.max)) : 0,
    });
  }
  /**
   * [0990] calculateJointVelocity
   * Vận tốc khớp.
   */
  public calculateJointVelocity(entity?: unknown, dt = 0.016) {
    const velocity = readVec(entity, ['velocity']);
    return directionRecord('calculateJointVelocity', magnitude(velocity) > 0 ? velocity : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [0991] calculateJointAcceleration
   * Gia tốc khớp.
   */
  public calculateJointAcceleration(entity?: unknown, dt = 0.016) {
    const acceleration = readVec(entity, ['acceleration']);
    return directionRecord('calculateJointAcceleration', magnitude(acceleration) > 0 ? acceleration : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [0992] calculateJointTorque
   * Mô-men xoắn tại khớp.
   */
  public calculateJointTorque(entity?: unknown, dt = 0.016) {
    const force = readVec(entity, ['force']);
    const lever = readVec(entity, ['leverArm']);
    const torque = cross(lever, force);
    return directionRecord('calculateJointTorque', torque, { dt, force, leverArm: lever });
  }
  /**
   * [0993] calculateJointForce
   * Lực tại khớp.
   */
  public calculateJointForce(entity?: unknown, dt = 0.016) {
    const force = readVec(entity, ['force']);
    const resolved = magnitude(force) > 0 ? force : { x: 0, y: 0, z: 0 };
    return directionRecord('calculateJointForce', resolved, { dt, magnitude: magnitude(resolved) });
  }
  /**
   * [0994] calculateJointStiffness
   * Độ cứng của khớp (k = F/x).
   *
   * Lực lấy từ `force` tường minh, nếu không có thì suy ra từ lực quán tính
   * F = m·a của chính khớp. Độ dời lấy từ `displacement` tường minh, nếu
   * không có thì đo từ cây xương thật (độ lệch của khớp so với tư thế nghỉ).
   */
  public calculateJointStiffness(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const explicitForce = this.firstVector(sources, ['force', 'jointForce', 'tension']);
    const explicitDisplacement = this.firstVector(sources, ['displacement', 'offset', 'delta']);

    // Lực tường minh, nếu không có → lực quán tính F = m·a.
    let force = explicitForce;
    let forceSource = 'explicit';
    if (magnitude(force) <= 0) {
      const mass = this.firstNumber(sources, ['mass']);
      const acceleration = this.firstVector(sources, ['acceleration']);
      if (magnitude(acceleration) > 0) {
        force = scaleVec(acceleration, Number.isFinite(mass) ? mass : 1);
        forceSource = 'inertia';
      }
    }

    // Độ dời tường minh, nếu không có → độ lệch của cây xương so với tư thế nghỉ.
    const boneName = this.requestedBoneName(sources);
    const pose = this.poseSource(sources);
    const measured = pose ? this.poseDisplacement(pose.source, boneName) : { vector: { x: 0, y: 0, z: 0 }, distance: 0 };
    const useMeasured = magnitude(explicitDisplacement) <= 0;
    const displacement = useMeasured ? measured.vector : explicitDisplacement;
    const displacementMagnitude = useMeasured ? measured.distance : magnitude(explicitDisplacement);

    const magnitudeForce = magnitude(force);
    const stiffness = displacementMagnitude > 1e-9
      ? magnitudeForce / displacementMagnitude
      : readNum(options, ['stiffness'], 0);
    return scalar('calculateJointStiffness', stiffness, 'N/m', {
      force,
      displacement,
      forceMagnitude: magnitudeForce,
      displacementMagnitude,
      forceSource,
    });
  }
  /**
   * [0995] calculateJointDamping
   * Hệ số giảm chấn (c = F/v).
   */
  public calculateJointDamping(a?: unknown, b?: unknown, options?: unknown) {
    const force = readVec(a, ['force']);
    const velocity = readVec(b, ['velocity']);
    const magnitudeForce = magnitude(force);
    const magnitudeVelocity = magnitude(velocity);
    const damping = magnitudeVelocity > 1e-9 ? magnitudeForce / magnitudeVelocity : readNum(options, ['damping'], 0);
    return scalar('calculateJointDamping', damping, 'N·s/m', { force, velocity });
  }
  /**
   * [0996] calculateJointFriction
   * Ma sát của khớp.
   */
  public calculateJointFriction(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn pháp tuyến / hệ số ma sát thứ hai khi `a` thiếu.
    const fromA = readVec(a, ['normal']);
    const normal = magnitude(fromA) > 0 ? fromA : readVec(b, ['normal']);
    const coefficient = readNum(
      a,
      ['friction', 'frictionCoefficient'],
      readNum(options, ['friction'], readNum(b, ['friction'], 0.5)),
    );
    const friction = scaleVec(normal, coefficient);
    return directionRecord('calculateJointFriction', friction, { coefficient, normal });
  }
  /**
   * [0997] calculateJointCollision
   * Va chạm tại khớp.
   */
  public calculateJointCollision(a?: unknown, b?: unknown) {
    const pointA = worldPoint(a);
    const pointB = worldPoint(b);
    const radiusA = readNum(a, ['radius'], 0.1);
    const radiusB = readNum(b, ['radius'], 0.1);
    const distance = distance3D(pointA, pointB);
    const hit = distance <= radiusA + radiusB;
    const normal = normalize(subtract(pointB, pointA));
    return collide(
      'calculateJointCollision',
      hit,
      Math.max(0, distance - radiusA - radiusB),
      pointA,
      magnitude(normal) > 0 ? normal : UP3,
      hit ? radiusA + radiusB - distance : 0,
    );
  }
  /**
   * [0998] calculateJointChain
   * Chuỗi khớp từ xương lên tới gốc.
   */
  public calculateJointChain(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn xương thứ hai khi `a` không có cây xương.
    const source = this.boneSource(a, b, options);
    const name = this.optionBoneName(options);
    const bone = name ? this.boneOf(source, [name]) : this.boneOf(source);
    const chain: string[] = [];
    let current: BoneDesc | undefined = bone;
    while (current) {
      chain.push(current.name);
      current = current.parent;
    }
    return named('calculateJointChain', chain, { length: chain.length, bone: bone?.name ?? null });
  }
  /**
   * [0999] calculateJointPoseError
   * Sai lệch tư thế của khớp.
   *
   * So sánh tư thế THẬT của cây xương (vị trí + xoay thế giới của từng xương)
   * với tư thế tham chiếu: tư thế của nguồn thứ hai nếu có, nếu không thì tư
   * thế nghỉ (bind pose) của chính cây xương đó.
   */
  public calculateJointPoseError(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const pose = this.poseSource(sources);
    const current = pose?.pose ?? {};
    const reference = pose ? this.referencePose(sources, pose.source) : {};
    const diff = this.poseError(current, reference);
    return named('calculateJointPoseError', diff.distance, {
      angle: diff.angle,
      bones: diff.bones,
    });
  }
  /**
   * [1000] calculateJointInverseKinematics
   * IK của một khớp đơn.
   */
  public calculateJointInverseKinematics(a?: unknown, b?: unknown, options?: unknown) {
    const root = worldPoint(a);
    const target = worldPoint(b);
    // `options.scale` co giãn chiều dài chi (và do đó đổi cả tầm với của).
    const length = this.lengthOf(a, [], 1) * this.scaleOf(options);
    const distance = distance3D(root, target);
    const reachable = distance <= length;
    const angle = Math.acos(clamp(distance / Math.max(1e-6, length), -1, 1));
    return named('calculateJointInverseKinematics', {
      reachable,
      angle: this.invertedNumber(angle, options),
      distance,
      length,
      target,
    });
  }

  // ==========================================================================
  // 23. Động học ngược và skeleton
  // ==========================================================================

  /**
   * [1001] calculateForwardKinematics
   * Động học tiền — vị trí thế giới của mọi xương.
   */
  public calculateForwardKinematics(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn xương thứ hai khi `a` không có cây xương.
    const source = this.boneSource(a, b, options);
    const raw = this.worldPositions(source);
    const positions: Record<string, Vec3D> = {};
    for (const [name, position] of Object.entries(raw)) {
      positions[name] = this.transformedVector(position, options);
    }
    const bones = this.bonesOf(source);
    return named('calculateForwardKinematics', positions, {
      boneCount: bones.length,
      bones: bones.map((bone) => bone.name),
      root: bones[0]?.name ?? null,
    });
  }
  /**
   * [1002] calculateInverseKinematics
   * Động học ngược tổng quát.
   */
  public calculateInverseKinematics(a?: unknown, b?: unknown, options?: unknown) {
    const root = worldPoint(a);
    const target = worldPoint(b);
    // `options.scale` co giãn chiều dài chi (và do đó đổi tầm với của).
    const length = this.lengthOf(a, [], 1) * this.scaleOf(options);
    const distance = distance3D(root, target);
    const reachable = distance <= length;
    return named('calculateInverseKinematics', {
      reachable,
      distance,
      length,
      target,
      direction: magnitude(target) > 0 ? normalize(subtract(target, root)) : FORWARD3,
    });
  }
  /**
   * [1003] solveTwoBoneIK
   * Giải IK hai xương.
   */
  public solveTwoBoneIK(a?: unknown, b?: unknown, options?: unknown) {
    const root = worldPoint(a);
    const target = worldPoint(b);
    const length1 = this.lengthOf(a, ['upperArm', 'upper'], readNum(options, ['length1', 'upperLength'], 0.3));
    const length2 = this.lengthOf(b, ['lowerArm', 'lower'], readNum(options, ['length2', 'lowerLength'], 0.26));
    const pole = readVec(options, ['pole', 'poleVector']);
    const solution = twoBoneIK(root, target, length1, length2, magnitude(pole) > 0 ? pole : FORWARD3);
    return named('solveTwoBoneIK', solution, { length1, length2 });
  }
  /**
   * [1004] solveThreeBoneIK
   * Giải IK ba xương.
   */
  public solveThreeBoneIK(a?: unknown, b?: unknown, options?: unknown) {
    const root = worldPoint(a);
    const target = worldPoint(b);
    const length1 = readNum(options, ['length1'], 0.3);
    const length2 = readNum(options, ['length2'], 0.26);
    const length3 = readNum(options, ['length3'], 0.1);
    const pole = readVec(options, ['pole', 'poleVector']);
    const solution = threeBoneIK(root, target, length1, length2, length3, magnitude(pole) > 0 ? pole : FORWARD3);
    return named('solveThreeBoneIK', solution, { length1, length2, length3 });
  }
  /**
   * [1005] solveFullBodyIK
   * IK toàn thân — phân bổ trọng số cho các khớp.
   */
  public solveFullBodyIK(a?: unknown, b?: unknown, options?: unknown) {
    const positions = this.worldPositions(a);
    // `options.scale` co giãn bộ khớp so với đích → đổi cách phân bổ trọng số.
    const joints = Object.entries(positions).map(([name, position]) => ({
      name,
      position: this.transformedVector(position, options),
    }));
    const target = worldPoint(b);
    const solution = fullBodyIK(joints, target);
    return named('solveFullBodyIK', solution, {
      target,
      jointCount: joints.length,
      reachable: joints.length > 0,
    });
  }
  /**
   * [1006] calculateIKTargetError
   * Sai lệch giữa đích IK và vị trí đạt được.
   */
  public calculateIKTargetError(a?: unknown, b?: unknown, options?: unknown) {
    const target = worldPoint(b);
    // `a` là nguồn thứ hai cho vị trí đạt được khi `options` không chỉ định.
    const fromOptions = readVec(options, ['reached', 'end']);
    const fromA = readVec(a, ['reached', 'end']);
    const reached = magnitude(fromOptions) > 0 ? fromOptions : fromA;
    const end = magnitude(reached) > 0 ? reached : target;
    return scalar(
      'calculateIKTargetError',
      this.transformedNumber(distance3D(target, end), options),
      this.unitWithFallback(options, 'm'),
      { target, end },
    );
  }
  /**
   * [1007] calculateIKJointWeights
   * Trọng số của các khớp trong chuỗi IK.
   */
  public calculateIKJointWeights(a?: unknown, b?: unknown, options?: unknown) {
    // `a` là danh sách khớp (mảng) và `b` là nguồn độ suy giảm khi
    // `options` không chỉ định.
    const countFromA = Array.isArray(a) ? a.length : Number.NaN;
    const explicitCount = readNum(options, ['jointCount', 'count'], Number.NaN);
    const count = Math.max(1, Math.floor(Number.isFinite(explicitCount) ? explicitCount : (Number.isFinite(countFromA) ? countFromA : 3)));
    const explicitFalloff = readNum(options, ['falloff'], Number.NaN);
    const falloffFromB = readNum(b, ['falloff'], Number.NaN);
    const falloff = Number.isFinite(explicitFalloff) ? explicitFalloff : (Number.isFinite(falloffFromB) ? falloffFromB : 0.75);
    return named('calculateIKJointWeights', ikWeights(count, falloff), { count, falloff });
  }
  /**
   * [1008] calculateIKReachability
   * Đích IK có nằm trong tầm với không.
   */
  public calculateIKReachability(a?: unknown, b?: unknown, options?: unknown) {
    const root = worldPoint(a);
    const target = worldPoint(b);
    const reach = readNum(options, ['reach', 'maxReach'], this.lengthOf(a, [], 1));
    const distance = distance3D(root, target);
    return named('calculateIKReachability', distance <= reach, {
      distance,
      reach,
    });
  }
  /**
   * [1009] calculateIKPoleVector
   * Vector định hướng khuỷu cho IK.
   */
  public calculateIKPoleVector(a?: unknown, b?: unknown) {
    const root = worldPoint(a);
    const target = worldPoint(b);
    const direction = normalize(subtract(target, root));
    const reference = normalize(cross(direction, UP3));
    const pole = magnitude(reference) > 0 ? reference : RIGHT3;
    return directionRecord('calculateIKPoleVector', pole, { direction });
  }
  /**
   * [1010] calculateIKChainStretch
   * Độ giãn của chuỗi IK.
   */
  public calculateIKChainStretch(a?: unknown, b?: unknown, options?: unknown) {
    const root = worldPoint(a);
    const target = worldPoint(b);
    const natural = this.lengthOf(a, [], 1);
    const distance = distance3D(root, target);
    const raw = natural > 0 ? distance / natural : 0;
    // `options.scale` nhân độ giãn; `options.invert` đảo dấu.
    const stretch = this.transformedNumber(raw, options);
    return named('calculateIKChainStretch', stretch, {
      distance,
      naturalLength: natural,
      overstretched: raw > 1.05,
    });
  }
  /**
   * [1011] calculateSkeletonRootPosition
   * Vị trí gốc của skeleton.
   */
  public calculateSkeletonRootPosition(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn skeleton thứ hai khi `a` không có cây xương.
    const source = this.boneSource(a, b, options);
    const bones = this.bonesOf(source);
    const positions = this.worldPositions(source);
    const rootName = bones[0]?.name;
    const raw = rootName ? positions[rootName] : worldPoint(source);
    const root = this.transformedVector(raw, options);
    return named('calculateSkeletonRootPosition', root, { root: rootName ?? null });
  }
  /**
   * [1012] calculateSkeletonOrientation
   * Góc quay của skeleton.
   */
  public calculateSkeletonOrientation(entityOrAngle?: unknown, options?: unknown) {
    const source = this.entityOf(entityOrAngle, options);
    const name = this.optionBoneName(options);
    const bones = this.bonesOf(source);
    const root = name ? this.boneOf(source, [name]) : bones[0];
    if (root) return orientation('calculateSkeletonOrientation', this.transformedQuaternion(root.quaternion, options));
    return orientation('calculateSkeletonOrientation', this.transformedQuaternion(entityQuaternion(source), options));
  }
  /**
   * [1013] calculateSkeletonBounds
   * Hộp bao toàn bộ skeleton.
   */
  public calculateSkeletonBounds(entity?: unknown, size?: Vec3D) {
    const positions = Object.values(this.worldPositions(entity));
    if (positions.length === 0) {
      return bounds('calculateSkeletonBounds', boundingBox(entityPosition(entity), size ?? { x: 1, y: 1, z: 1 }));
    }
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };
    for (const p of positions) {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      min.z = Math.min(min.z, p.z);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      max.z = Math.max(max.z, p.z);
    }
    return bounds('calculateSkeletonBounds', { min, max }, { boneCount: positions.length });
  }
  /**
   * [1014] calculateSkeletonCenterOfMass
   * Tâm khối lượng của skeleton.
   */
  public calculateSkeletonCenterOfMass(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const positions = Object.values(this.worldPositions(source));
    if (positions.length === 0) {
      return named(
        'calculateSkeletonCenterOfMass',
        this.transformedVector(entityPosition(source), options),
        { boneCount: 0 },
      );
    }
    const sum = positions.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 });
    const center = scaleVec(sum, 1 / positions.length);
    return named('calculateSkeletonCenterOfMass', this.transformedVector(center, options), {
      boneCount: positions.length,
    });
  }
  /**
   * [1015] calculateSkeletonPose
   * Tư thế hiện tại của skeleton.
   */
  public calculateSkeletonPose(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn tư thế thứ hai khi `a` không có cây xương.
    const source = this.boneSource(a, b, options);
    const raw = readPose(source, this.skeletonOf(source));
    const pose: PoseMap = {};
    for (const [name, entry] of Object.entries(raw)) {
      pose[name] = {
        position: this.transformedVector(entry.position, options),
        quaternion: this.transformedQuaternion(entry.quaternion, options),
      };
    }
    return named('calculateSkeletonPose', pose, { boneCount: Object.keys(pose).length });
  }
  /**
   * [1016] calculateSkeletonPoseDifference
   * Chênh lệch giữa hai tư thế skeleton.
   */
  public calculateSkeletonPoseDifference(a?: unknown, b?: unknown, options?: unknown) {
    const poseA = readPose(a, this.skeletonOf(a));
    const poseB = readPose(b, this.skeletonOf(b));
    const difference = poseDifference(poseA, poseB);
    return named('calculateSkeletonPoseDifference', {
      ...difference,
      distance: this.transformedNumber(difference.distance, options),
    });
  }
  /**
   * [1017] calculateSkeletonPoseSimilarity
   * Mức độ tương đồng của hai tư thế skeleton.
   */
  public calculateSkeletonPoseSimilarity(a?: unknown, b?: unknown, options?: unknown) {
    const poseA = readPose(a, this.skeletonOf(a));
    const poseB = readPose(b, this.skeletonOf(b));
    return scalar(
      'calculateSkeletonPoseSimilarity',
      this.transformedNumber(poseSimilarity(poseA, poseB), options),
      this.unitWithFallback(options, 'ratio'),
    );
  }
  /**
   * [1018] calculateSkeletonRetargeting
   * Retarget tư thế giữa hai skeleton khác kích thước.
   */
  public calculateSkeletonRetargeting(a?: unknown, b?: unknown, options?: unknown) {
    const source = readPose(a, this.skeletonOf(a));
    const target = readPose(b, this.skeletonOf(b));
    const scale = readNum(options, ['scale'], 1);
    const result: PoseMap = {};
    for (const [name, bone] of Object.entries(source)) {
      const match = target[name] ?? bone;
      result[name] = {
        position: scaleVec(match.position, scale),
        quaternion: match.quaternion,
      };
    }
    return named('calculateSkeletonRetargeting', result, { scale, boneCount: Object.keys(result).length });
  }
  /**
   * [1019] calculateBoneRetargeting
   * Retarget một xương.
   */
  public calculateBoneRetargeting(a?: unknown, b?: unknown, options?: unknown) {
    const bone = this.boneOf(a);
    const scale = readNum(options, ['scale'], 1);
    const source = bone ? bone.position : worldPoint(a);
    const target = bone ? scaleVec(source, scale) : worldPoint(b);
    return named('calculateBoneRetargeting', {
      position: target,
      quaternion: bone ? bone.quaternion : entityQuaternion(a),
    }, { scale, bone: bone?.name ?? null });
  }

  // ==========================================================================
  // 24. Animation
  // ==========================================================================

  /**
   * [1020] calculateAnimationBlendWeight
   * Trọng số trộn animation.
   *
   * Trọng số gốc đến từ `weight`/`weightA`, nếu không có thì lấy `blendWeight`
   * của entity. Tiến độ chuyển tiếp (`currentTime` / `duration`) quyết định
   * animation nguồn (`blendFrom`) nhường bao nhiêu trọng số cho animation đích
   * (`blendTo`).
   */
  public calculateAnimationBlendWeight(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const explicitA = this.firstNumber(sources, ['weight', 'weightA']);
    const blendWeight = this.firstNumber(sources, ['blendWeight']);
    const baseA = Number.isFinite(explicitA) ? explicitA : Number.isFinite(blendWeight) ? blendWeight : 0.5;
    const explicitB = this.firstNumber(sources, ['weightB']);
    const baseB = Number.isFinite(explicitB) ? explicitB : 1 - baseA;

    const duration = this.firstNumber(sources, ['duration', 'blendDuration']);
    const currentTime = this.firstNumber(sources, ['currentTime', 'time', 'elapsed']);
    const progress = duration > 0 ? clamp01(currentTime / duration) : 0;

    // Animation nguồn mất dần trọng số khi chuyển tiếp tiến triển; animation
    // đích nhận dần phần trọng số còn lại.
    const weightA = baseA * (1 - progress);
    const weightB = baseB * (1 - progress) + progress;
    const total = Math.abs(weightA) + Math.abs(weightB);
    const normalizedA = total > 1e-9 ? weightA / total : 0.5;

    const from = this.firstText(sources, ['blendFrom', 'from']);
    const to = this.firstText(sources, ['blendTo', 'to']);
    return named('calculateAnimationBlendWeight', { a: normalizedA, b: 1 - normalizedA }, {
      weightA,
      weightB,
      baseA,
      baseB,
      duration: Number.isFinite(duration) ? duration : null,
      currentTime: Number.isFinite(currentTime) ? currentTime : null,
      progress,
      from,
      to,
    });
  }
  /**
   * [1021] calculateAnimationBlendFactor
   * Hệ số trộn animation theo thời gian.
   */
  public calculateAnimationBlendFactor(a?: unknown, b?: unknown, options?: unknown) {
    // `a` / `b` là nguồn thứ hai/thứ ba (khoá riêng `blendDuration` /
    // `blendElapsed`) khi `options` không chỉ định.
    const duration = readNum(
      options,
      ['duration', 'blendDuration'],
      readNum(a, ['blendDuration'], readNum(b, ['blendDuration'], 0.3)),
    );
    const elapsed = readNum(
      options,
      ['elapsed', 'time'],
      readNum(a, ['blendElapsed'], readNum(b, ['blendElapsed'], 0)),
    );
    const factor = duration > 0 ? clamp01(elapsed / duration) : 1;
    return scalar(
      'calculateAnimationBlendFactor',
      this.transformedNumber(factor, options),
      this.unitWithFallback(options, 'ratio'),
      { duration, elapsed },
    );
  }
  /**
   * [1022] calculateAnimationTime
   * Thời gian của animation.
   */
  public calculateAnimationTime(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn thứ hai cho thời gian / thời lượng (khoá `animationTime`).
    const time = readNum(
      a,
      ['time', 'currentTime'],
      readNum(options, ['time'], readNum(b, ['animationTime', 'animationCurrentTime'], 0)),
    );
    const duration = readNum(
      a,
      ['duration'],
      readNum(options, ['duration'], readNum(b, ['animationDuration'], 1)),
    );
    return named('calculateAnimationTime', this.transformedNumber(time, options), {
      duration,
      normalized: duration > 0 ? (time % duration) / duration : 0,
      looping: duration > 0 && time >= duration,
    });
  }
  /**
   * [1023] calculateAnimationPhase
   * Pha của animation (0..1).
   */
  public calculateAnimationPhase(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const time = readNum(source, ['time', 'currentTime'], 0);
    const duration = readNum(source, ['duration'], 1);
    const phase = duration > 0 ? (time % duration) / duration : 0;
    return this.transformedNumber(phase, options);
  }
  /**
   * [1024] calculateAnimationPlaybackSpeed
   * Tốc độ phát animation.
   */
  public calculateAnimationPlaybackSpeed(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const speed = readNum(source, ['playbackSpeed', 'speed', 'timeScale'], 1);
    return this.transformedNumber(speed, options);
  }
  /**
   * [1025] calculateAnimationRootMotion
   * Chuyển động gốc của animation.
   */
  public calculateAnimationRootMotion(a?: unknown, b?: unknown, options?: unknown) {
    const start = worldPoint(a);
    const end = worldPoint(b);
    const motion = this.transformedVector(subtract(end, start), options);
    return named('calculateAnimationRootMotion', motion, {
      distance: magnitude(motion),
      horizontal: Math.hypot(motion.x, motion.z),
    });
  }
  /**
   * [1026] calculateAnimationRootVelocity
   * Vận tốc gốc của animation.
   */
  public calculateAnimationRootVelocity(entity?: unknown, dt = 0.016) {
    const velocity = readVec(entity, ['rootVelocity', 'velocity']);
    return directionRecord('calculateAnimationRootVelocity', magnitude(velocity) > 0 ? velocity : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [1027] calculateAnimationRootAcceleration
   * Gia tốc gốc của animation.
   */
  public calculateAnimationRootAcceleration(entity?: unknown, dt = 0.016) {
    const acceleration = readVec(entity, ['rootAcceleration', 'acceleration']);
    return directionRecord('calculateAnimationRootAcceleration', magnitude(acceleration) > 0 ? acceleration : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [1028] calculateAnimationPoseAtTime
   * Tư thế animation tại thời điểm t.
   */
  public calculateAnimationPoseAtTime(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn tư thế / đường cong thứ hai khi `a` không có.
    const source = this.boneSource(a, b, options);
    const pose = readPose(source, this.skeletonOf(source));
    const time = readNum(options, ['time', 't'], 0);
    const keys = readCurveKeys(source);
    const sampled: PoseMap = {};
    for (const [name, bone] of Object.entries(pose)) {
      sampled[name] = {
        position: this.transformedVector(bone.position, options),
        quaternion: this.transformedQuaternion(bone.quaternion, options),
      };
    }
    const phase = curveValue(keys, time);
    return named('calculateAnimationPoseAtTime', sampled, {
      time,
      phase,
      boneCount: Object.keys(sampled).length,
    });
  }
  /**
   * [1029] calculateAnimationInterpolation
   * Nội suy giữa hai animation.
   */
  public calculateAnimationInterpolation(a?: unknown, b?: unknown, options?: unknown) {
    const poseA = readPose(a, this.skeletonOf(a));
    const poseB = readPose(b, this.skeletonOf(b));
    const t = readNum(options, ['t', 'time', 'progress'], 0.5);
    return named('calculateAnimationInterpolation', blendPoses(poseA, poseB, t), { t });
  }
  /**
   * [1030] calculateAnimationCurveValue
   * Giá trị đường cong animation tại t.
   */
  public calculateAnimationCurveValue(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn đường cong thứ hai khi `a` không có.
    const keys = readCurveKeys(a).length > 0 ? readCurveKeys(a) : readCurveKeys(b);
    const t = readNum(options, ['time', 't'], 0);
    return scalar(
      'calculateAnimationCurveValue',
      this.transformedNumber(curveValue(keys, t), options),
      this.unitWithFallback(options, 'value'),
      { keys: keys.length },
    );
  }
  /**
   * [1031] calculateAnimationCurveDerivative
   * Đạo hàm đường cong animation.
   */
  public calculateAnimationCurveDerivative(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn đường cong thứ hai khi `a` không có.
    const keys = readCurveKeys(a).length > 0 ? readCurveKeys(a) : readCurveKeys(b);
    const t = readNum(options, ['time', 't'], 0);
    return scalar(
      'calculateAnimationCurveDerivative',
      this.transformedNumber(curveDerivative(keys, t), options),
      this.unitWithFallback(options, 'value/s'),
      { keys: keys.length },
    );
  }
  /**
   * [1032] calculateAnimationCurveIntegral
   * Tích phân đường cong animation.
   */
  public calculateAnimationCurveIntegral(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn đường cong thứ hai khi `a` không có.
    const keys = readCurveKeys(a).length > 0 ? readCurveKeys(a) : readCurveKeys(b);
    const t = readNum(options, ['time', 't'], 1);
    return scalar(
      'calculateAnimationCurveIntegral',
      this.transformedNumber(curveIntegral(keys, t), options),
      this.unitWithFallback(options, 'value·s'),
      { keys: keys.length },
    );
  }
  /**
   * [1033] calculateAnimationVelocity
   * Vận tốc animation.
   */
  public calculateAnimationVelocity(entity?: unknown, dt = 0.016) {
    const velocity = readVec(entity, ['velocity']);
    return directionRecord('calculateAnimationVelocity', magnitude(velocity) > 0 ? velocity : { x: 0, y: 0, z: 0 }, { dt });
  }
  /**
   * [1034] calculateAnimationAcceleration
   * Gia tốc animation.
   */
  public calculateAnimationAcceleration(entity?: unknown, dt = 0.016) {
    const acceleration = readVec(entity, ['acceleration']);
    return directionRecord('calculateAnimationAcceleration', magnitude(acceleration) > 0 ? acceleration : { x: 0, y: 0, z: 0 }, { dt });
  }

  // ==========================================================================
  // 25. Tư thế và mục tiêu
  // ==========================================================================

  /**
   * [1035] calculatePoseTransition
   * Chuyển tiếp giữa hai tư thế.
   */
  public calculatePoseTransition(a?: unknown, b?: unknown, options?: unknown) {
    const poseA = readPose(a, this.skeletonOf(a));
    const poseB = readPose(b, this.skeletonOf(b));
    const t = readNum(options, ['t', 'progress'], 0.5);
    const diff = poseDifference(poseA, poseB);
    return named('calculatePoseTransition', {
      blended: blendPoses(poseA, poseB, t),
      distance: diff.distance,
      angle: diff.angle,
      t,
    });
  }
  /**
   * [1036] calculatePoseTransitionDuration
   * Thời lượng chuyển tiếp tư thế.
   *
   * Khoảng cách tư thế được đo từ cây xương thật (so với tư thế tham chiếu),
   * chia cho tốc độ chuyển tiếp để ra thời lượng.
   */
  public calculatePoseTransitionDuration(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const pose = this.poseSource(sources);
    const current = pose?.pose ?? {};
    const reference = pose ? this.referencePose(sources, pose.source) : {};
    const diff = this.poseError(current, reference);
    const speed = this.firstNumber(sources, ['speed', 'transitionSpeed']);
    const effectiveSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
    const duration = diff.distance / effectiveSpeed;
    return scalar('calculatePoseTransitionDuration', duration, 's', {
      distance: diff.distance,
      angle: diff.angle,
      speed: effectiveSpeed,
    });
  }
  /**
   * [1037] calculatePoseBlend
   * Trộn hai tư thế.
   */
  public calculatePoseBlend(a?: unknown, b?: unknown, options?: unknown) {
    const poseA = readPose(a, this.skeletonOf(a));
    const poseB = readPose(b, this.skeletonOf(b));
    const t = readNum(options, ['t', 'weight', 'progress'], 0.5);
    return named('calculatePoseBlend', blendPoses(poseA, poseB, t), { t });
  }
  /**
   * [1038] calculatePoseStability
   * Độ ổn định của tư thế.
   */
  public calculatePoseStability(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn gia tốc thứ hai khi `a` không có.
    const fromA = readVec(a, ['acceleration']);
    const acceleration = magnitude(fromA) > 0 ? fromA : readVec(b, ['acceleration']);
    const jerk = magnitude(acceleration);
    const stability = clamp01(1 - jerk / 20);
    return named('calculatePoseStability', this.transformedNumber(stability, options), { acceleration, jerk });
  }
  /**
   * [1039] calculatePoseReachability
   * Tư thế có với tới được đích không.
   */
  public calculatePoseReachability(a?: unknown, b?: unknown, options?: unknown) {
    const target = worldPoint(b);
    const reach = readNum(options, ['reach'], this.lengthOf(a, [], 1));
    const distance = distance3D(worldPoint(a), target);
    return named('calculatePoseReachability', distance <= reach, { distance, reach, target });
  }
  /**
   * [1040] calculatePoseConstraintError
   * Sai lệch ràng buộc của tư thế.
   *
   * Đo trên tư thế thật của cây xương: sai lệch vị trí và sai lệch xoay so
   * với tư thế tham chiếu (tư thế đích nếu có, nếu không thì tư thế nghỉ).
   */
  public calculatePoseConstraintError(a?: unknown, b?: unknown, options?: unknown) {
    const sources = [a, b, options];
    const pose = this.poseSource(sources);
    const current = pose?.pose ?? {};
    const reference = pose ? this.referencePose(sources, pose.source) : {};
    const diff = this.poseError(current, reference);
    return named('calculatePoseConstraintError', diff.distance, {
      angle: diff.angle,
      bones: diff.bones,
    });
  }
  /**
   * [1041] calculateFootLockPosition
   * Vị trí khóa bàn chân (IK chân).
   */
  public calculateFootLockPosition(a?: unknown, b?: unknown, options?: unknown) {
    const target = worldPoint(b);
    const ground = readNum(options, ['groundY'], 0);
    const locked = readNum(options, ['lock'], 1);
    const position = lerpVec3(worldPoint(a), { x: target.x, y: ground, z: target.z }, locked);
    return named('calculateFootLockPosition', position, { target, ground, lock: locked });
  }
  /**
   * [1042] calculateFootLockWeight
   * Trọng số khóa bàn chân.
   */
  public calculateFootLockWeight(a?: unknown, b?: unknown, options?: unknown) {
    const distance = distance3D(worldPoint(a), worldPoint(b));
    const radius = readNum(options, ['radius'], 0.3);
    const weight = clamp01(1 - distance / Math.max(1e-6, radius));
    return scalar('calculateFootLockWeight', weight, 'ratio', { distance, radius });
  }
  /**
   * [1043] calculateHandIKTarget
   * Đích IK cho bàn tay.
   */
  public calculateHandIKTarget(a?: unknown, b?: unknown, options?: unknown) {
    const target = worldPoint(b);
    // `a` là nguồn độ lệch thứ hai khi `options` không chỉ định.
    const fromOptions = readVec(options, ['offset']);
    const offset = magnitude(fromOptions) > 0 ? fromOptions : readVec(a, ['offset']);
    // `options.side` chọn bàn tay: trái thì lệch ngược trục X (trục phải của engine là +X).
    const side = this.sideOf(options);
    const used = side === 'left' ? { x: -offset.x, y: offset.y, z: offset.z } : offset;
    const resolved = magnitude(used) > 0 ? add(target, used) : target;
    return named('calculateHandIKTarget', resolved, { target, offset: used });
  }
  /**
   * [1044] calculateLookAtTarget
   * Đích nhìn của nhân vật.
   */
  public calculateLookAtTarget(a?: unknown, b?: unknown, options?: unknown) {
    const target = worldPoint(b);
    const origin = worldPoint(a);
    const direction = normalize(subtract(target, origin));
    const extra: Record<string, unknown> = {
      origin,
      direction: magnitude(direction) > 0 ? direction : FORWARD3,
      distance: this.transformedNumber(distance3D(origin, target), options),
    };
    const unit = this.unitOf(options);
    if (unit) extra.unit = unit;
    // `options.reference` = 'local' → đích tính tương đối so với gốc nhìn.
    return named('calculateLookAtTarget', this.referencePoint(target, origin, options), extra);
  }
  /**
   * [1045] calculateHeadLookAt
   * Góc quay đầu để nhìn mục tiêu.
   */
  public calculateHeadLookAt(a?: unknown, b?: unknown, options?: unknown) {
    const origin = worldPoint(a);
    const target = worldPoint(b);
    const quaternion = this.transformedQuaternion(aimQuaternion(origin, target), options);
    const euler = eulerOf(quaternion);
    return named('calculateHeadLookAt', {
      quaternion,
      pitch: euler.x,
      yaw: euler.y,
      roll: euler.z,
    }, { target });
  }
  /**
   * [1046] calculateEyeLookAt
   * Góc quay mắt để nhìn mục tiêu.
   */
  public calculateEyeLookAt(a?: unknown, b?: unknown, options?: unknown) {
    const origin = worldPoint(a);
    const target = worldPoint(b);
    const direction = normalize(subtract(target, origin));
    const quaternion = this.transformedQuaternion(alignQuaternion(FORWARD3, direction), options);
    const euler = eulerOf(quaternion);
    return named('calculateEyeLookAt', {
      quaternion,
      pitch: euler.x,
      yaw: euler.y,
      roll: euler.z,
    }, { direction });
  }
  /**
   * [1047] calculateAimOffset
   * Lệch giữa hướng ngắm và hướng nhìn.
   */
  public calculateAimOffset(a?: unknown, b?: unknown, options?: unknown) {
    const origin = worldPoint(a);
    const target = worldPoint(b);
    const forward = entityForward(a);
    const toTarget = normalize(subtract(target, origin));
    const angle = angleAroundAxis(forward, toTarget);
    return named('calculateAimOffset', {
      angle: this.transformedNumber(angle, options),
      direction: toTarget,
      forward,
    }, { target });
  }
  /**
   * [1048] calculateAimPose
   * Tư thế ngắm.
   */
  public calculateAimPose(a?: unknown, b?: unknown, options?: unknown) {
    const origin = worldPoint(a);
    const target = worldPoint(b);
    const quaternion = this.transformedQuaternion(aimQuaternion(origin, target), options);
    return named('calculateAimPose', {
      position: this.transformedVector(origin, options),
      quaternion,
      target,
    });
  }
  /**
   * [1049] calculateReachPose
   * Tư thế với tới.
   */
  public calculateReachPose(a?: unknown, b?: unknown, options?: unknown) {
    const origin = worldPoint(a);
    const target = worldPoint(b);
    const reach = readNum(options, ['reach'], this.lengthOf(a, [], 1));
    const distance = distance3D(origin, target);
    const direction = normalize(subtract(target, origin));
    const reached = add(origin, scaleVec(direction, Math.min(distance, reach)));
    return named('calculateReachPose', {
      position: reached,
      direction,
      reachable: distance <= reach,
      distance,
      reach,
    });
  }
  /**
   * [1050] calculateCharacterPoseError
   * Sai lệch tư thế của nhân vật.
   */
  public calculateCharacterPoseError(a?: unknown, b?: unknown, options?: unknown) {
    const poseA = readPose(a, this.skeletonOf(a));
    const poseB = readPose(b, this.skeletonOf(b));
    const diff = poseDifference(poseA, poseB);
    return named('calculateCharacterPoseError', {
      positionError: this.transformedNumber(diff.distance, options),
      rotationError: diff.angle,
    });
  }

  // ==========================================================================
  // 26. Nhân vật
  // ==========================================================================

  /**
   * [1051] getCharacterPosition
   * Vị trí nhân vật.
   */
  public getCharacterPosition(entity?: unknown, offset?: Vec3D) {
    const base = entityPosition(entity);
    return {
      x: base.x + (offset?.x ?? 0),
      y: base.y + (offset?.y ?? 0),
      z: base.z + (offset?.z ?? 0),
    };
  }
  /**
   * [1052] getCharacterRotation
   * Góc quay của nhân vật.
   */
  public getCharacterRotation(entityOrAngle?: unknown, options?: unknown) {
    const source = this.entityOf(entityOrAngle, options);
    if (!source) return orientation('getCharacterRotation', { x: 0, y: 0, z: 0, w: 1 });
    const explicit = readQuat(source, ['quaternion', 'rotation']);
    if (explicit) return orientation('getCharacterRotation', this.transformedQuaternion(explicit, options));
    return orientation('getCharacterRotation', this.transformedQuaternion(entityQuaternion(source), options));
  }
  /**
   * [1053] getCharacterScale
   * Tỉ lệ nhân vật.
   */
  public getCharacterScale(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const raw = readVec(source, ['scale']);
    const base = magnitude(raw) > 0 ? raw : { x: 1, y: 1, z: 1 };
    const used = this.transformedVector(base, options);
    return named('getCharacterScale', used, { uniform: used.x === used.y && used.y === used.z });
  }
  /**
   * [1054] getCharacterVelocity
   * Vận tốc nhân vật.
   */
  public getCharacterVelocity(entity?: unknown, dt = 0.016) {
    return directionRecord('getCharacterVelocity', characterVelocity(entity, dt), { dt });
  }
  /**
   * [1055] getCharacterAcceleration
   * Gia tốc nhân vật.
   */
  public getCharacterAcceleration(entity?: unknown, dt = 0.016) {
    return directionRecord('getCharacterAcceleration', characterAcceleration(entity, dt), { dt });
  }
  /**
   * [1056] getCharacterForwardVector
   * Hướng nhìn của nhân vật.
   */
  public getCharacterForwardVector(a?: unknown, b?: unknown) {
    const forward = this.characterForwardOf(a, b);
    return directionRecord('getCharacterForwardVector', magnitude(forward) > 0 ? forward : FORWARD3);
  }
  /**
   * [1057] getCharacterRightVector
   * Hướng bên phải của nhân vật.
   */
  public getCharacterRightVector(a?: unknown, b?: unknown) {
    const forward = this.characterForwardOf(a, b);
    const right = normalize(cross(UP3, forward));
    return directionRecord('getCharacterRightVector', magnitude(right) > 0 ? right : RIGHT3);
  }
  /**
   * [1058] getCharacterUpVector
   * Hướng trên của nhân vật.
   */
  public getCharacterUpVector(a?: unknown, b?: unknown) {
    const forward = this.characterForwardOf(a, b);
    const right = normalize(cross(UP3, forward));
    const up = normalize(cross(forward, right));
    return directionRecord('getCharacterUpVector', magnitude(up) > 0 ? up : UP3);
  }
  /**
   * [1059] calculateCharacterHeight
   * Chiều cao nhân vật.
   */
  public calculateCharacterHeight(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const explicit = readNum(source, ['height'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : CHARACTER_DIMENSIONS.height;
    return this.transformedNumber(value, options);
  }
  /**
   * [1060] calculateCharacterWidth
   * Bề ngang nhân vật.
   */
  public calculateCharacterWidth(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const explicit = readNum(source, ['width'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : CHARACTER_DIMENSIONS.width;
    return this.transformedNumber(value, options);
  }
  /**
   * [1061] calculateCharacterDepth
   * Bề sâu nhân vật.
   */
  public calculateCharacterDepth(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const explicit = readNum(source, ['depth'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : CHARACTER_DIMENSIONS.depth;
    return this.transformedNumber(value, options);
  }
  /**
   * [1062] calculateCharacterRadius
   * Bán kính bao của nhân vật.
   */
  public calculateCharacterRadius(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const explicit = readNum(source, ['radius'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : CHARACTER_DIMENSIONS.radius;
    return this.transformedNumber(value, options);
  }
  /**
   * [1063] calculateCharacterBounds
   * Hộp bao của nhân vật.
   */
  public calculateCharacterBounds(entity?: unknown, size?: Vec3D) {
    const center = entityPosition(entity);
    const extent = size ?? {
      x: CHARACTER_DIMENSIONS.width,
      y: CHARACTER_DIMENSIONS.height,
      z: CHARACTER_DIMENSIONS.depth,
    };
    return bounds('calculateCharacterBounds', boundingBox(center, extent), { center });
  }
  /**
   * [1064] calculateCharacterBoundingBox
   * Hộp bao xương của nhân vật.
   */
  public calculateCharacterBoundingBox(entity?: unknown, size?: Vec3D) {
    const positions = Object.values(this.worldPositions(entity));
    if (positions.length === 0) return this.calculateCharacterBounds(entity, size);
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };
    for (const p of positions) {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      min.z = Math.min(min.z, p.z);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      max.z = Math.max(max.z, p.z);
    }
    return bounds('calculateCharacterBoundingBox', { min, max }, { boneCount: positions.length });
  }
  /**
   * [1065] calculateCharacterBoundingSphere
   * Hình cầu bao của nhân vật.
   */
  public calculateCharacterBoundingSphere(entity?: unknown, radius = 1.0) {
    return {
      name: 'calculateCharacterBoundingSphere',
      valid: true,
      center: entityPosition(entity),
      radius: Math.max(0, radius),
      timestamp: Date.now(),
    };
  }
  /**
   * [1066] calculateCharacterBoundingCapsule
   * Capsule bao của nhân vật.
   */
  public calculateCharacterBoundingCapsule(entity?: unknown, height = 2.0, radius = 0.5) {
    const center = entityPosition(entity);
    return named('calculateCharacterBoundingCapsule', {
      start: { x: center.x, y: center.y - height / 2, z: center.z },
      end: { x: center.x, y: center.y + height / 2, z: center.z },
      radius,
      height,
    });
  }
  /**
   * [1067] calculateCharacterCenterOfMass
   * Tâm khối lượng của nhân vật.
   */
  public calculateCharacterCenterOfMass(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const positions = Object.values(this.worldPositions(source));
    if (positions.length === 0) {
      const center = entityPosition(source);
      return named(
        'calculateCharacterCenterOfMass',
        this.transformedVector({ x: center.x, y: center.y - 0.1, z: center.z }, options),
        { boneCount: 0 },
      );
    }
    const sum = positions.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 });
    const center = scaleVec(sum, 1 / positions.length);
    return named('calculateCharacterCenterOfMass', this.transformedVector(center, options), {
      boneCount: positions.length,
    });
  }
  /**
   * [1068] calculateCharacterGroundDistance
   * Khoảng cách tới mặt đất.
   */
  public calculateCharacterGroundDistance(a?: unknown, b?: unknown) {
    const position = worldPoint(a);
    const ground = readNum(b, ['groundY', 'ground'], 0);
    return Math.abs(position.y - ground);
  }
  /**
   * [1069] calculateCharacterGroundContact
   * Nhân vật có chạm đất không.
   */
  public calculateCharacterGroundContact(a?: unknown, b?: unknown, options?: unknown) {
    const position = worldPoint(a);
    const ground = readNum(options, ['groundY', 'ground'], readNum(b, ['groundY'], 0));
    const distance = position.y - ground;
    const contact = distance <= 0.05;
    return named('calculateCharacterGroundContact', contact, { distance, ground });
  }
  /**
   * [1070] calculateCharacterGroundNormal
   * Pháp tuyến mặt đất.
   *
   * Dùng pháp tuyến tường minh nếu có; nếu không thì suy ra từ hướng di
   * chuyển (mặt đất phải vuông góc với đường đi của nhân vật).
   */
  public calculateCharacterGroundNormal(a?: unknown, b?: unknown) {
    const explicit = this.firstVector([b, a], ['normal', 'groundNormal', 'planeNormal']);
    if (magnitude(explicit) > 0) {
      return directionRecord('calculateCharacterGroundNormal', normalize(explicit));
    }
    return directionRecord('calculateCharacterGroundNormal', this.groundNormalFromMotion([a, b]));
  }
  /**
   * [1071] calculateCharacterSlopeAngle
   * Góc dốc dưới chân nhân vật.
   *
   * Có pháp tuyến mặt đất thì lấy góc giữa pháp tuyến và trục đứng; nếu
   * không thì góc dốc suy ra từ hướng di chuyển (đi lên dốc → vận tốc có
   * thành phần `y` dương).
   */
  public calculateCharacterSlopeAngle(a?: unknown, b?: unknown) {
    const explicit = this.firstVector([b, a], ['normal', 'groundNormal', 'planeNormal']);
    if (magnitude(explicit) > 0) {
      const resolved = normalize(explicit);
      return Math.acos(clamp(resolved.y, -1, 1));
    }
    return this.slopeFromMotion([a, b]);
  }
  /**
   * [1072] calculateCharacterMovementDirection
   * Hướng di chuyển.
   */
  public calculateCharacterMovementDirection(a?: unknown, b?: unknown) {
    const velocity = readVec(a, ['velocity']);
    if (magnitude(velocity) > 0) return directionRecord('calculateCharacterMovementDirection', normalize(velocity));
    const from = worldPoint(a);
    const to = worldPoint(b);
    const dir = normalize(subtract(to, from));
    return directionRecord('calculateCharacterMovementDirection', magnitude(dir) > 0 ? dir : FORWARD3);
  }
  /**
   * [1073] calculateCharacterMovementSpeed
   * Tốc độ di chuyển.
   */
  public calculateCharacterMovementSpeed(entity?: unknown, options?: unknown) {
    return this.transformedNumber(characterSpeed(this.entityOf(entity, options)), options);
  }
  /**
   * [1074] calculateCharacterMovementDistance
   * Quãng đường đã đi.
   */
  public calculateCharacterMovementDistance(a?: unknown, b?: unknown) {
    return distance3D(worldPoint(a), worldPoint(b));
  }
  /**
   * [1075] calculateCharacterTurningRate
   * Tốc độ quay của nhân vật.
   */
  public calculateCharacterTurningRate(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const angular = readVec(source, ['angularVelocity']);
    const rate = magnitude(angular) > 0 ? magnitude(angular) : readNum(source, ['turnRate'], CHARACTER_DIMENSIONS.turnRate);
    return this.transformedNumber(rate, options);
  }
  /**
   * [1076] calculateCharacterTurningAngle
   * Góc quay giữa hai hướng.
   */
  public calculateCharacterTurningAngle(a?: unknown, b?: unknown) {
    const from = readVec(a, ['forward']);
    const to = readVec(b, ['forward']);
    const dirA = magnitude(from) > 0 ? normalize(from) : entityForward(a);
    const dirB = magnitude(to) > 0 ? normalize(to) : entityForward(b);
    return angleAroundAxis(dirA, dirB);
  }
  /**
   * [1077] calculateCharacterStoppingDistance
   * Quãng đường dừng.
   */
  public calculateCharacterStoppingDistance(a?: unknown, b?: unknown) {
    const speed = characterSpeed(a);
    const deceleration = readNum(a, ['deceleration', 'braking'], readNum(b, ['deceleration'], 5));
    return stoppingDistance(speed, deceleration);
  }
  /**
   * [1078] calculateCharacterBrakingAcceleration
   * Gia tốc phanh.
   */
  public calculateCharacterBrakingAcceleration(entity?: unknown, dt = 0.016) {
    const deceleration = readNum(entity, ['deceleration', 'braking'], 5);
    const speed = characterSpeed(entity);
    const acceleration = deceleration > 0 ? -(speed * speed) / (2 * Math.max(1e-6, speed)) : 0;
    return directionRecord('calculateCharacterBrakingAcceleration', { x: 0, y: 0, z: acceleration }, { dt, deceleration });
  }
  /**
   * [1079] calculateCharacterJumpVelocity
   * Vận tốc nhảy.
   */
  public calculateCharacterJumpVelocity(entity?: unknown, dt = 0.016) {
    const height = readNum(entity, ['jumpHeight'], readNum(entity, ['height'], 1));
    const gravity = readNum(entity, ['gravity'], CHARACTER_DIMENSIONS.gravity);
    const velocity = jumpVelocityForHeight(height, gravity);
    return directionRecord('calculateCharacterJumpVelocity', { x: 0, y: velocity, z: 0 }, { dt, height, gravity });
  }
  /**
   * [1080] calculateCharacterJumpHeight
   * Chiều cao nhảy.
   */
  public calculateCharacterJumpHeight(entity?: unknown, options?: unknown) {
    const source = this.entityOf(entity, options);
    const velocity = readNum(source, ['jumpVelocity'], CHARACTER_DIMENSIONS.jumpVelocity);
    const gravity = readNum(source, ['gravity'], CHARACTER_DIMENSIONS.gravity);
    const height = gravity > 0 ? (velocity * velocity) / (2 * gravity) : 0;
    return this.transformedNumber(height, options);
  }
  /**
   * [1081] calculateCharacterFallVelocity
   * Vận tốc rơi.
   */
  public calculateCharacterFallVelocity(entity?: unknown, dt = 0.016) {
    const gravity = readNum(entity, ['gravity'], CHARACTER_DIMENSIONS.gravity);
    const velocity = readVec(entity, ['fallVelocity']);
    const resolved = magnitude(velocity) > 0 ? velocity : { x: 0, y: -gravity * dt, z: 0 };
    return directionRecord('calculateCharacterFallVelocity', resolved, { dt, gravity });
  }
  /**
   * [1082] calculateCharacterFallDistance
   * Quãng đường rơi.
   */
  public calculateCharacterFallDistance(a?: unknown, b?: unknown) {
    const height = Math.abs(worldPoint(a).y - readNum(b, ['groundY', 'ground'], 0));
    const gravity = readNum(a, ['gravity'], CHARACTER_DIMENSIONS.gravity);
    const fall = fallKinematics(height, gravity);
    return height;
  }
  /**
   * [1083] calculateCharacterLandingPosition
   * Vị trí hạ cánh.
   */
  public calculateCharacterLandingPosition(a?: unknown, b?: unknown, options?: unknown) {
    const position = worldPoint(a);
    const target = worldPoint(b);
    const ground = readNum(options, ['groundY'], 0);
    const resolved = {
      x: magnitude(target) > 0 ? target.x : position.x,
      y: ground,
      z: magnitude(target) > 0 ? target.z : position.z,
    };
    return named('calculateCharacterLandingPosition', resolved, { ground });
  }
  /**
   * [1084] calculateCharacterLandingVelocity
   * Vận tốc khi chạm đất.
   */
  public calculateCharacterLandingVelocity(entity?: unknown, dt = 0.016) {
    const gravity = readNum(entity, ['gravity'], CHARACTER_DIMENSIONS.gravity);
    const velocity = readVec(entity, ['fallVelocity', 'velocity']);
    const resolved = magnitude(velocity) > 0 ? velocity : { x: 0, y: -gravity * dt, z: 0 };
    return directionRecord('calculateCharacterLandingVelocity', resolved, { dt, gravity });
  }
  /**
   * [1085] calculateCharacterCollision
   * Va chạm của nhân vật.
   */
  public calculateCharacterCollision(a?: unknown, b?: unknown) {
    const boxA = boundingBox(worldPoint(a), {
      x: CHARACTER_DIMENSIONS.width,
      y: CHARACTER_DIMENSIONS.height,
      z: CHARACTER_DIMENSIONS.depth,
    });
    const boxB = boundingBox(worldPoint(b), {
      x: CHARACTER_DIMENSIONS.width,
      y: CHARACTER_DIMENSIONS.height,
      z: CHARACTER_DIMENSIONS.depth,
    });
    const hit = boxesOverlap(boxA, boxB);
    const distance = distanceBetweenBoxes(boxA, boxB);
    const normal = normalize(subtract(boxCenterOf(boxB), boxCenterOf(boxA)));
    return collide(
      'calculateCharacterCollision',
      hit,
      distance,
      boxCenterOf(boxA),
      magnitude(normal) > 0 ? normal : UP3,
      hit ? distance : 0,
    );
  }
  /**
   * [1086] calculateCharacterCollisionResponse
   * Phản ứng va chạm của nhân vật.
   */
  public calculateCharacterCollisionResponse(a?: unknown, b?: unknown) {
    const normal = normalize(subtract(worldPoint(b), worldPoint(a)));
    const resolved = magnitude(normal) > 0 ? normal : UP3;
    const restitution = readNum(a, ['restitution'], 0.2);
    const velocity = readVec(a, ['velocity']);
    const separating = dot(velocity, resolved);
    const reflected = subtract(velocity, scaleVec(resolved, (1 + restitution) * separating));
    return named('calculateCharacterCollisionResponse', {
      normal: resolved,
      velocity: reflected,
      restitution,
    });
  }
  /**
   * [1087] calculateCharacterPenetrationDepth
   * Độ sâu xâm nhập của nhân vật.
   */
  public calculateCharacterPenetrationDepth(entity?: unknown, options?: unknown) {
    const radius = readNum(entity, ['radius'], CHARACTER_DIMENSIONS.radius);
    const other = readVec(options, ['other', 'position']);
    const distance = magnitude(other) > 0 ? distance3D(worldPoint(entity), other) : 0;
    const penetration = Math.max(0, radius * 2 - distance);
    return penetration;
  }
  /**
   * [1088] calculateCharacterSeparationVector
   * Vector tách nhân vật khỏi nhau.
   */
  public calculateCharacterSeparationVector(a?: unknown, b?: unknown) {
    const dir = normalize(subtract(worldPoint(a), worldPoint(b)));
    return directionRecord('calculateCharacterSeparationVector', magnitude(dir) > 0 ? dir : FORWARD3, {
      distance: distance3D(worldPoint(a), worldPoint(b)),
    });
  }
  /**
   * [1089] calculateCharacterAvoidanceDirection
   * Hướng tránh vật cản.
   */
  public calculateCharacterAvoidanceDirection(a?: unknown, b?: unknown) {
    const from = worldPoint(a);
    const obstacle = worldPoint(b);
    const away = normalize(subtract(from, obstacle));
    const forward = entityForward(a);
    const blend = normalize(add(away, scaleVec(forward, 0.5)));
    return directionRecord('calculateCharacterAvoidanceDirection', magnitude(blend) > 0 ? blend : FORWARD3, {
      distance: distance3D(from, obstacle),
    });
  }
  /**
   * [1090] calculateCharacterPathDistance
   * Quãng đường trên đường đi.
   */
  public calculateCharacterPathDistance(a?: unknown, b?: unknown) {
    return distance3D(worldPoint(a), worldPoint(b));
  }
  /**
   * [1091] calculateCharacterPathDeviation
   * Độ lệch khỏi đường đi.
   */
  public calculateCharacterPathDeviation(a?: unknown, b?: unknown, options?: unknown) {
    // `b` là nguồn hướng đường đi thứ hai khi `options` không chỉ định.
    const fromOptions = readVec(options, ['pathDirection', 'path']);
    const path = magnitude(fromOptions) > 0 ? fromOptions : readVec(b, ['pathDirection', 'path']);
    const position = worldPoint(a);
    const direction = magnitude(path) > 0 ? normalize(path) : FORWARD3;
    const along = dot(position, direction);
    const projection = scaleVec(direction, along);
    const deviation = magnitude(subtract(position, projection));
    return scalar(
      'calculateCharacterPathDeviation',
      this.transformedNumber(deviation, options),
      this.unitWithFallback(options, 'm'),
      { along, projection },
    );
  }
  /**
   * [1092] calculateCharacterPathCurvature
   * Độ cong của đường đi.
   *
   * Ưu tiên công thức lái xe κ = yawRate / speed (tốc độ lái và tốc độ thật);
   * khi không có tốc độ lái thì đo độ cong hình học của đường đi.
   */
  public calculateCharacterPathCurvature(entity?: unknown, options?: unknown) {
    const sources = [entity, options];
    const yawRate = Math.abs(this.yawRateOf(sources));
    const speed = this.speedOf(sources);
    if (yawRate > 1e-9 && speed > 1e-9) {
      return yawRate / speed;
    }
    return this.pathCurvature(this.pathPointsOf(sources));
  }
  /**
   * [1093] calculateCharacterPathTangent
   * Tiếp tuyến đường đi.
   */
  public calculateCharacterPathTangent(a?: unknown, b?: unknown) {
    // `b` là nguồn hướng đường đi thứ hai khi `a` không chỉ định.
    const fromA = readVec(a, ['pathDirection', 'path']);
    const path = magnitude(fromA) > 0 ? fromA : readVec(b, ['pathDirection', 'path']);
    const resolved = magnitude(path) > 0 ? normalize(path) : entityForward(a);
    return directionRecord('calculateCharacterPathTangent', resolved);
  }
  /**
   * [1094] calculateCharacterPathNormal
   * Pháp tuyến đường đi.
   */
  public calculateCharacterPathNormal(a?: unknown, b?: unknown) {
    const tangent = this.calculateCharacterPathTangent(a, b).direction as Vec3D;
    const normal = normalize(cross(tangent, UP3));
    return directionRecord('calculateCharacterPathNormal', magnitude(normal) > 0 ? normal : RIGHT3);
  }
  /**
   * [1095] calculateCharacterNavigationCost
   * Chi phí điều hướng của nhân vật.
   */
  public calculateCharacterNavigationCost(entity?: unknown, options?: unknown) {
    const distance = distance3D(worldPoint(entity), readVec(options, ['target']));
    const speed = Math.max(0.1, characterSpeed(entity));
    const cost = distance / speed;
    return cost;
  }
  /**
   * [1096] calculateCharacterReachDistance
   * Quãng đường với tới.
   */
  public calculateCharacterReachDistance(a?: unknown, b?: unknown) {
    return distance3D(worldPoint(a), worldPoint(b));
  }
  /**
   * [1097] calculateCharacterInteractionRange
   * Tầm tương tác.
   */
  public calculateCharacterInteractionRange(a?: unknown, b?: unknown, options?: unknown) {
    const explicit = readNum(options, ['range', 'interactionRange'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : CHARACTER_DIMENSIONS.interactionRange;
    const distance = distance3D(worldPoint(a), worldPoint(b));
    return named('calculateCharacterInteractionRange', value, {
      distance,
      inRange: distance <= value,
    });
  }
  /**
   * [1098] calculateCharacterVisibilityRange
   * Tầm nhìn của nhân vật.
   */
  public calculateCharacterVisibilityRange(entity?: unknown, camera?: unknown) {
    const explicit = readNum(entity, ['visibilityRange', 'viewDistance'], Number.NaN);
    const value = Number.isFinite(explicit) ? explicit : 50;
    const distance = distance3D(worldPoint(entity), worldPoint(camera));
    return named('calculateCharacterVisibilityRange', value, {
      distance,
      visible: distance <= value,
    });
  }
  /**
   * [1099] calculateCharacterTargetDistance
   * Khoảng cách tới mục tiêu.
   */
  public calculateCharacterTargetDistance(a?: unknown, b?: unknown) {
    return distance3D(worldPoint(a), worldPoint(b));
  }
  /**
   * [1100] calculateCharacterTargetAngle
   * Góc tới mục tiêu.
   */
  public calculateCharacterTargetAngle(a?: unknown, b?: unknown) {
    const from = worldPoint(a);
    const to = worldPoint(b);
    const forward = entityForward(a);
    const toTarget = normalize(subtract(to, from));
    return angleAroundAxis(forward, toTarget);
  }
}

// ---------------------------------------------------------------------------
// Trợ giúp cấp module
// ---------------------------------------------------------------------------

/** Tâm AABB. */
function boxCenterOf(box: Box3D): Vec3D {
  return {
    x: (box.min.x + box.max.x) / 2,
    y: (box.min.y + box.max.y) / 2,
    z: (box.min.z + box.max.z) / 2,
  };
}

/** Hai đoạn thẳng có cắt nhau không (kiểm tra cạnh trong không gian 3D). */
function segmentsCross(a1: Vec3D, a2: Vec3D, b1: Vec3D, b2: Vec3D): boolean {
  const d1 = cross(subtract(a2, a1), subtract(b1, a1));
  const d2 = cross(subtract(a2, a1), subtract(b2, a1));
  const d3 = cross(subtract(b2, b1), subtract(a1, b1));
  const d4 = cross(subtract(b2, b1), subtract(a2, b1));
  return dot(d1, d2) < 0 && dot(d3, d4) < 0;
}
