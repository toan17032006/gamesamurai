// engine/tests/spatial-space-semantics.test.ts
//
// Kiểm chứng các hàm vị trí "không gian" của spatial-ui: tên hàm phải nói đúng
// với kết quả trả về — không được trả vị trí thế giới rồi gọi là camera space.
import { describe, it, expect } from 'vitest';
import { DistanceVectorMathSubsystem } from '../src/spatial-ui/subsystems/distance-vector-math-subsystem.js';

const m = new DistanceVectorMathSubsystem();

const ENTITY = { position: { x: 4, y: 5, z: 6 } };

describe('getWorldPosition — không gian thế giới', () => {
  it('trả vị trí entity cộng offset', () => {
    expect(m.getWorldPosition(ENTITY)).toEqual({ x: 4, y: 5, z: 6 });
    expect(m.getWorldPosition(ENTITY, { x: 1, y: 0, z: 0 })).toEqual({ x: 5, y: 5, z: 6 });
  });
});

describe('getCameraSpacePosition — không được giả vờ đã ở không gian camera', () => {
  it('không có tham chiếu camera thì báo rõ là đang ở không gian thế giới', () => {
    const result = m.getCameraSpacePosition(ENTITY);
    expect(result.cameraSpace).toBe(false);
    expect(result.space).toBe('world');
    // Giá trị vị trí vẫn đúng — chỉ là không nằm trong không gian camera.
    expect(result.x).toBe(4);
    expect(result.y).toBe(5);
    expect(result.z).toBe(6);
  });

  it('có ma trận tham chiếu thì biến đổi thật sang không gian camera', () => {
    // Ma trận tịnh tiến (4,5,6) → điểm thế giới (4,5,6) về gốc của không gian.
    const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 5, 6, 1];
    const result = m.getCameraSpacePosition(ENTITY, undefined, { matrix });
    expect(result.cameraSpace).toBe(true);
    expect(result.space).toBe('camera');
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it('camera thật (có vị trí) cũng được dùng làm tham chiếu', () => {
    const result = m.getCameraSpacePosition(ENTITY, undefined, {
      camera: { position: { x: 0, y: 0, z: 0 } },
      target: { position: { x: 0, y: 0, z: 1 } },
    });
    expect(result.cameraSpace).toBe(true);
    expect(result.space).toBe('camera');
  });
});

describe('getObjectSpacePosition — không được giả vờ đã ở không gian đối tượng', () => {
  it('không có đối tượng tham chiếu thì báo rõ là đang ở không gian thế giới', () => {
    const result = m.getObjectSpacePosition(ENTITY);
    expect(result.objectSpace).toBe(false);
    expect(result.space).toBe('world');
    expect(result.x).toBe(4);
  });

  it('có đối tượng tham chiếu thì biến đổi thật', () => {
    const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 5, 6, 1];
    const result = m.getObjectSpacePosition(ENTITY, undefined, { object: { matrix } });
    expect(result.objectSpace).toBe(true);
    expect(result.space).toBe('object');
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it('đối tượng chỉ có vị trí thì dựng ma trận tịnh tiến từ vị trí đó', () => {
    const result = m.getObjectSpacePosition(ENTITY, undefined, {
      object: { position: { x: 4, y: 5, z: 6 } },
    });
    expect(result.objectSpace).toBe(true);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });
});

describe('Ba hàm vị trí không còn trả cùng một kết quả vô nghĩa', () => {
  it('getWorldPosition và getCameraSpacePosition phân biệt được', () => {
    const world = m.getWorldPosition(ENTITY);
    const camera = m.getCameraSpacePosition(ENTITY);
    expect(world).not.toHaveProperty('space');
    expect(camera.space).toBe('world');
    expect(camera.cameraSpace).toBe(false);
  });
});
