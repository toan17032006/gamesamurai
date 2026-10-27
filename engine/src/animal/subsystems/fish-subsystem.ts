/**
 * @file fish-subsystem.ts
 * @module @aetheria/engine/animal/subsystems/fish-subsystem
 * @description Fish anatomy, fins, swimming locomotion, buoyancy, and aquatic behaviors (341–400).
 */

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

export class FishSubsystem {
  public swimmingSpeed = 0;
  public depth = 5.0; // meters below water surface
  public neutralBuoyancy = true;
  public gillCoversOpen = false;

  // 341–360. Cá: bộ xương, thân và vây
  public initializeFishSkeleton(): void { recordSubsystemAction(this, 'initializeFishSkeleton', 'FishSubsystem'); }
  public updateFishSpine(): void { recordSubsystemAction(this, 'updateFishSpine', 'FishSubsystem'); }
  public updateFishVertebrae(): void { recordSubsystemAction(this, 'updateFishVertebrae', 'FishSubsystem'); }
  public updateFishSkull(): void { recordSubsystemAction(this, 'updateFishSkull', 'FishSubsystem'); }
  public updateFishJaw(): void { recordSubsystemAction(this, 'updateFishJaw', 'FishSubsystem'); }
  public updateFishRibStructure(): void { recordSubsystemAction(this, 'updateFishRibStructure', 'FishSubsystem'); }
  public updateFishTailBase(): void { recordSubsystemAction(this, 'updateFishTailBase', 'FishSubsystem'); }
  public updateCaudalFin(): void { recordSubsystemAction(this, 'updateCaudalFin', 'FishSubsystem'); }
  public updateDorsalFin(): void { recordSubsystemAction(this, 'updateDorsalFin', 'FishSubsystem'); }
  public updateAnalFin(): void { recordSubsystemAction(this, 'updateAnalFin', 'FishSubsystem'); }
  public updatePectoralFins(): void { recordSubsystemAction(this, 'updatePectoralFins', 'FishSubsystem'); }
  public updatePelvicFins(): void { recordSubsystemAction(this, 'updatePelvicFins', 'FishSubsystem'); }
  public spreadFinRays(): void { recordSubsystemAction(this, 'spreadFinRays', 'FishSubsystem'); }
  public foldFinRays(): void { recordSubsystemAction(this, 'foldFinRays', 'FishSubsystem'); }
  public undulateFishBody(): void { recordSubsystemAction(this, 'undulateFishBody', 'FishSubsystem'); }
  public bendFishSpine(): void { recordSubsystemAction(this, 'bendFishSpine', 'FishSubsystem'); }
  public twistFishBody(): void { recordSubsystemAction(this, 'twistFishBody', 'FishSubsystem'); }
  public stabilizeFishHead(): void { recordSubsystemAction(this, 'stabilizeFishHead', 'FishSubsystem'); }
  public updateFishScalePattern(): void { recordSubsystemAction(this, 'updateFishScalePattern', 'FishSubsystem'); }
  public blendFishBodyMotion(): void { recordSubsystemAction(this, 'blendFishBodyMotion', 'FishSubsystem'); }

  // 361–380. Cá: bơi, lặn và điều khiển độ nổi
  public initializeFishLocomotion(): void { recordSubsystemAction(this, 'initializeFishLocomotion', 'FishSubsystem'); }
  public swimForward(): void { this.swimmingSpeed = 2.0; }
  public swimBackward(): void { this.swimmingSpeed = -0.5; }
  public swimSlowly(): void { this.swimmingSpeed = 0.8; }
  public swimRapidly(): void { this.swimmingSpeed = 5.0; }
  public accelerateFish(): void { this.swimmingSpeed += 0.5; }
  public decelerateFish(): void { this.swimmingSpeed = Math.max(0, this.swimmingSpeed - 0.5); }
  public turnFishLeft(): void { recordSubsystemAction(this, 'turnFishLeft', 'FishSubsystem'); }
  public turnFishRight(): void { recordSubsystemAction(this, 'turnFishRight', 'FishSubsystem'); }
  public performTightTurn(): void { recordSubsystemAction(this, 'performTightTurn', 'FishSubsystem'); }
  public swimVerticallyUpward(): void { this.depth = Math.max(0, this.depth - 0.5); }
  public swimVerticallyDownward(): void { this.depth += 0.5; }
  public maintainSwimmingDepth(): void { recordSubsystemAction(this, 'maintainSwimmingDepth', 'FishSubsystem'); }
  public maintainNeutralBuoyancy(): void { this.neutralBuoyancy = true; }
  public diveTowardBottom(): void { this.depth += 2.0; }
  public riseTowardSurface(): void { this.depth = Math.max(0, this.depth - 2.0); }
  public hoverInWater(): void { this.swimmingSpeed = 0; }
  public swimAgainstCurrent(): void { recordSubsystemAction(this, 'swimAgainstCurrent', 'FishSubsystem'); }
  public glideWithCurrent(): void { recordSubsystemAction(this, 'glideWithCurrent', 'FishSubsystem'); }
  public avoidAquaticObstacle(): void { recordSubsystemAction(this, 'avoidAquaticObstacle', 'FishSubsystem'); }

  // 381–400. Cá: mang, miệng và hành vi dưới nước
  public initializeFishRespiration(): void { recordSubsystemAction(this, 'initializeFishRespiration', 'FishSubsystem'); }
  public openGillCovers(): void { this.gillCoversOpen = true; }
  public closeGillCovers(): void { this.gillCoversOpen = false; }
  public pumpWaterAcrossGills(): void { this.openGillCovers(); this.closeGillCovers(); }
  public regulateGillMovement(): void { recordSubsystemAction(this, 'regulateGillMovement', 'FishSubsystem'); }
  public openFishMouth(): void { recordSubsystemAction(this, 'openFishMouth', 'FishSubsystem'); }
  public closeFishMouth(): void { recordSubsystemAction(this, 'closeFishMouth', 'FishSubsystem'); }
  public flareFishGills(): void { this.openGillCovers(); }
  public detectWaterMovement(): boolean { return true; }
  public detectWaterPressure(): number { return 101.3 + this.depth * 9.8; }
  public senseWaterTemperature(): number { return 18.0; }
  public detectWaterborneChemicals(): boolean { return true; }
  public schoolWithNearbyFish(): void { recordSubsystemAction(this, 'schoolWithNearbyFish', 'FishSubsystem'); }
  public maintainSchoolSpacing(): void { recordSubsystemAction(this, 'maintainSchoolSpacing', 'FishSubsystem'); }
  public pursueAquaticPrey(prey: unknown): void { this.swimRapidly(); }
  public captureAquaticPrey(prey: unknown): void { this.openFishMouth(); this.closeFishMouth(); }
  public grazeAquaticPlants(plants: unknown): void { recordSubsystemAction(this, 'grazeAquaticPlants', 'FishSubsystem'); }
  public inspectAquaticObject(object: unknown): void { recordSubsystemAction(this, 'inspectAquaticObject', 'FishSubsystem'); }
  public restNearAquaticSubstrate(): void { this.hoverInWater(); }
  public performFishIdleMotion(): void { recordSubsystemAction(this, 'performFishIdleMotion', 'FishSubsystem'); }
}
