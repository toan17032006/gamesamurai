/**
 * @file morality.ts
 * @module @aetheria/engine/law/morality
 * @description Đạo đức & ý thức (conscience): bộ luật đạo đức của văn hoá
 * (đức/hư với trọng số), nội tâm hoá thành lương tâm cá nhân, phán xét đạo đức
 * mọi hành vi (generic), tự biện hộ (rationalization) làm tê liệt lương tâm,
 * đạo đức giả (nói một đằng làm một nẻo) và trôi đạo đức qua các thế hệ.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import type { Genome } from '../life/genetics.js';

/** Một đức/hư trong bộ luật đạo đức. */
export interface MoralVirtue {
  id: string;
  name: string;
  /** +1 = đức khuyến khích, -1 = hư bị cấm. */
  polarity: 1 | -1;
  /** Trọng số trong văn hoá `[0, 1]`. */
  weight: number;
  description: string;
}

/** Bộ luật đạo đức của một nền văn hoá. */
export interface MoralCode {
  id: string;
  name: string;
  virtues: MoralVirtue[];
}

/** Bộ luật đạo đức mẫu của một xã hội nông nghiệp phong kiến. */
export const FEUDAL_MORAL_CODE: MoralCode = {
  id: 'moral_confucian_ish',
  name: 'Tam cương ngũ thường biến thể',
  virtues: [
    { id: 'loyalty', name: 'trung', polarity: 1, weight: 0.9, description: 'trung thành với trên' },
    { id: 'filial_piety', name: 'hiếu', polarity: 1, weight: 0.95, description: 'kính trọng cha mẹ tổ tiên' },
    { id: 'honesty', name: 'tín', polarity: 1, weight: 0.7, description: 'giữ lời, không dối trá' },
    { id: 'compassion', name: 'nhân', polarity: 1, weight: 0.8, description: 'thương người, không tàn nhẫn' },
    { id: 'propriety', name: 'lễ', polarity: 1, weight: 0.6, description: 'đúng lễ nghĩa, biết thứ bậc' },
    { id: 'theft', name: 'trộm cắp', polarity: -1, weight: 0.85, description: 'lấy của người không phải của mình' },
    { id: 'murder', name: 'giết người', polarity: -1, weight: 1, description: 'hại mạng người vô tội' },
    { id: 'betrayal', name: 'phản bội', polarity: -1, weight: 0.9, description: 'bỏ rơi hoặc bán đứng người đã tin mình' },
    { id: 'lust', name: 'dục vọng quá trớn', polarity: -1, weight: 0.5, description: 'tham sắc, phá đạo nghề' },
    { id: 'pride', name: 'kiêu ngạo', polarity: -1, weight: 0.45, description: 'tự đại vô lối' },
  ],
};

/** Lương tâm cá nhân — ý thức đạo đức đã nội tâm hoá. */
export interface Conscience {
  entityId: string;
  /** Ý thức đạo đức tổng `[0, 1]` — cao = tự trọng, không cần ai giám sát. */
  awareness: number;
  /** Mức nội tâm hoá từng đức/hư: id → mức `[0, 1]`. */
  internalized: Record<string, number>;
  /** Nhật ký phán xét. */
  judgements: Array<{ actionId: string; guilt: number; year: number; rationalized: boolean }>;
  /** Vết đạo đức giả tích luỹ. */
  hypocrisyDebt: number;
}

/** Phán xét đạo đức generic cho mọi hành vi. */
export interface MoralJudgement<TAction extends { id: string; tags?: readonly string[] }> {
  action: TAction;
  /** Đánh giá: virtuous / neutral / sinful. */
  verdict: 'virtuous' | 'neutral' | 'sinful';
  /** Cảm giác tội lỗi sinh ra `[0, 1]`. */
  guilt: number;
  /** Các đức/hư bị chạm tới. */
 touchedVirtues: string[];
  reasoning: string;
}

/** Nội tâm hoá mức khởi đầu từ gen + văn hoá. */
export function deriveConscience(entityId: string, genome: Genome, code: MoralCode, traits: Record<string, number>): Conscience {
  const random = new DeepRandom(`${genome.id}:${entityId}:conscience`);
  const internalized: Record<string, number> = {};
  const conscientiousness = clamp01((traits.conscientiousness ?? 50) / 100);
  const openness = clamp01((traits.openness ?? 50) / 100);
  for (const virtue of code.virtues) {
    // Đức mạnh trong văn hoá dễ nội tâm hoá hơn; gen đều đặn học chậm nhanh khác nhau.
    const base = virtue.weight * (virtue.polarity > 0 ? conscientiousness : openness * 0.6 + 0.3);
    internalized[virtue.id] = clamp01(base * 0.8 + random.gaussian(0.1, 0.08));
  }
  const awareness = clampRange(
    Object.values(internalized).reduce((sum, v) => sum + v, 0) / code.virtues.length,
    0,
    1,
  );
  return { entityId, awareness, internalized, judgements: [], hypocrisyDebt: 0 };
}

/**
 * Phán xét đạo đức một hành vi theo lương tâm cá nhân: đức bị vi phạm → sinful
 * với guilt theo mức nội tâm hoá; đức được thực hành → virtuous và củng cố.
 */
export function judgeMoralAction<TAction extends { id: string; tags?: readonly string[] }>(
  conscience: Conscience,
  action: TAction,
  code: MoralCode,
): MoralJudgement<TAction> {
  const tags = action.tags ?? [];
  const touched: string[] = [];
  let guilt = 0;
  let credit = 0;
  for (const virtue of code.virtues) {
    if (!tags.includes(virtue.id)) continue;
    touched.push(virtue.id);
    const level = conscience.internalized[virtue.id] ?? 0.5;
    if (virtue.polarity < 0) guilt += virtue.weight * level;
    else credit += virtue.weight * level;
  }
  if (touched.length === 0) {
    return { action, verdict: 'neutral', guilt: 0, touchedVirtues: [], reasoning: 'hành vi ngoài vùng đạo đức của văn hoá' };
  }
  const verdict = guilt > credit ? 'sinful' : credit > guilt ? 'virtuous' : 'neutral';
  const netGuilt = clamp01(guilt - credit * 0.5);
  conscience.judgements.push({ actionId: action.id, guilt: netGuilt, year: 0, rationalized: false });
  if (conscience.judgements.length > 200) conscience.judgements.shift();
  return {
    action,
    verdict,
    guilt: Math.round(netGuilt * 1000) / 1000,
    touchedVirtues: touched,
    reasoning:
      verdict === 'sinful'
        ? `chạm vào ${touched.join(', ')} — lương tâm lên án`
        : verdict === 'virtuous'
          ? `thực hành ${touched.join(', ')} — lương tâm an`
          : 'thiện ác đan xen',
  };
}

/**
 * Tự biện hộ: agent lý luận quanh để xóa tội — hiệu quả phụ thuộc mức lương
 * tâm (ý thức càng cao càng khó lừa mình) và số lần đã biện hộ trước đó.
 */
export function rationalize(
  conscience: Conscience,
  actionId: string,
  excuse: string,
  options: { random?: DeepRandom; peerApproval?: number } = {},
): { eased: number; believed: boolean; note: string } {
  const random = options.random ?? new DeepRandom(`${conscience.entityId}:rationalize:${actionId}`);
  const record = [...conscience.judgements].reverse().find((j) => j.actionId === actionId);
  if (!record || record.guilt <= 0) {
    return { eased: 0, believed: false, note: 'không có tội nào để biện hộ' };
  }
  const peerApproval = clamp01(options.peerApproval ?? 0.5);
  // Càng nhiều người đồng ý, chuyện sai càng "trở nên đúng" — cơ chế thật của lương tâm xã hội.
  const believed = random.chance(clamp01(0.7 - conscience.awareness * 0.5 + peerApproval * 0.3));
  const eased = believed ? clamp01(record.guilt * (0.4 + peerApproval * 0.4)) : 0;
  record.guilt = clamp01(record.guilt - eased);
  record.rationalized = believed;
  if (!believed) conscience.awareness = clamp01(conscience.awareness + 0.01); // lỡ mình thất bại → tự nhìn kỹ hơn
  return {
    eased: Math.round(eased * 1000) / 1000,
    believed,
    note: believed
      ? `lương tâm tê liệt bớt: "${excuse}" được chấp nhận (hạ ${Math.round(eased * 100)}%)`
      : `bản thân không mua được câu chuyện "${excuse}" — lương tâm còn nguyên`,
  };
}

/** Đạo đức giả: nói đức nhưng làm hư — ghi nợ giả dối, trả bằng awareness. */
export function recordHypocrisy(conscience: Conscience, preachedVirtue: string, violatedAct: string): void {
  conscience.hypocrisyDebt = clamp01(conscience.hypocrisyDebt + 0.15);
  // Nợ quá cao ăn mòn ý thức — kẻ đạo đức giả lâu ngày mất luôn tiêu chuẩn.
  if (conscience.hypocrisyDebt > 0.8) {
    conscience.awareness = clamp01(conscience.awareness - 0.03);
  }
  conscience.judgements.push({ actionId: `hypocrisy_${preachedVirtue}_${violatedAct}`, guilt: 0.05, year: 0, rationalized: true });
}

/** Dạy học đạo đức: internalization tăng theo thầy + độ tiếp nhận. */
export function teachMorality(
  conscience: Conscience,
  virtueId: string,
  quality: number,
): number {
  const current = conscience.internalized[virtueId] ?? 0.3;
  const next = clamp01(current + clamp01(quality) * 0.12 * (1 - current));
  conscience.internalized[virtueId] = next;
  conscience.awareness = clampRange(
    Object.values(conscience.internalized).reduce((sum, v) => sum + v, 0) /
      Math.max(1, Object.keys(conscience.internalized).length),
    0,
    1,
  );
  return next;
}

/** Động cơ trôi đạo đức qua các thế hệ: đức ít được thực hành mờ dần. */
export function driftMoralCode(code: MoralCode, practiced: ReadonlyArray<{ virtueId: string; year: number }>, year: number): MoralCode {
  const recentYears = practiced.filter((p) => year - p.year <= 25).map((p) => p.virtueId);
  const next: MoralCode = {
    ...code,
    virtues: code.virtues.map((virtue) => {
      const practiceCount = recentYears.filter((id) => id === virtue.id).length;
      // Không ai thực hành 25 năm → trọng số mòn (đạo đức chết dần).
      const decay = practiceCount === 0 ? 0.02 : 0;
      return { ...virtue, weight: clamp01(virtue.weight - decay) };
    }),
  };
  return next;
}

/** Registry lương tâm toàn thế giới. */
export class MoralityEngine {
  public readonly consciences = new Map<string, Conscience>();
  public readonly code: MoralCode;
  public readonly seed: number | string;

  constructor(options: { seed?: number | string; code?: MoralCode } = {}) {
    this.seed = options.seed ?? 'aetheria-morality';
    this.code = options.code ?? FEUDAL_MORAL_CODE;
  }

  public conscienceOf(entityId: string, genome?: Genome, traits: Record<string, number> = {}): Conscience {
    let conscience = this.consciences.get(entityId);
    if (!conscience && genome) {
      conscience = deriveConscience(entityId, genome, this.code, traits);
      this.consciences.set(entityId, conscience);
    }
    if (!conscience) {
      conscience = { entityId, awareness: 0.5, internalized: {}, judgements: [], hypocrisyDebt: 0 };
      this.consciences.set(entityId, conscience);
    }
    return conscience;
  }

  public judge<TAction extends { id: string; tags?: readonly string[] }>(
    entityId: string,
    action: TAction,
    genome?: Genome,
    traits: Record<string, number> = {},
  ): MoralJudgement<TAction> {
    const conscience = this.conscienceOf(entityId, genome, traits);
    return judgeMoralAction(conscience, action, this.code);
  }

  public stats(): { agents: number; avgAwareness: number; sinners: number } {
    let sum = 0;
    let sinners = 0;
    for (const conscience of this.consciences.values()) {
      sum += conscience.awareness;
      if (conscience.judgements.some((j) => j.guilt > 0.5 && !j.rationalized)) sinners++;
    }
    return { agents: this.consciences.size, avgAwareness: this.consciences.size > 0 ? sum / this.consciences.size : 0, sinners };
  }
}
