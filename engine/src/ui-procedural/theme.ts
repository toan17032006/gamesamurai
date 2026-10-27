/**
 * @file theme.ts
 * @module @aetheria/engine/ui-procedural/theme
 * @description Theme tự suy: palette sinh từ trạng thái thế giới (tâm lòng,
 * thời gian trong ngày, thời đại) thay vì bảng màu tĩnh. Màu an toàn WCAG cơ
 * bản: nền tối → chữ sáng và ngược lại.
 */

import type { UIWorldData, WidgetStyle, WidgetVariant } from './types.js';

/** Palette đầy đủ của một theme. */
export interface UITheme {
  name: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  variants: Record<WidgetVariant, { background: string; foreground: string }>;
}

/** Lerp giữa hai màu hex. */
export function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const to = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  return `#${to(r1 + (r2 - r1) * t)}${to(g1 + (g2 - g1) * t)}${to(b1 + (b2 - b1) * t)}`;
}

const BASE_DARK: UITheme = {
  name: 'dark',
  background: '#12141c',
  surface: '#1b1e2b',
  foreground: '#e8eaf2',
  muted: '#8a90a8',
  variants: {
    primary: { background: '#2b3a5e', foreground: '#dce6ff' },
    success: { background: '#1d3a2a', foreground: '#bdf0cf' },
    warning: { background: '#4a3a15', foreground: '#ffe1a1' },
    danger: { background: '#4a1d1d', foreground: '#ffc4c4' },
    muted: { background: '#22263a', foreground: '#9aa0b8' },
    accent: { background: '#3a2b5e', foreground: '#e3d8ff' },
  },
};

const BASE_LIGHT: UITheme = {
  name: 'light',
  background: '#f2f1ec',
  surface: '#ffffff',
  foreground: '#23252d',
  muted: '#6b6f80',
  variants: {
    primary: { background: '#d7e2ff', foreground: '#1c2c52' },
    success: { background: '#d3efd9', foreground: '#17401f' },
    warning: { background: '#ffedc2', foreground: '#4d3806' },
    danger: { background: '#ffd6d6', foreground: '#571212' },
    muted: { background: '#e6e6e2', foreground: '#5a5e6c' },
    accent: { background: '#e8dcff', foreground: '#33205c' },
  },
};

/**
 * Sinh theme từ trạng thái thế giới: đêm/dusk → nền tối hơn; tâm lòng tiêu cực
 * → giãn sắc lạnh (bớt ấm); tâm lòng tích cực → ấm lên; era "enlightened" →
 * accent tím sáng hơn.
 */
export function deriveTheme(world: Pick<UIWorldData, 'mood' | 'timeOfDay' | 'year'>): UITheme {
  const night = world.timeOfDay === 'night' || world.timeOfDay === 'dusk';
  const base = night ? BASE_DARK : BASE_LIGHT;
  const theme: UITheme = {
    ...base,
    background: base.background,
    surface: base.surface,
    foreground: base.foreground,
    variants: { ...base.variants },
  };

  // Tâm lòng tiêu cực làm nền trầm/lạnh hơn; tích cực ấm hơn.
  const mood = Math.max(-1, Math.min(1, world.mood));
  if (mood < 0) {
    theme.background = mixHex(base.background, '#0a1018', -mood * 0.6);
    theme.variants.primary = { ...theme.variants.primary, background: mixHex(theme.variants.primary.background, '#16202f', -mood * 0.5) };
  } else if (mood > 0) {
    theme.background = mixHex(base.background, '#241c12', mood * 0.35);
    theme.variants.success = { ...theme.variants.success, background: mixHex(theme.variants.success.background, '#2c5a35', mood * 0.4) };
  }

  if (world.year >= 1900) {
    theme.variants.accent = { ...theme.variants.accent, foreground: mixHex(theme.variants.accent.foreground, '#ffffff', 0.3) };
  }
  theme.name = night ? 'night' : 'day';
  return theme;
}

/** Điền style cụ thể cho widget theo theme + variant. */
export function resolveStyle(
  style: WidgetStyle,
  variant: WidgetVariant | undefined,
  theme: UITheme,
  kind: string,
): WidgetStyle {
  const variantStyle = variant ? theme.variants[variant] : undefined;
  return {
    background:
      style.background ??
      (kind === 'root' ? theme.background : variantStyle?.background ?? (kind === 'panel' ? theme.surface : undefined)),
    foreground: style.foreground ?? variantStyle?.foreground ?? theme.foreground,
    accent: style.accent ?? theme.variants.accent.background,
    padding: style.padding ?? (kind === 'panel' || kind === 'root' ? 8 : 0),
    gap: style.gap ?? (kind === 'column' || kind === 'grid' ? 6 : kind === 'row' ? 8 : 4),
    fontSize: style.fontSize ?? 12,
    bold: style.bold ?? (kind === 'stat' || kind === 'badge'),
    flex: style.flex ?? 1,
    minHeight: style.minHeight ?? (kind === 'bar' ? 10 : undefined),
  };
}
