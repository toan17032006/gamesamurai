/**
 * @file bird-subsystem.ts
 * @module @aetheria/engine/animal/subsystems/bird-subsystem
 * @description Avian skeleton, wings, feathers, flight mechanics, perching and feeding (281–340).
 */

import { recordSubsystemAction } from '../../core/subsystem-activity.js';

export class BirdSubsystem {
  public wingsSpread = false;
  public isFlying = false;
  public isGliding = false;
  public isPerched = false;
  public wingFrequency = 4.0; // Hz
  public wingAmplitude = 1.0;

  // 281–300. Chim: bộ xương, cánh và lông vũ
  public initializeBirdSkeleton(): void { recordSubsystemAction(this, 'initializeBirdSkeleton', 'BirdSubsystem'); }
  public updateBirdSpine(): void { recordSubsystemAction(this, 'updateBirdSpine', 'BirdSubsystem'); }
  public updateBirdNeck(): void { recordSubsystemAction(this, 'updateBirdNeck', 'BirdSubsystem'); }
  public updateBirdSkull(): void { recordSubsystemAction(this, 'updateBirdSkull', 'BirdSubsystem'); }
  public updateBirdSternum(): void { recordSubsystemAction(this, 'updateBirdSternum', 'BirdSubsystem'); }
  public updateBirdKeel(): void { recordSubsystemAction(this, 'updateBirdKeel', 'BirdSubsystem'); }
  public updateBirdShoulderJoint(): void { recordSubsystemAction(this, 'updateBirdShoulderJoint', 'BirdSubsystem'); }
  public updateBirdElbowJoint(): void { recordSubsystemAction(this, 'updateBirdElbowJoint', 'BirdSubsystem'); }
  public updateBirdWristJoint(): void { recordSubsystemAction(this, 'updateBirdWristJoint', 'BirdSubsystem'); }
  public updateBirdWingBones(): void { recordSubsystemAction(this, 'updateBirdWingBones', 'BirdSubsystem'); }
  public updateBirdLegBones(): void { recordSubsystemAction(this, 'updateBirdLegBones', 'BirdSubsystem'); }
  public updateBirdToeBones(): void { recordSubsystemAction(this, 'updateBirdToeBones', 'BirdSubsystem'); }
  public updateBirdTailBones(): void { recordSubsystemAction(this, 'updateBirdTailBones', 'BirdSubsystem'); }
  public updatePrimaryFeathers(): void { recordSubsystemAction(this, 'updatePrimaryFeathers', 'BirdSubsystem'); }
  public updateSecondaryFeathers(): void { recordSubsystemAction(this, 'updateSecondaryFeathers', 'BirdSubsystem'); }
  public updateTailFeathers(): void { recordSubsystemAction(this, 'updateTailFeathers', 'BirdSubsystem'); }
  public spreadWingFeathers(): void { this.wingsSpread = true; }
  public foldWingFeathers(): void { this.wingsSpread = false; }
  public ruffleBodyFeathers(): void { recordSubsystemAction(this, 'ruffleBodyFeathers', 'BirdSubsystem'); }
  public preenIndividualFeathers(): void { recordSubsystemAction(this, 'preenIndividualFeathers', 'BirdSubsystem'); }

  // 301–320. Chim: vỗ cánh và bay
  public initializeBirdFlight(): void { recordSubsystemAction(this, 'initializeBirdFlight', 'BirdSubsystem'); }
  public spreadWings(): void { this.wingsSpread = true; }
  public foldWings(): void { this.wingsSpread = false; }
  public flapWings(): void { this.performDownstroke(); this.performUpstroke(); }
  public performUpstroke(): void { recordSubsystemAction(this, 'performUpstroke', 'BirdSubsystem'); }
  public performDownstroke(): void { recordSubsystemAction(this, 'performDownstroke', 'BirdSubsystem'); }
  public adjustWingAmplitude(amp = 1.0): void { this.wingAmplitude = amp; }
  public adjustWingFrequency(freq = 4.0): void { this.wingFrequency = freq; }
  public glideForward(): void { this.isGliding = true; }
  public soarOnThermals(): void { this.isGliding = true; }
  public diveTowardTarget(target: any): void { recordSubsystemAction(this, 'diveTowardTarget', 'BirdSubsystem'); }
  public climbDuringFlight(): void { recordSubsystemAction(this, 'climbDuringFlight', 'BirdSubsystem'); }
  public bankLeftDuringFlight(): void { recordSubsystemAction(this, 'bankLeftDuringFlight', 'BirdSubsystem'); }
  public bankRightDuringFlight(): void { recordSubsystemAction(this, 'bankRightDuringFlight', 'BirdSubsystem'); }
  public brakeWithWings(): void { recordSubsystemAction(this, 'brakeWithWings', 'BirdSubsystem'); }
  public hoverLikeBird(): void { recordSubsystemAction(this, 'hoverLikeBird', 'BirdSubsystem'); }
  public takeOffFromGround(): void { this.isFlying = true; this.isPerched = false; this.spreadWings(); }
  public takeOffFromWater(): void { this.takeOffFromGround(); }
  public landOnGround(): void { this.isFlying = false; this.foldWings(); }
  public landOnBranch(branch: any): void { this.landOnGround(); this.perchOnBranch(branch); }

  // 321–340. Chim: đậu, đi, kiếm ăn và giao tiếp
  public perchOnBranch(branch: any): void { this.isPerched = true; }
  public releasePerchGrip(): void { this.isPerched = false; }
  public adjustPerchingBalance(): void { recordSubsystemAction(this, 'adjustPerchingBalance', 'BirdSubsystem'); }
  public walkLikeBird(): void { recordSubsystemAction(this, 'walkLikeBird', 'BirdSubsystem'); }
  public hopLikeBird(): void { recordSubsystemAction(this, 'hopLikeBird', 'BirdSubsystem'); }
  public runLikeBird(): void { recordSubsystemAction(this, 'runLikeBird', 'BirdSubsystem'); }
  public peckAtGround(): void { recordSubsystemAction(this, 'peckAtGround', 'BirdSubsystem'); }
  public peckAtFood(food: any): void { recordSubsystemAction(this, 'peckAtFood', 'BirdSubsystem'); }
  public probeWithBeak(target: any): void { recordSubsystemAction(this, 'probeWithBeak', 'BirdSubsystem'); }
  public scoopFoodWithBeak(food: any): void { recordSubsystemAction(this, 'scoopFoodWithBeak', 'BirdSubsystem'); }
  public swallowPrey(prey: any): void { recordSubsystemAction(this, 'swallowPrey', 'BirdSubsystem'); }
  public drinkLikeBird(): void { recordSubsystemAction(this, 'drinkLikeBird', 'BirdSubsystem'); }
  public preenFeathers(): void { recordSubsystemAction(this, 'preenFeathers', 'BirdSubsystem'); }
  public cleanBeak(): void { recordSubsystemAction(this, 'cleanBeak', 'BirdSubsystem'); }
  public scratchHeadWithFoot(): void { recordSubsystemAction(this, 'scratchHeadWithFoot', 'BirdSubsystem'); }
  public fluffBodyFeathers(): void { recordSubsystemAction(this, 'fluffBodyFeathers', 'BirdSubsystem'); }
  public performCourtshipDisplay(): void { recordSubsystemAction(this, 'performCourtshipDisplay', 'BirdSubsystem'); }
  public spreadTailDisplay(): void { recordSubsystemAction(this, 'spreadTailDisplay', 'BirdSubsystem'); }
  public bobHeadLikeBird(): void { recordSubsystemAction(this, 'bobHeadLikeBird', 'BirdSubsystem'); }
  public coordinateBirdVocalization(): void { recordSubsystemAction(this, 'coordinateBirdVocalization', 'BirdSubsystem'); }
}
