/**
 * @file legacy.ts
 * @module @aetheria/engine/life/legacy
 * @description Truyền thừa: cây gia phả, di chúc, phân chia tài sản, kế thừa tri
 * thức/nghề nghiệp, tưởng niệm và các giai đoạn đau buồn. Đây là cầu nối giữa
 * sinh tử cá nhân và tiến trình văn minh nhiều thế hệ.
 */

import { LifeRandom } from './stochastic.js';
import { clamp01, clampRange } from '../deeplearning/random.js';
import type { DeathCause } from './lifecycle.js';

/** Một tài sản. */
export interface Asset {
  id: string;
  name: string;
  type: 'land' | 'house' | 'tool' | 'livestock' | 'money' | 'heirloom' | 'book' | 'knowledge' | 'title';
  value: number;
  sentimentalValue: number;
  ownerId: string;
  condition: number;
}

/** Một người thừa kế. */
export interface Beneficiary {
  id: string;
  relationship: string;
  share: number;
  /** Nhận tài sản tinh thần/tri thức. */
  knowledgeShare?: number;
}

/** Di chúc. */
export interface Will {
  id: string;
  deceasedId: string;
  assets: string[];
  beneficiaries: Beneficiary[];
  debts: number;
  knowledgeBequests: Array<{ heirId: string; knowledgeIds: string[] }>;
  createdAt: number;
  contested: boolean;
}

/** Kết quả phân chia di sản. */
export interface InheritanceResult {
  deceasedId: string;
  estateValue: number;
  debtsPaid: number;
  taxPaid: number;
  distributions: Array<{ heirId: string; relationship: string; value: number; assets: string[] }>;
  knowledgeTransferred: Array<{ heirId: string; knowledgeIds: string[] }>;
  contested: boolean;
  detail: string;
}

/** Một nút trong cây gia phả. */
export interface FamilyNode {
  id: string;
  name: string;
  motherId?: string;
  fatherId?: string;
  children: string[];
  birthYear?: number;
  deathYear?: number;
  generation: number;
}

/** Cây gia phả. */
export class FamilyTree {
  public readonly nodes = new Map<string, FamilyNode>();
  private readonly parentCache = new Map<string, Set<string>>();

  /** Thêm một người. */
  public addPerson(
    id: string,
    options: Partial<Omit<FamilyNode, 'id'>> = {},
  ): FamilyNode {
    const node: FamilyNode = {
      id,
      name: options.name ?? id,
      motherId: options.motherId,
      fatherId: options.fatherId,
      children: options.children ? [...options.children] : [],
      birthYear: options.birthYear,
      deathYear: options.deathYear,
      generation: options.generation ?? 0,
    };
    this.nodes.set(id, node);
    if (node.motherId) this.linkParent(id, node.motherId);
    if (node.fatherId) this.linkParent(id, node.fatherId);
    return node;
  }

  /** Ghi nhận sinh con và nối quan hệ cha mẹ. */
  public recordBirth(childId: string, motherId?: string, fatherId?: string, name?: string): FamilyNode {
    const node = this.addPerson(childId, { name, motherId, fatherId, generation: 0 });
    if (motherId) {
      const mother = this.nodes.get(motherId);
      if (mother) {
        if (!mother.children.includes(childId)) mother.children.push(childId);
        node.generation = Math.max(node.generation, mother.generation + 1);
      }
      this.linkParent(childId, motherId);
    }
    if (fatherId) {
      const father = this.nodes.get(fatherId);
      if (father) {
        if (!father.children.includes(childId)) father.children.push(childId);
        node.generation = Math.max(node.generation, father.generation + 1);
      }
      this.linkParent(childId, fatherId);
    }
    return node;
  }

  /** Tổ tiên tới `depth` đời. */
  public ancestors(id: string, depth = 4): string[] {
    const result: string[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id, depth: 0 }];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.depth >= depth) continue;
      const node = this.nodes.get(current.id);
      if (!node) continue;
      for (const parent of [node.motherId, node.fatherId]) {
        if (!parent || visited.has(parent)) continue;
        visited.add(parent);
        result.push(parent);
        queue.push({ id: parent, depth: current.depth + 1 });
      }
    }
    return result;
  }

  /** Con cháu tới `depth` đời. */
  public descendants(id: string, depth = 4): string[] {
    const result: string[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id, depth: 0 }];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.depth >= depth) continue;
      const node = this.nodes.get(current.id);
      if (!node) continue;
      for (const child of node.children) {
        if (visited.has(child)) continue;
        visited.add(child);
        result.push(child);
        queue.push({ id: child, depth: current.depth + 1 });
      }
    }
    return result;
  }

  /** Anh chị em ruột. */
  public siblings(id: string): string[] {
    const node = this.nodes.get(id);
    if (!node) return [];
    const result = new Set<string>();
    for (const parent of [node.motherId, node.fatherId]) {
      if (!parent) continue;
      const parentNode = this.nodes.get(parent);
      for (const child of parentNode?.children ?? []) {
        if (child !== id) result.add(child);
      }
    }
    return [...result];
  }

  /** Tổ tiên chung gần nhất. */
  public commonAncestor(a: string, b: string): string | null {
    const ancestorsA = new Set([a, ...this.ancestors(a, 6)]);
    const queue = [b, ...this.ancestors(b, 6)];
    for (const candidate of queue) {
      if (ancestorsA.has(candidate)) return candidate;
    }
    return null;
  }

  /** Quan hệ họ hàng ước lượng `[0, 1]`. */
  public kinship(a: string, b: string): number {
    if (a === b) return 1;
    const ancestorsA = new Set(this.ancestors(a, 4));
    const ancestorsB = new Set(this.ancestors(b, 4));
    if (ancestorsA.has(b) || ancestorsB.has(a)) return 0.5;
    let shared = 0;
    for (const id of ancestorsA) if (ancestorsB.has(id)) shared++;
    return clamp01(shared / Math.max(1, Math.max(ancestorsA.size, ancestorsB.size)));
  }

  /** Hệ số cận huyết ước lượng từ tổ tiên chung. */
  public inbreedingCoefficient(a: string, b: string): number {
    const ancestor = this.commonAncestor(a, b);
    if (!ancestor || ancestor === a || ancestor === b) return 0;
    return clamp01(this.kinship(a, b) * 0.5);
  }

  /** Toàn bộ thành viên của một thế hệ. */
  public generation(level: number): FamilyNode[] {
    return [...this.nodes.values()].filter((node) => node.generation === level);
  }

  private linkParent(childId: string, parentId: string): void {
    const set = this.parentCache.get(childId) ?? new Set<string>();
    set.add(parentId);
    this.parentCache.set(childId, set);
  }
}

/** Giai đoạn đau buồn. */
export type GriefStage = 'denial' | 'anger' | 'bargaining' | 'depression' | 'acceptance';

/** Trạng thái đau buồn. */
export interface GriefState {
  entityId: string;
  deceasedId: string;
  stage: GriefStage;
  intensity: number;
  days: number;
  memories: string[];
  resolved: boolean;
}

/** Mô hình đau buồn Kübler-Ross mềm dẻo. */
export class GriefModel {
  public readonly states = new Map<string, GriefState>();

  /** Bắt đầu đau buồn. */
  public begin(entityId: string, deceasedId: string, cause: DeathCause = 'unknown', memories: string[] = []): GriefState {
    const intensity = clamp01(cause === 'violence' ? 0.95 : cause === 'old_age' ? 0.55 : 0.8);
    const state: GriefState = {
      entityId,
      deceasedId,
      stage: 'denial',
      intensity,
      days: 0,
      memories: [...memories],
      resolved: false,
    };
    this.states.set(`${entityId}:${deceasedId}`, state);
    return state;
  }

  /** Tiến triển đau buồn qua ngày. */
  public process(entityId: string, deceasedId: string, days = 1): GriefState | null {
    const state = this.states.get(`${entityId}:${deceasedId}`);
    if (!state) return null;
    state.days += Math.max(0, days);
    const thresholds: Array<{ stage: GriefStage; at: number }> = [
      { stage: 'denial', at: 0 },
      { stage: 'anger', at: 7 },
      { stage: 'bargaining', at: 30 },
      { stage: 'depression', at: 90 },
      { stage: 'acceptance', at: 240 },
    ];
    let stage: GriefStage = 'denial';
    for (const threshold of thresholds) if (state.days >= threshold.at) stage = threshold.stage;
    state.stage = stage;
    state.intensity = clamp01(state.intensity * Math.exp(-state.days / 365));
    state.resolved = stage === 'acceptance' && state.intensity < 0.25;
    return state;
  }

  /** An ủi làm giảm cường độ. */
  public comfort(entityId: string, deceasedId: string, amount = 0.1): GriefState | null {
    const state = this.states.get(`${entityId}:${deceasedId}`);
    if (!state) return null;
    state.intensity = clamp01(state.intensity - Math.max(0, amount));
    return state;
  }

  /** Trạng thái hiện tại. */
  public get(entityId: string, deceasedId: string): GriefState | undefined {
    return this.states.get(`${entityId}:${deceasedId}`);
  }
}

/** Engine di sản và truyền thừa. */
export class LegacyEngine {
  public readonly assets = new Map<string, Asset>();
  public readonly wills = new Map<string, Will>();
  public readonly family = new FamilyTree();
  public readonly grief = new GriefModel();
  public readonly probateHistory: InheritanceResult[] = [];

  /** Thêm tài sản. */
  public addAsset(asset: Asset): Asset {
    this.assets.set(asset.id, asset);
    return asset;
  }

  /** Tạo tài sản nhanh. */
  public createAsset(
    id: string,
    ownerId: string,
    type: Asset['type'],
    value: number,
    options: { name?: string; sentimentalValue?: number; condition?: number } = {},
  ): Asset {
    return this.addAsset({
      id,
      name: options.name ?? id,
      type,
      value: Math.max(0, value),
      sentimentalValue: clamp01(options.sentimentalValue ?? 0),
      ownerId,
      condition: clamp01(options.condition ?? 1),
    });
  }

  /** Viết di chúc. */
  public writeWill(
    deceasedId: string,
    beneficiaries: Beneficiary[],
    options: { debts?: number; knowledgeBequests?: Will['knowledgeBequests']; createdAt?: number } = {},
  ): Will {
    const assets = [...this.assets.values()].filter((asset) => asset.ownerId === deceasedId).map((asset) => asset.id);
    const totalShare = beneficiaries.reduce((sum, beneficiary) => sum + Math.max(0, beneficiary.share), 0) || 1;
    const normalized = beneficiaries.map((beneficiary) => ({
      ...beneficiary,
      share: Math.max(0, beneficiary.share) / totalShare,
    }));
    const will: Will = {
      id: `will_${deceasedId}`,
      deceasedId,
      assets,
      beneficiaries: normalized,
      debts: Math.max(0, options.debts ?? 0),
      knowledgeBequests: options.knowledgeBequests ?? [],
      createdAt: options.createdAt ?? Date.now(),
      contested: false,
    };
    this.wills.set(deceasedId, will);
    return will;
  }

  /**
   * Phân chia di sản. Nếu không có di chúc, chia đều cho người thừa kế hợp lệ
   * (con cái, vợ/chồng), sau khi trừ nợ và thuế.
   */
  public probate(
    deceasedId: string,
    heirs: Beneficiary[],
    options: { taxRate?: number; will?: Will } = {},
  ): InheritanceResult {
    const will = options.will ?? this.wills.get(deceasedId);
    const beneficiaries = will?.beneficiaries.length ? will.beneficiaries : heirs;
    const owned = [...this.assets.values()].filter((asset) => asset.ownerId === deceasedId);
    const gross = owned.reduce((sum, asset) => sum + asset.value + asset.sentimentalValue * 0.2, 0);
    const debts = Math.min(gross, will?.debts ?? 0);
    const taxRate = clamp01(options.taxRate ?? 0.05);
    const taxable = Math.max(0, gross - debts);
    const tax = taxable * taxRate;
    const net = Math.max(0, taxable - tax);

    const totalShares = beneficiaries.reduce((sum, beneficiary) => sum + Math.max(0, beneficiary.share), 0) || 1;
    const distributions: InheritanceResult['distributions'] = [];
    const sortedAssets = [...owned].sort((a, b) => b.value - a.value);

    for (const beneficiary of beneficiaries) {
      const share = Math.max(0, beneficiary.share) / totalShares;
      const value = net * share;
      const assigned: string[] = [];
      let remaining = value;
      for (const asset of sortedAssets) {
        if (remaining <= 0) break;
        if (assigned.includes(asset.id)) continue;
        const assetValue = asset.value + asset.sentimentalValue * 0.2;
        if (assetValue <= remaining * 1.3 || remaining >= net * 0.5) {
          assigned.push(asset.id);
          remaining -= assetValue;
        }
      }
      distributions.push({
        heirId: beneficiary.id,
        relationship: beneficiary.relationship,
        value,
        assets: assigned,
      });
      for (const assetId of assigned) {
        const asset = this.assets.get(assetId);
        if (asset) asset.ownerId = beneficiary.id;
      }
    }

    const knowledgeTransferred = (will?.knowledgeBequests ?? beneficiaries
      .filter((beneficiary) => (beneficiary.knowledgeShare ?? 0) > 0)
      .map((beneficiary) => ({ heirId: beneficiary.id, knowledgeIds: ['family_traditions'] })))
      .map((bequest) => ({ heirId: bequest.heirId, knowledgeIds: [...bequest.knowledgeIds] }));

    const result: InheritanceResult = {
      deceasedId,
      estateValue: gross,
      debtsPaid: debts,
      taxPaid: tax,
      distributions,
      knowledgeTransferred,
      contested: will?.contested ?? false,
      detail: `Di sản ${gross.toFixed(0)} chia cho ${distributions.length} người thừa kế, nợ ${debts.toFixed(0)}, thuế ${tax.toFixed(0)}.`,
    };
    this.probateHistory.push(result);
    return result;
  }

  /** Ghi nhận mất mát và bắt đầu đau buồn cho người ở lại. */
  public mourn(entityId: string, deceasedId: string, cause: DeathCause = 'unknown', memories: string[] = []): GriefState {
    return this.grief.begin(entityId, deceasedId, cause, memories);
  }

  /** Truyền nghề/tri thức cho người kế thừa. */
  public bequeathKnowledge(
    mentorId: string,
    heirId: string,
    knowledgeIds: readonly string[],
    options: { mastery?: number; random?: LifeRandom } = {},
  ): { mentorId: string; heirId: string; knowledgeIds: string[]; mastery: number; fidelity: number } {
    const random = options.random ?? new LifeRandom(`${mentorId}:${heirId}:legacy`);
    const mastery = clamp01(options.mastery ?? 0.8);
    const fidelity = clamp01(mastery * random.range(0.6, 0.95));
    return {
      mentorId,
      heirId,
      knowledgeIds: [...knowledgeIds],
      mastery,
      fidelity,
    };
  }

  /** Chia di sản theo luật thừa kế mặc định (không di chúc). */
  public intestateHeirs(deceasedId: string): Beneficiary[] {
    const node = this.family.nodes.get(deceasedId);
    const heirs: Beneficiary[] = [];
    for (const child of node?.children ?? []) heirs.push({ id: child, relationship: 'con', share: 1 });
    if (heirs.length === 0) {
      for (const sibling of this.family.siblings(deceasedId)) {
        heirs.push({ id: sibling, relationship: 'anh chị em', share: 1 });
      }
    }
    return heirs;
  }

  /** Tổng giá trị di sản của một người. */
  public estateValue(ownerId: string): number {
    return [...this.assets.values()]
      .filter((asset) => asset.ownerId === ownerId)
      .reduce((sum, asset) => sum + asset.value, 0);
  }
}
