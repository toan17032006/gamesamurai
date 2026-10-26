// engine/scripts/scan-generic-returns.mjs
// Quét các method trả về kết quả "generic" — tức bản ghi chuẩn hoá có
// `valid: true` / `result: <hằng>` dù cho mọi trường hợp.
//
// Đây là dạng "return có sẵn, không phù hợp": kết quả không phản ánh đầu vào.
//
// Dùng: node scripts/scan-generic-returns.mjs [thư mục con]
import fs from 'fs';
import path from 'path';

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

/** Cho phép generic: `public name<T = any>(...)`. */
function extractMethods(src) {
  const methods = [];
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*:\s*([^{]+?)\s*\{\s*$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const bodyStart = src.indexOf('{', m.index);
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
    methods.push({ name: m[1], params: m[2].trim(), ret: m[3].trim(), body, line });
  }
  return methods;
}

const only = process.argv[2] || '';
const hits = [];
let scanned = 0;

for (const f of walk(ROOT)) {
  const rel = path.relative(process.cwd(), f).replace(/\\/g, '/');
  if (only && !rel.includes(only)) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const meth of extractMethods(src)) {
    scanned++;
    const body = meth.body.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    // namedResult('x', <hằng>) — hằng là số / chuỗi rỗng / true / null
    const named = /namedResult\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^,)]+)\s*\)/g;
    let m;
    while ((m = named.exec(body)) !== null) {
      const arg = m[2].trim();
      if (/^(0|0\.0|false|true|null|undefined|''|""|\[\]|\{\})$/.test(arg)) {
        hits.push({ rel, line: meth.line, name: meth.name, kind: 'namedResult-const', detail: m[0] });
      }
    }
    // measurement('x', <hằng>) — giá trị đo cố định
    const meas = /measurement\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^,)]+)/g;
    while ((m = meas.exec(body)) !== null) {
      const arg = m[2].trim();
      if (/^(0|0\.0|1|false|true|null|undefined|''|""|\[\]|\{\})$/.test(arg)) {
        hits.push({ rel, line: meth.line, name: meth.name, kind: 'measurement-const', detail: m[0] });
      }
    }
  }
}

console.log(`Quét ${scanned} method — tìm ${hits.length} trả về generic-không-phụ-thuộc-đầu-vào.\n`);
const byFile = new Map();
for (const h of hits) {
  if (!byFile.has(h.rel)) byFile.set(h.rel, []);
  byFile.get(h.rel).push(h);
}
for (const [file, hs] of byFile) {
  console.log(`── ${file}  (${hs.length})`);
  const seen = new Set();
  for (const h of hs) {
    const key = h.name + h.kind;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`   L${String(h.line).padStart(5)}  ${h.name}  [${h.kind}]  ${h.detail}`);
  }
  console.log('');
}
