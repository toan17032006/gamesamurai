// engine/scripts/inventory-bodies.mjs
// Liệt kê MỌI body khác nhau trong các subsystem hành vi, kèm số lần xuất hiện.
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/behavior/subsystems');

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
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*:\s*([^{]+?)\s*\{\s*$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const bodyStart = src.indexOf('{', m.index);
    let depth = 0;
    let i = bodyStart;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    methods.push({
      name: m[1],
      params: m[2].trim(),
      body: src.slice(bodyStart + 1, i),
      line: src.slice(0, m.index).split('\n').length,
    });
  }
  return methods;
}

const groups = new Map();
for (const file of walk(ROOT)) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
  const src = fs.readFileSync(file, 'utf8');
  for (const meth of extractMethods(src)) {
    const norm = meth.body
      .replace(new RegExp(meth.name.replace(/\$/g, '\\$'), 'g'), 'FN')
      .replace(/\s+/g, ' ')
      .trim();
    if (!groups.has(norm)) groups.set(norm, { count: 0, files: new Set(), names: [], params: new Set() });
    const g = groups.get(norm);
    g.count++;
    g.files.add(rel);
    g.names.push(meth.name);
    g.params.add(meth.params);
  }
}

const sorted = [...groups.entries()].sort((a, b) => b[1].count - a[1].count);
console.log(`Tổng ${sorted.length} body khác nhau trong ${walk(ROOT).length} file.\n`);
sorted.forEach(([norm, g], idx) => {
  console.log(`--- [${idx + 1}] x${g.count} — ${[...g.files].join(', ')}`);
  console.log(`    params: ${[...g.params].join(' | ')}`);
  console.log(`    body  : ${norm.slice(0, 400)}`);
  console.log(`    names : ${g.names.slice(0, 10).join(', ')}${g.names.length > 10 ? ` … (+${g.names.length - 10})` : ''}\n`);
});
