/**
 * @file skills.ts
 * @module @aetheria/engine/objects/skills
 * @description Generic skill systems, action bars, skill trees, combo chains, and spellcasting.
 */

export type SkillType = 'active' | 'passive' | 'toggle' | 'channel' | 'ultimate' | 'combo';

export type TargetType =
  | 'self'
  | 'single_target'
  | 'aoe_circle'
  | 'aoe_cone'
  | 'line'
  | 'ground'
  | 'allies'
  | 'enemies';

export type SpellElement =
  | 'fire'
  | 'frost'
  | 'lightning'
  | 'holy'
  | 'shadow'
  | 'nature'
  | 'arcane'
  | 'physical'
  | 'void';

export interface SkillCost<TCost = number> {
  type: 'mana' | 'energy' | 'rage' | 'fury' | 'health' | 'none';
  amount: TCost;
}

export interface SkillEffect<TEffect = any> {
  id: string;
  effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'cc' | 'teleport' | 'summon' | 'custom';
  potency: number;
  data?: TEffect;
}

export interface SkillDefinition<TCost = number, TEffect = any> {
  id: string;
  name: string;
  description?: string;
  type?: SkillType;
  targetType?: TargetType;
  cooldown?: number; // seconds
  castTime?: number; // seconds
  range?: number;
  cost?: SkillCost<TCost>;
  effects?: SkillEffect<TEffect>[];
  icon?: string;
}

export interface SkillNode<TSkill extends Skill = Skill> {
  id: string;
  skill: TSkill;
  tier: number;
  costPoints: number;
  requiredNodeIds?: string[];
  maxRank?: number;
  currentRank?: number;
  unlocked?: boolean;
}

export interface ComboStep<TMove = any> {
  stepIndex: number;
  requiredInput: string;
  windowDuration: number; // time window to hit next step
  moveData: TMove;
  damageMultiplier: number;
}

/**
 * Generic Skill class with cooldown tracking, casting, and execution logic.
 */
export class Skill<TCost = number, TEffect = any> {
  public readonly id: string;
  public name: string;
  public description: string;
  public type: SkillType;
  public targetType: TargetType;
  public cooldown: number;
  public castTime: number;
  public range: number;
  public cost: SkillCost<TCost>;
  public effects: SkillEffect<TEffect>[];

  private _remainingCooldown = 0;
  private _isCasting = false;
  private _castProgress = 0;

  /** Người thi triển lần gần nhất (null nếu không có). */
  public lastCaster: any = null;
  /** Mục tiêu của lần thi triển gần nhất (null nếu không có). */
  public lastTarget: any = null;
  /** Số lần đã thi triển — cho phép đếm thay vì suy đoán. */
  public lastExecutedAt = 0;

  constructor(def: SkillDefinition<TCost, TEffect>) {
    this.id = def.id;
    this.name = def.name;
    this.description = def.description ?? '';
    this.type = def.type ?? 'active';
    this.targetType = def.targetType ?? 'single_target';
    this.cooldown = def.cooldown ?? 0;
    this.castTime = def.castTime ?? 0;
    this.range = def.range ?? 5;
    this.cost = def.cost ?? { type: 'none', amount: 0 as unknown as TCost };
    this.effects = def.effects ?? [];
  }

  public get isReady(): boolean {
    return this._remainingCooldown <= 0 && !this._isCasting;
  }

  public get remainingCooldown(): number {
    return this._remainingCooldown;
  }

  public get cooldownPercent(): number {
    return this.cooldown > 0 ? this._remainingCooldown / this.cooldown : 0;
  }

  public get isCasting(): boolean {
    return this._isCasting;
  }

  public get castProgress(): number {
    return this.castTime > 0 ? this._castProgress / this.castTime : 1.0;
  }

  public startCooldown(overrideCooldown?: number): void {
    this._remainingCooldown = overrideCooldown ?? this.cooldown;
  }

  public reduceCooldown(seconds: number): void {
    this._remainingCooldown = Math.max(0, this._remainingCooldown - seconds);
  }

  public resetCooldown(): void {
    this._remainingCooldown = 0;
  }

  public canActivate(caster: any): boolean {
    if (!this.isReady) return false;
    // Check cost against caster's pools if available
    if (this.cost.type === 'mana' && caster?.mana) {
      return caster.mana.canCast ? caster.mana.canCast(this.cost.amount) : true;
    }
    if (this.cost.type === 'energy' && caster?.energy) {
      return caster.energy.current >= Number(this.cost.amount);
    }
    return true;
  }

  public startCast(caster: any, onComplete?: () => void): boolean {
    if (!this.canActivate(caster)) return false;

    if (this.castTime <= 0) {
      return this.execute(caster);
    }

    this._isCasting = true;
    this._castProgress = 0;
    return true;
  }

  public cancelCast(): void {
    this._isCasting = false;
    this._castProgress = 0;
  }

  /**
   * Thi triển kỹ năng.
   *
   * Trước đây tham số `target` bị bỏ qua hoàn toàn — kỹ năng thi triển về
   * đâu cũng không ai biết. Nay mục tiêu được ghi nhận và truyền vào hook
   * `onExecute` nếu kỹ năng có hook.
   */
  public execute(caster?: any, target?: any): boolean {
    // Pay resource cost
    if (caster) {
      if (this.cost.type === 'mana' && caster.mana?.consume) {
        caster.mana.consume(this.cost.amount);
      } else if (this.cost.type === 'energy' && caster.energy?.expend) {
        caster.energy.expend(this.cost.amount);
      }
    }

    // Ghi nhận người thi triển và mục tiêu để hệ thống khác đọc được.
    this.lastCaster = caster ?? null;
    this.lastTarget = target ?? null;
    this.lastExecutedAt = this.lastExecutedAt + 1;

    // Hook tuỳ biến: nhận cả caster và target.
    const hook = (this as unknown as { onExecute?: (caster: any, target: any) => void }).onExecute;
    if (typeof hook === 'function') hook(caster, target);

    this._isCasting = false;
    this._castProgress = 0;
    this.startCooldown();
    return true;
  }

  public tick(dt: number): void {
    if (this._remainingCooldown > 0) {
      this._remainingCooldown = Math.max(0, this._remainingCooldown - dt);
    }
    if (this._isCasting) {
      this._castProgress += dt;
      if (this._castProgress >= this.castTime) {
        this.execute();
      }
    }
  }
}

/**
 * Skill Bar representing the hotbar / active skill loadout of a player or bot.
 */
export class SkillBar<TSkill extends Skill = Skill> {
  private _slots: (TSkill | null)[] = [];
  public readonly size: number;

  constructor(slotCount = 8) {
    this.size = slotCount;
    for (let i = 0; i < slotCount; i++) {
      this._slots.push(null);
    }
  }

  public setSlot(index: number, skill: TSkill): boolean {
    if (index < 0 || index >= this.size) return false;
    this._slots[index] = skill;
    return true;
  }

  public getSlot(index: number): TSkill | null {
    if (index < 0 || index >= this.size) return null;
    return this._slots[index];
  }

  public clearSlot(index: number): void {
    if (index >= 0 && index < this.size) {
      this._slots[index] = null;
    }
  }

  public triggerSlot(index: number, caster?: any, target?: any): boolean {
    const skill = this.getSlot(index);
    if (!skill) return false;
    if (skill.canActivate(caster)) {
      return skill.execute(caster, target);
    }
    return false;
  }

  public tick(dt: number): void {
    for (const skill of this._slots) {
      if (skill) skill.tick(dt);
    }
  }

  public getAllSlots(): (TSkill | null)[] {
    return [...this._slots];
  }
}

/**
 * Skill Tree handling talent progression, pre-requisites, and node unlocking.
 */
export class SkillTree<TSkill extends Skill = Skill, TNodeData = any> {
  private _nodes: Map<string, SkillNode<TSkill>> = new Map();

  public addNode(node: SkillNode<TSkill>): void {
    this._nodes.set(node.id, {
      ...node,
      currentRank: node.currentRank ?? 0,
      maxRank: node.maxRank ?? 1,
      unlocked: node.unlocked ?? false,
    });
  }

  public getNode(nodeId: string): SkillNode<TSkill> | undefined {
    return this._nodes.get(nodeId);
  }

  public canUnlockNode(nodeId: string): boolean {
    const node = this._nodes.get(nodeId);
    if (!node) return false;
    if ((node.currentRank ?? 0) >= (node.maxRank ?? 1)) return false;

    // Check prerequisites
    if (node.requiredNodeIds && node.requiredNodeIds.length > 0) {
      for (const reqId of node.requiredNodeIds) {
        const reqNode = this._nodes.get(reqId);
        if (!reqNode || !reqNode.unlocked) return false;
      }
    }
    return true;
  }

  public unlockNode(nodeId: string, availableSkillPoints: number): boolean {
    const node = this._nodes.get(nodeId);
    if (!node || !this.canUnlockNode(nodeId)) return false;
    if (availableSkillPoints < node.costPoints) return false;

    node.currentRank = (node.currentRank ?? 0) + 1;
    node.unlocked = true;
    return true;
  }

  public isNodeUnlocked(nodeId: string): boolean {
    return this._nodes.get(nodeId)?.unlocked ?? false;
  }

  public getUnlockedSkills(): TSkill[] {
    const list: TSkill[] = [];
    for (const node of this._nodes.values()) {
      if (node.unlocked) {
        list.push(node.skill);
      }
    }
    return list;
  }

  public resetTree(): number {
    let refundedPoints = 0;
    for (const node of this._nodes.values()) {
      refundedPoints += (node.currentRank ?? 0) * node.costPoints;
      node.currentRank = 0;
      node.unlocked = false;
    }
    return refundedPoints;
  }
}

/**
 * Timing-based Action Combo Chain (e.g. Light -> Light -> Heavy).
 */
export class ComboChain<TMove = any> {
  private _steps: ComboStep<TMove>[] = [];
  private _currentStepIndex = -1;
  private _windowTimer = 0;

  public registerStep(step: ComboStep<TMove>): void {
    this._steps.push(step);
    this._steps.sort((a, b) => a.stepIndex - b.stepIndex);
  }

  public inputAction(action: string): ComboStep<TMove> | null {
    const nextIdx = this._currentStepIndex + 1;
    if (nextIdx >= this._steps.length) {
      this.reset();
      return null;
    }

    const nextStep = this._steps[nextIdx];
    if (nextStep.requiredInput === action) {
      this._currentStepIndex = nextIdx;
      this._windowTimer = nextStep.windowDuration;
      return nextStep;
    }

    // Missed input, reset
    this.reset();
    return null;
  }

  public getCurrentStep(): ComboStep<TMove> | null {
    if (this._currentStepIndex >= 0 && this._currentStepIndex < this._steps.length) {
      return this._steps[this._currentStepIndex];
    }
    return null;
  }

  public getComboMultiplier(): number {
    const step = this.getCurrentStep();
    return step ? step.damageMultiplier : 1.0;
  }

  public isCompleted(): boolean {
    return this._currentStepIndex === this._steps.length - 1;
  }

  public reset(): void {
    this._currentStepIndex = -1;
    this._windowTimer = 0;
  }

  public tick(dt: number): void {
    if (this._windowTimer > 0) {
      this._windowTimer -= dt;
      if (this._windowTimer <= 0) {
        this.reset(); // Combo window expired
      }
    }
  }
}

/**
 * Specialized Spell casting entity with elemental affinity and projectile velocity.
 */
export class Spell<TElement extends SpellElement = SpellElement> extends Skill<number, any> {
  public element: TElement;
  public projectileSpeed: number;
  public areaOfEffectRadius: number;

  constructor(
    def: SkillDefinition<number, any> & {
      element: TElement;
      projectileSpeed?: number;
      areaOfEffectRadius?: number;
    }
  ) {
    super(def);
    this.element = def.element;
    this.projectileSpeed = def.projectileSpeed ?? 20;
    this.areaOfEffectRadius = def.areaOfEffectRadius ?? 0;
  }
}

/**
 * Event-triggered passive ability (e.g., On-Hit, Low HP Enrage, Thorns).
 */
export class PassiveAbility<TTrigger extends string = string, TEffect = any> {
  public readonly id: string;
  public name: string;
  public triggerEvent: TTrigger;
  public effect: TEffect;
  public isEnabled = true;
  /** Sự kiện đã kích hoạt gần nhất. */
  public lastTriggeredEvent: TTrigger | null = null;
  /** Ngữ cảnh của lần kích hoạt gần nhất. */
  public lastTriggerContext: any = null;
  /** Số lần đã kích hoạt. */
  public triggerCount = 0;

  constructor(id: string, name: string, triggerEvent: TTrigger, effect: TEffect) {
    this.id = id;
    this.name = name;
    this.triggerEvent = triggerEvent;
    this.effect = effect;
  }

  /**
   * Kích hoạt năng lực thụ động.
   *
   * Trước đây tham số `context` bị bỏ qua — năng lực thụ động không biết
   * điều gì đã xảy ra. Nay nếu hiệu ứng là hàm thì hàm đó được gọi với
   * `context`; nếu không thì `context` vẫn được ghi nhận để hệ thống khác đọc.
   */
  public trigger(event: TTrigger, context?: any): TEffect | null {
    if (!this.isEnabled || event !== this.triggerEvent) return null;
    this.lastTriggeredEvent = event;
    this.lastTriggerContext = context ?? null;
    this.triggerCount += 1;
    if (typeof this.effect === 'function') {
      return (this.effect as (ctx: any) => TEffect)(context);
    }
    return this.effect;
  }
}
