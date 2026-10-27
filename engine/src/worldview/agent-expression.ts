/**
 * @file agent-expression.ts
 * @module @aetheria/engine/worldview/agent-expression
 * @description Lớp BIỂU ĐẠT của agent: từ trạng thái nội tâm (cảm xúc + cường
 * độ + tính cách) sinh ra gói biểu đạt ĐỒNG BỘ qua 5 kênh — **ngôn ngữ** (câu
 * nói qua LanguageEngine), **cử chỉ** (animation cho renderer), **nét mặt**
 * (mắt/mày/miệng/nước mắt), **tư thế**, **giọng nói** — tính cách điều tiết
 * cường độ (hướng nội kiềm chế, hướng ngoại khuếch đại, hay lo run rẩy).
 * Generic `expressAgent<T>` mở rộng được; `applyExpressionToAgentState` nối
 * trực tiếp vào renderAgent để hình hiển thị đúng cảm xúc đang diễn.
 */

import { clamp01, clampRange } from '../deeplearning/random.js';
import type { AgentRenderState } from './types.js';
import type { LanguageEngine, PhraseTemplate } from '../training/agent-mind.js';

// ===========================================================================
// Kiểu biểu đạt
// ===========================================================================

export type ExpressionChannel = 'speech' | 'gesture' | 'facial' | 'posture' | 'voice';

export type GestureAnimation =
  | 'jump' | 'tremble' | 'crouch' | 'point' | 'wave' | 'shake_fist'
  | 'cry' | 'laugh' | 'bow' | 'clap' | 'stance' | 'none';

export interface ExpressionGesture {
  name: string;
  animation: GestureAnimation;
  intensity: number;
  durationMs: number;
}

export interface FacialExpression {
  emotion: string;
  /** Mày: -1 cau lại .. 1 nhướn lên. */
  eyebrow: number;
  /** Miệng: -1 mếu .. 1 cười. */
  mouth: number;
  eyes: 'wide' | 'narrow' | 'closed' | 'normal';
  tears?: boolean;
  blush?: boolean;
}

export type PostureKind = 'upright' | 'slouched' | 'defensive' | 'aggressive' | 'hunched';
export type VoiceTone = 'cheerful' | 'shaky' | 'growl' | 'calm' | 'weeping' | 'whisper';

export interface ExpressionOutput {
  entityId: string;
  /** Tóm tắt tiếng Việt cho log/UI. */
  channelSummary: string;
  /** Câu nói — null nếu agent im lặng (không có mẫu ngôn ngữ hoặc introvert cực đoan). */
  speech: { line: string; intent: PhraseTemplate['intent']; tone: PhraseTemplate['tone'] } | null;
  gesture: ExpressionGesture;
  facial: FacialExpression;
  posture: PostureKind;
  voiceTone: VoiceTone;
  /** Cường độ biểu đạt sau khi tính cách điều tiết `[0, 1]`. */
  intensity: number;
}

/** Đầu vào biểu đạt. */
export interface ExpressionIntentInput {
  entityId: string;
  /** Tên cảm xúc (EmotionName). */
  emotion: string;
  /** Cường độ nội tâm `[0, 1]`. */
  intensity: number;
  /** Ý định ngôn ngữ (nếu muốn nói). */
  intent?: PhraseTemplate['intent'];
  /** Tính cách Big Five 0–100 — điều tiết cách biểu đạt. */
  personality: {
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
    conscientiousness?: number;
  };
  /** Bối cảnh cho câu nói (target/item/place…). */
  context?: Partial<Record<'name' | 'target' | 'item' | 'place' | 'emotion', string>>;
}

/** Bản đồ cảm xúc → biểu đạt cơ thể. */
export interface EmotionExpressionMapping {
  gesture: Omit<ExpressionGesture, 'intensity'>;
  facial: Omit<FacialExpression, 'emotion'>;
  posture: PostureKind;
  voiceTone: VoiceTone;
  /** Ý định ngôn ngữ mặc định nếu caller không chỉ định. */
  defaultIntent: PhraseTemplate['intent'];
}

/** Bản đồ biểu đạt cho các cảm xúc chính của engine. */
export const EMOTION_EXPRESSION_MAP: Readonly<Record<string, EmotionExpressionMapping>> = Object.freeze({
  joy: {
    gesture: { name: 'nhảy cưng chiều', animation: 'jump', durationMs: 1200 },
    facial: { eyebrow: 0.8, mouth: 0.9, eyes: 'normal', blush: true },
    posture: 'upright',
    voiceTone: 'cheerful',
    defaultIntent: 'joke',
  },
  sadness: {
    gesture: { name: 'ôm mặt lặng lẽ', animation: 'cry', durationMs: 3000 },
    facial: { eyebrow: -0.6, mouth: -0.7, eyes: 'closed', tears: true },
    posture: 'slouched',
    voiceTone: 'weeping',
    defaultIntent: 'grief',
  },
  anger: {
    gesture: { name: 'vung nắm đấm', animation: 'shake_fist', durationMs: 900 },
    facial: { eyebrow: -0.9, mouth: -0.8, eyes: 'narrow' },
    posture: 'aggressive',
    voiceTone: 'growl',
    defaultIntent: 'threat',
  },
  fear: {
    gesture: { name: 'run rẩy lùi lại', animation: 'tremble', durationMs: 2000 },
    facial: { eyebrow: 0.9, mouth: -0.4, eyes: 'wide' },
    posture: 'defensive',
    voiceTone: 'shaky',
    defaultIntent: 'question',
  },
  love: {
    gesture: { name: 'ép tay âu yếm', animation: 'clap', durationMs: 1500 },
    facial: { eyebrow: 0.4, mouth: 0.6, eyes: 'narrow', blush: true },
    posture: 'upright',
    voiceTone: 'calm',
    defaultIntent: 'flirt',
  },
  grief: {
    gesture: { name: 'quỳ sụp ôm đầu', animation: 'crouch', durationMs: 4000 },
    facial: { eyebrow: -0.8, mouth: -0.9, eyes: 'closed', tears: true },
    posture: 'hunched',
    voiceTone: 'weeping',
    defaultIntent: 'grief',
  },
  pride: {
    gesture: { name: 'ngực ưỡn cao', animation: 'stance', durationMs: 1500 },
    facial: { eyebrow: 0.5, mouth: 0.5, eyes: 'normal' },
    posture: 'upright',
    voiceTone: 'calm',
    defaultIntent: 'story',
  },
  shame: {
    gesture: { name: 'cúi đầu né tránh', animation: 'bow', durationMs: 2000 },
    facial: { eyebrow: -0.4, mouth: -0.5, eyes: 'closed', blush: true },
    posture: 'hunched',
    voiceTone: 'whisper',
    defaultIntent: 'thanks',
  },
  eureka: {
    gesture: { name: 'giơ tay "AHA!"', animation: 'point', durationMs: 800 },
    facial: { eyebrow: 1, mouth: 0.9, eyes: 'wide' },
    posture: 'upright',
    voiceTone: 'cheerful',
    defaultIntent: 'story',
  },
  curiosity: {
    gesture: { name: 'chống cằm quan sát', animation: 'point', durationMs: 1800 },
    facial: { eyebrow: 0.6, mouth: 0.1, eyes: 'wide' },
    posture: 'upright',
    voiceTone: 'calm',
    defaultIntent: 'question',
  },
  bloodlust: {
    gesture: { name: 'nghiến răng vung vẩy', animation: 'shake_fist', durationMs: 700 },
    facial: { eyebrow: -0.8, mouth: 0.2, eyes: 'narrow' },
    posture: 'aggressive',
    voiceTone: 'growl',
    defaultIntent: 'threat',
  },
  gratitude: {
    gesture: { name: 'chắp tay cúi đầu', animation: 'bow', durationMs: 1800 },
    facial: { eyebrow: 0.3, mouth: 0.6, eyes: 'normal' },
    posture: 'upright',
    voiceTone: 'calm',
    defaultIntent: 'thanks',
  },
  jealousy: {
    gesture: { name: 'vá tay nhìn trộm', animation: 'crouch', durationMs: 2500 },
    facial: { eyebrow: -0.5, mouth: -0.3, eyes: 'narrow' },
    posture: 'defensive',
    voiceTone: 'whisper',
    defaultIntent: 'question',
  },
});

/** Cảm xúc không có trong bản đồ → mapping trung tính. */
const NEUTRAL_MAPPING: EmotionExpressionMapping = {
  gesture: { name: 'đứng yên quan sát', animation: 'none', durationMs: 1000 },
  facial: { eyebrow: 0, mouth: 0, eyes: 'normal' },
  posture: 'upright',
  voiceTone: 'calm',
  defaultIntent: 'question',
};

/** Tính cách → hệ số khuếch đại/kiềm chế biểu đạt. */
export function personalityExpressionModulation(personality: ExpressionIntentInput['personality']): {
  intensityFactor: number;
  trembles: boolean;
  suppressesSpeech: boolean;
  softensGestures: boolean;
  note: string;
} {
  const e = clamp01((personality.extraversion ?? 50) / 100);
  const n = clamp01((personality.neuroticism ?? 50) / 100);
  const a = clamp01((personality.agreeableness ?? 50) / 100);
  // Hướng nội kiềm chế (×0.6), hướng ngoại khuếch đại (×1.3), hay lo thêm run rẩy.
  const intensityFactor = clampRange(0.6 + e * 0.7, 0.3, 1.4);
  return {
    intensityFactor: Math.round(intensityFactor * 100) / 100,
    trembles: n > 0.65,
    suppressesSpeech: e < 0.12,
    softensGestures: a > 0.75,
    note: `hướng nội/ngoại ×${intensityFactor.toFixed(2)}${n > 0.65 ? ', run rẩy nhẹ' : ''}${e < 0.12 ? ', im lặng thay lời' : ''}${a > 0.75 ? ', mềm mỏng cử chỉ' : ''}`,
  };
}

/**
 * Biểu đạt generic: internal state → gói biểu đạt 5 kênh đồng bộ.
 * Cường độ × tính cách; speech qua LanguageEngine nếu có kho câu và agent
 * không quá hướng nội; gesture/facial từ bản đồ cảm xúc.
 */
export function expressAgent<T extends ExpressionIntentInput>(
  input: T,
  options: { language?: LanguageEngine; worldTime?: number } = {},
): ExpressionOutput {
  const mapping = EMOTION_EXPRESSION_MAP[input.emotion] ?? NEUTRAL_MAPPING;
  const modulation = personalityExpressionModulation(input.personality);
  const intensity = clamp01(input.intensity * modulation.intensityFactor);
  const gestureDuration = Math.round(mapping.gesture.durationMs * (0.7 + intensity * 0.6));

  // Cử chỉ: hay lo thêm run; dễ thương làm mềm gesture hung dữ.
  let animation = mapping.gesture.animation;
  let gestureName = mapping.gesture.name;
  if (modulation.trembles && input.intensity > 0.4 && mapping.gesture.animation !== 'tremble') {
    animation = 'tremble';
    gestureName += ' (kèm run rẩy)';
  }
  if (modulation.softensGestures && (mapping.gesture.animation === 'shake_fist' || mapping.posture === 'aggressive')) {
    animation = 'crouch';
    gestureName = gestureName.replace('vung nắm đấm', 'nén giận lặng lẽ');
  }

  // Ngôn ngữ: chỉ nói khi có kho câu, có intent, và không quá hướng nội.
  let speech: ExpressionOutput['speech'] = null;
  const wantSpeech = input.intent ?? (intensity > 0.25 ? mapping.defaultIntent : null);
  if (options.language && wantSpeech && !modulation.suppressesSpeech) {
    const result = options.language.speak(input.entityId, wantSpeech, input.personality, {
      ...input.context,
      emotion: input.emotion,
    });
    if (result.line) {
      speech = { line: result.line, intent: wantSpeech, tone: mapping.voiceTone as PhraseTemplate['tone'] };
    }
  }

  const facial: FacialExpression = { emotion: input.emotion, ...mapping.facial };
  // Cường độ cao → mắt biểu cảm mạnh hơn.
  if (intensity > 0.75) {
    facial.eyes = facial.eyes === 'normal' ? 'wide' : facial.eyes;
  }

  const channelParts = [
    speech ? `nói "${speech.line}"` : 'im lặng',
    `cử chỉ ${gestureName} (${animation})`,
    `nét mặt ${facial.emotion} (mắt ${facial.eyes})`,
    `tư thế ${mapping.posture}`,
    `giọng ${mapping.voiceTone}`,
  ];

  return {
    entityId: input.entityId,
    channelSummary: channelParts.join(' · '),
    speech,
    gesture: {
      name: gestureName,
      animation,
      intensity: Math.round(intensity * 100) / 100,
      durationMs: gestureDuration,
    },
    facial,
    posture: mapping.posture,
    voiceTone: mapping.voiceTone,
    intensity: Math.round(intensity * 100) / 100,
  };
}

/** Nối gói biểu đạt vào AgentRenderState — renderer hiển thị đúng cảm xúc đang diễn. */
export function applyExpressionToAgentState(
  state: AgentRenderState,
  expression: ExpressionOutput,
): AgentRenderState {
  const animationToAction: Partial<Record<GestureAnimation, AgentRenderState['action']>> = {
    cry: 'cry',
    laugh: 'laugh',
    jump: 'cheer',
    clap: 'celebrate',
    tremble: 'tremble',
    bow: 'bow',
    point: 'point',
    stance: 'celebrate',
    shake_fist: 'fight',
    crouch: 'idle',
    wave: 'idle',
    none: 'idle',
  };
  const action = animationToAction[expression.gesture.animation] ?? 'idle';
  return {
    ...state,
    action,
    bodyColor: expression.facial.tears ? state.bodyColor : state.bodyColor,
  };
}

/** Mô tả biểu đạt bằng lời tiếng Việt — cho log/UI. */
export function describeExpression(output: ExpressionOutput): string {
  return `${output.entityId} biểu đạt ${output.intensity >= 0.6 ? 'mạnh mẽ' : output.intensity >= 0.3 ? 'vừa phải' : 'kiềm chế'}: ${output.channelSummary}.`;
}
