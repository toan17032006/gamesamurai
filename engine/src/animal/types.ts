/**
 * @file types.ts
 * @module @aetheria/engine/animal/types
 * @description Comprehensive data types, taxonomy profiles, anatomical structures,
 * and biological state interfaces for the 800 Animal System functions.
 */

import type { Vec3 } from '../types/index.js';

export type AnimalPhylum =
  | 'Chordata'
  | 'Arthropoda'
  | 'Mollusca'
  | 'Cnidaria'
  | 'Annelida'
  | 'Echinodermata'
  | 'Platyhelminthes'
  | 'Nematoda';

export type AnimalClass =
  | 'Mammalia'
  | 'Aves'
  | 'Reptilia'
  | 'Amphibia'
  | 'Actinopterygii'
  | 'Chondrichthyes'
  | 'Insecta'
  | 'Arachnida'
  | 'Cephalopoda';

export type LocomotionType =
  | 'quadrupedal'
  | 'bipedal'
  | 'avian_flight'
  | 'insect_flight'
  | 'aquatic_swimming'
  | 'lateral_undulation'
  | 'concertina'
  | 'rectilinear'
  | 'sidewinding'
  | 'tripod_crawl'
  | 'metachronal'
  | 'peristaltic'
  | 'jet_propulsion'
  | 'brachiation'
  | 'saltatorial';

export type DietType =
  | 'carnivore'
  | 'herbivore'
  | 'omnivore'
  | 'insectivore'
  | 'piscivore'
  | 'frugivore'
  | 'nectarivore'
  | 'detritivore';

export type ActivityPattern = 'diurnal' | 'nocturnal' | 'crepuscular' | 'cathemeral';
export type SocialType = 'solitary' | 'pair' | 'harem' | 'pack' | 'herd' | 'colony' | 'school';
export type DevelopmentType = 'viviparous' | 'oviparous' | 'ovoviviparous' | 'metamorphic';

export interface SpeciesProfile {
  speciesId: string;
  commonName: string;
  scientificName: string;
  phylum: AnimalPhylum;
  class: AnimalClass;
  order: string;
  family: string;
  habitat: string[];
  diet: DietType;
  locomotion: LocomotionType;
  bodyPlan: 'vertebrate' | 'exoskeletal' | 'hydrostatic' | 'radially_symmetric';
  symmetry: 'bilateral' | 'radial' | 'aspherical';
  activityPattern: ActivityPattern;
  socialType: SocialType;
  developmentType: DevelopmentType;
  averageLength: number; // meters
  averageHeight: number; // meters
  averageMass: number; // kg
  baseSpeed: number; // m/s
  lifespanDays: number;
}

export interface AnimalAppearanceConfig {
  bodyColor: string;
  pattern: 'solid' | 'stripes' | 'spots' | 'rosettes' | 'countershading' | 'camouflage' | 'aposematic';
  scale: Vec3;
  length: number;
  height: number;
  bodyMass: number;
  bodyShape: string;
  shadingMode: 'pbr' | 'fur' | 'feather' | 'scales' | 'chitin' | 'wet_skin';
  visibility: boolean;
  opacity: number;
}

export interface BoneTransform {
  position: Vec3;
  rotation: { x: number; y: number; z: number; w: number };
  scale: Vec3;
}

export interface AnimalMuscleState {
  activation: number; // 0 to 1
  force: number; // Newtons
  tension: number;
  stretch: number;
  bulge: number;
}

export interface AnimalSensoryState {
  visualTarget: Vec3 | null;
  visualFieldAngle: number; // degrees
  visualDistance: number;
  motionDetected: boolean;
  nightVisionActive: boolean;
  auditoryFocusTarget: Vec3 | null;
  detectedSounds: { sourceId: string; position: Vec3; intensity: number; frequency: number }[];
  scentTrails: { scentId: string; position: Vec3; intensity: number; composition: string }[];
  groundVibration: number;
  waterCurrentSpeed: number;
  ambientTemperature: number; // Celsius
  ambientHumidity: number;
  /** Độ nhạy khứu giác (0..1) — quyết định ngưỡng phát hiện mùi. */
  smellSensitivity: number;
  /** Tầm phát hiện mùi (m). */
  smellRange: number;
  /** Tầm nghe (m). */
  hearingRange: number;
  /** Tần số âm thanh cao nhất con vật nghe được (Hz). */
  maxFrequency: number;
  /** Tần số âm thanh thấp nhất con vật nghe được (Hz). */
  minFrequency: number;
  /** Các mùi quen thuộc đã ghi nhớ. */
  familiarScents: string[];
  /** Các mùi kẻ săn mồi đã nhận diện. */
  knownPredatorScents: string[];
  /** Mùi bạn đồng loại / bạn tình đã nhận diện. */
  knownMateScent: string | null;
  /** Các mốc lãnh thổ đã đánh dấu. */
  territoryMarkers: string[];
  /** Ngưỡng phát hiện hoá chất (0..1). */
  chemicalThreshold: number;
  /** Cường độ mùi mới nhất. */
  lastScentIntensity: number;
  /** Thành phần mùi mới nhất. */
  lastScentComposition: string;
}

export interface AnimalPhysiologyState {
  heartRate: number; // bpm
  respirationRate: number; // breaths per min
  lungVolume: number;
  gillFlowRate: number;
  bodyTemperature: number; // Celsius
  hydration: number; // 0 to 100
  energyMetabolism: number; // kcal/hr
  metabolicRate: number;
  oxygenSaturation: number; // 0 to 100
  stressLevel: number; // 0 to 100
}

export interface AnimalBehaviorState {
  currentMotivation: 'idle' | 'foraging' | 'hunting' | 'fleeing' | 'sleeping' | 'courting' | 'parenting' | 'grooming' | 'territorial';
  hunger: number; // 0 to 100
  thirst: number; // 0 to 100
  fatigue: number; // 0 to 100
  fear: number; // 0 to 100
  curiosity: number; // 0 to 100
  aggression: number; // 0 to 100
  socialDrive: number; // 0 to 100
  activeThreat: any | null;
  activeTarget: any | null;
}

export interface AnimalConfig {
  id: string;
  species: string;
  profile?: Partial<SpeciesProfile>;
  appearance?: Partial<AnimalAppearanceConfig>;
  initialPosition?: Vec3;
}
