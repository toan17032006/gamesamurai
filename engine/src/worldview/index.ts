/**
 * @file index.ts
 * @module @aetheria/engine/worldview
 * @description Hệ render thế giới tự sinh: mọi hình khối tự tính từ trạng thái
 * (tăng trưởng cây, tiến độ xây nhà, hành động agent, thời tiết, sự kiện) —
 * không dùng tệp render có sẵn; xuất SVG vector chính xác theo camera.
 */

export * from './types.js';
export * from './geometry.js';
export * from './entities.js';
export * from './scene.js';
export * from './system-events.js';
export * from './interaction-ledger.js';
export * from './shape-cognition.js';
export * from './render-agents.js';
export * from './agent-expression.js';
