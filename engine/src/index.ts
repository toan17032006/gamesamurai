/**
 * @file index.ts
 * @module @aetheria/engine
 * @description Root entry point for @aetheria/engine.
 * Standalone, enterprise-grade 3D game engine and procedural asset ecosystem.
 */

export * from './game-engine.js';

// Subsystems
export * from './types/index.js';
export * from './core/index.js';
export * from './boot/index.js';
export * from './asset-parser/index.js';
export * from './transformer/index.js';
export * from './combiner/index.js';
export * from './physics/index.js';
export * from './effects/index.js';
export * from './renderer/index.js';
export * from './render/index.js';
export * from './network-sync/index.js';
export * from './memory/index.js';
export * from './procedural/index.js';
export * from './environment/index.js';
export * from './input/index.js';
export * from './audio/index.js';
export * from './ai/index.js';
export * from './objects/index.js';
export * from './player/index.js';
export * from './animal/index.js';
export * from './world/index.js';

// Explicit re-exports to resolve ambiguity between player and animal
export {
  calculateCenterOfMass,
  type BoneTransform,
  blinkEyes,
  chewFood,
  chooseNextAction,
  closeEyes,
  lookAtTarget,
  moveLeftEye,
  moveRightEye,
  openEyes,
  rotateHeadLeft,
  rotateHeadRight,
  swallowFood,
  synchronizeEyeDirection,
  updateBoneTransforms,
  updateMuscleDeformation,
  updatePupilDirection,
  updatePupilSize,
  updateRootBone,
  updateSkinDeformation,
  updateSoftTissueMotion,
} from './player/index.js';

// Explicit re-exports to resolve ambiguity with world
export type { WorldObject } from './world/index.js';
export type { WindState } from './types/index.js';

export * as WorldSystem from './world/index.js';

export {
  blinkEyes as animalBlinkEyes,
  chewFood as animalChewFood,
  chooseNextAction as animalChooseNextAction,
  closeEyes as animalCloseEyes,
  lookAtTarget as animalLookAtTarget,
  moveLeftEye as animalMoveLeftEye,
  moveRightEye as animalMoveRightEye,
  openEyes as animalOpenEyes,
  rotateHeadLeft as animalRotateHeadLeft,
  rotateHeadRight as animalRotateHeadRight,
  swallowFood as animalSwallowFood,
  synchronizeEyeDirection as animalSynchronizeEyeDirection,
  updateBoneTransforms as animalUpdateBoneTransforms,
  updateMuscleDeformation as animalUpdateMuscleDeformation,
  updatePupilDirection as animalUpdatePupilDirection,
  updatePupilSize as animalUpdatePupilSize,
  updateRootBone as animalUpdateRootBone,
  updateSkinDeformation as animalUpdateSkinDeformation,
  updateSoftTissueMotion as animalUpdateSoftTissueMotion,
} from './animal/index.js';

export * as AnimalSystem from './animal/index.js';

export * as BehaviorSystem from './behavior/index.js';

export * as SpatialMath from './spatial/index.js';
export type {
  Vec3Like as SpatialVec3Like,
  QuatLike as SpatialQuatLike,
  SpatialHit,
  SweepHitResult,
} from './spatial/index.js';

export * as SpatialUISystem from './spatial-ui/index.js';
export * as SpatialUI from './spatial-ui/index.js';

export * as NPCSystem from './npc/index.js';
export * as NPCAISystem from './npc/index.js';
export * as NPCAI from './npc/index.js';


