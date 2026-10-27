/**
 * @file types.ts
 * @module @aetheria/engine/world/types
 * @description Comprehensive domain interfaces and types for the World Simulation System (800 functions).
 */

import type { Vec3 } from '../types/index.js';

export interface WorldBounds {
  min: Vec3;
  max: Vec3;
}

export interface WorldConfig {
  id?: string;
  name?: string;
  bounds?: WorldBounds;
  gravity?: Vec3;
  timeScale?: number;
  initialTime?: number; // In seconds or hours
  seed?: number;
}

export interface WorldState {
  id: string;
  time: number;
  isPaused: boolean;
  simulationSpeed: number;
  bounds: WorldBounds;
  loadedRegions: string[];
  activeObjectsCount: number;
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface WorldObject<T = unknown> {
  id: string;
  type: string;
  position: Vec3;
  rotation: { x: number; y: number; z: number; w: number };
  scale: Vec3;
  visible: boolean;
  material?: string;
  texture?: string;
  tags: string[];
  parentId?: string;
  children: string[];
  metadata?: T;
  isDestroyed?: boolean;
}

// Flora & Vegetation
export interface TreeEntity {
  id: string;
  species: string;
  age: number;
  height: number;
  thickness: number;
  health: number;
  canopyRadius: number;
  branches: string[];
  roots: string[];
  position: Vec3;
}

export interface BranchEntity {
  id: string;
  treeId: string;
  parentBranchId?: string;
  length: number;
  thickness: number;
  angle: number;
  flexForce: number;
  isBroken: boolean;
}

export interface LeafEntity {
  id: string;
  plantId: string;
  size: number;
  color: string;
  flutter: number;
  isAttached: boolean;
  position?: Vec3;
  /** Độ cuộn của lá (0 = phẳng, 1 = cuộn kín). */
  curl?: number;
  /** Độ rũ xuống (0 = ngẩng, 1 = rũ hẳn). */
  droop?: number;
  /** Độ uốn do lực tác dụng (rad). */
  bend?: number;
  /** Góc xoắn (rad). */
  twist?: number;
  /** Lá đang gập hay không. */
  folded?: boolean;
}

export interface RootEntity {
  id: string;
  treeId: string;
  length: number;
  depth: number;
  stability: number;
}

export interface FlowerEntity {
  id: string;
  plantId: string;
  bloomState: number; // 0 (bud) to 1 (full bloom)
  petalColor: string;
  isOpen: boolean;
}

export interface FruitEntity {
  id: string;
  plantId: string;
  ripeness: number; // 0 to 1
  isDetached: boolean;
}

export interface SeedEntity {
  id: string;
  species: string;
  germinated: boolean;
}

// Terrain, Geology & Water
export interface RockEntity {
  id: string;
  type: string;
  hardness: number;
  fractureStress: number;
  isFractured: boolean;
  fragments: string[];
}

export interface MountainRegion {
  id: string;
  height: number;
  slopeStability: number;
  erosionRate: number;
  hasSnow: boolean;
}

export interface SoilPatch {
  id: string;
  moisture: number;
  compaction: number;
  fertility: number;
  mudLevel: number;
}

export interface WaterBodyEntity {
  id: string;
  type: 'ocean' | 'lake' | 'river' | 'stream' | 'pond';
  waterLevel: number;
  flowSpeed: number;
  isFrozen: boolean;
}

// Weather, Atmosphere & Fire
export interface WindState {
  direction: Vec3;
  speed: number;
  gustiness: number;
  pressure: number;
}

export interface WeatherState {
  rainIntensity: number;
  snowIntensity: number;
  hailIntensity: number;
  cloudCover: number;
  fogDensity: number;
  temperature: number; // Celsius
  humidity: number; // 0 - 100%
  airPressure: number; // hPa
}

export interface FireEntity {
  id: string;
  targetId: string;
  temperature: number;
  intensity: number;
  spreadRate: number;
  isExtinguished: boolean;
}

export interface LightningBolt {
  id: string;
  origin: Vec3;
  target: Vec3;
  intensity: number;
}

// Buildings & Architecture
export interface BuildingEntity {
  id: string;
  type: string;
  integrity: number; // 0 - 100%
  mass: number;
  centerOfMass: Vec3;
  foundation: boolean;
  walls: string[];
  roofs: string[];
  doors: string[];
  windows: string[];
  isCollapsed: boolean;
}

export interface StructuralElement {
  id: string;
  buildingId: string;
  loadCapacity: number;
  currentStress: number;
  isBuckled: boolean;
}

export interface WallSection {
  id: string;
  buildingId: string;
  health: number;
  isCracked: boolean;
  isCollapsed: boolean;
}

export interface RoofSection {
  id: string;
  buildingId: string;
  isCollapsed: boolean;
}

export interface FurnitureEntity {
  id: string;
  type: string;
  position: Vec3;
  isToppled: boolean;
  isBroken: boolean;
}

// Physics, Materials & Tools
export interface RigidBodyData {
  mass: number;
  density: number;
  friction: number;
  restitution: number;
  velocity: Vec3;
  angularVelocity: Vec3;
}

export interface SoftBodyData {
  stiffness: number;
  damping: number;
  stretchResistance: number;
}

export interface ToolImpact {
  toolType: string;
  kineticEnergy: number;
  sharpness: number;
  contactPoint: Vec3;
}

export interface FractureGraph {
  nodes: Vec3[];
  edges: [number, number][];
  fractureEnergy: number;
}

export interface ParticleEffectSystem {
  id: string;
  type: string;
  activeCount: number;
  maxCount: number;
}
