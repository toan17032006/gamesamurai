// Entry chỉ để build engine-lib.js: re-export đúng những symbol game dùng,
// tránh bundle cả engine (3.7MB) vào game.
export { AssetFactory } from '../engine/src/procedural/asset-factory.ts';
export {
  blob, spike, tentacle, eyeball, limbBone, cubeBox, cylinder,
  createConeMesh, createCylinderMesh, createBoxMesh, displace, seededRandom,
} from '../engine/src/procedural/primitive-factory.ts';
export { buildCharacter } from '../engine/src/procedural/character-factory.ts';
export { buildMonster, PALETTES } from '../engine/src/procedural/monster-factory.ts';
export { TerrainSystem } from '../engine/src/environment/terrain-system.ts';
export { WaterSystem } from '../engine/src/environment/water-system.ts';
export { FoliageSystem } from '../engine/src/environment/foliage-system.ts';
export { AtmosphereSystem } from '../engine/src/environment/atmosphere-system.ts';
export { GravityEngine } from '../engine/src/physics/gravity-engine.ts';
export { ObjectPool } from '../engine/src/memory/object-pool.ts';
export { AssetCache } from '../engine/src/memory/asset-cache.ts';
export { getGraphicsPreset, listGraphicsModes } from '../engine/src/renderer/graphics-modes.ts';
export { GameEngine } from '../engine/src/game-engine.ts';
// Bước 2: FX / animation / audio / merge / light / rig của engine
export { ParticleSystem as EngineParticleSystem } from '../engine/src/effects/particle-system.ts';
export { PostProcessing as EnginePostProcessing, GradingShader as EngineGradingShader, GrainShader as EngineGrainShader, buildComposer as EngineBuildComposer } from '../engine/src/effects/post-processing.ts';
export { DecalProjector } from '../engine/src/effects/decal-projector.ts';
export { AudioBus } from '../engine/src/audio/audio-bus.ts';
export { Tween, Tweener, Easings } from '../engine/src/core/tween.ts';
export { Timer } from '../engine/src/core/timer.ts';
export { EventBus } from '../engine/src/core/event-bus.ts';
export { mergeStatic, mergeMeshes, simplifyGeometry, buildLOD } from '../engine/src/transformer/geometry-optimizer.ts';
export { configureLights } from '../engine/src/renderer/light-mapper.ts';
export { convertToStandard, setMaterialParams } from '../engine/src/renderer/material-mapper.ts';
export { mapBoneNames, retargetRigClip } from '../engine/src/combiner/rig-synchronizer.ts';
export { RealisticHumanPlayer } from '../engine/src/player/realistic-human-player.ts';
// Bước 3 (full-engine render): loop/FPS, physics world, transform, socket, memory, input
export { Ticker as EngineTicker } from '../engine/src/core/loop.ts';
export { PhysicsWorld as EnginePhysicsWorld } from '../engine/src/physics/index.ts';
export { Scaler as EngineScaler, applyScale as engineApplyScale, bakeScaleIntoGeometry as engineBakeScale } from '../engine/src/transformer/scaler.ts';
export { PivotAdjuster as EnginePivotAdjuster, applyPivot as engineApplyPivot } from '../engine/src/transformer/pivot-adjuster.ts';
export { SocketBinder as EngineSocketBinder, findBone as engineFindBone, listSockets as engineListSockets } from '../engine/src/combiner/socket-binder.ts';
export { MemoryDisposer as EngineMemoryDisposer } from '../engine/src/memory/memory-disposer.ts';
export { InputMap as EngineInputMap } from '../engine/src/input/input-map.ts';
export { PrimitiveFactory as EnginePrimitiveFactory } from '../engine/src/procedural/primitive-factory.ts';
export { AssetFactory as EngineAssetFactory } from '../engine/src/procedural/asset-factory.ts';
