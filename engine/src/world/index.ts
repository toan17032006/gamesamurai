/**
 * @file index.ts
 * @module @aetheria/engine/world
 * @description Master entry point exporting World class and all 800 standalone world simulation functions.
 */

import { World } from './world.js';
import type { WorldConfig } from './types.js';

export * from './types.js';
export * from './world.js';
export * from './subsystems/world-lifecycle.js';
export * from './subsystems/vegetation-subsystem.js';
export * from './subsystems/terrain-hydrology-subsystem.js';
export * from './subsystems/weather-atmosphere-subsystem.js';
export * from './subsystems/building-architecture-subsystem.js';
export * from './subsystems/physics-materials-subsystem.js';
export * from './subsystems/geology-climate-subsystem.js';
export * from './subsystems/environmental-dynamics-subsystem.js';

let defaultWorld: World | null = null;

export function getActiveWorld(): World {
  if (!defaultWorld) {
    defaultWorld = new World();
    defaultWorld.initializeWorld();
  }
  return defaultWorld;
}

export function setActiveWorld(world: World): void {
  defaultWorld = world;
}

function resolveWorld(inst?: World): World {
  return inst ?? getActiveWorld();
}
export function createWorld(config?: Partial<WorldConfig>): World {
  const w = new World(config);
  w.createWorld();
  setActiveWorld(w);
  return w;
}
export function initializeWorld(inst?: World): any { return resolveWorld(inst).initializeWorld(); }
export function destroyWorld(inst?: World): any { return resolveWorld(inst).destroyWorld(); }
export function resetWorld(inst?: World): any { return resolveWorld(inst).resetWorld(); }
export function updateWorld(deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateWorld(deltaTime); }
export function fixedUpdateWorld(fixedDeltaTime?: any, inst?: World): any { return resolveWorld(inst).fixedUpdateWorld(fixedDeltaTime); }
export function setWorldConfig(config?: any, inst?: World): any { return resolveWorld(inst).setWorldConfig(config); }
export function getWorldState(inst?: World): any { return resolveWorld(inst).getWorldState(); }
export function saveWorldState(inst?: World): any { return resolveWorld(inst).saveWorldState(); }
export function restoreWorldState(state?: any, inst?: World): any { return resolveWorld(inst).restoreWorldState(state); }
export function pauseWorldSimulation(inst?: World): any { return resolveWorld(inst).pauseWorldSimulation(); }
export function resumeWorldSimulation(inst?: World): any { return resolveWorld(inst).resumeWorldSimulation(); }
export function setWorldSimulationSpeed(speed?: any, inst?: World): any { return resolveWorld(inst).setWorldSimulationSpeed(speed); }
export function setWorldTime(time?: any, inst?: World): any { return resolveWorld(inst).setWorldTime(time); }
export function advanceWorldTime(deltaTime?: any, inst?: World): any { return resolveWorld(inst).advanceWorldTime(deltaTime); }
export function setWorldBounds(bounds?: any, inst?: World): any { return resolveWorld(inst).setWorldBounds(bounds); }
export function loadWorldRegion(region?: any, inst?: World): any { return resolveWorld(inst).loadWorldRegion(region); }
export function unloadWorldRegion(region?: any, inst?: World): any { return resolveWorld(inst).unloadWorldRegion(region); }
export function validateWorldState(inst?: World): any { return resolveWorld(inst).validateWorldState(); }
export function optimizeWorldSimulation(inst?: World): any { return resolveWorld(inst).optimizeWorldSimulation(); }
export function createWorldObject(type?: any, inst?: World): any { return resolveWorld(inst).createWorldObject(type); }
export function destroyWorldObject(object?: any, inst?: World): any { return resolveWorld(inst).destroyWorldObject(object); }
export function cloneWorldObject(object?: any, inst?: World): any { return resolveWorld(inst).cloneWorldObject(object); }
export function duplicateWorldObject(object?: any, inst?: World): any { return resolveWorld(inst).duplicateWorldObject(object); }
export function setObjectPosition(object?: any, position?: any, inst?: World): any { return resolveWorld(inst).setObjectPosition(object, position); }
export function setObjectRotation(object?: any, rotation?: any, inst?: World): any { return resolveWorld(inst).setObjectRotation(object, rotation); }
export function setObjectScale(object?: any, scale?: any, inst?: World): any { return resolveWorld(inst).setObjectScale(object, scale); }
export function setObjectTransform(object?: any, transform?: any, inst?: World): any { return resolveWorld(inst).setObjectTransform(object, transform); }
export function getObjectTransform(object?: any, inst?: World): any { return resolveWorld(inst).getObjectTransform(object); }
export function updateObjectTransform(object?: any, inst?: World): any { return resolveWorld(inst).updateObjectTransform(object); }
export function setObjectVisibility(object?: any, visible?: any, inst?: World): any { return resolveWorld(inst).setObjectVisibility(object, visible); }
export function setObjectMaterial(object?: any, material?: any, inst?: World): any { return resolveWorld(inst).setObjectMaterial(object, material); }
export function setObjectTexture(object?: any, texture?: any, inst?: World): any { return resolveWorld(inst).setObjectTexture(object, texture); }
export function setObjectTags(object?: any, tags?: any, inst?: World): any { return resolveWorld(inst).setObjectTags(object, tags); }
export function getObjectTags(object?: any, inst?: World): any { return resolveWorld(inst).getObjectTags(object); }
export function attachObjectToParent(object?: any, parent?: any, inst?: World): any { return resolveWorld(inst).attachObjectToParent(object, parent); }
export function detachObjectFromParent(object?: any, inst?: World): any { return resolveWorld(inst).detachObjectFromParent(object); }
export function transferObjectToRegion(object?: any, region?: any, inst?: World): any { return resolveWorld(inst).transferObjectToRegion(object, region); }
export function serializeWorldObject(object?: any, inst?: World): any { return resolveWorld(inst).serializeWorldObject(object); }
export function deserializeWorldObject(data?: any, inst?: World): any { return resolveWorld(inst).deserializeWorldObject(data); }
export function createTree(species?: any, inst?: World): any { return resolveWorld(inst).createTree(species); }
export function initializeTree(tree?: any, inst?: World): any { return resolveWorld(inst).initializeTree(tree); }
export function updateTree(tree?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateTree(tree, deltaTime); }
export function growTree(tree?: any, amount?: any, inst?: World): any { return resolveWorld(inst).growTree(tree, amount); }
export function setTreeAge(tree?: any, age?: any, inst?: World): any { return resolveWorld(inst).setTreeAge(tree, age); }
export function updateTreeHeight(tree?: any, inst?: World): any { return resolveWorld(inst).updateTreeHeight(tree); }
export function updateTreeThickness(tree?: any, inst?: World): any { return resolveWorld(inst).updateTreeThickness(tree); }
export function updateTreeCanopy(tree?: any, inst?: World): any { return resolveWorld(inst).updateTreeCanopy(tree); }
export function updateTreeRootSystem(tree?: any, inst?: World): any { return resolveWorld(inst).updateTreeRootSystem(tree); }
export function updateTreeTrunk(tree?: any, inst?: World): any { return resolveWorld(inst).updateTreeTrunk(tree); }
export function updateTreeBark(tree?: any, inst?: World): any { return resolveWorld(inst).updateTreeBark(tree); }
export function updateTreeBranchStructure(tree?: any, inst?: World): any { return resolveWorld(inst).updateTreeBranchStructure(tree); }
export function generateTreeBranches(tree?: any, inst?: World): any { return resolveWorld(inst).generateTreeBranches(tree); }
export function extendTreeBranch(branch?: any, inst?: World): any { return resolveWorld(inst).extendTreeBranch(branch); }
export function shortenTreeBranch(branch?: any, inst?: World): any { return resolveWorld(inst).shortenTreeBranch(branch); }
export function bendTreeBranch(branch?: any, force?: any, inst?: World): any { return resolveWorld(inst).bendTreeBranch(branch, force); }
export function twistTreeBranch(branch?: any, torque?: any, inst?: World): any { return resolveWorld(inst).twistTreeBranch(branch, torque); }
export function repairTreeDamage(tree?: any, inst?: World): any { return resolveWorld(inst).repairTreeDamage(tree); }
export function removeTree(tree?: any, inst?: World): any { return resolveWorld(inst).removeTree(tree); }
export function regenerateTreeGeometry(tree?: any, inst?: World): any { return resolveWorld(inst).regenerateTreeGeometry(tree); }
export function createBranch(tree?: any, parentBranch?: any, inst?: World): any { return resolveWorld(inst).createBranch(tree, parentBranch); }
export function splitBranch(branch?: any, inst?: World): any { return resolveWorld(inst).splitBranch(branch); }
export function growBranch(branch?: any, amount?: any, inst?: World): any { return resolveWorld(inst).growBranch(branch, amount); }
export function thickenBranch(branch?: any, amount?: any, inst?: World): any { return resolveWorld(inst).thickenBranch(branch, amount); }
export function bendBranch(branch?: any, force?: any, inst?: World): any { return resolveWorld(inst).bendBranch(branch, force); }
export function straightenBranch(branch?: any, inst?: World): any { return resolveWorld(inst).straightenBranch(branch); }
export function rotateBranch(branch?: any, angle?: any, inst?: World): any { return resolveWorld(inst).rotateBranch(branch, angle); }
export function twistBranch(branch?: any, angle?: any, inst?: World): any { return resolveWorld(inst).twistBranch(branch, angle); }
export function shakeBranch(branch?: any, intensity?: any, inst?: World): any { return resolveWorld(inst).shakeBranch(branch, intensity); }
export function applyBranchLoad(branch?: any, force?: any, inst?: World): any { return resolveWorld(inst).applyBranchLoad(branch, force); }
export function detectBranchStress(branch?: any, inst?: World): any { return resolveWorld(inst).detectBranchStress(branch); }
export function detectBranchFracture(branch?: any, inst?: World): any { return resolveWorld(inst).detectBranchFracture(branch); }
export function breakBranch(branch?: any, force?: any, inst?: World): any { return resolveWorld(inst).breakBranch(branch, force); }
export function snapBranchAtJoint(branch?: any, joint?: any, inst?: World): any { return resolveWorld(inst).snapBranchAtJoint(branch, joint); }
export function detachBranch(branch?: any, inst?: World): any { return resolveWorld(inst).detachBranch(branch); }
export function fallBranch(branch?: any, gravity?: any, inst?: World): any { return resolveWorld(inst).fallBranch(branch, gravity); }
export function splitWoodGrain(branch?: any, inst?: World): any { return resolveWorld(inst).splitWoodGrain(branch); }
export function crackWoodSurface(branch?: any, inst?: World): any { return resolveWorld(inst).crackWoodSurface(branch); }
export function decayWood(branch?: any, rate?: any, inst?: World): any { return resolveWorld(inst).decayWood(branch, rate); }
export function regenerateBranchMesh(branch?: any, inst?: World): any { return resolveWorld(inst).regenerateBranchMesh(branch); }
export function createLeaf(plant?: any, inst?: World): any { return resolveWorld(inst).createLeaf(plant); }
export function initializeLeaf(leaf?: any, inst?: World): any { return resolveWorld(inst).initializeLeaf(leaf); }
export function updateLeaf(leaf?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateLeaf(leaf, deltaTime); }
export function growLeaf(leaf?: any, amount?: any, inst?: World): any { return resolveWorld(inst).growLeaf(leaf, amount); }
export function shrinkLeaf(leaf?: any, amount?: any, inst?: World): any { return resolveWorld(inst).shrinkLeaf(leaf, amount); }
export function unfoldLeaf(leaf?: any, inst?: World): any { return resolveWorld(inst).unfoldLeaf(leaf); }
export function foldLeaf(leaf?: any, inst?: World): any { return resolveWorld(inst).foldLeaf(leaf); }
export function curlLeaf(leaf?: any, amount?: any, inst?: World): any { return resolveWorld(inst).curlLeaf(leaf, amount); }
export function uncurlLeaf(leaf?: any, inst?: World): any { return resolveWorld(inst).uncurlLeaf(leaf); }
export function bendLeaf(leaf?: any, force?: any, inst?: World): any { return resolveWorld(inst).bendLeaf(leaf, force); }
export function twistLeaf(leaf?: any, angle?: any, inst?: World): any { return resolveWorld(inst).twistLeaf(leaf, angle); }
export function flutterLeaf(leaf?: any, wind?: any, inst?: World): any { return resolveWorld(inst).flutterLeaf(leaf, wind); }
export function shakeLeaf(leaf?: any, intensity?: any, inst?: World): any { return resolveWorld(inst).shakeLeaf(leaf, intensity); }
export function droopLeaf(leaf?: any, amount?: any, inst?: World): any { return resolveWorld(inst).droopLeaf(leaf, amount); }
export function restoreLeafPose(leaf?: any, inst?: World): any { return resolveWorld(inst).restoreLeafPose(leaf); }
export function changeLeafColor(leaf?: any, color?: any, inst?: World): any { return resolveWorld(inst).changeLeafColor(leaf, color); }
export function dryLeaf(leaf?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dryLeaf(leaf, rate); }
export function detachLeaf(leaf?: any, inst?: World): any { return resolveWorld(inst).detachLeaf(leaf); }
export function fallLeaf(leaf?: any, gravity?: any, inst?: World): any { return resolveWorld(inst).fallLeaf(leaf, gravity); }
export function landLeaf(leaf?: any, surface?: any, inst?: World): any { return resolveWorld(inst).landLeaf(leaf, surface); }
export function applyWindToTree(tree?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToTree(tree, wind); }
export function applyWindToBranch(branch?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToBranch(branch, wind); }
export function applyWindToLeaf(leaf?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToLeaf(leaf, wind); }
export function calculateWindPressure(object?: any, wind?: any, inst?: World): any { return resolveWorld(inst).calculateWindPressure(object, wind); }
export function calculateWindDrag(object?: any, wind?: any, inst?: World): any { return resolveWorld(inst).calculateWindDrag(object, wind); }
export function calculateWindTorque(object?: any, wind?: any, inst?: World): any { return resolveWorld(inst).calculateWindTorque(object, wind); }
export function swayTreeTrunk(tree?: any, wind?: any, inst?: World): any { return resolveWorld(inst).swayTreeTrunk(tree, wind); }
export function swayTreeCanopy(tree?: any, wind?: any, inst?: World): any { return resolveWorld(inst).swayTreeCanopy(tree, wind); }
export function oscillateBranch(branch?: any, wind?: any, inst?: World): any { return resolveWorld(inst).oscillateBranch(branch, wind); }
export function flutterLeaves(leafGroup?: any, wind?: any, inst?: World): any { return resolveWorld(inst).flutterLeaves(leafGroup, wind); }
export function simulateWindGust(gust?: any, inst?: World): any { return resolveWorld(inst).simulateWindGust(gust); }
export function simulateTurbulentWind(wind?: any, inst?: World): any { return resolveWorld(inst).simulateTurbulentWind(wind); }
export function simulateWindShear(wind?: any, inst?: World): any { return resolveWorld(inst).simulateWindShear(wind); }
export function updateWindDirection(direction?: any, inst?: World): any { return resolveWorld(inst).updateWindDirection(direction); }
export function updateWindStrength(strength?: any, inst?: World): any { return resolveWorld(inst).updateWindStrength(strength); }
export function updateWindFrequency(frequency?: any, inst?: World): any { return resolveWorld(inst).updateWindFrequency(frequency); }
export function detectWindDamage(object?: any, inst?: World): any { return resolveWorld(inst).detectWindDamage(object); }
export function breakWindDamagedBranch(branch?: any, inst?: World): any { return resolveWorld(inst).breakWindDamagedBranch(branch); }
export function shedLeavesInWind(tree?: any, wind?: any, inst?: World): any { return resolveWorld(inst).shedLeavesInWind(tree, wind); }
export function stabilizeVegetationAfterWind(tree?: any, inst?: World): any { return resolveWorld(inst).stabilizeVegetationAfterWind(tree); }
export function createRootSystem(tree?: any, inst?: World): any { return resolveWorld(inst).createRootSystem(tree); }
export function growRoot(root?: any, amount?: any, inst?: World): any { return resolveWorld(inst).growRoot(root, amount); }
export function extendRootIntoSoil(root?: any, direction?: any, inst?: World): any { return resolveWorld(inst).extendRootIntoSoil(root, direction); }
export function thickenRoot(root?: any, amount?: any, inst?: World): any { return resolveWorld(inst).thickenRoot(root, amount); }
export function branchRootSystem(root?: any, inst?: World): any { return resolveWorld(inst).branchRootSystem(root); }
export function detectRootObstacles(root?: any, inst?: World): any { return resolveWorld(inst).detectRootObstacles(root); }
export function wrapRootAroundObstacle(root?: any, obstacle?: any, inst?: World): any { return resolveWorld(inst).wrapRootAroundObstacle(root, obstacle); }
export function penetrateSoil(root?: any, soil?: any, inst?: World): any { return resolveWorld(inst).penetrateSoil(root, soil); }
export function absorbWaterThroughRoots(root?: any, inst?: World): any { return resolveWorld(inst).absorbWaterThroughRoots(root); }
export function absorbNutrientsThroughRoots(root?: any, inst?: World): any { return resolveWorld(inst).absorbNutrientsThroughRoots(root); }
export function detectRootDamage(root?: any, inst?: World): any { return resolveWorld(inst).detectRootDamage(root); }
export function breakRoot(root?: any, force?: any, inst?: World): any { return resolveWorld(inst).breakRoot(root, force); }
export function decayRoot(root?: any, rate?: any, inst?: World): any { return resolveWorld(inst).decayRoot(root, rate); }
export function anchorTreeWithRoots(tree?: any, inst?: World): any { return resolveWorld(inst).anchorTreeWithRoots(tree); }
export function loosenRootAnchorage(tree?: any, inst?: World): any { return resolveWorld(inst).loosenRootAnchorage(tree); }
export function calculateRootStability(tree?: any, inst?: World): any { return resolveWorld(inst).calculateRootStability(tree); }
export function simulateRootCompetition(root?: any, neighbor?: any, inst?: World): any { return resolveWorld(inst).simulateRootCompetition(root, neighbor); }
export function updateRootGrowthDirection(root?: any, inst?: World): any { return resolveWorld(inst).updateRootGrowthDirection(root); }
export function regenerateRootMesh(tree?: any, inst?: World): any { return resolveWorld(inst).regenerateRootMesh(tree); }
export function updateRootSoilInteraction(tree?: any, inst?: World): any { return resolveWorld(inst).updateRootSoilInteraction(tree); }
export function createFlower(plant?: any, inst?: World): any { return resolveWorld(inst).createFlower(plant); }
export function initializeFlower(flower?: any, inst?: World): any { return resolveWorld(inst).initializeFlower(flower); }
export function growFlower(flower?: any, amount?: any, inst?: World): any { return resolveWorld(inst).growFlower(flower, amount); }
export function developFlowerBud(flower?: any, inst?: World): any { return resolveWorld(inst).developFlowerBud(flower); }
export function swellFlowerBud(flower?: any, inst?: World): any { return resolveWorld(inst).swellFlowerBud(flower); }
export function openFlowerBud(flower?: any, inst?: World): any { return resolveWorld(inst).openFlowerBud(flower); }
export function bloomFlower(flower?: any, inst?: World): any { return resolveWorld(inst).bloomFlower(flower); }
export function unfoldPetals(flower?: any, inst?: World): any { return resolveWorld(inst).unfoldPetals(flower); }
export function foldPetals(flower?: any, inst?: World): any { return resolveWorld(inst).foldPetals(flower); }
export function rotateFlower(flower?: any, angle?: any, inst?: World): any { return resolveWorld(inst).rotateFlower(flower, angle); }
export function swayFlower(flower?: any, wind?: any, inst?: World): any { return resolveWorld(inst).swayFlower(flower, wind); }
export function flutterPetals(flower?: any, wind?: any, inst?: World): any { return resolveWorld(inst).flutterPetals(flower, wind); }
export function changePetalColor(flower?: any, color?: any, inst?: World): any { return resolveWorld(inst).changePetalColor(flower, color); }
export function closeFlowerAtNight(flower?: any, inst?: World): any { return resolveWorld(inst).closeFlowerAtNight(flower); }
export function reopenFlowerAtDay(flower?: any, inst?: World): any { return resolveWorld(inst).reopenFlowerAtDay(flower); }
export function wiltFlower(flower?: any, rate?: any, inst?: World): any { return resolveWorld(inst).wiltFlower(flower, rate); }
export function dryPetals(flower?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dryPetals(flower, rate); }
export function detachPetal(petal?: any, inst?: World): any { return resolveWorld(inst).detachPetal(petal); }
export function scatterPetals(flower?: any, force?: any, inst?: World): any { return resolveWorld(inst).scatterPetals(flower, force); }
export function dropWitheredFlower(flower?: any, inst?: World): any { return resolveWorld(inst).dropWitheredFlower(flower); }
export function createFruit(plant?: any, inst?: World): any { return resolveWorld(inst).createFruit(plant); }
export function developFruit(fruit?: any, inst?: World): any { return resolveWorld(inst).developFruit(fruit); }
export function growFruit(fruit?: any, amount?: any, inst?: World): any { return resolveWorld(inst).growFruit(fruit, amount); }
export function ripenFruit(fruit?: any, rate?: any, inst?: World): any { return resolveWorld(inst).ripenFruit(fruit, rate); }
export function changeFruitColor(fruit?: any, color?: any, inst?: World): any { return resolveWorld(inst).changeFruitColor(fruit, color); }
export function softenFruit(fruit?: any, amount?: any, inst?: World): any { return resolveWorld(inst).softenFruit(fruit, amount); }
export function rotFruit(fruit?: any, rate?: any, inst?: World): any { return resolveWorld(inst).rotFruit(fruit, rate); }
export function detachFruit(fruit?: any, inst?: World): any { return resolveWorld(inst).detachFruit(fruit); }
export function fallFruit(fruit?: any, gravity?: any, inst?: World): any { return resolveWorld(inst).fallFruit(fruit, gravity); }
export function bounceFruit(fruit?: any, surface?: any, inst?: World): any { return resolveWorld(inst).bounceFruit(fruit, surface); }
export function splitFruit(fruit?: any, force?: any, inst?: World): any { return resolveWorld(inst).splitFruit(fruit, force); }
export function exposeSeeds(fruit?: any, inst?: World): any { return resolveWorld(inst).exposeSeeds(fruit); }
export function createSeed(plant?: any, inst?: World): any { return resolveWorld(inst).createSeed(plant); }
export function disperseSeed(seed?: any, force?: any, inst?: World): any { return resolveWorld(inst).disperseSeed(seed, force); }
export function burySeed(seed?: any, soil?: any, inst?: World): any { return resolveWorld(inst).burySeed(seed, soil); }
export function germinateSeed(seed?: any, inst?: World): any { return resolveWorld(inst).germinateSeed(seed); }
export function sproutSeed(seed?: any, inst?: World): any { return resolveWorld(inst).sproutSeed(seed); }
export function developSeedling(seedling?: any, inst?: World): any { return resolveWorld(inst).developSeedling(seedling); }
export function maturePlant(plant?: any, inst?: World): any { return resolveWorld(inst).maturePlant(plant); }
export function restartPlantGrowthCycle(plant?: any, inst?: World): any { return resolveWorld(inst).restartPlantGrowthCycle(plant); }
export function calculatePlantHealth(plant?: any, inst?: World): any { return resolveWorld(inst).calculatePlantHealth(plant); }
export function calculatePlantStress(plant?: any, inst?: World): any { return resolveWorld(inst).calculatePlantStress(plant); }
export function detectPlantDrought(plant?: any, inst?: World): any { return resolveWorld(inst).detectPlantDrought(plant); }
export function detectPlantDisease(plant?: any, inst?: World): any { return resolveWorld(inst).detectPlantDisease(plant); }
export function detectPlantDamage(plant?: any, inst?: World): any { return resolveWorld(inst).detectPlantDamage(plant); }
export function reducePlantVitality(plant?: any, amount?: any, inst?: World): any { return resolveWorld(inst).reducePlantVitality(plant, amount); }
export function wiltPlant(plant?: any, rate?: any, inst?: World): any { return resolveWorld(inst).wiltPlant(plant, rate); }
export function dryPlantLeaves(plant?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dryPlantLeaves(plant, rate); }
export function discolorPlantLeaves(plant?: any, color?: any, inst?: World): any { return resolveWorld(inst).discolorPlantLeaves(plant, color); }
export function shedDeadLeaves(plant?: any, inst?: World): any { return resolveWorld(inst).shedDeadLeaves(plant); }
export function killPlant(plant?: any, inst?: World): any { return resolveWorld(inst).killPlant(plant); }
export function enterDormancy(plant?: any, inst?: World): any { return resolveWorld(inst).enterDormancy(plant); }
export function resumePlantGrowth(plant?: any, inst?: World): any { return resolveWorld(inst).resumePlantGrowth(plant); }
export function decayPlantTissue(plant?: any, rate?: any, inst?: World): any { return resolveWorld(inst).decayPlantTissue(plant, rate); }
export function decomposeDeadPlant(plant?: any, inst?: World): any { return resolveWorld(inst).decomposeDeadPlant(plant); }
export function detachDeadBranch(branch?: any, inst?: World): any { return resolveWorld(inst).detachDeadBranch(branch); }
export function collapseDeadTree(tree?: any, inst?: World): any { return resolveWorld(inst).collapseDeadTree(tree); }
export function spreadPlantDisease(plant?: any, neighbor?: any, inst?: World): any { return resolveWorld(inst).spreadPlantDisease(plant, neighbor); }
export function regenerateDamagedPlant(plant?: any, inst?: World): any { return resolveWorld(inst).regenerateDamagedPlant(plant); }
export function recyclePlantNutrients(plant?: any, soil?: any, inst?: World): any { return resolveWorld(inst).recyclePlantNutrients(plant, soil); }
export function createGrassPatch(area?: any, inst?: World): any { return resolveWorld(inst).createGrassPatch(area); }
export function growGrassBlade(blade?: any, inst?: World): any { return resolveWorld(inst).growGrassBlade(blade); }
export function bendGrassBlade(blade?: any, wind?: any, inst?: World): any { return resolveWorld(inst).bendGrassBlade(blade, wind); }
export function swayGrassPatch(patch?: any, wind?: any, inst?: World): any { return resolveWorld(inst).swayGrassPatch(patch, wind); }
export function flattenGrassPatch(patch?: any, force?: any, inst?: World): any { return resolveWorld(inst).flattenGrassPatch(patch, force); }
export function restoreGrassPatch(patch?: any, inst?: World): any { return resolveWorld(inst).restoreGrassPatch(patch); }
export function trampleGrassPatch(patch?: any, inst?: World): any { return resolveWorld(inst).trampleGrassPatch(patch); }
export function regrowTrampledGrass(patch?: any, inst?: World): any { return resolveWorld(inst).regrowTrampledGrass(patch); }
export function dryGrassPatch(patch?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dryGrassPatch(patch, rate); }
export function igniteDryGrass(patch?: any, inst?: World): any { return resolveWorld(inst).igniteDryGrass(patch); }
export function createShrub(species?: any, inst?: World): any { return resolveWorld(inst).createShrub(species); }
export function growShrub(shrub?: any, amount?: any, inst?: World): any { return resolveWorld(inst).growShrub(shrub, amount); }
export function trimShrub(shrub?: any, amount?: any, inst?: World): any { return resolveWorld(inst).trimShrub(shrub, amount); }
export function crushShrub(shrub?: any, force?: any, inst?: World): any { return resolveWorld(inst).crushShrub(shrub, force); }
export function createVine(plant?: any, inst?: World): any { return resolveWorld(inst).createVine(plant); }
export function extendVine(vine?: any, amount?: any, inst?: World): any { return resolveWorld(inst).extendVine(vine, amount); }
export function wrapVineAroundObject(vine?: any, object?: any, inst?: World): any { return resolveWorld(inst).wrapVineAroundObject(vine, object); }
export function detachVine(vine?: any, inst?: World): any { return resolveWorld(inst).detachVine(vine); }
export function growMoss(surface?: any, inst?: World): any { return resolveWorld(inst).growMoss(surface); }
export function dryMoss(surface?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dryMoss(surface, rate); }
export function createRock(type?: any, inst?: World): any { return resolveWorld(inst).createRock(type); }
export function generateRockGeometry(rock?: any, inst?: World): any { return resolveWorld(inst).generateRockGeometry(rock); }
export function setRockHardness(rock?: any, hardness?: any, inst?: World): any { return resolveWorld(inst).setRockHardness(rock, hardness); }
export function applyRockStress(rock?: any, force?: any, inst?: World): any { return resolveWorld(inst).applyRockStress(rock, force); }
export function detectRockCracks(rock?: any, inst?: World): any { return resolveWorld(inst).detectRockCracks(rock); }
export function initiateRockFracture(rock?: any, inst?: World): any { return resolveWorld(inst).initiateRockFracture(rock); }
export function fractureRock(rock?: any, force?: any, inst?: World): any { return resolveWorld(inst).fractureRock(rock, force); }
export function splitRockIntoFragments(rock?: any, inst?: World): any { return resolveWorld(inst).splitRockIntoFragments(rock); }
export function chipRockSurface(rock?: any, impact?: any, inst?: World): any { return resolveWorld(inst).chipRockSurface(rock, impact); }
export function erodeRockSurface(rock?: any, rate?: any, inst?: World): any { return resolveWorld(inst).erodeRockSurface(rock, rate); }
export function weatherRock(rock?: any, weather?: any, inst?: World): any { return resolveWorld(inst).weatherRock(rock, weather); }
export function dissolveRock(rock?: any, fluid?: any, inst?: World): any { return resolveWorld(inst).dissolveRock(rock, fluid); }
export function polishRockSurface(rock?: any, amount?: any, inst?: World): any { return resolveWorld(inst).polishRockSurface(rock, amount); }
export function dislodgeRock(rock?: any, force?: any, inst?: World): any { return resolveWorld(inst).dislodgeRock(rock, force); }
export function rollRock(rock?: any, direction?: any, inst?: World): any { return resolveWorld(inst).rollRock(rock, direction); }
export function slideRock(rock?: any, surface?: any, inst?: World): any { return resolveWorld(inst).slideRock(rock, surface); }
export function toppleRock(rock?: any, force?: any, inst?: World): any { return resolveWorld(inst).toppleRock(rock, force); }
export function buryRock(rock?: any, sediment?: any, inst?: World): any { return resolveWorld(inst).buryRock(rock, sediment); }
export function exposeRock(rock?: any, erosion?: any, inst?: World): any { return resolveWorld(inst).exposeRock(rock, erosion); }
export function regenerateRockCollision(rock?: any, inst?: World): any { return resolveWorld(inst).regenerateRockCollision(rock); }
export function createMountain(region?: any, inst?: World): any { return resolveWorld(inst).createMountain(region); }
export function generateMountainTerrain(region?: any, inst?: World): any { return resolveWorld(inst).generateMountainTerrain(region); }
export function updateMountainHeight(region?: any, amount?: any, inst?: World): any { return resolveWorld(inst).updateMountainHeight(region, amount); }
export function deformMountainSurface(region?: any, force?: any, inst?: World): any { return resolveWorld(inst).deformMountainSurface(region, force); }
export function formRockyRidge(region?: any, inst?: World): any { return resolveWorld(inst).formRockyRidge(region); }
export function formMountainValley(region?: any, inst?: World): any { return resolveWorld(inst).formMountainValley(region); }
export function generateCliffFace(region?: any, inst?: World): any { return resolveWorld(inst).generateCliffFace(region); }
export function erodeMountain(region?: any, rate?: any, inst?: World): any { return resolveWorld(inst).erodeMountain(region, rate); }
export function weatherMountainSurface(region?: any, weather?: any, inst?: World): any { return resolveWorld(inst).weatherMountainSurface(region, weather); }
export function fractureMountainRock(region?: any, force?: any, inst?: World): any { return resolveWorld(inst).fractureMountainRock(region, force); }
export function triggerRockfall(region?: any, inst?: World): any { return resolveWorld(inst).triggerRockfall(region); }
export function triggerLandslide(region?: any, inst?: World): any { return resolveWorld(inst).triggerLandslide(region); }
export function collapseCliffSection(region?: any, section?: any, inst?: World): any { return resolveWorld(inst).collapseCliffSection(region, section); }
export function generateTalusSlope(region?: any, inst?: World): any { return resolveWorld(inst).generateTalusSlope(region); }
export function depositMountainSediment(region?: any, sediment?: any, inst?: World): any { return resolveWorld(inst).depositMountainSediment(region, sediment); }
export function carveRiverValley(region?: any, river?: any, inst?: World): any { return resolveWorld(inst).carveRiverValley(region, river); }
export function accumulateSnowOnMountain(region?: any, snow?: any, inst?: World): any { return resolveWorld(inst).accumulateSnowOnMountain(region, snow); }
export function meltMountainSnow(region?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).meltMountainSnow(region, temperature); }
export function calculateSlopeStability(region?: any, inst?: World): any { return resolveWorld(inst).calculateSlopeStability(region); }
export function updateMountainCollision(region?: any, inst?: World): any { return resolveWorld(inst).updateMountainCollision(region); }
export function createSoilPatch(area?: any, inst?: World): any { return resolveWorld(inst).createSoilPatch(area); }
export function initializeSoilProperties(soil?: any, inst?: World): any { return resolveWorld(inst).initializeSoilProperties(soil); }
export function compactSoil(soil?: any, force?: any, inst?: World): any { return resolveWorld(inst).compactSoil(soil, force); }
export function loosenSoil(soil?: any, amount?: any, inst?: World): any { return resolveWorld(inst).loosenSoil(soil, amount); }
export function deformSoilSurface(soil?: any, force?: any, inst?: World): any { return resolveWorld(inst).deformSoilSurface(soil, force); }
export function createFootprint(soil?: any, foot?: any, inst?: World): any { return resolveWorld(inst).createFootprint(soil, foot); }
export function eraseFootprint(soil?: any, rate?: any, inst?: World): any { return resolveWorld(inst).eraseFootprint(soil, rate); }
export function displaceSoil(soil?: any, direction?: any, inst?: World): any { return resolveWorld(inst).displaceSoil(soil, direction); }
export function excavateSoil(soil?: any, amount?: any, inst?: World): any { return resolveWorld(inst).excavateSoil(soil, amount); }
export function fillExcavation(soil?: any, material?: any, inst?: World): any { return resolveWorld(inst).fillExcavation(soil, material); }
export function erodeSoil(soil?: any, water?: any, inst?: World): any { return resolveWorld(inst).erodeSoil(soil, water); }
export function depositSediment(soil?: any, sediment?: any, inst?: World): any { return resolveWorld(inst).depositSediment(soil, sediment); }
export function liquefySoil(soil?: any, saturation?: any, inst?: World): any { return resolveWorld(inst).liquefySoil(soil, saturation); }
export function dryMud(mud?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dryMud(mud, rate); }
export function crackDryMud(mud?: any, inst?: World): any { return resolveWorld(inst).crackDryMud(mud); }
export function splashMud(mud?: any, impact?: any, inst?: World): any { return resolveWorld(inst).splashMud(mud, impact); }
export function simulateSandSliding(sand?: any, slope?: any, inst?: World): any { return resolveWorld(inst).simulateSandSliding(sand, slope); }
export function formSandDune(sand?: any, wind?: any, inst?: World): any { return resolveWorld(inst).formSandDune(sand, wind); }
export function reshapeSandDune(dune?: any, wind?: any, inst?: World): any { return resolveWorld(inst).reshapeSandDune(dune, wind); }
export function updateTerrainSurface(terrain?: any, inst?: World): any { return resolveWorld(inst).updateTerrainSurface(terrain); }
export function createWaterBody(type?: any, inst?: World): any { return resolveWorld(inst).createWaterBody(type); }
export function initializeWaterSimulation(water?: any, inst?: World): any { return resolveWorld(inst).initializeWaterSimulation(water); }
export function updateWaterSimulation(water?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateWaterSimulation(water, deltaTime); }
export function calculateWaterFlow(water?: any, inst?: World): any { return resolveWorld(inst).calculateWaterFlow(water); }
export function updateWaterLevel(water?: any, level?: any, inst?: World): any { return resolveWorld(inst).updateWaterLevel(water, level); }
export function simulateWaterCurrent(water?: any, force?: any, inst?: World): any { return resolveWorld(inst).simulateWaterCurrent(water, force); }
export function generateWaterWaves(water?: any, wind?: any, inst?: World): any { return resolveWorld(inst).generateWaterWaves(water, wind); }
export function propagateWaterWave(wave?: any, inst?: World): any { return resolveWorld(inst).propagateWaterWave(wave); }
export function reflectWaterWave(wave?: any, surface?: any, inst?: World): any { return resolveWorld(inst).reflectWaterWave(wave, surface); }
export function createWaterRipple(position?: any, inst?: World): any { return resolveWorld(inst).createWaterRipple(position); }
export function createSplash(position?: any, force?: any, inst?: World): any { return resolveWorld(inst).createSplash(position, force); }
export function simulateWaterDroplets(splash?: any, inst?: World): any { return resolveWorld(inst).simulateWaterDroplets(splash); }
export function simulateWaterfall(waterfall?: any, inst?: World): any { return resolveWorld(inst).simulateWaterfall(waterfall); }
export function simulateRiverFlow(river?: any, inst?: World): any { return resolveWorld(inst).simulateRiverFlow(river); }
export function simulateStreamFlow(stream?: any, inst?: World): any { return resolveWorld(inst).simulateStreamFlow(stream); }
export function simulateFlooding(area?: any, water?: any, inst?: World): any { return resolveWorld(inst).simulateFlooding(area, water); }
export function erodeRiverbank(riverbank?: any, water?: any, inst?: World): any { return resolveWorld(inst).erodeRiverbank(riverbank, water); }
export function depositRiverSediment(river?: any, sediment?: any, inst?: World): any { return resolveWorld(inst).depositRiverSediment(river, sediment); }
export function freezeWaterSurface(water?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).freezeWaterSurface(water, temperature); }
export function meltWaterSurface(water?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).meltWaterSurface(water, temperature); }
export function createRainSystem(inst?: World): any { return resolveWorld(inst).createRainSystem(); }
export function spawnRaindrops(area?: any, inst?: World): any { return resolveWorld(inst).spawnRaindrops(area); }
export function updateRaindropMotion(drop?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateRaindropMotion(drop, deltaTime); }
export function applyWindToRaindrops(drops?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToRaindrops(drops, wind); }
export function createRainSplash(position?: any, inst?: World): any { return resolveWorld(inst).createRainSplash(position); }
export function accumulateRainwater(surface?: any, amount?: any, inst?: World): any { return resolveWorld(inst).accumulateRainwater(surface, amount); }
export function createSnowfallSystem(inst?: World): any { return resolveWorld(inst).createSnowfallSystem(); }
export function spawnSnowflakes(area?: any, inst?: World): any { return resolveWorld(inst).spawnSnowflakes(area); }
export function updateSnowflakeMotion(flake?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateSnowflakeMotion(flake, deltaTime); }
export function accumulateSnow(surface?: any, amount?: any, inst?: World): any { return resolveWorld(inst).accumulateSnow(surface, amount); }
export function compactSnow(snow?: any, force?: any, inst?: World): any { return resolveWorld(inst).compactSnow(snow, force); }
export function meltSnow(snow?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).meltSnow(snow, temperature); }
export function createIcicle(surface?: any, inst?: World): any { return resolveWorld(inst).createIcicle(surface); }
export function growIcicle(icicle?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).growIcicle(icicle, temperature); }
export function breakIcicle(icicle?: any, force?: any, inst?: World): any { return resolveWorld(inst).breakIcicle(icicle, force); }
export function freezeWetSurface(surface?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).freezeWetSurface(surface, temperature); }
export function thawFrozenSurface(surface?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).thawFrozenSurface(surface, temperature); }
export function createHailstone(size?: any, inst?: World): any { return resolveWorld(inst).createHailstone(size); }
export function spawnHailstorm(area?: any, inst?: World): any { return resolveWorld(inst).spawnHailstorm(area); }
export function simulateHailImpact(hailstone?: any, surface?: any, inst?: World): any { return resolveWorld(inst).simulateHailImpact(hailstone, surface); }
export function createWindField(inst?: World): any { return resolveWorld(inst).createWindField(); }
export function updateWindField(field?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateWindField(field, deltaTime); }
export function setWindDirection(direction?: any, inst?: World): any { return resolveWorld(inst).setWindDirection(direction); }
export function setWindSpeed(speed?: any, inst?: World): any { return resolveWorld(inst).setWindSpeed(speed); }
export function simulateWindTurbulence(field?: any, inst?: World): any { return resolveWorld(inst).simulateWindTurbulence(field); }
export function simulateThermalUpdraft(field?: any, inst?: World): any { return resolveWorld(inst).simulateThermalUpdraft(field); }
export function simulateDowndraft(field?: any, inst?: World): any { return resolveWorld(inst).simulateDowndraft(field); }
export function simulateDustDevil(position?: any, inst?: World): any { return resolveWorld(inst).simulateDustDevil(position); }
export function simulateTornado(tornado?: any, inst?: World): any { return resolveWorld(inst).simulateTornado(tornado); }
export function applyWindToParticles(particles?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToParticles(particles, wind); }
export function applyWindToCloth(cloth?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToCloth(cloth, wind); }
export function applyWindToFlags(flags?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToFlags(flags, wind); }
export function applyWindToStructures(structures?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyWindToStructures(structures, wind); }
export function calculateWindLoad(structure?: any, wind?: any, inst?: World): any { return resolveWorld(inst).calculateWindLoad(structure, wind); }
export function updateAtmosphericPressure(field?: any, inst?: World): any { return resolveWorld(inst).updateAtmosphericPressure(field); }
export function createCloud(cloudType?: any, inst?: World): any { return resolveWorld(inst).createCloud(cloudType); }
export function generateCloudVolume(cloud?: any, inst?: World): any { return resolveWorld(inst).generateCloudVolume(cloud); }
export function updateCloudShape(cloud?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateCloudShape(cloud, deltaTime); }
export function moveCloudWithWind(cloud?: any, wind?: any, inst?: World): any { return resolveWorld(inst).moveCloudWithWind(cloud, wind); }
export function mergeClouds(cloudA?: any, cloudB?: any, inst?: World): any { return resolveWorld(inst).mergeClouds(cloudA, cloudB); }
export function separateClouds(cloudA?: any, cloudB?: any, inst?: World): any { return resolveWorld(inst).separateClouds(cloudA, cloudB); }
export function dissipateCloud(cloud?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dissipateCloud(cloud, rate); }
export function condenseCloudVapor(cloud?: any, inst?: World): any { return resolveWorld(inst).condenseCloudVapor(cloud); }
export function simulateCumulusGrowth(cloud?: any, inst?: World): any { return resolveWorld(inst).simulateCumulusGrowth(cloud); }
export function simulateStormCloudGrowth(cloud?: any, inst?: World): any { return resolveWorld(inst).simulateStormCloudGrowth(cloud); }
export function createFogVolume(area?: any, inst?: World): any { return resolveWorld(inst).createFogVolume(area); }
export function spreadFog(fog?: any, wind?: any, inst?: World): any { return resolveWorld(inst).spreadFog(fog, wind); }
export function dissipateFog(fog?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).dissipateFog(fog, temperature); }
export function simulateGroundFog(area?: any, inst?: World): any { return resolveWorld(inst).simulateGroundFog(area); }
export function simulateMistOverWater(water?: any, inst?: World): any { return resolveWorld(inst).simulateMistOverWater(water); }
export function simulateAtmosphericHaze(atmosphere?: any, inst?: World): any { return resolveWorld(inst).simulateAtmosphericHaze(atmosphere); }
export function createRainbow(atmosphere?: any, inst?: World): any { return resolveWorld(inst).createRainbow(atmosphere); }
export function updateRainbowVisibility(rainbow?: any, inst?: World): any { return resolveWorld(inst).updateRainbowVisibility(rainbow); }
export function simulateHeatShimmer(area?: any, inst?: World): any { return resolveWorld(inst).simulateHeatShimmer(area); }
export function updateSkyAtmosphere(atmosphere?: any, inst?: World): any { return resolveWorld(inst).updateSkyAtmosphere(atmosphere); }
export function createThunderstorm(area?: any, inst?: World): any { return resolveWorld(inst).createThunderstorm(area); }
export function accumulateStormEnergy(storm?: any, inst?: World): any { return resolveWorld(inst).accumulateStormEnergy(storm); }
export function generateLightningBolt(storm?: any, inst?: World): any { return resolveWorld(inst).generateLightningBolt(storm); }
export function branchLightningBolt(bolt?: any, inst?: World): any { return resolveWorld(inst).branchLightningBolt(bolt); }
export function illuminateSceneWithLightning(bolt?: any, inst?: World): any { return resolveWorld(inst).illuminateSceneWithLightning(bolt); }
export function createLightningFlash(position?: any, inst?: World): any { return resolveWorld(inst).createLightningFlash(position); }
export function calculateLightningStrikeTarget(storm?: any, inst?: World): any { return resolveWorld(inst).calculateLightningStrikeTarget(storm); }
export function strikeLightningTarget(target?: any, inst?: World): any { return resolveWorld(inst).strikeLightningTarget(target); }
export function applyLightningDamage(target?: any, inst?: World): any { return resolveWorld(inst).applyLightningDamage(target); }
export function createThunderSound(bolt?: any, inst?: World): any { return resolveWorld(inst).createThunderSound(bolt); }
export function propagateThunderWave(position?: any, inst?: World): any { return resolveWorld(inst).propagateThunderWave(position); }
export function createStormWind(storm?: any, inst?: World): any { return resolveWorld(inst).createStormWind(storm); }
export function generateStormRain(storm?: any, inst?: World): any { return resolveWorld(inst).generateStormRain(storm); }
export function spawnStormDebris(storm?: any, inst?: World): any { return resolveWorld(inst).spawnStormDebris(storm); }
export function simulateStormSurge(coast?: any, inst?: World): any { return resolveWorld(inst).simulateStormSurge(coast); }
export function calculateStormDamage(structures?: any, inst?: World): any { return resolveWorld(inst).calculateStormDamage(structures); }
export function dissipateThunderstorm(storm?: any, inst?: World): any { return resolveWorld(inst).dissipateThunderstorm(storm); }
export function simulateHurricane(hurricane?: any, inst?: World): any { return resolveWorld(inst).simulateHurricane(hurricane); }
export function simulateCyclone(cyclone?: any, inst?: World): any { return resolveWorld(inst).simulateCyclone(cyclone); }
export function updateStormRecovery(area?: any, inst?: World): any { return resolveWorld(inst).updateStormRecovery(area); }
export function createFire(source?: any, inst?: World): any { return resolveWorld(inst).createFire(source); }
export function igniteObject(object?: any, ignitionSource?: any, inst?: World): any { return resolveWorld(inst).igniteObject(object, ignitionSource); }
export function extinguishFire(fire?: any, inst?: World): any { return resolveWorld(inst).extinguishFire(fire); }
export function spreadFire(fire?: any, target?: any, inst?: World): any { return resolveWorld(inst).spreadFire(fire, target); }
export function calculateCombustionRate(object?: any, inst?: World): any { return resolveWorld(inst).calculateCombustionRate(object); }
export function calculateFireTemperature(fire?: any, inst?: World): any { return resolveWorld(inst).calculateFireTemperature(fire); }
export function updateFlameShape(fire?: any, inst?: World): any { return resolveWorld(inst).updateFlameShape(fire); }
export function spawnFireParticles(fire?: any, inst?: World): any { return resolveWorld(inst).spawnFireParticles(fire); }
export function generateSmoke(fire?: any, inst?: World): any { return resolveWorld(inst).generateSmoke(fire); }
export function spreadSmoke(smoke?: any, wind?: any, inst?: World): any { return resolveWorld(inst).spreadSmoke(smoke, wind); }
export function dissipateSmoke(smoke?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dissipateSmoke(smoke, rate); }
export function createEmber(emberSource?: any, inst?: World): any { return resolveWorld(inst).createEmber(emberSource); }
export function scatterEmbers(embers?: any, wind?: any, inst?: World): any { return resolveWorld(inst).scatterEmbers(embers, wind); }
export function igniteDryVegetation(plant?: any, inst?: World): any { return resolveWorld(inst).igniteDryVegetation(plant); }
export function charObjectSurface(object?: any, heat?: any, inst?: World): any { return resolveWorld(inst).charObjectSurface(object, heat); }
export function burnObjectMaterial(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).burnObjectMaterial(object, rate); }
export function deformObjectByHeat(object?: any, heat?: any, inst?: World): any { return resolveWorld(inst).deformObjectByHeat(object, heat); }
export function meltObjectMaterial(object?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).meltObjectMaterial(object, temperature); }
export function coolBurningObject(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).coolBurningObject(object, rate); }
export function calculateFireDamage(object?: any, inst?: World): any { return resolveWorld(inst).calculateFireDamage(object); }
export function createRockfall(region?: any, inst?: World): any { return resolveWorld(inst).createRockfall(region); }
export function releaseRockFromSlope(rock?: any, slope?: any, inst?: World): any { return resolveWorld(inst).releaseRockFromSlope(rock, slope); }
export function calculateRockfallTrajectory(rock?: any, inst?: World): any { return resolveWorld(inst).calculateRockfallTrajectory(rock); }
export function simulateRockBouncing(rock?: any, surface?: any, inst?: World): any { return resolveWorld(inst).simulateRockBouncing(rock, surface); }
export function simulateRockRolling(rock?: any, slope?: any, inst?: World): any { return resolveWorld(inst).simulateRockRolling(rock, slope); }
export function simulateRockFragmentation(rock?: any, inst?: World): any { return resolveWorld(inst).simulateRockFragmentation(rock); }
export function createLandslide(region?: any, inst?: World): any { return resolveWorld(inst).createLandslide(region); }
export function calculateSlopeFailure(region?: any, inst?: World): any { return resolveWorld(inst).calculateSlopeFailure(region); }
export function displaceLandslideSoil(landslide?: any, inst?: World): any { return resolveWorld(inst).displaceLandslideSoil(landslide); }
export function simulateDebrisFlow(flow?: any, inst?: World): any { return resolveWorld(inst).simulateDebrisFlow(flow); }
export function depositLandslideDebris(landslide?: any, inst?: World): any { return resolveWorld(inst).depositLandslideDebris(landslide); }
export function createAvalanche(region?: any, inst?: World): any { return resolveWorld(inst).createAvalanche(region); }
export function triggerSnowSlabFailure(snowpack?: any, inst?: World): any { return resolveWorld(inst).triggerSnowSlabFailure(snowpack); }
export function simulateAvalancheMotion(avalanche?: any, inst?: World): any { return resolveWorld(inst).simulateAvalancheMotion(avalanche); }
export function simulateAvalancheDebris(avalanche?: any, inst?: World): any { return resolveWorld(inst).simulateAvalancheDebris(avalanche); }
export function buryObjectsInDebris(objects?: any, debris?: any, inst?: World): any { return resolveWorld(inst).buryObjectsInDebris(objects, debris); }
export function calculateBurialDepth(object?: any, debris?: any, inst?: World): any { return resolveWorld(inst).calculateBurialDepth(object, debris); }
export function stabilizeDamagedSlope(region?: any, inst?: World): any { return resolveWorld(inst).stabilizeDamagedSlope(region); }
export function erodeUnstableSlope(region?: any, inst?: World): any { return resolveWorld(inst).erodeUnstableSlope(region); }
export function updateSlopeAfterFailure(region?: any, inst?: World): any { return resolveWorld(inst).updateSlopeAfterFailure(region); }
export function createBuilding(type?: any, inst?: World): any { return resolveWorld(inst).createBuilding(type); }
export function initializeBuilding(building?: any, inst?: World): any { return resolveWorld(inst).initializeBuilding(building); }
export function generateBuildingGeometry(building?: any, inst?: World): any { return resolveWorld(inst).generateBuildingGeometry(building); }
export function generateBuildingFoundation(building?: any, inst?: World): any { return resolveWorld(inst).generateBuildingFoundation(building); }
export function generateBuildingWalls(building?: any, inst?: World): any { return resolveWorld(inst).generateBuildingWalls(building); }
export function generateBuildingRoof(building?: any, inst?: World): any { return resolveWorld(inst).generateBuildingRoof(building); }
export function generateBuildingFloors(building?: any, inst?: World): any { return resolveWorld(inst).generateBuildingFloors(building); }
export function generateBuildingColumns(building?: any, inst?: World): any { return resolveWorld(inst).generateBuildingColumns(building); }
export function generateBuildingBeams(building?: any, inst?: World): any { return resolveWorld(inst).generateBuildingBeams(building); }
export function connectStructuralElements(building?: any, inst?: World): any { return resolveWorld(inst).connectStructuralElements(building); }
export function calculateBuildingMass(building?: any, inst?: World): any { return resolveWorld(inst).calculateBuildingMass(building); }
export function calculateBuildingCenterOfMass(building?: any, inst?: World): any { return resolveWorld(inst).calculateBuildingCenterOfMass(building); }
export function calculateStructuralStress(building?: any, inst?: World): any { return resolveWorld(inst).calculateStructuralStress(building); }
export function calculateStructuralLoad(building?: any, inst?: World): any { return resolveWorld(inst).calculateStructuralLoad(building); }
export function detectStructuralWeakness(building?: any, inst?: World): any { return resolveWorld(inst).detectStructuralWeakness(building); }
export function updateBuildingCondition(building?: any, inst?: World): any { return resolveWorld(inst).updateBuildingCondition(building); }
export function repairBuildingDamage(building?: any, inst?: World): any { return resolveWorld(inst).repairBuildingDamage(building); }
export function renovateBuilding(building?: any, inst?: World): any { return resolveWorld(inst).renovateBuilding(building); }
export function demolishBuilding(building?: any, inst?: World): any { return resolveWorld(inst).demolishBuilding(building); }
export function regenerateBuildingCollision(building?: any, inst?: World): any { return resolveWorld(inst).regenerateBuildingCollision(building); }
export function createWall(building?: any, inst?: World): any { return resolveWorld(inst).createWall(building); }
export function crackWall(wall?: any, force?: any, inst?: World): any { return resolveWorld(inst).crackWall(wall, force); }
export function chipWallSurface(wall?: any, impact?: any, inst?: World): any { return resolveWorld(inst).chipWallSurface(wall, impact); }
export function breakWall(wall?: any, force?: any, inst?: World): any { return resolveWorld(inst).breakWall(wall, force); }
export function collapseWallSection(wall?: any, section?: any, inst?: World): any { return resolveWorld(inst).collapseWallSection(wall, section); }
export function createRoof(building?: any, inst?: World): any { return resolveWorld(inst).createRoof(building); }
export function bendRoof(roof?: any, load?: any, inst?: World): any { return resolveWorld(inst).bendRoof(roof, load); }
export function crackRoof(roof?: any, force?: any, inst?: World): any { return resolveWorld(inst).crackRoof(roof, force); }
export function detachRoofPanel(roof?: any, panel?: any, inst?: World): any { return resolveWorld(inst).detachRoofPanel(roof, panel); }
export function collapseRoof(roof?: any, load?: any, inst?: World): any { return resolveWorld(inst).collapseRoof(roof, load); }
export function createDoor(building?: any, inst?: World): any { return resolveWorld(inst).createDoor(building); }
export function openDoor(door?: any, inst?: World): any { return resolveWorld(inst).openDoor(door); }
export function closeDoor(door?: any, inst?: World): any { return resolveWorld(inst).closeDoor(door); }
export function breakDoor(door?: any, force?: any, inst?: World): any { return resolveWorld(inst).breakDoor(door, force); }
export function detachDoorFromFrame(door?: any, inst?: World): any { return resolveWorld(inst).detachDoorFromFrame(door); }
export function createWindow(building?: any, inst?: World): any { return resolveWorld(inst).createWindow(building); }
export function crackWindowGlass(window?: any, impact?: any, inst?: World): any { return resolveWorld(inst).crackWindowGlass(window, impact); }
export function shatterWindowGlass(window?: any, force?: any, inst?: World): any { return resolveWorld(inst).shatterWindowGlass(window, force); }
export function scatterGlassFragments(window?: any, inst?: World): any { return resolveWorld(inst).scatterGlassFragments(window); }
export function repairWindow(window?: any, inst?: World): any { return resolveWorld(inst).repairWindow(window); }
export function initiateStructuralCollapse(building?: any, inst?: World): any { return resolveWorld(inst).initiateStructuralCollapse(building); }
export function calculateCollapseSequence(building?: any, inst?: World): any { return resolveWorld(inst).calculateCollapseSequence(building); }
export function weakenStructuralSupport(support?: any, inst?: World): any { return resolveWorld(inst).weakenStructuralSupport(support); }
export function removeStructuralSupport(support?: any, inst?: World): any { return resolveWorld(inst).removeStructuralSupport(support); }
export function fractureStructuralJoint(joint?: any, inst?: World): any { return resolveWorld(inst).fractureStructuralJoint(joint); }
export function breakStructuralBeam(beam?: any, force?: any, inst?: World): any { return resolveWorld(inst).breakStructuralBeam(beam, force); }
export function buckleStructuralColumn(column?: any, load?: any, inst?: World): any { return resolveWorld(inst).buckleStructuralColumn(column, load); }
export function triggerProgressiveCollapse(building?: any, inst?: World): any { return resolveWorld(inst).triggerProgressiveCollapse(building); }
export function simulateFloorCollapse(floor?: any, inst?: World): any { return resolveWorld(inst).simulateFloorCollapse(floor); }
export function simulateRoofCollapse(roof?: any, inst?: World): any { return resolveWorld(inst).simulateRoofCollapse(roof); }
export function detachStructuralDebris(building?: any, inst?: World): any { return resolveWorld(inst).detachStructuralDebris(building); }
export function spawnBuildingFragments(building?: any, inst?: World): any { return resolveWorld(inst).spawnBuildingFragments(building); }
export function applyImpulseToDebris(debris?: any, impulse?: any, inst?: World): any { return resolveWorld(inst).applyImpulseToDebris(debris, impulse); }
export function simulateDebrisCollision(debris?: any, inst?: World): any { return resolveWorld(inst).simulateDebrisCollision(debris); }
export function simulateDebrisPile(debris?: any, inst?: World): any { return resolveWorld(inst).simulateDebrisPile(debris); }
export function settleDebrisPile(debris?: any, inst?: World): any { return resolveWorld(inst).settleDebrisPile(debris); }
export function generateDustCloud(debris?: any, inst?: World): any { return resolveWorld(inst).generateDustCloud(debris); }
export function dissipateCollapseDust(dust?: any, inst?: World): any { return resolveWorld(inst).dissipateCollapseDust(dust); }
export function updateCollapsedBuilding(building?: any, inst?: World): any { return resolveWorld(inst).updateCollapsedBuilding(building); }
export function clearBuildingDebris(building?: any, inst?: World): any { return resolveWorld(inst).clearBuildingDebris(building); }
export function createFurniture(type?: any, inst?: World): any { return resolveWorld(inst).createFurniture(type); }
export function moveFurniture(furniture?: any, position?: any, inst?: World): any { return resolveWorld(inst).moveFurniture(furniture, position); }
export function rotateFurniture(furniture?: any, angle?: any, inst?: World): any { return resolveWorld(inst).rotateFurniture(furniture, angle); }
export function slideFurniture(furniture?: any, surface?: any, inst?: World): any { return resolveWorld(inst).slideFurniture(furniture, surface); }
export function toppleChair(chair?: any, force?: any, inst?: World): any { return resolveWorld(inst).toppleChair(chair, force); }
export function pullChair(chair?: any, direction?: any, inst?: World): any { return resolveWorld(inst).pullChair(chair, direction); }
export function pushTable(table?: any, force?: any, inst?: World): any { return resolveWorld(inst).pushTable(table, force); }
export function overturnTable(table?: any, force?: any, inst?: World): any { return resolveWorld(inst).overturnTable(table, force); }
export function openDrawer(drawer?: any, inst?: World): any { return resolveWorld(inst).openDrawer(drawer); }
export function closeDrawer(drawer?: any, inst?: World): any { return resolveWorld(inst).closeDrawer(drawer); }
export function openCabinet(cabinet?: any, inst?: World): any { return resolveWorld(inst).openCabinet(cabinet); }
export function closeCabinet(cabinet?: any, inst?: World): any { return resolveWorld(inst).closeCabinet(cabinet); }
export function breakFurnitureJoint(furniture?: any, joint?: any, inst?: World): any { return resolveWorld(inst).breakFurnitureJoint(furniture, joint); }
export function splitWoodenFurniture(furniture?: any, inst?: World): any { return resolveWorld(inst).splitWoodenFurniture(furniture); }
export function shatterCeramicObject(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).shatterCeramicObject(object, impact); }
export function breakGlassObject(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).breakGlassObject(object, impact); }
export function deformMetalObject(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).deformMetalObject(object, force); }
export function tearFabricObject(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).tearFabricObject(object, force); }
export function scatterHouseholdObjects(objects?: any, impulse?: any, inst?: World): any { return resolveWorld(inst).scatterHouseholdObjects(objects, impulse); }
export function restoreFurnitureState(furniture?: any, inst?: World): any { return resolveWorld(inst).restoreFurnitureState(furniture); }
export function initializeRigidBody(object?: any, inst?: World): any { return resolveWorld(inst).initializeRigidBody(object); }
export function setObjectMass(object?: any, mass?: any, inst?: World): any { return resolveWorld(inst).setObjectMass(object, mass); }
export function setObjectDensity(object?: any, density?: any, inst?: World): any { return resolveWorld(inst).setObjectDensity(object, density); }
export function setObjectFriction(object?: any, friction?: any, inst?: World): any { return resolveWorld(inst).setObjectFriction(object, friction); }
export function setObjectRestitution(object?: any, restitution?: any, inst?: World): any { return resolveWorld(inst).setObjectRestitution(object, restitution); }
export function applyForceToObject(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).applyForceToObject(object, force); }
export function applyImpulseToObject(object?: any, impulse?: any, inst?: World): any { return resolveWorld(inst).applyImpulseToObject(object, impulse); }
export function applyTorqueToObject(object?: any, torque?: any, inst?: World): any { return resolveWorld(inst).applyTorqueToObject(object, torque); }
export function calculateObjectVelocity(object?: any, inst?: World): any { return resolveWorld(inst).calculateObjectVelocity(object); }
export function calculateObjectAcceleration(object?: any, inst?: World): any { return resolveWorld(inst).calculateObjectAcceleration(object); }
export function calculateAngularVelocity(object?: any, inst?: World): any { return resolveWorld(inst).calculateAngularVelocity(object); }
export function simulateObjectGravity(object?: any, inst?: World): any { return resolveWorld(inst).simulateObjectGravity(object); }
export function simulateObjectAirResistance(object?: any, inst?: World): any { return resolveWorld(inst).simulateObjectAirResistance(object); }
export function detectObjectCollision(objectA?: any, objectB?: any, inst?: World): any { return resolveWorld(inst).detectObjectCollision(objectA, objectB); }
export function resolveObjectCollision(objectA?: any, objectB?: any, inst?: World): any { return resolveWorld(inst).resolveObjectCollision(objectA, objectB); }
export function calculateImpactEnergy(objectA?: any, objectB?: any, inst?: World): any { return resolveWorld(inst).calculateImpactEnergy(objectA, objectB); }
export function calculateImpactDamage(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).calculateImpactDamage(object, impact); }
export function simulateObjectPenetration(object?: any, surface?: any, inst?: World): any { return resolveWorld(inst).simulateObjectPenetration(object, surface); }
export function simulateObjectBounce(object?: any, surface?: any, inst?: World): any { return resolveWorld(inst).simulateObjectBounce(object, surface); }
export function settleRigidBody(object?: any, inst?: World): any { return resolveWorld(inst).settleRigidBody(object); }
export function initializeDestructionSystem(object?: any, inst?: World): any { return resolveWorld(inst).initializeDestructionSystem(object); }
export function defineFractureRegions(object?: any, inst?: World): any { return resolveWorld(inst).defineFractureRegions(object); }
export function calculateFractureThreshold(object?: any, inst?: World): any { return resolveWorld(inst).calculateFractureThreshold(object); }
export function detectCuttingContact(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).detectCuttingContact(object, tool); }
export function applyCuttingForce(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).applyCuttingForce(object, tool); }
export function sliceObject(object?: any, plane?: any, inst?: World): any { return resolveWorld(inst).sliceObject(object, plane); }
export function cutObjectIntoPieces(object?: any, cutPath?: any, inst?: World): any { return resolveWorld(inst).cutObjectIntoPieces(object, cutPath); }
export function severBranchWithBlade(branch?: any, blade?: any, inst?: World): any { return resolveWorld(inst).severBranchWithBlade(branch, blade); }
export function chopTreeTrunk(tree?: any, blade?: any, inst?: World): any { return resolveWorld(inst).chopTreeTrunk(tree, blade); }
export function splitWoodLog(log?: any, tool?: any, inst?: World): any { return resolveWorld(inst).splitWoodLog(log, tool); }
export function breakObjectAtJoint(object?: any, joint?: any, inst?: World): any { return resolveWorld(inst).breakObjectAtJoint(object, joint); }
export function snapObjectInHalf(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).snapObjectInHalf(object, force); }
export function fractureObjectSurface(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).fractureObjectSurface(object, impact); }
export function shatterObject(object?: any, impulse?: any, inst?: World): any { return resolveWorld(inst).shatterObject(object, impulse); }
export function splitRockWithImpact(rock?: any, impact?: any, inst?: World): any { return resolveWorld(inst).splitRockWithImpact(rock, impact); }
export function detachObjectPart(object?: any, part?: any, inst?: World): any { return resolveWorld(inst).detachObjectPart(object, part); }
export function calculateDetachedPartVelocity(part?: any, inst?: World): any { return resolveWorld(inst).calculateDetachedPartVelocity(part); }
export function spawnDetachedFragments(object?: any, inst?: World): any { return resolveWorld(inst).spawnDetachedFragments(object); }
export function applyDebrisPhysics(fragments?: any, inst?: World): any { return resolveWorld(inst).applyDebrisPhysics(fragments); }
export function finalizeObjectDestruction(object?: any, inst?: World): any { return resolveWorld(inst).finalizeObjectDestruction(object); }
export function createSoftBody(object?: any, inst?: World): any { return resolveWorld(inst).createSoftBody(object); }
export function initializeSoftBodyPhysics(object?: any, inst?: World): any { return resolveWorld(inst).initializeSoftBodyPhysics(object); }
export function deformSoftBody(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).deformSoftBody(object, force); }
export function stretchSoftBody(object?: any, amount?: any, inst?: World): any { return resolveWorld(inst).stretchSoftBody(object, amount); }
export function compressSoftBody(object?: any, amount?: any, inst?: World): any { return resolveWorld(inst).compressSoftBody(object, amount); }
export function bendSoftBody(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).bendSoftBody(object, force); }
export function twistSoftBody(object?: any, torque?: any, inst?: World): any { return resolveWorld(inst).twistSoftBody(object, torque); }
export function restoreSoftBodyShape(object?: any, inst?: World): any { return resolveWorld(inst).restoreSoftBodyShape(object); }
export function simulateClothMotion(cloth?: any, inst?: World): any { return resolveWorld(inst).simulateClothMotion(cloth); }
export function simulateClothWind(cloth?: any, wind?: any, inst?: World): any { return resolveWorld(inst).simulateClothWind(cloth, wind); }
export function foldCloth(cloth?: any, inst?: World): any { return resolveWorld(inst).foldCloth(cloth); }
export function unfoldCloth(cloth?: any, inst?: World): any { return resolveWorld(inst).unfoldCloth(cloth); }
export function tearCloth(cloth?: any, force?: any, inst?: World): any { return resolveWorld(inst).tearCloth(cloth, force); }
export function simulatePaperBending(paper?: any, force?: any, inst?: World): any { return resolveWorld(inst).simulatePaperBending(paper, force); }
export function crumplePaper(paper?: any, inst?: World): any { return resolveWorld(inst).crumplePaper(paper); }
export function tearPaper(paper?: any, force?: any, inst?: World): any { return resolveWorld(inst).tearPaper(paper, force); }
export function burnPaper(paper?: any, rate?: any, inst?: World): any { return resolveWorld(inst).burnPaper(paper, rate); }
export function simulateRopeMotion(rope?: any, inst?: World): any { return resolveWorld(inst).simulateRopeMotion(rope); }
export function stretchRope(rope?: any, force?: any, inst?: World): any { return resolveWorld(inst).stretchRope(rope, force); }
export function snapRope(rope?: any, force?: any, inst?: World): any { return resolveWorld(inst).snapRope(rope, force); }
export function createMechanicalObject(type?: any, inst?: World): any { return resolveWorld(inst).createMechanicalObject(type); }
export function initializeMechanicalJoints(object?: any, inst?: World): any { return resolveWorld(inst).initializeMechanicalJoints(object); }
export function rotateMechanicalJoint(joint?: any, angle?: any, inst?: World): any { return resolveWorld(inst).rotateMechanicalJoint(joint, angle); }
export function slideMechanicalJoint(joint?: any, distance?: any, inst?: World): any { return resolveWorld(inst).slideMechanicalJoint(joint, distance); }
export function lockMechanicalJoint(joint?: any, inst?: World): any { return resolveWorld(inst).lockMechanicalJoint(joint); }
export function unlockMechanicalJoint(joint?: any, inst?: World): any { return resolveWorld(inst).unlockMechanicalJoint(joint); }
export function applyMechanicalTorque(object?: any, torque?: any, inst?: World): any { return resolveWorld(inst).applyMechanicalTorque(object, torque); }
export function bendMetalSheet(sheet?: any, force?: any, inst?: World): any { return resolveWorld(inst).bendMetalSheet(sheet, force); }
export function dentMetalSurface(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).dentMetalSurface(object, impact); }
export function deformMetalStructure(object?: any, load?: any, inst?: World): any { return resolveWorld(inst).deformMetalStructure(object, load); }
export function fractureMetalPart(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).fractureMetalPart(object, force); }
export function fatigueMetalMaterial(object?: any, cycles?: any, inst?: World): any { return resolveWorld(inst).fatigueMetalMaterial(object, cycles); }
export function corrodeMetalSurface(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).corrodeMetalSurface(object, rate); }
export function rustMetalObject(object?: any, moisture?: any, inst?: World): any { return resolveWorld(inst).rustMetalObject(object, moisture); }
export function heatMetalObject(object?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).heatMetalObject(object, temperature); }
export function coolMetalObject(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).coolMetalObject(object, rate); }
export function expandMetalObject(object?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).expandMetalObject(object, temperature); }
export function contractMetalObject(object?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).contractMetalObject(object, temperature); }
export function jamMechanicalJoint(joint?: any, inst?: World): any { return resolveWorld(inst).jamMechanicalJoint(joint); }
export function repairMechanicalObject(object?: any, inst?: World): any { return resolveWorld(inst).repairMechanicalObject(object); }
export function createSettlement(region?: any, inst?: World): any { return resolveWorld(inst).createSettlement(region); }
export function generateBuildingPlot(region?: any, inst?: World): any { return resolveWorld(inst).generateBuildingPlot(region); }
export function placeBuildingOnTerrain(building?: any, terrain?: any, inst?: World): any { return resolveWorld(inst).placeBuildingOnTerrain(building, terrain); }
export function constructFoundation(building?: any, terrain?: any, inst?: World): any { return resolveWorld(inst).constructFoundation(building, terrain); }
export function constructWallSection(building?: any, section?: any, inst?: World): any { return resolveWorld(inst).constructWallSection(building, section); }
export function installRoofSection(building?: any, section?: any, inst?: World): any { return resolveWorld(inst).installRoofSection(building, section); }
export function installWindow(building?: any, window?: any, inst?: World): any { return resolveWorld(inst).installWindow(building, window); }
export function installDoor(building?: any, door?: any, inst?: World): any { return resolveWorld(inst).installDoor(building, door); }
export function constructBridge(region?: any, inst?: World): any { return resolveWorld(inst).constructBridge(region); }
export function constructRoad(region?: any, inst?: World): any { return resolveWorld(inst).constructRoad(region); }
export function paveRoadSurface(road?: any, inst?: World): any { return resolveWorld(inst).paveRoadSurface(road); }
export function crackRoadSurface(road?: any, load?: any, inst?: World): any { return resolveWorld(inst).crackRoadSurface(road, load); }
export function erodeRoadSurface(road?: any, weather?: any, inst?: World): any { return resolveWorld(inst).erodeRoadSurface(road, weather); }
export function generatePothole(road?: any, position?: any, inst?: World): any { return resolveWorld(inst).generatePothole(road, position); }
export function repairRoadSurface(road?: any, inst?: World): any { return resolveWorld(inst).repairRoadSurface(road); }
export function constructFence(region?: any, inst?: World): any { return resolveWorld(inst).constructFence(region); }
export function breakFenceSection(fence?: any, section?: any, inst?: World): any { return resolveWorld(inst).breakFenceSection(fence, section); }
export function constructDam(region?: any, inst?: World): any { return resolveWorld(inst).constructDam(region); }
export function breachDam(dam?: any, force?: any, inst?: World): any { return resolveWorld(inst).breachDam(dam, force); }
export function updateBuiltEnvironment(region?: any, inst?: World): any { return resolveWorld(inst).updateBuiltEnvironment(region); }
export function createEarthquake(region?: any, inst?: World): any { return resolveWorld(inst).createEarthquake(region); }
export function calculateSeismicWave(earthquake?: any, inst?: World): any { return resolveWorld(inst).calculateSeismicWave(earthquake); }
export function propagateSeismicWave(wave?: any, inst?: World): any { return resolveWorld(inst).propagateSeismicWave(wave); }
export function shakeTerrain(terrain?: any, wave?: any, inst?: World): any { return resolveWorld(inst).shakeTerrain(terrain, wave); }
export function shakeBuilding(building?: any, wave?: any, inst?: World): any { return resolveWorld(inst).shakeBuilding(building, wave); }
export function triggerGroundRupture(region?: any, inst?: World): any { return resolveWorld(inst).triggerGroundRupture(region); }
export function generateGroundCracks(region?: any, inst?: World): any { return resolveWorld(inst).generateGroundCracks(region); }
export function widenGroundCracks(region?: any, inst?: World): any { return resolveWorld(inst).widenGroundCracks(region); }
export function triggerLiquefaction(region?: any, inst?: World): any { return resolveWorld(inst).triggerLiquefaction(region); }
export function calculateSeismicDamage(region?: any, inst?: World): any { return resolveWorld(inst).calculateSeismicDamage(region); }
export function createVolcano(region?: any, inst?: World): any { return resolveWorld(inst).createVolcano(region); }
export function accumulateMagmaPressure(volcano?: any, inst?: World): any { return resolveWorld(inst).accumulateMagmaPressure(volcano); }
export function simulateMagmaMovement(volcano?: any, inst?: World): any { return resolveWorld(inst).simulateMagmaMovement(volcano); }
export function triggerVolcanicEruption(volcano?: any, inst?: World): any { return resolveWorld(inst).triggerVolcanicEruption(volcano); }
export function spawnVolcanicProjectiles(volcano?: any, inst?: World): any { return resolveWorld(inst).spawnVolcanicProjectiles(volcano); }
export function simulateLavaFlow(volcano?: any, inst?: World): any { return resolveWorld(inst).simulateLavaFlow(volcano); }
export function coolLavaFlow(lava?: any, inst?: World): any { return resolveWorld(inst).coolLavaFlow(lava); }
export function solidifyLava(lava?: any, inst?: World): any { return resolveWorld(inst).solidifyLava(lava); }
export function generateVolcanicAsh(volcano?: any, inst?: World): any { return resolveWorld(inst).generateVolcanicAsh(volcano); }
export function updateGeologicalRecovery(region?: any, inst?: World): any { return resolveWorld(inst).updateGeologicalRecovery(region); }
export function createGlacier(region?: any, inst?: World): any { return resolveWorld(inst).createGlacier(region); }
export function accumulateGlacierSnow(glacier?: any, inst?: World): any { return resolveWorld(inst).accumulateGlacierSnow(glacier); }
export function compactGlacierSnow(glacier?: any, inst?: World): any { return resolveWorld(inst).compactGlacierSnow(glacier); }
export function simulateGlacierFlow(glacier?: any, inst?: World): any { return resolveWorld(inst).simulateGlacierFlow(glacier); }
export function deformGlacierSurface(glacier?: any, inst?: World): any { return resolveWorld(inst).deformGlacierSurface(glacier); }
export function generateGlacierCrevasse(glacier?: any, inst?: World): any { return resolveWorld(inst).generateGlacierCrevasse(glacier); }
export function widenGlacierCrevasse(glacier?: any, inst?: World): any { return resolveWorld(inst).widenGlacierCrevasse(glacier); }
export function fractureGlacierIce(glacier?: any, inst?: World): any { return resolveWorld(inst).fractureGlacierIce(glacier); }
export function calveGlacierIceberg(glacier?: any, inst?: World): any { return resolveWorld(inst).calveGlacierIceberg(glacier); }
export function createIceberg(region?: any, inst?: World): any { return resolveWorld(inst).createIceberg(region); }
export function driftIceberg(iceberg?: any, current?: any, inst?: World): any { return resolveWorld(inst).driftIceberg(iceberg, current); }
export function rotateIceberg(iceberg?: any, torque?: any, inst?: World): any { return resolveWorld(inst).rotateIceberg(iceberg, torque); }
export function meltIceberg(iceberg?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).meltIceberg(iceberg, temperature); }
export function simulateSeaIceFormation(water?: any, inst?: World): any { return resolveWorld(inst).simulateSeaIceFormation(water); }
export function simulateSeaIceBreakup(ice?: any, inst?: World): any { return resolveWorld(inst).simulateSeaIceBreakup(ice); }
export function driftSeaIce(ice?: any, current?: any, inst?: World): any { return resolveWorld(inst).driftSeaIce(ice, current); }
export function collideIceFloes(iceA?: any, iceB?: any, inst?: World): any { return resolveWorld(inst).collideIceFloes(iceA, iceB); }
export function freezeGroundWater(ground?: any, inst?: World): any { return resolveWorld(inst).freezeGroundWater(ground); }
export function thawPermafrost(ground?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).thawPermafrost(ground, temperature); }
export function updateCryosphereState(region?: any, inst?: World): any { return resolveWorld(inst).updateCryosphereState(region); }
export function createSunLight(inst?: World): any { return resolveWorld(inst).createSunLight(); }
export function updateSunPosition(time?: any, inst?: World): any { return resolveWorld(inst).updateSunPosition(time); }
export function updateSunIntensity(intensity?: any, inst?: World): any { return resolveWorld(inst).updateSunIntensity(intensity); }
export function calculateSunlightDirection(inst?: World): any { return resolveWorld(inst).calculateSunlightDirection(); }
export function updateShadowDirection(inst?: World): any { return resolveWorld(inst).updateShadowDirection(); }
export function updateShadowLength(inst?: World): any { return resolveWorld(inst).updateShadowLength(); }
export function calculateSurfaceSolarHeating(surface?: any, inst?: World): any { return resolveWorld(inst).calculateSurfaceSolarHeating(surface); }
export function heatObjectSurface(object?: any, energy?: any, inst?: World): any { return resolveWorld(inst).heatObjectSurface(object, energy); }
export function coolObjectSurface(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).coolObjectSurface(object, rate); }
export function simulateThermalExpansion(object?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).simulateThermalExpansion(object, temperature); }
export function simulateThermalContraction(object?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).simulateThermalContraction(object, temperature); }
export function fadeSunlightAtDusk(inst?: World): any { return resolveWorld(inst).fadeSunlightAtDusk(); }
export function restoreSunlightAtDawn(inst?: World): any { return resolveWorld(inst).restoreSunlightAtDawn(); }
export function updateNightLighting(inst?: World): any { return resolveWorld(inst).updateNightLighting(); }
export function simulateMoonlight(inst?: World): any { return resolveWorld(inst).simulateMoonlight(); }
export function updateCloudShadowMovement(cloud?: any, inst?: World): any { return resolveWorld(inst).updateCloudShadowMovement(cloud); }
export function updateVegetationLightExposure(plant?: any, inst?: World): any { return resolveWorld(inst).updateVegetationLightExposure(plant); }
export function calculateSurfaceReflectance(surface?: any, inst?: World): any { return resolveWorld(inst).calculateSurfaceReflectance(surface); }
export function simulateHeatTransfer(objectA?: any, objectB?: any, inst?: World): any { return resolveWorld(inst).simulateHeatTransfer(objectA, objectB); }
export function updateEnvironmentalTemperature(region?: any, inst?: World): any { return resolveWorld(inst).updateEnvironmentalTemperature(region); }
export function createParticleSystem(type?: any, inst?: World): any { return resolveWorld(inst).createParticleSystem(type); }
export function spawnParticles(system?: any, count?: any, inst?: World): any { return resolveWorld(inst).spawnParticles(system, count); }
export function updateParticleMotion(particle?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateParticleMotion(particle, deltaTime); }
export function applyParticleGravity(particle?: any, inst?: World): any { return resolveWorld(inst).applyParticleGravity(particle); }
export function applyParticleWind(particle?: any, wind?: any, inst?: World): any { return resolveWorld(inst).applyParticleWind(particle, wind); }
export function calculateParticleDrag(particle?: any, inst?: World): any { return resolveWorld(inst).calculateParticleDrag(particle); }
export function simulateDustCloud(position?: any, force?: any, inst?: World): any { return resolveWorld(inst).simulateDustCloud(position, force); }
export function spreadDustCloud(cloud?: any, wind?: any, inst?: World): any { return resolveWorld(inst).spreadDustCloud(cloud, wind); }
export function dissipateDustCloud(cloud?: any, rate?: any, inst?: World): any { return resolveWorld(inst).dissipateDustCloud(cloud, rate); }
export function createSandBurst(position?: any, force?: any, inst?: World): any { return resolveWorld(inst).createSandBurst(position, force); }
export function simulateBlowingSand(sand?: any, wind?: any, inst?: World): any { return resolveWorld(inst).simulateBlowingSand(sand, wind); }
export function simulateDustDevilParticles(particles?: any, inst?: World): any { return resolveWorld(inst).simulateDustDevilParticles(particles); }
export function spawnPollenParticles(plant?: any, inst?: World): any { return resolveWorld(inst).spawnPollenParticles(plant); }
export function dispersePollen(pollen?: any, wind?: any, inst?: World): any { return resolveWorld(inst).dispersePollen(pollen, wind); }
export function spawnFallingLeaves(tree?: any, inst?: World): any { return resolveWorld(inst).spawnFallingLeaves(tree); }
export function simulateFallingLeafParticles(leaves?: any, inst?: World): any { return resolveWorld(inst).simulateFallingLeafParticles(leaves); }
export function spawnFallingPetals(flower?: any, inst?: World): any { return resolveWorld(inst).spawnFallingPetals(flower); }
export function spawnAshParticles(fire?: any, inst?: World): any { return resolveWorld(inst).spawnAshParticles(fire); }
export function simulateAshDeposition(surface?: any, ash?: any, inst?: World): any { return resolveWorld(inst).simulateAshDeposition(surface, ash); }
export function recycleExpiredParticles(system?: any, inst?: World): any { return resolveWorld(inst).recycleExpiredParticles(system); }
export function calculateWeatheringRate(object?: any, inst?: World): any { return resolveWorld(inst).calculateWeatheringRate(object); }
export function applyMechanicalWeathering(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).applyMechanicalWeathering(object, force); }
export function applyChemicalWeathering(object?: any, fluid?: any, inst?: World): any { return resolveWorld(inst).applyChemicalWeathering(object, fluid); }
export function applyFreezeThawWeathering(object?: any, temperature?: any, inst?: World): any { return resolveWorld(inst).applyFreezeThawWeathering(object, temperature); }
export function erodeObjectSurface(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).erodeObjectSurface(object, rate); }
export function erodeBuildingFacade(building?: any, rate?: any, inst?: World): any { return resolveWorld(inst).erodeBuildingFacade(building, rate); }
export function erodeRockFormation(rock?: any, water?: any, inst?: World): any { return resolveWorld(inst).erodeRockFormation(rock, water); }
export function erodeSoilLayer(soil?: any, water?: any, inst?: World): any { return resolveWorld(inst).erodeSoilLayer(soil, water); }
export function weatherWoodSurface(wood?: any, weather?: any, inst?: World): any { return resolveWorld(inst).weatherWoodSurface(wood, weather); }
export function fadePaintSurface(object?: any, sunlight?: any, inst?: World): any { return resolveWorld(inst).fadePaintSurface(object, sunlight); }
export function peelPaintSurface(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).peelPaintSurface(object, rate); }
export function corrodeConcreteSurface(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).corrodeConcreteSurface(object, rate); }
export function growMoldOnSurface(object?: any, humidity?: any, inst?: World): any { return resolveWorld(inst).growMoldOnSurface(object, humidity); }
export function spreadSurfaceMoss(object?: any, moisture?: any, inst?: World): any { return resolveWorld(inst).spreadSurfaceMoss(object, moisture); }
export function accumulateDirtOnSurface(object?: any, amount?: any, inst?: World): any { return resolveWorld(inst).accumulateDirtOnSurface(object, amount); }
export function accumulateDustOnSurface(object?: any, amount?: any, inst?: World): any { return resolveWorld(inst).accumulateDustOnSurface(object, amount); }
export function washDirtFromSurface(object?: any, water?: any, inst?: World): any { return resolveWorld(inst).washDirtFromSurface(object, water); }
export function degradeMaterialProperties(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).degradeMaterialProperties(object, rate); }
export function calculateMaterialLifetime(object?: any, inst?: World): any { return resolveWorld(inst).calculateMaterialLifetime(object); }
export function transitionObjectToRuins(object?: any, inst?: World): any { return resolveWorld(inst).transitionObjectToRuins(object); }
export function initializeEcosystem(region?: any, inst?: World): any { return resolveWorld(inst).initializeEcosystem(region); }
export function updateEcosystem(region?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateEcosystem(region, deltaTime); }
export function calculateVegetationDensity(region?: any, inst?: World): any { return resolveWorld(inst).calculateVegetationDensity(region); }
export function calculateSoilMoisture(region?: any, inst?: World): any { return resolveWorld(inst).calculateSoilMoisture(region); }
export function calculateNutrientAvailability(region?: any, inst?: World): any { return resolveWorld(inst).calculateNutrientAvailability(region); }
export function simulatePlantCompetition(plantA?: any, plantB?: any, inst?: World): any { return resolveWorld(inst).simulatePlantCompetition(plantA, plantB); }
export function simulateCanopyCompetition(treeA?: any, treeB?: any, inst?: World): any { return resolveWorld(inst).simulateCanopyCompetition(treeA, treeB); }
export function calculateLightCompetition(plant?: any, neighbors?: any, inst?: World): any { return resolveWorld(inst).calculateLightCompetition(plant, neighbors); }
export function spreadSeedsAcrossRegion(region?: any, wind?: any, inst?: World): any { return resolveWorld(inst).spreadSeedsAcrossRegion(region, wind); }
export function disperseSeedsByWater(region?: any, water?: any, inst?: World): any { return resolveWorld(inst).disperseSeedsByWater(region, water); }
export function spreadWildfireAcrossRegion(region?: any, inst?: World): any { return resolveWorld(inst).spreadWildfireAcrossRegion(region); }
export function simulateHabitatRecovery(region?: any, inst?: World): any { return resolveWorld(inst).simulateHabitatRecovery(region); }
export function regenerateVegetation(region?: any, inst?: World): any { return resolveWorld(inst).regenerateVegetation(region); }
export function restoreDamagedSoil(region?: any, inst?: World): any { return resolveWorld(inst).restoreDamagedSoil(region); }
export function simulateWetlandExpansion(region?: any, inst?: World): any { return resolveWorld(inst).simulateWetlandExpansion(region); }
export function simulateDesertification(region?: any, inst?: World): any { return resolveWorld(inst).simulateDesertification(region); }
export function simulateCoastalErosion(region?: any, inst?: World): any { return resolveWorld(inst).simulateCoastalErosion(region); }
export function simulateRiverDeltaGrowth(region?: any, inst?: World): any { return resolveWorld(inst).simulateRiverDeltaGrowth(region); }
export function updateEcosystemBalance(region?: any, inst?: World): any { return resolveWorld(inst).updateEcosystemBalance(region); }
export function initializeObjectLifecycle(object?: any, inst?: World): any { return resolveWorld(inst).initializeObjectLifecycle(object); }
export function updateObjectLifecycle(object?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateObjectLifecycle(object, deltaTime); }
export function setObjectAge(object?: any, age?: any, inst?: World): any { return resolveWorld(inst).setObjectAge(object, age); }
export function calculateObjectAge(object?: any, inst?: World): any { return resolveWorld(inst).calculateObjectAge(object); }
export function growObjectOverTime(object?: any, duration?: any, inst?: World): any { return resolveWorld(inst).growObjectOverTime(object, duration); }
export function shrinkObjectOverTime(object?: any, duration?: any, inst?: World): any { return resolveWorld(inst).shrinkObjectOverTime(object, duration); }
export function matureObject(object?: any, inst?: World): any { return resolveWorld(inst).matureObject(object); }
export function weakenObjectOverTime(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).weakenObjectOverTime(object, rate); }
export function fatigueObjectOverTime(object?: any, load?: any, inst?: World): any { return resolveWorld(inst).fatigueObjectOverTime(object, load); }
export function accumulateObjectDamage(object?: any, damage?: any, inst?: World): any { return resolveWorld(inst).accumulateObjectDamage(object, damage); }
export function recoverObjectCondition(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).recoverObjectCondition(object, rate); }
export function decayObjectOverTime(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).decayObjectOverTime(object, rate); }
export function decomposeObjectOverTime(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).decomposeObjectOverTime(object, rate); }
export function fadeObjectOverTime(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).fadeObjectOverTime(object, rate); }
export function disintegrateObjectOverTime(object?: any, rate?: any, inst?: World): any { return resolveWorld(inst).disintegrateObjectOverTime(object, rate); }
export function triggerObjectFailure(object?: any, inst?: World): any { return resolveWorld(inst).triggerObjectFailure(object); }
export function replaceObjectWithDebris(object?: any, inst?: World): any { return resolveWorld(inst).replaceObjectWithDebris(object); }
export function regenerateObjectFromState(object?: any, state?: any, inst?: World): any { return resolveWorld(inst).regenerateObjectFromState(object, state); }
export function advanceSeasonalChanges(region?: any, season?: any, inst?: World): any { return resolveWorld(inst).advanceSeasonalChanges(region, season); }
export function updateWorldAging(region?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateWorldAging(region, deltaTime); }
export function detectToolContact(tool?: any, object?: any, inst?: World): any { return resolveWorld(inst).detectToolContact(tool, object); }
export function calculateToolImpact(tool?: any, object?: any, inst?: World): any { return resolveWorld(inst).calculateToolImpact(tool, object); }
export function applyHammerImpact(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).applyHammerImpact(object, impact); }
export function strikeObjectWithTool(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).strikeObjectWithTool(object, tool); }
export function cutVegetationWithTool(plant?: any, tool?: any, inst?: World): any { return resolveWorld(inst).cutVegetationWithTool(plant, tool); }
export function sawWoodObject(wood?: any, tool?: any, inst?: World): any { return resolveWorld(inst).sawWoodObject(wood, tool); }
export function digTerrainWithTool(terrain?: any, tool?: any, inst?: World): any { return resolveWorld(inst).digTerrainWithTool(terrain, tool); }
export function excavateRockWithTool(rock?: any, tool?: any, inst?: World): any { return resolveWorld(inst).excavateRockWithTool(rock, tool); }
export function chipStoneWithTool(rock?: any, tool?: any, inst?: World): any { return resolveWorld(inst).chipStoneWithTool(rock, tool); }
export function breakIceWithTool(ice?: any, tool?: any, inst?: World): any { return resolveWorld(inst).breakIceWithTool(ice, tool); }
export function pryOpenObject(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).pryOpenObject(object, tool); }
export function leverObjectWithTool(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).leverObjectWithTool(object, tool); }
export function drillIntoMaterial(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).drillIntoMaterial(object, tool); }
export function grindMaterialSurface(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).grindMaterialSurface(object, tool); }
export function polishMaterialSurface(object?: any, tool?: any, inst?: World): any { return resolveWorld(inst).polishMaterialSurface(object, tool); }
export function weldMetalParts(partA?: any, partB?: any, inst?: World): any { return resolveWorld(inst).weldMetalParts(partA, partB); }
export function fastenStructuralParts(partA?: any, partB?: any, inst?: World): any { return resolveWorld(inst).fastenStructuralParts(partA, partB); }
export function detachFastenedPart(object?: any, part?: any, inst?: World): any { return resolveWorld(inst).detachFastenedPart(object, part); }
export function repairObjectWithMaterial(object?: any, material?: any, inst?: World): any { return resolveWorld(inst).repairObjectWithMaterial(object, material); }
export function updateToolDamage(tool?: any, impact?: any, inst?: World): any { return resolveWorld(inst).updateToolDamage(tool, impact); }
export function initializeDestructionGraph(object?: any, inst?: World): any { return resolveWorld(inst).initializeDestructionGraph(object); }
export function generateFracturePattern(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).generateFracturePattern(object, impact); }
export function calculateFracturePropagation(object?: any, inst?: World): any { return resolveWorld(inst).calculateFracturePropagation(object); }
export function propagateStructuralCrack(object?: any, crack?: any, inst?: World): any { return resolveWorld(inst).propagateStructuralCrack(object, crack); }
export function calculateBreakPoint(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).calculateBreakPoint(object, force); }
export function calculateFractureEnergy(object?: any, force?: any, inst?: World): any { return resolveWorld(inst).calculateFractureEnergy(object, force); }
export function splitMeshAlongPlane(object?: any, plane?: any, inst?: World): any { return resolveWorld(inst).splitMeshAlongPlane(object, plane); }
export function splitMeshAlongCurve(object?: any, curve?: any, inst?: World): any { return resolveWorld(inst).splitMeshAlongCurve(object, curve); }
export function createFractureCapSurface(object?: any, fracture?: any, inst?: World): any { return resolveWorld(inst).createFractureCapSurface(object, fracture); }
export function generateFractureDebris(object?: any, fracture?: any, inst?: World): any { return resolveWorld(inst).generateFractureDebris(object, fracture); }
export function assignDebrisMass(fragments?: any, inst?: World): any { return resolveWorld(inst).assignDebrisMass(fragments); }
export function assignDebrisCollision(fragments?: any, inst?: World): any { return resolveWorld(inst).assignDebrisCollision(fragments); }
export function calculateDebrisTrajectory(fragment?: any, inst?: World): any { return resolveWorld(inst).calculateDebrisTrajectory(fragment); }
export function simulateDebrisPileCollapse(pile?: any, inst?: World): any { return resolveWorld(inst).simulateDebrisPileCollapse(pile); }
export function detectSecondaryImpact(debris?: any, inst?: World): any { return resolveWorld(inst).detectSecondaryImpact(debris); }
export function triggerSecondaryFracture(object?: any, impact?: any, inst?: World): any { return resolveWorld(inst).triggerSecondaryFracture(object, impact); }
export function simulateProgressiveObjectFailure(object?: any, inst?: World): any { return resolveWorld(inst).simulateProgressiveObjectFailure(object); }
export function stabilizeRemainingStructure(object?: any, inst?: World): any { return resolveWorld(inst).stabilizeRemainingStructure(object); }
export function rebuildDestructibleMesh(object?: any, inst?: World): any { return resolveWorld(inst).rebuildDestructibleMesh(object); }
export function finalizeDestructionState(object?: any, inst?: World): any { return resolveWorld(inst).finalizeDestructionState(object); }
export function initializeWorldAnimation(inst?: World): any { return resolveWorld(inst).initializeWorldAnimation(); }
export function loadWorldAnimationClips(inst?: World): any { return resolveWorld(inst).loadWorldAnimationClips(); }
export function playWorldAnimation(object?: any, animation?: any, inst?: World): any { return resolveWorld(inst).playWorldAnimation(object, animation); }
export function blendWorldAnimations(object?: any, animations?: any, inst?: World): any { return resolveWorld(inst).blendWorldAnimations(object, animations); }
export function crossFadeWorldAnimation(object?: any, from?: any, to?: any, inst?: World): any { return resolveWorld(inst).crossFadeWorldAnimation(object, from, to); }
export function updateWorldAnimationMixer(deltaTime?: any, inst?: World): any { return resolveWorld(inst).updateWorldAnimationMixer(deltaTime); }
export function applyRootMotionToObject(object?: any, motion?: any, inst?: World): any { return resolveWorld(inst).applyRootMotionToObject(object, motion); }
export function interpolateObjectPosition(object?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).interpolateObjectPosition(object, deltaTime); }
export function interpolateObjectRotation(object?: any, deltaTime?: any, inst?: World): any { return resolveWorld(inst).interpolateObjectRotation(object, deltaTime); }
export function updateObjectLOD(object?: any, inst?: World): any { return resolveWorld(inst).updateObjectLOD(object); }
export function updateVegetationLOD(region?: any, inst?: World): any { return resolveWorld(inst).updateVegetationLOD(region); }
export function updateDestructionLOD(object?: any, inst?: World): any { return resolveWorld(inst).updateDestructionLOD(object); }
export function cullInvisibleWorldObjects(inst?: World): any { return resolveWorld(inst).cullInvisibleWorldObjects(); }
export function sleepInactiveRigidBodies(inst?: World): any { return resolveWorld(inst).sleepInactiveRigidBodies(); }
export function wakeRigidBody(object?: any, inst?: World): any { return resolveWorld(inst).wakeRigidBody(object); }
export function synchronizePhysicsAndAnimation(object?: any, inst?: World): any { return resolveWorld(inst).synchronizePhysicsAndAnimation(object); }
export function rebuildWorldCollision(region?: any, inst?: World): any { return resolveWorld(inst).rebuildWorldCollision(region); }
export function updateWorldNavigation(region?: any, inst?: World): any { return resolveWorld(inst).updateWorldNavigation(region); }
export function validateWorldSimulation(region?: any, inst?: World): any { return resolveWorld(inst).validateWorldSimulation(region); }
export function optimizeWorldSimulationPerformance(inst?: World): any { return resolveWorld(inst).optimizeWorldSimulationPerformance(); }
