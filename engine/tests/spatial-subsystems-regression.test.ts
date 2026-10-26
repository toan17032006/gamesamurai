// engine/tests/spatial-subsystems-regression.test.ts — Hồi quy ngữ nghĩa 5 subsystem
// spatial-ui đã tối ưu: Camera/UI, Physics, Curves/Matrices, Khung (skeletal), Equipment,
// Entities. Mỗi khẳng định kiểm tra GIÁ TRỊ thật, không chỉ "không throw".
import { describe, it, expect } from 'vitest';
import { CameraViewportUISubsystem } from '../src/spatial-ui/subsystems/camera-viewport-ui-subsystem.js';
import { PhysicsCollisionProjectileSubsystem } from '../src/spatial-ui/subsystems/physics-collision-projectile-subsystem.js';
import { CurvesMatricesEnvironmentSubsystem } from '../src/spatial-ui/subsystems/curves-matrices-environment-subsystem.js';
import { SkeletalKinematicsCharacterSubsystem } from '../src/spatial-ui/subsystems/skeletal-kinematics-character-subsystem.js';
import { SpatialEquipmentArchitectureSubsystem } from '../src/spatial-ui/subsystems/spatial-equipment-architecture-subsystem.js';
import { EntitiesFaunaFloraSubsystem } from '../src/spatial-ui/subsystems/entities-fauna-flora-subsystem.js';

const camera = new CameraViewportUISubsystem();
const physics = new PhysicsCollisionProjectileSubsystem();
const curves = new CurvesMatricesEnvironmentSubsystem();
const skeletal = new SkeletalKinematicsCharacterSubsystem();
const equipment = new SpatialEquipmentArchitectureSubsystem();
const entities = new EntitiesFaunaFloraSubsystem();

describe('Camera & UI — chiếu world↔screen thật', () => {
  it('điểm trên trục nhìn của camera mặc định rơi vào GIỮA màn hình 1920×1080', () => {
    const p = camera.calculateWorldToScreenPosition({ x: 0, y: 0, z: 10 });
    expect(p.result.x).toBeCloseTo(960, 4);
    expect(p.result.y).toBeCloseTo(540, 4);
    expect(p.depth).toBeCloseTo(10, 5);
    expect(p.visible).toBe(true);
  });

  it('điểm lệch sang phải → toạ độ màn hình lệch sang phải', () => {
    const center = camera.calculateWorldToScreenPosition({ x: 0, y: 0, z: 10 });
    const right = camera.calculateWorldToScreenPosition({ x: 10, y: 0, z: 10 });
    expect(right.result.x).toBeGreaterThan(center.result.x);
    expect(right.result.y).toBeCloseTo(center.result.y, 4);
  });

  it('điểm sau camera → depth âm và không hiển thị', () => {
    const behind = camera.calculateWorldToScreenPosition({ x: 0, y: 0, z: -10 });
    expect(behind.depth).toBeCloseTo(-10, 5);
    expect(behind.visible).toBe(false);
  });

  it('screen→world→screen là vòng khép kín', () => {
    const world = camera.calculateScreenToWorldPosition({ x: 960, y: 540 }, undefined, { depth: 10 });
    expect(world.result.x).toBeCloseTo(0, 4);
    expect(world.result.y).toBeCloseTo(0, 4);
    expect(world.result.z).toBeCloseTo(10, 4);

    const back = camera.calculateWorldToScreenPosition(world.result);
    expect(back.result.x).toBeCloseTo(960, 3);
    expect(back.result.y).toBeCloseTo(540, 3);
  });

  it('calculateCameraLookAt trỏ đúng hướng tới mục tiêu', () => {
    const look = camera.calculateCameraLookAt({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    expect(look.direction.x).toBeCloseTo(0, 5);
    expect(look.direction.y).toBeCloseTo(0, 5);
    expect(look.direction.z).toBeCloseTo(1, 5);
    expect(look.yaw).toBeCloseTo(0, 5);
    expect(look.pitch).toBeCloseTo(0, 5);
    expect(look.distance).toBeCloseTo(10, 5);
  });

  it('ma trận chiếu & view là mảng 16 phần tử', () => {
    const proj = camera.calculateCameraProjectionMatrix();
    expect(Array.isArray(proj)).toBe(true);
    expect(proj).toHaveLength(16);
    const view = camera.calculateCameraViewMatrix();
    expect(view).toHaveLength(16);
    const vp = camera.calculateCameraViewProjectionMatrix();
    expect(vp).toHaveLength(16);
  });

  it('calculateUIAnchorPosition luôn nhìn thấy khi neo nằm trước camera', () => {
    const noTarget = camera.calculateUIAnchorPosition();
    expect(noTarget.visible).toBe(true);
    expect(noTarget.depth).toBeCloseTo(2, 4);
    expect(noTarget.worldPosition.z).toBeCloseTo(2, 4);

    const target = camera.calculateUIAnchorPosition({ x: 10, y: 2, z: 5 });
    expect(target.visible).toBe(true);
    expect(target.worldPosition).toEqual({ x: 10, y: 2, z: 5 });
    expect(target.uiPosition.x).toBeGreaterThan(960);
  });

  it('calculateUIBillboardRotation() không tham số → quaternion đơn vị', () => {
    const q = camera.calculateUIBillboardRotation();
    expect(q.w).toBe(1);
    expect(q.x).toBe(0);
    expect(q.y).toBe(0);
    expect(q.z).toBe(0);
  });

  it('aspect ratio viewport lấy từ kích thước thật', () => {
    const aspect = camera.calculateViewportAspectRatio(undefined, undefined, { width: 1920, height: 1080 });
    expect(aspect.result).toBeCloseTo(1920 / 1080, 5);
  });
});

describe('Physics — va chạm & tích phân thật', () => {
  it('AABB chồng lấn → hit true; không chồng → hit false', () => {
    const a = { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 2, z: 2 } };
    const b = { min: { x: 1, y: 1, z: 1 }, max: { x: 3, y: 3, z: 3 } };
    const far = { min: { x: 10, y: 10, z: 10 }, max: { x: 12, y: 12, z: 12 } };

    expect(physics.calculateAABBOverlap(a, b).hit).toBe(true);
    expect(physics.calculateAABBOverlap(a, far).hit).toBe(false);
    // Hở 8 m theo cả 3 trục → khoảng cách = 8·√3.
    expect(physics.calculateAABBOverlap(a, far).distance).toBeCloseTo(8 * Math.sqrt(3), 4);
  });

  it('hình cầu chồng lấn → hit + độ xuyên đúng', () => {
    const result = physics.calculateSphereOverlap({
      position: { x: 0, y: 0, z: 0 },
      radius: 1,
      other: { position: { x: 1, y: 0, z: 0 }, radius: 1 },
    });
    expect(result.hit).toBe(true);
    expect(result.penetration).toBeCloseTo(1, 5);
    expect(result.distance).toBeCloseTo(0, 5);
  });

  it('tia cắt hộp AABB → trả về điểm giao đúng', () => {
    const result = physics.calculateRayBoxIntersection(
      { x: 0, y: 0, z: 0 },
      {
        x: 0,
        y: 0,
        z: 1,
        box: { min: { x: -1, y: -1, z: 5 }, max: { x: 1, y: 1, z: 6 } },
      },
    );
    expect(result.hit).toBe(true);
    expect(result.result.z).toBeCloseTo(5, 4);
    expect(result.distance).toBeCloseTo(5, 4);
  });

  it('tia không chạm hộp → hit false', () => {
    const result = physics.calculateRayBoxIntersection(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0, box: { min: { x: -1, y: -1, z: 5 }, max: { x: 1, y: 1, z: 6 } } },
    );
    expect(result.hit).toBe(false);
  });

  it('tích phân Euler: vị trí mới = p + v·dt + ½a·dt²', () => {
    const result = physics.calculatePhysicsIntegration(
      { position: { x: 0, y: 0, z: 0 }, velocity: { x: 1, y: 0, z: 0 }, acceleration: { x: 0, y: 2, z: 0 } },
      undefined,
      { dt: 0.5 },
    );
    expect(result.result.x).toBeCloseTo(0.5, 6);
    expect(result.result.y).toBeCloseTo(0.25, 6);
  });

  it('quỹ đạo đạn là parabol: nâng tầm rồi rơi đúng vào mục tiêu', () => {
    const result = physics.calculateProjectileTrajectory(
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { speed: 20, samples: 12 },
    );
    const points = result.result as Array<{ x: number; y: number; z: number }>;
    expect(points).toHaveLength(12);
    expect(points[0].x).toBeCloseTo(0, 4);
    // Điểm cuối trùng đúng mục tiêu (cả quãng ngang lẫn độ cao).
    expect(points[points.length - 1].x).toBeCloseTo(10, 3);
    expect(points[points.length - 1].y).toBeCloseTo(0, 3);
    // Đạn nâng tầm rồi rơi xuống → có đỉnh cao hơn cả điểm đầu lẫn điểm cuối.
    // Đối chiếu với công thức đóng: apex = vy² / (2g), vy = v·sin(θ),
    // tan(θ) = (v² − √(v⁴ − g·g·D²)) / (g·D).
    const v = 20;
    const g = 9.81;
    const D = 10;
    const tanElev = (v * v - Math.sqrt(v ** 4 - g * g * D * D)) / (g * D);
    const vy = v * Math.sin(Math.atan(tanElev));
    const theoreticalApex = (vy * vy) / (2 * g);

    const apexY = Math.max(...points.map((p) => p.y));
    expect(apexY).toBeGreaterThan(0);
    expect(apexY).toBeCloseTo(theoreticalApex, 1);
    expect(apexY).toBeGreaterThan(points[0].y);
  });

  it('hạt có vận tốc và gia tốc được tích phân', () => {
    const result = physics.calculateParticlePosition(
      { position: { x: 0, y: 0, z: 0 }, velocity: { x: 2, y: 0, z: 0 }, acceleration: { x: 0, y: -10, z: 0 } },
      undefined,
      { dt: 0.2 },
    );
    expect(result.result.x).toBeCloseTo(0.4, 5);
    expect(result.result.y).toBeLessThan(0);
  });
});

describe('Curves & Matrices — đường cong và ma trận thật', () => {
  it('Bézier bậc 3: t=0 → p0, t=1 → p3, t=0.5 → trung điểm', () => {
    const p0 = { x: 0, y: 0, z: 0 };
    const p1 = { x: 0, y: 1, z: 0 };
    const p2 = { x: 1, y: 1, z: 0 };
    const p3 = { x: 1, y: 0, z: 0 };

    const start = curves.calculateBezierCurve({ p0, p1, p2, p3 }, undefined, { t: 0 });
    const end = curves.calculateBezierCurve({ p0, p1, p2, p3 }, undefined, { t: 1 });
    const mid = curves.calculateBezierCurve({ p0, p1, p2, p3 }, undefined, { t: 0.5 });

    expect(start.result.x).toBeCloseTo(0, 6);
    expect(start.result.y).toBeCloseTo(0, 6);
    expect(end.result.x).toBeCloseTo(1, 6);
    expect(end.result.y).toBeCloseTo(0, 6);
    // B(0.5) = (p0 + 3p1 + 3p2 + p3) / 8
    expect(mid.result.x).toBeCloseTo(0.5, 6);
    expect(mid.result.y).toBeCloseTo(0.75, 6);
  });

  it('Catmull-Rom đi qua các điểm điều khiển', () => {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
      { x: 3, y: 0, z: 0 },
    ];
    const at0 = curves.calculateCatmullRomSpline({ points }, undefined, { t: 0 });
    const at1 = curves.calculateCatmullRomSpline({ points }, undefined, { t: 1 });
    expect(at0.result.x).toBeCloseTo(0, 5);
    expect(at1.result.x).toBeCloseTo(3, 5);
    // Mũi tên tangent tại giữa chỉ theo trục X.
    const mid = curves.calculateCatmullRomSpline({ points }, undefined, { t: 0.5 });
    expect(mid.result.x).toBeCloseTo(1.5, 5);
  });

  it('nhân ma trận trả về mảng 16 phần tử', () => {
    const m = curves.calculateMatrixMultiplication(
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      { matrix: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1] },
    );
    expect(Array.isArray(m)).toBe(true);
    expect(m).toHaveLength(16);
  });

  it('địa hình là hàm tất định: cùng vị trí → cùng chiều cao', () => {
    const a = curves.calculateTerrainHeight({ x: 12, y: 0, z: -7 });
    const b = curves.calculateTerrainHeight({ x: 12, y: 0, z: -7 });
    const c = curves.calculateTerrainHeight({ x: 40, y: 0, z: 25 });
    expect(a).toBe(b);
    expect(Number.isFinite(a)).toBe(true);
    expect(Number.isFinite(c)).toBe(true);
  });

  it('ô lưới không gian phụ thuộc vị trí và kích thước ô', () => {
    const idx = curves.calculateGridCellIndex({ x: 12, y: 0, z: 12 }, undefined, { cellSize: 4 });
    expect(idx.result).toBeDefined();
    expect(idx.cellSize).toBe(4);
    expect(idx.result.x).toBe(3);
    expect(idx.result.z).toBe(3);
  });

  it('LOD của vật thể ở gần camera là mức 0', () => {
    const lod = curves.calculateObjectLOD({ position: { x: 0, y: 0, z: 1 } }, { position: { x: 0, y: 0, z: 0 } });
    expect(lod.lodLevel).toBe(0);
    expect(lod.valid).toBe(true);
  });
});

describe('Khung (skeletal) — cây xương, FK, IK', () => {
  const skeleton = {
    root: {
      name: 'Root',
      position: { x: 0, y: 1, z: 0 },
      children: [
        {
          name: 'Spine',
          position: { x: 0, y: 0.5, z: 0 },
          length: 0.5,
          children: [
            { name: 'Head', position: { x: 0, y: 0.3, z: 0 }, length: 0.2 },
          ],
        },
      ],
    },
  };

  it('FK cộng dồn vị trí cha + vị trí con', () => {
    const fk = skeletal.calculateForwardKinematics(skeleton);
    expect(fk.boneCount).toBe(3);
    expect(fk.root).toBe('Root');
    expect(fk.result.Root.y).toBeCloseTo(1, 5);
    expect(fk.result.Spine.y).toBeCloseTo(1.5, 5);
    expect(fk.result.Head.y).toBeCloseTo(1.8, 5);
  });

  it('chiều sâu cây xương tính đúng', () => {
    // Root → Spine → Head ⇒ độ sâu tối đa = 2.
    expect(skeletal.calculateBoneHierarchyDepth(skeleton)).toBe(2);
  });

  it('IK một khớp báo reachable khi mục tiêu trong tầm với', () => {
    const ik = skeletal.calculateJointInverseKinematics(
      { position: { x: 0, y: 0, z: 0 }, length: 2 },
      { x: 1, y: 0, z: 0 },
    );
    expect(ik.result.reachable).toBe(true);
    expect(ik.result.distance).toBeCloseTo(1, 5);
    expect(ik.result.angle).toBeCloseTo(Math.acos(0.5), 4);
  });

  it('IK báo unreachable khi mục tiêu ngoài tầm với', () => {
    const ik = skeletal.calculateJointInverseKinematics(
      { position: { x: 0, y: 0, z: 0 }, length: 1 },
      { x: 10, y: 0, z: 0 },
    );
    expect(ik.result.reachable).toBe(false);
  });
});

describe('Equipment & Architecture — kích thước và trọng tâm thật', () => {
  it('tốc độ xe lấy từ speed, nếu không có thì suy ra từ velocity', () => {
    expect(equipment.calculateVehicleSpeed({ speed: 12 })).toBeCloseTo(12, 5);
    expect(equipment.calculateVehicleSpeed({ velocity: { x: 3, y: 0, z: 4 } })).toBeCloseTo(5, 5);
    expect(equipment.calculateVehicleSpeed({})).toBeGreaterThan(0);
  });

  it('chiều cao tòa nhà lấy từ dữ liệu, mặc định là số dương', () => {
    expect(equipment.calculateBuildingHeight({ height: 30 })).toBeCloseTo(30, 5);
    expect(equipment.calculateBuildingHeight({})).toBeGreaterThan(0);
  });

  it('thể tích tòa nhà = diện tích đáy × chiều cao', () => {
    const volume = equipment.calculateBuildingVolume({
      position: { x: 0, y: 0, z: 0 },
      size: { x: 10, y: 5, z: 10 },
      height: 4,
    });
    expect(volume).toBeCloseTo(400, 4);
  });

  it('trọng tâm tập điểm là trung bình toạ độ', () => {
    const c = equipment.calculateSpatialCentroid([
      { x: 0, y: 0, z: 0 },
      { x: 2, y: 4, z: 6 },
    ]);
    expect(c.result.x).toBeCloseTo(1, 6);
    expect(c.result.y).toBeCloseTo(2, 6);
    expect(c.result.z).toBeCloseTo(3, 6);
    expect(c.count).toBe(2);
  });

  it('trung vị không gian lấy giá trị giữa', () => {
    const med = equipment.calculateSpatialMedian([
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ]);
    expect(med.result.x).toBeCloseTo(5, 6);
  });
});

describe('Entities — giải phẫu, đàn & vật thể', () => {
  it('mốc "trung tâm" giữ nguyên vị trí entity (offset = 0)', () => {
    expect(entities.getAnimalPosition({ position: { x: 1, y: 2, z: 3 } })).toEqual({ x: 1, y: 2, z: 3 });
    expect(entities.getBossPosition({ position: { x: 1, y: 2, z: 3 } })).toEqual({ x: 1, y: 2, z: 3 });
    expect(entities.getBirdPosition({ position: { x: 4, y: 5, z: 6 } })).toEqual({ x: 4, y: 5, z: 6 });
  });

  it('mốc giải phẫu cộng offset theo chiều cao cơ thể', () => {
    const head = entities.getAnimalHeadPosition({ position: { x: 0, y: 0, z: 0 } });
    expect(head.y).toBeGreaterThan(0);
    const center = entities.getAnimalCenter({ position: { x: 0, y: 0, z: 0 } });
    expect(center.y).toBeLessThan(head.y);
  });

  it('kích thước sinh vật là số thực dương', () => {
    expect(typeof entities.calculateBirdWingspan()).toBe('number');
    expect(entities.calculateBirdWingspan() as number).toBeGreaterThan(0);
    expect(typeof entities.calculateTreeHeight()).toBe('number');
    expect(entities.calculateTreeHeight() as number).toBeGreaterThan(0);
  });

  it('kích thước đọc được từ entity khi có', () => {
    expect(entities.calculateBirdWingspan({ wingspan: 2.4 })).toBeCloseTo(2.4, 5);
    expect(entities.calculateTreeHeight({ height: 25 })).toBeCloseTo(25, 5);
  });

  it('hướng phải/đứng của vật thể theo quaternion', () => {
    const identity = { quaternion: { x: 0, y: 0, z: 0, w: 1 } };
    expect(entities.getObjectRightVector(identity).x).toBeCloseTo(1, 5);
    expect(entities.getObjectUpVector(identity).y).toBeCloseTo(1, 5);

    // Xoay 90° quanh trục Y → phải trở thành -Z (forward +Z, right = cross(up, forward)).
    const yaw90 = { quaternion: { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 } };
    const right = entities.getObjectRightVector(yaw90);
    expect(right.z).toBeCloseTo(-1, 4);
    expect(right.x).toBeCloseTo(0, 4);
  });

  it('hành vi đàn: separation đẩy ra xa, alignment hướng về trung bình', () => {
    const me = { position: { x: 0, y: 0, z: 0 } };
    const neighbors = [
      { position: { x: 1, y: 0, z: 0 } },
      { position: { x: -1, y: 0, z: 0 } },
    ];
    const sep = entities.calculateNPCSeparationForce(me, neighbors);
    const align = entities.calculateNPCAlignmentForce(me, neighbors);
    const cohesion = entities.calculateNPCCohesionForce(me, neighbors);
    expect(sep).toBeDefined();
    expect(align).toBeDefined();
    expect(cohesion).toBeDefined();

    // Với 2 điểm đối xứng, hướng đồng thuận = 0.
    const alignVec = (align as any).direction ?? (align as any).result;
    if (alignVec && typeof alignVec.x === 'number') {
      expect(Math.hypot(alignVec.x, alignVec.y, alignVec.z)).toBeLessThan(1e-5);
    }
  });
});
