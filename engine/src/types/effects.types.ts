// engine/src/types/effects.types.ts — Kiểu dữ liệu hạt, hiệu ứng VFX, Decal & Hậu kỳ
import type { Vec3 } from './transform.types';

export type ParticleBlendMode = 'normal' | 'additive' | 'multiply' | 'subtractive';
export type ParticleShape = 'billboard' | 'mesh' | 'beam' | 'trail' | 'ring';

export interface EmitterConfig {
  id: string;
  max: number;
  rate: number; // hạt/giây
  lifetime: [number, number];
  velocity: [number, number, number];
  velocityJitter?: [number, number, number];
  acceleration?: [number, number, number];
  size: [number, number];
  sizeEnd?: [number, number];
  colorFrom: number; // hex 0xRRGGBB
  colorTo: number;
  opacityFrom?: number;
  opacityTo?: number;
  rotationSpeed?: [number, number];
  gravity?: number;
  texture?: string;
  blend?: ParticleBlendMode;
  shape?: ParticleShape;
  worldSpace?: boolean;
  burstCount?: number;
  loop?: boolean;
}

export interface DecalSpec {
  texture: string;
  size: number | [number, number, number];
  rotation?: number;
  fadeTime?: number;
  orient: 'ground' | 'surface' | 'aligned';
  color?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
}

export type PostFxPass =
  | 'bloom'
  | 'ssao'
  | 'dof'
  | 'grading'
  | 'grain'
  | 'vignette'
  | 'letterbox'
  | 'motionBlur'
  | 'tonemap'
  | 'fxaa'
  | 'chromaticAberration';

export interface PostFxConfig {
  passes: PostFxPass[];
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  aoStrength?: number;
  aoRadius?: number;
  dofFocus?: number;
  dofAperture?: number;
  gradeLift?: [number, number, number];
  gradeGamma?: [number, number, number];
  grainIntensity?: number;
  vignette?: number;
  exposure?: number;
  toneMappingMode?: 'aces' | 'reinhard' | 'filmic' | 'linear';
}

export type GraphicsMode = 'performance' | 'balanced' | 'ultra' | 'cinematic' | 'ocean';

export interface GraphicsModePreset {
  mode: GraphicsMode;
  label: string;
  description: string;
  postFx: PostFxConfig;
  quality: {
    shadowMapSize: number;
    drawDistance: number;
    vegetationDensity: number;
    waterQuality: 'off' | 'basic' | 'high';
    pixelRatioCap: number;
    maxLights: number;
    antialiasing: boolean;
  };
  waterOverride?: {
    waveHeight?: number;
    waveSpeed?: number;
    reflectionStrength?: number;
    foamAmount?: number;
  };
  letterbox?: boolean;
}

export interface ShaderSpec {
  name: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms?: Record<string, { value: unknown }>;
  transparent?: boolean;
  depthWrite?: boolean;
  wireframe?: boolean;
}
