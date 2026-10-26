// Địa hình — hàm độ cao nền + mesh đẩy đỉnh theo đúng hàm đó.
// TerrainSystem của engine chỉ cho độ cao biến dạng (xem world.js),
// nên mesh là mặt phẳng được đẩy đỉnh theo heightAt (engine + nền).
import * as THREE from 'three';
import { CONFIG } from './config.js';

export const WORLD_SIZE = CONFIG.world.size;

export function baseHeight(x, z) {
  return Math.sin(x * 0.08) * Math.cos(z * 0.06) * 1.6
    + Math.sin(x * 0.021 + 1.7) * Math.cos(z * 0.017) * 3.2;
}

export function buildTerrainMesh(scene, heightAt) {
  const size = CONFIG.world.size;
  const seg = CONFIG.world.terrainSegments;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const low = new THREE.Color(0x3d6b35), high = new THREE.Color(0x8a7a52), rock = new THREE.Color(0x6b6b6b);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = heightAt(x, z);
    pos.setY(i, h);
    const c = h > 4 ? rock : new THREE.Color().lerpColors(low, high, Math.max(0, Math.min(1, h / 4)));
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
