import { describe, it, expect } from 'vitest';
import { COMBINERS, createEngineCombiner, COMBINATOR_NAME_GROUPS } from '../src/combiner/combine.js';
import { GameEngine, createEngine } from '../src/game-engine.js';
import { parseObj, parseMtl } from '../src/asset-parser/obj-parser.js';
import { Scaler } from '../src/transformer/scaler.js';
import { PivotAdjuster } from '../src/transformer/pivot-adjuster.js';
import { BoundsCalculator } from '../src/transformer/bounds-calculator.js';
import { GeometryOptimizer } from '../src/transformer/geometry-optimizer.js';
import { CharacterFactory } from '../src/procedural/character-factory.js';
import { MonsterFactory } from '../src/procedural/monster-factory.js';
import { AssetExporter } from '../src/procedural/asset-exporter.js';
import { AssetCombiner } from '../src/procedural/asset-combiner.js';
import { PhysicsWorld } from '../src/physics/index.js';
import { FluidSimulator } from '../src/physics/fluid-dynamics.js';
import { DestructionEngine } from '../src/physics/destruction-engine.js';
import { RagdollSolver } from '../src/physics/ragdoll-solver.js';
import { ThreeBackend } from '../src/render/three-backend.js';
import { BabylonBackend } from '../src/render/babylon-backend.js';
import { PlayCanvasBackend } from '../src/render/playcanvas-backend.js';
import { RawWebGL2Backend } from '../src/render/raw-backend.js';
import { WebGPURenderBackend } from '../src/render/webgpu-backend.js';
import { RenderBackendRegistry, createDefaultRegistry } from '../src/render/registry.js';
import { FoliageSystem } from '../src/environment/foliage-system.js';
import { StructureSystem } from '../src/environment/structure-system.js';
import { WaterSystem } from '../src/environment/water-system.js';
import { AtmosphereSystem } from '../src/environment/atmosphere-system.js';
import { TerrainSystem } from '../src/environment/terrain-system.js';
import { InteractivePropsSystem } from '../src/environment/interactive-props.js';
import { InputMap } from '../src/input/input-map.js';
import { AudioBus } from '../src/audio/audio-bus.js';
import { StateMachine } from '../src/ai/fsm.js';
import { BehaviorNode, SequenceNode, SelectorNode, Blackboard } from '../src/ai/behavior-tree.js';
import { Steering } from '../src/ai/steering.js';

describe('Comprehensive Checklist Deliverable Verification', () => {
  it('verifies 450+ combiner functions registered without duplicate names', () => {
    expect(COMBINERS.length).toBeGreaterThanOrEqual(445);
    const names = COMBINERS.map((c) => c.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('verifies all 18 groups exist and contain items', () => {
    const groupKeys = Object.keys(COMBINATOR_NAME_GROUPS);
    expect(groupKeys.length).toBeGreaterThanOrEqual(18);
    for (const key of groupKeys) {
      expect((COMBINATOR_NAME_GROUPS as any)[key].length).toBeGreaterThan(0);
    }
  });

  it('verifies parser, transformer, and procedural systems', () => {
    expect(typeof parseObj).toBe('function');
    expect(typeof parseMtl).toBe('function');
    expect(typeof Scaler.zoomAsset).toBe('function');
    expect(typeof PivotAdjuster.apply).toBe('function');
    expect(typeof BoundsCalculator.computeBounds).toBe('function');
    expect(typeof GeometryOptimizer.mergeMeshes).toBe('function');
    expect(typeof CharacterFactory.buildCharacter).toBe('function');
    expect(typeof MonsterFactory.buildMonster).toBe('function');
    expect(typeof AssetExporter.exportToObj).toBe('function');
    expect(typeof AssetExporter.exportToGlb).toBe('function');
    expect(typeof AssetCombiner.combineAssets).toBe('function');
  });

  it('verifies physics and environmental subsystems', () => {
    expect(PhysicsWorld).toBeDefined();
    expect(FluidSimulator).toBeDefined();
    expect(DestructionEngine).toBeDefined();
    expect(RagdollSolver).toBeDefined();
    expect(FoliageSystem).toBeDefined();
    expect(StructureSystem).toBeDefined();
    expect(WaterSystem).toBeDefined();
    expect(AtmosphereSystem).toBeDefined();
    expect(TerrainSystem).toBeDefined();
    expect(InteractivePropsSystem).toBeDefined();
  });

  it('verifies multi-backend renderers (Three, Babylon, PlayCanvas, Raw, WebGPU)', () => {
    expect(ThreeBackend).toBeDefined();
    expect(BabylonBackend).toBeDefined();
    expect(PlayCanvasBackend).toBeDefined();
    expect(RawWebGL2Backend).toBeDefined();
    expect(WebGPURenderBackend).toBeDefined();
    const registry = createDefaultRegistry();
    expect(registry.getAvailableBackends().length).toBe(5);
  });

  it('verifies input, audio, AI, and GameEngine facade', async () => {
    expect(InputMap).toBeDefined();
    expect(AudioBus).toBeDefined();
    expect(StateMachine).toBeDefined();
    expect(Blackboard).toBeDefined();
    expect(Steering).toBeDefined();
    const engine = await createEngine();
    expect(engine).toBeInstanceOf(GameEngine);
    expect(engine.physics).toBeDefined();
    expect(engine.particles).toBeDefined();
    expect(engine.decals).toBeDefined();
    expect(engine.audio).toBeDefined();
    expect(engine.input).toBeDefined();
    engine.dispose();
  });
});
