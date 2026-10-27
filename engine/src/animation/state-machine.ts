/**
 * @file state-machine.ts
 * @module @aetheria/engine/animation/state-machine
 * @description Máy trạng thái hoạt ảnh (animation controller): state tham chiếu
 * clip, transition có điều kiện (số/bool/trigger) + crossfade duration + exit
 * time. `update(dt)` tiến máy theo tham số do gameplay set, trả state hiện tại
 * và tiến độ crossfade để tầng render/player trộn pose.
 */

import { clampRange } from '../deeplearning/random.js';
import type {
  AnimationStateDefinition,
  TransitionCondition,
  TransitionDefinition,
} from './types.js';

/** Trạng thái runtime của một state đang chơi. */
export interface ActiveStateSnapshot {
  state: string;
  clipName: string;
  /** Thời gian đã chơi trong state (giây, đã nhân speed). */
  localTime: number;
  /** Tiến độ clip nguồn (0..1, có tính loop). */
  normalizedTime: number;
  /** Crossfade đang diễn ra: state đích và alpha (0..1). */
  transition: { to: string; alpha: number } | null;
}

/** Cấu hình máy trạng thái. */
export interface AnimationStateMachineConfig {
  states: readonly AnimationStateDefinition[];
  transitions: readonly TransitionDefinition[];
  /** State khởi đầu. */
  initialState: string;
  /** Mặc định các state lặp (idle/walk...); state lẻ có thể override. */
  defaultLoop?: boolean;
}

/**
 * Máy trạng thái hoạt ảnh.
 *
 * Dùng: `setParameter('speed', 5)`, `setTrigger('attack')`, rồi mỗi frame gọi
 * `update(dt)`; kết quả cho biết đang chơi state nào, crossfade sang state nào
 * và alpha trộn — tầng render đọc để blend pose.
 */
export class AnimationStateMachine {
  public readonly states = new Map<string, AnimationStateDefinition>();
  private readonly transitions: TransitionDefinition[] = [];
  private readonly parameters = new Map<string, number | boolean>();
  private readonly triggers = new Set<string>();
  private currentState: string;
  private localTime = 0;
  /** Crossfade đang chạy: state đích + thời gian đã trôi. */
  private activeTransition: { to: string; elapsed: number; duration: number } | null = null;
  private readonly defaultLoop: boolean;

  constructor(config: AnimationStateMachineConfig) {
    if (config.states.length === 0) throw new RangeError('State machine cần ít nhất một state');
    for (const state of config.states) {
      this.states.set(state.name, { ...state });
    }
    if (!this.states.has(config.initialState)) {
      throw new RangeError(`State khởi đầu "${config.initialState}" không tồn tại`);
    }
    const seen = new Set<string>();
    for (const transition of config.transitions) {
      const key = `${transition.from}->${transition.to}`;
      if (seen.has(key)) throw new RangeError(`Transition trùng: ${key}`);
      if (!this.states.has(transition.from) || !this.states.has(transition.to)) {
        throw new RangeError(`Transition nối state không tồn tại: ${key}`);
      }
      seen.add(key);
      this.transitions.push({ ...transition });
    }
    this.currentState = config.initialState;
    this.defaultLoop = config.defaultLoop ?? true;
  }

  /** State đang chơi. */
  public get currentStateName(): string {
    return this.currentState;
  }

  /** Tham số hiện tại (bản copy). */
  public get parametersSnapshot(): Record<string, number | boolean> {
    return Object.fromEntries(this.parameters);
  }

  /** Đặt tham số số/bool dùng cho điều kiện. */
  public setParameter(name: string, value: number | boolean): void {
    this.parameters.set(name, value);
  }

  /** Đọc tham số; `undefined` nếu chưa set. */
  public getParameter(name: string): number | boolean | undefined {
    return this.parameters.get(name);
  }

  /** Kích hoạt trigger (điều kiện một-lần, tự xóa sau khi dùng). */
  public setTrigger(name: string): void {
    this.triggers.add(name);
  }

  /** Xóa mọi trigger (cuối frame nếu tầng render muốn tự quản). */
  public clearTriggers(): void {
    this.triggers.clear();
  }

  /** Danh sách transition khả dụng từ state hiện tại (phục vụ debug/UI). */
  public availableTransitions(): TransitionDefinition[] {
    return this.transitions.filter((transition) => transition.from === this.currentState);
  }

  /** Ép chuyển state (bỏ điều kiện) — dùng cho gameplaycan thiệp trực tiếp. */
  public forceTransition(to: string, duration = 0.2): void {
    if (!this.states.has(to)) throw new RangeError(`State "${to}" không tồn tại`);
    this.activeTransition = { to, elapsed: 0, duration: Math.max(0, duration) };
  }

  /**
   * Tiến máy một bước thời gian.
   *
   * @param dt Bước thời gian (giây).
   * @param clipDurations Độ dài clip theo tên (player cung cấp).
   * @returns Bản ghi state hiện tại + crossfade để blend pose.
   */
  public update(
    dt: number,
    clipDurations: Readonly<Record<string, number>>,
  ): ActiveStateSnapshot {
    this.evaluateTransitions(clipDurations);
    const definition = this.states.get(this.currentState);
    const duration = clipDurations[this.currentState] ?? 0;
    const speed = definition?.speed ?? 1;
    const loop = definition?.loop ?? this.defaultLoop;
    this.localTime += Math.max(0, dt) * speed;
    let normalized = duration > 1e-9 ? this.localTime / duration : 0;
    if (loop && duration > 1e-9) {
      normalized = normalized % 1;
      this.localTime = normalized * duration;
    } else {
      normalized = clampRange(normalized, 0, 1);
    }

    let transitionSnapshot: ActiveStateSnapshot['transition'] = null;
    if (this.activeTransition) {
      this.activeTransition.elapsed += Math.max(0, dt);
      const alpha = clampRange(this.activeTransition.elapsed / Math.max(this.activeTransition.duration, 1e-9), 0, 1);
      transitionSnapshot = { to: this.activeTransition.to, alpha };
      if (alpha >= 1) {
        this.currentState = this.activeTransition.to;
        this.localTime = 0;
        this.activeTransition = null;
        transitionSnapshot = null;
      }
    }

    return {
      state: this.currentState,
      clipName: definition?.clipName ?? this.currentState,
      localTime: this.localTime,
      normalizedTime: normalized,
      transition: transitionSnapshot,
    };
  }

  /** Duyệt transition từ state hiện tại, chọn cái đầu tiên thỏa điều kiện. */
  private evaluateTransitions(clipDurations: Readonly<Record<string, number>>): void {
    if (this.activeTransition && !this.transitions.some((item) => item.canInterrupt)) return;
    const currentDuration = clipDurations[this.currentState] ?? 0;
    const normalized = currentDuration > 1e-9 ? this.localTime / currentDuration : 0;
    for (const transition of this.availableTransitions()) {
      if (transition.exitTime !== undefined && normalized < transition.exitTime) continue;
      if (!this.satisfies(transition.conditions ?? [])) continue;
      this.activeTransition = {
        to: transition.to,
        elapsed: 0,
        duration: Math.max(0, transition.duration),
      };
      this.consumeTriggers(transition.conditions ?? []);
      return;
    }
  }

  /** Kiểm tra mọi điều kiện (AND logic). */
  private satisfies(conditions: readonly TransitionCondition[]): boolean {
    return conditions.every((condition) => {
      if (condition.comparison === 'trigger') return this.triggers.has(condition.parameter);
      const value = this.parameters.get(condition.parameter);
      if (typeof condition.value === 'boolean') {
        const boolValue = typeof value === 'boolean' ? value : Boolean(value);
        return condition.comparison === 'equals'
          ? boolValue === condition.value
          : boolValue !== condition.value;
      }
      const numberValue = typeof value === 'number' ? value : 0;
      const target = typeof condition.value === 'number' ? condition.value : 0;
      switch (condition.comparison) {
        case 'equals': return numberValue === target;
        case 'notEquals': return numberValue !== target;
        case 'greater': return numberValue > target;
        case 'less': return numberValue < target;
        default: return false;
      }
    });
  }

  /** Xóa trigger đã dùng bởi transition vừa kích hoạt. */
  private consumeTriggers(conditions: readonly TransitionCondition[]): void {
    for (const condition of conditions) {
      if (condition.comparison === 'trigger') this.triggers.delete(condition.parameter);
    }
  }
}

/** Builder: dựng machine từ cấu hình gọn (object literal). */
export function createStateMachine(config: AnimationStateMachineConfig): AnimationStateMachine {
  return new AnimationStateMachine(config);
}

/** Xây điều kiện đơn giản nhanh: `greater('speed', 4)`... */
export function greater(parameter: string, value: number): TransitionCondition {
  return { parameter, comparison: 'greater', value };
}

export function less(parameter: string, value: number): TransitionCondition {
  return { parameter, comparison: 'less', value };
}

export function equals(parameter: string, value: number | boolean): TransitionCondition {
  return { parameter, comparison: 'equals', value };
}

export function trigger(parameter: string): TransitionCondition {
  return { parameter, comparison: 'trigger' };
}
