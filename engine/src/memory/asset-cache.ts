// engine/src/memory/asset-cache.ts — Lưu trữ bộ nhớ đệm (Cache) tài nguyên đã bóc tách với LRU & Memory Budget
import type { ParsedAsset } from '../types/asset.types';
import { estimateAssetMemory } from './memory-disposer';

export interface AssetCacheOptions {
  maxEntries?: number;
  maxBytes?: number;
}

export interface AssetCacheStats {
  entries: number;
  bytes: number;
  maxEntries: number;
  maxBytes: number;
  hits: number;
  misses: number;
  evictions: number;
}

export class AssetCache {
  private entries = new Map<string, ParsedAsset>();
  private sizes = new Map<string, number>();
  private readonly maxEntries: number;
  private readonly maxBytes: number;
  private currentBytes = 0;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(opts: AssetCacheOptions = {}) {
    this.maxEntries = Math.max(1, opts.maxEntries ?? 64);
    this.maxBytes = Math.max(1, opts.maxBytes ?? 256 * 1024 * 1024);
  }

  has(path: string): boolean {
    return this.entries.has(path);
  }

  get(path: string): ParsedAsset | undefined {
    const asset = this.entries.get(path);
    if (!asset) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    this.entries.delete(path);
    this.entries.set(path, asset);
    return asset;
  }

  set(path: string, asset: ParsedAsset): void {
    if (this.entries.has(path)) this.delete(path);

    const size = estimateAssetMemory(asset);
    this.entries.set(path, asset);
    this.sizes.set(path, size);
    this.currentBytes += size;
    this.evict();
  }

  delete(path: string): boolean {
    const size = this.sizes.get(path);
    if (size === undefined) return false;
    this.sizes.delete(path);
    this.currentBytes -= size;
    return this.entries.delete(path);
  }

  clear(): void {
    this.entries.clear();
    this.sizes.clear();
    this.currentBytes = 0;
  }

  stats(): AssetCacheStats {
    return {
      entries: this.entries.size,
      bytes: this.currentBytes,
      maxEntries: this.maxEntries,
      maxBytes: this.maxBytes,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
    };
  }

  private evict(): void {
    while (this.entries.size > this.maxEntries || (this.currentBytes > this.maxBytes && this.entries.size > 1)) {
      const oldest = this.entries.keys().next();
      if (oldest.done) break;
      const path = oldest.value;
      this.delete(path);
      this.evictions++;
    }
  }
}
