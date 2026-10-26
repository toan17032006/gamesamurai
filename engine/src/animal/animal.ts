/**
 * @file animal.ts
 * @module @aetheria/engine/animal/animal
 * @description Master Animal Class unifying all 11 anatomical, taxon-specific,
 * physiological, and behavioral subsystems with full 800-function coverage.
 */

import { AnimalConfig } from './types.js';
import { AnimalBase } from './subsystems/animal-base.js';
import { SkeletonMusclesSubsystem } from './subsystems/skeleton-muscles.js';
import { HeadSensesSubsystem } from './subsystems/head-senses.js';
import { MammalSubsystem } from './subsystems/mammal-subsystem.js';
import { BirdSubsystem } from './subsystems/bird-subsystem.js';
import { FishSubsystem } from './subsystems/fish-subsystem.js';
import { ReptileSubsystem } from './subsystems/reptile-subsystem.js';
import { AmphibianSubsystem } from './subsystems/amphibian-subsystem.js';
import { InsectSubsystem } from './subsystems/insect-subsystem.js';
import { InvertebrateSubsystem } from './subsystems/invertebrate-subsystem.js';
import { PhysiologyEcologySubsystem } from './subsystems/physiology-ecology.js';
import type { Vec3 } from '../types/index.js';

export class Animal {
  // Subsystems composition
  public base: AnimalBase;
  public skeletonMuscles: SkeletonMusclesSubsystem;
  public headSenses: HeadSensesSubsystem;
  public mammal: MammalSubsystem;
  public bird: BirdSubsystem;
  public fish: FishSubsystem;
  public reptile: ReptileSubsystem;
  public amphibian: AmphibianSubsystem;
  public insect: InsectSubsystem;
  public invertebrate: InvertebrateSubsystem;
  public physiologyEcology: PhysiologyEcologySubsystem;

  constructor(config?: Partial<AnimalConfig>) {
    this.base = new AnimalBase(config);
    this.skeletonMuscles = new SkeletonMusclesSubsystem();
    this.headSenses = new HeadSensesSubsystem();
    this.mammal = new MammalSubsystem();
    this.bird = new BirdSubsystem();
    this.fish = new FishSubsystem();
    this.reptile = new ReptileSubsystem();
    this.amphibian = new AmphibianSubsystem();
    this.insect = new InsectSubsystem();
    this.invertebrate = new InvertebrateSubsystem();
    this.physiologyEcology = new PhysiologyEcologySubsystem();
  }

  // 001–020. Khởi tạo và quản lý động vật
  public createAnimal(): Animal { this.base.createAnimal(); return this; }
  public initializeAnimal(): boolean { return this.base.initializeAnimal(); }
  public destroyAnimal(): void { this.base.destroyAnimal(); }
  public resetAnimal(): void { this.base.resetAnimal(); }
  public respawnAnimal(): void { this.base.respawnAnimal(); }
  public updateAnimal(dt: number): void {
    this.base.updateAnimal(dt);
    this.physiologyEcology.updateRespiration(dt);
    this.physiologyEcology.updateAnimalBehavior(dt);
    this.physiologyEcology.updateAnimalAnimationMixer(dt);
  }
  public lateUpdateAnimal(dt: number): void { this.base.lateUpdateAnimal(dt); }
  public fixedUpdateAnimal(fdt: number): void { this.base.fixedUpdateAnimal(fdt); }
  public setAnimalConfig(config: any): void { this.base.setAnimalConfig(config); }
  public getAnimalConfig(): any { return this.base.getAnimalConfig(); }
  public getAnimalState(): any { return this.base.getAnimalState(); }
  public setAnimalState(state: any): void { this.base.setAnimalState(state); }
  public saveAnimalState(): string { return this.base.saveAnimalState(); }
  public restoreAnimalState(state: any): boolean { return this.base.restoreAnimalState(state); }
  public enableAnimal(): void { this.base.enableAnimal(); }
  public disableAnimal(): void { this.base.disableAnimal(); }
  public pauseAnimal(): void { this.base.pauseAnimal(); }
  public resumeAnimal(): void { this.base.resumeAnimal(); }
  public validateAnimalState(): boolean { return this.base.validateAnimalState(); }
  public disposeAnimalResources(): void { this.base.disposeAnimalResources(); }

  // 021–040. Phân loại và đặc điểm loài
  public setAnimalSpecies(species: string): void { this.base.setAnimalSpecies(species); }
  public getAnimalSpecies(): string { return this.base.getAnimalSpecies(); }
  public classifyAnimalSpecies(): any { return this.base.classifyAnimalSpecies(); }
  public identifyAnimalFamily(): string { return this.base.identifyAnimalFamily(); }
  public identifyAnimalOrder(): string { return this.base.identifyAnimalOrder(); }
  public identifyAnimalClass(): any { return this.base.identifyAnimalClass(); }
  public identifyAnimalPhylum(): any { return this.base.identifyAnimalPhylum(); }
  public determineAnimalHabitat(): string[] { return this.base.determineAnimalHabitat(); }
  public determineAnimalDiet(): any { return this.base.determineAnimalDiet(); }
  public determineAnimalLocomotion(): any { return this.base.determineAnimalLocomotion(); }
  public determineAnimalBodyPlan(): string { return this.base.determineAnimalBodyPlan(); }
  public determineAnimalSymmetry(): string { return this.base.determineAnimalSymmetry(); }
  public determineAnimalActivityPattern(): any { return this.base.determineAnimalActivityPattern(); }
  public determineAnimalSocialType(): any { return this.base.determineAnimalSocialType(); }
  public determineAnimalReproductionType(): any { return this.base.determineAnimalReproductionType(); }
  public determineAnimalDevelopmentType(): any { return this.base.determineAnimalDevelopmentType(); }
  public loadSpeciesProfile(species: string): any { return this.base.loadSpeciesProfile(species); }
  public applySpeciesDefaults(profile: any): void { this.base.applySpeciesDefaults(profile); }
  public validateSpeciesCompatibility(): boolean { return this.base.validateSpeciesCompatibility(); }
  public updateSpeciesCharacteristics(): void { this.base.updateSpeciesCharacteristics(); }

  // 041–060. Mô hình 3D và ngoại hình động vật
  public loadAnimalModel(): boolean { return this.base.loadAnimalModel(); }
  public createAnimalMesh(): boolean { return this.base.createAnimalMesh(); }
  public createAnimalMaterial(): boolean { return this.base.createAnimalMaterial(); }
  public loadAnimalTextures(): boolean { return this.base.loadAnimalTextures(); }
  public loadAnimalNormalMaps(): boolean { return this.base.loadAnimalNormalMaps(); }
  public loadAnimalRoughnessMaps(): boolean { return this.base.loadAnimalRoughnessMaps(); }
  public updateAnimalAppearance(): void { this.base.updateAnimalAppearance(); }
  public setAnimalBodyColor(color: string): void { this.base.setAnimalBodyColor(color); }
  public setAnimalPattern(pattern: any): void { this.base.setAnimalPattern(pattern); }
  public setAnimalScale(scale: any): void { this.base.setAnimalScale(scale); }
  public setAnimalLength(length: number): void { this.base.setAnimalLength(length); }
  public setAnimalHeight(height: number): void { this.base.setAnimalHeight(height); }
  public setAnimalBodyMass(mass: number): void { this.base.setAnimalBodyMass(mass); }
  public setAnimalBodyShape(shape: string): void { this.base.setAnimalBodyShape(shape); }
  public updateBodyProportions(): void { this.base.updateBodyProportions(); }
  public updateSurfaceDetails(): void { this.base.updateSurfaceDetails(); }
  public updateSpeciesMarkings(): void { this.base.updateSpeciesMarkings(); }
  public updateBodySilhouette(): void { this.base.updateBodySilhouette(); }
  public updateAnimalShading(): void { this.base.updateAnimalShading(); }
  public updateAnimalVisibility(): void { this.base.updateAnimalVisibility(); }

  // 061–080. Bộ xương tổng quát
  public initializeAnimalSkeleton(): void { this.skeletonMuscles.initializeAnimalSkeleton(); }
  public updateAnimalSkeleton(): void { this.skeletonMuscles.updateAnimalSkeleton(); }
  public loadSkeletalRig(): boolean { return this.skeletonMuscles.loadSkeletalRig(); }
  public createSkeletalHierarchy(): boolean { return this.skeletonMuscles.createSkeletalHierarchy(); }
  public updateBoneTransforms(): void { this.skeletonMuscles.updateBoneTransforms(); }
  public updateRootBone(): void { this.skeletonMuscles.updateRootBone(); }
  public updateAxialSkeleton(): void { this.skeletonMuscles.updateAxialSkeleton(); }
  public updateAppendicularSkeleton(): void { this.skeletonMuscles.updateAppendicularSkeleton(); }
  public updateSkullBones(): void { this.skeletonMuscles.updateSkullBones(); }
  public updateVertebralColumn(): void { this.skeletonMuscles.updateVertebralColumn(); }
  public updateRibCage(): void { this.skeletonMuscles.updateRibCage(); }
  public updateSternum(): void { this.skeletonMuscles.updateSternum(); }
  public updatePelvicStructure(): void { this.skeletonMuscles.updatePelvicStructure(); }
  public updateLimbBones(): void { this.skeletonMuscles.updateLimbBones(); }
  public updateJointTransforms(): void { this.skeletonMuscles.updateJointTransforms(); }
  public constrainBoneRotations(): void { this.skeletonMuscles.constrainBoneRotations(); }
  public calculateBoneLengths(): any { return this.skeletonMuscles.calculateBoneLengths(); }
  public calculateJointAngles(): any { return this.skeletonMuscles.calculateJointAngles(); }
  public validateSkeletonHierarchy(): boolean { return this.skeletonMuscles.validateSkeletonHierarchy(); }
  public retargetAnimalSkeleton(): void { this.skeletonMuscles.retargetAnimalSkeleton(); }

  // 081–100. Cơ bắp, gân và mô mềm
  public initializeAnimalMuscles(): void { this.skeletonMuscles.initializeAnimalMuscles(); }
  public updateMuscleActivation(muscleId?: string, level?: number): void { this.skeletonMuscles.updateMuscleActivation(muscleId, level); }
  public calculateMuscleForce(muscleId?: string): number { return this.skeletonMuscles.calculateMuscleForce(muscleId); }
  public calculateMuscleTension(muscleId?: string): number { return this.skeletonMuscles.calculateMuscleTension(muscleId); }
  public updateMuscleDeformation(): void { this.skeletonMuscles.updateMuscleDeformation(); }
  public updateTendonStretch(): void { this.skeletonMuscles.updateTendonStretch(); }
  public updateLigamentConstraints(): void { this.skeletonMuscles.updateLigamentConstraints(); }
  public updateSoftTissueMotion(): void { this.skeletonMuscles.updateSoftTissueMotion(); }
  public updateSkinDeformation(): void { this.skeletonMuscles.updateSkinDeformation(); }
  public updateFatDistribution(): void { this.skeletonMuscles.updateFatDistribution(); }
  public updateBodyCompression(): void { this.skeletonMuscles.updateBodyCompression(); }
  public updateMuscleBulging(): void { this.skeletonMuscles.updateMuscleBulging(); }
  public updateNeckMuscles(): void { this.skeletonMuscles.updateNeckMuscles(); }
  public updateBackMuscles(): void { this.skeletonMuscles.updateBackMuscles(); }
  public updateShoulderMuscles(): void { this.skeletonMuscles.updateShoulderMuscles(); }
  public updateHipMuscles(): void { this.skeletonMuscles.updateHipMuscles(); }
  public updateLimbMuscles(): void { this.skeletonMuscles.updateLimbMuscles(); }
  public updateJawMuscles(): void { this.skeletonMuscles.updateJawMuscles(); }
  public calculateMusculoskeletalLoad(): number { return this.skeletonMuscles.calculateMusculoskeletalLoad(); }
  public resolveMuscleConstraints(): void { this.skeletonMuscles.resolveMuscleConstraints(); }

  // 101–120. Đầu, hộp sọ và cổ
  public updateAnimalHead(): void { this.headSenses.updateAnimalHead(); }
  public rotateHeadLeft(angle?: number): void { this.headSenses.rotateHeadLeft(angle); }
  public rotateHeadRight(angle?: number): void { this.headSenses.rotateHeadRight(angle); }
  public tiltHeadUp(angle?: number): void { this.headSenses.tiltHeadUp(angle); }
  public tiltHeadDown(angle?: number): void { this.headSenses.tiltHeadDown(angle); }
  public tiltHeadSideways(angle?: number): void { this.headSenses.tiltHeadSideways(angle); }
  public extendNeck(amount?: number): void { this.headSenses.extendNeck(amount); }
  public retractNeck(amount?: number): void { this.headSenses.retractNeck(amount); }
  public rotateNeck(angle?: number): void { this.headSenses.rotateNeck(angle); }
  public stabilizeHead(): void { this.headSenses.stabilizeHead(); }
  public trackHeadTarget(target: any): void { this.headSenses.trackHeadTarget(target); }
  public updateSkullOrientation(): void { this.headSenses.updateSkullOrientation(); }
  public updateJawOpening(angle?: number): void { this.headSenses.updateJawOpening(angle); }
  public updateJawClosing(): void { this.headSenses.updateJawClosing(); }
  public updateBiteMechanics(): void { this.headSenses.updateBiteMechanics(); }
  public updateSnoutMovement(): void { this.headSenses.updateSnoutMovement(); }
  public updateMuzzleDeformation(): void { this.headSenses.updateMuzzleDeformation(); }
  public updateBeakMovement(): void { this.headSenses.updateBeakMovement(); }
  public updateHeadInertia(): void { this.headSenses.updateHeadInertia(); }
  public blendHeadAnimations(): void { this.headSenses.blendHeadAnimations(); }

  // 121–140. Mắt, mí mắt và thị giác
  public initializeAnimalVision(): void { this.headSenses.initializeAnimalVision(); }
  public updateAnimalEyes(): void { this.headSenses.updateAnimalEyes(); }
  public lookAtTarget(target: any): void { this.headSenses.lookAtTarget(target); }
  public moveLeftEye(direction: any): void { this.headSenses.moveLeftEye(direction); }
  public moveRightEye(direction: any): void { this.headSenses.moveRightEye(direction); }
  public synchronizeEyeDirection(): void { this.headSenses.synchronizeEyeDirection(); }
  public blinkEyes(): void { this.headSenses.blinkEyes(); }
  public closeEyes(): void { this.headSenses.closeEyes(); }
  public openEyes(): void { this.headSenses.openEyes(); }
  public updateEyelids(): void { this.headSenses.updateEyelids(); }
  public updatePupilSize(size?: number): void { this.headSenses.updatePupilSize(size); }
  public updatePupilDirection(direction?: any): void { this.headSenses.updatePupilDirection(direction); }
  public trackMovingObject(target: any): void { this.headSenses.trackMovingObject(target); }
  public detectVisualStimulus(): boolean { return this.headSenses.detectVisualStimulus(); }
  public calculateVisualField(): number { return this.headSenses.calculateVisualField(); }
  public calculateVisualDistance(): number { return this.headSenses.calculateVisualDistance(); }
  public detectMotionInVision(): boolean { return this.headSenses.detectMotionInVision(); }
  public updateNightVision(enabled?: boolean): void { this.headSenses.updateNightVision(enabled); }
  public updateDepthPerception(): number { return this.headSenses.updateDepthPerception(); }
  public updateVisualAttention(): void { this.headSenses.updateVisualAttention(); }

  // 141–160. Tai, thính giác và định vị âm thanh
  public initializeAnimalHearing(): void { this.headSenses.initializeAnimalHearing(); }
  public updateAnimalEars(): void { this.headSenses.updateAnimalEars(); }
  public rotateLeftEar(angle?: number): void { this.headSenses.rotateLeftEar(angle); }
  public rotateRightEar(angle?: number): void { this.headSenses.rotateRightEar(angle); }
  public raiseEars(): void { this.headSenses.raiseEars(); }
  public flattenEars(): void { this.headSenses.flattenEars(); }
  public twitchEars(): void { this.headSenses.twitchEars(); }
  public detectAuditoryStimulus(): boolean { return this.headSenses.detectAuditoryStimulus(); }
  public calculateSoundDirection(pos: any): any { return this.headSenses.calculateSoundDirection(pos); }
  public calculateSoundDistance(pos: any): number { return this.headSenses.calculateSoundDistance(pos); }
  public localizeSoundSource(pos: any): void { this.headSenses.localizeSoundSource(pos); }
  public filterEnvironmentalNoise(): void { this.headSenses.filterEnvironmentalNoise(); }
  public detectHighFrequencySound(): boolean { return this.headSenses.detectHighFrequencySound(); }
  public detectLowFrequencySound(): boolean { return this.headSenses.detectLowFrequencySound(); }
  public updateAuditoryAttention(): void { this.headSenses.updateAuditoryAttention(); }
  public reactToLoudNoise(): void { this.headSenses.reactToLoudNoise(); }
  public reactToFamiliarSound(): void { this.headSenses.reactToFamiliarSound(); }
  public synchronizeEarMovement(): void { this.headSenses.synchronizeEarMovement(); }
  public updateAuditoryMemory(): void { this.headSenses.updateAuditoryMemory(); }
  public blendEarAnimations(): void { this.headSenses.blendEarAnimations(); }

  // 161–180. Mũi, khứu giác và cảm nhận hóa học
  public initializeAnimalOlfaction(): void { this.headSenses.initializeAnimalOlfaction(); }
  public updateAnimalNose(): void { this.headSenses.updateAnimalNose(); }
  public sniffAir(): void { this.headSenses.sniffAir(); }
  public sniffGround(): void { this.headSenses.sniffGround(); }
  public sniffObject(obj: any): void { this.headSenses.sniffObject(obj); }
  public detectScent(scent: any): boolean { return this.headSenses.detectScent(scent); }
  public analyzeScentComposition(): string { return this.headSenses.analyzeScentComposition(); }
  public trackScentTrail(trail: any): void { this.headSenses.trackScentTrail(trail); }
  public followScentSource(source: any): void { this.headSenses.followScentSource(source); }
  public distinguishFamiliarScent(scent: any): boolean { return this.headSenses.distinguishFamiliarScent(scent); }
  public detectFoodOdor(): boolean { return this.headSenses.detectFoodOdor(); }
  public detectPredatorOdor(): boolean { return this.headSenses.detectPredatorOdor(); }
  public detectMateOdor(): boolean { return this.headSenses.detectMateOdor(); }
  public detectTerritoryScent(): boolean { return this.headSenses.detectTerritoryScent(); }
  public updateNostrilMovement(): void { this.headSenses.updateNostrilMovement(); }
  public updateOlfactoryMemory(): void { this.headSenses.updateOlfactoryMemory(); }
  public detectChemicalStimulus(): boolean { return this.headSenses.detectChemicalStimulus(); }
  public compareScentIntensity(): number { return this.headSenses.compareScentIntensity(); }
  public updateScentInvestigation(): void { this.headSenses.updateScentInvestigation(); }
  public blendSniffingAnimation(): void { this.headSenses.blendSniffingAnimation(); }

  // 181–200. Miệng, lưỡi, răng và thức ăn
  public initializeAnimalMouth(): void { this.headSenses.initializeAnimalMouth(); }
  public openAnimalMouth(): void { this.headSenses.openAnimalMouth(); }
  public closeAnimalMouth(): void { this.headSenses.closeAnimalMouth(); }
  public extendTongue(): void { this.headSenses.extendTongue(); }
  public retractTongue(): void { this.headSenses.retractTongue(); }
  public lickNose(): void { this.headSenses.lickNose(); }
  public lickFur(): void { this.headSenses.lickFur(); }
  public lickPaw(): void { this.headSenses.lickPaw(); }
  public lickWaterSurface(): void { this.headSenses.lickWaterSurface(); }
  public exposeTeeth(): void { this.headSenses.exposeTeeth(); }
  public updateToothDisplay(): void { this.headSenses.updateToothDisplay(); }
  public biteFood(food: any): void { this.headSenses.biteFood(food); }
  public gripFoodWithMouth(food: any): void { this.headSenses.gripFoodWithMouth(food); }
  public chewFood(): void { this.headSenses.chewFood(); }
  public swallowFood(): void { this.headSenses.swallowFood(); }
  public regurgitateFood(): void { this.headSenses.regurgitateFood(); }
  public updateSalivation(): void { this.headSenses.updateSalivation(); }
  public updateJawCycle(): void { this.headSenses.updateJawCycle(); }
  public animateTongueMovement(): void { this.headSenses.animateTongueMovement(); }
  public coordinateEatingMotion(): void { this.headSenses.coordinateEatingMotion(); }

  // 201–220. Động vật có vú: bộ xương và thân thể
  public initializeMammalSkeleton(): void { this.mammal.initializeMammalSkeleton(); }
  public updateMammalSpine(): void { this.mammal.updateMammalSpine(); }
  public updateMammalRibCage(): void { this.mammal.updateMammalRibCage(); }
  public updateMammalPelvis(): void { this.mammal.updateMammalPelvis(); }
  public updateMammalShoulderGirdle(): void { this.mammal.updateMammalShoulderGirdle(); }
  public updateMammalForelimbs(): void { this.mammal.updateMammalForelimbs(); }
  public updateMammalHindlimbs(): void { this.mammal.updateMammalHindlimbs(); }
  public updateMammalNeck(): void { this.mammal.updateMammalNeck(); }
  public updateMammalTail(): void { this.mammal.updateMammalTail(); }
  public updateMammalPaws(): void { this.mammal.updateMammalPaws(); }
  public updateMammalClaws(): void { this.mammal.updateMammalClaws(); }
  public updateMammalDigits(): void { this.mammal.updateMammalDigits(); }
  public updateMammalJointLimits(): void { this.mammal.updateMammalJointLimits(); }
  public updateMammalBodyFlexion(): void { this.mammal.updateMammalBodyFlexion(); }
  public updateMammalSpinalRotation(): void { this.mammal.updateMammalSpinalRotation(); }
  public calculateMammalStride(): number { return this.mammal.calculateMammalStride(); }
  public calculateMammalLimbReach(): number { return this.mammal.calculateMammalLimbReach(); }
  public maintainMammalPosture(): void { this.mammal.maintainMammalPosture(); }
  public updateMammalMuscleRig(): void { this.mammal.updateMammalMuscleRig(); }
  public blendMammalLocomotion(): void { this.mammal.blendMammalLocomotion(); }

  // 221–240. Động vật có vú: đi, chạy và nhảy
  public walkOnFourLegs(): void { this.mammal.walkOnFourLegs(); }
  public walkOnTwoLegs(): void { this.mammal.walkOnTwoLegs(); }
  public trotOnFourLegs(): void { this.mammal.trotOnFourLegs(); }
  public gallopOnFourLegs(): void { this.mammal.gallopOnFourLegs(); }
  public canterOnFourLegs(): void { this.mammal.canterOnFourLegs(); }
  public runOnFourLegs(): void { this.mammal.runOnFourLegs(); }
  public sprintOnFourLegs(): void { this.mammal.sprintOnFourLegs(); }
  public boundForward(): void { this.mammal.boundForward(); }
  public leapForward(): void { this.mammal.leapForward(); }
  public jumpVertically(): void { this.mammal.jumpVertically(); }
  public hopOnHindLegs(): void { this.mammal.hopOnHindLegs(); }
  public shuffleSideways(): void { this.mammal.shuffleSideways(); }
  public backAway(): void { this.mammal.backAway(); }
  public turnWhileWalking(): void { this.mammal.turnWhileWalking(); }
  public turnWhileRunning(): void { this.mammal.turnWhileRunning(); }
  public stopWithMomentum(): void { this.mammal.stopWithMomentum(); }
  public accelerateMammal(): void { this.mammal.accelerateMammal(); }
  public decelerateMammal(): void { this.mammal.decelerateMammal(); }
  public recoverFromJump(): void { this.mammal.recoverFromJump(); }
  public transitionGait(): void { this.mammal.transitionGait(); }

  // 241–260. Động vật có vú: bàn chân và dáng đi
  public plantFrontLeftFoot(): void { this.mammal.plantFrontLeftFoot(); }
  public plantFrontRightFoot(): void { this.mammal.plantFrontRightFoot(); }
  public plantRearLeftFoot(): void { this.mammal.plantRearLeftFoot(); }
  public plantRearRightFoot(): void { this.mammal.plantRearRightFoot(); }
  public liftFrontLeftFoot(): void { this.mammal.liftFrontLeftFoot(); }
  public liftFrontRightFoot(): void { this.mammal.liftFrontRightFoot(); }
  public liftRearLeftFoot(): void { this.mammal.liftRearLeftFoot(); }
  public liftRearRightFoot(): void { this.mammal.liftRearRightFoot(); }
  public rollPawDuringStep(): void { this.mammal.rollPawDuringStep(); }
  public spreadPawDigits(): void { this.mammal.spreadPawDigits(); }
  public curlPawDigits(): void { this.mammal.curlPawDigits(); }
  public extendClaws(): void { this.mammal.extendClaws(); }
  public retractClaws(): void { this.mammal.retractClaws(); }
  public adjustPawGrip(): void { this.mammal.adjustPawGrip(); }
  public adaptPawsToTerrain(): void { this.mammal.adaptPawsToTerrain(); }
  public stabilizePawContact(): void { this.mammal.stabilizePawContact(); }
  public preventPawSliding(): void { this.mammal.preventPawSliding(); }
  public synchronizeDiagonalGait(): void { this.mammal.synchronizeDiagonalGait(); }
  public synchronizeLateralGait(): void { this.mammal.synchronizeLateralGait(); }
  public updatePawPressure(): void { this.mammal.updatePawPressure(); }

  // 261–280. Động vật có vú: hoạt động thường ngày
  public sitLikeMammal(): void { this.mammal.sitLikeMammal(); }
  public standFromSitting(): void { this.mammal.standFromSitting(); }
  public lieDownLikeMammal(): void { this.mammal.lieDownLikeMammal(); }
  public standFromLying(): void { this.mammal.standFromLying(); }
  public rollOnGround(): void { this.mammal.rollOnGround(); }
  public stretchMammalBody(): void { this.mammal.stretchMammalBody(); }
  public shakeWholeBody(): void { this.mammal.shakeWholeBody(); }
  public shakeHeadAndNeck(): void { this.mammal.shakeHeadAndNeck(); }
  public scratchWithHindLeg(): void { this.mammal.scratchWithHindLeg(); }
  public scratchWithForepaw(): void { this.mammal.scratchWithForepaw(); }
  public groomFur(): void { this.mammal.groomFur(); }
  public groomAnotherAnimal(target: any): void { this.mammal.groomAnotherAnimal(target); }
  public cleanFaceWithPaw(): void { this.mammal.cleanFaceWithPaw(); }
  public rubBodyAgainstObject(obj: any): void { this.mammal.rubBodyAgainstObject(obj); }
  public sniffGroundWhileWalking(): void { this.mammal.sniffGroundWhileWalking(); }
  public raiseBodyToInvestigate(): void { this.mammal.raiseBodyToInvestigate(); }
  public lowerBodyToRest(): void { this.mammal.lowerBodyToRest(); }
  public playBow(): void { this.mammal.playBow(); }
  public shakeOffWater(): void { this.mammal.shakeOffWater(); }
  public performMammalIdleMotion(): void { this.mammal.performMammalIdleMotion(); }

  // 281–300. Chim: bộ xương, cánh và lông vũ
  public initializeBirdSkeleton(): void { this.bird.initializeBirdSkeleton(); }
  public updateBirdSpine(): void { this.bird.updateBirdSpine(); }
  public updateBirdNeck(): void { this.bird.updateBirdNeck(); }
  public updateBirdSkull(): void { this.bird.updateBirdSkull(); }
  public updateBirdSternum(): void { this.bird.updateBirdSternum(); }
  public updateBirdKeel(): void { this.bird.updateBirdKeel(); }
  public updateBirdShoulderJoint(): void { this.bird.updateBirdShoulderJoint(); }
  public updateBirdElbowJoint(): void { this.bird.updateBirdElbowJoint(); }
  public updateBirdWristJoint(): void { this.bird.updateBirdWristJoint(); }
  public updateBirdWingBones(): void { this.bird.updateBirdWingBones(); }
  public updateBirdLegBones(): void { this.bird.updateBirdLegBones(); }
  public updateBirdToeBones(): void { this.bird.updateBirdToeBones(); }
  public updateBirdTailBones(): void { this.bird.updateBirdTailBones(); }
  public updatePrimaryFeathers(): void { this.bird.updatePrimaryFeathers(); }
  public updateSecondaryFeathers(): void { this.bird.updateSecondaryFeathers(); }
  public updateTailFeathers(): void { this.bird.updateTailFeathers(); }
  public spreadWingFeathers(): void { this.bird.spreadWingFeathers(); }
  public foldWingFeathers(): void { this.bird.foldWingFeathers(); }
  public ruffleBodyFeathers(): void { this.bird.ruffleBodyFeathers(); }
  public preenIndividualFeathers(): void { this.bird.preenIndividualFeathers(); }

  // 301–320. Chim: vỗ cánh và bay
  public initializeBirdFlight(): void { this.bird.initializeBirdFlight(); }
  public spreadWings(): void { this.bird.spreadWings(); }
  public foldWings(): void { this.bird.foldWings(); }
  public flapWings(): void { this.bird.flapWings(); }
  public performUpstroke(): void { this.bird.performUpstroke(); }
  public performDownstroke(): void { this.bird.performDownstroke(); }
  public adjustWingAmplitude(amp?: number): void { this.bird.adjustWingAmplitude(amp); }
  public adjustWingFrequency(freq?: number): void { this.bird.adjustWingFrequency(freq); }
  public glideForward(): void { this.bird.glideForward(); }
  public soarOnThermals(): void { this.bird.soarOnThermals(); }
  public diveTowardTarget(target: any): void { this.bird.diveTowardTarget(target); }
  public climbDuringFlight(): void { this.bird.climbDuringFlight(); }
  public bankLeftDuringFlight(): void { this.bird.bankLeftDuringFlight(); }
  public bankRightDuringFlight(): void { this.bird.bankRightDuringFlight(); }
  public brakeWithWings(): void { this.bird.brakeWithWings(); }
  public hoverLikeBird(): void { this.bird.hoverLikeBird(); }
  public takeOffFromGround(): void { this.bird.takeOffFromGround(); }
  public takeOffFromWater(): void { this.bird.takeOffFromWater(); }
  public landOnGround(): void { this.bird.landOnGround(); }
  public landOnBranch(branch: any): void { this.bird.landOnBranch(branch); }

  // 321–340. Chim: đậu, đi, kiếm ăn và giao tiếp
  public perchOnBranch(branch: any): void { this.bird.perchOnBranch(branch); }
  public releasePerchGrip(): void { this.bird.releasePerchGrip(); }
  public adjustPerchingBalance(): void { this.bird.adjustPerchingBalance(); }
  public walkLikeBird(): void { this.bird.walkLikeBird(); }
  public hopLikeBird(): void { this.bird.hopLikeBird(); }
  public runLikeBird(): void { this.bird.runLikeBird(); }
  public peckAtGround(): void { this.bird.peckAtGround(); }
  public peckAtFood(food: any): void { this.bird.peckAtFood(food); }
  public probeWithBeak(target: any): void { this.bird.probeWithBeak(target); }
  public scoopFoodWithBeak(food: any): void { this.bird.scoopFoodWithBeak(food); }
  public swallowPrey(prey: any): void { this.bird.swallowPrey(prey); }
  public drinkLikeBird(): void { this.bird.drinkLikeBird(); }
  public preenFeathers(): void { this.bird.preenFeathers(); }
  public cleanBeak(): void { this.bird.cleanBeak(); }
  public scratchHeadWithFoot(): void { this.bird.scratchHeadWithFoot(); }
  public fluffBodyFeathers(): void { this.bird.fluffBodyFeathers(); }
  public performCourtshipDisplay(): void {
    this.bird.performCourtshipDisplay();
    this.physiologyEcology.performCourtshipDisplay();
  }
  public spreadTailDisplay(): void { this.bird.spreadTailDisplay(); }
  public bobHeadLikeBird(): void { this.bird.bobHeadLikeBird(); }
  public coordinateBirdVocalization(): void { this.bird.coordinateBirdVocalization(); }

  // 341–360. Cá: bộ xương, thân và vây
  public initializeFishSkeleton(): void { this.fish.initializeFishSkeleton(); }
  public updateFishSpine(): void { this.fish.updateFishSpine(); }
  public updateFishVertebrae(): void { this.fish.updateFishVertebrae(); }
  public updateFishSkull(): void { this.fish.updateFishSkull(); }
  public updateFishJaw(): void { this.fish.updateFishJaw(); }
  public updateFishRibStructure(): void { this.fish.updateFishRibStructure(); }
  public updateFishTailBase(): void { this.fish.updateFishTailBase(); }
  public updateCaudalFin(): void { this.fish.updateCaudalFin(); }
  public updateDorsalFin(): void { this.fish.updateDorsalFin(); }
  public updateAnalFin(): void { this.fish.updateAnalFin(); }
  public updatePectoralFins(): void { this.fish.updatePectoralFins(); }
  public updatePelvicFins(): void { this.fish.updatePelvicFins(); }
  public spreadFinRays(): void { this.fish.spreadFinRays(); }
  public foldFinRays(): void { this.fish.foldFinRays(); }
  public undulateFishBody(): void { this.fish.undulateFishBody(); }
  public bendFishSpine(): void { this.fish.bendFishSpine(); }
  public twistFishBody(): void { this.fish.twistFishBody(); }
  public stabilizeFishHead(): void { this.fish.stabilizeFishHead(); }
  public updateFishScalePattern(): void { this.fish.updateFishScalePattern(); }
  public blendFishBodyMotion(): void { this.fish.blendFishBodyMotion(); }

  // 361–380. Cá: bơi, lặn và điều khiển độ nổi
  public initializeFishLocomotion(): void { this.fish.initializeFishLocomotion(); }
  public swimForward(): void { this.fish.swimForward(); }
  public swimBackward(): void { this.fish.swimBackward(); }
  public swimSlowly(): void { this.fish.swimSlowly(); }
  public swimRapidly(): void { this.fish.swimRapidly(); }
  public accelerateFish(): void { this.fish.accelerateFish(); }
  public decelerateFish(): void { this.fish.decelerateFish(); }
  public turnFishLeft(): void { this.fish.turnFishLeft(); }
  public turnFishRight(): void { this.fish.turnFishRight(); }
  public performTightTurn(): void { this.fish.performTightTurn(); }
  public swimVerticallyUpward(): void { this.fish.swimVerticallyUpward(); }
  public swimVerticallyDownward(): void { this.fish.swimVerticallyDownward(); }
  public maintainSwimmingDepth(): void { this.fish.maintainSwimmingDepth(); }
  public maintainNeutralBuoyancy(): void { this.fish.maintainNeutralBuoyancy(); }
  public diveTowardBottom(): void { this.fish.diveTowardBottom(); }
  public riseTowardSurface(): void { this.fish.riseTowardSurface(); }
  public hoverInWater(): void { this.fish.hoverInWater(); }
  public swimAgainstCurrent(): void { this.fish.swimAgainstCurrent(); }
  public glideWithCurrent(): void { this.fish.glideWithCurrent(); }
  public avoidAquaticObstacle(): void { this.fish.avoidAquaticObstacle(); }

  // 381–400. Cá: mang, miệng và hành vi dưới nước
  public initializeFishRespiration(): void { this.fish.initializeFishRespiration(); }
  public openGillCovers(): void { this.fish.openGillCovers(); }
  public closeGillCovers(): void { this.fish.closeGillCovers(); }
  public pumpWaterAcrossGills(): void { this.fish.pumpWaterAcrossGills(); }
  public regulateGillMovement(): void { this.fish.regulateGillMovement(); }
  public openFishMouth(): void { this.fish.openFishMouth(); }
  public closeFishMouth(): void { this.fish.closeFishMouth(); }
  public flareFishGills(): void { this.fish.flareFishGills(); }
  public detectWaterMovement(): boolean { return this.fish.detectWaterMovement(); }
  public detectWaterPressure(): number { return this.fish.detectWaterPressure(); }
  public senseWaterTemperature(): number { return this.fish.senseWaterTemperature(); }
  public detectWaterborneChemicals(): boolean { return this.fish.detectWaterborneChemicals(); }
  public schoolWithNearbyFish(): void { this.fish.schoolWithNearbyFish(); }
  public maintainSchoolSpacing(): void { this.fish.maintainSchoolSpacing(); }
  public pursueAquaticPrey(prey: any): void { this.fish.pursueAquaticPrey(prey); }
  public captureAquaticPrey(prey: any): void { this.fish.captureAquaticPrey(prey); }
  public grazeAquaticPlants(plants: any): void { this.fish.grazeAquaticPlants(plants); }
  public inspectAquaticObject(obj: any): void { this.fish.inspectAquaticObject(obj); }
  public restNearAquaticSubstrate(): void { this.fish.restNearAquaticSubstrate(); }
  public performFishIdleMotion(): void { this.fish.performFishIdleMotion(); }

  // 401–420. Bò sát: bộ xương và cấu trúc cơ thể
  public initializeReptileSkeleton(): void { this.reptile.initializeReptileSkeleton(); }
  public updateReptileSpine(): void { this.reptile.updateReptileSpine(); }
  public updateReptileVertebrae(): void { this.reptile.updateReptileVertebrae(); }
  public updateReptileRibCage(): void { this.reptile.updateReptileRibCage(); }
  public updateReptileSkull(): void { this.reptile.updateReptileSkull(); }
  public updateReptileJaw(): void { this.reptile.updateReptileJaw(); }
  public updateReptileShoulderGirdle(): void { this.reptile.updateReptileShoulderGirdle(); }
  public updateReptilePelvis(): void { this.reptile.updateReptilePelvis(); }
  public updateReptileLimbs(): void { this.reptile.updateReptileLimbs(); }
  public updateReptileDigits(): void { this.reptile.updateReptileDigits(); }
  public updateReptileClaws(): void { this.reptile.updateReptileClaws(); }
  public updateReptileTail(): void { this.reptile.updateReptileTail(); }
  public updateReptileScales(): void { this.reptile.updateReptileScales(); }
  public updateReptileScutePattern(): void { this.reptile.updateReptileScutePattern(); }
  public updateReptileBodyFlexion(): void { this.reptile.updateReptileBodyFlexion(); }
  public updateReptileSpinalWave(): void { this.reptile.updateReptileSpinalWave(); }
  public updateReptileJointLimits(): void { this.reptile.updateReptileJointLimits(); }
  public calculateReptileStride(): number { return this.reptile.calculateReptileStride(); }
  public stabilizeReptileBody(): void { this.reptile.stabilizeReptileBody(); }
  public blendReptileLocomotion(): void { this.reptile.blendReptileLocomotion(); }

  // 421–440. Bò sát: bò, leo và di chuyển
  public crawlLikeLizard(): void { this.reptile.crawlLikeLizard(); }
  public walkLikeLizard(): void { this.reptile.walkLikeLizard(); }
  public runLikeLizard(): void { this.reptile.runLikeLizard(); }
  public climbVerticalSurface(): void { this.reptile.climbVerticalSurface(); }
  public gripSurfaceWithDigits(): void { this.reptile.gripSurfaceWithDigits(); }
  public releaseSurfaceGrip(): void { this.reptile.releaseSurfaceGrip(); }
  public flattenBodyAgainstGround(): void { this.reptile.flattenBodyAgainstGround(); }
  public raiseBodyFromGround(): void { this.reptile.raiseBodyFromGround(); }
  public slitherLikeSnake(): void { this.reptile.slitherLikeSnake(); }
  public performLateralUndulation(): void { this.reptile.performLateralUndulation(); }
  public performConcertinaLocomotion(): void { this.reptile.performConcertinaLocomotion(); }
  public performRectilinearLocomotion(): void { this.reptile.performRectilinearLocomotion(); }
  public performSidewinding(): void { this.reptile.performSidewinding(); }
  public anchorSnakeBody(): void { this.reptile.anchorSnakeBody(); }
  public extendSnakeBodyForward(): void { this.reptile.extendSnakeBodyForward(); }
  public contractSnakeBody(): void { this.reptile.contractSnakeBody(); }
  public strikeAtTarget(target: any): void { this.reptile.strikeAtTarget(target); }
  public recoilAfterStrike(): void { this.reptile.recoilAfterStrike(); }
  public coilSnakeBody(): void { this.reptile.coilSnakeBody(); }
  public uncoilSnakeBody(): void { this.reptile.uncoilSnakeBody(); }

  // 441–460. Bò sát: lưỡi, hàm, phơi nắng và hành vi
  public flickReptileTongue(): void { this.reptile.flickReptileTongue(); }
  public retractReptileTongue(): void { this.reptile.retractReptileTongue(); }
  public sampleAirWithTongue(): void { this.reptile.sampleAirWithTongue(); }
  public openReptileJaw(): void { this.reptile.openReptileJaw(); }
  public closeReptileJaw(): void { this.reptile.closeReptileJaw(); }
  public performJawGape(): void { this.reptile.performJawGape(); }
  public captureReptilePrey(prey: any): void { this.reptile.captureReptilePrey(prey); }
  public swallowReptilePrey(prey: any): void { this.reptile.swallowReptilePrey(prey); }
  public regulateBodyTemperature(): void {
    this.reptile.regulateBodyTemperature();
    this.physiologyEcology.regulateBodyTemperature();
  }
  public baskInSunlight(): void { this.reptile.baskInSunlight(); }
  public seekShade(): void { this.reptile.seekShade(); }
  public burrowLikeReptile(): void { this.reptile.burrowLikeReptile(); }
  public hideUnderCover(): void { this.reptile.hideUnderCover(); }
  public shedReptileSkin(): void { this.reptile.shedReptileSkin(); }
  public performDefensiveDisplay(): void { this.reptile.performDefensiveDisplay(); }
  public flattenNeckFrill(): void { this.reptile.flattenNeckFrill(); }
  public expandNeckFrill(): void { this.reptile.expandNeckFrill(); }
  public inflateDefensiveBody(): void { this.reptile.inflateDefensiveBody(); }
  public tailAutotomyResponse(): void { this.reptile.tailAutotomyResponse(); }
  public performReptileIdleMotion(): void { this.reptile.performReptileIdleMotion(); }

  // 461–480. Lưỡng cư: cấu trúc và bộ xương
  public initializeAmphibianSkeleton(): void { this.amphibian.initializeAmphibianSkeleton(); }
  public updateAmphibianSpine(): void { this.amphibian.updateAmphibianSpine(); }
  public updateAmphibianSkull(): void { this.amphibian.updateAmphibianSkull(); }
  public updateAmphibianJaw(): void { this.amphibian.updateAmphibianJaw(); }
  public updateAmphibianShoulders(): void { this.amphibian.updateAmphibianShoulders(); }
  public updateAmphibianPelvis(): void { this.amphibian.updateAmphibianPelvis(); }
  public updateAmphibianForelimbs(): void { this.amphibian.updateAmphibianForelimbs(); }
  public updateAmphibianHindlimbs(): void { this.amphibian.updateAmphibianHindlimbs(); }
  public updateAmphibianDigits(): void { this.amphibian.updateAmphibianDigits(); }
  public updateAmphibianWebbing(): void { this.amphibian.updateAmphibianWebbing(); }
  public updateAmphibianTail(): void { this.amphibian.updateAmphibianTail(); }
  public updateAmphibianSkin(): void { this.amphibian.updateAmphibianSkin(); }
  public updateAmphibianMoisture(): void { this.amphibian.updateAmphibianMoisture(); }
  public updateAmphibianBodyFlexion(): void { this.amphibian.updateAmphibianBodyFlexion(); }
  public calculateAmphibianStride(): number { return this.amphibian.calculateAmphibianStride(); }
  public calculateFrogJumpForce(): number { return this.amphibian.calculateFrogJumpForce(); }
  public calculateFrogLandingPose(): any { return this.amphibian.calculateFrogLandingPose(); }
  public maintainAmphibianBalance(): void { this.amphibian.maintainAmphibianBalance(); }
  public blendAmphibianGait(): void { this.amphibian.blendAmphibianGait(); }
  public updateAmphibianPosture(): void { this.amphibian.updateAmphibianPosture(); }

  // 481–500. Lưỡng cư: nhảy, bò, bơi và bắt mồi
  public crouchBeforeJump(): void { this.amphibian.crouchBeforeJump(); }
  public extendFrogHindlimbs(): void { this.amphibian.extendFrogHindlimbs(); }
  public launchFrogJump(): void { this.amphibian.launchFrogJump(); }
  public tuckLimbsDuringJump(): void { this.amphibian.tuckLimbsDuringJump(); }
  public extendLimbsForLanding(): void { this.amphibian.extendLimbsForLanding(); }
  public absorbFrogLanding(): void { this.amphibian.absorbFrogLanding(); }
  public hopForward(): void { this.amphibian.hopForward(); }
  public hopSideways(): void { this.amphibian.hopSideways(); }
  public crawlLikeSalamander(): void { this.amphibian.crawlLikeSalamander(); }
  public walkLikeSalamander(): void { this.amphibian.walkLikeSalamander(); }
  public swimLikeFrog(): void { this.amphibian.swimLikeFrog(); }
  public paddleWithHindlimbs(): void { this.amphibian.paddleWithHindlimbs(); }
  public undulateSalamanderTail(): void { this.amphibian.undulateSalamanderTail(); }
  public climbWetSurface(): void { this.amphibian.climbWetSurface(); }
  public flickFrogTongue(): void { this.amphibian.flickFrogTongue(); }
  public captureInsectWithTongue(insect: any): void { this.amphibian.captureInsectWithTongue(insect); }
  public swallowSmallPrey(prey: any): void { this.amphibian.swallowSmallPrey(prey); }
  public breatheThroughSkin(): void { this.amphibian.breatheThroughSkin(); }
  public enterWaterFromLand(): void { this.amphibian.enterWaterFromLand(); }
  public performAmphibianIdleMotion(): void { this.amphibian.performAmphibianIdleMotion(); }

  // 501–520. Côn trùng: cấu trúc và bộ xương ngoài
  public initializeInsectExoskeleton(): void { this.insect.initializeInsectExoskeleton(); }
  public updateInsectHead(): void { this.insect.updateInsectHead(); }
  public updateInsectThorax(): void { this.insect.updateInsectThorax(); }
  public updateInsectAbdomen(): void { this.insect.updateInsectAbdomen(); }
  public updateInsectExoskeleton(): void { this.insect.updateInsectExoskeleton(); }
  public updateInsectCuticle(): void { this.insect.updateInsectCuticle(); }
  public updateInsectSegmentHierarchy(): void { this.insect.updateInsectSegmentHierarchy(); }
  public updateInsectJointAngles(): void { this.insect.updateInsectJointAngles(); }
  public updateInsectAntennae(): void { this.insect.updateInsectAntennae(); }
  public updateInsectCompoundEyes(): void { this.insect.updateInsectCompoundEyes(); }
  public updateInsectSimpleEyes(): void { this.insect.updateInsectSimpleEyes(); }
  public updateInsectMandibles(): void { this.insect.updateInsectMandibles(); }
  public updateInsectMaxillae(): void { this.insect.updateInsectMaxillae(); }
  public updateInsectLabium(): void { this.insect.updateInsectLabium(); }
  public updateInsectForelegs(): void { this.insect.updateInsectForelegs(); }
  public updateInsectMiddleLegs(): void { this.insect.updateInsectMiddleLegs(); }
  public updateInsectHindlegs(): void { this.insect.updateInsectHindlegs(); }
  public updateInsectClaws(): void { this.insect.updateInsectClaws(); }
  public updateInsectWingVeins(): void { this.insect.updateInsectWingVeins(); }
  public updateInsectBodyArticulation(): void { this.insect.updateInsectBodyArticulation(); }

  // 521–540. Côn trùng: đi bộ và di chuyển bằng chân
  public initializeInsectLocomotion(): void { this.insect.initializeInsectLocomotion(); }
  public walkUsingTripodGait(): void { this.insect.walkUsingTripodGait(); }
  public walkUsingMetachronalGait(): void { this.insect.walkUsingMetachronalGait(); }
  public moveFrontLeftLeg(): void { this.insect.moveFrontLeftLeg(); }
  public moveFrontRightLeg(): void { this.insect.moveFrontRightLeg(); }
  public moveMiddleLeftLeg(): void { this.insect.moveMiddleLeftLeg(); }
  public moveMiddleRightLeg(): void { this.insect.moveMiddleRightLeg(); }
  public moveHindLeftLeg(): void { this.insect.moveHindLeftLeg(); }
  public moveHindRightLeg(): void { this.insect.moveHindRightLeg(); }
  public liftInsectLeg(): void { this.insect.liftInsectLeg(); }
  public plantInsectLeg(): void { this.insect.plantInsectLeg(); }
  public coordinateLegPhases(): void { this.insect.coordinateLegPhases(); }
  public climbRoughSurface(): void { this.insect.climbRoughSurface(); }
  public climbSmoothSurface(): void { this.insect.climbSmoothSurface(); }
  public adhereToVerticalSurface(): void { this.insect.adhereToVerticalSurface(); }
  public releaseAdhesion(): void { this.insect.releaseAdhesion(); }
  public crossSmallObstacle(): void { this.insect.crossSmallObstacle(); }
  public rightInsectBodyAfterFall(): void { this.insect.rightInsectBodyAfterFall(); }
  public groomInsectAntennae(): void { this.insect.groomInsectAntennae(); }
  public performInsectIdleMotion(): void { this.insect.performInsectIdleMotion(); }

  // 541–560. Côn trùng: cánh và chuyến bay
  public initializeInsectFlight(): void { this.insect.initializeInsectFlight(); }
  public spreadInsectWings(): void { this.insect.spreadInsectWings(); }
  public foldInsectWings(): void { this.insect.foldInsectWings(); }
  public flapInsectWings(): void { this.insect.flapInsectWings(); }
  public calculateWingbeatFrequency(): number { return this.insect.calculateWingbeatFrequency(); }
  public calculateWingbeatAmplitude(): number { return this.insect.calculateWingbeatAmplitude(); }
  public synchronizeWingPairs(): void { this.insect.synchronizeWingPairs(); }
  public generateInsectLift(): number { return this.insect.generateInsectLift(); }
  public adjustInsectFlightDirection(): void { this.insect.adjustInsectFlightDirection(); }
  public accelerateInsectFlight(): void { this.insect.accelerateInsectFlight(); }
  public decelerateInsectFlight(): void { this.insect.decelerateInsectFlight(); }
  public hoverLikeInsect(): void { this.insect.hoverLikeInsect(); }
  public performInsectTakeoff(): void { this.insect.performInsectTakeoff(); }
  public performInsectLanding(): void { this.insect.performInsectLanding(); }
  public performInsectAerialTurn(): void { this.insect.performInsectAerialTurn(); }
  public performInsectDive(): void { this.insect.performInsectDive(); }
  public glideLikeInsect(): void { this.insect.glideLikeInsect(); }
  public avoidAirborneObstacle(): void { this.insect.avoidAirborneObstacle(); }
  public cleanInsectWings(): void { this.insect.cleanInsectWings(); }
  public blendInsectFlightModes(): void { this.insect.blendInsectFlightModes(); }

  // 561–580. Côn trùng: kiếm ăn và hành vi xã hội
  public detectFoodWithAntennae(): boolean { return this.insect.detectFoodWithAntennae(); }
  public inspectFoodWithPalps(): void { this.insect.inspectFoodWithPalps(); }
  public feedOnNectar(): void { this.insect.feedOnNectar(); }
  public chewPlantMaterial(): void { this.insect.chewPlantMaterial(); }
  public bitePlantLeaf(leaf: any): void { this.insect.bitePlantLeaf(leaf); }
  public probeFoodSource(source: any): void { this.insect.probeFoodSource(source); }
  public followPheromoneTrail(trail: any): void { this.insect.followPheromoneTrail(trail); }
  public depositPheromone(type: string): void { this.insect.depositPheromone(type); }
  public detectColonyPheromone(): boolean { return this.insect.detectColonyPheromone(); }
  public recruitColonyMembers(target: any): void { this.insect.recruitColonyMembers(target); }
  public carrySmallObject(object: any): void { this.insect.carrySmallObject(object); }
  public transportFoodToNest(food: any): void { this.insect.transportFoodToNest(food); }
  public digInsectBurrow(): void { this.insect.digInsectBurrow(); }
  public constructNestMaterial(material: any): void { this.insect.constructNestMaterial(material); }
  public groomBodySurface(): void { this.insect.groomBodySurface(); }
  public groomAntennae(): void { this.insect.groomAntennae(); }
  public performMatingDisplay(): void { this.insect.performMatingDisplay(); }
  public performThreatDisplay(): void { this.insect.performThreatDisplay(); }
  public performSwarmMovement(): void { this.insect.performSwarmMovement(); }
  public performInsectIdleBehavior(): void { this.insect.performInsectIdleBehavior(); }

  // 581–600. Nhện và động vật chân khớp khác
  public initializeArachnidBody(): void { this.invertebrate.initializeArachnidBody(); }
  public updateArachnidCephalothorax(): void { this.invertebrate.updateArachnidCephalothorax(); }
  public updateArachnidAbdomen(): void { this.invertebrate.updateArachnidAbdomen(); }
  public updateArachnidExoskeleton(): void { this.invertebrate.updateArachnidExoskeleton(); }
  public updateArachnidPedipalps(): void { this.invertebrate.updateArachnidPedipalps(); }
  public updateArachnidChelicerae(): void { this.invertebrate.updateArachnidChelicerae(); }
  public updateArachnidSpinnerets(): void { this.invertebrate.updateArachnidSpinnerets(); }
  public updateArachnidLegJoints(): void { this.invertebrate.updateArachnidLegJoints(); }
  public moveArachnidLegPairOne(): void { this.invertebrate.moveArachnidLegPairOne(); }
  public moveArachnidLegPairTwo(): void { this.invertebrate.moveArachnidLegPairTwo(); }
  public moveArachnidLegPairThree(): void { this.invertebrate.moveArachnidLegPairThree(); }
  public moveArachnidLegPairFour(): void { this.invertebrate.moveArachnidLegPairFour(); }
  public coordinateArachnidGait(): void { this.invertebrate.coordinateArachnidGait(); }
  public climbUsingArachnidLegs(): void { this.invertebrate.climbUsingArachnidLegs(); }
  public detectVibrationThroughLegs(): number { return this.invertebrate.detectVibrationThroughLegs(); }
  public produceSilkThread(): any { return this.invertebrate.produceSilkThread(); }
  public attachSilkAnchor(): void { this.invertebrate.attachSilkAnchor(); }
  public constructSpiderWeb(): void { this.invertebrate.constructSpiderWeb(); }
  public traverseSpiderWeb(): void { this.invertebrate.traverseSpiderWeb(); }
  public performArachnidIdleMotion(): void { this.invertebrate.performArachnidIdleMotion(); }

  // 601–620. Động vật không xương sống dưới nước
  public initializeAquaticInvertebrate(): void { this.invertebrate.initializeAquaticInvertebrate(); }
  public updateCephalopodMantle(): void { this.invertebrate.updateCephalopodMantle(); }
  public contractCephalopodMantle(): void { this.invertebrate.contractCephalopodMantle(); }
  public expelWaterThroughSiphon(): void { this.invertebrate.expelWaterThroughSiphon(); }
  public performJetPropulsion(): void { this.invertebrate.performJetPropulsion(); }
  public extendCephalopodArm(): void { this.invertebrate.extendCephalopodArm(); }
  public retractCephalopodArm(): void { this.invertebrate.retractCephalopodArm(); }
  public curlCephalopodArm(): void { this.invertebrate.curlCephalopodArm(); }
  public activateSuckers(): void { this.invertebrate.activateSuckers(); }
  public releaseSuckers(): void { this.invertebrate.releaseSuckers(); }
  public coordinateTentacleMovement(): void { this.invertebrate.coordinateTentacleMovement(); }
  public changeCephalopodColor(color?: string): void { this.invertebrate.changeCephalopodColor(color); }
  public changeCephalopodPattern(pattern?: string): void { this.invertebrate.changeCephalopodPattern(pattern); }
  public changeCephalopodSkinTexture(texture?: string): void { this.invertebrate.changeCephalopodSkinTexture(texture); }
  public contractJellyfishBell(): void { this.invertebrate.contractJellyfishBell(); }
  public relaxJellyfishBell(): void { this.invertebrate.relaxJellyfishBell(); }
  public pulseJellyfishMovement(): void { this.invertebrate.pulseJellyfishMovement(); }
  public extendCnidarianTentacles(): void { this.invertebrate.extendCnidarianTentacles(); }
  public retractCnidarianTentacles(): void { this.invertebrate.retractCnidarianTentacles(); }
  public performAquaticInvertebrateIdleMotion(): void { this.invertebrate.performAquaticInvertebrateIdleMotion(); }

  // 621–640. Giun, thân mềm và động vật bò sát dạng mềm
  public initializeSoftBodiedAnimal(): void { this.invertebrate.initializeSoftBodiedAnimal(); }
  public segmentSoftBody(): void { this.invertebrate.segmentSoftBody(); }
  public contractLongitudinalMuscles(): void { this.invertebrate.contractLongitudinalMuscles(); }
  public contractCircularMuscles(): void { this.invertebrate.contractCircularMuscles(); }
  public performPeristalticMovement(): void { this.invertebrate.performPeristalticMovement(); }
  public extendAnteriorBody(): void { this.invertebrate.extendAnteriorBody(); }
  public retractAnteriorBody(): void { this.invertebrate.retractAnteriorBody(); }
  public anchorPosteriorBody(): void { this.invertebrate.anchorPosteriorBody(); }
  public releasePosteriorAnchor(): void { this.invertebrate.releasePosteriorAnchor(); }
  public glideUsingMucus(): void { this.invertebrate.glideUsingMucus(); }
  public extendSnailFoot(): void { this.invertebrate.extendSnailFoot(); }
  public contractSnailFoot(): void { this.invertebrate.contractSnailFoot(); }
  public crawlLikeSnail(): void { this.invertebrate.crawlLikeSnail(); }
  public retractSnailTentacles(): void { this.invertebrate.retractSnailTentacles(); }
  public extendSnailTentacles(): void { this.invertebrate.extendSnailTentacles(); }
  public withdrawIntoShell(): void { this.invertebrate.withdrawIntoShell(); }
  public emergeFromShell(): void { this.invertebrate.emergeFromShell(); }
  public adhereToSubstrate(): void { this.invertebrate.adhereToSubstrate(); }
  public detachFromSubstrate(): void { this.invertebrate.detachFromSubstrate(); }
  public performSoftBodiedAnimalIdleMotion(): void { this.invertebrate.performSoftBodiedAnimalIdleMotion(); }

  // 641–660. Hô hấp, tuần hoàn và hoạt động sinh lý
  public initializeAnimalPhysiology(): void { this.physiologyEcology.initializeAnimalPhysiology(); }
  public updateRespiration(deltaTime: number): void { this.physiologyEcology.updateRespiration(deltaTime); }
  public calculateRespiratoryRate(): number { return this.physiologyEcology.calculateRespiratoryRate(); }
  public updateLungExpansion(): void { this.physiologyEcology.updateLungExpansion(); }
  public updateLungContraction(): void { this.physiologyEcology.updateLungContraction(); }
  public updateGillVentilation(): void { this.physiologyEcology.updateGillVentilation(); }
  public updateTrachealVentilation(): void { this.physiologyEcology.updateTrachealVentilation(); }
  public updateHeartRate(): number { return this.physiologyEcology.updateHeartRate(); }
  public updateBloodCirculation(): void { this.physiologyEcology.updateBloodCirculation(); }
  public regulateOxygenDemand(): void { this.physiologyEcology.regulateOxygenDemand(); }
  public regulateCarbonDioxideRemoval(): void { this.physiologyEcology.regulateCarbonDioxideRemoval(); }
  public regulateWaterBalance(): void { this.physiologyEcology.regulateWaterBalance(); }
  public regulateElectrolyteBalance(): void { this.physiologyEcology.regulateElectrolyteBalance(); }
  public regulateEnergyConsumption(): void { this.physiologyEcology.regulateEnergyConsumption(); }
  public calculateMetabolicRate(): number { return this.physiologyEcology.calculateMetabolicRate(); }
  public updateDigestiveActivity(): void { this.physiologyEcology.updateDigestiveActivity(); }
  public updateExcretoryActivity(): void { this.physiologyEcology.updateExcretoryActivity(); }
  public updatePhysiologicalStress(): void { this.physiologyEcology.updatePhysiologicalStress(); }
  public recoverPhysiologicalHomeostasis(): void { this.physiologyEcology.recoverPhysiologicalHomeostasis(); }

  // 661–680. Dinh dưỡng, săn mồi và kiếm ăn
  public initializeAnimalFeeding(): void { this.physiologyEcology.initializeAnimalFeeding(); }
  public detectPotentialFood(): boolean { return this.physiologyEcology.detectPotentialFood(); }
  public classifyFoodSource(): string { return this.physiologyEcology.classifyFoodSource(); }
  public evaluateFoodSafety(): boolean { return this.physiologyEcology.evaluateFoodSafety(); }
  public approachFoodSource(source: any): void { this.physiologyEcology.approachFoodSource(source); }
  public investigateFoodSource(source: any): void { this.physiologyEcology.investigateFoodSource(source); }
  public selectFoodItem(items: any[]): any { return this.physiologyEcology.selectFoodItem(items); }
  public captureFoodItem(item: any): void { this.physiologyEcology.captureFoodItem(item); }
  public manipulateFoodItem(item: any): void { this.physiologyEcology.manipulateFoodItem(item); }
  public ingestFoodItem(item: any): void { this.physiologyEcology.ingestFoodItem(item); }
  public processFoodInMouth(): void { this.physiologyEcology.processFoodInMouth(); }
  public swallowFoodBolus(): void { this.physiologyEcology.swallowFoodBolus(); }
  public trackPreyMovement(prey: any): void { this.physiologyEcology.trackPreyMovement(prey); }
  public stalkPrey(prey: any): void { this.physiologyEcology.stalkPrey(prey); }
  public pursuePrey(prey: any): void { this.physiologyEcology.pursuePrey(prey); }
  public interceptPrey(prey: any): void { this.physiologyEcology.interceptPrey(prey); }
  public executePredatoryStrike(prey: any): void { this.physiologyEcology.executePredatoryStrike(prey); }
  public secureCapturedPrey(prey: any): void { this.physiologyEcology.secureCapturedPrey(prey); }
  public shareFoodWithGroup(group: any): void { this.physiologyEcology.shareFoodWithGroup(group); }
  public updateFeedingMotivation(): void { this.physiologyEcology.updateFeedingMotivation(); }

  // 681–700. Sinh sản, giao phối và chăm sóc con non
  public initializeReproductiveBehavior(): void { this.physiologyEcology.initializeReproductiveBehavior(); }
  public detectReproductiveReadiness(): boolean { return this.physiologyEcology.detectReproductiveReadiness(); }
  public detectPotentialMate(): boolean { return this.physiologyEcology.detectPotentialMate(); }
  public approachPotentialMate(mate: any): void { this.physiologyEcology.approachPotentialMate(mate); }
  public performCourtshipBehavior(): void { this.physiologyEcology.performCourtshipBehavior(); }
  public performCourtshipVocalization(): void { this.physiologyEcology.performCourtshipVocalization(); }
  public evaluateMateCompatibility(mate: any): boolean { return this.physiologyEcology.evaluateMateCompatibility(mate); }
  public initiateMatingSequence(): void { this.physiologyEcology.initiateMatingSequence(); }
  public terminateMatingSequence(): void { this.physiologyEcology.terminateMatingSequence(); }
  public searchForNestingSite(): void { this.physiologyEcology.searchForNestingSite(); }
  public constructNest(): void { this.physiologyEcology.constructNest(); }
  public prepareNestingMaterial(): void { this.physiologyEcology.prepareNestingMaterial(); }
  public layEggs(): void { this.physiologyEcology.layEggs(); }
  public incubateEggs(): void { this.physiologyEcology.incubateEggs(); }
  public guardNest(): void { this.physiologyEcology.guardNest(); }
  public recognizeOffspring(offspring: any): boolean { return this.physiologyEcology.recognizeOffspring(offspring); }
  public retrieveOffspring(offspring: any): void { this.physiologyEcology.retrieveOffspring(offspring); }
  public feedOffspring(offspring: any): void { this.physiologyEcology.feedOffspring(offspring); }
  public protectOffspring(offspring: any): void { this.physiologyEcology.protectOffspring(offspring); }

  // 701–720. Phát triển, sinh trưởng và thay đổi cơ thể
  public initializeAnimalDevelopment(): void { this.physiologyEcology.initializeAnimalDevelopment(); }
  public updateDevelopmentStage(): void { this.physiologyEcology.updateDevelopmentStage(); }
  public transitionToJuvenileStage(): void { this.physiologyEcology.transitionToJuvenileStage(); }
  public transitionToAdultStage(): void { this.physiologyEcology.transitionToAdultStage(); }
  public transitionToSeniorStage(): void { this.physiologyEcology.transitionToSeniorStage(); }
  public calculateGrowthRate(): number { return this.physiologyEcology.calculateGrowthRate(); }
  public updateBodySizeWithAge(): void { this.physiologyEcology.updateBodySizeWithAge(); }
  public updateBodyProportionsWithAge(): void { this.physiologyEcology.updateBodyProportionsWithAge(); }
  public updateSkeletalGrowth(): void { this.physiologyEcology.updateSkeletalGrowth(); }
  public updateMuscleGrowth(): void { this.physiologyEcology.updateMuscleGrowth(); }
  public updateFeatherGrowth(): void { this.physiologyEcology.updateFeatherGrowth(); }
  public updateFurGrowth(): void { this.physiologyEcology.updateFurGrowth(); }
  public updateScaleDevelopment(): void { this.physiologyEcology.updateScaleDevelopment(); }
  public updateHornGrowth(): void { this.physiologyEcology.updateHornGrowth(); }
  public updateAntlerGrowth(): void { this.physiologyEcology.updateAntlerGrowth(); }
  public initiateMolting(): void { this.physiologyEcology.initiateMolting(); }
  public updateMoltingProgress(): void { this.physiologyEcology.updateMoltingProgress(); }
  public shedExoskeleton(): void { this.physiologyEcology.shedExoskeleton(); }
  public recoverAfterMolting(): void { this.physiologyEcology.recoverAfterMolting(); }
  public updateLifeStageAppearance(): void { this.physiologyEcology.updateLifeStageAppearance(); }

  // 721–740. Giác quan nâng cao và cảm nhận môi trường
  public initializeEnvironmentalSensing(): void { this.physiologyEcology.initializeEnvironmentalSensing(); }
  public senseAmbientTemperature(): number { return this.physiologyEcology.senseAmbientTemperature(); }
  public senseHumidity(): number { return this.physiologyEcology.senseHumidity(); }
  public senseWindDirection(): Vec3 { return this.physiologyEcology.senseWindDirection(); }
  public senseWindSpeed(): number { return this.physiologyEcology.senseWindSpeed(); }
  public senseGroundVibration(): number { return this.physiologyEcology.senseGroundVibration(); }
  public senseWaterCurrent(): Vec3 { return this.physiologyEcology.senseWaterCurrent(); }
  public senseWaterPressure(): number { return this.physiologyEcology.senseWaterPressure(); }
  public senseMagneticField(): Vec3 { return this.physiologyEcology.senseMagneticField(); }
  public senseLightIntensity(): number { return this.physiologyEcology.senseLightIntensity(); }
  public sensePolarizedLight(): boolean { return this.physiologyEcology.sensePolarizedLight(); }
  public detectChemicalSignals(): boolean { return this.physiologyEcology.detectChemicalSignals(); }
  public detectPheromones(): boolean { return this.physiologyEcology.detectPheromones(); }
  public detectPredatorPresence(): boolean { return this.physiologyEcology.detectPredatorPresence(); }
  public detectConspecificPresence(): boolean { return this.physiologyEcology.detectConspecificPresence(); }
  public detectHabitatBoundary(): boolean { return this.physiologyEcology.detectHabitatBoundary(); }
  public estimateEnvironmentalRisk(): number { return this.physiologyEcology.estimateEnvironmentalRisk(); }
  public estimateResourceAvailability(): number { return this.physiologyEcology.estimateResourceAvailability(); }
  public updateEnvironmentalMemory(): void { this.physiologyEcology.updateEnvironmentalMemory(); }
  public integrateSensoryInformation(): void { this.physiologyEcology.integrateSensoryInformation(); }

  // 741–760. Hành vi, cảm xúc và ra quyết định
  public initializeAnimalBehavior(): void { this.physiologyEcology.initializeAnimalBehavior(); }
  public updateAnimalBehavior(deltaTime: number): void { this.physiologyEcology.updateAnimalBehavior(deltaTime); }
  public evaluateAnimalNeeds(): void { this.physiologyEcology.evaluateAnimalNeeds(); }
  public calculateHungerLevel(): number { return this.physiologyEcology.calculateHungerLevel(); }
  public calculateThirstLevel(): number { return this.physiologyEcology.calculateThirstLevel(); }
  public calculateFatigueLevel(): number { return this.physiologyEcology.calculateFatigueLevel(); }
  public calculateFearLevel(): number { return this.physiologyEcology.calculateFearLevel(); }
  public calculateCuriosityLevel(): number { return this.physiologyEcology.calculateCuriosityLevel(); }
  public calculateAggressionLevel(): number { return this.physiologyEcology.calculateAggressionLevel(); }
  public calculateSocialMotivation(): number { return this.physiologyEcology.calculateSocialMotivation(); }
  public selectBehaviorState(): string { return this.physiologyEcology.selectBehaviorState(); }
  public chooseNextAction(): string { return this.physiologyEcology.chooseNextAction(); }
  public interruptCurrentBehavior(): void { this.physiologyEcology.interruptCurrentBehavior(); }
  public resumePreviousBehavior(): void { this.physiologyEcology.resumePreviousBehavior(); }
  public evaluateThreatResponse(): string { return this.physiologyEcology.evaluateThreatResponse(); }
  public chooseEscapeDirection(): Vec3 { return this.physiologyEcology.chooseEscapeDirection(); }
  public initiateDefensiveBehavior(): void { this.physiologyEcology.initiateDefensiveBehavior(); }
  public investigateNovelStimulus(): void { this.physiologyEcology.investigateNovelStimulus(); }
  public updateBehavioralMemory(): void { this.physiologyEcology.updateBehavioralMemory(); }
  public transitionBehaviorState(newState?: string): void { this.physiologyEcology.transitionBehaviorState(newState); }

  // 761–780. Bầy đàn, giao tiếp và lãnh thổ
  public initializeSocialBehavior(): void { this.physiologyEcology.initializeSocialBehavior(); }
  public detectNearbyConspecifics(): any[] { return this.physiologyEcology.detectNearbyConspecifics(); }
  public recognizeIndividualAnimal(animal: any): boolean { return this.physiologyEcology.recognizeIndividualAnimal(animal); }
  public maintainGroupSpacing(): void { this.physiologyEcology.maintainGroupSpacing(); }
  public followGroupLeader(leader: any): void { this.physiologyEcology.followGroupLeader(leader); }
  public electGroupLeader(group: any): any { return this.physiologyEcology.electGroupLeader(group); }
  public synchronizeGroupMovement(group: any): void { this.physiologyEcology.synchronizeGroupMovement(group); }
  public joinAnimalGroup(group: any): void { this.physiologyEcology.joinAnimalGroup(group); }
  public leaveAnimalGroup(group: any): void { this.physiologyEcology.leaveAnimalGroup(group); }
  public coordinateGroupForaging(group: any): void { this.physiologyEcology.coordinateGroupForaging(group); }
  public performSocialGreeting(animal: any): void { this.physiologyEcology.performSocialGreeting(animal); }
  public initiateSocialGrooming(animal: any): void { this.physiologyEcology.initiateSocialGrooming(animal); }
  public exchangeVocalSignals(signal: any): void { this.physiologyEcology.exchangeVocalSignals(signal); }
  public performAlarmCall(): void { this.physiologyEcology.performAlarmCall(); }
  public respondToAlarmCall(signal: any): void { this.physiologyEcology.respondToAlarmCall(signal); }
  public establishTerritorialBoundary(area: any): void { this.physiologyEcology.establishTerritorialBoundary(area); }
  public patrolTerritory(area: any): void { this.physiologyEcology.patrolTerritory(area); }
  public markTerritory(location: any): void { this.physiologyEcology.markTerritory(location); }
  public defendTerritory(intruder: any): void { this.physiologyEcology.defendTerritory(intruder); }
  public resolveSocialConflict(animal: any): void { this.physiologyEcology.resolveSocialConflict(animal); }

  // 781–800. Vật lý, animation, AI và tối ưu hóa
  public initializeAnimalPhysics(): void { this.physiologyEcology.initializeAnimalPhysics(); }
  public createAnimalCollider(): any { return this.physiologyEcology.createAnimalCollider(); }
  public applyAnimalGravity(deltaTime: number): void { this.physiologyEcology.applyAnimalGravity(deltaTime); }
  public applyAnimalForce(force: Vec3): void { this.physiologyEcology.applyAnimalForce(force); }
  public resolveAnimalCollision(): void { this.physiologyEcology.resolveAnimalCollision(); }
  public updateAnimalGroundContact(): boolean { return this.physiologyEcology.updateAnimalGroundContact(); }
  public solveAnimalIK(): void { this.physiologyEcology.solveAnimalIK(); }
  public solveAnimalFootIK(): void { this.physiologyEcology.solveAnimalFootIK(); }
  public blendAnimalAnimations(): void { this.physiologyEcology.blendAnimalAnimations(); }
  public crossFadeAnimalAnimation(from: string, to: string, duration?: number): void { this.physiologyEcology.crossFadeAnimalAnimation(from, to, duration); }
  public updateAnimalAnimationMixer(deltaTime: number): void { this.physiologyEcology.updateAnimalAnimationMixer(deltaTime); }
  public updateAnimalRootMotion(): Vec3 { return this.physiologyEcology.updateAnimalRootMotion(); }
  public applyAnimalSecondaryMotion(): void { this.physiologyEcology.applyAnimalSecondaryMotion(); }
  public updateAnimalTailDynamics(): void { this.physiologyEcology.updateAnimalTailDynamics(); }
  public updateAnimalClothDynamics(): void { this.physiologyEcology.updateAnimalClothDynamics(); }
  public updateAnimalLOD(distance?: number): number { return this.physiologyEcology.updateAnimalLOD(distance); }
  public interpolateAnimalPosition(target: Vec3, alpha?: number): void { this.physiologyEcology.interpolateAnimalPosition(target, alpha); }
  public interpolateAnimalRotation(target: any, alpha?: number): void { this.physiologyEcology.interpolateAnimalRotation(target, alpha); }
  public synchronizeAnimalPhysics(): void { this.physiologyEcology.synchronizeAnimalPhysics(); }
  public optimizeAnimalSimulation(): void { this.physiologyEcology.optimizeAnimalSimulation(); }
}
