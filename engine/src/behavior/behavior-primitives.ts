/**
 * @file behavior-primitives.ts
 * @module @aetheria/engine/behavior/behavior-primitives
 * @description Kiểu dữ liệu và trợ giúp dùng chung cho toàn bộ subsystem hành vi.
 *
 * Trước đây gần 1.100 method hành vi dùng chung một body:
 *
 * ```ts
 * return { operation: 'cancelHumanAction', intensity, context: context ?? {}, status: 'active', timestamp: Date.now() };
 * ```
 *
 * Hệ quả: mọi thao tác — kể cả *hủy*, *ngắt*, *hoàn thành* — đều báo
 * `status: 'active'`, và không có tác dụng phụ nào được ghi lại.
 *
 * Module này chuẩn hoá kết quả theo **giai đoạn thật của thao tác** và cung cấp
 * các builder theo từng nhóm nghiệp vụ (cảm xúc, nhận thức, xã hội, giác
 * quan, trí nhớ, di chuyển, lựa chọn, thích nghi, phát hiện).
 */

import type { Vec3 } from '../types/transform.types.js';
import { behaviorRandomFor } from './behavior-random.js';

/** Giai đoạn của một thao tác hành vi. */
export type BehaviorStatus =
  | 'active'
  | 'queued'
  | 'executing'
  | 'completed'
  | 'cancelled'
  | 'interrupted'
  | 'resumed'
  | 'failed'
  | 'detected'
  | 'adapted'
  | 'selected'
  | 'stored'
  | 'initialized'
  | 'updated';

/** Bản ghi chuẩn hoá của một thao tác hành vi. */
export interface BehaviorOperationResult {
  operation: string;
  status: BehaviorStatus;
  intensity: number;
  context: Record<string, unknown>;
  timestamp: number;
  /** Số lần mô phỏng đã chạy khi thao tác xảy ra. */
  tick: number;
  /** Thời lượng ước tính (giây) nếu thao tác có thời lượng. */
  duration?: number;
  /** Kết quả phụ để người gọi dùng tiếp. */
  result?: unknown;
  [key: string]: unknown;
}

/** Giới hạn cường độ trong khoảng 0..1. */
export function clampIntensity(value: unknown, fallback = 0.5): number {
  const v = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Chuẩn hoá tham số ngữ cảnh về object. */
export function normalizeContext(context: unknown): Record<string, unknown> {
  if (!context || typeof context !== 'object') return {};
  if (Array.isArray(context)) return { items: context };
  return context as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Đánh giá dựa trên bằng chứng
// ---------------------------------------------------------------------------

/** Khoá không phải "yếu tố" khi thu thập bằng chứng (siêu dữ liệu, không phải tín hiệu). */
const NON_EVIDENCE_KEYS = new Set([
  'tick', 'timestamp', 'time', 'dt', 'deltaTime', 'seed', 'id', 'name', 'type', 'tag',
  'label', 'query', 'target', 'context', 'options', 'valid', 'debug', 'verbose',
]);

/**
 * Thu thập các yếu tố số từ đối tượng đầu vào.
 *
 * Chỉ lấy giá trị số ở tầng lá (mảng và object lồng được duyệt một cách có kiểm soát),
 * bỏ qua các khoá siêu dữ liệu. Kết quả là tập "bằng chứng" mà phép đánh giá dựa vào.
 */
export function collectFactors(source: unknown, depth = 0): Record<string, number> {
  const out: Record<string, number> = {};
  if (depth > 3 || source === null || source === undefined) return out;

  if (typeof source === 'number') {
    if (Number.isFinite(source)) out.value = source;
    return out;
  }
  if (typeof source !== 'object') return out;

  if (Array.isArray(source)) {
    source.forEach((item, index) => {
      const nested = collectFactors(item, depth + 1);
      for (const [key, value] of Object.entries(nested)) {
        out[`${index}.${key}`] = value;
      }
    });
    return out;
  }

  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (NON_EVIDENCE_KEYS.has(key)) continue;
    if (typeof value === 'number') {
      if (Number.isFinite(value)) out[key] = value;
    } else if (typeof value === 'boolean') {
      out[key] = value ? 1 : 0;
    } else if (value && typeof value === 'object') {
      const nested = collectFactors(value, depth + 1);
      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        out[`${key}.${nestedKey}`] = nestedValue;
      }
    }
  }
  return out;
}

/**
 * Độ tin cậy = **độ đầy đủ của bằng chứng** × **độ nhất quán**.
 *
 * Trước đây độ tin cậy là `0.75 + Math.random() * 0.25` — một con số ngẫu nhiên
 * không gắn với dữ liệu nào, luôn nằm trong [0.75, 1] và không tái lập được.
 * Nay: nhiều yếu tố độc lập cùng chỉ tới một kết luận → tin cậy cao;
 * các yếu tố mâu thuẫn nhau → tin cậy thấp; không có dữ liệu → tin cậy rất thấp.
 */
export function evidenceConfidence(factors: Record<string, number>, explicit?: unknown): number {
  if (typeof explicit === 'number' && Number.isFinite(explicit)) {
    return explicit < 0 ? 0 : explicit > 1 ? 1 : explicit;
  }
  const values = Object.values(factors);
  if (values.length === 0) return 0.2;

  // Độ đầy đủ: 1 yếu tố → 0.45, 2 → 0.6, 3 → 0.72, 4+ → 0.85.
  const completeness = Math.min(0.85, 0.45 + (values.length - 1) * 0.12);

  // Độ nhất quán: các yếu tố càng gần nhau càng đáng tin.
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const spread = Math.sqrt(variance);
  const consistency = 1 / (1 + spread * 2);

  return Math.max(0, Math.min(1, completeness * (0.6 + 0.4 * consistency)));
}

/** Kết quả của một phép đánh giá dựa trên bằng chứng. */
export interface BehaviorEvaluation {
  /** Tên phép đánh giá. */
  operation: string;
  /** Giá trị đo được (NaN nếu không có dữ liệu nào). */
  value: number;
  /** Điểm chuẩn hoá 0..1. */
  score: number;
  /** Độ tin cậy 0..1 = độ đầy đủ bằng chứng. */
  confidence: number;
  /** Các yếu tố đã dùng để suy ra kết quả. */
  factors: Record<string, number>;
  /** Nguồn của giá trị chính. */
  basis: 'target' | 'options' | 'target.factors' | 'options.factors' | 'none';
  /** Khoá yếu tố được dùng làm giá trị chính (null nếu không có yếu tố). */
  valueSource: string | null;
  /** Số yếu tố đã thu thập. */
  evidenceCount: number;
}

/** Tách tên phép toán camelCase thành các token ngữ nghĩa (bỏ từ chung). */
/**
 * Ngữ cảnh cảm xúc của một thao tác.
 *
 * Trước đây mọi cảm xúc đều trả `valence: 0` — nghĩa là `feelJoy` và
 * `feelGrief` cho ra kết quả không khác nhau, người đọc không phân biệt được.
 * Nay valence và arousal suy ra từ chính tên cảm xúc.
 */
export interface EmotionAffect {
  /** -1 (rất tiêu cực) .. 0 (trung tính) .. 1 (rất tích cực). */
  valence: number;
  /** 0 (bình tĩnh) .. 1 (rất mãnh liệt). */
  arousal: number;
  /** Các token đã dùng để suy ra — để giao diện/debug hiển thị. */
  matched: string[];
}

/**
 * Từ khoá cảm xúc → valence.
 *
 * Âm = tiêu cực, dương = tích cực. Giá trị gần 1 = rõ rệt.
 */
const AFFECT_VALENCE: Record<string, number> = {
  // --- tích cực ---
  admiration: 0.7, amusement: 0.7, anticipation: 0.5, compassion: 0.7,
  contentment: 0.7, curiosity: 0.5, delight: 0.8, gratitude: 0.8,
  happiness: 0.85, hope: 0.7, inspiration: 0.75, joy: 0.9, playfulness: 0.7,
  pride: 0.6, relief: 0.6, sympathy: 0.6, wonder: 0.7, affection: 0.8,
  attraction: 0.6, attachment: 0.7, excitement: 0.8, enthusiasm: 0.7,
  appreciation: 0.7, triumph: 0.8, trust: 0.7, comfort: 0.6, warmth: 0.7,
  // --- tiêu cực ---
  anger: -0.8, anxiety: -0.7, contempt: -0.7, disappointment: -0.6,
  dread: -0.8, emptiness: -0.6, envy: -0.6, fear: -0.75, frustration: -0.6,
  grief: -0.9, homesickness: -0.7, hopelessness: -0.9, indignation: -0.7,
  irritation: -0.5, jealousy: -0.7, loneliness: -0.7, nostalgia: -0.3,
  panic: -0.9, regret: -0.6, rejection: -0.7, pain: -0.7, resentment: -0.7,
  sadness: -0.75, suspicion: -0.4, shame: -0.8, guilt: -0.7, humiliation: -0.9,
  stress: -0.6, hurt: -0.7, despair: -0.9, worry: -0.6, distress: -0.7,
  rage: -0.9, fury: -0.9, loathing: -0.85, disgust: -0.7, betrayal: -0.8,
};

/**
 * Từ khoá cảm xúc → arousal (mức kích hoạt).
 *
 * Giá trị gần 1 = phản ứng mãnh liệt, gần 0 = trạng thái tĩnh lặng.
 */
const AFFECT_AROUSAL: Record<string, number> = {
  anger: 0.85, anxiety: 0.8, excitement: 0.9, fear: 0.85, panic: 0.95,
  joy: 0.8, delight: 0.8, indignation: 0.8, irritation: 0.7, jealousy: 0.75,
  dread: 0.8, startle: 0.95, alarm: 0.85, rage: 0.95, fury: 0.95,
  fight: 0.9, flight: 0.9, freeze: 0.85, fawn: 0.75, herd: 0.7,
  hunger: 0.6, thirst: 0.6, thermoregulation: 0.4, habit: 0.25,
  grief: 0.45, sadness: 0.35, despair: 0.4, hopelessness: 0.3,
  loneliness: 0.35, shame: 0.55, guilt: 0.5, contempt: 0.6,
  resentment: 0.55, suspicion: 0.6, envy: 0.6, rejection: 0.65, pain: 0.7,
  disappointment: 0.4, frustration: 0.6, homesickness: 0.4,
  gratitude: 0.35, hope: 0.45, curiosity: 0.55, wonder: 0.6,
  admiration: 0.55, inspiration: 0.7, affection: 0.45, sympathy: 0.45,
  compassion: 0.5, contentment: 0.2, playfulness: 0.65, anticipation: 0.55,
  relief: 0.3, pride: 0.55, attachment: 0.4, attraction: 0.6, amusement: 0.7,
  happiness: 0.7, nostalgia: 0.3,
  calm: 0.15, peace: 0.15, rest: 0.1, sleep: 0.05, patience: 0.2,
  composure: 0.2, relaxation: 0.15, fatigue: 0.1, boredom: 0.2,
};

/**
 * Suy ra ngữ cảnh cảm xúc (valence / arousal) từ tên thao tác.
 *
 * Ví dụ: `feelJoy` → valence +0.9, arousal 0.8; `feelGrief` → valence −0.9;
 * `feelRejectionPain` → valence −0.7 (trung bình của hai từ khoá âm);
 * `developLanguageAbility` → trung tính (không có từ khoá cảm xúc).
 */
export function affectForEmotion(emotion: string): EmotionAffect {
  const tokens = operationTokens(emotion);

  let valence = 0;
  let valenceCount = 0;
  let arousal = 0;
  let arousalCount = 0;
  const matched: string[] = [];

  for (const token of tokens) {
    const v = AFFECT_VALENCE[token];
    if (v !== undefined) {
      valence += v;
      valenceCount++;
      if (!matched.includes(token)) matched.push(token);
    }
    const a = AFFECT_AROUSAL[token];
    if (a !== undefined) {
      arousal += a;
      arousalCount++;
      if (!matched.includes(token)) matched.push(token);
    }
  }

  // Trung bình theo số từ khoá khớp — cảm xúc nhiều thành phần không bị lệch
  // về một từ đơn lẻ.
  const valenceValue =
    valenceCount > 0 ? Math.round((valence / valenceCount) * 100) / 100 : 0;
  const arousalValue =
    arousalCount > 0 ? Math.round((arousal / arousalCount) * 100) / 100 : 0.5;

  return { valence: valenceValue, arousal: arousalValue, matched };
}

const GENERIC_TOKENS = new Set([
  'level', 'value', 'rate', 'index', 'amount', 'factor', 'total', 'count',
  'mean', 'avg', 'score', 'estimate', 'evaluate', 'calculate', 'predict',
  'simulate', 'get', 'set', 'apply', 'compute', 'measure',
]);

function operationTokens(operation: string): string[] {
  const raw = operation
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((token) => token.toLowerCase())
    .filter((token) => token.length > 2 && !GENERIC_TOKENS.has(token));
  // Token dài hơn = khớp cụ thể hơn → ưu tiên trước.
  return raw.sort((a, b) => b.length - a.length);
}

/**
 * Phép đánh giá chung cho nhóm `estimate*` / `evaluate*` / `calculate*` / `predict*`.
 *
 * Thay cho `score = sin(tick) * 0.5 + 0.5` và `confidence = 0.75 + random() * 0.25`
 * (cả hai đều là giá trị giả, không phản ánh tình huống), nay:
 *   • `value`      — số đo thật lấy từ `target`/`options` (hoặc yếu tố khớp ngữ nghĩa với
 *                    tên phép toán, ví dụ `estimateStressLevel` → yếu tố `stress`),
 *   • `score`      — giá trị chuẩn hoá về 0..1,
 *   • `confidence` — suy ra từ số lượng + độ nhất quán của bằng chứng,
 *   • `factors`    — các tín hiệu đã dùng (trường bắt buộc để giao diện/debug hiển thị),
 *   • `basis`      — kết quả dựa vào đâu,
 *   • `valueSource` — khoá yếu tố đã dùng làm giá trị chính.
 */
export function evaluateEstimate(
  operation: string,
  target?: unknown,
  options?: Record<string, unknown>,
  opts: { tick?: number; context?: unknown } = {},
): BehaviorEvaluation {
  const targetFactors = collectFactors(target);
  const optionFactors = collectFactors(options);
  const allFactors = { ...targetFactors, ...optionFactors };
  const allKeys = Object.keys(allFactors);

  let value: number | undefined;
  let basis: BehaviorEvaluation['basis'] = 'none';
  let valueSource: string | null = null;

  // 1. target là số đo trực tiếp.
  if (typeof target === 'number' && Number.isFinite(target)) {
    value = target;
    basis = 'target';
    valueSource = 'target';
  }

  // 2. `options.value` là giá trị được chỉ định rõ.
  if (value === undefined && typeof optionFactors.value === 'number') {
    value = optionFactors.value;
    basis = 'options';
    valueSource = 'value';
  }

  // 3. Yếu tố khớp ngữ nghĩa với tên phép toán (vd `estimateStressLevel` → `stress`).
  if (value === undefined) {
    for (const token of operationTokens(operation)) {
      const key = allKeys.find(
        (candidate) =>
          candidate === token ||
          candidate.endsWith(`.${token}`) ||
          candidate.startsWith(`${token}.`),
      );
      if (key !== undefined) {
        value = allFactors[key];
        valueSource = key;
        basis = key in targetFactors ? 'target.factors' : 'options.factors';
        break;
      }
    }
  }

  // 4. Không có yếu tố nào khớp → lấy yếu tố đầu tiên (thứ tự chắc định).
  if (value === undefined && allKeys.length > 0) {
    value = allFactors[allKeys[0]];
    valueSource = allKeys[0];
    basis = allKeys[0] in targetFactors ? 'target.factors' : 'options.factors';
  }

  const explicitConfidence =
    typeof options?.confidence === 'number'
      ? options.confidence
      : typeof options?.certainty === 'number'
        ? options.certainty
        : undefined;

  const confidence = evidenceConfidence(allFactors, explicitConfidence);

  // Chuẩn hoá giá trị về 0..1: giá trị đã nằm trong 0..1 thì giữ nguyên,
  // nếu lớn hơn 1 thì chia theo giá trị lớn nhất trong tập yếu tố.
  let score: number;
  if (value === undefined || !Number.isFinite(value)) {
    score = 0.5;
  } else if (value >= 0 && value <= 1) {
    score = value;
  } else {
    const scale = Object.values(allFactors);
    const max = scale.length > 0 ? Math.max(...scale.map(Math.abs)) : Math.abs(value);
    score = max > 0 ? Math.min(1, Math.abs(value) / max) : 0.5;
  }

  return {
    operation,
    value: value ?? Number.NaN,
    score: Math.round(score * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    factors: allFactors,
    basis,
    valueSource,
    evidenceCount: allKeys.length,
  };
}

/**
 * Suy ra giai đoạn đúng của một thao tác từ động từ trong tên hàm.
 *
 * `cancelHumanAction` → 'cancelled', `interruptHumanAction` → 'interrupted',
 * `resumeHumanAction` → 'resumed', `queueHumanAction` → 'queued',
 * `completeHumanAction` → 'completed'…
 */
export function statusForOperation(operation: string): BehaviorStatus {
  const name = operation.toLowerCase();
  if (name.startsWith('cancel') || name.includes('cancel')) return 'cancelled';
  if (name.startsWith('interrupt') || name.includes('interrupt')) return 'interrupted';
  if (name.startsWith('resume') || name.includes('resume')) return 'resumed';
  if (name.startsWith('queue') || name.includes('queue') || name.startsWith('schedule')) return 'queued';
  if (name.startsWith('complete') || name.includes('complete') || name.startsWith('finish')) return 'completed';
  if (name.startsWith('init') || name.includes('initialize')) return 'initialized';
  if (name.startsWith('detect') || name.includes('detect') || name.startsWith('recognize') || name.startsWith('identify')) {
    return 'detected';
  }
  if (name.startsWith('adapt') || name.includes('adapt') || name.startsWith('adjust')) return 'adapted';
  if (name.startsWith('select') || name.startsWith('choose')) return 'selected';
  if (name.startsWith('encode') || name.startsWith('learn') || name.startsWith('remember') || name.startsWith('store')) {
    return 'stored';
  }
  if (name.startsWith('update') || name.includes('update')) return 'updated';
  if (name.startsWith('execute') || name.startsWith('perform') || name.includes('execute')) return 'executing';
  return 'active';
}

/**
 * Bản ghi chuẩn hoá cho một thao tác hành vi.
 *
 * @param operation - tên hàm
 * @param opts - cường độ, ngữ cảnh, trạng thái và dữ liệu bổ sung
 */
export function operationResult(
  operation: string,
  opts: {
    intensity?: unknown;
    context?: unknown;
    status?: BehaviorStatus;
    tick?: number;
    duration?: number;
    result?: unknown;
    extra?: Record<string, unknown>;
  } = {},
): BehaviorOperationResult {
  const status = opts.status ?? statusForOperation(operation);
  const base: BehaviorOperationResult = {
    operation,
    status,
    intensity: clampIntensity(opts.intensity),
    context: normalizeContext(opts.context),
    timestamp: Date.now(),
    tick: opts.tick ?? 0,
  };
  if (opts.duration !== undefined) base.duration = opts.duration;
  if (opts.result !== undefined) base.result = opts.result;
  if (opts.extra) Object.assign(base, opts.extra);
  return base;
}

/** Kết quả cho nhóm cảm xúc — có `emotion`, `cause`, `valence` và `arousal`. */
export function emotionResult(
  emotion: string,
  opts: { intensity?: unknown; cause?: unknown; tick?: number; context?: unknown; extra?: Record<string, unknown> } = {},
): Record<string, unknown> {
  const intensity = clampIntensity(opts.intensity);
  // Valence/arousal suy ra từ tên cảm xúc — trước đây luôn là 0 nên mọi cảm xúc
  // đều trùng nhau về mặt ngữ nghĩa.
  const affect = affectForEmotion(emotion);
  return {
    ...operationResult(emotion, {
      intensity,
      context: opts.context,
      tick: opts.tick,
      status: 'active',
      extra: {
        emotion,
        intensity,
        cause: opts.cause ?? null,
        // Mức cảm xúc tích luỹ sau khi kích hoạt.
        level: Math.min(1, intensity),
        valence: affect.valence,
        arousal: affect.arousal,
        affectBasis: affect.matched,
      },
    }),
  };
}

/** Kết quả cho nhóm tín hiệu / phát hiện — có `signal` và `detected`. */
export function detectionResult(
  signal: string,
  opts: { threshold?: unknown; detected?: boolean; strength?: number; tick?: number; context?: unknown } = {},
): Record<string, unknown> {
  const threshold = clampIntensity(opts.threshold, 0.5);
  // Cường độ tín hiệu: ưu tiên giá trị cho sẵn, sau đó đọc từ ngữ cảnh,
  // cuối cùng mới coi là "không có tín hiệu".
  const contextFactors = collectFactors(opts.context);
  const strength =
    opts.strength ??
    (typeof contextFactors.strength === 'number'
      ? contextFactors.strength
      : typeof contextFactors.magnitude === 'number'
        ? contextFactors.magnitude
        : typeof contextFactors.level === 'number'
          ? contextFactors.level
          : undefined);

  // Phát hiện theo ngưỡng thật — trước đây dùng `Math.random() >= threshold * 0.5`,
  // tức kết quả phụ thuộc hoàn toàn vào may rủi chứ không phải tín hiệu.
  const detected = opts.detected ?? (strength === undefined ? false : strength >= threshold);
  // Không có tín hiệu thì cường độ bằng 0 — trước đây gán sẵn 0.1/0.85 là giá trị bịa.
  const effectiveStrength = strength ?? 0;

  return {
    ...operationResult(signal, {
      intensity: effectiveStrength,
      context: opts.context,
      tick: opts.tick,
      status: 'detected',
      extra: {
        signal,
        detected,
        strength: effectiveStrength,
        threshold,
        margin: Math.round((effectiveStrength - threshold) * 100) / 100,
      },
    }),
  };
}

/** Kết quả cho nhóm thích nghi / điều chỉnh — có `response` và `factor`. */
export function adaptationResult(
  response: string,
  opts: { factor?: unknown; stimulus?: unknown; tick?: number; context?: unknown } = {},
): Record<string, unknown> {
  const factor = clampIntensity(opts.factor, 0.5);
  // Mức độ thích nghi đạt được bằng chính hệ số điều chỉnh.
  const adaptedLevel = factor;
  // Thích nghi chỉ coi là thành công khi hệ số đủ lớn — trước đây luôn `true`.
  const success = adaptedLevel >= 0.5;
  return {
    ...operationResult(response, {
      intensity: adaptedLevel,
      context: opts.context,
      tick: opts.tick,
      status: 'adapted',
      extra: {
        response,
        stimulus: opts.stimulus ?? 'environmental',
        factor,
        adaptedLevel,
        success,
        successThreshold: 0.5,
      },
    }),
  };
}

/**
 * Lấy điểm ưu tiên của một phương án.
 *
 * Thứ tự ưu tiên các trường: `score` → `weight` → `priority` → `utility` → `value`.
 * Phương án không có điểm nào được xem là 0.
 */
function candidateScore(candidate: unknown): number {
  if (typeof candidate === 'number') return Number.isFinite(candidate) ? candidate : 0;
  if (!candidate || typeof candidate !== 'object') return 0;
  const record = candidate as Record<string, unknown>;
  for (const key of ['score', 'weight', 'priority', 'utility', 'value', 'rating']) {
    const raw = record[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  }
  return 0;
}

/** Kết quả cho nhóm lựa chọn — có `action` và `selected`. */
export function selectionResult(
  action: string,
  candidates: unknown,
  opts: { tick?: number; context?: unknown; criteria?: Record<string, unknown> } = {},
): Record<string, unknown> {
  const pool = Array.isArray(candidates) && candidates.length > 0 ? candidates : ['option_alpha', 'option_beta', 'option_gamma'];

  // Chọn theo điểm ưu tiên thật; trước đây chọn ngẫu nhiên
  // (`pool[Math.floor(Math.random() * pool.length)]`) nên kết quả không bám vào tiêu chí.
  const scores = pool.map(candidateScore);
  let bestIndex = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > scores[bestIndex]) bestIndex = i;
  }
  const hasExplicitScores = scores.some((score) => score !== 0);
  const chosen = pool[bestIndex];

  // Khi nhiều phương án cùng điểm, phá vỡ bằng luồng ngẫu nhiên CÓ SEED
  // để vẫn tái lập được giữa các client (network-sync) và giữa các lần chạy.
  let tieBreak = 'highest_score';
  if (!hasExplicitScores) {
    tieBreak = 'seeded_tie_break';
  } else {
    const tied = scores.filter((score) => score === scores[bestIndex]).length;
    if (tied > 1) {
      const stream = behaviorRandomFor(`selection:${action}`);
      bestIndex = stream.int(0, scores.length - 1);
      tieBreak = 'seeded_tie_break';
    }
  }

  const selected = pool[bestIndex];

  return {
    ...operationResult(action, {
      tick: opts.tick,
      context: opts.context,
      status: 'selected',
      extra: {
        action,
        selected,
        candidates: pool,
        scores,
        selectedScore: scores[bestIndex],
        rationale: hasExplicitScores ? 'highest_score' : 'seeded_tie_break',
        tieBreak,
        criteria: opts.criteria ?? {},
      },
    }),
  };
}

/**
 * Trích vị trí (x, y, z) từ một đối tượng bất kỳ.
 *
 * Chấp nhận cả `{ x, y, z }` lẫn `{ position: { x, y, z } }`.
 */
function extractPosition(source: unknown): { x: number; y: number; z: number } | null {
  if (!source || typeof source !== 'object') return null;
  const record = source as Record<string, unknown>;

  const direct = record.x ?? record.X;
  const directY = record.y ?? record.Y;
  const directZ = record.z ?? record.Z;
  if (typeof direct === 'number' && typeof directY === 'number' && typeof directZ === 'number') {
    return { x: direct, y: directY, z: directZ };
  }

  const nested = record.position ?? record.position3d ?? record.location;
  if (nested && typeof nested === 'object') {
    const n = nested as Record<string, unknown>;
    const x = n.x ?? n.X;
    const y = n.y ?? n.Y;
    const z = n.z ?? n.Z;
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      return { x, y, z };
    }
  }

  return null;
}

/** Kết quả cho nhóm di chuyển — có `movement` và `target`. */
export function movementResult(
  movement: string,
  target: unknown,
  urgency: unknown,
  opts: { tick?: number; context?: unknown; position?: Vec3 } = {},
): Record<string, unknown> {
  // Vị trí đích lấy từ mục tiêu khi có; trước đây luôn gán (0,0,0) — tức báo
  // rằng nhân vật đang ở gốc toạ độ dù thực tế không biết.
  const position = opts.position ?? extractPosition(target);

  return {
    ...operationResult(movement, {
      intensity: urgency,
      context: opts.context,
      tick: opts.tick,
      status: 'executing',
      extra: {
        movement,
        target: target ?? null,
        urgency: clampIntensity(urgency, 1),
        active: true,
        position,
        hasPosition: position !== null,
      },
    }),
  };
}

/** Kết quả cho nhóm ghi nhớ — có `stored`, `memoryId`, `type`. */
export function memoryResult(
  type: string,
  memoryId: string,
  retention: number,
  opts: { tick?: number; context?: unknown; count?: number } = {},
): Record<string, unknown> {
  return {
    ...operationResult(type, {
      tick: opts.tick,
      context: opts.context,
      status: 'stored',
      extra: {
        stored: true,
        memoryId,
        type,
        count: opts.count ?? 0,
        retention,
      },
    }),
  };
}

/** Kết quả cho nhóm khởi tạo — có `initialized`. */
export function initializationResult(
  name: string,
  opts: { tick?: number; context?: unknown; extra?: Record<string, unknown> } = {},
): Record<string, unknown> {
  return {
    ...operationResult(name, {
      tick: opts.tick,
      context: opts.context,
      status: 'initialized',
      extra: { initialized: true, func: name, ...(opts.extra ?? {}) },
    }),
  };
}

/** Kết quả cho nhóm cập nhật — có `updated` và `ticks`. */
export function updateResult(
  name: string,
  deltaTime: number,
  ticks: number,
  opts: { context?: unknown; extra?: Record<string, unknown> } = {},
): Record<string, unknown> {
  return {
    ...operationResult(name, {
      context: opts.context,
      tick: ticks,
      status: 'updated',
      extra: { updated: true, deltaTime, ticks, func: name, ...(opts.extra ?? {}) },
    }),
  };
}

/** Kết quả cho nhóm thực thi — có `executed` và `action`. */
export function executionResult(
  action: string,
  payload: unknown,
  urgency: unknown,
  opts: { tick?: number; context?: unknown } = {},
): Record<string, unknown> {
  return {
    ...operationResult(action, {
      intensity: urgency,
      context: opts.context,
      tick: opts.tick,
      status: 'executing',
      extra: {
        executed: true,
        action,
        payload,
        urgency: clampIntensity(urgency, 1),
        status_detail: 'completed',
      },
    }),
  };
}

/** Kết quả cho nhóm đồng bộ / phối hợp — có `synchronized`. */
export function coordinationResult(
  routine: string,
  peerOrTarget: unknown,
  blendWeight: number,
  opts: { tick?: number; context?: unknown } = {},
): Record<string, unknown> {
  return {
    ...operationResult(routine, {
      intensity: blendWeight,
      context: opts.context,
      tick: opts.tick,
      status: 'executing',
      extra: {
        synchronized: true,
        target: peerOrTarget ?? 'global_peer',
        weight: blendWeight,
        routine,
      },
    }),
  };
}

/**
 * Lớp cơ sở chung cho mọi subsystem hành vi.
 *
 * Cả 7 subsystem hành vi trước đây khai báo **giống hệt nhau** 11 trường
 * trạng thái, 1 hàm `recordEvent` và ~1.170 thân hàm sao chép. Lớp cơ sở này
 * gom trạng thái + toàn bộ thân hàm vào một chỗ; mỗi subsystem chỉ còn các
 * phép tính riêng.
 */
export class BehaviorSubsystemBase {
  public isInitialized = false;
  public simulationTicks = 0;
  public lastUpdateTime = 0;
  public resetCounter = 0;
  public state: Record<string, any> = {};
  public context: Record<string, any> = {};
  public emotionLevels: Map<string, number> = new Map();
  public actionHistory: Array<{ action: string; payload?: any; urgency: number; timestamp: number }> = [];
  public knowledgeStore: Map<string, { key: string; data: any; retention: number }> = new Map();
  public eventLog: Array<{ event: string; intensity: number; cause?: string; timestamp: number }> = [];

  /** Ghi một sự kiện hành vi vào nhật ký. */
  public recordEvent(event: string, intensity: number, cause?: string): void {
    this.eventLog.push({ event, intensity, cause, timestamp: Date.now() });
    if (this.eventLog.length > 200) this.eventLog.shift();
  }

  // -------------------------------------------------------------------------
  // Thân hàm dùng chung — mỗi nhóm nghiệp vụ có một hàm riêng
  // -------------------------------------------------------------------------

  /**
   * Thao tác hành vi chung (509 method trước khi tối ưu).
   *
   * Trước đây tất cả đều trả `status: 'active'` — kể cả *hủy*, *ngắt*,
   * *hoàn thành*. Nay trạng thái suy ra từ động từ trong tên thao tác và sự
   * kiện được ghi vào nhật ký.
   */
  protected applyOperation(operation: string, intensity = 0.5, context?: unknown): Record<string, unknown> {
    const result = operationResult(operation, {
      intensity,
      context,
      tick: this.simulationTicks,
      status: statusForOperation(operation),
    });
    this.recordEvent(operation, result.intensity, undefined);
    return result;
  }

  /**
   * Tìm cảm xúc mà một thao tác `suppress*` nhắm tới.
   *
   * `suppressAnger` → `feelAnger`. Chỉ xét các mục `feel*` vì đó là tên cảm
   * xúc gốc đã cảm nhận; nếu không có mục nào khớp thì trả `undefined` —
   * không thể kìm nén một cảm xúc chưa từng có.
   */
  private resolveSuppressionTarget(operation: string): string | undefined {
    const tokens = new Set(operationTokens(operation));
    let best: string | undefined;
    let bestScore = 0;

    for (const key of this.emotionLevels.keys()) {
      if (!key.startsWith('feel')) continue;
      const keyTokens = new Set(operationTokens(key));
      let overlap = 0;
      for (const token of tokens) {
        if (keyTokens.has(token)) overlap++;
      }
      if (overlap > bestScore) {
        best = key;
        bestScore = overlap;
      }
    }

    return bestScore > 0 ? best : undefined;
  }

  /** Kích hoạt / kìm nén / khuếch đại một cảm xúc. */
  protected applyEmotion(emotion: string, intensity = 0.5, cause?: string): Record<string, unknown> {
    const isSuppression = emotion.startsWith('suppress');
    // `suppressAnger` nhắm vào cảm xúc `feelAnger` — trước đây nó tạo một mục
    // riêng tên `suppressAnger` nên mức cảm xúc gốc không hề giảm, tức lệnh
    // "kìm nén" không kìm nén được gì.
    const target = isSuppression ? this.resolveSuppressionTarget(emotion) : emotion;

    const current = target ? (this.emotionLevels.get(target) ?? 0) : 0;
    const factor = isSuppression ? -intensity : intensity;
    const nextVal = Math.max(0, Math.min(1, current + factor));

    if (target) this.emotionLevels.set(target, nextVal);
    this.recordEvent(emotion, nextVal, cause);

    const result: Record<string, unknown> = {
      ...emotionResult(target ?? emotion, {
        intensity: nextVal,
        cause,
        tick: this.simulationTicks,
      }),
      emotion: target ?? emotion,
      intensity: nextVal,
      cause: cause ?? 'internal',
      active: nextVal > 0.05,
      level: nextVal,
    };

    if (isSuppression) {
      result.suppressed = emotion;
      result.suppression = intensity;
      result.target = target ?? null;
      // Không có cảm xúc gốc để kìm nén → thao tác không có tác dụng.
      result.applied = target !== undefined;
    }

    return result;
  }

  /** Thích nghi / điều chỉnh hành vi theo kích thích. */
  protected applyAdaptation(response: string, factor = 1, stimulus?: unknown): Record<string, unknown> {
    return adaptationResult(response, { factor, stimulus, tick: this.simulationTicks });
  }

  /** Phát hiện một tín hiệu trong môi trường. */
  protected applyDetection(signal: string, threshold = 0.4, environment?: unknown): Record<string, unknown> {
    return detectionResult(signal, { threshold, tick: this.simulationTicks, context: environment });
  }

  /** Di chuyển tới / tránh một mục tiêu. */
  protected applyMovement(movement: string, targetEntity?: unknown, urgency = 0.6): Record<string, unknown> {
    return movementResult(movement, targetEntity, urgency, { tick: this.simulationTicks });
  }

  /** Ghi nhớ một kinh nghiệm. */
  protected applyMemory(type: string, experienceData?: unknown, retention = 0.9): Record<string, unknown> {
    // ID theo bộ đếm thay vì Date.now() + random → tái lập được khi replay.
    const memId = `mem_${this.simulationTicks}_${this.knowledgeStore.size}`;
    this.knowledgeStore.set(memId, { key: type, data: experienceData ?? {}, retention });
    return memoryResult(type, memId, retention, { tick: this.simulationTicks, count: this.knowledgeStore.size });
  }

  /** Cập nhật trạng thái mô phỏng. */
  protected applyUpdate(func: string, deltaTime = 0.016, context?: Record<string, any>): Record<string, unknown> {
    this.lastUpdateTime = Date.now();
    this.simulationTicks++;
    if (context) Object.assign(this.context, context);
    return updateResult(func, deltaTime, this.simulationTicks, { context });
  }

  /** Khởi tạo subsystem. */
  protected applyInitialization(func: string, config?: Record<string, any>): Record<string, unknown> {
    this.isInitialized = true;
    if (config) Object.assign(this.state, config);
    return initializationResult(func, { tick: this.simulationTicks });
  }

  /** Chọn một phương án hành động. */
  protected applySelection(action: string, candidates?: any[], criteria?: Record<string, any>): Record<string, unknown> {
    return selectionResult(action, candidates, { tick: this.simulationTicks, context: criteria, criteria });
  }

  /**
   * Phép đánh giá dựa trên bằng chứng cho nhóm `estimate*` / `evaluate*` /
   * `calculate*` / `predict*` — thay cho score `sin(tick)` và confidence `random()`.
   */
  protected evaluateEstimate(
    operation: string,
    target?: unknown,
    options?: Record<string, any>,
  ): BehaviorEvaluation {
    return evaluateEstimate(operation, target, options, { tick: this.simulationTicks });
  }

  /** Đồng bộ hoạt động với đối tác / nhóm. */
  protected applyCoordination(routine: string, peerOrTarget?: unknown, blendWeight = 0.5): Record<string, unknown> {
    return coordinationResult(routine, peerOrTarget, blendWeight, { tick: this.simulationTicks });
  }

  /** Thực thi một hành động. */
  protected applyExecution(action: string, actionPayload?: unknown, urgency = 1): Record<string, unknown> {
    this.actionHistory.push({ action, payload: actionPayload, urgency, timestamp: Date.now() });
    if (this.actionHistory.length > 100) this.actionHistory.shift();
    return executionResult(action, actionPayload, urgency, { tick: this.simulationTicks });
  }

  /** Biểu diễn cảm xúc qua một kênh. */
  protected applyExpression(channel: string, message?: unknown, intensity = 0.7): Record<string, unknown> {
    return {
      ...operationResult(channel, {
        intensity,
        tick: this.simulationTicks,
        status: 'executing',
        extra: {
          expressed: true,
          channel,
          intensity,
          message: message ?? 'salient_affect',
        },
      }),
      expressed: true,
      channel,
      intensity,
      message: message ?? 'salient_affect',
    };
  }

  /** Đặt lại trạng thái. */
  protected applyReset(func: string, options?: Record<string, any>): Record<string, unknown> {
    this.resetCounter++;
    return {
      ...operationResult(func, {
        tick: this.simulationTicks,
        status: 'updated',
        extra: { reset: true, count: this.resetCounter, func },
      }),
      reset: true,
      count: this.resetCounter,
      func,
    };
  }
}
