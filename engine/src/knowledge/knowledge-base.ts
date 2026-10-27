/**
 * @file knowledge-base.ts
 * @module @aetheria/engine/knowledge/knowledge-base
 * @description Kho tri thức của nền văn minh: mỗi tri thức là một nút có miền,
 * độ phức tạp, tiên quyết, mức thông thạo của từng cá thể và độ lan truyền xã
 * hội. Hỗ trợ học có giáo viên, dạy lại, quên lãng, khuyến nghị học tiếp và
 * tổng hợp tri thức liên miền.
 */

import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';

/** Miền tri thức. */
export type KnowledgeDomain =
  | 'survival'
  | 'agriculture'
  | 'craft'
  | 'construction'
  | 'medicine'
  | 'warfare'
  | 'philosophy'
  | 'science'
  | 'engineering'
  | 'mathematics'
  | 'navigation'
  | 'metallurgy'
  | 'energy'
  | 'culture'
  | 'governance';

/** Thời đại gắn với tri thức. */
export type KnowledgeEra =
  | 'stone'
  | 'bronze'
  | 'iron'
  | 'medieval'
  | 'renaissance'
  | 'industrial'
  | 'modern'
  | 'enlightened';

/** Thứ tự thời đại. */
export const KNOWLEDGE_ERAS: readonly KnowledgeEra[] = Object.freeze([
  'stone',
  'bronze',
  'iron',
  'medieval',
  'renaissance',
  'industrial',
  'modern',
  'enlightened',
]);

/** Một nút tri thức. */
export interface KnowledgeNode {
  id: string;
  name: string;
  domain: KnowledgeDomain;
  description: string;
  /** Độ phức tạp `[0, 1]`. */
  complexity: number;
  era: KnowledgeEra;
  prerequisites: string[];
  related: string[];
  baseUtility: number;
  discoveredYear?: number;
  discovererId?: string;
  /** Mức thông thạo tốt nhất trong xã hội `[0, 1]`. */
  mastery: number;
  /** Tỉ lệ dân số nắm được `[0, 1]`. */
  diffusion: number;
  /** Mức thông thạo theo từng cá thể. */
  holders: Map<string, number>;
}

/** Đầu vào thêm tri thức. */
export interface KnowledgeInput {
  id: string;
  name: string;
  domain: KnowledgeDomain;
  description?: string;
  complexity?: number;
  era?: KnowledgeEra;
  prerequisites?: string[];
  related?: string[];
  baseUtility?: number;
  discoveredYear?: number;
  discovererId?: string;
}

/** Ảnh chụp tri thức để lưu game. */
export interface KnowledgeSnapshot {
  nodes: Array<Omit<KnowledgeNode, 'holders'> & { holders: Array<[string, number]> }>;
}

/** Kết quả học. */
export interface LearningResult {
  knowledgeId: string;
  entityId: string;
  previousMastery: number;
  mastery: number;
  gained: number;
  prerequisitesMet: boolean;
  detail: string;
}

/** Kết quả dạy. */
export interface TeachingResult {
  knowledgeId: string;
  teacherId: string;
  studentId: string;
  teacherMastery: number;
  studentMastery: number;
  transferred: number;
  detail: string;
}

/** Hồ sơ tri thức của một cá thể. */
export interface KnowledgeProfile {
  entityId: string;
  known: Array<{ id: string; name: string; domain: KnowledgeDomain; mastery: number }>;
  totalMastery: number;
  breadth: number;
  depth: number;
  specialization: KnowledgeDomain | null;
}

/** Kho tri thức dùng chung cho một nền văn minh. */
export class KnowledgeBase {
  public readonly nodes = new Map<string, KnowledgeNode>();
  private readonly random: DeepRandom;
  public year = 0;

  constructor(seed: number | string = 'knowledge') {
    this.random = new DeepRandom(seed);
  }

  /** Số tri thức. */
  public get size(): number {
    return this.nodes.size;
  }

  /** Thêm hoặc cập nhật một nút tri thức. */
  public add(input: KnowledgeInput): KnowledgeNode {
    const existing = this.nodes.get(input.id);
    if (existing) {
      existing.name = input.name || existing.name;
      existing.description = input.description ?? existing.description;
      existing.complexity = clamp01(input.complexity ?? existing.complexity);
      existing.era = input.era ?? existing.era;
      existing.prerequisites = input.prerequisites ? [...input.prerequisites] : existing.prerequisites;
      existing.related = input.related ? [...input.related] : existing.related;
      existing.baseUtility = clamp01(input.baseUtility ?? existing.baseUtility);
      return existing;
    }
    const node: KnowledgeNode = {
      id: input.id,
      name: input.name,
      domain: input.domain,
      description: input.description ?? '',
      complexity: clamp01(input.complexity ?? 0.3),
      era: input.era ?? 'stone',
      prerequisites: [...(input.prerequisites ?? [])],
      related: [...(input.related ?? [])],
      baseUtility: clamp01(input.baseUtility ?? 0.4),
      discoveredYear: input.discoveredYear,
      discovererId: input.discovererId,
      mastery: 0,
      diffusion: 0,
      holders: new Map<string, number>(),
    };
    this.nodes.set(node.id, node);
    for (const relatedId of node.related) {
      const other = this.nodes.get(relatedId);
      if (other && !other.related.includes(node.id)) other.related.push(node.id);
    }
    return node;
  }

  /** Lấy tri thức. */
  public get(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }

  /** Kiểm tra tồn tại. */
  public has(id: string): boolean {
    return this.nodes.has(id);
  }

  /** Toàn bộ tri thức. */
  public all(): KnowledgeNode[] {
    return [...this.nodes.values()];
  }

  /** Tri thức theo miền. */
  public byDomain(domain: KnowledgeDomain): KnowledgeNode[] {
    return this.all().filter((node) => node.domain === domain);
  }

  /** Mức thông thạo của cá thể. */
  public masteryOf(entityId: string, knowledgeId: string): number {
    return clamp01(this.nodes.get(knowledgeId)?.holders.get(entityId) ?? 0);
  }

  /** Gán trực tiếp mức thông thạo (dùng cho khởi tạo nhân vật hoặc di sản). */
  public grant(entityId: string, knowledgeId: string, mastery = 0.5): number {
    const node = this.nodes.get(knowledgeId);
    if (!node) return 0;
    const value = clamp01(mastery);
    node.holders.set(entityId, Math.max(node.holders.get(entityId) ?? 0, value));
    node.mastery = Math.max(node.mastery, value);
    return value;
  }

  /** Các tri thức cá thể đã biết. */
  public knownBy(entityId: string, minMastery = 0.05): KnowledgeNode[] {
    return this.all().filter((node) => (node.holders.get(entityId) ?? 0) >= minMastery);
  }

  /** Mức độ hoàn thành tiên quyết `[0, 1]`. */
  public prerequisiteCoverage(entityId: string, knowledgeId: string): number {
    const node = this.nodes.get(knowledgeId);
    if (!node || node.prerequisites.length === 0) return 1;
    let total = 0;
    for (const prerequisite of node.prerequisites) {
      total += this.masteryOf(entityId, prerequisite);
    }
    return clamp01(total / node.prerequisites.length);
  }

  /**
   * Học một tri thức. Thời gian, năng khiếu, giáo viên và tiên quyết đều ảnh
   * hưởng tới lượng thông thạo nhận được. Trả về kết quả chi tiết.
   */
  public learn(
    entityId: string,
    knowledgeId: string,
    options: {
      aptitude?: number;
      teacherQuality?: number;
      time?: number;
      random?: DeepRandom;
      year?: number;
    } = {},
  ): LearningResult {
    const node = this.nodes.get(knowledgeId);
    if (!node) {
      return {
        knowledgeId,
        entityId,
        previousMastery: 0,
        mastery: 0,
        gained: 0,
        prerequisitesMet: false,
        detail: 'Tri thức không tồn tại',
      };
    }
    const random = options.random ?? this.random;
    const aptitude = clamp01(options.aptitude ?? 0.5);
    const teacher = clamp01(options.teacherQuality ?? 0);
    const time = clampRange(options.time ?? 1, 0, 20);
    const coverage = this.prerequisiteCoverage(entityId, knowledgeId);
    const prerequisitesMet = coverage >= 0.55;
    const difficulty = 0.35 + node.complexity * 1.6;
    const gain =
      ((0.06 + aptitude * 0.45 + teacher * 0.35) * time * (0.35 + coverage * 0.65)) /
      difficulty *
      random.range(0.85, 1.15);
    const previous = this.masteryOf(entityId, knowledgeId);
    const mastery = clamp01(previous + gain);
    node.holders.set(entityId, mastery);
    node.mastery = Math.max(node.mastery, mastery);
    if (mastery > 0.25) {
      node.discoveredYear = node.discoveredYear ?? (options.year ?? this.year);
      node.discovererId = node.discovererId ?? entityId;
    }
    return {
      knowledgeId,
      entityId,
      previousMastery: previous,
      mastery,
      gained: mastery - previous,
      prerequisitesMet,
      detail: prerequisitesMet
        ? `Học ${node.name} đạt ${(mastery * 100).toFixed(0)}%`
        : `Học ${node.name} nhưng còn thiếu nền tảng (${(coverage * 100).toFixed(0)}% tiên quyết)`,
    };
  }

  /** Dạy một tri thức từ người biết sang người chưa biết. */
  public teach(
    teacherId: string,
    studentId: string,
    knowledgeId: string,
    options: { quality?: number; aptitude?: number; time?: number; random?: DeepRandom } = {},
  ): TeachingResult {
    const node = this.nodes.get(knowledgeId);
    const teacherMastery = this.masteryOf(teacherId, knowledgeId);
    if (!node || teacherMastery <= 0) {
      return {
        knowledgeId,
        teacherId,
        studentId,
        teacherMastery,
        studentMastery: this.masteryOf(studentId, knowledgeId),
        transferred: 0,
        detail: 'Giáo viên không có tri thức này',
      };
    }
    const quality = clamp01(options.quality ?? 0.6) * (0.4 + teacherMastery * 0.6);
    const before = this.masteryOf(studentId, knowledgeId);
    const result = this.learn(studentId, knowledgeId, {
      aptitude: options.aptitude ?? 0.5,
      teacherQuality: quality,
      time: options.time ?? 1.5,
      random: options.random,
    });
    return {
      knowledgeId,
      teacherId,
      studentId,
      teacherMastery,
      studentMastery: result.mastery,
      transferred: result.mastery - before,
      detail: `Truyền ${node.name}: ${(result.mastery * 100).toFixed(0)}%`,
    };
  }

  /** Quên dần nếu không luyện tập. */
  public forget(entityId: string, knowledgeId: string, amount = 0.02): number {
    const node = this.nodes.get(knowledgeId);
    if (!node) return 0;
    const before = this.masteryOf(entityId, knowledgeId);
    const after = clamp01(before - Math.max(0, amount));
    if (after <= 0.01) node.holders.delete(entityId);
    else node.holders.set(entityId, after);
    return before - after;
  }

  /** Suy giảm tri thức của toàn bộ cá thể qua thời gian. */
  public decayAll(rate = 0.004): number {
    let total = 0;
    for (const node of this.nodes.values()) {
      for (const [entityId, mastery] of node.holders) {
        const after = clamp01(mastery * (1 - clamp01(rate)));
        if (after <= 0.02) node.holders.delete(entityId);
        else node.holders.set(entityId, after);
        total += mastery - after;
      }
    }
    return total;
  }

  /** Cập nhật độ lan truyền dựa trên dân số và mức thông thạo. */
  public updateDiffusion(population: number): void {
    const denominator = Math.max(1, population);
    for (const node of this.nodes.values()) {
      let weighted = 0;
      for (const mastery of node.holders.values()) weighted += mastery;
      node.diffusion = clamp01(weighted / denominator);
      node.mastery = node.holders.size > 0 ? Math.max(...node.holders.values()) : 0;
    }
  }

  /** Gợi ý tri thức nên học tiếp cho cá thể. */
  public recommend(entityId: string, limit = 5): KnowledgeNode[] {
    return this.all()
      .filter((node) => (node.holders.get(entityId) ?? 0) < 0.9)
      .map((node) => ({
        node,
        score:
          node.baseUtility * (0.4 + this.prerequisiteCoverage(entityId, node.id) * 0.6) -
          (node.holders.get(entityId) ?? 0) * 0.5 +
          (node.diffusion < 0.2 ? 0.2 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, limit))
      .map((entry) => entry.node);
  }

  /** Hồ sơ tri thức của một cá thể. */
  public profileOf(entityId: string): KnowledgeProfile {
    const known = this.knownBy(entityId).map((node) => ({
      id: node.id,
      name: node.name,
      domain: node.domain,
      mastery: node.holders.get(entityId) ?? 0,
    }));
    const totalMastery = known.reduce((sum, node) => sum + node.mastery, 0);
    const breadth = known.length;
    const depth = known.length > 0 ? totalMastery / known.length : 0;
    const byDomain = new Map<KnowledgeDomain, number>();
    for (const node of known) byDomain.set(node.domain, (byDomain.get(node.domain) ?? 0) + node.mastery);
    let specialization: KnowledgeDomain | null = null;
    let best = 0;
    for (const [domain, value] of byDomain) {
      if (value > best) {
        best = value;
        specialization = domain;
      }
    }
    return { entityId, known, totalMastery, breadth, depth, specialization };
  }

  /**
   * Tổng hợp hai tri thức thành một khái niệm mới nếu đủ điều kiện.
   * Đây là cơ chế "sáng tạo" ở mức tri thức, trước khi ResearchEngine tạo ra
   * phát minh cụ thể.
   */
  public synthesize(
    entityId: string,
    aId: string,
    bId: string,
    options: { creativity?: number; seed?: number | string; year?: number } = {},
  ): KnowledgeNode | null {
    const a = this.nodes.get(aId);
    const b = this.nodes.get(bId);
    if (!a || !b || aId === bId) return null;
    const masteryA = this.masteryOf(entityId, aId);
    const masteryB = this.masteryOf(entityId, bId);
    const creativity = clamp01(options.creativity ?? 0.5);
    const threshold = 0.35 + (a.complexity + b.complexity) * 0.25;
    if (masteryA < threshold || masteryB < threshold) return null;
    const random = new DeepRandom(options.seed ?? `${entityId}:${aId}:${bId}`);
    const chance = clamp01((masteryA + masteryB) * 0.25 + creativity * 0.3 - (a.complexity + b.complexity) * 0.15);
    if (!random.chance(chance)) return null;

    const crossDomain = a.domain !== b.domain;
    const id = `synth_${a.id}_${b.id}`;
    const existing = this.nodes.get(id);
    if (existing) {
      const learned = this.learn(entityId, id, { aptitude: creativity, time: 1 });
      return learned.mastery > 0 ? existing : null;
    }
    const eraIndex = Math.max(KNOWLEDGE_ERAS.indexOf(a.era), KNOWLEDGE_ERAS.indexOf(b.era));
    const node = this.add({
      id,
      name: `${a.name} kết hợp ${b.name}`,
      domain: crossDomain ? a.domain : b.domain,
      description: `Tổng hợp từ ${a.name} và ${b.name} bởi ${entityId}.`,
      complexity: clamp01((a.complexity + b.complexity) / 2 + (crossDomain ? 0.08 : 0)),
      era: KNOWLEDGE_ERAS[Math.min(KNOWLEDGE_ERAS.length - 1, eraIndex + (crossDomain ? 1 : 0))],
      prerequisites: [a.id, b.id],
      related: [a.id, b.id],
      baseUtility: clamp01((a.baseUtility + b.baseUtility) / 2 + (crossDomain ? 0.12 : 0.04)),
      discoveredYear: options.year ?? this.year,
      discovererId: entityId,
    });
    node.holders.set(entityId, clamp01(0.3 + creativity * 0.4));
    node.mastery = node.holders.get(entityId) ?? 0;
    return node;
  }

  /** Ảnh chụp. */
  public snapshot(): KnowledgeSnapshot {
    return {
      nodes: this.all().map((node) => ({
        ...node,
        prerequisites: [...node.prerequisites],
        related: [...node.related],
        holders: [...node.holders],
      })),
    };
  }

  /** Khôi phục. */
  public static fromSnapshot(snapshot: KnowledgeSnapshot, seed: number | string = 'knowledge'): KnowledgeBase {
    const base = new KnowledgeBase(seed);
    for (const saved of snapshot.nodes) {
      const node = base.add(saved);
      node.mastery = saved.mastery;
      node.diffusion = saved.diffusion;
      node.holders = new Map(saved.holders);
    }
    return base;
  }
}

/** Miền tri thức mặc định cho một nền văn minh sơ khai. */
export const DEFAULT_KNOWLEDGE: readonly KnowledgeInput[] = Object.freeze([
  { id: 'fire', name: 'Giữ lửa', domain: 'survival', complexity: 0.1, era: 'stone', baseUtility: 0.9, description: 'Ủ lửa qua đêm và dùng lửa để sưởi, nấu, xua thú.' },
  { id: 'stone_tools', name: 'Đồ đá', domain: 'craft', complexity: 0.12, era: 'stone', baseUtility: 0.7, description: 'Ghè đá thành dao, rìu và mũi giáo.' },
  { id: 'foraging', name: 'Hái lượm', domain: 'survival', complexity: 0.08, era: 'stone', baseUtility: 0.8, description: 'Nhận biết cây ăn được, mùa quả và dấu vết thú.' },
  { id: 'hunting', name: 'Săn bắt', domain: 'survival', complexity: 0.2, era: 'stone', prerequisites: ['stone_tools'], baseUtility: 0.75, description: 'Theo dõi, phục kích và chia thịt trong nhóm.' },
  { id: 'shelter_building', name: 'Dựng chỗ trú', domain: 'construction', complexity: 0.18, era: 'stone', prerequisites: ['stone_tools'], baseUtility: 0.7, description: 'Dựng lán từ cành, da và đất.' },
  { id: 'herbalism', name: 'Dược thảo', domain: 'medicine', complexity: 0.25, era: 'stone', baseUtility: 0.65, description: 'Dùng cây cỏ để cầm máu, hạ sốt và giảm đau.' },
  { id: 'oral_tradition', name: 'Truyền khẩu', domain: 'culture', complexity: 0.15, era: 'stone', baseUtility: 0.55, description: 'Kể chuyện, hát và ghi nhớ kinh nghiệm qua lời.' },
  { id: 'agriculture', name: 'Nông nghiệp', domain: 'agriculture', complexity: 0.35, era: 'bronze', prerequisites: ['foraging', 'shelter_building'], baseUtility: 0.95, description: 'Gieo trồng, chọn giống và giữ mùa.' },
  { id: 'animal_husbandry', name: 'Chăn nuôi', domain: 'agriculture', complexity: 0.3, era: 'bronze', prerequisites: ['hunting'], baseUtility: 0.8, description: 'Thuần hoá gia súc, lấy sữa, lông và sức kéo.' },
  { id: 'pottery', name: 'Gốm', domain: 'craft', complexity: 0.28, era: 'bronze', prerequisites: ['fire'], baseUtility: 0.65, description: 'Nặn và nung đất thành bình chứa.' },
  { id: 'weaving', name: 'Dệt vải', domain: 'craft', complexity: 0.3, era: 'bronze', baseUtility: 0.6, description: 'Xe sợi, dệt vải và may mặc.' },
  { id: 'bronze_working', name: 'Luyện đồng', domain: 'metallurgy', complexity: 0.45, era: 'bronze', prerequisites: ['fire', 'pottery'], baseUtility: 0.85, description: 'Nấu quặng đồng, đúc công cụ và vũ khí.' },
  { id: 'writing', name: 'Chữ viết', domain: 'culture', complexity: 0.5, era: 'bronze', prerequisites: ['oral_tradition'], baseUtility: 0.9, description: 'Ký hiệu ghi lại số đếm, giao ước và truyện.' },
  { id: 'mathematics', name: 'Số học', domain: 'mathematics', complexity: 0.45, era: 'bronze', prerequisites: ['writing'], baseUtility: 0.85, description: 'Đếm, đo đạc và tính toán mùa vụ.' },
  { id: 'irrigation', name: 'Thuỷ lợi', domain: 'agriculture', complexity: 0.5, era: 'iron', prerequisites: ['agriculture', 'mathematics'], baseUtility: 0.9, description: 'Dẫn nước, đắp đê và tưới ruộng.' },
  { id: 'iron_working', name: 'Luyện sắt', domain: 'metallurgy', complexity: 0.55, era: 'iron', prerequisites: ['bronze_working'], baseUtility: 0.9, description: 'Rèn sắt thành lưỡi cày, đinh và gươm.' },
  { id: 'medicine', name: 'Y học', domain: 'medicine', complexity: 0.55, era: 'iron', prerequisites: ['herbalism', 'writing'], baseUtility: 0.9, description: 'Chẩn đoán, phẫu thuật đơn giản và cách ly người bệnh.' },
  { id: 'philosophy', name: 'Triết học', domain: 'philosophy', complexity: 0.6, era: 'iron', prerequisites: ['writing'], baseUtility: 0.7, description: 'Đặt câu hỏi về đạo đức, nhà nước và tri thức.' },
  { id: 'law', name: 'Luật pháp', domain: 'governance', complexity: 0.5, era: 'iron', prerequisites: ['writing'], baseUtility: 0.85, description: 'Quy tắc chung, toà án và hình phạt.' },
  { id: 'navigation', name: 'Hàng hải', domain: 'navigation', complexity: 0.55, era: 'medieval', prerequisites: ['mathematics'], baseUtility: 0.8, description: 'Đọc sao, hải đồ và hướng gió.' },
  { id: 'architecture', name: 'Kiến trúc', domain: 'construction', complexity: 0.6, era: 'medieval', prerequisites: ['mathematics', 'stone_tools'], baseUtility: 0.85, description: 'Vòm, tường chịu lực và quy hoạch đô thị.' },
  { id: 'printing', name: 'In ấn', domain: 'culture', complexity: 0.65, era: 'renaissance', prerequisites: ['writing', 'mathematics'], baseUtility: 0.95, description: 'Nhân bản tri thức với chi phí thấp.' },
  { id: 'anatomy', name: 'Giải phẫu', domain: 'medicine', complexity: 0.7, era: 'renaissance', prerequisites: ['medicine'], baseUtility: 0.85, description: 'Hiểu cơ thể qua quan sát và mổ xẻ.' },
  { id: 'scientific_method', name: 'Phương pháp khoa học', domain: 'science', complexity: 0.7, era: 'renaissance', prerequisites: ['philosophy', 'mathematics'], baseUtility: 1, description: 'Giả thuyết, thực nghiệm, kiểm chứng và lặp lại.' },
  { id: 'steam_power', name: 'Động cơ hơi nước', domain: 'engineering', complexity: 0.8, era: 'industrial', prerequisites: ['scientific_method', 'iron_working'], baseUtility: 1, description: 'Biến nhiệt thành chuyển động có ích.' },
  { id: 'sanitation', name: 'Vệ sinh công cộng', domain: 'medicine', complexity: 0.65, era: 'industrial', prerequisites: ['medicine', 'architecture'], baseUtility: 0.95, description: 'Nước sạch, cống rãnh và kiểm soát dịch.' },
  { id: 'electricity', name: 'Điện học', domain: 'energy', complexity: 0.85, era: 'industrial', prerequisites: ['scientific_method'], baseUtility: 1, description: 'Dòng điện, mạch và máy phát.' },
  { id: 'evolution', name: 'Tiến hoá', domain: 'science', complexity: 0.8, era: 'modern', prerequisites: ['scientific_method'], baseUtility: 0.8, description: 'Chọn lọc tự nhiên và lịch sử sự sống.' },
  { id: 'germ_theory', name: 'Thuyết vi trùng', domain: 'medicine', complexity: 0.8, era: 'modern', prerequisites: ['scientific_method', 'anatomy'], baseUtility: 1, description: 'Mầm bệnh là nguyên nhân nhiều bệnh truyền nhiễm.' },
  { id: 'computing', name: 'Tính toán', domain: 'engineering', complexity: 0.9, era: 'modern', prerequisites: ['mathematics', 'electricity'], baseUtility: 1, description: 'Máy móc xử lý ký hiệu và tự động hoá.' },
  { id: 'democracy', name: 'Dân chủ', domain: 'governance', complexity: 0.75, era: 'modern', prerequisites: ['philosophy', 'law'], baseUtility: 0.9, description: 'Quyền lực dựa trên ý chí đa số và luật chung.' },
  { id: 'human_rights', name: 'Nhân quyền', domain: 'governance', complexity: 0.8, era: 'modern', prerequisites: ['philosophy', 'law'], baseUtility: 0.95, description: 'Quyền bất khả xâm phạm của mỗi người.' },
  { id: 'ecology', name: 'Sinh thái học', domain: 'science', complexity: 0.85, era: 'modern', prerequisites: ['evolution'], baseUtility: 0.9, description: 'Quan hệ giữa sinh vật và môi trường.' },
  { id: 'renewable_energy', name: 'Năng lượng tái tạo', domain: 'energy', complexity: 0.9, era: 'enlightened', prerequisites: ['electricity', 'ecology'], baseUtility: 1, description: 'Thu năng lượng mặt trời, gió và nước bền vững.' },
  { id: 'artificial_intelligence', name: 'Trí tuệ nhân tạo', domain: 'engineering', complexity: 1, era: 'enlightened', prerequisites: ['computing', 'scientific_method'], baseUtility: 1, description: 'Máy học từ dữ liệu và hỗ trợ quyết định.' },
  { id: 'medicine_preventive', name: 'Y học dự phòng', domain: 'medicine', complexity: 0.85, era: 'enlightened', prerequisites: ['germ_theory', 'sanitation'], baseUtility: 1, description: 'Tiêm chủng, tầm soát và chăm sóc sức khoẻ cộng đồng.' },
  { id: 'education_for_all', name: 'Giáo dục phổ cập', domain: 'governance', complexity: 0.8, era: 'enlightened', prerequisites: ['printing', 'human_rights'], baseUtility: 1, description: 'Mọi trẻ em đều được học đọc, viết và tính toán.' },
]);

/** Tạo kho tri thức với các nút mặc định. */
export function createKnowledgeBase(
  seed: number | string = 'knowledge',
  entries: readonly KnowledgeInput[] = DEFAULT_KNOWLEDGE,
): KnowledgeBase {
  const base = new KnowledgeBase(seed);
  for (const entry of entries) base.add(entry);
  return base;
}
