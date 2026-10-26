/**
 * @file world.ts
 * @module @aetheria/engine/world/world
 * @description Master World Simulation class coordinating all 8 environmental and physical subsystems.
 */

import { WorldConfig } from './types.js';
import { WorldLifecycleSubsystem } from './subsystems/world-lifecycle.js';
import { VegetationSubsystem } from './subsystems/vegetation-subsystem.js';
import { TerrainHydrologySubsystem } from './subsystems/terrain-hydrology-subsystem.js';
import { WeatherAtmosphereSubsystem } from './subsystems/weather-atmosphere-subsystem.js';
import { BuildingArchitectureSubsystem } from './subsystems/building-architecture-subsystem.js';
import { PhysicsMaterialsSubsystem } from './subsystems/physics-materials-subsystem.js';
import { GeologyClimateSubsystem } from './subsystems/geology-climate-subsystem.js';
import { EnvironmentalDynamicsSubsystem } from './subsystems/environmental-dynamics-subsystem.js';

export class World {
  public lifecycle: WorldLifecycleSubsystem;
  public vegetation: VegetationSubsystem;
  public terrainHydrology: TerrainHydrologySubsystem;
  public weatherAtmosphere: WeatherAtmosphereSubsystem;
  public buildingArchitecture: BuildingArchitectureSubsystem;
  public physicsMaterials: PhysicsMaterialsSubsystem;
  public geologyClimate: GeologyClimateSubsystem;
  public environmentalDynamics: EnvironmentalDynamicsSubsystem;

  constructor(config?: Partial<WorldConfig>) {
    this.lifecycle = new WorldLifecycleSubsystem(config);
    this.vegetation = new VegetationSubsystem();
    this.terrainHydrology = new TerrainHydrologySubsystem();
    this.weatherAtmosphere = new WeatherAtmosphereSubsystem();
    this.buildingArchitecture = new BuildingArchitectureSubsystem();
    this.physicsMaterials = new PhysicsMaterialsSubsystem();
    this.geologyClimate = new GeologyClimateSubsystem();
    this.environmentalDynamics = new EnvironmentalDynamicsSubsystem();
  }
  public createWorld(): World { this.lifecycle.createWorld(); return this; }
  public initializeWorld(): any { return (this.lifecycle as any).initializeWorld(); }
  public destroyWorld(): any { return (this.lifecycle as any).destroyWorld(); }
  public resetWorld(): any { return (this.lifecycle as any).resetWorld(); }
  public updateWorld(deltaTime?: any): any { return (this.lifecycle as any).updateWorld(deltaTime); }
  public fixedUpdateWorld(fixedDeltaTime?: any): any { return (this.lifecycle as any).fixedUpdateWorld(fixedDeltaTime); }
  public setWorldConfig(config?: any): any { return (this.lifecycle as any).setWorldConfig(config); }
  public getWorldState(): any { return (this.lifecycle as any).getWorldState(); }
  public saveWorldState(): any { return (this.lifecycle as any).saveWorldState(); }
  public restoreWorldState(state?: any): any { return (this.lifecycle as any).restoreWorldState(state); }
  public pauseWorldSimulation(): any { return (this.lifecycle as any).pauseWorldSimulation(); }
  public resumeWorldSimulation(): any { return (this.lifecycle as any).resumeWorldSimulation(); }
  public setWorldSimulationSpeed(speed?: any): any { return (this.lifecycle as any).setWorldSimulationSpeed(speed); }
  public setWorldTime(time?: any): any { return (this.lifecycle as any).setWorldTime(time); }
  public advanceWorldTime(deltaTime?: any): any { return (this.lifecycle as any).advanceWorldTime(deltaTime); }
  public setWorldBounds(bounds?: any): any { return (this.lifecycle as any).setWorldBounds(bounds); }
  public loadWorldRegion(region?: any): any { return (this.lifecycle as any).loadWorldRegion(region); }
  public unloadWorldRegion(region?: any): any { return (this.lifecycle as any).unloadWorldRegion(region); }
  public validateWorldState(): any { return (this.lifecycle as any).validateWorldState(); }
  public optimizeWorldSimulation(): any { return (this.lifecycle as any).optimizeWorldSimulation(); }
  public createWorldObject(type?: any): any { return (this.lifecycle as any).createWorldObject(type); }
  public destroyWorldObject(object?: any): any { return (this.lifecycle as any).destroyWorldObject(object); }
  public cloneWorldObject(object?: any): any { return (this.lifecycle as any).cloneWorldObject(object); }
  public duplicateWorldObject(object?: any): any { return (this.lifecycle as any).duplicateWorldObject(object); }
  public setObjectPosition(object?: any, position?: any): any { return (this.lifecycle as any).setObjectPosition(object, position); }
  public setObjectRotation(object?: any, rotation?: any): any { return (this.lifecycle as any).setObjectRotation(object, rotation); }
  public setObjectScale(object?: any, scale?: any): any { return (this.lifecycle as any).setObjectScale(object, scale); }
  public setObjectTransform(object?: any, transform?: any): any { return (this.lifecycle as any).setObjectTransform(object, transform); }
  public getObjectTransform(object?: any): any { return (this.lifecycle as any).getObjectTransform(object); }
  public updateObjectTransform(object?: any): any { return (this.lifecycle as any).updateObjectTransform(object); }
  public setObjectVisibility(object?: any, visible?: any): any { return (this.lifecycle as any).setObjectVisibility(object, visible); }
  public setObjectMaterial(object?: any, material?: any): any { return (this.lifecycle as any).setObjectMaterial(object, material); }
  public setObjectTexture(object?: any, texture?: any): any { return (this.lifecycle as any).setObjectTexture(object, texture); }
  public setObjectTags(object?: any, tags?: any): any { return (this.lifecycle as any).setObjectTags(object, tags); }
  public getObjectTags(object?: any): any { return (this.lifecycle as any).getObjectTags(object); }
  public attachObjectToParent(object?: any, parent?: any): any { return (this.lifecycle as any).attachObjectToParent(object, parent); }
  public detachObjectFromParent(object?: any): any { return (this.lifecycle as any).detachObjectFromParent(object); }
  public transferObjectToRegion(object?: any, region?: any): any { return (this.lifecycle as any).transferObjectToRegion(object, region); }
  public serializeWorldObject(object?: any): any { return (this.lifecycle as any).serializeWorldObject(object); }
  public deserializeWorldObject(data?: any): any { return (this.lifecycle as any).deserializeWorldObject(data); }
  public createTree(species?: any): any { return (this.vegetation as any).createTree(species); }
  public initializeTree(tree?: any): any { return (this.vegetation as any).initializeTree(tree); }
  public updateTree(tree?: any, deltaTime?: any): any { return (this.vegetation as any).updateTree(tree, deltaTime); }
  public growTree(tree?: any, amount?: any): any { return (this.vegetation as any).growTree(tree, amount); }
  public setTreeAge(tree?: any, age?: any): any { return (this.vegetation as any).setTreeAge(tree, age); }
  public updateTreeHeight(tree?: any): any { return (this.vegetation as any).updateTreeHeight(tree); }
  public updateTreeThickness(tree?: any): any { return (this.vegetation as any).updateTreeThickness(tree); }
  public updateTreeCanopy(tree?: any): any { return (this.vegetation as any).updateTreeCanopy(tree); }
  public updateTreeRootSystem(tree?: any): any { return (this.vegetation as any).updateTreeRootSystem(tree); }
  public updateTreeTrunk(tree?: any): any { return (this.vegetation as any).updateTreeTrunk(tree); }
  public updateTreeBark(tree?: any): any { return (this.vegetation as any).updateTreeBark(tree); }
  public updateTreeBranchStructure(tree?: any): any { return (this.vegetation as any).updateTreeBranchStructure(tree); }
  public generateTreeBranches(tree?: any): any { return (this.vegetation as any).generateTreeBranches(tree); }
  public extendTreeBranch(branch?: any): any { return (this.vegetation as any).extendTreeBranch(branch); }
  public shortenTreeBranch(branch?: any): any { return (this.vegetation as any).shortenTreeBranch(branch); }
  public bendTreeBranch(branch?: any, force?: any): any { return (this.vegetation as any).bendTreeBranch(branch, force); }
  public twistTreeBranch(branch?: any, torque?: any): any { return (this.vegetation as any).twistTreeBranch(branch, torque); }
  public repairTreeDamage(tree?: any): any { return (this.vegetation as any).repairTreeDamage(tree); }
  public removeTree(tree?: any): any { return (this.vegetation as any).removeTree(tree); }
  public regenerateTreeGeometry(tree?: any): any { return (this.vegetation as any).regenerateTreeGeometry(tree); }
  public createBranch(tree?: any, parentBranch?: any): any { return (this.vegetation as any).createBranch(tree, parentBranch); }
  public splitBranch(branch?: any): any { return (this.vegetation as any).splitBranch(branch); }
  public growBranch(branch?: any, amount?: any): any { return (this.vegetation as any).growBranch(branch, amount); }
  public thickenBranch(branch?: any, amount?: any): any { return (this.vegetation as any).thickenBranch(branch, amount); }
  public bendBranch(branch?: any, force?: any): any { return (this.vegetation as any).bendBranch(branch, force); }
  public straightenBranch(branch?: any): any { return (this.vegetation as any).straightenBranch(branch); }
  public rotateBranch(branch?: any, angle?: any): any { return (this.vegetation as any).rotateBranch(branch, angle); }
  public twistBranch(branch?: any, angle?: any): any { return (this.vegetation as any).twistBranch(branch, angle); }
  public shakeBranch(branch?: any, intensity?: any): any { return (this.vegetation as any).shakeBranch(branch, intensity); }
  public applyBranchLoad(branch?: any, force?: any): any { return (this.vegetation as any).applyBranchLoad(branch, force); }
  public detectBranchStress(branch?: any): any { return (this.vegetation as any).detectBranchStress(branch); }
  public detectBranchFracture(branch?: any): any { return (this.vegetation as any).detectBranchFracture(branch); }
  public breakBranch(branch?: any, force?: any): any { return (this.vegetation as any).breakBranch(branch, force); }
  public snapBranchAtJoint(branch?: any, joint?: any): any { return (this.vegetation as any).snapBranchAtJoint(branch, joint); }
  public detachBranch(branch?: any): any { return (this.vegetation as any).detachBranch(branch); }
  public fallBranch(branch?: any, gravity?: any): any { return (this.vegetation as any).fallBranch(branch, gravity); }
  public splitWoodGrain(branch?: any): any { return (this.vegetation as any).splitWoodGrain(branch); }
  public crackWoodSurface(branch?: any): any { return (this.vegetation as any).crackWoodSurface(branch); }
  public decayWood(branch?: any, rate?: any): any { return (this.vegetation as any).decayWood(branch, rate); }
  public regenerateBranchMesh(branch?: any): any { return (this.vegetation as any).regenerateBranchMesh(branch); }
  public createLeaf(plant?: any): any { return (this.vegetation as any).createLeaf(plant); }
  public initializeLeaf(leaf?: any): any { return (this.vegetation as any).initializeLeaf(leaf); }
  public updateLeaf(leaf?: any, deltaTime?: any): any { return (this.vegetation as any).updateLeaf(leaf, deltaTime); }
  public growLeaf(leaf?: any, amount?: any): any { return (this.vegetation as any).growLeaf(leaf, amount); }
  public shrinkLeaf(leaf?: any, amount?: any): any { return (this.vegetation as any).shrinkLeaf(leaf, amount); }
  public unfoldLeaf(leaf?: any): any { return (this.vegetation as any).unfoldLeaf(leaf); }
  public foldLeaf(leaf?: any): any { return (this.vegetation as any).foldLeaf(leaf); }
  public curlLeaf(leaf?: any, amount?: any): any { return (this.vegetation as any).curlLeaf(leaf, amount); }
  public uncurlLeaf(leaf?: any): any { return (this.vegetation as any).uncurlLeaf(leaf); }
  public bendLeaf(leaf?: any, force?: any): any { return (this.vegetation as any).bendLeaf(leaf, force); }
  public twistLeaf(leaf?: any, angle?: any): any { return (this.vegetation as any).twistLeaf(leaf, angle); }
  public flutterLeaf(leaf?: any, wind?: any): any { return (this.vegetation as any).flutterLeaf(leaf, wind); }
  public shakeLeaf(leaf?: any, intensity?: any): any { return (this.vegetation as any).shakeLeaf(leaf, intensity); }
  public droopLeaf(leaf?: any, amount?: any): any { return (this.vegetation as any).droopLeaf(leaf, amount); }
  public restoreLeafPose(leaf?: any): any { return (this.vegetation as any).restoreLeafPose(leaf); }
  public changeLeafColor(leaf?: any, color?: any): any { return (this.vegetation as any).changeLeafColor(leaf, color); }
  public dryLeaf(leaf?: any, rate?: any): any { return (this.vegetation as any).dryLeaf(leaf, rate); }
  public detachLeaf(leaf?: any): any { return (this.vegetation as any).detachLeaf(leaf); }
  public fallLeaf(leaf?: any, gravity?: any): any { return (this.vegetation as any).fallLeaf(leaf, gravity); }
  public landLeaf(leaf?: any, surface?: any): any { return (this.vegetation as any).landLeaf(leaf, surface); }
  public applyWindToTree(tree?: any, wind?: any): any { return (this.vegetation as any).applyWindToTree(tree, wind); }
  public applyWindToBranch(branch?: any, wind?: any): any { return (this.vegetation as any).applyWindToBranch(branch, wind); }
  public applyWindToLeaf(leaf?: any, wind?: any): any { return (this.vegetation as any).applyWindToLeaf(leaf, wind); }
  public calculateWindPressure(object?: any, wind?: any): any {
    (this.vegetation as any).calculateWindPressure(object, wind);
    return (this.weatherAtmosphere as any).calculateWindPressure(object, wind);
  }
  public calculateWindDrag(object?: any, wind?: any): any {
    (this.vegetation as any).calculateWindDrag(object, wind);
    return (this.weatherAtmosphere as any).calculateWindDrag(object, wind);
  }
  public calculateWindTorque(object?: any, wind?: any): any { return (this.vegetation as any).calculateWindTorque(object, wind); }
  public swayTreeTrunk(tree?: any, wind?: any): any { return (this.vegetation as any).swayTreeTrunk(tree, wind); }
  public swayTreeCanopy(tree?: any, wind?: any): any { return (this.vegetation as any).swayTreeCanopy(tree, wind); }
  public oscillateBranch(branch?: any, wind?: any): any { return (this.vegetation as any).oscillateBranch(branch, wind); }
  public flutterLeaves(leafGroup?: any, wind?: any): any { return (this.vegetation as any).flutterLeaves(leafGroup, wind); }
  public simulateWindGust(gust?: any): any {
    (this.vegetation as any).simulateWindGust(gust);
    return (this.weatherAtmosphere as any).simulateWindGust(gust);
  }
  public simulateTurbulentWind(wind?: any): any { return (this.vegetation as any).simulateTurbulentWind(wind); }
  public simulateWindShear(wind?: any): any {
    (this.vegetation as any).simulateWindShear(wind);
    return (this.weatherAtmosphere as any).simulateWindShear(wind);
  }
  public updateWindDirection(direction?: any): any { return (this.vegetation as any).updateWindDirection(direction); }
  public updateWindStrength(strength?: any): any { return (this.vegetation as any).updateWindStrength(strength); }
  public updateWindFrequency(frequency?: any): any { return (this.vegetation as any).updateWindFrequency(frequency); }
  public detectWindDamage(object?: any): any {
    (this.vegetation as any).detectWindDamage(object);
    return (this.weatherAtmosphere as any).detectWindDamage(object);
  }
  public breakWindDamagedBranch(branch?: any): any { return (this.vegetation as any).breakWindDamagedBranch(branch); }
  public shedLeavesInWind(tree?: any, wind?: any): any { return (this.vegetation as any).shedLeavesInWind(tree, wind); }
  public stabilizeVegetationAfterWind(tree?: any): any { return (this.vegetation as any).stabilizeVegetationAfterWind(tree); }
  public createRootSystem(tree?: any): any { return (this.vegetation as any).createRootSystem(tree); }
  public growRoot(root?: any, amount?: any): any { return (this.vegetation as any).growRoot(root, amount); }
  public extendRootIntoSoil(root?: any, direction?: any): any { return (this.vegetation as any).extendRootIntoSoil(root, direction); }
  public thickenRoot(root?: any, amount?: any): any { return (this.vegetation as any).thickenRoot(root, amount); }
  public branchRootSystem(root?: any): any { return (this.vegetation as any).branchRootSystem(root); }
  public detectRootObstacles(root?: any): any { return (this.vegetation as any).detectRootObstacles(root); }
  public wrapRootAroundObstacle(root?: any, obstacle?: any): any { return (this.vegetation as any).wrapRootAroundObstacle(root, obstacle); }
  public penetrateSoil(root?: any, soil?: any): any { return (this.vegetation as any).penetrateSoil(root, soil); }
  public absorbWaterThroughRoots(root?: any): any { return (this.vegetation as any).absorbWaterThroughRoots(root); }
  public absorbNutrientsThroughRoots(root?: any): any { return (this.vegetation as any).absorbNutrientsThroughRoots(root); }
  public detectRootDamage(root?: any): any { return (this.vegetation as any).detectRootDamage(root); }
  public breakRoot(root?: any, force?: any): any { return (this.vegetation as any).breakRoot(root, force); }
  public decayRoot(root?: any, rate?: any): any { return (this.vegetation as any).decayRoot(root, rate); }
  public anchorTreeWithRoots(tree?: any): any { return (this.vegetation as any).anchorTreeWithRoots(tree); }
  public loosenRootAnchorage(tree?: any): any { return (this.vegetation as any).loosenRootAnchorage(tree); }
  public calculateRootStability(tree?: any): any { return (this.vegetation as any).calculateRootStability(tree); }
  public simulateRootCompetition(root?: any, neighbor?: any): any {
    (this.vegetation as any).simulateRootCompetition(root, neighbor);
    return (this.environmentalDynamics as any).simulateRootCompetition(root, neighbor);
  }
  public updateRootGrowthDirection(root?: any): any { return (this.vegetation as any).updateRootGrowthDirection(root); }
  public regenerateRootMesh(tree?: any): any { return (this.vegetation as any).regenerateRootMesh(tree); }
  public updateRootSoilInteraction(tree?: any): any { return (this.vegetation as any).updateRootSoilInteraction(tree); }
  public createFlower(plant?: any): any { return (this.vegetation as any).createFlower(plant); }
  public initializeFlower(flower?: any): any { return (this.vegetation as any).initializeFlower(flower); }
  public growFlower(flower?: any, amount?: any): any { return (this.vegetation as any).growFlower(flower, amount); }
  public developFlowerBud(flower?: any): any { return (this.vegetation as any).developFlowerBud(flower); }
  public swellFlowerBud(flower?: any): any { return (this.vegetation as any).swellFlowerBud(flower); }
  public openFlowerBud(flower?: any): any { return (this.vegetation as any).openFlowerBud(flower); }
  public bloomFlower(flower?: any): any { return (this.vegetation as any).bloomFlower(flower); }
  public unfoldPetals(flower?: any): any { return (this.vegetation as any).unfoldPetals(flower); }
  public foldPetals(flower?: any): any { return (this.vegetation as any).foldPetals(flower); }
  public rotateFlower(flower?: any, angle?: any): any { return (this.vegetation as any).rotateFlower(flower, angle); }
  public swayFlower(flower?: any, wind?: any): any { return (this.vegetation as any).swayFlower(flower, wind); }
  public flutterPetals(flower?: any, wind?: any): any { return (this.vegetation as any).flutterPetals(flower, wind); }
  public changePetalColor(flower?: any, color?: any): any { return (this.vegetation as any).changePetalColor(flower, color); }
  public closeFlowerAtNight(flower?: any): any { return (this.vegetation as any).closeFlowerAtNight(flower); }
  public reopenFlowerAtDay(flower?: any): any { return (this.vegetation as any).reopenFlowerAtDay(flower); }
  public wiltFlower(flower?: any, rate?: any): any { return (this.vegetation as any).wiltFlower(flower, rate); }
  public dryPetals(flower?: any, rate?: any): any { return (this.vegetation as any).dryPetals(flower, rate); }
  public detachPetal(petal?: any): any { return (this.vegetation as any).detachPetal(petal); }
  public scatterPetals(flower?: any, force?: any): any { return (this.vegetation as any).scatterPetals(flower, force); }
  public dropWitheredFlower(flower?: any): any { return (this.vegetation as any).dropWitheredFlower(flower); }
  public createFruit(plant?: any): any { return (this.vegetation as any).createFruit(plant); }
  public developFruit(fruit?: any): any { return (this.vegetation as any).developFruit(fruit); }
  public growFruit(fruit?: any, amount?: any): any { return (this.vegetation as any).growFruit(fruit, amount); }
  public ripenFruit(fruit?: any, rate?: any): any { return (this.vegetation as any).ripenFruit(fruit, rate); }
  public changeFruitColor(fruit?: any, color?: any): any { return (this.vegetation as any).changeFruitColor(fruit, color); }
  public softenFruit(fruit?: any, amount?: any): any { return (this.vegetation as any).softenFruit(fruit, amount); }
  public rotFruit(fruit?: any, rate?: any): any { return (this.vegetation as any).rotFruit(fruit, rate); }
  public detachFruit(fruit?: any): any { return (this.vegetation as any).detachFruit(fruit); }
  public fallFruit(fruit?: any, gravity?: any): any { return (this.vegetation as any).fallFruit(fruit, gravity); }
  public bounceFruit(fruit?: any, surface?: any): any { return (this.vegetation as any).bounceFruit(fruit, surface); }
  public splitFruit(fruit?: any, force?: any): any { return (this.vegetation as any).splitFruit(fruit, force); }
  public exposeSeeds(fruit?: any): any { return (this.vegetation as any).exposeSeeds(fruit); }
  public createSeed(plant?: any): any { return (this.vegetation as any).createSeed(plant); }
  public disperseSeed(seed?: any, force?: any): any { return (this.vegetation as any).disperseSeed(seed, force); }
  public burySeed(seed?: any, soil?: any): any { return (this.vegetation as any).burySeed(seed, soil); }
  public germinateSeed(seed?: any): any { return (this.vegetation as any).germinateSeed(seed); }
  public sproutSeed(seed?: any): any { return (this.vegetation as any).sproutSeed(seed); }
  public developSeedling(seedling?: any): any { return (this.vegetation as any).developSeedling(seedling); }
  public maturePlant(plant?: any): any { return (this.vegetation as any).maturePlant(plant); }
  public restartPlantGrowthCycle(plant?: any): any { return (this.vegetation as any).restartPlantGrowthCycle(plant); }
  public calculatePlantHealth(plant?: any): any { return (this.vegetation as any).calculatePlantHealth(plant); }
  public calculatePlantStress(plant?: any): any { return (this.vegetation as any).calculatePlantStress(plant); }
  public detectPlantDrought(plant?: any): any { return (this.vegetation as any).detectPlantDrought(plant); }
  public detectPlantDisease(plant?: any): any { return (this.vegetation as any).detectPlantDisease(plant); }
  public detectPlantDamage(plant?: any): any { return (this.vegetation as any).detectPlantDamage(plant); }
  public reducePlantVitality(plant?: any, amount?: any): any { return (this.vegetation as any).reducePlantVitality(plant, amount); }
  public wiltPlant(plant?: any, rate?: any): any { return (this.vegetation as any).wiltPlant(plant, rate); }
  public dryPlantLeaves(plant?: any, rate?: any): any { return (this.vegetation as any).dryPlantLeaves(plant, rate); }
  public discolorPlantLeaves(plant?: any, color?: any): any { return (this.vegetation as any).discolorPlantLeaves(plant, color); }
  public shedDeadLeaves(plant?: any): any { return (this.vegetation as any).shedDeadLeaves(plant); }
  public killPlant(plant?: any): any { return (this.vegetation as any).killPlant(plant); }
  public enterDormancy(plant?: any): any { return (this.vegetation as any).enterDormancy(plant); }
  public resumePlantGrowth(plant?: any): any { return (this.vegetation as any).resumePlantGrowth(plant); }
  public decayPlantTissue(plant?: any, rate?: any): any { return (this.vegetation as any).decayPlantTissue(plant, rate); }
  public decomposeDeadPlant(plant?: any): any { return (this.vegetation as any).decomposeDeadPlant(plant); }
  public detachDeadBranch(branch?: any): any { return (this.vegetation as any).detachDeadBranch(branch); }
  public collapseDeadTree(tree?: any): any { return (this.vegetation as any).collapseDeadTree(tree); }
  public spreadPlantDisease(plant?: any, neighbor?: any): any { return (this.vegetation as any).spreadPlantDisease(plant, neighbor); }
  public regenerateDamagedPlant(plant?: any): any { return (this.vegetation as any).regenerateDamagedPlant(plant); }
  public recyclePlantNutrients(plant?: any, soil?: any): any { return (this.vegetation as any).recyclePlantNutrients(plant, soil); }
  public createGrassPatch(area?: any): any { return (this.vegetation as any).createGrassPatch(area); }
  public growGrassBlade(blade?: any): any { return (this.vegetation as any).growGrassBlade(blade); }
  public bendGrassBlade(blade?: any, wind?: any): any { return (this.vegetation as any).bendGrassBlade(blade, wind); }
  public swayGrassPatch(patch?: any, wind?: any): any { return (this.vegetation as any).swayGrassPatch(patch, wind); }
  public flattenGrassPatch(patch?: any, force?: any): any { return (this.vegetation as any).flattenGrassPatch(patch, force); }
  public restoreGrassPatch(patch?: any): any { return (this.vegetation as any).restoreGrassPatch(patch); }
  public trampleGrassPatch(patch?: any): any { return (this.vegetation as any).trampleGrassPatch(patch); }
  public regrowTrampledGrass(patch?: any): any { return (this.vegetation as any).regrowTrampledGrass(patch); }
  public dryGrassPatch(patch?: any, rate?: any): any { return (this.vegetation as any).dryGrassPatch(patch, rate); }
  public igniteDryGrass(patch?: any): any { return (this.vegetation as any).igniteDryGrass(patch); }
  public createShrub(species?: any): any { return (this.vegetation as any).createShrub(species); }
  public growShrub(shrub?: any, amount?: any): any { return (this.vegetation as any).growShrub(shrub, amount); }
  public trimShrub(shrub?: any, amount?: any): any { return (this.vegetation as any).trimShrub(shrub, amount); }
  public crushShrub(shrub?: any, force?: any): any { return (this.vegetation as any).crushShrub(shrub, force); }
  public createVine(plant?: any): any { return (this.vegetation as any).createVine(plant); }
  public extendVine(vine?: any, amount?: any): any { return (this.vegetation as any).extendVine(vine, amount); }
  public wrapVineAroundObject(vine?: any, object?: any): any { return (this.vegetation as any).wrapVineAroundObject(vine, object); }
  public detachVine(vine?: any): any { return (this.vegetation as any).detachVine(vine); }
  public growMoss(surface?: any): any { return (this.vegetation as any).growMoss(surface); }
  public dryMoss(surface?: any, rate?: any): any { return (this.vegetation as any).dryMoss(surface, rate); }
  public createRock(type?: any): any { return (this.terrainHydrology as any).createRock(type); }
  public generateRockGeometry(rock?: any): any { return (this.terrainHydrology as any).generateRockGeometry(rock); }
  public setRockHardness(rock?: any, hardness?: any): any { return (this.terrainHydrology as any).setRockHardness(rock, hardness); }
  public applyRockStress(rock?: any, force?: any): any { return (this.terrainHydrology as any).applyRockStress(rock, force); }
  public detectRockCracks(rock?: any): any { return (this.terrainHydrology as any).detectRockCracks(rock); }
  public initiateRockFracture(rock?: any): any { return (this.terrainHydrology as any).initiateRockFracture(rock); }
  public fractureRock(rock?: any, force?: any): any { return (this.terrainHydrology as any).fractureRock(rock, force); }
  public splitRockIntoFragments(rock?: any): any { return (this.terrainHydrology as any).splitRockIntoFragments(rock); }
  public chipRockSurface(rock?: any, impact?: any): any { return (this.terrainHydrology as any).chipRockSurface(rock, impact); }
  public erodeRockSurface(rock?: any, rate?: any): any { return (this.terrainHydrology as any).erodeRockSurface(rock, rate); }
  public weatherRock(rock?: any, weather?: any): any { return (this.terrainHydrology as any).weatherRock(rock, weather); }
  public dissolveRock(rock?: any, fluid?: any): any { return (this.terrainHydrology as any).dissolveRock(rock, fluid); }
  public polishRockSurface(rock?: any, amount?: any): any { return (this.terrainHydrology as any).polishRockSurface(rock, amount); }
  public dislodgeRock(rock?: any, force?: any): any { return (this.terrainHydrology as any).dislodgeRock(rock, force); }
  public rollRock(rock?: any, direction?: any): any { return (this.terrainHydrology as any).rollRock(rock, direction); }
  public slideRock(rock?: any, surface?: any): any { return (this.terrainHydrology as any).slideRock(rock, surface); }
  public toppleRock(rock?: any, force?: any): any { return (this.terrainHydrology as any).toppleRock(rock, force); }
  public buryRock(rock?: any, sediment?: any): any { return (this.terrainHydrology as any).buryRock(rock, sediment); }
  public exposeRock(rock?: any, erosion?: any): any { return (this.terrainHydrology as any).exposeRock(rock, erosion); }
  public regenerateRockCollision(rock?: any): any { return (this.terrainHydrology as any).regenerateRockCollision(rock); }
  public createMountain(region?: any): any { return (this.terrainHydrology as any).createMountain(region); }
  public generateMountainTerrain(region?: any): any { return (this.terrainHydrology as any).generateMountainTerrain(region); }
  public updateMountainHeight(region?: any, amount?: any): any { return (this.terrainHydrology as any).updateMountainHeight(region, amount); }
  public deformMountainSurface(region?: any, force?: any): any { return (this.terrainHydrology as any).deformMountainSurface(region, force); }
  public formRockyRidge(region?: any): any { return (this.terrainHydrology as any).formRockyRidge(region); }
  public formMountainValley(region?: any): any { return (this.terrainHydrology as any).formMountainValley(region); }
  public generateCliffFace(region?: any): any { return (this.terrainHydrology as any).generateCliffFace(region); }
  public erodeMountain(region?: any, rate?: any): any { return (this.terrainHydrology as any).erodeMountain(region, rate); }
  public weatherMountainSurface(region?: any, weather?: any): any { return (this.terrainHydrology as any).weatherMountainSurface(region, weather); }
  public fractureMountainRock(region?: any, force?: any): any { return (this.terrainHydrology as any).fractureMountainRock(region, force); }
  public triggerRockfall(region?: any): any { return (this.terrainHydrology as any).triggerRockfall(region); }
  public triggerLandslide(region?: any): any { return (this.terrainHydrology as any).triggerLandslide(region); }
  public collapseCliffSection(region?: any, section?: any): any { return (this.terrainHydrology as any).collapseCliffSection(region, section); }
  public generateTalusSlope(region?: any): any { return (this.terrainHydrology as any).generateTalusSlope(region); }
  public depositMountainSediment(region?: any, sediment?: any): any { return (this.terrainHydrology as any).depositMountainSediment(region, sediment); }
  public carveRiverValley(region?: any, river?: any): any { return (this.terrainHydrology as any).carveRiverValley(region, river); }
  public accumulateSnowOnMountain(region?: any, snow?: any): any { return (this.terrainHydrology as any).accumulateSnowOnMountain(region, snow); }
  public meltMountainSnow(region?: any, temperature?: any): any { return (this.terrainHydrology as any).meltMountainSnow(region, temperature); }
  public calculateSlopeStability(region?: any): any { return (this.terrainHydrology as any).calculateSlopeStability(region); }
  public updateMountainCollision(region?: any): any { return (this.terrainHydrology as any).updateMountainCollision(region); }
  public createSoilPatch(area?: any): any { return (this.terrainHydrology as any).createSoilPatch(area); }
  public initializeSoilProperties(soil?: any): any { return (this.terrainHydrology as any).initializeSoilProperties(soil); }
  public compactSoil(soil?: any, force?: any): any { return (this.terrainHydrology as any).compactSoil(soil, force); }
  public loosenSoil(soil?: any, amount?: any): any { return (this.terrainHydrology as any).loosenSoil(soil, amount); }
  public deformSoilSurface(soil?: any, force?: any): any { return (this.terrainHydrology as any).deformSoilSurface(soil, force); }
  public createFootprint(soil?: any, foot?: any): any { return (this.terrainHydrology as any).createFootprint(soil, foot); }
  public eraseFootprint(soil?: any, rate?: any): any { return (this.terrainHydrology as any).eraseFootprint(soil, rate); }
  public displaceSoil(soil?: any, direction?: any): any { return (this.terrainHydrology as any).displaceSoil(soil, direction); }
  public excavateSoil(soil?: any, amount?: any): any { return (this.terrainHydrology as any).excavateSoil(soil, amount); }
  public fillExcavation(soil?: any, material?: any): any { return (this.terrainHydrology as any).fillExcavation(soil, material); }
  public erodeSoil(soil?: any, water?: any): any { return (this.terrainHydrology as any).erodeSoil(soil, water); }
  public depositSediment(soil?: any, sediment?: any): any { return (this.terrainHydrology as any).depositSediment(soil, sediment); }
  public liquefySoil(soil?: any, saturation?: any): any { return (this.terrainHydrology as any).liquefySoil(soil, saturation); }
  public dryMud(mud?: any, rate?: any): any { return (this.terrainHydrology as any).dryMud(mud, rate); }
  public crackDryMud(mud?: any): any { return (this.terrainHydrology as any).crackDryMud(mud); }
  public splashMud(mud?: any, impact?: any): any { return (this.terrainHydrology as any).splashMud(mud, impact); }
  public simulateSandSliding(sand?: any, slope?: any): any { return (this.terrainHydrology as any).simulateSandSliding(sand, slope); }
  public formSandDune(sand?: any, wind?: any): any { return (this.terrainHydrology as any).formSandDune(sand, wind); }
  public reshapeSandDune(dune?: any, wind?: any): any { return (this.terrainHydrology as any).reshapeSandDune(dune, wind); }
  public updateTerrainSurface(terrain?: any): any { return (this.terrainHydrology as any).updateTerrainSurface(terrain); }
  public createWaterBody(type?: any): any { return (this.terrainHydrology as any).createWaterBody(type); }
  public initializeWaterSimulation(water?: any): any { return (this.terrainHydrology as any).initializeWaterSimulation(water); }
  public updateWaterSimulation(water?: any, deltaTime?: any): any { return (this.terrainHydrology as any).updateWaterSimulation(water, deltaTime); }
  public calculateWaterFlow(water?: any): any { return (this.terrainHydrology as any).calculateWaterFlow(water); }
  public updateWaterLevel(water?: any, level?: any): any { return (this.terrainHydrology as any).updateWaterLevel(water, level); }
  public simulateWaterCurrent(water?: any, force?: any): any { return (this.terrainHydrology as any).simulateWaterCurrent(water, force); }
  public generateWaterWaves(water?: any, wind?: any): any { return (this.terrainHydrology as any).generateWaterWaves(water, wind); }
  public propagateWaterWave(wave?: any): any { return (this.terrainHydrology as any).propagateWaterWave(wave); }
  public reflectWaterWave(wave?: any, surface?: any): any { return (this.terrainHydrology as any).reflectWaterWave(wave, surface); }
  public createWaterRipple(position?: any): any { return (this.terrainHydrology as any).createWaterRipple(position); }
  public createSplash(position?: any, force?: any): any { return (this.terrainHydrology as any).createSplash(position, force); }
  public simulateWaterDroplets(splash?: any): any { return (this.terrainHydrology as any).simulateWaterDroplets(splash); }
  public simulateWaterfall(waterfall?: any): any { return (this.terrainHydrology as any).simulateWaterfall(waterfall); }
  public simulateRiverFlow(river?: any): any { return (this.terrainHydrology as any).simulateRiverFlow(river); }
  public simulateStreamFlow(stream?: any): any { return (this.terrainHydrology as any).simulateStreamFlow(stream); }
  public simulateFlooding(area?: any, water?: any): any { return (this.terrainHydrology as any).simulateFlooding(area, water); }
  public erodeRiverbank(riverbank?: any, water?: any): any { return (this.terrainHydrology as any).erodeRiverbank(riverbank, water); }
  public depositRiverSediment(river?: any, sediment?: any): any { return (this.terrainHydrology as any).depositRiverSediment(river, sediment); }
  public freezeWaterSurface(water?: any, temperature?: any): any { return (this.terrainHydrology as any).freezeWaterSurface(water, temperature); }
  public meltWaterSurface(water?: any, temperature?: any): any { return (this.terrainHydrology as any).meltWaterSurface(water, temperature); }
  public createRainSystem(): any { return (this.weatherAtmosphere as any).createRainSystem(); }
  public spawnRaindrops(area?: any): any { return (this.weatherAtmosphere as any).spawnRaindrops(area); }
  public updateRaindropMotion(drop?: any, deltaTime?: any): any { return (this.weatherAtmosphere as any).updateRaindropMotion(drop, deltaTime); }
  public applyWindToRaindrops(drops?: any, wind?: any): any { return (this.weatherAtmosphere as any).applyWindToRaindrops(drops, wind); }
  public createRainSplash(position?: any): any { return (this.weatherAtmosphere as any).createRainSplash(position); }
  public accumulateRainwater(surface?: any, amount?: any): any { return (this.weatherAtmosphere as any).accumulateRainwater(surface, amount); }
  public createSnowfallSystem(): any { return (this.weatherAtmosphere as any).createSnowfallSystem(); }
  public spawnSnowflakes(area?: any): any { return (this.weatherAtmosphere as any).spawnSnowflakes(area); }
  public updateSnowflakeMotion(flake?: any, deltaTime?: any): any { return (this.weatherAtmosphere as any).updateSnowflakeMotion(flake, deltaTime); }
  public accumulateSnow(surface?: any, amount?: any): any { return (this.weatherAtmosphere as any).accumulateSnow(surface, amount); }
  public compactSnow(snow?: any, force?: any): any { return (this.weatherAtmosphere as any).compactSnow(snow, force); }
  public meltSnow(snow?: any, temperature?: any): any { return (this.weatherAtmosphere as any).meltSnow(snow, temperature); }
  public createIcicle(surface?: any): any { return (this.weatherAtmosphere as any).createIcicle(surface); }
  public growIcicle(icicle?: any, temperature?: any): any { return (this.weatherAtmosphere as any).growIcicle(icicle, temperature); }
  public breakIcicle(icicle?: any, force?: any): any { return (this.weatherAtmosphere as any).breakIcicle(icicle, force); }
  public freezeWetSurface(surface?: any, temperature?: any): any { return (this.weatherAtmosphere as any).freezeWetSurface(surface, temperature); }
  public thawFrozenSurface(surface?: any, temperature?: any): any { return (this.weatherAtmosphere as any).thawFrozenSurface(surface, temperature); }
  public createHailstone(size?: any): any { return (this.weatherAtmosphere as any).createHailstone(size); }
  public spawnHailstorm(area?: any): any { return (this.weatherAtmosphere as any).spawnHailstorm(area); }
  public simulateHailImpact(hailstone?: any, surface?: any): any { return (this.weatherAtmosphere as any).simulateHailImpact(hailstone, surface); }
  public createWindField(): any { return (this.weatherAtmosphere as any).createWindField(); }
  public updateWindField(field?: any, deltaTime?: any): any { return (this.weatherAtmosphere as any).updateWindField(field, deltaTime); }
  public setWindDirection(direction?: any): any { return (this.weatherAtmosphere as any).setWindDirection(direction); }
  public setWindSpeed(speed?: any): any { return (this.weatherAtmosphere as any).setWindSpeed(speed); }
  public simulateWindTurbulence(field?: any): any { return (this.weatherAtmosphere as any).simulateWindTurbulence(field); }
  public simulateThermalUpdraft(field?: any): any { return (this.weatherAtmosphere as any).simulateThermalUpdraft(field); }
  public simulateDowndraft(field?: any): any { return (this.weatherAtmosphere as any).simulateDowndraft(field); }
  public simulateDustDevil(position?: any): any { return (this.weatherAtmosphere as any).simulateDustDevil(position); }
  public simulateTornado(tornado?: any): any { return (this.weatherAtmosphere as any).simulateTornado(tornado); }
  public applyWindToParticles(particles?: any, wind?: any): any { return (this.weatherAtmosphere as any).applyWindToParticles(particles, wind); }
  public applyWindToCloth(cloth?: any, wind?: any): any { return (this.weatherAtmosphere as any).applyWindToCloth(cloth, wind); }
  public applyWindToFlags(flags?: any, wind?: any): any { return (this.weatherAtmosphere as any).applyWindToFlags(flags, wind); }
  public applyWindToStructures(structures?: any, wind?: any): any { return (this.weatherAtmosphere as any).applyWindToStructures(structures, wind); }
  public calculateWindLoad(structure?: any, wind?: any): any { return (this.weatherAtmosphere as any).calculateWindLoad(structure, wind); }
  public updateAtmosphericPressure(field?: any): any { return (this.weatherAtmosphere as any).updateAtmosphericPressure(field); }
  public createCloud(cloudType?: any): any { return (this.weatherAtmosphere as any).createCloud(cloudType); }
  public generateCloudVolume(cloud?: any): any { return (this.weatherAtmosphere as any).generateCloudVolume(cloud); }
  public updateCloudShape(cloud?: any, deltaTime?: any): any { return (this.weatherAtmosphere as any).updateCloudShape(cloud, deltaTime); }
  public moveCloudWithWind(cloud?: any, wind?: any): any { return (this.weatherAtmosphere as any).moveCloudWithWind(cloud, wind); }
  public mergeClouds(cloudA?: any, cloudB?: any): any { return (this.weatherAtmosphere as any).mergeClouds(cloudA, cloudB); }
  public separateClouds(cloudA?: any, cloudB?: any): any { return (this.weatherAtmosphere as any).separateClouds(cloudA, cloudB); }
  public dissipateCloud(cloud?: any, rate?: any): any { return (this.weatherAtmosphere as any).dissipateCloud(cloud, rate); }
  public condenseCloudVapor(cloud?: any): any { return (this.weatherAtmosphere as any).condenseCloudVapor(cloud); }
  public simulateCumulusGrowth(cloud?: any): any { return (this.weatherAtmosphere as any).simulateCumulusGrowth(cloud); }
  public simulateStormCloudGrowth(cloud?: any): any { return (this.weatherAtmosphere as any).simulateStormCloudGrowth(cloud); }
  public createFogVolume(area?: any): any { return (this.weatherAtmosphere as any).createFogVolume(area); }
  public spreadFog(fog?: any, wind?: any): any { return (this.weatherAtmosphere as any).spreadFog(fog, wind); }
  public dissipateFog(fog?: any, temperature?: any): any { return (this.weatherAtmosphere as any).dissipateFog(fog, temperature); }
  public simulateGroundFog(area?: any): any { return (this.weatherAtmosphere as any).simulateGroundFog(area); }
  public simulateMistOverWater(water?: any): any { return (this.weatherAtmosphere as any).simulateMistOverWater(water); }
  public simulateAtmosphericHaze(atmosphere?: any): any { return (this.weatherAtmosphere as any).simulateAtmosphericHaze(atmosphere); }
  public createRainbow(atmosphere?: any): any { return (this.weatherAtmosphere as any).createRainbow(atmosphere); }
  public updateRainbowVisibility(rainbow?: any): any { return (this.weatherAtmosphere as any).updateRainbowVisibility(rainbow); }
  public simulateHeatShimmer(area?: any): any { return (this.weatherAtmosphere as any).simulateHeatShimmer(area); }
  public updateSkyAtmosphere(atmosphere?: any): any { return (this.weatherAtmosphere as any).updateSkyAtmosphere(atmosphere); }
  public createThunderstorm(area?: any): any { return (this.weatherAtmosphere as any).createThunderstorm(area); }
  public accumulateStormEnergy(storm?: any): any { return (this.weatherAtmosphere as any).accumulateStormEnergy(storm); }
  public generateLightningBolt(storm?: any): any { return (this.weatherAtmosphere as any).generateLightningBolt(storm); }
  public branchLightningBolt(bolt?: any): any { return (this.weatherAtmosphere as any).branchLightningBolt(bolt); }
  public illuminateSceneWithLightning(bolt?: any): any { return (this.weatherAtmosphere as any).illuminateSceneWithLightning(bolt); }
  public createLightningFlash(position?: any): any { return (this.weatherAtmosphere as any).createLightningFlash(position); }
  public calculateLightningStrikeTarget(storm?: any): any { return (this.weatherAtmosphere as any).calculateLightningStrikeTarget(storm); }
  public strikeLightningTarget(target?: any): any { return (this.weatherAtmosphere as any).strikeLightningTarget(target); }
  public applyLightningDamage(target?: any): any { return (this.weatherAtmosphere as any).applyLightningDamage(target); }
  public createThunderSound(bolt?: any): any { return (this.weatherAtmosphere as any).createThunderSound(bolt); }
  public propagateThunderWave(position?: any): any { return (this.weatherAtmosphere as any).propagateThunderWave(position); }
  public createStormWind(storm?: any): any { return (this.weatherAtmosphere as any).createStormWind(storm); }
  public generateStormRain(storm?: any): any { return (this.weatherAtmosphere as any).generateStormRain(storm); }
  public spawnStormDebris(storm?: any): any { return (this.weatherAtmosphere as any).spawnStormDebris(storm); }
  public simulateStormSurge(coast?: any): any { return (this.weatherAtmosphere as any).simulateStormSurge(coast); }
  public calculateStormDamage(structures?: any): any { return (this.weatherAtmosphere as any).calculateStormDamage(structures); }
  public dissipateThunderstorm(storm?: any): any { return (this.weatherAtmosphere as any).dissipateThunderstorm(storm); }
  public simulateHurricane(hurricane?: any): any { return (this.weatherAtmosphere as any).simulateHurricane(hurricane); }
  public simulateCyclone(cyclone?: any): any { return (this.weatherAtmosphere as any).simulateCyclone(cyclone); }
  public updateStormRecovery(area?: any): any { return (this.weatherAtmosphere as any).updateStormRecovery(area); }
  public createFire(source?: any): any { return (this.weatherAtmosphere as any).createFire(source); }
  public igniteObject(object?: any, ignitionSource?: any): any { return (this.weatherAtmosphere as any).igniteObject(object, ignitionSource); }
  public extinguishFire(fire?: any): any { return (this.weatherAtmosphere as any).extinguishFire(fire); }
  public spreadFire(fire?: any, target?: any): any { return (this.weatherAtmosphere as any).spreadFire(fire, target); }
  public calculateCombustionRate(object?: any): any { return (this.weatherAtmosphere as any).calculateCombustionRate(object); }
  public calculateFireTemperature(fire?: any): any { return (this.weatherAtmosphere as any).calculateFireTemperature(fire); }
  public updateFlameShape(fire?: any): any { return (this.weatherAtmosphere as any).updateFlameShape(fire); }
  public spawnFireParticles(fire?: any): any { return (this.weatherAtmosphere as any).spawnFireParticles(fire); }
  public generateSmoke(fire?: any): any { return (this.weatherAtmosphere as any).generateSmoke(fire); }
  public spreadSmoke(smoke?: any, wind?: any): any { return (this.weatherAtmosphere as any).spreadSmoke(smoke, wind); }
  public dissipateSmoke(smoke?: any, rate?: any): any { return (this.weatherAtmosphere as any).dissipateSmoke(smoke, rate); }
  public createEmber(emberSource?: any): any { return (this.weatherAtmosphere as any).createEmber(emberSource); }
  public scatterEmbers(embers?: any, wind?: any): any { return (this.weatherAtmosphere as any).scatterEmbers(embers, wind); }
  public igniteDryVegetation(plant?: any): any { return (this.weatherAtmosphere as any).igniteDryVegetation(plant); }
  public charObjectSurface(object?: any, heat?: any): any { return (this.weatherAtmosphere as any).charObjectSurface(object, heat); }
  public burnObjectMaterial(object?: any, rate?: any): any { return (this.weatherAtmosphere as any).burnObjectMaterial(object, rate); }
  public deformObjectByHeat(object?: any, heat?: any): any { return (this.weatherAtmosphere as any).deformObjectByHeat(object, heat); }
  public meltObjectMaterial(object?: any, temperature?: any): any { return (this.weatherAtmosphere as any).meltObjectMaterial(object, temperature); }
  public coolBurningObject(object?: any, rate?: any): any { return (this.weatherAtmosphere as any).coolBurningObject(object, rate); }
  public calculateFireDamage(object?: any): any { return (this.weatherAtmosphere as any).calculateFireDamage(object); }
  public createRockfall(region?: any): any { return (this.weatherAtmosphere as any).createRockfall(region); }
  public releaseRockFromSlope(rock?: any, slope?: any): any { return (this.weatherAtmosphere as any).releaseRockFromSlope(rock, slope); }
  public calculateRockfallTrajectory(rock?: any): any { return (this.weatherAtmosphere as any).calculateRockfallTrajectory(rock); }
  public simulateRockBouncing(rock?: any, surface?: any): any { return (this.weatherAtmosphere as any).simulateRockBouncing(rock, surface); }
  public simulateRockRolling(rock?: any, slope?: any): any { return (this.weatherAtmosphere as any).simulateRockRolling(rock, slope); }
  public simulateRockFragmentation(rock?: any): any { return (this.weatherAtmosphere as any).simulateRockFragmentation(rock); }
  public createLandslide(region?: any): any { return (this.weatherAtmosphere as any).createLandslide(region); }
  public calculateSlopeFailure(region?: any): any { return (this.weatherAtmosphere as any).calculateSlopeFailure(region); }
  public displaceLandslideSoil(landslide?: any): any { return (this.weatherAtmosphere as any).displaceLandslideSoil(landslide); }
  public simulateDebrisFlow(flow?: any): any { return (this.weatherAtmosphere as any).simulateDebrisFlow(flow); }
  public depositLandslideDebris(landslide?: any): any { return (this.weatherAtmosphere as any).depositLandslideDebris(landslide); }
  public createAvalanche(region?: any): any { return (this.weatherAtmosphere as any).createAvalanche(region); }
  public triggerSnowSlabFailure(snowpack?: any): any { return (this.weatherAtmosphere as any).triggerSnowSlabFailure(snowpack); }
  public simulateAvalancheMotion(avalanche?: any): any { return (this.weatherAtmosphere as any).simulateAvalancheMotion(avalanche); }
  public simulateAvalancheDebris(avalanche?: any): any { return (this.weatherAtmosphere as any).simulateAvalancheDebris(avalanche); }
  public buryObjectsInDebris(objects?: any, debris?: any): any { return (this.weatherAtmosphere as any).buryObjectsInDebris(objects, debris); }
  public calculateBurialDepth(object?: any, debris?: any): any { return (this.weatherAtmosphere as any).calculateBurialDepth(object, debris); }
  public stabilizeDamagedSlope(region?: any): any { return (this.weatherAtmosphere as any).stabilizeDamagedSlope(region); }
  public erodeUnstableSlope(region?: any): any { return (this.weatherAtmosphere as any).erodeUnstableSlope(region); }
  public updateSlopeAfterFailure(region?: any): any { return (this.weatherAtmosphere as any).updateSlopeAfterFailure(region); }
  public createBuilding(type?: any): any { return (this.buildingArchitecture as any).createBuilding(type); }
  public initializeBuilding(building?: any): any { return (this.buildingArchitecture as any).initializeBuilding(building); }
  public generateBuildingGeometry(building?: any): any { return (this.buildingArchitecture as any).generateBuildingGeometry(building); }
  public generateBuildingFoundation(building?: any): any { return (this.buildingArchitecture as any).generateBuildingFoundation(building); }
  public generateBuildingWalls(building?: any): any { return (this.buildingArchitecture as any).generateBuildingWalls(building); }
  public generateBuildingRoof(building?: any): any { return (this.buildingArchitecture as any).generateBuildingRoof(building); }
  public generateBuildingFloors(building?: any): any { return (this.buildingArchitecture as any).generateBuildingFloors(building); }
  public generateBuildingColumns(building?: any): any { return (this.buildingArchitecture as any).generateBuildingColumns(building); }
  public generateBuildingBeams(building?: any): any { return (this.buildingArchitecture as any).generateBuildingBeams(building); }
  public connectStructuralElements(building?: any): any { return (this.buildingArchitecture as any).connectStructuralElements(building); }
  public calculateBuildingMass(building?: any): any { return (this.buildingArchitecture as any).calculateBuildingMass(building); }
  public calculateBuildingCenterOfMass(building?: any): any { return (this.buildingArchitecture as any).calculateBuildingCenterOfMass(building); }
  public calculateStructuralStress(building?: any): any { return (this.buildingArchitecture as any).calculateStructuralStress(building); }
  public calculateStructuralLoad(building?: any): any { return (this.buildingArchitecture as any).calculateStructuralLoad(building); }
  public detectStructuralWeakness(building?: any): any { return (this.buildingArchitecture as any).detectStructuralWeakness(building); }
  public updateBuildingCondition(building?: any): any { return (this.buildingArchitecture as any).updateBuildingCondition(building); }
  public repairBuildingDamage(building?: any): any { return (this.buildingArchitecture as any).repairBuildingDamage(building); }
  public renovateBuilding(building?: any): any { return (this.buildingArchitecture as any).renovateBuilding(building); }
  public demolishBuilding(building?: any): any { return (this.buildingArchitecture as any).demolishBuilding(building); }
  public regenerateBuildingCollision(building?: any): any { return (this.buildingArchitecture as any).regenerateBuildingCollision(building); }
  public createWall(building?: any): any { return (this.buildingArchitecture as any).createWall(building); }
  public crackWall(wall?: any, force?: any): any { return (this.buildingArchitecture as any).crackWall(wall, force); }
  public chipWallSurface(wall?: any, impact?: any): any { return (this.buildingArchitecture as any).chipWallSurface(wall, impact); }
  public breakWall(wall?: any, force?: any): any { return (this.buildingArchitecture as any).breakWall(wall, force); }
  public collapseWallSection(wall?: any, section?: any): any { return (this.buildingArchitecture as any).collapseWallSection(wall, section); }
  public createRoof(building?: any): any { return (this.buildingArchitecture as any).createRoof(building); }
  public bendRoof(roof?: any, load?: any): any { return (this.buildingArchitecture as any).bendRoof(roof, load); }
  public crackRoof(roof?: any, force?: any): any { return (this.buildingArchitecture as any).crackRoof(roof, force); }
  public detachRoofPanel(roof?: any, panel?: any): any { return (this.buildingArchitecture as any).detachRoofPanel(roof, panel); }
  public collapseRoof(roof?: any, load?: any): any { return (this.buildingArchitecture as any).collapseRoof(roof, load); }
  public createDoor(building?: any): any { return (this.buildingArchitecture as any).createDoor(building); }
  public openDoor(door?: any): any { return (this.buildingArchitecture as any).openDoor(door); }
  public closeDoor(door?: any): any { return (this.buildingArchitecture as any).closeDoor(door); }
  public breakDoor(door?: any, force?: any): any { return (this.buildingArchitecture as any).breakDoor(door, force); }
  public detachDoorFromFrame(door?: any): any { return (this.buildingArchitecture as any).detachDoorFromFrame(door); }
  public createWindow(building?: any): any { return (this.buildingArchitecture as any).createWindow(building); }
  public crackWindowGlass(window?: any, impact?: any): any { return (this.buildingArchitecture as any).crackWindowGlass(window, impact); }
  public shatterWindowGlass(window?: any, force?: any): any { return (this.buildingArchitecture as any).shatterWindowGlass(window, force); }
  public scatterGlassFragments(window?: any): any { return (this.buildingArchitecture as any).scatterGlassFragments(window); }
  public repairWindow(window?: any): any { return (this.buildingArchitecture as any).repairWindow(window); }
  public initiateStructuralCollapse(building?: any): any { return (this.buildingArchitecture as any).initiateStructuralCollapse(building); }
  public calculateCollapseSequence(building?: any): any { return (this.buildingArchitecture as any).calculateCollapseSequence(building); }
  public weakenStructuralSupport(support?: any): any { return (this.buildingArchitecture as any).weakenStructuralSupport(support); }
  public removeStructuralSupport(support?: any): any { return (this.buildingArchitecture as any).removeStructuralSupport(support); }
  public fractureStructuralJoint(joint?: any): any { return (this.buildingArchitecture as any).fractureStructuralJoint(joint); }
  public breakStructuralBeam(beam?: any, force?: any): any { return (this.buildingArchitecture as any).breakStructuralBeam(beam, force); }
  public buckleStructuralColumn(column?: any, load?: any): any { return (this.buildingArchitecture as any).buckleStructuralColumn(column, load); }
  public triggerProgressiveCollapse(building?: any): any { return (this.buildingArchitecture as any).triggerProgressiveCollapse(building); }
  public simulateFloorCollapse(floor?: any): any { return (this.buildingArchitecture as any).simulateFloorCollapse(floor); }
  public simulateRoofCollapse(roof?: any): any { return (this.buildingArchitecture as any).simulateRoofCollapse(roof); }
  public detachStructuralDebris(building?: any): any { return (this.buildingArchitecture as any).detachStructuralDebris(building); }
  public spawnBuildingFragments(building?: any): any { return (this.buildingArchitecture as any).spawnBuildingFragments(building); }
  public applyImpulseToDebris(debris?: any, impulse?: any): any { return (this.buildingArchitecture as any).applyImpulseToDebris(debris, impulse); }
  public simulateDebrisCollision(debris?: any): any { return (this.buildingArchitecture as any).simulateDebrisCollision(debris); }
  public simulateDebrisPile(debris?: any): any { return (this.buildingArchitecture as any).simulateDebrisPile(debris); }
  public settleDebrisPile(debris?: any): any { return (this.buildingArchitecture as any).settleDebrisPile(debris); }
  public generateDustCloud(debris?: any): any { return (this.buildingArchitecture as any).generateDustCloud(debris); }
  public dissipateCollapseDust(dust?: any): any { return (this.buildingArchitecture as any).dissipateCollapseDust(dust); }
  public updateCollapsedBuilding(building?: any): any { return (this.buildingArchitecture as any).updateCollapsedBuilding(building); }
  public clearBuildingDebris(building?: any): any { return (this.buildingArchitecture as any).clearBuildingDebris(building); }
  public createFurniture(type?: any): any { return (this.buildingArchitecture as any).createFurniture(type); }
  public moveFurniture(furniture?: any, position?: any): any { return (this.buildingArchitecture as any).moveFurniture(furniture, position); }
  public rotateFurniture(furniture?: any, angle?: any): any { return (this.buildingArchitecture as any).rotateFurniture(furniture, angle); }
  public slideFurniture(furniture?: any, surface?: any): any { return (this.buildingArchitecture as any).slideFurniture(furniture, surface); }
  public toppleChair(chair?: any, force?: any): any { return (this.buildingArchitecture as any).toppleChair(chair, force); }
  public pullChair(chair?: any, direction?: any): any { return (this.buildingArchitecture as any).pullChair(chair, direction); }
  public pushTable(table?: any, force?: any): any { return (this.buildingArchitecture as any).pushTable(table, force); }
  public overturnTable(table?: any, force?: any): any { return (this.buildingArchitecture as any).overturnTable(table, force); }
  public openDrawer(drawer?: any): any { return (this.buildingArchitecture as any).openDrawer(drawer); }
  public closeDrawer(drawer?: any): any { return (this.buildingArchitecture as any).closeDrawer(drawer); }
  public openCabinet(cabinet?: any): any { return (this.buildingArchitecture as any).openCabinet(cabinet); }
  public closeCabinet(cabinet?: any): any { return (this.buildingArchitecture as any).closeCabinet(cabinet); }
  public breakFurnitureJoint(furniture?: any, joint?: any): any { return (this.buildingArchitecture as any).breakFurnitureJoint(furniture, joint); }
  public splitWoodenFurniture(furniture?: any): any { return (this.buildingArchitecture as any).splitWoodenFurniture(furniture); }
  public shatterCeramicObject(object?: any, impact?: any): any { return (this.buildingArchitecture as any).shatterCeramicObject(object, impact); }
  public breakGlassObject(object?: any, impact?: any): any { return (this.buildingArchitecture as any).breakGlassObject(object, impact); }
  public deformMetalObject(object?: any, force?: any): any { return (this.buildingArchitecture as any).deformMetalObject(object, force); }
  public tearFabricObject(object?: any, force?: any): any { return (this.buildingArchitecture as any).tearFabricObject(object, force); }
  public scatterHouseholdObjects(objects?: any, impulse?: any): any { return (this.buildingArchitecture as any).scatterHouseholdObjects(objects, impulse); }
  public restoreFurnitureState(furniture?: any): any { return (this.buildingArchitecture as any).restoreFurnitureState(furniture); }
  public initializeRigidBody(object?: any): any { return (this.physicsMaterials as any).initializeRigidBody(object); }
  public setObjectMass(object?: any, mass?: any): any { return (this.physicsMaterials as any).setObjectMass(object, mass); }
  public setObjectDensity(object?: any, density?: any): any { return (this.physicsMaterials as any).setObjectDensity(object, density); }
  public setObjectFriction(object?: any, friction?: any): any { return (this.physicsMaterials as any).setObjectFriction(object, friction); }
  public setObjectRestitution(object?: any, restitution?: any): any { return (this.physicsMaterials as any).setObjectRestitution(object, restitution); }
  public applyForceToObject(object?: any, force?: any): any { return (this.physicsMaterials as any).applyForceToObject(object, force); }
  public applyImpulseToObject(object?: any, impulse?: any): any { return (this.physicsMaterials as any).applyImpulseToObject(object, impulse); }
  public applyTorqueToObject(object?: any, torque?: any): any { return (this.physicsMaterials as any).applyTorqueToObject(object, torque); }
  public calculateObjectVelocity(object?: any): any { return (this.physicsMaterials as any).calculateObjectVelocity(object); }
  public calculateObjectAcceleration(object?: any): any { return (this.physicsMaterials as any).calculateObjectAcceleration(object); }
  public calculateAngularVelocity(object?: any): any { return (this.physicsMaterials as any).calculateAngularVelocity(object); }
  public simulateObjectGravity(object?: any): any { return (this.physicsMaterials as any).simulateObjectGravity(object); }
  public simulateObjectAirResistance(object?: any): any { return (this.physicsMaterials as any).simulateObjectAirResistance(object); }
  public detectObjectCollision(objectA?: any, objectB?: any): any { return (this.physicsMaterials as any).detectObjectCollision(objectA, objectB); }
  public resolveObjectCollision(objectA?: any, objectB?: any): any { return (this.physicsMaterials as any).resolveObjectCollision(objectA, objectB); }
  public calculateImpactEnergy(objectA?: any, objectB?: any): any { return (this.physicsMaterials as any).calculateImpactEnergy(objectA, objectB); }
  public calculateImpactDamage(object?: any, impact?: any): any { return (this.physicsMaterials as any).calculateImpactDamage(object, impact); }
  public simulateObjectPenetration(object?: any, surface?: any): any { return (this.physicsMaterials as any).simulateObjectPenetration(object, surface); }
  public simulateObjectBounce(object?: any, surface?: any): any { return (this.physicsMaterials as any).simulateObjectBounce(object, surface); }
  public settleRigidBody(object?: any): any { return (this.physicsMaterials as any).settleRigidBody(object); }
  public initializeDestructionSystem(object?: any): any { return (this.physicsMaterials as any).initializeDestructionSystem(object); }
  public defineFractureRegions(object?: any): any { return (this.physicsMaterials as any).defineFractureRegions(object); }
  public calculateFractureThreshold(object?: any): any { return (this.physicsMaterials as any).calculateFractureThreshold(object); }
  public detectCuttingContact(object?: any, tool?: any): any { return (this.physicsMaterials as any).detectCuttingContact(object, tool); }
  public applyCuttingForce(object?: any, tool?: any): any { return (this.physicsMaterials as any).applyCuttingForce(object, tool); }
  public sliceObject(object?: any, plane?: any): any { return (this.physicsMaterials as any).sliceObject(object, plane); }
  public cutObjectIntoPieces(object?: any, cutPath?: any): any { return (this.physicsMaterials as any).cutObjectIntoPieces(object, cutPath); }
  public severBranchWithBlade(branch?: any, blade?: any): any { return (this.physicsMaterials as any).severBranchWithBlade(branch, blade); }
  public chopTreeTrunk(tree?: any, blade?: any): any { return (this.physicsMaterials as any).chopTreeTrunk(tree, blade); }
  public splitWoodLog(log?: any, tool?: any): any { return (this.physicsMaterials as any).splitWoodLog(log, tool); }
  public breakObjectAtJoint(object?: any, joint?: any): any { return (this.physicsMaterials as any).breakObjectAtJoint(object, joint); }
  public snapObjectInHalf(object?: any, force?: any): any { return (this.physicsMaterials as any).snapObjectInHalf(object, force); }
  public fractureObjectSurface(object?: any, impact?: any): any { return (this.physicsMaterials as any).fractureObjectSurface(object, impact); }
  public shatterObject(object?: any, impulse?: any): any { return (this.physicsMaterials as any).shatterObject(object, impulse); }
  public splitRockWithImpact(rock?: any, impact?: any): any { return (this.physicsMaterials as any).splitRockWithImpact(rock, impact); }
  public detachObjectPart(object?: any, part?: any): any { return (this.physicsMaterials as any).detachObjectPart(object, part); }
  public calculateDetachedPartVelocity(part?: any): any { return (this.physicsMaterials as any).calculateDetachedPartVelocity(part); }
  public spawnDetachedFragments(object?: any): any { return (this.physicsMaterials as any).spawnDetachedFragments(object); }
  public applyDebrisPhysics(fragments?: any): any { return (this.physicsMaterials as any).applyDebrisPhysics(fragments); }
  public finalizeObjectDestruction(object?: any): any { return (this.physicsMaterials as any).finalizeObjectDestruction(object); }
  public createSoftBody(object?: any): any { return (this.physicsMaterials as any).createSoftBody(object); }
  public initializeSoftBodyPhysics(object?: any): any { return (this.physicsMaterials as any).initializeSoftBodyPhysics(object); }
  public deformSoftBody(object?: any, force?: any): any { return (this.physicsMaterials as any).deformSoftBody(object, force); }
  public stretchSoftBody(object?: any, amount?: any): any { return (this.physicsMaterials as any).stretchSoftBody(object, amount); }
  public compressSoftBody(object?: any, amount?: any): any { return (this.physicsMaterials as any).compressSoftBody(object, amount); }
  public bendSoftBody(object?: any, force?: any): any { return (this.physicsMaterials as any).bendSoftBody(object, force); }
  public twistSoftBody(object?: any, torque?: any): any { return (this.physicsMaterials as any).twistSoftBody(object, torque); }
  public restoreSoftBodyShape(object?: any): any { return (this.physicsMaterials as any).restoreSoftBodyShape(object); }
  public simulateClothMotion(cloth?: any): any { return (this.physicsMaterials as any).simulateClothMotion(cloth); }
  public simulateClothWind(cloth?: any, wind?: any): any { return (this.physicsMaterials as any).simulateClothWind(cloth, wind); }
  public foldCloth(cloth?: any): any { return (this.physicsMaterials as any).foldCloth(cloth); }
  public unfoldCloth(cloth?: any): any { return (this.physicsMaterials as any).unfoldCloth(cloth); }
  public tearCloth(cloth?: any, force?: any): any { return (this.physicsMaterials as any).tearCloth(cloth, force); }
  public simulatePaperBending(paper?: any, force?: any): any { return (this.physicsMaterials as any).simulatePaperBending(paper, force); }
  public crumplePaper(paper?: any): any { return (this.physicsMaterials as any).crumplePaper(paper); }
  public tearPaper(paper?: any, force?: any): any { return (this.physicsMaterials as any).tearPaper(paper, force); }
  public burnPaper(paper?: any, rate?: any): any { return (this.physicsMaterials as any).burnPaper(paper, rate); }
  public simulateRopeMotion(rope?: any): any { return (this.physicsMaterials as any).simulateRopeMotion(rope); }
  public stretchRope(rope?: any, force?: any): any { return (this.physicsMaterials as any).stretchRope(rope, force); }
  public snapRope(rope?: any, force?: any): any { return (this.physicsMaterials as any).snapRope(rope, force); }
  public createMechanicalObject(type?: any): any { return (this.physicsMaterials as any).createMechanicalObject(type); }
  public initializeMechanicalJoints(object?: any): any { return (this.physicsMaterials as any).initializeMechanicalJoints(object); }
  public rotateMechanicalJoint(joint?: any, angle?: any): any { return (this.physicsMaterials as any).rotateMechanicalJoint(joint, angle); }
  public slideMechanicalJoint(joint?: any, distance?: any): any { return (this.physicsMaterials as any).slideMechanicalJoint(joint, distance); }
  public lockMechanicalJoint(joint?: any): any { return (this.physicsMaterials as any).lockMechanicalJoint(joint); }
  public unlockMechanicalJoint(joint?: any): any { return (this.physicsMaterials as any).unlockMechanicalJoint(joint); }
  public applyMechanicalTorque(object?: any, torque?: any): any { return (this.physicsMaterials as any).applyMechanicalTorque(object, torque); }
  public bendMetalSheet(sheet?: any, force?: any): any { return (this.physicsMaterials as any).bendMetalSheet(sheet, force); }
  public dentMetalSurface(object?: any, impact?: any): any { return (this.physicsMaterials as any).dentMetalSurface(object, impact); }
  public deformMetalStructure(object?: any, load?: any): any { return (this.physicsMaterials as any).deformMetalStructure(object, load); }
  public fractureMetalPart(object?: any, force?: any): any { return (this.physicsMaterials as any).fractureMetalPart(object, force); }
  public fatigueMetalMaterial(object?: any, cycles?: any): any { return (this.physicsMaterials as any).fatigueMetalMaterial(object, cycles); }
  public corrodeMetalSurface(object?: any, rate?: any): any { return (this.physicsMaterials as any).corrodeMetalSurface(object, rate); }
  public rustMetalObject(object?: any, moisture?: any): any { return (this.physicsMaterials as any).rustMetalObject(object, moisture); }
  public heatMetalObject(object?: any, temperature?: any): any { return (this.physicsMaterials as any).heatMetalObject(object, temperature); }
  public coolMetalObject(object?: any, rate?: any): any { return (this.physicsMaterials as any).coolMetalObject(object, rate); }
  public expandMetalObject(object?: any, temperature?: any): any { return (this.physicsMaterials as any).expandMetalObject(object, temperature); }
  public contractMetalObject(object?: any, temperature?: any): any { return (this.physicsMaterials as any).contractMetalObject(object, temperature); }
  public jamMechanicalJoint(joint?: any): any { return (this.physicsMaterials as any).jamMechanicalJoint(joint); }
  public repairMechanicalObject(object?: any): any { return (this.physicsMaterials as any).repairMechanicalObject(object); }
  public createSettlement(region?: any): any { return (this.geologyClimate as any).createSettlement(region); }
  public generateBuildingPlot(region?: any): any { return (this.geologyClimate as any).generateBuildingPlot(region); }
  public placeBuildingOnTerrain(building?: any, terrain?: any): any { return (this.geologyClimate as any).placeBuildingOnTerrain(building, terrain); }
  public constructFoundation(building?: any, terrain?: any): any { return (this.geologyClimate as any).constructFoundation(building, terrain); }
  public constructWallSection(building?: any, section?: any): any { return (this.geologyClimate as any).constructWallSection(building, section); }
  public installRoofSection(building?: any, section?: any): any { return (this.geologyClimate as any).installRoofSection(building, section); }
  public installWindow(building?: any, window?: any): any { return (this.geologyClimate as any).installWindow(building, window); }
  public installDoor(building?: any, door?: any): any { return (this.geologyClimate as any).installDoor(building, door); }
  public constructBridge(region?: any): any { return (this.geologyClimate as any).constructBridge(region); }
  public constructRoad(region?: any): any { return (this.geologyClimate as any).constructRoad(region); }
  public paveRoadSurface(road?: any): any { return (this.geologyClimate as any).paveRoadSurface(road); }
  public crackRoadSurface(road?: any, load?: any): any { return (this.geologyClimate as any).crackRoadSurface(road, load); }
  public erodeRoadSurface(road?: any, weather?: any): any { return (this.geologyClimate as any).erodeRoadSurface(road, weather); }
  public generatePothole(road?: any, position?: any): any { return (this.geologyClimate as any).generatePothole(road, position); }
  public repairRoadSurface(road?: any): any { return (this.geologyClimate as any).repairRoadSurface(road); }
  public constructFence(region?: any): any { return (this.geologyClimate as any).constructFence(region); }
  public breakFenceSection(fence?: any, section?: any): any { return (this.geologyClimate as any).breakFenceSection(fence, section); }
  public constructDam(region?: any): any { return (this.geologyClimate as any).constructDam(region); }
  public breachDam(dam?: any, force?: any): any { return (this.geologyClimate as any).breachDam(dam, force); }
  public updateBuiltEnvironment(region?: any): any { return (this.geologyClimate as any).updateBuiltEnvironment(region); }
  public createEarthquake(region?: any): any { return (this.geologyClimate as any).createEarthquake(region); }
  public calculateSeismicWave(earthquake?: any): any { return (this.geologyClimate as any).calculateSeismicWave(earthquake); }
  public propagateSeismicWave(wave?: any): any { return (this.geologyClimate as any).propagateSeismicWave(wave); }
  public shakeTerrain(terrain?: any, wave?: any): any { return (this.geologyClimate as any).shakeTerrain(terrain, wave); }
  public shakeBuilding(building?: any, wave?: any): any { return (this.geologyClimate as any).shakeBuilding(building, wave); }
  public triggerGroundRupture(region?: any): any { return (this.geologyClimate as any).triggerGroundRupture(region); }
  public generateGroundCracks(region?: any): any { return (this.geologyClimate as any).generateGroundCracks(region); }
  public widenGroundCracks(region?: any): any { return (this.geologyClimate as any).widenGroundCracks(region); }
  public triggerLiquefaction(region?: any): any { return (this.geologyClimate as any).triggerLiquefaction(region); }
  public calculateSeismicDamage(region?: any): any { return (this.geologyClimate as any).calculateSeismicDamage(region); }
  public createVolcano(region?: any): any { return (this.geologyClimate as any).createVolcano(region); }
  public accumulateMagmaPressure(volcano?: any): any { return (this.geologyClimate as any).accumulateMagmaPressure(volcano); }
  public simulateMagmaMovement(volcano?: any): any { return (this.geologyClimate as any).simulateMagmaMovement(volcano); }
  public triggerVolcanicEruption(volcano?: any): any { return (this.geologyClimate as any).triggerVolcanicEruption(volcano); }
  public spawnVolcanicProjectiles(volcano?: any): any { return (this.geologyClimate as any).spawnVolcanicProjectiles(volcano); }
  public simulateLavaFlow(volcano?: any): any { return (this.geologyClimate as any).simulateLavaFlow(volcano); }
  public coolLavaFlow(lava?: any): any { return (this.geologyClimate as any).coolLavaFlow(lava); }
  public solidifyLava(lava?: any): any { return (this.geologyClimate as any).solidifyLava(lava); }
  public generateVolcanicAsh(volcano?: any): any { return (this.geologyClimate as any).generateVolcanicAsh(volcano); }
  public updateGeologicalRecovery(region?: any): any { return (this.geologyClimate as any).updateGeologicalRecovery(region); }
  public createGlacier(region?: any): any { return (this.geologyClimate as any).createGlacier(region); }
  public accumulateGlacierSnow(glacier?: any): any { return (this.geologyClimate as any).accumulateGlacierSnow(glacier); }
  public compactGlacierSnow(glacier?: any): any { return (this.geologyClimate as any).compactGlacierSnow(glacier); }
  public simulateGlacierFlow(glacier?: any): any { return (this.geologyClimate as any).simulateGlacierFlow(glacier); }
  public deformGlacierSurface(glacier?: any): any { return (this.geologyClimate as any).deformGlacierSurface(glacier); }
  public generateGlacierCrevasse(glacier?: any): any { return (this.geologyClimate as any).generateGlacierCrevasse(glacier); }
  public widenGlacierCrevasse(glacier?: any): any { return (this.geologyClimate as any).widenGlacierCrevasse(glacier); }
  public fractureGlacierIce(glacier?: any): any { return (this.geologyClimate as any).fractureGlacierIce(glacier); }
  public calveGlacierIceberg(glacier?: any): any { return (this.geologyClimate as any).calveGlacierIceberg(glacier); }
  public createIceberg(region?: any): any { return (this.geologyClimate as any).createIceberg(region); }
  public driftIceberg(iceberg?: any, current?: any): any { return (this.geologyClimate as any).driftIceberg(iceberg, current); }
  public rotateIceberg(iceberg?: any, torque?: any): any { return (this.geologyClimate as any).rotateIceberg(iceberg, torque); }
  public meltIceberg(iceberg?: any, temperature?: any): any { return (this.geologyClimate as any).meltIceberg(iceberg, temperature); }
  public simulateSeaIceFormation(water?: any): any { return (this.geologyClimate as any).simulateSeaIceFormation(water); }
  public simulateSeaIceBreakup(ice?: any): any { return (this.geologyClimate as any).simulateSeaIceBreakup(ice); }
  public driftSeaIce(ice?: any, current?: any): any { return (this.geologyClimate as any).driftSeaIce(ice, current); }
  public collideIceFloes(iceA?: any, iceB?: any): any { return (this.geologyClimate as any).collideIceFloes(iceA, iceB); }
  public freezeGroundWater(ground?: any): any { return (this.geologyClimate as any).freezeGroundWater(ground); }
  public thawPermafrost(ground?: any, temperature?: any): any { return (this.geologyClimate as any).thawPermafrost(ground, temperature); }
  public updateCryosphereState(region?: any): any { return (this.geologyClimate as any).updateCryosphereState(region); }
  public createSunLight(): any { return (this.geologyClimate as any).createSunLight(); }
  public updateSunPosition(time?: any): any { return (this.geologyClimate as any).updateSunPosition(time); }
  public updateSunIntensity(intensity?: any): any { return (this.geologyClimate as any).updateSunIntensity(intensity); }
  public calculateSunlightDirection(): any { return (this.geologyClimate as any).calculateSunlightDirection(); }
  public updateShadowDirection(): any { return (this.geologyClimate as any).updateShadowDirection(); }
  public updateShadowLength(): any { return (this.geologyClimate as any).updateShadowLength(); }
  public calculateSurfaceSolarHeating(surface?: any): any { return (this.geologyClimate as any).calculateSurfaceSolarHeating(surface); }
  public heatObjectSurface(object?: any, energy?: any): any { return (this.geologyClimate as any).heatObjectSurface(object, energy); }
  public coolObjectSurface(object?: any, rate?: any): any { return (this.geologyClimate as any).coolObjectSurface(object, rate); }
  public simulateThermalExpansion(object?: any, temperature?: any): any { return (this.geologyClimate as any).simulateThermalExpansion(object, temperature); }
  public simulateThermalContraction(object?: any, temperature?: any): any { return (this.geologyClimate as any).simulateThermalContraction(object, temperature); }
  public fadeSunlightAtDusk(): any { return (this.geologyClimate as any).fadeSunlightAtDusk(); }
  public restoreSunlightAtDawn(): any { return (this.geologyClimate as any).restoreSunlightAtDawn(); }
  public updateNightLighting(): any { return (this.geologyClimate as any).updateNightLighting(); }
  public simulateMoonlight(): any { return (this.geologyClimate as any).simulateMoonlight(); }
  public updateCloudShadowMovement(cloud?: any): any { return (this.geologyClimate as any).updateCloudShadowMovement(cloud); }
  public updateVegetationLightExposure(plant?: any): any { return (this.geologyClimate as any).updateVegetationLightExposure(plant); }
  public calculateSurfaceReflectance(surface?: any): any { return (this.geologyClimate as any).calculateSurfaceReflectance(surface); }
  public simulateHeatTransfer(objectA?: any, objectB?: any): any { return (this.geologyClimate as any).simulateHeatTransfer(objectA, objectB); }
  public updateEnvironmentalTemperature(region?: any): any { return (this.geologyClimate as any).updateEnvironmentalTemperature(region); }
  public createParticleSystem(type?: any): any { return (this.environmentalDynamics as any).createParticleSystem(type); }
  public spawnParticles(system?: any, count?: any): any { return (this.environmentalDynamics as any).spawnParticles(system, count); }
  public updateParticleMotion(particle?: any, deltaTime?: any): any { return (this.environmentalDynamics as any).updateParticleMotion(particle, deltaTime); }
  public applyParticleGravity(particle?: any): any { return (this.environmentalDynamics as any).applyParticleGravity(particle); }
  public applyParticleWind(particle?: any, wind?: any): any { return (this.environmentalDynamics as any).applyParticleWind(particle, wind); }
  public calculateParticleDrag(particle?: any): any { return (this.environmentalDynamics as any).calculateParticleDrag(particle); }
  public simulateDustCloud(position?: any, force?: any): any { return (this.environmentalDynamics as any).simulateDustCloud(position, force); }
  public spreadDustCloud(cloud?: any, wind?: any): any { return (this.environmentalDynamics as any).spreadDustCloud(cloud, wind); }
  public dissipateDustCloud(cloud?: any, rate?: any): any { return (this.environmentalDynamics as any).dissipateDustCloud(cloud, rate); }
  public createSandBurst(position?: any, force?: any): any { return (this.environmentalDynamics as any).createSandBurst(position, force); }
  public simulateBlowingSand(sand?: any, wind?: any): any { return (this.environmentalDynamics as any).simulateBlowingSand(sand, wind); }
  public simulateDustDevilParticles(particles?: any): any { return (this.environmentalDynamics as any).simulateDustDevilParticles(particles); }
  public spawnPollenParticles(plant?: any): any { return (this.environmentalDynamics as any).spawnPollenParticles(plant); }
  public dispersePollen(pollen?: any, wind?: any): any { return (this.environmentalDynamics as any).dispersePollen(pollen, wind); }
  public spawnFallingLeaves(tree?: any): any { return (this.environmentalDynamics as any).spawnFallingLeaves(tree); }
  public simulateFallingLeafParticles(leaves?: any): any { return (this.environmentalDynamics as any).simulateFallingLeafParticles(leaves); }
  public spawnFallingPetals(flower?: any): any { return (this.environmentalDynamics as any).spawnFallingPetals(flower); }
  public spawnAshParticles(fire?: any): any { return (this.environmentalDynamics as any).spawnAshParticles(fire); }
  public simulateAshDeposition(surface?: any, ash?: any): any { return (this.environmentalDynamics as any).simulateAshDeposition(surface, ash); }
  public recycleExpiredParticles(system?: any): any { return (this.environmentalDynamics as any).recycleExpiredParticles(system); }
  public calculateWeatheringRate(object?: any): any { return (this.environmentalDynamics as any).calculateWeatheringRate(object); }
  public applyMechanicalWeathering(object?: any, force?: any): any { return (this.environmentalDynamics as any).applyMechanicalWeathering(object, force); }
  public applyChemicalWeathering(object?: any, fluid?: any): any { return (this.environmentalDynamics as any).applyChemicalWeathering(object, fluid); }
  public applyFreezeThawWeathering(object?: any, temperature?: any): any { return (this.environmentalDynamics as any).applyFreezeThawWeathering(object, temperature); }
  public erodeObjectSurface(object?: any, rate?: any): any { return (this.environmentalDynamics as any).erodeObjectSurface(object, rate); }
  public erodeBuildingFacade(building?: any, rate?: any): any { return (this.environmentalDynamics as any).erodeBuildingFacade(building, rate); }
  public erodeRockFormation(rock?: any, water?: any): any { return (this.environmentalDynamics as any).erodeRockFormation(rock, water); }
  public erodeSoilLayer(soil?: any, water?: any): any { return (this.environmentalDynamics as any).erodeSoilLayer(soil, water); }
  public weatherWoodSurface(wood?: any, weather?: any): any { return (this.environmentalDynamics as any).weatherWoodSurface(wood, weather); }
  public fadePaintSurface(object?: any, sunlight?: any): any { return (this.environmentalDynamics as any).fadePaintSurface(object, sunlight); }
  public peelPaintSurface(object?: any, rate?: any): any { return (this.environmentalDynamics as any).peelPaintSurface(object, rate); }
  public corrodeConcreteSurface(object?: any, rate?: any): any { return (this.environmentalDynamics as any).corrodeConcreteSurface(object, rate); }
  public growMoldOnSurface(object?: any, humidity?: any): any { return (this.environmentalDynamics as any).growMoldOnSurface(object, humidity); }
  public spreadSurfaceMoss(object?: any, moisture?: any): any { return (this.environmentalDynamics as any).spreadSurfaceMoss(object, moisture); }
  public accumulateDirtOnSurface(object?: any, amount?: any): any { return (this.environmentalDynamics as any).accumulateDirtOnSurface(object, amount); }
  public accumulateDustOnSurface(object?: any, amount?: any): any { return (this.environmentalDynamics as any).accumulateDustOnSurface(object, amount); }
  public washDirtFromSurface(object?: any, water?: any): any { return (this.environmentalDynamics as any).washDirtFromSurface(object, water); }
  public degradeMaterialProperties(object?: any, rate?: any): any { return (this.environmentalDynamics as any).degradeMaterialProperties(object, rate); }
  public calculateMaterialLifetime(object?: any): any { return (this.environmentalDynamics as any).calculateMaterialLifetime(object); }
  public transitionObjectToRuins(object?: any): any { return (this.environmentalDynamics as any).transitionObjectToRuins(object); }
  public initializeEcosystem(region?: any): any { return (this.environmentalDynamics as any).initializeEcosystem(region); }
  public updateEcosystem(region?: any, deltaTime?: any): any { return (this.environmentalDynamics as any).updateEcosystem(region, deltaTime); }
  public calculateVegetationDensity(region?: any): any { return (this.environmentalDynamics as any).calculateVegetationDensity(region); }
  public calculateSoilMoisture(region?: any): any { return (this.environmentalDynamics as any).calculateSoilMoisture(region); }
  public calculateNutrientAvailability(region?: any): any { return (this.environmentalDynamics as any).calculateNutrientAvailability(region); }
  public simulatePlantCompetition(plantA?: any, plantB?: any): any { return (this.environmentalDynamics as any).simulatePlantCompetition(plantA, plantB); }
  public simulateCanopyCompetition(treeA?: any, treeB?: any): any { return (this.environmentalDynamics as any).simulateCanopyCompetition(treeA, treeB); }
  public calculateLightCompetition(plant?: any, neighbors?: any): any { return (this.environmentalDynamics as any).calculateLightCompetition(plant, neighbors); }
  public spreadSeedsAcrossRegion(region?: any, wind?: any): any { return (this.environmentalDynamics as any).spreadSeedsAcrossRegion(region, wind); }
  public disperseSeedsByWater(region?: any, water?: any): any { return (this.environmentalDynamics as any).disperseSeedsByWater(region, water); }
  public spreadWildfireAcrossRegion(region?: any): any { return (this.environmentalDynamics as any).spreadWildfireAcrossRegion(region); }
  public simulateHabitatRecovery(region?: any): any { return (this.environmentalDynamics as any).simulateHabitatRecovery(region); }
  public regenerateVegetation(region?: any): any { return (this.environmentalDynamics as any).regenerateVegetation(region); }
  public restoreDamagedSoil(region?: any): any { return (this.environmentalDynamics as any).restoreDamagedSoil(region); }
  public simulateWetlandExpansion(region?: any): any { return (this.environmentalDynamics as any).simulateWetlandExpansion(region); }
  public simulateDesertification(region?: any): any { return (this.environmentalDynamics as any).simulateDesertification(region); }
  public simulateCoastalErosion(region?: any): any { return (this.environmentalDynamics as any).simulateCoastalErosion(region); }
  public simulateRiverDeltaGrowth(region?: any): any { return (this.environmentalDynamics as any).simulateRiverDeltaGrowth(region); }
  public updateEcosystemBalance(region?: any): any { return (this.environmentalDynamics as any).updateEcosystemBalance(region); }
  public initializeObjectLifecycle(object?: any): any { return (this.environmentalDynamics as any).initializeObjectLifecycle(object); }
  public updateObjectLifecycle(object?: any, deltaTime?: any): any { return (this.environmentalDynamics as any).updateObjectLifecycle(object, deltaTime); }
  public setObjectAge(object?: any, age?: any): any { return (this.environmentalDynamics as any).setObjectAge(object, age); }
  public calculateObjectAge(object?: any): any { return (this.environmentalDynamics as any).calculateObjectAge(object); }
  public growObjectOverTime(object?: any, duration?: any): any { return (this.environmentalDynamics as any).growObjectOverTime(object, duration); }
  public shrinkObjectOverTime(object?: any, duration?: any): any { return (this.environmentalDynamics as any).shrinkObjectOverTime(object, duration); }
  public matureObject(object?: any): any { return (this.environmentalDynamics as any).matureObject(object); }
  public weakenObjectOverTime(object?: any, rate?: any): any { return (this.environmentalDynamics as any).weakenObjectOverTime(object, rate); }
  public fatigueObjectOverTime(object?: any, load?: any): any { return (this.environmentalDynamics as any).fatigueObjectOverTime(object, load); }
  public accumulateObjectDamage(object?: any, damage?: any): any { return (this.environmentalDynamics as any).accumulateObjectDamage(object, damage); }
  public recoverObjectCondition(object?: any, rate?: any): any { return (this.environmentalDynamics as any).recoverObjectCondition(object, rate); }
  public decayObjectOverTime(object?: any, rate?: any): any { return (this.environmentalDynamics as any).decayObjectOverTime(object, rate); }
  public decomposeObjectOverTime(object?: any, rate?: any): any { return (this.environmentalDynamics as any).decomposeObjectOverTime(object, rate); }
  public fadeObjectOverTime(object?: any, rate?: any): any { return (this.environmentalDynamics as any).fadeObjectOverTime(object, rate); }
  public disintegrateObjectOverTime(object?: any, rate?: any): any { return (this.environmentalDynamics as any).disintegrateObjectOverTime(object, rate); }
  public triggerObjectFailure(object?: any): any { return (this.environmentalDynamics as any).triggerObjectFailure(object); }
  public replaceObjectWithDebris(object?: any): any { return (this.environmentalDynamics as any).replaceObjectWithDebris(object); }
  public regenerateObjectFromState(object?: any, state?: any): any { return (this.environmentalDynamics as any).regenerateObjectFromState(object, state); }
  public advanceSeasonalChanges(region?: any, season?: any): any { return (this.environmentalDynamics as any).advanceSeasonalChanges(region, season); }
  public updateWorldAging(region?: any, deltaTime?: any): any { return (this.environmentalDynamics as any).updateWorldAging(region, deltaTime); }
  public detectToolContact(tool?: any, object?: any): any { return (this.environmentalDynamics as any).detectToolContact(tool, object); }
  public calculateToolImpact(tool?: any, object?: any): any { return (this.environmentalDynamics as any).calculateToolImpact(tool, object); }
  public applyHammerImpact(object?: any, impact?: any): any { return (this.environmentalDynamics as any).applyHammerImpact(object, impact); }
  public strikeObjectWithTool(object?: any, tool?: any): any { return (this.environmentalDynamics as any).strikeObjectWithTool(object, tool); }
  public cutVegetationWithTool(plant?: any, tool?: any): any { return (this.environmentalDynamics as any).cutVegetationWithTool(plant, tool); }
  public sawWoodObject(wood?: any, tool?: any): any { return (this.environmentalDynamics as any).sawWoodObject(wood, tool); }
  public digTerrainWithTool(terrain?: any, tool?: any): any { return (this.environmentalDynamics as any).digTerrainWithTool(terrain, tool); }
  public excavateRockWithTool(rock?: any, tool?: any): any { return (this.environmentalDynamics as any).excavateRockWithTool(rock, tool); }
  public chipStoneWithTool(rock?: any, tool?: any): any { return (this.environmentalDynamics as any).chipStoneWithTool(rock, tool); }
  public breakIceWithTool(ice?: any, tool?: any): any { return (this.environmentalDynamics as any).breakIceWithTool(ice, tool); }
  public pryOpenObject(object?: any, tool?: any): any { return (this.environmentalDynamics as any).pryOpenObject(object, tool); }
  public leverObjectWithTool(object?: any, tool?: any): any { return (this.environmentalDynamics as any).leverObjectWithTool(object, tool); }
  public drillIntoMaterial(object?: any, tool?: any): any { return (this.environmentalDynamics as any).drillIntoMaterial(object, tool); }
  public grindMaterialSurface(object?: any, tool?: any): any { return (this.environmentalDynamics as any).grindMaterialSurface(object, tool); }
  public polishMaterialSurface(object?: any, tool?: any): any { return (this.environmentalDynamics as any).polishMaterialSurface(object, tool); }
  public weldMetalParts(partA?: any, partB?: any): any { return (this.environmentalDynamics as any).weldMetalParts(partA, partB); }
  public fastenStructuralParts(partA?: any, partB?: any): any { return (this.environmentalDynamics as any).fastenStructuralParts(partA, partB); }
  public detachFastenedPart(object?: any, part?: any): any { return (this.environmentalDynamics as any).detachFastenedPart(object, part); }
  public repairObjectWithMaterial(object?: any, material?: any): any { return (this.environmentalDynamics as any).repairObjectWithMaterial(object, material); }
  public updateToolDamage(tool?: any, impact?: any): any { return (this.environmentalDynamics as any).updateToolDamage(tool, impact); }
  public initializeDestructionGraph(object?: any): any { return (this.environmentalDynamics as any).initializeDestructionGraph(object); }
  public generateFracturePattern(object?: any, impact?: any): any { return (this.environmentalDynamics as any).generateFracturePattern(object, impact); }
  public calculateFracturePropagation(object?: any): any { return (this.environmentalDynamics as any).calculateFracturePropagation(object); }
  public propagateStructuralCrack(object?: any, crack?: any): any { return (this.environmentalDynamics as any).propagateStructuralCrack(object, crack); }
  public calculateBreakPoint(object?: any, force?: any): any { return (this.environmentalDynamics as any).calculateBreakPoint(object, force); }
  public calculateFractureEnergy(object?: any, force?: any): any { return (this.environmentalDynamics as any).calculateFractureEnergy(object, force); }
  public splitMeshAlongPlane(object?: any, plane?: any): any { return (this.environmentalDynamics as any).splitMeshAlongPlane(object, plane); }
  public splitMeshAlongCurve(object?: any, curve?: any): any { return (this.environmentalDynamics as any).splitMeshAlongCurve(object, curve); }
  public createFractureCapSurface(object?: any, fracture?: any): any { return (this.environmentalDynamics as any).createFractureCapSurface(object, fracture); }
  public generateFractureDebris(object?: any, fracture?: any): any { return (this.environmentalDynamics as any).generateFractureDebris(object, fracture); }
  public assignDebrisMass(fragments?: any): any { return (this.environmentalDynamics as any).assignDebrisMass(fragments); }
  public assignDebrisCollision(fragments?: any): any { return (this.environmentalDynamics as any).assignDebrisCollision(fragments); }
  public calculateDebrisTrajectory(fragment?: any): any { return (this.environmentalDynamics as any).calculateDebrisTrajectory(fragment); }
  public simulateDebrisPileCollapse(pile?: any): any { return (this.environmentalDynamics as any).simulateDebrisPileCollapse(pile); }
  public detectSecondaryImpact(debris?: any): any { return (this.environmentalDynamics as any).detectSecondaryImpact(debris); }
  public triggerSecondaryFracture(object?: any, impact?: any): any { return (this.environmentalDynamics as any).triggerSecondaryFracture(object, impact); }
  public simulateProgressiveObjectFailure(object?: any): any { return (this.environmentalDynamics as any).simulateProgressiveObjectFailure(object); }
  public stabilizeRemainingStructure(object?: any): any { return (this.environmentalDynamics as any).stabilizeRemainingStructure(object); }
  public rebuildDestructibleMesh(object?: any): any { return (this.environmentalDynamics as any).rebuildDestructibleMesh(object); }
  public finalizeDestructionState(object?: any): any { return (this.environmentalDynamics as any).finalizeDestructionState(object); }
  public initializeWorldAnimation(): any { return (this.environmentalDynamics as any).initializeWorldAnimation(); }
  public loadWorldAnimationClips(): any { return (this.environmentalDynamics as any).loadWorldAnimationClips(); }
  public playWorldAnimation(object?: any, animation?: any): any { return (this.environmentalDynamics as any).playWorldAnimation(object, animation); }
  public blendWorldAnimations(object?: any, animations?: any): any { return (this.environmentalDynamics as any).blendWorldAnimations(object, animations); }
  public crossFadeWorldAnimation(object?: any, from?: any, to?: any): any { return (this.environmentalDynamics as any).crossFadeWorldAnimation(object, from, to); }
  public updateWorldAnimationMixer(deltaTime?: any): any { return (this.environmentalDynamics as any).updateWorldAnimationMixer(deltaTime); }
  public applyRootMotionToObject(object?: any, motion?: any): any { return (this.environmentalDynamics as any).applyRootMotionToObject(object, motion); }
  public interpolateObjectPosition(object?: any, deltaTime?: any): any { return (this.environmentalDynamics as any).interpolateObjectPosition(object, deltaTime); }
  public interpolateObjectRotation(object?: any, deltaTime?: any): any { return (this.environmentalDynamics as any).interpolateObjectRotation(object, deltaTime); }
  public updateObjectLOD(object?: any): any { return (this.environmentalDynamics as any).updateObjectLOD(object); }
  public updateVegetationLOD(region?: any): any { return (this.environmentalDynamics as any).updateVegetationLOD(region); }
  public updateDestructionLOD(object?: any): any { return (this.environmentalDynamics as any).updateDestructionLOD(object); }
  public cullInvisibleWorldObjects(): any { return (this.environmentalDynamics as any).cullInvisibleWorldObjects(); }
  public sleepInactiveRigidBodies(): any { return (this.environmentalDynamics as any).sleepInactiveRigidBodies(); }
  public wakeRigidBody(object?: any): any { return (this.environmentalDynamics as any).wakeRigidBody(object); }
  public synchronizePhysicsAndAnimation(object?: any): any { return (this.environmentalDynamics as any).synchronizePhysicsAndAnimation(object); }
  public rebuildWorldCollision(region?: any): any { return (this.environmentalDynamics as any).rebuildWorldCollision(region); }
  public updateWorldNavigation(region?: any): any { return (this.environmentalDynamics as any).updateWorldNavigation(region); }
  public validateWorldSimulation(region?: any): any { return (this.environmentalDynamics as any).validateWorldSimulation(region); }
  public optimizeWorldSimulationPerformance(): any { return (this.environmentalDynamics as any).optimizeWorldSimulationPerformance(); }
}
