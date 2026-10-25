// Infinite World: thế giới vô cực ghép từ 15 bản đồ nền theo seed.
// - Trường địa hình toàn cục liên tục (không đứt gãy giữa các ô) từ noise xác định.
// - Streaming ô: bán kính 1 đầy đủ, ring 2 LOD terrain, dỡ Beyond; tối đa 1 ô build/frame.
// - Trạng thái ô (đã khám phá/dọn sạch/boss) tách khỏi dữ liệu định nghĩa, lưu vào save.
import * as THREE from 'three';
import { mulberry32, makeNoise2D, clamp } from '../core/utils.js';
import { buildTerrain } from '../gfx/terrain.js';
import { buildGrass } from '../gfx/grass.js';
import { mergeStaticProps } from '../gfx/merge.js';
import { REGIONS, REGION_BASE } from '../data/regions.js';
import { biomeForCell, cellSeed, cellRandom, makeFieldSampler } from './worldgen.js';
import { BOSSES } from '../data/bosses.js';
import { Dragon } from '../entities/dragon.js';
import { Boss } from '../entities/boss.js';
import { WaterSurface } from '../gfx/water.js';

export const CELL = 168;            // cạnh một ô vùng (m)
export const FULL_RADIUS = 1;       // ô đầy đủ (3×3)
export const LOD_RADIUS = 2;        // ring terrain đơn giản (5×5)

const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export class InfiniteWorld {
  constructor(world, seed) {
    this.world = world;
    this.game = world.game;
    this.seed = seed >>> 0;
    this.cells = new Map();        // "cx,cz" -> cell runtime (đang build)
    this.cellStates = new Map();   // "cx,cz" -> {explored, cleared, bossKilled} (bền vững)
    this.fields = makeFieldSampler(this.seed);
    this.baseN = makeNoise2D(this.seed ^ 0xabcd);
    this.ridgeN = makeNoise2D(this.seed ^ 0x77aa);
    this.centerCache = new Map();  // "cx,cz" -> height nền tại tâm ô (flatten landmark)
    this.waypoint = null;
    this._buildQueue = [];
    this.onDiscover = null;        // callback(biome def) khi khám phá ô mới
    this.group = new THREE.Group();
    world.group.add(this.group);
    this.disposed = false;
  }

  key(cx, cz) { return `${cx},${cz}`; }
  cellKeyAt(x, z) { return this.key(Math.round(x / CELL), Math.round(z / CELL)); }
  stateFor(k) {
    let s = this.cellStates.get(k);
    if (!s) { s = { explored: false, scouted: false, cleared: false, bossKilled: false }; this.cellStates.set(k, s); }
    return s;
  }
  biomeOf(cx, cz) {
    const k = this.key(cx, cz);
    let b = this._biomeCache?.get(k);
    if (!b) {
      b = biomeForCell(this.seed, cx, cz);
      (this._biomeCache ||= new Map()).set(k, b);
      if (this._biomeCache.size > 1024) this._biomeCache.clear();
    }
    return b;
  }

  // ---- trường địa hình toàn cục (liên tục qua ranh giới ô) -------------------
  heightAt(x, z) {
    const elev = this.fields.elevation(x / CELL, z / CELL);
    const temp = this.fields.temperature(x / CELL, z / CELL);
    // nền đồi
    let h = this.baseN.fbm(x * 0.011 + 10, z * 0.011 + 10, 4) * 2.3;
    // núi cao nơi elevation field cao — biên độ liên tục nên không có seam
    const mountain = smoothstep(0.14, 0.42, elev);
    const ridge = Math.abs(this.ridgeN.fbm(x * 0.028, z * 0.028, 3));
    h += mountain * (5.5 + ridge * 7);
    // núi tuyết nhấp nhô hơn nơi lạnh
    h += smoothstep(-0.12, -0.34, temp) * ridge * 3;

    // đặc trưng theo ô lân cận (3×3 quanh điểm truy vấn)
    const cx0 = Math.round(x / CELL), cz0 = Math.round(z / CELL);
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = cx0 + dx, cz = cz0 + dz;
        const info = this.biomeOf(cx, cz);
        const b = info.biome;
        if (b === 'lake' || b === 'wetland') {
          const [ox, oz] = this.featureOffset(cx, cz, 17);
          const lx = cx * CELL + ox, lz = cz * CELL + oz;
          const d = Math.hypot(x - lx, z - lz) / (CELL * 0.52);
          const dep = smoothstep(1, 0, d);
          h -= dep * dep * 2.6;
        } else if (b === 'volcano') {
          const [ox, oz] = this.featureOffset(cx, cz, 23);
          const lx = cx * CELL + ox, lz = cz * CELL + oz;
          const d = Math.hypot(x - lx, z - lz) / (CELL * 0.6);
          const cone = smoothstep(1, 0.15, d);
          h += cone * cone * 12;
          const crater = smoothstep(8.5, 0, Math.hypot(x - lx, z - lz));
          h -= crater * crater * 5.2;
        } else if (b === 'cave') {
          // vành đá vây quanh (bowl) — PHẢI tắt dần về 0 trước mép ảnh hưởng
          // (tầm 0.4*CELL) để không tạo seam khi ô rơi khỏi vùng 3×3
          const [ox, oz] = this.featureOffset(cx, cz, 29);
          const lx = cx * CELL + ox, lz = cz * CELL + oz;
          const d = Math.hypot(x - lx, z - lz) / (CELL * 0.4);
          const ring = smoothstep(0.35, 0.9, d) * (1 - smoothstep(0.9, 1.0, d));
          h += ring * ring * 8;
        } else if (b === 'village' || b === 'shrine' || b === 'castle' || b === 'throne_hall') {
          // làm phẳng tâm ô cho landmark — nội suy về cao độ nền tâm ô
          const [ox, oz] = this.featureOffset(cx, cz, 31);
          const lx = cx * CELL + ox, lz = cz * CELL + oz;
          const d = Math.hypot(x - lx, z - lz);
          const f = smoothstep(26, 6, d);
          if (f > 0) h = this.centerHeight(cx, cz, lx, lz) * f + h * (1 - f);
        }
      }
    }

    // sông toàn cục: dải chảy dọc bắc-nam, uốn theo noise — cắt sâu dưới mực nước
    const riverPath = this.baseN.fbm(z * 0.0085 + 3.3, 7.7, 2) * 55;
    const rd = Math.abs(x - riverPath);
    if (rd < 14) {
      const carve = smoothstep(14, 3.5, rd);
      h = h * (1 - carve) + (-1.9) * carve;
    }
    return h;
  }

  // offset xác định cho feature của ô (giữ trong ô, tránh đè ranh giới)
  featureOffset(cx, cz, salt) {
    const rng = cellRandom(this.seed, cx, cz, salt);
    return [(rng() - 0.5) * CELL * 0.4, (rng() - 0.5) * CELL * 0.4];
  }

  centerHeight(cx, cz, lx, lz) {
    const k = this.key(cx, cz);
    let v = this.centerCache.get(k);
    if (v === undefined) {
      // cao độ "nền" tại tâm không tính flatten (tránh đệ quy): bỏ thành phần flatten của chính nó
      const elev = this.fields.elevation(cx, cz);
      const temp = this.fields.temperature(cx, cz);
      v = this.baseN.fbm(lx * 0.011 + 10, lz * 0.011 + 10, 4) * 2.3
        + smoothstep(0.14, 0.42, elev) * 6
        + smoothstep(-0.12, -0.34, temp) * 2;
      this.centerCache.set(k, v);
      if (this.centerCache.size > 512) this.centerCache.clear();
    }
    return v;
  }

  // ---- streaming --------------------------------------------------------------
  ensureInitial() {
    // build ngay 3×3 ô đầu (đồng bộ) để player không rơi vào hư không
    for (let dz = -FULL_RADIUS; dz <= FULL_RADIUS; dz++) {
      for (let dx = -FULL_RADIUS; dx <= FULL_RADIUS; dx++) {
        this.buildCell(dx, dz, false);
      }
    }
    this.curCell = { cx: 0, cz: 0 };
  }

  update(playerPos) {
    if (this.disposed || !playerPos) return;
    const ccx = Math.round(playerPos.x / CELL), ccz = Math.round(playerPos.z / CELL);
    // hàng đợi build: ring 2 trước (LOD rẻ), tối đa 1 ô/frame tránh khựng
    const missing = [];
    for (let dz = -LOD_RADIUS; dz <= LOD_RADIUS; dz++) {
      for (let dx = -LOD_RADIUS; dx <= LOD_RADIUS; dx++) {
        const cx = ccx + dx, cz = ccz + dz;
        if (!this.cells.has(this.key(cx, cz))) missing.push({ cx, cz, r: Math.max(Math.abs(dx), Math.abs(dz)) });
      }
    }
    if (missing.length) {
      missing.sort((a, b) => a.r - b.r || (Math.abs(a.cx - ccx) + Math.abs(a.cz - ccz)) - (Math.abs(b.cx - ccx) + Math.abs(b.cz - ccz)));
      // ngân sách thời gian mỗi khung: build đủ nhiều ô trong ~12ms (nhanh ở FPS cao, không khựng ở FPS thấp)
      const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      for (const n of missing) {
        this.buildCell(n.cx, n.cz, n.r > FULL_RADIUS);
        const spent = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
        if (spent > 12) break;
      }
    }
    // dỡ ô ngoài tầm
    for (const [k, cell] of [...this.cells]) {
      if (Math.max(Math.abs(cell.cx - ccx), Math.abs(cell.cz - ccz)) > LOD_RADIUS + 0.4) this.unloadCell(k, cell);
    }
    // khám phá: ô hiện tại đầy đủ, ô kề bên "trinh sát" (hiện mờ trên bản đồ)
    const curKey = this.key(ccx, ccz);
    this.curCell = { cx: ccx, cz: ccz };
    const st = this.stateFor(curKey);
    if (!st.explored) {
      st.explored = true;
      const info = this.biomeOf(ccx, ccz);
      const def = REGION_BASE[info.biome];
      if (this.onDiscover && def) this.onDiscover(def, info);
    }
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dz === 0) continue;
        const ns = this.stateFor(this.key(ccx + dx, ccz + dz));
        if (!ns.explored) ns.scouted = true;
      }
    }
    if (curKey !== this._lastCellKey) {
      this._lastCellKey = curKey;
      this.onCellChange?.(this.cellDef(ccx, ccz));
    }
    // dọn sạch ô (tất cả địch của ô đã chết) → báo một lần
    const cur = this.cells.get(curKey);
    if (cur && cur.spawnedEnemies && !st.cleared) {
      const alive = cur.npcs.some((n) => !n.combat.dead && !n.isBoss);
      if (cur.spawnedEnemies > 0 && !alive) {
        st.cleared = true;
        this.game.ui.notify('good', 'Vùng đã an toàn');
      }
    }
    // boss chết?
    if (cur && cur.boss && cur.boss.combat.dead && !st.bossKilled) {
      st.bossKilled = true;
      this.game.ui.notify('level', 'Đã hạ chủ vùng! Vùng này an toàn.');
    }
    // mặt dung nham gần nhất (nếu có ô núi lửa active)
    this.updateLava(playerPos);
  }

  updateLava(playerPos) {
    let best = null, bestD = Infinity;
    for (const cell of this.cells.values()) {
      if (cell.biome !== 'volcano' || cell.lavaLevel === undefined) continue;
      const d = Math.hypot(cell.cx * CELL - playerPos.x, cell.cz * CELL - playerPos.z);
      if (d < bestD) { bestD = d; best = cell; }
    }
    const w = this.world;
    w.hazards = w.hazards.filter((h) => h.type !== 'lava');
    if (best) {
      if (!w.lavaSurface) w.lavaSurface = new WaterSurface(w.group.parent, { size: 64, lava: true, segments: 20 });
      w.lavaSurface.snap(best.lavaLevel);
      w.lavaSurface.recenter(best.lavaX, best.lavaZ);
      w.hazards.push({ type: 'lava', level: best.lavaLevel, x: best.lavaX, z: best.lavaZ, r: 6.6, cell: best.key });
    } else if (w.lavaSurface) {
      w.lavaSurface.snap(-9999);
    }
  }

  // ---- build/unbuild một ô ------------------------------------------------------
  cellDef(cx, cz) {
    const info = this.biomeOf(cx, cz);
    const base = REGION_BASE[info.biome] || REGION_BASE.outskirts;
    const seed = cellSeed(this.seed, cx, cz);
    return {
      ...base,
      id: `inf_${cx}_${cz}`,
      name: `${base.name} [${cx > 0 ? '+' : ''}${cx},${cz > 0 ? '+' : ''}${cz}]`,
      size: CELL,
      seed,
      danger: info.danger,
      biome: info.biome,
    };
  }

  buildCell(cx, cz, lod) {
    const k = this.key(cx, cz);
    if (this.cells.has(k)) return;
    const def = this.cellDef(cx, cz);
    const state = this.stateFor(k);
    const rng = mulberry32(def.seed);
    const noise = makeNoise2D(def.seed);
    const cell = {
      cx, cz, key: k, biome: def.biome, danger: def.danger, def,
      group: new THREE.Group(),
      colliders: [], interactables: [], waterfalls: [], hazards: [],
      npcs: [], creatures: [],
      owned: [], spawnedEnemies: 0, boss: null, lod: !!lod,
    };
    this.cells.set(k, cell);
    this.group.add(cell.group);

    const world = this.world;
    const qk = lod ? 'low' : this.game.engine.qualityKey;
    const ter = buildTerrain(world, def, qk);
    cell.group.add(ter.mesh);
    cell.owned.push(ter);
    cell.terrain = ter;

    if (!lod) {
      // nội dung đầy đủ: props + landmark + cỏ + sinh vật + địch + interactables
      this.world.buildCellContent(cell, def, rng, noise);
      const grass = buildGrass(world, def, rng, noise, qk, world.vegDensity() * 0.62);
      if (grass) { cell.group.add(grass.mesh); cell.owned.push(grass); cell.grass = grass; }
      for (const m of mergeStaticProps(cell.group, CELL / 5)) cell.owned.push({ mesh: m, geo: m.geometry });
      this.spawnCellContent(cell, def, rng);
    } else {
      // LOD: vài tảng đá để silhouette không trống
      for (let i = 0; i < 6; i++) {
        const x = cx * CELL + (rng() - 0.5) * CELL * 0.9;
        const z = cz * CELL + (rng() - 0.5) * CELL * 0.9;
        const y = this.heightAt(x, z);
        if (y < -1.0) continue; // dưới nước
        const geo = new THREE.DodecahedronGeometry(2.5 + rng() * 4);
        const mat = new THREE.MeshStandardMaterial({ color: def.palette.rock, roughness: 0.95, flatShading: true });
        const rock = new THREE.Mesh(geo, mat);
        rock.position.set(x, y - 0.6, z);
        cell.group.add(rock);
        cell.owned.push({ geo, mat });
      }
    }
    // gắn tag cho colliders + đẩy vào danh sách toàn cục
    for (const c of cell.colliders) c.cell = k;
    world.colliders.push(...cell.colliders);
    world.waterfalls.push(...cell.waterfalls);
    if (cell.hazards.length) world.hazards.push(...cell.hazards);
    // mực nước/lava cho ô đặc trưng
    if (!lod && def.biome === 'volcano') {
      const [ox, oz] = this.featureOffset(cx, cz, 23);
      cell.lavaX = cx * CELL + ox; cell.lavaZ = cz * CELL + oz;
      cell.lavaLevel = this.heightAt(cell.lavaX, cell.lavaZ) + 0.9;
    }
    return cell;
  }

  unloadCell(k, cell) {
    const world = this.world;
    const game = this.game;
    this.cells.delete(k);
    this.group.remove(cell.group);
    for (const o of cell.owned) {
      if (o.geo) o.geo.dispose();
      if (o.mat) o.mat.dispose();
    }
    if (cell.grass) cell.grass.geo.dispose();
    world.colliders = world.colliders.filter((c) => c.cell !== k);
    world.waterfalls = world.waterfalls.filter((w) => w.cell !== k);
    world.hazards = world.hazards.filter((h) => h.cell !== k);
    // interactables của ô
    for (const it of [...world.interactables]) {
      if (it.cell === k) { it.dispose(game); world.interactables.splice(world.interactables.indexOf(it), 1); }
    }
    // NPC còn sống của ô: dỡ im lặng (spawn lại khi quay lại nếu ô chưa cleared)
    for (const n of cell.npcs) {
      const i = game.npcs.indexOf(n);
      if (i >= 0) game.npcs.splice(i, 1);
      if (game.currentBoss === n) game.currentBoss = null;
      if (!n.disposed) n.dispose(game);
    }
    for (const c of cell.creatures) {
      if (!c.disposed) {
        const i = game.creatures.indexOf(c);
        if (i >= 0) game.creatures.splice(i, 1);
        c.dispose(game);
      }
    }
  }

  // spawn nội dung động (địch/wildlife/interactables) — chỉ lần đầu, nếu ô chưa cleared
  spawnCellContent(cell, def, rng) {
    const game = this.game;
    const world = this.world;
    const cx = cell.cx * CELL, cz = cell.cz * CELL;
    const danger = cell.danger;
    const levelScale = 1 + (danger - 1) * 0.2;

    // đài hồi sinh mỗi ô (checkpoint di động)
    const sx = cx + (rng() - 0.5) * 8, sz = cz + CELL * 0.34;
    world.addInteractable({ type: 'shrine', x: sx, z: sz });
    // tài nguyên theo biome
    if (def.resources) world.spawnResourceNodes(def.resources, CELL);
    // thương nhân ở làng/đền
    if (def.biome === 'village' || def.biome === 'shrine') {
      world.addInteractable({ type: 'merchant', x: sx - 5, z: sz - 3 });
    }
    // rương hiếm
    if (rng() < 0.4) {
      const lootCoins = 30 + danger * 25;
      world.addInteractable({ type: 'chest', x: cx + (rng() - 0.5) * CELL * 0.6, z: cz + (rng() - 0.5) * CELL * 0.6,
        data: { loot: [{ id: 'bandage', qty: 2 }, { id: 'iron_ore', qty: 2 }], coins: lootCoins } });
    }
    // sinh vật hoang dã
    if (def.wildlife) world.spawnWildlife(def.wildlife, CELL, def.seed + 3);
    // địch theo danger (ô đã cleared thì bỏ qua)
    const state = this.stateFor(cell.key);
    if (!state.cleared && def.enemies && def.enemies.length) {
      const count = Math.min(6, 1 + Math.floor(danger * 0.9));
      for (let i = 0; i < count; i++) {
        const enemyId = def.enemies[(rng() * def.enemies.length) | 0];
        const x = cx + (rng() - 0.5) * CELL * 0.8;
        const z = cz + (rng() - 0.5) * CELL * 0.8;
        if (Math.hypot(x - game.player.pos.x, z - game.player.pos.z) < 22) continue; // không spawn sát người
        const n = game.spawnNpc({ enemyId, x, z, levelScale });
        n.cell = cell.key;
        cell.npcs.push(n);
        cell.spawnedEnemies++;
      }
      // boss ô nguy hiểm: dùng boss sẵn có hoặc RỒNG (danger ≥ 6, xác suất)
      const bossRoll = cellRandom(this.seed, cell.cx, cell.cz, 77)();
      const isDragonCell = danger >= 6 && bossRoll < 0.34;
      if (danger >= 5 && !state.bossKilled) {
        let boss = null;
        if (isDragonCell) {
          boss = new Dragon(game, { x: cx, z: cz - 10, levelScale });
        } else {
          const pool = danger >= 7 ? ['oni_general', 'ashura_lord'] : danger >= 6 ? ['ashura_lord', 'ronin_master'] : ['bandit_king', 'ronin_master'];
          const bossId = pool[(bossRoll * 10 | 0) % pool.length];
          boss = new Boss(game, { bossId, x: cx, z: cz - 10, levelScale });
        }
        boss.cell = cell.key;
        cell.npcs.push(boss);
        cell.boss = boss;
        game.npcs.push(boss);
        game.ui.notify('boss', `${boss.name} trấn giữ vùng này!`);
      }
    }
  }

  dispose() {
    this.disposed = true;
    for (const [k, cell] of [...this.cells]) this.unloadCell(k, cell);
    this.world.group.remove(this.group);
  }

  // ---- persist ---------------------------------------------------------------
  serialize() {
    const states = {};
    for (const [k, s] of this.cellStates) {
      if (s.explored || s.scouted || s.cleared || s.bossKilled) states[k] = { e: s.explored ? 1 : 0, s: s.scouted ? 1 : 0, c: s.cleared ? 1 : 0, b: s.bossKilled ? 1 : 0 };
    }
    return {
      seed: this.seed,
      cell: { cx: this.curCell?.cx ?? 0, cz: this.curCell?.cz ?? 0 },
      waypoint: this.waypoint,
      states,
    };
  }

  apply(data) {
    if (!data || data.seed !== this.seed) return false;
    this.cellStates.clear();
    for (const [k, s] of Object.entries(data.states || {})) {
      this.cellStates.set(k, { explored: !!s.e, scouted: !!s.s, cleared: !!s.c, bossKilled: !!s.b });
    }
    this.waypoint = data.waypoint || null;
    return true;
  }
}
