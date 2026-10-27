/**
 * @file agent-mind.ts
 * @module @aetheria/engine/training/agent-mind
 * @description Huấn luyện "tâm trí" agent từ dữ liệu — những lớp còn thiếu để
 * game không nhàm chán, bắt đầu thuận lợi:
 *
 * - **Cảm xúc (emotion)**: hồ sơ phản ứng cảm xúc theo từng loại sự kiện —
 *   hệ số khuếch đại + tốc độ suy giảm từng kênh cảm xúc, train từ dataset
 *   (`emotion`). Agent nhạy cảm vs điềm đạm phản KHÁC nhau cùng một sự kiện.
 * - **Ngôn ngữ (language)**: kho mẫu câu theo ý định (chào, đe dọa, thương
 *   lượng, than khóc, đùa…) với slot điền từ bối cảnh; agent học từ mẫu data,
 *   chọn giọng theo tính cách, tránh lặp câu vừa nói — NPC mở miệng nói được.
 * - **Tri thức (knowledge)**: nạp fact dataset thẳng vào KnowledgeBase —
 *   scholar có tri thức để dạy/nghiên cứu ngay từ đầu game.
 * - **Chống nhàm chán (novelty)**: đo lặp lại hành vi từng agent, điểm chán
 *   tăng dần, gợi ý sự kiện/ngành mới agent chưa thử — director điều tiết nhịp
 *   game.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

// ===========================================================================
// 1) Cảm xúc — hồ sơ phản ứng train được
// ===========================================================================

/** Hệ số phản ứng một kênh cảm xúc trước một loại sự kiện. */
export interface EmotionReaction {
  eventKind: string;
  emotion: string;
  /** Khuếch đại cường độ gốc `[0, 2]` — 1 = chuẩn. */
  intensityMultiplier: number;
  /** Tốc độ suy giảm riêng `[0.05, 2]` — cao = qua nhanh. */
  decayRate: number;
  samples: number;
}

/** Hồ sơ cảm xúc của một agent/nhóm (train từ dataset). */
export interface EmotionProfile {
  id: string;
  name: string;
  /** Suy giảm nền mỗi ngày cho mọi kênh. */
  baseDecayPerDay: number;
  /** Bảng phản ứng: key = `${eventKind}→${emotion}`. */
  reactions: Map<string, EmotionReaction>;
  samples: number;
}

export interface EmotionSampleInput {
  eventKind: string;
  emotion: string;
  intensityMultiplier: number;
  decayRate?: number;
}

/** Tạo hồ sơ cảm xúc trống. */
export function createEmotionProfile(id: string, name: string, baseDecayPerDay = 0.15): EmotionProfile {
  return { id, name, baseDecayPerDay, reactions: new Map(), samples: 0 };
}

/**
 * Train hồ sơ cảm xúc từ mẫu: trung bình chạy (running average) từng cặp
 * (eventKind → emotion) — mẫu càng nhiều phản ứng càng ổn định.
 */
export function trainEmotionProfile(
  profile: EmotionProfile,
  samples: readonly EmotionSampleInput[],
): { trained: number; updatedReactions: number } {
  let updated = 0;
  for (const sample of samples) {
    const key = `${sample.eventKind}→${sample.emotion}`;
    const existing = profile.reactions.get(key);
    const multiplier = clampRange(sample.intensityMultiplier, 0, 2);
    const decay = clampRange(sample.decayRate ?? 0.15, 0.05, 2);
    if (existing) {
      const w = 1 / (existing.samples + 1);
      existing.intensityMultiplier = Math.round((existing.intensityMultiplier * (1 - w) + multiplier * w) * 1000) / 1000;
      existing.decayRate = Math.round((existing.decayRate * (1 - w) + decay * w) * 1000) / 1000;
      existing.samples++;
    } else {
      profile.reactions.set(key, {
        eventKind: sample.eventKind,
        emotion: sample.emotion,
        intensityMultiplier: multiplier,
        decayRate: decay,
        samples: 1,
      });
      updated++;
    }
    profile.samples++;
  }
  return { trained: samples.length, updatedReactions: updated };
}

/** Phản ứng đã train cho một sự kiện; chưa train → phản ứng trung tính. */
export function reactionFor(profile: EmotionProfile, eventKind: string, emotion: string): { multiplier: number; decayRate: number; trained: boolean } {
  const reaction = profile.reactions.get(`${eventKind}→${emotion}`);
  if (!reaction) return { multiplier: 1, decayRate: profile.baseDecayPerDay, trained: false };
  return { multiplier: reaction.intensityMultiplier, decayRate: reaction.decayRate, trained: true };
}

// ===========================================================================
// 2) Ngôn ngữ — kho mẫu câu + nói theo tính cách
// ===========================================================================

/** Một mẫu câu trong kho ngôn ngữ. */
export interface PhraseTemplate {
  id: string;
  /** Ý định giao tiếp. */
  intent: 'greeting' | 'farewell' | 'threat' | 'trade' | 'grief' | 'joke' | 'flirt' | 'question' | 'story' | 'thanks';
  /** Template có slot: {name}, {target}, {item}, {place}, {emotion}. */
  template: string;
  /** Giọng phù hợp: ntuệ quán tính tính cách. */
  tone: 'warm' | 'cold' | 'formal' | 'playful' | 'dark';
  /** Mức trang trọng `[0, 1]`. */
  formality: number;
}

/** Tính giọng nói ưu tiên từ tính cách (Big Five 0–100). */
export function derivePreferredTone(personality: { extraversion?: number; agreeableness?: number; neuroticism?: number; conscientiousness?: number }): PhraseTemplate['tone'] {
  const e = clamp01((personality.extraversion ?? 50) / 100);
  const a = clamp01((personality.agreeableness ?? 50) / 100);
  const n = clamp01((personality.neuroticism ?? 50) / 100);
  if (n > 0.6) return 'dark';
  if (a > 0.65 && e > 0.5) return 'warm';
  if (e > 0.6) return 'playful';
  if ((personality.conscientiousness ?? 50) > 65) return 'formal';
  if (a < 0.35) return 'cold';
  return 'warm';
}

/** Kho ngôn ngữ của thế giới — agent học từ đây. */
export class LanguageEngine {
  public readonly phrases = new Map<string, PhraseTemplate>();
  public readonly voices = new Map<string, AgentVoice>();
  private counter = 0;

  /** Học mẫu câu mới (từ dataset `language`). */
  public learnPhrases(templates: ReadonlyArray<Omit<PhraseTemplate, 'id'>>): number {
    let added = 0;
    for (const template of templates) {
      const id = `phrase_${++this.counter}_${hashSeed(template.template).toString(16)}`;
      this.phrases.set(id, { ...template, id });
      added++;
    }
    return added;
  }

  /** Lấy/tạo giọng nói cho agent theo tính cách. */
  public voiceOf(entityId: string, personality: Parameters<typeof derivePreferredTone>[0]): AgentVoice {
    let voice = this.voices.get(entityId);
    if (!voice) {
      voice = { entityId, preferredTone: derivePreferredTone(personality), usedCounts: new Map() };
      this.voices.set(entityId, voice);
    }
    return voice;
  }

  /**
   * Nói một câu theo ý định: chọn mẫu khớp giọng ưu tiên (hoặc gần nhất),
   * ưa mẫu ít dùng (chống nhàm chán), KHÔNG lặp câu vừa nói, điền slot từ
   * context. Agent không có mẫu phù hợp → im lặng đáng tin cậy.
   */
  public speak(
    entityId: string,
    intent: PhraseTemplate['intent'],
    personality: Parameters<typeof derivePreferredTone>[0],
    context: Partial<Record<'name' | 'target' | 'item' | 'place' | 'emotion', string>> = {},
  ): { line: string | null; templateId: string | null } {
    const voice = this.voiceOf(entityId, personality);
    const candidates = [...this.phrases.values()].filter((p) => p.intent === intent);
    if (candidates.length === 0) return { line: null, templateId: null };

    // Chấm điểm: khớp tone +3, ít dùng +2, câu vừa nói -10.
    const scored = candidates.map((p) => {
      let score = 1 + this.random.next() * 0.5;
      if (p.tone === voice.preferredTone) score += 3;
      const used = voice.usedCounts.get(p.id) ?? 0;
      score += 2 / (1 + used);
      if (p.id === voice.lastTemplateId) score -= 10;
      return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0].p;

    let line = chosen.template;
    const slots: Record<string, string> = {
      name: context.name ?? voice.entityId,
      target: context.target ?? 'người kia',
      item: context.item ?? 'đồ vật',
      place: context.place ?? 'nơi đây',
      emotion: context.emotion ?? 'bình an',
    };
    for (const [slot, value] of Object.entries(slots)) {
      line = line.split(`{${slot}}`).join(value);
    }
    voice.usedCounts.set(chosen.id, (voice.usedCounts.get(chosen.id) ?? 0) + 1);
    voice.lastLine = line;
    voice.lastTemplateId = chosen.id;
    return { line, templateId: chosen.id };
  }

  private readonly random: DeepRandom = new DeepRandom('language-engine');
}

// Bổ sung trường lastTemplateId vào AgentVoice.
export interface AgentVoice {
  entityId: string;
  preferredTone: PhraseTemplate['tone'];
  usedCounts: Map<string, number>;
  lastLine?: string;
  lastTemplateId?: string;
}

// ===========================================================================
// 3) Tri thức — nạp fact dataset vào KnowledgeBase
// ===========================================================================

/** Mẫu tri thức từ dataset. */
export interface KnowledgeSampleInput {
  name: string;
  domain: string;
  description: string;
  complexity?: number;
  baseUtility?: number;
  era?: string;
}

/** Train tri thức: nạp fact vào KnowledgeBase — agent có cái để học/dạy ngay. */
export function trainKnowledge<KB extends { add(input: unknown): unknown }>(
  knowledgeBase: KB,
  samples: readonly KnowledgeSampleInput[],
  options: { discoveredBy?: string; year?: number } = {},
): { added: number; skipped: number; ids: string[] } {
  const ids: string[] = [];
  let added = 0;
  let skipped = 0;
  for (const sample of samples) {
    if (!sample.name || !sample.domain) {
      skipped++;
      continue;
    }
    const node = knowledgeBase.add({
      id: `trained_${hashSeed(`${sample.name}:${sample.domain}`).toString(16)}`,
      name: sample.name,
      domain: sample.domain as never,
      description: sample.description,
      complexity: clampRange(sample.complexity ?? 0.3, 0, 1),
      baseUtility: clamp01(sample.baseUtility ?? 0.5),
      era: (sample.era as never) ?? 'stone',
      discoveredYear: options.year ?? 0,
      discovererId: options.discoveredBy ?? 'training',
    } as never);
    ids.push((node as { id: string }).id);
    added++;
  }
  return { added, skipped, ids };
}

// ===========================================================================
// 4) Chống nhàm chán — NoveltyDirector
// ===========================================================================

/** Đo nhàm chán của một agent. */
export interface BoredomState {
  entityId: string;
  /** Điểm chán `[0, 1]` — tăng theo lặp lại hành vi giống nhau. */
  boredom: number;
  /** Lịch sử hành vi gần nhất. */
  recentActions: string[];
  /** Các ngành agent CHƯA thử (gợi ý từ đây ra). */
  untried: string[];
}

/** Kho gợi ý chống nhàm chán. */
export const NOVELTY_SUGGESTIONS: ReadonlyArray<{ kind: string; label: string; freshness: number }> = Object.freeze([
  { kind: 'discover', label: 'khám phá vùng đất chưa tên', freshness: 0.9 },
  { kind: 'invent', label: 'thí nghiệm sáng chế một vật mới', freshness: 0.85 },
  { kind: 'meet_stranger', label: 'làm quen một người lạ', freshness: 0.7 },
  { kind: 'learn_skill', label: 'học một nghề hoàn toàn mới', freshness: 0.8 },
  { kind: 'cook', label: 'nấu một món chưa từng nấu', freshness: 0.6 },
  { kind: 'travel', label: 'đi chợ ở làng bên', freshness: 0.65 },
  { kind: 'festival', label: 'tổ chức lễ hội', freshness: 0.75 },
  { kind: 'hunt', label: 'săn một con mồi lớn hơn mình', freshness: 0.8 },
]);

/** Director chống nhàm chán — đo lặp, gợi ý cái mới. */
export class NoveltyDirector {
  public readonly states = new Map<string, BoredomState>();
  /** Hệ số chán mỗi lần lặp hành vi đã làm gần đây. */
  public repetitionPenalty = 0.08;
  /** Hồi phục mỗi hành vi mới lạ. */
  noveltyRecovery = 0.12;

  stateOf(entityId: string): BoredomState {
    let state = this.states.get(entityId);
    if (!state) {
      state = { entityId, boredom: 0, recentActions: [], untried: NOVELTY_SUGGESTIONS.map((s) => s.kind) };
      this.states.set(entityId, state);
    }
    return state;
  }

  /** Agent làm một việc — lặp gần đây làm chán tăng, việc mới làm hồi phục. */
  public recordAction(entityId: string, action: string): { boredom: number; bored: boolean } {
    const state = this.stateOf(entityId);
    const repeated = state.recentActions.filter((a) => a === action).length;
    state.boredom = clamp01(state.boredom + repeated * this.repetitionPenalty - this.noveltyRecovery * 0.3);
    state.recentActions.push(action);
    if (state.recentActions.length > 12) state.recentActions.shift();
    // Cập nhật untried.
    state.untried = NOVELTY_SUGGESTIONS.map((s) => s.kind).filter((kind) => !state.recentActions.includes(kind));
    return { boredom: Math.round(state.boredom * 100) / 100, bored: state.boredom > 0.6 };
  }

  /** Gợi ý việc mới lạ nhất — ưu tiên agent chưa từng làm. */
  public suggest(entityId: string): { kind: string; label: string; freshness: number } | null {
    const state = this.stateOf(entityId);
    if (state.untried.length === 0) {
      // Đã thử hết — gợi ý cái freshness cao nhất.
      return [...NOVELTY_SUGGESTIONS].sort((a, b) => b.freshness - a.freshness)[0];
    }
    const kind = state.untried[hashSeed(`${entityId}:${state.recentActions.length}`) % state.untried.length];
    return NOVELTY_SUGGESTIONS.find((s) => s.kind === kind) ?? null;
  }

  /** Game dùng gợi ý này → ghi nhận đã thử. */
  public markTried(entityId: string, kind: string): void {
    const state = this.stateOf(entityId);
    state.untried = state.untried.filter((k) => k !== kind);
    state.recentActions.push(kind);
    state.boredom = clamp01(state.boredom - this.noveltyRecovery);
  }

  public stats(): { agents: number; avgBoredom: number; boredAgents: number } {
    let sum = 0;
    let bored = 0;
    for (const state of this.states.values()) {
      sum += state.boredom;
      if (state.boredom > 0.6) bored++;
    }
    return { agents: this.states.size, avgBoredom: this.states.size > 0 ? sum / this.states.size : 0, boredAgents: bored };
  }
}
