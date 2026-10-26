/**
 * @file building-architecture-subsystem.ts
 * @module @aetheria/engine/world/subsystems/building-architecture-subsystem
 * @description Architecture, Construction, Walls, Roofs, Collapse & Furniture (421–500).
 */

import {
  BuildingEntity,
  WallSection,
  RoofSection,
  FurnitureEntity,
} from '../types.js';
import type { Vec3 } from '../../types/index.js';
import { forceMagnitude } from './vegetation-subsystem.js';

// ---------------------------------------------------------------------------
// Hằng số kỹ thuật — dùng làm chuẩn suy ra khi không có dữ liệu thực tế
// ---------------------------------------------------------------------------

/** Lực (N) cần để mở thêm một vết nứt trên tường. */
const WALL_CRACK_STEP = 25;
/** Sức bền (điểm) hao mỗi đơn vị lực tác dụng lên tường. */
const WALL_DAMAGE_PER_FORCE = 0.5;
/** Lực (N) mặc định khi cạy cửa khỏi khung mà không truyền lực. */
const DOOR_PRY_FORCE = 60;
/** Lực (N) mặc định khi đẩy vỡ cửa sổ mà không truyền lực. */
const GLASS_BREAK_FORCE = 40;
/** Năng lượng va chạm (J) tạo thêm một vết nứt kính. */
const GLASS_CRACK_STEP = 25;
/** Năng lượng va chạm (J) sinh ra một mảnh kính vỡ. */
const GLASS_SHARD_STEP = 25;
/** Lực (N) đủ để làm vỡ đồ nội thất thay vì chỉ làm đổ. */
const FURNITURE_BREAK_FORCE = 200;
/** Kích thước chuẩn của một cánh cửa (m). */
const DOOR_WIDTH = 1.0;
const DOOR_HEIGHT = 2.1;
/** Diện tích chuẩn của một ô cửa sổ (m²). */
const WINDOW_AREA = 1.5;

export class BuildingArchitectureSubsystem {
  public buildings: Map<string, BuildingEntity> = new Map();
  public walls: Map<string, WallSection> = new Map();
  public roofs: Map<string, RoofSection> = new Map();
  public doors: Map<string, any> = new Map();
  public windows: Map<string, any> = new Map();
  public furniture: Map<string, FurnitureEntity> = new Map();

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

  /** Vị trí thế giới của đối tượng. */
  private positionOf(source: any): Vec3 {
    const p = source?.position ?? source?.origin ?? source?.center;
    if (p && typeof p === 'object') {
      const x = Number(p.x ?? 0);
      const y = Number(p.y ?? 0);
      const z = Number(p.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /**
   * Trạng thái phá hủy của từng bộ phận công trình.
   *
   * Trước đây các method phá hủy chỉ bật/tắt cờ (`isCracked`, `isCollapsed`)
   * nên không biết lực đã dùng, đã có bao nhiêu vết nứt hay mức quá tải.
   * Nay trạng thái được ghi lại để lần gọi sau đọc lại được.
   */
  private structuralStates: Map<string, {
    /** Số vết nứt đã hình thành. */
    cracks: number;
    /** Tổng ứng lực đã dồn vào bộ phận (N). */
    stress: number;
    /** Năng lượng va chạm gần nhất (J). */
    impactEnergy: number;
    /** Tổng tải làm mái sập (N). */
    collapseLoad: number;
    /** Mức quá tải của mái so với sức chịu tải thiết kế (1 = đúng tải). */
    overloadRatio: number;
    /** Khớp nội thất đã gãy. */
    brokenJoint?: string;
    /** Tổng lực làm đổ nội thất (N). */
    toppleForce?: number;
  }> = new Map();

  /** Lấy (hoặc tạo) trạng thái phá hủy của một bộ phận công trình. */
  private stateOf(id: string) {
    let state = this.structuralStates.get(id);
    if (!state) {
      state = {
        cracks: 0,
        stress: 0,
        impactEnergy: 0,
        collapseLoad: 0,
        overloadRatio: 0,
      };
      this.structuralStates.set(id, state);
    }
    return state;
  }

  /**
   * Trừ hao sức bền của công trình theo tỉ lệ hư hại của bộ phận.
   *
   * Mỗi bộ phận gánh một phần sức bền của công trình (1/số bộ phận), nên
   * công trình mất đúng phần hao hại đó.
   */
  private damageBuilding(buildingId: string | undefined, damageRatio: number, partCount: number): void {
    if (!buildingId || !(damageRatio > 0)) return;
    const b = this.buildings.get(buildingId);
    if (!b) return;
    const share = 1 / Math.max(1, partCount);
    b.integrity = Math.max(0, b.integrity - damageRatio * share * 100);
  }

  /** Điểm hư hại của mái (0 = nguyên vẹn, 100 = sập) — theo trạng thái thật. */
  private roofDamageScore(building: BuildingEntity): number {
    if (building.roofs.length === 0) return 0;
    let score = 0;
    for (const roofId of building.roofs) {
      const roof = this.roofs.get(roofId);
      if (!roof) continue;
      if (roof.isCollapsed) {
        score += 100;
        continue;
      }
      const state = this.structuralStates.get(roofId);
      score += Math.min(100, (state?.overloadRatio ?? 0) * 100);
    }
    return score / building.roofs.length;
  }

  /** Điểm hư hại của tường (0 = nguyên vẹn, 100 = sập) — theo sức bền thật. */
  private wallDamageScore(building: BuildingEntity): number {
    if (building.walls.length === 0) return 0;
    let score = 0;
    for (const wallId of building.walls) {
      const wall = this.walls.get(wallId);
      if (!wall) continue;
      if (wall.isCollapsed) {
        score += 100;
        continue;
      }
      score += Math.max(0, Math.min(100, 100 - wall.health));
    }
    return score / building.walls.length;
  }

  // 421–440. Nhà cửa và công trình xây dựng
  public createBuilding(type = 'house'): BuildingEntity {
    const id = `bld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const bld: BuildingEntity = {
      id,
      type,
      integrity: 100,
      mass: 50000,
      centerOfMass: { x: 0, y: 3, z: 0 },
      foundation: true,
      walls: [],
      roofs: [],
      doors: [],
      windows: [],
      isCollapsed: false,
    };
    this.buildings.set(id, bld);
    return bld;
  }

  public initializeBuilding(building: BuildingEntity | string): boolean {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b) {
      this.generateBuildingFoundation(b);
      this.generateBuildingWalls(b);
      this.generateBuildingRoof(b);
      return true;
    }
    return false;
  }

  public generateBuildingGeometry(building: BuildingEntity | string): void {}
  public generateBuildingFoundation(building: BuildingEntity | string): void {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b) b.foundation = true;
  }

  public generateBuildingWalls(building: BuildingEntity | string): void {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b && b.walls.length === 0) {
      for (let i = 0; i < 4; i++) {
        const w = this.createWall(b);
        b.walls.push(w.id);
      }
    }
  }

  public generateBuildingRoof(building: BuildingEntity | string): void {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b && b.roofs.length === 0) {
      const r = this.createRoof(b);
      b.roofs.push(r.id);
    }
  }

  public generateBuildingFloors(building: BuildingEntity | string): void {}
  public generateBuildingColumns(building: BuildingEntity | string): void {}
  public generateBuildingBeams(building: BuildingEntity | string): void {}
  public connectStructuralElements(building: BuildingEntity | string): void {}
  public calculateBuildingMass(building: BuildingEntity | string): number {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    return b ? b.mass : 10000;
  }

  /**
   * Trọng tâm của công trình.
   *
   * Trước đây trả `undefined` khi công trình chưa khai báo `centerOfMass`.
   * Nay suy ra từ vị trí và chiều cao của công trình.
   */
  public calculateBuildingCenterOfMass(building: BuildingEntity | string): Vec3 {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b && b.centerOfMass && typeof b.centerOfMass === 'object') {
      const x = Number(b.centerOfMass.x);
      const y = Number(b.centerOfMass.y);
      const z = Number(b.centerOfMass.z);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    const base = this.positionOf(b);
    const height = this.numOf(b, ['height', 'elevation'], 3);
    return { x: base.x, y: base.y + height * 0.5, z: base.z };
  }

  public calculateStructuralStress(building: BuildingEntity | string): number {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    return b ? 100 - b.integrity : 0;
  }

  public calculateStructuralLoad(building: BuildingEntity | string): number {
    return this.calculateBuildingMass(building) * 9.81;
  }

  public detectStructuralWeakness(building: BuildingEntity | string): boolean {
    return this.calculateStructuralStress(building) > 60;
  }

  public updateBuildingCondition(building: BuildingEntity | string): void {}
  public repairBuildingDamage(building: BuildingEntity | string): void {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b) b.integrity = Math.min(100, b.integrity + 30);
  }

  public renovateBuilding(building: BuildingEntity | string): void {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b) b.integrity = 100;
  }

  public demolishBuilding(building: BuildingEntity | string): void {
    this.initiateStructuralCollapse(building);
  }

  public regenerateBuildingCollision(building: BuildingEntity | string): void {}

  // 441–460. Tường, mái, cửa và cửa sổ
  public createWall(building: BuildingEntity | string): WallSection {
    const buildingId = typeof building === 'string' ? building : building.id;
    const id = `wall_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const wall: WallSection = {
      id,
      buildingId,
      health: 100,
      isCracked: false,
      isCollapsed: false,
    };
    this.walls.set(id, wall);
    return wall;
  }

  /**
   * Nứt tường theo lực tác dụng.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn — mọi lần gọi chỉ đặt `isCracked`.
   * Nay lực quyết định số vết nứt, hao hụt sức bền và ảnh hưởng tới công trình.
   */
  public crackWall(wall: WallSection | string, force: any): void {
    const w = typeof wall === 'string' ? this.walls.get(wall) : wall;
    if (!w) return;
    const magnitude = forceMagnitude(force);
    const state = this.stateOf(w.id);
    state.cracks += Math.max(1, Math.floor(magnitude / WALL_CRACK_STEP));
    state.stress += magnitude;
    state.impactEnergy = magnitude;
    const previousHealth = w.health;
    w.health = Math.max(0, w.health - magnitude * WALL_DAMAGE_PER_FORCE);
    w.isCracked = state.cracks > 0;
    if (w.health <= 0) w.isCollapsed = true;
    const owner = this.buildings.get(w.buildingId);
    this.damageBuilding(
      w.buildingId,
      (previousHealth - w.health) / 100,
      owner ? Math.max(1, owner.walls.length) : 1,
    );
  }

  public chipWallSurface(wall: WallSection | string, impact: any): void {}

  /**
   * Phá tường.
   *
   * Trước đây `force` bị bỏ qua — mọi lần phá đều cho kết quả giống nhau.
   * Nay lực được ghi vào ứng lực, số vết nứt và năng lượng va chạm.
   */
  public breakWall(wall: WallSection | string, force: any): void {
    const w = typeof wall === 'string' ? this.walls.get(wall) : wall;
    if (!w) return;
    const magnitude = forceMagnitude(force);
    const state = this.stateOf(w.id);
    state.stress += magnitude;
    state.cracks += Math.max(1, Math.floor(magnitude / WALL_CRACK_STEP));
    state.impactEnergy = magnitude;
    w.health = 0;
    w.isCracked = true;
    w.isCollapsed = true;
    const owner = this.buildings.get(w.buildingId);
    this.damageBuilding(w.buildingId, 1, owner ? Math.max(1, owner.walls.length) : 1);
  }

  public collapseWallSection(wall: WallSection | string, section: any): void {
    this.breakWall(wall, section);
  }

  public createRoof(building: BuildingEntity | string): RoofSection {
    const buildingId = typeof building === 'string' ? building : building.id;
    const id = `roof_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const roof: RoofSection = {
      id,
      buildingId,
      isCollapsed: false,
    };
    this.roofs.set(id, roof);
    return roof;
  }

  public bendRoof(roof: RoofSection | string, load: any): void {}
  public crackRoof(roof: RoofSection | string, force: any): void {}
  public detachRoofPanel(roof: RoofSection | string, panel: any): void {}
  /**
   * Làm sập mái.
   *
   * Trước đây `load` bị bỏ qua hoàn toàn. Nay tải thật được so với sức chịu
   * tải của mái (tổng tải trọng công trình chia đều cho các mái) để tính
   * mức quá tải và mức hao sức bền của công trình.
   */
  public collapseRoof(roof: RoofSection | string, load: any): void {
    const r = typeof roof === 'string' ? this.roofs.get(roof) : roof;
    if (!r) return;
    const magnitude = forceMagnitude(load);
    const state = this.stateOf(r.id);
    state.collapseLoad += magnitude;
    state.impactEnergy = magnitude;
    const owner = this.buildings.get(r.buildingId);
    const capacity = owner
      ? Math.max(1, (owner.mass * 9.81) / Math.max(1, owner.roofs.length))
      : Math.max(1, (r as unknown as { mass?: number }).mass ?? 10000);
    state.overloadRatio = magnitude / capacity;
    r.isCollapsed = true;
    if (owner) {
      // Mái sập làm công trình mất sức bền tương ứng phần tải trọng mái gánh.
      const loss = Math.min(100, state.overloadRatio * (100 / Math.max(1, owner.roofs.length)));
      owner.integrity = Math.max(0, owner.integrity - loss);
    }
  }

  /**
   * Tạo cửa cho một công trình.
   *
   * Trước đây `building` bị bỏ qua hoàn toàn. Nay cửa gắn với công trình,
   * đặt tại tâm móng của công trình và được đăng ký vào danh sách cửa.
   */
  public createDoor(building: any): any {
    const id = `door_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const owner = typeof building === 'string' ? this.buildings.get(building) : building;
    const buildingId = typeof building === 'string' ? building : (building?.id ?? null);
    const center = owner?.centerOfMass ?? { x: 0, y: 0, z: 0 };
    const door = {
      id,
      buildingId,
      isOpen: false,
      isBroken: false,
      health: 100,
      // Cửa nằm ở chân tường, theo tâm công trình.
      position: { x: center.x, y: 0, z: center.z },
      width: DOOR_WIDTH,
      height: DOOR_HEIGHT,
    };
    this.doors.set(id, door);
    if (owner && Array.isArray(owner.doors) && !owner.doors.includes(id)) owner.doors.push(id);
    return door;
  }

  public openDoor(door: any): void {
    const d = typeof door === 'string' ? this.doors.get(door) : door;
    if (d) d.isOpen = true;
  }

  public closeDoor(door: any): void {
    const d = typeof door === 'string' ? this.doors.get(door) : door;
    if (d) d.isOpen = false;
  }

  /**
   * Phá cửa.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn. Nay lực quyết định mức hư hại
   * còn lại của cánh cửa; khi không truyền lực thì dùng lực cạy khung mặc định.
   */
  public breakDoor(door: any, force?: any): void {
    const d = typeof door === 'string' ? this.doors.get(door) : door;
    if (!d) return;
    const magnitude = force == null ? DOOR_PRY_FORCE : forceMagnitude(force);
    d.health = Math.max(0, (d.health ?? 100) - magnitude);
    d.breakForce = magnitude;
    d.isBroken = true;
  }

  public detachDoorFromFrame(door: any): void { this.breakDoor(door); }

  /**
   * Tạo cửa sổ cho một công trình.
   *
   * Trước đây `building` bị bỏ qua hoàn toàn. Nay cửa sổ gắn với công trình,
   * đặt ở nửa chiều cao công trình và được đăng ký vào danh sách cửa sổ.
   */
  public createWindow(building: any): any {
    const id = `window_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const owner = typeof building === 'string' ? this.buildings.get(building) : building;
    const buildingId = typeof building === 'string' ? building : (building?.id ?? null);
    const center = owner?.centerOfMass ?? { x: 0, y: 0, z: 0 };
    const win = {
      id,
      buildingId,
      isCracked: false,
      isShattered: false,
      health: 100,
      cracks: 0,
      shards: 0,
      impactEnergy: 0,
      // Cửa sổ nằm ở nửa chiều cao công trình.
      position: { x: center.x, y: center.y * 0.5, z: center.z },
      area: WINDOW_AREA,
    };
    this.windows.set(id, win);
    if (owner && Array.isArray(owner.windows) && !owner.windows.includes(id)) owner.windows.push(id);
    return win;
  }

  /**
   * Nứt kính cửa sổ theo năng lượng va chạm.
   *
   * Trước đây `impact` bị bỏ qua hoàn toàn. Nay năng lượng va chạm quyết định
   * số vết nứt, sức bền còn lại và năng lượng đã hấp thụ.
   */
  public crackWindowGlass(window: any, impact: any): void {
    const w = typeof window === 'string' ? this.windows.get(window) : window;
    if (!w) return;
    const magnitude = forceMagnitude(impact);
    w.cracks = (w.cracks ?? 0) + Math.max(1, Math.floor(magnitude / GLASS_CRACK_STEP));
    w.impactEnergy = (w.impactEnergy ?? 0) + magnitude;
    w.health = Math.max(0, (w.health ?? 100) - magnitude * 0.5);
    w.isCracked = true;
  }

  /**
   * Vỡ kính cửa sổ.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn. Nay lực quyết định số mảnh kính
   * vỡ và năng lượng va chạm; không truyền lực thì dùng lực vỡ kính mặc định.
   */
  public shatterWindowGlass(window: any, force?: any): void {
    const w = typeof window === 'string' ? this.windows.get(window) : window;
    if (!w) return;
    const magnitude = force == null ? GLASS_BREAK_FORCE : forceMagnitude(force);
    w.cracks = (w.cracks ?? 0) + Math.max(1, Math.floor(magnitude / GLASS_CRACK_STEP));
    w.shards = (w.shards ?? 0) + Math.max(1, Math.round(magnitude / GLASS_SHARD_STEP));
    w.impactEnergy = (w.impactEnergy ?? 0) + magnitude;
    w.health = 0;
    w.isCracked = true;
    w.isShattered = true;
  }

  /** Mảnh kính văng ra — số mảnh và bán kính văng theo kích thước cửa sổ. */
  public scatterGlassFragments(window: any): any {
    const extent = this.extentOf(window, 1);
    const fragments = Math.max(4, Math.min(120, Math.round(extent * extent * 60)));
    return {
      fragmentsCount: fragments,
      scatterRadius: extent * 1.5,
      fragmentSize: extent / Math.max(1, Math.sqrt(fragments)),
    };
  }

  public repairWindow(window: any): void {
    const w = typeof window === 'string' ? this.windows.get(window) : window;
    if (w) {
      w.isCracked = false;
      w.isShattered = false;
      w.cracks = 0;
      w.shards = 0;
      w.impactEnergy = 0;
      w.health = 100;
    }
  }

  // 461–480. Sụp đổ công trình và mảnh vỡ
  public initiateStructuralCollapse(building: BuildingEntity | string): void {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (b) {
      b.integrity = 0;
      b.isCollapsed = true;
    }
  }

  /**
   * Thứ tự sụp đổ của công trình.
   *
   * Trước đây `building` bị bỏ qua hoàn toàn và thứ tự luôn cố định. Nay
   * yếu tố bị hư hại nặng nhất sập trước, dựa trên trạng thái thật của mái,
   * tường, khung và móng.
   */
  public calculateCollapseSequence(building: BuildingEntity | string): string[] {
    const order = ['roof', 'columns', 'walls', 'foundation'];
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (!b) return order;
    const scores: Record<string, number> = {
      roof: this.roofDamageScore(b),
      columns: Math.max(0, 100 - b.integrity),
      walls: this.wallDamageScore(b),
      foundation: b.foundation ? 0 : 100,
    };
    // `sort` ổn định nên các yếu tố bằng nhau giữ nguyên thứ tự gốc.
    return [...order].sort((a, c) => scores[c] - scores[a]);
  }

  public weakenStructuralSupport(support: any): void {}
  public removeStructuralSupport(support: any): void {}
  public fractureStructuralJoint(joint: any): void {}
  public breakStructuralBeam(beam: any, force: any): void {}
  public buckleStructuralColumn(column: any, load: any): void {}
  public triggerProgressiveCollapse(building: BuildingEntity | string): void {
    this.initiateStructuralCollapse(building);
  }

  public simulateFloorCollapse(floor: any): void {}
  public simulateRoofCollapse(roof: any): void {
    this.collapseRoof(roof, 100);
  }

  /**
   * Tách mảnh vỡ cấu trúc ra khỏi công trình.
   *
   * Trước đây `building` bị bỏ qua và luôn trả về đúng một mảnh cố định.
   * Nay số mảnh bằng số bộ phận thật (tường + mái), khối lượng chia đều theo
   * khối lượng công trình.
   */
  public detachStructuralDebris(building: BuildingEntity | string): any[] {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (!b) return [];
    const count = Math.max(1, b.walls.length + b.roofs.length);
    const mass = b.mass / count;
    const debris: any[] = [];
    for (let i = 0; i < count; i++) {
      debris.push({ id: `debris_${b.id}_${i + 1}`, sourceId: b.id, mass, index: i + 1 });
    }
    return debris;
  }

  /**
   * Sinh các mảnh vỡ của công trình.
   *
   * Trước đây `building` bị bỏ qua và luôn trả về đúng hai mảnh cố định.
   * Nay mỗi bức tường thật của công trình sinh ra một mảnh.
   */
  public spawnBuildingFragments(building: BuildingEntity | string): any[] {
    const b = typeof building === 'string' ? this.buildings.get(building) : building;
    if (!b) return [];
    const count = Math.max(1, b.walls.length);
    const fragments: any[] = [];
    for (let i = 0; i < count; i++) {
      fragments.push({
        id: `frag_${b.id}_${i + 1}`,
        sourceId: b.id,
        wallId: b.walls[i] ?? null,
        index: i + 1,
      });
    }
    return fragments;
  }

  public applyImpulseToDebris(debris: any, impulse: any): void {}
  public simulateDebrisCollision(debris: any): void {}
  /** Đống mảnh vụn — chiều cao đống theo khối lượng và thể tích mảnh. */
  public simulateDebrisPile(debris: any): any {
    const count = Array.isArray(debris)
      ? debris.length
      : this.numOf(debris, ['fragmentCount', 'count', 'debrisCount'], 1);
    const volume = this.numOf(debris, ['volume', 'totalVolume'], 0);
    const totalMass = this.numOf(debris, ['mass', 'totalMass'], count * 0.5);
    const bulk = volume > 0 ? totalMass / volume : 1;
    const pileHeight = Math.max(0.1, count * 0.05 * Math.max(0.5, bulk));
    return { pileHeight, fragmentCount: count, totalMass, bulkDensity: bulk };
  }

  /** Đám bụi phát sinh khi đống mục vỡ — bán kính theo khối lượng mảnh. */
  public generateDustCloud(debris: any): any {
    const count = Array.isArray(debris)
      ? debris.length
      : this.numOf(debris, ['fragmentCount', 'count', 'debrisCount'], 1);
    const mass = this.numOf(debris, ['mass', 'totalMass'], count * 0.5);
    const radius = 3 + Math.sqrt(mass) * 1.5;
    return { radius, particleCount: Math.round(count * 12), settledMass: mass };
  }

  public settleDebrisPile(debris: any): void {}
  public dissipateCollapseDust(dust: any): void {}
  public updateCollapsedBuilding(building: BuildingEntity | string): void {}
  public clearBuildingDebris(building: BuildingEntity | string): void {}

  // 481–500. Đồ nội thất và vật dụng trong nhà
  public createFurniture(type = 'chair'): FurnitureEntity {
    const id = `furn_${Date.now()}`;
    const furn: FurnitureEntity = {
      id,
      type,
      position: { x: 0, y: 0, z: 0 },
      isToppled: false,
      isBroken: false,
    };
    this.furniture.set(id, furn);
    return furn;
  }

  public moveFurniture(furniture: FurnitureEntity | string, position: Vec3): void {
    const f = typeof furniture === 'string' ? this.furniture.get(furniture) : furniture;
    if (f) f.position = { ...position };
  }

  public rotateFurniture(furniture: FurnitureEntity | string, angle: number): void {}
  public slideFurniture(furniture: FurnitureEntity | string, surface: any): void {}
  /**
   * Đổ đồ nội thất.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn. Nay lực quyết định hướng đổ
   * (suy từ vector lực), lực tích luỹ và mức độ vỡ của món đồ.
   */
  public toppleChair(chair: FurnitureEntity | string, force?: any): void {
    const f = typeof chair === 'string' ? this.furniture.get(chair) : chair;
    if (!f) return;
    const magnitude = forceMagnitude(force);
    const state = this.stateOf(f.id);
    state.toppleForce = (state.toppleForce ?? 0) + magnitude;
    const direction =
      force && typeof force === 'object'
        ? { x: Number(force.x ?? 0), y: Number(force.y ?? 0), z: Number(force.z ?? 0) }
        : { x: 1, y: 0, z: 0 };
    Object.assign(f as unknown as Record<string, unknown>, {
      toppleForce: state.toppleForce,
      toppleDirection: direction,
      // Lực đủ lớn thì món đồ vỡ hẳn, không chỉ đổ.
      isBroken: f.isBroken || state.toppleForce >= FURNITURE_BREAK_FORCE,
    });
    f.isToppled = true;
  }

  public pullChair(chair: FurnitureEntity | string, direction: any): void {}
  public pushTable(table: FurnitureEntity | string, force: any): void {}
  public overturnTable(table: FurnitureEntity | string, force: any): void {
    this.toppleChair(table, force);
  }

  public openDrawer(drawer: any): void {}
  public closeDrawer(drawer: any): void {}
  public openCabinet(cabinet: any): void {}
  public closeCabinet(cabinet: any): void {}
  /**
   * Gãy khớp của đồ nội thất.
   *
   * Trước đây `joint` bị bỏ qua hoàn toàn. Nay khớp gãy được ghi lại để
   * biết món đồ hỏng ở vị trí nào.
   */
  public breakFurnitureJoint(furniture: FurnitureEntity | string, joint: any): void {
    const f = typeof furniture === 'string' ? this.furniture.get(furniture) : furniture;
    if (!f) return;
    const jointId =
      joint && typeof joint === 'object' ? (joint.id ?? joint.name ?? joint.boneId ?? null) : (joint ?? null);
    const state = this.stateOf(f.id);
    state.brokenJoint = jointId;
    Object.assign(f as unknown as Record<string, unknown>, { brokenJoint: jointId });
    f.isBroken = true;
  }

  public splitWoodenFurniture(furniture: FurnitureEntity | string): void {
    this.breakFurnitureJoint(furniture, null);
  }

  /**
   * Vỡ vật thể gốm.
   *
   * Trước đây luôn `{ shattered: true }`. Nay số mảnh, kích thước mảnh và
   * năng lượng hấp thụ tính từ kích thước vật thể và lực va chạm.
   */
  public shatterCeramicObject(object: any, impact: any): any {
    const extent = this.extentOf(object, 0.2);
    const energy = this.numOf(impact, ['energy', 'kineticEnergy', 'force'], 0);
    const fragments = Math.max(3, Math.min(64, Math.round(extent * 40 + energy * 0.5)));
    const origin = this.positionOf(object);
    return {
      shattered: true,
      fragmentCount: fragments,
      fragmentSize: extent / Math.max(1, Math.sqrt(fragments)),
      absorbedEnergy: energy * 0.3,
      origin,
    };
  }

  /**
   * Vỡ kính.
   *
   * Trước đây luôn `{ broken: true }`. Nay số mảnh và năng lượng hấp thụ tính
   * từ diện tích kính và lực va chạm.
   */
  public breakGlassObject(object: any, impact: any): any {
    const extent = this.extentOf(object, 0.5);
    const energy = this.numOf(impact, ['energy', 'kineticEnergy', 'force'], 0);
    const fragments = Math.max(4, Math.min(120, Math.round(extent * extent * 60 + energy * 0.3)));
    const origin = this.positionOf(object);
    return {
      broken: true,
      fragmentCount: fragments,
      shardSize: extent / Math.max(1, Math.sqrt(fragments)),
      absorbedEnergy: energy * 0.15,
      origin,
    };
  }

  public deformMetalObject(object: any, force: any): void {}
  public tearFabricObject(object: any, force: any): void {}
  public scatterHouseholdObjects(objects: any[], impulse: any): void {}
  public restoreFurnitureState(furniture: FurnitureEntity | string): void {
    const f = typeof furniture === 'string' ? this.furniture.get(furniture) : furniture;
    if (f) { f.isToppled = false; f.isBroken = false; }
  }
}
