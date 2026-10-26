// Particles — PHIÊN BẢN ENGINE: burst + weather đều qua ParticleSystem của engine.
//  - ParticleSystem (game): spawn() tạo 1 emitter burst của engine tại vị trí đó,
//    rate = count (phát ngay), lifetime = life, velocity = dir*speed + jitter,
//    gravity đổi dấu cho đúng shader engine (pos.y -= uGravity*age^2/2).
//    update() chạy engine.update + dừng emitter khi hết life (engine tự dispose).
//  - Weather: 1 emitter liên tục của engine, update() di chuyển emitter theo
//    player (center) và lấy gió từ AtmosphereSystem của engine để drift.
//    Mưa giờ là hạt điểm của engine (không còn streak line), đổi lại là shader
//    mềm + fade màu đúng chuẩn engine. API cũ giữ nguyên:
//    ParticleSystem(scene, max), spawn(p, opts), update(dt), dispose()
//    Weather(scene, type, area, countMul), update(dt, center), dispose()
import * as THREE from 'three';
import { EngineParticleSystem } from '../assets/engine-lib.js';
import { atmosphereSystem } from '../assets/engineAssets.js';

export class ParticleSystem {
  constructor(scene, max = 900) {
    this.max = max;
    this.engine = new EngineParticleSystem();
    this.points = this.engine.group;
    scene.add(this.points);
    this._bursts = []; // {id, t}
    this._seq = 0;
    this.scene = scene;
  }

  spawn(p, opts = {}) {
    const n = opts.count || 8;
    const colors = Array.isArray(opts.color) ? opts.color : [opts.color || 0xffaa44];
    const speed = opts.speed || 3;
    const life = opts.life || 0.6;
    const dir = opts.dir;
    const id = `burst_${++this._seq}`;
    const vel = dir
      ? [dir.x * speed, dir.y * speed + speed * 0.4, dir.z * speed]
      : [0, speed * 0.5, 0];
    const spread = opts.spread !== undefined ? opts.spread : 1;
    this.engine.spawn({
      id, max: Math.max(n, 1), rate: n,
      lifetime: [life * 0.7, life],
      velocity: vel,
      velocityJitter: [speed * spread, speed * spread, speed * spread],
      size: [0.12 * (opts.size || 1), 0.2 * (opts.size || 1)],
      colorFrom: colors[0], colorTo: colors[colors.length - 1] || colors[0],
      gravity: -(opts.gravity !== undefined ? opts.gravity : -5),
      blend: 'additive',
    }, new THREE.Vector3(p.x, p.y, p.z));
    this._bursts.push({ id, t: life });
    return id;
  }

  update(dt) {
    this.engine.update(dt);
    for (let i = this._bursts.length - 1; i >= 0; i--) {
      const b = this._bursts[i];
      b.t -= dt;
      if (b.t <= 0) { this.engine.stop(b.id); this._bursts.splice(i, 1); }
    }
  }

  get activeCount() { return this.engine.getActiveParticleCount(); }

  dispose() {
    this.engine.clear();
    this.points.parent?.remove(this.points);
  }
}

// Weather qua engine emitter liên tục
const WEATHER_CFG = {
  rain: { color: 0xa8bad0, speed: [0, -22, 0], rate: 350, life: 0.9 },
  snow: { color: 0xe8f0ff, speed: [0.3, -1.6, 0.2], rate: 110, life: 8 },
  snowstorm: { color: 0xe8f0ff, speed: [0.3, -1.6, 0.2], rate: 210, life: 8 },
  petals: { color: 0xffb0c0, speed: [0.4, -0.7, 0.2], rate: 110, life: 10 },
  leaves: { color: 0xe89a40, speed: [0.5, -1.1, 0.3], rate: 110, life: 8 },
  embers: { color: 0xff7320, speed: [0.2, 1.1, 0.15], rate: 110, life: 6 },
  ash: { color: 0x998c80, speed: [0.3, -0.8, 0.2], rate: 110, life: 8 },
  dust: { color: 0xd8b88c, speed: [3.5, -0.15, 0.8], rate: 110, life: 6 },
  spirit: { color: 0x73d8ff, speed: [0.15, -2.6, 0.1], rate: 110, life: 6 },
};

export class Weather {
  constructor(scene, type, area = 90, countMul = 1) {
    this.type = type;
    this.area = area;
    const baseCount = type === 'rain' ? 700 : type === 'snowstorm' ? 420 : type === 'none' ? 0 : 220;
    const count = Math.round(baseCount * countMul);
    this.count = count;
    this.active = count > 0;
    this.scene = scene;
    if (!this.active) return;
    this.engine = new EngineParticleSystem();
    this.points = this.engine.group;
    scene.add(this.points);
    const cfg = WEATHER_CFG[type] || WEATHER_CFG.snow;
    const wind = atmosphereSystem.getWind();
    this.emitter = this.engine.createEmitter({
      id: `weather_${type}`, max: Math.max(count, 1), rate: cfg.rate,
      lifetime: [cfg.life * 0.7, cfg.life],
      velocity: [cfg.speed[0] + wind.direction.x * wind.speed * 0.2, cfg.speed[1], cfg.speed[2] + wind.direction.z * wind.speed * 0.2],
      velocityJitter: [2, 1, 2],
      size: [0.09, 0.14],
      colorFrom: cfg.color, colorTo: cfg.color,
      gravity: 0, blend: (type === 'embers' || type === 'spirit') ? 'additive' : 'normal',
    });
    // p/v giữ để tương thích code cũ đọc (không còn dùng cho motion chính)
    this.p = new Float32Array(count * 3);
    this.v = new Float32Array(count * 3);
    this.geo = null; this.mat = null;
    this._ePos = { x: 0, y: 9, z: 0 };
  }

  update(dt, center) {
    if (!this.active || !this.engine) return;
    this.engine.update(dt);
    atmosphereSystem.update(dt);
    // emitter bám theo player (mượt, không snap để hạt không giật)
    if (this.emitter) {
      const k = Math.min(1, dt * 3);
      this._ePos.x += (center.x - this._ePos.x) * k;
      this._ePos.z += (center.z - this._ePos.z) * k;
      this.emitter.setPosition(this._ePos.x, this._ePos.y, this._ePos.z);
    }
  }

  dispose() {
    if (!this.active) return;
    if (this.engine) { this.engine.clear(); this.points.parent?.remove(this.points); }
  }
}
