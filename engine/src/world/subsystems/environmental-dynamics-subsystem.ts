/**
 * @file environmental-dynamics-subsystem.ts
 * @module @aetheria/engine/world/subsystems/environmental-dynamics-subsystem
 * @description Particles, Weathering, Ecosystems, Time Aging, Tool Interaction,
 * Advanced Destruction, Animation & Optimization (661–800).
 */

import { ParticleEffectSystem, ToolImpact, FractureGraph } from '../types.js';
import type { Vec3 } from '../../types/index.js';
import { forceMagnitude } from './vegetation-subsystem.js';

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
  public ecosystems: Map<string, any> = new Map();
  public objectLifecycles: Map<string, any> = new Map();
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

  public spawnParticles(system: any, count: number): void {
    const ps = typeof system === 'string' ? this.particleSystems.get(system) : system;
    if (ps) ps.activeCount = Math.min(ps.maxCount, ps.activeCount + count);
  }

  public updateParticleMotion(particle: any, deltaTime: number): void { recordSubsystemAction(this, 'updateParticleMotion', 'EnvironmentalDynamicsSubsystem'); }
  public applyParticleGravity(particle: any): void { recordSubsystemAction(this, 'applyParticleGravity', 'EnvironmentalDynamicsSubsystem'); }
  public applyParticleWind(particle: any, wind: any): void { recordSubsystemAction(this, 'applyParticleWind', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Hệ số kéo của một hạt.
   *
   * Trước đây luôn `0.2`. Nay suy từ kích thước hạt và mật độ môi trường
   * (hạt nhỏ + môi trường loãng ⇒ kéo lớn hơn).
   */
  public calculateParticleDrag(particle: any): number {
    const size = this.extentOf(particle, 0.1);
    const density = Number(particle?.density ?? particle?.mediumDensity ?? 1.2);
    const d = Number.isFinite(density) && density > 0 ? density : 1.2;
    const coefficient = 0.47 * (0.1 / Math.max(0.01, size)) * (1.2 / d);
    return Math.min(2, Math.max(0.01, coefficient));
  }

  public simulateDustCloud(position: Vec3, force: any): any { return { position, radius: 5.0 }; }
  public spreadDustCloud(cloud: any, wind: any): void { recordSubsystemAction(this, 'spreadDustCloud', 'EnvironmentalDynamicsSubsystem'); }
  public dissipateDustCloud(cloud: any, rate: number): void { recordSubsystemAction(this, 'dissipateDustCloud', 'EnvironmentalDynamicsSubsystem'); }
  public createSandBurst(position: Vec3, force: any): any { return { position }; }
  public simulateBlowingSand(sand: any, wind: any): void { recordSubsystemAction(this, 'simulateBlowingSand', 'EnvironmentalDynamicsSubsystem'); }
  public simulateDustDevilParticles(particles: any): void { recordSubsystemAction(this, 'simulateDustDevilParticles', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Hạt phấn hoa bắt từ cây.
   *
   * Trước đây luôn trả đúng một hạt `pollen_1` bất kể cây ra sao. Nay số hạt
   * suy ra từ sản lượng phấn hoa / kích thước tán cây, và mỗi hạt có vị trí,
   * vận tốc và thời gian sống tính từ dữ liệu cây.
   */
  public spawnPollenParticles(plant: any): any[] {
    const count = this.particleCountFor(plant, ['pollenCount', 'pollenOutput', 'pollen'], 12);
    const origin = this.positionOf(plant);
    const spread = this.extentOf(plant, 0.5);
    const particles: any[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      particles.push({
        id: `pollen_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 0.25, y: 0.05 + (i % 3) * 0.02, z: offset.z * 0.25 },
        drift: 0.3 + (i % 5) * 0.1,
        lifetime: 10 + (i % 7),
        source: plant?.id ?? 'plant',
      });
    }
    return particles;
  }
  public dispersePollen(pollen: any, wind: any): void { recordSubsystemAction(this, 'dispersePollen', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Lá rơi từ tán cây.
   *
   * Số lá suy ra từ `leafCount` / kích thước tán; tốc độ rơi và lắc lư theo
   * khối lượng lá và sức gió.
   */
  public spawnFallingLeaves(tree: any): any[] {
    const count = this.particleCountFor(tree, ['leafCount', 'leaves', 'canopySize'], 10);
    const origin = this.positionOf(tree);
    const spread = this.extentOf(tree, 1);
    const gust = forceMagnitude(tree?.wind ?? tree?.gust ?? 0);
    const mass = Number(tree?.leafMass ?? 0.02);
    const leaves: any[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      leaves.push({
        id: `fall_leaf_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: gust * 0.3, y: -0.2 - mass * 2, z: gust * 0.1 },
        sway: 0.2 + (i % 4) * 0.15,
        area: 0.01 + (i % 3) * 0.004,
        mass,
        source: tree?.id ?? 'tree',
      });
    }
    return leaves;
  }
  public simulateFallingLeafParticles(leaves: any): void { recordSubsystemAction(this, 'simulateFallingLeafParticles', 'EnvironmentalDynamicsSubsystem'); }
  /** Cánh hoa rơi — số cánh theo kích thước bông hoa, rơi chậm hơn lá. */
  public spawnFallingPetals(flower: any): any[] {
    const count = this.particleCountFor(flower, ['petalCount', 'petals', 'bloomSize'], 6);
    const origin = this.positionOf(flower);
    const spread = this.extentOf(flower, 0.3);
    const petals: any[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      petals.push({
        id: `fall_petal_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 0.1, y: -0.08, z: offset.z * 0.1 },
        sway: 0.1 + (i % 3) * 0.05,
        mass: 0.002,
        source: flower?.id ?? 'flower',
      });
    }
    return petals;
  }
  /**
   * Hạt tro từ đám cháy.
   *
   * Số hạt và tốc độ bay theo nhiệt độ / cường độ lửa và lưu lượng khói.
   */
  public spawnAshParticles(fire: any): any[] {
    const count = this.particleCountFor(fire, ['ashOutput', 'ashCount', 'smokeOutput'], 8);
    const origin = this.positionOf(fire);
    const heat = Number(fire?.heat ?? fire?.intensity ?? fire?.temperature ?? 0);
    const rise = 0.5 + Math.min(3, Math.max(0, heat) / 200);
    const spread = this.extentOf(fire, 0.8);
    const ashes: any[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      ashes.push({
        id: `ash_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 0.2, y: rise * (0.6 + (i % 4) * 0.15), z: offset.z * 0.2 },
        temperature: heat,
        mass: 0.0005,
        source: fire?.id ?? 'fire',
      });
    }
    return ashes;
  }
  public simulateAshDeposition(surface: any, ash: any): void { recordSubsystemAction(this, 'simulateAshDeposition', 'EnvironmentalDynamicsSubsystem'); }
  public recycleExpiredParticles(system: any): void { recordSubsystemAction(this, 'recycleExpiredParticles', 'EnvironmentalDynamicsSubsystem'); }

  // 681–700. Ăn mòn, phong hóa và sự lụi tàn của vật thể
  /**
   * Tốc độ phong hóa của vật thể.
   *
   * Trước đây luôn `0.05` bất kể vật liệu và môi trường. Nay suy từ vật liệu
   * và điều kiện môi trường (độ ẩm, nhiệt độ, mức phơi nắng).
   */
  public calculateWeatheringRate(object: any): number {
    const material = String(object?.material ?? object?.type ?? 'stone');
    const base = MATERIAL_WEATHERING[material] ?? 0.05;
    const moisture = Number(object?.moisture ?? object?.humidity ?? 0.4);
    const temperature = Number(object?.temperature ?? 20);
    const exposure = Number(object?.exposure ?? object?.sunlight ?? 0.5);
    const m = Number.isFinite(moisture) ? Math.max(0, Math.min(1, moisture)) : 0.4;
    const t = Number.isFinite(temperature) ? Math.max(0, Math.min(1, temperature / 60)) : 0.33;
    const e = Number.isFinite(exposure) ? Math.max(0, Math.min(1, exposure)) : 0.5;
    return base * (0.4 + m * 0.8 + t * 0.5 + e * 0.3);
  }

  public applyMechanicalWeathering(object: any, force: any): void { recordSubsystemAction(this, 'applyMechanicalWeathering', 'EnvironmentalDynamicsSubsystem'); }
  public applyChemicalWeathering(object: any, fluid: any): void { recordSubsystemAction(this, 'applyChemicalWeathering', 'EnvironmentalDynamicsSubsystem'); }
  public applyFreezeThawWeathering(object: any, temperature: number): void { recordSubsystemAction(this, 'applyFreezeThawWeathering', 'EnvironmentalDynamicsSubsystem'); }
  public erodeObjectSurface(object: any, rate: number): void { recordSubsystemAction(this, 'erodeObjectSurface', 'EnvironmentalDynamicsSubsystem'); }
  public erodeBuildingFacade(building: any, rate: number): void { recordSubsystemAction(this, 'erodeBuildingFacade', 'EnvironmentalDynamicsSubsystem'); }
  public erodeRockFormation(rock: any, water: any): void { recordSubsystemAction(this, 'erodeRockFormation', 'EnvironmentalDynamicsSubsystem'); }
  public erodeSoilLayer(soil: any, water: any): void { recordSubsystemAction(this, 'erodeSoilLayer', 'EnvironmentalDynamicsSubsystem'); }
  public weatherWoodSurface(wood: any, weather: any): void { recordSubsystemAction(this, 'weatherWoodSurface', 'EnvironmentalDynamicsSubsystem'); }
  public fadePaintSurface(object: any, sunlight: any): void { recordSubsystemAction(this, 'fadePaintSurface', 'EnvironmentalDynamicsSubsystem'); }
  public peelPaintSurface(object: any, rate: number): void { recordSubsystemAction(this, 'peelPaintSurface', 'EnvironmentalDynamicsSubsystem'); }
  public corrodeConcreteSurface(object: any, rate: number): void { recordSubsystemAction(this, 'corrodeConcreteSurface', 'EnvironmentalDynamicsSubsystem'); }
  public growMoldOnSurface(object: any, humidity: number): void { recordSubsystemAction(this, 'growMoldOnSurface', 'EnvironmentalDynamicsSubsystem'); }
  public spreadSurfaceMoss(object: any, moisture: number): void { recordSubsystemAction(this, 'spreadSurfaceMoss', 'EnvironmentalDynamicsSubsystem'); }
  public accumulateDirtOnSurface(object: any, amount: number): void { recordSubsystemAction(this, 'accumulateDirtOnSurface', 'EnvironmentalDynamicsSubsystem'); }
  public accumulateDustOnSurface(object: any, amount: number): void { recordSubsystemAction(this, 'accumulateDustOnSurface', 'EnvironmentalDynamicsSubsystem'); }
  public washDirtFromSurface(object: any, water: any): void { recordSubsystemAction(this, 'washDirtFromSurface', 'EnvironmentalDynamicsSubsystem'); }
  public degradeMaterialProperties(object: any, rate: number): void { recordSubsystemAction(this, 'degradeMaterialProperties', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Tuổi thọ danh nghĩa của vật thể (giây).
   *
   * Trước đây luôn `5000`. Nay suy từ vật liệu và điều kiện môi trường —
   * môi trường khắc nghiệt rút ngắn tuổi thọ.
   */
  public calculateMaterialLifetime(object: any): number {
    const material = String(object?.material ?? object?.type ?? 'stone');
    const base = MATERIAL_LIFETIME[material] ?? 5000;
    const moisture = Number(object?.moisture ?? object?.humidity ?? 0.4);
    const temperature = Number(object?.temperature ?? 20);
    const m = Number.isFinite(moisture) ? Math.max(0, Math.min(1, moisture)) : 0.4;
    const t = Number.isFinite(temperature) ? Math.max(0, Math.min(1, temperature / 60)) : 0.33;
    const wear = Number(object?.wear ?? object?.damage ?? 0);
    const w = Number.isFinite(wear) ? Math.max(0, Math.min(0.9, wear)) : 0;
    const condition = 1 + m * 0.5 + t * 0.3 + w;
    return Math.max(1, base / condition);
  }

  public transitionObjectToRuins(object: any): void {
    if (object) object.isRuins = true;
  }

  // 701–720. Hệ sinh thái và tương tác môi trường
  public initializeEcosystem(region: any): any {
    const id = `eco_${Date.now()}`;
    const eco = { id, region, balance: 1.0, vegetationDensity: 0.7 };
    this.ecosystems.set(id, eco);
    return eco;
  }

  public updateEcosystem(region: any, deltaTime: number): void { recordSubsystemAction(this, 'updateEcosystem', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Mật độ thảm thực vật của khu vực (0..1).
   *
   * Trước đây luôn `0.75`. Nay ưu tiên dữ liệu khai báo, nếu không thì suy từ
   * độ ẩm đất và lượng mưa của khu vực.
   */
  public calculateVegetationDensity(region: any): number {
    const declared = Number(region?.vegetationDensity);
    if (Number.isFinite(declared)) return Math.max(0, Math.min(1, declared));

    const plants = Array.isArray(region?.plants)
      ? region.plants.length
      : this.countOf(region, ['plantCount', 'treeCount'], -1);
    const area = Number(region?.area ?? region?.surfaceArea);
    if (plants >= 0 && Number.isFinite(area) && area > 0) {
      return Math.max(0, Math.min(1, plants / area));
    }

    const moisture = Number(region?.soil?.moisture ?? region?.moisture ?? region?.humidity);
    const rainfall = Number(region?.rainfall ?? region?.precipitation);
    const m = Number.isFinite(moisture) ? Math.max(0, Math.min(1, moisture)) : 0.4;
    const r = Number.isFinite(rainfall) ? Math.max(0, Math.min(1, rainfall / 200)) : 0.3;
    return Math.max(0, Math.min(1, 0.2 + m * 0.45 + r * 0.35));
  }

  /**
   * Độ ẩm đất của khu vực (0..100).
   *
   * Trước đây luôn `45`. Nay suy từ lượng mưa, mực nước và khả năng thoát nước.
   */
  public calculateSoilMoisture(region: any): number {
    const declared = Number(region?.moisture ?? region?.soilMoisture);
    if (Number.isFinite(declared)) return Math.max(0, Math.min(100, declared * (declared <= 1 ? 100 : 1)));

    const rainfall = Number(region?.rainfall ?? region?.precipitation ?? 0);
    const waterLevel = Number(region?.water?.level ?? region?.waterLevel ?? 0);
    const drainage = Number(region?.drainage ?? 0.5);
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
  public calculateNutrientAvailability(region: any): number {
    const declared = Number(region?.nutrientAvailability);
    if (Number.isFinite(declared)) return Math.max(0, Math.min(100, declared));

    const fertility = Number(region?.soil?.fertility ?? region?.fertility);
    const decomposition = Number(region?.decomposition ?? region?.humus);
    const nutrients = Array.isArray(region?.nutrients) ? region.nutrients.length : -1;
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
  public calculateLightCompetition(plant: any, neighbors: any[]): number {
    const neighborCount = Array.isArray(neighbors)
      ? neighbors.length
      : this.countOf(plant, ['neighborCount', 'competitorCount'], 0);
    const canopy = this.extentOf(plant, 1);
    const shade = Math.min(0.9, neighborCount * 0.12 + canopy * 0.05);
    return Math.max(0.1, 1 - shade);
  }
  public simulatePlantCompetition(plantA: any, plantB: any): void { recordSubsystemAction(this, 'simulatePlantCompetition', 'EnvironmentalDynamicsSubsystem'); }
  public simulateCanopyCompetition(treeA: any, treeB: any): void { recordSubsystemAction(this, 'simulateCanopyCompetition', 'EnvironmentalDynamicsSubsystem'); }
  public simulateRootCompetition(plantA: any, plantB: any): void { recordSubsystemAction(this, 'simulateRootCompetition', 'EnvironmentalDynamicsSubsystem'); }
  public spreadSeedsAcrossRegion(region: any, wind: any): void { recordSubsystemAction(this, 'spreadSeedsAcrossRegion', 'EnvironmentalDynamicsSubsystem'); }
  public disperseSeedsByWater(region: any, water: any): void { recordSubsystemAction(this, 'disperseSeedsByWater', 'EnvironmentalDynamicsSubsystem'); }
  public spreadWildfireAcrossRegion(region: any): void { recordSubsystemAction(this, 'spreadWildfireAcrossRegion', 'EnvironmentalDynamicsSubsystem'); }
  public simulateHabitatRecovery(region: any): void { recordSubsystemAction(this, 'simulateHabitatRecovery', 'EnvironmentalDynamicsSubsystem'); }
  public regenerateVegetation(region: any): void { recordSubsystemAction(this, 'regenerateVegetation', 'EnvironmentalDynamicsSubsystem'); }
  public restoreDamagedSoil(region: any): void { recordSubsystemAction(this, 'restoreDamagedSoil', 'EnvironmentalDynamicsSubsystem'); }
  public simulateWetlandExpansion(region: any): void { recordSubsystemAction(this, 'simulateWetlandExpansion', 'EnvironmentalDynamicsSubsystem'); }
  public simulateDesertification(region: any): void { recordSubsystemAction(this, 'simulateDesertification', 'EnvironmentalDynamicsSubsystem'); }
  public simulateCoastalErosion(region: any): void { recordSubsystemAction(this, 'simulateCoastalErosion', 'EnvironmentalDynamicsSubsystem'); }
  public simulateRiverDeltaGrowth(region: any): void { recordSubsystemAction(this, 'simulateRiverDeltaGrowth', 'EnvironmentalDynamicsSubsystem'); }
  public updateEcosystemBalance(region: any): void { recordSubsystemAction(this, 'updateEcosystemBalance', 'EnvironmentalDynamicsSubsystem'); }

  // 721–740. Hệ thống thời gian và biến đổi trạng thái
  public initializeObjectLifecycle(object: any): any {
    const id = typeof object === 'string' ? object : (object?.id ?? 'obj');
    const lc = { id, age: 0, health: 100, isDecayed: false };
    this.objectLifecycles.set(id, lc);
    return lc;
  }

  public updateObjectLifecycle(object: any, deltaTime: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const lc = this.objectLifecycles.get(id);
    if (lc) lc.age += deltaTime;
  }

  public setObjectAge(object: any, age: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const lc = this.objectLifecycles.get(id);
    if (lc) lc.age = age;
  }

  public calculateObjectAge(object: any): number {
    const id = typeof object === 'string' ? object : object?.id;
    return this.objectLifecycles.get(id)?.age ?? 0;
  }

  public growObjectOverTime(object: any, duration: number): void { recordSubsystemAction(this, 'growObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public shrinkObjectOverTime(object: any, duration: number): void { recordSubsystemAction(this, 'shrinkObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public matureObject(object: any): void { recordSubsystemAction(this, 'matureObject', 'EnvironmentalDynamicsSubsystem'); }
  public weakenObjectOverTime(object: any, rate: number): void { recordSubsystemAction(this, 'weakenObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public fatigueObjectOverTime(object: any, load: any): void { recordSubsystemAction(this, 'fatigueObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public accumulateObjectDamage(object: any, damage: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const lc = this.objectLifecycles.get(id);
    if (lc) lc.health = Math.max(0, lc.health - damage);
  }

  public recoverObjectCondition(object: any, rate: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const lc = this.objectLifecycles.get(id);
    if (lc) lc.health = Math.min(100, lc.health + rate);
  }

  public decayObjectOverTime(object: any, rate: number): void { recordSubsystemAction(this, 'decayObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public decomposeObjectOverTime(object: any, rate: number): void { recordSubsystemAction(this, 'decomposeObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public fadeObjectOverTime(object: any, rate: number): void { recordSubsystemAction(this, 'fadeObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public disintegrateObjectOverTime(object: any, rate: number): void { recordSubsystemAction(this, 'disintegrateObjectOverTime', 'EnvironmentalDynamicsSubsystem'); }
  public triggerObjectFailure(object: any): void { recordSubsystemAction(this, 'triggerObjectFailure', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Thay vật thể bằng các mảnh vụn.
   *
   * Trước đây luôn trả về đúng một mảnh `debris_part`. Nay số mảnh suy ra từ
   * thể tích / kích thước vật thể, mỗi mảnh có vị trí, khối lượng và tốc độ
   * nảy tính từ dữ liệu vật thể.
   */
  public replaceObjectWithDebris(object: any): any[] {
    const count = this.particleCountFor(object, ['fragmentCount', 'debrisCount', 'pieces'], 6);
    const origin = this.positionOf(object);
    const spread = this.extentOf(object, 0.5);
    const totalMass = Number(object?.mass ?? object?.weight ?? 1);
    const perPiece = totalMass > 0 ? totalMass / count : 0;
    const debris: any[] = [];
    for (let i = 0; i < count; i++) {
      const offset = this.scatter(i, spread);
      debris.push({
        id: `debris_part_${i}`,
        position: { x: origin.x + offset.x, y: origin.y + offset.y, z: origin.z + offset.z },
        velocity: { x: offset.x * 1.2, y: 0.8 + (i % 3) * 0.3, z: offset.z * 1.2 },
        mass: perPiece,
        size: spread / Math.max(1, Math.sqrt(count)),
        source: object?.id ?? 'object',
      });
    }
    return debris;
  }
  public regenerateObjectFromState(object: any, state: any): void { recordSubsystemAction(this, 'regenerateObjectFromState', 'EnvironmentalDynamicsSubsystem'); }
  public advanceSeasonalChanges(region: any, season: string): void { recordSubsystemAction(this, 'advanceSeasonalChanges', 'EnvironmentalDynamicsSubsystem'); }
  public updateWorldAging(region: any, deltaTime: number): void { recordSubsystemAction(this, 'updateWorldAging', 'EnvironmentalDynamicsSubsystem'); }

  // 741–760. Tương tác giữa công cụ và môi trường
  /**
   * Công cụ có chạm vật thể không.
   *
   * Trước đây luôn `true` — mọi cú đánh đều "chạm". Nay kiểm tra chồng lấn
   * thật giữa vùng của công cụ và vật thể (AABB nếu có `bounds`, nếu không
   * thì so bán kính quanh tâm).
   */
  public detectToolContact(tool: any, object: any): boolean {
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
  public calculateToolImpact(tool: any, object: any): ToolImpact {
    const mass = Number(tool?.mass ?? tool?.weight ?? DEFAULT_TOOL_MASS);
    const speed = this.swingSpeedOf(tool);
    const kineticEnergy =
      0.5 * (Number.isFinite(mass) && mass > 0 ? mass : DEFAULT_TOOL_MASS) * speed * speed;
    const hardness = this.hardnessOf(object);
    const sharpness = this.sharpnessOf(tool, hardness);
    const impact: ToolImpact = {
      toolType: tool?.type ?? 'axe',
      kineticEnergy,
      sharpness,
      contactPoint: this.contactPointOf(object),
    };
    this.toolImpacts.push(impact);
    return impact;
  }

  /** Tốc độ đung đưa của công cụ (m/s) — số, vector vận tốc hoặc mặc định. */
  private swingSpeedOf(tool: any): number {
    const candidate = tool?.swingSpeed ?? tool?.speed ?? tool?.swooshSpeed ?? tool?.velocity;
    if (candidate === undefined || candidate === null) return DEFAULT_SWING_SPEED;
    const magnitude = forceMagnitude(candidate);
    return magnitude > 0 ? magnitude : DEFAULT_SWING_SPEED;
  }

  /** Độ cứng của vật bị đánh — suy từ vật liệu hoặc kích thước nếu có. */
  private hardnessOf(object: any): number {
    const declared = Number(object?.hardness ?? object?.material?.hardness ?? NaN);
    if (Number.isFinite(declared) && declared > 0) return declared;
    const thickness = Number(object?.thickness ?? NaN);
    if (Number.isFinite(thickness) && thickness > 0) return thickness * 5;
    return DEFAULT_TARGET_HARDNESS;
  }

  /** Độ sắc hiệu dụng của công cụ trên vật bị đánh. */
  private sharpnessOf(tool: any, hardness: number): number {
    const declared = Number(tool?.sharpness ?? tool?.sharp ?? NaN);
    if (Number.isFinite(declared) && declared > 0) return Math.min(1, declared);
    // Vật cứng hơn thì lưỡi cùng độ sắc bị "mất" hiệu quả hơn.
    return Math.max(0.1, Math.min(1, 1 - Math.min(0.8, hardness / 10)));
  }

  /** Điểm tiếp xúc của cú đánh — theo vị trí hoặc điểm va chạm của vật. */
  private contactPointOf(object: any): Vec3 {
    const source = object?.contactPoint ?? object?.impactPoint ?? object?.position;
    if (source && typeof source === 'object') {
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

  /** Số lượng từ nhiều khoá khả năng (fallback khi dữ liệu không có). */
  private countOf(source: any, keys: string[], fallback: number): number {
    if (source && typeof source === 'object') {
      for (const key of keys) {
        const value = (source as Record<string, unknown>)[key];
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
          return Math.floor(value);
        }
        if (Array.isArray(value)) return value.length;
      }
    }
    return fallback;
  }

  /** Vị trí thế giới của đối tượng. */
  private positionOf(source: any): Vec3 {
    const p = source?.position ?? source?.origin ?? source?.center ?? source?.location;
    if (p && typeof p === 'object') {
      const x = Number(p.x ?? 0);
      const y = Number(p.y ?? 0);
      const z = Number(p.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Kích thước đặc trưng (bán kính / cạnh lớn nhất) của đối tượng. */
  private extentOf(source: any, fallback = 1): number {
    const size = source?.size ?? source?.radius ?? source?.scale ?? source?.bounds;
    if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size;
    if (size && typeof size === 'object') {
      const values = [size.x, size.y, size.z, size.max, size.width, size.height].map((v) => Number(v));
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
  private particleCountFor(source: any, keys: string[], base: number): number {
    const declared = this.countOf(source, keys, -1);
    if (declared >= 0) return declared;
    return Math.max(1, Math.round(base * Math.max(0.25, this.extentOf(source, 1))));
  }

  /** Hộp giới hạn AABB khai báo của đối tượng (nếu có). */
  private boundsOf(source: any): Aabb | null {
    const bounds = source?.bounds;
    if (!bounds || typeof bounds !== 'object') return null;
    const min = bounds.min;
    const max = bounds.max;
    if (!min || !max) return null;
    const read = (v: any, axis: 'x' | 'y' | 'z') => Number(v?.[axis] ?? NaN);
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
  private directionOf(vector: any): Vec3 {
    if (vector && typeof vector === 'object') {
      const x = Number(vector.x ?? NaN);
      const y = Number(vector.y ?? NaN);
      const z = Number(vector.z ?? NaN);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        const length = Math.hypot(x, y, z);
        if (length > 0) return { x: x / length, y: y / length, z: z / length };
      }
    }
    return { x: 0, y: 1, z: 0 };
  }

  public applyHammerImpact(object: any, impact: any): void { recordSubsystemAction(this, 'applyHammerImpact', 'EnvironmentalDynamicsSubsystem'); }
  public strikeObjectWithTool(object: any, tool: any): void {
    this.calculateToolImpact(tool, object);
  }

  public cutVegetationWithTool(plant: any, tool: any): void { recordSubsystemAction(this, 'cutVegetationWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public sawWoodObject(wood: any, tool: any): void { recordSubsystemAction(this, 'sawWoodObject', 'EnvironmentalDynamicsSubsystem'); }
  public digTerrainWithTool(terrain: any, tool: any): void { recordSubsystemAction(this, 'digTerrainWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public excavateRockWithTool(rock: any, tool: any): void { recordSubsystemAction(this, 'excavateRockWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public chipStoneWithTool(rock: any, tool: any): void { recordSubsystemAction(this, 'chipStoneWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public breakIceWithTool(ice: any, tool: any): void { recordSubsystemAction(this, 'breakIceWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public pryOpenObject(object: any, tool: any): void { recordSubsystemAction(this, 'pryOpenObject', 'EnvironmentalDynamicsSubsystem'); }
  public leverObjectWithTool(object: any, tool: any): void { recordSubsystemAction(this, 'leverObjectWithTool', 'EnvironmentalDynamicsSubsystem'); }
  public drillIntoMaterial(object: any, tool: any): void { recordSubsystemAction(this, 'drillIntoMaterial', 'EnvironmentalDynamicsSubsystem'); }
  public grindMaterialSurface(object: any, tool: any): void { recordSubsystemAction(this, 'grindMaterialSurface', 'EnvironmentalDynamicsSubsystem'); }
  public polishMaterialSurface(object: any, tool: any): void { recordSubsystemAction(this, 'polishMaterialSurface', 'EnvironmentalDynamicsSubsystem'); }
  public weldMetalParts(partA: any, partB: any): void { recordSubsystemAction(this, 'weldMetalParts', 'EnvironmentalDynamicsSubsystem'); }
  public fastenStructuralParts(partA: any, partB: any): void { recordSubsystemAction(this, 'fastenStructuralParts', 'EnvironmentalDynamicsSubsystem'); }
  public detachFastenedPart(object: any, part: any): void { recordSubsystemAction(this, 'detachFastenedPart', 'EnvironmentalDynamicsSubsystem'); }
  public repairObjectWithMaterial(object: any, material: any): void { recordSubsystemAction(this, 'repairObjectWithMaterial', 'EnvironmentalDynamicsSubsystem'); }
  public updateToolDamage(tool: any, impact: any): void { recordSubsystemAction(this, 'updateToolDamage', 'EnvironmentalDynamicsSubsystem'); }

  // 761–780. Mô phỏng phá hủy nâng cao
  public initializeDestructionGraph(object: any): FractureGraph {
    const id = typeof object === 'string' ? object : (object?.id ?? 'destr');
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
  public generateFracturePattern(object: any, impact: any): any {
    const energy = Number(impact?.energy ?? impact?.kineticEnergy ?? impact?.force ?? 100);
    const safeEnergy = Number.isFinite(energy) && energy > 0 ? energy : 100;
    const cells = Math.max(2, Math.min(24, Math.round(safeEnergy / 25)));
    const origin = this.positionOf(impact?.position ? impact : object);
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

  public propagateStructuralCrack(object: any, crack: any): void { recordSubsystemAction(this, 'propagateStructuralCrack', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Tốc độ lan truyền vết nứt (m/giây).
   *
   * Trước đây luôn `1.5`. Nay suy từ độ bền vật liệu và chiều dài vết nứt.
   */
  public calculateFracturePropagation(object: any): number {
    const toughness = Number(object?.toughness ?? object?.hardness ?? 1);
    const crackLength = Number(object?.crackLength ?? object?.size?.x ?? object?.width ?? 1);
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
  public calculateBreakPoint(object: any, force: any): Vec3 {
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
  public calculateFractureEnergy(object: any, force: any): number {
    const hardness = Number(object?.hardness ?? object?.material?.hardness ?? 1);
    const h = Number.isFinite(hardness) && hardness > 0 ? hardness : 1;
    const area = Number(object?.area ?? object?.size?.x ?? object?.width ?? 1);
    const a = Number.isFinite(area) && area > 0 ? area : 1;
    const applied = forceMagnitude(force);
    return Math.max(0, h * a * applied);
  }

  /**
   * Cắt vật thể bằng mặt phẳng — hai nửa đối xứng qua mặt phẳng.
   */
  public splitMeshAlongPlane(object: any, plane: any): any[] {
    const center = this.positionOf(object);
    const size = this.extentOf(object, 1);
    const normal = this.directionOf(plane?.normal ?? plane);
    const offset = Number(plane?.constant ?? plane?.distance ?? 0);
    const half = Number.isFinite(offset) ? offset : 0;
    const parts: any[] = [];
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
        source: object?.id ?? 'object',
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
  public splitMeshAlongCurve(object: any, curve: any): any[] {
    const points = Array.isArray(curve)
      ? curve
      : (curve?.points ?? curve?.controlPoints ?? curve?.path ?? []);
    const segments = Math.max(1, points.length);
    const origin = this.positionOf(object);
    const spread = this.extentOf(object, 1);
    const parts: any[] = [];
    for (let i = 0; i < segments; i++) {
      const point = points[i] ?? {};
      const x = Number(point.x ?? 0);
      const y = Number(point.y ?? 0);
      const z = Number(point.z ?? 0);
      parts.push({
        id: `part_${i}`,
        position: {
          x: origin.x + (Number.isFinite(x) ? x : 0),
          y: origin.y + (Number.isFinite(y) ? y : 0),
          z: origin.z + (Number.isFinite(z) ? z : 0),
        },
        size: spread / segments,
        segment: i,
        source: object?.id ?? 'object',
      });
    }
    return parts;
  }

  public createFractureCapSurface(object: any, fracture: any): void { recordSubsystemAction(this, 'createFractureCapSurface', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Mảnh vụn từ mẫu vết nứt.
   *
   * Trước đây luôn trả một mảnh `debris_frag`. Nay số mảnh bằng số ô của mẫu
   * nứt (hoặc suy ra từ vật thể), mỗi mảnh có vị trí tại tâm ô và khối lượng
   * tính từ khối lượng vật thể chia đều.
   */
  public generateFractureDebris(object: any, fracture: any): any[] {
    const seeds = Array.isArray(fracture?.cells)
      ? fracture.cells
      : Array.isArray(fracture?.seeds)
        ? fracture.seeds
        : [];
    const count = seeds.length || this.particleCountFor(object, ['fragmentCount', 'debrisCount'], 5);
    const origin = this.positionOf(object);
    const spread = this.extentOf(object, 0.5);
    const totalMass = Number(object?.mass ?? object?.weight ?? 1);
    const perPiece = totalMass > 0 ? totalMass / count : 0;
    const debris: any[] = [];
    for (let i = 0; i < count; i++) {
      const seed = seeds[i];
      const base =
        seed && typeof seed === 'object'
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
        source: object?.id ?? 'object',
      });
    }
    return debris;
  }

  public assignDebrisMass(fragments: any[]): void { recordSubsystemAction(this, 'assignDebrisMass', 'EnvironmentalDynamicsSubsystem'); }
  public assignDebrisCollision(fragments: any[]): void { recordSubsystemAction(this, 'assignDebrisCollision', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Quỹ đạo nảy của mảnh vụn — ném xiên theo trọng trường.
   *
   * Trước đây luôn trả đúng một điểm `{ x: 0, y: 2, z: 0 }`. Nay quỹ đạo được
   * tích phân từ vị trí, vận tốc và gia tốc trọng trường của mảnh vụn.
   */
  public calculateDebrisTrajectory(fragment: any): Vec3[] {
    const start = this.positionOf(fragment);
    const velocity = fragment?.velocity ?? { x: 0, y: 0, z: 0 };
    let vx = Number(velocity.x ?? 0);
    let vy = Number(velocity.y ?? 0);
    let vz = Number(velocity.z ?? 0);
    if (!Number.isFinite(vx)) vx = 0;
    if (!Number.isFinite(vy)) vy = 0;
    if (!Number.isFinite(vz)) vz = 0;
    const gravity = Number(fragment?.gravity ?? 9.81);
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

  public simulateDebrisPileCollapse(pile: any): void { recordSubsystemAction(this, 'simulateDebrisPileCollapse', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Mảnh vụn có va chạm thứ cấp không.
   *
   * Trước đây luôn `false`. Nay va chạm thứ cấp xảy ra khi mảnh vụn chạm mặt
   * đất (độ cao ≤ mặt đất) HOẶC rơi đủ nhanh để vượt ngưỡng va chạm khi còn
   * ở gần mặt đất.
   */
  public detectSecondaryImpact(debris: any): boolean {
    const speed = forceMagnitude(debris?.velocity ?? 0);
    const threshold = Number(debris?.threshold ?? debris?.impactThreshold ?? 2);
    const limit = Number.isFinite(threshold) && threshold > 0 ? threshold : 2;
    const groundY = Number(debris?.groundY ?? 0);
    const base = Number.isFinite(groundY) ? groundY : 0;
    const position = this.positionOf(debris);
    if (position.y <= base + 0.05) return true;
    return speed > 0 && speed >= limit && position.y < base + limit;
  }

  public triggerSecondaryFracture(object: any, impact: any): void { recordSubsystemAction(this, 'triggerSecondaryFracture', 'EnvironmentalDynamicsSubsystem'); }
  public simulateProgressiveObjectFailure(object: any): void { recordSubsystemAction(this, 'simulateProgressiveObjectFailure', 'EnvironmentalDynamicsSubsystem'); }
  public stabilizeRemainingStructure(object: any): void { recordSubsystemAction(this, 'stabilizeRemainingStructure', 'EnvironmentalDynamicsSubsystem'); }
  public rebuildDestructibleMesh(object: any): void { recordSubsystemAction(this, 'rebuildDestructibleMesh', 'EnvironmentalDynamicsSubsystem'); }
  public finalizeDestructionState(object: any): void { recordSubsystemAction(this, 'finalizeDestructionState', 'EnvironmentalDynamicsSubsystem'); }

  // 781–800. Animation, vật lý, đồng bộ và tối ưu hóa
  public initializeWorldAnimation(): void { recordSubsystemAction(this, 'initializeWorldAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public loadWorldAnimationClips(): string[] { return ['sway', 'flutter', 'wave']; }
  public playWorldAnimation(object: any, animation: string): void { recordSubsystemAction(this, 'playWorldAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public blendWorldAnimations(object: any, animations: string[]): void { recordSubsystemAction(this, 'blendWorldAnimations', 'EnvironmentalDynamicsSubsystem'); }
  public crossFadeWorldAnimation(object: any, from: string, to: string): void { recordSubsystemAction(this, 'crossFadeWorldAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public updateWorldAnimationMixer(deltaTime: number): void { this.animationMixerTime += deltaTime; }
  public applyRootMotionToObject(object: any, motion: Vec3): void { recordSubsystemAction(this, 'applyRootMotionToObject', 'EnvironmentalDynamicsSubsystem'); }
  public interpolateObjectPosition(object: any, deltaTime: number): void { recordSubsystemAction(this, 'interpolateObjectPosition', 'EnvironmentalDynamicsSubsystem'); }
  public interpolateObjectRotation(object: any, deltaTime: number): void { recordSubsystemAction(this, 'interpolateObjectRotation', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Cập nhật LOD của vật thể theo khoảng cách tới camera.
   *
   * Trước đây luôn trả `0` vì bản đồ LOD chưa có phần tử nào. Nay mức LOD
   * tính từ khoảng cách thật giữa vật thể và camera (mức 0 gần nhất), rồi
   * lưu lại để các lần sau đọc được.
   */
  public updateObjectLOD(object: any): number {
    const id = typeof object === 'string' ? object : (object?.id ?? 'obj');
    const origin = this.positionOf(object);
    const camera = this.positionOf(
      object?.camera ?? object?.cameraPosition ?? object?.viewer ?? { x: 0, y: 0, z: 0 },
    );
    const distance = Math.hypot(
      origin.x - camera.x,
      origin.y - camera.y,
      origin.z - camera.z,
    );
    const far = Number(object?.farDistance ?? object?.lodFar ?? 100);
    const range = Number.isFinite(far) && far > 0 ? far : 100;
    const lod = Math.max(0, Math.min(3, Math.floor((distance / range) * 3)));
    this.objectLODs.set(id, lod);
    return lod;
  }

  public updateVegetationLOD(region: any): void { recordSubsystemAction(this, 'updateVegetationLOD', 'EnvironmentalDynamicsSubsystem'); }
  public updateDestructionLOD(object: any): void { recordSubsystemAction(this, 'updateDestructionLOD', 'EnvironmentalDynamicsSubsystem'); }
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
  public wakeRigidBody(object: any): void { recordSubsystemAction(this, 'wakeRigidBody', 'EnvironmentalDynamicsSubsystem'); }
  public synchronizePhysicsAndAnimation(object: any): void { recordSubsystemAction(this, 'synchronizePhysicsAndAnimation', 'EnvironmentalDynamicsSubsystem'); }
  public rebuildWorldCollision(region: any): void { recordSubsystemAction(this, 'rebuildWorldCollision', 'EnvironmentalDynamicsSubsystem'); }
  public updateWorldNavigation(region: any): void { recordSubsystemAction(this, 'updateWorldNavigation', 'EnvironmentalDynamicsSubsystem'); }
  /**
   * Kiểm tra tính hợp lệ của mô phỏng thế giới.
   *
   * Trước đây luôn `true`. Nay kiểm tra các bất biến thật: cân bằng hệ sinh
   * thái, mật độ thảm thực vật, nhiệt độ, sức khoẻ vật thể và trạng thái
   * hệ hạt — trả `false` nếu bất kỳ giá trị nào nằm ngoài miền hợp lệ.
   */
  public validateWorldSimulation(region: any): boolean {
    const data = region ?? {};

    const balance = Number(data.balance ?? data.ecosystemBalance);
    if (Number.isFinite(balance) && (balance < 0 || balance > 1)) return false;

    const density = Number(data.vegetationDensity ?? data.density);
    if (Number.isFinite(density) && (density < 0 || density > 1)) return false;

    const temperature = Number(data.temperature);
    if (Number.isFinite(temperature) && (temperature < -90 || temperature > 70)) return false;

    const humidity = Number(data.humidity);
    if (Number.isFinite(humidity) && (humidity < 0 || humidity > 1)) return false;

    const objects = Array.isArray(data.objects) ? data.objects : [];
    for (const object of objects) {
      const health = Number(object?.health);
      if (Number.isFinite(health) && (health < 0 || health > 100)) return false;
      const age = Number(object?.age);
      if (Number.isFinite(age) && age < 0) return false;
    }

    for (const system of this.particleSystems.values()) {
      if (system.activeCount < 0 || system.activeCount > system.maxCount) return false;
    }
    for (const eco of this.ecosystems.values()) {
      const value = Number(eco?.balance);
      if (Number.isFinite(value) && (value < 0 || value > 1)) return false;
    }
    for (const lod of this.objectLODs.values()) {
      if (!Number.isFinite(lod) || lod < 0) return false;
    }
    return true;
  }

  public optimizeWorldSimulationPerformance(): void { recordSubsystemAction(this, 'optimizeWorldSimulationPerformance', 'EnvironmentalDynamicsSubsystem'); }
}
