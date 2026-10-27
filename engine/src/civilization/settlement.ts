/**
 * @file settlement.ts
 * @module @aetheria/engine/civilization/settlement
 * @description Khu định cư: dân số, nhà ở, sản xuất – tiêu thụ lương thực/nước,
 * vệ sinh, giáo dục, an ninh, thuế, xây dựng và nhân khẩu học. Đây là đơn vị
 * vật chất nhỏ nhất của tiến trình văn minh.
 */

import { LifeRandom } from '../life/stochastic.js';
import { clamp01, clampRange } from '../deeplearning/random.js';
import type { KnowledgeEra } from '../knowledge/knowledge-base.js';

/** Loại công trình. */
export type BuildingType =
  | 'hut'
  | 'house'
  | 'farm'
  | 'granary'
  | 'well'
  | 'temple'
  | 'school'
  | 'clinic'
  | 'workshop'
  | 'market'
  | 'wall'
  | 'library'
  | 'courthouse'
  | 'aqueduct'
  | 'factory';

/** Tài nguyên của khu định cư. */
export interface ResourceStock {
  food: number;
  water: number;
  wood: number;
  stone: number;
  metal: number;
  wealth: number;
  medicine: number;
  tools: number;
}

/** Chi phí xây dựng (một phần tài nguyên). */
export type ResourceCost = Partial<Record<keyof ResourceStock, number>>;

/** Đặc tả công trình. */
export interface BuildingSpec {
  type: BuildingType;
  name: string;
  cost: ResourceCost;
  /** Lao động cần để vận hành. */
  jobs: number;
  /** Số người ở được. */
  housing: number;
  /** Sản lượng mỗi ngày khi đủ lao động. */
  production: Partial<Record<keyof ResourceStock, number>>;
  sanitation: number;
  education: number;
  morale: number;
  security: number;
  /** Thời gian xây (ngày). */
  buildDays: number;
  era: KnowledgeEra;
}

/** Công trình đã xây. */
export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  workers: number;
  condition: number;
  progress: number;
  operational: boolean;
}

/** Bối cảnh môi trường của một tick. */
export interface SettlementContext {
  harvestMultiplier?: number;
  epidemicSeverity?: number;
  warSeverity?: number;
  tradeBonus?: number;
  rainfall?: number;
  temperature?: number;
  seed?: number | string;
}

/** Báo cáo khu định cư. */
export interface SettlementReport {
  id: string;
  name: string;
  population: number;
  stage: SettlementStage;
  morale: number;
  health: number;
  sanitation: number;
  education: number;
  security: number;
  housing: number;
  foodSecurity: number;
  waterSecurity: number;
  era: KnowledgeEra;
  detail: string;
}

/** Quy mô khu định cư. */
export type SettlementStage = 'hamlet' | 'village' | 'town' | 'city' | 'metropolis';

/** Đặc tả công trình mặc định. */
export const BUILDING_SPECS: Readonly<Record<BuildingType, BuildingSpec>> = Object.freeze({
  hut: {
    type: 'hut',
    name: 'Lán',
    cost: { wood: 12 },
    jobs: 0,
    housing: 4,
    production: {},
    sanitation: 0,
    education: 0,
    morale: 1,
    security: 1,
    buildDays: 3,
    era: 'stone',
  },
  house: {
    type: 'house',
    name: 'Nhà',
    cost: { wood: 20, stone: 8 },
    jobs: 0,
    housing: 8,
    production: {},
    sanitation: 2,
    education: 0,
    morale: 2,
    security: 2,
    buildDays: 5,
    era: 'stone',
  },
  farm: {
    type: 'farm',
    name: 'Ruộng',
    cost: { wood: 10, tools: 2 },
    jobs: 4,
    housing: 0,
    production: { food: 12 },
    sanitation: 0,
    education: 0,
    morale: 0,
    security: 0,
    buildDays: 4,
    era: 'bronze',
  },
  granary: {
    type: 'granary',
    name: 'Kho lương',
    cost: { wood: 25, stone: 6 },
    jobs: 1,
    housing: 0,
    production: {},
    sanitation: 1,
    education: 0,
    morale: 2,
    security: 0,
    buildDays: 6,
    era: 'bronze',
  },
  well: {
    type: 'well',
    name: 'Giếng nước',
    cost: { stone: 15 },
    jobs: 1,
    housing: 0,
    production: { water: 16 },
    sanitation: 5,
    education: 0,
    morale: 1,
    security: 0,
    buildDays: 4,
    era: 'stone',
  },
  temple: {
    type: 'temple',
    name: 'Đền',
    cost: { stone: 30, wood: 10 },
    jobs: 2,
    housing: 0,
    production: {},
    sanitation: 1,
    education: 1,
    morale: 5,
    security: 1,
    buildDays: 10,
    era: 'bronze',
  },
  school: {
    type: 'school',
    name: 'Trường học',
    cost: { wood: 25, stone: 10, wealth: 20 },
    jobs: 3,
    housing: 0,
    production: {},
    sanitation: 1,
    education: 10,
    morale: 2,
    security: 0,
    buildDays: 8,
    era: 'iron',
  },
  clinic: {
    type: 'clinic',
    name: 'Y xá',
    cost: { wood: 20, stone: 10, medicine: 8 },
    jobs: 3,
    housing: 0,
    production: { medicine: 1 },
    sanitation: 6,
    education: 1,
    morale: 3,
    security: 0,
    buildDays: 8,
    era: 'iron',
  },
  workshop: {
    type: 'workshop',
    name: 'Xưởng thủ công',
    cost: { wood: 20, stone: 8, tools: 4 },
    jobs: 4,
    housing: 0,
    production: { tools: 3, wealth: 4 },
    sanitation: 0,
    education: 1,
    morale: 0,
    security: 0,
    buildDays: 6,
    era: 'bronze',
  },
  market: {
    type: 'market',
    name: 'Chợ',
    cost: { wood: 25, stone: 8, wealth: 10 },
    jobs: 3,
    housing: 0,
    production: { wealth: 10 },
    sanitation: 0,
    education: 0,
    morale: 3,
    security: 0,
    buildDays: 7,
    era: 'bronze',
  },
  wall: {
    type: 'wall',
    name: 'Tường thành',
    cost: { stone: 40 },
    jobs: 1,
    housing: 0,
    production: {},
    sanitation: 0,
    education: 0,
    morale: 2,
    security: 12,
    buildDays: 12,
    era: 'iron',
  },
  library: {
    type: 'library',
    name: 'Thư viện',
    cost: { stone: 30, wood: 15, wealth: 30 },
    jobs: 3,
    housing: 0,
    production: {},
    sanitation: 0,
    education: 14,
    morale: 2,
    security: 0,
    buildDays: 12,
    era: 'medieval',
  },
  courthouse: {
    type: 'courthouse',
    name: 'Toà án',
    cost: { stone: 30, wood: 10, wealth: 25 },
    jobs: 3,
    housing: 0,
    production: { wealth: 3 },
    sanitation: 0,
    education: 2,
    morale: 2,
    security: 4,
    buildDays: 10,
    era: 'iron',
  },
  aqueduct: {
    type: 'aqueduct',
    name: 'Cống dẫn nước',
    cost: { stone: 50, tools: 10 },
    jobs: 2,
    housing: 0,
    production: { water: 60 },
    sanitation: 15,
    education: 0,
    morale: 4,
    security: 0,
    buildDays: 18,
    era: 'iron',
  },
  factory: {
    type: 'factory',
    name: 'Xưởng máy',
    cost: { stone: 40, metal: 30, tools: 15, wealth: 60 },
    jobs: 8,
    housing: 0,
    production: { wealth: 30, tools: 10 },
    sanitation: -2,
    education: 1,
    morale: -1,
    security: 0,
    buildDays: 20,
    era: 'industrial',
  },
});

/** Khu định cư. */
export class Settlement {
  public readonly id: string;
  public name: string;
  public population: number;
  public readonly buildings = new Map<string, Building>();
  public resources: ResourceStock;
  public morale: number;
  public health: number;
  public sanitation: number;
  public education: number;
  public security: number;
  public taxRate: number;
  public era: KnowledgeEra;
  public ageDays = 0;
  public readonly history: string[] = [];
  public lastBirths = 0;
  public lastDeaths = 0;
  public lastMigration = 0;
  private readonly random: LifeRandom;
  private buildingCounter = 0;

  constructor(config: {
    id: string;
    name?: string;
    population?: number;
    resources?: Partial<ResourceStock>;
    taxRate?: number;
    era?: KnowledgeEra;
    seed?: number | string;
  }) {
    this.id = config.id;
    this.name = config.name ?? config.id;
    this.population = Math.max(0, config.population ?? 20);
    this.resources = {
      food: Math.max(0, config.resources?.food ?? 60),
      water: Math.max(0, config.resources?.water ?? 60),
      wood: Math.max(0, config.resources?.wood ?? 30),
      stone: Math.max(0, config.resources?.stone ?? 15),
      metal: Math.max(0, config.resources?.metal ?? 2),
      wealth: Math.max(0, config.resources?.wealth ?? 20),
      medicine: Math.max(0, config.resources?.medicine ?? 2),
      tools: Math.max(0, config.resources?.tools ?? 4),
    };
    this.morale = 55;
    this.health = 60;
    this.sanitation = 25;
    this.education = 10;
    this.security = 20;
    this.taxRate = clamp01(config.taxRate ?? 0.12);
    this.era = config.era ?? 'stone';
    this.random = new LifeRandom(config.seed ?? config.id);
  }

  /** Số dân (làm tròn). */
  public get populationCount(): number {
    return Math.max(0, Math.round(this.population));
  }

  /** Quy mô dân số. */
  public get stage(): SettlementStage {
    const population = this.population;
    if (population < 100) return 'hamlet';
    if (population < 1000) return 'village';
    if (population < 10000) return 'town';
    if (population < 100000) return 'city';
    return 'metropolis';
  }

  /** Tổng nhà ở. */
  public get housingCapacity(): number {
    let capacity = 0;
    for (const building of this.buildings.values()) {
      if (!building.operational) continue;
      capacity += BUILDING_SPECS[building.type].housing * building.level;
    }
    return capacity;
  }

  /** Tổng việc làm. */
  public get jobsCapacity(): number {
    let jobs = 0;
    for (const building of this.buildings.values()) {
      if (!building.operational) continue;
      jobs += BUILDING_SPECS[building.type].jobs * building.level;
    }
    return jobs;
  }

  /** Bắt đầu xây một công trình; trả về bản ghi (chưa hoàn thành). */
  public build(type: BuildingType, options: { workers?: number; instant?: boolean } = {}): Building | null {
    const spec = BUILDING_SPECS[type];
    if (!this.canAfford(spec.cost)) return null;
    this.spend(spec.cost);
    const building: Building = {
      id: `building_${this.id}_${++this.buildingCounter}`,
      type,
      name: spec.name,
      level: 1,
      workers: Math.max(0, options.workers ?? spec.jobs),
      condition: 1,
      progress: options.instant ? 1 : 0,
      operational: Boolean(options.instant),
    };
    this.buildings.set(building.id, building);
    if (options.instant) this.history.push(`Xây xong ${spec.name}`);
    return building;
  }

  /** Gia cố/nâng cấp công trình. */
  public upgrade(buildingId: string, resources: ResourceCost = {}): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;
    if (!this.canAfford(resources)) return false;
    this.spend(resources);
    building.level = Math.min(5, building.level + 1);
    this.history.push(`Nâng cấp ${building.name} lên cấp ${building.level}`);
    return true;
  }

  /** Phá dỡ công trình, hoàn lại một phần vật liệu. */
  public demolish(buildingId: string): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;
    const spec = BUILDING_SPECS[building.type];
    for (const [key, value] of Object.entries(spec.cost) as Array<[keyof ResourceStock, number]>) {
      this.resources[key] += value * 0.3;
    }
    this.buildings.delete(buildingId);
    return true;
  }

  /** Có đủ tài nguyên không. */
  public canAfford(cost: ResourceCost): boolean {
    for (const [key, value] of Object.entries(cost) as Array<[keyof ResourceStock, number]>) {
      if (this.resources[key] < value) return false;
    }
    return true;
  }

  /** Trừ tài nguyên. */
  public spend(cost: ResourceCost): boolean {
    if (!this.canAfford(cost)) return false;
    for (const [key, value] of Object.entries(cost) as Array<[keyof ResourceStock, number]>) {
      this.resources[key] -= value;
    }
    return true;
  }

  /** Cộng tài nguyên. */
  public gain(gain: Partial<ResourceStock>): void {
    for (const [key, value] of Object.entries(gain) as Array<[keyof ResourceStock, number]>) {
      this.resources[key] = Math.max(0, this.resources[key] + value);
    }
  }

  /**
   * Cập nhật khu định cư qua `days` ngày: sản xuất, tiêu thụ, vệ sinh, giáo
   * dục, an ninh, nhân khẩu và di cư.
   */
  public tick(days = 1, context: SettlementContext = {}): SettlementReport {
    const elapsed = clampRange(days, 0, 3650);
    if (elapsed <= 0) return this.report();
    this.ageDays += elapsed;
    const harvest = clampRange(context.harvestMultiplier ?? 1, 0, 3);
    const epidemic = clamp01(context.epidemicSeverity ?? 0);
    const war = clamp01(context.warSeverity ?? 0);
    const trade = clampRange(context.tradeBonus ?? 1, 0, 3);

    // 1. Sản xuất từ công trình đang vận hành.
    const produced: ResourceStock = { food: 0, water: 0, wood: 0, stone: 0, metal: 0, wealth: 0, medicine: 0, tools: 0 };
    let sanitationSum = 0;
    let educationSum = 0;
    let moraleSum = 0;
    let securitySum = 0;
    for (const building of this.buildings.values()) {
      const spec = BUILDING_SPECS[building.type];
      if (!building.operational) {
        building.progress = clamp01(building.progress + elapsed / Math.max(1, spec.buildDays));
        if (building.progress >= 1) {
          building.operational = true;
          this.history.push(`Hoàn thành ${building.name}`);
        }
        continue;
      }
      const staffing = spec.jobs > 0 ? clamp01(building.workers / Math.max(1, spec.jobs)) : 1;
      const efficiency = staffing * (0.5 + building.condition * 0.5) * building.level;
      for (const [key, value] of Object.entries(spec.production) as Array<[keyof ResourceStock, number]>) {
        produced[key] += value * efficiency * elapsed * (key === 'food' ? harvest : 1) * (key === 'wealth' ? trade : 1);
      }
      sanitationSum += spec.sanitation * building.level;
      educationSum += spec.education * building.level;
      moraleSum += spec.morale * building.level;
      securitySum += spec.security * building.level;
      building.condition = clamp01(building.condition - elapsed * 0.0006);
    }

    // 2. Lao động dư thừa tạo thêm lương thực nhỏ (hái lượm, vườn nhà).
    const population = this.populationCount;
    const jobs = this.jobsCapacity;
    const idle = Math.max(0, population * 0.6 - jobs);
    produced.food += idle * 0.08 * elapsed * harvest;
    produced.wood += Math.max(0, idle * 0.03 * elapsed);
    produced.wealth += idle * 0.02 * elapsed * trade;

    // 3. Tiêu thụ.
    const foodNeed = population * 0.62 * elapsed;
    const waterNeed = population * 0.8 * elapsed;
    const foodAvailable = this.resources.food + produced.food;
    const waterAvailable = this.resources.water + produced.water;
    const foodConsumed = Math.min(foodAvailable, foodNeed);
    const waterConsumed = Math.min(waterAvailable, waterNeed);
    this.resources.food = Math.max(0, foodAvailable - foodConsumed);
    this.resources.water = Math.max(0, waterAvailable - waterConsumed);
    const foodSecurity = foodNeed > 0 ? clamp01(foodConsumed / foodNeed) : 1;
    const waterSecurity = waterNeed > 0 ? clamp01(waterConsumed / waterNeed) : 1;
    for (const [key, value] of Object.entries(produced) as Array<[keyof ResourceStock, number]>) {
      if (key === 'food' || key === 'water') continue;
      this.resources[key] = Math.max(0, this.resources[key] + value);
    }

    // 4. Thuế và chi tiêu công.
    const tax = Math.min(this.resources.wealth, population * 0.02 * elapsed * this.taxRate * (0.5 + this.morale / 200));
    this.resources.wealth = Math.max(0, this.resources.wealth - tax);

    // 5. Vệ sinh, giáo dục, an ninh, tinh thần.
    const density = population / Math.max(1, this.housingCapacity);
    const sanitationTarget = clampRange(20 + sanitationSum * 2 - density * 8 - (1 - foodSecurity) * 20, 0, 100);
    const educationTarget = clampRange(10 + educationSum * 3, 0, 100);
    const securityTarget = clampRange(15 + securitySum * 3 - war * 40, 0, 100);
    this.sanitation = clampRange(
      this.sanitation + (sanitationTarget - this.sanitation) * Math.min(1, elapsed / 30),
      0,
      100,
    );
    this.education = clampRange(
      this.education + (educationTarget - this.education) * Math.min(1, elapsed / 90),
      0,
      100,
    );
    this.security = clampRange(
      this.security + (securityTarget - this.security) * Math.min(1, elapsed / 20),
      0,
      100,
    );
    const moraleTarget = clampRange(
      40 +
        (foodSecurity - 0.5) * 40 +
        (waterSecurity - 0.5) * 30 +
        this.sanitation * 0.15 +
        this.security * 0.1 -
        epidemic * 35 -
        war * 30 +
        moraleSum * 0.5 +
        (density > 1.2 ? -15 : 5),
      0,
      100,
    );
    this.morale = clampRange(this.morale + (moraleTarget - this.morale) * Math.min(1, elapsed / 15), 0, 100);

    // 6. Sức khoẻ.
    const healthTarget = clampRange(
      50 +
        waterSecurity * 20 +
        foodSecurity * 15 +
        this.sanitation * 0.2 +
        this.resources.medicine * 1.5 -
        epidemic * 50 -
        density * 5,
      0,
      100,
    );
    this.health = clampRange(this.health + (healthTarget - this.health) * Math.min(1, elapsed / 25), 0, 100);

    // 7. Nhân khẩu học.
    const fertility = clamp01(
      0.00008 *
        (0.4 + foodSecurity * 0.5 + this.morale / 200 + this.health / 300) *
        (this.housingCapacity > population ? 1 : 0.35),
    );
    const mortality = clamp01(
      0.00003 +
        (1 - foodSecurity) * 0.0006 +
        (1 - waterSecurity) * 0.0008 +
        (1 - this.sanitation / 100) * 0.0002 +
        epidemic * 0.002 +
        war * 0.0015 +
        (this.health < 40 ? 0.0003 : 0),
    );
    const births = this.random.poisson(this.population * fertility * elapsed);
    const deaths = this.random.poisson(this.population * mortality * elapsed);
    this.lastBirths = births;
    this.lastDeaths = deaths;
    this.population = Math.max(0, this.population + births - deaths);
    const migrationPressure = (this.morale - 50) / 100 + (this.housingCapacity - this.population) / Math.max(10, this.population * 4);
    const migrationCount = this.random.poisson(Math.abs(migrationPressure) * this.population * 0.002 * elapsed);
    if (migrationPressure >= 0) {
      this.population += migrationCount;
      this.lastMigration = migrationCount;
    } else {
      this.population = Math.max(0, this.population - migrationCount);
      this.lastMigration = -migrationCount;
    }
    if (deaths > 0 && this.history.length < 500) this.history.push(`${Math.round(deaths)} người chết trong ${elapsed.toFixed(0)} ngày`);
    if (births > 0 && this.history.length < 500) this.history.push(`${Math.round(births)} trẻ chào đời trong ${elapsed.toFixed(0)} ngày`);

    return this.report();
  }

  /** Nhập cư chủ động (dùng khi có làn sóng tị nạn/tái định cư). */
  public addPopulation(count: number, reason = 'nhập cư'): void {
    const amount = Math.max(0, count);
    this.population += amount;
    if (this.history.length < 500) this.history.push(`+${Math.round(amount)} dân do ${reason}`);
  }

  /** Xuất cư/chết do thảm hoạ. */
  public removePopulation(count: number, reason = 'thảm hoạ'): number {
    const amount = Math.min(this.population, Math.max(0, count));
    this.population -= amount;
    if (this.history.length < 500) this.history.push(`-${Math.round(amount)} dân do ${reason}`);
    return amount;
  }

  /** Báo cáo. */
  public report(): SettlementReport {
    const population = this.populationCount;
    const foodNeed = population * 0.62;
    const waterNeed = population * 0.8;
    const foodSecurity = foodNeed > 0 ? clamp01(this.resources.food / Math.max(1, foodNeed * 10)) : 1;
    const waterSecurity = waterNeed > 0 ? clamp01(this.resources.water / Math.max(1, waterNeed * 10)) : 1;
    return {
      id: this.id,
      name: this.name,
      population: this.population,
      stage: this.stage,
      morale: this.morale,
      health: this.health,
      sanitation: this.sanitation,
      education: this.education,
      security: this.security,
      housing: this.housingCapacity,
      foodSecurity,
      waterSecurity,
      era: this.era,
      detail: `${this.name}: ${population} dân (${this.stage}), lương thực ${foodSecurity >= 0.8 ? 'đủ' : 'thiếu'}, ` +
        `vệ sinh ${this.sanitation.toFixed(0)}%, học vấn ${this.education.toFixed(0)}%, an ninh ${this.security.toFixed(0)}%.`,
    };
  }

  /** Ảnh chụp. */
  public snapshot(): {
    id: string;
    name: string;
    population: number;
    resources: ResourceStock;
    buildings: Building[];
    morale: number;
    health: number;
    sanitation: number;
    education: number;
    security: number;
    taxRate: number;
    era: KnowledgeEra;
    ageDays: number;
    history: string[];
  } {
    return {
      id: this.id,
      name: this.name,
      population: this.population,
      resources: { ...this.resources },
      buildings: [...this.buildings.values()].map((building) => ({ ...building })),
      morale: this.morale,
      health: this.health,
      sanitation: this.sanitation,
      education: this.education,
      security: this.security,
      taxRate: this.taxRate,
      era: this.era,
      ageDays: this.ageDays,
      history: [...this.history],
    };
  }

  /** Khôi phục. */
  public static fromSnapshot(snapshot: ReturnType<Settlement['snapshot']>): Settlement {
    const settlement = new Settlement({
      id: snapshot.id,
      name: snapshot.name,
      population: snapshot.population,
      resources: snapshot.resources,
      taxRate: snapshot.taxRate,
      era: snapshot.era,
      seed: snapshot.id,
    });
    settlement.morale = snapshot.morale;
    settlement.health = snapshot.health;
    settlement.sanitation = snapshot.sanitation;
    settlement.education = snapshot.education;
    settlement.security = snapshot.security;
    settlement.ageDays = snapshot.ageDays;
    settlement.history.push(...snapshot.history);
    for (const building of snapshot.buildings) settlement.buildings.set(building.id, { ...building });
    return settlement;
  }
}
