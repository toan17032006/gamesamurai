// World: xây dựng vùng chơi (địa hình, props, nước, mối nguy) + truy vấn vật lý.
// Hai chế độ: campaign (1 region) và infinite (Ô sinh thế giới vô cực - delegate InfiniteWorld).
import * as THREE from 'three';
import { makeNoise2D, mulberry32, clamp } from '../core/utils.js';
import { buildTerrain } from '../gfx/terrain.js';
import { makeTree, makeBambooField, makeRock, makeLantern, makeHouse, makeTorii, makeBanner,
  makeShrineHall, makeGrave, makeStatue, makeWallSegment, makeKeepTower, makeCastleGate, makeCampfire,
  makeMountain, makeBridge, makeDeadTree, makeReeds, makeSnowPine, makeLilyPad, makeMushroom,
  makeLavaRock } from '../gfx/props.js';
import { buildGrass } from '../gfx/grass.js';
import { mergeStaticProps } from '../gfx/merge.js';
import { WIND, disposeSwayMaterials } from '../gfx/wind.js';
import { WaterSurface, makeWaterfallStrip, waterfallFoam, WATER_TIME } from '../gfx/water.js';
import { Interactable } from '../entities/interactable.js';
import { InfiniteWorld, CELL as CELL_SIZE_REF } from './infiniteWorld.js';
import { hashSeed } from './worldgen.js';

// ---- trường địa hình theo builder (dùng chung campaign + tham chiếu infinite) ----
// Trả về { heightFn, water: {level, color}|null }
export function makeHeightField(def, noise) {
  const b = def.builder;
  const size = def.size, half = size / 2;
  const roadX = 0;
  let amp = 2.2, freq = 0.02, wallAmp = 0;
  if (b === 'village' || b === 'shrine' || b === 'arena' || b === 'throne') { amp = 0.9; freq = 0.015; }
  if (b === 'meadow') { amp = 2.6; freq = 0.02; }
  if (b === 'bamboo') { amp = 1.6; freq = 0.025; }
  if (b === 'battlefield') { amp = 1.9; freq = 0.018; }
  if (b === 'mountain') { amp = 3.2; freq = 0.02; wallAmp = 7; }
  if (b === 'cave') { amp = 2.0; freq = 0.03; wallAmp = 10; }
  if (b === 'castle') { amp = 1.2; freq = 0.02; }
  if (b === 'forest') { amp = 1.8; freq = 0.022; }
  if (b === 'snow') { amp = 3.6; freq = 0.02; wallAmp = 8; }
  if (b === 'badlands') { amp = 2.8; freq = 0.024; }
  if (b === 'river') { amp = 2.0; freq = 0.02; wallAmp = 6; }
  if (b === 'wetland') { amp = 1.1; freq = 0.018; }
  if (b === 'volcano') { amp = 1.6; freq = 0.02; }

  const spawnPoint = [0, half - 14];
  const goalPos = [0, -half + 10];

  const heightFn = (x, z) => {
    let h = noise.fbm(x * freq + 10, z * freq + 10, 4) * amp;
    // mesa/terrace cho badlands: bậc thang tạo vách dựng
    if (b === 'badlands') {
      const step = 2.4;
      const q = Math.floor(h / step) * step;
      const f = (h - q) / step;
      h = q + (f * f * (3 - 2 * f)) * step * 0.6; // cong nhẹ cho bề mặt bậc
      // hẻm núi dọc hai bên đường
      const lat = Math.abs(x - roadX) / half;
      h += clamp((lat - 0.22) * 3.0, 0, 1) * clamp((lat - 0.22) * 3.0, 0, 1) * 9;
    }
    if (b === 'river') {
      // lòng sông uốn quanh trục z, cắt sâu qua bản đồ + suối phụ
      const rx = Math.sin(z * 0.045 + def.seed) * 6 + noise.fbm(z * 0.02, 7.7, 2) * 5;
      const d = Math.abs(x - rx);
      const carve = clamp(1 - d / 8.5, 0, 1);
      h -= carve * carve * 2.3;
      // vách dọc hai bên thung lũng sông
      const lat = Math.abs(x - roadX) / half;
      h += clamp((lat - 0.3) * 2.6, 0, 1) * clamp((lat - 0.3) * 2.6, 0, 1) * 6;
    }
    if (b === 'wetland') {
      // hồ lớn ở giữa + các vũng lầy rải
      const lake = clamp(1 - Math.hypot(x, z) / (half * 0.62), 0, 1);
      h -= lake * lake * 2.4;
      const pond = noise.fbm(x * 0.05 + 40, z * 0.05 - 12, 2);
      if (pond > 0.24) h -= (pond - 0.24) * 6;
    }
    if (b === 'volcano') {
      // núi hình nón giữa bản đồ + miệng crater lõm
      const dz = -6; // tâm hơi lệch về phía goal
      const d = Math.hypot(x, z - dz) / (half * 0.78);
      const cone = Math.max(0, 1 - d);
      h += cone * cone * 13;
      const crater = clamp(1 - Math.hypot(x, z - dz) / 7.5, 0, 1);
      h -= crater * crater * 5.5;
    }
    if (wallAmp > 0) {
      const lat = Math.abs(x - roadX) / half;
      const dip = clamp((lat - 0.18) * 3.2, 0, 1);
      h += dip * dip * wallAmp;
    }
    // làm phẳng quanh spawn/goal cho combat & landmark
    const cd = Math.hypot(x, z);
    if (cd < 16) h *= 0.4;
    const gd = Math.hypot(x - goalPos[0], z - goalPos[2]);
    if (gd < 14) h *= 0.35;
    return h;
  };

  let water = null;
  if (b === 'river') water = { level: -0.95, color: 0x3a6a7a, flood: true };
  if (b === 'wetland') water = { level: -0.75, color: 0x4a6a58, flood: true };
  if (b === 'volcano') water = { lava: true, level: 4.6 }; // mặt dung nham trong crater
  if (b === 'snow') water = { level: -1.4, color: 0x5a7a92 }; // hồ băng nhỏ nơi trũng
  return { heightFn, water, spawnPoint, goalPos, roadX };
}

export class World {
  constructor(game) {
    this.game = game;
    this.group = new THREE.Group();
    game.engine.scene.add(this.group);
    this.def = null;
    this.mode = 'campaign';
    this.infinite = null;
    this.colliders = [];       // {x, z, r, h, cell?}
    this.interactables = [];
    this.owned = [];           // geometries/materials cần dispose khi dỡ
    this.heightFn = (x, z) => 0;
    this.baseY = 0;
    this.roadX = 0;
    this.spawnPoint = [0, 60];
    this.goalPos = [0, -60];
    this.regionGroup = null;
    this.waterSurface = null;
    this.lavaSurface = null;
    this.waterfalls = [];
    this.hazards = [];         // {type:'lava', level, x, z, r}
    this.foamT = 0;
    this.cellTags = new Map(); // cellKey -> {group, ownedIdx...} cho infinite
  }

  // ---- water/hazard queries -------------------------------------------------
  get waterLevel() { return this.waterSurface && this.waterSurface.enabled ? this.waterSurface.level : -Infinity; }

  waterLevelAt(_x, _z) { return this.waterLevel; }

  hazardAt(x, z) {
    for (const h of this.hazards) {
      if (h.r === undefined || Math.hypot(x - h.x, z - h.z) < h.r) return h;
    }
    return null;
  }

  get boundLimit() {
    if (this.mode === 'infinite') return Infinity;
    return this.def ? this.def.size / 2 - 2 : 60;
  }

  groundAt(x, z) {
    if (this.mode === 'infinite') return this.infinite.heightAt(x, z);
    if (!this.def) return 0;
    return this.heightFn(x, z);
  }

  // ---- campaign region --------------------------------------------------------
  loadRegion(def) {
    this.clearAll();
    this.mode = 'campaign';
    this.def = def;
    const rng = mulberry32(def.seed);
    const noise = makeNoise2D(def.seed);
    const size = def.size;
    const field = makeHeightField(def, noise);
    this.heightFn = field.heightFn;
    this.roadX = field.roadX;
    this.spawnPoint = field.spawnPoint;
    this.goalPos = field.goalPos;
    this.baseY = 0;

    const qk = game.engine.qualityKey;
    const ter = buildTerrain(this, def, qk);
    this.group.add(ter.mesh);
    this.owned.push(ter);
    this.terrain = ter;
    this.regionGroup = new THREE.Group();
    this.group.add(this.regionGroup);

    this.buildProps(def, rng, noise);
    this.buildLandmarks(def, rng);
    this.buildBackdrop(def, rng);
    this.grass = buildGrass(this, def, rng, noise, qk, this.vegDensity());
    if (this.grass) this.regionGroup.add(this.grass.mesh);
    for (const m of mergeStaticProps(this.regionGroup, Math.max(24, size / 5))) this.owned.push({ mesh: m, geo: m.geometry });

    this.setupWater(def, rng);
    return true;
  }

  vegDensity() {
    const s = this.game.settings || {};
    return { low: 0.5, normal: 1, high: 1.5 }[s.vegDensity] ?? 1;
  }

  // nước: mặt phẳng lớn + mực nước theo def; lava là bề mặt riêng
  setupWater(def, rng) {
    const size = def.size;
    if (!def.water) {
      if (this.waterSurface) this.waterSurface.snap(-9999);
      if (this.lavaSurface) this.lavaSurface.snap(-9999);
      this.hazards = [];
      this.waterfalls = [];
      return;
    }
    if (!this.waterSurface) {
      this.waterSurface = new WaterSurface(this.group.parent, { size: 640 });
      this.waterSurface.floodMax = 0.95;
    }
    if (def.water.lava) {
      this.waterSurface.snap(-9999);
      if (!this.lavaSurface) this.lavaSurface = new WaterSurface(this.group.parent, { size: 64, lava: true, segments: 20 });
      this.lavaSurface.snap(def.water.level);
      const [gx, gz] = this.goalPos;
      // miệng crater quanh goal (trùng tâm núi lửa)
      this.hazards = [{ type: 'lava', level: def.water.level, x: gx, z: gz + 6, r: 6.4 }];
      // nham thạch tràn: vệt sáng quanh crater
      this.waterfalls = [];
    } else {
      if (this.lavaSurface) this.lavaSurface.snap(-9999);
      this.hazards = [];
      this.waterSurface.snap(def.water.level);
      this.waterSurface.mat.color.setHex(def.water.color ?? 0x3a6a7a);
      if (def.builder === 'river') {
        // thác nước ở mép bắc (từ vách đổ xuống lòng sông)
        this.waterfalls = [];
        const wfz = -size / 2 + 6;
        for (const wx of [-14, 14]) {
          const strip = makeWaterfallStrip(5, 9);
          strip.position.set(wx, 2.6, wfz);
          this.regionGroup.add(strip);
          this.owned.push({ mesh: strip, geo: strip.geometry });
          this.waterfalls.push({ x: wx, y: this.waterSurface.level + 0.1, z: wfz + 1, w: 4 });
        }
        // cầu gỗ bắc qua sông giữa bản đồ
        const bridge = makeBridge(16, 3.4);
        const rx = Math.sin(0 * 0.045 + def.seed) * 6;
        bridge.position.set(rx, 0.1, 0);
        this.regionGroup.add(bridge);
        for (const px of [-6.4, 6.4]) this.colliders.push({ x: rx + px, z: 0, r: 0.5, h: 1.4 });
        // bùn/đá bờ sông
        for (let i = 0; i < 10; i++) {
          const bx = rx + (rng() < 0.5 ? -1 : 1) * (9 + rng() * 5);
          const bz = (rng() - 0.5) * size * 0.7;
          this.addProp(makeRock(rng, 0.5 + rng() * 0.8), bx, bz, 0.6, 1);
        }
      }
      if (def.builder === 'wetland') {
        // súng + lau sậy quanh hồ
        for (let i = 0; i < 14; i++) {
          const a = rng() * Math.PI * 2, r = 18 + rng() * 34;
          const lx = Math.cos(a) * r, lz = Math.sin(a) * r;
          const lp = makeLilyPad(rng);
          lp.position.set(lx, def.water.level + 0.02, lz);
          this.regionGroup.add(lp);
        }
        for (let i = 0; i < 26; i++) {
          const a = rng() * Math.PI * 2, r = 30 + rng() * 30;
          this.addProp(makeReeds(rng), Math.cos(a) * r, Math.sin(a) * r, 0, 0);
        }
        for (let i = 0; i < 8; i++) {
          const a = rng() * Math.PI * 2, r = 36 + rng() * 26;
          this.addProp(makeDeadTree(rng), Math.cos(a) * r, Math.sin(a) * r, 0.4, 3);
        }
      }
    }
  }

  setFlood(t) {
    if (this.waterSurface && this.waterSurface.enabled) this.waterSurface.setFlood(t);
  }

  // ---- props (dùng chung) ------------------------------------------------------
  addProp(obj, x, z, r = 0, h = 3) {
    const y = this.heightFn(x, z);
    obj.position.set(x, y, z);
    this.regionGroup.add(obj);
    if (r > 0) this.colliders.push({ x, z, r, h });
    return obj;
  }

  buildProps(def, rng, noise) {
    const d = def.decor;
    const size = def.size, half = size / 2;
    const vd = this.vegDensity();
    const cnt = (n) => Math.max(n > 0 ? 1 : 0, Math.round(n * vd));
    const scatter = (count, fn, minRoad = 3.5) => {
      let placed = 0, tries = 0;
      while (placed < count && tries < count * 12) {
        tries++;
        const x = (rng() - 0.5) * size * 0.92;
        const z = (rng() - 0.5) * size * 0.92;
        if (Math.abs(x - this.roadX) < minRoad && Math.abs(z) < half * 0.7) continue;
        if (Math.hypot(x - this.spawnPoint[0], z - this.spawnPoint[1]) < 8) continue;
        // tránh placed vào nước
        if (def.water && !def.water.lava && this.heightFn(x, z) < (def.water.level || 0) + 0.15) continue;
        fn(x, z);
        placed++;
      }
    };

    if (d.trees > 0) scatter(cnt(d.trees), (x, z) => {
      const t = makeTree(rng, rng() < 0.7 ? 'pine' : 'maple');
      const s = 0.8 + rng() * 0.7;
      t.scale.setScalar(s);
      this.addProp(t, x, z, 0.55 * s, 4);
    });
    if (d.snowPines > 0) scatter(cnt(d.snowPines), (x, z) => {
      const t = makeSnowPine(rng);
      const s = 0.8 + rng() * 0.7;
      t.scale.setScalar(s);
      this.addProp(t, x, z, 0.55 * s, 4);
    });
    if (d.deadTrees > 0) scatter(cnt(d.deadTrees), (x, z) => {
      this.addProp(makeDeadTree(rng), x, z, 0.3, 3);
    });
    if (d.mushrooms > 0) scatter(cnt(d.mushrooms), (x, z) => {
      this.addProp(makeMushroom(rng), x, z, 0, 0);
    });
    if (d.lavaRocks > 0) scatter(cnt(d.lavaRocks), (x, z) => {
      this.addProp(makeLavaRock(rng), x, z, 0.8, 1.5);
    });
    if (d.rocks > 0) scatter(cnt(d.rocks), (x, z) => {
      const s = 0.6 + rng() * 1.6;
      this.addProp(makeRock(rng, s), x, z, s * 0.8, s * 1.2);
    });
    if (d.bamboo > 0) {
      const count = cnt(d.bamboo);
      const field = makeBambooField(count, rng);
      const m4 = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1);
      const stems = field.children[0], leaves = field.children[1];
      let placed = 0, tries = 0;
      while (placed < count && tries < count * 8) {
        tries++;
        const x = (rng() - 0.5) * size * 0.94, z = (rng() - 0.5) * size * 0.94;
        if (Math.abs(x - this.roadX) < 4.5 && Math.abs(z) < half * 0.75) continue;
        e.set(0, rng() * Math.PI * 2, 0);
        q.setFromEuler(e);
        p.set(x, this.heightFn(x, z), z);
        m4.compose(p, q, s);
        stems.setMatrixAt(placed, m4);
        leaves.setMatrixAt(placed, m4);
        placed++;
        if (placed % 6 === 0) this.colliders.push({ x, z, r: 0.18, h: 3 });
      }
      stems.count = placed; leaves.count = placed;
      stems.instanceMatrix.needsUpdate = true; leaves.instanceMatrix.needsUpdate = true;
      this.regionGroup.add(field);
    }
    if (d.houses > 0) {
      const rows = Math.ceil(d.houses / 2);
      for (let i = 0; i < rows; i++) {
        for (const side of [-1, 1]) {
          if (i * 2 + (side > 0 ? 1 : 0) >= d.houses) continue;
          const x = side * (13 + rng() * 4);
          const z = -half * 0.45 + i * (size / (rows * 1.9)) + (rng() - 0.5) * 6;
          const h = makeHouse(rng, [0xd8d0bc, 0xcfc4a8, 0xd4cabc][(rng() * 3) | 0]);
          h.group.rotation.y = side > 0 ? -Math.PI / 2 + (rng() - 0.5) * 0.3 : Math.PI / 2 + (rng() - 0.5) * 0.3;
          this.addProp(h.group, x, z, h.half * 0.8, 4.5);
        }
      }
    }
    if (d.lanterns > 0) {
      const roadLanterns = Math.min(d.lanterns, Math.ceil(d.lanterns * 0.7));
      for (let i = 0; i < roadLanterns; i++) {
        const z = half * 0.6 - (i / roadLanterns) * size * 1.1;
        const side = i % 2 === 0 ? -1 : 1;
        this.addProp(makeLantern(def.light.night), side * 4.6, z + (rng() - 0.5) * 3, 0.45, 2);
      }
      for (let i = roadLanterns; i < d.lanterns; i++) {
        const x = (rng() - 0.5) * size * 0.8, z = (rng() - 0.5) * size * 0.8;
        this.addProp(makeLantern(def.light.night), x, z, 0.45, 2);
      }
    }
    if (d.torii > 0) {
      for (let i = 0; i < d.torii; i++) {
        const z = half * 0.3 - i * 22;
        this.addProp(makeTorii(1.1), this.roadX, z, 0.5, 4.5);
      }
    }
    if (d.banners > 0) {
      for (let i = 0; i < d.banners; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const z = half * 0.5 - (i / d.banners) * size;
        const bn = makeBanner([0x8a2a2a, 0x2a3a6a, 0x2a2a2a, 0x6a1a1a][(rng() * 4) | 0]);
        this.addProp(bn, side * (5.5 + rng() * 1.5), z, 0.15, 2.5);
      }
    }
  }

  buildLandmarks(def, rng) {
    const b = def.builder;
    const half = def.size / 2;
    const [gx, gz] = this.goalPos;
    switch (b) {
      case 'meadow':
        this.addProp(makeCampfire(), 0, 8, 0.6, 1);
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2;
          const tent = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.8, 5), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.9 }));
          tent.castShadow = true;
          tent.position.set(Math.cos(a) * 3.4, this.heightFn(Math.cos(a) * 3.4, 8 + Math.sin(a) * 3.4) + 0.9, 8 + Math.sin(a) * 3.4);
          this.regionGroup.add(tent);
          this.colliders.push({ x: tent.position.x, z: tent.position.z, r: 1.4, h: 2 });
        }
        this.addProp(makeTorii(1.2), gx, gz, 0.6, 5);
        break;
      case 'village': {
        const shrine = makeShrineHall();
        shrine.position.set(gx, this.heightFn(gx, gz), gz);
        this.regionGroup.add(shrine);
        this.colliders.push({ x: gx, z: gz, r: 4.6, h: 5 });
        const well = makeRock(rng, 1.2);
        this.addProp(well, 0, 0, 1.0, 1.5);
        break;
      }
      case 'bamboo': {
        this.addProp(makeStatue(), gx, gz, 1.0, 3);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          this.addProp(makeLantern(true), gx + Math.cos(a) * 5, gz + Math.sin(a) * 5, 0.45, 2);
        }
        break;
      }
      case 'mountain':
        this.addProp(makeTorii(1.3), gx, gz, 0.6, 5.5);
        this.addProp(makeCampfire(), 0, 20, 0.6, 1);
        break;
      case 'shrine': {
        const hall = makeShrineHall();
        hall.position.set(gx, this.heightFn(gx, gz), gz);
        this.regionGroup.add(hall);
        this.colliders.push({ x: gx, z: gz, r: 5.4, h: 5.5 });
        this.addProp(makeStatue(), 0, -20, 1.0, 3);
        break;
      }
      case 'battlefield': {
        const pole = new THREE.Group();
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5, 6), new THREE.MeshStandardMaterial({ color: 0x3e2c1c }));
        p.position.y = 2.5; p.castShadow = true;
        const flag = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x2a4a8a }));
        flag.position.set(0.95, 4.2, 0); flag.castShadow = true;
        pole.add(p, flag);
        this.addProp(pole, 0, -6, 0.3, 5);
        for (let i = 0; i < 10; i++) this.addProp(makeGrave(rng), (rng() - 0.5) * 60, -half * 0.5 + rng() * 70, 0.3, 1.2);
        break;
      }
      case 'cave': {
        const arch = new THREE.Group();
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x5c5650, roughness: 0.95 });
        for (let i = 0; i < 5; i++) {
          const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 + rng()), rockMat);
          r.position.set(-2.6 + i * 1.3, this.heightFn(gx - 2.6 + i * 1.3, gz) + (i === 0 || i === 4 ? 1.4 : 3.4), gz);
          r.castShadow = true;
          arch.add(r);
        }
        this.regionGroup.add(arch);
        for (let i = 0; i < 5; i++) {
          const ox = gx + (rng() - 0.5) * 24, oz = gz + (rng() - 0.5) * 24;
          this.addProp(makeRock(rng, 1 + rng() * 2), ox, oz, 1.2, 2);
        }
        break;
      }
      case 'arena': {
        const R = 22;
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2;
          const x = Math.cos(a) * R, z = Math.sin(a) * R;
          const w = makeWallSegment(4, 1.6);
          w.position.set(x, this.heightFn(x, z), z);
          w.rotation.y = -a + Math.PI / 2;
          this.regionGroup.add(w);
          this.colliders.push({ x, z, r: 2.0, h: 2 });
        }
        this.addProp(makeStatue(), -14, 0, 1.0, 3);
        this.addProp(makeStatue(), 14, 0, 1.0, 3);
        break;
      }
      case 'castle': {
        const keep = makeKeepTower();
        keep.position.set(gx, this.heightFn(gx, gz) - 0.5, gz);
        this.regionGroup.add(keep);
        this.colliders.push({ x: gx, z: gz, r: 7.2, h: 17 });
        for (const side of [-1, 1]) {
          for (let i = 0; i < 5; i++) {
            const x = side * (16 + rng() * 3), z = -half * 0.3 + i * (half * 0.28);
            const w = makeWallSegment(9, 3.4);
            w.position.set(x, this.heightFn(x, z), z);
            w.rotation.y = side * Math.PI / 2 + (rng() - 0.5) * 0.2;
            this.regionGroup.add(w);
            this.colliders.push({ x, z, r: 4.4, h: 4 });
          }
        }
        break;
      }
      case 'throne': {
        for (const x of [-9, -4.5, 4.5, 9]) {
          for (const z of [-24, -10, 4, 18]) {
            const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 9, 10), new THREE.MeshStandardMaterial({ color: 0x4a4450, roughness: 0.9 }));
            pil.position.set(x, this.heightFn(x, z) + 4.5, z);
            pil.castShadow = true;
            this.regionGroup.add(pil);
            this.colliders.push({ x, z, r: 1.0, h: 9 });
          }
        }
        const throne = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 2.4), new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.6 }));
        seat.position.y = 0.6;
        const back = new THREE.Mesh(new THREE.BoxGeometry(3, 4.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.6 }));
        back.position.set(0, 2.6, -1.0);
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), new THREE.MeshStandardMaterial({ color: 0x9a6aff, emissive: 0x6a3aff, emissiveIntensity: 2, roughness: 0.3 }));
        gem.position.set(0, 3.6, -0.6);
        throne.add(seat, back, gem);
        throne.position.set(gx, this.heightFn(gx, gz), gz);
        this.regionGroup.add(throne);
        this.colliders.push({ x: gx, z: gz, r: 2.0, h: 4 });
        this.throneGem = gem;
        break;
      }
      case 'forest': {
        // bãi trũng giữa rừng: đá tế + đống củi
        this.addProp(makeStatue(), gx, gz, 1.0, 3);
        this.addProp(makeCampfire(), 0, 12, 0.6, 1);
        for (let i = 0; i < 4; i++) this.addProp(makeMushroom(rng), (rng() - 0.5) * 8, 12 + (rng() - 0.5) * 8, 0, 0);
        break;
      }
      case 'river': {
        // đền cổ nhỏ bên kia cầu (goal)
        this.addProp(makeTorii(1.2), gx, gz, 0.6, 5);
        this.addProp(makeLantern(true), gx + 3, gz + 2, 0.45, 2);
        break;
      }
      case 'snow': {
        // đài đèn giữa băng nguyên + đá tuyết phủ
        this.addProp(makeLantern(true), gx, gz, 0.45, 2);
        this.addProp(makeCampfire(), 0, 14, 0.6, 1);
        break;
      }
      case 'wetland': {
        // đền chìm nửa chìm giữa hồ (goal)
        const hall = makeShrineHall();
        hall.position.set(gx, this.heightFn(gx, gz) - 0.6, gz);
        this.regionGroup.add(hall);
        this.colliders.push({ x: gx, z: gz, r: 4.6, h: 4 });
        break;
      }
      case 'badlands': {
        // arena đá giữa hẻm núi (sân đấu ronin)
        const R = 18;
        for (let i = 0; i < 22; i++) {
          const a = (i / 22) * Math.PI * 2;
          const x = Math.cos(a) * R, z = Math.sin(a) * R;
          const w = makeWallSegment(3.6, 1.4);
          w.position.set(x, this.heightFn(x, z), z);
          w.rotation.y = -a + Math.PI / 2;
          this.regionGroup.add(w);
          this.colliders.push({ x, z, r: 1.8, h: 2 });
        }
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          this.addProp(makeBanner([0x8a2a2a, 0x2a2a2a][(i % 2)]), Math.cos(a) * (R - 2), Math.sin(a) * (R - 2), 0.15, 2.5);
        }
        break;
      }
      case 'volcano': {
        // giàn đèn lửa dẫn lên crater
        for (let i = 0; i < 5; i++) {
          const z = 26 - i * 10;
          this.addProp(makeLantern(true), i % 2 === 0 ? -4 : 4, z, 0.45, 2);
        }
        break;
      }
    }
  }

  buildBackdrop(def, rng) {
    if (def.builder === 'cave' || def.builder === 'throne' || def.builder === 'volcano') return;
    const size = def.size;
    const count = def.builder === 'mountain' ? 5 : 11;
    const fog = new THREE.Color(def.sky.bottom);
    const tint = new THREE.Color(def.palette.rock).lerp(fog, 0.45);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rng() * 0.4;
      const r = size * (0.68 + rng() * 0.16);
      const m = makeMountain(rng, tint.getHex());
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      m.position.set(x, this.heightFn(x, z) - 6, z);
      this.regionGroup.add(m);
    }
  }

  // ---- Infinite World ----------------------------------------------------------
  // seedInput: chuỗi bất kỳ (hash FNV) hoặc số (restore từ save — dùng trực tiếp)
  enterInfinite(seedInput) {
    this.clearAll();
    this.mode = 'infinite';
    this.def = null;
    const seed = typeof seedInput === 'number' ? (seedInput >>> 0) : hashSeed(seedInput);
    this.infinite = new InfiniteWorld(this, seed);
    this.heightFn = (x, z) => this.infinite.heightAt(x, z);
    this.roadX = 0;
    if (!this.waterSurface) {
      this.waterSurface = new WaterSurface(this.group.parent, { size: 640 });
      this.waterSurface.floodMax = 0.95;
    }
    this.waterSurface.mat.color.setHex(0x3a6a7a);
    this.infinite.ensureInitial();
    return this.infinite;
  }

  // dựng props/landmark cho một ô vô cực: hoán đổi ngữ cảnh rồi trả lại
  buildCellContent(cell, def, rng, noise) {
    const saved = { group: this.regionGroup, colliders: this.colliders, spawn: this.spawnPoint, goal: this.goalPos };
    this.regionGroup = cell.group;
    this.colliders = cell.colliders;
    this.spawnPoint = [cell.cx * CELL_SIZE_REF, cell.cz * CELL_SIZE_REF + CELL_SIZE_REF / 2 - 14];
    this.goalPos = [cell.cx * CELL_SIZE_REF, cell.cz * CELL_SIZE_REF - CELL_SIZE_REF / 2 + 10];
    this.buildProps(def, rng, noise);
    this.buildLandmarks(def, rng);
    // gắn tag thác nước sinh ra trong ô
    for (const wf of this.waterfalls) if (wf.cell === undefined) wf.cell = cell.key;
    this.regionGroup = saved.group;
    this.colliders = saved.colliders;
    this.spawnPoint = saved.spawn;
    this.goalPos = saved.goal;
  }

  updateStreaming(pos) {
    if (this.infinite) this.infinite.update(pos);
  }

  spawnWildlife(cfg, area, seed) {
    const rng = mulberry32(seed);
    const size = area || (this.def ? this.def.size : 150);
    const spawnOne = (kind) => {
      for (let t = 0; t < 24; t++) {
        const x = (rng() - 0.5) * size * 0.85;
        const z = (rng() - 0.5) * size * 0.85;
        if (Math.hypot(x, z) < 12) continue;
        this.game.spawnCreature({ kind, x, z, seed: seed + t * 13 });
        return;
      }
    };
    for (const [kind, count] of Object.entries(cfg || {})) {
      for (let i = 0; i < count; i++) spawnOne(kind);
    }
  }

  // ---- queries ------------------------------------------------------------
  collideCircle(pos, r) {
    for (const c of this.colliders) {
      const dx = pos.x - c.x, dz = pos.z - c.z;
      const min = c.r + r;
      const d2 = dx * dx + dz * dz;
      if (d2 < min * min && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const push = (min - d) / d;
        pos.x += dx * push;
        pos.z += dz * push;
      }
    }
  }

  segmentBlocked(x1, y1, z1, x2, y2, z2) {
    for (const c of this.colliders) {
      if (c.h < 2.2) continue;
      const dx = x2 - x1, dz = z2 - z1;
      const len2 = dx * dx + dz * dz;
      let t = len2 > 0 ? ((c.x - x1) * dx + (c.z - z1) * dz) / len2 : 0;
      t = clamp(t, 0, 1);
      const px = x1 + dx * t, pz = z1 + dz * t;
      const py = y1 + (y2 - y1) * t;
      if (py < c.h + 0.3) {
        const d = Math.hypot(px - c.x, pz - c.z);
        if (d < c.r + 0.35) return true;
      }
    }
    return false;
  }

  separate(npc, dt) {
    const npcs = this.game.npcs;
    for (const o of npcs) {
      if (o === npc || o.disposed || o.combat.dead) continue;
      const dx = npc.pos.x - o.pos.x, dz = npc.pos.z - o.pos.z;
      const d2 = dx * dx + dz * dz;
      const min = npc.radius + o.radius + 0.15;
      if (d2 < min * min && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const push = (min - d) / d * 0.5;
        npc.pos.x += dx * push;
        npc.pos.z += dz * push;
      }
    }
  }

  // ---- interactables ------------------------------------------------------
  addInteractable(cfg) {
    const it = new Interactable(this.game, cfg);
    if (this.infinite) it.cell = this.infinite.cellKeyAt(cfg.x, cfg.z);
    this.interactables.push(it);
    return it;
  }

  nearestInteractable(pos, range) {
    let best = null, bestD = range;
    for (const it of this.interactables) {
      if (it.used && it.type !== 'shrine') continue;
      const d = Math.hypot(it.x - pos.x, it.z - pos.z);
      if (d < bestD) { best = it; bestD = d; }
    }
    return best;
  }

  useInteractable(it, player) { it.use(player); }

  spawnResourceNodes(counts, area) {
    const rng = mulberry32((this.def ? this.def.seed : 7) + 7);
    const size = area || (this.def ? this.def.size : 150), half = size / 2;
    for (const [type, count] of Object.entries(counts || {})) {
      for (let i = 0; i < count; i++) {
        let x, z, tries = 0;
        do {
          x = (rng() - 0.5) * size * 0.85;
          z = (rng() - 0.5) * size * 0.85;
          tries++;
        } while ((Math.abs(x) < 3.5 && Math.abs(z) < half * 0.7 || Math.hypot(x, z) < 12) && tries < 20);
        this.addInteractable({ type: 'resource', x, z, item: type, qty: 1, respawn: 90 });
      }
    }
  }

  // ---- frame update ---------------------------------------------------------
  update(dt) {
    WIND.uTime.value = this.game.time;
    for (const it of this.interactables) it.update(dt);
    // nước: nhịp sóng + lũ + bám player
    WATER_TIME.value = this.game.time;
    if (this.waterSurface) {
      this.waterSurface.update(dt);
      const p = this.game.player ? this.game.player.pos : { x: 0, z: 0 };
      this.waterSurface.recenter(p.x, p.z);
    }
    if (this.lavaSurface) {
      this.lavaSurface.update(dt);
      const p = this.game.player ? this.game.player.pos : { x: 0, z: 0 };
      this.lavaSurface.recenter(p.x, p.z);
    }
    // bọt thác nước
    if (this.waterfalls.length) {
      this.foamT -= dt;
      if (this.foamT <= 0) {
        this.foamT = 0.12;
        for (const wf of this.waterfalls) waterfallFoam(this.game, wf);
      }
    }
    if (this.infinite) this.infinite.update(this.game.player ? this.game.player.pos : { x: 0, z: 0 });
  }

  // dỡ toàn bộ (đổi region / vào menu / sang infinite)
  clearAll() {
    if (this.regionGroup) {
      this.group.remove(this.regionGroup);
      this.regionGroup = null;
    }
    if (this.infinite) { this.infinite.dispose(); this.infinite = null; }
    for (const o of this.owned) {
      if (o.mesh) this.group.remove(o.mesh);
      if (o.geo) o.geo.dispose();
      if (o.mat) o.mat.dispose();
    }
    this.owned = [];
    if (this.grass) {
      this.grass.geo.dispose();
      this.grass.mesh.parent?.remove(this.grass.mesh);
      this.grass = null;
    }
    disposeSwayMaterials();
    for (const it of this.interactables) it.dispose(this.game);
    this.interactables = [];
    this.colliders = [];
    this.hazards = [];
    this.waterfalls = [];
    if (this.waterSurface) this.waterSurface.snap(-9999);
    if (this.lavaSurface) this.lavaSurface.snap(-9999);
    this.def = null;
    this.mode = 'campaign';
  }

  // tương thích tên cũ
  clear() { this.clearAll(); }
}
