/**
 * @file society-events.ts
 * @module @aetheria/engine/law/society-events
 * @description Sự kiện xã hội của một quốc gia phong kiến: biểu tình, bạo loạn,
 * chèn ép dân thường, quý tộc ức hiếp, ban luật bất công, thẩm vấn (kể cả bức
 * cung sai), anh hùng trỗi dậy, khởi nghĩa và cải cách. Căng thẳng xã hội
 * (unrest) tích từ legitimacy sụp + uất ức + nghèo đói + áp bức — sự kiện rơi
 * theo trọng số; mỗi sự kiện có hậu quả thật lên legitimacy, an ninh, dân chúng.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import { type LawCode, type Statute, type PunishmentRecord, type LawSeverity } from './legal-system.js';
import { createStatute } from './legal-system.js';

// ===========================================================================
// Căng thẳng xã hội
// ===========================================================================

/** Trạng thái căng thẳng của một địa phương. */
export interface SocialTension {
  locationId: string;
  /** Bất ổn tổng `[0, 1]` — động cơ của biểu tình/bạo loạn. */
  unrest: number;
  /** Mức áp bức đang đè `[0, 1]`. */
  oppression: number;
  /** Dị nghị/ly tâm `[0, 1]`. */
  dissent: number;
  /** Nghèo đói `[0, 1]`. */
  poverty: number;
  history: Array<{ type: SocialEventType; year: number; severity: number }>;
}

export type SocialEventType =
  | 'protest'
  | 'riot'
  | 'repression'
  | 'noble_oppression'
  | 'unjust_law'
  | 'interrogation'
  | 'hero_rising'
  | 'rebellion'
  | 'reform'
  | 'corruption_scandal';

/** Một sự kiện xã hội đã xảy ra. */
export interface SocialEvent {
  id: string;
  type: SocialEventType;
  year: number;
  locationId: string;
  instigatorId?: string;
  targetId?: string;
  severity: number;
  cause: string;
  outcome: string;
  /** Thay đổi legitimacy nhà nước. */
  legitimacyDelta: number;
  casualties: number;
}

/** Tạo/tự động căng thẳng cho một địa phương. */
export function createTension(locationId: string): SocialTension {
  return { locationId, unrest: 0.1, oppression: 0.1, dissent: 0.1, poverty: 0.2, history: [] };
}

/**
 * Cập nhật căng thẳng mỗi kỳ: legitimacy thấp, uất ức, nghèo, áp bức đẩy
 * unrest; dân chúng yên ấm kéo xuống. Không âm vô hạn, không vượt 1.
 */
export function updateTension(
  tension: SocialTension,
  context: {
    legitimacy?: number;
    resentment?: number;
    taxBurden?: number;
    oppressionDelta?: number;
    peaceYears?: number;
    security?: number;
  },
): SocialTension {
  const legitimacy = clamp01(context.legitimacy ?? 0.7);
  const resentment = clamp01(context.resentment ?? 0.2);
  const taxBurden = clamp01(context.taxBurden ?? 0.3);
  tension.oppression = clamp01(tension.oppression + (context.oppressionDelta ?? 0));
  tension.poverty = clamp01(tension.poverty + taxBurden * 0.05 - 0.02);
  const drivers =
    (1 - legitimacy) * 0.35 +
    resentment * 0.3 +
    tension.oppression * 0.2 +
    tension.poverty * 0.15;
  tension.unrest = clamp01(tension.unrest * 0.9 + drivers * 0.25 - (context.peaceYears ?? 0) * 0.02 - clamp01((context.security ?? 0.4)) * 0.05);
  tension.dissent = clamp01(tension.dissent * 0.92 + drivers * 0.15);
  return tension;
}

// ===========================================================================
// Các sự kiện xã hội
// ===========================================================================

/** Biểu tình: dân tụ tập đòi điều gì đó — bị nghe hay bị dập. */
export function protest(options: {
  locationId: string;
  year: number;
  unrest: number;
  security: number;
  rulerLegitimacy: number;
  demand: string;
  random?: DeepRandom;
}): SocialEvent {
  const random = options.random ?? new DeepRandom(`protest:${options.locationId}:${options.year}`);
  const severity = clampRange(options.unrest * random.range(0.6, 1.2), 0, 1);
  // Nhà nước legit + an ninh mạnh → dập; yếu hơn → phải nhượng bộ.
  const crushed = random.chance(clamp01(options.security * 0.6 + options.rulerLegitimacy * 0.3));
  const legitimacyDelta = crushed ? -0.02 : -0.005;
  return {
    id: `event_protest_${hashSeed(`${options.locationId}:${options.year}`).toString(16)}`,
    type: 'protest',
    year: options.year,
    locationId: options.locationId,
    severity: Math.round(severity * 100) / 100,
    cause: `bất ổn ${Math.round(options.unrest * 100)}% — dân đòi ${options.demand}`,
    outcome: crushed
      ? `biểu tình bị dập bằng vũ lực — người bị bắt, uất ức ngấm sâu`
      : `nhà nước nhượng bộ phần nào trước yêu cầu ${options.demand}`,
    legitimacyDelta,
    casualties: crushed ? random.int(0, Math.round(severity * 12)) : 0,
  };
}

/** Quý tộc ức hiếp dân: chiếm đất, phu dịch quá tay. */
export function nobleOppression(options: {
  nobleId: string;
  nobleName: string;
  locationId: string;
  year: number;
  noblesGreed: number;
  peasantProtection: number;
  random?: DeepRandom;
}): SocialEvent {
  const random = options.random ?? new DeepRandom(`oppress:${options.nobleId}:${options.year}`);
  const severity = clampRange(options.noblesGreed * random.range(0.7, 1.3), 0, 1);
  const resisted = random.chance(clamp01(options.peasantProtection * 0.7));
  return {
    id: `event_oppress_${hashSeed(`${options.nobleId}:${options.year}`).toString(16)}`,
    type: 'noble_oppression',
    year: options.year,
    locationId: options.locationId,
    instigatorId: options.nobleId,
    severity: Math.round(severity * 100) / 100,
    cause: `${options.nobleName} chiếm ruộng, tăng phu dịch ngoài luật (tham ${Math.round(options.noblesGreed * 100)}%)`,
    outcome: resisted
      ? 'dân tụ lại chống giữ ruộng — quý tộc phải lùi một bước (lần này)'
      : 'dân gặm nhấm chịu đựng — uất ức ghi vào ký ức làng, chờ ngày bùng',
    legitimacyDelta: resisted ? 0.01 : -0.01,
    casualties: resisted ? random.int(0, 4) : 0,
  };
}

/** Ban luật bất công: luật lợi một phe, đè một phe. */
export function enactUnjustLaw(options: {
  stateId: string;
  lawCode: LawCode;
  enactedBy: string;
  year: number;
  targetGroup: string;
  benefitGroup: string;
  severity?: LawSeverity;
  random?: DeepRandom;
}): { event: SocialEvent; statute: Statute } {
  const random = options.random ?? new DeepRandom(`unjust:${options.stateId}:${options.year}`);
  const statute = createStatute({
    id: `law_unjust_${hashSeed(`${options.stateId}:${options.year}`).toString(16)}`,
    name: `Luật trưng thu tài sản ${options.targetGroup}`,
    domain: 'property',
    description: `Tước quyền ${options.targetGroup} để chở lợi cho ${options.benefitGroup}`,
    prohibitedActs: [`own_property_${options.targetGroup}`],
    severity: options.severity ?? 'felony',
    legitimacy: 0.15, // luật ác — dân biết ngay
    ambiguity: 0.4,
    enactedYear: options.year,
    enactedBy: options.enactedBy,
  });
  options.lawCode.enact(statute);
  return {
    statute,
    event: {
      id: `event_unjust_${hashSeed(`${options.stateId}:${options.year}`).toString(16)}`,
      type: 'unjust_law',
      year: options.year,
      locationId: options.stateId,
      instigatorId: options.enactedBy,
      severity: 0.8,
      cause: `ban luật bất công: đè ${options.targetGroup}, nuôi ${options.benefitGroup}`,
      outcome: `dân ${options.targetGroup} mất pháp lý — bất mãn lan ra toàn quốc`,
      legitimacyDelta: -0.05,
      casualties: 0,
    },
  };
}

/** Thẩm vấn: tra hỏi nghi phạm — thật cung hoặc bức cung sai. */
export function interrogate(options: {
  interrogatorId: string;
  suspectId: string;
  year: number;
  brutality: number;
  suspectInnocence: number;
  interrogatorCompetence: number;
  random?: DeepRandom;
}): {
  confession: 'truthful' | 'false_coerced' | 'none';
  trauma: number;
  suspectHealthDamage: number;
  note: string;
} {
  const random = options.random ?? new DeepRandom(`interrogate:${options.suspectId}:${options.year}`);
  const brutality = clamp01(options.brutality);
  const innocence = clamp01(options.suspectInnocence);
  const competence = clamp01(options.interrogatorCompetence);
  const healthDamage = Math.round(brutality * 35 * random.range(0.5, 1.2));
  // Bạo lực càng cao → càng dễ ra "lời khai" — nhưng innocence cao thì lời khai là giả.
  const confessionChance = clamp01(brutality * 0.6 + competence * 0.25);
  let confession: 'truthful' | 'false_coerced' | 'none' = 'none';
  if (random.chance(confessionChance)) {
    confession = random.chance(innocence * (0.5 + brutality * 0.4)) ? 'false_coerced' : 'truthful';
  }
  const trauma = Math.round(clamp01(brutality * 0.6 + 0.1) * 100) / 100;
  const note =
    confession === 'truthful'
      ? 'nghi phạm khai thật sau chất vấn'
      : confession === 'false_coerced'
        ? 'BỨC CUNG SAI — người vô tội nhận tội vì không chịu nổi tra tấn'
        : brutality > 0.6
          ? 'chịu đựng hết mọi hình thức — không khai gì'
          : 'chất vấn bình thường, không tiến triển';
  return { confession, trauma, suspectHealthDamage: healthDamage, note };
}

/** Anh hùng trỗi dậy: người thường thành biểu tượng của một nghĩa lớn. */
export interface Hero {
  entityId: string;
  name: string;
  cause: string;
  year: number;
  /** Sức hút `[0, 1]` — decides người theo. */
  charisma: number;
  followers: number;
  path: 'reform' | 'rebellion' | 'legend';
  /** Đã thành legend (chết oanh liệt / thành công) chưa. */
  legendary: boolean;
}

export function heroRising(options: {
  entityId: string;
  name: string;
  cause: string;
  year: number;
  localUnrest: number;
  rulerLegitimacy: number;
  random?: DeepRandom;
}): Hero {
  const random = options.random ?? new DeepRandom(`hero:${options.entityId}:${options.year}`);
  // Anh hùng mọc lên đúng nơi bất ổn cao + vua mất lòng dân.
  const charisma = clamp01(options.localUnrest * 0.5 + (1 - options.rulerLegitimacy) * 0.4 + random.range(0, 0.2));
  const followers = Math.round(charisma * random.range(80, 400));
  return {
    entityId: options.entityId,
    name: options.name,
    cause: options.cause,
    year: options.year,
    charisma: Math.round(charisma * 100) / 100,
    followers,
    path: charisma > 0.7 ? 'rebellion' : charisma > 0.45 ? 'reform' : 'legend',
    legendary: false,
  };
}

/** Anh hùng hành động: cải cách thành/không, khởi nghĩa thắng/thua, thành huyền thoại. */
export function heroAct(
  hero: Hero,
  options: { stateSecurity: number; rulerLegitimacy: number; year: number; random?: DeepRandom },
): { event: SocialEvent; hero: Hero } {
  const random = options.random ?? new DeepRandom(`heroact:${hero.entityId}:${options.year}`);
  let outcome: string;
  let legitimacyDelta = 0;
  let casualties = 0;
  if (hero.path === 'reform') {
    const success = random.chance(clamp01(hero.charisma * 0.7 + 0.1));
    outcome = success
      ? `${hero.name} buộc triều đình cải cách "${hero.cause}" — luân lý chính trị thay đổi`
      : `${hero.name} bị đẩy lùi khỏi triều chính — cải cách "${hero.cause}" chưa tới thời`;
    legitimacyDelta = success ? 0.04 : -0.01;
  } else if (hero.path === 'rebellion') {
    const stateStrength = clamp01(options.stateSecurity * 0.6 + options.rulerLegitimacy * 0.4);
    const rebelStrength = clamp01(hero.charisma * random.range(0.7, 1.2));
    const won = rebelStrength > stateStrength;
    casualties = random.int(20, Math.round(80 + rebelStrength * 300));
    outcome = won
      ? `KHỞI NGHĨA THÀNH CÔNG — ${hero.name} lật đổ trật tự cũ dưới cờ "${hero.cause}"`
      : `khởi nghĩa của ${hero.name} bị dìm trong máu — ${casualties} người ngã xuống, cái tên trở thành truyền thuyết`;
    legitimacyDelta = won ? -0.15 : 0.02;
    if (!won) hero.legendary = true;
  } else {
    outcome = `${hero.name} thành câu chuyện kể bên lửa — huyền thoại ${hero.cause}`;
    hero.legendary = true;
  }
  const event: SocialEvent = {
    id: `event_hero_${hashSeed(`${hero.entityId}:${options.year}`).toString(16)}`,
    type: hero.path === 'rebellion' ? 'rebellion' : 'reform',
    year: options.year,
    locationId: hero.entityId,
    instigatorId: hero.entityId,
    severity: Math.round(hero.charisma * 100) / 100,
    cause: hero.cause,
    outcome,
    legitimacyDelta,
    casualties,
  };
  return { event, hero };
}

// ===========================================================================
// Động cơ sự kiện xã hội — roll sự kiện theo căng thẳng
// ===========================================================================

/** Động cơ sự kiện xã hội của một quốc gia. */
export class SocietyEventEngine {
  public readonly tensions = new Map<string, SocialTension>();
  public readonly events: SocialEvent[] = [];
  public readonly heroes = new Map<string, Hero>();
  private readonly random: DeepRandom;
  public readonly seed: number | string;

  constructor(options: { seed?: number | string } = {}) {
    this.seed = options.seed ?? 'aetheria-society';
    this.random = new DeepRandom(`${this.seed}:society`);
  }

  public tensionOf(locationId: string): SocialTension {
    let tension = this.tensions.get(locationId);
    if (!tension) {
      tension = createTension(locationId);
      this.tensions.set(locationId, tension);
    }
    return tension;
  }

  /** Áp bức tăng (quý tộc chèn ép) — gọi từ game khi quý tộc làm dữ. */
  public addOppression(locationId: string, amount: number): number {
    const tension = this.tensionOf(locationId);
    tension.oppression = clamp01(tension.oppression + clamp01(amount));
    tension.unrest = clamp01(tension.unrest + clamp01(amount) * 0.4);
    return tension.oppression;
  }

  /** Roll sự kiện tự nhiên theo căng thẳng hiện tại. */
  public rollEvent(
    locationId: string,
    year: number,
    context: { rulerLegitimacy: number; security: number; demand?: string },
  ): SocialEvent | null {
    const tension = this.tensionOf(locationId);
    if (!this.random.chance(clamp01(tension.unrest * 0.6))) return null;

    const weightedChoices: Array<{ value: 'protest' | 'riot' | 'corruption_scandal' | 'repression'; weight: number }> = [
      { value: 'protest', weight: 0.4 + tension.unrest * 0.3 },
      { value: 'riot', weight: tension.unrest * 0.5 },
      { value: 'corruption_scandal', weight: 0.2 + tension.dissent * 0.3 },
      { value: 'repression', weight: tension.oppression * 0.4 },
    ];
    const totalWeight = weightedChoices.reduce((sum, c) => sum + c.weight, 0);
    let roll = this.random.next() * totalWeight;
    let choice: 'protest' | 'riot' | 'corruption_scandal' | 'repression' = 'protest';
    for (const c of weightedChoices) {
      roll -= c.weight;
      if (roll <= 0) {
        choice = c.value;
        break;
      }
    }
    let event: SocialEvent;
    if (choice === 'riot') {
      event = {
        id: `event_riot_${hashSeed(`${locationId}:${year}`).toString(16)}`,
        type: 'riot',
        year,
        locationId,
        severity: Math.round(tension.unrest * 100) / 100,
        cause: 'bất ổn bùng thành bạo loạn — kho thóc, nhà quan, cổng thành',
        outcome: 'bạo loạn phá phách rồi bị dập — legitimacy nhà nước cháy cùng đám cháy',
        legitimacyDelta: -0.04,
        casualties: this.random.int(2, Math.round(10 + tension.unrest * 40)),
      };
      tension.unrest = clamp01(tension.unrest - 0.3);
    } else if (choice === 'corruption_scandal') {
      event = {
        id: `event_scandal_${hashSeed(`${locationId}:${year}`).toString(16)}`,
        type: 'corruption_scandal',
        year,
        locationId,
        severity: 0.5,
        cause: 'lộ hành vi quan lại vơ vét công quỹ',
        outcome: 'dân phẫn nộ — triều đình phải chém một con dê thay thế',
        legitimacyDelta: -0.02,
        casualties: 0,
      };
    } else if (choice === 'repression') {
      event = {
        id: `event_repress_${hashSeed(`${locationId}:${year}`).toString(16)}`,
        type: 'repression',
        year,
        locationId,
        severity: Math.round(tension.oppression * 100) / 100,
        cause: 'nhà nước đàn áp tiếng nói phản biện',
        outcome: 'im lặng phủ lên thị trấn — unrest chìm xuống nhưng dissent ngấm lên',
        legitimacyDelta: -0.01,
        casualties: this.random.int(0, 8),
      };
      tension.unrest = clamp01(tension.unrest - 0.15);
      tension.dissent = clamp01(tension.dissent + 0.1);
    } else {
      event = protest({
        locationId,
        year,
        unrest: tension.unrest,
        security: context.security,
        rulerLegitimacy: context.rulerLegitimacy,
        demand: context.demand ?? 'giảm thuế',
        random: this.random,
      });
      if (event.outcome.includes('nhượng bộ')) tension.unrest = clamp01(tension.unrest - 0.2);
    }
    tension.history.push({ type: event.type, year, severity: event.severity });
    this.events.push(event);
    return event;
  }

  /** Quý tộc chèn ép → tăng áp bức địa phương. */
  public noblePressure(options: {
    nobleId: string;
    nobleName: string;
    locationId: string;
    year: number;
    greed: number;
    peasantProtection: number;
  }): SocialEvent {
    const event = nobleOppression({
      nobleId: options.nobleId,
      nobleName: options.nobleName,
      locationId: options.locationId,
      year: options.year,
      noblesGreed: options.greed,
      peasantProtection: options.peasantProtection,
      random: this.random,
    });
    this.tensionOf(options.locationId).oppression = clamp01(this.tensionOf(options.locationId).oppression + event.severity * 0.3);
    this.events.push(event);
    return event;
  }

  /** Anh hùng trỗi dậy từ một địa điểm đang sôi. */
  public spawnHero(options: { entityId: string; name: string; locationId: string; cause: string; year: number; rulerLegitimacy: number }): Hero {
    const tension = this.tensionOf(options.locationId);
    const hero = heroRising({
      entityId: options.entityId,
      name: options.name,
      cause: options.cause,
      year: options.year,
      localUnrest: tension.unrest,
      rulerLegitimacy: options.rulerLegitimacy,
      random: this.random,
    });
    this.heroes.set(hero.entityId, hero);
    return hero;
  }

  /** Anh hùng ra tay. */
  public heroAct(entityId: string, context: { stateSecurity: number; rulerLegitimacy: number; year: number }): { event: SocialEvent; hero: Hero } | null {
    const hero = this.heroes.get(entityId);
    if (!hero) return null;
    const result = heroAct(hero, { ...context, random: this.random });
    this.events.push(result.event);
    return result;
  }

  public stats(): { locations: number; events: number; heroes: number; avgUnrest: number } {
    let unrestSum = 0;
    for (const tension of this.tensions.values()) unrestSum += tension.unrest;
    return {
      locations: this.tensions.size,
      events: this.events.length,
      heroes: this.heroes.size,
      avgUnrest: this.tensions.size > 0 ? unrestSum / this.tensions.size : 0,
    };
  }
}
