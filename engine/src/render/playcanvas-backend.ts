// engine/src/render/playcanvas-backend.ts — Adapter RenderBackend cho PlayCanvas engine
import type {
  BackendCapabilities,
  RenderBackend,
  RenderSceneData,
} from '../types/renderer.types';

export class PlayCanvasBackend implements RenderBackend {
  readonly name = 'playcanvas';
  private canvas: HTMLCanvasElement | null = null;
  private isDisposed = false;
  private lastSceneData: RenderSceneData | null = null;
  private width = 800;
  private height = 600;
  private pixelRatio = 1;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    if (typeof window !== 'undefined' && (window as unknown as { pc?: unknown }).pc) {
      // PlayCanvas application initialization
    }
  }

  resize(width: number, height: number, pixelRatio: number): void {
    this.width = width;
    this.height = height;
    this.pixelRatio = pixelRatio;
  }

  capabilities(): BackendCapabilities {
    return {
      shadows: true,
      postFx: false,
      maxLights: 8,
      instancing: true,
      webgpuSupported: false,
      computeShaders: false,
    };
  }

  render(scene: RenderSceneData, _dt: number): void {
    if (this.isDisposed) return;
    this.lastSceneData = scene;
  }

  dispose(): void {
    this.isDisposed = true;
    this.canvas = null;
    this.lastSceneData = null;
  }

  getLastRenderedScene(): RenderSceneData | null {
    return this.lastSceneData;
  }
}
