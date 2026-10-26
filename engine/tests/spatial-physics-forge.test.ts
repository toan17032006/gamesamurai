import { describe, it, expect, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  AABB,
  BVH,
  Capsule,
  Mat4,
  OBB,
  Octree,
  Plane,
  Quat,
  Sphere,
  Triangle,
  TriangleBVH,
  Vec3,
  computeHullBounds,
  raycastTriangleBVH,
  sweepAABBAABB,
  sweepCapsuleAABB,
  sweepSphereAABB,
  sweepSphereOBB,
  sweptBounds,
} from '../src/spatial/index.js';
import { PhysicsWorld } from '../src/physics/index.js';
import { MultiFormatParser } from '../src/asset-parser/multi-format-parser.js';
import { getExtensionRegistry } from '../src/asset-parser/extension-registry.js';
import { detectFbxEncoding, parseFbx } from '../src/asset-parser/fbx-parser.js';
import { AssetForge, type ForgeRecipe } from '../src/procedural/asset-forge.js';
import {
  COMBINERS,
  createEngineCombiner,
  getCombinatorSpec,
  type UtilFn,
} from '../src/combiner/combine.js';
import { StateBlender } from '../src/combiner/state-blender.js';
import { SocketBinder } from '../src/combiner/socket-binder.js';
import {
  combinerBoundingSphere,
  combinerQueryAABB,
  combinerRaycast,
  computeCombinerBounds,
  validateCombinerCollisionShape,
} from '../src/combiner/spatial-mapper.js';

function boxMesh(size: [number, number, number], position: [number, number, number]): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial());
  mesh.position.set(...position);
  mesh.name = 'box';
  return mesh;
}

describe('spatial math, bounds and BVH', () => {
  it('computes vector, quaternion and matrix transforms', () => {
    expect(Vec3.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(Vec3.cross(new Vec3(1, 0, 0), new Vec3(0, 1, 0)).equals(new Vec3(0, 0, 1))).toBe(true);
    expect(Vec3.distance(new Vec3(0, 0, 0), new Vec3(3, 4, 0))).toBeCloseTo(5);

    const rotation = Quat.fromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2);
    const rotated = rotation.rotate(new Vec3(0, 0, 1));
    expect(rotated.equals(new Vec3(1, 0, 0), 1e-6)).toBe(true);

    const matrix = Mat4.compose(new Vec3(1, 2, 3), Quat.identity(), new Vec3(2, 2, 2));
    expect(matrix.determinant()).toBeCloseTo(8);
    expect(matrix.transformPoint(new Vec3(1, 1, 1)).equals(new Vec3(3, 4, 5))).toBe(true);
    const restored = matrix.invert().transformPoint(matrix.transformPoint(new Vec3(1, 1, 1)));
    expect(restored.equals(new Vec3(1, 1, 1), 1e-6)).toBe(true);
  });

  it('intersects AABB, OBB, sphere, capsule and plane with rays', () => {
    const box = AABB.fromPoints([
      new Vec3(-1, -1, -1),
      new Vec3(1, 1, 1),
    ]);
    expect(box.center.equals(new Vec3(0, 0, 0))).toBe(true);
    expect(box.size.x).toBe(2);
    expect(box.volume).toBe(8);

    const boxHit = box.rayIntersection({ origin: new Vec3(0, 0, 5), direction: new Vec3(0, 0, -1) });
    expect(boxHit.hit).toBe(true);
    expect(boxHit.distance).toBeCloseTo(4);
    expect(boxHit.normal.z).toBeCloseTo(1);

    const obb = OBB.fromCenterSize(new Vec3(), new Vec3(1, 1, 1), Quat.fromAxisAngle(new Vec3(0, 1, 0), Math.PI / 4));
    expect(obb.containsPoint(new Vec3(0.2, 0, 0.2))).toBe(true);
    expect(obb.intersectsAABB(box)).toBe(true);
    expect(obb.rayIntersection({ origin: new Vec3(0, 0, 5), direction: new Vec3(0, 0, -1) }).hit).toBe(true);

    const sphere = new Sphere(new Vec3(), 1);
    const sphereHit = sphere.rayIntersection({ origin: new Vec3(0, 0, 5), direction: new Vec3(0, 0, -1) });
    expect(sphereHit.distance).toBeCloseTo(4);

    const capsule = Capsule.fromCenterHeight(new Vec3(0, 1, 0), 0.5, 2);
    expect(capsule.start.equals(new Vec3(0, 0.5, 0))).toBe(true);
    expect(capsule.end.equals(new Vec3(0, 1.5, 0))).toBe(true);
    expect(capsule.height).toBeCloseTo(2);
    expect(capsule.containsPoint(new Vec3(0, 1, 0.4))).toBe(true);

    const plane = Plane.fromPointNormal(new Vec3(0, 0, 0), new Vec3(0, 0, 1));
    expect(plane.distanceToPoint(new Vec3(0, 0, 2))).toBeCloseTo(2);
    expect(plane.rayIntersection({ origin: new Vec3(0, 0, 5), direction: new Vec3(0, 0, -1) }).distance).toBeCloseTo(5);
  });

  it('queries a generic BVH and triangle BVH', () => {
    const items = [-3, 0, 3].map((x, index) => ({
      id: `item_${index}`,
      bounds: AABB.fromCenterSize(new Vec3(x, 0, 0), new Vec3(1, 1, 1)),
      data: x,
    }));
    const bvh = new BVH(items, { maxLeafSize: 1 });
    expect(bvh.stats.items).toBe(3);
    expect(bvh.queryAABB(new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1)))).toEqual([0]);
    const nearest = bvh.queryNearest(new Vec3(2.5, 0, 0));
    expect(nearest?.data).toBe(3);
    const rayHit = bvh.raycastFirst({ origin: new Vec3(0, 0, 5), direction: new Vec3(0, 0, -1) });
    expect(rayHit?.item.data).toBe(0);

    const triangles = [
      new Triangle(new Vec3(-1, -1, 0), new Vec3(1, -1, 0), new Vec3(0, 1, 0)),
      new Triangle(new Vec3(-1, -1, -2), new Vec3(1, -1, -2), new Vec3(0, 1, -2)),
    ];
    const triangleBvh = new TriangleBVH(triangles);
    const hit = triangleBvh.raycast({ origin: new Vec3(0, 0, 5), direction: new Vec3(0, 0, -1) });
    expect(hit?.distance).toBeCloseTo(5);
    expect(hit?.triangleIndex).toBe(0);
    const all = triangleBvh.raycastAll({ origin: new Vec3(0, 0, 5), direction: new Vec3(0, 0, -1) });
    expect(all).toHaveLength(2);
    expect(raycastTriangleBVH(new Vec3(0, 0, 5), new Vec3(0, 0, -1), triangleBvh)?.distance).toBeCloseTo(5);
  });

  it('supports dynamic octree insert, update, remove and root growth', () => {
    const octree = new Octree<number>(new AABB(new Vec3(-8, -8, -8), new Vec3(8, 8, 8)), {
      maxDepth: 4,
      maxItemsPerNode: 2,
    });
    for (let i = 0; i < 12; i += 1) {
      octree.insert({
        id: `n_${i}`,
        bounds: AABB.fromCenterSize(new Vec3(i - 6, 0, 0), new Vec3(0.5, 0.5, 0.5)),
        data: i,
      });
    }
    expect(octree.size).toBe(12);
    expect(octree.queryAABB(new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1))).length).toBeGreaterThan(0);
    expect(octree.querySphere(new Sphere(new Vec3(0, 0, 0), 2)).length).toBeGreaterThan(0);

    const moved = {
      id: 'n_0',
      bounds: AABB.fromCenterSize(new Vec3(40, 0, 0), new Vec3(0.5, 0.5, 0.5)),
      data: 0,
    };
    octree.update(moved);
    expect(octree.get('n_0')?.bounds.center.x).toBeCloseTo(40);
    expect(octree.bounds.containsAABB(moved.bounds)).toBe(true);
    expect(octree.remove('n_1')).toBe(true);
    expect(octree.size).toBe(11);
    expect(octree.getStats().items).toBe(11);
  });

  it('computes hull bounds and sweeps with time of impact', () => {
    const hull = computeHullBounds([
      new Vec3(-1, 0, -1),
      new Vec3(1, 0, -1),
      new Vec3(0, 2, 1),
    ]);
    expect(hull.aabb.max.y).toBeCloseTo(2);
    expect(hull.sphere.radius).toBeGreaterThan(0);

    const target = AABB.fromCenterSize(new Vec3(0, 0, 0), new Vec3(2, 2, 2));
    const sphereHit = sweepSphereAABB(new Vec3(0, 0, 5), 0.5, new Vec3(0, 0, -10), target);
    expect(sphereHit.hit).toBe(true);
    expect(sphereHit.timeOfImpact).toBeGreaterThan(0);
    expect(sphereHit.timeOfImpact).toBeLessThan(1);

    const miss = sweepSphereAABB(new Vec3(5, 0, 5), 0.5, new Vec3(0, 0, -10), target);
    expect(miss.hit).toBe(false);

    const obb = OBB.fromCenterSize(new Vec3(), new Vec3(1, 1, 1));
    expect(sweepSphereOBB(new Vec3(0, 0, 5), 0.5, new Vec3(0, 0, -10), obb).hit).toBe(true);

    const movingBox = AABB.fromCenterSize(new Vec3(0, 0, 5), new Vec3(1, 1, 1));
    expect(sweepAABBAABB(movingBox, new Vec3(0, 0, -10), target).hit).toBe(true);

    const capsule = Capsule.fromCenterHeight(new Vec3(0, 1, 5), 0.5, 2);
    expect(sweepCapsuleAABB(capsule, new Vec3(0, 0, -10), target).hit).toBe(true);

    const swept = sweptBounds({ kind: 'sphere', center: new Vec3(0, 0, 5), radius: 1 }, new Vec3(0, 0, -10));
    expect(swept.min.z).toBeLessThanOrEqual(-6);
    expect(swept.max.z).toBeGreaterThanOrEqual(6);
  });
});

describe('physics world spatial queries', () => {
  it('queries bounds/spheres, raycasts all bodies and sweeps a sphere', () => {
    const world = new PhysicsWorld();
    for (const [index, x] of [-3, 0, 3].entries()) {
      world.addBody({
        id: `body_${index}`,
        mass: 1,
        position: { x, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: { kind: 'sphere', radius: 0.5 },
      });
    }

    expect(world.bodyCount).toBe(3);
    const near = world.queryAABB(new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1)));
    expect(near.map((body) => body.id)).toEqual(['body_1']);
    expect(world.querySphere(new Vec3(3, 0, 0), 0.75).map((body) => body.id)).toEqual(['body_2']);

    const hits = world.raycastAll(new THREE.Vector3(-10, 0, 0), new THREE.Vector3(1, 0, 0), 30);
    expect(hits.map((hit) => hit.bodyId)).toEqual(['body_0', 'body_1', 'body_2']);
    expect(hits[0].distance).toBeCloseTo(6.5);

    const sweeps = world.sweepSphere(new Vec3(-10, 0, 0), 0.5, new Vec3(20, 0, 0));
    expect(sweeps.length).toBe(3);
    expect(sweeps[0].bodyId).toBe('body_0');
    expect(sweeps[0].timeOfImpact).toBeLessThan(sweeps[2].timeOfImpact);

    const spatialSweep = world.sweepSpatialShape({ kind: 'sphere', center: new Vec3(-10, 0, 0), radius: 0.5 }, new Vec3(20, 0, 0));
    expect(spatialSweep.length).toBe(3);
  });
});

describe('multi-format parser coverage', () => {
  const formatCases: Array<[string, string]> = [
    ['model.glb', 'glb'],
    ['model.gltf', 'gltf'],
    ['model.fbx', 'fbx'],
    ['model.obj', 'obj'],
    ['model.dae', 'dae'],
    ['model.3ds', '3ds'],
    ['model.stl', 'stl'],
    ['model.ply', 'ply'],
    ['scene.usd', 'usd'],
    ['scene.usda', 'usda'],
    ['scene.usdc', 'usdc'],
    ['scene.abc', 'abc'],
    ['motion.bvh', 'bvh'],
    ['motion.vmd', 'vmd'],
    ['material.mtl', 'mtl'],
    ['albedo.png', 'png'],
    ['albedo.jpg', 'jpg'],
    ['albedo.jpeg', 'jpg'],
    ['albedo.webp', 'webp'],
    ['albedo.tga', 'tga'],
    ['albedo.exr', 'exr'],
    ['albedo.hdr', 'hdr'],
    ['design.forge.json', 'forge-design'],
    ['bot.bot.json', 'bot-spec'],
    ['asset.manifest.json', 'asset-manifest'],
    ['asset.sidecar.json', 'asset-sidecar'],
  ];

  it('detects every required extension and unknown formats as custom', () => {
    for (const [path, format] of formatCases) {
      expect(MultiFormatParser.detectFormat(path)).toBe(format);
    }
    expect(MultiFormatParser.detectFormat('unknown.xyz')).toBe('custom');
    expect(MultiFormatParser.detectFormatFromBytes(new TextEncoder().encode('ply\nformat ascii 1.0'))).toBe('ply');
    expect(MultiFormatParser.detectFormatFromBytes(new TextEncoder().encode('HIERARCHY\nROOT Root'))).toBe('bvh');
    expect(MultiFormatParser.detectFormatFromBytes(new TextEncoder().encode('Kaydara FBX Binary  \u0000'))).toBe('fbx');
  });

  it('parses OBJ with MTL dependencies and triangle metrics', async () => {
    const obj = [
      'mtllib hero.mtl',
      'usemtl Skin',
      'v 0 0 0',
      'v 1 0 0',
      'v 0 1 0',
      'vt 0 0',
      'vn 0 0 1',
      'f 1/1/1 2/1/1 3/1/1',
    ].join('\n');
    const mtl = 'newmtl Skin\nKd 1 1 1\nmap_Kd skin.png';
    const result = await MultiFormatParser.parse(obj, 'obj', { mtlText: mtl });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.format).toBe('obj');
    expect(result.value.triangleCount).toBe(1);
    expect(result.value.vertexCount).toBe(3);
    expect(result.value.dependencies).toContain('hero.mtl');
    expect(result.value.dependencies).toContain('skin.png');
    expect(result.value.materialNames).toContain('Skin');
  });

  it('parses MTL material libraries', async () => {
    const result = await MultiFormatParser.parse('newmtl Steel\nKd 0.5 0.5 0.5\nNs 100', 'mtl');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.materialNames).toContain('Steel');
    expect(result.value.materialsCount).toBe(1);
  });

  it('parses BVH motion and PNG textures', async () => {
    const bvh = [
      'HIERARCHY',
      'ROOT Root',
      '{',
      '  OFFSET 0.00 0.00 0.00',
      '  CHANNELS 6 Xposition Yposition Zposition Xrotation Zrotation Yrotation',
      '  End Site',
      '  {',
      '    OFFSET 0.00 10.00 0.00',
      '  }',
      '}',
      'MOTION',
      'Frames: 2',
      'Frame Time: 0.033333',
      '0.0 0.0 0.0 0.0 0.0 0.0',
      '1.0 1.0 1.0 1.0 1.0 1.0',
    ].join('\n');
    const motion = await MultiFormatParser.parse(bvh, 'bvh');
    expect(motion.ok).toBe(true);
    if (!motion.ok) return;
    expect(motion.value.format).toBe('bvh');
    expect(motion.value.motion?.kind).toBe('bvh');
    expect(motion.value.animationsCount).toBe(1);

    const png = new Uint8Array(33);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const view = new DataView(png.buffer);
    view.setUint32(16, 16, false);
    view.setUint32(20, 16, false);
    png[24] = 8;
    png[25] = 2;
    const texture = await MultiFormatParser.parse(png, 'png');
    expect(texture.ok).toBe(true);
    if (!texture.ok) return;
    expect(texture.value.root.userData.imageInfo).toBeDefined();
    expect(texture.value.textureCount).toBe(typeof document === 'undefined' ? 0 : 1);
  });

  it('parses engine data documents and custom extension plugins', async () => {
    const forge = {
      kind: 'aetheria.forge.design',
      name: 'forge_blade',
      parts: [{ name: 'blade', shape: 'box' }],
    };
    const data = await MultiFormatParser.parse(JSON.stringify(forge), 'forge-design');
    expect(data.ok).toBe(true);
    if (!data.ok) return;
    expect((data.value.data as { name: string }).name).toBe('forge_blade');

    const registry = getExtensionRegistry();
    const pluginId = 'test_spatial_custom_plugin';
    registry.unregister(pluginId);
    const registered = registry.register({
      id: pluginId,
      name: 'Spatial Test',
      format: 'custom',
      extensions: ['spatialtest'],
      canParse: () => true,
      parse: () => ({ custom: true, points: 3 }),
    });
    expect(registered.ok).toBe(true);
    const custom = await MultiFormatParser.parse('custom-payload', 'custom', { name: 'spatialtest' });
    expect(custom.ok).toBe(true);
    if (!custom.ok) return;
    expect(custom.value.data).toEqual({ custom: true, points: 3 });
    registry.unregister(pluginId);

    const unknown = await MultiFormatParser.parse('payload', 'custom', { name: 'unknown' });
    expect(unknown.ok).toBe(false);
    if (unknown.ok) return;
    expect(unknown.error.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('rejects corrupt FBX data with descriptive errors', async () => {
    expect(detectFbxEncoding(new TextEncoder().encode('Kaydara FBX Binary  \u0000\u0000'))).toBe('binary');
    expect(detectFbxEncoding(new TextEncoder().encode('; FBX 7.4.0 project file\nFBXHeaderExtension'))).toBe('ascii');
    await expect(parseFbx(new Uint8Array(0))).rejects.toThrow(/FBX/);
  });
});

describe('combiner spatial metadata and utility bridge', () => {
  const recipe: ForgeRecipe = {
    name: 'forge_sword',
    category: 'weapon',
    parts: [
      { name: 'blade', shape: 'box', size: [0.18, 1.8, 0.08], position: [0, 1.2, 0], color: 0xccccdd },
      { name: 'guard', shape: 'box', size: [0.8, 0.12, 0.16], position: [0, 0.3, 0], color: 0x886622 },
    ],
    targetSize: [1, 2, 1],
    physics: { collision: 'box', mass: 4, friction: 0.6 },
    sockets: [{ name: 'grip', position: [0, 0, 0] }],
    lods: [{ distance: 20, ratio: 0.5 }],
    tags: ['weapon', 'forge'],
  };

  it('builds the complete forge pipeline with bounds, physics, sockets and exports', () => {
    const forged = AssetForge.create(recipe);
    expect(forged.id).toBe('forge_sword');
    expect(forged.bounds.aabb.max[1]).toBeGreaterThan(forged.bounds.aabb.min[1]);
    expect(forged.bounds.sphere.radius).toBeGreaterThan(0);
    expect(forged.collision?.shape.kind).toBe('box');
    expect(forged.collision?.material.friction).toBe(0.6);
    expect(forged.sockets.map((socket) => socket.name)).toContain('grip');
    expect(forged.lods[0].targetTriangles).toBeGreaterThan(0);
    expect(forged.statistics.triangles).toBeGreaterThan(0);

    const optimized = AssetForge.optimize(forged);
    expect(optimized.root).toBeInstanceOf(THREE.Group);
    expect(optimized.trianglesAfter).toBeGreaterThan(0);

    const exported = AssetForge.export(forged, 'glb');
    expect(exported.exported.extension).toBe('glb');
    expect(exported.manifest.generator).toBe('aetheria.asset-forge');
    expect(exported.manifest.exports[0].format).toBe('glb');

    const bundle = AssetForge.pipeline(recipe, ['obj', 'stl']);
    expect(bundle.exports.map((entry) => entry.format)).toEqual(['obj', 'stl']);
    expect(bundle.manifest.exports).toHaveLength(2);
  });

  it('attaches typed metadata to every combiner and exposes spatial utilities', () => {
    expect(COMBINERS.length).toBeGreaterThanOrEqual(450);
    const names = new Set<string>();
    for (const spec of COMBINERS) {
      expect(names.has(spec.name)).toBe(false);
      names.add(spec.name);
      expect(spec.metadata).toBeDefined();
      expect(spec.metadata?.category).toBe(spec.group);
      expect(spec.metadata?.bounds.volumeKind).toBeTypeOf('string');
      expect(spec.metadata?.analytics.deterministic).toBeTypeOf('boolean');
    }

    const boundsSpec = getCombinatorSpec('combineGenerateBoundingBox');
    expect(boundsSpec?.metadata?.bounds.required).toBe(true);
    expect(boundsSpec?.metadata?.physics.collider).toBe('mesh');
    expect(boundsSpec?.metadata?.analytics.usesSpatial).toBe(true);

    const physicsSpec = getCombinatorSpec('combineFractureAndShatter');
    expect(physicsSpec?.metadata?.bounds.query).toBeTypeOf('string');
    expect(physicsSpec?.metadata?.analytics.usesPhysics).toBe(true);

    const group = new THREE.Group();
    group.add(boxMesh([2, 2, 2], [0, 1, 0]));
    const bounds = computeCombinerBounds(group);
    expect(bounds.aabb.min[1]).toBeCloseTo(0);
    expect(bounds.aabb.max[1]).toBeCloseTo(2);
    expect(bounds.triangleCount).toBe(12);
    expect(combinerBoundingSphere(group).radius).toBeGreaterThan(1);

    const sphereHit = combinerRaycast(group, { origin: [0, 1, 5], direction: [0, 0, -1] });
    expect(sphereHit?.hit).toBe(true);
    expect(sphereHit?.distance).toBeCloseTo(4);

    const queryHits = combinerQueryAABB(group, { min: [-1, 0, -1], max: [1, 2, 1] });
    expect(queryHits).toHaveLength(1);

    expect(validateCombinerCollisionShape({ kind: 'sphere', radius: 1 }).valid).toBe(true);
    expect(validateCombinerCollisionShape({ kind: 'box', half: { x: 1, y: 1, z: 1 } }).valid).toBe(true);
    expect(validateCombinerCollisionShape({ kind: 'sphere', radius: -1 }).valid).toBe(false);
    expect(validateCombinerCollisionShape().valid).toBe(false);

    const blender = new StateBlender(group);
    const api = createEngineCombiner(blender, new SocketBinder());
    const util = api.combineGenerateBoundingBox as UtilFn;
    const boundsResult = util(group);
    expect(boundsResult.ok).toBe(true);
    expect(boundsResult.bounds?.aabb.max[1]).toBeCloseTo(2);

    const sphereResult = (api.combineGenerateBoundingSphere as UtilFn)(group);
    expect(sphereResult.info?.sphere).toBeDefined();

    const validation = (api.combineValidateCollisionShape as UtilFn)(group, undefined, {
      collisionShape: { kind: 'sphere', radius: 1 },
    });
    expect(validation.ok).toBe(true);

    const proxy = (api.combineBuildPhysicsProxy as UtilFn)(group, undefined, { mass: 12 });
    expect(proxy.physics?.mass).toBe(12);
    expect(proxy.info?.proxy).toBeDefined();

    const master = (api.combineExecuteMasterPipeline as UtilFn)(group);
    expect(master.ok).toBe(true);
    expect(master.bounds).toBeDefined();
    expect(master.physics).toBeDefined();

    const serialized = (api.combineSerializeEntityState as UtilFn)(group);
    expect(serialized.ok).toBe(true);
    const json = serialized.info?.json;
    expect(typeof json).toBe('string');
    const deserialized = (api.combineDeserializeEntityState as UtilFn)(group, json as string);
    expect(deserialized.ok).toBe(true);

    const lod = (api.combineSetupLevelOfDetail as UtilFn)(group);
    expect(lod.ok).toBe(true);
    expect((lod.info?.levels as unknown[]).length).toBe(4);

    const optimized = (api.combineOptimizeDrawCalls as UtilFn)(group);
    expect(optimized.ok).toBe(true);
    expect(optimized.info?.mergedRoot).toBeInstanceOf(THREE.Group);
  });
});
