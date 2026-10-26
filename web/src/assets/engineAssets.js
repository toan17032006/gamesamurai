// engineAssets: toàn bộ asset mới của game, tạo BẰNG ENGINE @aetheria/engine
// (đã vendored tại ./engine/, không còn .git của engine) — coi engine là thư viện.
// Dùng tối đa method/function/generic có sẵn trong engine:
//  - AssetFactory.create / createAndExport / exportableFormats
//  - PrimitiveFactory: blob, spike, tentacle, eyeball, limbBone, cubeBox,
//    cylinder, createConeMesh, createCylinderMesh, createBoxMesh, displace, seededRandom
//  - buildCharacter / buildMonster (+ PALETTES)
//  - TerrainSystem, WaterSystem, FoliageSystem, AtmosphereSystem
//  - GravityEngine, ObjectPool, AssetCache, EventBus, Ticker (qua GameEngine)
//  - getGraphicsPreset / listGraphicsModes (preset 'ultra' = render chất lượng cao)
//  - Generic (JS): getOrCreate<T>(key, factory) — cache theo key, tái sử dụng
//    mọi loại asset mà không cấp phát lại geometry/material mỗi lần.
import * as THREE from 'three';
import {
  AssetFactory, blob, spike, tentacle, eyeball, limbBone, cubeBox, cylinder,
  createConeMesh, createCylinderMesh, createBoxMesh, displace, seededRandom,
  buildCharacter, buildMonster, PALETTES, TerrainSystem, WaterSystem,
  FoliageSystem, AtmosphereSystem, GravityEngine, ObjectPool, AssetCache,
  getGraphicsPreset, listGraphicsModes, GameEngine,
} from './engine-lib.js';


// ---- render chất lượng cao (engine preset) -------------------------------
export const ENGINE_PRESET = getGraphicsPreset('ultra');
export const GRAPHICS_MODES = listGraphicsModes();

/** Áp preset 'ultra' của engine lên renderer của game (shadow 3072, pixelRatioCap 2, bloom+AO). */
export function applyEngineRenderQuality(gameEngine) {
  const q = ENGINE_PRESET.quality;
  const r = gameEngine.renderer;
  if (!r) return ENGINE_PRESET;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = ENGINE_PRESET.postFx.exposure ?? 1.05;
  gameEngine.scene.traverse((o) => {
    if (o.isDirectionalLight && o.shadow) {
      o.shadow.mapSize.setScalar(q.shadowMapSize);
      if (o.shadow.map) { o.shadow.map.dispose(); o.shadow.map = null; }
    }
  });
  if (gameEngine.bloomPass) gameEngine.bloomPass.strength = ENGINE_PRESET.postFx.bloomStrength ?? 0.8;
  return ENGINE_PRESET;
}

// ---- hệ thống dùng chung của engine ---------------------------------------
export const terrainSystem = new TerrainSystem();
export const waterSystem = new WaterSystem();
export const foliageSystem = new FoliageSystem();
export const atmosphereSystem = new AtmosphereSystem();
export const gravityEngine = new GravityEngine({ g: 18, terminalVelocity: 50 });
export const assetCache = new AssetCache({ maxEntries: 128, maxBytes: 256 * 1024 * 1024 });
export const propPool = new ObjectPool({ maxPerAsset: 32 });

// ---- generic cache: getOrCreate<T> ----------------------------------------
const _cache = new Map();
/** Generic: trả asset đã tạo theo key, nếu chưa có thì factory() rồi cache lại. */
export function getOrCreate(key, factory) {
  if (!_cache.has(key)) _cache.set(key, factory());
  return _cache.get(key);
}
export function clearEngineAssetCache() { _cache.clear(); }

// ---- helper: tạo asset từ AssetFactory, gắn shadow, đăng ký pool ---------
export function createEngineAsset(name, parts, scale = 1) {
  const created = AssetFactory.create({ name, parts, scale });
  created.root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  if (!propPool.has(name)) propPool.register(name, created.root);
  return created.root;
}

/** Clone nhanh 1 asset đã đăng ký pool (dùng cho prop lặp lại nhiều lần). */
export function acquireProp(name) {
  const inst = propPool.acquire(name);
  return inst || null;
}

// ---- vật liệu / hình học qua PrimitiveFactory ------------------------------
export const enginePrimitives = {
  blob, spike, tentacle, eyeball, limbBone, cubeBox, cylinder,
  createConeMesh, createCylinderMesh, createBoxMesh, displace, seededRandom,
};

/** Geometry đá hữu cơ: Icosahedron + displace của engine (thay displacedIco cũ). */
export function displacedRock(radius, detail, amp, seed) {
  return displace(new THREE.IcosahedronGeometry(radius, detail), amp, 2, seed);
}

// ---- nhân vật / quái bằng engine ------------------------------------------
export function createSamuraiCharacter(archetype = 'warrior', seed = 1, opts = {}) {
  const built = buildCharacter({ seed, archetype, ...opts });
  built.root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return built; // { root, spec, sockets, boneHierarchy }
}

export function createEngineMonster(spec = {}) {
  const built = buildMonster({ seed: 42, ...spec });
  built.root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return built; // { root, spec, sockets, animationsHint }
}

export { PALETTES as MONSTER_PALETTES };
// Re-export các helper engine dùng chung cho rig/quái/môi trường (bước 3)
export {
  EngineTicker, EnginePhysicsWorld, EngineScaler, engineApplyScale, engineBakeScale,
  EnginePivotAdjuster, engineApplyPivot, EngineSocketBinder, engineFindBone, engineListSockets,
  EngineMemoryDisposer, EngineInputMap, EnginePrimitiveFactory, EngineAssetFactory,
  setMaterialParams, convertToStandard,
} from './engine-lib.js';

// ---- catalog prop đầy đủ bằng AssetFactory ---------------------------------
// Mỗi prop là 1 spec part (box/sphere/cylinder/cone/capsule/plane/torus)
// với màu/roughness/metalness riêng — toàn bộ mesh đều do engine tạo.
const WOOD = 0x6a4a30, DARKWOOD = 0x3e2c1c, STONE = 0x8a8478, PLASTER = 0xd8d0bc,
  ROOF = 0x4a4440, VERMILION = 0xc4442e, PAPER = 0xffe8b0, LEAF = 0x2e5236;

function P(shape, size, position, color, opts = {}) {
  return { shape, size, position, color, roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0.05, rotation: opts.rotation, name: opts.name };
}

export function engineProp(name, rng = Math.random) {
  const r = typeof rng === 'function' ? rng : () => 0.5;
  switch (name) {
    case 'tree': {
      const h = 3.2 + r() * 3;
      return createEngineAsset('tree', [
        P('cylinder', [0.3, h, 0.3], [0, h / 2, 0], WOOD, { rough: 0.95 }),
        P('cone', [2.2, 2.2, 2.2], [0, h * 0.75, 0], LEAF, { rough: 0.9 }),
        P('cone', [1.6, 1.8, 1.6], [0, h * 0.95, 0], 0x35603c, { rough: 0.9 }),
      ]);
    }
    case 'rock':
      return createEngineAsset('rock', [P('sphere', [1.4, 1, 1.4], [0, 0.4, 0], STONE, { rough: 0.95 })]);
    case 'lantern':
      return createEngineAsset('lantern', [
        P('box', [0.5, 0.15, 0.5], [0, 1.4, 0], DARKWOOD),
        P('box', [0.34, 0.5, 0.34], [0, 1.05, 0], PAPER, { rough: 0.6 }),
        P('cylinder', [0.12, 0.9, 0.12], [0, 0.45, 0], DARKWOOD),
        P('box', [0.5, 0.12, 0.5], [0, 0.06, 0], STONE),
      ]);
    case 'house':
      return createEngineAsset('house', [
        P('box', [4, 2.4, 3.4], [0, 1.2, 0], PLASTER, { rough: 0.9 }),
        P('box', [4.6, 0.4, 4], [0, 2.6, 0], ROOF, { rough: 0.85, rotation: [0, 0, 18] }),
        P('box', [0.9, 1.7, 0.15], [0, 0.85, 1.75], DARKWOOD),
      ]);
    case 'torii':
      return createEngineAsset('torii', [
        P('cylinder', [0.22, 3.4, 0.22], [-1.6, 1.7, 0], VERMILION, { rough: 0.7 }),
        P('cylinder', [0.22, 3.4, 0.22], [1.6, 1.7, 0], VERMILION, { rough: 0.7 }),
        P('box', [4.4, 0.35, 0.4], [0, 3.5, 0], DARKWOOD),
        P('box', [3.8, 0.25, 0.3], [0, 3.0, 0], VERMILION, { rough: 0.7 }),
      ]);
    case 'banner':
      return createEngineAsset('banner', [
        P('cylinder', [0.08, 3, 0.08], [0, 1.5, 0], DARKWOOD),
        P('plane', [1.1, 1.8, 1], [0.6, 2.1, 0], 0x8a2a2a, { rough: 0.8 }),
      ]);
    case 'chest':
      return createEngineAsset('chest', [
        P('box', [1, 0.6, 0.7], [0, 0.3, 0], WOOD, { rough: 0.85 }),
        P('box', [1, 0.25, 0.7], [0, 0.7, 0], DARKWOOD),
        P('box', [0.2, 0.15, 0.05], [0, 0.45, 0.36], 0xc9a227, { metal: 0.7, rough: 0.4 }),
      ]);
    case 'campfire':
      return createEngineAsset('campfire', [
        P('cylinder', [0.12, 0.9, 0.12], [-0.3, 0.25, 0], WOOD, { rotation: [0, 0, 35] }),
        P('cylinder', [0.12, 0.9, 0.12], [0.3, 0.25, 0], WOOD, { rotation: [0, 0, -35] }),
        P('cone', [0.5, 0.7, 0.5], [0, 0.5, 0], 0xff7a20, { rough: 0.6 }),
        P('sphere', [0.5, 0.4, 0.5], [0, 0.15, 0], STONE, { rough: 0.95 }),
      ]);
    case 'statue':
      return createEngineAsset('statue', [
        P('box', [1.2, 0.4, 1.2], [0, 0.2, 0], STONE),
        P('cylinder', [0.5, 1.6, 0.5], [0, 1.2, 0], STONE),
        P('sphere', [0.45, 0.45, 0.45], [0, 2.3, 0], STONE),
      ]);
    case 'grave':
      return createEngineAsset('grave', [
        P('box', [0.7, 1, 0.2], [0, 0.5, 0], STONE),
        P('box', [1.1, 0.2, 0.7], [0, 0.1, 0], STONE),
      ]);
    case 'wall':
      return createEngineAsset('wall', [P('box', [4, 2, 0.6], [0, 1, 0], STONE, { rough: 0.95 })]);
    case 'tower':
      return createEngineAsset('tower', [
        P('cylinder', [1.2, 4, 1.2], [0, 2, 0], STONE, { rough: 0.95 }),
        P('cone', [1.8, 1.6, 1.8], [0, 4.8, 0], ROOF),
      ]);
    case 'gate':
      return createEngineAsset('gate', [
        P('box', [0.6, 3.5, 0.6], [-2, 1.75, 0], STONE),
        P('box', [0.6, 3.5, 0.6], [2, 1.75, 0], STONE),
        P('box', [5, 0.8, 0.8], [0, 3.6, 0], DARKWOOD),
      ]);
    case 'bridge':
      return createEngineAsset('bridge', [
        P('box', [6, 0.3, 2], [0, 0.5, 0], WOOD),
        P('box', [0.2, 0.8, 2], [-3, 0.9, 0], DARKWOOD),
        P('box', [0.2, 0.8, 2], [3, 0.9, 0], DARKWOOD),
      ]);
    case 'mushroom':
      return createEngineAsset('mushroom', [
        P('cylinder', [0.15, 0.5, 0.15], [0, 0.25, 0], 0xd8c8a0),
        P('sphere', [0.7, 0.4, 0.7], [0, 0.6, 0], 0xb03030, { rough: 0.7 }),
      ]);
    case 'lavaRock':
      return createEngineAsset('lavaRock', [
        P('sphere', [1.2, 0.9, 1.2], [0, 0.4, 0], 0x2a1a12, { rough: 0.95 }),
        P('sphere', [0.5, 0.3, 0.5], [0.3, 0.8, 0.2], 0xff5a20, { rough: 0.6 }),
      ]);
    case 'arrow':
      return createEngineAsset('arrow', [
        P('cylinder', [0.04, 0.9, 0.04], [0, 0, 0], WOOD, { rotation: [90, 0, 0] }),
        P('cone', [0.08, 0.25, 0.08], [0, 0, 0.55], 0xc0c8d0, { metal: 0.8, rough: 0.3, rotation: [90, 0, 0] }),
      ]);
    case 'fireball':
      return createEngineAsset('fireball', [P('sphere', [0.5, 0.5, 0.5], [0, 0, 0], 0xff7a20, { rough: 0.5 })]);
    case 'katana':
      return createEngineAsset('katana', [
        P('box', [0.06, 0.9, 0.02], [0, 0, 0], 0xd8dee8, { metal: 0.9, rough: 0.25 }),
        P('box', [0.16, 0.06, 0.06], [0, -0.45, 0], 0xc9a227, { metal: 0.7, rough: 0.4 }),
        P('cylinder', [0.05, 0.3, 0.05], [0, -0.6, 0], DARKWOOD),
      ]);
    default:
      return createEngineAsset(name, [P('box', [1, 1, 1], [0, 0.5, 0], 0x9aa4b2)]);
  }
}

// ---- GameEngine của engine (để tham chiếu / dùng khi cần) -----------------
export { GameEngine };
export const ENGINE_VERSION = '2.0.0 (@aetheria/engine, vendored tại ./engine/)';
