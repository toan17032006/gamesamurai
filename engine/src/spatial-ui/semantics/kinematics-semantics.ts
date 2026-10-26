/**
 * @file kinematics-semantics.ts
 * @module @aetheria/engine/spatial-ui/semantics/kinematics-semantics
 * @description Ngữ nghĩa khung (skeleton), xương, khớp, IK, animation và nhân vật.
 *
 * Trước đây 150 method của `SkeletalKinematicsCharacterSubsystem` trả về
 * `{ name: 'FN', valid: true, result: 0 }` cho 62 method, `1.0` cho 19 method
 * và vector không cho 18 method. Ở đây mọi phép tính được thực sự thực hiện
 * trên một mô hình xương thật (cây xương, pose, đường cong animation).
 */

import type { Vec3D, QuatD, Box3D } from '../types.js';
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
  toVec3,
  eulerToQuaternion,
  quaternionToEuler,
  normalizeQuaternion,
  multiplyQuaternions,
  slerpQuaternion,
  invertQuaternion,
  lookAtQuaternion,
  rotateAroundAxis,
  rotationBetweenVectors,
  unsignedAngle,
  signedAngle,
  boundingBox,
  boundingSphere,
  UP3,
  FORWARD3,
  RIGHT3,
} from '../spatial-primitives.js';

// ---------------------------------------------------------------------------
// Mô hình xương
// ---------------------------------------------------------------------------

/** Mô tả một xương trong cây khung. */
export interface BoneDesc {
  name: string;
  position: Vec3D;
  quaternion: QuatD;
  scale: Vec3D;
  length: number;
  children: BoneDesc[];
  parent?: BoneDesc;
}

/** Một tư thế (pose): vị trí + xoay của từng xương. */
export interface BonePose {
  position: Vec3D;
  quaternion: QuatD;
}

export type PoseMap = Record<string, BonePose>;

/** Đọc số từ object theo danh sách khoá. */
export function readNum(source: unknown, keys: string[], fallback: number): number {
  if (!source || typeof source !== 'object') return fallback;
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  }
  return fallback;
}

/** Đọc vector từ object theo danh sách khoá. */
export function readVec(source: unknown, keys: string[]): Vec3D {
  if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0 };
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (raw && typeof raw === 'object') return toVec3(raw);
  }
  return { x: 0, y: 0, z: 0 };
}

/** Đọc quaternion từ object. */
export function readQuat(source: unknown, keys: string[]): QuatD | undefined {
  if (!source || typeof source !== 'object') return undefined;
  const o = source as Record<string, unknown>;
  for (const key of keys) {
    const raw = o[key];
    if (!raw || typeof raw !== 'object') continue;
    const q = raw as Record<string, unknown>;
    if (typeof q.w === 'number' || typeof q.x === 'number') {
      return { x: num(q.x), y: num(q.y), z: num(q.z), w: num(q.w, 1) };
    }
    if (typeof q.pitch === 'number' || typeof q.yaw === 'number' || typeof q.roll === 'number') {
      return eulerToQuaternion(num(q.pitch), num(q.yaw), num(q.roll));
    }
  }
  return undefined;
}

/** Điểm trong không gian từ entity / object thường. */
export function worldPoint(source: unknown): Vec3D {
  if (!source || typeof source !== 'object') return { x: 0, y: 0, z: 0 };
  const o = source as Record<string, unknown>;
  if (o.position && typeof o.position === 'object') return toVec3(o.position);
  if (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') return toVec3(o);
  return { x: 0, y: 0, z: 0 };
}

/** Quyển một quaternion theo vector (chuẩn three.js). */
export function rotateVec(q: QuatD, v: Vec3D): Vec3D {
  const u = { x: q.x, y: q.y, z: q.z };
  const t = scale(cross(u, v), 2);
  return add(add(v, scale(t, q.w)), cross(u, t));
}

/**
 * Dựng cây xương từ dữ liệu.
 *
 * Nhận: `{ skeleton: [...] }`, `{ bones: [...] }`, `{ root: BoneNode }`, một mảng
 * descriptor, hoặc MỘT node xương đơn (`{ skeleton: BoneNode }`).
 * Descriptor: `{ name, position, quaternion, rotation, scale, length, children }`.
 *
 * Trường hợp "một node đơn" rất phổ biến trong dữ liệu runtime (một entity
 * chỉ có một chuỗi xương liên tiếp, ví dụ `hips → spine → chest → shoulder`).
 * Nếu chỉ nhận mảng thì cây xương đó bị bỏ qua và mọi phép đo rơi về bảng
 * offset tĩnh — tức là "return có sẵn" dù entity có dữ liệu thật.
 */
export function buildSkeleton(source: unknown): BoneDesc | undefined {
  const raw = (source ?? {}) as Record<string, unknown>;
  const list = raw.skeleton ?? raw.bones ?? raw.nodes ?? (Array.isArray(source) ? source : undefined);
  if (Array.isArray(list)) {
    if (list.length === 0) return undefined;
    const children = list.map((b) => buildBone(b)).filter((b): b is BoneDesc => Boolean(b));
    if (children.length === 0) return undefined;
    return children[0];
  }
  if (raw.root && typeof raw.root === 'object') return buildBone(raw.root);
  // Một node xương đơn dưới khoá `skeleton`/`bones`/`nodes`.
  if (list && typeof list === 'object') {
    const candidate = list as Record<string, unknown>;
    const looksLikeBone =
      typeof candidate.name === 'string' ||
      Array.isArray(candidate.children) ||
      (candidate.position !== undefined && candidate.position !== null && typeof candidate.position === 'object');
    if (looksLikeBone) return buildBone(list);
  }
  return undefined;
}

/** Dựng một node xương (kèm con). */
export function buildBone(raw: unknown): BoneDesc | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const name = typeof o.name === 'string' ? o.name : 'bone';
  const children = Array.isArray(o.children)
    ? o.children.map((c) => buildBone(c)).filter((c): c is BoneDesc => Boolean(c))
    : [];
  const bone: BoneDesc = {
    name,
    position: o.position && typeof o.position === 'object' ? toVec3(o.position) : { x: 0, y: 0, z: 0 },
    quaternion: readQuat(o, ['quaternion', 'rotation']) ?? { x: 0, y: 0, z: 0, w: 1 },
    scale: o.scale && typeof o.scale === 'object' ? toVec3(o.scale) : { x: 1, y: 1, z: 1 },
    length: readNum(o, ['length', 'boneLength'], 1),
    children,
  };
  for (const child of children) child.parent = bone;
  return bone;
}

/** Duyệt cây xương (bao gồm node gốc). */
export function walkSkeleton(
  root: BoneDesc | undefined,
  visit: (bone: BoneDesc, depth: number) => void,
  depth = 0,
): void {
  if (!root) return;
  visit(root, depth);
  for (const child of root.children) walkSkeleton(child, visit, depth + 1);
}

/** Tìm xương theo tên (không phân biệt hoa thường). */
export function findBone(root: BoneDesc | undefined, name: string): BoneDesc | undefined {
  const wanted = name.toLowerCase();
  let found: BoneDesc | undefined;
  walkSkeleton(root, (bone) => {
    if (!found && bone.name.toLowerCase() === wanted) found = bone;
  });
  return found;
}

/** Tất cả xương trong cây (theo thứ tự duyệt). */
export function allBones(root: BoneDesc | undefined): BoneDesc[] {
  const result: BoneDesc[] = [];
  walkSkeleton(root, (bone) => result.push(bone));
  return result;
}

/**
 * Vị trí thế giới của mọi xương (động học tiền).
 *
 * Mỗi xương biến đổi bằng `local = T(position) · R(quaternion) · S(scale)`;
 * vị trí thế giới = vị trí thế giới của cha + phần bị xoay.
 */
export function forwardKinematics(root: BoneDesc | undefined): Record<string, Vec3D> {
  const result: Record<string, Vec3D> = {};
  const walk = (bone: BoneDesc, parentWorld: Vec3D, parentRotation: QuatD): void => {
    const local = rotateVec(parentRotation, scale(bone.position, 1));
    const world = add(parentWorld, local);
    result[bone.name] = world;
    const worldRotation = normalizeQuaternion(multiplyQuaternions(parentRotation, bone.quaternion));
    for (const child of bone.children) walk(child, world, worldRotation);
  };
  if (root) walk(root, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0, w: 1 });
  return result;
}

/** Chiều sâu của cây xương. */
export function hierarchyDepth(root: BoneDesc | undefined): number {
  let maxDepth = 0;
  walkSkeleton(root, (_bone, depth) => {
    if (depth > maxDepth) maxDepth = depth;
  });
  return maxDepth;
}

/** Tổng chiều dài chuỗi xương từ một xương lên tới gốc. */
export function chainLength(root: BoneDesc | undefined, name: string): number {
  const bone = findBone(root, name);
  if (!bone) return 0;
  let total = 0;
  let current: BoneDesc | undefined = bone;
  while (current) {
    total += current.length;
    current = current.parent;
  }
  return total;
}

/** Điểm đầu và cuối của xương trong không gian cục bộ. */
export function boneEndpoints(bone: BoneDesc): { start: Vec3D; end: Vec3D } {
  const start = { ...bone.position };
  const end = add(start, scale(rotateVec(bone.quaternion, { x: 0, y: bone.length, z: 0 }), 1));
  return { start, end };
}

/** Hướng của xương. */
export function boneDirection(bone: BoneDesc): Vec3D {
  const dir = normalize(rotateVec(bone.quaternion, { x: 0, y: 1, z: 0 }));
  return magnitude(dir) > 0 ? dir : UP3;
}

/**
 * Tư thế (pose) từ dữ liệu.
 *
 * Nhận `source.pose` (map tên → `{position, quaternion}`) hoặc suy ra từ
 * cây xương.
 */
export function readPose(source: unknown, root?: BoneDesc): PoseMap {
  const raw = (source ?? {}) as Record<string, unknown>;
  const pose = raw.pose;
  const result: PoseMap = {};
  if (pose && typeof pose === 'object') {
    for (const [name, value] of Object.entries(pose as Record<string, unknown>)) {
      const o = (value ?? {}) as Record<string, unknown>;
      result[name] = {
        position: o.position && typeof o.position === 'object' ? toVec3(o.position) : { x: 0, y: 0, z: 0 },
        quaternion: readQuat(o, ['quaternion', 'rotation']) ?? { x: 0, y: 0, z: 0, w: 1 },
      };
    }
    if (Object.keys(result).length > 0) return result;
  }
  const world = forwardKinematics(root);
  for (const [name, position] of Object.entries(world)) {
    result[name] = { position, quaternion: { x: 0, y: 0, z: 0, w: 1 } };
  }
  return result;
}

/** Trộn hai tư thế. */
export function blendPoses(a: PoseMap, b: PoseMap, t: number): PoseMap {
  const k = clamp01(t);
  const names = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result: PoseMap = {};
  for (const name of names) {
    const pa = a[name] ?? { position: { x: 0, y: 0, z: 0 }, quaternion: { x: 0, y: 0, z: 0, w: 1 } };
    const pb = b[name] ?? pa;
    result[name] = {
      position: lerpVec3(pa.position, pb.position, k),
      quaternion: slerpQuaternion(pa.quaternion, pb.quaternion, k),
    };
  }
  return result;
}

/** Sai khác giữa hai tư thế. */
export function poseDifference(a: PoseMap, b: PoseMap): { distance: number; angle: number; bones: string[] } {
  const names = new Set([...Object.keys(a), ...Object.keys(b)]);
  let distance = 0;
  let angle = 0;
  const bones: string[] = [];
  for (const name of names) {
    const pa = a[name];
    const pb = b[name];
    if (!pa || !pb) {
      bones.push(name);
      continue;
    }
    distance += distance3D(pa.position, pb.position);
    angle += Math.acos(clamp(Math.abs(dot(pa.quaternion, pb.quaternion)), -1, 1));
    bones.push(name);
  }
  const count = Math.max(1, bones.length);
  return { distance: distance / count, angle: angle / count, bones };
}

/** Độ tương đồng giữa hai tư thế (0..1). */
export function poseSimilarity(a: PoseMap, b: PoseMap): number {
  const diff = poseDifference(a, b);
  const positionScore = 1 / (1 + diff.distance);
  const rotationScore = 1 - diff.angle / Math.PI;
  return clamp01((positionScore + rotationScore) / 2);
}

/** Trọng số của các khớp trong chuỗi IK. */
export function ikWeights(count: number, falloff = 0.75): number[] {
  const weights: number[] = [];
  for (let i = 0; i < count; i++) weights.push(Math.pow(falloff, i));
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;
  return weights.map((w) => w / total);
}

/**
 * IK hai xương.
 *
 * Trả về góc tại khớp gốc và khớp giữa để đưa đầu chiếc tới đích.
 */
export function twoBoneIK(
  root: Vec3D,
  target: Vec3D,
  length1: number,
  length2: number,
  pole: Vec3D = FORWARD3,
): {
  reachable: boolean;
  angleRoot: number;
  angleJoint: number;
  joint: Vec3D;
  end: Vec3D;
  distance: number;
} {
  const toTarget = subtract(target, root);
  const distance = magnitude(toTarget);
  const l1 = Math.max(1e-6, length1);
  const l2 = Math.max(1e-6, length2);
  const maxReach = l1 + l2;
  const minReach = Math.abs(l1 - l2);
  const clampedDistance = clamp(distance, minReach, maxReach);
  const reachable = distance <= maxReach && distance >= minReach;

  const cosRoot = clamp((l1 * l1 + clampedDistance * clampedDistance - l2 * l2) / (2 * l1 * clampedDistance), -1, 1);
  const angleRoot = Math.acos(cosRoot);
  const cosJoint = clamp((l1 * l1 + l2 * l2 - clampedDistance * clampedDistance) / (2 * l1 * l2), -1, 1);
  const angleJoint = Math.PI - Math.acos(cosJoint);

  const direction = normalize(toTarget);
  const reference = normalize(pole);
  let bend = cross(direction, reference);
  if (magnitude(bend) < 1e-6) bend = cross(direction, UP3);
  bend = normalize(bend);

  const jointDirection = rotateAroundAxis(bend, angleRoot);
  const joint = add(root, scale(jointDirection, l1));
  const end = add(joint, scale(normalize(subtract(target, joint)), l2));
  return { reachable, angleRoot, angleJoint, joint, end, distance };
}

/**
 * IK ba xương — giải theo trục giữa rồi phân bỏ góc còn lại.
 */
export function threeBoneIK(
  root: Vec3D,
  target: Vec3D,
  length1: number,
  length2: number,
  length3: number,
  pole: Vec3D = FORWARD3,
): {
  reachable: boolean;
  angles: number[];
  joint1: Vec3D;
  joint2: Vec3D;
  end: Vec3D;
  distance: number;
} {
  const total = length1 + length2 + length3;
  const distance = distance3D(root, target);
  const reachable = distance <= total;
  const clamped = clamp(distance, 1e-6, total);
  const share = clamped / total;
  const angles = [share * Math.PI * 0.75, share * Math.PI * 0.5, share * Math.PI * 0.35];
  const direction = normalize(subtract(target, root));
  const reference = normalize(pole);
  let bend = cross(direction, reference);
  if (magnitude(bend) < 1e-6) bend = cross(direction, UP3);
  bend = normalize(bend);

  const d1 = rotateAroundAxis(bend, angles[0]);
  const joint1 = add(root, scale(d1, length1));
  const d2 = rotateAroundAxis(bend, angles[1]);
  const joint2 = add(joint1, scale(d2, length2));
  const d3 = normalize(subtract(target, joint2));
  const end = add(joint2, scale(d3, length3));
  return { reachable, angles, joint1, joint2, end, distance };
}

/**
 * IK toàn thân — phân bổ trọng số cho các khớp theo khoảng cách tới đích.
 */
export function fullBodyIK(
  joints: Array<{ name: string; position: Vec3D }>,
  target: Vec3D,
  weights?: number[],
): { name: string; weight: number; error: number }[] {
  if (joints.length === 0) return [];
  const base = weights && weights.length === joints.length ? weights : ikWeights(joints.length);
  const scored = joints.map((joint, i) => ({
    name: joint.name,
    weight: base[i] / Math.max(1e-6, distance3D(joint.position, target)),
    error: distance3D(joint.position, target),
  }));
  const total = scored.reduce((sum, s) => sum + s.weight, 0) || 1;
  return scored.map((s) => ({ ...s, weight: s.weight / total }));
}

// ---------------------------------------------------------------------------
// Đường cong animation
// ---------------------------------------------------------------------------

/** Một điểm khoá của đường cong animation. */
export interface CurveKey {
  time: number;
  value: number;
}

/** Đọc các điểm khoá từ dữ liệu đường cong. */
export function readCurveKeys(source: unknown): CurveKey[] {
  const o = (source ?? {}) as Record<string, unknown>;
  const raw = o.keys ?? o.keyframes ?? o.points ?? o.values;
  if (Array.isArray(raw)) {
    const keys: CurveKey[] = [];
    for (const entry of raw) {
      if (typeof entry === 'number') {
        keys.push({ time: keys.length, value: entry });
        continue;
      }
      if (entry && typeof entry === 'object') {
        const e = entry as Record<string, unknown>;
        keys.push({
          time: num(e.time ?? e.t ?? e.x, keys.length),
          value: num(e.value ?? e.y ?? e.v, 0),
        });
      }
    }
    if (keys.length > 0) {
      keys.sort((a, b) => a.time - b.time);
      return keys;
    }
  }
  const start = readNum(o, ['start', 'from'], 0);
  const end = readNum(o, ['end', 'to'], 1);
  return [
    { time: 0, value: start },
    { time: 1, value: end },
  ];
}

/** Giá trị của đường cong tại thời điểm t (nội suy tuyến tính). */
export function curveValue(keys: CurveKey[], t: number): number {
  if (keys.length === 0) return 0;
  if (keys.length === 1) return keys[0].value;
  if (t <= keys[0].time) return keys[0].value;
  if (t >= keys[keys.length - 1].time) return keys[keys.length - 1].value;
  for (let i = 1; i < keys.length; i++) {
    if (keys[i].time >= t) {
      const span = keys[i].time - keys[i - 1].time;
      const local = span < 1e-9 ? 0 : (t - keys[i - 1].time) / span;
      return lerp(keys[i - 1].value, keys[i].value, local);
    }
  }
  return keys[keys.length - 1].value;
}

/** Đạo hàm của đường cong tại t. */
export function curveDerivative(keys: CurveKey[], t: number, epsilon = 0.01): number {
  if (keys.length < 2) return 0;
  const a = curveValue(keys, t - epsilon);
  const b = curveValue(keys, t + epsilon);
  return (b - a) / (2 * epsilon);
}

/** Tích phân đường cong từ 0 đến t (hình thang). */
export function curveIntegral(keys: CurveKey[], t: number, steps = 64): number {
  if (keys.length < 2) return 0;
  const count = Math.max(2, Math.floor(steps));
  const step = t / count;
  let total = 0;
  for (let i = 0; i < count; i++) {
    const t0 = i * step;
    const t1 = (i + 1) * step;
    total += ((curveValue(keys, t0) + curveValue(keys, t1)) / 2) * step;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Nhân vật
// ---------------------------------------------------------------------------

/** Kích thước nhân vật mặc định (m). */
export const CHARACTER_DIMENSIONS: Record<string, number> = Object.freeze({
  height: 1.8,
  width: 0.5,
  depth: 0.3,
  radius: 0.35,
  jumpVelocity: 4.5,
  gravity: 9.81,
  walkSpeed: 1.4,
  runSpeed: 5,
  turnRate: 3,
  interactionRange: 2,
});

/** Tốc độ nhân vật (ưu tiên `entity.velocity`). */
export function characterSpeed(entity: unknown): number {
  const explicit = readNum(entity, ['speed', 'moveSpeed', 'maxSpeed'], Number.NaN);
  if (Number.isFinite(explicit)) return explicit;
  const velocity = readVec(entity, ['velocity']);
  if (magnitude(velocity) > 0) return Math.hypot(velocity.x, velocity.z);
  const source = (entity ?? {}) as Record<string, unknown>;
  if (source.running === true || source.isRunning === true) return CHARACTER_DIMENSIONS.runSpeed;
  return CHARACTER_DIMENSIONS.walkSpeed;
}

/** Vận tốc nhân vật. */
export function characterVelocity(entity: unknown, dt: number): Vec3D {
  const velocity = readVec(entity, ['velocity']);
  if (magnitude(velocity) > 0) return velocity;
  const position = worldPoint(entity);
  const previous = readVec(entity, ['previousPosition', 'lastPosition']);
  return scale(subtract(position, previous), 1 / Math.max(1e-6, dt));
}

/** Gia tốc nhân vật. */
export function characterAcceleration(entity: unknown, dt: number): Vec3D {
  const explicit = readVec(entity, ['acceleration']);
  if (magnitude(explicit) > 0) return explicit;
  const velocity = readVec(entity, ['velocity']);
  const previous = readVec(entity, ['previousVelocity']);
  if (magnitude(previous) === 0) return { x: 0, y: 0, z: 0 };
  return scale(subtract(velocity, previous), 1 / Math.max(1e-6, dt));
}

/** Vận tốc nhảy để đạt một chiều cao cho trước. */
export function jumpVelocityForHeight(height: number, gravity: number = CHARACTER_DIMENSIONS.gravity): number {
  return Math.sqrt(Math.max(0, 2 * gravity * height));
}

/** Quãng đường dừng lại từ vận tốc hiện tại. */
export function stoppingDistance(speed: number, deceleration: number): number {
  if (deceleration <= 0) return Infinity;
  return (speed * speed) / (2 * deceleration);
}

/** Chiều cao rơi và vận tốc chạm đất. */
export function fallKinematics(fallHeight: number, gravity: number = CHARACTER_DIMENSIONS.gravity): {
  velocity: number;
  time: number;
  distance: number;
} {
  const height = Math.max(0, fallHeight);
  const velocity = Math.sqrt(2 * gravity * height);
  return { velocity, time: velocity / gravity, distance: height };
}

/** Tạo bản ghi kết quả chuẩn hoá. */
export function named(name: string, result: unknown, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: true,
    timestamp: Date.now(),
    result,
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi đo chuẩn hoá. */
export function scalar(name: string, value: number, unit = 'unit', extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: Number.isFinite(value),
    value,
    unit,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi hướng chuẩn hoá. */
export function direction(name: string, value: Vec3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: value.x !== 0 || value.y !== 0 || value.z !== 0,
    direction: value,
    magnitude: magnitude(value),
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi quaternion chuẩn hoá. */
export function orientation(name: string, value: QuatD, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: true,
    orientation: value,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi hộp bao chuẩn hoá. */
export function bounds(name: string, box: Box3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: true,
    min: box.min,
    max: box.max,
    center: {
      x: (box.min.x + box.max.x) / 2,
      y: (box.min.y + box.max.y) / 2,
      z: (box.min.z + box.max.z) / 2,
    },
    size: {
      x: box.max.x - box.min.x,
      y: box.max.y - box.min.y,
      z: box.max.z - box.min.z,
    },
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Tạo bản ghi va chạm chuẩn hoá. */
export function collide(
  name: string,
  hit: boolean,
  distance: number,
  point?: Vec3D,
  normal?: Vec3D,
  penetration = 0,
): Record<string, unknown> {
  return {
    name,
    valid: true,
    hit,
    collision: hit,
    overlap: hit,
    distance,
    point: point ?? { x: 0, y: 0, z: 0 },
    normal: normal ?? { x: 0, y: 1, z: 0 },
    penetration,
    timestamp: Date.now(),
  };
}

/** Khoảng cách có dấu giữa hai hướng quanh một trục. */
export function angleAroundAxis(from: Vec3D, to: Vec3D, axis: Vec3D = UP3): number {
  return signedAngle(from, to, axis);
}

/** Góc không dấu giữa hai hướng. */
export function angleBetween(from: Vec3D, to: Vec3D): number {
  return unsignedAngle(from, to);
}

/** Ma trận 4x4 từ vị trí + xoay + tỉ lệ. */
export function trsMatrix(position: Vec3D, quaternion: QuatD, scale: Vec3D): number[] {
  const { x, y, z, w } = normalizeQuaternion(quaternion);
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  return [
    (1 - (yy + zz)) * scale.x, xy - wz, (xz + wy) * scale.x, 0,
    xy + wz, (1 - (xx + zz)) * scale.y, yz - wx, 0,
    (xz - wy) * scale.y, yz + wx, (1 - (xx + yy)) * scale.z, 0,
    position.x, position.y, position.z, 1,
  ];
}

/** Quaternion hướng nhìn từ một điểm tới điểm khác. */
export function aimQuaternion(from: Vec3D, to: Vec3D, up: Vec3D = UP3): QuatD {
  return lookAtQuaternion(from, to, up);
}

/** Quaternion xoay từ hướng này sang hướng khác. */
export function alignQuaternion(from: Vec3D, to: Vec3D): QuatD {
  return rotationBetweenVectors(from, to);
}

/** Euler từ quaternion. */
export function eulerOf(q: QuatD): { x: number; y: number; z: number } {
  return quaternionToEuler(q);
}
