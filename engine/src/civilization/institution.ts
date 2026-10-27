/**
 * @file institution.ts
 * @module @aetheria/engine/civilization/institution
 * @description Thiết chế xã hội: gia đình, thị tộc, tôn giáo, giáo dục, luật
 * pháp, quân đội, kinh tế, y tế, khoa học và chính quyền. Mỗi thiết chế có
 * chính danh, hiệu lực, tham nhũng, tính bao trùm và độ bảo thủ; cải cách làm
 * thay đổi cấu trúc nhưng có thể mất chính danh ngắn hạn.
 */

import { clamp01, clampRange } from '../deeplearning/random.js';

/** Loại thiết chế. */
export type InstitutionType =
  | 'family'
  | 'clan'
  | 'religion'
  | 'education'
  | 'law'
  | 'military'
  | 'economy'
  | 'health'
  | 'science'
  | 'governance';

/** Một thiết chế. */
export interface Institution {
  id: string;
  type: InstitutionType;
  name: string;
  description: string;
  level: number;
  /** Mức chấp nhận của xã hội `[0, 1]`. */
  legitimacy: number;
  /** Năng lực thực thi `[0, 1]`. */
  efficiency: number;
  /** Tham nhũng `[0, 1]`. */
  corruption: number;
  /** Mức bao trùm các nhóm yếu thế `[0, 1]`. */
  inclusivity: number;
  /** Xu hướng bám truyền thống `[0, 1]`. */
  traditionBias: number;
  /** Đang bảo thủ hay cấp tiến `[0, 1]`. */
  conservative: number;
  establishedYear: number;
  budget: number;
}

/** Bối cảnh vận hành thiết chế. */
export interface InstitutionContext {
  prosperity?: number;
  education?: number;
  equality?: number;
  threat?: number;
  corruptionPressure?: number;
  year?: number;
}

/** Ảnh chụp thiết chế. */
export interface InstitutionSnapshot {
  institutions: Institution[];
}

/** Định nghĩa thiết chế mặc định. */
export const DEFAULT_INSTITUTIONS: readonly Omit<Institution, 'establishedYear' | 'budget'>[] = Object.freeze([
  {
    id: 'family',
    type: 'family',
    name: 'Gia đình',
    description: 'Chăm sóc trẻ em, người già và truyền nghề.',
    level: 2,
    legitimacy: 0.8,
    efficiency: 0.6,
    corruption: 0.05,
    inclusivity: 0.6,
    traditionBias: 0.7,
    conservative: 0.65,
  },
  {
    id: 'clan',
    type: 'clan',
    name: 'Thị tộc',
    description: 'Mạng lưới họ hàng hỗ trợ lẫn nhau và giải quyết tranh chấp.',
    level: 2,
    legitimacy: 0.65,
    efficiency: 0.5,
    corruption: 0.12,
    inclusivity: 0.4,
    traditionBias: 0.8,
    conservative: 0.75,
  },
  {
    id: 'religion',
    type: 'religion',
    name: 'Tôn giáo',
    description: 'Nghi lễ, đạo đức và an ủi tinh thần.',
    level: 2,
    legitimacy: 0.7,
    efficiency: 0.5,
    corruption: 0.1,
    inclusivity: 0.35,
    traditionBias: 0.85,
    conservative: 0.8,
  },
  {
    id: 'education',
    type: 'education',
    name: 'Giáo dục',
    description: 'Truyền đọc viết, tri thức và kỹ năng.',
    level: 1,
    legitimacy: 0.6,
    efficiency: 0.4,
    corruption: 0.08,
    inclusivity: 0.45,
    traditionBias: 0.5,
    conservative: 0.45,
  },
  {
    id: 'law',
    type: 'law',
    name: 'Luật pháp',
    description: 'Quy tắc chung, toà án và hình phạt.',
    level: 1,
    legitimacy: 0.55,
    efficiency: 0.4,
    corruption: 0.2,
    inclusivity: 0.35,
    traditionBias: 0.6,
    conservative: 0.6,
  },
  {
    id: 'military',
    type: 'military',
    name: 'Quân đội',
    description: 'Bảo vệ cộng đồng và mở rộng lãnh thổ.',
    level: 2,
    legitimacy: 0.5,
    efficiency: 0.55,
    corruption: 0.15,
    inclusivity: 0.3,
    traditionBias: 0.7,
    conservative: 0.7,
  },
  {
    id: 'economy',
    type: 'economy',
    name: 'Kinh tế',
    description: 'Trao đổi, thuế và phân phối nguồn lực.',
    level: 1,
    legitimacy: 0.55,
    efficiency: 0.45,
    corruption: 0.18,
    inclusivity: 0.4,
    traditionBias: 0.4,
    conservative: 0.5,
  },
  {
    id: 'health',
    type: 'health',
    name: 'Y tế',
    description: 'Chăm sóc người bệnh và phòng dịch.',
    level: 1,
    legitimacy: 0.6,
    efficiency: 0.35,
    corruption: 0.1,
    inclusivity: 0.5,
    traditionBias: 0.4,
    conservative: 0.4,
  },
  {
    id: 'science',
    type: 'science',
    name: 'Khoa học',
    description: 'Nghiên cứu, kiểm chứng và sáng chế.',
    level: 0,
    legitimacy: 0.45,
    efficiency: 0.3,
    corruption: 0.05,
    inclusivity: 0.55,
    traditionBias: 0.2,
    conservative: 0.2,
  },
  {
    id: 'governance',
    type: 'governance',
    name: 'Chính quyền',
    description: 'Ra quyết định, thu thuế và giữ trật tự.',
    level: 1,
    legitimacy: 0.55,
    efficiency: 0.45,
    corruption: 0.2,
    inclusivity: 0.3,
    traditionBias: 0.6,
    conservative: 0.6,
  },
]);

/** Sổ đăng ký thiết chế của một nền văn minh. */
export class InstitutionRegistry {
  public readonly institutions = new Map<string, Institution>();

  constructor(entries: readonly Omit<Institution, 'establishedYear' | 'budget'>[] = DEFAULT_INSTITUTIONS, year = 0) {
    for (const entry of entries) {
      this.institutions.set(entry.id, { ...entry, establishedYear: year, budget: 0 });
    }
  }

  /** Lấy thiết chế. */
  public get(id: string): Institution | undefined {
    return this.institutions.get(id);
  }

  /** Thiết chế theo loại. */
  public byType(type: InstitutionType): Institution[] {
    return [...this.institutions.values()].filter((institution) => institution.type === type);
  }

  /** Thêm thiết chế mới. */
  public add(institution: Omit<Institution, 'establishedYear' | 'budget'>, year = 0): Institution {
    const record: Institution = { ...institution, establishedYear: year, budget: 0 };
    this.institutions.set(record.id, record);
    return record;
  }

  /** Cấp ngân sách cho một thiết chế. */
  public fund(id: string, amount: number): boolean {
    const institution = this.institutions.get(id);
    if (!institution) return false;
    institution.budget += Math.max(0, amount);
    return true;
  }

  /**
   * Cập nhật tất cả thiết chế qua thời gian. Hiệu lực tăng theo ngân sách và
   * học vấn; tham nhũng tăng khi chính danh thấp; bảo thủ giảm khi dân trí và
   * bình đẳng tăng, nhưng tăng khi có mối đe doạ.
   */
  public tick(years = 1, context: InstitutionContext = {}): void {
    const elapsed = clampRange(years, 0, 1000);
    if (elapsed <= 0) return;
    const prosperity = clamp01(context.prosperity ?? 0.5);
    const education = clamp01(context.education ?? 0.3);
    const equality = clamp01(context.equality ?? 0.4);
    const threat = clamp01(context.threat ?? 0.2);
    const corruptionPressure = clamp01(context.corruptionPressure ?? 0.3);
    const speed = Math.min(1, elapsed / 25);

    for (const institution of this.institutions.values()) {
      const funding = clamp01(institution.budget / Math.max(1, 20 * (institution.level + 1)));
      institution.budget = Math.max(0, institution.budget * Math.exp(-elapsed / 120));
      const efficiencyTarget = clamp01(
        0.2 + funding * 0.35 + prosperity * 0.2 + education * 0.15 - institution.corruption * 0.3 - threat * 0.05,
      );
      institution.efficiency = clamp01(institution.efficiency + (efficiencyTarget - institution.efficiency) * speed * 0.5);

      const legitimacyTarget = clamp01(
        0.25 + institution.efficiency * 0.35 + institution.inclusivity * 0.2 - institution.corruption * 0.3 + prosperity * 0.1,
      );
      institution.legitimacy = clamp01(institution.legitimacy + (legitimacyTarget - institution.legitimacy) * speed * 0.4);

      const corruptionTarget = clamp01(
        corruptionPressure * 0.45 +
          (1 - institution.legitimacy) * 0.3 +
          (1 - education) * 0.15 +
          institution.traditionBias * 0.1,
      );
      institution.corruption = clamp01(institution.corruption + (corruptionTarget - institution.corruption) * speed * 0.4);

      const conservativeTarget = clamp01(
        institution.traditionBias * 0.5 + threat * 0.3 + (1 - education) * 0.1 + (1 - equality) * 0.1,
      );
      institution.conservative = clamp01(institution.conservative + (conservativeTarget - institution.conservative) * speed * 0.3);
      institution.inclusivity = clamp01(institution.inclusivity + (equality - institution.inclusivity) * speed * 0.15);
    }
  }

  /**
   * Cải cách thiết chế. `progressive` giảm bảo thủ và tăng bao trùm;
   * `conservative` làm ngược lại. Cải cách mạnh mất chính danh tạm thời.
   */
  public reform(
    id: string,
    direction: 'progressive' | 'conservative',
    amount = 0.1,
  ): { success: boolean; legitimacyChange: number; detail: string } {
    const institution = this.institutions.get(id);
    if (!institution) return { success: false, legitimacyChange: 0, detail: 'Thiết chế không tồn tại' };
    const strength = clamp01(amount);
    const sign = direction === 'progressive' ? -1 : 1;
    institution.conservative = clamp01(institution.conservative + sign * strength);
    institution.inclusivity = clamp01(institution.inclusivity - sign * strength * 0.6);
    institution.traditionBias = clamp01(institution.traditionBias + sign * strength * 0.4);
    const legitimacyChange = -strength * 0.12;
    institution.legitimacy = clamp01(institution.legitimacy + legitimacyChange);
    return {
      success: true,
      legitimacyChange,
      detail: `${direction === 'progressive' ? 'Cải cách tiến bộ' : 'Củng cố truyền thống'} ${institution.name}, chính danh ${(legitimacyChange * 100).toFixed(0)}%.`,
    };
  }

  /** Đầu tư nâng cấp quy mô thiết chế. */
  public upgrade(id: string, budget = 20): boolean {
    const institution = this.institutions.get(id);
    if (!institution || budget < 10) return false;
    institution.level = Math.min(5, institution.level + 1);
    institution.budget += budget;
    institution.efficiency = clamp01(institution.efficiency + 0.05);
    return true;
  }

  /** Chất lượng trung bình của thiết chế `[0, 1]`. */
  public averageQuality(): number {
    const list = [...this.institutions.values()];
    if (list.length === 0) return 0;
    let total = 0;
    for (const institution of list) {
      total += clamp01(institution.efficiency * 0.4 + institution.legitimacy * 0.3 + institution.inclusivity * 0.2 - institution.corruption * 0.3);
    }
    return clamp01(total / list.length);
  }

  /** Chỉ số tham nhũng trung bình. */
  public corruptionIndex(): number {
    const list = [...this.institutions.values()];
    if (list.length === 0) return 0;
    return list.reduce((sum, institution) => sum + institution.corruption, 0) / list.length;
  }

  /** Độ bảo thủ trung bình. */
  public conservatismIndex(): number {
    const list = [...this.institutions.values()];
    if (list.length === 0) return 0;
    return list.reduce((sum, institution) => sum + institution.conservative, 0) / list.length;
  }

  /** Đóng góp vào chỉ số văn minh `[0, 1]`. */
  public civilityContribution(): number {
    return clamp01(
      this.averageQuality() * 0.5 +
        (1 - this.corruptionIndex()) * 0.25 +
        (1 - this.conservatismIndex()) * 0.25,
    );
  }

  /** Mô tả ngắn. */
  public describe(): string {
    return `${this.institutions.size} thiết chế, chất lượng ${(this.averageQuality() * 100).toFixed(0)}%, ` +
      `tham nhũng ${(this.corruptionIndex() * 100).toFixed(0)}%, bảo thủ ${(this.conservatismIndex() * 100).toFixed(0)}%.`;
  }

  /** Ảnh chụp. */
  public snapshot(): InstitutionSnapshot {
    return { institutions: [...this.institutions.values()].map((institution) => ({ ...institution })) };
  }

  /** Khôi phục. */
  public static fromSnapshot(snapshot: InstitutionSnapshot): InstitutionRegistry {
    const registry = new InstitutionRegistry([], 0);
    for (const institution of snapshot.institutions) {
      registry.institutions.set(institution.id, { ...institution });
    }
    return registry;
  }
}
