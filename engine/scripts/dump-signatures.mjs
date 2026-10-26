/**
 * Liệt kê chữ ký method của một hoặc nhiều file, kèm số dòng.
 * Dùng để viết lại subsystem mà không phải đọc toàn bộ file.
 *
 * Dùng: node scripts/dump-signatures.mjs src/spatial-ui/subsystems/<file>.ts
 */
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Dùng: node scripts/dump-signatures.mjs <file> [...]');
  process.exit(1);
}

const RE = /^[ \t]*public\s+(?:static\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*:\s*([^{]+)\{/;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  console.log(`\n===== ${file} =====`);
  for (let i = 0; i < lines.length; i++) {
    const m = RE.exec(lines[i]);
    if (!m) continue;
    const params = m[2].trim().replace(/\s+/g, ' ');
    console.log(`${String(i + 1).padStart(5)} ${m[1]}(${params}) : ${m[3].trim()}`);
  }
}
