/**
 * @file game-engine.ts
 * @module @aetheria/engine
 * @description Master GameEngine facade coordinating rendering, assets, transforms,
 * physics, effects, audio, input, and procedural synthesis.
 */

import * as THREE from 'three';
import type {
  Engine,
  EngineInitOptions,
  EngineLoopStats,
  FpsCap,
} from './types/engine.types.js';
import type { ParsedAsset, AssetManifestEntry, AssetCategory } from './types/asset.types.js';
import type { SocketBinding, LODLevel, PivotSpec, ZoomSpec } from './types/transform.types.js';
import type { PhysicsBody, HitResult } from './types/physics.types.js';
import type { EmitterConfig, DecalSpec, GraphicsModePreset, GraphicsMode } from './types/effects.types.js';

import { Ticker } from './core/loop.js';
import { EventBus } from './core/events.js';
import { AssetParser } from './asset-parser/index.js';
import { analyzeAsset } from './asset-parser/asset-analyzer.js';
import type { AssetAnalysisOptions, AssetAnalysisReport } from './asset-parser/asset-analyzer.js';
import { Scaler } from './transformer/scaler.js';
import { PivotAdjuster } from './transformer/pivot-adjuster.js';
import { GeometryOptimizer } from './transformer/geometry-optimizer.js';
import { SocketBinder } from './combiner/socket-binder.js';
import { PhysicsWorld } from './physics/index.js';
import { ParticleSystem } from './effects/particle-system.js';
import { DecalProjector } from './effects/decal-projector.js';
import { PostProcessing } from './effects/post-processing.js';
import { GRAPHICS_PRESETS } from './renderer/graphics-modes.js';
import { AssetCache } from './memory/asset-cache.js';
import { ObjectPool } from './memory/object-pool.js';
import { MemoryDisposer } from './memory/memory-disposer.js';
import { InputMap } from './input/input-map.js';
import { AudioBus } from './audio/audio-bus.js';

export class GameEngine implements Engine {
  public canvas: HTMLCanvasElement | null = null;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer | null = null;

  // Subsystems
  public ticker: Ticker;
  public events: EventBus;
  public assetParser: AssetParser;
  public physics: PhysicsWorld;
  public particles: ParticleSystem;
  public decals: DecalProjector;
  public postFx: PostProcessing | null = null;
  public assetCache: AssetCache;
  public objectPool: ObjectPool;
  public input: InputMap;
  public audio: AudioBus;

  private graphicsMode: GraphicsMode = 'balanced';
  private manifests = new Map<string, AssetManifestEntry>();
  private activeEmitters = new Map<string, string>();
  private isInitialized = false;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    this.events = new EventBus();
    this.assetParser = new AssetParser();
    this.physics = new PhysicsWorld();
    this.particles = new ParticleSystem();
    this.decals = new DecalProjector();
    this.assetCache = new AssetCache();
    this.objectPool = new ObjectPool();
    this.input = new InputMap();
    this.audio = new AudioBus();

    this.scene.add(this.particles.group);
    this.scene.add(this.decals.group);

    this.ticker = new Ticker({
      update: (dt) => {
        this.stepPhysics(dt);
        this.particles.update(dt);
        this.decals.update(dt);
      },
      render: () => {
        this.render();
        this.input.endFrame();
      },
      fpsCap: 60,
    });
  }

  public async init(opts: EngineInitOptions): Promise<void> {
    this.canvas = opts.canvas;
    const fps = opts.fpsCap ?? 60;
    this.setFpsCap(fps);

    if (this.canvas) {
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          powerPreference: 'high-performance',
        });
        this.renderer.setSize(this.canvas.clientWidth || 800, this.canvas.clientHeight || 600, false);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.postFx = new PostProcessing(this.renderer, this.scene, this.camera);
      } catch {
        // Fallback for headless testing environments where WebGL is not available
        this.renderer = null;
      }
    }

    if (opts.graphicsMode) {
      this.applyGraphicsMode(opts.graphicsMode);
    }

    this.isInitialized = true;
    this.ticker.start();
  }

  public dispose(): void {
    this.ticker.stop();
    this.particles.dispose();
    this.decals.clear();
    this.physics.clear();
    this.assetCache.clear();
    this.objectPool.clear();
    this.audio.clear();

    if (this.postFx) {
      this.postFx.dispose();
      this.postFx = null;
    }

    if (this.renderer) {
      MemoryDisposer.disposeObject(this.scene);
      this.renderer.dispose();
      this.renderer = null;
    }

    this.isInitialized = false;
  }

  // --- Assets ---
  public async loadAsset(
    path: string,
    opts: { category?: AssetCategory; tags?: string[]; mtlPath?: string } = {}
  ): Promise<ParsedAsset> {
    const cached = this.assetCache.get(path);
    if (cached) return cached;

    const parsed = await this.assetParser.parse(path, opts);
    this.assetCache.set(path, parsed);

    const manifest: AssetManifestEntry = {
      id: path,
      path,
      name: parsed.metadata?.name || path,
      format: parsed.format,
      category: opts.category ?? parsed.category,
      rig: parsed.metadata?.rig,
      tags: opts.tags ?? [],
      bounds: parsed.bounds,
      sizeBytes: parsed.sizeBytes,
    };
    this.manifests.set(path, manifest);

    return parsed;
  }

  /**
   * Phân tích một tài sản đã nạp — ngân sách hiệu năng, phát hiện lỗi, gợi ý LOD.
   */
  public analyzeAsset(path: string, opts?: AssetAnalysisOptions): AssetAnalysisReport | undefined {
    const asset = this.assetCache.get(path);
    if (!asset) return undefined;
    return analyzeAsset(asset, opts);
  }

  public instantiate(assetId: string): THREE.Object3D | null {
    const asset = this.assetCache.get(assetId);
    const target = asset?.model ?? asset?.scene;
    if (!target) return null;
    return target.clone(true);
  }

  public getManifestEntry(path: string): AssetManifestEntry | undefined {
    return this.manifests.get(path);
  }

  // --- Transform / Zoom / Combiner ---
  public applyPivot(obj: THREE.Object3D, spec: PivotSpec): void {
    PivotAdjuster.apply(obj, spec);
  }

  public applyScale(obj: THREE.Object3D, targetHeight?: number, factor?: number): number {
    return Scaler.applyScale(obj, targetHeight, factor);
  }

  public zoomAsset(obj: THREE.Object3D, opts: ZoomSpec): number {
    return Scaler.zoomAsset(obj, opts);
  }

  public bindSocket(rig: THREE.Object3D, binding: SocketBinding): boolean {
    const socketName = binding.socket || binding.boneName || '';
    const parentSocket = rig.getObjectByName(`socket_${socketName}`) || rig.getObjectByName(socketName);
    if (!parentSocket) return false;

    let attachment = binding.attachment;
    if (!attachment && binding.assetId) {
      attachment = this.instantiate(binding.assetId) ?? undefined;
    }
    if (!attachment) return false;

    SocketBinder.attachToSocket(parentSocket, attachment, {
      position: binding.offset?.position,
      rotation: binding.offset?.rotation,
      scale: binding.offset?.scale,
    });
    return true;
  }

  public setupLOD(lod: THREE.LOD, levels: LODLevel[]): void {
    for (const lvl of levels) {
      if (lvl.object) {
        lod.addLevel(lvl.object, lvl.distance);
      }
    }
  }

  // --- Physics ---
  public addBody(body: PhysicsBody): void {
    this.physics.addBody(body);
  }

  public removeBody(id: string): void {
    this.physics.removeBody(id);
  }

  public raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): HitResult {
    return this.physics.raycast(origin, dir, maxDist);
  }

  public stepPhysics(dt: number): void {
    this.physics.step(dt);
  }

  // --- Effects / Renderer ---
  public spawnEmitter(cfg: EmitterConfig, at: THREE.Vector3): string {
    const emitter = this.particles.createEmitter(cfg);
    emitter.setPosition(at.x, at.y, at.z);
    this.activeEmitters.set(emitter.id, emitter.id);
    return emitter.id;
  }

  public stopEmitter(id: string): void {
    this.particles.removeEmitter(id);
    this.activeEmitters.delete(id);
  }

  public projectDecal(spec: DecalSpec, position: THREE.Vector3, normal?: THREE.Vector3): void {
    this.decals.spawn(spec, position, normal);
  }

  public applyGraphicsMode(mode: GraphicsMode): void {
    this.graphicsMode = mode;
    const preset = GRAPHICS_PRESETS[mode];
    if (!preset) return;

    if (this.renderer) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.quality.pixelRatioCap));
      this.renderer.shadowMap.enabled = preset.quality.shadowMapSize > 0;
    }
  }

  public getGraphicsPreset(mode: GraphicsMode): GraphicsModePreset {
    return GRAPHICS_PRESETS[mode];
  }

  public setFpsCap(cap: FpsCap): void {
    this.ticker.setFpsCap(cap);
  }

  public getStats(): EngineLoopStats {
    const loopStats = this.ticker.stats;
    let triangles = 0;
    let drawCalls = 0;

    if (this.renderer?.info) {
      triangles = this.renderer.info.render.triangles;
      drawCalls = this.renderer.info.render.calls;
    }

    return {
      fps: loopStats.fps,
      frameMs: loopStats.frameMs,
      drawCalls,
      triangles,
      physicsBodiesCount: this.physics.getAllBodies().length,
      activeParticlesCount: this.particles.getActiveParticleCount(),
    };
  }

  private render(): void {
    if (!this.renderer) return;

    if (this.postFx) {
      this.postFx.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

/**
 * Factory helper to instantiate and initialize a GameEngine.
 */
export async function createEngine(opts?: EngineInitOptions): Promise<GameEngine> {
  const engine = new GameEngine();
  if (opts) {
    await engine.init(opts);
  }
  return engine;
}
