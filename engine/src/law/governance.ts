/**
 * @file governance.ts
 * @module @aetheria/engine/law/governance
 * @description Bộ máy nhà nước phân cấp như xã hội loài người thời phong kiến:
 * hoàng đế → vua → công → hầu → bá → tử → nam → kỵ sĩ → thứ dân; tước vị, chư
 * hầu thề trung thành, nghĩa vụ nộp thuế/lính; **quan lại trong bộ máy đặt ra
 * lệnh (sắc lệnh), pháp luật, trừng trị, ép buộc và đạo đức**; bộ máy TỰ MỞ
 * RỘNG khi lãnh thổ/dân số tăng; sự chính danh của ngôi vua và cướp ngôi.
 */

import { clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import { LawCode, type Statute, type PunishmentRecord } from './legal-system.js';
import { createStatute, sentence } from './legal-system.js';

// ===========================================================================
// Phân cấp phong kiến
// ===========================================================================

/** Cấp bậc phong kiến — số nhỏ hơn là quyền lớn hơn. */
export type FeudalRank =
  | 'emperor'
  | 'king'
  | 'duke'
  | 'count'
  | 'baron'
  | 'knight'
  | 'commoner';

export const FEUDAL_RANK_ORDER: Readonly<Record<FeudalRank, number>> = Object.freeze({
  emperor: 0,
  king: 1,
  duke: 2,
  count: 3,
  baron: 4,
  knight: 5,
  commoner: 6,
});

/** Nghĩa vụ của chư hầu với lãnh chúa. */
export interface VassalObligations {
  /** Thuế đảo mỗi năm (% tài sản). */
  taxRate: number;
  /** Số lính phải góp khi Called to arms. */
  levyCount: number;
  /** Số ngày lao dịch mỗi năm. */
  laborDays: number;
}

/** Một chư hầu trong cây phong kiến. */
export interface VassalNode {
  entityId: string;
  name: string;
  rank: FeudalRank;
  /** Lãnh chúa trực tiếp (null = đế/vua tối cao). */
  liegeId: string | null;
  vassalIds: string[];
  /** Lã địa (id vùng lãnh thổ) — nối với phân hệ lãnh thổ. */
  fiefId?: string;
  obligations: VassalObligations;
  /** Trung thành `[0, 1]` — thấp thì phản loạn. */
  loyalty: number;
  /** Sự chính danh cá nhân `[0, 1]`. */
  prestige: number;
  appointedYear: number;
}

/** Sắc lệnh do quan lại/vua ban ra. */
export type DecreeKind = 'law' | 'tax' | 'punishment' | 'mobilization' | 'moral' | 'amnesty' | 'expansion';

export interface Decree {
  id: string;
  kind: DecreeKind;
  title: string;
  content: string;
  issuedBy: string;
  office: string;
  year: number;
  /** Mức cưỡng chế `[0, 1]` — cao là mệnh lệnh cưỡng bức. */
  enforcement: number;
  /** Sự chấp nhận của dân `[0, 1]` — tính lúc ban hành. */
  acceptance: number;
  /** Sắc lệnh có kèm điều luật mới không. */
  statuteId?: string;
}

/** Kết quả ban hành sắc lệnh. */
export interface DecreeResult {
  decree: Decree;
  /** Dân có tuân theo không (dựa acceptance + enforcement). */
  obeyed: boolean;
  /** Bất mãn sinh ra trong dân (dẫn tới loạn). */
  resentment: number;
  note: string;
}

/** Một quốc gia phong kiến có bộ máy. */
export interface FeudalState {
  id: string;
  name: string;
  /** Người đứng đầu (emperor hoặc king). */
  sovereignId: string;
  hierarchy: Map<string, VassalNode>;
  lawCode: LawCode;
  /** Sự chính danh của ngôi báu `[0, 1]`. */
  legitimacy: number;
  treasury: number;
  /** Mức cưỡng chế nhà nước có thể áp `[0, 1]`. */
  coercionCapacity: number;
  foundedYear: number;
  /** Sắc lệnh đã ban. */
  decrees: Decree[];
  /** Nhật ký trừng trị. */
  punishmentLog: PunishmentRecord[];
  /** Bộ máy quan chức. */
  offices: StateOffice[];
  /** Tên hiển thị từng cấp tước theo văn minh (template áp vào). */
  rankTitles?: Partial<Record<FeudalRank, string>>;
  /** Nguồn chính danh của ngôi báu theo văn minh. */
  legitimacySource?: string;
  /** Nhánh văn minh. */
  culture?: string;
}

/** Tạo quốc gia phong kiến mới. */
export function createFeudalState(options: {
  id: string;
  name: string;
  sovereignId: string;
  sovereignName: string;
  year?: number;
  legitimacy?: number;
}): FeudalState {
  const sovereign: VassalNode = {
    entityId: options.sovereignId,
    name: options.sovereignName,
    rank: 'emperor',
    liegeId: null,
    vassalIds: [],
    obligations: { taxRate: 0, levyCount: 0, laborDays: 0 },
    loyalty: 1,
    prestige: clamp01(options.legitimacy ?? 0.8),
    appointedYear: options.year ?? 0,
  };
  return {
    id: options.id,
    name: options.name,
    sovereignId: options.sovereignId,
    hierarchy: new Map([[options.sovereignId, sovereign]]),
    lawCode: new LawCode(),
    legitimacy: clamp01(options.legitimacy ?? 0.8),
    treasury: 100,
    coercionCapacity: clamp01(0.4),
    foundedYear: options.year ?? 0,
    decrees: [],
    punishmentLog: [],
    offices: [],
  };
}

/** Cấp tước và đưa vào cây chư hầu. */
export function appointVassal(
  state: FeudalState,
  options: {
    entityId: string;
    name: string;
    rank: FeudalRank;
    liegeId: string;
    year: number;
    loyalty?: number;
    fiefId?: string;
  },
): VassalNode | null {
  const liege = state.hierarchy.get(options.liegeId);
  if (!liege) return null;
  if (FEUDAL_RANK_ORDER[options.rank] <= FEUDAL_RANK_ORDER[liege.rank]) return null; // không phong ngang/trên mình
  const node: VassalNode = {
    entityId: options.entityId,
    name: options.name,
    rank: options.rank,
    liegeId: options.liegeId,
    vassalIds: [],
    fiefId: options.fiefId,
    obligations: {
      taxRate: clampRange(0.05 + (6 - FEUDAL_RANK_ORDER[options.rank]) * 0.01, 0.02, 0.2),
      levyCount: Math.max(1, Math.round((6 - FEUDAL_RANK_ORDER[options.rank]) * 12)),
      laborDays: Math.round(6 + (6 - FEUDAL_RANK_ORDER[options.rank]) * 4),
    },
    loyalty: clamp01(options.loyalty ?? 0.7),
    prestige: clamp01(0.3 + (6 - FEUDAL_RANK_ORDER[options.rank]) * 0.08),
    appointedYear: options.year,
  };
  state.hierarchy.set(options.entityId, node);
  liege.vassalIds.push(options.entityId);
  return node;
}

/** Chuỗi overlord từ một chư hầu lên đỉnh. */
export function overlordChain(state: FeudalState, entityId: string): VassalNode[] {
  const chain: VassalNode[] = [];
  let current = state.hierarchy.get(entityId);
  let guard = 0;
  while (current && guard++ < 12) {
    chain.push(current);
    current = current.liegeId ? state.hierarchy.get(current.liegeId) : undefined;
  }
  return chain;
}

/** Thề trung thành (swear fealty) — tăng loyalty cả nhánh. */
export function swearFealty(state: FeudalState, entityId: string, newLiegeId: string): boolean {
  const node = state.hierarchy.get(entityId);
  const newLiege = state.hierarchy.get(newLiegeId);
  if (!node || !newLiege) return false;
  if (node.liegeId) {
    const old = state.hierarchy.get(node.liegeId);
    if (old) old.vassalIds = old.vassalIds.filter((id) => id !== entityId);
  }
  node.liegeId = newLiegeId;
  newLiege.vassalIds.push(entityId);
  node.loyalty = clamp01(node.loyalty + 0.1);
  return true;
}

/** Thu thuế qua cây phong kiến — lãnh chúa trên gữ phần, dưới gánh phần. */
export function collectTaxes(state: FeudalState, baseWealth: number): { collected: number; distribution: Array<{ entityId: string; take: number }> } {
  let remaining = baseWealth;
  const distribution: Array<{ entityId: string; take: number }> = [];
  for (const node of state.hierarchy.values()) {
    if (node.rank === 'commoner') continue;
    const take = Math.round(remaining * node.obligations.taxRate * 100) / 100;
    distribution.push({ entityId: node.entityId, take });
    remaining -= take * 0.6; // phần chảy lên trên
  }
  const collected = Math.round((baseWealth - Math.max(0, remaining)) * 100) / 100;
  state.treasury += collected;
  return { collected, distribution };
}

// ===========================================================================
// Ban hành lệnh — sắc lệnh, pháp luật, trừng trị, ép buộc, đạo đức
// ===========================================================================

/** Chuẩn hoá ánh xạ office → quyền hạn. */
export interface StateOffice {
  id: string;
  title: string;
  holderId: string;
  /** Quyền: đặt luật / xét xử / thu thuế / chỉ huy / dạy đạo. */
  powers: ReadonlyArray<'legislate' | 'judge' | 'tax' | 'command' | 'moralize'>;
  appointedYear: number;
}

/** Gán quan chức — bộ máy tự mở rộng bằng các office mới. */
export function appointOffice(
  state: FeudalState,
  office: Omit<StateOffice, 'appointedYear'>,
  year: number,
): StateOffice {
  const record: StateOffice = { ...office, appointedYear: year };
  state.offices.push(record);
  return record;
}

/**
 * Ban sắc lệnh: acceptance của dân phụ thuộc legitimacy nhà nước + mức cưỡng
 * chế + gánh nặng sắc lệnh; sắc lệnh luật có thể kèm statute mới vào LawCode.
 */
export function issueDecree(
  state: FeudalState,
  options: {
    kind: DecreeKind;
    title: string;
    content: string;
    issuedBy: string;
    office: string;
    year: number;
    enforcement?: number;
    burden?: number;
    statute?: Statute;
  },
): DecreeResult {
  const enforcement = clamp01(options.enforcement ?? 0.5);
  const burden = clamp01(options.burden ?? 0.3);
  const acceptance = clamp01(state.legitimacy * 0.7 - burden * 0.5 + enforcement * 0.2);
  const decree: Decree = {
    id: `decree_${hashSeed(`${state.id}:${options.title}:${options.year}`).toString(16)}`,
    kind: options.kind,
    title: options.title,
    content: options.content,
    issuedBy: options.issuedBy,
    office: options.office,
    year: options.year,
    enforcement,
    acceptance,
  };
  if (options.statute) {
    state.lawCode.enact(options.statute);
    decree.statuteId = options.statute.id;
  }
  state.decrees.push(decree);

  const obeyed = acceptance + enforcement * 0.3 > 0.45;
  const resentment = clampRange(burden * (1 - acceptance) * 1.4, 0, 1);
  const notes: string[] = [];
  if (!obeyed) notes.push('dân lảng tránh, sắc lệnh trên giấy');
  if (acceptance < 0.35) notes.push('dư luận dậy sóng — legitimacy giảm');
  state.legitimacy = clamp01(state.legitimacy - (obeyed ? 0 : 0.02) - resentment * 0.01);

  return {
    decree,
    obeyed,
    resentment: Math.round(resentment * 1000) / 1000,
    note: notes.length > 0 ? notes.join('; ') : `sắc lệnh được tuân theo (chấp nhận ${Math.round(acceptance * 100)}%)`,
  };
}

/** Ra lệnh trừng trị: quan lại dùng hệ thống pháp luật để trừng phạt agent. */
export function orderPunishment(
  state: FeudalState,
  options: {
    targetEntityId: string;
    statuteId: string;
    orderedBy: string;
    year: number;
    priorViolations?: number;
    aggravation?: number;
    /** Ép án dù chứng cứ mập mờ — quyền lực thay luật. */
    showTrial?: boolean;
    wrongful?: boolean;
  },
): PunishmentRecord | null {
  const statute = state.lawCode.statutes.get(options.statuteId);
  if (!statute || statute.repealed) return null;
  const record = sentence({
    entityId: options.targetEntityId,
    statute,
    priorViolations: options.priorViolations ?? 0,
    aggravation: options.aggravation,
    year: options.year,
    orderedBy: options.orderedBy,
    wrongful: options.wrongful,
  });
  state.punishmentLog.push(record);
  // Ép án oan làm legitimacy sụp nhanh hơn án đúng.
  state.legitimacy = clamp01(state.legitimacy - (record.wrongful ? 0.03 : 0.005));
  return record;
}

/**
 * Ép buộc: nhà nước cưỡng chế một nhóm hành vi — sinh sợ hãi (tuân thủ ngắn
 * hạn) và uất ức (dài hạn bào mòn legitimacy). Cưỡng chế quá tay phản tác dụng.
 */
export function coerceSubjects(
  state: FeudalState,
  options: { targetBehavior: string; intensity?: number; year?: number },
): { fear: number; resentment: number; netEffect: string } {
  const intensity = clamp01(options.intensity ?? 0.5);
  const capacity = state.coercionCapacity;
  const fear = clamp01(intensity * capacity * 1.4);
  const resentment = clamp01(intensity * (1 - capacity) * 1.6 + intensity ** 2 * 0.3);
  state.legitimacy = clamp01(state.legitimacy - resentment * 0.02);
  const netEffect =
    fear > resentment
      ? `cưỡng chế "${options.targetBehavior}" hiệu quả — sợ hơn uất`
      : `cưỡng chế quá tay — uất ức ${Math.round(resentment * 100)}% đang nung nấu loạn`;
  return { fear: Math.round(fear * 1000) / 1000, resentment: Math.round(resentment * 1000) / 1000, netEffect };
}

/** Sắc lệnh đạo đức: cấm/ép đức tính — hiệu lực phụ thuộc giáo sĩ/văn hoá. */
export function issueMoralDecree(
  state: FeudalState,
  options: { virtue: string; mandate: 'require' | 'ban'; year: number; issuedBy: string },
): DecreeResult {
  return issueDecree(state, {
    kind: 'moral',
    title: `${options.mandate === 'require' ? 'Lệnh khuyến' : 'Lệnh cấm'} ${options.virtue}`,
    content: options.mandate === 'require'
      ? `Toàn quốc phải thực hành ${options.virtue} — ai nhút nhát thiếu đức sẽ bị miệt thị`
      : `Cấm tuyệt đối ${options.virtue} — vi phạm bị lên án công khai`,
    issuedBy: options.issuedBy,
    office: 'giáo hoá',
    year: options.year,
    enforcement: 0.3,
    burden: 0.2,
  });
}

// ===========================================================================
// Tự mở rộng bộ máy + cướp ngôi
// ===========================================================================

/** Các office mới xuất hiện khi nhà nước lớn — tự mở rộng phân cấp. */
export const EXPANSION_OFFICES: ReadonlyArray<{ title: string; powers: StateOffice['powers']; minProvinces: number }> = Object.freeze([
  { title: 'Tể tướng', powers: ['legislate', 'tax'], minProvinces: 2 },
  { title: 'Đại tư寇', powers: ['judge'], minProvinces: 2 },
  { title: 'Thái úy', powers: ['command'], minProvinces: 3 },
  { title: 'Ngự sử đại phu', powers: ['judge', 'moralize'], minProvinces: 3 },
  { title: 'Sử quan', powers: ['moralize'], minProvinces: 4 },
]);

/**
 * Tự mở rộng bộ máy: khi số tỉnh/vùng đạt mốc, tạo office mới — quan lại mới
 * có quyền đặt lệnh mới. Trả danh sách office nên tuyển ở năm này.
 */
export function expandBureaucracy(state: FeudalState, provinces: number, year: number): Array<{ title: string; powers: StateOffice['powers'] }> {
  const existing = new Set(state.decrees.map((decree) => decree.office));
  const hires: Array<{ title: string; powers: StateOffice['powers'] }> = [];
  for (const office of EXPANSION_OFFICES) {
    if (provinces >= office.minProvinces && !existing.has(office.title)) {
      hires.push({ title: office.title, powers: office.powers });
    }
  }
  void year;
  return hires;
}

/** Cướp ngôi: usurper lật đổ — legitimacy mới phụ thuộc quân đội + sự ủng hộ. */
export function usurpThrone(
  state: FeudalState,
  options: { usurperId: string; usurperName: string; armySupport: number; nobleSupport: number; year: number },
): { succeeded: boolean; newLegitimacy: number; note: string } {
  const army = clamp01(options.armySupport);
  const nobles = clamp01(options.nobleSupport);
  const force = clamp01(army * 0.6 + nobles * 0.4);
  const succeeded = force > 0.5;
  if (succeeded) {
    const old = state.hierarchy.get(state.sovereignId);
    if (old) {
      old.rank = 'commoner';
      old.loyalty = 0.1;
      old.prestige = 0.05;
    }
    const usurper: VassalNode = {
      entityId: options.usurperId,
      name: options.usurperName,
      rank: 'emperor',
      liegeId: null,
      vassalIds: [],
      obligations: { taxRate: 0, levyCount: 0, laborDays: 0 },
      loyalty: 1,
      prestige: clamp01(force * 0.8),
      appointedYear: options.year,
    };
    state.hierarchy.set(options.usurperId, usurper);
    state.sovereignId = options.usurperId;
    state.legitimacy = clamp01(nobles * 0.5 + 0.1);
    return {
      succeeded: true,
      newLegitimacy: state.legitimacy,
      note: `${options.usurperName} cướp ngôi năm ${options.year} — vua cũ bị giáng làm thứ dân, legitimacy mới ${Math.round(state.legitimacy * 100)}%`,
    };
  }
  state.legitimacy = clamp01(state.legitimacy + 0.05); // dập loạn thành công tăng chính danh
  return {
    succeeded: false,
    newLegitimacy: state.legitimacy,
    note: `loạn ${options.usurperName} bị dập — vua legit tăng nhờ thắng,
military ${Math.round(army * 100)}%`,
  };
}

/** Hạt giống tất định cho bộ máy. */
export function governanceSeed(stateId: string): number {
  return hashSeed(`governance:${stateId}`);
}
