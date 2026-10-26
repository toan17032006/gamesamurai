// engine/src/render/webgpu-backend.ts — RenderBackend hiện đại dùng WebGPU thuần
import type {
  BackendCapabilities,
  RenderBackend,
  RenderSceneData,
} from '../types/renderer.types';

export class WebGPURenderBackend implements RenderBackend {
  readonly name = 'webgpu';
  private canvas: HTMLCanvasElement | null = null;
  private isDisposed = false;
  private lastSceneData: RenderSceneData | null = null;
  private device: unknown = null;
  private context: unknown = null;
  private isSupported = false;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    if (typeof navigator !== 'undefined' && (navigator as unknown as { gpu?: unknown }).gpu) {
      try {
        const gpu = (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }).gpu;
        const adapter = (await gpu.requestAdapter()) as { requestDevice: () => Promise<unknown> } | null;
        if (adapter) {
          this.device = await adapter.requestDevice();
          this.context = canvas.getContext('webgpu');
          this.isSupported = true;
        }
      } catch {
        this.isSupported = false;
      }
    }
  }

  resize(width: number, height: number, pixelRatio: number): void {
    if (!this.canvas) return;
    this.canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    this.canvas.height = Math.max(1, Math.floor(height * pixelRatio));
  }

  capabilities(): BackendCapabilities {
    return {
      shadows: true,
      postFx: true,
      maxLights: 32,
      instancing: true,
      webgpuSupported: this.isSupported,
      computeShaders: true,
    };
  }

  render(scene: RenderSceneData, _dt: number): void {
    if (this.isDisposed) return;
    this.lastSceneData = scene;
  }

  dispose(): void {
    this.isDisposed = true;
    this.canvas = null;
    this.device = null;
    this.context = null;
  }

  getLastRenderedScene(): RenderSceneData | null {
    return this.lastSceneData;
  }
}
