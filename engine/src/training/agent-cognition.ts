/**
 * @file agent-cognition.ts
 * @module @aetheria/engine/training/agent-cognition
 * @description Bộ nhớ & khả năng ngôn ngữ RIÊNG TỪNG agent (npc, player,
 * quái…): mỗi agent có **chỉ số nhận thức nền ngẫu nhiên khác nhau** (seed theo
 * entity — không ai giống ai) và các chỉ số đó **THAY ĐỔI sau mỗi lần tiếp
 * xúc, giao tiếp, học** — trò chuyện nhiều → bộ nhớ rộng hơn, vốn từ giàu hơn,
 * nói trôi chảy hơn. Gồm:
 *
 * - `CognitiveProfile`: memoryCapacity, retentionRate (đường quên), fluency
 *   (ngôn ngữ), learningRate, socialExposure — baseline ngẫu nhiên + tiến hoá.
 * - `EpisodicMemorySystem`: ký ức sự kiện có trọng số cảm xúc (kỷ niệm đau/sư
 *   sung giữ lâu hơn), đường quên Ebbinghaus rút gọn, capacity giới hạn từ
 *   profile — đầy thì loại cũ NHƯNG kỷ niệm nặng cảm xúc được ưu tiên giữ.
 * - `ConversationEngine`: agent A nói chuyện agent B → cả hai ghi ký ức chung,
 *   socialExposure tăng → chỉ số tiến hoá, và **học mượn câu** từ giọng nhau.
 * - `applyFluency`: hậu chỉnh câu nói theo độ trôi chảy — fluent thấp nuốt
 *   từ/lặp, fluent cao thêm lỗi láy trang trọng.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import { LanguageEngine, type PhraseTemplate } from './agent-mind.js';

// ===========================================================================
// Chỉ số nhận thức — baseline ngẫu nhiên RIÊNG từng agent
// ===========================================================================

export interface CognitiveProfile {
  entityId: string;
  /** Số ký ức giữ được tối đa `[3, 60]`. */
  memoryCapacity: number;
  /** Tốc độ quên mỗi ngày `[0.01, 0.3]` — thấp = nhớ dai. */
  forgettingRate: number;
  /** Độ trôi chảy ngôn ngữ `[0.1, 1]` — ảnh hưởng câu nói. */
  fluency: number;
  /** Tốc độ học từ tiếp xúc `[0.2, 1.5]`. */
  learningRate: number;
  /** Số lần tiếp xúc/giao tiếp đã trải — chỉ số tiến hoá theo nó. */
  socialExposure: number;
  /** Số phiên học (learn) đã trải. */
  studySessions: number;
}

/** Baseline ngẫu nhiên RIÊNG từng agent — cùng entity cùng profile, khác entity khác profile. */
export function deriveCognitiveProfile(entityId: string, traits: Record<string, number> = {}): CognitiveProfile {
  const random = new DeepRandom(`cognition:${entityId}`);
  const intelligence = clamp01((traits.intelligence ?? 50) / 100);
  const willpower = clamp01((traits.willpower ?? 50) / 100);
  const sociability = clamp01((traits.sociability ?? 50) / 100);
  return {
    entityId,
    memoryCapacity: clampRange(Math.round(6 + intelligence * 28 + willpower * 12 + random.gaussian(0, 3)), 3, 60),
    forgettingRate: clampRange(0.22 - intelligence * 0.12 - willpower * 0.04 + random.gaussian(0, 0.02), 0.01, 0.3),
    fluency: clampRange(0.25 + sociability * 0.4 + intelligence * 0.3 + random.gaussian(0, 0.08), 0.1, 1),
    learningRate: clampRange(0.4 + intelligence * 0.7 + random.gaussian(0, 0.1), 0.2, 1.5),
    socialExposure: 0,
    studySessions: 0,
  };
}

/**
 * TIẾN HOÁ chỉ số sau tiếp xúc/giao tiếp/học — mỗi lần socialExposure tăng:
 * memoryCapacity +learningRate×2, fluency +learningRate×0.04 (giới hạn trần),
 * forgettingRate giảm dần (nhớ dai hơn qua trải nghiệm).
 */
export function evolveCognitiveProfile(profile: CognitiveProfile): CognitiveProfile {
  const lr = profile.learningRate;
  return {
    ...profile,
    memoryCapacity: clampRange(Math.round(profile.memoryCapacity + lr * 2), 3, 80),
    forgettingRate: clampRange(profile.forgettingRate - lr * 0.008, 0.01, 0.3),
    fluency: clamp01(profile.fluency + lr * 0.04),
    socialExposure: profile.socialExposure,
    studySessions: profile.studySessions,
  };
}

// ===========================================================================
// Ký ức sự kiện — đường quên + trọng số cảm xúc
// ===========================================================================

export interface EpisodicMemory {
  id: string;
  entityId: string;
  content: string;
  kind: 'conversation' | 'event' | 'learning' | 'observation';
  /** Trọng số cảm xúc `[0, 1]` — càng cao càng khó quên. */
  emotionalWeight: number;
  /** Ngày thế giới lúc ghi. */
  day: number;
  /** Độ nhớ còn lại `[0, 1]` — 0 là quên sạch. */
  retention: number;
  /** Ai là người tương tác cùng (nếu là conversation). */
  withEntityId?: string;
}

/** Hệ thống ký ức sự kiện của MỘT agent — capacity từ CognitiveProfile. */
export class EpisodicMemorySystem {
  public readonly entityId: string;
  public memories: EpisodicMemory[] = [];
  private profile: CognitiveProfile;

  constructor(profile: CognitiveProfile) {
    this.entityId = profile.entityId;
    this.profile = profile;
  }

  /** Đồng bộ profile (sau khi tiến hoá) — capacity mới áp dụng ngay. */
  public syncProfile(profile: CognitiveProfile): void {
    this.profile = profile;
    this.enforceCapacity();
  }

  /**
   * Ghi một ký ức: retention khởi đầu = 1, kỷ niệm nặng cảm xúc (≥ 0.7) được
   * đánh dấu ưu tiên giữ. Đầy capacity → loại ký ức NHỎ NHẤT (retention ×
   * emotionalWeight) trước — ký ức thường quên trước, kỷ niệm đau giữ lại.
   */
  public remember(content: string, kind: EpisodicMemory['kind'], day: number, emotionalWeight = 0.3, withEntityId?: string): EpisodicMemory {
    const memory: EpisodicMemory = {
      id: `mem_${this.entityId}_${this.memories.length}_${hashSeed(content).toString(16)}`,
      entityId: this.entityId,
      content,
      kind,
      emotionalWeight: clamp01(emotionalWeight),
      day,
      retention: 1,
      withEntityId,
    };
    this.memories.push(memory);
    this.enforceCapacity();
    return memory;
  }

  /** Đường quên: mỗi ngày retention giảm theo forgettingRate, ĐIỀU CHỈNH bởi trọng số cảm xúc (nặng quên chậm hơn nhiều). */
  public tick(days: number): EpisodicMemory[] {
    const forgotten: EpisodicMemory[] = [];
    for (const memory of this.memories) {
      const emotionalShield = 1 - memory.emotionalWeight * 0.75; // nặng cảm xúc → quên chậm 75%
      memory.retention = clamp01(memory.retention - this.profile.forgettingRate * days * Math.max(0.1, emotionalShield));
    }
    this.memories = this.memories.filter((m) => {
      if (m.retention <= 0.02) {
        forgotten.push(m);
        return false;
      }
      return true;
    });
    return forgotten;
  }

  /** Nhớ lại: ký ức khớp từ khoá, sắp theo retention × emotionalWeight. */
  public recall(query: string): EpisodicMemory[] {
    const keywords = query.toLowerCase().split(/\s+/).filter((k) => k.length > 1);
    return this.memories
      .filter((memory) => keywords.some((keyword) => memory.content.toLowerCase().includes(keyword)))
      .sort((a, b) => b.retention * b.emotionalWeight - a.retention * a.emotionalWeight);
  }

  /** Ký ức nổi bật nhất hiện tại — agent "vừa nghĩ tới" dùng cho thinking. */
  public mostVivid(): EpisodicMemory | null {
    if (this.memories.length === 0) return null;
    return this.memories.reduce((best, m) =>
      m.retention * m.emotionalWeight > best.retention * best.emotionalWeight ? m : best,
    );
  }

  private enforceCapacity(): void {
    while (this.memories.length > this.profile.memoryCapacity) {
      // Loại ký ức YẾU nhất (retention × emotionalWeight nhỏ nhất).
      let weakestIndex = 0;
      let weakestScore = Infinity;
      this.memories.forEach((memory, index) => {
        const score = memory.retention * memory.emotionalWeight;
        if (score < weakestScore) {
          weakestScore = score;
          weakestIndex = index;
        }
      });
      this.memories.splice(weakestIndex, 1);
    }
  }
}

// ===========================================================================
// Hậu chỉnh câu nói theo độ trôi chảy — fluent thấp nuốt từ, cao thêm lỗi láy
// ===========================================================================

/**
 * Hậu chỉnh câu theo fluency `[0.1, 1]`:
 * - < 0.35: nuốt âm — "C-chào… B-Bình…" (stutter);
 * - 0.35–0.6: rút gọn — bỏ đuôi trang trọng;
 * - > 0.8: thêm lễ phép — "Thưa rằng, …".
 */
export function applyFluency(line: string, fluency: number): string {
  const f = clampRange(fluency, 0.1, 1);
  if (f >= 0.8) return `Thưa rằng, ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
  if (f >= 0.35) return line;
  // Stutter: lặp âm đầu từ đầu câu 1-2 lần.
  const words = line.split(' ');
  if (words.length === 0) return line;
  const firstWord = words[0];
  const stutterCount = f < 0.22 ? 2 : 1;
  const stuttered = `${firstWord.slice(0, Math.max(1, Math.ceil(firstWord.length / 3)))}-`.repeat(stutterCount);
  return `${stuttered}${firstWord.toLowerCase()} ${words.slice(1).join(' ')}`;
}

// ===========================================================================
// ConversationEngine — giao tiếp làm cả hai TIẾN HOÁ
// ===========================================================================

/** Kết quả một cuộc trò chuyện. */
export interface ConversationResult {
  participants: [string, string];
  /** Câu agent A nói (đã qua fluency của A). */
  lineA: string;
  /** Câu agent B đáp (đã qua fluency của B). */
  lineB: string;
  /** Ký ức cả hai ghi về cuộc nói chuyện này. */
  memoriesCreated: number;
  /** Chỉ số tiến hoá sau cuộc trò chuyện. */
  evolved: boolean;
  /** Câu agent B học mượn từ giọng A (trao đổi vốn từ). */
  phrasesExchanged: number;
  note: string;
}

/** Tuỳ chọn ConversationEngine. */
export interface ConversationEngineOptions {
  language?: LanguageEngine;
  /** Mỗi cuộc trò chuyện tiến hoá profile cả hai (mặc định bật). */
  evolveOnConversation?: boolean;
}

/**
 * Động cơ giao tiếp: A nói chuyện B → cả hai ghi ký ức episodic, socialExposure
 * tăng → chỉ số nhận thức tiến hoá (bộ nhớ rộng hơn, nói trôi chảy hơn), và
 * trao đổi vốn từ (học mượn câu) — đúng "thay đổi sau số lần tiếp xúc".
 */
export class ConversationEngine {
  public readonly language: import('./agent-mind.js').LanguageEngine;
  public readonly evolveOnConversation: boolean;
  private readonly profiles = new Map<string, CognitiveProfile>();
  private readonly memories = new Map<string, EpisodicMemorySystem>();
  private conversationCounter = 0;

  constructor(options: ConversationEngineOptions = {}) {
    this.language = options.language ?? new LanguageEngine();
    this.evolveOnConversation = options.evolveOnConversation ?? true;
  }

  private profileOf(entityId: string, traits: Record<string, number> = {}): CognitiveProfile {
    let profile = this.profiles.get(entityId);
    if (!profile) {
      profile = deriveCognitiveProfile(entityId, traits);
      this.profiles.set(entityId, profile);
      this.memories.set(entityId, new EpisodicMemorySystem(profile));
    }
    return profile;
  }

  private memoryOf(entityId: string): EpisodicMemorySystem {
    return this.memories.get(entityId) ?? (() => {
      const system = new EpisodicMemorySystem(this.profileOf(entityId));
      this.memories.set(entityId, system);
      return system;
    })();
  }

  /** Profile hiện hành (đã tiến hoá). */
  public profileOf_(entityId: string): CognitiveProfile | undefined {
    return this.profiles.get(entityId);
  }

  /** Ký ức hệ thống của agent. */
  public memoryOf_(entityId: string): EpisodicMemorySystem | undefined {
    return this.memories.get(entityId);
  }

  /** Đánh dấu một phiên học — studySessions tăng, tiến hoá theo learningRate. */
  public recordStudy(entityId: string, traits: Record<string, number> = {}, day = 0, content = 'học được điều mới'): CognitiveProfile {
    const profile = this.profileOf(entityId, traits);
    profile.studySessions++;
    profile.socialExposure++; // học cũng là tiếp xúc
    const evolved = evolveCognitiveProfile(profile);
    Object.assign(profile, evolved);
    this.memoryOf(entityId).remember(content, 'learning', day, 0.5);
    return { ...profile };
  }

  /**
   * A nói chuyện B: cả hai nói một câu (theo fluency riêng), ghi ký  episodic
   * chung, socialExposure tăng → tiến hoá, trao đổi vốn từ qua LanguageEngine.
   */
  public converse(
    a: { id: string; traits?: Record<string, number>; personality: { extraversion?: number; agreeableness?: number; neuroticism?: number; conscientiousness?: number } },
    b: { id: string; traits?: Record<string, number>; personality: { extraversion?: number; agreeableness?: number; neuroticism?: number; conscientiousness?: number } },
    intent: PhraseTemplate['intent'],
    day: number,
    context: Partial<Record<'name' | 'target' | 'item' | 'place' | 'emotion', string>> = {},
  ): ConversationResult {
    this.profileOf(a.id, a.traits);
    this.profileOf(b.id, b.traits);
    const profileA = this.profiles.get(a.id)!;
    const profileB = this.profiles.get(b.id)!;

    // A nói trước, B đáp — câu hậu chỉnh theo fluency RIÊNG của từng người.
    const rawA = this.language.speak(a.id, intent, a.personality, { ...context, target: b.id, name: a.id });
    const rawB = this.language.speak(b.id, intent === 'greeting' ? 'greeting' : 'question', b.personality, { ...context, target: a.id, name: b.id });
    const lineA = rawA.line ? applyFluency(rawA.line, profileA.fluency) : '…';
    const lineB = rawB.line ? applyFluency(rawB.line, profileB.fluency) : '…';

    // Ký ức episodic chung: cả hai nhớ cuộc trò chuyện này.
    const convContent = `${a.id} nói: "${lineA}" — ${b.id} đáp: "${lineB}"`;
    this.memoryOf(a.id).remember(convContent, 'conversation', day, 0.4, b.id);
    this.memoryOf(b.id).remember(convContent, 'conversation', day, 0.4, a.id);
    const memoriesCreated = 2;

    // Tiến hoá chỉ số — tiếp xúc làm cả hai giỏi hơn.
    let evolved = false;
    if (this.evolveOnConversation) {
      profileA.socialExposure++;
      profileB.socialExposure++;
      const evolvedA = evolveCognitiveProfile(profileA);
      const evolvedB = evolveCognitiveProfile(profileB);
      Object.assign(profileA, evolvedA);
      Object.assign(profileB, evolvedB);
      this.memoryOf(a.id).syncProfile(profileA);
      this.memoryOf(b.id).syncProfile(profileB);
      evolved = true;
    }

    // Trao đổi vốn từ: LanguageEngine là kho chung — đếm câu cả hai đã dùng
    // làm số câu "trao đổi" (mô phỏng học mượn cách nói).
    const phrasesExchanged = Math.min(
      this.language.phrases.size,
      Math.max(0, Math.floor((profileA.socialExposure + profileB.socialExposure) / 5)),
    );

    this.conversationCounter++;
    return {
      participants: [a.id, b.id],
      lineA,
      lineB,
      memoriesCreated,
      evolved,
      phrasesExchanged,
      note: `${a.id} (fluency ${profileA.fluency.toFixed(2)}) ⇄ ${b.id} (fluency ${profileB.fluency.toFixed(2)}) — ký ức chung seq ${this.conversationCounter}`,
    };
  }

  /** Số cuộc trò chuyện đã xử lý. */
  public get conversationCount(): number {
    return this.conversationCounter;
  }
}

