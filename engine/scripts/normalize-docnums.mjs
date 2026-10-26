#!/usr/bin/env node
/**
 * Đồng bộ số thứ tự docblock `[NNNN]` của các method spatial-ui với catalog
 * `tests/spatial_ui_functions_1800.json` (nguồn sự thật của Engine).
 *
 * Quy tắc: mỗi docblock gồm dòng `* [0123] methodName` ngay trước dòng
 * `public methodName(...)` sẽ được đổi `[0123]` thành số `num` của
 * `methodName` trong catalog.
 *
 * Method không có trong catalog sẽ giữ nguyên số cũ và được báo cáo.
 *
 * Dùng: node scripts/normalize-docnums.mjs [đường-dẫn-file ...]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const catalogRaw = JSON.parse(readFileSync(resolve(ROOT, 'tests/spatial_ui_functions_1800.json'), 'utf8'));
const catalog = Array.isArray(catalogRaw) ? catalogRaw : (catalogRaw.functions ?? []);
const numByName = new Map();
for (const entry of catalog) {
  const name = entry.name ?? entry.method;
  if (typeof name === 'string' && typeof entry.num === 'number') {
    numByName.set(name, entry.num);
  }
}

const DEFAULT_FILES = [
  'src/spatial-ui/subsystems/distance-vector-math-subsystem.ts',
  'src/spatial-ui/subsystems/anatomical-upper-body-subsystem.ts',
  'src/spatial-ui/subsystems/anatomical-hand-digits-subsystem.ts',
  'src/spatial-ui/subsystems/anatomical-lower-body-subsystem.ts',
  'src/spatial-ui/subsystems/skeletal-kinematics-character-subsystem.ts',
  'src/spatial-ui/subsystems/entities-fauna-flora-subsystem.ts',
  'src/spatial-ui/subsystems/camera-viewport-ui-subsystem.ts',
  'src/spatial-ui/subsystems/physics-collision-projectile-subsystem.ts',
  'src/spatial-ui/subsystems/curves-matrices-environment-subsystem.ts',
  'src/spatial-ui/subsystems/spatial-equipment-architecture-subsystem.ts',
];

const files = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_FILES;

const DOC_LINE = /^(\s*\*\s*\[)(\d{1,4})(\]\s*)(\S+)(\s*)$/;
const DOC_LINE_INLINE = /^(\s*\/\*\*\s*)(.*?)(\s*\*\/\s*)$/;
const DECL_LINE = /^\s*public\s+(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/;

let totalFixed = 0;
let totalUnchanged = 0;
const missing = [];

for (const file of files) {
  const abs = resolve(ROOT, file);
  const lines = readFileSync(abs, 'utf8').split('\n');
  let changed = 0;
  let unchanged = 0;

  for (let i = 0; i < lines.length; i++) {
    const doc = DOC_LINE.exec(lines[i]);
    if (!doc) continue;
    const docName = doc[4];
    // Tìm khai báo `public <docName>(` ở các dòng tiếp theo (bỏ qua dòng trống).
    let declIndex = -1;
    for (let j = i + 1; j < Math.min(lines.length, i + 12); j++) {
      const decl = DECL_LINE.exec(lines[j]);
      if (!decl) continue;
      if (decl[1] !== docName) break;
      declIndex = j;
      break;
    }
    if (declIndex === -1) continue;

    const target = numByName.get(docName);
    if (target === undefined) {
      missing.push(`${file}: ${docName}`);
      continue;
    }
    const formatted = String(target).padStart(4, '0');
    if (formatted === doc[2]) {
      unchanged++;
      continue;
    }
    lines[i] = `${doc[1]}${formatted}${doc[3]}${docName}${doc[5]}`;
    changed++;
  }

  // Docblock một dòng dạng `/** Mô tả. */` ngay trước `public name(` → thêm `[NNNN]`.
  for (let i = 0; i < lines.length; i++) {
    const inline = DOC_LINE_INLINE.exec(lines[i]);
    if (!inline) continue;
    const body = inline[2];
    if (/^\[\d{1,4}\]/.test(body)) continue;
    const decl = DECL_LINE.exec(lines[i + 1] ?? '');
    if (!decl) continue;
    const name = decl[1];
    const target = numByName.get(name);
    if (target === undefined) {
      missing.push(`${file}: ${name}`);
      continue;
    }
    const formatted = String(target).padStart(4, '0');
    lines[i] = `${inline[1]}[${formatted}] ${body}${inline[3]}`;
    changed++;
  }

  writeFileSync(abs, lines.join('\n'), 'utf8');
  totalFixed += changed;
  totalUnchanged += unchanged;
  console.log(`• ${relative(ROOT, abs)}: ${changed} docblock đổi số, ${unchanged} giữ nguyên`);
}

console.log(`\nTổng: ${totalFixed} docblock được đồng bộ, ${totalUnchanged} đã đúng sẵn.`);
if (missing.length > 0) {
  console.log(`\n⚠ ${missing.length} method không có trong catalog:`);
  for (const m of missing.slice(0, 40)) console.log(`   - ${m}`);
  if (missing.length > 40) console.log(`   … và ${missing.length - 40} mục khác`);
}
