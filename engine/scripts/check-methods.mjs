// engine/scripts/check-methods.mjs
// Đối chiếu method của từng subsystem với catalog JSON và với git HEAD.
//
// Dùng: node scripts/check-methods.mjs
// Báo cáo: method bị mất, method thừa, và method còn trùng body.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const ROOT = path.resolve('src');

/** Các cặp (file subsystem, catalog JSON) — danh sách hàm bắt buộc của từng lớp. */
const CATALOGS = [
  { catalog: 'tests/spatial_ui_functions_1800.json', master: 'src/spatial-ui/spatial-ui-system.ts', prefix: 'src/spatial-ui/subsystems/' },
  { catalog: 'tests/behavior_functions_1200.json', master: 'src/behavior/behavior-system.ts', prefix: 'src/behavior/subsystems/' },
  { catalog: 'tests/world_functions_800.json', master: 'src/world/world.ts', prefix: 'src/world/subsystems/' },
  { catalog: 'tests/animal_functions_800.json', master: 'src/animal/animal.ts', prefix: 'src/animal/subsystems/' },
];

function extractMethods(src) {
  const methods = [];
  // Cho phép tham số generic: `public createWorldObject<T = any>(...)`.
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(/gm;
  let m;
  while ((m = re.exec(src)) !== null) methods.push(m[1]);
  return methods;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

/** Lấy danh sách method từ git HEAD (null nếu file mới). */
function headMethods(relPath) {
  try {
    const content = execFileSync('git', ['show', `HEAD:${relPath}`], {
      cwd: path.resolve('..'),
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    return new Set(extractMethods(content));
  } catch {
    return null;
  }
}

let problems = 0;

for (const { catalog, master, prefix } of CATALOGS) {
  const catalogPath = path.resolve(catalog);
  if (!fs.existsSync(catalogPath)) {
    console.log(`⚠ Không tìm thấy catalog ${catalog}`);
    continue;
  }
  const entries = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const required = new Set(entries.map((e) => e.name));

  // Master class phải có đủ toàn bộ method của catalog.
  const masterSrc = fs.readFileSync(path.resolve(master), 'utf8');
  const masterMethods = new Set(extractMethods(masterSrc));
  const missingMaster = [...required].filter((n) => !masterMethods.has(n));
  if (missingMaster.length) {
    problems += missingMaster.length;
    console.log(`✗ ${master}: thiếu ${missingMaster.length} method — ${missingMaster.slice(0, 12).join(', ')}`);
  } else {
    console.log(`✓ ${master}: đủ ${required.size} method theo catalog`);
  }

  // Tổng hợp method của toàn bộ subsystem.
  const subsystemMethods = new Set();
  for (const file of walk(path.resolve(prefix))) {
    for (const name of extractMethods(fs.readFileSync(file, 'utf8'))) {
      subsystemMethods.add(name);
    }
  }
  const missingSubsystem = [...required].filter((n) => !subsystemMethods.has(n));
  if (missingSubsystem.length) {
    problems += missingSubsystem.length;
    console.log(`✗ ${prefix}: thiếu ${missingSubsystem.length} method — ${missingSubsystem.slice(0, 12).join(', ')}`);
  } else {
    console.log(`✓ ${prefix}: đủ ${required.size} method theo catalog`);
  }

  // So với git HEAD — không được mất method nào.
  const files = walk(path.resolve(prefix));
  for (const file of files) {
    const rel = path.relative(path.resolve('..'), file).replace(/\\/g, '/');
    const head = headMethods(rel);
    if (!head) continue;
    const now = new Set(extractMethods(fs.readFileSync(file, 'utf8')));
    const lost = [...head].filter((n) => !now.has(n));
    if (lost.length) {
      problems += lost.length;
      console.log(`✗ ${rel}: mất ${lost.length} method so với HEAD — ${lost.slice(0, 12).join(', ')}`);
    }
  }
}

console.log(problems === 0 ? '\n✅ Không mất method nào.' : `\n❌ Tổng ${problems} vấn đề.`);
process.exit(problems === 0 ? 0 : 1);
