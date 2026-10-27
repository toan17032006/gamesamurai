/**
 * @file weather-ecosystem.ts
 * @module @aetheria/engine/objects/weather-ecosystem
 * @description Dynamic weather cycles, environmental zones, wind physics, and biome ecosystems.
 */

export type WeatherType =
  | 'clear'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'sandstorm'
  | 'ashfall'
  | 'aurora';

export interface WindVector {
  direction: [number, number, number];
  speed: number; // meters/sec
  gustFactor: number;
}

export interface BiomeZoneConfig<TSpawn = unknown> {
  id: string;
  name: string;
  temperature: number; // Celsius
  humidity: number; // 0 to 1
  vegetationDensity: number; // 0 to 1
  monsterSpawns: { entityType: string; weight: number; spawnData?: TSpawn }[];
}

/**
 * Weather Zone with dynamic transitions, wind vectors, and precipitation intensity.
 */
export class WeatherZone<TIntensity = number> {
  public currentWeather: WeatherType = 'clear';
  public targetWeather: WeatherType = 'clear';
  public intensity: TIntensity;
  public wind: WindVector = {
    direction: [1, 0, 0],
    speed: 5,
    gustFactor: 1.2,
  };
  private _transitionProgress = 1.0;
  private _transitionDuration = 10;

  constructor(initialWeather: WeatherType = 'clear', initialIntensity?: TIntensity) {
    this.currentWeather = initialWeather;
    this.targetWeather = initialWeather;
    this.intensity = (initialIntensity ?? (1.0 as unknown as TIntensity));
  }

  public setWeather(newWeather: WeatherType, transitionSeconds = 5): void {
    if (newWeather === this.currentWeather) return;
    this.targetWeather = newWeather;
    this._transitionDuration = Math.max(0.1, transitionSeconds);
    this._transitionProgress = 0;
  }

  public updateWind(dir: [number, number, number], speed: number): void {
    this.wind.direction = dir;
    this.wind.speed = Math.max(0, speed);
  }

  public tick(dt: number): void {
    if (this._transitionProgress < 1.0) {
      this._transitionProgress += dt / this._transitionDuration;
      if (this._transitionProgress >= 1.0) {
        this._transitionProgress = 1.0;
        this.currentWeather = this.targetWeather;
      }
    }
  }

  public get precipitationRate(): number {
    if (this.currentWeather === 'rain') return 0.5 * Number(this.intensity);
    if (this.currentWeather === 'storm') return 1.0 * Number(this.intensity);
    if (this.currentWeather === 'snow') return 0.3 * Number(this.intensity);
    return 0;
  }
}

/**
 * Biome Descriptor describing environmental conditions and spawn tables.
 */
export class BiomeDescriptor<TSpawn = unknown> {
  public config: BiomeZoneConfig<TSpawn>;

  constructor(config: BiomeZoneConfig<TSpawn>) {
    this.config = config;
  }

  public sampleSpawn(): { entityType: string; spawnData?: TSpawn } | null {
    const list = this.config.monsterSpawns;
    if (!list || list.length === 0) return null;

    let totalWeight = 0;
    for (const s of list) totalWeight += s.weight;
    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (const s of list) {
      if (roll <= s.weight) {
        return { entityType: s.entityType, spawnData: s.spawnData };
      }
      roll -= s.weight;
    }
    return null;
  }
}

/**
 * Ecosystem Controller coordinating biomes, local weather zones, and wildlife density.
 */
export class EcosystemController {
  private _biomes: Map<string, BiomeDescriptor> = new Map();
  private _weatherZone: WeatherZone;

  constructor(defaultWeather: WeatherZone = new WeatherZone('clear')) {
    this._weatherZone = defaultWeather;
  }

  public registerBiome(biome: BiomeDescriptor): void {
    this._biomes.set(biome.config.id, biome);
  }

  public getBiome(id: string): BiomeDescriptor | undefined {
    return this._biomes.get(id);
  }

  public getWeather(): WeatherZone {
    return this._weatherZone;
  }

  public tick(dt: number): void {
    this._weatherZone.tick(dt);
  }
}
