// engine/src/renderer/graphics-modes.ts — 5 preset chế độ đồ họa: performance / balanced / ultra / cinematic / ocean
import type { GraphicsMode, GraphicsModePreset } from '../types/effects.types';

export const GRAPHICS_MODES: Record<GraphicsMode, GraphicsModePreset> = {
  performance: {
    mode: 'performance',
    label: 'Hiệu năng',
    description: 'Tắt hậu kỳ, shadow 1024, pixelRatioCap 1 — ưu tiên FPS cao nhất.',
    postFx: { passes: [] },
    quality: {
      shadowMapSize: 1024,
      drawDistance: 120,
      vegetationDensity: 0.4,
      waterQuality: 'off',
      pixelRatioCap: 1,
      maxLights: 4,
      antialiasing: false,
    },
  },
  balanced: {
    mode: 'balanced',
    label: 'Cân bằng',
    description: 'Bloom nhẹ + grading, shadow 2048 — mặc định cho phần lớn máy.',
    postFx: { passes: ['bloom', 'grading'], bloomStrength: 0.5, exposure: 1.0 },
    quality: {
      shadowMapSize: 2048,
      drawDistance: 200,
      vegetationDensity: 0.7,
      waterQuality: 'basic',
      pixelRatioCap: 1.5,
      maxLights: 8,
      antialiasing: true,
    },
  },
  ultra: {
    mode: 'ultra',
    label: 'Ultra',
    description: 'Bloom + AO, shadow 3072, pixelRatioCap 2 — chất lượng tối đa.',
    postFx: { passes: ['bloom', 'grading', 'vignette'], bloomStrength: 0.8, aoStrength: 0.6, exposure: 1.05, vignette: 0.2 },
    quality: {
      shadowMapSize: 3072,
      drawDistance: 320,
      vegetationDensity: 1.0,
      waterQuality: 'high',
      pixelRatioCap: 2,
      maxLights: 16,
      antialiasing: true,
    },
  },
  cinematic: {
    mode: 'cinematic',
    label: 'Cinematic',
    description: 'Bloom mạnh + grading filmic + grain + vignette + letterbox.',
    postFx: {
      passes: ['bloom', 'grading', 'grain', 'vignette', 'letterbox'],
      bloomStrength: 1.1,
      gradeLift: [0.0, 0.005, 0.015],
      gradeGamma: [0.95, 0.98, 1.0],
      grainIntensity: 0.08,
      vignette: 0.35,
      exposure: 1.1,
    },
    quality: {
      shadowMapSize: 3072,
      drawDistance: 300,
      vegetationDensity: 1.0,
      waterQuality: 'high',
      pixelRatioCap: 2,
      maxLights: 24,
      antialiasing: true,
    },
    letterbox: true,
  },
  ocean: {
    mode: 'ocean',
    label: 'Biển cả',
    description: 'Sóng cao (waveHeight 1.6), phản chiếu + foam mạnh, bloom nhẹ, fog xanh biển.',
    postFx: { passes: ['bloom', 'grading'], bloomStrength: 0.4, exposure: 1.02 },
    quality: {
      shadowMapSize: 2048,
      drawDistance: 260,
      vegetationDensity: 0.5,
      waterQuality: 'high',
      pixelRatioCap: 1.5,
      maxLights: 12,
      antialiasing: true,
    },
    waterOverride: {
      waveHeight: 1.6,
      waveSpeed: 1.2,
      reflectionStrength: 0.9,
      foamAmount: 0.8,
    },
  },
};

export function getGraphicsPreset(mode: GraphicsMode): GraphicsModePreset {
  return GRAPHICS_MODES[mode] ?? GRAPHICS_MODES.balanced;
}

export function listGraphicsModes(): GraphicsMode[] {
  return Object.keys(GRAPHICS_MODES) as GraphicsMode[];
}

export const GRAPHICS_PRESETS = GRAPHICS_MODES;

