// engine/tests/spatial-semantics.test.ts — Chứng minh hàm trả về ĐÚNG phép tính
//
// Trước khi tối ưu, gần 2.900 method dùng chung một body nên nhiều hàm trả về
// cùng một giá trị sai (calculateDistance2D trả khoảng cách 3D,
// calculateSquaredDistance trả căn bậc hai…). Các test dưới đây khẳng định
// từng hàm trả về đúng ý nghĩa theo tên.
import { describe, it, expect } from 'vitest';
import { DistanceVectorMathSubsystem } from '../src/spatial-ui/subsystems/distance-vector-math-subsystem.js';

const m = new DistanceVectorMathSubsystem();

const A = { x: 0, y: 0, z: 0 };
const B = { x: 3, y: 4, z: 12 };

describe('Khoảng cách — mỗi hàm một phép tính khác nhau', () => {
  it('calculateDistance3D dùng khoảng cách Euclid 3D', () => {
    expect(m.calculateDistance3D(A, B)).toBeCloseTo(13);
    expect(m.calculateEuclideanDistance(A, B)).toBeCloseTo(13);
  });

  it('calculateDistance2D chỉ tính trên mặt phẳng ngang (XZ)', () => {
    // sqrt(3² + 12²) = 12.369 — không phải 13
    expect(m.calculateDistance2D(A, B)).toBeCloseTo(Math.sqrt(153));
    expect(m.calculateDistance2D(A, B)).not.toBeCloseTo(13);
  });

  it('các khoảng cách theo trục tách đúng từng thành phần', () => {
    expect(m.calculateHorizontalDistance(A, B)).toBeCloseTo(3);
    expect(m.calculateVerticalDistance(A, B)).toBeCloseTo(4);
    expect(m.calculateDepthDistance(A, B)).toBeCloseTo(12);
  });

  it('Manhattan, Chebyshev và bình phương đúng định nghĩa', () => {
    expect(m.calculateManhattanDistance(A, B)).toBeCloseTo(19);
    expect(m.calculateChebyshevDistance(A, B)).toBeCloseTo(12);
    expect(m.calculateSquaredDistance(A, B)).toBeCloseTo(169);
    // Bình phương không được trả căn bậc hai
    expect(m.calculateSquaredDistance(A, B)).not.toBeCloseTo(13);
  });

  it('calculateDistanceToOrigin đo từ gốc toạ độ', () => {
    expect(m.calculateDistanceToOrigin({ x: 3, y: 4, z: 0 })).toBeCloseTo(5);
    expect(m.calculateDistanceToOrigin({ x: 3, y: 4, z: 0 }, { x: 3, y: 4, z: 0 })).toBeCloseTo(0);
  });

  it('khoảng cách tới mặt đất / trần / tường / bề mặt', () => {
    expect(m.calculateDistanceToGround({ x: 0, y: 7, z: 0 })).toBeCloseTo(7);
    expect(m.calculateDistanceToCeiling({ x: 0, y: 2, z: 0 }, { x: 0, y: 5, z: 0 })).toBeCloseTo(3);
    expect(m.calculateDistanceToWall({ x: 4, y: 0, z: 0 }, { normal: { x: 1, y: 0, z: 0 }, distance: 0 })).toBeCloseTo(4);
    expect(m.calculateDistanceToSurface({ x: 0, y: 5, z: 0 }, { normal: { x: 0, y: 1, z: 0 }, distance: 0 })).toBeCloseTo(5);
  });

  it('khoảng cách theo danh sách điểm: min / max / trung bình / gần – xa', () => {
    const list = [{ x: 1, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { x: 9, y: 0, z: 0 }];
    expect(m.calculateMinimumDistance(A, list)).toBeCloseTo(1);
    expect(m.calculateMaximumDistance(A, list)).toBeCloseTo(9);
    expect(m.calculateAverageDistance(A, list)).toBeCloseTo(5);
    expect(m.calculateDistanceToNearestObject(A, list)).toBeCloseTo(1);
    expect(m.calculateDistanceToFarthestObject(A, list)).toBeCloseTo(9);
  });

  it('khoảng cách giữa các hình học', () => {
    const boxA = { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };
    const boxB = { min: { x: 4, y: 0, z: 0 }, max: { x: 5, y: 1, z: 1 } };
    expect(m.calculateDistanceBetweenBoxes(boxA, boxB)).toBeCloseTo(3);

    const sphereA = { center: { x: 0, y: 0, z: 0 }, radius: 1 };
    const sphereB = { center: { x: 5, y: 0, z: 0 }, radius: 1 };
    expect(m.calculateDistanceBetweenSpheres(sphereA, sphereB)).toBeCloseTo(3);

    const capA = { start: { x: 0, y: 0, z: 0 }, end: { x: 1, y: 0, z: 0 }, radius: 0.5 };
    const capB = { start: { x: 3, y: 0, z: 0 }, end: { x: 4, y: 0, z: 0 }, radius: 0.5 };
    // Khoảng hở giữa hai trục = 2, trừ tổng bán kính 1 → 1
    expect(m.calculateDistanceBetweenCapsules(capA, capB)).toBeCloseTo(1);
  });

  it('khoảng cách giữa hai đoạn thẳng', () => {
    const d = m.calculateDistanceBetweenSegments(
      { start: { x: 0, y: 0, z: 0 }, end: { x: 10, y: 0, z: 0 }, radius: 0 },
      { start: { x: 5, y: 3, z: 0 }, end: { x: 6, y: 3, z: 0 }, radius: 0 },
    );
    expect(d).toBeCloseTo(3);
  });

  it('độ dài path và spline', () => {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 0, z: 0 },
      { x: 3, y: 4, z: 0 },
    ];
    expect(m.calculateDistanceAlongPath(A, points)).toBeCloseTo(7);
  });
});

describe('Vector — phép tính đúng từng loại', () => {
  it('cross và dot', () => {
    const cross = m.calculateCrossProduct({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
    expect(cross.result).toEqual({ x: 0, y: 0, z: 1 });
    expect(m.calculateDotProduct({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 })).toMatchObject({ result: 32 });
  });

  it('normalize trả vector đơn vị', () => {
    const result = m.normalizeVector({ x: 3, y: 4, z: 0 });
    expect(result.direction.x).toBeCloseTo(0.6);
    expect(result.direction.y).toBeCloseTo(0.8);
    expect(result.magnitude).toBeCloseTo(1);
  });

  it('project / reject tách đúng thành phần', () => {
    const projected = m.calculateVectorProjection({ x: 3, y: 4, z: 0 }, { x: 1, y: 0, z: 0 });
    expect(projected.vector).toEqual({ x: 3, y: 0, z: 0 });
    const rejected = m.calculateVectorRejection({ x: 3, y: 4, z: 0 }, { x: 1, y: 0, z: 0 });
    expect(rejected.vector).toEqual({ x: 0, y: 4, z: 0 });
  });

  it('reflect đối xứng qua mặt phẳng', () => {
    const reflected = m.reflectVector({ x: 1, y: -1, z: 0 }, { x: 0, y: 1, z: 0 });
    expect(reflected.direction.x).toBeCloseTo(1);
    expect(reflected.direction.y).toBeCloseTo(1);
  });

  it('lerp nội suy giữa hai vector', () => {
    const result = m.lerpVector({ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 });
    expect(result.direction.x).toBeCloseTo(5);
  });

  it('magnitude và clamp', () => {
    expect(m.calculateVectorMagnitude({ x: 3, y: 4, z: 0 })).toBeCloseTo(5);
    const clamped = m.clampVectorMagnitude({ x: 3, y: 4, z: 0 }, { max: 1 });
    expect(Math.hypot(clamped.x, clamped.y, clamped.z)).toBeCloseTo(1);
  });
});

describe('Góc & quaternion', () => {
  it('góc giữa hai vector đúng số đo', () => {
    expect(m.calculateAngleBetweenVectors({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toBeCloseTo(Math.PI / 2);
    expect(m.calculateVectorAngle({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 })).toBeCloseTo(Math.PI / 2);
  });

  it('Euler ↔ quaternion khứ hồi', () => {
    const euler = { x: 0.3, y: -0.7, z: 1.1 };
    const q = m.eulerToQuaternion(euler);
    const back = m.quaternionToEuler(q);
    expect(back.x).toBeCloseTo(euler.x, 5);
    expect(back.y).toBeCloseTo(euler.y, 5);
    expect(back.z).toBeCloseTo(euler.z, 5);
  });

  it('quaternion đơn vị khi không có dữ liệu (w = 1)', () => {
    expect(m.calculateFootRotation().orientation.w).toBe(1);
    expect(m.calculateKneeRotation().orientation.w).toBe(1);
    expect(m.calculateHeadRotation().orientation.w).toBe(1);
  });

  it('normalize quaternion giữ độ dài = 1', () => {
    const q = m.normalizeQuaternion({ x: 0, y: 0, z: 0, w: 2 });
    expect(q.orientation.w).toBeCloseTo(1);
  });

  it('invert quaternion cho quay nghịch', () => {
    const q = m.eulerToQuaternion({ x: 0, y: 0, z: Math.PI / 2 });
    const inv = m.invertQuaternion(q);
    const composed = m.multiplyQuaternions(q, inv);
    expect(composed.orientation.w).toBeCloseTo(1);
    expect(composed.orientation.x).toBeCloseTo(0);
  });

  it('slerp nội suy quaternion', () => {
    const a = m.eulerToQuaternion({ x: 0, y: 0, z: 0 });
    const b = m.eulerToQuaternion({ x: 0, y: 0, z: Math.PI / 2 });
    const mid = m.slerpQuaternion(a, { b, t: 0.5 });
    expect(mid.orientation.w).toBeCloseTo(Math.cos(Math.PI / 8));
  });

  it('ma trận xoay 4x4 là ma trận đơn vị khi quaternion đơn vị', () => {
    const matrix = m.calculateRotationMatrix({ x: 0, y: 0, z: 0, w: 1 });
    expect(matrix.matrix[0]).toBeCloseTo(1);
    expect(matrix.matrix[5]).toBeCloseTo(1);
    expect(matrix.matrix[10]).toBeCloseTo(1);
    expect(matrix.matrix[15]).toBeCloseTo(1);
  });
});

describe('Vị trí & biến đổi', () => {
  it('offset vị trí giữ nguyên entity khi không có offset', () => {
    expect(m.getWorldPosition({ position: { x: 1, y: 2, z: 3 } })).toEqual({ x: 1, y: 2, z: 3 });
    expect(m.getWorldPosition({ position: { x: 1, y: 2, z: 3 } }, { x: 0.5, y: 0, z: 0 })).toEqual({
      x: 1.5,
      y: 2,
      z: 3,
    });
  });

  it('transform đổi chiều qua ma trận nghịch đảo', () => {
    const matrix = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1];
    const world = m.transformLocalToWorld({ x: 1, y: 1, z: 1 }, undefined, { matrix });
    expect(world.result).toEqual({ x: 3, y: 3, z: 3 });
    const local = m.transformWorldToLocal({ x: 3, y: 3, z: 3 }, undefined, { matrix });
    expect(local.result.x).toBeCloseTo(1);
  });

  it('offset vị trí giữa hai điểm', () => {
    const offset = m.calculatePositionOffset(A, B);
    expect(offset.result).toEqual({ x: 3, y: 4, z: 12 });
  });
});
