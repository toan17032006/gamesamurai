// engine/src/types/environment.types.ts — Kiểu dữ liệu môi trường, thiên nhiên, đổ vỡ & tương tác
import type { Vec3 } from './transform.types';

export interface TreeState {
  id: string;
  position: Vec3;
  health: number; // 0..100
  maxHealth: number;
  isFelled: boolean;
  fallDirection?: Vec3;
  fallProgress?: number; // 0..1
  woodYield: number;
  swayIntensity: number;
}

export interface BuildingStructureState {
  id: string;
  name: string;
  position: Vec3;
  integrity: number; // 0..100
  isCollapsed: boolean;
  sectionsBroken: string[];
  rubbleSpawned: boolean;
}

export interface WaterSurfaceState {
  id: string;
  level: number;
  currentVelocity: Vec3;
  waveAmplitude: number;
  waveFrequency: number;
  isFrozen: boolean;
}

export interface WindState {
  direction: Vec3;
  speed: number;
  gustiness: number;
  turbulence: number;
}

export interface TerrainDeformation {
  center: Vec3;
  radius: number;
  depth: number;
  type: 'crater' | 'fissure' | 'mound' | 'trench';
}

export interface InteractivePropState {
  id: string;
  type: 'button' | 'lever' | 'switch' | 'pressure_plate' | 'chest' | 'crate' | 'door' | 'trap' | 'pulley' | 'gear';
  isActivated: boolean;
  stateValue: number; // 0 (off/closed) .. 1 (on/open)
  isLocked?: boolean;
  durability?: number;
}

export interface AnimalEcologicalState {
  id: string;
  species: string;
  behavior: 'grazing' | 'stalking' | 'fleeing' | 'alert' | 'resting' | 'nurturing' | 'playing' | 'hibernating';
  fearLevel: number; // 0..1
  hungerLevel: number;
  targetPosition?: Vec3;
}
