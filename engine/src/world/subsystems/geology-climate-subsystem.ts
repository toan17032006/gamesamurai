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

/** Hệ số phản xạ (albedo) theo vật liệu bề mặt. */
const SURFACE_ALBEDO: Record<string, number> = Object.freeze({
  snow: 0.85,
  sand: 0.4,
  grass: 0.25,
  soil: 0.2,
  concrete: 0.3,
  stone: 0.2,
  asphalt: 0.1,
  water: 0.05,
  ice: 0.6,
});

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

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

  // -------------------------------------------------------------------------
  // Helper đọc dữ liệu thật — thay cho giá trị đóng cứng
  // -------------------------------------------------------------------------

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

  /** Vị trí thế giới của đối tượng. */
  private positionOf(source: any): Vec3 {
    const p = source?.position ?? source?.origin ?? source?.center;
    if (p && typeof source === 'object' && p && typeof p === 'object') {
      const x = Number(p.x ?? 0);
      const y = Number(p.y ?? 0);
      const z = Number(p.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Kích thước đặc trưng (bán kính / cạnh lớn nhất) của đối tượng. */
  private extentOf(source: any, fallback = 1): number {
    const size = source?.size ?? source?.radius ?? source?.scale;
    if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size;
    if (size && typeof size === 'object') {
      const values = [size.x, size.y, size.z, size.max, size.width, size.height]
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v > 0)
        .sort((a, b) => b - a);
      if (values.length > 0) return values[0];
    }
    return fallback;
  }

  // 581–600. Phát triển đô thị và xây dựng môi trường
  public createSettlement(region: any): any {
    const id = `settlement_${Date.now()}`;
    const s = { id, region, plots: [] };
    this.settlements.set(id, s);
    return s;
  }

  /**
   * Lập mảnh đất để xây trong một vùng.
   *
   * Trước đây luôn trả mảnh 20×20. Nay diện tích mảnh suy ra từ quy hoạch của
   * vùng (diện tích dự kiến / số mảnh) và độ dốc ảnh hưởng tới khả năng xây.
   */
  public generateBuildingPlot(region: any): any {
    const id = `plot_${Date.now()}`;
    const totalArea = this.numOf(region, ['area', 'plotArea', 'surfaceArea'], 400);
    const plotCount = Math.max(1, this.numOf(region, ['plotCount', 'plots'], 1));
    const slope = this.numOf(region, ['slope', 'steepness'], 0);
    const usable = totalArea * (1 - Math.min(0.8, slope) * 0.5) / plotCount;
    const side = Math.max(4, Math.sqrt(usable));
    return {
      plotId: id,
      id,
      size: { x: side, z: side },
      area: usable,
      slope,
      elevation: this.numOf(region, ['elevation', 'height'], 0),
    };
  }

  public placeBuildingOnTerrain(building: any, terrain: any): void { recordSubsystemAction(this, 'placeBuildingOnTerrain', 'GeologyClimateSubsystem'); }
  public constructFoundation(building: any, terrain: any): void { recordSubsystemAction(this, 'constructFoundation', 'GeologyClimateSubsystem'); }
  public constructWallSection(building: any, section: any): void { recordSubsystemAction(this, 'constructWallSection', 'GeologyClimateSubsystem'); }
  public installRoofSection(building: any, section: any): void { recordSubsystemAction(this, 'installRoofSection', 'GeologyClimateSubsystem'); }
  public installWindow(building: any, window: any): void { recordSubsystemAction(this, 'installWindow', 'GeologyClimateSubsystem'); }
  public installDoor(building: any, door: any): void { recordSubsystemAction(this, 'installDoor', 'GeologyClimateSubsystem'); }
  /**
   * Xây cầu qua một vùng.
   *
   * Trước đây chỉ trả `{ bridgeId }`. Nay nhịp cầu, vật liệu và sức chịu tải
   * suy ra từ dữ liệu vùng (chiều rộng vùng, độ dốc, vật liệu địa phương).
   */
  public constructBridge(region: any): any {
    const id = `bridge_${Date.now()}`;
    const span = this.numOf(region, ['span', 'width', 'riverWidth'], 30);
    const material = String(region?.material ?? region?.terrainType ?? 'concrete');
    const slope = this.numOf(region, ['slope', 'steepness'], 0);
    const load = 50000 * (1 + Math.min(1, slope) * 0.5);
    return {
      bridgeId: id,
      id,
      span,
      material,
      loadCapacity: load,
      deckElevation: this.numOf(region, ['elevation', 'height'], 10),
    };
  }

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

  public erodeRoadSurface(road: any, weather: any): void { recordSubsystemAction(this, 'erodeRoadSurface', 'GeologyClimateSubsystem'); }
  public generatePothole(road: any, position: Vec3): void { recordSubsystemAction(this, 'generatePothole', 'GeologyClimateSubsystem'); }
  public repairRoadSurface(road: any): void {
    const r = typeof road === 'string' ? this.roads.get(road) : road;
    if (r) {
      r.cracks = 0;
      r.loadAccumulated = 0;
      r.damageRatio = 0;
      r.isFailed = false;
    }
  }

  /**
   * Dựng hàng rào quanh vùng.
   *
   * Trước đây chỉ trả `{ fenceId }`. Nay chiều dài, chiều cao và vật liệu
   * suy ra từ chu vi vùng và điều kiện địa hình.
   */
  public constructFence(region: any): any {
    const id = `fence_${Date.now()}`;
    const perimeter = this.numOf(region, ['perimeter', 'area'], 100);
    const height = this.numOf(region, ['fenceHeight', 'height'], 1.8);
    const material = String(region?.material ?? region?.terrainType ?? 'wood');
    return {
      fenceId: id,
      id,
      perimeter,
      height,
      material,
      postCount: Math.max(1, Math.round(perimeter / 2.5)),
    };
  }

  public breakFenceSection(fence: any, section: any): void { recordSubsystemAction(this, 'breakFenceSection', 'GeologyClimateSubsystem'); }

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

  public updateBuiltEnvironment(region: any): void { recordSubsystemAction(this, 'updateBuiltEnvironment', 'GeologyClimateSubsystem'); }

  // 601–620. Động đất, núi lửa và địa chất
  public createEarthquake(region: any): any { return { region, magnitude: 6.5, active: true }; }
  /**
   * Sóng địa chấn.
   *
   * Trước đây luôn `{ frequency: 5, amplitude: 2 }`. Nay tần số và biên độ suy
   * ra từ cường độ động đất và khoảng cách tới tâm.
   */
  public calculateSeismicWave(earthquake: any): any {
    const magnitude = this.numOf(earthquake, ['magnitude', 'intensity'], 6.5);
    const distance = this.numOf(earthquake, ['distance', 'depth'], 10);
    const frequency = Math.max(0.1, 5 - distance * 0.2);
    const amplitude = Math.max(0, (magnitude - 3) * 0.6 * (1 / Math.max(1, distance * 0.2)));
    return { frequency, amplitude, magnitude, distance };
  }

  public propagateSeismicWave(wave: any): void { recordSubsystemAction(this, 'propagateSeismicWave', 'GeologyClimateSubsystem'); }
  public shakeTerrain(terrain: any, wave: any): void { recordSubsystemAction(this, 'shakeTerrain', 'GeologyClimateSubsystem'); }
  public shakeBuilding(building: any, wave: any): void { recordSubsystemAction(this, 'shakeBuilding', 'GeologyClimateSubsystem'); }
  public triggerGroundRupture(region: any): void { recordSubsystemAction(this, 'triggerGroundRupture', 'GeologyClimateSubsystem'); }
  /**
   * Vết nứt nền đất do động đất.
   *
   * Trước đây luôn trả hai điểm cố định. Nay số vết nứt và vị trí từng vết
   * suy ra từ cường độ động đất và bán kính vùng ảnh hưởng.
   */
  public generateGroundCracks(region: any): any[] {
    const magnitude = this.numOf(region, ['magnitude', 'intensity'], 6.5);
    const radius = this.numOf(region, ['radius', 'area'], 50);
    const count = Math.max(1, Math.min(24, Math.round((magnitude - 3) * 3)));
    const origin = this.positionOf(region);
    const cracks: any[] = [];
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963229728653;
      const r = radius * Math.sqrt((i + 0.5) / count);
      cracks.push({
        x: origin.x + Math.cos(angle) * r,
        z: origin.z + Math.sin(angle) * r,
        width: Math.max(0.05, (magnitude - 3) * 0.08),
        depth: Math.max(0.1, (magnitude - 3) * 0.4),
      });
    }
    return cracks;
  }

  public widenGroundCracks(region: any): void { recordSubsystemAction(this, 'widenGroundCracks', 'GeologyClimateSubsystem'); }
  public triggerLiquefaction(region: any): void { recordSubsystemAction(this, 'triggerLiquefaction', 'GeologyClimateSubsystem'); }
  /**
   * Mức sát thương của động đất.
   *
   * Trước đây luôn `80`. Nay tính từ cường độ động đất, khoảng cách tới tâm và
   * độ giòn của công trình trong vùng.
   */
  public calculateSeismicDamage(region: any): number {
    const magnitude = this.numOf(region, ['magnitude', 'intensity'], 6.5);
    const distance = this.numOf(region, ['distance', 'depth'], 10);
    const fragility = this.numOf(region, ['fragility', 'vulnerability'], 0.5);
    const attenuation = 1 / (1 + distance * 0.1);
    return Math.max(0, Math.min(100, (magnitude - 3) * 12 * attenuation * (0.5 + fragility)));
  }


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

  public simulateMagmaMovement(volcano: any): void { recordSubsystemAction(this, 'simulateMagmaMovement', 'GeologyClimateSubsystem'); }
  public triggerVolcanicEruption(volcano: any): void {
    const v = typeof volcano === 'string' ? this.volcanoes.get(volcano) : volcano;
    if (v) v.isErupting = true;
  }

  /**
   * Vật thể núi lửa bắn lên.
   *
   * Trước đây luôn trả một quả bom duy nhất. Nay số bom, tốc độ và quỹ đạo
   * suy ra từ cường độ phun trào và áp suất magma.
   */
  public spawnVolcanicProjectiles(volcano: any): any[] {
    const intensity = this.numOf(volcano, ['intensity', 'eruptionIntensity', 'pressure'], 0.5);
    const pressure = this.numOf(volcano, ['pressure'], DEFAULT_VOLCANO_PRESSURE);
    const count = Math.max(1, Math.min(32, Math.round(intensity * 12 + pressure * 0.05)));
    const origin = this.positionOf(volcano);
    const speed = 20 + pressure * 0.8;
    const bombs: any[] = [];
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963229728653;
      bombs.push({
        id: `bomb_${i}`,
        position: { x: origin.x, y: origin.y, z: origin.z },
        velocity: { x: Math.cos(angle) * speed * 0.3, y: speed, z: Math.sin(angle) * speed * 0.3 },
        mass: 0.5 + intensity,
        temperature: 1100,
      });
    }
    return bombs;
  }

  /**
   * Dòng dung nham chảy.
   *
   * Trước đây luôn `{ length: 50, temp: 1100 }`. Nay chiều dài và nhiệt độ suy
   * ra từ thể tích dung nham, độ nhớt và áp suất.
   */
  public simulateLavaFlow(volcano: any): any {
    const volume = this.numOf(volcano, ['lavaVolume', 'volume'], 100);
    const viscosity = this.numOf(volcano, ['viscosity'], 0.5);
    const temperature = this.numOf(volcano, ['temperature', 'magmaTemperature'], 1100);
    const length = volume * (1 - Math.min(0.9, viscosity)) * 0.5;
    return { length, temp: temperature, volume, viscosity };
  }

  public coolLavaFlow(lava: any): void { if (lava) lava.temp -= 50; }
  public solidifyLava(lava: any): void { if (lava) lava.temp = 20; }
  /**
   * Cột tro núi lửa.
   *
   * Trước đây luôn `{ plumeHeight: 3000 }`. Nay chiều cao cột tro suy ra từ
   * cường độ phun trào và tốc độ gió tầng cao.
   */
  public generateVolcanicAsh(volcano: any): any {
    const intensity = this.numOf(volcano, ['intensity', 'eruptionIntensity'], 0.5);
    const altitude = this.numOf(volcano, ['altitude', 'windSpeed', 'height'], 0);
    const plumeHeight = 1000 + intensity * 4000 + altitude * 20;
    return {
      plumeHeight,
      intensity,
      altitude,
      ashMass: intensity * 1000,
    };
  }

  public updateGeologicalRecovery(region: any): void { recordSubsystemAction(this, 'updateGeologicalRecovery', 'GeologyClimateSubsystem'); }

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

  public accumulateGlacierSnow(glacier: any): void { recordSubsystemAction(this, 'accumulateGlacierSnow', 'GeologyClimateSubsystem'); }
  public compactGlacierSnow(glacier: any): void { recordSubsystemAction(this, 'compactGlacierSnow', 'GeologyClimateSubsystem'); }
  public simulateGlacierFlow(glacier: any): void { recordSubsystemAction(this, 'simulateGlacierFlow', 'GeologyClimateSubsystem'); }
  public deformGlacierSurface(glacier: any): void { recordSubsystemAction(this, 'deformGlacierSurface', 'GeologyClimateSubsystem'); }
  /**
   * Vết nứt trên sông băng.
   *
   * Trước đây luôn `{ depth: 30 }`. Nay độ sâu vết nứt suy ra từ ứng suất
   * kéo và tốc độ chảy của sông băng.
   */
  public generateGlacierCrevasse(glacier: any): any {
    const strain = this.numOf(glacier, ['strain', 'stress'], 0.2);
    const flow = this.numOf(glacier, ['flowSpeed', 'flow', 'speed'], DEFAULT_GLACIER_FLOW);
    const thickness = this.numOf(glacier, ['thickness'], DEFAULT_GLACIER_THICKNESS);
    const depth = Math.max(1, strain * thickness * 2 + flow * 20);
    return { depth, strain, flow, thickness };
  }

  public widenGlacierCrevasse(glacier: any): void { recordSubsystemAction(this, 'widenGlacierCrevasse', 'GeologyClimateSubsystem'); }
  public fractureGlacierIce(glacier: any): void { recordSubsystemAction(this, 'fractureGlacierIce', 'GeologyClimateSubsystem'); }
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

  public driftIceberg(iceberg: any, current: any): void { recordSubsystemAction(this, 'driftIceberg', 'GeologyClimateSubsystem'); }
  public rotateIceberg(iceberg: any, torque: any): void { recordSubsystemAction(this, 'rotateIceberg', 'GeologyClimateSubsystem'); }
  public meltIceberg(iceberg: any, temperature: number): void {
    const b = typeof iceberg === 'string' ? this.icebergs.get(iceberg) : iceberg;
    if (b && temperature > 0) b.mass = Math.max(0, b.mass - 1000);
  }

  public simulateSeaIceFormation(water: any): void { recordSubsystemAction(this, 'simulateSeaIceFormation', 'GeologyClimateSubsystem'); }
  public simulateSeaIceBreakup(ice: any): void { recordSubsystemAction(this, 'simulateSeaIceBreakup', 'GeologyClimateSubsystem'); }
  public driftSeaIce(ice: any, current: any): void { recordSubsystemAction(this, 'driftSeaIce', 'GeologyClimateSubsystem'); }
  public collideIceFloes(iceA: any, iceB: any): void { recordSubsystemAction(this, 'collideIceFloes', 'GeologyClimateSubsystem'); }
  public freezeGroundWater(ground: any): void { recordSubsystemAction(this, 'freezeGroundWater', 'GeologyClimateSubsystem'); }
  public thawPermafrost(ground: any, temperature: number): void { recordSubsystemAction(this, 'thawPermafrost', 'GeologyClimateSubsystem'); }
  public updateCryosphereState(region: any): void { recordSubsystemAction(this, 'updateCryosphereState', 'GeologyClimateSubsystem'); }

  // 641–660. Ánh sáng, nhiệt và chu kỳ ngày đêm
  /**
   * Nguồn sáng mặt trời.
   *
   * Trước đây luôn trả cùng một cấu hình định hướng. Nay cường độ và hướng
   * ánh sáng phản ánh vị trí mặt trời (có thể ghi đè bằng `state`).
   */
  public createSunLight(state?: any): any {
    const position = state?.position ?? state?.sunPosition;
    const resolved = position && typeof position === 'object'
      ? {
          x: Number(position.x ?? this.sunPosition.x),
          y: Number(position.y ?? this.sunPosition.y),
          z: Number(position.z ?? this.sunPosition.z),
        }
      : { ...this.sunPosition };
    const intensity = this.numOf(state, ['intensity', 'sunIntensity'], this.sunIntensity);
    const length = Math.hypot(resolved.x, resolved.y, resolved.z) || 1;
    return {
      type: 'directional',
      intensity,
      position: resolved,
      direction: { x: -resolved.x / length, y: -resolved.y / length, z: -resolved.z / length },
    };
  }

  public updateSunPosition(time: number): void {
    const angle = (time / 86400) * Math.PI * 2;
    this.sunPosition = { x: Math.sin(angle) * 1000, y: Math.cos(angle) * 1000, z: 0 };
    this.updateShadowDirection();
  }

  public updateSunIntensity(intensity: number): void { this.sunIntensity = intensity; }
  /**
   * Hướng ánh sáng mặt trời (đơn vị hướng).
   *
   * Trước đây không nhận tham số nên chỉ phản ánh vị trí mặt trời nội bộ.
   * Nay nhận thêm `state` để ghi đè vị trí mặt trời khi cần.
   */
  public calculateSunlightDirection(state?: any): Vec3 {
    const position = state?.position ?? state?.sunPosition;
    const resolved = position && typeof position === 'object'
      ? {
          x: Number(position.x ?? this.sunPosition.x),
          y: Number(position.y ?? this.sunPosition.y),
          z: Number(position.z ?? this.sunPosition.z),
        }
      : { ...this.sunPosition };
    const len = Math.hypot(resolved.x, resolved.y, resolved.z) || 1;
    return { x: -resolved.x / len, y: -resolved.y / len, z: -resolved.z / len };
  }

  public updateShadowDirection(): void {
    const dir = this.calculateSunlightDirection();
    this.shadowDirection = { x: -dir.x, y: 0, z: -dir.z };
  }

  public updateShadowLength(): void {
    this.shadowLength = Math.max(0.5, 1000 / (Math.abs(this.sunPosition.y) + 1));
  }

  /**
   * Nhiệt hấp thụ mặt trời của bề mặt.
   *
   * Trước đây luôn `sunIntensity * 25`. Nay tính thêm từ diện tích bề mặt và
   * hệ số phản xạ (albedo) của vật liệu.
   */
  public calculateSurfaceSolarHeating(surface: any): number {
    const area = this.extentOf(surface, 1) * this.extentOf(surface, 1);
    const albedo = this.numOf(surface, ['albedo', 'reflectance'], 0.2);
    return this.sunIntensity * 25 * area * (1 - Math.min(1, albedo));
  }

  public heatObjectSurface(object: any, energy: number): void { recordSubsystemAction(this, 'heatObjectSurface', 'GeologyClimateSubsystem'); }
  public coolObjectSurface(object: any, rate: number): void { recordSubsystemAction(this, 'coolObjectSurface', 'GeologyClimateSubsystem'); }
  public simulateThermalExpansion(object: any, temperature: number): void { recordSubsystemAction(this, 'simulateThermalExpansion', 'GeologyClimateSubsystem'); }
  public simulateThermalContraction(object: any, temperature: number): void { recordSubsystemAction(this, 'simulateThermalContraction', 'GeologyClimateSubsystem'); }
  public fadeSunlightAtDusk(): void { this.sunIntensity = 0.2; }
  public restoreSunlightAtDawn(): void { this.sunIntensity = 0.8; }
  public updateNightLighting(): void { this.isNight = true; }
  /**
   * Ánh trăng.
   *
   * Trước đây luôn `{ intensity: 0.1 }`. Nay cường độ suy ra từ chu kỳ mặt
   * trăng (0 = trăng mới, 0.5 = trăng tròn) và mức chiếu sáng.
   */
  public simulateMoonlight(phase?: any): any {
    const cycle = this.numOf(phase, ['phase', 'moonPhase'], 0.5);
    const illumination = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, cycle))));
    const intensity = illumination * 0.25;
    return { intensity, phase: cycle, illumination, isNight: this.isNight };
  }

  public updateCloudShadowMovement(cloud: any): void { recordSubsystemAction(this, 'updateCloudShadowMovement', 'GeologyClimateSubsystem'); }
  public updateVegetationLightExposure(plant: any): void { recordSubsystemAction(this, 'updateVegetationLightExposure', 'GeologyClimateSubsystem'); }
  /**
   * Hệ số phản xạ của bề mặt (0..1).
   *
   * Trước đây luôn `0.2`. Nay suy ra từ vật liệu và độ ẩm bề mặt.
   */
  public calculateSurfaceReflectance(surface: any): number {
    const material = String(surface?.material ?? surface?.type ?? 'stone');
    const albedo = SURFACE_ALBEDO[material] ?? 0.2;
    const moisture = this.numOf(surface, ['moisture', 'humidity'], 0);
    // Bề mặt ướt phản xạ thấp hơn bề mặt khô.
    return Math.max(0, Math.min(1, albedo * (1 - Math.min(0.4, moisture * 0.4))));
  }

  public simulateHeatTransfer(objectA: any, objectB: any): void { recordSubsystemAction(this, 'simulateHeatTransfer', 'GeologyClimateSubsystem'); }
  public updateEnvironmentalTemperature(region: any): void { recordSubsystemAction(this, 'updateEnvironmentalTemperature', 'GeologyClimateSubsystem'); }
}
