/**
 * @file terrain-hydrology-subsystem.ts
 * @module @aetheria/engine/world/subsystems/terrain-hydrology-subsystem
 * @description Rocks, Mountains, Terrain, Soil, Sand, Mud and Hydrology (221–300).
 */

import { RockEntity, MountainRegion, SoilPatch, WaterBodyEntity } from '../types.js';
import type { Vec3 } from '../../types/index.js';
import { forceMagnitude } from './vegetation-subsystem.js';

// ---------------------------------------------------------------------------
// Hằng số kỹ thuật — chuẩn suy ra khi vùng không cung cấp dữ liệu
// ---------------------------------------------------------------------------

/** Năng lượng (J) cần để tách một mảnh vỡ, tính theo độ cứng của đá. */
const ROCK_FRAGMENT_ENERGY_PER_HARDNESS = 10;
/** Độ cao mặc định của một dãy núi (m). */
const DEFAULT_MOUNTAIN_HEIGHT = 1200;
/** Độ ổn định sườn mặc định (0–1). */
const DEFAULT_MOUNTAIN_SLOPE_STABILITY = 0.9;
/** Tốc độ xói mòn mặc định (m/lần xử lý). */
const DEFAULT_MOUNTAIN_EROSION = 0.01;
/** Cao độ tuyết (m) — từ đây trở lên có tuyết phủ quanh năm. */
const SNOW_LINE = 1000;
/** Độ ẩm mặc định của một mảnh đất (%). */
const DEFAULT_SOIL_MOISTURE = 30;
/** Mức nén mặc định của một mảnh đất (0–1). */
const DEFAULT_SOIL_COMPACTION = 0.5;
/** Độ màu mỡ mặc định của một mảnh đất (0–100). */
const DEFAULT_SOIL_FERTILITY = 70;
/** Lực (N) gây ra mức nén 1.0 của một mảnh đất. */
const SOIL_COMPACTION_SCALE = 100;

/** Núi có thêm trạng thái tuyết tích luỹ. */
interface MountainState extends MountainRegion {
  region: string | null;
  snowDepth: number;
}

/** Mảnh đất có thêm lịch sử lực nén. */
interface SoilState extends SoilPatch {
  region: string | null;
  area: number;
  compactedLoad: number;
}

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

export class TerrainHydrologySubsystem {
  public rocks: Map<string, RockEntity> = new Map();
  public mountains: Map<string, MountainRegion> = new Map();
  public soilPatches: Map<string, SoilPatch> = new Map();

  /** Đọc số từ nhiều khoá, có giá trị thay thế khi dữ liệu thiếu. */
  private numOf(source: any, keys: string[], fallback: number): number {
    if (source && typeof source === 'object') {
      for (const key of keys) {
        const value = (source as Record<string, unknown>)[key];
        if (typeof value === 'number' && Number.isFinite(value)) return value;
      }
    }
    return fallback;
  }
  public waterBodies: Map<string, WaterBodyEntity> = new Map();
  public ripples: Array<{ position: Vec3; time: number }> = [];

  // 221–240. Đá, sỏi và khoáng vật
  public createRock(type = 'granite'): RockEntity {
    const id = `rock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const rock: RockEntity = {
      id,
      type,
      hardness: 7.0,
      fractureStress: 0,
      isFractured: false,
      fragments: [],
    };
    this.rocks.set(id, rock);
    return rock;
  }

  public generateRockGeometry(rock: RockEntity | string): void { recordSubsystemAction(this, 'generateRockGeometry', 'TerrainHydrologySubsystem'); }
  public setRockHardness(rock: RockEntity | string, hardness: number): void {
    const r = typeof rock === 'string' ? this.rocks.get(rock) : rock;
    if (r) r.hardness = hardness;
  }

  public applyRockStress(rock: RockEntity | string, force: any): void {
    const r = typeof rock === 'string' ? this.rocks.get(rock) : rock;
    if (r) r.fractureStress += (force?.magnitude ?? 10);
  }

  public detectRockCracks(rock: RockEntity | string): boolean {
    const r = typeof rock === 'string' ? this.rocks.get(rock) : rock;
    return (r?.fractureStress ?? 0) > 50;
  }

  public initiateRockFracture(rock: RockEntity | string): void {
    const r = typeof rock === 'string' ? this.rocks.get(rock) : rock;
    if (r) r.isFractured = true;
  }

  /**
   * Phá vỡ đá.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn — mọi lần phá cho kết quả giống
   * nhau. Nay lực quyết định ứng lực tích luỹ, năng lượng phá vỡ và số mảnh
   * vỡ sinh ra (mảnh càng nhiều khi đá cứng và lực càng lớn).
   */
  public fractureRock(rock: RockEntity | string, force: any): void {
    const r = typeof rock === 'string' ? this.rocks.get(rock) : rock;
    if (!r) return;
    const magnitude = forceMagnitude(force);
    r.fractureStress += magnitude;
    r.isFractured = true;
    const perFragment = Math.max(1, r.hardness * ROCK_FRAGMENT_ENERGY_PER_HARDNESS);
    const fragments = Math.max(2, Math.min(8, Math.round(magnitude / perFragment) + 1));
    Object.assign(r as unknown as Record<string, unknown>, {
      fractureEnergy: magnitude,
      fractureCount: fragments,
    });
    r.fragments = Array.from({ length: fragments }, (_, i) => `${r.id}_frag_${i + 1}`);
  }

  public splitRockIntoFragments(rock: RockEntity | string): string[] {
    const r = typeof rock === 'string' ? this.rocks.get(rock) : rock;
    if (r) {
      r.isFractured = true;
      r.fragments = [`${r.id}_frag_1`, `${r.id}_frag_2`];
      return r.fragments;
    }
    return [];
  }

  public chipRockSurface(rock: RockEntity | string, impact: any): void { recordSubsystemAction(this, 'chipRockSurface', 'TerrainHydrologySubsystem'); }
  public erodeRockSurface(rock: RockEntity | string, rate: number): void { recordSubsystemAction(this, 'erodeRockSurface', 'TerrainHydrologySubsystem'); }
  public weatherRock(rock: RockEntity | string, weather: any): void { recordSubsystemAction(this, 'weatherRock', 'TerrainHydrologySubsystem'); }
  public dissolveRock(rock: RockEntity | string, fluid: any): void { recordSubsystemAction(this, 'dissolveRock', 'TerrainHydrologySubsystem'); }
  public polishRockSurface(rock: RockEntity | string, amount: number): void { recordSubsystemAction(this, 'polishRockSurface', 'TerrainHydrologySubsystem'); }
  public dislodgeRock(rock: RockEntity | string, force: any): void { recordSubsystemAction(this, 'dislodgeRock', 'TerrainHydrologySubsystem'); }
  public rollRock(rock: RockEntity | string, direction: Vec3): void { recordSubsystemAction(this, 'rollRock', 'TerrainHydrologySubsystem'); }
  public slideRock(rock: RockEntity | string, surface: any): void { recordSubsystemAction(this, 'slideRock', 'TerrainHydrologySubsystem'); }
  public toppleRock(rock: RockEntity | string, force: any): void { recordSubsystemAction(this, 'toppleRock', 'TerrainHydrologySubsystem'); }
  public buryRock(rock: RockEntity | string, sediment: any): void { recordSubsystemAction(this, 'buryRock', 'TerrainHydrologySubsystem'); }
  public exposeRock(rock: RockEntity | string, erosion: any): void { recordSubsystemAction(this, 'exposeRock', 'TerrainHydrologySubsystem'); }
  public regenerateRockCollision(rock: RockEntity | string): void { recordSubsystemAction(this, 'regenerateRockCollision', 'TerrainHydrologySubsystem'); }

  // 241–260. Núi, vách đá và địa hình
  /**
   * Tạo dãy núi trong một vùng.
   *
   * Trước đây `region` bị bỏ qua hoàn toàn. Nay vùng quyết định độ cao, độ
   * ổn định sườn, tốc độ xói mòn và việc có tuyết phủ hay không.
   */
  public createMountain(region: any): MountainRegion {
    const id = `mountain_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const info = typeof region === 'string' ? { regionId: region } : (region ?? {});
    const height = Number(info.height ?? info.elevation ?? info.peakHeight ?? DEFAULT_MOUNTAIN_HEIGHT);
    const slope = Number(info.slopeStability ?? DEFAULT_MOUNTAIN_SLOPE_STABILITY);
    const erosion = Number(info.erosionRate ?? DEFAULT_MOUNTAIN_EROSION);
    const mountain: MountainState = {
      id,
      height: Number.isFinite(height) ? height : DEFAULT_MOUNTAIN_HEIGHT,
      slopeStability: Number.isFinite(slope) ? slope : DEFAULT_MOUNTAIN_SLOPE_STABILITY,
      erosionRate: Number.isFinite(erosion) ? erosion : DEFAULT_MOUNTAIN_EROSION,
      hasSnow:
        typeof info.hasSnow === 'boolean'
          ? info.hasSnow
          : (Number.isFinite(height) ? height : DEFAULT_MOUNTAIN_HEIGHT) >= SNOW_LINE,
      region: typeof region === 'string' ? region : (region?.id ?? null),
      snowDepth: 0,
    };
    this.mountains.set(id, mountain);
    return mountain;
  }

  public generateMountainTerrain(region: any): void { recordSubsystemAction(this, 'generateMountainTerrain', 'TerrainHydrologySubsystem'); }
  public updateMountainHeight(region: any, amount: number): void {
    const m = typeof region === 'string' ? this.mountains.get(region) : region;
    if (m) m.height += amount;
  }

  public deformMountainSurface(region: any, force: any): void { recordSubsystemAction(this, 'deformMountainSurface', 'TerrainHydrologySubsystem'); }
  public formRockyRidge(region: any): void { recordSubsystemAction(this, 'formRockyRidge', 'TerrainHydrologySubsystem'); }
  public formMountainValley(region: any): void { recordSubsystemAction(this, 'formMountainValley', 'TerrainHydrologySubsystem'); }
  public generateCliffFace(region: any): void { recordSubsystemAction(this, 'generateCliffFace', 'TerrainHydrologySubsystem'); }
  public erodeMountain(region: any, rate: number): void {
    const m = typeof region === 'string' ? this.mountains.get(region) : region;
    if (m) m.height = Math.max(0, m.height - rate);
  }

  public weatherMountainSurface(region: any, weather: any): void { recordSubsystemAction(this, 'weatherMountainSurface', 'TerrainHydrologySubsystem'); }
  public fractureMountainRock(region: any, force: any): void { recordSubsystemAction(this, 'fractureMountainRock', 'TerrainHydrologySubsystem'); }
  public triggerRockfall(region: any): void { recordSubsystemAction(this, 'triggerRockfall', 'TerrainHydrologySubsystem'); }
  public triggerLandslide(region: any): void { recordSubsystemAction(this, 'triggerLandslide', 'TerrainHydrologySubsystem'); }
  public collapseCliffSection(region: any, section: any): void { recordSubsystemAction(this, 'collapseCliffSection', 'TerrainHydrologySubsystem'); }
  public generateTalusSlope(region: any): void { recordSubsystemAction(this, 'generateTalusSlope', 'TerrainHydrologySubsystem'); }
  public depositMountainSediment(region: any, sediment: any): void { recordSubsystemAction(this, 'depositMountainSediment', 'TerrainHydrologySubsystem'); }
  public carveRiverValley(region: any, river: any): void { recordSubsystemAction(this, 'carveRiverValley', 'TerrainHydrologySubsystem'); }
  /**
   * Tích tụ tuyết trên núi.
   *
   * Trước đây `snow` bị bỏ qua hoàn toàn — mọi lần tích tụ cho kết quả
   * giống nhau. Nay độ sâu tuyết tích luỹ quyết định độ phủ tuyết và làm
   * giảm độ ổn định sườn núi.
   */
  public accumulateSnowOnMountain(region: any, snow: number): void {
    const m = (typeof region === 'string' ? this.mountains.get(region) : region) as MountainState | undefined;
    if (!m) return;
    const amount = Number.isFinite(snow) ? Math.max(0, snow) : 0;
    m.snowDepth = (m.snowDepth ?? 0) + amount;
    m.hasSnow = m.snowDepth > 0;
    // Tuyết nặng làm sườn núi dễ trượt hơn.
    m.slopeStability = Math.max(0, m.slopeStability - amount * 0.001);
  }

  public meltMountainSnow(region: any, temperature: number): void {
    const m = (typeof region === 'string' ? this.mountains.get(region) : region) as MountainState | undefined;
    if (m && temperature > 5) {
      m.hasSnow = false;
      m.snowDepth = 0;
    }
  }

  /**
   * Độ ổn định của sườn (0..1).
   *
   * Trước đây trả `undefined` khi vùng không phải vùng núi đã đăng ký. Nay
   * tính từ độ dốc, độ ổn định đất và mức bão hoà nước.
   */
  public calculateSlopeStability(region: any): number {
    const m = typeof region === 'string' ? this.mountains.get(region) : region;
    if (m && Number.isFinite(Number(m.slopeStability))) return Number(m.slopeStability);
    const steepness = this.numOf(region, ['steepness', 'slope', 'height'], 0);
    const saturation = this.numOf(region, ['saturation', 'moisture'], 0);
    const soilStrength = this.numOf(region, ['soilStrength', 'cohesion', 'stability'], 0.6);
    const stability = soilStrength * (1 - Math.min(0.8, steepness * 0.5)) * (1 - saturation * 0.4);
    return Math.max(0, Math.min(1, stability));
  }

  public updateMountainCollision(region: any): void { recordSubsystemAction(this, 'updateMountainCollision', 'TerrainHydrologySubsystem'); }

  // 261–280. Đất, cát, bùn và trầm tích
  /**
   * Tạo mảnh đất trong một khu vực.
   *
   * Trước đây `area` bị bỏ qua hoàn toàn. Nay khu vực quyết định độ ẩm, mức
   * nén, độ màu mỡ ban đầu và diện tích của mảnh đất.
   */
  public createSoilPatch(area: any): SoilPatch {
    const id = `soil_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const info = typeof area === 'string' ? { regionId: area } : (area ?? {});
    const moisture = Number(info.moisture ?? DEFAULT_SOIL_MOISTURE);
    const compaction = Number(info.compaction ?? DEFAULT_SOIL_COMPACTION);
    const fertility = Number(info.fertility ?? DEFAULT_SOIL_FERTILITY);
    const mudLevel = Number(info.mudLevel ?? 0);
    const size = Number(info.area ?? info.size ?? 0);
    const patch: SoilState = {
      id,
      moisture: Number.isFinite(moisture) ? moisture : DEFAULT_SOIL_MOISTURE,
      compaction: Number.isFinite(compaction) ? compaction : DEFAULT_SOIL_COMPACTION,
      fertility: Number.isFinite(fertility) ? fertility : DEFAULT_SOIL_FERTILITY,
      mudLevel: Number.isFinite(mudLevel) ? mudLevel : 0,
      region: typeof area === 'string' ? area : (area?.id ?? null),
      area: Number.isFinite(size) ? size : 0,
      compactedLoad: 0,
    };
    this.soilPatches.set(id, patch);
    return patch;
  }

  public initializeSoilProperties(soil: SoilPatch | string): void { recordSubsystemAction(this, 'initializeSoilProperties', 'TerrainHydrologySubsystem'); }

  /**
   * Nén đất.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn — mỗi lần nén chỉ tăng đúng 0.1
   * bất kể lực mạnh hay yếu. Nay mức nén tỉ lệ với lực nén thật.
   */
  public compactSoil(soil: SoilPatch | string, force: any): void {
    const s = (typeof soil === 'string' ? this.soilPatches.get(soil) : soil) as SoilState | undefined;
    if (!s) return;
    const magnitude = forceMagnitude(force);
    s.compaction = Math.min(1.0, s.compaction + magnitude / SOIL_COMPACTION_SCALE);
    // Lực nén đã dồn vào lớp đất được ghi lại để tra cứu lại được.
    s.compactedLoad = (s.compactedLoad ?? 0) + magnitude;
  }

  public loosenSoil(soil: SoilPatch | string, amount: number): void {
    const s = typeof soil === 'string' ? this.soilPatches.get(soil) : soil;
    if (s) s.compaction = Math.max(0, s.compaction - amount);
  }

  public deformSoilSurface(soil: SoilPatch | string, force: any): void { recordSubsystemAction(this, 'deformSoilSurface', 'TerrainHydrologySubsystem'); }
  public createFootprint(soil: SoilPatch | string, foot: any): any {
    return { soil, foot, depth: 0.05 };
  }

  public eraseFootprint(soil: SoilPatch | string, rate: number): void { recordSubsystemAction(this, 'eraseFootprint', 'TerrainHydrologySubsystem'); }
  public displaceSoil(soil: SoilPatch | string, direction: Vec3): void { recordSubsystemAction(this, 'displaceSoil', 'TerrainHydrologySubsystem'); }
  public excavateSoil(soil: SoilPatch | string, amount: number): void { recordSubsystemAction(this, 'excavateSoil', 'TerrainHydrologySubsystem'); }
  public fillExcavation(soil: SoilPatch | string, material: any): void { recordSubsystemAction(this, 'fillExcavation', 'TerrainHydrologySubsystem'); }
  public erodeSoil(soil: SoilPatch | string, water: any): void { recordSubsystemAction(this, 'erodeSoil', 'TerrainHydrologySubsystem'); }
  public depositSediment(soil: SoilPatch | string, sediment: any): void { recordSubsystemAction(this, 'depositSediment', 'TerrainHydrologySubsystem'); }
  public liquefySoil(soil: SoilPatch | string, saturation: number): void {
    const s = typeof soil === 'string' ? this.soilPatches.get(soil) : soil;
    if (s) s.mudLevel = saturation;
  }

  public dryMud(mud: any, rate: number): void { recordSubsystemAction(this, 'dryMud', 'TerrainHydrologySubsystem'); }
  public crackDryMud(mud: any): void { recordSubsystemAction(this, 'crackDryMud', 'TerrainHydrologySubsystem'); }
  public splashMud(mud: any, impact: any): void { recordSubsystemAction(this, 'splashMud', 'TerrainHydrologySubsystem'); }
  public simulateSandSliding(sand: any, slope: any): void { recordSubsystemAction(this, 'simulateSandSliding', 'TerrainHydrologySubsystem'); }
  /**
   * Hình thành cồn cát.
   *
   * Trước đây luôn `{ height: 3 }`. Nay chiều cao cồn tính từ lượng cát và
   * sức gió (gió mạnh ⇒ cồn thấp và rộng hơn).
   */
  public formSandDune(sand: any, wind: any): any {
    const volume = this.numOf(sand, ['volume', 'amount', 'sandVolume'], 10);
    const speed = this.numOf(wind, ['speed', 'windSpeed'], 4);
    const spread = 1 + Math.min(4, speed * 0.2);
    const height = Math.max(0.1, (volume / spread) * 0.3);
    return { height, width: spread * 3, volume, windSpeed: speed };
  }

  public reshapeSandDune(dune: any, wind: any): void { recordSubsystemAction(this, 'reshapeSandDune', 'TerrainHydrologySubsystem'); }
  public updateTerrainSurface(terrain: any): void { recordSubsystemAction(this, 'updateTerrainSurface', 'TerrainHydrologySubsystem'); }

  // 281–300. Nước, dòng chảy và mặt nước
  public createWaterBody(type: WaterBodyEntity['type'] = 'river'): WaterBodyEntity {
    const id = `water_${Date.now()}`;
    const wb: WaterBodyEntity = {
      id,
      type,
      waterLevel: 10.0,
      flowSpeed: 1.5,
      isFrozen: false,
    };
    this.waterBodies.set(id, wb);
    return wb;
  }

  public initializeWaterSimulation(water: WaterBodyEntity | string): void { recordSubsystemAction(this, 'initializeWaterSimulation', 'TerrainHydrologySubsystem'); }
  public updateWaterSimulation(water: WaterBodyEntity | string, deltaTime: number): void { recordSubsystemAction(this, 'updateWaterSimulation', 'TerrainHydrologySubsystem'); }
  /**
   * Tốc độ dòng chảy của mặt nước (m/s).
   *
   * Trước đây trả `undefined` khi mặt nước chưa được đăng ký. Nay tính từ
   * gradient, độ sâu và lưu lượng khai báo.
   */
  public calculateWaterFlow(water: WaterBodyEntity | string): number {
    const wb = typeof water === 'string' ? this.waterBodies.get(water) : water;
    if (wb && Number.isFinite(Number(wb.flowSpeed))) return Number(wb.flowSpeed);
    const gradient = this.numOf(water, ['gradient', 'slope', 'steepness'], 0);
    const depth = this.numOf(water, ['depth', 'level'], 1);
    const flow = this.numOf(water, ['flow', 'discharge'], 0);
    if (flow > 0) return flow;
    // Manning xấp xỉ đơn giản: v ≈ (1/3)·R^(2/3)·S^(1/2)
    const hydraulicRadius = Math.max(0.01, depth / 2);
    return Math.max(0, (1 / 3) * Math.pow(hydraulicRadius, 2 / 3) * Math.sqrt(Math.max(0, gradient)));
  }

  public updateWaterLevel(water: WaterBodyEntity | string, level: number): void {
    const wb = typeof water === 'string' ? this.waterBodies.get(water) : water;
    if (wb) wb.waterLevel = level;
  }

  public simulateWaterCurrent(water: WaterBodyEntity | string, force: any): void { recordSubsystemAction(this, 'simulateWaterCurrent', 'TerrainHydrologySubsystem'); }
  public generateWaterWaves(water: WaterBodyEntity | string, wind: any): void { recordSubsystemAction(this, 'generateWaterWaves', 'TerrainHydrologySubsystem'); }
  public propagateWaterWave(wave: any): void { recordSubsystemAction(this, 'propagateWaterWave', 'TerrainHydrologySubsystem'); }
  public reflectWaterWave(wave: any, surface: any): void { recordSubsystemAction(this, 'reflectWaterWave', 'TerrainHydrologySubsystem'); }
  public createWaterRipple(position: Vec3): void {
    this.ripples.push({ position, time: Date.now() });
  }

  public createSplash(position: Vec3, force: any): any {
    return { position, force, dropletsCount: 20 };
  }

  public simulateWaterDroplets(splash: any): void { recordSubsystemAction(this, 'simulateWaterDroplets', 'TerrainHydrologySubsystem'); }
  public simulateWaterfall(waterfall: any): void { recordSubsystemAction(this, 'simulateWaterfall', 'TerrainHydrologySubsystem'); }
  public simulateRiverFlow(river: any): void { recordSubsystemAction(this, 'simulateRiverFlow', 'TerrainHydrologySubsystem'); }
  public simulateStreamFlow(stream: any): void { recordSubsystemAction(this, 'simulateStreamFlow', 'TerrainHydrologySubsystem'); }
  public simulateFlooding(area: any, water: any): void { recordSubsystemAction(this, 'simulateFlooding', 'TerrainHydrologySubsystem'); }
  public erodeRiverbank(riverbank: any, water: any): void { recordSubsystemAction(this, 'erodeRiverbank', 'TerrainHydrologySubsystem'); }
  public depositRiverSediment(river: any, sediment: any): void { recordSubsystemAction(this, 'depositRiverSediment', 'TerrainHydrologySubsystem'); }
  public freezeWaterSurface(water: WaterBodyEntity | string, temperature: number): void {
    const wb = typeof water === 'string' ? this.waterBodies.get(water) : water;
    if (wb && temperature <= 0) wb.isFrozen = true;
  }

  public meltWaterSurface(water: WaterBodyEntity | string, temperature: number): void {
    const wb = typeof water === 'string' ? this.waterBodies.get(water) : water;
    if (wb && temperature > 0) wb.isFrozen = false;
  }
}
