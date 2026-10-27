/**
 * @file mammal-subsystem.ts
 * @module @aetheria/engine/animal/subsystems/mammal-subsystem
 * @description Mammal anatomy, 4-leg locomotion, paw placement, and daily routines (201–280).
 */

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

export class MammalSubsystem {
  public clawsExtended = false;
  public pawsGrounded = { fl: true, fr: true, rl: true, rr: true };
  public posture: 'standing' | 'walking' | 'trotting' | 'galloping' | 'running' | 'sprinting' | 'sitting' | 'lying' = 'standing';
  public strideLength = 1.2;
  public gaitPhase = 0;

  // 201–220. Động vật có vú: bộ xương và thân thể
  public initializeMammalSkeleton(): void { recordSubsystemAction(this, 'initializeMammalSkeleton', 'MammalSubsystem'); }
  public updateMammalSpine(): void { recordSubsystemAction(this, 'updateMammalSpine', 'MammalSubsystem'); }
  public updateMammalRibCage(): void { recordSubsystemAction(this, 'updateMammalRibCage', 'MammalSubsystem'); }
  public updateMammalPelvis(): void { recordSubsystemAction(this, 'updateMammalPelvis', 'MammalSubsystem'); }
  public updateMammalShoulderGirdle(): void { recordSubsystemAction(this, 'updateMammalShoulderGirdle', 'MammalSubsystem'); }
  public updateMammalForelimbs(): void { recordSubsystemAction(this, 'updateMammalForelimbs', 'MammalSubsystem'); }
  public updateMammalHindlimbs(): void { recordSubsystemAction(this, 'updateMammalHindlimbs', 'MammalSubsystem'); }
  public updateMammalNeck(): void { recordSubsystemAction(this, 'updateMammalNeck', 'MammalSubsystem'); }
  public updateMammalTail(): void { recordSubsystemAction(this, 'updateMammalTail', 'MammalSubsystem'); }
  public updateMammalPaws(): void { recordSubsystemAction(this, 'updateMammalPaws', 'MammalSubsystem'); }
  public updateMammalClaws(): void { recordSubsystemAction(this, 'updateMammalClaws', 'MammalSubsystem'); }
  public updateMammalDigits(): void { recordSubsystemAction(this, 'updateMammalDigits', 'MammalSubsystem'); }
  public updateMammalJointLimits(): void { recordSubsystemAction(this, 'updateMammalJointLimits', 'MammalSubsystem'); }
  public updateMammalBodyFlexion(): void { recordSubsystemAction(this, 'updateMammalBodyFlexion', 'MammalSubsystem'); }
  public updateMammalSpinalRotation(): void { recordSubsystemAction(this, 'updateMammalSpinalRotation', 'MammalSubsystem'); }
  public calculateMammalStride(): number { return this.strideLength; }
  public calculateMammalLimbReach(): number { return this.strideLength * 0.6; }
  public maintainMammalPosture(): void { recordSubsystemAction(this, 'maintainMammalPosture', 'MammalSubsystem'); }
  public updateMammalMuscleRig(): void { recordSubsystemAction(this, 'updateMammalMuscleRig', 'MammalSubsystem'); }
  public blendMammalLocomotion(): void { recordSubsystemAction(this, 'blendMammalLocomotion', 'MammalSubsystem'); }

  // 221–240. Động vật có vú: đi, chạy và nhảy
  public walkOnFourLegs(): void { this.posture = 'walking'; }
  public walkOnTwoLegs(): void { this.posture = 'walking'; }
  public trotOnFourLegs(): void { this.posture = 'trotting'; }
  public gallopOnFourLegs(): void { this.posture = 'galloping'; }
  public canterOnFourLegs(): void { this.posture = 'trotting'; }
  public runOnFourLegs(): void { this.posture = 'running'; }
  public sprintOnFourLegs(): void { this.posture = 'sprinting'; }
  public boundForward(): void { recordSubsystemAction(this, 'boundForward', 'MammalSubsystem'); }
  public leapForward(): void { recordSubsystemAction(this, 'leapForward', 'MammalSubsystem'); }
  public jumpVertically(): void { recordSubsystemAction(this, 'jumpVertically', 'MammalSubsystem'); }
  public hopOnHindLegs(): void { recordSubsystemAction(this, 'hopOnHindLegs', 'MammalSubsystem'); }
  public shuffleSideways(): void { recordSubsystemAction(this, 'shuffleSideways', 'MammalSubsystem'); }
  public backAway(): void { recordSubsystemAction(this, 'backAway', 'MammalSubsystem'); }
  public turnWhileWalking(): void { recordSubsystemAction(this, 'turnWhileWalking', 'MammalSubsystem'); }
  public turnWhileRunning(): void { recordSubsystemAction(this, 'turnWhileRunning', 'MammalSubsystem'); }
  public stopWithMomentum(): void { this.posture = 'standing'; }
  public accelerateMammal(): void { recordSubsystemAction(this, 'accelerateMammal', 'MammalSubsystem'); }
  public decelerateMammal(): void { recordSubsystemAction(this, 'decelerateMammal', 'MammalSubsystem'); }
  public recoverFromJump(): void { this.posture = 'standing'; }
  public transitionGait(): void { recordSubsystemAction(this, 'transitionGait', 'MammalSubsystem'); }

  // 241–260. Động vật có vú: bàn chân và dáng đi
  public plantFrontLeftFoot(): void { this.pawsGrounded.fl = true; }
  public plantFrontRightFoot(): void { this.pawsGrounded.fr = true; }
  public plantRearLeftFoot(): void { this.pawsGrounded.rl = true; }
  public plantRearRightFoot(): void { this.pawsGrounded.rr = true; }
  public liftFrontLeftFoot(): void { this.pawsGrounded.fl = false; }
  public liftFrontRightFoot(): void { this.pawsGrounded.fr = false; }
  public liftRearLeftFoot(): void { this.pawsGrounded.rl = false; }
  public liftRearRightFoot(): void { this.pawsGrounded.rr = false; }
  public rollPawDuringStep(): void { recordSubsystemAction(this, 'rollPawDuringStep', 'MammalSubsystem'); }
  public spreadPawDigits(): void { recordSubsystemAction(this, 'spreadPawDigits', 'MammalSubsystem'); }
  public curlPawDigits(): void { recordSubsystemAction(this, 'curlPawDigits', 'MammalSubsystem'); }
  public extendClaws(): void { this.clawsExtended = true; }
  public retractClaws(): void { this.clawsExtended = false; }
  public adjustPawGrip(): void { recordSubsystemAction(this, 'adjustPawGrip', 'MammalSubsystem'); }
  public adaptPawsToTerrain(): void { recordSubsystemAction(this, 'adaptPawsToTerrain', 'MammalSubsystem'); }
  public stabilizePawContact(): void { recordSubsystemAction(this, 'stabilizePawContact', 'MammalSubsystem'); }
  public preventPawSliding(): void { recordSubsystemAction(this, 'preventPawSliding', 'MammalSubsystem'); }
  public synchronizeDiagonalGait(): void { recordSubsystemAction(this, 'synchronizeDiagonalGait', 'MammalSubsystem'); }
  public synchronizeLateralGait(): void { recordSubsystemAction(this, 'synchronizeLateralGait', 'MammalSubsystem'); }
  public updatePawPressure(): void { recordSubsystemAction(this, 'updatePawPressure', 'MammalSubsystem'); }

  // 261–280. Động vật có vú: hoạt động thường ngày
  public sitLikeMammal(): void { this.posture = 'sitting'; }
  public standFromSitting(): void { this.posture = 'standing'; }
  public lieDownLikeMammal(): void { this.posture = 'lying'; }
  public standFromLying(): void { this.posture = 'standing'; }
  public rollOnGround(): void { recordSubsystemAction(this, 'rollOnGround', 'MammalSubsystem'); }
  public stretchMammalBody(): void { recordSubsystemAction(this, 'stretchMammalBody', 'MammalSubsystem'); }
  public shakeWholeBody(): void { recordSubsystemAction(this, 'shakeWholeBody', 'MammalSubsystem'); }
  public shakeHeadAndNeck(): void { recordSubsystemAction(this, 'shakeHeadAndNeck', 'MammalSubsystem'); }
  public scratchWithHindLeg(): void { recordSubsystemAction(this, 'scratchWithHindLeg', 'MammalSubsystem'); }
  public scratchWithForepaw(): void { recordSubsystemAction(this, 'scratchWithForepaw', 'MammalSubsystem'); }
  public groomFur(): void { recordSubsystemAction(this, 'groomFur', 'MammalSubsystem'); }
  public groomAnotherAnimal(target: unknown): void { recordSubsystemAction(this, 'groomAnotherAnimal', 'MammalSubsystem'); }
  public cleanFaceWithPaw(): void { recordSubsystemAction(this, 'cleanFaceWithPaw', 'MammalSubsystem'); }
  public rubBodyAgainstObject(object: unknown): void { recordSubsystemAction(this, 'rubBodyAgainstObject', 'MammalSubsystem'); }
  public sniffGroundWhileWalking(): void { recordSubsystemAction(this, 'sniffGroundWhileWalking', 'MammalSubsystem'); }
  public raiseBodyToInvestigate(): void { recordSubsystemAction(this, 'raiseBodyToInvestigate', 'MammalSubsystem'); }
  public lowerBodyToRest(): void { this.posture = 'lying'; }
  public playBow(): void { recordSubsystemAction(this, 'playBow', 'MammalSubsystem'); }
  public shakeOffWater(): void { recordSubsystemAction(this, 'shakeOffWater', 'MammalSubsystem'); }
  public performMammalIdleMotion(): void { recordSubsystemAction(this, 'performMammalIdleMotion', 'MammalSubsystem'); }
}
