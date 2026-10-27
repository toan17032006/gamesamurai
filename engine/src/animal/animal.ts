/**
 * @file animal.ts
 * @module @aetheria/engine/animal/animal
 * @description Master Animal Class unifying all 11 anatomical, taxon-specific,
 * physiological, and behavioral subsystems with full 800-function coverage.
 */

import type { AnimalConfig, AnimalAppearanceConfig, SpeciesProfile } from './types.js';
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
  public initializeAnimal(
    ...args: Parameters<AnimalBase['initializeAnimal']>
  ): ReturnType<AnimalBase['initializeAnimal']> {
    return this.base.initializeAnimal(...args);
  }
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
  public setAnimalConfig(config: Partial<AnimalConfig>): void { this.base.setAnimalConfig(config); }
  public getAnimalConfig(
    ...args: Parameters<AnimalBase['getAnimalConfig']>
  ): ReturnType<AnimalBase['getAnimalConfig']> {
    return this.base.getAnimalConfig(...args);
  }
  public getAnimalState(
    ...args: Parameters<AnimalBase['getAnimalState']>
  ): ReturnType<AnimalBase['getAnimalState']> {
    return this.base.getAnimalState(...args);
  }
  public setAnimalState(state: Record<string, unknown>): void { this.base.setAnimalState(state); }
  public saveAnimalState(
    ...args: Parameters<AnimalBase['saveAnimalState']>
  ): ReturnType<AnimalBase['saveAnimalState']> {
    return this.base.saveAnimalState(...args);
  }
  public restoreAnimalState(
    ...args: Parameters<AnimalBase['restoreAnimalState']>
  ): ReturnType<AnimalBase['restoreAnimalState']> {
    return this.base.restoreAnimalState(...args);
  }
  public enableAnimal(): void { this.base.enableAnimal(); }
  public disableAnimal(): void { this.base.disableAnimal(); }
  public pauseAnimal(): void { this.base.pauseAnimal(); }
  public resumeAnimal(): void { this.base.resumeAnimal(); }
  public validateAnimalState(
    ...args: Parameters<AnimalBase['validateAnimalState']>
  ): ReturnType<AnimalBase['validateAnimalState']> {
    return this.base.validateAnimalState(...args);
  }
  public disposeAnimalResources(): void { this.base.disposeAnimalResources(); }

  // 021–040. Phân loại và đặc điểm loài
  public setAnimalSpecies(species: string): void { this.base.setAnimalSpecies(species); }
  public getAnimalSpecies(
    ...args: Parameters<AnimalBase['getAnimalSpecies']>
  ): ReturnType<AnimalBase['getAnimalSpecies']> {
    return this.base.getAnimalSpecies(...args);
  }
  public classifyAnimalSpecies(
    ...args: Parameters<AnimalBase['classifyAnimalSpecies']>
  ): ReturnType<AnimalBase['classifyAnimalSpecies']> {
    return this.base.classifyAnimalSpecies(...args);
  }
  public identifyAnimalFamily(
    ...args: Parameters<AnimalBase['identifyAnimalFamily']>
  ): ReturnType<AnimalBase['identifyAnimalFamily']> {
    return this.base.identifyAnimalFamily(...args);
  }
  public identifyAnimalOrder(
    ...args: Parameters<AnimalBase['identifyAnimalOrder']>
  ): ReturnType<AnimalBase['identifyAnimalOrder']> {
    return this.base.identifyAnimalOrder(...args);
  }
  public identifyAnimalClass(
    ...args: Parameters<AnimalBase['identifyAnimalClass']>
  ): ReturnType<AnimalBase['identifyAnimalClass']> {
    return this.base.identifyAnimalClass(...args);
  }
  public identifyAnimalPhylum(
    ...args: Parameters<AnimalBase['identifyAnimalPhylum']>
  ): ReturnType<AnimalBase['identifyAnimalPhylum']> {
    return this.base.identifyAnimalPhylum(...args);
  }
  public determineAnimalHabitat(): string[] { return this.base.determineAnimalHabitat(); }
  public determineAnimalDiet(
    ...args: Parameters<AnimalBase['determineAnimalDiet']>
  ): ReturnType<AnimalBase['determineAnimalDiet']> {
    return this.base.determineAnimalDiet(...args);
  }
  public determineAnimalLocomotion(
    ...args: Parameters<AnimalBase['determineAnimalLocomotion']>
  ): ReturnType<AnimalBase['determineAnimalLocomotion']> {
    return this.base.determineAnimalLocomotion(...args);
  }
  public determineAnimalBodyPlan(
    ...args: Parameters<AnimalBase['determineAnimalBodyPlan']>
  ): ReturnType<AnimalBase['determineAnimalBodyPlan']> {
    return this.base.determineAnimalBodyPlan(...args);
  }
  public determineAnimalSymmetry(
    ...args: Parameters<AnimalBase['determineAnimalSymmetry']>
  ): ReturnType<AnimalBase['determineAnimalSymmetry']> {
    return this.base.determineAnimalSymmetry(...args);
  }
  public determineAnimalActivityPattern(
    ...args: Parameters<AnimalBase['determineAnimalActivityPattern']>
  ): ReturnType<AnimalBase['determineAnimalActivityPattern']> {
    return this.base.determineAnimalActivityPattern(...args);
  }
  public determineAnimalSocialType(
    ...args: Parameters<AnimalBase['determineAnimalSocialType']>
  ): ReturnType<AnimalBase['determineAnimalSocialType']> {
    return this.base.determineAnimalSocialType(...args);
  }
  public determineAnimalReproductionType(
    ...args: Parameters<AnimalBase['determineAnimalReproductionType']>
  ): ReturnType<AnimalBase['determineAnimalReproductionType']> {
    return this.base.determineAnimalReproductionType(...args);
  }
  public determineAnimalDevelopmentType(
    ...args: Parameters<AnimalBase['determineAnimalDevelopmentType']>
  ): ReturnType<AnimalBase['determineAnimalDevelopmentType']> {
    return this.base.determineAnimalDevelopmentType(...args);
  }
  public loadSpeciesProfile(
    ...args: Parameters<AnimalBase['loadSpeciesProfile']>
  ): ReturnType<AnimalBase['loadSpeciesProfile']> {
    return this.base.loadSpeciesProfile(...args);
  }
  public applySpeciesDefaults(profile: Partial<SpeciesProfile>): void { this.base.applySpeciesDefaults(profile); }
  public validateSpeciesCompatibility(
    ...args: Parameters<AnimalBase['validateSpeciesCompatibility']>
  ): ReturnType<AnimalBase['validateSpeciesCompatibility']> {
    return this.base.validateSpeciesCompatibility(...args);
  }
  public updateSpeciesCharacteristics(): void { this.base.updateSpeciesCharacteristics(); }

  // 041–060. Mô hình 3D và ngoại hình động vật
  public loadAnimalModel(
    ...args: Parameters<AnimalBase['loadAnimalModel']>
  ): ReturnType<AnimalBase['loadAnimalModel']> {
    return this.base.loadAnimalModel(...args);
  }
  public createAnimalMesh(
    ...args: Parameters<AnimalBase['createAnimalMesh']>
  ): ReturnType<AnimalBase['createAnimalMesh']> {
    return this.base.createAnimalMesh(...args);
  }
  public createAnimalMaterial(
    ...args: Parameters<AnimalBase['createAnimalMaterial']>
  ): ReturnType<AnimalBase['createAnimalMaterial']> {
    return this.base.createAnimalMaterial(...args);
  }
  public loadAnimalTextures(
    ...args: Parameters<AnimalBase['loadAnimalTextures']>
  ): ReturnType<AnimalBase['loadAnimalTextures']> {
    return this.base.loadAnimalTextures(...args);
  }
  public loadAnimalNormalMaps(
    ...args: Parameters<AnimalBase['loadAnimalNormalMaps']>
  ): ReturnType<AnimalBase['loadAnimalNormalMaps']> {
    return this.base.loadAnimalNormalMaps(...args);
  }
  public loadAnimalRoughnessMaps(
    ...args: Parameters<AnimalBase['loadAnimalRoughnessMaps']>
  ): ReturnType<AnimalBase['loadAnimalRoughnessMaps']> {
    return this.base.loadAnimalRoughnessMaps(...args);
  }
  public updateAnimalAppearance(): void { this.base.updateAnimalAppearance(); }
  public setAnimalBodyColor(color: string): void { this.base.setAnimalBodyColor(color); }
  public setAnimalPattern(pattern: AnimalAppearanceConfig['pattern']): void { this.base.setAnimalPattern(pattern); }
  public setAnimalScale(scale: Vec3 | number): void { this.base.setAnimalScale(scale); }
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
  public loadSkeletalRig(
    ...args: Parameters<SkeletonMusclesSubsystem['loadSkeletalRig']>
  ): ReturnType<SkeletonMusclesSubsystem['loadSkeletalRig']> {
    return this.skeletonMuscles.loadSkeletalRig(...args);
  }
  public createSkeletalHierarchy(
    ...args: Parameters<SkeletonMusclesSubsystem['createSkeletalHierarchy']>
  ): ReturnType<SkeletonMusclesSubsystem['createSkeletalHierarchy']> {
    return this.skeletonMuscles.createSkeletalHierarchy(...args);
  }
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
  public calculateBoneLengths(
    ...args: Parameters<SkeletonMusclesSubsystem['calculateBoneLengths']>
  ): ReturnType<SkeletonMusclesSubsystem['calculateBoneLengths']> {
    return this.skeletonMuscles.calculateBoneLengths(...args);
  }
  public calculateJointAngles(
    ...args: Parameters<SkeletonMusclesSubsystem['calculateJointAngles']>
  ): ReturnType<SkeletonMusclesSubsystem['calculateJointAngles']> {
    return this.skeletonMuscles.calculateJointAngles(...args);
  }
  public validateSkeletonHierarchy(
    ...args: Parameters<SkeletonMusclesSubsystem['validateSkeletonHierarchy']>
  ): ReturnType<SkeletonMusclesSubsystem['validateSkeletonHierarchy']> {
    return this.skeletonMuscles.validateSkeletonHierarchy(...args);
  }
  public retargetAnimalSkeleton(): void { this.skeletonMuscles.retargetAnimalSkeleton(); }

  // 081–100. Cơ bắp, gân và mô mềm
  public initializeAnimalMuscles(): void { this.skeletonMuscles.initializeAnimalMuscles(); }
  public updateMuscleActivation(muscleId?: string, level?: number): void { this.skeletonMuscles.updateMuscleActivation(muscleId, level); }
  public calculateMuscleForce(
    ...args: Parameters<SkeletonMusclesSubsystem['calculateMuscleForce']>
  ): ReturnType<SkeletonMusclesSubsystem['calculateMuscleForce']> {
    return this.skeletonMuscles.calculateMuscleForce(...args);
  }
  public calculateMuscleTension(
    ...args: Parameters<SkeletonMusclesSubsystem['calculateMuscleTension']>
  ): ReturnType<SkeletonMusclesSubsystem['calculateMuscleTension']> {
    return this.skeletonMuscles.calculateMuscleTension(...args);
  }
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
  public calculateMusculoskeletalLoad(
    ...args: Parameters<SkeletonMusclesSubsystem['calculateMusculoskeletalLoad']>
  ): ReturnType<SkeletonMusclesSubsystem['calculateMusculoskeletalLoad']> {
    return this.skeletonMuscles.calculateMusculoskeletalLoad(...args);
  }
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
  public trackHeadTarget(target: Vec3): void { this.headSenses.trackHeadTarget(target); }
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
  public lookAtTarget(target: Vec3): void { this.headSenses.lookAtTarget(target); }
  public moveLeftEye(direction: Vec3): void { this.headSenses.moveLeftEye(direction); }
  public moveRightEye(direction: Vec3): void { this.headSenses.moveRightEye(direction); }
  public synchronizeEyeDirection(): void { this.headSenses.synchronizeEyeDirection(); }
  public blinkEyes(): void { this.headSenses.blinkEyes(); }
  public closeEyes(): void { this.headSenses.closeEyes(); }
  public openEyes(): void { this.headSenses.openEyes(); }
  public updateEyelids(): void { this.headSenses.updateEyelids(); }
  public updatePupilSize(size?: number): void { this.headSenses.updatePupilSize(size); }
  public updatePupilDirection(direction?: Vec3): void { this.headSenses.updatePupilDirection(direction); }
  public trackMovingObject(target: Vec3): void { this.headSenses.trackMovingObject(target); }
  public detectVisualStimulus(
    ...args: Parameters<HeadSensesSubsystem['detectVisualStimulus']>
  ): ReturnType<HeadSensesSubsystem['detectVisualStimulus']> {
    return this.headSenses.detectVisualStimulus(...args);
  }
  public calculateVisualField(
    ...args: Parameters<HeadSensesSubsystem['calculateVisualField']>
  ): ReturnType<HeadSensesSubsystem['calculateVisualField']> {
    return this.headSenses.calculateVisualField(...args);
  }
  public calculateVisualDistance(
    ...args: Parameters<HeadSensesSubsystem['calculateVisualDistance']>
  ): ReturnType<HeadSensesSubsystem['calculateVisualDistance']> {
    return this.headSenses.calculateVisualDistance(...args);
  }
  public detectMotionInVision(
    ...args: Parameters<HeadSensesSubsystem['detectMotionInVision']>
  ): ReturnType<HeadSensesSubsystem['detectMotionInVision']> {
    return this.headSenses.detectMotionInVision(...args);
  }
  public updateNightVision(enabled?: boolean): void { this.headSenses.updateNightVision(enabled); }
  public updateDepthPerception(
    ...args: Parameters<HeadSensesSubsystem['updateDepthPerception']>
  ): ReturnType<HeadSensesSubsystem['updateDepthPerception']> {
    return this.headSenses.updateDepthPerception(...args);
  }
  public updateVisualAttention(): void { this.headSenses.updateVisualAttention(); }

  // 141–160. Tai, thính giác và định vị âm thanh
  public initializeAnimalHearing(): void { this.headSenses.initializeAnimalHearing(); }
  public updateAnimalEars(): void { this.headSenses.updateAnimalEars(); }
  public rotateLeftEar(angle?: number): void { this.headSenses.rotateLeftEar(angle); }
  public rotateRightEar(angle?: number): void { this.headSenses.rotateRightEar(angle); }
  public raiseEars(): void { this.headSenses.raiseEars(); }
  public flattenEars(): void { this.headSenses.flattenEars(); }
  public twitchEars(): void { this.headSenses.twitchEars(); }
  public detectAuditoryStimulus(
    ...args: Parameters<HeadSensesSubsystem['detectAuditoryStimulus']>
  ): ReturnType<HeadSensesSubsystem['detectAuditoryStimulus']> {
    return this.headSenses.detectAuditoryStimulus(...args);
  }
  public calculateSoundDirection(
    ...args: Parameters<HeadSensesSubsystem['calculateSoundDirection']>
  ): ReturnType<HeadSensesSubsystem['calculateSoundDirection']> {
    return this.headSenses.calculateSoundDirection(...args);
  }
  public calculateSoundDistance(
    ...args: Parameters<HeadSensesSubsystem['calculateSoundDistance']>
  ): ReturnType<HeadSensesSubsystem['calculateSoundDistance']> {
    return this.headSenses.calculateSoundDistance(...args);
  }
  public localizeSoundSource(pos: Vec3): void { this.headSenses.localizeSoundSource(pos); }
  public filterEnvironmentalNoise(): void { this.headSenses.filterEnvironmentalNoise(); }
  public detectHighFrequencySound(
    ...args: Parameters<HeadSensesSubsystem['detectHighFrequencySound']>
  ): ReturnType<HeadSensesSubsystem['detectHighFrequencySound']> {
    return this.headSenses.detectHighFrequencySound(...args);
  }
  public detectLowFrequencySound(
    ...args: Parameters<HeadSensesSubsystem['detectLowFrequencySound']>
  ): ReturnType<HeadSensesSubsystem['detectLowFrequencySound']> {
    return this.headSenses.detectLowFrequencySound(...args);
  }
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
  public sniffObject(obj: unknown): void { this.headSenses.sniffObject(obj); }
  public detectScent(
    ...args: Parameters<HeadSensesSubsystem['detectScent']>
  ): ReturnType<HeadSensesSubsystem['detectScent']> {
    return this.headSenses.detectScent(...args);
  }
  public analyzeScentComposition(
    ...args: Parameters<HeadSensesSubsystem['analyzeScentComposition']>
  ): ReturnType<HeadSensesSubsystem['analyzeScentComposition']> {
    return this.headSenses.analyzeScentComposition(...args);
  }
  public trackScentTrail(trail: unknown): void { this.headSenses.trackScentTrail(trail); }
  public followScentSource(source: unknown): void { this.headSenses.followScentSource(source); }
  public distinguishFamiliarScent(
    ...args: Parameters<HeadSensesSubsystem['distinguishFamiliarScent']>
  ): ReturnType<HeadSensesSubsystem['distinguishFamiliarScent']> {
    return this.headSenses.distinguishFamiliarScent(...args);
  }
  public detectFoodOdor(
    ...args: Parameters<HeadSensesSubsystem['detectFoodOdor']>
  ): ReturnType<HeadSensesSubsystem['detectFoodOdor']> {
    return this.headSenses.detectFoodOdor(...args);
  }
  public detectPredatorOdor(
    ...args: Parameters<HeadSensesSubsystem['detectPredatorOdor']>
  ): ReturnType<HeadSensesSubsystem['detectPredatorOdor']> {
    return this.headSenses.detectPredatorOdor(...args);
  }
  public detectMateOdor(
    ...args: Parameters<HeadSensesSubsystem['detectMateOdor']>
  ): ReturnType<HeadSensesSubsystem['detectMateOdor']> {
    return this.headSenses.detectMateOdor(...args);
  }
  public detectTerritoryScent(
    ...args: Parameters<HeadSensesSubsystem['detectTerritoryScent']>
  ): ReturnType<HeadSensesSubsystem['detectTerritoryScent']> {
    return this.headSenses.detectTerritoryScent(...args);
  }
  public updateNostrilMovement(): void { this.headSenses.updateNostrilMovement(); }
  public updateOlfactoryMemory(): void { this.headSenses.updateOlfactoryMemory(); }
  public detectChemicalStimulus(
    ...args: Parameters<HeadSensesSubsystem['detectChemicalStimulus']>
  ): ReturnType<HeadSensesSubsystem['detectChemicalStimulus']> {
    return this.headSenses.detectChemicalStimulus(...args);
  }
  public compareScentIntensity(
    ...args: Parameters<HeadSensesSubsystem['compareScentIntensity']>
  ): ReturnType<HeadSensesSubsystem['compareScentIntensity']> {
    return this.headSenses.compareScentIntensity(...args);
  }
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
  public biteFood(food: unknown): void { this.headSenses.biteFood(food); }
  public gripFoodWithMouth(food: unknown): void { this.headSenses.gripFoodWithMouth(food); }
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
  public calculateMammalStride(
    ...args: Parameters<MammalSubsystem['calculateMammalStride']>
  ): ReturnType<MammalSubsystem['calculateMammalStride']> {
    return this.mammal.calculateMammalStride(...args);
  }
  public calculateMammalLimbReach(
    ...args: Parameters<MammalSubsystem['calculateMammalLimbReach']>
  ): ReturnType<MammalSubsystem['calculateMammalLimbReach']> {
    return this.mammal.calculateMammalLimbReach(...args);
  }
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
  public groomAnotherAnimal(target: unknown): void { this.mammal.groomAnotherAnimal(target); }
  public cleanFaceWithPaw(): void { this.mammal.cleanFaceWithPaw(); }
  public rubBodyAgainstObject(obj: unknown): void { this.mammal.rubBodyAgainstObject(obj); }
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
  public diveTowardTarget(target: unknown): void { this.bird.diveTowardTarget(target); }
  public climbDuringFlight(): void { this.bird.climbDuringFlight(); }
  public bankLeftDuringFlight(): void { this.bird.bankLeftDuringFlight(); }
  public bankRightDuringFlight(): void { this.bird.bankRightDuringFlight(); }
  public brakeWithWings(): void { this.bird.brakeWithWings(); }
  public hoverLikeBird(): void { this.bird.hoverLikeBird(); }
  public takeOffFromGround(): void { this.bird.takeOffFromGround(); }
  public takeOffFromWater(): void { this.bird.takeOffFromWater(); }
  public landOnGround(): void { this.bird.landOnGround(); }
  public landOnBranch(branch: unknown): void { this.bird.landOnBranch(branch); }

  // 321–340. Chim: đậu, đi, kiếm ăn và giao tiếp
  public perchOnBranch(branch: unknown): void { this.bird.perchOnBranch(branch); }
  public releasePerchGrip(): void { this.bird.releasePerchGrip(); }
  public adjustPerchingBalance(): void { this.bird.adjustPerchingBalance(); }
  public walkLikeBird(): void { this.bird.walkLikeBird(); }
  public hopLikeBird(): void { this.bird.hopLikeBird(); }
  public runLikeBird(): void { this.bird.runLikeBird(); }
  public peckAtGround(): void { this.bird.peckAtGround(); }
  public peckAtFood(food: unknown): void { this.bird.peckAtFood(food); }
  public probeWithBeak(target: unknown): void { this.bird.probeWithBeak(target); }
  public scoopFoodWithBeak(food: unknown): void { this.bird.scoopFoodWithBeak(food); }
  public swallowPrey(prey: unknown): void { this.bird.swallowPrey(prey); }
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
  public detectWaterMovement(
    ...args: Parameters<FishSubsystem['detectWaterMovement']>
  ): ReturnType<FishSubsystem['detectWaterMovement']> {
    return this.fish.detectWaterMovement(...args);
  }
  public detectWaterPressure(
    ...args: Parameters<FishSubsystem['detectWaterPressure']>
  ): ReturnType<FishSubsystem['detectWaterPressure']> {
    return this.fish.detectWaterPressure(...args);
  }
  public senseWaterTemperature(
    ...args: Parameters<FishSubsystem['senseWaterTemperature']>
  ): ReturnType<FishSubsystem['senseWaterTemperature']> {
    return this.fish.senseWaterTemperature(...args);
  }
  public detectWaterborneChemicals(
    ...args: Parameters<FishSubsystem['detectWaterborneChemicals']>
  ): ReturnType<FishSubsystem['detectWaterborneChemicals']> {
    return this.fish.detectWaterborneChemicals(...args);
  }
  public schoolWithNearbyFish(): void { this.fish.schoolWithNearbyFish(); }
  public maintainSchoolSpacing(): void { this.fish.maintainSchoolSpacing(); }
  public pursueAquaticPrey(prey: unknown): void { this.fish.pursueAquaticPrey(prey); }
  public captureAquaticPrey(prey: unknown): void { this.fish.captureAquaticPrey(prey); }
  public grazeAquaticPlants(plants: unknown): void { this.fish.grazeAquaticPlants(plants); }
  public inspectAquaticObject(obj: unknown): void { this.fish.inspectAquaticObject(obj); }
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
  public calculateReptileStride(
    ...args: Parameters<ReptileSubsystem['calculateReptileStride']>
  ): ReturnType<ReptileSubsystem['calculateReptileStride']> {
    return this.reptile.calculateReptileStride(...args);
  }
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
  public strikeAtTarget(target: unknown): void { this.reptile.strikeAtTarget(target); }
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
  public captureReptilePrey(prey: unknown): void { this.reptile.captureReptilePrey(prey); }
  public swallowReptilePrey(prey: unknown): void { this.reptile.swallowReptilePrey(prey); }
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
  public calculateAmphibianStride(
    ...args: Parameters<AmphibianSubsystem['calculateAmphibianStride']>
  ): ReturnType<AmphibianSubsystem['calculateAmphibianStride']> {
    return this.amphibian.calculateAmphibianStride(...args);
  }
  public calculateFrogJumpForce(
    ...args: Parameters<AmphibianSubsystem['calculateFrogJumpForce']>
  ): ReturnType<AmphibianSubsystem['calculateFrogJumpForce']> {
    return this.amphibian.calculateFrogJumpForce(...args);
  }
  public calculateFrogLandingPose(
    ...args: Parameters<AmphibianSubsystem['calculateFrogLandingPose']>
  ): ReturnType<AmphibianSubsystem['calculateFrogLandingPose']> {
    return this.amphibian.calculateFrogLandingPose(...args);
  }
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
  public captureInsectWithTongue(insect: unknown): void { this.amphibian.captureInsectWithTongue(insect); }
  public swallowSmallPrey(prey: unknown): void { this.amphibian.swallowSmallPrey(prey); }
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
  public calculateWingbeatFrequency(
    ...args: Parameters<InsectSubsystem['calculateWingbeatFrequency']>
  ): ReturnType<InsectSubsystem['calculateWingbeatFrequency']> {
    return this.insect.calculateWingbeatFrequency(...args);
  }
  public calculateWingbeatAmplitude(
    ...args: Parameters<InsectSubsystem['calculateWingbeatAmplitude']>
  ): ReturnType<InsectSubsystem['calculateWingbeatAmplitude']> {
    return this.insect.calculateWingbeatAmplitude(...args);
  }
  public synchronizeWingPairs(): void { this.insect.synchronizeWingPairs(); }
  public generateInsectLift(
    ...args: Parameters<InsectSubsystem['generateInsectLift']>
  ): ReturnType<InsectSubsystem['generateInsectLift']> {
    return this.insect.generateInsectLift(...args);
  }
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
  public detectFoodWithAntennae(
    ...args: Parameters<InsectSubsystem['detectFoodWithAntennae']>
  ): ReturnType<InsectSubsystem['detectFoodWithAntennae']> {
    return this.insect.detectFoodWithAntennae(...args);
  }
  public inspectFoodWithPalps(): void { this.insect.inspectFoodWithPalps(); }
  public feedOnNectar(): void { this.insect.feedOnNectar(); }
  public chewPlantMaterial(): void { this.insect.chewPlantMaterial(); }
  public bitePlantLeaf(leaf: unknown): void { this.insect.bitePlantLeaf(leaf); }
  public probeFoodSource(source: unknown): void { this.insect.probeFoodSource(source); }
  public followPheromoneTrail(trail: unknown): void { this.insect.followPheromoneTrail(trail); }
  public depositPheromone(type: string): void { this.insect.depositPheromone(type); }
  public detectColonyPheromone(
    ...args: Parameters<InsectSubsystem['detectColonyPheromone']>
  ): ReturnType<InsectSubsystem['detectColonyPheromone']> {
    return this.insect.detectColonyPheromone(...args);
  }
  public recruitColonyMembers(target: unknown): void { this.insect.recruitColonyMembers(target); }
  public carrySmallObject(object: unknown): void { this.insect.carrySmallObject(object); }
  public transportFoodToNest(food: unknown): void { this.insect.transportFoodToNest(food); }
  public digInsectBurrow(): void { this.insect.digInsectBurrow(); }
  public constructNestMaterial(material: unknown): void { this.insect.constructNestMaterial(material); }
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
  public detectVibrationThroughLegs(
    ...args: Parameters<InvertebrateSubsystem['detectVibrationThroughLegs']>
  ): ReturnType<InvertebrateSubsystem['detectVibrationThroughLegs']> {
    return this.invertebrate.detectVibrationThroughLegs(...args);
  }
  public produceSilkThread(
    ...args: Parameters<InvertebrateSubsystem['produceSilkThread']>
  ): ReturnType<InvertebrateSubsystem['produceSilkThread']> {
    return this.invertebrate.produceSilkThread(...args);
  }
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
  public calculateRespiratoryRate(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateRespiratoryRate']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateRespiratoryRate']> {
    return this.physiologyEcology.calculateRespiratoryRate(...args);
  }
  public updateLungExpansion(): void { this.physiologyEcology.updateLungExpansion(); }
  public updateLungContraction(): void { this.physiologyEcology.updateLungContraction(); }
  public updateGillVentilation(): void { this.physiologyEcology.updateGillVentilation(); }
  public updateTrachealVentilation(): void { this.physiologyEcology.updateTrachealVentilation(); }
  public updateHeartRate(
    ...args: Parameters<PhysiologyEcologySubsystem['updateHeartRate']>
  ): ReturnType<PhysiologyEcologySubsystem['updateHeartRate']> {
    return this.physiologyEcology.updateHeartRate(...args);
  }
  public updateBloodCirculation(): void { this.physiologyEcology.updateBloodCirculation(); }
  public regulateOxygenDemand(): void { this.physiologyEcology.regulateOxygenDemand(); }
  public regulateCarbonDioxideRemoval(): void { this.physiologyEcology.regulateCarbonDioxideRemoval(); }
  public regulateWaterBalance(): void { this.physiologyEcology.regulateWaterBalance(); }
  public regulateElectrolyteBalance(): void { this.physiologyEcology.regulateElectrolyteBalance(); }
  public regulateEnergyConsumption(): void { this.physiologyEcology.regulateEnergyConsumption(); }
  public calculateMetabolicRate(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateMetabolicRate']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateMetabolicRate']> {
    return this.physiologyEcology.calculateMetabolicRate(...args);
  }
  public updateDigestiveActivity(): void { this.physiologyEcology.updateDigestiveActivity(); }
  public updateExcretoryActivity(): void { this.physiologyEcology.updateExcretoryActivity(); }
  public updatePhysiologicalStress(): void { this.physiologyEcology.updatePhysiologicalStress(); }
  public recoverPhysiologicalHomeostasis(): void { this.physiologyEcology.recoverPhysiologicalHomeostasis(); }

  // 661–680. Dinh dưỡng, săn mồi và kiếm ăn
  public initializeAnimalFeeding(): void { this.physiologyEcology.initializeAnimalFeeding(); }
  public detectPotentialFood(
    ...args: Parameters<PhysiologyEcologySubsystem['detectPotentialFood']>
  ): ReturnType<PhysiologyEcologySubsystem['detectPotentialFood']> {
    return this.physiologyEcology.detectPotentialFood(...args);
  }
  public classifyFoodSource(
    ...args: Parameters<PhysiologyEcologySubsystem['classifyFoodSource']>
  ): ReturnType<PhysiologyEcologySubsystem['classifyFoodSource']> {
    return this.physiologyEcology.classifyFoodSource(...args);
  }
  public evaluateFoodSafety(
    ...args: Parameters<PhysiologyEcologySubsystem['evaluateFoodSafety']>
  ): ReturnType<PhysiologyEcologySubsystem['evaluateFoodSafety']> {
    return this.physiologyEcology.evaluateFoodSafety(...args);
  }
  public approachFoodSource(source: unknown): void { this.physiologyEcology.approachFoodSource(source); }
  public investigateFoodSource(source: unknown): void { this.physiologyEcology.investigateFoodSource(source); }
  public selectFoodItem(
    ...args: Parameters<PhysiologyEcologySubsystem['selectFoodItem']>
  ): ReturnType<PhysiologyEcologySubsystem['selectFoodItem']> {
    return this.physiologyEcology.selectFoodItem(...args);
  }
  public captureFoodItem(item: unknown): void { this.physiologyEcology.captureFoodItem(item); }
  public manipulateFoodItem(item: unknown): void { this.physiologyEcology.manipulateFoodItem(item); }
  public ingestFoodItem(item: unknown): void { this.physiologyEcology.ingestFoodItem(item); }
  public processFoodInMouth(): void { this.physiologyEcology.processFoodInMouth(); }
  public swallowFoodBolus(): void { this.physiologyEcology.swallowFoodBolus(); }
  public trackPreyMovement(prey: unknown): void { this.physiologyEcology.trackPreyMovement(prey); }
  public stalkPrey(prey: unknown): void { this.physiologyEcology.stalkPrey(prey); }
  public pursuePrey(prey: unknown): void { this.physiologyEcology.pursuePrey(prey); }
  public interceptPrey(prey: unknown): void { this.physiologyEcology.interceptPrey(prey); }
  public executePredatoryStrike(prey: unknown): void { this.physiologyEcology.executePredatoryStrike(prey); }
  public secureCapturedPrey(prey: unknown): void { this.physiologyEcology.secureCapturedPrey(prey); }
  public shareFoodWithGroup(group: unknown): void { this.physiologyEcology.shareFoodWithGroup(group); }
  public updateFeedingMotivation(): void { this.physiologyEcology.updateFeedingMotivation(); }

  // 681–700. Sinh sản, giao phối và chăm sóc con non
  public initializeReproductiveBehavior(): void { this.physiologyEcology.initializeReproductiveBehavior(); }
  public detectReproductiveReadiness(
    ...args: Parameters<PhysiologyEcologySubsystem['detectReproductiveReadiness']>
  ): ReturnType<PhysiologyEcologySubsystem['detectReproductiveReadiness']> {
    return this.physiologyEcology.detectReproductiveReadiness(...args);
  }
  public detectPotentialMate(
    ...args: Parameters<PhysiologyEcologySubsystem['detectPotentialMate']>
  ): ReturnType<PhysiologyEcologySubsystem['detectPotentialMate']> {
    return this.physiologyEcology.detectPotentialMate(...args);
  }
  public approachPotentialMate(mate: unknown): void { this.physiologyEcology.approachPotentialMate(mate); }
  public performCourtshipBehavior(): void { this.physiologyEcology.performCourtshipBehavior(); }
  public performCourtshipVocalization(): void { this.physiologyEcology.performCourtshipVocalization(); }
  public evaluateMateCompatibility(
    ...args: Parameters<PhysiologyEcologySubsystem['evaluateMateCompatibility']>
  ): ReturnType<PhysiologyEcologySubsystem['evaluateMateCompatibility']> {
    return this.physiologyEcology.evaluateMateCompatibility(...args);
  }
  public initiateMatingSequence(): void { this.physiologyEcology.initiateMatingSequence(); }
  public terminateMatingSequence(): void { this.physiologyEcology.terminateMatingSequence(); }
  public searchForNestingSite(): void { this.physiologyEcology.searchForNestingSite(); }
  public constructNest(): void { this.physiologyEcology.constructNest(); }
  public prepareNestingMaterial(): void { this.physiologyEcology.prepareNestingMaterial(); }
  public layEggs(): void { this.physiologyEcology.layEggs(); }
  public incubateEggs(): void { this.physiologyEcology.incubateEggs(); }
  public guardNest(): void { this.physiologyEcology.guardNest(); }
  public recognizeOffspring(
    ...args: Parameters<PhysiologyEcologySubsystem['recognizeOffspring']>
  ): ReturnType<PhysiologyEcologySubsystem['recognizeOffspring']> {
    return this.physiologyEcology.recognizeOffspring(...args);
  }
  public retrieveOffspring(offspring: unknown): void { this.physiologyEcology.retrieveOffspring(offspring); }
  public feedOffspring(offspring: unknown): void { this.physiologyEcology.feedOffspring(offspring); }
  public protectOffspring(offspring: unknown): void { this.physiologyEcology.protectOffspring(offspring); }

  // 701–720. Phát triển, sinh trưởng và thay đổi cơ thể
  public initializeAnimalDevelopment(): void { this.physiologyEcology.initializeAnimalDevelopment(); }
  public updateDevelopmentStage(): void { this.physiologyEcology.updateDevelopmentStage(); }
  public transitionToJuvenileStage(): void { this.physiologyEcology.transitionToJuvenileStage(); }
  public transitionToAdultStage(): void { this.physiologyEcology.transitionToAdultStage(); }
  public transitionToSeniorStage(): void { this.physiologyEcology.transitionToSeniorStage(); }
  public calculateGrowthRate(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateGrowthRate']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateGrowthRate']> {
    return this.physiologyEcology.calculateGrowthRate(...args);
  }
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
  public senseAmbientTemperature(
    ...args: Parameters<PhysiologyEcologySubsystem['senseAmbientTemperature']>
  ): ReturnType<PhysiologyEcologySubsystem['senseAmbientTemperature']> {
    return this.physiologyEcology.senseAmbientTemperature(...args);
  }
  public senseHumidity(
    ...args: Parameters<PhysiologyEcologySubsystem['senseHumidity']>
  ): ReturnType<PhysiologyEcologySubsystem['senseHumidity']> {
    return this.physiologyEcology.senseHumidity(...args);
  }
  public senseWindDirection(): Vec3 { return this.physiologyEcology.senseWindDirection(); }
  public senseWindSpeed(
    ...args: Parameters<PhysiologyEcologySubsystem['senseWindSpeed']>
  ): ReturnType<PhysiologyEcologySubsystem['senseWindSpeed']> {
    return this.physiologyEcology.senseWindSpeed(...args);
  }
  public senseGroundVibration(
    ...args: Parameters<PhysiologyEcologySubsystem['senseGroundVibration']>
  ): ReturnType<PhysiologyEcologySubsystem['senseGroundVibration']> {
    return this.physiologyEcology.senseGroundVibration(...args);
  }
  public senseWaterCurrent(): Vec3 { return this.physiologyEcology.senseWaterCurrent(); }
  public senseWaterPressure(
    ...args: Parameters<PhysiologyEcologySubsystem['senseWaterPressure']>
  ): ReturnType<PhysiologyEcologySubsystem['senseWaterPressure']> {
    return this.physiologyEcology.senseWaterPressure(...args);
  }
  public senseMagneticField(): Vec3 { return this.physiologyEcology.senseMagneticField(); }
  public senseLightIntensity(
    ...args: Parameters<PhysiologyEcologySubsystem['senseLightIntensity']>
  ): ReturnType<PhysiologyEcologySubsystem['senseLightIntensity']> {
    return this.physiologyEcology.senseLightIntensity(...args);
  }
  public sensePolarizedLight(
    ...args: Parameters<PhysiologyEcologySubsystem['sensePolarizedLight']>
  ): ReturnType<PhysiologyEcologySubsystem['sensePolarizedLight']> {
    return this.physiologyEcology.sensePolarizedLight(...args);
  }
  public detectChemicalSignals(
    ...args: Parameters<PhysiologyEcologySubsystem['detectChemicalSignals']>
  ): ReturnType<PhysiologyEcologySubsystem['detectChemicalSignals']> {
    return this.physiologyEcology.detectChemicalSignals(...args);
  }
  public detectPheromones(
    ...args: Parameters<PhysiologyEcologySubsystem['detectPheromones']>
  ): ReturnType<PhysiologyEcologySubsystem['detectPheromones']> {
    return this.physiologyEcology.detectPheromones(...args);
  }
  public detectPredatorPresence(
    ...args: Parameters<PhysiologyEcologySubsystem['detectPredatorPresence']>
  ): ReturnType<PhysiologyEcologySubsystem['detectPredatorPresence']> {
    return this.physiologyEcology.detectPredatorPresence(...args);
  }
  public detectConspecificPresence(
    ...args: Parameters<PhysiologyEcologySubsystem['detectConspecificPresence']>
  ): ReturnType<PhysiologyEcologySubsystem['detectConspecificPresence']> {
    return this.physiologyEcology.detectConspecificPresence(...args);
  }
  public detectHabitatBoundary(
    ...args: Parameters<PhysiologyEcologySubsystem['detectHabitatBoundary']>
  ): ReturnType<PhysiologyEcologySubsystem['detectHabitatBoundary']> {
    return this.physiologyEcology.detectHabitatBoundary(...args);
  }
  public estimateEnvironmentalRisk(
    ...args: Parameters<PhysiologyEcologySubsystem['estimateEnvironmentalRisk']>
  ): ReturnType<PhysiologyEcologySubsystem['estimateEnvironmentalRisk']> {
    return this.physiologyEcology.estimateEnvironmentalRisk(...args);
  }
  public estimateResourceAvailability(
    ...args: Parameters<PhysiologyEcologySubsystem['estimateResourceAvailability']>
  ): ReturnType<PhysiologyEcologySubsystem['estimateResourceAvailability']> {
    return this.physiologyEcology.estimateResourceAvailability(...args);
  }
  public updateEnvironmentalMemory(): void { this.physiologyEcology.updateEnvironmentalMemory(); }
  public integrateSensoryInformation(): void { this.physiologyEcology.integrateSensoryInformation(); }

  // 741–760. Hành vi, cảm xúc và ra quyết định
  public initializeAnimalBehavior(): void { this.physiologyEcology.initializeAnimalBehavior(); }
  public updateAnimalBehavior(deltaTime: number): void { this.physiologyEcology.updateAnimalBehavior(deltaTime); }
  public evaluateAnimalNeeds(): void { this.physiologyEcology.evaluateAnimalNeeds(); }
  public calculateHungerLevel(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateHungerLevel']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateHungerLevel']> {
    return this.physiologyEcology.calculateHungerLevel(...args);
  }
  public calculateThirstLevel(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateThirstLevel']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateThirstLevel']> {
    return this.physiologyEcology.calculateThirstLevel(...args);
  }
  public calculateFatigueLevel(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateFatigueLevel']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateFatigueLevel']> {
    return this.physiologyEcology.calculateFatigueLevel(...args);
  }
  public calculateFearLevel(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateFearLevel']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateFearLevel']> {
    return this.physiologyEcology.calculateFearLevel(...args);
  }
  public calculateCuriosityLevel(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateCuriosityLevel']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateCuriosityLevel']> {
    return this.physiologyEcology.calculateCuriosityLevel(...args);
  }
  public calculateAggressionLevel(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateAggressionLevel']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateAggressionLevel']> {
    return this.physiologyEcology.calculateAggressionLevel(...args);
  }
  public calculateSocialMotivation(
    ...args: Parameters<PhysiologyEcologySubsystem['calculateSocialMotivation']>
  ): ReturnType<PhysiologyEcologySubsystem['calculateSocialMotivation']> {
    return this.physiologyEcology.calculateSocialMotivation(...args);
  }
  public selectBehaviorState(
    ...args: Parameters<PhysiologyEcologySubsystem['selectBehaviorState']>
  ): ReturnType<PhysiologyEcologySubsystem['selectBehaviorState']> {
    return this.physiologyEcology.selectBehaviorState(...args);
  }
  public chooseNextAction(
    ...args: Parameters<PhysiologyEcologySubsystem['chooseNextAction']>
  ): ReturnType<PhysiologyEcologySubsystem['chooseNextAction']> {
    return this.physiologyEcology.chooseNextAction(...args);
  }
  public interruptCurrentBehavior(): void { this.physiologyEcology.interruptCurrentBehavior(); }
  public resumePreviousBehavior(): void { this.physiologyEcology.resumePreviousBehavior(); }
  public evaluateThreatResponse(
    ...args: Parameters<PhysiologyEcologySubsystem['evaluateThreatResponse']>
  ): ReturnType<PhysiologyEcologySubsystem['evaluateThreatResponse']> {
    return this.physiologyEcology.evaluateThreatResponse(...args);
  }
  public chooseEscapeDirection(): Vec3 { return this.physiologyEcology.chooseEscapeDirection(); }
  public initiateDefensiveBehavior(): void { this.physiologyEcology.initiateDefensiveBehavior(); }
  public investigateNovelStimulus(): void { this.physiologyEcology.investigateNovelStimulus(); }
  public updateBehavioralMemory(): void { this.physiologyEcology.updateBehavioralMemory(); }
  public transitionBehaviorState(newState?: string): void { this.physiologyEcology.transitionBehaviorState(newState); }

  // 761–780. Bầy đàn, giao tiếp và lãnh thổ
  public initializeSocialBehavior(): void { this.physiologyEcology.initializeSocialBehavior(); }
  public detectNearbyConspecifics(): unknown[] { return this.physiologyEcology.detectNearbyConspecifics(); }
  public recognizeIndividualAnimal(
    ...args: Parameters<PhysiologyEcologySubsystem['recognizeIndividualAnimal']>
  ): ReturnType<PhysiologyEcologySubsystem['recognizeIndividualAnimal']> {
    return this.physiologyEcology.recognizeIndividualAnimal(...args);
  }
  public maintainGroupSpacing(): void { this.physiologyEcology.maintainGroupSpacing(); }
  public followGroupLeader(leader: unknown): void { this.physiologyEcology.followGroupLeader(leader); }
  public electGroupLeader(
    ...args: Parameters<PhysiologyEcologySubsystem['electGroupLeader']>
  ): ReturnType<PhysiologyEcologySubsystem['electGroupLeader']> {
    return this.physiologyEcology.electGroupLeader(...args);
  }
  public synchronizeGroupMovement(group: unknown): void { this.physiologyEcology.synchronizeGroupMovement(group); }
  public joinAnimalGroup(group: unknown): void { this.physiologyEcology.joinAnimalGroup(group); }
  public leaveAnimalGroup(group: unknown): void { this.physiologyEcology.leaveAnimalGroup(group); }
  public coordinateGroupForaging(group: unknown): void { this.physiologyEcology.coordinateGroupForaging(group); }
  public performSocialGreeting(animal: unknown): void { this.physiologyEcology.performSocialGreeting(animal); }
  public initiateSocialGrooming(animal: unknown): void { this.physiologyEcology.initiateSocialGrooming(animal); }
  public exchangeVocalSignals(signal: unknown): void { this.physiologyEcology.exchangeVocalSignals(signal); }
  public performAlarmCall(): void { this.physiologyEcology.performAlarmCall(); }
  public respondToAlarmCall(signal: unknown): void { this.physiologyEcology.respondToAlarmCall(signal); }
  public establishTerritorialBoundary(area: unknown): void { this.physiologyEcology.establishTerritorialBoundary(area); }
  public patrolTerritory(area: unknown): void { this.physiologyEcology.patrolTerritory(area); }
  public markTerritory(location: unknown): void { this.physiologyEcology.markTerritory(location); }
  public defendTerritory(intruder: unknown): void { this.physiologyEcology.defendTerritory(intruder); }
  public resolveSocialConflict(animal: unknown): void { this.physiologyEcology.resolveSocialConflict(animal); }

  // 781–800. Vật lý, animation, AI và tối ưu hóa
  public initializeAnimalPhysics(): void { this.physiologyEcology.initializeAnimalPhysics(); }
  public createAnimalCollider(
    ...args: Parameters<PhysiologyEcologySubsystem['createAnimalCollider']>
  ): ReturnType<PhysiologyEcologySubsystem['createAnimalCollider']> {
    return this.physiologyEcology.createAnimalCollider(...args);
  }
  public applyAnimalGravity(deltaTime: number): void { this.physiologyEcology.applyAnimalGravity(deltaTime); }
  public applyAnimalForce(force: Vec3): void { this.physiologyEcology.applyAnimalForce(force); }
  public resolveAnimalCollision(): void { this.physiologyEcology.resolveAnimalCollision(); }
  public updateAnimalGroundContact(
    ...args: Parameters<PhysiologyEcologySubsystem['updateAnimalGroundContact']>
  ): ReturnType<PhysiologyEcologySubsystem['updateAnimalGroundContact']> {
    return this.physiologyEcology.updateAnimalGroundContact(...args);
  }
  public solveAnimalIK(): void { this.physiologyEcology.solveAnimalIK(); }
  public solveAnimalFootIK(): void { this.physiologyEcology.solveAnimalFootIK(); }
  public blendAnimalAnimations(): void { this.physiologyEcology.blendAnimalAnimations(); }
  public crossFadeAnimalAnimation(from: string, to: string, duration?: number): void { this.physiologyEcology.crossFadeAnimalAnimation(from, to, duration); }
  public updateAnimalAnimationMixer(deltaTime: number): void { this.physiologyEcology.updateAnimalAnimationMixer(deltaTime); }
  public updateAnimalRootMotion(): Vec3 { return this.physiologyEcology.updateAnimalRootMotion(); }
  public applyAnimalSecondaryMotion(): void { this.physiologyEcology.applyAnimalSecondaryMotion(); }
  public updateAnimalTailDynamics(): void { this.physiologyEcology.updateAnimalTailDynamics(); }
  public updateAnimalClothDynamics(): void { this.physiologyEcology.updateAnimalClothDynamics(); }
  public updateAnimalLOD(
    ...args: Parameters<PhysiologyEcologySubsystem['updateAnimalLOD']>
  ): ReturnType<PhysiologyEcologySubsystem['updateAnimalLOD']> {
    return this.physiologyEcology.updateAnimalLOD(...args);
  }
  public interpolateAnimalPosition(target: Vec3, alpha?: number): void { this.physiologyEcology.interpolateAnimalPosition(target, alpha); }
  public interpolateAnimalRotation(target: unknown, alpha?: number): void { this.physiologyEcology.interpolateAnimalRotation(target, alpha); }
  public synchronizeAnimalPhysics(): void { this.physiologyEcology.synchronizeAnimalPhysics(); }
  public optimizeAnimalSimulation(): void { this.physiologyEcology.optimizeAnimalSimulation(); }
}
