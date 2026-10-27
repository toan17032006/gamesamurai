/**
 * @file generator.ts
 * @module @aetheria/engine/ui-procedural/generator
 * @description Generator UI tự sinh: dựng widget tree trực tiếp từ dữ liệu mô
 * phỏng — HUD thế giới, panel thực thể, bảng nhu cầu, feed sự kiện. Không đọc
 * tệp template: cấu trúc, số lượng widget và biến thể màu đều suy từ dữ liệu
 * thực tế mỗi lần gọi (nhiều/thiếu widget tự thay đổi theo thế giới).
 */

import type { UIEntityData, UIWorldData, WidgetNode, WidgetVariant } from './types.js';

let widgetCounter = 0;

function widget(kind: WidgetNode['kind'], init: Partial<WidgetNode> = {}): WidgetNode {
  return {
    id: init.id ?? `w${++widgetCounter}_${kind}`,
    kind,
    label: init.label,
    value: init.value,
    valueText: init.valueText,
    variant: init.variant,
    children: init.children ?? [],
    style: init.style ?? {},
  };
}

/** Chọn biến thể theo mức sức khoẻ/hạnh phúc `[0, 100]`. */
export function variantForLevel(level: number): WidgetVariant {
  if (level < 25) return 'danger';
  if (level < 50) return 'warning';
  if (level < 75) return 'primary';
  return 'success';
}

/** Chọn biến thể cho nhu cầu `[0, 100]` — càng thấp càng cấp bách. */
export function variantForNeed(level: number): WidgetVariant {
  return variantForLevel(level);
}

/** Sinh một bar chuẩn hoá `[0, 100]` → `[0, 1]`. */
export function bar(label: string, level: number, id?: string): WidgetNode {
  const v = Math.max(0, Math.min(100, level)) / 100;
  return widget('bar', {
    id,
    label,
    value: v,
    valueText: `${Math.round(level)}%`,
    variant: variantForLevel(level),
  });
}

/** Panel nhu cầu Maslow tự sinh cho một thực thể. */
export function generateNeedsPanel(entity: UIEntityData): WidgetNode {
  const needs = entity.needs ?? {};
  const entries = Object.entries(needs).sort((a, b) => a[1] - b[1]); // cấp bách trước
  return widget('panel', {
    id: `needs_${entity.id}`,
    label: `Nhu cầu — ${entity.name}`,
    children: entries.map(([needId, level]) => bar(needId, level, `need_${entity.id}_${needId}`)),
    style: { gap: 4 },
  });
}

/** Feed sự kiện tự sinh — mới nhất lên đầu. */
export function generateEventFeed(
  events: ReadonlyArray<{ year: number; text: string }>,
  limit = 8,
): WidgetNode {
  const shown = events.slice(-limit).reverse();
  return widget('panel', {
    id: 'event_feed',
    label: 'Nhật ký thế giới',
    children: shown.map((event) =>
      widget('label', {
        id: `event_${event.year}_${event.text.slice(0, 12)}`,
        label: `[${event.year}] ${event.text}`,
        variant: 'muted',
      }),
    ),
  });
}

/** Panel một thực thể: danh tính + sức khoẻ/hạnh phúc + cảm xúc + nghề. */
export function generateEntityPanel(entity: UIEntityData, options: { withNeeds?: boolean } = {}): WidgetNode {
  const identity = widget('row', {
    id: `identity_${entity.id}`,
    children: [
      widget('label', { id: `name_${entity.id}`, label: entity.name, style: { bold: true, flex: 2 } }),
      widget('badge', {
        id: `age_${entity.id}`,
        label: `${entity.stage} · ${Math.floor(entity.ageYears)} tuổi`,
        variant: 'muted',
      }),
      entity.archetypeName
        ? widget('badge', { id: `class_${entity.id}`, label: entity.archetypeName, variant: 'accent' })
        : widget('label', { id: `class_none_${entity.id}`, label: '' }),
    ],
  });
  const vitals = widget('row', {
    id: `vitals_${entity.id}`,
    children: [
      bar('sức khoẻ', entity.health, `hp_${entity.id}`),
      bar('hạnh phúc', entity.happiness, `joy_${entity.id}`),
    ],
    style: { gap: 8 },
  });
  const children: WidgetNode[] = [identity, vitals];
  if (entity.emotion) {
    children.push(
      widget('badge', { id: `emo_${entity.id}`, label: `cảm xúc: ${entity.emotion}`, variant: 'primary' }),
    );
  }
  if (entity.appearanceSummary) {
    children.push(widget('label', { id: `look_${entity.id}`, label: entity.appearanceSummary, variant: 'muted' }));
  }
  if (options.withNeeds && entity.needs && Object.keys(entity.needs).length > 0) {
    children.push(generateNeedsPanel(entity));
  }
  return widget('panel', { id: `entity_${entity.id}`, children, style: { padding: 8, gap: 6 } });
}

/**
 * HUD thế giới tự sinh: header thống kê + thanh chỉ số thế giới + danh sách
 * thực thể (giới hạn `options.maxEntities`) + feed sự kiện. Cấu trúc cây thay
 * đổi theo dữ liệu: không có sự kiện → không feed; thực thể nhiều → cắt bớt.
 */
export function generateHUD(world: UIWorldData, options: { maxEntities?: number; withNeeds?: boolean } = {}): WidgetNode {
  const maxEntities = Math.max(0, options.maxEntities ?? 6);
  const entities = world.entities.slice(0, maxEntities);
  const criticalCount = world.entities.filter((e) => e.health < 25).length;

  const header = widget('row', {
    id: 'hud_header',
    children: [
      widget('label', { id: 'hud_title', label: world.civilizationName, style: { bold: true, fontSize: 16, flex: 2 } }),
      widget('stat', { id: 'hud_year', label: 'năm', valueText: `${world.year}` }),
      widget('stat', { id: 'hud_pop', label: 'dân số', valueText: `${world.population}` }),
      widget('stat', {
        id: 'hud_mood',
        label: 'tâm lòng',
        valueText: world.mood >= 0 ? `+${world.mood.toFixed(2)}` : world.mood.toFixed(2),
        variant: world.mood >= 0 ? 'success' : 'danger',
      }),
    ],
  });

  const worldVitals = widget('row', {
    id: 'hud_vitals',
    children: [
      bar('hạnh phúc chung', world.averageHappiness, 'hud_happiness'),
      bar('sức khoẻ chung', world.averageHealth, 'hud_health'),
    ],
    style: { gap: 8 },
  });

  const alerts: WidgetNode[] = [];
  if (criticalCount > 0) {
    alerts.push(
      widget('badge', {
        id: 'hud_alert_critical',
        label: `⚠ ${criticalCount} thực thể nguy kịch`,
        variant: 'danger',
      }),
    );
  }

  const entityPanels = entities.map((entity) => generateEntityPanel(entity, { withNeeds: options.withNeeds }));

  const children: WidgetNode[] = [header, worldVitals, ...alerts];
  if (entities.length > 0) {
    children.push(
      widget('grid', {
        id: 'hud_entities',
        label: 'Thực thể',
        children: entityPanels,
        style: { gap: 6 },
      }),
    );
  }
  if (world.events.length > 0) children.push(generateEventFeed(world.events));

  return widget('column', { id: 'hud_root', children, style: { padding: 10, gap: 8 } });
}
