/**
 * @file usdc-parser.ts
 * @module @aetheria/engine/asset-parser/usdc-parser
 * @description Bóc tách USD crate nhị phân (`.usdc` / `.usd` nhị phân).
 *
 * Cấu trúc crate (theo đặc tả USD 16.3):
 *   bootstrap: magic "PXR-USDC" (8 byte) + version (8 byte) + tocOffset (uint64)
 *   TOC: số section + mỗi section { tên 16 byte, start uint64, size uint64 }
 *   section: TOKENS, STRINGS, FIELDS, FIELDSETS, PATHS, SPECS
 *
 * Từ crate 0.4.0 trở đi, dữ liệu nén bằng LZ4 (TfFastCompression) và mảng số
 * nguyên dùng mã hoá delta biến thiên độ rộng.
 *
 * Ghi chú: cấu trúc crate và thuật toán giải nén tham chiếu `USDCParser.js`
 * của three.js (MIT) — bản này viết lại theo TypeScript strict, có kiểm tra
 * biên an toàn và trả về cấu trúc spec thô để lớp dựng scene dùng chung.
 */

export type UsdSpecType = 'def' | 'over' | 'class';

export interface UsdSpec {
  /** Đường dẫn tuyệt đối, ví dụ "/Root/Mesh". */
  path: string;
  specType: UsdSpecType;
  /** Thuộc tính của prim, đã giải mã. */
  fields: Record<string, unknown>;
}

/** Enum kiểu dữ liệu crate (crateDataTypes.h). */
const TypeEnum = {
  Invalid: 0,
  Bool: 1,
  UChar: 2,
  Int: 3,
  UInt: 4,
  Int64: 5,
  UInt64: 6,
  Half: 7,
  Float: 8,
  Double: 9,
  String: 10,
  Token: 11,
  AssetPath: 12,
  Matrix2d: 13,
  Matrix3d: 14,
  Matrix4d: 15,
  Quatd: 16,
  Quatf: 17,
  Quath: 18,
  Vec2d: 19,
  Vec2f: 20,
  Vec2h: 21,
  Vec2i: 22,
  Vec3d: 23,
  Vec3f: 24,
  Vec3h: 25,
  Vec3i: 26,
  Vec4d: 27,
  Vec4f: 28,
  Vec4h: 29,
  Vec4i: 30,
  Dictionary: 31,
  TokenListOp: 32,
  StringListOp: 33,
  PathListOp: 34,
  ReferenceListOp: 35,
  IntListOp: 36,
  Int64ListOp: 37,
  UIntListOp: 38,
  UInt64ListOp: 39,
  PathVector: 40,
  TokenVector: 41,
  Specifier: 42,
  Permission: 43,
  Variability: 44,
  VariantSelectionMap: 45,
  TimeSamples: 46,
  Payload: 47,
  DoubleVector: 48,
  LayerOffsetVector: 49,
  StringVector: 50,
  ValueBlock: 51,
  Value: 52,
  UnregisteredValue: 53,
  UnregisteredValueListOp: 54,
  PayloadListOp: 55,
  TimeCode: 56,
  PathExpression: 57,
  Relocates: 58,
  Spline: 59,
  AnimationBlock: 60,
} as const;

const FIELD_SET_TERMINATOR = 0xffffffff;
const FLOAT_COMPRESSION_INT = 0x69; // 'i'
const FLOAT_COMPRESSION_LUT = 0x74; // 't'

const HALF_EXPONENT_TABLE = new Float32Array(32);
for (let i = 0; i < 32; i++) HALF_EXPONENT_TABLE[i] = Math.pow(2, i - 15);
const HALF_DENORM_SCALE = Math.pow(2, -14);

/** Giải nén một khối LZ4 block-format. */
function lz4DecompressBlock(
  input: Uint8Array,
  inputOffset: number,
  inputEnd: number,
  output: Uint8Array,
  outputOffset: number,
  outputEnd: number,
): number {
  while (inputOffset < inputEnd) {
    const token = input[inputOffset++];
    if (inputOffset > inputEnd) break;

    let literalLength = token >> 4;
    if (literalLength === 15) {
      let b: number;
      do {
        if (inputOffset >= inputEnd) break;
        b = input[inputOffset++];
        literalLength += b;
      } while (b === 255 && inputOffset < inputEnd);
    }

    if (literalLength > 0) {
      if (inputOffset + literalLength > inputEnd) literalLength = inputEnd - inputOffset;
      for (let i = 0; i < literalLength; i++) {
        if (outputOffset >= outputEnd) break;
        output[outputOffset++] = input[inputOffset++];
      }
    }

    if (inputOffset >= inputEnd) break;

    if (inputOffset + 2 > inputEnd) break;
    const matchOffset = input[inputOffset++] | (input[inputOffset++] << 8);
    if (matchOffset === 0) break;

    let matchLength = (token & 0x0f) + 4;
    if (matchLength === 19) {
      let b: number;
      do {
        if (inputOffset >= inputEnd) break;
        b = input[inputOffset++];
        matchLength += b;
      } while (b === 255 && inputOffset < inputEnd);
    }

    const matchPos = outputOffset - matchOffset;
    if (matchPos < 0) break;

    for (let i = 0; i < matchLength; i++) {
      if (outputOffset >= outputEnd) break;
      output[outputOffset++] = output[matchPos + i];
    }
  }
  return outputOffset;
}

/**
 * Giải nén TfFastCompression (wrapper LZ4 của USD).
 * byte 0 == 0 → một khối; > 0 → số khối + kích thước từng khối.
 */
function decompressLz4(input: Uint8Array, uncompressedSize: number): Uint8Array {
  const output = new Uint8Array(uncompressedSize);
  const numChunks = input[0];

  if (numChunks === 0) {
    lz4DecompressBlock(input, 1, input.length, output, 0, uncompressedSize);
    return output;
  }

  const CHUNK_SIZE = 65536;
  let headerOffset = 1;
  const compressedSizes: number[] = [];
  for (let i = 0; i < numChunks; i++) {
    const size =
      (input[headerOffset] |
        (input[headerOffset + 1] << 8) |
        (input[headerOffset + 2] << 16) |
        (input[headerOffset + 3] << 24)) >>>
      0;
    compressedSizes.push(size);
    headerOffset += 4;
  }

  let inputOffset = headerOffset;
  let outputOffset = 0;
  for (let i = 0; i < numChunks; i++) {
    const chunkCompressedSize = compressedSizes[i];
    const chunkOutputSize = Math.min(CHUNK_SIZE, uncompressedSize - outputOffset);
    lz4DecompressBlock(
      input,
      inputOffset,
      inputOffset + chunkCompressedSize,
      output,
      outputOffset,
      outputOffset + chunkOutputSize,
    );
    inputOffset += chunkCompressedSize;
    outputOffset += chunkOutputSize;
  }
  return output;
}

/** Giải mã mảng số nguyên kiểu USD: delta + mã 2 bit cho độ rộng. */
function decodeIntegers32(data: Uint8Array, numInts: number): Int32Array {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 0;
  const commonValue = view.getInt32(offset, true);
  offset += 4;

  const numCodesBytes = (numInts * 2 + 7) >> 3;
  const codesStart = offset;
  const vintsStart = offset + numCodesBytes;

  const result = new Int32Array(numInts);
  let prevVal = 0;
  let codesOffset = codesStart;
  let vintsOffset = vintsStart;

  for (let i = 0; i < numInts; ) {
    const codeByte = data[codesOffset++];
    for (let j = 0; j < 4 && i < numInts; j++, i++) {
      const code = (codeByte >> (j * 2)) & 3;
      let delta = 0;
      switch (code) {
        case 0:
          delta = commonValue;
          break;
        case 1:
          delta = view.getInt8(vintsOffset);
          vintsOffset += 1;
          break;
        case 2:
          delta = view.getInt16(vintsOffset, true);
          vintsOffset += 2;
          break;
        case 3:
          delta = view.getInt32(vintsOffset, true);
          vintsOffset += 4;
          break;
      }
      prevVal += delta;
      result[i] = prevVal;
    }
  }
  return result;
}

/** Giải nén + giải mã mảng uint32 nén (LZ4 rồi delta). */
function decompressIntegers32(compressedData: Uint8Array, numInts: number): Int32Array {
  const encodedSize = numInts * 4 + ((numInts * 2 + 7) >> 3) + 4;
  const encoded = decompressLz4(compressedData, encodedSize);
  return decodeIntegers32(encoded, numInts);
}

/** Đọc byte có kiểm tra biên. */
class BinaryReader {
  public offset = 0;
  private readonly view: DataView;

  constructor(public readonly buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  public seek(offset: number): void {
    this.offset = offset;
  }

  public tell(): number {
    return this.offset;
  }

  public get byteLength(): number {
    return this.buffer.byteLength;
  }

  public u8(): number {
    this._need(1);
    return this.view.getUint8(this.offset++);
  }

  public i8(): number {
    this._need(1);
    return this.view.getInt8(this.offset++);
  }

  public u16(): number {
    this._need(2);
    const v = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return v;
  }

  public i16(): number {
    this._need(2);
    const v = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return v;
  }

  public u32(): number {
    this._need(4);
    const v = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return v;
  }

  public i32(): number {
    this._need(4);
    const v = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return v;
  }

  public u64(): number {
    this._need(8);
    const lo = this.view.getUint32(this.offset, true);
    const hi = this.view.getUint32(this.offset + 4, true);
    this.offset += 8;
    return hi * 0x100000000 + lo;
  }

  public i64(): number {
    this._need(8);
    const lo = this.view.getUint32(this.offset, true);
    const hi = this.view.getInt32(this.offset + 4, true);
    this.offset += 8;
    return hi * 0x100000000 + lo;
  }

  public f32(): number {
    this._need(4);
    const v = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return v;
  }

  public f64(): number {
    this._need(8);
    const v = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return v;
  }

  public bytes(length: number): Uint8Array {
    this._need(length);
    const out = new Uint8Array(this.buffer, this.offset, length);
    this.offset += length;
    return out;
  }

  public string(length: number): string {
    const raw = this.bytes(length);
    let end = 0;
    while (end < raw.length && raw[end] !== 0) end++;
    return new TextDecoder().decode(raw.subarray(0, end));
  }

  private _need(length: number): void {
    if (this.offset + length > this.buffer.byteLength) {
      throw new RangeError(
        `AssetParser: USD crate đọc vượt quá cuối tệp (cần ${length} byte tại offset ${this.offset})`,
      );
    }
  }
}

/** Biểu diễn giá trị 64 bit đóng gói của crate. */
class ValueRep {
  constructor(
    public readonly lo: number,
    public readonly hi: number,
  ) {}

  public get isArray(): boolean {
    return (this.hi & 0x80000000) !== 0;
  }

  public get isInlined(): boolean {
    return (this.hi & 0x40000000) !== 0;
  }

  public get isCompressed(): boolean {
    return (this.hi & 0x20000000) !== 0;
  }

  public get typeEnum(): number {
    return (this.hi >> 16) & 0xff;
  }

  public get payload(): number {
    return this.lo + ((this.hi & 0xffff) * 0x100000000);
  }
}

interface CrateSection {
  start: number;
  size: number;
}

interface CrateField {
  tokenIndex: number;
  valueRep: ValueRep;
}

interface CrateSpec {
  pathIndex: number;
  fieldSetIndex: number;
  specType: number;
}

const SPEC_TYPE_NAMES: Record<number, UsdSpecType> = { 0: 'def', 1: 'over', 2: 'class' };

/** Kết quả đọc crate. */
export interface UsdcParseResult {
  specs: UsdSpec[];
  /** Cảnh báo về tính năng không hỗ trợ. */
  warnings: string[];
  version: string;
}

/** Đọc tệp USD crate nhị phân. */
export function parseUsdc(buffer: ArrayBuffer): UsdcParseResult {
  const reader = new BinaryReader(buffer);
  const warnings: string[] = [];

  reader.seek(0);
  const magic = reader.string(8);
  if (magic !== 'PXR-USDC') {
    throw new Error(`AssetParser: không phải USD crate (magic "${magic}")`);
  }
  const major = reader.u8();
  const minor = reader.u8();
  const patch = reader.u8();
  reader.bytes(5);
  const tocOffset = reader.u64();
  const version = `${major}.${minor}.${patch}`;

  // ---- TOC ---------------------------------------------------------------
  reader.seek(tocOffset);
  const numSections = reader.u64();
  const sections = new Map<string, CrateSection>();
  for (let i = 0; i < numSections; i++) {
    const name = reader.string(16);
    const start = reader.u64();
    const size = reader.u64();
    sections.set(name, { start, size });
  }

  const isLegacy = major === 0 && minor < 4;

  // ---- TOKENS ------------------------------------------------------------
  const tokens: string[] = [];
  const tokensSection = sections.get('TOKENS');
  if (tokensSection) {
    reader.seek(tokensSection.start);
    const numTokens = reader.u64();
    let tokensData: Uint8Array;
    if (isLegacy) {
      const numBytes = reader.u64();
      tokensData = reader.bytes(numBytes);
    } else {
      const uncompressedSize = reader.u64();
      const compressedSize = reader.u64();
      const compressed = reader.bytes(compressedSize);
      tokensData = decompressLz4(compressed, uncompressedSize);
    }
    let strStart = 0;
    for (let i = 0; i < numTokens; i++) {
      let strEnd = strStart;
      while (strEnd < tokensData.length && tokensData[strEnd] !== 0) strEnd++;
      tokens.push(new TextDecoder().decode(tokensData.subarray(strStart, strEnd)));
      strStart = strEnd + 1;
    }
  }

  // ---- STRINGS -----------------------------------------------------------
  const strings: number[] = [];
  const stringsSection = sections.get('STRINGS');
  if (stringsSection) {
    reader.seek(stringsSection.start);
    const numStrings = reader.u64();
    for (let i = 0; i < numStrings; i++) strings.push(reader.u32());
  }

  // ---- FIELDS ------------------------------------------------------------
  const fields: CrateField[] = [];
  const fieldsSection = sections.get('FIELDS');
  if (fieldsSection) {
    reader.seek(fieldsSection.start);
    if (isLegacy) {
      const numFields = Math.floor(fieldsSection.size / 12);
      for (let i = 0; i < numFields; i++) {
        const tokenIndex = reader.u32();
        const repLo = reader.u32();
        const repHi = reader.u32();
        fields.push({ tokenIndex, valueRep: new ValueRep(repLo, repHi) });
      }
    } else {
      const numFields = reader.u64();
      const indicesSize = reader.u64();
      const indicesCompressed = reader.bytes(indicesSize);
      const tokenIndices = decompressIntegers32(indicesCompressed, numFields);

      const repsSize = reader.u64();
      const repsCompressed = reader.bytes(repsSize);
      const repsData = decompressLz4(repsCompressed, numFields * 8);
      const repsView = new DataView(repsData.buffer, repsData.byteOffset, repsData.byteLength);

      for (let i = 0; i < numFields; i++) {
        fields.push({
          tokenIndex: tokenIndices[i],
          valueRep: new ValueRep(repsView.getUint32(i * 8, true), repsView.getUint32(i * 8 + 4, true)),
        });
      }
    }
  }

  // ---- FIELDSETS ---------------------------------------------------------
  const fieldSets: number[] = [];
  const fieldSetsSection = sections.get('FIELDSETS');
  if (fieldSetsSection) {
    reader.seek(fieldSetsSection.start);
    if (isLegacy) {
      const numFieldSets = Math.floor(fieldSetsSection.size / 4);
      for (let i = 0; i < numFieldSets; i++) fieldSets.push(reader.u32());
    } else {
      const numFieldSets = reader.u64();
      const compressedSize = reader.u64();
      const compressed = reader.bytes(compressedSize);
      const indices = decompressIntegers32(compressed, numFieldSets);
      for (let i = 0; i < numFieldSets; i++) fieldSets.push(indices[i]);
    }
  }

  // ---- PATHS -------------------------------------------------------------
  const paths: string[] = [];
  const pathsSection = sections.get('PATHS');
  if (pathsSection) {
    reader.seek(pathsSection.start);
    const numPaths = reader.u64();
    paths.length = numPaths;
    if (numPaths === 0) {
      paths.push('/');
    } else if (isLegacy) {
      readPathsRecursive(reader, tokens, paths, '', 0);
    } else {
      reader.u64(); // numPaths lặp lại
      const c1 = reader.u64();
      const pathIndices = decompressIntegers32(reader.bytes(c1), numPaths);
      const c2 = reader.u64();
      const elementTokenIndices = decompressIntegers32(reader.bytes(c2), numPaths);
      const c3 = reader.u64();
      const jumps = decompressIntegers32(reader.bytes(c3), numPaths);
      buildPathsFromCompressed(pathIndices, elementTokenIndices, jumps, tokens, paths);
    }
  }

  // ---- SPECS -------------------------------------------------------------
  const specs: CrateSpec[] = [];
  const specsSection = sections.get('SPECS');
  if (specsSection) {
    reader.seek(specsSection.start);
    if (isLegacy) {
      const specSize = minor === 0 && patch === 1 ? 16 : 12;
      const numSpecs = Math.floor(specsSection.size / specSize);
      for (let i = 0; i < numSpecs; i++) {
        const pathIndex = reader.u32();
        const fieldSetIndex = reader.u32();
        const specType = reader.u32();
        if (specSize === 16) reader.u32();
        specs.push({ pathIndex, fieldSetIndex, specType });
      }
    } else {
      const numSpecs = reader.u64();
      const c1 = reader.u64();
      const pathIndices = decompressIntegers32(reader.bytes(c1), numSpecs);
      const c2 = reader.u64();
      const fieldSetIndices = decompressIntegers32(reader.bytes(c2), numSpecs);
      const c3 = reader.u64();
      const specTypes = decompressIntegers32(reader.bytes(c3), numSpecs);
      for (let i = 0; i < numSpecs; i++) {
        specs.push({
          pathIndex: pathIndices[i],
          fieldSetIndex: fieldSetIndices[i],
          specType: specTypes[i],
        });
      }
    }
  }

  // ---- Gom field của từng spec -----------------------------------------
  const valueReader = new CrateValueReader(reader, tokens, strings, paths, version, warnings);
  const result: UsdSpec[] = [];
  for (const spec of specs) {
    const path = paths[spec.pathIndex];
    if (!path) continue;
    const specFields: Record<string, unknown> = {};
    let fieldSetIndex = spec.fieldSetIndex;
    let iterations = 0;
    while (fieldSetIndex < fieldSets.length && iterations < 10000) {
      const fieldIndex = fieldSets[fieldSetIndex];
      if (fieldIndex === FIELD_SET_TERMINATOR || fieldIndex === -1) break;
      const field = fields[fieldIndex];
      if (field) {
        const name = tokens[field.tokenIndex];
        if (name) specFields[name] = valueReader.readValue(field.valueRep);
      }
      fieldSetIndex++;
      iterations++;
    }
    result.push({ path, specType: SPEC_TYPE_NAMES[spec.specType] ?? 'def', fields: specFields });
  }

  return { specs: result, warnings, version };
}

function readPathsRecursive(
  reader: BinaryReader,
  tokens: string[],
  paths: string[],
  parentPath: string,
  depth: number,
): void {
  if (depth > 1000) return;

  const index = reader.u32();
  const elementTokenIndex = reader.u32();
  const bits = reader.u8();

  const hasChild = (bits & 1) !== 0;
  const hasSibling = (bits & 2) !== 0;
  const isPrimProperty = (bits & 4) !== 0;

  let path: string;
  if (parentPath === '') {
    path = '/';
  } else {
    const elemToken = tokens[elementTokenIndex] ?? '';
    path = isPrimProperty ? `${parentPath}.${elemToken}` : parentPath === '/' ? `/${elemToken}` : `${parentPath}/${elemToken}`;
  }
  paths[index] = path;

  if (hasChild && hasSibling) {
    const siblingOffset = reader.u64();
    readPathsRecursive(reader, tokens, paths, path, depth + 1);
    reader.seek(siblingOffset);
    readPathsRecursive(reader, tokens, paths, parentPath, depth + 1);
  } else if (hasChild) {
    readPathsRecursive(reader, tokens, paths, path, depth + 1);
  } else if (hasSibling) {
    readPathsRecursive(reader, tokens, paths, parentPath, depth + 1);
  }
}

function buildPathsFromCompressed(
  pathIndices: Int32Array,
  elementTokenIndices: Int32Array,
  jumps: Int32Array,
  tokens: string[],
  paths: string[],
): void {
  const buildPaths = (startIndex: number, startParentPath: string): void => {
    let curIndex = startIndex;
    let parentPath = startParentPath;

    while (curIndex < pathIndices.length) {
      const thisIndex = curIndex++;
      const pathIndex = pathIndices[thisIndex];
      const elementTokenIndex = elementTokenIndices[thisIndex];
      const jump = jumps[thisIndex];

      let path: string;
      if (parentPath === '') {
        path = '/';
        parentPath = path;
      } else {
        const elemToken = tokens[Math.abs(elementTokenIndex)] ?? '';
        path =
          elementTokenIndex < 0
            ? `${parentPath}.${elemToken}`
            : parentPath === '/'
              ? `/${elemToken}`
              : `${parentPath}/${elemToken}`;
      }

      if (pathIndex >= 0 && pathIndex < paths.length) paths[pathIndex] = path;

      const hasChild = jump > 0 || jump === -1;
      const hasSibling = jump >= 0;

      if (hasChild) {
        if (hasSibling) {
          const siblingIndex = thisIndex + jump;
          if (siblingIndex >= 0 && siblingIndex < pathIndices.length) {
            buildPaths(siblingIndex, parentPath);
          }
        }
        parentPath = path;
      } else if (!hasSibling) {
        break;
      }
    }
  };

  buildPaths(0, '');
}

/** Đọc giá trị crate theo ValueRep. */
class CrateValueReader {
  private readonly conversion = new DataView(new ArrayBuffer(4));

  constructor(
    private readonly reader: BinaryReader,
    private readonly tokens: string[],
    private readonly strings: number[],
    private readonly paths: string[],
    private readonly version: string,
    private readonly warnings: string[],
  ) {}

  public readValue(valueRep: ValueRep): unknown {
    const type = valueRep.typeEnum;

    if (valueRep.isInlined) return this.readInlined(valueRep);

    const offset = valueRep.payload;
    if (offset === 0 && valueRep.isArray) return [];
    if (offset < 0 || offset >= this.reader.byteLength) {
      this.warnings.push(`USD crate: offset giá trị không hợp lệ (${offset}) — bỏ qua thuộc tính.`);
      return null;
    }

    const saved = this.reader.tell();
    this.reader.seek(offset);
    let value: unknown;
    try {
      value = valueRep.isArray ? this.readArray(valueRep) : this.readScalar(type);
    } catch (err) {
      this.warnings.push(`USD crate: lỗi đọc giá trị kiểu ${type} — ${(err as Error).message}`);
      value = null;
    }
    this.reader.seek(saved);
    return value;
  }

  private readInlined(valueRep: ValueRep): unknown {
    const type = valueRep.typeEnum;
    const payload = valueRep.lo;
    const view = this.conversion;

    switch (type) {
      case TypeEnum.Bool:
        return payload !== 0;
      case TypeEnum.UChar:
        return payload & 0xff;
      case TypeEnum.Int:
      case TypeEnum.UInt:
        return payload;
      case TypeEnum.Float:
      case TypeEnum.Double:
        view.setUint32(0, payload, true);
        return view.getFloat32(0, true);
      case TypeEnum.Token:
        return this.tokens[payload] ?? '';
      case TypeEnum.String:
        return this.tokens[this.strings[payload]] ?? '';
      case TypeEnum.AssetPath:
        return this.tokens[payload] ?? '';
      case TypeEnum.Specifier:
      case TypeEnum.Permission:
      case TypeEnum.Variability:
        return payload;
      case TypeEnum.Vec2h: {
        view.setUint32(0, payload, true);
        return [this.halfToFloat(view.getUint16(0, true)), this.halfToFloat(view.getUint16(2, true))];
      }
      case TypeEnum.Vec2f:
      case TypeEnum.Vec2i: {
        view.setUint32(0, payload, true);
        return [view.getInt8(0), view.getInt8(1)];
      }
      case TypeEnum.Vec3f:
      case TypeEnum.Vec3i: {
        view.setUint32(0, payload, true);
        return [view.getInt8(0), view.getInt8(1), view.getInt8(2)];
      }
      case TypeEnum.Vec4f:
      case TypeEnum.Vec4i: {
        view.setUint32(0, payload, true);
        return [view.getInt8(0), view.getInt8(1), view.getInt8(2), view.getInt8(3)];
      }
      case TypeEnum.Matrix4d: {
        view.setUint32(0, payload, true);
        const d = [view.getInt8(0), view.getInt8(4), view.getInt8(8), view.getInt8(12)];
        return [
          d[0], 0, 0, 0,
          0, d[1], 0, 0,
          0, 0, d[2], 0,
          0, 0, 0, d[3],
        ];
      }
      default:
        return payload;
    }
  }

  private readScalar(type: number): unknown {
    const reader = this.reader;
    switch (type) {
      case TypeEnum.Invalid:
        return null;
      case TypeEnum.Bool:
        return reader.u8() !== 0;
      case TypeEnum.UChar:
        return reader.u8();
      case TypeEnum.Int:
        return reader.i32();
      case TypeEnum.UInt:
        return reader.u32();
      case TypeEnum.Int64:
        return reader.i64();
      case TypeEnum.UInt64:
        return reader.u64();
      case TypeEnum.Half:
        return this.halfToFloat(reader.u16());
      case TypeEnum.Float:
        return reader.f32();
      case TypeEnum.Double:
        return reader.f64();
      case TypeEnum.String:
      case TypeEnum.Token:
      case TypeEnum.AssetPath:
        return this.tokens[reader.u32()] ?? '';
      case TypeEnum.Vec2f:
        return [reader.f32(), reader.f32()];
      case TypeEnum.Vec2d:
        return [reader.f64(), reader.f64()];
      case TypeEnum.Vec2i:
        return [reader.i32(), reader.i32()];
      case TypeEnum.Vec3f:
        return [reader.f32(), reader.f32(), reader.f32()];
      case TypeEnum.Vec3d:
        return [reader.f64(), reader.f64(), reader.f64()];
      case TypeEnum.Vec3i:
        return [reader.i32(), reader.i32(), reader.i32()];
      case TypeEnum.Vec4f:
        return [reader.f32(), reader.f32(), reader.f32(), reader.f32()];
      case TypeEnum.Vec4d:
        return [reader.f64(), reader.f64(), reader.f64(), reader.f64()];
      case TypeEnum.Quatf:
        return [reader.f32(), reader.f32(), reader.f32(), reader.f32()];
      case TypeEnum.Quatd:
        return [reader.f64(), reader.f64(), reader.f64(), reader.f64()];
      case TypeEnum.Matrix4d: {
        const m: number[] = [];
        for (let i = 0; i < 16; i++) m.push(reader.f64());
        return m;
      }
      case TypeEnum.TokenVector: {
        const count = reader.u64();
        const out: string[] = [];
        for (let i = 0; i < count; i++) out.push(this.tokens[reader.u32()] ?? '');
        return out;
      }
      case TypeEnum.PathVector: {
        const count = reader.u64();
        const out: string[] = [];
        for (let i = 0; i < count; i++) out.push(this.paths[reader.u32()] ?? '');
        return out;
      }
      case TypeEnum.DoubleVector: {
        const count = reader.u64();
        const arr = new Float64Array(count);
        for (let i = 0; i < count; i++) arr[i] = reader.f64();
        return arr;
      }
      default:
        this.warnings.push(`USD crate: kiểu scalar chưa hỗ trợ (${type}) — bỏ qua giá trị.`);
        return null;
    }
  }

  private readArray(valueRep: ValueRep): unknown {
    const reader = this.reader;
    const type = valueRep.typeEnum;

    const minor = Number(this.version.split('.')[1] ?? 0);
    let size: number;
    if (minor < 7) size = reader.u32();
    else size = reader.u64();

    if (!Number.isSafeInteger(size) || size < 0) {
      throw new RangeError(`kích thước mảng USD không hợp lệ: ${size}`);
    }
    if (size > 0x7fffffff) {
      throw new RangeError(`kích thước mảng USD vượt giới hạn: ${size}`);
    }
    if (size === 0) return [];

    if (valueRep.isCompressed) return this.readCompressedArray(type, size);

    switch (type) {
      case TypeEnum.Int: {
        const arr = new Int32Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.i32();
        return arr;
      }
      case TypeEnum.UInt: {
        const arr = new Uint32Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.u32();
        return arr;
      }
      case TypeEnum.Float: {
        const arr = new Float32Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Double: {
        const arr = new Float64Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.f64();
        return arr;
      }
      case TypeEnum.Half: {
        const arr = new Float32Array(size);
        for (let i = 0; i < size; i++) arr[i] = this.halfToFloat(reader.u16());
        return arr;
      }
      case TypeEnum.Vec2f: {
        const arr = new Float32Array(size * 2);
        for (let i = 0; i < size * 2; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Vec3f: {
        const arr = new Float32Array(size * 3);
        for (let i = 0; i < size * 3; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Vec4f: {
        const arr = new Float32Array(size * 4);
        for (let i = 0; i < size * 4; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Vec3h: {
        const arr = new Float32Array(size * 3);
        for (let i = 0; i < size * 3; i++) arr[i] = this.halfToFloat(reader.u16());
        return arr;
      }
      case TypeEnum.Quatf: {
        const arr = new Float32Array(size * 4);
        for (let i = 0; i < size * 4; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Quath: {
        const arr = new Float32Array(size * 4);
        for (let i = 0; i < size * 4; i++) arr[i] = this.halfToFloat(reader.u16());
        return arr;
      }
      case TypeEnum.Matrix4d: {
        const arr = new Float64Array(size * 16);
        for (let i = 0; i < size * 16; i++) arr[i] = reader.f64();
        return arr;
      }
      case TypeEnum.Token: {
        const out: string[] = [];
        for (let i = 0; i < size; i++) out.push(this.tokens[reader.u32()] ?? '');
        return out;
      }
      default:
        this.warnings.push(`USD crate: kiểu mảng chưa hỗ trợ (${type}) — bỏ qua mảng.`);
        return [];
    }
  }

  private readCompressedArray(type: number, size: number): unknown {
    const reader = this.reader;
    switch (type) {
      case TypeEnum.Int:
      case TypeEnum.UInt: {
        const compressedSize = reader.u64();
        return decompressIntegers32(reader.bytes(compressedSize), size);
      }
      case TypeEnum.Float: {
        const code = reader.i8();
        if (code === FLOAT_COMPRESSION_INT) {
          const compressedSize = reader.u64();
          const ints = decompressIntegers32(reader.bytes(compressedSize), size);
          const floats = new Float32Array(size);
          for (let i = 0; i < size; i++) floats[i] = ints[i];
          return floats;
        }
        if (code === FLOAT_COMPRESSION_LUT) {
          const lutSize = reader.u32();
          const lut = new Float32Array(lutSize);
          for (let i = 0; i < lutSize; i++) lut[i] = reader.f32();
          const compressedSize = reader.u64();
          const indices = decompressIntegers32(reader.bytes(compressedSize), size);
          const floats = new Float32Array(size);
          for (let i = 0; i < size; i++) floats[i] = lut[indices[i]];
          return floats;
        }
        this.warnings.push(`USD crate: mã nén float lạ (${code}) — dùng 0.`);
        return new Float32Array(size);
      }
      default:
        this.warnings.push(`USD crate: chưa hỗ trợ nén kiểu mảng ${type}.`);
        return [];
    }
  }

  private halfToFloat(h: number): number {
    const sign = (h & 0x8000) >> 15;
    const exp = (h & 0x7c00) >> 10;
    const frac = h & 0x03ff;
    if (exp === 0) {
      if (frac === 0) return sign ? -0 : 0;
      return (sign ? -1 : 1) * HALF_DENORM_SCALE * (frac / 1024);
    }
    if (exp === 31) return frac ? NaN : sign ? -Infinity : Infinity;
    return (sign ? -1 : 1) * HALF_EXPONENT_TABLE[exp] * (1 + frac / 1024);
  }
}
