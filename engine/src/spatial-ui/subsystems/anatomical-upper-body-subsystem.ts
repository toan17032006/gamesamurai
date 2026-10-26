/**
 * @file anatomical-upper-body-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/anatomical-upper-body-subsystem
 * @description Head, Face, Neck, Shoulders, Arms, Forearms & Hands Subsystem (151–400).
 *
 * Trước đây 250 hàm trong file này dùng chung khoảng 12 body nên gần như mọi
 * hàm trả về **cùng một giá trị giả**: `1.0` cho mọi phép đo chiều dài, `0.0`
 * cho mọi góc, `{x:0,y:0,z:1}` cho mọi hướng, quaternion đơn vị cho mọi
 * hướng quay và `{name, valid, timestamp, result: 0}` cho mọi hàm "có tên".
 * Nay mỗi hàm gọi đúng phép tính trong `spatial-ui/spatial-primitives` và dùng
 * số đo giải phẫu trong `spatial-ui/anatomy-metrics`.
 *
 * **Quy ước neo:** `getXxxPosition(entity)` coi `entity.position` là neo của
 * chính mốc đó và trả về `entity.position + offset giải phẫu` của mốc (xem
 * `anatomy-metrics.ts`). Các phép đo giữa hai mốc dùng "khung cơ thể" thống
 * nhất, gốc đặt tại tâm hai vai (xem `framePosition`).
 *
 * Đơn vị: mét, radian, hệ Y-up (+X sang phải, +Y lên, +Z về phía trước).
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
  ZERO3,
  UP3,
  FORWARD3,
  RIGHT3,
  IDENTITY_QUAT,
  num,
  toVec3,
  entityPosition,
  entityQuaternion,
  entityForward,
  clamp,
  clamp01,
  normalize,
  dot,
  cross,
  add,
  subtract,
  scale,
  magnitude,
  distance3D,
  normalizeQuaternion,
  eulerToQuaternion,
  quaternionToEuler,
  multiplyQuaternions,
  invertQuaternion,
  rotateAroundAxis,
  rotationBetweenVectors,
  lookAtQuaternion,
  boundingBox,
  namedResult,
  measurement,
  directionResult,
  orientationResult,
  boundsResult
} from '../spatial-primitives.js';

import {
  BODY_DIMENSIONS,
  HEAD_LANDMARKS,
  NECK_LANDMARKS,
  SHOULDER_LANDMARKS,
  ARM_LANDMARKS,
  BODY_BOX_SIZES,
  bodyOffset,
  bodyBoxSize
} from '../anatomy-metrics.js';

import type { BoneDesc } from '../semantics/kinematics-semantics.js';
import { buildSkeleton, forwardKinematics, allBones } from '../semantics/kinematics-semantics.js';

// ---------------------------------------------------------------------------
// Trợ giúp cấp module
// ---------------------------------------------------------------------------

/** Trục của cánh tay khi đứng yên (cánh tay buông xuống dọc trục -Y). */
const REST_ARM_AXIS: Vec3D = { x: 0, y: -1, z: 0 };

// ---------------------------------------------------------------------------
// Tên xương dùng để tra cứu cây xương (skeleton) của entity
// ---------------------------------------------------------------------------

/** Tên xương của khớp vai (bất kỳ bên nào). */
const SHOULDER_BONE_NAMES: readonly string[] = ['shoulder', 'clavicle', 'humerus'];

/** Tên xương của khớp vai bên trái. */
const LEFT_SHOULDER_BONE_NAMES: readonly string[] = [
  'shoulder_l',
  'left_shoulder',
  'leftshoulder',
  'l_shoulder',
  'clavicle_l',
];

/** Tên xương của khớp vai bên phải. */
const RIGHT_SHOULDER_BONE_NAMES: readonly string[] = [
  'shoulder_r',
  'right_shoulder',
  'rightshoulder',
  'r_shoulder',
  'clavicle_r',
];

/** Tên xương của khớp khuỷu. */
const ELBOW_BONE_NAMES: readonly string[] = ['elbow'];

/** Tên xương của khớp cổ tay. */
const WRIST_BONE_NAMES: readonly string[] = ['wrist'];

/** Tên xương của bàn tay. */
const HAND_BONE_NAMES: readonly string[] = ['hand'];

/** Tên xương của hộp sọ (dùng cho pháp tuyến/độ lệch tâm đầu). */
const HEAD_BONE_NAMES: readonly string[] = ['head', 'skull'];

/** Tên xương của hàm dưới (môi dưới). */
const JAW_BONE_NAMES: readonly string[] = ['jaw', 'mandible', 'chin', 'lowerlip'];

/** Ngữ cảnh xương: vị trí thế giới (FK) + danh sách tên xương. */
interface BoneContext {
  positions: Record<string, Vec3D>;
  names: string[];
}

/** Đọc điểm 3D từ entity / object thường / mảng. */
function asPoint(value: unknown): Vec3D {
  if (value === undefined || value === null) return { x: 0, y: 0, z: 0 };
  if (Array.isArray(value)) return value.length > 0 ? toVec3(value[0]) : { x: 0, y: 0, z: 0 };
  if (typeof value !== 'object') return { x: 0, y: 0, z: 0 };
  const v = value as Record<string, unknown>;
  if (v.position && typeof v.position === 'object') return toVec3(v.position);
  if (v.point && typeof v.point === 'object') return toVec3(v.point);
  if (v.center && typeof v.center === 'object') return toVec3(v.center);
  return toVec3(v);
}

/** Giá trị này có phải điểm 3D (hoặc entity có `position`) hay không. */
function isPointLike(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number') return true;
  return !!v.position && typeof v.position === 'object';
}

/** Đọc quaternion của một node nếu node có xoay (undefined nếu không). */
function readQuaternion(node: unknown): QuatD | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const v = node as Record<string, unknown>;
  const q = v.quaternion;
  if (q && typeof q === 'object') {
    const qq = q as Record<string, unknown>;
    return { x: num(qq.x), y: num(qq.y), z: num(qq.z), w: num(qq.w, 1) };
  }
  const r = v.rotation;
  if (r && typeof r === 'object') {
    const rr = r as Record<string, unknown>;
    return eulerToQuaternion(num(rr.x), num(rr.y), num(rr.z));
  }
  return undefined;
}

/** Xoay một vector bằng quaternion (t = 2·(q×v); v' = v + w·t + q×t). */
function rotateVector(q: QuatD, v: Vec3D): Vec3D {
  const u = { x: q.x, y: q.y, z: q.z };
  const t = scale(cross(u, v), 2);
  return add(add(v, scale(t, q.w)), cross(u, t));
}

/** Tìm node theo tên trong cây `children` / danh sách `bones`. */
function findNamedNode(root: unknown, names: string[]): any {
  const wanted = names.map((n) => n.toLowerCase());
  const visit = (node: any, depth: number): any => {
    if (!node || typeof node !== 'object' || depth > 8) return undefined;
    const name = typeof node.name === 'string' ? node.name.toLowerCase() : '';
    if (name && wanted.some((w) => name === w || name.includes(w))) return node;
    const children = Array.isArray(node.children) ? node.children : [];
    for (const child of children) {
      const found = visit(child, depth + 1);
      if (found) return found;
    }
    const bones = Array.isArray(node.bones) ? node.bones : [];
    for (const bone of bones) {
      const found = visit(bone, depth + 1);
      if (found) return found;
    }
    return undefined;
  };
  return visit(root, 0);
}

/** Bán đường chéo của hộp bao — bán kính hình cầu bao ngoài. */
function halfDiagonal(size: Vec3D): number {
  return Math.hypot(size.x, size.y, size.z) / 2;
}

export class AnatomicalUpperBodySubsystem {
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
  // Trợ giúp nội bộ (không thuộc catalog 1.800 hàm)
  // ==========================================================================

  /** Offset giải phẫu của một mốc theo bảng `anatomy-metrics`. */
  private landmarkOffset(name: string): Vec3D {
    const found = bodyOffset(name);
    if (found) return found;
    // Mốc không có trong bảng: suy ra theo vùng cơ thể —
    // "trên/dưới" ⇒ ±Y, "trước/sau" ⇒ ±Z, "trái/phải" ⇒ ∓X.
    const lower = name.toLowerCase();
    if (lower.includes('top') || lower.includes('upper')) {
      return { x: 0, y: BODY_DIMENSIONS.headRadius, z: 0 };
    }
    if (lower.includes('bottom') || lower.includes('lower')) {
      return { x: 0, y: -BODY_DIMENSIONS.headRadius, z: 0 };
    }
    if (lower.includes('front')) {
      return { x: 0, y: 0, z: BODY_DIMENSIONS.headRadius };
    }
    if (lower.includes('back')) {
      return { x: 0, y: 0, z: -BODY_DIMENSIONS.headRadius };
    }
    if (lower.includes('left')) {
      return { x: -BODY_DIMENSIONS.headRadius, y: 0, z: 0 };
    }
    if (lower.includes('right')) {
      return { x: BODY_DIMENSIONS.headRadius, y: 0, z: 0 };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Vị trí mốc theo quy ước neo: `entity.position` + offset giải phẫu. */
  private landmarkPosition(name: string, entity?: any, offset?: Vec3D): Vec3D {
    const base = entityPosition(entity);
    const anat = this.landmarkOffset(name);
    return {
      x: base.x + anat.x + num(offset?.x),
      y: base.y + anat.y + num(offset?.y),
      z: base.z + anat.z + num(offset?.z),
    };
  }

  /** Gốc cổ trong khung cơ thể (cao bằng chiều cao vai). */
  private neckBaseFrame(): Vec3D {
    return { x: 0, y: BODY_DIMENSIONS.shoulderHeight, z: 0 };
  }

  /** Tâm đầu trong khung cơ thể (đỉnh cổ + nửa chiều cao đầu). */
  private headCenterFrame(): Vec3D {
    return {
      x: 0,
      y:
        BODY_DIMENSIONS.shoulderHeight +
        BODY_DIMENSIONS.neckLength +
        BODY_DIMENSIONS.headHeight / 2,
      z: 0,
    };
  }

  /** Cổ tay giữa hai tay trong khung cơ thể. */
  private midWristFrame(): Vec3D {
    return {
      x: 0,
      y: -(BODY_DIMENSIONS.upperArmLength + BODY_DIMENSIONS.forearmLength),
      z: 0,
    };
  }

  /** Vị trí các mốc lòng bàn tay trong khung cơ thể. */
  private palmFrame(name: string): Vec3D {
    const wrist = this.midWristFrame();
    const center = add(wrist, { x: 0, y: -BODY_DIMENSIONS.palmLength / 2, z: 0 });
    switch (name) {
      case 'getPalmCenter':
        return center;
      case 'getPalmBasePosition':
        return wrist;
      case 'getPalmTopPosition':
        return add(wrist, { x: 0, y: -BODY_DIMENSIONS.palmLength, z: 0 });
      case 'getPalmLeftEdge':
        return add(center, { x: -BODY_DIMENSIONS.palmWidth / 2, y: 0, z: 0 });
      case 'getPalmRightEdge':
        return add(center, { x: BODY_DIMENSIONS.palmWidth / 2, y: 0, z: 0 });
      case 'getPalmFrontPosition':
        return add(center, { x: 0, y: 0, z: BODY_DIMENSIONS.palmThickness / 2 });
      case 'getPalmBackPosition':
        return add(center, { x: 0, y: 0, z: -BODY_DIMENSIONS.palmThickness / 2 });
      default:
        return center;
    }
  }

  /** Vị trí một mốc trong khung cơ thể thống nhất (gốc = tâm hai vai). */
  private framePosition(name: string): Vec3D {
    const head = HEAD_LANDMARKS[name];
    if (head) return add(this.headCenterFrame(), head);
    const neck = NECK_LANDMARKS[name];
    if (neck) return add(this.neckBaseFrame(), neck);
    const shoulder = SHOULDER_LANDMARKS[name];
    if (shoulder) return shoulder;
    if (name.startsWith('getPalm')) return this.palmFrame(name);
    const arm = ARM_LANDMARKS[name];
    if (arm) return arm;
    return { x: 0, y: 0, z: 0 };
  }

  /** Khớp vai (điểm bắt đầu cánh tay) theo bên. */
  private shoulderFrame(side: 'left' | 'right'): Vec3D {
    return ARM_LANDMARKS[side === 'left' ? 'getLeftUpperArmPosition' : 'getRightUpperArmPosition'];
  }

  /** Khớp khuỷu theo bên. */
  private elbowFrame(side: 'left' | 'right'): Vec3D {
    return ARM_LANDMARKS[side === 'left' ? 'getLeftElbowPosition' : 'getRightElbowPosition'];
  }

  /** Khớp cổ tay theo bên. */
  private wristFrame(side: 'left' | 'right'): Vec3D {
    return ARM_LANDMARKS[side === 'left' ? 'getLeftWristPosition' : 'getRightWristPosition'];
  }

  /** Tâm bàn tay theo bên. */
  private handFrame(side: 'left' | 'right'): Vec3D {
    return ARM_LANDMARKS[side === 'left' ? 'getLeftHandPosition' : 'getRightHandPosition'];
  }

  /** Tâm cánh tay trên theo bên. */
  private upperArmCenterFrame(side: 'left' | 'right'): Vec3D {
    return ARM_LANDMARKS[side === 'left' ? 'getLeftUpperArmCenter' : 'getRightUpperArmCenter'];
  }

  /** Tâm cánh tay dưới theo bên. */
  private forearmCenterFrame(side: 'left' | 'right'): Vec3D {
    return ARM_LANDMARKS[side === 'left' ? 'getLeftForearmCenter' : 'getRightForearmCenter'];
  }

  /**
   * Khoảng cách giữa hai mốc: nếu người gọi truyền rõ hai điểm thì dùng chúng,
   * ngược lại tính theo khung cơ thể (khoảng cách giải phẫu thật).
   */
  private landmarkDistance(a: any, b: any, nameA: string, nameB: string): number {
    if (isPointLike(a) && isPointLike(b)) return distance3D(asPoint(a), asPoint(b));
    return distance3D(this.framePosition(nameA), this.framePosition(nameB));
  }

  /** Quaternion của khớp/xương: ưu tiên entity, sau đó tìm trong cây bone. */
  private orientationOf(entity: any, boneNames: string[], options?: any): QuatD {
    const direct = readQuaternion(entity);
    if (direct) return direct;
    const fromOptions = findNamedNode(options, boneNames);
    if (fromOptions) {
      const q = readQuaternion(fromOptions);
      if (q) return q;
    }
    const found = findNamedNode(entity, boneNames);
    if (found) {
      const q = readQuaternion(found);
      if (q) return q;
    }
    return { x: 0, y: 0, z: 0, w: 1 };
  }

  /** Góc Euler của entity (0 khi entity không có xoay). */
  private eulerOf(entity: any): { x: number; y: number; z: number } {
    const q = readQuaternion(entity);
    return q ? quaternionToEuler(q) : { x: 0, y: 0, z: 0 };
  }

  /** Trục của entity sau khi áp dụng xoay (giữ nguyên khi không có xoay). */
  private axisOf(entity: any, axis: Vec3D): Vec3D {
    const q = readQuaternion(entity);
    return q ? normalize(rotateVector(q, axis)) : axis;
  }

  // -------------------------------------------------------------------------
  // Ngữ cảnh xương — mọi phép đo khớp ưu tiên XƯƠNG THẬT khi entity có cây xương
  // -------------------------------------------------------------------------

  /** Các đối số thực sự được truyền vào (bỏ qua `undefined`/`null`). */
  private sourcesOf(a?: any, b?: any, options?: any): any[] {
    return [a, b, options].filter((source) => source !== undefined && source !== null);
  }

  /**
   * Cây xương giàu thông tin nhất trong các đối số, kèm vị trí thế giới.
   *
   * Cây lồng nhau (`skeleton`/`bones` có `children`) cho tư thế thật; cây phẳng
   * (danh sách xương không có quan hệ cha–con) chỉ cho offset cục bộ nên bị
   * bỏ qua khi đã có cây lồng.
   */
  private boneContext(sources: any[]): BoneContext | null {
    let best: BoneDesc | undefined;
    let bestCount = 0;
    for (const source of sources) {
      const skeleton = buildSkeleton(source);
      if (!skeleton) continue;
      const count = allBones(skeleton).length;
      if (count > bestCount) {
        best = skeleton;
        bestCount = count;
      }
    }
    if (!best) return null;
    return {
      positions: forwardKinematics(best),
      names: allBones(best).map((bone) => bone.name),
    };
  }

  /** Vị trí thế giới của xương theo danh sách tên (`null` nếu không có xương đó). */
  private boneWorldPosition(context: BoneContext | null, boneNames: readonly string[]): Vec3D | null {
    if (!context) return null;
    for (const wanted of boneNames) {
      const key = context.names.find((name) => name.toLowerCase().includes(wanted.toLowerCase()));
      if (!key) continue;
      const found = context.positions[key];
      if (found) return { x: found.x, y: found.y, z: found.z };
    }
    return null;
  }

  /** Đối số giống entity (có `position` trước, rồi tới `quaternion`/`rotation`). */
  private entityOf(sources: any[]): any {
    for (const source of sources) {
      if (!source || typeof source !== 'object') continue;
      const record = source as Record<string, unknown>;
      if (record.position && typeof record.position === 'object') return source;
    }
    for (const source of sources) {
      if (!source || typeof source !== 'object') continue;
      const record = source as Record<string, unknown>;
      if (record.quaternion || record.rotation) return source;
    }
    return undefined;
  }

  /** Điểm thô (Vec3D) truyền vào — loại trừ entity/options. */
  private rawPoint(value: any): Vec3D | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const record = value as Record<string, unknown>;
    if (record.position || record.quaternion || record.rotation) return undefined;
    if (typeof record.x === 'number' && typeof record.y === 'number' && typeof record.z === 'number') {
      return { x: record.x, y: record.y, z: record.z };
    }
    return undefined;
  }

  /**
   * Vị trí một khớp: ưu tiên XƯƠNG THẬT (forward kinematics), sau đó tới điểm
   * thô người gọi truyền vào, cuối cùng là offset giải phẫu tĩnh (neo tại
   * `entity.position`).
   */
  private jointPosition(
    context: BoneContext | null,
    boneNames: readonly string[],
    point: Vec3D | undefined,
    landmark: string,
    entity: any,
  ): Vec3D {
    const fromBone = this.boneWorldPosition(context, boneNames);
    if (fromBone) return fromBone;
    if (point) return point;
    return this.landmarkPosition(landmark, entity);
  }

  /**
   * Điểm đối xứng của `point` qua mặt phẳng điện (thẳng đứng) của cơ thể.
   *
   * Mặt phẳng điện đi qua vị trí entity, pháp tuyến là trục ngang của cơ thể
   * (trục X trong khung cơ thể, xoay theo quaternion của entity).
   */
  private mirrorAcrossSagittal(point: Vec3D, entity: any): Vec3D {
    const normal = this.bodyRightAxis(entity);
    const origin = entityPosition(entity);
    const offset = dot(subtract(point, origin), normal);
    return subtract(point, scale(normal, 2 * offset));
  }

  /** Trục ngang của cơ thể trong không gian (xoay theo quaternion của entity). */
  private bodyRightAxis(entity: any): Vec3D {
    const q = readQuaternion(entity);
    if (!q) return { x: RIGHT3.x, y: RIGHT3.y, z: RIGHT3.z };
    return normalize(rotateVector(q, RIGHT3));
  }

  /**
   * Pháp tuyến lòng bàn tay: vuông góc với hướng ngón tay và trục ngang của
   * cơ thể.
   */
  private palmNormalOf(wrist: Vec3D, hand: Vec3D, entity: any): Vec3D {
    const forward = normalize(subtract(hand, wrist));
    if (magnitude(forward) === 0) return { x: FORWARD3.x, y: FORWARD3.y, z: FORWARD3.z };
    const normal = normalize(cross(forward, this.bodyRightAxis(entity)));
    return magnitude(normal) > 0 ? normal : { x: FORWARD3.x, y: FORWARD3.y, z: FORWARD3.z };
  }

  /** Đọc số đầu tiên hợp lệ trong danh sách tên trường. */
  private numberField(source: any, keys: string[]): number {
    if (!source || typeof source !== 'object') return 0;
    const v = source as Record<string, unknown>;
    for (const key of keys) {
      const raw = v[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    }
    return 0;
  }

  /** Vận tốc của entity (zero nếu entity không khai báo). */
  private velocityOf(entity: any): Vec3D {
    const v = entity?.velocity;
    return v && typeof v === 'object' ? toVec3(v) : { x: 0, y: 0, z: 0 };
  }

  /** Gia tốc của entity (zero nếu entity không khai báo). */
  private accelerationOf(entity: any): Vec3D {
    const a = entity?.acceleration;
    if (a && typeof a === 'object') return toVec3(a);
    const prev = entity?.previousVelocity;
    if (prev && typeof prev === 'object' && entity?.velocity && typeof entity.velocity === 'object') {
      const dt = 1 / 60;
      return scale(subtract(toVec3(entity.velocity), toVec3(prev)), 1 / dt);
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Vận tốc góc của entity (zero nếu entity không khai báo). */
  private angularVelocityOf(entity: any): Vec3D {
    const v = entity?.angularVelocity;
    return v && typeof v === 'object' ? toVec3(v) : { x: 0, y: 0, z: 0 };
  }

  /** Gia tốc góc của entity (zero nếu entity không khai báo). */
  private angularAccelerationOf(entity: any): Vec3D {
    const a = entity?.angularAcceleration;
    return a && typeof a === 'object' ? toVec3(a) : { x: 0, y: 0, z: 0 };
  }

  /**
   * Độ đối xứng của một cặp mốc trái/phải (1 = hoàn hảo).
   *
   * `mirrored` cho phép dùng mặt phẳng điện của cơ thể tham chiếu thay cho
   * phản chiếu theo trục X của thế giới.
   */
  private symmetryOf(left: Vec3D, right: Vec3D, scaleRef: number, mirrored?: Vec3D): number {
    const mirrorPoint = mirrored ?? { x: -right.x, y: right.y, z: right.z };
    const asymmetry = distance3D(left, mirrorPoint);
    const ref = scaleRef > 0 ? scaleRef : 1;
    return clamp01(1 - asymmetry / ref);
  }

  /**
   * Pháp tuyến khuôn mặt: cross(trục ngang giữa hai mắt, trục dọc trán→cằm).
   */
  private faceNormal(): Vec3D {
    const across = subtract(
      HEAD_LANDMARKS.getRightEyePosition,
      HEAD_LANDMARKS.getLeftEyePosition,
    );
    const vertical = subtract(
      HEAD_LANDMARKS.getForeheadPosition,
      HEAD_LANDMARKS.getChinPosition,
    );
    const normal = normalize(cross(across, vertical));
    return magnitude(normal) > 0 ? normal : FORWARD3;
  }

  /**
   * Xoay một điểm của khung cơ thể theo quaternion của entity (quanh tâm).
   */
  private frameRotated(entity: any, point: Vec3D, center: Vec3D): Vec3D {
    const q = readQuaternion(entity);
    if (!q) return point;
    return add(center, rotateVector(q, subtract(point, center)));
  }

  /**
   * Hướng ngón tay của bàn tay trong khung cơ thể.
   *
   * Khi cánh tay buông xuống, ngón tay hướng theo trục cẳng tay (-Y).
   */
  private palmForwardFrame(): Vec3D {
    const wrist = this.framePosition('getLeftWristPosition');
    const hand = this.framePosition('getLeftHandPosition');
    const dir = normalize(subtract(hand, wrist));
    return magnitude(dir) > 0 ? dir : REST_ARM_AXIS;
  }

  /** Pháp tuyến lòng bàn tay trong khung cơ thể (vuông góc hướng ngón tay). */
  private palmNormalFrame(): Vec3D {
    const normal = normalize(cross(this.palmForwardFrame(), RIGHT3));
    return magnitude(normal) > 0 ? normal : FORWARD3;
  }

  /** Trục "trên" của lòng bàn tay trong khung cơ thể. */
  private palmUpFrame(): Vec3D {
    const up = normalize(cross(this.palmNormalFrame(), this.palmForwardFrame()));
    return magnitude(up) > 0 ? up : UP3;
  }

  /** Pháp tuyến lòng bàn tay sau khi áp dụng xoay của entity. */
  private palmNormal(entity?: any): Vec3D {
    const q = readQuaternion(entity);
    return q ? normalize(rotateVector(q, this.palmNormalFrame())) : this.palmNormalFrame();
  }

  /** Hướng ngón tay sau khi áp dụng xoay của entity. */
  private palmForward(entity?: any): Vec3D {
    const q = readQuaternion(entity);
    return q ? normalize(rotateVector(q, this.palmForwardFrame())) : this.palmForwardFrame();
  }

  /** Trục trên của bàn tay sau khi áp dụng xoay của entity. */
  private palmUp(entity?: any): Vec3D {
    const q = readQuaternion(entity);
    return q ? normalize(rotateVector(q, this.palmUpFrame())) : this.palmUpFrame();
  }

  /** Trục bên phải của bàn tay (vuông góc với forward và up). */
  private palmRight(entity?: any): Vec3D {
    const right = normalize(cross(this.palmUp(entity), this.palmForward(entity)));
    return magnitude(right) > 0 ? right : RIGHT3;
  }

  /**
   * Góc xoay quanh một trục — phân rã swing–twist của quaternion.
   *
   * Thành phần xoay quanh trục `axis` được tách ra bằng cách chiếu phần
   * vector của quaternion lên trục; góc nhận được là góc xoay thuần quanh
   * trục đó (dương theo quy ước bàn tay phải).
   */
  private twistAboutAxis(entity: any, axis: Vec3D): number {
    const q = readQuaternion(entity);
    if (!q) return 0;
    const n = normalize(axis);
    if (magnitude(n) === 0) return 0;
    const projected = dot(n, { x: q.x, y: q.y, z: q.z });
    const twist = normalizeQuaternion({
      x: n.x * projected,
      y: n.y * projected,
      z: n.z * projected,
      w: q.w,
    });
    const sinHalf = Math.hypot(twist.x, twist.y, twist.z);
    if (sinHalf < 1e-9) return 0;
    return 2 * Math.atan2(dot({ x: twist.x, y: twist.y, z: twist.z }, n), twist.w);
  }

  /**
   * Các điểm quỹ đạo.
   *
   * Ưu tiên đường đi khai báo trong entity (`trajectory`/`path`/`points`/
   * `waypoints`); nếu không có thì quỹ đạo là đoạn thẳng `start → end`.
   */
  private trajectoryPoints(entity: any, start: Vec3D, end: Vec3D): Vec3D[] {
    const source = (entity ?? {}) as Record<string, unknown>;
    const candidates = [source.trajectory, source.path, source.points, source.waypoints];
    for (const candidate of candidates) {
      if (!Array.isArray(candidate) || candidate.length < 2) continue;
      const points = candidate.map((p) => asPoint(p));
      if (points.length >= 2) return points;
    }
    return [start, end];
  }

  /** Tổng chiều dài của một polyline. */
  private pathLengthOf(points: Vec3D[]): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) total += distance3D(points[i - 1], points[i]);
    return total;
  }

  /**
   * Góc khớp của từng ngón tay (rad).
   *
   * Đọc từ `entity.fingerAngles` / `entity.fingers` / `entity.jointAngles` khi
   * có; nếu không khai báo thì mọi ngón đều ở tư thế thẳng (0 rad).
   */
  private fingerAngles(entity?: any): Record<string, { flexion: number; extension: number; abduction: number; curl: number }> {
    const source = (entity ?? {}) as Record<string, unknown>;
    const explicit = (source.fingerAngles ?? source.fingers ?? source.jointAngles) as
      | Record<string, unknown>
      | undefined;
    const names = ['thumb', 'index', 'middle', 'ring', 'little'];
    const result: Record<string, { flexion: number; extension: number; abduction: number; curl: number }> = {};
    for (const name of names) {
      const raw = explicit && typeof explicit === 'object' ? explicit[name] : undefined;
      const flexion = this.numberField(raw, ['flexion', 'flex', 'curl']);
      const extension = this.numberField(raw, ['extension', 'extend']);
      const abduction = this.numberField(raw, ['abduction', 'abduct', 'spread']);
      result[name] = { flexion, extension, abduction, curl: flexion - extension };
    }
    return result;
  }

  /** Kích thước hộp bao theo vùng cơ thể, có thể ghi đè bằng tham số. */
  private boxSize(region: string, size?: Vec3D): Vec3D {
    if (size) return size;
    const fallback = bodyBoxSize(region) ?? BODY_BOX_SIZES[region] ?? { x: 1, y: 1, z: 1 };
    return fallback;
  }

  // -------------------------------------------------------------------------
  // Trợ giúp tuỳ chọn của người gọi (options / reference / side / unit)
  // -------------------------------------------------------------------------

  /** Đọc số tuỳ chọn — trả `fallback` khi không có giá trị hữu hạn. */
  private optNumber(options: any, fallback: number, ...keys: string[]): number {
    if (!options || typeof options !== 'object') return fallback;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    }
    return fallback;
  }

  /** Đọc cờ boolean tuỳ chọn. */
  private optBoolean(options: any, fallback: boolean, ...keys: string[]): boolean {
    if (!options || typeof options !== 'object') return fallback;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'boolean') return raw;
    }
    return fallback;
  }

  /** Đọc chuỗi tuỳ chọn (không phân biệt hoa thường, cắt khoảng trắng). */
  private optString(options: any, fallback: string, ...keys: string[]): string {
    if (!options || typeof options !== 'object') return fallback;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'string' && raw.trim()) return raw.trim().toLowerCase();
    }
    return fallback;
  }

  /** Đọc đối tượng tuỳ chọn — dùng để chỉ định nguồn dữ liệu khác. */
  private optObject(options: any, ...keys: string[]): any {
    if (!options || typeof options !== 'object') return undefined;
    const record = options as Record<string, unknown>;
    for (const key of keys) {
      const raw = record[key];
      if (raw && typeof raw === 'object') return raw;
    }
    return undefined;
  }

  /** Đọc vector tuỳ chọn (mốc/điểm tham chiếu). */
  private optVector(options: any, ...keys: string[]): Vec3D | undefined {
    const found = this.optObject(options, ...keys);
    if (!found) return undefined;
    const record = found as Record<string, unknown>;
    if (
      typeof record.x !== 'number' ||
      typeof record.y !== 'number' ||
      typeof record.z !== 'number' ||
      !Number.isFinite(record.x) ||
      !Number.isFinite(record.y) ||
      !Number.isFinite(record.z)
    ) {
      return undefined;
    }
    return { x: record.x, y: record.y, z: record.z };
  }

  /**
   * Hệ số quy đổi đơn vị đo theo `options.unit`.
   *
   * Mặc định là đơn vị gốc của phép đo (mét cho độ dài, m⁻¹ cho độ cong).
   * Đơn vị dạng `cm^-1`/`mm^-1` được hiểu là nghịch đảo của đơn vị độ dài
   * tương ứng.
   */
  private unitFactor(options: any, fallbackUnit: string): { unit: string; factor: number } {
    const requested = this.optString(options, fallbackUnit, 'unit');
    const inverse = requested.endsWith('^-1');
    const base = inverse ? requested.slice(0, -3) : requested;
    const meters: Record<string, number> = {
      m: 1,
      cm: 100,
      mm: 1000,
      km: 0.001,
      in: 39.3700787,
      ft: 3.2808399
    };
    const factor = meters[base];
    if (factor === undefined) return { unit: fallbackUnit, factor: 1 };
    return { unit: requested, factor: inverse ? 1 / factor : factor };
  }

  /** Hệ số quy đổi đơn vị góc theo `options.unit` (`rad` | `deg`). */
  private angleUnitFactor(options: any): { unit: string; factor: number } {
    const requested = this.optString(options, 'rad', 'unit');
    if (requested === 'deg' || requested === 'degree' || requested === 'degrees') {
      return { unit: 'deg', factor: 180 / Math.PI };
    }
    return { unit: 'rad', factor: 1 };
  }

  /** Bên đang đo — 'left' mặc định (khớp với khung giải phẫu). */
  private sideOf(options: any): 'left' | 'right' {
    return this.optString(options, 'left', 'side', 'hand') === 'right' ? 'right' : 'left';
  }

  /** Nguồn dữ liệu thay thế: `options.entity` (nếu có) → tham số entity. */
  private sourceEntity(entity: any, options: any): any {
    return this.optObject(options, 'entity', 'source') ?? entity;
  }

  /**
   * Quaternion của khung tham chiếu (undefined khi tham chiếu không có xoay).
   */
  private referenceQuaternion(reference: any): QuatD | undefined {
    return readQuaternion(reference);
  }

  /**
   * Biểu diễn một hướng trong khung tham chiếu `reference`.
   *
   * Tham chiếu không có xoay ⇒ hướng giữ nguyên (hành vi mặc định không đổi).
   */
  private intoFrame(direction: Vec3D, reference: any): Vec3D {
    const q = this.referenceQuaternion(reference);
    if (!q) return direction;
    return rotateVector(invertQuaternion(q), direction);
  }

  /** Trục cục bộ (`localAxis`) biểu diễn trong khung tham chiếu `reference`. */
  private referenceAxis(reference: any, localAxis: Vec3D): Vec3D {
    const q = this.referenceQuaternion(reference);
    if (!q) return localAxis;
    return normalize(rotateVector(q, localAxis));
  }

  /**
   * Góc Euler của `a` tương đối với khung xoay của `reference`.
   *
   * Không có khung tham chiếu ⇒ trả góc Euler tuyệt đối (như trước).
   */
  private eulerRelativeTo(a: any, reference: any): { x: number; y: number; z: number } {
    const qb = this.referenceQuaternion(reference);
    if (!qb) return this.eulerOf(a);
    const qa = this.referenceQuaternion(a) ?? { x: 0, y: 0, z: 0, w: 1 };
    return quaternionToEuler(multiplyQuaternions(qa, invertQuaternion(qb)));
  }

  /** Chiều dài khai báo trên entity (ví dụ `neckLength`, `upperArmRadius`). */
  private declaredLength(entity: any, ...keys: string[]): number {
    const value = this.numberField(entity, keys);
    return value > 0 ? value : 0;
  }

  /** Chiều dài của một xương trong cây xương (thuộc tính `length` của node). */
  private boneLengthOf(source: any, names: readonly string[]): number | undefined {
    const skeleton = buildSkeleton(source);
    if (!skeleton) return undefined;
    const wanted = names.map((name) => name.toLowerCase());
    for (const bone of allBones(skeleton)) {
      const name = bone.name.toLowerCase();
      if (wanted.some((w) => name === w || name.includes(w))) {
        return bone.length > 0 ? bone.length : undefined;
      }
    }
    return undefined;
  }

  /** Vị trí một khớp: xương thật → điểm thô → khung giải phẫu tĩnh. */
  private segmentPosition(
    context: BoneContext | null,
    boneNames: readonly string[],
    point: Vec3D | undefined,
    landmark: string,
  ): Vec3D {
    const fromBone = this.boneWorldPosition(context, boneNames);
    if (fromBone) return fromBone;
    if (point) return point;
    return this.framePosition(landmark);
  }

  /** Bề rộng vai đo được từ hai xương vai trong cây xương. */
  private shoulderSpanOf(source: any): number | undefined {
    const context = this.boneContext(this.sourcesOf(source));
    if (!context) return undefined;
    const left = this.boneWorldPosition(context, LEFT_SHOULDER_BONE_NAMES);
    const right = this.boneWorldPosition(context, RIGHT_SHOULDER_BONE_NAMES);
    if (!left || !right) return undefined;
    return distance3D(left, right);
  }

  /** Độ cao vai so với gốc cơ thể (xương gốc của cây). */
  private shoulderHeightOf(source: any): number | undefined {
    const context = this.boneContext(this.sourcesOf(source));
    if (!context) return undefined;
    const shoulder =
      this.boneWorldPosition(context, LEFT_SHOULDER_BONE_NAMES) ??
      this.boneWorldPosition(context, RIGHT_SHOULDER_BONE_NAMES);
    if (!shoulder) return undefined;
    const root = context.positions[context.names[0]];
    if (!root) return undefined;
    const height = shoulder.y - root.y;
    return height > 0 ? height : undefined;
  }

  /** Tâm thân: xương thân người, hoặc xương gốc của cây. */
  private torsoCenterOf(context: BoneContext | null): Vec3D | undefined {
    if (!context) return undefined;
    const named = this.boneWorldPosition(context, ['torso', 'hips', 'pelvis', 'chest', 'spine']);
    if (named) return named;
    const root = context.positions[context.names[0]];
    return root ? { x: root.x, y: root.y, z: root.z } : undefined;
  }

  /** Mức nhắm mắt khai báo trên một nguồn dữ liệu (undefined nếu không có). */
  private blinkAmountOf(source: any): number | undefined {
    if (!source || typeof source !== 'object') return undefined;
    const record = source as Record<string, unknown>;
    for (const key of ['blink', 'blinkAmount', 'eyelid', 'eyeClose']) {
      const raw = record[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    }
    return undefined;
  }

  /** Chiều dài đo được giữa hai xương trong cây xương. */
  private boneSegmentLength(
    source: any,
    fromNames: readonly string[],
    toNames: readonly string[],
  ): number | undefined {
    const context = this.boneContext(this.sourcesOf(source));
    if (!context) return undefined;
    const from = this.boneWorldPosition(context, fromNames);
    const to = this.boneWorldPosition(context, toNames);
    if (!from || !to) return undefined;
    return distance3D(from, to);
  }

  /** Chiều dài cánh tay trên đo được từ xương vai–khuỷu. */
  private upperArmLengthOf(source: any): number | undefined {
    return this.boneSegmentLength(
      source,
      ['shoulder_l', 'shoulder_r', 'humerus', 'upperarm'],
      ['elbow_l', 'elbow_r', 'elbow'],
    );
  }

  /** Chiều dài cánh tay dưới đo được từ xương khuỷu–cổ tay. */
  private forearmLengthOf(source: any): number | undefined {
    return this.boneSegmentLength(
      source,
      ['elbow_l', 'elbow_r', 'elbow'],
      ['wrist_l', 'wrist_r', 'wrist'],
    );
  }

  /** Tổng chiều dài chuỗi khớp cánh tay đo được từ cây xương. */
  private armChainLengthOf(source: any): number | undefined {
    const context = this.boneContext(this.sourcesOf(source));
    if (!context) return undefined;
    const shoulder = this.boneWorldPosition(context, SHOULDER_BONE_NAMES);
    const elbow = this.boneWorldPosition(context, ELBOW_BONE_NAMES);
    const wrist = this.boneWorldPosition(context, WRIST_BONE_NAMES);
    const hand = this.boneWorldPosition(context, HAND_BONE_NAMES);
    if (!shoulder || !elbow || !wrist || !hand) return undefined;
    return (
      distance3D(shoulder, elbow) + distance3D(elbow, wrist) + distance3D(wrist, hand)
    );
  }

  /**
   * Hai trục của khuỷu (vai→khuỷu và cổ tay→khuỷu).
   *
   * Ưu tiên xương thật; nếu không có thì dùng khung giải phẫu tĩnh xoay theo
   * quaternion của `a` (hành vi mặc định).
   */
  private elbowAxes(a: any, b: any): { dir1: Vec3D; dir2: Vec3D } {
    const context = this.boneContext(this.sourcesOf(a, b));
    const shoulderBone = this.boneWorldPosition(context, SHOULDER_BONE_NAMES);
    const elbowBone = this.boneWorldPosition(context, ELBOW_BONE_NAMES);
    const wristBone = this.boneWorldPosition(context, WRIST_BONE_NAMES);
    if (shoulderBone && elbowBone && wristBone) {
      return {
        dir1: normalize(subtract(shoulderBone, elbowBone)),
        dir2: normalize(subtract(wristBone, elbowBone)),
      };
    }
    const shoulder = this.framePosition('getLeftUpperArmPosition');
    const elbow = this.framePosition('getLeftElbowPosition');
    const wrist = this.framePosition('getLeftWristPosition');
    const upper = this.frameRotated(a, shoulder, elbow);
    const fore = this.frameRotated(a, wrist, elbow);
    return {
      dir1: normalize(subtract(upper, elbow)),
      dir2: normalize(subtract(fore, elbow)),
    };
  }

  /** Vị trí môi dưới từ nguồn tham chiếu (điểm thô hoặc xương hàm). */
  private lowerLipPosition(source: any): Vec3D | undefined {
    const point = this.rawPoint(source);
    if (point) return point;
    const context = this.boneContext(this.sourcesOf(source));
    return this.boneWorldPosition(context, JAW_BONE_NAMES);
  }

  // ==========================================================================
  // 4. Tọa độ đầu và khuôn mặt
  // ==========================================================================

  /**
   * [0151] getHeadPosition
   * Lấy tọa độ đầu (neo = vị trí entity, offset giải phẫu của tâm đầu).
   */
  public getHeadPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadPosition', entity, offset);
  }
  /**
   * [0152] getHeadCenter
   * Lấy tâm đầu.
   */
  public getHeadCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadCenter', entity, offset);
  }
  /**
   * [0153] getHeadTopPosition
   * Lấy tọa độ đỉnh đầu.
   */
  public getHeadTopPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadTopPosition', entity, offset);
  }
  /**
   * [0154] getHeadBottomPosition
   * Lấy tọa độ đáy đầu.
   */
  public getHeadBottomPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadBottomPosition', entity, offset);
  }
  /**
   * [0155] getHeadFrontPosition
   * Lấy tọa độ phía trước đầu.
   */
  public getHeadFrontPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadFrontPosition', entity, offset);
  }
  /**
   * [0156] getHeadBackPosition
   * Lấy tọa độ phía sau đầu.
   */
  public getHeadBackPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadBackPosition', entity, offset);
  }
  /**
   * [0157] getHeadLeftPosition
   * Lấy tọa độ bên trái đầu.
   */
  public getHeadLeftPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadLeftPosition', entity, offset);
  }
  /**
   * [0158] getHeadRightPosition
   * Lấy tọa độ bên phải đầu.
   */
  public getHeadRightPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getHeadRightPosition', entity, offset);
  }
  /**
   * [0159] getHeadForwardVector
   * Hướng phía trước của đầu (theo quaternion của entity, mặc định +Z).
   */
  public getHeadForwardVector(a?: any, b?: any): any {
    // `b` là khung tham chiếu: hướng được biểu diễn trong khung của `b`.
    const forward = normalize(entityForward(a));
    return directionResult('getHeadForwardVector', this.intoFrame(forward, b));
  }
  /**
   * [0160] getHeadUpVector
   * Hướng phía trên của đầu (theo quaternion của entity, mặc định +Y).
   */
  public getHeadUpVector(a?: any, b?: any): any {
    const up = this.axisOf(a, UP3);
    return directionResult('getHeadUpVector', this.intoFrame(up, b));
  }
  /**
   * [0161] getHeadRightVector
   * Hướng bên phải của đầu (theo quaternion của entity, mặc định +X).
   */
  public getHeadRightVector(a?: any, b?: any): any {
    const right = this.axisOf(a, RIGHT3);
    return directionResult('getHeadRightVector', this.intoFrame(right, b));
  }
  /**
   * [0162] calculateHeadCenterOffset
   * Độ lệch của tâm đầu so với neo (vị trí) của entity.
   */
  public calculateHeadCenterOffset(a?: any, b?: any, options?: any): any {
    // `a` = neo (entity), `b` = nguồn đầu (cây xương có xương hộp sọ),
    // `options` = scale / unit / invert.
    const sources = this.sourcesOf(a, b, options);
    const context = this.boneContext(sources);
    const anchor = entityPosition(a);
    const center =
      this.boneWorldPosition(context, HEAD_BONE_NAMES) ?? this.framePosition('getHeadCenter');
    const raw = subtract(center, anchor);
    const flipped = this.optBoolean(options, false, 'invert') ? scale(raw, -1) : raw;
    const offset = scale(flipped, this.optNumber(options, 1, 'scale'));
    const { unit, factor } = this.unitFactor(options, 'm');
    return namedResult('calculateHeadCenterOffset', {
      offset,
      distance: magnitude(offset) * factor,
      anchor,
      center,
    });
  }
  /**
   * [0163] calculateHeadBoundingBox
   * Tính hộp bao đầu (kích thước theo BODY_BOX_SIZES.head nếu không truyền).
   */
  public calculateHeadBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('head', size));
    return boundsResult('calculateHeadBoundingBox', box);
  }
  /**
   * [0164] calculateHeadBoundingSphere
   * Tính hình cầu bao đầu (bán kính = nửa đường chéo hộp đầu nếu không truyền).
   */
  public calculateHeadBoundingSphere(entity?: any, radius = 1.0): any {
    // `arguments.length` cho biết người gọi có truyền bán kính hay không —
    // giá trị mặc định 1.0 chỉ là dự phòng, không phải bán kính giải phẫu.
    const given = arguments.length >= 2 && Number.isFinite(radius);
    const r = given ? Math.max(0, radius) : halfDiagonal(BODY_BOX_SIZES.head);
    return {
      name: 'calculateHeadBoundingSphere',
      valid: true,
      center: entityPosition(entity),
      radius: r,
      timestamp: Date.now(),
    };
  }
  /**
   * [0165] calculateHeadOrientation
   * Tính hướng quay đầu (quaternion của entity hoặc xương đầu, mặc định đơn vị).
   */
  public calculateHeadOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['head', 'skull', 'neck'], options);
    return orientationResult('calculateHeadOrientation', q);
  }
  /**
   * [0166] calculateHeadLookDirection
   * Hướng nhìn của đầu: về điểm ngắm nếu có, ngược lại theo quaternion.
   */
  public calculateHeadLookDirection(a?: any, b?: any): any {
    if (isPointLike(b)) {
      const dir = normalize(subtract(asPoint(b), entityPosition(a)));
      if (magnitude(dir) > 0) return directionResult('calculateHeadLookDirection', dir);
    }
    return directionResult('calculateHeadLookDirection', normalize(entityForward(a)));
  }
  /**
   * [0167] calculateHeadAimDirection
   * Hướng ngắm của đầu (về mục tiêu nếu có, ngược lại hướng nhìn).
   */
  public calculateHeadAimDirection(a?: any, b?: any): any {
    const target = isPointLike(b) ? asPoint(b) : undefined;
    if (target) {
      const dir = normalize(subtract(target, entityPosition(a)));
      if (magnitude(dir) > 0) return directionResult('calculateHeadAimDirection', dir);
    }
    return directionResult('calculateHeadAimDirection', normalize(entityForward(a)));
  }
  /**
   * [0168] calculateHeadTilt
   * Độ nghiêng chung của đầu (góc nghiêng + xoay, bỏ qua phần xoay quanh trục Y).
   */
  public calculateHeadTilt(a?: any, b?: any): any {
    const e = this.eulerOf(a ?? b);
    const tilt = Math.hypot(e.x, e.z);
    return measurement('calculateHeadTilt', tilt, 'rad');
  }
  /**
   * [0169] calculateHeadYaw
   * Góc quay ngang của đầu (xoay quanh trục Y).
   */
  public calculateHeadYaw(a?: any, b?: any): any {
    const e = this.eulerOf(a ?? b);
    return measurement('calculateHeadYaw', e.y, 'rad');
  }
  /**
   * [0170] calculateHeadPitch
   * Góc cúi ngẩng của đầu (xoay quanh trục X).
   */
  public calculateHeadPitch(a?: any, b?: any): any {
    const e = this.eulerOf(a ?? b);
    return measurement('calculateHeadPitch', e.x, 'rad');
  }
  /**
   * [0171] calculateHeadRoll
   * Góc nghiêng sang bên của đầu (xoay quanh trục Z).
   */
  public calculateHeadRoll(a?: any, b?: any): any {
    const e = this.eulerOf(a ?? b);
    return measurement('calculateHeadRoll', e.z, 'rad');
  }
  /**
   * [0172] getFaceCenter
   * Lấy tâm khuôn mặt.
   */
  public getFaceCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getFaceCenter', entity, offset);
  }
  /**
   * [0173] getForeheadPosition
   * Lấy tọa độ trán.
   */
  public getForeheadPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getForeheadPosition', entity, offset);
  }
  /**
   * [0174] getChinPosition
   * Lấy tọa độ cằm.
   */
  public getChinPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getChinPosition', entity, offset);
  }
  /**
   * [0175] getJawPosition
   * Lấy tọa độ hàm.
   */
  public getJawPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getJawPosition', entity, offset);
  }
  /**
   * [0176] getLeftEyePosition
   * Lấy tọa độ mắt trái.
   */
  public getLeftEyePosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftEyePosition', entity, offset);
  }
  /**
   * [0177] getRightEyePosition
   * Lấy tọa độ mắt phải.
   */
  public getRightEyePosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightEyePosition', entity, offset);
  }
  /**
   * [0178] getLeftPupilPosition
   * Lấy tọa độ đồng tử trái.
   */
  public getLeftPupilPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftPupilPosition', entity, offset);
  }
  /**
   * [0179] getRightPupilPosition
   * Lấy tọa độ đồng tử phải.
   */
  public getRightPupilPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightPupilPosition', entity, offset);
  }
  /**
   * [0180] getNosePosition
   * Lấy tọa độ mũi.
   */
  public getNosePosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getNosePosition', entity, offset);
  }
  /**
   * [0181] getNoseTipPosition
   * Lấy tọa độ chóp mũi.
   */
  public getNoseTipPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getNoseTipPosition', entity, offset);
  }
  /**
   * [0182] getMouthCenter
   * Lấy tâm miệng.
   */
  public getMouthCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getMouthCenter', entity, offset);
  }
  /**
   * [0183] getUpperLipPosition
   * Lấy tọa độ môi trên.
   */
  public getUpperLipPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getUpperLipPosition', entity, offset);
  }
  /**
   * [0184] getLowerLipPosition
   * Lấy tọa độ môi dưới.
   */
  public getLowerLipPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLowerLipPosition', entity, offset);
  }
  /**
   * [0185] getLeftEarPosition
   * Lấy tọa độ tai trái.
   */
  public getLeftEarPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftEarPosition', entity, offset);
  }
  /**
   * [0186] getRightEarPosition
   * Lấy tọa độ tai phải.
   */
  public getRightEarPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightEarPosition', entity, offset);
  }
  /**
   * [0187] getLeftEyebrowPosition
   * Lấy tọa độ lông mày trái.
   */
  public getLeftEyebrowPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftEyebrowPosition', entity, offset);
  }
  /**
   * [0188] getRightEyebrowPosition
   * Lấy tọa độ lông mày phải.
   */
  public getRightEyebrowPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightEyebrowPosition', entity, offset);
  }
  /**
   * [0189] getLeftCheekPosition
   * Lấy tọa độ má trái.
   */
  public getLeftCheekPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftCheekPosition', entity, offset);
  }
  /**
   * [0190] getRightCheekPosition
   * Lấy tọa độ má phải.
   */
  public getRightCheekPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightCheekPosition', entity, offset);
  }
  /**
   * [0191] calculateEyeDistance
   * Khoảng cách giữa hai mắt (mặc định theo BODY_DIMENSIONS.eyeSeparation).
   */
  public calculateEyeDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftEyePosition', 'getRightEyePosition');
    return measurement('calculateEyeDistance', value, 'm');
  }
  /**
   * [0192] calculateEyeGazeDirection
   * Hướng nhìn của mắt (về điểm ngắm nếu có, ngược lại theo hướng nhìn đầu).
   */
  public calculateEyeGazeDirection(a?: any, b?: any): any {
    const eye = isPointLike(a) ? asPoint(a) : this.framePosition('getLeftEyePosition');
    if (isPointLike(b)) {
      const dir = normalize(subtract(asPoint(b), eye));
      if (magnitude(dir) > 0) return directionResult('calculateEyeGazeDirection', dir);
    }
    return directionResult('calculateEyeGazeDirection', normalize(entityForward(a)));
  }
  /**
   * [0193] calculatePupilOffset
   * Độ lệch của đồng tử so với tâm mắt (mỗi bên).
   */
  public calculatePupilOffset(a?: any, b?: any, options?: any): any {
    const anchor = entityPosition(a);
    const leftEye = add(anchor, HEAD_LANDMARKS.getLeftEyePosition);
    const rightEye = add(anchor, HEAD_LANDMARKS.getRightEyePosition);
    const baseLeft = subtract(add(anchor, HEAD_LANDMARKS.getLeftPupilPosition), leftEye);
    const baseRight = subtract(add(anchor, HEAD_LANDMARKS.getRightPupilPosition), rightEye);
    // `b` (hoặc `options.target`) là điểm ngắm: đồng tử lệch về phía điểm ngắm.
    const target =
      this.optVector(options, 'target', 'focus', 'reference') ??
      (isPointLike(b) ? asPoint(b) : undefined);
    let left = baseLeft;
    let right = baseRight;
    if (target) {
      const gazeLeft = normalize(subtract(target, leftEye));
      const gazeRight = normalize(subtract(target, rightEye));
      left = scale(gazeLeft, magnitude(baseLeft));
      right = scale(gazeRight, magnitude(baseRight));
    }
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const flip = this.optBoolean(options, false, 'invert') ? -1 : 1;
    left = scale(left, scaleFactor * flip);
    right = scale(right, scaleFactor * flip);
    const { unit, factor } = this.unitFactor(options, 'm');
    return namedResult('calculatePupilOffset', {
      left,
      right,
      distance: magnitude(left) * factor,
    });
  }
  /**
   * [0194] calculateFaceOrientation
   * Hướng quay khuôn mặt (quaternion của entity, nếu không thì dựng từ pháp
   * tuyến mặt — trong tư thế chuẩn pháp tuyến là +Z nên quaternion đơn vị).
   */
  public calculateFaceOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['face', 'head', 'skull'], options);
    if (q.w !== 1 || q.x !== 0 || q.y !== 0 || q.z !== 0) {
      return orientationResult('calculateFaceOrientation', q);
    }
    const normal = this.faceNormal();
    const center = this.framePosition('getFaceCenter');
    const up = this.axisOf(entityOrAngle, UP3);
    return orientationResult(
      'calculateFaceOrientation',
      lookAtQuaternion(center, add(center, normal), up),
    );
  }
  /**
   * [0195] calculateFaceNormal
   * Pháp tuyến khuôn mặt (cross của trục ngang và trục dọc của các mốc mặt).
   */
  public calculateFaceNormal(a?: any, b?: any): any {
    // `a` = entity đầu (xoay pháp tuyến mặt theo quaternion của entity),
    // `b` = khung tham chiếu để biểu diễn pháp tuyến.
    const q = readQuaternion(a);
    const normal = q ? normalize(rotateVector(q, this.faceNormal())) : this.faceNormal();
    return directionResult('calculateFaceNormal', this.intoFrame(normal, b));
  }
  /**
   * [0196] calculateFaceSymmetry
   * Độ đối xứng khuôn mặt (1 = hoàn hảo), tính từ các cặp mốc trái/phải.
   */
  public calculateFaceSymmetry(a?: any, b?: any, options?: any): any {
    const anchor = entityPosition(a);
    const pairs: Array<[Vec3D, Vec3D]> = [
      [
        add(anchor, HEAD_LANDMARKS.getLeftEyePosition),
        add(anchor, HEAD_LANDMARKS.getRightEyePosition),
      ],
      [
        add(anchor, HEAD_LANDMARKS.getLeftEarPosition),
        add(anchor, HEAD_LANDMARKS.getRightEarPosition),
      ],
      [
        add(anchor, HEAD_LANDMARKS.getLeftCheekPosition),
        add(anchor, HEAD_LANDMARKS.getRightCheekPosition),
      ],
      [
        add(anchor, HEAD_LANDMARKS.getLeftEyebrowPosition),
        add(anchor, HEAD_LANDMARKS.getRightEyebrowPosition),
      ],
      [
        add(anchor, HEAD_LANDMARKS.getLeftPupilPosition),
        add(anchor, HEAD_LANDMARKS.getRightPupilPosition),
      ],
    ];
    // `b` (hoặc `options.reference`) là cơ thể tham chiếu: mặt phẳng điện
    // của nó quyết định cách phản chiếu cặp mốc trái/phải.
    const reference = b ?? this.optObject(options, 'reference');
    const mirror = (right: Vec3D): Vec3D =>
      reference
        ? this.mirrorAcrossSagittal(right, reference)
        : { x: -right.x, y: right.y, z: right.z };
    const scaleRef = this.optNumber(options, BODY_DIMENSIONS.headRadius * 2, 'reference');
    let sum = 0;
    for (const [left, right] of pairs) sum += this.symmetryOf(left, right, scaleRef, mirror(right));
    const raw = sum / pairs.length;
    const symmetry = this.optBoolean(options, false, 'invert') ? 1 - raw : raw;
    return namedResult('calculateFaceSymmetry', {
      symmetry,
      pairs: pairs.length,
    });
  }
  /**
   * [0197] calculateMouthOpening
   * Độ mở miệng (khe hở dọc giữa môi trên và môi dưới).
   */
  public calculateMouthOpening(a?: any, b?: any, options?: any): any {
    const anchor = entityPosition(a);
    const upper = add(anchor, HEAD_LANDMARKS.getUpperLipPosition);
    // `b` là nguồn của môi dưới (hàm): điểm thô hoặc cây xương có xương hàm.
    const lower = this.lowerLipPosition(b) ?? add(anchor, HEAD_LANDMARKS.getLowerLipPosition);
    const gap = Math.abs(upper.y - lower.y);
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const reference = this.optNumber(options, BODY_DIMENSIONS.mouthWidth, 'reference');
    const opening = gap * scaleFactor * factor;
    return namedResult('calculateMouthOpening', {
      opening,
      normalized: clamp01(opening / (reference || 1)),
      upperLip: upper,
      lowerLip: lower,
    });
  }
  /**
   * [0198] calculateJawOpeningAngle
   * Góc mở hàm (góc cúi của khớp hàm so với đầu).
   */
  public calculateJawOpeningAngle(a?: any, b?: any): any {
    const q = this.orientationOf(a, ['jaw', 'mandible', 'lowerjaw'], b);
    const e = quaternionToEuler(q);
    const value = Math.abs(e.x);
    return measurement('calculateJawOpeningAngle', value, 'rad');
  }
  /**
   * [0199] calculateBlinkAmount
   * Mức độ nhắm mắt (0 = mắt mở, 1 = mắt nhắm kín).
   */
  public calculateBlinkAmount(a?: any, b?: any, options?: any): any {
    // `b` là nguồn dữ liệu thay thế (ví dụ entity cha chứa trạng thái mi mắt).
    const raw = this.blinkAmountOf(a) ?? this.blinkAmountOf(b) ?? 0;
    const scaled = raw * this.optNumber(options, 1, 'scale');
    const amount = clamp01(this.optBoolean(options, false, 'invert') ? 1 - scaled : scaled);
    return namedResult('calculateBlinkAmount', {
      amount,
      closed: amount >= 0.99,
      open: amount <= 0.01,
    });
  }
  /**
   * [0200] calculateFacialLandmarkDistance
   * Khoảng cách giữa hai mốc khuôn mặt (mặc định: chóp mũi → cằm).
   */
  public calculateFacialLandmarkDistance(a?: any, b?: any): any {
    if (isPointLike(a) && isPointLike(b)) {
      return measurement('calculateFacialLandmarkDistance', distance3D(asPoint(a), asPoint(b)), 'm');
    }
    const value = distance3D(
      this.framePosition('getNoseTipPosition'),
      this.framePosition('getChinPosition'),
    );
    return measurement('calculateFacialLandmarkDistance', value, 'm');
  }
  // ==========================================================================
  // 5. Tọa độ cổ và vai
  // ==========================================================================

  /**
   * [0201] getNeckPosition
   * Lấy tọa độ cổ.
   */
  public getNeckPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getNeckPosition', entity, offset);
  }
  /**
   * [0202] getNeckCenter
   * Lấy tâm cổ.
   */
  public getNeckCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getNeckCenter', entity, offset);
  }
  /**
   * [0203] getNeckBasePosition
   * Lấy tọa độ gốc cổ.
   */
  public getNeckBasePosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getNeckBasePosition', entity, offset);
  }
  /**
   * [0204] getNeckTopPosition
   * Lấy tọa độ đỉnh cổ.
   */
  public getNeckTopPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getNeckTopPosition', entity, offset);
  }
  /**
   * [0205] getNeckForwardVector
   * Hướng phía trước của cổ.
   */
  public getNeckForwardVector(a?: any, b?: any): any {
    const forward = normalize(entityForward(a));
    return directionResult('getNeckForwardVector', this.intoFrame(forward, b));
  }
  /**
   * [0206] getNeckUpVector
   * Hướng phía trên của cổ.
   */
  public getNeckUpVector(a?: any, b?: any): any {
    const up = this.axisOf(a, UP3);
    return directionResult('getNeckUpVector', this.intoFrame(up, b));
  }
  /**
   * [0207] calculateNeckLength
   * Chiều dài cổ (BODY_DIMENSIONS.neckLength).
   */
  public calculateNeckLength(entity?: any, options?: any): any {
    // `entity` là nguồn chiều dài cổ: khai báo trên entity hoặc trong cây xương.
    const source = this.sourceEntity(entity, options);
    const declared = this.declaredLength(source, 'neckLength', 'neck_length');
    const bone = this.boneLengthOf(source, ['neck', 'neckbone']);
    const meters = declared > 0 ? declared : (bone ?? BODY_DIMENSIONS.neckLength);
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateNeckLength', meters * scaleFactor * factor, unit);
  }
  /**
   * [0208] calculateNeckOrientation
   * Hướng quay cổ (quaternion của xương cổ, mặc định đơn vị).
   */
  public calculateNeckOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['neck', 'neckbone'], options);
    return orientationResult('calculateNeckOrientation', q);
  }
  /**
   * [0209] calculateNeckBendAngle
   * Góc gập cổ (cúi ngẩng của khớp cổ).
   */
  public calculateNeckBendAngle(a?: any, b?: any): any {
    // `b` là cơ thể tham chiếu: góc gập đo tương đối với khung của `b`.
    const e = this.eulerRelativeTo(a, b);
    return measurement('calculateNeckBendAngle', Math.abs(e.x), 'rad');
  }
  /**
   * [0210] calculateNeckTwistAngle
   * Góc xoay cổ (xoay quanh trục dọc của cổ).
   */
  public calculateNeckTwistAngle(a?: any, b?: any): any {
    const e = this.eulerRelativeTo(a, b);
    return measurement('calculateNeckTwistAngle', Math.abs(e.y), 'rad');
  }
  /**
   * [0211] calculateNeckCurvature
   * Độ cong của cổ (độ cong của cung tròn = góc gập / chiều dài cổ).
   */
  public calculateNeckCurvature(entity?: any, options?: any): any {
    const e = this.eulerOf(entity);
    const bend = Math.abs(e.x);
    const curvature = BODY_DIMENSIONS.neckLength > 0 ? bend / BODY_DIMENSIONS.neckLength : 0;
    const { unit, factor } = this.unitFactor(options, '1/m');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateNeckCurvature', curvature * scaleFactor * factor, unit);
  }
  /**
   * [0212] calculateNeckToHeadDistance
   * Khoảng cách từ gốc cổ tới tâm đầu.
   */
  public calculateNeckToHeadDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getNeckBasePosition', 'getHeadCenter');
    return measurement('calculateNeckToHeadDistance', value, 'm');
  }
  /**
   * [0213] calculateNeckToShoulderDistance
   * Khoảng cách từ gốc cổ tới tâm hai vai.
   */
  public calculateNeckToShoulderDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getNeckBasePosition', 'getShoulderCenter');
    return measurement('calculateNeckToShoulderDistance', value, 'm');
  }
  /**
   * [0214] calculateNeckBoundingBox
   * Tính hộp bao cổ (kích thước theo BODY_BOX_SIZES.neck nếu không truyền).
   */
  public calculateNeckBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('neck', size));
    return boundsResult('calculateNeckBoundingBox', box);
  }
  /**
   * [0215] calculateNeckJointRotation
   * Góc quay khớp cổ (xoay tương đối của cổ so với đầu).
   */
  public calculateNeckJointRotation(entityOrAngle?: any, options?: any): any {
    const neck = this.orientationOf(entityOrAngle, ['neck', 'neckbone'], options);
    const head = this.orientationOf(entityOrAngle, ['head', 'skull'], options);
    const relative = multiplyQuaternions(neck, invertQuaternion(head));
    return orientationResult('calculateNeckJointRotation', relative);
  }
  /**
   * [0216] getLeftShoulderPosition
   * Lấy tọa độ vai trái.
   */
  public getLeftShoulderPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftShoulderPosition', entity, offset);
  }
  /**
   * [0217] getRightShoulderPosition
   * Lấy tọa độ vai phải.
   */
  public getRightShoulderPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightShoulderPosition', entity, offset);
  }
  /**
   * [0218] getShoulderCenter
   * Lấy tâm hai vai.
   */
  public getShoulderCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getShoulderCenter', entity, offset);
  }
  /**
   * [0219] getLeftShoulderTip
   * Lấy tọa độ đầu ngoài vai trái.
   */
  public getLeftShoulderTip(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftShoulderTip', entity, offset);
  }
  /**
   * [0220] getRightShoulderTip
   * Lấy tọa độ đầu ngoài vai phải.
   */
  public getRightShoulderTip(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightShoulderTip', entity, offset);
  }
  /**
   * [0221] getLeftClaviclePosition
   * Lấy tọa độ xương đòn trái.
   */
  public getLeftClaviclePosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftClaviclePosition', entity, offset);
  }
  /**
   * [0222] getRightClaviclePosition
   * Lấy tọa độ xương đòn phải.
   */
  public getRightClaviclePosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightClaviclePosition', entity, offset);
  }
  /**
   * [0223] getLeftScapulaPosition
   * Lấy tọa độ xương bả vai trái.
   */
  public getLeftScapulaPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftScapulaPosition', entity, offset);
  }
  /**
   * [0224] getRightScapulaPosition
   * Lấy tọa độ xương bả vai phải.
   */
  public getRightScapulaPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightScapulaPosition', entity, offset);
  }
  /**
   * [0225] calculateShoulderWidth
   * Chiều rộng vai (BODY_DIMENSIONS.shoulderWidth).
   */
  public calculateShoulderWidth(entity?: any, options?: any): any {
    // `entity` là nguồn bề rộng vai: đo từ hai xương vai hoặc khai báo trên entity.
    const source = this.sourceEntity(entity, options);
    const measured = this.shoulderSpanOf(source);
    const declared = this.declaredLength(source, 'shoulderWidth', 'shoulder_width');
    const meters = measured ?? (declared > 0 ? declared : BODY_DIMENSIONS.shoulderWidth);
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateShoulderWidth', meters * scaleFactor * factor, unit);
  }
  /**
   * [0226] calculateShoulderHeight
   * Độ cao vai so với gốc cơ thể (BODY_DIMENSIONS.shoulderHeight).
   */
  public calculateShoulderHeight(entity?: any, options?: any): any {
    // `entity` là nguồn độ cao vai: đo từ cây xương (vai so với gốc) hoặc khai báo.
    const source = this.sourceEntity(entity, options);
    const measured = this.shoulderHeightOf(source);
    const declared = this.declaredLength(source, 'shoulderHeight', 'shoulder_height');
    const meters = measured ?? (declared > 0 ? declared : BODY_DIMENSIONS.shoulderHeight);
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateShoulderHeight', meters * scaleFactor * factor, unit);
  }
  /**
   * [0227] calculateShoulderSlope
   * Độ dốc của đường vai (atan2 chênh cao / bề rộng vai).
   */
  public calculateShoulderSlope(a?: any, b?: any, options?: any): any {
    const sources = this.sourcesOf(a, b, options);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    // Ưu tiên xương thật (FK) để độ dốc phản ánh tư thế; fallback offset tĩnh.
    const left =
      this.boneWorldPosition(context, ['shoulder_l']) ??
      this.framePosition('getLeftShoulderPosition');
    const right =
      this.boneWorldPosition(context, ['shoulder_r']) ??
      this.mirrorAcrossSagittal(left, entity);
    const width = Math.abs(right.x - left.x) || BODY_DIMENSIONS.shoulderWidth;
    const rise = right.y - left.y;
    const slope = Math.atan2(rise, width);
    return namedResult('calculateShoulderSlope', {
      slope,
      degrees: (slope * 180) / Math.PI,
      heightDifference: rise,
      width,
    });
  }
  /**
   * [0228] calculateShoulderSymmetry
   * Độ đối xứng của hai vai (1 = hoàn hảo).
   */
  public calculateShoulderSymmetry(a?: any, b?: any, options?: any): any {
    // `a` = nguồn vai trái, `b` = nguồn vai phải (xương thật hoặc điểm thô).
    const context = this.boneContext(this.sourcesOf(a, b, options));
    const left =
      this.boneWorldPosition(context, LEFT_SHOULDER_BONE_NAMES) ??
      this.rawPoint(a) ??
      this.framePosition('getLeftShoulderPosition');
    const right =
      this.boneWorldPosition(context, RIGHT_SHOULDER_BONE_NAMES) ??
      this.rawPoint(b) ??
      this.framePosition('getRightShoulderPosition');
    const scaleRef = this.optNumber(options, BODY_DIMENSIONS.shoulderWidth, 'reference');
    const raw = this.symmetryOf(left, right, scaleRef);
    const symmetry = this.optBoolean(options, false, 'invert') ? 1 - raw : raw;
    return namedResult('calculateShoulderSymmetry', { symmetry, left, right });
  }
  /**
   * [0229] calculateShoulderDistanceToHead
   * Khoảng cách từ tâm hai vai tới tâm đầu.
   */
  public calculateShoulderDistanceToHead(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getShoulderCenter', 'getHeadCenter');
    return measurement('calculateShoulderDistanceToHead', value, 'm');
  }
  /**
   * [0230] calculateShoulderDistanceToHip
   * Khoảng cách từ tâm hai vai tới tâm hông (chiều cao thân).
   */
  public calculateShoulderDistanceToHip(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getShoulderCenter', 'getHipCenter');
    return measurement('calculateShoulderDistanceToHip', value, 'm');
  }
  /**
   * [0231] calculateShoulderToShoulderVector
   * Vector từ vai trái tới vai phải.
   *
   * Nguồn dữ liệu theo thứ tự ưu tiên:
   * 1. Xương thật (`shoulder_L`/`shoulder_R`) — nếu chỉ có xương một bên thì
   *    bên kia được suy ra bằng đối xứng qua mặt phẳng điện của cơ thể.
   * 2. Hai điểm thô do người gọi truyền vào (vai trái, vai phải).
   * 3. Offset giải phẫu tĩnh (neo tại `entity.position`).
   */
  public calculateShoulderToShoulderVector(a?: any, b?: any): any {
    const sources = this.sourcesOf(a, b);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const leftBone = this.boneWorldPosition(context, LEFT_SHOULDER_BONE_NAMES);
    const rightBone = this.boneWorldPosition(context, RIGHT_SHOULDER_BONE_NAMES);
    const pointA = this.rawPoint(a);
    const pointB = this.rawPoint(b);
    const bothPoints = Boolean(pointA && pointB);

    let left = leftBone ?? (bothPoints ? pointA : undefined);
    let right = rightBone ?? (bothPoints ? pointB : undefined);
    if (leftBone && !right && !bothPoints) right = this.mirrorAcrossSagittal(leftBone, entity);
    if (rightBone && !left && !bothPoints) left = this.mirrorAcrossSagittal(rightBone, entity);
    if (!left) left = this.landmarkPosition('getLeftShoulderPosition', entity);
    if (!right) right = this.landmarkPosition('getRightShoulderPosition', entity);

    const vector = normalize(subtract(right, left));
    return directionResult('calculateShoulderToShoulderVector', vector, {
      left,
      right,
      width: distance3D(left, right),
    });
  }
  /**
   * [0232] calculateShoulderForwardDirection
   * Hướng phía trước của vùng vai.
   */
  public calculateShoulderForwardDirection(a?: any, b?: any): any {
    const forward = normalize(entityForward(a));
    return directionResult('calculateShoulderForwardDirection', this.intoFrame(forward, b));
  }
  /**
   * [0233] calculateShoulderUpDirection
   * Hướng phía trên của vùng vai.
   */
  public calculateShoulderUpDirection(a?: any, b?: any): any {
    const up = this.axisOf(a, UP3);
    return directionResult('calculateShoulderUpDirection', this.intoFrame(up, b));
  }
  /**
   * [0234] calculateShoulderJointAngle
   * Góc khớp vai: góc giữa hướng cánh tay và trục cánh tay ở tư thế chuẩn.
   */
  public calculateShoulderJointAngle(a?: any, b?: any): any {
    // `b` là cơ thể tham chiếu: góc khớp đo với trục cánh tay của `b`.
    const dir = this.axisOf(a, REST_ARM_AXIS);
    const reference = this.axisOf(b, REST_ARM_AXIS);
    const value = Math.acos(clamp(dot(dir, reference), -1, 1));
    return measurement('calculateShoulderJointAngle', value, 'rad');
  }
  /**
   * [0235] calculateShoulderAbduction
   * Góc dạng vai (đưa cánh tay ra ngoài, thành phần ngang).
   */
  public calculateShoulderAbduction(a?: any, b?: any): any {
    // `b` là khung tham chiếu: thành phần ngang đo theo trục ngang của `b`.
    const dir = this.axisOf(a, REST_ARM_AXIS);
    const right = this.referenceAxis(b, RIGHT3);
    const down = this.referenceAxis(b, REST_ARM_AXIS);
    const value = Math.atan2(Math.abs(dot(dir, right)), Math.max(1e-6, dot(dir, down)));
    return measurement('calculateShoulderAbduction', value, 'rad');
  }
  /**
   * [0236] calculateShoulderAdduction
   * Góc khép vai (đưa cánh tay vào trong, thành phần ngang).
   */
  public calculateShoulderAdduction(a?: any, b?: any): any {
    // `b` là khung tham chiếu: khép vai là thành phần ngang đưa cánh tay về
    // phía đường giữa (trục ngang âm của khung tham chiếu).
    const dir = this.axisOf(a, REST_ARM_AXIS);
    const hasFrame = this.referenceQuaternion(b) !== undefined;
    const right = this.referenceAxis(b, RIGHT3);
    const down = this.referenceAxis(b, REST_ARM_AXIS);
    const lateral = dot(dir, right);
    const toward = hasFrame ? Math.max(0, -lateral) : Math.abs(lateral);
    const value = Math.atan2(toward, Math.max(1e-6, dot(dir, down)));
    return measurement('calculateShoulderAdduction', value, 'rad');
  }
  /**
   * [0237] calculateShoulderFlexion
   * Góc gập vai (đưa cánh tay về phía trước, thành phần chiều sâu).
   */
  public calculateShoulderFlexion(a?: any, b?: any): any {
    const dir = this.axisOf(a, REST_ARM_AXIS);
    const forward = this.referenceAxis(b, FORWARD3);
    const down = this.referenceAxis(b, REST_ARM_AXIS);
    const value = Math.atan2(dot(dir, forward), Math.max(1e-6, dot(dir, down)));
    return measurement('calculateShoulderFlexion', value, 'rad');
  }
  /**
   * [0238] calculateShoulderExtension
   * Góc duỗi vai (đưa cánh tay về phía sau, thành phần chiều sâu âm).
   */
  public calculateShoulderExtension(a?: any, b?: any): any {
    const dir = this.axisOf(a, REST_ARM_AXIS);
    const forward = this.referenceAxis(b, FORWARD3);
    const down = this.referenceAxis(b, REST_ARM_AXIS);
    const value = Math.atan2(-dot(dir, forward), Math.max(1e-6, dot(dir, down)));
    return measurement('calculateShoulderExtension', value, 'rad');
  }
  /**
   * [0239] calculateShoulderInternalRotation
   * Góc xoay trong của vai (xoay quanh trục cánh tay).
   */
  public calculateShoulderInternalRotation(entityOrAngle?: any, options?: any): any {
    const shoulder = this.orientationOf(entityOrAngle, ['shoulder', 'upperarm', 'humerus'], options);
    const e = quaternionToEuler(shoulder);
    const axis = this.axisOf(entityOrAngle, REST_ARM_AXIS);
    return orientationResult(
      'calculateShoulderInternalRotation',
      rotateAroundAxis(axis, e.z),
    );
  }
  /**
   * [0240] calculateShoulderExternalRotation
   * Góc xoay ngoài của vai (phần xoay còn lại sau xoay trong).
   */
  public calculateShoulderExternalRotation(entityOrAngle?: any, options?: any): any {
    const shoulder = this.orientationOf(entityOrAngle, ['shoulder', 'upperarm', 'humerus'], options);
    const e = quaternionToEuler(shoulder);
    const axis = this.axisOf(entityOrAngle, REST_ARM_AXIS);
    const internal = rotateAroundAxis(axis, e.z);
    return orientationResult(
      'calculateShoulderExternalRotation',
      multiplyQuaternions(shoulder, invertQuaternion(internal)),
    );
  }
  /**
   * [0241] calculateShoulderBoundingBox
   * Tính hộp bao vùng vai (kích thước theo BODY_BOX_SIZES.shoulder nếu không truyền).
   */
  public calculateShoulderBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('shoulder', size));
    return boundsResult('calculateShoulderBoundingBox', box);
  }
  /**
   * [0242] calculateShoulderCenterOfMass
   * Tâm khối lượng vùng vai (0,4·L tính từ đầu gần của xương đòn).
   */
  public calculateShoulderCenterOfMass(entity?: any, options?: any): any {
    // `entity` là nguồn chiều dài xương đòn (tâm khối lượng ở 0,4·L từ đầu gần).
    const source = this.sourceEntity(entity, options);
    const measured = this.boneLengthOf(source, ['clavicle']);
    const declared = this.declaredLength(source, 'clavicleLength', 'clavicle_length');
    const clavicle = measured ?? (declared > 0 ? declared : BODY_DIMENSIONS.clavicleLength);
    const fraction = this.optNumber(options, 0.4, 'fraction');
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const value = clavicle * fraction * scaleFactor * factor;
    return measurement('calculateShoulderCenterOfMass', value, unit);
  }
  /**
   * [0243] calculateClavicleLength
   * Chiều dài xương đòn (BODY_DIMENSIONS.clavicleLength).
   */
  public calculateClavicleLength(entity?: any, options?: any): any {
    const source = this.sourceEntity(entity, options);
    const measured = this.boneLengthOf(source, ['clavicle']);
    const declared = this.declaredLength(source, 'clavicleLength', 'clavicle_length');
    const meters = measured ?? (declared > 0 ? declared : BODY_DIMENSIONS.clavicleLength);
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateClavicleLength', meters * scaleFactor * factor, unit);
  }
  /**
   * [0244] calculateScapulaOrientation
   * Hướng quay xương bả vai (quaternion của xương bả vai, mặc định đơn vị).
   */
  public calculateScapulaOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['scapula', 'shoulderblade'], options);
    return orientationResult('calculateScapulaOrientation', q);
  }
  /**
   * [0245] calculateShoulderToElbowDistance
   * Khoảng cách vai tới khuỷu (chiều dài cánh tay trên).
   */
  public calculateShoulderToElbowDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftUpperArmPosition', 'getLeftElbowPosition');
    return measurement('calculateShoulderToElbowDistance', value, 'm');
  }
  /**
   * [0246] calculateShoulderToWristDistance
   * Khoảng cách vai tới cổ tay.
   */
  public calculateShoulderToWristDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftUpperArmPosition', 'getLeftWristPosition');
    return measurement('calculateShoulderToWristDistance', value, 'm');
  }
  /**
   * [0247] calculateShoulderToHandDistance
   * Khoảng cách vai tới bàn tay.
   */
  public calculateShoulderToHandDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftUpperArmPosition', 'getLeftHandPosition');
    return measurement('calculateShoulderToHandDistance', value, 'm');
  }
  /**
   * [0248] calculateShoulderMotionVector
   * Vector chuyển động của vai (vận tốc nếu có, ngược lại hướng từ a tới b).
   */
  public calculateShoulderMotionVector(a?: any, b?: any): any {
    if (isPointLike(a) && isPointLike(b)) {
      const dir = normalize(subtract(asPoint(b), asPoint(a)));
      if (magnitude(dir) > 0) return directionResult('calculateShoulderMotionVector', dir);
    }
    const velocity = this.velocityOf(a);
    if (magnitude(velocity) > 0) {
      return directionResult('calculateShoulderMotionVector', normalize(velocity));
    }
    return directionResult('calculateShoulderMotionVector', { x: 0, y: 0, z: 0 });
  }
  /**
   * [0249] calculateShoulderVelocity
   * Vận tốc của vai (đọc entity.velocity, mặc định zero).
   */
  public calculateShoulderVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateShoulderVelocity', this.velocityOf(entity), { dt });
  }
  /**
   * [0250] calculateShoulderAcceleration
   * Gia tốc của vai (đọc entity.acceleration, mặc định zero).
   */
  public calculateShoulderAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateShoulderAcceleration', this.accelerationOf(entity), { dt });
  }

  // ==========================================================================
  // 6. Tọa độ cánh tay và khuỷu tay
  // ==========================================================================

  /**
   * [0251] getLeftUpperArmPosition
   * Lấy tọa độ cánh tay trên trái.
   */
  public getLeftUpperArmPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftUpperArmPosition', entity, offset);
  }
  /**
   * [0252] getRightUpperArmPosition
   * Lấy tọa độ cánh tay trên phải.
   */
  public getRightUpperArmPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightUpperArmPosition', entity, offset);
  }
  /**
   * [0253] getLeftUpperArmCenter
   * Lấy tâm cánh tay trên trái.
   */
  public getLeftUpperArmCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftUpperArmCenter', entity, offset);
  }
  /**
   * [0254] getRightUpperArmCenter
   * Lấy tâm cánh tay trên phải.
   */
  public getRightUpperArmCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightUpperArmCenter', entity, offset);
  }
  /**
   * [0255] getLeftUpperArmStart
   * Điểm đầu (khớp vai) và điểm cuối (khớp khuỷu) của cánh tay trên trái.
   */
  public getLeftUpperArmStart(a?: any, b?: any, options?: any): any {
    const sources = this.sourcesOf(a, b, options);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const start = this.jointPosition(context, ['shoulder_l'], this.rawPoint(a), 'getLeftUpperArmPosition', entity);
    const end = this.jointPosition(context, ['elbow_l'], this.rawPoint(b), 'getLeftElbowPosition', entity);
    return namedResult('getLeftUpperArmStart', {
      start,
      end,
      length: distance3D(start, end),
    });
  }
  /**
   * [0256] getRightUpperArmStart
   * Điểm đầu (khớp vai) và điểm cuối (khớp khuỷu) của cánh tay trên phải.
   */
  public getRightUpperArmStart(a?: any, b?: any, options?: any): any {
    const sources = this.sourcesOf(a, b, options);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const start = this.jointPosition(context, ['shoulder_r'], this.rawPoint(a), 'getRightUpperArmPosition', entity);
    const end = this.jointPosition(context, ['elbow_r'], this.rawPoint(b), 'getRightElbowPosition', entity);
    return namedResult('getRightUpperArmStart', {
      start,
      end,
      length: distance3D(start, end),
    });
  }
  /**
   * [0257] getLeftUpperArmEnd
   * Điểm cuối (khớp khuỷu) của cánh tay trên trái.
   */
  public getLeftUpperArmEnd(a?: any, b?: any, options?: any): any {
    const sources = this.sourcesOf(a, b, options);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const end = this.jointPosition(context, ['elbow_l'], this.rawPoint(b), 'getLeftElbowPosition', entity);
    const start = this.jointPosition(context, ['shoulder_l'], this.rawPoint(a), 'getLeftUpperArmPosition', entity);
    return namedResult('getLeftUpperArmEnd', {
      end,
      start,
      length: distance3D(start, end),
    });
  }
  /**
   * [0258] getRightUpperArmEnd
   * Điểm cuối (khớp khuỷu) của cánh tay trên phải.
   */
  public getRightUpperArmEnd(a?: any, b?: any, options?: any): any {
    const sources = this.sourcesOf(a, b, options);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const end = this.jointPosition(context, ['elbow_r'], this.rawPoint(b), 'getRightElbowPosition', entity);
    const start = this.jointPosition(context, ['shoulder_r'], this.rawPoint(a), 'getRightUpperArmPosition', entity);
    return namedResult('getRightUpperArmEnd', {
      end,
      start,
      length: distance3D(start, end),
    });
  }
  /**
   * [0259] calculateUpperArmLength
   * Chiều dài cánh tay trên (BODY_DIMENSIONS.upperArmLength).
   */
  public calculateUpperArmLength(entity?: any, options?: any): any {
    // `entity` là nguồn chiều dài cánh tay trên: đo từ xương vai–khuỷu
    // hoặc khai báo trên entity.
    const source = this.sourceEntity(entity, options);
    const measured = this.upperArmLengthOf(source);
    const declared = this.declaredLength(source, 'upperArmLength', 'upper_arm_length');
    const meters = measured ?? (declared > 0 ? declared : BODY_DIMENSIONS.upperArmLength);
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateUpperArmLength', meters * scaleFactor * factor, unit);
  }
  /**
   * [0260] calculateUpperArmDirection
   * Hướng của cánh tay trên (từ vai xuống khuỷu, theo xoay của entity).
   */
  public calculateUpperArmDirection(a?: any, b?: any): any {
    // `a` = nguồn cánh tay (xương thật), `b` = khung tham chiếu.
    const context = this.boneContext(this.sourcesOf(a));
    const shoulder = this.boneWorldPosition(context, [
      'shoulder_l',
      'shoulder_r',
      'humerus',
      'upperarm',
    ]);
    const elbow = this.boneWorldPosition(context, ['elbow_l', 'elbow_r', 'elbow']);
    const dir =
      shoulder && elbow ? normalize(subtract(elbow, shoulder)) : this.axisOf(a, REST_ARM_AXIS);
    return directionResult('calculateUpperArmDirection', this.intoFrame(dir, b));
  }
  /**
   * [0261] calculateUpperArmOrientation
   * Hướng quay cánh tay trên (quaternion của xương cánh tay, mặc định đơn vị).
   */
  public calculateUpperArmOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['upperarm', 'humerus', 'arm'], options);
    return orientationResult('calculateUpperArmOrientation', q);
  }
  /**
   * [0262] calculateUpperArmAngle
   * Góc nghiêng của cánh tay trên so với mặt phẳng ngang.
   */
  public calculateUpperArmAngle(a?: any, b?: any): any {
    // `b` là khung tham chiếu: góc nghiêng đo theo trục "trên" của `b`.
    const dir = this.axisOf(a, REST_ARM_AXIS);
    const up = this.referenceAxis(b, UP3);
    const value = Math.asin(clamp(-dot(dir, up), -1, 1));
    return measurement('calculateUpperArmAngle', value, 'rad');
  }
  /**
   * [0263] calculateUpperArmVelocity
   * Vận tốc cánh tay trên (đọc entity.velocity, mặc định zero).
   */
  public calculateUpperArmVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateUpperArmVelocity', this.velocityOf(entity), { dt });
  }
  /**
   * [0264] calculateUpperArmAcceleration
   * Gia tốc cánh tay trên (đọc entity.acceleration, mặc định zero).
   */
  public calculateUpperArmAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateUpperArmAcceleration', this.accelerationOf(entity), { dt });
  }
  /**
   * [0265] calculateUpperArmBoundingBox
   * Hộp bao cánh tay trên (kích thước theo BODY_BOX_SIZES.upperArm nếu không truyền).
   */
  public calculateUpperArmBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('upperArm', size));
    return boundsResult('calculateUpperArmBoundingBox', box);
  }
  /**
   * [0266] calculateUpperArmRadius
   * Bán kính cánh tay trên (BODY_DIMENSIONS.upperArmRadius).
   */
  public calculateUpperArmRadius(entity?: any, options?: any): any {
    // `entity` là nguồn bán kính cánh tay trên (khai báo trên entity).
    const source = this.sourceEntity(entity, options);
    const declared = this.declaredLength(source, 'upperArmRadius', 'upper_arm_radius');
    const meters = declared > 0 ? declared : BODY_DIMENSIONS.upperArmRadius;
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateUpperArmRadius', meters * scaleFactor * factor, unit);
  }
  /**
   * [0267] calculateUpperArmVolume
   * Thể tích cánh tay trên (π·r²·L).
   */
  public calculateUpperArmVolume(entity?: any, options?: any): any {
    // `entity` là nguồn kích thướt cánh tay (bán kính + chiều dài).
    const source = this.sourceEntity(entity, options);
    const declaredRadius = this.declaredLength(source, 'upperArmRadius', 'upper_arm_radius');
    const r = declaredRadius > 0 ? declaredRadius : BODY_DIMENSIONS.upperArmRadius;
    const l = this.upperArmLengthOf(source) ?? BODY_DIMENSIONS.upperArmLength;
    const { unit, factor } = this.unitFactor(options, 'm³');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const volume = Math.PI * r * r * l * scaleFactor * scaleFactor * scaleFactor * factor;
    return measurement('calculateUpperArmVolume', volume, unit);
  }
  /**
   * [0268] calculateUpperArmSurfaceArea
   * Diện tích bề mặt cánh tay trên (2πrL + 2πr²).
   */
  public calculateUpperArmSurfaceArea(entity?: any, options?: any): any {
    const source = this.sourceEntity(entity, options);
    const declaredRadius = this.declaredLength(source, 'upperArmRadius', 'upper_arm_radius');
    const r = declaredRadius > 0 ? declaredRadius : BODY_DIMENSIONS.upperArmRadius;
    const l = this.upperArmLengthOf(source) ?? BODY_DIMENSIONS.upperArmLength;
    const { unit, factor } = this.unitFactor(options, 'm²');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const area =
      (2 * Math.PI * r * l + 2 * Math.PI * r * r) * scaleFactor * scaleFactor * factor;
    return measurement('calculateUpperArmSurfaceArea', area, unit);
  }
  /**
   * [0269] calculateUpperArmCenterOfMass
   * Tâm khối lượng cánh tay trên (0,4·L tính từ đầu gần).
   */
  public calculateUpperArmCenterOfMass(entity?: any, options?: any): any {
    // `entity` là nguồn chiều dài cánh tay (tâm khối lượng ở 0,4·L từ đầu gần).
    const source = this.sourceEntity(entity, options);
    const l = this.upperArmLengthOf(source) ?? BODY_DIMENSIONS.upperArmLength;
    const fraction = this.optNumber(options, 0.4, 'fraction');
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const value = l * fraction * scaleFactor * factor;
    return measurement('calculateUpperArmCenterOfMass', value, unit);
  }
  /**
   * [0270] calculateUpperArmToTorsoDistance
   * Khoảng cách từ tâm cánh tay trên tới tâm thân.
   */
  public calculateUpperArmToTorsoDistance(a?: any, b?: any): any {
    // `a` = nguồn cánh tay, `b` = nguồn thân (xương thật hoặc entity).
    const armContext = this.boneContext(this.sourcesOf(a));
    const torsoContext = this.boneContext(this.sourcesOf(b));
    const shoulder = this.boneWorldPosition(armContext, [
      'shoulder_l',
      'shoulder_r',
      'humerus',
      'upperarm',
    ]);
    const elbow = this.boneWorldPosition(armContext, ['elbow_l', 'elbow_r', 'elbow']);
    const arm =
      shoulder && elbow
        ? {
            x: (shoulder.x + elbow.x) / 2,
            y: (shoulder.y + elbow.y) / 2,
            z: (shoulder.z + elbow.z) / 2,
          }
        : this.framePosition('getLeftUpperArmCenter');
    const torso = this.torsoCenterOf(torsoContext) ?? this.framePosition('getTorsoCenter');
    const value = distance3D(arm, torso);
    return measurement('calculateUpperArmToTorsoDistance', value, 'm');
  }
  /**
   * [0271] getLeftElbowPosition
   * Lấy tọa độ khuỷu trái.
   */
  public getLeftElbowPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftElbowPosition', entity, offset);
  }
  /**
   * [0272] getRightElbowPosition
   * Lấy tọa độ khuỷu phải.
   */
  public getRightElbowPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightElbowPosition', entity, offset);
  }
  /**
   * [0273] getLeftElbowCenter
   * Lấy tâm khuỷu trái.
   */
  public getLeftElbowCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftElbowCenter', entity, offset);
  }
  /**
   * [0274] getRightElbowCenter
   * Lấy tâm khuỷu phải.
   */
  public getRightElbowCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightElbowCenter', entity, offset);
  }
  /**
   * [0275] getLeftElbowTip
   * Lấy tọa độ đầu ngoài khuỷu trái.
   */
  public getLeftElbowTip(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftElbowTip', entity, offset);
  }
  /**
   * [0276] getRightElbowTip
   * Lấy tọa độ đầu ngoài khuỷu phải.
   */
  public getRightElbowTip(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightElbowTip', entity, offset);
  }
  /**
   * [0277] calculateElbowToShoulderDistance
   * Khoảng cách khuỷu tới vai.
   */
  public calculateElbowToShoulderDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftElbowPosition', 'getLeftUpperArmPosition');
    return measurement('calculateElbowToShoulderDistance', value, 'm');
  }
  /**
   * [0278] calculateElbowToWristDistance
   * Khoảng cách khuỷu tới cổ tay (chiều dài cánh tay dưới).
   */
  public calculateElbowToWristDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftElbowPosition', 'getLeftWristPosition');
    return measurement('calculateElbowToWristDistance', value, 'm');
  }
  /**
   * [0279] calculateElbowToHandDistance
   * Khoảng cách khuỷu tới bàn tay.
   */
  public calculateElbowToHandDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftElbowPosition', 'getLeftHandPosition');
    return measurement('calculateElbowToHandDistance', value, 'm');
  }
  /**
   * [0280] calculateElbowBendAngle
   * Góc gập của khuỷu (0 = cánh tay thẳng, tính từ vị trí thẳng của xương).
   */
  public calculateElbowBendAngle(a?: any, b?: any): any {
    // `b` là nguồn xương của khuỷu (dùng FK khi có cây xương).
    const { dir1, dir2 } = this.elbowAxes(a, b);
    const interior = Math.acos(clamp(dot(dir1, dir2), -1, 1));
    return measurement('calculateElbowBendAngle', Math.PI - interior, 'rad');
  }
  /**
   * [0281] calculateElbowExtensionAngle
   * Góc duỗi của khuỷu (góc giữa hai xương; π = cánh tay thẳng hoàn toàn).
   */
  public calculateElbowExtensionAngle(a?: any, b?: any): any {
    const { dir1, dir2 } = this.elbowAxes(a, b);
    const interior = Math.acos(clamp(dot(dir1, dir2), -1, 1));
    return measurement('calculateElbowExtensionAngle', interior, 'rad');
  }
  /**
   * [0282] calculateElbowFlexionAngle
   * Góc gập của khuỷu đo từ vị trí duỗi thẳng (bằng góc bậc của bản lề).
   */
  public calculateElbowFlexionAngle(a?: any, b?: any): any {
    const { dir1, dir2 } = this.elbowAxes(a, b);
    const interior = Math.acos(clamp(dot(dir1, dir2), -1, 1));
    return measurement('calculateElbowFlexionAngle', Math.PI - interior, 'rad');
  }
  /**
   * [0283] calculateElbowTwistAngle
   * Góc xoay của cổ tay tay quanh trục cánh tay dưới.
   */
  public calculateElbowTwistAngle(a?: any, b?: any): any {
    // `b` là cơ thể tham chiếu: góc xoay đo tương đối với khung của `b`.
    const e = this.eulerRelativeTo(a, b);
    return measurement('calculateElbowTwistAngle', Math.abs(e.z), 'rad');
  }
  /**
   * [0284] calculateElbowJointAxis
   * Trục bản lề của khuỷu (cross của hướng cánh tay trên và cánh tay dưới).
   */
  public calculateElbowJointAxis(a?: any, b?: any, options?: any): any {
    // `b` = nguồn xương của khuỷu, `options.invert` = đảo chiều trục bản lề.
    const { dir1, dir2 } = this.elbowAxes(a, b);
    const axis = cross(dir1, dir2);
    // Khi cánh tay thẳng, cross = 0 ⇒ trục bản lề là trục ngang (X).
    const resolved = magnitude(axis) > 1e-9 ? normalize(axis) : RIGHT3;
    const flip = this.optBoolean(options, false, 'invert') ? -1 : 1;
    return namedResult('calculateElbowJointAxis', {
      axis: scale(resolved, flip),
      magnitude: magnitude(axis),
    });
  }
  /**
   * [0285] calculateElbowJointNormal
   * Pháp tuyến của mặt phẳng chuyển động của khuỷu.
   *
   * Mặt phẳng khuỷu được dựng từ ba điểm thật: vai – khuỷu – cổ tay. Khi
   * entity có cây xương thì dùng vị trí xương (forward kinematics) để pháp
   * tuyến phản ánh đúng góc gập của khuỷu; nếu không, dùng điểm thô truyền
   * vào rồi tới offset giải phẫu tĩnh.
   */
  public calculateElbowJointNormal(a?: any, b?: any): any {
    const sources = this.sourcesOf(a, b);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const pointA = this.rawPoint(a);
    const pointB = this.rawPoint(b);
    const bothPoints = Boolean(pointA && pointB);

    const shoulder = this.jointPosition(
      context,
      SHOULDER_BONE_NAMES,
      bothPoints ? pointA : undefined,
      'getLeftUpperArmPosition',
      entity,
    );
    const elbow = this.jointPosition(
      context,
      ELBOW_BONE_NAMES,
      bothPoints ? pointB : undefined,
      'getLeftElbowPosition',
      entity,
    );
    const wrist = this.jointPosition(context, WRIST_BONE_NAMES, undefined, 'getLeftWristPosition', entity);

    const upperAxis = normalize(subtract(shoulder, elbow));
    const foreAxis = normalize(subtract(wrist, elbow));
    const normal = cross(upperAxis, foreAxis);
    const resolved = magnitude(normal) > 1e-9 ? normalize(normal) : FORWARD3;
    return directionResult('calculateElbowJointNormal', resolved, {
      shoulder,
      elbow,
      wrist,
      bendAngle: Math.acos(clamp(dot(upperAxis, foreAxis), -1, 1)),
    });
  }
  /**
   * [0286] calculateElbowVelocity
   * Vận tốc khuỷu (đọc entity.velocity, mặc định zero).
   */
  public calculateElbowVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateElbowVelocity', this.velocityOf(entity), { dt });
  }
  /**
   * [0287] calculateElbowAcceleration
   * Gia tốc khuỷu (đọc entity.acceleration, mặc định zero).
   */
  public calculateElbowAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateElbowAcceleration', this.accelerationOf(entity), { dt });
  }
  /**
   * [0288] calculateElbowBoundingBox
   * Hộp bao khuỷu (kích thước theo BODY_BOX_SIZES.elbow nếu không truyền).
   */
  public calculateElbowBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('elbow', size));
    return boundsResult('calculateElbowBoundingBox', box);
  }
  /**
   * [0289] calculateElbowBoundingSphere
   * Hình cầu bao khuỷu (bán kính = nửa đường chéo hộp khuỷu nếu không truyền).
   */
  public calculateElbowBoundingSphere(entity?: any, radius = 1.0): any {
    const given = arguments.length >= 2 && Number.isFinite(radius);
    const r = given ? Math.max(0, radius) : halfDiagonal(BODY_BOX_SIZES.elbow);
    return {
      name: 'calculateElbowBoundingSphere',
      valid: true,
      center: entityPosition(entity),
      radius: r,
      timestamp: Date.now(),
    };
  }
  /**
   * [0290] calculateElbowSymmetry
   * Độ đối xứng của hai khuỷu (1 = hoàn hảo).
   */
  public calculateElbowSymmetry(a?: any, b?: any, options?: any): any {
    // `a` = nguồn khuỷu trái, `b` = nguồn khuỷu phải.
    const context = this.boneContext(this.sourcesOf(a, b, options));
    const left =
      this.boneWorldPosition(context, ['elbow_l']) ??
      this.rawPoint(a) ??
      this.framePosition('getLeftElbowPosition');
    const right =
      this.boneWorldPosition(context, ['elbow_r']) ??
      this.rawPoint(b) ??
      this.framePosition('getRightElbowPosition');
    const scaleRef = this.optNumber(options, BODY_DIMENSIONS.shoulderWidth, 'reference');
    const raw = this.symmetryOf(left, right, scaleRef);
    const symmetry = this.optBoolean(options, false, 'invert') ? 1 - raw : raw;
    return namedResult('calculateElbowSymmetry', { symmetry, left, right });
  }
  /**
   * [0291] calculateArmReachDistance
   * Khoảng cách với tới được từ vai tới bàn tay.
   */
  public calculateArmReachDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftUpperArmPosition', 'getLeftHandPosition');
    return measurement('calculateArmReachDistance', value, 'm');
  }
  /**
   * [0292] calculateArmReachDirection
   * Hướng với tới được (từ vai về phía bàn tay).
   *
   * Dùng vị trí xương thật (vai + bàn tay) khi entity có cây xương, nếu không
   * thì dùng điểm thô truyền vào rồi tới offset giải phẫu tĩnh.
   */
  public calculateArmReachDirection(a?: any, b?: any): any {
    const sources = this.sourcesOf(a, b);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const pointA = this.rawPoint(a);
    const pointB = this.rawPoint(b);
    const bothPoints = Boolean(pointA && pointB);

    const shoulder = this.jointPosition(
      context,
      SHOULDER_BONE_NAMES,
      bothPoints ? pointA : undefined,
      'getLeftUpperArmPosition',
      entity,
    );
    const hand = this.jointPosition(
      context,
      HAND_BONE_NAMES,
      bothPoints ? pointB : undefined,
      'getLeftHandPosition',
      entity,
    );
    const direction = normalize(subtract(hand, shoulder));
    return directionResult('calculateArmReachDirection', direction, {
      shoulder,
      hand,
      reach: distance3D(hand, shoulder),
    });
  }
  /**
   * [0293] calculateArmReachEnvelope
   * Vùng với tới được của cánh tay (hình cầu quanh khớp vai).
   */
  public calculateArmReachEnvelope(a?: any, b?: any, options?: any): any {
    // `options` = scale (nhân bán kính) + unit (đơn vị của cả vùng với tới).
    const base = this.landmarkDistance(a, b, 'getLeftUpperArmPosition', 'getLeftHandPosition');
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const radius = base * scaleFactor * factor;
    const center = scale(this.framePosition('getLeftUpperArmPosition'), factor);
    return namedResult('calculateArmReachEnvelope', {
      center,
      radius,
      min: { x: center.x - radius, y: center.y - radius, z: center.z - radius },
      max: { x: center.x + radius, y: center.y + radius, z: center.z + radius },
    });
  }
  /**
   * [0294] calculateArmSweepAngle
   * Góc quét của cánh tay (góc giữa hướng hiện tại và hướng đích).
   */
  public calculateArmSweepAngle(a?: any, b?: any): any {
    // `a` = nguồn cánh tay (xương thật), `b` = điểm đích.
    const context = this.boneContext(this.sourcesOf(a));
    const shoulder = this.segmentPosition(
      context,
      SHOULDER_BONE_NAMES,
      this.rawPoint(a),
      'getLeftUpperArmPosition',
    );
    const hand = this.segmentPosition(context, HAND_BONE_NAMES, undefined, 'getLeftHandPosition');
    const current = normalize(subtract(hand, shoulder));
    if (isPointLike(b)) {
      const target = normalize(subtract(asPoint(b), shoulder));
      const value = Math.acos(clamp(dot(current, target), -1, 1));
      return measurement('calculateArmSweepAngle', value, 'rad');
    }
    const value = Math.acos(clamp(dot(current, REST_ARM_AXIS), -1, 1));
    return measurement('calculateArmSweepAngle', value, 'rad');
  }
  /**
   * [0295] calculateArmSwingAmplitude
   * Biên độ đung đưa của cánh tay (góc lệch cực đại so với tư thế chuẩn).
   */
  public calculateArmSwingAmplitude(entity?: any, options?: any): any {
    const dir = this.axisOf(entity, REST_ARM_AXIS);
    const value = Math.acos(clamp(dot(dir, REST_ARM_AXIS), -1, 1));
    const { unit, factor } = this.angleUnitFactor(options);
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateArmSwingAmplitude', value * scaleFactor * factor, unit);
  }
  /**
   * [0296] calculateArmPoseError
   * Sai lệch tư thế cánh tay so với tư thế đích (vị trí + hướng).
   */
  public calculateArmPoseError(a?: any, b?: any, options?: any): any {
    const positionError = isPointLike(a) && isPointLike(b)
      ? distance3D(asPoint(a), asPoint(b))
      : 0;
    const qa = readQuaternion(a);
    const qb = readQuaternion(b);
    const orientationError = qa && qb
      ? Math.acos(clamp(Math.abs(dot(qa, qb)), -1, 1))
      : 0;
    // `options.mode` chọn thành phần sai lệch cần đo.
    const mode = this.optString(options, 'total', 'mode');
    const raw =
      mode === 'position'
        ? positionError
        : mode === 'orientation'
          ? orientationError
          : positionError + orientationError;
    const total = raw * this.optNumber(options, 1, 'scale');
    return namedResult('calculateArmPoseError', {
      positionError,
      orientationError,
      total,
    });
  }
  /**
   * [0297] calculateArmSegmentAlignment
   * Mức độ thẳng của chuỗi cánh tay (vai → khuỷu → cổ tay → bàn tay).
   */
  public calculateArmSegmentAlignment(a?: any, b?: any, options?: any): any {
    // `a`/`b` = nguồn cánh tay (xương thật).
    const context = this.boneContext(this.sourcesOf(a, b, options));
    const shoulder =
      this.boneWorldPosition(context, SHOULDER_BONE_NAMES) ??
      this.framePosition('getLeftUpperArmPosition');
    const elbow =
      this.boneWorldPosition(context, ELBOW_BONE_NAMES) ??
      this.framePosition('getLeftElbowPosition');
    const wrist =
      this.boneWorldPosition(context, WRIST_BONE_NAMES) ??
      this.framePosition('getLeftWristPosition');
    const hand =
      this.boneWorldPosition(context, HAND_BONE_NAMES) ??
      this.framePosition('getLeftHandPosition');
    const d1 = normalize(subtract(shoulder, elbow));
    const d2 = normalize(subtract(wrist, elbow));
    const d3 = normalize(subtract(hand, wrist));
    const a1 = Math.acos(clamp(dot(d1, d2), -1, 1));
    const a2 = Math.acos(clamp(dot(d2, d3), -1, 1));
    const mean = (a1 + a2) / 2;
    const alignment = clamp01(1 - mean / Math.PI);
    return namedResult('calculateArmSegmentAlignment', {
      alignment: this.optBoolean(options, false, 'invert') ? 1 - alignment : alignment,
      angles: [a1, a2],
      mean,
    });
  }
  /**
   * [0298] calculateArmJointChainLength
   * Tổng chiều dài chuỗi khớp cánh tay (vai → khuỷu → cổ tay → lòng bàn tay).
   */
  public calculateArmJointChainLength(entity?: any, options?: any): any {
    // `entity` là nguồn chuỗi khớp: đo vai → khuỷu → cổ tay → lòng bàn tay.
    const source = this.sourceEntity(entity, options);
    const measured = this.armChainLengthOf(source);
    const value =
      measured ??
      BODY_DIMENSIONS.upperArmLength +
        BODY_DIMENSIONS.forearmLength +
        BODY_DIMENSIONS.palmLength;
    const { unit, factor } = this.unitFactor(options, 'm');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    return measurement('calculateArmJointChainLength', value * scaleFactor * factor, unit);
  }
  /**
   * [0299] calculateArmEndEffectorPosition
   * Vị trí điểm cuối hiệu ứng (bàn tay) và điểm chạm ngón tay.
   */
  public calculateArmEndEffectorPosition(a?: any, b?: any, options?: any): any {
    // `b` = nguồn bàn tay (xương thật), `options.scale` = độ dài ngón tay.
    const context = this.boneContext(this.sourcesOf(a, b));
    const hand = this.segmentPosition(
      context,
      HAND_BONE_NAMES,
      this.rawPoint(b),
      'getLeftHandPosition',
    );
    const forward = this.axisOf(a, REST_ARM_AXIS);
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const tip = add(hand, scale(forward, (BODY_DIMENSIONS.handLength / 2) * scaleFactor));
    return namedResult('calculateArmEndEffectorPosition', {
      position: hand,
      tip,
      forward,
    });
  }
  /**
   * [0300] calculateArmInverseKinematics
   * Giải bài toán động học ngược hai khớp (vai + khuỷu) tới vị trí đích.
   */
  public calculateArmInverseKinematics(a?: any, b?: any, options?: any): any {
    // `a` = nguồn cánh tay (xương thật), `options.scale` = tỉ lệ độ dài xương.
    const context = this.boneContext(this.sourcesOf(a));
    const shoulder = this.segmentPosition(
      context,
      SHOULDER_BONE_NAMES,
      undefined,
      'getLeftUpperArmPosition',
    );
    const target = isPointLike(b) ? asPoint(b) : this.framePosition('getLeftHandPosition');
    const scaleFactor = this.optNumber(options, 1, 'scale');
    const l1 = BODY_DIMENSIONS.upperArmLength * scaleFactor;
    const l2 = BODY_DIMENSIONS.forearmLength * scaleFactor;
    const d = Math.min(distance3D(shoulder, target), l1 + l2 - 1e-6);
    const reachable = distance3D(shoulder, target) <= l1 + l2;
    const elbowInterior = Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
    const shoulderAngle = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    return namedResult('calculateArmInverseKinematics', {
      shoulderAngle,
      elbowAngle: Math.PI - elbowInterior,
      reachable,
      target,
      distance: d,
    });
  }

  // ==========================================================================
  // 7. Tọa độ cánh tay và cổ tay
  // ==========================================================================

  /**
   * [0301] getLeftForearmPosition
   * Lấy tọa độ cánh tay dưới trái.
   */
  public getLeftForearmPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftForearmPosition', entity, offset);
  }
  /**
   * [0302] getRightForearmPosition
   * Lấy tọa độ cánh tay dưới phải.
   */
  public getRightForearmPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightForearmPosition', entity, offset);
  }
  /**
   * [0303] getLeftForearmCenter
   * Lấy tâm cánh tay dưới trái.
   */
  public getLeftForearmCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftForearmCenter', entity, offset);
  }
  /**
   * [0304] getRightForearmCenter
   * Lấy tâm cánh tay dưới phải.
   */
  public getRightForearmCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightForearmCenter', entity, offset);
  }
  /**
   * [0305] getLeftForearmStart
   * Điểm đầu (khuỷu) và điểm cuối (cổ tay) của cánh tay dưới trái.
   */
  public getLeftForearmStart(a?: any, b?: any, options?: any): any {
    const start = this.framePosition('getLeftElbowPosition');
    const end = this.framePosition('getLeftWristPosition');
    return namedResult('getLeftForearmStart', {
      start,
      end,
      length: distance3D(start, end),
    });
  }
  /**
   * [0306] getRightForearmStart
   * Điểm đầu (khuỷu) và điểm cuối (cổ tay) của cánh tay dưới phải.
   */
  public getRightForearmStart(a?: any, b?: any, options?: any): any {
    const start = this.framePosition('getRightElbowPosition');
    const end = this.framePosition('getRightWristPosition');
    return namedResult('getRightForearmStart', {
      start,
      end,
      length: distance3D(start, end),
    });
  }
  /**
   * [0307] getLeftForearmEnd
   * Điểm cuối (cổ tay) của cánh tay dưới trái.
   */
  public getLeftForearmEnd(a?: any, b?: any, options?: any): any {
    const end = this.framePosition('getLeftWristPosition');
    const start = this.framePosition('getLeftElbowPosition');
    return namedResult('getLeftForearmEnd', {
      end,
      start,
      length: distance3D(start, end),
    });
  }
  /**
   * [0308] getRightForearmEnd
   * Điểm cuối (cổ tay) của cánh tay dưới phải.
   */
  public getRightForearmEnd(a?: any, b?: any, options?: any): any {
    const end = this.framePosition('getRightWristPosition');
    const start = this.framePosition('getRightElbowPosition');
    return namedResult('getRightForearmEnd', {
      end,
      start,
      length: distance3D(start, end),
    });
  }
  /**
   * [0309] calculateForearmLength
   * Chiều dài cánh tay dưới (BODY_DIMENSIONS.forearmLength).
   */
  public calculateForearmLength(entity?: any, options?: any): any {
    return measurement('calculateForearmLength', BODY_DIMENSIONS.forearmLength, 'm');
  }
  /**
   * [0310] calculateForearmDirection
   * Hướng của cánh tay dưới (từ khuỷu xuống cổ tay).
   */
  public calculateForearmDirection(a?: any, b?: any): any {
    const elbow = this.framePosition('getLeftElbowPosition');
    const center = this.framePosition('getLeftForearmCenter');
    const dir = normalize(subtract(this.frameRotated(a, center, elbow), elbow));
    return directionResult('calculateForearmDirection', dir);
  }
  /**
   * [0311] calculateForearmOrientation
   * Hướng quay cánh tay dưới (quaternion của xương, mặc định đơn vị).
   */
  public calculateForearmOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['forearm', 'radius', 'ulna'], options);
    return orientationResult('calculateForearmOrientation', q);
  }
  /**
   * [0312] calculateForearmAngle
   * Góc nghiêng của cánh tay dưới so với mặt phẳng ngang.
   */
  public calculateForearmAngle(a?: any, b?: any): any {
    const elbow = this.framePosition('getLeftElbowPosition');
    const wrist = this.framePosition('getLeftWristPosition');
    const dir = normalize(subtract(this.frameRotated(a, wrist, elbow), elbow));
    const value = Math.asin(clamp(-dir.y, -1, 1));
    return measurement('calculateForearmAngle', value, 'rad');
  }
  /**
   * [0313] calculateForearmVelocity
   * Vận tốc cánh tay dưới (đọc entity.velocity, mặc định zero).
   */
  public calculateForearmVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateForearmVelocity', this.velocityOf(entity), { dt });
  }
  /**
   * [0314] calculateForearmAcceleration
   * Gia tốc cánh tay dưới (đọc entity.acceleration, mặc định zero).
   */
  public calculateForearmAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateForearmAcceleration', this.accelerationOf(entity), { dt });
  }
  /**
   * [0315] calculateForearmBoundingBox
   * Hộp bao cánh tay dưới (kích thước theo BODY_BOX_SIZES.forearm nếu không truyền).
   */
  public calculateForearmBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('forearm', size));
    return boundsResult('calculateForearmBoundingBox', box);
  }
  /**
   * [0316] calculateForearmRadius
   * Bán kính cánh tay dưới (BODY_DIMENSIONS.forearmRadius).
   */
  public calculateForearmRadius(entity?: any, options?: any): any {
    return measurement('calculateForearmRadius', BODY_DIMENSIONS.forearmRadius, 'm');
  }
  /**
   * [0317] calculateForearmVolume
   * Thể tích cánh tay dưới (π·r²·L).
   */
  public calculateForearmVolume(entity?: any, options?: any): any {
    const r = BODY_DIMENSIONS.forearmRadius;
    const l = BODY_DIMENSIONS.forearmLength;
    return measurement('calculateForearmVolume', Math.PI * r * r * l, 'm³');
  }
  /**
   * [0318] calculateForearmSurfaceArea
   * Diện tích bề mặt cánh tay dưới (2πrL + 2πr²).
   */
  public calculateForearmSurfaceArea(entity?: any, options?: any): any {
    const r = BODY_DIMENSIONS.forearmRadius;
    const l = BODY_DIMENSIONS.forearmLength;
    return measurement('calculateForearmSurfaceArea', 2 * Math.PI * r * l + 2 * Math.PI * r * r, 'm²');
  }
  /**
   * [0319] calculateForearmCenterOfMass
   * Tâm khối lượng cánh tay dưới (0,4·L tính từ đầu gần).
   */
  public calculateForearmCenterOfMass(entity?: any, options?: any): any {
    const value = BODY_DIMENSIONS.forearmLength * 0.4;
    return measurement('calculateForearmCenterOfMass', value, 'm');
  }
  /**
   * [0320] calculateForearmTwist
   * Độ xoay dọc của cánh tay dưới quanh trục của nó.
   */
  public calculateForearmTwist(a?: any, b?: any): any {
    const twist = this.twistAboutAxis(a, REST_ARM_AXIS);
    return measurement('calculateForearmTwist', twist, 'rad');
  }
  /**
   * [0321] getLeftWristPosition
   * Lấy tọa độ cổ tay trái.
   */
  public getLeftWristPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftWristPosition', entity, offset);
  }
  /**
   * [0322] getRightWristPosition
   * Lấy tọa độ cổ tay phải.
   */
  public getRightWristPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightWristPosition', entity, offset);
  }
  /**
   * [0323] getLeftWristCenter
   * Lấy tâm cổ tay trái.
   */
  public getLeftWristCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftWristCenter', entity, offset);
  }
  /**
   * [0324] getRightWristCenter
   * Lấy tâm cổ tay phải.
   */
  public getRightWristCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightWristCenter', entity, offset);
  }
  /**
   * [0325] getLeftWristJointPosition
   * Lấy tọa độ khớp cổ tay trái.
   */
  public getLeftWristJointPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftWristJointPosition', entity, offset);
  }
  /**
   * [0326] getRightWristJointPosition
   * Lấy tọa độ khớp cổ tay phải.
   */
  public getRightWristJointPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightWristJointPosition', entity, offset);
  }
  /**
   * [0327] getLeftWristFrontPosition
   * Lấy tọa độ mặt trước cổ tay trái.
   */
  public getLeftWristFrontPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftWristFrontPosition', entity, offset);
  }
  /**
   * [0328] getRightWristFrontPosition
   * Lấy tọa độ mặt trước cổ tay phải.
   */
  public getRightWristFrontPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightWristFrontPosition', entity, offset);
  }
  /**
   * [0329] getLeftWristBackPosition
   * Lấy tọa độ mặt sau cổ tay trái.
   */
  public getLeftWristBackPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftWristBackPosition', entity, offset);
  }
  /**
   * [0330] getRightWristBackPosition
   * Lấy tọa độ mặt sau cổ tay phải.
   */
  public getRightWristBackPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightWristBackPosition', entity, offset);
  }
  /**
   * [0331] calculateWristToElbowDistance
   * Khoảng cách cổ tay tới khuỷu.
   */
  public calculateWristToElbowDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftWristPosition', 'getLeftElbowPosition');
    return measurement('calculateWristToElbowDistance', value, 'm');
  }
  /**
   * [0332] calculateWristToPalmDistance
   * Khoảng cách cổ tay tới tâm lòng bàn tay (nửa chiều dài bàn tay).
   */
  public calculateWristToPalmDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getLeftWristPosition', 'getPalmCenter');
    return measurement('calculateWristToPalmDistance', value, 'm');
  }
  /**
   * [0333] calculateWristWidth
   * Chiều rộng cổ tay (BODY_DIMENSIONS.wristWidth).
   */
  public calculateWristWidth(entity?: any, options?: any): any {
    return measurement('calculateWristWidth', BODY_DIMENSIONS.wristWidth, 'm');
  }
  /**
   * [0334] calculateWristThickness
   * Độ dày cổ tay (BODY_DIMENSIONS.wristThickness).
   */
  public calculateWristThickness(a?: any, b?: any, options?: any): any {
    const width = this.framePosition('getLeftWristFrontPosition');
    const back = this.framePosition('getLeftWristBackPosition');
    const thickness = Math.abs(width.z - back.z) || BODY_DIMENSIONS.wristThickness;
    return namedResult('calculateWristThickness', {
      thickness,
      width: BODY_DIMENSIONS.wristWidth,
      front: width,
      back,
    });
  }
  /**
   * [0335] calculateWristFlexion
   * Góc gập cổ tay (thành phần cúi về phía trước của khớp cổ tay).
   */
  public calculateWristFlexion(a?: any, b?: any): any {
    const e = this.eulerOf(a);
    return measurement('calculateWristFlexion', Math.max(0, e.x), 'rad');
  }
  /**
   * [0336] calculateWristExtension
   * Góc duỗi cổ tay (thành phần ngược lại với gập).
   */
  public calculateWristExtension(a?: any, b?: any): any {
    const e = this.eulerOf(a);
    return measurement('calculateWristExtension', Math.max(0, -e.x), 'rad');
  }
  /**
   * [0337] calculateWristAbduction
   * Góc nghiêng cổ tay ra ngoài (thành phần xoay).
   */
  public calculateWristAbduction(a?: any, b?: any): any {
    const e = this.eulerOf(a);
    return measurement('calculateWristAbduction', Math.max(0, e.z), 'rad');
  }
  /**
   * [0338] calculateWristAdduction
   * Góc nghiêng cổ tay vào trong (thành phần xoay ngược lại).
   */
  public calculateWristAdduction(a?: any, b?: any): any {
    const e = this.eulerOf(a);
    return measurement('calculateWristAdduction', Math.max(0, -e.z), 'rad');
  }
  /**
   * [0339] calculateWristPronation
   * Góc sấp cổ tay (xoay cánh tay theo chiều ngược).
   */
  public calculateWristPronation(a?: any, b?: any): any {
    const twist = this.twistAboutAxis(a, REST_ARM_AXIS);
    return measurement('calculateWristPronation', Math.max(0, -twist), 'rad');
  }
  /**
   * [0340] calculateWristSupination
   * Góc ngửa cổ tay (xoay cánh tay theo chiều thuận).
   */
  public calculateWristSupination(a?: any, b?: any): any {
    const twist = this.twistAboutAxis(a, REST_ARM_AXIS);
    return measurement('calculateWristSupination', Math.max(0, twist), 'rad');
  }
  /**
   * [0341] calculateWristJointAxis
   * Trục bản lề của cổ tay (cross của trục cánh tay dưới và pháp tuyến lòng bàn tay).
   *
   * Trục cánh tay dưới và pháp tuyến lòng bàn tay đều lấy từ xương thật
   * (khuỷu – cổ tay – bàn tay) khi entity có cây xương.
   */
  public calculateWristJointAxis(a?: any, b?: any, options?: any): any {
    const sources = this.sourcesOf(a, b, options);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const pointA = this.rawPoint(a);
    const pointB = this.rawPoint(b);
    const bothPoints = Boolean(pointA && pointB);

    const elbow = this.jointPosition(
      context,
      ELBOW_BONE_NAMES,
      bothPoints ? pointA : undefined,
      'getLeftElbowPosition',
      entity,
    );
    const wrist = this.jointPosition(
      context,
      WRIST_BONE_NAMES,
      bothPoints ? pointB : undefined,
      'getLeftWristPosition',
      entity,
    );
    const hand = this.jointPosition(context, HAND_BONE_NAMES, undefined, 'getLeftHandPosition', entity);

    const forearm = normalize(subtract(wrist, elbow));
    const palm = this.palmNormalOf(wrist, hand, entity);
    const axis = cross(forearm, palm);
    const resolved = magnitude(axis) > 1e-9 ? normalize(axis) : RIGHT3;
    return namedResult('calculateWristJointAxis', {
      axis: resolved,
      magnitude: magnitude(axis),
      forearm,
      palmNormal: palm,
      elbow,
      wrist,
    });
  }
  /**
   * [0342] calculateWristJointNormal
   * Pháp tuyến của mặt phẳng khớp cổ tay.
   *
   * Dùng cùng nguồn dữ liệu với `calculateWristJointAxis`: xương thật
   * (khuỷu – cổ tay – bàn tay) → điểm thô truyền vào → offset giải phẫu tĩnh.
   */
  public calculateWristJointNormal(a?: any, b?: any): any {
    const sources = this.sourcesOf(a, b);
    const context = this.boneContext(sources);
    const entity = this.entityOf(sources);
    const pointA = this.rawPoint(a);
    const pointB = this.rawPoint(b);
    const bothPoints = Boolean(pointA && pointB);

    const elbow = this.jointPosition(
      context,
      ELBOW_BONE_NAMES,
      bothPoints ? pointA : undefined,
      'getLeftElbowPosition',
      entity,
    );
    const wrist = this.jointPosition(
      context,
      WRIST_BONE_NAMES,
      bothPoints ? pointB : undefined,
      'getLeftWristPosition',
      entity,
    );
    const hand = this.jointPosition(context, HAND_BONE_NAMES, undefined, 'getLeftHandPosition', entity);

    const forearm = normalize(subtract(wrist, elbow));
    const palm = this.palmNormalOf(wrist, hand, entity);
    const normal = cross(forearm, palm);
    const resolved = magnitude(normal) > 1e-9 ? normalize(normal) : FORWARD3;
    return directionResult('calculateWristJointNormal', resolved, {
      forearm,
      palmNormal: palm,
      elbow,
      wrist,
      hand,
    });
  }
  /**
   * [0343] calculateWristVelocity
   * Vận tốc cổ tay (đọc entity.velocity, mặc định zero).
   */
  public calculateWristVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateWristVelocity', this.velocityOf(entity), { dt });
  }
  /**
   * [0344] calculateWristAcceleration
   * Gia tốc cổ tay (đọc entity.acceleration, mặc định zero).
   */
  public calculateWristAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateWristAcceleration', this.accelerationOf(entity), { dt });
  }
  /**
   * [0345] calculateWristBoundingBox
   * Hộp bao cổ tay (kích thước theo BODY_BOX_SIZES.wrist nếu không truyền).
   */
  public calculateWristBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('wrist', size));
    return boundsResult('calculateWristBoundingBox', box);
  }
  /**
   * [0346] calculateWristBoundingSphere
   * Hình cầu bao cổ tay (bán kính = nửa đường chéo hộp cổ tay nếu không truyền).
   */
  public calculateWristBoundingSphere(entity?: any, radius = 1.0): any {
    const given = arguments.length >= 2 && Number.isFinite(radius);
    const r = given ? Math.max(0, radius) : halfDiagonal(BODY_BOX_SIZES.wrist);
    return {
      name: 'calculateWristBoundingSphere',
      valid: true,
      center: entityPosition(entity),
      radius: r,
      timestamp: Date.now(),
    };
  }
  /**
   * [0347] calculateWristTrajectory
   * Quỹ đạo cổ tay (đoạn khuỷu → cổ tay nếu entity không có đường đi).
   */
  public calculateWristTrajectory(a?: any, b?: any, options?: any): any {
    const start = this.framePosition('getLeftElbowPosition');
    const end = this.framePosition('getLeftWristPosition');
    const points = this.trajectoryPoints(a, start, end);
    return namedResult('calculateWristTrajectory', {
      points,
      start: points[0],
      end: points[points.length - 1],
      length: this.pathLengthOf(points),
    });
  }
  /**
   * [0348] calculateWristMotionSmoothness
   * Độ mượt chuyển động cổ tay (1 = rất mượt, 0 = giật mạnh).
   */
  public calculateWristMotionSmoothness(a?: any, b?: any, options?: any): any {
    const dt = 1 / 60;
    const acceleration = magnitude(this.accelerationOf(a));
    const reference = BODY_DIMENSIONS.forearmLength || 1;
    const smoothness = clamp01(1 - (acceleration * dt) / reference);
    return namedResult('calculateWristMotionSmoothness', {
      smoothness,
      acceleration,
    });
  }
  /**
   * [0349] calculateWristPoseError
   * Sai lệch tư thế cổ tay so với tư thế đích.
   */
  public calculateWristPoseError(a?: any, b?: any, options?: any): any {
    const positionError = isPointLike(a) && isPointLike(b)
      ? distance3D(asPoint(a), asPoint(b))
      : 0;
    const qa = readQuaternion(a);
    const qb = readQuaternion(b);
    const orientationError = qa && qb
      ? Math.acos(clamp(Math.abs(dot(qa, qb)), -1, 1))
      : 0;
    return namedResult('calculateWristPoseError', {
      positionError,
      orientationError,
      total: positionError + orientationError,
    });
  }
  /**
   * [0350] calculateWristTargetOffset
   * Độ lệch của cổ tay so với mục tiêu.
   */
  public calculateWristTargetOffset(a?: any, b?: any, options?: any): any {
    const current = isPointLike(a) ? asPoint(a) : this.framePosition('getLeftWristPosition');
    const target = isPointLike(b) ? asPoint(b) : current;
    const offset = subtract(target, current);
    return namedResult('calculateWristTargetOffset', {
      offset,
      distance: magnitude(offset),
      current,
      target,
    });
  }

  // ==========================================================================
  // 8. Tọa độ bàn tay và lòng bàn tay
  // ==========================================================================

  /**
   * [0351] getLeftHandPosition
   * Lấy tọa độ bàn tay trái.
   */
  public getLeftHandPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftHandPosition', entity, offset);
  }
  /**
   * [0352] getRightHandPosition
   * Lấy tọa độ bàn tay phải.
   */
  public getRightHandPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightHandPosition', entity, offset);
  }
  /**
   * [0353] getLeftHandCenter
   * Lấy tâm bàn tay trái.
   */
  public getLeftHandCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getLeftHandCenter', entity, offset);
  }
  /**
   * [0354] getRightHandCenter
   * Lấy tâm bàn tay phải.
   */
  public getRightHandCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getRightHandCenter', entity, offset);
  }
  /**
   * [0355] getPalmCenter
   * Lấy tâm lòng bàn tay.
   */
  public getPalmCenter(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getPalmCenter', entity, offset);
  }
  /**
   * [0356] getPalmBasePosition
   * Lấy tọa độ gốc lòng bàn tay.
   */
  public getPalmBasePosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getPalmBasePosition', entity, offset);
  }
  /**
   * [0357] getPalmTopPosition
   * Lấy tọa độ đầu lòng bàn tay.
   */
  public getPalmTopPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getPalmTopPosition', entity, offset);
  }
  /**
   * [0358] getPalmLeftEdge
   * Lấy tọa độ mép trái lòng bàn tay.
   */
  public getPalmLeftEdge(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getPalmLeftEdge', entity, offset);
  }
  /**
   * [0359] getPalmRightEdge
   * Lấy tọa độ mép phải lòng bàn tay.
   */
  public getPalmRightEdge(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getPalmRightEdge', entity, offset);
  }
  /**
   * [0360] getPalmFrontPosition
   * Lấy tọa độ mặt trước lòng bàn tay.
   */
  public getPalmFrontPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getPalmFrontPosition', entity, offset);
  }
  /**
   * [0361] getPalmBackPosition
   * Lấy tọa độ mặt sau lòng bàn tay.
   */
  public getPalmBackPosition(entity?: any, offset?: Vec3D): any {
    return this.landmarkPosition('getPalmBackPosition', entity, offset);
  }
  /**
   * [0362] getPalmNormal
   * Pháp tuyến mặt phẳng lòng bàn tay.
   */
  public getPalmNormal(a?: any, b?: any): any {
    return directionResult('getPalmNormal', this.palmNormal(a));
  }
  /**
   * [0363] getPalmForwardVector
   * Hướng phía trước của lòng bàn tay (hướng các ngón tay).
   */
  public getPalmForwardVector(a?: any, b?: any): any {
    return directionResult('getPalmForwardVector', this.palmForward(a));
  }
  /**
   * [0364] getPalmUpVector
   * Hướng phía trên của lòng bàn tay.
   */
  public getPalmUpVector(a?: any, b?: any): any {
    return directionResult('getPalmUpVector', this.palmUp(a));
  }
  /**
   * [0365] getPalmRightVector
   * Hướng bên phải của lòng bàn tay.
   */
  public getPalmRightVector(a?: any, b?: any): any {
    return directionResult('getPalmRightVector', this.palmRight(a));
  }
  /**
   * [0366] calculatePalmWidth
   * Chiều rộng lòng bàn tay (BODY_DIMENSIONS.palmWidth).
   */
  public calculatePalmWidth(entity?: any, options?: any): any {
    return measurement('calculatePalmWidth', BODY_DIMENSIONS.palmWidth, 'm');
  }
  /**
   * [0367] calculatePalmLength
   * Chiều dài lòng bàn tay (BODY_DIMENSIONS.palmLength).
   */
  public calculatePalmLength(entity?: any, options?: any): any {
    return measurement('calculatePalmLength', BODY_DIMENSIONS.palmLength, 'm');
  }
  /**
   * [0368] calculatePalmThickness
   * Độ dày lòng bàn tay (BODY_DIMENSIONS.palmThickness).
   */
  public calculatePalmThickness(a?: any, b?: any, options?: any): any {
    return namedResult('calculatePalmThickness', {
      thickness: BODY_DIMENSIONS.palmThickness,
      width: BODY_DIMENSIONS.palmWidth,
      length: BODY_DIMENSIONS.palmLength,
    });
  }
  /**
   * [0369] calculatePalmArea
   * Diện tích mặt lòng bàn tay (rộng × dài).
   */
  public calculatePalmArea(entity?: any, options?: any): any {
    const area = BODY_DIMENSIONS.palmWidth * BODY_DIMENSIONS.palmLength;
    return measurement('calculatePalmArea', area, 'm²');
  }
  /**
   * [0370] calculatePalmVolume
   * Thể tích lòng bàn tay (rộng × dài × dày).
   */
  public calculatePalmVolume(entity?: any, options?: any): any {
    const volume =
      BODY_DIMENSIONS.palmWidth *
      BODY_DIMENSIONS.palmLength *
      BODY_DIMENSIONS.palmThickness;
    return measurement('calculatePalmVolume', volume, 'm³');
  }
  /**
   * [0371] calculatePalmOrientation
   * Hướng quay lòng bàn tay (quaternion của xương bàn tay, mặc định đơn vị).
   */
  public calculatePalmOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['palm', 'hand', 'wrist'], options);
    return orientationResult('calculatePalmOrientation', q);
  }
  /**
   * [0372] calculatePalmRotation
   * Góc quay lòng bàn tay so với cánh tay dưới.
   */
  public calculatePalmRotation(entityOrAngle?: any, options?: any): any {
    const palm = this.orientationOf(entityOrAngle, ['palm', 'hand'], options);
    const forearm = this.orientationOf(entityOrAngle, ['forearm', 'radius'], options);
    const relative = multiplyQuaternions(palm, invertQuaternion(forearm));
    return orientationResult('calculatePalmRotation', relative);
  }
  /**
   * [0373] calculatePalmTilt
   * Độ nghiêng của lòng bàn tay so với hướng phía trước.
   */
  public calculatePalmTilt(a?: any, b?: any): any {
    const normal = this.palmNormal(a);
    const value = Math.acos(clamp(dot(normal, FORWARD3), -1, 1));
    return measurement('calculatePalmTilt', value, 'rad');
  }
  /**
   * [0374] calculatePalmCurvature
   * Độ cong dọc của lòng bàn tay (góc nghiêng / chiều dài bàn tay).
   */
  public calculatePalmCurvature(entity?: any, options?: any): any {
    const tilt = Math.acos(clamp(dot(this.palmNormal(entity), FORWARD3), -1, 1));
    const curvature = BODY_DIMENSIONS.palmLength > 0 ? tilt / BODY_DIMENSIONS.palmLength : 0;
    return measurement('calculatePalmCurvature', curvature, '1/m');
  }
  /**
   * [0375] calculatePalmCenterOfMass
   * Tâm khối lượng lòng bàn tay (0,4·L tính từ gốc bàn tay).
   */
  public calculatePalmCenterOfMass(entity?: any, options?: any): any {
    const value = BODY_DIMENSIONS.palmLength * 0.4;
    return measurement('calculatePalmCenterOfMass', value, 'm');
  }
  /**
   * [0376] calculatePalmBoundingBox
   * Hộp bao lòng bàn tay (kích thước theo BODY_BOX_SIZES.palm nếu không truyền).
   */
  public calculatePalmBoundingBox(entity?: any, size?: Vec3D): any {
    const box = boundingBox(entityPosition(entity), this.boxSize('palm', size));
    return boundsResult('calculatePalmBoundingBox', box);
  }
  /**
   * [0377] calculatePalmBoundingSphere
   * Hình cầu bao lòng bàn tay (bán kính = nửa đường chéo hộp lòng bàn tay).
   */
  public calculatePalmBoundingSphere(entity?: any, radius = 1.0): any {
    const given = arguments.length >= 2 && Number.isFinite(radius);
    const r = given ? Math.max(0, radius) : halfDiagonal(BODY_BOX_SIZES.palm);
    return {
      name: 'calculatePalmBoundingSphere',
      valid: true,
      center: entityPosition(entity),
      radius: r,
      timestamp: Date.now(),
    };
  }
  /**
   * [0378] calculatePalmSymmetry
   * Độ đối xứng của hai lòng bàn tay (1 = hoàn hảo).
   */
  public calculatePalmSymmetry(a?: any, b?: any, options?: any): any {
    const left = this.palmFrame('getPalmCenter');
    const right = { x: -left.x, y: left.y, z: left.z };
    const symmetry = this.symmetryOf(left, right, BODY_DIMENSIONS.handWidth);
    return namedResult('calculatePalmSymmetry', { symmetry, left, right });
  }
  /**
   * [0379] calculatePalmToWristDistance
   * Khoảng cách lòng bàn tay tới cổ tay.
   */
  public calculatePalmToWristDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getPalmCenter', 'getLeftWristPosition');
    return measurement('calculatePalmToWristDistance', value, 'm');
  }
  /**
   * [0380] calculatePalmToFingerBaseDistance
   * Khoảng cách lòng bàn tay tới gốc ngón tay.
   */
  public calculatePalmToFingerBaseDistance(a?: any, b?: any): any {
    const value = this.landmarkDistance(a, b, 'getPalmCenter', 'getPalmTopPosition');
    return measurement('calculatePalmToFingerBaseDistance', value, 'm');
  }
  /**
   * [0381] calculateHandSpan
   * Độ sải bàn tay (BODY_DIMENSIONS.handSpan).
   */
  public calculateHandSpan(entity?: any, options?: any): any {
    return measurement('calculateHandSpan', BODY_DIMENSIONS.handSpan, 'm');
  }
  /**
   * [0382] calculateHandWidth
   * Chiều rộng bàn tay (BODY_DIMENSIONS.handWidth).
   */
  public calculateHandWidth(entity?: any, options?: any): any {
    return measurement('calculateHandWidth', BODY_DIMENSIONS.handWidth, 'm');
  }
  /**
   * [0383] calculateHandLength
   * Chiều dài bàn tay (BODY_DIMENSIONS.handLength).
   */
  public calculateHandLength(entity?: any, options?: any): any {
    return measurement('calculateHandLength', BODY_DIMENSIONS.handLength, 'm');
  }
  /**
   * [0384] calculateHandThickness
   * Độ dày bàn tay (bằng độ dày lòng bàn tay).
   */
  public calculateHandThickness(a?: any, b?: any, options?: any): any {
    return namedResult('calculateHandThickness', {
      thickness: BODY_DIMENSIONS.palmThickness,
      width: BODY_DIMENSIONS.handWidth,
      length: BODY_DIMENSIONS.handLength,
    });
  }
  /**
   * [0385] calculateHandOrientation
   * Hướng quay bàn tay (quaternion của xương bàn tay, mặc định đơn vị).
   */
  public calculateHandOrientation(entityOrAngle?: any, options?: any): any {
    const q = this.orientationOf(entityOrAngle, ['hand', 'palm', 'wrist'], options);
    return orientationResult('calculateHandOrientation', q);
  }
  /**
   * [0386] calculateHandForwardDirection
   * Hướng phía trước của bàn tay (hướng các ngón tay).
   */
  public calculateHandForwardDirection(a?: any, b?: any): any {
    return directionResult('calculateHandForwardDirection', this.palmForward(a));
  }
  /**
   * [0387] calculateHandUpDirection
   * Hướng phía trên của bàn tay.
   */
  public calculateHandUpDirection(a?: any, b?: any): any {
    return directionResult('calculateHandUpDirection', this.palmUp(a));
  }
  /**
   * [0388] calculateHandRightDirection
   * Hướng bên phải của bàn tay.
   */
  public calculateHandRightDirection(a?: any, b?: any): any {
    return directionResult('calculateHandRightDirection', this.palmRight(a));
  }
  /**
   * [0389] calculateHandVelocity
   * Vận tốc bàn tay (đọc entity.velocity, mặc định zero).
   */
  public calculateHandVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateHandVelocity', this.velocityOf(entity), { dt });
  }
  /**
   * [0390] calculateHandAcceleration
   * Gia tốc bàn tay (đọc entity.acceleration, mặc định zero).
   */
  public calculateHandAcceleration(entity?: any, dt = 0.016): any {
    return directionResult('calculateHandAcceleration', this.accelerationOf(entity), { dt });
  }
  /**
   * [0391] calculateHandAngularVelocity
   * Vận tốc góc của bàn tay (đọc entity.angularVelocity, mặc định zero).
   */
  public calculateHandAngularVelocity(entity?: any, dt = 0.016): any {
    return directionResult('calculateHandAngularVelocity', this.angularVelocityOf(entity), { dt });
  }
  /**
   * [0392] calculateHandAngularAcceleration
   * Gia tốc góc của bàn tay (đọc entity.angularAcceleration, mặc định zero).
   */
  public calculateHandAngularAcceleration(entity?: any, dt = 0.016): any {
    return directionResult(
      'calculateHandAngularAcceleration',
      this.angularAccelerationOf(entity),
      { dt },
    );
  }
  /**
   * [0393] calculateHandTrajectory
   * Quỹ đạo bàn tay (đoạn cổ tay → bàn tay nếu entity không có đường đi).
   */
  public calculateHandTrajectory(a?: any, b?: any, options?: any): any {
    const start = this.framePosition('getLeftWristPosition');
    const end = this.framePosition('getLeftHandPosition');
    const points = this.trajectoryPoints(a, start, end);
    return namedResult('calculateHandTrajectory', {
      points,
      start: points[0],
      end: points[points.length - 1],
      length: this.pathLengthOf(points),
    });
  }
  /**
   * [0394] calculateHandMotionDirection
   * Hướng chuyển động của bàn tay.
   */
  public calculateHandMotionDirection(a?: any, b?: any): any {
    if (isPointLike(a) && isPointLike(b)) {
      const dir = normalize(subtract(asPoint(b), asPoint(a)));
      if (magnitude(dir) > 0) return directionResult('calculateHandMotionDirection', dir);
    }
    const velocity = this.velocityOf(a);
    if (magnitude(velocity) > 0) {
      return directionResult('calculateHandMotionDirection', normalize(velocity));
    }
    return directionResult('calculateHandMotionDirection', { x: 0, y: 0, z: 0 });
  }
  /**
   * [0395] calculateHandMotionDistance
   * Quãng đường bàn tay đã di chuyển.
   */
  public calculateHandMotionDistance(a?: any, b?: any): any {
    if (isPointLike(a) && isPointLike(b)) {
      return measurement('calculateHandMotionDistance', distance3D(asPoint(a), asPoint(b)), 'm');
    }
    const speed = magnitude(this.velocityOf(a));
    return measurement('calculateHandMotionDistance', speed * (1 / 60), 'm');
  }
  /**
   * [0396] calculateHandPose
   * Tư thế bàn tay (vị trí + hướng + pháp tuyến lòng bàn tay).
   */
  public calculateHandPose(a?: any, b?: any, options?: any): any {
    const position = isPointLike(a) ? asPoint(a) : this.framePosition('getLeftHandPosition');
    const orientation = this.orientationOf(a, ['hand', 'palm'], options);
    return namedResult('calculateHandPose', {
      position,
      orientation,
      normal: this.palmNormal(a),
      fingers: this.fingerAngles(a),
    });
  }
  /**
   * [0397] calculateHandPoseDifference
   * Chênh lệch giữa hai tư thế bàn tay.
   */
  public calculateHandPoseDifference(a?: any, b?: any, options?: any): any {
    const pa = isPointLike(a) ? asPoint(a) : this.framePosition('getLeftHandPosition');
    const pb = isPointLike(b) ? asPoint(b) : pa;
    const positionDifference = subtract(pb, pa);
    const qa = readQuaternion(a);
    const qb = readQuaternion(b);
    const orientationDifference = qa && qb
      ? Math.acos(clamp(Math.abs(dot(qa, qb)), -1, 1))
      : 0;
    return namedResult('calculateHandPoseDifference', {
      positionDifference,
      distance: magnitude(positionDifference),
      orientationDifference,
    });
  }
  /**
   * [0398] calculateHandPoseSimilarity
   * Mức độ tương đồng giữa hai tư thế bàn tay (1 = giống hệt).
   */
  public calculateHandPoseSimilarity(a?: any, b?: any, options?: any): any {
    const pa = isPointLike(a) ? asPoint(a) : this.framePosition('getLeftHandPosition');
    const pb = isPointLike(b) ? asPoint(b) : pa;
    const reference = BODY_DIMENSIONS.handLength || 1;
    const distance = distance3D(pa, pb);
    const qa = readQuaternion(a);
    const qb = readQuaternion(b);
    const angle = qa && qb ? Math.acos(clamp(Math.abs(dot(qa, qb)), -1, 1)) : 0;
    const similarity = clamp01(1 - (distance / reference + angle / Math.PI) / 2);
    return namedResult('calculateHandPoseSimilarity', { similarity, distance, angle });
  }
  /**
   * [0399] calculateHandJointAngles
   * Các góc khớp của bàn tay (theo từng ngón tay, tính bằng radian).
   */
  public calculateHandJointAngles(a?: any, b?: any): any {
    return this.fingerAngles(a);
  }
  /**
   * [0400] calculateHandInverseKinematics
   * Động học ngược bàn tay: góc gập ngón cần thiết để chạm mục tiêu.
   */
  public calculateHandInverseKinematics(a?: any, b?: any, options?: any): any {
    const wrist = this.framePosition('getLeftWristPosition');
    const target = isPointLike(b) ? asPoint(b) : this.framePosition('getLeftPalmTopPosition');
    const reach = distance3D(wrist, target);
    const maxReach = BODY_DIMENSIONS.palmLength + BODY_DIMENSIONS.handLength;
    const reachable = reach <= maxReach;
    const curl = Math.acos(clamp(reach / maxReach, -1, 1));
    return namedResult('calculateHandInverseKinematics', {
      curl,
      reach,
      maxReach,
      reachable,
      target,
      fingers: this.fingerAngles(a),
    });
  }

}
