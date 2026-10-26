// Game — chỉ điều phối các hệ đã tách riêng:
//  - Vòng lặp + FPS: engine Ticker. Vật lý: GravityEngine.
//  - Map: World. Nhân vật: Player, quái: Monster, vật phẩm: Pickup.
//  - Combat: combat.js, camera: camera.js, HUD: hud.js, hạt: effects.js.
//  - Renderer: renderer.js, spawn: spawner.js.
// Lưu ý trung thực: không dùng GameEngine facade làm vòng lặp chính, vì
// ticker của facade không có hook cho update của game; các subsystem của
// nó (Ticker, Physics, Particles, Input...) thì dùng trực tiếp 100%.
// HUD chỉ là chữ DOM (engine không có hệ HUD 2D); mọi thứ 3D đều qua engine.
import * as THREE from 'three';
import {
  EngineTicker as Ticker, EngineInputMap as InputMap, EngineParticleSystem as ParticleSystem,
  AudioBus, GravityEngine,
} from '../assets/engine-lib.js';
import { CONFIG } from './config.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Pickup } from './items.js';
import { findAttackHits } from './combat.js';
import { ThirdPersonCamera } from './camera.js';
import { renderHud } from './hud.js';
import { Effects } from './effects.js';
import { createRenderer } from './renderer.js';
import { spawnMonsters, spawnPickups } from './spawner.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 500);
    this.renderer = createRenderer(canvas);

    this.input = new InputMap();
    this.input.bind('sheath', { keys: ['KeyX'] });
    this.input.attach(window);
    this.particles = new ParticleSystem();
    this.scene.add(this.particles.group);
    this.effects = new Effects(this.particles);
    this.audio = new AudioBus();
    this.gravity = new GravityEngine({ g: CONFIG.gravity, terminalVelocity: CONFIG.terminalVelocity });
    this.world = new World(this.scene);
    this.player = new Player(this.scene);
    this.player.pos.y = this.world.heightAt(this.player.pos.x, this.player.pos.z);
    this.monsters = spawnMonsters(this.scene, this.world);
    this.pickups = spawnPickups(this.scene, this.world);
    this.cameraRig = new ThirdPersonCamera();
    this.time = 0;
    this.hud = null;
    this.ticker = new Ticker({
      fpsCap: CONFIG.fpsCap,
      update: (dt) => this.update(dt),
      render: () => {
        this.renderer.render(this.scene, this.camera);
        this.input.endFrame();
      },
    });
  }

  bindHud(el) { this.hud = el; }

  update(dt) {
    this.time += dt;
    this.cameraRig.updateFromMouse(this.input, this.canvas);
    const groundY = this.world.heightAt(this.player.pos.x, this.player.pos.z);
    const hitFrame = this.player.update(dt, this.input, groundY, this.cameraRig.yaw);
    if (hitFrame) this.resolvePlayerAttack();
    this.updateMonsters(dt);
    this.updatePickups(dt);
    this.world.update(dt);
    this.particles.update(dt);
    this.cameraRig.follow(this.camera, this.player.pos);
    renderHud(this.hud, { player: this.player, monsters: this.monsters, fps: this.ticker.stats.fps });
  }

  resolvePlayerAttack() {
    const hits = findAttackHits(this.player.pos, this.player.root.rotation.y, this.monsters);
    for (const m of hits) {
      const died = m.takeDamage(CONFIG.playerDamage);
      this.effects.burst(m.pos.clone().add(new THREE.Vector3(0, 1, 0)), 0xff4444);
      if (died) {
        this.player.kills += 1;
        this.effects.burst(m.pos.clone().add(new THREE.Vector3(0, 1, 0)), 0xffcc00);
        this.pickups.push(new Pickup(this.scene, m.pos.x + 1, m.pos.z, this.world.heightAt(m.pos.x + 1, m.pos.z), 'coin'));
      }
    }
  }

  updateMonsters(dt) {
    for (const m of this.monsters) {
      const hitPlayer = m.update(dt, this.player.pos, this.world.heightAt(m.pos.x, m.pos.z));
      if (hitPlayer && this.player.dodgeTimer <= 0) {
        this.player.hp = Math.max(0, this.player.hp - CONFIG.monsterDamage);
        this.effects.burst(this.player.pos.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xff2222);
        if (this.player.hp <= 0) this.respawnPlayer();
      }
      if (m.dead && m.deadTimer > CONFIG.monsterCorpseHideDelay) m.root.visible = false;
    }
  }

  updatePickups(dt) {
    for (const pk of this.pickups) {
      const got = pk.update(dt, this.player.pos);
      if (got === 'coin') this.player.coins += 1;
      if (got === 'heal') this.player.hp = Math.min(this.player.maxHp, this.player.hp + CONFIG.healAmount);
    }
  }

  respawnPlayer() {
    this.player.hp = this.player.maxHp;
    this.player.pos.set(CONFIG.spawn.x, this.world.heightAt(CONFIG.spawn.x, CONFIG.spawn.z), CONFIG.spawn.z);
  }

  start() {
    this.renderer.setSize(this.canvas.clientWidth || window.innerWidth, this.canvas.clientHeight || window.innerHeight, false);
    this.ticker.start();
  }
}
