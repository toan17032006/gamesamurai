/**
 * @file emotions.ts
 * @module @aetheria/engine/psychology/emotions
 * @description Phổ cảm xúc đa tầng theo lý thuyết đánh giá (appraisal): vui,
 * sợ, giận, buồn, tự hào, xấu hổ, tội lỗi, biết ơn, ghen tuông, đố kỵ, thất
 * tình, hưng phấn sáng chế (eureka), khát máu, hoài niệm và bản năng che chở
 * mẫu tử. Có mood, stress, điều tiết, lây lan và mô tả cảm xúc.
 */

import { clamp01, clampRange } from '../deeplearning/random.js';
import { LifeRandom } from '../life/stochastic.js';

/** Tên cảm xúc được mô phỏng. */
export type EmotionName =
  | 'joy'
  | 'contentment'
  | 'excitement'
  | 'surprise'
  | 'fear'
  | 'anxiety'
  | 'anger'
  | 'irritation'
  | 'sadness'
  | 'grief'
  | 'disgust'
  | 'contempt'
  | 'trust'
  | 'affection'
  | 'love'
  | 'compassion'
  | 'pride'
  | 'shame'
  | 'guilt'
  | 'remorse'
  | 'gratitude'
  | 'curiosity'
  | 'envy'
  | 'jealousy'
  | 'romanticJealousy'
  | 'heartbreak'
  | 'nostalgia'
  | 'bloodlust'
  | 'eureka'
  | 'maternalHeroism'
  | 'anticipation'
  | 'calm';

/** Vector cường độ cảm xúc `0..1`. */
export type EmotionVector = Partial<Record<EmotionName, number>>;

/** Tính cách cảm xúc (Big Five + vài trục bổ sung). */
export interface EmotionalPersonality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  empathy: number;
  aggression: number;
  resilience: number;
}

/** Đánh giá một sự kiện theo các chiều appraisal. */
export interface AppraisalEvent {
  /** Mức phù hợp mục tiêu `[-1, 1]`. */
  goalCongruence?: number;
  relevance?: number;
  novelty?: number;
  certainty?: number;
  agency?: 'self' | 'other' | 'circumstance';
  control?: number;
  /** Mức phù hợp chuẩn mực xã hội `[-1, 1]`. */
  normCompatibility?: number;
  /** So sánh xã hội: âm = người khác hơn mình. */
  socialComparison?: number;
  threat?: number;
  loss?: number;
  rescue?: number;
  discovery?: number;
  /** Kẻ tình địch hiện diện. */
  rivalPresence?: number;
  /** Nguy hiểm cho con. */
  childThreat?: number;
  /** Cơ hội gây hại/kết liễu. */
  killOpportunity?: number;
  /** Ký ức cũ (năm) — dùng cho hoài niệm. */
  memoryAge?: number;
  /** Thành tựu lao động. */
  effort?: number;
  success?: number;
  failure?: number;
  /** Bất công. */
  injustice?: number;
  cause?: string;
}

/** Ảnh chụp cảm xúc của một cá thể. */
export interface EmotionSnapshot {
  entityId: string;
  dominant: EmotionName;
  intensity: number;
  valence: number;
  arousal: number;
  dominance: number;
  mood: number;
  stress: number;
  active: EmotionVector;
  cause: string;
  thought: string;
}

/** Trạng thái nội bộ. */
interface EntityEmotionState {
  active: Map<EmotionName, number>;
  mood: number;
  stress: number;
  personality: EmotionalPersonality;
  lastCause: string;
  history: Array<{ emotion: EmotionName; intensity: number; cause: string; timestamp: number }>;
}

/** Tính cách mặc định. */
export const DEFAULT_EMOTIONAL_PERSONALITY: EmotionalPersonality = Object.freeze({
  openness: 0.6,
  conscientiousness: 0.55,
  extraversion: 0.5,
  agreeableness: 0.6,
  neuroticism: 0.4,
  empathy: 0.65,
  aggression: 0.35,
  resilience: 0.5,
});

/** Giá trị cảm xúc (valence) mặc định. */
export const EMOTION_VALENCE: Readonly<Record<EmotionName, number>> = Object.freeze({
  joy: 0.9,
  contentment: 0.7,
  excitement: 0.8,
  surprise: 0.1,
  fear: -0.7,
  anxiety: -0.5,
  anger: -0.6,
  irritation: -0.3,
  sadness: -0.7,
  grief: -0.95,
  disgust: -0.8,
  contempt: -0.6,
  trust: 0.7,
  affection: 0.8,
  love: 0.95,
  compassion: 0.6,
  pride: 0.8,
  shame: -0.7,
  guilt: -0.8,
  remorse: -0.85,
  gratitude: 0.85,
  curiosity: 0.4,
  envy: -0.5,
  jealousy: -0.6,
  romanticJealousy: -0.8,
  heartbreak: -0.95,
  nostalgia: 0.2,
  bloodlust: -0.5,
  eureka: 0.95,
  maternalHeroism: 0.4,
  anticipation: 0.3,
  calm: 0.5,
});

/** Độ kích thích (arousal) mặc định. */
export const EMOTION_AROUSAL: Readonly<Record<EmotionName, number>> = Object.freeze({
  joy: 0.7,
  contentment: 0.2,
  excitement: 0.9,
  surprise: 0.8,
  fear: 0.9,
  anxiety: 0.7,
  anger: 0.85,
  irritation: 0.5,
  sadness: 0.3,
  grief: 0.6,
  disgust: 0.5,
  contempt: 0.3,
  trust: 0.3,
  affection: 0.4,
  love: 0.6,
  compassion: 0.4,
  pride: 0.65,
  shame: 0.55,
  guilt: 0.6,
  remorse: 0.7,
  gratitude: 0.5,
  curiosity: 0.6,
  envy: 0.55,
  jealousy: 0.7,
  romanticJealousy: 0.9,
  heartbreak: 0.7,
  nostalgia: 0.25,
  bloodlust: 0.95,
  eureka: 0.95,
  maternalHeroism: 0.95,
  anticipation: 0.5,
  calm: 0.1,
});

/** Engine cảm xúc cho nhiều cá thể. */
export class EmotionEngine {
  public readonly states = new Map<string, EntityEmotionState>();
  private readonly random: LifeRandom;

  constructor(seed: number | string = 'emotions') {
    this.random = new LifeRandom(seed);
  }

  /** Tạo trạng thái cảm xúc cho cá thể. */
  public create(entityId: string, personality: Partial<EmotionalPersonality> = {}): EntityEmotionState {
    const state: EntityEmotionState = {
      active: new Map<EmotionName, number>([['calm', 0.4]]),
      mood: 0.1,
      stress: 0,
      personality: { ...DEFAULT_EMOTIONAL_PERSONALITY, ...personality },
      lastCause: 'khởi tạo',
      history: [],
    };
    this.states.set(entityId, state);
    return state;
  }

  /** Đảm bảo có trạng thái. */
  public ensure(entityId: string): EntityEmotionState {
    return this.states.get(entityId) ?? this.create(entityId);
  }

  /** Kích hoạt một cảm xúc cụ thể. */
  public trigger(entityId: string, emotion: EmotionName, intensity = 0.5, cause = 'sự kiện'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const value = clamp01(intensity * (0.8 + state.personality.neuroticism * 0.4));
    const previous = state.active.get(emotion) ?? 0;
    state.active.set(emotion, clamp01(previous + value * (1 - previous)));
    state.lastCause = cause;
    state.stress = clampRange(state.stress + (EMOTION_VALENCE[emotion] < 0 ? value * 8 : -value * 3), 0, 100);
    state.mood = clampRange(state.mood + EMOTION_VALENCE[emotion] * value * 0.1, -1, 1);
    state.history.push({ emotion, intensity: value, cause, timestamp: Date.now() });
    if (state.history.length > 100) state.history.shift();
    return this.snapshot(entityId, cause);
  }

  /**
   * Đánh giá sự kiện theo appraisal và sinh đồng thời nhiều cảm xúc.
   * Đây là trái tim của mô hình: cùng một sự kiện có thể tạo tự hào và lo âu.
   */
  public appraise(entityId: string, event: AppraisalEvent): EmotionSnapshot {
    const state = this.ensure(entityId);
    const relevance = clamp01(event.relevance ?? 0.6);
    const congruence = clampRange(event.goalCongruence ?? 0, -1, 1);
    const novelty = clamp01(event.novelty ?? 0);
    const threat = clamp01(event.threat ?? 0);
    const loss = clamp01(event.loss ?? 0);
    const rescue = clamp01(event.rescue ?? 0);
    const discovery = clamp01(event.discovery ?? 0);
    const norm = clampRange(event.normCompatibility ?? 0, -1, 1);
    const comparison = clampRange(event.socialComparison ?? 0, -1, 1);
    const rival = clamp01(event.rivalPresence ?? 0);
    const childThreat = clamp01(event.childThreat ?? 0);
    const kill = clamp01(event.killOpportunity ?? 0);
    const memoryAge = Math.max(0, event.memoryAge ?? 0);
    const success = clamp01(event.success ?? 0);
    const failure = clamp01(event.failure ?? 0);
    const injustice = clamp01(event.injustice ?? 0);
    const agency = event.agency ?? 'circumstance';
    const cause = event.cause ?? 'đánh giá tình huống';

    const add = (emotion: EmotionName, intensity: number): void => {
      const value = clamp01(intensity);
      if (value <= 0.02) return;
      const previous = state.active.get(emotion) ?? 0;
      // Cảm xúc mới chồng lấn thay vì thay thế hoàn toàn.
      state.active.set(emotion, clamp01(previous + value * (1 - previous) * relevance));
    };

    if (congruence > 0.2) {
      add('joy', congruence * relevance);
      if (congruence > 0.6) add('contentment', congruence * 0.6);
      if (novelty > 0.5) add('surprise', novelty * 0.7);
      if (discovery > 0.4) add('eureka', discovery * relevance);
      if (success > 0.3) add('pride', success * relevance);
    }
    if (congruence < -0.2) {
      add('sadness', -congruence * relevance);
      if (loss > 0.6) add('grief', loss * relevance);
    }
    if (threat > 0.2) {
      add('fear', threat * relevance);
      if (threat > 0.6) add('anxiety', threat * 0.8);
    }
    if (childThreat > 0.3) {
      add('maternalHeroism', childThreat * (0.5 + state.personality.empathy * 0.5));
      add('fear', childThreat * 0.6);
    }
    if (rescue > 0.3) add('gratitude', rescue * relevance);
    if (discovery > 0.3) {
      add('curiosity', discovery * 0.7);
      if (discovery > 0.7) add('eureka', discovery);
    }
    if (comparison < -0.3) {
      add(event.rivalPresence && event.rivalPresence > 0 ? 'romanticJealousy' : 'envy', -comparison * relevance);
    }
    if (rival > 0.3) add('romanticJealousy', rival * 0.8);
    if (memoryAge > 5 && loss > 0.2) add('nostalgia', clamp01(memoryAge / 40) * 0.7);
    if (kill > 0.4 && (state.personality.aggression > 0.4 || injustice > 0.5)) {
      add('bloodlust', kill * (0.4 + state.personality.aggression * 0.6));
    }
    if (agency === 'other' && congruence < -0.2 && norm < -0.2) {
      add('anger', (-congruence + -norm) * 0.6);
      add('contempt', -norm * 0.4);
    }
    if (agency === 'self' && norm < -0.2) {
      add('guilt', -norm * relevance);
      if (norm < -0.6) add('remorse', -norm * 0.8);
      add('shame', -norm * 0.5);
    }
    if (failure > 0.3) {
      add('shame', failure * 0.7);
      add('sadness', failure * 0.5);
    }
    if (injustice > 0.3 && agency !== 'self') add('anger', injustice * 0.6);

    state.lastCause = cause;
    state.stress = clampRange(
      state.stress + (threat + loss + failure + injustice) * 10 - (rescue + success + discovery) * 5,
      0,
      100,
    );
    state.mood = clampRange(
      state.mood + (congruence * 0.1 + rescue * 0.08 + success * 0.05 - loss * 0.1 - threat * 0.08),
      -1,
      1,
    );
    state.history.push({
      emotion: this.dominantOf(state).emotion,
      intensity: this.dominantOf(state).intensity,
      cause,
      timestamp: Date.now(),
    });
    if (state.history.length > 100) state.history.shift();
    return this.snapshot(entityId, cause);
  }

  /** Suy giảm cảm xúc theo thời gian (ngày). */
  public decay(entityId: string, days = 1): EmotionSnapshot {
    const state = this.ensure(entityId);
    const factor = Math.exp(-Math.max(0, days) / 4);
    for (const [emotion, intensity] of state.active) {
      const next = intensity * factor;
      if (next < 0.02) state.active.delete(emotion);
      else state.active.set(emotion, next);
    }
    if (state.active.size === 0) state.active.set('calm', 0.3);
    state.stress = clampRange(state.stress * Math.exp(-Math.max(0, days) / 10), 0, 100);
    state.mood *= Math.exp(-Math.max(0, days) / 20);
    return this.snapshot(entityId, 'thời gian trôi');
  }

  /** Cảm xúc mạnh nhất. */
  public dominantOf(state: EntityEmotionState): { emotion: EmotionName; intensity: number } {
    let best: EmotionName = 'calm';
    let intensity = 0;
    for (const [emotion, value] of state.active) {
      if (value > intensity) {
        best = emotion;
        intensity = value;
      }
    }
    return { emotion: best, intensity };
  }

  /** Cảm xúc mạnh nhất của cá thể. */
  public dominant(entityId: string): { emotion: EmotionName; intensity: number } {
    return this.dominantOf(this.ensure(entityId));
  }

  /** Ảnh chụp hiện tại. */
  public snapshot(entityId: string, cause = 'trạng thái'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const dominant = this.dominantOf(state);
    const active: EmotionVector = {};
    let valence = 0;
    let arousal = 0;
    let dominance = 0;
    let total = 0;
    for (const [emotion, intensity] of state.active) {
      active[emotion] = intensity;
      valence += EMOTION_VALENCE[emotion] * intensity;
      arousal += EMOTION_AROUSAL[emotion] * intensity;
      dominance += (EMOTION_VALENCE[emotion] >= 0 ? 0.6 : 0.4) * intensity;
      total += intensity;
    }
    if (total > 0) {
      valence /= total;
      arousal /= total;
      dominance /= total;
    }
    return {
      entityId,
      dominant: dominant.emotion,
      intensity: dominant.intensity,
      valence,
      arousal,
      dominance,
      mood: state.mood,
      stress: state.stress,
      active,
      cause,
      thought: this.describe(entityId),
    };
  }

  /** Điều tiết cảm xúc: ức chế hoặc đánh giá lại. */
  public regulate(entityId: string, strategy: 'suppress' | 'reappraise' | 'vent' | 'seek_support', amount = 0.3): EmotionSnapshot {
    const state = this.ensure(entityId);
    const factor = clamp01(amount);
    for (const [emotion, intensity] of state.active) {
      if (EMOTION_VALENCE[emotion] >= 0) continue;
      if (strategy === 'suppress' || strategy === 'reappraise') {
        state.active.set(emotion, clamp01(intensity * (1 - factor)));
      } else if (strategy === 'vent') {
        state.active.set(emotion, clamp01(intensity + factor * 0.1));
        state.stress = clampRange(state.stress - factor * 10, 0, 100);
      } else {
        state.active.set(emotion, clamp01(intensity * (1 - factor * 0.7)));
        state.stress = clampRange(state.stress - factor * 8, 0, 100);
      }
    }
    return this.snapshot(entityId, `điều tiết: ${strategy}`);
  }

  /** Lây lan cảm xúc sang người khác (emotional contagion). */
  public contagion(sourceId: string, targetId: string, susceptibility = 0.3): EmotionSnapshot {
    const source = this.ensure(sourceId);
    const target = this.ensure(targetId);
    for (const [emotion, intensity] of source.active) {
      const current = target.active.get(emotion) ?? 0;
      target.active.set(emotion, clamp01(current + intensity * clamp01(susceptibility)));
    }
    return this.snapshot(targetId, `lây từ ${sourceId}`);
  }

  /** Đồng cảm: phản ứng với cảm xúc của người khác. */
  public empathize(entityId: string, otherId: string, amount = 0.4): EmotionSnapshot {
    const other = this.ensure(otherId);
    const dominant = this.dominantOf(other);
    const emotion: EmotionName =
      dominant.emotion === 'sadness' || dominant.emotion === 'grief'
        ? 'compassion'
        : dominant.emotion === 'fear'
          ? 'compassion'
          : 'affection';
    return this.trigger(entityId, emotion, dominant.intensity * clamp01(amount), `đồng cảm với ${otherId}`);
  }

  /** Mô tả bằng tiếng Việt. */
  public describe(entityId: string): string {
    const state = this.ensure(entityId);
    const dominant = this.dominantOf(state);
    const labels: Record<EmotionName, string> = {
      joy: 'vui sướng',
      contentment: 'mãn nguyện',
      excitement: 'hứng khởi',
      surprise: 'ngạc nhiên',
      fear: 'sợ hãi',
      anxiety: 'lo âu',
      anger: 'giận dữ',
      irritation: 'bực bội',
      sadness: 'buồn bã',
      grief: 'đau thương',
      disgust: 'ghê tởm',
      contempt: 'khinh bỉ',
      trust: 'tin tưởng',
      affection: 'trìu mến',
      love: 'yêu thương',
      compassion: 'thương cảm',
      pride: 'tự hào',
      shame: 'xấu hổ',
      guilt: 'tội lỗi',
      remorse: 'ăn năn',
      gratitude: 'biết ơn',
      curiosity: 'tò mò',
      envy: 'đố kỵ',
      jealousy: 'ghen',
      romanticJealousy: 'ghen tuông đôi lứa',
      heartbreak: 'tan vỡ tình cảm',
      nostalgia: 'hoài niệm',
      bloodlust: 'khát máu',
      eureka: 'bừng sáng sáng chế',
      maternalHeroism: 'bản năng che chở mẫu tử',
      anticipation: 'háo hức',
      calm: 'bình thản',
    };
    const mood = state.mood > 0.3 ? 'tâm trạng tích cực' : state.mood < -0.3 ? 'tâm trạng tiêu cực' : 'tâm trạng trung tính';
    return `Đang ${labels[dominant.emotion]} (${Math.round(dominant.intensity * 100)}%), ${mood}, căng thẳng ${state.stress.toFixed(0)}/100.`;
  }

  // ==========================================================================
  // Cảm xúc chuyên biệt do người dùng yêu cầu
  // ==========================================================================

  /** Hưng phấn sáng chế (Eureka). */
  public eureka(entityId: string, novelty = 0.8, importance = 0.8, cause = 'phát minh mới'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const intensity = clamp01(novelty * importance * (0.6 + state.personality.openness * 0.6));
    return this.trigger(entityId, 'eureka', intensity, cause);
  }

  /** Ghen tuông đôi lứa. */
  public romanticJealousy(
    entityId: string,
    rivalThreat = 0.7,
    attachment = 0.8,
    cause = 'đối thủ tình cảm',
  ): EmotionSnapshot {
    const state = this.ensure(entityId);
    const intensity = clamp01(rivalThreat * attachment * (0.7 + state.personality.neuroticism * 0.5));
    this.trigger(entityId, 'jealousy', intensity * 0.6, cause);
    return this.trigger(entityId, 'romanticJealousy', intensity, cause);
  }

  /** Đố kỵ nghề nghiệp. */
  public envy(
    entityId: string,
    otherAchievement = 0.8,
    selfAchievement = 0.3,
    domain = 'nghề nghiệp',
  ): EmotionSnapshot {
    const gap = clamp01(otherAchievement - selfAchievement);
    const state = this.ensure(entityId);
    const intensity = clamp01(gap * (0.7 + state.personality.extraversion * 0.3));
    return this.trigger(entityId, 'envy', intensity, `đố kỵ ${domain}`);
  }

  /** Tội lỗi ăn năn. */
  public guilt(entityId: string, harm = 0.7, responsibility = 0.8, cause = 'gây hại cho người khác'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const intensity = clamp01(harm * responsibility * (0.6 + state.personality.agreeableness * 0.6));
    this.trigger(entityId, 'guilt', intensity * 0.8, cause);
    return this.trigger(entityId, 'remorse', intensity, cause);
  }

  /** Bi kịch thất tình. */
  public heartbreak(entityId: string, attachment = 0.8, loss = 0.9, cause = 'chia tay'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const intensity = clamp01(attachment * loss * (0.7 + state.personality.neuroticism * 0.5));
    this.trigger(entityId, 'grief', intensity * 0.8, cause);
    return this.trigger(entityId, 'heartbreak', intensity, cause);
  }

  /** Lòng biết ơn cứu mạng. */
  public gratitude(entityId: string, rescueSeverity = 0.8, closeness = 0.6, cause = 'được cứu'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const intensity = clamp01(rescueSeverity * closeness * (0.7 + state.personality.agreeableness * 0.5));
    return this.trigger(entityId, 'gratitude', intensity, cause);
  }

  /** Bản năng che chở mẫu tử liều chết. */
  public maternalHeroism(entityId: string, childThreat = 0.9, bond = 0.9, cause = 'con gặp nguy hiểm'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const intensity = clamp01(childThreat * bond * (0.8 + state.personality.empathy * 0.6));
    return this.trigger(entityId, 'maternalHeroism', intensity, cause);
  }

  /** Khát máu bầy đàn. */
  public bloodlust(entityId: string, crowdArousal = 0.8, targetVulnerability = 0.7, cause = 'bầy đàn kích động'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const intensity = clamp01(crowdArousal * targetVulnerability * (0.5 + state.personality.aggression * 0.7));
    return this.trigger(entityId, 'bloodlust', intensity, cause);
  }

  /** Hoài niệm tuổi già. */
  public nostalgia(entityId: string, memoryAgeYears = 30, emotionalWeight = 0.7, cause = 'ký ức xưa'): EmotionSnapshot {
    const state = this.ensure(entityId);
    const ageFactor = clamp01(memoryAgeYears / 50);
    const intensity = clamp01(ageFactor * emotionalWeight * (0.5 + state.personality.openness * 0.5));
    return this.trigger(entityId, 'nostalgia', intensity, cause);
  }
}

/** Tạo nhanh engine cảm xúc. */
export function createEmotionEngine(seed: number | string = 'emotions'): EmotionEngine {
  return new EmotionEngine(seed);
}
