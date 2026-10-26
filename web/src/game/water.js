// Mặt nước — mesh phẳng được đẩy đỉnh mỗi frame theo
// WaterSystem.getHeightAt của engine (CPU, không shader riêng).
import * as THREE from 'three';
import { CONFIG } from './config.js';

export class WaterBody {
  constructor(scene) {
    const lake = CONFIG.world.lake;
    const geo = new THREE.PlaneGeometry(lake.size, lake.size, lake.segments, lake.segments);
    geo.rotateX(-Math.PI / 2);
    this.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: lake.color, transparent: true, opacity: 0.75, roughness: 0.2, metalness: 0.1,
    }));
    this.mesh.position.set(lake.x, lake.level, lake.z);
    scene.add(this.mesh);
    this.time = 0;
  }

  update(dt, waterSystem) {
    this.time += dt;
    const lake = CONFIG.world.lake;
    const pos = this.mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const wx = this.mesh.position.x + pos.getX(i);
      const wz = this.mesh.position.z + pos.getZ(i);
      pos.setY(i, waterSystem.getHeightAt(lake.id, wx, wz, this.time));
    }
    pos.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }
}
