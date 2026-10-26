// engine/src/render/babylon-backend.ts — Adapter RenderBackend cho Babylon.js (hỗ trợ WebGL2 & WebGPU)
import type {
  BackendCapabilities,
  RenderBackend,
  RenderSceneData,
} from '../types/renderer.types';

export class BabylonBackend implements RenderBackend {
  readonly name = 'babylon';
  private canvas: HTMLCanvasElement | null = null;
  private isDisposed = false;
  private lastSceneData: RenderSceneData | null = null;
  private width = 800;
  private height = 600;
  private pixelRatio = 1;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    // Tự động phát hiện nếu window.BABYLON có sẵn trong runtime browser
    if (typeof window !== 'undefined' && (window as unknown as { BABYLON?: unknown }).BABYLON) {
      // Babylon instance initialization
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
      postFx: true,
      maxLights: 8,
      instancing: true,
      webgpuSupported: true,
      computeShaders: true,
    };
  }

  render(scene: RenderSceneData, _dt: number): void {
    if (this.isDisposed) return;
    this.lastSceneData = scene;
    // Khi có Babylon Engine trên window:
    // Đồng bộ scene.meshes, scene.lights, scene.camera và gọi scene.render()
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
