/**
 * @file xml-lite.ts
 * @module @aetheria/engine/asset-parser/xml-lite
 * @description Đọc XML tối giản — không phụ thuộc DOM.
 *
 * Vì sao không dùng `DOMParser`:
 *  • Node (server, kiểm thử headless) không có DOM — `DOMParser is not defined`;
 *  • `DOMParser` của trình duyệt chỉ có trong môi trường trình duyệt.
 *
 * Parser này đủ cho XML của Collada (`.dae`): phần tử, thuộc tính, nội dung
 * văn bản, chú thích, CDATA và khai báo. Không hỗ trợ namespace phức tạp,
 * entity tuỳ biến hay DTD — đủ cho tài sản 3D.
 */

/** Một nút trong cây XML. */
export interface XmlNode {
  /** Tên phần tử (không kể tiền tố namespace). */
  name: string;
  /** Thuộc tính. */
  attrs: Record<string, string>;
  /** Phần tử con. */
  children: XmlNode[];
  /** Nội dung văn bản (đã giải mã entity cơ bản). */
  text: string;
}

/** Các entity XML cơ bản. */
const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** Giải mã entity XML cơ bản. */
export function decodeXmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (entity.startsWith('#')) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Tìm vị trí kết thúc thẻ, bỏ qua các ký tự `>` nằm trong giá trị thuộc tính. */
function findTagEnd(source: string, start: number): number {
  let quote: string | null = null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '>') return i;
  }
  return source.length;
}

/** Tách tên phần tử và thuộc tính từ nội dung thẻ. */
function parseTagBody(body: string): { name: string; attrs: Record<string, string> } {
  const attrs: Record<string, string> = {};
  const trimmed = body.trim();
  const nameMatch = /^[^\s/>]+/.exec(trimmed);
  const name = nameMatch ? nameMatch[0] : '';

  const attrRe = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(trimmed)) !== null) {
    const value = m[3] !== undefined ? m[3] : (m[4] ?? '');
    attrs[m[1]] = decodeXmlEntities(value);
  }

  return { name: name.includes(':') ? name.slice(name.indexOf(':') + 1) : name, attrs };
}

/**
 * Phân tích chuỗi XML thành cây phần tử.
 *
 * @param source - nội dung XML
 * @returns nút gốc ảo (`#root`) chứa các phần tử cấp cao nhất
 */
export function parseXml(source: string): XmlNode {
  const root: XmlNode = { name: '#root', attrs: {}, children: [], text: '' };
  const stack: XmlNode[] = [root];

  let i = 0;
  const length = source.length;

  while (i < length) {
    const lt = source.indexOf('<', i);

    if (lt < 0) {
      stack[stack.length - 1].text += decodeXmlEntities(source.slice(i));
      break;
    }
    if (lt > i) {
      stack[stack.length - 1].text += decodeXmlEntities(source.slice(i, lt));
    }

    // Chú thích
    if (source.startsWith('<!--', lt)) {
      const end = source.indexOf('-->', lt + 4);
      i = end < 0 ? length : end + 3;
      continue;
    }

    // CDATA — nội dung lấy nguyên văn
    if (source.startsWith('<![CDATA[', lt)) {
      const end = source.indexOf(']]>', lt + 9);
      stack[stack.length - 1].text += source.slice(lt + 9, end < 0 ? length : end);
      i = end < 0 ? length : end + 3;
      continue;
    }

    // Khai báo XML / xử lý chỉ dẫn
    if (source.startsWith('<?', lt)) {
      const end = source.indexOf('?>', lt + 2);
      i = end < 0 ? length : end + 2;
      continue;
    }

    // DOCTYPE và các khai báo khác
    if (source.startsWith('<!', lt)) {
      const end = source.indexOf('>', lt);
      i = end < 0 ? length : end + 1;
      continue;
    }

    // Thẻ đóng
    if (source.startsWith('</', lt)) {
      const end = source.indexOf('>', lt);
      if (stack.length > 1) stack.pop();
      i = end < 0 ? length : end + 1;
      continue;
    }

    // Thẻ mở
    const tagEnd = findTagEnd(source, lt);
    const raw = source.slice(lt + 1, tagEnd);
    const selfClosing = raw.trimEnd().endsWith('/');
    const body = selfClosing ? raw.trimEnd().slice(0, -1) : raw;
    const { name, attrs } = parseTagBody(body);

    const node: XmlNode = { name, attrs, children: [], text: '' };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);

    i = tagEnd + 1;
  }

  return root;
}

/** Tìm phần tử con đầu tiên có tên cho trước (không phân biệt hoa thường). */
export function findChild(node: XmlNode, name: string): XmlNode | undefined {
  const lower = name.toLowerCase();
  return node.children.find((child) => child.name.toLowerCase() === lower);
}

/** Tìm tất cả phần tử con có tên cho trước. */
export function findChildren(node: XmlNode, name: string): XmlNode[] {
  const lower = name.toLowerCase();
  return node.children.filter((child) => child.name.toLowerCase() === lower);
}

/** Tìm phần tử con đầu tiên có tên cho trước, tìm đệ quy. */
export function findDescendant(node: XmlNode, name: string): XmlNode | undefined {
  const lower = name.toLowerCase();
  for (const child of node.children) {
    if (child.name.toLowerCase() === lower) return child;
    const nested = findDescendant(child, name);
    if (nested) return nested;
  }
  return undefined;
}
