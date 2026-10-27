/**
 * @file index.ts
 * @module @aetheria/engine/training
 * @description Hạ tầng dữ liệu + trainer cho agent trong game: folder
 * `assets/training/<category>/` (tree, volcano, npc, monster, clothing, weapon,
 * player…), loader validate schema, và AgentTrainer huấn luyện ngay — học sâu
 * nhận thức hình dạng, học tăng cường render, học điểm ảnh NPC, hạt sáng tạo.
 */

export * from './dataset.js';
export * from './trainer.js';
export * from './object-renderer.js';
export * from './optimization-loop.js';
export * from './scale.js';
export * from './asset-quality.js';
export * from './image-dataset.js';
export * from './agent-mind.js';
export * from './agent-cognition.js';
export * from './vietnamese-language.js';
export * from './vietnamese-generation.js';
export * from './domain-skills.js';
