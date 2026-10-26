// Renderer — tạo một lần với preset ultra của engine + shadow.
// Không chứa logic game.
import * as THREE from 'three';
import { getGraphicsPreset } from '../assets/engine-lib.js';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const preset = getGraphicsPreset('ultra');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.quality.pixelRatioCap));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}
