/**
 * @file territory.ts
 * @module @aetheria/engine/law/territory
 * @description Lãnh thổ & chủ quyền: mảnh đất (generic theo địa hình), tỉnh,
 * biên giới, tuyên bố chủ quyền, sáp nhập, ly khai, giãn dân tự mở rộng lãnh
 * thổ, và thế giới đa quốc gia (WorldAtlas) với ngoại giao thô (đồng minh,
 * triều cống, chiến tranh, tranh chấp biên giới).
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

/** Đặc trưng địa hình — generic territory dùng cho mọi loại vùng đất. */
export interface TerrainFeature {
  kind: 'plain' | 'forest' | 'mountain' | 'coast' | 'river' | 'desert';
  /** Độ phì/năng suất `[0, 1]`. */
  fertility: number;
  /** Khoáng sản/tài nguyên `[0, 1]`. */
  resourceRichness: number;
  /** Khả năng phòng thủ tự nhiên `[0, 1]`. */
  defensibility: number;
  /** Số dân tối đa vùng đất nuôi được. */
  carryingCapacity: number;
}

/** Một mảnh lãnh thổ. */
export interface LandParcel {
  id: string;
  name: string;
  x: number;
  y: number;
  terrain: TerrainFeature;
  /** Chủ quyền hiện tại. */
  ownerId: string | null;
  /** Người tuyên bố chủ quyền ngoài chủ hiện tại. */
  claimantIds: string[];
  /** Tỉnh/phe quản lý (id tỉnh). */
  provinceId?: string;
  population: number;
  developed: number;
}

/** Một tỉnh gồm nhiều mảnh đất — đơn vị hành chính của quốc gia. */
export interface Province {
  id: string;
  name: string;
  ownerId: string;
  parcelIds: string[];
  /** Loạn ly khai `[0, 1]`. */
  separatism: number;
  governorId?: string;
}

/** Kết quả tuyên bố chủ quyền. */
export interface ClaimResult {
  parcelId: string;
  claimantId: string;
  granted: boolean;
  note: string;
}

/**
 * Lãnh thổ generic — dùng cho mọi loại vùng đất có đặc trưng riêng
 * (T mở rộng TerrainFeature cho mô hình địa hình tuỳ game).
 */
export class Territory<T extends TerrainFeature = TerrainFeature> {
  public readonly parcels = new Map<string, LandParcel & { terrain: T }>();
  public readonly provinces = new Map<string, Province>();

  /** Thêm mảnh đất (không có chủ — đất vô chủ). */
  public addParcel(parcel: {
    id: string;
    name: string;
    x: number;
    y: number;
    terrain: T;
    population?: number;
  }): LandParcel & { terrain: T } {
    const record: LandParcel & { terrain: T } = {
      ...parcel,
      ownerId: null,
      claimantIds: [],
      population: parcel.population ?? 0,
      developed: 0,
    };
    this.parcels.set(parcel.id, record);
    return record;
  }

  /** Lập tỉnh từ các mảnh đất — bộ máy hành chính nới rộng. */
  public createProvince(id: string, name: string, ownerId: string, parcelIds: readonly string[]): Province | null {
    const owned = parcelIds.filter((pid) => this.parcels.get(pid)?.ownerId === ownerId);
    if (owned.length === 0) return null;
    const province: Province = { id, name, ownerId, parcelIds: [...owned], separatism: 0 };
    this.provinces.set(id, province);
    for (const pid of owned) this.parcels.get(pid)!.provinceId = id;
    return province;
  }

  /** Tuyên bố chủ quyền mảnh đất vô chủ hoặc có chủ — tranh chấp nếu đã có chủ. */
  public claim(parcelId: string, claimantId: string, options: { force?: number; seed?: number | string } = {}): ClaimResult {
    const parcel = this.parcels.get(parcelId);
    if (!parcel) return { parcelId, claimantId, granted: false, note: 'vùng đất không tồn tại trên bản đồ' };
    if (parcel.ownerId === claimantId) {
      return { parcelId, claimantId, granted: true, note: 'đã là chủ quyền hiện hữu' };
    }
    if (parcel.ownerId === null) {
      parcel.ownerId = claimantId;
      return { parcelId, claimantId, granted: true, note: `tuyên bố chủ quyền đất vô chủ ${parcel.name} — không ai phản đối` };
    }
    // Có chủ: tranh chấp — thắng thua theo lực (force) và phòng thủ tự nhiên.
    const random = new DeepRandom(options.seed ?? `${parcelId}:${claimantId}`);
    const defense = parcel.terrain.defensibility * 0.4 + clamp01(parcel.developed / 100) * 0.2;
    const won = random.chance(clamp01((options.force ?? 0.5) - defense - 0.1));
    if (won) {
      parcel.claimantIds = [...new Set([...parcel.claimantIds, parcel.ownerId])];
      const old = parcel.ownerId;
      parcel.ownerId = claimantId;
      return { parcelId, claimantId, granted: true, note: `chiếm ${parcel.name} từ ${old} bằng vũ lực` };
    }
    if (!parcel.claimantIds.includes(claimantId)) parcel.claimantIds.push(claimantId);
    return { parcelId, claimantId, granted: false, note: `tranh chấp ${parcel.name} thất bại — ghi tên vào danh sách đòi lại` };
  }

  /** Tính sức chứa và dân số một quốc gia đang cai quản. */
  public nationalStats(ownerId: string): { parcels: number; population: number; capacity: number; provinces: number } {
    let population = 0;
    let capacity = 0;
    let count = 0;
    for (const parcel of this.parcels.values()) {
      if (parcel.ownerId !== ownerId) continue;
      count++;
      population += parcel.population;
      capacity += parcel.terrain.carryingCapacity;
    }
    let provinces = 0;
    for (const province of this.provinces.values()) if (province.ownerId === ownerId) provinces++;
    return { parcels: count, population, capacity, provinces };
  }

  /**
   * Tự mở rộng: khi dân số áp sát sức chứa, quốc gia cử dân ra chiếm vùng
   * vô chủ gần biên giới nhất. Trả mảnh đất mới chiếm (nếu có).
   */
  public expandFrontier(
    ownerId: string,
    options: { seed?: number | string; populationPressure?: number } = {},
  ): (LandParcel & { terrain: T }) | null {
    const stats = this.nationalStats(ownerId);
    const pressure = options.populationPressure ?? (stats.capacity > 0 ? stats.population / stats.capacity : 0);
    if (pressure < 0.75) return null;
    // Tìm mảnh vô chủ gần nhất tới một mảnh đã có.
    const owned = [...this.parcels.values()].filter((parcel) => parcel.ownerId === ownerId);
    let best: { parcel: LandParcel & { terrain: T }; distance: number } | null = null;
    for (const parcel of this.parcels.values()) {
      if (parcel.ownerId !== null) continue;
      for (const home of owned) {
        const distance = Math.hypot(parcel.x - home.x, parcel.y - home.y);
        if (!best || distance < best.distance) best = { parcel, distance };
      }
    }
    if (!best) return null;
    best.parcel.ownerId = ownerId;
    best.parcel.population = Math.round(best.parcel.terrain.carryingCapacity * 0.15);
    return best.parcel;
  }

  /** Ly khai một tỉnh: tỉnh tách thành quốc gia mới nếu bất mãn đủ cao. */
  public secede(provinceId: string, newStateId: string, year: number): { succeeded: boolean; parcels: string[]; note: string } | null {
    const province = this.provinces.get(provinceId);
    if (!province) return null;
    if (province.separatism < 0.7) {
      return { succeeded: false, parcels: [], note: `bất mãn chỉ ${Math.round(province.separatism * 100)}% — chưa đủ bùng ly khai` };
    }
    for (const pid of province.parcelIds) {
      const parcel = this.parcels.get(pid);
      if (parcel) parcel.ownerId = newStateId;
    }
    province.separatism = 0;
    void year;
    return { succeeded: true, parcels: [...province.parcelIds], note: `tỉnh ${province.name} ly khai thành quốc ${newStateId}` };
  }
}

/** Một quốc gia có chủ quyền đầy đủ trong thế giới. */
export interface SovereignState {
  id: string;
  name: string;
  sovereignId: string;
  governmentType: 'kingdom' | 'empire' | 'republic' | 'tribe';
  capitalParcelId?: string;
  foundedYear: number;
  /** Quan hệ ngoại giao: stateId → quan hệ `[-1, 1]`. */
  relations: Map<string, number>;
  /** Sắc pháp riêng — nối với LawCode ở phân hệ pháp luật. */
  lawCodeId: string;
  legitimacy: number;
}

/** Thế giới đa quốc gia: nhiều nước, biên giới, tranh chấp, liên minh. */
export class WorldAtlas {
  public readonly states = new Map<string, SovereignState>();
  public readonly territory = new Territory();
  public readonly wars: Array<{ a: string; b: string; startYear: number; endYear?: number; victor?: string }> = [];
  public readonly treaties: Array<{ a: string; b: string; kind: 'alliance' | 'tribute' | 'border_pact' | 'trade'; year: number }> = [];
  private readonly random: DeepRandom;

  constructor(seed: number | string = 'aetheria-atlas') {
    this.random = new DeepRandom(seed);
  }

  /** Thành lập quốc gia mới. */
  public foundState(options: {
    id: string;
    name: string;
    sovereignId: string;
    governmentType?: SovereignState['governmentType'];
    year?: number;
    lawCodeId?: string;
    capitalParcelId?: string;
  }): SovereignState {
    const state: SovereignState = {
      id: options.id,
      name: options.name,
      sovereignId: options.sovereignId,
      governmentType: options.governmentType ?? 'kingdom',
      capitalParcelId: options.capitalParcelId,
      foundedYear: options.year ?? 0,
      relations: new Map(),
      lawCodeId: options.lawCodeId ?? `law_${options.id}`,
      legitimacy: 0.7,
    };
    this.states.set(options.id, state);
    // Mọi quốc gia hiện hữu đặt quan hệ trung lập ban đầu.
    for (const other of this.states.values()) {
      if (other.id !== options.id) {
        other.relations.set(options.id, 0);
        state.relations.set(other.id, 0);
      }
    }
    return state;
  }

  /** Giao dịch hữu hình giữa hai quốc gia: đổi quan hệ. */
  public interact(aId: string, bId: string, delta: number, options: { treaty?: 'alliance' | 'tribute' | 'border_pact' | 'trade'; year?: number } = {}): number {
    const a = this.states.get(aId);
    const b = this.states.get(bId);
    if (!a || !b) return 0;
    const nextA = clampRange((a.relations.get(bId) ?? 0) + delta, -1, 1);
    a.relations.set(bId, nextA);
    b.relations.set(aId, nextA);
    if (options.treaty && nextA > 0.4) {
      this.treaties.push({ a: aId, b: bId, kind: options.treaty, year: options.year ?? 0 });
    }
    return nextA;
  }

  /** Khai chiến giữa hai quốc gia. */
  public declareWar(aId: string, bId: string, year: number): boolean {
    if (!this.states.has(aId) || !this.states.has(bId)) return false;
    if (this.wars.some((war) => !war.endYear && ((war.a === aId && war.b === bId) || (war.a === bId && war.b === aId)))) return false;
    this.wars.push({ a: aId, b: bId, startYear: year });
    this.interact(aId, bId, -0.8, { year });
    return true;
  }

  /** Kết thúc chiến tranh với bên thắng. */
  public endWar(aId: string, bId: string, victor: string | null, year: number): boolean {
    const war = this.wars.find(
      (w) => !w.endYear && ((w.a === aId && w.b === bId) || (w.a === bId && w.b === aId)),
    );
    if (!war) return false;
    war.endYear = year;
    war.victor = victor ?? undefined;
    if (victor) {
      // Bên thắng sáp nhập một phần lãnh thổ — chiến thắng quyết định, không roll.
      const loser = victor === aId ? bId : aId;
      const loserParcels = [...this.territory.parcels.values()].filter((p) => p.ownerId === loser);
      if (loserParcels.length > 1) {
        const ceded = loserParcels[this.random.int(0, loserParcels.length - 1)];
        ceded.claimantIds = [...new Set([...ceded.claimantIds, ceded.ownerId ?? 'unknown'])];
        ceded.ownerId = victor;
      }
    }
    return true;
  }

  /** Mức căng thẳng biên giới giữa hai quốc gia — càng cao càng dễ nổ chiến. */
  public borderTension(aId: string, bId: string): number {
    const a = this.states.get(aId);
    const b = this.states.get(bId);
    if (!a || !b) return 0;
    const relation = a.relations.get(bId) ?? 0;
    const parcelsA = [...this.territory.parcels.values()].filter((p) => p.ownerId === aId);
    const parcelsB = [...this.territory.parcels.values()].filter((p) => p.ownerId === bId);
    // Kề biên: khoảng cách nhỏ nhất giữa hai mảnh đất của hai nước.
    let minDistance = Infinity;
    for (const pa of parcelsA) {
      for (const pb of parcelsB) {
        const distance = Math.hypot(pa.x - pb.x, pa.y - pb.y);
        if (distance < minDistance) minDistance = distance;
      }
    }
    if (!Number.isFinite(minDistance)) return 0;
    const proximity = clamp01(1 - minDistance / 20);
    return clamp01(proximity * 0.7 + clamp01(-relation) * 0.5 + (1 - a.legitimacy) * 0.1);
  }

  /** Nhiều quốc gia tự mở rộng theo áp lực dân số — gọi mỗi năm cho mỗi nước. */
  public expansionTick(year: number): Array<{ stateId: string; parcelId: string; note: string }> {
    const expansions: Array<{ stateId: string; parcelId: string; note: string }> = [];
    for (const state of this.states.values()) {
      const parcel = this.territory.expandFrontier(state.id, { seed: `${state.id}:${year}` });
      if (parcel) {
        expansions.push({
          stateId: state.id,
          parcelId: parcel.id,
          note: `${state.name} dồn dân chiếm ${parcel.name} (năm ${year})`,
        });
      }
      // Căng thẳng biên giới cao + legitimacy thấp → khai chiến ngẫu nhiên.
      for (const otherId of this.states.keys()) {
        if (otherId === state.id) continue;
        const tension = this.borderTension(state.id, otherId);
        if (tension > 0.75 && this.random.chance(clamp01(tension - 0.7))) {
          this.declareWar(state.id, otherId, year);
        }
      }
    }
    return expansions;
  }

  /** Bản đồ thế giới thu nhỏ để UI/log. */
  public atlasSummary(): Array<{ state: string; parcels: number; population: number; wars: number }> {
    return [...this.states.values()].map((state) => {
      const stats = this.territory.nationalStats(state.id);
      const activeWars = this.wars.filter((war) => !war.endYear && (war.a === state.id || war.b === state.id)).length;
      return { state: state.name, parcels: stats.parcels, population: stats.population, wars: activeWars };
    });
  }
}

/** Sinh thế giới đa quốc gia mẫu với địa hình đa dạng. */
export function seedWorldAtlas(seed: number | string = 'atlas-demo', nations = 3): WorldAtlas {
  const atlas = new WorldAtlas(seed);
  const random = new DeepRandom(`${seed}:terrain`);
  const terrainKinds: TerrainFeature['kind'][] = ['plain', 'forest', 'mountain', 'coast', 'river', 'desert'];
  const parcelNames = ['Đồng Çay', 'Rừng Sồi', 'Núi Thạch', 'Bể Cạn', 'Triền Sông', 'Cát Cháy', 'Đầm Lầy', 'Cao Nguyên', 'Vịnh Sâu', 'Thung Lũng Xám'];

  for (let i = 0; i < nations * 4; i++) {
    const kind = terrainKinds[random.int(0, terrainKinds.length - 1)];
    atlas.territory.addParcel({
      id: `parcel_${i}`,
      name: parcelNames[i % parcelNames.length] + ` ${Math.floor(i / parcelNames.length) + 1}`,
      x: random.range(0, 40),
      y: random.range(0, 40),
      terrain: {
        kind,
        fertility: kind === 'plain' || kind === 'river' ? random.range(0.6, 0.95) : random.range(0.1, 0.5),
        resourceRichness: kind === 'mountain' ? random.range(0.5, 0.95) : random.range(0.05, 0.5),
        defensibility: kind === 'mountain' ? random.range(0.6, 0.95) : kind === 'plain' ? random.range(0, 0.3) : random.range(0.2, 0.6),
        carryingCapacity: Math.round(random.range(200, 1200)),
      },
      population: 0,
    });
  }

  for (let n = 0; n < nations; n++) {
    const state = atlas.foundState({
      id: `state_${n}`,
      name: `Quốc ${String.fromCharCode(65 + n)}`,
      sovereignId: `sovereign_${n}`,
      governmentType: n === 0 ? 'empire' : n === 1 ? 'kingdom' : 'tribe',
      year: 0,
    });
    // Chiếm 2 mảnh đất đầu tiên gần thủ đô.
    const parcels = [...atlas.territory.parcels.values()].filter((p) => p.ownerId === null);
    for (let k = 0; k < 2 && parcels.length > 0; k++) {
      const parcel = parcels.splice(random.int(0, parcels.length - 1), 1)[0];
      atlas.territory.claim(parcel.id, state.id, { force: 1, seed: `${state.id}:${parcel.id}` });
    }
  }
  return atlas;
}
