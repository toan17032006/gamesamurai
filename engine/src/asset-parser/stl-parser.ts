/**
 * @file stl-parser.ts
 * @module @aetheria/engine/asset-parser/stl-parser
 * @description Bóc tách STL — cả binary lẫn ASCII.
 *
 * STL chỉ mang hình học: danh sách tam giác, không có vật liệu hay texture.
 * Binary STL = header 80 byte + số tam giác (uint32) + 50 byte/tam giác.
 * ASCII STL = lệnh `solid/facet normal/outer loop/vertex/endloop/endfacet/endsolid`.
 */

import * as THREE from 'three';

export interface StlParseOptions {
  /** Tên mesh (mặc định lấy từ tên file do caller truyền). */
  name?: string;
  /** Gộp các đỉnh trùng nhau (mặc định true — STL không có chỉ mục đỉnh). */
  weldVertices?: boolean;
}

/** Kết quả bóc tách STL. */
export interface StlParseResult {
  geometry: THREE.BufferGeometry;
  /** Số tam giác đọc được. */
  triangleCount: number;
  /** 'binary' | 'ascii' */
  encoding: 'binary' | 'ascii';
}

const BINARY_HEADER_BYTES = 80;
const BINARY_TRIANGLE_BYTES = 50;

/** Đọc chuỗi ASCII zero-terminated từ byte array. */
function readAscii(bytes: Uint8Array, offset: number): string {
  let end = offset;
  while (end < bytes.length && bytes[end] !== 0) end++;
  let out = '';
  for (let i = offset; i < end; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

/**
 * Nhận diện định dạng STL.
 *
 * Binary STL không có chữ ký riêng — dấu hiệu nhận biết đáng tin cậy là
 * độ dài tệp khớp với `84 + 50 * triangleCount`. Nếu khớp thì coi là binary.
 */
export function detectStlEncoding(bytes: Uint8Array): 'binary' | 'ascii' {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= BINARY_HEADER_BYTES + 4) {
    const triangleCount = view.getUint32(BINARY_HEADER_BYTES, true);
    const expected = BINARY_HEADER_BYTES + 4 + triangleCount * BINARY_TRIANGLE_BYTES;
    if (expected === bytes.length) return 'binary';
  }
  // ASCII: bắt đầu bằng "solid" (thường kèm BOM/khoảng trắng)
  const head = readAscii(bytes, 0).trim().toLowerCase();
  if (head.startsWith('solid')) return 'ascii';
  // Không khớp cả hai → coi như binary để báo lỗi có ngữ cảnh
  return 'binary';
}

function parseBinary(bytes: Uint8Array): StlParseResult {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const triangleCount = view.getUint32(BINARY_HEADER_BYTES, true);
  const positions = new Float32Array(triangleCount * 9);
  let o = BINARY_HEADER_BYTES + 4;

  for (let t = 0; t < triangleCount; t++) {
    if (o + BINARY_TRIANGLE_BYTES > bytes.length) {
      throw new Error(`AssetParser: STL binary bị cắt cụt — thiếu dữ liệu tam giác ${t}/${triangleCount}`);
    }
    // normal (float32 x3) bị bỏ qua: normal tính lại từ hình học chính xác hơn
    o += 12;
    for (let v = 0; v < 3; v++) {
      positions[t * 9 + v * 3 + 0] = view.getFloat32(o, true);
      positions[t * 9 + v * 3 + 1] = view.getFloat32(o + 4, true);
      positions[t * 9 + v * 3 + 2] = view.getFloat32(o + 8, true);
      o += 12;
    }
    o += 2; // attribute byte count
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return { geometry, triangleCount, encoding: 'binary' };
}

function parseAscii(text: string): StlParseResult {
  const positions: number[] = [];
  const vertexRe = /^\s*vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/;
  let triangleCount = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    const m = vertexRe.exec(rawLine);
    if (!m) continue;
    positions.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    if (positions.length % 9 === 0) triangleCount++;
  }

  if (positions.length === 0) {
    throw new Error('AssetParser: STL ASCII không có đỉnh nào');
  }
  if (positions.length % 9 !== 0) {
    throw new Error(`AssetParser: STL ASCII lệch tam giác (${positions.length} float không chia hết cho 9)`);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  return { geometry, triangleCount, encoding: 'ascii' };
}

/**
 * Bóc tách STL từ byte.
 *
 * @param bytes - nội dung tệp STL
 */
export function parseStl(bytes: Uint8Array, options: StlParseOptions = {}): StlParseResult {
  const encoding = detectStlEncoding(bytes);
  const result = encoding === 'ascii' ? parseAscii(new TextDecoder().decode(bytes)) : parseBinary(bytes);

  const geometry = result.geometry;
  if (options.weldVertices !== false) {
    // STL không có chỉ mục đỉnh — hàn đỉnh trùng để giảm kích thước đệm.
    const welded = weldPositions(geometry.getAttribute('position').array as Float32Array);
    geometry.setAttribute('position', new THREE.BufferAttribute(welded.positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(welded.indices, 1));
  }
  // Normal trong STL là normal mặt (per-face), thường bằng 0 trong nhiều bộ xuất.
  // Tính lại normal đỉnh từ hình học luôn cho kết quả đúng.
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
  mesh.name = options.name ?? 'StlMesh';
  mesh.userData.sourceEncoding = result.encoding;
  mesh.userData.triangleCount = result.triangleCount;

  return result;
}

/** Hàn các đỉnh trùng nhau (làm tròn 1e-5) và sinh chỉ mục. */
function weldPositions(source: Float32Array): { positions: Float32Array; indices: Uint32Array } {
  const map = new Map<string, number>();
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < source.length; i += 3) {
    const x = source[i];
    const y = source[i + 1];
    const z = source[i + 2];
    const key = `${Math.round(x * 1e5)},${Math.round(y * 1e5)},${Math.round(z * 1e5)}`;
    let idx = map.get(key);
    if (idx === undefined) {
      idx = positions.length / 3;
      map.set(key, idx);
      positions.push(x, y, z);
    }
    indices.push(idx);
  }

  return { positions: new Float32Array(positions), indices: new Uint32Array(indices) };
}
