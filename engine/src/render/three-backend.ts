// engine/src/render/three-backend.ts — RenderBackend dùng Three.js (WebGLRenderer nội bộ)
import * as THREE from 'three';
import type {
  BackendCapabilities,
  CameraData,
  GeometryData,
  MaterialData,
  MeshData,
  PointsData,
  RenderBackend,
  RenderSceneData,
} from '../types/renderer.types';

export function computeGeometryKey(g: GeometryData): string {
  const p = g.positions;
  const n = g.normals;
  const idx = g.indices;
  const sample = (a: ArrayLike<number>): number => {
    let h = 0x811c9dc5;
    const step = Math.max(1, Math.floor(a.length / 16));
    for (let i = 0; i < a.length; i += step) {
      h ^= a[i] as number;
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  };
  return `g${p.length}_${n.length}_${idx ? idx.length : 0}_${sample(p)}_${sample(n)}${idx ? `_${sample(idx)}` : ''}`;
}

export function computeMaterialKey(m: MaterialData): string {
  return `m${m.color}_${m.roughness}_${m.metalness}_${m.textureUri ?? '-'}`;
}

export function setCameraFromData(camera: THREE.PerspectiveCamera, data: CameraData): void {
  camera.matrixAutoUpdate = false;
  camera.matrixWorldAutoUpdate = false;
  camera.matrixWorld.fromArray(data.view).invert();
  camera.matrixWorldInverse.fromArray(data.view);
  camera.projectionMatrix.fromArray(data.projection);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

export class ThreeBackend implements RenderBackend {
  readonly name = 'three';

  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(66, 1, 0.1, 2000);
  private ambient = new THREE.AmbientLight(0xffffff, 0.6);
  private directional = new THREE.DirectionalLight(0xffffff, 1);
  private geoCache = new Map<string, THREE.BufferGeometry>();
  private matCache = new Map<string, THREE.MeshStandardMaterial>();
  private meshPool = new Map<string, THREE.Mesh[]>();
  private usedMeshes = new Set<THREE.Mesh>();
  private points: THREE.Points | null = null;
  private pointsCapacity = 0;
  private textureCache = new Map<string, THREE.Texture>();
  private textureLoader: THREE.TextureLoader | null = null;
  private disposed = false;

  init(canvas: HTMLCanvasElement): void {
    if (this.renderer) return;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.add(this.ambient, this.directional, this.directional.target);
    this.textureLoader = new THREE.TextureLoader();
  }

  resize(width: number, height: number, pixelRatio: number): void {
    if (!this.renderer) return;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = height === 0 ? 1 : width / height;
    this.camera.updateProjectionMatrix();
  }

  capabilities(): BackendCapabilities {
    return {
      shadows: true,
      postFx: true,
      maxLights: 16,
      instancing: true,
      webgpuSupported: false,
      computeShaders: false,
    };
  }

  render(scene: RenderSceneData, _dt: number): void {
    if (!this.renderer || this.disposed) return;
    this.syncLights(scene);
    setCameraFromData(this.camera, scene.camera);
    this.usedMeshes.clear();
    for (const meshData of scene.meshes) this.syncMesh(meshData);

    for (const meshes of this.meshPool.values()) {
      for (const mesh of meshes) {
        mesh.visible = this.usedMeshes.has(mesh);
      }
    }
    this.syncPoints(scene.points);
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const g of this.geoCache.values()) g.dispose();
    for (const m of this.matCache.values()) m.dispose();
    for (const t of this.textureCache.values()) t.dispose();
    this.geoCache.clear();
    this.matCache.clear();
    this.textureCache.clear();
    this.meshPool.clear();
    this.usedMeshes.clear();
    this.renderer?.dispose();
    this.renderer = null;
  }

  private syncLights(scene: RenderSceneData): void {
    const amb = scene.lights.ambient;
    this.ambient.color.setHex(amb.color);
    this.ambient.intensity = amb.intensity;

    const dir = scene.lights.directional;
    this.directional.color.setHex(dir.color);
    this.directional.intensity = dir.intensity;
    this.directional.position.set(-dir.direction[0] * 100, -dir.direction[1] * 100, -dir.direction[2] * 100);
    this.directional.target.position.set(0, 0, 0);
    this.directional.target.updateMatrixWorld();
  }

  private syncMesh(m: MeshData): void {
    const geoKey = computeGeometryKey(m.geometry);
    let geo = this.geoCache.get(geoKey);
    if (!geo) {
      geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(m.geometry.positions, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(m.geometry.normals, 3));
      if (m.geometry.uvs) geo.setAttribute('uv', new THREE.BufferAttribute(m.geometry.uvs, 2));
      if (m.geometry.indices) geo.setIndex(new THREE.BufferAttribute(m.geometry.indices, 1));
      this.geoCache.set(geoKey, geo);
    }

    const matKey = computeMaterialKey(m.material);
    let mat = this.matCache.get(matKey);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({
        color: m.material.color,
        roughness: m.material.roughness,
        metalness: m.material.metalness,
      });
      if (m.material.textureUri && this.textureLoader) {
        let tex = this.textureCache.get(m.material.textureUri);
        if (!tex) {
          tex = this.textureLoader.load(m.material.textureUri);
          this.textureCache.set(m.material.textureUri, tex);
        }
        mat.map = tex;
      }
      this.matCache.set(matKey, mat);
    }

    const poolKey = `${geoKey}|${matKey}`;
    let pool = this.meshPool.get(poolKey);
    if (!pool) {
      pool = [];
      this.meshPool.set(poolKey, pool);
    }

    let mesh = pool.find((candidate) => !this.usedMeshes.has(candidate));
    if (!mesh) {
      mesh = new THREE.Mesh(geo, mat);
      mesh.matrixAutoUpdate = false;
      this.scene.add(mesh);
      pool.push(mesh);
    }

    this.usedMeshes.add(mesh);
    mesh.visible = true;
    mesh.matrix.fromArray(m.transform);
    mesh.matrixWorldNeedsUpdate = true;
  }

  private syncPoints(pts: PointsData | null): void {
    if (!pts || pts.count === 0) {
      if (this.points) this.points.visible = false;
      return;
    }

    if (!this.points || this.pointsCapacity < pts.count) {
      if (this.points) {
        this.points.removeFromParent();
        this.points.geometry.dispose();
        (this.points.material as THREE.Material).dispose();
      }
      this.pointsCapacity = Math.max(pts.count, 256);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.pointsCapacity * 3), 3));
      const mat = new THREE.PointsMaterial({ size: pts.size ?? 3, sizeAttenuation: false, color: 0xffffff });
      this.points = new THREE.Points(geo, mat);
      this.scene.add(this.points);
    }

    this.points.visible = true;
    const posAttr = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const slice = pts.positions.subarray(0, pts.count * 3);
    (posAttr.array as Float32Array).set(slice);
    posAttr.needsUpdate = true;
    this.points.geometry.setDrawRange(0, pts.count);
  }
}
