#!/usr/bin/env node
/**
 * Kiểm tra bảng mốc giải phẫu: mọi mốc được các subsystem cơ thể gọi tới phải
 * có trong `anatomy-metrics.ts`. Mốc thiếu sẽ rơi vào fallback suy đoán theo
 * tên (vốn dùng `headRadius` cho mọi vùng) → sai giải phẫu.
 *
 * Dùng: npx tsx scripts/check-landmarks.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bodyOffset } from '../src/spatial-ui/anatomy-metrics.js';

const FILES = [
  'anatomical-upper-body-subsystem.ts',
  'anatomical-lower-body-subsystem.ts',
  'anatomical-hand-digits-subsystem.ts',
];
const DIR = resolve(import.meta.dirname, '../src/spatial-ui/subsystems');

const missing = new Map();
const used = new Map();

for (const file of FILES) {
  const text = readFileSync(resolve(DIR, file), 'utf8');
  const re = /landmarkPosition\('([^']+)'/g;
  let match;
  while ((match = re.exec(text))) {
    used.set(match[1], (used.get(match[1]) ?? 0) + 1);
    if (!bodyOffset(match[1])) {
      if (!missing.has(match[1])) missing.set(match[1], []);
      missing.get(match[1]).push(file);
    }
  }
}

console.log(`Tổng mốc được gọi: ${used.size}`);
console.log(`Mốc KHÔNG có trong bảng: ${missing.size}`);
for (const [name, where] of missing) {
  console.log(`  ✗ ${name}  (${where[0]})`);
}

if (missing.size > 0) {
  console.error(`\n❌ ${missing.size} mốc chưa có offset giải phẫu.`);
  process.exit(1);
}
console.log('\n✅ Mọi mốc đều có offset giải phẫu.');
