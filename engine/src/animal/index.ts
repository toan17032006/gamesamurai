/**
 * @file index.ts
 * @module @aetheria/engine/animal
 * @description Master entry point exporting Animal class and all 800 standalone animal functions.
 */

import { Animal } from './animal.js';
import type { AnimalConfig } from './types.js';
import type { Vec3 } from '../types/index.js';

export * from './types.js';
export * from './animal.js';
export * from './subsystems/animal-base.js';
export * from './subsystems/skeleton-muscles.js';
export * from './subsystems/head-senses.js';
export * from './subsystems/mammal-subsystem.js';
export * from './subsystems/bird-subsystem.js';
export * from './subsystems/fish-subsystem.js';
export * from './subsystems/reptile-subsystem.js';
export * from './subsystems/amphibian-subsystem.js';
export * from './subsystems/insect-subsystem.js';
export * from './subsystems/invertebrate-subsystem.js';
export * from './subsystems/physiology-ecology.js';

let defaultAnimal: Animal | null = null;

export function getActiveAnimal(): Animal {
  if (!defaultAnimal) {
    defaultAnimal = new Animal();
    defaultAnimal.initializeAnimal();
  }
  return defaultAnimal;
}

export function setActiveAnimal(animal: Animal): void {
  defaultAnimal = animal;
}

function resolveAnimal(a?: Animal): Animal {
  return a ?? getActiveAnimal();
}

// ============================================================================
// 001–020. Khởi tạo và quản lý động vật
// ============================================================================

export function createAnimal(config?: Partial<AnimalConfig>): Animal {
  const a = new Animal(config);
  a.createAnimal();
  setActiveAnimal(a);
  return a;
}
export function initializeAnimal(inst?: Animal): boolean { return resolveAnimal(inst).initializeAnimal(); }
export function destroyAnimal(inst?: Animal): void { resolveAnimal(inst).destroyAnimal(); }
export function resetAnimal(inst?: Animal): void { resolveAnimal(inst).resetAnimal(); }
export function respawnAnimal(inst?: Animal): void { resolveAnimal(inst).respawnAnimal(); }
export function updateAnimal(dt: number, inst?: Animal): void { resolveAnimal(inst).updateAnimal(dt); }
export function lateUpdateAnimal(dt: number, inst?: Animal): void { resolveAnimal(inst).lateUpdateAnimal(dt); }
export function fixedUpdateAnimal(fdt: number, inst?: Animal): void { resolveAnimal(inst).fixedUpdateAnimal(fdt); }
export function setAnimalConfig(config: any, inst?: Animal): void { resolveAnimal(inst).setAnimalConfig(config); }
export function getAnimalConfig(inst?: Animal): any { return resolveAnimal(inst).getAnimalConfig(); }
export function getAnimalState(inst?: Animal): any { return resolveAnimal(inst).getAnimalState(); }
export function setAnimalState(state: any, inst?: Animal): void { resolveAnimal(inst).setAnimalState(state); }
export function saveAnimalState(inst?: Animal): string { return resolveAnimal(inst).saveAnimalState(); }
export function restoreAnimalState(state: any, inst?: Animal): boolean { return resolveAnimal(inst).restoreAnimalState(state); }
export function enableAnimal(inst?: Animal): void { resolveAnimal(inst).enableAnimal(); }
export function disableAnimal(inst?: Animal): void { resolveAnimal(inst).disableAnimal(); }
export function pauseAnimal(inst?: Animal): void { resolveAnimal(inst).pauseAnimal(); }
export function resumeAnimal(inst?: Animal): void { resolveAnimal(inst).resumeAnimal(); }
export function validateAnimalState(inst?: Animal): boolean { return resolveAnimal(inst).validateAnimalState(); }
export function disposeAnimalResources(inst?: Animal): void { resolveAnimal(inst).disposeAnimalResources(); }

// ============================================================================
// 021–040. Phân loại và đặc điểm loài
// ============================================================================

export function setAnimalSpecies(species: string, inst?: Animal): void { resolveAnimal(inst).setAnimalSpecies(species); }
export function getAnimalSpecies(inst?: Animal): string { return resolveAnimal(inst).getAnimalSpecies(); }
export function classifyAnimalSpecies(inst?: Animal): any { return resolveAnimal(inst).classifyAnimalSpecies(); }
export function identifyAnimalFamily(inst?: Animal): string { return resolveAnimal(inst).identifyAnimalFamily(); }
export function identifyAnimalOrder(inst?: Animal): string { return resolveAnimal(inst).identifyAnimalOrder(); }
export function identifyAnimalClass(inst?: Animal): any { return resolveAnimal(inst).identifyAnimalClass(); }
export function identifyAnimalPhylum(inst?: Animal): any { return resolveAnimal(inst).identifyAnimalPhylum(); }
export function determineAnimalHabitat(inst?: Animal): string[] { return resolveAnimal(inst).determineAnimalHabitat(); }
export function determineAnimalDiet(inst?: Animal): any { return resolveAnimal(inst).determineAnimalDiet(); }
export function determineAnimalLocomotion(inst?: Animal): any { return resolveAnimal(inst).determineAnimalLocomotion(); }
export function determineAnimalBodyPlan(inst?: Animal): string { return resolveAnimal(inst).determineAnimalBodyPlan(); }
export function determineAnimalSymmetry(inst?: Animal): string { return resolveAnimal(inst).determineAnimalSymmetry(); }
export function determineAnimalActivityPattern(inst?: Animal): any { return resolveAnimal(inst).determineAnimalActivityPattern(); }
export function determineAnimalSocialType(inst?: Animal): any { return resolveAnimal(inst).determineAnimalSocialType(); }
export function determineAnimalReproductionType(inst?: Animal): any { return resolveAnimal(inst).determineAnimalReproductionType(); }
export function determineAnimalDevelopmentType(inst?: Animal): any { return resolveAnimal(inst).determineAnimalDevelopmentType(); }
export function loadSpeciesProfile(species: string, inst?: Animal): any { return resolveAnimal(inst).loadSpeciesProfile(species); }
export function applySpeciesDefaults(profile: any, inst?: Animal): void { resolveAnimal(inst).applySpeciesDefaults(profile); }
export function validateSpeciesCompatibility(inst?: Animal): boolean { return resolveAnimal(inst).validateSpeciesCompatibility(); }
export function updateSpeciesCharacteristics(inst?: Animal): void { resolveAnimal(inst).updateSpeciesCharacteristics(); }

// ============================================================================
// 041–060. Mô hình 3D và ngoại hình động vật
// ============================================================================

export function loadAnimalModel(inst?: Animal): boolean { return resolveAnimal(inst).loadAnimalModel(); }
export function createAnimalMesh(inst?: Animal): boolean { return resolveAnimal(inst).createAnimalMesh(); }
export function createAnimalMaterial(inst?: Animal): boolean { return resolveAnimal(inst).createAnimalMaterial(); }
export function loadAnimalTextures(inst?: Animal): boolean { return resolveAnimal(inst).loadAnimalTextures(); }
export function loadAnimalNormalMaps(inst?: Animal): boolean { return resolveAnimal(inst).loadAnimalNormalMaps(); }
export function loadAnimalRoughnessMaps(inst?: Animal): boolean { return resolveAnimal(inst).loadAnimalRoughnessMaps(); }
export function updateAnimalAppearance(inst?: Animal): void { resolveAnimal(inst).updateAnimalAppearance(); }
export function setAnimalBodyColor(color: string, inst?: Animal): void { resolveAnimal(inst).setAnimalBodyColor(color); }
export function setAnimalPattern(pattern: any, inst?: Animal): void { resolveAnimal(inst).setAnimalPattern(pattern); }
export function setAnimalScale(scale: any, inst?: Animal): void { resolveAnimal(inst).setAnimalScale(scale); }
export function setAnimalLength(length: number, inst?: Animal): void { resolveAnimal(inst).setAnimalLength(length); }
export function setAnimalHeight(height: number, inst?: Animal): void { resolveAnimal(inst).setAnimalHeight(height); }
export function setAnimalBodyMass(mass: number, inst?: Animal): void { resolveAnimal(inst).setAnimalBodyMass(mass); }
export function setAnimalBodyShape(shape: string, inst?: Animal): void { resolveAnimal(inst).setAnimalBodyShape(shape); }
export function updateBodyProportions(inst?: Animal): void { resolveAnimal(inst).updateBodyProportions(); }
export function updateSurfaceDetails(inst?: Animal): void { resolveAnimal(inst).updateSurfaceDetails(); }
export function updateSpeciesMarkings(inst?: Animal): void { resolveAnimal(inst).updateSpeciesMarkings(); }
export function updateBodySilhouette(inst?: Animal): void { resolveAnimal(inst).updateBodySilhouette(); }
export function updateAnimalShading(inst?: Animal): void { resolveAnimal(inst).updateAnimalShading(); }
export function updateAnimalVisibility(inst?: Animal): void { resolveAnimal(inst).updateAnimalVisibility(); }

// ============================================================================
// 061–080. Bộ xương tổng quát
// ============================================================================

export function initializeAnimalSkeleton(inst?: Animal): void { resolveAnimal(inst).initializeAnimalSkeleton(); }
export function updateAnimalSkeleton(inst?: Animal): void { resolveAnimal(inst).updateAnimalSkeleton(); }
export function loadSkeletalRig(inst?: Animal): boolean { return resolveAnimal(inst).loadSkeletalRig(); }
export function createSkeletalHierarchy(inst?: Animal): boolean { return resolveAnimal(inst).createSkeletalHierarchy(); }
export function updateBoneTransforms(inst?: Animal): void { resolveAnimal(inst).updateBoneTransforms(); }
export function updateRootBone(inst?: Animal): void { resolveAnimal(inst).updateRootBone(); }
export function updateAxialSkeleton(inst?: Animal): void { resolveAnimal(inst).updateAxialSkeleton(); }
export function updateAppendicularSkeleton(inst?: Animal): void { resolveAnimal(inst).updateAppendicularSkeleton(); }
export function updateSkullBones(inst?: Animal): void { resolveAnimal(inst).updateSkullBones(); }
export function updateVertebralColumn(inst?: Animal): void { resolveAnimal(inst).updateVertebralColumn(); }
export function updateRibCage(inst?: Animal): void { resolveAnimal(inst).updateRibCage(); }
export function updateSternum(inst?: Animal): void { resolveAnimal(inst).updateSternum(); }
export function updatePelvicStructure(inst?: Animal): void { resolveAnimal(inst).updatePelvicStructure(); }
export function updateLimbBones(inst?: Animal): void { resolveAnimal(inst).updateLimbBones(); }
export function updateJointTransforms(inst?: Animal): void { resolveAnimal(inst).updateJointTransforms(); }
export function constrainBoneRotations(inst?: Animal): void { resolveAnimal(inst).constrainBoneRotations(); }
export function calculateBoneLengths(inst?: Animal): any { return resolveAnimal(inst).calculateBoneLengths(); }
export function calculateJointAngles(inst?: Animal): any { return resolveAnimal(inst).calculateJointAngles(); }
export function validateSkeletonHierarchy(inst?: Animal): boolean { return resolveAnimal(inst).validateSkeletonHierarchy(); }
export function retargetAnimalSkeleton(inst?: Animal): void { resolveAnimal(inst).retargetAnimalSkeleton(); }

// ============================================================================
// 081–100. Cơ bắp, gân và mô mềm
// ============================================================================

export function initializeAnimalMuscles(inst?: Animal): void { resolveAnimal(inst).initializeAnimalMuscles(); }
export function updateMuscleActivation(muscleId?: string, level?: number, inst?: Animal): void { resolveAnimal(inst).updateMuscleActivation(muscleId, level); }
export function calculateMuscleForce(muscleId?: string, inst?: Animal): number { return resolveAnimal(inst).calculateMuscleForce(muscleId); }
export function calculateMuscleTension(muscleId?: string, inst?: Animal): number { return resolveAnimal(inst).calculateMuscleTension(muscleId); }
export function updateMuscleDeformation(inst?: Animal): void { resolveAnimal(inst).updateMuscleDeformation(); }
export function updateTendonStretch(inst?: Animal): void { resolveAnimal(inst).updateTendonStretch(); }
export function updateLigamentConstraints(inst?: Animal): void { resolveAnimal(inst).updateLigamentConstraints(); }
export function updateSoftTissueMotion(inst?: Animal): void { resolveAnimal(inst).updateSoftTissueMotion(); }
export function updateSkinDeformation(inst?: Animal): void { resolveAnimal(inst).updateSkinDeformation(); }
export function updateFatDistribution(inst?: Animal): void { resolveAnimal(inst).updateFatDistribution(); }
export function updateBodyCompression(inst?: Animal): void { resolveAnimal(inst).updateBodyCompression(); }
export function updateMuscleBulging(inst?: Animal): void { resolveAnimal(inst).updateMuscleBulging(); }
export function updateNeckMuscles(inst?: Animal): void { resolveAnimal(inst).updateNeckMuscles(); }
export function updateBackMuscles(inst?: Animal): void { resolveAnimal(inst).updateBackMuscles(); }
export function updateShoulderMuscles(inst?: Animal): void { resolveAnimal(inst).updateShoulderMuscles(); }
export function updateHipMuscles(inst?: Animal): void { resolveAnimal(inst).updateHipMuscles(); }
export function updateLimbMuscles(inst?: Animal): void { resolveAnimal(inst).updateLimbMuscles(); }
export function updateJawMuscles(inst?: Animal): void { resolveAnimal(inst).updateJawMuscles(); }
export function calculateMusculoskeletalLoad(inst?: Animal): number { return resolveAnimal(inst).calculateMusculoskeletalLoad(); }
export function resolveMuscleConstraints(inst?: Animal): void { resolveAnimal(inst).resolveMuscleConstraints(); }

// ============================================================================
// 101–120. Đầu, hộp sọ và cổ
// ============================================================================

export function updateAnimalHead(inst?: Animal): void { resolveAnimal(inst).updateAnimalHead(); }
export function rotateHeadLeft(angle?: number, inst?: Animal): void { resolveAnimal(inst).rotateHeadLeft(angle); }
export function rotateHeadRight(angle?: number, inst?: Animal): void { resolveAnimal(inst).rotateHeadRight(angle); }
export function tiltHeadUp(angle?: number, inst?: Animal): void { resolveAnimal(inst).tiltHeadUp(angle); }
export function tiltHeadDown(angle?: number, inst?: Animal): void { resolveAnimal(inst).tiltHeadDown(angle); }
export function tiltHeadSideways(angle?: number, inst?: Animal): void { resolveAnimal(inst).tiltHeadSideways(angle); }
export function extendNeck(amount?: number, inst?: Animal): void { resolveAnimal(inst).extendNeck(amount); }
export function retractNeck(amount?: number, inst?: Animal): void { resolveAnimal(inst).retractNeck(amount); }
export function rotateNeck(angle?: number, inst?: Animal): void { resolveAnimal(inst).rotateNeck(angle); }
export function stabilizeHead(inst?: Animal): void { resolveAnimal(inst).stabilizeHead(); }
export function trackHeadTarget(target: any, inst?: Animal): void { resolveAnimal(inst).trackHeadTarget(target); }
export function updateSkullOrientation(inst?: Animal): void { resolveAnimal(inst).updateSkullOrientation(); }
export function updateJawOpening(angle?: number, inst?: Animal): void { resolveAnimal(inst).updateJawOpening(angle); }
export function updateJawClosing(inst?: Animal): void { resolveAnimal(inst).updateJawClosing(); }
export function updateBiteMechanics(inst?: Animal): void { resolveAnimal(inst).updateBiteMechanics(); }
export function updateSnoutMovement(inst?: Animal): void { resolveAnimal(inst).updateSnoutMovement(); }
export function updateMuzzleDeformation(inst?: Animal): void { resolveAnimal(inst).updateMuzzleDeformation(); }
export function updateBeakMovement(inst?: Animal): void { resolveAnimal(inst).updateBeakMovement(); }
export function updateHeadInertia(inst?: Animal): void { resolveAnimal(inst).updateHeadInertia(); }
export function blendHeadAnimations(inst?: Animal): void { resolveAnimal(inst).blendHeadAnimations(); }

// ============================================================================
// 121–140. Mắt, mí mắt và thị giác
// ============================================================================

export function initializeAnimalVision(inst?: Animal): void { resolveAnimal(inst).initializeAnimalVision(); }
export function updateAnimalEyes(inst?: Animal): void { resolveAnimal(inst).updateAnimalEyes(); }
export function lookAtTarget(target: any, inst?: Animal): void { resolveAnimal(inst).lookAtTarget(target); }
export function moveLeftEye(direction: any, inst?: Animal): void { resolveAnimal(inst).moveLeftEye(direction); }
export function moveRightEye(direction: any, inst?: Animal): void { resolveAnimal(inst).moveRightEye(direction); }
export function synchronizeEyeDirection(inst?: Animal): void { resolveAnimal(inst).synchronizeEyeDirection(); }
export function blinkEyes(inst?: Animal): void { resolveAnimal(inst).blinkEyes(); }
export function closeEyes(inst?: Animal): void { resolveAnimal(inst).closeEyes(); }
export function openEyes(inst?: Animal): void { resolveAnimal(inst).openEyes(); }
export function updateEyelids(inst?: Animal): void { resolveAnimal(inst).updateEyelids(); }
export function updatePupilSize(size?: number, inst?: Animal): void { resolveAnimal(inst).updatePupilSize(size); }
export function updatePupilDirection(direction?: any, inst?: Animal): void { resolveAnimal(inst).updatePupilDirection(direction); }
export function trackMovingObject(target: any, inst?: Animal): void { resolveAnimal(inst).trackMovingObject(target); }
export function detectVisualStimulus(inst?: Animal): boolean { return resolveAnimal(inst).detectVisualStimulus(); }
export function calculateVisualField(inst?: Animal): number { return resolveAnimal(inst).calculateVisualField(); }
export function calculateVisualDistance(inst?: Animal): number { return resolveAnimal(inst).calculateVisualDistance(); }
export function detectMotionInVision(inst?: Animal): boolean { return resolveAnimal(inst).detectMotionInVision(); }
export function updateNightVision(enabled?: boolean, inst?: Animal): void { resolveAnimal(inst).updateNightVision(enabled); }
export function updateDepthPerception(inst?: Animal): number { return resolveAnimal(inst).updateDepthPerception(); }
export function updateVisualAttention(inst?: Animal): void { resolveAnimal(inst).updateVisualAttention(); }

// ============================================================================
// 141–160. Tai, thính giác và định vị âm thanh
// ============================================================================

export function initializeAnimalHearing(inst?: Animal): void { resolveAnimal(inst).initializeAnimalHearing(); }
export function updateAnimalEars(inst?: Animal): void { resolveAnimal(inst).updateAnimalEars(); }
export function rotateLeftEar(angle?: number, inst?: Animal): void { resolveAnimal(inst).rotateLeftEar(angle); }
export function rotateRightEar(angle?: number, inst?: Animal): void { resolveAnimal(inst).rotateRightEar(angle); }
export function raiseEars(inst?: Animal): void { resolveAnimal(inst).raiseEars(); }
export function flattenEars(inst?: Animal): void { resolveAnimal(inst).flattenEars(); }
export function twitchEars(inst?: Animal): void { resolveAnimal(inst).twitchEars(); }
export function detectAuditoryStimulus(inst?: Animal): boolean { return resolveAnimal(inst).detectAuditoryStimulus(); }
export function calculateSoundDirection(pos: any, inst?: Animal): any { return resolveAnimal(inst).calculateSoundDirection(pos); }
export function calculateSoundDistance(pos: any, inst?: Animal): number { return resolveAnimal(inst).calculateSoundDistance(pos); }
export function localizeSoundSource(pos: any, inst?: Animal): void { resolveAnimal(inst).localizeSoundSource(pos); }
export function filterEnvironmentalNoise(inst?: Animal): void { resolveAnimal(inst).filterEnvironmentalNoise(); }
export function detectHighFrequencySound(inst?: Animal): boolean { return resolveAnimal(inst).detectHighFrequencySound(); }
export function detectLowFrequencySound(inst?: Animal): boolean { return resolveAnimal(inst).detectLowFrequencySound(); }
export function updateAuditoryAttention(inst?: Animal): void { resolveAnimal(inst).updateAuditoryAttention(); }
export function reactToLoudNoise(inst?: Animal): void { resolveAnimal(inst).reactToLoudNoise(); }
export function reactToFamiliarSound(inst?: Animal): void { resolveAnimal(inst).reactToFamiliarSound(); }
export function synchronizeEarMovement(inst?: Animal): void { resolveAnimal(inst).synchronizeEarMovement(); }
export function updateAuditoryMemory(inst?: Animal): void { resolveAnimal(inst).updateAuditoryMemory(); }
export function blendEarAnimations(inst?: Animal): void { resolveAnimal(inst).blendEarAnimations(); }

// ============================================================================
// 161–180. Mũi, khứu giác và cảm nhận hóa học
// ============================================================================

export function initializeAnimalOlfaction(inst?: Animal): void { resolveAnimal(inst).initializeAnimalOlfaction(); }
export function updateAnimalNose(inst?: Animal): void { resolveAnimal(inst).updateAnimalNose(); }
export function sniffAir(inst?: Animal): void { resolveAnimal(inst).sniffAir(); }
export function sniffGround(inst?: Animal): void { resolveAnimal(inst).sniffGround(); }
export function sniffObject(obj: any, inst?: Animal): void { resolveAnimal(inst).sniffObject(obj); }
export function detectScent(scent: any, inst?: Animal): boolean { return resolveAnimal(inst).detectScent(scent); }
export function analyzeScentComposition(inst?: Animal): string { return resolveAnimal(inst).analyzeScentComposition(); }
export function trackScentTrail(trail: any, inst?: Animal): void { resolveAnimal(inst).trackScentTrail(trail); }
export function followScentSource(source: any, inst?: Animal): void { resolveAnimal(inst).followScentSource(source); }
export function distinguishFamiliarScent(scent: any, inst?: Animal): boolean { return resolveAnimal(inst).distinguishFamiliarScent(scent); }
export function detectFoodOdor(inst?: Animal): boolean { return resolveAnimal(inst).detectFoodOdor(); }
export function detectPredatorOdor(inst?: Animal): boolean { return resolveAnimal(inst).detectPredatorOdor(); }
export function detectMateOdor(inst?: Animal): boolean { return resolveAnimal(inst).detectMateOdor(); }
export function detectTerritoryScent(inst?: Animal): boolean { return resolveAnimal(inst).detectTerritoryScent(); }
export function updateNostrilMovement(inst?: Animal): void { resolveAnimal(inst).updateNostrilMovement(); }
export function updateOlfactoryMemory(inst?: Animal): void { resolveAnimal(inst).updateOlfactoryMemory(); }
export function detectChemicalStimulus(inst?: Animal): boolean { return resolveAnimal(inst).detectChemicalStimulus(); }
export function compareScentIntensity(inst?: Animal): number { return resolveAnimal(inst).compareScentIntensity(); }
export function updateScentInvestigation(inst?: Animal): void { resolveAnimal(inst).updateScentInvestigation(); }
export function blendSniffingAnimation(inst?: Animal): void { resolveAnimal(inst).blendSniffingAnimation(); }

// ============================================================================
// 181–200. Miệng, lưỡi, răng và thức ăn
// ============================================================================

export function initializeAnimalMouth(inst?: Animal): void { resolveAnimal(inst).initializeAnimalMouth(); }
export function openAnimalMouth(inst?: Animal): void { resolveAnimal(inst).openAnimalMouth(); }
export function closeAnimalMouth(inst?: Animal): void { resolveAnimal(inst).closeAnimalMouth(); }
export function extendTongue(inst?: Animal): void { resolveAnimal(inst).extendTongue(); }
export function retractTongue(inst?: Animal): void { resolveAnimal(inst).retractTongue(); }
export function lickNose(inst?: Animal): void { resolveAnimal(inst).lickNose(); }
export function lickFur(inst?: Animal): void { resolveAnimal(inst).lickFur(); }
export function lickPaw(inst?: Animal): void { resolveAnimal(inst).lickPaw(); }
export function lickWaterSurface(inst?: Animal): void { resolveAnimal(inst).lickWaterSurface(); }
export function exposeTeeth(inst?: Animal): void { resolveAnimal(inst).exposeTeeth(); }
export function updateToothDisplay(inst?: Animal): void { resolveAnimal(inst).updateToothDisplay(); }
export function biteFood(food: any, inst?: Animal): void { resolveAnimal(inst).biteFood(food); }
export function gripFoodWithMouth(food: any, inst?: Animal): void { resolveAnimal(inst).gripFoodWithMouth(food); }
export function chewFood(inst?: Animal): void { resolveAnimal(inst).chewFood(); }
export function swallowFood(inst?: Animal): void { resolveAnimal(inst).swallowFood(); }
export function regurgitateFood(inst?: Animal): void { resolveAnimal(inst).regurgitateFood(); }
export function updateSalivation(inst?: Animal): void { resolveAnimal(inst).updateSalivation(); }
export function updateJawCycle(inst?: Animal): void { resolveAnimal(inst).updateJawCycle(); }
export function animateTongueMovement(inst?: Animal): void { resolveAnimal(inst).animateTongueMovement(); }
export function coordinateEatingMotion(inst?: Animal): void { resolveAnimal(inst).coordinateEatingMotion(); }

// ============================================================================
// 201–220. Động vật có vú: bộ xương và thân thể
// ============================================================================

export function initializeMammalSkeleton(inst?: Animal): void { resolveAnimal(inst).initializeMammalSkeleton(); }
export function updateMammalSpine(inst?: Animal): void { resolveAnimal(inst).updateMammalSpine(); }
export function updateMammalRibCage(inst?: Animal): void { resolveAnimal(inst).updateMammalRibCage(); }
export function updateMammalPelvis(inst?: Animal): void { resolveAnimal(inst).updateMammalPelvis(); }
export function updateMammalShoulderGirdle(inst?: Animal): void { resolveAnimal(inst).updateMammalShoulderGirdle(); }
export function updateMammalForelimbs(inst?: Animal): void { resolveAnimal(inst).updateMammalForelimbs(); }
export function updateMammalHindlimbs(inst?: Animal): void { resolveAnimal(inst).updateMammalHindlimbs(); }
export function updateMammalNeck(inst?: Animal): void { resolveAnimal(inst).updateMammalNeck(); }
export function updateMammalTail(inst?: Animal): void { resolveAnimal(inst).updateMammalTail(); }
export function updateMammalPaws(inst?: Animal): void { resolveAnimal(inst).updateMammalPaws(); }
export function updateMammalClaws(inst?: Animal): void { resolveAnimal(inst).updateMammalClaws(); }
export function updateMammalDigits(inst?: Animal): void { resolveAnimal(inst).updateMammalDigits(); }
export function updateMammalJointLimits(inst?: Animal): void { resolveAnimal(inst).updateMammalJointLimits(); }
export function updateMammalBodyFlexion(inst?: Animal): void { resolveAnimal(inst).updateMammalBodyFlexion(); }
export function updateMammalSpinalRotation(inst?: Animal): void { resolveAnimal(inst).updateMammalSpinalRotation(); }
export function calculateMammalStride(inst?: Animal): number { return resolveAnimal(inst).calculateMammalStride(); }
export function calculateMammalLimbReach(inst?: Animal): number { return resolveAnimal(inst).calculateMammalLimbReach(); }
export function maintainMammalPosture(inst?: Animal): void { resolveAnimal(inst).maintainMammalPosture(); }
export function updateMammalMuscleRig(inst?: Animal): void { resolveAnimal(inst).updateMammalMuscleRig(); }
export function blendMammalLocomotion(inst?: Animal): void { resolveAnimal(inst).blendMammalLocomotion(); }

// ============================================================================
// 221–240. Động vật có vú: đi, chạy và nhảy
// ============================================================================

export function walkOnFourLegs(inst?: Animal): void { resolveAnimal(inst).walkOnFourLegs(); }
export function walkOnTwoLegs(inst?: Animal): void { resolveAnimal(inst).walkOnTwoLegs(); }
export function trotOnFourLegs(inst?: Animal): void { resolveAnimal(inst).trotOnFourLegs(); }
export function gallopOnFourLegs(inst?: Animal): void { resolveAnimal(inst).gallopOnFourLegs(); }
export function canterOnFourLegs(inst?: Animal): void { resolveAnimal(inst).canterOnFourLegs(); }
export function runOnFourLegs(inst?: Animal): void { resolveAnimal(inst).runOnFourLegs(); }
export function sprintOnFourLegs(inst?: Animal): void { resolveAnimal(inst).sprintOnFourLegs(); }
export function boundForward(inst?: Animal): void { resolveAnimal(inst).boundForward(); }
export function leapForward(inst?: Animal): void { resolveAnimal(inst).leapForward(); }
export function jumpVertically(inst?: Animal): void { resolveAnimal(inst).jumpVertically(); }
export function hopOnHindLegs(inst?: Animal): void { resolveAnimal(inst).hopOnHindLegs(); }
export function shuffleSideways(inst?: Animal): void { resolveAnimal(inst).shuffleSideways(); }
export function backAway(inst?: Animal): void { resolveAnimal(inst).backAway(); }
export function turnWhileWalking(inst?: Animal): void { resolveAnimal(inst).turnWhileWalking(); }
export function turnWhileRunning(inst?: Animal): void { resolveAnimal(inst).turnWhileRunning(); }
export function stopWithMomentum(inst?: Animal): void { resolveAnimal(inst).stopWithMomentum(); }
export function accelerateMammal(inst?: Animal): void { resolveAnimal(inst).accelerateMammal(); }
export function decelerateMammal(inst?: Animal): void { resolveAnimal(inst).decelerateMammal(); }
export function recoverFromJump(inst?: Animal): void { resolveAnimal(inst).recoverFromJump(); }
export function transitionGait(inst?: Animal): void { resolveAnimal(inst).transitionGait(); }

// ============================================================================
// 241–260. Động vật có vú: bàn chân và dáng đi
// ============================================================================

export function plantFrontLeftFoot(inst?: Animal): void { resolveAnimal(inst).plantFrontLeftFoot(); }
export function plantFrontRightFoot(inst?: Animal): void { resolveAnimal(inst).plantFrontRightFoot(); }
export function plantRearLeftFoot(inst?: Animal): void { resolveAnimal(inst).plantRearLeftFoot(); }
export function plantRearRightFoot(inst?: Animal): void { resolveAnimal(inst).plantRearRightFoot(); }
export function liftFrontLeftFoot(inst?: Animal): void { resolveAnimal(inst).liftFrontLeftFoot(); }
export function liftFrontRightFoot(inst?: Animal): void { resolveAnimal(inst).liftFrontRightFoot(); }
export function liftRearLeftFoot(inst?: Animal): void { resolveAnimal(inst).liftRearLeftFoot(); }
export function liftRearRightFoot(inst?: Animal): void { resolveAnimal(inst).liftRearRightFoot(); }
export function rollPawDuringStep(inst?: Animal): void { resolveAnimal(inst).rollPawDuringStep(); }
export function spreadPawDigits(inst?: Animal): void { resolveAnimal(inst).spreadPawDigits(); }
export function curlPawDigits(inst?: Animal): void { resolveAnimal(inst).curlPawDigits(); }
export function extendClaws(inst?: Animal): void { resolveAnimal(inst).extendClaws(); }
export function retractClaws(inst?: Animal): void { resolveAnimal(inst).retractClaws(); }
export function adjustPawGrip(inst?: Animal): void { resolveAnimal(inst).adjustPawGrip(); }
export function adaptPawsToTerrain(inst?: Animal): void { resolveAnimal(inst).adaptPawsToTerrain(); }
export function stabilizePawContact(inst?: Animal): void { resolveAnimal(inst).stabilizePawContact(); }
export function preventPawSliding(inst?: Animal): void { resolveAnimal(inst).preventPawSliding(); }
export function synchronizeDiagonalGait(inst?: Animal): void { resolveAnimal(inst).synchronizeDiagonalGait(); }
export function synchronizeLateralGait(inst?: Animal): void { resolveAnimal(inst).synchronizeLateralGait(); }
export function updatePawPressure(inst?: Animal): void { resolveAnimal(inst).updatePawPressure(); }

// ============================================================================
// 261–280. Động vật có vú: hoạt động thường ngày
// ============================================================================

export function sitLikeMammal(inst?: Animal): void { resolveAnimal(inst).sitLikeMammal(); }
export function standFromSitting(inst?: Animal): void { resolveAnimal(inst).standFromSitting(); }
export function lieDownLikeMammal(inst?: Animal): void { resolveAnimal(inst).lieDownLikeMammal(); }
export function standFromLying(inst?: Animal): void { resolveAnimal(inst).standFromLying(); }
export function rollOnGround(inst?: Animal): void { resolveAnimal(inst).rollOnGround(); }
export function stretchMammalBody(inst?: Animal): void { resolveAnimal(inst).stretchMammalBody(); }
export function shakeWholeBody(inst?: Animal): void { resolveAnimal(inst).shakeWholeBody(); }
export function shakeHeadAndNeck(inst?: Animal): void { resolveAnimal(inst).shakeHeadAndNeck(); }
export function scratchWithHindLeg(inst?: Animal): void { resolveAnimal(inst).scratchWithHindLeg(); }
export function scratchWithForepaw(inst?: Animal): void { resolveAnimal(inst).scratchWithForepaw(); }
export function groomFur(inst?: Animal): void { resolveAnimal(inst).groomFur(); }
export function groomAnotherAnimal(target: any, inst?: Animal): void { resolveAnimal(inst).groomAnotherAnimal(target); }
export function cleanFaceWithPaw(inst?: Animal): void { resolveAnimal(inst).cleanFaceWithPaw(); }
export function rubBodyAgainstObject(obj: any, inst?: Animal): void { resolveAnimal(inst).rubBodyAgainstObject(obj); }
export function sniffGroundWhileWalking(inst?: Animal): void { resolveAnimal(inst).sniffGroundWhileWalking(); }
export function raiseBodyToInvestigate(inst?: Animal): void { resolveAnimal(inst).raiseBodyToInvestigate(); }
export function lowerBodyToRest(inst?: Animal): void { resolveAnimal(inst).lowerBodyToRest(); }
export function playBow(inst?: Animal): void { resolveAnimal(inst).playBow(); }
export function shakeOffWater(inst?: Animal): void { resolveAnimal(inst).shakeOffWater(); }
export function performMammalIdleMotion(inst?: Animal): void { resolveAnimal(inst).performMammalIdleMotion(); }

// ============================================================================
// 281–300. Chim: bộ xương, cánh và lông vũ
// ============================================================================

export function initializeBirdSkeleton(inst?: Animal): void { resolveAnimal(inst).initializeBirdSkeleton(); }
export function updateBirdSpine(inst?: Animal): void { resolveAnimal(inst).updateBirdSpine(); }
export function updateBirdNeck(inst?: Animal): void { resolveAnimal(inst).updateBirdNeck(); }
export function updateBirdSkull(inst?: Animal): void { resolveAnimal(inst).updateBirdSkull(); }
export function updateBirdSternum(inst?: Animal): void { resolveAnimal(inst).updateBirdSternum(); }
export function updateBirdKeel(inst?: Animal): void { resolveAnimal(inst).updateBirdKeel(); }
export function updateBirdShoulderJoint(inst?: Animal): void { resolveAnimal(inst).updateBirdShoulderJoint(); }
export function updateBirdElbowJoint(inst?: Animal): void { resolveAnimal(inst).updateBirdElbowJoint(); }
export function updateBirdWristJoint(inst?: Animal): void { resolveAnimal(inst).updateBirdWristJoint(); }
export function updateBirdWingBones(inst?: Animal): void { resolveAnimal(inst).updateBirdWingBones(); }
export function updateBirdLegBones(inst?: Animal): void { resolveAnimal(inst).updateBirdLegBones(); }
export function updateBirdToeBones(inst?: Animal): void { resolveAnimal(inst).updateBirdToeBones(); }
export function updateBirdTailBones(inst?: Animal): void { resolveAnimal(inst).updateBirdTailBones(); }
export function updatePrimaryFeathers(inst?: Animal): void { resolveAnimal(inst).updatePrimaryFeathers(); }
export function updateSecondaryFeathers(inst?: Animal): void { resolveAnimal(inst).updateSecondaryFeathers(); }
export function updateTailFeathers(inst?: Animal): void { resolveAnimal(inst).updateTailFeathers(); }
export function spreadWingFeathers(inst?: Animal): void { resolveAnimal(inst).spreadWingFeathers(); }
export function foldWingFeathers(inst?: Animal): void { resolveAnimal(inst).foldWingFeathers(); }
export function ruffleBodyFeathers(inst?: Animal): void { resolveAnimal(inst).ruffleBodyFeathers(); }
export function preenIndividualFeathers(inst?: Animal): void { resolveAnimal(inst).preenIndividualFeathers(); }

// ============================================================================
// 301–320. Chim: vỗ cánh và bay
// ============================================================================

export function initializeBirdFlight(inst?: Animal): void { resolveAnimal(inst).initializeBirdFlight(); }
export function spreadWings(inst?: Animal): void { resolveAnimal(inst).spreadWings(); }
export function foldWings(inst?: Animal): void { resolveAnimal(inst).foldWings(); }
export function flapWings(inst?: Animal): void { resolveAnimal(inst).flapWings(); }
export function performUpstroke(inst?: Animal): void { resolveAnimal(inst).performUpstroke(); }
export function performDownstroke(inst?: Animal): void { resolveAnimal(inst).performDownstroke(); }
export function adjustWingAmplitude(amp?: number, inst?: Animal): void { resolveAnimal(inst).adjustWingAmplitude(amp); }
export function adjustWingFrequency(freq?: number, inst?: Animal): void { resolveAnimal(inst).adjustWingFrequency(freq); }
export function glideForward(inst?: Animal): void { resolveAnimal(inst).glideForward(); }
export function soarOnThermals(inst?: Animal): void { resolveAnimal(inst).soarOnThermals(); }
export function diveTowardTarget(target: any, inst?: Animal): void { resolveAnimal(inst).diveTowardTarget(target); }
export function climbDuringFlight(inst?: Animal): void { resolveAnimal(inst).climbDuringFlight(); }
export function bankLeftDuringFlight(inst?: Animal): void { resolveAnimal(inst).bankLeftDuringFlight(); }
export function bankRightDuringFlight(inst?: Animal): void { resolveAnimal(inst).bankRightDuringFlight(); }
export function brakeWithWings(inst?: Animal): void { resolveAnimal(inst).brakeWithWings(); }
export function hoverLikeBird(inst?: Animal): void { resolveAnimal(inst).hoverLikeBird(); }
export function takeOffFromGround(inst?: Animal): void { resolveAnimal(inst).takeOffFromGround(); }
export function takeOffFromWater(inst?: Animal): void { resolveAnimal(inst).takeOffFromWater(); }
export function landOnGround(inst?: Animal): void { resolveAnimal(inst).landOnGround(); }
export function landOnBranch(branch: any, inst?: Animal): void { resolveAnimal(inst).landOnBranch(branch); }

// ============================================================================
// 321–340. Chim: đậu, đi, kiếm ăn và giao tiếp
// ============================================================================

export function perchOnBranch(branch: any, inst?: Animal): void { resolveAnimal(inst).perchOnBranch(branch); }
export function releasePerchGrip(inst?: Animal): void { resolveAnimal(inst).releasePerchGrip(); }
export function adjustPerchingBalance(inst?: Animal): void { resolveAnimal(inst).adjustPerchingBalance(); }
export function walkLikeBird(inst?: Animal): void { resolveAnimal(inst).walkLikeBird(); }
export function hopLikeBird(inst?: Animal): void { resolveAnimal(inst).hopLikeBird(); }
export function runLikeBird(inst?: Animal): void { resolveAnimal(inst).runLikeBird(); }
export function peckAtGround(inst?: Animal): void { resolveAnimal(inst).peckAtGround(); }
export function peckAtFood(food: any, inst?: Animal): void { resolveAnimal(inst).peckAtFood(food); }
export function probeWithBeak(target: any, inst?: Animal): void { resolveAnimal(inst).probeWithBeak(target); }
export function scoopFoodWithBeak(food: any, inst?: Animal): void { resolveAnimal(inst).scoopFoodWithBeak(food); }
export function swallowPrey(prey: any, inst?: Animal): void { resolveAnimal(inst).swallowPrey(prey); }
export function drinkLikeBird(inst?: Animal): void { resolveAnimal(inst).drinkLikeBird(); }
export function preenFeathers(inst?: Animal): void { resolveAnimal(inst).preenFeathers(); }
export function cleanBeak(inst?: Animal): void { resolveAnimal(inst).cleanBeak(); }
export function scratchHeadWithFoot(inst?: Animal): void { resolveAnimal(inst).scratchHeadWithFoot(); }
export function fluffBodyFeathers(inst?: Animal): void { resolveAnimal(inst).fluffBodyFeathers(); }
export function performCourtshipDisplay(inst?: Animal): void { resolveAnimal(inst).performCourtshipDisplay(); }
export function spreadTailDisplay(inst?: Animal): void { resolveAnimal(inst).spreadTailDisplay(); }
export function bobHeadLikeBird(inst?: Animal): void { resolveAnimal(inst).bobHeadLikeBird(); }
export function coordinateBirdVocalization(inst?: Animal): void { resolveAnimal(inst).coordinateBirdVocalization(); }

// ============================================================================
// 341–360. Cá: bộ xương, thân và vây
// ============================================================================

export function initializeFishSkeleton(inst?: Animal): void { resolveAnimal(inst).initializeFishSkeleton(); }
export function updateFishSpine(inst?: Animal): void { resolveAnimal(inst).updateFishSpine(); }
export function updateFishVertebrae(inst?: Animal): void { resolveAnimal(inst).updateFishVertebrae(); }
export function updateFishSkull(inst?: Animal): void { resolveAnimal(inst).updateFishSkull(); }
export function updateFishJaw(inst?: Animal): void { resolveAnimal(inst).updateFishJaw(); }
export function updateFishRibStructure(inst?: Animal): void { resolveAnimal(inst).updateFishRibStructure(); }
export function updateFishTailBase(inst?: Animal): void { resolveAnimal(inst).updateFishTailBase(); }
export function updateCaudalFin(inst?: Animal): void { resolveAnimal(inst).updateCaudalFin(); }
export function updateDorsalFin(inst?: Animal): void { resolveAnimal(inst).updateDorsalFin(); }
export function updateAnalFin(inst?: Animal): void { resolveAnimal(inst).updateAnalFin(); }
export function updatePectoralFins(inst?: Animal): void { resolveAnimal(inst).updatePectoralFins(); }
export function updatePelvicFins(inst?: Animal): void { resolveAnimal(inst).updatePelvicFins(); }
export function spreadFinRays(inst?: Animal): void { resolveAnimal(inst).spreadFinRays(); }
export function foldFinRays(inst?: Animal): void { resolveAnimal(inst).foldFinRays(); }
export function undulateFishBody(inst?: Animal): void { resolveAnimal(inst).undulateFishBody(); }
export function bendFishSpine(inst?: Animal): void { resolveAnimal(inst).bendFishSpine(); }
export function twistFishBody(inst?: Animal): void { resolveAnimal(inst).twistFishBody(); }
export function stabilizeFishHead(inst?: Animal): void { resolveAnimal(inst).stabilizeFishHead(); }
export function updateFishScalePattern(inst?: Animal): void { resolveAnimal(inst).updateFishScalePattern(); }
export function blendFishBodyMotion(inst?: Animal): void { resolveAnimal(inst).blendFishBodyMotion(); }

// ============================================================================
// 361–380. Cá: bơi, lặn và điều khiển độ nổi
// ============================================================================

export function initializeFishLocomotion(inst?: Animal): void { resolveAnimal(inst).initializeFishLocomotion(); }
export function swimForward(inst?: Animal): void { resolveAnimal(inst).swimForward(); }
export function swimBackward(inst?: Animal): void { resolveAnimal(inst).swimBackward(); }
export function swimSlowly(inst?: Animal): void { resolveAnimal(inst).swimSlowly(); }
export function swimRapidly(inst?: Animal): void { resolveAnimal(inst).swimRapidly(); }
export function accelerateFish(inst?: Animal): void { resolveAnimal(inst).accelerateFish(); }
export function decelerateFish(inst?: Animal): void { resolveAnimal(inst).decelerateFish(); }
export function turnFishLeft(inst?: Animal): void { resolveAnimal(inst).turnFishLeft(); }
export function turnFishRight(inst?: Animal): void { resolveAnimal(inst).turnFishRight(); }
export function performTightTurn(inst?: Animal): void { resolveAnimal(inst).performTightTurn(); }
export function swimVerticallyUpward(inst?: Animal): void { resolveAnimal(inst).swimVerticallyUpward(); }
export function swimVerticallyDownward(inst?: Animal): void { resolveAnimal(inst).swimVerticallyDownward(); }
export function maintainSwimmingDepth(inst?: Animal): void { resolveAnimal(inst).maintainSwimmingDepth(); }
export function maintainNeutralBuoyancy(inst?: Animal): void { resolveAnimal(inst).maintainNeutralBuoyancy(); }
export function diveTowardBottom(inst?: Animal): void { resolveAnimal(inst).diveTowardBottom(); }
export function riseTowardSurface(inst?: Animal): void { resolveAnimal(inst).riseTowardSurface(); }
export function hoverInWater(inst?: Animal): void { resolveAnimal(inst).hoverInWater(); }
export function swimAgainstCurrent(inst?: Animal): void { resolveAnimal(inst).swimAgainstCurrent(); }
export function glideWithCurrent(inst?: Animal): void { resolveAnimal(inst).glideWithCurrent(); }
export function avoidAquaticObstacle(inst?: Animal): void { resolveAnimal(inst).avoidAquaticObstacle(); }

// ============================================================================
// 381–400. Cá: mang, miệng và hành vi dưới nước
// ============================================================================

export function initializeFishRespiration(inst?: Animal): void { resolveAnimal(inst).initializeFishRespiration(); }
export function openGillCovers(inst?: Animal): void { resolveAnimal(inst).openGillCovers(); }
export function closeGillCovers(inst?: Animal): void { resolveAnimal(inst).closeGillCovers(); }
export function pumpWaterAcrossGills(inst?: Animal): void { resolveAnimal(inst).pumpWaterAcrossGills(); }
export function regulateGillMovement(inst?: Animal): void { resolveAnimal(inst).regulateGillMovement(); }
export function openFishMouth(inst?: Animal): void { resolveAnimal(inst).openFishMouth(); }
export function closeFishMouth(inst?: Animal): void { resolveAnimal(inst).closeFishMouth(); }
export function flareFishGills(inst?: Animal): void { resolveAnimal(inst).flareFishGills(); }
export function detectWaterMovement(inst?: Animal): boolean { return resolveAnimal(inst).detectWaterMovement(); }
export function detectWaterPressure(inst?: Animal): number { return resolveAnimal(inst).detectWaterPressure(); }
export function senseWaterTemperature(inst?: Animal): number { return resolveAnimal(inst).senseWaterTemperature(); }
export function detectWaterborneChemicals(inst?: Animal): boolean { return resolveAnimal(inst).detectWaterborneChemicals(); }
export function schoolWithNearbyFish(inst?: Animal): void { resolveAnimal(inst).schoolWithNearbyFish(); }
export function maintainSchoolSpacing(inst?: Animal): void { resolveAnimal(inst).maintainSchoolSpacing(); }
export function pursueAquaticPrey(prey: any, inst?: Animal): void { resolveAnimal(inst).pursueAquaticPrey(prey); }
export function captureAquaticPrey(prey: any, inst?: Animal): void { resolveAnimal(inst).captureAquaticPrey(prey); }
export function grazeAquaticPlants(plants: any, inst?: Animal): void { resolveAnimal(inst).grazeAquaticPlants(plants); }
export function inspectAquaticObject(obj: any, inst?: Animal): void { resolveAnimal(inst).inspectAquaticObject(obj); }
export function restNearAquaticSubstrate(inst?: Animal): void { resolveAnimal(inst).restNearAquaticSubstrate(); }
export function performFishIdleMotion(inst?: Animal): void { resolveAnimal(inst).performFishIdleMotion(); }

// ============================================================================
// 401–420. Bò sát: bộ xương và cấu trúc cơ thể
// ============================================================================

export function initializeReptileSkeleton(inst?: Animal): void { resolveAnimal(inst).initializeReptileSkeleton(); }
export function updateReptileSpine(inst?: Animal): void { resolveAnimal(inst).updateReptileSpine(); }
export function updateReptileVertebrae(inst?: Animal): void { resolveAnimal(inst).updateReptileVertebrae(); }
export function updateReptileRibCage(inst?: Animal): void { resolveAnimal(inst).updateReptileRibCage(); }
export function updateReptileSkull(inst?: Animal): void { resolveAnimal(inst).updateReptileSkull(); }
export function updateReptileJaw(inst?: Animal): void { resolveAnimal(inst).updateReptileJaw(); }
export function updateReptileShoulderGirdle(inst?: Animal): void { resolveAnimal(inst).updateReptileShoulderGirdle(); }
export function updateReptilePelvis(inst?: Animal): void { resolveAnimal(inst).updateReptilePelvis(); }
export function updateReptileLimbs(inst?: Animal): void { resolveAnimal(inst).updateReptileLimbs(); }
export function updateReptileDigits(inst?: Animal): void { resolveAnimal(inst).updateReptileDigits(); }
export function updateReptileClaws(inst?: Animal): void { resolveAnimal(inst).updateReptileClaws(); }
export function updateReptileTail(inst?: Animal): void { resolveAnimal(inst).updateReptileTail(); }
export function updateReptileScales(inst?: Animal): void { resolveAnimal(inst).updateReptileScales(); }
export function updateReptileScutePattern(inst?: Animal): void { resolveAnimal(inst).updateReptileScutePattern(); }
export function updateReptileBodyFlexion(inst?: Animal): void { resolveAnimal(inst).updateReptileBodyFlexion(); }
export function updateReptileSpinalWave(inst?: Animal): void { resolveAnimal(inst).updateReptileSpinalWave(); }
export function updateReptileJointLimits(inst?: Animal): void { resolveAnimal(inst).updateReptileJointLimits(); }
export function calculateReptileStride(inst?: Animal): number { return resolveAnimal(inst).calculateReptileStride(); }
export function stabilizeReptileBody(inst?: Animal): void { resolveAnimal(inst).stabilizeReptileBody(); }
export function blendReptileLocomotion(inst?: Animal): void { resolveAnimal(inst).blendReptileLocomotion(); }

// ============================================================================
// 421–440. Bò sát: bò, leo và di chuyển
// ============================================================================

export function crawlLikeLizard(inst?: Animal): void { resolveAnimal(inst).crawlLikeLizard(); }
export function walkLikeLizard(inst?: Animal): void { resolveAnimal(inst).walkLikeLizard(); }
export function runLikeLizard(inst?: Animal): void { resolveAnimal(inst).runLikeLizard(); }
export function climbVerticalSurface(inst?: Animal): void { resolveAnimal(inst).climbVerticalSurface(); }
export function gripSurfaceWithDigits(inst?: Animal): void { resolveAnimal(inst).gripSurfaceWithDigits(); }
export function releaseSurfaceGrip(inst?: Animal): void { resolveAnimal(inst).releaseSurfaceGrip(); }
export function flattenBodyAgainstGround(inst?: Animal): void { resolveAnimal(inst).flattenBodyAgainstGround(); }
export function raiseBodyFromGround(inst?: Animal): void { resolveAnimal(inst).raiseBodyFromGround(); }
export function slitherLikeSnake(inst?: Animal): void { resolveAnimal(inst).slitherLikeSnake(); }
export function performLateralUndulation(inst?: Animal): void { resolveAnimal(inst).performLateralUndulation(); }
export function performConcertinaLocomotion(inst?: Animal): void { resolveAnimal(inst).performConcertinaLocomotion(); }
export function performRectilinearLocomotion(inst?: Animal): void { resolveAnimal(inst).performRectilinearLocomotion(); }
export function performSidewinding(inst?: Animal): void { resolveAnimal(inst).performSidewinding(); }
export function anchorSnakeBody(inst?: Animal): void { resolveAnimal(inst).anchorSnakeBody(); }
export function extendSnakeBodyForward(inst?: Animal): void { resolveAnimal(inst).extendSnakeBodyForward(); }
export function contractSnakeBody(inst?: Animal): void { resolveAnimal(inst).contractSnakeBody(); }
export function strikeAtTarget(target: any, inst?: Animal): void { resolveAnimal(inst).strikeAtTarget(target); }
export function recoilAfterStrike(inst?: Animal): void { resolveAnimal(inst).recoilAfterStrike(); }
export function coilSnakeBody(inst?: Animal): void { resolveAnimal(inst).coilSnakeBody(); }
export function uncoilSnakeBody(inst?: Animal): void { resolveAnimal(inst).uncoilSnakeBody(); }

// ============================================================================
// 441–460. Bò sát: lưỡi, hàm, phơi nắng và hành vi
// ============================================================================

export function flickReptileTongue(inst?: Animal): void { resolveAnimal(inst).flickReptileTongue(); }
export function retractReptileTongue(inst?: Animal): void { resolveAnimal(inst).retractReptileTongue(); }
export function sampleAirWithTongue(inst?: Animal): void { resolveAnimal(inst).sampleAirWithTongue(); }
export function openReptileJaw(inst?: Animal): void { resolveAnimal(inst).openReptileJaw(); }
export function closeReptileJaw(inst?: Animal): void { resolveAnimal(inst).closeReptileJaw(); }
export function performJawGape(inst?: Animal): void { resolveAnimal(inst).performJawGape(); }
export function captureReptilePrey(prey: any, inst?: Animal): void { resolveAnimal(inst).captureReptilePrey(prey); }
export function swallowReptilePrey(prey: any, inst?: Animal): void { resolveAnimal(inst).swallowReptilePrey(prey); }
export function regulateBodyTemperature(inst?: Animal): void { resolveAnimal(inst).regulateBodyTemperature(); }
export function baskInSunlight(inst?: Animal): void { resolveAnimal(inst).baskInSunlight(); }
export function seekShade(inst?: Animal): void { resolveAnimal(inst).seekShade(); }
export function burrowLikeReptile(inst?: Animal): void { resolveAnimal(inst).burrowLikeReptile(); }
export function hideUnderCover(inst?: Animal): void { resolveAnimal(inst).hideUnderCover(); }
export function shedReptileSkin(inst?: Animal): void { resolveAnimal(inst).shedReptileSkin(); }
export function performDefensiveDisplay(inst?: Animal): void { resolveAnimal(inst).performDefensiveDisplay(); }
export function flattenNeckFrill(inst?: Animal): void { resolveAnimal(inst).flattenNeckFrill(); }
export function expandNeckFrill(inst?: Animal): void { resolveAnimal(inst).expandNeckFrill(); }
export function inflateDefensiveBody(inst?: Animal): void { resolveAnimal(inst).inflateDefensiveBody(); }
export function tailAutotomyResponse(inst?: Animal): void { resolveAnimal(inst).tailAutotomyResponse(); }
export function performReptileIdleMotion(inst?: Animal): void { resolveAnimal(inst).performReptileIdleMotion(); }

// ============================================================================
// 461–480. Lưỡng cư: cấu trúc và bộ xương
// ============================================================================

export function initializeAmphibianSkeleton(inst?: Animal): void { resolveAnimal(inst).initializeAmphibianSkeleton(); }
export function updateAmphibianSpine(inst?: Animal): void { resolveAnimal(inst).updateAmphibianSpine(); }
export function updateAmphibianSkull(inst?: Animal): void { resolveAnimal(inst).updateAmphibianSkull(); }
export function updateAmphibianJaw(inst?: Animal): void { resolveAnimal(inst).updateAmphibianJaw(); }
export function updateAmphibianShoulders(inst?: Animal): void { resolveAnimal(inst).updateAmphibianShoulders(); }
export function updateAmphibianPelvis(inst?: Animal): void { resolveAnimal(inst).updateAmphibianPelvis(); }
export function updateAmphibianForelimbs(inst?: Animal): void { resolveAnimal(inst).updateAmphibianForelimbs(); }
export function updateAmphibianHindlimbs(inst?: Animal): void { resolveAnimal(inst).updateAmphibianHindlimbs(); }
export function updateAmphibianDigits(inst?: Animal): void { resolveAnimal(inst).updateAmphibianDigits(); }
export function updateAmphibianWebbing(inst?: Animal): void { resolveAnimal(inst).updateAmphibianWebbing(); }
export function updateAmphibianTail(inst?: Animal): void { resolveAnimal(inst).updateAmphibianTail(); }
export function updateAmphibianSkin(inst?: Animal): void { resolveAnimal(inst).updateAmphibianSkin(); }
export function updateAmphibianMoisture(inst?: Animal): void { resolveAnimal(inst).updateAmphibianMoisture(); }
export function updateAmphibianBodyFlexion(inst?: Animal): void { resolveAnimal(inst).updateAmphibianBodyFlexion(); }
export function calculateAmphibianStride(inst?: Animal): number { return resolveAnimal(inst).calculateAmphibianStride(); }
export function calculateFrogJumpForce(inst?: Animal): number { return resolveAnimal(inst).calculateFrogJumpForce(); }
export function calculateFrogLandingPose(inst?: Animal): any { return resolveAnimal(inst).calculateFrogLandingPose(); }
export function maintainAmphibianBalance(inst?: Animal): void { resolveAnimal(inst).maintainAmphibianBalance(); }
export function blendAmphibianGait(inst?: Animal): void { resolveAnimal(inst).blendAmphibianGait(); }
export function updateAmphibianPosture(inst?: Animal): void { resolveAnimal(inst).updateAmphibianPosture(); }

// ============================================================================
// 481–500. Lưỡng cư: nhảy, bò, bơi và bắt mồi
// ============================================================================

export function crouchBeforeJump(inst?: Animal): void { resolveAnimal(inst).crouchBeforeJump(); }
export function extendFrogHindlimbs(inst?: Animal): void { resolveAnimal(inst).extendFrogHindlimbs(); }
export function launchFrogJump(inst?: Animal): void { resolveAnimal(inst).launchFrogJump(); }
export function tuckLimbsDuringJump(inst?: Animal): void { resolveAnimal(inst).tuckLimbsDuringJump(); }
export function extendLimbsForLanding(inst?: Animal): void { resolveAnimal(inst).extendLimbsForLanding(); }
export function absorbFrogLanding(inst?: Animal): void { resolveAnimal(inst).absorbFrogLanding(); }
export function hopForward(inst?: Animal): void { resolveAnimal(inst).hopForward(); }
export function hopSideways(inst?: Animal): void { resolveAnimal(inst).hopSideways(); }
export function crawlLikeSalamander(inst?: Animal): void { resolveAnimal(inst).crawlLikeSalamander(); }
export function walkLikeSalamander(inst?: Animal): void { resolveAnimal(inst).walkLikeSalamander(); }
export function swimLikeFrog(inst?: Animal): void { resolveAnimal(inst).swimLikeFrog(); }
export function paddleWithHindlimbs(inst?: Animal): void { resolveAnimal(inst).paddleWithHindlimbs(); }
export function undulateSalamanderTail(inst?: Animal): void { resolveAnimal(inst).undulateSalamanderTail(); }
export function climbWetSurface(inst?: Animal): void { resolveAnimal(inst).climbWetSurface(); }
export function flickFrogTongue(inst?: Animal): void { resolveAnimal(inst).flickFrogTongue(); }
export function captureInsectWithTongue(insect: any, inst?: Animal): void { resolveAnimal(inst).captureInsectWithTongue(insect); }
export function swallowSmallPrey(prey: any, inst?: Animal): void { resolveAnimal(inst).swallowSmallPrey(prey); }
export function breatheThroughSkin(inst?: Animal): void { resolveAnimal(inst).breatheThroughSkin(); }
export function enterWaterFromLand(inst?: Animal): void { resolveAnimal(inst).enterWaterFromLand(); }
export function performAmphibianIdleMotion(inst?: Animal): void { resolveAnimal(inst).performAmphibianIdleMotion(); }

// ============================================================================
// 501–520. Côn trùng: cấu trúc và bộ xương ngoài
// ============================================================================

export function initializeInsectExoskeleton(inst?: Animal): void { resolveAnimal(inst).initializeInsectExoskeleton(); }
export function updateInsectHead(inst?: Animal): void { resolveAnimal(inst).updateInsectHead(); }
export function updateInsectThorax(inst?: Animal): void { resolveAnimal(inst).updateInsectThorax(); }
export function updateInsectAbdomen(inst?: Animal): void { resolveAnimal(inst).updateInsectAbdomen(); }
export function updateInsectExoskeleton(inst?: Animal): void { resolveAnimal(inst).updateInsectExoskeleton(); }
export function updateInsectCuticle(inst?: Animal): void { resolveAnimal(inst).updateInsectCuticle(); }
export function updateInsectSegmentHierarchy(inst?: Animal): void { resolveAnimal(inst).updateInsectSegmentHierarchy(); }
export function updateInsectJointAngles(inst?: Animal): void { resolveAnimal(inst).updateInsectJointAngles(); }
export function updateInsectAntennae(inst?: Animal): void { resolveAnimal(inst).updateInsectAntennae(); }
export function updateInsectCompoundEyes(inst?: Animal): void { resolveAnimal(inst).updateInsectCompoundEyes(); }
export function updateInsectSimpleEyes(inst?: Animal): void { resolveAnimal(inst).updateInsectSimpleEyes(); }
export function updateInsectMandibles(inst?: Animal): void { resolveAnimal(inst).updateInsectMandibles(); }
export function updateInsectMaxillae(inst?: Animal): void { resolveAnimal(inst).updateInsectMaxillae(); }
export function updateInsectLabium(inst?: Animal): void { resolveAnimal(inst).updateInsectLabium(); }
export function updateInsectForelegs(inst?: Animal): void { resolveAnimal(inst).updateInsectForelegs(); }
export function updateInsectMiddleLegs(inst?: Animal): void { resolveAnimal(inst).updateInsectMiddleLegs(); }
export function updateInsectHindlegs(inst?: Animal): void { resolveAnimal(inst).updateInsectHindlegs(); }
export function updateInsectClaws(inst?: Animal): void { resolveAnimal(inst).updateInsectClaws(); }
export function updateInsectWingVeins(inst?: Animal): void { resolveAnimal(inst).updateInsectWingVeins(); }
export function updateInsectBodyArticulation(inst?: Animal): void { resolveAnimal(inst).updateInsectBodyArticulation(); }

// ============================================================================
// 521–540. Côn trùng: đi bộ và di chuyển bằng chân
// ============================================================================

export function initializeInsectLocomotion(inst?: Animal): void { resolveAnimal(inst).initializeInsectLocomotion(); }
export function walkUsingTripodGait(inst?: Animal): void { resolveAnimal(inst).walkUsingTripodGait(); }
export function walkUsingMetachronalGait(inst?: Animal): void { resolveAnimal(inst).walkUsingMetachronalGait(); }
export function moveFrontLeftLeg(inst?: Animal): void { resolveAnimal(inst).moveFrontLeftLeg(); }
export function moveFrontRightLeg(inst?: Animal): void { resolveAnimal(inst).moveFrontRightLeg(); }
export function moveMiddleLeftLeg(inst?: Animal): void { resolveAnimal(inst).moveMiddleLeftLeg(); }
export function moveMiddleRightLeg(inst?: Animal): void { resolveAnimal(inst).moveMiddleRightLeg(); }
export function moveHindLeftLeg(inst?: Animal): void { resolveAnimal(inst).moveHindLeftLeg(); }
export function moveHindRightLeg(inst?: Animal): void { resolveAnimal(inst).moveHindRightLeg(); }
export function liftInsectLeg(inst?: Animal): void { resolveAnimal(inst).liftInsectLeg(); }
export function plantInsectLeg(inst?: Animal): void { resolveAnimal(inst).plantInsectLeg(); }
export function coordinateLegPhases(inst?: Animal): void { resolveAnimal(inst).coordinateLegPhases(); }
export function climbRoughSurface(inst?: Animal): void { resolveAnimal(inst).climbRoughSurface(); }
export function climbSmoothSurface(inst?: Animal): void { resolveAnimal(inst).climbSmoothSurface(); }
export function adhereToVerticalSurface(inst?: Animal): void { resolveAnimal(inst).adhereToVerticalSurface(); }
export function releaseAdhesion(inst?: Animal): void { resolveAnimal(inst).releaseAdhesion(); }
export function crossSmallObstacle(inst?: Animal): void { resolveAnimal(inst).crossSmallObstacle(); }
export function rightInsectBodyAfterFall(inst?: Animal): void { resolveAnimal(inst).rightInsectBodyAfterFall(); }
export function groomInsectAntennae(inst?: Animal): void { resolveAnimal(inst).groomInsectAntennae(); }
export function performInsectIdleMotion(inst?: Animal): void { resolveAnimal(inst).performInsectIdleMotion(); }

// ============================================================================
// 541–560. Côn trùng: cánh và chuyến bay
// ============================================================================

export function initializeInsectFlight(inst?: Animal): void { resolveAnimal(inst).initializeInsectFlight(); }
export function spreadInsectWings(inst?: Animal): void { resolveAnimal(inst).spreadInsectWings(); }
export function foldInsectWings(inst?: Animal): void { resolveAnimal(inst).foldInsectWings(); }
export function flapInsectWings(inst?: Animal): void { resolveAnimal(inst).flapInsectWings(); }
export function calculateWingbeatFrequency(inst?: Animal): number { return resolveAnimal(inst).calculateWingbeatFrequency(); }
export function calculateWingbeatAmplitude(inst?: Animal): number { return resolveAnimal(inst).calculateWingbeatAmplitude(); }
export function synchronizeWingPairs(inst?: Animal): void { resolveAnimal(inst).synchronizeWingPairs(); }
export function generateInsectLift(inst?: Animal): number { return resolveAnimal(inst).generateInsectLift(); }
export function adjustInsectFlightDirection(inst?: Animal): void { resolveAnimal(inst).adjustInsectFlightDirection(); }
export function accelerateInsectFlight(inst?: Animal): void { resolveAnimal(inst).accelerateInsectFlight(); }
export function decelerateInsectFlight(inst?: Animal): void { resolveAnimal(inst).decelerateInsectFlight(); }
export function hoverLikeInsect(inst?: Animal): void { resolveAnimal(inst).hoverLikeInsect(); }
export function performInsectTakeoff(inst?: Animal): void { resolveAnimal(inst).performInsectTakeoff(); }
export function performInsectLanding(inst?: Animal): void { resolveAnimal(inst).performInsectLanding(); }
export function performInsectAerialTurn(inst?: Animal): void { resolveAnimal(inst).performInsectAerialTurn(); }
export function performInsectDive(inst?: Animal): void { resolveAnimal(inst).performInsectDive(); }
export function glideLikeInsect(inst?: Animal): void { resolveAnimal(inst).glideLikeInsect(); }
export function avoidAirborneObstacle(inst?: Animal): void { resolveAnimal(inst).avoidAirborneObstacle(); }
export function cleanInsectWings(inst?: Animal): void { resolveAnimal(inst).cleanInsectWings(); }
export function blendInsectFlightModes(inst?: Animal): void { resolveAnimal(inst).blendInsectFlightModes(); }

// ============================================================================
// 561–580. Côn trùng: kiếm ăn và hành vi xã hội
// ============================================================================

export function detectFoodWithAntennae(inst?: Animal): boolean { return resolveAnimal(inst).detectFoodWithAntennae(); }
export function inspectFoodWithPalps(inst?: Animal): void { resolveAnimal(inst).inspectFoodWithPalps(); }
export function feedOnNectar(inst?: Animal): void { resolveAnimal(inst).feedOnNectar(); }
export function chewPlantMaterial(inst?: Animal): void { resolveAnimal(inst).chewPlantMaterial(); }
export function bitePlantLeaf(leaf: any, inst?: Animal): void { resolveAnimal(inst).bitePlantLeaf(leaf); }
export function probeFoodSource(source: any, inst?: Animal): void { resolveAnimal(inst).probeFoodSource(source); }
export function followPheromoneTrail(trail: any, inst?: Animal): void { resolveAnimal(inst).followPheromoneTrail(trail); }
export function depositPheromone(type: string, inst?: Animal): void { resolveAnimal(inst).depositPheromone(type); }
export function detectColonyPheromone(inst?: Animal): boolean { return resolveAnimal(inst).detectColonyPheromone(); }
export function recruitColonyMembers(target: any, inst?: Animal): void { resolveAnimal(inst).recruitColonyMembers(target); }
export function carrySmallObject(object: any, inst?: Animal): void { resolveAnimal(inst).carrySmallObject(object); }
export function transportFoodToNest(food: any, inst?: Animal): void { resolveAnimal(inst).transportFoodToNest(food); }
export function digInsectBurrow(inst?: Animal): void { resolveAnimal(inst).digInsectBurrow(); }
export function constructNestMaterial(material: any, inst?: Animal): void { resolveAnimal(inst).constructNestMaterial(material); }
export function groomBodySurface(inst?: Animal): void { resolveAnimal(inst).groomBodySurface(); }
export function groomAntennae(inst?: Animal): void { resolveAnimal(inst).groomAntennae(); }
export function performMatingDisplay(inst?: Animal): void { resolveAnimal(inst).performMatingDisplay(); }
export function performThreatDisplay(inst?: Animal): void { resolveAnimal(inst).performThreatDisplay(); }
export function performSwarmMovement(inst?: Animal): void { resolveAnimal(inst).performSwarmMovement(); }
export function performInsectIdleBehavior(inst?: Animal): void { resolveAnimal(inst).performInsectIdleBehavior(); }

// ============================================================================
// 581–600. Nhện và động vật chân khớp khác
// ============================================================================

export function initializeArachnidBody(inst?: Animal): void { resolveAnimal(inst).initializeArachnidBody(); }
export function updateArachnidCephalothorax(inst?: Animal): void { resolveAnimal(inst).updateArachnidCephalothorax(); }
export function updateArachnidAbdomen(inst?: Animal): void { resolveAnimal(inst).updateArachnidAbdomen(); }
export function updateArachnidExoskeleton(inst?: Animal): void { resolveAnimal(inst).updateArachnidExoskeleton(); }
export function updateArachnidPedipalps(inst?: Animal): void { resolveAnimal(inst).updateArachnidPedipalps(); }
export function updateArachnidChelicerae(inst?: Animal): void { resolveAnimal(inst).updateArachnidChelicerae(); }
export function updateArachnidSpinnerets(inst?: Animal): void { resolveAnimal(inst).updateArachnidSpinnerets(); }
export function updateArachnidLegJoints(inst?: Animal): void { resolveAnimal(inst).updateArachnidLegJoints(); }
export function moveArachnidLegPairOne(inst?: Animal): void { resolveAnimal(inst).moveArachnidLegPairOne(); }
export function moveArachnidLegPairTwo(inst?: Animal): void { resolveAnimal(inst).moveArachnidLegPairTwo(); }
export function moveArachnidLegPairThree(inst?: Animal): void { resolveAnimal(inst).moveArachnidLegPairThree(); }
export function moveArachnidLegPairFour(inst?: Animal): void { resolveAnimal(inst).moveArachnidLegPairFour(); }
export function coordinateArachnidGait(inst?: Animal): void { resolveAnimal(inst).coordinateArachnidGait(); }
export function climbUsingArachnidLegs(inst?: Animal): void { resolveAnimal(inst).climbUsingArachnidLegs(); }
export function detectVibrationThroughLegs(inst?: Animal): number { return resolveAnimal(inst).detectVibrationThroughLegs(); }
export function produceSilkThread(inst?: Animal): any { return resolveAnimal(inst).produceSilkThread(); }
export function attachSilkAnchor(inst?: Animal): void { resolveAnimal(inst).attachSilkAnchor(); }
export function constructSpiderWeb(inst?: Animal): void { resolveAnimal(inst).constructSpiderWeb(); }
export function traverseSpiderWeb(inst?: Animal): void { resolveAnimal(inst).traverseSpiderWeb(); }
export function performArachnidIdleMotion(inst?: Animal): void { resolveAnimal(inst).performArachnidIdleMotion(); }

// ============================================================================
// 601–620. Động vật không xương sống dưới nước
// ============================================================================

export function initializeAquaticInvertebrate(inst?: Animal): void { resolveAnimal(inst).initializeAquaticInvertebrate(); }
export function updateCephalopodMantle(inst?: Animal): void { resolveAnimal(inst).updateCephalopodMantle(); }
export function contractCephalopodMantle(inst?: Animal): void { resolveAnimal(inst).contractCephalopodMantle(); }
export function expelWaterThroughSiphon(inst?: Animal): void { resolveAnimal(inst).expelWaterThroughSiphon(); }
export function performJetPropulsion(inst?: Animal): void { resolveAnimal(inst).performJetPropulsion(); }
export function extendCephalopodArm(inst?: Animal): void { resolveAnimal(inst).extendCephalopodArm(); }
export function retractCephalopodArm(inst?: Animal): void { resolveAnimal(inst).retractCephalopodArm(); }
export function curlCephalopodArm(inst?: Animal): void { resolveAnimal(inst).curlCephalopodArm(); }
export function activateSuckers(inst?: Animal): void { resolveAnimal(inst).activateSuckers(); }
export function releaseSuckers(inst?: Animal): void { resolveAnimal(inst).releaseSuckers(); }
export function coordinateTentacleMovement(inst?: Animal): void { resolveAnimal(inst).coordinateTentacleMovement(); }
export function changeCephalopodColor(color?: string, inst?: Animal): void { resolveAnimal(inst).changeCephalopodColor(color); }
export function changeCephalopodPattern(pattern?: string, inst?: Animal): void { resolveAnimal(inst).changeCephalopodPattern(pattern); }
export function changeCephalopodSkinTexture(texture?: string, inst?: Animal): void { resolveAnimal(inst).changeCephalopodSkinTexture(texture); }
export function contractJellyfishBell(inst?: Animal): void { resolveAnimal(inst).contractJellyfishBell(); }
export function relaxJellyfishBell(inst?: Animal): void { resolveAnimal(inst).relaxJellyfishBell(); }
export function pulseJellyfishMovement(inst?: Animal): void { resolveAnimal(inst).pulseJellyfishMovement(); }
export function extendCnidarianTentacles(inst?: Animal): void { resolveAnimal(inst).extendCnidarianTentacles(); }
export function retractCnidarianTentacles(inst?: Animal): void { resolveAnimal(inst).retractCnidarianTentacles(); }
export function performAquaticInvertebrateIdleMotion(inst?: Animal): void { resolveAnimal(inst).performAquaticInvertebrateIdleMotion(); }

// ============================================================================
// 621–640. Giun, thân mềm và động vật bò sát dạng mềm
// ============================================================================

export function initializeSoftBodiedAnimal(inst?: Animal): void { resolveAnimal(inst).initializeSoftBodiedAnimal(); }
export function segmentSoftBody(inst?: Animal): void { resolveAnimal(inst).segmentSoftBody(); }
export function contractLongitudinalMuscles(inst?: Animal): void { resolveAnimal(inst).contractLongitudinalMuscles(); }
export function contractCircularMuscles(inst?: Animal): void { resolveAnimal(inst).contractCircularMuscles(); }
export function performPeristalticMovement(inst?: Animal): void { resolveAnimal(inst).performPeristalticMovement(); }
export function extendAnteriorBody(inst?: Animal): void { resolveAnimal(inst).extendAnteriorBody(); }
export function retractAnteriorBody(inst?: Animal): void { resolveAnimal(inst).retractAnteriorBody(); }
export function anchorPosteriorBody(inst?: Animal): void { resolveAnimal(inst).anchorPosteriorBody(); }
export function releasePosteriorAnchor(inst?: Animal): void { resolveAnimal(inst).releasePosteriorAnchor(); }
export function glideUsingMucus(inst?: Animal): void { resolveAnimal(inst).glideUsingMucus(); }
export function extendSnailFoot(inst?: Animal): void { resolveAnimal(inst).extendSnailFoot(); }
export function contractSnailFoot(inst?: Animal): void { resolveAnimal(inst).contractSnailFoot(); }
export function crawlLikeSnail(inst?: Animal): void { resolveAnimal(inst).crawlLikeSnail(); }
export function retractSnailTentacles(inst?: Animal): void { resolveAnimal(inst).retractSnailTentacles(); }
export function extendSnailTentacles(inst?: Animal): void { resolveAnimal(inst).extendSnailTentacles(); }
export function withdrawIntoShell(inst?: Animal): void { resolveAnimal(inst).withdrawIntoShell(); }
export function emergeFromShell(inst?: Animal): void { resolveAnimal(inst).emergeFromShell(); }
export function adhereToSubstrate(inst?: Animal): void { resolveAnimal(inst).adhereToSubstrate(); }
export function detachFromSubstrate(inst?: Animal): void { resolveAnimal(inst).detachFromSubstrate(); }
export function performSoftBodiedAnimalIdleMotion(inst?: Animal): void { resolveAnimal(inst).performSoftBodiedAnimalIdleMotion(); }

// ============================================================================
// 641–660. Hô hấp, tuần hoàn và hoạt động sinh lý
// ============================================================================

export function initializeAnimalPhysiology(inst?: Animal): void { resolveAnimal(inst).initializeAnimalPhysiology(); }
export function updateRespiration(deltaTime: number, inst?: Animal): void { resolveAnimal(inst).updateRespiration(deltaTime); }
export function calculateRespiratoryRate(inst?: Animal): number { return resolveAnimal(inst).calculateRespiratoryRate(); }
export function updateLungExpansion(inst?: Animal): void { resolveAnimal(inst).updateLungExpansion(); }
export function updateLungContraction(inst?: Animal): void { resolveAnimal(inst).updateLungContraction(); }
export function updateGillVentilation(inst?: Animal): void { resolveAnimal(inst).updateGillVentilation(); }
export function updateTrachealVentilation(inst?: Animal): void { resolveAnimal(inst).updateTrachealVentilation(); }
export function updateHeartRate(inst?: Animal): number { return resolveAnimal(inst).updateHeartRate(); }
export function updateBloodCirculation(inst?: Animal): void { resolveAnimal(inst).updateBloodCirculation(); }
export function regulateOxygenDemand(inst?: Animal): void { resolveAnimal(inst).regulateOxygenDemand(); }
export function regulateCarbonDioxideRemoval(inst?: Animal): void { resolveAnimal(inst).regulateCarbonDioxideRemoval(); }
export function regulateWaterBalance(inst?: Animal): void { resolveAnimal(inst).regulateWaterBalance(); }
export function regulateElectrolyteBalance(inst?: Animal): void { resolveAnimal(inst).regulateElectrolyteBalance(); }
export function regulateEnergyConsumption(inst?: Animal): void { resolveAnimal(inst).regulateEnergyConsumption(); }
export function calculateMetabolicRate(inst?: Animal): number { return resolveAnimal(inst).calculateMetabolicRate(); }
export function updateDigestiveActivity(inst?: Animal): void { resolveAnimal(inst).updateDigestiveActivity(); }
export function updateExcretoryActivity(inst?: Animal): void { resolveAnimal(inst).updateExcretoryActivity(); }
export function updatePhysiologicalStress(inst?: Animal): void { resolveAnimal(inst).updatePhysiologicalStress(); }
export function recoverPhysiologicalHomeostasis(inst?: Animal): void { resolveAnimal(inst).recoverPhysiologicalHomeostasis(); }

// ============================================================================
// 661–680. Dinh dưỡng, săn mồi và kiếm ăn
// ============================================================================

export function initializeAnimalFeeding(inst?: Animal): void { resolveAnimal(inst).initializeAnimalFeeding(); }
export function detectPotentialFood(inst?: Animal): boolean { return resolveAnimal(inst).detectPotentialFood(); }
export function classifyFoodSource(inst?: Animal): string { return resolveAnimal(inst).classifyFoodSource(); }
export function evaluateFoodSafety(inst?: Animal): boolean { return resolveAnimal(inst).evaluateFoodSafety(); }
export function approachFoodSource(source: any, inst?: Animal): void { resolveAnimal(inst).approachFoodSource(source); }
export function investigateFoodSource(source: any, inst?: Animal): void { resolveAnimal(inst).investigateFoodSource(source); }
export function selectFoodItem(items: any[], inst?: Animal): any { return resolveAnimal(inst).selectFoodItem(items); }
export function captureFoodItem(item: any, inst?: Animal): void { resolveAnimal(inst).captureFoodItem(item); }
export function manipulateFoodItem(item: any, inst?: Animal): void { resolveAnimal(inst).manipulateFoodItem(item); }
export function ingestFoodItem(item: any, inst?: Animal): void { resolveAnimal(inst).ingestFoodItem(item); }
export function processFoodInMouth(inst?: Animal): void { resolveAnimal(inst).processFoodInMouth(); }
export function swallowFoodBolus(inst?: Animal): void { resolveAnimal(inst).swallowFoodBolus(); }
export function trackPreyMovement(prey: any, inst?: Animal): void { resolveAnimal(inst).trackPreyMovement(prey); }
export function stalkPrey(prey: any, inst?: Animal): void { resolveAnimal(inst).stalkPrey(prey); }
export function pursuePrey(prey: any, inst?: Animal): void { resolveAnimal(inst).pursuePrey(prey); }
export function interceptPrey(prey: any, inst?: Animal): void { resolveAnimal(inst).interceptPrey(prey); }
export function executePredatoryStrike(prey: any, inst?: Animal): void { resolveAnimal(inst).executePredatoryStrike(prey); }
export function secureCapturedPrey(prey: any, inst?: Animal): void { resolveAnimal(inst).secureCapturedPrey(prey); }
export function shareFoodWithGroup(group: any, inst?: Animal): void { resolveAnimal(inst).shareFoodWithGroup(group); }
export function updateFeedingMotivation(inst?: Animal): void { resolveAnimal(inst).updateFeedingMotivation(); }

// ============================================================================
// 681–700. Sinh sản, giao phối và chăm sóc con non
// ============================================================================

export function initializeReproductiveBehavior(inst?: Animal): void { resolveAnimal(inst).initializeReproductiveBehavior(); }
export function detectReproductiveReadiness(inst?: Animal): boolean { return resolveAnimal(inst).detectReproductiveReadiness(); }
export function detectPotentialMate(inst?: Animal): boolean { return resolveAnimal(inst).detectPotentialMate(); }
export function approachPotentialMate(mate: any, inst?: Animal): void { resolveAnimal(inst).approachPotentialMate(mate); }
export function performCourtshipBehavior(inst?: Animal): void { resolveAnimal(inst).performCourtshipBehavior(); }
export function performCourtshipVocalization(inst?: Animal): void { resolveAnimal(inst).performCourtshipVocalization(); }
export function evaluateMateCompatibility(mate: any, inst?: Animal): boolean { return resolveAnimal(inst).evaluateMateCompatibility(mate); }
export function initiateMatingSequence(inst?: Animal): void { resolveAnimal(inst).initiateMatingSequence(); }
export function terminateMatingSequence(inst?: Animal): void { resolveAnimal(inst).terminateMatingSequence(); }
export function searchForNestingSite(inst?: Animal): void { resolveAnimal(inst).searchForNestingSite(); }
export function constructNest(inst?: Animal): void { resolveAnimal(inst).constructNest(); }
export function prepareNestingMaterial(inst?: Animal): void { resolveAnimal(inst).prepareNestingMaterial(); }
export function layEggs(inst?: Animal): void { resolveAnimal(inst).layEggs(); }
export function incubateEggs(inst?: Animal): void { resolveAnimal(inst).incubateEggs(); }
export function guardNest(inst?: Animal): void { resolveAnimal(inst).guardNest(); }
export function recognizeOffspring(offspring: any, inst?: Animal): boolean { return resolveAnimal(inst).recognizeOffspring(offspring); }
export function retrieveOffspring(offspring: any, inst?: Animal): void { resolveAnimal(inst).retrieveOffspring(offspring); }
export function feedOffspring(offspring: any, inst?: Animal): void { resolveAnimal(inst).feedOffspring(offspring); }
export function protectOffspring(offspring: any, inst?: Animal): void { resolveAnimal(inst).protectOffspring(offspring); }

// ============================================================================
// 701–720. Phát triển, sinh trưởng và thay đổi cơ thể
// ============================================================================

export function initializeAnimalDevelopment(inst?: Animal): void { resolveAnimal(inst).initializeAnimalDevelopment(); }
export function updateDevelopmentStage(inst?: Animal): void { resolveAnimal(inst).updateDevelopmentStage(); }
export function transitionToJuvenileStage(inst?: Animal): void { resolveAnimal(inst).transitionToJuvenileStage(); }
export function transitionToAdultStage(inst?: Animal): void { resolveAnimal(inst).transitionToAdultStage(); }
export function transitionToSeniorStage(inst?: Animal): void { resolveAnimal(inst).transitionToSeniorStage(); }
export function calculateGrowthRate(inst?: Animal): number { return resolveAnimal(inst).calculateGrowthRate(); }
export function updateBodySizeWithAge(inst?: Animal): void { resolveAnimal(inst).updateBodySizeWithAge(); }
export function updateBodyProportionsWithAge(inst?: Animal): void { resolveAnimal(inst).updateBodyProportionsWithAge(); }
export function updateSkeletalGrowth(inst?: Animal): void { resolveAnimal(inst).updateSkeletalGrowth(); }
export function updateMuscleGrowth(inst?: Animal): void { resolveAnimal(inst).updateMuscleGrowth(); }
export function updateFeatherGrowth(inst?: Animal): void { resolveAnimal(inst).updateFeatherGrowth(); }
export function updateFurGrowth(inst?: Animal): void { resolveAnimal(inst).updateFurGrowth(); }
export function updateScaleDevelopment(inst?: Animal): void { resolveAnimal(inst).updateScaleDevelopment(); }
export function updateHornGrowth(inst?: Animal): void { resolveAnimal(inst).updateHornGrowth(); }
export function updateAntlerGrowth(inst?: Animal): void { resolveAnimal(inst).updateAntlerGrowth(); }
export function initiateMolting(inst?: Animal): void { resolveAnimal(inst).initiateMolting(); }
export function updateMoltingProgress(inst?: Animal): void { resolveAnimal(inst).updateMoltingProgress(); }
export function shedExoskeleton(inst?: Animal): void { resolveAnimal(inst).shedExoskeleton(); }
export function recoverAfterMolting(inst?: Animal): void { resolveAnimal(inst).recoverAfterMolting(); }
export function updateLifeStageAppearance(inst?: Animal): void { resolveAnimal(inst).updateLifeStageAppearance(); }

// ============================================================================
// 721–740. Giác quan nâng cao và cảm nhận môi trường
// ============================================================================

export function initializeEnvironmentalSensing(inst?: Animal): void { resolveAnimal(inst).initializeEnvironmentalSensing(); }
export function senseAmbientTemperature(inst?: Animal): number { return resolveAnimal(inst).senseAmbientTemperature(); }
export function senseHumidity(inst?: Animal): number { return resolveAnimal(inst).senseHumidity(); }
export function senseWindDirection(inst?: Animal): Vec3 { return resolveAnimal(inst).senseWindDirection(); }
export function senseWindSpeed(inst?: Animal): number { return resolveAnimal(inst).senseWindSpeed(); }
export function senseGroundVibration(inst?: Animal): number { return resolveAnimal(inst).senseGroundVibration(); }
export function senseWaterCurrent(inst?: Animal): Vec3 { return resolveAnimal(inst).senseWaterCurrent(); }
export function senseWaterPressure(inst?: Animal): number { return resolveAnimal(inst).senseWaterPressure(); }
export function senseMagneticField(inst?: Animal): Vec3 { return resolveAnimal(inst).senseMagneticField(); }
export function senseLightIntensity(inst?: Animal): number { return resolveAnimal(inst).senseLightIntensity(); }
export function sensePolarizedLight(inst?: Animal): boolean { return resolveAnimal(inst).sensePolarizedLight(); }
export function detectChemicalSignals(inst?: Animal): boolean { return resolveAnimal(inst).detectChemicalSignals(); }
export function detectPheromones(inst?: Animal): boolean { return resolveAnimal(inst).detectPheromones(); }
export function detectPredatorPresence(inst?: Animal): boolean { return resolveAnimal(inst).detectPredatorPresence(); }
export function detectConspecificPresence(inst?: Animal): boolean { return resolveAnimal(inst).detectConspecificPresence(); }
export function detectHabitatBoundary(inst?: Animal): boolean { return resolveAnimal(inst).detectHabitatBoundary(); }
export function estimateEnvironmentalRisk(inst?: Animal): number { return resolveAnimal(inst).estimateEnvironmentalRisk(); }
export function estimateResourceAvailability(inst?: Animal): number { return resolveAnimal(inst).estimateResourceAvailability(); }
export function updateEnvironmentalMemory(inst?: Animal): void { resolveAnimal(inst).updateEnvironmentalMemory(); }
export function integrateSensoryInformation(inst?: Animal): void { resolveAnimal(inst).integrateSensoryInformation(); }

// ============================================================================
// 741–760. Hành vi, cảm xúc và ra quyết định
// ============================================================================

export function initializeAnimalBehavior(inst?: Animal): void { resolveAnimal(inst).initializeAnimalBehavior(); }
export function updateAnimalBehavior(deltaTime: number, inst?: Animal): void { resolveAnimal(inst).updateAnimalBehavior(deltaTime); }
export function evaluateAnimalNeeds(inst?: Animal): void { resolveAnimal(inst).evaluateAnimalNeeds(); }
export function calculateHungerLevel(inst?: Animal): number { return resolveAnimal(inst).calculateHungerLevel(); }
export function calculateThirstLevel(inst?: Animal): number { return resolveAnimal(inst).calculateThirstLevel(); }
export function calculateFatigueLevel(inst?: Animal): number { return resolveAnimal(inst).calculateFatigueLevel(); }
export function calculateFearLevel(inst?: Animal): number { return resolveAnimal(inst).calculateFearLevel(); }
export function calculateCuriosityLevel(inst?: Animal): number { return resolveAnimal(inst).calculateCuriosityLevel(); }
export function calculateAggressionLevel(inst?: Animal): number { return resolveAnimal(inst).calculateAggressionLevel(); }
export function calculateSocialMotivation(inst?: Animal): number { return resolveAnimal(inst).calculateSocialMotivation(); }
export function selectBehaviorState(inst?: Animal): string { return resolveAnimal(inst).selectBehaviorState(); }
export function chooseNextAction(inst?: Animal): string { return resolveAnimal(inst).chooseNextAction(); }
export function interruptCurrentBehavior(inst?: Animal): void { resolveAnimal(inst).interruptCurrentBehavior(); }
export function resumePreviousBehavior(inst?: Animal): void { resolveAnimal(inst).resumePreviousBehavior(); }
export function evaluateThreatResponse(inst?: Animal): string { return resolveAnimal(inst).evaluateThreatResponse(); }
export function chooseEscapeDirection(inst?: Animal): Vec3 { return resolveAnimal(inst).chooseEscapeDirection(); }
export function initiateDefensiveBehavior(inst?: Animal): void { resolveAnimal(inst).initiateDefensiveBehavior(); }
export function investigateNovelStimulus(inst?: Animal): void { resolveAnimal(inst).investigateNovelStimulus(); }
export function updateBehavioralMemory(inst?: Animal): void { resolveAnimal(inst).updateBehavioralMemory(); }
export function transitionBehaviorState(newState?: string, inst?: Animal): void { resolveAnimal(inst).transitionBehaviorState(newState); }

// ============================================================================
// 761–780. Bầy đàn, giao tiếp và lãnh thổ
// ============================================================================

export function initializeSocialBehavior(inst?: Animal): void { resolveAnimal(inst).initializeSocialBehavior(); }
export function detectNearbyConspecifics(inst?: Animal): any[] { return resolveAnimal(inst).detectNearbyConspecifics(); }
export function recognizeIndividualAnimal(animal: any, inst?: Animal): boolean { return resolveAnimal(inst).recognizeIndividualAnimal(animal); }
export function maintainGroupSpacing(inst?: Animal): void { resolveAnimal(inst).maintainGroupSpacing(); }
export function followGroupLeader(leader: any, inst?: Animal): void { resolveAnimal(inst).followGroupLeader(leader); }
export function electGroupLeader(group: any, inst?: Animal): any { return resolveAnimal(inst).electGroupLeader(group); }
export function synchronizeGroupMovement(group: any, inst?: Animal): void { resolveAnimal(inst).synchronizeGroupMovement(group); }
export function joinAnimalGroup(group: any, inst?: Animal): void { resolveAnimal(inst).joinAnimalGroup(group); }
export function leaveAnimalGroup(group: any, inst?: Animal): void { resolveAnimal(inst).leaveAnimalGroup(group); }
export function coordinateGroupForaging(group: any, inst?: Animal): void { resolveAnimal(inst).coordinateGroupForaging(group); }
export function performSocialGreeting(animal: any, inst?: Animal): void { resolveAnimal(inst).performSocialGreeting(animal); }
export function initiateSocialGrooming(animal: any, inst?: Animal): void { resolveAnimal(inst).initiateSocialGrooming(animal); }
export function exchangeVocalSignals(signal: any, inst?: Animal): void { resolveAnimal(inst).exchangeVocalSignals(signal); }
export function performAlarmCall(inst?: Animal): void { resolveAnimal(inst).performAlarmCall(); }
export function respondToAlarmCall(signal: any, inst?: Animal): void { resolveAnimal(inst).respondToAlarmCall(signal); }
export function establishTerritorialBoundary(area: any, inst?: Animal): void { resolveAnimal(inst).establishTerritorialBoundary(area); }
export function patrolTerritory(area: any, inst?: Animal): void { resolveAnimal(inst).patrolTerritory(area); }
export function markTerritory(location: any, inst?: Animal): void { resolveAnimal(inst).markTerritory(location); }
export function defendTerritory(intruder: any, inst?: Animal): void { resolveAnimal(inst).defendTerritory(intruder); }
export function resolveSocialConflict(animal: any, inst?: Animal): void { resolveAnimal(inst).resolveSocialConflict(animal); }

// ============================================================================
// 781–800. Vật lý, animation, AI và tối ưu hóa
// ============================================================================

export function initializeAnimalPhysics(inst?: Animal): void { resolveAnimal(inst).initializeAnimalPhysics(); }
export function createAnimalCollider(inst?: Animal): any { return resolveAnimal(inst).createAnimalCollider(); }
export function applyAnimalGravity(deltaTime: number, inst?: Animal): void { resolveAnimal(inst).applyAnimalGravity(deltaTime); }
export function applyAnimalForce(force: Vec3, inst?: Animal): void { resolveAnimal(inst).applyAnimalForce(force); }
export function resolveAnimalCollision(inst?: Animal): void { resolveAnimal(inst).resolveAnimalCollision(); }
export function updateAnimalGroundContact(inst?: Animal): boolean { return resolveAnimal(inst).updateAnimalGroundContact(); }
export function solveAnimalIK(inst?: Animal): void { resolveAnimal(inst).solveAnimalIK(); }
export function solveAnimalFootIK(inst?: Animal): void { resolveAnimal(inst).solveAnimalFootIK(); }
export function blendAnimalAnimations(inst?: Animal): void { resolveAnimal(inst).blendAnimalAnimations(); }
export function crossFadeAnimalAnimation(from: string, to: string, duration?: number, inst?: Animal): void { resolveAnimal(inst).crossFadeAnimalAnimation(from, to, duration); }
export function updateAnimalAnimationMixer(deltaTime: number, inst?: Animal): void { resolveAnimal(inst).updateAnimalAnimationMixer(deltaTime); }
export function updateAnimalRootMotion(inst?: Animal): Vec3 { return resolveAnimal(inst).updateAnimalRootMotion(); }
export function applyAnimalSecondaryMotion(inst?: Animal): void { resolveAnimal(inst).applyAnimalSecondaryMotion(); }
export function updateAnimalTailDynamics(inst?: Animal): void { resolveAnimal(inst).updateAnimalTailDynamics(); }
export function updateAnimalClothDynamics(inst?: Animal): void { resolveAnimal(inst).updateAnimalClothDynamics(); }
export function updateAnimalLOD(distance?: number, inst?: Animal): number { return resolveAnimal(inst).updateAnimalLOD(distance); }
export function interpolateAnimalPosition(target: Vec3, alpha?: number, inst?: Animal): void { resolveAnimal(inst).interpolateAnimalPosition(target, alpha); }
export function interpolateAnimalRotation(target: any, alpha?: number, inst?: Animal): void { resolveAnimal(inst).interpolateAnimalRotation(target, alpha); }
export function synchronizeAnimalPhysics(inst?: Animal): void { resolveAnimal(inst).synchronizeAnimalPhysics(); }
export function optimizeAnimalSimulation(inst?: Animal): void { resolveAnimal(inst).optimizeAnimalSimulation(); }
