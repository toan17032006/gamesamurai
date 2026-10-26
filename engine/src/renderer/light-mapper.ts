// engine/src/renderer/light-mapper.ts — Gắn nguồn sáng động và cấu hình đổ bóng vào tài nguyên
import * as THREE from 'three';

export interface LightConfig {
  sunAngle?: number;
  intensity?: number;
  shadowMapSize?: number;
  drawDistance?: number;
  skyColor?: number;
  groundColor?: number;
  sunColor?: number;
}

export interface LightRig {
  hemi: THREE.HemisphereLight;
  sun: THREE.DirectionalLight;
  update(sunAngle: number): void;
  dispose(): void;
}

export function configureLights(scene: THREE.Scene, cfg: LightConfig = {}): LightRig {
  const intensity = cfg.intensity ?? 1;
  const shadowMapSize = cfg.shadowMapSize ?? 2048;
  const drawDistance = Math.max(20, cfg.drawDistance ?? 200);
  const shadowRadius = Math.min(200, drawDistance * 0.5);

  let hemi = scene.getObjectByName('__engine_hemi') as THREE.HemisphereLight | undefined;
  if (!hemi) {
    hemi = new THREE.HemisphereLight(cfg.skyColor ?? 0xbfd7ff, cfg.groundColor ?? 0x3a2f22, 0.5 * intensity);
    hemi.name = '__engine_hemi';
    scene.add(hemi);
  }

  let sun = scene.getObjectByName('__engine_sun') as THREE.DirectionalLight | undefined;
  if (!sun) {
    sun = new THREE.DirectionalLight(cfg.sunColor ?? 0xfff2df, intensity);
    sun.name = '__engine_sun';
    sun.castShadow = shadowMapSize > 0;
    if (sun.castShadow) {
      sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
      const cam = sun.shadow.camera;
      cam.left = -shadowRadius;
      cam.right = shadowRadius;
      cam.top = shadowRadius;
      cam.bottom = -shadowRadius;
      cam.near = 0.5;
      cam.far = shadowRadius * 4 + 100;
      sun.shadow.bias = -0.0005;
      sun.shadow.normalBias = 0.02;
      cam.updateProjectionMatrix();
    }
    scene.add(sun);
    scene.add(sun.target);
  }

  const update = (sunAngle: number): void => {
    const d = shadowRadius;
    const cos = Math.cos(sunAngle);
    const sin = Math.sin(sunAngle);
    sun.position.set(cos * d, Math.max(2, sin * d), d * 0.35);
    sun.target.position.set(0, 0, 0);
    sun.target.updateMatrixWorld();
    sun.intensity = intensity * Math.max(0.05, sin);
  };
  update(cfg.sunAngle ?? Math.PI / 3);

  return {
    hemi,
    sun,
    update,
    dispose(): void {
      scene.remove(hemi);
      scene.remove(sun);
      scene.remove(sun.target);
      sun.dispose();
    },
  };
}
