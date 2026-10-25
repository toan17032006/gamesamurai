// Game orchestrator: wires systems, states, the main loop, global keys, settings.
// Hai chế độ: campaign (15 chương) và infinite (Thế Giới Vô Cực theo seed).
import { Engine } from './core/engine.js';
import { Input } from './core/input.js';
import { CameraRig } from './core/cameraRig.js';
import { World } from './systems/world.js';
import { CombatSystem } from './systems/combat.js';
import { Progression } from './systems/progression.js';
import { Inventory } from './systems/inventory.js';
import { Crafting } from './systems/crafting.js';
import { QuestSystem } from './systems/quests.js';
import { SaveSystem } from './systems/saveSystem.js';
import { LevelManager } from './systems/levelManager.js';
import { WeatherSystem } from './systems/weather.js';
import { Sky } from './gfx/sky.js';
import { ParticleSystem } from './gfx/particles.js';
import { Vfx } from './gfx/vfx.js';
import { AudioMgr } from './gfx/audio.js';
import { Player } from './entities/player.js';
import { Npc } from './entities/npc.js';
import { Creature } from './entities/creature.js';
import { SettingsStore } from './framework/patterns/settings.js';
import { LEVEL_MAP, LEVELS } from './data/levels.js';

const SETTINGS_KEY = 'samurai_settings_v1';

export class Game {
  constructor(canvas) {
    this.engine = new Engine(canvas);
    this.input = new Input(canvas);
    this.cameraRig = new CameraRig(this.engine.camera, this.input);
    this.world = new World(this);
    this.combat = new CombatSystem(this);
    this.progression = new Progression(this);
    this.inventory = new Inventory(this);
    this.crafting = new Crafting(this);
    this.quests = new QuestSystem(this);
    this.saveSystem = new SaveSystem(this);
    this.levelManager = new LevelManager(this);
    this.weatherSys = new WeatherSystem(this);
    this.sky = new Sky(this.engine);
    this.particles = new ParticleSystem(this.engine.scene);
    this.vfx = new Vfx(this.engine.scene);
    this.audio = new AudioMgr();

    this.player = null;
    this.npcs = [];
    this.creatures = [];
    this.currentBoss = null;
    this.mode = 'campaign';        // campaign | infinite
    this.infinite = null;          // InfiniteWorld khi mode==='infinite'
    this.currentSlot = 'slot1';
    this.time = 0;
    this.state = 'boot'; // boot|menu|loading|playing|paused|dead|levelComplete|victory
    this.loadingStep = null;
    this.delayed = [];             // {t, fn} — hẹn giờ tôn trọng game loop

    // settings qua framework SettingsStore: mặc định + merge + persist + callback
    this.settingsStore = new SettingsStore({
      defaults: {
        quality: 'high', resolutionScale: 'auto', targetFps: 60, ao: true, grain: false,
        shadowQuality: 'high', vegDensity: 'normal', waterQuality: 'high', weatherFx: 'full',
        musicOn: true, sfxOn: true, ambOn: true,
        sensitivity: 1.0, invertY: false, volMaster: 0.8, volSfx: 0.9, volMusic: 0.45, volAmbient: 0.5,
      },
      storageKey: SETTINGS_KEY,
      onChanged: () => this.applySettings(),
    });
    this.applySettings();

    this.input.onEscape = () => this.handleEscape();
    this.input.onPanelKey = (action, e) => this.handlePanelAction(action, e);
    // any key/click skips a running cinematic (boss intro)
    const skipCin = () => { if (this.cameraRig.skipCinematic()) this.ui.setLetterbox(false); };
    window.addEventListener('keydown', skipCin);
    window.addEventListener('mousedown', skipCin);
    this.cameraRig.onCinematicEnd = () => this.ui.setLetterbox(false);
    this.elementalVision = false;
  }

  // ---- lifecycle ----------------------------------------------------------
  async start() {
    this.engine.setQuality(this.settings.quality);
    this.spawnPlayer();
    this.ui.showMenu();
    this.engine.start((dt, rawDt) => this.tick(dt, rawDt));
  }

  spawnPlayer() {
    this.player = new Player(this, { x: 0, y: 0, z: 60, name: 'Samurai vô danh', faction: 'player',
      stats: { maxHp: 100, attack: 14, defense: 3, speed: 5, poise: 40 },
      colors: { cloth: 0x2a3444, skin: 0xd8b090, hair: 0x14100c, accent: 0x8a2a2a },
    });
    this.inventory.applyToRig();
    this.progression.applyToPlayer();
    this.player.hp = this.player.maxHp;
    this.player.stamina = this.player.maxStamina;
  }

  // reset các hệ thống runtime giữa 2 ván (dọn cả thực thể cũ)
  resetRunState() {
    this.progression = new Progression(this);
    this.inventory = new Inventory(this);
    this.quests = new QuestSystem(this);
    this.levelManager = new LevelManager(this);
    for (const c of [...this.creatures]) this.removeCreature(c);
    for (const n of [...this.npcs]) this.removeNpc(n, true);
    this.combat.clearProjectiles();
    this.delayed.length = 0;
    this.player.combat.dead = false;
    this.player.combat.iframes = 0;
    this.player.applyCharacter({ index: 0 });
    this.progression.applyToPlayer();
    this.player.hp = this.player.maxHp;
    this.player.stamina = this.player.maxStamina;
    this.inventory.addItem('bandage', 2);
    this.audio.ensure();
  }

  newGame(slot) {
    this.currentSlot = slot || 'slot1';
    this.mode = 'campaign';
    this.infinite = null;
    this.resetRunState();
    this.levelManager.unlockInitial();
    this.enterLevel('L01');
  }

  // ---- Thế Giới Vô Cực ------------------------------------------------------
  startInfinite(slot, seedStr) {
    this.currentSlot = slot || 'slot1';
    this.mode = 'infinite';
    this.resetRunState();
    try {
      this.infinite = this.world.enterInfinite(seedStr);
      this.infinite.seedSource = seedStr; // giữ chuỗi gốc để hiển thị + save đúng seed
    } catch (err) {
      console.error('[infinite] failed', err);
      this.ui.notify('bad', 'Lỗi tạo thế giới: ' + err.message);
      return;
    }
    this.infinite.onDiscover = (def, info) => {
      this.ui.notify('quest', `Khám phá: ${def.name} (nguy hiểm ${info.danger})`);
      this.saveSystem.save(this.currentSlot, { silent: true });
    };
    this.infinite.onCellChange = (def) => this.onInfiniteCellChange(def);
    // đặt người chơi ra giữa ô xuất phát
    const px = 0, pz = 0;
    this.player.respawnAt(px, pz, this);
    this.player.yaw = Math.PI;
    this.cameraRig.yaw = 0; this.cameraRig.pitch = 0.3;
    this.state = 'playing';
    this.input.enabled = true;
    this.ui.showHud();
    this.input.requestPointer();
    this.ui.notify('quest', `THẾ GIỚI VÔ CỰC — seed "${seedStr}" · nguy hiểm tăng theo khoảng cách`);
    this.weatherSys.configure(this.world.infinite.cellDef(0, 0));
    this.audio.startAmbient('wind');
    this.audio.startMusic();
    this.saveSystem.save(this.currentSlot, { silent: true });
  }

  // sang ô mới trong thế giới vô cực: đổi pool thời tiết theo biome + cập nhật điểm hồi sinh
  onInfiniteCellChange(def) {
    const w = this.weatherSys;
    if (w._configuredBiome !== def.biome) {
      w.configure(def);
      w._configuredBiome = def.biome;
    }
    this.progression.respawnPoint = { x: Math.round(this.player.pos.x / 168) * 168, z: Math.round(this.player.pos.z / 168) * 168 };
  }

  async continueGame(slot) {
    const data = await this.saveSystem.load(slot);
    if (!data) { this.ui.notify('bad', 'Không đọc được dữ liệu lưu'); return false; }
    this.currentSlot = slot;
    // thế giới vô cực đã lưu → trở lại đúng seed + vùng đã khám phá
    if (data.world?.mode === 'infinite' && data.world.seed !== undefined) {
      this.mode = 'infinite';
      this.resetRunState();
      this.progression.apply(data.player);
      this.inventory.apply(data.player.inventory);
      this.quests.apply(data.progress?.quests);
      try {
        // ưu tiên chuỗi seed gốc (nếu có) — nếu chỉ có số thì dùng số trực tiếp (cùng thế giới)
        this.infinite = this.world.enterInfinite(data.world.seedSource ?? data.world.seed);
      } catch (err) {
        console.error('[infinite] failed to restore', err);
        this.ui.notify('bad', 'Lỗi tái tạo thế giới: ' + err.message);
        return false;
      }
      this.infinite.onDiscover = (def, info) => {
        this.ui.notify('quest', `Khám phá: ${def.name} (nguy hiểm ${info.danger})`);
        this.saveSystem.save(this.currentSlot, { silent: true });
      };
      this.infinite.onCellChange = (def) => this.onInfiniteCellChange(def);
      this.infinite.seedSource = data.world.seedSource || null;
      this.infinite.apply(data.world);
      this.player.applyCharacter(data.player.character);
      this.progression.applyToPlayer();
      this.inventory.applyToRig();
      this.player.hp = Math.max(1, data.player.hp || this.player.maxHp);
      const pos = data.world.pos || { x: 0, z: 0 };
      this.player.respawnAt(pos.x, pos.z, this);
      if (data.player.pos?.y !== undefined) this.player.pos.y = data.player.pos.y;
      const cdef = this.infinite.cellDef(Math.round(pos.x / 168), Math.round(pos.z / 168));
      this.weatherSys.configure(cdef);
      this.weatherSys._configuredBiome = cdef.biome;
      this.weatherSys.apply(data.weather);
      this.state = 'playing';
      this.input.enabled = true;
      this.ui.showHud();
      this.input.requestPointer();
      this.ui.notify('save', `Tiếp tục Thế Giới Vô Cực (seed "${data.world.seed}")`);
      this.audio.startMusic();
      return true;
    }
    // campaign
    this.mode = 'campaign';
    this.progression.apply(data.player);
    this.inventory.apply(data.player.inventory);
    this.quests.apply(data.progress?.quests);
    this.levelManager.apply(data.progress?.levels);
    this.player.combat.dead = false;
    this.player.applyCharacter(data.player.character);
    this.progression.applyToPlayer();
    this.player.hp = Math.max(1, data.player.hp || this.player.maxHp);
    this.inventory.applyToRig();
    this.audio.ensure();
    let levelId = data.meta?.levelId && LEVEL_MAP[data.meta.levelId] ? data.meta.levelId : 'L01';
    // if the saved level is already completed, resume at the next unlocked one
    if (this.levelManager.isCompleted(levelId)) {
      const nextUnlocked = LEVELS.find((l) => this.levelManager.isUnlocked(l.id) && !this.levelManager.isCompleted(l.id));
      if (nextUnlocked) levelId = nextUnlocked.id;
    }
    this.enterLevel(levelId);
    return true;
  }

  async enterLevel(levelId) {
    this.state = 'loading';
    this.input.enabled = false;
    this.ui.showLoading(levelId);
    // yield a frame so the loading screen paints before the heavy build
    await new Promise((r) => setTimeout(r, 50));
    try {
      await this.levelManager.startLevel(levelId);
      this.state = 'playing';
      this.input.enabled = true;
      this.ui.showHud();
      this.input.requestPointer();
    } catch (err) {
      console.error('[level] failed to load', err);
      this.ui.notify('bad', 'Lỗi tải khu vực: ' + err.message);
      this.state = 'menu';
      this.ui.showMenu();
    }
  }

  removeNpc(n, immediate = false) {
    const i = this.npcs.indexOf(n);
    if (i >= 0) this.npcs.splice(i, 1);
    if (this.currentBoss === n) this.currentBoss = null;
    n.dispose(this);
  }

  spawnNpc(opts) { const n = new Npc(this, opts); this.npcs.push(n); return n; }
  spawnProjectile(opts) { this.combat.spawnProjectile(opts); }

  // ---- creatures (hoang dã) ---------------------------------------------------
  spawnCreature(opts) {
    const c = new Creature(this, opts);
    this.creatures.push(c);
    return c;
  }

  removeCreature(c) {
    const i = this.creatures.indexOf(c);
    if (i >= 0) this.creatures.splice(i, 1);
    c.dispose(this);
  }

  // hẹn giờ tôn trọng game loop (dùng cho đòn có delay như AoE rồng)
  delay(t, fn) { this.delayed.push({ t, fn }); }
  updateDelayed(dt) {
    for (let i = this.delayed.length - 1; i >= 0; i--) {
      const d = this.delayed[i];
      d.t -= dt;
      if (d.t <= 0) { this.delayed.splice(i, 1); try { d.fn(); } catch (e) { console.error('[delayed]', e); } }
    }
  }

  // ---- states -------------------------------------------------------------
  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.enabled = false;
    this.input.releasePointer();
    this.ui.showPause();
    this.saveSystem.save(this.currentSlot, { silent: true });
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.input.enabled = true;
    this.ui.showHud();
    this.input.requestPointer();
  }

  handleEscape() {
    if (this.ui?.chatOpen) { this.ui.closeChat(); return; }
    if (this.ui?.panels.isOpen()) { this.ui.panels.closeAll(); if (this.state === 'playing') this.input.requestPointer(); return; }
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  handlePanelAction(action, e) {
    if (!action) return;
    if (this.ui?.chatOpen) return; // đang gõ chat: phím thuộc về ô nhập
    if (action === 'chat') {
      if (this.state === 'playing') { e.preventDefault(); this.ui.openChat(); }
      return;
    }
    const panelActions = {
      inventory: 'inventory', character: 'character', quests: 'quests', map: 'map',
      handbook: 'handbook', multiplayer: 'multiplayer', formation: 'formation', quickwheel: 'quickwheel',
    };
    const id = panelActions[action];
    if (!id) return;
    if (this.state === 'playing' || this.ui.panels.isOpen()) {
      e.preventDefault();
      this.ui.panels.toggle(id);
    }
  }

  switchCharacter(index) {
    if (!this.player || this.state !== 'playing') return false;
    const ok = this.player.switchCharacter(index);
    if (ok) this.saveSystem.save(this.currentSlot, { silent: true });
    return ok;
  }

  onPlayerDeath() {
    if (this.state !== 'playing') return;
    this.state = 'dead';
    this.progression.stats.deaths++;
    // death penalty: lose 15% carried coins
    const lost = Math.floor(this.inventory.coins * 0.15);
    if (lost > 0) {
      this.inventory.addCoins(-lost);
      this.ui.notify('bad', `Mất ${lost} vàng vì tử trận`);
    }
    this.input.enabled = false;
    this.input.releasePointer();
    this.ui.showDeath();
  }

  async respawnPlayer() {
    if (this.mode === 'infinite') {
      const rp = this.progression.respawnPoint;
      this.player.respawn(rp ? [rp.x, rp.z] : [0, 0]);
    } else {
      const rp = this.progression.respawnPoint;
      this.player.respawn(rp ? [rp.x, rp.z] : this.world.spawnPoint);
    }
    // calm nearby enemies
    for (const n of this.npcs) { n.aggro = false; n.target = null; n.state = 'patrol'; }
    this.state = 'playing';
    this.input.enabled = true;
    this.ui.showHud();
    this.input.requestPointer();
  }

  retryLevel() {
    this.enterLevel(this.levelManager.currentId);
  }

  onLevelComplete(def, next, rewards) {
    if (!next) {
      this.state = 'victory';
      this.input.enabled = false;
      this.input.releasePointer();
      this.ui.showVictory(def);
      return;
    }
    this.state = 'levelComplete';
    this.input.enabled = false;
    this.input.releasePointer();
    this.ui.showLevelComplete(def, next, rewards);
  }

  toMenu() {
    this.state = 'menu';
    this.mode = 'campaign';
    this.infinite = null;
    this.input.enabled = false;
    this.input.releasePointer();
    this.saveSystem.save(this.currentSlot, { silent: true });
    this.ui.showMenu();
  }

  get settings() { return this.settingsStore.all; }

  // ---- settings -----------------------------------------------------------
  loadSettings() { /* SettingsStore tự load/merge khi khởi tạo */ }

  saveSettings() { this.settingsStore.persist(); }

  applySettings() {
    const s = this.settings;
    this.engine.setQuality(s.quality);
    this.engine.setOptions({
      resolutionScale: s.resolutionScale, targetFps: s.targetFps, ao: s.ao, grain: s.grain,
      shadowQuality: s.shadowQuality, waterQuality: s.waterQuality,
    });
    this.cameraRig.sensitivity = 0.0022 * s.sensitivity;
    this.cameraRig.invertY = s.invertY;
    this.audio.volumes = { master: s.volMaster, sfx: s.volSfx, music: s.volMusic, ambient: s.volAmbient };
    this.audio.applyVolumes();
    this.audio.setToggles({ musicOn: s.musicOn, sfxOn: s.sfxOn, ambOn: s.ambOn });
    if (s.musicOn && !this.audio.musicTimer && this.audio.ctx && this.state !== 'boot') this.audio.startMusic();
    // chất lượng nước: tắt hẳn mặt nước/dung nham
    const wq = s.waterQuality;
    if (this.world.waterSurface) this.world.waterSurface.mesh.visible = wq !== 'off';
    if (this.world.lavaSurface) this.world.lavaSurface.mesh.visible = wq !== 'off';
    this.saveSettings();
  }

  // ---- main loop ----------------------------------------------------------
  tick(dt, rawDt) {
    this.updateDelayed(dt);
    if (this.state === 'playing' && !this.ui.panels.isOpen()) {
      this.time += dt;
      this.progression.stats.playtime += rawDt;
      this.player.update(dt, this);
      for (const n of [...this.npcs]) n.update(dt, this);
      for (const c of [...this.creatures]) c.update(dt, this);
      this.combat.updateProjectiles(dt);
      this.world.update(dt);
      if (this.mode === 'campaign') this.levelManager.update(dt);
      this.weatherSys.update(dt, this.player.pos);
      this.cameraRig.update(dt, this.player.pos, this.world, this.player.moveMode === 'sprint');
      // hide the body in first person so the head mesh doesn't block the view
      const firstPerson = this.cameraRig.mode === 'first';
      if (this.player.rig.group.visible === firstPerson) this.player.rig.setVisible(!firstPerson);
      this.updateInteractPrompt();
      // thị giác nguyên tố (giữ chuột giữa)
      const vision = this.input.isDown('vision') && !this.ui.chatOpen;
      if (vision !== this.elementalVision) {
        this.elementalVision = vision;
        this.ui.hud.setVision(vision);
      }
    } else {
      if (this.elementalVision) { this.elementalVision = false; this.ui.hud.setVision(false); }
      // menus: keep world visuals alive subtly
      this.cameraRig.update(rawDt, this.player ? this.player.pos : { x: 0, y: 0, z: 0 }, this.world, false);
    }
    this.particles.update(dt || rawDt);
    this.vfx.update(dt || rawDt);
    this.sky.update(this.player ? this.player.pos : { x: 0, y: 0, z: 0 });
    this.ui.frame(rawDt);
    this.input.endFrame();
  }

  updateInteractPrompt() {
    const t = this.world.nearestInteractable(this.player.pos, 2.6);
    this.ui.hud.setPrompt(t ? t.prompt() : '');
  }
}
