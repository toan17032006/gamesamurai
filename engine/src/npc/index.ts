/**
 * @file index.ts
 * @module @aetheria/engine/npc
 * @description Public API and standalone functional exports for the AI NPC Learning & Memory Engine (2,400 functions).
 */

export * from './types.js';
export * from './primitives.js';
export * from './npc-system.js';

export * from './subsystems/exp-subsystem.js';
export * from './subsystems/stm-subsystem.js';
export * from './subsystems/ltm-subsystem.js';
export * from './subsystems/ret-subsystem.js';
export * from './subsystems/met-subsystem.js';
export * from './subsystems/out-subsystem.js';
export * from './subsystems/rl-subsystem.js';
export * from './subsystems/sup-subsystem.js';
export * from './subsystems/uns-subsystem.js';
export * from './subsystems/onl-subsystem.js';
export * from './subsystems/emo-subsystem.js';
export * from './subsystems/per-subsystem.js';
export * from './subsystems/mot-subsystem.js';
export * from './subsystems/prc-subsystem.js';
export * from './subsystems/rsn-subsystem.js';
export * from './subsystems/pln-subsystem.js';
export * from './subsystems/skl-subsystem.js';
export * from './subsystems/rel-subsystem.js';
export * from './subsystems/soc-subsystem.js';
export * from './subsystems/cbt-subsystem.js';
export * from './subsystems/wrl-subsystem.js';
export * from './subsystems/eva-subsystem.js';
export * from './subsystems/pst-subsystem.js';
export * from './subsystems/gov-subsystem.js';

import { NPCMemoryLearningSystem } from './npc-system.js';

let activeSystem: NPCMemoryLearningSystem | null = null;

/** Gets or creates the global default active NPCMemoryLearningSystem */
export function getActiveNPCSystem(): NPCMemoryLearningSystem {
  if (!activeSystem) {
    activeSystem = new NPCMemoryLearningSystem();
  }
  return activeSystem;
}

/** Sets the global active NPCMemoryLearningSystem */
export function setActiveNPCSystem(system: NPCMemoryLearningSystem): void {
  activeSystem = system;
}

/** Resets the active NPCMemoryLearningSystem */
export function resetNPCSystem(): void {
  if (activeSystem) {
    activeSystem.reset();
  }
  activeSystem = null;
}
