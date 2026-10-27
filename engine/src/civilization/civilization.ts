/**
 * @file civilization.ts
 * @module @aetheria/engine/civilization/civilization
 * @description Nền văn minh: tập hợp khu định cư, văn hoá, thiết chế, tri thức
 * và công nghệ. Tính chỉ số văn minh – cổ hủ, thúc đẩy cải cách, giáo dục, y tế,
 * nghiên cứu, giao thương và xung đột giữa các nền văn minh.
 */

import { LifeRandom } from '../life/stochastic.js';
import { clamp01, clampRange } from '../deeplearning/random.js';
import {
  createKnowledgeBase,
  KNOWLEDGE_ERAS,
  type KnowledgeBase,
  type KnowledgeEra,
} from '../knowledge/knowledge-base.js';
import { createTechTree, TechTree } from '../knowledge/tech-tree.js';
import { Settlement, type SettlementContext, type SettlementReport } from './settlement.js';
import { Culture, seedArchaicCulture } from './culture.js';
import { InstitutionRegistry, type InstitutionContext } from './institution.js';

/** Giai đoạn văn minh. */
export type CivilizationStage = 'archaic' | 'tribal' | 'feudal' | 'mercantile' | 'industrial' | 'enlightened';

/** Bộ chỉ số văn minh `[0, 1]`. */
export interface CivilizationMetrics {
  civility: number;
  archaism: number;
  tradition: number;
  rationality: number;
  tolerance: number;
  ruleOfLaw: number;
  education: number;
  sanitation: number;
  equality: number;
  violence: number;
  superstition: number;
  corruption: number;
  innovation: number;
  civicParticipation: number;
}

/** Một sự kiện lịch sử của nền văn minh. */
export interface CivilizationEvent {
  year: number;
  type: 'foundation' | 'era' | 'reform' | 'war' | 'peace' | 'trade' | 'plague' | 'famine' | 'discovery' | 'unrest' | 'golden_age';
  description: string;
  severity: number;
}

/** Bối cảnh mô phỏng một nền văn minh. */
export interface CivilizationContext {
  harvestMultiplier?: number;
  epidemicSeverity?: number;
  warSeverity?: number;
  tradeBonus?: number;
  threat?: number;
  contactRate?: number;
  innovation?: number;
  corruptionPressure?: number;
}

/** Báo cáo nền văn minh. */
export interface CivilizationReport {
  id: string;
  name: string;
  year: number;
  stage: CivilizationStage;
  era: KnowledgeEra;
  population: number;
  settlements: SettlementReport[];
  metrics: CivilizationMetrics;
  treasury: number;
  stability: number;
  detail: string;
}

/** Cấu hình tạo nền văn minh. */
export interface CivilizationConfig {
  id: string;
  name?: string;
  seed?: number | string;
  era?: KnowledgeEra;
  settlements?: Settlement[];
  culture?: Culture;
  institutions?: InstitutionRegistry;
  knowledge?: KnowledgeBase;
  techTree?: TechTree;
  treasury?: number;
}

/** Một nền văn minh. */
export class Civilization {
  public readonly id: string;
  public name: string;
  public readonly settlements = new Map<string, Settlement>();
  public readonly culture: Culture;
  public readonly institutions: InstitutionRegistry;
  public readonly knowledge: KnowledgeBase;
  public readonly techTree: TechTree;
  public readonly events: CivilizationEvent[] = [];
  public treasury: number;
  public stability = 0.6;
  public era: KnowledgeEra;
  public year = 0;
  public readonly laws: string[] = [];
  private readonly random: LifeRandom;

  constructor(config: CivilizationConfig) {
    this.id = config.id;
    this.name = config.name ?? config.id;
    this.random = new LifeRandom(config.seed ?? config.id);
    this.culture = config.culture ?? seedArchaicCulture(`${config.id}_culture`, this.name, config.seed);
    this.institutions = config.institutions ?? new InstitutionRegistry();
    this.knowledge = config.knowledge ?? createKnowledgeBase(config.seed ?? config.id);
    this.techTree = config.techTree ?? createTechTree();
    this.treasury = Math.max(0, config.treasury ?? 50);
    this.era = config.era ?? this.techTree.currentEra();
    for (const settlement of config.settlements ?? []) this.settlements.set(settlement.id, settlement);
    this.events.push({
      year: 0,
      type: 'foundation',
      description: `${this.name} được thành lập.`,
      severity: 0.5,
    });
  }

  /** Tổng dân số. */
  public get population(): number {
    let total = 0;
    for (const settlement of this.settlements.values()) total += settlement.population;
    return total;
  }

  /** Tính toàn bộ chỉ số văn minh từ kết quả thực tế. */
  public computeMetrics(): CivilizationMetrics {
    const reports = [...this.settlements.values()].map((settlement) => settlement.report());
    const count = Math.max(1, reports.length);
    const average = (selector: (report: SettlementReport) => number): number =>
      reports.reduce((sum, report) => sum + selector(report), 0) / count;

    const health = average((report) => report.health) / 100;
    const sanitation = average((report) => report.sanitation) / 100;
    const education = average((report) => report.education) / 100;
    const morale = average((report) => report.morale) / 100;
    const security = average((report) => report.security) / 100;
    const food = average((report) => report.foodSecurity);
    const water = average((report) => report.waterSecurity);
    const institutionQuality = this.institutions.averageQuality();
    const corruption = this.institutions.corruptionIndex();
    const tech = this.techTree.overallProgress();
    const eraFactor = clamp01(Math.max(0, KNOWLEDGE_ERAS.indexOf(this.era)) / (KNOWLEDGE_ERAS.length - 1));

    const tradition = clamp01(this.culture.values.tradition);
    const tolerance = this.culture.tolerance;
    const equality = clamp01(this.culture.values.equality * 0.6 + this.institutions.civilityContribution() * 0.4);
    const violence = clamp01(this.culture.values.aggression * 0.6 + (1 - security) * 0.4);
    const superstition = clamp01(this.culture.values.piety * (1 - education) * 0.8 + tradition * 0.2);
    const rationality = clamp01(education * 0.4 + tech * 0.35 + institutionQuality * 0.25);
    const ruleOfLaw = clamp01(
      (this.institutions.get('law')?.efficiency ?? 0.2) * 0.5 +
        (this.institutions.get('law')?.inclusivity ?? 0.2) * 0.3 +
        (1 - corruption) * 0.2,
    );
    const civicParticipation = clamp01(
      (this.institutions.get('governance')?.inclusivity ?? 0.2) * 0.4 + education * 0.3 + this.culture.values.openness * 0.3,
    );
    const innovation = clamp01(tech * 0.5 + this.culture.values.innovation * 0.25 + education * 0.25);
    const civility = clamp01(
      health * 0.1 +
        sanitation * 0.1 +
        education * 0.12 +
        (food + water) * 0.08 +
        institutionQuality * 0.16 +
        tech * 0.12 +
        tolerance * 0.1 +
        (1 - violence) * 0.1 +
        (1 - corruption) * 0.07 +
        eraFactor * 0.05,
    );
    const archaism = clamp01(
      superstition * 0.25 +
        violence * 0.2 +
        corruption * 0.2 +
        tradition * 0.15 +
        (1 - education) * 0.15 +
        (1 - tech) * 0.05,
    );
    return {
      civility,
      archaism,
      tradition,
      rationality,
      tolerance,
      ruleOfLaw,
      education,
      sanitation,
      equality,
      violence,
      superstition,
      corruption,
      innovation,
      civicParticipation,
    };
  }

  /** Giai đoạn văn minh theo chỉ số và công nghệ. */
  public get stage(): CivilizationStage {
    const civility = this.computeMetrics().civility;
    if (civility < 0.22) return 'archaic';
    if (civility < 0.36) return 'tribal';
    if (civility < 0.5) return 'feudal';
    if (civility < 0.65) return 'mercantile';
    if (civility < 0.8) return 'industrial';
    return 'enlightened';
  }

  /** Thêm khu định cư. */
  public addSettlement(settlement: Settlement): Settlement {
    this.settlements.set(settlement.id, settlement);
    this.events.push({
      year: this.year,
      type: 'foundation',
      description: `Khu định cư ${settlement.name} gia nhập ${this.name}.`,
      severity: 0.3,
    });
    return settlement;
  }

  /** Xây dựng ở khu định cư. */
  public build(settlementId: string, type: Parameters<Settlement['build']>[0]): boolean {
    const settlement = this.settlements.get(settlementId);
    if (!settlement) return false;
    const building = settlement.build(type);
    if (!building) return false;
    this.spend(Math.max(0, (building.level * 2)));
    return true;
  }

  /** Chi tiêu từ ngân khố. */
  public spend(amount: number): boolean {
    const value = Math.max(0, amount);
    if (this.treasury < value) return false;
    this.treasury -= value;
    return true;
  }

  /** Thu thuế bổ sung vào ngân khố. */
  public collectTaxes(): number {
    let revenue = 0;
    for (const settlement of this.settlements.values()) {
      revenue += settlement.taxRate * settlement.population * 0.02 * (0.5 + settlement.morale / 200);
    }
    this.treasury += revenue;
    return revenue;
  }

  /**
   * Cập nhật nền văn minh qua `years` năm: từng khu định cư, văn hoá, thiết
   * chế, ngân khố, ổn định xã hội và thời đại công nghệ.
   */
  public tick(years = 1, context: CivilizationContext = {}): CivilizationReport {
    const elapsed = clampRange(years, 0, 500);
    if (elapsed <= 0) return this.report();
    const metricsBefore = this.computeMetrics();
    const settlementContext: SettlementContext = {
      harvestMultiplier: context.harvestMultiplier,
      epidemicSeverity: context.epidemicSeverity,
      warSeverity: context.warSeverity,
      tradeBonus: context.tradeBonus,
    };
    for (const settlement of this.settlements.values()) settlement.tick(elapsed, settlementContext);

    this.year += elapsed;
    const metrics = this.computeMetrics();
    const population = this.population;
    this.culture.tick(elapsed, {
      prosperity: clamp01((this.treasury + population * 0.05) / Math.max(50, population * 0.2)),
      threat: clamp01((context.threat ?? 0) + metrics.violence * 0.3),
      contactRate: clamp01(context.contactRate ?? 0.05),
      innovation: clamp01(context.innovation ?? metrics.innovation),
      scarcity: clamp01(1 - (metrics.education + metrics.sanitation) / 2),
    });
    this.institutions.tick(elapsed, {
      prosperity: clamp01(this.treasury / Math.max(50, population * 0.1)),
      education: metrics.education,
      equality: metrics.equality,
      threat: clamp01(context.threat ?? 0),
      corruptionPressure: clamp01(context.corruptionPressure ?? 0.3),
      year: this.year,
    });
    this.collectTaxes();
    this.knowledge.updateDiffusion(Math.max(1, this.population));

    const eraBefore = this.era;
    this.era = this.techTree.currentEra();
    if (this.era !== eraBefore) {
      this.events.push({
        year: this.year,
        type: 'era',
        description: `${this.name} bước vào thời đại ${this.era}.`,
        severity: 0.8,
      });
    }

    const after = this.computeMetrics();
    const stabilityTarget = clamp01(
      0.25 +
        (after.civility - after.archaism) * 0.5 +
        (1 - after.violence) * 0.15 +
        (1 - after.corruption) * 0.1,
    );
    this.stability = clamp01(this.stability + (stabilityTarget - this.stability) * Math.min(1, elapsed / 10));

    if (after.civility > metricsBefore.civility + 0.08 && after.civility > 0.6) {
      this.events.push({
        year: this.year,
        type: 'golden_age',
        description: `${this.name} bước vào thời kỳ hoàng kim.`,
        severity: 0.7,
      });
    }
    if (after.archaism > 0.65 && this.stability < 0.35) {
      this.events.push({
        year: this.year,
        type: 'unrest',
        description: `${this.name} chìm trong bất ổn: cổ hủ và tham nhũng lan rộng.`,
        severity: 0.6,
      });
    }
    if (this.events.length > 1000) this.events.splice(0, this.events.length - 1000);
    return this.report();
  }

  /** Cải cách một thiết chế. */
  public reform(institutionId: string, direction: 'progressive' | 'conservative', amount = 0.1): boolean {
    const result = this.institutions.reform(institutionId, direction, amount);
    if (!result.success) return false;
    this.events.push({
      year: this.year,
      type: 'reform',
      description: result.detail,
      severity: clamp01(amount),
    });
    return true;
  }

  /** Đầu tư giáo dục: nâng trường học và dân trí các khu định cư. */
  public educate(budget = 20): number {
    const amount = Math.min(this.treasury, Math.max(0, budget));
    if (amount <= 0) return 0;
    this.treasury -= amount;
    const education = this.institutions.get('education');
    if (education) {
      this.institutions.fund(education.id, amount);
      this.institutions.upgrade(education.id, amount);
    }
    for (const settlement of this.settlements.values()) {
      settlement.education = clampRange(settlement.education + Math.min(0.25, amount / 200), 0, 100);
      settlement.morale = clampRange(settlement.morale + Math.min(2, amount / 50), 0, 100);
    }
    return amount;
  }

  /** Đầu tư y tế công cộng. */
  public publicHealth(budget = 20): number {
    const amount = Math.min(this.treasury, Math.max(0, budget));
    if (amount <= 0) return 0;
    this.treasury -= amount;
    const health = this.institutions.get('health');
    if (health) this.institutions.fund(health.id, amount);
    for (const settlement of this.settlements.values()) {
      settlement.sanitation = clampRange(settlement.sanitation + Math.min(0.2, amount / 200), 0, 100);
      settlement.health = clampRange(settlement.health + Math.min(1.5, amount / 80), 0, 100);
    }
    return amount;
  }

  /** Mở khoá công nghệ (từ phát minh hoặc di sản). */
  public adoptTechnology(technologyId: string): boolean {
    if (!this.techTree.unlock(technologyId)) return false;
    this.events.push({
      year: this.year,
      type: 'discovery',
      description: `${this.name} tiếp nhận công nghệ ${technologyId}.`,
      severity: 0.5,
    });
    return true;
  }

  /** Đầu tư nghiên cứu một công nghệ. */
  public researchTechnology(technologyId: string, points = 10): ReturnType<TechTree['invest']> {
    return this.techTree.invest(technologyId, points, (knowledgeId) => {
      const node = this.knowledge.get(knowledgeId);
      return node?.mastery ?? 0;
    });
  }

  /** Ban hành luật mới. */
  public enactLaw(law: string, effects: { stability?: number; equality?: number; corruption?: number } = {}): void {
    this.laws.push(law);
    this.stability = clamp01(this.stability + (effects.stability ?? 0.02));
    this.culture.values.equality = clamp01(this.culture.values.equality + (effects.equality ?? 0.01));
    const governance = this.institutions.get('governance');
    if (governance) governance.corruption = clamp01(governance.corruption + (effects.corruption ?? -0.01));
    this.events.push({ year: this.year, type: 'reform', description: `Ban hành luật: ${law}`, severity: 0.4 });
  }

  /** Nhận kết quả một cuộc chiến. */
  public sufferWar(severity: number): void {
    const amount = clamp01(severity);
    for (const settlement of this.settlements.values()) {
      settlement.removePopulation(settlement.population * amount * 0.05, 'chiến tranh');
      settlement.morale = clampRange(settlement.morale - amount * 15, 0, 100);
      settlement.security = clampRange(settlement.security - amount * 10, 0, 100);
    }
    this.treasury = Math.max(0, this.treasury - amount * 30);
    this.stability = clamp01(this.stability - amount * 0.15);
    this.culture.values.aggression = clamp01(this.culture.values.aggression + amount * 0.08);
    this.events.push({
      year: this.year,
      type: 'war',
      description: `${this.name} chịu tổn thất chiến tranh (${(amount * 100).toFixed(0)}%).`,
      severity: amount,
    });
  }

  /** Báo cáo. */
  public report(): CivilizationReport {
    const metrics = this.computeMetrics();
    return {
      id: this.id,
      name: this.name,
      year: this.year,
      stage: this.stage,
      era: this.era,
      population: this.population,
      settlements: [...this.settlements.values()].map((settlement) => settlement.report()),
      metrics,
      treasury: this.treasury,
      stability: this.stability,
      detail: `${this.name} (${this.stage}, ${this.era}): ${Math.round(this.population)} dân, ` +
        `văn minh ${(metrics.civility * 100).toFixed(0)}%, cổ hủ ${(metrics.archaism * 100).toFixed(0)}%, ` +
        `ổn định ${(this.stability * 100).toFixed(0)}%.`,
    };
  }

  /** Ảnh chụp. */
  public snapshot(): {
    id: string;
    name: string;
    year: number;
    era: KnowledgeEra;
    treasury: number;
    stability: number;
    laws: string[];
    culture: ReturnType<Culture['snapshot']>;
    institutions: ReturnType<InstitutionRegistry['snapshot']>;
    knowledge: ReturnType<KnowledgeBase['snapshot']>;
    techTree: ReturnType<TechTree['snapshot']>;
    settlements: Array<ReturnType<Settlement['snapshot']>>;
    events: CivilizationEvent[];
  } {
    return {
      id: this.id,
      name: this.name,
      year: this.year,
      era: this.era,
      treasury: this.treasury,
      stability: this.stability,
      laws: [...this.laws],
      culture: this.culture.snapshot(),
      institutions: this.institutions.snapshot(),
      knowledge: this.knowledge.snapshot(),
      techTree: this.techTree.snapshot(),
      settlements: [...this.settlements.values()].map((settlement) => settlement.snapshot()),
      events: this.events.map((event) => ({ ...event })),
    };
  }

  /** Khôi phục. */
  public static fromSnapshot(snapshot: ReturnType<Civilization['snapshot']>): Civilization {
    const civilization = new Civilization({
      id: snapshot.id,
      name: snapshot.name,
      era: snapshot.era,
      treasury: snapshot.treasury,
      culture: Culture.fromSnapshot(snapshot.culture),
      institutions: InstitutionRegistry.fromSnapshot(snapshot.institutions),
      knowledge: createKnowledgeBase(snapshot.id),
      techTree: TechTree.fromSnapshot(snapshot.techTree),
      settlements: snapshot.settlements.map((settlement) => Settlement.fromSnapshot(settlement)),
    });
    civilization.year = snapshot.year;
    civilization.stability = snapshot.stability;
    civilization.laws.push(...snapshot.laws);
    civilization.events.length = 0;
    civilization.events.push(...snapshot.events.map((event) => ({ ...event })));
    for (const saved of snapshot.knowledge.nodes) {
      const node = civilization.knowledge.add(saved);
      node.mastery = saved.mastery;
      node.diffusion = saved.diffusion;
      node.holders = new Map(saved.holders);
    }
    return civilization;
  }
}

/** Quan hệ giữa hai nền văn minh. */
export type CivilizationRelation = 'war' | 'trade' | 'alliance' | 'migration' | 'culture';

/** Kết quả so sánh hai nền văn minh. */
export interface CivilizationComparison {
  a: string;
  b: string;
  civilityA: number;
  civilityB: number;
  archaismA: number;
  archaismB: number;
  moreCivilized: string;
  gap: number;
  detail: string;
}

/** Engine quản lý nhiều nền văn minh. */
export class CivilizationEngine {
  public readonly civilizations = new Map<string, Civilization>();
  private readonly random: LifeRandom;

  constructor(seed: number | string = 'civilizations') {
    this.random = new LifeRandom(seed);
  }

  /** Tạo nền văn minh. */
  public create(config: CivilizationConfig): Civilization {
    const civilization = new Civilization(config);
    this.civilizations.set(civilization.id, civilization);
    return civilization;
  }

  /** Lấy nền văn minh. */
  public get(id: string): Civilization | undefined {
    return this.civilizations.get(id);
  }

  /** Cập nhật tất cả. */
  public tickAll(years = 1, context: CivilizationContext = {}): CivilizationReport[] {
    return [...this.civilizations.values()].map((civilization) => civilization.tick(years, context));
  }

  /** Tương tác giữa hai nền văn minh. */
  public interact(
    aId: string,
    bId: string,
    relation: CivilizationRelation,
    intensity = 0.5,
  ): { success: boolean; detail: string } {
    const a = this.civilizations.get(aId);
    const b = this.civilizations.get(bId);
    if (!a || !b || aId === bId) return { success: false, detail: 'Không tìm thấy nền văn minh' };
    const strength = clamp01(intensity);
    switch (relation) {
      case 'war': {
        a.sufferWar(strength);
        b.sufferWar(strength * this.random.range(0.7, 1.3));
        a.events.push({ year: a.year, type: 'war', description: `Chiến tranh với ${b.name}.`, severity: strength });
        b.events.push({ year: b.year, type: 'war', description: `Chiến tranh với ${a.name}.`, severity: strength });
        return { success: true, detail: `${a.name} và ${b.name} giao chiến.` };
      }
      case 'trade': {
        const gainA = strength * (10 + b.population * 0.01);
        const gainB = strength * (10 + a.population * 0.01);
        a.treasury += gainA;
        b.treasury += gainB;
        a.culture.values.openness = clamp01(a.culture.values.openness + strength * 0.04);
        b.culture.values.openness = clamp01(b.culture.values.openness + strength * 0.04);
        a.culture.values.innovation = clamp01(a.culture.values.innovation + strength * 0.03);
        b.culture.values.innovation = clamp01(b.culture.values.innovation + strength * 0.03);
        a.events.push({ year: a.year, type: 'trade', description: `Giao thương với ${b.name}.`, severity: strength });
        b.events.push({ year: b.year, type: 'trade', description: `Giao thương với ${a.name}.`, severity: strength });
        return { success: true, detail: `${a.name} và ${b.name} trao đổi hàng hoá.` };
      }
      case 'alliance': {
        a.stability = clamp01(a.stability + strength * 0.1);
        b.stability = clamp01(b.stability + strength * 0.1);
        a.culture.values.cooperation = clamp01(a.culture.values.cooperation + strength * 0.05);
        b.culture.values.cooperation = clamp01(b.culture.values.cooperation + strength * 0.05);
        a.events.push({ year: a.year, type: 'peace', description: `Liên minh với ${b.name}.`, severity: strength });
        b.events.push({ year: b.year, type: 'peace', description: `Liên minh với ${a.name}.`, severity: strength });
        return { success: true, detail: `${a.name} và ${b.name} lập liên minh.` };
      }
      case 'migration': {
        const from = a.population > b.population ? a : b;
        const to = from === a ? b : a;
        const migrants = Math.min(from.population * strength * 0.02, from.population);
        for (const settlement of from.settlements.values()) {
          settlement.removePopulation(settlement.population * strength * 0.02, 'di cư');
        }
        const target = [...to.settlements.values()][0];
        if (target) target.addPopulation(migrants, `di cư từ ${from.name}`);
        return { success: true, detail: `${Math.round(migrants)} người di cư từ ${from.name} tới ${to.name}.` };
      }
      case 'culture': {
        a.culture.syncretize(b.culture, strength * 0.15);
        b.culture.syncretize(a.culture, strength * 0.1);
        return { success: true, detail: `${a.name} và ${b.name} trao đổi văn hoá.` };
      }
      default:
        return { success: false, detail: 'Quan hệ không hợp lệ' };
    }
  }

  /** So sánh hai nền văn minh (cổ hủ ↔ văn minh). */
  public compare(aId: string, bId: string): CivilizationComparison | null {
    const a = this.civilizations.get(aId);
    const b = this.civilizations.get(bId);
    if (!a || !b) return null;
    const metricsA = a.computeMetrics();
    const metricsB = b.computeMetrics();
    const gap = metricsA.civility - metricsB.civility;
    return {
      a: a.name,
      b: b.name,
      civilityA: metricsA.civility,
      civilityB: metricsB.civility,
      archaismA: metricsA.archaism,
      archaismB: metricsB.archaism,
      moreCivilized: gap >= 0 ? a.name : b.name,
      gap: Math.abs(gap),
      detail: `${a.name} (${(metricsA.civility * 100).toFixed(0)}%) so với ${b.name} (${(metricsB.civility * 100).toFixed(0)}%): ` +
        `${gap >= 0 ? a.name : b.name} văn minh hơn ${(Math.abs(gap) * 100).toFixed(0)} điểm.`,
    };
  }

  /** Nền văn minh văn minh nhất. */
  public mostCivilized(): Civilization | null {
    let best: Civilization | null = null;
    let score = -Infinity;
    for (const civilization of this.civilizations.values()) {
      const civility = civilization.computeMetrics().civility;
      if (civility > score) {
        score = civility;
        best = civilization;
      }
    }
    return best;
  }

  /** Nền văn minh cổ hủ nhất. */
  public mostArchaic(): Civilization | null {
    let worst: Civilization | null = null;
    let score = -Infinity;
    for (const civilization of this.civilizations.values()) {
      const archaism = civilization.computeMetrics().archaism;
      if (archaism > score) {
        score = archaism;
        worst = civilization;
      }
    }
    return worst;
  }
}
