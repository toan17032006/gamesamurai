// engine/src/effects/decal-projector.ts — Tạo và chiếu các vết nứt, vết máu, vết cháy nổ lên bề mặt
import * as THREE from 'three';
import type { DecalSpec } from '../types/effects.types';

export interface DecalProjectorOptions {
  max?: number;
}

interface DecalEntry {
  mesh: THREE.Mesh;
  age: number;
  fadeTime: number;
  texture: THREE.Texture | null;
}

export class DecalProjector {
  readonly group = new THREE.Group();
  private decals: DecalEntry[] = [];
  private max: number;

  constructor(opts: DecalProjectorOptions = {}) {
    this.max = Math.max(1, opts.max ?? 32);
    this.group.name = 'decals';
  }

  get count(): number {
    return this.decals.length;
  }

  spawn(spec: DecalSpec, position: THREE.Vector3, normal?: THREE.Vector3): THREE.Mesh | null {
    return this.project(spec, position, normal);
  }

  private loadTextureSafe(url: string): THREE.Texture | null {
    if (typeof document === 'undefined' || !url) return null;
    try {
      const loader = new THREE.TextureLoader();
      let tex: THREE.Texture | null = null;
      tex = loader.load(url, undefined, undefined, () => {});
      return tex;
    } catch {
      return null;
    }
  }

  project(spec: DecalSpec, position: THREE.Vector3, normal?: THREE.Vector3): THREE.Mesh | null {
    const size = typeof spec.size === 'number' ? spec.size : spec.size[0];
    if (!(size > 0)) return null;

    if (this.decals.length >= this.max) {
      const oldest = this.decals.shift();
      if (oldest) this.removeEntry(oldest);
    }

    const geometry = new THREE.PlaneGeometry(size, size);
    const texture = this.loadTextureSafe(spec.texture);
    const material = new THREE.MeshBasicMaterial({
      color: texture ? 0xffffff : 0x333333,
      map: texture ?? undefined,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1;
    mesh.name = `decal_${spec.orient}`;

    if (spec.orient === 'surface' && normal && normal.lengthSq() > 1e-9) {
      const n = normal.clone().normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      mesh.position.copy(position).addScaledVector(n, 0.01);
    } else {
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = spec.rotation ?? 0;
      mesh.position.set(position.x, position.y + 0.01, position.z);
    }

    this.group.add(mesh);
    this.decals.push({ mesh, age: 0, fadeTime: spec.fadeTime ?? 5, texture });
    return mesh;
  }

  update(dt: number): void {
    for (const entry of [...this.decals]) {
      entry.age += dt;
      const t = entry.fadeTime > 0 ? entry.age / entry.fadeTime : 0;
      const mat = entry.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - t);
      if (t >= 1) {
        const idx = this.decals.indexOf(entry);
        if (idx !== -1) {
          this.decals.splice(idx, 1);
          this.removeEntry(entry);
        }
      }
    }
  }

  clear(): void {
    for (const d of this.decals) this.removeEntry(d);
    this.decals = [];
  }

  private removeEntry(entry: DecalEntry): void {
    entry.mesh.removeFromParent();
    entry.mesh.geometry.dispose();
    (entry.mesh.material as THREE.Material).dispose();
  }
}
