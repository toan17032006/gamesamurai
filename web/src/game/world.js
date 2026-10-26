// Map mới — viết lại từ đầu, mọi độ cao / nước / gió đều qua engine.
// TerrainSystem chỉ cho độ cao (không tự build mesh), nên mesh địa hình
// là một mặt phẳng được đẩy đỉnh theo đúng hàm độ cao của engine.
import * as THREE from 'three';
import {
  TerrainSystem, WaterSystem, FoliageSystem, AtmosphereSystem,
  AssetFactory, configureLights,
} from '../assets/engine-lib.js';

export const WORLD_SIZE = 120;

export function baseHeight(x, z) {
  return Math.sin(x * 0.08) * Math.cos(z * 0.06) * 1.6
    + Math.sin(x * 0.021 + 1.7) * Math.cos(z * 0.017) * 3.2;
}

export class World {
  constructor(scene) {
    this.scene = scene;
    this.terrain = new TerrainSystem();
    this.water = new WaterSystem();
    this.foliage = new FoliageSystem();
    this.atmosphere = new AtmosphereSystem();
    // Vài biến dạng địa hình của engine: hố + nứt, để map không phẳng.
    this.terrain.applyCrater({ x: -18, y: 0, z: -14 }, 6, 1.8);
    this.terrain.applyFissure({ x: 12, y: 0, z: -20 }, { x: 22, y: 0, z: 18 }, 2, 1.2);
    this.water.registerSurface('lake', -0.6, { waveAmplitude: 0.15, waveFrequency: 1.2 });
    this.atmosphere.setWind({ direction: { x: 1, y: 0, z: 0.2 }, speed: 5 });
    this.buildLights();
    this.buildTerrainMesh();
    this.buildWaterMesh();
    this.buildTrees();
  }

  heightAt(x, z) {
    return this.terrain.getDeformedHeight(x, z, baseHeight(x, z));
  }

  buildLights() {
    const { hemi, sun } = configureLights(this.scene, { timeOfDay: 0.35 });
    this.hemi = hemi; this.sun = sun;
    this.scene.background = new THREE.Color(0x87b5d6);
  }

  buildTerrainMesh() {
    const seg = 96;
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color(0x3d6b35), high = new THREE.Color(0x8a7a52), rock = new THREE.Color(0x6b6b6b);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = this.heightAt(x, z);
      pos.setY(i, h);
      const c = h > 4 ? rock : new THREE.Color().lerpColors(low, high, Math.max(0, Math.min(1, h / 4)));
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  buildWaterMesh() {
    const geo = new THREE.PlaneGeometry(40, 40, 32, 32);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a6da8, transparent: true, opacity: 0.75, roughness: 0.2, metalness: 0.1 });
    this.waterMesh = new THREE.Mesh(geo, mat);
    this.waterMesh.position.set(-18, -0.6, -14);
    this.scene.add(this.waterMesh);
    this.waterTime = 0;
  }

  buildTrees() {
    // Cây: thân + tán đều là AssetFactory của engine, đăng ký vào FoliageSystem.
    this.trees = [];
    const rng = (s) => { let v = s; return () => { v = (v * 16807) % 2147483647; return v / 2147483647; }; };
    const rand = rng(42);
    for (let i = 0; i < 60; i++) {
      const x = (rand() - 0.5) * (WORLD_SIZE - 16);
      const z = (rand() - 0.5) * (WORLD_SIZE - 16);
      const y = this.heightAt(x, z);
      if (y < -0.2) continue; // không trồng cây dưới hồ
      const s = 0.8 + rand() * 0.8;
      const tree = AssetFactory.create({
        name: `tree_${i}`,
        parts: [
          { name: 'trunk', shape: 'cylinder', size: [0.25 * s, 1.6 * s, 0.25 * s], position: [0, 0.8 * s, 0], color: 0x6b4a2f },
          { name: 'crown', shape: 'cone', size: [1.6 * s, 2.2 * s, 1.6 * s], position: [0, 2.4 * s, 0], color: 0x2f6b2a },
        ],
      }).root;
      tree.position.set(x, y, z);
      tree.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      this.scene.add(tree);
      this.foliage.registerTree(`tree_${i}`, { x, y, z });
      this.trees.push(tree);
    }
  }

  update(dt) {
    this.waterTime += dt;
    this.water.update(dt);
    this.atmosphere.update(dt);
    // Sóng nước theo WaterSystem.getHeightAt (CPU, không shader riêng).
    const pos = this.waterMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const wx = this.waterMesh.position.x + pos.getX(i);
      const wz = this.waterMesh.position.z + pos.getZ(i);
      pos.setY(i, this.water.getHeightAt('lake', wx, wz, this.waterTime));
    }
    pos.needsUpdate = true;
    this.waterMesh.geometry.computeVertexNormals();
  }
}
