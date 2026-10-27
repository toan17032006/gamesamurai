/**
 * @file agent-types.ts
 * @module @aetheria/engine/ai/agent-types
 * @description Typed contracts for the per-agent AI runtime: identity, personality,
 * needs, emotions, skills, relationships, memory, planning, learning and snapshots.
 *
 * Every object that owns an {@link AgentBrain} owns its own instances of these
 * structures. Nothing in this module is shared through module-level mutable state.
 */

import type { Vec3 } from '../types/transform.types.js';
import type { NPCRecord, NPCSystemConfig } from '../npc/types.js';

// ============================================================================
// Primitive helpers & deterministic randomness
// ============================================================================

/** Clamps a numeric value into the inclusive range `[min, max]`. */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Public alias for the agent clamp helper (avoids colliding with core clamp). */
export const clampAgentValue = clamp;

/** Clamps a numeric value into the inclusive range `[0, 1]`. */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/** Clamps a numeric value into the inclusive range `[-1, 1]`. */
export function clampSigned(value: number): number {
  return clamp(value, -1, 1);
}

/** Returns a finite number or `fallback`. */
export function finiteOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Deterministic FNV-1a 32-bit hash used for identity-seeded personalities. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Small, serializable PRNG (Mulberry32). Each agent owns its own instance so
 * stochastic decisions are independent and reproducible from a seed.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 0x6d2b79f5;
  }

  /** Returns the next value in `[0, 1)`. */
  public next(): number {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns a random float in `[min, max)`. */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Returns a random integer in `[min, max]`. */
  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** Picks a random element; throws for an empty array. */
  public pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new RangeError('SeededRandom.pick requires at least one item');
    }
    return items[this.int(0, items.length - 1)];
  }

  /** Current internal state, useful for serialization/debugging. */
  public getState(): number {
    return this.state >>> 0;
  }

  /** Restores a previously captured state. */
  public setState(state: number): this {
    this.state = state >>> 0 || 0x6d2b79f5;
    return this;
  }
}

/**
 * Canonical JSON used for checksums. Object keys are sorted recursively so a
 * snapshot keeps the same checksum after a JSON round trip.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      const child = source[key];
      if (child !== undefined) result[key] = canonicalize(child);
    }
    return result;
  }
  return value;
}

// ============================================================================
// Identity & personality
// ============================================================================

/** Broad behavioural archetype of an agent. */
export type AgentArchetype = 'npc' | 'bot' | 'monster' | 'player' | 'pet';

/** All supported agent archetypes. */
export const AGENT_ARCHETYPES: readonly AgentArchetype[] = [
  'npc',
  'bot',
  'monster',
  'player',
  'pet',
];

/** Stable identity of a single agent. */
export interface AgentIdentity {
  /** Unique object/entity id. Two ids always produce independent brains. */
  id: string;
  name: string;
  archetype: AgentArchetype;
  faction?: string;
  role?: string;
  level: number;
  createdAt: number;
  /** Deterministic seed derived from id/name/archetype unless overridden. */
  seed: number;
}

/** Input accepted when constructing a brain or spawning an agent. */
export interface AgentIdentityInput {
  id: string;
  name: string;
  archetype?: AgentArchetype;
  faction?: string;
  role?: string;
  level?: number;
  createdAt?: number;
  seed?: number;
}

/** Observable personality traits, each normalized to `[0, 1]`. */
export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  aggression: number;
  curiosity: number;
  loyalty: number;
  patience: number;
  greed: number;
  honor: number;
  courage: number;
  empathy: number;
  discipline: number;
  creativity: number;
}

/** Every personality trait key. */
export const PERSONALITY_TRAIT_KEYS: readonly (keyof PersonalityTraits)[] = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
  'aggression',
  'curiosity',
  'loyalty',
  'patience',
  'greed',
  'honor',
  'courage',
  'empathy',
  'discipline',
  'creativity',
];

const ARCHETYPE_TRAIT_SHIFTS: Record<AgentArchetype, Partial<PersonalityTraits>> = {
  npc: { agreeableness: 0.08, empathy: 0.08, loyalty: 0.06, aggression: -0.12 },
  bot: { discipline: 0.1, aggression: 0.08, loyalty: 0.06, curiosity: -0.04 },
  monster: { aggression: 0.24, courage: 0.12, empathy: -0.16, patience: -0.08 },
  player: { curiosity: 0.08, openness: 0.06, courage: 0.05 },
  pet: { loyalty: 0.18, empathy: 0.08, aggression: -0.08 },
};

/**
 * Builds a deterministic personality from an agent seed. Different ids produce
 * different trait vectors; the same id/name/archetype always reproduces the
 * same baseline, which makes save games and replays stable.
 */
export function createPersonalityTraits(
  seed: number,
  archetype: AgentArchetype,
  overrides?: Partial<PersonalityTraits>,
): PersonalityTraits {
  const random = new SeededRandom(hashString(`personality:${seed}:${archetype}`));
  const shifts = ARCHETYPE_TRAIT_SHIFTS[archetype];
  const result = {} as PersonalityTraits;

  for (const key of PERSONALITY_TRAIT_KEYS) {
    const base = 0.24 + random.next() * 0.52 + (shifts[key] ?? 0);
    result[key] = clamp01(overrides?.[key] ?? base);
  }
  return result;
}

// ============================================================================
// Needs & emotions
// ============================================================================

/** Drives whose satisfaction decays over time. `100` means fully satisfied. */
export type AgentNeedKey =
  | 'health'
  | 'stamina'
  | 'hunger'
  | 'thirst'
  | 'safety'
  | 'social'
  | 'esteem'
  | 'purpose';

/** Every need key in a stable order. */
export const AGENT_NEED_KEYS: readonly AgentNeedKey[] = [
  'health',
  'stamina',
  'hunger',
  'thirst',
  'safety',
  'social',
  'esteem',
  'purpose',
];

/** Complete need vector for one agent. */
export type AgentNeeds = Record<AgentNeedKey, number>;

/** Discrete emotions exposed by the runtime. */
export type AgentEmotion =
  | 'neutral'
  | 'joy'
  | 'trust'
  | 'fear'
  | 'anger'
  | 'sadness'
  | 'surprise'
  | 'disgust'
  | 'anticipation'
  | 'pride'
  | 'shame'
  | 'curiosity'
  | 'calm'
  | 'stress';

/** Every emotion key. */
export const AGENT_EMOTIONS: readonly AgentEmotion[] = [
  'neutral',
  'joy',
  'trust',
  'fear',
  'anger',
  'sadness',
  'surprise',
  'disgust',
  'anticipation',
  'pride',
  'shame',
  'curiosity',
  'calm',
  'stress',
];

/** Emotional state of one agent. */
export interface AgentEmotionalState {
  valence: number;
  arousal: number;
  stress: number;
  dominantEmotion: AgentEmotion;
  intensities: Record<AgentEmotion, number>;
  mood: string;
}

/** Creates a neutral emotional state without sharing mutable objects. */
export function createEmptyEmotionalState(): AgentEmotionalState {
  const intensities = {} as Record<AgentEmotion, number>;
  for (const emotion of AGENT_EMOTIONS) intensities[emotion] = 0;
  return {
    valence: 0,
    arousal: 0.2,
    stress: 0.15,
    dominantEmotion: 'neutral',
    intensities,
    mood: 'neutral',
  };
}

/** Creates deterministic starting needs for an agent. */
export function createInitialNeeds(seed: number, archetype: AgentArchetype): AgentNeeds {
  const random = new SeededRandom(hashString(`needs:${seed}:${archetype}`));
  const needs = {} as AgentNeeds;
  for (const key of AGENT_NEED_KEYS) {
    needs[key] = clamp(
      Math.round(66 + random.next() * 30),
      0,
      100,
    );
  }
  needs.health = 100;
  needs.stamina = clamp(Math.round(80 + random.next() * 20), 0, 100);
  return needs;
}

// ============================================================================
// Skills
// ============================================================================

/** Skill categories understood by the AI runtime. */
export type AgentSkillCategory =
  | 'combat'
  | 'magic'
  | 'stealth'
  | 'survival'
  | 'social'
  | 'crafting'
  | 'perception'
  | 'medicine'
  | 'leadership'
  | 'athletics'
  | 'lore';

/** Static skill definition. */
export interface AgentSkillDefinition {
  id: string;
  name: string;
  category: AgentSkillCategory;
  description: string;
}

/** Catalog shared by every agent; skills themselves are per-agent records. */
export const AGENT_SKILL_CATALOG: readonly AgentSkillDefinition[] = [
  { id: 'melee', name: 'Melee Combat', category: 'combat', description: 'Close-quarters weapon handling.' },
  { id: 'ranged', name: 'Ranged Combat', category: 'combat', description: 'Bows, thrown weapons and firearms.' },
  { id: 'defense', name: 'Defense', category: 'combat', description: 'Blocking, parrying and damage mitigation.' },
  { id: 'arcane', name: 'Arcane Magic', category: 'magic', description: 'Spell shaping and mana control.' },
  { id: 'elemental', name: 'Elemental Magic', category: 'magic', description: 'Fire, frost, storm and earth manipulation.' },
  { id: 'sneak', name: 'Stealth', category: 'stealth', description: 'Moving unseen and avoiding notice.' },
  { id: 'lockpicking', name: 'Lockpicking', category: 'stealth', description: 'Opening locks and disarming mechanisms.' },
  { id: 'tracking', name: 'Tracking', category: 'survival', description: 'Following trails and reading terrain.' },
  { id: 'foraging', name: 'Foraging', category: 'survival', description: 'Finding food, water and reagents.' },
  { id: 'persuasion', name: 'Persuasion', category: 'social', description: 'Negotiating and changing minds.' },
  { id: 'intimidation', name: 'Intimidation', category: 'social', description: 'Projecting threat and extracting compliance.' },
  { id: 'insight', name: 'Insight', category: 'social', description: 'Reading intent, lies and emotional cues.' },
  { id: 'smithing', name: 'Smithing', category: 'crafting', description: 'Forging and repairing equipment.' },
  { id: 'alchemy', name: 'Alchemy', category: 'crafting', description: 'Brewing potions and preparing reagents.' },
  { id: 'observation', name: 'Observation', category: 'perception', description: 'Spotting details, ambushes and opportunities.' },
  { id: 'first_aid', name: 'First Aid', category: 'medicine', description: 'Stabilizing wounds and restoring health.' },
  { id: 'command', name: 'Command', category: 'leadership', description: 'Coordinating allies under pressure.' },
  { id: 'climbing', name: 'Climbing', category: 'athletics', description: 'Scaling obstacles and rough terrain.' },
  { id: 'swimming', name: 'Swimming', category: 'athletics', description: 'Moving efficiently through water.' },
  { id: 'history', name: 'Lore', category: 'lore', description: 'Knowledge of places, factions and legends.' },
];

/** Mutable progression record for one skill of one agent. */
export interface AgentSkill {
  id: string;
  name: string;
  category: AgentSkillCategory;
  level: number;
  xp: number;
  xpToNext: number;
  mastery: number;
  uses: number;
  successes: number;
  failures: number;
  lastUsedAt: number;
}

/** XP required to advance from `level` to `level + 1`. */
export function skillXpRequirement(level: number): number {
  return Math.round(28 + level * 13 + level * level * 0.7);
}

const ARCHETYPE_PRIMARY_SKILLS: Record<AgentArchetype, readonly string[]> = {
  npc: ['persuasion', 'insight', 'history', 'first_aid', 'alchemy'],
  bot: ['melee', 'ranged', 'defense', 'observation', 'command'],
  monster: ['melee', 'defense', 'tracking', 'intimidation', 'climbing'],
  player: ['melee', 'ranged', 'defense', 'observation', 'first_aid', 'athletics'],
  pet: ['tracking', 'foraging', 'climbing', 'swimming', 'observation'],
};

/**
 * Creates the independent skill sheet for one agent. Primary archetype skills
 * start higher, but every id still rolls its own values.
 */
export function createInitialSkills(seed: number, archetype: AgentArchetype): AgentSkill[] {
  const random = new SeededRandom(hashString(`skills:${seed}:${archetype}`));
  const primary = new Set(ARCHETYPE_PRIMARY_SKILLS[archetype]);

  return AGENT_SKILL_CATALOG.map((definition) => {
    const bonus = primary.has(definition.id) ? 7 : 0;
    const level = clamp(Math.round(2 + random.next() * 12 + bonus), 1, 100);
    return {
      id: definition.id,
      name: definition.name,
      category: definition.category,
      level,
      xp: 0,
      xpToNext: skillXpRequirement(level),
      mastery: clamp01((level - 1) / 99),
      uses: 0,
      successes: 0,
      failures: 0,
      lastUsedAt: 0,
    };
  });
}

// ============================================================================
// Relationships
// ============================================================================

/** One agent's private model of another entity. */
export interface AgentRelationship {
  targetId: string;
  trust: number;
  affinity: number;
  fear: number;
  respect: number;
  familiarity: number;
  interactions: number;
  lastInteractionAt: number;
  tags: string[];
}

/** Create an empty relationship without sharing arrays. */
export function createEmptyRelationship(targetId: string): AgentRelationship {
  return {
    targetId,
    trust: 0.5,
    affinity: 0,
    fear: 0,
    respect: 0.5,
    familiarity: 0,
    interactions: 0,
    lastInteractionAt: 0,
    tags: [],
  };
}

/** Interaction deltas applied to a relationship. */
export interface AgentInteraction {
  targetId: string;
  trust?: number;
  affinity?: number;
  fear?: number;
  respect?: number;
  familiarity?: number;
  summary?: string;
  tags?: string[];
}

// ============================================================================
// Memory
// ============================================================================

/** Episodic memory categories. */
export type AgentEpisodeKind =
  | 'observation'
  | 'action'
  | 'outcome'
  | 'social'
  | 'combat'
  | 'learning'
  | 'event'
  | 'goal';

/** A single episodic memory owned by one agent. */
export interface AgentEpisode {
  id: string;
  agentId: string;
  tick: number;
  timestamp: number;
  kind: AgentEpisodeKind;
  summary: string;
  subjectId?: string;
  position?: Vec3;
  valence: number;
  importance: number;
  decay: number;
  tags: string[];
  data: Record<string, unknown>;
  consolidated: boolean;
  recordId?: string;
}

/** Input for {@link AgentBrain.remember}. */
export interface AgentEpisodeInput {
  kind?: AgentEpisodeKind;
  summary: string;
  subjectId?: string;
  position?: Vec3;
  valence?: number;
  importance?: number;
  tags?: string[];
  data?: Record<string, unknown>;
}

/** A semantic belief/fact. */
export interface AgentBelief<T = unknown> {
  key: string;
  value: T;
  confidence: number;
  source: string;
  evidenceCount: number;
  updatedAt: number;
  tags: string[];
}

/** Query for episodic recall. */
export interface AgentMemoryQuery {
  text?: string;
  kind?: AgentEpisodeKind | AgentEpisodeKind[];
  subjectId?: string;
  tags?: string[];
  minImportance?: number;
  since?: number;
  limit?: number;
  sortBy?: 'recent' | 'important' | 'valence';
  includeConsolidated?: boolean;
}

// ============================================================================
// Goals & planning
// ============================================================================

/** Goal lifecycle. */
export type AgentGoalStatus = 'pending' | 'active' | 'completed' | 'abandoned';

/** A lightweight goal record used by planning and utility reasoning. */
export interface AgentGoal {
  id: string;
  description: string;
  priority: number;
  progress: number;
  status: AgentGoalStatus;
  createdAt: number;
  updatedAt: number;
  deadline?: number;
  targetId?: string;
  tags: string[];
}

/** One candidate step in a plan. */
export interface AgentPlanStep {
  actionId: string;
  label: string;
  utility: number;
  qValue: number;
  score: number;
}

/** A short utility-ranked plan. */
export interface AgentPlan {
  agentId: string;
  goalId?: string;
  createdAt: number;
  steps: AgentPlanStep[];
  rationale: string;
}

// ============================================================================
// Action selection
// ============================================================================

/** Action categories understood by the runtime. */
export type AgentActionCategory =
  | 'idle'
  | 'movement'
  | 'combat'
  | 'defense'
  | 'social'
  | 'survival'
  | 'exploration'
  | 'work'
  | 'learning';

/** Requirement for a stimulus to make an action eligible. */
export type AgentTargetRequirement = 'enemy' | 'ally' | 'item' | 'any' | 'none';

/** Declarative action definition. Kept data-only so it can be serialized. */
export interface AgentActionDefinition {
  id: string;
  label: string;
  category: AgentActionCategory;
  baseUtility: number;
  aggressionBias?: number;
  curiosityBias?: number;
  socialBias?: number;
  cautionBias?: number;
  lowHealthBias?: number;
  needWeights?: Partial<Record<AgentNeedKey, number>>;
  targetRequirement?: AgentTargetRequirement;
  skillId?: string;
}

/** Default action library used for every newly created brain. */
export function createDefaultActionDefinitions(): AgentActionDefinition[] {
  return [
    { id: 'idle', label: 'Observe surroundings', category: 'idle', baseUtility: 0.08, curiosityBias: 0.04 },
    {
      id: 'patrol',
      label: 'Patrol the area',
      category: 'movement',
      baseUtility: 0.18,
      curiosityBias: 0.15,
      cautionBias: 0.08,
      needWeights: { purpose: 0.2, safety: 0.06 },
      skillId: 'observation',
    },
    {
      id: 'investigate',
      label: 'Investigate a stimulus',
      category: 'exploration',
      baseUtility: 0.24,
      curiosityBias: 0.35,
      aggressionBias: 0.08,
      targetRequirement: 'any',
      skillId: 'observation',
    },
    {
      id: 'approach',
      label: 'Approach a target',
      category: 'movement',
      baseUtility: 0.28,
      curiosityBias: 0.14,
      socialBias: 0.1,
      targetRequirement: 'any',
    },
    {
      id: 'attack',
      label: 'Attack the enemy',
      category: 'combat',
      baseUtility: 0.46,
      aggressionBias: 0.48,
      needWeights: { safety: 0.12 },
      targetRequirement: 'enemy',
      skillId: 'melee',
    },
    {
      id: 'defend',
      label: 'Hold a defensive stance',
      category: 'defense',
      baseUtility: 0.4,
      cautionBias: 0.34,
      needWeights: { safety: 0.5 },
      targetRequirement: 'enemy',
      skillId: 'defense',
    },
    {
      id: 'flee',
      label: 'Retreat from danger',
      category: 'defense',
      baseUtility: 0.12,
      cautionBias: 0.5,
      lowHealthBias: 0.85,
      needWeights: { safety: 0.4 },
      targetRequirement: 'enemy',
      skillId: 'climbing',
    },
    {
      id: 'heal',
      label: 'Treat wounds',
      category: 'survival',
      baseUtility: 0.1,
      needWeights: { health: 1.2 },
      skillId: 'first_aid',
    },
    {
      id: 'rest',
      label: 'Rest and recover',
      category: 'survival',
      baseUtility: 0.08,
      needWeights: { stamina: 0.9, health: 0.1 },
    },
    { id: 'eat', label: 'Eat food', category: 'survival', baseUtility: 0.06, needWeights: { hunger: 1.1 } },
    { id: 'drink', label: 'Drink water', category: 'survival', baseUtility: 0.06, needWeights: { thirst: 1.3 } },
    {
      id: 'socialize',
      label: 'Talk with an ally',
      category: 'social',
      baseUtility: 0.16,
      socialBias: 0.4,
      needWeights: { social: 1.0 },
      targetRequirement: 'ally',
      skillId: 'persuasion',
    },
    {
      id: 'gather',
      label: 'Gather resources',
      category: 'work',
      baseUtility: 0.2,
      curiosityBias: 0.2,
      needWeights: { purpose: 0.4 },
      targetRequirement: 'item',
      skillId: 'foraging',
    },
    {
      id: 'train',
      label: 'Train a skill',
      category: 'learning',
      baseUtility: 0.12,
      curiosityBias: 0.18,
      needWeights: { purpose: 0.6 },
    },
    {
      id: 'craft',
      label: 'Craft equipment',
      category: 'work',
      baseUtility: 0.12,
      needWeights: { purpose: 0.5 },
      skillId: 'smithing',
    },
    {
      id: 'scout',
      label: 'Scout ahead',
      category: 'exploration',
      baseUtility: 0.22,
      curiosityBias: 0.4,
      needWeights: { safety: 0.2 },
      targetRequirement: 'any',
      skillId: 'observation',
    },
    {
      id: 'guard',
      label: 'Guard a position',
      category: 'defense',
      baseUtility: 0.24,
      cautionBias: 0.3,
      needWeights: { safety: 0.5 },
      skillId: 'defense',
    },
    {
      id: 'negotiate',
      label: 'Negotiate',
      category: 'social',
      baseUtility: 0.14,
      socialBias: 0.45,
      needWeights: { social: 0.6 },
      targetRequirement: 'ally',
      skillId: 'persuasion',
    },
    {
      id: 'hunt',
      label: 'Hunt for food',
      category: 'survival',
      baseUtility: 0.3,
      aggressionBias: 0.25,
      needWeights: { hunger: 0.5 },
      targetRequirement: 'enemy',
      skillId: 'ranged',
    },
  ];
}

/** Stimulus kinds perceived by an agent. */
export type AgentStimulusKind =
  | 'enemy'
  | 'ally'
  | 'neutral'
  | 'item'
  | 'danger'
  | 'opportunity'
  | 'point_of_interest';

/** A perceived entity, object or event. */
export interface AgentStimulus {
  id: string;
  kind: AgentStimulusKind;
  position?: Vec3;
  distance: number;
  threat?: number;
  value?: number;
  tags?: string[];
  data?: Record<string, unknown>;
}

/** Immutable snapshot of what an agent can perceive this tick. */
export interface AgentObservation {
  tick?: number;
  position?: Vec3;
  velocity?: Vec3;
  health?: number;
  stamina?: number;
  threatLevel?: number;
  stimuli?: AgentStimulus[];
  inventory?: string[];
  environment?: Record<string, unknown>;
}

/** One scored candidate action. */
export interface AgentActionScore {
  actionId: string;
  label: string;
  category: AgentActionCategory;
  eligible: boolean;
  utility: number;
  qValue: number;
  score: number;
  reason: string;
}

/** A decision produced by utility reasoning plus Q-values. */
export interface AgentDecision {
  agentId: string;
  tick: number;
  stateKey: string;
  actionId: string;
  label: string;
  category: AgentActionCategory;
  score: number;
  utility: number;
  qValue: number;
  exploration: boolean;
  reason: string;
  alternatives: AgentActionScore[];
  timestamp: number;
}

/** Result of a full brain update. */
export interface AgentUpdateResult {
  agentId: string;
  tick: number;
  observation: AgentObservation;
  decision: AgentDecision;
  needs: AgentNeeds;
  emotion: AgentEmotionalState;
  epsilon: number;
  episodicMemories: number;
  beliefs: number;
}

// ============================================================================
// Learning
// ============================================================================

/** Q-learning and exploration parameters. */
export interface AgentLearningConfig {
  alpha: number;
  gamma: number;
  epsilon: number;
  epsilonMin: number;
  epsilonDecay: number;
  maxQTableEntries: number;
  memoryCapacity: number;
  forgettingFactor: number;
  autoConsolidateEvery: number;
}

/** Options accepted by the {@link AgentBrain} constructor. */
export interface AgentBrainConfig {
  randomSeed?: number;
  learning?: Partial<AgentLearningConfig>;
  personality?: Partial<PersonalityTraits>;
  startingNeeds?: Partial<AgentNeeds>;
  actionDefinitions?: AgentActionDefinition[];
  memoryConfig?: NPCSystemConfig;
}

/** Runtime counters, useful for debugging and telemetry. */
export interface AgentStats {
  updates: number;
  decisions: number;
  explorations: number;
  actions: number;
  rewards: number;
  totalReward: number;
  lastReward: number;
  episodesRemembered: number;
  memoriesForgotten: number;
  skillsPracticed: number;
  relationshipsFormed: number;
  trainingSamples: number;
  qUpdates: number;
}

/** Creates a zeroed stats record. */
export function createAgentStats(): AgentStats {
  return {
    updates: 0,
    decisions: 0,
    explorations: 0,
    actions: 0,
    rewards: 0,
    totalReward: 0,
    lastReward: 0,
    episodesRemembered: 0,
    memoriesForgotten: 0,
    skillsPracticed: 0,
    relationshipsFormed: 0,
    trainingSamples: 0,
    qUpdates: 0,
  };
}

/** One supervised reinforcement-learning sample. */
export interface AgentTrainingSample {
  stateKey: string;
  actionId: string;
  reward: number;
  nextStateKey?: string;
  done?: boolean;
}

/** Result of a single Q-table update. */
export interface AgentLearningResult {
  agentId: string;
  stateKey: string;
  actionId: string;
  oldQ: number;
  newQ: number;
  target: number;
  reward: number;
  alpha: number;
  gamma: number;
}

/** Aggregate result of a training batch. */
export interface AgentTrainingReport {
  samples: number;
  improved: number;
  totalReward: number;
  meanReward: number;
  qTableSize: number;
}

/**
 * A negative reinforcement sample. `penalty` is a positive magnitude; the brain
 * applies it as a negative reward with an asymmetric (faster) learning rate so
 * harmful actions are suppressed more quickly than good actions are reinforced.
 */
export interface AgentNegativeSample {
  /** Optional state override; defaults to the agent's last decision state. */
  stateKey?: string;
  actionId: string;
  /** Positive penalty magnitude (clamped to `[0, 1000]`). */
  penalty: number;
  /** Optional multiplier in `[0.01, 10]` (defaults to 1). */
  weight?: number;
  /** Human-readable reason persisted in the negative history. */
  reason?: string;
  /** Optional stimulus that becomes an aversion. */
  stimulusId?: string;
  /** Optional next state used to bootstrap future punishment. */
  nextStateKey?: string;
  done?: boolean;
  context?: Record<string, unknown>;
}

/** One negative sample recorded for audit/debugging and snapshot persistence. */
export interface AgentNegativeRecord {
  stateKey: string;
  actionId: string;
  penalty: number;
  reason: string;
  stimulusId?: string;
  timestamp: number;
}

/** Result of one negative Q-table update. */
export interface AgentNegativeLearningResult extends AgentLearningResult {
  /** Positive penalty magnitude that was applied. */
  penalty: number;
  /** Aversion strength after the update, when a stimulus was supplied. */
  aversionStrength?: number;
  reason: string;
}

/** Aggregate result of a negative training batch. */
export interface AgentNegativeTrainingReport {
  samples: number;
  totalPenalty: number;
  meanPenalty: number;
  updatedActions: number;
  aversionCount: number;
  qTableSize: number;
}

/**
 * A paired preference sample: the preferred action should rank above the
 * dispreferred action by at least `strength` Q-value margin.
 */
export interface AgentPreferencePair {
  stateKey?: string;
  preferredActionId: string;
  dispreferredActionId: string;
  /** Desired positive margin (defaults to 1, clamped to `[0, 1000]`). */
  strength?: number;
  context?: Record<string, unknown>;
}

/** Result of one preference-pair update. */
export interface AgentPreferenceLearningResult {
  agentId: string;
  stateKey: string;
  preferredActionId: string;
  dispreferredActionId: string;
  preferredQ: number;
  dispreferredQ: number;
  margin: number;
  strength: number;
}

/** Learned aversion toward a stimulus (object, creature, place, sound, ...). */
export interface AgentAversion {
  stimulusId: string;
  /** Aversion strength in `[0, 1]`. */
  strength: number;
  reason: string;
  exposures: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

/** Negative-learning counters exposed for HUD and diagnostics. */
export interface AgentNegativeStats {
  samples: number;
  totalPenalty: number;
  preferencePairs: number;
  aversionCount: number;
}

/** Result of a skill check. */
export interface AgentSkillCheck {
  agentId: string;
  skillId: string;
  success: boolean;
  probability: number;
  roll: number;
  level: number;
  xpGained: number;
  leveledUp: boolean;
  timestamp: number;
}

/** Result of executing one concrete action. */
export interface AgentActionResult {
  agentId: string;
  actionId: string;
  label: string;
  success: boolean;
  probability: number;
  roll: number;
  skillCheck?: AgentSkillCheck;
  reward: number;
  needs: AgentNeeds;
  learning: AgentLearningResult;
  description: string;
  timestamp: number;
}

/** Result of memory consolidation. */
export interface AgentConsolidationResult {
  consolidated: number;
  beliefsCreated: number;
  forgotten: number;
  remaining: number;
}

/** Result of resetting a brain's learned state. */
export interface AgentResetResult {
  agentId: string;
  episodesCleared: number;
  beliefsCleared: number;
  relationshipsCleared: number;
  qStatesCleared: number;
  goalsCleared: number;
  memoryRecordsCleared: number;
  tick: number;
}

// ============================================================================
// Serialization
// ============================================================================

/** Version of the snapshot schema. */
export const AGENT_SNAPSHOT_VERSION = 1;

/** Complete serializable state of one agent brain. */
export interface AgentSnapshot {
  schemaVersion: number;
  identity: AgentIdentity;
  personality: PersonalityTraits;
  needs: AgentNeeds;
  emotions: AgentEmotionalState;
  skills: AgentSkill[];
  relationships: AgentRelationship[];
  qTable: Record<string, Record<string, number>>;
  episodes: AgentEpisode[];
  beliefs: AgentBelief[];
  goals: AgentGoal[];
  actions: AgentActionDefinition[];
  learning: AgentLearningConfig;
  stats: AgentStats;
  memoryRecords: NPCRecord<unknown>[];
  tick: number;
  epsilon: number;
  lastStateKey: string;
  randomState: number;
  episodeCounter: number;
  /** Learned stimulus aversions (optional for backwards-compatible v1 snapshots). */
  aversions?: AgentAversion[];
  /** Bounded negative-sample audit log. */
  negativeHistory?: AgentNegativeRecord[];
  /** Negative-learning counters. */
  negativeStats?: AgentNegativeStats;
  checksum: string;
}
