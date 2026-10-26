// engine/scripts/scan-unused-params.mjs
//
// Dò method có tham số không dùng — dấu hiệu tham số "trang trí", tức phần
// tính toán dựa trên tham số đó chưa được viết (ví dụ `calculateTorsoVelocity(entity, dt)`
// nhận `dt` nhưng không dùng, nên vận tốc không thể suy ra từ quãng thời gian).
//
// Dùng: node scripts/scan-unused-params.mjs [thư mục con]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

/** Cho phép generic trong chữ ký. */
function extractMethods(src) {
  const methods = [];
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*:\s*([^{]+?)\s*\{\s*$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    // Dấu `{` mở thân hàm là dấu `{` CUỐI trong phần khớp — các kiểu tham số
    // dạng object (`{ x: number }`) cũng chứa `{` nên không dùng indexOf từ đầu.
    const braceOffset = m[0].lastIndexOf('{');
    const bodyStart = m.index + braceOffset;
    let depth = 0;
    let i = bodyStart;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = src.slice(bodyStart + 1, i);
    const line = src.slice(0, m.index).split('\n').length;
    methods.push({ name: m[1], params: m[2].trim(), body, line });
  }
  return methods;
}

/** Tách danh sách tham số tại cấp ngoài cùng (không phá vỡ `Record<string, any>`). */
function splitTopLevel(raw) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of raw) {
    if (ch === '<' || ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === '>' || ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Tách danh sách tham số thành tên (bỏ giá trị mặc định và kiểu). */
function paramNames(raw) {
  if (!raw.trim()) return [];
  return splitTopLevel(raw).map((p) => {
    const name = p.split('=')[0].split(':')[0].trim();
    return name.replace(/^\.\.\./, '').replace(/[?]/g, '');
  });
}

const only = process.argv[2] || '';
const findings = [];
let scanned = 0;

for (const f of walk(ROOT)) {
  const rel = path.relative(process.cwd(), f).replace(/\\/g, '/');
  if (only && !rel.includes(only)) continue;

  const src = fs.readFileSync(f, 'utf8');
  for (const meth of extractMethods(src)) {
    scanned++;
    const names = paramNames(meth.params);
    if (names.length === 0) continue;

    // Thân hàm không tính vào việc đếm tham số.
    const body = meth.body
      .replace(/\/\/[^\n]*/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ');

    const unused = names.filter((name) => {
      if (!name || name === 'this') return false;
      const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      return !re.test(body);
    });

    if (unused.length > 0) {
      findings.push({ rel, line: meth.line, name: meth.name, params: meth.params, unused });
    }
  }
}

const byFile = new Map();
for (const item of findings) {
  if (!byFile.has(item.rel)) byFile.set(item.rel, []);
  byFile.get(item.rel).push(item);
}

console.log(`Quét ${scanned} method — ${findings.length} method có tham số không dùng.\n`);

for (const [file, items] of byFile) {
  console.log(`── ${file}  (${items.length})`);
  for (const item of items.slice(0, 40)) {
    console.log(`   L${String(item.line).padStart(5)}  ${item.name}(${item.params})  →  không dùng: ${item.unused.join(', ')}`);
  }
  if (items.length > 40) console.log(`   … +${items.length - 40} method nữa`);
  console.log('');
}
