/**
 * @file core-architecture.test.ts
 * @module @aetheria/engine/tests
 * @description Comprehensive unit tests for the augmented Core 3D Game Engine architecture:
 * Multi-format parser, PBR texture unpacker, Motion parser, Spatial bounds, Mesh analyzer,
 * LOD generator, Gravity solver, Collision algorithms (GJK/EPA), Spatial partitioning, and Three.js bridge.
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

// 1. Types & Core Contracts
import {
  engineOk,
  engineErr,
  EngineResult,
  TransformChain
} from '../src/types/engine.types.js';

// 2. Asset Parser
import {
  MultiFormatParser,
  TexturePBRUnpacker,
  MotionParser,
  getExtensionRegistry
} from '../src/asset-parser/index.js';

// 3. Transformer & Bounds
import {
  SpatialBoundsCalculator,
  MeshAnalyzer,
  LODGenerator,
  createTransformChain,
  adjustPivotToCenterOfMass
} from '../src/transformer/index.js';

// 4. Physics & Collision
import {
  GravitySolver,
  CollisionAlgorithms,
  EngineBVHTree,
  EngineOctree
} from '../src/physics/index.js';

// 5. Renderer Bridge
import { ThreeBridge } from '../src/renderer/index.js';

describe('Core 3D Game Engine Architecture Suite', () => {

  // ==========================================================================
  // 1. Result & Fluent Transform Contracts
  // ==========================================================================
  describe('1. EngineResult & TransformChain Contracts', () => {
    it('generates discriminated union EngineResult with value or typed error', () => {
      const okRes = engineOk({ entityId: 'ent_101' }, { source: 'spawner' });
      expect(okRes.ok).toBe(true);
      if (okRes.ok) {
        expect(okRes.value.entityId).toBe('ent_101');
        expect(okRes.meta?.source).toBe('spawner');
      }

      const errRes = engineErr({
        code: 'COLLISION_OUT_OF_BOUNDS',
        message: 'Entity position is outside the world partition volume.',
        subsystem: 'Physics'
      });
      expect(errRes.ok).toBe(false);
      if (!errRes.ok) {
        expect(errRes.error.code).toBe('COLLISION_OUT_OF_BOUNDS');
      }
    });

    it('executes fluent TransformChain operations sequentially', () => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      const chain = createTransformChain(mesh);

      chain.translate(5, 10, -2)
           .rotate(0.5, 0.2, 0)
           .scale(2.0)
           .apply();

      expect(mesh.position.x).toBe(5);
      expect(mesh.position.y).toBe(10);
      expect(mesh.position.z).toBe(-2);
      expect(mesh.scale.x).toBe(2.0);
    });
  });

  // ==========================================================================
  // 2. Asset Parser, PBR Unpacker & Motion
  // ==========================================================================
  describe('2. Multi-Format Parser & PBR Texture Unpacker', () => {
    it('detects asset formats correctly across 17+ extensions', () => {
      expect(MultiFormatParser.detectFormat('hero.glb')).toBe('glb');
      expect(MultiFormatParser.detectFormat('scene.usdc')).toBe('usdc');
      expect(MultiFormatParser.detectFormat('character.bvh')).toBe('bvh');
      expect(MultiFormatParser.detectFormat('albedo.webp')).toBe('webp');
      expect(MultiFormatParser.detectFormat('config.forge.json')).toBe('forge-design');
    });

    it('unpacks ORM textures into discrete AmbientOcclusion, Roughness, and Metalness maps', () => {
      const width = 4;
      const height = 4;
      const pixelCount = width * height;
      const ormData = new Uint8Array(pixelCount * 3);

      for (let i = 0; i < pixelCount; i++) {
        ormData[i * 3] = 120;     // Red = AO
        ormData[i * 3 + 1] = 200; // Green = Roughness
        ormData[i * 3 + 2] = 50;  // Blue = Metalness
      }

      const unpackRes = TexturePBRUnpacker.unpackORM({
        channel: 'roughness',
        format: 'png',
        width,
        height,
        channels: 3,
        colorSpace: 'Linear',
        data: ormData
      });

      expect(unpackRes.ok).toBe(true);
      if (unpackRes.ok) {
        expect(unpackRes.value.ambientOcclusion.data[0]).toBe(120);
        expect(unpackRes.value.roughness.data[0]).toBe(200);
        expect(unpackRes.value.metalness.data[0]).toBe(50);
      }
    });

    it('inverts normal map Y channel for DirectX/OpenGL conversion', () => {
      const normData = new Uint8Array([128, 50, 255, 128, 200, 255]);
      const normMap = {
        channel: 'normal' as const,
        format: 'png' as const,
        width: 2,
        height: 1,
        channels: 3,
        colorSpace: 'Linear' as const,
        data: normData
      };

      const flipped = TexturePBRUnpacker.flipNormalY(normMap);
      expect(flipped.data[1]).toBe(255 - 50);  // 205
      expect(flipped.data[4]).toBe(255 - 200); // 55
    });

    it('parses procedural custom extensions via ExtensionRegistry', async () => {
      const reg = getExtensionRegistry();
      expect(reg.has('forge-design')).toBe(true);

      const parsed = await reg.get('forge-design')?.parse(JSON.stringify({
        generator: 'dungeon_level_1',
        rooms: 12
      }));

      expect(parsed.generator).toBe('dungeon_level_1');
      expect(parsed.rooms).toBe(12);
    });
  });

  // ==========================================================================
  // 3. Spatial Bounds, Mesh Analysis & LOD Generator
  // ==========================================================================
  describe('3. Spatial Bounds, Mesh Analysis & LOD Decimation', () => {
    it('calculates AABB, Ritter Bounding Sphere, and PCA OBB with center of mass', () => {
      // 8 corners of a 2x4x6 box centered at origin
      const positions = new Float32Array([
        -1, -2, -3,
         1, -2, -3,
        -1,  2, -3,
         1,  2, -3,
        -1, -2,  3,
         1, -2,  3,
        -1,  2,  3,
         1,  2,  3
      ]);

      const boundsRes = SpatialBoundsCalculator.computeFromPositions(positions);
      expect(boundsRes.ok).toBe(true);
      if (boundsRes.ok) {
        const report = boundsRes.value;
        expect(report.aabb.min.x).toBeCloseTo(-1);
        expect(report.aabb.max.x).toBeCloseTo(1);
        expect(report.dimensions.x).toBeCloseTo(2);
        expect(report.dimensions.y).toBeCloseTo(4);
        expect(report.dimensions.z).toBeCloseTo(6);
        expect(report.centerOfMass.x).toBeCloseTo(0);
        expect(report.centerOfMass.y).toBeCloseTo(0);
        expect(report.centerOfMass.z).toBeCloseTo(0);
        expect(report.sphere.radius).toBeGreaterThanOrEqual(Math.sqrt(1 + 4 + 9));
      }
    });

    it('analyzes manifoldness and calculates MikkTSpace tangents for triangle mesh', () => {
      // Single triangle with normal and UV
      const positions = new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0
      ]);
      const normals = new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ]);
      const uvs = new Float32Array([
        0, 0,
        1, 0,
        0, 1
      ]);

      const analysis = MeshAnalyzer.analyze(positions, undefined, uvs, normals);
      expect(analysis.ok).toBe(true);
      if (analysis.ok) {
        expect(analysis.value.topology.vertexCount).toBe(3);
        expect(analysis.value.topology.triangleCount).toBe(1);
        expect(analysis.value.surfaceArea).toBeCloseTo(0.5);
        expect(analysis.value.boundaryEdges.length).toBe(3); // Open triangle
      }

      const tangents = MeshAnalyzer.computeTangents(positions, normals, uvs);
      expect(tangents.length).toBe(12); // 3 vertices * 4 components
      expect(tangents[0]).toBeCloseTo(1); // Tangent X points in +U direction
      expect(tangents[3]).toBe(1); // Handedness sign
    });

    it('generates multi-level LOD hierarchy (LOD0 -> LOD3) with vertex decimation', () => {
      const sourceGeom = new THREE.TorusKnotGeometry(1, 0.4, 64, 16);
      const lodRes = LODGenerator.generate(sourceGeom);

      expect(lodRes.ok).toBe(true);
      if (lodRes.ok) {
        const hierarchy = lodRes.value;
        expect(hierarchy.levels.length).toBe(4);
        expect(hierarchy.levels[0].distance).toBe(0);
        expect(hierarchy.levels[3].distance).toBe(75);
        // Decimated levels have fewer triangles than original
        expect(hierarchy.levels[3].triangleCount).toBeLessThan(hierarchy.originalTriangles);
      }
    });
  });

  // ==========================================================================
  // 4. Regional Gravity, GJK/EPA & Spatial Partitioning
  // ==========================================================================
  describe('4. Regional Gravity, GJK/EPA & Spatial Partitioning', () => {
    it('applies point attractor and regional gravity zones with buoyancy', () => {
      const solver = new GravitySolver();
      solver.addZone({
        id: 'planet_gravity',
        type: 'point-attractor',
        origin: { x: 0, y: 0, z: 0 },
        strength: 50.0,
        radius: 100,
        priority: 10
      });

      // Point at (0, 10, 0) should be pulled downward toward origin
      const g = solver.computeGravityAt({ x: 0, y: 10, z: 0 });
      expect(g.y).toBeLessThan(0);
      expect(g.x).toBeCloseTo(0);

      // Evaluate body forces in fluid (placed at y = 2, pulled downward toward y = 0)
      const body = {
        id: 'crate_1',
        mass: 10,
        position: { x: 0, y: 2, z: 0 },
        velocity: { x: 0, y: -5, z: 0 },
        shape: { kind: 'box' as const, half: { x: 0.5, y: 0.5, z: 0.5 } }
      };

      const step = solver.stepBodyForces(
        body,
        [{ id: 'water_pool', density: 1000, bounds: { min: { x: -10, y: 0, z: -10 }, max: { x: 10, y: 10, z: 10 } } }],
        0.016
      );

      expect(step.ok).toBe(true);
      if (step.ok) {
        expect(step.value.inFluid).toBe(true);
        expect(step.value.appliedBuoyancy.y).toBeGreaterThan(0);
      }
    });

    it('detects 3D intersection and separation using pure GJK solver', () => {
      const boxA = { kind: 'box' as const, half: { x: 1, y: 1, z: 1 } };
      const boxB = { kind: 'box' as const, half: { x: 1, y: 1, z: 1 } };

      // Overlapping boxes
      const resOverlap = CollisionAlgorithms.gjk(boxA, { x: 0, y: 0, z: 0 }, boxB, { x: 1.5, y: 0, z: 0 });
      expect(resOverlap.intersecting).toBe(true);

      // Separated boxes
      const resSeparated = CollisionAlgorithms.gjk(boxA, { x: 0, y: 0, z: 0 }, boxB, { x: 5, y: 0, z: 0 });
      expect(resSeparated.intersecting).toBe(false);
      expect(resSeparated.distance).toBeGreaterThan(0);
    });

    it('performs precise raycast against AABB, Sphere, and Triangle', () => {
      // Ray vs Sphere
      const sphereHit = CollisionAlgorithms.raycastSphere(
        { x: 0, y: 0, z: -5 },
        { x: 0, y: 0, z: 1 },
        10,
        { center: { x: 0, y: 0, z: 0 }, radius: 1.0 }
      );
      expect(sphereHit.hit).toBe(true);
      expect(sphereHit.distance).toBeCloseTo(4.0);

      // Ray vs Triangle
      const triHit = CollisionAlgorithms.raycastTriangle(
        { x: 0.2, y: 0.2, z: -2 },
        { x: 0, y: 0, z: 1 },
        5,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      );
      expect(triHit.hit).toBe(true);
      expect(triHit.distance).toBeCloseTo(2.0);
    });

    it('builds and queries BVHTree with SAH midpoint acceleration', () => {
      const items = [
        { id: '1', bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, data: 'itemA' },
        { id: '2', bounds: { min: { x: 5, y: 5, z: 5 }, max: { x: 6, y: 6, z: 6 } }, data: 'itemB' },
        { id: '3', bounds: { min: { x: 10, y: 10, z: 10 }, max: { x: 11, y: 11, z: 11 } }, data: 'itemC' }
      ];

      const bvh = new EngineBVHTree(items, 1);
      const queryA = bvh.queryAABB({ min: { x: -0.5, y: -0.5, z: -0.5 }, max: { x: 2, y: 2, z: 2 } });

      expect(queryA.length).toBe(1);
      expect(queryA[0]).toBe('itemA');
    });

    it('inserts and queries entities within dynamic Octree', () => {
      const octree = new EngineOctree<string>(
        { min: { x: -100, y: -100, z: -100 }, max: { x: 100, y: 100, z: 100 } }
      );

      octree.insert({
        id: 'npc_guard',
        bounds: { min: { x: 4, y: 0, z: 4 }, max: { x: 6, y: 2, z: 6 } },
        data: 'guard_soldier'
      });

      const nearResults = octree.queryRadius({ x: 5, y: 1, z: 5 }, 3.0);
      expect(nearResults).toContain('guard_soldier');

      const farResults = octree.queryRadius({ x: 50, y: 50, z: 50 }, 3.0);
      expect(farResults.length).toBe(0);
    });
  });

  // ==========================================================================
  // 5. Two-Way Three.js Bridge
  // ==========================================================================
  describe('5. Two-Way Three.js Bridge', () => {
    it('converts between zero-dependency GeometryBuffers and THREE.BufferGeometry seamlessly', () => {
      const geom = new THREE.BoxGeometry(2, 2, 2);
      const toEngine = ThreeBridge.threeGeometryToEngine(geom);

      expect(toEngine.ok).toBe(true);
      if (toEngine.ok) {
        expect(toEngine.value.vertex.vertexCount).toBe(geom.getAttribute('position').count);

        const backToThree = ThreeBridge.engineGeometryToThree(
          toEngine.value.vertex,
          toEngine.value.index
        );
        expect(backToThree.ok).toBe(true);
        if (backToThree.ok) {
          expect(backToThree.value.getAttribute('position').count).toBe(geom.getAttribute('position').count);
        }
      }
    });

    it('creates Three.js spatial bounds visualizer with wireframe helpers', () => {
      const boundsReport = {
        aabb: { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } },
        obb: { center: { x: 0, y: 0, z: 0 }, halfExtents: { x: 1, y: 1, z: 1 }, axes: [{ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }] as any },
        sphere: { center: { x: 0, y: 0, z: 0 }, radius: 1.5 },
        capsule: { start: { x: 0, y: -0.5, z: 0 }, end: { x: 0, y: 0.5, z: 0 }, radius: 0.5 },
        centerOfMass: { x: 0, y: 0, z: 0 },
        dimensions: { x: 2, y: 2, z: 2 },
        volume: 8,
        surfaceArea: 24
      };

      const visualizer = ThreeBridge.createBoundsVisualizer(boundsReport);
      expect(visualizer.children.length).toBeGreaterThanOrEqual(2);
      expect(visualizer.getObjectByName('aabb_helper')).toBeDefined();
      expect(visualizer.getObjectByName('sphere_helper')).toBeDefined();
    });
  });
});
