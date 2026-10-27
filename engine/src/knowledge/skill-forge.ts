/**
 * @file skill-forge.ts
 * @module @aetheria/engine/knowledge/skill-forge
 * @description Lò rèn kỹ năng agentic: hệ thống KHÔNG cấp phát skills/kỹ năng/
 * phép cho agent. Agent phải tự truy cập dữ liệu tri thức thế giới, tự nghiên
 * cứu, thử nghiệm qua NHIỀU lần thất bại rồi mới "rèn" ra một skill và tự đưa
 * vào hệ thống của mình. Mỗi lần thử có thể: thất bại lặng lẽ, tạo hiệu ứng phụ
 * (khói, cháy nhẹ), hoặc phản tác dụng nguy hiểm (nổ — tuỳSeverity có thể giết
 * agent). Kết quả được ghi lại để game/thu thập dữ liệu đào tạo agentic AI.
 */

import { LifeRandom } from '../life/stochastic.js';
import { clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import type { KnowledgeBase } from './knowledge-base.js';

/** Loại năng lực agent có thể tự rèn. */
export type ForgeableKind = 'skill' | 'spell' | 'craft_recipe' | 'medical_technique' | 'science_theory' | 'achievement';

/** Định nghĩa một năng lực do agent tự phát minh. */
export interface ForgedAbility {
  id: string;
  name: string;
  kind: ForgeableKind;
  /** Cửa hàng tri thức cần thiết (id → mastery tối thiểu). */
  prerequisites: Record<string, number>;
  /** Sức mạnh hiệu ứng `[0, 1]`. */
  power: number;
  /** Độ khó thi triển/độ hao mana/độ tốn nguyên liệu `[0, 1]`. */
  cost: number;
  /** Hàm mô tả hiệu ứng dạng text (dùng cho log/game UI). */
  effectDescription: string;
  /** Ai phát minh ra. */
  inventorId: string;
  /** Năm phát minh. */
  year: number;
  /** Số lần thử thất bại trước khi thành công. */
  attemptsSpent: number;
  /** Kênh học hợp lệ để truyền lại cho agent khác. */
  transmissible: boolean;
}

/** Kết quả một lần thử rèn. */
export interface ForgeAttempt {
  attemptNumber: number;
  entityId: string;
  target: { name: string; kind: ForgeableKind };
  outcome: 'silent_failure' | 'progress' | 'side_effect' | 'backfire' | 'success';
  /** Mức tiến bộ tích luỹ `[0, 1]` sau lần thử này. */
  progress: number;
  /** Mức nguy hiểm xảy ra `[0, 1]` (0 = an toàn). */
  hazard: number;
  /** Sát thương thực tế agent phải chịu (nếu backfire). */
  selfDamage: number;
  note: string;
}

/** Kết quả toàn bộ quá trình rèn (có thể gọi nhiều lần). */
export interface ForgeSessionResult {
  ability: ForgedAbility | null;
  attempts: ForgeAttempt[];
  totalAttempts: number;
  succeeded: boolean;
  /** Agent có thể tiếp tục rèn được không (false = thiếu điều kiện nền). */
  viable: boolean;
  note: string;
}

/** Hồ sơ rèn luyện của một agent. */
export interface ForgeProfile {
  entityId: string;
  /** Các năng lực agent đã tự rèn được (không phải hệ thống cấp). */
  forgedAbilities: ForgedAbility[];
  /** Tiến bộ dở dang theo tên mục tiêu. */
  pendingProgress: Record<string, number>;
  /** Số lần thử tổng cộng theo tên mục tiêu. */
  attemptCounts: Record<string, number>;
  /** Tên năng lực bị cấm rèn vĩnh viễn (thất bại nguy hiểm quá mức). */
  banned: string[];
}

/** Cấu hình lò rèn. */
export interface SkillForgeOptions {
  seed?: number | string;
  /** Hệ số thử bụi: mỗi lần thử tốn bao nhiêu sức `[0, 1]`. */
  fatiguePerAttempt?: number;
  /** Ngưỡng tiến bộ để thành công. */
  successThreshold?: number;
}

/** Mô tả dữ liệu tri thức thế giới mà agent được phép truy cập để học. */
export interface WorldKnowledgeAccess {
  /** Đọc một mục tri thức từ thế giới; trả mastery `[0, 1]` hoặc undefined. */
  readKnowledge(entityId: string, knowledgeId: string): number | undefined;
  /** Các id tri thức mà agent biết là tồn tại (nhưng chưa chắc đã nắm). */
  visibleKnowledgeIds(entityId: string): readonly string[];
}

/**
 * Lò rèn kỹ năng agentic.
 *
 * Luồng: `beginForge(target)` → lặp `attempt()` nhiều lần qua nhiều tick →
 * khi progress chạm ngưỡng, năng lực được tạo và tự động thêm vào profile
 * của agent. Mỗi lần thử dùng RNG có seed theo entityId + attemptNumber để
 * mô phỏng tái lập được — phục vụ cả game lẫn dataset huấn luyện.
 */
export class SkillForge {
  public readonly abilities = new Map<string, ForgedAbility>();
  public readonly profiles = new Map<string, ForgeProfile>();
  public readonly seed: number | string;
  public readonly fatiguePerAttempt: number;
  public readonly successThreshold: number;
  /** Log toàn bộ quá trình rèn — nguồn dữ liệu thu thập cho agentic AI. */
  public readonly forgeLog: ForgeAttempt[] = [];
  private abilityCounter = 0;

  constructor(options: SkillForgeOptions = {}) {
    this.seed = options.seed ?? 'aetheria-forge';
    this.fatiguePerAttempt = clamp01(options.fatiguePerAttempt ?? 0.04);
    this.successThreshold = clampRange(options.successThreshold ?? 1, 0.2, 1.5);
  }

  /** Lấy hoặc khởi tạo hồ sơ rèn của một agent. */
  public profileOf(entityId: string): ForgeProfile {
    let profile = this.profiles.get(entityId);
    if (!profile) {
      profile = { entityId, forgedAbilities: [], pendingProgress: {}, attemptCounts: {}, banned: [] };
      this.profiles.set(entityId, profile);
    }
    return profile;
  }

  /**
   * Thực hiện một lượt rèn (gọi lặp lại mỗi tick của agent).
   *
   * @param entityId agent rèn
   * @param target mục tiêu muốn rèn
   * @param knowledge tri thức nền hiện có của agent (id → mastery)
   * @param options traits ảnh hưởng (creativity, persistence, willpower), năm hiện tại
   */
  public attempt(
    entityId: string,
    target: { name: string; kind: ForgeableKind; prerequisites?: Record<string, number>; intendedEffect?: string },
    knowledge: Record<string, number> = {},
    options: {
      random?: LifeRandom;
      creativity?: number;
      persistence?: number;
      year?: number;
      /** Máu của agent — nếu selfDamage vượt qua sẽ bị thương nặng. */
      health?: number;
    } = {},
  ): ForgeAttempt {
    const profile = this.profileOf(entityId);
    const random = options.random ?? new LifeRandom(`${entityId}:${target.name}:${profile.attemptCounts[target.name] ?? 0}`);
    const creativity = clamp01(options.creativity ?? 0.5);
    const persistence = clamp01(options.persistence ?? 0.5);

    // Kiểm tra điều kiện tiên quyết: thiếu tri thức nền thì không thể tiến bộ.
    const prerequisites = target.prerequisites ?? {};
    const missing = Object.entries(prerequisites).filter(([id, min]) => (knowledge[id] ?? 0) < min);
    const attemptNumber = (profile.attemptCounts[target.name] ?? 0) + 1;
    profile.attemptCounts[target.name] = attemptNumber;

    if (profile.banned.includes(target.name)) {
      const banned: ForgeAttempt = {
        attemptNumber,
        entityId,
        target: { name: target.name, kind: target.kind },
        outcome: 'silent_failure',
        progress: 0,
        hazard: 0,
        selfDamage: 0,
        note: 'mục tiêu đã bị cấm sau thảm hoạ trước — agent từ bỏ',
      };
      this.forgeLog.push(banned);
      return banned;
    }

    if (missing.length > 0) {
      const failed: ForgeAttempt = {
        attemptNumber,
        entityId,
        target: { name: target.name, kind: target.kind },
        outcome: 'silent_failure',
        progress: 0,
        hazard: 0,
        selfDamage: 0,
        note: `thiếu tri thức nền: ${missing.map(([id, min]) => `${id} ≥ ${min}`).join(', ')} — cần học/nghiên cứu trước`,
      };
      this.forgeLog.push(failed);
      return failed;
    }

    const progressKey = target.name;
    const currentProgress = profile.pendingProgress[progressKey] ?? 0;
    const difficulty = 0.4 + Object.keys(prerequisites).length * 0.12;
    const insightChance = clamp01(0.18 + creativity * 0.3 + persistence * 0.12 - difficulty * 0.25);
    const hazardRoll = random.next();
    const hazardBase = clamp01(0.05 + difficulty * 0.25 - creativity * 0.1);

    let attempt: ForgeAttempt;
    if (hazardRoll < hazardBase * 0.35) {
      // Phản tác dụng: nổ, hỏa hoạn, nhiễm độc...
      const hazard = clamp01(hazardBase + random.next() * 0.5);
      const health = options.health ?? 100;
      const selfDamage = Math.round(hazard * health * random.range(0.2, 0.65));
      const fatal = selfDamage >= health;
      attempt = {
        attemptNumber,
        entityId,
        target: { name: target.name, kind: target.kind },
        outcome: 'backfire',
        progress: 0,
        hazard,
        selfDamage,
        note: fatal
          ? `thí nghiệm nổ dữ dội (${hazard.toFixed(2)}) — agent thiệt mạng tại chỗ`
          : `phản tác dụng: khói độc + bỏng, mất ${selfDamage} máu`,
      };
      // Thảm hoạ lớn khiến agent bị chấn tâm cấm mục tiêu này.
      if (hazard > 0.65) profile.banned.push(target.name);
    } else if (hazardRoll < hazardBase) {
      // Hiệu ứng phụ không mong muốn nhưng có thể rút kinh nghiệm.
      const gained = clampRange(random.gaussian(0.08, 0.04), 0, 0.25);
      attempt = {
        attemptNumber,
        entityId,
        target: { name: target.name, kind: target.kind },
        outcome: 'side_effect',
        progress: gained,
        hazard: clamp01(hazardBase * 0.6),
        selfDamage: 0,
        note: 'khói nghi ngút, mùi khét — thất bại nhưng hiểu thêm về cơ chế',
      };
      profile.pendingProgress[progressKey] = currentProgress + gained;
    } else if (random.chance(insightChance)) {
      // Có tiến bộ thực sự.
      const gained = clampRange(random.gaussian(0.15 + creativity * 0.1, 0.05), 0, 0.4);
      attempt = {
        attemptNumber,
        entityId,
        target: { name: target.name, kind: target.kind },
        outcome: 'progress',
        progress: gained,
        hazard: 0,
        selfDamage: 0,
        note: 'thông suốt một mắt xích trong cơ chế',
      };
      profile.pendingProgress[progressKey] = currentProgress + gained;
    } else {
      attempt = {
        attemptNumber,
        entityId,
        target: { name: target.name, kind: target.kind },
        outcome: 'silent_failure',
        progress: 0,
        hazard: 0,
        selfDamage: 0,
        note: 'thử nghiệm không ra gì — ghi chép lại để tránh lặp đường cũ',
      };
    }

    const finalProgress = profile.pendingProgress[progressKey] ?? 0;
    if (finalProgress >= this.successThreshold) {
      const ability = this.finalizeAbility(entityId, target, finalProgress, options.year ?? 0, attemptNumber);
      attempt.outcome = 'success';
      attempt.note = `RÈN THÀNH CÔNG "${ability.name}" sau ${attemptNumber} lần thử: ${ability.effectDescription}`;
      profile.forgedAbilities.push(ability);
      delete profile.pendingProgress[progressKey];
    }

    this.forgeLog.push(attempt);
    if (this.forgeLog.length > 5000) this.forgeLog.splice(0, this.forgeLog.length - 5000);
    return attempt;
  }

  /** Hoàn tất một năng lực sau khi progress đủ. */
  private finalizeAbility(
    entityId: string,
    target: { name: string; kind: ForgeableKind; prerequisites?: Record<string, number>; intendedEffect?: string },
    progress: number,
    year: number,
    attempts: number,
  ): ForgedAbility {
    const random = new LifeRandom(`${entityId}:${target.name}:finalize`);
    const ability: ForgedAbility = {
      id: `${target.kind}_${++this.abilityCounter}_${hashSeed(`${entityId}:${target.name}`).toString(16)}`,
      name: target.name,
      kind: target.kind,
      prerequisites: { ...(target.prerequisites ?? {}) },
      power: clamp01(progress * random.range(0.6, 0.95)),
      cost: clamp01(random.range(0.1, 0.5) + Object.keys(target.prerequisites ?? {}).length * 0.05),
      effectDescription: target.intendedEffect ?? `hiệu ứng tự tạo của ${target.name}`,
      inventorId: entityId,
      year,
      attemptsSpent: attempts,
      transmissible: target.kind !== 'achievement',
    };
    this.abilities.set(ability.id, ability);
    return ability;
  }

  /** Các năng lực agent đã tự rèn. */
  public abilitiesOf(entityId: string): ForgedAbility[] {
    return [...(this.profiles.get(entityId)?.forgedAbilities ?? [])];
  }

  /**
   * Truyền một năng lực đã rèn cho agent khác — vẫn phải qua nhiều lần học,
   * phụ thuộc độ khó của năng lực và năng lực học của học viên.
   */
  public transmit(
    abilityId: string,
    studentId: string,
    options: { random?: LifeRandom; aptitude?: number; sessions?: number } = {},
  ): { learned: boolean; sessionsUsed: number; note: string } {
    const ability = this.abilities.get(abilityId);
    const random = options.random ?? new LifeRandom(`${abilityId}:${studentId}`);
    if (!ability || !ability.transmissible) {
      return { learned: false, sessionsUsed: 0, note: 'năng lực không tồn tại hoặc không thể truyền lại' };
    }
    const aptitude = clamp01(options.aptitude ?? 0.5);
    const sessionsNeeded = Math.max(2, Math.round(ability.attemptsSpent * 0.4 * (1.5 - aptitude)));
    const sessions = clampRange(Math.floor(options.sessions ?? sessionsNeeded), 1, 500);
    let learned = false;
    let session = 0;
    for (; session < sessions; session++) {
      if (random.chance(clamp01(0.1 + aptitude * 0.25 - ability.cost * 0.15))) {
        learned = true;
        break;
      }
    }
    const student = this.profileOf(studentId);
    if (learned) {
      const copy: ForgedAbility = { ...ability, id: `${ability.id}_s${studentId}`, inventorId: studentId, attemptsSpent: sessionsNeeded };
      student.forgedAbilities.push(copy);
      this.abilities.set(copy.id, copy);
    }
    return {
      learned,
      sessionsUsed: session + 1,
      note: learned
        ? `học được "${ability.name}" sau ${session + 1} phiên (cần ~${sessionsNeeded})`
        : `chưa học được sau ${sessions} phiên — cần kiên trì hơn`,
    };
  }

  /** Thống kê lò rèn toàn thế giới. */
  public stats(): { abilities: number; forgers: number; attempts: number; successes: number; banned: number } {
    let attempts = 0;
    let successes = 0;
    let banned = 0;
    for (const profile of this.profiles.values()) {
      attempts += Object.values(profile.attemptCounts).reduce((sum, n) => sum + n, 0);
      successes += profile.forgedAbilities.length;
      banned += profile.banned.length;
    }
    return { abilities: this.abilities.size, forgers: this.profiles.size, attempts, successes, banned };
  }
}
