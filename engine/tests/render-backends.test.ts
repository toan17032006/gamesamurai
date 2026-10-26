import { describe, it, expect } from 'vitest';
import { RenderBackendRegistry, createDefaultRegistry } from '../src/render/registry.js';
import { ThreeBackend } from '../src/render/three-backend.js';
import { BabylonBackend } from '../src/render/babylon-backend.js';
import { PlayCanvasBackend } from '../src/render/playcanvas-backend.js';
import { RawWebGL2Backend } from '../src/render/raw-backend.js';
import { WebGPURenderBackend } from '../src/render/webgpu-backend.js';

describe('Render Backend Registry Engine Tests', () => {
  it('registers all 5 backends: Three, Babylon, PlayCanvas, Raw, WebGPU', () => {
    const registry = createDefaultRegistry();
    const available = registry.getAvailableBackends();

    expect(available).toContain('three');
    expect(available).toContain('babylon');
    expect(available).toContain('playcanvas');
    expect(available).toContain('raw');
    expect(available).toContain('webgpu');
  });

  it('reports distinct capabilities per backend', () => {
    const registry = createDefaultRegistry();

    const threeCaps = registry.getCapabilities('three');
    expect(threeCaps?.instancing).toBe(true);

    const webgpuCaps = registry.getCapabilities('webgpu');
    expect(webgpuCaps?.computeShaders).toBe(true);

    const rawCaps = registry.getCapabilities('raw');
    expect(rawCaps?.instancing).toBe(true);
  });

  it('switches active backend dynamically', () => {
    const registry = createDefaultRegistry();
    expect(registry.getActiveBackendName()).toBe('three');

    registry.setActiveBackend('raw');
    expect(registry.getActiveBackendName()).toBe('raw');
  });

  it('creates backend scene representation cleanly', () => {
    const registry = createDefaultRegistry();
    const backend = registry.getActiveBackend();

    const caps = backend.capabilities();
    expect(caps).toBeDefined();
    expect(caps.maxLights).toBeGreaterThan(0);

    backend.dispose();
  });
});
