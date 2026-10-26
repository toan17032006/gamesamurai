/**
 * @file abc-parser.ts
 * @module @aetheria/engine/asset-parser/abc-parser
 * @description Bóc tách Alembic (định dạng Ogawa).
 *
 * Ogawa là định dạng nhị phân little-endian, không nén, thiết kế để đọc
 * tại chỗ. Mọi tham chiếu là offset u64 trong đó bit 63 = 1 nghĩa là "data"
 * (byte stream), = 0 nghĩa là "group"; giá trị 0 là kết thúc.
 *
 *   Group: num_children (u64) + children offsets (u64 × n)
 *   Data:  num_bytes (u64) + bytes
 *
 * Group gốc có 6 child: version archive, version file, group "objects",
 * metadata, time samples, indexed metadata.
 *
 * Lưu ý về độ tin cậy: tầng container (header, group, data, cây object và tên)
 * được đọc theo đúng đặc tả. Tầng property/sample có thể khác nhau giữa các
 * phiên bản Alembic — nơi không khớp, Engine bỏ qua property đó và ghi cảnh
 * báo cụ thể thay vì dựng dữ liệu sai.
 */

import * as THREE from 'three';

export interface AbcParseOptions {
  name?: string;
  /** Giới hạn số object để đọc (chống tệp độc hại). */
  maxObjects?: number;
}

export interface AbcParseResult {
  scene: THREE.Group;
  objectCount: number;
  meshCount: number;
  version: string;
  warnings: string[];
  /** Tên các time sample trong archive. */
  sampleTimes: number[];
}

/** Offset u64: bit 63 = data, bit 63 = 0 → group, 0 → kết thúc. */
const DATA_FLAG = 0x8000000000000000n;

class OgawaReader {
  private readonly view: DataView;

  constructor(
    public readonly bytes: Uint8Array,
  ) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  public get length(): number {
    return this.bytes.length;
  }

  public u64(offset: number): bigint {
    if (offset + 8 > this.bytes.length) {
      throw new RangeError(`AssetParser: Alembic đọc vượt cuối tệp tại offset ${offset}`);
    }
    return this.view.getBigUint64(offset, true);
  }

  public u32(offset: number): number {
    if (offset + 4 > this.bytes.length) {
      throw new RangeError(`AssetParser: Alembic đọc vượt cuối tệp tại offset ${offset}`);
    }
    return this.view.getUint32(offset, true);
  }

  /** Đọc group tại offset → mảng offset con. */
  public groupChildren(offset: number): number[] {
    const count = Number(this.u64(offset));
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      const child = this.u64(offset + 8 + i * 8);
      if (child === 0n) break;
      out.push(Number(child & ~DATA_FLAG));
    }
    return out;
  }

  /** Đọc data stream tại offset → byte. */
  public dataBytes(offset: number): Uint8Array {
    const size = Number(this.u64(offset));
    const start = offset + 8;
    if (start + size > this.bytes.length) {
      throw new RangeError(`AssetParser: Alembic data stream vượt cuối tệp tại offset ${offset}`);
    }
    return this.bytes.subarray(start, start + size);
  }
}

/** Đọc chuỗi trong byte stream (length-prefixed hoặc null-terminated). */
function readLengthPrefixedString(data: Uint8Array, offset: number): { value: string; next: number } {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (offset + 4 > data.length) return { value: '', next: data.length };
  const size = view.getUint32(offset, true);
  const start = offset + 4;
  if (start + size > data.length) return { value: '', next: data.length };
  return { value: new TextDecoder().decode(data.subarray(start, start + size)), next: start + size };
}

/** Chuỗi null-terminated. */
function readCString(data: Uint8Array, offset: number): { value: string; next: number } {
  let end = offset;
  while (end < data.length && data[end] !== 0) end++;
  return { value: new TextDecoder().decode(data.subarray(offset, end)), next: end + 1 };
}

/** Đọc số nguyên theo kích thước (1/2/4/8 byte, little-endian, có dấu). */
function readSizedInt(data: Uint8Array, offset: number, sizeHint: number): { value: number; next: number } {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  switch (sizeHint) {
    case 0:
      return { value: view.getInt8(offset), next: offset + 1 };
    case 1:
      return { value: view.getInt16(offset, true), next: offset + 2 };
    case 2:
      return { value: view.getInt32(offset, true), next: offset + 4 };
    default:
      return { value: Number(view.getBigInt64(offset, true)), next: offset + 8 };
  }
}

/** Một object trong archive Alembic. */
interface AbcObject {
  name: string;
  /** Offset của group chứa property data của object. */
  propertyGroupOffset: number;
  children: AbcObject[];
}

/** Kết quả đọc một property đơn giản. */
interface AbcPropertyValue {
  name: string;
  /** Dữ liệu sample đầu tiên (bytes thô). */
  data: Uint8Array;
  /** Số phần tử (mảng). */
  count: number;
}

/** Đọc header object (tên + metadata). */
function readObjectHeaders(reader: OgawaReader, headerData: Uint8Array): string[] {
  const names: string[] = [];
  let offset = 0;
  while (offset < headerData.length) {
    const nameRes = readLengthPrefixedString(headerData, offset);
    if (nameRes.next <= offset) break;
    offset = nameRes.next;
    if (offset >= headerData.length) break;
    const metadataIndex = headerData[offset++];
    if (metadataIndex === 0xff) {
      // Metadata inline
      const view = new DataView(headerData.buffer, headerData.byteOffset, headerData.byteLength);
      if (offset + 4 > headerData.length) break;
      const metaSize = view.getUint32(offset, true);
      offset += 4 + metaSize;
    }
    names.push(nameRes.value);
  }
  return names;
}

/**
 * Đọc property header để lấy metadata (tên property) và thông tin sample.
 *
 * Trả về null nếu cấu trúc không khớp — dùng để phân biệt group "compound"
 * (children gồm property con + stream header) với group "simple" (children là
 * luồng dữ liệu thô).
 */
function readPropertyHeaders(headerData: Uint8Array): Array<{ name: string }> | null {
  const out: Array<{ name: string }> = [];
  const view = new DataView(headerData.buffer, headerData.byteOffset, headerData.byteLength);
  let offset = 0;

  while (offset + 4 <= headerData.length) {
    const info = view.getUint32(offset, true);
    offset += 4;

    // Bits 2..<4 = size hint
    const sizeHint = (info >> 2) & 0x3;

    // next_sample_index
    const nextSample = readSizedInt(headerData, offset, sizeHint);
    offset = nextSample.next;

    // first/last changed index
    if ((info & 0x0200) !== 0) {
      const first = readSizedInt(headerData, offset, sizeHint);
      offset = first.next;
      const last = readSizedInt(headerData, offset, sizeHint);
      offset = last.next;
    }
    // time sampling index
    if ((info & 0x0100) !== 0) {
      const ts = readSizedInt(headerData, offset, sizeHint);
      offset = ts.next;
    }

    // Metadata: inline (0x0400) hoặc theo index
    let name = '';
    if ((info & 0x0400) !== 0) {
      if (offset + 4 > headerData.length) return null;
      const metaSize = view.getUint32(offset, true);
      offset += 4;
      if (offset + metaSize > headerData.length) return null;
      const meta = headerData.subarray(offset, offset + metaSize);
      offset += metaSize;
      // Metadata dạng "key=value;key=value"
      const text = new TextDecoder().decode(meta);
      const nameMatch = /name\s*=\s*([^;]+)/.exec(text);
      if (nameMatch) name = nameMatch[1].trim();
    } else {
      if (offset >= headerData.length) return null;
      offset++; // metadata index
    }

    out.push({ name });
  }

  // Tín hiệu mạnh rằng đây thực sự là stream property header: đã đọc hết dữ liệu
  // và có ít nhất một property có tên.
  if (offset !== headerData.length) return null;
  if (out.length === 0 || out.some((h) => h.name.length === 0)) return null;
  return out;
}

/** Một node property trong archive (scalar, array hoặc compound). */
interface AbcPropertyNode {
  /** Tên property, ví dụ "geom" hoặc "P". */
  name: string;
  /** Offset group chứa property. */
  groupOffset: number;
  /** true nếu property đơn giản dạng mảng. */
  isArray: boolean;
  /** true nếu property là compound (có child). */
  isCompound: boolean;
  /** Property con (chỉ với compound). */
  children: AbcPropertyNode[];
  /** Dữ liệu sample đầu tiên (chỉ với property đơn giản). */
  sample: Uint8Array | null;
}

/** Đọc một property node tại group offset. */
function readPropertyNode(reader: OgawaReader, groupOffset: number, depth = 0): AbcPropertyNode | null {
  if (depth > 8) return null;

  let children: number[];
  try {
    children = reader.groupChildren(groupOffset);
  } catch {
    return null;
  }
  if (children.length === 0) return null;

  // Thử coi group là compound: child cuối là stream property header.
  try {
    const headerData = reader.dataBytes(children[children.length - 1]);
    const headers = readPropertyHeaders(headerData);
    if (headers && headers.length === children.length - 1) {
      const node: AbcPropertyNode = {
        name: '',
        groupOffset,
        isArray: false,
        isCompound: true,
        children: [],
        sample: null,
      };
      for (let i = 0; i < headers.length; i++) {
        const child = readPropertyNode(reader, children[i], depth + 1);
        if (child) {
          child.name = headers[i].name;
          node.children.push(child);
        }
      }
      return node;
    }
  } catch {
    // Không phải compound — thử simple bên dưới.
  }

  // Property đơn giản: child 0 = dims (nếu array), child 1 = data.
  const isArray = children.length >= 2;
  const dataOffset = isArray ? children[1] : children[0];
  let sample: Uint8Array | null = null;
  try {
    const raw = reader.dataBytes(dataOffset);
    // 16 byte đầu là hash Spooky của sample.
    sample = raw.length > 16 ? raw.subarray(16) : null;
  } catch {
    sample = null;
  }
  return { name: '', groupOffset, isArray, isCompound: false, children: [], sample };
}

/** Tìm property con theo tên (không phân biệt hoa thường, bỏ dấu chấm dẫn). */
function findProperty(node: AbcPropertyNode, name: string): AbcPropertyNode | null {
  const target = name.toLowerCase();
  for (const child of node.children) {
    const childName = child.name.replace(/^\./, '').toLowerCase();
    if (childName === target) return child;
  }
  return null;
}

/** Đọc dữ liệu sample đầu tiên của property đơn giản. */
function readFirstSample(reader: OgawaReader, propertyGroupOffset: number, isArray: boolean): Uint8Array | null {
  try {
    const children = reader.groupChildren(propertyGroupOffset);
    if (children.length === 0) return null;
    const dataOffset = isArray ? children[1] ?? children[0] : children[0];
    const raw = reader.dataBytes(dataOffset);
    return raw.length > 16 ? raw.subarray(16) : null;
  } catch {
    return null;
  }
}

/** Đọc một property dạng mảng float (V3f, P…). */
function readFloatArray(sample: Uint8Array | null): number[] {
  if (!sample || sample.length < 4) return [];
  const view = new DataView(sample.buffer, sample.byteOffset, sample.byteLength);
  const count = Math.floor(sample.length / 4);
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(view.getFloat32(i * 4, true));
  return out;
}

/** Đọc một property dạng mảng int. */
function readIntArray(sample: Uint8Array | null): number[] {
  if (!sample || sample.length < 4) return [];
  const view = new DataView(sample.buffer, sample.byteOffset, sample.byteLength);
  const count = Math.floor(sample.length / 4);
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(view.getInt32(i * 4, true));
  return out;
}

/** Đọc property dạng mảng int8 (dùng cho xform ops). */
function readInt8Array(sample: Uint8Array | null): number[] {
  if (!sample) return [];
  return Array.from(sample);
}

/**
 * Dựng cây object từ group "objects".
 *
 * Mỗi group object có cấu trúc: [0] = compound property data của chính nó,
 * [1..n-2] = các object con, [n-1] = stream "object headers" chứa tên của
 * các object con đó.
 */
function buildObjectTree(reader: OgawaReader, rootOffset: number, maxObjects: number): AbcObject[] {
  const roots: AbcObject[] = [];
  let budget = maxObjects;

  const build = (offset: number, name: string): AbcObject | null => {
    if (budget <= 0) return null;
    budget--;

    const obj: AbcObject = { name, propertyGroupOffset: offset, children: [] };

    let sub: number[];
    try {
      sub = reader.groupChildren(offset);
    } catch {
      return obj;
    }
    if (sub.length < 3) return obj;

    let names: string[] = [];
    try {
      const headerData = reader.dataBytes(sub[sub.length - 1]);
      names = readObjectHeaders(reader, headerData);
    } catch {
      names = [];
    }

    const childOffsets = sub.slice(1, sub.length - 1);
    for (let i = 0; i < childOffsets.length; i++) {
      const child = build(childOffsets[i], names[i] ?? `object_${i}`);
      if (child) obj.children.push(child);
    }
    return obj;
  };

  const root = build(rootOffset, '');
  if (root) roots.push(root);
  return roots;
}

/** Đọc property gốc (compound) của một object. */
function readObjectProperties(reader: OgawaReader, object: AbcObject): AbcPropertyNode | null {
  try {
    const children = reader.groupChildren(object.propertyGroupOffset);
    if (children.length === 0) return null;
    const compound = readPropertyNode(reader, children[0]);
    if (!compound) return null;
    compound.name = '';
    return compound;
  } catch {
    return null;
  }
}

export function parseAbc(bytes: Uint8Array, options: AbcParseOptions = {}): AbcParseResult {
  const warnings: string[] = [];
  const reader = new OgawaReader(bytes);

  if (reader.length < 16) {
    throw new Error('AssetParser: tệp Alembic quá nhỏ');
  }
  const magic = new TextDecoder().decode(bytes.subarray(0, 5));
  if (magic !== 'Ogawa') {
    throw new Error(`AssetParser: không phải tệp Alembic Ogawa (magic "${magic}")`);
  }

  const rootGroupOffset = Number(reader.u64(12));
  const rootChildren = reader.groupChildren(rootGroupOffset);

  if (rootChildren.length < 3) {
    throw new Error('AssetParser: Alembic thiếu nhóm object gốc');
  }

  // version archive / version file
  let version = 'unknown';
  try {
    const versionData = reader.dataBytes(rootChildren[1]);
    const view = new DataView(versionData.buffer, versionData.byteOffset, versionData.byteLength);
    const raw = view.getInt32(0, true);
    version = raw >= 10000 ? `${Math.floor(raw / 10000)}.${Math.floor((raw % 10000) / 1000)}.${Math.floor((raw % 1000) / 100)}` : String(raw);
  } catch {
    warnings.push('Alembic: không đọc được phiên bản file.');
  }

  // Time samples
  const sampleTimes: number[] = [];
  try {
    if (rootChildren.length > 4) {
      const timeData = reader.dataBytes(rootChildren[4]);
      const view = new DataView(timeData.buffer, timeData.byteOffset, timeData.byteLength);
      // Mỗi Chrono: 2 x double (time, value) → đọc chuỗi time.
      for (let offset = 0; offset + 16 <= timeData.length; offset += 16) {
        sampleTimes.push(view.getFloat64(offset, true));
      }
    }
  } catch {
    warnings.push('Alembic: không đọc được danh sách time sample.');
  }

  const maxObjects = options.maxObjects ?? 100000;
  const roots = buildObjectTree(reader, rootChildren[2], maxObjects);

  const scene = new THREE.Group();
  scene.name = options.name ?? 'AlembicScene';
  let meshCount = 0;
  let objectCount = 0;

  const buildNode = (obj: AbcObject): THREE.Object3D => {
    objectCount++;
    const node = new THREE.Group();
    node.name = obj.name || 'object';

    const compound = readObjectProperties(reader, obj);

    // --- Transform ---
    const xform = compound ? findProperty(compound, 'xform') : null;
    if (xform) {
      const vals = findProperty(xform, 'vals');
      if (vals?.sample) {
        const matrix = readFloatArray(vals.sample);
        if (matrix.length >= 16) {
          const m = new THREE.Matrix4();
          m.set(
            matrix[0], matrix[4], matrix[8], matrix[12],
            matrix[1], matrix[5], matrix[9], matrix[13],
            matrix[2], matrix[6], matrix[10], matrix[14],
            matrix[3], matrix[7], matrix[11], matrix[15],
          );
          node.applyMatrix4(m);
        }
      }
    }

    // --- Hình học ---
    const geom = compound ? findProperty(compound, 'geom') : null;
    if (geom) {
      const positions = findProperty(geom, 'P');
      const faceIndices = findProperty(geom, 'faceIndices');
      const faceCounts = findProperty(geom, 'faceCounts');

      if (positions?.sample) {
        const pts = readFloatArray(positions.sample);
        if (pts.length >= 9) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

          if (faceIndices?.sample && faceCounts?.sample) {
            const indices = readIntArray(faceIndices.sample);
            const counts = readIntArray(faceCounts.sample);
            const tri: number[] = [];
            let cursor = 0;
            for (const count of counts) {
              const n = Math.max(0, Math.round(count));
              for (let i = 1; i < n - 1; i++) {
                tri.push(indices[cursor], indices[cursor + i], indices[cursor + i + 1]);
              }
              cursor += n;
            }
            if (tri.length >= 3) geometry.setIndex(tri);
          }

          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();

          const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
          mesh.name = `${node.name}_mesh`;
          node.add(mesh);
          meshCount++;
        }
      }
    }

    for (const child of obj.children) {
      node.add(buildNode(child));
    }
    return node;
  };

  for (const root of roots) {
    scene.add(buildNode(root));
  }

  if (roots.length === 0) {
    warnings.push('Alembic: archive không có object nào.');
  }

  return { scene, objectCount, meshCount, version, warnings, sampleTimes };
}
