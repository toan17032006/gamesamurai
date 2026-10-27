/**
 * @file cognitive-map.ts
 * @module @aetheria/engine/psychology/cognitive-map
 * @description Bản đồ nhận thức cá nhân: ghi nhớ địa điểm, mốc, mức quen thuộc,
 * liên kết đường đi, suy giảm trí nhớ, ước lượng khoảng cách có sai số và tìm
 * đường A* trên đồ thị nhận thức thay vì bản đồ thế giới hoàn hảo.
 */

import type { Vec3 } from '../types/index.js';
import { clamp01, clampRange } from '../deeplearning/random.js';

/** Loại địa điểm trong bản đồ nhận thức. */
export type PlaceType = 'home' | 'resource' | 'danger' | 'landmark' | 'social' | 'work' | 'sacred' | 'unknown';

/** Một địa điểm đã ghi nhớ. */
export interface PlaceMemory {
  id: string;
  name: string;
  position: Vec3;
  type: PlaceType;
  salience: number;
  visits: number;
  lastVisited: number;
  confidence: number;
  connections: Record<string, number>;
  notes: string[];
}

/** Đầu vào ghi nhớ địa điểm. */
export interface PlaceInput {
  id: string;
  name?: string;
  position: Vec3;
  type?: PlaceType;
  salience?: number;
  note?: string;
}

/** Kết quả tìm đường nhận thức. */
export interface CognitiveRoute {
  found: boolean;
  path: string[];
  distance: number;
  confidence: number;
  explanation: string;
}

/** Cấu hình bản đồ. */
export interface CognitiveMapConfig {
  decayPerDay?: number;
  forgettingThreshold?: number;
  maxPlaces?: number;
}

/** Bản đồ nhận thức của một cá thể. */
export class CognitiveMap {
  public readonly places = new Map<string, PlaceMemory>();
  public readonly config: Required<CognitiveMapConfig>;
  public totalTravelDistance = 0;
  public lastUpdate = 0;

  constructor(config: CognitiveMapConfig = {}) {
    this.config = {
      decayPerDay: clamp01(config.decayPerDay ?? 0.01),
      forgettingThreshold: clamp01(config.forgettingThreshold ?? 0.08),
      maxPlaces: Math.max(1, Math.floor(config.maxPlaces ?? 256)),
    };
  }

  /** Số địa điểm đã nhớ. */
  public get size(): number {
    return this.places.size;
  }

  /** Ghi nhớ/ghi đè một địa điểm. */
  public learnPlace(input: PlaceInput): PlaceMemory {
    const existing = this.places.get(input.id);
    if (existing) {
      existing.position = { ...input.position };
      existing.name = input.name ?? existing.name;
      existing.type = input.type ?? existing.type;
      existing.salience = clamp01(Math.max(existing.salience, input.salience ?? 0.5));
      existing.visits++;
      existing.lastVisited = Date.now();
      existing.confidence = clamp01(existing.confidence + 0.1);
      if (input.note && !existing.notes.includes(input.note)) existing.notes.push(input.note);
      return existing;
    }

    const place: PlaceMemory = {
      id: input.id,
      name: input.name ?? input.id,
      position: { ...input.position },
      type: input.type ?? 'unknown',
      salience: clamp01(input.salience ?? 0.5),
      visits: 1,
      lastVisited: Date.now(),
      confidence: clamp01(0.35 + (input.salience ?? 0.5) * 0.5),
      connections: {},
      notes: input.note ? [input.note] : [],
    };
    this.places.set(place.id, place);
    if (this.places.size > this.config.maxPlaces) this.forgetWeakest();
    return place;
  }

  /** Ghi nhận chuyến đi giữa hai địa điểm và tạo liên kết. */
  public travel(fromId: string, toId: string, options: { speed?: number; note?: string } = {}): number {
    const from = this.places.get(fromId);
    const to = this.places.get(toId);
    if (!from || !to) return 0;
    const distance = euclidean(from.position, to.position);
    const strength = clamp01(1 - distance / 1000) * 0.5 + 0.5;
    this.connect(fromId, toId, strength);
    this.totalTravelDistance += distance;
    if (options.note) {
      if (!to.notes.includes(options.note)) to.notes.push(options.note);
    }
    to.visits++;
    to.lastVisited = Date.now();
    to.confidence = clamp01(to.confidence + 0.08);
    this.lastUpdate = Date.now();
    return distance;
  }

  /** Nối hai địa điểm với cường độ `[0, 1]`. */
  public connect(aId: string, bId: string, strength = 0.5): boolean {
    const a = this.places.get(aId);
    const b = this.places.get(bId);
    if (!a || !b || aId === bId) return false;
    const value = clamp01(strength);
    a.connections[bId] = Math.max(a.connections[bId] ?? 0, value);
    b.connections[aId] = Math.max(b.connections[aId] ?? 0, value);
    return true;
  }

  /** Địa điểm gần nhất, có thể lọc theo loại. */
  public nearest(position: Vec3, type?: PlaceType, limit = 1): PlaceMemory[] {
    const candidates = [...this.places.values()]
      .filter((place) => type === undefined || place.type === type)
      .map((place) => ({ place, distance: euclidean(place.position, position) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Math.max(0, limit))
      .map((entry) => entry.place);
    return candidates;
  }

  /** Khoảng cách nhận thức có sai số do độ tin cậy thấp. */
  public estimateDistance(aId: string, bId: string): number {
    const a = this.places.get(aId);
    const b = this.places.get(bId);
    if (!a || !b) return Infinity;
    const actual = euclidean(a.position, b.position);
    const confidence = Math.min(a.confidence, b.confidence);
    const error = (1 - confidence) * 0.25;
    const seed = hashText(`${aId}:${bId}`);
    const noise = ((seed % 1000) / 1000 - 0.5) * 2 * error;
    return Math.max(0, actual * (1 + noise));
  }

  /** Tìm đường A* trên đồ thị nhận thức. */
  public findPath(fromId: string, toId: string): CognitiveRoute {
    const start = this.places.get(fromId);
    const goal = this.places.get(toId);
    if (!start || !goal) {
      return { found: false, path: [], distance: Infinity, confidence: 0, explanation: 'Chưa từng tới nơi cần đến.' };
    }
    if (fromId === toId) {
      return { found: true, path: [fromId], distance: 0, confidence: start.confidence, explanation: 'Đã ở đó.' };
    }

    const open = new Set<string>([fromId]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>([[fromId, 0]]);
    const fScore = new Map<string, number>([[fromId, euclidean(start.position, goal.position)]]);
    const closed = new Set<string>();

    while (open.size > 0) {
      let current: string | null = null;
      let best = Infinity;
      for (const id of open) {
        const score = fScore.get(id) ?? Infinity;
        if (score < best) {
          best = score;
          current = id;
        }
      }
      if (!current) break;
      if (current === toId) {
        const path: string[] = [];
        let node: string | undefined = current;
        while (node) {
          path.unshift(node);
          node = cameFrom.get(node);
        }
        let distance = 0;
        for (let i = 1; i < path.length; i++) {
          const previous = this.places.get(path[i - 1]);
          const next = this.places.get(path[i]);
          if (previous && next) distance += euclidean(previous.position, next.position);
        }
        const confidence = path
          .map((id) => this.places.get(id)?.confidence ?? 0)
          .reduce((sum, value) => sum + value, 0) / Math.max(1, path.length);
        return {
          found: true,
          path,
          distance,
          confidence,
          explanation: `Lộ trình quen thuộc qua ${path.length} địa điểm.`,
        };
      }

      open.delete(current);
      closed.add(current);
      const node = this.places.get(current);
      if (!node) continue;
      for (const [neighborId, strength] of Object.entries(node.connections)) {
        if (closed.has(neighborId)) continue;
        const neighbor = this.places.get(neighborId);
        if (!neighbor) continue;
        const step = euclidean(node.position, neighbor.position) / Math.max(0.1, strength);
        const tentative = (gScore.get(current) ?? Infinity) + step;
        if (tentative < (gScore.get(neighborId) ?? Infinity)) {
          cameFrom.set(neighborId, current);
          gScore.set(neighborId, tentative);
          fScore.set(neighborId, tentative + euclidean(neighbor.position, goal.position));
          open.add(neighborId);
        }
      }
    }

    return {
      found: false,
      path: [],
      distance: Infinity,
      confidence: 0,
      explanation: 'Không có đường đi đã biết; cần khám phá thêm.',
    };
  }

  /** Địa điểm nên khám phá tiếp theo — nơi ít ghé thăm nhưng quan trọng. */
  public explorationFrontier(limit = 3): PlaceMemory[] {
    return [...this.places.values()]
      .filter((place) => place.type === 'unknown' || place.visits <= 1)
      .sort((a, b) => b.salience - a.salience - (a.visits - b.visits) * 0.1)
      .slice(0, Math.max(0, limit));
  }

  /** Đánh dấu nơi nguy hiểm. */
  public markDanger(placeId: string, note = 'nguy hiểm'): boolean {
    const place = this.places.get(placeId);
    if (!place) return false;
    place.type = 'danger';
    place.salience = clamp01(place.salience + 0.2);
    if (!place.notes.includes(note)) place.notes.push(note);
    return true;
  }

  /** Suy giảm trí nhớ không gian theo ngày. */
  public decay(days = 1): number {
    const factor = Math.exp(-this.config.decayPerDay * Math.max(0, days));
    let forgotten = 0;
    for (const [id, place] of this.places) {
      place.confidence *= factor;
      place.salience *= factor;
      if (place.confidence < this.config.forgettingThreshold && place.visits <= 1) {
        this.places.delete(id);
        forgotten++;
      }
    }
    return forgotten;
  }

  /** Độ chính xác trí nhớ không gian trung bình. */
  public spatialMemoryAccuracy(): number {
    if (this.places.size === 0) return 0;
    let total = 0;
    for (const place of this.places.values()) total += place.confidence;
    return total / this.places.size;
  }

  /** Bản đồ dạng mảng để lưu. */
  public snapshot(): PlaceMemory[] {
    return [...this.places.values()].map((place) => ({
      ...place,
      position: { ...place.position },
      connections: { ...place.connections },
      notes: [...place.notes],
    }));
  }

  /** Khôi phục từ ảnh chụp. */
  public restore(places: readonly PlaceMemory[]): void {
    this.places.clear();
    for (const place of places) {
      this.places.set(place.id, {
        ...place,
        position: { ...place.position },
        connections: { ...place.connections },
        notes: [...place.notes],
      });
    }
  }

  /** Xoá địa điểm yếu nhất khi vượt sức chứa. */
  private forgetWeakest(): void {
    let weakest: string | null = null;
    let value = Infinity;
    for (const [id, place] of this.places) {
      if (place.confidence < value) {
        value = place.confidence;
        weakest = id;
      }
    }
    if (weakest) this.places.delete(weakest);
  }
}

/** Khoảng cách Euclid 3D. */
export function euclidean(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** Kẹp vị trí vào hộp biên. */
export function clampPosition(position: Vec3, min: number, max: number): Vec3 {
  return {
    x: clampRange(position.x, min, max),
    y: clampRange(position.y, min, max),
    z: clampRange(position.z, min, max),
  };
}

/** Băm chuỗi đơn giản cho nhiễu tất định. */
function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash;
}
