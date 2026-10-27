/**
 * @file index.ts
 * @module @aetheria/engine/learning
 * @description Entry point của learning runtime: gom toàn bộ thuật toán huấn
 * luyện, suy luận, căn chỉnh, tiến hóa, sinh dữ liệu, phân tán và học liên tục.
 *
 * Người dùng game nên import từ `@aetheria/engine/learning` để có bề mặt API ổn
 * định; root package chỉ tái xuất namespace `Learning` để tránh xung đột tên.
 */

export * from './types.js';
export * from './network.js';
export * from './supervised.js';

// Học tăng cường
export * from './reinforcement/dqn.js';
export * from './reinforcement/ppo.js';
export * from './reinforcement/policy-gradient.js';
export * from './reinforcement/continuous.js';
export * from './reinforcement/imitation.js';
export * from './reinforcement/world-model.js';
export * from './reinforcement/marl.js';
export * from './reinforcement/rainbow.js';

// Căn chỉnh, suy luận, tiến hóa, sinh dữ liệu
export * from './alignment.js';
export * from './preference.js';
export * from './evolution.js';
export * from './neat.js';
export * from './hyperneat.js';
export * from './generative.js';
export * from './muzero.js';
export * from './dreamer.js';

// Song song hóa mô hình (tensor/pipeline/ZeRO)
export * from './parallelism.js';

// Hạ tầng runtime
export * from './vision.js';
export * from './distributed.js';
export * from './runtime.js';
