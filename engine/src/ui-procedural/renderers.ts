/**
 * @file renderers.ts
 * @module @aetheria/engine/ui-procedural/renderers
 * @description Bộ render cho UI tự sinh: ASCII (debug/test trong terminal) và
 * HTML (inline styles, không cần tệp CSS) — cùng một widget tree, hai đầu ra.
 */

import type { LayoutNode, WidgetNode } from './types.js';
import { resolveStyle, type UITheme } from './theme.js';

// ---------------------------------------------------------------------------
// ASCII
// ---------------------------------------------------------------------------

function barAscii(value: number, width = 12): string {
  const filled = Math.round(Math.max(0, Math.min(1, value)) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function nodeAscii(node: WidgetNode, depth: number, lines: string[]): void {
  const indent = '  '.repeat(depth);
  const style = node.kind === 'label' || node.kind === 'badge' ? '' : '';
  void style;
  switch (node.kind) {
    case 'bar':
      lines.push(`${indent}${(node.label ?? 'bar').padEnd(10)} │${barAscii(node.value ?? 0)}│ ${node.valueText ?? ''}`);
      break;
    case 'stat':
      lines.push(`${indent}${node.label ?? 'stat'}: ${node.valueText ?? node.value ?? '—'}`);
      break;
    case 'badge':
      lines.push(`${indent}[${node.label ?? ''}]`);
      break;
    case 'label':
      if (node.label) lines.push(`${indent}${node.label}`);
      break;
    case 'panel':
    case 'root':
      lines.push(`${indent}┌─ ${node.label ?? node.kind} ─┐`);
      for (const child of node.children) nodeAscii(child, depth + 1, lines);
      lines.push(`${indent}└${'─'.repeat(20)}┘`);
      break;
    case 'row':
      lines.push(`${indent}⟨row⟩`);
      for (const child of node.children) nodeAscii(child, depth + 1, lines);
      break;
    case 'grid':
      lines.push(`${indent}${node.label ? `${node.label}: ` : ''}(lưới)`);
      for (const child of node.children) nodeAscii(child, depth + 1, lines);
      break;
    case 'column':
    case 'list':
    case 'feed':
    default:
      if (node.label) lines.push(`${indent}${node.label}`);
      for (const child of node.children) nodeAscii(child, depth + 1, lines);
      break;
  }
}

/** Render widget tree thành ASCII — dùng cho debug, test và log server. */
export function renderToText(node: WidgetNode): string {
  const lines: string[] = [];
  nodeAscii(node, 0, lines);
  return lines.join('\n');
}

/** Như renderToText nhưng dùng toạ độ layout để thêm thụt lề theo độ sâu thật. */
export function renderLayoutToText(layout: LayoutNode, depth = 0, lines: string[] = []): string {
  const indent = '  '.repeat(depth);
  const b = layout.bounds;
  const header = `${indent}${layout.widget.kind} @(${Math.round(b.x)},${Math.round(b.y)}) ${Math.round(b.width)}×${Math.round(b.height)}`;
  lines.push(layout.widget.label ? `${header} "${layout.widget.label}"` : header);
  for (const child of layout.children) renderLayoutToText(child, depth + 1, lines);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineStyle(resolved: ReturnType<typeof resolveStyle>, extra = ''): string {
  const parts: string[] = [];
  if (resolved.background) parts.push(`background:${resolved.background}`);
  if (resolved.foreground) parts.push(`color:${resolved.foreground}`);
  if (resolved.padding) parts.push(`padding:${resolved.padding}px`);
  parts.push(`font-size:${resolved.fontSize ?? 12}px`);
  if (resolved.bold) parts.push('font-weight:700');
  parts.push('box-sizing:border-box');
  if (extra) parts.push(extra);
  return parts.join(';');
}

function nodeHTML(node: WidgetNode, theme: UITheme, out: string[]): void {
  const resolved = resolveStyle(node.style, node.variant, theme, node.kind);
  switch (node.kind) {
    case 'bar': {
      const value = Math.round((node.value ?? 0) * 100);
      out.push(
        `<div style="${inlineStyle(resolved)};display:flex;flex-direction:column;gap:2px;flex:${node.style.flex ?? 1}">` +
          `<span style="font-size:10px">${esc(node.label ?? '')} ${esc(node.valueText ?? `${value}%`)}</span>` +
          `<div style="background:${theme.muted};border-radius:4px;height:8px">` +
          `<div style="width:${value}%;height:100%;border-radius:4px;background:${resolved.accent}"></div>` +
          `</div></div>`,
      );
      break;
    }
    case 'label':
      out.push(`<div style="${inlineStyle(resolved)}">${esc(node.label ?? '')}</div>`);
      break;
    case 'badge':
      out.push(`<span style="${inlineStyle(resolved)};padding:2px 8px;border-radius:10px;display:inline-block">${esc(node.label ?? '')}</span>`);
      break;
    case 'stat':
      out.push(
        `<div style="${inlineStyle(resolved)};text-align:center;min-width:64px">` +
          `<div style="font-size:16px;font-weight:700">${esc(node.valueText ?? '')}</div>` +
          `<div style="font-size:10px;color:${theme.muted}">${esc(node.label ?? '')}</div></div>`,
      );
      break;
    case 'row':
      out.push(
        `<div style="${inlineStyle(resolved)};display:flex;gap:${resolved.gap ?? 8}px;align-items:center">` +
          `${node.children.map((child) => { const buf: string[] = []; nodeHTML(child, theme, buf); return buf.join(''); }).join('')}</div>`,
      );
      break;
    case 'graph':
      out.push(`<div style="${inlineStyle(resolved)};height:48px;border:1px solid ${theme.muted}" data-value="${node.value ?? 0}"></div>`);
      break;
    case 'column':
    case 'root':
    case 'panel':
    case 'grid':
    case 'list':
    case 'feed':
    default: {
      const isRoot = node.kind === 'root';
      out.push(
        `<div style="${inlineStyle(resolved)};display:flex;flex-direction:column;gap:${resolved.gap ?? 6}px;` +
          `${isRoot ? 'width:100%;min-height:100vh;' : ''}border-radius:8px">` +
          (node.label ? `<div style="font-weight:700;color:${theme.foreground}">${esc(node.label)}</div>` : '') +
          `${node.children.map((child) => { const buf: string[] = []; nodeHTML(child, theme, buf); return buf.join(''); }).join('')}</div>`,
      );
      break;
    }
  }
}

/** Render widget tree thành chuỗi HTML với inline styles từ theme. */
export function renderToHTML(node: WidgetNode, theme: UITheme): string {
  const out: string[] = [];
  nodeHTML(node, theme, out);
  return out.join('');
}
