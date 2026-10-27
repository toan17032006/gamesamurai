/**
 * @file appearance.ts
 * @module @aetheria/engine/life/appearance
 * @description Ngoại hình DNA: các locus ngoại hình được kế thừa qua giao phối,
 * biểu hiện thành tham số render (chiều cao, vóc dáng, màu da/tóc/mắt, tỉ lệ
 * khuôn mặt…) và tự động biến đổi qua từng giai đoạn cuộc đời — trẻ sơ sinh có
 * đầu to tỉ lệ 1/4 thân, tuổi già lùn đi, tóc bạc, da nhăn. Mỗi cá thể mang một
 * chữ ký duy nhất: xác suất hai thực thể giống hệt nhau gần bằng 0.
 */

import { LifeRandom } from './stochastic.js';
import { clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import type { Genome } from './genetics.js';
import { expressGenome } from './genetics.js';
import type { LifeStage } from './lifecycle.js';

/** Các locus ngoại hình trong bộ gen. */
export type AppearanceLocus =
  | 'heightPotential'
  | 'buildFrame'
  | 'skinTone'
  | 'hairColor'
  | 'hairTexture'
  | 'eyeColor'
  | 'eyeSize'
  | 'eyeSpacing'
  | 'faceWidth'
  | 'cheekbone'
  | 'noseLength'
  | 'noseWidth'
  | 'jawShape'
  | 'lipFullness'
  | 'earShape'
  | 'browRidge'
  | 'neckThickness'
  | 'shoulderWidth'
  | 'limbProportion'
  | 'handSize'
  | 'voicePitch'
  | 'bodyHair'
  | 'markingPattern'
  | 'scentProfile';

/** Danh sách locus ngoại hình mặc định. */
export const APPEARANCE_LOCI: readonly AppearanceLocus[] = Object.freeze([
  'heightPotential',
  'buildFrame',
  'skinTone',
  'hairColor',
  'hairTexture',
  'eyeColor',
  'eyeSize',
  'eyeSpacing',
  'faceWidth',
  'cheekbone',
  'noseLength',
  'noseWidth',
  'jawShape',
  'lipFullness',
  'earShape',
  'browRidge',
  'neckThickness',
  'shoulderWidth',
  'limbProportion',
  'handSize',
  'voicePitch',
  'bodyHair',
  'markingPattern',
  'scentProfile',
]);

/** Bản chất của thực thể, chi phối dáng ngoại hình cơ sở. */
export type BeingKind = 'human' | 'animal' | 'beast' | 'monster' | 'halfBeast' | 'undead' | 'construct';

/** Tham số render ngoại hình tại một thời điểm. */
export interface AppearanceRenderParams {
  /** Chiều cao tính bằng cm sau khi áp đường cong tăng trưởng. */
  heightCm: number;
  /** Khối lượng ước tính (kg). */
  massKg: number;
  /** Tỉ lệ đầu/thân (trẻ sơ sinh ~0.25, người lớn ~0.135). */
  headToBodyRatio: number;
  /** Độ rộng vai so với chiều cao `[0, 1]`. */
  shoulderRatio: number;
  /** Độ tròn vs góc của vóc dáng `[0, 1]`. */
  buildRoundness: number;
  /** Màu da/màu lót `0 = rất sáng → 1 = rất tối`. */
  skinTone: number;
  /** Màu tóc/lông `0 = trắng → 1 = đen`. */
  hairColor: number;
  /** Kiểu tóc/lông `0 = thẳng → 1 = xoăn cực`. */
  hairTexture: number;
  /** Màu mắt `0 = xanh nhạt → 1 = đen thẫm`. */
  eyeColor: number;
  /** Kích thước mắt `[0, 1]`. */
  eyeSize: number;
  /** Khoảng cách hai mắt `[0, 1]`. */
  eyeSpacing: number;
  /** Độ rộng khuôn mặt `[0, 1]`. */
  faceWidth: number;
  /** Gò má nổi `[0, 1]`. */
  cheekbone: number;
  /** Sống mũi dài `[0, 1]`. */
  noseLength: number;
  /** Sống mũi rộng `[0, 1]`. */
  noseWidth: number;
  /** Hàm dưới vuông vs nhọn `[0, 1]`. */
  jawShape: number;
  /** Độ đầy môi `[0, 1]`. */
  lipFullness: number;
  /** Dạng tai `[0, 1]`. */
  earShape: number;
  /** Vòm mày nổi `[0, 1]`. */
  browRidge: number;
  /** Độ dày cổ `[0, 1]`. */
  neckThickness: number;
  /** Tỉ lệ chi trên/dưới `[0, 1]`. */
  limbProportion: number;
  /** Kích thước bàn tay/bàn chân `[0, 1]`. */
  handSize: number;
  /** Cao độ giọng nói `0 = trầm → 1 = the`. */
  voicePitch: number;
  /** Mật độ lông cơ thể `[0, 1]`. */
  bodyHair: number;
  /** Hoa văn/vết stripes/đốm đặc trưng `[0, 1]`. */
  markingPattern: number;
  /** Hương vị mùi cơ thể `[0, 1]`. */
  scentProfile: number;
  /** Độ nhăn da theo tuổi `[0, 1]`. */
  skinWrinkles: number;
  /** Mức bạc màu tóc/lông theo tuổi `[0, 1]`. */
  hairGraying: number;
  /** Đồi gù/lưng cong theo tuổi `[0, 1]`. */
  postureStoop: number;
  /** Mờ đục thủy tinh thể theo tuổi `[0, 1]`. */
  eyeClouding: number;
  /** Dáng đi: 0 = nhanh nhẹn → 1 = chậm chạp. */
  gaitSlowness: number;
}

/** Chữ ký duy nhất của một ngoại hình (hex 16 ký tự). */
export interface AppearanceSignature {
  /** Chuỗi hex 64-bit rút gọn từ toàn bộ locus. */
  code: string;
  /** Số bít entropy xấp xỉ. */
  entropyBits: number;
}

/** Kết quả biểu hiện ngoại hình đầy đủ. */
export interface Appearance {
  beingId: string;
  kind: BeingKind;
  sex: 'female' | 'male';
  /** Giá trị locus gốc `[0, 1]` kế thừa từ bố mẹ. */
  loci: Record<AppearanceLocus, number>;
  /** Tham số render hiện tại theo tuổi/giai đoạn. */
  render: AppearanceRenderParams;
  /** Chiều cao trưởng thành dự kiến (cm). */
  adultHeightCm: number;
  /** Chữ ký duy nhất. */
  signature: AppearanceSignature;
}

const KIND_HEIGHT_RANGE: Readonly<Record<BeingKind, [number, number]>> = Object.freeze({
  human: [145, 200],
  animal: [20, 160],
  beast: [60, 220],
  monster: [90, 320],
  halfBeast: [150, 230],
  undead: [140, 210],
  construct: [80, 400],
});

/** Bảng màu thực nghiệm cho mắt: 0 = xanh xám, 0.5 = nâu hổ phách, 1 = đen. */
export function eyeColorLabel(eyeColor: number): string {
  if (eyeColor < 0.2) return 'xanh xám';
  if (eyeColor < 0.4) return 'xanh biển';
  if (eyeColor < 0.55) return 'xanh nâu';
  if (eyeColor < 0.75) return 'nâu hổ phách';
  if (eyeColor < 0.9) return 'nâu đậm';
  return 'đen thẫm';
}

/** Nhãn màu tóc/lông. */
export function hairColorLabel(hairColor: number): string {
  if (hairColor < 0.12) return 'trắng bạc';
  if (hairColor < 0.3) return 'vàng bạch kim';
  if (hairColor < 0.45) return 'nâu vàng';
  if (hairColor < 0.62) return 'nâu đất';
  if (hairColor < 0.8) return 'nâu đen';
  return 'đen tuyền';
}

/** Nhãn màu da. */
export function skinToneLabel(skinTone: number): string {
  if (skinTone < 0.2) return 'trắng hồng';
  if (skinTone < 0.4) return 'vàng nhạt';
  if (skinTone < 0.6) return 'vàng đồng';
  if (skinTone < 0.8) return 'nâu';
  return 'nâu sẫm';
}

/** Lấy giá trị locus từ bộ gen; locus thiếu được suy bù tất định từ id bộ gen. */
function locusValue(genome: Genome, locus: AppearanceLocus): number {
  const gene = genome.genes[locus];
  if (gene) {
    const [a, b] = gene.alleles;
    // Alen trội chiếm 70% trọng số.
    const dominant = a.dominance >= b.dominance ? a.value : b.value;
    const recessive = a.dominance >= b.dominance ? b.value : a.value;
    return clamp01(dominant * 0.7 + recessive * 0.3);
  }
  // Locus chưa có trong gen: suy bù tất định từ id bộ gen.
  const fallback = new LifeRandom(`${genome.id}:${locus}`);
  return fallback.next();
}

/**
 * Đường cong tăng trưởng chiều cao theo tỉ lệ tuổi thọ (JPPS-like).
 * `ageRatio = age / longevity`. Trẻ sơ sinh ~30% chiều cao trưởng thành.
 */
export function appearanceGrowthCurve(ageRatio: number, sex: 'female' | 'male'): number {
  const r = clampRange(ageRatio, 0, 1.4);
  // Nữ dậy thì và đóng khung xương sớm hơn nam.
  const shift = sex === 'female' ? 0.02 : 0;
  const t = clamp01(r / (0.2 + shift)); // tăng nhanh trong 20% đầu đời
  const curve = 0.3 + 0.7 * (1 - Math.pow(1 - t, 2.2));
  // Tuổi già co cột sống: mất tối đa 7% sau 80% tuổi thọ.
  const shrink = r > 0.8 ? clamp01((r - 0.8) / 0.6) * 0.07 : 0;
  return clamp01(curve - shrink);
}

/** Mức lão hoá tích luỹ `[0, 1]` từ tỉ lệ tuổi thọ. */
export function senescence(ageRatio: number): number {
  const r = clampRange(ageRatio, 0, 1.4);
  if (r <= 0.5) return 0;
  return clamp01(((r - 0.5) / 0.9) ** 1.8);
}

/** Biểu hiện ngoại hình từ bộ gen, loại và tuổi. */
export function expressAppearance(
  genome: Genome,
  options: {
    beingId: string;
    kind?: BeingKind;
    sex: 'female' | 'male';
    ageYears: number;
    longevityYears: number;
    nutrition?: number;
    traits?: Record<string, number>;
    stage?: LifeStage;
  },
): Appearance {
  const kind = options.kind ?? 'human';
  const loci = {} as Record<AppearanceLocus, number>;
  for (const locus of APPEARANCE_LOCI) loci[locus] = locusValue(genome, locus);

  const [minH, maxH] = KIND_HEIGHT_RANGE[kind];
  const adultHeightCm = minH + (maxH - minH) * loci.heightPotential;
  const ageRatio = options.ageYears / Math.max(1, options.longevityYears);
  const factor = appearanceGrowthCurve(ageRatio, options.sex);
  // Dinh dưỡng kém thời thơ ấu làm hạn chế chiều cao trưởng thành.
  const nutrition = clamp01(options.nutrition ?? 0.8);
  const staturePenalty = 1 - (1 - nutrition) * 0.12;
  const heightCm = adultHeightCm * factor * staturePenalty;

  const traits = options.traits ?? {};
  const strength = traits.strength ?? 50;
  const metabolism = traits.metabolism ?? 1;
  const bmiBase = 17 + loci.buildFrame * 12 + (strength / 100) * 5 - (metabolism - 1) * 4;
  const heightM = Math.max(0.3, heightCm / 100);
  const massKg = Math.max(0.6, bmiBase * heightM * heightM * (0.35 + 0.65 * factor));

  // Trẻ sơ sinh đầu chiếm ~1/4 thân, người lớn ~1/7.5.
  const headToBodyRatio = clampRange(0.25 - 0.115 * clamp01(ageRatio / 0.18), 0.128, 0.26);
  const old = senescence(ageRatio);

  const render: AppearanceRenderParams = {
    heightCm: Math.round(heightCm * 10) / 10,
    massKg: Math.round(massKg * 10) / 10,
    headToBodyRatio: Math.round(headToBodyRatio * 1000) / 1000,
    shoulderRatio: clamp01(0.42 + loci.shoulderWidth * 0.18 - (options.sex === 'female' ? 0.03 : 0) - old * 0.03),
    buildRoundness: clamp01(0.2 + loci.buildFrame * 0.6 + old * 0.1),
    skinTone: clamp01(loci.skinTone * (1 - old * 0.08)),
    hairColor: clamp01(loci.hairColor),
    hairTexture: clamp01(loci.hairTexture),
    eyeColor: clamp01(loci.eyeColor),
    eyeSize: clamp01(loci.eyeSize * (1 + (options.stage === 'infancy' ? 0.15 : 0))),
    eyeSpacing: clamp01(loci.eyeSpacing),
    faceWidth: clamp01(loci.faceWidth * (1 - old * 0.05)),
    cheekbone: clamp01(loci.cheekbone),
    noseLength: clamp01(loci.noseLength * (1 + old * 0.08)),
    noseWidth: clamp01(loci.noseWidth * (1 + old * 0.1)),
    jawShape: clamp01(loci.jawShape),
    lipFullness: clamp01(loci.lipFullness * (1 - old * 0.15)),
    earShape: clamp01(loci.earShape),
    browRidge: clamp01(loci.browRidge),
    neckThickness: clamp01(loci.neckThickness * (1 - old * 0.2)),
    limbProportion: clamp01(loci.limbProportion),
    handSize: clamp01(loci.handSize),
    voicePitch: clamp01(
      loci.voicePitch * 0.7 +
        (options.sex === 'male' ? 0.15 : 0.55) * 0.3 +
        (options.stage === 'infancy' || options.stage === 'childhood' ? 0.25 : 0) -
        old * 0.05,
    ),
    bodyHair: clamp01(loci.bodyHair * (options.sex === 'male' ? 1.1 : 0.75)),
    markingPattern: clamp01(loci.markingPattern),
    scentProfile: clamp01(loci.scentProfile),
    skinWrinkles: clamp01(old * (1.1 - loci.buildFrame * 0.2)),
    hairGraying: clamp01((old - 0.08) / 0.4),
    postureStoop: clamp01(old ** 1.5 * 0.8),
    eyeClouding: clamp01((old - 0.5) / 0.5) * clamp01(0.3 + loci.eyeColor * 0.5),
    gaitSlowness: clamp01(old * 0.9),
  };

  return {
    beingId: options.beingId,
    kind,
    sex: options.sex,
    loci,
    render,
    adultHeightCm: Math.round(adultHeightCm * 10) / 10,
    signature: appearanceSignature(loci),
  };
}

/**
 * Chữ ký duy nhất: băm toàn bộ locus thành hex 64-bit.
 * Với 24 locus liên tục, xác suất hai cá thể trùng chữ ký ≈ 0.
 */
export function appearanceSignature(loci: Record<AppearanceLocus, number>): AppearanceSignature {
  let code = 0n;
  let bit = 0n;
  // Mỗi locus đóng góp 12 bít (quantize 0..4095) → 24 locus = 288 bít,
  // gấp khúc thành XOR 64-bit để giữ tính phân tán.
  for (const locus of APPEARANCE_LOCI) {
    const q = BigInt(Math.round(clamp01(loci[locus] ?? 0) * 4095));
    code ^= (q << bit) & 0xffffffffffffffffn;
    bit = (bit + 12n) % 60n;
    code ^= BigInt(Math.abs(hashSeed(`${locus}:${q}`)) >>> 0) & 0xffffn;
    code &= 0xffffffffffffffffn;
  }
  const entropyBits = APPEARANCE_LOCI.length * 12;
  return {
    code: code.toString(16).padStart(16, '0'),
    entropyBits,
  };
}

/** So sánh tương đồng ngoại hình hai cá thể `[0, 1]` (1 = giống hệt). */
export function appearanceSimilarity(a: Appearance, b: Appearance): number {
  let total = 0;
  for (const locus of APPEARANCE_LOCI) {
    total += 1 - Math.abs(a.loci[locus] - b.loci[locus]);
  }
  const locusSimilarity = total / APPEARANCE_LOCI.length;
  const sameSex = a.sex === b.sex ? 1 : 0.97;
  return clamp01(locusSimilarity * 0.9 + (a.signature.code === b.signature.code ? 0.1 : 0) * sameSex);
}

/** Mô tả văn bản ngắn cho render/debug. */
export function describeAppearance(appearance: Appearance): string {
  const r = appearance.render;
  return [
    `${appearance.kind} ${appearance.sex === 'female' ? 'cái' : 'đực'}`,
    `${r.heightCm.toFixed(0)}cm/${r.massKg.toFixed(0)}kg`,
    `da ${skinToneLabel(r.skinTone)}`,
    `tóc ${hairColorLabel(r.hairColor)}${r.hairGraying > 0.5 ? ' (bạc)' : ''}`,
    `mắt ${eyeColorLabel(r.eyeColor)}`,
    r.skinWrinkles > 0.4 ? 'nhiều nếp nhăn' : r.postureStoop > 0.4 ? 'lưng còng' : 'dáng thẳng',
  ].join(', ');
}

/**
 * Tạo locus ngoại hình cho bộ gen mới (trẻ sơ sinh) từ hai bố mẹ.
 * Trả về bản ghi locus đã tái tổ hợp + đột biến, sẵn sàng đưa vào genome
 * dưới dạng gene trong `genome.genes` với dominance ngẫu nhiên.
 */
export function recombineAppearanceLoci(
  parentALoci: Record<AppearanceLocus, number>,
  parentBLoci: Record<AppearanceLocus, number>,
  seed: number | string,
  options: { mutationRate?: number; mutationScale?: number } = {},
): Record<AppearanceLocus, number> {
  const random = new LifeRandom(seed);
  const mutationRate = clamp01(options.mutationRate ?? 0.03);
  const mutationScale = options.mutationScale ?? 0.05;
  const child = {} as Record<AppearanceLocus, number>;
  for (const locus of APPEARANCE_LOCI) {
    const a = parentALoci[locus] ?? 0.5;
    const b = parentBLoci[locus] ?? 0.5;
    // Trộn kiểu đa gen: trung bình có weighting ngẫu nhiên + đột biến gauss.
    const w = random.range(0.2, 0.8);
    const value = a * w + b * (1 - w);
    child[locus] = clamp01(
      random.chance(mutationRate) ? value + random.gaussian(0, mutationScale) : value,
    );
  }
  return child;
}

/** Ghi locus ngoại hình trở lại bộ gen (dùng khi sinh con). */
export function writeAppearanceLoci(
  genome: Genome,
  loci: Record<AppearanceLocus, number>,
  seed: number | string,
): Genome {
  const random = new LifeRandom(seed);
  const genes = { ...genome.genes };
  for (const locus of APPEARANCE_LOCI) {
    const value = clamp01(loci[locus]);
    genes[locus] = {
      id: locus,
      alleles: [
        { value, dominance: clamp01(value + random.gaussian(0, 0.1)) },
        { value: clamp01(value + random.gaussian(0, 0.05)), dominance: clamp01(1 - value) },
      ],
    };
  }
  return { ...genome, genes };
}

/** Ngoại hình của trẻ sơ sinh vừa chào đời. */
export function infantAppearance(
  genome: Genome,
  options: { beingId: string; kind?: BeingKind; sex: 'female' | 'male'; longevityYears: number },
): Appearance {
  return expressAppearance(genome, {
    beingId: options.beingId,
    kind: options.kind,
    sex: options.sex,
    ageYears: 0,
    longevityYears: options.longevityYears,
    stage: 'infancy',
  });
}
