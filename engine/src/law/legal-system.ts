/**
 * @file legal-system.ts
 * @module @aetheria/engine/law/legal-system
 * @description Hệ thống pháp luật: quốc gia ban hành luật (statute), agent
 * đánh giá **tuân thủ** (tuân theo vì sợ hãi, vì tôn trọng sự chính danh, hoặc
 * vì nội tâm hoá), và **cố tình chống phá** (tìm kẽ hở, hối lộ thực thi, giấu
 * chứng cứ, quy kết oan) — mọi đường đều mô phỏng đầy đủ. Có trừng trị theo
 * bậc (phạt, đánh, đày, tù, xử quyết) và quan lại thực thi có thể tham nhũng.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

// ===========================================================================
// Luật — statute & bộ luật
// ===========================================================================

/** Mức trọng của việc vi phạm. */
export type LawSeverity = 'petty' | 'misdemeanor' | 'felony' | 'capital';

/** Loại hình phạt. */
export type PunishmentKind = 'fine' | 'flogging' | 'stocks' | 'imprisonment' | 'exile' | 'execution';

/** Một điều luật do nhà nước ban hành. */
export interface Statute {
  id: string;
  name: string;
  domain: 'property' | 'violence' | 'tax' | 'morality' | 'state' | 'custom';
  description: string;
  /** Các loại hành vi bị cấm (khớp với kind của hành vi agent). */
  prohibitedActs: readonly string[];
  severity: LawSeverity;
  /** Hình phạt theo bậc nghiêm trọng của lần vi phạm. */
  penalties: Readonly<Record<'first' | 'repeat' | 'egregious', PunishmentKind>>;
  /** Năm ban hành. */
  enactedYear: number;
  /** Ai ban hành (quan lại/vua). */
  enactedBy: string;
  /** Sự chính danh của điều luật `[0, 1]` — thấp dễ bị coi là luật ác. */
  legitimacy: number;
  /** Độ mơ hồ của văn bản `[0, 1]` — cao tạo kẽ hở để chống phá. */
  ambiguity: number;
  repealed?: { year: number; by: string };
}

/** Tạo điều luật. */
export function createStatute(seed: {
  id: string;
  name: string;
  domain: Statute['domain'];
  description: string;
  prohibitedActs: readonly string[];
  severity?: LawSeverity;
  enactedYear?: number;
  enactedBy?: string;
  legitimacy?: number;
  ambiguity?: number;
}): Statute {
  const severity = seed.severity ?? 'misdemeanor';
  const penaltyTable: Record<LawSeverity, Record<'first' | 'repeat' | 'egregious', PunishmentKind>> = {
    petty: { first: 'fine', repeat: 'fine', egregious: 'stocks' },
    misdemeanor: { first: 'fine', repeat: 'stocks', egregious: 'flogging' },
    felony: { first: 'flogging', repeat: 'imprisonment', egregious: 'exile' },
    capital: { first: 'imprisonment', repeat: 'exile', egregious: 'execution' },
  };
  return {
    id: seed.id,
    name: seed.name,
    domain: seed.domain,
    description: seed.description,
    prohibitedActs: [...seed.prohibitedActs],
    severity,
    penalties: penaltyTable[severity],
    enactedYear: seed.enactedYear ?? 0,
    enactedBy: seed.enactedBy ?? 'hệ thống',
    legitimacy: clamp01(seed.legitimacy ?? 0.7),
    ambiguity: clamp01(seed.ambiguity ?? 0.2),
  };
}

/** Bộ luật của một quốc gia. */
export class LawCode {
  public readonly statutes = new Map<string, Statute>();
  public readonly repealLog: Array<{ statuteId: string; year: number; by: string }> = [];

  /** Ban hành điều luật. */
  public enact(statute: Statute): Statute {
    this.statutes.set(statute.id, { ...statute, repealed: undefined });
    return statute;
  }

  /** Bãi bỏ. */
  public repeal(statuteId: string, year: number, by: string): boolean {
    const statute = this.statutes.get(statuteId);
    if (!statute || statute.repealed) return false;
    statute.repealed = { year, by };
    this.repealLog.push({ statuteId, year, by });
    return true;
  }

  /** Sửa đổi (độ mơ hồ/legitimacy có thể thay đổi — tạo hoặc bịt kẽ hở). */
  public amend(statuteId: string, patch: Partial<Pick<Statute, 'ambiguity' | 'legitimacy' | 'severity' | 'description'>>): Statute | null {
    const statute = this.statutes.get(statuteId);
    if (!statute || statute.repealed) return null;
    Object.assign(statute, patch);
    return statute;
  }

  /** Tìm luật áp dụng cho một loại hành vi (chỉ luật còn hiệu lực). */
  public findForAct(actKind: string): Statute[] {
    return [...this.statutes.values()].filter(
      (statute) => !statute.repealed && statute.prohibitedActs.includes(actKind),
    );
  }

  public get activeCount(): number {
    return [...this.statutes.values()].filter((statute) => !statute.repealed).length;
  }
}

// ===========================================================================
// Đánh giá pháp lý (generic)
// ===========================================================================

/** Phán quyết legality cho một hành vi bất kỳ. */
export type LegalityVerdict = 'lawful' | 'illegal' | 'loophole' | 'unlegislated';

/** Kết quả đánh giá legality — generic cho mọi loại hành vi. */
export interface LegalityAssessment<TAct> {
  act: TAct;
  verdict: LegalityVerdict;
  matchedStatutes: Statute[];
  /** Đã dùng kẽ hở để lọt sổ chưa (illegal theo tinh thần nhưng legal theo chữ). */
  evaded: boolean;
  reasoning: string;
}

/**
 * Đánh giá pháp lý generic cho mọi hành vi: khớp luật cấm → illegal; luật mờ
 * + agent tinh ranh → loophole; không có luật → unlegislated.
 */
export function evaluateLegality<TAct extends { kind: string; cunning?: number }>(
  act: TAct,
  code: LawCode,
): LegalityAssessment<TAct> {
  const matched = code.findForAct(act.kind);
  if (matched.length === 0) {
    return { act, verdict: 'unlegislated', matchedStatutes: [], evaded: false, reasoning: `chưa có luật nào cấm "${act.kind}" — vùng xám pháp lý` };
  }
  // Chọn điều luật nặng nhất áp dụng.
  const order: LawSeverity[] = ['petty', 'misdemeanor', 'felony', 'capital'];
  matched.sort((a, b) => order.indexOf(b.severity) - order.indexOf(a.severity));
  const primary = matched[0];
  const cunning = clamp01(act.cunning ?? 0);
  const loopholeChance = clamp01(primary.ambiguity * 0.7 + cunning * 0.4 - 0.15);
  if (primary.ambiguity > 0.3 && cunning > 0.4 && loopholeChance > 0.45) {
    return {
      act,
      verdict: 'loophole',
      matchedStatutes: matched,
      evaded: true,
      reasoning: `luật "${primary.name}" mơ hồ (${Math.round(primary.ambiguity * 100)}%) — dùng kẽ hở chữ luật để thoát`,
    };
  }
  return {
    act,
    verdict: 'illegal',
    matchedStatutes: matched,
    evaded: false,
    reasoning: `vi phạm "${primary.name}" (${primary.severity})`,
  };
}

// ===========================================================================
// Tuân thủ vs chống phá — hồ sơ pháp lý của agent
// ===========================================================================

/** Động cơ tuân thủ. */
export type ComplianceMotive = 'fear' | 'legitimacy' | 'internalized' | 'opportunity' | 'defiance';

/** Hồ sơ tuân thủ pháp luật của một agent. */
export interface ComplianceProfile {
  entityId: string;
  /** Sợ hình phạt `[0, 1]`. */
  fearOfPunishment: number;
  /** Tôn trọng sự chính danh của nhà nước `[0, 1]`. */
  respectForLegitimacy: number;
  /** Đã nội tâm hoá luật thành đạo đức chưa `[0, 1]`. */
  internalization: number;
  /** Mức tinh ranh tìm kẽ hở `[0, 1]`. */
  cunning: number;
  violations: number;
  evasions: number;
  convictions: number;
}

/** Quyết định tuân thủ. */
export interface ComplianceDecision {
  comply: boolean;
  motive: ComplianceMotive;
  /** Tuân thủ lười biếng (chỉ vì sợ) hay thật lòng. */
  sincere: boolean;
  reasoning: string;
}

/** Quyết định tuân thủ một điều luật — không lệnh cấm cứng, chỉ tính cách + cơ chế. */
export function complianceDecision(
  profile: ComplianceProfile,
  statute: Statute,
  context: { temptation?: number; witnesses?: number; enforcerIntegrity?: number; desperate?: boolean },
): ComplianceDecision {
  const temptation = clamp01(context.temptation ?? 0.3);
  const enforcerIntegrity = clamp01(context.enforcerIntegrity ?? 0.7);
  // N huề kỵ của người thực thi giảm rào cản bên ngoài.
  const deterrence = clamp01(profile.fearOfPunishment * 0.5 + enforcerIntegrity * 0.3 + (context.witnesses ?? 0) / 10);
  const legitimacyPull = profile.respectForLegitimacy * statute.legitimacy;
  const inner = Math.max(profile.internalization, legitimacyPull);

  // Tham nhũng + tuyệt vọng mở đường chống phá: hối lộ thực thi.
  const briberyChance = clamp01(profile.cunning * 0.6 + (context.desperate ? 0.25 : 0) - enforcerIntegrity * 0.7);

  if (inner >= temptation) {
    const motive: ComplianceMotive = profile.internalization >= temptation ? 'internalized' : 'legitimacy';
    return { comply: true, motive, sincere: motive === 'internalized', reasoning: `nội tâm hoá/chính danh (${(inner * 100).toFixed(0)}%) vượt cám dỗ` };
  }
  if (briberyChance > 0.5 && deterrence < 0.6) {
    return { comply: false, motive: 'opportunity', sincere: false, reasoning: `hối lộ người thực thi (nhuệ ${Math.round(briberyChance * 100)}%) — luật chỉ là giấy` };
  }
  if (deterrence >= temptation) {
    return { comply: true, motive: 'fear', sincere: false, reasoning: 'chỉ sợ bị tóm — không ai nhìn là làm ngay' };
  }
  if (statute.legitimacy < 0.3 && profile.respectForLegitimacy < 0.4) {
    return { comply: false, motive: 'defiance', sincere: true, reasoning: `luật ác legitimacy ${Math.round(statute.legitimacy * 100)}% — coi thường công khai` };
  }
  return { comply: false, motive: 'opportunity', sincere: false, reasoning: `cám dỗ ${Math.round(temptation * 100)}% vượt răn đe` };
}

/** Cố tình chống phá: kết quả một đường chống phá. */
export type EvasionTactic = 'loophole' | 'bribery' | 'hide_evidence' | 'frame_someone' | 'forge_documents' | 'run_to_border';

export interface EvasionAttempt {
  entityId: string;
  statuteId: string;
  tactic: EvasionTactic;
  succeeded: boolean;
  /** Người thực thi bị kéo vào tham nhũng không. */
  enforcerCompromised: boolean;
  /** Đối tượng bị gán oan (frame_someone). */
  framedEntityId?: string;
  note: string;
}

/** Chọn chiến thuật chống phá theo cunning + cơ hội. */
export function chooseEvasionTactic(profile: ComplianceProfile, random: DeepRandom): EvasionTactic {
  const tactics: Array<{ value: EvasionTactic; weight: number }> = [
    { value: 'loophole', weight: 0.3 + profile.cunning * 0.6 },
    { value: 'bribery', weight: 0.25 + profile.cunning * 0.4 },
    { value: 'hide_evidence', weight: 0.3 },
    { value: 'forge_documents', weight: 0.1 + profile.cunning * 0.4 },
    { value: 'frame_someone', weight: 0.05 + profile.cunning * 0.35 },
    { value: 'run_to_border', weight: 0.15 },
  ];
  const total = tactics.reduce((sum, t) => sum + t.weight, 0);
  let roll = random.next() * total;
  for (const t of tactics) {
    roll -= t.weight;
    if (roll <= 0) return t.value;
  }
  return 'hide_evidence';
}

/**
 * Thực hiện chống phá pháp lý: mỗi chiến thuật có xác suất thành công riêng
 * phụ thuộc cunning, độ mơ hồ luật và liêm khiết của người thực thi.
 */
export function attemptEvasion(
  entityId: string,
  statute: Statute,
  profile: ComplianceProfile,
  enforcer: { id: string; integrity: number },
  random: DeepRandom,
): EvasionAttempt {
  const tactic = chooseEvasionTactic(profile, random);
  const cunning = profile.cunning;
  let succeeded = false;
  let enforcerCompromised = false;
  let framedEntityId: string | undefined;
  let note: string;

  switch (tactic) {
    case 'loophole': {
      succeeded = random.chance(clamp01(statute.ambiguity * 0.8 + cunning * 0.3));
      note = succeeded
        ? `nhìn rõ kẽ hở trong "${statute.name}" — hành vi hợp chữ nhưng nghịch lý`
        : 'luật chặt hơn tưởng tượng — kẽ hở đóng';
      break;
    }
    case 'bribery': {
      enforcerCompromised = random.chance(clamp01(1 - enforcer.integrity) * (0.4 + cunning * 0.5));
      succeeded = enforcerCompromised;
      note = enforcerCompromised
        ? `quan lại ${enforcer.id} (liêm khiết ${Math.round(enforcer.integrity * 100)}%) nhận hối lộ — hồ sơ biến mất`
        : `${enforcer.id} từ chối hối lộ và ghi nhận hành vi hối lộ thêm một tội`;
      break;
    }
    case 'hide_evidence': {
      succeeded = random.chance(clamp01(0.3 + cunning * 0.45));
      note = succeeded ? 'chứng cứ được giấu sạch' : 'dấu vết để lại — bị truy được';
      break;
    }
    case 'forge_documents': {
      succeeded = random.chance(clamp01(0.15 + cunning * 0.55));
      note = succeeded ? 'văn bản giả đủ tinh vi qua được vòng soát' : 'văn bản giả bị phát hiện dấu hiệu';
      break;
    }
    case 'frame_someone': {
      succeeded = random.chance(clamp01(0.1 + cunning * 0.4 - enforcer.integrity * 0.25));
      if (succeeded) framedEntityId = `innocent_${random.int(1, 999)}`;
      note = succeeded
        ? `gán tội cho ${framedEntityId ?? 'người vô tội'} — oan án được dựng thành`
        : 'kịch oan sụp đổ — bị lộ là dàn dựng';
      break;
    }
    case 'run_to_border': {
      succeeded = random.chance(clamp01(0.35 + cunning * 0.2));
      note = succeeded ? 'lọt qua biên giới khỏi tầm tài phận' : 'bị bắt giữ ở ải';
      break;
    }
  }

  if (succeeded) profile.evasions++;
  return {
    entityId,
    statuteId: statute.id,
    tactic,
    succeeded,
    enforcerCompromised,
    framedEntityId,
    note,
  };
}

// ===========================================================================
// Trừng trị
// ===========================================================================

/** Một bản án. */
export interface PunishmentRecord {
  id: string;
  entityId: string;
  statuteId: string;
  kind: PunishmentKind;
  severity: LawSeverity;
  tier: 'first' | 'repeat' | 'egregious';
  /** Án oan không. */
  wrongful: boolean;
  year: number;
  orderedBy: string;
  note: string;
}

/** Xác định bậc hình phạt theo tiền án + tính chất tăng nặng. */
export function sentenceTier(priorViolations: number, aggravation: number): 'first' | 'repeat' | 'egregious' {
  if (aggravation > 0.7) return 'egregious';
  return priorViolations > 1 ? 'repeat' : 'first';
}

/** Ban án: hình phạt theo bảng của điều luật; án oan có dấu riêng. */
export function sentence(options: {
  entityId: string;
  statute: Statute;
  priorViolations: number;
  aggravation?: number;
  year: number;
  orderedBy: string;
  wrongful?: boolean;
  seed?: number | string;
}): PunishmentRecord {
  const tier = sentenceTier(options.priorViolations, clamp01(options.aggravation ?? 0.2));
  const record: PunishmentRecord = {
    id: `punish_${hashSeed(`${options.entityId}:${options.statute.id}:${options.year}`).toString(16)}`,
    entityId: options.entityId,
    statuteId: options.statute.id,
    kind: options.statute.penalties[tier],
    severity: options.statute.severity,
    tier,
    wrongful: options.wrongful ?? false,
    year: options.year,
    orderedBy: options.orderedBy,
    note: `${options.statute.penalties[tier]} theo "${options.statute.name}" (bậc ${tier})${options.wrongful ? ' — ÁN OAN' : ''}`,
  };
  return record;
}

// ===========================================================================
// Quan lại thực thi
// ===========================================================================

/** Quan lại cầm luật. */
export interface LawEnforcer {
  id: string;
  office: string;
  /** Liêm khiết `[0, 1]` — thấp dễ nhận hối lộ. */
  integrity: number;
  /** Năng lực truy án `[0, 1]`. */
  competence: number;
  casesHandled: number;
  bribesTaken: number;
}

export function createEnforcer(id: string, office: string, integrity: number, competence: number): LawEnforcer {
  return {
    id,
    office,
    integrity: clamp01(integrity),
    competence: clamp01(competence),
    casesHandled: 0,
    bribesTaken: 0,
  };
}

/** Đúc kết hồ sơ pháp lý trống cho agent. */
export function createComplianceProfile(
  entityId: string,
  traits: Record<string, number>,
): ComplianceProfile {
  return {
    entityId,
    fearOfPunishment: clampRange((traits.riskTaking ?? 50) < 50 ? 0.7 : 0.4, 0, 1),
    respectForLegitimacy: clampRange((traits.conscientiousness ?? 50) / 100, 0, 1),
    internalization: clampRange((traits.conscientiousness ?? 50) / 100 * 0.7, 0, 1),
    cunning: clampRange((traits.creativity ?? 50) / 100 * 0.6 + (1 - (traits.conscientiousness ?? 50) / 100) * 0.4, 0, 1),
    violations: 0,
    evasions: 0,
    convictions: 0,
  };
}
