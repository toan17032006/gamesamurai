/**
 * @file npc-system.test.ts
 * @module @aetheria/engine/tests
 * @description Comprehensive unit tests for the AI NPC Learning & Memory Engine (2,400 functions).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as NPCModule from '../src/npc/index.js';
import {
  NPCMemoryLearningSystem,
  getActiveNPCSystem,
  setActiveNPCSystem,
  resetNPCSystem,
  NPCRecord,
  ValidationResult,
  EvaluationResult,
  ComparisonResult,
  PruningResult,
  SerializedRecord
} from '../src/npc/index.js';

import functionsCatalog from './ai_npc_functions_2400.json';

interface CustomCombatAction {
  spellName: string;
  manaCost: number;
  element: 'fire' | 'ice' | 'lightning';
  targetId: string;
  critChance: number;
}

describe('AI NPC Learning & Memory Engine — Complete 2,400 Functions Suite', () => {
  let system: NPCMemoryLearningSystem;

  beforeEach(() => {
    resetNPCSystem();
    system = new NPCMemoryLearningSystem();
    setActiveNPCSystem(system);
  });

  // --------------------------------------------------------------------------
  // 1. Completeness & Integrity (All 2,400 Functions)
  // --------------------------------------------------------------------------
  describe('1. Completeness & Catalog Integrity', () => {
    it('verifies that the catalog contains exactly 24 modules and 2,400 functions', () => {
      expect(functionsCatalog.length).toBe(24);
      let total = 0;
      functionsCatalog.forEach((m: any) => {
        expect(m.functions.length).toBe(100);
        total += m.functions.length;
      });
      expect(total).toBe(2400);
    });

    it('verifies that all 2,400 functions exist on NPCMemoryLearningSystem and as standalone exports', () => {
      let missingOnClass = 0;
      let missingOnModule = 0;

      for (const mod of functionsCatalog as any[]) {
        for (const func of mod.functions) {
          const fnName = func.name;
          if (typeof (system as any)[fnName] !== 'function') {
            missingOnClass++;
          }
          if (typeof (NPCModule as any)[fnName] !== 'function') {
            missingOnModule++;
          }
        }
      }

      expect(missingOnClass).toBe(0);
      expect(missingOnModule).toBe(0);
    });

    it('executes all 2,400 methods on NPCMemoryLearningSystem without throwing exceptions', () => {
      let executed = 0;

      for (const mod of functionsCatalog as any[]) {
        for (const func of mod.functions) {
          const fnName = func.name;
          const method = (system as any)[fnName];
          expect(typeof method).toBe('function');

          const parts = fnName.split('_');
          const verb = parts[1];

          let result: any;
          if (verb === 'initialize') {
            result = method.call(system, 'agent_test_1', { initVal: 42 });
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.agentId).toBe('agent_test_1');
          } else if (verb === 'capture') {
            result = method.call(system, 'agent_test_1', { captured: true });
            expect(result).toBeDefined();
            expect(result.data.captured).toBe(true);
          } else if (verb === 'validate') {
            result = method.call(system, { sample: 100 });
            expect(result.valid).toBe(true);
          } else if (verb === 'normalize') {
            result = method.call(system, { text: '  hello  ', val: 10 });
            expect(result.text).toBe('hello');
          } else if (verb === 'update') {
            result = method.call(system, 'agent_test_1', { updated: true });
            expect(result).toBeDefined();
          } else if (verb === 'evaluate') {
            result = method.call(system, { score: 0.9, confidence: 0.85 });
            expect(result.passed).toBe(true);
          } else if (verb === 'retrieve') {
            result = method.call(system, 'agent_test_1', { limit: 5 });
            expect(Array.isArray(result)).toBe(true);
          } else if (verb === 'serialize') {
            result = method.call(system, { val: 123 });
            expect(result.checksum).toBeDefined();
            expect(result.format).toBe('json');
          } else if (verb === 'compare') {
            result = method.call(system, { a: 1 }, { a: 1 });
            expect(result.identical).toBe(true);
          } else if (verb === 'prune') {
            result = method.call(system, 'agent_test_1', { maxRecords: 50 });
            expect(result.prunedCount).toBeDefined();
          }

          executed++;
        }
      }

      expect(executed).toBe(2400);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Generic Typing <T> & Extensibility
  // --------------------------------------------------------------------------
  describe('2. Generic Typing <T> & Custom Data Structures', () => {
    it('supports custom typed actions with full type fidelity', () => {
      const customAction: CustomCombatAction = {
        spellName: 'MeteorStrike',
        manaCost: 75,
        element: 'fire',
        targetId: 'boss_hydra_3',
        critChance: 0.35
      };

      const record: NPCRecord<CustomCombatAction> = system.exp_capture_action<CustomCombatAction>(
        'mage_npc_01',
        customAction,
        { worldZone: 'VolcanoCrater' }
      );

      expect(record.agentId).toBe('mage_npc_01');
      expect(record.concept).toBe('action');
      expect(record.data.spellName).toBe('MeteorStrike');
      expect(record.data.manaCost).toBe(75);
      expect(record.data.element).toBe('fire');
      expect(record.metadata?.worldZone).toBe('VolcanoCrater');

      // Update with Partial<CustomCombatAction>
      const updated = system.exp_update_action<CustomCombatAction>('mage_npc_01', {
        manaCost: 60
      });
      expect(updated.data.manaCost).toBe(60);
      expect(updated.data.spellName).toBe('MeteorStrike');

      // Retrieve typed records
      const retrieved = system.exp_retrieve_action<CustomCombatAction>('mage_npc_01');
      expect(retrieved.length).toBeGreaterThan(0);
      expect(retrieved[0].data.spellName).toBe('MeteorStrike');
    });

    it('supports generic normalization with numeric ranges and string trimming', () => {
      const rawData = {
        name: '   Archmage Gandalf   ',
        health: 1500, // Should clamp if range max is 1000
        defense: -10  // Should clamp if range min is 0
      };

      const normalized = system.met_normalize_health_stat(rawData, {
        numericRanges: {
          health: { min: 0, max: 1000 },
          defense: { min: 0, max: 100 }
        }
      });

      expect(normalized.name).toBe('Archmage Gandalf');
      expect(normalized.health).toBe(1000);
      expect(normalized.defense).toBe(0);
    });

    it('serializes generic records with verifiable deterministic checksums', () => {
      const dataA = { questId: 'q_save_village', progress: 0.8 };
      const dataB = { questId: 'q_save_village', progress: 0.8 };

      const serA = system.exp_serialize_episode(dataA);
      const serB = system.exp_serialize_episode(dataB);

      expect(serA.checksum).toBe(serB.checksum);
      expect(serA.format).toBe('json');
      expect(JSON.parse(serA.payload)).toEqual(dataA);
    });

    it('computes deep comparison with difference tracking', () => {
      const stateA = { hp: 100, mp: 50, stance: 'aggressive' };
      const stateB = { hp: 80, mp: 50, stance: 'defensive' };

      const comparison: ComparisonResult = system.cbt_compare_defensive_stance(stateA, stateB);

      expect(comparison.identical).toBe(false);
      expect(comparison.similarity).toBeCloseTo(1 / 3, 2);
      expect(comparison.differences.length).toBe(2);

      const hpDiff = comparison.differences.find(d => d.field === 'hp');
      expect(hpDiff).toBeDefined();
      expect(hpDiff?.diff).toBe(20);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Cognitive Subsystems & Behavioral Modules
  // --------------------------------------------------------------------------
  describe('3. Core Cognitive Subsystems & Workflows', () => {
    it('manages Short-Term Memory working memory and attention queues', () => {
      system.stm_initialize_working_memory('guard_1', { capacity: 7 });
      system.stm_capture_recent_observation('guard_1', { sound: 'footsteps', volume: 0.7 });
      system.stm_capture_recent_action('guard_1', { action: 'draw_sword' });

      const memory = system.stm_retrieve_recent_action('guard_1');
      expect(memory.length).toBe(1);
      expect(memory[0].data.action).toBe('draw_sword');

      // Prune working memory
      const pruneRes = system.stm_prune_working_memory('guard_1', { maxRecords: 1 });
      expect(pruneRes.retainedCount).toBe(1);
    });

    it('handles Reinforcement Learning rewards, values and policy evaluation', () => {
      system.rl_initialize_reward_signal('thief_1', { baseReward: 0 });
      system.rl_capture_reward_signal('thief_1', { reward: 10.5, action: 'pickpocket_success' });
      system.rl_update_action_value('thief_1', { 'pickpocket': 0.85 });

      const evalRes = system.rl_evaluate_policy_evaluation({ score: 0.92, confidence: 0.9 });
      expect(evalRes.passed).toBe(true);
      expect(evalRes.confidence).toBe(0.9);
    });

    it('manages Emotion & Psychological states and triggers', () => {
      system.emo_initialize_fear_state('villager_1', { fearLevel: 0.1 });
      system.emo_update_fear_state('villager_1', { fearLevel: 0.85, cause: 'dragon_roar' });

      const state = system.emo_retrieve_fear_state('villager_1');
      expect(state[0].data.fearLevel).toBe(0.85);
      expect(state[0].data.cause).toBe('dragon_roar');

      const valRes = system.emo_validate_fear_state({ fearLevel: 0.85 }, {
        requiredFields: ['fearLevel'],
        numericRanges: { fearLevel: { min: 0, max: 1 } }
      });
      expect(valRes.valid).toBe(true);
    });

    it('tracks Combat AI attack patterns, dodge predictions and counter strategies', () => {
      system.cbt_initialize_player_attack_pattern('boss_knight', {
        comboHistory: ['slash_down', 'slash_left']
      });

      system.cbt_capture_dodge_direction('boss_knight', {
        predictedDodge: 'roll_right',
        certainty: 0.88
      });

      const pattern = system.cbt_retrieve_player_attack_pattern('boss_knight');
      expect(pattern[0].data.comboHistory).toContain('slash_down');

      const dodge = system.cbt_retrieve_dodge_direction('boss_knight');
      expect(dodge[0].data.predictedDodge).toBe('roll_right');
    });

    it('manages Governance memory budgets, safety checkpoints and limits', () => {
      system.gov_initialize_memory_budget('global_controller', { maxBytes: 1024 * 1024 * 64 });
      system.gov_capture_learning_input('global_controller', { inputRate: 120 });

      const evaluation = system.gov_evaluate_model_parameter_health({
        nanCount: 0,
        gradientNorm: 1.2,
        confidence: 0.95
      });
      expect(evaluation.passed).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Standalone Functional Exports & Subsystem Access
  // --------------------------------------------------------------------------
  describe('4. Standalone Functional Exports & Global Singleton', () => {
    it('allows direct invocation of standalone functional exports', () => {
      const rec = NPCModule.exp_capture_experience('hero_npc', { event: 'discovery' });
      expect(rec.agentId).toBe('hero_npc');

      const evalRes = NPCModule.rsn_evaluate_candidate_action({ score: 0.75 });
      expect(evalRes.passed).toBe(true);

      const norm = NPCModule.per_normalize_personality_profile({ trait: '  brave  ' });
      expect(norm.trait).toBe('brave');
    });

    it('exposes direct subsystem instances on master class', () => {
      expect(system.exp).toBeDefined();
      expect(system.stm).toBeDefined();
      expect(system.ltm).toBeDefined();
      expect(system.ret).toBeDefined();
      expect(system.met).toBeDefined();
      expect(system.out).toBeDefined();
      expect(system.rl).toBeDefined();
      expect(system.sup).toBeDefined();
      expect(system.uns).toBeDefined();
      expect(system.onl).toBeDefined();
      expect(system.emo).toBeDefined();
      expect(system.per).toBeDefined();
      expect(system.mot).toBeDefined();
      expect(system.prc).toBeDefined();
      expect(system.rsn).toBeDefined();
      expect(system.pln).toBeDefined();
      expect(system.skl).toBeDefined();
      expect(system.rel).toBeDefined();
      expect(system.soc).toBeDefined();
      expect(system.cbt).toBeDefined();
      expect(system.wrl).toBeDefined();
      expect(system.eva).toBeDefined();
      expect(system.pst).toBeDefined();
      expect(system.gov).toBeDefined();
    });
  });
});
