// engine/src/memory/memory-disposer.ts — Giải phóng RAM/VRAM, thu gom rác thủ công & ước tính bộ nhớ
import * as THREE from 'three';
import type { ParsedAsset } from '../types/asset.types';

export function estimateGeometryMemory(geometry: THREE.BufferGeometry): number {
  let bytes = 0;
  for (const name of Object.keys(geometry.attributes)) {
    const attr = geometry.getAttribute(name);
    bytes += attr.array.byteLength;
  }
  if (geometry.index) bytes += geometry.index.array.byteLength;
  return bytes > 0 ? bytes : 0;
}

export function estimateTextureMemory(texture: THREE.Texture): number {
  const img = texture.image as
    | { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number }
    | undefined
    | null;
  if (!img) return 0;
  const width = img.width ?? img.naturalWidth ?? 0;
  const height = img.height ?? img.naturalHeight ?? 0;
  return width * height * 4;
}

const TEXTURE_PROPS: readonly string[] = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'emissiveMap',
  'alphaMap',
  'bumpMap',
  'displacementMap',
  'envMap',
  'specularMap',
  'lightMap',
  'sheenColorMap',
  'sheenRoughnessMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'iridescenceMap',
  'anisotropyMap',
  'transmissionMap',
  'thicknessMap',
];

export function estimateObjectMemory(root: THREE.Object3D): number {
  let bytes = 0;
  const seenGeo = new Set<string>();
  const seenTex = new Set<string>();
  const seenMat = new Set<string>();

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.geometry && !seenGeo.has(mesh.geometry.uuid)) {
      seenGeo.add(mesh.geometry.uuid);
      bytes += estimateGeometryMemory(mesh.geometry);
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat || seenMat.has(mat.uuid)) continue;
      seenMat.add(mat.uuid);
      const props = mat as unknown as Record<string, THREE.Texture | undefined | null>;
      for (const prop of TEXTURE_PROPS) {
        const tex = props[prop];
        if (tex && !seenTex.has(tex.uuid)) {
          seenTex.add(tex.uuid);
          bytes += estimateTextureMemory(tex);
        }
      }
    }
  });
  return bytes;
}

export function estimateAssetMemory(asset: ParsedAsset): number {
  return estimateObjectMemory(asset.scene);
}

export class MemoryDisposer {
  private tracked = new Set<THREE.Object3D>();
  private disposedBytes = 0;

  track(root: THREE.Object3D): void {
    this.tracked.add(root);
  }

  untrack(root: THREE.Object3D): void {
    this.tracked.delete(root);
  }

  usedMemory(): number {
    let total = 0;
    for (const obj of this.tracked) total += estimateObjectMemory(obj);
    return total;
  }

  get totalDisposedBytes(): number {
    return this.disposedBytes;
  }

  dispose(root: THREE.Object3D, opts: { disposeTextures?: boolean } = {}): number {
    const freed = estimateObjectMemory(root);
    const seenGeo = new Set<string>();
    const seenMat = new Set<string>();
    const seenTex = new Set<string>();

    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      if (mesh.geometry && !seenGeo.has(mesh.geometry.uuid)) {
        seenGeo.add(mesh.geometry.uuid);
        mesh.geometry.dispose();
      }

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if (!mat || seenMat.has(mat.uuid)) continue;
        seenMat.add(mat.uuid);

        if (opts.disposeTextures) {
          const props = mat as unknown as Record<string, THREE.Texture | undefined | null>;
          for (const prop of TEXTURE_PROPS) {
            const tex = props[prop];
            if (tex && !seenTex.has(tex.uuid)) {
              seenTex.add(tex.uuid);
              tex.dispose();
            }
          }
        }
        mat.dispose();
      }
    });

    this.tracked.delete(root);
    this.disposedBytes += freed;
    root.removeFromParent();
    return freed;
  }

  static disposeObject(root: THREE.Object3D, opts: { disposeTextures?: boolean } = {}): number {
    return new MemoryDisposer().dispose(root, opts);
  }

  clear(): void {
    for (const obj of Array.from(this.tracked)) {
      this.dispose(obj);
    }
    this.tracked.clear();
  }
}
