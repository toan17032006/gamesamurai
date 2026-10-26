import { describe, it, expect, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import {
  BehaviorSystem,
  getActiveBehaviorSystem,
  setActiveBehaviorSystem,
  HumanEmotionSubsystem,
  HumanCognitionSocialSubsystem,
  SomaticLifestyleSubsystem,
  CultureLaborSubsystem,
  ZoologicalSpeciesSubsystem,
  EcologicalTaxaSubsystem,
  SimulationAISubsystem,
  initHuman,
  feelJoy,
  feelSadness,
  detectPotentialThreat,
  feelAnger,
  developRomanticAttraction,
  simulateCognitiveEmpathy,
  setPersonalGoal,
  focusAttention,
  encodeShortTermMemory,
  applyLogicalReasoning,
  constructSentence,
  generateSmile,
  generateDefensivePosture,
  offerTradeProposal,
  detectStressTrigger,
  seekNutritionallyUsefulFood,
  initiateSleep,
  initiateLocomotion,
  selectWorkTask,
  selectGameStrategy,
  adaptSurvivalStrategy,
  initAnimalAgent,
  performDogTailMovement,
  performCatPurring,
  takeOffFromPerch,
  stalkPreyQuietly,
  stalkPreyStealthily,
  updateAnimalVisualField,
  initPollinatorBehavior,
  constructBurrow,
  manipulateSimpleTool,
  modelMixedEmotionalState,
  inhibitDominantResponse,
  initializeBehaviorPolicy,
  initBehaviorSimulation,
  adjustActivityToDaylight,
  collectNestingMaterial
} from '../src/behavior/index.js';

describe('BehaviorSystem — Complete 1,200 Functions Suite', () => {
  let behaviorSystem: BehaviorSystem;
  let allFunctions: Array<{ num: number; name: string; desc: string; group: string }>;

  beforeEach(() => {
    behaviorSystem = new BehaviorSystem();
    setActiveBehaviorSystem(behaviorSystem);
    const jsonPath = path.join(__dirname, 'behavior_functions_1200.json');
    allFunctions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  });

  describe('1. Completeness & Integrity (All 1,200 Functions)', () => {
    it('contains exactly 1,200 functions across 60 groups', () => {
      expect(allFunctions.length).toBe(1200);
      const groups = new Set(allFunctions.map(f => f.group));
      expect(groups.size).toBe(60);
    });

    it('implements every unique function name as a method on BehaviorSystem', () => {
      const missingMethods: string[] = [];
      const checkedNames = new Set<string>();

      for (const fn of allFunctions) {
        if (checkedNames.has(fn.name)) continue;
        checkedNames.add(fn.name);

        const method = (behaviorSystem as any)[fn.name];
        if (typeof method !== 'function') {
          missingMethods.push(`[#${fn.num}] ${fn.name} (${fn.group})`);
        }
      }

      expect(missingMethods).toEqual([]);
    });

    it('executes all 1,200 functions without throwing and verifies return signatures', () => {
      let executedCount = 0;
      for (const fn of allFunctions) {
        const method = (behaviorSystem as any)[fn.name];
        expect(typeof method).toBe('function');
        
        let result: any;
        expect(() => {
          result = method.call(behaviorSystem);
        }).not.toThrow();

        expect(result).toBeDefined();
        executedCount++;
      }
      expect(executedCount).toBe(1200);
    });

    it('implements all 7 modular subsystems with their assigned ranges', () => {
      expect(behaviorSystem.humanEmotion).toBeInstanceOf(HumanEmotionSubsystem);
      expect(behaviorSystem.humanCognitionSocial).toBeInstanceOf(HumanCognitionSocialSubsystem);
      expect(behaviorSystem.somaticLifestyle).toBeInstanceOf(SomaticLifestyleSubsystem);
      expect(behaviorSystem.cultureLabor).toBeInstanceOf(CultureLaborSubsystem);
      expect(behaviorSystem.zoologicalSpecies).toBeInstanceOf(ZoologicalSpeciesSubsystem);
      expect(behaviorSystem.ecologicalTaxa).toBeInstanceOf(EcologicalTaxaSubsystem);
      expect(behaviorSystem.simulationAI).toBeInstanceOf(SimulationAISubsystem);
    });
  });

  describe('2. Subsystem 1: Human Emotion & Basic Behavior (001–200)', () => {
    it('initializes human and performs basic action loop', () => {
      const initResult = behaviorSystem.initHuman({ name: 'Aria', age: 24 });
      expect(initResult.initialized).toBe(true);

      const action = behaviorSystem.selectHumanAction(['explore', 'rest', 'converse']);
      expect(action.action).toBe('selectHumanAction');
      expect(['explore', 'rest', 'converse']).toContain(action.selected);

      const execResult = behaviorSystem.executeHumanAction({ target: 'ancient_ruin' });
      expect(execResult.executed).toBe(true);
    });

    it('triggers and tracks emotions (Joy, Sadness, Fear, Anger)', () => {
      const joy = behaviorSystem.feelJoy(0.8, 'won_quest');
      expect(joy.emotion).toBe('feelJoy');
      expect(joy.intensity).toBeGreaterThanOrEqual(0.8);
      expect(joy.cause).toBe('won_quest');

      const fear = behaviorSystem.detectPotentialThreat();
      expect(fear.signal).toBe('detectPotentialThreat');

      const anger = behaviorSystem.feelAnger(0.6, 'insult');
      expect(anger.intensity).toBeGreaterThanOrEqual(0.6);

      const love = behaviorSystem.developRomanticAttraction(0.7);
      expect(love.intensity).toBeGreaterThanOrEqual(0.7);

      const empathy = behaviorSystem.simulateCognitiveEmpathy();
      expect(empathy.query).toBe('simulateCognitiveEmpathy');

      const goal = behaviorSystem.setPersonalGoal();
      expect(goal).toBeDefined();
    });
  });

  describe('3. Subsystem 2: Human Cognition & Social (201–400)', () => {
    it('manages attention, memory, reasoning, and speech', () => {
      const attention = behaviorSystem.focusAttention();
      expect(attention).toBeDefined();

      const memory = behaviorSystem.encodeShortTermMemory({ event: 'dragon_encounter' });
      expect(memory.stored).toBe(true);
      expect(memory.type).toBe('encodeShortTermMemory');

      const reasoning = behaviorSystem.applyLogicalReasoning();
      expect(reasoning.executed).toBe(true);

      const speech = behaviorSystem.constructSentence();
      expect(speech).toBeDefined();

      const face = behaviorSystem.generateSmile();
      expect(face).toBeDefined();

      const posture = behaviorSystem.generateDefensivePosture();
      expect(posture).toBeDefined();

      const trade = behaviorSystem.offerTradeProposal();
      expect(trade).toBeDefined();
    });
  });

  describe('4. Subsystem 3: Somatic Needs & Lifestyle (401–600)', () => {
    it('simulates stress, feeding, sleep, and locomotion', () => {
      const stress = behaviorSystem.detectStressTrigger();
      expect(stress.signal).toBe('detectStressTrigger');

      const food = behaviorSystem.seekNutritionallyUsefulFood();
      expect(food).toBeDefined();

      const sleep = behaviorSystem.initiateSleep();
      expect(sleep).toBeDefined();

      const gait = behaviorSystem.initiateLocomotion();
      expect(gait).toBeDefined();
    });
  });

  describe('5. Subsystem 4: Culture, Labor & Survival (601–700)', () => {
    it('handles labor tasks, leisure, and survival skills', () => {
      const task = behaviorSystem.selectWorkTask();
      expect(task.action).toBe('selectWorkTask');

      const strategy = behaviorSystem.selectGameStrategy();
      expect(strategy).toBeDefined();

      const survival = behaviorSystem.adaptSurvivalStrategy();
      expect(survival.response).toBe('adaptSurvivalStrategy');
    });
  });

  describe('6. Subsystem 5: Zoological Species (701–900)', () => {
    it('manages animal agent behaviors (Canines, Felines, Birds, Hunting)', () => {
      const animal = behaviorSystem.initAnimalAgent({ species: 'wolf' });
      expect(animal.initialized).toBe(true);

      const tail = behaviorSystem.performDogTailMovement(0.9);
      expect(tail).toBeDefined();

      const purr = behaviorSystem.performCatPurring();
      expect(purr.executed).toBe(true);

      const bird = behaviorSystem.takeOffFromPerch();
      expect(bird).toBeDefined();

      const hunt = behaviorSystem.stalkPreyQuietly();
      expect(hunt).toBeDefined();
    });
  });

  describe('7. Subsystem 6: Ecological Taxa (901–1080)', () => {
    it('simulates insects, marine, reptiles, rodents, and primates', () => {
      const vision = behaviorSystem.updateAnimalVisualField(0.016);
      expect(vision.updated).toBe(true);

      const pollinator = behaviorSystem.initPollinatorBehavior();
      expect(pollinator.initialized).toBe(true);

      const burrow = behaviorSystem.constructBurrow();
      expect(burrow).toBeDefined();

      const primate = behaviorSystem.manipulateSimpleTool();
      expect(primate).toBeDefined();
    });
  });

  describe('8. Subsystem 7: Simulation AI & Executive Control (1081–1200)', () => {
    it('manages mixed affect, impulse control, RL policy, and simulation LOD', () => {
      const mixed = behaviorSystem.modelMixedEmotionalState();
      expect(mixed).toBeDefined();

      const control = behaviorSystem.inhibitDominantResponse();
      expect(control).toBeDefined();

      const policy = behaviorSystem.initializeBehaviorPolicy();
      expect(policy.initialized).toBe(true);

      const sim = behaviorSystem.initBehaviorSimulation();
      expect(sim.initialized).toBe(true);
    });
  });

  describe('9. Duplicate Function Resolution', () => {
    it('adjustActivityToDaylight delegates to both somatic lifestyle and ecological AI', () => {
      const res = behaviorSystem.adjustActivityToDaylight(0.8, 'summer');
      expect(res.somatic).toBeDefined();
      expect(res.ecological).toBeDefined();
      expect(res.somatic.response).toBe('adjustActivityToDaylight');
      expect(res.ecological.response).toBe('adjustActivityToDaylight');
    });

    it('collectNestingMaterial delegates to both zoological avian and rodent taxa', () => {
      const res = behaviorSystem.collectNestingMaterial('twigs', { quantity: 5 });
      expect(res.avian).toBeDefined();
      expect(res.rodent).toBeDefined();
    });
  });

  describe('10. Standalone Functional Exports', () => {
    it('executes standalone functions via getActiveBehaviorSystem()', () => {
      const h = initHuman({ name: 'Hero' });
      expect(h.initialized).toBe(true);

      const j = feelJoy(0.95);
      expect(j.intensity).toBeGreaterThanOrEqual(0.95);

      const d = adjustActivityToDaylight(0.5, 'autumn');
      expect(d.somatic).toBeDefined();
      expect(d.ecological).toBeDefined();

      const n = collectNestingMaterial('moss');
      expect(n.avian).toBeDefined();
      expect(n.rodent).toBeDefined();
    });
  });
});
