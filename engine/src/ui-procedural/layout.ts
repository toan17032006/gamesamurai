/**
 * @file layout.ts
 * @module @aetheria/engine/ui-procedural/layout
 * @description Layout engine tự sinh: tính toạ độ tuyệt đối cho widget tree —
 * `column` xếp dọc, `row` xếp ngang theo trọng số flex, phần tử lá chiếm chiều
 * cao tự nhiên (fontSize/minHeight). Tất định, không phụ thuộc DOM.
 */

import type { Bounds, LayoutNode, WidgetNode } from './types.js';

/** Chiều cao tự nhiên của widget lá (đơn vị world-px). */
export function naturalHeight(node: WidgetNode): number {
  switch (node.kind) {
    case 'label':
    case 'badge':
    case 'stat':
      return (node.style.fontSize ?? 12) + 4;
    case 'bar':
      return node.style.minHeight ?? 10;
    case 'graph':
      return 48;
    case 'panel':
    case 'row':
    case 'column':
    case 'grid':
    case 'list':
    case 'feed':
    case 'root': {
      const gap = node.style.gap ?? 6;
      const padding = (node.style.padding ?? 0) * 2;
      const content = node.children.reduce((sum, child) => sum + naturalHeight(child), 0);
      const gaps = Math.max(0, node.children.length - 1) * gap;
      return Math.max(node.style.minHeight ?? 0, content + gaps + padding);
    }
    default:
      return node.style.minHeight ?? 12;
  }
}

/** Tính toạ độ tuyệt đối cho toàn cây. */
export function layoutWidget(node: WidgetNode, bounds: Bounds): LayoutNode {
  const padding = node.style.padding ?? 0;
  const gap = node.style.gap ?? 0;
  const inner: Bounds = {
    x: bounds.x + padding,
    y: bounds.y + padding,
    width: Math.max(0, bounds.width - padding * 2),
    height: Math.max(0, bounds.height - padding * 2),
  };

  const children: LayoutNode[] = [];
  if (node.children.length > 0) {
    if (node.kind === 'row') {
      const totalFlex = node.children.reduce((sum, child) => sum + (child.style.flex ?? 1), 0);
      const usable = Math.max(0, inner.width - gap * (node.children.length - 1));
      let cursorX = inner.x;
      for (const child of node.children) {
        const flex = child.style.flex ?? 1;
        const width = totalFlex > 0 ? (usable * flex) / totalFlex : 0;
        const childBounds: Bounds = { x: cursorX, y: inner.y, width, height: inner.height };
        children.push(layoutWidget(child, childBounds));
        cursorX += width + gap;
      }
    } else {
      // column / grid (1 cột) / panel / root: xếp dọc theo chiều cao tự nhiên.
      let cursorY = inner.y;
      for (const child of node.children) {
        const height = naturalHeight(child);
        const childBounds: Bounds = { x: inner.x, y: cursorY, width: inner.width, height };
        children.push(layoutWidget(child, childBounds));
        cursorY += height + gap;
      }
    }
  }

  return { widget: node, bounds: { ...bounds }, children };
}

/** Đếm tổng số widget trong cây. */
export function countWidgets(node: WidgetNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countWidgets(child), 0);
}
