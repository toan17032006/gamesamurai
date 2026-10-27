/**
 * @file neural-agent.ts
 * @module @aetheria/engine/deeplearning/neural-agent
 * @description Bộ não tác tử dùng học sâu: cảm nhận → mã hoá nhu cầu/cảm xúc →
 * DQN chọn hành động → nhận phần thưởng → replay → cập nhật. Kèm đồ thị tri
 * thức, phần thưởng tò mò, suy nghĩ nội tâm và chế độ mơ (dream consolidation).
 */

import { DeepRandom, clamp01 } from './random.js';
import { DeepQNetwork, type DeepQConfig } from './q-network.js';
import { KnowledgeLearner } from './knowledge-graph.js';
import { cosineSimilarity } from './tensor.js';

/** Cấu hình bộ não tác tử. */
export interface NeuralAgentConfig {
  id: string;
  /** Tên các đặc trưng đầu vào theo thứ tự cố định. */
  stateKeys: readonly string[];
  /** Hành động khả dụng. */
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  learningRate?: number;
  gamma?: number;
  epsilon?: number;
  seed?: number;
  /** Hệ số thưởng tò mò (0 = tắt). */
  curiosity?: number;
  /** Số chiều embedding tri thức. */
  knowledgeDimension?: number;
}

/** Một quan sát đã chuẩn hoá. */
export interface NeuralObservation {
  features?: Record<string, number>;
  needs?: Record<string, number>;
  emotions?: Record<string, number>;
  /** Vị trí nếu cần cho bản đồ nhận thức. */
  position?: { x: number; y: number; z: number };
}

/** Kết quả suy nghĩ/chọn hành động. */
export interface NeuralThought {
  action: string;
  actionIndex: number;
  qValues: number[];
  confidence: number;
  dominantNeed: string | null;
  dominantEmotion: string | null;
  thought: string;
  intrinsicReward: number;
}

/** Kết quả một chu kỳ học. */
export interface NeuralLearningResult {
  trained: boolean;
  loss: number;
  tdError: number;
  epsilon: number;
  totalReward: number;
  knowledgeNovelty: number;
}

/** Ảnh chụp bộ não. */
export interface NeuralAgentSnapshot {
  config: NeuralAgentConfig;
  dqn: ReturnType<DeepQNetwork['snapshot']>;
  knowledgeGraph: ReturnType<KnowledgeLearner['graph']['snapshot']>;
  knowledgeEmbedding: ReturnType<KnowledgeLearner['embedding']['snapshot']>;
  totalReward: number;
  episode: number;
  observationCount: number;
  seedState: number;
}

/** Bộ não tác tử học sâu, độc lập cho từng thực thể. */
export class NeuralAgentBrain {
  public readonly id: string;
  public readonly stateKeys: readonly string[];
  public readonly actions: readonly string[];
  public readonly dqn: DeepQNetwork;
  public readonly knowledge: KnowledgeLearner;
  public totalReward = 0;
  public episode = 0;
  public observationCount = 0;
  public training = true;

  private readonly config: NeuralAgentConfig;
  private readonly random: DeepRandom;
  private readonly curiosity: number;
  private readonly episodicMemory: number[][] = [];
  private previousState: number[] | null = null;
  private previousAction = -1;
  private lastThought: NeuralThought | null = null;

  constructor(config: NeuralAgentConfig) {
    if (config.stateKeys.length === 0) throw new RangeError('Bộ não cần ít nhất một đặc trưng trạng thái');
    if (config.actions.length === 0) throw new RangeError('Bộ não cần ít nhất một hành động');
    this.config = { ...config };
    this.id = config.id;
    this.stateKeys = [...config.stateKeys];
    this.actions = [...config.actions];
    this.curiosity = clamp01(config.curiosity ?? 0.3);
    this.random = new DeepRandom(config.seed ?? config.id);

    const dqnConfig: DeepQConfig = {
      inputSize: this.stateKeys.length,
      actions: this.actions,
      hiddenSizes: config.hiddenSizes ?? [48, 32],
      learningRate: config.learningRate ?? 0.001,
      gamma: config.gamma ?? 0.95,
      epsilon: config.epsilon ?? 1,
      epsilonMin: 0.05,
      epsilonDecay: 0.995,
      batchSize: 16,
      capacity: 5000,
      targetSyncInterval: 40,
      doubleQ: true,
      seed: config.seed ?? 1,
    };
    this.dqn = new DeepQNetwork(dqnConfig);
    this.knowledge = new KnowledgeLearner(config.knowledgeDimension ?? 12, config.seed ?? 1, this.curiosity);
  }

  /** Cấu hình gốc. */
  public getConfig(): NeuralAgentConfig {
    return { ...this.config };
  }

  /** Mã hoá quan sát thành vector số thực. */
  public encode(observation: NeuralObservation): number[] {
    const features = observation.features ?? {};
    const needs = observation.needs ?? {};
    const emotions = observation.emotions ?? {};
    return this.stateKeys.map((key) => {
      const raw = features[key] ?? needs[key] ?? emotions[key] ?? 0;
      return Number.isFinite(raw) ? raw : 0;
    });
  }

  /** Phần thưởng tò mò: càng xa trí nhớ cũ càng cao. */
  public intrinsicReward(state: readonly number[]): number {
    if (this.episodicMemory.length === 0 || this.curiosity === 0) return 0;
    let best = 0;
    for (const previous of this.episodicMemory) best = Math.max(best, cosineSimilarity(state, previous));
    const novelty = clamp01(1 - best);
    return this.curiosity * novelty * 0.5;
  }

  /** Suy nghĩ và chọn hành động (không cập nhật học). */
  public think(observation: NeuralObservation, explore = true): NeuralThought {
    const state = this.encode(observation);
    const intrinsic = this.intrinsicReward(state);
    const actionIndex = this.dqn.selectAction(state, explore && this.training);
    const qValues = this.dqn.qValues(state);
    const best = Math.max(...qValues);
    const second = [...qValues].sort((a, b) => b - a)[1] ?? best;
    const confidence = clamp01(0.5 + Math.tanh((best - second) / 2) * 0.5);

    const dominantNeed = dominantKey(observation.needs);
    const dominantEmotion = dominantKey(observation.emotions);
    const action = this.actions[actionIndex] ?? this.actions[0];
    const thought = this.composeThought(action, dominantNeed, dominantEmotion, confidence, intrinsic);

    this.previousState = state;
    this.previousAction = actionIndex;
    this.lastThought = {
      action,
      actionIndex,
      qValues,
      confidence,
      dominantNeed,
      dominantEmotion,
      thought,
      intrinsicReward: intrinsic,
    };
    this.observationCount++;
    return this.lastThought;
  }

  /**
   * Học từ kết quả của hành động vừa chọn.
   * Phần thưởng nội tại được cộng vào phần thưởng ngoài.
   */
  public learn(
    reward: number,
    nextObservation: NeuralObservation,
    done = false,
    facts: ReadonlyArray<{ subject: string; relation: string; object: string; confidence?: number }> = [],
  ): NeuralLearningResult {
    const nextState = this.encode(nextObservation);
    let novelty = 0;
    for (const fact of facts) {
      const result = this.knowledge.observe(
        fact.subject,
        fact.relation,
        fact.object,
        fact.confidence ?? 0.8,
        'neural-agent',
      );
      novelty = Math.max(novelty, result.novelty);
    }

    const intrinsic = this.intrinsicReward(nextState);
    const shapedReward = reward + intrinsic + novelty * this.curiosity * 0.3;
    this.totalReward += shapedReward;

    if (this.previousState && this.previousAction >= 0) {
      this.dqn.observe({
        state: this.previousState,
        action: this.previousAction,
        reward: shapedReward,
        nextState,
        done,
      });
    }

    const result = this.dqn.trainStep();
    this.episodicMemory.push(nextState);
    if (this.episodicMemory.length > 256) this.episodicMemory.shift();
    if (done) this.episode++;
    this.previousState = nextState;
    this.previousAction = -1;

    return {
      trained: result !== null,
      loss: result?.loss ?? 0,
      tdError: result?.meanTDError ?? 0,
      epsilon: this.dqn.epsilon,
      totalReward: this.totalReward,
      knowledgeNovelty: novelty,
    };
  }

  /** Mơ: huấn luyện lại từ replay và củng cố tri thức. */
  public dream(steps = 10, knowledgeEpochs = 10): { trainingSteps: number; knowledgeLoss: number } {
    const results = this.dqn.train(steps);
    const knowledge = this.knowledge.consolidate(knowledgeEpochs);
    return { trainingSteps: results.length, knowledgeLoss: knowledge.finalLoss };
  }

  /** Ghi nhớ một sự kiện tri thức. */
  public learnFact(subject: string, relation: string, object: string, confidence = 0.8): number {
    return this.knowledge.observe(subject, relation, object, confidence).novelty;
  }

  /** Suy luận từ tri thức đã học. */
  public recall(subject: string, relation: string): string[] {
    return this.knowledge.ask(subject, relation).map((triple) => triple.object);
  }

  /** Dự đoán liên kết còn thiếu. */
  public predict(subject: string, relation: string, limit = 3): Array<{ entity: string; score: number }> {
    return this.knowledge.predict(subject, relation, limit);
  }

  /** Tự suy ngẫm: mô tả trạng thái học hiện tại. */
  public reflect(): string {
    const epsilon = this.dqn.epsilon.toFixed(3);
    const reward = this.totalReward.toFixed(2);
    const action = this.lastThought?.action ?? this.actions[0];
    return `Agent ${this.id}: ${this.observationCount} quan sát, ${this.knowledge.graph.size} tri thức, ` +
      `epsilon ${epsilon}, tổng thưởng ${reward}, hành động gần nhất "${action}".`;
  }

  /** Suy nghĩ cuối cùng trước khi chết — dùng cho di sản tri thức. */
  public lastWords(): string {
    const thought = this.lastThought;
    const memory = this.knowledge.graph.size;
    if (!thought) return `Ta ra đi khi chưa kịp hiểu thế giới (${memory} điều đã biết).`;
    return `Sau ${this.observationCount} lần quan sát và ${memory} điều học được, ` +
      `ta chọn "${thought.action}" lần cuối. ${thought.thought}`;
  }

  /** Ảnh chụp để lưu. */
  public snapshot(): NeuralAgentSnapshot {
    return {
      config: { ...this.config },
      dqn: this.dqn.snapshot(),
      knowledgeGraph: this.knowledge.graph.snapshot(),
      knowledgeEmbedding: this.knowledge.embedding.snapshot(),
      totalReward: this.totalReward,
      episode: this.episode,
      observationCount: this.observationCount,
      seedState: this.random.getState(),
    };
  }

  /** Khôi phục bộ não. */
  public static fromSnapshot(snapshot: NeuralAgentSnapshot): NeuralAgentBrain {
    const brain = new NeuralAgentBrain(snapshot.config);
    const dqn = DeepQNetwork.fromSnapshot(snapshot.dqn);
    for (let l = 0; l < brain.dqn.online.layers.length; l++) {
      const source = dqn.online.layers[l];
      const target = brain.dqn.online.layers[l];
      for (let o = 0; o < target.outputSize; o++) {
        target.biases[o] = source.biases[o];
        for (let i = 0; i < target.inputSize; i++) target.weights[o][i] = source.weights[o][i];
      }
      const sourceTarget = dqn.target.layers[l];
      const targetTarget = brain.dqn.target.layers[l];
      for (let o = 0; o < targetTarget.outputSize; o++) {
        targetTarget.biases[o] = sourceTarget.biases[o];
        for (let i = 0; i < targetTarget.inputSize; i++) {
          targetTarget.weights[o][i] = sourceTarget.weights[o][i];
        }
      }
    }
    brain.dqn.epsilon = snapshot.dqn.epsilon;
    for (const triple of snapshot.knowledgeGraph.triples) {
      brain.knowledge.graph.addTriple(triple.subject, triple.relation, triple.object, triple.confidence, triple.source);
    }
    for (const [key, value] of snapshot.knowledgeEmbedding.entities) {
      brain.knowledge.embedding.entityVectors.set(key, [...value]);
    }
    for (const [key, value] of snapshot.knowledgeEmbedding.relations) {
      brain.knowledge.embedding.relationVectors.set(key, [...value]);
    }
    brain.totalReward = snapshot.totalReward;
    brain.episode = snapshot.episode;
    brain.observationCount = snapshot.observationCount;
    brain.random.setState(snapshot.seedState);
    return brain;
  }

  /** Suy nghĩ nội tâm từ hành động + nhu cầu/cảm xúc. */
  private composeThought(
    action: string,
    need: string | null,
    emotion: string | null,
    confidence: number,
    intrinsic: number,
  ): string {
    const drive = need ? `nhu cầu "${need}" đang mạnh` : 'không có nhu cầu áp đảo';
    const mood = emotion ? `cảm xúc "${emotion}" chi phối` : 'cảm xúc trung tính';
    const curiosity = intrinsic > 0.15 ? ' và tò mò với điều chưa biết' : '';
    const certainty = confidence > 0.7 ? 'khá chắc chắn' : confidence > 0.4 ? 'cân nhắc' : 'còn do dự';
    return `Ta ${certainty}: ${drive}, ${mood}${curiosity}; nên chọn "${action}".`;
  }
}

/** Khoá có giá trị lớn nhất trong bản ghi số. */
export function dominantKey(record: Record<string, number> | undefined): string | null {
  if (!record) return null;
  let bestKey: string | null = null;
  let bestValue = -Infinity;
  for (const [key, value] of Object.entries(record)) {
    if (Number.isFinite(value) && value > bestValue) {
      bestValue = value;
      bestKey = key;
    }
  }
  return bestKey;
}
