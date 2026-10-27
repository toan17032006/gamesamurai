/**
 * @file thought.ts
 * @module @aetheria/engine/psychology/thought
 * @description Suy nghĩ nội tâm và nhận thức: niềm tin, suy diễn (deduction),
 * quy nạp (induction), suy luận ngược (abduction), lập kế hoạch, tự phản tỉnh,
 * siêu nhận thức, phản thực tế và suy nghĩ cuối đời. Nội dung suy nghĩ được
 * sinh từ niềm tin + nhu cầu + cảm xúc, không phải câu mẫu ngẫu nhiên.
 */

import { clamp01, clampRange } from '../deeplearning/random.js';

/** Loại suy nghĩ. */
export type ThoughtType =
  | 'perception'
  | 'memory'
  | 'deduction'
  | 'induction'
  | 'abduction'
  | 'planning'
  | 'reflection'
  | 'metacognition'
  | 'counterfactual'
  | 'moral'
  | 'social'
  | 'dying'
  | 'dream'
  | 'deliberation'
  | 'chain';

/** Một niềm tin. */
export interface Belief {
  id: string;
  proposition: string;
  confidence: number;
  source: string;
  lastUpdated: number;
  contradictions: string[];
}

/** Một suy nghĩ. */
export interface Thought {
  id: string;
  type: ThoughtType;
  content: string;
  confidence: number;
  premises: string[];
  timestamp: number;
  emotionalTone: number;
}

/** Luật suy diễn. */
export interface InferenceRule {
  id: string;
  antecedents: string[];
  conclusion: string;
  confidence: number;
  domain: string;
}

/** Hành động để lập kế hoạch. */
export interface PlanAction {
  id: string;
  name: string;
  preconditions: string[];
  effects: string[];
  cost: number;
  utility: number;
}

/** Kết quả lập kế hoạch. */
export interface ThoughtPlan {
  found: boolean;
  actions: string[];
  cost: number;
  utility: number;
  explanation: string;
}

/** Bối cảnh suy nghĩ. */
export interface ThinkContext {
  perception?: string;
  dominantNeed?: string;
  dominantEmotion?: string;
  mood?: number;
  stress?: number;
  memories?: string[];
  problem?: string;
  options?: string[];
}

/** Một lựa chọn để cân nhắc (deliberate). */
export interface DeliberationOption {
  id: string;
  label: string;
  /** Tiện ích kỳ vọng `[0, 1]`. */
  utility?: number;
  /** Rủi ro `[0, 1]`. */
  risk?: number;
  /** Chi phí `[0, 1]`. */
  cost?: number;
  /** Các tiền đề ủng hộ — được đối chiếu với niềm tin hiện có. */
  supports?: readonly string[];
}

/** Kết quả cân nhắc (deliberate). */
export interface DeliberationResult {
  chosenId: string;
  chosenLabel: string;
  /** Bảng xếp hạng giảm dần theo điểm. */
  ranked: Array<{ id: string; label: string; score: number }>;
  reasons: string[];
  thought: Thought;
}

/** Engine suy nghĩ cho một cá thể. */
export class ThoughtEngine {
  public readonly beliefs = new Map<string, Belief>();
  public readonly rules: InferenceRule[] = [];
  public readonly thoughts: Thought[] = [];
  public lastWords = '';
  private counter = 0;

  /** Học/ghi nhớ một niềm tin. */
  public learnBelief(proposition: string, confidence = 0.6, source = 'quan sát'): Belief {
    const id = `belief_${slug(proposition)}`;
    const existing = this.beliefs.get(id);
    if (existing) {
      existing.confidence = clamp01(Math.max(existing.confidence, confidence));
      existing.source = source;
      existing.lastUpdated = Date.now();
      return existing;
    }
    const belief: Belief = {
      id,
      proposition,
      confidence: clamp01(confidence),
      source,
      lastUpdated: Date.now(),
      contradictions: [],
    };
    this.beliefs.set(id, belief);
    return belief;
  }

  /** Đánh dấu hai niềm tin mâu thuẫn. */
  public contradict(a: string, b: string): void {
    const first = this.learnBelief(a, 0.5, 'mâu thuẫn');
    const second = this.learnBelief(b, 0.5, 'mâu thuẫn');
    if (!first.contradictions.includes(b)) first.contradictions.push(b);
    if (!second.contradictions.includes(a)) second.contradictions.push(a);
  }

  /** Thêm luật suy diễn. */
  public addRule(rule: InferenceRule): InferenceRule {
    this.rules.push(rule);
    return rule;
  }

  /** Suy diễn: áp dụng mọi luật có tiền đề đủ tin cậy. */
  public deduce(minConfidence = 0.5): Thought[] {
    const results: Thought[] = [];
    for (const rule of this.rules) {
      const antecedentBeliefs = rule.antecedents
        .map((proposition) => this.beliefs.get(`belief_${slug(proposition)}`))
        .filter((belief): belief is Belief => Boolean(belief));
      if (antecedentBeliefs.length !== rule.antecedents.length) continue;
      const weakest = Math.min(...antecedentBeliefs.map((belief) => belief.confidence));
      if (weakest < minConfidence) continue;
      const confidence = clamp01(weakest * rule.confidence);
      const content = `Từ ${rule.antecedents.join('; ')} suy ra ${rule.conclusion}.`;
      results.push(this.record('deduction', content, confidence, rule.antecedents));
    }
    return results;
  }

  /** Quy nạp: khái quát hoá từ các quan sát cùng dấu hiệu. */
  public induce(observation: string, examples: readonly string[], hypothesis?: string): Thought {
    const support = examples.length;
    const confidence = clamp01(1 - Math.exp(-support / 5));
    const conclusion = hypothesis ?? `Mọi trường hợp quan sát đều dẫn tới: ${observation}`;
    return this.record(
      'induction',
      `Qua ${support} quan sát (${examples.slice(0, 3).join(', ')}${support > 3 ? '…' : ''}), ta nghi ngờ ${conclusion}.`,
      confidence,
      examples,
    );
  }

  /** Suy luận ngược: chọn nguyên nhân khả dĩ nhất từ hậu quả. */
  public abduce(
    observation: string,
    causes: ReadonlyArray<{ id: string; prior: number; likelihood: number; explanation?: string }>,
  ): Thought {
    if (causes.length === 0) {
      return this.record('abduction', `Quan sát "${observation}" nhưng chưa biết nguyên nhân.`, 0.1, [observation]);
    }
    let best = causes[0];
    let bestScore = 0;
    for (const cause of causes) {
      const score = clamp01(cause.prior) * clamp01(cause.likelihood);
      if (score > bestScore) {
        bestScore = score;
        best = cause;
      }
    }
    return this.record(
      'abduction',
      `Quan sát "${observation}" khả năng cao do ${best.explanation ?? best.id}.`,
      clamp01(bestScore / (bestScore + 0.2)),
      [observation],
    );
  }

  /** Lập kế hoạch tiến tới mục tiêu bằng tìm kiếm trạng thái. */
  public plan(goal: string, actions: readonly PlanAction[], maxSteps = 8): ThoughtPlan {
    const start = new Set<string>();
    for (const belief of this.beliefs.values()) {
      if (belief.confidence >= 0.5) start.add(belief.proposition);
    }
    const queue: Array<{ state: Set<string>; plan: PlanAction[]; cost: number; utility: number }> = [
      { state: start, plan: [], cost: 0, utility: 0 },
    ];
    const visited = new Map<string, number>();
    let best: { plan: PlanAction[]; cost: number; utility: number } | null = null;

    while (queue.length > 0) {
      queue.sort((a, b) => b.utility - b.cost - (a.utility - a.cost));
      const current = queue.shift();
      if (!current) break;
      if (current.state.has(goal)) {
        if (!best || current.utility - current.cost > best.utility - best.cost) {
          best = { plan: current.plan, cost: current.cost, utility: current.utility };
        }
        continue;
      }
      if (current.plan.length >= maxSteps) continue;
      const key = [...current.state].sort().join('|');
      if ((visited.get(key) ?? Infinity) <= current.cost) continue;
      visited.set(key, current.cost);

      for (const action of actions) {
        if (!action.preconditions.every((condition) => current.state.has(condition))) continue;
        if (current.plan.some((chosen) => chosen.id === action.id)) continue;
        const next = new Set(current.state);
        for (const effect of action.effects) next.add(effect);
        queue.push({
          state: next,
          plan: [...current.plan, action],
          cost: current.cost + Math.max(0, action.cost),
          utility: current.utility + Math.max(0, action.utility),
        });
      }
    }

    if (!best) {
      return {
        found: false,
        actions: [],
        cost: Infinity,
        utility: 0,
        explanation: `Không tìm được chuỗi hành động dẫn tới "${goal}".`,
      };
    }
    const thought = this.record(
      'planning',
      `Để đạt "${goal}", ta sẽ ${best.plan.map((action) => action.name).join(' → ')}.`,
      clamp01(0.5 + best.plan.length * 0.05),
      best.plan.map((action) => action.id),
    );
    return {
      found: true,
      actions: best.plan.map((action) => action.id),
      cost: best.cost,
      utility: best.utility,
      explanation: thought.content,
    };
  }

  /** Tự phản tỉnh: thống kê niềm tin, mâu thuẫn, tri thức. */
  public reflect(): Thought {
    const beliefs = [...this.beliefs.values()];
    if (beliefs.length === 0) {
      return this.record('reflection', 'Ta chưa biết gì chắc chắn; cần quan sát thêm.', 0.2, []);
    }
    const average = beliefs.reduce((sum, belief) => sum + belief.confidence, 0) / beliefs.length;
    const contradictions = beliefs.reduce((sum, belief) => sum + belief.contradictions.length, 0) / 2;
    const weakest = beliefs.reduce((min, belief) => Math.min(min, belief.confidence), 1);
    return this.record(
      'reflection',
      `Ta có ${beliefs.length} niềm tin, độ tin cậy trung bình ${(average * 100).toFixed(0)}%, ` +
        `${contradictions} mâu thuẫn; điều yếu nhất chỉ ${(weakest * 100).toFixed(0)}%.`,
      clamp01(average * (1 - contradictions * 0.05)),
      beliefs.map((belief) => belief.proposition),
    );
  }

  /** Siêu nhận thức: đánh giá độ hiệu chuẩn của bản thân. */
  public metacognize(actualAccuracy = 0.6): Thought {
    const beliefs = [...this.beliefs.values()];
    const confidence = beliefs.length > 0
      ? beliefs.reduce((sum, belief) => sum + belief.confidence, 0) / beliefs.length
      : 0;
    const gap = confidence - actualAccuracy;
    const calibration = gap > 0.15 ? 'quá tự tin' : gap < -0.15 ? 'quá thiếu tự tin' : 'hiệu chuẩn tốt';
    return this.record(
      'metacognition',
      `Ta ${calibration}: tin cậy ${(confidence * 100).toFixed(0)}% trong khi thực tế đúng ${(actualAccuracy * 100).toFixed(0)}%.`,
      clamp01(1 - Math.abs(gap)),
      beliefs.map((belief) => belief.proposition),
    );
  }

  /** Suy nghĩ phản thực tế: nếu đã chọn khác thì sao. */
  public counterfactual(chosen: string, alternative: string, consequence: string): Thought {
    return this.record(
      'counterfactual',
      `Nếu thay vì "${chosen}" ta chọn "${alternative}", có lẽ ${consequence}.`,
      0.55,
      [chosen, alternative],
    );
  }

  /** Suy nghĩ đạo đức về một hành động. */
  public moral(judgement: string, reason: string, confidence = 0.6): Thought {
    return this.record('moral', `Về "${judgement}": ${reason}`, confidence, [judgement, reason]);
  }

  /** Độc thoại nội tâm từ bối cảnh. */
  public think(context: ThinkContext): Thought {
    const parts: string[] = [];
    if (context.perception) parts.push(`Ta thấy ${context.perception}`);
    if (context.dominantNeed) parts.push(`nhu cầu "${context.dominantNeed}" thôi thúc`);
    if (context.dominantEmotion) parts.push(`lòng đang ${context.dominantEmotion}`);
    if (typeof context.mood === 'number') parts.push(context.mood >= 0 ? 'tâm trạng khá tốt' : 'tâm trạng nặng nề');
    if (typeof context.stress === 'number' && context.stress > 60) parts.push('căng thẳng cao');
    if (context.problem) parts.push(`vấn đề: ${context.problem}`);
    if (context.memories && context.memories.length > 0) parts.push(`nhớ ${context.memories[0]}`);
    if (context.options && context.options.length > 0) parts.push(`có thể chọn ${context.options.join(' hoặc ')}`);

    const content = parts.length > 0 ? `${parts.join('; ')}.` : 'Ta lặng thinh quan sát thế giới.';
    const confidence = clamp01(0.4 + (context.perception ? 0.2 : 0) + (context.problem ? 0.1 : 0));
    return this.record('reflection', content, confidence, []);
  }

  /** Suy nghĩ cuối đời, dùng cho di sản và lời trăn trối. */
  public dyingThought(cause: string, legacy: readonly string[] = [], ageYears = 0): Thought {
    const legacyText = legacy.length > 0 ? `Ta để lại ${legacy.join(', ')}.` : 'Ta ra đi không mang theo gì.';
    const content = `Ở tuổi ${Math.round(ageYears)}, trước ${cause}, ta hiểu rằng ${legacyText}`;
    this.lastWords = content;
    return this.record('dying', content, 0.9, legacy);
  }

  /** Mơ: tái tổ hợp ký ức và niềm tin thành suy nghĩ mới. */
  public dream(memories: readonly string[], seed = 1): Thought {
    if (memories.length === 0) return this.record('dream', 'Giấc mơ trống rỗng.', 0.2, []);
    const first = memories[seed % memories.length];
    const second = memories[(seed * 7 + 3) % memories.length];
    const content = `Trong mơ, ${first} hoà quyện với ${second}, gợi ra một điều chưa từng nghĩ tới.`;
    return this.record('dream', content, 0.35, [first, second]);
  }

  /** Giải thích quyết định bằng các lý do đã có. */
  public explainDecision(action: string, reasons: readonly string[]): Thought {
    const content = reasons.length > 0
      ? `Ta chọn "${action}" vì ${reasons.join('; ')}.`
      : `Ta chọn "${action}" theo bản năng.`;
    return this.record('reflection', content, clamp01(0.5 + reasons.length * 0.08), reasons);
  }

  /** Các niềm tin mâu thuẫn cần giải quyết. */
  public unresolvedContradictions(): Array<[Belief, Belief]> {
    const pairs: Array<[Belief, Belief]> = [];
    for (const belief of this.beliefs.values()) {
      for (const other of belief.contradictions) {
        const target = this.beliefs.get(`belief_${slug(other)}`);
        if (target && belief.id < target.id) pairs.push([belief, target]);
      }
    }
    return pairs;
  }

  /** Lịch sử suy nghĩ gần nhất. */
  public recent(limit = 10): Thought[] {
    return this.thoughts.slice(-Math.max(0, limit));
  }

  // ==========================================================================
  // Deep thinking: cân nhắc đa tiêu chí và chuỗi suy luận nhiều bước
  // ==========================================================================

  /**
   * Cân nhắc sâu: chấm điểm mọi lựa chọn theo 5 trục — tiện ích, rủi ro, chi
   * phí, mức ủng hộ từ niềm tin đã có và trạng thái cảm xúc (stress cao làm
   * giảm trọng số tiện ích, tăng trọng số rủi ro). Trả lựa chọn + lý do.
   */
  public deliberate(
    options: readonly DeliberationOption[],
    context: { stress?: number; mood?: number } = {},
  ): DeliberationResult {
    const stress = clamp01((context.stress ?? 30) / 100);
    const mood = context.mood ?? 0;
    // Stress cao → trọng số rủi ro tăng, tiện ích giảm (tâm lý sợ mất hơn thích được).
    const wUtility = 0.45 - stress * 0.15;
    const wRisk = 0.25 + stress * 0.15;
    const wCost = 0.2;
    const wBelief = 0.1;

    const ranked = options.map((option) => {
      const utility = clamp01(option.utility ?? 0.5);
      const risk = clamp01(option.risk ?? 0.2);
      const cost = clamp01(option.cost ?? 0.3);
      let beliefSupport = 0.5;
      const reasons: string[] = [];
      if (option.supports && option.supports.length > 0) {
        let total = 0;
        let count = 0;
        for (const premise of option.supports) {
          const belief = this.beliefs.get(`belief_${slug(premise)}`);
          if (belief) {
            total += belief.confidence;
            count++;
            if (belief.confidence >= 0.6) reasons.push(belief.proposition);
          }
        }
        beliefSupport = count > 0 ? total / count : 0.35;
      }
      const score = clamp01(
        wUtility * utility + wRisk * (1 - risk) + wCost * (1 - cost) + wBelief * beliefSupport,
      );
      // Tâm trạng tốt nghiêng về lựa chọn tiện ích cao; tâm trạng xấu nghiêng an toàn.
      const moodBias = mood >= 0 ? utility * 0.02 : (1 - risk) * 0.02;
      return { id: option.id, label: option.label, score: clamp01(score + moodBias), reasons };
    });
    ranked.sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const runnerUp = ranked[1];
    const margin = runnerUp ? best.score - runnerUp.score : best.score;
    const confidence = clamp01(0.4 + margin * 1.5);
    const content = runnerUp
      ? `Cân nhắc ${ranked.length} lựa chọn, ta chọn "${best.label}" hơn "${runnerUp.label}" (điểm ${best.score.toFixed(2)} vs ${runnerUp.score.toFixed(2)}).`
      : `Chỉ có một lựa chọn khả dĩ: "${best.label}".`;
    const thought = this.record('deliberation', content, confidence, best.reasons);
    return {
      chosenId: best.id,
      chosenLabel: best.label,
      ranked,
      reasons: best.reasons,
      thought,
    };
  }

  /**
   * Chuỗi suy luận nhiều bước: mỗi bước nhận tiền đề và kết luận, độ tin cậy
   * tích luỹ nhân dồn — kết luận càng xa dữ kiện gốc càng kém tin cậy.
   */
  public chainOfThought(
    problem: string,
    steps: ReadonlyArray<{ premise: string; inference: string }>,
    options: { learn?: boolean; source?: string } = {},
  ): Thought {
    if (steps.length === 0) {
      return this.record('chain', `Vấn đề "${problem}" chưa đủ dữ kiện để suy luận.`, 0.2, [problem]);
    }
    let confidence = 0.85;
    const premises: string[] = [problem];
    for (const step of steps) {
      const premiseBelief = this.beliefs.get(`belief_${slug(step.premise)}`);
      const premiseConfidence = premiseBelief?.confidence ?? 0.6;
      confidence *= premiseConfidence;
      premises.push(step.premise);
      if (options.learn ?? true) {
        this.learnBelief(step.inference, clamp01(confidence * 0.95), options.source ?? 'chuỗi suy luận');
      }
    }
    const finalInference = steps[steps.length - 1].inference;
    const content =
      `Vấn đề "${problem}": ` +
      steps.map((step) => `nếu ${step.premise} thì ${step.inference}`).join('; ') +
      ` — suy ra ${finalInference} (tin cậy ${(confidence * 100).toFixed(0)}%).`;
    return this.record('chain', content, clamp01(confidence), premises);
  }

  private record(
    type: ThoughtType,
    content: string,
    confidence: number,
    premises: readonly string[],
  ): Thought {
    const thought: Thought = {
      id: `thought_${++this.counter}`,
      type,
      content,
      confidence: clamp01(confidence),
      premises: [...premises],
      timestamp: Date.now(),
      emotionalTone: clampRange(confidence, -1, 1),
    };
    this.thoughts.push(thought);
    if (this.thoughts.length > 500) this.thoughts.shift();
    return thought;
  }
}

/** Chuẩn hoá chuỗi thành id (xử lý đúng chữ đ/Đ tiếng Việt mà NFD không tách được). */
function slug(text: string): string {
  return text
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

/** Tạo nhanh engine suy nghĩ. */
export function createThoughtEngine(): ThoughtEngine {
  return new ThoughtEngine();
}
