/**
 * @file disease.ts
 * @module @aetheria/engine/life/disease
 * @description Bệnh tật, dịch tễ và chấn thương: định nghĩa mầm bệnh, đường
 * lây, thời kỳ ủ bệnh – lây nhiễm – hồi phục, miễn dịch, điều trị, đột biến
 * mầm bệnh, mô hình SEIR và tai nạn dẫn tới thương tích/nhiễm trùng.
 */

import { LifeRandom, rollAccident, type Accident, type AccidentType } from './stochastic.js';
import { clamp01, clampRange } from '../deeplearning/random.js';

/** Loại mầm bệnh. */
export type PathogenType = 'virus' | 'bacteria' | 'fungus' | 'parasite' | 'prion';

/** Đường lây truyền. */
export type TransmissionRoute =
  | 'airborne'
  | 'droplet'
  | 'contact'
  | 'vector'
  | 'waterborne'
  | 'foodborne'
  | 'bloodborne'
  | 'sexual'
  | 'vertical';

/** Một triệu chứng. */
export interface Symptom {
  id: string;
  name: string;
  severity: number;
  discomfort: number;
  contagiousness: number;
}

/** Định nghĩa bệnh. */
export interface DiseaseDefinition {
  id: string;
  name: string;
  pathogen: PathogenType;
  routes: TransmissionRoute[];
  incubationDays: number;
  infectiousDays: number;
  severity: number;
  lethality: number;
  symptoms: Symptom[];
  immunityDays: number;
  mutationRate: number;
  treatmentEffectiveness: number;
}

/** Trạng thái bệnh của một cá thể. */
export interface DiseaseState {
  id: string;
  entityId: string;
  diseaseId: string;
  phase: 'exposed' | 'infectious' | 'recovering' | 'recovered' | 'dead';
  daysInPhase: number;
  totalDays: number;
  severity: number;
  treated: boolean;
  immunity: number;
  sourceId?: string;
  symptoms: string[];
}

/** Loại sự kiện bệnh. */
export type DiseaseEventType =
  | 'exposed'
  | 'onset'
  | 'worsened'
  | 'improved'
  | 'recovered'
  | 'died'
  | 'immunity_gained'
  | 'treated';

/** Một sự kiện bệnh. */
export interface DiseaseEvent {
  type: DiseaseEventType;
  entityId: string;
  diseaseId: string;
  day: number;
  severity: number;
  detail: string;
}

/** Kết quả tiến triển bệnh. */
export interface DiseaseProgress {
  state: DiseaseState;
  events: DiseaseEvent[];
}

/** Bối cảnh sức đề kháng khi tiến triển bệnh. */
export interface DiseaseContext {
  immunity?: number;
  ageYears?: number;
  nutrition?: number;
  treatment?: number;
  medicine?: number;
  comorbidity?: number;
}

/** Thương tích do tai nạn. */
export interface Injury {
  id: string;
  entityId: string;
  type: AccidentType;
  severity: number;
  bleeding: number;
  infectionRisk: number;
  treated: boolean;
  healed: boolean;
  healDays: number;
  cause: string;
}

/** Định nghĩa bệnh mặc định của engine. */
export const DEFAULT_DISEASES: readonly DiseaseDefinition[] = Object.freeze([
  {
    id: 'influenza',
    name: 'Cúm',
    pathogen: 'virus',
    routes: ['airborne', 'droplet'],
    incubationDays: 2,
    infectiousDays: 5,
    severity: 0.3,
    lethality: 0.01,
    symptoms: [
      { id: 'fever', name: 'Sốt', severity: 0.3, discomfort: 0.3, contagiousness: 0.2 },
      { id: 'cough', name: 'Ho', severity: 0.3, discomfort: 0.2, contagiousness: 0.5 },
      { id: 'fatigue', name: 'Mệt mỏi', severity: 0.4, discomfort: 0.4, contagiousness: 0 },
    ],
    immunityDays: 180,
    mutationRate: 0.05,
    treatmentEffectiveness: 0.4,
  },
  {
    id: 'plague',
    name: 'Dịch hạch',
    pathogen: 'bacteria',
    routes: ['vector', 'droplet', 'contact'],
    incubationDays: 3,
    infectiousDays: 7,
    severity: 0.85,
    lethality: 0.45,
    symptoms: [
      { id: 'fever', name: 'Sốt cao', severity: 0.8, discomfort: 0.7, contagiousness: 0.4 },
      { id: 'bubo', name: 'Hạch sưng', severity: 0.8, discomfort: 0.8, contagiousness: 0.2 },
      { id: 'delirium', name: 'Mê sảng', severity: 0.7, discomfort: 0.6, contagiousness: 0 },
    ],
    immunityDays: 720,
    mutationRate: 0.02,
    treatmentEffectiveness: 0.65,
  },
  {
    id: 'cholera',
    name: 'Tả',
    pathogen: 'bacteria',
    routes: ['waterborne', 'foodborne'],
    incubationDays: 1,
    infectiousDays: 6,
    severity: 0.7,
    lethality: 0.3,
    symptoms: [
      { id: 'diarrhea', name: 'Tiêu chảy', severity: 0.8, discomfort: 0.7, contagiousness: 0.6 },
      { id: 'dehydration', name: 'Mất nước', severity: 0.9, discomfort: 0.8, contagiousness: 0 },
    ],
    immunityDays: 360,
    mutationRate: 0.01,
    treatmentEffectiveness: 0.8,
  },
  {
    id: 'rabies',
    name: 'Dại',
    pathogen: 'virus',
    routes: ['bloodborne', 'contact'],
    incubationDays: 10,
    infectiousDays: 5,
    severity: 1,
    lethality: 0.98,
    symptoms: [
      { id: 'hydrophobia', name: 'Sợ nước', severity: 0.9, discomfort: 0.9, contagiousness: 0.1 },
      { id: 'agitation', name: 'Kích động', severity: 0.8, discomfort: 0.7, contagiousness: 0.3 },
    ],
    immunityDays: 0,
    mutationRate: 0.005,
    treatmentEffectiveness: 0.05,
  },
  {
    id: 'pneumonia',
    name: 'Viêm phổi',
    pathogen: 'bacteria',
    routes: ['droplet', 'airborne'],
    incubationDays: 2,
    infectiousDays: 8,
    severity: 0.65,
    lethality: 0.12,
    symptoms: [
      { id: 'cough', name: 'Ho đờm', severity: 0.6, discomfort: 0.5, contagiousness: 0.4 },
      { id: 'breathlessness', name: 'Khó thở', severity: 0.7, discomfort: 0.7, contagiousness: 0.1 },
      { id: 'fever', name: 'Sốt', severity: 0.5, discomfort: 0.4, contagiousness: 0.2 },
    ],
    immunityDays: 240,
    mutationRate: 0.03,
    treatmentEffectiveness: 0.7,
  },
  {
    id: 'measles',
    name: 'Sởi',
    pathogen: 'virus',
    routes: ['airborne', 'droplet'],
    incubationDays: 8,
    infectiousDays: 6,
    severity: 0.5,
    lethality: 0.05,
    symptoms: [
      { id: 'rash', name: 'Phát ban', severity: 0.5, discomfort: 0.4, contagiousness: 0.3 },
      { id: 'fever', name: 'Sốt', severity: 0.6, discomfort: 0.5, contagiousness: 0.2 },
    ],
    immunityDays: 3650,
    mutationRate: 0.01,
    treatmentEffectiveness: 0.2,
  },
  {
    id: 'malaria',
    name: 'Sốt rét',
    pathogen: 'parasite',
    routes: ['vector', 'bloodborne'],
    incubationDays: 7,
    infectiousDays: 21,
    severity: 0.6,
    lethality: 0.1,
    symptoms: [
      { id: 'chills', name: 'Ớn lạnh', severity: 0.6, discomfort: 0.6, contagiousness: 0 },
      { id: 'fever', name: 'Sốt chu kỳ', severity: 0.7, discomfort: 0.6, contagiousness: 0 },
    ],
    immunityDays: 365,
    mutationRate: 0.04,
    treatmentEffectiveness: 0.6,
  },
  {
    id: 'food_poisoning',
    name: 'Ngộ độc thực phẩm',
    pathogen: 'bacteria',
    routes: ['foodborne'],
    incubationDays: 1,
    infectiousDays: 3,
    severity: 0.45,
    lethality: 0.02,
    symptoms: [
      { id: 'nausea', name: 'Buồn nôn', severity: 0.5, discomfort: 0.5, contagiousness: 0 },
      { id: 'diarrhea', name: 'Tiêu chảy', severity: 0.5, discomfort: 0.5, contagiousness: 0.2 },
    ],
    immunityDays: 90,
    mutationRate: 0.02,
    treatmentEffectiveness: 0.5,
  },
  {
    id: 'wound_infection',
    name: 'Nhiễm trùng vết thương',
    pathogen: 'bacteria',
    routes: ['contact', 'bloodborne'],
    incubationDays: 2,
    infectiousDays: 7,
    severity: 0.55,
    lethality: 0.08,
    symptoms: [
      { id: 'redness', name: 'Sưng đỏ', severity: 0.4, discomfort: 0.4, contagiousness: 0.1 },
      { id: 'pus', name: 'Mủ', severity: 0.5, discomfort: 0.5, contagiousness: 0.1 },
      { id: 'fever', name: 'Sốt', severity: 0.4, discomfort: 0.4, contagiousness: 0.1 },
    ],
    immunityDays: 120,
    mutationRate: 0.03,
    treatmentEffectiveness: 0.65,
  },
]);

/** Hệ số lây theo đường truyền. */
const ROUTE_FACTOR: Readonly<Record<TransmissionRoute, number>> = Object.freeze({
  airborne: 1,
  droplet: 0.85,
  contact: 0.7,
  vector: 0.5,
  waterborne: 0.8,
  foodborne: 0.6,
  bloodborne: 0.35,
  sexual: 0.3,
  vertical: 0.2,
});

/** Engine bệnh tật và chấn thương. */
export class DiseaseEngine {
  public readonly definitions = new Map<string, DiseaseDefinition>();
  public readonly infections = new Map<string, DiseaseState>();
  public readonly immunity = new Map<string, Map<string, number>>();
  public readonly injuries = new Map<string, Injury>();
  public readonly events: DiseaseEvent[] = [];

  constructor(definitions: readonly DiseaseDefinition[] = DEFAULT_DISEASES) {
    for (const definition of definitions) this.registerDisease(definition);
  }

  /** Đăng ký định nghĩa bệnh. */
  public registerDisease(definition: DiseaseDefinition): DiseaseDefinition {
    this.definitions.set(definition.id, definition);
    return definition;
  }

  /** Lấy định nghĩa. */
  public getDisease(diseaseId: string): DiseaseDefinition | undefined {
    return this.definitions.get(diseaseId);
  }

  /** Miễn dịch hiện tại của cá thể với bệnh (0..1). */
  public immunityLevel(entityId: string, diseaseId: string): number {
    return clamp01(this.immunity.get(entityId)?.get(diseaseId) ?? 0);
  }

  /** Tiêm phòng/gán miễn dịch. */
  public vaccinate(entityId: string, diseaseId: string, level = 0.9): number {
    const map = this.immunity.get(entityId) ?? new Map<string, number>();
    const value = clamp01(level);
    map.set(diseaseId, Math.max(map.get(diseaseId) ?? 0, value));
    this.immunity.set(entityId, map);
    return value;
  }

  /** Phơi nhiễm; trả `null` nếu đã miễn dịch hoặc đang mắc cùng bệnh. */
  public expose(
    entityId: string,
    diseaseId: string,
    options: { sourceId?: string; immunity?: number; random?: LifeRandom } = {},
  ): DiseaseState | null {
    const definition = this.definitions.get(diseaseId);
    if (!definition) return null;
    if (this.activeInfection(entityId, diseaseId)) return null;
    const immunity = Math.max(options.immunity ?? 0, this.immunityLevel(entityId, diseaseId));
    const random = options.random ?? new LifeRandom(`${entityId}:${diseaseId}`);
    if (random.chance(clamp01(immunity))) return null;

    const state: DiseaseState = {
      id: `infection_${entityId}_${diseaseId}_${random.int(0, 999_999)}`,
      entityId,
      diseaseId,
      phase: 'exposed',
      daysInPhase: 0,
      totalDays: 0,
      severity: 0,
      treated: false,
      immunity,
      sourceId: options.sourceId,
      symptoms: [],
    };
    this.infections.set(state.id, state);
    this.events.push({
      type: 'exposed',
      entityId,
      diseaseId,
      day: 0,
      severity: 0,
      detail: `Phơi nhiễm ${definition.name}`,
    });
    return state;
  }

  /** Ca đang hoạt động của một bệnh. */
  public activeInfection(entityId: string, diseaseId: string): DiseaseState | undefined {
    for (const state of this.infections.values()) {
      if (state.entityId === entityId && state.diseaseId === diseaseId && state.phase !== 'recovered' && state.phase !== 'dead') {
        return state;
      }
    }
    return undefined;
  }

  /** Mọi ca bệnh đang hoạt động của cá thể. */
  public activeInfections(entityId: string): DiseaseState[] {
    return [...this.infections.values()].filter(
      (state) => state.entityId === entityId && state.phase !== 'recovered' && state.phase !== 'dead',
    );
  }

  /** Tiến triển bệnh qua `days` ngày. */
  public progress(state: DiseaseState, days = 1, context: DiseaseContext = {}): DiseaseProgress {
    const definition = this.definitions.get(state.diseaseId);
    const events: DiseaseEvent[] = [];
    if (!definition || state.phase === 'recovered' || state.phase === 'dead') {
      return { state, events };
    }

    const immunity = clamp01(Math.max(state.immunity, context.immunity ?? 0));
    const treatment = clamp01(context.treatment ?? context.medicine ?? (state.treated ? definition.treatmentEffectiveness : 0));
    const ageFactor = 1 + clamp01(((context.ageYears ?? 30) - 40) / 120);
    const nutritionFactor = 1 - clamp01(context.nutrition ?? 0.5) * 0.3;
    const comorbidity = 1 + clamp01(context.comorbidity ?? 0) * 0.5;
    const severity =
      clamp01(definition.severity * ageFactor * nutritionFactor * comorbidity * (1 - immunity * 0.8) * (1 - treatment * 0.5));
    state.severity = severity;
    state.daysInPhase += Math.max(0, days);
    state.totalDays += Math.max(0, days);

    if (state.phase === 'exposed' && state.daysInPhase >= definition.incubationDays) {
      state.phase = 'infectious';
      state.daysInPhase = 0;
      state.symptoms = definition.symptoms.filter((symptom) => severity >= symptom.severity * 0.4).map((s) => s.id);
      events.push({
        type: 'onset',
        entityId: state.entityId,
        diseaseId: state.diseaseId,
        day: state.totalDays,
        severity,
        detail: `Phát bệnh ${definition.name}`,
      });
    }

    if (state.phase === 'infectious') {
      const recoveryChance = clamp01((1 - definition.lethality) * (0.4 + immunity * 0.4 + treatment * 0.2));
      if (state.daysInPhase >= definition.infectiousDays) {
        if (immunity + treatment * 0.4 >= severity * randomUnit(state, state.totalDays) || recoveryChance > severity) {
          state.phase = 'recovered';
          state.daysInPhase = 0;
          state.symptoms = [];
          const map = this.immunity.get(state.entityId) ?? new Map<string, number>();
          map.set(state.diseaseId, Math.max(map.get(state.diseaseId) ?? 0, clamp01(0.3 + definition.immunityDays / 3650)));
          this.immunity.set(state.entityId, map);
          events.push({
            type: 'recovered',
            entityId: state.entityId,
            diseaseId: state.diseaseId,
            day: state.totalDays,
            severity,
            detail: `Hồi phục ${definition.name}`,
          });
        } else {
          state.phase = 'dead';
          events.push({
            type: 'died',
            entityId: state.entityId,
            diseaseId: state.diseaseId,
            day: state.totalDays,
            severity,
            detail: `Tử vong do ${definition.name}`,
          });
        }
      } else if (severity > 0.75) {
        events.push({
          type: 'worsened',
          entityId: state.entityId,
          diseaseId: state.diseaseId,
          day: state.totalDays,
          severity,
          detail: `${definition.name} trở nặng`,
        });
      }
    }

    this.events.push(...events);
    return { state, events };
  }

  /** Điều trị ca bệnh. */
  public treat(state: DiseaseState, effectiveness = 0.5): DiseaseState {
    state.treated = true;
    state.immunity = clamp01(state.immunity + effectiveness * 0.2);
    this.events.push({
      type: 'treated',
      entityId: state.entityId,
      diseaseId: state.diseaseId,
      day: state.totalDays,
      severity: state.severity,
      detail: 'Được điều trị',
    });
    return state;
  }

  /** Có đang lây nhiễm không. */
  public isContagious(state: DiseaseState): boolean {
    const definition = this.definitions.get(state.diseaseId);
    return Boolean(definition && state.phase === 'infectious' && state.severity > 0.1);
  }

  /** Triệu chứng đang hoạt động. */
  public symptomsOf(state: DiseaseState): Symptom[] {
    const definition = this.definitions.get(state.diseaseId);
    if (!definition) return [];
    return definition.symptoms.filter((symptom) => state.symptoms.includes(symptom.id));
  }

  /**
   * Lây từ nguồn sang danh sách tiếp xúc. Trả ID những người bị lây.
   * Xác suất phụ thuộc đường lây, mức độ nặng, miễn dịch và thời gian tiếp xúc.
   */
  public transmit(
    source: DiseaseState,
    targets: readonly string[],
    options: { contactRate?: number; random?: LifeRandom; immunityOf?: (entityId: string) => number } = {},
  ): string[] {
    const definition = this.definitions.get(source.diseaseId);
    if (!definition || !this.isContagious(source)) return [];
    const random = options.random ?? new LifeRandom(`${source.id}:transmit`);
    const contactRate = clamp01(options.contactRate ?? 0.6);
    const routeFactor = definition.routes.reduce((max, route) => Math.max(max, ROUTE_FACTOR[route]), 0);
    const infected: string[] = [];

    for (const target of targets) {
      if (target === source.entityId) continue;
      const immunity = Math.max(options.immunityOf?.(target) ?? 0, this.immunityLevel(target, definition.id));
      const probability = clamp01(definition.severity * routeFactor * contactRate * (1 - immunity));
      if (!random.chance(probability)) continue;
      const state = this.expose(target, definition.id, { sourceId: source.entityId, random });
      if (state) infected.push(target);
    }
    return infected;
  }

  /** Đột biến mầm bệnh — tạo chủng mới. */
  public evolvePathogen(definition: DiseaseDefinition, seed: number | string): DiseaseDefinition {
    const random = new LifeRandom(seed);
    const variant: DiseaseDefinition = {
      ...definition,
      id: `${definition.id}_variant_${random.int(0, 9999)}`,
      name: `${definition.name} (chủng biến thể)`,
      severity: clamp01(definition.severity + random.gaussian(0, definition.mutationRate)),
      lethality: clamp01(definition.lethality + random.gaussian(0, definition.mutationRate)),
      incubationDays: Math.max(0.5, definition.incubationDays * (1 + random.gaussian(0, definition.mutationRate))),
      infectiousDays: Math.max(0.5, definition.infectiousDays * (1 + random.gaussian(0, definition.mutationRate))),
      immunityDays: Math.max(0, definition.immunityDays * (1 + random.gaussian(0, definition.mutationRate))),
      mutationRate: clamp01(definition.mutationRate + 0.005),
      symptoms: definition.symptoms.map((symptom) => ({
        ...symptom,
        severity: clamp01(symptom.severity + random.gaussian(0, 0.05)),
      })),
    };
    this.registerDisease(variant);
    return variant;
  }

  /** Gieo tai nạn cho một cá thể; tự động tạo thương tích. */
  public accident(
    entityId: string,
    options: {
      random?: LifeRandom;
      riskMultiplier?: number;
      bias?: Partial<Record<AccidentType, number>>;
      baseChance?: number;
    } = {},
  ): { accident: Accident; injury: Injury } | null {
    const random = options.random ?? new LifeRandom(entityId);
    const accident = rollAccident(entityId, random, {
      riskMultiplier: options.riskMultiplier,
      bias: options.bias,
      baseChance: options.baseChance,
    });
    if (!accident) return null;
    const injury = this.injure(entityId, accident, random);
    return { accident, injury };
  }

  /** Tạo thương tích từ tai nạn. */
  public injure(entityId: string, accident: Accident, random: LifeRandom = new LifeRandom(entityId)): Injury {
    const injury: Injury = {
      id: `injury_${entityId}_${random.int(0, 999_999)}`,
      entityId,
      type: accident.type,
      severity: accident.severity,
      bleeding: clamp01(accident.severity * random.range(0.4, 1)),
      infectionRisk: clamp01(accident.severity * random.range(0.1, 0.5)),
      treated: false,
      healed: false,
      healDays: Math.max(1, Math.round(3 + accident.severity * 40)),
      cause: accident.cause,
    };
    this.injuries.set(injury.id, injury);
    return injury;
  }

  /** Điều trị thương tích. */
  public treatInjury(injury: Injury, quality = 0.6): Injury {
    injury.treated = true;
    injury.infectionRisk = clamp01(injury.infectionRisk * (1 - clamp01(quality)));
    injury.healDays = Math.max(1, Math.round(injury.healDays * (1 - clamp01(quality) * 0.5)));
    return injury;
  }

  /** Hồi phục thương tích qua ngày; có thể nhiễm trùng. */
  public healInjury(
    injury: Injury,
    days = 1,
    random: LifeRandom = new LifeRandom(injury.id),
  ): { injury: Injury; infected: boolean } {
    if (injury.healed) return { injury, infected: false };
    injury.healDays -= Math.max(0, days);
    const infected = !injury.treated && random.chance(injury.infectionRisk);
    if (infected) {
      this.expose(injury.entityId, 'wound_infection', {
        sourceId: injury.id,
        random,
        immunity: 0.1,
      });
    }
    if (injury.healDays <= 0) injury.healed = true;
    return { injury, infected };
  }

  /** Xoá ca bệnh đã kết thúc khỏi bộ nhớ. */
  public pruneFinished(): number {
    let removed = 0;
    for (const [id, state] of this.infections) {
      if (state.phase === 'recovered' || state.phase === 'dead') {
        this.infections.delete(id);
        removed++;
      }
    }
    return removed;
  }
}

/** Nhiễu tất định từ trạng thái bệnh (0..1). */
function randomUnit(state: DiseaseState, day: number): number {
  const base = Math.sin(state.id.length * 12.9898 + day * 78.233) * 43758.5453;
  return base - Math.floor(base);
}

/** Trạng thái SEIR. */
export interface EpidemicState {
  susceptible: number;
  exposed: number;
  infectious: number;
  recovered: number;
  dead: number;
  day: number;
}

/** Cấu hình mô hình SEIR. */
export interface EpidemicConfig {
  population: number;
  initialInfectious?: number;
  beta?: number;
  incubationRate?: number;
  recoveryRate?: number;
  mortalityRate?: number;
  vaccinationRate?: number;
}

/** Mô hình SEIR liên tục, tích phân Euler. */
export class EpidemicModel {
  public readonly config: Required<EpidemicConfig>;
  public state: EpidemicState;

  constructor(config: EpidemicConfig) {
    this.config = {
      population: Math.max(1, config.population),
      initialInfectious: Math.max(0, config.initialInfectious ?? 1),
      beta: clampRange(config.beta ?? 0.45, 0, 5),
      incubationRate: clampRange(config.incubationRate ?? 0.2, 0.001, 5),
      recoveryRate: clampRange(config.recoveryRate ?? 0.15, 0.001, 5),
      mortalityRate: clampRange(config.mortalityRate ?? 0.02, 0, 5),
      vaccinationRate: clamp01(config.vaccinationRate ?? 0),
    };
    const infectious = Math.min(this.config.initialInfectious, this.config.population);
    const vaccinated = this.config.population * this.config.vaccinationRate;
    this.state = {
      susceptible: Math.max(0, this.config.population - infectious - vaccinated),
      exposed: 0,
      infectious,
      recovered: vaccinated,
      dead: 0,
      day: 0,
    };
  }

  /** Tỉ lệ lây cơ bản R0. */
  public basicReproductionNumber(): number {
    return this.config.beta / this.config.recoveryRate;
  }

  /** Ngưỡng miễn dịch cộng đồng để chặn dịch. */
  public herdImmunityThreshold(): number {
    const r0 = this.basicReproductionNumber();
    return r0 > 0 ? clamp01(1 - 1 / r0) : 0;
  }

  /** Một bước thời gian (ngày). */
  public step(days = 1, dt = 0.1): EpidemicState {
    const total = Math.max(0, days);
    const steps = Math.max(1, Math.ceil(total / dt));
    const h = total / steps;
    for (let i = 0; i < steps; i++) {
      const { beta, incubationRate, recoveryRate, mortalityRate } = this.config;
      const s = this.state;
      const population = s.susceptible + s.exposed + s.infectious + s.recovered;
      const infectionRate = (beta * s.susceptible * s.infectious) / Math.max(1, population);
      const newInfections = infectionRate * h;
      const newInfectious = incubationRate * s.exposed * h;
      const newRecovered = recoveryRate * s.infectious * (1 - mortalityRate) * h;
      const newDead = recoveryRate * s.infectious * mortalityRate * h;

      s.susceptible = Math.max(0, s.susceptible - newInfections);
      s.exposed = Math.max(0, s.exposed + newInfections - newInfectious);
      s.infectious = Math.max(0, s.infectious + newInfectious - newRecovered - newDead);
      s.recovered += newRecovered;
      s.dead += newDead;
      s.day += h;
    }
    return { ...this.state };
  }

  /** Chạy mô phỏng nhiều ngày. */
  public simulate(days: number): EpidemicState[] {
    const history: EpidemicState[] = [{ ...this.state }];
    for (let day = 0; day < Math.max(0, Math.floor(days)); day++) history.push(this.step(1));
    return history;
  }

  /** Tỉ lệ tử vong tích luỹ. */
  public caseFatalityRate(): number {
    const total = this.state.dead + this.state.recovered;
    return total > 0 ? this.state.dead / total : 0;
  }
}
