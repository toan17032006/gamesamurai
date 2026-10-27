/**
 * @file tech-tree.ts
 * @module @aetheria/engine/knowledge/tech-tree
 * @description Cây công nghệ có tiên quyết, chi phí nghiên cứu, thời đại và
 * phần thưởng mở khoá. Việc nghiên cứu tiêu hao điểm theo từng bước; chỉ khi
 * đủ chi phí và đủ tri thức nền thì công nghệ mới được mở.
 */

import { clamp01, clampRange } from '../deeplearning/random.js';
import { KNOWLEDGE_ERAS, type KnowledgeDomain, type KnowledgeEra } from './knowledge-base.js';

/** Một công nghệ trong cây. */
export interface TechnologyNode {
  id: string;
  name: string;
  domain: KnowledgeDomain;
  era: KnowledgeEra;
  description: string;
  /** Công nghệ phải có trước. */
  prerequisites: string[];
  /** Tri thức cá nhân/nền văn minh cần đạt. */
  requiredKnowledge: Array<{ id: string; mastery: number }>;
  /** Chi phí điểm nghiên cứu. */
  cost: number;
  /** Giá trị kinh tế – xã hội `[0, 1]`. */
  utility: number;
  /** Công nghệ được mở khoá kèm theo. */
  unlocks: string[];
}

/** Kết quả đầu tư nghiên cứu. */
export interface ResearchInvestment {
  technologyId: string;
  progress: number;
  required: number;
  unlocked: boolean;
  era: KnowledgeEra;
  detail: string;
}

/** Ảnh chụp cây công nghệ. */
export interface TechTreeSnapshot {
  known: string[];
  progress: Array<[string, number]>;
}

/** Cây công nghệ. */
export class TechTree {
  public readonly nodes = new Map<string, TechnologyNode>();
  public readonly known = new Set<string>();
  public readonly progress = new Map<string, number>();

  constructor(nodes: readonly TechnologyNode[] = DEFAULT_TECH_TREE) {
    for (const node of nodes) this.nodes.set(node.id, node);
  }

  /** Số công nghệ đã biết. */
  public get knownCount(): number {
    return this.known.size;
  }

  /** Lấy nút. */
  public get(id: string): TechnologyNode | undefined {
    return this.nodes.get(id);
  }

  /** Đã biết công nghệ chưa. */
  public has(id: string): boolean {
    return this.known.has(id);
  }

  /** Các công nghệ có thể nghiên cứu ngay. */
  public available(): TechnologyNode[] {
    return [...this.nodes.values()].filter(
      (node) => !this.known.has(node.id) && node.prerequisites.every((prerequisite) => this.known.has(prerequisite)),
    );
  }

  /** Kiểm tra tiên quyết công nghệ. */
  public canResearch(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node || this.known.has(id)) return false;
    return node.prerequisites.every((prerequisite) => this.known.has(prerequisite));
  }

  /**
   * Đầu tư điểm nghiên cứu vào một công nghệ.
   * `knowledgeMastery` là hàm tra mức thông thạo tri thức của người nghiên cứu.
   */
  public invest(
    id: string,
    points: number,
    knowledgeMastery: (knowledgeId: string) => number = () => 1,
  ): ResearchInvestment {
    const node = this.nodes.get(id);
    if (!node) {
      return { technologyId: id, progress: 0, required: 1, unlocked: false, era: 'stone', detail: 'Công nghệ không tồn tại' };
    }
    if (this.known.has(id)) {
      return {
        technologyId: id,
        progress: node.cost,
        required: node.cost,
        unlocked: true,
        era: node.era,
        detail: `${node.name} đã được biết`,
      };
    }
    if (!node.prerequisites.every((prerequisite) => this.known.has(prerequisite))) {
      return {
        technologyId: id,
        progress: this.progress.get(id) ?? 0,
        required: node.cost,
        unlocked: false,
        era: node.era,
        detail: `Thiếu tiên quyết cho ${node.name}`,
      };
    }

    let knowledgeFactor = 1;
    if (node.requiredKnowledge.length > 0) {
      let total = 0;
      for (const requirement of node.requiredKnowledge) {
        total += clamp01(knowledgeMastery(requirement.id) / Math.max(0.01, requirement.mastery));
      }
      knowledgeFactor = clamp01(total / node.requiredKnowledge.length);
    }

    const effective = Math.max(0, points) * (0.25 + knowledgeFactor * 0.75);
    const progress = clampRange((this.progress.get(id) ?? 0) + effective, 0, node.cost);
    this.progress.set(id, progress);
    const unlocked = progress >= node.cost;
    if (unlocked) {
      this.known.add(id);
      for (const unlock of node.unlocks) this.known.add(unlock);
    }
    return {
      technologyId: id,
      progress,
      required: node.cost,
      unlocked,
      era: node.era,
      detail: unlocked
        ? `Mở khoá ${node.name}`
        : `Nghiên cứu ${node.name}: ${((progress / node.cost) * 100).toFixed(0)}%`,
    };
  }

  /** Mở khoá trực tiếp (dùng cho di sản tri thức hoặc sự kiện). */
  public unlock(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    this.known.add(id);
    this.progress.set(id, node.cost);
    for (const unlock of node.unlocks) this.known.add(unlock);
    return true;
  }

  /** Đường nghiên cứu tối thiểu tới một công nghệ (BFS trên tiên quyết). */
  public pathTo(id: string): string[] {
    if (this.known.has(id)) return [];
    const queue: Array<{ id: string; path: string[] }> = [{ id, path: [id] }];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      const node = this.nodes.get(current.id);
      if (!node) continue;
      const missing = node.prerequisites.filter((prerequisite) => !this.known.has(prerequisite));
      if (missing.length === 0) return [...current.path].reverse();
      for (const prerequisite of missing) {
        if (visited.has(prerequisite)) continue;
        visited.add(prerequisite);
        queue.push({ id: prerequisite, path: [...current.path, prerequisite] });
      }
    }
    return [];
  }

  /** Thời đại hiện tại = thời đại cao nhất đã có ít nhất một công nghệ. */
  public currentEra(): KnowledgeEra {
    let highest = 0;
    for (const id of this.known) {
      const node = this.nodes.get(id);
      if (!node) continue;
      highest = Math.max(highest, KNOWLEDGE_ERAS.indexOf(node.era));
    }
    return KNOWLEDGE_ERAS[highest];
  }

  /** Bao nhiêu công nghệ của một thời đại đã biết. */
  public eraCompletion(era: KnowledgeEra): number {
    const nodes = [...this.nodes.values()].filter((node) => node.era === era);
    if (nodes.length === 0) return 1;
    return clamp01(nodes.filter((node) => this.known.has(node.id)).length / nodes.length);
  }

  /** Tổng hợp tiến trình theo thời đại. */
  public eraProgress(): Record<KnowledgeEra, number> {
    const result = {} as Record<KnowledgeEra, number>;
    for (const era of KNOWLEDGE_ERAS) result[era] = this.eraCompletion(era);
    return result;
  }

  /** Các công nghệ sẵn sàng, sắp xếp theo giá trị/chi phí. */
  public bestResearchTargets(limit = 3): TechnologyNode[] {
    return this.available()
      .map((node) => ({ node, score: node.utility / Math.max(1, node.cost) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, limit))
      .map((entry) => entry.node);
  }

  /** Tỉ lệ công nghệ đã biết trên tổng. */
  public overallProgress(): number {
    return this.nodes.size > 0 ? clamp01(this.known.size / this.nodes.size) : 0;
  }

  /** Ảnh chụp. */
  public snapshot(): TechTreeSnapshot {
    return { known: [...this.known], progress: [...this.progress] };
  }

  /** Khôi phục. */
  public static fromSnapshot(
    snapshot: TechTreeSnapshot,
    nodes: readonly TechnologyNode[] = DEFAULT_TECH_TREE,
  ): TechTree {
    const tree = new TechTree(nodes);
    for (const id of snapshot.known) tree.known.add(id);
    for (const [id, value] of snapshot.progress) tree.progress.set(id, value);
    return tree;
  }
}

/** Cây công nghệ mặc định từ đồ đá tới khai sáng. */
export const DEFAULT_TECH_TREE: readonly TechnologyNode[] = Object.freeze([
  {
    id: 'fire_control',
    name: 'Kiểm soát lửa',
    domain: 'survival',
    era: 'stone',
    description: 'Giữ lửa, sưởi ấm và nấu chín thức ăn.',
    prerequisites: [],
    requiredKnowledge: [{ id: 'fire', mastery: 0.5 }],
    cost: 8,
    utility: 0.9,
    unlocks: [],
  },
  {
    id: 'stone_knapping',
    name: 'Ghè đá',
    domain: 'craft',
    era: 'stone',
    description: 'Chế tạo dao, rìu và mũi giáo từ đá.',
    prerequisites: [],
    requiredKnowledge: [{ id: 'stone_tools', mastery: 0.5 }],
    cost: 10,
    utility: 0.7,
    unlocks: [],
  },
  {
    id: 'foraging_route',
    name: 'Lộ trình hái lượm',
    domain: 'survival',
    era: 'stone',
    description: 'Ghi nhớ mùa và đường đi tới nguồn thức ăn.',
    prerequisites: [],
    requiredKnowledge: [{ id: 'foraging', mastery: 0.4 }],
    cost: 6,
    utility: 0.6,
    unlocks: [],
  },
  {
    id: 'hide_shelter',
    name: 'Lán da thú',
    domain: 'construction',
    era: 'stone',
    description: 'Chỗ trú di động chống mưa và lạnh.',
    prerequisites: ['stone_knapping'],
    requiredKnowledge: [{ id: 'shelter_building', mastery: 0.4 }],
    cost: 10,
    utility: 0.65,
    unlocks: [],
  },
  {
    id: 'farming',
    name: 'Nông nghiệp định canh',
    domain: 'agriculture',
    era: 'bronze',
    description: 'Chọn giống, cày đất và dự trữ hạt.',
    prerequisites: ['foraging_route', 'hide_shelter'],
    requiredKnowledge: [{ id: 'agriculture', mastery: 0.5 }],
    cost: 22,
    utility: 0.95,
    unlocks: [],
  },
  {
    id: 'animal_husbandry',
    name: 'Thuần hoá gia súc',
    domain: 'agriculture',
    era: 'bronze',
    description: 'Nuôi gia súc lấy sữa, lông và sức kéo.',
    prerequisites: ['foraging_route'],
    requiredKnowledge: [{ id: 'animal_husbandry', mastery: 0.5 }],
    cost: 20,
    utility: 0.8,
    unlocks: [],
  },
  {
    id: 'pottery_kiln',
    name: 'Lò gốm',
    domain: 'craft',
    era: 'bronze',
    description: 'Nung bình chứa và gạch.',
    prerequisites: ['fire_control'],
    requiredKnowledge: [{ id: 'pottery', mastery: 0.45 }],
    cost: 16,
    utility: 0.6,
    unlocks: [],
  },
  {
    id: 'weaving_loom',
    name: 'Khung dệt',
    domain: 'craft',
    era: 'bronze',
    description: 'Dệt vải và may quần áo.',
    prerequisites: ['stone_knapping'],
    requiredKnowledge: [{ id: 'weaving', mastery: 0.45 }],
    cost: 18,
    utility: 0.55,
    unlocks: [],
  },
  {
    id: 'bronze_smelting',
    name: 'Luyện đồng',
    domain: 'metallurgy',
    era: 'bronze',
    description: 'Đúc công cụ và vũ khí đồng.',
    prerequisites: ['pottery_kiln'],
    requiredKnowledge: [{ id: 'bronze_working', mastery: 0.5 }],
    cost: 26,
    utility: 0.85,
    unlocks: [],
  },
  {
    id: 'writing_system',
    name: 'Chữ viết',
    domain: 'culture',
    era: 'bronze',
    description: 'Ghi chép giao ước, số đếm và chuyện kể.',
    prerequisites: [],
    requiredKnowledge: [{ id: 'writing', mastery: 0.5 }],
    cost: 24,
    utility: 0.9,
    unlocks: [],
  },
  {
    id: 'counting',
    name: 'Số đếm',
    domain: 'mathematics',
    era: 'bronze',
    description: 'Đếm, đo và tính mùa vụ.',
    prerequisites: ['writing_system'],
    requiredKnowledge: [{ id: 'mathematics', mastery: 0.45 }],
    cost: 20,
    utility: 0.85,
    unlocks: [],
  },
  {
    id: 'irrigation_network',
    name: 'Mạng thuỷ lợi',
    domain: 'agriculture',
    era: 'iron',
    description: 'Kênh dẫn nước và đê điều.',
    prerequisites: ['farming', 'counting'],
    requiredKnowledge: [{ id: 'irrigation', mastery: 0.55 }],
    cost: 35,
    utility: 0.9,
    unlocks: [],
  },
  {
    id: 'iron_forge',
    name: 'Lò rèn sắt',
    domain: 'metallurgy',
    era: 'iron',
    description: 'Rèn lưỡi cày, đinh và gươm.',
    prerequisites: ['bronze_smelting'],
    requiredKnowledge: [{ id: 'iron_working', mastery: 0.55 }],
    cost: 38,
    utility: 0.9,
    unlocks: [],
  },
  {
    id: 'herbal_medicine',
    name: 'Y dược',
    domain: 'medicine',
    era: 'iron',
    description: 'Chữa bệnh bằng dược thảo và cách ly.',
    prerequisites: ['writing_system'],
    requiredKnowledge: [{ id: 'medicine', mastery: 0.5 }],
    cost: 32,
    utility: 0.85,
    unlocks: [],
  },
  {
    id: 'code_of_laws',
    name: 'Bộ luật',
    domain: 'governance',
    era: 'iron',
    description: 'Quy tắc chung và toà án.',
    prerequisites: ['writing_system'],
    requiredKnowledge: [{ id: 'law', mastery: 0.5 }],
    cost: 30,
    utility: 0.85,
    unlocks: [],
  },
  {
    id: 'philosophy_school',
    name: 'Trường triết học',
    domain: 'philosophy',
    era: 'iron',
    description: 'Tranh luận công khai về đạo đức và nhà nước.',
    prerequisites: ['writing_system'],
    requiredKnowledge: [{ id: 'philosophy', mastery: 0.55 }],
    cost: 34,
    utility: 0.7,
    unlocks: [],
  },
  {
    id: 'ocean_navigation',
    name: 'Hàng hải xa bờ',
    domain: 'navigation',
    era: 'medieval',
    description: 'Hải đồ, đọc sao và hướng gió.',
    prerequisites: ['counting'],
    requiredKnowledge: [{ id: 'navigation', mastery: 0.55 }],
    cost: 45,
    utility: 0.8,
    unlocks: [],
  },
  {
    id: 'masonry_arch',
    name: 'Vòm đá',
    domain: 'construction',
    era: 'medieval',
    description: 'Tường chịu lực và nhà cao.',
    prerequisites: ['bronze_smelting', 'counting'],
    requiredKnowledge: [{ id: 'architecture', mastery: 0.55 }],
    cost: 44,
    utility: 0.85,
    unlocks: [],
  },
  {
    id: 'water_mill',
    name: 'Cối xay nước',
    domain: 'engineering',
    era: 'medieval',
    description: 'Khai thác sức nước để xay và gia công.',
    prerequisites: ['masonry_arch'],
    requiredKnowledge: [{ id: 'architecture', mastery: 0.6 }],
    cost: 50,
    utility: 0.8,
    unlocks: [],
  },
  {
    id: 'movable_type',
    name: 'In ấn chữ rời',
    domain: 'culture',
    era: 'renaissance',
    description: 'Nhân bản tri thức với chi phí thấp.',
    prerequisites: ['writing_system', 'counting'],
    requiredKnowledge: [{ id: 'printing', mastery: 0.6 }],
    cost: 60,
    utility: 0.95,
    unlocks: [],
  },
  {
    id: 'anatomy_study',
    name: 'Giải phẫu',
    domain: 'medicine',
    era: 'renaissance',
    description: 'Hiểu cơ thể qua quan sát và mổ xẻ.',
    prerequisites: ['herbal_medicine'],
    requiredKnowledge: [{ id: 'anatomy', mastery: 0.6 }],
    cost: 62,
    utility: 0.85,
    unlocks: [],
  },
  {
    id: 'experimental_science',
    name: 'Khoa học thực nghiệm',
    domain: 'science',
    era: 'renaissance',
    description: 'Giả thuyết, thực nghiệm và kiểm chứng.',
    prerequisites: ['philosophy_school', 'counting', 'movable_type'],
    requiredKnowledge: [{ id: 'scientific_method', mastery: 0.65 }],
    cost: 75,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'steam_engine',
    name: 'Động cơ hơi nước',
    domain: 'engineering',
    era: 'industrial',
    description: 'Biến nhiệt thành chuyển động.',
    prerequisites: ['experimental_science', 'iron_forge'],
    requiredKnowledge: [{ id: 'steam_power', mastery: 0.7 }],
    cost: 90,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'sanitation_system',
    name: 'Hệ thống vệ sinh',
    domain: 'medicine',
    era: 'industrial',
    description: 'Nước sạch, cống rãnh và kiểm soát dịch.',
    prerequisites: ['masonry_arch', 'herbal_medicine'],
    requiredKnowledge: [{ id: 'sanitation', mastery: 0.65 }],
    cost: 85,
    utility: 0.95,
    unlocks: [],
  },
  {
    id: 'electrical_grid',
    name: 'Lưới điện',
    domain: 'energy',
    era: 'industrial',
    description: 'Máy phát và mạng truyền tải điện.',
    prerequisites: ['experimental_science', 'steam_engine'],
    requiredKnowledge: [{ id: 'electricity', mastery: 0.7 }],
    cost: 100,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'public_school',
    name: 'Trường công',
    domain: 'governance',
    era: 'industrial',
    description: 'Giáo dục cơ bản cho trẻ em.',
    prerequisites: ['movable_type', 'code_of_laws'],
    requiredKnowledge: [{ id: 'education_for_all', mastery: 0.5 }],
    cost: 80,
    utility: 0.9,
    unlocks: [],
  },
  {
    id: 'germ_theory_medicine',
    name: 'Y học vi trùng',
    domain: 'medicine',
    era: 'modern',
    description: 'Phòng bệnh bằng vệ sinh và vaccine.',
    prerequisites: ['anatomy_study', 'sanitation_system', 'experimental_science'],
    requiredKnowledge: [{ id: 'germ_theory', mastery: 0.75 }],
    cost: 120,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'evolution_theory',
    name: 'Thuyết tiến hoá',
    domain: 'science',
    era: 'modern',
    description: 'Giải thích đa dạng sự sống bằng chọn lọc tự nhiên.',
    prerequisites: ['experimental_science'],
    requiredKnowledge: [{ id: 'evolution', mastery: 0.7 }],
    cost: 110,
    utility: 0.8,
    unlocks: [],
  },
  {
    id: 'computer',
    name: 'Máy tính',
    domain: 'engineering',
    era: 'modern',
    description: 'Xử lý ký hiệu và tự động hoá tính toán.',
    prerequisites: ['electrical_grid', 'counting'],
    requiredKnowledge: [{ id: 'computing', mastery: 0.75 }],
    cost: 140,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'democracy_charter',
    name: 'Hiến chương dân chủ',
    domain: 'governance',
    era: 'modern',
    description: 'Quyền lực dựa trên lá phiếu và luật chung.',
    prerequisites: ['code_of_laws', 'philosophy_school'],
    requiredKnowledge: [{ id: 'democracy', mastery: 0.65 }],
    cost: 105,
    utility: 0.9,
    unlocks: [],
  },
  {
    id: 'human_rights_declaration',
    name: 'Tuyên ngôn nhân quyền',
    domain: 'governance',
    era: 'modern',
    description: 'Quyền bất khả xâm phạm của mỗi người.',
    prerequisites: ['democracy_charter', 'public_school'],
    requiredKnowledge: [{ id: 'human_rights', mastery: 0.7 }],
    cost: 115,
    utility: 0.95,
    unlocks: [],
  },
  {
    id: 'ecology_science',
    name: 'Sinh thái học',
    domain: 'science',
    era: 'modern',
    description: 'Quan hệ sinh vật – môi trường.',
    prerequisites: ['evolution_theory'],
    requiredKnowledge: [{ id: 'ecology', mastery: 0.7 }],
    cost: 110,
    utility: 0.9,
    unlocks: [],
  },
  {
    id: 'renewable_grid',
    name: 'Lưới năng lượng tái tạo',
    domain: 'energy',
    era: 'enlightened',
    description: 'Điện mặt trời, gió và nước quy mô lớn.',
    prerequisites: ['electrical_grid', 'ecology_science'],
    requiredKnowledge: [{ id: 'renewable_energy', mastery: 0.8 }],
    cost: 160,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'artificial_intelligence',
    name: 'Trí tuệ nhân tạo',
    domain: 'engineering',
    era: 'enlightened',
    description: 'Máy học từ dữ liệu và hỗ trợ quyết định.',
    prerequisites: ['computer', 'experimental_science'],
    requiredKnowledge: [{ id: 'artificial_intelligence', mastery: 0.8 }],
    cost: 180,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'universal_healthcare',
    name: 'Y tế phổ cập',
    domain: 'medicine',
    era: 'enlightened',
    description: 'Chăm sóc sức khoẻ cho mọi người.',
    prerequisites: ['germ_theory_medicine', 'human_rights_declaration'],
    requiredKnowledge: [{ id: 'medicine_preventive', mastery: 0.75 }],
    cost: 150,
    utility: 1,
    unlocks: [],
  },
  {
    id: 'universal_education',
    name: 'Giáo dục phổ cập',
    domain: 'governance',
    era: 'enlightened',
    description: 'Mọi trẻ em được học đọc, viết và tính toán.',
    prerequisites: ['public_school', 'human_rights_declaration'],
    requiredKnowledge: [{ id: 'education_for_all', mastery: 0.75 }],
    cost: 145,
    utility: 1,
    unlocks: [],
  },
]);

/** Tạo cây công nghệ mặc định. */
export function createTechTree(nodes: readonly TechnologyNode[] = DEFAULT_TECH_TREE): TechTree {
  return new TechTree(nodes);
}
