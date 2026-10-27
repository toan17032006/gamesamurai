/**
 * @file research.ts
 * @module @aetheria/engine/knowledge/research
 * @description Nghiên cứu – sáng chế độc lập: đặt câu hỏi, xây giả thuyết, làm
 * thực nghiệm có thống kê (t-test xấp xỉ, Bayes factor), cập nhật hậu nghiệm,
 * tổng hợp tri thức thành phát minh, đăng ký bản quyền, phổ biến và ứng dụng
 * vào cây công nghệ.
 */

import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';
import {
  KNOWLEDGE_ERAS,
  type KnowledgeBase,
  type KnowledgeDomain,
  type KnowledgeEra,
  type KnowledgeNode,
} from './knowledge-base.js';
import type { TechTree } from './tech-tree.js';

/** Trạng thái câu hỏi nghiên cứu. */
export type ResearchStatus = 'open' | 'testing' | 'answered' | 'abandoned';

/** Một câu hỏi nghiên cứu. */
export interface ResearchQuestion {
  id: string;
  entityId: string;
  question: string;
  domain: KnowledgeDomain;
  difficulty: number;
  progress: number;
  status: ResearchStatus;
  hypothesisIds: string[];
  createdYear: number;
  answer?: string;
}

/** Một giả thuyết khoa học. */
export interface Hypothesis {
  id: string;
  questionId: string;
  entityId: string;
  statement: string;
  prior: number;
  posterior: number;
  predictedEffect: number;
  evidenceFor: number;
  evidenceAgainst: number;
  tests: number;
  lastPValue: number;
  supported: boolean;
}

/** Thiết kế thực nghiệm. */
export type ExperimentDesign = 'observation' | 'controlled' | 'trial';

/** Kết quả thực nghiệm. */
export interface ExperimentResult {
  id: string;
  hypothesisId: string;
  entityId: string;
  design: ExperimentDesign;
  sampleSize: number;
  effectSize: number;
  standardError: number;
  tStatistic: number;
  pValue: number;
  bayesFactor: number;
  outcome: 'supports' | 'contradicts' | 'inconclusive';
  posterior: number;
  cost: number;
  year: number;
}

/** Một phát minh. */
export interface Invention {
  id: string;
  name: string;
  domain: KnowledgeDomain;
  description: string;
  components: string[];
  novelty: number;
  utility: number;
  complexity: number;
  creatorId: string;
  year: number;
  patented: boolean;
  diffusion: number;
  status: 'prototype' | 'tested' | 'adopted' | 'obsolete';
  knowledgeId?: string;
}

/** Kết quả sáng chế. */
export interface InventionAttempt {
  success: boolean;
  probability: number;
  invention: Invention | null;
  reason: string;
}

/** Kết quả khám phá tri thức. */
export interface DiscoveryResult {
  discovered: boolean;
  knowledge: KnowledgeNode | null;
  novelty: number;
  effort: number;
  detail: string;
}

/** Tổng hợp một chu kỳ nghiên cứu. */
export interface ResearchCycleResult {
  question: ResearchQuestion;
  hypothesis: Hypothesis;
  experiment: ExperimentResult;
  answered: boolean;
  invention: Invention | null;
  detail: string;
}

/** Thống kê nghiên cứu. */
export interface ResearchStats {
  questions: number;
  answered: number;
  hypotheses: number;
  experiments: number;
  inventions: number;
  adopted: number;
  patents: number;
}

/** Bảng tên khám phá theo miền. */
const DISCOVERY_NAMES: Readonly<Record<KnowledgeDomain, readonly string[]>> = Object.freeze({
  survival: ['Dấu vết nước ngầm', 'Mùa cá di cư', 'Đường tránh thú dữ', 'Cây củ dự trữ'],
  agriculture: ['Giống lúa chịu hạn', 'Luân canh ba vụ', 'Phân xanh', 'Đê bao mùa lũ'],
  craft: ['Mộc ghép không đinh', 'Men gốm tro', 'Da thuộc thảo mộc', 'Dây thừng ba tao'],
  construction: ['Vòm nhẹ', 'Móng cọc sông', 'Tường hai lớp cách nhiệt', 'Giàn mái chịu gió'],
  medicine: ['Cây cầm máu', 'Nước sắc hạ sốt', 'Cách ly người bệnh', 'Kẹp xương gãy'],
  warfare: ['Đội hình khiên', 'Cung composite', 'Hào chông', 'Tín hiệu hiệp đồng'],
  philosophy: ['Nghịch lý vô hạn', 'Luật nhân quả', 'Khế ước xã hội', 'Đạo đức đối thoại'],
  science: ['Chu kỳ sao', 'Định luật đòn bẩy', 'Tính lặp lại của thực nghiệm', 'Bảo toàn vật chất'],
  engineering: ['Bánh răng gỗ', 'Cầu phao', 'Máy bơm pittông', 'Hệ thống đối trọng'],
  mathematics: ['Hệ đếm cơ số', 'Tam giác đồng dạng', 'Phương trình bậc hai', 'Xác suất thực nghiệm'],
  navigation: ['Đo góc sao Bắc', 'Hải đồ dòng chảy', 'La bàn từ', 'Đèn hiệu bờ biển'],
  metallurgy: ['Thép tôi nước', 'Hợp kim chống gỉ', 'Lò gió nóng', 'Khuôn đúc sáp'],
  energy: ['Bánh xe nước', 'Pin điện hoá', 'Gương hội tụ', 'Tuabin gió trục đứng'],
  culture: ['Ký hiệu ghi nhớ', 'Nhạc điệu nghi lễ', 'Luật kể chuyện', 'Lịch mùa'],
  governance: ['Chia đất theo hộ', 'Toà án công khai', 'Thuế lương thực', 'Hội đồng trưởng lão'],
});

/** Hậu tố tên phát minh. */
const INVENTION_NAMES: Readonly<Record<KnowledgeDomain, readonly string[]>> = Object.freeze({
  survival: ['Bộ dụng cụ sinh tồn', 'Bẫy thông minh', 'Túi nước da thú'],
  agriculture: ['Cày cải tiến', 'Hệ thống tưới nhỏ giọt', 'Kho dự trữ hạt'],
  craft: ['Dụng cụ đa năng', 'Quy trình ghép vật liệu', 'Khuôn đúc tinh xảo'],
  construction: ['Kết cấu mái nhẹ', 'Hệ móng chống lún', 'Giàn giáo an toàn'],
  medicine: ['Bộ sơ cứu', 'Phác đồ điều trị', 'Dụng cụ khâu vết thương'],
  warfare: ['Khiên ghép', 'Hệ thống tín hiệu chiến trường', 'Cung cải tiến'],
  philosophy: ['Khung lập luận', 'Phương pháp đối thoại', 'Bộ nguyên tắc đạo đức'],
  science: ['Bộ thí nghiệm chuẩn', 'Thang đo chính xác', 'Quy trình kiểm chứng'],
  engineering: ['Cơ cấu truyền động', 'Máy bơm hiệu suất cao', 'Hệ thống tự động'],
  mathematics: ['Bảng tính nhanh', 'Thước đo góc', 'Ký hiệu toán học gọn'],
  navigation: ['Hải đồ cải tiến', 'Bộ đo sao', 'La bàn hiệu chỉnh'],
  metallurgy: ['Lò nung tiết kiệm', 'Quy trình tôi thép', 'Hợp kim nhẹ'],
  energy: ['Bộ tích năng', 'Máy phát cải tiến', 'Hệ thống dẫn điện'],
  culture: ['Bộ chữ ký hiệu', 'Kỹ thuật kể chuyện', 'Nhạc cụ cộng hưởng'],
  governance: ['Bộ luật thành văn', 'Hệ thống thuế công bằng', 'Quy trình bầu cử'],
});

/** Phân phối chuẩn tích luỹ (xấp xỉ Abramowitz–Stegun). */
export function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const value = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * value);
  const erf =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-value * value);
  return 0.5 * (1 + sign * erf);
}

/** Engine nghiên cứu và sáng chế. */
export class ResearchEngine {
  public readonly questions = new Map<string, ResearchQuestion>();
  public readonly hypotheses = new Map<string, Hypothesis>();
  public readonly experiments: ExperimentResult[] = [];
  public readonly inventions: Invention[] = [];
  public year = 0;

  private readonly random: DeepRandom;
  private counter = 0;

  constructor(
    public readonly knowledge: KnowledgeBase,
    public readonly techTree: TechTree,
    seed: number | string = 'research',
  ) {
    this.random = new DeepRandom(seed);
  }

  /** Số phát minh. */
  public get inventionCount(): number {
    return this.inventions.length;
  }

  /** Đặt câu hỏi nghiên cứu. */
  public poseQuestion(
    entityId: string,
    question: string,
    domain: KnowledgeDomain,
    difficulty = 0.5,
  ): ResearchQuestion {
    const id = `question_${++this.counter}`;
    const record: ResearchQuestion = {
      id,
      entityId,
      question,
      domain,
      difficulty: clamp01(difficulty),
      progress: 0,
      status: 'open',
      hypothesisIds: [],
      createdYear: this.year,
    };
    this.questions.set(id, record);
    return record;
  }

  /** Thêm giả thuyết cho câu hỏi. */
  public hypothesize(
    questionId: string,
    entityId: string,
    statement: string,
    options: { prior?: number; predictedEffect?: number } = {},
  ): Hypothesis | null {
    const question = this.questions.get(questionId);
    if (!question) return null;
    const prior = clampRange(options.prior ?? 0.5, 0.01, 0.99);
    const hypothesis: Hypothesis = {
      id: `hypothesis_${++this.counter}`,
      questionId,
      entityId,
      statement,
      prior,
      posterior: prior,
      predictedEffect: clampRange(options.predictedEffect ?? 0.4, 0, 1),
      evidenceFor: 0,
      evidenceAgainst: 0,
      tests: 0,
      lastPValue: 1,
      supported: false,
    };
    this.hypotheses.set(hypothesis.id, hypothesis);
    question.hypothesisIds.push(hypothesis.id);
    question.status = 'testing';
    return hypothesis;
  }

  /**
   * Chạy thực nghiệm: mô phỏng hiệu ứng thật theo prior, thêm nhiễu theo thiết
   * kế và cỡ mẫu, tính t-statistic, p-value và Bayes factor xấp xỉ.
   */
  public runExperiment(
    hypothesisId: string,
    entityId: string,
    design: ExperimentDesign = 'controlled',
    sampleSize = 30,
  ): ExperimentResult | null {
    const hypothesis = this.hypotheses.get(hypothesisId);
    if (!hypothesis) return null;
    const question = this.questions.get(hypothesis.questionId);
    const size = Math.max(3, Math.min(2000, Math.floor(sampleSize)));
    const noise = design === 'trial' ? 0.18 : design === 'controlled' ? 0.28 : 0.5;
    const isTrue = this.random.chance(hypothesis.prior);
    const trueEffect = isTrue ? hypothesis.predictedEffect : 0;
    const measured = trueEffect + this.random.gaussian(0, noise);
    const effectSize = clampRange(measured, -1, 1);
    const standardError = noise / Math.sqrt(size);
    const tStatistic = standardError > 0 ? effectSize / standardError : 0;
    const pValue = clamp01(2 * (1 - normalCdf(Math.abs(tStatistic))));
    const bayesFactor = Math.exp(Math.min(30, (tStatistic * tStatistic) / 2));
    const priorOdds = hypothesis.prior / Math.max(1e-9, 1 - hypothesis.prior);
    const posteriorOdds = priorOdds * bayesFactor;
    const posterior = clamp01(posteriorOdds / (1 + posteriorOdds));
    const outcome: ExperimentResult['outcome'] =
      pValue < 0.05 && effectSize > 0.05
        ? 'supports'
        : pValue < 0.05 && effectSize < -0.05
          ? 'contradicts'
          : 'inconclusive';

    if (outcome === 'supports') hypothesis.evidenceFor++;
    else if (outcome === 'contradicts') hypothesis.evidenceAgainst++;
    hypothesis.tests++;
    hypothesis.lastPValue = pValue;
    hypothesis.posterior = posterior;
    hypothesis.supported = posterior >= 0.7;

    const result: ExperimentResult = {
      id: `experiment_${++this.counter}`,
      hypothesisId,
      entityId,
      design,
      sampleSize: size,
      effectSize,
      standardError,
      tStatistic,
      pValue,
      bayesFactor,
      outcome,
      posterior,
      cost: Math.round(size * (design === 'trial' ? 2 : 1) * 0.5),
      year: this.year,
    };
    this.experiments.push(result);
    if (question) {
      question.progress = clamp01(question.progress + 0.15 + (outcome === 'inconclusive' ? 0 : 0.25));
      if (hypothesis.supported && question.progress >= 0.7) {
        question.status = 'answered';
        question.answer = hypothesis.statement;
      }
    }
    return result;
  }

  /** Trả lời câu hỏi nếu đã đủ bằng chứng. */
  public answerQuestion(questionId: string): string | null {
    const question = this.questions.get(questionId);
    if (!question) return null;
    let best: Hypothesis | null = null;
    for (const hypothesisId of question.hypothesisIds) {
      const hypothesis = this.hypotheses.get(hypothesisId);
      if (hypothesis && (!best || hypothesis.posterior > best.posterior)) best = hypothesis;
    }
    if (!best) return null;
    if (best.posterior >= 0.75) {
      question.status = 'answered';
      question.answer = best.statement;
      return best.statement;
    }
    return null;
  }

  /**
   * Thử sáng chế từ một tập tri thức. Độ mới được tính bằng khoảng cách Jaccard
   * tới các phát minh cũ; độ hữu ích tăng theo đa dạng miền và thông thạo.
   */
  public invent(
    entityId: string,
    componentIds: readonly string[],
    options: {
      name?: string;
      creativity?: number;
      effort?: number;
      domain?: KnowledgeDomain;
      year?: number;
    } = {},
  ): InventionAttempt {
    const components = [...new Set(componentIds)]
      .map((id) => this.knowledge.get(id))
      .filter((node): node is KnowledgeNode => Boolean(node));
    if (components.length < 2) {
      return { success: false, probability: 0, invention: null, reason: 'Cần ít nhất hai tri thức để tổng hợp' };
    }
    const mastery = components.map((node) => this.knowledge.masteryOf(entityId, node.id));
    if (mastery.some((value) => value < 0.3)) {
      return { success: false, probability: 0, invention: null, reason: 'Chưa đủ thông thạo các tri thức thành phần' };
    }
    const creativity = clamp01(options.creativity ?? 0.6);
    const effort = clampRange(options.effort ?? 1, 0, 10);
    const domains = new Set(components.map((node) => node.domain));
    const crossDomain = domains.size > 1;
    const componentSet = new Set(components.map((node) => node.id));

    let maxSimilarity = 0;
    for (const existing of this.inventions) {
      const other = new Set(existing.components);
      let intersection = 0;
      for (const id of componentSet) if (other.has(id)) intersection++;
      const union = new Set([...componentSet, ...other]).size;
      maxSimilarity = Math.max(maxSimilarity, union > 0 ? intersection / union : 0);
    }
    const novelty = clamp01(1 - maxSimilarity);
    const averageUtility =
      components.reduce((sum, node) => sum + node.baseUtility, 0) / components.length;
    const complexity =
      components.reduce((sum, node) => sum + node.complexity, 0) / components.length + (crossDomain ? 0.06 : 0);
    const utility = clamp01(averageUtility + (crossDomain ? 0.12 : 0.03) + novelty * 0.1);
    const averageMastery = mastery.reduce((sum, value) => sum + value, 0) / mastery.length;
    const probability = clamp01(
      averageMastery * 0.35 + creativity * 0.25 + novelty * 0.2 + clamp01(effort / 5) * 0.2 - complexity * 0.2,
    );

    if (!this.random.chance(probability)) {
      return {
        success: false,
        probability,
        invention: null,
        reason: `Thử nghiệm thất bại (xác suất ${(probability * 100).toFixed(0)}%)`,
      };
    }

    const domain = options.domain ?? components[0].domain;
    const names = INVENTION_NAMES[domain];
    const year = options.year ?? this.year;
    const knowledgeId = `invention_knowledge_${this.counter + 1}`;
    const invention: Invention = {
      id: `invention_${++this.counter}`,
      name: options.name ?? names[this.random.int(0, names.length - 1)],
      domain,
      description: `Tổng hợp ${components.map((node) => node.name).join(' + ')} bởi ${entityId}.`,
      components: components.map((node) => node.id),
      novelty,
      utility,
      complexity: clamp01(complexity),
      creatorId: entityId,
      year,
      patented: false,
      diffusion: 0,
      status: 'prototype',
      knowledgeId,
    };
    this.inventions.push(invention);

    if (!this.knowledge.has(knowledgeId)) {
      const eraIndex = Math.min(
        KNOWLEDGE_ERAS.length - 1,
        Math.max(...components.map((node) => KNOWLEDGE_ERAS.indexOf(node.era))) + (crossDomain ? 1 : 0),
      );
      const node = this.knowledge.add({
        id: knowledgeId,
        name: invention.name,
        domain,
        description: invention.description,
        complexity: invention.complexity,
        era: KNOWLEDGE_ERAS[eraIndex],
        prerequisites: [...invention.components],
        related: [...invention.components],
        baseUtility: invention.utility,
        discoveredYear: year,
        discovererId: entityId,
      });
      node.holders.set(entityId, clamp01(0.55 + creativity * 0.4));
      node.mastery = node.holders.get(entityId) ?? 0;
    } else {
      this.knowledge.learn(entityId, knowledgeId, { aptitude: creativity, time: 1 });
    }

    return {
      success: true,
      probability,
      invention,
      reason: `Sáng chế thành công: ${invention.name} (độ mới ${(novelty * 100).toFixed(0)}%)`,
    };
  }

  /** Khám phá tri thức mới trong một miền. */
  public discover(
    entityId: string,
    domain: KnowledgeDomain,
    effort = 1,
    options: { intelligence?: number; curiosity?: number; year?: number } = {},
  ): DiscoveryResult {
    const intelligence = clamp01(options.intelligence ?? 0.6);
    const curiosity = clamp01(options.curiosity ?? 0.6);
    const normalizedEffort = clampRange(effort, 0, 10);
    const profile = this.knowledge.profileOf(entityId);
    const domainKnowledge = profile.known.filter((node) => node.domain === domain);
    const baseChance = 0.04 + normalizedEffort * 0.03 + curiosity * 0.1 + intelligence * 0.08;
    const familiarity = clamp01(domainKnowledge.length / 8);
    const chance = clamp01(baseChance * (0.4 + familiarity * 0.6));
    if (!this.random.chance(chance)) {
      return {
        discovered: false,
        knowledge: null,
        novelty: 0,
        effort: normalizedEffort,
        detail: `Chưa khám phá được gì mới trong ${domain}.`,
      };
    }

    const names = DISCOVERY_NAMES[domain];
    const baseName = names[this.random.int(0, names.length - 1)];
    const id = `discovery_${domain}_${this.counter + 1}`;
    let name = baseName;
    let suffix = 1;
    while (this.knowledge.has(id)) {
      suffix++;
      name = `${baseName} ${suffix}`;
    }
    const year = options.year ?? this.year;
    const complexity = clamp01(0.25 + this.random.next() * 0.35 + normalizedEffort * 0.02);
    const eraIndex = Math.min(
      KNOWLEDGE_ERAS.length - 1,
      KNOWLEDGE_ERAS.indexOf(this.techTree.currentEra()) + (complexity > 0.65 ? 1 : 0),
    );
    const prerequisites = domainKnowledge.slice(0, 2).map((node) => node.id);
    const node = this.knowledge.add({
      id,
      name,
      domain,
      description: `Khám phá bởi ${entityId} trong miền ${domain} sau ${normalizedEffort.toFixed(1)} đơn vị nỗ lực.`,
      complexity,
      era: KNOWLEDGE_ERAS[eraIndex],
      prerequisites,
      baseUtility: clamp01(0.35 + this.random.next() * 0.5),
      discoveredYear: year,
      discovererId: entityId,
    });
    node.holders.set(entityId, clamp01(0.35 + intelligence * 0.4));
    node.mastery = node.holders.get(entityId) ?? 0;
    return {
      discovered: true,
      knowledge: node,
      novelty: clamp01(1 - familiarity * 0.6),
      effort: normalizedEffort,
      detail: `Khám phá ${node.name} (${domain}).`,
    };
  }

  /** Đầu tư nghiên cứu một công nghệ bằng tri thức của cá thể. */
  public researchTechnology(entityId: string, technologyId: string, points = 10): ReturnType<TechTree['invest']> {
    return this.techTree.invest(technologyId, points, (knowledgeId) =>
      this.knowledge.masteryOf(entityId, knowledgeId),
    );
  }

  /** Một chu kỳ nghiên cứu trọn vẹn: câu hỏi → giả thuyết → thực nghiệm → kết luận. */
  public researchCycle(
    entityId: string,
    domain: KnowledgeDomain,
    options: { question?: string; effort?: number; sampleSize?: number; invent?: boolean } = {},
  ): ResearchCycleResult {
    const question = this.poseQuestion(
      entityId,
      options.question ?? `Điều gì cải thiện ${domain} cho cộng đồng?`,
      domain,
      clamp01(0.3 + this.random.next() * 0.4),
    );
    const hypothesis = this.hypothesize(
      question.id,
      entityId,
      `Một thay đổi trong ${domain} sẽ tạo hiệu ứng tích cực đo được.`,
      { prior: 0.4 + this.random.next() * 0.2, predictedEffect: 0.35 + this.random.next() * 0.3 },
    );
    const experiment = hypothesis
      ? this.runExperiment(hypothesis.id, entityId, 'controlled', options.sampleSize ?? 40)
      : null;
    const answered = Boolean(hypothesis?.supported);

    let invention: Invention | null = null;
    if (options.invent !== false) {
      const known = this.knowledge.profileOf(entityId).known.slice(0, 4).map((node) => node.id);
      if (known.length >= 2) {
        const attempt = this.invent(entityId, known, {
          creativity: 0.6,
          effort: options.effort ?? 1,
          domain,
        });
        invention = attempt.invention;
      }
    }

    return {
      question,
      hypothesis: hypothesis ?? {
        id: 'missing',
        questionId: question.id,
        entityId,
        statement: 'Không có giả thuyết',
        prior: 0,
        posterior: 0,
        predictedEffect: 0,
        evidenceFor: 0,
        evidenceAgainst: 0,
        tests: 0,
        lastPValue: 1,
        supported: false,
      },
      experiment:
        experiment ?? {
          id: 'missing',
          hypothesisId: 'missing',
          entityId,
          design: 'controlled',
          sampleSize: 0,
          effectSize: 0,
          standardError: 0,
          tStatistic: 0,
          pValue: 1,
          bayesFactor: 1,
          outcome: 'inconclusive',
          posterior: 0,
          cost: 0,
          year: this.year,
        },
      answered,
      invention,
      detail: answered
        ? `Giả thuyết được ủng hộ; ${invention ? `tạo ra ${invention.name}` : 'chưa tạo được phát minh'}.`
        : 'Giả thuyết chưa đủ bằng chứng; cần thực nghiệm thêm.',
    };
  }

  /** Đăng ký bản quyền/sáng chế. */
  public patent(inventionId: string, ownerId: string): boolean {
    const invention = this.inventions.find((item) => item.id === inventionId);
    if (!invention) return false;
    invention.patented = true;
    if (!invention.creatorId) invention.creatorId = ownerId;
    return true;
  }

  /** Phổ biến phát minh trong dân số. */
  public adopt(inventionId: string, rate = 0.1): number {
    const invention = this.inventions.find((item) => item.id === inventionId);
    if (!invention) return 0;
    invention.diffusion = clamp01(invention.diffusion + Math.max(0, rate));
    if (invention.diffusion >= 0.6) invention.status = 'adopted';
    else if (invention.diffusion > 0.2) invention.status = 'tested';
    return invention.diffusion;
  }

  /** Phát minh tốt nhất theo giá trị kỳ vọng. */
  public bestInvention(domain?: KnowledgeDomain): Invention | null {
    let best: Invention | null = null;
    for (const invention of this.inventions) {
      if (domain && invention.domain !== domain) continue;
      if (!best || invention.utility * (0.5 + invention.novelty) > best.utility * (0.5 + best.novelty)) {
        best = invention;
      }
    }
    return best;
  }

  /** Thống kê. */
  public stats(): ResearchStats {
    return {
      questions: this.questions.size,
      answered: [...this.questions.values()].filter((question) => question.status === 'answered').length,
      hypotheses: this.hypotheses.size,
      experiments: this.experiments.length,
      inventions: this.inventions.length,
      adopted: this.inventions.filter((invention) => invention.status === 'adopted').length,
      patents: this.inventions.filter((invention) => invention.patented).length,
    };
  }

  /** Ảnh chụp trạng thái nghiên cứu. */
  public snapshot(): {
    year: number;
    questions: ResearchQuestion[];
    hypotheses: Hypothesis[];
    experiments: ExperimentResult[];
    inventions: Invention[];
  } {
    return {
      year: this.year,
      questions: [...this.questions.values()].map((question) => ({
        ...question,
        hypothesisIds: [...question.hypothesisIds],
      })),
      hypotheses: [...this.hypotheses.values()].map((hypothesis) => ({ ...hypothesis })),
      experiments: this.experiments.map((experiment) => ({ ...experiment })),
      inventions: this.inventions.map((invention) => ({ ...invention, components: [...invention.components] })),
    };
  }

  /** Khôi phục trạng thái. */
  public restore(snapshot: {
    year: number;
    questions: ResearchQuestion[];
    hypotheses: Hypothesis[];
    experiments: ExperimentResult[];
    inventions: Invention[];
  }): void {
    this.year = snapshot.year;
    this.questions.clear();
    this.hypotheses.clear();
    this.experiments.length = 0;
    this.inventions.length = 0;
    for (const question of snapshot.questions) {
      this.questions.set(question.id, { ...question, hypothesisIds: [...question.hypothesisIds] });
    }
    for (const hypothesis of snapshot.hypotheses) this.hypotheses.set(hypothesis.id, { ...hypothesis });
    this.experiments.push(...snapshot.experiments.map((experiment) => ({ ...experiment })));
    this.inventions.push(
      ...snapshot.inventions.map((invention) => ({ ...invention, components: [...invention.components] })),
    );
  }
}

/** Miền nghiên cứu mặc định theo thời đại. */
export function defaultResearchDomains(era: KnowledgeEra): KnowledgeDomain[] {
  const index = KNOWLEDGE_ERAS.indexOf(era);
  const domains: KnowledgeDomain[] = ['survival', 'craft', 'agriculture'];
  if (index >= 1) domains.push('construction', 'medicine', 'culture', 'governance');
  if (index >= 2) domains.push('metallurgy', 'mathematics', 'philosophy', 'warfare');
  if (index >= 4) domains.push('science', 'navigation', 'engineering');
  if (index >= 5) domains.push('energy');
  return domains;
}

// ==========================================================================
// Tai nạn phòng thí nghiệm — nghiên cứu thật thì có thể nổ thật
// ==========================================================================

/** Loại tai nạn thí nghiệm. */
export type LabAccidentType = 'explosion' | 'toxic_smoke' | 'fire' | 'chemical_splash' | 'implosion' | 'spill_contamination';

/** Mức độ nặng của tai nạn. */
export type LabAccidentOutcome = 'unscathed' | 'light_injury' | 'severe_injury' | 'poisoned' | 'fatal';

/** Một tai nạn thí nghiệm đã xảy ra. */
export interface LabAccident {
  id: string;
  entityId: string;
  year: number;
  type: LabAccidentType;
  severity: number;
  outcome: LabAccidentOutcome;
  /** Sát thương sức khoẻ gây ra (0 nếu không bị thương). */
  damage: number;
  /** Liệu có hít phải khói độc không. */
  inhaledToxin: boolean;
  /** Liệu người khác trong phòng có bị văng phải không. */
  bystandersHit: string[];
  note: string;
}

/** Xác suất tai nạn nền mỗi lần thí nghiệm theo loại thiết bị. */
export const LAB_ACCIDENT_BASE_CHANCE: Readonly<Record<string, number>> = Object.freeze({
  alchemy: 0.12,
  energy: 0.1,
  metallurgy: 0.08,
  medicine: 0.05,
  science: 0.06,
  engineering: 0.07,
  default: 0.04,
});

/**
 * Mô phỏng tai nạn thí nghiệm: nghiên cứu không nổ thành công thì có thể ra
 * khói — hít phải khói độc có thể chết, có thể chỉ ngộ độc, hoặc may mắn thoát.
 * An toàn phòng lab (tri thức safety) làm giảm mạnh xác suất và độ nặng.
 *
 * @param health máu hiện tại của researcher (0–100); `fatal` khi damage >= health
 */
export function simulateLabAccident(
  entityId: string,
  domain: KnowledgeDomain,
  options: {
    year?: number;
    random?: DeepRandom;
    /** Tri thức an toàn phòng thí nghiệm `[0, 1]` — giảm xác suất + độ nặng. */
    safetyKnowledge?: number;
    /** Máu hiện tại của researcher. */
    health?: number;
    /** Những người khác có mặt trong phòng (id). */
    bystanders?: readonly string[];
  } = {},
): LabAccident | null {
  const random = options.random ?? new DeepRandom(`${entityId}:lab:${options.year ?? 0}`);
  const safety = clamp01(options.safetyKnowledge ?? 0);
  const base = LAB_ACCIDENT_BASE_CHANCE[domain] ?? LAB_ACCIDENT_BASE_CHANCE.default;
  const chance = base * (1 - safety * 0.7);
  if (!random.chance(clamp01(chance))) return null;

  const types: LabAccidentType[] = ['explosion', 'toxic_smoke', 'fire', 'chemical_splash', 'implosion', 'spill_contamination'];
  const weights = [domain === 'energy' ? 3 : 1, 2.5, 2, 1.5, 0.8, 1.2];
  let roll = random.next() * weights.reduce((s, w) => s + w, 0);
  let typeIndex = 0;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      typeIndex = i;
      break;
    }
  }
  const type = types[typeIndex];

  const severity = clamp01((1 - safety * 0.5) * random.next() ** 1.4 * (type === 'explosion' ? 1.2 : 1));
  const health = Math.max(1, options.health ?? 100);
  const inhaledToxin = type === 'toxic_smoke' || (type === 'explosion' && random.chance(0.5));

  // Kết quả: fatal nếu damage vượt máu; ngộ độc nếu hít khói; nhẹ nếu an toàn tốt.
  let outcome: LabAccidentOutcome;
  let damage: number;
  if (severity > 0.85 && random.chance(0.55 - safety * 0.25)) {
    outcome = 'fatal';
    damage = health;
  } else if (inhaledToxin && severity > 0.4) {
    outcome = 'poisoned';
    damage = Math.round(health * severity * 0.55);
  } else if (severity > 0.55) {
    outcome = 'severe_injury';
    damage = Math.round(health * severity * 0.45);
  } else if (severity > 0.15) {
    outcome = 'light_injury';
    damage = Math.round(health * severity * 0.25);
  } else {
    outcome = 'unscathed';
    damage = 0;
  }

  // Văng phải: người đứng gần chịu tác động với xác suất theo severity.
  const bystandersHit = (options.bystanders ?? []).filter(() => random.chance(severity * 0.4));

  const note =
    outcome === 'fatal'
      ? `thí nghiệm ${type === 'explosion' ? 'phát nổ' : type === 'toxic_smoke' ? 'tỏa khói đen' : 'mất kiểm soát'} — researcher tử vong tại chỗ`
      : outcome === 'poisoned'
        ? `khói độc tràn ra, researcher hít phải ${type === 'toxic_smoke' ? 'hơi hoá chất' : 'bụi nóng'} — ngộ độn nặng, mất ${damage} máu`
        : outcome === 'severe_injury'
          ? `${type} gây thương tích nặng, mất ${damage} máu`
          : outcome === 'light_injury'
            ? `${type} nhỏ, chỉ bị xước/tổn thương nhẹ ${damage} máu`
            : `${type} vừa sém — may mắn thoát sạch sẽ nhờ phòng lab gọn gàng`;

  return {
    id: `lab_accident_${entityId}_${options.year ?? 0}_${random.int(1000, 9999)}`,
    entityId,
    year: options.year ?? 0,
    type,
    severity,
    outcome,
    damage,
    inhaledToxin,
    bystandersHit,
    note,
  };
}

