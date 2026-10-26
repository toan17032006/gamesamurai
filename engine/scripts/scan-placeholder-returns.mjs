// engine/scripts/scan-placeholder-returns.mjs
// Quét method trong engine/src có thân chỉ trả về hằng số (return có sẵn, không phù hợp).
//
// Dùng: node scripts/scan-placeholder-returns.mjs [thư mục con]
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

function extractMethods(src) {
  const methods = [];
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*:\s*([^{]+?)\s*\{\s*$/gm;
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

const CONST_RETURN = /^return\s+(0|false|true|null|undefined|NaN|\{\}|\[\]|''|""|0\.0|-1)\s*;?$/;
const only = process.argv[2] || '';
const hits = [];
let scanned = 0;

for (const f of walk(ROOT)) {
  const rel = path.relative(process.cwd(), f).replace(/\\/g, '/');
  if (only && !rel.includes(only)) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const meth of extractMethods(src)) {
    scanned++;
    const lines = meth.body
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('//') && !s.startsWith('*') && !s.startsWith('/*'));
    if (lines.length === 1 && CONST_RETURN.test(lines[0])) {
      hits.push({ rel, ...meth, statement: lines[0] });
    }
  }
}

console.log(`Quét ${scanned} method — tìm ${hits.length} method chỉ trả về hằng số.\n`);
const byFile = new Map();
for (const h of hits) {
  if (!byFile.has(h.rel)) byFile.set(h.rel, []);
  byFile.get(h.rel).push(h);
}
for (const [file, hs] of byFile) {
  console.log(`── ${file}  (${hs.length})`);
  for (const h of hs.slice(0, 25)) {
    console.log(`   L${String(h.line).padStart(5)}  ${h.name}(${h.params}): ${h.ret}  →  ${h.statement}`);
  }
  if (hs.length > 25) console.log(`   … +${hs.length - 25} method nữa`);
  console.log('');
}
process.exit(hits.length === 0 ? 0 : 1);
