/**
 * @file engine-data-parser.ts
 * @module @aetheria/engine/asset-parser/engine-data-parser
 * @description Bóc tách các định dạng riêng của Engine.
 *
 * Engine không dùng phần mở rộng riêng mà gắn "kind" vào JSON, để một tệp
 * `.json` có thể mang nhiều loại dữ liệu khác nhau:
 *
 *   - `aetheria.forge.design` → ForgeDesignSpec (đặc tả thiết kế trong AETHERIA Forge)
 *   - `aetheria.bot.spec`     → BotSpecDocument (đặc tả bot/monster)
 *   - manifest                → catalog `{ version, generatedAt, entries[] }`
 *   - sidecar                 → metadata đi kèm một asset khác
 */

import type { AssetFormat } from '../types/asset.types.js';

export interface EngineDataParseResult {
  format: AssetFormat;
  /** Payload đã phân tích (object JSON). */
  data: unknown;
  /** Cảnh báo khi dữ liệu không khớp kỳ vọng của định dạng. */
  warnings: string[];
}

export const FORGE_DESIGN_KIND = 'aetheria.forge.design';
export const BOT_SPEC_KIND = 'aetheria.bot.spec';

/** Đọc `kind` từ đối tượng JSON (hỗ trợ cả dạng lồng trong mảng). */
function detectKind(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.kind === 'string') return record.kind;
  // Một số tài liệu bọc kind trong `metadata`.
  const metadata = record.metadata;
  if (metadata && typeof metadata === 'object') {
    const metaKind = (metadata as Record<string, unknown>).kind;
    if (typeof metaKind === 'string') return metaKind;
  }
  return null;
}

/** Đọc manifest asset. */
function parseManifest(value: unknown, warnings: string[]): unknown {
  if (!value || typeof value !== 'object') {
    warnings.push('Manifest không phải object.');
    return value;
  }
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.entries)) {
    warnings.push('Manifest thiếu mảng "entries".');
  } else {
    const entries = record.entries as unknown[];
    let invalid = 0;
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') {
        invalid++;
        continue;
      }
      const e = entry as Record<string, unknown>;
      if (typeof e.id !== 'string' || typeof e.path !== 'string') invalid++;
    }
    if (invalid > 0) warnings.push(`Manifest có ${invalid} entry thiếu trường bắt buộc (id/path).`);
  }
  if (typeof record.version !== 'number') {
    warnings.push('Manifest thiếu trường "version" dạng số.');
  }
  return value;
}

/**
 * Bóc tách dữ liệu Engine từ nội dung JSON.
 *
 * @param text - nội dung tệp
 * @param format - định dạng do `formatOf()` suy ra
 */
export function parseEngineData(text: string, format: AssetFormat): EngineDataParseResult {
  const warnings: string[] = [];

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (err) {
    throw new Error(`AssetParser: JSON không hợp lệ — ${(err as Error).message}`);
  }

  const kind = detectKind(value);

  switch (format) {
    case 'forge-design': {
      if (kind !== FORGE_DESIGN_KIND) {
        warnings.push(`Thiếu kind "${FORGE_DESIGN_KIND}" trong tài liệu Forge.`);
      }
      const record = (value ?? {}) as Record<string, unknown>;
      if (typeof record.name !== 'string' || record.name.length === 0) {
        warnings.push('ForgeDesignSpec thiếu trường "name".');
      }
      if (!Array.isArray(record.parts)) {
        warnings.push('ForgeDesignSpec thiếu mảng "parts".');
      }
      break;
    }
    case 'bot-spec': {
      if (kind !== BOT_SPEC_KIND) {
        warnings.push(`Thiếu kind "${BOT_SPEC_KIND}" trong tài liệu bot.`);
      }
      const record = (value ?? {}) as Record<string, unknown>;
      if (typeof record.id !== 'string' || record.id.length === 0) {
        warnings.push('BotSpecDocument thiếu trường "id".');
      }
      if (!Array.isArray(record.stats)) {
        warnings.push('BotSpecDocument thiếu mảng "stats".');
      }
      break;
    }
    case 'asset-manifest': {
      parseManifest(value, warnings);
      break;
    }
    default:
      break;
  }

  return { format, data: value, warnings };
}
