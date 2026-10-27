/**
 * @file personality.ts
 * @module @aetheria/engine/life/personality
 * @description Tính cách động: mọi trải nghiệm (nguy hiểm, thành công, thất
 * bại, sinh con, mất người thân, khám phá, chiến đấu…) điều chỉnh tính cách của
 * agent một lượng nhỏ, có chọn lọc. Đặc trưng luôn bị kéo nhẹ về **mức nền di
 * truyền** (genome) — bản chất bền vững hơn xu hướng nhất thời. Độ dẻo nhạy
 * (plasticity) giảm theo tuổi: trẻ em đổi tính cách nhanh, người già gần như
 * cố kết; người có willpower cao ít bị lệch hơn.
 */

import { clampRange, clamp01 } from '../deeplearning/random.js';
import type { EmotionalPersonality } from '../psychology/emotions.js';
import type { Genome } from './genetics.js';
import { LifeRandom } from './stochastic.js';

/** Loại trải nghiệm tác động lên tính cách. */
export type ExperienceKind =
  | 'danger_survived'
  | 'danger_trauma'
  | 'success'
  | 'failure'
  | 'betrayal'
  | 'kindness_received'
  | 'romance'
  | 'heartbreak'
  | 'childbirth'
  | 'bereavement'
  | 'discovery'
  | 'invention'
  | 'combat'
  | 'teaching'
  | 'exploration'
  | 'hardship';

/** Độ mạnh của một trải nghiệm `[0, 1]`. */
export interface Experience {
  kind: ExperienceKind;
  intensity: number;
  year: number;
  note?: string;
}

/** Kết quả một lần điều chỉnh. */
export interface PersonalityAdjustment {
  /** Độ dịch từng đặc trưng (chỉ những cái thực sự đổi). */
  deltas: Partial<EmotionalPersonality>;
  /** Hệ số dẻo nhạy áp dụng lần này. */
  plasticity: number;
  /** Ảnh hưởng kéo về mức nền di truyền trong lần này. */
  baselinePull: number;
  note: string;
}

/** Hồ sơ tính cách động của một agent. */
export interface PersonalityRecord {
  entityId: string;
  personality: EmotionalPersonality;
  /** Số trải nghiệm đã hấp thụ. */
  experiences: number;
  /** Tích luỹ dịch chuyển theo đặc trưng. */
  totalDrift: Record<string, number>;
  /** Sự kiện ảnh hưởng mạnh nhất. */
  formativeEvents: Array<{ kind: ExperienceKind; intensity: number; year: number }>;
}

/** Bảng hệ số dịch tính cách theo loại trải nghiệm (9 trục Big Five mở rộng). */
export const EXPERIENCE_TRAIT_EFFECTS: Readonly<Record<ExperienceKind, Partial<EmotionalPersonality>>> =
  Object.freeze({
    // Sống sót qua nguy hiểm: bản lĩnh hơn, bớt lo âu.
    danger_survived: { resilience: +3, neuroticism: -2, openness: +1 },
    // Sang chấn: lo âu tăng, cởi mở giảm, hướng nội hơn.
    danger_trauma: { neuroticism: +4, openness: -2, extraversion: -2 },
    success: { resilience: +2, neuroticism: -2, openness: +1 },
    failure: { neuroticism: +2, empathy: +1 },
    // Bị phản bội: bớt tin người, bớt dễ thương thú.
    betrayal: { agreeableness: -4, neuroticism: +2, openness: -1 },
    kindness_received: { agreeableness: +3, neuroticism: -1 },
    romance: { extraversion: +2, neuroticism: -2 },
    heartbreak: { neuroticism: +3, extraversion: -2 },
    childbirth: { agreeableness: +3, resilience: +2, extraversion: -1 },
    bereavement: { neuroticism: +4, empathy: +2 },
    discovery: { openness: +3, resilience: +1 },
    invention: { openness: +2, resilience: +2 },
    combat: { aggression: +3, neuroticism: -1, empathy: -1 },
    teaching: { agreeableness: +2, openness: +1 },
    exploration: { openness: +3, extraversion: +1 },
    // Cay đắng nghèo khó: cần cù hơn, bền bỉ hơn.
    hardship: { resilience: +3, neuroticism: +1 },
  });

/** Độ dẻo nhạy theo giai đoạn tuổi: trẻ học tính nhanh, già gần như cố kết. */
export function plasticityForAge(ageYears: number, lifespanYears = 80): number {
  const ratio = clamp01(ageYears / Math.max(1, lifespanYears));
  if (ratio < 0.15) return 1.0; // ấu thơ
  if (ratio < 0.35) return 0.85; // thiếu niên
  if (ratio < 0.6) return 0.6; // trưởng thành
  if (ratio < 0.8) return 0.35; // trung niên
  return 0.15; // elderly
}

/** Kéo một đặc trưng về mức nền di truyền với hệ số `pull`. */
function pullToBaseline(value: number, baseline: number, pull: number): number {
  return value + (baseline - value) * pull;
}

/** Dựng tính cách khởi đầu từ đặc trưng di truyền + seed — không ai giống ai. */
export function derivePersonalityFromTraits(
  traits: Record<string, number>,
  seed: number | string,
  options: { variation?: number } = {},
): EmotionalPersonality {
  const random = new LifeRandom(seed);
  const variation = clampRange(options.variation ?? 8, 0, 25);
  const scale = (trait: number, min: number, max: number) =>
    clampRange((trait / 100) * (max - min) + min + random.gaussian(0, variation), min, max);
  return {
    openness: scale(traits.curiosity ?? 50, 5, 95),
    conscientiousness: scale(traits.conscientiousness ?? 50, 5, 95),
    extraversion: scale(traits.sociability ?? 50, 5, 95),
    agreeableness: scale(traits.empathy ?? 50, 5, 95),
    neuroticism: scale(100 - (traits.resilience ?? 50), 5, 95),
    empathy: scale(traits.empathy ?? 50, 5, 95),
    aggression: scale(traits.aggression ?? 50, 0, 90),
    resilience: scale(traits.resilience ?? 50, 5, 95),
  };
}

/** Động cơ tính cách động cho toàn thế giới. */
export class PersonalityEngine {
  public readonly records = new Map<string, PersonalityRecord>();
  /** Hệ số kéo về mức nền di truyền mỗi năm (chậm — bản chất bền). */
  public baselinePullPerYear = 0.02;
  public readonly seed: number | string;

  constructor(options: { seed?: number | string; baselinePullPerYear?: number } = {}) {
    this.seed = options.seed ?? 'aetheria-personality';
    if (options.baselinePullPerYear !== undefined) {
      this.baselinePullPerYear = clamp01(options.baselinePullPerYear);
    }
  }

  /** Lấy/khởi tạo hồ sơ tính cách. */
  public profileOf(
    entityId: string,
    personality: EmotionalPersonality,
    genome?: Genome,
  ): PersonalityRecord {
    let record = this.records.get(entityId);
    if (!record) {
      record = {
        entityId,
        personality: { ...personality },
        experiences: 0,
        totalDrift: {},
        formativeEvents: [],
      };
      if (genome) {
        // Ghi mức nền di truyền để kéo về sau này.
        record.personality = { ...personality };
      }
      this.records.set(entityId, record);
    }
    return record;
  }

  /**
   * Hấp thụ một trải nghiệm: dịch tính cách theo bảng hiệu ứng, nhân dẻo nhạy
   * theo tuổi, giảm bởi willpower (người bản lĩnh khó đổi hơn), kẹp trong [0, 100].
   */
  public recordExperience(
    entityId: string,
    personality: EmotionalPersonality,
    experience: Experience,
    options: { ageYears?: number; lifespanYears?: number; willpower?: number; genome?: Genome } = {},
  ): PersonalityAdjustment {
    const record = this.profileOf(entityId, personality, options.genome);
    const ageYears = options.ageYears ?? 30;
    const lifespan = options.lifespanYears ?? 80;
    const plasticity = plasticityForAge(ageYears, lifespan);
    const willpower = clamp01((options.willpower ?? 50) / 100);
    // Bản lĩnh cao giữ tính cách ổn định (0.4 → 1.0 hệ số).
    const stability = 0.4 + 0.6 * (1 - willpower);
    const effect = EXPERIENCE_TRAIT_EFFECTS[experience.kind];
    const strength = clamp01(experience.intensity) * plasticity * stability;

    const deltas: Partial<EmotionalPersonality> = {};
    for (const [trait, shift] of Object.entries(effect)) {
      const delta = (shift as number) * strength;
      const before = record.personality[trait as keyof EmotionalPersonality] as number;
      const after = clampRange(before + delta, 0, 100);
      const applied = after - before;
      if (Math.abs(applied) > 0.01) {
        ((record.personality as unknown) as Record<string, number>)[trait] = after;
        deltas[trait as keyof EmotionalPersonality] = Math.round(applied * 100) / 100;
        record.totalDrift[trait] = (record.totalDrift[trait] ?? 0) + applied;
      }
    }

    record.experiences++;
    if (experience.intensity > 0.6) {
      record.formativeEvents.push({ kind: experience.kind, intensity: experience.intensity, year: experience.year });
      if (record.formativeEvents.length > 12) record.formativeEvents.shift();
    }

    return {
      deltas,
      plasticity,
      baselinePull: this.baselinePullPerYear,
      note: `${experience.kind} ×${experience.intensity.toFixed(2)} → plasticity ${plasticity.toFixed(2)}, stability ${stability.toFixed(2)}`,
    };
  }

  /**
   * Trôi dần về mức nền di truyền sau một năm sống — tính cách bền vững nhưng
   * không đóng băng: gió thời gian làm phẳng những vết cào nhất thời.
   */
  public annualDecay(
    entityId: string,
    baseline: Partial<EmotionalPersonality>,
  ): PersonalityAdjustment {
    const record = this.records.get(entityId);
    if (!record) return { deltas: {}, plasticity: 0, baselinePull: this.baselinePullPerYear, note: 'chưa có hồ sơ' };
    const deltas: Partial<EmotionalPersonality> = {};
    for (const [trait, baselineValue] of Object.entries(baseline)) {
      const current = ((record.personality as unknown) as Record<string, number>)[trait];
      if (typeof current !== 'number' || typeof baselineValue !== 'number') continue;
      const target = clampRange(baselineValue, 0, 100);
      const next = pullToBaseline(current, target, this.baselinePullPerYear);
      const applied = next - current;
      if (Math.abs(applied) > 0.001) {
        ((record.personality as unknown) as Record<string, number>)[trait] = next;
        deltas[trait as keyof EmotionalPersonality] = Math.round(applied * 1000) / 1000;
        record.totalDrift[trait] = (record.totalDrift[trait] ?? 0) + applied;
      }
    }
    return { deltas, plasticity: 0, baselinePull: this.baselinePullPerYear, note: 'trôi về mức nền di truyền' };
  }

  /** Tính cách hiện hành (đã qua mọi điều chỉnh). */
  public personalityOf(entityId: string): EmotionalPersonality | undefined {
    return this.records.get(entityId)?.personality;
  }

  /** Độ dịch tích luỹ từ mức khởi tạo — dùng để phân tích dữ liệu agent. */
  public driftOf(entityId: string): Record<string, number> {
    return { ...(this.records.get(entityId)?.totalDrift ?? {}) };
  }

  /** Các sự kiện định hình tính cách. */
  public formativeOf(entityId: string): Array<{ kind: ExperienceKind; intensity: number; year: number }> {
    return [...(this.records.get(entityId)?.formativeEvents ?? [])];
  }
}
