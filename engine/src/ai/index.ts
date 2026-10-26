/**
 * @file index.ts
 * @module @aetheria/engine/ai
 * @description Artificial Intelligence systems: Finite State Machines, Behavior Trees,
 * Steering Behaviors, the isolated per-agent brain runtime, and the 2,400-function
 * NPC memory/learning API.
 *
 * `@aetheria/engine/ai` intentionally re-exports the NPC catalog so AI code has a
 * single import surface for perception, memory, personality, reasoning, skills,
 * combat, social and reinforcement-learning functions.
 */

export * from './fsm.js';
export * from './behavior-tree.js';
export * from './steering.js';
export * from './agent-types.js';
export * from './agent-brain.js';
export * from './agent-system.js';

// 2,400 NPC learning/memory functions + their typed domain contracts.
export * from '../npc/index.js';
