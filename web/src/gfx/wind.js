// Wind — PHIÊN BẢN ENGINE: gió dùng chung giờ lấy từ AtmosphereSystem của engine.
// WIND.uTime vẫn là uniform thời gian (world.js cập nhật từ game.time).
// makeSwayMaterial vẫn inject vertex sway như cũ, nhưng biên độ được đồng bộ
// với tốc độ gió của engine qua syncEngineWind(dt) — gọi mỗi frame từ world.update.
import * as THREE from 'three';
import { atmosphereSystem } from '../assets/engineAssets.js';

export const WIND = { uTime: { value: 0 } };
const _mats = []; // {mat, uAmp, baseAmp, uFreq}

export function getEngineWind() { return atmosphereSystem.getWind(); }
export function engineWindVelocityAt(x, y, z) {
  return atmosphereSystem.getWindVelocityAt({ x, y, z });
}

/** Đồng bộ gió engine -> tất cả sway material (gọi mỗi frame, rẻ). */
export function syncEngineWind(dt) {
  atmosphereSystem.update(dt);
  const wind = atmosphereSystem.getWind();
  // tốc độ gió engine 5 m/s ~ biên độ gốc; gió mạnh hơn -> sway mạnh hơn, tối đa x1.8
  const mul = Math.min(1.8, Math.max(0.4, 0.6 + wind.speed * 0.08 + wind.gustiness * 0.4));
  for (const e of _mats) e.uAmp.value = e.baseAmp * mul;
  return wind;
}

export function makeSwayMaterial(params, { amp = 0.05, freq = 1.6, heightRef = 1 } = {}) {
  const m = new THREE.MeshStandardMaterial(params);
  const uAmp = { value: amp }, uFreq = { value: freq }, uHRef = { value: heightRef };
  m.userData.windUniforms = { uAmp, uFreq, uHRef };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = WIND.uTime;
    shader.uniforms.uAmp = uAmp;
    shader.uniforms.uFreq = uFreq;
    shader.uniforms.uHRef = uHRef;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uAmp;\nuniform float uFreq;\nuniform float uHRef;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        {
          float swayPh = position.y * 1.35;
          #ifdef USE_INSTANCING
            swayPh += instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.43;
          #endif
          float swayF = pow(max(position.y, 0.0) / max(uHRef, 0.001), 1.5);
          swayF = min(swayF, 1.0);
          transformed.x += sin(uTime * uFreq + swayPh) * uAmp * swayF;
          transformed.z += cos(uTime * uFreq * 0.83 + swayPh * 1.21) * uAmp * 0.72 * swayF;
        }`);
  };
  _mats.push({ mat: m, uAmp, baseAmp: amp, uFreq });
  return m;
}

export function disposeSwayMaterials() {
  for (const e of _mats) e.mat.dispose();
  _mats.length = 0;
}

export { atmosphereSystem };
