/**
 * @file environmental-dynamics-subsystem.ts
 * @module @aetheria/engine/world/subsystems/environmental-dynamics-subsystem
 * @description Particles, Weathering, Ecosystems, Time Aging, Tool Interaction,
 * Advanced Destruction, Animation & Optimization (661–800).
 */

import { ParticleEffectSystem, ToolImpact, FractureGraph } from '../types.js';
import type { Vec3 } from '../../types/index.js';
import { forceMagnitude, windSpeedOf } from './vegetation-subsystem.js';

/** Đọc một giá trị bất kỳ dưới dạng bản ghi khoá–giá trị. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/** Một hệ sinh thái khu vực. */
export interface Ecosystem {
  id: string;
  region: unknown;
  balance: number;
  vegetationDensity: number;
}

/** Vòng đời của một vật thể trong thế giới. */
export interface ObjectLifecycle {
  id: string;
  age: number;
  health: number;
  isDecayed: boolean;
}

/** Hạt môi trường (phấn hoa, lá rơi, cánh hoa, tro…). */
export interface EnvironmentalParticle {
  id: string;
  position: Vec3;
  velocity: Vec3;
  mass?: number;
  source?: string;
  [key: string]: unknown;
}

/** Một mảnh vỡ sinh ra từ vật thể. */
export interface DebrisFragment {
  id: string;
  position: Vec3;
  velocity: Vec3;
  mass: number;
  size: number;
  source: string;
  [key: string]: unknown;
}

/** Một nửa / một đoạn của vật thể sau khi cắt. */
export interface MeshPart {
  id: string;
  position: Vec3;
  size: number;
  source: string;
  side?: string;
  segment?: number;
  [key: string]: unknown;
}

/** Mẫu vết nứt Voronoi sinh từ va chạm. */
export interface FracturePattern {
  pattern: 'voronoi';
  cells: Vec3[];
  cellCount: number;
  energy: number;
  radius: number;
  center: Vec3;
}

// ---------------------------------------------------------------------------
// Hằng số kỹ thuật — chuẩn suy ra khi công cụ / vật thể không có dữ liệu
// ---------------------------------------------------------------------------

/** Khối lượng mặc định của một công cụ cầm tay (kg). */
const DEFAULT_TOOL_MASS = 2.5;
/** Tốc độ đung đưa mặc định khi dùng công cụ (m/s). */
const DEFAULT_SWING_SPEED = 12;
/** Độ cứng mặc định của vật bị đánh. */
const DEFAULT_TARGET_HARDNESS = 1;

/** Hộp giới hạn theo trục (AABB). */
interface Aabb {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

/** Tốc độ phong hóa theo vật liệu (đơn vị hằng số/giây, mặc định = đá). */
const MATERIAL_WEATHERING: Record<string, number> = Object.freeze({
  stone: 0.05,
  wood: 0.08,
  metal: 0.02,
  glass: 0.01,
  ceramic: 0.015,
  cloth: 0.12,
  soil: 0.2,
});

/** Tuổi thọ danh nghĩa của vật liệu (giây, mặc định = đá). */
const MATERIAL_LIFETIME: Record<string, number> = Object.freeze({
  stone: 5000,
  wood: 2000,
  metal: 8000,
  glass: 3000,
  ceramic: 4000,
  cloth: 800,
  soil: 600,
});

/** Hai hộp AABB có chồng lấn nhau không. */
function boundsOverlap(a: Aabb, b: Aabb): boolean {
  return (
    a.min.x <= b.max.x &&
    a.max.x >= b.min.x &&
    a.min.y <= b.max.y &&
    a.max.y >= b.min.y &&
    a.min.z <= b.max.z &&
    a.max.z >= b.min.z
  );
}

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

export class EnvironmentalDynamicsSubsystem {
  public particleSystems: Map<string, ParticleEffectSystem> = new Map();
  public ecosystems: Map<string, Ecosystem> = new Map();
  public objectLifecycles: Map<string, ObjectLifecycle> = new Map();
  public toolImpacts: ToolImpact[] = [];
  public destructionGraphs: Map<string, FractureGraph> = new Map();
  public animationMixerTime = 0;
  public objectLODs: Map<string, number> = new Map();
  /** Thân cứng của thế giới — dùng cho cơ chế ngủ/thức. */
  public rigidBodies: Map<string, { id: string; active: boolean; idleTicks?: number }> = new Map();

  // 661–680. Hạt bụi, cát bay và hiệu ứng môi trường
  public createParticleSystem(type = 'dust'): ParticleEffectSystem {
    const id = `ps_${Date.now()}`;
    const ps: ParticleEffectSystem = { id, type, activeCount: 50, maxCount: 1000 };
    this.particleSystems.set(id, ps);
    return ps;
  }

  public spawnParticles(system: unknown, count: number): void {
    const ps =
      typeof system === 'string'
        ? this.particleSystems.get(system)
        : asRecord(system)
          ? (system as ParticleEffectSystem)
          : undefined;
    if (ps) ps.activeCount = Math.min(ps.maxCount, ps.activeCount + count);
  }

  public updateParticleMotion(particle: unknown, deltaTime: number): void { recordSubsystemAction(this, 'updateParticleMotion', 'EnvironmentalDynamicsSubsystem'); }
  public applyParticleGravity(particle: unknown): void { recordSubsystemAction(this, 'applyParticleGravity', 'EnvironmentalDynamicsSubsystem'); }
  public applyParticleWind(particle: unknown, wind: unknown): void { recordSubsystemAction(this, 'applyParticleWind', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Hệ số kéo của một hạt.
   *
   * Trước đây luôn `0.2`. Nay suy từ kích thước hạt và mật độ môi trường
   * (hạt nhỏ + môi trường loãng ⇒ kéo lớn hơn).
   */
  public calculateParticleDrag(particle: unknown): number {
    const size = this.extentOf(particle, 0.1);
    const record = asRecord(particle);
    const density = Number(record?.density ?? record?.mediumDensity ?? 1.2);
    const d = Number.isFinite(density) && density > 0 ? density : 1.2;
    const coefficient = 0.47 * (0.1 / Math.max(0.01, size)) * (1.2 / d);
    return Math.min(2, Math.max(0.01, coefficient));
  }

  public simulateDustCloud(position: Vec3, force: unknown) { return { position, radius: 5.0 }; }
  public spreadDustCloud(cloud: unknown, wind: unknown): void { recordSubsystemAction(this, 'spreadDustCloud', 'EnvironmentalDynamicsSubsystem'); }
  public dissipateDustCloud(cloud: unknown, rate: number): void { recordSubsystemAction(this, 'dissipateDustCloud', 'EnvironmentalDynamicsSubsystem'); }
  public createSandBurst(position: Vec3, force: unknown) { return { position }; }
  public simulateBlowingSand(sand: unknown, wind: unknown): void { recordSubsystemAction(this, 'simulateBlowingSand', 'EnvironmentalDynamicsSubsystem'); }
  public simulateDustDevilParticles(particles: unknown): void { recordSubsystemAction(this, 'simulateDustDevilParticles', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Hạt phấn hoa bắt từ cây.
   *
   * Trước đây luôn trả đúng một hạt `pollen_1` bất kể cây ra sao. Nay số hạt
   * suy ra từ sản lượng phấn hoa / kích thước tán cây, và mỗi hạt có vị trí,
   * vận tốc và thời gian sống tính từ dữ liệu cây.
   */
  public spawnPollenParticles(plant: unknown): EnvironmentalParticle[] {
    const count = this.particleCountFor(plant, ['pollenCount', 'pollenOutput', 'pollen'], 12);
    const origin = this.positionOf(plant);
    const spread = this.extentOf(plant, 0.5);
    const plantRecord = asRecord(plant);
    const particles: EnvironmentalParticle[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      particles.push({
        id: `pollen_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 0.25, y: 0.05 + (i % 3) * 0.02, z: offset.z * 0.25 },
        drift: 0.3 + (i % 5) * 0.1,
        lifetime: 10 + (i % 7),
        source: typeof plantRecord?.id === 'string' ? plantRecord.id : 'plant',
      });
    }
    return particles;
  }
  public dispersePollen(pollen: unknown, wind: unknown): void { recordSubsystemAction(this, 'dispersePollen', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Lá rơi từ tán cây.
   *
   * Số lá suy ra từ `leafCount` / kích thước tán; tốc độ rơi và lắc lư theo
   * khối lượng lá và sức gió.
   */
  public spawnFallingLeaves(tree: unknown): EnvironmentalParticle[] {
    const count = this.particleCountFor(tree, ['leafCount', 'leaves', 'canopySize'], 10);
    const origin = this.positionOf(tree);
    const spread = this.extentOf(tree, 1);
    const treeRecord = asRecord(tree);
    const gust = windSpeedOf(treeRecord?.wind ?? treeRecord?.gust ?? 0);
    const mass = Number(treeRecord?.leafMass ?? 0.02);
    const leaves: EnvironmentalParticle[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      leaves.push({
        id: `fall_leaf_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: gust * 0.3, y: -0.2 - mass * 2, z: gust * 0.1 },
        sway: 0.2 + (i % 4) * 0.15,
        area: 0.01 + (i % 3) * 0.004,
        mass,
        source: typeof treeRecord?.id === 'string' ? treeRecord.id : 'tree',
      });
    }
    return leaves;
  }
  public simulateFallingLeafParticles(leaves: unknown): void { recordSubsystemAction(this, 'simulateFallingLeafParticles', 'EnvironmentalDynamicsSubsystem'); }
  /** Cánh hoa rơi — số cánh theo kích thước bông hoa, rơi chậm hơn lá. */
  public spawnFallingPetals(flower: unknown): EnvironmentalParticle[] {
    const count = this.particleCountFor(flower, ['petalCount', 'petals', 'bloomSize'], 6);
    const origin = this.positionOf(flower);
    const spread = this.extentOf(flower, 0.3);
    const flowerRecord = asRecord(flower);
    const petals: EnvironmentalParticle[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      petals.push({
        id: `fall_petal_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 0.1, y: -0.08, z: offset.z * 0.1 },
        sway: 0.1 + (i % 3) * 0.05,
        mass: 0.002,
        source: typeof flowerRecord?.id === 'string' ? flowerRecord.id : 'flower',
      });
    }
    return petals;
  }
  /**
   * Hạt tro từ đám cháy.
   *
   * Số hạt và tốc độ bay theo nhiệt độ / cường độ lửa và lưu lượng khói.
   */
  public spawnAshParticles(fire: unknown): EnvironmentalParticle[] {
    const count = this.particleCountFor(fire, ['ashOutput', 'ashCount', 'smokeOutput'], 8);
    const origin = this.positionOf(fire);
    const fireRecord = asRecord(fire);
    const heat = Number(fireRecord?.heat ?? fireRecord?.intensity ?? fireRecord?.temperature ?? 0);
    const rise = 0.5 + Math.min(3, Math.max(0, heat) / 200);
    const spread = this.extentOf(fire, 0.8);
    const ashes: EnvironmentalParticle[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      ashes.push({
        id: `ash_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 0.2, y: rise * (0.6 + (i % 4) * 0.15), z: offset.z * 0.2 },
        temperature: heat,
        mass: 0.0005,
        source: typeof fireRecord?.id === 'string' ? fireRecord.id : 'fire',
      });
    }
    return ashes;
  }
  public simulateAshDeposition(surface: unknown, ash: unknown): void { recordSubsystemAction(this, 'simulateAshDeposition', 'EnvironmentalDynamicsSubsystem'); }
  public recycleExpiredParticles(system: unknown): void { recordSubsystemAction(this, 'recycleExpiredParticles', 'EnvironmentalDynamicsSubsystem'); }

  // 681–700. Ăn mòn, phong hóa và sự lụi tàn của vật thể
  /**
   * Tốc độ phong hóa của vật thể.
   *
   * Trước đây luôn `0.05` bất kể vật liệu và môi trường. Nay suy từ vật liệu
   * và điều kiện môi trường (độ ẩm, nhiệt độ, mức phơi nắng).
   */
  public calculateWeatheringRate(object: unknown): number {
    const record = asRecord(object);
    const material = String(record?.material ?? record?.type ?? 'stone');
    const base = MATERIAL_WEATHERING[material] ?? 0.05;
    const moisture = Number(record?.moisture ?? record?.humidity ?? 0.4);
    const temperature = Number(record?.temperature ?? 20);
    const exposure = Number(record?.exposure ?? record?.sunlight ?? 0.5);
    const m = Number.isFinite(moisture) ? Math.max(0, Math.min(1, moisture)) : 0.4;
    const t = Number.isFinite(temperature) ? Math.max(0, Math.min(1, temperature / 60)) : 0.33;
    const e = Number.isFinite(exposure) ? Math.max(0, Math.min(1, exposure)) : 0.5;
    return base * (0.4 + m * 0.8 + t * 0.5 + e * 0.3);
  }

  public applyMechanicalWeathering(object: unknown, force: unknown): void { recordSubsystemAction(this, 'applyMechanicalWeathering', 'EnvironmentalDynamicsSubsystem'); }
  public applyChemicalWeathering(object: unknown, fluid: unknown): void { recordSubsystemAction(this, 'applyChemicalWeathering', 'EnvironmentalDynamicsSubsystem'); }
  public applyFreezeThawWeathering(object: unknown, temperature: number): void { recordSubsystemAction(this, 'applyFreezeThawWeathering', 'EnvironmentalDynamicsSubsystem'); }
  public erodeObjectSurface(object: unknown, rate: number): void { recordSubsystemAction(this, 'erodeObjectSurface', 'EnvironmentalDynamicsSubsystem'); }
  public erodeBuildingFacade(building: unknown, rate: number): void { recordSubsystemAction(this, 'erodeBuildingFacade', 'EnvironmentalDynamicsSubsystem'); }
  public erodeRockFormation(rock: unknown, water: unknown): void { recordSubsystemAction(this, 'erodeRockFormation', 'EnvironmentalDynamicsSubsystem'); }
  public erodeSoilLayer(soil: unknown, water: unknown): void { recordSubsystemAction(this, 'erodeSoilLayer', 'EnvironmentalDynamicsSubsystem'); }
  public weatherWoodSurface(wood: unknown, weather: unknown): void { recordSubsystemAction(this, 'weatherWoodSurface', 'EnvironmentalDynamicsSubsystem'); }
  public fadePaintSurface(object: unknown, sunlight: unknown): void { recordSubsystemAction(this, 'fadePaintSurface', 'EnvironmentalDynamicsSubsystem'); }
  public peelPaintSurface(object: unknown, rate: number): void { recordSubsystemAction(this, 'peelPaintSurface', 'EnvironmentalDynamicsSubsystem'); }
  public corrodeConcreteSurface(object: unknown, rate: number): void { recordSubsystemAction(this, 'corrodeConcreteSurface', 'EnvironmentalDynamicsSubsystem'); }
  public growMoldOnSurface(object: unknown, humidity: number): void { recordSubsystemAction(this, 'growMoldOnSurface', 'EnvironmentalDynamicsSubsystem'); }
  public spreadSurfaceMoss(object: unknown, moisture: number): void { recordSubsystemAction(this, 'spreadSurfaceMoss', 'EnvironmentalDynamicsSubsystem'); }
  public accumulateDirtOnSurface(object: unknown, amount: number): void { recordSubsystemAction(this, 'accumulateDirtOnSurface', 'EnvironmentalDynamicsSubsystem'); }
  public accumulateDustOnSurface(object: unknown, amount: number): void { recordSubsystemAction(this, 'accumulateDustOnSurface', 'EnvironmentalDynamicsSubsystem'); }
  public washDirtFromSurface(object: unknown, water: unknown): void { recordSubsystemAction(this, 'washDirtFromSurface', 'EnvironmentalDynamicsSubsystem'); }
  public degradeMaterialProperties(object: unknown, rate: number): void { recordSubsystemAction(this, 'degradeMaterialProperties', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Tuổi thọ danh nghĩa của vật thể (giây).
   *
   * Trước đây luôn `5000`. Nay suy từ vật liệu và điều kiện môi trường —
   * môi trường khắc nghiệt rút ngắn tuổi thọ.
   */
  public calculateMaterialLifetime(object: unknown): number {
    const record = asRecord(object);
    const material = String(record?.material ?? record?.type ?? 'stone');
    const base = MATERIAL_LIFETIME[material] ?? 5000;
    const moisture = Number(record?.moisture ?? record?.humidity ?? 0.4);
    const temperature = Number(record?.temperature ?? 20);
    const m = Number.isFinite(moisture) ? Math.max(0, Math.min(1, moisture)) : 0.4;
    const t = Number.isFinite(temperature) ? Math.max(0, Math.min(1, temperature / 60)) : 0.33;
    const wear = Number(record?.wear ?? record?.damage ?? 0);
    const w = Number.isFinite(wear) ? Math.max(0, Math.min(0.9, wear)) : 0;
    const condition = 1 + m * 0.5 + t * 0.3 + w;
    return Math.max(1, base / condition);
  }

  public transitionObjectToRuins(object: unknown): void {
    const record = asRecord(object);
    if (record) record.isRuins = true;
  }

  // 701–720. Hệ sinh thái và tương tác môi trường
  public initializeEcosystem(region: unknown): Ecosystem {
    const id = `eco_${Date.now()}`;
    const eco: Ecosystem = { id, region, balance: 1.0, vegetationDensity: 0.7 };
    this.ecosystems.set(id, eco);
    return eco;
  }

  public updateEcosystem(region: unknown, deltaTime: number): void { recordSubsystemAction(this, 'updateEcosystem', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Mật độ thảm thực vật của khu vực (0..1).
   *
   * Trước đây luôn `0.75`. Nay ưu tiên dữ liệu khai báo, nếu không thì suy từ
   * độ ẩm đất và lượng mưa của khu vực.
   */
  public calculateVegetationDensity(region: unknown): number {
    const record = asRecord(region);
    const declared = Number(record?.vegetationDensity);
    if (Number.isFinite(declared)) return Math.max(0, Math.min(1, declared));

    const plants = Array.isArray(record?.plants)
      ? (record.plants as unknown[]).length
      : this.countOf(region, ['plantCount', 'treeCount'], -1);
    const area = Number(record?.area ?? record?.surfaceArea);
    if (plants >= 0 && Number.isFinite(area) && area > 0) {
      return Math.max(0, Math.min(1, plants / area));
    }

    const soil = asRecord(record?.soil);
    const moisture = Number(soil?.moisture ?? record?.moisture ?? record?.humidity);
    const rainfall = Number(record?.rainfall ?? record?.precipitation);
    const m = Number.isFinite(moisture) ? Math.max(0, Math.min(1, moisture)) : 0.4;
    const r = Number.isFinite(rainfall) ? Math.max(0, Math.min(1, rainfall / 200)) : 0.3;
    return Math.max(0, Math.min(1, 0.2 + m * 0.45 + r * 0.35));
  }

  /**
   * Độ ẩm đất của khu vực (0..100).
   *
   * Trước đây luôn `45`. Nay suy từ lượng mưa, mực nước và khả năng thoát nước.
   */
  public calculateSoilMoisture(region: unknown): number {
    const record = asRecord(region);
    const declared = Number(record?.moisture ?? record?.soilMoisture);
    if (Number.isFinite(declared)) return Math.max(0, Math.min(100, declared * (declared <= 1 ? 100 : 1)));

    const rainfall = Number(record?.rainfall ?? record?.precipitation ?? 0);
    const water = asRecord(record?.water);
    const waterLevel = Number(water?.level ?? record?.waterLevel ?? 0);
    const drainage = Number(record?.drainage ?? 0.5);
    const r = Number.isFinite(rainfall) ? rainfall : 0;
    const w = Number.isFinite(waterLevel) ? Math.max(0, Math.min(1, waterLevel)) : 0;
    const d = Number.isFinite(drainage) ? Math.max(0, Math.min(1, drainage)) : 0.5;
    return Math.max(0, Math.min(100, 20 + r * 0.8 + w * 30 - d * 10));
  }

  /**
   * Mức dinh dưỡng sẵn có của khu vực (0..100).
   *
   * Trước đây luôn `80`. Nay suy từ độ phì của đất, hoạt động phân hủy và
   * số lượng chất dinh dưỡng khai báo.
   */
  public calculateNutrientAvailability(region: unknown): number {
    const record = asRecord(region);
    const declared = Number(record?.nutrientAvailability);
    if (Number.isFinite(declared)) return Math.max(0, Math.min(100, declared));

    const soil = asRecord(record?.soil);
    const fertility = Number(soil?.fertility ?? record?.fertility);
    const decomposition = Number(record?.decomposition ?? record?.humus);
    const nutrients = Array.isArray(record?.nutrients) ? (record.nutrients as unknown[]).length : -1;
    const f = Number.isFinite(fertility) ? Math.max(0, Math.min(1, fertility)) : 0.5;
    const d = Number.isFinite(decomposition) ? Math.max(0, Math.min(1, decomposition)) : 0.3;
    const n = nutrients >= 0 ? Math.min(0.2, nutrients * 0.02) : 0;
    return Math.max(0, Math.min(100, (f * 0.6 + d * 0.25 + n) * 100));
  }

  /**
   * Mức cạnh tranh ánh sáng của cây (1 = không bị che, 0 = bị che hoàn toàn).
   *
   * Trước đây luôn `0.85`. Nay tính từ số cây lân cận và độ rộng tán cây.
   */
  public calculateLightCompetition(plant: unknown, neighbors: unknown[]): number {
    const neighborCount = Array.isArray(neighbors)
      ? neighbors.length
      : this.countOf(plant, ['neighborCount', 'competitorCount'], 0);
    const canopy = this.extentOf(plant, 1);
    const shade = Math.min(0.9, neighborCount * 0.12 + canopy * 0.05);
    return Math.max(0.1, 1 - shade);
  }
  public simulatePlantCompetition(plantA: unknown, plantB: unknown): void { recordSubsystemAction(this, 'simulatePlantCompetition', 'EnvironmentalDynamicsSubsystem'); }
  public simulateCanopyCompetition(treeA: unknown, treeB: unknown): void { recordSubsystemAction(this, 'simulateCanopyCompetition', 'EnvironmentalDynamicsSubsystem'); }
  public simulateRootCompetition(plantA: unknown, plantB: unknown): void { recordSubsystemAction(this, 'simulateRootCompetition', 'EnvironmentalDynamicsSubsystem'); }
  public spreadSeedsAcrossRegion(region: unknown, wind: unknown): void { recordSubsystemAction(this, 'spreadSeedsAcrossRegion', 'EnvironmentalDynamicsSubsystem'); }
  public disperseSeedsByWater(region: unknown, water: unknown): void { recordSubsystemAction(this, 'disperseSeedsByWater', 'EnvironmentalDynamicsSubsystem'); }
  public spreadWildfireAcrossRegion(region: unknown): void { recordSubsystemAction(this, 'spreadWildfireAcrossRegion', 'EnvironmentalDynamicsSubsystem'); }
  public simulateHabitatRecovery(region: unknown): void { recordSubsystemAction(this, 'simulateHabitatRecovery', 'EnvironmentalDynamicsSubsystem'); }
  public regenerateVegetation(region: unknown): void { recordSubsystemAction(this, 'regenerateVegetation', 'EnvironmentalDynamicsSubsystem'); }
  public restoreDamagedSoil(region: unknown): void { recordSubsystemAction(this, 'restoreDamagedSoil', 'EnvironmentalDynamicsSubsystem'); }
  public simulateWetlandExpansion(region: unknown): void { recordSubsystemAction(this, 'simulateWetlandExpansion', 'EnvironmentalDynamicsSubsystem'); }
  public simulateDesertification(region: unknown): void { recordSubsystemAction(this, 'simulateDesertification', 'EnvironmentalDynamicsSubsystem'); }
  public simulateCoastalErosion(region: unknown): void { recordSubsystemAction(this, 'simulateCoastalErosion', 'EnvironmentalDynamicsSubsystem'); }
  public simulateRiverDeltaGrowth(region: unknown): void { recordSubsystemAction(this, 'simulateRiverDeltaGrowth', 'EnvironmentalDynamicsSubsystem'); }
  public updateEcosystemBalance(region: unknown): void { recordSubsystemAction(this, 'updateEcosystemBalance', 'EnvironmentalDynamicsSubsystem'); }

  // 721–740. Hệ thống thời gian và biến đổi trạng thái
  public initializeObjectLifecycle(object: unknown): ObjectLifecycle {
    const id = this.idOf(object);
    const lc: ObjectLifecycle = { id, age: 0, health: 100, isDecayed: false };
    this.objectLifecycles.set(id, lc);
    return lc;
  }

  public updateObjectLifecycle(object: unknown, deltaTime: number): void {
    const lc = this.objectLifecycles.get(this.idOf(object));
    if (lc) lc.age += deltaTime;
  }

  public setObjectAge(object: unknown, age: number): void {
    const lc = this.objectLifecycles.get(this.idOf(object));
    if (lc) lc.age = age;
  }

  public calculateObjectAge(object: unknown): number {
    return this.objectLifecycles.get(this.idOf(object))?.age ?? 0;
  }

  public growObjectOverTime(object: unknown, duration: number): void { recordSubsystemAction(this, 'growObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public shrinkObjectOverTime(object: unknown, duration: number): void { recordSubsystemAction(this, 'shrinkObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public matureObject(object: unknown): void { recordSubsystemAction(this, 'matureObject', 'EnvironmentalDynamicsSubsystem'); }
  public weakenObjectOverTime(object: unknown, rate: number): void { recordSubsystemAction(this, 'weakenObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public fatigueObjectOverTime(object: unknown, load: unknown): void { recordSubsystemAction(this, 'fatigueObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public accumulateObjectDamage(object: unknown, damage: number): void {
    const lc = this.objectLifecycles.get(this.idOf(object));
    if (lc) lc.health = Math.max(0, lc.health - damage);
  }

  public recoverObjectCondition(object: unknown, rate: number): void {
    const lc = this.objectLifecycles.get(this.idOf(object));
    if (lc) lc.health = Math.min(100, lc.health + rate);
  }

  public decayObjectOverTime(object: unknown, rate: number): void { recordSubsystemAction(this, 'decayObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public decomposeObjectOverTime(object: unknown, rate: number): void { recordSubsystemAction(this, 'decomposeObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public fadeObjectOverTime(object: unknown, rate: number): void { recordSubsystemAction(this, 'fadeObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public disintegrateObjectOverTime(object: unknown, rate: number): void { recordSubsystemAction(this, 'disintegrateObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public triggerObjectFailure(object: unknown): void { recordSubsystemAction(this, 'triggerObjectFailure', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Thay vật thể bằng các mảnh vụn.
   *
   * Trước đây luôn trả về đúng một mảnh `debris_part`. Nay số mảnh suy ra từ
   * thể tích / kích thước vật thể, mỗi mảnh có vị trí, khối lượng và tốc độ
   * nảy tính từ dữ liệu vật thể.
   */
  public replaceObjectWithDebris(object: unknown): DebrisFragment[] {
    const count = this.particleCountFor(object, ['fragmentCount', 'debrisCount', 'pieces'], 6);
    const origin = this.positionOf(object);
    const spread = this.extentOf(object, 0.5);
    const record = asRecord(object);
    const totalMass = Number(record?.mass ?? record?.weight ?? 1);
    const perPiece = totalMass > 0 ? totalMass / count : 0;
    const debris: DebrisFragment[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      debris.push({
        id: `debris_part_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 1.2, y: 0.8 + (i % 3) * 0.3, z: offset.z * 1.2 },
        mass: perPiece,
        size: spread / Math.max(1, Math.sqrt(count)),
        source: typeof record?.id === 'string' ? record.id : 'object',
      });
    }
    return debris;
  }
  public regenerateObjectFromState(object: unknown, state: unknown): void { recordSubsystemAction(this, 'regenerateObjectFromState', 'EnvironmentalDynamicsSubsystem'); }
  public advanceSeasonalChanges(region: unknown, season: string): void { recordSubsystemAction(this, 'advanceSeasonalChanges', 'EnvironmentalDynamicsSubsystem'); }
  public updateWorldAging(region: unknown, deltaTime: number): void { recordSubsystemAction(this, 'updateWorldAging', 'EnvironmentalDynamicsSubsystem'); }

  // 741–760. Tương tác giữa công cụ và môi trường
  /**
   * Công cụ có chạm vật thể không.
   *
   * Trước đây luôn `true` — mọi cú đánh đều "chạm". Nay kiểm tra chồng lấn
   * thật giữa vùng của công cụ và vật thể (AABB nếu có `bounds`, nếu không
   * thì so bán kính quanh tâm).
   */
  public detectToolContact(tool: unknown, object: unknown): boolean {
    const toolBounds = this.boundsOf(tool);
    const objectBounds = this.boundsOf(object);
    if (toolBounds && objectBounds) return boundsOverlap(toolBounds, objectBounds);

    const toolCenter = this.positionOf(tool);
    const objectCenter = this.positionOf(object);
    const reach = this.extentOf(tool, 0.3) + this.extentOf(object, 0.5);
    const distance = Math.hypot(
      toolCenter.x - objectCenter.x,
      toolCenter.y - objectCenter.y,
      toolCenter.z - objectCenter.z,
    );
    return distance <= reach;
  }

  /**
   * Tính va chạm giữa công cụ và vật thể.
   *
   * Trước đây `object` bị bỏ qua hoàn toàn — mọi cú đánh đều cho cùng năng
   * lượng (250), cùng độ sắc (0.9) và cùng điểm tiếp xúc. Nay:
   *  - năng lượng động học tính từ khối lượng và tốc độ đung đưa thật của công cụ;
   *  - độ sắc hiệu dụng suy ra từ độ cứng thật của vật bị đánh;
   *  - điểm tiếp xúc lấy theo vị trí / điểm va chạm thật của vật.
   */
  public calculateToolImpact(tool: unknown, object: unknown): ToolImpact {
    const toolRecord = asRecord(tool);
    const mass = Number(toolRecord?.mass ?? toolRecord?.weight ?? DEFAULT_TOOL_MASS);
    const speed = this.swingSpeedOf(tool);
    const kineticEnergy =
      0.5 * (Number.isFinite(mass) && mass > 0 ? mass : DEFAULT_TOOL_MASS) * speed * speed;
    const hardness = this.hardnessOf(object);
    const sharpness = this.sharpnessOf(tool, hardness);
    const impact: ToolImpact = {
      toolType: typeof toolRecord?.type === 'string' ? toolRecord.type : 'axe',
      kineticEnergy,
      sharpness,
      contactPoint: this.contactPointOf(object),
    };
    this.toolImpacts.push(impact);
    return impact;
  }

  /** Tốc độ đung đưa của công cụ (m/s) — số, vector vận tốc hoặc mặc định. */
  private swingSpeedOf(tool: unknown): number {
    const record = asRecord(tool);
    const candidate = record?.swingSpeed ?? record?.speed ?? record?.swooshSpeed ?? record?.velocity;
    if (candidate === undefined || candidate === null) return DEFAULT_SWING_SPEED;
    const magnitude = forceMagnitude(candidate);
    return magnitude > 0 ? magnitude : DEFAULT_SWING_SPEED;
  }

  /** Độ cứng của vật bị đánh — suy từ vật liệu hoặc kích thước nếu có. */
  private hardnessOf(object: unknown): number {
    const record = asRecord(object);
    const material = asRecord(record?.material);
    const declared = Number(record?.hardness ?? material?.hardness ?? NaN);
    if (Number.isFinite(declared) && declared > 0) return declared;
    const thickness = Number(record?.thickness ?? NaN);
    if (Number.isFinite(thickness) && thickness > 0) return thickness * 5;
    return DEFAULT_TARGET_HARDNESS;
  }

  /** Độ sắc hiệu dụng của công cụ trên vật bị đánh. */
  private sharpnessOf(tool: unknown, hardness: number): number {
    const record = asRecord(tool);
    const declared = Number(record?.sharpness ?? record?.sharp ?? NaN);
    if (Number.isFinite(declared) && declared > 0) return Math.min(1, declared);
    // Vật cứng hơn thì lưỡi cùng độ sắc bị "mất" hiệu quả hơn.
    return Math.max(0.1, Math.min(1, 1 - Math.min(0.8, hardness / 10)));
  }

  /** Điểm tiếp xúc của cú đánh — theo vị trí hoặc điểm va chạm của vật. */
  private contactPointOf(object: unknown): Vec3 {
    const record = asRecord(object);
    const source = asRecord(record?.contactPoint ?? record?.impactPoint ?? record?.position);
    if (source) {
      const x = Number(source.x ?? 0);
      const y = Number(source.y ?? 0);
      const z = Number(source.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    return { x: 0, y: 1, z: 0 };
  }

  // -------------------------------------------------------------------------
  // Helper đọc dữ liệu thật — thay cho giá trị đóng cứng
  // -------------------------------------------------------------------------

  /** Định danh của đối tượng (chuỗi hoặc bản ghi có `id`). */
  private idOf(object: unknown, fallback = 'obj'): string {
    if (typeof object === 'string') return object;
    const id = asRecord(object)?.id;
    return typeof id === 'string' ? id : fallback;
  }

  /** Số lượng từ nhiều khoá khả năng (fallback khi dữ liệu không có). */
  private countOf(source: unknown, keys: string[], fallback: number): number {
    const record = asRecord(source);
    if (record) {
      for (const key of keys) {
        const value = record[key];
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
          return Math.floor(value);
        }
        if (Array.isArray(value)) return value.length;
      }
    }
    return fallback;
  }

  /** Vị trí thế giới của đối tượng — chấp nhận cả vector trực tiếp lẫn `position` lồng nhau. */
  private positionOf(source: unknown): Vec3 {
    const record = asRecord(source);
    if (!record) return { x: 0, y: 0, z: 0 };

    // Vector trực tiếp `{ x, y, z }` (ví dụ vị trí camera).
    const directX = Number(record.x ?? NaN);
    const directY = Number(record.y ?? NaN);
    const directZ = Number(record.z ?? NaN);
    if (Number.isFinite(directX) && Number.isFinite(directY) && Number.isFinite(directZ)) {
      return { x: directX, y: directY, z: directZ };
    }

    const p = asRecord(record.position ?? record.origin ?? record.center ?? record.location);
    if (p) {
      const x = Number(p.x ?? 0);
      const y = Number(p.y ?? 0);
      const z = Number(p.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Kích thước đặc trưng (bán kính / cạnh lớn nhất) của đối tượng. */
  private extentOf(source: unknown, fallback = 1): number {
    const record = asRecord(source);
    const size = record?.size ?? record?.radius ?? record?.scale ?? record?.bounds;
    if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size;
    const sizeRecord = asRecord(size);
    if (sizeRecord) {
      const values = [
        sizeRecord.x,
        sizeRecord.y,
        sizeRecord.z,
        sizeRecord.max,
        sizeRecord.width,
        sizeRecord.height,
      ].map((v) => Number(v));
      const max = values.filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => b - a)[0];
      if (max) return max;
    }
    return fallback;
  }

  /**
   * Lệch tâm so với tâm, phân bố theo GÓC VÀNG.
   *
   * Tất định (không dùng `Math.random`) nên cùng đầu vào ⇒ cùng kết quả, đồng
   * thời các hạt không dồn vào một điểm.
   */
  private scatter(index: number, radius: number): { x: number; y: number; z: number } {
    const angle = index * 2.399963229728653;
    const r = radius * Math.sqrt((index + 0.5) / 32);
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle * 0.5) * r * 0.35,
      z: Math.sin(angle) * r,
    };
  }

  /** Số lượng hạt chia cho một đối tượng, có tỉ lệ theo kích thước. */
  private particleCountFor(source: unknown, keys: string[], base: number): number {
    const declared = this.countOf(source, keys, -1);
    if (declared >= 0) return declared;
    return Math.max(1, Math.round(base * Math.max(0.25, this.extentOf(source, 1))));
  }

  /** Hộp giới hạn AABB khai báo của đối tượng (nếu có). */
  private boundsOf(source: unknown): Aabb | null {
    const bounds = asRecord(asRecord(source)?.bounds);
    if (!bounds) return null;
    const min = asRecord(bounds.min);
    const max = asRecord(bounds.max);
    if (!min || !max) return null;
    const read = (v: Record<string, unknown> | null, axis: 'x' | 'y' | 'z') => Number(v?.[axis] ?? NaN);
    const minX = read(min, 'x');
    const minY = read(min, 'y');
    const minZ = read(min, 'z');
    const maxX = read(max, 'x');
    const maxY = read(max, 'y');
    const maxZ = read(max, 'z');
    if (![minX, minY, minZ, maxX, maxY, maxZ].every((v) => Number.isFinite(v))) return null;
    return {
      min: { x: Math.min(minX, maxX), y: Math.min(minY, maxY), z: Math.min(minZ, maxZ) },
      max: { x: Math.max(minX, maxX), y: Math.max(minY, maxY), z: Math.max(minZ, maxZ) },
    };
  }

  /**
   * Hướng đơn vị từ một vector (hoặc từ một điểm tới điểm khác).
   *
   * Dùng cho lực, pháp tuyến mặt phẳng… Trả hướng mặc định khi dữ liệu không
   * dùng được.
   */
  private directionOf(vector: unknown): Vec3 {
    const record = asRecord(vector);
    if (record) {
      const x = Number(record.x ?? NaN);
      const y = Number(record.y ?? NaN);
      const z = Number(record.z ?? NaN);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        const length = Math.hypot(x, y, z);
        if (length > 0) return { x: x / length, y: y / length, z: z / length };
      }
    }
    return { x: 0, y: 1, z: 0 };
  }

  public applyHammerImpact(object: unknown, impact: unknown): void { recordSubsystemAction(this, 'applyHammerImpact', 'EnvironmentalDynamicsSubsystem'); }
  public strikeObjectWithTool(object: unknown, tool: unknown): void {
    this.calculateToolImpact(tool, object);
  }

  public cutVegetationWithTool(plant: unknown, tool: unknown): void { recordSubsystemAction(this, 'cutVegetationWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public sawWoodObject(wood: unknown, tool: unknown): void { recordSubsystemAction(this, 'sawWoodObject', 'EnvironmentalDynamicsSubsystem'); }
  public digTerrainWithTool(terrain: unknown, tool: unknown): void { recordSubsystemAction(this, 'digTerrainWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public excavateRockWithTool(rock: unknown, tool: unknown): void { recordSubsystemAction(this, 'excavateRockWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public chipStoneWithTool(rock: unknown, tool: unknown): void { recordSubsystemAction(this, 'chipStoneWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public breakIceWithTool(ice: unknown, tool: unknown): void { recordSubsystemAction(this, 'breakIceWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public pryOpenObject(object: unknown, tool: unknown): void { recordSubsystemAction(this, 'pryOpenObject', 'EnvironmentalDynamicsSubsystem'); }
  public leverObjectWithTool(object: unknown, tool: unknown): void { recordSubsystemAction(this, 'leverObjectWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public drillIntoMaterial(object: unknown, tool: unknown): void { recordSubsystemAction(this, 'drillIntoMaterial', 'EnvironmentalDynamicsSubsystem'); }
  public grindMaterialSurface(object: unknown, tool: unknown): void { recordSubsystemAction(this, 'grindMaterialSurface', 'EnvironmentalDynamicsSubsystem'); }
  public polishMaterialSurface(object: unknown, tool: unknown): void { recordSubsystemAction(this, 'polishMaterialSurface', 'EnvironmentalDynamicsSubsystem'); }
  public weldMetalParts(partA: unknown, partB: unknown): void { recordSubsystemAction(this, 'weldMetalParts', 'EnvironmentalDynamicsSubsystem'); }
  public fastenStructuralParts(partA: unknown, partB: unknown): void { recordSubsystemAction(this, 'fastenStructuralParts', 'EnvironmentalDynamicsSubsystem'); }
  public detachFastenedPart(object: unknown, part: unknown): void { recordSubsystemAction(this, 'detachFastenedPart', 'EnvironmentalDynamicsSubsystem'); }
  public repairObjectWithMaterial(object: unknown, material: unknown): void { recordSubsystemAction(this, 'repairObjectWithMaterial', 'EnvironmentalDynamicsSubsystem'); }
  public updateToolDamage(tool: unknown, impact: unknown): void { recordSubsystemAction(this, 'updateToolDamage', 'EnvironmentalDynamicsSubsystem'); }

  // 761–780. Mô phỏng phá hủy nâng cao
  public initializeDestructionGraph(object: unknown): FractureGraph {
    const id = this.idOf(object, 'destr');
    const g: FractureGraph = {
      nodes: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }],
      edges: [[0, 1]],
      fractureEnergy: 100,
    };
    this.destructionGraphs.set(id, g);
    return g;
  }

  /**
   * Mẫu vết nứt (Voronoi) sinh từ điểm va chạm và năng lượng va chạm.
   *
   * Trước đây luôn trả `{ pattern: 'voronoi' }`. Nay số ô nứt suy ra từ năng
   * lượng va chạm, mỗi ô có tâm tính từ vị trí va chạm và kích thước vật thể.
   */
  public generateFracturePattern(object: unknown, impact: unknown): FracturePattern {
    const impactRecord = asRecord(impact);
    const energy = Number(impactRecord?.energy ?? impactRecord?.kineticEnergy ?? impactRecord?.force ?? 100);
    const safeEnergy = Number.isFinite(energy) && energy > 0 ? energy : 100;
    const cells = Math.max(2, Math.min(24, Math.round(safeEnergy / 25)));
    const origin = this.positionOf(impactRecord?.position ? impact : object);
    const spread = this.extentOf(object, 1);
    const cellSeeds: Vec3[] = [];
    for (let i = 0; i < cells; i++) {
      const offset = this.scatter(i, spread);
      cellSeeds.push({
        x: origin.x + offset.x,
        y: origin.y + offset.y,
        z: origin.z + offset.z,
      });
    }
    return {
      pattern: 'voronoi',
      cells: cellSeeds,
      cellCount: cells,
      energy: safeEnergy,
      radius: spread,
      center: origin,
    };
  }

  public propagateStructuralCrack(object: unknown, crack: unknown): void { recordSubsystemAction(this, 'propagateStructuralCrack', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Tốc độ lan truyền vết nứt (m/giây).
   *
   * Trước đây luôn `1.5`. Nay suy từ độ bền vật liệu và chiều dài vết nứt.
   */
  public calculateFracturePropagation(object: unknown): number {
    const record = asRecord(object);
    const size = asRecord(record?.size);
    const toughness = Number(record?.toughness ?? record?.hardness ?? 1);
    const crackLength = Number(record?.crackLength ?? size?.x ?? record?.width ?? 1);
    const t = Number.isFinite(toughness) && toughness > 0 ? toughness : 1;
    const length = Number.isFinite(crackLength) && crackLength > 0 ? crackLength : 1;
    return Math.max(0.05, (1 + length) / t);
  }

  /**
   * Điểm gãy của vật thể dưới lực tác dụng.
   *
   * Trước đây luôn `{ x: 0, y: 1.5, z: 0 }`. Nay điểm gãy nằm trên vật thể,
   * lệch theo hướng lực và theo kích thước vật thể.
   */
  public calculateBreakPoint(object: unknown, force: unknown): Vec3 {
    const center = this.positionOf(object);
    const size = this.extentOf(object, 1);
    const direction = this.directionOf(force);
    const reach = size * 0.5;
    return {
      x: center.x + direction.x * reach,
      y: center.y + direction.y * reach,
      z: center.z + direction.z * reach,
    };
  }

  /**
   * Năng lượng cần thiết để làm vỡ vật thể.
   *
   * Trước đây luôn `250`. Nay tính từ độ cứng, diện tích chịu lực và lực tác
   * dụng thật.
   */
  public calculateFractureEnergy(object: unknown, force: unknown): number {
    const record = asRecord(object);
    const material = asRecord(record?.material);
    const size = asRecord(record?.size);
    const hardness = Number(record?.hardness ?? material?.hardness ?? 1);
    const h = Number.isFinite(hardness) && hardness > 0 ? hardness : 1;
    const area = Number(record?.area ?? size?.x ?? record?.width ?? 1);
    const a = Number.isFinite(area) && area > 0 ? area : 1;
    const applied = forceMagnitude(force);
    return Math.max(0, h * a * applied);
  }

  /**
   * Cắt vật thể bằng mặt phẳng — hai nửa đối xứng qua mặt phẳng.
   */
  public splitMeshAlongPlane(object: unknown, plane: unknown): MeshPart[] {
    const center = this.positionOf(object);
    const size = this.extentOf(object, 1);
    const planeRecord = asRecord(plane);
    const normal = this.directionOf(planeRecord?.normal ?? plane);
    const offset = Number(planeRecord?.constant ?? planeRecord?.distance ?? 0);
    const half = Number.isFinite(offset) ? offset : 0;
    const objectRecord = asRecord(object);
    const source = typeof objectRecord?.id === 'string' ? objectRecord.id : 'object';
    const parts: MeshPart[] = [];
    for (const sign of [-1, 1]) {
      parts.push({
        id: `part_${sign < 0 ? 'A' : 'B'}`,
        position: {
          x: center.x + normal.x * (half + (sign * size) / 2),
          y: center.y + normal.y * (half + (sign * size) / 2),
          z: center.z + normal.z * (half + (sign * size) / 2),
        },
        size: size / 2,
        side: sign < 0 ? 'negative' : 'positive',
        source,
      });
    }
    return parts;
  }
  /**
   * Cắt vật thể theo đường cong.
   *
   * Trước đây luôn trả một mảnh `part_C`. Nay số mảnh bằng số điểm của đường
   * cong, mỗi mảnh nằm tại điểm tương ứng trên đường cong.
   */
  public splitMeshAlongCurve(object: unknown, curve: unknown): MeshPart[] {
    const curveRecord = asRecord(curve);
    const points: unknown[] = Array.isArray(curve)
      ? curve
      : Array.isArray(curveRecord?.points)
        ? (curveRecord.points as unknown[])
        : Array.isArray(curveRecord?.controlPoints)
          ? (curveRecord.controlPoints as unknown[])
          : Array.isArray(curveRecord?.path)
            ? (curveRecord.path as unknown[])
            : [];
    const segments = Math.max(1, points.length);
    const origin = this.positionOf(object);
    const spread = this.extentOf(object, 1);
    const objectRecord = asRecord(object);
    const source = typeof objectRecord?.id === 'string' ? objectRecord.id : 'object';
    const parts: MeshPart[] = [];
    for (let i = 0; i < segments; i++) {
      const point = asRecord(points[i]);
      const x = Number(point?.x ?? 0);
      const y = Number(point?.y ?? 0);
      const z = Number(point?.z ?? 0);
      parts.push({
        id: `part_${i}`,
        position: {
          x: origin.x + (Number.isFinite(x) ? x : 0),
          y: origin.y + (Number.isFinite(y) ? y : 0),
          z: origin.z + (Number.isFinite(z) ? z : 0),
        },
        size: spread / segments,
        segment: i,
        source,
      });
    }
    return parts;
  }

  public createFractureCapSurface(object: unknown, fracture: unknown): void { recordSubsystemAction(this, 'createFractureCapSurface', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Mảnh vụn từ mẫu vết nứt.
   *
   * Trước đây luôn trả một mảnh `debris_frag`. Nay số mảnh bằng số ô của mẫu
   * nứt (hoặc suy ra từ vật thể), mỗi mảnh có vị trí tại tâm ô và khối lượng
   * tính từ khối lượng vật thể chia đều.
   */
  public generateFractureDebris(object: unknown, fracture: unknown): DebrisFragment[] {
    const fractureRecord = asRecord(fracture);
    const seeds: unknown[] = Array.isArray(fractureRecord?.cells)
      ? (fractureRecord.cells as unknown[])
      : Array.isArray(fractureRecord?.seeds)
        ? (fractureRecord.seeds as unknown[])
        : [];
    const count = seeds.length || this.particleCountFor(object, ['fragmentCount', 'debrisCount'], 5);
    const origin = this.positionOf(object);
    const spread = this.extentOf(object, 0.5);
    const objectRecord = asRecord(object);
    const totalMass = Number(objectRecord?.mass ?? objectRecord?.weight ?? 1);
    const perPiece = totalMass > 0 ? totalMass / count : 0;
    const source = typeof objectRecord?.id === 'string' ? objectRecord.id : 'object';
    const debris: DebrisFragment[] = [];
    for (let i = 0; i < count; i++) {
      const seed = asRecord(seeds[i]);
      const base = seed
        ? {
            x: Number(seed.x ?? 0),
            y: Number(seed.y ?? 0),
            z: Number(seed.z ?? 0),
          }
        : this.scatter(i, spread);
      debris.push({
        id: `debris_frag_${i}`,
        position: { x: origin.x + base.x, y: origin.y + base.y, z: origin.z + base.z },
        velocity: { x: base.x * 1.5, y: 0.6 + (i % 3) * 0.25, z: base.z * 1.5 },
        mass: perPiece,
        size: spread / Math.max(1, Math.sqrt(count)),
        source,
      });
    }
    return debris;
  }

  public assignDebrisMass(fragments: unknown[]): void { recordSubsystemAction(this, 'assignDebrisMass', 'EnvironmentalDynamicsSubsystem'); }
  public assignDebrisCollision(fragments: unknown[]): void { recordSubsystemAction(this, 'assignDebrisCollision', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Quỹ đạo nảy của mảnh vụn — ném xiên theo trọng trường.
   *
   * Trước đây luôn trả đúng một điểm `{ x: 0, y: 2, z: 0 }`. Nay quỹ đạo được
   * tích phân từ vị trí, vận tốc và gia tốc trọng trường của mảnh vụn.
   */
  public calculateDebrisTrajectory(fragment: unknown): Vec3[] {
    const start = this.positionOf(fragment);
    const fragmentRecord = asRecord(fragment);
    const velocity = asRecord(fragmentRecord?.velocity) ?? { x: 0, y: 0, z: 0 };
    let vx = Number(velocity.x ?? 0);
    let vy = Number(velocity.y ?? 0);
    let vz = Number(velocity.z ?? 0);
    if (!Number.isFinite(vx)) vx = 0;
    if (!Number.isFinite(vy)) vy = 0;
    if (!Number.isFinite(vz)) vz = 0;
    const gravity = Number(fragmentRecord?.gravity ?? 9.81);
    const g = Number.isFinite(gravity) ? gravity : 9.81;
    const steps = Math.max(2, Math.min(64, this.countOf(fragment, ['steps', 'sampleCount'], 16)));
    const dt = 1 / 60;
    const path: Vec3[] = [];
    let x = start.x;
    let y = start.y;
    let z = start.z;
    for (let i = 0; i < steps; i++) {
      path.push({ x, y, z });
      x += vx * dt;
      y += vy * dt;
      z += vz * dt;
      vy -= g * dt;
    }
    return path;
  }

  public simulateDebrisPileCollapse(pile: unknown): void { recordSubsystemAction(this, 'simulateDebrisPileCollapse', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Mảnh vụn có va chạm thứ cấp không.
   *
   * Trước đây luôn `false`. Nay va chạm thứ cấp xảy ra khi mảnh vụn chạm mặt
   * đất (độ cao ≤ mặt đất) HOẶC rơi đủ nhanh để vượt ngưỡng va chạm khi còn
   * ở gần mặt đất.
   */
  public detectSecondaryImpact(debris: unknown): boolean {
    const record = asRecord(debris);
    const speed = forceMagnitude(record?.velocity ?? 0);
    const threshold = Number(record?.threshold ?? record?.impactThreshold ?? 2);
    const limit = Number.isFinite(threshold) && threshold > 0 ? threshold : 2;
    const groundY = Number(record?.groundY ?? 0);
    const base = Number.isFinite(groundY) ? groundY : 0;
    const position = this.positionOf(debris);
    if (position.y <= base + 0.05) return true;
    return speed > 0 && speed >= limit && position.y < base + limit;
  }

  public triggerSecondaryFracture(object: unknown, impact: unknown): void { recordSubsystemAction(this, 'triggerSecondaryFracture', 'EnvironmentalDynamicsSubsystem'); }
  public simulateProgressiveObjectFailure(object: unknown): void { recordSubsystemAction(this, 'simulateProgressiveObjectFailure', 'EnvironmentalDynamicsSubsystem'); }
  public stabilizeRemainingStructure(object: unknown): void { recordSubsystemAction(this, 'stabilizeRemainingStructure', 'EnvironmentalDynamicsSubsystem'); }
  public rebuildDestructibleMesh(object: unknown): void { recordSubsystemAction(this, 'rebuildDestructibleMesh', 'EnvironmentalDynamicsSubsystem'); }
  public finalizeDestructionState(object: unknown): void { recordSubsystemAction(this, 'finalizeDestructionState', 'EnvironmentalDynamicsSubsystem'); }

  // 781–800. Animation, vật lý, đồng bộ và tối ưu hóa
  public initializeWorldAnimation(): void { recordSubsystemAction(this, 'initializeWorldAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public loadWorldAnimationClips(): string[] { return ['sway', 'flutter', 'wave']; }
  public playWorldAnimation(object: unknown, animation: string): void { recordSubsystemAction(this, 'playWorldAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public blendWorldAnimations(object: unknown, animations: string[]): void { recordSubsystemAction(this, 'blendWorldAnimations', 'EnvironmentalDynamicsSubsystem'); }
  public crossFadeWorldAnimation(object: unknown, from: string, to: string): void { recordSubsystemAction(this, 'crossFadeWorldAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public updateWorldAnimationMixer(deltaTime: number): void { this.animationMixerTime += deltaTime; }
  public applyRootMotionToObject(object: unknown, motion: Vec3): void { recordSubsystemAction(this, 'applyRootMotionToObject', 'EnvironmentalDynamicsSubsystem'); }
  public interpolateObjectPosition(object: unknown, deltaTime: number): void { recordSubsystemAction(this, 'interpolateObjectPosition', 'EnvironmentalDynamicsSubsystem'); }
  public interpolateObjectRotation(object: unknown, deltaTime: number): void { recordSubsystemAction(this, 'interpolateObjectRotation', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Cập nhật LOD của vật thể theo khoảng cách tới camera.
   *
   * Trước đây luôn trả `0` vì bản đồ LOD chưa có phần tử nào. Nay mức LOD
   * tính từ khoảng cách thật giữa vật thể và camera (mức 0 gần nhất), rồi
   * lưu lại để các lần sau đọc được.
   */
  public updateObjectLOD(object: unknown): number {
    const id = this.idOf(object);
    const record = asRecord(object);
    const origin = this.positionOf(object);
    const camera = this.positionOf(record?.camera ?? record?.cameraPosition ?? record?.viewer ?? { x: 0, y: 0, z: 0 });
    const distance = Math.hypot(
      origin.x - camera.x,
      origin.y - camera.y,
      origin.z - camera.z,
    );
    const far = Number(record?.farDistance ?? record?.lodFar ?? 100);
    const range = Number.isFinite(far) && far > 0 ? far : 100;
    const lod = Math.max(0, Math.min(3, Math.floor((distance / range) * 3)));
    this.objectLODs.set(id, lod);
    return lod;
  }

  public updateVegetationLOD(region: unknown): void { recordSubsystemAction(this, 'updateVegetationLOD', 'EnvironmentalDynamicsSubsystem'); }
  public updateDestructionLOD(object: unknown): void { recordSubsystemAction(this, 'updateDestructionLOD', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Loại bỏ các vật thể đã ra khỏi tầm nhìn.
   *
   * Trước đây luôn `15`. Nay đếm và loại bỏ đúng những vật thể có LOD ở mức
   * xa nhất (LOD 3) trong bản đồ LOD của subsystem.
   */
  public cullInvisibleWorldObjects(): number {
    let culled = 0;
    for (const [id, lod] of this.objectLODs) {
      if (lod >= 3) {
        this.objectLODs.delete(id);
        culled++;
      }
    }
    return culled;
  }

  /**
   * Cho các thân cứng không hoạt động đi ngủ.
   *
   * Trước đây luôn `40`. Nay đếm đúng số thân cứng đã ngủ quá số lần cập
   * nhật liên tiếp mà không hoạt động.
   */
  public sleepInactiveRigidBodies(): number {
    let slept = 0;
    for (const body of this.rigidBodies.values()) {
      if (body.active) continue;
      body.idleTicks = (body.idleTicks ?? 0) + 1;
      if (body.idleTicks >= 2) slept++;
    }
    return slept;
  }
  public wakeRigidBody(object: unknown): void { recordSubsystemAction(this, 'wakeRigidBody', 'EnvironmentalDynamicsSubsystem'); }
  public synchronizePhysicsAndAnimation(object: unknown): void { recordSubsystemAction(this, 'synchronizePhysicsAndAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public rebuildWorldCollision(region: unknown): void { recordSubsystemAction(this, 'rebuildWorldCollision', 'EnvironmentalDynamicsSubsystem'); }
  public updateWorldNavigation(region: unknown): void { recordSubsystemAction(this, 'updateWorldNavigation', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Kiểm tra tính hợp lệ của mô phỏng thế giới.
   *
   * Trước đây luôn `true`. Nay kiểm tra các bất biến thật: cân bằng hệ sinh
   * thái, mật độ thảm thực vật, nhiệt độ, sức khoẻ vật thể và trạng thái
   * hệ hạt — trả `false` nếu bất kỳ giá trị nào nằm ngoài miền hợp lệ.
   */
  public validateWorldSimulation(region: unknown): boolean {
    const data = asRecord(region) ?? {};

    const balance = Number(data.balance ?? data.ecosystemBalance);
    if (Number.isFinite(balance) && (balance < 0 || balance > 1)) return false;

    const density = Number(data.vegetationDensity ?? data.density);
    if (Number.isFinite(density) && (density < 0 || density > 1)) return false;

    const temperature = Number(data.temperature);
    if (Number.isFinite(temperature) && (temperature < -90 || temperature > 70)) return false;

    const humidity = Number(data.humidity);
    if (Number.isFinite(humidity) && (humidity < 0 || humidity > 1)) return false;

    const objects: unknown[] = Array.isArray(data.objects) ? (data.objects as unknown[]) : [];
    for (const raw of objects) {
      const object = asRecord(raw);
      const health = Number(object?.health);
      if (Number.isFinite(health) && (health < 0 || health > 100)) return false;
      const age = Number(object?.age);
      if (Number.isFinite(age) && age < 0) return false;
    }

    for (const system of this.particleSystems.values()) {
      if (system.activeCount < 0 || system.activeCount > system.maxCount) return false;
    }
    for (const eco of this.ecosystems.values()) {
      const value = Number(eco.balance);
      if (Number.isFinite(value) && (value < 0 || value > 1)) return false;
    }
    for (const lod of this.objectLODs.values()) {
      if (!Number.isFinite(lod) || lod < 0) return false;
    }
    return true;
  }

  public optimizeWorldSimulationPerformance(): void { recordSubsystemAction(this, 'optimizeWorldSimulationPerformance', 'EnvironmentalDynamicsSubsystem'); }
}
