// Post-processing — 100% ENGINE (bước 3): shader grading tự viết của game
// (split-tone/saturation/contrast/vignette/grain bằng GLSL riêng) ĐÃ XÓA.
// Thay bằng shader của engine: GradingShader (lift/gamma/exposure/vignette/
// letterbox) và GrainShader (hash grain theo thời gian) qua ShaderPass.
// Vignette mặc định vẫn lấy từ preset 'ultra' của engine.
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { EngineGradingShader, EngineGrainShader, EnginePostProcessing } from '../assets/engine-lib.js';
import { ENGINE_PRESET } from '../assets/engineAssets.js';

export { EngineGradingShader, EngineGrainShader, EnginePostProcessing };
export function createEnginePostProcessing(renderer, scene, camera) {
  return new EnginePostProcessing(renderer, scene, camera, ENGINE_PRESET.postFx);
}

// Grading của engine, với vignette từ preset ultra (game cũ dùng 0.34)
export const GradingShader = EngineGradingShader;

export function createGradingPass() {
  const pass = new ShaderPass(EngineGradingShader);
  if (pass.uniforms.uVignette) pass.uniforms.uVignette.value = ENGINE_PRESET.postFx.vignette ?? 0.2;
  if (pass.uniforms.uExposure) pass.uniforms.uExposure.value = ENGINE_PRESET.postFx.exposure ?? 1.05;
  return pass;
}

export function createEngineGrainPass() {
  const pass = new ShaderPass(EngineGrainShader);
  if (pass.uniforms.uIntensity) pass.uniforms.uIntensity.value = 0.05;
  return pass;
}
