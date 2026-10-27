/**
 * @file simulation.ts
 * @module @aetheria/engine/life/simulation
 * @description Facade thống nhất cho toàn bộ hệ sinh thái sống: vòng đời – bệnh
 * tật – nhu cầu – cảm xúc – bản đồ nhận thức – suy nghĩ – học sâu – nghiên cứu
 * – di sản – văn minh. Mỗi thực thể có bộ não DQN, kho tri thức riêng, nhu cầu
 * Maslow và dòng suy nghĩ nội tâm; các sự kiện sinh tử được nối với di chúc,
 * đau buồn và tiến trình văn minh.
 */

import { clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import {
  NeuralAgentBrain,
  type NeuralLearningResult,
  type NeuralObservation,
  type NeuralThought,
} from '../deeplearning/neural-agent.js';
import {
  DEATH_CAUSE_LABELS,
  LifecycleEngine,
  type BirthResult,
  type CreateLifeInput,
  type DeathCause,
  type DeathEvent,
  type LifeHistory,
  type MatingOutcome,
} from './lifecycle.js';
import { DiseaseEngine } from './disease.js';
import { DEFAULT_NEEDS, NeedsModel, type NeedId } from './needs.js';
import { LegacyEngine, type Beneficiary, type InheritanceResult, type Will } from './legacy.js';
import type { LifeRandom } from './stochastic.js';
import { LifeRandom as LifeRandomImpl } from './stochastic.js';
import {
  MedicineEngine,
  type HealerProfile,
  type SkillLearningResult,
  type TreatmentOutcome,
} from './medicine.js';
import {
  PersonalityEngine,
  derivePersonalityFromTraits,
  type ExperienceKind,
  type PersonalityRecord,
} from './personality.js';
import {
  NutritionEngine,
  type FoodItem,
  type MealResult,
  type MetabolicProfile,
  type NutritionState,
  type TasteProfile,
} from './nutrition.js';
import {
  DespairEngine,
  evaluateAntisocialAct,
  performAntisocialAct,
  type AntisocialAct,
  type AntisocialOutcome,
  type DespairState,
  type SuicideRisk,
} from './darkside.js';
import {
  EvolutionEngine,
  type FitnessReport,
  type SelectionPressure,
  type SelectionReport,
  type SpeciesProfile,
  type SpeciationEvent,
} from './evolution.js';
import {
  Archetype,
  ArchetypeState,
  DEFAULT_ARCHETYPES,
  archetypeById,
  archetypeLearn as runArchetypeLearn,
  createArchetypeState,
  suggestArchetype,
  type LearningTopic,
} from './archetype.js';
import {
  Appearance,
  describeAppearance,
  expressAppearance,
  infantAppearance,
  recombineAppearanceLoci,
  writeAppearanceLoci,
  type AppearanceLocus,
} from './appearance.js';
import {
  SkillForge,
  type ForgeAttempt,
  type ForgeSessionResult,
  type ForgeProfile,
} from '../knowledge/skill-forge.js';
import { simulateLabAccident, type LabAccident } from '../knowledge/research.js';
import {
  DEFAULT_EMOTIONAL_PERSONALITY,
  EmotionEngine,
  type EmotionalPersonality,
  type EmotionName,
  type EmotionSnapshot,
} from '../psychology/emotions.js';
import { CognitiveMap, type CognitiveRoute, type PlaceInput } from '../psychology/cognitive-map.js';
import { ThoughtEngine, type Thought } from '../psychology/thought.js';
import type { KnowledgeBase } from '../knowledge/knowledge-base.js';
import { createKnowledgeBase } from '../knowledge/knowledge-base.js';
import { createTechTree, type TechTree } from '../knowledge/tech-tree.js';
import {
  ResearchEngine,
  type DiscoveryResult,
  type InventionAttempt,
  type ResearchCycleResult,
  type ResearchStats,
} from '../knowledge/research.js';
import {
  Civilization,
  CivilizationEngine,
  type CivilizationContext,
  type CivilizationReport,
} from '../civilization/civilization.js';
import { Settlement, type BuildingType, type SettlementReport } from '../civilization/settlement.js';
import type { KnowledgeDomain } from '../knowledge/knowledge-base.js';

/** Kênh cảm xúc đưa vào bộ não học sâu. */
export const LIFE_EMOTION_CHANNELS: readonly EmotionName[] = Object.freeze([
  'joy',
  'fear',
  'anger',
  'sadness',
  'love',
  'grief',
  'pride',
  'shame',
  'guilt',
  'gratitude',
  'curiosity',
  'envy',
  'romanticJealousy',
  'heartbreak',
  'nostalgia',
  'bloodlust',
  'eureka',
  'maternalHeroism',
]);

/** Đặc trưng trạng thái cố định của bộ não sinh mệnh. */
export const LIFE_STATE_KEYS: readonly string[] = Object.freeze([
  ...DEFAULT_NEEDS.map((need) => need.id),
  ...LIFE_EMOTION_CHANNELS,
  'health',
  'age',
  'foodSecurity',
  'waterSecurity',
  'wealth',
  'security',
  'socialSupport',
]);

/** Hành động khả dụng của một sinh mệnh. */
export const LIFE_ACTIONS: readonly string[] = Object.freeze([
  'eat',
  'drink',
  'sleep',
  'seek_shelter',
  'socialize',
  'explore',
  'research',
  'invent',
  'reproduce',
  'rest',
  'flee',
  'fight',
  'care_for_child',
  'work',
  'cook',
  'steal_food',
  'vandalize',
]);

/** Trạng thái mô phỏng của một thực thể. */
export interface EntitySimulationState {
  being: LifeHistory;
  needs: NeedsModel;
  brain: NeuralAgentBrain;
  map: CognitiveMap;
  thoughts: ThoughtEngine;
  personality: EmotionalPersonality;
  /** Ngoại hình DNA + tham số render theo giai đoạn đời. */
  appearance?: Appearance;
  /** Nghiệp chủng (lớp tồn tại) + trạng thái học theo kênh. */
  archetype?: Archetype;
  archetypeState?: ArchetypeState;
}

/** Tuỳ chọn sinh ra một thực thể. */
export interface SpawnOptions extends CreateLifeInput {
  personality?: Partial<EmotionalPersonality>;
  needs?: Partial<Record<NeedId, number>>;
  startingKnowledge?: Record<string, number>;
  /** Cộng dân số vào khu định cư chính (mặc định true). */
  countInSettlement?: boolean;
  /** Loài nền (người/động vật/quái vật/quái nhân…). */
  kind?: import('./appearance.js').BeingKind;
  /** Ép nghiệp chủng theo id; bỏ trống sẽ tự đề xuất. */
  archetypeId?: string;
  /** Cho phép đề xuất archetype có phép. */
  allowMagic?: boolean;
}

/** Cấu hình mô phỏng. */
export interface LifeSimulationConfig {
  seed?: number | string;
  startYear?: number;
  civilizationName?: string;
  settlementName?: string;
  initialPopulation?: number;
  taxRate?: number;
  knowledge?: KnowledgeBase;
  techTree?: TechTree;
  civilization?: Civilization;
}

/** Bối cảnh một tick mô phỏng. */
export interface LifeSimulationContext {
  food?: number;
  water?: number;
  shelter?: number;
  harvestMultiplier?: number;
  epidemicSeverity?: number;
  warSeverity?: number;
  tradeBonus?: number;
  threat?: number;
  contactRate?: number;
  innovation?: number;
  corruptionPressure?: number;
  /** Xác suất phơi nhiễm bệnh mỗi tick. */
  diseasePressure?: number;
  random?: LifeRandom;
}

/** Báo cáo mô phỏng. */
export interface LifeSimulationReport {
  year: number;
  populationAlive: number;
  births: number;
  deaths: number;
  averageHappiness: number;
  averageHealth: number;
  civilization: CivilizationReport;
  research: ResearchStats;
  recentEvents: string[];
}

/** Kết quả một hành động. */
export interface LifeActionResult {
  action: string;
  reward: number;
  satisfactionDelta: number;
  happiness: number;
  learning: NeuralLearningResult;
}

const PERSON_NAMES: readonly string[] = Object.freeze([
  'An',
  'Bình',
  'Chi',
  'Dũng',
  'Giang',
  'Hà',
  'Hùng',
  'Lan',
  'Linh',
  'Mai',
  'Minh',
  'Nam',
  'Nga',
  'Phong',
  'Quân',
  'Sơn',
  'Trang',
  'Tú',
  'Vy',
  'Yến',
]);

/** Facade mô phỏng sinh mệnh – tâm lý – tri thức – văn minh. */
export class LifeSimulation {
  public readonly lifecycle = new LifecycleEngine();
  public readonly disease = new DiseaseEngine();
  public readonly legacy = new LegacyEngine();
  public readonly emotions = new EmotionEngine();
  public readonly medicine: MedicineEngine;
  public readonly evolution: EvolutionEngine;
  public readonly skillForge: SkillForge;
  public readonly personalityEngine: PersonalityEngine;
  public readonly nutrition: NutritionEngine;
  public readonly despair: DespairEngine;
  public readonly brainEngine = new CivilizationEngine();
  public readonly civilization: Civilization;
  public readonly research: ResearchEngine;
  public readonly states = new Map<string, EntitySimulationState>();
  public readonly seed: number | string;
  public readonly history: string[] = [];

  private readonly random: LifeRandomImpl;
  private nameCounter = 0;
  private labCounter = 0;

  constructor(config: LifeSimulationConfig = {}) {
    this.seed = config.seed ?? 'aetheria-life';
    this.random = new LifeRandomImpl(this.seed);
    this.medicine = new MedicineEngine({ seed: `${this.seed}:medicine` });
    this.evolution = new EvolutionEngine({ seed: `${this.seed}:evolution` });
    this.skillForge = new SkillForge({ seed: `${this.seed}:forge` });
    this.personalityEngine = new PersonalityEngine({ seed: `${this.seed}:personality` });
    this.nutrition = new NutritionEngine({ seed: `${this.seed}:nutrition` });
    this.despair = new DespairEngine({ seed: `${this.seed}:despair` });
    this.lifecycle.year = Math.max(0, config.startYear ?? 0);

    const knowledge = config.knowledge ?? createKnowledgeBase(this.seed);
    const techTree = config.techTree ?? createTechTree();
    if (config.civilization) {
      this.civilization = config.civilization;
    } else {
      const settlement = new Settlement({
        id: `${config.civilizationName ?? 'aetheria'}_capital`,
        name: config.settlementName ?? 'Làng Khởi Nguyên',
        population: Math.max(1, config.initialPopulation ?? 20),
        taxRate: config.taxRate ?? 0.12,
        seed: this.seed,
      });
      this.civilization = this.brainEngine.create({
        id: config.civilizationName ?? 'aetheria',
        name: config.civilizationName ?? 'Aetheria',
        seed: this.seed,
        knowledge,
        techTree,
        settlements: [settlement],
      });
    }
    this.research = new ResearchEngine(this.civilization.knowledge, this.civilization.techTree, this.seed);
    this.history.push(`Năm ${this.lifecycle.year}: ${this.civilization.name} hình thành với ${this.civilization.population} dân.`);
  }

  /** Khu định cư chính. */
  public get primarySettlement(): Settlement | undefined {
    return [...this.civilization.settlements.values()][0];
  }

  /** Tạo một thực thể và gắn toàn bộ hệ thống con. */
  public spawn(options: SpawnOptions): EntitySimulationState {
    const being = this.lifecycle.create(options);
    const state = this.attach(being, options);
    if (options.countInSettlement ?? true) {
      this.primarySettlement?.addPopulation(1, `cư dân ${being.name}`);
    }
    return state;
  }

  /** Gắn hệ thống con vào một sinh mệnh đã tồn tại (dùng cho trẻ mới sinh). */
  public attach(being: LifeHistory, options: Partial<SpawnOptions> = {}): EntitySimulationState {
    const existing = this.states.get(being.id);
    if (existing) return existing;
    // Tính cách khởi đầu: từ đặc trưng di truyền nếu không chỉ định — không ai giống ai.
    const personality: EmotionalPersonality = options.personality
      ? { ...DEFAULT_EMOTIONAL_PERSONALITY, ...options.personality }
      : derivePersonalityFromTraits(being.traits, `${being.genome.id}:personality`);
    this.personalityEngine.profileOf(being.id, personality, being.genome);
    // Dinh dưỡng: hồ sơ chuyển hoá + khẩu vị riêng của chủ thể.
    this.nutrition.stateOf(being.id, being.genome, being.traits);
    this.nutrition.tasteOf(being.id, being.genome);
    const needs = new NeedsModel(`${being.id}:needs`, options.needs ?? {});
    this.emotions.create(being.id, personality);
    const thoughts = new ThoughtEngine();
    const map = new CognitiveMap();
    map.learnPlace({
      id: 'home',
      name: 'Nhà',
      position: { x: 0, y: 0, z: 0 },
      type: 'home',
      salience: 0.8,
      note: 'nơi ta sinh ra',
    });
    const brain = new NeuralAgentBrain({
      id: being.id,
      stateKeys: LIFE_STATE_KEYS,
      actions: LIFE_ACTIONS,
      hiddenSizes: [48, 32],
      seed: hashSeed(`${being.genome.id}:${this.seed}`),
      curiosity: clamp01(0.2 + (being.traits.curiosity ?? 40) / 200),
    });
    thoughts.learnBelief('Ta đang sống và cần học cách tồn tại.', 0.8, 'tự nhận thức');
    thoughts.learnBelief('Cái chết là điều không thể tránh khỏi.', 0.6, 'kinh nghiệm cộng đồng');
    if (options.startingKnowledge) {
      for (const [knowledgeId, mastery] of Object.entries(options.startingKnowledge)) {
        this.civilization.knowledge.grant(being.id, knowledgeId, mastery);
      }
    }
    // Ngoại hình DNA: biểu hiện từ bộ gen, biến đổi theo giai đoạn đời.
    const appearance = expressAppearance(being.genome, {
      beingId: being.id,
      kind: options.kind ?? 'human',
      sex: being.sex,
      ageYears: being.ageYears,
      longevityYears: Math.max(1, being.traits.longevity ?? 72),
      nutrition: clamp01(0.6 + being.health / 250),
      traits: being.traits,
      stage: being.stage,
    });
    // Nghiệp chủng: chỉ định hoặc tự đề xuất từ loài nền + đặc điểm gen.
    const archetype = options.archetypeId
      ? archetypeById(options.archetypeId)
      : suggestArchetype(options.kind ?? 'human', being.traits, {
          random: new LifeRandomImpl(`${being.id}:archetype`),
          allowMagic: options.allowMagic ?? true,
        });
    const archetypeState = createArchetypeState(being.id, archetype);
    // Đăng ký loài vào động cơ tiến hoá nếu chưa có.
    if (!this.evolution.species.has(being.species)) {
      this.evolution.registerSpecies(being.species, being.species, being.genome, {
        year: this.lifecycle.year,
        population: 0,
      });
    }
    this.evolution.recordBirth(being.species, being.genome);
    const state: EntitySimulationState = {
      being,
      needs,
      brain,
      map,
      thoughts,
      personality,
      appearance,
      archetype,
      archetypeState,
    };
    this.states.set(being.id, state);
    return state;
  }

  /** Tạo một dân số ban đầu với tuổi và giới tính ngẫu nhiên có seed. */
  public seedPopulation(count: number, options: Partial<SpawnOptions> = {}): EntitySimulationState[] {
    const created: EntitySimulationState[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(count)); i++) {
      const name = PERSON_NAMES[this.nameCounter % PERSON_NAMES.length];
      const id = `being_${++this.nameCounter}_${name.toLowerCase()}`;
      const age = options.ageYears ?? this.random.range(0, 45);
      const state = this.spawn({
        ...options,
        id,
        name: `${name} ${this.nameCounter}`,
        ageYears: age,
        sex: options.sex ?? (this.random.chance(0.5) ? 'female' : 'male'),
        countInSettlement: false,
      });
      created.push(state);
    }
    if (created.length > 0) {
      this.primarySettlement?.addPopulation(created.length, 'dân định cư ban đầu');
      this.history.push(`Năm ${this.lifecycle.year}: ${created.length} cư dân đầu tiên xuất hiện.`);
    }
    return created;
  }

  /** Lấy trạng thái thực thể. */
  public stateOf(entityId: string): EntitySimulationState | undefined {
    return this.states.get(entityId);
  }

  /** Danh sách thực thể còn sống. */
  public living(): EntitySimulationState[] {
    return [...this.states.values()].filter((state) => state.being.alive);
  }

  /** Chọn hành động và sinh suy nghĩ nội tâm. */
  public decide(entityId: string, explore = true): NeuralThought {
    const state = this.requireState(entityId);
    const observation = this.observationFor(state);
    const neural = state.brain.think(observation, explore);
    const emotions = this.emotions.snapshot(entityId);
    const thought = state.thoughts.think({
      perception: `thế giới quanh ${this.civilization.name}`,
      dominantNeed: neural.dominantNeed ?? undefined,
      dominantEmotion: neural.dominantEmotion ?? undefined,
      mood: emotions.mood,
      stress: emotions.stress,
      problem: `chọn hành động ${neural.action}`,
      options: [...LIFE_ACTIONS.slice(0, 4)],
    });
    return { ...neural, thought: thought.content };
  }

  /** Thực hiện hành động, cập nhật nhu cầu/cảm xúc/tính cách và huấn luyện bộ não. */
  public act(
    entityId: string,
    action: string,
    options: {
      reward?: number;
      facts?: ReadonlyArray<{ subject: string; relation: string; object: string; confidence?: number }>;
      done?: boolean;
      targetId?: string;
    } = {},
  ): LifeActionResult {
    const state = this.requireState(entityId);
    const before = state.needs.happiness();
    this.applyAction(state, action, options.targetId);
    const after = state.needs.happiness();
    const reward = options.reward ?? (after - before) / 100;
    this.recordActionExperience(state, action, after - before);
    const learning = state.brain.learn(reward, this.observationFor(state), options.done ?? false, options.facts ?? []);
    this.history.push(`${state.being.name} thực hiện ${action} (thưởng ${reward.toFixed(2)}).`);
    if (this.history.length > 2000) this.history.splice(0, this.history.length - 2000);
    return {
      action,
      reward,
      satisfactionDelta: after - before,
      happiness: after,
      learning,
    };
  }

  /** Một năm mô phỏng: vòng đời, bệnh tật, nhu cầu, cảm xúc, suy nghĩ, văn minh. */
  public tick(years = 1, context: LifeSimulationContext = {}): LifeSimulationReport {
    const elapsed = clampRange(years, 0, 200);
    if (elapsed <= 0) return this.report();
    const days = elapsed * 365;
    const deathsBefore = this.lifecycle.deathEvents.length;
    const birthsBefore = this.countBirths();
    const yearBefore = this.lifecycle.year;
    const random = context.random ?? this.random;

    for (const state of this.states.values()) {
      const being = state.being;
      if (!being.alive) continue;
      const hunger = state.needs.urgencyOf('hunger');
      const thirst = state.needs.urgencyOf('thirst');
      const shelterNeed = state.needs.urgencyOf('shelter');
      const foodQuality = clamp01(context.food ?? 1 - hunger / 110);
      const waterQuality = clamp01(context.water ?? 1 - thirst / 110);
      const shelterQuality = clamp01(context.shelter ?? 1 - shelterNeed / 120);
      const infections = this.disease.activeInfections(being.id);
      const diseaseSeverity = infections.reduce(
        (max, infection) => Math.max(max, infection.phase === 'infectious' ? infection.severity : 0),
        0,
      );
      const updateRandom = new LifeRandomImpl(`${being.id}:${yearBefore}:tick`);
      this.lifecycle.tick(being, elapsed, {
        food: foodQuality,
        water: waterQuality,
        shelter: shelterQuality,
        diseaseSeverity,
        random: updateRandom,
        witnesses: being.children.filter((childId) => this.states.get(childId)?.being.alive),
      });

      // Tính cách trôi về mức nền di truyền sau mỗi năm sống — chọn lọc bản chất.
      if (being.alive) {
        this.personalityEngine.annualDecay(being.id, derivePersonalityFromTraits(being.traits, `${being.genome.id}:personality`));
      }

      const diseaseContext = {
        immunity: clamp01(
          infections.reduce((max, infection) => Math.max(max, this.disease.immunityLevel(being.id, infection.diseaseId)), 0),
        ),
        ageYears: being.ageYears,
        nutrition: foodQuality,
        treatment: 0.4,
        comorbidity: diseaseSeverity,
      };
      for (const infection of infections) {
        this.disease.progress(infection, days, diseaseContext);
        if (infection.phase === 'dead' && being.alive) {
          this.lifecycle.die(being, 'disease', {
            witnesses: being.children.filter((childId) => this.states.get(childId)?.being.alive),
          });
          this.recordDeath(being, 'disease');
        }
      }

      // Phơi nhiễm bệnh ngẫu nhiên theo mật độ và vệ sinh khu định cư.
      const settlement = this.primarySettlement;
      const sanitation = settlement?.sanitation ?? 30;
      const exposureChance = clamp01((context.diseasePressure ?? 0.01) * (1.5 - sanitation / 100));
      if (being.alive && random.chance(exposureChance)) {
        const diseases = [...this.disease.definitions.keys()];
        const diseaseId = diseases[random.int(0, Math.max(0, diseases.length - 1))];
        if (diseaseId) {
          const exposed = this.disease.expose(being.id, diseaseId, { random });
          if (exposed) {
            state.thoughts.learnBelief(`Ta có thể đã nhiễm ${diseaseId}.`, 0.4, 'triệu chứng');
            this.emotions.trigger(being.id, 'anxiety', 0.35, 'nguy cơ bệnh tật');
          }
        }
      }

      if (being.alive) {
        // Nhu cầu chỉ mô phỏng tối đa 30 ngày mỗi tick để tránh bão hoà phi thực tế.
        const needDays = Math.min(days, 30);
        state.needs.tick(needDays, {
          food: foodQuality * 100,
          water: waterQuality * 100,
          sleepQuality: clamp01(context.shelter ?? 0.7) * 80,
        });

        // Dinh dưỡng agentic: hao hụt theo chuyển hoá riêng từng chủ thể.
        const nutritionResult = this.nutrition.tick(being.id, needDays / 6, being.genome, being.traits, {
          activityLevel: 0.5,
          ate: state.needs.urgencyOf('hunger') < 60,
          drank: state.needs.urgencyOf('thirst') < 60,
        });
        if (nutritionResult.healthDamage > 0) {
          being.health = Math.max(0, being.health - nutritionResult.healthDamage);
        }
        if (nutritionResult.starving) {
          this.despair.recordSuffering(being.id, 'starvation', clamp01(0.3 + nutritionResult.healthDamage / 40), yearBefore);
        }
        if (nutritionResult.dehydrated) {
          this.despair.recordSuffering(being.id, 'dehydration', clamp01(0.4 + nutritionResult.healthDamage / 40), yearBefore);
        }

        // Tuyệt vọng: các nỗi đau khác tích luỹ, nguy cơ tự kết thúc không bị che.
        const personalityNow = this.personalityEngine.personalityOf(being.id) ?? state.personality;
        const socialSupport =
          (100 - state.needs.urgencyOf('isolationFear') + 100 - state.needs.urgencyOf('friendship')) / 200;
        const suicideRisk = this.despair.tick(
          being.id,
          { neuroticism: personalityNow.neuroticism, resilience: personalityNow.resilience, willpower: being.traits.willpower, empathy: personalityNow.empathy },
          { socialSupport, years: elapsed },
        );
        if (suicideRisk.critical && random.chance(clamp01(suicideRisk.risk * 0.25))) {
          const attempt = this.despair.attemptSuicide(being.id, yearBefore, {
            willpower: clamp01((being.traits.willpower ?? 50) / 100),
            health: being.health,
            random: updateRandom,
          });
          if (attempt.survived) {
            being.health = Math.max(1, being.health - attempt.selfDamage);
            being.trauma = clampRange(being.trauma + 30, 0, 100);
            state.thoughts.learnBelief('Ta đã đứng ở bờ vực và quay lại.', 0.9, 'chấn tâm');
            this.emotions.trigger(being.id, 'sadness', 0.6, 'sống sót sau tuyệt vọng');
          } else {
            this.lifecycle.die(being, 'suicide', {
              witnesses: being.children.filter((childId) => this.states.get(childId)?.being.alive),
            });
            this.recordDeath(being, 'suicide');
            this.history.push(`Năm ${yearBefore}: ${being.name} ${attempt.note}.`);
          }
        }
        this.emotions.decay(being.id, Math.min(days, 7));
        state.map.decay(Math.min(days, 30));

        const snapshot = this.emotions.snapshot(being.id);
        state.thoughts.think({
          dominantNeed: state.needs.dominantNeed()?.id ?? undefined,
          dominantEmotion: snapshot.dominant,
          mood: snapshot.mood,
          stress: snapshot.stress,
          problem: being.health < 40 ? 'sức khoẻ suy giảm' : undefined,
        });

        // Bộ não học từ phần thưởng sinh tồn: hạnh phúc, sức khoẻ và an toàn.
        const observation = this.observationFor(state);
        const neural = state.brain.think(observation, true);
        const reward =
          (state.needs.happiness() - 50) / 100 +
          (being.health - 50) / 200 +
          (snapshot.mood + 1) / 10 +
          (neural.intrinsicReward > 0.1 ? 0.05 : 0);
        state.brain.learn(reward, observation, false, [
          {
            subject: being.id,
            relation: 'đang ở',
            object: this.civilization.name,
            confidence: 0.9,
          },
          {
            subject: being.id,
            relation: 'có nhu cầu',
            object: neural.dominantNeed ?? 'sinh tồn',
            confidence: 0.7,
          },
        ]);
        if (being.health < 35) this.emotions.trigger(being.id, 'fear', 0.3, 'sức khoẻ yếu');
      } else {
        this.recordDeath(being, being.deathCause ?? 'unknown');
      }
    }

    this.lifecycle.year = yearBefore + elapsed;
    this.civilization.tick(elapsed, this.civilizationContext(context));
    this.research.year = this.lifecycle.year;
    this.civilization.knowledge.decayAll(0.001 * elapsed);
    this.civilization.knowledge.updateDiffusion(Math.max(1, this.civilization.population));

    const recentlyDead = this.lifecycle.deathEvents.slice(deathsBefore);
    for (const death of recentlyDead) {
      const victim = this.states.get(death.entityId);
      if (victim) this.mournForSurvivors(victim, death);
    }

    const births = this.countBirths() - birthsBefore;
    if (births > 0) this.history.push(`Năm ${this.lifecycle.year}: ${births} trẻ chào đời.`);
    if (recentlyDead.length > 0) {
      this.history.push(`Năm ${this.lifecycle.year}: ${recentlyDead.length} người qua đời.`);
    }
    if (this.history.length > 2000) this.history.splice(0, this.history.length - 2000);
    return this.report();
  }

  /** Giao phối có kiểm tra tương thích, di truyền và thụ thai. */
  public mate(aId: string, bId: string, options: { conceptionChance?: number } = {}): MatingOutcome {
    const a = this.requireState(aId);
    const b = this.requireState(bId);
    const outcome = this.lifecycle.mate(a.being, b.being, {
      seed: `${aId}:${bId}:${this.lifecycle.year}`,
      conceptionChance: options.conceptionChance,
      random: new LifeRandomImpl(`${aId}:${bId}:${this.lifecycle.year}:mate`),
    });
    if (outcome.success) {
      a.needs.applyEvent({ type: 'romance', intensity: 35 });
      b.needs.applyEvent({ type: 'romance', intensity: 35 });
      this.emotions.trigger(aId, 'love', 0.7, `kết đôi với ${b.being.name}`);
      this.emotions.trigger(bId, 'love', 0.7, `kết đôi với ${a.being.name}`);
      a.thoughts.learnBelief(`${b.being.name} là bạn đời của ta.`, 0.8, 'giao phối');
      b.thoughts.learnBelief(`${a.being.name} là bạn đời của ta.`, 0.8, 'giao phối');
    }
    return outcome;
  }

  /** Sinh con từ thai kỳ hiện tại; ngoại hình trẻ được tái tổ hợp từ hai bố mẹ. */
  public giveBirth(motherId: string, fatherId?: string): BirthResult | null {
    const mother = this.requireState(motherId);
    const father = fatherId ? this.states.get(fatherId) : undefined;
    const result = this.lifecycle.giveBirth(mother.being, fatherId);
    if (!result) return null;
    // Trẻ không được giống hệt ai: tái tổ hợp locus ngoại hình + đột biến.
    const motherLoci = mother.appearance?.loci;
    const fatherLoci = father?.appearance?.loci;
    if (motherLoci && fatherLoci) {
      const childLoci = recombineAppearanceLoci(motherLoci, fatherLoci, `${result.child.genome.id}:appearance`);
      result.child.genome = writeAppearanceLoci(result.child.genome, childLoci, `${result.child.genome.id}:write`);
    }
    const child = this.attach(result.child, {
      kind: mother.appearance?.kind,
    });
    const settlement = this.primarySettlement;
    settlement?.addPopulation(1, 'sinh nở');
    mother.needs.applyEvent({ type: 'birth', intensity: 50 });
    this.personalityEngine.recordExperience(
      motherId,
      this.personalityEngine.personalityOf(motherId) ?? mother.personality,
      { kind: 'childbirth', intensity: 0.8, year: this.lifecycle.year },
      { ageYears: mother.being.ageYears, lifespanYears: this.lifecycle.lifespanOf(mother.being), willpower: mother.being.traits.willpower },
    );
    this.emotions.trigger(motherId, 'joy', 0.8, 'sinh con');
    this.emotions.trigger(motherId, 'maternalHeroism', 0.5, 'con chào đời');
    if (fatherId) {
      const fatherState = this.states.get(fatherId);
      if (fatherState) {
        fatherState.needs.applyEvent({ type: 'birth', intensity: 40 });
        this.emotions.trigger(fatherId, 'pride', 0.6, 'con chào đời');
      }
    }
    child.thoughts.learnBelief('Ta vừa chào đời trong một thế giới rộng lớn.', 0.5, 'sinh ra');
    const appearanceNote = child.appearance ? ` (${describeAppearance(child.appearance)})` : '';
    this.history.push(`Năm ${this.lifecycle.year}: ${result.child.name} chào đời${appearanceNote}.`);
    return result;
  }

  /** Giết một thực thể và ghi lại suy nghĩ cuối đời, đau buồn và di sản. */
  public kill(victimId: string, killerId?: string, cause: DeathCause = 'violence'): DeathEvent {
    const victim = this.requireState(victimId);
    const death = killerId
      ? this.lifecycle.kill(victim.being, killerId, { cause })
      : this.lifecycle.die(victim.being, cause);
    this.recordDeath(victim.being, cause);
    if (killerId) {
      const killer = this.states.get(killerId);
      if (killer) {
        killer.needs.applyEvent({ type: 'danger', intensity: 30 });
        this.emotions.trigger(killerId, 'bloodlust', 0.5, `giết ${victim.being.name}`);
        this.emotions.trigger(killerId, 'guilt', 0.35, `giết ${victim.being.name}`);
        killer.thoughts.moral(
          `giết ${victim.being.name}`,
          'Ta đã lấy đi một mạng sống; điều này sẽ theo ta mãi.',
          0.7,
        );
        killer.brain.learnFact(killerId, 'đã giết', victimId, 1);
        this.personalityEngine.recordExperience(
          killerId,
          this.personalityEngine.personalityOf(killerId) ?? killer.personality,
          { kind: 'combat', intensity: 0.7, year: this.lifecycle.year },
          { ageYears: killer.being.ageYears, lifespanYears: this.lifecycle.lifespanOf(killer.being), willpower: killer.being.traits.willpower },
        );
      }
    }
    return death;
  }

  /** Bắt đầu đau buồn cho người ở lại. */
  public mourn(entityId: string, deceasedId: string): void {
    const deceased = this.states.get(deceasedId);
    this.legacy.mourn(entityId, deceasedId, deceased?.being.deathCause ?? 'unknown', [
      `kỷ niệm về ${deceased?.being.name ?? deceasedId}`,
    ]);
    this.emotions.trigger(entityId, 'grief', 0.8, `mất ${deceased?.being.name ?? deceasedId}`);
    this.emotions.trigger(entityId, 'sadness', 0.7, `mất ${deceased?.being.name ?? deceasedId}`);
    this.states.get(entityId)?.needs.applyEvent({ type: 'friend_death', intensity: 60 });
    const mourner = this.states.get(entityId);
    if (mourner) {
      this.personalityEngine.recordExperience(
        entityId,
        this.personalityEngine.personalityOf(entityId) ?? mourner.personality,
        { kind: 'bereavement', intensity: 0.7, year: this.lifecycle.year },
        { ageYears: mourner.being.ageYears, lifespanYears: this.lifecycle.lifespanOf(mourner.being), willpower: mourner.being.traits.willpower },
      );
    }
  }

  /** Viết di chúc cho một thực thể. */
  public writeWill(
    entityId: string,
    beneficiaries: Beneficiary[],
    options: { debts?: number; knowledgeBequests?: Will['knowledgeBequests'] } = {},
  ): Will {
    return this.legacy.writeWill(entityId, beneficiaries, options);
  }

  /** Phân chia di sản; nếu không có người thừa kế chỉ định thì dùng luật mặc định. */
  public inherit(deceasedId: string, heirs?: Beneficiary[]): InheritanceResult | null {
    const beneficiaries = heirs ?? this.legacy.intestateHeirs(deceasedId);
    if (beneficiaries.length === 0) return null;
    const result = this.legacy.probate(deceasedId, beneficiaries);
    this.history.push(`Năm ${this.lifecycle.year}: di sản của ${deceasedId} được chia cho ${beneficiaries.length} người.`);
    return result;
  }

  /** Truyền tri thức từ người này sang người khác. */
  public teach(teacherId: string, studentId: string, knowledgeId: string, quality = 0.7): number {
    const result = this.civilization.knowledge.teach(teacherId, studentId, knowledgeId, {
      quality,
      random: new LifeRandomImpl(`${teacherId}:${studentId}:${knowledgeId}`),
    });
    if (result.transferred > 0) {
      this.emotions.trigger(studentId, 'gratitude', 0.35, `học từ ${teacherId}`);
      this.states.get(teacherId)?.needs.applyEvent({ type: 'success', intensity: 20 });
    }
    return result.transferred;
  }

  /** Khám phá tri thức mới trong một miền. */
  public discover(entityId: string, domain: KnowledgeDomain, effort = 1): DiscoveryResult {
    const state = this.requireState(entityId);
    const result = this.research.discover(entityId, domain, effort, {
      intelligence: clamp01((state.being.traits.intelligence ?? 100) / 200),
      curiosity: clamp01((state.being.traits.curiosity ?? 50) / 100),
      year: this.lifecycle.year,
    });
    if (result.discovered && result.knowledge) {
      state.needs.applyEvent({ type: 'discovery', intensity: 45 });
      this.emotions.eureka(entityId, result.novelty, 0.7, `khám phá ${result.knowledge.name}`);
      state.thoughts.learnBelief(`Ta đã khám phá ${result.knowledge.name}.`, 0.8, 'khám phá');
    }
    return result;
  }

  /** Chu kỳ nghiên cứu đầy đủ: câu hỏi, giả thuyết, thực nghiệm, sáng chế. */
  public researchCycle(entityId: string, domain: KnowledgeDomain, effort = 1): ResearchCycleResult {
    const result = this.research.researchCycle(entityId, domain, { effort });
    this.states.get(entityId)?.needs.applyEvent({ type: 'discovery', intensity: 35 });
    if (result.invention) {
      this.emotions.eureka(entityId, result.invention.novelty, result.invention.utility, result.invention.name);
      this.civilization.events.push({
        year: this.lifecycle.year,
        type: 'discovery',
        description: `${this.states.get(entityId)?.being.name ?? entityId} sáng chế ${result.invention.name}.`,
        severity: result.invention.utility,
      });
    }
    return result;
  }

  /** Thử sáng chế từ các tri thức đã biết. */
  public invent(entityId: string, componentIds: readonly string[], name?: string): InventionAttempt {
    const state = this.requireState(entityId);
    const attempt = this.research.invent(entityId, componentIds, {
      name,
      creativity: clamp01((state.being.traits.creativity ?? 50) / 100),
      effort: 1,
      year: this.lifecycle.year,
    });
    if (attempt.invention) {
      state.needs.applyEvent({ type: 'invention', intensity: 60 });
      this.emotions.eureka(entityId, attempt.invention.novelty, attempt.invention.utility, attempt.invention.name);
    } else {
      state.needs.applyEvent({ type: 'failure', intensity: 15 });
      this.emotions.guilt(entityId, 0.2, 0.3, 'sáng chế thất bại');
    }
    return attempt;
  }

  /** Ghi nhớ một địa điểm trên bản đồ nhận thức. */
  public rememberPlace(entityId: string, place: PlaceInput): void {
    this.requireState(entityId).map.learnPlace(place);
  }

  /** Di chuyển nhận thức giữa hai địa điểm. */
  public travelTo(entityId: string, fromId: string, toId: string): number {
    return this.requireState(entityId).map.travel(fromId, toId);
  }

  /** Tìm đường trên bản đồ nhận thức cá nhân. */
  public findRoute(entityId: string, fromId: string, toId: string): CognitiveRoute {
    return this.requireState(entityId).map.findPath(fromId, toId);
  }

  /** Xây công trình ở khu định cư chính. */
  public build(type: BuildingType): boolean {
    const settlement = this.primarySettlement;
    if (!settlement) return false;
    const building = settlement.build(type);
    if (!building) return false;
    this.history.push(`Năm ${this.lifecycle.year}: xây ${building.name}.`);
    return true;
  }

  /** Tương tác giữa hai nền văn minh (nếu có nhiều hơn một). */
  public interactWith(
    otherId: string,
    relation: Parameters<CivilizationEngine['interact']>[2],
    intensity = 0.5,
  ): { success: boolean; detail: string } {
    return this.brainEngine.interact(this.civilization.id, otherId, relation, intensity);
  }

  /** Cảm xúc hiện tại của một thực thể. */
  public emotionOf(entityId: string): EmotionSnapshot {
    return this.emotions.snapshot(entityId);
  }

  /** Dòng suy nghĩ gần đây. */
  public thoughtsOf(entityId: string, limit = 10): Thought[] {
    return this.requireState(entityId).thoughts.recent(limit);
  }

  /** Lời trăn trối cuối cùng (nếu đã chết). */
  public lastWordsOf(entityId: string): string {
    return this.states.get(entityId)?.thoughts.lastWords ?? 'Không có lời trăn trối.';
  }

  /** Báo cáo tổng hợp. */
  public report(): LifeSimulationReport {
    const alive = this.living();
    const happiness =
      alive.length > 0
        ? alive.reduce((sum, state) => sum + state.needs.happiness(), 0) / alive.length
        : 0;
    const health =
      alive.length > 0
        ? alive.reduce((sum, state) => sum + state.being.health, 0) / alive.length
        : 0;
    const recentLifeEvents = this.lifecycle.events.slice(-5).map((event) => `[${event.year}] ${event.detail}`);
    const recentCivilizationEvents = this.civilization.events
      .slice(-3)
      .map((event) => `[${event.year}] ${event.description}`);
    return {
      year: this.lifecycle.year,
      populationAlive: alive.length,
      births: this.countBirths(),
      deaths: this.lifecycle.deathEvents.length,
      averageHappiness: happiness,
      averageHealth: health,
      civilization: this.civilization.report(),
      research: this.research.stats(),
      recentEvents: [...recentLifeEvents, ...recentCivilizationEvents],
    };
  }

  /** Ảnh chụp nhẹ để lưu game (không chứa toàn bộ trọng số mạng để tránh phình). */
  public snapshot(): {
    seed: number | string;
    year: number;
    civilization: ReturnType<Civilization['snapshot']>;
    research: ReturnType<ResearchEngine['snapshot']>;
    beings: Array<{
      id: string;
      name: string;
      ageYears: number;
      alive: boolean;
      health: number;
      needs: Record<string, number>;
      emotion: EmotionSnapshot;
    }>;
  } {
    return {
      seed: this.seed,
      year: this.lifecycle.year,
      civilization: this.civilization.snapshot(),
      research: this.research.snapshot(),
      beings: [...this.states.values()].map((state) => ({
        id: state.being.id,
        name: state.being.name,
        ageYears: state.being.ageYears,
        alive: state.being.alive,
        health: state.being.health,
        needs: state.needs.toRecord(),
        emotion: this.emotions.snapshot(state.being.id),
      })),
    };
  }

  // ==========================================================================
  // Y tế agentic: chữa bệnh, truyền nghề và tự phát minh cứu pháp
  // ==========================================================================

  /** Chữa một bệnh nhân: chỉ hiệu quả nếu healer có kỹ năng nhắm đúng bệnh đó. */
  public heal(
    healerId: string,
    patientId: string,
    options: { random?: LifeRandom; patientCooperation?: number } = {},
  ): TreatmentOutcome {
    const healer = this.requireState(healerId);
    const patient = this.requireState(patientId);
    const infection = this.disease.activeInfections(patientId)[0];
    if (!infection) {
      return {
        entityId: patientId,
        diseaseId: 'none',
        healerId,
        skillId: null,
        hadSkill: false,
        effectiveness: 0,
        cured: false,
        harmed: false,
        note: 'bệnh nhân không mang bệnh nào đang tiến triển',
      };
    }
    const definition = this.disease.getDisease(infection.diseaseId);
    if (!definition) {
      return {
        entityId: patientId,
        diseaseId: infection.diseaseId,
        healerId,
        skillId: null,
        hadSkill: false,
        effectiveness: 0,
        cured: false,
        harmed: false,
        note: 'bệnh chưa được nhận diện trong thế giới — healer không biết mình đang trị gì',
      };
    }
    const outcome = this.medicine.treat(
      healerId,
      { entityId: patientId, state: infection, definition },
      { random: new LifeRandomImpl(`${healerId}:${patientId}:${this.lifecycle.year}:heal:${++this.labCounter}`), patientCooperation: options.patientCooperation },
    );
    if (outcome.cured) {
      this.disease.treat(infection, 1);
      patient.needs.applyEvent({ type: 'success', intensity: 40 });
      this.emotions.trigger(patientId, 'gratitude', 0.7, `được ${healer.being.name} cứu`);
      patient.thoughts.learnBelief(`${healer.being.name} đã cứu mạng ta.`, 0.9, 'được chữa');
    } else if (outcome.harmed) {
      patient.being.health = Math.max(1, patient.being.health - 8);
      this.emotions.trigger(patientId, 'anger', 0.4, `bị chữa sai cách`);
    }
    if (outcome.cured) {
      healer.needs.applyEvent({ type: 'success', intensity: 35 });
      this.emotions.trigger(healerId, 'pride', 0.6, 'cứu được người');
    }
    this.history.push(`Năm ${this.lifecycle.year}: ${healer.being.name} chữa ${patient.being.name} — ${outcome.note}.`);
    return outcome;
  }

  /** Bệnh mà một thực thể chữa được (theo kỹ năng y tế đang có). */
  public treatableDiseasesOf(entityId: string): string[] {
    return this.medicine.treatableDiseases(entityId);
  }

  /** Học một kỹ năng chữa từ healer khác — phụ thuộc tri thức nền + kiên trì. */
  public learnHealing(
    studentId: string,
    teacherId: string,
    skillId: string,
    options: { sessions?: number } = {},
  ): SkillLearningResult {
    const student = this.requireState(studentId);
    const teacher = this.states.get(teacherId);
    const result = this.medicine.learnSkill(studentId, teacherId, skillId, {
      random: new LifeRandomImpl(`${studentId}:${teacherId}:${skillId}:learn`),
      knowledge: this.knowledgeRecordOf(studentId),
      aptitude: clamp01((student.being.traits.intelligence ?? 100) / 200),
      teachingQuality: teacher ? clamp01((teacher.being.traits.charisma ?? 50) / 100) : 0.3,
      sessions: options.sessions,
    });
    if (result.learned) {
      this.emotions.trigger(studentId, 'gratitude', 0.4, `học nghề chữa từ ${teacherId}`);
      student.thoughts.learnBelief(`Ta đã nắm được ${skillId}.`, 0.8, 'học nghề');
      this.history.push(`Năm ${this.lifecycle.year}: ${student.being.name} học được ${skillId} — ${result.note}.`);
    }
    return result;
  }

  /** Tự mò mẫm phát minh kỹ năng chữa mới (không hệ thống cấp). */
  public experimentHealing(
    entityId: string,
    concept: { name: string; targetDiseases: readonly string[]; method: string },
  ): ReturnType<MedicineEngine['experimentSkill']> {
    const state = this.requireState(entityId);
    return this.medicine.experimentSkill(entityId, concept, {
      random: new LifeRandomImpl(`${entityId}:${concept.name}:experiment`),
      knowledge: this.knowledgeRecordOf(entityId),
      creativity: clamp01((state.being.traits.creativity ?? 50) / 100),
    });
  }

  /** Hồ sơ healer của một thực thể. */
  public healerProfileOf(entityId: string): HealerProfile {
    return this.medicine.profileOf(entityId, {
      persistence: clamp01((this.states.get(entityId)?.being.traits.willpower ?? 50) / 100),
    });
  }

  // ==========================================================================
  // Lò rèn kỹ năng: agent tự phát minh skill/phép qua nhiều lần thử
  // ==========================================================================

  /**
   * Một lượt rèn kỹ năng/phép — hệ thống không cấp phát, agent phải gọi lặp lại
   * nhiều lần; thất bại tích luỹ tiến bộ, phản tác dụng gây sát thương thật.
   */
  public forgeAttempt(
    entityId: string,
    target: { name: string; kind: 'skill' | 'spell' | 'craft_recipe' | 'medical_technique' | 'science_theory' | 'achievement'; prerequisites?: Record<string, number>; intendedEffect?: string },
  ): ForgeAttempt {
    const state = this.requireState(entityId);
    const attempt = this.skillForge.attempt(entityId, target, this.knowledgeRecordOf(entityId), {
      random: new LifeRandomImpl(`${entityId}:${target.name}:${this.lifecycle.year}:forge`),
      creativity: clamp01((state.being.traits.creativity ?? 50) / 100),
      persistence: clamp01((state.being.traits.willpower ?? 50) / 100),
      year: this.lifecycle.year,
      health: state.being.health,
    });
    if (attempt.selfDamage > 0) {
      state.being.health = Math.max(0, state.being.health - attempt.selfDamage);
      this.emotions.trigger(entityId, 'fear', clamp01(attempt.hazard), 'thí nghiệm phản tác dụng');
      if (state.being.health <= 0 && state.being.alive) {
        this.lifecycle.die(state.being, 'accident', {
          witnesses: state.being.children.filter((childId) => this.states.get(childId)?.being.alive),
        });
        this.recordDeath(state.being, 'accident');
        this.history.push(`Năm ${this.lifecycle.year}: ${state.being.name} thiệt mạng vì ${attempt.note}.`);
      }
    }
    if (attempt.outcome === 'success') {
      this.emotions.eureka(entityId, 0.9, 0.8, `rèn thành ${target.name}`);
      this.history.push(`Năm ${this.lifecycle.year}: ${state.being.name} ${attempt.note}.`);
    }
    return attempt;
  }

  /** Các năng lực agent đã tự rèn được. */
  public forgedAbilitiesOf(entityId: string): ForgeProfile['forgedAbilities'] {
    return this.skillForge.abilitiesOf(entityId);
  }

  /** Truyền năng lực đã rèn cho học viên (vẫn phải qua nhiều phiên). */
  public transmitAbility(
    abilityId: string,
    studentId: string,
    options: { sessions?: number } = {},
  ): ReturnType<SkillForge['transmit']> {
    const student = this.requireState(studentId);
    return this.skillForge.transmit(abilityId, studentId, {
      random: new LifeRandomImpl(`${abilityId}:${studentId}:transmit`),
      aptitude: clamp01((student.being.traits.intelligence ?? 100) / 200),
      sessions: options.sessions,
    });
  }

  /** Thống kê lò rèn toàn thế giới. */
  public forgeStats(): ReturnType<SkillForge['stats']> {
    return this.skillForge.stats();
  }

  // ==========================================================================
  // Nghiệp chủng: học theo lớp (kiếm sĩ không học phép, quái hút linh hồn…)
  // ==========================================================================

  /** Học một loại nội dung theo nghiệp chủng của thực thể. */
  public learnByArchetype(
    entityId: string,
    topic: LearningTopic,
    options: { quality?: number; preyXp?: number; repetitions?: number } = {},
  ): ReturnType<typeof runArchetypeLearn> {
    const state = this.requireState(entityId);
    if (!state.archetype || !state.archetypeState) {
      throw new RangeError(`Thực thể ${entityId} chưa được gắn nghiệp chủng`);
    }
    return runArchetypeLearn(state.archetypeState, state.archetype, topic, {
      random: new LifeRandomImpl(`${entityId}:${topic}:${this.lifecycle.year}:archetype`),
      quality: options.quality,
      preyXp: options.preyXp,
      repetitions: options.repetitions,
    });
  }

  /** Gán lại nghiệp chủng cho một thực thể. */
  public assignArchetype(entityId: string, archetypeId: string): Archetype {
    const state = this.requireState(entityId);
    const archetype = archetypeById(archetypeId);
    state.archetype = archetype;
    state.archetypeState = createArchetypeState(entityId, archetype);
    return archetype;
  }

  /** Danh sách nghiệp chủng dựng sẵn. */
  public get archetypes(): readonly Archetype[] {
    return DEFAULT_ARCHETYPES;
  }

  // ==========================================================================
  // Tiến hoá: chọn lọc tự nhiên, trôi di truyền, phân hoá loài mới
  // ==========================================================================

  /** Thêm áp lực chọn lọc môi trường. */
  public applySelectionPressure(pressure: SelectionPressure): void {
    this.evolution.addPressure(pressure);
    this.history.push(`Năm ${this.lifecycle.year}: áp lực "${pressure.id}" tác động lên thế giới — ${pressure.note}.`);
  }

  /** Chạy một thế hệ chọn lọc cho một loài (danh sách cá thể còn sống). */
  public runSelection(speciesId: string): { eliminated: string[]; report: SelectionReport } {
    const members = this.living()
      .filter((state) => state.being.species === speciesId)
      .map((state) => ({ entityId: state.being.id, genome: state.being.genome }));
    const result = this.evolution.selectGeneration(speciesId, members, { year: this.lifecycle.year });
    for (const entityId of result.eliminated) {
      const state = this.states.get(entityId);
      if (state?.being.alive) {
        this.lifecycle.die(state.being, 'predation', {
          witnesses: state.being.children.filter((childId) => this.states.get(childId)?.being.alive),
        });
        this.recordDeath(state.being, 'predation');
      }
    }
    if (result.report.speciation) {
      this.history.push(
        `Năm ${this.lifecycle.year}: loài mới "${result.report.speciation.childName}" tách ra từ ${speciesId} (khoảng cách di truyền ${result.report.speciation.divergence.toFixed(3)}).`,
      );
    }
    return result;
  }

  /** Mô phỏng trôi di truyền cho một loài. */
  public driftSpecies(speciesId: string, generations: number): Record<string, number> {
    return this.evolution.drift(speciesId, generations);
  }

  /** Hồ sơ loài đang theo dõi. */
  public speciesProfile(speciesId: string): SpeciesProfile | undefined {
    return this.evolution.species.get(speciesId);
  }

  /** Các sự kiện phân hoá loài đã xảy ra. */
  public get speciationHistory(): readonly SpeciationEvent[] {
    return this.evolution.speciationEvents;
  }

  /** Độ thích nghi của một thực thể dưới áp lực hiện tại. */
  public fitnessOf(entityId: string): FitnessReport {
    return this.evolution.fitnessOf(this.requireState(entityId).being.genome);
  }

  // ==========================================================================
  // Nghiên cứu nguy hiểm: tai nạn phòng thí nghiệm
  // ==========================================================================

  /**
   * Thí nghiệm có rủi ro thật: có thể nổ, tỏa khói độc — hít phải có thể chết.
   * Trả tai nạn nếu xảy ra (đã trừ máu và ghi nhận tử vong).
   */
  public riskyExperiment(
    entityId: string,
    domain: KnowledgeDomain,
    bystanderIds: readonly string[] = [],
  ): LabAccident | null {
    const state = this.requireState(entityId);
    const knowledge = this.knowledgeRecordOf(entityId);
    const accident = simulateLabAccident(entityId, domain, {
      year: this.lifecycle.year,
      random: new LifeRandomImpl(`${entityId}:${domain}:${this.lifecycle.year}:lab:${++this.labCounter}`),
      safetyKnowledge: clamp01(knowledge.safety_engineering ?? 0),
      health: state.being.health,
      bystanders: bystanderIds,
    });
    if (!accident) return null;
    state.being.health = Math.max(0, state.being.health - accident.damage);
    this.emotions.trigger(entityId, 'fear', clamp01(accident.severity), 'tai nạn thí nghiệm');
    for (const bystanderId of accident.bystandersHit) {
      const bystander = this.states.get(bystanderId);
      if (bystander) {
        bystander.being.health = Math.max(0, bystander.being.health - Math.round(accident.damage * 0.5));
        this.emotions.trigger(bystanderId, 'anger', 0.5, 'bị văng phải thí nghiệm của người khác');
        if (bystander.being.health <= 0 && bystander.being.alive) {
          this.lifecycle.die(bystander.being, 'accident');
          this.recordDeath(bystander.being, 'accident');
        }
      }
    }
    if (state.being.health <= 0 && state.being.alive) {
      this.lifecycle.die(state.being, 'poisoning', {
        witnesses: bystanderIds.filter((id) => this.states.get(id)?.being.alive),
      });
      this.recordDeath(state.being, 'poisoning');
    }
    this.history.push(`Năm ${this.lifecycle.year}: tai nạn thí nghiệm của ${state.being.name} — ${accident.note}.`);
    return accident;
  }

  // ==========================================================================
  // Tính cách động, tuổi thọ kỳ vọng và sinh agent hoàn chỉnh
  // ==========================================================================

  /** Ánh xạ hành động → loại trải nghiệm định hình tính cách (kèm cường độ nền). */
  private recordActionExperience(state: EntitySimulationState, action: string, satisfactionDelta: number): void {
    const kindByAction: Partial<Record<string, { kind: ExperienceKind; intensity: number }>> = {
      fight: { kind: 'combat', intensity: 0.65 },
      flee: { kind: 'danger_survived', intensity: 0.4 },
      explore: { kind: 'exploration', intensity: 0.4 },
      research: { kind: 'discovery', intensity: 0.45 },
      invent: { kind: 'invention', intensity: 0.6 },
      work: { kind: 'success', intensity: 0.3 },
      care_for_child: { kind: 'childbirth', intensity: 0.5 },
      socialize: { kind: 'kindness_received', intensity: 0.3 },
    };
    const entry = kindByAction[action];
    if (!entry) return;
    void satisfactionDelta;
    const being = state.being;
    this.personalityEngine.recordExperience(
      being.id,
      this.personalityEngine.personalityOf(being.id) ?? state.personality,
      { kind: entry.kind, intensity: entry.intensity, year: this.lifecycle.year },
      {
        ageYears: being.ageYears,
        lifespanYears: this.lifecycle.lifespanOf(being),
        willpower: being.traits.willpower,
        genome: being.genome,
      },
    );
  }

  /** Tính cách hiện hành của một agent (đã qua mọi điều chỉnh trải nghiệm). */
  public personalityOf(entityId: string): PersonalityRecord | undefined {
    return this.personalityEngine.records.get(entityId);
  }

  /** Độ dịch tích luỹ của tính cách so với mức khởi tạo. */
  public personalityDriftOf(entityId: string): Record<string, number> {
    return this.personalityEngine.driftOf(entityId);
  }

  /** Các sự kiện định hình tính cách mạnh nhất. */
  public formativeEventsOf(entityId: string): ReturnType<PersonalityEngine['formativeOf']> {
    return this.personalityEngine.formativeOf(entityId);
  }

  /** Tuổi thọ kỳ vọng có điều kiện của một sinh mệnh. */
  public lifeExpectancyOf(entityId: string): ReturnType<LifeSimulation['lifecycle']['estimateLifeExpectancy']> {
    return this.lifecycle.estimateLifeExpectancy(this.requireState(entityId).being);
  }

  /**
   * Sinh một agent hoàn chỉnh: bộ gen → tính cách suy từ gen → nghiệp chủng tự
   * đề xuất → tri thức khởi đầu theo nghề. Một dòng code cho một nhân vật sống.
   */
  public spawnAgent(options: Partial<SpawnOptions> = {}): EntitySimulationState {
    const index = ++this.nameCounter;
    const name = options.name ?? `${PERSON_NAMES[index % PERSON_NAMES.length]} ${index}`;
    const state = this.spawn({
      ...options,
      id: options.id ?? `agent_${index}_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
    });
    if (state.archetype && !options.startingKnowledge) {
      for (const [knowledgeId, mastery] of Object.entries(state.archetype.startingKnowledge)) {
        this.civilization.knowledge.grant(state.being.id, knowledgeId, mastery);
      }
    }
    return state;
  }

  // ==========================================================================
  // Dinh dưỡng agentic: vị giác, sức lực, sống sót nhịn ăn, sáng tạo món
  // ==========================================================================

  /** Ăn một món cụ thể (kết quả phụ thuộc khẩu vị riêng của chủ thể). */
  public eatMeal(entityId: string, foodId: string): MealResult {
    const state = this.requireState(entityId);
    return this.nutrition.eat(entityId, foodId, state.being.genome, state.being.traits);
  }

  /** Thống kê sống sót riêng của chủ thể: chịu tối đa bao lâu không ăn/không uống. */
  public survivalStatsOf(entityId: string): ReturnType<NutritionEngine['survivalStats']> {
    const state = this.requireState(entityId);
    return this.nutrition.survivalStats(entityId, state.being.genome, state.being.traits);
  }

  /** Hồ sơ chuyển hoá riêng của chủ thể. */
  public metabolicProfileOf(entityId: string): MetabolicProfile {
    const state = this.requireState(entityId);
    return this.nutrition.profileOf(entityId, state.being.genome, state.being.traits);
  }

  /** Trạng thái dinh dưỡng hiện tại. */
  public nutritionStateOf(entityId: string): NutritionState | undefined {
    return this.nutrition.states.get(entityId);
  }

  /** Khẩu vị của chủ thể. */
  public tasteOf(entityId: string): TasteProfile | undefined {
    return this.nutrition.tastes.get(entityId);
  }

  /** Sáng tạo món mới từ nguyên liệu — thông số sáng tạo quyết định. */
  public inventRecipeFor(
    entityId: string,
    ingredientIds: readonly string[],
  ): ReturnType<NutritionEngine['inventRecipe']> {
    const state = this.requireState(entityId);
    return this.nutrition.inventRecipe(
      entityId,
      ingredientIds,
      clamp01((state.being.traits.creativity ?? 50) / 100),
      this.lifecycle.year,
    );
  }

  /** Sách món tự chế của agent. */
  public cookbookOf(entityId: string): FoodItem[] {
    return this.nutrition.cookbookOf(entityId);
  }

  // ==========================================================================
  // Mặt tối không rào cản: tuyệt vọng, tự kết thúc, hành vi gây hại xã hội
  // ==========================================================================

  /** Ghi một nỗi đau vào tuyệt vọng của agent (game gọi trực tiếp được). */
  public recordSuffering(
    entityId: string,
    kind: Parameters<DespairEngine['recordSuffering']>[1],
    intensity: number,
  ): number {
    return this.despair.recordSuffering(entityId, kind, intensity, this.lifecycle.year);
  }

  /** Nguy cơ tự kết thúc hiện tại + các yếu tố đẩy. */
  public suicideRiskOf(entityId: string): SuicideRisk {
    const state = this.requireState(entityId);
    const personalityNow = this.personalityEngine.personalityOf(entityId) ?? state.personality;
    return this.despair.state(entityId) ? this.despair.tick(entityId, {
      neuroticism: personalityNow.neuroticism,
      resilience: personalityNow.resilience,
      willpower: state.being.traits.willpower,
      empathy: personalityNow.empathy,
    }, { socialSupport: 0.5, years: 0 }) : { risk: 0, drivers: [], critical: false };
  }

  /** Trạng thái tuyệt vọng đầy đủ. */
  public despairStateOf(entityId: string): DespairState {
    return this.despair.state(entityId);
  }

  /** Thực hiện/không thực hiện hành vi gây hại xã hội — kết quả đầy đủ. */
  public doAntisocialAct(entityId: string, act: AntisocialAct): AntisocialOutcome {
    const state = this.requireState(entityId);
    const personalityNow = this.personalityEngine.personalityOf(entityId) ?? state.personality;
    const settlement = this.primarySettlement;
    const context = {
      hunger: 100 - state.needs.happiness(),
      grudge: clamp01(state.being.trauma / 100),
      aggression: personalityNow.aggression,
      agreeableness: personalityNow.agreeableness,
      selfControl: 100 - personalityNow.neuroticism,
      security: settlement?.security ?? 40,
      witnesses: Math.max(0, Math.round(((settlement?.population ?? 10) / 10) * 0.5)),
    };
    const evaluation = evaluateAntisocialAct(act, context);
    return performAntisocialAct(entityId, act, this.lifecycle.year, { ...context, evaluation });
  }

  // ==========================================================================
  // Nội bộ
  // ==========================================================================

  private requireState(entityId: string): EntitySimulationState {
    const state = this.states.get(entityId);
    if (!state) throw new RangeError(`Không tìm thấy thực thể ${entityId}`);
    return state;
  }

  /** Tri thức nền của một thực thể dưới dạng bản ghi id → mastery. */
  private knowledgeRecordOf(entityId: string): Record<string, number> {
    const profile = this.civilization.knowledge.profileOf(entityId);
    const record: Record<string, number> = {};
    for (const node of profile.known) record[node.id] = node.mastery;
    return record;
  }

  private countBirths(): number {
    return this.lifecycle.events.filter((event) => event.type === 'birth').length;
  }

  private observationFor(state: EntitySimulationState): NeuralObservation {
    const settlement = this.primarySettlement;
    const report = settlement?.report();
    const snapshot = this.emotions.snapshot(state.being.id);
    const emotions: Record<string, number> = {};
    for (const [emotion, intensity] of Object.entries(snapshot.active)) {
      if (typeof intensity === 'number') emotions[emotion] = intensity;
    }
    const socialSupport =
      (100 - state.needs.urgencyOf('isolationFear') + 100 - state.needs.urgencyOf('friendship')) / 200;
    return {
      features: {
        health: clamp01(state.being.health / 100),
        age: clamp01(state.being.ageYears / 100),
        foodSecurity: report?.foodSecurity ?? 0.5,
        waterSecurity: report?.waterSecurity ?? 0.5,
        wealth: clamp01((settlement?.resources.wealth ?? 0) / 200),
        security: clamp01((settlement?.security ?? 30) / 100),
        socialSupport: clamp01(socialSupport),
      },
      needs: state.needs.toRecord(),
      emotions,
      position: { x: 0, y: 0, z: 0 },
    };
  }

  private applyAction(state: EntitySimulationState, action: string, targetId?: string): void {
    const id = state.being.id;
    switch (action) {
      case 'eat': {
        // Chọn món hợp khẩu vị nhất trong thực đơn thế giới — vị giác quyết định.
        const foods = [...this.nutrition.menu.values()];
        const taste = this.nutrition.tasteOf(id, state.being.genome);
        let best = foods[0];
        let bestMatch = -1;
        for (const food of foods) {
          const match =
            taste.preference.sweet * food.flavor.sweet +
            taste.preference.salty * food.flavor.salty +
            taste.preference.sour * food.flavor.sour +
            taste.preference.bitter * food.flavor.bitter +
            taste.preference.umami * food.flavor.umami +
            taste.preference.spicy * food.flavor.spicy;
          if (food.nutrition > 5 && match > bestMatch) {
            bestMatch = match;
            best = food;
          }
        }
        const meal = this.nutrition.eat(id, best.id, state.being.genome, state.being.traits);
        state.needs.satisfy('hunger', 30 + meal.nutrition * 0.5);
        state.needs.applyEvent({ type: 'hunger', intensity: 15 });
        if (meal.emotion === 'delight') this.emotions.trigger(id, 'joy', 0.5, `bữa ăn hợp khẩu (${meal.enjoyment * 100}%)`);
        else if (meal.emotion === 'disgust') this.emotions.trigger(id, 'disgust', 0.4, `món ${meal.foodId} dở khủng khiếp`);
        else this.emotions.trigger(id, 'contentment', 0.3, 'được ăn');
        if (meal.poisoned) {
          state.being.health = Math.max(0, state.being.health - 12);
          this.emotions.trigger(id, 'fear', 0.3, 'trúng độc sau bữa ăn');
        }
        break;
      }
      case 'drink': {
        const water = this.nutrition.eat(id, 'food_stream_water', state.being.genome, state.being.traits);
        state.needs.satisfy('thirst', 40 + water.hydration * 0.4);
        state.needs.satisfy('bodyTemperature', 10);
        break;
      }
      case 'cook': {
        // Sáng tạo ẩm thực: kết hợp nguyên liệu đã biết thành món mới.
        const known = [...this.nutrition.menu.keys()].slice(0, 4);
        const result = this.nutrition.inventRecipe(
          id,
          known,
          clamp01((state.being.traits.creativity ?? 50) / 100),
          this.lifecycle.year,
        );
        state.needs.satisfy('invention', 20);
        if (result.invented && result.recipe) {
          this.emotions.eureka(id, 0.6, 0.5, `sáng chế món ${result.recipe.name}`);
          this.history.push(`Năm ${this.lifecycle.year}: ${state.being.name} ${result.note}.`);
        } else {
          this.emotions.guilt(id, 0.2, 0.2, 'nấu hỏng nồi món');
        }
        break;
      }
      case 'steal_food':
      case 'vandalize': {
        // Hành vi gây hại xã hội — mô phỏng không rào cản, hậu quả đầy đủ.
        const act: AntisocialAct = action === 'steal_food' ? 'theft' : 'vandalism';
        const personalityNow = this.personalityEngine.personalityOf(id) ?? state.personality;
        const settlement = this.primarySettlement;
        const evaluation = evaluateAntisocialAct(act, {
          hunger: 100 - state.needs.happiness(),
          grudge: clamp01(state.being.trauma / 100),
          aggression: personalityNow.aggression,
          agreeableness: personalityNow.agreeableness,
          selfControl: 100 - personalityNow.neuroticism,
          security: settlement?.security ?? 40,
          witnesses: Math.max(0, Math.round(((settlement?.population ?? 10) / 10) * 0.5)),
        });
        const outcome = performAntisocialAct(id, act, this.lifecycle.year, {
          hunger: 100 - state.needs.happiness(),
          grudge: clamp01(state.being.trauma / 100),
          aggression: personalityNow.aggression,
          agreeableness: personalityNow.agreeableness,
          selfControl: 100 - personalityNow.neuroticism,
          security: settlement?.security ?? 40,
          evaluation,
        });
        if (outcome.executed) {
          if (act === 'theft' && outcome.loot > 0) state.needs.satisfy('hunger', outcome.loot * 0.8);
          if (outcome.guilt > 0.3) this.emotions.guilt(id, outcome.guilt, 0.6, `${act} gây day dứt`);
          if (outcome.thrill > 0.4) this.emotions.bloodlust(id, outcome.thrill, 0.5, `${act} khoái lạc nguy hiểm`);
          if (outcome.caught && settlement) {
            settlement.gain({ wealth: -outcome.loot * 0.5 });
            this.history.push(`Năm ${this.lifecycle.year}: ${state.being.name} ${outcome.note}.`);
          }
          this.recordActionExperience(state, 'fight', outcome.harm);
        } else {
          this.emotions.trigger(id, 'contentment', 0.2, 'nhịn được, không làm điều xấu');
        }
        break;
      }
      case 'sleep':
        state.needs.satisfy('sleep', 70);
        state.needs.satisfy('bodyTemperature', 20);
        break;
      case 'seek_shelter':
        state.needs.satisfy('shelter', 45);
        state.needs.satisfy('darknessFear', 35);
        state.needs.satisfy('monsterFear', 20);
        this.emotions.trigger(id, 'calm', 0.4, 'trú ẩn an toàn');
        break;
      case 'socialize':
        state.needs.satisfy('friendship', 45);
        state.needs.satisfy('isolationFear', 40);
        state.needs.applyEvent({ type: 'romance', intensity: 10 });
        this.emotions.trigger(id, 'joy', 0.4, 'gặp gỡ mọi người');
        break;
      case 'explore':
        state.needs.satisfy('exploration', 50);
        this.emotions.trigger(id, 'curiosity', 0.6, 'khám phá vùng đất mới');
        if (state.map.size > 0) {
          const frontier = state.map.explorationFrontier(1)[0];
          if (frontier) state.map.travel('home', frontier.id);
        }
        break;
      case 'research':
        state.needs.satisfy('invention', 30);
        state.needs.satisfy('exploration', 20);
        this.emotions.trigger(id, 'curiosity', 0.5, 'nghiên cứu');
        break;
      case 'invent': {
        const known = this.civilization.knowledge.profileOf(id).known.slice(0, 3).map((node) => node.id);
        if (known.length >= 2) {
          this.research.invent(id, known, {
            creativity: clamp01((state.being.traits.creativity ?? 50) / 100),
            effort: 1,
            year: this.lifecycle.year,
          });
        }
        state.needs.satisfy('invention', 40);
        this.emotions.trigger(id, 'eureka', 0.4, 'thử sáng chế');
        break;
      }
      case 'reproduce':
        state.needs.satisfy('romance', 45);
        state.needs.satisfy('maternalLove', 20);
        if (state.being.partnerId) {
          const partner = this.states.get(state.being.partnerId);
          if (partner && partner.being.alive) this.mate(id, partner.being.id);
        }
        break;
      case 'rest':
        state.needs.satisfy('sleep', 30);
        state.needs.satisfy('bodyTemperature', 15);
        state.needs.satisfy('excretion', 30);
        break;
      case 'flee':
        state.needs.satisfy('monsterFear', 45);
        state.needs.satisfy('darknessFear', 30);
        this.emotions.trigger(id, 'fear', 0.4, 'bỏ chạy khỏi nguy hiểm');
        break;
      case 'fight':
        state.needs.applyEvent({ type: 'danger', intensity: 20 });
        this.emotions.bloodlust(id, 0.7, 0.5, 'giao chiến');
        this.emotions.trigger(id, 'anger', 0.4, 'giao chiến');
        break;
      case 'care_for_child':
        state.needs.satisfy('maternalLove', 45);
        this.emotions.maternalHeroism(id, 0.6, 0.8, 'chăm sóc con');
        if (targetId) {
          const child = this.states.get(targetId);
          if (child) child.needs.applyEvent({ type: 'romance', intensity: 20 });
        }
        break;
      case 'work': {
        state.needs.satisfy('professionalPride', 30);
        state.needs.satisfy('honor', 15);
        const settlement = this.primarySettlement;
        if (settlement) settlement.gain({ wealth: 1, tools: 0.3 });
        break;
      }
      default:
        break;
    }
  }

  private civilizationContext(context: LifeSimulationContext): CivilizationContext {
    return {
      harvestMultiplier: context.harvestMultiplier,
      epidemicSeverity: context.epidemicSeverity,
      warSeverity: context.warSeverity,
      tradeBonus: context.tradeBonus,
      threat: context.threat,
      contactRate: context.contactRate,
      innovation: context.innovation,
      corruptionPressure: context.corruptionPressure,
    };
  }

  private recordDeath(being: LifeHistory, cause: DeathCause): void {
    const state = this.states.get(being.id);
    if (!state) return;
    if (!state.thoughts.lastWords) {
      state.thoughts.dyingThought(DEATH_CAUSE_LABELS[cause], [
        ...being.children.slice(0, 3).map((childId) => `con ${this.states.get(childId)?.being.name ?? childId}`),
        `${this.civilization.knowledge.profileOf(being.id).known.length} điều học được`,
      ], being.ageYears);
    }
    state.thoughts.learnBelief('Ta sắp rời khỏi thế giới này.', 1, 'cận tử');
    this.history.push(`Năm ${this.lifecycle.year}: ${being.name} qua đời do ${DEATH_CAUSE_LABELS[cause]}. Lời cuối: ${state.thoughts.lastWords}`);
  }

  private mournForSurvivors(victim: EntitySimulationState, death: DeathEvent): void {
    const family = [victim.being.partnerId, ...victim.being.children].filter(
      (id): id is string => Boolean(id && this.states.get(id)?.being.alive),
    );
    for (const survivorId of family) this.mourn(survivorId, death.entityId);
    if (family.length > 0) {
      this.history.push(`${family.length} người thân tiếc thương ${death.name}.`);
    }
  }
}

/** Tạo nhanh một mô phỏng sinh mệnh. */
export function createLifeSimulation(config: LifeSimulationConfig = {}): LifeSimulation {
  return new LifeSimulation(config);
}
