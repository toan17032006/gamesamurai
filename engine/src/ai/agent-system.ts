/**
 * @file agent-system.ts
 * @module @aetheria/engine/ai/agent-system
 * @description Multi-agent lifecycle manager. Agents are stored by unique id and
 * each one keeps an independent {@link AgentBrain}. No memory, personality,
 * skill or learning data is shared between entries.
 */

import {
  AgentBrain,
  type AgentBrainSummary,
} from './agent-brain.js';
import type {
  AgentArchetype,
  AgentBrainConfig,
  AgentDecision,
  AgentIdentityInput,
  AgentNegativeLearningResult,
  AgentNegativeSample,
  AgentNegativeTrainingReport,
  AgentObservation,
  AgentPreferenceLearningResult,
  AgentPreferencePair,
  AgentSnapshot,
  AgentTrainingReport,
  AgentTrainingSample,
  AgentUpdateResult,
} from './agent-types.js';

/** Aggregate manager statistics. */
export interface AgentManagerStats {
  agentCount: number;
  totalMemories: number;
  totalBeliefs: number;
  totalQEntries: number;
  totalReward: number;
  negativeSamples: number;
  totalPenalty: number;
  totalAversions: number;
  preferencePairs: number;
  archetypes: Record<AgentArchetype, number>;
}

/** Result of restoring a set of snapshots. */
export interface AgentRestoreResult {
  restored: number;
  skipped: string[];
}

/** Result of removing all agents. */
export interface AgentManagerClearResult {
  removed: number;
}

/**
 * Owns a collection of agents. Duplicate ids are rejected so two objects can
 * never accidentally share one brain.
 */
export class AgentManager {
  private readonly agents = new Map<string, AgentBrain>();

  /** Create and register a new independent agent. */
  public createAgent(identity: AgentIdentityInput, config: AgentBrainConfig = {}): AgentBrain {
    if (!identity.id) throw new Error('AgentManager.createAgent requires a non-empty id');
    if (this.agents.has(identity.id)) {
      throw new Error(`Agent id already exists: ${identity.id}`);
    }
    const brain = new AgentBrain(identity, config);
    this.agents.set(identity.id, brain);
    return brain;
  }

  /** Alias for {@link createAgent}. */
  public spawn(identity: AgentIdentityInput, config: AgentBrainConfig = {}): AgentBrain {
    return this.createAgent(identity, config);
  }

  /** Create several agents at once. */
  public createAgents(
    identities: readonly AgentIdentityInput[],
    config: AgentBrainConfig = {},
  ): AgentBrain[] {
    return identities.map((identity) => this.createAgent(identity, config));
  }

  public has(id: string): boolean {
    return this.agents.has(id);
  }

  public getAgent(id: string): AgentBrain | undefined {
    return this.agents.get(id);
  }

  public requireAgent(id: string): AgentBrain {
    const agent = this.agents.get(id);
    if (!agent) throw new Error(`Unknown agent id: ${id}`);
    return agent;
  }

  /** Return an existing agent or create one with the supplied identity. */
  public getOrCreate(identity: AgentIdentityInput, config: AgentBrainConfig = {}): AgentBrain {
    const existing = this.agents.get(identity.id);
    return existing ?? this.createAgent(identity, config);
  }

  public removeAgent(id: string): boolean {
    return this.agents.delete(id);
  }

  /** Remove all agents and return how many were removed. */
  public clear(): AgentManagerClearResult {
    const removed = this.agents.size;
    this.agents.clear();
    return { removed };
  }

  public get size(): number {
    return this.agents.size;
  }

  public getAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }

  public listAgents(): AgentBrain[] {
    return Array.from(this.agents.values());
  }

  public getBrainsByArchetype(archetype: AgentArchetype): AgentBrain[] {
    return this.listAgents().filter((agent) => agent.archetype === archetype);
  }

  /** Update one agent with a perception frame. */
  public updateAgent(
    id: string,
    observation: AgentObservation,
    deltaSeconds = 0.016,
  ): AgentUpdateResult {
    return this.requireAgent(id).update(observation, deltaSeconds);
  }

  /**
   * Update every agent that has an entry in `observations`. Agents without a
   * frame are left untouched. Returns the per-agent update results.
   */
  public updateAll(
    observations: Record<string, AgentObservation>,
    deltaSeconds = 0.016,
  ): Map<string, AgentUpdateResult> {
    const results = new Map<string, AgentUpdateResult>();
    for (const [id, observation] of Object.entries(observations)) {
      const agent = this.agents.get(id);
      if (!agent) continue;
      results.set(id, agent.update(observation, deltaSeconds));
    }
    return results;
  }

  public thinkAgent(
    id: string,
    observation?: AgentObservation,
    options: { explore?: boolean; stateKey?: string } = {},
  ): AgentDecision {
    return this.requireAgent(id).decide(observation, options);
  }

  public thinkAll(
    observations: Record<string, AgentObservation> = {},
    options: { explore?: boolean } = {},
  ): Map<string, AgentDecision> {
    const results = new Map<string, AgentDecision>();
    for (const [id, agent] of this.agents.entries()) {
      const observation = observations[id];
      results.set(id, agent.decide(observation, { explore: options.explore ?? true }));
    }
    return results;
  }

  /** Train one agent with a batch of samples. */
  public trainAgent(id: string, samples: readonly AgentTrainingSample[]): AgentTrainingReport {
    return this.requireAgent(id).trainBatch(samples);
  }

  /** Train several agents in one call. */
  public trainAll(
    samplesByAgent: Record<string, readonly AgentTrainingSample[]>,
  ): Map<string, AgentTrainingReport> {
    const reports = new Map<string, AgentTrainingReport>();
    for (const [id, samples] of Object.entries(samplesByAgent)) {
      const agent = this.agents.get(id);
      if (!agent) continue;
      reports.set(id, agent.trainBatch(samples));
    }
    return reports;
  }

  /** Train one agent with negative reinforcement samples. */
  public trainNegative(
    id: string,
    samples: readonly AgentNegativeSample[],
  ): AgentNegativeTrainingReport {
    return this.requireAgent(id).trainNegativeBatch(samples);
  }

  /** Train several agents with negative samples. */
  public trainNegativeAll(
    samplesByAgent: Record<string, readonly AgentNegativeSample[]>,
  ): Map<string, AgentNegativeTrainingReport> {
    const reports = new Map<string, AgentNegativeTrainingReport>();
    for (const [id, samples] of Object.entries(samplesByAgent)) {
      const agent = this.agents.get(id);
      if (!agent) continue;
      reports.set(id, agent.trainNegativeBatch(samples));
    }
    return reports;
  }

  /** Teach one agent a single action preference pair. */
  public trainPreference(
    id: string,
    pair: AgentPreferencePair,
  ): AgentPreferenceLearningResult {
    return this.requireAgent(id).learnPreference(pair);
  }

  /** Teach several agents preference pairs in one call. */
  public trainPreferences(
    pairsByAgent: Record<string, readonly AgentPreferencePair[]>,
  ): Map<string, AgentPreferenceLearningResult[]> {
    const reports = new Map<string, AgentPreferenceLearningResult[]>();
    for (const [id, pairs] of Object.entries(pairsByAgent)) {
      const agent = this.agents.get(id);
      if (!agent) continue;
      reports.set(id, agent.trainPreferenceBatch(pairs));
    }
    return reports;
  }

  /** Apply a negative sample directly to an existing agent. */
  public learnNegative(id: string, sample: AgentNegativeSample): AgentNegativeLearningResult {
    return this.requireAgent(id).learnNegative(sample);
  }

  /** Serialize every agent, including its private memory repository. */
  public serializeAll(): AgentSnapshot[] {
    return this.listAgents().map((agent) => agent.serialize());
  }

  /** Restore one snapshot. Returns false when the id exists and `replace` is false. */
  public restoreAgent(snapshot: AgentSnapshot, replace = true): boolean {
    const id = snapshot.identity.id;
    if (!replace && this.agents.has(id)) return false;
    const brain = AgentBrain.fromSnapshot(snapshot);
    this.agents.set(id, brain);
    return true;
  }

  /** Restore multiple snapshots; duplicate/conflicting restores are reported. */
  public restoreAll(snapshots: readonly AgentSnapshot[], replace = true): AgentRestoreResult {
    const skipped: string[] = [];
    let restored = 0;
    for (const snapshot of snapshots) {
      const id = snapshot?.identity?.id;
      if (!id) {
        skipped.push('<missing-id>');
        continue;
      }
      if (!replace && this.agents.has(id)) {
        skipped.push(id);
        continue;
      }
      try {
        const brain = AgentBrain.fromSnapshot(snapshot);
        this.agents.set(id, brain);
        restored++;
      } catch {
        skipped.push(id);
      }
    }
    return { restored, skipped };
  }

  /** Compact summaries for every agent, useful for HUD/debug overlays. */
  public getSummaries(): AgentBrainSummary[] {
    return this.listAgents().map((agent) => agent.getSummary());
  }

  public getStats(): AgentManagerStats {
    const archetypes: Record<AgentArchetype, number> = {
      npc: 0,
      bot: 0,
      monster: 0,
      player: 0,
      pet: 0,
    };
    let totalMemories = 0;
    let totalBeliefs = 0;
    let totalQEntries = 0;
    let totalReward = 0;
    let negativeSamples = 0;
    let totalPenalty = 0;
    let totalAversions = 0;
    let preferencePairs = 0;

    for (const agent of this.agents.values()) {
      archetypes[agent.archetype]++;
      totalMemories += agent.getMemoryCount();
      totalBeliefs += agent.getBeliefCount();
      totalQEntries += agent.getQTableSize();
      totalReward += agent.getStats().totalReward;
      const negative = agent.getNegativeStats();
      negativeSamples += negative.samples;
      totalPenalty += negative.totalPenalty;
      totalAversions += negative.aversionCount;
      preferencePairs += negative.preferencePairs;
    }

    return {
      agentCount: this.agents.size,
      totalMemories,
      totalBeliefs,
      totalQEntries,
      totalReward,
      negativeSamples,
      totalPenalty,
      totalAversions,
      preferencePairs,
      archetypes,
    };
  }
}

export { AgentManager as AgentRegistry, AgentManager as AgentSystem };
