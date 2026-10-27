/**
 * @file domain-skills.ts
 * @module @aetheria/engine/training/domain-skills
 * @description Hệ kỹ năng lĩnh vực đa lớp cho AGENT trong game — 13 domain
 * trainable mà trước đây còn thiếu. Mỗi domain có skill tree (cấp bậc), chỉ số
 * phụ (accuracy/speed/creativity), exercise từ dataset, và synergy chéo domain
 * (mức kỹ năng ảnh hưởng lẫn nhau theo công thức synergy).
 *
 * 13 domain: combat · crafting · trade · navigation · social · farming ·
 * leadership · magic · survival · strategy · music · politics · belief
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

// ===========================================================================
// Định nghĩa domain & skill tree
// ===========================================================================

export type DomainId =
  | 'combat' | 'crafting' | 'trade' | 'navigation' | 'social'
  | 'farming' | 'leadership' | 'magic' | 'survival' | 'strategy'
  | 'music' | 'politics' | 'belief';

/** Cấp bậc skill: Novice → Apprentice → Journeyman → Expert → Master → Grandmaster. */
export type SkillTier = 'novice' | 'apprentice' | 'journeyman' | 'expert' | 'master' | 'grandmaster';

export const SKILL_TIERS: readonly SkillTier[] = Object.freeze([
  'novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster',
]);

export function tierForXp(xp: number): SkillTier {
  if (xp >= 5000) return 'grandmaster';
  if (xp >= 2000) return 'master';
  if (xp >= 800) return 'expert';
  if (xp >= 250) return 'journeyman';
  if (xp >= 50) return 'apprentice';
  return 'novice';
}

export function tierIndex(tier: SkillTier): number {
  return SKILL_TIERS.indexOf(tier);
}

/** Các kỹ năng con trong từng domain. */
export interface DomainSkillTree {
  domain: DomainId;
  skills: ReadonlyArray<{
    id: string;
    name: string;
    /** Cần domain nào đạt Expert mới mở khoá (synergy). */
    requires?: ReadonlyArray<{ domain: DomainId; minTier: SkillTier }>;
    description: string;
  }>;
}

/** 13 domain skill tree. */
export const DOMAIN_TREES: Readonly<Record<DomainId, DomainSkillTree>> = Object.freeze({
  combat: {
    domain: 'combat',
    skills: [
      { id: 'sword', name: 'Kiếm thuật', description: 'Chém, đỡ, phản đòn' },
      { id: 'archery', name: 'Cung thủ', description: 'Bắn xa, bắn di động' },
      { id: 'unarmed', name: 'Toàn thân võ', description: 'Đấm đá, vật, khống chế' },
      { id: 'defence', name: 'Phòng thủ', description: 'Khiên, né, Thick Skin' },
      { id: 'mounted', name: 'Kỵ chiến', description: 'Chiến đấu trên lưng ngựa', requires: [{ domain: 'combat', minTier: 'apprentice' }] },
    ],
  },
  crafting: {
    domain: 'crafting',
    skills: [
      { id: 'blacksmith', name: 'Rèn', description: 'Vũ khí, giáp, công cụ' },
      { id: 'cooking', name: 'Nấu ăn', description: 'Món ăn, thức uống, bảo quản' },
      { id: 'tailoring', name: 'May vá', description: 'Quần áo, túi, dây đeo' },
      { id: 'alchemy', name: 'Luyện đan', description: 'Thuốc chữa, thuốc độc, tinh chất' },
      { id: 'carpentry', name: 'Mộc', description: 'Nội thất, xương sống nhà', requires: [{ domain: 'crafting', minTier: 'apprentice' }] },
    ],
  },
  trade: {
    domain: 'trade',
    skills: [
      { id: 'haggling', name: 'Trả giá', description: 'Mua rẻ bán đắt' },
      { id: 'appraisal', name: 'Định giá', description: 'Đánh giá đúng giá trị đồ' },
      { id: 'routes', name: 'Đường buôn', description: 'Biết tuyến mua-bán sinh lời' },
      { id: 'contract', name: 'Hợp đồng', description: 'Ký kết, đàm phán, bảo đảm', requires: [{ domain: 'trade', minTier: 'journeyman' }] },
    ],
  },
  navigation: {
    domain: 'navigation',
    skills: [
      { id: 'landmark', name: 'Nhận dấu hiệu', description: 'Ghi nhớ landmark, tránh lạc' },
      { id: 'starmap', name: 'Định vị sao', description: 'Định hướng bằng bầu trời' },
      { id: 'cartography', name: 'Vẽ bản đồ', description: 'Chép lại terrain mới', requires: [{ domain: 'navigation', minTier: 'journeyman' }] },
    ],
  },
  social: {
    domain: 'social',
    skills: [
      { id: 'persuasion', name: 'Thuyết phục', description: 'Nói để người khác đổi ý' },
      { id: 'intimidation', name: 'Đe doạ', description: 'Tạo sợ hãi để kiểm soát' },
      { id: 'deception', name: 'Lừa dối', description: 'Che giấu, tạo tin giả' },
      { id: 'empathy', name: 'Đồng cảm', description: 'Đọc cảm xúc người khác', requires: [{ domain: 'social', minTier: 'apprentice' }] },
      { id: 'leadership_social', name: 'Truyền cảm hứng', description: 'Nói để người khác tin vào mình', requires: [{ domain: 'social', minTier: 'expert' }] },
    ],
  },
  farming: {
    domain: 'farming',
    skills: [
      { id: 'crop_rotation', name: 'Xen canh', description: 'Giữ đất màu, tăng năng suất' },
      { id: 'weather_read', name: 'Đọc thời tiết', description: 'Dự báo mưa nắng để gieo trồng' },
      { id: 'irrigation', name: 'Thuỷ lợi', description: 'Dẫn nước, thoát nước' },
      { id: 'animal_husbandry', name: 'Chăn nuôi', description: 'Nhân giống, nuôi 健康' },
    ],
  },
  leadership: {
    domain: 'leadership',
    skills: [
      { id: 'command', name: 'Chỉ huy', description: 'Điều phối đội nhóm' },
      { id: 'resource_alloc', name: 'Phân bổ', description: 'Quản lý tài nguyên chung' },
      { id: 'justice', name: 'Phán xét', description: 'Giải tranh chấp, giữ công lý' },
      { id: 'development', name: 'Phát triển', description: 'Mở rộng, xây dựng, đổi mới', requires: [{ domain: 'leadership', minTier: 'expert' }] },
    ],
  },
  magic: {
    domain: 'magic',
    skills: [
      { id: 'mana_channel', name: 'Dẫn mana', description: 'Điều khiển dòng ma lực' },
      { id: 'spell_learner', name: 'Học phép', description: 'Học phép mới từ cuộn giấy' },
      { id: 'enchant', name: 'Phù phép', description: 'Gắn ma lực vào đồ vật', requires: [{ domain: 'magic', minTier: 'journeyman' }] },
      { id: 'dispel', name: 'Giải phép', description: 'Phá bỏ phép thuật của kẻ khác', requires: [{ domain: 'magic', minTier: 'expert' }] },
    ],
  },
  survival: {
    domain: 'survival',
    skills: [
      { id: 'foraging', name: 'Hái lượm', description: 'Tìm thức ăn tự nhiên' },
      { id: 'tracking', name: 'Theo dấu', description: 'Đọc dấu vết con mồi/kẻ địch' },
      { id: 'shelter_build', name: 'Dựng trú', description: 'Dựng chỗ trú nhanh' },
      { id: 'first_aid', name: 'Sơ cứu', description: 'Tự chữa thương tích nhẹ' },
      { id: 'predator_sense', name: 'Cảm giác nguy hiểm', description: 'Nhận biết thiên địch gần', requires: [{ domain: 'survival', minTier: 'journeyman' }] },
    ],
  },
  strategy: {
    domain: 'strategy',
    skills: [
      { id: 'formation', name: 'Team Bố trận', description: 'Sắp xếp đội hình chiến đấu' },
      { id: 'siege', name: 'Công thành', description: 'Vây hãm, phá thành' },
      { id: 'guerrilla', name: 'Du kích', description: 'Đánh du kích, tập kích rồi rút' },
      { id: 'logistics', name: 'Hậu cần', description: 'Duy trì tiếp tế cho quân', requires: [{ domain: 'strategy', minTier: 'expert' }] },
    ],
  },
  music: {
    domain: 'music',
    skills: [
      { id: 'instrument', name: 'Nhạc cụ', description: 'Chơi đàn, sáo, trống' },
      { id: 'singing', name: 'Hát', description: 'Hát ru, hát sử thi' },
      { id: 'compose', name: 'Sáng tác', description: 'Sáng tác bài mới', requires: [{ domain: 'music', minTier: 'expert' }] },
    ],
  },
  politics: {
    domain: 'politics',
    skills: [
      { id: 'law_interpret', name: 'Giải luật', description: 'Đọc hiểu và vận dụng luật' },
      { id: 'manoeuvre', name: 'Ngoại giao', description: 'Xây liên minh, đánh break' },
      { id: 'propaganda', name: 'Tuyên truyền', description: 'Định hình dư luận', requires: [{ domain: 'politics', minTier: 'journeyman' }] },
    ],
  },
  belief: {
    domain: 'belief',
    skills: [
      { id: 'faith_strength', name: 'Đức tin', description: 'Niềm tin thiêng liêng cá nhân' },
      { id: 'ritual', name: 'Nghi thức', description: 'Thực hiện lễ tế đúng cách' },
      { id: 'divination', name: 'Bói toán', description: 'Đọc điềm báo', requires: [{ domain: 'belief', minTier: 'apprentice' }] },
    ],
  },
});

// ===========================================================================
// Agent skill profile — trạng thái skill của MỘT agent
// ===========================================================================

/** Trạng thái một skill con. */
export interface SkillLevel {
  xp: number;
  tier: SkillTier;
  /** Chỉ số phụ — accuracy/speed/creativity thay đổi qua exercise. */
  accuracy: number;
  speed: number;
  creativity: number;
  exercises: number;
}

/** Hồ sơ skill toàn diện của một agent. */
export interface AgentSkillProfile {
  entityId: string;
  /** Domain → tổng XP của domain. */
  domainXp: Map<DomainId, number>;
  /** Skill con: `combat.sword` → SkillLevel. */
  skills: Map<string, SkillLevel>;
  /** Vector đặc trưng đa tầng — "bộ não domain" hình dạng sau train. */
  domainBrains: Map<DomainId, number[]>;
  totalExercises: number;
}

/** Tạo profile trống cho một agent. */
export function createAgentSkillProfile(entityId: string): AgentSkillProfile {
  return {
    entityId,
    domainXp: new Map(),
    skills: new Map(),
    totalExercises: 0,
    domainBrains: new Map(),
  };
}

/** Tính synergy chéo domain: domain nào boost domain nào. */
export const DOMAIN_SYNERGY: Readonly<Record<DomainId, Partial<Record<DomainId, number>>>> = Object.freeze({
  combat: { strategy: 0.15, survival: 0.1 },
  crafting: { trade: 0.12, magic: 0.08 },
  trade: { social: 0.1, politics: 0.08 },
  navigation: { survival: 0.12, strategy: 0.08 },
  social: { politics: 0.15, leadership: 0.12, trade: 0.08 },
  farming: { survival: 0.1, trade: 0.08 },
  leadership: { politics: 0.15, strategy: 0.12 },
  magic: { belief: 0.12, crafting: 0.08 },
  survival: { navigation: 0.12, farming: 0.08, combat: 0.05 },
  strategy: { leadership: 0.15, combat: 0.1 },
  music: { social: 0.08, belief: 0.05 },
  politics: { leadership: 0.12, trade: 0.08 },
  belief: { magic: 0.1, social: 0.08 },
});

// ===========================================================================
// Exercise — train từ mẫu
// ===========================================================================

/** Một bài tập/exercise cho agent. */
export interface SkillExercise {
  domain: DomainId;
  skillId: string;
  /** Kết quả bài tập `[0, 1]` — 1 là hoàn hảo. */
  performance: number;
  /** XP nhận được (nếu không chỉ định, tự tính từ performance). */
  xpGain?: number;
  /** Thời điểm. */
  day: number;
  note?: string;
}

/** Kết quả một exercise. */
export interface ExerciseResult {
  skillKey: string;
  xpGained: number;
  newXp: number;
  tierBefore: SkillTier;
  tierAfter: SkillTier;
  /** Đã lên tier không. */
  tierUp: boolean;
  /** Synergy XP tràn sang domain khác. */
  synergyXp: Array<{ domain: DomainId; xp: number }>;
}

/** Unlock skill con qua synergy — nếu domain khác đủ tier. */
export function checkUnlock(
  profile: AgentSkillProfile,
  skill: DomainSkillTree['skills'][number],
): { unlocked: boolean; reason: string } {
  if (!skill.requires) return { unlocked: true, reason: 'không có điều kiện' };
  for (const req of skill.requires) {
    const domainXp = profile.domainXp.get(req.domain) ?? 0;
    if (tierIndex(tierForXp(domainXp)) < tierIndex(req.minTier)) {
      return { unlocked: false, reason: `cần ${req.domain} ≥ ${req.minTier}` };
    }
  }
  return { unlocked: true, reason: 'đủ điều kiện synergy' };
}

/** Động cơ skill domain — quản lý profile + exercise cho nhiều agent. */
export class DomainSkillEngine {
  public readonly profiles = new Map<string, AgentSkillProfile>();
  private readonly random: DeepRandom;

  constructor(options: { seed?: number | string } = {}) {
    this.random = new DeepRandom(options.seed ?? 'domain-skills');
  }

  public profileOf(entityId: string): AgentSkillProfile {
    let profile = this.profiles.get(entityId);
    if (!profile) {
      profile = createAgentSkillProfile(entityId);
      this.profiles.set(entityId, profile);
    }
    return profile;
  }

  /**
   * Thực hiện một exercise — agent LÀM rồi HỌC:
   * 1. Check unlock (synergy).
   * 2. Cộng XP (performance × trait bonus).
   * 3. Tính synergy tràn sang domain khác.
   * 4. Cập nhật chỉ số phụ (accuracy/speed/creativity).
   */
  public exercise(entityId: string, exercise: SkillExercise): ExerciseResult {
    const profile = this.profileOf(entityId);
    const tree = DOMAIN_TREES[exercise.domain];
    const skill = tree.skills.find((s) => s.id === exercise.skillId);
    if (!skill) throw new RangeError(`Skill "${exercise.skillId}" không tồn tại trong domain "${exercise.domain}"`);

    // Check unlock.
    const unlock = checkUnlock(profile, skill);
    if (!unlock.unlocked) {
      return {
        skillKey: `${exercise.domain}.${exercise.skillId}`,
        xpGained: 0,
        newXp: profile.domainXp.get(exercise.domain) ?? 0,
        tierBefore: tierForXp(profile.domainXp.get(exercise.domain) ?? 0),
        tierAfter: tierForXp(profile.domainXp.get(exercise.domain) ?? 0),
        tierUp: false,
        synergyXp: [],
      };
    }

    const skillKey = `${exercise.domain}.${exercise.skillId}`;
    let skillLevel = profile.skills.get(skillKey);
    if (!skillLevel) {
      skillLevel = { xp: 0, tier: 'novice', accuracy: 0.2, speed: 0.2, creativity: 0.15, exercises: 0 };
      profile.skills.set(skillKey, skillLevel);
    }

    // XP: performance × tier penalty (cấp cao lên chậm).
    const currentTier = tierForXp(skillLevel.xp);
    const tierPenalty = 1 / (1 + tierIndex(currentTier) * 0.5);
    const xpGained = exercise.xpGain ?? Math.round(clamp01(exercise.performance) * 50 * tierPenalty);

    const tierBefore = tierForXp(skillLevel.xp);
    skillLevel.xp += xpGained;
    skillLevel.exercises++;
    const tierAfter = tierForXp(skillLevel.xp);

    // Cập nhật chỉ số phụ — performance tốt → accuracy/speed/creativity tăng.
    const learningSpeed = clampRange(0.05 * (1 - skillLevel.accuracy), 0.01, 0.1);
    skillLevel.accuracy = clamp01(skillLevel.accuracy + (exercise.performance - skillLevel.accuracy) * learningSpeed * 2);
    skillLevel.speed = clamp01(skillLevel.speed + exercise.performance * learningSpeed * 0.8);
    skillLevel.creativity = clamp01(skillLevel.creativity + exercise.performance * 0.3 * learningSpeed * 0.5);

    // Domain XP.
    const domainXp = (profile.domainXp.get(exercise.domain) ?? 0) + xpGained;
    profile.domainXp.set(exercise.domain, domainXp);
    profile.totalExercises++;

    // Synergy tràn.
    const synergyXp: Array<{ domain: DomainId; xp: number }> = [];
    const synergies = DOMAIN_SYNERGY[exercise.domain];
    if (synergies) {
      for (const [otherDomain, factor] of Object.entries(synergies)) {
        const spillXp = Math.round(xpGained * factor);
        if (spillXp > 0) {
          profile.domainXp.set(otherDomain as DomainId, (profile.domainXp.get(otherDomain as DomainId) ?? 0) + spillXp);
          synergyXp.push({ domain: otherDomain as DomainId, xp: spillXp });
        }
      }
    }

    return {
      skillKey,
      xpGained,
      newXp: skillLevel.xp,
      tierBefore,
      tierAfter,
      tierUp: tierBefore !== tierAfter,
      synergyXp,
    };
  }

  /** Cập nhật bộ não domain từ skill levels — vector 8 chiều cho agent thinking. */
  public updateBrain(entityId: string, domain: DomainId): number[] {
    const profile = this.profileOf(entityId);
    const tree = DOMAIN_TREES[domain];
    const vector: number[] = [];
    for (let i = 0; i < 8; i++) {
      const skill = tree.skills[i % tree.skills.length];
      const skillLevel = profile.skills.get(`${domain}.${skill.id}`);
      vector.push(skillLevel ? clamp01(skillLevel.xp / 5000) : 0);
    }
    profile.domainBrains.set(domain, vector);
    return vector;
  }

  /** Tính synergy bonus: domain A đạt tier cao → domain B có hệ số boost. */
  public synergyBonusOf(entityId: string, domain: DomainId): number {
    const profile = this.profileOf(entityId);
    const synergies = DOMAIN_SYNERGY[domain];
    if (!synergies) return 0;
    let bonus = 0;
    for (const [otherDomain, factor] of Object.entries(synergies)) {
      const otherXp = profile.domainXp.get(otherDomain as DomainId) ?? 0;
      bonus += tierIndex(tierForXp(otherXp)) * factor;
    }
    return Math.round(clamp01(bonus) * 100) / 100;
  }

  public stats(): { agents: number; totalExercises: number; grandmasters: number } {
    let totalExercises = 0;
    let grandmasters = 0;
    for (const profile of this.profiles.values()) {
      totalExercises += profile.totalExercises;
      for (const xp of profile.domainXp.values()) {
        if (tierForXp(xp) === 'grandmaster') grandmasters++;
      }
    }
    return { agents: this.profiles.size, totalExercises, grandmasters };
  }
}
