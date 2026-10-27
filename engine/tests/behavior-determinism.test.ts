// engine/tests/behavior-determinism.test.ts — Kiểm chứng module Hành Vi:
//  • mô phỏng tái lập được (seed) thay cho Math.random(),
//  • confidence/score suy ra từ bằng chứng thật thay vì nhiễu,
//  • phát hiện / lựa chọn bám theo ngưỡng và điểm ưu tiên.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  BehaviorRandom,
  behaviorRandomFor,
  setBehaviorSeed,
  getBehaviorSeed,
  resetBehaviorRandom,
  hashString,
} from '../src/behavior/behavior-random.js';
import {
  collectFactors,
  evidenceConfidence,
  evaluateEstimate,
  detectionResult,
  selectionResult,
  operationResult,
  statusForOperation,
} from '../src/behavior/behavior-primitives.js';
import {
  HumanEmotionSubsystem,
} from '../src/behavior/subsystems/human-emotion-subsystem.js';
import {
  HumanCognitionSocialSubsystem,
} from '../src/behavior/subsystems/human-cognition-social-subsystem.js';
import {
  SomaticLifestyleSubsystem,
} from '../src/behavior/subsystems/somatic-lifestyle-subsystem.js';
import {
  SimulationAISubsystem,
} from '../src/behavior/subsystems/simulation-ai-subsystem.js';

describe('Hành Vi — PRNG có seed', () => {
  beforeEach(() => {
    resetBehaviorRandom(1234);
  });

  it('cùng seed cho cùng dãy số', () => {
    const a = new BehaviorRandom(42);
    const b = new BehaviorRandom(42);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
    seqA.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });

  it('seed khác → dãy số khác', () => {
    const a = new BehaviorRandom(42);
    const b = new BehaviorRandom(43);
    expect(a.next()).not.toBe(b.next());
  });

  it('setBehaviorSeed đặt lại toàn bộ luồng', () => {
    setBehaviorSeed(99);
    expect(getBehaviorSeed()).toBe(99);
    const first = behaviorRandomFor('x').next();
    setBehaviorSeed(99);
    expect(behaviorRandomFor('x').next()).toBe(first);
  });

  it('luồng theo nhãn độc lập với nhau', () => {
    const a = behaviorRandomFor('subsystem-a');
    const b = behaviorRandomFor('subsystem-b');
    const aSeq = [a.next(), a.next(), a.next()];
    const bSeq = [b.next(), b.next(), b.next()];
    // Gọi b không làm đổi dãy của a.
    expect(a.next()).not.toBe(aSeq[0]);
    expect(aSeq).toHaveLength(3);
    expect(bSeq).toHaveLength(3);
    expect(aSeq).not.toEqual(bSeq);
  });

  it('hashString ổn định và phân biệt chuỗi', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });

  it('pick / int / chance / gaussian / shuffle bám trong khoảng', () => {
    const rng = new BehaviorRandom(7);
    expect([1, 2, 3]).toContain(rng.pick([1, 2, 3]));
    for (let i = 0; i < 50; i++) {
      const n = rng.int(2, 5);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
    }
    const g = rng.gaussian(0, 1);
    expect(Number.isFinite(g)).toBe(true);
    expect(Math.abs(g)).toBeLessThanOrEqual(6);
    const shuffled = rng.shuffle([1, 2, 3, 4, 5]);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.slice().sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Hành Vi — đánh giá theo bằng chứng', () => {
  it('collectFactors lấy đúng các yếu tố số, bỏ qua siêu dữ liệu', () => {
    const factors = collectFactors({ threat: 0.8, distance: 12, tick: 99, name: 'x', nested: { fear: 0.4 } });
    expect(factors.threat).toBe(0.8);
    expect(factors.distance).toBe(12);
    expect(factors['nested.fear']).toBe(0.4);
    expect(factors.tick).toBeUndefined();
    expect(factors.name).toBeUndefined();
  });

  it('confidence KHÔNG còn là nhiễu: nhiều bằng chứng nhất quán → tin cậy cao', () => {
    const consistent = evidenceConfidence({ a: 0.8, b: 0.82, c: 0.79, d: 0.81 });
    const contradictory = evidenceConfidence({ a: 0.1, b: 0.9, c: 0.2, d: 0.85 });
    const none = evidenceConfidence({});

    expect(consistent).toBeGreaterThan(contradictory);
    expect(contradictory).toBeGreaterThan(none);
    expect(none).toBeLessThan(0.3);
    expect(consistent).toBeLessThanOrEqual(1);
    expect(consistent).toBeGreaterThan(0.5);
  });

  it('evaluateEstimate suy ra score/value/confidence từ đầu vào', () => {
    const rich = evaluateEstimate('estimateThreatSeverity', { threat: 0.9, distance: 3 }, { familiarity: 0.2 });
    expect(rich.value).toBeGreaterThan(0);
    expect(rich.score).toBeGreaterThan(0);
    expect(rich.confidence).toBeGreaterThan(0.4);
    expect(rich.evidenceCount).toBe(3);
    expect(rich.factors.threat).toBe(0.9);
    // Yếu tố `threat` nằm trong `target` → basis là target.factors.
    expect(rich.basis).toBe('target.factors');
    expect(rich.valueSource).toBe('threat');

    const empty = evaluateEstimate('estimateThreatSeverity');
    expect(empty.evidenceCount).toBe(0);
    expect(empty.confidence).toBeLessThan(0.3);
    expect(Number.isNaN(empty.value)).toBe(true);
  });

  it('evaluateEstimate là hàm thuần: cùng đầu vào → cùng kết quả', () => {
    const input = { stress: 0.6, sleep: 0.2 };
    const a = evaluateEstimate('estimateStressLevel', input, { context: 'x' });
    const b = evaluateEstimate('estimateStressLevel', input, { context: 'x' });
    expect(a.score).toBe(b.score);
    expect(a.confidence).toBe(b.confidence);
    expect(a.value).toBe(b.value);
  });

  it('confidence tăng khi có thêm bằng chứng', () => {
    const one = evaluateEstimate('x', { a: 0.5 });
    const three = evaluateEstimate('x', { a: 0.5, b: 0.5, c: 0.5 });
    expect(three.confidence).toBeGreaterThan(one.confidence);
  });
});

describe('Hành Vi — phát hiện & lựa chọn không còn phụ thuộc may rủi', () => {
  it('detectionResult phát hiện theo ngưỡng thật', () => {
    const strong = detectionResult('threat', { threshold: 0.5, strength: 0.9 });
    expect(strong.detected).toBe(true);
    expect(strong.strength).toBe(0.9);
    expect(strong.margin).toBeCloseTo(0.4, 5);

    const weak = detectionResult('threat', { threshold: 0.5, strength: 0.2 });
    expect(weak.detected).toBe(false);
    expect(weak.margin).toBeCloseTo(-0.3, 5);
  });

  it('detectionResult đọc cường độ từ ngữ cảnh', () => {
    const detected = detectionResult('threat', { threshold: 0.4, context: { strength: 0.8 } });
    expect(detected.detected).toBe(true);
    expect(detected.strength).toBe(0.8);
  });

  it('detectionResult không còn coin-flip: gọi lại cho kết quả giống nhau', () => {
    const a = detectionResult('threat', { threshold: 0.5, context: { strength: 0.9 } });
    const b = detectionResult('threat', { threshold: 0.5, context: { strength: 0.9 } });
    expect(a.detected).toBe(b.detected);
  });

  it('selectionResult chọn phương án có điểm cao nhất', () => {
    const result = selectionResult('selectHumanAction', [
      { id: 'a', score: 0.2 },
      { id: 'b', score: 0.9 },
      { id: 'c', score: 0.5 },
    ]);
    expect((result.selected as any).id).toBe('b');
    expect(result.rationale).toBe('highest_score');
    expect((result.scores as number[])[1]).toBe(0.9);
  });

  it('selectionResult hỗ trợ weight/priority/utility', () => {
    const byWeight = selectionResult('pick', [{ id: 'a', weight: 5 }, { id: 'b', weight: 1 }]);
    expect((byWeight.selected as any).id).toBe('a');
    const byPriority = selectionResult('pick', [{ id: 'a', priority: 1 }, { id: 'b', priority: 9 }]);
    expect((byPriority.selected as any).id).toBe('b');
    const byUtility = selectionResult('pick', [{ id: 'a', utility: 2 }, { id: 'b', utility: 8 }]);
    expect((byUtility.selected as any).id).toBe('b');
  });

  it('selectionResult tái lập được khi điểm bằng nhau (tie-break có seed)', () => {
    const candidates = [{ id: 'a', score: 0.5 }, { id: 'b', score: 0.5 }, { id: 'c', score: 0.5 }];
    const first = selectionResult('choose', candidates);
    const second = selectionResult('choose', candidates);
    expect((first.selected as any).id).toBe((second.selected as any).id);
  });

  it('selectionResult chỉ tie-break trong nhóm điểm cao nhất và ổn định theo tick', () => {
    const candidates = [
      { id: 'low', score: 0.1 },
      { id: 'tie_a', score: 0.9 },
      { id: 'tie_b', score: 0.9 },
    ];
    const first = selectionResult('choose_tied', candidates, { tick: 7 });
    const second = selectionResult('choose_tied', candidates, { tick: 7 });
    const selectedId = (first.selected as { id: string }).id;
    expect(selectedId).toBe((second.selected as { id: string }).id);
    expect(['tie_a', 'tie_b']).toContain(selectedId);
    expect(first.tieBreak).toBe('seeded_tie_break');

    const defaultsA = selectionResult('defaults', []);
    const defaultsB = selectionResult('defaults', []);
    expect(defaultsA.selected).toBe(defaultsB.selected);
    expect(defaultsA.tieBreak).toBe('seeded_tie_break');
  });
});

describe('Hành Vi — trạng thái thao tác theo động từ', () => {
  it('suy ra đúng giai đoạn từ tên thao tác', () => {
    expect(statusForOperation('cancelHumanAction')).toBe('cancelled');
    expect(statusForOperation('interruptHumanAction')).toBe('interrupted');
    expect(statusForOperation('resumeHumanAction')).toBe('resumed');
    expect(statusForOperation('queueHumanAction')).toBe('queued');
    expect(statusForOperation('completeHumanAction')).toBe('completed');
    expect(statusForOperation('detectThreat')).toBe('detected');
    expect(statusForOperation('selectHumanAction')).toBe('selected');
  });

  it('operationResult luôn có field bắt buộc', () => {
    const result = operationResult('cancelHumanAction', { intensity: 0.4, context: { a: 1 }, tick: 7 });
    expect(result.operation).toBe('cancelHumanAction');
    expect(result.status).toBe('cancelled');
    expect(result.intensity).toBe(0.4);
    expect(result.tick).toBe(7);
    expect(result.timestamp).toBeGreaterThan(0);
    expect(result.context).toEqual({ a: 1 });
  });
});

describe('Hành Vi — subsystem dùng phép đánh giá thật', () => {
  beforeEach(() => {
    resetBehaviorRandom(2024);
  });

  it('estimateStressLevel phản ánh đầu vào thay vì nhiễu', () => {
    const sub = new SomaticLifestyleSubsystem();
    const low = sub.estimateStressLevel({ stress: 0.1, rest: 0.9 });
    const high = sub.estimateStressLevel({ stress: 0.95, rest: 0.05 });

    expect(low.confidence).toBeGreaterThan(0);
    expect(high.confidence).toBeGreaterThan(0);
    expect(low.value).toBeLessThan(high.value);
    expect(low.score).toBeLessThan(high.score);
    expect(low.factors.stress).toBe(0.1);
    expect(high.factors.stress).toBe(0.95);
  });

  it('gọi lại cùng đầu vào cho kết quả giống hệt (tái lập được)', () => {
    const sub = new SomaticLifestyleSubsystem();
    const a = sub.estimateStressLevel({ stress: 0.4, rest: 0.6 });
    const b = sub.estimateStressLevel({ stress: 0.4, rest: 0.6 });
    expect(a.score).toBe(b.score);
    expect(a.confidence).toBe(b.confidence);
    expect(a.value).toBe(b.value);
  });

  it('estimate có thêm field bắt buộc: value, factors, basis, evidenceCount, tick', () => {
    const sub = new HumanEmotionSubsystem();
    const r = sub.estimateThreatSeverity({ threat: 0.7 }, { familiarity: 0.3 });
    expect(r).toHaveProperty('value');
    expect(r).toHaveProperty('factors');
    expect(r).toHaveProperty('basis');
    expect(r).toHaveProperty('evidenceCount');
    expect(r).toHaveProperty('tick');
    expect(r.query).toBe('estimateThreatSeverity');
    expect(r.valid).toBe(true);
    expect(r.factors.threat).toBe(0.7);
  });

  it('các subsystem khác cũng dùng chung phép đánh giá', () => {
    const cognition = new HumanCognitionSocialSubsystem();
    const sim = new SimulationAISubsystem();
    expect(cognition.evaluateFairness({ fairness: 0.9 }).confidence).toBeGreaterThan(0);
    expect(sim.calculateBehaviorReward({ reward: 0.5 }).evidenceCount).toBeGreaterThan(0);
  });
});
