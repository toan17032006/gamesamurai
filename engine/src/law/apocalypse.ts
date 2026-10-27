/**
 * @file apocalypse.ts
 * @module @aetheria/engine/law/apocalypse
 * @description Bốn Kị Sĩ Khải Huyền — thảm hoạ trần thế: **Dịch Bệnh** (sinh ra
 * các loại bệnh/virus MỚI với mức độ độc lực khác nhau, đột biến theo thời gian
 * và tự đăng ký vào DiseaseEngine của thế giới), **Nạn Đói** (mất mùa kéo nhiều
 * năm, đẩy nghèo đói và chết đói), **Chiến Tranh** (quốc gia cắn nhau khi tài
 * nguyên cạn) và **Tử Thần** (mortality spike quét toàn dân). Bốn con ngựa có
 * thể đi RỜI RẠC hoặc XUẤT HIỆN CÙNG NHAU — sự kiện Khải Huyền trọn vẹn hiếm
 * nhưng tàn khốc. Cường độ leo thang khi legitimacy sụp và dân đông.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import type { DiseaseDefinition, PathogenType, TransmissionRoute, Symptom } from '../life/disease.js';

// ===========================================================================
// Sinh mầm bệnh — dịch bệnh KHÔNG lặp lại cũ, luôn đột biến thành virus mới
// ===========================================================================

const PATHOGEN_TYPES: readonly PathogenType[] = ['virus', 'bacteria', 'fungus', 'parasite', 'prion'];
const TRANSMISSION_ROUTES: readonly TransmissionRoute[] = ['airborne', 'droplet', 'contact', 'vector', 'waterborne', 'foodborne', 'bloodborne'];

const SYMPTOM_POOL: ReadonlyArray<{ id: string; name: string; severity: number; discomfort: number; contagiousness: number }> = Object.freeze([
  { id: 'fever', name: 'sốt cao', severity: 0.5, discomfort: 0.6, contagiousness: 0.2 },
  { id: 'cough', name: 'ho dữ dội', severity: 0.4, discomfort: 0.5, contagiousness: 0.8 },
  { id: 'rash', name: 'phát ban đen', severity: 0.45, discomfort: 0.7, contagiousness: 0.1 },
  { id: 'vomiting', name: 'nôn mửa', severity: 0.5, discomfort: 0.8, contagiousness: 0.3 },
  { id: 'haemorrhage', name: 'xuất huyết', severity: 0.9, discomfort: 0.9, contagiousness: 0.4 },
  { id: 'paralysis', name: 'liệt chi', severity: 0.85, discomfort: 0.7, contagiousness: 0.05 },
  { id: 'delirium', name: 'nói sảng', severity: 0.6, discomfort: 0.6, contagiousness: 0.1 },
  { id: 'wasting', name: 'hao gầy dần', severity: 0.7, discomfort: 0.5, contagiousness: 0.05 },
  { id: 'buboes', name: 'cục đinh ý (bubo) sưng mủ', severity: 0.8, discomfort: 0.85, contagiousness: 0.5 },
  { id: 'rot', name: 'thịt hoại tử', severity: 0.9, discomfort: 1, contagiousness: 0.15 },
]);

const PLAGUE_NAME_PREFIXES = ['Tử Thần Đen', 'Lửa Máu', 'Hơi Thở Rồng', 'Mưa Xám', 'Xương Khô', 'Đêm Không Trăng', 'Vuốt Sắt', 'Sương Độc'];
const PLAGUE_NAME_SUFFIXES = ['hạch', 'phổi', 'máu', 'thần kinh', 'ruột', 'da', 'xương', 'hồn'];

/**
 * Sinh một **bệnh/virus hoàn toàn mới**: loài mầm bệnh, đường lây, độc lực,
 * bộ triệu chứng và cái tên — không trùng bệnh cũ trong thế giới. `era` và
 * `virulence` (mức dữ dội của Kị Sĩ) quyết định lethal/contagious.
 */
export function generatePathogen(
  seed: number | string,
  options: { virulence?: number; era?: 'stone' | 'medieval' | 'industrial' | 'modern' | 'far_future'; existingNames?: readonly string[] } = {},
): DiseaseDefinition {
  const random = new DeepRandom(`pathogen:${seed}`);
  const virulence = clampRange(options.virulence ?? 0.5, 0, 1);
  const era = options.era ?? 'medieval';

  const pathogen = random.pick(PATHOGEN_TYPES) ?? 'virus';
  // Số đường lây tăng theo độc lực — bệnh kinh khủng lây nhiều cách.
  const routeCount = clampRange(Math.round(1 + virulence * 2.5 + random.gaussian(0, 0.4)), 1, 4);
  const routes: TransmissionRoute[] = [];
  while (routes.length < routeCount) {
    const route = random.pick(TRANSMISSION_ROUTES)!;
    if (!routes.includes(route)) routes.push(route);
  }
  // Triệu chứng: 2-5 triệu chứng, nặng theo độc lực.
  const symptomCount = clampRange(Math.round(2 + virulence * 4 + random.gaussian(0, 0.5)), 2, 6);
  const symptoms: Symptom[] = [];
  while (symptoms.length < symptomCount) {
    const pool = SYMPTOM_POOL.filter((s) => !symptoms.some((chosen) => chosen.id === s.id));
    const picked = random.pick(pool.length > 0 ? pool : SYMPTOM_POOL)!;
    symptoms.push({ ...picked, severity: clamp01(picked.severity * (0.7 + virulence * 0.6)) });
  }

  // Tên mới:(prefix + loài) — nếu trùng thì thêm đợt đột biến.
  const existing = new Set(options.existingNames ?? []);
  let name = `${random.pick(PLAGUE_NAME_PREFIXES)} — ${pathogen === 'virus' ? 'Virus' : 'Bệnh'} ${random.pick(PLAGUE_NAME_SUFFIXES)}`;
  let mutationWave = 1;
  while (existing.has(name)) {
    mutationWave++;
    name = `${random.pick(PLAGUE_NAME_PREFIXES)} — ${pathogen === 'virus' ? 'Virus' : 'Bệnh'} ${random.pick(PLAGUE_NAME_SUFFIXES)} đợt ${mutationWave}`;
  }

  // Tham số dịch tễ: era hiện đại chữa trị tốt hơn; độc lực cao thì chết nhiều hơn.
  const eraTreatment: Record<NonNullable<typeof era>, number> = {
    stone: 0.05, medieval: 0.15, industrial: 0.35, modern: 0.6, far_future: 0.8,
  };
  const severity = clampRange(0.3 + virulence * 0.6 + random.gaussian(0, 0.06), 0.1, 1);
  const lethality = clampRange(
    severity * random.range(0.25, 0.55) * (era === 'far_future' ? 0.5 : era === 'modern' ? 0.6 : 1),
    0.01,
    0.6,
  );
  return {
    id: `plague_${hashSeed(`${seed}:${name}`).toString(16)}`,
    name,
    pathogen,
    routes,
    incubationDays: Math.max(1, Math.round(random.range(2, 14) * (1 - virulence * 0.4))),
    infectiousDays: Math.round(random.range(5, 30)),
    severity: Math.round(severity * 100) / 100,
    lethality: Math.round(lethality * 100) / 100,
    symptoms,
    immunityDays: Math.round(random.range(30, 720)),
    mutationRate: Math.round(clamp01(random.range(0.01, 0.15) + virulence * 0.05) * 1000) / 1000,
    treatmentEffectiveness: Math.round(clamp01(eraTreatment[era] + random.gaussian(0, 0.08)) * 100) / 100,
  };
}

// ===========================================================================
// Bốn Kị Sĩ
// ===========================================================================

export type HorsemanKind = 'pestilence' | 'famine' | 'war' | 'death';

export interface HorsemanRide {
  id: string;
  kind: HorsemanKind;
  year: number;
  /** Quốc gia/vùng bị go to. */
  locationId: string;
  /** Mức tàn khốc `[0, 1]`. */
  severity: number;
  /** Kéo dài bao nhiêu năm (dịch/nạn đói). */
  durationYears: number;
  /** Số người bị cuốn (ước lượng). */
  casualties: number;
  description: string;
  /** Bệnh mới sinh ra (riêng Kị Sĩ Dịch Bệnh). */
  spawnedDisease?: DiseaseDefinition;
}

export interface ApocalypseOptions {
  seed?: number | string;
  /** Xác suất nền một Kị Sĩ ghé mỗi năm mỗi quốc gia. */
  baseChancePerYear?: number;
  /** Bật cộng hưởng: bốn con ngựa kéo nhau tới. */
  allowFourTogether?: boolean;
}

interface ActiveCalamity {
  kind: HorsemanKind;
  locationId: string;
  yearsLeft: number;
  severity: number;
  spawnedDiseaseId?: string;
}

/**
 * Động cơ Bốn Kị Sĩ — gọi `rideOn(year)` mỗi năm thế giới:
 * mỗi quốc gia có xác suất bị một Kị Sĩ ghé; nạn đói/dịch kéo nhiều năm;
 * legitimacy sụp + dân đông làm chúng mạnh lên; hiếm hoi BỐN CON CÙNG XUẤT HIỆN.
 */
export class FourHorsemenEngine {
  public readonly rides: HorsemanRide[] = [];
  public readonly activeCalamities: ActiveCalamity[] = [];
  /** Bệnh đã sinh ra (tự đăng ký vào DiseaseEngine của thế giới qua callback). */
  public readonly spawnedDiseases: DiseaseDefinition[] = [];
  public readonly apocalypseLog: Array<{ year: number; note: string }> = [];
  public readonly baseChancePerYear: number;
  public readonly allowFourTogether: boolean;
  public readonly seed: number | string;

  private readonly random: DeepRandom;
  private onDiseaseSpawned?: (disease: DiseaseDefinition) => void;
  private onWarRequested?: (aggressorId: string, victimId: string, year: number) => void;

  constructor(options: ApocalypseOptions & {
    onDiseaseSpawned?: (disease: DiseaseDefinition) => void;
    onWarRequested?: (aggressorId: string, victimId: string, year: number) => void;
  } = {}) {
    this.seed = options.seed ?? 'aetheria-apocalypse';
    this.random = new DeepRandom(`${this.seed}:horsemen`);
    this.baseChancePerYear = clamp01(options.baseChancePerYear ?? 0.08);
    this.allowFourTogether = options.allowFourTogether ?? true;
    this.onDiseaseSpawned = options.onDiseaseSpawned;
    this.onWarRequested = options.onWarRequested;
  }

  /**
   * Một năm thế giới: mỗi quốc gia có thể bị ghé; Nạn Đói/Dịch kéo nhiều năm
   * (vẫn active thì không ghé lại); hiếm hoi bốn Kị Sĩ đồng hành.
   */
  public rideOn(
    year: number,
    states: ReadonlyArray<{ id: string; name: string; population: number; legitimacy: number }>,
  ): HorsemanRide[] {
    const rides: HorsemanRide[] = [];

    // Giảm dần năm còn lại của các thảm hoạ đang hoạt động.
    for (const calamity of this.activeCalamities) calamity.yearsLeft -= 1;
    for (let i = this.activeCalamities.length - 1; i >= 0; i--) {
      if (this.activeCalamities[i].yearsLeft <= 0) this.activeCalamities.splice(i, 1);
    }

    for (const state of states) {
      if (this.activeCalamities.some((c) => c.locationId === state.id)) continue; // đang chịu một thảm hoạ
      // Leo thang: legitimacy sụp + dân đông → ngựa phi nhanh hơn.
      const escalation = clamp01(1 - state.legitimacy) * 0.5 + clamp01(state.population / 5000) * 0.2;
      const chance = clamp01(this.baseChancePerYear + escalation * 0.25);
      if (!this.random.chance(chance)) continue;

      // Hiếm hoi: KHẢI HUYỀN TRỌN VẸN — bốn kị sĩ cùng một lúc.
      if (this.allowFourTogether && this.random.chance(0.01)) {
        rides.push(...this.fourTogether(state, year));
        this.apocalypseLog.push({
          year,
          note: `KHẢI HUYỀN TRỌN VẸN đè lên ${state.name} — bốn kị sĩ đồng hành, ${rides.reduce((sum, r) => sum + r.casualties, 0)} sinh mệnh`,
        });
        continue;
      }

      const virulence = clamp01(0.3 + escalation * 0.7);
      const weightedKinds: Array<{ value: HorsemanKind; weight: number }> = [
        { value: 'pestilence', weight: 0.35 },
        { value: 'famine', weight: 0.3 },
        { value: 'war', weight: 0.2 },
        { value: 'death', weight: 0.15 },
      ];
      const totalWeight = weightedKinds.reduce((sum, k) => sum + k.weight, 0);
      let roll = this.random.next() * totalWeight;
      let kind: HorsemanKind = 'pestilence';
      for (const k of weightedKinds) {
        roll -= k.weight;
        if (roll <= 0) {
          kind = k.value;
          break;
        }
      }
      rides.push(this.ride(kind, state, year, virulence));
    }

    this.rides.push(...rides);
    return rides;
  }

  /** Một Kị Sĩ ghé một quốc gia. */
  private ride(kind: HorsemanKind, state: { id: string; name: string; population: number; legitimacy: number }, year: number, virulence: number): HorsemanRide {
    const severity = clampRange(virulence * this.random.range(0.7, 1.2), 0.05, 1);
    switch (kind) {
      case 'pestilence': {
        const disease = generatePathogen(`${state.id}:${year}`, {
          virulence,
          existingNames: this.spawnedDiseases.map((d) => d.name),
        });
        this.spawnedDiseases.push(disease);
        this.onDiseaseSpawned?.(disease);
        const duration = Math.round(this.random.range(2, 6));
        this.activeCalamities.push({ kind, locationId: state.id, yearsLeft: duration, severity, spawnedDiseaseId: disease.id });
        const casualties = Math.round(state.population * disease.lethality * randomCoverFraction(this.random, duration));
        return {
          id: `ride_${hashSeed(`${kind}:${state.id}:${year}`).toString(16)}`,
          kind, year, locationId: state.id, severity: Math.round(severity * 100) / 100,
          durationYears: duration, casualties,
          description: `KỊ SĨ DỊCH BỆNH trút xuống ${state.name}: mầm bệnh mới "${disease.name}" (${disease.pathogen}, lây qua ${disease.routes.join('/')})`,
          spawnedDisease: disease,
        };
      }
      case 'famine': {
        const duration = Math.round(this.random.range(2, 5));
        this.activeCalamities.push({ kind, locationId: state.id, yearsLeft: duration, severity });
        const casualties = Math.round(state.population * severity * 0.18 * randomCoverFraction(this.random, duration));
        return {
          id: `ride_${hashSeed(`${kind}:${state.id}:${year}`).toString(16)}`,
          kind, year, locationId: state.id, severity: Math.round(severity * 100) / 100,
          durationYears: duration, casualties,
          description: `KỊ SĨ NẠN ĐÓI: ${duration} năm mất mùa ở ${state.name} — kho thóc cạn, đất nứt nẻ, dân ăn vỏ cây`,
        };
      }
      case 'war': {
        const casualties = Math.round(state.population * severity * 0.1);
        this.onWarRequested?.(state.id, `neighbour_of_${state.id}`, year);
        return {
          id: `ride_${hashSeed(`${kind}:${state.id}:${year}`).toString(16)}`,
          kind, year, locationId: state.id, severity: Math.round(severity * 100) / 100,
          durationYears: 1, casualties,
          description: `KỊ SĨ CHIẾN TRANH vỗ cánh trước cổng ${state.name} — lửa cháy làng mạc, đàn ông cầm vũ khí ra trận`,
        };
      }
      case 'death':
      default: {
        const casualties = Math.round(state.population * severity * 0.25);
        return {
          id: `ride_${hashSeed(`${kind}:${state.id}:${year}`).toString(16)}`,
          kind, year, locationId: state.id, severity: Math.round(severity * 100) / 100,
          durationYears: 1, casualties,
          description: `KỊ SĨ TỬ THẦN lướt qua ${state.name} im lặng — ai đến giờ của người đó thì đi, không phân biệt vua tôi`,
        };
      }
    }
  }

  /** KHẢI HUYỀN TRỌN VẸN: bốn kị sĩ cùng ghé một quốc gia. */
  private fourTogether(state: { id: string; name: string; population: number; legitimacy: number }, year: number): HorsemanRide[] {
    const virulence = clampRange(this.random.range(0.75, 1), 0, 1);
    const kinds: HorsemanKind[] = ['pestilence', 'famine', 'war', 'death'];
    return kinds.map((kind) => this.ride(kind, state, year, virulence));
  }

  /** Kị sĩ đang hoạt động ở đâu. */
  public calamitiesOf(locationId: string): ReadonlyArray<ActiveCalamity> {
    return this.activeCalamities.filter((c) => c.locationId === locationId);
  }

  /** Bệnh mới nhất sinh ra (phục vụ UI/log). */
  public latestPlague(): DiseaseDefinition | undefined {
    return this.spawnedDiseases[this.spawnedDiseases.length - 1];
  }

  public stats(): { rides: number; diseasesSpawned: number; active: number; apocalypses: number } {
    return {
      rides: this.rides.length,
      diseasesSpawned: this.spawnedDiseases.length,
      active: this.activeCalamities.length,
      apocalypses: this.apocalypseLog.length,
    };
  }
}

/** Phần trăm dân số bị quét trong toàn bộ thời gian calamity (tăng dần theo năm). */
function randomCoverFraction(random: DeepRandom, durationYears: number): number {
  return clampRange(random.range(0.25, 0.7) * Math.min(1, durationYears / 3), 0.05, 0.75);
}
