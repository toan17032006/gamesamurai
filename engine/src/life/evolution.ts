/**
 * @file evolution.ts
 * @module @aetheria/engine/life/evolution
 * @description Tiến hóa & chọn lọc tự nhiên: theo dõi tần số alen qua từng thế
 * hệ, tính độ thích nghi (fitness) từ khác biệt sinh tồn/sinh sản, mô phỏng trôi
 * di truyền (genetic drift) trong quần thể nhỏ, áp áp lực chọn lọc theo môi
 * trường (khí hậu, dịch bệnh, khan hiếm thức ăn, săn bắt) và phát hiện phân hoá
 * loài (speciation) khi một nhánh tách khỏi loài gốc đủ xa về di truyền.
 */

import { LifeRandom } from './stochastic.js';
import { clamp01, clampRange } from '../deeplearning/random.js';
import type { Genome } from './genetics.js';
import { geneticDistance } from './genetics.js';

/** Áp lực môi trường đang tác động lên quần thể. */
export interface SelectionPressure {
  id: string;
  /** Các gen bị chọn lọc (id gene → hệ số chọn lọc dương/âm `[-1, 1]`). */
  coefficients: Record<string, number>;
  /** Cường độ tổng thể `[0, 1]`. */
  intensity: number;
  note: string;
}

/** Độ thích nghi của một cá thể. */
export interface FitnessReport {
  entityId: string;
  /** Điểm thích nghi chuẩn hoá `[0, 1]`. */
  fitness: number;
  /** Đóng góp từng gen vào điểm thích nghi. */
  contributions: Record<string, number>;
  /** Nhận xét chọn lọc nổi bật nhất. */
  dominantEffect: string;
}

/** Hồ sơ một loài đang theo dõi. */
export interface SpeciesProfile {
  id: string;
  /** Tên loài (vd `homo_sapiens`, `wolf_plains`). */
  name: string;
  /** Loài tổ tiên nếu tách nhánh. */
  parentSpeciesId?: string;
  /** Năm xuất hiện. */
  originYear: number;
  /** Số cá thể sống. */
  population: number;
  /** Thế hệ đã trải qua. */
  generations: number;
  /** Tần số alen trung bình theo locus. */
  alleleFrequencies: Record<string, number>;
  /** Kiến trúc bộ gen trung bình (giá trị alen trung bình theo gene). */
  meanGenome: Record<string, number>;
  /** Biến thiên di truyền `[0, 1]`. */
  geneticVariation: number;
  /** Cá thể đại diện gần nhất (id). */
  lastSpecimenId?: string;
}

/** Sự kiện phân hoá loài. */
export interface SpeciationEvent {
  year: number;
  parentSpeciesId: string;
  childSpeciesId: string;
  childName: string;
  /** Khoảng cách di truyền loài con vs loài cha lúc tách. */
  divergence: number;
  /** Số cá thể sáng lập loài mới. */
  founders: number;
  note: string;
}

/** Thống kê chọn lọc một thế hệ. */
export interface SelectionReport {
  year: number;
  speciesId: string;
  /** Số cá thể đã đánh giá. */
  evaluated: number;
  /** Fitness trung bình của quần thể. */
  meanFitness: number;
  /** Độ lệch chuẩn fitness. */
  fitnessStd: number;
  /** Tăng fitness trung bình so với thế hệ trước (tiến bộ tiến hoá). */
  fitnessDelta: number;
  /** Gen đang bị chọn lọc mạnh nhất. */
  strongestSelection: { gene: string; coefficient: number } | null;
  /** Biến thiên di truyền còn lại `[0, 1]`. */
  geneticVariation: number;
  speciation: SpeciationEvent | null;
}

/** Ngưỡng khoảng cách di truyền để coi là loài mới. */
export const SPECIATION_DISTANCE_THRESHOLD = 0.28;

/** Cấu hình động cơ tiến hoá. */
export interface EvolutionOptions {
  seed?: number | string;
  /** Ngưỡng phân hoá loài. */
  speciationThreshold?: number;
  /** Số cá thể tối thiểu để tách loài. */
  minSpeciationPopulation?: number;
  /** Tỉ lệ sót lại sau chọn lọc mỗi thế hệ (cái chết chọn lọc). */
  selectionMortality?: number;
}

/**
 * Động cơ tiến hoá quần thể.
 *
 * Cách dùng: mỗi lần sinh/t chết gọi `recordBirth`/`recordDeath`; mỗi thế hệ
 * gọi `selectGeneration` để tính fitness, gạt bỏ cá thể yếu và cập nhật tần số
 * alen; hệ tự phát hiện khi một nhóm cá thể tách đủ xa để hình thành loài mới.
 */
export class EvolutionEngine {
  public readonly species = new Map<string, SpeciesProfile>();
  public readonly speciationEvents: SpeciationEvent[] = [];
  public readonly pressures: SelectionPressure[] = [];
  public readonly seed: number | string;
  public readonly speciationThreshold: number;
  public readonly minSpeciationPopulation: number;
  public readonly selectionMortality: number;

  private readonly random: LifeRandom;
  private readonly fitnessHistory = new Map<string, number[]>();
  private speciesCounter = 0;

  constructor(options: EvolutionOptions = {}) {
    this.seed = options.seed ?? 'aetheria-evolution';
    this.random = new LifeRandom(this.seed);
    this.speciationThreshold = Math.max(0.05, options.speciationThreshold ?? SPECIATION_DISTANCE_THRESHOLD);
    this.minSpeciationPopulation = Math.max(2, options.minSpeciationPopulation ?? 4);
    this.selectionMortality = clamp01(options.selectionMortality ?? 0.15);
  }

  /** Đăng ký một loài ban đầu từ một cá thể đại diện. */
  public registerSpecies(
    id: string,
    name: string,
    founderGenome: Genome,
    options: { year?: number; population?: number; parentSpeciesId?: string } = {},
  ): SpeciesProfile {
    const profile: SpeciesProfile = {
      id,
      name,
      parentSpeciesId: options.parentSpeciesId,
      originYear: options.year ?? 0,
      population: Math.max(0, Math.floor(options.population ?? 1)),
      generations: 0,
      alleleFrequencies: {},
      meanGenome: meanGenomeOf([founderGenome]),
      geneticVariation: 0,
      lastSpecimenId: founderGenome.id,
    };
    this.species.set(id, profile);
    return profile;
  }

  /** Thêm một áp lực môi trường (bệnh tật, hạn hán, săn bắt…). */
  public addPressure(pressure: SelectionPressure): void {
    const existing = this.pressures.findIndex((p) => p.id === pressure.id);
    const normalized: SelectionPressure = {
      ...pressure,
      intensity: clamp01(pressure.intensity),
    };
    if (existing >= 0) this.pressures[existing] = normalized;
    else this.pressures.push(normalized);
  }

  /** Bỏ một áp lực. */
  public removePressure(id: string): boolean {
    const index = this.pressures.findIndex((p) => p.id === id);
    if (index < 0) return false;
    this.pressures.splice(index, 1);
    return true;
  }

  /** Ghi nhận một cá thể chào đời thuộc loài. */
  public recordBirth(speciesId: string, genome: Genome): void {
    const profile = this.species.get(speciesId);
    if (!profile) return;
    profile.population++;
    profile.lastSpecimenId = genome.id;
    this.assimilateGenome(profile, genome, 1 / Math.max(1, profile.population));
  }

  /** Ghi nhận một cá thể tử vong thuộc loài. */
  public recordDeath(speciesId: string, options: { beforeReproduction?: boolean } = {}): void {
    const profile = this.species.get(speciesId);
    if (!profile) return;
    profile.population = Math.max(0, profile.population - 1);
    if (options.beforeReproduction) {
      // Cái chết trước khi sinh sản là động lực chọn lọc mạnh nhất.
      profile.generations += 0;
    }
  }

  /** Đánh giá độ thích nghi của một bộ gen dưới các áp lực hiện tại. */
  public fitnessOf(genome: Genome): FitnessReport {
    const contributions: Record<string, number> = {};
    let fitness = 0.5;
    let dominantEffect = 'trung lập';

    for (const pressure of this.pressures) {
      for (const [geneId, coefficient] of Object.entries(pressure.coefficients)) {
        const gene = genome.genes[geneId];
        if (!gene) continue;
        const mean = (gene.alleles[0].value + gene.alleles[1].value) / 2;
        const effect = mean * coefficient * pressure.intensity;
        contributions[geneId] = (contributions[geneId] ?? 0) + effect;
        fitness += effect * 0.25;
        if (Math.abs(effect) > Math.abs((contributions[dominantEffect] ?? 0)) && geneId !== dominantEffect) {
          dominantEffect = `${geneId} ${coefficient > 0 ? 'có lợi' : 'bất lợi'} dưới ${pressure.id}`;
        }
      }
    }

    // Ưu thế dị hợp (heterozygote advantage) nhẹ cho mọi locus.
    for (const gene of Object.values(genome.genes)) {
      const hetero = Math.abs(gene.alleles[0].value - gene.alleles[1].value);
      fitness += hetero * 0.02;
    }

    return {
      entityId: genome.id,
      fitness: clamp01(fitness),
      contributions,
      dominantEffect,
    };
  }

  /**
   * Chạy một thế hệ chọn lọc lên tập cá thể của một loài.
   * Trả về danh sách cá thể bị loại (không sống sót tới tuổi sinh sản) và báo
   * cáo chọn lọc; đồng thời cập nhật tần số alen + kiểm tra phân hoá loài.
   */
  public selectGeneration(
    speciesId: string,
    members: ReadonlyArray<{ entityId: string; genome: Genome }>,
    options: { year?: number; random?: LifeRandom } = {},
  ): { eliminated: string[]; report: SelectionReport } {
    const profile = this.species.get(speciesId);
    const random = options.random ?? this.random;
    if (!profile) {
      throw new RangeError(`Không tìm thấy loài ${speciesId}`);
    }

    const reports = members.map((member) => this.fitnessOf(member.genome));
    const fitnessValues = reports.map((r) => r.fitness);
    const meanFitness = average(fitnessValues);
    const std = standardDeviation(fitnessValues);
    const history = this.fitnessHistory.get(speciesId) ?? [];
    const lastMean = history.length > 0 ? history[history.length - 1] : meanFitness;
    history.push(meanFitness);
    if (history.length > 500) history.shift();
    this.fitnessHistory.set(speciesId, history);

    // Chọn lọc: cá thể fitness thấp có xác suất bị loại cao hơn.
    const eliminated: string[] = [];
    const survivors: Genome[] = [];
    members.forEach((member, index) => {
      const fitness = fitnessValues[index];
      const mortalityChance = clamp01(this.selectionMortality * (1.6 - 1.2 * fitness));
      if (random.chance(mortalityChance)) eliminated.push(member.entityId);
      else survivors.push(member.genome);
    });

    profile.generations++;
    if (survivors.length > 0) {
      const weight = 1 / Math.max(1, survivors.length);
      for (const genome of survivors) this.assimilateGenome(profile, genome, weight);
      profile.geneticVariation = variationOf(survivors);
    }

    // Áp lực chọn lọc tự suy diễn: gen tương quan thuận với fitness sẽ được tăng hệ số.
    const strongest = this.inferStrongestSelection(reports);

    const speciation = this.checkSpeciation(speciesId, survivors, options.year ?? profile.originYear, random);

    return {
      eliminated,
      report: {
        year: options.year ?? profile.originYear,
        speciesId,
        evaluated: members.length,
        meanFitness,
        fitnessStd: std,
        fitnessDelta: meanFitness - lastMean,
        strongestSelection: strongest,
        geneticVariation: profile.geneticVariation,
        speciation: speciation
          ? {
              year: speciation.year,
              parentSpeciesId: speciation.parentSpeciesId,
              childSpeciesId: speciation.childSpeciesId,
              childName: speciation.childName,
              divergence: speciation.divergence,
              founders: speciation.founders,
              note: speciation.note,
            }
          : null,
      },
    };
  }

  /** Trôi di truyền: lấy mẫu tần số alen trong quần thể nhỏ (Wright–Fisher xấp xỉ). */
  public drift(
    speciesId: string,
    generations: number,
    options: { populationSize?: number; random?: LifeRandom } = {},
  ): Record<string, number> {
    const profile = this.species.get(speciesId);
    if (!profile) throw new RangeError(`Không tìm thấy loài ${speciesId}`);
    const random = options.random ?? this.random;
    const size = Math.max(2, Math.floor(options.populationSize ?? Math.max(2, profile.population)));

    for (let g = 0; g < Math.max(0, Math.floor(generations)); g++) {
      for (const [geneId, freq] of Object.entries(profile.meanGenome)) {
        // Lấy mẫu nhị thức xấp xỉ bằng trung bình các lần Bernoulli.
        let hits = 0;
        for (let i = 0; i < size; i++) {
          if (random.chance(freq)) hits++;
        }
        const drifted = hits / size;
        profile.meanGenome[geneId] = drifted;
        profile.alleleFrequencies[geneId] = drifted;
      }
      profile.generations++;
    }
    return { ...profile.meanGenome };
  }

  /**
   * Kiểm tra phân hoá: nếu một nhóm cá thể sinh sống tách biệt có khoảng cách
   * di truyền với bộ gen trung bình loài gốc vượt ngưỡng → đăng ký loài mới.
   */
  public checkSpeciation(
    speciesId: string,
    isolatedGroup: ReadonlyArray<Genome>,
    year: number,
    random: LifeRandom = this.random,
  ): SpeciationEvent | null {
    if (isolatedGroup.length < this.minSpeciationPopulation) return null;
    const profile = this.species.get(speciesId);
    if (!profile) return null;

    const meanIsolated = meanGenomeOf([...isolatedGroup]);
    const divergence = genomeDistance(meanIsolated, profile.meanGenome);
    if (divergence < this.speciationThreshold) return null;

    const childId = `${speciesId}_sp${++this.speciesCounter}`;
    const childProfile = this.registerSpecies(childId, `${profile.name}_${this.speciesCounter}`, isolatedGroup[0], {
      year,
      population: isolatedGroup.length,
      parentSpeciesId: speciesId,
    });
    childProfile.meanGenome = meanIsolated;
    childProfile.geneticVariation = variationOf([...isolatedGroup]);

    const event: SpeciationEvent = {
      year,
      parentSpeciesId: speciesId,
      childSpeciesId: childId,
      childName: childProfile.name,
      divergence,
      founders: isolatedGroup.length,
      note: `nhánh tách khỏi ${profile.name} với khoảng cách di truyền ${divergence.toFixed(3)}`,
    };
    this.speciationEvents.push(event);
    random.next(); // giữ trình tự RNG tất định
    return event;
  }

  /** Xu hướng fitness của một loài (dòng thời gian). */
  public fitnessTrend(speciesId: string): number[] {
    return [...(this.fitnessHistory.get(speciesId) ?? [])];
  }

  /** Hệ số chọn lọc suy diễn từ tương quan gene–fitness. */
  private inferStrongestSelection(reports: ReadonlyArray<FitnessReport>): { gene: string; coefficient: number } | null {
    if (reports.length < 3) return null;
    let bestGene: string | null = null;
    let bestScore = 0;
    const geneIds = new Set(reports.flatMap((r) => Object.keys(r.contributions)));
    for (const geneId of geneIds) {
      let correlation = 0;
      for (const report of reports) correlation += report.contributions[geneId] ?? 0;
      correlation /= reports.length;
      if (Math.abs(correlation) > Math.abs(bestScore)) {
        bestScore = correlation;
        bestGene = geneId;
      }
    }
    return bestGene ? { gene: bestGene, coefficient: round(bestScore, 4) } : null;
  }

  /** Hoà trộn một bộ gen vào hồ sơ loài theo trọng số trung bình động. */
  private assimilateGenome(profile: SpeciesProfile, genome: Genome, weight: number): void {
    const w = clampRange(weight, 0, 1);
    for (const [geneId, gene] of Object.entries(genome.genes)) {
      const mean = (gene.alleles[0].value + gene.alleles[1].value) / 2;
      profile.meanGenome[geneId] = round((profile.meanGenome[geneId] ?? mean) * (1 - w) + mean * w, 6);
      profile.alleleFrequencies[geneId] = profile.meanGenome[geneId];
    }
  }
}

/** Bộ gen trung bình của một tập cá thể. */
export function meanGenomeOf(genomes: ReadonlyArray<Genome>): Record<string, number> {
  const sums = new Map<string, { total: number; count: number }>();
  for (const genome of genomes) {
    for (const [geneId, gene] of Object.entries(genome.genes)) {
      const entry = sums.get(geneId) ?? { total: 0, count: 0 };
      entry.total += (gene.alleles[0].value + gene.alleles[1].value) / 2;
      entry.count++;
      sums.set(geneId, entry);
    }
  }
  const result: Record<string, number> = {};
  for (const [geneId, entry] of sums) result[geneId] = round(entry.total / entry.count, 6);
  return result;
}

/** Khoảng cách giữa hai vector gen trung bình. */
export function genomeDistance(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (keys.size === 0) return 0;
  let total = 0;
  for (const key of keys) total += Math.abs((a[key] ?? 0.5) - (b[key] ?? 0.5));
  return total / keys.size;
}

/** Biến thiên di truyền trung bình (độ lệch alen giữa các cá thể). */
export function variationOf(genomes: ReadonlyArray<Genome>): number {
  if (genomes.length < 2) return 0;
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < genomes.length; i++) {
    for (let j = i + 1; j < genomes.length; j++) {
      total += geneticDistance(genomes[i], genomes[j]);
      pairs++;
    }
  }
  return pairs > 0 ? clamp01(total / pairs) : 0;
}

function average(values: ReadonlyArray<number>): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values: ReadonlyArray<number>): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  return Math.sqrt(average(values.map((v) => (v - mean) ** 2)));
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Tạo nhanh áp lực chọn lọc phổ biến. */
export const COMMON_PRESSURES: ReadonlyArray<() => SelectionPressure> = Object.freeze([
  () => ({
    id: 'plague',
    coefficients: { immunity: 0.8, resilience: 0.4 },
    intensity: 0.7,
    note: 'dịch bệnh hoành hành, cá thể miễn dịch yếu bị loại',
  }),
  () => ({
    id: 'famine',
    coefficients: { metabolism: -0.5, size: -0.3, resilience: 0.5 },
    intensity: 0.6,
    note: 'khan hiếm thức ăn, cá thể to lớn tiêu tốn năng lượng bị bất lợi',
  }),
  () => ({
    id: 'predation',
    coefficients: { perception: 0.6, dexterity: 0.5, size: 0.3 },
    intensity: 0.5,
    note: 'thiên địch săn bắt, cá thể chậm chạp dễ bị hạ',
  }),
  () => ({
    id: 'cold_climate',
    coefficients: { size: 0.5, metabolism: 0.4, bodyHair: 0.6 },
    intensity: 0.6,
    note: 'khí hậu lạnh, cơ thể to và lông dày giữ nhiệt tốt hơn',
  }),
  () => ({
    id: 'sexual_selection',
    coefficients: { beauty: 0.5, charisma: 0.6, strength: 0.3 },
    intensity: 0.4,
    note: 'con cái chọn bạn đời hấp dẫn hơn',
  }),
]);
