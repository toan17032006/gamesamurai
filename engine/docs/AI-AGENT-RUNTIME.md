# Isolated Agent AI Runtime

`@aetheria/engine/ai` provides a per-object AI runtime for NPCs, bots, monsters,
pets and player-like agents. Every agent owns an independent `AgentBrain`; no
memory, personality, skill, relationship or Q-learning data is stored in a
module-level singleton.

```ts
import { AgentBrain, AgentManager } from '@aetheria/engine/ai';
```

## Design guarantees

1. **Identity-scoped state.** A brain is keyed by the object id. Two objects of
   the same class with different ids always receive different seeds,
   personalities, skill rolls and memory repositories.
2. **No shared mutable globals.** Steering wander state is stored per agent, and
   each brain constructs its own `NPCMemoryLearningSystem` instead of using the
   shared default instance.
3. **Deterministic baselines.** The same id, name and archetype reproduce the
   same starting personality, needs and skills. This keeps save games and
   replays stable.
4. **Additive integration.** `Bot`, `NPC` and `Monster` keep their legacy state
   machines and fields. The brain observes and learns alongside them.

## Creating a brain

```ts
import { AgentBrain } from '@aetheria/engine/ai';

const brain = new AgentBrain(
  {
    id: 'npc_guard_07',
    name: 'Sera',
    archetype: 'npc',
    faction: 'city-watch',
    role: 'Guard',
    level: 4,
  },
  {
    learning: { epsilon: 0.1 },
    personality: { courage: 0.8 },
    startingNeeds: { stamina: 90 },
  },
);
```

Archetypes are `npc`, `bot`, `monster`, `player` and `pet`. If `seed` is omitted
the brain derives one from `id:name:archetype`.

### Brain configuration

`AgentBrainConfig` accepts:

| Field | Meaning |
| --- | --- |
| `randomSeed` | Overrides the stochastic decision seed. |
| `learning` | Partial `AgentLearningConfig` (`alpha`, `gamma`, `epsilon`, `epsilonMin`, `epsilonDecay`, `maxQTableEntries`, `memoryCapacity`, `forgettingFactor`, `autoConsolidateEvery`). |
| `personality` | Partial trait overrides in `[0, 1]`. |
| `startingNeeds` | Partial need overrides in `[0, 100]`. |
| `actionDefinitions` | Replaces the default 20-action library. |
| `memoryConfig` | `NPCSystemConfig` for the private NPC repository. |

## Personality, needs and emotions

- 15 personality traits: openness, conscientiousness, extraversion,
  agreeableness, neuroticism, aggression, curiosity, loyalty, patience, greed,
  honor, courage, empathy, discipline and creativity.
- Archetype trait shifts make monsters more aggressive, pets more loyal and NPCs
  more agreeable without hard-coding behavior.
- 8 needs: health, stamina, hunger, thirst, safety, social, esteem and purpose.
  Needs decay during `update`, and actions modify them.
- 14 emotion labels with valence, arousal, stress and intensity records. Emotions
  are recomputed from needs, personality and perceived threat.

```ts
brain.applyNeedDelta('hunger', -20);
brain.satisfyNeed('hunger', 30);
const urgent = brain.getPriorityNeeds(3);
const mood = brain.refreshEmotions(1);
```

## Skills

The shared catalog contains 20 skills across combat, magic, stealth, survival,
social, crafting, perception, medicine, leadership, athletics and lore. Each
agent has its own level, XP, mastery, use/success/failure counters and last-use
timestamp.

```ts
brain.practiceSkill('melee', 25);
const check = brain.useSkill('melee', 0.6);

if (check.success) {
  brain.practiceSkill('melee', 10);
}
```

Skill checks combine level, conscientiousness and difficulty, then award XP.
Level-ups are recorded as episodic memories.

## Perception and decisions

`observe` normalizes a perception frame, updates health/stamina, records nearby
entities, adjusts safety and threat relationships, and produces semantic beliefs
for seen entities and objects.

```ts
brain.observe({
  tick: 42,
  health: 82,
  stamina: 71,
  position: { x: 4, y: 0, z: 2 },
  threatLevel: 0.55,
  stimuli: [
    { id: 'player_01', kind: 'enemy', distance: 6, threat: 0.6 },
    { id: 'crate_04', kind: 'item', distance: 2, value: 0.4 },
  ],
});
```

`decide()` scores every action with:

- base utility and need deficits,
- aggression, curiosity, social and caution biases,
- low-health and archetype-specific modifiers,
- learned Q-values for the current discretized state.

Eligibility filters actions by stimuli (`enemy`, `ally`, `item`, `any`, `none`).
Exploration uses an epsilon-greedy choice from the seeded PRNG. `think()` is an
alias for `decide()`.

The state key buckets enemy distance, health, ally presence, loot presence and
threat level, for example:

```text
monster|near|wounded|solo|loot|high
```

## Q-learning

The built-in learner is tabular Q-learning:

```text
newQ = oldQ + alpha * (reward + gamma * maxNextQ - oldQ)
```

```ts
brain.learn({
  stateKey: 'duel',
  actionId: 'attack',
  reward: 4,
  nextStateKey: 'duel',
});

const report = brain.trainBatch([
  { stateKey: 'duel', actionId: 'attack', reward: 2, nextStateKey: 'duel' },
  { stateKey: 'duel', actionId: 'defend', reward: -1, nextStateKey: 'duel' },
]);

const top = brain.decide(observation, { explore: false });
```

Epsilon decays during `update` toward `epsilonMin`. The Q-table is pruned to
`maxQTableEntries` by removing the lowest-absolute-value entries. `resetLearning`
clears only the Q-table and restores the starting epsilon.

`performAction(actionId, difficulty, nextObservation?)` runs the associated
skill check (when defined), applies need effects, performs a Q-update, records an
episodic memory and optionally ingests the next observation.

## Negative reinforcement, preferences and aversions

Positive rewards teach what to do; negative samples teach what **not** to do.
`learnNegative` applies a penalty with a faster asymmetric learning rate and is
monotonic: a penalty may lower an action's Q-value but never raise it.

```ts
const result = brain.learnNegative({
  stateKey: 'village',
  actionId: 'attack_ally',
  penalty: 8,                 // positive magnitude, clamped to [0, 1000]
  weight: 1,                  // optional multiplier in [0.01, 10]
  stimulusId: 'friendly_npc', // optional source of an aversion
  reason: 'friendly fire',
});

result.newQ;          // <= result.oldQ
result.aversionStrength;
brain.getNegativeHistory(20);
```

Semantics:

- `target = -penalty + gamma * minNextQ`, so a supplied `nextStateKey` also
  bootstraps punishment of future states.
- The negative learning rate is `alpha * 1.5` (clamped to `[0.05, 0.95]`).
- Q-values are clamped to `[-1000, 1000]`; the update stores
  `min(oldQ, newQ)`.
- Each sample increments training/reward counters, subtracts from
  `stats.totalReward`, and raises stress, fear and negative valence.
- History is bounded by the memory capacity and is persisted in snapshots.

Batch training returns aggregate diagnostics:

```ts
const report = brain.trainNegativeBatch([
  { stateKey: 'fire', actionId: 'walk_in', penalty: 10, stimulusId: 'fire' },
  { stateKey: 'fire', actionId: 'idle', penalty: 1 },
]);
// { samples, totalPenalty, meanPenalty, updatedActions, aversionCount, qTableSize }
```

Preference learning pushes a preferred action above a dispreferred one:

```ts
const preference = brain.learnPreference({
  stateKey: 'duel',
  preferredActionId: 'retreat',
  dispreferredActionId: 'charge',
  strength: 2, // desired positive Q margin
});
```

Identical action ids throw `RangeError`. `trainPreferenceBatch(pairs)` applies
pairs in order.

Aversions are persistent, saturating stimulus memories:

```ts
brain.recordAversion('spikes', 0.6, 'trap injury'); // strength -> 1 - (1-s)(1-x)
brain.getAvoidanceScore('spikes');                  // 0..1, 0 for unknown
brain.listAversions();                              // strongest first
brain.decayAversions(0.05);                         // forgetting; removes <= 1e-4
brain.clearAversion('spikes');
brain.getNegativeStats(); // { samples, totalPenalty, preferencePairs, aversionCount }
```

Supplying `stimulusId` to `learnNegative` creates or reinforces an aversion with
initial strength `penalty / 25`.

`AgentManager` mirrors the API:

```ts
manager.trainNegative('guard', samples);
manager.learnNegative('guard', sample);
manager.trainNegativeAll({ guard: samples, scout: otherSamples });
manager.trainPreference('guard', pair);
manager.trainPreferences({ guard: [pair], scout: [pair] });
```

`getStats()` aggregates `negativeSamples`, `totalPenalty`, `totalAversions` and
`preferencePairs` across registered agents.

## Episodic and semantic memory

Every brain owns a private `NPCMemoryLearningSystem`:

```ts
brain.remember({
  kind: 'social',
  summary: 'Traded medicine with the healer',
  subjectId: 'npc_healer_02',
  importance: 0.8,
  tags: ['trade', 'medicine'],
});

const memories = brain.recall({
  text: 'healer',
  tags: ['trade'],
  sortBy: 'important',
  limit: 5,
});

brain.learnFact('healer:location', 'north district', 0.9, 'dialogue');
const belief = brain.recallFact('healer:location');
```

- Episodes support text/tag/kind/subject filters and importance/valence/recent
  sorting.
- Semantic beliefs merge repeated evidence using noisy-OR confidence.
- `consolidateMemories` turns important episodes into durable impressions,
  reinforces subject beliefs and prunes weak episodes.
- `pruneMemories` and `clearEpisodes` enforce retention manually.
- All of the above also mirror into the agent's private NPC repository, which can
  be inspected with `brain.memory.repository` and serialized with the brain.

## Relationships

Relationships track trust, affinity, fear, respect, familiarity, interaction count
and tags for each target id.

```ts
brain.interactWith({
  targetId: 'player_01',
  trust: 0.15,
  affinity: 0.25,
  respect: 0.1,
  summary: 'Player returned a lost ring',
  tags: ['quest'],
});

if (brain.isFriendly('player_01')) {
  // open dialogue
}
```

`getRelationshipScore` combines trust, affinity, respect and fear, and drives
`isFriendly` / `isHostile`.

## Goals and planning

```ts
const goal = brain.addGoal('Defend the eastern gate', 0.9, {
  deadline: Date.now() + 60_000,
  targetId: 'gate_east',
});

brain.advanceGoal(goal.id, 0.25);
const plan = brain.plan(undefined, 3);
```

A plan is a utility-ranked, de-duplicated list of up to `maxSteps` eligible
actions, optionally annotated with the active or requested goal.

## Multi-agent management

`AgentManager` (aliases `AgentRegistry` and `AgentSystem`) rejects duplicate ids
so one brain can never represent two objects.

```ts
import { AgentManager } from '@aetheria/engine/ai';

const manager = new AgentManager();

manager.createAgent({ id: 'guard_a', name: 'A', archetype: 'bot' });
manager.createAgent({ id: 'guard_b', name: 'B', archetype: 'bot' });

const updates = manager.updateAll(
  {
    guard_a: { health: 90, stimuli: [] },
    guard_b: { health: 45, threatLevel: 0.7, stimuli: [] },
  },
  0.016,
);

const decisions = manager.thinkAll();
const stats = manager.getStats();
const summaries = manager.getSummaries();
```

Batch methods: `updateAll`, `thinkAll`, `trainAll`, `serializeAll`,
`restoreAll`. Single-agent methods include `updateAgent`, `thinkAgent`,
`trainAgent`, `restoreAgent`, `getAgent`, `requireAgent`, `removeAgent` and
`clear`.

## Game object integration

`Bot`, `NPC` and `Monster` create their brain lazily on first access.

```ts
import { Monster, NPC } from '@aetheria/engine';

const npc = new NPC('npc_01', 'Mira', 'Merchant');
const monster = new Monster('orc_01', 'Grokk', 220);

npc.update(0.016);        // legacy update + brain tick
monster.update(0.016);

npc.think();              // AgentDecision
npc.learnFromReward(2);   // Q-learning update
npc.performAgentAction(); // skill check + reward + memory
npc.getBrainSummary();
npc.peekBrain();          // null until the brain is created
```

`Monster` extends `Bot`, defaults to the `monster` archetype and a larger health
pool, and keeps the legacy `aiState` machine available.

Every entity wrapper also exposes the negative-learning surface:
`learnFromNegative`, `trainNegativeBatch`, `learnPreference`, `recordAversion`
and `getAversions`.

## Player agents

`Player` can be driven by a human while an optional brain observes, learns and
supports auto-play, companions, replays or spectator simulation. The brain is
created lazily on first use, so manually controlled players pay no AI cost.

```ts
import { Player } from '@aetheria/engine';

const player = new Player('player_alpha', 'Hero');
player.peekBrain();                    // null

const decision = player.think();       // perception from live health/stamina/combat
player.learnFromReward(2);             // positive reinforcement
player.learnFromNegative({
  actionId: 'charge',
  penalty: 4,
  stimulusId: 'spikes',
  reason: 'spikes hurt',
});
player.learnPreference({
  preferredActionId: 'retreat',
  dispreferredActionId: 'charge',
});

player.update(0.016);                  // ticks attributes + brain when created
player.peekLastBrainUpdate();
```

`buildAgentObservation()` derives health, stamina, threat level, inventory and
combat environment from the player's live pools and state. Brain persistence is
available through `serializeAgentBrain()` and `restoreAgentBrain(snapshot)`; the
latter returns `false` for checksum or schema failures instead of throwing.
`getBrainSummary()` reports archetype `player`.

## Persistence

`serialize()` returns a checksummed `AgentSnapshot` containing identity,
personality, needs, emotions, skills, relationships, Q-table, episodes, beliefs,
goals, action definitions, learning config, stats, private NPC records, tick,
epsilon, PRNG state and counters. Optional v1 fields add `aversions`,
`negativeHistory` and `negativeStats`; snapshots created before negative learning
still restore correctly because these fields default to empty/zero.

```ts
const snapshot = brain.serialize();
const json = JSON.stringify(snapshot);

const restored = AgentBrain.deserialize(json);
const copy = brain.clone('npc_01_copy'); // fresh baseline, no learned data
```

- Checksums use canonical sorted-key JSON and FNV-1a.
- `fromSnapshot` rejects unknown schema versions and mismatched checksums.
- `clone(id)` intentionally creates a new independent brain without transferring
  memories, skills, relationships or Q-values.
- `reset(true)` clears learned state and regenerates baseline progression.

## NPC learning/memory catalog

`@aetheria/engine/ai` re-exports the complete 2,400-function NPC catalog from
`@aetheria/engine/npc`, including `NPCMemoryLearningSystem` and its 24 subsystem
modules. This gives AI code one import surface:

```ts
import {
  NPCMemoryLearningSystem,
  exp_capture_experience,
  rl_capture_reward_signal,
  skl_capture_skill_proficiency,
} from '@aetheria/engine/ai';
```

The catalog functions are also exposed as methods on each private repository:

```ts
brain.memory.exp_capture_experience(brain.id, { note: 'observed patrol' });
brain.memory.rl_capture_reward_signal(brain.id, { reward: 1 });
```

## NPC system configuration

```ts
const system = new NPCMemoryLearningSystem({
  maxMemoryPerAgent: 250,
  defaultConfidence: 0.9,
  debugLogging: false,
});

system.updateConfig({ maxMemoryPerAgent: 400 });
system.checkMemoryBudget(agentId);
system.pruneAgentMemory(agentId);
system.applyMemoryPolicy();
```

The configuration is stored on both the system and its repository, and
`defaultConfidence` is applied to newly inserted records.

## Verification

```powershell
cd engine
.\node_modules\.bin\tsc.cmd -p tsconfig.json --noEmit
.\node_modules\.bin\vitest.cmd run
```

The AI runtime is covered by `tests/ai-agent-runtime.test.ts`, including barrel
exports, deterministic personality separation, memory isolation, Q-learning,
skill growth, relationships, snapshot round-trips with checksum rejection,
manager lifecycle, `Bot`/`NPC` integration and per-agent steering state.
`tests/ai-negative-learning.test.ts` covers monotonic punishment, preference
margins, saturating/decaying aversions, negative snapshot persistence, legacy
snapshot fallback, manager-wide training and lazy player brains.
