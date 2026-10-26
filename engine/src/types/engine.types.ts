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

// ============================================================================
// Core Result, Error & Extensibility Contracts
// ============================================================================

export interface EngineError {
  code: string;
  message: string;
  subsystem?: string;
  stack?: string;
  fatal?: boolean;
  context?: Record<string, unknown>;
}

export type EngineResult<T, E = EngineError> =
  | { ok: true; value: T; meta?: Record<string, unknown> }
  | { ok: false; error: E; context?: string };

export function engineOk<T>(value: T, meta?: Record<string, unknown>): EngineResult<T, never> {
  return { ok: true, value, meta };
}

export function engineErr<E = EngineError>(error: E, context?: string): EngineResult<never, E> {
  return { ok: false, error, context };
}

export interface TransformChain<T = unknown> {
  target: T;
  translate(x: number, y: number, z: number): TransformChain<T>;
  rotate(yaw: number, pitch: number, roll: number): TransformChain<T>;
  scale(factor: number): TransformChain<T>;
  setPivot(pivotX: number, pivotY: number, pivotZ: number): TransformChain<T>;
  apply(): T;
}

export interface CustomFieldRegistry<T = Record<string, unknown>> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K]): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  entries(): [string, unknown][];
}

export interface EngineExtensionSlot<T = unknown> {
  id: string;
  version: string;
  data: T;
  enabled: boolean;
  onAttach?: (entityId: string) => void;
  onDetach?: (entityId: string) => void;
  onUpdate?: (deltaTime: number) => void;
}

export interface Component<TData = Record<string, unknown>> {
  id: string;
  type: string;
  enabled: boolean;
  data: TData;
}

export interface IEngineEntity<
  TProps = Record<string, unknown>,
  TExtension = unknown
> {
  uid: string;
  name: string;
  layerMask: number;
  components: Map<string, Component>;
  customProps: TProps;
  extensionSlot?: EngineExtensionSlot<TExtension>;
}

export type EngineEntity<TProps = Record<string, unknown>, TExtension = unknown> = IEngineEntity<TProps, TExtension>;

export interface SystemLifecycle {
  init?(): Promise<void> | void;
  update?(deltaTime: number): void;
  fixedUpdate?(fixedDeltaTime: number): void;
  render?(interpolation: number): void;
  dispose?(): void;
}

