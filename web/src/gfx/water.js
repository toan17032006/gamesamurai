// Water surfaces: animated shader plane (waves + flood level), lava variant, waterfall strips.
// Một mặt nước lớn theo player — terrain cao hơn mặt nước sẽ che nó (depth test),
// nên chỉ thấy nước nơi địa hình thấp hơn mực nước (sông, hồ, vùng ngập).
import * as THREE from 'three';

const WATER_VERT_PULSE = `
  uniform float uTime;
  uniform float uAmp;
  #define PI 3.141592653589793
`;

// chèn sóng vào vertex shader của MeshStandardMaterial (giữ fog + lighting + env)
function injectWaves(mat, ampUniform) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = WATER_TIME;
    shader.uniforms.uAmp = ampUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uAmp;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        {
          vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
          float w1 = sin(wp.x * 0.32 + uTime * 1.15) * cos(wp.z * 0.27 + uTime * 0.9);
          float w2 = sin((wp.x + wp.z) * 0.11 + uTime * 0.55);
          float w3 = sin(wp.z * 0.51 - uTime * 1.7) * 0.4;
          transformed.y += (w1 * 0.055 + w2 * 0.085 + w3 * 0.02) * uAmp;
        }`);
  };
}

// shared time uniform — mọi mặt nước cùng nhịp
export const WATER_TIME = { value: 0 };

export class WaterSurface {
  /**
   * @param scene three.js scene
   * @param opts {size, color, opacity, segments, lava, amp}
   */
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.size = opts.size || 620;
    this.lava = !!opts.lava;
    this.segments = opts.segments || 56;
    this.ampUniform = { value: opts.amp ?? (this.lava ? 0.35 : 1.0) };
    const geo = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
    geo.rotateX(-Math.PI / 2);
    const mat = this.lava
      ? new THREE.MeshStandardMaterial({
          color: 0x2a0c06, roughness: 0.55, metalness: 0,
          emissive: 0xff4a10, emissiveIntensity: 1.35,
        })
      : new THREE.MeshPhysicalMaterial({
          color: opts.color ?? 0x3a6a7a, roughness: 0.12, metalness: 0.05,
          transparent: true, opacity: opts.opacity ?? 0.82,
          envMapIntensity: 1.35, clearcoat: 0.4, clearcoatRoughness: 0.25,
          depthWrite: false,
        });
    injectWaves(mat, this.ampUniform);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = !this.lava;
    this.mesh.renderOrder = this.lava ? 1 : 2;
    this.mesh.name = this.lava ? 'lava' : 'water';
    this.mesh.position.y = -9999; // ẩn cho đến khi có mực nước
    scene.add(this.mesh);
    this.mat = mat;
    this.geo = geo;
    this.level = -9999;
    this.targetLevel = -9999;
    this.flood = 0;         // 0..1 lũ hiện tại
    this.floodMax = opts.floodMax ?? 0.55;
    this.baseLevel = opts.level ?? -9999;
    this.enabled = false;
  }

  // mực nước cơ bản (không lũ)
  setLevel(y) {
    this.baseLevel = y;
    this.enabled = Number.isFinite(y);
    this.targetLevel = this.enabled ? y + this.flood * this.floodMax : -9999;
  }

  // lượng lũ 0..1 — tăng mực nước dần trong update
  setFlood(t) { this.flood = Math.max(0, Math.min(1, t)); }

  // đặt ngay mực nước (không lerp) — dùng khi build vùng
  snap(y) {
    this.setLevel(y);
    this.level = this.targetLevel;
    this.mesh.position.y = this.enabled ? this.level : -9999;
  }

  recenter(x, z) {
    // giữ mặt nước bám theo player; làm tròn để sóng (tính theo world pos) không giật
    this.mesh.position.x = Math.round(x / 8) * 8;
    this.mesh.position.z = Math.round(z / 8) * 8;
  }

  update(dt) {
    if (!this.enabled) return;
    // lerp mực nước về đích (lũ dâng/receding từ từ)
    this.level += (this.targetLevel - this.level) * Math.min(1, dt * 0.55);
    this.targetLevel = this.baseLevel + this.flood * this.floodMax;
    this.mesh.position.y = this.level;
    if (this.lava) {
      // bùng nhịp phát sáng nhẹ như dung nham sôi
      this.mat.emissiveIntensity = 1.25 + Math.sin(WATER_TIME.value * 1.7) * 0.18;
    }
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.geo.dispose();
    this.mat.dispose();
  }
}

// Dải thác nước: plane dọc với alpha scroll (chảy xuống), gắn vào vách.
export function makeWaterfallStrip(w, h, color = 0xbfd8e8) {
  const geo = new THREE.PlaneGeometry(w, h, 1, 8);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uTime: WATER_TIME, uColor: { value: new THREE.Color(color) } },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        // vệt nước chảy: sọc dọc trôi xuống + nhiễu trắng
        float streak = 0.55 + 0.45 * sin(vUv.x * 22.0 + sin(uTime * 0.7) * 2.0);
        float flow = fract(vUv.y * 2.2 + uTime * 1.35);
        float noise = hash(floor(vUv * vec2(24.0, 40.0)) + floor(uTime * 9.0));
        float a = (0.30 + 0.45 * streak) * (0.55 + 0.45 * flow) * (0.75 + 0.35 * noise);
        a *= smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
        gl_FragColor = vec4(uColor + vec3(0.25), a * 0.8);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.noMerge = true;
  return mesh;
}

// Bọt nước/gợn trắng tại chân thác (spawn định kỳ từ world.update)
export function waterfallFoam(game, wf) {
  game.particles.spawn(
    { x: wf.x + (Math.random() - 0.5) * wf.w, y: wf.y, z: wf.z + (Math.random() - 0.5) * 0.6 },
    { count: 2, color: [0xdff0f8, 0xffffff], speed: 1.6, life: 0.55, gravity: -2.5, spread: 0.5 });
}
