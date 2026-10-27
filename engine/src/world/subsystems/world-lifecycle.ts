/**
 * @file world-lifecycle.ts
 * @module @aetheria/engine/world/subsystems/world-lifecycle
 * @description World Lifecycle, State, Configuration & Object Management (001–040).
 */

import { WorldConfig, WorldState, WorldBounds, WorldObject } from '../types.js';
import type { Vec3 } from '../../types/index.js';

export class WorldLifecycleSubsystem {
  public id: string;
  public time = 0;
  public isInitialized = false;
  public isPaused = false;
  public simulationSpeed = 1.0;
  public bounds: WorldBounds = { min: { x: -1000, y: -200, z: -1000 }, max: { x: 1000, y: 1000, z: 1000 } };
  public loadedRegions: Set<string> = new Set(['default_region']);
  public objects: Map<string, WorldObject> = new Map();
  public currentSeason: WorldState['currentSeason'] = 'spring';
  public config: WorldConfig;

  /** Số bước cập nhật thời gian cố định đã chạy. */
  public fixedStepCount = 0;
  /** Bước thời gian cố định của lần chạy gần nhất (giây). */
  public lastFixedDeltaTime = 0;
  /** Vùng đang chứa từng vật thể trong thế giới. */
  public objectRegions: Map<string, string> = new Map();

  constructor(config?: Partial<WorldConfig>) {
    this.id = config?.id ?? `world_${Date.now()}`;
    this.config = {
      id: this.id,
      name: config?.name ?? 'Aetheria Prime',
      bounds: config?.bounds ?? { ...this.bounds },
      timeScale: config?.timeScale ?? 1.0,
      initialTime: config?.initialTime ?? 0,
      gravity: config?.gravity ?? { x: 0, y: -9.81, z: 0 },
      seed: config?.seed ?? 1337,
    };
  }

  // 001–020. Khởi tạo và quản lý thế giới
  public createWorld(): WorldLifecycleSubsystem {
    this.isInitialized = true;
    this.time = this.config.initialTime ?? 0;
    return this;
  }

  public initializeWorld(): boolean {
    this.isInitialized = true;
    this.isPaused = false;
    this.simulationSpeed = 1.0;
    return true;
  }

  public destroyWorld(): void {
    this.objects.clear();
    this.loadedRegions.clear();
    this.isInitialized = false;
  }

  public resetWorld(): void {
    this.time = 0;
    this.objects.clear();
    this.loadedRegions.clear();
    this.loadedRegions.add('default_region');
    this.isPaused = false;
    this.simulationSpeed = 1.0;
  }

  public updateWorld(deltaTime: number): void {
    if (this.isPaused) return;
    this.advanceWorldTime(deltaTime * this.simulationSpeed);
  }

  /**
   * Bước cập nhật thế giới với bước thời gian cố định.
   *
   * Trước đây `fixedDeltaTime` bị bỏ qua hoàn toàn — mỗi bước cố định thế
   * giới đứng yên. Nay thời gian thế giới tiến theo bước cố định (nhân với
   * tốc độ mô phỏng) và số bước đã chạy được ghi lại.
   */
  public fixedUpdateWorld(fixedDeltaTime: number): void {
    if (this.isPaused) return;
    const step = Number.isFinite(fixedDeltaTime) ? fixedDeltaTime : 0;
    this.fixedStepCount += 1;
    this.lastFixedDeltaTime = step;
    this.advanceWorldTime(step * this.simulationSpeed);
  }

  public setWorldConfig(config: Partial<WorldConfig>): void {
    Object.assign(this.config, config);
    if (config.bounds) this.bounds = { ...config.bounds };
  }

  public getWorldState(): WorldState {
    return {
      id: this.id,
      time: this.time,
      isPaused: this.isPaused,
      simulationSpeed: this.simulationSpeed,
      bounds: { ...this.bounds },
      loadedRegions: Array.from(this.loadedRegions),
      activeObjectsCount: this.objects.size,
      currentSeason: this.currentSeason,
    };
  }

  public saveWorldState(): string {
    return JSON.stringify(this.getWorldState());
  }

  public restoreWorldState(state: string | Partial<WorldState>): boolean {
    try {
      const parsed: Partial<WorldState> = typeof state === 'string' ? JSON.parse(state) : state;
      if (parsed.time !== undefined) this.time = parsed.time;
      if (parsed.isPaused !== undefined) this.isPaused = parsed.isPaused;
      if (parsed.simulationSpeed !== undefined) this.simulationSpeed = parsed.simulationSpeed;
      if (parsed.bounds) this.bounds = { ...parsed.bounds };
      if (parsed.currentSeason) this.currentSeason = parsed.currentSeason;
      if (parsed.loadedRegions) this.loadedRegions = new Set(parsed.loadedRegions);
      return true;
    } catch {
      return false;
    }
  }

  public pauseWorldSimulation(): void {
    this.isPaused = true;
  }

  public resumeWorldSimulation(): void {
    this.isPaused = false;
  }

  public setWorldSimulationSpeed(speed: number): void {
    this.simulationSpeed = Math.max(0, speed);
  }

  public setWorldTime(time: number): void {
    this.time = time;
  }

  public advanceWorldTime(deltaTime: number): void {
    this.time += deltaTime;
  }

  public setWorldBounds(bounds: WorldBounds): void {
    this.bounds = { ...bounds };
  }

  public loadWorldRegion(region: string): void {
    this.loadedRegions.add(region);
  }

  public unloadWorldRegion(region: string): void {
    this.loadedRegions.delete(region);
  }

  public validateWorldState(): boolean {
    return this.isInitialized && !isNaN(this.time) && this.simulationSpeed >= 0;
  }

  public optimizeWorldSimulation(): void {
    // Memory and LOD pruning
  }

  // 021–040. Quản lý vật thể trong thế giới
  public createWorldObject<T = unknown>(type: string): WorldObject<T> {
    const id = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const obj: WorldObject<T> = {
      id,
      type,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      tags: [],
      children: [],
    };
    this.objects.set(id, obj);
    return obj;
  }

  public destroyWorldObject(object: WorldObject | string): void {
    const id = typeof object === 'string' ? object : object.id;
    const target = this.objects.get(id);
    if (target) {
      target.isDestroyed = true;
      this.objects.delete(id);
    }
  }

  public cloneWorldObject(object: WorldObject): WorldObject {
    const cloned = JSON.parse(JSON.stringify(object));
    cloned.id = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.objects.set(cloned.id, cloned);
    return cloned;
  }

  public duplicateWorldObject(object: WorldObject): WorldObject {
    return this.cloneWorldObject(object);
  }

  public setObjectPosition(object: WorldObject | string, position: Vec3): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) obj.position = { ...position };
  }

  public setObjectRotation(object: WorldObject | string, rotation: WorldObject['rotation']): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) obj.rotation = { ...rotation };
  }

  public setObjectScale(object: WorldObject | string, scale: Vec3 | number): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) {
      obj.scale = typeof scale === 'number' ? { x: scale, y: scale, z: scale } : { ...scale };
    }
  }

  public setObjectTransform(object: WorldObject | string, transform: { position?: Vec3; rotation?: WorldObject['rotation']; scale?: Vec3 }): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) {
      if (transform.position) obj.position = { ...transform.position };
      if (transform.rotation) obj.rotation = { ...transform.rotation };
      if (transform.scale) obj.scale = { ...transform.scale };
    }
  }

  public getObjectTransform(object: WorldObject | string): { position: Vec3; rotation: WorldObject['rotation']; scale: Vec3 } {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    return obj ? { position: { ...obj.position }, rotation: { ...obj.rotation }, scale: { ...obj.scale } } : { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 }, scale: { x: 1, y: 1, z: 1 } };
  }

  /**
   * Đồng bộ ma trận biến đổi của vật thể.
   *
   * Trước đây `object` bị bỏ qua hoàn toàn — ma trận không bao giờ được dựng.
   * Nay ma trận thế giới được tính từ vị trí / xoay / tỉ lệ của vật và của
   * vật cha, rồi ghi lại để dùng lại ở lần render sau.
   */
  public updateObjectTransform(object: WorldObject | string): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (!obj) return;
    const local = this.composeMatrix(obj.position, obj.rotation, obj.scale);
    const parent = obj.parentId ? this.objects.get(obj.parentId) : undefined;
    const parentMatrix = parent
      ? this.composeMatrix(parent.position, parent.rotation, parent.scale)
      : undefined;
    const world = parentMatrix ? this.multiplyMatrices(parentMatrix, local) : local;
    Object.assign(obj as unknown as Record<string, unknown>, {
      worldMatrix: world,
      isTransformDirty: false,
      lastTransformUpdate: this.time,
    });
  }

  /** Dựng ma trận 4×4 (row-major) từ vị trí, xoay quaternion và tỉ lệ. */
  private composeMatrix(position: Vec3, rotation: WorldObject['rotation'], scale: Vec3): number[] {
    const qx = Number(rotation?.x ?? 0);
    const qy = Number(rotation?.y ?? 0);
    const qz = Number(rotation?.z ?? 0);
    const qw = Number(rotation?.w ?? 1);
    const x2 = qx + qx;
    const y2 = qy + qy;
    const z2 = qz + qz;
    const xx = qx * x2;
    const xy = qx * y2;
    const xz = qx * z2;
    const yy = qy * y2;
    const yz = qy * z2;
    const zz = qz * z2;
    const wx = qw * x2;
    const wy = qw * y2;
    const wz = qw * z2;
    const sx = Number(scale?.x ?? 1);
    const sy = Number(scale?.y ?? 1);
    const sz = Number(scale?.z ?? 1);
    return [
      (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
      (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
      (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
      Number(position?.x ?? 0), Number(position?.y ?? 0), Number(position?.z ?? 0), 1,
    ];
  }

  /** Nhân hai ma trận 4×4 (row-major). */
  private multiplyMatrices(a: number[], b: number[]): number[] {
    const out = new Array<number>(16).fill(0);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) sum += a[row * 4 + k] * b[k * 4 + col];
        out[row * 4 + col] = sum;
      }
    }
    return out;
  }

  public setObjectVisibility(object: WorldObject | string, visible: boolean): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) obj.visible = visible;
  }

  public setObjectMaterial(object: WorldObject | string, material: string): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) obj.material = material;
  }

  public setObjectTexture(object: WorldObject | string, texture: string): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) obj.texture = texture;
  }

  public setObjectTags(object: WorldObject | string, tags: string[]): void {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (obj) obj.tags = [...tags];
  }

  public getObjectTags(object: WorldObject | string): string[] {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    return obj ? [...obj.tags] : [];
  }

  public attachObjectToParent(object: WorldObject | string, parent: WorldObject | string): void {
    const childObj = typeof object === 'string' ? this.objects.get(object) : object;
    const parentId = typeof parent === 'string' ? parent : parent.id;
    const parentObj = this.objects.get(parentId);
    if (childObj && parentObj) {
      childObj.parentId = parentId;
      if (!parentObj.children.includes(childObj.id)) parentObj.children.push(childObj.id);
    }
  }

  public detachObjectFromParent(object: WorldObject | string): void {
    const childObj = typeof object === 'string' ? this.objects.get(object) : object;
    if (childObj && childObj.parentId) {
      const parentObj = this.objects.get(childObj.parentId);
      if (parentObj) {
        parentObj.children = parentObj.children.filter(id => id !== childObj.id);
      }
      childObj.parentId = undefined;
    }
  }

  /**
   * Chuyển vật thể sang một vùng khác.
   *
   * Trước đây `object` bị bỏ qua hoàn toàn — vùng được nạp nhưng vật thể
   * không thuộc về vùng nào. Nay vật thể được ghi nhận vào vùng (bảng tra cứu
   * và thẻ vùng) để lần gọi sau đọc lại được.
   */
  public transferObjectToRegion(object: WorldObject | string, region: string): void {
    this.loadWorldRegion(region);
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    if (!obj) return;
    this.objectRegions.set(obj.id, region);
    const tag = `region:${region}`;
    if (Array.isArray(obj.tags) && !obj.tags.includes(tag)) obj.tags.push(tag);
    Object.assign(obj as unknown as Record<string, unknown>, { region });
  }

  public serializeWorldObject(object: WorldObject | string): string {
    const obj = typeof object === 'string' ? this.objects.get(object) : object;
    return JSON.stringify(obj ?? {});
  }

  public deserializeWorldObject(data: string | WorldObject): WorldObject {
    const parsed = (typeof data === 'string' ? JSON.parse(data) : data) as WorldObject;
    this.objects.set(parsed.id, parsed);
    return parsed;
  }
}
