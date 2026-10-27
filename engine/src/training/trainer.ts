/**
 * @file trainer.ts
 * @module @aetheria/engine/training/trainer
 * @description AgentTrainer: nạp dataset từ `assets/training/<category>/` và
 * HUẤN LUYỆN NGAY các agent trong game —
 * - **Học sâu nhận thức hình dạng**: shape samples → FormCognitionEngine
 *   (learnConcept + importExternalSamples) — agent tư duy "cái cây", "cái nhà"…
 * - **Học tăng cường render**: reward samples → SystemRenderAgent
 *   (reinforceEpisode từng mẫu, ground truth làm reward).
 * - **Học sâu điểm ảnh NPC**: pixel samples → GameNPCPixelSkill
 *   (learnFromAction với groundTruthQuality).
 * - **Sáng tạo**: creativity samples → kho hạt giống sáng chế cho agent.
 * Mỗi run ghi `TrainingRun` (epochs, số mẫu, checkpoints) và serialize được.
 */

import type { LoadedDataset, ShapeSample, PixelSample, RewardSample, CreativitySample, TrainingCategory } from './dataset.js';
import { loadCategoryDataset, TRAINING_CATEGORIES } from './dataset.js';
import { createRenderQualityGate, type RenderQualityGate } from './object-renderer.js';
import { SelfOptimizationLoop, type OptimizationCheckpoint, type OptimizationEpoch } from './optimization-loop.js';
import { MassiveTrainingRunner, type CampaignResult, type MassiveCampaignOptions } from './scale.js';
import type { FormCognitionEngine, ShapePerception } from '../worldview/shape-cognition.js';
import type { SystemRenderAgent } from '../worldview/render-agents.js';
import type { GameNPCPixelSkill } from '../worldview/render-agents.js';
import { clamp01 } from '../deeplearning/random.js';
import { validatePixelDatasetCorrectness } from './object-renderer.js';
import {
  createEmotionProfile,
  trainEmotionProfile,
  LanguageEngine,
  trainKnowledge,
  NoveltyDirector,
  type EmotionProfile,
} from './agent-mind.js';

/** Báo cáo huấn luyện một category. */
export interface CategoryTrainingReport {
  category: TrainingCategory;
  /** Số shape samples đã học vào concept. */
  shapeSamplesTrained: number;
  /** Số episode RL đã chạy. */
  rlEpisodes: number;
  /** Số pixel samples NPC đã học. */
  pixelSamplesTrained: number;
  /** Số hạt sáng tạo đã nạp. */
  creativitySeeds: number;
  /** Accuracy phân loại sau train (nếu có shape samples): khớp groundTruth. */
  shapeAccuracy: number | null;
  /** Reward trung bình cuối (nếu có RL samples). */
  finalReward: number | null;
  /** Các lỗi/ghi chú. */
  notes: string[];
}

/** Nhật ký một run huấn luyện — serialize để tái lập. */
export interface TrainingRun {
  id: string;
  startedAt: number;
  categories: CategoryTrainingReport[];
  /** Snapshot concept sau train (id → prototype) để đối chiếu về sau. */
  conceptCheckpoint: Array<{ conceptId: string; name: string; prototype: FormConceptSnapshot; samples: number }>;
  totalSamples: number;
}

/** Snapshot prototype. */
export interface FormConceptSnapshot {
  aspectRatio: number;
  relativeArea: number;
  vertexCount: number;
  centerHeightRatio: number;
  solidity: number;
}

/** Interface tối thiểu của pixel skill để trainer không phụ thuộc class cụ thể. */
export interface PixelSkillLike {
  learnFromAction(perception: {
    totalPixels: number;
    coverage: number;
    densityVariance: number;
    horizontalSymmetry: number;
    colorDiversity: number;
    dominantOwnerShare: number;
  }, actualQuality: number): unknown;
}

/** Tuỳ chọn trainer. */
export interface AgentTrainerOptions {
  cognition?: FormCognitionEngine;
  renderAgent?: SystemRenderAgent;
  pixelSkill?: PixelSkillLike;
  /** KnowledgeBase để nạp fact tri thức từ dataset `knowledge`. */
  knowledgeBase?: { add(input: unknown): unknown };
  /** Đường dẫn gốc dữ liệu. */
  root?: string;
}

/**
 * Trainer chính: nạp dataset và huấn luyện toàn bộ agent có trong hệ —
 * gọi `trainCategory(category)` cho từng loại hoặc `trainAll()`.
 */
export class AgentTrainer {
  public readonly qualityGate: RenderQualityGate = createRenderQualityGate();
  public readonly cognition: FormCognitionEngine;
  /** Tâm trí: cảm xúc + ngôn ngữ + chống nhàm chán — train từ dataset emotion/language. */
  public readonly emotionProfiles = new Map<string, EmotionProfile>();
  public readonly language = new LanguageEngine();
  public readonly novelty = new NoveltyDirector();
  public readonly renderAgent: SystemRenderAgent | null;
  public readonly pixelSkill: PixelSkillLike | null;
  public readonly root: string;
  public readonly knowledgeBase: { add(input: unknown): unknown } | null;
  public readonly runs: TrainingRun[] = [];
  /** Kho hạt sáng tạo nạp từ dữ liệu — agent phát minh dùng được. */
  public readonly creativitySeeds: CreativitySample[] = [];
  private runCounter = 0;

  constructor(options: AgentTrainerOptions = {}) {
    this.cognition = options.cognition ?? ({} as FormCognitionEngine);
    this.renderAgent = options.renderAgent ?? null;
    this.pixelSkill = options.pixelSkill ?? null;
    this.knowledgeBase = options.knowledgeBase ?? null;
    this.root = options.root ?? 'assets/training';
  }

  /** Huấn luyện một category từ thư mục dữ liệu tương ứng. */
  public trainCategory(category: TrainingCategory, dataset?: LoadedDataset): CategoryTrainingReport {
    const data = dataset ?? loadCategoryDataset(category, this.root);
    const report: CategoryTrainingReport = {
      category,
      shapeSamplesTrained: 0,
      rlEpisodes: 0,
      pixelSamplesTrained: 0,
      creativitySeeds: 0,
      shapeAccuracy: null,
      finalReward: null,
      notes: [],
    };
    const conceptName = TRAINING_CATEGORIES[category].conceptName;

    // 1) Học sâu nhận thức hình dạng.
    if (data.shapeSamples.length > 0) {
      const concept = this.cognition.concepts.get(category);
      if (!concept) {
        // Học khái niệm mới từ toàn bộ shape samples.
        const perceptions = data.shapeSamples.map(shapeToPerception);
        this.cognition.learnConcept(category, conceptName, perceptions);
        report.shapeSamplesTrained = data.shapeSamples.length;
      } else {
        // Concept đã có: import như dữ liệu ngoài (trung bình chạy).
        const external = data.shapeSamples.map((s) => ({
          source: `training:${category}`,
          aspectRatio: s.aspectRatio,
          relativeArea: s.relativeArea,
          vertexCount: s.vertexCount,
          centerHeightRatio: s.centerHeightRatio,
          solidity: s.solidity,
          groundTruth: s.groundTruth,
        }));
        const result = this.cognition.importExternalSamples(category, external);
        report.shapeSamplesTrained = result.accepted;
        if (result.rejected > 0) report.notes.push(`${result.rejected} mẫu bị từ chối — nhãn groundTruth lệch khái niệm`);
      }

      // Đo accuracy: phân loại lại chính samples — khớp groundTruth là đúng.
      let correct = 0;
      let judged = 0;
      for (const sample of data.shapeSamples) {
        const perception = shapeToPerception(sample);
        const classification = this.cognition.classify(perception);
        judged++;
        if (classification.name?.toLowerCase() === sample.groundTruth.toLowerCase()) correct++;
      }
      report.shapeAccuracy = judged > 0 ? Math.round((correct / judged) * 100) / 100 : null;
    } else {
      report.notes.push('không có shape samples — bỏ qua học nhận thức');
    }

    // 1b) Train blueprint render object + validate pixel dataset đúng/điểm ảnh đúng.
    if (data.shapeSamples.length > 0) {
      this.qualityGate.train(category, data.shapeSamples);
    }

    // 2) Học tăng cường render (nếu có agent hệ thống + reward samples).
    if (this.renderAgent && data.rewardSamples.length > 0) {
      let lastReward: number | null = null;
      for (const sample of data.rewardSamples) {
        const episode = this.renderAgent.reinforceEpisode(sample.perception, sample.groundTruthQuality);
        report.rlEpisodes++;
        lastReward = episode.reward;
      }
      report.finalReward = lastReward;
    } else if (!this.renderAgent) {
      report.notes.push('chưa gắn SystemRenderAgent — bỏ qua học tăng cường');
    }

    // 3) Học sâu điểm ảnh NPC.
    if (this.pixelSkill && data.pixelSamples.length > 0) {
      for (const sample of data.pixelSamples) {
        const perception = pixelSampleToPerception(sample);
        this.pixelSkill.learnFromAction(perception, sample.groundTruthQuality);
        report.pixelSamplesTrained++;
      }
    }

    // 3b) Validate pixel dataset: điểm ảnh đúng trước khi tin kết quả NPC.
    if (data.pixelSamples.length > 0) {
      const pixelCheck = validatePixelDatasetCorrectness(data.pixelSamples);
      if (!pixelCheck.valid) {
        report.notes.push(`pixel dataset lệch: ${pixelCheck.issues.length} lỗi — ${pixelCheck.issues[0]?.reason ?? ''}`);
      }
    }

    // 3c) Tâm trí: cảm xúc + ngôn ngữ + tri thức từ dataset mind.
    if (data.emotionSamples.length > 0) {
      const profileId = `mind_${category}`;
      let profile = this.emotionProfiles.get(profileId);
      if (!profile) {
        profile = createEmotionProfile(profileId, `Tâm trí ${category}`);
        this.emotionProfiles.set(profileId, profile);
      }
      for (const entry of data.emotionSamples) {
        trainEmotionProfile(profile, entry.reactions.map((r) => ({
          eventKind: entry.eventKind,
          emotion: r.emotion,
          intensityMultiplier: r.intensityMultiplier,
          decayRate: r.decayRate,
        })));
      }
      report.notes.push(`cảm xúc: profile "${profileId}" với ${profile.reactions.size} phản ứng`);
    }
    if (data.languageSamples.length > 0) {
      const learned = this.language.learnPhrases(data.languageSamples.map((l) => ({
        intent: l.intent as never,
        template: l.template,
        tone: l.tone as never,
        formality: l.formality ?? 0.5,
      })));
      report.notes.push(`ngôn ngữ: học ${learned} mẫu câu intent ${data.languageSamples[0].intent}`);
    }
    if (data.knowledgeSamples.length > 0) {
      if (this.knowledgeBase) {
        const knowledgeBase = this.knowledgeBase;
        const result = trainKnowledge(knowledgeBase, data.knowledgeSamples, { discoveredBy: 'training', year: 0 });
        report.notes.push(`tri thức: nạp ${result.added} fact vào KnowledgeBase`);
      } else {
        report.notes.push(`${data.knowledgeSamples.length} fact tri thức chờ — gắn KnowledgeBase qua options.knowledgeBase`);
      }
    }

    // 4) Hạt sáng tạo.
    for (const seed of data.creativitySamples) {
      this.creativitySeeds.push(seed);
      report.creativitySeeds++;
    }

    if (data.errors.length > 0) {
      for (const error of data.errors.slice(0, 5)) report.notes.push(`${error.file}: ${error.reason}`);
    }
    return report;
  }

  /** Huấn luyện toàn bộ category có dữ liệu — trả run tổng hợp. */
  public trainAll(categories?: readonly TrainingCategory[]): TrainingRun {
    const targets = categories ?? (Object.keys(TRAINING_CATEGORIES) as TrainingCategory[]);
    const reports: CategoryTrainingReport[] = [];
    let totalSamples = 0;
    for (const category of targets) {
      const report = this.trainCategory(category);
      reports.push(report);
      totalSamples += report.shapeSamplesTrained + report.rlEpisodes + report.pixelSamplesTrained + report.creativitySeeds;
    }
    const run: TrainingRun = {
      id: `run_${++this.runCounter}_${Date.now()}`,
      startedAt: Date.now(),
      categories: reports,
      conceptCheckpoint: [...this.cognition.concepts.values()].map((concept) => ({
        conceptId: concept.id,
        name: concept.name,
        prototype: { ...concept.prototype },
        samples: concept.samples,
      })),
      totalSamples,
    };
    this.runs.push(run);
    return run;
  }

  /**
   * TỰ TỐI ƯU HÀNG TRĂM LẦN: train category → sinh object → thu dataset từ
   * chính object đạt chuẩn → tối ưu blueprint → checkpoint. Trả lịch sử epochs.
   */
  public runSelfOptimization(options: {
    epochs?: number;
    categories?: readonly TrainingCategory[];
    objectsPerEpoch?: number;
    startYear?: number;
  } = {}): { loop: SelfOptimizationLoop; history: OptimizationEpoch[]; checkpoint: OptimizationCheckpoint } {
    const loop = new SelfOptimizationLoop({ gate: this.qualityGate, objectsPerEpoch: options.objectsPerEpoch ?? 6 });
    const targets = options.categories ?? (Object.keys(TRAINING_CATEGORIES) as TrainingCategory[]);
    for (const category of targets) {
      const dataset = loadCategoryDataset(category, this.root);
      if (dataset.shapeSamples.length > 0) loop.seedCategory(category, dataset.shapeSamples);
      if (dataset.pixelSamples.length > 0) loop.addPixelSamples(dataset.pixelSamples);
    }
    const history = loop.runMany(options.epochs ?? 100, options.startYear ?? 1);
    const checkpoint = loop.saveCheckpoint(`trainer_opt_${loop.epochsCompleted}`);
    return { loop, history, checkpoint };
  }

  /**
   * CHIẾN DỊCH QUY MÔ LỚN: chạy batch liên tục tới target (mặc định 10^15 —
   * hàng tỉ lượt), persist checkpoint + dataset sau mỗi batch vào
   * `assets/training/_optimized/`, resume được qua nhiều phiên.
   */
  public runMassiveCampaign(options: MassiveCampaignOptions = {}): CampaignResult {
    const runner = new MassiveTrainingRunner({
      ...options,
      root: options.root ?? this.root,
    });
    return runner.runCampaign();
  }

  /** Hạt sáng tạo ngẫu nhiên cho phân hệ phát minh — tất định theo seed. */
  public pickCreativitySeed(seed: string): CreativitySample | null {
    if (this.creativitySeeds.length === 0) return null;
    const index = hashInt(seed) % this.creativitySeeds.length;
    return this.creativitySeeds[index];
  }
}

/** Chuyển shape sample thành perception. */
export function shapeToPerception(sample: ShapeSample): ShapePerception {
  return {
    kind: 'polygon',
    bounds: { minX: 0, minY: 0, maxX: sample.aspectRatio * 10, maxY: 10 },
    width: Math.round(sample.aspectRatio * 10 * 100) / 100,
    height: 10,
    aspectRatio: sample.aspectRatio,
    area: sample.relativeArea,
    vertexCount: Math.round(sample.vertexCount),
    centroid: { x: (sample.aspectRatio * 10) / 2, y: 10 * (1 - sample.centerHeightRatio) },
    verticalSymmetry: clamp01Safe(sample.solidity),
    solidity: clamp01Safe(sample.solidity),
    centerHeightRatio: clamp01Safe(sample.centerHeightRatio),
  };
}

/** Chuyển pixel sample thành perception + cells. */
export function pixelSampleToPerception(sample: PixelSample): {
  totalPixels: number;
  coverage: number;
  densityVariance: number;
  horizontalSymmetry: number;
  colorDiversity: number;
  dominantOwnerShare: number;
} {
  const cells = sample.cells;
  const total = Math.max(1, cells.length);
  const colors = new Set(cells.map((c) => c.color));
  const rowCounts = new Array(Math.max(1, sample.height)).fill(0);
  const cellKeys = new Set(cells.map((c) => `${c.x},${c.y}`));
  let mirrored = 0;
  for (const cell of cells) {
    if (cell.y >= 0 && cell.y < sample.height) rowCounts[Math.min(sample.height - 1, Math.floor(cell.y))]++;
    if (cellKeys.has(`${sample.width - 1 - cell.x},${cell.y}`)) mirrored++;
  }
  const meanRow = cells.length / Math.max(1, sample.height);
  const variance = rowCounts.reduce((sum, c) => sum + (c - meanRow) ** 2, 0) / Math.max(1, sample.height);
  return {
    totalPixels: total,
    coverage: clamp01Safe(cells.length / Math.max(1, sample.width * sample.height)),
    densityVariance: Math.round(variance * 100) / 100,
    horizontalSymmetry: clamp01Safe(mirrored / total),
    colorDiversity: colors.size,
    dominantOwnerShare: 1,
  };
}

function clamp01Safe(value: number): number {
  return clamp01(Number.isFinite(value) ? value : 0);
}

function hashInt(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}
