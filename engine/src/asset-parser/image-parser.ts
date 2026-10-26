/**
 * @file image-parser.ts
 * @module @aetheria/engine/asset-parser/image-parser
 * @description Bóc tách tệp ảnh (png, jpg, jpeg, webp, tga, exr, hdr).
 *
 * Engine đọc **header** ảnh bằng tay để lấy kích thước, số kênh, bit depth và
 * không gian màu — việc này chạy được ở cả trình duyệt lẫn môi trường
 * headless (build/CLI/test) mà không cần canvas hay DOM. Khi chạy trong
 * trình duyệt, texture thật được tạo qua loader của three.js.
 */

import * as THREE from 'three';

export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'tga' | 'exr' | 'hdr';

export interface ImageInfo {
  format: ImageFormat;
  width: number;
  height: number;
  /** Số kênh màu (RGB = 3, RGBA = 4, 0 = không xác định). */
  channels: number;
  /** Bit depth mỗi kênh (0 = không xác định). */
  bitDepth: number;
  /** 'srgb' | 'linear' */
  colorSpace: 'srgb' | 'linear';
  /** Có alpha hay không (nếu biết). */
  hasAlpha: boolean;
}

export interface ImageParseResult {
  info: ImageInfo;
  /** Texture thật — chỉ có khi chạy trong trình duyệt. */
  texture?: THREE.Texture;
  /** Cảnh báo nếu header không khớp định dạng khai báo. */
  warnings: string[];
}

/** Chữ ký nhị phân của từng định dạng. */
const SIGNATURES: Array<{ format: ImageFormat; test: (b: Uint8Array) => boolean }> = [
  { format: 'png', test: (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { format: 'jpg', test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { format: 'webp', test: (b) => b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
  { format: 'exr', test: (b) => b.length > 4 && b[0] === 0x76 && b[1] === 0x2f && b[2] === 0x31 && b[3] === 0x01 },
  { format: 'hdr', test: (b) => b.length > 10 && new TextDecoder().decode(b.subarray(0, 10)).startsWith('#?RADIANCE') },
];

/** Nhận diện định dạng ảnh từ chữ ký (tga không có chữ ký → dùng phần mở rộng). */
export function detectImageFormat(bytes: Uint8Array, declared?: string): ImageFormat | null {
  for (const sig of SIGNATURES) {
    if (sig.test(bytes)) return sig.format;
  }
  // TGA: header 18 byte, byte 1 = color map type (0/1), byte 2 = kiểu ảnh (1/2/3).
  if (bytes.length > 18) {
    const colorMapType = bytes[1];
    const imageType = bytes[2];
    if ((colorMapType === 0 || colorMapType === 1) && imageType >= 1 && imageType <= 3) return 'tga';
  }
  if (declared) {
    const d = declared.toLowerCase();
    if (d === 'jpeg') return 'jpeg';
    if (d === 'jpg') return 'jpg';
    if (d === 'tga') return 'tga';
  }
  return null;
}

/** Đọc header PNG (IHDR). */
function readPngHeader(bytes: Uint8Array): ImageInfo | null {
  if (bytes.length < 33) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  const bitDepth = bytes[24];
  const colorType = bytes[25];
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType] ?? 0;
  return {
    format: 'png',
    width,
    height,
    channels,
    bitDepth,
    colorSpace: 'srgb',
    hasAlpha: colorType === 4 || colorType === 6,
  };
}

/** Đọc header JPEG (đánh dấu SOFn). */
function readJpegHeader(bytes: Uint8Array): ImageInfo | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = bytes[offset + 1];
    // SOF0..SOF15 (bỏ qua DHT/JPG/DAC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const height = view.getUint16(offset + 5, false);
      const width = view.getUint16(offset + 7, false);
      const components = bytes[offset + 9];
      return {
        format: 'jpg',
        width,
        height,
        channels: components,
        bitDepth: bytes[offset + 4],
        colorSpace: 'srgb',
        hasAlpha: components === 4,
      };
    }
    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (segmentLength <= 0) return null;
    offset += 2 + segmentLength;
  }
  return null;
}

/** Đọc header WebP (VP8 / VP8L / VP8X). */
function readWebpHeader(bytes: Uint8Array): ImageInfo | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunk = new TextDecoder().decode(bytes.subarray(12, 16));

  if (chunk === 'VP8X') {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { format: 'webp', width, height, channels: 4, bitDepth: 8, colorSpace: 'srgb', hasAlpha: true };
  }
  if (chunk === 'VP8 ') {
    // Khối lossy: 3 byte tag + 3 byte kích thước
    const width = view.getUint16(26, true) & 0x3fff;
    const height = view.getUint16(28, true) & 0x3fff;
    return { format: 'webp', width, height, channels: 3, bitDepth: 8, colorSpace: 'srgb', hasAlpha: false };
  }
  if (chunk === 'VP8L') {
    const bits = view.getUint32(21, true);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { format: 'webp', width, height, channels: 4, bitDepth: 8, colorSpace: 'srgb', hasAlpha: true };
  }
  return null;
}

/** Đọc header TGA (18 byte). */
function readTgaHeader(bytes: Uint8Array): ImageInfo | null {
  if (bytes.length < 18) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint16(12, true);
  const height = view.getUint16(14, true);
  const pixelDepth = bytes[16];
  const descriptor = bytes[17];
  const channels = pixelDepth === 32 ? 4 : pixelDepth === 24 ? 3 : pixelDepth === 16 ? 2 : 1;
  return {
    format: 'tga',
    width,
    height,
    channels,
    bitDepth: pixelDepth,
    colorSpace: 'srgb',
    hasAlpha: (descriptor & 0x0f) > 0,
  };
}

/** Đọc header OpenEXR (magic + attributes). */
function readExrHeader(bytes: Uint8Array): ImageInfo | null {
  if (bytes.length < 8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // magic(4) + version(4): byte thấp của version là số phiên bản định dạng.
  const version = view.getUint32(4, true) & 0xff;

  // Tìm attribute "dataWindow" (box2i) để lấy kích thước.
  let offset = 8;
  let width = 0;
  let height = 0;
  while (offset + 8 < bytes.length) {
    const name = new TextDecoder().decode(bytes.subarray(offset, offset + 8)).replace(/\0+$/, '');
    if (!name) break;
    offset += 8;
    const size = view.getUint32(offset, true);
    offset += 4;
    if (name === 'dataWindow') {
      // box2i: xMin, yMin, xMax, yMax (int32)
      if (offset + 16 <= bytes.length) {
        const xMin = view.getInt32(offset, true);
        const yMin = view.getInt32(offset + 4, true);
        const xMax = view.getInt32(offset + 8, true);
        const yMax = view.getInt32(offset + 12, true);
        width = xMax - xMin + 1;
        height = yMax - yMin + 1;
      }
      offset += size;
      // Bỏ qua type name của attribute tiếp theo
      continue;
    }
    // Bỏ qua type name + value
    const typeEnd = bytes.indexOf(0, offset);
    if (typeEnd < 0) break;
    offset = typeEnd + 1 + size;
  }

  return {
    format: 'exr',
    width,
    height,
    channels: 0,
    bitDepth: 16,
    colorSpace: 'linear',
    hasAlpha: false,
  };
}

/** Đọc header Radiance HDR. */
function readHdrHeader(bytes: Uint8Array): ImageInfo | null {
  const text = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 512)));
  const resolutionMatch = /-Y\s+(\d+)\s+\+X\s+(\d+)/.exec(text);
  if (!resolutionMatch) return null;
  return {
    format: 'hdr',
    width: Number(resolutionMatch[2]),
    height: Number(resolutionMatch[1]),
    channels: 3,
    bitDepth: 32,
    colorSpace: 'linear',
    hasAlpha: false,
  };
}

/** Đọc thông tin header của ảnh theo định dạng. */
export function readImageInfo(bytes: Uint8Array, format: ImageFormat): ImageInfo | null {
  switch (format) {
    case 'png':
      return readPngHeader(bytes);
    case 'jpg':
    case 'jpeg':
      return readJpegHeader(bytes);
    case 'webp':
      return readWebpHeader(bytes);
    case 'tga':
      return readTgaHeader(bytes);
    case 'exr':
      return readExrHeader(bytes);
    case 'hdr':
      return readHdrHeader(bytes);
    default:
      return null;
  }
}

/** Môi trường có DOM để tạo texture thật hay không. */
function hasDom(): boolean {
  return typeof document !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
}

/**
 * Bóc tách tệp ảnh.
 *
 * @param bytes - nội dung tệp ảnh
 * @param declared - định dạng khai báo (từ phần mở rộng) để dùng khi không
 *   nhận diện được bằng chữ ký (ví dụ TGA).
 */
export function parseImage(
  bytes: Uint8Array,
  declared: ImageFormat,
  options: { name?: string; srgb?: boolean } = {},
): ImageParseResult {
  const warnings: string[] = [];
  const detected = detectImageFormat(bytes, declared);

  if (!detected) {
    throw new Error(`AssetParser: không nhận diện được định dạng ảnh (khai báo "${declared}")`);
  }
  if (detected !== declared && !(declared === 'jpeg' && detected === 'jpg')) {
    warnings.push(`Định dạng ảnh khai báo "${declared}" nhưng chữ ký là "${detected}".`);
  }

  const info = readImageInfo(bytes, detected);
  if (!info) {
    warnings.push(`Không đọc được header ảnh "${detected}" — thiếu thông tin kích thước.`);
  }

  const result: ImageParseResult = {
    info: info ?? {
      format: detected,
      width: 0,
      height: 0,
      channels: 0,
      bitDepth: 0,
      colorSpace: detected === 'exr' || detected === 'hdr' ? 'linear' : 'srgb',
      hasAlpha: false,
    },
    warnings,
  };

  // Tạo texture thật khi có DOM.
  if (hasDom() && typeof Blob !== 'undefined') {
    const colorSpace = options.srgb ?? (detected === 'exr' || detected === 'hdr' ? false : true);
    const blob = new Blob([bytes as unknown as BlobPart]);
    const url = URL.createObjectURL(blob);

    const texture = new THREE.Texture();
    texture.name = options.name ?? 'ImageTexture';
    texture.colorSpace = colorSpace ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;

    const image = new Image();
    image.onload = () => {
      texture.image = image;
      texture.needsUpdate = true;
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
    };
    image.src = url;
    result.texture = texture;
  }

  return result;
}
