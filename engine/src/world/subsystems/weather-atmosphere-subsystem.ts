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

/** Độ dễ cháy của vật liệu (0..1). */
const FLAMMABILITY: Record<string, number> = Object.freeze({
  wood: 0.8,
  grass: 0.9,
  cloth: 0.7,
  paper: 0.85,
  oil: 0.95,
  stone: 0.02,
  metal: 0.05,
  glass: 0.01,
  soil: 0.1,
});

/** Sức chịu lửa của vật liệu (0..1) — 1 là không cháy. */
const FIRE_RESISTANCE: Record<string, number> = Object.freeze({
  wood: 0.3,
  grass: 0.15,
  cloth: 0.2,
  paper: 0.1,
  oil: 0.05,
  stone: 0.95,
  metal: 0.9,
  glass: 0.8,
  soil: 0.9,
});

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

/** Đọc một giá trị bất kỳ dưới dạng bản ghi khoá–giá trị. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/** Một khối mây trong khí quyển. */
export interface CloudEntity {
  id: string;
  cloudType: string;
  volume: number;
  density: number;
}

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
  public clouds: Map<string, CloudEntity> = new Map();

  // -------------------------------------------------------------------------
  // Helper đọc dữ liệu thật — thay cho giá trị đóng cứng
  // -------------------------------------------------------------------------

  /** Đọc số từ nhiều khoá, có giá trị thay thế khi dữ liệu thiếu. */
  private numOf(source: unknown, keys: string[], fallback: number): number {
    const record = asRecord(source);
    if (record) {
      for (const key of keys) {
        const value = record[key];
        if (typeof value === 'number' && Number.isFinite(value)) return value;
      }
    }
    return fallback;
  }

  /** Vị trí thế giới của đối tượng. */
  private positionOf(source: unknown): Vec3 {
    const record = asRecord(source);
    const p = asRecord(record?.position ?? record?.origin ?? record?.center);
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
    const size = record?.size ?? record?.radius ?? record?.scale;
    if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size;
    const sizeRecord = asRecord(size);
    if (sizeRecord) {
      const values = [sizeRecord.x, sizeRecord.y, sizeRecord.z, sizeRecord.max, sizeRecord.width, sizeRecord.height]
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v > 0)
        .sort((a, b) => b - a);
      if (values.length > 0) return values[0];
    }
    return fallback;
  }

  // 301–320. Mưa, tuyết, băng và mưa đá
  /**
   * Hệ mưa.
   *
   * Trước đây luôn `{ active: true, dropCount: 5000 }`. Nay số giọt mưa tính từ
   * diện tích và cường độ mưa (tham số `config` hoặc trạng thái thời tiết).
   */
  public createRainSystem(config?: unknown) {
    const area = this.numOf(config, ['area', 'size', 'surfaceArea'], 100);
    const intensity = this.numOf(
      config,
      ['intensity', 'rainIntensity'],
      this.weather.rainIntensity > 0 ? this.weather.rainIntensity : 0.5,
    );
    const dropCount = Math.max(0, Math.round(area * 50 * intensity));
    return {
      active: dropCount > 0,
      dropCount,
      intensity,
      area,
      fallSpeed: 8 + intensity * 4,
    };
  }

  public spawnRaindrops(area: unknown): void { recordSubsystemAction(this, 'spawnRaindrops', 'WeatherAtmosphereSubsystem'); }
  public updateRaindropMotion(drop: unknown, deltaTime: number): void { recordSubsystemAction(this, 'updateRaindropMotion', 'WeatherAtmosphereSubsystem'); }
  public applyWindToRaindrops(drops: unknown, wind: unknown): void { recordSubsystemAction(this, 'applyWindToRaindrops', 'WeatherAtmosphereSubsystem'); }
  public createRainSplash(position: Vec3): void { recordSubsystemAction(this, 'createRainSplash', 'WeatherAtmosphereSubsystem'); }
  public accumulateRainwater(surface: unknown, amount: number): void { recordSubsystemAction(this, 'accumulateRainwater', 'WeatherAtmosphereSubsystem'); }
  /**
   * Hệ tuyết rơi.
   *
   * Trước đây luôn `{ active: true, flakeCount: 2000 }`. Nay số bông tuyết và
   * tốc độ rơi tính từ cường độ tuyết và nhiệt độ.
   */
  public createSnowfallSystem(config?: unknown) {
    const area = this.numOf(config, ['area', 'size', 'surfaceArea'], 100);
    const intensity = this.numOf(
      config,
      ['intensity', 'snowIntensity'],
      Math.max(this.weather.snowIntensity, 0),
    );
    const temperature = this.numOf(config, ['temperature'], this.weather.temperature);
    const flakeCount = Math.max(0, Math.round(area * 20 * intensity));
    return {
      active: flakeCount > 0,
      flakeCount,
      intensity,
      area,
      temperature,
      fallSpeed: Math.max(0.2, 1.2 - temperature * 0.05),
    };
  }

  public spawnSnowflakes(area: unknown): void { recordSubsystemAction(this, 'spawnSnowflakes', 'WeatherAtmosphereSubsystem'); }
  public updateSnowflakeMotion(flake: unknown, deltaTime: number): void { recordSubsystemAction(this, 'updateSnowflakeMotion', 'WeatherAtmosphereSubsystem'); }
  public accumulateSnow(surface: unknown, amount: number): void { recordSubsystemAction(this, 'accumulateSnow', 'WeatherAtmosphereSubsystem'); }
  public compactSnow(snow: unknown, force: unknown): void { recordSubsystemAction(this, 'compactSnow', 'WeatherAtmosphereSubsystem'); }
  public meltSnow(snow: unknown, temperature: number): void { recordSubsystemAction(this, 'meltSnow', 'WeatherAtmosphereSubsystem'); }
  /**
   * Băng đầu (icicle) mọc trên bề mặt.
   *
   * Trước đây luôn `{ length: 0.3 }`. Nay chiều dài tính từ kích thước bề mặt
   * và nhiệt độ (càng lạnh càng dài).
   */
  public createIcicle(surface: unknown) {
    const extent = this.extentOf(surface, 0.5);
    const temperature = this.numOf(surface, ['temperature'], this.weather.temperature);
    const cold = Math.max(0, Math.min(1, (0 - temperature) / 20));
    const length = extent * (0.2 + cold * 0.8);
    const origin = this.positionOf(surface);
    return {
      length,
      temperature,
      position: { x: origin.x, y: origin.y - length, z: origin.z },
      mass: length * 0.002,
    };
  }

  public growIcicle(icicle: unknown, temperature: number): void {
    const record = asRecord(icicle);
    if (!record || temperature >= 0) return;
    const current = typeof record.length === 'number' ? record.length : 0;
    record.length = current + Math.max(0.25, Math.abs(temperature) * 0.05);
  }
  public breakIcicle(icicle: unknown, force: unknown): void { recordSubsystemAction(this, 'breakIcicle', 'WeatherAtmosphereSubsystem'); }
  public freezeWetSurface(surface: unknown, temperature: number): void { recordSubsystemAction(this, 'freezeWetSurface', 'WeatherAtmosphereSubsystem'); }
  public thawFrozenSurface(surface: unknown, temperature: number): void { recordSubsystemAction(this, 'thawFrozenSurface', 'WeatherAtmosphereSubsystem'); }
  public createHailstone(size = 0.02) { return { size }; }
  public spawnHailstorm(area: unknown): void { recordSubsystemAction(this, 'spawnHailstorm', 'WeatherAtmosphereSubsystem'); }
  public simulateHailImpact(hailstone: unknown, surface: unknown): void { recordSubsystemAction(this, 'simulateHailImpact', 'WeatherAtmosphereSubsystem'); }

  // 321–340. Gió, áp suất và khí quyển
  /**
   * Trường gió.
   *
   * Trước đây luôn trả bản sao của trạng thái gió nội bộ ⇒ không phản ánh
   * yêu cầu của người gọi. Nay các ghi đè trong `overrides` được áp dụng lên
   * trạng thái gió.
   */
  public createWindField(overrides?: unknown) {
    const base = {
      direction: { ...this.wind.direction },
      speed: this.wind.speed,
      gustiness: this.wind.gustiness,
      pressure: this.wind.pressure,
    };
    if (!overrides || typeof overrides !== 'object') return base;
    const record = asRecord(overrides);
    const speed = this.numOf(overrides, ['speed', 'windSpeed'], base.speed);
    const gustiness = this.numOf(overrides, ['gustiness'], base.gustiness);
    const pressure = this.numOf(overrides, ['pressure', 'airPressure'], base.pressure);
    const direction = asRecord(record?.direction ?? record?.windDirection);
    const resolvedDirection = direction
      ? {
          x: Number.isFinite(Number(direction.x)) ? Number(direction.x) : base.direction.x,
          y: Number.isFinite(Number(direction.y)) ? Number(direction.y) : base.direction.y,
          z: Number.isFinite(Number(direction.z)) ? Number(direction.z) : base.direction.z,
        }
      : base.direction;
    return {
      direction: resolvedDirection,
      speed: Math.max(0, speed),
      gustiness: Math.max(0, gustiness),
      pressure,
    };
  }

  public updateWindField(field: unknown, deltaTime: number): void { recordSubsystemAction(this, 'updateWindField', 'WeatherAtmosphereSubsystem'); }
  public setWindDirection(direction: Vec3): void { this.wind.direction = { ...direction }; }
  public setWindSpeed(speed: number): void { this.wind.speed = Math.max(0, speed); }
  public calculateWindPressure(object: unknown, wind: unknown): number { return this.numOf(wind, ['speed', 'windSpeed'], this.wind.speed) * 1.25; }
  public calculateWindDrag(object: unknown, wind: unknown): number { return this.numOf(wind, ['speed', 'windSpeed'], this.wind.speed) * 0.5; }
  public simulateWindGust(gust: unknown): void { recordSubsystemAction(this, 'simulateWindGust', 'WeatherAtmosphereSubsystem'); }
  public simulateWindTurbulence(field: unknown): void { recordSubsystemAction(this, 'simulateWindTurbulence', 'WeatherAtmosphereSubsystem'); }
  public simulateThermalUpdraft(field: unknown): void { recordSubsystemAction(this, 'simulateThermalUpdraft', 'WeatherAtmosphereSubsystem'); }
  public simulateDowndraft(field: unknown): void { recordSubsystemAction(this, 'simulateDowndraft', 'WeatherAtmosphereSubsystem'); }
  public simulateWindShear(field: unknown): void { recordSubsystemAction(this, 'simulateWindShear', 'WeatherAtmosphereSubsystem'); }
  public simulateDustDevil(position: Vec3): void { recordSubsystemAction(this, 'simulateDustDevil', 'WeatherAtmosphereSubsystem'); }
  public simulateTornado(tornado: unknown): void { recordSubsystemAction(this, 'simulateTornado', 'WeatherAtmosphereSubsystem'); }
  public applyWindToParticles(particles: unknown, wind: unknown): void { recordSubsystemAction(this, 'applyWindToParticles', 'WeatherAtmosphereSubsystem'); }
  public applyWindToCloth(cloth: unknown, wind: unknown): void { recordSubsystemAction(this, 'applyWindToCloth', 'WeatherAtmosphereSubsystem'); }
  public applyWindToFlags(flags: unknown, wind: unknown): void { recordSubsystemAction(this, 'applyWindToFlags', 'WeatherAtmosphereSubsystem'); }
  public applyWindToStructures(structures: unknown, wind: unknown): void { recordSubsystemAction(this, 'applyWindToStructures', 'WeatherAtmosphereSubsystem'); }
  public calculateWindLoad(structure: unknown, wind: unknown): number { return this.numOf(wind, ['speed', 'windSpeed'], this.wind.speed) * 10; }
  /**
   * Vật thể có bị gió làm hư hại không.
   *
   * Trước đây chỉ so tốc độ gió với ngưỡng cứng. Nay tải gió (tốc độ × diện
   * tích chắn gió) được so với sức chịu gió của chính vật thể.
   */
  public detectWindDamage(object: unknown, wind: unknown): boolean {
    const speed = this.numOf(wind, ['speed', 'windSpeed'], this.wind.speed);
    const extent = this.extentOf(object, 1);
    const resistance = this.numOf(object, ['windResistance'], 0.5);
    // Sức chịu gió quy về lực tương đương (đơn vị tham chiếu 100).
    const resistanceForce = resistance * 100;
    const load = speed * extent * extent;
    return load > resistanceForce;
  }

  public updateAtmosphericPressure(field: unknown): void { recordSubsystemAction(this, 'updateAtmosphericPressure', 'WeatherAtmosphereSubsystem'); }

  // 341–360. Mây, sương mù và các hiện tượng bầu trời
  public createCloud(cloudType = 'cumulus'): CloudEntity {
    const id = `cloud_${Date.now()}`;
    const cloud: CloudEntity = { id, cloudType, volume: 500, density: 0.8 };
    this.clouds.set(id, cloud);
    return cloud;
  }
  public generateCloudVolume(cloud: unknown): void { recordSubsystemAction(this, 'generateCloudVolume', 'WeatherAtmosphereSubsystem'); }
  public updateCloudShape(cloud: unknown, deltaTime: number): void { recordSubsystemAction(this, 'updateCloudShape', 'WeatherAtmosphereSubsystem'); }
  public moveCloudWithWind(cloud: unknown, wind: unknown): void { recordSubsystemAction(this, 'moveCloudWithWind', 'WeatherAtmosphereSubsystem'); }
  public mergeClouds(cloudA: unknown, cloudB: unknown): void { recordSubsystemAction(this, 'mergeClouds', 'WeatherAtmosphereSubsystem'); }
  public separateClouds(cloudA: unknown, cloudB: unknown): void { recordSubsystemAction(this, 'separateClouds', 'WeatherAtmosphereSubsystem'); }
  public dissipateCloud(cloud: unknown, rate: number): void { recordSubsystemAction(this, 'dissipateCloud', 'WeatherAtmosphereSubsystem'); }
  public condenseCloudVapor(cloud: unknown): void { recordSubsystemAction(this, 'condenseCloudVapor', 'WeatherAtmosphereSubsystem'); }
  public simulateCumulusGrowth(cloud: unknown): void { recordSubsystemAction(this, 'simulateCumulusGrowth', 'WeatherAtmosphereSubsystem'); }
  public simulateStormCloudGrowth(cloud: unknown): void { recordSubsystemAction(this, 'simulateStormCloudGrowth', 'WeatherAtmosphereSubsystem'); }
  public createFogVolume(area: unknown) { return { area, density: 0.6 }; }
  public spreadFog(fog: unknown, wind: unknown): void { recordSubsystemAction(this, 'spreadFog', 'WeatherAtmosphereSubsystem'); }
  public dissipateFog(fog: unknown, temperature: number): void { recordSubsystemAction(this, 'dissipateFog', 'WeatherAtmosphereSubsystem'); }
  public simulateGroundFog(area: unknown): void { recordSubsystemAction(this, 'simulateGroundFog', 'WeatherAtmosphereSubsystem'); }
  public simulateMistOverWater(water: unknown): void { recordSubsystemAction(this, 'simulateMistOverWater', 'WeatherAtmosphereSubsystem'); }
  public simulateAtmosphericHaze(atmosphere: unknown): void { recordSubsystemAction(this, 'simulateAtmosphericHaze', 'WeatherAtmosphereSubsystem'); }
  /**
   * Cầu vồng.
   *
   * Trước đây luôn `{ visible: true }`. Nay mức độ hiện và cường độ cầu vồng
   * phụ thuộc vị trí mặt trời, lượng mưa và độ ẩm.
   */
  public createRainbow(atmosphere: unknown) {
    const sunElevation = this.numOf(atmosphere, ['sunElevation', 'elevation'], 45);
    const rain = this.numOf(
      atmosphere,
      ['rain', 'rainIntensity', 'precipitation'],
      this.weather.rainIntensity > 0 ? this.weather.rainIntensity : 0.4,
    );
    const humidity = this.numOf(
      atmosphere,
      ['humidity'],
      this.weather.humidity > 20 ? this.weather.humidity / 100 : 0.6,
    );
    const angle = 42 - sunElevation * 0.5;
    const visible = rain > 0.05 && humidity > 0.2 && sunElevation > 0;
    return {
      visible,
      angle,
      radius: 42,
      intensity: visible ? Math.min(1, rain * 0.2) * Math.min(1, humidity * 2) : 0,
      arc: 180,
    };
  }

  public updateRainbowVisibility(rainbow: unknown): void { recordSubsystemAction(this, 'updateRainbowVisibility', 'WeatherAtmosphereSubsystem'); }
  public simulateHeatShimmer(area: unknown): void { recordSubsystemAction(this, 'simulateHeatShimmer', 'WeatherAtmosphereSubsystem'); }
  public updateSkyAtmosphere(atmosphere: unknown): void { recordSubsystemAction(this, 'updateSkyAtmosphere', 'WeatherAtmosphereSubsystem'); }

  // 361–380. Sấm, chớp và bão
  /**
   * Tạo cơn bão trên một vùng.
   *
   * Năng lượng bão lấy từ vùng khi có (mặc định 100) để `generateLightningBolt`
   * sinh tia sét theo năng lượng thật.
   */
  public createThunderstorm(area: unknown) {
    const energy = Number(asRecord(area)?.energy ?? DEFAULT_STORM_ENERGY);
    return { area, energy: Number.isFinite(energy) ? energy : DEFAULT_STORM_ENERGY, active: true };
  }

  public accumulateStormEnergy(storm: unknown): void { recordSubsystemAction(this, 'accumulateStormEnergy', 'WeatherAtmosphereSubsystem'); }
  /**
   * Sinh tia sét từ cơn bão.
   *
   * Trước đây `storm` bị bỏ qua hoàn toàn — mọi tia sét đều có cùng gốc,
   * đích và cường độ. Nay năng lượng bão quyết định cường độ tia sét, còn
   * vị trí và bán kính bão quyết định điểm phóng.
   */
  public generateLightningBolt(storm: unknown): LightningBolt {
    const info = asRecord(storm) ?? {};
    const energy = Number(info.energy ?? DEFAULT_STORM_ENERGY);
    const cloudBase = Number(info.cloudBase ?? CLOUD_BASE_HEIGHT);
    const center = this.stormCenter(info);
    const radius = this.stormRadius(info);
    const bolt: LightningBolt = {
      id: `bolt_${Date.now()}`,
      // Tia sét phát ra từ đáy mây, đúng tâm bão.
      origin: {
        x: center.x,
        y: Number.isFinite(cloudBase) ? cloudBase : CLOUD_BASE_HEIGHT,
        z: center.z,
      },
      // Điểm đích nằm trong vùng bão, cách tâm một phần bán kính.
      target: { x: center.x + radius * 0.6, y: 0, z: center.z + radius * 0.6 },
      intensity:
        (Number.isFinite(energy) ? energy : DEFAULT_STORM_ENERGY) * LIGHTNING_INTENSITY_PER_ENERGY,
    };
    this.lightningBolts.push(bolt);
    return bolt;
  }

  /** Tâm của bão — suy ra từ vị trí, vùng hoặc tâm đã biết. */
  private stormCenter(storm: unknown): { x: number; z: number } {
    const record = asRecord(storm);
    const candidate = asRecord(record?.position ?? record?.center ?? record?.area ?? record?.target);
    if (candidate) {
      const x = Number(candidate.x ?? 0);
      const z = Number(candidate.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(z)) return { x, z };
    }
    return { x: 0, z: 0 };
  }

  /** Bán kính bão — suy ra từ vùng bão hoặc bán kính cho sẵn. */
  private stormRadius(storm: unknown): number {
    const record = asRecord(storm);
    const area = asRecord(record?.area);
    if (area) {
      const radius = Number(area.radius ?? area.size ?? 0);
      if (Number.isFinite(radius) && radius > 0) return radius;
    }
    const radius = Number(record?.radius ?? 0);
    return Number.isFinite(radius) && radius > 0 ? radius : DEFAULT_STORM_RADIUS;
  }
  public branchLightningBolt(bolt: LightningBolt): void { recordSubsystemAction(this, 'branchLightningBolt', 'WeatherAtmosphereSubsystem'); }
  public illuminateSceneWithLightning(bolt: LightningBolt): void { recordSubsystemAction(this, 'illuminateSceneWithLightning', 'WeatherAtmosphereSubsystem'); }
  public createLightningFlash(position: Vec3): void { recordSubsystemAction(this, 'createLightningFlash', 'WeatherAtmosphereSubsystem'); }
  /**
   * Điểm tia sét đánh xuống.
   *
   * Trước đây luôn `{ x: 0, y: 0, z: 0 }`. Nay điểm đánh nằm trong vùng bão,
   * lệch theo năng lượng bão (tất định — không dùng `Math.random`).
   */
  public calculateLightningStrikeTarget(storm: unknown): Vec3 {
    const center = this.positionOf(storm);
    const energy = this.numOf(storm, ['energy', 'intensity'], DEFAULT_STORM_ENERGY);
    const radius = this.numOf(storm, ['radius'], DEFAULT_STORM_RADIUS);
    const offset = (energy % 1) * radius * 0.5;
    const angle = energy * 2.399963229728653;
    return {
      x: center.x + Math.cos(angle) * offset,
      y: center.y,
      z: center.z + Math.sin(angle) * offset,
    };
  }

  public strikeLightningTarget(target: unknown): void { recordSubsystemAction(this, 'strikeLightningTarget', 'WeatherAtmosphereSubsystem'); }
  public applyLightningDamage(target: unknown): void { recordSubsystemAction(this, 'applyLightningDamage', 'WeatherAtmosphereSubsystem'); }
  public createThunderSound(bolt: LightningBolt): void { recordSubsystemAction(this, 'createThunderSound', 'WeatherAtmosphereSubsystem'); }
  public propagateThunderWave(position: Vec3): void { recordSubsystemAction(this, 'propagateThunderWave', 'WeatherAtmosphereSubsystem'); }
  public createStormWind(storm: unknown): void { recordSubsystemAction(this, 'createStormWind', 'WeatherAtmosphereSubsystem'); }
  public generateStormRain(storm: unknown): void { recordSubsystemAction(this, 'generateStormRain', 'WeatherAtmosphereSubsystem'); }
  public spawnStormDebris(storm: unknown): void { recordSubsystemAction(this, 'spawnStormDebris', 'WeatherAtmosphereSubsystem'); }
  public simulateStormSurge(coast: unknown): void { recordSubsystemAction(this, 'simulateStormSurge', 'WeatherAtmosphereSubsystem'); }
  /**
   * Sát thương của cơn bão lên công trình.
   *
   * Trước đây luôn `150`. Nay tính từ năng lượng bão, tốc độ gió, diện tích
   * vùng chịu ảnh hưởng, số công trình và áp suất khí quyển.
   */
  public calculateStormDamage(structures: unknown): number {
    const energy = this.numOf(structures, ['energy', 'stormEnergy'], DEFAULT_STORM_ENERGY);
    const windSpeed = this.numOf(structures, ['windSpeed', 'speed'], this.wind.speed);
    const area = this.numOf(structures, ['area', 'surfaceArea'], 100);
    const count = Array.isArray(asRecord(structures)?.structures)
      ? (asRecord(structures)!.structures as unknown[]).length
      : this.numOf(structures, ['structureCount'], 1);
    const pressure = this.numOf(structures, ['pressure', 'airPressure'], this.wind.pressure);
    const base = (energy * 0.5 + windSpeed * 2) * (area / 100) * count;
    const pressureFactor = pressure > 0 ? 1 + (1013.25 - pressure) / 400 : 1;
    return Math.max(0, base * pressureFactor);
  }

  public dissipateThunderstorm(storm: unknown): void { recordSubsystemAction(this, 'dissipateThunderstorm', 'WeatherAtmosphereSubsystem'); }
  public simulateHurricane(hurricane: unknown): void { recordSubsystemAction(this, 'simulateHurricane', 'WeatherAtmosphereSubsystem'); }
  public simulateCyclone(cyclone: unknown): void { recordSubsystemAction(this, 'simulateCyclone', 'WeatherAtmosphereSubsystem'); }
  public updateStormRecovery(area: unknown): void { recordSubsystemAction(this, 'updateStormRecovery', 'WeatherAtmosphereSubsystem'); }

  // 381–400. Lửa, khói và nhiệt
  public createFire(source: unknown): FireEntity {
    // Id có hậu tố ngẫu nhiên để nhiều ngọn lửa tạo trong cùng mili-giây
    // không ghi đè lên nhau trong sổ đăng ký.
    const id = `fire_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const sourceRecord = asRecord(source);
    const fire: FireEntity = {
      id,
      targetId:
        typeof source === 'string'
          ? source
          : typeof sourceRecord?.id === 'string'
            ? sourceRecord.id
            : 'object',
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
  public igniteObject(object: unknown, ignitionSource: unknown): FireEntity {
    const fire = this.createFire(object);
    const profile = this.ignitionProfile(ignitionSource);
    fire.temperature = profile.temperature;
    fire.intensity = profile.intensity;
    fire.spreadRate = profile.spreadRate;
    Object.assign(fire as unknown as Record<string, unknown>, { ignitionSource: profile.id });
    return fire;
  }

  /** Đặc trưng nhiệt độ / cường độ / tốc độ lan của một nguồn lửa. */
  private ignitionProfile(source: unknown): {
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
    const record = asRecord(source);
    if (record) {
      const typeName = typeof record.type === 'string' ? record.type : undefined;
      const known = typeName ? IGNITION_SOURCES[typeName.toLowerCase()] : undefined;
      const temperature = Number(record.temperature ?? record.heat ?? NaN);
      const intensity = Number(record.intensity ?? NaN);
      const spreadRate = Number(record.spreadRate ?? NaN);
      const id =
        typeof record.id === 'string' ? record.id : typeName ?? 'unknown';
      return {
        id,
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
  public spreadFire(fire: FireEntity | string, target: unknown): void {
    const source = typeof fire === 'string' ? this.fires.get(fire) : fire;
    const newFire = this.createFire(target);
    if (!source) return;
    const targetRecord = asRecord(target);
    const flammability = Number(targetRecord?.flammability ?? targetRecord?.fuelLoad ?? 1);
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
  /**
   * Tốc độ cháy của vật thể (0..1).
   *
   * Trước đây luôn `0.5`. Nay tính từ độ dễ cháy của vật liệu, độ ẩm (vật ẩm
   * cháy chậm), nhiệt độ và nồng độ oxy.
   */
  public calculateCombustionRate(object: unknown): number {
    const record = asRecord(object);
    const material = String(record?.material ?? record?.type ?? 'wood');
    const flammability = FLAMMABILITY[material] ?? 0.5;
    const moisture = this.numOf(object, ['moisture', 'humidity'], 0.2);
    const temperature = this.numOf(object, ['temperature'], this.weather.temperature);
    const oxygen = this.numOf(object, ['oxygen', 'oxygenLevel'], 0.21);
    const dryness = Math.max(0, 1 - Math.min(1, moisture * 2));
    const heat = Math.max(0, Math.min(1, temperature / 120));
    const supply = oxygen > 0 ? Math.min(1, oxygen / 0.21) : 0;
    return Math.max(0, Math.min(1, flammability * dryness * (0.4 + heat) * supply));
  }

  public calculateFireTemperature(fire: FireEntity | string): number {
    const f = typeof fire === 'string' ? this.fires.get(fire) : fire;
    return f ? f.temperature : 600;
  }
  public updateFlameShape(fire: FireEntity | string): void { recordSubsystemAction(this, 'updateFlameShape', 'WeatherAtmosphereSubsystem'); }
  public spawnFireParticles(fire: FireEntity | string): void { recordSubsystemAction(this, 'spawnFireParticles', 'WeatherAtmosphereSubsystem'); }
  /**
   * Khói từ ngọn lửa.
   *
   * Trước đây luôn `{ density: 0.8 }`. Nay mật độ khói tính từ cường độ và
   * nhiệt độ của lửa cùng kích thước vùng cháy.
   */
  public generateSmoke(fire: FireEntity | string) {
    const f = typeof fire === 'string' ? this.fires.get(fire) : fire;
    const temperature = this.numOf(f, ['temperature'], 0);
    const intensity = this.numOf(f, ['intensity'], 0);
    const size = this.extentOf(f, 1);
    const density = Math.min(
      1,
      (intensity * 0.6 + Math.min(1, temperature / 1200) * 0.4) * Math.min(1, size / 2),
    );
    const origin = this.positionOf(f);
    return {
      density,
      temperature,
      origin,
      riseSpeed: 0.5 + temperature / 400,
      particleCount: Math.round(density * 200),
    };
  }
  public spreadSmoke(smoke: unknown, wind: unknown): void { recordSubsystemAction(this, 'spreadSmoke', 'WeatherAtmosphereSubsystem'); }
  public dissipateSmoke(smoke: unknown, rate: number): void { recordSubsystemAction(this, 'dissipateSmoke', 'WeatherAtmosphereSubsystem'); }

  /**
   * Tia lửa bắn ra từ nguồn lửa.
   *
   * Trước đây luôn `{ temp: 400 }`. Nay nhiệt độ, khối lượng, kích thước và
   * thời gian sống suy từ nguồn.
   */
  public createEmber(emberSource: unknown) {
    const temperature = this.numOf(emberSource, ['temperature', 'temp'], 400);
    const mass = this.numOf(emberSource, ['mass', 'weight'], 0.001);
    const size = this.extentOf(emberSource, 0.01);
    const origin = this.positionOf(emberSource);
    return {
      temp: temperature,
      mass,
      size,
      position: { x: origin.x, y: origin.y, z: origin.z },
      life: Math.max(0.5, 12 - temperature / 120),
      drag: 0.6 * Math.min(1, size * 100),
    };
  }

  public scatterEmbers(embers: unknown, wind: unknown): void { recordSubsystemAction(this, 'scatterEmbers', 'WeatherAtmosphereSubsystem'); }
  public igniteDryVegetation(plant: unknown): void { this.createFire(plant); }
  public charObjectSurface(object: unknown, heat: number): void { recordSubsystemAction(this, 'charObjectSurface', 'WeatherAtmosphereSubsystem'); }
  public burnObjectMaterial(object: unknown, rate: number): void { recordSubsystemAction(this, 'burnObjectMaterial', 'WeatherAtmosphereSubsystem'); }
  public deformObjectByHeat(object: unknown, heat: number): void { recordSubsystemAction(this, 'deformObjectByHeat', 'WeatherAtmosphereSubsystem'); }
  public meltObjectMaterial(object: unknown, temperature: number): void { recordSubsystemAction(this, 'meltObjectMaterial', 'WeatherAtmosphereSubsystem'); }
  public coolBurningObject(object: unknown, rate: number): void { recordSubsystemAction(this, 'coolBurningObject', 'WeatherAtmosphereSubsystem'); }
  /**
   * Mức sát thương do lửa (0..100).
   *
   * Trước đây luôn `50`. Nay tính từ nhiệt độ tiếp xúc, mức phơi nhiễm và sức
   * chịu lửa của vật liệu.
   */
  public calculateFireDamage(object: unknown): number {
    const temperature = this.numOf(object, ['temperature', 'fireTemperature'], 0);
    const record = asRecord(object);
    const material = String(record?.material ?? record?.type ?? 'wood');
    const resistance = FIRE_RESISTANCE[material] ?? 0.5;
    const exposure = this.numOf(object, ['exposure', 'fireExposure'], 1);
    const heat = Math.max(0, Math.min(1, temperature / 1000));
    return Math.max(0, Math.min(100, heat * exposure * 100 * (1 - resistance * 0.8)));
  }


  // 401–420. Đá rơi, sạt lở và tuyết lở
  public createRockfall(region: unknown) { return { region, active: true }; }
  public releaseRockFromSlope(rock: unknown, slope: unknown): void { recordSubsystemAction(this, 'releaseRockFromSlope', 'WeatherAtmosphereSubsystem'); }
  /**
   * Quỹ đạo đá lăn từ sườn.
   *
   * Trước đây luôn trả hai điểm cố định. Nay quỹ đạo được tích phân từ vị trí
   * và vận tốc của đá dưới trọng trường.
   */
  public calculateRockfallTrajectory(rock: unknown): Vec3[] {
    const start = this.positionOf(rock);
    const velocity = asRecord(asRecord(rock)?.velocity) ?? { x: 0, y: 0, z: 0 };
    let vx = Number(velocity.x ?? 0);
    let vy = Number(velocity.y ?? 0);
    let vz = Number(velocity.z ?? 0);
    if (!Number.isFinite(vx)) vx = 0;
    if (!Number.isFinite(vy)) vy = 0;
    if (!Number.isFinite(vz)) vz = 0;
    const gravity = this.numOf(rock, ['gravity'], 9.81);
    const steps = Math.max(2, Math.min(64, this.numOf(rock, ['steps', 'sampleCount'], 12)));
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
      vy -= gravity * dt;
    }
    return path;
  }

  public simulateRockBouncing(rock: unknown, surface: unknown): void { recordSubsystemAction(this, 'simulateRockBouncing', 'WeatherAtmosphereSubsystem'); }
  public simulateRockRolling(rock: unknown, slope: unknown): void { recordSubsystemAction(this, 'simulateRockRolling', 'WeatherAtmosphereSubsystem'); }
  public simulateRockFragmentation(rock: unknown): void { recordSubsystemAction(this, 'simulateRockFragmentation', 'WeatherAtmosphereSubsystem'); }
  public createLandslide(region: unknown) { return { region, mass: 10000 }; }
  /**
   * Sườn có sạt lở không.
   *
   * Trước đây luôn `false`. Nay sạt lở xảy ra khi lực phá hoại (độ dốc + mưa
   * bão hoà) vượt quá sức chịu của sườn.
   */
  public calculateSlopeFailure(region: unknown): boolean {
    const steepness = this.numOf(region, ['steepness', 'slope'], 0);
    const stability = this.numOf(region, ['slopeStability', 'stability'], 1);
    const saturation = this.numOf(region, ['saturation', 'moisture'], 0);
    const driving = steepness * (1 - Math.min(1, stability)) + saturation * 0.5;
    return driving > 0.35;
  }

  public displaceLandslideSoil(landslide: unknown): void { recordSubsystemAction(this, 'displaceLandslideSoil', 'WeatherAtmosphereSubsystem'); }
  public simulateDebrisFlow(flow: unknown): void { recordSubsystemAction(this, 'simulateDebrisFlow', 'WeatherAtmosphereSubsystem'); }
  public depositLandslideDebris(landslide: unknown): void { recordSubsystemAction(this, 'depositLandslideDebris', 'WeatherAtmosphereSubsystem'); }
  public createAvalanche(region: unknown) { return { region, snowVolume: 50000 }; }
  public triggerSnowSlabFailure(snowpack: unknown): void { recordSubsystemAction(this, 'triggerSnowSlabFailure', 'WeatherAtmosphereSubsystem'); }
  public simulateAvalancheMotion(avalanche: unknown): void { recordSubsystemAction(this, 'simulateAvalancheMotion', 'WeatherAtmosphereSubsystem'); }
  public simulateAvalancheDebris(avalanche: unknown): void { recordSubsystemAction(this, 'simulateAvalancheDebris', 'WeatherAtmosphereSubsystem'); }
  public buryObjectsInDebris(objects: unknown[], debris: unknown): void { recordSubsystemAction(this, 'buryObjectsInDebris', 'WeatherAtmosphereSubsystem'); }
  /**
   * Độ sâu vùi của vật thể trong khối vụn.
   *
   * Trước đây luôn `1.5`. Nay độ sâu vùi tính từ khối lượng vụn và kích
   * thước vật thể (vật càng lớn càng vùi sâu hơn).
   */
  public calculateBurialDepth(object: unknown, debris: unknown): number {
    const mass = this.numOf(debris, ['mass', 'totalMass', 'volume'], 1);
    const extent = this.extentOf(object, 0.5);
    const density = this.numOf(debris, ['density'], 1600);
    const volume = density > 0 ? mass / density : mass;
    return Math.max(0.1, volume / Math.max(0.05, extent * extent) + extent * 0.5);
  }

  public stabilizeDamagedSlope(region: unknown): void { recordSubsystemAction(this, 'stabilizeDamagedSlope', 'WeatherAtmosphereSubsystem'); }
  public erodeUnstableSlope(region: unknown): void { recordSubsystemAction(this, 'erodeUnstableSlope', 'WeatherAtmosphereSubsystem'); }
  public updateSlopeAfterFailure(region: unknown): void { recordSubsystemAction(this, 'updateSlopeAfterFailure', 'WeatherAtmosphereSubsystem'); }
}
