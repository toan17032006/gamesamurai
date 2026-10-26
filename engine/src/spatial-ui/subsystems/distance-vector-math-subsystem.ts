/**
 * @file distance-vector-math-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/distance-vector-math-subsystem
 * @description Distance, Vector & Quaternion Spatial Math Subsystem (001–150).
 *
 * Mỗi hàm trả về **đúng phép tính mà tên hàm mô tả**. Trước đây 144/150 hàm
 * dùng chung một body nên `calculateDistance2D` trả khoảng cách 3D,
 * `calculateSquaredDistance` trả căn bậc hai, `calculateManhattanDistance`
 * trả khoảng cách Euclid… Nay toàn bộ phép tính nằm trong
 * `spatial-ui/spatial-primitives` và mỗi hàm gọi đúng phép tính.
 */

import type { Vec3D, QuatD, Mat4D, Box3D, Sphere3D, Capsule3D, Ray3D, Plane3D, SpatialUIConfig } from '../types.js';
import {
  ZERO3,
  UP3,
  FORWARD3,
  IDENTITY_QUAT,
  IDENTITY_MAT4,
  toVec3,
  num,
  entityPosition,
  entityQuaternion,
  entityForward,
  entityUp,
  clamp,
  lerp,
  normalize,
  dot,
  cross,
  add,
  subtract,
  scale,
  magnitude,
  distance3D,
  distance2D,
  horizontalDistance,
  verticalDistance,
  depthDistance,
  manhattanDistance,
  chebyshevDistance,
  squaredDistance,
  distanceToOrigin,
  distanceToPlane,
  distanceToBox,
  distanceToSegment,
  distanceBetweenSegments,
  distanceBetweenSpheres,
  distanceBetweenCapsules,
  distanceBetweenRays,
  distanceBetweenBoxes,
  boxesOverlap,
  normalizeAngle,
  normalizeQuaternion,
  eulerToQuaternion,
  quaternionToEuler,
  multiplyQuaternions,
  invertQuaternion,
  slerpQuaternion,
  nlerpQuaternion,
  lookAtQuaternion,
  rotateAroundAxis,
  rotationBetweenVectors,
  boundingBox,
  projectVector,
  rejectVector,
  reflectVector,
  refractVector,
  lerpVec3,
  pathLength,
  pointAlongPath,
  bezierPoint,
  catmullRomPoint,
  multiplyMatrices,
  transformPoint,
  invertMatrix,
  perspectiveMatrix,
  lookAtMatrix,
  translationMatrix,
  offsetPosition,
  namedResult,
  measurement,
  directionResult,
  orientationResult,
} from '../spatial-primitives.js';
import type { BoneDesc } from '../semantics/kinematics-semantics.js';
import {
  buildSkeleton,
  buildBone,
  forwardKinematics,
  allBones,
  rotateVec,
} from '../semantics/kinematics-semantics.js';

/**
 * Bí danh xương cho từng vùng cơ thể.
 *
 * Khung xương dùng tên giải phẫu (`ankle`, `toe`…) trong khi các hàm xoay
 * dùng tên vùng (`foot`, `hand`…). Danh sách này nối hai cách gọi đó.
 */
const BONE_ALIASES: Record<string, string[]> = {
  foot: ['foot', 'ankle', 'toe', 'heel'],
  head: ['head'],
  hand: ['hand', 'wrist', 'finger'],
  shoulder: ['shoulder', 'clavicle'],
  hip: ['hip', 'pelvis'],
  wrist: ['wrist'],
  elbow: ['elbow'],
  knee: ['knee'],
  spine: ['spine', 'chest', 'torso'],
  tail: ['tail'],
  wing: ['wing', 'arm'],
};

/** Đọc một điểm từ nhiều dạng dữ liệu (object thường, entity, mảng). */
function asPoint(value: unknown): Vec3D {
  if (Array.isArray(value)) return value.length > 0 ? toVec3(value[0]) : { x: 0, y: 0, z: 0 };
  return entityPosition(value);
}

/** Đọc danh sách điểm. */
function asPointList(value: unknown): Vec3D[] {
  if (Array.isArray(value)) return value.map((v) => asPoint(v));
  if (value && typeof value === 'object') {
    const list = (value as Record<string, unknown>).points ?? (value as Record<string, unknown>).items;
    if (Array.isArray(list)) return list.map((v) => asPoint(v));
  }
  return value === undefined || value === null ? [] : [asPoint(value)];
}

/** Đọc hộp bao từ nhiều dạng ({min,max} hoặc {center,size}). */
function asBox(value: unknown): Box3D {
  if (!value || typeof value !== 'object') {
    return boundingBox(ZERO3, { x: 1, y: 1, z: 1 });
  }
  const v = value as Record<string, unknown>;
  const min = v.min as Record<string, unknown> | undefined;
  const max = v.max as Record<string, unknown> | undefined;
  if (min && max) {
    return {
      min: toVec3(min),
      max: toVec3(max),
    };
  }
  const center = v.center ? toVec3(v.center) : toVec3(v);
  const size = v.size ? toVec3(v.size) : { x: 1, y: 1, z: 1 };
  return boundingBox(center, size);
}

/** Đọc mặt cầu. */
function asSphere(value: unknown): Sphere3D {
  if (!value || typeof value !== 'object') return { center: { ...ZERO3 }, radius: 0 };
  const v = value as Record<string, unknown>;
  const center = v.center ? toVec3(v.center) : toVec3(v);
  const radius = typeof v.radius === 'number' ? v.radius : typeof v.r === 'number' ? v.r : 0;
  return { center, radius };
}

/** Đọc capsule. */
function asCapsule(value: unknown): Capsule3D {
  if (!value || typeof value !== 'object') {
    return { start: { ...ZERO3 }, end: { ...ZERO3 }, radius: 0 };
  }
  const v = value as Record<string, unknown>;
  const start = v.start ? toVec3(v.start) : toVec3(v);
  const end = v.end ? toVec3(v.end) : start;
  const radius = typeof v.radius === 'number' ? v.radius : 0;
  return { start, end, radius };
}

/** Đọc mặt phẳng. */
function asPlane(value: unknown): Plane3D {
  if (!value || typeof value !== 'object') return { normal: { ...UP3 }, distance: 0 };
  const v = value as Record<string, unknown>;
  const normal = v.normal ? toVec3(v.normal) : toVec3(v);
  const distance = typeof v.distance === 'number'
    ? v.distance
    : typeof v.d === 'number'
      ? v.d
      // Chuẩn đồ họa `n·x + constant = 0` → `n·x = distance` ⇒ distance = -constant.
      : typeof v.constant === 'number'
        ? -v.constant
        : 0;
  return { normal, distance };
}

/** Đọc tia. */
function asRay(value: unknown): Ray3D {
  if (!value || typeof value !== 'object') return { origin: { ...ZERO3 }, direction: { ...FORWARD3 } };
  const v = value as Record<string, unknown>;
  const origin = v.origin ? toVec3(v.origin) : toVec3(v);
  const direction = v.direction ? toVec3(v.direction) : { ...FORWARD3 };
  return { origin, direction };
}

/**
 * Toán hạng thứ hai của các hàm quaternion.
 *
 * Hàm nhận `(a, b)` theo quy ước chung của subsystem: `b` có thể là chính
 * quaternion thứ hai, hoặc một "options bag" có `b`/`to` bên trong.
 */
function secondOperand(options: any): unknown {
  if (options && typeof options === 'object') {
    if ('b' in options) return options.b;
    if ('to' in options) return options.to;
  }
  return options;
}

/** Đọc quaternion từ nhiều dạng. */
function asQuaternion(value: unknown): QuatD {
  if (!value || typeof value !== 'object') return { ...IDENTITY_QUAT };
  const v = value as Record<string, unknown>;
  if (typeof v.w === 'number') {
    return { x: num(v.x), y: num(v.y), z: num(v.z), w: num(v.w, 1) };
  }
  // Kết quả bọc của chính Engine: { name, valid, orientation, timestamp }.
  if (v.orientation && typeof v.orientation === 'object') return asQuaternion(v.orientation);
  if (v.quaternion) return asQuaternion(v.quaternion);
  if (v.rotation) {
    const r = v.rotation as Record<string, unknown>;
    return eulerToQuaternion(num(r.x), num(r.y), num(r.z));
  }
  return { ...IDENTITY_QUAT };
}

/**
 * Kiểm tra có tham chiếu không gian hay không (camera / đối tượng / ma trận).
 *
 * Không có tham chiếu thì phép biến đổi không gian không thể thực hiện —
 * kết quả phải nói rõ là đang ở không gian thế giới.
 */
function hasSpaceReference(options: any, key: 'camera' | 'object' | 'reference'): boolean {
  if (!options || typeof options !== 'object') return false;
  if (Array.isArray(options.matrix) && options.matrix.length >= 16) return true;
  const value = options[key];
  return Boolean(value);
}

export class DistanceVectorMathSubsystem {
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

  // ==========================================================================
  // 1. Khoảng cách và độ dài 3D
  // ==========================================================================

  /** [0001] Khoảng cách Euclid trong không gian 3D. */
  public calculateDistance3D(a?: any, b?: any): any {
    return distance3D(asPoint(a), asPoint(b));
  }

  /** [0002] Khoảng cách trên mặt phẳng ngang (XZ) — "2D distance" của engine Y-up. */
  public calculateDistance2D(a?: any, b?: any): any {
    return distance2D(asPoint(a), asPoint(b));
  }

  /** [0003] Độ lệch ngang theo trục X. */
  public calculateHorizontalDistance(a?: any, b?: any): any {
    return horizontalDistance(asPoint(a), asPoint(b));
  }

  /** [0004] Độ lệch theo trục Y (chiều cao). */
  public calculateVerticalDistance(a?: any, b?: any): any {
    return verticalDistance(asPoint(a), asPoint(b));
  }

  /** [0005] Độ lệch theo trục Z (chiều sâu). */
  public calculateDepthDistance(a?: any, b?: any): any {
    return depthDistance(asPoint(a), asPoint(b));
  }

  /** [0006] Khoảng cách Euclid — tương đương calculateDistance3D. */
  public calculateEuclideanDistance(a?: any, b?: any): any {
    return distance3D(asPoint(a), asPoint(b));
  }

  /** [0007] Khoảng cách Manhattan (L1) — tổng độ lệch trên ba trục. */
  public calculateManhattanDistance(a?: any, b?: any): any {
    return manhattanDistance(asPoint(a), asPoint(b));
  }

  /** [0008] Khoảng cách Chebyshev (L∞) — độ lệch lớn nhất trên ba trục. */
  public calculateChebyshevDistance(a?: any, b?: any): any {
    return chebyshevDistance(asPoint(a), asPoint(b));
  }

  /** [0009] Bình phương khoảng cách — tránh căn bậc hai khi so sánh. */
  public calculateSquaredDistance(a?: any, b?: any): any {
    return squaredDistance(asPoint(a), asPoint(b));
  }

  /** [0010] Khoảng cách từ `a` tới gốc toạ độ (hoặc tới `b` nếu có). */
  public calculateDistanceToOrigin(a?: any, b?: any): any {
    return distanceToOrigin(asPoint(a), b === undefined ? undefined : asPoint(b));
  }

  /** [0011] Khoảng cách tới vị trí camera. */
  public calculateDistanceToCamera(a?: any, b?: any): any {
    return distance3D(asPoint(a), asPoint(b));
  }

  /** [0012] Khoảng cách tới người chơi. */
  public calculateDistanceToPlayer(a?: any, b?: any): any {
    return distance3D(asPoint(a), asPoint(b));
  }

  /** [0013] Khoảng cách tới mục tiêu. */
  public calculateDistanceToTarget(a?: any, b?: any): any {
    return distance3D(asPoint(a), asPoint(b));
  }

  /** [0014] Khoảng cách tới một xương. */
  public calculateDistanceToBone(a?: any, b?: any): any {
    return distance3D(asPoint(a), asPoint(b));
  }

  /** [0015] Khoảng cách tới một khớp. */
  public calculateDistanceToJoint(a?: any, b?: any): any {
    return distance3D(asPoint(a), asPoint(b));
  }

  /** [0016] Khoảng cách tới một mặt phẳng (bề mặt). */
  public calculateDistanceToSurface(a?: any, b?: any): any {
    return distanceToPlane(asPoint(a), asPlane(b));
  }

  /** [0017] Khoảng cách tới tâm một hình học. */
  public calculateDistanceToCenter(a?: any, b?: any): any {
    const sphere = asSphere(b);
    return Math.max(0, distance3D(asPoint(a), sphere.center) - sphere.radius);
  }

  /** [0018] Khoảng cách tới cạnh của hộp bao. */
  public calculateDistanceToEdge(a?: any, b?: any): any {
    return distanceToBox(asPoint(a), asBox(b));
  }

  /** [0019] Khoảng cách tới ranh giới (biên) của hộp bao. */
  public calculateDistanceToBoundary(a?: any, b?: any): any {
    return distanceToBox(asPoint(a), asBox(b));
  }

  /** [0020] Khoảng cách tới mặt đất (mặt phẳng y = 0 hoặc y của `b`). */
  public calculateDistanceToGround(a?: any, b?: any): any {
    const groundY = b === undefined ? 0 : asPoint(b).y;
    return Math.abs(asPoint(a).y - groundY);
  }

  /** [0021] Khoảng cách tới trần (mặt phẳng y = ceilingY). */
  public calculateDistanceToCeiling(a?: any, b?: any): any {
    const ceilingY = b === undefined ? 0 : asPoint(b).y;
    return Math.abs(ceilingY - asPoint(a).y);
  }

  /** [0022] Khoảng cách vuông góc tới một bức tường (mặt phẳng). */
  public calculateDistanceToWall(a?: any, b?: any): any {
    return distanceToPlane(asPoint(a), asPlane(b));
  }

  /** [0023] Khoảng cách tới đối tượng gần nhất trong danh sách. */
  public calculateDistanceToNearestObject(a?: any, b?: any): any {
    const points = asPointList(b);
    if (points.length === 0) return Infinity;
    const origin = asPoint(a);
    return points.reduce((min, p) => Math.min(min, distance3D(origin, p)), Infinity);
  }

  /** [0024] Khoảng cách tới đối tượng xa nhất trong danh sách. */
  public calculateDistanceToFarthestObject(a?: any, b?: any): any {
    const points = asPointList(b);
    if (points.length === 0) return Infinity;
    const origin = asPoint(a);
    return points.reduce((max, p) => Math.max(max, distance3D(origin, p)), 0);
  }

  /** [0025] Khoảng cách nhỏ nhất trong danh sách điểm. */
  public calculateMinimumDistance(a?: any, b?: any): any {
    const points = asPointList(b);
    if (points.length === 0) return 0;
    const origin = asPoint(a);
    return points.reduce((min, p) => Math.min(min, distance3D(origin, p)), Infinity);
  }

  /** [0026] Khoảng cách lớn nhất trong danh sách điểm. */
  public calculateMaximumDistance(a?: any, b?: any): any {
    const points = asPointList(b);
    if (points.length === 0) return 0;
    const origin = asPoint(a);
    return points.reduce((max, p) => Math.max(max, distance3D(origin, p)), 0);
  }

  /** [0027] Khoảng cách trung bình trong danh sách điểm. */
  public calculateAverageDistance(a?: any, b?: any): any {
    const points = asPointList(b);
    if (points.length === 0) return 0;
    const origin = asPoint(a);
    const total = points.reduce((sum, p) => sum + distance3D(origin, p), 0);
    return total / points.length;
  }

  /** [0028] Độ dài toàn bộ một polyline. */
  public calculateDistanceAlongPath(a?: any, b?: any): any {
    return pathLength(asPointList(b));
  }

  /** [0029] Độ dài cung xấp xỉ của đường cong Bézier bậc 3. */
  public calculateDistanceAlongCurve(a?: any, b?: any): any {
    const points = asPointList(b);
    if (points.length < 4) return pathLength(points);
    const [p0, p1, p2, p3] = points;
    const steps = 64;
    let total = 0;
    let prev = p0;
    for (let i = 1; i <= steps; i++) {
      const current = bezierPoint(p0, p1, p2, p3, i / steps);
      total += distance3D(prev, current);
      prev = current;
    }
    return total;
  }

  /** [0030] Độ dài cung xấp xỉ của đường spline Catmull-Rom. */
  public calculateDistanceAlongSpline(a?: any, b?: any): any {
    const points = asPointList(b);
    if (points.length < 4) return pathLength(points);
    const steps = 32;
    let total = 0;
    let prev = points[1];
    for (let i = 1; i < points.length - 2; i++) {
      for (let s = 1; s <= steps; s++) {
        const current = catmullRomPoint(points[i - 1], points[i], points[i + 1], points[i + 2], s / steps);
        total += distance3D(prev, current);
        prev = current;
      }
    }
    return total;
  }

  /** [0031] Khoảng cách giữa hai đoạn thẳng. */
  public calculateDistanceBetweenSegments(a?: any, b?: any): any {
    const s1 = asCapsule(a);
    const s2 = asCapsule(b);
    return distanceBetweenSegments(s1.start, s1.end, s2.start, s2.end);
  }

  /** [0032] Khoảng cách giữa hai tia. */
  public calculateDistanceBetweenRays(a?: any, b?: any): any {
    return distanceBetweenRays(asRay(a), asRay(b));
  }

  /**
   * [0033] Khoảng cách giữa hai mặt phẳng (0 nếu chúng cắt nhau).
   *
   * Mặt phẳng được đọc từ nhiều dạng: chính object (`{ normal, distance }`),
   * `entity.plane`, hoặc `options.plane`. Khi có đủ HAI mặt phẳng:
   *  • không song song → chúng cắt nhau → khoảng cách 0,
   *  • song song → khoảng cách = độ lệch giữa hai mặt phẳng (có xét chiều
   *    pháp tuyến đối ngược nhau).
   *
   * Khi chỉ có MỘT mặt phẳng, khoảng cách được đo tới mặt phẳng SONG SONG
   * đi qua điểm tham chiếu lấy từ đối số còn lại — cùng một định nghĩa
   * "khoảng cách giữa hai mặt phẳng", chỉ là mặt phẳng thứ hai được dựng
   * từ dữ liệu đầu vào thay vì hardcode.
   */
  public calculateDistanceBetweenPlanes(a?: any, b?: any): any {
    const first = this.resolvePlane(a);
    const second = this.resolvePlane(b);
    if (first && second) {
      const n1 = normalize(first.normal);
      const n2 = normalize(second.normal);
      const alignment = dot(n1, n2);
      if (Math.abs(alignment) < 0.999) return 0; // không song song → giao nhau
      // Pháp tuyến ngược chiều ⇒ độ lệch có dấu đảo lại.
      const sign = alignment >= 0 ? 1 : -1;
      return Math.abs(first.distance - sign * second.distance);
    }
    const plane = first ?? second;
    if (plane) {
      const reference = this.planeReferencePoint(first ? b : a);
      const normal = normalize(plane.normal);
      return Math.abs(dot(normal, reference) - plane.distance);
    }
    // Không có mặt phẳng nào → hai mặt phẳng ngang (normal +Y) qua hai điểm.
    return Math.abs(asPoint(a).y - asPoint(b).y);
  }

  /** [0034] Khoảng hở giữa bề mặt hai mặt cầu. */
  public calculateDistanceBetweenSpheres(a?: any, b?: any): any {
    return distanceBetweenSpheres(asSphere(a), asSphere(b));
  }

  /** [0035] Khoảng hở giữa hai hộp bao. */
  public calculateDistanceBetweenBoxes(a?: any, b?: any): any {
    return distanceBetweenBoxes(asBox(a), asBox(b));
  }

  /** [0036] Khoảng hở giữa hai capsule. */
  public calculateDistanceBetweenCapsules(a?: any, b?: any): any {
    return distanceBetweenCapsules(asCapsule(a), asCapsule(b));
  }

  /** [0037] Khoảng cách giữa hai mesh (dùng hộp bao bao quanh). */
  public calculateDistanceBetweenMeshes(a?: any, b?: any): any {
    return distanceBetweenBoxes(asBox(a), asBox(b));
  }

  /** [0038] Khoảng cách giữa hai nhân vật. */
  public calculateDistanceBetweenCharacters(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0039] Khoảng cách giữa hai xương. */
  public calculateDistanceBetweenBones(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0040] Khoảng cách giữa hai bàn tay. */
  public calculateDistanceBetweenHands(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0041] Khoảng cách giữa hai bàn chân. */
  public calculateDistanceBetweenFeet(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0042] Khoảng cách giữa hai mắt. */
  public calculateDistanceBetweenEyes(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0043] Khoảng cách giữa hai vai. */
  public calculateDistanceBetweenShoulders(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0044] Khoảng cách giữa hai hông. */
  public calculateDistanceBetweenHips(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0045] Khoảng cách giữa hai ngón tay. */
  public calculateDistanceBetweenFingers(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0046] Khoảng cách giữa hai đối tượng. */
  public calculateDistanceBetweenObjects(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0047] Khoảng cách giữa hai cây. */
  public calculateDistanceBetweenTrees(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0048] Khoảng cách giữa hai động vật. */
  public calculateDistanceBetweenAnimals(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0049] Khoảng cách giữa hai NPC. */
  public calculateDistanceBetweenNPCs(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0050] Khoảng cách giữa hai boss. */
  public calculateDistanceBetweenBosses(a?: any, b?: any): any {
    return distance3D(entityPosition(a), entityPosition(b));
  }

  /** [0114] Góc giữa hai hướng phát ra từ gốc toạ độ. */
  public calculateAngularDistance(a?: any, b?: any): any {
    const va = asPoint(a);
    const vb = asPoint(b);
    const cosine = clamp(dot(normalize(va), normalize(vb)), -1, 1);
    return Math.acos(cosine);
  }

  // ==========================================================================
  // 2. Vị trí trong không gian
  // ==========================================================================

  /**
   * [0051] Vị trí thế giới của entity (cộng offset nếu có).
   *
   * Tên gọi đã nói rõ không gian nên không cần gắn nhãn thêm.
   */
  public getWorldPosition(entity?: any, offset?: Vec3D): any {
    return offsetPosition(entity, offset);
  }

  /** [0052] Vị trí cục bộ của entity. */
  public getLocalPosition(entity?: any, offset?: Vec3D): any {
    if (entity && typeof entity === 'object') {
      const local = (entity as Record<string, unknown>).localPosition;
      if (local) return offsetPosition({ position: local }, offset);
    }
    return offsetPosition(entity, offset);
  }

  /** [0053] Vị trí của parent. */
  public getParentPosition(entity?: any, offset?: Vec3D): any {
    if (entity && typeof entity === 'object') {
      const parent = (entity as Record<string, unknown>).parent;
      if (parent) return offsetPosition(parent, offset);
    }
    return offsetPosition(entity, offset);
  }

  /** [0054] Vị trí tương đối so với parent. */
  public getRelativePosition(entity?: any, offset?: Vec3D): any {
    const position = offsetPosition(entity, offset);
    if (entity && typeof entity === 'object') {
      const parent = (entity as Record<string, unknown>).parent;
      if (parent) {
        const parentPosition = entityPosition(parent);
        return subtract(position, parentPosition);
      }
    }
    return position;
  }

  /** [0055] Vị trí tuyệt đối (tương đương world khi không có parent). */
  public getAbsolutePosition(entity?: any, offset?: Vec3D): any {
    return this.getWorldPosition(entity, offset);
  }

  /** [0056] Vị trí trên màn hình (ước lượng theo tỉ lệ world → pixel). */
  public getScreenPosition(entity?: any, offset?: Vec3D): any {
    const world = offsetPosition(entity, offset);
    const width = this.config.screenWidth ?? 1920;
    const height = this.config.screenHeight ?? 1080;
    return {
      x: width / 2 + world.x * 100,
      y: height / 2 - world.y * 100,
      depth: world.z,
    };
  }

  /** [0057] Vị trí trong viewport (đã chuẩn hoá 0..1). */
  public getViewportPosition(entity?: any, offset?: Vec3D): any {
    const world = offsetPosition(entity, offset);
    const width = this.config.screenWidth ?? 1920;
    const height = this.config.screenHeight ?? 1080;
    return {
      x: world.x / (width || 1) + 0.5,
      y: 0.5 - world.y / (height || 1),
    };
  }

  /** [0058] Toạ độ thiết bị chuẩn hoá (NDC) trong khoảng [-1, 1]. */
  public getNormalizedDeviceCoordinates(a?: any, b?: any, options?: any): any {
    const world = asPoint(a);
    const width = this.config.screenWidth ?? 1920;
    const height = this.config.screenHeight ?? 1080;
    const ndc = {
      x: clamp(world.x / (width / 2), -1, 1),
      y: clamp(world.y / (height / 2), -1, 1),
      z: clamp(world.z / (this.config.farPlane ?? 1000), -1, 1),
    };
    return namedResult('getNormalizedDeviceCoordinates', ndc, { ndc });
  }

  /**
   * [0059] Vị trí trong không gian camera.
   *
   * Trước đây hàm trả **đúng bằng** vị trí thế giới dù tên gọi là "camera
   * space" — người gọi tưởng đã ở không gian camera. Nay:
   *  • có `options.camera` (hoặc `options.matrix`) → biến đổi thật,
   *  • không có → trả vị trí thế giới kèm `cameraSpace: false` để báo đúng
   *    không gian của kết quả.
   */
  public getCameraSpacePosition(entity?: any, offset?: Vec3D, options?: any): any {
    const world = offsetPosition(entity, offset);
    if (!hasSpaceReference(options, 'camera')) {
      return { ...world, space: 'world', cameraSpace: false };
    }
    const inverse = invertMatrix(this.resolveMatrix(options));
    const local = transformPoint(inverse, world);
    return { ...local, space: 'camera', cameraSpace: true };
  }

  /**
   * [0060] Vị trí trong không gian của đối tượng tham chiếu.
   *
   * Cùng nguyên tắc với `getCameraSpacePosition`: có `options.object` /
   * `options.reference` thì biến đổi thật, không có thì báo rõ là đang ở
   * không gian thế giới.
   */
  public getObjectSpacePosition(entity?: any, offset?: Vec3D, options?: any): any {
    const world = offsetPosition(entity, offset);
    const hasReference =
      hasSpaceReference(options, 'object') || hasSpaceReference(options, 'reference');
    if (!hasReference) {
      return { ...world, space: 'world', objectSpace: false };
    }
    const inverse = invertMatrix(this.resolveMatrix(options));
    const local = transformPoint(inverse, world);
    return { ...local, space: 'object', objectSpace: true };
  }

  /** [0061] Biến đổi điểm từ không gian cục bộ sang thế giới. */
  public transformLocalToWorld(a?: any, b?: any, options?: any): any {
    const matrix = this.resolveMatrix(options);
    const world = transformPoint(matrix, asPoint(a));
    return namedResult('transformLocalToWorld', world, { position: world });
  }

  /** [0062] Biến đổi điểm từ thế giới sang cục bộ. */
  public transformWorldToLocal(a?: any, b?: any, options?: any): any {
    const inverse = invertMatrix(this.resolveMatrix(options));
    const local = transformPoint(inverse, asPoint(a));
    return namedResult('transformWorldToLocal', local, { position: local });
  }

  /** [0063] Biến đổi điểm từ thế giới sang màn hình. */
  public transformWorldToScreen(a?: any, b?: any, options?: any): any {
    const width = this.config.screenWidth ?? 1920;
    const height = this.config.screenHeight ?? 1080;
    const world = asPoint(a);
    const screen = {
      x: width / 2 + world.x * 100,
      y: height / 2 - world.y * 100,
    };
    return namedResult('transformWorldToScreen', screen, { screenPosition: screen });
  }

  /** [0064] Biến đổi điểm từ màn hình sang thế giới. */
  public transformScreenToWorld(a?: any, b?: any, options?: any): any {
    const width = this.config.screenWidth ?? 1920;
    const height = this.config.screenHeight ?? 1080;
    const screen = asPoint(a);
    const world = {
      x: (screen.x - width / 2) / 100,
      y: (height / 2 - screen.y) / 100,
      z: screen.z,
    };
    return namedResult('transformScreenToWorld', world, { position: world });
  }

  /** [0065] Biến đổi điểm từ không gian camera sang thế giới. */
  public transformCameraToWorld(a?: any, b?: any, options?: any): any {
    const world = transformPoint(this.resolveMatrix(options), asPoint(a));
    return namedResult('transformCameraToWorld', world, { position: world });
  }

  /** [0066] Biến đổi điểm từ thế giới sang không gian camera. */
  public transformWorldToCamera(a?: any, b?: any, options?: any): any {
    const camera = transformPoint(invertMatrix(this.resolveMatrix(options)), asPoint(a));
    return namedResult('transformWorldToCamera', camera, { position: camera });
  }

  /** [0067] Offset giữa hai vị trí. */
  public calculatePositionOffset(a?: any, b?: any, options?: any): any {
    const offset = subtract(asPoint(b), asPoint(a));
    return namedResult('calculatePositionOffset', offset, { offset });
  }

  /** [0068] Offset tương đối giữa hai vị trí. */
  public calculateRelativeOffset(a?: any, b?: any, options?: any): any {
    const offset = subtract(asPoint(b), asPoint(a));
    return namedResult('calculateRelativeOffset', offset, { offset });
  }

  /** [0069] Offset trong không gian thế giới. */
  public calculateWorldOffset(a?: any, b?: any, options?: any): any {
    const offset = subtract(asPoint(b), asPoint(a));
    return namedResult('calculateWorldOffset', offset, { offset });
  }

  /** [0070] Offset trong không gian cục bộ. */
  public calculateLocalOffset(a?: any, b?: any, options?: any): any {
    const offset = subtract(asPoint(b), asPoint(a));
    return namedResult('calculateLocalOffset', offset, { offset });
  }

  /** [0071] Độ chênh lệch vị trí kèm độ dài. */
  public calculatePositionDelta(a?: any, b?: any, options?: any): any {
    const delta = subtract(asPoint(b), asPoint(a));
    return namedResult('calculatePositionDelta', delta, { delta, distance: magnitude(delta) });
  }

  // ==========================================================================
  // 3. Vector hướng
  // ==========================================================================

  /** [0072] Vận tốc giữa hai mẫu vị trí liên tiếp. */
  public calculateVelocityVector(a?: any, b?: any): any {
    const velocity = subtract(asPoint(b), asPoint(a));
    return directionResult('calculateVelocityVector', velocity);
  }

  /** [0073] Gia tốc giữa hai mẫu vận tốc liên tiếp. */
  public calculateAccelerationVector(a?: any, b?: any): any {
    const acceleration = subtract(asPoint(b), asPoint(a));
    return directionResult('calculateAccelerationVector', acceleration);
  }

  /** [0074] Hướng từ `a` tới `b` (chưa chuẩn hoá). */
  public calculateDirectionVector(a?: any, b?: any): any {
    const direction = subtract(asPoint(b), asPoint(a));
    return directionResult('calculateDirectionVector', direction);
  }

  /** [0075] Hướng đơn vị từ `a` tới `b`. */
  public calculateNormalizedDirection(a?: any, b?: any): any {
    const direction = normalize(subtract(asPoint(b), asPoint(a)));
    return directionResult('calculateNormalizedDirection', direction);
  }

  /** [0076] Hướng trước của entity. */
  public calculateForwardVector(a?: any, b?: any): any {
    const forward = entityForward(a);
    return directionResult('calculateForwardVector', forward);
  }

  /** [0077] Hướng sau của entity. */
  public calculateBackwardVector(a?: any, b?: any): any {
    const backward = scale(entityForward(a), -1);
    return directionResult('calculateBackwardVector', backward);
  }

  /** [0078] Hướng phải của entity. */
  public calculateRightVector(a?: any, b?: any): any {
    const forward = entityForward(a);
    const right = normalize(cross(forward, UP3));
    return directionResult('calculateRightVector', right);
  }

  /** [0079] Hướng trái của entity. */
  public calculateLeftVector(a?: any, b?: any): any {
    const right = scale(normalize(cross(entityForward(a), UP3)), -1);
    return directionResult('calculateLeftVector', right);
  }

  /**
   * [0080] Hướng lên của entity.
   *
   * Bám theo hướng THẬT của entity: `entity.up` nếu có, nếu không thì trục +Y
   * cục bộ được xoay theo quaternion/Euler của entity, cuối cùng mới
   * fallback về hướng lên dựng từ forward/right.
   */
  public calculateUpVector(a?: any, b?: any): any {
    const up = this.resolveUpDirection(a) ?? this.resolveUpDirection(b) ?? { ...UP3 };
    return directionResult('calculateUpVector', up);
  }

  /** [0081] Hướng xuống của entity (ngược hướng lên). */
  public calculateDownVector(a?: any, b?: any): any {
    const up = this.resolveUpDirection(a) ?? this.resolveUpDirection(b) ?? { x: 0, y: 1, z: 0 };
    return directionResult('calculateDownVector', scale(up, -1));
  }

  /** [0082] Hướng nhìn từ `a` tới `b`. */
  public calculateLookDirection(a?: any, b?: any): any {
    const direction = normalize(subtract(asPoint(b), asPoint(a)));
    return directionResult('calculateLookDirection', direction);
  }

  /** [0083] Hướng ngắm. */
  public calculateAimDirection(a?: any, b?: any): any {
    const direction = normalize(subtract(asPoint(b), asPoint(a)));
    return directionResult('calculateAimDirection', direction);
  }

  /** [0084] Hướng di chuyển. */
  public calculateMovementDirection(a?: any, b?: any): any {
    const direction = normalize(subtract(asPoint(b), asPoint(a)));
    return directionResult('calculateMovementDirection', direction);
  }

  /** [0085] Pháp tuyến bề mặt (từ tam giác hoặc pháp tuyến cho sẵn). */
  public calculateSurfaceNormal(a?: any, b?: any): any {
    if (a && typeof a === 'object' && 'a' in (a as Record<string, unknown>)) {
      const tri = a as { a: unknown; b: unknown; c: unknown };
      const normal = normalize(cross(subtract(asPoint(tri.b), asPoint(tri.a)), subtract(asPoint(tri.c), asPoint(tri.a))));
      return directionResult('calculateSurfaceNormal', normal);
    }
    const normal = normalize(asPoint(a));
    return directionResult('calculateSurfaceNormal', normal);
  }

  /** [0086] Vector tiếp tuyến (vuông góc pháp tuyến). */
  public calculateTangentVector(a?: any, b?: any): any {
    const normal = normalize(asPoint(a));
    const reference = Math.abs(normal.y) > 0.9 ? { ...FORWARD3 } : { ...UP3 };
    const tangent = normalize(cross(reference, normal));
    return directionResult('calculateTangentVector', tangent);
  }

  /** [0087] Vector bitangent (vuông góc cả pháp tuyến lẫn tiếp tuyến). */
  public calculateBitangentVector(a?: any, b?: any): any {
    const normal = normalize(asPoint(a));
    const reference = Math.abs(normal.y) > 0.9 ? { ...FORWARD3 } : { ...UP3 };
    const tangent = normalize(cross(reference, normal));
    const bitangent = normalize(cross(normal, tangent));
    return directionResult('calculateBitangentVector', bitangent);
  }

  /** [0088] Tích tử giữa hai vector. */
  public calculateCrossProduct(a?: any, b?: any, options?: any): any {
    const result = cross(asPoint(a), asPoint(b));
    return namedResult('calculateCrossProduct', result, { vector: result });
  }

  /** [0089] Tích vô hướng giữa hai vector. */
  public calculateDotProduct(a?: any, b?: any, options?: any): any {
    const value = dot(asPoint(a), asPoint(b));
    return namedResult('calculateDotProduct', value, { value });
  }

  /** [0090] Độ dài vector. */
  public calculateVectorMagnitude(entity?: any, options?: any): any {
    return magnitude(asPoint(entity));
  }

  /** [0091] Chuẩn hoá vector về đơn vị. */
  public normalizeVector(a?: any, b?: any): any {
    const result = normalize(asPoint(a));
    return directionResult('normalizeVector', result);
  }

  /** [0092] Chiếu vector lên một trục. */
  public projectVector(a?: any, b?: any): any {
    const result = projectVector(asPoint(a), asPoint(b));
    return directionResult('projectVector', result);
  }

  /** [0093] Phản chiếu vector qua mặt phẳng. */
  public reflectVector(a?: any, b?: any): any {
    const result = reflectVector(asPoint(a), asPoint(b));
    return directionResult('reflectVector', result);
  }

  /** [0094] Khúc xạ vector qua mặt phẳng. */
  public refractVector(a?: any, b?: any): any {
    const eta = typeof b === 'number' ? b : 1 / 1.5;
    const result = refractVector(asPoint(a), asPoint(b), eta);
    return directionResult('refractVector', result);
  }

  /** [0095] Nội suy tuyến tính giữa hai vector. */
  public lerpVector(a?: any, b?: any): any {
    const t = typeof b === 'number' ? b : 0.5;
    const target = typeof b === 'number' ? asPoint(a) : asPoint(b);
    const result = lerpVec3(asPoint(a), target, t);
    return directionResult('lerpVector', result);
  }

  /** [0099] Chiếu vector `a` lên trục `b`. */
  public calculateVectorProjection(a?: any, b?: any, options?: any): any {
    const result = projectVector(asPoint(a), asPoint(b));
    return namedResult('calculateVectorProjection', result, { vector: result, length: magnitude(result) });
  }

  /** [0100] Phần vector còn lại sau khi chiếu lên trục `b`. */
  public calculateVectorRejection(a?: any, b?: any, options?: any): any {
    const result = rejectVector(asPoint(a), asPoint(b));
    return namedResult('calculateVectorRejection', result, { vector: result, length: magnitude(result) });
  }

  /** [0127] Chuyển quaternion thành góc Euler. */
  public quaternionToEuler(a?: any, b?: any): any {
    const euler = quaternionToEuler(asQuaternion(a));
    return { ...namedResult('quaternionToEuler', euler, { euler }), ...euler };
  }

  /** [0096] Nội suy trên cầu cầu (slerp) giữa hai hướng. */
  public slerpVector(a?: any, b?: any): any {
    const from = normalize(asPoint(a));
    const to = normalize(asPoint(b));
    const dotValue = clamp(dot(from, to), -1, 1);
    const theta = Math.acos(dotValue);
    if (theta < 1e-6) return directionResult('slerpVector', from);
    const sinTheta = Math.sin(theta);
    const t = typeof b === 'number' ? b : 0.5;
    const result = normalize({
      x: (Math.sin((1 - t) * theta) * from.x + Math.sin(t * theta) * to.x) / sinTheta,
      y: (Math.sin((1 - t) * theta) * from.y + Math.sin(t * theta) * to.y) / sinTheta,
      z: (Math.sin((1 - t) * theta) * from.z + Math.sin(t * theta) * to.z) / sinTheta,
    });
    return directionResult('slerpVector', result);
  }

  /** [0097] Giới hạn độ dài vector. */
  public clampVectorMagnitude(entity?: any, options?: any): any {
    const vector = asPoint(entity);
    const max = typeof options?.max === 'number' ? options.max : 1;
    const len = magnitude(vector);
    if (len <= max || len === 0) return vector;
    return scale(vector, max / len);
  }

  // ==========================================================================
  // 4. Góc
  // ==========================================================================

  /** [0098] Góc giữa hai vector. */
  public calculateVectorAngle(a?: any, b?: any): any {
    const cosine = clamp(dot(normalize(asPoint(a)), normalize(asPoint(b))), -1, 1);
    return Math.acos(cosine);
  }

  /** [0101] Góc Euler từ quaternion. */
  public calculateEulerAngles(a?: any, b?: any): any {
    const euler = quaternionToEuler(asQuaternion(a));
    return { ...namedResult('calculateEulerAngles', euler, { euler }), ...euler };
  }

  /** [0102] Góc yaw (quanh trục Y) — thành phần z của góc Euler XYZ. */
  public calculateYaw(a?: any, b?: any): any {
    return quaternionToEuler(asQuaternion(a)).z;
  }

  /** [0103] Góc pitch (quanh trục X) — thành phần x của góc Euler XYZ. */
  public calculatePitch(a?: any, b?: any): any {
    return quaternionToEuler(asQuaternion(a)).x;
  }

  /** [0104] Góc roll (quanh trục Z) — thành phần y của góc Euler XYZ. */
  public calculateRoll(a?: any, b?: any): any {
    return quaternionToEuler(asQuaternion(a)).y;
  }

  /** [0105] Góc tại gốc toạ độ giữa hai điểm. */
  public calculateAngleBetweenPoints(a?: any, b?: any): any {
    const cosine = clamp(dot(normalize(asPoint(a)), normalize(asPoint(b))), -1, 1);
    return Math.acos(cosine);
  }

  /** [0106] Góc giữa hai vector. */
  public calculateAngleBetweenVectors(a?: any, b?: any): any {
    const cosine = clamp(dot(normalize(asPoint(a)), normalize(asPoint(b))), -1, 1);
    return Math.acos(cosine);
  }

  /** [0107] Góc từ hướng nhìn của `a` tới mục tiêu `b`. */
  public calculateAngleToTarget(a?: any, b?: any): any {
    const forward = entityForward(a);
    const toTarget = normalize(subtract(asPoint(b), entityPosition(a)));
    const cosine = clamp(dot(normalize(forward), toTarget), -1, 1);
    return Math.acos(cosine);
  }

  /** [0108] Góc từ hướng nhìn của `a` tới camera `b`. */
  public calculateAngleToCamera(a?: any, b?: any): any {
    const forward = entityForward(a);
    const toCamera = normalize(subtract(asPoint(b), entityPosition(a)));
    const cosine = clamp(dot(normalize(forward), toCamera), -1, 1);
    return Math.acos(cosine);
  }

  /** [0109] Góc giữa vector và mặt phẳng ngang. */
  public calculateAngleToGround(a?: any, b?: any): any {
    const vector = normalize(asPoint(a));
    return Math.asin(clamp(Math.abs(vector.y), -1, 1));
  }

  /** [0110] Góc có dấu giữa hai vector quanh một trục. */
  public calculateSignedAngle(a?: any, b?: any): any {
    const va = normalize(asPoint(a));
    const vb = normalize(asPoint(b));
    const axis = normalize(cross(va, vb));
    const cosine = clamp(dot(va, vb), -1, 1);
    const sine = dot(axis, UP3);
    return Math.atan2(sine, cosine);
  }

  /** [0111] Góc không dấu giữa hai vector. */
  public calculateUnsignedAngle(a?: any, b?: any): any {
    const cosine = clamp(dot(normalize(asPoint(a)), normalize(asPoint(b))), -1, 1);
    return Math.acos(cosine);
  }

  /** [0116] Chuẩn hoá góc về (-π, π]. */
  public normalizeAngle(a?: any, b?: any): any {
    if (typeof a === 'number') return normalizeAngle(a);
    return normalizeAngle(quaternionToEuler(asQuaternion(a)).y);
  }

  /** [0117] Giới hạn góc trong khoảng cho trước. */
  public clampAngle(a?: any, b?: any): any {
    const angle = typeof a === 'number' ? a : quaternionToEuler(asQuaternion(a)).y;
    const min = typeof b?.min === 'number' ? b.min : -Math.PI;
    const max = typeof b?.max === 'number' ? b.max : Math.PI;
    return clamp(angle, min, max);
  }

  /**
   * [0118] Nội suy giữa hai góc.
   *
   * Mỗi góc được đọc từ nguồn tương ứng:
   *  • số → radian,
   *  • object có `angle` → radian,
   *  • entity có xoay (quaternion/Euler) → góc yaw (xoay quanh trục Y),
   *  • vector → góc cực so với trục +Y.
   *
   * Nội suy ở giữa hai góc ⇒ kết quả thay đổi theo cả hai đầu vào.
   */
  public interpolateAngle(a?: any, b?: any): any {
    const from = this.resolveAngle(a, 0);
    const to = this.resolveAngle(b, from);
    return lerp(from, to, 0.5);
  }

  // ==========================================================================
  // 5. Vận tốc góc
  // ==========================================================================

  /** [0112] Vận tốc góc của entity. */
  public calculateAngularVelocity(entity?: any, dt = 0.016): any {
    const value = entity && typeof entity === 'object' ? (entity as Record<string, unknown>).angularVelocity : undefined;
    const result = value && typeof value === 'object' ? toVec3(value) : { x: 0, y: 0, z: 0 };
    return directionResult('calculateAngularVelocity', result, { deltaTime: dt });
  }

  /** [0113] Gia tốc góc của entity. */
  public calculateAngularAcceleration(entity?: any, dt = 0.016): any {
    const value = entity && typeof entity === 'object' ? (entity as Record<string, unknown>).angularAcceleration : undefined;
    const result = value && typeof value === 'object' ? toVec3(value) : { x: 0, y: 0, z: 0 };
    return directionResult('calculateAngularAcceleration', result, { deltaTime: dt });
  }

  /** [0115] Chênh lệch góc giữa hai trạng thái xoay. */
  public calculateAngularDifference(a?: any, b?: any, options?: any): any {
    const from = asQuaternion(a);
    const to = asQuaternion(b);
    const dotValue = clamp(from.x * to.x + from.y * to.y + from.z * to.z + from.w * to.w, -1, 1);
    const angle = 2 * Math.acos(Math.abs(dotValue));
    return namedResult('calculateAngularDifference', angle, { angle, radians: angle });
  }

  // ==========================================================================
  // 6. Quaternion & ma trận xoay
  // ==========================================================================

  /** [0119] Ma trận xoay 4x4 từ quaternion của entity. */
  public calculateRotationMatrix(entityOrAngle?: any, options?: any): any {
    const q = asQuaternion(entityOrAngle);
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const matrix: number[] = [
      1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 0,
      2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 0,
      2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y), 0,
      0, 0, 0, 1,
    ];
    return namedResult('calculateRotationMatrix', matrix, { matrix });
  }

  /** [0120] Ma trận xoay nghịch đảo. */
  public calculateInverseRotation(entityOrAngle?: any, options?: any): any {
    const q = invertQuaternion(asQuaternion(entityOrAngle));
    return this.calculateRotationMatrix(q);
  }

  /** [0121] Quaternion của entity. */
  public calculateQuaternion(entityOrAngle?: any, options?: any): any {
    const q = asQuaternion(entityOrAngle);
    return orientationResult('calculateQuaternion', q);
  }

  /** [0122] Quaternion chuẩn hoá. */
  public normalizeQuaternion(entityOrAngle?: any, options?: any): any {
    const q = normalizeQuaternion(asQuaternion(entityOrAngle));
    return orientationResult('normalizeQuaternion', q);
  }

  /** [0123] Nhân hai quaternion. */
  public multiplyQuaternions(entityOrAngle?: any, options?: any): any {
    const a = asQuaternion(entityOrAngle);
    const b = asQuaternion(secondOperand(options));
    const q = multiplyQuaternions(a, b);
    return orientationResult('multiplyQuaternions', q);
  }

  /** [0124] Nghịch đảo quaternion. */
  public invertQuaternion(entityOrAngle?: any, options?: any): any {
    const q = invertQuaternion(asQuaternion(entityOrAngle));
    return orientationResult('invertQuaternion', q);
  }

  /** [0125] Nội suy quaternion bằng slerp. */
  public slerpQuaternion(entityOrAngle?: any, options?: any): any {
    const a = asQuaternion(entityOrAngle);
    const b = asQuaternion(secondOperand(options));
    const t = typeof options?.t === 'number' ? options.t : 0.5;
    const q = slerpQuaternion(a, b, t);
    return orientationResult('slerpQuaternion', q);
  }

  /** [0126] Nội suy quaternion bằng nlerp. */
  public nlerpQuaternion(entityOrAngle?: any, options?: any): any {
    const a = asQuaternion(entityOrAngle);
    const b = asQuaternion(secondOperand(options));
    const t = typeof options?.t === 'number' ? options.t : 0.5;
    const q = nlerpQuaternion(a, b, t);
    return orientationResult('nlerpQuaternion', q);
  }

  /** [0128] Quaternion từ góc Euler. */
  public eulerToQuaternion(entityOrAngle?: any, options?: any): any {
    const source = (options ?? entityOrAngle) as Record<string, unknown> | undefined;
    const x = typeof source?.x === 'number' ? source.x : 0;
    const y = typeof source?.y === 'number' ? source.y : 0;
    const z = typeof source?.z === 'number' ? source.z : 0;
    const q = eulerToQuaternion(x, y, z);
    return orientationResult('eulerToQuaternion', q);
  }

  /** [0130] Quaternion từ ma trận 4x4. */
  public matrixToQuaternion(entityOrAngle?: any, options?: any): any {
    const matrix = (options?.matrix ?? entityOrAngle) as number[] | undefined;
    if (!Array.isArray(matrix) || matrix.length < 16) {
      return orientationResult('matrixToQuaternion', { ...IDENTITY_QUAT });
    }
    const m = matrix;
    const trace = m[0] + m[4] + m[8] + m[12];
    let q: QuatD;
    if (trace > 0) {
      const s = Math.sqrt(trace + 1) * 2;
      q = { x: (m[6] - m[10]) / s, y: (m[8] - m[2]) / s, z: (m[1] - m[5]) / s, w: 0.25 * s };
    } else if (m[0] > m[4] && m[0] > m[8]) {
      const s = Math.sqrt(1 + m[0] - m[4] - m[8]) * 2;
      q = { x: 0.25 * s, y: (m[1] + m[5]) / s, z: (m[2] + m[6]) / s, w: (m[6] - m[10]) / s };
    } else if (m[4] > m[8]) {
      const s = Math.sqrt(1 + m[4] - m[0] - m[8]) * 2;
      q = { x: (m[1] + m[5]) / s, y: 0.25 * s, z: (m[2] + m[6]) / s, w: (m[8] - m[2]) / s };
    } else {
      const s = Math.sqrt(1 + m[8] - m[0] - m[4]) * 2;
      q = { x: (m[2] + m[6]) / s, y: (m[5] + m[9]) / s, z: 0.25 * s, w: (m[1] - m[5]) / s };
    }
    return orientationResult('matrixToQuaternion', normalizeQuaternion(q));
  }

  /** [0129] Ma trận 4x4 từ quaternion. */
  public quaternionToMatrix(target?: any, options?: any): any {
    const q = asQuaternion(target ?? options);
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const matrix: number[] = [
      1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 0,
      2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 0,
      2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y), 0,
      0, 0, 0, 1,
    ];
    return namedResult('quaternionToMatrix', matrix, { matrix });
  }

  /** [0132] Quaternion nhìn về một mục tiêu. */
  public calculateLookAtQuaternion(entityOrAngle?: any, options?: any): any {
    const from = entityPosition(entityOrAngle);
    const target = asPoint(options?.target ?? options?.to ?? entityOrAngle);
    const q = lookAtQuaternion(from, target);
    return orientationResult('calculateLookAtQuaternion', q);
  }

  /** [0131] Ma trận nhìn về một mục tiêu. */
  public calculateLookAtRotation(entityOrAngle?: any, options?: any): any {
    const from = entityPosition(entityOrAngle);
    const target = asPoint(options?.target ?? options?.to ?? entityOrAngle);
    const matrix = lookAtMatrix(from, target);
    return namedResult('calculateLookAtRotation', matrix, { matrix });
  }

  /** [0133] Quaternion xoay quanh một trục. */
  public calculateRotationAroundAxis(entityOrAngle?: any, options?: any): any {
    const axis = asPoint(options?.axis ?? entityOrAngle);
    const angle = typeof options?.angle === 'number' ? options.angle : 0;
    const q = rotateAroundAxis(axis, angle);
    return orientationResult('calculateRotationAroundAxis', q);
  }

  /**
   * [0134] Quaternion xoay từ vector này sang vector kia.
   *
   * Hai hướng được đọc theo VAI TRÒ (`from` / `to`) nên hàm nhận được cả
   * (entity, options), (vector, vector) lẫn (options, entity).
   */
  public calculateRotationBetweenVectors(entityOrAngle?: any, options?: any): any {
    const from =
      this.pickDirection(entityOrAngle, 'from') ?? this.pickDirection(options, 'from') ?? { ...FORWARD3 };
    const to = this.pickDirection(options, 'to') ?? this.pickDirection(entityOrAngle, 'to') ?? { ...FORWARD3 };
    const q = rotationBetweenVectors(from, to);
    return orientationResult('calculateRotationBetweenVectors', q);
  }

  /**
   * [0135] Xoay tương đối giữa hai hướng.
   *
   * Khác `calculateRotationBetweenVectors`, hàm này lấy hướng của entity
   * (forward thật từ quaternion) khi đối số là entity; vector thô thì được
   * dùng làm hướng trực tiếp.
   */
  public calculateRelativeRotation(entityOrAngle?: any, options?: any): any {
    const from =
      this.pickDirection(options, 'from') ?? this.pickDirection(entityOrAngle, 'from') ?? { ...FORWARD3 };
    const to = this.pickDirection(options, 'to') ?? this.pickDirection(entityOrAngle, 'to') ?? { ...FORWARD3 };
    const q = rotationBetweenVectors(from, to);
    return orientationResult('calculateRelativeRotation', q);
  }

  /** [0136] Xoay thế giới của entity. */
  public calculateWorldRotation(entityOrAngle?: any, options?: any): any {
    const q = asQuaternion(entityOrAngle);
    return orientationResult('calculateWorldRotation', q);
  }

  /** [0137] Xoay cục bộ của entity. */
  public calculateLocalRotation(entityOrAngle?: any, options?: any): any {
    const q = asQuaternion(entityOrAngle);
    return orientationResult('calculateLocalRotation', q);
  }

  /** [0138] Xoay của một xương theo tên. */
  public calculateBoneRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateBoneRotation');
  }

  /** [0139] Xoay của một khớp theo tên. */
  public calculateJointRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateJointRotation');
  }

  /** [0140] Xoay của đầu. */
  public calculateHeadRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateHeadRotation', 'head');
  }

  /** [0141] Xoay của bàn tay. */
  public calculateHandRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateHandRotation', 'hand');
  }

  /** [0884] Xoay của bàn chân. */
  public calculateFootRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateFootRotation', 'foot');
  }

  /** [0143] Xoay của vai. */
  public calculateShoulderRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateShoulderRotation', 'shoulder');
  }

  /** [0144] Xoay của hông. */
  public calculateHipRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateHipRotation', 'hip');
  }

  /** [0145] Xoay của cổ tay. */
  public calculateWristRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateWristRotation', 'wrist');
  }

  /** [0146] Xoay của khuỷu tay. */
  public calculateElbowRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateElbowRotation', 'elbow');
  }

  /** [0811] Xoay của đầu gối. */
  public calculateKneeRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateKneeRotation', 'knee');
  }

  /** [0148] Xoay của cột sống. */
  public calculateSpineRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateSpineRotation', 'spine');
  }

  /** [0149] Xoay của đuôi. */
  public calculateTailRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateTailRotation', 'tail');
  }

  /** [0150] Xoay của cánh. */
  public calculateWingRotation(entityOrAngle?: any, options?: any): any {
    return this.boneRotation(entityOrAngle, options, 'calculateWingRotation', 'wing');
  }

  // ==========================================================================
  // Hỗ trợ nội bộ
  // ==========================================================================

  /**
   * Tìm một xương theo tên trong CÂY XƯƠNG THẬT của entity và trả về xoay
   * thế giới của xương đó (tích luỹ từ gốc cây, động học tiền).
   *
   * Không có cây xương → quaternion đơn vị (w = 1) = tư thế trung tính.
   */
  private boneRotation(entityOrAngle: any, options: any, name: string, boneName?: string): Record<string, unknown> {
    const skeleton = this.resolveSkeleton(entityOrAngle, options);
    const candidates = this.boneCandidates(boneName, options, entityOrAngle);
    // Không có tên xương → dùng xương gốc của cây (dữ liệu thật).
    const bone = this.findPoseBone(skeleton, candidates) ?? (candidates.length === 0 ? skeleton : undefined);

    if (!bone) {
      // Không có cây xương → thử khớp được khai báo riêng (`entity.joints`).
      const joint = this.findJoint(entityOrAngle, candidates);
      if (joint) {
        return orientationResult(name, asQuaternion(joint.value), { bone: joint.name });
      }
      return orientationResult(name, { ...IDENTITY_QUAT }, { bone: boneName ?? 'bone' });
    }

    const positions = forwardKinematics(skeleton);
    return orientationResult(name, this.boneWorldQuaternion(bone), {
      bone: bone.name,
      localOrientation: { ...bone.quaternion },
      worldPosition: positions[bone.name] ?? { ...ZERO3 },
    });
  }

  /**
   * Cây xương thật: ưu tiên `skeleton` / `bones` / `root` của entity, sau đó
   * tới options, cuối cùng tới `children` của entity.
   *
   * Một entity có thể có NHIỀU gốc cây xương (khung người + xương cánh đứng
   * riêng…). `buildSkeleton` chỉ giữ gốc đầu tiên, nên các gốc còn lại
   * được gộp vào một gốc ảo (đơn vị) để mọi xương đều tìm được.
   */
  private resolveSkeleton(entity: any, options: any): BoneDesc | undefined {
    for (const source of [entity, options]) {
      const list = this.skeletonRootList(source);
      if (list.length === 0) continue;
      const primary = buildSkeleton(list);
      const roots: BoneDesc[] = primary ? [primary] : [];
      for (const raw of list.slice(roots.length > 0 ? 1 : 0)) {
        const bone = buildBone(raw);
        if (bone) roots.push(bone);
      }
      if (roots.length === 0) continue;
      if (roots.length === 1) return roots[0];
      const merged: BoneDesc = {
        name: 'root',
        position: { x: 0, y: 0, z: 0 },
        quaternion: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        length: 0,
        children: roots,
      };
      for (const child of roots) child.parent = merged;
      return merged;
    }
    // Không có danh sách xương → dựng từ `root` / `children`.
    return (
      buildSkeleton(entity) ??
      buildSkeleton(options) ??
      buildSkeleton({ bones: entity?.children }) ??
      buildSkeleton({ bones: options?.children })
    );
  }

  /** Danh sách gốc cây xương thô của một nguồn dữ liệu. */
  private skeletonRootList(source: any): unknown[] {
    if (!source || typeof source !== 'object') return [];
    const o = source as Record<string, unknown>;
    const list = o.skeleton ?? o.bones ?? o.nodes;
    return Array.isArray(list) ? list : [];
  }

  /**
   * Tên xương cần tìm.
   *
   * Thứ tự: vùng cơ thể (có bí danh) → tên xương người gọi chỉ định trong
   * `options` (`bone`/`boneName`/`joint`) → tên xương do chính entity khai báo
   * (`boneName`/`bone`/`joint`/`selectedBone`).
   *
   * Nhánh cuối là bắt buộc: không call site nào trong engine truyền
   * `options.jointName`, nên nếu chỉ đọc `options` thì tên xương sẽ không bao
   * giờ được lấy từ người gọi mà chỉ từ dữ liệu entity.
   */
  private boneCandidates(boneName: string | undefined, options: any, source?: any): string[] {
    if (boneName) return BONE_ALIASES[boneName] ?? [boneName];
    const named = [options?.bone, options?.boneName, options?.joint];
    const fromOptions = named.filter((n): n is string => typeof n === 'string' && n.length > 0);
    if (fromOptions.length > 0) return fromOptions;
    const record = source && typeof source === 'object' ? (source as Record<string, unknown>) : null;
    const fromEntity = [record?.boneName, record?.bone, record?.joint, record?.selectedBone];
    return fromEntity.filter((n): n is string => typeof n === 'string' && n.length > 0);
  }

  /** Tìm xương theo danh sách tên (khớp chính xác trước, sau đó khớp chứa). */
  private findPoseBone(root: BoneDesc | undefined, candidates: string[]): BoneDesc | undefined {
    if (!root || candidates.length === 0) return undefined;
    const bones = allBones(root);
    for (const candidate of candidates) {
      const want = candidate.toLowerCase();
      const exact = bones.find((b) => b.name.toLowerCase() === want);
      if (exact) return exact;
    }
    for (const candidate of candidates) {
      const want = candidate.toLowerCase();
      const partial = bones.find((b) => b.name.toLowerCase().includes(want));
      if (partial) return partial;
    }
    return undefined;
  }

  /** Quaternion xoay thế giới của một xương (tích luỹ từ gốc cây xương). */
  private boneWorldQuaternion(bone: BoneDesc): QuatD {
    const chain: BoneDesc[] = [];
    let current: BoneDesc | undefined = bone;
    while (current) {
      chain.unshift(current);
      current = current.parent;
    }
    let q: QuatD = { x: 0, y: 0, z: 0, w: 1 };
    for (const node of chain) q = multiplyQuaternions(q, node.quaternion);
    return normalizeQuaternion(q);
  }

  /** Khớp khai báo riêng (`entity.joints`) — dùng khi không có cây xương. */
  private findJoint(entity: any, candidates: string[]): { name: string; value: unknown } | null {
    if (!entity || typeof entity !== 'object') return null;
    const joints = (entity as Record<string, unknown>).joints;
    if (!joints || typeof joints !== 'object') return null;
    const record = joints as Record<string, unknown>;
    for (const candidate of candidates) {
      const want = candidate.toLowerCase();
      const key = Object.keys(record).find((k) => k.toLowerCase().includes(want));
      if (key) return { name: key, value: record[key] };
    }
    return null;
  }

  /**
   * Hướng (vector) theo vai trò `from` / `to`.
   *
   * Ưu tiên khoá theo vai trò → hướng forward thật của entity → vector thô.
   * Vector có độ dài 0 bị bỏ qua vì không xác định được hướng.
   */
  private pickDirection(value: unknown, role: 'from' | 'to'): Vec3D | null {
    if (!value || typeof value !== 'object') return null;
    const o = value as Record<string, unknown>;
    const keys = role === 'from'
      ? ['from', 'start', 'source']
      : ['to', 'target', 'end', 'destination'];
    for (const key of keys) {
      const raw = o[key];
      if (raw && typeof raw === 'object') {
        const v = toVec3(raw);
        if (magnitude(v) > 1e-9) return v;
      }
    }
    if (o.forward || o.quaternion || o.rotation) {
      const forward = entityForward(value);
      if (magnitude(forward) > 1e-9) return forward;
    }
    if (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') {
      const v = toVec3(o);
      if (magnitude(v) > 1e-9) return v;
    }
    return null;
  }

  /** Hướng "lên" thật của entity (trục +Y cục bộ trong không gian thế giới). */
  private resolveUpDirection(entity: any): Vec3D | null {
    if (!entity || typeof entity !== 'object') return null;
    const o = entity as Record<string, unknown>;
    if (o.up && typeof o.up === 'object') {
      const v = toVec3(o.up);
      if (magnitude(v) > 1e-9) return normalize(v);
    }
    if (o.quaternion || o.rotation) {
      const up = rotateVec(asQuaternion(entity), { ...UP3 });
      if (magnitude(up) > 1e-9) return normalize(up);
    }
    const up = entityUp(entity);
    return magnitude(up) > 1e-9 ? up : null;
  }

  /** Góc (radian) của một nguồn dữ liệu bất kỳ. */
  private resolveAngle(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!value || typeof value !== 'object') return fallback;
    const o = value as Record<string, unknown>;
    if (typeof o.angle === 'number' && Number.isFinite(o.angle)) return o.angle;
    // Euler của engine: thành phần `y` là góc yaw (xoay quanh trục Y).
    if (o.rotation || o.quaternion) return quaternionToEuler(asQuaternion(value)).y;
    const v = toVec3(o);
    const len = magnitude(v);
    if (len > 1e-9) return Math.asin(clamp(v.y / len, -1, 1));
    return fallback;
  }

  /** Mặt phẳng từ nhiều dạng dữ liệu (object mặt phẳng, `entity.plane`). */
  private resolvePlane(value: unknown): Plane3D | null {
    if (!value || typeof value !== 'object') return null;
    const o = value as Record<string, unknown>;
    const source = o.normal && typeof o.normal === 'object'
      ? o
      : o.plane && typeof o.plane === 'object'
        ? (o.plane as Record<string, unknown>)
        : null;
    if (!source) return null;
    const plane = asPlane(source);
    if (magnitude(plane.normal) < 1e-9) return null;
    return plane;
  }

  /** Điểm tham chiếu để dựng mặt phẳng song song với mặt phẳng đã biết. */
  private planeReferencePoint(value: any): Vec3D {
    if (!value || typeof value !== 'object') return { ...ZERO3 };
    const o = value as Record<string, unknown>;
    if (o.position && typeof o.position === 'object') return toVec3(o.position);
    if (typeof o.x === 'number' || typeof o.y === 'number' || typeof o.z === 'number') return toVec3(o);
    for (const key of ['to', 'target', 'from', 'point']) {
      const raw = o[key];
      if (raw && typeof raw === 'object') return toVec3(raw);
    }
    return { ...ZERO3 };
  }

  /** Lấy ma trận 4x4 từ options, nếu không có thì dùng ma trận đơn vị. */
  private resolveMatrix(options: any): number[] {
    if (Array.isArray(options?.matrix) && options.matrix.length >= 16) return options.matrix as number[];
    if (options?.camera) {
      const eye = entityPosition(options.camera.position ?? options.camera);
      const target = entityPosition(options.target ?? options.camera);
      return lookAtMatrix(eye, target);
    }
    // Đối tượng tham chiếu: dùng ma trận của nó nếu có, không thì dựng ma
    // trận tịnh tiến từ vị trí.
    const reference = options?.object ?? options?.reference;
    if (reference) {
      if (Array.isArray(reference.matrix) && reference.matrix.length >= 16) {
        return reference.matrix as number[];
      }
      return translationMatrix(entityPosition(reference));
    }
    return [...IDENTITY_MAT4];
  }
}
