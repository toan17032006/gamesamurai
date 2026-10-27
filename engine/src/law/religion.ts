/**
 * @file religion.ts
 * @module @aetheria/engine/law/religion
 * @description Giáo hội & giáo phái: tôn giáo với giáo lý (tenets), hàng giáo
 * sĩ phân cấp (giáo chủ → giám mục → linh mục → tu sĩ → tín đồ), đức tin cá
 * nhân (piety) theo từng agent, cúng dường/quyên góp, thánh đường, **ly giáo**
 * (schism) tách ra giáo phái mới khi giáo lý trệch chính thống, **rút phép**
 * (excommunication) đè lên quyền thế tục, **bách hại** (tín đi vào bí mật,
 * tử đạo làm đức tin lan mạnh hơn), và phép màu (miracle) thổi bùng đức tin.
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

// ===========================================================================
// Giáo lý & tôn giáo
// ===========================================================================

/** Một điều giáo lý. */
export interface Tenet {
  id: string;
  name: string;
  description: string;
  /** Trọng số trong đời sống tín đồ `[0, 1]`. */
  weight: number;
  /** Bắt buộc hay khuyến khích. */
  strictness: 'commandment' | 'virtue';
}

/** Giáo lý của một tôn giáo. */
export interface Doctrine {
  deityName: string;
  afterlife: 'heaven' | 'reincarnation' | 'oblivion' | 'ancestor_hall';
  tenets: Tenet[];
  /** Tông(s) thiêng liêng được dạy. */
  sacredPractices: readonly string[];
}

/** Hàng giáo sĩ. */
export type ClergyRank = 'patriarch' | 'bishop' | 'priest' | 'monk' | 'lay_believer';

export const CLERGY_ORDER: Readonly<Record<ClergyRank, number>> = Object.freeze({
  patriarch: 0,
  bishop: 1,
  priest: 2,
  monk: 3,
  lay_believer: 4,
});

/** Đức tin cá nhân của một agent. */
export interface PietyProfile {
  entityId: string;
  religionId: string | null;
  /** Đức tin `[0, 1]`. */
  faith: number;
  /** Cấp trong hàng giáo sĩ (lay_believer = tín đồ thường). */
  clergyRank: ClergyRank;
  /** Số lần thực hành thiêng (cầu nguyện, lễ…). */
  devotions: number;
  /** Tội theo giáo lý — đè đức tin xuống. */
  sins: number;
  /** Tử đạo/đang bị bách hại → đức tin thép hoá. */
  martyrSpirit: number;
}

/** Một tôn giáo / giáo hội đang hoạt động. */
export interface Religion {
  id: string;
  name: string;
  doctrine: Doctrine;
  founderId: string;
  foundedYear: number;
  /** Giáo chủ hiện tại. */
  patriarchId: string;
  /** Độ thuần chính `[0, 1]` — thấp là đất để ly giáo mọc. */
  orthodoxy: number;
  /** Điền trang/thánh đường. */
  temples: Array<{ id: string; name: string; locationId?: string; grandeur: number }>;
  /** Quỹ cúng dường. */
  treasury: number;
  /** Số tín đồ. */
  followersCount: number;
  /** Giáo phái tách ra từ đây. */
  schismIds: string[];
  /** Đang bị quốc gia nào bách hại. */
  persecutedBy: string[];
}

/** Tạo giáo lý. */
export function createDoctrine(options: {
  deityName: string;
  afterlife?: Doctrine['afterlife'];
  tenets?: ReadonlyArray<{ id: string; name: string; description: string; weight?: number; strictness?: Tenet['strictness'] }>;
  sacredPractices?: readonly string[];
}): Doctrine {
  const defaults: Tenet[] = [
    { id: 'reverence', name: 'kính sợ thần linh', description: 'thờ phụng đều đặn', weight: 0.8, strictness: 'commandment' },
    { id: 'charity', name: 'bố thí', description: 'giúp người nghèo khó', weight: 0.6, strictness: 'virtue' },
    { id: 'chastity_of_soul', name: 'trong sạch tâm linh', description: 'không thề dối trước thần', weight: 0.5, strictness: 'virtue' },
  ];
  return {
    deityName: options.deityName,
    afterlife: options.afterlife ?? 'heaven',
    tenets: (options.tenets ?? defaults).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      weight: clamp01(t.weight ?? 0.5),
      strictness: t.strictness ?? 'virtue',
    })),
    sacredPractices: options.sacredPractices ?? ['cầu nguyện', 'dâng lễ'],
  };
}

// ===========================================================================
// Giáo hội — engine
// ===========================================================================

/** Động cơ tôn giáo của thế giới — nhiều giáo hội, nhiều giáo phái. */
export class ChurchEngine {
  public readonly religions = new Map<string, Religion>();
  public readonly piety = new Map<string, PietyProfile>();
  public readonly miracles: Array<{ religionId: string; year: number; description: string; faithSurge: number }> = [];
  public readonly schismLog: Array<{ parentId: string; childId: string; year: number; cause: string }> = [];
  private readonly random: DeepRandom;
  public readonly seed: number | string;

  constructor(options: { seed?: number | string } = {}) {
    this.seed = options.seed ?? 'aetheria-church';
    this.random = new DeepRandom(`${this.seed}:church`);
  }

  /** Lấy/khởi tạo đức tin của agent (vô đạo → faith 0). */
  public pietyOf(entityId: string): PietyProfile {
    let profile = this.piety.get(entityId);
    if (!profile) {
      profile = { entityId, religionId: null, faith: 0, clergyRank: 'lay_believer', devotions: 0, sins: 0, martyrSpirit: 0 };
      this.piety.set(entityId, profile);
    }
    return profile;
  }

  /** Thành lập giáo hội mới. */
  public foundReligion(options: {
    id: string;
    name: string;
    founderId: string;
    founderName: string;
    doctrine: Doctrine;
    year: number;
    templeName?: string;
  }): Religion {
    const religion: Religion = {
      id: options.id,
      name: options.name,
      doctrine: options.doctrine,
      founderId: options.founderId,
      foundedYear: options.year,
      patriarchId: options.founderId,
      orthodoxy: 1,
      temples: [{ id: `temple_${hashSeed(`${options.id}:${options.year}`).toString(16)}`, name: options.templeName ?? `Đền thờ ${options.doctrine.deityName}`, grandeur: 0.3 }],
      treasury: 20,
      followersCount: 0,
      schismIds: [],
      persecutedBy: [],
    };
    this.religions.set(options.id, religion);
    // Người sáng lập tự làm giáo chủ, đức tin trọn.
    const founderPiety = this.pietyOf(options.founderId);
    founderPiety.religionId = options.id;
    founderPiety.faith = 1;
    founderPiety.clergyRank = 'patriarch';
    religion.followersCount = 1;
    return religion;
  }

  /** Quy đổi sang một tôn giáo — conviction quyết định đức tin ban đầu. */
  public convert(entityId: string, religionId: string, conviction: number): PietyProfile | null {
    const religion = this.religions.get(religionId);
    if (!religion) return null;
    if (religion.persecutedBy.length > 0) {
      // Quy đổi vào đạo bị bách hại cần đức tin thép — conviction phải cao.
      if (clamp01(conviction) < 0.6) return null;
    }
    const profile = this.pietyOf(entityId);
    if (profile.religionId && profile.religionId !== religionId) {
      const old = this.religions.get(profile.religionId);
      if (old) old.followersCount = Math.max(0, old.followersCount - 1);
    }
    profile.religionId = religionId;
    profile.faith = clamp01(Math.max(profile.faith * 0.5, clamp01(conviction)));
    profile.clergyRank = 'lay_believer';
    religion.followersCount++;
    return profile;
  }

  /** Rời đạo. */
  public apostatize(entityId: string): boolean {
    const profile = this.piety.get(entityId);
    if (!profile?.religionId) return false;
    const religion = this.religions.get(profile.religionId);
    if (religion) religion.followersCount = Math.max(0, religion.followersCount - 1);
    profile.religionId = null;
    profile.faith = clamp01(profile.faith * 0.3);
    profile.clergyRank = 'lay_believer';
    return true;
  }

  /** Thực hành thiêng (cầu nguyện/dâng lễ): đức tin tăng dần, giới hạn. */
  public practiceDevotion(entityId: string): number {
    const profile = this.pietyOf(entityId);
    if (!profile.religionId) return profile.faith;
    profile.devotions++;
    profile.faith = clamp01(profile.faith + 0.03 * (1 - profile.faith));
    return profile.faith;
  }

  /** Phạm tội theo giáo lý: đức tin rơi, sĩ phu giáo hội có thể đòi lễ sám hối. */
  public sin(entityId: string, severity: number): number {
    const profile = this.pietyOf(entityId);
    profile.sins += clamp01(severity);
    profile.faith = clamp01(profile.faith - clamp01(severity) * 0.12);
    return profile.faith;
  }

  /** Sám hối: tội giảm, đức tin hồi. */
  public repent(entityId: string, sincerity: number): number {
    const profile = this.pietyOf(entityId);
    profile.sins = clamp01(profile.sins - clamp01(sincerity) * 0.5);
    profile.faith = clamp01(profile.faith + clamp01(sincerity) * 0.15);
    return profile.faith;
  }

  /** Thăng cấp giáo sĩ: tín đồ ưu tú được phong. */
  public ordain(religionId: string, entityId: string, rank: ClergyRank): boolean {
    const religion = this.religions.get(religionId);
    const profile = this.pietyOf(entityId);
    if (!religion || profile.religionId !== religionId) return false;
    if (rank === 'patriarch' && profile.clergyRank !== 'bishop') return false; // chỉ giám mục kế nhiệm
    profile.clergyRank = rank;
    if (rank === 'patriarch') religion.patriarchId = entityId;
    return true;
  }

  /** Cúng dường: quỹ giáo hội tăng, grandeur thánh đường lên. */
  public donate(entityId: string, amount: number, religionId?: string): number {
    const profile = this.pietyOf(entityId);
    const target = religionId ?? profile.religionId;
    if (!target) return 0;
    const religion = this.religions.get(target);
    if (!religion) return 0;
    const given = Math.max(0, amount);
    religion.treasury += given;
    const temple = religion.temples[0];
    if (temple) temple.grandeur = clamp01(temple.grandeur + given * 0.001);
    profile.faith = clamp01(profile.faith + given * 0.0005);
    return religion.treasury;
  }

  /**
   * Phép màu: sự kiện siêu nhiên (hoặc trùng hợp ngẫu nhiên được kể lại) —
   * đức tin toàn giáo hội bùng lên, follower tăng từ người ngoài nhìn thấy.
   */
  public miracle(religionId: string, year: number, description: string): { faithSurge: number; converts: number } {
    const religion = this.religions.get(religionId);
    if (!religion) return { faithSurge: 0, converts: 0 };
    const faithSurge = clampRange(this.random.range(0.15, 0.45), 0, 1);
    let converts = 0;
    for (const profile of this.piety.values()) {
      if (profile.religionId === religionId) {
        profile.faith = clamp01(profile.faith + faithSurge * 0.4);
      } else if (profile.religionId === null && this.random.chance(faithSurge * 0.3)) {
        profile.religionId = religionId;
        profile.faith = clamp01(faithSurge * 0.8);
        religion.followersCount++;
        converts++;
      }
    }
    this.miracles.push({ religionId, year, description, faithSurge: Math.round(faithSurge * 100) / 100 });
    return { faithSurge: Math.round(faithSurge * 100) / 100, converts };
  }

  /**
   * Ly giáo: bất đồng giáo lý tách thành giáo phái mới. Nguyên nhân: giáo chủ
   * tha hoá, giáo lý newfound, tranh quyền. Orthodoxy giáo hội mẹ rớt; giáo
   * phái con mượn một phần tín đồ không by heart.
   */
  public schism(
    parentId: string,
    options: { sectId: string; sectName: string; leaderId: string; leaderName: string; cause: string; year: number; doctrineOverride?: Partial<Doctrine> },
  ): Religion | null {
    const parent = this.religions.get(parentId);
    if (!parent) return null;
    const doctrine: Doctrine = {
      ...parent.doctrine,
      ...options.doctrineOverride,
      tenets: (options.doctrineOverride?.tenets ?? parent.doctrine.tenets).map((tenet) => ({ ...tenet })),
    };
    const sect = this.foundReligion({
      id: options.sectId,
      name: options.sectName,
      founderId: options.leaderId,
      founderName: options.leaderName,
      doctrine,
      year: options.year,
      templeName: `Thánh đường ${options.sectName}`,
    });
    sect.orthodoxy = 0.75; // giáo phái con tự coi mình là chính thống hơn
    parent.orthodoxy = clamp01(parent.orthodoxy - 0.2);
    parent.schismIds.push(options.sectId);
    // Một phần ba tín đồ thường theo người dẫn mới.
    let defectors = 0;
    for (const profile of this.piety.values()) {
      if (profile.religionId === parentId && profile.clergyRank === 'lay_believer' && this.random.chance(0.33)) {
        profile.religionId = options.sectId;
        profile.faith = clamp01(profile.faith * 0.9);
        defectors++;
      }
    }
    parent.followersCount = Math.max(0, parent.followersCount - defectors);
    this.schismLog.push({ parentId, childId: options.sectId, year: options.year, cause: options.cause });
    return sect;
  }

  /**
   * Rút phép thông công: giáo hội trừng trị member — mất chỗ trong cộng đồng
   * tín đồ, legitimacy xã hội của họ sụp (nối với hệ thống pháp lý thế tục).
   */
  public excommunicate(religionId: string, entityId: string): boolean {
    const religion = this.religions.get(religionId);
    const profile = this.pietyOf(entityId);
    if (!religion || profile.religionId !== religionId) return false;
    religion.followersCount = Math.max(0, religion.followersCount - 1);
    profile.clergyRank = 'lay_believer';
    profile.faith = clamp01(profile.faith * 0.4);
    profile.sins = clamp01(profile.sins + 0.3);
    return true;
  }

  /**
   * Bách hại: quốc gia đàn áp một tôn giáo — tín đồ rút vào bí mật; một phần
   * bỏ đạo, một phần thép hoá (martyr spirit) và đức tin lan mạnh hơn sau đàn áp.
   */
  public persecute(religionId: string, persecutorStateId: string, severity: number): {
    abandoned: number;
    hardened: number;
    note: string;
  } {
    const religion = this.religions.get(religionId);
    if (!religion) return { abandoned: 0, hardened: 0, note: 'tôn giáo không tồn tại' };
    if (!religion.persecutedBy.includes(persecutorStateId)) religion.persecutedBy.push(persecutorStateId);
    const s = clamp01(severity);
    let abandoned = 0;
    let hardened = 0;
    for (const profile of this.piety.values()) {
      if (profile.religionId !== religionId) continue;
      if (this.random.chance(s * 0.5)) {
        profile.religionId = null;
        profile.faith = clamp01(profile.faith * 0.3);
        abandoned++;
      } else {
        profile.martyrSpirit = clamp01(profile.martyrSpirit + s * 0.4);
        profile.faith = clamp01(profile.faith + s * 0.15);
        hardened++;
      }
    }
    religion.followersCount = Math.max(0, religion.followersCount - abandoned);
    return {
      abandoned,
      hardened,
      note: `bách hại ${religion.name} (mức ${Math.round(s * 100)}%): ${abandoned} bỏ đạo, ${hardened} thép hoá thành tử đạo — máu tử đạo là hạt giống đức tin`,
    };
  }

  /** Chấm dứt bách hại. */
  public tolerate(religionId: string, persecutorStateId: string): boolean {
    const religion = this.religions.get(religionId);
    if (!religion) return false;
    religion.persecutedBy = religion.persecutedBy.filter((id) => id !== persecutorStateId);
    return true;
  }

  /** Sức ảnh hưởng giáo hội: tín đồ × đức tin trung bình × grandeur. */
  public influenceOf(religionId: string): number {
    const religion = this.religions.get(religionId);
    if (!religion) return 0;
    let faithSum = 0;
    let count = 0;
    for (const profile of this.piety.values()) {
      if (profile.religionId === religionId) {
        faithSum += profile.faith;
        count++;
      }
    }
    const avgFaith = count > 0 ? faithSum / count : 0;
    const grandeur = religion.temples[0]?.grandeur ?? 0;
    return clamp01((count / 100) * 0.5 + avgFaith * 0.3 + grandeur * 0.2);
  }

  public stats(): { religions: number; believers: number; sects: number; miracles: number } {
    let believers = 0;
    for (const profile of this.piety.values()) if (profile.religionId) believers++;
    const sects = [...this.religions.values()].reduce((sum, r) => sum + r.schismIds.length, 0);
    return { religions: this.religions.size, believers, sects, miracles: this.miracles.length };
  }
}
