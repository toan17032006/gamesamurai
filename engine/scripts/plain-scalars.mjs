/**
 * Đổi các hàm đo vô hướng từ `return scalar('Tên', value, ...)` về `return value;`
 * để giữ đúng hợp đồng kiểu trả về gốc (số thay vì record).
 *
 * Dùng: node scripts/plain-scalars.mjs <file.ts> <TênHàm> [TênHàm...]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [file, ...names] = process.argv.slice(2);
if (!file || names.length === 0) {
  console.error('Dùng: node scripts/plain-scalars.mjs <file.ts> <TênHàm> [...]');
  process.exit(1);
}

let source = readFileSync(file, 'utf8');
let changed = 0;

for (const name of names) {
  const marker = `scalar('${name}',`;
  let replacedForName = 0;
  // Một method có thể có nhiều nhánh trả về — đổi hết.
  for (;;) {
    const index = source.indexOf(marker);
    if (index < 0) break;

    // Lùi về `return` để thay trọn câu lệnh.
    const returnIndex = source.lastIndexOf('return', index);
    if (returnIndex < 0) break;

    // Tìm dấu phẩy phân tách đối số thứ hai (giá trị) ở độ sâu ngoặc 0.
    let depth = 0;
    let cursor = index + marker.length;
    let valueEnd = -1;
    for (; cursor < source.length; cursor++) {
      const ch = source[cursor];
      if (ch === '(' || ch === '{' || ch === '[') depth++;
      else if (ch === ')' || ch === '}' || ch === ']') depth--;
      else if (ch === ',' && depth === 0) {
        valueEnd = cursor;
        break;
      }
    }
    if (valueEnd < 0) break;
    const value = source.slice(index + marker.length, valueEnd).trim();

    // Tìm dấu `;` kết thúc câu lệnh.
    let statementEnd = -1;
    depth = 0;
    for (cursor = index; cursor < source.length; cursor++) {
      const ch = source[cursor];
      if (ch === '(' || ch === '{' || ch === '[') depth++;
      else if (ch === ')' || ch === '}' || ch === ']') depth--;
      else if (ch === ';' && depth === 0) {
        statementEnd = cursor;
        break;
      }
    }
    if (statementEnd < 0) break;

    source = `${source.slice(0, returnIndex)}return ${value};${source.slice(statementEnd + 1)}`;
    replacedForName++;
  }
  if (replacedForName === 0) {
    console.warn(`⚠ không tìm thấy: ${name}`);
  } else {
    changed += replacedForName;
  }
}

writeFileSync(file, source, 'utf8');
console.log(`✔ đã đổi ${changed}/${names.length} hàm trong ${file}`);
