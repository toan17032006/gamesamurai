/**
 * @file insect-subsystem.ts
 * @module @aetheria/engine/animal/subsystems/insect-subsystem
 * @description Insect exoskeleton, tripod gait, flight dynamics, and pheromone communication (501–580).
 */

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

export class InsectSubsystem {
  public wingsSpread = false;
  public isFlying = false;
  public wingbeatFrequency = 180; // Hz
  public adheredToSurface = false;

  // 501–520. Côn trùng: cấu trúc và bộ xương ngoài
  public initializeInsectExoskeleton(): void { recordSubsystemAction(this, 'initializeInsectExoskeleton', 'InsectSubsystem'); }
  public updateInsectHead(): void { recordSubsystemAction(this, 'updateInsectHead', 'InsectSubsystem'); }
  public updateInsectThorax(): void { recordSubsystemAction(this, 'updateInsectThorax', 'InsectSubsystem'); }
  public updateInsectAbdomen(): void { recordSubsystemAction(this, 'updateInsectAbdomen', 'InsectSubsystem'); }
  public updateInsectExoskeleton(): void { recordSubsystemAction(this, 'updateInsectExoskeleton', 'InsectSubsystem'); }
  public updateInsectCuticle(): void { recordSubsystemAction(this, 'updateInsectCuticle', 'InsectSubsystem'); }
  public updateInsectSegmentHierarchy(): void { recordSubsystemAction(this, 'updateInsectSegmentHierarchy', 'InsectSubsystem'); }
  public updateInsectJointAngles(): void { recordSubsystemAction(this, 'updateInsectJointAngles', 'InsectSubsystem'); }
  public updateInsectAntennae(): void { recordSubsystemAction(this, 'updateInsectAntennae', 'InsectSubsystem'); }
  public updateInsectCompoundEyes(): void { recordSubsystemAction(this, 'updateInsectCompoundEyes', 'InsectSubsystem'); }
  public updateInsectSimpleEyes(): void { recordSubsystemAction(this, 'updateInsectSimpleEyes', 'InsectSubsystem'); }
  public updateInsectMandibles(): void { recordSubsystemAction(this, 'updateInsectMandibles', 'InsectSubsystem'); }
  public updateInsectMaxillae(): void { recordSubsystemAction(this, 'updateInsectMaxillae', 'InsectSubsystem'); }
  public updateInsectLabium(): void { recordSubsystemAction(this, 'updateInsectLabium', 'InsectSubsystem'); }
  public updateInsectForelegs(): void { recordSubsystemAction(this, 'updateInsectForelegs', 'InsectSubsystem'); }
  public updateInsectMiddleLegs(): void { recordSubsystemAction(this, 'updateInsectMiddleLegs', 'InsectSubsystem'); }
  public updateInsectHindlegs(): void { recordSubsystemAction(this, 'updateInsectHindlegs', 'InsectSubsystem'); }
  public updateInsectClaws(): void { recordSubsystemAction(this, 'updateInsectClaws', 'InsectSubsystem'); }
  public updateInsectWingVeins(): void { recordSubsystemAction(this, 'updateInsectWingVeins', 'InsectSubsystem'); }
  public updateInsectBodyArticulation(): void { recordSubsystemAction(this, 'updateInsectBodyArticulation', 'InsectSubsystem'); }

  // 521–540. Côn trùng: đi bộ và di chuyển bằng chân
  public initializeInsectLocomotion(): void { recordSubsystemAction(this, 'initializeInsectLocomotion', 'InsectSubsystem'); }
  public walkUsingTripodGait(): void { this.coordinateLegPhases(); }
  public walkUsingMetachronalGait(): void { this.coordinateLegPhases(); }
  public moveFrontLeftLeg(): void { recordSubsystemAction(this, 'moveFrontLeftLeg', 'InsectSubsystem'); }
  public moveFrontRightLeg(): void { recordSubsystemAction(this, 'moveFrontRightLeg', 'InsectSubsystem'); }
  public moveMiddleLeftLeg(): void { recordSubsystemAction(this, 'moveMiddleLeftLeg', 'InsectSubsystem'); }
  public moveMiddleRightLeg(): void { recordSubsystemAction(this, 'moveMiddleRightLeg', 'InsectSubsystem'); }
  public moveHindLeftLeg(): void { recordSubsystemAction(this, 'moveHindLeftLeg', 'InsectSubsystem'); }
  public moveHindRightLeg(): void { recordSubsystemAction(this, 'moveHindRightLeg', 'InsectSubsystem'); }
  public liftInsectLeg(): void { recordSubsystemAction(this, 'liftInsectLeg', 'InsectSubsystem'); }
  public plantInsectLeg(): void { recordSubsystemAction(this, 'plantInsectLeg', 'InsectSubsystem'); }
  public coordinateLegPhases(): void { recordSubsystemAction(this, 'coordinateLegPhases', 'InsectSubsystem'); }
  public climbRoughSurface(): void { recordSubsystemAction(this, 'climbRoughSurface', 'InsectSubsystem'); }
  public climbSmoothSurface(): void { this.adhereToVerticalSurface(); }
  public adhereToVerticalSurface(): void { this.adheredToSurface = true; }
  public releaseAdhesion(): void { this.adheredToSurface = false; }
  public crossSmallObstacle(): void { recordSubsystemAction(this, 'crossSmallObstacle', 'InsectSubsystem'); }
  public rightInsectBodyAfterFall(): void { recordSubsystemAction(this, 'rightInsectBodyAfterFall', 'InsectSubsystem'); }
  public groomInsectAntennae(): void { recordSubsystemAction(this, 'groomInsectAntennae', 'InsectSubsystem'); }
  public performInsectIdleMotion(): void { recordSubsystemAction(this, 'performInsectIdleMotion', 'InsectSubsystem'); }

  // 541–560. Côn trùng: cánh và chuyến bay
  public initializeInsectFlight(): void { recordSubsystemAction(this, 'initializeInsectFlight', 'InsectSubsystem'); }
  public spreadInsectWings(): void { this.wingsSpread = true; }
  public foldInsectWings(): void { this.wingsSpread = false; }
  public flapInsectWings(): void { this.calculateWingbeatFrequency(); }
  public calculateWingbeatFrequency(): number { return this.wingbeatFrequency; }
  public calculateWingbeatAmplitude(): number { return 1.2; }
  public synchronizeWingPairs(): void { recordSubsystemAction(this, 'synchronizeWingPairs', 'InsectSubsystem'); }
  public generateInsectLift(): number { return 0.05; }
  public adjustInsectFlightDirection(): void { recordSubsystemAction(this, 'adjustInsectFlightDirection', 'InsectSubsystem'); }
  public accelerateInsectFlight(): void { recordSubsystemAction(this, 'accelerateInsectFlight', 'InsectSubsystem'); }
  public decelerateInsectFlight(): void { recordSubsystemAction(this, 'decelerateInsectFlight', 'InsectSubsystem'); }
  public hoverLikeInsect(): void { recordSubsystemAction(this, 'hoverLikeInsect', 'InsectSubsystem'); }
  public performInsectTakeoff(): void { this.isFlying = true; this.spreadInsectWings(); }
  public performInsectLanding(): void { this.isFlying = false; this.foldInsectWings(); }
  public performInsectAerialTurn(): void { recordSubsystemAction(this, 'performInsectAerialTurn', 'InsectSubsystem'); }
  public performInsectDive(): void { recordSubsystemAction(this, 'performInsectDive', 'InsectSubsystem'); }
  public glideLikeInsect(): void { recordSubsystemAction(this, 'glideLikeInsect', 'InsectSubsystem'); }
  public avoidAirborneObstacle(): void { recordSubsystemAction(this, 'avoidAirborneObstacle', 'InsectSubsystem'); }
  public cleanInsectWings(): void { recordSubsystemAction(this, 'cleanInsectWings', 'InsectSubsystem'); }
  public blendInsectFlightModes(): void { recordSubsystemAction(this, 'blendInsectFlightModes', 'InsectSubsystem'); }

  // 561–580. Côn trùng: kiếm ăn và hành vi xã hội
  public detectFoodWithAntennae(): boolean { return true; }
  public inspectFoodWithPalps(): void { recordSubsystemAction(this, 'inspectFoodWithPalps', 'InsectSubsystem'); }
  public feedOnNectar(): void { recordSubsystemAction(this, 'feedOnNectar', 'InsectSubsystem'); }
  public chewPlantMaterial(): void { recordSubsystemAction(this, 'chewPlantMaterial', 'InsectSubsystem'); }
  public bitePlantLeaf(leaf: unknown): void { recordSubsystemAction(this, 'bitePlantLeaf', 'InsectSubsystem'); }
  public probeFoodSource(source: unknown): void { recordSubsystemAction(this, 'probeFoodSource', 'InsectSubsystem'); }
  public followPheromoneTrail(trail: unknown): void { recordSubsystemAction(this, 'followPheromoneTrail', 'InsectSubsystem'); }
  public depositPheromone(type: string): void { recordSubsystemAction(this, 'depositPheromone', 'InsectSubsystem'); }
  public detectColonyPheromone(): boolean { return true; }
  public recruitColonyMembers(target: unknown): void { recordSubsystemAction(this, 'recruitColonyMembers', 'InsectSubsystem'); }
  public carrySmallObject(object: unknown): void { recordSubsystemAction(this, 'carrySmallObject', 'InsectSubsystem'); }
  public transportFoodToNest(food: unknown): void { this.carrySmallObject(food); }
  public digInsectBurrow(): void { recordSubsystemAction(this, 'digInsectBurrow', 'InsectSubsystem'); }
  public constructNestMaterial(material: unknown): void { recordSubsystemAction(this, 'constructNestMaterial', 'InsectSubsystem'); }
  public groomBodySurface(): void { recordSubsystemAction(this, 'groomBodySurface', 'InsectSubsystem'); }
  public groomAntennae(): void { recordSubsystemAction(this, 'groomAntennae', 'InsectSubsystem'); }
  public performMatingDisplay(): void { recordSubsystemAction(this, 'performMatingDisplay', 'InsectSubsystem'); }
  public performThreatDisplay(): void { recordSubsystemAction(this, 'performThreatDisplay', 'InsectSubsystem'); }
  public performSwarmMovement(): void { recordSubsystemAction(this, 'performSwarmMovement', 'InsectSubsystem'); }
  public performInsectIdleBehavior(): void { recordSubsystemAction(this, 'performInsectIdleBehavior', 'InsectSubsystem'); }
}
