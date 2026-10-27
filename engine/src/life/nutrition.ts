/**
 * @file nutrition.ts
 * @module @aetheria/engine/life/nutrition
 * @description Dinh dưỡng agentic: vị giác (sở thích ngọt/mặn/chua/đắng/umami/
 * cay — kế thừa từ gen và hình thành từ ký ức ăn uống), định nghĩa đồ ăn/uống
 * thật (dinh dưỡng, hydrat hoá, hương vị, độc tính, hư hỏng), **hồ sơ chuyển
 * hoá riêng từng chủ thể** (tốc độ đốt năng lượng, sức lực tối đa, số ngày chịu
 * nhịn ăn/nhịn nước đều KHÁC NHAU theo gen: trao đổi chất, thể tích, sức bền),
 * hệ sức lực (stamina) hao hụt theo hoạt động, và sự sáng tạo ẩm thực (tự chế
 * món mới từ nguyên liệu đã biết — thành công phụ thuộc thông số sáng tạo).
 */

import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import { LifeRandom } from './stochastic.js';
import type { Genome } from './genetics.js';

/** Sáu trục vị giác — cả sở thích của người ăn lẫn hương vị thực của món. */
export interface TasteVector {
  sweet: number;
  salty: number;
  sour: number;
  bitter: number;
  umami: number;
  spicy: number;
}

/** Một món ăn / đồ uống trong thế giới. */
export interface FoodItem {
  id: string;
  name: string;
  /** Dinh dưỡng `[0, 100]` — hồi đói. */
  nutrition: number;
  /** Hydrat hoá `[0, 100]` — hồi khát (canh/nước ép cao). */
  hydration: number;
  /** Hương vị thực của món. */
  flavor: TasteVector;
  /** Độc tính `[0, 1]` — nấm độc, cá nóc, món thí nghiệm hỏng. */
  toxicity: number;
  /** Số ngày trước khi hỏng. */
  spoilageDays: number;
  tags: readonly string[];
  /** Ai chế ra (null = món tự nhiên). */
  inventorId?: string;
}

/** Sở thích vị giác của một agent — mỗi người một khẩu vị. */
export interface TasteProfile {
  entityId: string;
  preference: TasteVector;
  /** Độ nhạy vị `[0, 1]` — nhạy thì món dở khó chịu hơn nhiều. */
  sensitivity: number;
  /** Ký ức ẩm thực: món đã ăn → mức thích hiện tại. */
  memories: Array<{ foodId: string; enjoyed: number; times: number }>;
}

/**
 * Hồ sơ chuyển hoá — **mỗi chủ thể khác nhau**:
 * người trao đổi chất nhanh đói sớm, người béo trữ đạm chịu đói lâu,
 * người ý chí sắt đá chịu đau đói hơn nhưng uống thiếu nước vẫn chết như thường.
 */
export interface MetabolicProfile {
  entityId: string;
  /** Hệ số đốt năng lượng `[0.5, 2]` — cao = đói nhanh. */
  metabolismRate: number;
  /** Sức lực tối đa `[60, 180]`. */
  staminaMax: number;
  /** Sức lực hồi mỗi ngày ăn uống đủ. */
  staminaRecoveryPerDay: number;
  /** Số ngày chịu nhịn ăn trước khi tổn thương `[2, 16]`. */
  hungerDaysTolerance: number;
  /** Số ngày chịu nhịn nước trước khi tổn thương `[0.5, 6]`. */
  thirstDaysTolerance: number;
  /** Hệ số chống suy của tổn thương nhịn ăn `[0.6, 1.4]`. */
  fastingResilience: number;
}

/** Trạng thái dinh dưỡng hiện tại của một agent. */
export interface NutritionState {
  entityId: string;
  /** Sức lực `[0, staminaMax]`. */
  stamina: number;
  daysWithoutFood: number;
  daysWithoutWater: number;
  /** Đường huyết `[0, 100]` — thấp là mệt lử. */
  bloodSugar: number;
  /** Hydrat hoá mô `[0, 100]`. */
  tissueHydration: number;
  /** Bữa cuối là gì (để ký ức vị giác). */
  lastMeal?: string;
}

/** Kết quả một ngày trôi qua của hệ dinh dưỡng. */
export interface NutritionTickResult {
  staminaDelta: number;
  bloodSugarDelta: number;
  hydrationDelta: number;
  /** Tổn thương sức khoẻ do nhịn ăn/nước (đã nhân hệ số riêng của chủ thể). */
  healthDamage: number;
  /** Đói/khát có vượt ngưỡng chịu đựng không. */
  starving: boolean;
  dehydrated: boolean;
  note: string;
}

/** Kết quả một bữa ăn. */
export interface MealResult {
  foodId: string;
  /** Độ hợp khẩu `[0, 1]` — decides cảm xúc. */
  enjoyment: number;
  staminaGain: number;
  nutrition: number;
  hydration: number;
  /** Bị độc không. */
  poisoned: boolean;
  emotion: 'delight' | 'content' | 'meh' | 'disgust';
  note: string;
}

/** Hợp vị: cosine-like match giữa khẩu vị và hương vị món. */
export function tasteMatch(preference: TasteVector, flavor: TasteVector): number {
  const axes: Array<keyof TasteVector> = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy'];
  let dotSum = 0;
  let magP = 0;
  let magF = 0;
  for (const axis of axes) {
    const p = clamp01(preference[axis]);
    const f = clamp01(flavor[axis]);
    dotSum += p * f;
    magP += p * p;
    magF += f * f;
  }
  const cosine = magP > 0 && magF > 0 ? dotSum / (Math.sqrt(magP) * Math.sqrt(magF)) : 0.5;
  return clamp01(cosine);
}

/** Khẩu vị từ gen — hành di truyền nhưng biến động theo seed cá thể. */
export function deriveTasteProfile(genome: Genome, entityId: string): TasteProfile {
  const random = new LifeRandom(`${genome.id}:${entityId}:taste`);
  const gene = (id: string, fallback: number) => {
    const g = genome.genes[id];
    const mean = g ? (g.alleles[0].value + g.alleles[1].value) / 2 : fallback;
    return clamp01(mean + random.gaussian(0, 0.08));
  };
  return {
    entityId,
    preference: {
      sweet: gene('metabolism', 0.5),
      salty: gene('size', 0.5),
      sour: gene('resilience', 0.4),
      bitter: gene('immunity', 0.35),
      umami: gene('strength', 0.6),
      spicy: gene('aggression', 0.4),
    },
    sensitivity: clamp01(0.4 + gene('perception', 0.5) * 0.6),
    memories: [],
  };
}

/**
 * Hồ sơ chuyển hoá riêng từng chủ thể — suy từ gen + seed:
 * trao đổi chất nhanh (gen metabolism cao) → đói nhanh, chịu nhịn ngắn;
 * thể tích lớn (size) → trữ đạm nhiều, chịu đói lâu; ý chí (willpower) và
 * sức bền (resilience) kéo dài ngưỡng chịu đựng nhưng không thắng được khát.
 */
export function deriveMetabolicProfile(genome: Genome, entityId: string, traits: Record<string, number>): MetabolicProfile {
  const random = new LifeRandom(`${genome.id}:${entityId}:metabolic`);
  const gene = (id: string, fallback: number) => {
    const g = genome.genes[id];
    const mean = g ? (g.alleles[0].value + g.alleles[1].value) / 2 : fallback;
    return clamp01(mean + random.gaussian(0, 0.06));
  };
  const metabolismGene = gene('metabolism', 0.5);
  const sizeGene = gene('size', 0.5);
  const resilience = clamp01((traits.resilience ?? 50) / 100);
  const willpower = clamp01((traits.willpower ?? 50) / 100);
  const metabolismRate = clampRange(0.55 + metabolismGene * 1.2, 0.5, 2);

  return {
    entityId,
    metabolismRate,
    staminaMax: clampRange(60 + sizeGene * 60 + resilience * 40 + random.gaussian(0, 6), 60, 180),
    staminaRecoveryPerDay: clampRange(22 + metabolismGene * 14, 18, 40),
    // Người trao đổi chất chậm + vóc lớn chịu đói rất lâu; ý chí cộng thêm.
    hungerDaysTolerance: clampRange(
      3 + (1 - metabolismGene) * 7 + sizeGene * 4 + willpower * 2 + random.gaussian(0, 0.7),
      2,
      16,
    ),
    // Khát không tha thứ: mọi chủ thể đều chỉ chịu được vài ngày, sai khác nhỏ.
    thirstDaysTolerance: clampRange(1.5 + sizeGene * 2 + resilience * 1.5 + random.gaussian(0, 0.25), 0.5, 6),
    fastingResilience: clampRange(0.7 + resilience * 0.5 + willpower * 0.2, 0.6, 1.4),
  };
}

/** Đồ ăn tự nhiên của thế giới. */
export const NATURAL_FOODS: readonly FoodItem[] = Object.freeze([
  { id: 'food_white_rice', name: 'Cơm trắng', nutrition: 70, hydration: 20, flavor: { sweet: 0.5, salty: 0.1, sour: 0, bitter: 0, umami: 0.3, spicy: 0 }, toxicity: 0, spoilageDays: 2, tags: ['tinh bột'] },
  { id: 'food_grilled_fish', name: 'Cá nướng', nutrition: 62, hydration: 25, flavor: { sweet: 0.2, salty: 0.5, sour: 0, bitter: 0, umami: 0.9, spicy: 0.1 }, toxicity: 0, spoilageDays: 1, tags: ['thịt'] },
  { id: 'food_wild_berries', name: 'Quả rừng', nutrition: 30, hydration: 55, flavor: { sweet: 0.8, salty: 0, sour: 0.6, bitter: 0.1, umami: 0, spicy: 0 }, toxicity: 0.05, spoilageDays: 3, tags: ['trái cây'] },
  { id: 'food_bitter_herb', name: 'Rau đắng dại', nutrition: 18, hydration: 40, flavor: { sweet: 0, salty: 0.1, sour: 0.1, bitter: 0.9, umami: 0.1, spicy: 0 }, toxicity: 0.1, spoilageDays: 2, tags: ['rau'] },
  { id: 'food_stream_water', name: 'Nước suối', nutrition: 0, hydration: 95, flavor: { sweet: 0, salty: 0, sour: 0, bitter: 0.05, umami: 0, spicy: 0 }, toxicity: 0.02, spoilageDays: 1, tags: ['nước'] },
  { id: 'food_hot_broth', name: 'Nước dùng nóng', nutrition: 40, hydration: 75, flavor: { sweet: 0.2, salty: 0.7, sour: 0.1, bitter: 0, umami: 0.8, spicy: 0.3 }, toxicity: 0, spoilageDays: 1, tags: ['canh'] },
  { id: 'food_chili_root', name: 'Củ ớt rừng', nutrition: 12, hydration: 30, flavor: { sweet: 0.1, salty: 0, sour: 0.2, bitter: 0.2, umami: 0.1, spicy: 0.95 }, toxicity: 0, spoilageDays: 4, tags: ['gia vị'] },
  { id: 'food_unknown_mushroom', name: 'Nấm hoang lạ', nutrition: 25, hydration: 35, flavor: { sweet: 0.1, salty: 0.1, sour: 0, bitter: 0.5, umami: 0.7, spicy: 0 }, toxicity: 0.55, spoilageDays: 3, tags: ['nấm', 'rủi ro'] },
]);

/** Động cơ dinh dưỡng cho toàn thế giới. */
export class NutritionEngine {
  public readonly profiles = new Map<string, MetabolicProfile>();
  public readonly states = new Map<string, NutritionState>();
  public readonly tastes = new Map<string, TasteProfile>();
  /** Thực đơn thế giới + món do agent phát minh. */
  public readonly menu = new Map<string, FoodItem>();
  /** Sách dạy nấu cá nhân: món agent tự chế. */
  public readonly cookbooks = new Map<string, FoodItem[]>();
  private readonly seed: number | string;
  private mealCounter = 0;

  constructor(options: { seed?: number | string; naturalFoods?: readonly FoodItem[] } = {}) {
    this.seed = options.seed ?? 'aetheria-nutrition';
    for (const food of options.naturalFoods ?? NATURAL_FOODS) this.menu.set(food.id, { ...food });
  }

  /** Đăng ký món mới (kể cả agent phát minh). */
  public registerFood(item: FoodItem): FoodItem {
    const normalized: FoodItem = {
      ...item,
      nutrition: clampRange(item.nutrition, 0, 100),
      hydration: clampRange(item.hydration, 0, 100),
      toxicity: clamp01(item.toxicity),
      spoilageDays: Math.max(0.5, item.spoilageDays),
    };
    this.menu.set(normalized.id, normalized);
    return normalized;
  }

  /** Lấy/khởi tạo hồ sơ riêng của chủ thể. */
  public profileOf(entityId: string, genome: Genome, traits: Record<string, number>): MetabolicProfile {
    let profile = this.profiles.get(entityId);
    if (!profile) {
      profile = deriveMetabolicProfile(genome, entityId, traits);
      this.profiles.set(entityId, profile);
    }
    return profile;
  }

  /** Lấy/khởi tạo khẩu vị. */
  public tasteOf(entityId: string, genome: Genome): TasteProfile {
    let taste = this.tastes.get(entityId);
    if (!taste) {
      taste = deriveTasteProfile(genome, entityId);
      this.tastes.set(entityId, taste);
    }
    return taste;
  }

  /** Lấy/khởi tạo trạng thái. */
  public stateOf(entityId: string, genome: Genome, traits: Record<string, number>): NutritionState {
    let state = this.states.get(entityId);
    if (!state) {
      const profile = this.profileOf(entityId, genome, traits);
      state = {
        entityId,
        stamina: profile.staminaMax * 0.7,
        daysWithoutFood: 0,
        daysWithoutWater: 0,
        bloodSugar: 65,
        tissueHydration: 70,
      };
      this.states.set(entityId, state);
    }
    return state;
  }

  /** Thống kê sống sót của riêng chủ thể này: chịu được tối đa bao lâu không ăn/không uống. */
  public survivalStats(entityId: string, genome: Genome, traits: Record<string, number>): {
    maxDaysWithoutFood: number;
    maxDaysWithoutWater: number;
    metabolismRate: number;
    staminaMax: number;
  } {
    const profile = this.profileOf(entityId, genome, traits);
    return {
      maxDaysWithoutFood: Math.round(profile.hungerDaysTolerance * 10) / 10,
      maxDaysWithoutWater: Math.round(profile.thirstDaysTolerance * 10) / 10,
      metabolismRate: Math.round(profile.metabolismRate * 100) / 100,
      staminaMax: Math.round(profile.staminaMax),
    };
  }

  /**
   * Một ngày trôi qua: đốt năng lượng theo chuyển hoá riêng, đếm ngày nhịn,
   * tính tổn thương sức khoẻ chỉ khi vượt ngưỡng chịu đựng của CHỦ THỂ ĐÓ.
   */
  public tick(
    entityId: string,
    days: number,
    genome: Genome,
    traits: Record<string, number>,
    options: { activityLevel?: number; ate?: boolean; drank?: boolean } = {},
  ): NutritionTickResult {
    const profile = this.profileOf(entityId, genome, traits);
    const state = this.stateOf(entityId, genome, traits);
    const activity = clampRange(options.activityLevel ?? 0.5, 0, 1.5);
    const ate = options.ate ?? false;
    const drank = options.drank ?? false;

    // Hao hụt: trao đổi chất nhanh + hoạt động nhiều → tụt nhanh.
    const staminaDelta = -profile.metabolismRate * activity * 18 * days + (ate ? profile.staminaRecoveryPerDay * days * 0.5 : 0);
    state.stamina = clampRange(state.stamina + staminaDelta, 0, profile.staminaMax);
    const bloodSugarDelta = ate ? 18 * days : -profile.metabolismRate * 12 * days;
    state.bloodSugar = clampRange(state.bloodSugar + bloodSugarDelta, 0, 100);
    const hydrationDelta = drank ? 25 * days : -8 * days * profile.metabolismRate;
    state.tissueHydration = clampRange(state.tissueHydration + hydrationDelta, 0, 100);

    if (ate) state.daysWithoutFood = 0;
    else state.daysWithoutFood += days;
    if (drank) state.daysWithoutWater = 0;
    else state.daysWithoutWater += days;

    const starving = state.daysWithoutFood > profile.hungerDaysTolerance;
    const dehydrated = state.daysWithoutWater > profile.thirstDaysTolerance;
    // Tổn thương nhân hệ số riêng: người chịu đựng kém suy nhanh hơn.
    const overHunger = Math.max(0, state.daysWithoutFood - profile.hungerDaysTolerance);
    const overThirst = Math.max(0, state.daysWithoutWater - profile.thirstDaysTolerance);
    const healthDamage = Math.round(
      (overHunger * 6 + overThirst * 14) * profile.fastingResilience * 10,
    ) / 10;

    const parts: string[] = [];
    if (starving) parts.push(`đói quá ${overHunger.toFixed(1)} ngày ngưỡng`);
    if (dehydrated) parts.push(`khát quá ${overThirst.toFixed(1)} ngày ngưỡng`);
    return {
      staminaDelta: Math.round(staminaDelta * 10) / 10,
      bloodSugarDelta: Math.round(bloodSugarDelta * 10) / 10,
      hydrationDelta: Math.round(hydrationDelta * 10) / 10,
      healthDamage,
      starving,
      dehydrated,
      note: parts.length > 0 ? parts.join('; ') : 'dinh dưỡng trong ngưỡng chịu đựng',
    };
  }

  /** Ăn một món: enjoyment theo hợp vị, cảm xúc theo khẩu vị, có thể trúng độc. */
  public eat(
    entityId: string,
    foodId: string,
    genome: Genome,
    traits: Record<string, number>,
    options: { random?: DeepRandom } = {},
  ): MealResult {
    const food = this.menu.get(foodId);
    const taste = this.tasteOf(entityId, genome);
    const state = this.stateOf(entityId, genome, traits);
    const profile = this.profileOf(entityId, genome, traits);
    const random = options.random ?? new DeepRandom(`${this.seed}:${entityId}:${foodId}:meal:${++this.mealCounter}`);
    if (!food) {
      return {
        foodId,
        enjoyment: 0,
        staminaGain: 0,
        nutrition: 0,
        hydration: 0,
        poisoned: false,
        emotion: 'meh',
        note: 'không có món này trong thế giới',
      };
    }

    const match = tasteMatch(taste.preference, food.flavor);
    const enjoyment = clamp01(match * (0.6 + taste.sensitivity * 0.4) - food.toxicity * 0.5);
    // Ăn uống hồi sức lực và đường huyết — hiệu quả giảm nếu độc.
    const efficiency = 1 - food.toxicity * 0.6;
    state.stamina = clampRange(state.stamina + food.nutrition * efficiency * 0.5, 0, profile.staminaMax);
    state.bloodSugar = clampRange(state.bloodSugar + food.nutrition * efficiency * 0.4, 0, 100);
    state.tissueHydration = clampRange(state.tissueHydration + food.hydration * efficiency * 0.4, 0, 100);
    state.daysWithoutFood = 0;
    state.lastMeal = foodId;

    // Ký ức vị giác: ăn lần nữa cùng món nếu đã thích thì thích hơn (quen miệng).
    const memory = taste.memories.find((m) => m.foodId === foodId);
    if (memory) {
      memory.times++;
      memory.enjoyed = clamp01(memory.enjoyed * 0.7 + enjoyment * 0.5);
    } else {
      taste.memories.push({ foodId, enjoyed: enjoyment, times: 1 });
      if (taste.memories.length > 40) taste.memories.shift();
    }

    const poisoned = random.chance(food.toxicity);
    const emotion: MealResult['emotion'] =
      enjoyment > 0.75 ? 'delight' : enjoyment > 0.5 ? 'content' : enjoyment > 0.25 ? 'meh' : 'disgust';
    return {
      foodId,
      enjoyment: Math.round(enjoyment * 100) / 100,
      staminaGain: Math.round(food.nutrition * efficiency * 0.5 * 10) / 10,
      nutrition: food.nutrition * efficiency,
      hydration: food.hydration * efficiency,
      poisoned,
      emotion,
      note: poisoned
        ? `${food.name} có độc — ${entityId} trúng độc sau bữa ăn`
        : `${food.name} hợp khẩu ${Math.round(enjoyment * 100)}%`,
    };
  }

  /**
   * Sáng tạo ẩm thực: kết hợp nguyên liệu đã biết thành món mới. Thành công
   * phụ thuộc thông số sáng tạo + số món đã biết làm nền; thất bại cho ra
   * món dở hoặc nguy hiểm (độc tính cao).
   */
  public inventRecipe(
    entityId: string,
    ingredientIds: readonly string[],
    creativity: number,
    year: number,
    options: { random?: LifeRandom } = {},
  ): { invented: boolean; recipe: FoodItem | null; attemptsNeeded: number; note: string } {
    const random = options.random ?? new LifeRandom(`${entityId}:recipe:${year}`);
    const ingredients = ingredientIds.map((id) => this.menu.get(id)).filter((f): f is FoodItem => Boolean(f));
    if (ingredients.length < 2) {
      return { invented: false, recipe: null, attemptsNeeded: Infinity, note: 'cần ít nhất 2 nguyên liệu đã biết' };
    }
    const creativityClamped = clamp01(creativity);
    const cookbook = this.cookbooks.get(entityId) ?? [];
    const synergy = ingredients.length * 0.06 + cookbook.length * 0.04 + creativityClamped * 0.35;
    const attemptsNeeded = Math.max(2, Math.round((1.1 - synergy) * 18));
    const invented = random.chance(clamp01(0.12 + synergy));

    if (!invented) {
      return { invented: false, recipe: null, attemptsNeeded, note: 'món thử đang nhạt nhẽo hoặc cháy khét — cần thử thêm' };
    }

    // Hương vị món mới = trộn vị nguyên liệu + dấu ấn sáng tạo của đầu bếp.
    const axes: Array<keyof TasteVector> = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy'];
    const flavor = {} as TasteVector;
    for (const axis of axes) {
      const mean = ingredients.reduce((sum, item) => sum + item.flavor[axis], 0) / ingredients.length;
      flavor[axis] = clamp01(mean + random.gaussian(0, 0.15) + creativityClamped * 0.1);
    }
    const nutrition = clampRange(
      ingredients.reduce((sum, item) => sum + item.nutrition, 0) / ingredients.length * 1.15,
      5,
      95,
    );
    const hydration = clampRange(
      ingredients.reduce((sum, item) => sum + item.hydration, 0) / ingredients.length,
      5,
      95,
    );
    // Nấu dở có thể sinh độc tính — sáng tạo có giá.
    const toxicity = clamp01(
      ingredients.reduce((max, item) => Math.max(max, item.toxicity), 0) * 0.8 + random.gaussian(0, 0.05),
    );
    const name = `${ingredients[ingredients.length - 1].name} chế kiểu ${entityId}`;
    const recipe: FoodItem = {
      id: `recipe_${hashSeed(`${entityId}:${name}:${year}`).toString(16)}`,
      name,
      nutrition: Math.round(nutrition),
      hydration: Math.round(hydration),
      flavor,
      toxicity,
      spoilageDays: Math.max(0.5, random.range(0.5, 4)),
      tags: ['món tự chế', ...ingredients.flatMap((item) => item.tags).slice(0, 2)],
      inventorId: entityId,
    };
    this.registerFood(recipe);
    cookbook.push(recipe);
    this.cookbooks.set(entityId, cookbook);
    return { invented: true, recipe, attemptsNeeded, note: `sáng chế món "${name}" sau ~${attemptsNeeded} lần thử` };
  }

  /** Món agent tự chế được. */
  public cookbookOf(entityId: string): FoodItem[] {
    return [...(this.cookbooks.get(entityId) ?? [])];
  }

  /** Thống kê toàn hệ. */
  public stats(): { foods: number; recipes: number; agents: number } {
    let recipes = 0;
    for (const book of this.cookbooks.values()) recipes += book.length;
    return { foods: this.menu.size, recipes, agents: this.profiles.size };
  }
}
