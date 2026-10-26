/**
 * @file crafting-economy.ts
 * @module @aetheria/engine/objects/crafting-economy
 * @description Crafting recipes, workbenches, wallets, currency exchange, and marketplace trading.
 */

export type StationType =
  | 'blacksmith'
  | 'alchemy'
  | 'cooking'
  | 'tailoring'
  | 'carpentry'
  | 'enchanting'
  | 'handicraft';

export type CurrencyType =
  | 'gold'
  | 'silver'
  | 'copper'
  | 'gems'
  | 'honor_points'
  | 'tokens';

export interface CraftingIngredient<TItem = any> {
  itemId: string;
  count: number;
  itemData?: TItem;
}

export interface CraftingRecipe<TInput = any, TOutput = any> {
  id: string;
  name: string;
  station: StationType;
  requiredLevel: number;
  craftingTimeSeconds: number;
  inputs: CraftingIngredient<TInput>[];
  output: {
    itemId: string;
    count: number;
    itemData?: TOutput;
  };
}

export interface MarketListing<TItem = any> {
  listingId: string;
  sellerId: string;
  item: TItem;
  quantity: number;
  unitPrice: number;
  currency: CurrencyType;
  createdAt: number;
}

/**
 * Generic Crafting Recipe validator and executor.
 */
export class Recipe<TInput = any, TOutput = any> {
  public recipe: CraftingRecipe<TInput, TOutput>;

  constructor(recipe: CraftingRecipe<TInput, TOutput>) {
    this.recipe = recipe;
  }

  public canCraft(inventory: any, playerLevel = 1): boolean {
    if (playerLevel < this.recipe.requiredLevel) return false;
    if (!inventory) return false;

    for (const input of this.recipe.inputs) {
      if (typeof inventory.hasItem === 'function') {
        if (!inventory.hasItem(input.itemId, input.count)) return false;
      }
    }
    return true;
  }

  public craft(inventory: any, playerLevel = 1): { itemId: string; count: number; itemData?: TOutput } | null {
    if (!this.canCraft(inventory, playerLevel)) return null;

    // Consume items
    for (const input of this.recipe.inputs) {
      if (typeof inventory.removeItem === 'function') {
        inventory.removeItem(input.itemId, input.count);
      }
    }

    return this.recipe.output;
  }
}

/**
 * Interactive Crafting Station (Anvil, Alchemy Lab, Stove, Loom).
 */
export class CraftingStation {
  public readonly id: string;
  public type: StationType;
  public tier: number;
  public isOccupied = false;
  private _currentUser?: string;

  constructor(id: string, type: StationType, tier = 1) {
    this.id = id;
    this.type = type;
    this.tier = tier;
  }

  public use(userId: string): boolean {
    if (this.isOccupied) return false;
    this.isOccupied = true;
    this._currentUser = userId;
    return true;
  }

  public release(userId: string): boolean {
    if (this._currentUser === userId) {
      this.isOccupied = false;
      this._currentUser = undefined;
      return true;
    }
    return false;
  }
}

/**
 * Currency Wallet managing gold, gems, tokens, and multi-currency balances.
 */
export class CurrencyWallet {
  private _balances: Map<CurrencyType, number> = new Map();

  constructor(initialBalances?: Partial<Record<CurrencyType, number>>) {
    if (initialBalances) {
      for (const [k, v] of Object.entries(initialBalances)) {
        if (typeof v === 'number') {
          this._balances.set(k as CurrencyType, v);
        }
      }
    }
  }

  public getBalance(currency: CurrencyType): number {
    return this._balances.get(currency) ?? 0;
  }

  public has(currency: CurrencyType, amount: number): boolean {
    return this.getBalance(currency) >= amount;
  }

  public deposit(currency: CurrencyType, amount: number): void {
    if (amount <= 0) return;
    const curr = this.getBalance(currency);
    this._balances.set(currency, curr + amount);
  }

  public withdraw(currency: CurrencyType, amount: number): boolean {
    if (amount <= 0) return true;
    if (!this.has(currency, amount)) return false;
    const curr = this.getBalance(currency);
    this._balances.set(currency, curr - amount);
    return true;
  }
}

/**
 * Direct 2-Player or Player-to-NPC trading session.
 */
export class TradeSession<TTrader = any, TItem = any> {
  public partyA: TTrader;
  public partyB: TTrader;
  public offerA: { items: TItem[]; gold: number } = { items: [], gold: 0 };
  public offerB: { items: TItem[]; gold: number } = { items: [], gold: 0 };
  public lockedA = false;
  public lockedB = false;
  public isExecuted = false;

  constructor(partyA: TTrader, partyB: TTrader) {
    this.partyA = partyA;
    this.partyB = partyB;
  }

  public setOfferA(items: TItem[], gold: number): void {
    if (this.lockedA) return;
    this.offerA = { items, gold };
    this.lockedA = false;
    this.lockedB = false; // Reset lock on changes
  }

  public setOfferB(items: TItem[], gold: number): void {
    if (this.lockedB) return;
    this.offerB = { items, gold };
    this.lockedA = false;
    this.lockedB = false;
  }

  public lock(party: 'A' | 'B'): void {
    if (party === 'A') this.lockedA = true;
    if (party === 'B') this.lockedB = true;
  }

  public canExecute(): boolean {
    return this.lockedA && this.lockedB && !this.isExecuted;
  }

  public execute(): boolean {
    if (!this.canExecute()) return false;
    this.isExecuted = true;
    return true;
  }
}

/**
 * Server/Client In-game Marketplace order book.
 */
export class Marketplace<TItem = any> {
  private _listings: Map<string, MarketListing<TItem>> = new Map();

  public listItem(
    listingId: string,
    sellerId: string,
    item: TItem,
    quantity: number,
    unitPrice: number,
    currency: CurrencyType = 'gold'
  ): MarketListing<TItem> {
    const listing: MarketListing<TItem> = {
      listingId,
      sellerId,
      item,
      quantity,
      unitPrice,
      currency,
      createdAt: Date.now(),
    };
    this._listings.set(listingId, listing);
    return listing;
  }

  public cancelListing(listingId: string, requesterId: string): TItem | null {
    const listing = this._listings.get(listingId);
    if (!listing || listing.sellerId !== requesterId) return null;
    this._listings.delete(listingId);
    return listing.item;
  }

  public buyItem(
    listingId: string,
    buyerWallet: CurrencyWallet,
    buyerInventory?: any
  ): boolean {
    const listing = this._listings.get(listingId);
    if (!listing) return false;

    const totalPrice = listing.unitPrice * listing.quantity;
    if (!buyerWallet.withdraw(listing.currency, totalPrice)) {
      return false; // Insufficient funds
    }

    if (buyerInventory?.addItem) {
      buyerInventory.addItem(listing.item, listing.quantity);
    }

    this._listings.delete(listingId);
    return true;
  }

  public getAllListings(): MarketListing<TItem>[] {
    return Array.from(this._listings.values());
  }

  public getListing(listingId: string): MarketListing<TItem> | undefined {
    return this._listings.get(listingId);
  }
}
