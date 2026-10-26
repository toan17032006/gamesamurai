/**
 * @file usda-parser.ts
 * @module @aetheria/engine/asset-parser/usda-parser
 * @description Bóc tách USD ASCII (`.usda`).
 *
 * Cú pháp USDA: prim `def <Type> "<name>" { ... }` chứa thuộc tính
 * (`type[] name = value`) và prim con. Giá trị có thể là số, chuỗi, bool,
 * tuple, mảng, dict, đường dẫn prim (`</A/B>`) hoặc asset (`@./tex.png@`).
 *
 * Parser sinh ra cùng cấu trúc `UsdSpec[]` với bộ đọc crate nhị phân, để hai
 * định dạng dùng chung một bộ dựng scene.
 */

import type { UsdSpec, UsdSpecType } from './usdc-parser.js';

export interface UsdaParseResult {
  specs: UsdSpec[];
  warnings: string[];
  version: string;
  /** Siêu dữ liệu layer (defaultPrim, metersPerUnit, upAxis…). */
  metadata: Record<string, unknown>;
}

type TokenType = 'ident' | 'number' | 'string' | 'punct' | 'path' | 'asset' | 'eof';

interface Token {
  type: TokenType;
  value: string;
  line: number;
}

/** Tách token cho USDA. */
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;

  const push = (type: TokenType, value: string): void => {
    tokens.push({ type, value, line });
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === '\n') {
      line++;
      i++;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      i++;
      continue;
    }
    // Chú thích dòng
    if (ch === '#') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    // Chuỗi
    if (ch === '"') {
      let out = '';
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === '\\' && i + 1 < text.length) {
          const next = text[i + 1];
          out += next === 'n' ? '\n' : next === 't' ? '\t' : next;
          i += 2;
          continue;
        }
        if (text[i] === '\n') line++;
        out += text[i++];
      }
      i++; // dấu " kết thúc
      push('string', out);
      continue;
    }
    // Đường dẫn prim </A/B>
    if (ch === '<' && text[i + 1] === '/') {
      const end = text.indexOf('>', i);
      if (end < 0) throw new Error(`AssetParser: USDA đường dẫn prim không đóng tại dòng ${line}`);
      push('path', text.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    // Asset path @./file@
    if (ch === '@') {
      const end = text.indexOf('@', i + 1);
      if (end < 0) throw new Error(`AssetParser: USDA asset path không đóng tại dòng ${line}`);
      push('asset', text.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    // Số
    if (/[0-9]/.test(ch) || (ch === '-' && /[0-9.]/.test(text[i + 1] ?? '')) || (ch === '.' && /[0-9]/.test(text[i + 1] ?? ''))) {
      let out = '';
      while (i < text.length && /[0-9.eE+\-]/.test(text[i])) {
        // Dừng ở dấu '-' nếu không theo sau bởi chữ số (phần trừ toán học)
        if ((text[i] === '-' || text[i] === '+') && !/[0-9.]/.test(text[i + 1] ?? '')) break;
        out += text[i++];
      }
      push('number', out);
      continue;
    }
    // Dấu câu
    if ('{}[]()=,;:'.includes(ch)) {
      push('punct', ch);
      i++;
      continue;
    }
    // Định danh (có thể chứa dấu chấm, gạch dưới, namespace ':')
    // Kiểu mảng của USD viết kèm: "int[]", "point3f[]", "uniform token[]".
    if (/[A-Za-z_]/.test(ch)) {
      let out = '';
      while (i < text.length && /[A-Za-z0-9_.:\-]/.test(text[i])) out += text[i++];

      if (text[i] === '[' && text[i + 1] === ']') {
        out += '[]';
        i += 2;
        push('ident', out);
        // Trường hợp không có khoảng trắng: "int[]faceVertexCounts" → tách thành
        // kiểu "int[]" và tên "faceVertexCounts".
        if (i < text.length && /[A-Za-z_]/.test(text[i])) {
          let name = '';
          while (i < text.length && /[A-Za-z0-9_.:\-]/.test(text[i])) name += text[i++];
          push('ident', name);
        }
        continue;
      }

      push('ident', out);
      continue;
    }
    // Ký tự lạ — bỏ qua
    i++;
  }

  push('eof', '');
  return tokens;
}

/** Bộ phân tích cú pháp USDA đệ quy. */
class UsdaParser {
  private pos = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly warnings: string[],
  ) {}

  public parse(): { specs: UsdSpec[]; metadata: Record<string, unknown>; version: string } {
    const specs: UsdSpec[] = [];
    const metadata: Record<string, unknown> = {};
    let version = '1.0';

    // Header `#usda 1.0`
    if (this.peek().type === 'ident' && this.peek().value.toLowerCase() === 'usda') {
      this.next();
      const ver = this.next();
      if (ver.type === 'number') version = ver.value;
    }

    // Metadata ngoài ngoặc
    if (this.peek().value === '(') {
      this.next();
      const meta = this.parseMetadataBlock();
      Object.assign(metadata, meta);
    }

    // Prim gốc
    while (this.peek().type !== 'eof') {
      const prim = this.parsePrim('/');
      if (prim) specs.push(prim);
      else break;
    }

    return { specs, metadata, version };
  }

  private parseMetadataBlock(): Record<string, unknown> {
    const meta: Record<string, unknown> = {};
    while (this.peek().type !== 'eof' && this.peek().value !== ')') {
      const key = this.next();
      if (key.type === 'eof') break;
      if (this.peek().value === '=') {
        this.next();
        meta[key.value] = this.parseValue();
      }
    }
    if (this.peek().value === ')') this.next();
    return meta;
  }

  private parsePrim(parentPath: string): UsdSpec | null {
    const token = this.peek();
    if (token.type !== 'ident') return null;

    const lower = token.value.toLowerCase();
    if (lower !== 'def' && lower !== 'over' && lower !== 'class') return null;

    const specType: UsdSpecType = lower === 'def' ? 'def' : lower === 'over' ? 'over' : 'class';
    this.next();

    // Kiểu prim (tuỳ chọn)
    if (this.peek().type === 'ident' && this.peek().value !== '"') {
      this.next();
    }
    // Tên prim
    let name = 'prim';
    if (this.peek().type === 'string') {
      name = this.next().value;
    }
    const path = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;

    const spec: UsdSpec = { path, specType, fields: {} };

    if (this.peek().value === '(') {
      this.next();
      this.parseMetadataBlock();
    }
    if (this.peek().value !== '{') return spec;
    this.next();

    // Nội dung prim: thuộc tính + prim con
    while (this.peek().type !== 'eof' && this.peek().value !== '}') {
      const before = this.pos;
      const child = this.parsePrim(path);
      if (child) {
        // prim con được thêm ở nơi khác — giữ danh sách phẳng
        this.parsedChildren.push(child);
        continue;
      }
      if (this.pos !== before) continue; // parsePrim đã tiêu thụ token
      this.parseProperty(spec);
      // Chống vòng lặp vô hạn nếu property không parse được token nào.
      if (this.pos === before) this.next();
    }
    if (this.peek().value === '}') this.next();

    return spec;
  }

  public readonly parsedChildren: UsdSpec[] = [];

  private parseProperty(spec: UsdSpec): void {
    // Tuỳ chọn: uniform / custom / variability
    while (
      this.peek().type === 'ident' &&
      ['uniform', 'custom', 'varying', 'config'].includes(this.peek().value.toLowerCase())
    ) {
      this.next();
    }

    const nameToken = this.peek();
    if (nameToken.type !== 'ident') {
      this.next();
      return;
    }
    this.next();
    const propertyName = nameToken.value;

    // Nếu kế tiếp là '=' → thuộc tính không kiểu (hoặc đã bỏ qua type)
    if (this.peek().value === '=') {
      this.next();
      spec.fields[propertyName] = this.parseValue();
      return;
    }

    // Ngược lại: đã đọc kiểu → giờ tới tên thuộc tính
    const realName = this.peek();
    if (realName.type !== 'ident') {
      this.next();
      return;
    }
    this.next();
    if (this.peek().value === '(') {
      this.next();
      this.parseMetadataBlock();
    }
    if (this.peek().value !== '=') return;
    this.next();
    spec.fields[realName.value] = this.parseValue();
  }

  private parseValue(): unknown {
    const token = this.peek();

    switch (token.type) {
      case 'number': {
        this.next();
        const v = Number(token.value);
        return Number.isNaN(v) ? 0 : v;
      }
      case 'string':
        this.next();
        return token.value;
      case 'asset':
        this.next();
        return { assetPath: token.value };
      case 'path':
        this.next();
        return { primPath: token.value };
      case 'ident': {
        this.next();
        const lower = token.value.toLowerCase();
        if (lower === 'true') return true;
        if (lower === 'false') return false;
        if (lower === 'none' || lower === 'null') return null;
        if (lower === 'inf') return Infinity;
        if (lower === '-inf') return -Infinity;
        return token.value;
      }
      case 'punct':
        if (token.value === '(') return this.parseTuple();
        if (token.value === '[') return this.parseArray();
        if (token.value === '{') return this.parseDict();
        this.next();
        return null;
      default:
        this.next();
        return null;
    }
  }

  private parseTuple(): unknown[] {
    this.next(); // '('
    const out: unknown[] = [];
    while (this.peek().type !== 'eof' && this.peek().value !== ')') {
      out.push(this.parseValue());
      if (this.peek().value === ',') this.next();
    }
    if (this.peek().value === ')') this.next();
    return out;
  }

  private parseArray(): unknown[] {
    this.next(); // '['
    const out: unknown[] = [];
    while (this.peek().type !== 'eof' && this.peek().value !== ']') {
      out.push(this.parseValue());
      if (this.peek().value === ',') this.next();
    }
    if (this.peek().value === ']') this.next();
    return out;
  }

  private parseDict(): Record<string, unknown> {
    this.next(); // '{'
    const out: Record<string, unknown> = {};
    while (this.peek().type !== 'eof' && this.peek().value !== '}') {
      const key = this.next();
      if (this.peek().value === '=') {
        this.next();
        out[key.value] = this.parseValue();
      }
      if (this.peek().value === ',') this.next();
    }
    if (this.peek().value === '}') this.next();
    return out;
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1];
  }

  private next(): Token {
    const t = this.peek();
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }
}

/** Bóc tách USD ASCII. */
export function parseUsda(text: string): UsdaParseResult {
  const warnings: string[] = [];
  let tokens: Token[];
  try {
    tokens = tokenize(text);
  } catch (err) {
    throw new Error(`AssetParser: lỗi cú pháp USDA — ${(err as Error).message}`);
  }

  const parser = new UsdaParser(tokens, warnings);
  const { specs, metadata, version } = parser.parse();

  // Prim con được gom vào danh sách phẳng khi parse; ghép lại thành danh sách
  // đầy đủ, sắp xếp theo độ sâu để prim cha luôn đứng trước prim con.
  const byPath = new Map<string, UsdSpec>();
  for (const spec of specs) byPath.set(spec.path, spec);
  for (const child of parser.parsedChildren) byPath.set(child.path, child);

  const ordered = [...byPath.values()].sort((a, b) => {
    const depthDiff = a.path.split('/').length - b.path.split('/').length;
    return depthDiff !== 0 ? depthDiff : a.path.localeCompare(b.path);
  });

  return { specs: ordered, warnings, version, metadata };
}
