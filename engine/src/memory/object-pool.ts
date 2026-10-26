// engine/src/memory/object-pool.ts — Hồ chứa đối tượng (Object Pooling) cho assets tái sử dụng
import * as THREE from 'three';
import type { ParsedAsset } from '../types/asset.types';

const POOL_ID_KEY = '__enginePoolAssetId';

export interface ObjectPoolOptions {
  maxPerAsset?: number;
}

export interface ObjectPoolStats {
  registered: number;
  available: number;
  active: number;
}

export class ObjectPool {
  private templates = new Map<string, THREE.Object3D>();
  private pooled = new Map<string, THREE.Object3D[]>();
  private active = 0;
  private readonly maxPerAsset: number;

  constructor(opts: ObjectPoolOptions = {}) {
    this.maxPerAsset = Math.max(1, opts.maxPerAsset ?? 32);
  }

  register(assetId: string, template: THREE.Object3D): void {
    this.templates.set(assetId, template);
    if (!this.pooled.has(assetId)) this.pooled.set(assetId, []);
  }

  registerAsset(asset: ParsedAsset): void {
    this.register(asset.id, asset.scene);
  }

  has(assetId: string): boolean {
    return this.templates.has(assetId);
  }

  acquire(assetId: string): THREE.Object3D | null {
    const pool = this.pooled.get(assetId);
    let instance: THREE.Object3D | null = null;

    if (pool && pool.length > 0) {
      instance = pool.pop() ?? null;
    } else {
      const template = this.templates.get(assetId);
      if (!template) return null;
      instance = template.clone(true);
    }
    if (!instance) return null;

    instance.visible = true;
    instance.userData[POOL_ID_KEY] = assetId;
    this.active++;
    return instance;
  }

  release(instance: THREE.Object3D): boolean {
    const assetId = instance.userData[POOL_ID_KEY];
    if (typeof assetId !== 'string') return false;
    const pool = this.pooled.get(assetId);
    if (!pool) return false;

    instance.removeFromParent();
    instance.visible = false;
    if (pool.length < this.maxPerAsset) {
      pool.push(instance);
      this.active--;
      return true;
    }
    return false;
  }

  prewarm(assetId: string, n: number): void {
    const template = this.templates.get(assetId);
    const pool = this.pooled.get(assetId);
    if (!template || !pool) return;
    for (let i = 0; i < n && pool.length < this.maxPerAsset; i++) {
      const instance = template.clone(true);
      instance.visible = false;
      instance.userData[POOL_ID_KEY] = assetId;
      pool.push(instance);
    }
  }

  stats(): ObjectPoolStats {
    let available = 0;
    for (const list of this.pooled.values()) available += list.length;
    return {
      registered: this.templates.size,
      available,
      active: this.active,
    };
  }

  clear(): void {
    this.templates.clear();
    this.pooled.clear();
    this.active = 0;
  }
}
