/**
 * @file 3ds-parser.ts
 * @module @aetheria/engine/asset-parser/3ds-parser
 * @description Bóc tách Autodesk 3DS (chunk nhị phân).
 *
 * Cấu trúc tệp: chunk đệ quy, mỗi chunk gồm `id (uint16) + length (uint32)`
 * rồi dữ liệu. Chunk chính 0x4D4D chứa các chunk con:
 *   0x4000 OBJECT_INFO   → tên object
 *   0x4001 TRIMESH        → đỉnh, mặt, UV, vật liệu
 *   0xA000 MATERIAL_NAME  → tên vật liệu
 *   0xA200 MAP_FILENAME   → đường dẫn texture
 *
 * 3DS không mang kênh thời gian nên animation bị bỏ qua.
 */

import * as THREE from 'three';

export interface ThreeDsParseOptions {
  name?: string;
  /** Thư mục gốc để phân giải đường dẫn texture tương đối. */
  basePath?: string;
}

export interface ThreeDsParseResult {
  /** Cây scene đã dựng (mỗi object 3DS là một Group chứa các mesh). */
  scene: THREE.Group;
  objectCount: number;
  triangleCount: number;
  /** Tên vật liệu và texture tham chiếu. */
  materials: string[];
  /** Đường dẫn texture tìm thấy trong tệp. */
  textureFiles: string[];
  warnings: string[];
}

const CHUNK_MAIN3DS = 0x4d4d;
const CHUNK_VERSION = 0x0002;
const CHUNK_EDITOR = 0x3d3d;
const CHUNK_OBJECT = 0x4000;
const CHUNK_OBJECT_INFO = 0x4000;
const CHUNK_TRIMESH = 0x4001;
const CHUNK_TRIMESH_VERTEX = 0x4100;
const CHUNK_TRIMESH_FACE1 = 0x4101;
const CHUNK_TRIMESH_FACE2 = 0x4102;
const CHUNK_TRIMESH_FACE3 = 0x4103;
const CHUNK_TRIMESH_FACE4 = 0x4104;
const CHUNK_TRIMESH_MAPPINGCOORS = 0x4105;
const CHUNK_TRIMESH_MATERIAL = 0x4106;
const CHUNK_TRIMESH_MATERIAL_GROUP = 0x4107;
const CHUNK_TRIMESH_MATERIAL_NAMES = 0x4108;
// Bộ chunk của 3DS3 (k3.0) — dùng ID khác cho cùng nội dung.
const CHUNK3_POINT = 0x4110;
const CHUNK3_FACE = 0x4120;
const CHUNK3_MAPPING = 0x4130;
const CHUNK_MATERIAL_NEW = 0xa000;
const CHUNK_MATERIAL_NAME = 0xa200;
const CHUNK_MAT_TEXMAP = 0xa300;

/** Bộ đọc byte có con trỏ, dùng chung cho các chunk. */
class ByteReader {
  public offset = 0;
  constructor(public readonly bytes: Uint8Array) {}

  public get remaining(): number {
    return this.bytes.length - this.offset;
  }

  public u8(): number {
    return this.bytes[this.offset++];
  }

  public u16(): number {
    const v = this.bytes[this.offset] | (this.bytes[this.offset + 1] << 8);
    this.offset += 2;
    return v;
  }

  public u32(): number {
    const v =
      (this.bytes[this.offset] |
        (this.bytes[this.offset + 1] << 8) |
        (this.bytes[this.offset + 2] << 16) |
        (this.bytes[this.offset + 3] << 24)) >>>
      0;
    this.offset += 4;
    return v;
  }

  public i32(): number {
    return this.u32() | 0;
  }

  public f32(): number {
    const v =
      (this.bytes[this.offset] |
        (this.bytes[this.offset + 1] << 8) |
        (this.bytes[this.offset + 2] << 16) |
        (this.bytes[this.offset + 3] << 24)) >>>
      0;
    this.offset += 4;
    // eslint-disable-next-line no-bitwise
    const asFloat = new Float32Array(1);
    const asInt = new Int32Array(asFloat.buffer);
    asInt[0] = v;
    return asFloat[0];
  }

  public f64(): number {
    const lo = this.u32();
    const hi = this.u32();
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setUint32(0, lo, true);
    view.setUint32(4, hi, true);
    return view.getFloat64(0, true);
  }

  /** Đọc chuỗi zero-terminated. */
  public cstring(): string {
    let out = '';
    while (this.offset < this.bytes.length) {
      const c = this.bytes[this.offset++];
      if (c === 0) break;
      out += String.fromCharCode(c);
    }
    return out;
  }

  public skip(count: number): void {
    this.offset += count;
  }
}

/** Dữ liệu thô của một object 3DS. */
interface RawObject {
  name: string;
  vertices: number[];
  faces: number[];
  uvs: number[];
  /** Mặt nào thuộc material nào (material index -> list face index). */
  materialGroups: Map<number, number[]>;
  materialNames: Map<number, string>;
}

/** Đọc chunk con của một chunk cha. */
function readChunk(reader: ByteReader, end: number, onChunk: (id: number, dataStart: number, dataEnd: number) => void): void {
  while (reader.offset + 6 <= end) {
    const id = reader.u16();
    const length = reader.u32();
    const dataStart = reader.offset;
    const dataEnd = Math.min(dataStart + length, end);
    onChunk(id, dataStart, dataEnd);
    reader.offset = dataEnd;
    if (length === 0) break;
  }
}

function parseMaterialNames(reader: ByteReader, end: number, into: Map<number, string>): void {
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    if (id !== CHUNK_TRIMESH_MATERIAL_NAMES) return;
    const sub = new ByteReader(reader.bytes);
    sub.offset = dataStart;
    const count = sub.u16();
    for (let i = 0; i < count && sub.offset < dataEnd; i++) {
      const name = sub.cstring();
      const index = sub.u16();
      into.set(index, name);
    }
  });
}

function parseObjectInfo(reader: ByteReader, end: number): { name: string; materials: Map<number, string> } {
  let name = '';
  const materials = new Map<number, string>();
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    if (id === CHUNK_OBJECT_INFO) {
      const sub = new ByteReader(reader.bytes);
      sub.offset = dataStart;
      name = sub.cstring();
      // u16 unknown, u32 số đỉnh, u32 số mặt, u32 số điểm giao,...
      sub.skip(2);
      sub.u32();
      sub.u32();
    } else if (id === CHUNK_TRIMESH_MATERIAL_NAMES) {
      const sub = new ByteReader(reader.bytes);
      sub.offset = dataStart;
      const count = sub.u16();
      for (let i = 0; i < count && sub.offset < dataEnd; i++) {
        const matName = sub.cstring();
        const index = sub.u16();
        materials.set(index, matName);
      }
    }
  });
  return { name, materials };
}

function parseTrimesh(reader: ByteReader, end: number, into: RawObject): void {
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    // Chunk TRIMESH (0x4001) bọc các chunk hình học bên trong — đệ quy xuống.
    if (id === CHUNK_TRIMESH) {
      const sub = new ByteReader(reader.bytes);
      sub.offset = dataStart;
      parseTrimesh(sub, dataEnd, into);
      return;
    }

    const sub = new ByteReader(reader.bytes);
    sub.offset = dataStart;

    if (id === CHUNK_TRIMESH_VERTEX || id === CHUNK3_POINT) {
      const count = Math.floor((dataEnd - dataStart) / 12);
      for (let i = 0; i < count; i++) {
        into.vertices.push(sub.f32(), sub.f32(), sub.f32());
      }
    } else if (id === CHUNK_TRIMESH_FACE1) {
      const count = Math.floor((dataEnd - dataStart) / 8);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        const c = sub.u16();
        sub.u16(); // flags
        into.faces.push(a, b, c);
      }
    } else if (id === CHUNK_TRIMESH_FACE2) {
      const count = Math.floor((dataEnd - dataStart) / 12);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        const c = sub.u16();
        sub.skip(6); // edge flags
        into.faces.push(a, b, c);
      }
    } else if (id === CHUNK_TRIMESH_FACE3) {
      const count = Math.floor((dataEnd - dataStart) / 16);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        const c = sub.u16();
        sub.skip(10); // edge + flags
        into.faces.push(a, b, c);
      }
    } else if (id === CHUNK_TRIMESH_FACE4) {
      const count = Math.floor((dataEnd - dataStart) / 8);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        sub.skip(4); // flags
        into.faces.push(a, b, a);
      }
    } else if (id === CHUNK3_FACE) {
      // 3DS3: 2 đỉnh (uint16) + 2 cờ cạnh (uint16) + 1 cờ mặt (uint16) = 10 byte.
      const count = Math.floor((dataEnd - dataStart) / 10);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        sub.skip(6);
        into.faces.push(a, b, a);
      }
    } else if (id === CHUNK_TRIMESH_MAPPINGCOORS || id === CHUNK3_MAPPING) {
      const count = Math.floor((dataEnd - dataStart) / 8);
      for (let i = 0; i < count; i++) {
        into.uvs.push(sub.f32(), sub.f32());
      }
    } else if (id === CHUNK_TRIMESH_MATERIAL_GROUP) {
      const count = Math.floor((dataEnd - dataStart) / 2);
      let faceIndex = 0;
      for (let i = 0; i < count; i++) {
        const materialIndex = sub.u16();
        const facesInGroup = sub.u16();
        const list = into.materialGroups.get(materialIndex) ?? [];
        for (let f = 0; f < facesInGroup; f++) list.push(faceIndex++);
        into.materialGroups.set(materialIndex, list);
      }
    } else if (id === CHUNK_TRIMESH_MATERIAL_NAMES) {
      parseMaterialNames(sub, dataEnd, into.materialNames);
    }
  });
}

/** Thu thập tên texture từ chunk vật liệu. */
function collectMaterialTextures(reader: ByteReader, end: number, out: string[]): void {
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    if (id !== CHUNK_MATERIAL_NEW) return;
    readChunk(reader, dataEnd, (subId, subStart, subEnd) => {
      if (subId !== CHUNK_MAT_TEXMAP) return;
      const sub = new ByteReader(reader.bytes);
      sub.offset = subStart;
      // bỏ qua: map type (1 byte) + null-terminated option
      sub.u8();
      sub.cstring();
      sub.u16(); // reserved
      while (sub.offset < subEnd) {
        const dir = sub.cstring();
        const filename = sub.cstring();
        if (filename) out.push(dir ? `${dir}/${filename}` : filename);
        sub.u16();
        if (dir === '' && filename === '') break;
      }
    });
  });
}

export function parseThreeDs(bytes: Uint8Array, options: ThreeDsParseOptions = {}): ThreeDsParseResult {
  const reader = new ByteReader(bytes);
  if (reader.remaining < 6) {
    throw new Error('AssetParser: tệp 3DS quá nhỏ');
  }

  const rootId = reader.u16();
  if (rootId !== CHUNK_MAIN3DS) {
    throw new Error(`AssetParser: không phải tệp 3DS (magic 0x${rootId.toString(16)})`);
  }
  const declaredLength = reader.u32();
  if (declaredLength > bytes.length) {
    throw new Error(
      `AssetParser: chunk gốc 3DS khai báo ${declaredLength} byte nhưng tệp chỉ có ${bytes.length} byte`,
    );
  }

  const objects: RawObject[] = [];
  const textureFiles: string[] = [];
  const warnings: string[] = [];

  /**
   * Duyệt chunk con, tìm object ở mọi cấp.
   *
   * 3DS3 bọc object trong chunk EDITOR (0x3D3D); 3DS2 đặt object thẳng dưới
   * MAIN3DS — nên phải đệ quy xuống cho tới khi gặp chunk OBJECT.
   */
  const walk = (start: number, end: number, depth: number): void => {
    if (depth > 16) return;
    const reader = new ByteReader(bytes);
    reader.offset = start;

    readChunk(reader, end, (id, dataStart, dataEnd) => {
      if (id === CHUNK_EDITOR) {
        walk(dataStart, dataEnd, depth + 1);
        return;
      }
      if (id === CHUNK_OBJECT) {
        const raw: RawObject = {
          name: '',
          vertices: [],
          faces: [],
          uvs: [],
          materialGroups: new Map(),
          materialNames: new Map(),
        };
        const sub = new ByteReader(bytes);
        sub.offset = dataStart;
        const info = parseObjectInfo(sub, dataEnd);
        raw.name = info.name;
        raw.materialNames = info.materials;
        // Đọc lại từ đầu: parseObjectInfo đã dời con trỏ qua hết các chunk con.
        sub.offset = dataStart;
        parseTrimesh(sub, dataEnd, raw);
        objects.push(raw);
        return;
      }
      if (id === CHUNK_MATERIAL_NEW) {
        const sub = new ByteReader(bytes);
        sub.offset = dataStart;
        collectMaterialTextures(sub, dataEnd, textureFiles);
        return;
      }
      if (id === CHUNK_VERSION) {
        const sub = new ByteReader(bytes);
        sub.offset = dataStart;
        const version = sub.u32();
        if (version < 3) warnings.push(`3DS phiên bản ${version} (k2.0) — có thể thiếu dữ liệu UV.`);
      }
    });
  };

  walk(6, bytes.length, 0);

  const root = new THREE.Group();
  root.name = options.name ?? 'ThreeDsScene';
  let triangleCount = 0;
  const materialNames: string[] = [];

  for (const raw of objects) {
    const group = new THREE.Group();
    group.name = raw.name || 'Object';

    const vertexCount = raw.vertices.length / 3;
    const faceCount = raw.faces.length / 3;
    triangleCount += faceCount;

    if (vertexCount === 0 || faceCount === 0) {
      warnings.push(`Object "${raw.name}" không có tam giác — bỏ qua.`);
      continue;
    }

    // Gom mặt theo vật liệu để tạo nhiều mesh.
    const groups = raw.materialGroups.size > 0 ? raw.materialGroups : new Map([[0, raw.faces.map((_, i) => i)]]);
    let fallbackMaterialIndex = -1;

    for (const [materialIndex, faceIndices] of groups) {
      const positions: number[] = [];
      const uvs: number[] = [];

      for (const fi of faceIndices) {
        const base = fi * 3;
        const tri = [raw.faces[base], raw.faces[base + 1], raw.faces[base + 2]];
        for (const vi of tri) {
          positions.push(raw.vertices[vi * 3], raw.vertices[vi * 3 + 1], raw.vertices[vi * 3 + 2]);
          if (raw.uvs.length >= (vi + 1) * 2) {
            uvs.push(raw.uvs[vi * 2], raw.uvs[vi * 2 + 1]);
          }
        }
      }
      if (positions.length === 0) continue;

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      if (uvs.length === (positions.length / 3) * 2) {
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      }
      geometry.computeVertexNormals();

      const matName = raw.materialNames.get(materialIndex) ?? `Material_${materialIndex}`;
      if (!materialNames.includes(matName)) materialNames.push(matName);
      const material = new THREE.MeshStandardMaterial({ name: matName });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${group.name}_${matName}`;
      group.add(mesh);
      fallbackMaterialIndex = materialIndex;
    }

    if (group.children.length === 0) {
      warnings.push(`Object "${raw.name}" không dựng được mesh nào.`);
      continue;
    }
    void fallbackMaterialIndex;
    root.add(group);
  }

  return { scene: root, objectCount: objects.length, triangleCount, materials: materialNames, textureFiles, warnings };
}
