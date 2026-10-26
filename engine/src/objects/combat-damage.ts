/**
 * @file combat-damage.ts
 * @module @aetheria/engine/objects/combat-damage
 * @description Damage calculation, hitboxes, threat tables, and combat logging.
 */

export type DamageType =
  | 'physical'
  | 'magical'
  | 'pure'
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'holy'
  | 'dark'
  | 'poison'
  | 'bleed';

export type DamageFlag =
  | 'critical'
  | 'glancing'
  | 'blocked'
  | 'dodged'
  | 'parried'
  | 'absorbed'
  | 'vulnerable';

export type HitboxShape = 'sphere' | 'box' | 'capsule' | 'ray';

/**
 * Concrete Damage Instance passed between combatants.
 */
export class DamageInstance {
  public rawAmount: number;
  public effectiveAmount: number;
  public type: DamageType;
  public sourceId?: string;
  public targetId?: string;
  public isCrit = false;
  public flags: Set<DamageFlag> = new Set();
  public timestamp: number;

  constructor(amount: number, type: DamageType = 'physical', sourceId?: string, targetId?: string) {
    this.rawAmount = amount;
    this.effectiveAmount = amount;
    this.type = type;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.timestamp = Date.now();
  }

  public applyMitigation(reduction: number): void {
    this.effectiveAmount = Math.max(0, this.effectiveAmount - reduction);
  }

  public applyPercentageMitigation(percent: number): void {
    const factor = Math.max(0, 1.0 - percent);
    this.effectiveAmount *= factor;
  }

  public addFlag(flag: DamageFlag): void {
    this.flags.add(flag);
    if (flag === 'critical') {
      this.isCrit = true;
    }
  }

  public hasFlag(flag: DamageFlag): boolean {
    return this.flags.has(flag);
  }
}

/**
 * Generic Damage Calculator factoring in attack power, armor formulas, and critical hits.
 */
export class DamageCalculator<TAttacker = any, TTarget = any> {
  public armorConstant: number;
  public baseCritMultiplier: number;

  constructor(armorConstant = 100, baseCritMultiplier = 1.5) {
    this.armorConstant = armorConstant;
    this.baseCritMultiplier = baseCritMultiplier;
  }

  public calculate(
    attacker: TAttacker,
    target: TTarget,
    basePower: number,
    type: DamageType = 'physical'
  ): DamageInstance {
    const inst = new DamageInstance(basePower, type);

    // 1. Attacker power bonus
    let damage = basePower;
    const atkStats = (attacker as any)?.stats ?? (attacker as any)?.attributeSystem?.toJSON?.();
    if (atkStats) {
      const statBonus = type === 'magical' ? (atkStats.intelligence ?? 0) : (atkStats.strength ?? 0);
      damage += statBonus * 0.5;
    }

    // 2. Critical hit check
    const critChance = (atkStats?.critChance ?? 0.05);
    if (Math.random() < critChance) {
      damage *= this.baseCritMultiplier;
      inst.addFlag('critical');
    }

    // 3. Target armor / resistance mitigation
    if (type !== 'pure') {
      const defStats = (target as any)?.stats ?? (target as any)?.attributeSystem?.toJSON?.();
      const defense = type === 'magical' ? (defStats?.magicResist ?? 0) : (defStats?.defense ?? 0);
      const mitigationRatio = defense / (defense + this.armorConstant);
      damage *= 1.0 - mitigationRatio;
    }

    inst.effectiveAmount = Math.max(1, Math.round(damage));
    return inst;
  }
}

/**
 * Hitbox representation for melee attacks, spell collision, and area scans.
 */
export class Hitbox<TShape extends HitboxShape = HitboxShape> {
  public shape: TShape;
  public position: [number, number, number];
  public dimensions: [number, number, number]; // radius or half-extents

  constructor(shape: TShape, position: [number, number, number], dimensions: [number, number, number]) {
    this.shape = shape;
    this.position = position;
    this.dimensions = dimensions;
  }

  public intersectsPoint(px: number, py: number, pz: number): boolean {
    const dx = px - this.position[0];
    const dy = py - this.position[1];
    const dz = pz - this.position[2];

    if (this.shape === 'sphere') {
      const radius = this.dimensions[0];
      return dx * dx + dy * dy + dz * dz <= radius * radius;
    }

    if (this.shape === 'box') {
      return (
        Math.abs(dx) <= this.dimensions[0] &&
        Math.abs(dy) <= this.dimensions[1] &&
        Math.abs(dz) <= this.dimensions[2]
      );
    }

    return false;
  }
}

/**
 * Threat / Aggro Table managing target priority for AI bots and bosses.
 */
export class ThreatTable<TTarget = any> {
  private _threat: Map<TTarget, number> = new Map();

  public addThreat(target: TTarget, amount: number): void {
    if (!target || amount <= 0) return;
    const curr = this._threat.get(target) ?? 0;
    this._threat.set(target, curr + amount);
  }

  public reduceThreat(target: TTarget, amount: number): void {
    const curr = this._threat.get(target) ?? 0;
    const next = Math.max(0, curr - amount);
    if (next <= 0) {
      this._threat.delete(target);
    } else {
      this._threat.set(target, next);
    }
  }

  public getThreat(target: TTarget): number {
    return this._threat.get(target) ?? 0;
  }

  public getTopThreat(): TTarget | null {
    let topTarget: TTarget | null = null;
    let highestThreat = -1;

    for (const [target, threat] of this._threat.entries()) {
      if (threat > highestThreat) {
        highestThreat = threat;
        topTarget = target;
      }
    }

    return topTarget;
  }

  public reset(): void {
    this._threat.clear();
  }
}

/**
 * In-game Combat Log recording recent combat interactions.
 */
export class CombatLog {
  private _logs: DamageInstance[] = [];
  public maxEntries: number;

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
  }

  public record(entry: DamageInstance): void {
    this._logs.push(entry);
    if (this._logs.length > this.maxEntries) {
      this._logs.shift();
    }
  }

  public getRecent(count = 10): DamageInstance[] {
    return this._logs.slice(-count);
  }

  public clear(): void {
    this._logs = [];
  }
}
