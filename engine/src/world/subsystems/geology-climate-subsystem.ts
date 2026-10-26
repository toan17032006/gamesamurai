/**
 * @file geology-climate-subsystem.ts
 * @module @aetheria/engine/world/subsystems/geology-climate-subsystem
 * @description Urban Development, Earthquakes, Volcanoes, Glaciers & Celestial Lighting (581–660).
 */

import type { Vec3 } from '../../types/index.js';
import { forceMagnitude } from './vegetation-subsystem.js';

// ---------------------------------------------------------------------------
// Hằng số kỹ thuật — chuẩn suy ra khi vùng không cung cấp dữ liệu
// ---------------------------------------------------------------------------

/** Sức chịu tải mặc định của một con đường (N). */
const DEFAULT_ROAD_CAPACITY = 250000;
/** Số vết nứt tương ứng với việc tiêu thụ hết sức chịu tải của đường. */
const ROAD_FAILURE_CRACKS = 12;
/** Sức chịu lực mặc định của một đập (N). */
const DEFAULT_DAM_STRENGTH = 1000000;
/** Khối lượng riêng của băng (kg/m³). */
const ICE_DENSITY = 917;
/** Khối lượng mặc định của một bông băng trôi (kg) khi không biết diện tích. */
const DEFAULT_ICEBERG_MASS = 100000;
/** Độ dày mặc định của sông băng (m). */
const DEFAULT_GLACIER_THICKNESS = 150;
/** Tốc độ trôi mặc định của sông băng (m/ngày). */
const DEFAULT_GLACIER_FLOW = 0.1;
/** Độ cao mặc định của núi lửa (m). */
const DEFAULT_VOLCANO_HEIGHT = 2000;
/** Áp suất magma mặc định của núi lửa. */
const DEFAULT_VOLCANO_PRESSURE = 50;

export class GeologyClimateSubsystem {
  public settlements: Map<string, any> = new Map();
  public roads: Map<string, any> = new Map();
  public volcanoes: Map<string, any> = new Map();
  public glaciers: Map<string, any> = new Map();
  public icebergs: Map<string, any> = new Map();

  public sunPosition: Vec3 = { x: 0, y: 1000, z: 0 };
  public sunIntensity = 1.0;
  public shadowDirection: Vec3 = { x: 0, y: -1, z: 0 };
  public shadowLength = 1.0;
  public isNight = false;

  // 581–600. Phát triển đô thị và xây dựng môi trường
  public createSettlement(region: any): any {
    const id = `settlement_${Date.now()}`;
    const s = { id, region, plots: [] };
    this.settlements.set(id, s);
    return s;
  }

  public generateBuildingPlot(region: any): any { return { plotId: `plot_${Date.now()}`, size: { x: 20, z: 20 } }; }
  public placeBuildingOnTerrain(building: any, terrain: any): void {}
  public constructFoundation(building: any, terrain: any): void {}
  public constructWallSection(building: any, section: any): void {}
  public installRoofSection(building: any, section: any): void {}
  public installWindow(building: any, window: any): void {}
  public installDoor(building: any, door: any): void {}
  public constructBridge(region: any): any { return { bridgeId: `bridge_${Date.now()}` }; }
  /**
   * Xây đường trong một vùng.
   *
   * Trước đây `region` bị bỏ qua hoàn toàn. Nay thông tin vùng (mặt đường,
   * chiều dài, chiều rộng, sức chịu tải) quyết định đặc tính của con đường.
   */
  public constructRoad(region: any): any {
    const id = `road_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const info = typeof region === 'string' ? { regionId: region } : (region ?? {});
    const surface = typeof info.surface === 'string' ? info.surface.toLowerCase() : null;
    const paved =
      typeof info.isPaved === 'boolean'
        ? info.isPaved
        : typeof info.paved === 'boolean'
          ? info.paved
          : surface
            ? ['asphalt', 'concrete', 'paved', 'gravel'].includes(surface)
            : true;
    const length = Number(info.length ?? info.roadLength ?? 100);
    const width = Number(info.width ?? info.roadWidth ?? 8);
    const capacity = Number(info.loadCapacity ?? info.soilBearingCapacity ?? DEFAULT_ROAD_CAPACITY);
    const r = {
      id,
      region: typeof region === 'string' ? region : (region?.id ?? null),
      isPaved: paved,
      cracks: 0,
      length: Number.isFinite(length) ? length : 100,
      width: Number.isFinite(width) ? width : 8,
      loadCapacity: Number.isFinite(capacity) && capacity > 0 ? capacity : DEFAULT_ROAD_CAPACITY,
      loadAccumulated: 0,
      damageRatio: 0,
      isFailed: false,
    };
    this.roads.set(id, r);
    return r;
  }

  public paveRoadSurface(road: any): void {
    const r = typeof road === 'string' ? this.roads.get(road) : road;
    if (r) r.isPaved = true;
  }

  /**
   * Nứt mặt đường theo tải trọng.
   *
   * Trước đây `load` bị bỏ qua hoàn toàn — mỗi lần gọi chỉ tăng đúng 1 vết
   * nứt bất kể tải nặng hay nhẹ. Nay số vết nứt suy ra từ tỉ lệ sức chịu tải
   * của đường đã bị tiêu thụ.
   */
  public crackRoadSurface(road: any, load: any): void {
    const r = typeof road === 'string' ? this.roads.get(road) : road;
    if (!r) return;
    const magnitude = forceMagnitude(load);
    const capacity = Number(r.loadCapacity ?? DEFAULT_ROAD_CAPACITY);
    const ratio = capacity > 0 ? magnitude / capacity : 0;
    r.cracks += Math.max(1, Math.round(ratio * ROAD_FAILURE_CRACKS));
    r.loadAccumulated = (r.loadAccumulated ?? 0) + magnitude;
    r.damageRatio = Math.min(1, r.loadAccumulated / (capacity > 0 ? capacity : 1));
    if (r.cracks >= ROAD_FAILURE_CRACKS) r.isFailed = true;
  }

  public erodeRoadSurface(road: any, weather: any): void {}
  public generatePothole(road: any, position: Vec3): void {}
  public repairRoadSurface(road: any): void {
    const r = typeof road === 'string' ? this.roads.get(road) : road;
    if (r) {
      r.cracks = 0;
      r.loadAccumulated = 0;
      r.damageRatio = 0;
      r.isFailed = false;
    }
  }

  public constructFence(region: any): any { return { fenceId: `fence_${Date.now()}` }; }
  public breakFenceSection(fence: any, section: any): void {}

  /**
   * Xây đập trong một vùng.
   *
   * Đập cần sức chịu lực và kích thước thật để `breachDam` tính được mức vỡ.
   */
  public constructDam(region: any): any {
    const info = typeof region === 'string' ? { regionId: region } : (region ?? {});
    const width = Number(info.width ?? info.damWidth ?? 100);
    const height = Number(info.height ?? info.damHeight ?? 20);
    const strength = Number(info.strength ?? info.damStrength ?? DEFAULT_DAM_STRENGTH);
    return {
      damId: `dam_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      intact: true,
      region: typeof region === 'string' ? region : (region?.id ?? null),
      width: Number.isFinite(width) ? width : 100,
      height: Number.isFinite(height) ? height : 20,
      strength: Number.isFinite(strength) && strength > 0 ? strength : DEFAULT_DAM_STRENGTH,
    };
  }

  /**
   * Vỡ đập.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn. Nay lực được so với sức chịu lực
   * của đập để tính mức quá tải và chiều rộng vỡ.
   */
  public breachDam(dam: any, force: any): void {
    if (!dam) return;
    const magnitude = forceMagnitude(force);
    const strength = Number(dam.strength ?? DEFAULT_DAM_STRENGTH);
    const ratio = strength > 0 ? magnitude / strength : 0;
    dam.breachForce = magnitude;
    dam.breachRatio = ratio;
    // Vỡ bao nhiêu phần chiều rộng đập tùy mức lực vượt sức chịu.
    const width = Number(dam.width ?? 100);
    dam.breachWidth = Math.max(0, Math.min(width, width * Math.min(1, ratio)));
    dam.intact = false;
  }

  public updateBuiltEnvironment(region: any): void {}

  // 601–620. Động đất, núi lửa và địa chất
  public createEarthquake(region: any): any { return { region, magnitude: 6.5, active: true }; }
  public calculateSeismicWave(earthquake: any): any { return { frequency: 5.0, amplitude: 2.0 }; }
  public propagateSeismicWave(wave: any): void {}
  public shakeTerrain(terrain: any, wave: any): void {}
  public shakeBuilding(building: any, wave: any): void {}
  public triggerGroundRupture(region: any): void {}
  public generateGroundCracks(region: any): any[] { return [{ x: 0, z: 0 }, { x: 10, z: 10 }]; }
  public widenGroundCracks(region: any): void {}
  public triggerLiquefaction(region: any): void {}
  public calculateSeismicDamage(region: any): number { return 80; }

  /**
   * Tạo núi lửa trong một vùng.
   *
   * Trước đây `region` bị bỏ qua hoàn toàn. Nay vùng quyết định độ cao núi
   * lửa và áp suất magma ban đầu.
   */
  public createVolcano(region: any): any {
    const id = `volcano_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const info = typeof region === 'string' ? { regionId: region } : (region ?? {});
    const height = Number(info.height ?? info.elevation ?? DEFAULT_VOLCANO_HEIGHT);
    const pressure = Number(info.pressure ?? info.magmaPressure ?? DEFAULT_VOLCANO_PRESSURE);
    const v = {
      id,
      region: typeof region === 'string' ? region : (region?.id ?? null),
      pressure: Number.isFinite(pressure) ? pressure : DEFAULT_VOLCANO_PRESSURE,
      isErupting: false,
      height: Number.isFinite(height) ? height : DEFAULT_VOLCANO_HEIGHT,
    };
    this.volcanoes.set(id, v);
    return v;
  }

  public accumulateMagmaPressure(volcano: any): void {
    const v = typeof volcano === 'string' ? this.volcanoes.get(volcano) : volcano;
    if (v) v.pressure += 10;
  }

  public simulateMagmaMovement(volcano: any): void {}
  public triggerVolcanicEruption(volcano: any): void {
    const v = typeof volcano === 'string' ? this.volcanoes.get(volcano) : volcano;
    if (v) v.isErupting = true;
  }

  public spawnVolcanicProjectiles(volcano: any): any[] { return [{ id: 'bomb_1' }]; }
  public simulateLavaFlow(volcano: any): any { return { length: 50, temp: 1100 }; }
  public coolLavaFlow(lava: any): void { if (lava) lava.temp -= 50; }
  public solidifyLava(lava: any): void { if (lava) lava.temp = 20; }
  public generateVolcanicAsh(volcano: any): any { return { plumeHeight: 3000 }; }
  public updateGeologicalRecovery(region: any): void {}

  // 621–640. Sông băng, băng trôi và biến đổi khí hậu cục bộ
  /**
   * Tạo sông băng trong một vùng.
   *
   * Trước đây `region` bị bỏ qua hoàn toàn. Nay vùng quyết định độ dày băng
   * và tốc độ trôi; diện tích chỉ ghi khi vùng thật sự cung cấp.
   */
  public createGlacier(region: any): any {
    const id = `glacier_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const info = typeof region === 'string' ? { regionId: region } : (region ?? {});
    const thickness = Number(info.thickness ?? info.iceThickness ?? DEFAULT_GLACIER_THICKNESS);
    const flowRate = Number(info.flowRate ?? info.flowSpeed ?? DEFAULT_GLACIER_FLOW);
    const g: any = {
      id,
      region: typeof region === 'string' ? region : (region?.id ?? null),
      flowRate: Number.isFinite(flowRate) ? flowRate : DEFAULT_GLACIER_FLOW,
      thickness: Number.isFinite(thickness) ? thickness : DEFAULT_GLACIER_THICKNESS,
    };
    const area = Number(info.area);
    if (Number.isFinite(area) && area > 0) g.area = area;
    this.glaciers.set(id, g);
    return g;
  }

  public accumulateGlacierSnow(glacier: any): void {}
  public compactGlacierSnow(glacier: any): void {}
  public simulateGlacierFlow(glacier: any): void {}
  public deformGlacierSurface(glacier: any): void {}
  public generateGlacierCrevasse(glacier: any): any { return { depth: 30 }; }
  public widenGlacierCrevasse(glacier: any): void {}
  public fractureGlacierIce(glacier: any): void {}
  public calveGlacierIceberg(glacier: any): any { return this.createIceberg(glacier); }

  /**
   * Tạo bông băng trôi.
   *
   * Trước đây `region` bị bỏ qua hoàn toàn. Nay khối lượng băng được suy ra
   * từ diện tích × độ dày × khối lượng riêng băng khi vùng có dữ liệu; nếu
   * không biết diện tích thì dùng khối lượng bông băng tiêu chuẩn.
   */
  public createIceberg(region: any): any {
    const id = `iceberg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const info = typeof region === 'string' ? { regionId: region } : (region ?? {});
    const thickness = Number(info.thickness ?? DEFAULT_GLACIER_THICKNESS);
    const area = Number(info.area);
    const hasArea = Number.isFinite(area) && area > 0;
    const volume = hasArea ? area * thickness : 0;
    const b = {
      id,
      region: typeof region === 'string' ? region : (region?.id ?? null),
      mass: hasArea ? volume * ICE_DENSITY : DEFAULT_ICEBERG_MASS,
      thickness: Number.isFinite(thickness) ? thickness : DEFAULT_GLACIER_THICKNESS,
      density: ICE_DENSITY,
      volume,
    };
    this.icebergs.set(id, b);
    return b;
  }

  public driftIceberg(iceberg: any, current: any): void {}
  public rotateIceberg(iceberg: any, torque: any): void {}
  public meltIceberg(iceberg: any, temperature: number): void {
    const b = typeof iceberg === 'string' ? this.icebergs.get(iceberg) : iceberg;
    if (b && temperature > 0) b.mass = Math.max(0, b.mass - 1000);
  }

  public simulateSeaIceFormation(water: any): void {}
  public simulateSeaIceBreakup(ice: any): void {}
  public driftSeaIce(ice: any, current: any): void {}
  public collideIceFloes(iceA: any, iceB: any): void {}
  public freezeGroundWater(ground: any): void {}
  public thawPermafrost(ground: any, temperature: number): void {}
  public updateCryosphereState(region: any): void {}

  // 641–660. Ánh sáng, nhiệt và chu kỳ ngày đêm
  public createSunLight(): any { return { type: 'directional', intensity: this.sunIntensity }; }
  public updateSunPosition(time: number): void {
    const angle = (time / 86400) * Math.PI * 2;
    this.sunPosition = { x: Math.sin(angle) * 1000, y: Math.cos(angle) * 1000, z: 0 };
    this.updateShadowDirection();
  }

  public updateSunIntensity(intensity: number): void { this.sunIntensity = intensity; }
  public calculateSunlightDirection(): Vec3 {
    const len = Math.hypot(this.sunPosition.x, this.sunPosition.y, this.sunPosition.z) || 1;
    return { x: -this.sunPosition.x / len, y: -this.sunPosition.y / len, z: -this.sunPosition.z / len };
  }

  public updateShadowDirection(): void {
    const dir = this.calculateSunlightDirection();
    this.shadowDirection = { x: -dir.x, y: 0, z: -dir.z };
  }

  public updateShadowLength(): void {
    this.shadowLength = Math.max(0.5, 1000 / (Math.abs(this.sunPosition.y) + 1));
  }

  public calculateSurfaceSolarHeating(surface: any): number { return this.sunIntensity * 25.0; }
  public heatObjectSurface(object: any, energy: number): void {}
  public coolObjectSurface(object: any, rate: number): void {}
  public simulateThermalExpansion(object: any, temperature: number): void {}
  public simulateThermalContraction(object: any, temperature: number): void {}
  public fadeSunlightAtDusk(): void { this.sunIntensity = 0.2; }
  public restoreSunlightAtDawn(): void { this.sunIntensity = 0.8; }
  public updateNightLighting(): void { this.isNight = true; }
  public simulateMoonlight(): any { return { intensity: 0.1 }; }
  public updateCloudShadowMovement(cloud: any): void {}
  public updateVegetationLightExposure(plant: any): void {}
  public calculateSurfaceReflectance(surface: any): number { return 0.2; }
  public simulateHeatTransfer(objectA: any, objectB: any): void {}
  public updateEnvironmentalTemperature(region: any): void {}
}
