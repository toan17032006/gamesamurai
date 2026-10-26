/**
 * @file world-objects.ts
 * @module @aetheria/engine/objects/world-objects
 * @description Interactive world objects including Trees, Houses, Harvestables, Breakables, and Switches.
 */

import { Transform3D } from './entities.js';

export type SwitchState = 'open' | 'closed' | 'locked' | 'jammed';

export interface HarvestYield<TYield = any> {
  resourceId: string;
  quantity: number;
  itemData?: TYield;
}

export interface WorldObjectDestructionShard<TShard = any> {
  shardId: string;
  relativePosition: [number, number, number];
  linearVelocity: [number, number, number];
  data?: TShard;
}

/**
 * Base generic World Object placed in 3D scene space.
 */
export class WorldObject<TData = Record<string, any>> {
  public readonly id: string;
  public name: string;
  public transform: Transform3D;
  public isCollidable = true;
  public isInteractable = true;
  public customData: TData;

  constructor(id: string, name: string, initialData?: TData) {
    this.id = id;
    this.name = name;
    this.transform = {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    this.customData = (initialData ?? {}) as TData;
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

  /**
   * Thời gian đã trôi qua (giây) kể từ lần cập nhật gần nhất.
   *
   * Trước đây `update(dt)` của lớp gốc bỏ qua `dt` hoàn toàn nên không có
   * cách nào biết vật thể đã tồn tại bao lâu. Nay thời gian được tích luỹ.
   */
  public elapsedTime = 0;

  public update(dt: number): void {
    const step = Number.isFinite(dt) && dt > 0 ? dt : 0;
    this.elapsedTime += step;
  }
}

/**
 * Interactive Tree object (Oak, Pine, Birch) supporting chopping, felling, and regrowth.
 */
export class TreeObject extends WorldObject<{
  woodType: string;
  foliageType: string;
  logCount: number;
}> {
  public health: number;
  public maxHealth: number;
  public isFelled = false;
  public regrows = true;
  public regrowthTimeSeconds = 120;
  private _regrowthTimer = 0;

  constructor(
    id: string,
    woodType = 'oak',
    foliageType = 'dense_canopy',
    health = 50,
    logYield = 3
  ) {
    super(id, `Tree_${woodType}`, { woodType, foliageType, logCount: logYield });
    this.health = health;
    this.maxHealth = health;
  }

  public chop(axePower = 10): { felled: boolean; logsProduced: number } {
    if (this.isFelled) return { felled: false, logsProduced: 0 };

    this.health -= Math.max(1, axePower);
    if (this.health <= 0) {
      this.health = 0;
      this.isFelled = true;
      this._regrowthTimer = this.regrowthTimeSeconds;
      return { felled: true, logsProduced: this.customData.logCount };
    }
    return { felled: false, logsProduced: 0 };
  }

  public override update(dt: number): void {
    super.update(dt);
    if (this.isFelled && this.regrows) {
      this._regrowthTimer -= dt;
      if (this._regrowthTimer <= 0) {
        this.isFelled = false;
        this.health = this.maxHealth;
      }
    }
  }
}

/**
 * Interactive House / Building object with doors, interior occupancy, and roof hiding.
 */
export class HouseObject extends WorldObject<{
  buildingType: string;
  roomCount: number;
  hasRoof: boolean;
}> {
  public occupants: Set<string> = new Set();
  public doors: InteractiveSwitch[] = [];
  public isRoofVisible = true;

  constructor(id: string, buildingType = 'cottage', roomCount = 2) {
    super(id, `House_${buildingType}`, { buildingType, roomCount, hasRoof: true });
    // Default front door
    this.doors.push(new InteractiveSwitch(`${id}_front_door`, 'Front Door'));
  }

  public enter(entityId: string): void {
    this.occupants.add(entityId);
    if (this.occupants.size > 0) {
      this.isRoofVisible = false; // Hide roof to inspect interior
    }
  }

  public exit(entityId: string): void {
    this.occupants.delete(entityId);
    if (this.occupants.size === 0) {
      this.isRoofVisible = true; // Restore roof
    }
  }

  public isOccupied(): boolean {
    return this.occupants.size > 0;
  }

  public getFrontDoor(): InteractiveSwitch | undefined {
    return this.doors[0];
  }
}

/**
 * Harvestable Resource Node (Ore vein, Herb patch, Fishing spot).
 */
export class HarvestableResource<TYield = any> extends WorldObject<{
  resourceType: string;
  tier: number;
  itemData?: TYield;
}> {
  public remainingUnits: number;
  public maxUnits: number;
  public respawnTimerSeconds: number;
  private _currentRespawnTimer = 0;

  constructor(
    id: string,
    resourceType: string,
    tier = 1,
    units = 5,
    respawnSeconds = 60,
    itemData?: TYield
  ) {
    super(id, `ResourceNode_${resourceType}`, { resourceType, tier, itemData });
    this.remainingUnits = units;
    this.maxUnits = units;
    this.respawnTimerSeconds = respawnSeconds;
  }

  public get isDepleted(): boolean {
    return this.remainingUnits <= 0;
  }

  public harvest(toolPower = 1): HarvestYield<TYield>[] {
    if (this.isDepleted) return [];

    const unitsToExtract = Math.min(this.remainingUnits, Math.max(1, toolPower));
    this.remainingUnits -= unitsToExtract;

    if (this.isDepleted) {
      this._currentRespawnTimer = this.respawnTimerSeconds;
    }

    return [
      {
        resourceId: this.customData.resourceType,
        quantity: unitsToExtract,
        itemData: this.customData.itemData,
      },
    ];
  }

  public override update(dt: number): void {
    super.update(dt);
    if (this.isDepleted) {
      this._currentRespawnTimer -= dt;
      if (this._currentRespawnTimer <= 0) {
        this.remainingUnits = this.maxUnits;
      }
    }
  }
}

/**
 * Breakable Object (Pots, Crates, Barrels, Destructible Walls).
 */
export class BreakableObject<TShard = any> extends WorldObject<{
  breakableType: string;
  debrisCount: number;
}> {
  public health: number;
  public maxHealth: number;
  public isBroken = false;
  public shards: WorldObjectDestructionShard<TShard>[] = [];

  constructor(id: string, breakableType = 'wooden_crate', health = 20, debrisCount = 6) {
    super(id, `Breakable_${breakableType}`, { breakableType, debrisCount });
    this.health = health;
    this.maxHealth = health;
  }

  public shatter(impactForce = 25): WorldObjectDestructionShard<TShard>[] {
    if (this.isBroken) return [];
    this.health -= impactForce;

    if (this.health <= 0) {
      this.isBroken = true;
      this.isCollidable = false;
      this.shards = [];

      for (let i = 0; i < this.customData.debrisCount; i++) {
        this.shards.push({
          shardId: `${this.id}_shard_${i}`,
          relativePosition: [
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
          ],
          linearVelocity: [
            (Math.random() - 0.5) * 8,
            Math.random() * 5 + 2,
            (Math.random() - 0.5) * 8,
          ],
        });
      }
      return this.shards;
    }

    return [];
  }
}

/**
 * Interactive Switch / Door / Lever / Pressure Plate.
 */
export class InteractiveSwitch<TState extends SwitchState = SwitchState> extends WorldObject<{
  keyItemId?: string;
}> {
  public state: TState;
  public onStateChanged?: (newState: TState) => void;

  constructor(id: string, name: string, initialState: TState = 'closed' as TState, keyItemId?: string) {
    super(id, name, { keyItemId });
    this.state = initialState;
  }

  public toggle(): boolean {
    if (this.state === 'locked' || this.state === 'jammed') return false;
    this.state = (this.state === 'open' ? 'closed' : 'open') as TState;
    this.onStateChanged?.(this.state);
    return true;
  }

  public unlock(providedKeyId?: string): boolean {
    if (this.state !== 'locked') return true;
    if (!this.customData.keyItemId || this.customData.keyItemId === providedKeyId) {
      this.state = 'closed' as TState;
      this.onStateChanged?.(this.state);
      return true;
    }
    return false;
  }

  public lock(requiredKeyId?: string): void {
    this.state = 'locked' as TState;
    if (requiredKeyId) {
      this.customData.keyItemId = requiredKeyId;
    }
    this.onStateChanged?.(this.state);
  }
}

/**
 * Campfire object providing light, warmth, and cooking capabilities.
 */
export class CampfireObject extends WorldObject<{ heatRadius: number }> {
  public isLit = false;
  public fuelSeconds = 0;

  constructor(id: string, heatRadius = 6, initialFuel = 180) {
    super(id, 'Campfire', { heatRadius });
    this.fuelSeconds = initialFuel;
    this.isLit = initialFuel > 0;
  }

  public addFuel(seconds: number): void {
    this.fuelSeconds += Math.max(0, seconds);
    if (!this.isLit && this.fuelSeconds > 0) {
      this.isLit = true;
    }
  }

  public ignite(): boolean {
    if (this.fuelSeconds > 0) {
      this.isLit = true;
      return true;
    }
    return false;
  }

  public extinguish(): void {
    this.isLit = false;
  }

  public override update(dt: number): void {
    super.update(dt);
    if (this.isLit) {
      this.fuelSeconds = Math.max(0, this.fuelSeconds - dt);
      if (this.fuelSeconds <= 0) {
        this.isLit = false;
      }
    }
  }
}

/**
 * Portal Gate for teleporting between map coordinates, dimensions, or instances.
 */
export class PortalGate<TDestination = Transform3D> extends WorldObject<{
  destination: TDestination;
  requiredKey?: string;
}> {
  public isActive = true;

  constructor(id: string, name: string, destination: TDestination, requiredKey?: string) {
    super(id, name, { destination, requiredKey });
  }

  public canTeleport(keyItem?: string): boolean {
    if (!this.isActive) return false;
    if (this.customData.requiredKey) {
      return this.customData.requiredKey === keyItem;
    }
    return true;
  }

  public getDestination(): TDestination {
    return this.customData.destination;
  }
}
