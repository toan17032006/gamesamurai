/**
 * @file ai-agent-runtime.test.ts
 * @module @aetheria/engine/tests
 * @description Integration tests for the isolated per-agent AI runtime.
 */

import { describe, it, expect } from 'vitest';
import * as AIModule from '../src/ai/index.js';
import {
  AgentBrain,
  AgentManager,
  AgentRegistry,
  type AgentObservation,
  type AgentSnapshot,
} from '../src/ai/index.js';
import { Steering, type SteeringAgent } from '../src/ai/steering.js';
import { NPCMemoryLearningSystem } from '../src/npc/index.js';
import { Bot, Monster, NPC, Player } from '../src/objects/index.js';
import functionsCatalog from './ai_npc_functions_2400.json';

interface CatalogFunction {
  name: string;
}

interface CatalogModule {
  functions: CatalogFunction[];
}

const catalog = functionsCatalog as CatalogModule[];

describe('Isolated per-agent AI runtime', () => {
  it('exposes the 2,400 NPC AI functions through the AI barrel', () => {
    const moduleExports = AIModule as unknown as Record<string, unknown>;
    let missing = 0;
    for (const module of catalog) {
      for (const fn of module.functions) {
        if (typeof moduleExports[fn.name] !== 'function') missing++;
      }
    }
    expect(missing).toBe(0);
    expect(typeof AIModule.NPCMemoryLearningSystem).toBe('function');
  });

  it('derives different deterministic personalities and skills for different ids', () => {
    const first = new AgentBrain({ id: 'npc_alpha', name: 'Guard', archetype: 'npc' });
    const second = new AgentBrain({ id: 'npc_beta', name: 'Guard', archetype: 'npc' });
    const repeat = new AgentBrain({ id: 'npc_alpha', name: 'Guard', archetype: 'npc' });

    expect(first.identity.seed).not.toBe(second.identity.seed);
    expect(first.personality).not.toEqual(second.personality);
    expect(first.personality).toEqual(repeat.personality);
    expect(first.listSkills()).toEqual(repeat.listSkills());
    expect(first.listSkills()).not.toEqual(second.listSkills());
  });

  it('keeps episodic memory, semantic beliefs and NPC repositories isolated', () => {
    const first = new AgentBrain({ id: 'memory_alpha', name: 'Alpha' });
    const second = new AgentBrain({ id: 'memory_beta', name: 'Beta' });

    first.remember({ summary: 'Found a hidden chest', tags: ['treasure'], importance: 0.8 });
    first.learnFact('chest:key', 'golden', 0.95, 'observation', ['quest']);
    second.remember({ summary: 'Saw a dragon', tags: ['dragon'], importance: 0.9 });

    expect(first.getMemoryCount()).toBe(1);
    expect(second.getMemoryCount()).toBe(1);
    expect(first.recall({ text: 'chest' }).length).toBe(1);
    expect(first.recall({ text: 'dragon' }).length).toBe(0);
    expect(second.recall({ text: 'dragon' }).length).toBe(1);
    expect(first.recallFact('chest:key')).toBeDefined();
    expect(second.recallFact('chest:key')).toBeUndefined();
    expect(first.memory).not.toBe(second.memory);
    expect(first.memory.totalRecordCount()).toBeGreaterThan(0);

    const recordsBefore = first.memory.totalRecordCount();
    first.memory.repository.clear();
    expect(first.memory.totalRecordCount()).toBe(0);
    expect(second.memory.totalRecordCount()).toBe(1);
    expect(recordsBefore).toBeGreaterThan(0);
  });

  it('improves action values through Q-learning and uses the learned value', () => {
    const brain = new AgentBrain(
      { id: 'learner_alpha', name: 'Learner' },
      { learning: { epsilon: 0, epsilonMin: 0, alpha: 0.5, gamma: 0.9 } },
    );
    const observation: AgentObservation = {
      health: 100,
      threatLevel: 0.8,
      stimuli: [{ id: 'enemy_1', kind: 'enemy', distance: 2, threat: 0.8 }],
    };

    const before = brain.getQValue('duel', 'attack');
    for (let i = 0; i < 20; i++) {
      brain.learn({ stateKey: 'duel', actionId: 'attack', reward: 10, nextStateKey: 'duel' });
    }
    const after = brain.getQValue('duel', 'attack');
    expect(after).toBeGreaterThan(before);
    expect(after).toBeGreaterThan(5);

    const decision = brain.decide(observation, { explore: false, stateKey: 'duel' });
    expect(decision.actionId).toBe('attack');
    expect(decision.qValue).toBeCloseTo(after, 5);

    const other = new AgentBrain({ id: 'learner_beta', name: 'Other' });
    expect(other.getQValue('duel', 'attack')).toBe(0);
  });

  it('grows skills independently and records practice on the owner repository', () => {
    const brain = new AgentBrain({ id: 'skill_alpha', name: 'Fighter' });
    const initial = brain.getSkill('melee');
    expect(initial).toBeDefined();

    for (let i = 0; i < 20; i++) brain.practiceSkill('melee', 50);
    const trained = brain.getSkill('melee');
    expect(trained).toBeDefined();
    expect(trained!.level).toBeGreaterThan(initial!.level);
    expect(trained!.uses).toBe(initial!.uses + 20);

    const other = new AgentBrain({ id: 'skill_beta', name: 'Fighter' });
    expect(other.getSkill('melee')!.uses).toBe(0);
    expect(other.getSkill('melee')).not.toEqual(trained);

    const check = brain.useSkill('melee', 0.2);
    expect(check.agentId).toBe('skill_alpha');
    expect(check.probability).toBeGreaterThan(0);
    expect(check.probability).toBeLessThanOrEqual(1);
  });

  it('updates relationship models without sharing them between agents', () => {
    const first = new AgentBrain({ id: 'social_alpha', name: 'Alpha' });
    const second = new AgentBrain({ id: 'social_beta', name: 'Beta' });

    const relationship = first.interactWith({
      targetId: 'npc_merchant',
      trust: 0.2,
      affinity: 0.4,
      respect: 0.1,
      summary: 'Helped the merchant',
      tags: ['trade'],
    });

    expect(relationship.targetId).toBe('npc_merchant');
    expect(relationship.trust).toBeGreaterThan(0.5);
    expect(relationship.affinity).toBeGreaterThan(0);
    expect(relationship.interactions).toBe(1);
    expect(first.getRelationship('npc_merchant')).toBeDefined();
    expect(second.getRelationship('npc_merchant')).toBeUndefined();
    expect(first.getMemoryCount()).toBe(1);
    expect(second.getMemoryCount()).toBe(0);
  });

  it('serializes and restores the complete brain including private memory records', () => {
    const brain = new AgentBrain({ id: 'save_alpha', name: 'Saved Agent' });
    brain.learn({ stateKey: 'duel', actionId: 'attack', reward: 5, nextStateKey: 'duel' });
    brain.remember({ summary: 'Signed a contract', tags: ['contract'], importance: 0.7 });
    brain.learnFact('contract:accepted', true, 1, 'observation', ['contract']);
    brain.practiceSkill('melee', 40);
    brain.interactWith({ targetId: 'npc_ally', trust: 0.1, summary: 'Shared a meal' });

    const snapshot = brain.serialize();
    const parsed: unknown = JSON.parse(JSON.stringify(snapshot));
    const restored = AgentBrain.fromSnapshot(parsed as AgentSnapshot);

    expect(restored.identity).toEqual(brain.identity);
    expect(restored.personality).toEqual(brain.personality);
    expect(restored.getQValue('duel', 'attack')).toBeCloseTo(
      brain.getQValue('duel', 'attack'),
      10,
    );
    expect(restored.getSkill('melee')).toEqual(brain.getSkill('melee'));
    expect(restored.getRelationship('npc_ally')).toEqual(brain.getRelationship('npc_ally'));
    expect(restored.recall({ limit: 100 }).length).toBe(brain.getMemoryCount());
    expect(restored.memory.totalRecordCount()).toBe(brain.memory.totalRecordCount());
    expect(restored.memory).not.toBe(brain.memory);

    const tampered: AgentSnapshot = { ...snapshot, tick: snapshot.tick + 1 };
    expect(() => AgentBrain.fromSnapshot(tampered)).toThrow(/checksum/i);
  });

  it('clones a fresh agent without transferring learned behavior', () => {
    const original = new AgentBrain({ id: 'clone_alpha', name: 'Veteran' });
    original.learn({ stateKey: 'duel', actionId: 'attack', reward: 5 });
    original.practiceSkill('melee', 30);
    original.remember({ summary: 'Old memories' });

    const clone = original.clone('clone_beta');
    expect(clone.identity.id).toBe('clone_beta');
    expect(clone.personality).not.toEqual(original.personality);
    expect(clone.getQValue('duel', 'attack')).toBe(0);
    expect(clone.getSkill('melee')!.uses).toBe(0);
    expect(clone.getMemoryCount()).toBe(0);
    expect(clone.memory).not.toBe(original.memory);
    expect(() => original.clone('clone_alpha')).toThrow(/different/i);
  });

  it('manages independent agents through AgentManager and AgentRegistry alias', () => {
    const manager = new AgentManager();
    const first = manager.createAgent({ id: 'manager_a', name: 'A', archetype: 'bot' });
    const second = manager.createAgent({ id: 'manager_b', name: 'B', archetype: 'monster' });
    expect(() => manager.createAgent({ id: 'manager_a', name: 'Duplicate' })).toThrow(
      /already exists/i,
    );
    expect(first.memory).not.toBe(second.memory);
    expect(AgentRegistry).toBe(AgentManager);

    const updates = manager.updateAll(
      {
        manager_a: { health: 80, stimuli: [] },
        manager_b: { health: 50, threatLevel: 0.5, stimuli: [] },
      },
      0.1,
    );
    expect(updates.size).toBe(2);
    expect(manager.getStats().agentCount).toBe(2);
    expect(manager.getStats().archetypes.bot).toBe(1);
    expect(manager.getStats().archetypes.monster).toBe(1);

    const snapshots = manager.serializeAll();
    const restored = new AgentManager();
    const result = restored.restoreAll(snapshots);
    expect(result.restored).toBe(2);
    expect(result.skipped).toEqual([]);
    expect(restored.requireAgent('manager_a').memory).not.toBe(first.memory);
    expect(restored.requireAgent('manager_b').personality).toEqual(second.personality);

    expect(manager.clear().removed).toBe(2);
    expect(manager.size).toBe(0);
  });

  it('integrates private brains with Bot and NPC while preserving legacy AI state', () => {
    const player = new Player('player_ai', 'Hero');
    player.setPosition(10, 0, 0);

    const bot = new Bot('bot_ai', 'Grunt', 120);
    bot.setPosition(0, 0, 0);
    bot.setTarget(player);
    expect(bot.peekBrain()).toBeNull();

    const botBrain = bot.getBrain();
    expect(botBrain.identity.id).toBe('bot_ai');
    expect(botBrain.identity.archetype).toBe('bot');

    bot.update(0.1);
    expect(bot.state.aiState).toBe('chase');
    expect(bot.peekLastBrainUpdate()).not.toBeNull();
    expect(bot.peekLastBrainUpdate()!.observation.stimuli?.[0].id).toBe('player_ai');

    const decision = bot.think();
    expect(decision.agentId).toBe('bot_ai');
    const learned = bot.learnFromReward(3, 'attack');
    expect(learned.newQ).toBeGreaterThanOrEqual(0);

    const npc = new NPC('npc_ai', 'Merchant', 'Merchant');
    npc.setPosition(2, 0, 0);
    const npcBrain = npc.getBrain();
    expect(npcBrain.identity.id).toBe('npc_ai');
    expect(npcBrain.identity.archetype).toBe('npc');
    expect(npcBrain).not.toBe(botBrain);
    expect(npcBrain.memory).not.toBe(botBrain.memory);
    expect(npcBrain.personality).not.toEqual(botBrain.personality);

    npc.update(0.1);
    expect(npc.peekLastBrainUpdate()).not.toBeNull();
    expect(npc.getBrainSummary().id).toBe('npc_ai');

    const result = bot.performAgentAction('idle', 0.2);
    expect(result.agentId).toBe('bot_ai');
    expect(result.learning.newQ).toBeGreaterThanOrEqual(0);
  });

  it('keeps Monster brains and learned state independent', () => {
    const first = new Monster('monster_a', 'Grokk', 220);
    const second = new Monster('monster_b', 'Grokk', 220);

    expect(first.hasTag('monster')).toBe(true);
    expect(first.getBrain().identity.archetype).toBe('monster');
    expect(second.getBrain().identity.archetype).toBe('monster');
    expect(first.getBrain().identity.seed).not.toBe(second.getBrain().identity.seed);
    expect(first.getBrain().personality).not.toEqual(second.getBrain().personality);
    expect(first.getBrain().getSkill('melee')).not.toEqual(second.getBrain().getSkill('melee'));

    first.getBrain().remember({ summary: 'Ambushed a caravan', importance: 0.8 });
    first.update(0.1);

    expect(first.state.aiState).toBe('idle');
    expect(first.peekLastBrainUpdate()).not.toBeNull();
    expect(second.peekLastBrainUpdate()).toBeNull();
    expect(second.getBrain().getMemoryCount()).toBe(0);
    expect(first.getBrain().getMemoryCount()).toBe(1);
    expect(first.getBrain().memory).not.toBe(second.getBrain().memory);
  });

  it('keeps steering wander state per agent instead of a shared static angle', () => {
    const first: SteeringAgent = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 1, y: 0, z: 0 },
      maxSpeed: 5,
      maxForce: 1,
    };
    const second: SteeringAgent = {
      position: { x: 10, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 1 },
      maxSpeed: 5,
      maxForce: 1,
    };

    Steering.setWanderAngle(first, 0);
    Steering.setWanderAngle(second, Math.PI / 2);
    const secondBefore = Steering.getWanderAngle(second);

    for (let i = 0; i < 10; i++) Steering.wander(first);

    expect(Steering.getWanderAngle(second)).toBe(secondBefore);
    expect(Steering.getWanderAngle(first)).not.toBe(0);
    expect(Steering.getWanderAngle(first)).not.toBe(secondBefore);
    expect(Steering.resetWander(first)).toBe(true);
    expect(Steering.resetWander(first)).toBe(false);
  });

  it('stores and applies NPC system configuration', () => {
    const system = new NPCMemoryLearningSystem({
      maxMemoryPerAgent: 7,
      defaultConfidence: 0.42,
      debugLogging: true,
    });
    expect(system.getConfig().maxMemoryPerAgent).toBe(7);
    expect(system.getConfig().debugLogging).toBe(true);

    const record = system.exp_capture_experience('configured_agent', { note: 'config' });
    expect(record.confidence).toBeCloseTo(0.42, 10);

    for (let i = 0; i < 10; i++) {
      system.exp_capture_experience('configured_agent', { note: `extra-${i}` });
    }
    expect(system.checkMemoryBudget('configured_agent').withinBudget).toBe(false);
    const pruned = system.pruneAgentMemory('configured_agent');
    expect(pruned.retainedCount).toBeLessThanOrEqual(7);
    expect(system.checkMemoryBudget('configured_agent').withinBudget).toBe(true);

    const updated = system.updateConfig({ maxMemoryPerAgent: 12 });
    expect(updated.maxMemoryPerAgent).toBe(12);
    expect(system.repository.getConfig().maxMemoryPerAgent).toBe(12);
    expect(system.applyMemoryPolicy().agents).toBeGreaterThanOrEqual(1);
  });
});
