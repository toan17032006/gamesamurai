// engine/src/physics/destruction-engine.ts — Đổ vỡ, rơi nát, vỡ vụn & mô phỏng mảnh vụn (Destruction Physics)
import * as THREE from 'three';
import type { DestructionShard } from '../types/physics.types';
import { computeBounds } from '../transformer/bounds-calculator';

export class DestructionEngine {
  private activeShards: Array<{
    shard: DestructionShard;
    mesh: THREE.Mesh;
    elapsed: number;
  }> = [];

  shatterMesh(
    mesh: THREE.Mesh,
    impactPoint: THREE.Vector3,
    force: number,
    numPieces = 8,
  ): THREE.Group {
    const parentGroup = new THREE.Group();
    parentGroup.name = `${mesh.name}_shattered`;
    parentGroup.position.copy(mesh.position);
    parentGroup.rotation.copy(mesh.rotation);
    parentGroup.scale.copy(mesh.scale);

    const bounds = computeBounds(mesh);
    const size = bounds.size;

    for (let i = 0; i < numPieces; i++) {
      const pieceSizeX = (size[0] / Math.cbrt(numPieces)) * (0.6 + Math.random() * 0.8);
      const pieceSizeY = (size[1] / Math.cbrt(numPieces)) * (0.6 + Math.random() * 0.8);
      const pieceSizeZ = (size[2] / Math.cbrt(numPieces)) * (0.6 + Math.random() * 0.8);

      const shardGeo = new THREE.BoxGeometry(pieceSizeX, pieceSizeY, pieceSizeZ);
      const shardMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const shardMesh = new THREE.Mesh(shardGeo, shardMat);

      const offsetX = (Math.random() - 0.5) * size[0] * 0.8;
      const offsetY = (Math.random() - 0.5) * size[1] * 0.8;
      const offsetZ = (Math.random() - 0.5) * size[2] * 0.8;
      shardMesh.position.set(offsetX, offsetY, offsetZ);

      const dir = shardMesh.position.clone().sub(impactPoint).normalize();
      if (dir.lengthSq() < 1e-4) dir.set(Math.random() - 0.5, 1, Math.random() - 0.5).normalize();

      const speed = (0.5 + Math.random()) * Math.min(20, force);
      const velocity = dir.multiplyScalar(speed);
      velocity.y += Math.random() * 3 + 1;

      const shardData: DestructionShard = {
        id: `shard_${Date.now()}_${i}`,
        meshId: mesh.name,
        position: { x: shardMesh.position.x, y: shardMesh.position.y, z: shardMesh.position.z },
        velocity: { x: velocity.x, y: velocity.y, z: velocity.z },
        angularVelocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10,
        },
        mass: 1.0 / numPieces,
        lifetime: 4.0 + Math.random() * 2.0,
      };

      parentGroup.add(shardMesh);
      this.activeShards.push({ shard: shardData, mesh: shardMesh, elapsed: 0 });
    }

    return parentGroup;
  }

  step(dt: number, groundY = 0): void {
    const gravity = -9.81;

    for (let i = this.activeShards.length - 1; i >= 0; i--) {
      const entry = this.activeShards[i];
      entry.elapsed += dt;

      if (entry.elapsed >= entry.shard.lifetime) {
        entry.mesh.removeFromParent();
        entry.mesh.geometry.dispose();
        this.activeShards.splice(i, 1);
        continue;
      }

      // Tích phân chuyển động
      entry.shard.velocity.y += gravity * dt;
      entry.mesh.position.x += entry.shard.velocity.x * dt;
      entry.mesh.position.y += entry.shard.velocity.y * dt;
      entry.mesh.position.z += entry.shard.velocity.z * dt;

      // Xoay
      entry.mesh.rotation.x += entry.shard.angularVelocity.x * dt;
      entry.mesh.rotation.y += entry.shard.angularVelocity.y * dt;
      entry.mesh.rotation.z += entry.shard.angularVelocity.z * dt;

      // Va chạm đất
      if (entry.mesh.position.y <= groundY) {
        entry.mesh.position.y = groundY;
        entry.shard.velocity.y = -entry.shard.velocity.y * 0.3;
        entry.shard.velocity.x *= 0.7;
        entry.shard.velocity.z *= 0.7;
        entry.shard.angularVelocity.x *= 0.6;
        entry.shard.angularVelocity.y *= 0.6;
        entry.shard.angularVelocity.z *= 0.6;
      }
    }
  }

  get activeCount(): number {
    return this.activeShards.length;
  }

  clear(): void {
    for (const entry of this.activeShards) {
      entry.mesh.removeFromParent();
    }
    this.activeShards = [];
  }
}
