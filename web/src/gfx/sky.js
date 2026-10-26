// Sky — 100% ENGINE (bước 3): shader bầu trời tự viết (gradient + mây fbm +
// sao + mặt trăng bằng GLSL) ĐÃ XÓA. Thay bằng:
//   - scene.background = màu bầu trời của engine (top/bottom từ region def)
//   - ánh sáng: configureLights() của engine (__engine_hemi / __engine_sun,
//     không còn HemisphereLight/DirectionalLight tự tạo trùng)
//   - mây: 8 plane do AssetFactory của engine tạo, trôi theo gió của
//     AtmosphereSystem (tốc độ mây = 0.7 + wind.speed*0.08 như cũ)
//   - môi trường phản chiếu: PMREM từ 1 dome màu đơn giản (không shader)
// API giữ nguyên cho Weather/Game/LevelManager: mat.uniforms (top/bottom/
// sunColor/sunDir/cloudCover/night/time), sun, hemi, baseSunIntensity,
// baseHemiIntensity, sunDir, set(def), update(playerPos), dispose().
// Đánh đổi ghi rõ: sao/mặt trăng/mây fbm bằng shader không còn — engine
// không có shader bầu trời tương đương; mây giờ là plane engine.
import * as THREE from 'three';
import { atmosphereSystem, createEngineAsset, ENGINE_PRESET } from '../assets/engineAssets.js';
import { configureLights } from '../assets/engine-lib.js';

export class Sky {
  constructor(engine) {
    this.engine = engine;
    const scene = engine.scene;
    this.scene = scene;
    // Uniform-like object để Weather vẫn đọc/ghi cloudCover như cũ
    this.mat = {
      uniforms: {
        top: { value: new THREE.Color(0x8fb8d8) }, bottom: { value: new THREE.Color(0xe8e0cc) },
        sunDir: { value: new THREE.Vector3(0.5, 0.7, 0.5) }, sunColor: { value: new THREE.Color(0xfff0d0) },
        cloudCover: { value: 0.45 }, night: { value: 0 }, time: { value: 0 },
      },
    };
    // Đèn engine (tái dùng theo tên, không tạo trùng)
    const rig = configureLights(scene, {
      sunAngle: Math.PI / 3, intensity: 1.5,
      shadowMapSize: ENGINE_PRESET.quality.shadowMapSize ?? 2048,
      skyColor: 0xbfd7ff, groundColor: 0x3a2f22, sunColor: 0xfff2df,
    });
    this.lightRig = rig;
    this.hemi = rig.hemi;
    this.sun = rig.sun;
    this.sunDir = new THREE.Vector3(0.5, 0.7, 0.5).normalize();
    this.baseSunIntensity = this.sun.intensity;
    this.baseHemiIntensity = this.hemi.intensity;
    this.background = new THREE.Color(0x8fb8d8);
    scene.background = this.background;

    // Mây engine: plane AssetFactory, material trong suốt
    this.clouds = [];
    for (let i = 0; i < 8; i++) {
      const w = 40 + (i % 4) * 18;
      const cloud = createEngineAsset('cloud_' + i, [
        { shape: 'plane', size: [w, w * 0.45, 1], position: [0, 0, 0], rotation: [0, 0, 0], color: 0xffffff, roughness: 1 },
      ]);
      cloud.traverse((o) => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = 0.35; o.material.depthWrite = false; o.castShadow = false; o.receiveShadow = false; } });
      cloud.rotation.x = -Math.PI / 2;
      cloud.position.set((i - 4) * 90, 90 + (i % 3) * 18, (i % 5 - 2) * 80);
      cloud.renderOrder = -1;
      scene.add(cloud);
      this.clouds.push(cloud);
    }

    // Env capture: dome màu đơn (không shader) để PMREM vẫn có reflection
    this.envScene = new THREE.Scene();
    this.envMesh = new THREE.Mesh(new THREE.SphereGeometry(50, 16, 12), new THREE.MeshBasicMaterial({ color: 0x8fb8d8, side: THREE.BackSide }));
    this.envScene.add(this.envMesh);
    this.pmrem = new THREE.PMREMGenerator(engine.renderer);
    this._envRT = null;
  }

  set(def) {
    const u = this.mat.uniforms;
    u.top.value.setHex(def.sky.top);
    u.bottom.value.setHex(def.sky.bottom);
    u.sunColor.value.setHex(def.light.sun);
    u.night.value = def.light.night ? 1 : 0;
    u.cloudCover.value = def.weather === 'rain' ? 0.85 : def.weather === 'fog' ? 0.6 : def.weather === 'embers' ? 0.55 : 0.42;
    atmosphereSystem.setWind({
      speed: def.weather === 'storm' ? 14 : def.weather === 'rain' ? 9 : def.weather === 'snowstorm' ? 12 : 5,
      gustiness: def.weather === 'storm' ? 0.7 : 0.3,
    });
    this.background.setHex(def.sky.bottom).lerp(u.top.value, 0.45);
    this.engine.scene.background = this.background;
    this.engine.scene.fog = new THREE.FogExp2(def.sky.bottom, def.sky.fogDensity);
    this.hemi.color.setHex(def.light.ambient);
    this.hemi.intensity = def.light.ambientIntensity * (def.light.night ? 0.55 : 1);
    this.hemi.groundColor.setHex(def.palette.dirt);
    this.sun.color.setHex(def.light.sun);
    this.sun.intensity = def.light.sunIntensity * (def.light.night ? 1.4 : 1);
    this.baseSunIntensity = this.sun.intensity;
    this.baseHemiIntensity = this.hemi.intensity;
    this.engine.renderer.toneMappingExposure = def.light.night ? 0.92 : 1.06;
    const [az, el] = def.light.sunAngle;
    const d = 80;
    this.sunDir = new THREE.Vector3(Math.cos(az) * Math.cos(el * 0.5), Math.sin(el), Math.sin(az) * Math.cos(el * 0.5)).normalize();
    u.sunDir.value.copy(this.sunDir);
    this.sun.position.set(this.sunDir.x * d, this.sunDir.y * d, this.sunDir.z * d);
    // Env reflection từ màu trời hiện tại
    this.envMesh.material.color.copy(u.top.value);
    if (this._envRT) this._envRT.dispose();
    this._envRT = this.pmrem.fromScene(this.envScene, 0.04, 1, 120);
    this.engine.scene.environment = this._envRT.texture;
    this.engine.scene.environmentIntensity = def.light.night ? 0.32 : 0.55;
    // Mây theo cloudCover
    for (const c of this.clouds) c.traverse((o) => { if (o.isMesh) o.material.opacity = 0.12 + u.cloudCover.value * 0.45; });
  }

  update(playerPos) {
    atmosphereSystem.update(1 / 60);
    const wind = atmosphereSystem.getWind();
    this.mat.uniforms.time.value += (1 / 60) * (0.7 + wind.speed * 0.08);
    const drift = wind.speed * 0.08 + 0.7;
    for (const c of this.clouds) {
      c.position.x += drift * 0.016;
      c.position.z += drift * 0.004;
      if (c.position.x > 420) c.position.x = -420;
      // Mây bám theo player như dome cũ (không để player bay khỏi mây)
      c.position.x = playerPos.x + ((c.position.x - playerPos.x + 420) % 840) - 420;
      c.position.z = playerPos.z + ((c.position.z - playerPos.z + 420) % 840) - 420;
    }
    this.sun.target.position.set(playerPos.x, 0, playerPos.z);
    this.sun.position.set(playerPos.x + this.sunDir.x * 60, Math.max(18, this.sunDir.y * 60), playerPos.z + this.sunDir.z * 60);
    this.sun.target.updateMatrixWorld();
  }

  dispose() {
    for (const c of this.clouds) { this.scene.remove(c); }
    this.envMesh.geometry.dispose(); this.envMesh.material.dispose();
    this.pmrem.dispose();
    if (this._envRT) this._envRT.dispose();
    if (this.lightRig) this.lightRig.dispose();
  }
}
