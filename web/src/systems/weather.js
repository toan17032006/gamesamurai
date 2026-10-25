// Thời tiết động: chu kỳ loại thời tiết theo pool từng vùng, chuyển mượt (fog/mây/ánh sáng),
// mưa làm ướt bề mặt, bão có sấm sét, lũ dâng ở vùng trũng, và các sự kiện SIÊU NHIÊN
// (sương ma, mưa linh khí, bão ma thuật) ảnh hưởng gameplay + được báo rõ cho người chơi.
import { Weather } from '../gfx/particles.js';
import { pickWeather, weatherDuration } from './worldgen.js';
import { mulberry32 } from '../core/utils.js';

export const WEATHER_INFO = {
  clear:      { name: 'Trời trong',  fog: 0,    cloud: 0.30, particles: null },
  cloudy:     { name: 'Nhiều mây',   fog: 0.1,  cloud: 0.62, particles: null },
  fog:        { name: 'Sương mù',    fog: 1.6,  cloud: 0.55, particles: null },
  rain:       { name: 'Mưa',         fog: 0.5,  cloud: 0.82, particles: 'rain', wet: 0.75 },
  storm:      { name: 'Bão tố',      fog: 0.95, cloud: 0.96, particles: 'rain', wet: 1, lightning: true, dim: 0.55 },
  snow:       { name: 'Tuyết rơi',   fog: 0.8,  cloud: 0.72, particles: 'snow' },
  snowstorm:  { name: 'Bão tuyết',   fog: 1.9,  cloud: 0.9,  particles: 'snow', dim: 0.7 },
  leaves:     { name: 'Gió lá',      fog: 0,    cloud: 0.45, particles: 'leaves' },
  petals:     { name: 'Cánh hoa',    fog: 0,    cloud: 0.40, particles: 'petals' },
  embers:     { name: 'Tro lửa',     fog: 0.3,  cloud: 0.5,  particles: 'embers' },
  ash:        { name: 'Tro núi lửa', fog: 0.8,  cloud: 0.62, particles: 'ash', dim: 0.8 },
  dust:       { name: 'Bão cát',     fog: 1.3,  cloud: 0.4,  particles: 'dust', dim: 0.8 },
  spirit:     { name: 'Mưa linh khí', fog: 0.4, cloud: 0.7,  particles: 'spirit', xpMul: 1.15 },
  wraith_fog: { name: 'Sương ma',    fog: 2.5,  cloud: 0.75, particles: null, purple: true, spawnWraith: true },
  magic_storm:{ name: 'Bão ma thuật', fog: 1.2, cloud: 0.95, particles: 'spirit', lightning: 'purple', dim: 0.6, enemyBuff: 0.15 },
};

const SUPERNATURAL_TYPES = new Set(['spirit', 'wraith_fog', 'magic_storm']);

export class WeatherSystem {
  constructor(game) {
    this.game = game;
    this.type = 'clear';
    this.pool = [['clear', 1]];
    this.suppPool = null;
    this.baseFog = 0.01;
    this.fogColor = 0xb8bcc0;
    this.floodCapable = false;
    this.intensity = 1;
    this.timer = 20;
    this.rng = mulberry32(0xfeeb1e);
    this.active = null;
    this.flash = 0;           // thời lượng chớp còn lại
    this.strikeT = 6;         // đếm ngược tới cú sét kế
    this.eventT = 50;         // đếm ngược tới khi có thể nổ ra sự kiện siêu nhiên
    this.supernatural = null; // {type, t}
    this.flood = 0;
    this._terrainWet = 0;
    this.hudName = '';
  }

  fxMul() {
    const fx = this.game.settings?.weatherFx ?? 'full';
    return fx === 'off' ? 0 : fx === 'basic' ? 0.5 : 1;
  }

  // cấu hình cho một vùng (region def) — gọi khi load region/cell biome đổi
  configure(region) {
    this.pool = region.weatherPool || [['clear', 1]];
    this.suppPool = region.supernaturalPool || null;
    this.baseFog = region.sky ? region.sky.fogDensity : 0.01;
    this.fogColor = region.sky ? region.sky.bottom : 0xb8bcc0;
    this.floodCapable = !!(region.water && region.water.flood);
    this.rng = mulberry32((region.seed || 1) ^ 0xfeeb1e);
    this.endSupernatural(true);
    this.setType(this.pool[0][0], { instant: true });
    this.timer = weatherDuration(this.type, this.rng);
    this.flood = 0;
    this.eventT = 35 + this.rng() * 60;
    this.game.world.setFlood(0);
  }

  info() { return WEATHER_INFO[this.type] || WEATHER_INFO.clear; }

  setType(type, { instant = false } = {}) {
    if (type === this.type && !instant) return;
    this.type = type;
    if (instant) {
      this.swapParticles();
      this.intensity = 1;
      this.applyNow(0.016);
    } else {
      this._swapPending = 2.2; // particles swap sau khi fade
      this.intensity = 0;
    }
    this.updateHud();
  }

  updateHud() {
    const name = this.supernatural ? WEATHER_INFO[this.supernatural.type].name : this.info().name;
    if (name !== this.hudName) {
      this.hudName = name;
      this.game.ui?.hud?.setWeather(name, !!this.supernatural);
    }
  }

  swapParticles() {
    this.active?.dispose();
    this.active = null;
    const p = this.info().particles;
    const mul = this.fxMul();
    if (p && mul > 0) {
      this.active = new Weather(this.game.engine.scene, p, 95, mul);
    }
  }

  // sét: chớp sáng + sấm (trì hoãn theo khoảng cách) + cột sáng đánh xuống
  strike() {
    this.flash = 0.16;
    const g = this.game;
    const px = g.player ? g.player.pos.x : 0, pz = g.player ? g.player.pos.z : 0;
    const a = this.rng() * Math.PI * 2, r = 16 + this.rng() * 34;
    const sx = px + Math.cos(a) * r, sz = pz + Math.sin(a) * r;
    const delay = 0.15 + (r / 60) * 1.2; // sấm đến muộn hơn chớp
    const purple = this.info().lightning === 'purple';
    setTimeout(() => {
      if (!g.engine) return;
      g.particles.spawn({ x: sx, y: (g.world.groundAt(sx, sz) || 0) + 4, z: sz },
        { count: 22, color: purple ? [0x9a5aff, 0xd0a8ff, 0xffffff] : [0xbfd8ff, 0xffffff, 0xfff0b0],
          speed: 6, life: 0.4, gravity: 2, spread: 0.6 });
    }, 10);
    setTimeout(() => g.audio.sfx('thunder'), delay * 1000);
  }

  startSupernatural(type) {
    const g = this.game;
    this.supernatural = { type, t: weatherDuration(type, this.rng) };
    if (type === 'wraith_fog') {
      // gọi thêm vài vong linh quanh người chơi (gắn cell hiện tại để unload cùng vùng)
      for (let i = 0; i < 3; i++) {
        const a = this.rng() * Math.PI * 2, r = 18 + this.rng() * 12;
        const x = (g.player?.pos.x || 0) + Math.cos(a) * r, z = (g.player?.pos.z || 0) + Math.sin(a) * r;
        const n = g.spawnNpc({ enemyId: 'wraith', x, z, levelScale: 1 + (g.progression?.level || 1) * 0.04 });
        if (g.infinite && g.infinite.cellKeyAt) n.cell = g.infinite.cellKeyAt(x, z);
      }
    }
    if (type === 'magic_storm') {
      // địch hung hãn hơn trong bão ma thuật
      for (const n of g.npcs) {
        if (!n.combat?.dead && n.faction !== 'player' && n.faction !== 'samurai_ally') {
          n.addBuff?.('attackPct', WEATHER_INFO.magic_storm.enemyBuff, this.supernatural.t + 2);
        }
      }
      g.ui.notify('warn', 'BÃO MA THUẬT! Sinh vật bóng tối đang cường hóa...');
    } else if (type === 'wraith_fog') {
      g.ui.notify('warn', 'SƯƠNG MA trỗi dậy... có thứ gì đang tiến lại gần.');
    } else if (type === 'spirit') {
      g.ui.notify('good', 'MƯA LINH KHÍ: kinh nghiệm +15% trong lúc mưa.');
    }
    this.updateHud();
  }

  endSupernatural(silent = false) {
    if (!this.supernatural) return;
    this.supernatural = null;
    this.eventT = 60 + this.rng() * 90;
    if (!silent) this.game.ui.notify('info', 'Dị tượng đã lắng xuống.');
    this.updateHud();
  }

  update(dt, playerPos) {
    const g = this.game;
    const info = this.info();

    // ---- chu kỳ thời tiết chính ----
    if (this.supernatural) {
      this.supernatural.t -= dt;
      if (this.supernatural.t <= 0) this.endSupernatural();
    } else {
      this.timer -= dt;
      if (this.timer <= 0) {
        const next = pickWeather(this.pool, this.type, this.rng);
        this.setType(next);
        this.timer = weatherDuration(next, this.rng);
        if (next !== this.type || true) g.ui.notify('info', `Thời tiết: ${WEATHER_INFO[next].name}`);
      }
      // sự kiện siêu nhiên
      if (this.suppPool) {
        this.eventT -= dt;
        if (this.eventT <= 0) {
          const next = pickWeather(this.suppPool, this.supernatural?.type || '_', this.rng);
          this.startSupernatural(next);
        }
      }
    }

    // ---- chuyển mượt ----
    if (this._swapPending !== undefined) {
      this._swapPending -= dt;
      if (this._swapPending <= 0) { this.swapParticles(); delete this._swapPending; }
    }
    this.intensity = Math.min(1, this.intensity + dt * 0.5);
    this.applyNow(dt);

    // ---- sấm sét ----
    if (info.lightning && this.fxMul() > 0) {
      this.strikeT -= dt;
      if (this.strikeT <= 0) {
        this.strikeT = 4 + this.rng() * 11;
        this.strike();
      }
    }
    if (this.flash > 0) this.flash -= dt;

    // ---- lũ ----
    if (this.floodCapable) {
      const raining = ['rain', 'storm'].includes(this.type) || (this.supernatural && this.supernatural.type === 'magic_storm');
      if (raining && this.intensity > 0.5) {
        const rate = this.type === 'storm' ? 0.05 : 0.028;
        this.flood = Math.min(1, this.flood + dt * rate);
      } else {
        this.flood = Math.max(0, this.flood - dt * 0.02);
      }
      g.world.setFlood(this.flood);
      if (this.flood > 0.55 && !this._floodWarned) {
        this._floodWarned = true;
        g.ui.notify('warn', 'NƯỚC DÂNG! Các lối đi thấp đang bị ngập.');
      }
      if (this.flood < 0.2) this._floodWarned = false;
    }
  }

  // áp trạng thái lên scene: fog, mây, ánh sáng, mặt đất ướt (lerp theo dt — độc lập FPS)
  applyNow(dt = 0.016) {
    const g = this.game;
    const info = this.info();
    const eff = this.supernatural ? WEATHER_INFO[this.supernatural.type] : info;
    const scene = g.engine.scene;
    if (scene.fog) {
      const base = this.baseFog;
      const fogTarget = base * (1 + eff.fog * this.intensity);
      scene.fog.density += (fogTarget - scene.fog.density) * Math.min(1, dt * 2.5);
      // sương ma: tím nhòe
      const c = scene.fog.color;
      if (eff.purple) {
        c.lerp(new (c.constructor)(0x4a3a6a), Math.min(1, dt * 1.2));
      } else {
        c.lerp(new (c.constructor)(this.fogColor), Math.min(1, dt * 0.8));
      }
    }
    const sky = g.sky;
    if (sky?.mat) {
      const u = sky.mat.uniforms;
      const cloudTarget = 0.3 + eff.cloud * 0.65 * this.intensity;
      u.cloudCover.value += (Math.min(0.98, cloudTarget) - u.cloudCover.value) * Math.min(1, dt * 1.4);
    }
    // ánh sáng mờ khi bão
    if (sky?.sun) {
      const dim = eff.dim ? (1 - eff.dim * this.intensity) : 1;
      const flashBoost = this.flash > 0 ? (eff.lightning === 'purple' ? 3.5 : 5) : 0;
      sky.sun.intensity = sky.baseSunIntensity * dim + flashBoost;
      sky.hemi.intensity = sky.baseHemiIntensity * (0.75 + 0.25 * dim) + flashBoost * 0.35;
    }
    // mặt đất ướt (mưa)
    const wet = (eff.wet || 0) * this.intensity;
    const tm = g.world.terrain?.mat;
    if (tm) {
      this._terrainWet += (wet - this._terrainWet) * Math.min(1, dt * 0.6);
      tm.roughness = 0.96 - 0.41 * this._terrainWet;
      tm.envMapIntensity = 0.25 + 0.65 * this._terrainWet;
    }
  }

  // hệ số XP từ thời tiết (mưa linh khí) — đọc bởi progression
  xpMul() {
    const t = this.supernatural ? this.supernatural.type : this.type;
    return WEATHER_INFO[t]?.xpMul || 1;
  }

  serialize() {
    return { type: this.type, t: Math.round(this.timer), sup: this.supernatural ? { type: this.supernatural.type, t: Math.round(this.supernatural.t) } : null };
  }

  apply(data) {
    if (!data) return;
    this.setType(data.type || 'clear', { instant: true });
    if (Number.isFinite(data.t)) this.timer = data.t;
    if (data.sup) this.startSupernatural(data.sup.type), (this.supernatural.t = data.sup.t || 50);
  }
}
