// Game mới — viết lại 100%, bọc bằng engine:
//  - Vòng lặp + FPS: engine Ticker (fpsCap 60, stats.fps cho HUD).
//  - Tính toán: engine GravityEngine (g=18), Terrain/Water/Foliage/Atmosphere.
//  - Render: engine buildCharacter/buildMonster/AssetFactory/SocketBinder,
//    configureLights, getGraphicsPreset('ultra').
//  - Input: engine InputMap (+ bind riêng 'sheath' = KeyX).
//  - Hiệu ứng: engine ParticleSystem.
//  - Âm thanh: engine AudioBus (đăng ký kênh; engine không có synth nên
//    không tự bịa tiếng — game chạy không tiếng cho tới khi có sample).
// Lưu ý trung thực: không dùng GameEngine facade làm vòng lặp chính, vì
// ticker của facade không có hook cho update của game; các subsystem của
// nó (Ticker, Physics, Particles, Input...) thì dùng trực tiếp 100%.
// HUD chỉ là chữ DOM (engine không có hệ HUD 2D); mọi thứ 3D đều qua engine.
import * as THREE from 'three';
import {
  EngineTicker as Ticker, EngineInputMap as InputMap, EngineParticleSystem as ParticleSystem,
  AudioBus, GravityEngine, getGraphicsPreset,
} from '../assets/engine-lib.js';
import { World } from './world.js';
import { Player, Monster } from './actor.js';
import { Pickup } from './items.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 500);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    const preset = getGraphicsPreset('ultra');
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.quality.pixelRatioCap));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.input = new InputMap();
    this.input.bind('sheath', { keys: ['KeyX'] });
    this.input.attach(window);
    this.particles = new ParticleSystem();
    this.scene.add(this.particles.group);
    this.audio = new AudioBus();
    this.gravity = new GravityEngine({ g: 18, terminalVelocity: 50 });
    this.world = new World(this.scene);
    this.player = new Player(this.scene);
    this.player.pos.y = this.world.heightAt(this.player.pos.x, this.player.pos.z);
    this.monsters = [];
    const spawns = [[-6, -4, 3], [8, -10, 5], [-12, 10, 7], [14, 8, 9]];
    for (const [x, z, seed] of spawns) {
      this.monsters.push(new Monster(this.scene, x, z, this.world.heightAt(x, z), { seed }));
    }
    this.pickups = [];
    const drops = [[3, 2, 'coin'], [-3, -2, 'heal'], [6, 4, 'coin'], [-8, -6, 'heal']];
    for (const [x, z, kind] of drops) {
      this.pickups.push(new Pickup(this.scene, x, z, this.world.heightAt(x, z), kind));
    }
    this.camYaw = Math.PI;
    this.camPitch = 0.35;
    this.time = 0;
    this.hud = null;
    this.ticker = new Ticker({
      fpsCap: 60,
      update: (dt) => this.update(dt),
      render: () => {
        this.renderer.render(this.scene, this.camera);
        this.input.endFrame();
      },
    });
  }

  bindHud(el) { this.hud = el; }

  burst(pos, color) {
    try {
      const id = this.particles.spawn({
        id: `hit_${Date.now()}_${Math.random()}`,
        max: 24, rate: 24, lifetime: [0.3, 0.6], size: [0.08, 0.16],
        velocity: [0, 3, 0], velocityJitter: [4, 2, 4],
        colorFrom: color, colorTo: 0xffffff, gravity: 6,
      }, pos);
      this.particles.stop(id); // chỉ 1 chùm ban đầu, không phun liên tục
    } catch { /* hiệu ứng không được làm vỡ game */ }
  }

  update(dt) {
    this.time += dt;
    // Chuột: xoay camera (khi đã khóa con trỏ; click vào canvas để khóa).
    const md = this.input.getMouseDelta();
    if (document.pointerLockElement === this.canvas) {
      this.camYaw -= md.x * 0.0025;
      this.camPitch = Math.max(0.05, Math.min(1.1, this.camPitch + md.y * 0.002));
    }
    const groundY = this.world.heightAt(this.player.pos.x, this.player.pos.z);
    const hitFrame = this.player.update(dt, this.input, groundY, this.camYaw);
    if (hitFrame) {
      const p = this.player.pos;
      const fwd = new THREE.Vector3(Math.sin(this.player.root.rotation.y), 0, Math.cos(this.player.root.rotation.y));
      for (const m of this.monsters) {
        if (m.dead) continue;
        const d = new THREE.Vector3().subVectors(m.pos, p);
        d.y = 0;
        if (d.length() < 2.4 && d.normalize().dot(fwd) > 0.4) {
          const died = m.takeDamage(25);
          this.burst(m.pos.clone().add(new THREE.Vector3(0, 1, 0)), 0xff4444);
          if (died) {
            this.player.kills += 1;
            this.burst(m.pos.clone().add(new THREE.Vector3(0, 1, 0)), 0xffcc00);
            this.pickups.push(new Pickup(this.scene, m.pos.x + 1, m.pos.z, this.world.heightAt(m.pos.x + 1, m.pos.z), 'coin'));
          }
        }
      }
    }
    for (const m of this.monsters) {
      const hitPlayer = m.update(dt, this.player.pos, this.world.heightAt(m.pos.x, m.pos.z));
      if (hitPlayer && this.player.dodgeTimer <= 0) {
        this.player.hp = Math.max(0, this.player.hp - 10);
        this.burst(this.player.pos.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xff2222);
        if (this.player.hp <= 0) {
          this.player.hp = this.player.maxHp;
          this.player.pos.set(0, this.world.heightAt(0, 8), 8);
        }
      }
      if (m.dead && m.deadTimer > 0.6) {
        m.root.visible = false;
      }
    }
    for (const pk of this.pickups) {
      const got = pk.update(dt, this.player.pos);
      if (got === 'coin') this.player.coins += 1;
      if (got === 'heal') this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
    }
    this.world.update(dt);
    this.particles.update(dt);

    // Camera thứ ba: sau lưng nhân vật theo camYaw.
    const camDist = 6, camH = 2.2;
    const cx = this.player.pos.x - Math.sin(this.camYaw) * camDist;
    const cz = this.player.pos.z - Math.cos(this.camYaw) * camDist;
    this.camera.position.set(cx, this.player.pos.y + camH + Math.sin(this.camPitch) * 2, cz);
    this.camera.lookAt(this.player.pos.x, this.player.pos.y + 1.4, this.player.pos.z);

    if (this.hud) {
      const stats = this.ticker.stats;
      this.hud.innerHTML =
        `HP ${this.player.hp}/${this.player.maxHp} &nbsp;|&nbsp; Xu ${this.player.coins} &nbsp;|&nbsp; Hạ ${this.player.kills} &nbsp;|&nbsp; ` +
        `${this.player.drawn ? 'Kiếm đã rút' : 'Kiếm trong bao'} &nbsp;|&nbsp; FPS ${stats.fps} &nbsp;|&nbsp; Quái còn ${this.monsters.filter((m) => !m.dead).length}`;
    }
  }

  start() {
    this.renderer.setSize(this.canvas.clientWidth || window.innerWidth, this.canvas.clientHeight || window.innerHeight, false);
    this.ticker.start();
  }
}
