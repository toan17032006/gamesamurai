/**
 * @file genetics.ts
 * @module @aetheria/engine/life/genetics
 * @description Di truyền học: bộ gen lưỡng bội, alen trội/lặn, biểu hiện tính
 * trạng đa gen, giao phối – tái tổ hợp – đột biến, khoảng cách di truyền, hệ số
 * cận huyết và dự báo tính trạng con cái. Không dùng `Math.random()`.
 */

import { LifeRandom } from './stochastic.js';
import { clamp01 } from '../deeplearning/random.js';

/** Một alen với giá trị kiểu hình và độ trội. */
export interface Allele {
  /** Giá trị chuẩn hoá `[0, 1]`. */
  value: number;
  /** Độ trội `[0, 1]`; alen trội hơn quyết định kiểu hình ở chế độ dominant. */
  dominance: number;
}

/** Một locus lưỡng bội. */
export interface Gene {
  id: string;
  alleles: [Allele, Allele];
}

/** Bộ gen của một cá thể. */
export interface Genome {
  id: string;
  genes: Record<string, Gene>;
  generation: number;
  lineage: string[];
  mutations: number;
}

/** Cách biểu hiện một tính trạng từ nhiều gen. */
export type TraitMode = 'additive' | 'dominant' | 'threshold';

/** Quy tắc biểu hiện tính trạng. */
export interface TraitRule {
  id: string;
  genes: string[];
  mode: TraitMode;
  base: number;
  scale: number;
  min: number;
  max: number;
  threshold?: number;
}

/** Tên các tính trạng mặc định. */
export type GeneticTrait =
  | 'size'
  | 'strength'
  | 'intelligence'
  | 'creativity'
  | 'empathy'
  | 'aggression'
  | 'immunity'
  | 'metabolism'
  | 'fertility'
  | 'longevity'
  | 'beauty'
  | 'resilience'
  | 'curiosity'
  | 'charisma'
  | 'dexterity'
  | 'perception'
  | 'willpower'
  | 'sociability'
  | 'conscientiousness'
  | 'riskTaking';

/** Gen mặc định — mỗi gen là một locus lưỡng bội. */
export const DEFAULT_GENE_IDS: readonly string[] = Object.freeze([
  'size',
  'strength',
  'intelligence',
  'creativity',
  'empathy',
  'aggression',
  'immunity',
  'metabolism',
  'fertility',
  'longevity',
  'beauty',
  'resilience',
  'curiosity',
  'charisma',
  'dexterity',
  'perception',
  'willpower',
  'sociability',
  'conscientiousness',
  'riskTaking',
]);

/** Quy tắc biểu hiện mặc định. */
export const DEFAULT_TRAIT_RULES: readonly TraitRule[] = Object.freeze([
  { id: 'size', genes: ['size', 'metabolism'], mode: 'additive', base: 0.2, scale: 1.6, min: 0.1, max: 2.2 },
  { id: 'strength', genes: ['strength', 'size'], mode: 'additive', base: 5, scale: 95, min: 1, max: 100 },
  { id: 'intelligence', genes: ['intelligence', 'perception', 'curiosity'], mode: 'additive', base: 30, scale: 90, min: 10, max: 200 },
  { id: 'creativity', genes: ['creativity', 'curiosity', 'intelligence'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'empathy', genes: ['empathy', 'sociability'], mode: 'additive', base: 5, scale: 95, min: 0, max: 100 },
  { id: 'aggression', genes: ['aggression', 'riskTaking'], mode: 'additive', base: 5, scale: 90, min: 0, max: 100 },
  { id: 'immunity', genes: ['immunity', 'resilience', 'metabolism'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'metabolism', genes: ['metabolism', 'size'], mode: 'additive', base: 0.4, scale: 1.2, min: 0.2, max: 2 },
  { id: 'fertility', genes: ['fertility', 'resilience'], mode: 'additive', base: 0.1, scale: 0.9, min: 0, max: 1 },
  { id: 'longevity', genes: ['longevity', 'resilience', 'immunity'], mode: 'additive', base: 35, scale: 85, min: 20, max: 130 },
  { id: 'beauty', genes: ['beauty', 'charisma'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'resilience', genes: ['resilience', 'willpower'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'curiosity', genes: ['curiosity', 'intelligence'], mode: 'additive', base: 5, scale: 95, min: 0, max: 100 },
  { id: 'charisma', genes: ['charisma', 'sociability', 'beauty'], mode: 'additive', base: 5, scale: 95, min: 0, max: 100 },
  { id: 'dexterity', genes: ['dexterity', 'perception'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'perception', genes: ['perception', 'intelligence'], mode: 'additive', base: 20, scale: 80, min: 0, max: 100 },
  { id: 'willpower', genes: ['willpower', 'conscientiousness'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'sociability', genes: ['sociability', 'empathy'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'conscientiousness', genes: ['conscientiousness', 'willpower'], mode: 'additive', base: 10, scale: 90, min: 0, max: 100 },
  { id: 'riskTaking', genes: ['riskTaking', 'curiosity'], mode: 'additive', base: 5, scale: 95, min: 0, max: 100 },
  // Ví dụ tính trạng dạng ngưỡng: nguy cơ di truyền (1 = có nguy cơ cao).
  { id: 'hereditaryRisk', genes: ['immunity', 'resilience', 'longevity'], mode: 'threshold', base: 0, scale: 1, min: 0, max: 1, threshold: 0.62 },
]);

/** Tạo alen ngẫu nhiên có seed. */
export function createAllele(random: LifeRandom, value = random.next(), dominance = random.next()): Allele {
  return { value: clamp01(value), dominance: clamp01(dominance) };
}

/** Tạo bộ gen với các gen mặc định hoặc danh sách chỉ định. */
export function createGenome(
  id: string,
  options: {
    seed?: number | string;
    geneIds?: readonly string[];
    generation?: number;
    lineage?: string[];
    /** Giá trị trung bình mong muốn cho các alen. */
    baseline?: number;
    /** Độ lệch chuẩn quanh baseline. */
    variation?: number;
  } = {},
): Genome {
  const random = new LifeRandom(options.seed ?? id);
  const baseline = clamp01(options.baseline ?? 0.5);
  const variation = Math.max(0, options.variation ?? 0.15);
  const ids = options.geneIds ?? DEFAULT_GENE_IDS;
  const genes: Record<string, Gene> = {};

  for (const geneId of ids) {
    genes[geneId] = {
      id: geneId,
      alleles: [
        createAllele(random, clamp01(random.gaussian(baseline, variation)), random.next()),
        createAllele(random, clamp01(random.gaussian(baseline, variation)), random.next()),
      ],
    };
  }

  return {
    id,
    genes,
    generation: options.generation ?? 0,
    lineage: options.lineage ?? [id],
    mutations: 0,
  };
}

/** Chọn alen được biểu hiện theo độ trội; hoà thì lấy trung bình. */
export function expressedAlleleValue(gene: Gene): number {
  const [a, b] = gene.alleles;
  if (Math.abs(a.dominance - b.dominance) < 1e-9) return (a.value + b.value) / 2;
  return a.dominance > b.dominance ? a.value : b.value;
}

/** Biểu hiện một tính trạng từ bộ gen. */
export function expressTrait(genome: Genome, rule: TraitRule): number {
  const values: number[] = [];
  const dominantValues: number[] = [];

  for (const geneId of rule.genes) {
    const gene = genome.genes[geneId];
    if (!gene) continue;
    values.push((gene.alleles[0].value + gene.alleles[1].value) / 2);
    dominantValues.push(expressedAlleleValue(gene));
  }

  let normalized: number;
  if (values.length === 0) {
    normalized = 0.5;
  } else if (rule.mode === 'dominant') {
    normalized = dominantValues.reduce((sum, value) => sum + value, 0) / dominantValues.length;
  } else {
    normalized = values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  let result = rule.base + normalized * rule.scale;
  if (rule.mode === 'threshold' && rule.threshold !== undefined) {
    result = result >= rule.threshold ? rule.max : rule.min;
  }
  return Math.min(rule.max, Math.max(rule.min, result));
}

/** Biểu hiện toàn bộ tính trạng. */
export function expressGenome(
  genome: Genome,
  rules: readonly TraitRule[] = DEFAULT_TRAIT_RULES,
): Record<string, number> {
  const traits: Record<string, number> = {};
  for (const rule of rules) traits[rule.id] = expressTrait(genome, rule);
  return traits;
}

/** Lấy alen ngẫu nhiên từ một gen. */
export function chooseAllele(gene: Gene | undefined, random: LifeRandom): Allele {
  if (!gene) return { value: 0.5, dominance: 0.5 };
  return random.chance(0.5) ? { ...gene.alleles[0] } : { ...gene.alleles[1] };
}

/** Lai ghép hai bộ gen, có đột biến. */
export function inheritGenome(
  parentA: Genome,
  parentB: Genome,
  seed: number | string,
  options: {
    mutationRate?: number;
    mutationScale?: number;
    generation?: number;
  } = {},
): Genome {
  const random = new LifeRandom(seed);
  const mutationRate = clamp01(options.mutationRate ?? 0.02);
  const mutationScale = Math.max(0, options.mutationScale ?? 0.08);
  const geneIds = new Set([...Object.keys(parentA.genes), ...Object.keys(parentB.genes)]);
  const genes: Record<string, Gene> = {};
  let mutations = 0;

  for (const geneId of geneIds) {
    const fromA = chooseAllele(parentA.genes[geneId], random);
    const fromB = chooseAllele(parentB.genes[geneId], random);

    const mutate = (allele: Allele): Allele => {
      if (!random.chance(mutationRate)) return allele;
      mutations++;
      return {
        value: clamp01(allele.value + random.gaussian(0, mutationScale)),
        dominance: clamp01(allele.dominance + random.gaussian(0, mutationScale * 0.5)),
      };
    };

    genes[geneId] = { id: geneId, alleles: [mutate(fromA), mutate(fromB)] };
  }

  const lineage = [...new Set([...parentA.lineage, ...parentB.lineage])].slice(-32);
  return {
    id: `genome_${parentA.id}_${parentB.id}_${random.int(0, 999_999)}`,
    genes,
    generation: options.generation ?? Math.max(parentA.generation, parentB.generation) + 1,
    lineage: [...lineage, parentA.id, parentB.id].slice(-32),
    mutations,
  };
}

/** Đột biến một bộ gen hiện có (trả bản sao). */
export function mutateGenome(
  genome: Genome,
  seed: number | string,
  rate = 0.02,
  scale = 0.08,
): Genome {
  const random = new LifeRandom(seed);
  const genes: Record<string, Gene> = {};
  let mutations = genome.mutations;

  for (const [geneId, gene] of Object.entries(genome.genes)) {
    const alleles = gene.alleles.map((allele) => {
      if (!random.chance(clamp01(rate))) return { ...allele };
      mutations++;
      return {
        value: clamp01(allele.value + random.gaussian(0, scale)),
        dominance: clamp01(allele.dominance + random.gaussian(0, scale * 0.5)),
      };
    });
    genes[geneId] = { id: geneId, alleles: [alleles[0], alleles[1]] };
  }

  return { ...genome, genes, mutations };
}

/** Khoảng cách di truyền chuẩn hoá `[0, 1]`. */
export function geneticDistance(a: Genome, b: Genome): number {
  const geneIds = new Set([...Object.keys(a.genes), ...Object.keys(b.genes)]);
  if (geneIds.size === 0) return 0;
  let total = 0;
  let count = 0;
  for (const geneId of geneIds) {
    const geneA = a.genes[geneId];
    const geneB = b.genes[geneId];
    const meanA = geneA ? (geneA.alleles[0].value + geneA.alleles[1].value) / 2 : 0;
    const meanB = geneB ? (geneB.alleles[0].value + geneB.alleles[1].value) / 2 : 0;
    total += Math.abs(meanA - meanB);
    count++;
  }
  return count > 0 ? total / count : 0;
}

/**
 * Hệ số cận huyết ước lượng từ tổ tiên chung trong lineage.
 * Công thức gần đúng: phần giao của hai lineage chia cho độ dài trung bình.
 */
export function inbreedingCoefficient(a: Genome, b: Genome): number {
  const setA = new Set(a.lineage);
  const setB = new Set(b.lineage);
  let shared = 0;
  for (const id of setA) if (setB.has(id)) shared++;
  const denominator = Math.max(1, (setA.size + setB.size) / 2);
  return clamp01(shared / denominator);
}

/** Quan hệ họ hàng ước lượng `[0, 1]`. */
export function relatedness(a: Genome, b: Genome): number {
  const genetic = 1 - geneticDistance(a, b);
  const shared = inbreedingCoefficient(a, b);
  return clamp01(genetic * 0.7 + shared * 0.3);
}

/** Dự báo tính trạng trung bình của con cái từ hai bố mẹ. */
export function predictOffspringTraits(
  parentA: Genome,
  parentB: Genome,
  rules: readonly TraitRule[] = DEFAULT_TRAIT_RULES,
): Record<string, number> {
  const traitsA = expressGenome(parentA, rules);
  const traitsB = expressGenome(parentB, rules);
  const result: Record<string, number> = {};
  for (const rule of rules) {
    const valueA = traitsA[rule.id] ?? rule.min;
    const valueB = traitsB[rule.id] ?? rule.min;
    result[rule.id] = (valueA + valueB) / 2;
  }
  return result;
}

/** Nguy cơ di truyền theo quy tắc ngưỡng và tiền sử gia đình. */
export function hereditaryRisks(
  genome: Genome,
  familyHistory: readonly string[] = [],
  rules: readonly TraitRule[] = DEFAULT_TRAIT_RULES,
): Array<{ trait: string; risk: number; reason: string }> {
  const traits = expressGenome(genome, rules);
  const risks: Array<{ trait: string; risk: number; reason: string }> = [];
  for (const rule of rules) {
    if (rule.mode !== 'threshold') continue;
    const expressed = traits[rule.id] ?? 0;
    const familyBoost = familyHistory.includes(rule.id) ? 0.2 : 0;
    risks.push({
      trait: rule.id,
      risk: clamp01(expressed * 0.6 + familyBoost),
      reason: familyBoost > 0 ? 'tiền sử gia đình' : 'tổ hợp alen',
    });
  }
  return risks;
}

/** Bản sao bộ gen với id mới. */
export function cloneGenome(genome: Genome, id = `${genome.id}_clone`): Genome {
  const genes: Record<string, Gene> = {};
  for (const [geneId, gene] of Object.entries(genome.genes)) {
    genes[geneId] = {
      id: geneId,
      alleles: [{ ...gene.alleles[0] }, { ...gene.alleles[1] }],
    };
  }
  return { ...genome, id, genes, lineage: [...genome.lineage] };
}

/** Chọn alen trội/lặn cho mục đích hiển thị kiểu hình. */
export function phenotype(genome: Genome, rules: readonly TraitRule[] = DEFAULT_TRAIT_RULES): Record<string, number> {
  return expressGenome(genome, rules);
}
