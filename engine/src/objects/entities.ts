/**
 * @file entities.ts
 * @module @aetheria/engine/objects/entities
 * @description Generic entity base, Player, NPC, Bot/AI, Pet, and Mount classes.
 */

import { HealthPool, ManaPool, EnergyPool } from './attributes.js';
import { Inventory } from './inventory.js';
import { SkillBar } from './skills.js';
import { LevelSystem } from './progression.js';

export interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number, number]; // Quaternion x,y,z,w
  scale: [number, number, number];
}

export type EntityLifecycleState = 'spawning' | 'active' | 'dead' | 'despawning' | 'destroyed';

export interface InteractionPrompt<TAction = string> {
  promptId: string;
  label: string;
  action: TAction;
  distance: number;
}

export interface IEntity<TState = any> {
  readonly id: string;
  name: string;
  transform: Transform3D;
  state: TState;
  lifecycle: EntityLifecycleState;
  update(dt: number): void;
  destroy(): void;
}

/**
 * Core generic Entity base class with component management, transforms, tags, and lifecycle.
 */
export class Entity<TState = Record<string, any>> implements IEntity<TState> {
  public readonly id: string;
  public name: string;
  public transform: Transform3D;
  public state: TState;
  public lifecycle: EntityLifecycleState = 'active';
  public tags: Set<string> = new Set();

  private _components: Map<string, any> = new Map();

  constructor(id: string, name: string, initialState?: TState) {
    this.id = id;
    this.name = name;
    this.transform = {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    this.state = (initialState ?? {}) as TState;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.transform.position = [x, y, z];
  }

  public setRotation(x: number, y: number, z: number, w: number): void {
    this.transform.rotation = [x, y, z, w];
  }

  public setScale(x: number, y: number, z: number): void {
    this.transform.scale = [x, y, z];
  }

  public addComponent<C>(name: string, comp: C): void {
    this._components.set(name, comp);
  }

  public getComponent<C>(name: string): C | undefined {
    return this._components.get(name) as C | undefined;
  }

  public hasComponent(name: string): boolean {
    return this._components.has(name);
  }

  public removeComponent(name: string): boolean {
    return this._components.delete(name);
  }

  public addTag(tag: string): void {
    this.tags.add(tag);
  }

  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  public removeTag(tag: string): boolean {
    return this.tags.delete(tag);
  }

  public update(dt: number): void {
    // Override in derived classes or tick components
    for (const comp of this._components.values()) {
      if (typeof comp?.update === 'function') {
        comp.update(dt);
      }
    }
  }

  public destroy(): void {
    this.lifecycle = 'destroyed';
    this._components.clear();
  }
}

/**
 * Generic Player entity integrating Attributes (HP/MP/EP), Inventory, Skills, and Level progression.
 */
export class Player<
  TStats extends Record<string, number> = Record<string, number>,
  TInventory = Inventory<any>,
  TSkills = SkillBar<any>
> extends Entity<{ isGrounded: boolean; isSprinting: boolean; combatState: 'idle' | 'in_combat' }> {
  public health: HealthPool;
  public mana: ManaPool;
  public energy: EnergyPool;
  public levelSystem: LevelSystem<TStats>;
  public inventory: TInventory;
  public skillBar: TSkills;
  public isPlayerControlled = true;

  constructor(
    id: string,
    name: string,
    options?: {
      maxHealth?: number;
      maxMana?: number;
      maxEnergy?: number;
      inventory?: TInventory;
      skillBar?: TSkills;
    }
  ) {
    super(id, name, {
      isGrounded: true,
      isSprinting: false,
      combatState: 'idle',
    });

    this.health = new HealthPool(options?.maxHealth ?? 100);
    this.mana = new ManaPool(options?.maxMana ?? 100);
    this.energy = new EnergyPool(options?.maxEnergy ?? 100);
    this.levelSystem = new LevelSystem<TStats>();
    this.inventory = (options?.inventory ?? new Inventory(40)) as unknown as TInventory;
    this.skillBar = (options?.skillBar ?? new SkillBar(8)) as unknown as TSkills;

    this.addTag('player');
  }

  public override update(dt: number): void {
    super.update(dt);
    this.health.tick(dt, this.state.combatState === 'in_combat');
    this.mana.tick(dt);
    this.energy.tick(dt);
    if ((this.skillBar as any)?.tick) {
      (this.skillBar as any).tick(dt);
    }
  }

  public interactWith(target: Entity): boolean {
    if (!target) return false;
    if (typeof (target as any).interact === 'function') {
      return (target as any).interact(this);
    }
    return false;
  }

  public respawn(spawnTransform?: Partial<Transform3D>): void {
    this.health.revive(1.0);
    this.mana.restore(this.mana.max);
    this.energy.recover(this.energy.max);
    this.lifecycle = 'active';

    if (spawnTransform?.position) {
      this.transform.position = [...spawnTransform.position];
    }
    if (spawnTransform?.rotation) {
      this.transform.rotation = [...spawnTransform.rotation];
    }
  }
}

/**
 * Generic NPC entity with dialogue tree, quest giving, and shop trading roles.
 */
export class NPC<TDialogue = any, TRole extends string = string> extends Entity<{ isTalking: boolean }> {
  public role: TRole;
  public dialogueTree?: TDialogue;
  public isInteractable = true;
  public tradeInventory?: Inventory<any>;

  constructor(id: string, name: string, role: TRole, dialogue?: TDialogue) {
    super(id, name, { isTalking: false });
    this.role = role;
    this.dialogueTree = dialogue;
    this.addTag('npc');
  }

  public setDialogue(dialogue: TDialogue): void {
    this.dialogueTree = dialogue;
  }

  /**
   * Mở hội thoại với người chơi.
   *
   * Trước đây `interactor` bị bỏ qua hoàn toàn và `distance` luôn bằng `2.5`
   * — tức là "return có sẵn". Nay khoảng cách được tính từ vị trí thật của hai
   * bên, và chỉ mở hội thoại khi thực sự có người tương tác.
   */
  public interact(interactor: Player<any, any, any>): InteractionPrompt {
    const distance = interactor
      ? Math.hypot(
          interactor.transform.position[0] - this.transform.position[0],
          interactor.transform.position[1] - this.transform.position[1],
          interactor.transform.position[2] - this.transform.position[2],
        )
      : Number.POSITIVE_INFINITY;
    this.state.isTalking = Boolean(interactor);
    return {
      promptId: `talk_${this.id}`,
      label: `Talk to ${this.name}`,
      action: 'open_dialogue',
      distance,
    };
  }
}

/**
 * Generic Bot / AI controlled monster, minion, or hostile agent.
 */
export class Bot<TBehavior = any, TBlackboard = Record<string, any>> extends Entity<{
  aiState: 'idle' | 'patrol' | 'chase' | 'attack' | 'flee';
}> {
  public health: HealthPool;
  public aiBehavior?: TBehavior;
  public blackboard: TBlackboard;
  public targetEntity: Entity | null = null;
  public perceptionRadius = 15;
  public attackRadius = 2.5;
  public patrolPath: [number, number, number][] = [];
  public currentPatrolIndex = 0;

  constructor(id: string, name: string, maxHealth = 100, initialBlackboard?: TBlackboard) {
    super(id, name, { aiState: 'idle' });
    this.health = new HealthPool(maxHealth);
    this.blackboard = (initialBlackboard ?? {}) as TBlackboard;
    this.addTag('bot');
  }

  public setTarget(target: Entity | null): void {
    this.targetEntity = target;
    if (target) {
      this.state.aiState = 'chase';
    } else {
      this.state.aiState = 'idle';
    }
  }

  public setPatrolPath(points: [number, number, number][]): void {
    this.patrolPath = points;
    this.currentPatrolIndex = 0;
    if (points.length > 0) {
      this.state.aiState = 'patrol';
    }
  }

  public override update(dt: number): void {
    super.update(dt);
    this.health.tick(dt, this.state.aiState === 'attack' || this.state.aiState === 'chase');

    if (this.health.isDead) {
      this.lifecycle = 'dead';
      return;
    }

    // AI State Machine update logic
    if (this.targetEntity) {
      const dx = this.targetEntity.transform.position[0] - this.transform.position[0];
      const dy = this.targetEntity.transform.position[1] - this.transform.position[1];
      const dz = this.targetEntity.transform.position[2] - this.transform.position[2];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq <= this.attackRadius * this.attackRadius) {
        this.state.aiState = 'attack';
      } else if (distSq <= this.perceptionRadius * this.perceptionRadius) {
        this.state.aiState = 'chase';
      } else {
        // Lost target
        this.targetEntity = null;
        this.state.aiState = this.patrolPath.length > 0 ? 'patrol' : 'idle';
      }
    }
  }
}

/**
 * Generic Pet companion following an owner entity with configurable stances.
 */
export class Pet<TOwner extends Entity = Entity> extends Entity<{
  stance: 'passive' | 'defensive' | 'aggressive';
}> {
  public owner: TOwner;
  public followDistance = 3.0;
  public movementSpeed = 6.0;

  constructor(id: string, name: string, owner: TOwner) {
    super(id, name, { stance: 'defensive' });
    this.owner = owner;
    this.addTag('pet');
  }

  public override update(dt: number): void {
    super.update(dt);
    if (!this.owner) return;

    // Follow logic
    const ox = this.owner.transform.position[0];
    const oy = this.owner.transform.position[1];
    const oz = this.owner.transform.position[2];

    const dx = ox - this.transform.position[0];
    const dy = oy - this.transform.position[1];
    const dz = oz - this.transform.position[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > this.followDistance) {
      const step = (this.movementSpeed * dt) / dist;
      this.transform.position[0] += dx * Math.min(step, 1);
      this.transform.position[1] += dy * Math.min(step, 1);
      this.transform.position[2] += dz * Math.min(step, 1);
    }
  }
}

/**
 * Generic Mount entity providing travel speed boosts and rider docking.
 */
export class Mount<TRider extends Entity = Entity> extends Entity<{ isMounted: boolean }> {
  public rider: TRider | null = null;
  public speedMultiplier = 1.6;
  public staminaPool: EnergyPool;

  constructor(id: string, name: string, speedMultiplier = 1.6) {
    super(id, name, { isMounted: false });
    this.speedMultiplier = speedMultiplier;
    this.staminaPool = new EnergyPool(120, 25);
    this.addTag('mount');
  }

  public mount(rider: TRider): boolean {
    if (this.rider !== null) return false;
    this.rider = rider;
    this.state.isMounted = true;
    return true;
  }

  public dismount(): TRider | null {
    const prev = this.rider;
    this.rider = null;
    this.state.isMounted = false;
    return prev;
  }

  public override update(dt: number): void {
    super.update(dt);
    this.staminaPool.tick(dt);
    if (this.rider) {
      // Sync rider transform with mount
      this.rider.transform.position = [...this.transform.position];
    }
  }
}
