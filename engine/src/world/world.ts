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
  public initializeWorld(
    ...args: Parameters<WorldLifecycleSubsystem['initializeWorld']>
  ): ReturnType<WorldLifecycleSubsystem['initializeWorld']> {
    return this.lifecycle.initializeWorld(...args);
  }
  public destroyWorld(
    ...args: Parameters<WorldLifecycleSubsystem['destroyWorld']>
  ): ReturnType<WorldLifecycleSubsystem['destroyWorld']> {
    return this.lifecycle.destroyWorld(...args);
  }
  public resetWorld(
    ...args: Parameters<WorldLifecycleSubsystem['resetWorld']>
  ): ReturnType<WorldLifecycleSubsystem['resetWorld']> {
    return this.lifecycle.resetWorld(...args);
  }
  public updateWorld(
    ...args: Parameters<WorldLifecycleSubsystem['updateWorld']>
  ): ReturnType<WorldLifecycleSubsystem['updateWorld']> {
    return this.lifecycle.updateWorld(...args);
  }
  public fixedUpdateWorld(
    ...args: Parameters<WorldLifecycleSubsystem['fixedUpdateWorld']>
  ): ReturnType<WorldLifecycleSubsystem['fixedUpdateWorld']> {
    return this.lifecycle.fixedUpdateWorld(...args);
  }
  public setWorldConfig(
    ...args: Parameters<WorldLifecycleSubsystem['setWorldConfig']>
  ): ReturnType<WorldLifecycleSubsystem['setWorldConfig']> {
    return this.lifecycle.setWorldConfig(...args);
  }
  public getWorldState(
    ...args: Parameters<WorldLifecycleSubsystem['getWorldState']>
  ): ReturnType<WorldLifecycleSubsystem['getWorldState']> {
    return this.lifecycle.getWorldState(...args);
  }
  public saveWorldState(
    ...args: Parameters<WorldLifecycleSubsystem['saveWorldState']>
  ): ReturnType<WorldLifecycleSubsystem['saveWorldState']> {
    return this.lifecycle.saveWorldState(...args);
  }
  public restoreWorldState(
    ...args: Parameters<WorldLifecycleSubsystem['restoreWorldState']>
  ): ReturnType<WorldLifecycleSubsystem['restoreWorldState']> {
    return this.lifecycle.restoreWorldState(...args);
  }
  public pauseWorldSimulation(
    ...args: Parameters<WorldLifecycleSubsystem['pauseWorldSimulation']>
  ): ReturnType<WorldLifecycleSubsystem['pauseWorldSimulation']> {
    return this.lifecycle.pauseWorldSimulation(...args);
  }
  public resumeWorldSimulation(
    ...args: Parameters<WorldLifecycleSubsystem['resumeWorldSimulation']>
  ): ReturnType<WorldLifecycleSubsystem['resumeWorldSimulation']> {
    return this.lifecycle.resumeWorldSimulation(...args);
  }
  public setWorldSimulationSpeed(
    ...args: Parameters<WorldLifecycleSubsystem['setWorldSimulationSpeed']>
  ): ReturnType<WorldLifecycleSubsystem['setWorldSimulationSpeed']> {
    return this.lifecycle.setWorldSimulationSpeed(...args);
  }
  public setWorldTime(
    ...args: Parameters<WorldLifecycleSubsystem['setWorldTime']>
  ): ReturnType<WorldLifecycleSubsystem['setWorldTime']> {
    return this.lifecycle.setWorldTime(...args);
  }
  public advanceWorldTime(
    ...args: Parameters<WorldLifecycleSubsystem['advanceWorldTime']>
  ): ReturnType<WorldLifecycleSubsystem['advanceWorldTime']> {
    return this.lifecycle.advanceWorldTime(...args);
  }
  public setWorldBounds(
    ...args: Parameters<WorldLifecycleSubsystem['setWorldBounds']>
  ): ReturnType<WorldLifecycleSubsystem['setWorldBounds']> {
    return this.lifecycle.setWorldBounds(...args);
  }
  public loadWorldRegion(
    ...args: Parameters<WorldLifecycleSubsystem['loadWorldRegion']>
  ): ReturnType<WorldLifecycleSubsystem['loadWorldRegion']> {
    return this.lifecycle.loadWorldRegion(...args);
  }
  public unloadWorldRegion(
    ...args: Parameters<WorldLifecycleSubsystem['unloadWorldRegion']>
  ): ReturnType<WorldLifecycleSubsystem['unloadWorldRegion']> {
    return this.lifecycle.unloadWorldRegion(...args);
  }
  public validateWorldState(
    ...args: Parameters<WorldLifecycleSubsystem['validateWorldState']>
  ): ReturnType<WorldLifecycleSubsystem['validateWorldState']> {
    return this.lifecycle.validateWorldState(...args);
  }
  public optimizeWorldSimulation(
    ...args: Parameters<WorldLifecycleSubsystem['optimizeWorldSimulation']>
  ): ReturnType<WorldLifecycleSubsystem['optimizeWorldSimulation']> {
    return this.lifecycle.optimizeWorldSimulation(...args);
  }
  public createWorldObject(
    ...args: Parameters<WorldLifecycleSubsystem['createWorldObject']>
  ): ReturnType<WorldLifecycleSubsystem['createWorldObject']> {
    return this.lifecycle.createWorldObject(...args);
  }
  public destroyWorldObject(
    ...args: Parameters<WorldLifecycleSubsystem['destroyWorldObject']>
  ): ReturnType<WorldLifecycleSubsystem['destroyWorldObject']> {
    return this.lifecycle.destroyWorldObject(...args);
  }
  public cloneWorldObject(
    ...args: Parameters<WorldLifecycleSubsystem['cloneWorldObject']>
  ): ReturnType<WorldLifecycleSubsystem['cloneWorldObject']> {
    return this.lifecycle.cloneWorldObject(...args);
  }
  public duplicateWorldObject(
    ...args: Parameters<WorldLifecycleSubsystem['duplicateWorldObject']>
  ): ReturnType<WorldLifecycleSubsystem['duplicateWorldObject']> {
    return this.lifecycle.duplicateWorldObject(...args);
  }
  public setObjectPosition(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectPosition']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectPosition']> {
    return this.lifecycle.setObjectPosition(...args);
  }
  public setObjectRotation(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectRotation']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectRotation']> {
    return this.lifecycle.setObjectRotation(...args);
  }
  public setObjectScale(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectScale']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectScale']> {
    return this.lifecycle.setObjectScale(...args);
  }
  public setObjectTransform(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectTransform']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectTransform']> {
    return this.lifecycle.setObjectTransform(...args);
  }
  public getObjectTransform(
    ...args: Parameters<WorldLifecycleSubsystem['getObjectTransform']>
  ): ReturnType<WorldLifecycleSubsystem['getObjectTransform']> {
    return this.lifecycle.getObjectTransform(...args);
  }
  public updateObjectTransform(
    ...args: Parameters<WorldLifecycleSubsystem['updateObjectTransform']>
  ): ReturnType<WorldLifecycleSubsystem['updateObjectTransform']> {
    return this.lifecycle.updateObjectTransform(...args);
  }
  public setObjectVisibility(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectVisibility']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectVisibility']> {
    return this.lifecycle.setObjectVisibility(...args);
  }
  public setObjectMaterial(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectMaterial']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectMaterial']> {
    return this.lifecycle.setObjectMaterial(...args);
  }
  public setObjectTexture(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectTexture']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectTexture']> {
    return this.lifecycle.setObjectTexture(...args);
  }
  public setObjectTags(
    ...args: Parameters<WorldLifecycleSubsystem['setObjectTags']>
  ): ReturnType<WorldLifecycleSubsystem['setObjectTags']> {
    return this.lifecycle.setObjectTags(...args);
  }
  public getObjectTags(
    ...args: Parameters<WorldLifecycleSubsystem['getObjectTags']>
  ): ReturnType<WorldLifecycleSubsystem['getObjectTags']> {
    return this.lifecycle.getObjectTags(...args);
  }
  public attachObjectToParent(
    ...args: Parameters<WorldLifecycleSubsystem['attachObjectToParent']>
  ): ReturnType<WorldLifecycleSubsystem['attachObjectToParent']> {
    return this.lifecycle.attachObjectToParent(...args);
  }
  public detachObjectFromParent(
    ...args: Parameters<WorldLifecycleSubsystem['detachObjectFromParent']>
  ): ReturnType<WorldLifecycleSubsystem['detachObjectFromParent']> {
    return this.lifecycle.detachObjectFromParent(...args);
  }
  public transferObjectToRegion(
    ...args: Parameters<WorldLifecycleSubsystem['transferObjectToRegion']>
  ): ReturnType<WorldLifecycleSubsystem['transferObjectToRegion']> {
    return this.lifecycle.transferObjectToRegion(...args);
  }
  public serializeWorldObject(
    ...args: Parameters<WorldLifecycleSubsystem['serializeWorldObject']>
  ): ReturnType<WorldLifecycleSubsystem['serializeWorldObject']> {
    return this.lifecycle.serializeWorldObject(...args);
  }
  public deserializeWorldObject(
    ...args: Parameters<WorldLifecycleSubsystem['deserializeWorldObject']>
  ): ReturnType<WorldLifecycleSubsystem['deserializeWorldObject']> {
    return this.lifecycle.deserializeWorldObject(...args);
  }
  public createTree(
    ...args: Parameters<VegetationSubsystem['createTree']>
  ): ReturnType<VegetationSubsystem['createTree']> {
    return this.vegetation.createTree(...args);
  }
  public initializeTree(
    ...args: Parameters<VegetationSubsystem['initializeTree']>
  ): ReturnType<VegetationSubsystem['initializeTree']> {
    return this.vegetation.initializeTree(...args);
  }
  public updateTree(
    ...args: Parameters<VegetationSubsystem['updateTree']>
  ): ReturnType<VegetationSubsystem['updateTree']> {
    return this.vegetation.updateTree(...args);
  }
  public growTree(
    ...args: Parameters<VegetationSubsystem['growTree']>
  ): ReturnType<VegetationSubsystem['growTree']> {
    return this.vegetation.growTree(...args);
  }
  public setTreeAge(
    ...args: Parameters<VegetationSubsystem['setTreeAge']>
  ): ReturnType<VegetationSubsystem['setTreeAge']> {
    return this.vegetation.setTreeAge(...args);
  }
  public updateTreeHeight(
    ...args: Parameters<VegetationSubsystem['updateTreeHeight']>
  ): ReturnType<VegetationSubsystem['updateTreeHeight']> {
    return this.vegetation.updateTreeHeight(...args);
  }
  public updateTreeThickness(
    ...args: Parameters<VegetationSubsystem['updateTreeThickness']>
  ): ReturnType<VegetationSubsystem['updateTreeThickness']> {
    return this.vegetation.updateTreeThickness(...args);
  }
  public updateTreeCanopy(
    ...args: Parameters<VegetationSubsystem['updateTreeCanopy']>
  ): ReturnType<VegetationSubsystem['updateTreeCanopy']> {
    return this.vegetation.updateTreeCanopy(...args);
  }
  public updateTreeRootSystem(
    ...args: Parameters<VegetationSubsystem['updateTreeRootSystem']>
  ): ReturnType<VegetationSubsystem['updateTreeRootSystem']> {
    return this.vegetation.updateTreeRootSystem(...args);
  }
  public updateTreeTrunk(
    ...args: Parameters<VegetationSubsystem['updateTreeTrunk']>
  ): ReturnType<VegetationSubsystem['updateTreeTrunk']> {
    return this.vegetation.updateTreeTrunk(...args);
  }
  public updateTreeBark(
    ...args: Parameters<VegetationSubsystem['updateTreeBark']>
  ): ReturnType<VegetationSubsystem['updateTreeBark']> {
    return this.vegetation.updateTreeBark(...args);
  }
  public updateTreeBranchStructure(
    ...args: Parameters<VegetationSubsystem['updateTreeBranchStructure']>
  ): ReturnType<VegetationSubsystem['updateTreeBranchStructure']> {
    return this.vegetation.updateTreeBranchStructure(...args);
  }
  public generateTreeBranches(
    ...args: Parameters<VegetationSubsystem['generateTreeBranches']>
  ): ReturnType<VegetationSubsystem['generateTreeBranches']> {
    return this.vegetation.generateTreeBranches(...args);
  }
  public extendTreeBranch(
    ...args: Parameters<VegetationSubsystem['extendTreeBranch']>
  ): ReturnType<VegetationSubsystem['extendTreeBranch']> {
    return this.vegetation.extendTreeBranch(...args);
  }
  public shortenTreeBranch(
    ...args: Parameters<VegetationSubsystem['shortenTreeBranch']>
  ): ReturnType<VegetationSubsystem['shortenTreeBranch']> {
    return this.vegetation.shortenTreeBranch(...args);
  }
  public bendTreeBranch(
    ...args: Parameters<VegetationSubsystem['bendTreeBranch']>
  ): ReturnType<VegetationSubsystem['bendTreeBranch']> {
    return this.vegetation.bendTreeBranch(...args);
  }
  public twistTreeBranch(
    ...args: Parameters<VegetationSubsystem['twistTreeBranch']>
  ): ReturnType<VegetationSubsystem['twistTreeBranch']> {
    return this.vegetation.twistTreeBranch(...args);
  }
  public repairTreeDamage(
    ...args: Parameters<VegetationSubsystem['repairTreeDamage']>
  ): ReturnType<VegetationSubsystem['repairTreeDamage']> {
    return this.vegetation.repairTreeDamage(...args);
  }
  public removeTree(
    ...args: Parameters<VegetationSubsystem['removeTree']>
  ): ReturnType<VegetationSubsystem['removeTree']> {
    return this.vegetation.removeTree(...args);
  }
  public regenerateTreeGeometry(
    ...args: Parameters<VegetationSubsystem['regenerateTreeGeometry']>
  ): ReturnType<VegetationSubsystem['regenerateTreeGeometry']> {
    return this.vegetation.regenerateTreeGeometry(...args);
  }
  public createBranch(
    ...args: Parameters<VegetationSubsystem['createBranch']>
  ): ReturnType<VegetationSubsystem['createBranch']> {
    return this.vegetation.createBranch(...args);
  }
  public splitBranch(
    ...args: Parameters<VegetationSubsystem['splitBranch']>
  ): ReturnType<VegetationSubsystem['splitBranch']> {
    return this.vegetation.splitBranch(...args);
  }
  public growBranch(
    ...args: Parameters<VegetationSubsystem['growBranch']>
  ): ReturnType<VegetationSubsystem['growBranch']> {
    return this.vegetation.growBranch(...args);
  }
  public thickenBranch(
    ...args: Parameters<VegetationSubsystem['thickenBranch']>
  ): ReturnType<VegetationSubsystem['thickenBranch']> {
    return this.vegetation.thickenBranch(...args);
  }
  public bendBranch(
    ...args: Parameters<VegetationSubsystem['bendBranch']>
  ): ReturnType<VegetationSubsystem['bendBranch']> {
    return this.vegetation.bendBranch(...args);
  }
  public straightenBranch(
    ...args: Parameters<VegetationSubsystem['straightenBranch']>
  ): ReturnType<VegetationSubsystem['straightenBranch']> {
    return this.vegetation.straightenBranch(...args);
  }
  public rotateBranch(
    ...args: Parameters<VegetationSubsystem['rotateBranch']>
  ): ReturnType<VegetationSubsystem['rotateBranch']> {
    return this.vegetation.rotateBranch(...args);
  }
  public twistBranch(
    ...args: Parameters<VegetationSubsystem['twistBranch']>
  ): ReturnType<VegetationSubsystem['twistBranch']> {
    return this.vegetation.twistBranch(...args);
  }
  public shakeBranch(
    ...args: Parameters<VegetationSubsystem['shakeBranch']>
  ): ReturnType<VegetationSubsystem['shakeBranch']> {
    return this.vegetation.shakeBranch(...args);
  }
  public applyBranchLoad(
    ...args: Parameters<VegetationSubsystem['applyBranchLoad']>
  ): ReturnType<VegetationSubsystem['applyBranchLoad']> {
    return this.vegetation.applyBranchLoad(...args);
  }
  public detectBranchStress(
    ...args: Parameters<VegetationSubsystem['detectBranchStress']>
  ): ReturnType<VegetationSubsystem['detectBranchStress']> {
    return this.vegetation.detectBranchStress(...args);
  }
  public detectBranchFracture(
    ...args: Parameters<VegetationSubsystem['detectBranchFracture']>
  ): ReturnType<VegetationSubsystem['detectBranchFracture']> {
    return this.vegetation.detectBranchFracture(...args);
  }
  public breakBranch(
    ...args: Parameters<VegetationSubsystem['breakBranch']>
  ): ReturnType<VegetationSubsystem['breakBranch']> {
    return this.vegetation.breakBranch(...args);
  }
  public snapBranchAtJoint(
    ...args: Parameters<VegetationSubsystem['snapBranchAtJoint']>
  ): ReturnType<VegetationSubsystem['snapBranchAtJoint']> {
    return this.vegetation.snapBranchAtJoint(...args);
  }
  public detachBranch(
    ...args: Parameters<VegetationSubsystem['detachBranch']>
  ): ReturnType<VegetationSubsystem['detachBranch']> {
    return this.vegetation.detachBranch(...args);
  }
  public fallBranch(
    ...args: Parameters<VegetationSubsystem['fallBranch']>
  ): ReturnType<VegetationSubsystem['fallBranch']> {
    return this.vegetation.fallBranch(...args);
  }
  public splitWoodGrain(
    ...args: Parameters<VegetationSubsystem['splitWoodGrain']>
  ): ReturnType<VegetationSubsystem['splitWoodGrain']> {
    return this.vegetation.splitWoodGrain(...args);
  }
  public crackWoodSurface(
    ...args: Parameters<VegetationSubsystem['crackWoodSurface']>
  ): ReturnType<VegetationSubsystem['crackWoodSurface']> {
    return this.vegetation.crackWoodSurface(...args);
  }
  public decayWood(
    ...args: Parameters<VegetationSubsystem['decayWood']>
  ): ReturnType<VegetationSubsystem['decayWood']> {
    return this.vegetation.decayWood(...args);
  }
  public regenerateBranchMesh(
    ...args: Parameters<VegetationSubsystem['regenerateBranchMesh']>
  ): ReturnType<VegetationSubsystem['regenerateBranchMesh']> {
    return this.vegetation.regenerateBranchMesh(...args);
  }
  public createLeaf(
    ...args: Parameters<VegetationSubsystem['createLeaf']>
  ): ReturnType<VegetationSubsystem['createLeaf']> {
    return this.vegetation.createLeaf(...args);
  }
  public initializeLeaf(
    ...args: Parameters<VegetationSubsystem['initializeLeaf']>
  ): ReturnType<VegetationSubsystem['initializeLeaf']> {
    return this.vegetation.initializeLeaf(...args);
  }
  public updateLeaf(
    ...args: Parameters<VegetationSubsystem['updateLeaf']>
  ): ReturnType<VegetationSubsystem['updateLeaf']> {
    return this.vegetation.updateLeaf(...args);
  }
  public growLeaf(
    ...args: Parameters<VegetationSubsystem['growLeaf']>
  ): ReturnType<VegetationSubsystem['growLeaf']> {
    return this.vegetation.growLeaf(...args);
  }
  public shrinkLeaf(
    ...args: Parameters<VegetationSubsystem['shrinkLeaf']>
  ): ReturnType<VegetationSubsystem['shrinkLeaf']> {
    return this.vegetation.shrinkLeaf(...args);
  }
  public unfoldLeaf(
    ...args: Parameters<VegetationSubsystem['unfoldLeaf']>
  ): ReturnType<VegetationSubsystem['unfoldLeaf']> {
    return this.vegetation.unfoldLeaf(...args);
  }
  public foldLeaf(
    ...args: Parameters<VegetationSubsystem['foldLeaf']>
  ): ReturnType<VegetationSubsystem['foldLeaf']> {
    return this.vegetation.foldLeaf(...args);
  }
  public curlLeaf(
    ...args: Parameters<VegetationSubsystem['curlLeaf']>
  ): ReturnType<VegetationSubsystem['curlLeaf']> {
    return this.vegetation.curlLeaf(...args);
  }
  public uncurlLeaf(
    ...args: Parameters<VegetationSubsystem['uncurlLeaf']>
  ): ReturnType<VegetationSubsystem['uncurlLeaf']> {
    return this.vegetation.uncurlLeaf(...args);
  }
  public bendLeaf(
    ...args: Parameters<VegetationSubsystem['bendLeaf']>
  ): ReturnType<VegetationSubsystem['bendLeaf']> {
    return this.vegetation.bendLeaf(...args);
  }
  public twistLeaf(
    ...args: Parameters<VegetationSubsystem['twistLeaf']>
  ): ReturnType<VegetationSubsystem['twistLeaf']> {
    return this.vegetation.twistLeaf(...args);
  }
  public flutterLeaf(
    ...args: Parameters<VegetationSubsystem['flutterLeaf']>
  ): ReturnType<VegetationSubsystem['flutterLeaf']> {
    return this.vegetation.flutterLeaf(...args);
  }
  public shakeLeaf(
    ...args: Parameters<VegetationSubsystem['shakeLeaf']>
  ): ReturnType<VegetationSubsystem['shakeLeaf']> {
    return this.vegetation.shakeLeaf(...args);
  }
  public droopLeaf(
    ...args: Parameters<VegetationSubsystem['droopLeaf']>
  ): ReturnType<VegetationSubsystem['droopLeaf']> {
    return this.vegetation.droopLeaf(...args);
  }
  public restoreLeafPose(
    ...args: Parameters<VegetationSubsystem['restoreLeafPose']>
  ): ReturnType<VegetationSubsystem['restoreLeafPose']> {
    return this.vegetation.restoreLeafPose(...args);
  }
  public changeLeafColor(
    ...args: Parameters<VegetationSubsystem['changeLeafColor']>
  ): ReturnType<VegetationSubsystem['changeLeafColor']> {
    return this.vegetation.changeLeafColor(...args);
  }
  public dryLeaf(
    ...args: Parameters<VegetationSubsystem['dryLeaf']>
  ): ReturnType<VegetationSubsystem['dryLeaf']> {
    return this.vegetation.dryLeaf(...args);
  }
  public detachLeaf(
    ...args: Parameters<VegetationSubsystem['detachLeaf']>
  ): ReturnType<VegetationSubsystem['detachLeaf']> {
    return this.vegetation.detachLeaf(...args);
  }
  public fallLeaf(
    ...args: Parameters<VegetationSubsystem['fallLeaf']>
  ): ReturnType<VegetationSubsystem['fallLeaf']> {
    return this.vegetation.fallLeaf(...args);
  }
  public landLeaf(
    ...args: Parameters<VegetationSubsystem['landLeaf']>
  ): ReturnType<VegetationSubsystem['landLeaf']> {
    return this.vegetation.landLeaf(...args);
  }
  public applyWindToTree(
    ...args: Parameters<VegetationSubsystem['applyWindToTree']>
  ): ReturnType<VegetationSubsystem['applyWindToTree']> {
    return this.vegetation.applyWindToTree(...args);
  }
  public applyWindToBranch(
    ...args: Parameters<VegetationSubsystem['applyWindToBranch']>
  ): ReturnType<VegetationSubsystem['applyWindToBranch']> {
    return this.vegetation.applyWindToBranch(...args);
  }
  public applyWindToLeaf(
    ...args: Parameters<VegetationSubsystem['applyWindToLeaf']>
  ): ReturnType<VegetationSubsystem['applyWindToLeaf']> {
    return this.vegetation.applyWindToLeaf(...args);
  }
  public calculateWindPressure(
    ...args: Parameters<VegetationSubsystem['calculateWindPressure']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateWindPressure']> {
    this.vegetation.calculateWindPressure(...args);
    return this.weatherAtmosphere.calculateWindPressure(...args);
  }
  public calculateWindDrag(
    ...args: Parameters<VegetationSubsystem['calculateWindDrag']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateWindDrag']> {
    this.vegetation.calculateWindDrag(...args);
    return this.weatherAtmosphere.calculateWindDrag(...args);
  }
  public calculateWindTorque(
    ...args: Parameters<VegetationSubsystem['calculateWindTorque']>
  ): ReturnType<VegetationSubsystem['calculateWindTorque']> {
    return this.vegetation.calculateWindTorque(...args);
  }
  public swayTreeTrunk(
    ...args: Parameters<VegetationSubsystem['swayTreeTrunk']>
  ): ReturnType<VegetationSubsystem['swayTreeTrunk']> {
    return this.vegetation.swayTreeTrunk(...args);
  }
  public swayTreeCanopy(
    ...args: Parameters<VegetationSubsystem['swayTreeCanopy']>
  ): ReturnType<VegetationSubsystem['swayTreeCanopy']> {
    return this.vegetation.swayTreeCanopy(...args);
  }
  public oscillateBranch(
    ...args: Parameters<VegetationSubsystem['oscillateBranch']>
  ): ReturnType<VegetationSubsystem['oscillateBranch']> {
    return this.vegetation.oscillateBranch(...args);
  }
  public flutterLeaves(
    ...args: Parameters<VegetationSubsystem['flutterLeaves']>
  ): ReturnType<VegetationSubsystem['flutterLeaves']> {
    return this.vegetation.flutterLeaves(...args);
  }
  public simulateWindGust(
    ...args: Parameters<VegetationSubsystem['simulateWindGust']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateWindGust']> {
    this.vegetation.simulateWindGust(...args);
    return this.weatherAtmosphere.simulateWindGust(...args);
  }
  public simulateTurbulentWind(
    ...args: Parameters<VegetationSubsystem['simulateTurbulentWind']>
  ): ReturnType<VegetationSubsystem['simulateTurbulentWind']> {
    return this.vegetation.simulateTurbulentWind(...args);
  }
  public simulateWindShear(
    ...args: Parameters<VegetationSubsystem['simulateWindShear']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateWindShear']> {
    this.vegetation.simulateWindShear(...args);
    return this.weatherAtmosphere.simulateWindShear(...args);
  }
  public updateWindDirection(
    ...args: Parameters<VegetationSubsystem['updateWindDirection']>
  ): ReturnType<VegetationSubsystem['updateWindDirection']> {
    return this.vegetation.updateWindDirection(...args);
  }
  public updateWindStrength(
    ...args: Parameters<VegetationSubsystem['updateWindStrength']>
  ): ReturnType<VegetationSubsystem['updateWindStrength']> {
    return this.vegetation.updateWindStrength(...args);
  }
  public updateWindFrequency(
    ...args: Parameters<VegetationSubsystem['updateWindFrequency']>
  ): ReturnType<VegetationSubsystem['updateWindFrequency']> {
    return this.vegetation.updateWindFrequency(...args);
  }
  public detectWindDamage(
    ...args: Parameters<VegetationSubsystem['detectWindDamage']>
  ): ReturnType<WeatherAtmosphereSubsystem['detectWindDamage']> {
    this.vegetation.detectWindDamage(...args);
    return this.weatherAtmosphere.detectWindDamage(...args, undefined);
  }
  public breakWindDamagedBranch(
    ...args: Parameters<VegetationSubsystem['breakWindDamagedBranch']>
  ): ReturnType<VegetationSubsystem['breakWindDamagedBranch']> {
    return this.vegetation.breakWindDamagedBranch(...args);
  }
  public shedLeavesInWind(
    ...args: Parameters<VegetationSubsystem['shedLeavesInWind']>
  ): ReturnType<VegetationSubsystem['shedLeavesInWind']> {
    return this.vegetation.shedLeavesInWind(...args);
  }
  public stabilizeVegetationAfterWind(
    ...args: Parameters<VegetationSubsystem['stabilizeVegetationAfterWind']>
  ): ReturnType<VegetationSubsystem['stabilizeVegetationAfterWind']> {
    return this.vegetation.stabilizeVegetationAfterWind(...args);
  }
  public createRootSystem(
    ...args: Parameters<VegetationSubsystem['createRootSystem']>
  ): ReturnType<VegetationSubsystem['createRootSystem']> {
    return this.vegetation.createRootSystem(...args);
  }
  public growRoot(
    ...args: Parameters<VegetationSubsystem['growRoot']>
  ): ReturnType<VegetationSubsystem['growRoot']> {
    return this.vegetation.growRoot(...args);
  }
  public extendRootIntoSoil(
    ...args: Parameters<VegetationSubsystem['extendRootIntoSoil']>
  ): ReturnType<VegetationSubsystem['extendRootIntoSoil']> {
    return this.vegetation.extendRootIntoSoil(...args);
  }
  public thickenRoot(
    ...args: Parameters<VegetationSubsystem['thickenRoot']>
  ): ReturnType<VegetationSubsystem['thickenRoot']> {
    return this.vegetation.thickenRoot(...args);
  }
  public branchRootSystem(
    ...args: Parameters<VegetationSubsystem['branchRootSystem']>
  ): ReturnType<VegetationSubsystem['branchRootSystem']> {
    return this.vegetation.branchRootSystem(...args);
  }
  public detectRootObstacles(
    ...args: Parameters<VegetationSubsystem['detectRootObstacles']>
  ): ReturnType<VegetationSubsystem['detectRootObstacles']> {
    return this.vegetation.detectRootObstacles(...args);
  }
  public wrapRootAroundObstacle(
    ...args: Parameters<VegetationSubsystem['wrapRootAroundObstacle']>
  ): ReturnType<VegetationSubsystem['wrapRootAroundObstacle']> {
    return this.vegetation.wrapRootAroundObstacle(...args);
  }
  public penetrateSoil(
    ...args: Parameters<VegetationSubsystem['penetrateSoil']>
  ): ReturnType<VegetationSubsystem['penetrateSoil']> {
    return this.vegetation.penetrateSoil(...args);
  }
  public absorbWaterThroughRoots(
    ...args: Parameters<VegetationSubsystem['absorbWaterThroughRoots']>
  ): ReturnType<VegetationSubsystem['absorbWaterThroughRoots']> {
    return this.vegetation.absorbWaterThroughRoots(...args);
  }
  public absorbNutrientsThroughRoots(
    ...args: Parameters<VegetationSubsystem['absorbNutrientsThroughRoots']>
  ): ReturnType<VegetationSubsystem['absorbNutrientsThroughRoots']> {
    return this.vegetation.absorbNutrientsThroughRoots(...args);
  }
  public detectRootDamage(
    ...args: Parameters<VegetationSubsystem['detectRootDamage']>
  ): ReturnType<VegetationSubsystem['detectRootDamage']> {
    return this.vegetation.detectRootDamage(...args);
  }
  public breakRoot(
    ...args: Parameters<VegetationSubsystem['breakRoot']>
  ): ReturnType<VegetationSubsystem['breakRoot']> {
    return this.vegetation.breakRoot(...args);
  }
  public decayRoot(
    ...args: Parameters<VegetationSubsystem['decayRoot']>
  ): ReturnType<VegetationSubsystem['decayRoot']> {
    return this.vegetation.decayRoot(...args);
  }
  public anchorTreeWithRoots(
    ...args: Parameters<VegetationSubsystem['anchorTreeWithRoots']>
  ): ReturnType<VegetationSubsystem['anchorTreeWithRoots']> {
    return this.vegetation.anchorTreeWithRoots(...args);
  }
  public loosenRootAnchorage(
    ...args: Parameters<VegetationSubsystem['loosenRootAnchorage']>
  ): ReturnType<VegetationSubsystem['loosenRootAnchorage']> {
    return this.vegetation.loosenRootAnchorage(...args);
  }
  public calculateRootStability(
    ...args: Parameters<VegetationSubsystem['calculateRootStability']>
  ): ReturnType<VegetationSubsystem['calculateRootStability']> {
    return this.vegetation.calculateRootStability(...args);
  }
  public simulateRootCompetition(
    ...args: Parameters<VegetationSubsystem['simulateRootCompetition']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateRootCompetition']> {
    this.vegetation.simulateRootCompetition(...args);
    return this.environmentalDynamics.simulateRootCompetition(...args);
  }
  public updateRootGrowthDirection(
    ...args: Parameters<VegetationSubsystem['updateRootGrowthDirection']>
  ): ReturnType<VegetationSubsystem['updateRootGrowthDirection']> {
    return this.vegetation.updateRootGrowthDirection(...args);
  }
  public regenerateRootMesh(
    ...args: Parameters<VegetationSubsystem['regenerateRootMesh']>
  ): ReturnType<VegetationSubsystem['regenerateRootMesh']> {
    return this.vegetation.regenerateRootMesh(...args);
  }
  public updateRootSoilInteraction(
    ...args: Parameters<VegetationSubsystem['updateRootSoilInteraction']>
  ): ReturnType<VegetationSubsystem['updateRootSoilInteraction']> {
    return this.vegetation.updateRootSoilInteraction(...args);
  }
  public createFlower(
    ...args: Parameters<VegetationSubsystem['createFlower']>
  ): ReturnType<VegetationSubsystem['createFlower']> {
    return this.vegetation.createFlower(...args);
  }
  public initializeFlower(
    ...args: Parameters<VegetationSubsystem['initializeFlower']>
  ): ReturnType<VegetationSubsystem['initializeFlower']> {
    return this.vegetation.initializeFlower(...args);
  }
  public growFlower(
    ...args: Parameters<VegetationSubsystem['growFlower']>
  ): ReturnType<VegetationSubsystem['growFlower']> {
    return this.vegetation.growFlower(...args);
  }
  public developFlowerBud(
    ...args: Parameters<VegetationSubsystem['developFlowerBud']>
  ): ReturnType<VegetationSubsystem['developFlowerBud']> {
    return this.vegetation.developFlowerBud(...args);
  }
  public swellFlowerBud(
    ...args: Parameters<VegetationSubsystem['swellFlowerBud']>
  ): ReturnType<VegetationSubsystem['swellFlowerBud']> {
    return this.vegetation.swellFlowerBud(...args);
  }
  public openFlowerBud(
    ...args: Parameters<VegetationSubsystem['openFlowerBud']>
  ): ReturnType<VegetationSubsystem['openFlowerBud']> {
    return this.vegetation.openFlowerBud(...args);
  }
  public bloomFlower(
    ...args: Parameters<VegetationSubsystem['bloomFlower']>
  ): ReturnType<VegetationSubsystem['bloomFlower']> {
    return this.vegetation.bloomFlower(...args);
  }
  public unfoldPetals(
    ...args: Parameters<VegetationSubsystem['unfoldPetals']>
  ): ReturnType<VegetationSubsystem['unfoldPetals']> {
    return this.vegetation.unfoldPetals(...args);
  }
  public foldPetals(
    ...args: Parameters<VegetationSubsystem['foldPetals']>
  ): ReturnType<VegetationSubsystem['foldPetals']> {
    return this.vegetation.foldPetals(...args);
  }
  public rotateFlower(
    ...args: Parameters<VegetationSubsystem['rotateFlower']>
  ): ReturnType<VegetationSubsystem['rotateFlower']> {
    return this.vegetation.rotateFlower(...args);
  }
  public swayFlower(
    ...args: Parameters<VegetationSubsystem['swayFlower']>
  ): ReturnType<VegetationSubsystem['swayFlower']> {
    return this.vegetation.swayFlower(...args);
  }
  public flutterPetals(
    ...args: Parameters<VegetationSubsystem['flutterPetals']>
  ): ReturnType<VegetationSubsystem['flutterPetals']> {
    return this.vegetation.flutterPetals(...args);
  }
  public changePetalColor(
    ...args: Parameters<VegetationSubsystem['changePetalColor']>
  ): ReturnType<VegetationSubsystem['changePetalColor']> {
    return this.vegetation.changePetalColor(...args);
  }
  public closeFlowerAtNight(
    ...args: Parameters<VegetationSubsystem['closeFlowerAtNight']>
  ): ReturnType<VegetationSubsystem['closeFlowerAtNight']> {
    return this.vegetation.closeFlowerAtNight(...args);
  }
  public reopenFlowerAtDay(
    ...args: Parameters<VegetationSubsystem['reopenFlowerAtDay']>
  ): ReturnType<VegetationSubsystem['reopenFlowerAtDay']> {
    return this.vegetation.reopenFlowerAtDay(...args);
  }
  public wiltFlower(
    ...args: Parameters<VegetationSubsystem['wiltFlower']>
  ): ReturnType<VegetationSubsystem['wiltFlower']> {
    return this.vegetation.wiltFlower(...args);
  }
  public dryPetals(
    ...args: Parameters<VegetationSubsystem['dryPetals']>
  ): ReturnType<VegetationSubsystem['dryPetals']> {
    return this.vegetation.dryPetals(...args);
  }
  public detachPetal(
    ...args: Parameters<VegetationSubsystem['detachPetal']>
  ): ReturnType<VegetationSubsystem['detachPetal']> {
    return this.vegetation.detachPetal(...args);
  }
  public scatterPetals(
    ...args: Parameters<VegetationSubsystem['scatterPetals']>
  ): ReturnType<VegetationSubsystem['scatterPetals']> {
    return this.vegetation.scatterPetals(...args);
  }
  public dropWitheredFlower(
    ...args: Parameters<VegetationSubsystem['dropWitheredFlower']>
  ): ReturnType<VegetationSubsystem['dropWitheredFlower']> {
    return this.vegetation.dropWitheredFlower(...args);
  }
  public createFruit(
    ...args: Parameters<VegetationSubsystem['createFruit']>
  ): ReturnType<VegetationSubsystem['createFruit']> {
    return this.vegetation.createFruit(...args);
  }
  public developFruit(
    ...args: Parameters<VegetationSubsystem['developFruit']>
  ): ReturnType<VegetationSubsystem['developFruit']> {
    return this.vegetation.developFruit(...args);
  }
  public growFruit(
    ...args: Parameters<VegetationSubsystem['growFruit']>
  ): ReturnType<VegetationSubsystem['growFruit']> {
    return this.vegetation.growFruit(...args);
  }
  public ripenFruit(
    ...args: Parameters<VegetationSubsystem['ripenFruit']>
  ): ReturnType<VegetationSubsystem['ripenFruit']> {
    return this.vegetation.ripenFruit(...args);
  }
  public changeFruitColor(
    ...args: Parameters<VegetationSubsystem['changeFruitColor']>
  ): ReturnType<VegetationSubsystem['changeFruitColor']> {
    return this.vegetation.changeFruitColor(...args);
  }
  public softenFruit(
    ...args: Parameters<VegetationSubsystem['softenFruit']>
  ): ReturnType<VegetationSubsystem['softenFruit']> {
    return this.vegetation.softenFruit(...args);
  }
  public rotFruit(
    ...args: Parameters<VegetationSubsystem['rotFruit']>
  ): ReturnType<VegetationSubsystem['rotFruit']> {
    return this.vegetation.rotFruit(...args);
  }
  public detachFruit(
    ...args: Parameters<VegetationSubsystem['detachFruit']>
  ): ReturnType<VegetationSubsystem['detachFruit']> {
    return this.vegetation.detachFruit(...args);
  }
  public fallFruit(
    ...args: Parameters<VegetationSubsystem['fallFruit']>
  ): ReturnType<VegetationSubsystem['fallFruit']> {
    return this.vegetation.fallFruit(...args);
  }
  public bounceFruit(
    ...args: Parameters<VegetationSubsystem['bounceFruit']>
  ): ReturnType<VegetationSubsystem['bounceFruit']> {
    return this.vegetation.bounceFruit(...args);
  }
  public splitFruit(
    ...args: Parameters<VegetationSubsystem['splitFruit']>
  ): ReturnType<VegetationSubsystem['splitFruit']> {
    return this.vegetation.splitFruit(...args);
  }
  public exposeSeeds(
    ...args: Parameters<VegetationSubsystem['exposeSeeds']>
  ): ReturnType<VegetationSubsystem['exposeSeeds']> {
    return this.vegetation.exposeSeeds(...args);
  }
  public createSeed(
    ...args: Parameters<VegetationSubsystem['createSeed']>
  ): ReturnType<VegetationSubsystem['createSeed']> {
    return this.vegetation.createSeed(...args);
  }
  public disperseSeed(
    ...args: Parameters<VegetationSubsystem['disperseSeed']>
  ): ReturnType<VegetationSubsystem['disperseSeed']> {
    return this.vegetation.disperseSeed(...args);
  }
  public burySeed(
    ...args: Parameters<VegetationSubsystem['burySeed']>
  ): ReturnType<VegetationSubsystem['burySeed']> {
    return this.vegetation.burySeed(...args);
  }
  public germinateSeed(
    ...args: Parameters<VegetationSubsystem['germinateSeed']>
  ): ReturnType<VegetationSubsystem['germinateSeed']> {
    return this.vegetation.germinateSeed(...args);
  }
  public sproutSeed(
    ...args: Parameters<VegetationSubsystem['sproutSeed']>
  ): ReturnType<VegetationSubsystem['sproutSeed']> {
    return this.vegetation.sproutSeed(...args);
  }
  public developSeedling(
    ...args: Parameters<VegetationSubsystem['developSeedling']>
  ): ReturnType<VegetationSubsystem['developSeedling']> {
    return this.vegetation.developSeedling(...args);
  }
  public maturePlant(
    ...args: Parameters<VegetationSubsystem['maturePlant']>
  ): ReturnType<VegetationSubsystem['maturePlant']> {
    return this.vegetation.maturePlant(...args);
  }
  public restartPlantGrowthCycle(
    ...args: Parameters<VegetationSubsystem['restartPlantGrowthCycle']>
  ): ReturnType<VegetationSubsystem['restartPlantGrowthCycle']> {
    return this.vegetation.restartPlantGrowthCycle(...args);
  }
  public calculatePlantHealth(
    ...args: Parameters<VegetationSubsystem['calculatePlantHealth']>
  ): ReturnType<VegetationSubsystem['calculatePlantHealth']> {
    return this.vegetation.calculatePlantHealth(...args);
  }
  public calculatePlantStress(
    ...args: Parameters<VegetationSubsystem['calculatePlantStress']>
  ): ReturnType<VegetationSubsystem['calculatePlantStress']> {
    return this.vegetation.calculatePlantStress(...args);
  }
  public detectPlantDrought(
    ...args: Parameters<VegetationSubsystem['detectPlantDrought']>
  ): ReturnType<VegetationSubsystem['detectPlantDrought']> {
    return this.vegetation.detectPlantDrought(...args);
  }
  public detectPlantDisease(
    ...args: Parameters<VegetationSubsystem['detectPlantDisease']>
  ): ReturnType<VegetationSubsystem['detectPlantDisease']> {
    return this.vegetation.detectPlantDisease(...args);
  }
  public detectPlantDamage(
    ...args: Parameters<VegetationSubsystem['detectPlantDamage']>
  ): ReturnType<VegetationSubsystem['detectPlantDamage']> {
    return this.vegetation.detectPlantDamage(...args);
  }
  public reducePlantVitality(
    ...args: Parameters<VegetationSubsystem['reducePlantVitality']>
  ): ReturnType<VegetationSubsystem['reducePlantVitality']> {
    return this.vegetation.reducePlantVitality(...args);
  }
  public wiltPlant(
    ...args: Parameters<VegetationSubsystem['wiltPlant']>
  ): ReturnType<VegetationSubsystem['wiltPlant']> {
    return this.vegetation.wiltPlant(...args);
  }
  public dryPlantLeaves(
    ...args: Parameters<VegetationSubsystem['dryPlantLeaves']>
  ): ReturnType<VegetationSubsystem['dryPlantLeaves']> {
    return this.vegetation.dryPlantLeaves(...args);
  }
  public discolorPlantLeaves(
    ...args: Parameters<VegetationSubsystem['discolorPlantLeaves']>
  ): ReturnType<VegetationSubsystem['discolorPlantLeaves']> {
    return this.vegetation.discolorPlantLeaves(...args);
  }
  public shedDeadLeaves(
    ...args: Parameters<VegetationSubsystem['shedDeadLeaves']>
  ): ReturnType<VegetationSubsystem['shedDeadLeaves']> {
    return this.vegetation.shedDeadLeaves(...args);
  }
  public killPlant(
    ...args: Parameters<VegetationSubsystem['killPlant']>
  ): ReturnType<VegetationSubsystem['killPlant']> {
    return this.vegetation.killPlant(...args);
  }
  public enterDormancy(
    ...args: Parameters<VegetationSubsystem['enterDormancy']>
  ): ReturnType<VegetationSubsystem['enterDormancy']> {
    return this.vegetation.enterDormancy(...args);
  }
  public resumePlantGrowth(
    ...args: Parameters<VegetationSubsystem['resumePlantGrowth']>
  ): ReturnType<VegetationSubsystem['resumePlantGrowth']> {
    return this.vegetation.resumePlantGrowth(...args);
  }
  public decayPlantTissue(
    ...args: Parameters<VegetationSubsystem['decayPlantTissue']>
  ): ReturnType<VegetationSubsystem['decayPlantTissue']> {
    return this.vegetation.decayPlantTissue(...args);
  }
  public decomposeDeadPlant(
    ...args: Parameters<VegetationSubsystem['decomposeDeadPlant']>
  ): ReturnType<VegetationSubsystem['decomposeDeadPlant']> {
    return this.vegetation.decomposeDeadPlant(...args);
  }
  public detachDeadBranch(
    ...args: Parameters<VegetationSubsystem['detachDeadBranch']>
  ): ReturnType<VegetationSubsystem['detachDeadBranch']> {
    return this.vegetation.detachDeadBranch(...args);
  }
  public collapseDeadTree(
    ...args: Parameters<VegetationSubsystem['collapseDeadTree']>
  ): ReturnType<VegetationSubsystem['collapseDeadTree']> {
    return this.vegetation.collapseDeadTree(...args);
  }
  public spreadPlantDisease(
    ...args: Parameters<VegetationSubsystem['spreadPlantDisease']>
  ): ReturnType<VegetationSubsystem['spreadPlantDisease']> {
    return this.vegetation.spreadPlantDisease(...args);
  }
  public regenerateDamagedPlant(
    ...args: Parameters<VegetationSubsystem['regenerateDamagedPlant']>
  ): ReturnType<VegetationSubsystem['regenerateDamagedPlant']> {
    return this.vegetation.regenerateDamagedPlant(...args);
  }
  public recyclePlantNutrients(
    ...args: Parameters<VegetationSubsystem['recyclePlantNutrients']>
  ): ReturnType<VegetationSubsystem['recyclePlantNutrients']> {
    return this.vegetation.recyclePlantNutrients(...args);
  }
  public createGrassPatch(
    ...args: Parameters<VegetationSubsystem['createGrassPatch']>
  ): ReturnType<VegetationSubsystem['createGrassPatch']> {
    return this.vegetation.createGrassPatch(...args);
  }
  public growGrassBlade(
    ...args: Parameters<VegetationSubsystem['growGrassBlade']>
  ): ReturnType<VegetationSubsystem['growGrassBlade']> {
    return this.vegetation.growGrassBlade(...args);
  }
  public bendGrassBlade(
    ...args: Parameters<VegetationSubsystem['bendGrassBlade']>
  ): ReturnType<VegetationSubsystem['bendGrassBlade']> {
    return this.vegetation.bendGrassBlade(...args);
  }
  public swayGrassPatch(
    ...args: Parameters<VegetationSubsystem['swayGrassPatch']>
  ): ReturnType<VegetationSubsystem['swayGrassPatch']> {
    return this.vegetation.swayGrassPatch(...args);
  }
  public flattenGrassPatch(
    ...args: Parameters<VegetationSubsystem['flattenGrassPatch']>
  ): ReturnType<VegetationSubsystem['flattenGrassPatch']> {
    return this.vegetation.flattenGrassPatch(...args);
  }
  public restoreGrassPatch(
    ...args: Parameters<VegetationSubsystem['restoreGrassPatch']>
  ): ReturnType<VegetationSubsystem['restoreGrassPatch']> {
    return this.vegetation.restoreGrassPatch(...args);
  }
  public trampleGrassPatch(
    ...args: Parameters<VegetationSubsystem['trampleGrassPatch']>
  ): ReturnType<VegetationSubsystem['trampleGrassPatch']> {
    return this.vegetation.trampleGrassPatch(...args);
  }
  public regrowTrampledGrass(
    ...args: Parameters<VegetationSubsystem['regrowTrampledGrass']>
  ): ReturnType<VegetationSubsystem['regrowTrampledGrass']> {
    return this.vegetation.regrowTrampledGrass(...args);
  }
  public dryGrassPatch(
    ...args: Parameters<VegetationSubsystem['dryGrassPatch']>
  ): ReturnType<VegetationSubsystem['dryGrassPatch']> {
    return this.vegetation.dryGrassPatch(...args);
  }
  public igniteDryGrass(
    ...args: Parameters<VegetationSubsystem['igniteDryGrass']>
  ): ReturnType<VegetationSubsystem['igniteDryGrass']> {
    return this.vegetation.igniteDryGrass(...args);
  }
  public createShrub(
    ...args: Parameters<VegetationSubsystem['createShrub']>
  ): ReturnType<VegetationSubsystem['createShrub']> {
    return this.vegetation.createShrub(...args);
  }
  public growShrub(
    ...args: Parameters<VegetationSubsystem['growShrub']>
  ): ReturnType<VegetationSubsystem['growShrub']> {
    return this.vegetation.growShrub(...args);
  }
  public trimShrub(
    ...args: Parameters<VegetationSubsystem['trimShrub']>
  ): ReturnType<VegetationSubsystem['trimShrub']> {
    return this.vegetation.trimShrub(...args);
  }
  public crushShrub(
    ...args: Parameters<VegetationSubsystem['crushShrub']>
  ): ReturnType<VegetationSubsystem['crushShrub']> {
    return this.vegetation.crushShrub(...args);
  }
  public createVine(
    ...args: Parameters<VegetationSubsystem['createVine']>
  ): ReturnType<VegetationSubsystem['createVine']> {
    return this.vegetation.createVine(...args);
  }
  public extendVine(
    ...args: Parameters<VegetationSubsystem['extendVine']>
  ): ReturnType<VegetationSubsystem['extendVine']> {
    return this.vegetation.extendVine(...args);
  }
  public wrapVineAroundObject(
    ...args: Parameters<VegetationSubsystem['wrapVineAroundObject']>
  ): ReturnType<VegetationSubsystem['wrapVineAroundObject']> {
    return this.vegetation.wrapVineAroundObject(...args);
  }
  public detachVine(
    ...args: Parameters<VegetationSubsystem['detachVine']>
  ): ReturnType<VegetationSubsystem['detachVine']> {
    return this.vegetation.detachVine(...args);
  }
  public growMoss(
    ...args: Parameters<VegetationSubsystem['growMoss']>
  ): ReturnType<VegetationSubsystem['growMoss']> {
    return this.vegetation.growMoss(...args);
  }
  public dryMoss(
    ...args: Parameters<VegetationSubsystem['dryMoss']>
  ): ReturnType<VegetationSubsystem['dryMoss']> {
    return this.vegetation.dryMoss(...args);
  }
  public createRock(
    ...args: Parameters<TerrainHydrologySubsystem['createRock']>
  ): ReturnType<TerrainHydrologySubsystem['createRock']> {
    return this.terrainHydrology.createRock(...args);
  }
  public generateRockGeometry(
    ...args: Parameters<TerrainHydrologySubsystem['generateRockGeometry']>
  ): ReturnType<TerrainHydrologySubsystem['generateRockGeometry']> {
    return this.terrainHydrology.generateRockGeometry(...args);
  }
  public setRockHardness(
    ...args: Parameters<TerrainHydrologySubsystem['setRockHardness']>
  ): ReturnType<TerrainHydrologySubsystem['setRockHardness']> {
    return this.terrainHydrology.setRockHardness(...args);
  }
  public applyRockStress(
    ...args: Parameters<TerrainHydrologySubsystem['applyRockStress']>
  ): ReturnType<TerrainHydrologySubsystem['applyRockStress']> {
    return this.terrainHydrology.applyRockStress(...args);
  }
  public detectRockCracks(
    ...args: Parameters<TerrainHydrologySubsystem['detectRockCracks']>
  ): ReturnType<TerrainHydrologySubsystem['detectRockCracks']> {
    return this.terrainHydrology.detectRockCracks(...args);
  }
  public initiateRockFracture(
    ...args: Parameters<TerrainHydrologySubsystem['initiateRockFracture']>
  ): ReturnType<TerrainHydrologySubsystem['initiateRockFracture']> {
    return this.terrainHydrology.initiateRockFracture(...args);
  }
  public fractureRock(
    ...args: Parameters<TerrainHydrologySubsystem['fractureRock']>
  ): ReturnType<TerrainHydrologySubsystem['fractureRock']> {
    return this.terrainHydrology.fractureRock(...args);
  }
  public splitRockIntoFragments(
    ...args: Parameters<TerrainHydrologySubsystem['splitRockIntoFragments']>
  ): ReturnType<TerrainHydrologySubsystem['splitRockIntoFragments']> {
    return this.terrainHydrology.splitRockIntoFragments(...args);
  }
  public chipRockSurface(
    ...args: Parameters<TerrainHydrologySubsystem['chipRockSurface']>
  ): ReturnType<TerrainHydrologySubsystem['chipRockSurface']> {
    return this.terrainHydrology.chipRockSurface(...args);
  }
  public erodeRockSurface(
    ...args: Parameters<TerrainHydrologySubsystem['erodeRockSurface']>
  ): ReturnType<TerrainHydrologySubsystem['erodeRockSurface']> {
    return this.terrainHydrology.erodeRockSurface(...args);
  }
  public weatherRock(
    ...args: Parameters<TerrainHydrologySubsystem['weatherRock']>
  ): ReturnType<TerrainHydrologySubsystem['weatherRock']> {
    return this.terrainHydrology.weatherRock(...args);
  }
  public dissolveRock(
    ...args: Parameters<TerrainHydrologySubsystem['dissolveRock']>
  ): ReturnType<TerrainHydrologySubsystem['dissolveRock']> {
    return this.terrainHydrology.dissolveRock(...args);
  }
  public polishRockSurface(
    ...args: Parameters<TerrainHydrologySubsystem['polishRockSurface']>
  ): ReturnType<TerrainHydrologySubsystem['polishRockSurface']> {
    return this.terrainHydrology.polishRockSurface(...args);
  }
  public dislodgeRock(
    ...args: Parameters<TerrainHydrologySubsystem['dislodgeRock']>
  ): ReturnType<TerrainHydrologySubsystem['dislodgeRock']> {
    return this.terrainHydrology.dislodgeRock(...args);
  }
  public rollRock(
    ...args: Parameters<TerrainHydrologySubsystem['rollRock']>
  ): ReturnType<TerrainHydrologySubsystem['rollRock']> {
    return this.terrainHydrology.rollRock(...args);
  }
  public slideRock(
    ...args: Parameters<TerrainHydrologySubsystem['slideRock']>
  ): ReturnType<TerrainHydrologySubsystem['slideRock']> {
    return this.terrainHydrology.slideRock(...args);
  }
  public toppleRock(
    ...args: Parameters<TerrainHydrologySubsystem['toppleRock']>
  ): ReturnType<TerrainHydrologySubsystem['toppleRock']> {
    return this.terrainHydrology.toppleRock(...args);
  }
  public buryRock(
    ...args: Parameters<TerrainHydrologySubsystem['buryRock']>
  ): ReturnType<TerrainHydrologySubsystem['buryRock']> {
    return this.terrainHydrology.buryRock(...args);
  }
  public exposeRock(
    ...args: Parameters<TerrainHydrologySubsystem['exposeRock']>
  ): ReturnType<TerrainHydrologySubsystem['exposeRock']> {
    return this.terrainHydrology.exposeRock(...args);
  }
  public regenerateRockCollision(
    ...args: Parameters<TerrainHydrologySubsystem['regenerateRockCollision']>
  ): ReturnType<TerrainHydrologySubsystem['regenerateRockCollision']> {
    return this.terrainHydrology.regenerateRockCollision(...args);
  }
  public createMountain(
    ...args: Parameters<TerrainHydrologySubsystem['createMountain']>
  ): ReturnType<TerrainHydrologySubsystem['createMountain']> {
    return this.terrainHydrology.createMountain(...args);
  }
  public generateMountainTerrain(
    ...args: Parameters<TerrainHydrologySubsystem['generateMountainTerrain']>
  ): ReturnType<TerrainHydrologySubsystem['generateMountainTerrain']> {
    return this.terrainHydrology.generateMountainTerrain(...args);
  }
  public updateMountainHeight(
    ...args: Parameters<TerrainHydrologySubsystem['updateMountainHeight']>
  ): ReturnType<TerrainHydrologySubsystem['updateMountainHeight']> {
    return this.terrainHydrology.updateMountainHeight(...args);
  }
  public deformMountainSurface(
    ...args: Parameters<TerrainHydrologySubsystem['deformMountainSurface']>
  ): ReturnType<TerrainHydrologySubsystem['deformMountainSurface']> {
    return this.terrainHydrology.deformMountainSurface(...args);
  }
  public formRockyRidge(
    ...args: Parameters<TerrainHydrologySubsystem['formRockyRidge']>
  ): ReturnType<TerrainHydrologySubsystem['formRockyRidge']> {
    return this.terrainHydrology.formRockyRidge(...args);
  }
  public formMountainValley(
    ...args: Parameters<TerrainHydrologySubsystem['formMountainValley']>
  ): ReturnType<TerrainHydrologySubsystem['formMountainValley']> {
    return this.terrainHydrology.formMountainValley(...args);
  }
  public generateCliffFace(
    ...args: Parameters<TerrainHydrologySubsystem['generateCliffFace']>
  ): ReturnType<TerrainHydrologySubsystem['generateCliffFace']> {
    return this.terrainHydrology.generateCliffFace(...args);
  }
  public erodeMountain(
    ...args: Parameters<TerrainHydrologySubsystem['erodeMountain']>
  ): ReturnType<TerrainHydrologySubsystem['erodeMountain']> {
    return this.terrainHydrology.erodeMountain(...args);
  }
  public weatherMountainSurface(
    ...args: Parameters<TerrainHydrologySubsystem['weatherMountainSurface']>
  ): ReturnType<TerrainHydrologySubsystem['weatherMountainSurface']> {
    return this.terrainHydrology.weatherMountainSurface(...args);
  }
  public fractureMountainRock(
    ...args: Parameters<TerrainHydrologySubsystem['fractureMountainRock']>
  ): ReturnType<TerrainHydrologySubsystem['fractureMountainRock']> {
    return this.terrainHydrology.fractureMountainRock(...args);
  }
  public triggerRockfall(
    ...args: Parameters<TerrainHydrologySubsystem['triggerRockfall']>
  ): ReturnType<TerrainHydrologySubsystem['triggerRockfall']> {
    return this.terrainHydrology.triggerRockfall(...args);
  }
  public triggerLandslide(
    ...args: Parameters<TerrainHydrologySubsystem['triggerLandslide']>
  ): ReturnType<TerrainHydrologySubsystem['triggerLandslide']> {
    return this.terrainHydrology.triggerLandslide(...args);
  }
  public collapseCliffSection(
    ...args: Parameters<TerrainHydrologySubsystem['collapseCliffSection']>
  ): ReturnType<TerrainHydrologySubsystem['collapseCliffSection']> {
    return this.terrainHydrology.collapseCliffSection(...args);
  }
  public generateTalusSlope(
    ...args: Parameters<TerrainHydrologySubsystem['generateTalusSlope']>
  ): ReturnType<TerrainHydrologySubsystem['generateTalusSlope']> {
    return this.terrainHydrology.generateTalusSlope(...args);
  }
  public depositMountainSediment(
    ...args: Parameters<TerrainHydrologySubsystem['depositMountainSediment']>
  ): ReturnType<TerrainHydrologySubsystem['depositMountainSediment']> {
    return this.terrainHydrology.depositMountainSediment(...args);
  }
  public carveRiverValley(
    ...args: Parameters<TerrainHydrologySubsystem['carveRiverValley']>
  ): ReturnType<TerrainHydrologySubsystem['carveRiverValley']> {
    return this.terrainHydrology.carveRiverValley(...args);
  }
  public accumulateSnowOnMountain(
    ...args: Parameters<TerrainHydrologySubsystem['accumulateSnowOnMountain']>
  ): ReturnType<TerrainHydrologySubsystem['accumulateSnowOnMountain']> {
    return this.terrainHydrology.accumulateSnowOnMountain(...args);
  }
  public meltMountainSnow(
    ...args: Parameters<TerrainHydrologySubsystem['meltMountainSnow']>
  ): ReturnType<TerrainHydrologySubsystem['meltMountainSnow']> {
    return this.terrainHydrology.meltMountainSnow(...args);
  }
  public calculateSlopeStability(
    ...args: Parameters<TerrainHydrologySubsystem['calculateSlopeStability']>
  ): ReturnType<TerrainHydrologySubsystem['calculateSlopeStability']> {
    return this.terrainHydrology.calculateSlopeStability(...args);
  }
  public updateMountainCollision(
    ...args: Parameters<TerrainHydrologySubsystem['updateMountainCollision']>
  ): ReturnType<TerrainHydrologySubsystem['updateMountainCollision']> {
    return this.terrainHydrology.updateMountainCollision(...args);
  }
  public createSoilPatch(
    ...args: Parameters<TerrainHydrologySubsystem['createSoilPatch']>
  ): ReturnType<TerrainHydrologySubsystem['createSoilPatch']> {
    return this.terrainHydrology.createSoilPatch(...args);
  }
  public initializeSoilProperties(
    ...args: Parameters<TerrainHydrologySubsystem['initializeSoilProperties']>
  ): ReturnType<TerrainHydrologySubsystem['initializeSoilProperties']> {
    return this.terrainHydrology.initializeSoilProperties(...args);
  }
  public compactSoil(
    ...args: Parameters<TerrainHydrologySubsystem['compactSoil']>
  ): ReturnType<TerrainHydrologySubsystem['compactSoil']> {
    return this.terrainHydrology.compactSoil(...args);
  }
  public loosenSoil(
    ...args: Parameters<TerrainHydrologySubsystem['loosenSoil']>
  ): ReturnType<TerrainHydrologySubsystem['loosenSoil']> {
    return this.terrainHydrology.loosenSoil(...args);
  }
  public deformSoilSurface(
    ...args: Parameters<TerrainHydrologySubsystem['deformSoilSurface']>
  ): ReturnType<TerrainHydrologySubsystem['deformSoilSurface']> {
    return this.terrainHydrology.deformSoilSurface(...args);
  }
  public createFootprint(
    ...args: Parameters<TerrainHydrologySubsystem['createFootprint']>
  ): ReturnType<TerrainHydrologySubsystem['createFootprint']> {
    return this.terrainHydrology.createFootprint(...args);
  }
  public eraseFootprint(
    ...args: Parameters<TerrainHydrologySubsystem['eraseFootprint']>
  ): ReturnType<TerrainHydrologySubsystem['eraseFootprint']> {
    return this.terrainHydrology.eraseFootprint(...args);
  }
  public displaceSoil(
    ...args: Parameters<TerrainHydrologySubsystem['displaceSoil']>
  ): ReturnType<TerrainHydrologySubsystem['displaceSoil']> {
    return this.terrainHydrology.displaceSoil(...args);
  }
  public excavateSoil(
    ...args: Parameters<TerrainHydrologySubsystem['excavateSoil']>
  ): ReturnType<TerrainHydrologySubsystem['excavateSoil']> {
    return this.terrainHydrology.excavateSoil(...args);
  }
  public fillExcavation(
    ...args: Parameters<TerrainHydrologySubsystem['fillExcavation']>
  ): ReturnType<TerrainHydrologySubsystem['fillExcavation']> {
    return this.terrainHydrology.fillExcavation(...args);
  }
  public erodeSoil(
    ...args: Parameters<TerrainHydrologySubsystem['erodeSoil']>
  ): ReturnType<TerrainHydrologySubsystem['erodeSoil']> {
    return this.terrainHydrology.erodeSoil(...args);
  }
  public depositSediment(
    ...args: Parameters<TerrainHydrologySubsystem['depositSediment']>
  ): ReturnType<TerrainHydrologySubsystem['depositSediment']> {
    return this.terrainHydrology.depositSediment(...args);
  }
  public liquefySoil(
    ...args: Parameters<TerrainHydrologySubsystem['liquefySoil']>
  ): ReturnType<TerrainHydrologySubsystem['liquefySoil']> {
    return this.terrainHydrology.liquefySoil(...args);
  }
  public dryMud(
    ...args: Parameters<TerrainHydrologySubsystem['dryMud']>
  ): ReturnType<TerrainHydrologySubsystem['dryMud']> {
    return this.terrainHydrology.dryMud(...args);
  }
  public crackDryMud(
    ...args: Parameters<TerrainHydrologySubsystem['crackDryMud']>
  ): ReturnType<TerrainHydrologySubsystem['crackDryMud']> {
    return this.terrainHydrology.crackDryMud(...args);
  }
  public splashMud(
    ...args: Parameters<TerrainHydrologySubsystem['splashMud']>
  ): ReturnType<TerrainHydrologySubsystem['splashMud']> {
    return this.terrainHydrology.splashMud(...args);
  }
  public simulateSandSliding(
    ...args: Parameters<TerrainHydrologySubsystem['simulateSandSliding']>
  ): ReturnType<TerrainHydrologySubsystem['simulateSandSliding']> {
    return this.terrainHydrology.simulateSandSliding(...args);
  }
  public formSandDune(
    ...args: Parameters<TerrainHydrologySubsystem['formSandDune']>
  ): ReturnType<TerrainHydrologySubsystem['formSandDune']> {
    return this.terrainHydrology.formSandDune(...args);
  }
  public reshapeSandDune(
    ...args: Parameters<TerrainHydrologySubsystem['reshapeSandDune']>
  ): ReturnType<TerrainHydrologySubsystem['reshapeSandDune']> {
    return this.terrainHydrology.reshapeSandDune(...args);
  }
  public updateTerrainSurface(
    ...args: Parameters<TerrainHydrologySubsystem['updateTerrainSurface']>
  ): ReturnType<TerrainHydrologySubsystem['updateTerrainSurface']> {
    return this.terrainHydrology.updateTerrainSurface(...args);
  }
  public createWaterBody(
    ...args: Parameters<TerrainHydrologySubsystem['createWaterBody']>
  ): ReturnType<TerrainHydrologySubsystem['createWaterBody']> {
    return this.terrainHydrology.createWaterBody(...args);
  }
  public initializeWaterSimulation(
    ...args: Parameters<TerrainHydrologySubsystem['initializeWaterSimulation']>
  ): ReturnType<TerrainHydrologySubsystem['initializeWaterSimulation']> {
    return this.terrainHydrology.initializeWaterSimulation(...args);
  }
  public updateWaterSimulation(
    ...args: Parameters<TerrainHydrologySubsystem['updateWaterSimulation']>
  ): ReturnType<TerrainHydrologySubsystem['updateWaterSimulation']> {
    return this.terrainHydrology.updateWaterSimulation(...args);
  }
  public calculateWaterFlow(
    ...args: Parameters<TerrainHydrologySubsystem['calculateWaterFlow']>
  ): ReturnType<TerrainHydrologySubsystem['calculateWaterFlow']> {
    return this.terrainHydrology.calculateWaterFlow(...args);
  }
  public updateWaterLevel(
    ...args: Parameters<TerrainHydrologySubsystem['updateWaterLevel']>
  ): ReturnType<TerrainHydrologySubsystem['updateWaterLevel']> {
    return this.terrainHydrology.updateWaterLevel(...args);
  }
  public simulateWaterCurrent(
    ...args: Parameters<TerrainHydrologySubsystem['simulateWaterCurrent']>
  ): ReturnType<TerrainHydrologySubsystem['simulateWaterCurrent']> {
    return this.terrainHydrology.simulateWaterCurrent(...args);
  }
  public generateWaterWaves(
    ...args: Parameters<TerrainHydrologySubsystem['generateWaterWaves']>
  ): ReturnType<TerrainHydrologySubsystem['generateWaterWaves']> {
    return this.terrainHydrology.generateWaterWaves(...args);
  }
  public propagateWaterWave(
    ...args: Parameters<TerrainHydrologySubsystem['propagateWaterWave']>
  ): ReturnType<TerrainHydrologySubsystem['propagateWaterWave']> {
    return this.terrainHydrology.propagateWaterWave(...args);
  }
  public reflectWaterWave(
    ...args: Parameters<TerrainHydrologySubsystem['reflectWaterWave']>
  ): ReturnType<TerrainHydrologySubsystem['reflectWaterWave']> {
    return this.terrainHydrology.reflectWaterWave(...args);
  }
  public createWaterRipple(
    ...args: Parameters<TerrainHydrologySubsystem['createWaterRipple']>
  ): ReturnType<TerrainHydrologySubsystem['createWaterRipple']> {
    return this.terrainHydrology.createWaterRipple(...args);
  }
  public createSplash(
    ...args: Parameters<TerrainHydrologySubsystem['createSplash']>
  ): ReturnType<TerrainHydrologySubsystem['createSplash']> {
    return this.terrainHydrology.createSplash(...args);
  }
  public simulateWaterDroplets(
    ...args: Parameters<TerrainHydrologySubsystem['simulateWaterDroplets']>
  ): ReturnType<TerrainHydrologySubsystem['simulateWaterDroplets']> {
    return this.terrainHydrology.simulateWaterDroplets(...args);
  }
  public simulateWaterfall(
    ...args: Parameters<TerrainHydrologySubsystem['simulateWaterfall']>
  ): ReturnType<TerrainHydrologySubsystem['simulateWaterfall']> {
    return this.terrainHydrology.simulateWaterfall(...args);
  }
  public simulateRiverFlow(
    ...args: Parameters<TerrainHydrologySubsystem['simulateRiverFlow']>
  ): ReturnType<TerrainHydrologySubsystem['simulateRiverFlow']> {
    return this.terrainHydrology.simulateRiverFlow(...args);
  }
  public simulateStreamFlow(
    ...args: Parameters<TerrainHydrologySubsystem['simulateStreamFlow']>
  ): ReturnType<TerrainHydrologySubsystem['simulateStreamFlow']> {
    return this.terrainHydrology.simulateStreamFlow(...args);
  }
  public simulateFlooding(
    ...args: Parameters<TerrainHydrologySubsystem['simulateFlooding']>
  ): ReturnType<TerrainHydrologySubsystem['simulateFlooding']> {
    return this.terrainHydrology.simulateFlooding(...args);
  }
  public erodeRiverbank(
    ...args: Parameters<TerrainHydrologySubsystem['erodeRiverbank']>
  ): ReturnType<TerrainHydrologySubsystem['erodeRiverbank']> {
    return this.terrainHydrology.erodeRiverbank(...args);
  }
  public depositRiverSediment(
    ...args: Parameters<TerrainHydrologySubsystem['depositRiverSediment']>
  ): ReturnType<TerrainHydrologySubsystem['depositRiverSediment']> {
    return this.terrainHydrology.depositRiverSediment(...args);
  }
  public freezeWaterSurface(
    ...args: Parameters<TerrainHydrologySubsystem['freezeWaterSurface']>
  ): ReturnType<TerrainHydrologySubsystem['freezeWaterSurface']> {
    return this.terrainHydrology.freezeWaterSurface(...args);
  }
  public meltWaterSurface(
    ...args: Parameters<TerrainHydrologySubsystem['meltWaterSurface']>
  ): ReturnType<TerrainHydrologySubsystem['meltWaterSurface']> {
    return this.terrainHydrology.meltWaterSurface(...args);
  }
  public createRainSystem(
    ...args: Parameters<WeatherAtmosphereSubsystem['createRainSystem']>
  ): ReturnType<WeatherAtmosphereSubsystem['createRainSystem']> {
    return this.weatherAtmosphere.createRainSystem(...args);
  }
  public spawnRaindrops(
    ...args: Parameters<WeatherAtmosphereSubsystem['spawnRaindrops']>
  ): ReturnType<WeatherAtmosphereSubsystem['spawnRaindrops']> {
    return this.weatherAtmosphere.spawnRaindrops(...args);
  }
  public updateRaindropMotion(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateRaindropMotion']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateRaindropMotion']> {
    return this.weatherAtmosphere.updateRaindropMotion(...args);
  }
  public applyWindToRaindrops(
    ...args: Parameters<WeatherAtmosphereSubsystem['applyWindToRaindrops']>
  ): ReturnType<WeatherAtmosphereSubsystem['applyWindToRaindrops']> {
    return this.weatherAtmosphere.applyWindToRaindrops(...args);
  }
  public createRainSplash(
    ...args: Parameters<WeatherAtmosphereSubsystem['createRainSplash']>
  ): ReturnType<WeatherAtmosphereSubsystem['createRainSplash']> {
    return this.weatherAtmosphere.createRainSplash(...args);
  }
  public accumulateRainwater(
    ...args: Parameters<WeatherAtmosphereSubsystem['accumulateRainwater']>
  ): ReturnType<WeatherAtmosphereSubsystem['accumulateRainwater']> {
    return this.weatherAtmosphere.accumulateRainwater(...args);
  }
  public createSnowfallSystem(
    ...args: Parameters<WeatherAtmosphereSubsystem['createSnowfallSystem']>
  ): ReturnType<WeatherAtmosphereSubsystem['createSnowfallSystem']> {
    return this.weatherAtmosphere.createSnowfallSystem(...args);
  }
  public spawnSnowflakes(
    ...args: Parameters<WeatherAtmosphereSubsystem['spawnSnowflakes']>
  ): ReturnType<WeatherAtmosphereSubsystem['spawnSnowflakes']> {
    return this.weatherAtmosphere.spawnSnowflakes(...args);
  }
  public updateSnowflakeMotion(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateSnowflakeMotion']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateSnowflakeMotion']> {
    return this.weatherAtmosphere.updateSnowflakeMotion(...args);
  }
  public accumulateSnow(
    ...args: Parameters<WeatherAtmosphereSubsystem['accumulateSnow']>
  ): ReturnType<WeatherAtmosphereSubsystem['accumulateSnow']> {
    return this.weatherAtmosphere.accumulateSnow(...args);
  }
  public compactSnow(
    ...args: Parameters<WeatherAtmosphereSubsystem['compactSnow']>
  ): ReturnType<WeatherAtmosphereSubsystem['compactSnow']> {
    return this.weatherAtmosphere.compactSnow(...args);
  }
  public meltSnow(
    ...args: Parameters<WeatherAtmosphereSubsystem['meltSnow']>
  ): ReturnType<WeatherAtmosphereSubsystem['meltSnow']> {
    return this.weatherAtmosphere.meltSnow(...args);
  }
  public createIcicle(
    ...args: Parameters<WeatherAtmosphereSubsystem['createIcicle']>
  ): ReturnType<WeatherAtmosphereSubsystem['createIcicle']> {
    return this.weatherAtmosphere.createIcicle(...args);
  }
  public growIcicle(
    ...args: Parameters<WeatherAtmosphereSubsystem['growIcicle']>
  ): ReturnType<WeatherAtmosphereSubsystem['growIcicle']> {
    return this.weatherAtmosphere.growIcicle(...args);
  }
  public breakIcicle(
    ...args: Parameters<WeatherAtmosphereSubsystem['breakIcicle']>
  ): ReturnType<WeatherAtmosphereSubsystem['breakIcicle']> {
    return this.weatherAtmosphere.breakIcicle(...args);
  }
  public freezeWetSurface(
    ...args: Parameters<WeatherAtmosphereSubsystem['freezeWetSurface']>
  ): ReturnType<WeatherAtmosphereSubsystem['freezeWetSurface']> {
    return this.weatherAtmosphere.freezeWetSurface(...args);
  }
  public thawFrozenSurface(
    ...args: Parameters<WeatherAtmosphereSubsystem['thawFrozenSurface']>
  ): ReturnType<WeatherAtmosphereSubsystem['thawFrozenSurface']> {
    return this.weatherAtmosphere.thawFrozenSurface(...args);
  }
  public createHailstone(
    ...args: Parameters<WeatherAtmosphereSubsystem['createHailstone']>
  ): ReturnType<WeatherAtmosphereSubsystem['createHailstone']> {
    return this.weatherAtmosphere.createHailstone(...args);
  }
  public spawnHailstorm(
    ...args: Parameters<WeatherAtmosphereSubsystem['spawnHailstorm']>
  ): ReturnType<WeatherAtmosphereSubsystem['spawnHailstorm']> {
    return this.weatherAtmosphere.spawnHailstorm(...args);
  }
  public simulateHailImpact(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateHailImpact']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateHailImpact']> {
    return this.weatherAtmosphere.simulateHailImpact(...args);
  }
  public createWindField(
    ...args: Parameters<WeatherAtmosphereSubsystem['createWindField']>
  ): ReturnType<WeatherAtmosphereSubsystem['createWindField']> {
    return this.weatherAtmosphere.createWindField(...args);
  }
  public updateWindField(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateWindField']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateWindField']> {
    return this.weatherAtmosphere.updateWindField(...args);
  }
  public setWindDirection(
    ...args: Parameters<WeatherAtmosphereSubsystem['setWindDirection']>
  ): ReturnType<WeatherAtmosphereSubsystem['setWindDirection']> {
    return this.weatherAtmosphere.setWindDirection(...args);
  }
  public setWindSpeed(
    ...args: Parameters<WeatherAtmosphereSubsystem['setWindSpeed']>
  ): ReturnType<WeatherAtmosphereSubsystem['setWindSpeed']> {
    return this.weatherAtmosphere.setWindSpeed(...args);
  }
  public simulateWindTurbulence(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateWindTurbulence']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateWindTurbulence']> {
    return this.weatherAtmosphere.simulateWindTurbulence(...args);
  }
  public simulateThermalUpdraft(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateThermalUpdraft']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateThermalUpdraft']> {
    return this.weatherAtmosphere.simulateThermalUpdraft(...args);
  }
  public simulateDowndraft(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateDowndraft']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateDowndraft']> {
    return this.weatherAtmosphere.simulateDowndraft(...args);
  }
  public simulateDustDevil(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateDustDevil']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateDustDevil']> {
    return this.weatherAtmosphere.simulateDustDevil(...args);
  }
  public simulateTornado(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateTornado']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateTornado']> {
    return this.weatherAtmosphere.simulateTornado(...args);
  }
  public applyWindToParticles(
    ...args: Parameters<WeatherAtmosphereSubsystem['applyWindToParticles']>
  ): ReturnType<WeatherAtmosphereSubsystem['applyWindToParticles']> {
    return this.weatherAtmosphere.applyWindToParticles(...args);
  }
  public applyWindToCloth(
    ...args: Parameters<WeatherAtmosphereSubsystem['applyWindToCloth']>
  ): ReturnType<WeatherAtmosphereSubsystem['applyWindToCloth']> {
    return this.weatherAtmosphere.applyWindToCloth(...args);
  }
  public applyWindToFlags(
    ...args: Parameters<WeatherAtmosphereSubsystem['applyWindToFlags']>
  ): ReturnType<WeatherAtmosphereSubsystem['applyWindToFlags']> {
    return this.weatherAtmosphere.applyWindToFlags(...args);
  }
  public applyWindToStructures(
    ...args: Parameters<WeatherAtmosphereSubsystem['applyWindToStructures']>
  ): ReturnType<WeatherAtmosphereSubsystem['applyWindToStructures']> {
    return this.weatherAtmosphere.applyWindToStructures(...args);
  }
  public calculateWindLoad(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateWindLoad']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateWindLoad']> {
    return this.weatherAtmosphere.calculateWindLoad(...args);
  }
  public updateAtmosphericPressure(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateAtmosphericPressure']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateAtmosphericPressure']> {
    return this.weatherAtmosphere.updateAtmosphericPressure(...args);
  }
  public createCloud(
    ...args: Parameters<WeatherAtmosphereSubsystem['createCloud']>
  ): ReturnType<WeatherAtmosphereSubsystem['createCloud']> {
    return this.weatherAtmosphere.createCloud(...args);
  }
  public generateCloudVolume(
    ...args: Parameters<WeatherAtmosphereSubsystem['generateCloudVolume']>
  ): ReturnType<WeatherAtmosphereSubsystem['generateCloudVolume']> {
    return this.weatherAtmosphere.generateCloudVolume(...args);
  }
  public updateCloudShape(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateCloudShape']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateCloudShape']> {
    return this.weatherAtmosphere.updateCloudShape(...args);
  }
  public moveCloudWithWind(
    ...args: Parameters<WeatherAtmosphereSubsystem['moveCloudWithWind']>
  ): ReturnType<WeatherAtmosphereSubsystem['moveCloudWithWind']> {
    return this.weatherAtmosphere.moveCloudWithWind(...args);
  }
  public mergeClouds(
    ...args: Parameters<WeatherAtmosphereSubsystem['mergeClouds']>
  ): ReturnType<WeatherAtmosphereSubsystem['mergeClouds']> {
    return this.weatherAtmosphere.mergeClouds(...args);
  }
  public separateClouds(
    ...args: Parameters<WeatherAtmosphereSubsystem['separateClouds']>
  ): ReturnType<WeatherAtmosphereSubsystem['separateClouds']> {
    return this.weatherAtmosphere.separateClouds(...args);
  }
  public dissipateCloud(
    ...args: Parameters<WeatherAtmosphereSubsystem['dissipateCloud']>
  ): ReturnType<WeatherAtmosphereSubsystem['dissipateCloud']> {
    return this.weatherAtmosphere.dissipateCloud(...args);
  }
  public condenseCloudVapor(
    ...args: Parameters<WeatherAtmosphereSubsystem['condenseCloudVapor']>
  ): ReturnType<WeatherAtmosphereSubsystem['condenseCloudVapor']> {
    return this.weatherAtmosphere.condenseCloudVapor(...args);
  }
  public simulateCumulusGrowth(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateCumulusGrowth']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateCumulusGrowth']> {
    return this.weatherAtmosphere.simulateCumulusGrowth(...args);
  }
  public simulateStormCloudGrowth(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateStormCloudGrowth']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateStormCloudGrowth']> {
    return this.weatherAtmosphere.simulateStormCloudGrowth(...args);
  }
  public createFogVolume(
    ...args: Parameters<WeatherAtmosphereSubsystem['createFogVolume']>
  ): ReturnType<WeatherAtmosphereSubsystem['createFogVolume']> {
    return this.weatherAtmosphere.createFogVolume(...args);
  }
  public spreadFog(
    ...args: Parameters<WeatherAtmosphereSubsystem['spreadFog']>
  ): ReturnType<WeatherAtmosphereSubsystem['spreadFog']> {
    return this.weatherAtmosphere.spreadFog(...args);
  }
  public dissipateFog(
    ...args: Parameters<WeatherAtmosphereSubsystem['dissipateFog']>
  ): ReturnType<WeatherAtmosphereSubsystem['dissipateFog']> {
    return this.weatherAtmosphere.dissipateFog(...args);
  }
  public simulateGroundFog(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateGroundFog']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateGroundFog']> {
    return this.weatherAtmosphere.simulateGroundFog(...args);
  }
  public simulateMistOverWater(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateMistOverWater']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateMistOverWater']> {
    return this.weatherAtmosphere.simulateMistOverWater(...args);
  }
  public simulateAtmosphericHaze(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateAtmosphericHaze']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateAtmosphericHaze']> {
    return this.weatherAtmosphere.simulateAtmosphericHaze(...args);
  }
  public createRainbow(
    ...args: Parameters<WeatherAtmosphereSubsystem['createRainbow']>
  ): ReturnType<WeatherAtmosphereSubsystem['createRainbow']> {
    return this.weatherAtmosphere.createRainbow(...args);
  }
  public updateRainbowVisibility(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateRainbowVisibility']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateRainbowVisibility']> {
    return this.weatherAtmosphere.updateRainbowVisibility(...args);
  }
  public simulateHeatShimmer(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateHeatShimmer']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateHeatShimmer']> {
    return this.weatherAtmosphere.simulateHeatShimmer(...args);
  }
  public updateSkyAtmosphere(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateSkyAtmosphere']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateSkyAtmosphere']> {
    return this.weatherAtmosphere.updateSkyAtmosphere(...args);
  }
  public createThunderstorm(
    ...args: Parameters<WeatherAtmosphereSubsystem['createThunderstorm']>
  ): ReturnType<WeatherAtmosphereSubsystem['createThunderstorm']> {
    return this.weatherAtmosphere.createThunderstorm(...args);
  }
  public accumulateStormEnergy(
    ...args: Parameters<WeatherAtmosphereSubsystem['accumulateStormEnergy']>
  ): ReturnType<WeatherAtmosphereSubsystem['accumulateStormEnergy']> {
    return this.weatherAtmosphere.accumulateStormEnergy(...args);
  }
  public generateLightningBolt(
    ...args: Parameters<WeatherAtmosphereSubsystem['generateLightningBolt']>
  ): ReturnType<WeatherAtmosphereSubsystem['generateLightningBolt']> {
    return this.weatherAtmosphere.generateLightningBolt(...args);
  }
  public branchLightningBolt(
    ...args: Parameters<WeatherAtmosphereSubsystem['branchLightningBolt']>
  ): ReturnType<WeatherAtmosphereSubsystem['branchLightningBolt']> {
    return this.weatherAtmosphere.branchLightningBolt(...args);
  }
  public illuminateSceneWithLightning(
    ...args: Parameters<WeatherAtmosphereSubsystem['illuminateSceneWithLightning']>
  ): ReturnType<WeatherAtmosphereSubsystem['illuminateSceneWithLightning']> {
    return this.weatherAtmosphere.illuminateSceneWithLightning(...args);
  }
  public createLightningFlash(
    ...args: Parameters<WeatherAtmosphereSubsystem['createLightningFlash']>
  ): ReturnType<WeatherAtmosphereSubsystem['createLightningFlash']> {
    return this.weatherAtmosphere.createLightningFlash(...args);
  }
  public calculateLightningStrikeTarget(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateLightningStrikeTarget']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateLightningStrikeTarget']> {
    return this.weatherAtmosphere.calculateLightningStrikeTarget(...args);
  }
  public strikeLightningTarget(
    ...args: Parameters<WeatherAtmosphereSubsystem['strikeLightningTarget']>
  ): ReturnType<WeatherAtmosphereSubsystem['strikeLightningTarget']> {
    return this.weatherAtmosphere.strikeLightningTarget(...args);
  }
  public applyLightningDamage(
    ...args: Parameters<WeatherAtmosphereSubsystem['applyLightningDamage']>
  ): ReturnType<WeatherAtmosphereSubsystem['applyLightningDamage']> {
    return this.weatherAtmosphere.applyLightningDamage(...args);
  }
  public createThunderSound(
    ...args: Parameters<WeatherAtmosphereSubsystem['createThunderSound']>
  ): ReturnType<WeatherAtmosphereSubsystem['createThunderSound']> {
    return this.weatherAtmosphere.createThunderSound(...args);
  }
  public propagateThunderWave(
    ...args: Parameters<WeatherAtmosphereSubsystem['propagateThunderWave']>
  ): ReturnType<WeatherAtmosphereSubsystem['propagateThunderWave']> {
    return this.weatherAtmosphere.propagateThunderWave(...args);
  }
  public createStormWind(
    ...args: Parameters<WeatherAtmosphereSubsystem['createStormWind']>
  ): ReturnType<WeatherAtmosphereSubsystem['createStormWind']> {
    return this.weatherAtmosphere.createStormWind(...args);
  }
  public generateStormRain(
    ...args: Parameters<WeatherAtmosphereSubsystem['generateStormRain']>
  ): ReturnType<WeatherAtmosphereSubsystem['generateStormRain']> {
    return this.weatherAtmosphere.generateStormRain(...args);
  }
  public spawnStormDebris(
    ...args: Parameters<WeatherAtmosphereSubsystem['spawnStormDebris']>
  ): ReturnType<WeatherAtmosphereSubsystem['spawnStormDebris']> {
    return this.weatherAtmosphere.spawnStormDebris(...args);
  }
  public simulateStormSurge(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateStormSurge']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateStormSurge']> {
    return this.weatherAtmosphere.simulateStormSurge(...args);
  }
  public calculateStormDamage(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateStormDamage']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateStormDamage']> {
    return this.weatherAtmosphere.calculateStormDamage(...args);
  }
  public dissipateThunderstorm(
    ...args: Parameters<WeatherAtmosphereSubsystem['dissipateThunderstorm']>
  ): ReturnType<WeatherAtmosphereSubsystem['dissipateThunderstorm']> {
    return this.weatherAtmosphere.dissipateThunderstorm(...args);
  }
  public simulateHurricane(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateHurricane']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateHurricane']> {
    return this.weatherAtmosphere.simulateHurricane(...args);
  }
  public simulateCyclone(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateCyclone']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateCyclone']> {
    return this.weatherAtmosphere.simulateCyclone(...args);
  }
  public updateStormRecovery(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateStormRecovery']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateStormRecovery']> {
    return this.weatherAtmosphere.updateStormRecovery(...args);
  }
  public createFire(
    ...args: Parameters<WeatherAtmosphereSubsystem['createFire']>
  ): ReturnType<WeatherAtmosphereSubsystem['createFire']> {
    return this.weatherAtmosphere.createFire(...args);
  }
  public igniteObject(
    ...args: Parameters<WeatherAtmosphereSubsystem['igniteObject']>
  ): ReturnType<WeatherAtmosphereSubsystem['igniteObject']> {
    return this.weatherAtmosphere.igniteObject(...args);
  }
  public extinguishFire(
    ...args: Parameters<WeatherAtmosphereSubsystem['extinguishFire']>
  ): ReturnType<WeatherAtmosphereSubsystem['extinguishFire']> {
    return this.weatherAtmosphere.extinguishFire(...args);
  }
  public spreadFire(
    ...args: Parameters<WeatherAtmosphereSubsystem['spreadFire']>
  ): ReturnType<WeatherAtmosphereSubsystem['spreadFire']> {
    return this.weatherAtmosphere.spreadFire(...args);
  }
  public calculateCombustionRate(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateCombustionRate']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateCombustionRate']> {
    return this.weatherAtmosphere.calculateCombustionRate(...args);
  }
  public calculateFireTemperature(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateFireTemperature']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateFireTemperature']> {
    return this.weatherAtmosphere.calculateFireTemperature(...args);
  }
  public updateFlameShape(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateFlameShape']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateFlameShape']> {
    return this.weatherAtmosphere.updateFlameShape(...args);
  }
  public spawnFireParticles(
    ...args: Parameters<WeatherAtmosphereSubsystem['spawnFireParticles']>
  ): ReturnType<WeatherAtmosphereSubsystem['spawnFireParticles']> {
    return this.weatherAtmosphere.spawnFireParticles(...args);
  }
  public generateSmoke(
    ...args: Parameters<WeatherAtmosphereSubsystem['generateSmoke']>
  ): ReturnType<WeatherAtmosphereSubsystem['generateSmoke']> {
    return this.weatherAtmosphere.generateSmoke(...args);
  }
  public spreadSmoke(
    ...args: Parameters<WeatherAtmosphereSubsystem['spreadSmoke']>
  ): ReturnType<WeatherAtmosphereSubsystem['spreadSmoke']> {
    return this.weatherAtmosphere.spreadSmoke(...args);
  }
  public dissipateSmoke(
    ...args: Parameters<WeatherAtmosphereSubsystem['dissipateSmoke']>
  ): ReturnType<WeatherAtmosphereSubsystem['dissipateSmoke']> {
    return this.weatherAtmosphere.dissipateSmoke(...args);
  }
  public createEmber(
    ...args: Parameters<WeatherAtmosphereSubsystem['createEmber']>
  ): ReturnType<WeatherAtmosphereSubsystem['createEmber']> {
    return this.weatherAtmosphere.createEmber(...args);
  }
  public scatterEmbers(
    ...args: Parameters<WeatherAtmosphereSubsystem['scatterEmbers']>
  ): ReturnType<WeatherAtmosphereSubsystem['scatterEmbers']> {
    return this.weatherAtmosphere.scatterEmbers(...args);
  }
  public igniteDryVegetation(
    ...args: Parameters<WeatherAtmosphereSubsystem['igniteDryVegetation']>
  ): ReturnType<WeatherAtmosphereSubsystem['igniteDryVegetation']> {
    return this.weatherAtmosphere.igniteDryVegetation(...args);
  }
  public charObjectSurface(
    ...args: Parameters<WeatherAtmosphereSubsystem['charObjectSurface']>
  ): ReturnType<WeatherAtmosphereSubsystem['charObjectSurface']> {
    return this.weatherAtmosphere.charObjectSurface(...args);
  }
  public burnObjectMaterial(
    ...args: Parameters<WeatherAtmosphereSubsystem['burnObjectMaterial']>
  ): ReturnType<WeatherAtmosphereSubsystem['burnObjectMaterial']> {
    return this.weatherAtmosphere.burnObjectMaterial(...args);
  }
  public deformObjectByHeat(
    ...args: Parameters<WeatherAtmosphereSubsystem['deformObjectByHeat']>
  ): ReturnType<WeatherAtmosphereSubsystem['deformObjectByHeat']> {
    return this.weatherAtmosphere.deformObjectByHeat(...args);
  }
  public meltObjectMaterial(
    ...args: Parameters<WeatherAtmosphereSubsystem['meltObjectMaterial']>
  ): ReturnType<WeatherAtmosphereSubsystem['meltObjectMaterial']> {
    return this.weatherAtmosphere.meltObjectMaterial(...args);
  }
  public coolBurningObject(
    ...args: Parameters<WeatherAtmosphereSubsystem['coolBurningObject']>
  ): ReturnType<WeatherAtmosphereSubsystem['coolBurningObject']> {
    return this.weatherAtmosphere.coolBurningObject(...args);
  }
  public calculateFireDamage(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateFireDamage']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateFireDamage']> {
    return this.weatherAtmosphere.calculateFireDamage(...args);
  }
  public createRockfall(
    ...args: Parameters<WeatherAtmosphereSubsystem['createRockfall']>
  ): ReturnType<WeatherAtmosphereSubsystem['createRockfall']> {
    return this.weatherAtmosphere.createRockfall(...args);
  }
  public releaseRockFromSlope(
    ...args: Parameters<WeatherAtmosphereSubsystem['releaseRockFromSlope']>
  ): ReturnType<WeatherAtmosphereSubsystem['releaseRockFromSlope']> {
    return this.weatherAtmosphere.releaseRockFromSlope(...args);
  }
  public calculateRockfallTrajectory(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateRockfallTrajectory']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateRockfallTrajectory']> {
    return this.weatherAtmosphere.calculateRockfallTrajectory(...args);
  }
  public simulateRockBouncing(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateRockBouncing']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateRockBouncing']> {
    return this.weatherAtmosphere.simulateRockBouncing(...args);
  }
  public simulateRockRolling(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateRockRolling']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateRockRolling']> {
    return this.weatherAtmosphere.simulateRockRolling(...args);
  }
  public simulateRockFragmentation(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateRockFragmentation']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateRockFragmentation']> {
    return this.weatherAtmosphere.simulateRockFragmentation(...args);
  }
  public createLandslide(
    ...args: Parameters<WeatherAtmosphereSubsystem['createLandslide']>
  ): ReturnType<WeatherAtmosphereSubsystem['createLandslide']> {
    return this.weatherAtmosphere.createLandslide(...args);
  }
  public calculateSlopeFailure(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateSlopeFailure']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateSlopeFailure']> {
    return this.weatherAtmosphere.calculateSlopeFailure(...args);
  }
  public displaceLandslideSoil(
    ...args: Parameters<WeatherAtmosphereSubsystem['displaceLandslideSoil']>
  ): ReturnType<WeatherAtmosphereSubsystem['displaceLandslideSoil']> {
    return this.weatherAtmosphere.displaceLandslideSoil(...args);
  }
  public simulateDebrisFlow(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateDebrisFlow']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateDebrisFlow']> {
    return this.weatherAtmosphere.simulateDebrisFlow(...args);
  }
  public depositLandslideDebris(
    ...args: Parameters<WeatherAtmosphereSubsystem['depositLandslideDebris']>
  ): ReturnType<WeatherAtmosphereSubsystem['depositLandslideDebris']> {
    return this.weatherAtmosphere.depositLandslideDebris(...args);
  }
  public createAvalanche(
    ...args: Parameters<WeatherAtmosphereSubsystem['createAvalanche']>
  ): ReturnType<WeatherAtmosphereSubsystem['createAvalanche']> {
    return this.weatherAtmosphere.createAvalanche(...args);
  }
  public triggerSnowSlabFailure(
    ...args: Parameters<WeatherAtmosphereSubsystem['triggerSnowSlabFailure']>
  ): ReturnType<WeatherAtmosphereSubsystem['triggerSnowSlabFailure']> {
    return this.weatherAtmosphere.triggerSnowSlabFailure(...args);
  }
  public simulateAvalancheMotion(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateAvalancheMotion']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateAvalancheMotion']> {
    return this.weatherAtmosphere.simulateAvalancheMotion(...args);
  }
  public simulateAvalancheDebris(
    ...args: Parameters<WeatherAtmosphereSubsystem['simulateAvalancheDebris']>
  ): ReturnType<WeatherAtmosphereSubsystem['simulateAvalancheDebris']> {
    return this.weatherAtmosphere.simulateAvalancheDebris(...args);
  }
  public buryObjectsInDebris(
    ...args: Parameters<WeatherAtmosphereSubsystem['buryObjectsInDebris']>
  ): ReturnType<WeatherAtmosphereSubsystem['buryObjectsInDebris']> {
    return this.weatherAtmosphere.buryObjectsInDebris(...args);
  }
  public calculateBurialDepth(
    ...args: Parameters<WeatherAtmosphereSubsystem['calculateBurialDepth']>
  ): ReturnType<WeatherAtmosphereSubsystem['calculateBurialDepth']> {
    return this.weatherAtmosphere.calculateBurialDepth(...args);
  }
  public stabilizeDamagedSlope(
    ...args: Parameters<WeatherAtmosphereSubsystem['stabilizeDamagedSlope']>
  ): ReturnType<WeatherAtmosphereSubsystem['stabilizeDamagedSlope']> {
    return this.weatherAtmosphere.stabilizeDamagedSlope(...args);
  }
  public erodeUnstableSlope(
    ...args: Parameters<WeatherAtmosphereSubsystem['erodeUnstableSlope']>
  ): ReturnType<WeatherAtmosphereSubsystem['erodeUnstableSlope']> {
    return this.weatherAtmosphere.erodeUnstableSlope(...args);
  }
  public updateSlopeAfterFailure(
    ...args: Parameters<WeatherAtmosphereSubsystem['updateSlopeAfterFailure']>
  ): ReturnType<WeatherAtmosphereSubsystem['updateSlopeAfterFailure']> {
    return this.weatherAtmosphere.updateSlopeAfterFailure(...args);
  }
  public createBuilding(
    ...args: Parameters<BuildingArchitectureSubsystem['createBuilding']>
  ): ReturnType<BuildingArchitectureSubsystem['createBuilding']> {
    return this.buildingArchitecture.createBuilding(...args);
  }
  public initializeBuilding(
    ...args: Parameters<BuildingArchitectureSubsystem['initializeBuilding']>
  ): ReturnType<BuildingArchitectureSubsystem['initializeBuilding']> {
    return this.buildingArchitecture.initializeBuilding(...args);
  }
  public generateBuildingGeometry(
    ...args: Parameters<BuildingArchitectureSubsystem['generateBuildingGeometry']>
  ): ReturnType<BuildingArchitectureSubsystem['generateBuildingGeometry']> {
    return this.buildingArchitecture.generateBuildingGeometry(...args);
  }
  public generateBuildingFoundation(
    ...args: Parameters<BuildingArchitectureSubsystem['generateBuildingFoundation']>
  ): ReturnType<BuildingArchitectureSubsystem['generateBuildingFoundation']> {
    return this.buildingArchitecture.generateBuildingFoundation(...args);
  }
  public generateBuildingWalls(
    ...args: Parameters<BuildingArchitectureSubsystem['generateBuildingWalls']>
  ): ReturnType<BuildingArchitectureSubsystem['generateBuildingWalls']> {
    return this.buildingArchitecture.generateBuildingWalls(...args);
  }
  public generateBuildingRoof(
    ...args: Parameters<BuildingArchitectureSubsystem['generateBuildingRoof']>
  ): ReturnType<BuildingArchitectureSubsystem['generateBuildingRoof']> {
    return this.buildingArchitecture.generateBuildingRoof(...args);
  }
  public generateBuildingFloors(
    ...args: Parameters<BuildingArchitectureSubsystem['generateBuildingFloors']>
  ): ReturnType<BuildingArchitectureSubsystem['generateBuildingFloors']> {
    return this.buildingArchitecture.generateBuildingFloors(...args);
  }
  public generateBuildingColumns(
    ...args: Parameters<BuildingArchitectureSubsystem['generateBuildingColumns']>
  ): ReturnType<BuildingArchitectureSubsystem['generateBuildingColumns']> {
    return this.buildingArchitecture.generateBuildingColumns(...args);
  }
  public generateBuildingBeams(
    ...args: Parameters<BuildingArchitectureSubsystem['generateBuildingBeams']>
  ): ReturnType<BuildingArchitectureSubsystem['generateBuildingBeams']> {
    return this.buildingArchitecture.generateBuildingBeams(...args);
  }
  public connectStructuralElements(
    ...args: Parameters<BuildingArchitectureSubsystem['connectStructuralElements']>
  ): ReturnType<BuildingArchitectureSubsystem['connectStructuralElements']> {
    return this.buildingArchitecture.connectStructuralElements(...args);
  }
  public calculateBuildingMass(
    ...args: Parameters<BuildingArchitectureSubsystem['calculateBuildingMass']>
  ): ReturnType<BuildingArchitectureSubsystem['calculateBuildingMass']> {
    return this.buildingArchitecture.calculateBuildingMass(...args);
  }
  public calculateBuildingCenterOfMass(
    ...args: Parameters<BuildingArchitectureSubsystem['calculateBuildingCenterOfMass']>
  ): ReturnType<BuildingArchitectureSubsystem['calculateBuildingCenterOfMass']> {
    return this.buildingArchitecture.calculateBuildingCenterOfMass(...args);
  }
  public calculateStructuralStress(
    ...args: Parameters<BuildingArchitectureSubsystem['calculateStructuralStress']>
  ): ReturnType<BuildingArchitectureSubsystem['calculateStructuralStress']> {
    return this.buildingArchitecture.calculateStructuralStress(...args);
  }
  public calculateStructuralLoad(
    ...args: Parameters<BuildingArchitectureSubsystem['calculateStructuralLoad']>
  ): ReturnType<BuildingArchitectureSubsystem['calculateStructuralLoad']> {
    return this.buildingArchitecture.calculateStructuralLoad(...args);
  }
  public detectStructuralWeakness(
    ...args: Parameters<BuildingArchitectureSubsystem['detectStructuralWeakness']>
  ): ReturnType<BuildingArchitectureSubsystem['detectStructuralWeakness']> {
    return this.buildingArchitecture.detectStructuralWeakness(...args);
  }
  public updateBuildingCondition(
    ...args: Parameters<BuildingArchitectureSubsystem['updateBuildingCondition']>
  ): ReturnType<BuildingArchitectureSubsystem['updateBuildingCondition']> {
    return this.buildingArchitecture.updateBuildingCondition(...args);
  }
  public repairBuildingDamage(
    ...args: Parameters<BuildingArchitectureSubsystem['repairBuildingDamage']>
  ): ReturnType<BuildingArchitectureSubsystem['repairBuildingDamage']> {
    return this.buildingArchitecture.repairBuildingDamage(...args);
  }
  public renovateBuilding(
    ...args: Parameters<BuildingArchitectureSubsystem['renovateBuilding']>
  ): ReturnType<BuildingArchitectureSubsystem['renovateBuilding']> {
    return this.buildingArchitecture.renovateBuilding(...args);
  }
  public demolishBuilding(
    ...args: Parameters<BuildingArchitectureSubsystem['demolishBuilding']>
  ): ReturnType<BuildingArchitectureSubsystem['demolishBuilding']> {
    return this.buildingArchitecture.demolishBuilding(...args);
  }
  public regenerateBuildingCollision(
    ...args: Parameters<BuildingArchitectureSubsystem['regenerateBuildingCollision']>
  ): ReturnType<BuildingArchitectureSubsystem['regenerateBuildingCollision']> {
    return this.buildingArchitecture.regenerateBuildingCollision(...args);
  }
  public createWall(
    ...args: Parameters<BuildingArchitectureSubsystem['createWall']>
  ): ReturnType<BuildingArchitectureSubsystem['createWall']> {
    return this.buildingArchitecture.createWall(...args);
  }
  public crackWall(
    ...args: Parameters<BuildingArchitectureSubsystem['crackWall']>
  ): ReturnType<BuildingArchitectureSubsystem['crackWall']> {
    return this.buildingArchitecture.crackWall(...args);
  }
  public chipWallSurface(
    ...args: Parameters<BuildingArchitectureSubsystem['chipWallSurface']>
  ): ReturnType<BuildingArchitectureSubsystem['chipWallSurface']> {
    return this.buildingArchitecture.chipWallSurface(...args);
  }
  public breakWall(
    ...args: Parameters<BuildingArchitectureSubsystem['breakWall']>
  ): ReturnType<BuildingArchitectureSubsystem['breakWall']> {
    return this.buildingArchitecture.breakWall(...args);
  }
  public collapseWallSection(
    ...args: Parameters<BuildingArchitectureSubsystem['collapseWallSection']>
  ): ReturnType<BuildingArchitectureSubsystem['collapseWallSection']> {
    return this.buildingArchitecture.collapseWallSection(...args);
  }
  public createRoof(
    ...args: Parameters<BuildingArchitectureSubsystem['createRoof']>
  ): ReturnType<BuildingArchitectureSubsystem['createRoof']> {
    return this.buildingArchitecture.createRoof(...args);
  }
  public bendRoof(
    ...args: Parameters<BuildingArchitectureSubsystem['bendRoof']>
  ): ReturnType<BuildingArchitectureSubsystem['bendRoof']> {
    return this.buildingArchitecture.bendRoof(...args);
  }
  public crackRoof(
    ...args: Parameters<BuildingArchitectureSubsystem['crackRoof']>
  ): ReturnType<BuildingArchitectureSubsystem['crackRoof']> {
    return this.buildingArchitecture.crackRoof(...args);
  }
  public detachRoofPanel(
    ...args: Parameters<BuildingArchitectureSubsystem['detachRoofPanel']>
  ): ReturnType<BuildingArchitectureSubsystem['detachRoofPanel']> {
    return this.buildingArchitecture.detachRoofPanel(...args);
  }
  public collapseRoof(
    ...args: Parameters<BuildingArchitectureSubsystem['collapseRoof']>
  ): ReturnType<BuildingArchitectureSubsystem['collapseRoof']> {
    return this.buildingArchitecture.collapseRoof(...args);
  }
  public createDoor(
    ...args: Parameters<BuildingArchitectureSubsystem['createDoor']>
  ): ReturnType<BuildingArchitectureSubsystem['createDoor']> {
    return this.buildingArchitecture.createDoor(...args);
  }
  public openDoor(
    ...args: Parameters<BuildingArchitectureSubsystem['openDoor']>
  ): ReturnType<BuildingArchitectureSubsystem['openDoor']> {
    return this.buildingArchitecture.openDoor(...args);
  }
  public closeDoor(
    ...args: Parameters<BuildingArchitectureSubsystem['closeDoor']>
  ): ReturnType<BuildingArchitectureSubsystem['closeDoor']> {
    return this.buildingArchitecture.closeDoor(...args);
  }
  public breakDoor(
    ...args: Parameters<BuildingArchitectureSubsystem['breakDoor']>
  ): ReturnType<BuildingArchitectureSubsystem['breakDoor']> {
    return this.buildingArchitecture.breakDoor(...args);
  }
  public detachDoorFromFrame(
    ...args: Parameters<BuildingArchitectureSubsystem['detachDoorFromFrame']>
  ): ReturnType<BuildingArchitectureSubsystem['detachDoorFromFrame']> {
    return this.buildingArchitecture.detachDoorFromFrame(...args);
  }
  public createWindow(
    ...args: Parameters<BuildingArchitectureSubsystem['createWindow']>
  ): ReturnType<BuildingArchitectureSubsystem['createWindow']> {
    return this.buildingArchitecture.createWindow(...args);
  }
  public crackWindowGlass(
    ...args: Parameters<BuildingArchitectureSubsystem['crackWindowGlass']>
  ): ReturnType<BuildingArchitectureSubsystem['crackWindowGlass']> {
    return this.buildingArchitecture.crackWindowGlass(...args);
  }
  public shatterWindowGlass(
    ...args: Parameters<BuildingArchitectureSubsystem['shatterWindowGlass']>
  ): ReturnType<BuildingArchitectureSubsystem['shatterWindowGlass']> {
    return this.buildingArchitecture.shatterWindowGlass(...args);
  }
  public scatterGlassFragments(
    ...args: Parameters<BuildingArchitectureSubsystem['scatterGlassFragments']>
  ): ReturnType<BuildingArchitectureSubsystem['scatterGlassFragments']> {
    return this.buildingArchitecture.scatterGlassFragments(...args);
  }
  public repairWindow(
    ...args: Parameters<BuildingArchitectureSubsystem['repairWindow']>
  ): ReturnType<BuildingArchitectureSubsystem['repairWindow']> {
    return this.buildingArchitecture.repairWindow(...args);
  }
  public initiateStructuralCollapse(
    ...args: Parameters<BuildingArchitectureSubsystem['initiateStructuralCollapse']>
  ): ReturnType<BuildingArchitectureSubsystem['initiateStructuralCollapse']> {
    return this.buildingArchitecture.initiateStructuralCollapse(...args);
  }
  public calculateCollapseSequence(
    ...args: Parameters<BuildingArchitectureSubsystem['calculateCollapseSequence']>
  ): ReturnType<BuildingArchitectureSubsystem['calculateCollapseSequence']> {
    return this.buildingArchitecture.calculateCollapseSequence(...args);
  }
  public weakenStructuralSupport(
    ...args: Parameters<BuildingArchitectureSubsystem['weakenStructuralSupport']>
  ): ReturnType<BuildingArchitectureSubsystem['weakenStructuralSupport']> {
    return this.buildingArchitecture.weakenStructuralSupport(...args);
  }
  public removeStructuralSupport(
    ...args: Parameters<BuildingArchitectureSubsystem['removeStructuralSupport']>
  ): ReturnType<BuildingArchitectureSubsystem['removeStructuralSupport']> {
    return this.buildingArchitecture.removeStructuralSupport(...args);
  }
  public fractureStructuralJoint(
    ...args: Parameters<BuildingArchitectureSubsystem['fractureStructuralJoint']>
  ): ReturnType<BuildingArchitectureSubsystem['fractureStructuralJoint']> {
    return this.buildingArchitecture.fractureStructuralJoint(...args);
  }
  public breakStructuralBeam(
    ...args: Parameters<BuildingArchitectureSubsystem['breakStructuralBeam']>
  ): ReturnType<BuildingArchitectureSubsystem['breakStructuralBeam']> {
    return this.buildingArchitecture.breakStructuralBeam(...args);
  }
  public buckleStructuralColumn(
    ...args: Parameters<BuildingArchitectureSubsystem['buckleStructuralColumn']>
  ): ReturnType<BuildingArchitectureSubsystem['buckleStructuralColumn']> {
    return this.buildingArchitecture.buckleStructuralColumn(...args);
  }
  public triggerProgressiveCollapse(
    ...args: Parameters<BuildingArchitectureSubsystem['triggerProgressiveCollapse']>
  ): ReturnType<BuildingArchitectureSubsystem['triggerProgressiveCollapse']> {
    return this.buildingArchitecture.triggerProgressiveCollapse(...args);
  }
  public simulateFloorCollapse(
    ...args: Parameters<BuildingArchitectureSubsystem['simulateFloorCollapse']>
  ): ReturnType<BuildingArchitectureSubsystem['simulateFloorCollapse']> {
    return this.buildingArchitecture.simulateFloorCollapse(...args);
  }
  public simulateRoofCollapse(
    ...args: Parameters<BuildingArchitectureSubsystem['simulateRoofCollapse']>
  ): ReturnType<BuildingArchitectureSubsystem['simulateRoofCollapse']> {
    return this.buildingArchitecture.simulateRoofCollapse(...args);
  }
  public detachStructuralDebris(
    ...args: Parameters<BuildingArchitectureSubsystem['detachStructuralDebris']>
  ): ReturnType<BuildingArchitectureSubsystem['detachStructuralDebris']> {
    return this.buildingArchitecture.detachStructuralDebris(...args);
  }
  public spawnBuildingFragments(
    ...args: Parameters<BuildingArchitectureSubsystem['spawnBuildingFragments']>
  ): ReturnType<BuildingArchitectureSubsystem['spawnBuildingFragments']> {
    return this.buildingArchitecture.spawnBuildingFragments(...args);
  }
  public applyImpulseToDebris(
    ...args: Parameters<BuildingArchitectureSubsystem['applyImpulseToDebris']>
  ): ReturnType<BuildingArchitectureSubsystem['applyImpulseToDebris']> {
    return this.buildingArchitecture.applyImpulseToDebris(...args);
  }
  public simulateDebrisCollision(
    ...args: Parameters<BuildingArchitectureSubsystem['simulateDebrisCollision']>
  ): ReturnType<BuildingArchitectureSubsystem['simulateDebrisCollision']> {
    return this.buildingArchitecture.simulateDebrisCollision(...args);
  }
  public simulateDebrisPile(
    ...args: Parameters<BuildingArchitectureSubsystem['simulateDebrisPile']>
  ): ReturnType<BuildingArchitectureSubsystem['simulateDebrisPile']> {
    return this.buildingArchitecture.simulateDebrisPile(...args);
  }
  public settleDebrisPile(
    ...args: Parameters<BuildingArchitectureSubsystem['settleDebrisPile']>
  ): ReturnType<BuildingArchitectureSubsystem['settleDebrisPile']> {
    return this.buildingArchitecture.settleDebrisPile(...args);
  }
  public generateDustCloud(
    ...args: Parameters<BuildingArchitectureSubsystem['generateDustCloud']>
  ): ReturnType<BuildingArchitectureSubsystem['generateDustCloud']> {
    return this.buildingArchitecture.generateDustCloud(...args);
  }
  public dissipateCollapseDust(
    ...args: Parameters<BuildingArchitectureSubsystem['dissipateCollapseDust']>
  ): ReturnType<BuildingArchitectureSubsystem['dissipateCollapseDust']> {
    return this.buildingArchitecture.dissipateCollapseDust(...args);
  }
  public updateCollapsedBuilding(
    ...args: Parameters<BuildingArchitectureSubsystem['updateCollapsedBuilding']>
  ): ReturnType<BuildingArchitectureSubsystem['updateCollapsedBuilding']> {
    return this.buildingArchitecture.updateCollapsedBuilding(...args);
  }
  public clearBuildingDebris(
    ...args: Parameters<BuildingArchitectureSubsystem['clearBuildingDebris']>
  ): ReturnType<BuildingArchitectureSubsystem['clearBuildingDebris']> {
    return this.buildingArchitecture.clearBuildingDebris(...args);
  }
  public createFurniture(
    ...args: Parameters<BuildingArchitectureSubsystem['createFurniture']>
  ): ReturnType<BuildingArchitectureSubsystem['createFurniture']> {
    return this.buildingArchitecture.createFurniture(...args);
  }
  public moveFurniture(
    ...args: Parameters<BuildingArchitectureSubsystem['moveFurniture']>
  ): ReturnType<BuildingArchitectureSubsystem['moveFurniture']> {
    return this.buildingArchitecture.moveFurniture(...args);
  }
  public rotateFurniture(
    ...args: Parameters<BuildingArchitectureSubsystem['rotateFurniture']>
  ): ReturnType<BuildingArchitectureSubsystem['rotateFurniture']> {
    return this.buildingArchitecture.rotateFurniture(...args);
  }
  public slideFurniture(
    ...args: Parameters<BuildingArchitectureSubsystem['slideFurniture']>
  ): ReturnType<BuildingArchitectureSubsystem['slideFurniture']> {
    return this.buildingArchitecture.slideFurniture(...args);
  }
  public toppleChair(
    ...args: Parameters<BuildingArchitectureSubsystem['toppleChair']>
  ): ReturnType<BuildingArchitectureSubsystem['toppleChair']> {
    return this.buildingArchitecture.toppleChair(...args);
  }
  public pullChair(
    ...args: Parameters<BuildingArchitectureSubsystem['pullChair']>
  ): ReturnType<BuildingArchitectureSubsystem['pullChair']> {
    return this.buildingArchitecture.pullChair(...args);
  }
  public pushTable(
    ...args: Parameters<BuildingArchitectureSubsystem['pushTable']>
  ): ReturnType<BuildingArchitectureSubsystem['pushTable']> {
    return this.buildingArchitecture.pushTable(...args);
  }
  public overturnTable(
    ...args: Parameters<BuildingArchitectureSubsystem['overturnTable']>
  ): ReturnType<BuildingArchitectureSubsystem['overturnTable']> {
    return this.buildingArchitecture.overturnTable(...args);
  }
  public openDrawer(
    ...args: Parameters<BuildingArchitectureSubsystem['openDrawer']>
  ): ReturnType<BuildingArchitectureSubsystem['openDrawer']> {
    return this.buildingArchitecture.openDrawer(...args);
  }
  public closeDrawer(
    ...args: Parameters<BuildingArchitectureSubsystem['closeDrawer']>
  ): ReturnType<BuildingArchitectureSubsystem['closeDrawer']> {
    return this.buildingArchitecture.closeDrawer(...args);
  }
  public openCabinet(
    ...args: Parameters<BuildingArchitectureSubsystem['openCabinet']>
  ): ReturnType<BuildingArchitectureSubsystem['openCabinet']> {
    return this.buildingArchitecture.openCabinet(...args);
  }
  public closeCabinet(
    ...args: Parameters<BuildingArchitectureSubsystem['closeCabinet']>
  ): ReturnType<BuildingArchitectureSubsystem['closeCabinet']> {
    return this.buildingArchitecture.closeCabinet(...args);
  }
  public breakFurnitureJoint(
    ...args: Parameters<BuildingArchitectureSubsystem['breakFurnitureJoint']>
  ): ReturnType<BuildingArchitectureSubsystem['breakFurnitureJoint']> {
    return this.buildingArchitecture.breakFurnitureJoint(...args);
  }
  public splitWoodenFurniture(
    ...args: Parameters<BuildingArchitectureSubsystem['splitWoodenFurniture']>
  ): ReturnType<BuildingArchitectureSubsystem['splitWoodenFurniture']> {
    return this.buildingArchitecture.splitWoodenFurniture(...args);
  }
  public shatterCeramicObject(
    ...args: Parameters<BuildingArchitectureSubsystem['shatterCeramicObject']>
  ): ReturnType<BuildingArchitectureSubsystem['shatterCeramicObject']> {
    return this.buildingArchitecture.shatterCeramicObject(...args);
  }
  public breakGlassObject(
    ...args: Parameters<BuildingArchitectureSubsystem['breakGlassObject']>
  ): ReturnType<BuildingArchitectureSubsystem['breakGlassObject']> {
    return this.buildingArchitecture.breakGlassObject(...args);
  }
  public deformMetalObject(
    ...args: Parameters<BuildingArchitectureSubsystem['deformMetalObject']>
  ): ReturnType<BuildingArchitectureSubsystem['deformMetalObject']> {
    return this.buildingArchitecture.deformMetalObject(...args);
  }
  public tearFabricObject(
    ...args: Parameters<BuildingArchitectureSubsystem['tearFabricObject']>
  ): ReturnType<BuildingArchitectureSubsystem['tearFabricObject']> {
    return this.buildingArchitecture.tearFabricObject(...args);
  }
  public scatterHouseholdObjects(
    ...args: Parameters<BuildingArchitectureSubsystem['scatterHouseholdObjects']>
  ): ReturnType<BuildingArchitectureSubsystem['scatterHouseholdObjects']> {
    return this.buildingArchitecture.scatterHouseholdObjects(...args);
  }
  public restoreFurnitureState(
    ...args: Parameters<BuildingArchitectureSubsystem['restoreFurnitureState']>
  ): ReturnType<BuildingArchitectureSubsystem['restoreFurnitureState']> {
    return this.buildingArchitecture.restoreFurnitureState(...args);
  }
  public initializeRigidBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['initializeRigidBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['initializeRigidBody']> {
    return this.physicsMaterials.initializeRigidBody(...args);
  }
  public setObjectMass(
    ...args: Parameters<PhysicsMaterialsSubsystem['setObjectMass']>
  ): ReturnType<PhysicsMaterialsSubsystem['setObjectMass']> {
    return this.physicsMaterials.setObjectMass(...args);
  }
  public setObjectDensity(
    ...args: Parameters<PhysicsMaterialsSubsystem['setObjectDensity']>
  ): ReturnType<PhysicsMaterialsSubsystem['setObjectDensity']> {
    return this.physicsMaterials.setObjectDensity(...args);
  }
  public setObjectFriction(
    ...args: Parameters<PhysicsMaterialsSubsystem['setObjectFriction']>
  ): ReturnType<PhysicsMaterialsSubsystem['setObjectFriction']> {
    return this.physicsMaterials.setObjectFriction(...args);
  }
  public setObjectRestitution(
    ...args: Parameters<PhysicsMaterialsSubsystem['setObjectRestitution']>
  ): ReturnType<PhysicsMaterialsSubsystem['setObjectRestitution']> {
    return this.physicsMaterials.setObjectRestitution(...args);
  }
  public applyForceToObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['applyForceToObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['applyForceToObject']> {
    return this.physicsMaterials.applyForceToObject(...args);
  }
  public applyImpulseToObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['applyImpulseToObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['applyImpulseToObject']> {
    return this.physicsMaterials.applyImpulseToObject(...args);
  }
  public applyTorqueToObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['applyTorqueToObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['applyTorqueToObject']> {
    return this.physicsMaterials.applyTorqueToObject(...args);
  }
  public calculateObjectVelocity(
    ...args: Parameters<PhysicsMaterialsSubsystem['calculateObjectVelocity']>
  ): ReturnType<PhysicsMaterialsSubsystem['calculateObjectVelocity']> {
    return this.physicsMaterials.calculateObjectVelocity(...args);
  }
  public calculateObjectAcceleration(
    ...args: Parameters<PhysicsMaterialsSubsystem['calculateObjectAcceleration']>
  ): ReturnType<PhysicsMaterialsSubsystem['calculateObjectAcceleration']> {
    return this.physicsMaterials.calculateObjectAcceleration(...args);
  }
  public calculateAngularVelocity(
    ...args: Parameters<PhysicsMaterialsSubsystem['calculateAngularVelocity']>
  ): ReturnType<PhysicsMaterialsSubsystem['calculateAngularVelocity']> {
    return this.physicsMaterials.calculateAngularVelocity(...args);
  }
  public simulateObjectGravity(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulateObjectGravity']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulateObjectGravity']> {
    return this.physicsMaterials.simulateObjectGravity(...args);
  }
  public simulateObjectAirResistance(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulateObjectAirResistance']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulateObjectAirResistance']> {
    return this.physicsMaterials.simulateObjectAirResistance(...args);
  }
  public detectObjectCollision(
    ...args: Parameters<PhysicsMaterialsSubsystem['detectObjectCollision']>
  ): ReturnType<PhysicsMaterialsSubsystem['detectObjectCollision']> {
    return this.physicsMaterials.detectObjectCollision(...args);
  }
  public resolveObjectCollision(
    ...args: Parameters<PhysicsMaterialsSubsystem['resolveObjectCollision']>
  ): ReturnType<PhysicsMaterialsSubsystem['resolveObjectCollision']> {
    return this.physicsMaterials.resolveObjectCollision(...args);
  }
  public calculateImpactEnergy(
    ...args: Parameters<PhysicsMaterialsSubsystem['calculateImpactEnergy']>
  ): ReturnType<PhysicsMaterialsSubsystem['calculateImpactEnergy']> {
    return this.physicsMaterials.calculateImpactEnergy(...args);
  }
  public calculateImpactDamage(
    ...args: Parameters<PhysicsMaterialsSubsystem['calculateImpactDamage']>
  ): ReturnType<PhysicsMaterialsSubsystem['calculateImpactDamage']> {
    return this.physicsMaterials.calculateImpactDamage(...args);
  }
  public simulateObjectPenetration(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulateObjectPenetration']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulateObjectPenetration']> {
    return this.physicsMaterials.simulateObjectPenetration(...args);
  }
  public simulateObjectBounce(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulateObjectBounce']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulateObjectBounce']> {
    return this.physicsMaterials.simulateObjectBounce(...args);
  }
  public settleRigidBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['settleRigidBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['settleRigidBody']> {
    return this.physicsMaterials.settleRigidBody(...args);
  }
  public initializeDestructionSystem(
    ...args: Parameters<PhysicsMaterialsSubsystem['initializeDestructionSystem']>
  ): ReturnType<PhysicsMaterialsSubsystem['initializeDestructionSystem']> {
    return this.physicsMaterials.initializeDestructionSystem(...args);
  }
  public defineFractureRegions(
    ...args: Parameters<PhysicsMaterialsSubsystem['defineFractureRegions']>
  ): ReturnType<PhysicsMaterialsSubsystem['defineFractureRegions']> {
    return this.physicsMaterials.defineFractureRegions(...args);
  }
  public calculateFractureThreshold(
    ...args: Parameters<PhysicsMaterialsSubsystem['calculateFractureThreshold']>
  ): ReturnType<PhysicsMaterialsSubsystem['calculateFractureThreshold']> {
    return this.physicsMaterials.calculateFractureThreshold(...args);
  }
  public detectCuttingContact(
    ...args: Parameters<PhysicsMaterialsSubsystem['detectCuttingContact']>
  ): ReturnType<PhysicsMaterialsSubsystem['detectCuttingContact']> {
    return this.physicsMaterials.detectCuttingContact(...args);
  }
  public applyCuttingForce(
    ...args: Parameters<PhysicsMaterialsSubsystem['applyCuttingForce']>
  ): ReturnType<PhysicsMaterialsSubsystem['applyCuttingForce']> {
    return this.physicsMaterials.applyCuttingForce(...args);
  }
  public sliceObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['sliceObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['sliceObject']> {
    return this.physicsMaterials.sliceObject(...args);
  }
  public cutObjectIntoPieces(
    ...args: Parameters<PhysicsMaterialsSubsystem['cutObjectIntoPieces']>
  ): ReturnType<PhysicsMaterialsSubsystem['cutObjectIntoPieces']> {
    return this.physicsMaterials.cutObjectIntoPieces(...args);
  }
  public severBranchWithBlade(
    ...args: Parameters<PhysicsMaterialsSubsystem['severBranchWithBlade']>
  ): ReturnType<PhysicsMaterialsSubsystem['severBranchWithBlade']> {
    return this.physicsMaterials.severBranchWithBlade(...args);
  }
  public chopTreeTrunk(
    ...args: Parameters<PhysicsMaterialsSubsystem['chopTreeTrunk']>
  ): ReturnType<PhysicsMaterialsSubsystem['chopTreeTrunk']> {
    return this.physicsMaterials.chopTreeTrunk(...args);
  }
  public splitWoodLog(
    ...args: Parameters<PhysicsMaterialsSubsystem['splitWoodLog']>
  ): ReturnType<PhysicsMaterialsSubsystem['splitWoodLog']> {
    return this.physicsMaterials.splitWoodLog(...args);
  }
  public breakObjectAtJoint(
    ...args: Parameters<PhysicsMaterialsSubsystem['breakObjectAtJoint']>
  ): ReturnType<PhysicsMaterialsSubsystem['breakObjectAtJoint']> {
    return this.physicsMaterials.breakObjectAtJoint(...args);
  }
  public snapObjectInHalf(
    ...args: Parameters<PhysicsMaterialsSubsystem['snapObjectInHalf']>
  ): ReturnType<PhysicsMaterialsSubsystem['snapObjectInHalf']> {
    return this.physicsMaterials.snapObjectInHalf(...args);
  }
  public fractureObjectSurface(
    ...args: Parameters<PhysicsMaterialsSubsystem['fractureObjectSurface']>
  ): ReturnType<PhysicsMaterialsSubsystem['fractureObjectSurface']> {
    return this.physicsMaterials.fractureObjectSurface(...args);
  }
  public shatterObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['shatterObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['shatterObject']> {
    return this.physicsMaterials.shatterObject(...args);
  }
  public splitRockWithImpact(
    ...args: Parameters<PhysicsMaterialsSubsystem['splitRockWithImpact']>
  ): ReturnType<PhysicsMaterialsSubsystem['splitRockWithImpact']> {
    return this.physicsMaterials.splitRockWithImpact(...args);
  }
  public detachObjectPart(
    ...args: Parameters<PhysicsMaterialsSubsystem['detachObjectPart']>
  ): ReturnType<PhysicsMaterialsSubsystem['detachObjectPart']> {
    return this.physicsMaterials.detachObjectPart(...args);
  }
  public calculateDetachedPartVelocity(
    ...args: Parameters<PhysicsMaterialsSubsystem['calculateDetachedPartVelocity']>
  ): ReturnType<PhysicsMaterialsSubsystem['calculateDetachedPartVelocity']> {
    return this.physicsMaterials.calculateDetachedPartVelocity(...args);
  }
  public spawnDetachedFragments(
    ...args: Parameters<PhysicsMaterialsSubsystem['spawnDetachedFragments']>
  ): ReturnType<PhysicsMaterialsSubsystem['spawnDetachedFragments']> {
    return this.physicsMaterials.spawnDetachedFragments(...args);
  }
  public applyDebrisPhysics(
    ...args: Parameters<PhysicsMaterialsSubsystem['applyDebrisPhysics']>
  ): ReturnType<PhysicsMaterialsSubsystem['applyDebrisPhysics']> {
    return this.physicsMaterials.applyDebrisPhysics(...args);
  }
  public finalizeObjectDestruction(
    ...args: Parameters<PhysicsMaterialsSubsystem['finalizeObjectDestruction']>
  ): ReturnType<PhysicsMaterialsSubsystem['finalizeObjectDestruction']> {
    return this.physicsMaterials.finalizeObjectDestruction(...args);
  }
  public createSoftBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['createSoftBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['createSoftBody']> {
    return this.physicsMaterials.createSoftBody(...args);
  }
  public initializeSoftBodyPhysics(
    ...args: Parameters<PhysicsMaterialsSubsystem['initializeSoftBodyPhysics']>
  ): ReturnType<PhysicsMaterialsSubsystem['initializeSoftBodyPhysics']> {
    return this.physicsMaterials.initializeSoftBodyPhysics(...args);
  }
  public deformSoftBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['deformSoftBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['deformSoftBody']> {
    return this.physicsMaterials.deformSoftBody(...args);
  }
  public stretchSoftBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['stretchSoftBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['stretchSoftBody']> {
    return this.physicsMaterials.stretchSoftBody(...args);
  }
  public compressSoftBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['compressSoftBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['compressSoftBody']> {
    return this.physicsMaterials.compressSoftBody(...args);
  }
  public bendSoftBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['bendSoftBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['bendSoftBody']> {
    return this.physicsMaterials.bendSoftBody(...args);
  }
  public twistSoftBody(
    ...args: Parameters<PhysicsMaterialsSubsystem['twistSoftBody']>
  ): ReturnType<PhysicsMaterialsSubsystem['twistSoftBody']> {
    return this.physicsMaterials.twistSoftBody(...args);
  }
  public restoreSoftBodyShape(
    ...args: Parameters<PhysicsMaterialsSubsystem['restoreSoftBodyShape']>
  ): ReturnType<PhysicsMaterialsSubsystem['restoreSoftBodyShape']> {
    return this.physicsMaterials.restoreSoftBodyShape(...args);
  }
  public simulateClothMotion(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulateClothMotion']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulateClothMotion']> {
    return this.physicsMaterials.simulateClothMotion(...args);
  }
  public simulateClothWind(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulateClothWind']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulateClothWind']> {
    return this.physicsMaterials.simulateClothWind(...args);
  }
  public foldCloth(
    ...args: Parameters<PhysicsMaterialsSubsystem['foldCloth']>
  ): ReturnType<PhysicsMaterialsSubsystem['foldCloth']> {
    return this.physicsMaterials.foldCloth(...args);
  }
  public unfoldCloth(
    ...args: Parameters<PhysicsMaterialsSubsystem['unfoldCloth']>
  ): ReturnType<PhysicsMaterialsSubsystem['unfoldCloth']> {
    return this.physicsMaterials.unfoldCloth(...args);
  }
  public tearCloth(
    ...args: Parameters<PhysicsMaterialsSubsystem['tearCloth']>
  ): ReturnType<PhysicsMaterialsSubsystem['tearCloth']> {
    return this.physicsMaterials.tearCloth(...args);
  }
  public simulatePaperBending(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulatePaperBending']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulatePaperBending']> {
    return this.physicsMaterials.simulatePaperBending(...args);
  }
  public crumplePaper(
    ...args: Parameters<PhysicsMaterialsSubsystem['crumplePaper']>
  ): ReturnType<PhysicsMaterialsSubsystem['crumplePaper']> {
    return this.physicsMaterials.crumplePaper(...args);
  }
  public tearPaper(
    ...args: Parameters<PhysicsMaterialsSubsystem['tearPaper']>
  ): ReturnType<PhysicsMaterialsSubsystem['tearPaper']> {
    return this.physicsMaterials.tearPaper(...args);
  }
  public burnPaper(
    ...args: Parameters<PhysicsMaterialsSubsystem['burnPaper']>
  ): ReturnType<PhysicsMaterialsSubsystem['burnPaper']> {
    return this.physicsMaterials.burnPaper(...args);
  }
  public simulateRopeMotion(
    ...args: Parameters<PhysicsMaterialsSubsystem['simulateRopeMotion']>
  ): ReturnType<PhysicsMaterialsSubsystem['simulateRopeMotion']> {
    return this.physicsMaterials.simulateRopeMotion(...args);
  }
  public stretchRope(
    ...args: Parameters<PhysicsMaterialsSubsystem['stretchRope']>
  ): ReturnType<PhysicsMaterialsSubsystem['stretchRope']> {
    return this.physicsMaterials.stretchRope(...args);
  }
  public snapRope(
    ...args: Parameters<PhysicsMaterialsSubsystem['snapRope']>
  ): ReturnType<PhysicsMaterialsSubsystem['snapRope']> {
    return this.physicsMaterials.snapRope(...args);
  }
  public createMechanicalObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['createMechanicalObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['createMechanicalObject']> {
    return this.physicsMaterials.createMechanicalObject(...args);
  }
  public initializeMechanicalJoints(
    ...args: Parameters<PhysicsMaterialsSubsystem['initializeMechanicalJoints']>
  ): ReturnType<PhysicsMaterialsSubsystem['initializeMechanicalJoints']> {
    return this.physicsMaterials.initializeMechanicalJoints(...args);
  }
  public rotateMechanicalJoint(
    ...args: Parameters<PhysicsMaterialsSubsystem['rotateMechanicalJoint']>
  ): ReturnType<PhysicsMaterialsSubsystem['rotateMechanicalJoint']> {
    return this.physicsMaterials.rotateMechanicalJoint(...args);
  }
  public slideMechanicalJoint(
    ...args: Parameters<PhysicsMaterialsSubsystem['slideMechanicalJoint']>
  ): ReturnType<PhysicsMaterialsSubsystem['slideMechanicalJoint']> {
    return this.physicsMaterials.slideMechanicalJoint(...args);
  }
  public lockMechanicalJoint(
    ...args: Parameters<PhysicsMaterialsSubsystem['lockMechanicalJoint']>
  ): ReturnType<PhysicsMaterialsSubsystem['lockMechanicalJoint']> {
    return this.physicsMaterials.lockMechanicalJoint(...args);
  }
  public unlockMechanicalJoint(
    ...args: Parameters<PhysicsMaterialsSubsystem['unlockMechanicalJoint']>
  ): ReturnType<PhysicsMaterialsSubsystem['unlockMechanicalJoint']> {
    return this.physicsMaterials.unlockMechanicalJoint(...args);
  }
  public applyMechanicalTorque(
    ...args: Parameters<PhysicsMaterialsSubsystem['applyMechanicalTorque']>
  ): ReturnType<PhysicsMaterialsSubsystem['applyMechanicalTorque']> {
    return this.physicsMaterials.applyMechanicalTorque(...args);
  }
  public bendMetalSheet(
    ...args: Parameters<PhysicsMaterialsSubsystem['bendMetalSheet']>
  ): ReturnType<PhysicsMaterialsSubsystem['bendMetalSheet']> {
    return this.physicsMaterials.bendMetalSheet(...args);
  }
  public dentMetalSurface(
    ...args: Parameters<PhysicsMaterialsSubsystem['dentMetalSurface']>
  ): ReturnType<PhysicsMaterialsSubsystem['dentMetalSurface']> {
    return this.physicsMaterials.dentMetalSurface(...args);
  }
  public deformMetalStructure(
    ...args: Parameters<PhysicsMaterialsSubsystem['deformMetalStructure']>
  ): ReturnType<PhysicsMaterialsSubsystem['deformMetalStructure']> {
    return this.physicsMaterials.deformMetalStructure(...args);
  }
  public fractureMetalPart(
    ...args: Parameters<PhysicsMaterialsSubsystem['fractureMetalPart']>
  ): ReturnType<PhysicsMaterialsSubsystem['fractureMetalPart']> {
    return this.physicsMaterials.fractureMetalPart(...args);
  }
  public fatigueMetalMaterial(
    ...args: Parameters<PhysicsMaterialsSubsystem['fatigueMetalMaterial']>
  ): ReturnType<PhysicsMaterialsSubsystem['fatigueMetalMaterial']> {
    return this.physicsMaterials.fatigueMetalMaterial(...args);
  }
  public corrodeMetalSurface(
    ...args: Parameters<PhysicsMaterialsSubsystem['corrodeMetalSurface']>
  ): ReturnType<PhysicsMaterialsSubsystem['corrodeMetalSurface']> {
    return this.physicsMaterials.corrodeMetalSurface(...args);
  }
  public rustMetalObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['rustMetalObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['rustMetalObject']> {
    return this.physicsMaterials.rustMetalObject(...args);
  }
  public heatMetalObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['heatMetalObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['heatMetalObject']> {
    return this.physicsMaterials.heatMetalObject(...args);
  }
  public coolMetalObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['coolMetalObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['coolMetalObject']> {
    return this.physicsMaterials.coolMetalObject(...args);
  }
  public expandMetalObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['expandMetalObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['expandMetalObject']> {
    return this.physicsMaterials.expandMetalObject(...args);
  }
  public contractMetalObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['contractMetalObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['contractMetalObject']> {
    return this.physicsMaterials.contractMetalObject(...args);
  }
  public jamMechanicalJoint(
    ...args: Parameters<PhysicsMaterialsSubsystem['jamMechanicalJoint']>
  ): ReturnType<PhysicsMaterialsSubsystem['jamMechanicalJoint']> {
    return this.physicsMaterials.jamMechanicalJoint(...args);
  }
  public repairMechanicalObject(
    ...args: Parameters<PhysicsMaterialsSubsystem['repairMechanicalObject']>
  ): ReturnType<PhysicsMaterialsSubsystem['repairMechanicalObject']> {
    return this.physicsMaterials.repairMechanicalObject(...args);
  }
  public createSettlement(
    ...args: Parameters<GeologyClimateSubsystem['createSettlement']>
  ): ReturnType<GeologyClimateSubsystem['createSettlement']> {
    return this.geologyClimate.createSettlement(...args);
  }
  public generateBuildingPlot(
    ...args: Parameters<GeologyClimateSubsystem['generateBuildingPlot']>
  ): ReturnType<GeologyClimateSubsystem['generateBuildingPlot']> {
    return this.geologyClimate.generateBuildingPlot(...args);
  }
  public placeBuildingOnTerrain(
    ...args: Parameters<GeologyClimateSubsystem['placeBuildingOnTerrain']>
  ): ReturnType<GeologyClimateSubsystem['placeBuildingOnTerrain']> {
    return this.geologyClimate.placeBuildingOnTerrain(...args);
  }
  public constructFoundation(
    ...args: Parameters<GeologyClimateSubsystem['constructFoundation']>
  ): ReturnType<GeologyClimateSubsystem['constructFoundation']> {
    return this.geologyClimate.constructFoundation(...args);
  }
  public constructWallSection(
    ...args: Parameters<GeologyClimateSubsystem['constructWallSection']>
  ): ReturnType<GeologyClimateSubsystem['constructWallSection']> {
    return this.geologyClimate.constructWallSection(...args);
  }
  public installRoofSection(
    ...args: Parameters<GeologyClimateSubsystem['installRoofSection']>
  ): ReturnType<GeologyClimateSubsystem['installRoofSection']> {
    return this.geologyClimate.installRoofSection(...args);
  }
  public installWindow(
    ...args: Parameters<GeologyClimateSubsystem['installWindow']>
  ): ReturnType<GeologyClimateSubsystem['installWindow']> {
    return this.geologyClimate.installWindow(...args);
  }
  public installDoor(
    ...args: Parameters<GeologyClimateSubsystem['installDoor']>
  ): ReturnType<GeologyClimateSubsystem['installDoor']> {
    return this.geologyClimate.installDoor(...args);
  }
  public constructBridge(
    ...args: Parameters<GeologyClimateSubsystem['constructBridge']>
  ): ReturnType<GeologyClimateSubsystem['constructBridge']> {
    return this.geologyClimate.constructBridge(...args);
  }
  public constructRoad(
    ...args: Parameters<GeologyClimateSubsystem['constructRoad']>
  ): ReturnType<GeologyClimateSubsystem['constructRoad']> {
    return this.geologyClimate.constructRoad(...args);
  }
  public paveRoadSurface(
    ...args: Parameters<GeologyClimateSubsystem['paveRoadSurface']>
  ): ReturnType<GeologyClimateSubsystem['paveRoadSurface']> {
    return this.geologyClimate.paveRoadSurface(...args);
  }
  public crackRoadSurface(
    ...args: Parameters<GeologyClimateSubsystem['crackRoadSurface']>
  ): ReturnType<GeologyClimateSubsystem['crackRoadSurface']> {
    return this.geologyClimate.crackRoadSurface(...args);
  }
  public erodeRoadSurface(
    ...args: Parameters<GeologyClimateSubsystem['erodeRoadSurface']>
  ): ReturnType<GeologyClimateSubsystem['erodeRoadSurface']> {
    return this.geologyClimate.erodeRoadSurface(...args);
  }
  public generatePothole(
    ...args: Parameters<GeologyClimateSubsystem['generatePothole']>
  ): ReturnType<GeologyClimateSubsystem['generatePothole']> {
    return this.geologyClimate.generatePothole(...args);
  }
  public repairRoadSurface(
    ...args: Parameters<GeologyClimateSubsystem['repairRoadSurface']>
  ): ReturnType<GeologyClimateSubsystem['repairRoadSurface']> {
    return this.geologyClimate.repairRoadSurface(...args);
  }
  public constructFence(
    ...args: Parameters<GeologyClimateSubsystem['constructFence']>
  ): ReturnType<GeologyClimateSubsystem['constructFence']> {
    return this.geologyClimate.constructFence(...args);
  }
  public breakFenceSection(
    ...args: Parameters<GeologyClimateSubsystem['breakFenceSection']>
  ): ReturnType<GeologyClimateSubsystem['breakFenceSection']> {
    return this.geologyClimate.breakFenceSection(...args);
  }
  public constructDam(
    ...args: Parameters<GeologyClimateSubsystem['constructDam']>
  ): ReturnType<GeologyClimateSubsystem['constructDam']> {
    return this.geologyClimate.constructDam(...args);
  }
  public breachDam(
    ...args: Parameters<GeologyClimateSubsystem['breachDam']>
  ): ReturnType<GeologyClimateSubsystem['breachDam']> {
    return this.geologyClimate.breachDam(...args);
  }
  public updateBuiltEnvironment(
    ...args: Parameters<GeologyClimateSubsystem['updateBuiltEnvironment']>
  ): ReturnType<GeologyClimateSubsystem['updateBuiltEnvironment']> {
    return this.geologyClimate.updateBuiltEnvironment(...args);
  }
  public createEarthquake(
    ...args: Parameters<GeologyClimateSubsystem['createEarthquake']>
  ): ReturnType<GeologyClimateSubsystem['createEarthquake']> {
    return this.geologyClimate.createEarthquake(...args);
  }
  public calculateSeismicWave(
    ...args: Parameters<GeologyClimateSubsystem['calculateSeismicWave']>
  ): ReturnType<GeologyClimateSubsystem['calculateSeismicWave']> {
    return this.geologyClimate.calculateSeismicWave(...args);
  }
  public propagateSeismicWave(
    ...args: Parameters<GeologyClimateSubsystem['propagateSeismicWave']>
  ): ReturnType<GeologyClimateSubsystem['propagateSeismicWave']> {
    return this.geologyClimate.propagateSeismicWave(...args);
  }
  public shakeTerrain(
    ...args: Parameters<GeologyClimateSubsystem['shakeTerrain']>
  ): ReturnType<GeologyClimateSubsystem['shakeTerrain']> {
    return this.geologyClimate.shakeTerrain(...args);
  }
  public shakeBuilding(
    ...args: Parameters<GeologyClimateSubsystem['shakeBuilding']>
  ): ReturnType<GeologyClimateSubsystem['shakeBuilding']> {
    return this.geologyClimate.shakeBuilding(...args);
  }
  public triggerGroundRupture(
    ...args: Parameters<GeologyClimateSubsystem['triggerGroundRupture']>
  ): ReturnType<GeologyClimateSubsystem['triggerGroundRupture']> {
    return this.geologyClimate.triggerGroundRupture(...args);
  }
  public generateGroundCracks(
    ...args: Parameters<GeologyClimateSubsystem['generateGroundCracks']>
  ): ReturnType<GeologyClimateSubsystem['generateGroundCracks']> {
    return this.geologyClimate.generateGroundCracks(...args);
  }
  public widenGroundCracks(
    ...args: Parameters<GeologyClimateSubsystem['widenGroundCracks']>
  ): ReturnType<GeologyClimateSubsystem['widenGroundCracks']> {
    return this.geologyClimate.widenGroundCracks(...args);
  }
  public triggerLiquefaction(
    ...args: Parameters<GeologyClimateSubsystem['triggerLiquefaction']>
  ): ReturnType<GeologyClimateSubsystem['triggerLiquefaction']> {
    return this.geologyClimate.triggerLiquefaction(...args);
  }
  public calculateSeismicDamage(
    ...args: Parameters<GeologyClimateSubsystem['calculateSeismicDamage']>
  ): ReturnType<GeologyClimateSubsystem['calculateSeismicDamage']> {
    return this.geologyClimate.calculateSeismicDamage(...args);
  }
  public createVolcano(
    ...args: Parameters<GeologyClimateSubsystem['createVolcano']>
  ): ReturnType<GeologyClimateSubsystem['createVolcano']> {
    return this.geologyClimate.createVolcano(...args);
  }
  public accumulateMagmaPressure(
    ...args: Parameters<GeologyClimateSubsystem['accumulateMagmaPressure']>
  ): ReturnType<GeologyClimateSubsystem['accumulateMagmaPressure']> {
    return this.geologyClimate.accumulateMagmaPressure(...args);
  }
  public simulateMagmaMovement(
    ...args: Parameters<GeologyClimateSubsystem['simulateMagmaMovement']>
  ): ReturnType<GeologyClimateSubsystem['simulateMagmaMovement']> {
    return this.geologyClimate.simulateMagmaMovement(...args);
  }
  public triggerVolcanicEruption(
    ...args: Parameters<GeologyClimateSubsystem['triggerVolcanicEruption']>
  ): ReturnType<GeologyClimateSubsystem['triggerVolcanicEruption']> {
    return this.geologyClimate.triggerVolcanicEruption(...args);
  }
  public spawnVolcanicProjectiles(
    ...args: Parameters<GeologyClimateSubsystem['spawnVolcanicProjectiles']>
  ): ReturnType<GeologyClimateSubsystem['spawnVolcanicProjectiles']> {
    return this.geologyClimate.spawnVolcanicProjectiles(...args);
  }
  public simulateLavaFlow(
    ...args: Parameters<GeologyClimateSubsystem['simulateLavaFlow']>
  ): ReturnType<GeologyClimateSubsystem['simulateLavaFlow']> {
    return this.geologyClimate.simulateLavaFlow(...args);
  }
  public coolLavaFlow(
    ...args: Parameters<GeologyClimateSubsystem['coolLavaFlow']>
  ): ReturnType<GeologyClimateSubsystem['coolLavaFlow']> {
    return this.geologyClimate.coolLavaFlow(...args);
  }
  public solidifyLava(
    ...args: Parameters<GeologyClimateSubsystem['solidifyLava']>
  ): ReturnType<GeologyClimateSubsystem['solidifyLava']> {
    return this.geologyClimate.solidifyLava(...args);
  }
  public generateVolcanicAsh(
    ...args: Parameters<GeologyClimateSubsystem['generateVolcanicAsh']>
  ): ReturnType<GeologyClimateSubsystem['generateVolcanicAsh']> {
    return this.geologyClimate.generateVolcanicAsh(...args);
  }
  public updateGeologicalRecovery(
    ...args: Parameters<GeologyClimateSubsystem['updateGeologicalRecovery']>
  ): ReturnType<GeologyClimateSubsystem['updateGeologicalRecovery']> {
    return this.geologyClimate.updateGeologicalRecovery(...args);
  }
  public createGlacier(
    ...args: Parameters<GeologyClimateSubsystem['createGlacier']>
  ): ReturnType<GeologyClimateSubsystem['createGlacier']> {
    return this.geologyClimate.createGlacier(...args);
  }
  public accumulateGlacierSnow(
    ...args: Parameters<GeologyClimateSubsystem['accumulateGlacierSnow']>
  ): ReturnType<GeologyClimateSubsystem['accumulateGlacierSnow']> {
    return this.geologyClimate.accumulateGlacierSnow(...args);
  }
  public compactGlacierSnow(
    ...args: Parameters<GeologyClimateSubsystem['compactGlacierSnow']>
  ): ReturnType<GeologyClimateSubsystem['compactGlacierSnow']> {
    return this.geologyClimate.compactGlacierSnow(...args);
  }
  public simulateGlacierFlow(
    ...args: Parameters<GeologyClimateSubsystem['simulateGlacierFlow']>
  ): ReturnType<GeologyClimateSubsystem['simulateGlacierFlow']> {
    return this.geologyClimate.simulateGlacierFlow(...args);
  }
  public deformGlacierSurface(
    ...args: Parameters<GeologyClimateSubsystem['deformGlacierSurface']>
  ): ReturnType<GeologyClimateSubsystem['deformGlacierSurface']> {
    return this.geologyClimate.deformGlacierSurface(...args);
  }
  public generateGlacierCrevasse(
    ...args: Parameters<GeologyClimateSubsystem['generateGlacierCrevasse']>
  ): ReturnType<GeologyClimateSubsystem['generateGlacierCrevasse']> {
    return this.geologyClimate.generateGlacierCrevasse(...args);
  }
  public widenGlacierCrevasse(
    ...args: Parameters<GeologyClimateSubsystem['widenGlacierCrevasse']>
  ): ReturnType<GeologyClimateSubsystem['widenGlacierCrevasse']> {
    return this.geologyClimate.widenGlacierCrevasse(...args);
  }
  public fractureGlacierIce(
    ...args: Parameters<GeologyClimateSubsystem['fractureGlacierIce']>
  ): ReturnType<GeologyClimateSubsystem['fractureGlacierIce']> {
    return this.geologyClimate.fractureGlacierIce(...args);
  }
  public calveGlacierIceberg(
    ...args: Parameters<GeologyClimateSubsystem['calveGlacierIceberg']>
  ): ReturnType<GeologyClimateSubsystem['calveGlacierIceberg']> {
    return this.geologyClimate.calveGlacierIceberg(...args);
  }
  public createIceberg(
    ...args: Parameters<GeologyClimateSubsystem['createIceberg']>
  ): ReturnType<GeologyClimateSubsystem['createIceberg']> {
    return this.geologyClimate.createIceberg(...args);
  }
  public driftIceberg(
    ...args: Parameters<GeologyClimateSubsystem['driftIceberg']>
  ): ReturnType<GeologyClimateSubsystem['driftIceberg']> {
    return this.geologyClimate.driftIceberg(...args);
  }
  public rotateIceberg(
    ...args: Parameters<GeologyClimateSubsystem['rotateIceberg']>
  ): ReturnType<GeologyClimateSubsystem['rotateIceberg']> {
    return this.geologyClimate.rotateIceberg(...args);
  }
  public meltIceberg(
    ...args: Parameters<GeologyClimateSubsystem['meltIceberg']>
  ): ReturnType<GeologyClimateSubsystem['meltIceberg']> {
    return this.geologyClimate.meltIceberg(...args);
  }
  public simulateSeaIceFormation(
    ...args: Parameters<GeologyClimateSubsystem['simulateSeaIceFormation']>
  ): ReturnType<GeologyClimateSubsystem['simulateSeaIceFormation']> {
    return this.geologyClimate.simulateSeaIceFormation(...args);
  }
  public simulateSeaIceBreakup(
    ...args: Parameters<GeologyClimateSubsystem['simulateSeaIceBreakup']>
  ): ReturnType<GeologyClimateSubsystem['simulateSeaIceBreakup']> {
    return this.geologyClimate.simulateSeaIceBreakup(...args);
  }
  public driftSeaIce(
    ...args: Parameters<GeologyClimateSubsystem['driftSeaIce']>
  ): ReturnType<GeologyClimateSubsystem['driftSeaIce']> {
    return this.geologyClimate.driftSeaIce(...args);
  }
  public collideIceFloes(
    ...args: Parameters<GeologyClimateSubsystem['collideIceFloes']>
  ): ReturnType<GeologyClimateSubsystem['collideIceFloes']> {
    return this.geologyClimate.collideIceFloes(...args);
  }
  public freezeGroundWater(
    ...args: Parameters<GeologyClimateSubsystem['freezeGroundWater']>
  ): ReturnType<GeologyClimateSubsystem['freezeGroundWater']> {
    return this.geologyClimate.freezeGroundWater(...args);
  }
  public thawPermafrost(
    ...args: Parameters<GeologyClimateSubsystem['thawPermafrost']>
  ): ReturnType<GeologyClimateSubsystem['thawPermafrost']> {
    return this.geologyClimate.thawPermafrost(...args);
  }
  public updateCryosphereState(
    ...args: Parameters<GeologyClimateSubsystem['updateCryosphereState']>
  ): ReturnType<GeologyClimateSubsystem['updateCryosphereState']> {
    return this.geologyClimate.updateCryosphereState(...args);
  }
  public createSunLight(
    ...args: Parameters<GeologyClimateSubsystem['createSunLight']>
  ): ReturnType<GeologyClimateSubsystem['createSunLight']> {
    return this.geologyClimate.createSunLight(...args);
  }
  public updateSunPosition(
    ...args: Parameters<GeologyClimateSubsystem['updateSunPosition']>
  ): ReturnType<GeologyClimateSubsystem['updateSunPosition']> {
    return this.geologyClimate.updateSunPosition(...args);
  }
  public updateSunIntensity(
    ...args: Parameters<GeologyClimateSubsystem['updateSunIntensity']>
  ): ReturnType<GeologyClimateSubsystem['updateSunIntensity']> {
    return this.geologyClimate.updateSunIntensity(...args);
  }
  public calculateSunlightDirection(
    ...args: Parameters<GeologyClimateSubsystem['calculateSunlightDirection']>
  ): ReturnType<GeologyClimateSubsystem['calculateSunlightDirection']> {
    return this.geologyClimate.calculateSunlightDirection(...args);
  }
  public updateShadowDirection(
    ...args: Parameters<GeologyClimateSubsystem['updateShadowDirection']>
  ): ReturnType<GeologyClimateSubsystem['updateShadowDirection']> {
    return this.geologyClimate.updateShadowDirection(...args);
  }
  public updateShadowLength(
    ...args: Parameters<GeologyClimateSubsystem['updateShadowLength']>
  ): ReturnType<GeologyClimateSubsystem['updateShadowLength']> {
    return this.geologyClimate.updateShadowLength(...args);
  }
  public calculateSurfaceSolarHeating(
    ...args: Parameters<GeologyClimateSubsystem['calculateSurfaceSolarHeating']>
  ): ReturnType<GeologyClimateSubsystem['calculateSurfaceSolarHeating']> {
    return this.geologyClimate.calculateSurfaceSolarHeating(...args);
  }
  public heatObjectSurface(
    ...args: Parameters<GeologyClimateSubsystem['heatObjectSurface']>
  ): ReturnType<GeologyClimateSubsystem['heatObjectSurface']> {
    return this.geologyClimate.heatObjectSurface(...args);
  }
  public coolObjectSurface(
    ...args: Parameters<GeologyClimateSubsystem['coolObjectSurface']>
  ): ReturnType<GeologyClimateSubsystem['coolObjectSurface']> {
    return this.geologyClimate.coolObjectSurface(...args);
  }
  public simulateThermalExpansion(
    ...args: Parameters<GeologyClimateSubsystem['simulateThermalExpansion']>
  ): ReturnType<GeologyClimateSubsystem['simulateThermalExpansion']> {
    return this.geologyClimate.simulateThermalExpansion(...args);
  }
  public simulateThermalContraction(
    ...args: Parameters<GeologyClimateSubsystem['simulateThermalContraction']>
  ): ReturnType<GeologyClimateSubsystem['simulateThermalContraction']> {
    return this.geologyClimate.simulateThermalContraction(...args);
  }
  public fadeSunlightAtDusk(
    ...args: Parameters<GeologyClimateSubsystem['fadeSunlightAtDusk']>
  ): ReturnType<GeologyClimateSubsystem['fadeSunlightAtDusk']> {
    return this.geologyClimate.fadeSunlightAtDusk(...args);
  }
  public restoreSunlightAtDawn(
    ...args: Parameters<GeologyClimateSubsystem['restoreSunlightAtDawn']>
  ): ReturnType<GeologyClimateSubsystem['restoreSunlightAtDawn']> {
    return this.geologyClimate.restoreSunlightAtDawn(...args);
  }
  public updateNightLighting(
    ...args: Parameters<GeologyClimateSubsystem['updateNightLighting']>
  ): ReturnType<GeologyClimateSubsystem['updateNightLighting']> {
    return this.geologyClimate.updateNightLighting(...args);
  }
  public simulateMoonlight(
    ...args: Parameters<GeologyClimateSubsystem['simulateMoonlight']>
  ): ReturnType<GeologyClimateSubsystem['simulateMoonlight']> {
    return this.geologyClimate.simulateMoonlight(...args);
  }
  public updateCloudShadowMovement(
    ...args: Parameters<GeologyClimateSubsystem['updateCloudShadowMovement']>
  ): ReturnType<GeologyClimateSubsystem['updateCloudShadowMovement']> {
    return this.geologyClimate.updateCloudShadowMovement(...args);
  }
  public updateVegetationLightExposure(
    ...args: Parameters<GeologyClimateSubsystem['updateVegetationLightExposure']>
  ): ReturnType<GeologyClimateSubsystem['updateVegetationLightExposure']> {
    return this.geologyClimate.updateVegetationLightExposure(...args);
  }
  public calculateSurfaceReflectance(
    ...args: Parameters<GeologyClimateSubsystem['calculateSurfaceReflectance']>
  ): ReturnType<GeologyClimateSubsystem['calculateSurfaceReflectance']> {
    return this.geologyClimate.calculateSurfaceReflectance(...args);
  }
  public simulateHeatTransfer(
    ...args: Parameters<GeologyClimateSubsystem['simulateHeatTransfer']>
  ): ReturnType<GeologyClimateSubsystem['simulateHeatTransfer']> {
    return this.geologyClimate.simulateHeatTransfer(...args);
  }
  public updateEnvironmentalTemperature(
    ...args: Parameters<GeologyClimateSubsystem['updateEnvironmentalTemperature']>
  ): ReturnType<GeologyClimateSubsystem['updateEnvironmentalTemperature']> {
    return this.geologyClimate.updateEnvironmentalTemperature(...args);
  }
  public createParticleSystem(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['createParticleSystem']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['createParticleSystem']> {
    return this.environmentalDynamics.createParticleSystem(...args);
  }
  public spawnParticles(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spawnParticles']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spawnParticles']> {
    return this.environmentalDynamics.spawnParticles(...args);
  }
  public updateParticleMotion(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateParticleMotion']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateParticleMotion']> {
    return this.environmentalDynamics.updateParticleMotion(...args);
  }
  public applyParticleGravity(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['applyParticleGravity']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['applyParticleGravity']> {
    return this.environmentalDynamics.applyParticleGravity(...args);
  }
  public applyParticleWind(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['applyParticleWind']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['applyParticleWind']> {
    return this.environmentalDynamics.applyParticleWind(...args);
  }
  public calculateParticleDrag(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateParticleDrag']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateParticleDrag']> {
    return this.environmentalDynamics.calculateParticleDrag(...args);
  }
  public simulateDustCloud(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateDustCloud']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateDustCloud']> {
    return this.environmentalDynamics.simulateDustCloud(...args);
  }
  public spreadDustCloud(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spreadDustCloud']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spreadDustCloud']> {
    return this.environmentalDynamics.spreadDustCloud(...args);
  }
  public dissipateDustCloud(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['dissipateDustCloud']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['dissipateDustCloud']> {
    return this.environmentalDynamics.dissipateDustCloud(...args);
  }
  public createSandBurst(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['createSandBurst']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['createSandBurst']> {
    return this.environmentalDynamics.createSandBurst(...args);
  }
  public simulateBlowingSand(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateBlowingSand']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateBlowingSand']> {
    return this.environmentalDynamics.simulateBlowingSand(...args);
  }
  public simulateDustDevilParticles(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateDustDevilParticles']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateDustDevilParticles']> {
    return this.environmentalDynamics.simulateDustDevilParticles(...args);
  }
  public spawnPollenParticles(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spawnPollenParticles']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spawnPollenParticles']> {
    return this.environmentalDynamics.spawnPollenParticles(...args);
  }
  public dispersePollen(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['dispersePollen']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['dispersePollen']> {
    return this.environmentalDynamics.dispersePollen(...args);
  }
  public spawnFallingLeaves(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spawnFallingLeaves']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spawnFallingLeaves']> {
    return this.environmentalDynamics.spawnFallingLeaves(...args);
  }
  public simulateFallingLeafParticles(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateFallingLeafParticles']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateFallingLeafParticles']> {
    return this.environmentalDynamics.simulateFallingLeafParticles(...args);
  }
  public spawnFallingPetals(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spawnFallingPetals']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spawnFallingPetals']> {
    return this.environmentalDynamics.spawnFallingPetals(...args);
  }
  public spawnAshParticles(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spawnAshParticles']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spawnAshParticles']> {
    return this.environmentalDynamics.spawnAshParticles(...args);
  }
  public simulateAshDeposition(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateAshDeposition']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateAshDeposition']> {
    return this.environmentalDynamics.simulateAshDeposition(...args);
  }
  public recycleExpiredParticles(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['recycleExpiredParticles']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['recycleExpiredParticles']> {
    return this.environmentalDynamics.recycleExpiredParticles(...args);
  }
  public calculateWeatheringRate(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateWeatheringRate']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateWeatheringRate']> {
    return this.environmentalDynamics.calculateWeatheringRate(...args);
  }
  public applyMechanicalWeathering(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['applyMechanicalWeathering']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['applyMechanicalWeathering']> {
    return this.environmentalDynamics.applyMechanicalWeathering(...args);
  }
  public applyChemicalWeathering(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['applyChemicalWeathering']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['applyChemicalWeathering']> {
    return this.environmentalDynamics.applyChemicalWeathering(...args);
  }
  public applyFreezeThawWeathering(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['applyFreezeThawWeathering']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['applyFreezeThawWeathering']> {
    return this.environmentalDynamics.applyFreezeThawWeathering(...args);
  }
  public erodeObjectSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['erodeObjectSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['erodeObjectSurface']> {
    return this.environmentalDynamics.erodeObjectSurface(...args);
  }
  public erodeBuildingFacade(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['erodeBuildingFacade']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['erodeBuildingFacade']> {
    return this.environmentalDynamics.erodeBuildingFacade(...args);
  }
  public erodeRockFormation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['erodeRockFormation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['erodeRockFormation']> {
    return this.environmentalDynamics.erodeRockFormation(...args);
  }
  public erodeSoilLayer(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['erodeSoilLayer']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['erodeSoilLayer']> {
    return this.environmentalDynamics.erodeSoilLayer(...args);
  }
  public weatherWoodSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['weatherWoodSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['weatherWoodSurface']> {
    return this.environmentalDynamics.weatherWoodSurface(...args);
  }
  public fadePaintSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['fadePaintSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['fadePaintSurface']> {
    return this.environmentalDynamics.fadePaintSurface(...args);
  }
  public peelPaintSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['peelPaintSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['peelPaintSurface']> {
    return this.environmentalDynamics.peelPaintSurface(...args);
  }
  public corrodeConcreteSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['corrodeConcreteSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['corrodeConcreteSurface']> {
    return this.environmentalDynamics.corrodeConcreteSurface(...args);
  }
  public growMoldOnSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['growMoldOnSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['growMoldOnSurface']> {
    return this.environmentalDynamics.growMoldOnSurface(...args);
  }
  public spreadSurfaceMoss(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spreadSurfaceMoss']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spreadSurfaceMoss']> {
    return this.environmentalDynamics.spreadSurfaceMoss(...args);
  }
  public accumulateDirtOnSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['accumulateDirtOnSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['accumulateDirtOnSurface']> {
    return this.environmentalDynamics.accumulateDirtOnSurface(...args);
  }
  public accumulateDustOnSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['accumulateDustOnSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['accumulateDustOnSurface']> {
    return this.environmentalDynamics.accumulateDustOnSurface(...args);
  }
  public washDirtFromSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['washDirtFromSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['washDirtFromSurface']> {
    return this.environmentalDynamics.washDirtFromSurface(...args);
  }
  public degradeMaterialProperties(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['degradeMaterialProperties']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['degradeMaterialProperties']> {
    return this.environmentalDynamics.degradeMaterialProperties(...args);
  }
  public calculateMaterialLifetime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateMaterialLifetime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateMaterialLifetime']> {
    return this.environmentalDynamics.calculateMaterialLifetime(...args);
  }
  public transitionObjectToRuins(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['transitionObjectToRuins']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['transitionObjectToRuins']> {
    return this.environmentalDynamics.transitionObjectToRuins(...args);
  }
  public initializeEcosystem(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['initializeEcosystem']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['initializeEcosystem']> {
    return this.environmentalDynamics.initializeEcosystem(...args);
  }
  public updateEcosystem(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateEcosystem']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateEcosystem']> {
    return this.environmentalDynamics.updateEcosystem(...args);
  }
  public calculateVegetationDensity(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateVegetationDensity']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateVegetationDensity']> {
    return this.environmentalDynamics.calculateVegetationDensity(...args);
  }
  public calculateSoilMoisture(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateSoilMoisture']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateSoilMoisture']> {
    return this.environmentalDynamics.calculateSoilMoisture(...args);
  }
  public calculateNutrientAvailability(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateNutrientAvailability']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateNutrientAvailability']> {
    return this.environmentalDynamics.calculateNutrientAvailability(...args);
  }
  public simulatePlantCompetition(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulatePlantCompetition']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulatePlantCompetition']> {
    return this.environmentalDynamics.simulatePlantCompetition(...args);
  }
  public simulateCanopyCompetition(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateCanopyCompetition']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateCanopyCompetition']> {
    return this.environmentalDynamics.simulateCanopyCompetition(...args);
  }
  public calculateLightCompetition(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateLightCompetition']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateLightCompetition']> {
    return this.environmentalDynamics.calculateLightCompetition(...args);
  }
  public spreadSeedsAcrossRegion(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spreadSeedsAcrossRegion']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spreadSeedsAcrossRegion']> {
    return this.environmentalDynamics.spreadSeedsAcrossRegion(...args);
  }
  public disperseSeedsByWater(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['disperseSeedsByWater']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['disperseSeedsByWater']> {
    return this.environmentalDynamics.disperseSeedsByWater(...args);
  }
  public spreadWildfireAcrossRegion(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['spreadWildfireAcrossRegion']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['spreadWildfireAcrossRegion']> {
    return this.environmentalDynamics.spreadWildfireAcrossRegion(...args);
  }
  public simulateHabitatRecovery(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateHabitatRecovery']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateHabitatRecovery']> {
    return this.environmentalDynamics.simulateHabitatRecovery(...args);
  }
  public regenerateVegetation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['regenerateVegetation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['regenerateVegetation']> {
    return this.environmentalDynamics.regenerateVegetation(...args);
  }
  public restoreDamagedSoil(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['restoreDamagedSoil']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['restoreDamagedSoil']> {
    return this.environmentalDynamics.restoreDamagedSoil(...args);
  }
  public simulateWetlandExpansion(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateWetlandExpansion']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateWetlandExpansion']> {
    return this.environmentalDynamics.simulateWetlandExpansion(...args);
  }
  public simulateDesertification(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateDesertification']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateDesertification']> {
    return this.environmentalDynamics.simulateDesertification(...args);
  }
  public simulateCoastalErosion(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateCoastalErosion']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateCoastalErosion']> {
    return this.environmentalDynamics.simulateCoastalErosion(...args);
  }
  public simulateRiverDeltaGrowth(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateRiverDeltaGrowth']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateRiverDeltaGrowth']> {
    return this.environmentalDynamics.simulateRiverDeltaGrowth(...args);
  }
  public updateEcosystemBalance(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateEcosystemBalance']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateEcosystemBalance']> {
    return this.environmentalDynamics.updateEcosystemBalance(...args);
  }
  public initializeObjectLifecycle(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['initializeObjectLifecycle']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['initializeObjectLifecycle']> {
    return this.environmentalDynamics.initializeObjectLifecycle(...args);
  }
  public updateObjectLifecycle(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateObjectLifecycle']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateObjectLifecycle']> {
    return this.environmentalDynamics.updateObjectLifecycle(...args);
  }
  public setObjectAge(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['setObjectAge']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['setObjectAge']> {
    return this.environmentalDynamics.setObjectAge(...args);
  }
  public calculateObjectAge(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateObjectAge']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateObjectAge']> {
    return this.environmentalDynamics.calculateObjectAge(...args);
  }
  public growObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['growObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['growObjectOverTime']> {
    return this.environmentalDynamics.growObjectOverTime(...args);
  }
  public shrinkObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['shrinkObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['shrinkObjectOverTime']> {
    return this.environmentalDynamics.shrinkObjectOverTime(...args);
  }
  public matureObject(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['matureObject']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['matureObject']> {
    return this.environmentalDynamics.matureObject(...args);
  }
  public weakenObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['weakenObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['weakenObjectOverTime']> {
    return this.environmentalDynamics.weakenObjectOverTime(...args);
  }
  public fatigueObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['fatigueObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['fatigueObjectOverTime']> {
    return this.environmentalDynamics.fatigueObjectOverTime(...args);
  }
  public accumulateObjectDamage(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['accumulateObjectDamage']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['accumulateObjectDamage']> {
    return this.environmentalDynamics.accumulateObjectDamage(...args);
  }
  public recoverObjectCondition(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['recoverObjectCondition']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['recoverObjectCondition']> {
    return this.environmentalDynamics.recoverObjectCondition(...args);
  }
  public decayObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['decayObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['decayObjectOverTime']> {
    return this.environmentalDynamics.decayObjectOverTime(...args);
  }
  public decomposeObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['decomposeObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['decomposeObjectOverTime']> {
    return this.environmentalDynamics.decomposeObjectOverTime(...args);
  }
  public fadeObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['fadeObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['fadeObjectOverTime']> {
    return this.environmentalDynamics.fadeObjectOverTime(...args);
  }
  public disintegrateObjectOverTime(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['disintegrateObjectOverTime']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['disintegrateObjectOverTime']> {
    return this.environmentalDynamics.disintegrateObjectOverTime(...args);
  }
  public triggerObjectFailure(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['triggerObjectFailure']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['triggerObjectFailure']> {
    return this.environmentalDynamics.triggerObjectFailure(...args);
  }
  public replaceObjectWithDebris(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['replaceObjectWithDebris']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['replaceObjectWithDebris']> {
    return this.environmentalDynamics.replaceObjectWithDebris(...args);
  }
  public regenerateObjectFromState(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['regenerateObjectFromState']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['regenerateObjectFromState']> {
    return this.environmentalDynamics.regenerateObjectFromState(...args);
  }
  public advanceSeasonalChanges(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['advanceSeasonalChanges']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['advanceSeasonalChanges']> {
    return this.environmentalDynamics.advanceSeasonalChanges(...args);
  }
  public updateWorldAging(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateWorldAging']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateWorldAging']> {
    return this.environmentalDynamics.updateWorldAging(...args);
  }
  public detectToolContact(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['detectToolContact']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['detectToolContact']> {
    return this.environmentalDynamics.detectToolContact(...args);
  }
  public calculateToolImpact(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateToolImpact']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateToolImpact']> {
    return this.environmentalDynamics.calculateToolImpact(...args);
  }
  public applyHammerImpact(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['applyHammerImpact']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['applyHammerImpact']> {
    return this.environmentalDynamics.applyHammerImpact(...args);
  }
  public strikeObjectWithTool(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['strikeObjectWithTool']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['strikeObjectWithTool']> {
    return this.environmentalDynamics.strikeObjectWithTool(...args);
  }
  public cutVegetationWithTool(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['cutVegetationWithTool']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['cutVegetationWithTool']> {
    return this.environmentalDynamics.cutVegetationWithTool(...args);
  }
  public sawWoodObject(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['sawWoodObject']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['sawWoodObject']> {
    return this.environmentalDynamics.sawWoodObject(...args);
  }
  public digTerrainWithTool(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['digTerrainWithTool']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['digTerrainWithTool']> {
    return this.environmentalDynamics.digTerrainWithTool(...args);
  }
  public excavateRockWithTool(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['excavateRockWithTool']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['excavateRockWithTool']> {
    return this.environmentalDynamics.excavateRockWithTool(...args);
  }
  public chipStoneWithTool(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['chipStoneWithTool']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['chipStoneWithTool']> {
    return this.environmentalDynamics.chipStoneWithTool(...args);
  }
  public breakIceWithTool(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['breakIceWithTool']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['breakIceWithTool']> {
    return this.environmentalDynamics.breakIceWithTool(...args);
  }
  public pryOpenObject(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['pryOpenObject']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['pryOpenObject']> {
    return this.environmentalDynamics.pryOpenObject(...args);
  }
  public leverObjectWithTool(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['leverObjectWithTool']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['leverObjectWithTool']> {
    return this.environmentalDynamics.leverObjectWithTool(...args);
  }
  public drillIntoMaterial(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['drillIntoMaterial']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['drillIntoMaterial']> {
    return this.environmentalDynamics.drillIntoMaterial(...args);
  }
  public grindMaterialSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['grindMaterialSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['grindMaterialSurface']> {
    return this.environmentalDynamics.grindMaterialSurface(...args);
  }
  public polishMaterialSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['polishMaterialSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['polishMaterialSurface']> {
    return this.environmentalDynamics.polishMaterialSurface(...args);
  }
  public weldMetalParts(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['weldMetalParts']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['weldMetalParts']> {
    return this.environmentalDynamics.weldMetalParts(...args);
  }
  public fastenStructuralParts(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['fastenStructuralParts']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['fastenStructuralParts']> {
    return this.environmentalDynamics.fastenStructuralParts(...args);
  }
  public detachFastenedPart(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['detachFastenedPart']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['detachFastenedPart']> {
    return this.environmentalDynamics.detachFastenedPart(...args);
  }
  public repairObjectWithMaterial(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['repairObjectWithMaterial']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['repairObjectWithMaterial']> {
    return this.environmentalDynamics.repairObjectWithMaterial(...args);
  }
  public updateToolDamage(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateToolDamage']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateToolDamage']> {
    return this.environmentalDynamics.updateToolDamage(...args);
  }
  public initializeDestructionGraph(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['initializeDestructionGraph']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['initializeDestructionGraph']> {
    return this.environmentalDynamics.initializeDestructionGraph(...args);
  }
  public generateFracturePattern(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['generateFracturePattern']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['generateFracturePattern']> {
    return this.environmentalDynamics.generateFracturePattern(...args);
  }
  public calculateFracturePropagation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateFracturePropagation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateFracturePropagation']> {
    return this.environmentalDynamics.calculateFracturePropagation(...args);
  }
  public propagateStructuralCrack(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['propagateStructuralCrack']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['propagateStructuralCrack']> {
    return this.environmentalDynamics.propagateStructuralCrack(...args);
  }
  public calculateBreakPoint(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateBreakPoint']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateBreakPoint']> {
    return this.environmentalDynamics.calculateBreakPoint(...args);
  }
  public calculateFractureEnergy(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateFractureEnergy']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateFractureEnergy']> {
    return this.environmentalDynamics.calculateFractureEnergy(...args);
  }
  public splitMeshAlongPlane(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['splitMeshAlongPlane']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['splitMeshAlongPlane']> {
    return this.environmentalDynamics.splitMeshAlongPlane(...args);
  }
  public splitMeshAlongCurve(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['splitMeshAlongCurve']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['splitMeshAlongCurve']> {
    return this.environmentalDynamics.splitMeshAlongCurve(...args);
  }
  public createFractureCapSurface(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['createFractureCapSurface']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['createFractureCapSurface']> {
    return this.environmentalDynamics.createFractureCapSurface(...args);
  }
  public generateFractureDebris(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['generateFractureDebris']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['generateFractureDebris']> {
    return this.environmentalDynamics.generateFractureDebris(...args);
  }
  public assignDebrisMass(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['assignDebrisMass']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['assignDebrisMass']> {
    return this.environmentalDynamics.assignDebrisMass(...args);
  }
  public assignDebrisCollision(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['assignDebrisCollision']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['assignDebrisCollision']> {
    return this.environmentalDynamics.assignDebrisCollision(...args);
  }
  public calculateDebrisTrajectory(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['calculateDebrisTrajectory']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['calculateDebrisTrajectory']> {
    return this.environmentalDynamics.calculateDebrisTrajectory(...args);
  }
  public simulateDebrisPileCollapse(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateDebrisPileCollapse']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateDebrisPileCollapse']> {
    return this.environmentalDynamics.simulateDebrisPileCollapse(...args);
  }
  public detectSecondaryImpact(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['detectSecondaryImpact']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['detectSecondaryImpact']> {
    return this.environmentalDynamics.detectSecondaryImpact(...args);
  }
  public triggerSecondaryFracture(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['triggerSecondaryFracture']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['triggerSecondaryFracture']> {
    return this.environmentalDynamics.triggerSecondaryFracture(...args);
  }
  public simulateProgressiveObjectFailure(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['simulateProgressiveObjectFailure']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['simulateProgressiveObjectFailure']> {
    return this.environmentalDynamics.simulateProgressiveObjectFailure(...args);
  }
  public stabilizeRemainingStructure(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['stabilizeRemainingStructure']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['stabilizeRemainingStructure']> {
    return this.environmentalDynamics.stabilizeRemainingStructure(...args);
  }
  public rebuildDestructibleMesh(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['rebuildDestructibleMesh']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['rebuildDestructibleMesh']> {
    return this.environmentalDynamics.rebuildDestructibleMesh(...args);
  }
  public finalizeDestructionState(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['finalizeDestructionState']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['finalizeDestructionState']> {
    return this.environmentalDynamics.finalizeDestructionState(...args);
  }
  public initializeWorldAnimation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['initializeWorldAnimation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['initializeWorldAnimation']> {
    return this.environmentalDynamics.initializeWorldAnimation(...args);
  }
  public loadWorldAnimationClips(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['loadWorldAnimationClips']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['loadWorldAnimationClips']> {
    return this.environmentalDynamics.loadWorldAnimationClips(...args);
  }
  public playWorldAnimation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['playWorldAnimation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['playWorldAnimation']> {
    return this.environmentalDynamics.playWorldAnimation(...args);
  }
  public blendWorldAnimations(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['blendWorldAnimations']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['blendWorldAnimations']> {
    return this.environmentalDynamics.blendWorldAnimations(...args);
  }
  public crossFadeWorldAnimation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['crossFadeWorldAnimation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['crossFadeWorldAnimation']> {
    return this.environmentalDynamics.crossFadeWorldAnimation(...args);
  }
  public updateWorldAnimationMixer(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateWorldAnimationMixer']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateWorldAnimationMixer']> {
    return this.environmentalDynamics.updateWorldAnimationMixer(...args);
  }
  public applyRootMotionToObject(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['applyRootMotionToObject']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['applyRootMotionToObject']> {
    return this.environmentalDynamics.applyRootMotionToObject(...args);
  }
  public interpolateObjectPosition(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['interpolateObjectPosition']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['interpolateObjectPosition']> {
    return this.environmentalDynamics.interpolateObjectPosition(...args);
  }
  public interpolateObjectRotation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['interpolateObjectRotation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['interpolateObjectRotation']> {
    return this.environmentalDynamics.interpolateObjectRotation(...args);
  }
  public updateObjectLOD(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateObjectLOD']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateObjectLOD']> {
    return this.environmentalDynamics.updateObjectLOD(...args);
  }
  public updateVegetationLOD(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateVegetationLOD']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateVegetationLOD']> {
    return this.environmentalDynamics.updateVegetationLOD(...args);
  }
  public updateDestructionLOD(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateDestructionLOD']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateDestructionLOD']> {
    return this.environmentalDynamics.updateDestructionLOD(...args);
  }
  public cullInvisibleWorldObjects(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['cullInvisibleWorldObjects']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['cullInvisibleWorldObjects']> {
    return this.environmentalDynamics.cullInvisibleWorldObjects(...args);
  }
  public sleepInactiveRigidBodies(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['sleepInactiveRigidBodies']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['sleepInactiveRigidBodies']> {
    return this.environmentalDynamics.sleepInactiveRigidBodies(...args);
  }
  public wakeRigidBody(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['wakeRigidBody']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['wakeRigidBody']> {
    return this.environmentalDynamics.wakeRigidBody(...args);
  }
  public synchronizePhysicsAndAnimation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['synchronizePhysicsAndAnimation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['synchronizePhysicsAndAnimation']> {
    return this.environmentalDynamics.synchronizePhysicsAndAnimation(...args);
  }
  public rebuildWorldCollision(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['rebuildWorldCollision']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['rebuildWorldCollision']> {
    return this.environmentalDynamics.rebuildWorldCollision(...args);
  }
  public updateWorldNavigation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['updateWorldNavigation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['updateWorldNavigation']> {
    return this.environmentalDynamics.updateWorldNavigation(...args);
  }
  public validateWorldSimulation(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['validateWorldSimulation']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['validateWorldSimulation']> {
    return this.environmentalDynamics.validateWorldSimulation(...args);
  }
  public optimizeWorldSimulationPerformance(
    ...args: Parameters<EnvironmentalDynamicsSubsystem['optimizeWorldSimulationPerformance']>
  ): ReturnType<EnvironmentalDynamicsSubsystem['optimizeWorldSimulationPerformance']> {
    return this.environmentalDynamics.optimizeWorldSimulationPerformance(...args);
  }
}
