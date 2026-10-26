/**
 * @file status-effects.ts
 * @module @aetheria/engine/objects/status-effects
 * @description Buffs, debuffs, crowd control, periodic ticks, and animation state management.
 */

export type StatusType = 'buff' | 'debuff' | 'neutral' | 'passive';

export type CrowdControlType =
  | 'stun'
  | 'freeze'
  | 'silence'
  | 'root'
  | 'disarm'
  | 'fear'
  | 'charm'
  | 'knockback'
  | 'slow';

export interface StatusModifier<TValue = any> {
  statKey: string;
  type: 'flat' | 'percent';
  value: TValue;
}

export interface PeriodicTickEffect<TTarget = any> {
  interval: number; // in seconds
  elapsed: number;
  onTick: (target: TTarget, effect: StatusEffect<any>) => void;
}

/**
 * Generic Status Effect base class with stack management, duration decay, and tick intervals.
 */
export class StatusEffect<TModifier = StatusModifier> {
  public readonly id: string;
  public name: string;
  public type: StatusType;
  public duration: number; // in seconds, <= 0 means permanent
  public elapsed = 0;
  public stacks = 1;
  public maxStacks = 1;
  public isDispellable = true;
  public modifiers: TModifier[] = [];
  public periodicTick?: PeriodicTickEffect;

  constructor(
    id: string,
    name: string,
    type: StatusType = 'buff',
    duration = 10,
    maxStacks = 1,
    modifiers: TModifier[] = []
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.duration = duration;
    this.maxStacks = Math.max(1, maxStacks);
    this.modifiers = modifiers;
  }

  public get isExpired(): boolean {
    return this.duration > 0 && this.elapsed >= this.duration;
  }

  public get remainingTime(): number {
    return this.duration > 0 ? Math.max(0, this.duration - this.elapsed) : Infinity;
  }

  public addStack(count = 1): number {
    this.stacks = Math.min(this.maxStacks, this.stacks + count);
    this.refresh();
    return this.stacks;
  }

  public refresh(): void {
    this.elapsed = 0;
  }

  public tick(dt: number, target?: any): void {
    if (this.duration > 0) {
      this.elapsed += dt;
    }

    if (this.periodicTick) {
      this.periodicTick.elapsed += dt;
      if (this.periodicTick.elapsed >= this.periodicTick.interval) {
        this.periodicTick.elapsed -= this.periodicTick.interval;
        this.periodicTick.onTick(target, this);
      }
    }
  }
}

/**
 * Specialized Buff providing positive stat enhancement.
 */
export class Buff<TValue = number> extends StatusEffect<StatusModifier<TValue>> {
  constructor(
    id: string,
    name: string,
    statKey: string,
    bonusValue: TValue,
    duration = 15,
    isPercent = false
  ) {
    super(id, name, 'buff', duration, 1, [
      {
        statKey,
        type: isPercent ? 'percent' : 'flat',
        value: bonusValue,
      },
    ]);
  }
}

/**
 * Specialized Debuff inflicting damage over time (DoT) or stat suppression.
 */
export class Debuff<TType = string> extends StatusEffect<StatusModifier> {
  public debuffType: TType;

  constructor(
    id: string,
    name: string,
    debuffType: TType,
    duration = 10,
    dotDamagePerSec = 0,
    onDamageTick?: (target: any, damage: number) => void
  ) {
    super(id, name, 'debuff', duration);
    this.debuffType = debuffType;

    if (dotDamagePerSec > 0) {
      this.periodicTick = {
        interval: 1.0,
        elapsed: 0,
        onTick: (target) => {
          if (onDamageTick) {
            onDamageTick(target, dotDamagePerSec);
          } else if (target?.health?.damage) {
            target.health.damage(dotDamagePerSec, name);
          }
        },
      };
    }
  }
}

/**
 * Crowd Control effect restricting movement, casting, or actions.
 */
export class CrowdControl<TCCKind extends CrowdControlType = CrowdControlType> extends StatusEffect {
  public ccKind: TCCKind;
  public preventsMovement: boolean;
  public preventsAttacking: boolean;
  public preventsCasting: boolean;
  public breakOnDamageThreshold?: number;
  private _accumulatedDamage = 0;

  constructor(
    id: string,
    name: string,
    ccKind: TCCKind,
    duration = 3,
    options?: {
      preventsMovement?: boolean;
      preventsAttacking?: boolean;
      preventsCasting?: boolean;
      breakOnDamageThreshold?: number;
    }
  ) {
    super(id, name, 'debuff', duration);
    this.ccKind = ccKind;
    this.preventsMovement = options?.preventsMovement ?? (ccKind === 'stun' || ccKind === 'freeze' || ccKind === 'root');
    this.preventsAttacking = options?.preventsAttacking ?? (ccKind === 'stun' || ccKind === 'freeze' || ccKind === 'disarm');
    this.preventsCasting = options?.preventsCasting ?? (ccKind === 'stun' || ccKind === 'freeze' || ccKind === 'silence');
    this.breakOnDamageThreshold = options?.breakOnDamageThreshold;
  }

  public notifyDamage(amount: number): boolean {
    if (this.breakOnDamageThreshold !== undefined) {
      this._accumulatedDamage += amount;
      if (this._accumulatedDamage >= this.breakOnDamageThreshold) {
        this.elapsed = this.duration; // Break effect immediately
        return true;
      }
    }
    return false;
  }
}

/**
 * Status Container component managing all active effects on an entity.
 */
export class StatusContainer {
  private _effects: Map<string, StatusEffect> = new Map();

  public applyStatus(effect: StatusEffect): void {
    const existing = this._effects.get(effect.id);
    if (existing) {
      existing.addStack();
    } else {
      this._effects.set(effect.id, effect);
    }
  }

  public removeStatus(id: string): boolean {
    return this._effects.delete(id);
  }

  public hasStatus(id: string): boolean {
    return this._effects.has(id);
  }

  public getStatus(id: string): StatusEffect | undefined {
    return this._effects.get(id);
  }

  public getAll(): StatusEffect[] {
    return Array.from(this._effects.values());
  }

  public isUnderCC(ccKind?: CrowdControlType): boolean {
    for (const eff of this._effects.values()) {
      if (eff instanceof CrowdControl) {
        if (!ccKind || eff.ccKind === ccKind) {
          return true;
        }
      }
    }
    return false;
  }

  public canMove(): boolean {
    for (const eff of this._effects.values()) {
      if (eff instanceof CrowdControl && eff.preventsMovement) {
        return false;
      }
    }
    return true;
  }

  public canAttack(): boolean {
    for (const eff of this._effects.values()) {
      if (eff instanceof CrowdControl && eff.preventsAttacking) {
        return false;
      }
    }
    return true;
  }

  public canCast(): boolean {
    for (const eff of this._effects.values()) {
      if (eff instanceof CrowdControl && eff.preventsCasting) {
        return false;
      }
    }
    return true;
  }

  public dispel(type: StatusType, maxCount = 1): number {
    let dispelled = 0;
    for (const [id, eff] of this._effects.entries()) {
      if (eff.type === type && eff.isDispellable) {
        this._effects.delete(id);
        dispelled++;
        if (dispelled >= maxCount) break;
      }
    }
    return dispelled;
  }

  public tick(dt: number, target?: any): void {
    for (const [id, eff] of this._effects.entries()) {
      eff.tick(dt, target);
      if (eff.isExpired) {
        this._effects.delete(id);
      }
    }
  }

  public notifyDamage(amount: number): void {
    for (const eff of this._effects.values()) {
      if (eff instanceof CrowdControl) {
        eff.notifyDamage(amount);
      }
    }
  }
}

/**
 * Animation State Controller managing state machine transitions and parameters.
 */
export class AnimationStateController {
  public currentState = 'idle';
  private _parameters: Map<string, number | boolean | string> = new Map();
  private _transitions: {
    from: string;
    to: string;
    condition: (params: Map<string, any>) => boolean;
    fadeDuration: number;
  }[] = [];
  public currentFadeTime = 0.2;

  public setFloat(param: string, value: number): void {
    this._parameters.set(param, value);
    this._evaluateTransitions();
  }

  public setBool(param: string, value: boolean): void {
    this._parameters.set(param, value);
    this._evaluateTransitions();
  }

  public setTrigger(param: string): void {
    this._parameters.set(param, true);
    this._evaluateTransitions();
    this._parameters.set(param, false); // Triggers automatically reset
  }

  public addTransition(
    from: string,
    to: string,
    condition: (params: Map<string, any>) => boolean,
    fadeDuration = 0.2
  ): void {
    this._transitions.push({ from, to, condition, fadeDuration });
  }

  private _evaluateTransitions(): void {
    for (const t of this._transitions) {
      if ((t.from === '*' || t.from === this.currentState) && t.condition(this._parameters)) {
        this.currentState = t.to;
        this.currentFadeTime = t.fadeDuration;
        break;
      }
    }
  }
}
