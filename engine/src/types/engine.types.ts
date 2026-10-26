// engine/src/types/engine.types.ts — Hợp đồng chính cho toàn bộ facade GameEngine
import type * as THREE from 'three';
import type { ParsedAsset, AssetManifestEntry, AssetCategory, RigKind } from './asset.types';
import type { AssetAnalysisOptions, AssetAnalysisReport } from '../asset-parser/asset-analyzer.js';
import type { SocketBinding, LODLevel, PivotSpec, ZoomSpec } from './transform.types';
import type { PhysicsBody, HitResult } from './physics.types';
import type { EmitterConfig, DecalSpec, GraphicsModePreset, GraphicsMode } from './effects.types';

export type FpsCap = 30 | 60 | 120 | 144 | 240 | 500 | 0; // 0 = uncapped

export interface EngineLoopStats {
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
  entitiesCount?: number;
  physicsBodiesCount?: number;
  activeParticlesCount?: number;
}

export interface EngineInitOptions {
  canvas: HTMLCanvasElement;
  fpsCap?: FpsCap;
  graphicsMode?: GraphicsMode;
  preferWebGPU?: boolean;
  backendName?: 'three' | 'babylon' | 'playcanvas' | 'raw' | 'webgpu';
  enableAudio?: boolean;
  dracoDecoderPath?: string;
}

export interface CharacterBuildSpec {
  baseAssetId: string;
  name?: string;
  outfits?: SocketBinding[];
  weapons?: SocketBinding[];
  accessories?: SocketBinding[];
  rig?: RigKind;
  scale?: number;
  animations?: { name: string; clip: THREE.AnimationClip }[];
}

export interface AssetCombinationSpec {
  baseModel: THREE.Object3D | string;
  attachments: Array<{
    asset: THREE.Object3D | string;
    socket: string;
    offset?: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number };
  }>;
  mergeMeshes?: boolean;
  generateLODs?: boolean;
  normalizeScale?: boolean;
}

export interface Engine {
  readonly canvas: HTMLCanvasElement | null;
  init(opts: EngineInitOptions): Promise<void>;
  dispose(): void;

  // --- assets ---
  loadAsset(path: string, opts?: { category?: AssetCategory; tags?: string[]; mtlPath?: string }): Promise<ParsedAsset>;
  analyzeAsset(path: string, opts?: AssetAnalysisOptions): AssetAnalysisReport | undefined;
  instantiate(assetId: string): THREE.Object3D | null;
  getManifestEntry(path: string): AssetManifestEntry | undefined;

  // --- transform / zoom / combiner ---
  applyPivot(obj: THREE.Object3D, spec: PivotSpec): void;
  applyScale(obj: THREE.Object3D, targetHeight?: number, factor?: number): number;
  zoomAsset(obj: THREE.Object3D, opts: ZoomSpec): number;
  bindSocket(rig: THREE.Object3D, binding: SocketBinding): boolean;
  setupLOD(lod: THREE.LOD, levels: LODLevel[]): void;

  // --- physics ---
  addBody(body: PhysicsBody): void;
  removeBody(id: string): void;
  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): HitResult;
  stepPhysics(dt: number): void;

  // --- effects / renderer ---
  spawnEmitter(cfg: EmitterConfig, at: THREE.Vector3): string;
  stopEmitter(id: string): void;
  projectDecal(spec: DecalSpec, position: THREE.Vector3, normal?: THREE.Vector3): void;
  applyGraphicsMode(mode: GraphicsMode): void;
  getGraphicsPreset(mode: GraphicsMode): GraphicsModePreset;
  setFpsCap(cap: FpsCap): void;
  getStats(): EngineLoopStats;
}
