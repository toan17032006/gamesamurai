/**
 * @file culture.ts
 * @module @aetheria/engine/civilization/culture
 * @description Văn hoá: hệ giá trị, truyền thống, điều cấm kỵ, chuẩn mực,
 * thần thoại, ngôn ngữ và nghệ thuật. Văn hoá tiến hoá theo thịnh vượng, mối
 * đe doạ, tiếp xúc và đổi mới; có thể dung hợp hoặc xung đột với nền khác.
 */

import { LifeRandom } from '../life/stochastic.js';
import { clamp01, clampRange } from '../deeplearning/random.js';

/** Các trục giá trị văn hoá `[0, 1]`. */
export type CulturalValue =
  | 'tradition'
  | 'openness'
  | 'cooperation'
  | 'aggression'
  | 'piety'
  | 'honor'
  | 'equality'
  | 'innovation'
  | 'hospitality'
  | 'frugality';

/** Bản ghi giá trị văn hoá. */
export type CulturalValues = Record<CulturalValue, number>;

/** Một truyền thống. */
export interface Tradition {
  id: string;
  name: string;
  description: string;
  ageYears: number;
  participation: number;
  sacred: boolean;
  adaptive: boolean;
  origin: string;
}

/** Một điều cấm kỵ. */
export interface Taboo {
  id: string;
  name: string;
  prohibition: string;
  severity: number;
  reason: string;
}

/** Một chuẩn mực xã hội. */
export interface Norm {
  id: string;
  name: string;
  expectation: string;
  enforcement: number;
  fairness: number;
}

/** Một thần thoại/nhân vật biểu tượng. */
export interface Myth {
  id: string;
  title: string;
  moral: string;
  heroes: string[];
  ageYears: number;
}

/** Bối cảnh tiến hoá văn hoá. */
export interface CultureContext {
  prosperity?: number;
  threat?: number;
  contactRate?: number;
  innovation?: number;
  scarcity?: number;
}

/** Ảnh chụp văn hoá. */
export interface CultureSnapshot {
  id: string;
  name: string;
  values: CulturalValues;
  traditions: Tradition[];
  taboos: Taboo[];
  norms: Norm[];
  myths: Myth[];
  language: string;
  artStyle: string;
  ageYears: number;
}

/** Giá trị khởi thuỷ của một nền văn hoá sơ khai. */
export const DEFAULT_CULTURAL_VALUES: CulturalValues = Object.freeze({
  tradition: 0.7,
  openness: 0.3,
  cooperation: 0.55,
  aggression: 0.4,
  piety: 0.6,
  honor: 0.65,
  equality: 0.35,
  innovation: 0.25,
  hospitality: 0.5,
  frugality: 0.7,
});

/** Văn hoá của một cộng đồng. */
export class Culture {
  public readonly id: string;
  public name: string;
  public values: CulturalValues;
  public readonly traditions = new Map<string, Tradition>();
  public readonly taboos = new Map<string, Taboo>();
  public readonly norms = new Map<string, Norm>();
  public readonly myths = new Map<string, Myth>();
  public language: string;
  public artStyle: string;
  public ageYears = 0;
  private readonly random: LifeRandom;
  private counter = 0;

  constructor(config: {
    id: string;
    name?: string;
    values?: Partial<CulturalValues>;
    language?: string;
    artStyle?: string;
    seed?: number | string;
  }) {
    this.id = config.id;
    this.name = config.name ?? config.id;
    this.values = { ...DEFAULT_CULTURAL_VALUES, ...(config.values ?? {}) };
    this.language = config.language ?? `tiếng ${this.name}`;
    this.artStyle = config.artStyle ?? 'hình khắc và nhịp điệu';
    this.random = new LifeRandom(config.seed ?? config.id);
  }

  /** Truyền thống nổi bật nhất. */
  public get oldestTradition(): Tradition | null {
    let oldest: Tradition | null = null;
    for (const tradition of this.traditions.values()) {
      if (!oldest || tradition.ageYears > oldest.ageYears) oldest = tradition;
    }
    return oldest;
  }

  /** Chỉ số bảo thủ `[0, 1]`. */
  public get conservatism(): number {
    return clamp01(
      this.values.tradition * 0.3 +
        this.values.piety * 0.2 +
        this.values.honor * 0.15 +
        (1 - this.values.openness) * 0.2 +
        (1 - this.values.innovation) * 0.15,
    );
  }

  /** Chỉ số khoan dung `[0, 1]`. */
  public get tolerance(): number {
    return clamp01(
      this.values.openness * 0.4 +
        this.values.equality * 0.3 +
        this.values.hospitality * 0.15 +
        (1 - this.values.aggression) * 0.15,
    );
  }

  /** Sức sống văn hoá `[0, 1]` dựa trên mức tham gia truyền thống. */
  public get vitality(): number {
    if (this.traditions.size === 0) return 0.2;
    let participation = 0;
    for (const tradition of this.traditions.values()) participation += tradition.participation;
    return clamp01(participation / this.traditions.size);
  }

  /** Thêm truyền thống. */
  public addTradition(
    name: string,
    options: {
      description?: string;
      participation?: number;
      sacred?: boolean;
      adaptive?: boolean;
      origin?: string;
    } = {},
  ): Tradition {
    const tradition: Tradition = {
      id: `tradition_${this.id}_${++this.counter}`,
      name,
      description: options.description ?? '',
      ageYears: 0,
      participation: clamp01(options.participation ?? 0.6),
      sacred: options.sacred ?? false,
      adaptive: options.adaptive ?? true,
      origin: options.origin ?? 'truyền lại',
    };
    this.traditions.set(tradition.id, tradition);
    return tradition;
  }

  /** Thêm điều cấm kỵ. */
  public addTaboo(name: string, prohibition: string, options: { severity?: number; reason?: string } = {}): Taboo {
    const taboo: Taboo = {
      id: `taboo_${this.id}_${++this.counter}`,
      name,
      prohibition,
      severity: clamp01(options.severity ?? 0.6),
      reason: options.reason ?? 'truyền thống tổ tiên',
    };
    this.taboos.set(taboo.id, taboo);
    return taboo;
  }

  /** Thêm chuẩn mực. */
  public addNorm(
    name: string,
    expectation: string,
    options: { enforcement?: number; fairness?: number } = {},
  ): Norm {
    const norm: Norm = {
      id: `norm_${this.id}_${++this.counter}`,
      name,
      expectation,
      enforcement: clamp01(options.enforcement ?? 0.5),
      fairness: clamp01(options.fairness ?? 0.5),
    };
    this.norms.set(norm.id, norm);
    return norm;
  }

  /** Thêm thần thoại. */
  public addMyth(title: string, moral: string, heroes: string[] = []): Myth {
    const myth: Myth = {
      id: `myth_${this.id}_${++this.counter}`,
      title,
      moral,
      heroes: [...heroes],
      ageYears: 0,
    };
    this.myths.set(myth.id, myth);
    return myth;
  }

  /**
   * Tiến hoá văn hoá qua thời gian. Thịnh vượng nuôi hợp tác và khoan dung;
   * mối đe doạ làm tăng bảo thủ, kỷ luật và tính hiếu chiến.
   */
  public tick(years = 1, context: CultureContext = {}): void {
    const elapsed = clampRange(years, 0, 1000);
    if (elapsed <= 0) return;
    const prosperity = clamp01(context.prosperity ?? 0.5);
    const threat = clamp01(context.threat ?? 0.2);
    const contact = clamp01(context.contactRate ?? 0.1);
    const innovation = clamp01(context.innovation ?? 0.2);
    const scarcity = clamp01(context.scarcity ?? 0.3);
    const speed = Math.min(1, elapsed / 50);

    const targets: CulturalValues = {
      tradition: clamp01(0.35 + threat * 0.35 + (1 - innovation) * 0.2 + scarcity * 0.1),
      openness: clamp01(0.25 + contact * 0.4 + innovation * 0.2 - threat * 0.15),
      cooperation: clamp01(0.35 + prosperity * 0.4 + (1 - threat) * 0.15),
      aggression: clamp01(0.15 + threat * 0.5 + scarcity * 0.15 - prosperity * 0.1),
      piety: clamp01(0.3 + threat * 0.3 + (1 - innovation) * 0.2),
      honor: clamp01(0.35 + threat * 0.25 + this.values.tradition * 0.2),
      equality: clamp01(0.25 + prosperity * 0.35 + innovation * 0.15 - threat * 0.1),
      innovation: clamp01(0.2 + innovation * 0.45 + contact * 0.15 - threat * 0.1),
      hospitality: clamp01(0.3 + prosperity * 0.35 + contact * 0.2 - threat * 0.15),
      frugality: clamp01(0.35 + scarcity * 0.4 - prosperity * 0.15),
    };
    for (const key of Object.keys(this.values) as CulturalValue[]) {
      this.values[key] = clamp01(this.values[key] + (targets[key] - this.values[key]) * speed * 0.6);
    }

    for (const tradition of this.traditions.values()) {
      tradition.ageYears += elapsed;
      if (tradition.adaptive) {
        tradition.participation = clamp01(tradition.participation + (prosperity - 0.4) * 0.02 * speed);
      } else {
        tradition.participation = clamp01(tradition.participation - 0.01 * speed);
      }
    }
    for (const taboo of this.taboos.values()) {
      taboo.severity = clamp01(taboo.severity * (1 - contact * 0.05 * speed) + threat * 0.02 * speed);
    }
    for (const norm of this.norms.values()) {
      norm.enforcement = clamp01(norm.enforcement + (this.values.cooperation - 0.5) * 0.01 * speed);
      norm.fairness = clamp01(norm.fairness + (this.values.equality - 0.5) * 0.01 * speed);
    }
    for (const myth of this.myths.values()) myth.ageYears += elapsed;
    this.ageYears += elapsed;
  }

  /** Khoảng cách văn hoá chuẩn hoá `[0, 1]`. */
  public distanceTo(other: Culture): number {
    const keys = Object.keys(this.values) as CulturalValue[];
    if (keys.length === 0) return 0;
    let sum = 0;
    for (const key of keys) sum += (this.values[key] - other.values[key]) ** 2;
    return clamp01(Math.sqrt(sum / keys.length));
  }

  /** Dung hợp văn hoá khác theo tỉ lệ `ratio`. */
  public syncretize(other: Culture, ratio = 0.25): void {
    const weight = clamp01(ratio);
    for (const key of Object.keys(this.values) as CulturalValue[]) {
      this.values[key] = clamp01(this.values[key] * (1 - weight) + other.values[key] * weight);
    }
    for (const tradition of other.traditions.values()) {
      const exists = [...this.traditions.values()].some((item) => item.name === tradition.name);
      if (exists) continue;
      this.addTradition(`${tradition.name} (du nhập)`, {
        description: tradition.description,
        participation: tradition.participation * weight,
        sacred: tradition.sacred,
        adaptive: tradition.adaptive,
        origin: other.id,
      });
    }
    if (this.myths.size < 12) {
      for (const myth of other.myths.values()) {
        if (this.myths.size >= 12) break;
        if ([...this.myths.values()].some((item) => item.title === myth.title)) continue;
        this.addMyth(`${myth.title} (dị bản)`, myth.moral, myth.heroes);
      }
    }
    this.language = `${this.language} pha ${other.language}`;
  }

  /** Giới thiệu một truyền thống mới từ sự kiện sống. */
  public ritualize(event: string, importance = 0.5, adaptive = true): Tradition {
    const participation = clamp01(0.3 + importance * 0.5);
    const tradition = this.addTradition(`Nghi lễ ${event}`, {
      description: `Tưởng nhớ sự kiện ${event}`,
      participation,
      sacred: importance > 0.7,
      adaptive,
      origin: 'ký ức tập thể',
    });
    this.values.tradition = clamp01(this.values.tradition + importance * 0.05);
    return tradition;
  }

  /** Mô tả văn hoá. */
  public describe(): string {
    const oldest = this.oldestTradition;
    const mood =
      this.conservatism > 0.65
        ? 'bảo thủ, trọng lễ nghi'
        : this.tolerance > 0.65
          ? 'cởi mở, khoan dung'
          : 'cân bằng giữa truyền thống và đổi mới';
    const traditionText = oldest ? `Truyền thống lâu đời nhất: ${oldest.name}.` : 'Chưa có truyền thống lâu đời.';
    return `${this.name} (${mood}): ${this.traditions.size} truyền thống, ${this.taboos.size} điều cấm kỵ, ` +
      `${this.myths.size} thần thoại, ngôn ngữ ${this.language}. ${traditionText}`;
  }

  /** Ảnh chụp. */
  public snapshot(): CultureSnapshot {
    return {
      id: this.id,
      name: this.name,
      values: { ...this.values },
      traditions: [...this.traditions.values()].map((tradition) => ({ ...tradition })),
      taboos: [...this.taboos.values()].map((taboo) => ({ ...taboo })),
      norms: [...this.norms.values()].map((norm) => ({ ...norm })),
      myths: [...this.myths.values()].map((myth) => ({ ...myth, heroes: [...myth.heroes] })),
      language: this.language,
      artStyle: this.artStyle,
      ageYears: this.ageYears,
    };
  }

  /** Khôi phục. */
  public static fromSnapshot(snapshot: CultureSnapshot, seed?: number | string): Culture {
    const culture = new Culture({
      id: snapshot.id,
      name: snapshot.name,
      values: snapshot.values,
      language: snapshot.language,
      artStyle: snapshot.artStyle,
      seed: seed ?? snapshot.id,
    });
    culture.ageYears = snapshot.ageYears;
    for (const tradition of snapshot.traditions) culture.traditions.set(tradition.id, { ...tradition });
    for (const taboo of snapshot.taboos) culture.taboos.set(taboo.id, { ...taboo });
    for (const norm of snapshot.norms) culture.norms.set(norm.id, { ...norm });
    for (const myth of snapshot.myths) culture.myths.set(myth.id, { ...myth, heroes: [...myth.heroes] });
    return culture;
  }
}

/** Văn hoá sơ khai mặc định với vài truyền thống và cấm kỵ. */
export function seedArchaicCulture(id: string, name: string, seed?: number | string): Culture {
  const culture = new Culture({ id, name, seed });
  culture.addTradition('Lễ tạ ơn mùa màng', {
    description: 'Cả cộng đồng chia phần thu hoạch đầu tiên.',
    participation: 0.8,
    sacred: true,
    adaptive: true,
  });
  culture.addTradition('Kể chuyện bên lửa', {
    description: 'Người già truyền kinh nghiệm săn bắt cho trẻ.',
    participation: 0.7,
    adaptive: true,
  });
  culture.addTaboo('Không giết người trong bộ tộc', 'Cấm sát hại thành viên cùng cộng đồng', {
    severity: 0.9,
    reason: 'duy trì cộng đồng',
  });
  culture.addNorm('Chia sẻ thức ăn', 'Phần săn lớn phải chia cho người già và trẻ nhỏ', {
    enforcement: 0.7,
    fairness: 0.8,
  });
  culture.addMyth(
    'Người giữ lửa đầu tiên',
    'Lửa là món quà phải được bảo vệ và chia sẻ, không được dùng để huỷ diệt cộng đồng.',
    ['Người giữ lửa'],
  );
  return culture;
}
