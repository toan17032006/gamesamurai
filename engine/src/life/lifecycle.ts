/**
 * @file lifecycle.ts
 * @module @aetheria/engine/life/lifecycle
 * @description Vòng đời sinh vật: sinh – trưởng thành – lão hoá – tử vong.
 * Quản lý dấu hiệu sinh tồn, vóc dáng theo tuổi, giai đoạn phát triển, giao
 * phối, thụ thai, mang thai, sinh nở, nguyên nhân tử vong tự nhiên/tai nạn và
 * di sản để lại cho thế hệ sau.
 */

import { LifeRandom } from './stochastic.js';
import { clamp01, clampRange } from '../deeplearning/random.js';
import {
  createGenome,
  expressGenome,
  inheritGenome,
  geneticDistance,
  inbreedingCoefficient,
  type Genome,
} from './genetics.js';

/** Giai đoạn vòng đời. */
export type LifeStage =
  | 'conception'
  | 'infancy'
  | 'childhood'
  | 'adolescence'
  | 'adulthood'
  | 'elderhood'
  | 'dead';

/** Nguyên nhân tử vong. */
export type DeathCause =
  | 'old_age'
  | 'disease'
  | 'starvation'
  | 'dehydration'
  | 'exposure'
  | 'accident'
  | 'predation'
  | 'violence'
  | 'childbirth'
  | 'suffocation'
  | 'poisoning'
  | 'lightning'
  | 'suicide'
  | 'unknown';

/** Dấu hiệu sinh tồn. */
export interface VitalSigns {
  heartRate: number;
  respirationRate: number;
  bodyTemperature: number;
  systolic: number;
  diastolic: number;
  oxygenSaturation: number;
  bloodGlucose: number;
  hydration: number;
  consciousness: number;
}

/** Vóc dáng cơ thể. */
export interface BodyMetrics {
  heightCm: number;
  massKg: number;
  bodyFat: number;
  muscleMass: number;
  brainMass: number;
}

/** Hồ sơ một sinh mệnh. */
export interface LifeHistory {
  id: string;
  name: string;
  species: string;
  sex: 'female' | 'male';
  genome: Genome;
  traits: Record<string, number>;
  birthYear: number;
  ageYears: number;
  stage: LifeStage;
  alive: boolean;
  health: number;
  maxHealth: number;
  fertility: number;
  pregnant: boolean;
  pregnancyDays: number;
  gestationDays: number;
  partnerId?: string;
  motherId?: string;
  fatherId?: string;
  children: string[];
  generation: number;
  vitalSigns: VitalSigns;
  body: BodyMetrics;
  deathCause?: DeathCause;
  deathYear?: number;
  killerId?: string;
  conditions: string[];
  trauma: number;
  wisdom: number;
}

/** Sự kiện vòng đời. */
export type LifeEventType =
  | 'aged'
  | 'stage_changed'
  | 'matured'
  | 'pregnant'
  | 'birth'
  | 'death'
  | 'illness'
  | 'injury'
  | 'recovered'
  | 'married'
  | 'bereaved'
  | 'milestone';

/** Một sự kiện vòng đời. */
export interface LifeEvent {
  type: LifeEventType;
  entityId: string;
  year: number;
  detail: string;
  relatedId?: string;
}

/** Kết quả cập nhật vòng đời. */
export interface LifeUpdate {
  being: LifeHistory;
  events: LifeEvent[];
}

/** Hồ sơ tăng trưởng theo loài. */
export interface GrowthProfile {
  species: string;
  gestationDays: number;
  adultHeightCm: number;
  adultMassKg: number;
  maturityAge: number;
  fertilityStart: number;
  fertilityEnd: number;
  brainMassKg: number;
}

/** Hồ sơ mặc định cho người. */
export const HUMAN_GROWTH: GrowthProfile = Object.freeze({
  species: 'human',
  gestationDays: 270,
  adultHeightCm: 170,
  adultMassKg: 65,
  maturityAge: 20,
  fertilityStart: 13,
  fertilityEnd: 50,
  brainMassKg: 1.4,
});

/** Đầu vào tạo sinh mệnh. */
export interface CreateLifeInput {
  id: string;
  name?: string;
  species?: string;
  sex?: 'female' | 'male';
  ageYears?: number;
  birthYear?: number;
  genome?: Genome;
  genomeSeed?: number | string;
  motherId?: string;
  fatherId?: string;
  generation?: number;
  growth?: Partial<GrowthProfile>;
  traits?: Record<string, number>;
  health?: number;
}

/** Kết quả giao phối. */
export interface MatingOutcome {
  success: boolean;
  compatibility: number;
  reason: string;
  childGenome?: Genome;
  pregnancyStarted: boolean;
}

/** Kết quả sinh nở. */
export interface BirthResult {
  mother: LifeHistory;
  father?: LifeHistory;
  child: LifeHistory;
  events: LifeEvent[];
}

/** Sự kiện tử vong. */
export interface DeathEvent {
  id: string;
  entityId: string;
  name: string;
  cause: DeathCause;
  year: number;
  ageYears: number;
  killerId?: string;
  witnesses: string[];
  detail: string;
}

/** Bảng trọng số nguyên nhân tử vong tự nhiên/tai nạn. */
export const DEATH_CAUSE_WEIGHTS: Readonly<Record<DeathCause, number>> = Object.freeze({
  old_age: 40,
  disease: 22,
  starvation: 5,
  dehydration: 4,
  exposure: 5,
  accident: 10,
  predation: 4,
  violence: 4,
  childbirth: 2,
  suffocation: 1,
  poisoning: 1,
  lightning: 0.2,
  suicide: 0.8,
  unknown: 0.5,
});

/** Mô tả nguyên nhân tử vong. */
export const DEATH_CAUSE_LABELS: Readonly<Record<DeathCause, string>> = Object.freeze({
  old_age: 'tuổi già',
  disease: 'bệnh tật',
  starvation: 'đói',
  dehydration: 'khát nước',
  exposure: 'phơi nhiễm môi trường',
  accident: 'tai nạn',
  predation: 'bị săn mồi',
  violence: 'bị sát hại',
  childbirth: 'biến chứng sinh nở',
  suffocation: 'ngạt thở',
  poisoning: 'ngộ độc',
  lightning: 'sét đánh',
  suicide: 'tự kết thúc cuộc đời',
  unknown: 'không rõ nguyên nhân',
});

/** Giai đoạn theo tỉ lệ tuổi thọ. */
export function lifeStageFor(ageYears: number, lifespanYears: number): LifeStage {
  if (ageYears < 0) return 'conception';
  const ratio = lifespanYears > 0 ? ageYears / lifespanYears : 1;
  if (ageYears < 2) return 'infancy';
  if (ratio < 0.16) return 'childhood';
  if (ratio < 0.26) return 'adolescence';
  if (ratio < 0.78) return 'adulthood';
  return 'elderhood';
}

/** Đường cong tăng trưởng logistic chuẩn hoá theo tuổi trưởng thành. */
export function growthFactor(ageYears: number, maturityAge = 20): number {
  const adult = 1 - Math.exp(-4 * Math.max(maturityAge, 1) / 80);
  const current = 1 - Math.exp(-4 * Math.max(0, ageYears) / 80);
  return clamp01(current / Math.max(adult, 1e-6));
}

/** Tính vóc dáng từ tuổi, giới tính và hồ sơ tăng trưởng. */
export function bodyMetricsFor(
  ageYears: number,
  profile: GrowthProfile,
  genome: Genome,
  sex: 'female' | 'male',
): BodyMetrics {
  const traits = expressGenome(genome);
  const size = clampRange(traits.size ?? 1, 0.3, 2.2);
  const growth = growthFactor(ageYears, profile.maturityAge);
  const sexFactor = sex === 'female' ? 0.92 : 1.04;
  const height = profile.adultHeightCm * sexFactor * size * growth;
  const mass = profile.adultMassKg * sexFactor * size ** 2.2 * growth ** 1.6;
  const ageDecline = ageYears > profile.maturityAge ? clamp01(1 - (ageYears - profile.maturityAge) / 120) : 1;
  const bodyFat = clampRange(0.12 + (1 - growth) * 0.1 + (ageYears > 50 ? 0.08 : 0), 0.05, 0.45);
  return {
    heightCm: Math.max(10, height),
    massKg: Math.max(1, mass * (0.85 + ageDecline * 0.15)),
    bodyFat,
    muscleMass: Math.max(0.5, mass * (1 - bodyFat) * 0.55),
    brainMass: profile.brainMassKg * (0.3 + growth * 0.7),
  };
}

/** Dấu hiệu sinh tồn cơ bản theo tuổi/trạng thái. */
export function baselineVitalSigns(ageYears: number, health: number): VitalSigns {
  const ageFactor = clampRange(ageYears / 100, 0, 1.5);
  const healthFactor = clamp01(health / 100);
  return {
    heartRate: 70 + ageFactor * 15 + (1 - healthFactor) * 30,
    respirationRate: 14 + ageFactor * 4 + (1 - healthFactor) * 8,
    bodyTemperature: 36.6 + (1 - healthFactor) * 0.8,
    systolic: 110 + ageFactor * 20,
    diastolic: 70 + ageFactor * 10,
    oxygenSaturation: 98 - (1 - healthFactor) * 12,
    bloodGlucose: 5 + (1 - healthFactor) * 2,
    hydration: 100,
    consciousness: clamp01(healthFactor * 100),
  };
}

/** Hàm nguy cơ tử vong Gompertz–Makeham theo tuổi. */
export function mortalityHazard(ageYears: number, lifespanYears = 80, health = 100, sex: 'female' | 'male' = 'female'): number {
  const baseline = 0.0002;
  const ageTerm = baseline * Math.exp(0.085 * Math.max(0, ageYears));
  const lifespanTerm = Math.max(0, ageYears - lifespanYears * 0.8) ** 2 / 2000;
  const healthTerm = (1 - clamp01(health / 100)) * 0.15;
  const sexTerm = sex === 'male' ? 1.15 : 1;
  return clampRange((ageTerm * sexTerm + lifespanTerm + healthTerm), 0, 1);
}

/** Engine vòng đời. */
export class LifecycleEngine {
  public readonly beings = new Map<string, LifeHistory>();
  public readonly deathEvents: DeathEvent[] = [];
  public readonly events: LifeEvent[] = [];
  public year = 0;
  private birthCounter = 0;

  /** Đăng ký một sinh mệnh đã có. */
  public register(being: LifeHistory): LifeHistory {
    this.beings.set(being.id, being);
    return being;
  }

  /** Tạo sinh mệnh mới. */
  public create(input: CreateLifeInput): LifeHistory {
    const growth = { ...HUMAN_GROWTH, ...(input.growth ?? {}) };
    const age = Math.max(0, input.ageYears ?? 0);
    const genome =
      input.genome ??
      createGenome(input.id, {
        seed: input.genomeSeed ?? input.id,
        generation: input.generation ?? 0,
        lineage: [input.id],
      });
    const traits = { ...expressGenome(genome), ...(input.traits ?? {}) };
    const lifespan = clampRange(traits.longevity ?? 80, 20, 130);
    const sex = input.sex ?? (new LifeRandom(input.id).chance(0.5) ? 'female' : 'male');
    const health = clampRange(input.health ?? 100, 0, 100);
    const stage = lifeStageFor(age, lifespan);
    const being: LifeHistory = {
      id: input.id,
      name: input.name ?? input.id,
      species: input.species ?? growth.species,
      sex,
      genome,
      traits,
      birthYear: input.birthYear ?? this.year - age,
      ageYears: age,
      stage,
      alive: true,
      health,
      maxHealth: 100,
      fertility: this.fertilityFor(age, sex, traits, growth),
      pregnant: false,
      pregnancyDays: 0,
      gestationDays: growth.gestationDays,
      partnerId: undefined,
      motherId: input.motherId,
      fatherId: input.fatherId,
      children: [],
      generation: input.generation ?? genome.generation,
      vitalSigns: baselineVitalSigns(age, health),
      body: bodyMetricsFor(age, growth, genome, sex),
      conditions: [],
      trauma: 0,
      wisdom: 0,
    };
    this.beings.set(being.id, being);
    return being;
  }

  /** Lấy sinh mệnh; chấp nhận id hoặc object. */
  public resolve(entity: LifeHistory | string): LifeHistory | undefined {
    return typeof entity === 'string' ? this.beings.get(entity) : entity;
  }

  /** Tuổi thọ dự kiến. */
  public lifespanOf(being: LifeHistory): number {
    return clampRange(being.traits.longevity ?? 80, 20, 130);
  }

  /**
   * Tuổi thọ kỳ vọng có điều kiện: còn bao nhiêu năm dự kiến sống từ tuổi hiện
   * tại, điều chỉnh bởi sức khoẻ, miễn dịch, khả năng phục hồi và mức suy giảm
   * theo tuổi. Khác `lifespanOf` (trần di truyền) — đây là dự báo thực tế.
   */
  public estimateLifeExpectancy(being: LifeHistory): { remainingYears: number; expectedAge: number; factors: string } {
    const lifespan = this.lifespanOf(being);
    const health = clamp01(being.health / 100);
    const immunity = clamp01((being.traits.immunity ?? 50) / 100);
    const resilience = clamp01((being.traits.resilience ?? 50) / 100);
    const ageRatio = clamp01(being.ageYears / lifespan);
    // Ươm mầm dự báo: phần đời còn lại nhân với sức khoẻ hiện tại (0.55–1.05)
    // và phục hồi (0.9–1.1); tuổi càng già thì sức khoẻ hiện tại chi phối càng mạnh.
    const healthFactor = 0.55 + 0.5 * health;
    const recoveryFactor = 0.9 + 0.2 * resilience;
    const diseaseFactor = 0.95 + 0.1 * immunity;
    const remaining = Math.max(0, lifespan - being.ageYears) * healthFactor * recoveryFactor * diseaseFactor;
    const expectedAge = Math.min(lifespan * 1.05, being.ageYears + remaining);
    return {
      remainingYears: Math.round(remaining * 10) / 10,
      expectedAge: Math.round(expectedAge * 10) / 10,
      factors: `sức khoẻ ${(health * 100).toFixed(0)}% (×${healthFactor.toFixed(2)}), phục hồi (×${recoveryFactor.toFixed(2)}), miễn dịch (×${diseaseFactor.toFixed(2)})`,
    };
  }

  /**
   * Kiểm tra cột mốc cuộc đời (lần đầu làm cha/mẹ, đỉnh nghề, bậc trí lão) —
   * mỗi cột mốc chỉ phát một lần, đánh dấu trong `conditions`.
   */
  public checkMilestones(being: LifeHistory): LifeEvent[] {
    const events: LifeEvent[] = [];
    const mark = (id: string, detail: string) => {
      const tag = `milestone:${id}`;
      if (being.conditions.includes(tag)) return;
      being.conditions.push(tag);
      events.push({ type: 'milestone', entityId: being.id, year: this.year, detail });
    };

    if (being.children.length >= 1) mark('first_child', `${being.name} lần đầu làm cha mẹ`);
    if (being.children.length >= 3) mark('large_family', `${being.name} nuôi dưỡng một gia đình đông con`);
    if (being.partnerId) mark('married', `${being.name} có bạn đời trọn vẹn`);
    const lifespan = this.lifespanOf(being);
    if (being.ageYears >= lifespan * 0.45 && being.ageYears < lifespan * 0.6) {
      mark('career_peak', `${being.name} tới đỉnh cao sự nghiệp và danh vọng`);
    }
    if (being.wisdom >= 80) mark('wisdom_elder', `${being.name} trở thành bậc trí lão của cộng đồng`);
    if (being.trauma >= 60) mark('scarred_survivor', `${being.name} mang những vết thương không phai`);
    return events;
  }

  /** Khả năng sinh sản theo tuổi/giới/tính trạng. */
  public fertilityFor(
    age: number,
    sex: 'female' | 'male',
    traits: Record<string, number>,
    growth: GrowthProfile = HUMAN_GROWTH,
  ): number {
    const start = growth.fertilityStart;
    const end = sex === 'female' ? growth.fertilityEnd : growth.fertilityEnd + 15;
    if (age < start || age > end) return 0;
    const fertilityTrait = clamp01((traits.fertility ?? 0.5));
    const window = end - start;
    const position = window > 0 ? (age - start) / window : 0;
    const ageCurve = Math.sin(Math.PI * clamp01(position)) ** 0.7;
    return clamp01(ageCurve * (0.4 + fertilityTrait * 0.6));
  }

  /** Cập nhật sinh mệnh qua số năm. */
  public tick(
    entity: LifeHistory | string,
    years = 1,
    context: {
      food?: number;
      water?: number;
      shelter?: number;
      diseaseSeverity?: number;
      random?: LifeRandom;
      witnesses?: string[];
    } = {},
  ): LifeUpdate {
    const being = this.resolve(entity);
    const events: LifeEvent[] = [];
    if (!being || !being.alive) return { being: being ?? this.missing(entity), events };

    const delta = Math.max(0, years);
    const previousStage = being.stage;
    being.ageYears += delta;
    being.body = bodyMetricsFor(being.ageYears, HUMAN_GROWTH, being.genome, being.sex);
    being.fertility = this.fertilityFor(being.ageYears, being.sex, being.traits);
    being.stage = lifeStageFor(being.ageYears, this.lifespanOf(being));

    if (being.stage !== previousStage) {
      events.push({
        type: being.stage === 'adulthood' ? 'matured' : 'stage_changed',
        entityId: being.id,
        year: this.year,
        detail: `${being.name} bước vào giai đoạn ${being.stage}`,
      });
    }

    const food = clamp01(context.food ?? 0.6);
    const water = clamp01(context.water ?? 0.7);
    const shelter = clamp01(context.shelter ?? 0.5);
    const disease = clamp01(context.diseaseSeverity ?? 0);
    const ageDecline = being.ageYears > this.lifespanOf(being) * 0.72 ? (being.ageYears - this.lifespanOf(being) * 0.72) * 0.35 : 0;
    const damage = (1 - food) * 8 + (1 - water) * 12 + (1 - shelter) * 4 + disease * 20 + ageDecline;
    const recovery = food > 0.7 && water > 0.7 && disease < 0.2 ? 4 : 0;
    being.health = clampRange(being.health + recovery - damage, 0, being.maxHealth);
    being.vitalSigns = baselineVitalSigns(being.ageYears, being.health);

    if (being.pregnant) {
      being.pregnancyDays += delta * 365;
      if (being.pregnancyDays >= being.gestationDays) {
        events.push({
          type: 'pregnant',
          entityId: being.id,
          year: this.year,
          detail: `${being.name} đã tới ngày sinh`,
        });
      }
    }

    // Cột mốc cuộc đời — chỉ phát khi vừa đạt, không lặp lại.
    if (events.length === 0 || being.health > 0) {
      events.push(...this.checkMilestones(being));
    }

    if (being.health <= 0) {
      const death = this.die(being, 'exposure', { witnesses: context.witnesses });
      events.push({ type: 'death', entityId: being.id, year: this.year, detail: death.detail });
    } else {
      const random = context.random ?? new LifeRandom(`${being.id}:${this.year}`);
      const hazard = mortalityHazard(being.ageYears, this.lifespanOf(being), being.health, being.sex);
      if (random.chance(1 - Math.exp(-hazard * delta))) {
        const death = this.die(being, 'old_age', { witnesses: context.witnesses });
        events.push({ type: 'death', entityId: being.id, year: this.year, detail: death.detail });
      }
    }

    this.events.push(...events);
    return { being, events };
  }

  /** Giao phối: kiểm tra tương thích, di truyền và bắt đầu thai kỳ. */
  public mate(
    a: LifeHistory | string,
    b: LifeHistory | string,
    options: { seed?: number | string; conceptionChance?: number; random?: LifeRandom } = {},
  ): MatingOutcome {
    const first = this.resolve(a);
    const second = this.resolve(b);
    if (!first || !second) return { success: false, compatibility: 0, reason: 'không tìm thấy sinh mệnh', pregnancyStarted: false };
    if (!first.alive || !second.alive) return { success: false, compatibility: 0, reason: 'một bên đã chết', pregnancyStarted: false };
    if (first.id === second.id) return { success: false, compatibility: 0, reason: 'không thể tự giao phối', pregnancyStarted: false };
    if (first.stage === 'infancy' || first.stage === 'childhood' || second.stage === 'infancy' || second.stage === 'childhood') {
      return { success: false, compatibility: 0, reason: 'chưa đến tuổi trưởng thành sinh sản', pregnancyStarted: false };
    }

    const distance = geneticDistance(first.genome, second.genome);
    const inbreeding = inbreedingCoefficient(first.genome, second.genome);
    const health = (clamp01(first.health / 100) + clamp01(second.health / 100)) / 2;
    const attraction =
      (clampRange(first.traits.charisma ?? 50, 0, 100) + clampRange(second.traits.charisma ?? 50, 0, 100)) / 200;
    const compatibility = clamp01(0.25 + (1 - distance) * 0.3 + health * 0.25 + attraction * 0.2 - inbreeding * 0.6);
    if (inbreeding > 0.35) {
      return { success: false, compatibility, reason: 'cận huyết quá cao', pregnancyStarted: false };
    }
    if (first.fertility <= 0 || second.fertility <= 0) {
      return { success: false, compatibility, reason: 'một bên không còn khả năng sinh sản', pregnancyStarted: false };
    }

    const random = options.random ?? new LifeRandom(options.seed ?? `${first.id}:${second.id}`);
    const conceptionChance = clamp01(options.conceptionChance ?? 0.35) * compatibility * Math.max(first.fertility, second.fertility);
    first.partnerId = second.id;
    second.partnerId = first.id;
    this.events.push({
      type: 'married',
      entityId: first.id,
      year: this.year,
      detail: `${first.name} và ${second.name} kết đôi`,
      relatedId: second.id,
    });

    if (!random.chance(conceptionChance)) {
      return { success: true, compatibility, reason: 'kết đôi nhưng chưa thụ thai', pregnancyStarted: false };
    }

    const mother = first.sex === 'female' ? first : second.sex === 'female' ? second : null;
    const father = first.sex === 'male' ? first : second.sex === 'male' ? second : null;
    if (!mother || !father) {
      return { success: true, compatibility, reason: 'kết đôi (không thể mang thai tự nhiên)', pregnancyStarted: false };
    }
    const childGenome = inheritGenome(mother.genome, father.genome, options.seed ?? `${mother.id}:${father.id}`);
    mother.pregnant = true;
    mother.pregnancyDays = 0;
    mother.gestationDays = HUMAN_GROWTH.gestationDays;
    return { success: true, compatibility, reason: 'thụ thai thành công', childGenome, pregnancyStarted: true };
  }

  /** Sinh con từ thai kỳ hiện tại. */
  public giveBirth(
    motherEntity: LifeHistory | string,
    fatherEntity?: LifeHistory | string,
    options: { seed?: number | string; name?: string } = {},
  ): BirthResult | null {
    const mother = this.resolve(motherEntity);
    if (!mother || !mother.alive || !mother.pregnant) return null;
    const father = fatherEntity ? this.resolve(fatherEntity) : mother.partnerId ? this.beings.get(mother.partnerId) : undefined;
    if (!father) return null;

    const childGenome = inheritGenome(mother.genome, father.genome, options.seed ?? `${mother.id}:${father.id}:birth`, {
      generation: Math.max(mother.generation, father.generation) + 1,
    });
    this.birthCounter++;
    const child = this.create({
      id: `child_${mother.id}_${this.birthCounter}`,
      name: options.name ?? `Con của ${mother.name}`,
      genome: childGenome,
      ageYears: 0,
      motherId: mother.id,
      fatherId: father.id,
      generation: childGenome.generation,
      genomeSeed: options.seed ?? childGenome.id,
    });
    mother.pregnant = false;
    mother.pregnancyDays = 0;
    mother.children.push(child.id);
    father.children.push(child.id);
    mother.health = clampRange(mother.health - 6, 0, 100);
    const events: LifeEvent[] = [
      {
        type: 'birth',
        entityId: child.id,
        year: this.year,
        detail: `${mother.name} sinh ra ${child.name}`,
        relatedId: mother.id,
      },
    ];
    this.events.push(...events);
    return { mother, father, child, events };
  }

  /**
   * Giết một sinh mệnh. Ghi lại kẻ giết, nhân chứng và di sản.
   * `cause` mặc định là `violence` khi có `killerId`.
   */
  public die(
    entity: LifeHistory | string,
    cause: DeathCause = 'unknown',
    options: { killerId?: string; witnesses?: string[]; year?: number } = {},
  ): DeathEvent {
    const being = this.resolve(entity) ?? this.missing(entity);
    const year = options.year ?? this.year;
    const resolvedCause = options.killerId && cause === 'unknown' ? 'violence' : cause;
    being.alive = false;
    being.health = 0;
    being.stage = 'dead';
    being.deathCause = resolvedCause;
    being.deathYear = year;
    being.killerId = options.killerId;
    being.vitalSigns = { ...being.vitalSigns, heartRate: 0, respirationRate: 0, oxygenSaturation: 0, consciousness: 0 };

    const event: DeathEvent = {
      id: `death_${being.id}_${year}`,
      entityId: being.id,
      name: being.name,
      cause: resolvedCause,
      year,
      ageYears: being.ageYears,
      killerId: options.killerId,
      witnesses: [...(options.witnesses ?? [])],
      detail: `${being.name} qua đời ở tuổi ${being.ageYears.toFixed(1)} do ${DEATH_CAUSE_LABELS[resolvedCause]}`,
    };
    this.deathEvents.push(event);
    this.events.push({ type: 'death', entityId: being.id, year, detail: event.detail });
    return event;
  }

  /** Giết bởi một sinh mệnh khác — ghi nhận quan hệ thủ phạm/nạn nhân. */
  public kill(
    victim: LifeHistory | string,
    killer: LifeHistory | string,
    options: { cause?: DeathCause; witnesses?: string[] } = {},
  ): DeathEvent {
    const killerBeing = this.resolve(killer);
    return this.die(victim, options.cause ?? 'violence', {
      killerId: killerBeing?.id,
      witnesses: options.witnesses,
    });
  }

  /** Chọn nguyên nhân tử vong theo trọng số và bối cảnh. */
  public determineDeathCause(
    entity: LifeHistory | string,
    options: { random?: LifeRandom; disease?: boolean; starving?: boolean; dehydrated?: boolean; violence?: boolean } = {},
  ): DeathCause {
    const being = this.resolve(entity);
    if (!being) return 'unknown';
    if (options.violence) return 'violence';
    if (options.disease) return 'disease';
    if (options.starving) return 'starvation';
    if (options.dehydrated) return 'dehydration';
    if (being.ageYears >= this.lifespanOf(being) * 0.85) return 'old_age';

    const random = options.random ?? new LifeRandom(`${being.id}:death`);
    const entries = (Object.keys(DEATH_CAUSE_WEIGHTS) as DeathCause[]).map((cause) => ({
      value: cause,
      weight: DEATH_CAUSE_WEIGHTS[cause],
    }));
    return random.weighted(entries) ?? 'unknown';
  }

  /** Xác suất tử vong trong `years` năm tới. */
  public mortalityRisk(entity: LifeHistory | string, years = 1): number {
    const being = this.resolve(entity);
    if (!being) return 0;
    const hazard = mortalityHazard(being.ageYears, this.lifespanOf(being), being.health, being.sex);
    return clamp01(1 - Math.exp(-hazard * Math.max(0, years)));
  }

  /** Tổng hợp mô tả một sinh mệnh. */
  public describe(entity: LifeHistory | string): string {
    const being = this.resolve(entity);
    if (!being) return 'Không tìm thấy sinh mệnh';
    const status = being.alive ? `còn sống, sức khoẻ ${being.health.toFixed(0)}/100` : `đã mất do ${DEATH_CAUSE_LABELS[being.deathCause ?? 'unknown']}`;
    return `${being.name} (${being.species}, ${being.stage}, ${being.ageYears.toFixed(1)} tuổi): ${status}; ` +
      `cao ${being.body.heightCm.toFixed(0)} cm, nặng ${being.body.massKg.toFixed(1)} kg, ` +
      `sinh lực ${being.fertility.toFixed(2)}, thế hệ ${being.generation}.`;
  }

  /** Xoá sinh mệnh đã chết khỏi bộ nhớ hoạt động. */
  public pruneDead(): number {
    let removed = 0;
    for (const [id, being] of this.beings) {
      if (!being.alive) {
        this.beings.delete(id);
        removed++;
      }
    }
    return removed;
  }

  /** Sinh mệnh giữ chỗ khi id không tồn tại (tránh ném lỗi trong mô phỏng). */
  private missing(entity: LifeHistory | string): LifeHistory {
    const id = typeof entity === 'string' ? entity : entity.id;
    return this.create({ id, name: id, ageYears: 0 });
  }
}
