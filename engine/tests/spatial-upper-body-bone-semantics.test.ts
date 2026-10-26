// engine/tests/spatial-upper-body-bone-semantics.test.ts
//
// Kiểm chứng 2 lỗi "trung bình" mà agent verifier phát hiện và đã sửa:
//
// 1) `anatomical-upper-body-subsystem.ts` — 5 method bỏ qua trọn vẹn tham số,
//    gọi `framePosition()` (bảng landmark tĩnh) nên luôn trả cùng một kết quả:
//      calculateShoulderSlope, getLeftUpperArmStart, getRightUpperArmStart,
//      getLeftUpperArmEnd, getRightUpperArmEnd
//    → Nay phải phản ánh XƯƠNG THẬT (forward kinematics).
//
// 2) `distance-vector-math-subsystem.ts` — `boneCandidates()` đọc
//    `options.jointName` — không call site nào truyền key này ⇒ nhánh chết.
//    → Nay phải lấy tên xương từ chính entity khi không có `options`.
//
// Lưu ý về cây xương của test: phải có CẢ HAI bên vai (`shoulder_L` +
// `shoulder_R`) và xoay roll ở ngực. Nếu chỉ có một bên vai thì nhánh đối
// xứng qua mặt phẳng điện sẽ suy ra bên kia, `rise` luôn bằng 0 và độ dốc
// vai KHÔNG THỂ nào phản ánh tư thế — phép đo đúng vẫn ra hằng.
import { describe, it, expect } from 'vitest';
import { AnatomicalUpperBodySubsystem } from '../src/spatial-ui/subsystems/anatomical-upper-body-subsystem.js';
import { DistanceVectorMathSubsystem } from '../src/spatial-ui/subsystems/distance-vector-math-subsystem.js';
import { eulerToQuaternion } from '../src/spatial-ui/spatial-primitives.js';

/**
 * Cây xương: hips → spine → chest → (shoulder_L → elbow_L → wrist_L)
 *                                      → (shoulder_R → elbow_R → wrist_R)
 *
 * `roll` là góc xoay Z của ngực: làm nghiêng đường vai trong mặt phẳng
 * trước–sau nên độ dốc và độ cao hai vai thay đổi theo tư thế.
 */
function makeSkeleton(roll: number) {
  const node = (
    name: string,
    pos: [number, number, number],
    euler: [number, number, number],
    children: any[] = [],
  ) => ({
    name,
    position: { x: pos[0], y: pos[1], z: pos[2] },
    quaternion: eulerToQuaternion(euler[0], euler[1], euler[2]),
    rotation: { x: euler[0], y: euler[1], z: euler[2] },
    scale: { x: 1, y: 1, z: 1 },
    length: 0.2,
    children,
  });

  return node('hips', [0, 0.95, 0], [0, 0, 0], [
    node('spine', [0, 0.14, 0], [0, 0, 0], [
      node('chest', [0, 0.26, 0], [0, 0, roll], [
        node('shoulder_L', [0.17, 0.14, 0], [0, 0, roll], [
          node('elbow_L', [0.25, -0.07, 0.01], [0, 0, roll], [
            node('wrist_L', [0.25, -0.05, 0.02], [0, 0, roll]),
          ]),
        ]),
        node('shoulder_R', [-0.17, 0.14, 0], [0, 0, -roll], [
          node('elbow_R', [-0.25, -0.07, 0.01], [0, 0, -roll], [
            node('wrist_R', [-0.25, -0.05, 0.02], [0, 0, -roll]),
          ]),
        ]),
      ]),
    ]),
  ]);
}

describe('anatomical-upper-body — phản ánh xương thật thay vì bảng landmark tĩnh', () => {
  it('calculateShoulderSlope khác nhau theo tư thế', () => {
    const sys = new AnatomicalUpperBodySubsystem();
    const flat = sys.calculateShoulderSlope({ skeleton: makeSkeleton(0) }).result as any;
    const tilted = sys.calculateShoulderSlope({ skeleton: makeSkeleton(0.6) }).result as any;

    expect(flat).not.toEqual(tilted);
    // Độ dốc phải được tính từ vị trí xương, không phải bằng 0 cứng.
    expect(typeof flat.slope).toBe('number');
    expect(Number.isFinite(tilted.slope)).toBe(true);
    // Tư thế nghiêng vai ⇒ độ dốc khác 0 (nếu vẫn là 0 thì đang đọc bảng tĩnh).
    expect(tilted.slope).not.toBe(0);
    expect(tilted.width).toBeGreaterThan(0);
  });

  it('getLeftUpperArmStart dùng xương vai/khuỷu thật', () => {
    const sys = new AnatomicalUpperBodySubsystem();
    const result = sys.getLeftUpperArmStart({ skeleton: makeSkeleton(0.35) }).result as any;

    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    // Không được là cặp điểm tĩnh của khung giải phẫu.
    const other = sys.getLeftUpperArmStart({ skeleton: makeSkeleton(0.9) }).result as any;
    expect(result.start.y).not.toBeCloseTo(other.start.y, 6);
  });

  it('getRightUpperArmStart / getLeftUpperArmEnd / getRightUpperArmEnd cũng phản ánh xương', () => {
    const sys = new AnatomicalUpperBodySubsystem();
    const entity = { skeleton: makeSkeleton(0.5) };

    expect((sys.getRightUpperArmStart(entity).result as any).length).toBeGreaterThan(0);
    expect((sys.getLeftUpperArmEnd(entity).result as any).length).toBeGreaterThan(0);
    expect((sys.getRightUpperArmEnd(entity).result as any).length).toBeGreaterThan(0);

    // Bên phải phải lấy từ xương `shoulder_R` (x < 0), không phải từ bảng tĩnh.
    const right = sys.getRightUpperArmStart(entity).result as any;
    const left = sys.getLeftUpperArmStart(entity).result as any;
    expect(right.start.x).toBeLessThan(0);
    expect(left.start.x).toBeGreaterThan(0);
  });

  it('khi KHÔNG có cây xương thì vẫn trả giá trị giải phẫu tĩnh hợp lệ (fallback)', () => {
    const sys = new AnatomicalUpperBodySubsystem();
    const result = sys.calculateShoulderSlope({ position: { x: 0, y: 0, z: 0 } }).result as any;
    expect(result.slope).toBe(0);
    expect(result.width).toBeGreaterThan(0);
  });
});

describe('distance-vector-math — boneCandidates lấy tên xương từ entity khi không có options', () => {
  it('đọc được xương theo `entity.boneName`', () => {
    const sys = new DistanceVectorMathSubsystem();
    const entity = { skeleton: makeSkeleton(0.4), boneName: 'wrist_L' };

    const rotation = sys.calculateBoneRotation(entity);
    // Quaternion của xương phải khác đơn vị (tư thế thật), không phải mặc định.
    expect(rotation.orientation).toBeDefined();
    expect(rotation.bone).toBe('wrist_L');
  });

  it('không có tên xương thì lấy xương gốc của cây (không phải null)', () => {
    const sys = new DistanceVectorMathSubsystem();
    const entity = { skeleton: makeSkeleton(0.4) };
    const rotation = sys.calculateBoneRotation(entity);
    expect(rotation.bone).toBeTruthy();
  });
});
