/**
 * @file inventory.ts
 * @module @aetheria/engine/objects/inventory
 * @description Generic item, inventory, equipment, loot table, and container systems for RPGs.
 */

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'artifact';

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'consumable'
  | 'material'
  | 'quest'
  | 'currency'
  | 'misc';

export interface Item<TMetadata = Record<string, any>> {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackSize?: number;
  maxStack?: number;
  weight?: number;
  value?: number;
  metadata?: TMetadata;
}

export interface EquipmentItem<TSlot extends string = string, TStats = Record<string, number>> extends Item {
  slot: TSlot;
  requiredLevel?: number;
  stats?: TStats;
  durability?: number;
  maxDurability?: number;
}

export interface ConsumableItem<TEffect = Record<string, any>> extends Item {
  effect: TEffect;
  cooldownSeconds?: number;
  consumeOnUse?: boolean;
}

export interface WeaponItem<TWeaponType extends string = string, TStats = Record<string, number>>
  extends EquipmentItem<'main_hand' | 'off_hand' | 'two_hand', TStats> {
  weaponType: TWeaponType;
  baseDamageMin: number;
  baseDamageMax: number;
  attackSpeed: number;
  range?: number;
}

export interface InventorySlot<TItem extends Item = Item> {
  slotIndex: number;
  item?: TItem;
  quantity: number;
  isLocked?: boolean;
}

export interface LootEntry<TItem extends Item = Item> {
  item: TItem;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
  isGuaranteed?: boolean;
}

/**
 * Generic Inventory container supporting stacking, capacity limits, filtering, and sorting.
 */
export class Inventory<TItem extends Item = Item> {
  private _slots: (InventorySlot<TItem> | null)[] = [];
  private _capacity: number;
  private _maxWeight: number;

  constructor(capacity = 30, maxWeight = 100) {
    this._capacity = Math.max(1, capacity);
    this._maxWeight = maxWeight;
    for (let i = 0; i < this._capacity; i++) {
      this._slots.push(null);
    }
  }

  public get capacity(): number {
    return this._capacity;
  }

  public get maxWeight(): number {
    return this._maxWeight;
  }

  public get totalWeight(): number {
    let total = 0;
    for (const slot of this._slots) {
      if (slot && slot.item) {
        total += (slot.item.weight ?? 0) * slot.quantity;
      }
    }
    return total;
  }

  public isFull(): boolean {
    return this.getAvailableSlotIndex() === -1;
  }

  public getAvailableSlotIndex(): number {
    return this._slots.findIndex((s) => s === null);
  }

  public addItem(item: TItem, quantity = 1): boolean {
    if (quantity <= 0) return false;
    const maxStack = item.maxStack ?? 99;

    let remaining = quantity;

    // 1. Try stacking onto existing slots
    for (let i = 0; i < this._slots.length; i++) {
      const slot = this._slots[i];
      if (slot && slot.item && slot.item.id === item.id) {
        const space = maxStack - slot.quantity;
        if (space > 0) {
          const toAdd = Math.min(space, remaining);
          slot.quantity += toAdd;
          remaining -= toAdd;
          if (remaining <= 0) return true;
        }
      }
    }

    // 2. Put remainder into free slots
    while (remaining > 0) {
      const freeIdx = this.getAvailableSlotIndex();
      if (freeIdx === -1) return false; // Inventory full
      const toAdd = Math.min(maxStack, remaining);
      this._slots[freeIdx] = {
        slotIndex: freeIdx,
        item,
        quantity: toAdd,
      };
      remaining -= toAdd;
    }

    return true;
  }

  public removeItem(itemId: string, quantity = 1): boolean {
    if (!this.hasItem(itemId, quantity)) return false;

    let needed = quantity;
    for (let i = this._slots.length - 1; i >= 0; i--) {
      const slot = this._slots[i];
      if (slot && slot.item && slot.item.id === itemId) {
        if (slot.quantity <= needed) {
          needed -= slot.quantity;
          this._slots[i] = null;
        } else {
          slot.quantity -= needed;
          needed = 0;
        }
        if (needed <= 0) break;
      }
    }
    return true;
  }

  public hasItem(itemId: string, quantity = 1): boolean {
    return this.getItemCount(itemId) >= quantity;
  }

  public getItemCount(itemId: string): number {
    let count = 0;
    for (const slot of this._slots) {
      if (slot && slot.item && slot.item.id === itemId) {
        count += slot.quantity;
      }
    }
    return count;
  }

  public getItem(itemId: string): TItem | undefined {
    for (const slot of this._slots) {
      if (slot && slot.item && slot.item.id === itemId) {
        return slot.item;
      }
    }
    return undefined;
  }

  public getSlot(index: number): InventorySlot<TItem> | null {
    if (index < 0 || index >= this._slots.length) return null;
    return this._slots[index];
  }

  public getAllItems(): { item: TItem; quantity: number; slotIndex: number }[] {
    const res: { item: TItem; quantity: number; slotIndex: number }[] = [];
    for (let i = 0; i < this._slots.length; i++) {
      const s = this._slots[i];
      if (s && s.item) {
        res.push({ item: s.item, quantity: s.quantity, slotIndex: i });
      }
    }
    return res;
  }

  public clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this._slots[i] = null;
    }
  }

  public filter(predicate: (item: TItem) => boolean): TItem[] {
    const list: TItem[] = [];
    for (const slot of this._slots) {
      if (slot && slot.item && predicate(slot.item)) {
        list.push(slot.item);
      }
    }
    return list;
  }

  public sort(compareFn: (a: TItem, b: TItem) => number): void {
    const items = this.getAllItems();
    items.sort((a, b) => compareFn(a.item, b.item));
    this.clear();
    for (const entry of items) {
      this.addItem(entry.item, entry.quantity);
    }
  }

  public serialize(): string {
    return JSON.stringify(this._slots);
  }

  public deserialize(json: string): void {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        this._slots = parsed;
        this._capacity = parsed.length;
      }
    } catch {
      // Ignore parse failure
    }
  }
}

/**
 * 2D Grid-based Inventory (Tetris/Diablo style grid layout).
 */
export class InventoryGrid<TItem extends Item = Item> {
  public readonly width: number;
  public readonly height: number;
  private _grid: (TItem | null)[][];
  private _placements: Map<string, { x: number; y: number; w: number; h: number; item: TItem }> = new Map();

  constructor(width = 10, height = 6) {
    this.width = width;
    this.height = height;
    this._grid = Array.from({ length: height }, () => Array(width).fill(null));
  }

  public canPlace(x: number, y: number, w: number, h: number): boolean {
    if (x < 0 || y < 0 || x + w > this.width || y + h > this.height) return false;
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (this._grid[row][col] !== null) return false;
      }
    }
    return true;
  }

  public placeItem(item: TItem, x: number, y: number, w = 1, h = 1): boolean {
    if (!this.canPlace(x, y, w, h)) return false;
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        this._grid[row][col] = item;
      }
    }
    this._placements.set(item.id, { x, y, w, h, item });
    return true;
  }

  public removeItem(itemId: string): boolean {
    const placement = this._placements.get(itemId);
    if (!placement) return false;

    for (let row = placement.y; row < placement.y + placement.h; row++) {
      for (let col = placement.x; col < placement.x + placement.w; col++) {
        this._grid[row][col] = null;
      }
    }
    this._placements.delete(itemId);
    return true;
  }

  public getItemAt(x: number, y: number): TItem | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this._grid[y][x];
  }

  public findFreeSlot(w = 1, h = 1): { x: number; y: number } | null {
    for (let y = 0; y <= this.height - h; y++) {
      for (let x = 0; x <= this.width - w; x++) {
        if (this.canPlace(x, y, w, h)) {
          return { x, y };
        }
      }
    }
    return null;
  }

  public getAllPlacements() {
    return Array.from(this._placements.values());
  }
}

/**
 * Generic Equipment Slot manager (helm, chest, main_hand, off_hand, boots, accessories).
 */
export class EquipmentSlots<
  TSlot extends string = string,
  TEquip extends EquipmentItem<TSlot> = EquipmentItem<TSlot>
> {
  private _slots: Map<TSlot, TEquip> = new Map();

  constructor(allowedSlots?: TSlot[]) {
    if (allowedSlots) {
      for (const slot of allowedSlots) {
        this._slots.set(slot, undefined as unknown as TEquip);
      }
    }
  }

  public equip(slot: TSlot, item: TEquip): TEquip | null {
    const previous = this._slots.get(slot) ?? null;
    this._slots.set(slot, item);
    return previous;
  }

  public unequip(slot: TSlot): TEquip | null {
    const current = this._slots.get(slot) ?? null;
    this._slots.delete(slot);
    return current;
  }

  public getEquipped(slot: TSlot): TEquip | undefined {
    return this._slots.get(slot);
  }

  public isSlotEquipped(slot: TSlot): boolean {
    return this._slots.has(slot) && this._slots.get(slot) !== undefined;
  }

  public getAllEquipped(): Record<string, TEquip> {
    const res: Record<string, TEquip> = {};
    for (const [k, v] of this._slots.entries()) {
      if (v) res[k] = v;
    }
    return res;
  }

  public computeCombinedStats(): Record<string, number> {
    const combined: Record<string, number> = {};
    for (const equip of this._slots.values()) {
      if (equip && equip.stats) {
        for (const [stat, val] of Object.entries(equip.stats)) {
          combined[stat] = (combined[stat] ?? 0) + (Number(val) || 0);
        }
      }
    }
    return combined;
  }
}

/**
 * Generic Loot Table supporting weighted random rolls and guaranteed drops.
 */
export class LootTable<TItem extends Item = Item> {
  private _entries: LootEntry<TItem>[] = [];

  public addDrop(entry: LootEntry<TItem>): void {
    this._entries.push(entry);
  }

  public rollDrops(luckMultiplier = 1.0): { item: TItem; quantity: number }[] {
    const results: { item: TItem; quantity: number }[] = [];
    let totalWeight = 0;

    for (const entry of this._entries) {
      if (entry.isGuaranteed) {
        const qty = Math.floor(Math.random() * (entry.maxQuantity - entry.minQuantity + 1)) + entry.minQuantity;
        results.push({ item: entry.item, quantity: qty });
      } else {
        totalWeight += entry.weight * luckMultiplier;
      }
    }

    if (totalWeight <= 0) return results;

    // Roll single random drop from weighted pool
    let roll = Math.random() * totalWeight;
    for (const entry of this._entries) {
      if (entry.isGuaranteed) continue;
      const w = entry.weight * luckMultiplier;
      if (roll <= w) {
        const qty = Math.floor(Math.random() * (entry.maxQuantity - entry.minQuantity + 1)) + entry.minQuantity;
        results.push({ item: entry.item, quantity: qty });
        break;
      }
      roll -= w;
    }

    return results;
  }

  public clear(): void {
    this._entries = [];
  }
}

/**
 * Generic Storage Container (Chest, Bank, Vault, Stash) with locking mechanism.
 */
export class StorageContainer<TItem extends Item = Item> {
  public readonly id: string;
  public name: string;
  private _inventory: Inventory<TItem>;
  private _isLocked: boolean;
  private _keyItemId?: string;

  constructor(id: string, name: string, capacity = 50, isLocked = false, keyItemId?: string) {
    this.id = id;
    this.name = name;
    this._inventory = new Inventory<TItem>(capacity);
    this._isLocked = isLocked;
    this._keyItemId = keyItemId;
  }

  public get inventory(): Inventory<TItem> {
    return this._inventory;
  }

  public get isLocked(): boolean {
    return this._isLocked;
  }

  public unlock(keyItemId?: string): boolean {
    if (!this._isLocked) return true;
    if (!this._keyItemId || this._keyItemId === keyItemId) {
      this._isLocked = false;
      return true;
    }
    return false;
  }

  public lock(keyItemId?: string): void {
    this._isLocked = true;
    if (keyItemId) this._keyItemId = keyItemId;
  }

  public deposit(item: TItem, quantity = 1): boolean {
    if (this._isLocked) return false;
    return this._inventory.addItem(item, quantity);
  }

  public withdraw(itemId: string, quantity = 1): boolean {
    if (this._isLocked) return false;
    return this._inventory.removeItem(itemId, quantity);
  }
}
