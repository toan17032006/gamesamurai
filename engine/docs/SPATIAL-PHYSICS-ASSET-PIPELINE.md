# Spatial Physics, Multi-Format Assets and the Asset Forge

This document describes the additions that connect the engine's animation,
procedural-asset and physics layers to a dependency-free spatial math core.

Everything described here is strictly typed and compiles with
`"strict": true` and `"noImplicitAny": true`.

---

## 1. Supported asset formats

`MultiFormatParser` recognises every format below from its extension and, where
available, from its magic bytes.

| Family | Extensions | Result |
| --- | --- | --- |
| Models | `.glb`, `.gltf` | Three.js scene, animations, materials, external buffers |
| Models | `.fbx` | Binary and ASCII FBX through a DOM-free `FBXLoader` adapter |
| Models | `.obj` | Geometry plus optional `.mtl` material library |
| Models | `.dae` | Collada scene |
| Models | `.3ds` | 3D Studio scene |
| Models | `.stl` | ASCII and binary STL |
| Models | `.ply` | ASCII and binary PLY, optional vertex colours |
| Exchange | `.usd`, `.usda`, `.usdc` | USD stage converted to a scene graph |
| Exchange | `.abc` | Alembic scene |
| Materials | `.mtl` | Material library, texture dependencies |
| Textures | `.png`, `.jpg`, `.jpeg`, `.webp`, `.tga`, `.exr`, `.hdr` | Image metadata + runtime texture when a DOM exists |
| Motion | `.bvh` | Skeleton hierarchy, motion frames, `AnimationClip` |
| Motion | `.vmd` | MikuMikuDance motion, bone frames, `AnimationClip` |
| Engine data | `.forge.json`, `.bot.json`, `.manifest.json`, `.sidecar.json` | Parsed payload under `data` |
| Custom | any registered extension | Result of the registered `AssetParserPlugin` |

Unknown extensions resolve to `'custom'`. If no plugin matches, the parser
returns an `UNSUPPORTED_FORMAT` `EngineError`; it never fabricates a scene.

```ts
import { MultiFormatParser } from '@aetheria/engine/asset-parser';

const result = await MultiFormatParser.parse(
  new Uint8Array(await file.arrayBuffer()),
  MultiFormatParser.detectFormat(file.name),
  { name: file.name, mtlText }
);

if (!result.ok) throw new Error(result.error.message);

const {
  root, format, triangleCount, vertexCount,
  materialsCount, dependencies, warnings, motion
} = result.value;
```

### Custom extensions

```ts
import { getExtensionRegistry } from '@aetheria/engine/asset-parser';

getExtensionRegistry().register({
  id: 'studio-voxel',
  name: 'Studio Voxel',
  format: 'custom',
  extensions: ['vox'],
  canParse: (header) => header instanceof Uint8Array && header[0] === 0x56,
  parse: (input) => decodeVoxel(input),
});
```

`parseFbx(input, options)` can be used directly when only FBX is needed. It
returns metrics, dependencies, warnings and animation clips, and throws a
descriptive error for corrupt containers.

---

## 2. Spatial math and acceleration structures

The spatial core has no dependency on Three.js and is exported two ways:

```ts
// Namespaced to avoid clashing with existing structural AABB/OBB interfaces.
import { SpatialMath } from '@aetheria/engine';

// Or as a dedicated subpath.
import {
  Vec3, Quat, Mat4,
  AABB, OBB, Sphere, Capsule, Plane,
  Triangle, Frustum,
  BVH, TriangleBVH, Octree,
  sweepSphereAABB, sweepSphereOBB,
  sweepAABBAABB, sweepCapsuleAABB,
  computeHullBounds,
} from '@aetheria/engine/spatial';
```

### Bounds

```ts
const box = AABB.fromPoints(vertices);
const hit = box.rayIntersection({
  origin: { x: 0, y: 0, z: 5 },
  direction: { x: 0, y: 0, z: -1 },
});

const obb = OBB.fromCenterSize(center, halfExtents, orientation);
const sphere = Sphere.fromPoints(vertices);
const capsule = Capsule.fromCenterHeight(center, radius, height, 'y');
const hull = computeHullBounds(vertices); // AABB + PCA OBB + sphere + centroid
```

`AABB`, `OBB`, `Sphere`, `Capsule` and `Plane` implement ray intersection,
containment, closest point, distance and volume/surface-area queries.

### BVH

```ts
const bvh = new BVH(items, { maxLeafSize: 4, bins: 12 }); // binned SAH
const candidates = bvh.queryAABB(box);
const nearest = bvh.queryNearest(point, 10);
const first = bvh.raycastFirst({ origin, direction });
const all = bvh.raycastBounds({ origin, direction });

const triangleBvh = new TriangleBVH(triangles);
const hit = triangleBvh.raycast({ origin, direction });
```

### Octree

```ts
const octree = new Octree<Entity>(new AABB(min, max), {
  maxDepth: 6,
  maxItemsPerNode: 8,
  looseness: 1.05,
});

octree.insert({ id, bounds, data: entity });
octree.insertMany(entries);
octree.update({ id, bounds, data: entity });
octree.remove(id);
const nearby = octree.querySphere(new Sphere(center, radius));
```

The octree grows its root when an item falls outside the current bounds and
rebuilds automatically.

### Sweeps (continuous collision detection)

```ts
const hit = sweepSphereAABB(center, radius, displacement, targetAABB);
if (hit.hit) {
  console.log(hit.timeOfImpact, hit.point, hit.normal);
}

const obbHit = sweepSphereOBB(center, radius, displacement, targetOBB);
const capsuleHit = sweepCapsuleAABB(capsule, displacement, targetAABB);
const swept = sweptBounds({ kind: 'sphere', center, radius }, displacement);
```

All sweeps use conservative advancement and return a normalised
`timeOfImpact` in `[0, 1]`, a world-space distance, a contact point and a
normal.

---

## 3. Physics world queries

`PhysicsWorld` now exposes spatial broadphase queries, multi-hit raycasts and
continuous sweeps in addition to its existing stepping, gravity, fluid and
destruction systems.

```ts
import { PhysicsWorld } from '@aetheria/engine/physics';
import { AABB } from '@aetheria/engine/spatial';

const world = new PhysicsWorld();

world.addBody({
  id: 'crate',
  mass: 10,
  position: { x: 0, y: 1, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  shape: { kind: 'box', half: { x: 0.5, y: 0.5, z: 0.5 } },
});

const overlapping = world.queryAABB(new AABB(
  { x: -2, y: -2, z: -2 },
  { x: 2, y: 2, z: 2 },
));
const near = world.querySphere({ x: 0, y: 0, z: 0 }, 5);
const hits = world.raycastAll(origin, direction, 50);
const sweeps = world.sweepSphere(center, radius, displacement);
const shapeHits = world.sweepShape(collisionShape, position, displacement);
```

`spatial-bridge.ts` converts every `CollisionShape` variant into spatial
bounds, sweep primitives and ray hits:

```ts
import {
  bodyBounds,
  collisionShapeBounds,
  collisionShapeToSweep,
  raycastCollisionShape,
  sweepCollisionShapeAgainstAABB,
  sweepCollisionShapeAgainstOBB,
} from '@aetheria/engine/physics';
```

### Sweep-and-prune broadphase

`PhysicsWorld` generates collision candidates with sweep-and-prune by default.
Bodies are sorted by their AABB minimum X, the active list is compacted as
intervals expire, and Y/Z overlaps are rejected before narrow-phase tests.

```ts
import { PhysicsWorld, SweepAndPruneBroadphase } from '@aetheria/engine/physics';

const world = new PhysicsWorld({
  broadphase: {
    margin: 0.1,          // expand every AABB for near misses
    skipStaticPairs: true // default
  },
});

world.broadphaseStats;    // { bodies, candidatePairs, overlapChecks, expired, staticPairsSkipped }
world.usesBroadphase;     // true

// Exact legacy O(n²) behavior for debugging or differential tests:
const reference = new PhysicsWorld({ broadphase: false });

// Standalone pair generation:
const broadphase = new SweepAndPruneBroadphase({ margin: 0 });
const pairs = broadphase.computePairs(world.bodiesList);
```

Pairs are returned in the original body-index order `(0,1), (0,2), …, (1,2), …`
so sequential impulse resolution stays deterministic. `bruteForcePairs(bodies)`
provides the unfiltered legacy list.

Static-static pairs are skipped unless `skipStaticPairs` is `false`. Because the
candidate set is computed before sequential resolution, a dense pile can create
a new overlap mid-step that was not present in the original list; use a margin
or a second pass when exact dense-pile equivalence with the legacy loop is
required. Sparse scenes step bit-identically with and without the broadphase.

---

## 4. Asset Forge

`AssetForge` is the end-to-end recipe pipeline. It composes the existing
designer, factory, analyzer and optimizer with the spatial and physics systems.

```ts
import { AssetForge } from '@aetheria/engine/procedural';

const forged = AssetForge.create({
  id: 'iron-sword',
  name: 'Iron Sword',
  category: 'weapon',
  tags: ['weapon', 'tier-1'],
  rig: 'static',
  parts: [
    { name: 'blade', shape: 'box', size: [0.16, 1.8, 0.06], position: [0, 1.2, 0] },
    { name: 'guard', shape: 'box', size: [0.7, 0.1, 0.14], position: [0, 0.3, 0] },
    { name: 'grip', shape: 'cylinder', size: [0.14, 0.5, 0.14], position: [0, 0, 0] },
  ],
  targetSize: [1, 2.2, 1],
  physics: {
    collision: 'box',      // auto | none | box | sphere | capsule | convexMesh
    mass: 4,
    friction: 0.6,
    restitution: 0.1,
    gravityScale: 1,
  },
  sockets: [{ name: 'grip', position: [0, 0, 0] }],
  lods: [{ distance: 20, ratio: 0.5 }],
  custom: { rarity: 'common' },
});

forged.bounds;      // aabb / obb / sphere / volume / surface area / center of mass
forged.hull;        // live spatial hull objects
forged.collision;   // collision shape, spawn position, mass, material
forged.sockets;     // named attachment sockets
forged.lods;        // triangle/distance plan
forged.analysis;    // full AssetAnalysisReport
forged.statistics;  // draw calls, triangles, bytes, score, budget status
```

### Optimize and export

```ts
const optimized = AssetForge.optimize(forged, {
  mergeDrawCalls: true,
  computeNormals: true,
});

const { exported, manifest } = AssetForge.export(forged, 'glb');

const bundle = AssetForge.pipeline(
  recipe,
  ['glb', 'gltf', 'obj', 'stl', 'ply', 'usda'],
);
// bundle.asset, bundle.optimized, bundle.exports, bundle.manifest
```

`ForgeManifest` is a versioned JSON record containing bounds, collision
settings, sockets, LODs, metrics, exported formats and custom metadata.

---

## 5. Combiner metadata and spatial utilities

Every one of the 450+ combiner specifications now carries a
`CombinerMetadata` record:

```ts
interface CombinatorSpec {
  readonly metadata?: {
    readonly bounds: {
      readonly required: boolean;
      readonly volumeKind: 'aabb' | 'obb' | 'sphere' | 'capsule';
      readonly query: 'none' | 'aabb' | 'sphere' | 'segment' | 'ray';
    };
    readonly physics: {
      readonly collider: 'none' | 'box' | 'sphere' | 'capsule' | 'mesh';
      readonly gravity: number;
      readonly mass?: number;
      readonly friction?: number;
      readonly restitution?: number;
      readonly dynamic: boolean;
    };
    readonly transform: {
      readonly space: 'local' | 'world';
      readonly affectsRoot: boolean;
      readonly animated: boolean;
    };
    readonly analytics: {
      readonly cost: 'low' | 'medium' | 'high';
      readonly mixes: number;
      readonly usesPhysics: boolean;
      readonly usesSpatial: boolean;
      readonly deterministic: boolean;
    };
    readonly tags?: readonly string[];
  };
}
```

`CombineResult` can now return typed `bounds`, `physics` and `diagnostics` in
addition to `layers`, `socket` and `info`.

Utility combiners are backed by `spatial-mapper.ts`:

| Combiner | Behaviour |
| --- | --- |
| `combineGenerateBoundingBox` | Spatial AABB/OBB/Sphere/Capsule snapshot |
| `combineGenerateBoundingSphere` | Bounding sphere + full snapshot |
| `combineGenerateBoundingCapsule` | Capsule proxy from the bounds |
| `combineComputeCenterOfMass` | Centroid + volume |
| `combineOptimizeDrawCalls` | Real static merge with before/after stats |
| `combineSetupLevelOfDetail` | Four-level LOD plan from triangle count |
| `combineValidateCollisionShape` | Recursive shape validation |
| `combineValidateSpatialBounds` | Finite/order/positive bounds validation |
| `combineRaycastAssetBounds` | Triangle-BVH raycast |
| `combineQueryAssetBounds` | AABB scene query |
| `combineSweepAssetCollider` | Continuous sweep against bounds |
| `combineBuildPhysicsProxy` | Physics-ready proxy from bounds |
| `combineSerializeEntityState` | Recursive transform/userData snapshot |
| `combineDeserializeEntityState` | Apply a snapshot back onto a graph |
| `combineCacheParsedAssetData` | Per-key parsed-asset cache |
| `combineDisposeUnusedAssets` | Dispose geometries and materials |
| `combinePoolEntityInstance` | Clone into a named instance pool |
| `combineTriggerParticleEmitter` | Dispatch `combiner:particle` on the root |
| `combineExecuteMasterPipeline` | Bounds + collision + stats + userData pipeline |

```ts
import { createEngineCombiner, type UtilFn } from '@aetheria/engine/combiner';
import { StateBlender } from '@aetheria/engine/combiner';

const api = createEngineCombiner(new StateBlender(root));
const bounds = (api.combineGenerateBoundingBox as UtilFn)(root);

bounds.bounds?.aabb;      // [min, max] tuples
bounds.bounds?.sphere;    // center + radius
bounds.bounds?.centerOfMass;
```

Direct bridge functions are exported too:

```ts
import {
  computeCombinerBounds,
  combinerRaycast,
  combinerQueryAABB,
  combinerQuerySphere,
  collisionShapeFromBounds,
  buildCombinerPhysicsProxy,
  validateCombinerCollisionShape,
  sweepColliderAgainstAABB,
  sweepColliderAgainstScene,
  invalidateCombinerSpatialCache,
} from '@aetheria/engine/combiner';
```

The triangle BVH used by combiner raycasts is cached per scene graph and
invalidated automatically when geometry or world matrices change.

---

## 6. Verification

```powershell
cd engine
.\node_modules\.bin\tsc.cmd -p tsconfig.json --noEmit
.\node_modules\.bin\vitest.cmd run
```

The suite covers spatial primitives, hull bounds, BVH/Octree queries, sweep
time-of-impact, physics broadphase/queries, all format extensions, parser
failure semantics, FBX corruption handling, the Asset Forge pipeline, combiner
metadata, the combiner spatial bridge, and world-subsystem hardening (weather,
environmental dynamics, vegetation, physics/materials).

Current status:

- `tsc --noEmit`: 0 errors with `strict` and `noImplicitAny`.
- Vitest: 41 files, 691 tests passing, including
  `tests/world-subsystems-hardening.test.ts` (56 focused cases for wind, fire,
  particles, weathering, ecosystems, tool impacts, fractures, debris, LOD,
  vegetation, rigid bodies, cloth, ropes, mechanisms and metal materials).
  The suite also passes with shuffled test order across seeds 1, 42, 777 and
  20261027.
- Type-boundary audit (`node scripts/type-any-audit.mjs`): **0** `: any`, **0**
  `as any`, and 0 affected files. The initial audit recorded 24,925 `: any` and
  6,908 `as any`, so the hardening pass removed all explicit `any` escapes.
  Runtime payloads now use `unknown` plus local `asRecord` guards and named
  `*Like` interfaces; generic defaults use `unknown` or concrete interfaces.
  The only remaining token matches are 7 intentional `'any'` string literals in
  AI target requirements and interactive-prop trigger conditions.

---

## 7. Design guarantees

- No placeholder scene is returned for unknown formats.
- No TypeScript `any` in `src`; semantic `'any'` string literals are listed in
  the verification section above.
- All public spatial values are JSON-friendly tuples or explicit classes.
- Spatial and physics bridge modules do not import renderer or scene code.
- Existing combiner names and groups are preserved; metadata is additive.
- `EngineBVHTree` and `EngineOctree` remain available and unchanged.
