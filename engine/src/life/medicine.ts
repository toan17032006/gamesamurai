/**
 * @file medicine.ts
 * @module @aetheria/engine/life/medicine
 * @description Y tế agentic: mỗi thực thể sở hữu một bộ kỹ năng chữa bệnh riêng
 * — có thể chữa được bệnh A, B nhưng không chữa được D, E, F. Kỹ năng không do
 * hệ thống cấp mà phải tự học từ healer khác (qua nhiều lần quan sát, phụ thuộc
 * độ kiên trì và tri thức nền), tự mò mẫm qua thực nghiệm, và có thể thất bại
 * gây hại cho bệnh nhân. Năng lực healer lớn dần theo số ca chữa thành công.
 */

import { LifeRandom } from './stochastic.js';
import { clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import type { DiseaseDefinition, DiseaseState } from './disease.js';

/** Một kỹ năng chữa bệnh mà healer có thể nắm giữ. */
export interface HealingSkill {
  id: string;
  name: string;
  /** Các bệnh mà kỹ năng này nhắm tới. */
  targetDiseases: readonly string[];
  /** Hiệu quả nền `[0, 1]` khi áp dụng đúng bệnh. */
  baseEffectiveness: number;
  /** Độ khó học `[0, 1]` — cao thì cần kiên trì và tri thức nhiều. */
  learningDifficulty: number;
  /** Yêu cầu tri thức nền (id knowledge → mastery tối thiểu `[0, 1]`). */
  requiredKnowledge: Record<string, number>;
  /** Nguy cơ gây hại khi làm sai `[0, 1]`. */
  mishapRisk: number;
  /** Mô tả cách làm (thảo dược, bó xương, mổ…). */
  method: string;
}

/** Bộ kỹ năng y tế của một healer. */
export interface HealerProfile {
  entityId: string;
  /** Kỹ năng đã thu được → mức thành thạo `[0, 1]`. */
  skills: Record<string, number>;
  /** Số ca đã chữa. */
  casesTreated: number;
  /** Số ca chữa thành công. */
  casesCured: number;
  /** Số ca làm bệnh nhân tổn thương thêm. */
  mishaps: number;
  /** Danh tiếng `[0, 1]`. */
  reputation: number;
  /** Độ kiên trì nghiên cứu — quyết định số lần thử tối đa khi học `[0, 1]`. */
  persistence: number;
}

/** Kết quả một lần chữa. */
export interface TreatmentOutcome {
  entityId: string;
  diseaseId: string;
  healerId: string;
  skillId: string | null;
  /** healer có kỹ năng phù hợp không. */
  hadSkill: boolean;
  /** Hiệu quả thực tế `[0, 1]` (âm = gây hại). */
  effectiveness: number;
  /** Bệnh nhân có khỏi không. */
  cured: boolean;
  /** Bệnh nhân có bị hại thêm không. */
  harmed: boolean;
  note: string;
}

/** Kết quả học một kỹ năng từ healer khác. */
export interface SkillLearningResult {
  skillId: string;
  studentId: string;
  teacherId: string;
  /** Đã học được chưa (mức thành thạo > 0). */
  learned: boolean;
  /** Mức thành thạo đạt được `[0, 1]` (0 = chưa học được). */
  mastery: number;
  /** Số lần đã thử tích luỹ. */
  attempts: number;
  /** Có thể học được trong tương lai không (tri thức nền đủ chưa). */
  canEventuallyLearn: boolean;
  note: string;
}

/** Kỹ năng chữa mặc định của thế giới. */
const HEALING_SKILL_LIST: HealingSkill[] = [
  {
    id: 'herbal_fever',
    name: 'Thuốc hạ sốt thảo mộc',
    targetDiseases: ['fever', 'influenza', 'common_cold'],
    baseEffectiveness: 0.45,
    learningDifficulty: 0.25,
    requiredKnowledge: { herbology: 0.3 },
    mishapRisk: 0.08,
    method: 'sắc lá kim tiền, liều theo cân nặng',
  },
  {
    id: 'wound_suturing',
    name: 'Khâu vết thương',
    targetDiseases: ['sepsis', 'gangrene'],
    baseEffectiveness: 0.55,
    learningDifficulty: 0.5,
    requiredKnowledge: { anatomy: 0.5, herbology: 0.2 },
    mishapRisk: 0.18,
    method: 'rửa bằng rượu, khâu chỉ tưa, bôi mật ong',
  },
  {
    id: 'bone_setting',
    name: 'Bó xương nẹp tre',
    targetDiseases: ['fracture_fever'],
    baseEffectiveness: 0.6,
    learningDifficulty: 0.4,
    requiredKnowledge: { anatomy: 0.45 },
    mishapRisk: 0.15,
    method: 'kéo thẳng xương, nẹp tre cố định 40 ngày',
  },
  {
    id: 'plague_quarantine',
    name: 'Cách ly & khử mùi bệnh dịch',
    targetDiseases: ['plague', 'cholera'],
    baseEffectiveness: 0.35,
    learningDifficulty: 0.55,
    requiredKnowledge: { epidemiology: 0.4, herbology: 0.25 },
    mishapRisk: 0.05,
    method: 'cách ly 21 ngày, đốt thiêu đồ nhiễm, đeo mặt nạ mưa sa',
  },
  {
    id: 'mana_purge',
    name: 'Thanh tẩy phép trị liệu',
    targetDiseases: ['plague', 'cursed_wasting', 'possession_fever'],
    baseEffectiveness: 0.8,
    learningDifficulty: 0.85,
    requiredKnowledge: { arcane_medicine: 0.7, anatomy: 0.3 },
    mishapRisk: 0.22,
    method: 'dệt ma lực qua 7 huyệt, đuổi tà khí ra ngoài da',
  },
];

/** Kỹ năng chữa mặc định của thế giới. */
export const DEFAULT_HEALING_SKILLS: readonly HealingSkill[] = Object.freeze(HEALING_SKILL_LIST);

/** Kho y tế agentic: quản lý healer, kỹ năng, chữa bệnh và truyền nghề. */
export class MedicineEngine {
  public readonly skills = new Map<string, HealingSkill>();
  public readonly healers = new Map<string, HealerProfile>();
  /** Số lần học thất bại tích luỹ theo `${studentId}:${skillId}`. */
  public readonly learningAttempts = new Map<string, number>();
  public readonly seed: number | string;

  constructor(options: { seed?: number | string; skills?: readonly HealingSkill[] } = {}) {
    this.seed = options.seed ?? 'aetheria-medicine';
    for (const skill of options.skills ?? DEFAULT_HEALING_SKILLS) {
      this.skills.set(skill.id, { ...skill });
    }
  }

  /** Đăng ký kỹ năng chữa mới (kể cả do agent phát minh). */
  public registerSkill(skill: HealingSkill): HealingSkill {
    const normalized: HealingSkill = {
      ...skill,
      baseEffectiveness: clamp01(skill.baseEffectiveness),
      learningDifficulty: clamp01(skill.learningDifficulty),
      mishapRisk: clamp01(skill.mishapRisk),
    };
    this.skills.set(normalized.id, normalized);
    return normalized;
  }

  /** Lấy hoặc khởi tạo hồ sơ healer. */
  public profileOf(entityId: string, options: { persistence?: number } = {}): HealerProfile {
    let profile = this.healers.get(entityId);
    if (!profile) {
      profile = {
        entityId,
        skills: {},
        casesTreated: 0,
        casesCured: 0,
        mishaps: 0,
        reputation: 0.1,
        persistence: clamp01(options.persistence ?? 0.5),
      };
      this.healers.set(entityId, profile);
    }
    return profile;
  }

  /** Danh sách bệnh mà healer này chữa được (có kỹ năng targeting đúng bệnh). */
  public treatableDiseases(entityId: string): string[] {
    const profile = this.healers.get(entityId);
    if (!profile) return [];
    const result = new Set<string>();
    for (const skillId of Object.keys(profile.skills)) {
      const skill = this.skills.get(skillId);
      if (!skill) continue;
      const mastery = profile.skills[skillId];
      // Thành thạo quá thấp thì chưa chữa được gì đáng kể.
      if (mastery < 0.15) continue;
      for (const disease of skill.targetDiseases) result.add(disease);
    }
    return [...result];
  }

  /** Kiểm tra healer có thể chữa một bệnh cụ thể không. */
  public canTreat(entityId: string, diseaseId: string): { yes: boolean; bestSkillId: string | null; mastery: number } {
    const profile = this.healers.get(entityId);
    if (!profile) return { yes: false, bestSkillId: null, mastery: 0 };
    let bestSkillId: string | null = null;
    let bestMastery = 0;
    for (const [skillId, mastery] of Object.entries(profile.skills)) {
      const skill = this.skills.get(skillId);
      if (!skill?.targetDiseases.includes(diseaseId)) continue;
      if (mastery > bestMastery) {
        bestMastery = mastery;
        bestSkillId = skillId;
      }
    }
    return { yes: bestMastery >= 0.15 && bestSkillId !== null, bestSkillId, mastery: bestMastery };
  }

  /**
   * Thực hiện một ca chữa: chọn kỹ năng tốt nhất, tính hiệu quả theo thành thạo,
   * điều kiện bệnh nhân và may rủi; cập nhật kinh nghiệm + danh tiếng.
   */
  public treat(
    healerId: string,
    patient: { entityId: string; state: DiseaseState; definition: DiseaseDefinition },
    options: { random?: LifeRandom; patientCooperation?: number } = {},
  ): TreatmentOutcome {
    const healer = this.profileOf(healerId);
    const random = options.random ?? new LifeRandom(`${healerId}:${patient.entityId}:${patient.state.diseaseId}:${healer.casesTreated}`);
    const { yes, bestSkillId, mastery } = this.canTreat(healerId, patient.state.diseaseId);
    healer.casesTreated++;

    if (!yes || !bestSkillId) {
      // Không có kỹ năng: cố chữa mò — gần như chỉ gây hại.
      const blindLuck = random.chance(0.05);
      if (blindLuck) {
        healer.casesCured++;
        return {
          entityId: patient.entityId,
          diseaseId: patient.state.diseaseId,
          healerId,
          skillId: null,
          hadSkill: false,
          effectiveness: 0.1,
          cured: true,
          harmed: false,
          note: 'chữa mò may mắn trúng, bệnh nhân tự hồi phục khi healer chăm sóc chu đáo',
        };
      }
      const harmed = random.chance(0.4);
      if (harmed) healer.mishaps++;
      healer.reputation = clamp01(healer.reputation - (harmed ? 0.08 : 0.02));
      return {
        entityId: patient.entityId,
        diseaseId: patient.state.diseaseId,
        healerId,
        skillId: null,
        hadSkill: false,
        effectiveness: harmed ? -0.2 : 0.02,
        cured: false,
        harmed,
        note: harmed ? 'không có kỹ năng, can thiệp sai làm bệnh nặng thêm' : 'không có kỹ năng phù hợp, bất lực nhìn bệnh tiến triển',
      };
    }

    const skill = this.skills.get(bestSkillId)!;
    const severityPenalty = clamp01(patient.state.severity) * 0.4;
    const cooperation = clamp01(options.patientCooperation ?? 0.7);
    const effectiveness = clamp01(
      skill.baseEffectiveness * (0.4 + 0.6 * mastery) * (1 - severityPenalty) * (0.7 + 0.3 * cooperation) +
        random.gaussian(0, 0.08),
    );
    const mishap = random.chance(skill.mishapRisk * (1.4 - mastery));
    const cured = effectiveness > 0.5 - severityPenalty * 0.3 && !mishap;

    if (mishap) {
      healer.mishaps++;
      healer.reputation = clamp01(healer.reputation - 0.06);
    } else if (cured) {
      healer.casesCured++;
      healer.reputation = clamp01(healer.reputation + 0.04);
    }
    // Luyện từ ca: thành thạo tăng nhanh lúc kém, chậm dần lại.
    const gain = 0.04 * (1 - mastery) + (cured ? 0.02 : 0);
    healer.skills[bestSkillId] = clamp01(mastery + gain);

    return {
      entityId: patient.entityId,
      diseaseId: patient.state.diseaseId,
      healerId,
      skillId: bestSkillId,
      hadSkill: true,
      effectiveness: mishap ? -effectiveness * 0.5 : effectiveness,
      cured,
      harmed: mishap,
      note: mishap
        ? `${skill.name} sai cách: ${skill.method} — bệnh nhân tổn thương thêm`
        : cured
          ? `${skill.name} thành công (${skill.method})`
          : `${skill.name} áp dụng đúng nhưng bệnh quá nặng`,
    };
  }

  /**
   * Học một kỹ năng từ healer khác. Kết quả phụ thuộc: tri thức nền, độ kiên
   * trì (số lần thử tối đa), độ khó kỹ năng và năng lực truyền đạt của thầy.
   * Không đủ tri thức nền → không thể học được dù thử bao nhiêu lần.
   */
  public learnSkill(
    studentId: string,
    teacherId: string,
    skillId: string,
    options: {
      random?: LifeRandom;
      /** Tri thức nền của học viên: id → mastery `[0, 1]`. */
      knowledge?: Record<string, number>;
      /** Năng lực trí tuệ học viên `[0, 1]`. */
      aptitude?: number;
      /** Năng lực truyền đạt của thầy `[0, 1]`. */
      teachingQuality?: number;
      /** Số phiên học trong lần gọi này. */
      sessions?: number;
    } = {},
  ): SkillLearningResult {
    const random = options.random ?? new LifeRandom(`${studentId}:${teacherId}:${skillId}`);
    const skill = this.skills.get(skillId);
    const student = this.profileOf(studentId);
    const teacher = this.healers.get(teacherId);
    const key = `${studentId}:${skillId}`;

    if (!skill) {
      return {
        skillId,
        studentId,
        teacherId,
        learned: false,
        mastery: 0,
        attempts: this.learningAttempts.get(key) ?? 0,
        canEventuallyLearn: false,
        note: 'kỹ năng chưa tồn tại trong thế giới — phải tự phát minh',
      };
    }
    if (!teacher || (teacher.skills[skillId] ?? 0) < 0.3) {
      return {
        skillId,
        studentId,
        teacherId,
        learned: false,
        mastery: 0,
        attempts: this.learningAttempts.get(key) ?? 0,
        canEventuallyLearn: true,
        note: 'thầy chưa đủ trình độ truyền nghề (cần thành thạo ≥ 0.3)',
      };
    }

    // Kiểm tra tri thức nền: thiếu bất kỳ điều kiện nào → không thể học.
    const knowledge = options.knowledge ?? {};
    const missing = Object.entries(skill.requiredKnowledge).filter(
      ([needId, min]) => (knowledge[needId] ?? 0) < min,
    );
    if (missing.length > 0) {
      return {
        skillId,
        studentId,
        teacherId,
        learned: false,
        mastery: 0,
        attempts: this.learningAttempts.get(key) ?? 0,
        canEventuallyLearn: true,
        note: `thiếu tri thức nền: ${missing.map(([id, min]) => `${id} ≥ ${min}`).join(', ')} — cần tự nghiên cứu trước`,
      };
    }

    const aptitude = clamp01(options.aptitude ?? 0.5);
    const teaching = clamp01(options.teachingQuality ?? 0.6);
    const sessions = clampRange(Math.floor(options.sessions ?? 4), 1, 100);
    // Kiên trì quyết định số lần thử tối đa cộng dồn: 3 + persistence * 27.
    const maxAttempts = Math.round(3 + student.persistence * 27);
    let attempts = this.learningAttempts.get(key) ?? 0;
    let learned = false;
    let mastery = student.skills[skillId] ?? 0;
    let note = '';

    for (let i = 0; i < sessions && attempts < maxAttempts; i++) {
      attempts++;
      const difficultyRoll = skill.learningDifficulty * (1.3 - aptitude * 0.6);
      const breakThrough = random.chance(clamp01((1 - difficultyRoll) * 0.35 + aptitude * 0.25 + teaching * 0.2));
      if (breakThrough) {
        mastery = clamp01(Math.max(mastery, skill.baseEffectiveness * (0.5 + aptitude * 0.4)));
        learned = mastery > 0.05;
        note = `thông ngộ sau ${attempts} lần thử dưới sự dạy của ${teacherId}`;
        break;
      }
    }

    if (!learned && attempts >= maxAttempts) {
      note = `đã kiên trì ${attempts} lần thử — hết kiên nhẫn, bỏ cuộc (cần aptitude hoặc thầy giỏi hơn)`;
    } else if (!learned) {
      note = `chưa thông ngộ sau ${attempts} lần thử, còn kiên nhẫn tiếp tục`;
    }

    this.learningAttempts.set(key, attempts);
    if (learned) {
      student.skills[skillId] = mastery;
    }
    return { skillId, studentId, teacherId, learned, mastery: learned ? mastery : 0, attempts, canEventuallyLearn: true, note };
  }

  /**
   * Tự mò mẫm phát minh kỹ năng chữa mới từ các kỹ năng + tri thức đã có.
   * Xác suất thành công thấp, phụ thuộc số lần thử và sự kết hợp kỹ năng nền.
   */
  public experimentSkill(
    entityId: string,
    concept: { name: string; targetDiseases: readonly string[]; method: string },
    options: {
      random?: LifeRandom;
      /** Tri thức nền hiện có. */
      knowledge?: Record<string, number>;
      baseSkills?: readonly string[];
      creativity?: number;
    } = {},
  ): { invented: boolean; skill: HealingSkill | null; attemptsNeeded: number; note: string } {
    const random = options.random ?? new LifeRandom(`${entityId}:${concept.name}`);
    const healer = this.profileOf(entityId);
    const creativity = clamp01(options.creativity ?? 0.5);
    const knowledge = options.knowledge ?? {};

    // Điều kiện tiên quyết: hiểu biết y khoa tổng quát bất kỳ.
    const hasAnyFoundation = Object.keys(knowledge).some((id) =>
      ['herbology', 'anatomy', 'epidemiology', 'arcane_medicine'].includes(id) && knowledge[id] > 0.25,
    );
    if (!hasAnyFoundation && Object.keys(healer.skills).length === 0) {
      return {
        invented: false,
        skill: null,
        attemptsNeeded: Infinity,
        note: 'không có nền tảng y khoa nào — cần học herbology/anatomy trước',
      };
    }

    const baseSkills = options.baseSkills ?? Object.keys(healer.skills);
    const synergy = baseSkills.length * 0.08 + creativity * 0.3;
    const attemptsNeeded = Math.max(2, Math.round((1.2 - synergy) * 24));
    const invented = random.chance(clamp01(0.15 + synergy));

    if (!invented) {
      return { invented: false, skill: null, attemptsNeeded, note: 'thí nghiệm chưa ra kết quả, cần thử thêm' };
    }

    const skill: HealingSkill = {
      id: `heal_${concept.name.toLowerCase().replace(/\s+/g, '_')}_${random.int(100, 999)}`,
      name: concept.name,
      targetDiseases: concept.targetDiseases,
      baseEffectiveness: clamp01(0.3 + creativity * 0.4 + random.gaussian(0, 0.05)),
      learningDifficulty: clamp01(0.6 - creativity * 0.2),
      requiredKnowledge: { herbology: 0.25, anatomy: 0.2 },
      mishapRisk: clamp01(0.3 - creativity * 0.15),
      method: concept.method,
    };
    this.registerSkill(skill);
    healer.skills[skill.id] = clamp01(0.4 + creativity * 0.3);
    return { invented: true, skill, attemptsNeeded, note: `phát minh thành công "${concept.name}" sau ~${attemptsNeeded} lần thử` };
  }

  /** Thống kê y tế toàn thế giới. */
  public stats(): { healers: number; skills: number; treatments: number; cures: number; mishaps: number; avgReputation: number } {
    let treatments = 0;
    let cures = 0;
    let mishaps = 0;
    let reputationSum = 0;
    for (const healer of this.healers.values()) {
      treatments += healer.casesTreated;
      cures += healer.casesCured;
      mishaps += healer.mishaps;
      reputationSum += healer.reputation;
    }
    const count = Math.max(1, this.healers.size);
    return {
      healers: this.healers.size,
      skills: this.skills.size,
      treatments,
      cures,
      mishaps,
      avgReputation: reputationSum / count,
    };
  }
}

/** Băm helper cho id ổn định (dùng nội bộ nếu cần khoá theo ca chữa). */
export function treatmentKey(healerId: string, patientId: string, diseaseId: string, tick: number): string {
  return hashSeed(`${healerId}:${patientId}:${diseaseId}:${tick}`).toString(16);
}
