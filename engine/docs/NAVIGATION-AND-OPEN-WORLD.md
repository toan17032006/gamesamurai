# Navigation, Population LOD and Open-World Streaming

`@aetheria/engine/navigation` and `@aetheria/engine/open-world` turn the engine
into an open-world runtime without coupling it to rendering, physics or a
particular game loop. Both packages are dependency-free, deterministic and
usable from a browser, a worker or a headless server simulation.

```ts
import { NavGrid, NavAgent } from '@aetheria/engine/navigation';
import { PopulationManager, WorldStreamer } from '@aetheria/engine/open-world';
```

---

## 1. Navigation grid

`NavGrid` stores walkability and movement cost for an X/Z cell grid. Every cell
center has a world position derived from `origin`, `cellSize` and an optional
terrain sampler.

```ts
const grid = new NavGrid({
  width: 128,
  height: 128,
  cellSize: 1,
  origin: { x: -64, y: 0, z: -64 },
  heightAt: (x, z) => terrainHeight(x, z),
});
```

### ASCII maps

```ts
const grid = NavGrid.fromAscii([
  '..........',
  '.########.',
  '..........',
]);

grid.toAscii(); // identical rows; '#' blocked, digits = cost, '.' open
```

`'#'` and `'X'` are blocked; digits `1`–`9` set a movement cost; every other
character is open ground. Missing characters at the end of short rows are
treated as open.

### Editing

```ts
grid.setWalkableCell(4, 2, false);
grid.setCostCell(4, 3, 4);       // cost multiplier (minimum 0.01)
grid.blockCircle({ x: 8, y: 0, z: 8 }, 3);
grid.setCircle({ x: 8, y: 0, z: 18 }, 2.5, true, 2);
grid.setRect(
  { x: -4, y: 0, z: -4 },
  { x: 4, y: 0, z: 4 },
  false,
);
grid.clear(true);                // reset to fully walkable
```

Queries: `isWalkableCell`, `isWalkable`, `inBoundsCell`, `worldToCell`,
`cellToWorld`, `costAtCell`, `findNearestWalkableCell`.

```ts
const cell = grid.worldToCell({ x: 3.2, y: 0, z: 8.7 });
const world = grid.cellToWorld(cell.x, cell.z);
const nearest = grid.findNearestWalkableCell({ x: 4, y: 0, z: 4 }, 6);
```

### A* pathfinding

```ts
const path = grid.findPath(
  { x: 0.5, y: 0, z: 0.5 },
  { x: 42.5, y: 0, z: 17.5 },
  {
    allowDiagonal: true,   // default true; corner cutting is always prevented
    smooth: true,          // line-of-sight waypoint reduction
    heuristicWeight: 1,    // > 1 trades optimality for speed
    maxIterations: 4096,   // default width * height * 4
  },
);
```

`NavPath` reports `success`, `points`, `visited`, `cost`, geometric `length`,
`start`/`goal` cells and a failure `reason` (`invalid-grid`, `start-outside`,
`goal-outside`, `start-blocked`, `goal-blocked`, `no-path`, `iteration-limit`).

Behavior:

- blocked starts/goals are snapped to the nearest reachable walkable cell;
- diagonal moves cost `sqrt(2)` and are rejected when either adjacent
  orthogonal cell is blocked;
- costs multiply movement, so expensive terrain is avoided when a detour is
  cheaper;
- `hasLineOfSight(a, b)` traverses every cell touched by the segment
  (Amanatides–Woo) and rejects exact diagonal corner cuts;
- `smoothPath` keeps only the endpoints needed to preserve the route;
- identical requests return identical points, cost and visited counts.

### Serialization

```ts
const snapshot = grid.toJSON();          // width, height, cellSize, origin, bitmap, costs
const restored = NavGrid.fromJSON(snapshot, terrainHeight);
const copy = grid.clone(terrainHeight);
grid.checksum();                         // FNV-1a over walkability
```

JSON snapshots are suitable for save games or network transfer. `checksum()`
supports differential tests and content hashing.

---

## 2. Path-following agent

`NavAgent` is renderer-agnostic. It owns a position, velocity, waypoint list and
stuck timer, and exposes steering-style acceleration plus arrival braking.

```ts
const agent = new NavAgent(
  { x: 0.5, y: 0, z: 0.5 },
  {
    speed: 5,
    acceleration: 20,
    arriveRadius: 0.2,
    slowRadius: 1.5,
    stuckTimeout: 1,
    minSpeed: 0.05,
  },
);

const path = agent.setDestination(grid, { x: 10.5, y: 0, z: 0.5 });

for (let frame = 0; frame < 600; frame++) {
  const update = agent.update(1 / 60, {
    destination: { x: 10.5, y: 0, z: 0.5 },
    grid,
    repathInterval: 0.5,
  });
  if (update.arrived) break;
  if (update.needsRepath) agent.repath(grid);
}
```

`NavAgentUpdate` reports `arrived`, `moved`, `speed`, the current waypoint
index/count, `distanceToGoal`, `stuck` and `needsRepath`.

Methods and properties:

| Member | Meaning |
| --- | --- |
| `setPath(points, path?)` | Install a precomputed route. |
| `setDestination(grid, goal, options?)` | Compute and install a new route; keeps the old path when the request fails. |
| `repath(grid, options?)` | Recompute the current destination. |
| `update(dt, options?)` | Advance steering, waypoints, arrival and stuck detection. |
| `clearPath()` | Stop following and forget the destination. |
| `teleport(position)` | Move without carrying momentum. |
| `hasPath`, `destination`, `remainingWaypoints`, `isStuck`, `lastPath`, `lastMovement` | Read-only state. |

Agents are intentionally not tied to `AgentBrain`; feed the resulting position
into a brain observation or a physics body as needed.

---

## 3. Population LOD

`PopulationManager` assigns every NPC, animal, vehicle or prop a simulation
tier from its distance to the viewer, then time-slices updates by per-tier
budgets and an optional frame budget.

```ts
const population = new PopulationManager(
  {
    fullDistance: 60,
    reducedDistance: 140,
    minimalDistance: 260,
    reducedInterval: 0.2,
    minimalInterval: 1,
    dormantInterval: 5,
    maxFullUpdates: 0,      // 0 = unlimited
    maxReducedUpdates: 0,
    maxMinimalUpdates: 0,
    maxDormantUpdates: 4,
    tierHysteresis: 0.15,
    frameBudgetMs: 0,       // 0 = no wall-clock budget
    planar: true,           // measure on X/Z
  },
  {
    onUpdate: (agent, update) => simulate(agent.id, update.dt, update.tier),
    onTierChange: (agent, previous, next) => setLodMesh(agent.id, next),
    onAdd: (agent) => spawn(agent),
    onRemove: (agent) => despawn(agent),
  },
);

population.add({
  id: 'npc_blacksmith',
  position: { x: 4, y: 0, z: 10 },
  radius: 0.5,            // softens distance
  importance: 0.9,        // tie-breaker under budgets
  pinned: false,          // pinned actors bypass tier caps
  tags: ['npc', 'merchant'],
  metadata: { faction: 'town' },
});

population.update({ x: 0, y: 0, z: 0 }, 1 / 60);
```

Tiers, nearest to farthest: `full`, `reduced`, `minimal`, `dormant`.

- Reduced/minimal/dormant agents update at their configured intervals; the
  callback receives accumulated `dt` so simulation speed stays correct.
- Updates are fair and round-robin: pinned first, then nearest tier, then least
  recently updated, importance, distance and id.
- Pinned agents update every frame and ignore tier caps (stats still count
  them). Forced tiers via `setTier` are stable until cleared with `null`.
- Hysteresis expands the current tier's boundary, preventing LOD flicker.
- `queryRadius(center, radius, { maxTier?, tier? })` returns nearest-first
  copies for gameplay queries.
- `upsert` registers or moves an actor; duplicate ids throw.
- `setPosition`, `setImportance`, `setPinned`, `setTier`, `setTags`, `get`,
  `list`, `remove`, `has`, `clear` manage live records.
- `getStats()` reports totals per tier, updates per tier, skipped actors,
  budget exhaustion, tier-change count, frame, elapsed time and viewer.

### Wiring to `GameEngine`

`GameEngine` owns a default population manager and a streamer:

```ts
const engine = await createEngine({ canvas });

engine.registerAgent({ id: 'npc_01', position: { x: 4, y: 0, z: 8 } });
engine.updatePopulation(engine.camera.position, 1 / 60);
engine.getPopulationStats();

engine.unregisterAgent('npc_01');
```

The default ticker already calls `population.update(camera.position, dt)`, so
manual updates are only needed for custom viewers or fixed-step loops.

---

## 4. Region streaming

`WorldStreamer<T>` loads and releases chunks, cells or points of interest around
a moving viewer. Payloads are opaque; each region owns optional `load`/`unload`
callbacks.

```ts
const streamer = new WorldStreamer<Chunk>(
  {
    loadRadius: 200,
    unloadRadius: 250,       // defaults to loadRadius * 1.25; must be >= loadRadius
    maxConcurrentLoads: 2,
    maxLoadedRegions: 0,     // 0 = unlimited
    retryLimit: 2,
    autoUnload: true,
    planar: true,
  },
  {
    onLoad: (region, payload) => scene.add(payload),
    onUnload: (region, payload) => scene.remove(payload),
    onError: (region, error, phase) => console.warn(region.id, phase, error),
    onStateChange: (region, previous, next) => updateDebugHud(region, next),
  },
);

streamer.add({
  id: 'chunk_0_0',
  center: { x: 0, y: 0, z: 0 },
  radius: 32,
  priority: 10,
  pinned: false,
  kind: 'terrain',
  metadata: { biome: 'forest' },
  load: async () => buildChunk(0, 0),
  unload: (region, chunk) => chunk.dispose(),
});

streamer.update(engine.camera.position, 1 / 60);
await streamer.waitForIdle(); // or streamer.flush()
```

Behavior:

- regions within `loadRadius` load nearest-first, pinned-first, then by
  priority and id;
- loaded regions beyond `unloadRadius` unload automatically;
- `maxLoadedRegions` is a soft cap that evicts the farthest non-pinned region
  outside the load radius;
- failed loads retry until `retryLimit`, then stay `failed`;
- removing a region mid-load invalidates the request and releases the eventual
  payload through its `unload` hook;
- synchronous loaders settle immediately; asynchronous loaders are tracked by
  `waitForIdle`;
- `pin`, `upsert`, `remove`, `get`, `list`, `has`, `clear` manage regions;
- `getStats()` reports total/loaded/loading/unloaded/failed counts, in-flight
  loads, per-frame loads/unloads, totals and failures.

### Wiring to `GameEngine`

```ts
engine.addRegion({
  id: 'chunk_0_0',
  center: { x: 0, y: 0, z: 0 },
  load: async () => loadChunk(0, 0),
});

engine.updateStreaming(engine.camera.position, 1 / 60);
await engine.waitForStreaming();
engine.removeRegion('chunk_0_0');
```

### Navigation through `GameEngine`

```ts
engine.setNavGrid(grid);                 // or engine.createNavGrid(config)
engine.isNavigable({ x: 1, y: 0, z: 1 });
const path = engine.findNavPath(start, goal, { smooth: true });
```

`navGrid` starts as `null`; `findNavPath` returns `null` and `isNavigable`
returns `false` until a grid is installed. `dispose()` clears navigation,
population and streaming state.

---

## 5. Determinism and performance

- Population queries and update ordering use stable id tie-breakers.
- Streaming candidates use distance, priority and id ordering; in-flight loads
  are never duplicated.
- A* uses a binary heap, typed-array walkability/costs and a hard iteration
  budget to bound worst-case frames.
- Path smoothing uses grid traversal line-of-sight, so corners are never cut.
- Both managers return defensive copies; callers cannot mutate internal state.
- Broadphase physics (see `SPATIAL-PHYSICS-ASSET-PIPELINE.md`) uses the same
  additivity principle: optimized and legacy stepping produce identical results
  in sparse scenes, and dense scenes remain finite and non-tunneling.

## 6. Verification

```powershell
cd engine
.\node_modules\.bin\tsc.cmd -p tsconfig.json --noEmit
.\node_modules\.bin\vitest.cmd run
```

Dedicated coverage:

- `tests/navigation.test.ts` — ASCII maps, A* detours and costs, blocked
  starts/goals, corner cutting, line of sight, smoothing, JSON/checksum
  round-trips, determinism, agent arrival, stuck recovery and repathing.
- `tests/open-world.test.ts` — tier assignment, hysteresis, fair budgets,
  pinning, dormant intervals, spatial queries, lifecycle; streamer loading,
  priorities, retries, pinning, caps, mid-load removal, state transitions,
  synchronous failures and unload errors.
- `tests/physics-broadphase.test.ts` — pair equivalence, static handling,
  dense/sparse performance, original-index order, margin and integration
  equivalence/stability.
- `tests/ai-negative-learning.test.ts` — negative reinforcement, preferences,
  aversions, snapshots and player agents.
