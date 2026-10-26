/**
 * @file weather-atmosphere-subsystem.ts
 * @module @aetheria/engine/world/subsystems/weather-atmosphere-subsystem
 * @description Rain, Snow, Wind, Clouds, Fog, Thunderstorms, Fire & Mass Wasting (301–420).
 */

import { WindState, WeatherState, FireEntity, LightningBolt } from '../types.js';
import type { Vec3 } from '../../types/index.js';
import { forceMagnitude } from './vegetation-subsystem.js';

// ---------------------------------------------------------------------------
// Hằng số kỹ thuật — chuẩn suy ra khi không có dữ liệu bão / nguồn lửa
// ---------------------------------------------------------------------------

/** Năng lượng mặc định của một cơn bão (đơn vị năng lượng của hệ thống). */
const DEFAULT_STORM_ENERGY = 100;
/** Cường độ tia sét sinh ra từ mỗi đơn vị năng lượng bão. */
const LIGHTNING_INTENSITY_PER_ENERGY = 10;
/** Cao độ đáy mây dùng làm gốc tia sét (m). */
const CLOUD_BASE_HEIGHT = 8000;
/** Bán kính bão mặc định khi không có dữ liệu (m). */
const DEFAULT_STORM_RADIUS = 500;

/**
 * Đặc trưng nhiệt độ (°C), cường độ (0–1) và tốc độ lan của các nguồn lửa
 * thông dụng. Nguồn không có trong bảng thì dùng đặc trưng mặc định.
 */
const IGNITION_SOURCES: Record<string, { temperature: number; intensity: number; spreadRate: number }> = {
  torch: { temperature: 800, intensity: 0.8, spreadRate: 0.3 },
  campfire: { temperature: 700, intensity: 0.7, spreadRate: 0.25 },
  fireplace: { temperature: 650, intensity: 0.6, spreadRate: 0.2 },
  spark: { temperature: 600, intensity: 0.5, spreadRate: 0.15 },
  lightning: { temperature: 2000, intensity: 1.0, spreadRate: 0.5 },
  wildfire: { temperature: 900, intensity: 1.0, spreadRate: 0.6 },
};

/** Đặc trưng mặc định của một ngọn lửa. */
const DEFAULT_FIRE_PROFILE = { temperature: 650, intensity: 1.0, spreadRate: 0.2 };

export class WeatherAtmosphereSubsystem {
  public wind: WindState = {
    direction: { x: 1, y: 0, z: 0 },
    speed: 4.0,
    gustiness: 0.2,
    pressure: 1013.25,
  };

  public weather: WeatherState = {
    rainIntensity: 0,
    snowIntensity: 0,
    hailIntensity: 0,
    cloudCover: 0.2,
    fogDensity: 0,
    temperature: 20.0,
    humidity: 50.0,
    airPressure: 1013.25,
  };

  public fires: Map<string, FireEntity> = new Map();
  public lightningBolts: LightningBolt[] = [];
  public clouds: Map<string, any> = new Map();

  // 301–320. Mưa, tuyết, băng và mưa đá
  public createRainSystem(): any { return { active: true, dropCount: 5000 }; }
  public spawnRaindrops(area: any): void {}
  public updateRaindropMotion(drop: any, deltaTime: number): void {}
  public applyWindToRaindrops(drops: any, wind: any): void {}
  public createRainSplash(position: Vec3): void {}
  public accumulateRainwater(surface: any, amount: number): void {}
  public createSnowfallSystem(): any { return { active: true, flakeCount: 2000 }; }
  public spawnSnowflakes(area: any): void {}
  public updateSnowflakeMotion(flake: any, deltaTime: number): void {}
  public accumulateSnow(surface: any, amount: number): void {}
  public compactSnow(snow: any, force: any): void {}
  public meltSnow(snow: any, temperature: number): void {}
  public createIcicle(surface: any): any { return { length: 0.3 }; }
  public growIcicle(icicle: any, temperature: number): void {
    if (icicle && temperature < 0) icicle.length += 0.05;
  }
  public breakIcicle(icicle: any, force: any): void {}
  public freezeWetSurface(surface: any, temperature: number): void {}
  public thawFrozenSurface(surface: any, temperature: number): void {}
  public createHailstone(size = 0.02): any { return { size }; }
  public spawnHailstorm(area: any): void {}
  public simulateHailImpact(hailstone: any, surface: any): void {}

  // 321–340. Gió, áp suất và khí quyển
  public createWindField(): any { return { ...this.wind }; }
  public updateWindField(field: any, deltaTime: number): void {}
  public setWindDirection(direction: Vec3): void { this.wind.direction = { ...direction }; }
  public setWindSpeed(speed: number): void { this.wind.speed = Math.max(0, speed); }
  public calculateWindPressure(object: any, wind: any): number { return (wind?.speed ?? this.wind.speed) * 1.25; }
  public calculateWindDrag(object: any, wind: any): number { return (wind?.speed ?? this.wind.speed) * 0.5; }
  public simulateWindGust(gust: any): void {}
  public simulateWindTurbulence(field: any): void {}
  public simulateThermalUpdraft(field: any): void {}
  public simulateDowndraft(field: any): void {}
  public simulateWindShear(field: any): void {}
  public simulateDustDevil(position: Vec3): void {}
  public simulateTornado(tornado: any): void {}
  public applyWindToParticles(particles: any, wind: any): void {}
  public applyWindToCloth(cloth: any, wind: any): void {}
  public applyWindToFlags(flags: any, wind: any): void {}
  public applyWindToStructures(structures: any, wind: any): void {}
  public calculateWindLoad(structure: any, wind: any): number { return (wind?.speed ?? this.wind.speed) * 10; }
  public detectWindDamage(object: any, wind: any): boolean { return (wind?.speed ?? this.wind.speed) > 25; }
  public updateAtmosphericPressure(field: any): void {}

  // 341–360. Mây, sương mù và các hiện tượng bầu trời
  public createCloud(cloudType = 'cumulus'): any {
    const id = `cloud_${Date.now()}`;
    const cloud = { id, cloudType, volume: 500, density: 0.8 };
    this.clouds.set(id, cloud);
    return cloud;
  }
  public generateCloudVolume(cloud: any): void {}
  public updateCloudShape(cloud: any, deltaTime: number): void {}
  public moveCloudWithWind(cloud: any, wind: any): void {}
  public mergeClouds(cloudA: any, cloudB: any): void {}
  public separateClouds(cloudA: any, cloudB: any): void {}
  public dissipateCloud(cloud: any, rate: number): void {}
  public condenseCloudVapor(cloud: any): void {}
  public simulateCumulusGrowth(cloud: any): void {}
  public simulateStormCloudGrowth(cloud: any): void {}
  public createFogVolume(area: any): any { return { area, density: 0.6 }; }
  public spreadFog(fog: any, wind: any): void {}
  public dissipateFog(fog: any, temperature: number): void {}
  public simulateGroundFog(area: any): void {}
  public simulateMistOverWater(water: any): void {}
  public simulateAtmosphericHaze(atmosphere: any): void {}
  public createRainbow(atmosphere: any): any { return { visible: true }; }
  public updateRainbowVisibility(rainbow: any): void {}
  public simulateHeatShimmer(area: any): void {}
  public updateSkyAtmosphere(atmosphere: any): void {}

  // 361–380. Sấm, chớp và bão
  /**
   * Tạo cơn bão trên một vùng.
   *
   * Năng lượng bão lấy từ vùng khi có (mặc định 100) để `generateLightningBolt`
   * sinh tia sét theo năng lượng thật.
   */
  public createThunderstorm(area: any): any {
    const energy = Number(area?.energy ?? DEFAULT_STORM_ENERGY);
    return { area, energy: Number.isFinite(energy) ? energy : DEFAULT_STORM_ENERGY, active: true };
  }

  public accumulateStormEnergy(storm: any): void {}
  /**
   * Sinh tia sét từ cơn bão.
   *
   * Trước đây `storm` bị bỏ qua hoàn toàn — mọi tia sét đều có cùng gốc,
   * đích và cường độ. Nay năng lượng bão quyết định cường độ tia sét, còn
   * vị trí và bán kính bão quyết định điểm phóng.
   */
  public generateLightningBolt(storm: any): LightningBolt {
    const info = storm ?? {};
    const energy = Number(info.energy ?? DEFAULT_STORM_ENERGY);
    const center = this.stormCenter(info);
    const radius = this.stormRadius(info);
    const bolt: LightningBolt = {
      id: `bolt_${Date.now()}`,
      // Tia sét phát ra từ đáy mây, đúng tâm bão.
      origin: { x: center.x, y: Number(info.cloudBase ?? CLOUD_BASE_HEIGHT), z: center.z },
      // Điểm đích nằm trong vùng bão, cách tâm một phần bán kính.
      target: { x: center.x + radius * 0.6, y: 0, z: center.z + radius * 0.6 },
      intensity:
        (Number.isFinite(energy) ? energy : DEFAULT_STORM_ENERGY) * LIGHTNING_INTENSITY_PER_ENERGY,
    };
    this.lightningBolts.push(bolt);
    return bolt;
  }

  /** Tâm của bão — suy ra từ vị trí, vùng hoặc tâm đã biết. */
  private stormCenter(storm: any): { x: number; z: number } {
    const candidate = storm?.position ?? storm?.center ?? storm?.area ?? storm?.target;
    if (candidate && typeof candidate === 'object') {
      const x = Number(candidate.x ?? 0);
      const z = Number(candidate.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(z)) return { x, z };
    }
    return { x: 0, z: 0 };
  }

  /** Bán kính bão — suy ra từ vùng bão hoặc bán kính cho sẵn. */
  private stormRadius(storm: any): number {
    const area = storm?.area;
    if (area && typeof area === 'object') {
      const radius = Number(area.radius ?? area.size ?? 0);
      if (Number.isFinite(radius) && radius > 0) return radius;
    }
    const radius = Number(storm?.radius ?? 0);
    return Number.isFinite(radius) && radius > 0 ? radius : DEFAULT_STORM_RADIUS;
  }
  public branchLightningBolt(bolt: LightningBolt): void {}
  public illuminateSceneWithLightning(bolt: LightningBolt): void {}
  public createLightningFlash(position: Vec3): void {}
  public calculateLightningStrikeTarget(storm: any): Vec3 { return { x: 0, y: 0, z: 0 }; }
  public strikeLightningTarget(target: any): void {}
  public applyLightningDamage(target: any): void {}
  public createThunderSound(bolt: LightningBolt): void {}
  public propagateThunderWave(position: Vec3): void {}
  public createStormWind(storm: any): void {}
  public generateStormRain(storm: any): void {}
  public spawnStormDebris(storm: any): void {}
  public simulateStormSurge(coast: any): void {}
  public calculateStormDamage(structures: any): number { return 150; }
  public dissipateThunderstorm(storm: any): void {}
  public simulateHurricane(hurricane: any): void {}
  public simulateCyclone(cyclone: any): void {}
  public updateStormRecovery(area: any): void {}

  // 381–400. Lửa, khói và nhiệt
  public createFire(source: any): FireEntity {
    // Id có hậu tố ngẫu nhiên để nhiều ngọn lửa tạo trong cùng mili-giây
    // không ghi đè lên nhau trong sổ đăng ký.
    const id = `fire_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fire: FireEntity = {
      id,
      targetId: typeof source === 'string' ? source : (source?.id ?? 'object'),
      temperature: 650,
      intensity: 1.0,
      spreadRate: 0.2,
      isExtinguished: false,
    };
    this.fires.set(id, fire);
    return fire;
  }
  /**
   * Đốt cháy một vật bằng một nguồn lửa.
   *
   * Trước đây `ignitionSource` bị bỏ qua hoàn toàn — mọi ngọn lửa có cùng
   * nhiệt độ, cường độ và tốc độ lan. Nay nguồn lửa quyết định các đại lượng
   * đó cho ngọn lửa mới.
   */
  public igniteObject(object: any, ignitionSource: any): FireEntity {
    const fire = this.createFire(object);
    const profile = this.ignitionProfile(ignitionSource);
    fire.temperature = profile.temperature;
    fire.intensity = profile.intensity;
    fire.spreadRate = profile.spreadRate;
    Object.assign(fire as unknown as Record<string, unknown>, { ignitionSource: profile.id });
    return fire;
  }

  /** Đặc trưng nhiệt độ / cường độ / tốc độ lan của một nguồn lửa. */
  private ignitionProfile(source: any): {
    id: string;
    temperature: number;
    intensity: number;
    spreadRate: number;
  } {
    if (source == null) return { id: 'unknown', ...DEFAULT_FIRE_PROFILE };
    if (typeof source === 'string') {
      const key = source.toLowerCase();
      const known = IGNITION_SOURCES[key];
      return known ? { id: key, ...known } : { id: key, ...DEFAULT_FIRE_PROFILE };
    }
    if (typeof source === 'object') {
      const known =
        typeof source.type === 'string' ? IGNITION_SOURCES[source.type.toLowerCase()] : undefined;
      const temperature = Number(source.temperature ?? source.heat ?? NaN);
      const intensity = Number(source.intensity ?? NaN);
      const spreadRate = Number(source.spreadRate ?? NaN);
      return {
        id: source.id ?? source.type ?? 'unknown',
        temperature: Number.isFinite(temperature) ? temperature : (known?.temperature ?? DEFAULT_FIRE_PROFILE.temperature),
        intensity: Number.isFinite(intensity) ? intensity : (known?.intensity ?? DEFAULT_FIRE_PROFILE.intensity),
        spreadRate: Number.isFinite(spreadRate) ? spreadRate : (known?.spreadRate ?? DEFAULT_FIRE_PROFILE.spreadRate),
      };
    }
    return { id: 'unknown', ...DEFAULT_FIRE_PROFILE };
  }

  public extinguishFire(fire: FireEntity | string): void {
    const f = typeof fire === 'string' ? this.fires.get(fire) : fire;
    if (f) f.isExtinguished = true;
  }

  /**
   * Lan cháy từ một ngọn lửa sang vật mới.
   *
   * Trước đây `fire` bị bỏ qua hoàn toàn — ngọn lửa mới luôn có nhiệt độ và
   * cường độ mặc định, không liên hệ với ngọn lửa nguồn. Nay ngọn lửa mới
   * thừa hưởng nhiệt độ, cường độ và tốc độ lan của nguồn, điều chỉnh theo
   * khả năng cháy của vật đích.
   */
  public spreadFire(fire: FireEntity | string, target: any): void {
    const source = typeof fire === 'string' ? this.fires.get(fire) : fire;
    const newFire = this.createFire(target);
    if (!source) return;
    const flammability = Number(target?.flammability ?? target?.fuelLoad ?? 1);
    const factor = Number.isFinite(flammability) && flammability > 0 ? flammability : 1;
    newFire.temperature = source.temperature;
    newFire.intensity = Math.max(0.05, source.intensity * factor);
    newFire.spreadRate = source.spreadRate * factor;
    Object.assign(newFire as unknown as Record<string, unknown>, {
      parentFireId: source.id,
      sourceIntensity: source.intensity,
    });
    // Ngọn lửa nguồn mất một phần cường độ khi truyền sang vật mới.
    source.intensity = Math.max(0, source.intensity - 0.05);
  }
  public calculateCombustionRate(object: any): number { return 0.5; }
  public calculateFireTemperature(fire: FireEntity | string): number {
    const f = typeof fire === 'string' ? this.fires.get(fire) : fire;
    return f ? f.temperature : 600;
  }
  public updateFlameShape(fire: FireEntity | string): void {}
  public spawnFireParticles(fire: FireEntity | string): void {}
  public generateSmoke(fire: FireEntity | string): any { return { density: 0.8 }; }
  public spreadSmoke(smoke: any, wind: any): void {}
  public dissipateSmoke(smoke: any, rate: number): void {}
  public createEmber(emberSource: any): any { return { temp: 400 }; }
  public scatterEmbers(embers: any, wind: any): void {}
  public igniteDryVegetation(plant: any): void { this.createFire(plant); }
  public charObjectSurface(object: any, heat: number): void {}
  public burnObjectMaterial(object: any, rate: number): void {}
  public deformObjectByHeat(object: any, heat: number): void {}
  public meltObjectMaterial(object: any, temperature: number): void {}
  public coolBurningObject(object: any, rate: number): void {}
  public calculateFireDamage(object: any): number { return 50; }

  // 401–420. Đá rơi, sạt lở và tuyết lở
  public createRockfall(region: any): any { return { region, active: true }; }
  public releaseRockFromSlope(rock: any, slope: any): void {}
  public calculateRockfallTrajectory(rock: any): Vec3[] { return [{ x: 0, y: 10, z: 0 }, { x: 5, y: 0, z: 5 }]; }
  public simulateRockBouncing(rock: any, surface: any): void {}
  public simulateRockRolling(rock: any, slope: any): void {}
  public simulateRockFragmentation(rock: any): void {}
  public createLandslide(region: any): any { return { region, mass: 10000 }; }
  public calculateSlopeFailure(region: any): boolean { return false; }
  public displaceLandslideSoil(landslide: any): void {}
  public simulateDebrisFlow(flow: any): void {}
  public depositLandslideDebris(landslide: any): void {}
  public createAvalanche(region: any): any { return { region, snowVolume: 50000 }; }
  public triggerSnowSlabFailure(snowpack: any): void {}
  public simulateAvalancheMotion(avalanche: any): void {}
  public simulateAvalancheDebris(avalanche: any): void {}
  public buryObjectsInDebris(objects: any[], debris: any): void {}
  public calculateBurialDepth(object: any, debris: any): number { return 1.5; }
  public stabilizeDamagedSlope(region: any): void {}
  public erodeUnstableSlope(region: any): void {}
  public updateSlopeAfterFailure(region: any): void {}
}
