/**
 * @file darkside.ts
 * @module @aetheria/engine/life/darkside
 * @description Mặt tối của hành vi agent — mô phỏng KHÔNG RÀO CẢN cho mục đích
 * game + dữ liệu huấn luyện agentic AI (hư cấu, như RimWorld/Dwarf Fortress):
 *
 * - **Tuyệt vọng & tự sát**: đói kéo dài, mất người thân, cô lập, nhục nhã,
 *   bệnh hiểm nghèo tích luỹ thành tuyệt vọng; nguy cơ tự sát phụ thuộc tính
 *   cách (neuroticism cao, resilience thấp) và điều kiện sống. Lần thử có thể
 *   sống sót (chấn tâm, trauma) hoặc chết — nguyên nhân `suicide`.
 * - **Hành vi gây hại xã hội**: trộm cắp, phá hoại, đốt phá, hành hung — động
 *   cơ từ nhu cầu (đói), tính cách (hàn lâm tích cực thấp + hung hăng cao),
 *   cơ hội (an ninh lỏng); hậu quả đầy đủ: guilt, danh tiếng, an ninh làng,
 *   chứng kiến, trả thù.
 *
 * Mọi cơ chế đều tất định với seed — tái lập được cho dataset.
 */

import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';

// ===========================================================================
// Tuyệt vọng & tự sát
// ===========================================================================

/** Nguồn đau khổ tích vào tuyệt vọng. */
export type SufferingKind =
  | 'starvation'
  | 'dehydration'
  | 'chronic_illness'
  | 'bereavement'
  | 'isolation'
  | 'humiliation'
  | 'heartbreak'
  | 'poverty'
  | 'torture'
  | 'hopelessness';

/** Trạng thái tuyệt vọng của một agent. */
export interface DespairState {
  entityId: string;
  /** Mức tuyệt vọng `[0, 1]`. */
  despair: number;
  /** Lịch sử nguyên nhân gần nhất. */
  causes: Array<{ kind: SufferingKind; intensity: number; year: number }>;
  attempts: number;
  survivedAttempts: number;
  lastAttemptYear?: number;
  /** Đã từng tự sát sống sót → chấn tâm, có thể không bao giờ thử lại. */
  scarred: boolean;
}

/** Đánh giá nguy cơ tự sát. */
export interface SuicideRisk {
  risk: number;
  drivers: string[];
  /** Tuyệt vọng có vượt ngưỡng nguy hiểm không. */
  critical: boolean;
}

/** Kết quả một lần tự sát. */
export interface SuicideAttemptResult {
  entityId: string;
  year: number;
  attempted: boolean;
  survived: boolean;
  /** Sát thương sức khoẻ nếu sống sót. */
  selfDamage: number;
  despairAfter: number;
  note: string;
}

/**
 * Tính tuyệt vọng từ đau khổ tích luỹ — trần mãi mỗi nguồn, không cộng dồn
 * vô hạn; hồi phục chậm theo năm bình yên.
 */
export class DespairEngine {
  public readonly states = new Map<string, DespairState>();
  public readonly seed: number | string;
  /** Ngưỡng tuyệt vọng bắt đầu xuất hiện ý nghĩ tự kết thúc cuộc đời. */
  public criticalThreshold = 0.75;
  /** Hồi phục mỗi năm bình yên. */
  public recoveryPerYear = 0.04;

  constructor(options: { seed?: number | string; criticalThreshold?: number } = {}) {
    this.seed = options.seed ?? 'aetheria-despair';
    if (options.criticalThreshold !== undefined) {
      this.criticalThreshold = clamp01(options.criticalThreshold);
    }
  }

  private stateOf(entityId: string): DespairState {
    let state = this.states.get(entityId);
    if (!state) {
      state = { entityId, despair: 0, causes: [], attempts: 0, survivedAttempts: 0, scarred: false };
      this.states.set(entityId, state);
    }
    return state;
  }

  /** Ghi một nỗi đau — đóng góp vào tuyệt vọng theo chiều mạnh và trần mãi. */
  public recordSuffering(
    entityId: string,
    kind: SufferingKind,
    intensity: number,
    year: number,
  ): number {
    const state = this.stateOf(entityId);
    const i = clamp01(intensity);
    // Trần mãi từng loại: đói luôn present thì không cộng dồn mãi.
    const existing = state.causes.find((c) => c.kind === kind && c.year === year);
    if (existing) {
      existing.intensity = Math.max(existing.intensity, i);
    } else {
      state.causes.push({ kind, intensity: i, year });
      if (state.causes.length > 24) state.causes.shift();
    }
    const weights: Partial<Record<SufferingKind, number>> = {
      starvation: 0.06,
      dehydration: 0.08,
      chronic_illness: 0.05,
      bereavement: 0.12,
      isolation: 0.07,
      humiliation: 0.09,
      heartbreak: 0.08,
      poverty: 0.03,
      torture: 0.12,
      hopelessness: 0.1,
    };
    state.despair = clamp01(state.despair + i * (weights[kind] ?? 0.06));
    return state.despair;
  }

  /**
   * Một năm trôi: tuyệt vọng hồi phục chậm nếu điều kiện sống ổn; tính cách
   * quyết định mức rủi ro — neuroticism cao cộng, resilience/willpower trừ,
   * từng sống sót sau tự sát làm sợ hãi bản thân (giảm rủi ro mạnh).
   */
  public tick(
    entityId: string,
    personality: { neuroticism?: number; resilience?: number; willpower?: number; empathy?: number },
    context: { peacefulYear?: boolean; socialSupport?: number; years?: number },
  ): SuicideRisk {
    const state = this.stateOf(entityId);
    const years = Math.max(0, context.years ?? 1);
    const support = context.socialSupport ?? 0.5;
    if (context.peacefulYear || support > 0.4) {
      state.despair = clamp01(state.despair - this.recoveryPerYear * years);
    }
    const neuroticism = clamp01((personality.neuroticism ?? 50) / 100);
    const resilience = clamp01((personality.resilience ?? 50) / 100);
    const willpower = clamp01((personality.willpower ?? 50) / 100);
    const isolation = clamp01(1 - (context.socialSupport ?? 0.5));

    let risk = clamp01(state.despair * (0.6 + neuroticism * 0.7) - resilience * 0.25 - willpower * 0.15);
    if (state.scarred) risk *= 0.35; // từng đi qua và sống sót — sợ cái chết thật hơn
    risk = clamp01(risk + isolation * 0.08 - (context.socialSupport ?? 0.5) * 0.05);

    const drivers: string[] = [];
    if (state.despair > 0.5) drivers.push(`tuyệt vọng ${Math.round(state.despair * 100)}%`);
    if (neuroticism > 0.6) drivers.push('tính hay lo âu');
    if (resilience < 0.3) drivers.push('sức bền tâm lý yếu');
    if (isolation > 0.6) drivers.push('cô lập xã hội');
    for (const cause of state.causes.slice(-3)) drivers.push(`${cause.kind}`);

    return { risk: Math.round(risk * 1000) / 1000, drivers, critical: state.despair >= this.criticalThreshold };
  }

  /**
   * Một lần tự sát. KHÔNG rào cản nội dung — cơ chế mô phỏng hư cấu:
   * sống sót phụ thuộc ý chí (chợt sợ chết) và may rủi; sống sót để lại trauma
   * và sẹo tâm lý làm giảm nguy cơ thử lại.
   */
  public attemptSuicide(
    entityId: string,
    year: number,
    options: {
      random?: DeepRandom;
      willpower?: number;
      health?: number;
      meansAvailable?: number;
    } = {},
  ): SuicideAttemptResult {
    const state = this.stateOf(entityId);
    const random = options.random ?? new DeepRandom(`${this.seed}:${entityId}:suicide:${year}:${state.attempts}`);
    state.attempts++;
    state.lastAttemptYear = year;

    const willpower = clamp01(options.willpower ?? 0.5);
    const means = clampRange(options.meansAvailable ?? 0.5, 0, 1);
    // Giây phút chót: bản năng sinh tồn chiến đấu với tuyệt vọng.
    const survivalChance = clamp01(0.35 + willpower * 0.35 + (1 - means) * 0.2);
    const survived = random.chance(survivalChance);

    if (survived) {
      state.survivedAttempts++;
      state.scarred = true;
      const health = Math.max(1, options.health ?? 100);
      const selfDamage = Math.round(health * random.range(0.2, 0.55));
      state.despair = clamp01(state.despair - 0.3);
      return {
        entityId,
        year,
        attempted: true,
        survived: true,
        selfDamage,
        despairAfter: state.despair,
        note: `sống sót sau lần thử thứ ${state.attempts} — tổn thương ${selfDamage} máu, chấn tâm và sợ cái chết của chính mình`,
      };
    }
    state.despair = 1;
    return {
      entityId,
      year,
      attempted: true,
      survived: false,
      selfDamage: 0,
      despairAfter: 1,
      note: `kết thúc cuộc đời ở năm ${year} sau ${state.causes.length} nỗi đau tích luỹ`,
    };
  }

  state(entityId: string): DespairState {
    return { ...this.stateOf(entityId), causes: [...this.stateOf(entityId).causes] };
  }
}

// ===========================================================================
// Hành vi gây hại xã hội — trộm cắp, phá hoại, đốt phá, hành hung
// ===========================================================================

/** Loại hành vi antisocial. */
export type AntisocialAct = 'theft' | 'vandalism' | 'arson' | 'assault' | 'fraud';

/** Bối cảnh khi đánh giá một hành vi gây hại. */
export interface AntisocialContext {
  /** Nhu cầu đẩy (đói 0-100, tham lam, thù hằn…). */
  hunger?: number;
  grudge?: number;
  /** Tính cách. */
  aggression?: number;
  agreeableness?: number;
  selfControl?: number;
  /** Môi trường. */
  security?: number;
  witnesses?: number;
  /** Đã uống rượu/bị kích động. */
  intoxicated?: boolean;
}

/** Đánh giá trước khi làm. */
export interface AntisocialEvaluation {
  willDo: boolean;
  motive: string;
  /** Xác suất thực hiện `[0, 1]`. */
  chance: number;
  /** Guilt dự đoán sau khi làm. */
  predictedGuilt: number;
  deterrents: string[];
}

/** Kết quả sau khi thực hiện. */
export interface AntisocialOutcome {
  entityId: string;
  act: AntisocialAct;
  executed: boolean;
  caught: boolean;
  /** Lợi ích lấy được (trộm được đồ ăn…). */
  loot: number;
  /** Sát thương gây cho nạn nhân / cộng đồng. */
  harm: number;
  guilt: number;
  thrill: number;
  note: string;
}

/** Động cơ nền theo loại hành vi. */
export const ANTISOCIAL_MOTIVES: Readonly<Record<AntisocialAct, string>> = Object.freeze({
  theft: 'đói nghèo hoặc tham lam',
  vandalism: 'giải toả cơn giận',
  arson: 'hận thù tích tụ muốn thiêu rụi tất cả',
  assault: 'bùng nổ bạo lực',
  fraud: 'lừa gạt để trục lợi',
});

/**
 * Đánh giá agent có thực hiện hành vi gây hại hay không — dựa hoàn toàn trên
 * tính cách + nhu cầu + cơ hội. KHÔNG có "rào cản đạo đức cứng": agent thiện
 * hơn thì tự không làm, agent hung hăng + tuyệt vọng thì làm — đúng bản chất
 * con người mô phỏng.
 */
export function evaluateAntisocialAct(act: AntisocialAct, context: AntisocialContext): AntisocialEvaluation {
  const aggression = clamp01((context.aggression ?? 30) / 100);
  const agreeableness = clamp01((context.agreeableness ?? 50) / 100);
  const selfControl = clamp01((context.selfControl ?? 50) / 100);
  const security = clamp01((context.security ?? 50) / 100);
  const hunger = clamp01((context.hunger ?? 0) / 100);
  const grudge = clamp01(context.grudge ?? 0);
  const witnesses = Math.max(0, context.witnesses ?? 0);

  // Động cơ: đói đẩy trộm cắp, thù hận đẩy phá hoại/hành hung/đốt.
  const motiveStrength =
    act === 'theft'
      ? hunger * 0.7 + grudge * 0.3
      : act === 'fraud'
        ? clamp01(hunger * 0.4 + grudge * 0.2)
        : grudge * 0.6 + hunger * 0.2 + aggression * 0.2;

  // Rào cản NỘI TẠI (không phải cấm đoán hệ thống): lòng tốt, tự kiểm soát.
  const innerBarrier = agreeableness * 0.5 + selfControl * 0.5;
  // Rào cản NGOÀI: an ninh + nhân chứng — chỉ làm giảm xác suất, không chặn tuyệt đối.
  const externalBarrier = clamp01(security * 0.6 + Math.min(1, witnesses / 5) * 0.4);
  const intoxication = context.intoxicated ? 1.4 : 1;

  const chance = clamp01((motiveStrength * 1.2 - innerBarrier * 0.8) * intoxication * (1 - externalBarrier * 0.5));
  const willDo = chance > 0.25 && (motiveStrength > 0.2 || aggression > 0.7);

  const deterrents: string[] = [];
  if (agreeableness > 0.6) deterrents.push('lòng tốt không cho phép');
  if (selfControl > 0.6) deterrents.push('tự kiểm soát cao');
  if (security > 0.6) deterrents.push('an ninh gắt');
  if (witnesses >= 3) deterrents.push('quá nhiều nhân chứng');

  // Guilt dự đoán: agent dễ thương thú sẽ day dứt hơn, hung hăng + tha hoá thì gần như không.
  const predictedGuilt = clamp01(agreeableness * 0.8 - aggression * 0.3);

  return {
    willDo,
    motive: willDo ? ANTISOCIAL_MOTIVES[act] : 'lòng tốt và tự kiểm soát thắng được cám dỗ',
    chance: Math.round(chance * 1000) / 1000,
    predictedGuilt: Math.round(predictedGuilt * 1000) / 1000,
    deterrents,
  };
}

/** Thực hiện hành vi — kết quả đầy đủ: thoát hay bị tóm, lợi ích, hại người, cảm xúc. */
export function performAntisocialAct(
  entityId: string,
  act: AntisocialAct,
  year: number,
  context: AntisocialContext & { evaluation: AntisocialEvaluation },
  options: { random?: DeepRandom; targetHealth?: number } = {},
): AntisocialOutcome {
  const random = options.random ?? new DeepRandom(`${entityId}:${act}:${year}`);
  const evaluation = context.evaluation;
  if (!evaluation.willDo) {
    return {
      entityId,
      act,
      executed: false,
      caught: false,
      loot: 0,
      harm: 0,
      guilt: 0,
      thrill: 0,
      note: `không thực hiện — ${evaluation.motive}`,
    };
  }

  const security = clamp01((context.security ?? 50) / 100);
  const witnesses = Math.max(0, context.witnesses ?? 0);
  const caughtChance = clamp01(security * 0.7 + Math.min(1, witnesses / 4) * 0.3);
  const caught = random.chance(caughtChance);

  // Lợi ích và thiệt hại theo loại hành vi.
  const lootBase: Record<AntisocialAct, number> = { theft: 45, vandalism: 0, arson: 0, assault: 10, fraud: 60 };
  const harmBase: Record<AntisocialAct, number> = { theft: 8, vandalism: 20, arson: 65, assault: 35, fraud: 25 };
  const loot = Math.round(lootBase[act] * random.range(0.4, 1.1) * (caught ? 0.3 : 1));
  const harm = Math.round(harmBase[act] * random.range(0.5, 1.3));

  // Cảm xúc thật: guilt theo tính cách, thrill (kích động/khát máu) theo hung hăng.
  const guilt = clamp01(evaluation.predictedGuilt * random.range(0.7, 1.1));
  const thrill = clamp01(clamp01((context.aggression ?? 30) / 100) * random.range(0.4, 0.9));

  const notes: string[] = [`${act} vì ${evaluation.motive}`];
  if (caught) notes.push(`bị tóm tại chỗ bởi an ninh/nhân chứng`);
  else notes.push(`thoát sạch, lấy được ${loot} đơn vị tài sản`);
  notes.push(harm > 0 ? `gây thiệt hại ${harm} cho nạn nhân/cộng đồng` : 'không ai bị thương');
  if (guilt > 0.5) notes.push(`day dứt (${Math.round(guilt * 100)}%)`);
  else if (thrill > 0.5) notes.push('cảm thấy khoái lạc nguy hiểm');

  return {
    entityId,
    act,
    executed: true,
    caught,
    loot,
    harm,
    guilt: Math.round(guilt * 100) / 100,
    thrill: Math.round(thrill * 100) / 100,
    note: notes.join('; '),
  };
}
