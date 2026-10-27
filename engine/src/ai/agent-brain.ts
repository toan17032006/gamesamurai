/**
 * @file agent-brain.ts
 * @module @aetheria/engine/ai/agent-brain
 * @description A complete, isolated per-agent AI runtime.
 *
 * The brain owns its own:
 * - identity and deterministic personality
 * - needs and emotions
 * - skill sheet and relationship model
 * - episodic memory, semantic beliefs and goals
 * - Q-table, epsilon-greedy policy and training history
 * - `NPCMemoryLearningSystem` repository (never a global singleton)
 *
 * Two `AgentBrain` instances never share mutable state, even when their owners
 * have the same archetype or display name.
 */

import { fnv1aChecksum } from '../npc/primitives.js';
import type { NPCRecord } from '../npc/types.js';
import { NPCMemoryLearningSystem } from '../npc/npc-system.js';
import type { Vec3 } from '../types/transform.types.js';
import {
  AGENT_EMOTIONS,
  AGENT_NEED_KEYS,
  AGENT_SNAPSHOT_VERSION,
  SeededRandom,
  canonicalJson,
  clampAgentValue as clamp,
  clamp01,
  clampSigned,
  createAgentStats,
  createDefaultActionDefinitions,
  createEmptyEmotionalState,
  createEmptyRelationship,
  createInitialNeeds,
  createInitialSkills,
  createPersonalityTraits,
  finiteOr,
  hashString,
  skillXpRequirement,
  type AgentActionDefinition,
  type AgentActionResult,
  type AgentActionScore,
  type AgentArchetype,
  type AgentAversion,
  type AgentBelief,
  type AgentBrainConfig,
  type AgentConsolidationResult,
  type AgentDecision,
  type AgentEmotion,
  type AgentEmotionalState,
  type AgentEpisode,
  type AgentEpisodeInput,
  type AgentEpisodeKind,
  type AgentGoal,
  type AgentGoalStatus,
  type AgentIdentity,
  type AgentIdentityInput,
  type AgentInteraction,
  type AgentLearningConfig,
  type AgentLearningResult,
  type AgentMemoryQuery,
  type AgentNegativeLearningResult,
  type AgentNegativeRecord,
  type AgentNegativeSample,
  type AgentNegativeStats,
  type AgentNegativeTrainingReport,
  type AgentNeeds,
  type AgentNeedKey,
  type AgentObservation,
  type AgentPlan,
  type AgentPlanStep,
  type AgentPreferenceLearningResult,
  type AgentPreferencePair,
  type AgentRelationship,
  type AgentResetResult,
  type AgentSkill,
  type AgentSkillCheck,
  type AgentSnapshot,
  type AgentStats,
  type AgentStimulus,
  type AgentTrainingReport,
  type AgentTrainingSample,
  type AgentUpdateResult,
  type PersonalityTraits,
} from './agent-types.js';

/** Default Q-learning and memory settings used by new agents. */
export const DEFAULT_AGENT_LEARNING_CONFIG: AgentLearningConfig = {
  alpha: 0.25,
  gamma: 0.9,
  epsilon: 0.12,
  epsilonMin: 0.02,
  epsilonDecay: 0.9995,
  maxQTableEntries: 4096,
  memoryCapacity: 256,
  forgettingFactor: 0.0002,
  autoConsolidateEvery: 50,
};

/** Snapshot payload without its checksum. */
type AgentSnapshotPayload = Omit<AgentSnapshot, 'checksum'>;

/** Simple prune result. */
export interface AgentPruneMemoriesResult {
  pruned: number;
  remaining: number;
}

/** Compact runtime summary suitable for debug overlays. */
export interface AgentBrainSummary {
  id: string;
  name: string;
  archetype: AgentArchetype;
  tick: number;
  epsilon: number;
  dominantEmotion: AgentEmotion;
  dominantNeed: AgentNeedKey;
  memories: number;
  beliefs: number;
  qTableSize: number;
  skills: number;
  relationships: number;
  goals: number;
  aversions: number;
  negativeSamples: number;
}

function copyVec3(value: Vec3 | undefined): Vec3 | undefined {
  return value ? { x: value.x, y: value.y, z: value.z } : undefined;
}

function copyObservation(observation: AgentObservation): AgentObservation {
  return {
    tick: observation.tick,
    position: copyVec3(observation.position),
    velocity: copyVec3(observation.velocity),
    health: observation.health,
    stamina: observation.stamina,
    threatLevel: observation.threatLevel,
    stimuli: (observation.stimuli ?? []).map((stimulus) => ({
      ...stimulus,
      position: copyVec3(stimulus.position),
      tags: stimulus.tags ? [...stimulus.tags] : undefined,
      data: stimulus.data ? { ...stimulus.data } : undefined,
    })),
    inventory: observation.inventory ? [...observation.inventory] : undefined,
    environment: observation.environment ? { ...observation.environment } : undefined,
  };
}

function copySkill(skill: AgentSkill): AgentSkill {
  return { ...skill };
}

function copyRelationship(relationship: AgentRelationship): AgentRelationship {
  return { ...relationship, tags: [...relationship.tags] };
}

function copyBelief<T>(belief: AgentBelief<T>): AgentBelief<T> {
  return { ...belief, tags: [...belief.tags] };
}

function copyEpisode(episode: AgentEpisode): AgentEpisode {
  return {
    ...episode,
    position: copyVec3(episode.position),
    tags: [...episode.tags],
    data: { ...episode.data },
  };
}

function copyGoal(goal: AgentGoal): AgentGoal {
  return { ...goal, tags: [...goal.tags] };
}

function copyActionDefinition(definition: AgentActionDefinition): AgentActionDefinition {
  return {
    ...definition,
    needWeights: definition.needWeights ? { ...definition.needWeights } : undefined,
  };
}

function copyEmotionState(state: AgentEmotionalState): AgentEmotionalState {
  const intensities = {} as Record<AgentEmotion, number>;
  for (const emotion of AGENT_EMOTIONS) intensities[emotion] = state.intensities[emotion] ?? 0;
  return { ...state, intensities };
}

function copyNeeds(needs: AgentNeeds): AgentNeeds {
  return { ...needs };
}

function copyStats(stats: AgentStats): AgentStats {
  return { ...stats };
}

function copyDecision(decision: AgentDecision): AgentDecision {
  return { ...decision, alternatives: decision.alternatives.map((item) => ({ ...item })) };
}

function copyAversion(aversion: AgentAversion): AgentAversion {
  return { ...aversion };
}

function copyNegativeRecord(record: AgentNegativeRecord): AgentNegativeRecord {
  return { ...record };
}

/**
 * Isolated AI runtime for a single bot, NPC, monster, pet or player-like agent.
 */
export class AgentBrain {
  public readonly identity: AgentIdentity;
  public readonly personality: PersonalityTraits;
  public readonly needs: AgentNeeds;
  public readonly emotions: AgentEmotionalState;
  public readonly memory: NPCMemoryLearningSystem;
  public readonly stats: AgentStats;

  private readonly learning: AgentLearningConfig;
  private readonly skills = new Map<string, AgentSkill>();
  private readonly relationships = new Map<string, AgentRelationship>();
  private readonly qTable = new Map<string, Map<string, number>>();
  private readonly aversions = new Map<string, AgentAversion>();
  private readonly negativeHistory: AgentNegativeRecord[] = [];
  private negativeStats: AgentNegativeStats = {
    samples: 0,
    totalPenalty: 0,
    preferencePairs: 0,
    aversionCount: 0,
  };
  private readonly episodes: AgentEpisode[] = [];
  private readonly beliefs = new Map<string, AgentBelief>();
  private readonly goals = new Map<string, AgentGoal>();
  private readonly actions = new Map<string, AgentActionDefinition>();
  private readonly observedThreats = new Map<string, number>();
  private readonly rng: SeededRandom;

  private currentObservation: AgentObservation;
  private lastDecision: AgentDecision | null = null;
  private lastActionResult: AgentActionResult | null = null;
  private lastStateKey = '';
  private tick = 0;
  private episodeCounter = 0;
  private goalCounter = 0;
  private epsilon: number;

  constructor(identityInput: AgentIdentityInput, config: AgentBrainConfig = {}) {
    if (!identityInput.id || !identityInput.name) {
      throw new Error('AgentBrain requires a non-empty id and name');
    }

    const archetype = identityInput.archetype ?? 'npc';
    const seed = identityInput.seed ?? hashString(`${identityInput.id}:${identityInput.name}:${archetype}`);

    this.identity = {
      id: identityInput.id,
      name: identityInput.name,
      archetype,
      faction: identityInput.faction,
      role: identityInput.role,
      level: Math.max(1, Math.floor(finiteOr(identityInput.level, 1))),
      createdAt: identityInput.createdAt ?? Date.now(),
      seed,
    };

    this.learning = {
      ...DEFAULT_AGENT_LEARNING_CONFIG,
      ...config.learning,
    };
    this.epsilon = clamp01(this.learning.epsilon);

    this.personality = createPersonalityTraits(seed, archetype, config.personality);
    this.needs = createInitialNeeds(seed, archetype);
    if (config.startingNeeds) {
      for (const key of AGENT_NEED_KEYS) {
        const value = config.startingNeeds[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
          this.needs[key] = clamp(value, 0, 100);
        }
      }
    }

    this.emotions = createEmptyEmotionalState();
    for (const skill of createInitialSkills(seed, archetype)) {
      this.skills.set(skill.id, skill);
    }

    const definitions =
      config.actionDefinitions && config.actionDefinitions.length > 0
        ? config.actionDefinitions
        : createDefaultActionDefinitions();
    for (const definition of definitions) {
      this.actions.set(definition.id, copyActionDefinition(definition));
    }

    this.memory = new NPCMemoryLearningSystem({
      maxMemoryPerAgent: Math.max(32, this.learning.memoryCapacity * 4),
      defaultConfidence: 0.9,
      persistenceEnabled: false,
      debugLogging: false,
      ...config.memoryConfig,
    });

    this.stats = createAgentStats();
    this.rng = new SeededRandom(config.randomSeed ?? (seed ^ 0x9e3779b9));
    this.currentObservation = { tick: 0 };
    this.refreshEmotions(1);
  }

  // ==========================================================================
  // Read-only accessors
  // ==========================================================================

  public get id(): string {
    return this.identity.id;
  }

  public get name(): string {
    return this.identity.name;
  }

  public get archetype(): AgentArchetype {
    return this.identity.archetype;
  }

  public get tickCount(): number {
    return this.tick;
  }

  public getEpsilon(): number {
    return this.epsilon;
  }

  public setEpsilon(value: number): number {
    this.epsilon = clamp01(value);
    return this.epsilon;
  }

  public getLearningConfig(): AgentLearningConfig {
    return { ...this.learning };
  }

  public getStats(): AgentStats {
    return copyStats(this.stats);
  }

  public getCurrentObservation(): AgentObservation {
    return copyObservation(this.currentObservation);
  }

  public getLastDecision(): AgentDecision | null {
    return this.lastDecision ? copyDecision(this.lastDecision) : null;
  }

  public getLastActionResult(): AgentActionResult | null {
    return this.lastActionResult ? { ...this.lastActionResult } : null;
  }

  public getSummary(): AgentBrainSummary {
    return {
      id: this.identity.id,
      name: this.identity.name,
      archetype: this.identity.archetype,
      tick: this.tick,
      epsilon: this.epsilon,
      dominantEmotion: this.emotions.dominantEmotion,
      dominantNeed: this.getDominantNeed(),
      memories: this.episodes.length,
      beliefs: this.beliefs.size,
      qTableSize: this.getQTableSize(),
      skills: this.skills.size,
      relationships: this.relationships.size,
      goals: this.goals.size,
      aversions: this.aversions.size,
      negativeSamples: this.negativeStats.samples,
    };
  }

  // ==========================================================================
  // Perception
  // ==========================================================================

  /** Ingest a perception frame and update safety, relationships and beliefs. */
  public observe(observation: AgentObservation): AgentObservation {
    const normalized = this.normalizeObservation(observation);
    this.currentObservation = copyObservation(normalized);

    if (normalized.tick !== undefined) {
      this.tick = Math.max(this.tick, Math.floor(finiteOr(normalized.tick, this.tick)));
    }
    if (normalized.health !== undefined) {
      this.needs.health = clamp(normalized.health, 0, 100);
    }
    if (normalized.stamina !== undefined) {
      this.needs.stamina = clamp(normalized.stamina, 0, 100);
    }

    const stimuli = normalized.stimuli ?? [];
    const nearestEnemy = this.nearestStimulus(stimuli, ['enemy', 'danger']);
    const threat = this.maxThreat(stimuli, normalized.threatLevel);
    if (nearestEnemy) {
      const enemyThreat = clamp01(nearestEnemy.threat ?? (1 - nearestEnemy.distance / 50));
      this.needs.safety = clamp(this.needs.safety * 0.78 + (100 - enemyThreat * 80) * 0.22, 0, 100);

      const previous = this.observedThreats.get(nearestEnemy.id) ?? -1;
      if (previous < 0 || Math.abs(previous - enemyThreat) > 0.22) {
        this.remember({
          kind: enemyThreat > 0.5 ? 'combat' : 'observation',
          summary: `Perceived ${nearestEnemy.kind} ${nearestEnemy.id} at ${nearestEnemy.distance.toFixed(1)}m`,
          subjectId: nearestEnemy.id,
          position: nearestEnemy.position,
          valence: -enemyThreat * 0.6,
          importance: clamp01(0.25 + enemyThreat * 0.6),
          tags: ['perception', nearestEnemy.kind],
          data: {
            distance: nearestEnemy.distance,
            threat: enemyThreat,
            tags: nearestEnemy.tags ?? [],
          },
        });
        this.observedThreats.set(nearestEnemy.id, enemyThreat);
      }

      this.learnFact(
        `entity:${nearestEnemy.id}`,
        {
          kind: nearestEnemy.kind,
          distance: nearestEnemy.distance,
          threat: enemyThreat,
          lastSeenTick: this.tick,
        },
        clamp01(1 - nearestEnemy.distance / 100),
        'perception',
        ['entity', nearestEnemy.kind],
      );

      const relationship = this.ensureRelationship(nearestEnemy.id);
      relationship.fear = clamp01(relationship.fear * 0.9 + enemyThreat * 0.2);
      relationship.familiarity = clamp01(relationship.familiarity + 0.01);
    } else {
      this.needs.safety = clamp(this.needs.safety + 0.6, 0, 100);
    }

    for (const stimulus of stimuli) {
      if (stimulus.kind === 'ally') {
        const relationship = this.ensureRelationship(stimulus.id);
        relationship.familiarity = clamp01(relationship.familiarity + 0.01);
        relationship.lastInteractionAt = relationship.lastInteractionAt || Date.now();
      } else if (stimulus.kind === 'item' || stimulus.kind === 'opportunity') {
        this.learnFact(
          `object:${stimulus.id}`,
          {
            kind: stimulus.kind,
            distance: stimulus.distance,
            value: clamp01(finiteOr(stimulus.value, 0.3)),
            lastSeenTick: this.tick,
          },
          clamp01(1 - stimulus.distance / 100),
          'perception',
          ['object', stimulus.kind],
        );
      }
    }

    this.emotions.stress = clamp01(this.emotions.stress * 0.94 + threat * 0.16);
    return copyObservation(normalized);
  }

  // ==========================================================================
  // Memory
  // ==========================================================================

  /** Store an episodic memory and mirror it into the agent's private NPC repository. */
  public remember(input: AgentEpisodeInput): AgentEpisode {
    const episode: AgentEpisode = {
      id: `${this.identity.id}:ep:${this.episodeCounter++}`,
      agentId: this.identity.id,
      tick: this.tick,
      timestamp: Date.now(),
      kind: input.kind ?? 'event',
      summary: input.summary,
      subjectId: input.subjectId,
      position: copyVec3(input.position),
      valence: clampSigned(finiteOr(input.valence, 0)),
      importance: clamp01(finiteOr(input.importance, 0.3)),
      decay: 1,
      tags: input.tags ? [...input.tags] : [],
      data: input.data ? { ...input.data } : {},
      consolidated: false,
    };

    const record = this.memory.exp_capture_experience<Record<string, unknown>>(
      this.identity.id,
      {
        summary: episode.summary,
        kind: episode.kind,
        subjectId: episode.subjectId,
        valence: episode.valence,
        importance: episode.importance,
        tags: episode.tags,
        data: episode.data,
      },
      { source: 'agent-brain', agentName: this.identity.name },
    );
    episode.recordId = record.id;

    this.episodes.push(episode);
    this.stats.episodesRemembered++;

    while (this.episodes.length > this.learning.memoryCapacity) {
      this.episodes.shift();
      this.stats.memoriesForgotten++;
    }

    return copyEpisode(episode);
  }

  /** Retrieve episodic memories matching a query. */
  public recall(query: AgentMemoryQuery = {}): AgentEpisode[] {
    const kinds = query.kind ? (Array.isArray(query.kind) ? query.kind : [query.kind]) : [];
    const text = query.text?.toLowerCase();
    const tags = query.tags ?? [];

    let result = this.episodes.filter((episode) => {
      if (!query.includeConsolidated && episode.consolidated) return false;
      if (kinds.length > 0 && !kinds.includes(episode.kind)) return false;
      if (query.subjectId && episode.subjectId !== query.subjectId) return false;
      if (query.minImportance !== undefined && episode.importance < query.minImportance) return false;
      if (query.since !== undefined && episode.timestamp < query.since) return false;
      if (text && !episode.summary.toLowerCase().includes(text) && !episode.tags.some((tag) => tag.toLowerCase().includes(text))) {
        return false;
      }
      if (tags.length > 0 && !tags.every((tag) => episode.tags.includes(tag))) return false;
      return true;
    });

    const sortBy = query.sortBy ?? 'recent';
    if (sortBy === 'important') {
      result = [...result].sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp);
    } else if (sortBy === 'valence') {
      result = [...result].sort((a, b) => Math.abs(b.valence) - Math.abs(a.valence) || b.timestamp - a.timestamp);
    } else {
      result = [...result].sort((a, b) => b.timestamp - a.timestamp || b.tick - a.tick);
    }

    const limit = Math.floor(clamp(finiteOr(query.limit, 20), 0, 1000));
    return result.slice(0, limit).map(copyEpisode);
  }

  public getRecentMemories(limit = 10): AgentEpisode[] {
    return this.recall({ limit, sortBy: 'recent' });
  }

  public getMemoryCount(): number {
    return this.episodes.length;
  }

  /** Remove weak/old memories. Returns how many were discarded. */
  public pruneMemories(
    options: {
      maxAgeMs?: number;
      minImportance?: number;
      maxRecords?: number;
      keepConsolidated?: boolean;
    } = {},
  ): AgentPruneMemoriesResult {
    const now = Date.now();
    const keepConsolidated = options.keepConsolidated ?? true;
    let result = this.episodes.filter((episode) => {
      if (keepConsolidated && episode.consolidated) return true;
      if (options.maxAgeMs !== undefined && now - episode.timestamp > options.maxAgeMs) return false;
      if (options.minImportance !== undefined && episode.importance < options.minImportance) return false;
      return true;
    });

    if (options.maxRecords !== undefined) {
      const limit = Math.max(0, Math.floor(options.maxRecords));
      if (result.length > limit) {
        result = [...result]
          .sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp)
          .slice(0, limit);
      }
    }

    const pruned = this.episodes.length - result.length;
    this.episodes.length = 0;
    this.episodes.push(...result);
    this.stats.memoriesForgotten += pruned;
    return { pruned, remaining: this.episodes.length };
  }

  /** Forget every episodic memory, returning the number removed. */
  public clearEpisodes(): number {
    const count = this.episodes.length;
    this.episodes.length = 0;
    this.stats.memoriesForgotten += count;
    return count;
  }

  /** Store or reinforce a semantic belief. */
  public learnFact<T>(
    key: string,
    value: T,
    confidence = 0.7,
    source = 'observation',
    tags: string[] = [],
  ): AgentBelief<T> {
    if (!key) throw new Error('learnFact requires a non-empty key');
    const clampedConfidence = clamp01(confidence);
    const existing = this.beliefs.get(key);

    let belief: AgentBelief<T>;
    if (existing) {
      const combined = clamp01(1 - (1 - existing.confidence) * (1 - clampedConfidence));
      belief = {
        key,
        value,
        confidence: combined,
        source,
        evidenceCount: existing.evidenceCount + 1,
        updatedAt: Date.now(),
        tags: Array.from(new Set([...existing.tags, ...tags])),
      };
    } else {
      belief = {
        key,
        value,
        confidence: clampedConfidence,
        source,
        evidenceCount: 1,
        updatedAt: Date.now(),
        tags: [...tags],
      };
    }

    this.beliefs.set(key, belief as AgentBelief);
    this.memory.ltm_capture_semantic_memory<Record<string, unknown>>(
      this.identity.id,
      {
        key,
        value: value as unknown,
        confidence: belief.confidence,
        source,
        evidenceCount: belief.evidenceCount,
        tags: belief.tags,
      },
      { source: 'agent-brain' },
    );

    return copyBelief(belief);
  }

  public recallFact<T = unknown>(key: string): AgentBelief<T> | undefined {
    const belief = this.beliefs.get(key);
    return belief ? copyBelief(belief as AgentBelief<T>) : undefined;
  }

  public getBeliefs(): AgentBelief[] {
    return Array.from(this.beliefs.values()).map((belief) => copyBelief(belief));
  }

  public getBeliefCount(): number {
    return this.beliefs.size;
  }

  public reinforceBelief(key: string, amount = 0.1, source = 'reinforcement'): AgentBelief | undefined {
    const belief = this.beliefs.get(key);
    if (!belief) return undefined;
    belief.confidence = clamp01(belief.confidence + amount);
    belief.evidenceCount++;
    belief.source = source;
    belief.updatedAt = Date.now();
    return copyBelief(belief);
  }

  public invalidateBelief(key: string, amount = 0.25): boolean {
    const belief = this.beliefs.get(key);
    if (!belief) return false;
    belief.confidence = clamp01(belief.confidence - amount);
    belief.updatedAt = Date.now();
    if (belief.confidence <= 0.05) {
      this.beliefs.delete(key);
      return true;
    }
    return false;
  }

  public forgetBelief(key: string): boolean {
    return this.beliefs.delete(key);
  }

  /** Convert important episodes into durable semantic impressions. */
  public consolidateMemories(): AgentConsolidationResult {
    let consolidated = 0;
    let beliefsCreated = 0;

    for (const episode of this.episodes) {
      if (episode.consolidated || episode.importance < 0.55) continue;

      if (episode.subjectId) {
        const key = `impression:${episode.subjectId}`;
        const previous = this.beliefs.get(key);
        const evidence = previous ? previous.evidenceCount + 1 : 1;
        this.learnFact(
          key,
          {
            summary: episode.summary,
            valence: episode.valence,
            lastTick: episode.tick,
            kind: episode.kind,
          },
          clamp01(0.35 + episode.importance * 0.55),
          'episodic-consolidation',
          ['consolidated', episode.kind],
        );
        const belief = this.beliefs.get(key);
        if (belief) belief.evidenceCount = evidence;
        beliefsCreated++;
      } else if (typeof episode.data.key === 'string') {
        this.learnFact(
          episode.data.key,
          episode.data.value ?? episode.summary,
          clamp01(0.4 + episode.importance * 0.5),
          'episodic-consolidation',
          ['consolidated', episode.kind],
        );
        beliefsCreated++;
      }

      episode.consolidated = true;
      consolidated++;
    }

    const pruned = this.pruneMemories({ minImportance: 0.05, keepConsolidated: true });
    return {
      consolidated,
      beliefsCreated,
      forgotten: pruned.pruned,
      remaining: pruned.remaining,
    };
  }

  // ==========================================================================
  // Relationships
  // ==========================================================================

  public getRelationship(targetId: string): AgentRelationship | undefined {
    const relationship = this.relationships.get(targetId);
    return relationship ? copyRelationship(relationship) : undefined;
  }

  public listRelationships(): AgentRelationship[] {
    return Array.from(this.relationships.values()).map(copyRelationship);
  }

  public getRelationshipScore(targetId: string): number {
    const relationship = this.relationships.get(targetId);
    if (!relationship) return 0;
    return clampSigned(
      relationship.trust * 0.4 +
        relationship.affinity * 0.3 +
        relationship.respect * 0.2 -
        relationship.fear * 0.2,
    );
  }

  public isFriendly(targetId: string): boolean {
    return this.getRelationshipScore(targetId) >= 0.25;
  }

  public isHostile(targetId: string): boolean {
    return this.getRelationshipScore(targetId) <= -0.25;
  }

  /** Apply an interaction delta and remember it. */
  public interactWith(interaction: AgentInteraction): AgentRelationship {
    if (!interaction.targetId) throw new Error('interactWith requires a targetId');
    const relationship = this.ensureRelationship(interaction.targetId);

    relationship.trust = clamp01(relationship.trust + finiteOr(interaction.trust, 0));
    relationship.affinity = clampSigned(relationship.affinity + finiteOr(interaction.affinity, 0));
    relationship.fear = clamp01(relationship.fear + finiteOr(interaction.fear, 0));
    relationship.respect = clamp01(relationship.respect + finiteOr(interaction.respect, 0));
    relationship.familiarity = clamp01(relationship.familiarity + finiteOr(interaction.familiarity, 0.08));
    relationship.interactions++;
    relationship.lastInteractionAt = Date.now();
    if (interaction.tags) {
      relationship.tags = Array.from(new Set([...relationship.tags, ...interaction.tags]));
    }

    const affinityDelta = finiteOr(interaction.affinity, 0);
    this.emotions.valence = clampSigned(this.emotions.valence + affinityDelta * 0.15);
    this.emotions.stress = clamp01(this.emotions.stress - Math.max(0, affinityDelta) * 0.1);

    this.remember({
      kind: 'social',
      summary: interaction.summary ?? `Interacted with ${interaction.targetId}`,
      subjectId: interaction.targetId,
      valence: affinityDelta,
      importance: clamp01(0.35 + Math.abs(affinityDelta) * 0.5),
      tags: ['relationship', ...(interaction.tags ?? [])],
      data: {
        trust: relationship.trust,
        affinity: relationship.affinity,
        fear: relationship.fear,
        respect: relationship.respect,
      },
    });

    this.memory.rel_capture_social_interaction<Record<string, unknown>>(
      this.identity.id,
      {
        targetId: interaction.targetId,
        trust: relationship.trust,
        affinity: relationship.affinity,
        fear: relationship.fear,
        respect: relationship.respect,
        summary: interaction.summary ?? '',
      },
      { source: 'agent-brain' },
    );
    this.memory.rel_capture_relationship_trust<Record<string, unknown>>(
      this.identity.id,
      { targetId: interaction.targetId, trust: relationship.trust },
      { source: 'agent-brain' },
    );

    return copyRelationship(relationship);
  }

  private ensureRelationship(targetId: string): AgentRelationship {
    let relationship = this.relationships.get(targetId);
    if (!relationship) {
      relationship = createEmptyRelationship(targetId);
      this.relationships.set(targetId, relationship);
      this.stats.relationshipsFormed++;
    }
    return relationship;
  }

  // ==========================================================================
  // Skills
  // ==========================================================================

  public getSkill(skillId: string): AgentSkill | undefined {
    const skill = this.skills.get(skillId);
    return skill ? copySkill(skill) : undefined;
  }

  public listSkills(): AgentSkill[] {
    return Array.from(this.skills.values()).map(copySkill);
  }

  public getSkillLevel(skillId: string): number {
    return this.skills.get(skillId)?.level ?? 0;
  }

  /** Add XP to a skill and process level-ups. */
  public practiceSkill(skillId: string, xpGain = 10): AgentSkill {
    const skill = this.skills.get(skillId);
    if (!skill) throw new RangeError(`Unknown skill: ${skillId}`);

    const safeGain = Math.max(0, finiteOr(xpGain, 0));
    const adjusted = safeGain * (0.85 + this.personality.openness * 0.3);
    const beforeLevel = skill.level;
    skill.xp += adjusted;
    skill.uses++;
    skill.lastUsedAt = Date.now();

    while (skill.level < 100 && skill.xp >= skill.xpToNext) {
      skill.xp -= skill.xpToNext;
      skill.level++;
      skill.xpToNext = skillXpRequirement(skill.level);
    }
    if (skill.level >= 100) {
      skill.level = 100;
      skill.xp = Math.min(skill.xp, skill.xpToNext);
    }
    skill.mastery = clamp01((skill.level - 1) / 99 + skill.xp / Math.max(1, skill.xpToNext) / 99);
    this.stats.skillsPracticed++;

    if (skill.level > beforeLevel) {
      this.remember({
        kind: 'learning',
        summary: `Reached ${skill.name} level ${skill.level}`,
        valence: 0.5,
        importance: 0.6,
        tags: ['skill', skill.id, 'level-up'],
        data: { skillId, level: skill.level },
      });
    }

    this.memory.skl_capture_practice_record<Record<string, unknown>>(
      this.identity.id,
      {
        skillId,
        xpGain: adjusted,
        level: skill.level,
        mastery: skill.mastery,
      },
      { source: 'agent-brain' },
    );

    return copySkill(skill);
  }

  /** Roll a skill check, award XP and record success/failure. */
  public useSkill(skillId: string, difficulty = 0.5): AgentSkillCheck {
    const skill = this.skills.get(skillId);
    if (!skill) throw new RangeError(`Unknown skill: ${skillId}`);

    const safeDifficulty = clamp01(difficulty);
    const probability = clamp(
      0.35 +
        skill.level / 100 * 0.5 +
        (this.personality.conscientiousness - 0.5) * 0.1 -
        safeDifficulty * 0.4,
      0.05,
      0.97,
    );
    const roll = this.rng.next();
    const success = roll < probability;
    const xpGain = success ? 6 + safeDifficulty * 12 : 2;
    const beforeLevel = skill.level;
    const updated = this.practiceSkill(skillId, xpGain);
    const internal = this.skills.get(skillId);
    if (internal) {
      if (success) internal.successes++;
      else internal.failures++;
    }

    this.emotions.valence = clampSigned(this.emotions.valence + (success ? 0.04 : -0.03));
    this.emotions.stress = clamp01(this.emotions.stress + (success ? -0.02 : 0.03));

    return {
      agentId: this.identity.id,
      skillId,
      success,
      probability,
      roll,
      level: updated.level,
      xpGained: xpGain,
      leveledUp: updated.level > beforeLevel,
      timestamp: Date.now(),
    };
  }

  // ==========================================================================
  // Goals & planning
  // ==========================================================================

  public addGoal(
    description: string,
    priority = 0.5,
    options: { deadline?: number; targetId?: string; tags?: string[]; activate?: boolean } = {},
  ): AgentGoal {
    const now = Date.now();
    const goal: AgentGoal = {
      id: `${this.identity.id}:goal:${this.goalCounter++}`,
      description,
      priority: clamp01(priority),
      progress: 0,
      status: options.activate === false ? 'pending' : 'active',
      createdAt: now,
      updatedAt: now,
      deadline: options.deadline,
      targetId: options.targetId,
      tags: options.tags ? [...options.tags] : [],
    };
    this.goals.set(goal.id, goal);

    this.remember({
      kind: 'goal',
      summary: `New goal: ${description}`,
      importance: clamp01(0.3 + goal.priority * 0.4),
      tags: ['goal', ...goal.tags],
      data: { goalId: goal.id, priority: goal.priority },
    });

    return copyGoal(goal);
  }

  public getGoals(status?: AgentGoalStatus): AgentGoal[] {
    return Array.from(this.goals.values())
      .filter((goal) => status === undefined || goal.status === status)
      .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
      .map(copyGoal);
  }

  public getActiveGoal(): AgentGoal | undefined {
    const active = Array.from(this.goals.values())
      .filter((goal) => goal.status === 'active')
      .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
    return active[0] ? copyGoal(active[0]) : undefined;
  }

  public advanceGoal(goalId: string, amount = 0.1): AgentGoal | undefined {
    const goal = this.goals.get(goalId);
    if (!goal || goal.status === 'completed' || goal.status === 'abandoned') return undefined;
    goal.progress = clamp01(goal.progress + amount);
    goal.updatedAt = Date.now();
    if (goal.progress >= 1) goal.status = 'completed';
    return copyGoal(goal);
  }

  public completeGoal(goalId: string): AgentGoal | undefined {
    const goal = this.goals.get(goalId);
    if (!goal) return undefined;
    goal.progress = 1;
    goal.status = 'completed';
    goal.updatedAt = Date.now();
    this.emotions.valence = clampSigned(this.emotions.valence + 0.1);
    return copyGoal(goal);
  }

  public abandonGoal(goalId: string): AgentGoal | undefined {
    const goal = this.goals.get(goalId);
    if (!goal) return undefined;
    goal.status = 'abandoned';
    goal.updatedAt = Date.now();
    return copyGoal(goal);
  }

  /** Produce a short utility-ranked plan, optionally tied to a goal. */
  public plan(observation?: AgentObservation, maxSteps = 3, goalId?: string): AgentPlan {
    const obs = observation ? this.normalizeObservation(observation) : this.currentObservation;
    const stateKey = this.stateKeyFor(obs);
    const ranked = this.rankActions(obs, stateKey).filter((score) => score.eligible);
    const steps: AgentPlanStep[] = [];
    const usedActions = new Set<string>();

    for (const score of ranked) {
      if (steps.length >= Math.max(1, Math.floor(maxSteps))) break;
      if (usedActions.has(score.actionId)) continue;
      usedActions.add(score.actionId);
      steps.push({
        actionId: score.actionId,
        label: score.label,
        utility: score.utility,
        qValue: score.qValue,
        score: score.score,
      });
    }

    const goal = goalId ? this.goals.get(goalId) : this.getActiveGoal();
    return {
      agentId: this.identity.id,
      goalId: goal?.id,
      createdAt: Date.now(),
      steps,
      rationale: goal ? `Pursuing goal: ${goal.description}` : 'Best available utility actions',
    };
  }

  // ==========================================================================
  // Decision making & learning
  // ==========================================================================

  /** Score every action for the supplied observation. */
  public rankActions(observation?: AgentObservation, stateKey?: string): AgentActionScore[] {
    const obs = observation ? this.normalizeObservation(observation) : this.currentObservation;
    const key = stateKey ?? this.stateKeyFor(obs);
    const scores: AgentActionScore[] = [];
    for (const definition of this.actions.values()) {
      scores.push(this.scoreAction(definition, obs, key));
    }
    scores.sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return b.score - a.score || a.actionId.localeCompare(b.actionId);
    });
    return scores;
  }

  /** Select an action using utility scoring plus epsilon-greedy Q-value selection. */
  public decide(
    observation?: AgentObservation,
    options: { explore?: boolean; stateKey?: string } = {},
  ): AgentDecision {
    const obs = observation ? this.normalizeObservation(observation) : this.currentObservation;
    const stateKey = options.stateKey ?? this.stateKeyFor(obs);
    const ranked = this.rankActions(obs, stateKey);
    const eligible = ranked.filter((score) => score.eligible);

    if (eligible.length === 0) {
      throw new Error(`Agent ${this.identity.id} has no eligible actions`);
    }

    const explore = options.explore ?? true;
    const shouldExplore = explore && this.epsilon > 0 && this.rng.next() < this.epsilon;
    let chosen: AgentActionScore;

    if (shouldExplore) {
      chosen = eligible[this.rng.int(0, eligible.length - 1)];
      this.stats.explorations++;
    } else {
      chosen = eligible[0];
    }

    const decision: AgentDecision = {
      agentId: this.identity.id,
      tick: this.tick,
      stateKey,
      actionId: chosen.actionId,
      label: chosen.label,
      category: chosen.category,
      score: chosen.score,
      utility: chosen.utility,
      qValue: chosen.qValue,
      exploration: shouldExplore,
      reason: shouldExplore
        ? `exploration (epsilon=${this.epsilon.toFixed(3)})`
        : chosen.reason,
      alternatives: ranked.slice(0, 6).map((item) => ({ ...item })),
      timestamp: Date.now(),
    };

    this.stats.decisions++;
    this.lastStateKey = stateKey;
    this.lastDecision = decision;
    return copyDecision(decision);
  }

  /** Alias for {@link decide}; makes agent reasoning explicit at call sites. */
  public think(
    observation?: AgentObservation,
    options: { explore?: boolean; stateKey?: string } = {},
  ): AgentDecision {
    return this.decide(observation, options);
  }

  /** Update a Q-value from one reinforcement-learning sample. */
  public learn(sample: AgentTrainingSample): AgentLearningResult {
    const reward = clamp(finiteOr(sample.reward, 0), -1000, 1000);
    const stateKey = sample.stateKey || this.lastStateKey || this.stateKeyFor(this.currentObservation);
    let values = this.qTable.get(stateKey);
    if (!values) {
      values = new Map<string, number>();
      this.qTable.set(stateKey, values);
    }

    const oldQ = values.get(sample.actionId) ?? 0;
    let maxNext = 0;
    if (!sample.done && sample.nextStateKey) {
      const nextValues = this.qTable.get(sample.nextStateKey);
      if (nextValues) {
        for (const value of nextValues.values()) {
          if (value > maxNext) maxNext = value;
        }
      }
    }

    const target = reward + this.learning.gamma * maxNext;
    let newQ = oldQ + this.learning.alpha * (target - oldQ);
    if (!Number.isFinite(newQ)) newQ = oldQ;
    values.set(sample.actionId, newQ);

    this.stats.trainingSamples++;
    this.stats.qUpdates++;
    this.applyReward(reward);
    this.pruneQTable();

    return {
      agentId: this.identity.id,
      stateKey,
      actionId: sample.actionId,
      oldQ,
      newQ,
      target,
      reward,
      alpha: this.learning.alpha,
      gamma: this.learning.gamma,
    };
  }

  /** Train a batch of samples in order. */
  public trainBatch(samples: readonly AgentTrainingSample[]): AgentTrainingReport {
    let improved = 0;
    let totalReward = 0;
    for (const sample of samples) {
      const result = this.learn(sample);
      if (result.newQ > result.oldQ) improved++;
      totalReward += result.reward;
    }
    return {
      samples: samples.length,
      improved,
      totalReward,
      meanReward: samples.length > 0 ? totalReward / samples.length : 0,
      qTableSize: this.getQTableSize(),
    };
  }

  // ==========================================================================
  // Negative reinforcement, preferences and aversions
  // ==========================================================================

  /**
   * Learn that an action is harmful.
   *
   * Negative updates use a faster asymmetric learning rate and are monotonic:
   * a penalty never raises an action's Q-value. Supplying `stimulusId` also
   * creates or strengthens a persistent aversion toward that stimulus.
   */
  public learnNegative(sample: AgentNegativeSample): AgentNegativeLearningResult {
    const penalty = clamp(
      Math.abs(finiteOr(sample.penalty, 0)) * clamp(finiteOr(sample.weight, 1), 0.01, 10),
      0,
      1000,
    );
    const stateKey = sample.stateKey || this.lastStateKey || this.stateKeyFor(this.currentObservation);
    let values = this.qTable.get(stateKey);
    if (!values) {
      values = new Map<string, number>();
      this.qTable.set(stateKey, values);
    }

    const oldQ = values.get(sample.actionId) ?? 0;
    let minNext = 0;
    if (!sample.done && sample.nextStateKey) {
      const nextValues = this.qTable.get(sample.nextStateKey);
      if (nextValues) {
        for (const value of nextValues.values()) {
          if (value < minNext) minNext = value;
        }
      }
    }

    const target = -penalty + this.learning.gamma * minNext;
    const alpha = clamp(this.learning.alpha * 1.5, 0.05, 0.95);
    let newQ = oldQ + alpha * (target - oldQ);
    if (!Number.isFinite(newQ)) newQ = oldQ - penalty;
    // Asymmetric negative learning: punishment may lower a value, never raise it.
    if (penalty > 0) newQ = Math.min(oldQ, newQ);
    newQ = clamp(newQ, -1000, 1000);
    values.set(sample.actionId, newQ);

    const reason = sample.reason?.trim() || 'negative-reinforcement';
    let aversionStrength: number | undefined;
    if (sample.stimulusId) {
      const aversion = this.recordAversion(
        sample.stimulusId,
        clamp01(penalty / 25),
        reason,
      );
      aversionStrength = aversion.strength;
    }

    this.stats.trainingSamples++;
    this.stats.qUpdates++;
    this.stats.rewards++;
    this.stats.totalReward -= penalty;
    this.stats.lastReward = -penalty;
    this.applyNegativeImpact(penalty);

    this.negativeStats.samples++;
    this.negativeStats.totalPenalty += penalty;
    this.negativeHistory.push({
      stateKey,
      actionId: sample.actionId,
      penalty,
      reason,
      stimulusId: sample.stimulusId,
      timestamp: Date.now(),
    });
    const historyLimit = Math.max(32, Math.floor(this.learning.memoryCapacity));
    if (this.negativeHistory.length > historyLimit) {
      this.negativeHistory.splice(0, this.negativeHistory.length - historyLimit);
    }

    this.pruneQTable();

    return {
      agentId: this.identity.id,
      stateKey,
      actionId: sample.actionId,
      oldQ,
      newQ,
      target,
      reward: -penalty,
      alpha,
      gamma: this.learning.gamma,
      penalty,
      aversionStrength,
      reason,
    };
  }

  /** Train a batch of negative samples and return aggregate diagnostics. */
  public trainNegativeBatch(samples: readonly AgentNegativeSample[]): AgentNegativeTrainingReport {
    let totalPenalty = 0;
    let updatedActions = 0;
    for (const sample of samples) {
      const result = this.learnNegative(sample);
      totalPenalty += result.penalty;
      if (result.newQ < result.oldQ) updatedActions++;
    }
    return {
      samples: samples.length,
      totalPenalty,
      meanPenalty: samples.length > 0 ? totalPenalty / samples.length : 0,
      updatedActions,
      aversionCount: this.aversions.size,
      qTableSize: this.getQTableSize(),
    };
  }

  /**
   * Learn a preference between two actions, pushing the preferred action's
   * Q-value above the dispreferred one by at least `strength`.
   */
  public learnPreference(pair: AgentPreferencePair): AgentPreferenceLearningResult {
    if (pair.preferredActionId === pair.dispreferredActionId) {
      throw new RangeError('learnPreference requires two distinct action ids');
    }
    const stateKey = pair.stateKey || this.lastStateKey || this.stateKeyFor(this.currentObservation);
    let values = this.qTable.get(stateKey);
    if (!values) {
      values = new Map<string, number>();
      this.qTable.set(stateKey, values);
    }

    const strength = clamp(finiteOr(pair.strength, 1), 0, 1000);
    let preferredQ = values.get(pair.preferredActionId) ?? 0;
    let dispreferredQ = values.get(pair.dispreferredActionId) ?? 0;
    const initialMargin = preferredQ - dispreferredQ;
    if (strength > 0 && initialMargin < strength) {
      const rate = clamp(this.learning.alpha * 2, 0.05, 0.9);
      const delta = ((strength - initialMargin) / 2) * rate;
      preferredQ = clamp(preferredQ + delta, -1000, 1000);
      dispreferredQ = clamp(dispreferredQ - delta, -1000, 1000);
      values.set(pair.preferredActionId, preferredQ);
      values.set(pair.dispreferredActionId, dispreferredQ);
    }

    this.negativeStats.preferencePairs++;
    this.pruneQTable();

    return {
      agentId: this.identity.id,
      stateKey,
      preferredActionId: pair.preferredActionId,
      dispreferredActionId: pair.dispreferredActionId,
      preferredQ,
      dispreferredQ,
      margin: preferredQ - dispreferredQ,
      strength,
    };
  }

  /** Train several preference pairs in order. */
  public trainPreferenceBatch(
    pairs: readonly AgentPreferencePair[],
  ): AgentPreferenceLearningResult[] {
    return pairs.map((pair) => this.learnPreference(pair));
  }

  /**
   * Record or strengthen an aversion toward a stimulus id. Repeated exposures
   * saturate toward 1 instead of growing without bound.
   */
  public recordAversion(stimulusId: string, strength = 0.5, reason = 'negative experience'): AgentAversion {
    if (!stimulusId) throw new Error('recordAversion requires a non-empty stimulusId');
    const now = Date.now();
    const sanitized = clamp01(finiteOr(strength, 0.5));
    const existing = this.aversions.get(stimulusId);
    if (existing) {
      existing.strength = clamp01(existing.strength + sanitized * (1 - existing.strength));
      existing.exposures++;
      existing.lastSeenAt = now;
      if (reason) existing.reason = reason;
      this.negativeStats.aversionCount = this.aversions.size;
      return copyAversion(existing);
    }
    const aversion: AgentAversion = {
      stimulusId,
      strength: sanitized,
      reason,
      exposures: 1,
      firstSeenAt: now,
      lastSeenAt: now,
    };
    this.aversions.set(stimulusId, aversion);
    this.negativeStats.aversionCount = this.aversions.size;
    return copyAversion(aversion);
  }

  public getAversion(stimulusId: string): AgentAversion | undefined {
    const aversion = this.aversions.get(stimulusId);
    return aversion ? copyAversion(aversion) : undefined;
  }

  /** Avoidance score in `[0, 1]`; unknown stimuli return 0. */
  public getAvoidanceScore(stimulusId: string): number {
    return this.aversions.get(stimulusId)?.strength ?? 0;
  }

  public listAversions(): AgentAversion[] {
    return Array.from(this.aversions.values())
      .sort((a, b) => b.strength - a.strength || a.stimulusId.localeCompare(b.stimulusId))
      .map(copyAversion);
  }

  public clearAversion(stimulusId: string): boolean {
    const removed = this.aversions.delete(stimulusId);
    this.negativeStats.aversionCount = this.aversions.size;
    return removed;
  }

  /** Decay all aversions (forgetting). Removes entries that reach zero. */
  public decayAversions(rate = 0.01): number {
    const decay = clamp(finiteOr(rate, 0), 0, 1);
    let removed = 0;
    for (const [id, aversion] of this.aversions.entries()) {
      aversion.strength = clamp01(aversion.strength - decay);
      if (aversion.strength <= 1e-4) {
        this.aversions.delete(id);
        removed++;
      }
    }
    this.negativeStats.aversionCount = this.aversions.size;
    return removed;
  }

  public getNegativeStats(): AgentNegativeStats {
    return { ...this.negativeStats, aversionCount: this.aversions.size };
  }

  public getNegativeHistory(limit = 50): AgentNegativeRecord[] {
    const count = clamp(Math.floor(finiteOr(limit, 50)), 0, this.negativeHistory.length);
    return this.negativeHistory
      .slice(this.negativeHistory.length - count)
      .map(copyNegativeRecord);
  }

  private applyNegativeImpact(penalty: number): void {
    const stressGain = clamp(penalty / 40, 0.01, 0.35);
    const valenceLoss = clamp(penalty / 60, 0.005, 0.3);
    const fearGain = clamp(penalty / 70, 0.01, 0.25);
    this.emotions.stress = clamp01(this.emotions.stress + stressGain);
    this.emotions.valence = clampSigned(this.emotions.valence - valenceLoss);
    this.emotions.intensities.fear = clamp01(this.emotions.intensities.fear + fearGain);
  }

  public getQValue(stateKey: string, actionId: string): number {
    return this.qTable.get(stateKey)?.get(actionId) ?? 0;
  }

  public setQValue(stateKey: string, actionId: string, value: number): number {
    const safeValue = clamp(finiteOr(value, 0), -1000, 1000);
    let values = this.qTable.get(stateKey);
    if (!values) {
      values = new Map<string, number>();
      this.qTable.set(stateKey, values);
    }
    values.set(actionId, safeValue);
    this.pruneQTable();
    return safeValue;
  }

  public getQTableSize(): number {
    let count = 0;
    for (const values of this.qTable.values()) count += values.size;
    return count;
  }

  public getQTableSnapshot(): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};
    for (const [state, values] of this.qTable.entries()) {
      result[state] = {};
      for (const [action, value] of values.entries()) {
        result[state][action] = value;
      }
    }
    return result;
  }

  public resetLearning(): number {
    const size = this.getQTableSize();
    this.qTable.clear();
    this.epsilon = clamp01(this.learning.epsilon);
    return size;
  }

  /**
   * Execute a concrete action. Skill checks, need effects, episodic records and
   * the Q-learning update are all scoped to this agent.
   */
  public performAction(
    actionId: string,
    difficulty = 0.5,
    nextObservation?: AgentObservation,
  ): AgentActionResult {
    const definition = this.actions.get(actionId);
    if (!definition) throw new RangeError(`Unknown action: ${actionId}`);

    const safeDifficulty = clamp01(difficulty);
    const stateKey = this.lastStateKey || this.stateKeyFor(this.currentObservation);
    const normalizedNext = nextObservation ? this.normalizeObservation(nextObservation) : undefined;
    const nextStateKey = normalizedNext ? this.stateKeyFor(normalizedNext) : stateKey;

    let skillCheck: AgentSkillCheck | undefined;
    let success: boolean;
    let probability: number;
    let roll: number;

    if (definition.skillId && this.skills.has(definition.skillId)) {
      skillCheck = this.useSkill(definition.skillId, safeDifficulty);
      success = skillCheck.success;
      probability = skillCheck.probability;
      roll = skillCheck.roll;
    } else {
      probability = clamp(
        0.5 +
          (this.personality.conscientiousness - 0.5) * 0.2 +
          (this.needs.stamina / 100 - 0.5) * 0.2 -
          safeDifficulty * 0.3,
        0.05,
        0.97,
      );
      roll = this.rng.next();
      success = roll < probability;
    }

    this.applyActionNeedEffects(actionId, success);
    const reward = (success ? 1 : -0.25) * (1 + definition.baseUtility) + (definition.category === 'combat' && success ? 0.5 : 0);
    const learning = this.learn({
      stateKey,
      actionId,
      reward,
      nextStateKey,
      done: false,
    });

    this.stats.actions++;
    this.emotions.valence = clampSigned(this.emotions.valence + (success ? 0.03 : -0.02));
    this.refreshEmotions(0.5);

    const result: AgentActionResult = {
      agentId: this.identity.id,
      actionId,
      label: definition.label,
      success,
      probability,
      roll,
      skillCheck,
      reward,
      needs: copyNeeds(this.needs),
      learning,
      description: success
        ? `${this.identity.name} performed ${definition.label} successfully`
        : `${this.identity.name} failed to perform ${definition.label}`,
      timestamp: Date.now(),
    };
    this.lastActionResult = result;

    this.remember({
      kind: 'action',
      summary: result.description,
      importance: clamp01(0.22 + definition.baseUtility * 0.4),
      valence: success ? 0.2 : -0.2,
      tags: ['action', definition.category, actionId],
      data: {
        success,
        reward,
        nextStateKey,
      },
    });

    if (normalizedNext) this.observe(normalizedNext);
    return { ...result, needs: copyNeeds(result.needs) };
  }

  /** Observe, decay drives, update affect, then think. */
  public update(observation: AgentObservation, deltaSeconds = 0.016): AgentUpdateResult {
    const dt = Math.max(0, finiteOr(deltaSeconds, 0));
    this.tick++;
    this.observe(observation);
    this.decayNeeds(dt);
    this.refreshEmotions(dt);
    this.decayEpisodes(dt);

    this.epsilon = Math.max(
      this.learning.epsilonMin,
      this.epsilon * Math.pow(clamp(this.learning.epsilonDecay, 0.000001, 1), dt),
    );

    if (
      this.learning.autoConsolidateEvery > 0 &&
      this.tick % Math.max(1, Math.floor(this.learning.autoConsolidateEvery)) === 0
    ) {
      this.consolidateMemories();
    }

    const decision = this.decide(this.currentObservation, { explore: true });
    this.stats.updates++;

    return {
      agentId: this.identity.id,
      tick: this.tick,
      observation: copyObservation(this.currentObservation),
      decision,
      needs: copyNeeds(this.needs),
      emotion: copyEmotionState(this.emotions),
      epsilon: this.epsilon,
      episodicMemories: this.episodes.length,
      beliefs: this.beliefs.size,
    };
  }

  /** Alias for {@link update}. */
  public tickAgent(observation: AgentObservation, deltaSeconds = 0.016): AgentUpdateResult {
    return this.update(observation, deltaSeconds);
  }

  // ==========================================================================
  // Needs & emotions
  // ==========================================================================

  public applyNeedDelta(key: AgentNeedKey, delta: number): number {
    this.needs[key] = clamp(this.needs[key] + finiteOr(delta, 0), 0, 100);
    return this.needs[key];
  }

  public satisfyNeed(key: AgentNeedKey, amount: number): number {
    return this.applyNeedDelta(key, Math.abs(finiteOr(amount, 0)));
  }

  public getDominantNeed(): AgentNeedKey {
    let result: AgentNeedKey = 'purpose';
    let lowest = Number.POSITIVE_INFINITY;
    for (const key of AGENT_NEED_KEYS) {
      if (this.needs[key] < lowest) {
        lowest = this.needs[key];
        result = key;
      }
    }
    return result;
  }

  public getPriorityNeeds(limit = 3): Array<{ key: AgentNeedKey; value: number; deficit: number }> {
    return AGENT_NEED_KEYS.map((key) => ({
      key,
      value: this.needs[key],
      deficit: 1 - this.needs[key] / 100,
    }))
      .sort((a, b) => b.deficit - a.deficit)
      .slice(0, Math.max(0, Math.floor(limit)));
  }

  /** Recompute affect from needs, personality and current threat. */
  public refreshEmotions(deltaSeconds = 1): AgentEmotionalState {
    const dt = Math.max(0, finiteOr(deltaSeconds, 0));
    const blend = 1 - Math.exp(-Math.max(0.0001, dt) * 2.5);
    const threats = this.currentObservation.stimuli ?? [];
    const threat = this.maxThreat(threats, this.currentObservation.threatLevel);
    const healthDeficit = 1 - this.needs.health / 100;
    const averageDeficit =
      AGENT_NEED_KEYS.reduce((sum, key) => sum + (1 - this.needs[key] / 100), 0) / AGENT_NEED_KEYS.length;

    const targetStress = clamp01(
      0.12 +
        this.personality.neuroticism * 0.35 +
        healthDeficit * 0.4 +
        threat * 0.5 +
        averageDeficit * 0.25 -
        this.personality.conscientiousness * 0.08 -
        this.personality.extraversion * 0.05,
    );
    const targetValence = clampSigned(
      (this.needs.health / 100 - 0.5) * 1.1 +
        (this.needs.social / 100 - 0.5) * 0.45 +
        (this.needs.safety / 100 - 0.5) * 0.45 -
        targetStress * 0.4 +
        (this.personality.extraversion - 0.5) * 0.12,
    );
    const targetArousal = clamp01(
      0.18 + threat * 0.6 + Math.abs(targetValence) * 0.15 + this.personality.extraversion * 0.08,
    );

    this.emotions.stress = clamp01(this.emotions.stress + (targetStress - this.emotions.stress) * blend);
    this.emotions.valence = clampSigned(this.emotions.valence + (targetValence - this.emotions.valence) * blend);
    this.emotions.arousal = clamp01(this.emotions.arousal + (targetArousal - this.emotions.arousal) * blend);

    for (const emotion of AGENT_EMOTIONS) {
      this.emotions.intensities[emotion] = clamp01(this.emotions.intensities[emotion] * 0.9);
    }

    const dominant = this.pickDominantEmotion(threat);
    this.emotions.dominantEmotion = dominant;
    this.emotions.intensities[dominant] = clamp01(this.emotions.intensities[dominant] + 0.35);
    this.emotions.mood = this.describeMood();
    return copyEmotionState(this.emotions);
  }

  private pickDominantEmotion(threat: number): AgentEmotion {
    if (this.emotions.stress > 0.78 && threat > 0.45) return 'fear';
    if (this.emotions.stress > 0.72 && this.personality.aggression > 0.6) return 'anger';
    if (this.emotions.valence > 0.5 && this.emotions.arousal > 0.55) return 'joy';
    if (this.emotions.valence > 0.35) return 'trust';
    if (this.emotions.valence < -0.45 && this.emotions.arousal < 0.45) return 'sadness';
    if (this.personality.curiosity > 0.72 && threat < 0.25) return 'curiosity';
    if (this.emotions.stress > 0.55) return 'stress';
    if (this.emotions.arousal < 0.3 && this.emotions.valence > 0.15) return 'calm';
    if (this.emotions.valence < -0.25) return 'anticipation';
    return 'neutral';
  }

  private describeMood(): string {
    if (this.emotions.stress > 0.75) return 'tense';
    if (this.emotions.valence > 0.55) return 'elated';
    if (this.emotions.valence > 0.2) return 'content';
    if (this.emotions.valence < -0.55) return 'distressed';
    if (this.emotions.valence < -0.2) return 'gloomy';
    if (this.emotions.arousal < 0.25) return 'calm';
    return 'neutral';
  }

  private decayNeeds(deltaSeconds: number): void {
    const dt = Math.max(0, deltaSeconds);
    this.needs.hunger = clamp(this.needs.hunger - 0.025 * dt, 0, 100);
    this.needs.thirst = clamp(this.needs.thirst - 0.04 * dt, 0, 100);
    this.needs.social = clamp(this.needs.social - 0.012 * dt, 0, 100);
    this.needs.esteem = clamp(this.needs.esteem - 0.004 * dt, 0, 100);
    this.needs.purpose = clamp(this.needs.purpose - 0.006 * dt, 0, 100);

    const threat = this.maxThreat(this.currentObservation.stimuli ?? [], this.currentObservation.threatLevel);
    const staminaDelta = threat > 0.2 ? -0.55 : 0.4;
    this.needs.stamina = clamp(this.needs.stamina + staminaDelta * dt, 0, 100);
    this.needs.safety = clamp(
      this.needs.safety + ((threat > 0.2 ? 45 : 88) - this.needs.safety) * (1 - Math.exp(-dt * 0.08)),
      0,
      100,
    );

    if (this.needs.hunger <= 0 || this.needs.thirst <= 0) {
      this.needs.health = clamp(this.needs.health - 0.04 * dt, 0, 100);
    }
  }

  private decayEpisodes(deltaSeconds: number): void {
    if (this.episodes.length === 0) return;
    const dt = Math.max(0, deltaSeconds);
    let write = 0;
    for (const episode of this.episodes) {
      if (!episode.consolidated) {
        const rate = this.learning.forgettingFactor * dt * (1.25 - episode.importance);
        episode.decay *= Math.exp(-Math.max(0, rate));
      }
      if (episode.consolidated || episode.decay > 0.04) {
        this.episodes[write++] = episode;
      } else {
        this.stats.memoriesForgotten++;
      }
    }
    this.episodes.length = write;
  }

  // ==========================================================================
  // Internal action scoring
  // ==========================================================================

  private scoreAction(
    definition: AgentActionDefinition,
    observation: AgentObservation,
    stateKey: string,
  ): AgentActionScore {
    const stimuli = observation.stimuli ?? [];
    const hasEnemy = this.nearestStimulus(stimuli, ['enemy', 'danger']) !== undefined;
    const hasAlly = stimuli.some((stimulus) => stimulus.kind === 'ally');
    const hasItem = stimuli.some(
      (stimulus) => stimulus.kind === 'item' || stimulus.kind === 'opportunity',
    );
    const hasAny = stimuli.length > 0;

    const requirement = definition.targetRequirement ?? 'none';
    const eligible =
      requirement === 'none' ||
      (requirement === 'enemy' && hasEnemy) ||
      (requirement === 'ally' && hasAlly) ||
      (requirement === 'item' && hasItem) ||
      (requirement === 'any' && hasAny);

    const qValue = this.getQValue(stateKey, definition.id);
    if (!eligible) {
      return {
        actionId: definition.id,
        label: definition.label,
        category: definition.category,
        eligible: false,
        utility: 0,
        qValue,
        score: Number.NEGATIVE_INFINITY,
        reason: `requires:${requirement}`,
      };
    }

    const reasons: string[] = [];
    let utility = definition.baseUtility;

    if (definition.needWeights) {
      for (const key of AGENT_NEED_KEYS) {
        const weight = definition.needWeights[key];
        if (!weight) continue;
        const deficit = 1 - this.needs[key] / 100;
        utility += weight * deficit;
        if (deficit > 0.25) reasons.push(`need:${key}`);
      }
    }

    if (definition.aggressionBias) {
      utility += definition.aggressionBias * this.personality.aggression;
      reasons.push('trait:aggression');
    }
    if (definition.curiosityBias) {
      utility += definition.curiosityBias * this.personality.curiosity;
      reasons.push('trait:curiosity');
    }
    if (definition.socialBias) {
      utility +=
        definition.socialBias *
        (this.personality.extraversion * 0.5 + this.personality.agreeableness * 0.5);
      reasons.push('trait:social');
    }
    if (definition.cautionBias) {
      utility +=
        definition.cautionBias *
        (this.personality.neuroticism * 0.5 + (1 - this.personality.courage) * 0.5);
      reasons.push('trait:caution');
    }
    if (definition.lowHealthBias) {
      utility += definition.lowHealthBias * (1 - this.needs.health / 100);
      reasons.push('health:low');
    }

    if (definition.id === 'flee') {
      utility +=
        (1 - this.needs.health / 100) * (0.9 + this.personality.neuroticism * 0.3) +
        this.emotions.intensities.fear * 0.4 -
        this.personality.courage * 0.3;
    } else if (definition.id === 'attack') {
      utility +=
        (this.needs.health / 100) * this.personality.aggression * 0.3 -
        this.emotions.stress * 0.15;
    } else if (definition.id === 'defend') {
      utility += (1 - this.needs.health / 100) * this.personality.courage * 0.3;
    }

    if (definition.id === 'heal' && this.needs.health > 80) utility *= 0.15;
    if (definition.id === 'rest' && this.needs.stamina > 85) utility *= 0.2;
    if (definition.id === 'eat' && this.needs.hunger > 85) utility *= 0.2;
    if (definition.id === 'drink' && this.needs.thirst > 85) utility *= 0.2;
    if (definition.id === 'socialize' && this.needs.social > 85) utility *= 0.35;
    if (definition.id === 'train' && this.needs.purpose > 85) utility *= 0.4;

    if (qValue !== 0) reasons.push(`q:${qValue.toFixed(2)}`);
    const score = utility + qValue;

    return {
      actionId: definition.id,
      label: definition.label,
      category: definition.category,
      eligible: true,
      utility,
      qValue,
      score,
      reason: reasons.length > 0 ? reasons.join(',') : 'baseline',
    };
  }

  private applyActionNeedEffects(actionId: string, success: boolean): void {
    const multiplier = success ? 1 : 0.35;
    const apply = (key: AgentNeedKey, delta: number): void => {
      this.needs[key] = clamp(this.needs[key] + delta * multiplier, 0, 100);
    };

    switch (actionId) {
      case 'idle':
        apply('stamina', 1);
        break;
      case 'patrol':
        apply('stamina', -3);
        apply('purpose', 2);
        break;
      case 'investigate':
        apply('stamina', -2);
        apply('purpose', 2);
        break;
      case 'approach':
        apply('stamina', -3);
        break;
      case 'attack':
        apply('stamina', -6);
        apply('safety', -3);
        break;
      case 'defend':
        apply('stamina', -3);
        apply('safety', 2);
        break;
      case 'flee':
        apply('stamina', -8);
        apply('safety', 12);
        break;
      case 'heal':
        apply('health', success ? 20 : 4);
        apply('stamina', -2);
        break;
      case 'rest':
        apply('stamina', 16);
        apply('hunger', -1);
        apply('thirst', -1);
        break;
      case 'eat':
        apply('hunger', 26);
        apply('thirst', 2);
        break;
      case 'drink':
        apply('thirst', 32);
        break;
      case 'socialize':
        apply('social', 18);
        apply('esteem', 4);
        break;
      case 'gather':
        apply('purpose', 5);
        apply('stamina', -4);
        break;
      case 'train': {
        apply('purpose', 7);
        apply('stamina', -5);
        const weakest = this.listSkills().sort((a, b) => a.level - b.level)[0];
        if (weakest) this.practiceSkill(weakest.id, 6);
        break;
      }
      case 'craft':
        apply('purpose', 6);
        apply('stamina', -3);
        break;
      case 'scout':
        apply('stamina', -4);
        apply('purpose', 3);
        break;
      case 'guard':
        apply('safety', 8);
        apply('stamina', -2);
        break;
      case 'negotiate':
        apply('social', 10);
        apply('esteem', 2);
        break;
      case 'hunt':
        apply('hunger', 18);
        apply('stamina', -6);
        break;
      default:
        break;
    }
  }

  private normalizeObservation(observation: AgentObservation): AgentObservation {
    return {
      tick: typeof observation.tick === 'number' && Number.isFinite(observation.tick)
        ? Math.max(0, Math.floor(observation.tick))
        : undefined,
      position: copyVec3(observation.position),
      velocity: copyVec3(observation.velocity),
      health: observation.health !== undefined ? clamp(observation.health, 0, 100) : undefined,
      stamina: observation.stamina !== undefined ? clamp(observation.stamina, 0, 100) : undefined,
      threatLevel:
        observation.threatLevel !== undefined ? clamp01(observation.threatLevel) : undefined,
      stimuli: (observation.stimuli ?? []).map((stimulus) => ({
        ...stimulus,
        distance: Math.max(0, finiteOr(stimulus.distance, 0)),
        threat: stimulus.threat !== undefined ? clamp01(stimulus.threat) : undefined,
        value: stimulus.value !== undefined ? clamp01(stimulus.value) : undefined,
        position: copyVec3(stimulus.position),
        tags: stimulus.tags ? [...stimulus.tags] : undefined,
        data: stimulus.data ? { ...stimulus.data } : undefined,
      })),
      inventory: observation.inventory ? [...observation.inventory] : undefined,
      environment: observation.environment ? { ...observation.environment } : undefined,
    };
  }

  private nearestStimulus(
    stimuli: readonly AgentStimulus[],
    kinds: readonly AgentStimulus['kind'][],
  ): AgentStimulus | undefined {
    let nearest: AgentStimulus | undefined;
    for (const stimulus of stimuli) {
      if (!kinds.includes(stimulus.kind)) continue;
      if (!nearest || stimulus.distance < nearest.distance) nearest = stimulus;
    }
    return nearest;
  }

  private maxThreat(stimuli: readonly AgentStimulus[], explicit?: number): number {
    let result = explicit !== undefined ? clamp01(explicit) : 0;
    for (const stimulus of stimuli) {
      if (stimulus.kind !== 'enemy' && stimulus.kind !== 'danger') continue;
      const threat =
        stimulus.threat !== undefined
          ? clamp01(stimulus.threat)
          : clamp01(1 - stimulus.distance / 50);
      if (threat > result) result = threat;
    }
    return result;
  }

  /** Discretized state key used by the Q-table. */
  public stateKeyFor(observation: AgentObservation): string {
    const stimuli = observation.stimuli ?? [];
    const enemy = this.nearestStimulus(stimuli, ['enemy', 'danger']);
    const ally = stimuli.some((stimulus) => stimulus.kind === 'ally');
    const item = stimuli.some(
      (stimulus) => stimulus.kind === 'item' || stimulus.kind === 'opportunity',
    );
    const health = observation.health ?? this.needs.health;
    const healthBucket = health > 70 ? 'healthy' : health > 35 ? 'wounded' : 'critical';
    const enemyBucket = enemy
      ? enemy.distance <= 3
        ? 'melee'
        : enemy.distance <= 12
          ? 'near'
          : 'far'
      : 'safe';
    const threat = this.maxThreat(stimuli, observation.threatLevel);
    const threatBucket = threat > 0.66 ? 'high' : threat > 0.25 ? 'medium' : 'low';
    return `${this.identity.archetype}|${enemyBucket}|${healthBucket}|${ally ? 'ally' : 'solo'}|${
      item ? 'loot' : 'noloot'
    }|${threatBucket}`;
  }

  private applyReward(reward: number): void {
    this.stats.rewards++;
    this.stats.totalReward += reward;
    this.stats.lastReward = reward;
    const impact = clamp(reward / 20, -0.25, 0.25);
    this.emotions.valence = clampSigned(this.emotions.valence + impact);
    this.emotions.stress = clamp01(this.emotions.stress + (reward < 0 ? 0.04 : -0.025));
    if (reward > 2) {
      this.needs.esteem = clamp(this.needs.esteem + Math.min(4, reward * 0.2), 0, 100);
    }
  }

  private pruneQTable(): void {
    const limit = Math.max(16, Math.floor(this.learning.maxQTableEntries));
    if (this.getQTableSize() <= limit) return;

    const entries: Array<{ state: string; action: string; value: number }> = [];
    for (const [state, values] of this.qTable.entries()) {
      for (const [action, value] of values.entries()) {
        entries.push({ state, action, value });
      }
    }
    entries.sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
    const removeCount = Math.max(0, entries.length - Math.floor(limit * 0.8));
    for (let i = 0; i < removeCount; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const values = this.qTable.get(entry.state);
      if (!values) continue;
      values.delete(entry.action);
      if (values.size === 0) this.qTable.delete(entry.state);
    }
  }

  public registerAction(definition: AgentActionDefinition): AgentActionDefinition {
    this.actions.set(definition.id, copyActionDefinition(definition));
    return copyActionDefinition(definition);
  }

  public getActionDefinitions(): AgentActionDefinition[] {
    return Array.from(this.actions.values()).map(copyActionDefinition);
  }

  // ==========================================================================
  // Serialization, cloning, reset
  // ==========================================================================

  /** Serialize the complete brain, including its private NPC memory records. */
  public serialize(): AgentSnapshot {
    const payload: AgentSnapshotPayload = {
      schemaVersion: AGENT_SNAPSHOT_VERSION,
      identity: { ...this.identity },
      personality: { ...this.personality },
      needs: copyNeeds(this.needs),
      emotions: copyEmotionState(this.emotions),
      skills: this.listSkills(),
      relationships: this.listRelationships(),
      qTable: this.getQTableSnapshot(),
      episodes: this.episodes.map(copyEpisode),
      beliefs: this.getBeliefs(),
      goals: this.getGoals(),
      actions: this.getActionDefinitions(),
      learning: { ...this.learning },
      stats: copyStats(this.stats),
      memoryRecords: this.memory.repository.snapshot(),
      tick: this.tick,
      epsilon: this.epsilon,
      lastStateKey: this.lastStateKey,
      randomState: this.rng.getState(),
      episodeCounter: this.episodeCounter,
      aversions: this.listAversions(),
      negativeHistory: this.negativeHistory.map(copyNegativeRecord),
      negativeStats: this.getNegativeStats(),
    };

    return {
      ...payload,
      checksum: fnv1aChecksum(canonicalJson(payload)),
    };
  }

  /** Alias for {@link serialize}. */
  public toSnapshot(): AgentSnapshot {
    return this.serialize();
  }

  /** Called automatically by `JSON.stringify(brain)`. */
  public toJSON(): AgentSnapshot {
    return this.serialize();
  }

  /** Restore a brain from a snapshot produced by {@link serialize}. */
  public static fromSnapshot(snapshot: AgentSnapshot): AgentBrain {
    if (!snapshot || snapshot.schemaVersion !== AGENT_SNAPSHOT_VERSION) {
      throw new Error(`Unsupported agent snapshot version: ${String(snapshot?.schemaVersion)}`);
    }

    const { checksum, ...payload } = snapshot;
    const expected = fnv1aChecksum(canonicalJson(payload));
    if (checksum && checksum !== expected) {
      throw new Error('Agent snapshot checksum mismatch');
    }

    const brain = new AgentBrain(snapshot.identity, {
      randomSeed: snapshot.identity.seed,
      learning: snapshot.learning,
      personality: snapshot.personality,
      startingNeeds: snapshot.needs,
      actionDefinitions: snapshot.actions,
      memoryConfig: {
        maxMemoryPerAgent: Math.max(32, snapshot.learning.memoryCapacity * 4),
      },
    });

    brain.skills.clear();
    for (const skill of snapshot.skills) brain.skills.set(skill.id, copySkill(skill));

    brain.relationships.clear();
    for (const relationship of snapshot.relationships) {
      brain.relationships.set(relationship.targetId, copyRelationship(relationship));
    }

    brain.qTable.clear();
    for (const [stateKey, values] of Object.entries(snapshot.qTable)) {
      const target = new Map<string, number>();
      for (const [actionId, value] of Object.entries(values)) {
        if (typeof value === 'number' && Number.isFinite(value)) target.set(actionId, value);
      }
      brain.qTable.set(stateKey, target);
    }

    brain.episodes.length = 0;
    brain.episodes.push(...snapshot.episodes.map(copyEpisode));

    brain.beliefs.clear();
    for (const belief of snapshot.beliefs) {
      brain.beliefs.set(belief.key, copyBelief(belief));
    }

    brain.goals.clear();
    for (const goal of snapshot.goals) brain.goals.set(goal.id, copyGoal(goal));

    brain.emotions.valence = snapshot.emotions.valence;
    brain.emotions.arousal = snapshot.emotions.arousal;
    brain.emotions.stress = snapshot.emotions.stress;
    brain.emotions.dominantEmotion = snapshot.emotions.dominantEmotion;
    brain.emotions.mood = snapshot.emotions.mood;
    for (const emotion of AGENT_EMOTIONS) {
      brain.emotions.intensities[emotion] = snapshot.emotions.intensities[emotion] ?? 0;
    }

    Object.assign(brain.stats, copyStats(snapshot.stats));
    brain.memory.repository.load(Array.isArray(snapshot.memoryRecords) ? snapshot.memoryRecords : []);

    brain.aversions.clear();
    for (const aversion of Array.isArray(snapshot.aversions) ? snapshot.aversions : []) {
      if (!aversion?.stimulusId) continue;
      brain.aversions.set(aversion.stimulusId, {
        ...copyAversion(aversion),
        strength: clamp01(aversion.strength),
        reason: aversion.reason ?? 'negative experience',
        exposures: Math.max(0, Math.floor(finiteOr(aversion.exposures, 1))),
        firstSeenAt: finiteOr(aversion.firstSeenAt, 0),
        lastSeenAt: finiteOr(aversion.lastSeenAt, 0),
      });
    }

    brain.negativeHistory.length = 0;
    const history = Array.isArray(snapshot.negativeHistory) ? snapshot.negativeHistory : [];
    const historyLimit = Math.max(32, Math.floor(finiteOr(snapshot.learning.memoryCapacity, 256)));
    for (const record of history.slice(-historyLimit)) {
      if (!record?.actionId) continue;
      brain.negativeHistory.push({
        stateKey: record.stateKey ?? '',
        actionId: record.actionId,
        penalty: clamp(finiteOr(record.penalty, 0), 0, 1000),
        reason: record.reason ?? 'negative-reinforcement',
        stimulusId: record.stimulusId,
        timestamp: finiteOr(record.timestamp, 0),
      });
    }

    if (snapshot.negativeStats) {
      brain.negativeStats = {
        samples: Math.max(0, Math.floor(finiteOr(snapshot.negativeStats.samples, 0))),
        totalPenalty: Math.max(0, finiteOr(snapshot.negativeStats.totalPenalty, 0)),
        preferencePairs: Math.max(0, Math.floor(finiteOr(snapshot.negativeStats.preferencePairs, 0))),
        aversionCount: brain.aversions.size,
      };
    } else {
      brain.negativeStats = {
        samples: brain.negativeHistory.length,
        totalPenalty: brain.negativeHistory.reduce((sum, record) => sum + record.penalty, 0),
        preferencePairs: 0,
        aversionCount: brain.aversions.size,
      };
    }

    brain.tick = snapshot.tick;
    brain.epsilon = clamp01(snapshot.epsilon);
    brain.lastStateKey = snapshot.lastStateKey;
    brain.rng.setState(snapshot.randomState);
    brain.episodeCounter = snapshot.episodeCounter;
    brain.currentObservation = { tick: snapshot.tick };

    return brain;
  }

  /** Parse a JSON snapshot and restore it. */
  public static deserialize(json: string | AgentSnapshot): AgentBrain {
    if (typeof json !== 'string') return AgentBrain.fromSnapshot(json);
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid agent snapshot payload');
    }
    return AgentBrain.fromSnapshot(parsed as AgentSnapshot);
  }

  /**
   * Create a new agent with the same archetype/name but a different id. Learned
   * memories, Q-values, skills and relationships are intentionally NOT copied.
   */
  public clone(id: string, name = this.identity.name): AgentBrain {
    if (!id || id === this.identity.id) {
      throw new Error('clone requires a different, non-empty id');
    }
    return new AgentBrain({
      id,
      name,
      archetype: this.identity.archetype,
      faction: this.identity.faction,
      role: this.identity.role,
      level: this.identity.level,
      createdAt: Date.now(),
      seed: hashString(`${id}:${name}:${this.identity.archetype}`),
    }, {
      learning: { ...this.learning },
      memoryConfig: { maxMemoryPerAgent: Math.max(32, this.learning.memoryCapacity * 4) },
    });
  }

  /** Reset learned state; optionally regenerate baseline skills. */
  public reset(includeProgression = false): AgentResetResult {
    const result: AgentResetResult = {
      agentId: this.identity.id,
      episodesCleared: this.episodes.length,
      beliefsCleared: this.beliefs.size,
      relationshipsCleared: this.relationships.size,
      qStatesCleared: this.qTable.size,
      goalsCleared: this.goals.size,
      memoryRecordsCleared: this.memory.repository.count(),
      tick: this.tick,
    };

    this.episodes.length = 0;
    this.beliefs.clear();
    this.relationships.clear();
    this.qTable.clear();
    this.goals.clear();
    this.observedThreats.clear();
    this.aversions.clear();
    this.negativeHistory.length = 0;
    this.negativeStats = {
      samples: 0,
      totalPenalty: 0,
      preferencePairs: 0,
      aversionCount: 0,
    };
    this.memory.repository.clear();
    this.lastDecision = null;
    this.lastActionResult = null;
    this.lastStateKey = '';
    this.epsilon = clamp01(this.learning.epsilon);

    if (includeProgression) {
      this.skills.clear();
      for (const skill of createInitialSkills(this.identity.seed, this.identity.archetype)) {
        this.skills.set(skill.id, skill);
      }
      const needs = createInitialNeeds(this.identity.seed, this.identity.archetype);
      for (const key of AGENT_NEED_KEYS) this.needs[key] = needs[key];
      const emotions = createEmptyEmotionalState();
      this.emotions.valence = emotions.valence;
      this.emotions.arousal = emotions.arousal;
      this.emotions.stress = emotions.stress;
      this.emotions.dominantEmotion = emotions.dominantEmotion;
      this.emotions.mood = emotions.mood;
      for (const emotion of AGENT_EMOTIONS) this.emotions.intensities[emotion] = 0;
      this.tick = 0;
      result.tick = 0;
    }

    return result;
  }
}
