/**
 * @file stochastic.ts
 * @module @aetheria/engine/life/stochastic
 * @description Ngẫu nhiên sinh mệnh: phân phối mũ/Poisson/Gaussian, bảng sự
 * kiện có trọng số, tai nạn, bệnh tật và biến cố hiếm. Mọi hàm nhận RNG có
 * seed để mô phỏng tái lập được.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

/** RNG sinh mệnh — bọc DeepRandom với các phép phân phối chuyên dụng. */
export class LifeRandom extends DeepRandom {
  constructor(seed: number | string = 0x1f123bb5) {
    super(typeof seed === 'string' ? hashSeed(seed) : seed);
  }

  /** Bernoulli với xác suất `p`. */
  public trial(p: number): boolean {
    return this.chance(p);
  }

  /** Số mũi tiêm/va chạm theo Poisson. */
  public events(lambda: number): number {
    return this.poisson(lambda);
  }

  /** Thời gian tới sự kiện kế tiếp. */
  public waitTime(ratePerYear: number): number {
    return this.exponential(Math.max(0, ratePerYear));
  }

  /** Tuổi thọ mẫu theo phân phối Gompertz–Makeham xấp xỉ. */
  public lifespan(mean: number, variation = 0.15): number {
    return Math.max(1, this.gaussian(mean, mean * variation));
  }

  /** Chọn theo trọng số; trả `undefined` nếu bảng rỗng. */
  public weighted<T>(entries: ReadonlyArray<{ value: T; weight: number }>): T | undefined {
    if (entries.length === 0) return undefined;
    const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
    if (total <= 0) return entries[0].value;
    let roll = this.next() * total;
    for (const entry of entries) {
      roll -= Math.max(0, entry.weight);
      if (roll <= 0) return entry.value;
    }
    return entries[entries.length - 1].value;
  }
}

/** Loại tai nạn được mô phỏng. */
export type AccidentType =
  | 'fall'
  | 'drowning'
  | 'burn'
  | 'poisoning'
  | 'animal_attack'
  | 'lightning'
  | 'machinery'
  | 'childbirth'
  | 'choking'
  | 'collapse'
  | 'cold_exposure'
  | 'heat_stroke'
  | 'vehicle'
  | 'war';

/** Một tai nạn đã xảy ra. */
export interface Accident {
  id: string;
  entityId: string;
  type: AccidentType;
  severity: number;
  physicalDamage: number;
  shock: number;
  cause: string;
  timestamp: number;
}

/** Trọng số tai nạn theo bối cảnh. */
export const ACCIDENT_WEIGHTS: Readonly<Record<AccidentType, number>> = Object.freeze({
  fall: 20,
  drowning: 6,
  burn: 8,
  poisoning: 5,
  animal_attack: 8,
  lightning: 1,
  machinery: 5,
  childbirth: 4,
  choking: 4,
  collapse: 6,
  cold_exposure: 6,
  heat_stroke: 5,
  vehicle: 3,
  war: 3,
});

/** Mô tả nguyên nhân tai nạn. */
export const ACCIDENT_CAUSES: Readonly<Record<AccidentType, string>> = Object.freeze({
  fall: 'ngã từ độ cao',
  drowning: 'chết đuối',
  burn: 'bỏng lửa',
  poisoning: 'ngộ độc',
  animal_attack: 'bị động vật tấn công',
  lightning: 'sét đánh',
  machinery: 'tai nạn máy móc',
  childbirth: 'biến chứng sinh nở',
  choking: 'nghẹt thở',
  collapse: 'công trình đổ sập',
  cold_exposure: 'hạ thân nhiệt',
  heat_stroke: 'sốc nhiệt',
  vehicle: 'tai nạn giao thông',
  war: 'chiến tranh',
});

/**
 * Sinh tai nạn theo trọng số nền và hệ số rủi ro của tác nhân.
 * `riskMultiplier` > 1 tăng khả năng tai nạn nói chung; `bias` tăng một số loại.
 */
export function rollAccident(
  entityId: string,
  random: LifeRandom,
  options: {
    riskMultiplier?: number;
    bias?: Partial<Record<AccidentType, number>>;
    baseChance?: number;
    timestamp?: number;
  } = {},
): Accident | null {
  const chancePerCheck = clamp01(options.baseChance ?? 0.02) * clampRange(options.riskMultiplier ?? 1, 0, 10);
  if (!random.chance(chancePerCheck)) return null;

  const entries = (Object.keys(ACCIDENT_WEIGHTS) as AccidentType[]).map((type) => ({
    value: type,
    weight: ACCIDENT_WEIGHTS[type] * (options.bias?.[type] ?? 1),
  }));
  const type = random.weighted(entries) ?? 'fall';
  const severityRoll = random.next();
  const severity = clamp01(severityRoll ** 1.6);
  const physicalDamage = Math.round(severity * 80 + random.range(0, 20));
  const shock = clamp01(severity * 0.9 + random.next() * 0.1);

  return {
    id: `accident_${entityId}_${Date.now()}_${random.int(0, 9999)}`,
    entityId,
    type,
    severity,
    physicalDamage,
    shock,
    cause: ACCIDENT_CAUSES[type],
    timestamp: options.timestamp ?? Date.now(),
  };
}

/** Một biến cố sinh mệnh hiếm. */
export type RareEventType =
  | 'twin_birth'
  | 'genius_child'
  | 'miraculous_recovery'
  | 'prophetic_dream'
  | 'inherited_talent'
  | 'plague_outbreak'
  | 'famine'
  | 'earthquake'
  | 'meteor'
  | 'golden_era';

/** Biến cố hiếm với xác suất mỗi năm. */
export const RARE_EVENTS: ReadonlyArray<{ value: RareEventType; weight: number }> = Object.freeze([
  { value: 'twin_birth', weight: 1.5 },
  { value: 'genius_child', weight: 0.8 },
  { value: 'miraculous_recovery', weight: 0.5 },
  { value: 'prophetic_dream', weight: 0.4 },
  { value: 'inherited_talent', weight: 1.2 },
  { value: 'plague_outbreak', weight: 0.3 },
  { value: 'famine', weight: 0.4 },
  { value: 'earthquake', weight: 0.25 },
  { value: 'meteor', weight: 0.02 },
  { value: 'golden_era', weight: 0.15 },
]);

/** Gieo biến cố hiếm. */
export function rollRareEvent(random: LifeRandom, annualChance = 0.02): RareEventType | null {
  if (!random.chance(clamp01(annualChance))) return null;
  return random.weighted(RARE_EVENTS) ?? null;
}

/** Số người sống sót sau một sự kiện thảm hoạ. */
export function survivorsAfterDisaster(
  population: number,
  severity: number,
  random: LifeRandom,
): number {
  const mortality = clamp01(severity * random.range(0.4, 1.2));
  let survivors = 0;
  for (let i = 0; i < Math.max(0, Math.floor(population)); i++) {
    if (!random.chance(mortality)) survivors++;
  }
  return survivors;
}
