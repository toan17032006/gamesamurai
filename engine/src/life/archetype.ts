/**
 * @file archetype.ts
 * @module @aetheria/engine/life/archetype
 * @description Nghiệp chủng (archetype): định dạng lớp tồn tại của một thực thể
 * — loài nền (người, động vật, quái thú, quái vật, quái nhân, undead, construct) × nghề nghiệp (kiếm sĩ, kỹ sư, lái buôn, pháp sư…) × khả năng
 * ma thuật (có/không phép). Mỗi archetype quyết định kênh học tập khả dụng:
 * pháp sư học phép từ tri thức arcane, kiếm sĩ luyện kỹ năng chiến, kỹ sư sáng
 * chế máy móc, động vật chỉ học qua bản năng + điều kiện hoá, quái vật học bằng
 * bản năng hoang dã và hút kinh nghiệm từ con mồi.
 */

import { LifeRandom } from './stochastic.js';
import { clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

/** Loài nền của thực thể. */
export type BeingSpecies =
  | 'human'
  | 'animal'
  | 'beast'
  | 'monster'
  | 'halfBeast'
  | 'undead'
  | 'construct';

/** Nhóm nghề nghiệp — 0 = không nghề (thú hoang, quái hoang). */
export type ProfessionCategory =
  | 'none'
  | 'warrior'
  | 'artisan'
  | 'merchant'
  | 'scholar'
  | 'healer'
  | 'ranger'
  | 'mage'
  | 'priest'
  | 'thief';

/** Kênh học tập khả dụng của một archetype. */
export type LearningChannel =
  | 'instinct' // bản năng: tự động có, không học
  | 'conditioning' // điều kiện hoá: thưởng/phạt lặp lại (động vật)
  | 'imitation' // bắt chước quan sát
  | 'mentorship' // thầy trò truyền dạy
  | 'study' // đọc/nghiên cứu tài liệu
  | 'experiment' // tự thử nghiệm mò mẫm
  | 'arcane_study' // nghiên cứu ma thuật
  | 'soul_absorption'; // hút kinh nghiệm từ con mồi (quái vật)

/** Hồ sơ một archetype. */
export interface Archetype {
  id: string;
  name: string;
  species: BeingSpecies;
  profession: ProfessionCategory;
  /** Có nhánh ma thuật không. */
  hasMagic: boolean;
  /** Cấp ma thuật tối đa có thể đạt (0 = không phép). */
  magicCap: number;
  /** Kênh học tập khả dụng theo thứ tự ưu tiên. */
  learningChannels: readonly LearningChannel[];
  /** Hệ số thuộc các thuộc tính nền `[0, 2]`. */
  statModifiers: {
    strength: number;
    agility: number;
    intellect: number;
    vitality: number;
    magicAffinity: number;
    sociality: number;
  };
  /** Tuổi thọ nền (năm). */
  baseLongevity: number;
  /** Kỹ năng khởi đầu (id → mastery). */
  startingSkills: Record<string, number>;
  /** Tri thức khởi đầu (id → mastery). */
  startingKnowledge: Record<string, number>;
  note: string;
}

const ARCHETYPE_LIST: Archetype[] = [
  {
    id: 'human_villager',
    name: 'Dân làng',
    species: 'human',
    profession: 'none',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['imitation', 'mentorship', 'study', 'experiment', 'conditioning'],
    statModifiers: { strength: 1, agility: 1, intellect: 1, vitality: 1, magicAffinity: 0.3, sociality: 1 },
    baseLongevity: 72,
    startingSkills: { farming: 0.3, foraging: 0.2 },
    startingKnowledge: { folk_lore: 0.2 },
    note: 'người thường, có thể học bất cứ nghề nào nếu kiên trì',
  },
  {
    id: 'human_swordsman',
    name: 'Kiếm sĩ',
    species: 'human',
    profession: 'warrior',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['mentorship', 'imitation', 'conditioning', 'experiment'],
    statModifiers: { strength: 1.4, agility: 1.2, intellect: 0.9, vitality: 1.2, magicAffinity: 0.1, sociality: 0.8 },
    baseLongevity: 68,
    startingSkills: { swordsmanship: 0.4, combat_tactics: 0.25 },
    startingKnowledge: { anatomy: 0.3 },
    note: 'không dùng phép — sức mạnh nằm ở lưỡi kiếm và thể chất',
  },
  {
    id: 'human_engineer',
    name: 'Kỹ sư',
    species: 'human',
    profession: 'artisan',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['study', 'experiment', 'mentorship', 'imitation'],
    statModifiers: { strength: 0.9, agility: 0.9, intellect: 1.5, vitality: 1, magicAffinity: 0.2, sociality: 1 },
    baseLongevity: 74,
    startingSkills: { crafting: 0.4, machine_operation: 0.3 },
    startingKnowledge: { mechanics: 0.4, herbology: 0.1 },
    note: 'sáng chế máy móc từ bản vẽ và thí nghiệm, không cần phép',
  },
  {
    id: 'human_merchant',
    name: 'Lái buôn',
    species: 'human',
    profession: 'merchant',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['imitation', 'mentorship', 'study', 'experiment'],
    statModifiers: { strength: 0.9, agility: 1, intellect: 1.2, vitality: 1, magicAffinity: 0.2, sociality: 1.5 },
    baseLongevity: 70,
    startingSkills: { haggling: 0.45, geography: 0.25 },
    startingKnowledge: { trade_routes: 0.35, folk_lore: 0.2 },
    note: 'tri thức lan theo đoàn buôn — truyền tri thức giữa các làng',
  },
  {
    id: 'human_mage',
    name: 'Pháp sư',
    species: 'human',
    profession: 'mage',
    hasMagic: true,
    magicCap: 10,
    learningChannels: ['arcane_study', 'mentorship', 'study', 'experiment'],
    statModifiers: { strength: 0.7, agility: 0.9, intellect: 1.6, vitality: 0.8, magicAffinity: 1.8, sociality: 0.9 },
    baseLongevity: 82,
    startingSkills: { mana_channeling: 0.3 },
    startingKnowledge: { arcane_theory: 0.4, arcane_medicine: 0.15 },
    note: 'học phép bằng nghiên cứu arcane + truyền nghề trong hội pháp sư',
  },
  {
    id: 'human_healer',
    name: 'Thầy thuốc',
    species: 'human',
    profession: 'healer',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['mentorship', 'study', 'experiment', 'imitation'],
    statModifiers: { strength: 0.8, agility: 1, intellect: 1.4, vitality: 1, magicAffinity: 0.4, sociality: 1.2 },
    baseLongevity: 76,
    startingSkills: { herbal_fever: 0.35 },
    startingKnowledge: { herbology: 0.5, anatomy: 0.4 },
    note: 'chữa được số bệnh mình đã học, còn lại phải nghiên cứu thêm',
  },
  {
    id: 'animal_wolf',
    name: 'Sói hoang',
    species: 'animal',
    profession: 'none',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['instinct', 'conditioning', 'imitation'],
    statModifiers: { strength: 1.2, agility: 1.4, intellect: 0.5, vitality: 1.2, magicAffinity: 0, sociality: 1.1 },
    baseLongevity: 14,
    startingSkills: { hunting: 0.6, pack_tactics: 0.4 },
    startingKnowledge: {},
    note: 'học qua bản năng + điều kiện hoá, không đọc không nghiên cứu',
  },
  {
    id: 'beast_dire_bear',
    name: 'Gấu tông khổng lồ',
    species: 'beast',
    profession: 'none',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['instinct', 'conditioning'],
    statModifiers: { strength: 1.9, agility: 0.7, intellect: 0.4, vitality: 1.7, magicAffinity: 0, sociality: 0.4 },
    baseLongevity: 32,
    startingSkills: { mauling: 0.6, foraging: 0.5 },
    startingKnowledge: {},
    note: 'sức mạnh thuần tuý, gần như không học được gì mới',
  },
  {
    id: 'monster_goblin_shaman',
    name: 'Ca shaman Goblin',
    species: 'monster',
    profession: 'mage',
    hasMagic: true,
    magicCap: 4,
    learningChannels: ['instinct', 'imitation', 'soul_absorption', 'experiment'],
    statModifiers: { strength: 0.8, agility: 1.3, intellect: 1, vitality: 0.9, magicAffinity: 1.2, sociality: 1 },
    baseLongevity: 40,
    startingSkills: { hex_bolt: 0.3, tribal_medicine: 0.2 },
    startingKnowledge: { arcane_theory: 0.2 },
    note: 'quái vật có phép: học bằng hút kinh nghiệm linh hồn con mồi',
  },
  {
    id: 'monster_wraith',
    name: 'Oán linh',
    species: 'monster',
    profession: 'none',
    hasMagic: true,
    magicCap: 7,
    learningChannels: ['instinct', 'soul_absorption'],
    statModifiers: { strength: 0.5, agility: 1.6, intellect: 1.1, vitality: 0.6, magicAffinity: 1.6, sociality: 0.1 },
    baseLongevity: 200,
    startingSkills: { fear_aura: 0.5, life_drain: 0.4 },
    startingKnowledge: {},
    note: 'không có phép học mới — chỉ lớn theo số linh hồn đã hút',
  },
  {
    id: 'halfbeast_lynx_folk',
    name: 'Miêu nhân thợ săn',
    species: 'halfBeast',
    profession: 'ranger',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['instinct', 'imitation', 'mentorship', 'experiment'],
    statModifiers: { strength: 1.1, agility: 1.6, intellect: 1, vitality: 1.1, magicAffinity: 0.6, sociality: 0.9 },
    baseLongevity: 55,
    startingSkills: { tracking: 0.5, archery: 0.35 },
    startingKnowledge: { folk_lore: 0.15 },
    note: 'nửa người nửa thú: giữ bản năng + học được nghề như người',
  },
  {
    id: 'undead_revenant_knight',
    name: 'Hiệp sĩ trả về',
    species: 'undead',
    profession: 'warrior',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['instinct', 'imitation', 'soul_absorption'],
    statModifiers: { strength: 1.5, agility: 0.9, intellect: 0.8, vitality: 1.3, magicAffinity: 0.5, sociality: 0.3 },
    baseLongevity: 150,
    startingSkills: { swordsmanship: 0.5, combat_tactics: 0.3 },
    startingKnowledge: { anatomy: 0.2 },
    note: 'kỹ năng cũ còn trong xương, học chậm và chỉ qua ám ảnh ký ức',
  },
  {
    id: 'construct_automaton',
    name: 'Cỗ máy tự động',
    species: 'construct',
    profession: 'artisan',
    hasMagic: false,
    magicCap: 0,
    learningChannels: ['conditioning', 'imitation'],
    statModifiers: { strength: 1.7, agility: 0.6, intellect: 1.2, vitality: 1.8, magicAffinity: 0, sociality: 0.2 },
    baseLongevity: 300,
    startingSkills: { machine_operation: 0.6 },
    startingKnowledge: { mechanics: 0.5 },
    note: 'không tự học — chỉ chạy đúng chương trình và học từ dữ liệu nạp vào',
  },
];

/** Danh sách archetype dựng sẵn đại diện cho từng nhóm trong thế giới. */
export const DEFAULT_ARCHETYPES: readonly Archetype[] = Object.freeze(ARCHETYPE_LIST);

/** Xác định kênh học được phép dùng cho một loại nội dung. */
export type LearningTopic = 'skill' | 'spell' | 'knowledge' | 'craft' | 'medicine' | 'survival';

/** Kiểm tra một archetype có thể học một loại nội dung qua kênh nào. */
export function learningPathFor(archetype: Archetype, topic: LearningTopic): LearningChannel[] {
  const viable = archetype.learningChannels;
  switch (topic) {
    case 'spell':
      // Không có phép thì không học được phép — bất kể cố gắng.
      if (!archetype.hasMagic) return [];
      return viable.filter((c) => c !== 'instinct' && c !== 'conditioning');
    case 'knowledge':
      return viable.filter((c) => ['study', 'experiment', 'mentorship', 'imitation', 'soul_absorption'].includes(c));
    case 'medicine':
      return viable.filter((c) => ['study', 'experiment', 'mentorship', 'imitation'].includes(c));
    case 'craft':
      return viable.filter((c) => ['study', 'experiment', 'mentorship', 'imitation', 'conditioning'].includes(c));
    case 'skill':
    case 'survival':
    default:
      return [...viable];
  }
}

/** Khả năng học tối đa của archetype với một loại nội dung `[0, 1]`. */
export function learningCeiling(archetype: Archetype, topic: LearningTopic): number {
  const path = learningPathFor(archetype, topic);
  if (path.length === 0) return 0;
  const base = path.includes('study') || path.includes('arcane_study') ? 0.95 : 0.8;
  const instinctPenalty = path.every((c) => c === 'instinct' || c === 'conditioning') ? 0.35 : 0;
  return clamp01(base - instinctPenalty);
}

/** Trạng thái nghiệp chủng gắn với một thực thể đang sống. */
export interface ArchetypeState {
  archetypeId: string;
  entityId: string;
  /** Cấp ma thuật hiện tại (0 nếu không phép). */
  magicLevel: number;
  /** Kinh nghiệm tích luỹ theo kênh học. */
  channelXp: Record<string, number>;
  /** Số lần học mỗi topic (thành công + thất bại). */
  topicAttempts: Record<string, number>;
}

/**
 * Học một nội dung qua archetype: trả về kết quả học theo kênh phù hợp nhất.
 * Kiếm sĩ học phép → cứng nhắc trả thất bại kèm lý do; động vật học skill qua
 * điều kiện hoá cần lặp nhiều; quái vật hút kinh nghiệm từ con mồi.
 */
export function archetypeLearn(
  state: ArchetypeState,
  archetype: Archetype,
  topic: LearningTopic,
  options: {
    random?: LifeRandom;
    /** Chất lượng dạy/nguồn học `[0, 1]`. */
    quality?: number;
    /** Kinh nghiệm con mồi (chỉ cho soul_absorption). */
    preyXp?: number;
    /** Số lần lặp trong lần gọi (điều kiện hoá). */
    repetitions?: number;
  } = {},
): { learned: boolean; channel: LearningChannel | null; gain: number; note: string } {
  const random = options.random ?? new LifeRandom(`${state.entityId}:${topic}:${state.topicAttempts[topic] ?? 0}`);
  const path = learningPathFor(archetype, topic);
  state.topicAttempts[topic] = (state.topicAttempts[topic] ?? 0) + 1;

  if (path.length === 0) {
    const reason =
      topic === 'spell'
        ? `${archetype.name} thuộc lớp không có phép (${archetype.profession}) — không thể học phép dù thử bao nhiêu lần`
        : `${archetype.name} không có kênh học phù hợp cho ${topic}`;
    return { learned: false, channel: null, gain: 0, note: reason };
  }

  const quality = clamp01(options.quality ?? 0.5);
  const ceiling = learningCeiling(archetype, topic);

  // Chọn kênh hiệu quả nhất mà archetype có.
  const priority: LearningChannel[] = ['arcane_study', 'study', 'mentorship', 'experiment', 'imitation', 'soul_absorption', 'conditioning', 'instinct'];
  const channel = path.sort((a, b) => priority.indexOf(a) - priority.indexOf(b))[0];

  let gain = 0;
  let note = '';
  switch (channel) {
    case 'instinct':
      gain = 0;
      note = 'bản năng sẵn có — không cần học';
      break;
    case 'conditioning': {
      const reps = clampRange(Math.floor(options.repetitions ?? 5), 1, 200);
      gain = clampRange((0.02 * reps * quality) / (1 + (state.channelXp[channel] ?? 0) * 0.5), 0, 0.2);
      note = `điều kiện hoá qua ${reps} lần lặp thưởng/phạt`;
      break;
    }
    case 'soul_absorption': {
      const preyXp = Math.max(0, options.preyXp ?? 0);
      gain = clampRange(preyXp * 0.01 * archetype.statModifiers.magicAffinity, 0, 0.25);
      note = `hút ${preyXp.toFixed(1)} xp linh hồn từ con mồi`;
      break;
    }
    case 'imitation':
      gain = clampRange(quality * 0.12 * archetype.statModifiers.sociality, 0, 0.2);
      note = 'quan sát và bắt chước';
      break;
    case 'mentorship':
      gain = clampRange(quality * 0.18 * archetype.statModifiers.intellect, 0, 0.3);
      note = 'được thầy truyền dạy trực tiếp';
      break;
    case 'study':
      gain = clampRange(quality * 0.15 * archetype.statModifiers.intellect, 0, 0.25);
      note = 'tự đọc và nghiên cứu tài liệu';
      break;
    case 'arcane_study':
      gain = clampRange(quality * 0.15 * archetype.statModifiers.magicAffinity, 0, 0.28);
      note = 'thẩm đúc dòng ma lực qua lý thuyết arcane';
      break;
    case 'experiment':
      gain = clampRange(quality * 0.1 * (archetype.statModifiers.intellect + archetype.statModifiers.sociality) * 0.5, 0, 0.18);
      note = 'mày mò thử nghiệm tự rút kinh nghiệm';
      break;
  }

  // Trần học: đã chạm trần thì không tăng thêm.
  const currentXp = state.channelXp[channel] ?? 0;
  const effectiveGain = currentXp >= ceiling ? 0 : Math.min(gain, ceiling - currentXp);
  state.channelXp[channel] = clamp01(currentXp + effectiveGain);

  if (effectiveGain <= 0.0001 && gain > 0) {
    return { learned: false, channel, gain: 0, note: `${note} — đã chạm trần học tập ${ceiling.toFixed(2)}` };
  }
  return { learned: effectiveGain > 0, channel, gain: effectiveGain, note };
}

/** Chọn archetype phù hợp tự động từ đặc điểm bộ gen + loại sinh vật. */
export function suggestArchetype(
  species: BeingSpecies,
  traits: Record<string, number>,
  options: { random?: LifeRandom; allowMagic?: boolean } = {},
): Archetype {
  const random = options.random ?? new LifeRandom(`archetype:${species}`);
  const pool = DEFAULT_ARCHETYPES.filter((a) => {
    if (a.species !== species) return false;
    if (!options.allowMagic && a.hasMagic) return false;
    return true;
  });
  if (pool.length === 0) return DEFAULT_ARCHETYPES[0];

  // Chấm điểm theo trait tương ứng statModifiers.
  const scored = pool.map((archetype) => {
    let score = 0;
    score += (traits.strength ?? 50) / 100 * archetype.statModifiers.strength;
    score += (traits.intelligence ?? 50) / 200 * archetype.statModifiers.intellect;
    score += (traits.curiosity ?? 50) / 100 * (archetype.learningChannels.includes('experiment') ? 0.5 : 0.2);
    score += (traits.sociability ?? 50) / 100 * archetype.statModifiers.sociality;
    score += (traits.creativity ?? 50) / 100 * (archetype.learningChannels.includes('experiment') ? 0.4 : 0.1);
    return { archetype, score: score + random.next() * 0.15 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].archetype;
}

/** Lấy archetype theo id; không thấy trả dân làng. */
export function archetypeById(id: string): Archetype {
  return DEFAULT_ARCHETYPES.find((a) => a.id === id) ?? DEFAULT_ARCHETYPES[0];
}

/** Khởi tạo trạng thái archetype cho một thực thể mới. */
export function createArchetypeState(entityId: string, archetype: Archetype): ArchetypeState {
  return {
    archetypeId: archetype.id,
    entityId,
    magicLevel: archetype.hasMagic ? 1 : 0,
    channelXp: {},
    topicAttempts: {},
  };
}

/** Băm id ổn định (tiện dụng cho việc ánh xạ archetype vào genome). */
export function archetypeSeed(entityId: string): number {
  return hashSeed(`archetype:${entityId}`);
}
