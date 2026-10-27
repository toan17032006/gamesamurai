/**
 * @file image-dataset.ts
 * @module @aetheria/engine/training/image-dataset
 * @description Pipeline dataset HÌNH ẢNH cho train AI sinh assets:
 *
 * - **Bóc tách từng phần** trong ảnh (`describeImageRegions`): chia ảnh thành
 *   vùng (grid tiles + full frame), mỗi vùng mô tả đầy đủ thuộc tính — màu
 *   trung bình, độ sáng, tương phản, cường độ mép, mật độ texture, màu chủ đạo.
 * - **Chấm điểm chuẩn** (`scoreImageRegion`): 4 tiêu chí — sáng hợp lý, tương
 *   phản cân bằng, mép nét vừa phải, màu không cháy — lọc lấy mục đúng chuẩn.
 * - **Đưa hết về cùng một kiểu** (`UnifiedTrainingRecord`): shape dataset và
 *   image region dataset quy về CÙNG một record có vector đặc trưng chuẩn hóa
 *   độ dài cố định + quality + groundTruth — dùng train lại model khác về sau.
 *
 * Module thuần TS — pixel dữ liệu do caller cấp (script dùng `sharp` decode
 * JPEG, engine giữ `decodeTga`/`decodeBmp` cho TGA/BMP). Không phụ thuộc DOM.
 */

import { clamp01 } from '../deeplearning/random.js';
import type { VisionImage } from '../learning/vision.js';

/** Số chiều vector đặc trưng chuẩn hóa của `UnifiedTrainingRecord`. */
export const UNIFIED_FEATURE_DIM = 64;

/** Một vùng (component) đã bóc tách từ ảnh — mô tả đầy đủ thuộc tính. */
export interface ImageRegionRecord {
  /** `tenanh.jpg#tile_r{row}c{col}` hoặc `#full`. */
  regionId: string;
  /** Tên file ảnh gốc. */
  sourceImage: string;
  /** Loại vùng: tile lưới hoặc toàn khung. */
  regionKind: 'tile' | 'full';
  /** Biên vùng theo pixel ảnh gốc. */
  bounds: { x: number; y: number; width: number; height: number };
  /** Màu trung bình RGB (0–255). */
  meanColor: [number, number, number];
  /** Độ sáng chuẩn hóa [0,1]. */
  brightness: number;
  /** Tương phản (std luminance) [0,1]. */
  contrast: number;
  /** Cường độ mép trung bình (gradient) [0,1]. */
  edgeIntensity: number;
  /** Phương sai gradient (mật độ texture) [0,1]. */
  textureDensity: number;
  /** Màu chủ đạo (bin RGB 4×4×4 = 64 bin, lấy max). */
  dominantColorBin: number;
  /** Điểm chất lượng tổng hợp [0,1]. */
  quality: number;
}

/** Record thống nhất — shape dataset và image dataset cùng một kiểu. */
export interface UnifiedTrainingRecord {
  kind: 'shape' | 'image-region';
  source: string;
  label: string;
  /** Vector đặc trưng chuẩn hóa độ dài cố định `UNIFIED_FEATURE_DIM`. */
  features: number[];
  /** Điểm chất lượng [0,1] — chỉ record đạt chuẩn mới vào dataset cuối. */
  quality: number;
  groundTruth: string;
  /** Mô tả thuộc tính thành phần (tiếng Việt, cho audit/hiển thị). */
  description: string;
}

/** Chuẩn hóa vector đặc trưng về độ dài cố định (pad 0 / truncate). */
export function normalizeFeatureVector(features: readonly number[]): number[] {
  const out = new Array<number>(UNIFIED_FEATURE_DIM).fill(0);
  for (let i = 0; i < Math.min(UNIFIED_FEATURE_DIM, features.length); i++) {
    const value = features[i] ?? 0;
    out[i] = Number.isFinite(value) ? clamp01(value) : 0;
  }
  return out;
}

/**
 * Bóc tách ảnh thành các vùng component: `grid`×`grid` tile + 1 full frame.
 * Mỗi vùng mô tả đầy đủ thuộc tính màu/sáng/tương phản/mép/texture.
 */
export function describeImageRegions(
  image: VisionImage,
  sourceImage: string,
  options: { grid?: number; qualityThreshold?: number } = {},
): ImageRegionRecord[] {
  const grid = Math.max(1, Math.floor(options.grid ?? 4));
  const threshold = options.qualityThreshold ?? 0.5;
  const records: ImageRegionRecord[] = [];

  const describeArea = (
    regionId: string,
    regionKind: 'tile' | 'full',
    x: number,
    y: number,
    width: number,
    height: number,
  ): ImageRegionRecord => {
    const channels = image.channels;
    let count = 0;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let lumSum = 0;
    let lumSqSum = 0;
    let gradSum = 0;
    let gradSqSum = 0;
    const colorBins = new Array<number>(64).fill(0);
    const lumAt = (px: number, py: number): number => {
      const base = (py * image.width + px) * channels;
      if (channels === 1) return image.data[base] ?? 0;
      const r = image.data[base] ?? 0;
      const g = image.data[base + 1] ?? 0;
      const b = image.data[base + 2] ?? 0;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };
    for (let py = y; py < y + height; py++) {
      for (let px = x; px < x + width; px++) {
        const base = (py * image.width + px) * channels;
        const r = image.data[base] ?? 0;
        const g = image.data[base + 1] ?? 0;
        const b = image.data[base + 2] ?? 0;
        rSum += r;
        gSum += g;
        bSum += b;
        const lum = channels === 1 ? r : 0.299 * r + 0.587 * g + 0.114 * b;
        lumSum += lum;
        lumSqSum += lum * lum;
        count++;
        // Dominant color bin: RGB 4 mức mỗi kênh.
        const bin =
          Math.min(3, Math.floor((r / 255) * 4)) * 16 +
          Math.min(3, Math.floor((g / 255) * 4)) * 4 +
          Math.min(3, Math.floor((b / 255) * 4));
        colorBins[bin] += 1;
        // Gradient (sobel-lite: chênh láng nhau trong vùng).
        if (px + 1 < x + width && py + 1 < y + height) {
          const right = lumAt(px + 1, py);
          const down = lumAt(px, py + 1);
          const grad = Math.hypot(right - lum, down - lum);
          gradSum += grad;
          gradSqSum += grad * grad;
        }
      }
    }
    count = Math.max(1, count);
    const meanColor: [number, number, number] = [
      Math.round(rSum / count),
      Math.round(gSum / count),
      Math.round(bSum / count),
    ];
    const brightness = lumSum / count / 255;
    const meanLum = lumSum / count;
    const contrast = Math.sqrt(Math.max(0, lumSqSum / count - meanLum * meanLum)) / 255;
    const gradCount = Math.max(1, Math.max(0, (width - 1) * (height - 1)));
    const edgeIntensity = clamp01(gradSum / gradCount / 128);
    const gradMean = gradSum / gradCount;
    const gradVar = Math.max(0, gradSqSum / gradCount - gradMean * gradMean);
    const textureDensity = clamp01(Math.sqrt(gradVar) / 128);
    let dominantColorBin = 0;
    let maxBin = -1;
    for (let bin = 0; bin < 64; bin++) {
      if (colorBins[bin] > maxBin) {
        maxBin = colorBins[bin];
        dominantColorBin = bin;
      }
    }

    // Chấm điểm 4 tiêu chí "chuẩn/mượt/nét/đẹp" của vùng ảnh:
    const brightnessScore = 1 - clamp01(Math.abs(brightness - 0.5) / 0.5); // quá tối/chói giảm
    const smooth = clamp01(1 - textureDensity * 0.6); // texture quá dày = gắt
    const sharp = clamp01(edgeIntensity / 0.35); // mép đủ nét (0.35 = mốc nét rõ)
    const beauty = clamp01(1 - Math.abs(contrast - 0.2) / 0.4); // tương phản cân bằng
    const quality =
      0.3 * brightnessScore + 0.25 * smooth + 0.25 * Math.min(1, sharp) + 0.2 * beauty;

    return {
      regionId,
      sourceImage,
      regionKind,
      bounds: { x, y, width, height },
      meanColor,
      brightness: Number(brightness.toFixed(4)),
      contrast: Number(contrast.toFixed(4)),
      edgeIntensity: Number(edgeIntensity.toFixed(4)),
      textureDensity: Number(textureDensity.toFixed(4)),
      dominantColorBin,
      quality: Number(clamp01(quality).toFixed(4)),
    };
  };

  // Full frame.
  records.push(describeArea(`${sourceImage}#full`, 'full', 0, 0, image.width, image.height));
  // Grid tiles.
  const tileW = Math.floor(image.width / grid);
  const tileH = Math.floor(image.height / grid);
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      records.push(
        describeArea(
          `${sourceImage}#tile_r${row}c${col}`,
          'tile',
          col * tileW,
          row * tileH,
          tileW,
          tileH,
        ),
      );
    }
  }

  // Lọc: chỉ giữ vùng đạt chuẩn (threshold) + luôn giữ full frame để không mất ảnh.
  return records.filter((record) => record.regionKind === 'full' || record.quality >= threshold);
}

/** Đặc trưng hình học của shape sample (khớp pool của MassTrainingLoop). */
export interface ShapeSampleLike {
  aspectRatio: number;
  relativeArea: number;
  vertexCount: number;
  centerHeightRatio: number;
  solidity: number;
}

/** Quy đổi shape sample → đặc trưng chuẩn hóa [0,1] (khớp chiều ảnh). */
export function shapeSampleFeatures(sample: ShapeSampleLike): number[] {
  return normalizeFeatureVector([
    clamp01((sample.aspectRatio - 0.2) / 2.8),
    clamp01(sample.relativeArea),
    clamp01(sample.vertexCount / 200),
    clamp01(sample.centerHeightRatio),
    clamp01(sample.solidity),
    clamp01(sample.vertexCount / Math.max(1e-6, sample.relativeArea) / 120),
  ]);
}

/** Quy đổi image region → đặc trưng chuẩn hóa (cùng chiều với shape). */
export function regionFeatures(record: ImageRegionRecord): number[] {
  return normalizeFeatureVector([
    record.brightness,
    record.contrast,
    record.edgeIntensity,
    record.textureDensity,
    record.meanColor[0] / 255,
    record.meanColor[1] / 255,
    record.meanColor[2] / 255,
    (record.dominantColorBin % 4) / 3,
    Math.floor(record.dominantColorBin / 16) / 3,
    record.regionKind === 'full' ? 1 : 0,
  ]);
}

/** Mô tả thuộc tính vùng ảnh bằng tiếng Việt (audit/hiển thị). */
export function describeRegionInWords(record: ImageRegionRecord): string {
  const tone =
    record.brightness < 0.25 ? 'tối' : record.brightness > 0.75 ? 'sáng' : 'vừa';
  const detail =
    record.edgeIntensity < 0.1 ? 'mềm' : record.edgeIntensity > 0.35 ? 'nét rõ' : 'vừa';
  const texture =
    record.textureDensity < 0.15 ? 'phẳng mịn' : record.textureDensity > 0.5 ? 'nhiều chi tiết' : 'chi tiết vừa';
  return (
    `vùng ${record.regionKind === 'full' ? 'toàn khung' : 'tile'} ${tone}, ${detail}, ${texture}, ` +
    `màu chủ đạo RGB(${record.meanColor.join(', ')}), tương phản ${(record.contrast * 100).toFixed(0)}%`
  );
}

/** Chuyển region record thành UnifiedTrainingRecord (loại bỏ region không đạt). */
export function regionToUnified(record: ImageRegionRecord): UnifiedTrainingRecord {
  return {
    kind: 'image-region',
    source: record.sourceImage,
    label: record.regionId,
    features: regionFeatures(record),
    quality: record.quality,
    groundTruth: `tone_${record.brightness < 0.33 ? 'dark' : record.brightness < 0.66 ? 'mid' : 'bright'}`,
    description: describeRegionInWords(record),
  };
}

/** Chuyển shape sample thành UnifiedTrainingRecord. */
export function shapeToUnified(
  sample: ShapeSampleLike,
  category: string,
  source: string,
  quality: number,
): UnifiedTrainingRecord {
  return {
    kind: 'shape',
    source,
    label: `${category}_${sample.vertexCount}`,
    features: shapeSampleFeatures(sample),
    quality,
    groundTruth: category,
    description: `shape ${category}: AR=${sample.aspectRatio.toFixed(2)}, solidity=${sample.solidity.toFixed(2)}, ${sample.vertexCount} đỉnh`,
  };
}
