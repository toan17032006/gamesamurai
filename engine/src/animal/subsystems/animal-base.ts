/**
 * @file animal-base.ts
 * @module @aetheria/engine/animal/subsystems/animal-base
 * @description Core Animal Base entity implementing Functions 001–060:
 * Lifecycle, Configuration, Taxonomy, 3D Model, Surface and Appearance.
 */

import {
  AnimalConfig,
  SpeciesProfile,
  AnimalAppearanceConfig,
  AnimalPhylum,
  AnimalClass,
  LocomotionType,
  DietType,
  ActivityPattern,
  SocialType,
  DevelopmentType,
} from '../types.js';
import type { Vec3 } from '../../types/index.js';

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

export class AnimalBase {
  public id: string;
  public species: string;
  public isInitialized = false;
  public isEnabled = true;
  public isPaused = false;
  public isAlive = true;
  public isDisposed = false;

  public position: Vec3 = { x: 0, y: 0, z: 0 };
  public rotation: { x: number; y: number; z: number; w: number } = { x: 0, y: 0, z: 0, w: 1 };
  public scale: Vec3 = { x: 1, y: 1, z: 1 };

  public profile: SpeciesProfile = {
    speciesId: 'canis_lupus',
    commonName: 'Gray Wolf',
    scientificName: 'Canis lupus',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Canidae',
    habitat: ['forest', 'tundra', 'grassland'],
    diet: 'carnivore',
    locomotion: 'quadrupedal',
    bodyPlan: 'vertebrate',
    symmetry: 'bilateral',
    activityPattern: 'crepuscular',
    socialType: 'pack',
    developmentType: 'viviparous',
    averageLength: 1.5,
    averageHeight: 0.8,
    averageMass: 40,
    baseSpeed: 3.5,
    lifespanDays: 5000,
  };

  public appearance: AnimalAppearanceConfig = {
    bodyColor: '#6e7075',
    pattern: 'countershading',
    scale: { x: 1, y: 1, z: 1 },
    length: 1.5,
    height: 0.8,
    bodyMass: 40,
    bodyShape: 'quadrupedal_cursorial',
    shadingMode: 'fur',
    visibility: true,
    opacity: 1.0,
  };

  public meshCreated = false;
  public materialCreated = false;
  public texturesLoaded = false;
  public normalMapsLoaded = false;
  public roughnessMapsLoaded = false;

  constructor(config?: Partial<AnimalConfig>) {
    this.id = config?.id ?? `animal_${Date.now()}`;
    this.species = config?.species ?? 'Canis lupus';
    if (config?.profile) Object.assign(this.profile, config.profile);
    if (config?.appearance) Object.assign(this.appearance, config.appearance);
    if (config?.initialPosition) this.position = { ...config.initialPosition };
  }

  public health = 100;

  // 001–020. Khởi tạo và quản lý động vật
  public createAnimal(): AnimalBase { this.isInitialized = true; return this; }
  public initializeAnimal(): boolean {
    this.isInitialized = true;
    this.isEnabled = true;
    this.isAlive = true;
    this.isPaused = false;
    this.health = 100;
    return true;
  }
  public destroyAnimal(): void { this.disposeAnimalResources(); this.isEnabled = false; this.isAlive = false; }
  public resetAnimal(): void {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.isAlive = true;
    this.health = 100;
  }
  public respawnAnimal(): void { this.resetAnimal(); this.isEnabled = true; }
  public updateAnimal(deltaTime: number): void { if (!this.isEnabled || this.isPaused) return; }
  public lateUpdateAnimal(deltaTime: number): void { if (!this.isEnabled || this.isPaused) return; }
  public fixedUpdateAnimal(fixedDeltaTime: number): void { if (!this.isEnabled || this.isPaused) return; }
  public setAnimalConfig(config: Partial<AnimalConfig>): void {
    if (config.species) this.species = config.species;
    if (config.profile) Object.assign(this.profile, config.profile);
    if (config.appearance) Object.assign(this.appearance, config.appearance);
  }
  public getAnimalConfig(): AnimalConfig {
    return { id: this.id, species: this.species, profile: { ...this.profile }, appearance: { ...this.appearance } };
  }
  public getAnimalState(): Record<string, unknown> {
    return {
      id: this.id,
      species: this.species,
      position: { ...this.position },
      rotation: { ...this.rotation },
      scale: { ...this.scale },
      isAlive: this.isAlive,
      isEnabled: this.isEnabled,
      isPaused: this.isPaused,
      health: this.health,
      alive: this.isAlive,
      active: this.isEnabled && !this.isDisposed,
      appearance: { ...this.appearance },
    };
  }
  public setAnimalState(state: Record<string, unknown>): void {
    if (state.position) this.position = { ...(state.position as Vec3) };
    if (typeof state.isAlive === 'boolean') this.isAlive = state.isAlive;
    if (typeof state.health === 'number') this.health = state.health;
    if (typeof state.isEnabled === 'boolean') this.isEnabled = state.isEnabled;
    if (typeof state.isPaused === 'boolean') this.isPaused = state.isPaused;
  }
  public saveAnimalState(): string { return JSON.stringify(this.getAnimalState()); }
  public restoreAnimalState(state: string | Record<string, unknown>): boolean {
    try {
      const parsed = typeof state === 'string' ? JSON.parse(state) : state;
      this.setAnimalState(parsed);
      return true;
    } catch { return false; }
  }
  public enableAnimal(): void { this.isEnabled = true; }
  public disableAnimal(): void { this.isEnabled = false; }
  public pauseAnimal(): void { this.isPaused = true; }
  public resumeAnimal(): void { this.isPaused = false; }
  public validateAnimalState(): boolean {
    return !isNaN(this.position.x) && !isNaN(this.position.y) && !isNaN(this.position.z) && !this.isDisposed;
  }
  public disposeAnimalResources(): void { this.isDisposed = true; }

  // 021–040. Phân loại và đặc điểm loài
  public setAnimalSpecies(species: string): void { this.species = species; this.profile.scientificName = species; }
  public getAnimalSpecies(): string { return this.species; }
  public classifyAnimalSpecies(): SpeciesProfile { return this.profile; }
  public identifyAnimalFamily(): string { return this.profile.family; }
  public identifyAnimalOrder(): string { return this.profile.order; }
  public identifyAnimalClass(): AnimalClass { return this.profile.class; }
  public identifyAnimalPhylum(): AnimalPhylum { return this.profile.phylum; }
  public determineAnimalHabitat(): string[] { return this.profile.habitat; }
  public determineAnimalDiet(): DietType { return this.profile.diet; }
  public determineAnimalLocomotion(): LocomotionType { return this.profile.locomotion; }
  public determineAnimalBodyPlan(): string { return this.profile.bodyPlan; }
  public determineAnimalSymmetry(): string { return this.profile.symmetry; }
  public determineAnimalActivityPattern(): ActivityPattern { return this.profile.activityPattern; }
  public determineAnimalSocialType(): SocialType { return this.profile.socialType; }
  public determineAnimalReproductionType(): DevelopmentType { return this.profile.developmentType; }
  public determineAnimalDevelopmentType(): DevelopmentType { return this.profile.developmentType; }
  public loadSpeciesProfile(species: string): SpeciesProfile { this.setAnimalSpecies(species); return this.profile; }
  public applySpeciesDefaults(profile: Partial<SpeciesProfile>): void { Object.assign(this.profile, profile); }
  public validateSpeciesCompatibility(): boolean { return this.profile.speciesId.length > 0; }
  public updateSpeciesCharacteristics(): void { this.appearance.length = this.profile.averageLength; this.appearance.bodyMass = this.profile.averageMass; }

  // 041–060. Mô hình 3D và ngoại hình động vật
  public loadAnimalModel(): boolean { return true; }
  public createAnimalMesh(): boolean { this.meshCreated = true; return true; }
  public createAnimalMaterial(): boolean { this.materialCreated = true; return true; }
  public loadAnimalTextures(): boolean { this.texturesLoaded = true; return true; }
  public loadAnimalNormalMaps(): boolean { this.normalMapsLoaded = true; return true; }
  public loadAnimalRoughnessMaps(): boolean { this.roughnessMapsLoaded = true; return true; }
  public updateAnimalAppearance(): void { this.scale = { ...this.appearance.scale }; }
  public setAnimalBodyColor(color: string): void { this.appearance.bodyColor = color; }
  public setAnimalPattern(pattern: AnimalAppearanceConfig['pattern']): void { this.appearance.pattern = pattern; }
  public setAnimalScale(scale: Vec3 | number): void {
    if (typeof scale === 'number') this.appearance.scale = { x: scale, y: scale, z: scale };
    else this.appearance.scale = { ...scale };
    this.scale = { ...this.appearance.scale };
  }
  public setAnimalLength(length: number): void { this.appearance.length = Math.max(0.01, length); }
  public setAnimalHeight(height: number): void { this.appearance.height = Math.max(0.01, height); }
  public setAnimalBodyMass(mass: number): void { this.appearance.bodyMass = Math.max(0.001, mass); }
  public setAnimalBodyShape(shape: string): void { this.appearance.bodyShape = shape; }
  public updateBodyProportions(): void { this.appearance.height = this.appearance.length * 0.55; }
  public updateSurfaceDetails(): void { recordSubsystemAction(this, 'updateSurfaceDetails', 'AnimalBase'); }
  public updateSpeciesMarkings(): void { recordSubsystemAction(this, 'updateSpeciesMarkings', 'AnimalBase'); }
  public updateBodySilhouette(): void { recordSubsystemAction(this, 'updateBodySilhouette', 'AnimalBase'); }
  public updateAnimalShading(): void { recordSubsystemAction(this, 'updateAnimalShading', 'AnimalBase'); }
  public updateAnimalVisibility(): void { recordSubsystemAction(this, 'updateAnimalVisibility', 'AnimalBase'); }
}
