// engine/src/effects/post-processing.ts — Xử lý hậu kỳ (Bloom, SSAO, Color Grading, Depth of Field)
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { PostFxConfig } from '../types/effects.types';

export const GradingShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uLift: { value: new THREE.Vector3(0, 0, 0) },
    uGamma: { value: new THREE.Vector3(1, 1, 1) },
    uExposure: { value: 1.0 },
    uVignette: { value: 0.0 },
    uLetterbox: { value: 0.0 },
  },
  vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform vec3 uLift;
uniform vec3 uGamma;
uniform float uExposure;
uniform float uVignette;
uniform float uLetterbox;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  vec3 col = c.rgb * uExposure;
  col = pow(max(col, vec3(0.0)), vec3(1.0) / uGamma) + uLift;
  float d = distance(vUv, vec2(0.5));
  col *= mix(1.0, smoothstep(0.85, 0.35, d), uVignette);
  float bar = uLetterbox * 0.12;
  if (vUv.y < bar || vUv.y > 1.0 - bar) col = vec3(0.0);
  gl_FragColor = vec4(col, c.a);
}`,
};

export const GrainShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uIntensity: { value: 0.05 },
  },
  vertexShader: GradingShader.vertexShader,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;
float hash(vec2 p) {
  return fract(sin(dot(p + uTime, vec2(127.1, 311.7))) * 43758.5453);
}
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  float n = hash(vUv * vec2(1920.0, 1080.0)) - 0.5;
  gl_FragColor = vec4(c.rgb + n * uIntensity, c.a);
}`,
};

const unsupportedWarned = new Set<string>();

export interface PostFX {
  readonly composer: EffectComposer;
  readonly passes: Map<string, ShaderPass | UnrealBloomPass>;
  setSize(width: number, height: number): void;
  render(dt: number): void;
  setPassEnabled(name: string, enabled: boolean): void;
  setGrainTime(t: number): void;
  dispose(): void;
}

export function buildComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  cfg: PostFxConfig,
): PostFX {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const passes = new Map<string, ShaderPass | UnrealBloomPass>();

  for (const passName of cfg.passes) {
    if (passName === 'bloom') {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window?.innerWidth || 1920, window?.innerHeight || 1080),
        cfg.bloomStrength ?? 0.8,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);
      passes.set('bloom', bloomPass);
    } else if (passName === 'grading') {
      const grading = new ShaderPass(GradingShader);
      composer.addPass(grading);
      passes.set('grading', grading);
    } else if (passName === 'grain') {
      const grain = new ShaderPass(GrainShader);
      composer.addPass(grain);
      passes.set('grain', grain);
    }
  }

  composer.addPass(new OutputPass());

  return {
    composer,
    passes,
    setSize(w: number, h: number) {
      composer.setSize(w, h);
    },
    render(dt: number) {
      composer.render(dt);
    },
    setPassEnabled(name: string, enabled: boolean) {
      const p = passes.get(name);
      if (p) p.enabled = enabled;
    },
    setGrainTime(t: number) {
      const g = passes.get('grain') as ShaderPass | undefined;
      if (g) g.uniforms.uTime.value = t;
    },
    dispose() {
      composer.renderTarget1.dispose();
      composer.renderTarget2.dispose();
    },
  };
}

export class PostProcessing {
  private fx: PostFX;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, cfg: PostFxConfig = { passes: ['bloom', 'grading'] }) {
    this.fx = buildComposer(renderer, scene, camera, cfg);
  }

  public render(dt: number = 0.016): void {
    this.fx.render(dt);
  }

  public setSize(w: number, h: number): void {
    this.fx.setSize(w, h);
  }

  public setPassEnabled(name: string, enabled: boolean): void {
    this.fx.setPassEnabled(name, enabled);
  }

  public dispose(): void {
    this.fx.dispose();
  }
}

