/**
 * @file vision.ts
 * @module @aetheria/engine/learning/vision
 * @description Huấn luyện AI hiểu hình ảnh trên lõi engine:
 *
 * - **Pixel ops**: `VisionImage` (RGBA/RGB/Gray 8-bit), grayscale, resize
 *   (nearest/bilinear), crop, lật, chỉnh sáng/tương phản, thêm nhiễu, histogram
 *   — chuẩn bị dữ liệu cho train và augment.
 * - **Decoder thuần TS**: `decodeTga` (TGA không nén + RLE, 8/24/32 bit) và
 *   `decodeBmp` (BMP 24/32 bit không nén) — nạp ảnh không cần DOM/canvas.
 * - **Trích đặc trưng**: `ImageFeatureExtractor` — downsample lưới n×n (mean
 *   pooling) + grayscale + histogram gradient ngang/dọc (HOG-lite) thành vector
 *   đặc trưng cố định chiều, cắm vào `SupervisedTrainer` sẵn có.
 * - **CNN-lite**: `ConvNetwork` với Conv2D → ReLU → MaxPool → Flatten → Dense,
 *   backprop thủ công trên Float32Array, softmax cross-entropy + SGD momentum —
 *   dùng cho phân loại ảnh nhỏ trong game.
 * - **`VisionClassifierTrainer`**: pipeline hoàn chỉnh nạp ảnh → đặc trưng →
 *   train → predict/evaluate, trả `LearningReport` chuẩn của learning runtime.
 *
 * Không phụ thuộc DOM/WebGL; game cấp pixel từ canvas/ImageBitmap qua
 * `VisionImage`. Chú thích tiếng Việt theo quy ước dự án.
 */

import { DeepRandom, clampRange } from '../deeplearning/random.js';
import { NeuralNetwork } from '../deeplearning/nn.js';
import {
  applyNetworkGradient,
  argmaxIndex,
  backpropagateNetwork,
  createNetworkGradient,
  softmaxVector,
} from './network.js';
import type { LearningReport } from './types.js';
import { SupervisedTrainer } from './supervised.js';

// ---------------------------------------------------------------------------
// VisionImage và biến đổi pixel cơ bản
// ---------------------------------------------------------------------------

/** Ảnh pixel 8-bit dùng cho train/predict. */
export interface VisionImage {
  width: number;
  height: number;
  /** 1 = gray, 3 = RGB, 4 = RGBA. */
  channels: 1 | 3 | 4;
  /** Dữ liệu phẳng: `data[y * width * channels + x * channels + c]`. */
  data: Uint8ClampedArray;
}

/** Tạo VisionImage rỗng (mọi pixel 0). */
export function createVisionImage(width: number, height: number, channels: 1 | 3 | 4 = 4): VisionImage {
  if (width <= 0 || height <= 0) throw new RangeError('Kích thước ảnh phải dương');
  return { width, height, channels, data: new Uint8ClampedArray(width * height * channels) };
}

/** Clone ảnh. */
export function cloneImage(image: VisionImage): VisionImage {
  return { width: image.width, height: image.height, channels: image.channels, data: new Uint8ClampedArray(image.data) };
}

/** Đọc giá trị kênh tại (x, y). */
export function pixelAt(image: VisionImage, x: number, y: number, channel = 0): number {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return 0;
  return image.data[(y * image.width + x) * image.channels + channel] ?? 0;
}

/** Ghi giá trị kênh tại (x, y). */
export function setPixelAt(image: VisionImage, x: number, y: number, channel: number, value: number): void {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  image.data[(y * image.width + x) * image.channels + channel] = clampRange(value, 0, 255);
}

/** Chuyển sang grayscale (1 kênh, luminosity ITU-R BT.601). */
export function toGrayscale(image: VisionImage): VisionImage {
  const result = createVisionImage(image.width, image.height, 1);
  for (let i = 0; i < image.width * image.height; i++) {
    const base = i * image.channels;
    if (image.channels === 1) {
      result.data[i] = image.data[base] ?? 0;
    } else {
      const r = image.data[base] ?? 0;
      const g = image.data[base + 1] ?? 0;
      const b = image.data[base + 2] ?? 0;
      result.data[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }
  return result;
}

/** Bỏ kênh alpha (4 → 3). */
export function dropAlpha(image: VisionImage): VisionImage {
  if (image.channels !== 4) return cloneImage(image);
  const result = createVisionImage(image.width, image.height, 3);
  for (let i = 0; i < image.width * image.height; i++) {
    for (let c = 0; c < 3; c++) {
      result.data[i * 3 + c] = image.data[i * 4 + c] ?? 0;
    }
  }
  return result;
}

/** Resize bằng nearest-neighbor (nhanh, dùng cho augment). */
export function resizeNearest(image: VisionImage, width: number, height: number): VisionImage {
  const result = createVisionImage(width, height, image.channels);
  for (let y = 0; y < height; y++) {
    const sourceY = Math.min(image.height - 1, Math.floor((y * image.height) / height));
    for (let x = 0; x < width; x++) {
      const sourceX = Math.min(image.width - 1, Math.floor((x * image.width) / width));
      for (let c = 0; c < image.channels; c++) {
        result.data[(y * width + x) * image.channels + c] = pixelAt(image, sourceX, sourceY, c);
      }
    }
  }
  return result;
}

/** Resize bilinear (mượt hơn, dùng cho tiền xử lý chuẩn). */
export function resizeBilinear(image: VisionImage, width: number, height: number): VisionImage {
  const result = createVisionImage(width, height, image.channels);
  const scaleX = image.width / width;
  const scaleY = image.height / height;
  for (let y = 0; y < height; y++) {
    const fy = clampRange((y + 0.5) * scaleY - 0.5, 0, image.height - 1);
    const y0 = Math.floor(fy);
    const y1 = Math.min(image.height - 1, y0 + 1);
    const wy = fy - y0;
    for (let x = 0; x < width; x++) {
      const fx = clampRange((x + 0.5) * scaleX - 0.5, 0, image.width - 1);
      const x0 = Math.floor(fx);
      const x1 = Math.min(image.width - 1, x0 + 1);
      const wx = fx - x0;
      for (let c = 0; c < image.channels; c++) {
        const p00 = pixelAt(image, x0, y0, c);
        const p10 = pixelAt(image, x1, y0, c);
        const p01 = pixelAt(image, x0, y1, c);
        const p11 = pixelAt(image, x1, y1, c);
        const top = p00 + (p10 - p00) * wx;
        const bottom = p01 + (p11 - p01) * wx;
        result.data[(y * width + x) * image.channels + c] = Math.round(top + (bottom - top) * wy);
      }
    }
  }
  return result;
}

/** Cắt vùng con (kẹp biên). */
export function cropImage(
  image: VisionImage,
  x: number,
  y: number,
  width: number,
  height: number,
): VisionImage {
  const result = createVisionImage(width, height, image.channels);
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      for (let c = 0; c < image.channels; c++) {
        result.data[(dy * width + dx) * image.channels + c] = pixelAt(image, x + dx, y + dy, c);
      }
    }
  }
  return result;
}

/** Lật ngang/dọc (augment). */
export function flipImage(image: VisionImage, horizontal: boolean): VisionImage {
  const result = createVisionImage(image.width, image.height, image.channels);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const sourceX = horizontal ? image.width - 1 - x : x;
      const sourceY = horizontal ? y : image.height - 1 - y;
      for (let c = 0; c < image.channels; c++) {
        result.data[(y * image.width + x) * image.channels + c] = pixelAt(image, sourceX, sourceY, c);
      }
    }
  }
  return result;
}

/** Chỉnh sáng/tương phản (augment ánh sáng). */
export function adjustBrightnessContrast(
  image: VisionImage,
  brightnessDelta: number,
  contrastFactor: number,
): VisionImage {
  const result = cloneImage(image);
  for (let i = 0; i < result.data.length; i++) {
    const value = (result.data[i] ?? 0) * contrastFactor + brightnessDelta;
    result.data[i] = clampRange(value, 0, 255);
  }
  return result;
}

/** Thêm nhiễu Gaussian (augment). */
export function addGaussianNoise(image: VisionImage, sigma: number, seed = 1): VisionImage {
  const random = new DeepRandom(seed);
  const result = cloneImage(image);
  for (let i = 0; i < result.data.length; i++) {
    result.data[i] = clampRange((result.data[i] ?? 0) + random.gaussian(0, sigma), 0, 255);
  }
  return result;
}

/** Histogram 256 bin cho một kênh (gray mặc định kênh 0). */
export function histogram(image: VisionImage, channel = 0): number[] {
  const bins = new Array<number>(256).fill(0);
  for (let i = 0; i < image.width * image.height; i++) {
    const index = i * image.channels + channel;
    bins[clampRange(image.data[index] ?? 0, 0, 255)] += 1;
  }
  return bins;
}

// ---------------------------------------------------------------------------
// Decoder thuần TS: TGA + BMP
// ---------------------------------------------------------------------------

/** Giải mã TGA 8/24/32 bit (không nén hoặc RLE) — đủ cho texture game 2D. */
export function decodeTga(bytes: Uint8Array): VisionImage {
  if (bytes.length < 18) throw new RangeError('TGA quá ngắn');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const idLength = bytes[0] ?? 0;
  const imageType = bytes[2] ?? 0;
  const width = view.getUint16(12, true);
  const height = view.getUint16(14, true);
  const bitDepth = bytes[16] ?? 0;
  const descriptor = bytes[17] ?? 0;
  const topOrigin = (descriptor & 0x20) !== 0;
  const channels = bitDepth === 32 ? 4 : bitDepth === 24 ? 3 : 1;
  if (![1, 2, 3, 10, 11].includes(imageType)) {
    throw new RangeError(`TGA imageType ${imageType} chưa hỗ trợ`);
  }
  const isRle = imageType >= 9;
  if (channels === 1 && bitDepth !== 8) throw new RangeError('TGA grayscale cần 8 bit');
  if (channels !== 1 && bitDepth !== channels * 8) {
    throw new RangeError(`TGA depth ${bitDepth} không khớp kênh`);
  }

  const result = createVisionImage(width, height, channels as 1 | 3 | 4);
  let cursor = 18 + idLength;
  let pixelIndex = 0;
  const totalPixels = width * height;

  const writePixel = (r: number, g: number, b: number, a: number): void => {
    const y = Math.floor(pixelIndex / width);
    const x = pixelIndex % width;
    const flipY = topOrigin ? y : height - 1 - y;
    const base = (flipY * width + x) * channels;
    if (channels === 1) result.data[base] = r;
    else {
      // TGA lưu BGR → đổi sang RGB.
      result.data[base] = r;
      result.data[base + 1] = g;
      result.data[base + 2] = b;
      if (channels === 4) result.data[base + 3] = a;
    }
    pixelIndex++;
  };

  if (!isRle) {
    // writePixel tự tăng pixelIndex — dùng while để tránh tăng kép.
    while (pixelIndex < totalPixels && cursor + channels <= bytes.length) {
      if (channels === 1) {
        writePixel(bytes[cursor] ?? 0, 0, 0, 255);
        cursor += 1;
      } else {
        writePixel(bytes[cursor + 2] ?? 0, bytes[cursor + 1] ?? 0, bytes[cursor] ?? 0, channels === 4 ? bytes[cursor + 3] ?? 255 : 255);
        cursor += channels;
      }
    }
  } else {
    while (pixelIndex < totalPixels && cursor < bytes.length) {
      const packet = bytes[cursor++] ?? 0;
      const count = (packet & 0x7f) + 1;
      if (packet & 0x80) {
        // RLE packet: một pixel lặp lại count lần.
        if (channels === 1) {
          const value = bytes[cursor++] ?? 0;
          for (let i = 0; i < count && pixelIndex < totalPixels; i++) writePixel(value, 0, 0, 255);
        } else {
          const b = bytes[cursor] ?? 0;
          const g = bytes[cursor + 1] ?? 0;
          const r = bytes[cursor + 2] ?? 0;
          const a = channels === 4 ? bytes[cursor + 3] ?? 255 : 255;
          cursor += channels;
          for (let i = 0; i < count && pixelIndex < totalPixels; i++) writePixel(r, g, b, a);
        }
      } else {
        // Raw packet: count pixel liền kề.
        for (let i = 0; i < count && pixelIndex < totalPixels; i++) {
          if (channels === 1) {
            writePixel(bytes[cursor++] ?? 0, 0, 0, 255);
          } else {
            writePixel(bytes[cursor + 2] ?? 0, bytes[cursor + 1] ?? 0, bytes[cursor] ?? 0, channels === 4 ? bytes[cursor + 3] ?? 255 : 255);
            cursor += channels;
          }
        }
      }
    }
  }
  return result;
}

/** Giải mã BMP 24/32 bit không nén (BI_RGB) — đủ cho texture đơn giản. */
export function decodeBmp(bytes: Uint8Array): VisionImage {
  if (bytes.length < 54 || bytes[0] !== 0x42 || bytes[1] !== 0x4d) {
    throw new RangeError('BMP không hợp lệ');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pixelOffset = view.getUint32(10, true);
  const headerSize = view.getUint32(14, true);
  if (headerSize < 40) throw new RangeError('BMP header chưa hỗ trợ');
  const width = view.getInt32(18, true);
  const heightRaw = view.getInt32(22, true);
  const height = Math.abs(heightRaw);
  const bottomUp = heightRaw > 0;
  const bitCount = view.getUint16(28, true);
  const compression = view.getUint32(30, true);
  if (compression !== 0) throw new RangeError('Chỉ hỗ trợ BMP không nén (BI_RGB)');
  if (bitCount !== 24 && bitCount !== 32) throw new RangeError('BMP cần 24/32 bit');
  const channels = bitCount === 32 ? 4 : 3;
  const rowSize = Math.floor((bitCount * width + 31) / 32) * 4;
  const result = createVisionImage(width, height, channels as 3 | 4);
  for (let y = 0; y < height; y++) {
    const sourceY = bottomUp ? height - 1 - y : y;
    const rowStart = pixelOffset + sourceY * rowSize;
    for (let x = 0; x < width; x++) {
      const base = rowStart + x * channels;
      const target = (y * width + x) * channels;
      // BMP lưu BGR.
      result.data[target] = bytes[base + 2] ?? 0;
      result.data[target + 1] = bytes[base + 1] ?? 0;
      result.data[target + 2] = bytes[base] ?? 0;
      if (channels === 4) result.data[target + 3] = bytes[base + 3] ?? 255;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Trích đặc trưng ảnh (HOG-lite + mean pooling)
// ---------------------------------------------------------------------------

/** Cấu hình trích đặc trưng. */
export interface FeatureExtractorConfig {
  /** Kích thước chuẩn hóa trước khi trích (mặc định 16×16). */
  targetSize?: number;
  /** Chuyển grayscale trước (mặc định true). */
  grayscale?: boolean;
  /** Số bin histogram gradient mỗi hướng; 0 = tắt. */
  gradientBins?: number;
  /** Có đính kèm lưới mean-pooling n×n (mặc định 4×4). */
  poolGrid?: number;
  seed?: number;
}

/** Trích vector đặc trưng cố định chiều từ ảnh (dùng với SupervisedTrainer). */
export class ImageFeatureExtractor {
  public readonly targetSize: number;
  public readonly grayscale: boolean;
  public readonly gradientBins: number;
  public readonly poolGrid: number;

  constructor(config: FeatureExtractorConfig = {}) {
    this.targetSize = Math.max(2, Math.floor(config.targetSize ?? 16));
    this.grayscale = config.grayscale ?? true;
    this.gradientBins = Math.max(0, Math.floor(config.gradientBins ?? 8));
    this.poolGrid = Math.max(0, Math.floor(config.poolGrid ?? 4));
  }

  /** Số chiều vector đặc trưng. */
  public get featureSize(): number {
    const size = this.targetSize;
    let total = size * size * (this.grayscale ? 1 : 3);
    if (this.poolGrid > 0) total += this.poolGrid * this.poolGrid * (this.grayscale ? 1 : 3);
    if (this.gradientBins > 0) total += this.gradientBins * 2;
    return total;
  }

  /** Trích đặc trưng: chuẩn hóa → pixel phẳng + mean-pool + histogram gradient. */
  public extract(image: VisionImage): number[] {
    const normalized = resizeBilinear(
      this.grayscale && image.channels !== 1 ? toGrayscale(image) : image,
      this.targetSize,
      this.targetSize,
    );
    const channels = normalized.channels;
    const features: number[] = [];
    for (let i = 0; i < normalized.data.length; i++) {
      features.push((normalized.data[i] ?? 0) / 255);
    }
    if (this.poolGrid > 0) {
      const cell = this.targetSize / this.poolGrid;
      for (let gy = 0; gy < this.poolGrid; gy++) {
        for (let gx = 0; gx < this.poolGrid; gx++) {
          for (let c = 0; c < channels; c++) {
            let sum = 0;
            let count = 0;
            for (let dy = 0; dy < cell; dy++) {
              for (let dx = 0; dx < cell; dx++) {
                sum += pixelAt(normalized, Math.floor(gx * cell + dx), Math.floor(gy * cell + dy), c);
                count++;
              }
            }
            features.push(sum / Math.max(1, count) / 255);
          }
        }
      }
    }
    if (this.gradientBins > 0) {
      const gray = channels === 1 ? normalized : toGrayscale(normalized);
      features.push(...this.gradientHistogram(gray));
    }
    return features;
  }

  /** Histogram gradient hướng 0–180° chia bin (HOG-lite trên grayscale). */
  private gradientHistogram(gray: VisionImage): number[] {
    const bins = new Array<number>(this.gradientBins * 2).fill(0);
    const binSize = Math.PI / this.gradientBins;
    for (let y = 1; y < gray.height - 1; y++) {
      for (let x = 1; x < gray.width - 1; x++) {
        const gx = pixelAt(gray, x + 1, y) - pixelAt(gray, x - 1, y);
        const gy = pixelAt(gray, x, y + 1) - pixelAt(gray, x, y - 1);
        const magnitude = Math.hypot(gx, gy);
        if (magnitude < 1e-6) continue;
        let angle = Math.atan2(gy, gx);
        if (angle < 0) angle += Math.PI;
        const orientationBin = Math.min(this.gradientBins - 1, Math.floor(angle / binSize));
        // Bin theo hướng và bin đối xứng (chống nhiễu phản chiếu).
        bins[orientationBin] += magnitude;
        bins[this.gradientBins + orientationBin] += magnitude * 0.5;
      }
    }
    const max = Math.max(...bins, 1e-9);
    return bins.map((value) => value / max);
  }
}

// ---------------------------------------------------------------------------
// CNN-lite
// ---------------------------------------------------------------------------

/** Một mẫu ảnh cho CNN: ảnh + nhãn. */
export interface VisionSample {
  image: VisionImage;
  label: number;
  weight?: number;
}

/** Cấu hình tầng conv. */
export interface ConvLayerConfig {
  kernelSize: number;
  filterCount: number;
  stride?: number;
}

/** Tầng Conv2D thủ công (stride 1, valid padding) với Adam-lite (momentum). */
class Conv2DLayer {
  public readonly filters: number;
  public readonly kernelSize: number;
  public readonly stride: number;
  /** Trọng số `[f][ky][kx][c]`. */
  public readonly weights: number[][][][];
  public readonly biases: number[];
  private readonly velocityW: number[][][][];
  private readonly velocityB: number[];

  constructor(inputChannels: number, config: ConvLayerConfig, random: DeepRandom) {
    this.filters = config.filterCount;
    this.kernelSize = config.kernelSize;
    this.stride = Math.max(1, config.stride ?? 1);
    const bound = 1 / Math.sqrt(inputChannels * config.kernelSize * config.kernelSize);
    this.weights = Array.from({ length: config.filterCount }, () =>
      Array.from({ length: config.kernelSize }, () =>
        Array.from({ length: config.kernelSize }, () =>
          Array.from({ length: inputChannels }, () => (random.next() * 2 - 1) * bound),
        ),
      ),
    );
    this.biases = new Array<number>(config.filterCount).fill(0);
    this.velocityW = this.weights.map((f) => f.map((ky) => ky.map((kx) => kx.map(() => 0))));
    this.velocityB = new Array<number>(config.filterCount).fill(0);
  }

  /** Kích thước output cho input `size`. */
  public outputSize(size: number): number {
    return Math.max(1, Math.floor((size - this.kernelSize) / this.stride) + 1);
  }

  /** Forward: `input` H×W×C phẳng; trả output H'×W'×F phẳng (đã ghi cache). */
  public forward(
    input: Float32Array,
    inputSize: number,
    inputChannels: number,
    cache: ConvCache,
  ): Float32Array {
    const outputSize = this.outputSize(inputSize);
    const output = new Float32Array(outputSize * outputSize * this.filters);
    const stride = this.stride;
    for (let oy = 0; oy < outputSize; oy++) {
      for (let ox = 0; ox < outputSize; ox++) {
        for (let f = 0; f < this.filters; f++) {
          let sum = this.biases[f] ?? 0;
          for (let ky = 0; ky < this.kernelSize; ky++) {
            for (let kx = 0; kx < this.kernelSize; kx++) {
              const iy = oy * stride + ky;
              const ix = ox * stride + kx;
              for (let c = 0; c < inputChannels; c++) {
                sum += (this.weights[f]?.[ky]?.[kx]?.[c] ?? 0) * (input[(iy * inputSize + ix) * inputChannels + c] ?? 0);
              }
            }
          }
          output[(oy * outputSize + ox) * this.filters + f] = sum;
        }
      }
    }
    cache.input = input;
    cache.inputSize = inputSize;
    cache.inputChannels = inputChannels;
    cache.outputSize = outputSize;
    return output;
  }

  /**
   * Backprop: `gradOutput` H'×W'×F; trả gradient theo input (dùng trọng số CŨ)
   * rồi mới cập nhật trọng số tại chỗ (SGD momentum) — đúng thứ tự đạo hàm.
   */
  public backward(gradOutput: Float32Array, cache: ConvCache, learningRate: number, momentum: number): Float32Array {
    const input = cache.input;
    const inputSize = cache.inputSize;
    const inputChannels = cache.inputChannels;
    const outputSize = cache.outputSize;
    if (!input) throw new Error('Conv2DLayer cần forward trước khi backprop');
    const gradInput = new Float32Array(input.length);
    const stride = this.stride;
    for (let oy = 0; oy < outputSize; oy++) {
      for (let ox = 0; ox < outputSize; ox++) {
        for (let f = 0; f < this.filters; f++) {
          const gradO = gradOutput[(oy * outputSize + ox) * this.filters + f] ?? 0;
          if (gradO === 0) continue;
          for (let ky = 0; ky < this.kernelSize; ky++) {
            for (let kx = 0; kx < this.kernelSize; kx++) {
              const iy = oy * stride + ky;
              const ix = ox * stride + kx;
              for (let c = 0; c < inputChannels; c++) {
                const oldWeight = this.weights[f]?.[ky]?.[kx]?.[c] ?? 0;
                // Gradient theo input dùng trọng số cũ.
                gradInput[(iy * inputSize + ix) * inputChannels + c] += gradO * oldWeight;
                // Cập nhật trọng số (mỗi mẫu một bước, không chia batch).
                const gradient = gradO * (input[(iy * inputSize + ix) * inputChannels + c] ?? 0);
                this.velocityW[f][ky][kx][c] =
                  momentum * this.velocityW[f][ky][kx][c] - learningRate * gradient;
                this.weights[f][ky][kx][c] = oldWeight + this.velocityW[f][ky][kx][c];
              }
            }
          }
          this.velocityB[f] = momentum * this.velocityB[f] - learningRate * gradO;
          this.biases[f] = (this.biases[f] ?? 0) + this.velocityB[f];
        }
      }
    }
    return gradInput;
  }
}

/** Cache forward của Conv2D phục vụ backprop. */
interface ConvCache {
  input: Float32Array | null;
  inputSize: number;
  inputChannels: number;
  outputSize: number;
}

/** MaxPool 2×2 stride 2 (mặc định) — forward/backward. */
class MaxPoolLayer {
  private lastArgmax: number[] = [];
  private lastInputLength = 0;

  public outputSize(size: number, pool: number): number {
    return Math.max(1, Math.floor(size / pool));
  }

  public forward(input: Float32Array, size: number, channels: number, pool: number): Float32Array {
    const outputSize = this.outputSize(size, pool);
    const output = new Float32Array(outputSize * outputSize * channels);
    this.lastArgmax = new Array<number>(output.length).fill(-1);
    this.lastInputLength = input.length;
    for (let oy = 0; oy < outputSize; oy++) {
      for (let ox = 0; ox < outputSize; ox++) {
        for (let c = 0; c < channels; c++) {
          let best = -Infinity;
          let bestIndex = -1;
          for (let dy = 0; dy < pool; dy++) {
            for (let dx = 0; dx < pool; dx++) {
              const iy = oy * pool + dy;
              const ix = ox * pool + dx;
              const index = (iy * size + ix) * channels + c;
              const value = input[index] ?? -Infinity;
              if (value > best) {
                best = value;
                bestIndex = index;
              }
            }
          }
          const outIndex = (oy * outputSize + ox) * channels + c;
          output[outIndex] = Math.max(0, best);
          this.lastArgmax[outIndex] = bestIndex;
        }
      }
    }
    return output;
  }

  public backward(gradOutput: Float32Array): Float32Array {
    const gradInput = new Float32Array(this.lastInputLength);
    for (let i = 0; i < gradOutput.length; i++) {
      const index = this.lastArgmax[i] ?? -1;
      if (index >= 0) gradInput[index] += gradOutput[i] ?? 0;
    }
    return gradInput;
  }
}

/** Cấu hình ConvNetwork. */
export interface ConvNetworkConfig {
  /** Kích thước ảnh vuông đầu vào. */
  inputSize: number;
  channels: 1 | 3;
  /** Chuỗi tầng conv (mỗi tầng kèm ReLU; có pool sau tầng được đánh dấu). */
  convLayers: ReadonlyArray<ConvLayerConfig & { poolAfter?: boolean }>;
  /** Số tầng ẩn dense sau flatten. */
  hiddenSizes?: readonly number[];
  /** Số lớp phân loại. */
  classCount: number;
  learningRate?: number;
  momentum?: number;
  seed?: number;
}

/** Kết quả một bước train CNN. */
export interface ConvTrainResult {
  loss: number;
  accuracy: number;
  samples: number;
}

/**
 * ConvNetwork-lite: CNN nhỏ cho phân loại ảnh trong game.
 *
 * Kiến trúc: [Conv → ReLU → (MaxPool)]×N → Flatten → Dense×M → Softmax.
 * Backprop thủ công; dense tầng dùng optimizer Adam của engine.
 */
export class ConvNetwork {
  public readonly classCount: number;
  public readonly learningRate: number;
  public readonly momentum: number;
  /** Các tầng dense sau flatten (tận dụng NeuralNetwork của engine). */
  public readonly dense: NeuralNetwork;
  /** Kích thước vector sau flatten (phục vụ dựng dense). */
  public readonly flattenedSize: number;
  /** Trạng thái các tầng conv (đọc để telemetry). */
  public readonly convs: Array<{ kernelSize: number; filterCount: number; pooled: boolean }> = [];

  private readonly convLayers: Conv2DLayer[] = [];
  private readonly pools: Array<MaxPoolLayer | null> = [];
  private readonly poolSize = 2;
  private readonly random: DeepRandom;
  private readonly inputSize: number;
  private readonly inputChannels: number;
  private readonly caches: ConvCache[] = [];
  private reluMasks: Float32Array[] = [];

  constructor(config: ConvNetworkConfig) {
    if (config.inputSize <= 0) throw new RangeError('inputSize phải dương');
    if (config.convLayers.length === 0) throw new RangeError('Cần ít nhất một tầng conv');
    this.classCount = config.classCount;
    this.learningRate = config.learningRate ?? 0.01;
    this.momentum = config.momentum ?? 0.9;
    this.random = new DeepRandom(config.seed ?? 1);
    this.inputSize = config.inputSize;
    this.inputChannels = config.channels;

    let size = config.inputSize;
    let channels = config.channels;
    for (const layerConfig of config.convLayers) {
      const layer = new Conv2DLayer(channels, layerConfig, this.random);
      this.convLayers.push(layer);
      this.caches.push({ input: null, inputSize: size, inputChannels: channels, outputSize: layer.outputSize(size) });
      size = layer.outputSize(size);
      channels = layerConfig.filterCount as 1 | 3;
      if (layerConfig.poolAfter) {
        this.pools.push(new MaxPoolLayer());
        size = Math.max(1, Math.floor(size / this.poolSize));
      } else {
        this.pools.push(null);
      }
      this.convs.push({ kernelSize: layerConfig.kernelSize, filterCount: layerConfig.filterCount, pooled: layerConfig.poolAfter ?? false });
    }
    this.flattenedSize = size * size * channels;

    const hidden = config.hiddenSizes ?? [16];
    const sizes = [this.flattenedSize, ...hidden, config.classCount];
    this.dense = new NeuralNetwork({
      inputSize: sizes[0],
      hiddenSizes: sizes.slice(1, -1),
      outputSize: config.classCount,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer: { kind: 'adam', learningRate: config.learningRate ?? 0.01, weightDecay: 0.0001 },
      seed: (config.seed ?? 1) + 99,
    });
  }

  /** Forward đặc trưng qua conv → flatten → dense logits. */
  public forwardLogits(image: VisionImage): number[] {
    const prepared = this.prepareInput(image);
    let current = prepared;
    let currentSize = this.inputSize;
    let currentChannels = this.inputChannels;
    this.reluMasks = [];
    for (let i = 0; i < this.convLayers.length; i++) {
      current = this.convLayers[i].forward(current, currentSize, currentChannels, this.caches[i]);
      currentSize = this.caches[i].outputSize;
      currentChannels = this.convLayers[i].filters as 1 | 3;
      // ReLU với mask phục vụ backprop.
      const mask = new Float32Array(current.length);
      for (let j = 0; j < current.length; j++) {
        if ((current[j] ?? 0) <= 0) current[j] = 0;
        else mask[j] = 1;
      }
      this.reluMasks.push(mask);
      const pool = this.pools[i];
      if (pool) {
        current = pool.forward(current, currentSize, currentChannels, this.poolSize);
        currentSize = pool.outputSize(currentSize, this.poolSize);
      }
    }
    return this.dense.predict(Array.from(current));
  }

  /** Xác suất phân loại (softmax trên logits). */
  public predict(image: VisionImage): number[] {
    return softmaxVector(this.forwardLogits(image));
  }

  /**
   * Một bước train trên minibatch: softmax CE → backprop dense (Adam của
   * engine, gradient tích lũy toàn batch rồi áp một lần) → ReLU → pool → conv
   * (cập nhật trọng số conv tại chỗ, SGD momentum).
   */
  public trainStep(samples: readonly VisionSample[]): ConvTrainResult {
    if (samples.length === 0) return { loss: 0, accuracy: 0, samples: 0 };
    let lossTotal = 0;
    let correct = 0;
    const denseGradient = createNetworkGradient(this.dense);

    for (const sample of samples) {
      const prepared = this.prepareInput(sample.image);
      let current = prepared;
      let currentSize = this.inputSize;
      let currentChannels = this.inputChannels;
      const reluMasks: Float32Array[] = [];
      for (let i = 0; i < this.convLayers.length; i++) {
        current = this.convLayers[i].forward(current, currentSize, currentChannels, this.caches[i]);
        currentSize = this.caches[i].outputSize;
        currentChannels = this.convLayers[i].filters as 1 | 3;
        const mask = new Float32Array(current.length);
        for (let j = 0; j < current.length; j++) {
          if ((current[j] ?? 0) <= 0) current[j] = 0;
          else mask[j] = 1;
        }
        reluMasks.push(mask);
        const pool = this.pools[i];
        if (pool) {
          current = pool.forward(current, currentSize, currentChannels, this.poolSize);
          currentSize = pool.outputSize(currentSize, this.poolSize);
        }
      }
      const flattened = Array.from(current);
      const logits = this.dense.forward(flattened, true);
      const probabilities = softmaxVector(logits);
      const label = clampRange(sample.label, 0, this.classCount - 1);
      const weight = Math.max(0, sample.weight ?? 1);
      lossTotal += -Math.log(Math.max(probabilities[label] ?? 1e-12, 1e-12)) * weight;
      if (argmaxIndex(probabilities) === label) correct++;

      // Gradient theo logits (softmax CE) → backprop dense tích lũy.
      const gradLogits = probabilities.map(
        (probability, index) => ((probability - (index === label ? 1 : 0)) * weight) / samples.length,
      );
      const gradFlatten = backpropagateNetwork(this.dense, gradLogits, {
        gradient: denseGradient,
        skipOutputActivation: true,
        apply: false,
      }).gradInput;
      let grad: Float32Array = Float32Array.from(gradFlatten);
      for (let i = this.convLayers.length - 1; i >= 0; i--) {
        const mask = reluMasks[i];
        for (let j = 0; j < grad.length; j++) grad[j] *= mask[j] ?? 0;
        const pool = this.pools[i];
        if (pool) grad = Float32Array.from(pool.backward(grad));
        grad = this.convLayers[i].backward(grad, this.caches[i], this.learningRate, this.momentum);
      }
    }

    applyNetworkGradient(this.dense, denseGradient, {
      optimizer: this.dense.optimizer,
      batchSize: samples.length,
    });

    return {
      loss: lossTotal / samples.length,
      accuracy: correct / samples.length,
      samples: samples.length,
    };
  }

  /** Chuẩn bị input: resize về inputSize và channels chuẩn. */
  private prepareInput(image: VisionImage): Float32Array {
    let prepared = image;
    if (prepared.width !== this.inputSize || prepared.height !== this.inputSize) {
      prepared = resizeBilinear(prepared, this.inputSize, this.inputSize);
    }
    if (prepared.channels !== this.inputChannels) {
      prepared = this.inputChannels === 1 ? toGrayscale(prepared) : dropAlpha(prepared);
    }
    const data = new Float32Array(prepared.data.length);
    for (let i = 0; i < prepared.data.length; i++) {
      data[i] = (prepared.data[i] ?? 0) / 127.5 - 1;
    }
    return data;
  }
}

// ---------------------------------------------------------------------------
// VisionClassifierTrainer: pipeline nạp ảnh → train → predict
// ---------------------------------------------------------------------------

/** Chế độ phân loại: vector đặc trưng + MLP (nhanh, hội tụ chắc) hoặc CNN-lite. */
export type VisionMode = 'features' | 'cnn';

/** Cấu hình VisionClassifierTrainer. */
export interface VisionClassifierConfig {
  mode?: VisionMode;
  /** Cấu hình trích đặc trưng (chế độ features). */
  features?: FeatureExtractorConfig;
  /** Cấu hình CNN (chế độ cnn). */
  cnn?: ConvNetworkConfig;
  /** Tầng ẩn MLP cho chế độ features. */
  hiddenSizes?: readonly number[];
  learningRate?: number;
  seed?: number;
}

/** Kết quả đánh giá phân loại. */
export interface VisionEvaluation {
  accuracy: number;
  samples: number;
  loss: number;
}

/**
 * VisionClassifierTrainer: train AI hiểu hình ảnh.
 *
 * Chế độ `features` (mặc định): trích vector đặc trưng (mean-pool + HOG-lite)
 * rồi train MLP bằng `SupervisedTrainer` — hội tụ chắc trên dữ liệu nhỏ.
 * Chế độ `cnn`: `ConvNetwork` học trực tiếp từ pixel.
 */
export class VisionClassifierTrainer {
  public readonly mode: VisionMode;
  public readonly extractor: ImageFeatureExtractor;
  public readonly cnn: ConvNetwork | null;
  public readonly labelNames: readonly string[];

  private readonly classifier: NeuralNetwork;
  private readonly trainer: SupervisedTrainer;
  private readonly classCount: number;

  constructor(classCount: number, config: VisionClassifierConfig = {}) {
    if (classCount < 2) throw new RangeError('Cần ít nhất 2 lớp');
    this.mode = config.mode ?? 'features';
    this.classCount = classCount;
    this.labelNames = Array.from({ length: classCount }, (_, index) => `class_${index}`);
    const seed = config.seed ?? 1;
    if (this.mode === 'cnn') {
      this.cnn = new ConvNetwork({
        ...(config.cnn ?? { inputSize: 8, channels: 1 as const, convLayers: [{ kernelSize: 3, filterCount: 2 }], classCount }),
        classCount,
      });
      this.extractor = new ImageFeatureExtractor();
      this.classifier = this.cnn.dense;
    } else {
      this.cnn = null;
      this.extractor = new ImageFeatureExtractor(config.features);
      this.classifier = new NeuralNetwork({
        inputSize: this.extractor.featureSize,
        hiddenSizes: config.hiddenSizes ?? [24],
        outputSize: classCount,
        hiddenActivation: 'tanh',
        outputActivation: 'linear',
        optimizer: { kind: 'adam', learningRate: config.learningRate ?? 0.01, weightDecay: 0.0001 },
        seed,
      });
    }
    this.trainer = new SupervisedTrainer(this.classifier, { loss: 'crossEntropy' });
  }

  /** Trích đặc trưng của một ảnh (chế độ features). */
  public extractFeatures(image: VisionImage): number[] {
    return this.extractor.extract(image);
  }

  /** Mẫu one-hot từ nhãn. */
  private targetFor(label: number): number[] {
    const target = new Array<number>(this.classCount).fill(0);
    target[clampRange(label, 0, this.classCount - 1)] = 1;
    return target;
  }

  /** Huấn luyện từ mẫu ảnh; trả `LearningReport` chuẩn hóa. */
  public fit(
    samples: readonly VisionSample[],
    options: { epochs?: number; batchSize?: number; augmentations?: number } = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 20));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 8));
    const augmented = options.augmentations ?? 0;
    let finalLoss = 0;
    let initialLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    if (this.mode === 'cnn') {
      for (let epoch = 0; epoch < epochs; epoch++) {
        let epochLoss = 0;
        for (let start = 0; start < samples.length; start += batchSize) {
          const batch = samples.slice(start, start + batchSize);
          const result = this.cnn!.trainStep(batch);
          epochLoss += result.loss;
          steps++;
        }
        finalLoss = samples.length > 0 ? epochLoss / Math.ceil(samples.length / batchSize) : 0;
        if (epoch === 0) initialLoss = finalLoss;
        bestLoss = Math.min(bestLoss, finalLoss);
      }
      return {
        epochs,
        steps,
        samples: samples.length,
        initialLoss,
        finalLoss,
        bestLoss: Number.isFinite(bestLoss) ? bestLoss : finalLoss,
        lossHistory: [],
        metrics: { mode: 1 },
        elapsedMs: Date.now() - startedAt,
        stoppedEarly: false,
      };
    }

    // Chế độ features: chuyển ảnh thành mẫu vector one-hot rồi fit.
    const featureSamples = samples.map((sample) => ({
      input: this.extractFeatures(sample.image),
      target: this.targetFor(sample.label),
      weight: sample.weight,
    }));
    const report = this.trainer.fit(featureSamples, {
      epochs,
      batchSize,
      shuffle: true,
      seed: 1,
    });
    return { ...report, metrics: { ...report.metrics, mode: 0 } };
  }

  /** Dự đoán nhãn + phân phối xác suất. */
  public predict(image: VisionImage): { label: number; scores: number[] } {
    const scores = this.mode === 'cnn'
      ? this.cnn!.predict(image)
      : softmaxVector(this.classifier.predict(this.extractFeatures(image)));
    return { label: argmaxIndex(scores), scores };
  }

  /** Đánh giá accuracy/loss trên tập kiểm tra. */
  public evaluate(samples: readonly VisionSample[]): VisionEvaluation {
    if (samples.length === 0) return { accuracy: 0, samples: 0, loss: 0 };
    let correct = 0;
    let loss = 0;
    for (const sample of samples) {
      const { scores } = this.predict(sample.image);
      const label = clampRange(sample.label, 0, this.classCount - 1);
      if (argmaxIndex(scores) === label) correct++;
      loss += -Math.log(Math.max(scores[label] ?? 1e-12, 1e-12));
    }
    return { accuracy: correct / samples.length, samples: samples.length, loss: loss / samples.length };
  }

  /** Đánh giá giá trị trung bình của một ảnh (debug nội dung). */
  public imageMeanBrightness(image: VisionImage): number {
    const gray = image.channels === 1 ? image : toGrayscale(image);
    let sum = 0;
    for (let i = 0; i < gray.data.length; i++) sum += gray.data[i] ?? 0;
    return sum / Math.max(1, gray.data.length) / 255;
  }
}
