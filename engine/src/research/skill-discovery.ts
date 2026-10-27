/**
 * @file skill-discovery.ts
 * @module @aetheria/engine/research/skill-discovery
 * @description Phân hệ "dữ liệu kỹ năng agent tự khám phá & phát minh":
 *
 * 1. **Knowledge base agent đọc được** — catalog thế giới chỉ cho agent xem
 *    *hint mờ* (tên bị che, tag gợi ý); độ rõ tăng dần khi agent thu thập mảnh
 *    insight. Hệ thống KHÔNG cấp phát kỹ năng — chỉ bán dấu vết.
 * 2. **Mảnh insight** thu qua quan sát (nhìn thầy thuốc chữa bệnh, nhìn kỹ sư
 *    vận hành máy) và qua **thất bại** (thất bại của chính mình vẫn là dữ kiện).
 * 3. **Phòng thí nghiệm phát minh**: trial-and-error nhiều lần thử; mỗi lần thử
 *    được chấm bởi một **mạng nơ-ron học từ kinh nghiệm** (deep learning — dự
 *    đoán xác suất tiến bộ rồi học từ kết quả thật), trạng thái **cảm xúc**
 *    (hưng phấn/nản lòng/kỳ vọng) điều chỉnh thực thi, và **deep thinking**
 *    (chain-of-thought khi đột phá, deliberate khi quyết định đi tiếp / nghỉ /
 *    từ bỏ / quay lại).
 * 4. Đột phá → kỹ năng được **tự đăng ký vào hệ thống kỹ năng cá nhân** của
 *    agent (và tuỳ chọn bridge ra hệ thống thế giới: y tế, lò rèn skill…).
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import { NeuralNetwork } from '../deeplearning/nn.js';
import { ThoughtEngine, type Thought } from '../psychology/thought.js';

// ===========================================================================
// Catalog thế giới — hint mờ agent đọc được
// ===========================================================================

/** Một hint mờ về kỹ năng có thể tồn tại trong thế giới. */
export interface SkillHint {
  id: string;
  /** Tên thật — chỉ hiển thị đầy đủ khi clarity đạt ngưỡng. */
  trueName: string;
  domain: string;
  /** Độ rõ `[0, 1]` — tăng khi thu thập mảnh insight. */
  clarity: number;
  /** Số mảnh insight cần để ghép đủ bức tranh. */
  fragmentsRequired: number;
  /** Độ khó nền `[0, 1]` — khó thì mỗi lần thử tiến ít hơn. */
  difficulty: number;
  /** Tag mờ gợi ý (thảo dược, xương, lửa, ma lực…). */
  blurredTags: readonly string[];
  /** Chức năng thật (chỉ agent đột phá mới biết). */
  effect: string;
}

/** Cấu hình tạo catalog. */
export interface CatalogSeed {
  id: string;
  trueName: string;
  domain: string;
  difficulty: number;
  fragmentsRequired?: number;
  blurredTags?: readonly string[];
  effect: string;
}

/** Kết quả "đọc" catalog — everything fuzzy. */
export interface CatalogEntry {
  hintId: string;
  /** Tên mờ: ký tự bị che tuỳ clarity. */
  blurredName: string;
  /** Tên thật chỉ lộ khi clarity ≥ 0.95. */
  revealedName: string | null;
  domain: string;
  clarity: number;
  fragmentsCollected: number;
  fragmentsRequired: number;
  tags: readonly string[];
  /** Mức độ agent tin rằng kỹ năng này tồn tại. */
  believedToExist: boolean;
}

/** Che tên theo clarity: clarity thấp → nhiều ký tự bị thay bằng '·'. */
export function blurName(trueName: string, clarity: number): string {
  const c = clamp01(clarity);
  if (c >= 0.95) return trueName;
  const visible = Math.max(1, Math.ceil(trueName.length * (0.15 + 0.8 * c)));
  let shown = 0;
  return [...trueName]
    .map((char) => {
      if (char === ' ') return char;
      shown++;
      return shown <= visible ? char : '·';
    })
    .join('');
}

/** Catalog kỹ năng của thế giới — agent chỉ đọc được bản mờ. */
export class WorldCatalog {
  public readonly hints = new Map<string, SkillHint>();
  private readonly random: DeepRandom;

  constructor(seed: number | string = 'aetheria-catalog', seeds: readonly CatalogSeed[] = []) {
    this.random = new DeepRandom(seed);
    for (const seedEntry of seeds) this.register(seedEntry);
  }

  /** Đăng ký một hint vào catalog thế giới. */
  public register(seed: CatalogSeed): SkillHint {
    const hint: SkillHint = {
      id: seed.id,
      trueName: seed.trueName,
      domain: seed.domain,
      clarity: 0,
      fragmentsRequired: Math.max(2, seed.fragmentsRequired ?? 4),
      difficulty: clamp01(seed.difficulty),
      blurredTags: seed.blurredTags ?? [],
      effect: seed.effect,
    };
    this.hints.set(hint.id, hint);
    return hint;
  }

  /**
   * Agent "đọc" catalog: chỉ thấy tên mờ, tag gợi ý và số mảnh đã ghép.
   * Kỹ năng tồn tại tin cậy khi clarity > 0.25 (đã nghe đồn có thật).
   */
  public browse(viewerId: string, options: { domain?: string; minClarity?: number } = {}): CatalogEntry[] {
    void viewerId;
    const minClarity = options.minClarity ?? 0;
    const entries: CatalogEntry[] = [];
    for (const hint of this.hints.values()) {
      if (hint.clarity < minClarity) continue;
      if (options.domain && hint.domain !== options.domain) continue;
      entries.push({
        hintId: hint.id,
        blurredName: blurName(hint.trueName, hint.clarity),
        revealedName: hint.clarity >= 0.95 ? hint.trueName : null,
        domain: hint.domain,
        clarity: hint.clarity,
        fragmentsCollected: Math.min(hint.fragmentsRequired, Math.round(hint.clarity * hint.fragmentsRequired)),
        fragmentsRequired: hint.fragmentsRequired,
        tags: hint.blurredTags,
        believedToExist: hint.clarity > 0.25,
      });
    }
    // Sắp xếp rõ nhất trước — agent đọc những gì mình hiểu được.
    entries.sort((a, b) => b.clarity - a.clarity || a.hintId.localeCompare(b.hintId));
    return entries;
  }

  /** Tăng độ rõ của hint (khi agent thu mảnh insight). Trả clarity mới. */
  public reveal(hintId: string, amount: number): number {
    const hint = this.hints.get(hintId);
    if (!hint) return 0;
    hint.clarity = clamp01(hint.clarity + Math.max(0, amount));
    return hint.clarity;
  }
}

// ===========================================================================
// Mảnh insight — thu qua quan sát và thất bại
// ===========================================================================

/** Nguồn của một mảnh insight. */
export type InsightSource = 'observation' | 'failure' | 'success' | 'teaching' | 'rumour';

/** Một mảnh insight ghép vào bức tranh kỹ năng. */
export interface InsightFragment {
  id: string;
  hintId: string;
  entityId: string;
  source: InsightSource;
  content: string;
  /** Giá trị mảnh `[0, 1]` — quyết định clarity tăng bao nhiêu. */
  weight: number;
  year: number;
}

/** Quan sát thế giới để gom mảnh insight về một hint. */
export interface ObservationContext {
  /** Kỹ năng quan sát được đang được ai đó thực hiện (chỉ số thành công của họ). */
  subjectMastery?: number;
  /** Agent có chú ý không `[0, 1]`. */
  attentiveness?: number;
  note?: string;
}

// ===========================================================================
// Dự án khám phá — phòng thí nghiệm trial-and-error
// ===========================================================================

/** Trạng thái dự án khám phá. */
export type DiscoveryStatus = 'exploring' | 'resting' | 'abandoned' | 'discovered';

/** Trạng thái cảm xúc của dự án (điều chỉnh thực thi và quyết định). */
export interface ProjectEmotion {
  /** Hưng phấn khi có tiến bộ `[0, 1]`. */
  excitement: number;
  /** Nản lòng tích luỹ từ thất bại `[0, 1]`. */
  frustration: number;
  /** Kỳ vọng thành công `[0, 1]`. */
  hope: number;
}

/** Một dự án khám phá một hint của một agent. */
export interface DiscoveryProject {
  key: string;
  entityId: string;
  hintId: string;
  status: DiscoveryStatus;
  fragments: InsightFragment[];
  attempts: number;
  failures: number;
  /** Tiến bộ `[0, 1]` — chạm 1 là đột phá. */
  progress: number;
  emotion: ProjectEmotion;
  startedYear: number;
  lastAttemptYear: number;
  discoveredSkillId?: string;
}

/** Kết quả một lần thử trong phòng thí nghiệm. */
export type AttemptOutcome = 'progress' | 'silent_failure' | 'insight' | 'setback' | 'breakthrough';

export interface DiscoveryAttemptResult {
  entityId: string;
  hintId: string;
  outcome: AttemptOutcome;
  /** Tiến bộ thật gained lần này. */
  progressGain: number;
  /** Mạng nơ-ron dự đoán trước khi thử. */
  predictedGain: number;
  /** Sai số dự đoán — mạng học từ đây. */
  predictionError: number;
  emotion: ProjectEmotion;
  fragment?: InsightFragment;
  discoveredSkill?: DiscoveredSkill;
  thought?: Thought;
  note: string;
}

/** Kỹ năng agent tự phát minh ra — tự đăng ký vào hệ thống kỹ năng cá nhân. */
export interface DiscoveredSkill {
  id: string;
  hintId: string;
  name: string;
  domain: string;
  effect: string;
  /** Sức mạnh `[0, 1]` — cao hơn khi dùng nhiều mảnh insight tốt. */
  power: number;
  entityId: string;
  discoveredYear: number;
  attemptsSpent: number;
  fragmentsUsed: number;
  /** Danh tiếng nhỏ khi phát minh từ thất bại nhiều (kinh nghiệm dày). */
  resilienceBonus: number;
}

/** Quyết định đi tiếp / nghỉ / từ bỏ / quay lại. */
export type ContinuationDecision = 'continue' | 'rest' | 'abandon' | 'resume';

export interface ContinuationResult {
  decision: ContinuationDecision;
  confidence: number;
  reasoning: string;
  thought?: Thought;
}

/** Bridge cảm xúc ra thế giới (tuỳ chọn — nối vào EmotionEngine). */
export interface DiscoveryEmotionBridge {
  trigger(entityId: string, emotion: string, intensity: number, cause: string): void;
}

/** Tuỳ chọn phòng thí nghiệm. */
export interface SkillDiscoveryOptions {
  seed?: number | string;
  catalogSeeds?: readonly CatalogSeed[];
  /** Ngưỡng nản lòng để deliberate nghiêng về từ bỏ. */
  abandonFrustration?: number;
  /** Nghỉ giữa các lần thử giúp hồi nản lòng mỗi lần gọi attempt. */
  restRecovery?: number;
  /** Bridge cảm xúc (EmotionEngine của thế giới). */
  emotionBridge?: DiscoveryEmotionBridge;
  /** Bridge đăng ký kỹ năng ra hệ thống thế giới khi đột phá. */
  onDiscover?: (skill: DiscoveredSkill) => void;
}

const DEFAULT_ABANDON_FRUSTRATION = 0.85;
const DEFAULT_REST_RECOVERY = 0.25;

/**
 * Phòng thí nghiệm khám phá & phát minh kỹ năng.
 *
 * Mỗi cặp (agent, hint) là một dự án. Agent đọc catalog mờ → gom mảnh insight
 * qua quan sát/thất bại → thử nghiệm nhiều lần. Một mạng nơ-ron nhỏ học từ kết
 * quả thật của từng lần thử để dự đoán lần kế ("rút kinh nghiệm" bằng deep
 * learning); cảm xúc (hưng phấn/nản) điều chỉnh hiệu suất; deep thinking ra
 * quyết định đi tiếp, nghỉ, từ bỏ hay quay lại.
 */
export class SkillDiscoveryLab {
  public readonly catalog: WorldCatalog;
  public readonly projects = new Map<string, DiscoveryProject>();
  /** Kỹ năng tự đăng ký vào hệ thống kỹ năng cá nhân theo agent. */
  public readonly personalSkills = new Map<string, DiscoveredSkill[]>();
  public readonly abandonFrustration: number;
  public readonly restRecovery: number;
  public readonly seed: number | string;
  /** Log toàn bộ lần thử — dữ liệu thu thập cho agentic AI. */
  public readonly attemptLog: DiscoveryAttemptResult[] = [];

  private readonly random: DeepRandom;
  private readonly emotionBridge?: DiscoveryEmotionBridge;
  private readonly onDiscover?: (skill: DiscoveredSkill) => void;
  /** Bộ não dự đoán tiến bộ theo agent — học từ kết quả thật (deep learning). */
  private readonly experienceNets = new Map<string, NeuralNetwork>();

  constructor(options: SkillDiscoveryOptions = {}) {
    this.seed = options.seed ?? 'aetheria-discovery';
    this.catalog = new WorldCatalog(`${this.seed}:catalog`, options.catalogSeeds ?? []);
    this.random = new DeepRandom(`${this.seed}:lab`);
    this.abandonFrustration = clamp01(options.abandonFrustration ?? DEFAULT_ABANDON_FRUSTRATION);
    this.restRecovery = clamp01(options.restRecovery ?? DEFAULT_REST_RECOVERY);
    this.emotionBridge = options.emotionBridge;
    this.onDiscover = options.onDiscover;
  }

  // -------------------------------------------------------------------------
  // Mảnh insight
  // -------------------------------------------------------------------------

  /** Quan sát ai đó thực hiện kỹ năng → mảnh insight (xác suất theo độ chú ý). */
  public observe(
    entityId: string,
    hintId: string,
    year: number,
    context: ObservationContext = {},
  ): InsightFragment | null {
    const hint = this.catalog.hints.get(hintId);
    if (!hint) return null;
    const attentiveness = clamp01(context.attentiveness ?? 0.5);
    const subjectMastery = clamp01(context.subjectMastery ?? 0.6);
    const chance = clamp01(0.15 + attentiveness * 0.5 + subjectMastery * 0.2);
    if (!this.random.chance(chance)) return null;

    const fragment: InsightFragment = {
      id: `insight_${hashSeed(`${entityId}:${hintId}:${year}:${this.random.int(0, 99999)}`).toString(16)}`,
      hintId,
      entityId,
      source: 'observation',
      content:
        context.note ??
        `Quan sát được một thủ thuật của ${hint.domain}: ${this.random.pick(hint.blurredTags) ?? 'một chi tiết'} quan trọng.`,
      weight: clamp01(0.2 + subjectMastery * 0.4 + attentiveness * 0.2),
      year,
    };
    this.absorbFragment(entityId, fragment);
    return fragment;
  }

  /** Ghi nhận thất bại của chính agent — thất bại vẫn dạy một điều gì đó. */
  public recordFailure(entityId: string, hintId: string, year: number, note?: string): InsightFragment {
    const hint = this.catalog.hints.get(hintId);
    const fragment: InsightFragment = {
      id: `insight_${hashSeed(`${entityId}:${hintId}:fail:${year}:${this.random.int(0, 99999)}`).toString(16)}`,
      hintId,
      entityId,
      source: 'failure',
      content: note ?? `Lần thử này cho biết một đường bị lạc — biết cái gì KHÔNG được cũng là dữ kiện.`,
      weight: clamp01(0.1 + (hint ? (1 - hint.difficulty) * 0.15 : 0.1)),
      year,
    };
    this.absorbFragment(entityId, fragment);
    return fragment;
  }

  /** Nhận mảnh insight từ ngoài (dạy học, đồn đại, thành công của người khác). */
  public absorbFragment(entityId: string, fragment: InsightFragment): void {
    const project = this.projectOf(entityId, fragment.hintId);
    project.fragments.push(fragment);
    // Trùng lặp nội dung cho trọng số giảm dần — điều đã biết không mới như cũ.
    const duplicates = project.fragments.filter((f) => f.content === fragment.content).length;
    const effective = fragment.weight / Math.max(1, duplicates);
    this.catalog.reveal(fragment.hintId, effective * 0.35);
    // Mảnh mới đánh thức dự án đã bỏ — hy vọng trở lại.
    if (project.status === 'abandoned') {
      project.status = 'exploring';
      project.emotion.hope = clamp01(project.emotion.hope + 0.3);
      project.emotion.frustration = clamp01(project.emotion.frustration - 0.3);
      this.emitEmotion(entityId, 'hope', 0.4, `mảnh insight mới về ${fragment.hintId}`);
    }
  }

  // -------------------------------------------------------------------------
  // Phòng thí nghiệm — thử & sai
  // -------------------------------------------------------------------------

  private projectOf(entityId: string, hintId: string): DiscoveryProject {
    const key = `${entityId}:${hintId}`;
    let project = this.projects.get(key);
    if (!project) {
      project = {
        key,
        entityId,
        hintId,
        status: 'exploring',
        fragments: [],
        attempts: 0,
        failures: 0,
        progress: 0,
        emotion: { excitement: 0.4, frustration: 0, hope: 0.5 },
        startedYear: 0,
        lastAttemptYear: 0,
      };
      this.projects.set(key, project);
    }
    return project;
  }

  /** Bộ não dự đoán tiến bộ của một agent (deep learning rút kinh nghiệm). */
  private experienceNetOf(entityId: string): NeuralNetwork {
    let net = this.experienceNets.get(entityId);
    if (!net) {
      net = new NeuralNetwork({
        inputSize: 6,
        hiddenSizes: [8],
        outputSize: 1,
        hiddenActivation: 'tanh',
        outputActivation: 'sigmoid',
        optimizer: { kind: 'adam', learningRate: 0.02 },
        seed: hashSeed(`${this.seed}:${entityId}`) % 2147483647,
      });
      this.experienceNets.set(entityId, net);
    }
    return net;
  }

  /** Vector đặc trưng cho mạng: trạng thái dự án + năng lực agent. */
  private featuresOf(project: DiscoveryProject, options: { aptitude?: number; resources?: number }): number[] {
    const hint = this.catalog.hints.get(project.hintId);
    return [
      clamp01(hint?.clarity ?? 0),
      clamp01(project.fragments.length / Math.max(1, hint?.fragmentsRequired ?? 4)),
      clamp01(project.emotion.frustration),
      clamp01(hint?.difficulty ?? 0.5),
      clamp01(options.aptitude ?? 0.5),
      clamp01(options.resources ?? 0.5),
    ];
  }

  /**
   * Một lần thử trong phòng thí nghiệm.
   * Trình tự: mạng nơ-ron dự đoán khả năng tiến bộ → thực thi điều chỉnh bởi
   * cảm xúc → rút kết quả thật → **huấn luyện lại mạng từ kết quả thật** →
   * cập nhật cảm xúc → (tuỳ chọn) deep thinking ghi chuỗi suy luận.
   */
  public attempt(
    entityId: string,
    hintId: string,
    year: number,
    options: {
      aptitude?: number;
      resources?: number;
      persistence?: number;
      thoughtEngine?: ThoughtEngine;
    } = {},
  ): DiscoveryAttemptResult {
    const project = this.projectOf(entityId, hintId);
    const hint = this.catalog.hints.get(hintId);
    if (!hint) {
      return {
        entityId,
        hintId,
        outcome: 'silent_failure',
        progressGain: 0,
        predictedGain: 0,
        predictionError: 0,
        emotion: project.emotion,
        note: 'hint không tồn tại trong catalog — agent đang đuổi theo bóng',
      };
    }
    if (project.status === 'discovered') {
      return {
        entityId,
        hintId,
        outcome: 'silent_failure',
        progressGain: 0,
        predictedGain: 0,
        predictionError: 0,
        emotion: project.emotion,
        note: 'đã phát minh xong kỹ năng này',
      };
    }
    if (project.status === 'abandoned') {
      return {
        entityId,
        hintId,
        outcome: 'silent_failure',
        progressGain: 0,
        predictedGain: 0,
        predictionError: 0,
        emotion: project.emotion,
        note: 'dự án đã bị từ bỏ — cần mảnh insight mới để quay lại',
      };
    }

    project.attempts++;
    project.lastAttemptYear = year;
    if (project.startedYear === 0) project.startedYear = year;

    const net = this.experienceNetOf(entityId);
    const features = this.featuresOf(project, options);
    const predictedGain = clamp01(net.predict(features)[0] ?? 0);

    const aptitude = clamp01(options.aptitude ?? 0.5);
    const resources = clamp01(options.resources ?? 0.5);
    const persistence = clamp01(options.persistence ?? 0.5);
    const emotion = project.emotion;
    // Cảm xúc điều chỉnh thực thi: nản làm tay run, hưng phấn làm tinh nhạy.
    const emotionFactor = 1 - emotion.frustration * 0.4 + emotion.excitement * 0.15;
    const fragmentRatio = clamp01(project.fragments.length / hint.fragmentsRequired);
    // Tiến bộ thật: mảnh insight là nhiên liệu chính, tài nguyên và năng lực khuếch đại.
    const rawGain =
      (0.03 + fragmentRatio * 0.22) *
      (1 - hint.difficulty * 0.5) *
      (0.7 + 0.6 * aptitude) *
      (0.8 + 0.4 * resources) *
      emotionFactor;
    // Dự đoán của mạng chỉ là gợi ý nhỏ (giới hạn để không tạo vòng phản hồi
    // dương giữa việc học và kết quả thật).
    const baseGain = rawGain * (0.9 + clampRange(predictedGain, 0, 0.6) * 0.2);
    const progressGain = clampRange(this.random.gaussian(Math.max(0, baseGain), Math.max(0.005, baseGain * 0.35)), 0, 1);

    let outcome: AttemptOutcome;
    let fragment: InsightFragment | undefined;
    let discoveredSkill: DiscoveredSkill | undefined;
    let thought: Thought | undefined;
    let note: string;

    const newProgress = project.progress + progressGain;
    if (newProgress >= 1) {
      outcome = 'breakthrough';
      project.progress = 1;
      discoveredSkill = this.finalizeDiscovery(project, hint, year);
      note = `ĐỘT PHÁ! "${hint.trueName}" được phát minh sau ${project.attempts} lần thử và ${project.fragments.length} mảnh insight.`;
      if (options.thoughtEngine) {
        thought = options.thoughtEngine.chainOfThought(
          `phát minh ${hint.trueName}`,
          [
            { premise: `đã ghép ${project.fragments.length}/${hint.fragmentsRequired} mảnh insight`, inference: 'bức tranh kỹ năng đủ rõ' },
            { premise: 'bức tranh đủ rõ', inference: `biết cách làm: ${hint.effect}` },
          ],
          { learn: false, source: 'phòng thí nghiệm' },
        );
      }
      this.emitEmotion(entityId, 'eureka', 0.9, `phát minh ${hint.trueName}`);
    } else {
      project.progress = newProgress;
      // Phân loại kết quả: tiến bộ rõ / có insight mới / lặng lẽ / phản tác dụng.
      const insightChance = clamp01(0.12 + fragmentRatio * 0.2 - project.failures * 0.01);
      if (progressGain > 0.06) {
        outcome = 'progress';
        emotion.excitement = clamp01(emotion.excitement + 0.15);
        emotion.frustration = clamp01(emotion.frustration - 0.1);
        emotion.hope = clamp01(emotion.hope + 0.1);
        note = `tiến bộ ${Math.round(progressGain * 1000) / 10}% — cơ chế dần sáng rõ`;
      } else if (this.random.chance(insightChance)) {
        outcome = 'insight';
        fragment = this.recordFailure(entityId, hintId, year, `Thất bại lần ${project.attempts} hé lộ: ${this.random.pick(hint.blurredTags) ?? 'một chi tiết'} không nằm trong công thức.`);
        emotion.hope = clamp01(emotion.hope + 0.15);
        emotion.excitement = clamp01(emotion.excitement + 0.05);
        note = `thất bại nhưng rút ra được một mảnh insight (trọng số ${fragment.weight.toFixed(2)})`;
      } else if (this.random.chance(clamp01(0.08 + hint.difficulty * 0.12))) {
        outcome = 'setback';
        project.failures++;
        emotion.frustration = clamp01(emotion.frustration + 0.2);
        emotion.excitement = clamp01(emotion.excitement - 0.1);
        emotion.hope = clamp01(emotion.hope - 0.05);
        note = 'phản tác dụng — nguyên liệu hỏng, phải làm lại từ đầu mảnh này';
      } else {
        outcome = 'silent_failure';
        project.failures++;
        emotion.frustration = clamp01(emotion.frustration + 0.08);
        note = 'thử không ra gì — ghi chép và thử cách khác';
      }
      // (recordFailure đã tự hấp thụ mảnh — không hấp thụ lần hai.)
      // Nghỉ ngơi giữa các lần thử (mỗi lần thử kèm một chút hồi phục nản lòng).
      emotion.frustration = clamp01(emotion.frustration - this.restRecovery * 0.1);
      this.emitEmotion(
        entityId,
        outcome === 'progress' || outcome === 'insight' ? 'curiosity' : 'frustration',
        outcome === 'setback' ? 0.4 : 0.25,
        `${hintId} lần thử ${project.attempts}`,
      );
    }

    // Deep learning rút kinh nghiệm: mạng học từ sai lệch dự đoán của chính nó
    // (target tách khỏi vòng phản hồi — học kết quả thật, không tự khuếch đại).
    const predictionError = Math.abs(predictedGain - progressGain);
    net.trainSample({ input: features, target: [clamp01(progressGain)] }, 'huber');

    const result: DiscoveryAttemptResult = {
      entityId,
      hintId,
      outcome,
      progressGain: Math.round(progressGain * 1000) / 1000,
      predictedGain: Math.round(predictedGain * 1000) / 1000,
      predictionError: Math.round(predictionError * 1000) / 1000,
      emotion: { ...emotion },
      fragment,
      discoveredSkill,
      thought,
      note,
    };
    this.attemptLog.push(result);
    if (this.attemptLog.length > 5000) this.attemptLog.splice(0, this.attemptLog.length - 5000);
    return result;
  }

  /**
   * Deep thinking: quyết định đi tiếp / nghỉ / từ bỏ / quay lại bằng
   * deliberate — cân nhắc tiện ích (tiến bộ kỳ vọng), rủi ro (nản lòng
   * tích luỹ, chi phí nguyên liệu) và niềm tin (đã ghép được bao nhiêu mảnh).
   */
  public decideContinue(
    entityId: string,
    hintId: string,
    year: number,
    options: { thoughtEngine?: ThoughtEngine; resources?: number } = {},
  ): ContinuationResult {
    const project = this.projectOf(entityId, hintId);
    const hint = this.catalog.hints.get(hintId);
    const thoughtEngine = options.thoughtEngine ?? new ThoughtEngine();
    const emotion = project.emotion;
    const fragmentRatio = project.fragments.length / Math.max(1, hint?.fragmentsRequired ?? 4);

    // Đồng bộ trạng thái "đã bỏ" vào niềm tin để deliberate thấy đúng bối cảnh.
    if (project.status === 'abandoned') {
      thoughtEngine.learnBelief(`dự án ${hint?.trueName ?? hintId} từng bị bỏ vì quá nản`, 0.9, 'ký ức phòng lab');
    }
    if (fragmentRatio >= 0.75) {
      thoughtEngine.learnBelief(`bức tranh ${hint?.trueName ?? hintId} đã gần ghép đủ`, 0.8, 'mảnh insight');
    }

    const ranked = thoughtEngine.deliberate(
      [
        {
          id: 'continue',
          label: 'đi tiếp thử nghiệm',
          utility: clamp01(0.3 + fragmentRatio * 0.5 + emotion.hope * 0.2),
          risk: clamp01(emotion.frustration * 0.6 + (hint?.difficulty ?? 0.5) * 0.3),
          cost: clamp01(0.4 - (options.resources ?? 0.5) * 0.3),
          supports: fragmentRatio >= 0.5 ? [`bức tranh ${hint?.trueName ?? hintId} đã gần ghép đủ`] : [],
        },
        {
          id: 'rest',
          label: 'nghỉ một mùa để lấy lại tinh thần',
          utility: clamp01(0.25 + emotion.frustration * 0.6),
          risk: 0.1,
          cost: 0.2,
        },
        {
          id: 'abandon',
          label: 'từ bỏ dự án này',
          utility: clamp01(emotion.frustration * 0.8 - fragmentRatio * 0.4),
          risk: 0.05,
          cost: 0.1,
          supports: project.status === 'abandoned' ? [`dự án ${hint?.trueName ?? hintId} từng bị bỏ vì quá nản`] : [],
        },
      ],
      { stress: emotion.frustration * 100, mood: emotion.excitement * 2 - 1 },
    );

    let decision: ContinuationDecision = 'continue';
    let reasoning = '';
    if (ranked.chosenId === 'continue') {
      decision = 'continue';
      reasoning = `tiến bộ ${Math.round(project.progress * 100)}% và ${project.fragments.length} mảnh insight đủ để hy vọng`;
    } else if (ranked.chosenId === 'rest') {
      decision = 'rest';
      reasoning = `nản lòng ${Math.round(emotion.frustration * 100)}% — nghỉ để tránh cháy sạch đam mê`;
      project.status = 'resting';
    } else {
      // Không từ bỏ khi đã gần đích và còn kiên trì.
      if (fragmentRatio >= 0.75 && ranked.thought.confidence < 0.75) {
        decision = 'continue';
        reasoning = 'suýt từ bỏ nhưng bức tranh đã quá rõ — đi nốt';
      } else {
        decision = 'abandon';
        reasoning = `${ranked.reasons[0] ?? 'nản lòng quá mức'} — cất dự án vào ngăn kéo`;
        project.status = 'abandoned';
        this.emitEmotion(entityId, 'disappointment', 0.5, `từ bỏ ${hint?.trueName ?? hintId}`);
      }
    }
    void year;

    const thought = thoughtEngine.explainDecision(ranked.chosenLabel, ranked.reasons);
    return { decision, confidence: ranked.thought.confidence, reasoning, thought };
  }

  /** Chủ động quay lại một dự án đang nghỉ. */
  public resume(entityId: string, hintId: string): boolean {
    const project = this.projects.get(`${entityId}:${hintId}`);
    if (!project || project.status === 'discovered' || project.status === 'abandoned') return false;
    project.status = 'exploring';
    project.emotion.hope = clamp01(project.emotion.hope + 0.2);
    return true;
  }

  /** Kỹ năng agent đã tự phát minh và đăng ký vào hệ thống cá nhân. */
  public personalSkillsOf(entityId: string): DiscoveredSkill[] {
    return [...(this.personalSkills.get(entityId) ?? [])];
  }

  /** Dự án của một agent. */
  public projectsOf(entityId: string): DiscoveryProject[] {
    return [...this.projects.values()].filter((project) => project.entityId === entityId);
  }

  /** Thống kê toàn phòng thí nghiệm. */
  public stats(): {
    hints: number;
    projects: number;
    attempts: number;
    discoveries: number;
    abandoned: number;
    resting: number;
    insights: number;
  } {
    let attempts = 0;
    let discoveries = 0;
    let abandoned = 0;
    let resting = 0;
    let insights = 0;
    for (const project of this.projects.values()) {
      attempts += project.attempts;
      if (project.status === 'discovered') discoveries++;
      else if (project.status === 'abandoned') abandoned++;
      else if (project.status === 'resting') resting++;
      insights += project.fragments.length;
    }
    return {
      hints: this.catalog.hints.size,
      projects: this.projects.size,
      attempts,
      discoveries,
      abandoned,
      resting,
      insights,
    };
  }

  /** Ảnh chụp nhẹ để lưu game (mảnh insight + dự án + kỹ năng cá nhân). */
  public snapshot(): {
    seed: number | string;
    projects: DiscoveryProject[];
    personalSkills: Array<{ entityId: string; skills: DiscoveredSkill[] }>;
  } {
    return {
      seed: this.seed,
      projects: [...this.projects.values()].map((project) => ({
        ...project,
        fragments: [...project.fragments],
        emotion: { ...project.emotion },
      })),
      personalSkills: [...this.personalSkills.entries()].map(([entityId, skills]) => ({ entityId, skills: [...skills] })),
    };
  }

  // -------------------------------------------------------------------------
  // Nội bộ
  // -------------------------------------------------------------------------

  /** Hoàn tất đột phá: tạo kỹ năng, tự đăng ký vào hệ thống cá nhân + bridge. */
  private finalizeDiscovery(project: DiscoveryProject, hint: SkillHint, year: number): DiscoveredSkill {
    const avgWeight =
      project.fragments.length > 0
        ? project.fragments.reduce((sum, fragment) => sum + fragment.weight, 0) / project.fragments.length
        : 0.3;
    const resilienceBonus = clamp01(project.failures / Math.max(1, project.attempts) * 0.5);
    const skill: DiscoveredSkill = {
      id: `discovered_${hint.id}_${hashSeed(`${project.entityId}:${hint.id}:${year}`).toString(16)}`,
      hintId: hint.id,
      name: hint.trueName,
      domain: hint.domain,
      effect: hint.effect,
      power: clamp01(0.35 + avgWeight * 0.45 + resilienceBonus * 0.2),
      entityId: project.entityId,
      discoveredYear: year,
      attemptsSpent: project.attempts,
      fragmentsUsed: project.fragments.length,
      resilienceBonus,
    };
    project.status = 'discovered';
    project.discoveredSkillId = skill.id;
    const owned = this.personalSkills.get(project.entityId) ?? [];
    owned.push(skill);
    this.personalSkills.set(project.entityId, owned);
    // Tự đăng ký ra hệ thống thế giới nếu có bridge (y tế, lò rèn, kỹ năng NPC…).
    this.onDiscover?.(skill);
    return skill;
  }

  private emitEmotion(entityId: string, emotion: string, intensity: number, cause: string): void {
    this.emotionBridge?.trigger(entityId, emotion, clamp01(intensity), cause);
  }
}

/** Tạo nhanh phòng thí nghiệm với catalog mẫu về y tế + chế tạo. */
export function createSkillDiscoveryLab(options: SkillDiscoveryOptions = {}): SkillDiscoveryLab {
  const seeds: CatalogSeed[] = [
    { id: 'hint_bone_setting', trueName: 'Bó xương nẹp tre', domain: 'medicine', difficulty: 0.45, blurredTags: ['xương', 'nẹp', 'tre'], effect: 'cố định xương gãy lành sau 40 ngày' },
    { id: 'hint_herbal_fever', trueName: 'Thuốc hạ sốt kim tiền', domain: 'medicine', difficulty: 0.3, blurredTags: ['lá', 'sắc', 'sốt'], effect: 'hạ sốt bằng sắc lá kim tiền' },
    { id: 'hint_water_wheel', trueName: 'Cối xay nước', domain: 'engineering', difficulty: 0.6, fragmentsRequired: 5, blurredTags: ['nước', 'bánh xe', 'quay'], effect: 'biến dòng nước thành sức xoay xay bột' },
    { id: 'hint_fire_hardening', trueName: 'Lửa tôi mũi giáo', domain: 'craft', difficulty: 0.25, blurredTags: ['lửa', 'gỗ', 'cứng'], effect: 'đầu giáo cứng hơn sau khi hơ lửa' },
    { id: 'hint_mana_weave', trueName: 'Dệt ma lực trị liệu', domain: 'arcane', difficulty: 0.8, fragmentsRequired: 6, blurredTags: ['ma lực', 'huyệt', 'lá'], effect: 'dệt mana qua huyệt để đẩy lùi tà bệnh' },
  ];
  return new SkillDiscoveryLab({ ...options, catalogSeeds: options.catalogSeeds ?? seeds });
}
