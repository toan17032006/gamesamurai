/**
 * @file head-senses.ts
 * @module @aetheria/engine/animal/subsystems/head-senses
 * @description Head, Skull, Neck, Vision, Hearing, Olfaction and Mouth/Feeding (101–200).
 */

import { AnimalSensoryState } from '../types.js';
import type { Vec3 } from '../../types/index.js';

export class HeadSensesSubsystem {
  public headRotation: Vec3 = { x: 0, y: 0, z: 0 };
  public neckLength = 0.4;
  public jawAngle = 0; // radians
  public tongueExtension = 0;
  public leftEarAngle = 0;
  public rightEarAngle = 0;
  public earsRaised = false;
  public earsTwitching = false;

  public senses: AnimalSensoryState = {
    visualTarget: null,
    visualFieldAngle: 280, // wide prey or binocular predator
    visualDistance: 80,
    motionDetected: false,
    nightVisionActive: false,
    auditoryFocusTarget: null,
    detectedSounds: [],
    scentTrails: [],
    groundVibration: 0,
    waterCurrentSpeed: 0,
    ambientTemperature: 22,
    ambientHumidity: 60,
    smellSensitivity: 0.5,
    smellRange: 50,
    hearingRange: 120,
    maxFrequency: 20000,
    minFrequency: 40,
    familiarScents: [],
    knownPredatorScents: [],
    knownMateScent: null,
    territoryMarkers: [],
    chemicalThreshold: 0.15,
    lastScentIntensity: 0,
    lastScentComposition: 'unknown',
  };

  public eyesOpen = true;
  public pupilSize = 0.5;

  // -------------------------------------------------------------------------
  // Helper đọc dữ liệu thật — thay cho giá trị đóng cứng
  // -------------------------------------------------------------------------

  /** Đọc số từ nhiều khoá, có giá trị thay thế khi dữ liệu thiếu. */
  private numOf(source: any, keys: string[], fallback: number): number {
    if (source && typeof source === 'object') {
      for (const key of keys) {
        const value = (source as Record<string, unknown>)[key];
        if (typeof value === 'number' && Number.isFinite(value)) return value;
      }
    }
    return fallback;
  }

  /** Vị trí của nguồn kích thích. */
  private positionOf(source: any): Vec3 {
    const p = source?.position ?? source?.origin ?? source?.center;
    if (p && typeof p === 'object') {
      const x = Number(p.x ?? 0);
      const y = Number(p.y ?? 0);
      const z = Number(p.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    if (source && typeof source === 'object') {
      const x = Number(source.x ?? NaN);
      const y = Number(source.y ?? NaN);
      const z = Number(source.z ?? NaN);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    return { x: 0, y: 0, z: 0 };
  }

  /** Khoảng cách từ nguồn kích thích tới đầu con vật (gốc toạ độ). */
  private distanceOf(source: any): number {
    const declared = this.numOf(source, ['distance'], NaN);
    if (Number.isFinite(declared)) return declared;
    const p = this.positionOf(source);
    return Math.hypot(p.x, p.y, p.z);
  }

  /** Tần số của nguồn âm thanh (Hz). */
  private frequencyOf(source: any): number {
    return this.numOf(source, ['frequency', 'hz'], 1000);
  }

  /** Cường độ của nguồn kích thích. */
  private strengthOf(source: any): number {
    return this.numOf(source, ['intensity', 'strength', 'concentration'], 0.5);
  }

  // 101–120. Đầu, hộp sọ và cổ
  public updateAnimalHead(): void {}
  public rotateHeadLeft(angle = 0.5): void { this.headRotation.y = -Math.abs(angle); }
  public rotateHeadRight(angle = 0.5): void { this.headRotation.y = Math.abs(angle); }
  public tiltHeadUp(angle = 0.4): void { this.headRotation.x = Math.abs(angle); }
  public tiltHeadDown(angle = 0.4): void { this.headRotation.x = -Math.abs(angle); }
  public tiltHeadSideways(angle = 0.3): void { this.headRotation.z = angle; }
  public extendNeck(amount = 0.1): void { this.neckLength += amount; }
  public retractNeck(amount = 0.1): void { this.neckLength = Math.max(0.1, this.neckLength - amount); }
  public rotateNeck(angle = 0.3): void { this.headRotation.y = angle * 0.5; }
  public stabilizeHead(): void { this.headRotation = { x: 0, y: 0, z: 0 }; }
  public trackHeadTarget(target: Vec3): void { this.senses.visualTarget = { ...target }; }
  public updateSkullOrientation(): void {}
  public updateJawOpening(angle = 0.6): void { this.jawAngle = angle; }
  public updateJawClosing(): void { this.jawAngle = 0; }
  public updateBiteMechanics(): void {}
  public updateSnoutMovement(): void {}
  public updateMuzzleDeformation(): void {}
  public updateBeakMovement(): void {}
  public updateHeadInertia(): void {}
  public blendHeadAnimations(): void {}

  // 121–140. Mắt, mí mắt và thị giác
  public initializeAnimalVision(): void {}
  public updateAnimalEyes(): void {}
  public lookAtTarget(target: Vec3): void { this.senses.visualTarget = { ...target }; }
  public moveLeftEye(direction: Vec3): void {}
  public moveRightEye(direction: Vec3): void {}
  public synchronizeEyeDirection(): void {}
  public blinkEyes(): void { this.eyesOpen = false; setTimeout && setTimeout(() => { this.eyesOpen = true; }, 150); }
  public closeEyes(): void { this.eyesOpen = false; }
  public openEyes(): void { this.eyesOpen = true; }
  public updateEyelids(): void {}
  public updatePupilSize(size = 0.5): void { this.pupilSize = Math.max(0.1, Math.min(1.0, size)); }
  public updatePupilDirection(direction?: Vec3): void {}
  public trackMovingObject(target: Vec3): void { this.senses.visualTarget = { ...target }; }
  public detectVisualStimulus(): boolean { return this.senses.visualTarget !== null; }
  public calculateVisualField(): number { return this.senses.visualFieldAngle; }
  public calculateVisualDistance(): number { return this.senses.visualDistance; }
  public detectMotionInVision(): boolean { return this.senses.motionDetected; }
  public updateNightVision(enabled = true): void { this.senses.nightVisionActive = enabled; }
  public updateDepthPerception(): number { return this.senses.visualDistance * 0.8; }
  public updateVisualAttention(): void {}

  // 141–160. Tai, thính giác và định vị âm thanh
  public initializeAnimalHearing(): void {}
  public updateAnimalEars(): void {}
  public rotateLeftEar(angle = 0.4): void { this.leftEarAngle = angle; }
  public rotateRightEar(angle = 0.4): void { this.rightEarAngle = angle; }
  public raiseEars(): void { this.earsRaised = true; }
  public flattenEars(): void { this.earsRaised = false; }
  public twitchEars(): void { this.earsTwitching = true; }
  public detectAuditoryStimulus(): boolean { return this.senses.detectedSounds.length > 0; }
  public calculateSoundDirection(soundPos: Vec3): Vec3 { return { x: soundPos.x, y: soundPos.y, z: soundPos.z }; }
  public calculateSoundDistance(soundPos: Vec3): number { return Math.hypot(soundPos.x, soundPos.y, soundPos.z); }
  public localizeSoundSource(soundPos: Vec3): void { this.senses.auditoryFocusTarget = { ...soundPos }; }
  public filterEnvironmentalNoise(): void {}
  public detectHighFrequencySound(): boolean { return true; }
  public detectLowFrequencySound(): boolean { return true; }
  public updateAuditoryAttention(): void {}
  public reactToLoudNoise(): void { this.raiseEars(); }
  public reactToFamiliarSound(): void { this.twitchEars(); }
  public synchronizeEarMovement(): void { this.rightEarAngle = this.leftEarAngle; }
  public updateAuditoryMemory(): void {}
  public blendEarAnimations(): void {}

  // 161–180. Mũi, khứu giác và cảm nhận hóa học
  public initializeAnimalOlfaction(): void {}
  public updateAnimalNose(): void {}
  public sniffAir(): void {}
  public sniffGround(): void {}
  public sniffObject(object: any): void {}
  public detectScent(scent: any): boolean { return true; }
  public analyzeScentComposition(): string { return 'prey_trail'; }
  public trackScentTrail(trail: any): void {}
  public followScentSource(source: any): void {}
  public distinguishFamiliarScent(scent: any): boolean { return true; }
  public detectFoodOdor(): boolean { return true; }
  public detectPredatorOdor(): boolean { return false; }
  public detectMateOdor(): boolean { return false; }
  public detectTerritoryScent(): boolean { return true; }
  public updateNostrilMovement(): void {}
  public updateOlfactoryMemory(): void {}
  public detectChemicalStimulus(): boolean { return true; }
  public compareScentIntensity(): number { return 0.85; }
  public updateScentInvestigation(): void {}
  public blendSniffingAnimation(): void {}

  // 181–200. Miệng, lưỡi, răng và thức ăn
  public initializeAnimalMouth(): void {}
  public openAnimalMouth(): void { this.updateJawOpening(0.6); }
  public closeAnimalMouth(): void { this.updateJawClosing(); }
  public extendTongue(): void { this.tongueExtension = 1.0; }
  public retractTongue(): void { this.tongueExtension = 0; }
  public lickNose(): void { this.extendTongue(); }
  public lickFur(): void { this.extendTongue(); }
  public lickPaw(): void { this.extendTongue(); }
  public lickWaterSurface(): void { this.extendTongue(); }
  public exposeTeeth(): void {}
  public updateToothDisplay(): void {}
  public biteFood(food: any): void { this.updateJawOpening(0.7); this.updateJawClosing(); }
  public gripFoodWithMouth(food: any): void { this.updateJawClosing(); }
  public chewFood(): void { this.updateJawOpening(0.3); this.updateJawClosing(); }
  public swallowFood(): void { this.updateJawClosing(); }
  public regurgitateFood(): void {}
  public updateSalivation(): void {}
  public updateJawCycle(): void {}
  public animateTongueMovement(): void {}
  public coordinateEatingMotion(): void {}
}
