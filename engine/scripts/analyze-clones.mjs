// engine/scripts/analyze-clones.mjs
// Liệt kê các method có body trùng lặp trong engine/src — nền tảng để tối ưu.
//
// Dùng: node scripts/analyze-clones.mjs [thư mục con]
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

function extractMethods(src) {
  const methods = [];
  // Cho phép tham số generic: `public createWorldObject<T = any>(...)`.
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*:\s*([^{]+?)\s*\{\s*$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const start = m.index;
    const bodyStart = src.indexOf('{', start);
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
    const line = src.slice(0, start).split('\n').length;
    methods.push({ name: m[1], params: m[2].trim(), ret: m[3].trim(), body, line });
  }
  return methods;
}

// Dùng: node scripts/analyze-clones.mjs [--summary] [thư mục con]
const args = process.argv.slice(2);
const summary = args.includes('--summary');
const only = args.find((a) => !a.startsWith('--')) ?? '';
const totals = { methods: 0, cloned: 0, groups: 0 };
const globalGroups = new Map();

for (const f of walk(ROOT)) {
  const rel = path.relative(process.cwd(), f).replace(/\\/g, '/');
  if (only && !rel.includes(only)) continue;

  const src = fs.readFileSync(f, 'utf8');
  const methods = extractMethods(src);
  if (methods.length === 0) continue;

  const groups = new Map();
  for (const meth of methods) {
    const norm = meth.body
      .replace(new RegExp(meth.name.replace(/\$/g, '\\$'), 'g'), 'FN')
      .replace(/\s+/g, ' ')
      .trim();
    if (!groups.has(norm)) groups.set(norm, []);
    groups.get(norm).push(meth);
  }

  // Delegator: chỉ gọi (this.X as any).NAME(...) → không phải clone thật.
  const delegatorGroups = [...groups.entries()].filter(([norm]) =>
    /return\s*\(this\.[A-Za-z]+\s+as\s+any\)\.[A-Za-z_$]/.test(norm),
  );
  const delegatorMethods = delegatorGroups.reduce((s, [, ms]) => s + ms.length, 0);

  const realGroups = [...groups.entries()].filter(
    ([norm, ms]) => ms.length > 1 && !/return\s*\(this\.[A-Za-z]+\s+as\s+any\)\./.test(norm),
  );

  const realCloned = realGroups.reduce((s, [, ms]) => s + ms.length, 0);
  totals.methods += methods.length;
  totals.cloned += realCloned;
  totals.groups += realGroups.length;

  for (const [norm, ms] of realGroups) {
    if (!globalGroups.has(norm)) globalGroups.set(norm, []);
    globalGroups.get(norm).push({ rel, ms });
  }

  if (realGroups.length === 0) continue;

  if (summary) {
    console.log(
      `${rel.padEnd(62)} ${String(methods.length).padStart(4)} method  ` +
        `${String(realCloned).padStart(4)} trùng body  (${realGroups.length} nhóm)`,
    );
    continue;
  }

  console.log('\n' + '='.repeat(100));
  console.log(`${rel}  —  ${methods.length} method, ${realCloned} bị trùng body (${realGroups.length} nhóm)`);
  console.log('='.repeat(100));

  realGroups
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([norm, ms], idx) => {
      console.log(`\n  [nhóm ${idx + 1}] ${ms.length} method — body:`);
      console.log(`    ${norm.slice(0, 220)}`);
      console.log(`    tên: ${ms.map((m) => m.name).join(', ')}`);
    });
}

// Tổng hợp theo body trùng trên TOÀN bộ src — đây là danh sách "nghi phạm"
// mà tên hàm khác nhau nhưng logic thật là một.
const acrossFiles = [...globalGroups.entries()]
  .map(([norm, entries]) => ({
    norm,
    total: entries.reduce((s, e) => s + e.ms.length, 0),
    files: new Set(entries.map((e) => e.rel)).size,
    names: entries.flatMap((e) => e.ms.map((m) => m.name)),
    entries,
  }))
  .filter((g) => g.total > 1)
  .sort((a, b) => b.total - a.total);

console.log('\n\n================ TỔNG KẾT ================');
console.log(`method: ${totals.methods}, bị trùng body: ${totals.cloned}, nhóm trùng: ${totals.groups}`);
console.log(`nhóm trùng body xuyên file: ${acrossFiles.length}`);

if (summary || acrossFiles.length > 0) {
  console.log('\n--- Top 25 nhóm trùng body (xuyên file) ---');
  for (const g of acrossFiles.slice(0, 25)) {
    console.log(
      `\n[${g.total} method / ${g.files} file] ${g.norm.slice(0, 200)}`,
    );
    console.log(`  tên: ${g.names.slice(0, 14).join(', ')}${g.names.length > 14 ? ', …' : ''}`);
    console.log(`  file: ${[...new Set(g.entries.map(([rel]) => rel))].slice(0, 4).join(', ')}`);
  }
}
