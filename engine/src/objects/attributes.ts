/**
 * @file attributes.ts
 * @module @aetheria/engine/objects/attributes
 * @description Generic attribute, resource gauge, and stat pool systems for RPG/Action entities.
 */

// ============================================================================
// Interfaces & Types
// ============================================================================

export type StatModifierType = 'flat' | 'percent_add' | 'percent_mult';

export interface StatModifier<TValue = number> {
  id: string;
  name?: string;
  type: StatModifierType;
  value: TValue;
  duration?: number; // In seconds, undefined = permanent
  elapsed?: number;
}

export interface AttributeDefinition<TKey extends string = string> {
  key: TKey;
  baseValue: number;
  minValue?: number;
  maxValue?: number;
  description?: string;
}

export interface ResourceRegenConfig<T = number> {
  ratePerSecond: T;
  enabled: boolean;
  combatMultiplier?: number;
  delayAfterExertion?: number;
}

export interface IHealthPool<TRegen = number> {
  readonly current: number;
  readonly max: number;
  readonly percent: number;
  readonly isDead: boolean;
  damage(amount: number, source?: string): number;
  heal(amount: number, source?: string): number;
  kill(): void;
  revive(percent?: number): void;
  setRegen(config: ResourceRegenConfig<TRegen>): void;
}

export interface IManaPool<TCost = number> {
  readonly current: number;
  readonly max: number;
  readonly percent: number;
  consume(amount: TCost): boolean;
  restore(amount: number): void;
  canCast(amount: TCost): boolean;
}

export interface IEnergyPool<TExertion = number> {
  readonly current: number;
  readonly max: number;
  readonly isExhausted: boolean;
  expend(amount: TExertion): boolean;
  recover(amount: number): void;
}

// ============================================================================
// Concrete Generic Classes
// ============================================================================

/**
 * Generic Health Pool with shield absorption, death events, and regen mechanics.
 */
export class HealthPool<TRegen = number> implements IHealthPool<TRegen> {
  private _current: number;
  private _max: number;
  private _regen: ResourceRegenConfig<TRegen>;
  private _shields: ShieldGauge[] = [];
  private _timeSinceDamage = 0;

  public onDamageCallbacks: ((damage: number, source?: string) => void)[] = [];
  public onHealCallbacks: ((heal: number, source?: string) => void)[] = [];
  public onDeathCallbacks: (() => void)[] = [];
  public onReviveCallbacks: (() => void)[] = [];

  constructor(maxHealth: number, regen?: ResourceRegenConfig<TRegen>) {
    this._max = Math.max(1, maxHealth);
    this._current = this._max;
    this._regen = regen ?? { ratePerSecond: 0 as unknown as TRegen, enabled: false };
  }

  public get current(): number {
    return this._current;
  }

  public get max(): number {
    return this._max;
  }

  public get percent(): number {
    return this._max > 0 ? this._current / this._max : 0;
  }

  public get isDead(): boolean {
    return this._current <= 0;
  }

  public get isFull(): boolean {
    return this._current >= this._max;
  }

  public setMax(value: number, scaleCurrent = false): void {
    const prevMax = this._max;
    this._max = Math.max(1, value);
    if (scaleCurrent && prevMax > 0) {
      this._current = (this._current / prevMax) * this._max;
    } else {
      this._current = Math.min(this._current, this._max);
    }
  }

  public setRegen(config: ResourceRegenConfig<TRegen>): void {
    this._regen = config;
  }

  public getRegen(): ResourceRegenConfig<TRegen> {
    return this._regen;
  }

  public addShield(shield: ShieldGauge): void {
    this._shields.push(shield);
  }

  public removeShield(id: string): boolean {
    const idx = this._shields.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this._shields.splice(idx, 1);
      return true;
    }
    return false;
  }

  public getTotalShield(): number {
    return this._shields.reduce((sum, s) => sum + s.strength, 0);
  }

  public damage(amount: number, source?: string): number {
    if (this.isDead || amount <= 0) return 0;
    this._timeSinceDamage = 0;

    let remainingDamage = amount;

    // Absorb with active shields first
    for (let i = this._shields.length - 1; i >= 0; i--) {
      const shield = this._shields[i];
      remainingDamage = shield.absorb(remainingDamage);
      if (shield.isDepleted) {
        this._shields.splice(i, 1);
      }
      if (remainingDamage <= 0) break;
    }

    const healthDamage = Math.min(this._current, remainingDamage);
    this._current -= healthDamage;

    for (const cb of this.onDamageCallbacks) {
      cb(amount, source);
    }

    if (this._current <= 0) {
      this._current = 0;
      for (const cb of this.onDeathCallbacks) {
        cb();
      }
    }

    return remainingDamage;
  }

  public heal(amount: number, source?: string): number {
    if (this.isDead || amount <= 0) return 0;
    const missing = this._max - this._current;
    const actualHeal = Math.min(missing, amount);
    this._current += actualHeal;

    for (const cb of this.onHealCallbacks) {
      cb(actualHeal, source);
    }
    return actualHeal;
  }

  public kill(): void {
    if (!this.isDead) {
      this._current = 0;
      for (const cb of this.onDeathCallbacks) {
        cb();
      }
    }
  }

  public revive(percent = 1.0): void {
    if (this.isDead) {
      const p = Math.max(0.01, Math.min(1.0, percent));
      this._current = this._max * p;
      for (const cb of this.onReviveCallbacks) {
        cb();
      }
    }
  }

  public tick(dt: number, inCombat = false): void {
    this._timeSinceDamage += dt;

    // Tick shields
    for (let i = this._shields.length - 1; i >= 0; i--) {
      this._shields[i].tick(dt);
      if (this._shields[i].isDepleted) {
        this._shields.splice(i, 1);
      }
    }

    if (this.isDead || !this._regen.enabled) return;

    if (this._regen.delayAfterExertion && this._timeSinceDamage < this._regen.delayAfterExertion) {
      return;
    }

    const baseRate = Number(this._regen.ratePerSecond) || 0;
    const mult = inCombat ? (this._regen.combatMultiplier ?? 1.0) : 1.0;
    this.heal(baseRate * mult * dt);
  }
}

/**
 * Generic Mana Pool for spells, incantations, and magic systems.
 */
export class ManaPool<TCost = number> implements IManaPool<TCost> {
  private _current: number;
  private _max: number;
  private _regenRate: number;
  private _reserved = 0;

  public onEmptyCallbacks: (() => void)[] = [];

  constructor(maxMana: number, regenRatePerSec = 5) {
    this._max = Math.max(0, maxMana);
    this._current = this._max;
    this._regenRate = regenRatePerSec;
  }

  public get current(): number {
    return this._current;
  }

  public get max(): number {
    return this._max;
  }

  public get available(): number {
    return Math.max(0, this._current - this._reserved);
  }

  public get percent(): number {
    return this._max > 0 ? this._current / this._max : 0;
  }

  public get reserved(): number {
    return this._reserved;
  }

  public setReserve(amount: number): boolean {
    if (amount < 0 || amount > this._max) return false;
    this._reserved = amount;
    if (this._current < this._reserved) {
      this._current = this._reserved;
    }
    return true;
  }

  public canCast(amount: TCost): boolean {
    const cost = Number(amount) || 0;
    return this.available >= cost;
  }

  public consume(amount: TCost): boolean {
    const cost = Number(amount) || 0;
    if (cost <= 0) return true;
    if (this.canCast(amount)) {
      this._current -= cost;
      if (this._current <= this._reserved) {
        for (const cb of this.onEmptyCallbacks) cb();
      }
      return true;
    }
    return false;
  }

  public restore(amount: number): void {
    if (amount <= 0) return;
    this._current = Math.min(this._max, this._current + amount);
  }

  public setMax(maxMana: number): void {
    this._max = Math.max(0, maxMana);
    this._current = Math.min(this._current, this._max);
  }

  public setRegenRate(rate: number): void {
    this._regenRate = Math.max(0, rate);
  }

  public tick(dt: number): void {
    if (this._regenRate > 0 && this._current < this._max) {
      this.restore(this._regenRate * dt);
    }
  }
}

/**
 * Generic Energy / Stamina Pool for sprints, dodges, combos, and action execution.
 */
export class EnergyPool<TExertion = number> implements IEnergyPool<TExertion> {
  private _current: number;
  private _max: number;
  private _recoveryRate: number;
  private _exhaustionThreshold: number;
  private _isExhausted = false;
  private _delayTimer = 0;
  private _recoveryDelay = 0.5;

  constructor(maxEnergy = 100, recoveryRate = 20, exhaustionThreshold = 10) {
    this._max = maxEnergy;
    this._current = maxEnergy;
    this._recoveryRate = recoveryRate;
    this._exhaustionThreshold = exhaustionThreshold;
  }

  public get current(): number {
    return this._current;
  }

  public get max(): number {
    return this._max;
  }

  public get percent(): number {
    return this._max > 0 ? this._current / this._max : 0;
  }

  public get isExhausted(): boolean {
    return this._isExhausted;
  }

  public expend(amount: TExertion): boolean {
    const cost = Number(amount) || 0;
    if (cost <= 0) return true;
    if (this._current >= cost) {
      this._current -= cost;
      this._delayTimer = this._recoveryDelay;
      if (this._current < this._exhaustionThreshold) {
        this._isExhausted = true;
      }
      return true;
    }
    return false;
  }

  public recover(amount: number): void {
    if (amount <= 0) return;
    this._current = Math.min(this._max, this._current + amount);
    if (this._current >= this._exhaustionThreshold * 2) {
      this._isExhausted = false;
    }
  }

  public tick(dt: number): void {
    if (this._delayTimer > 0) {
      this._delayTimer -= dt;
      return;
    }
    if (this._current < this._max) {
      this.recover(this._recoveryRate * dt);
    }
  }
}

/**
 * Barbarian / Warrior Rage Pool that builds up during combat and decays over time.
 */
export class RagePool {
  private _current = 0;
  private _max: number;
  private _decayRate: number;
  private _decayDelay: number;
  private _timer = 0;

  constructor(maxRage = 100, decayRate = 5, decayDelay = 3) {
    this._max = maxRage;
    this._decayRate = decayRate;
    this._decayDelay = decayDelay;
  }

  public get current(): number { return this._current; }
  public get max(): number { return this._max; }
  public get percent(): number { return this._max > 0 ? this._current / this._max : 0; }

  public generate(amount: number): void {
    if (amount <= 0) return;
    this._current = Math.min(this._max, this._current + amount);
    this._timer = this._decayDelay;
  }

  public spend(amount: number): boolean {
    if (this._current >= amount) {
      this._current -= amount;
      this._timer = this._decayDelay;
      return true;
    }
    return false;
  }

  public tick(dt: number): void {
    if (this._timer > 0) {
      this._timer -= dt;
      return;
    }
    if (this._current > 0) {
      this._current = Math.max(0, this._current - this._decayRate * dt);
    }
  }
}

/**
 * Combo Point / Fury Meter system for rogues, martial artists, and execution strikes.
 */
export class FuryMeter {
  private _points = 0;
  private _maxPoints: number;

  constructor(maxPoints = 5) {
    this._maxPoints = maxPoints;
  }

  public get points(): number { return this._points; }
  public get maxPoints(): number { return this._maxPoints; }

  public addPoints(count = 1): number {
    this._points = Math.min(this._maxPoints, this._points + count);
    return this._points;
  }

  public isFull(): boolean {
    return this._points >= this._maxPoints;
  }

  public consumeAll(): number {
    const p = this._points;
    this._points = 0;
    return p;
  }

  public consume(count: number): boolean {
    if (this._points >= count) {
      this._points -= count;
      return true;
    }
    return false;
  }
}

/**
 * Sanity / Corruption / Horror Gauge for dark fantasy, Eldritch, or psychological mechanics.
 */
export class SanityPool {
  private _current: number;
  private _max: number;

  constructor(maxSanity = 100) {
    this._max = maxSanity;
    this._current = maxSanity;
  }

  public get current(): number { return this._current; }
  public get max(): number { return this._max; }
  public get isInsane(): boolean { return this._current <= 0; }
  public get percent(): number { return this._max > 0 ? this._current / this._max : 0; }

  public drain(amount: number): void {
    this._current = Math.max(0, this._current - amount);
  }

  public restore(amount: number): void {
    this._current = Math.min(this._max, this._current + amount);
  }
}

/**
 * Shield Gauge absorbing damage before raw HP is reduced.
 */
export class ShieldGauge {
  public readonly id: string;
  private _strength: number;
  private _maxStrength: number;
  private _duration: number;
  private _elapsed = 0;

  constructor(id: string, strength: number, durationSeconds = 10) {
    this.id = id;
    this._strength = strength;
    this._maxStrength = strength;
    this._duration = durationSeconds;
  }

  public get strength(): number { return this._strength; }
  public get isDepleted(): boolean { return this._strength <= 0 || (this._duration > 0 && this._elapsed >= this._duration); }

  public absorb(incomingDamage: number): number {
    if (incomingDamage <= 0 || this.isDepleted) return incomingDamage;
    if (this._strength >= incomingDamage) {
      this._strength -= incomingDamage;
      return 0; // Completely absorbed
    }
    const overflow = incomingDamage - this._strength;
    this._strength = 0;
    return overflow;
  }

  public tick(dt: number): void {
    if (this._duration > 0) {
      this._elapsed += dt;
    }
  }
}

/**
 * Armor Plating & Durability system.
 */
export class ArmorPlating {
  private _durability: number;
  private _maxDurability: number;
  private _mitigationRatio: number;

  constructor(durability = 100, mitigationRatio = 0.25) {
    this._durability = durability;
    this._maxDurability = durability;
    this._mitigationRatio = mitigationRatio;
  }

  public get durability(): number { return this._durability; }
  public get isBroken(): boolean { return this._durability <= 0; }
  public get mitigation(): number { return this.isBroken ? 0 : this._mitigationRatio; }

  public degrade(amount: number): void {
    this._durability = Math.max(0, this._durability - amount);
  }

  public repair(amount: number): void {
    this._durability = Math.min(this._maxDurability, this._durability + amount);
  }
}

/**
 * Generic Attribute System handling dynamic stats, flat/percentage modifiers, and calculations.
 */
export class AttributeSystem<TStats extends Record<string, number> = Record<string, number>> {
  private _baseStats: Map<string, number> = new Map();
  private _modifiers: Map<string, StatModifier[]> = new Map();

  constructor(initialStats?: Partial<TStats>) {
    if (initialStats) {
      for (const [key, value] of Object.entries(initialStats)) {
        if (typeof value === 'number') {
          this._baseStats.set(key, value);
        }
      }
    }
  }

  public setBase(statKey: string, value: number): void {
    this._baseStats.set(statKey, value);
  }

  public getBase(statKey: string): number {
    return this._baseStats.get(statKey) ?? 0;
  }

  public addModifier(statKey: string, modifier: StatModifier): void {
    const list = this._modifiers.get(statKey) ?? [];
    list.push(modifier);
    this._modifiers.set(statKey, list);
  }

  public removeModifier(statKey: string, modifierId: string): boolean {
    const list = this._modifiers.get(statKey);
    if (!list) return false;
    const initialLen = list.length;
    const filtered = list.filter((m) => m.id !== modifierId);
    this._modifiers.set(statKey, filtered);
    return filtered.length < initialLen;
  }

  public clearModifiers(statKey?: string): void {
    if (statKey) {
      this._modifiers.delete(statKey);
    } else {
      this._modifiers.clear();
    }
  }

  public getModified(statKey: string): number {
    const base = this.getBase(statKey);
    const mods = this._modifiers.get(statKey);
    if (!mods || mods.length === 0) return base;

    let flatBonus = 0;
    let percentAdd = 0;
    let percentMult = 1.0;

    for (const mod of mods) {
      switch (mod.type) {
        case 'flat':
          flatBonus += Number(mod.value) || 0;
          break;
        case 'percent_add':
          percentAdd += Number(mod.value) || 0;
          break;
        case 'percent_mult':
          percentMult *= 1.0 + (Number(mod.value) || 0);
          break;
      }
    }

    return (base + flatBonus) * (1.0 + percentAdd) * percentMult;
  }

  public tick(dt: number): void {
    for (const [statKey, list] of this._modifiers.entries()) {
      for (let i = list.length - 1; i >= 0; i--) {
        const mod = list[i];
        if (mod.duration !== undefined) {
          mod.elapsed = (mod.elapsed ?? 0) + dt;
          if (mod.elapsed >= mod.duration) {
            list.splice(i, 1);
          }
        }
      }
      this._modifiers.set(statKey, list);
    }
  }

  public toJSON(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const key of this._baseStats.keys()) {
      result[key] = this.getModified(key);
    }
    return result;
  }
}
