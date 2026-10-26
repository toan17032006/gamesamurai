/**
 * @file progression.ts
 * @module @aetheria/engine/objects/progression
 * @description Leveling systems, experience curves, class promotions, achievements, and titles.
 */

export interface LevelCurveConfig {
  baseExp: number;
  exponent: number;
  linearFactor?: number;
}

export interface ExperienceGrant<TSource = string> {
  amount: number;
  source: TSource;
  bonusMultiplier?: number;
}

export interface LevelMilestone<TReward = any> {
  level: number;
  reward: TReward;
  unlockTitle?: string;
}

export interface ClassSpecialization<TClass = string> {
  id: string;
  name: string;
  parentClass?: TClass;
  requiredLevel: number;
  baseStatMultipliers: Record<string, number>;
  unlockedSkillIds: string[];
}

export interface AchievementDefinition<TCondition = any> {
  id: string;
  title: string;
  description: string;
  condition: TCondition;
  targetCount: number;
  rewardPoints?: number;
  isSecret?: boolean;
}

export interface PlayerTitle<TReq = any> {
  id: string;
  title: string;
  statBonus?: Record<string, number>;
  requirement?: TReq;
}

/**
 * Standard RPG Experience Curve using polynomial / exponential growth.
 */
export class ExperienceCurve {
  public baseExp: number;
  public exponent: number;
  public linearFactor: number;

  constructor(baseExp = 100, exponent = 1.5, linearFactor = 50) {
    this.baseExp = baseExp;
    this.exponent = exponent;
    this.linearFactor = linearFactor;
  }

  public calculateExpForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(
      this.baseExp * Math.pow(level - 1, this.exponent) + this.linearFactor * (level - 1)
    );
  }

  public calculateTotalExpForLevel(level: number): number {
    let total = 0;
    for (let l = 1; l <= level; l++) {
      total += this.calculateExpForLevel(l);
    }
    return total;
  }

  public calculateLevelFromTotalExp(totalExp: number, maxLevel = 100): number {
    let acc = 0;
    for (let l = 1; l <= maxLevel; l++) {
      const needed = this.calculateExpForLevel(l + 1);
      if (acc + needed > totalExp) {
        return l;
      }
      acc += needed;
    }
    return maxLevel;
  }
}

/**
 * Generic Level System managing player XP, stat points allocation, and level ups.
 */
export class LevelSystem<TStats extends Record<string, number> = Record<string, number>> {
  public currentLevel = 1;
  public currentExp = 0;
  public maxLevel: number;
  public unspentStatPoints = 0;
  public pointsPerLevel: number;

  private _curve: ExperienceCurve;
  private _allocatedStats: Map<string, number> = new Map();
  public onLevelUpCallbacks: ((newLevel: number, unspentPoints: number) => void)[] = [];

  constructor(maxLevel = 100, curve?: ExperienceCurve, pointsPerLevel = 5) {
    this.maxLevel = maxLevel;
    this._curve = curve ?? new ExperienceCurve();
    this.pointsPerLevel = pointsPerLevel;
  }

  public get expToNextLevel(): number {
    if (this.currentLevel >= this.maxLevel) return 0;
    return this._curve.calculateExpForLevel(this.currentLevel + 1);
  }

  public get progressPercent(): number {
    const needed = this.expToNextLevel;
    return needed > 0 ? Math.min(1.0, this.currentExp / needed) : 1.0;
  }

  public addExp(amount: number): boolean {
    if (this.currentLevel >= this.maxLevel || amount <= 0) return false;

    this.currentExp += amount;
    let leveledUp = false;

    while (this.currentLevel < this.maxLevel && this.currentExp >= this.expToNextLevel) {
      this.currentExp -= this.expToNextLevel;
      this.currentLevel++;
      this.unspentStatPoints += this.pointsPerLevel;
      leveledUp = true;

      for (const cb of this.onLevelUpCallbacks) {
        cb(this.currentLevel, this.unspentStatPoints);
      }
    }

    if (this.currentLevel >= this.maxLevel) {
      this.currentExp = 0;
    }

    return leveledUp;
  }

  public allocateStatPoint(stat: keyof TStats, amount = 1): boolean {
    if (this.unspentStatPoints < amount || amount <= 0) return false;
    const key = String(stat);
    const curr = this._allocatedStats.get(key) ?? 0;
    this._allocatedStats.set(key, curr + amount);
    this.unspentStatPoints -= amount;
    return true;
  }

  public getAllocatedStat(stat: keyof TStats): number {
    return this._allocatedStats.get(String(stat)) ?? 0;
  }

  public getAllocatedStats(): Record<string, number> {
    const res: Record<string, number> = {};
    for (const [k, v] of this._allocatedStats.entries()) {
      res[k] = v;
    }
    return res;
  }

  public resetAllocations(): number {
    let total = 0;
    for (const v of this._allocatedStats.values()) {
      total += v;
    }
    this._allocatedStats.clear();
    this.unspentStatPoints += total;
    return total;
  }
}

/**
 * Class Specialization Progression (e.g. Warrior -> Knight / Berserker).
 */
export class ClassProgression<TClass extends string = string> {
  public currentClass: TClass;
  private _specs: Map<string, ClassSpecialization<TClass>> = new Map();
  private _unlockedClasses: Set<TClass> = new Set();

  constructor(initialClass: TClass) {
    this.currentClass = initialClass;
    this._unlockedClasses.add(initialClass);
  }

  public registerSpecialization(spec: ClassSpecialization<TClass>): void {
    this._specs.set(spec.id, spec);
  }

  public canPromote(specId: string, currentLevel: number): boolean {
    const spec = this._specs.get(specId);
    if (!spec) return false;
    if (currentLevel < spec.requiredLevel) return false;
    if (spec.parentClass && spec.parentClass !== this.currentClass) return false;
    return true;
  }

  public promote(specId: string, currentLevel: number): boolean {
    if (!this.canPromote(specId, currentLevel)) return false;
    const spec = this._specs.get(specId)!;
    this.currentClass = spec.id as TClass;
    this._unlockedClasses.add(this.currentClass);
    return true;
  }

  public isClassUnlocked(cls: TClass): boolean {
    return this._unlockedClasses.has(cls);
  }
}

/**
 * Achievement tracking system.
 */
export class AchievementSystem<TCondition = any> {
  private _achievements: Map<string, AchievementDefinition<TCondition>> = new Map();
  private _progress: Map<string, number> = new Map();
  private _unlocked: Set<string> = new Set();

  public register(ach: AchievementDefinition<TCondition>): void {
    this._achievements.set(ach.id, ach);
  }

  public trackProgress(id: string, amount = 1): boolean {
    const ach = this._achievements.get(id);
    if (!ach || this._unlocked.has(id)) return false;

    const current = (this._progress.get(id) ?? 0) + amount;
    this._progress.set(id, current);

    if (current >= ach.targetCount) {
      this._unlocked.add(id);
      return true; // Newly completed!
    }
    return false;
  }

  public isUnlocked(id: string): boolean {
    return this._unlocked.has(id);
  }

  public getProgress(id: string): number {
    return this._progress.get(id) ?? 0;
  }

  public getPercent(id: string): number {
    const ach = this._achievements.get(id);
    if (!ach) return 0;
    const curr = this._progress.get(id) ?? 0;
    return Math.min(1.0, curr / ach.targetCount);
  }

  public getTotalPoints(): number {
    let sum = 0;
    for (const id of this._unlocked) {
      const ach = this._achievements.get(id);
      if (ach) sum += ach.rewardPoints ?? 0;
    }
    return sum;
  }
}

/**
 * Title system for character titles (e.g. "Dragon Slayer", "Grand Archmage").
 */
export class TitleSystem {
  private _titles: Map<string, PlayerTitle> = new Map();
  private _activeTitleId: string | null = null;

  public awardTitle(title: PlayerTitle): void {
    this._titles.set(title.id, title);
  }

  public equipTitle(titleId: string): boolean {
    if (this._titles.has(titleId)) {
      this._activeTitleId = titleId;
      return true;
    }
    return false;
  }

  public unequipTitle(): void {
    this._activeTitleId = null;
  }

  public getActiveTitle(): PlayerTitle | null {
    return this._activeTitleId ? this._titles.get(this._activeTitleId) ?? null : null;
  }

  public getAllUnlockedTitles(): PlayerTitle[] {
    return Array.from(this._titles.values());
  }
}
