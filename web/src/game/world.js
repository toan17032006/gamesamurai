// Map — chỉ điều phối các hệ của engine, không còn tự build mesh/cây:
// TerrainSystem (hố + nứt), WaterSystem (hồ), FoliageSystem (cây),
// AtmosphereSystem (gió), configureLights. Mesh/cây/nước ở terrain.js,
// vegetation.js, water.js.
import * as THREE from 'three';
import {
  TerrainSystem, WaterSystem, FoliageSystem, AtmosphereSystem, configureLights,
} from '../assets/engine-lib.js';
import { CONFIG } from './config.js';
import { baseHeight, buildTerrainMesh } from './terrain.js';
import { buildTrees } from './vegetation.js';
import { WaterBody } from './water.js';

export { baseHeight, WORLD_SIZE } from './terrain.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.terrain = new TerrainSystem();
    this.water = new WaterSystem();
    this.foliage = new FoliageSystem();
    this.atmosphere = new AtmosphereSystem();
    const w = CONFIG.world;
    this.terrain.applyCrater(w.crater.center, w.crater.radius, w.crater.depth);
    this.terrain.applyFissure(w.fissure.start, w.fissure.end, w.fissure.width, w.fissure.depth);
    this.water.registerSurface(w.lake.id, w.lake.level, { waveAmplitude: w.lake.waveAmplitude, waveFrequency: w.lake.waveFrequency });
    this.atmosphere.setWind(w.wind);
    const { hemi, sun } = configureLights(this.scene, { timeOfDay: w.timeOfDay });
    this.hemi = hemi; this.sun = sun;
    this.scene.background = new THREE.Color(w.skyColor);
    this.terrainMesh = buildTerrainMesh(this.scene, (x, z) => this.heightAt(x, z));
    this.waterBody = new WaterBody(this.scene);
    this.trees = buildTrees(this.scene, (x, z) => this.heightAt(x, z), this.foliage);
  }

  heightAt(x, z) {
    return this.terrain.getDeformedHeight(x, z, baseHeight(x, z));
  }

  update(dt) {
    this.water.update(dt);
    this.atmosphere.update(dt);
    this.waterBody.update(dt, this.water);
  }
}
