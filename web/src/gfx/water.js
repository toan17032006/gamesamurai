// Water surfaces — 100% ENGINE (bước 3): shader injection tự viết (onBeforeCompile
// chèn sóng vào vertex shader) ĐÃ XÓA. Sóng giờ là CPU displacement: mỗi frame
// update() lấy chiều cao từ WaterSystem.getHeightAt(x, z) của engine và gán
// vào từng đỉnh plane (tỉ lệ 0.18 để biên độ khớp shader cũ ±0.16).
// Thác nước: ShaderMaterial chảy ĐÃ XÓA, thay bằng plane AssetFactory của engine.
import * as THREE from 'three';
import { waterSystem, createEngineAsset } from '../assets/engineAssets.js';

let _waterSeq = 0;

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
    this.mesh = new THREE.Mesh(geo, mat);
    this._basePos = geo.attributes.position.array.slice();
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
    // Đăng ký vào WaterSystem của engine
    this.surfaceId = `water_${++_waterSeq}`;
    waterSystem.registerSurface(this.surfaceId, this.baseLevel, {
      waveAmplitude: this.lava ? 0.2 : 0.5, waveFrequency: 0.8,
    });
  }

  /** Chiều cao sóng tại (x, z) theo engine WaterSystem. */
  getHeightAt(x, z) {
    return waterSystem.getHeightAt(this.surfaceId, x, z, WATER_TIME.value);
  }

  /** Tạo ripple tại (x, z) qua engine (bước chân, splash, va chạm). */
  addRipple(x, z, strength = 0.5) {
    waterSystem.addRipple(x, z, strength);
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
    waterSystem.update(dt);
    WATER_TIME.value += dt;
    if (!this.enabled) return;
    // Sóng engine -> đỉnh plane (world x/z = mesh pos + local pos)
    {
      const pos = this.geo.attributes.position;
      const base = this._basePos;
      const mx = this.mesh.position.x, mz = this.mesh.position.z;
      const surf = waterSystem.getSurface(this.surfaceId);
      const lvl = surf ? surf.level : this.level;
      const amp = (this.ampUniform.value ?? 1) * 0.18;
      for (let i = 0; i < pos.count; i++) {
        const wx = mx + base[i * 3], wz = mz + base[i * 3 + 2];
        pos.setY(i, (waterSystem.getHeightAt(this.surfaceId, wx, wz, WATER_TIME.value) - lvl) * amp);
      }
      pos.needsUpdate = true;
      this.geo.computeVertexNormals();
    }
    // lerp mực nước về đích (lũ dâng/receding từ từ)
    this.level += (this.targetLevel - this.level) * Math.min(1, dt * 0.55);
    // đồng bộ mực nước vào surface của engine
    const s = waterSystem.getSurface(this.surfaceId);
    if (s) s.level = this.level;
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

// Dải thác nước: plane AssetFactory của engine, trong suốt (không shader chảy)
export function makeWaterfallStrip(w, h, color = 0xbfd8e8) {
  const mesh = createEngineAsset('waterfall', [
    { shape: 'plane', size: [w, h, 1], position: [0, 0, 0], rotation: [0, 0, 0], color, roughness: 0.4 },
  ]);
  mesh.traverse((o) => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = 0.65; o.material.side = THREE.DoubleSide; o.material.depthWrite = false; o.castShadow = false; } });
  mesh.userData.noMerge = true;
  return mesh;
}

// Bọt nước/gợn trắng tại chân thác (spawn định kỳ từ world.update)
export function waterfallFoam(game, wf) {
  game.particles.spawn(
    { x: wf.x + (Math.random() - 0.5) * wf.w, y: wf.y, z: wf.z + (Math.random() - 0.5) * 0.6 },
    { count: 2, color: [0xdff0f8, 0xffffff], speed: 1.6, life: 0.55, gravity: -2.5, spread: 0.5 });
}
