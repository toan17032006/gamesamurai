// engine/tests/behavior-semantics.test.ts
//
// Kiểm chứng phần "loại bỏ return có sẵn, không phù hợp" ở lớp hành vi:
// kết quả phải phản ánh đúng bản chất của từng thao tác, không phải một giá
// trị hằng dùng chung cho mọi hàm.
import { describe, it, expect, beforeEach } from 'vitest';

import {
  affectForEmotion,
  emotionResult,
  adaptationResult,
  detectionResult,
  movementResult,
  BehaviorSystem,
  setActiveBehaviorSystem,
} from '../src/behavior/index.js';

describe('affectForEmotion — suy ra valence / arousal từ tên cảm xúc', () => {
  it('cảm xúc tích cực có valence dương', () => {
    const joy = affectForEmotion('feelJoy');
    expect(joy.valence).toBeGreaterThan(0.5);
    expect(joy.matched).toContain('joy');
  });

  it('cảm xúc tiêu cực có valence âm', () => {
    const grief = affectForEmotion('feelGrief');
    expect(grief.valence).toBeLessThan(-0.5);
    const fear = affectForEmotion('feelFear');
    expect(fear.valence).toBeLessThan(0);
  });

  it('cảm xúc trung tính có valence bằng 0', () => {
    const neutral = affectForEmotion('developLanguageAbility');
    expect(neutral.valence).toBe(0);
    expect(neutral.arousal).toBe(0.5);
    expect(neutral.matched).toEqual([]);
  });

  it('arousal phân biệt trạng thái bình tĩnh và kích hoạt mạnh', () => {
    expect(affectForEmotion('triggerSleepBehavior').arousal).toBeLessThan(
      affectForEmotion('triggerFightResponse').arousal,
    );
  });

  it('cảm xúc nhiều thành phần lấy trung bình, không lệch về một từ', () => {
    const rejectionPain = affectForEmotion('feelRejectionPain');
    expect(rejectionPain.valence).toBeLessThan(0);
    expect(rejectionPain.matched.length).toBeGreaterThanOrEqual(2);
  });
});

describe('emotionResult — không còn valence cứng bằng 0', () => {
  it('feelJoy và feelGrief cho kết quả khác nhau về valence', () => {
    const joy = emotionResult('feelJoy', { intensity: 0.8 });
    const grief = emotionResult('feelGrief', { intensity: 0.8 });

    expect(joy.valence).toBeGreaterThan(0);
    expect(grief.valence).toBeLessThan(0);
    expect(joy.valence).not.toBe(grief.valence);
  });

  it('mọi cảm xúc trong danh mục đều có valence khác 0', () => {
    const names = [
      'feelJoy', 'feelHappiness', 'feelDelight', 'feelPride', 'feelGratitude',
      'feelRelief', 'feelHope', 'feelContentment', 'feelCuriosity', 'feelWonder',
      'feelAffection', 'feelAdmiration', 'feelInspiration', 'feelPlayfulness',
      'feelAnticipation', 'feelSadness', 'feelGrief', 'feelDisappointment',
      'feelLoneliness', 'feelEmptiness', 'feelNostalgia', 'feelRegret',
      'feelHopelessness', 'feelHomesickness', 'feelFear', 'feelAnxiety',
      'feelPanic', 'feelDread', 'feelSuspicion', 'feelAnger', 'feelIrritation',
      'feelFrustration', 'feelResentment', 'feelJealousy', 'feelEnvy',
      'feelContempt', 'feelIndignation', 'feelCompassion', 'feelSympathy',
    ];
    for (const name of names) {
      expect(affectForEmotion(name).valence, `${name} phải có valence khác 0`).not.toBe(0);
    }
  });

  it('báo trường affectBasis để giao diện/debug hiển thị', () => {
    const result = emotionResult('feelJoy', { intensity: 0.5 });
    expect(Array.isArray(result.affectBasis)).toBe(true);
    expect((result.affectBasis as string[]).length).toBeGreaterThan(0);
  });
});

describe('adaptationResult — success không còn luôn là true', () => {
  it('hệ số thấp thì không coi là thích nghi thành công', () => {
    const weak = adaptationResult('adaptHumanBehavior', { factor: 0.2 });
    expect(weak.success).toBe(false);
    expect(weak.successThreshold).toBe(0.5);
  });

  it('hệ số cao thì thích nghi thành công', () => {
    const strong = adaptationResult('adaptHumanBehavior', { factor: 0.9 });
    expect(strong.success).toBe(true);
  });
});

describe('detectionResult — không còn gán cường độ bịa', () => {
  it('không có tín hiệu thì cường độ bằng 0, không phải 0.1/0.85', () => {
    const result = detectionResult('detectPotentialThreat', { threshold: 0.5 });
    expect(result.detected).toBe(false);
    expect(result.strength).toBe(0);
  });

  it('tín hiệu vượt ngưỡng thì phát hiện và giữ nguyên cường độ', () => {
    const result = detectionResult('detectPotentialThreat', {
      threshold: 0.5,
      context: { strength: 0.9 },
    });
    expect(result.detected).toBe(true);
    expect(result.strength).toBe(0.9);
    expect(result.margin).toBeCloseTo(0.4, 5);
  });
});

describe('movementResult — vị trí không còn gán sẵn (0,0,0)', () => {
  it('lấy vị trí từ mục tiêu khi có', () => {
    const result = movementResult('seekSafety', { x: 3, y: 0, z: -7 }, 0.8);
    expect(result.position).toEqual({ x: 3, y: 0, z: -7 });
    expect(result.hasPosition).toBe(true);
  });

  it('mục tiêu lồng `position` cũng được đọc', () => {
    const result = movementResult('seekComfort', { position: { x: 1, y: 2, z: 3 } }, 0.5);
    expect(result.position).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('không biết vị trí thì trả null, không báo nhầm gốc toạ độ', () => {
    const result = movementResult('seekSafety', undefined, 0.5);
    expect(result.position).toBeNull();
    expect(result.hasPosition).toBe(false);
    expect(result.target).toBeNull();
  });
});

describe('Tích hợp — hệ thống hành vi dùng ngữ cảnh cảm xúc thật', () => {
  let behavior: BehaviorSystem;

  beforeEach(() => {
    behavior = new BehaviorSystem();
    setActiveBehaviorSystem(behavior);
  });

  it('feelJoy và feelSadness trả kết quả khác nhau qua hệ thống', () => {
    const joy = (behavior as any).feelJoy(0.9);
    const sadness = (behavior as any).feelSadness(0.9);

    expect(joy.valence).toBeGreaterThan(0);
    expect(sadness.valence).toBeLessThan(0);
  });

  it('hệ thống ghi nhận mức cảm xúc tích luỹ theo tên', () => {
    (behavior as any).feelJoy(0.8);
    const levels = (behavior as any).humanEmotion.emotionLevels as Map<string, number>;
    expect(levels.get('feelJoy')).toBeCloseTo(0.8, 5);
  });

  it('kìm nén cảm xúc làm mức cảm xúc gốc giảm thật sự', () => {
    (behavior as any).feelAnger(0.8);
    const result = (behavior as any).suppressAnger(0.5);
    const levels = (behavior as any).humanEmotion.emotionLevels as Map<string, number>;

    // Mức gốc phải giảm — trước đây lệnh kìm nén tạo mục riêng nên không giảm gì.
    expect(levels.get('feelAnger')).toBeCloseTo(0.3, 5);
    expect(result.applied).toBe(true);
    expect(result.suppressed).toBe('suppressAnger');
    expect(result.target).toBe('feelAnger');
    expect(result.valence).toBeLessThan(0);
  });

  it('kìm nén một cảm xúc chưa từng có thì báo không áp dụng được', () => {
    const result = (behavior as any).suppressEmotion(0.5);
    expect(result.applied).toBe(false);
    expect(result.target).toBeNull();
  });
});
