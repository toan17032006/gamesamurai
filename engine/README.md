# @aetheria/engine

Strict TypeScript 3D game-engine core: multi-format asset parsing, procedural
asset design/optimization, skeleton animation combiners, spatial math,
BVH/Octree acceleration, physics, gravity, collision, raycasts and sweeps.

## Requirements

- Node.js 20+
- TypeScript 5.7+
- `three` 0.170+

## Install and verify

```powershell
cd engine
npm install
.\node_modules\.bin\tsc.cmd -p tsconfig.json --noEmit
.\node_modules\.bin\vitest.cmd run
```

## Main entry points

```ts
import { GameEngine, SpatialMath } from '@aetheria/engine';
import { MultiFormatParser } from '@aetheria/engine/asset-parser';
import { PhysicsWorld } from '@aetheria/engine/physics';
import { AssetForge } from '@aetheria/engine/procedural';
import { createEngineCombiner } from '@aetheria/engine/combiner';
import { AgentManager, AgentBrain } from '@aetheria/engine/ai';
import { SupervisedTrainer, PPOTrainer } from '@aetheria/engine/learning';
```

Dedicated subpaths are available for `asset-parser`, `combiner`, `physics`,
`spatial`, `procedural`, `transformer`, `renderer`, `environment`, `behavior`,
`ui-3d`, `npc`, `ai`, `learning` and the other engine modules listed in
`package.json`.

## Learning runtime

`@aetheria/engine/learning` cung cấp huấn luyện có giám sát, reinforcement
learning, imitation, world model, căn chỉnh/RLHF/DPO, MCTS/AlphaZero, tiến hoá,
sinh dữ liệu, federated learning, EWC và runtime quản lý phiên/checkpoint. Toàn
bộ API là TypeScript thuần, không phụ thuộc DOM hay Three.js.

```ts
import { NeuralNetwork } from '@aetheria/engine/deeplearning';
import { SupervisedTrainer } from '@aetheria/engine/learning';

const network = new NeuralNetwork({
  inputSize: 4,
  hiddenSizes: [16, 16],
  outputSize: 2,
  outputActivation: 'linear',
});
const trainer = new SupervisedTrainer(network, { loss: 'crossEntropy' });
trainer.fit(samples, { epochs: 20, batchSize: 16 });
```

Xem hồ sơ kiến trúc chi tiết tại [`docs/LEARNING-RUNTIME.md`](docs/LEARNING-RUNTIME.md).

## Quick asset pipeline

```ts
import { AssetForge } from '@aetheria/engine/procedural';

const recipe = {
  name: 'crate',
  category: 'prop',
  parts: [
    { name: 'body', shape: 'box', size: [1, 1, 1], position: [0, 0.5, 0] },
  ],
  physics: { collision: 'box', mass: 12 },
};

const forged = AssetForge.create(recipe);
const bundle = AssetForge.pipeline(recipe, ['glb', 'obj']);
```

## Quick spatial physics query

```ts
import { PhysicsWorld } from '@aetheria/engine/physics';
import { AABB, sweepSphereAABB } from '@aetheria/engine/spatial';

const world = new PhysicsWorld();
const bodies = world.queryAABB(new AABB(
  { x: -10, y: -10, z: -10 },
  { x: 10, y: 10, z: 10 },
));

const hit = sweepSphereAABB(center, 0.5, displacement, targetBounds);
```

## Isolated per-agent AI

Every `Bot`, `NPC` and `Monster` owns a private `AgentBrain`. Identity, personality,
skills, needs, emotions, relationships, memory and Q-learning are never shared, even
when two objects have the same type and name.

```ts
import { AgentManager, Monster, NPC } from '@aetheria/engine';

const agents = new AgentManager();

const npcBrain = agents.createAgent({
  id: 'npc_merchant_01',
  name: 'Mira',
  archetype: 'npc',
});

npcBrain.observe({
  health: 100,
  stimuli: [{ id: 'player_01', kind: 'ally', distance: 3 }],
});
const decision = npcBrain.decide();
npcBrain.performAction(decision.actionId);

npcBrain.remember({ summary: 'Player accepted the delivery quest', importance: 0.7 });
npcBrain.learnFact('quest:delivery', { accepted: true }, 0.95);
npcBrain.interactWith({ targetId: 'player_01', trust: 0.2, affinity: 0.3 });

const npc = new NPC('npc_smith_02', 'Thorin', 'Blacksmith');
const monster = new Monster('orc_grunt_01', 'Grokk');

console.log(npc.getBrain().identity.seed !== monster.getBrain().identity.seed); // true

const save = agents.serializeAll();
const restored = new AgentManager();
restored.restoreAll(save);
```

See [`docs/AI-AGENT-RUNTIME.md`](./docs/AI-AGENT-RUNTIME.md) for the full brain
lifecycle, learning model, memory APIs, manager methods, persistence format and
the 2,400 exported NPC learning/memory functions.

## Documentation

See [`docs/SPATIAL-PHYSICS-ASSET-PIPELINE.md`](./docs/SPATIAL-PHYSICS-ASSET-PIPELINE.md)
for the complete format matrix, spatial math API, physics queries, Asset Forge
recipes, combiner metadata, and verification commands.

## Scripts

- `npm run typecheck` — strict TypeScript check.
- `npm test` — full Vitest suite.
