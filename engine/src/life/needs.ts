/**
 * @file needs.ts
 * @module @aetheria/engine/life/needs
 * @description Thang nhu cầu Maslow đa tầng: sinh lý, an toàn, thuộc về, tôn
 * trọng và tự khẳng định. Mỗi nhu cầu có độ khẩn cấp, tốc độ suy giảm, trọng
 * số và phản ứng với sự kiện sống (mất con, bị cô lập, đói, bệnh dịch…).
 */

import { clamp01, clampRange } from '../deeplearning/random.js';
import { LifeRandom } from './stochastic.js';

/** Năm tầng Maslow. */
export type NeedCategory =
  | 'physiological'
  | 'safety'
  | 'belonging'
  | 'esteem'
  | 'selfActualization';

/** Danh sách nhu cầu được mô phỏng. */
export type NeedId =
  // Sinh lý
  | 'hunger'
  | 'thirst'
  | 'sleep'
  | 'bodyTemperature'
  | 'excretion'
  // An toàn
  | 'shelter'
  | 'darknessFear'
  | 'monsterFear'
  | 'diseaseFear'
  // Tình cảm & thuộc về
  | 'maternalLove'
  | 'friendship'
  | 'romance'
  | 'isolationFear'
  // Tôn trọng
  | 'honor'
  | 'professionalPride'
  | 'shameOfFailure'
  // Tự khẳng định
  | 'exploration'
  | 'invention';

/** Trạng thái một nhu cầu. `urgency` càng cao càng cấp bách. */
export interface NeedState {
  id: NeedId;
  category: NeedCategory;
  urgency: number;
  baseline: number;
  decayPerDay: number;
  weight: number;
  /** Nhu cầu này có thể gây chết nếu bị bỏ quên. */
  critical: boolean;
}

/** Ảnh hưởng của sự kiện sống lên nhu cầu. */
export interface NeedEvent {
  type:
    | 'hunger'
    | 'thirst'
    | 'sleep'
    | 'cold'
    | 'heat'
    | 'shelter'
    | 'darkness'
    | 'monster'
    | 'epidemic'
    | 'birth'
    | 'child_death'
    | 'friend_death'
    | 'romance'
    | 'heartbreak'
    | 'isolation'
    | 'honor'
    | 'humiliation'
    | 'success'
    | 'failure'
    | 'discovery'
    | 'invention'
    | 'danger';
  intensity: number;
  sourceId?: string;
}

/** Hồ sơ nhu cầu mặc định. */
export const DEFAULT_NEEDS: ReadonlyArray<Omit<NeedState, 'urgency'>> = Object.freeze([
  { id: 'hunger', category: 'physiological', baseline: 18, decayPerDay: 9, weight: 1.5, critical: true },
  { id: 'thirst', category: 'physiological', baseline: 15, decayPerDay: 12, weight: 1.6, critical: true },
  { id: 'sleep', category: 'physiological', baseline: 20, decayPerDay: 8, weight: 1.2, critical: true },
  { id: 'bodyTemperature', category: 'physiological', baseline: 10, decayPerDay: 5, weight: 1.1, critical: true },
  { id: 'excretion', category: 'physiological', baseline: 5, decayPerDay: 5, weight: 0.7, critical: false },
  { id: 'shelter', category: 'safety', baseline: 8, decayPerDay: 2, weight: 0.9, critical: false },
  { id: 'darknessFear', category: 'safety', baseline: 0, decayPerDay: 0, weight: 0.4, critical: false },
  { id: 'monsterFear', category: 'safety', baseline: 0, decayPerDay: 0, weight: 0.5, critical: false },
  { id: 'diseaseFear', category: 'safety', baseline: 0, decayPerDay: 0, weight: 0.5, critical: false },
  { id: 'maternalLove', category: 'belonging', baseline: 5, decayPerDay: 1.5, weight: 1, critical: false },
  { id: 'friendship', category: 'belonging', baseline: 10, decayPerDay: 3, weight: 0.9, critical: false },
  { id: 'romance', category: 'belonging', baseline: 5, decayPerDay: 2.5, weight: 0.8, critical: false },
  { id: 'isolationFear', category: 'belonging', baseline: 0, decayPerDay: 0, weight: 0.6, critical: false },
  { id: 'honor', category: 'esteem', baseline: 5, decayPerDay: 1.5, weight: 0.6, critical: false },
  { id: 'professionalPride', category: 'esteem', baseline: 5, decayPerDay: 1, weight: 0.6, critical: false },
  { id: 'shameOfFailure', category: 'esteem', baseline: 0, decayPerDay: 0, weight: 0.5, critical: false },
  { id: 'exploration', category: 'selfActualization', baseline: 8, decayPerDay: 2, weight: 0.5, critical: false },
  { id: 'invention', category: 'selfActualization', baseline: 5, decayPerDay: 1.5, weight: 0.5, critical: false },
]);

/** Thứ tự tầng Maslow từ thấp tới cao. */
export const MASLOW_ORDER: readonly NeedCategory[] = Object.freeze([
  'physiological',
  'safety',
  'belonging',
  'esteem',
  'selfActualization',
]);

/** Mô hình nhu cầu cho một cá thể. */
export class NeedsModel {
  public readonly needs = new Map<NeedId, NeedState>();
  public readonly eventHistory: NeedEvent[] = [];
  private readonly random: LifeRandom;

  constructor(seed: number | string = 'needs', overrides: Partial<Record<NeedId, number>> = {}) {
    this.random = new LifeRandom(seed);
    for (const definition of DEFAULT_NEEDS) {
      const urgency = clamps(overrides[definition.id] ?? definition.baseline + this.random.range(-2, 2));
      this.needs.set(definition.id, { ...definition, urgency });
    }
  }

  /** Đọc độ khẩn cấp. */
  public urgencyOf(id: NeedId): number {
    return this.needs.get(id)?.urgency ?? 0;
  }

  /** Đặt mức khẩn cấp. */
  public setUrgency(id: NeedId, value: number): number {
    const need = this.needs.get(id);
    if (!need) return 0;
    need.urgency = clamps(value);
    return need.urgency;
  }

  /** Làm thoả mãn nhu cầu (giảm urgency). */
  public satisfy(id: NeedId, amount: number): number {
    const need = this.needs.get(id);
    if (!need) return 0;
    need.urgency = clamps(need.urgency - Math.max(0, amount));
    return 100 - need.urgency;
  }

  /** Làm nhu cầu cấp bách hơn (tăng urgency). */
  public deprive(id: NeedId, amount: number): number {
    const need = this.needs.get(id);
    if (!need) return 0;
    need.urgency = clamps(need.urgency + Math.max(0, amount));
    return need.urgency;
  }

  /** Cập nhật theo thời gian; `satisfaction` là bản ghi các nhu cầu được thoả mãn. */
  public tick(
    days = 1,
    context: Partial<Record<NeedId, number>> & { food?: number; water?: number; sleepQuality?: number } = {},
  ): NeedState[] {
    const elapsed = Math.max(0, days);
    for (const need of this.needs.values()) {
      let delta = need.decayPerDay * elapsed;
      const purchased = context[need.id];
      if (typeof purchased === 'number') delta -= Math.max(0, purchased);
      if (need.id === 'hunger' && typeof context.food === 'number') delta -= Math.max(0, context.food);
      if (need.id === 'thirst' && typeof context.water === 'number') delta -= Math.max(0, context.water);
      if (need.id === 'sleep' && typeof context.sleepQuality === 'number') delta -= Math.max(0, context.sleepQuality);
      need.urgency = clamps(need.urgency + delta);
    }
    return [...this.needs.values()];
  }

  /** Ứng dụng sự kiện cảm xúc/sinh hoạt. */
  public applyEvent(event: NeedEvent): NeedState[] {
    const amount = clampRange(event.intensity, 0, 100);
    switch (event.type) {
      case 'hunger':
        this.satisfy('hunger', amount);
        break;
      case 'thirst':
        this.satisfy('thirst', amount);
        break;
      case 'sleep':
        this.satisfy('sleep', amount);
        break;
      case 'cold':
        this.deprive('bodyTemperature', amount * 0.3);
        break;
      case 'heat':
        this.deprive('bodyTemperature', amount * 0.2);
        break;
      case 'shelter':
        this.satisfy('shelter', amount);
        break;
      case 'darkness':
        this.deprive('darknessFear', amount);
        break;
      case 'monster':
        this.deprive('monsterFear', amount);
        this.deprive('shelter', amount * 0.3);
        break;
      case 'epidemic':
        this.deprive('diseaseFear', amount);
        break;
      case 'birth':
        this.satisfy('maternalLove', amount * 0.6);
        this.satisfy('romance', amount * 0.3);
        break;
      case 'child_death':
        this.deprive('maternalLove', amount);
        this.deprive('isolationFear', amount * 0.8);
        break;
      case 'friend_death':
        this.deprive('friendship', amount * 0.8);
        this.deprive('isolationFear', amount);
        break;
      case 'romance':
        this.satisfy('romance', amount);
        this.satisfy('isolationFear', amount * 0.5);
        break;
      case 'heartbreak':
        this.deprive('romance', amount);
        this.deprive('isolationFear', amount * 0.7);
        break;
      case 'isolation':
        this.deprive('friendship', amount * 0.8);
        this.deprive('isolationFear', amount);
        break;
      case 'honor':
        this.satisfy('honor', amount);
        this.satisfy('professionalPride', amount * 0.5);
        break;
      case 'humiliation':
        this.deprive('shameOfFailure', amount);
        this.deprive('honor', amount * 0.7);
        break;
      case 'success':
        this.satisfy('professionalPride', amount);
        this.deprive('shameOfFailure', amount * 0.5);
        break;
      case 'failure':
        this.deprive('shameOfFailure', amount);
        this.deprive('professionalPride', amount * 0.7);
        break;
      case 'discovery':
        this.satisfy('exploration', amount);
        this.satisfy('invention', amount * 0.4);
        break;
      case 'invention':
        this.satisfy('invention', amount);
        this.satisfy('professionalPride', amount * 0.5);
        break;
      case 'danger':
        this.deprive('monsterFear', amount * 0.7);
        this.deprive('shelter', amount * 0.5);
        break;
    }
    this.eventHistory.push({ ...event });
    if (this.eventHistory.length > 200) this.eventHistory.shift();
    return [...this.needs.values()];
  }

  /** Nhu cầu cấp bách nhất trong một tầng. */
  public dominantIn(category: NeedCategory): NeedState | null {
    let best: NeedState | null = null;
    for (const need of this.needs.values()) {
      if (need.category !== category) continue;
      if (!best || need.urgency > best.urgency) best = need;
    }
    return best;
  }

  /** Nhu cầu cấp bách nhất; ưu tiên tầng thấp còn chưa thoả mãn. */
  public dominantNeed(): NeedState | null {
    for (const category of MASLOW_ORDER) {
      const need = this.dominantIn(category);
      if (need && need.urgency >= 45) return need;
    }
    let best: NeedState | null = null;
    for (const need of this.needs.values()) {
      if (!best || need.urgency > best.urgency) best = need;
    }
    return best;
  }

  /** Nhu cầu vượt ngưỡng nguy hiểm. */
  public criticalNeeds(threshold = 75): NeedState[] {
    return [...this.needs.values()].filter((need) => need.critical && need.urgency >= threshold);
  }

  /** Điểm thoả mãn của một tầng `[0, 100]`. */
  public categorySatisfaction(category: NeedCategory): number {
    const list = [...this.needs.values()].filter((need) => need.category === category);
    if (list.length === 0) return 100;
    let weighted = 0;
    let totalWeight = 0;
    for (const need of list) {
      weighted += (100 - need.urgency) * need.weight;
      totalWeight += need.weight;
    }
    return totalWeight > 0 ? weighted / totalWeight : 100;
  }

  /** Tiến trình Maslow: tầng nào đã được thoả mãn đủ để đi lên tầng cao hơn. */
  public maslowProgress(): Record<NeedCategory, number> {
    const progress = {} as Record<NeedCategory, number>;
    for (const category of MASLOW_ORDER) progress[category] = this.categorySatisfaction(category);
    return progress;
  }

  /** Tầng động cơ hiện tại (tầng thấp nhất chưa đạt 60%). */
  public activeMaslowLevel(): NeedCategory {
    for (const category of MASLOW_ORDER) {
      if (this.categorySatisfaction(category) < 60) return category;
    }
    return 'selfActualization';
  }

  /** Chỉ số hạnh phúc `[0, 100]` — trọng số giảm dần theo tầng. */
  public happiness(): number {
    let weighted = 0;
    let total = 0;
    const weights: Record<NeedCategory, number> = {
      physiological: 1.5,
      safety: 1.2,
      belonging: 1.1,
      esteem: 0.8,
      selfActualization: 0.6,
    };
    for (const category of MASLOW_ORDER) {
      weighted += this.categorySatisfaction(category) * weights[category];
      total += weights[category];
    }
    return total > 0 ? weighted / total : 0;
  }

  /** Căng thẳng do nhu cầu bị bỏ đói `[0, 100]`. */
  public stress(): number {
    const dominant = this.dominantNeed();
    const critical = this.criticalNeeds(70);
    const criticalPressure = critical.reduce((sum, need) => sum + need.urgency, 0);
    return clampRange(criticalPressure + (dominant?.urgency ?? 0) * 0.5, 0, 100);
  }

  /** Bản ghi urgency để đưa vào bộ não học sâu. */
  public toRecord(): Record<string, number> {
    const record: Record<string, number> = {};
    for (const [id, need] of this.needs) record[id] = need.urgency;
    return record;
  }
}

/** Kẹp `[0, 100]`. */
function clamps(value: number): number {
  return clampRange(value, 0, 100);
}

/** Tạo nhanh mô hình nhu cầu. */
export function createNeeds(seed: number | string = 'needs', overrides: Partial<Record<NeedId, number>> = {}): NeedsModel {
  return new NeedsModel(seed, overrides);
}

/** Tỉ lệ thoả mãn tổng hợp `[0, 1]`. */
export function overallSatisfaction(model: NeedsModel): number {
  return clamp01(model.happiness() / 100);
}
