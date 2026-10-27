/**
 * @file skins-cosmetics.ts
 * @module @aetheria/engine/objects/skins-cosmetics
 * @description Character skins, dye customization, cosmetic loadouts, and visual aura attachments.
 */

export type SkinSlot =
  | 'head'
  | 'chest'
  | 'legs'
  | 'feet'
  | 'hands'
  | 'cape'
  | 'weapon_skin'
  | 'wings'
  | 'aura';

export type CosmeticTier = 'standard' | 'rare' | 'deluxe' | 'legendary' | 'celestial';

export interface ColorDye<TColor = string> {
  slotName: string;
  colorValue: TColor;
}

export interface SkinMetadata<TMesh = unknown, TMaterial = unknown> {
  tier?: CosmeticTier;
  tags?: string[];
  customMesh?: TMesh;
  customMaterial?: TMaterial;
  glowColor?: string;
}

/**
 * Generic Skin definition for cosmetic overrides.
 */
export class Skin<TMesh = unknown, TMaterial = unknown> {
  public readonly id: string;
  public name: string;
  public slot: SkinSlot;
  public meshData?: TMesh;
  public materialData?: TMaterial;
  public tier: CosmeticTier;
  public dyeSlots: Map<string, string> = new Map();
  public particleEffectId?: string;

  constructor(
    id: string,
    name: string,
    slot: SkinSlot,
    options?: {
      meshData?: TMesh;
      materialData?: TMaterial;
      tier?: CosmeticTier;
      particleEffectId?: string;
    }
  ) {
    this.id = id;
    this.name = name;
    this.slot = slot;
    this.meshData = options?.meshData;
    this.materialData = options?.materialData;
    this.tier = options?.tier ?? 'standard';
    this.particleEffectId = options?.particleEffectId;
  }

  public applyDye(dyeSlot: string, colorHex: string): void {
    this.dyeSlots.set(dyeSlot, colorHex);
  }

  public getDye(dyeSlot: string): string | undefined {
    return this.dyeSlots.get(dyeSlot);
  }

  public clone(): Skin<TMesh, TMaterial> {
    const s = new Skin<TMesh, TMaterial>(this.id, this.name, this.slot, {
      meshData: this.meshData,
      materialData: this.materialData,
      tier: this.tier,
      particleEffectId: this.particleEffectId,
    });
    for (const [k, v] of this.dyeSlots.entries()) {
      s.dyeSlots.set(k, v);
    }
    return s;
  }
}

/**
 * Cosmetic Loadout storing active visual skins across all slots.
 */
export class CosmeticLoadout {
  private _equippedSkins: Map<SkinSlot, Skin> = new Map();

  public equipSkin(skin: Skin): Skin | null {
    const prev = this._equippedSkins.get(skin.slot) ?? null;
    this._equippedSkins.set(skin.slot, skin);
    return prev;
  }

  public unequipSkin(slot: SkinSlot): Skin | null {
    const prev = this._equippedSkins.get(slot) ?? null;
    this._equippedSkins.delete(slot);
    return prev;
  }

  public getSkin(slot: SkinSlot): Skin | undefined {
    return this._equippedSkins.get(slot);
  }

  public isSlotEquipped(slot: SkinSlot): boolean {
    return this._equippedSkins.has(slot);
  }

  public getAllEquipped(): Record<string, Skin> {
    const out: Record<string, Skin> = {};
    for (const [k, v] of this._equippedSkins.entries()) {
      out[k] = v;
    }
    return out;
  }

  public clear(): void {
    this._equippedSkins.clear();
  }
}

/**
 * Outfit & Character Appearance Customizer (Hair, Skin tone, Body Scale, Eye Color).
 */
export class OutfitCustomizer<TOptions extends Record<string, unknown> = Record<string, unknown>> {
  private _options: Map<string, unknown> = new Map();

  constructor(initialOptions?: TOptions) {
    if (initialOptions) {
      for (const [k, v] of Object.entries(initialOptions)) {
        this._options.set(k, v);
      }
    }
  }

  public setOption<K extends keyof TOptions>(key: K, value: TOptions[K]): void {
    this._options.set(String(key), value);
  }

  public getOption<K extends keyof TOptions>(key: K): TOptions[K] | undefined {
    return this._options.get(String(key)) as TOptions[K] | undefined;
  }

  public getAllOptions(): TOptions {
    const res: Record<string, unknown> = {};
    for (const [k, v] of this._options.entries()) {
      res[k] = v;
    }
    return res as TOptions;
  }

  public applyPreset(preset: TOptions): void {
    for (const [k, v] of Object.entries(preset)) {
      this._options.set(k, v);
    }
  }
}

/**
 * Visual Aura Effect attaching glowing / swirling particle effects around a character.
 */
export class AuraEffect {
  public readonly id: string;
  public name: string;
  public intensity: number;
  public color: string;
  public rotationSpeed: number;
  public isAttached = false;
  private _targetEntityId?: string;

  constructor(id: string, name: string, color = '#38bdf8', intensity = 1.0, rotationSpeed = 1.5) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.intensity = intensity;
    this.rotationSpeed = rotationSpeed;
  }

  public attach(entityId: string): void {
    this._targetEntityId = entityId;
    this.isAttached = true;
  }

  public detach(): void {
    this._targetEntityId = undefined;
    this.isAttached = false;
  }

  public getTargetId(): string | undefined {
    return this._targetEntityId;
  }
}
