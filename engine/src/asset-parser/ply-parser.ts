/**
 * @file ply-parser.ts
 * @module @aetheria/engine/asset-parser/ply-parser
 * @description Bóc tách PLY — ASCII và binary (little/big endian).
 *
 * PLY gồm header dạng văn bản rồi tới khối dữ liệu nhị phân. Header khai báo
 * "element" (vertex/face) và "property" của từng element; property list (dùng
 * cho face) có dạng `property list <countType> <valueType> <name>`.
 *
 * Engine nạp: vị trí (x,y,z), normal (nx,ny,nz), UV (s,t / u,v / texture_u,v),
 * màu đỉnh (red/green/blue/alpha) và chỉ mục face.
 */

import * as THREE from 'three';

export interface PlyParseOptions {
  /** Tên mesh. */
  name?: string;
  /** Chuyển màu đỉnh thành vertex color thay vì texture. */
  useVertexColor?: boolean;
}

export interface PlyParseResult {
  geometry: THREE.BufferGeometry;
  vertexCount: number;
  faceCount: number;
  /** 'ascii' | 'binary_little_endian' | 'binary_big_endian' */
  format: string;
  /** Có màu đỉnh hay không. */
  hasVertexColor: boolean;
}

type PropertyKind = 'float' | 'double' | 'int' | 'uint' | 'char' | 'uchar' | 'short' | 'ushort' | 'int8' | 'uint8' | 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' | 'float64';

interface PropertySpec {
  name: string;
  /** true nếu đây là property dạng list. */
  isList: boolean;
  countType?: PropertyKind;
  valueType: PropertyKind;
}

interface ElementSpec {
  name: string;
  count: number;
  properties: PropertySpec[];
}

interface PlyHeader {
  format: string;
  elements: ElementSpec[];
  /** Offset byte của khối dữ liệu trong tệp. */
  dataOffset: number;
}

const TYPE_SIZES: Record<PropertyKind, number> = {
  char: 1,
  int8: 1,
  uchar: 1,
  uint8: 1,
  short: 2,
  int16: 2,
  ushort: 2,
  uint16: 2,
  int: 4,
  int32: 4,
  uint: 4,
  uint32: 4,
  float: 4,
  float32: 4,
  double: 8,
  float64: 8,
};

function normalizeType(raw: string): PropertyKind {
  const t = raw.toLowerCase();
  if (t === 'float' || t === 'float32') return 'float32';
  if (t === 'double' || t === 'float64') return 'float64';
  if (t === 'int' || t === 'int32') return 'int32';
  if (t === 'uint' || t === 'uint32') return 'uint32';
  if (t === 'short' || t === 'int16') return 'int16';
  if (t === 'ushort' || t === 'uint16') return 'uint16';
  if (t === 'char' || t === 'int8') return 'int8';
  if (t === 'uchar' || t === 'uint8') return 'uint8';
  throw new Error(`AssetParser: kiểu PLY không hỗ trợ "${raw}"`);
}

/** Đọc và phân tích header PLY. */
export function parsePlyHeader(text: string): PlyHeader {
  const lines = text.split(/\r?\n/);
  if (!/^ply\s*$/i.test(lines[0] ?? '')) {
    throw new Error('AssetParser: không phải tệp PLY (thiếu dòng "ply")');
  }

  let format = '';
  const elements: ElementSpec[] = [];
  let inHeader = true;
  let headerLineCount = 0;

  for (let i = 1; i < lines.length && inHeader; i++) {
    const line = lines[i].trim();
    headerLineCount = i + 1;
    if (line.length === 0) continue;

    const parts = line.split(/\s+/);
    const keyword = parts[0].toLowerCase();

    if (keyword === 'comment' || keyword === 'obj_info') continue;
    if (keyword === 'format') {
      format = (parts[1] ?? '').toLowerCase();
      continue;
    }
    if (keyword === 'element') {
      elements.push({ name: parts[1] ?? 'unknown', count: parseInt(parts[2] ?? '0', 10), properties: [] });
      continue;
    }
    if (keyword === 'property') {
      const current = elements[elements.length - 1];
      if (!current) throw new Error('AssetParser: PLY property ngoài element');
      if ((parts[1] ?? '').toLowerCase() === 'list') {
        current.properties.push({
          name: parts[4] ?? 'list',
          isList: true,
          countType: normalizeType(parts[2] ?? 'uchar'),
          valueType: normalizeType(parts[3] ?? 'float'),
        });
      } else {
        current.properties.push({ name: parts[2] ?? 'value', isList: false, valueType: normalizeType(parts[1] ?? 'float') });
      }
      continue;
    }
    if (keyword === 'end_header') {
      inHeader = false;
      headerLineCount = i + 1;
      break;
    }
  }

  if (!format) throw new Error('AssetParser: PLY thiếu dòng "format"');
  if (!elements.length) throw new Error('AssetParser: PLY không khai báo element nào');

  // dataOffset = độ dài byte của header trong tệp.
  // Với ASCII, dữ liệu nằm ngay sau "end_header\n"; với binary cũng vậy.
  const headerBytes = new TextEncoder().encode(lines.slice(0, headerLineCount).join('\n') + '\n').length;
  return { format, elements, dataOffset: headerBytes };
}

/** Đọc một giá trị scalar theo endianness. */
function readValue(view: DataView, offset: number, type: PropertyKind, littleEndian: boolean): number {
  switch (type) {
    case 'int8':
      return view.getInt8(offset);
    case 'uint8':
      return view.getUint8(offset);
    case 'int16':
      return view.getInt16(offset, littleEndian);
    case 'uint16':
      return view.getUint16(offset, littleEndian);
    case 'int32':
      return view.getInt32(offset, littleEndian);
    case 'uint32':
      return view.getUint32(offset, littleEndian);
    case 'float32':
      return view.getFloat32(offset, littleEndian);
    case 'float64':
      return view.getFloat64(offset, littleEndian);
    default:
      throw new Error(`AssetParser: không đọc được kiểu PLY "${type}"`);
  }
}

/**
 * Bộ đọc token cho PLY ASCII: tách toàn bộ phần dữ liệu thành token và trả về
 * theo thứ tự, không phụ thuộc ranh giới dòng (một record có thể nằm trên
 * nhiều dòng).
 */
function createAsciiTokenReader(text: string): () => number {
  const start = text.indexOf('end_header');
  const body = start >= 0 ? text.slice(start + 'end_header'.length) : text;
  const tokens = body.split(/\s+/).filter((t) => t.length > 0);
  let cursor = 0;
  return () => {
    if (cursor >= tokens.length) {
      throw new Error('AssetParser: PLY ASCII hết dữ liệu trước khi đủ record');
    }
    const value = Number(tokens[cursor++]);
    if (Number.isNaN(value)) {
      throw new Error(`AssetParser: PLY ASCII có token không phải số: "${tokens[cursor - 1]}"`);
    }
    return value;
  };
}

export function parsePly(bytes: Uint8Array, options: PlyParseOptions = {}): PlyParseResult {
  // Header luôn ở dạng văn bản — đọc đủ một "chặng" ASCII an toàn.
  const headerText = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, Math.min(bytes.length, 1 << 16)));
  const header = parsePlyHeader(headerText);
  const isBinary = header.format.startsWith('binary');
  const littleEndian = !header.format.includes('big_endian');

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  let vertexCount = 0;
  let faceCount = 0;

  const hasColor = header.elements.some(
    (el) => el.name === 'vertex' && el.properties.some((p) => ['red', 'green', 'blue', 'alpha'].includes(p.name)),
  );

  if (isBinary) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = header.dataOffset;

    for (const element of header.elements) {
      for (let i = 0; i < element.count; i++) {
        const values: Record<string, number> = {};
        for (const prop of element.properties) {
          if (prop.isList) {
            const count = readValue(view, offset, prop.countType ?? 'uint8', littleEndian);
            offset += TYPE_SIZES[prop.countType ?? 'uint8'];
            const list: number[] = [];
            for (let k = 0; k < count; k++) {
              list.push(readValue(view, offset, prop.valueType, littleEndian));
              offset += TYPE_SIZES[prop.valueType];
            }
            values[prop.name] = list.length;
            if (element.name === 'face') {
              // face: danh sách chỉ mục đỉnh
              for (const idx of list) indices.push(idx);
            }
            continue;
          }
          values[prop.name] = readValue(view, offset, prop.valueType, littleEndian);
          offset += TYPE_SIZES[prop.valueType];
        }

        if (element.name === 'vertex') {
          vertexCount++;
          positions.push(values.x ?? 0, values.y ?? 0, values.z ?? 0);
          if (values.nx !== undefined) normals.push(values.nx, values.ny ?? 0, values.nz ?? 0);
          const u = values.s ?? values.u ?? values.texture_u ?? values.texture_s;
          const v = values.t ?? values.v ?? values.texture_v ?? values.texture_t;
          if (u !== undefined && v !== undefined) uvs.push(u, v);
          if (values.red !== undefined) {
            colors.push(values.red / 255, values.green / 255, values.blue / 255, (values.alpha ?? 255) / 255);
          }
        } else if (element.name === 'face') {
          faceCount++;
        }
      }
    }
  } else {
    const fullText = new TextDecoder().decode(bytes);
    const next = createAsciiTokenReader(fullText);

    for (const element of header.elements) {
      for (let i = 0; i < element.count; i++) {
        const row: Record<string, number | number[]> = {};
        for (const prop of element.properties) {
          if (prop.isList) {
            const count = next();
            const list: number[] = [];
            for (let k = 0; k < count; k++) list.push(next());
            row[prop.name] = list;
            if (element.name === 'face') for (const idx of list) indices.push(idx);
          } else {
            row[prop.name] = next();
          }
        }

        if (element.name === 'vertex') {
          vertexCount++;
          positions.push((row.x as number) ?? 0, (row.y as number) ?? 0, (row.z as number) ?? 0);
          if (row.nx !== undefined) normals.push(row.nx as number, (row.ny as number) ?? 0, (row.nz as number) ?? 0);
          const u = (row.s ?? row.u ?? row.texture_u ?? row.texture_s) as number | undefined;
          const v = (row.t ?? row.v ?? row.texture_v ?? row.texture_t) as number | undefined;
          if (u !== undefined && v !== undefined) uvs.push(u, v);
          if (row.red !== undefined) {
            colors.push(
              (row.red as number) / 255,
              ((row.green as number) ?? 0) / 255,
              ((row.blue as number) ?? 0) / 255,
              ((row.alpha as number) ?? 255) / 255,
            );
          }
        } else if (element.name === 'face') {
          faceCount++;
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length === positions.length) {
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  } else {
    geometry.computeVertexNormals();
  }
  if (uvs.length === (positions.length / 3) * 2) {
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  }
  const hasVertexColor = colors.length === (positions.length / 3) * 4 && colors.length > 0;
  if (hasVertexColor) {
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  }
  if (indices.length >= 3) {
    geometry.setIndex(indices);
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: hasVertexColor && options.useVertexColor !== false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name ?? 'PlyMesh';
  mesh.userData.sourceFormat = header.format;
  mesh.userData.vertexCount = vertexCount;
  mesh.userData.faceCount = faceCount;

  return { geometry, vertexCount, faceCount, format: header.format, hasVertexColor };
}
