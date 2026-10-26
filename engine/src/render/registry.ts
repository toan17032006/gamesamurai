// engine/src/render/registry.ts — Quản lý và chuyển đổi linh hoạt giữa các Backend (Three.js, Babylon, PlayCanvas, Raw, WebGPU)
import type { RenderBackend } from '../types/renderer.types';
import { ThreeBackend } from './three-backend';
import { RawWebGL2Backend } from './raw-backend';
import { BabylonBackend } from './babylon-backend';
import { PlayCanvasBackend } from './playcanvas-backend';
import { WebGPURenderBackend } from './webgpu-backend';

export type BackendFactory = () => RenderBackend;

const registry = new Map<string, BackendFactory>([
  ['three', () => new ThreeBackend()],
  ['raw', () => new RawWebGL2Backend()],
  ['babylon', () => new BabylonBackend()],
  ['playcanvas', () => new PlayCanvasBackend()],
  ['webgpu', () => new WebGPURenderBackend()],
]);

export function registerBackend(name: string, factory: BackendFactory): void {
  registry.set(name, factory);
}

export function unregisterBackend(name: string): boolean {
  if (name === 'three' || name === 'raw') return false;
  return registry.delete(name);
}

export function getBackend(name: string): RenderBackend {
  const factory = registry.get(name);
  if (!factory) {
    throw new Error(`getBackend('${name}'): backend chưa đăng ký. Đã có: ${getBackendNames().join(', ')}`);
  }
  return factory();
}

export function getBackendNames(): string[] {
  return Array.from(registry.keys());
}

export function isBackendRegistered(name: string): boolean {
  return registry.has(name);
}

export function autoSelectBackend(preferWebGPU = false): RenderBackend {
  if (preferWebGPU && typeof navigator !== 'undefined' && (navigator as unknown as { gpu?: unknown }).gpu) {
    return getBackend('webgpu');
  }
  return getBackend('three');
}

export class RenderBackendRegistry {
  private activeName = 'three';

  getAvailableBackends(): string[] {
    return getBackendNames();
  }

  getActiveBackendName(): string {
    return this.activeName;
  }

  setActiveBackend(name: string): void {
    if (!isBackendRegistered(name)) {
      throw new Error(`Backend ${name} not found`);
    }
    this.activeName = name;
  }

  getActiveBackend(): RenderBackend {
    return getBackend(this.activeName);
  }

  getCapabilities(name: string) {
    return getBackend(name).capabilities();
  }
}

export function createDefaultRegistry(): RenderBackendRegistry {
  return new RenderBackendRegistry();
}

