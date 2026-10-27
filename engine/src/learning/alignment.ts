/**
 * @file alignment.ts
 * @module @aetheria/engine/learning/alignment
 * @description Học căn chỉnh và suy luận cho agent:
 *
 * - `RewardModelTrainer`: mô hình thưởng từ cặp ưu tiên (Bradley–Terry).
 * - `RLHFTrainer`: PPO với reward model và hình phạt KL so với reference policy.
 * - `DPOTrainer`: Direct Preference Optimization trên policy rời rạc.
 * - `MonteCarloTreeSearch`: MCTS UCT tổng quát cho môi trường có mô hình.
 * - `AlphaZeroTrainer`: học policy/value từ phân phối thăm MCTS.
 * - `STaRTrainer`: self-taught reasoning với verifier và rationalization.
 * - `ProcessRewardModelTrainer` (PRM): chấm điểm từng bước suy luận.
 *
 * Toàn bộ module thuần TypeScript, không phụ thuộc DOM/Next.js, nhờ đó có thể
 * dùng cả trong worker huấn luyện lẫn runtime suy luận trên client.
 */

import { NeuralNetwork, type OptimizerConfig } from '../deeplearning/nn.js';
import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';
import {
  applyNetworkGradient,
  argmaxIndex,
  backpropagateNetwork,
  binaryCrossEntropyGradient,
  clipNetworkGradient,
  createNetworkGradient,
  logSoftmaxVector,
  oneHot,
  softmaxCrossEntropyGradient,
  softmaxVector,
} from './network.js';
import type {
  LearningOptions,
  LearningReport,
  NumericVector,
  SupervisedSample,
} from './types.js';
import { SupervisedTrainer } from './supervised.js';
import {
  PPOTrainer,
  sampleCategorical,
  type PPOConfig,
  type PPORolloutStep,
  type PPOSnapshot,
  type PPOTrainResult,
  type PPOUpdateOptions,
} from './reinforcement/ppo.js';
import { emptyLearningReport, restoreWeightsFromSnapshot } from './internal.js';

/** Cấu hình mô hình thưởng. */
export interface RewardModelConfig {
  /** Số chiều vector biểu diễn trạng thái/phản hồi. */
  inputSize: number;
  hiddenSizes?: readonly number[];
  learningRate?: number;
  seed?: number;
}

/** Một cặp ưu tiên: `chosen` được con người/verifier đánh giá tốt hơn. */
export interface PreferencePair {
  chosen: NumericVector;
  rejected: NumericVector;
  weight?: number;
}

/** Ảnh chụp mô hình thưởng. */
export interface RewardModelSnapshot {
  config: RewardModelConfig;
  network: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Mô hình thưởng Bradley–Terry.
 *
 * Xác suất `chosen` tốt hơn `rejected` là `σ(r(chosen) − r(rejected))`.
 * Loss `−log σ(r_c − r_r)` cho gradient:
 * `∂L/∂r_c = σ − 1`, `∂L/∂r_r = 1 − σ`.
 */
export class RewardModelTrainer {
  public readonly network: NeuralNetwork;

  private readonly config: RewardModelConfig;
  private readonly random: DeepRandom;

  constructor(config: RewardModelConfig) {
    if (config.inputSize <= 0) throw new RangeError('Reward model cần inputSize dương');
    this.config = { ...config };
    this.random = new DeepRandom(config.seed ?? 1);
    this.network = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.001,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
  }

  /** Điểm thưởng vô hướng. */
  public score(state: NumericVector): number {
    return this.network.predict(state)[0] ?? 0;
  }

  /** Xác suất mô hình cho rằng `chosen` tốt hơn `rejected`. */
  public preferenceProbability(chosen: NumericVector, rejected: NumericVector): number {
    return sigmoid(this.score(chosen) - this.score(rejected));
  }

  /** Huấn luyện từ các cặp ưu tiên. */
  public fit(
    pairs: readonly PreferencePair[],
    options: LearningOptions = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 32));
    const order = Array.from({ length: pairs.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;
    let lastAccuracy = 0;

    if (pairs.length === 0) {
      return emptyLearningReport(startedAt);
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      let correct = 0;

      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.network);
        let batchLoss = 0;

        for (const index of batch) {
          const pair = pairs[index];
          const weight = Math.max(0, pair.weight ?? 1);
          const chosenScore = this.network.forward(pair.chosen, true)[0] ?? 0;
          const rejectedScore = this.network.forward(pair.rejected, true)[0] ?? 0;
          const probability = sigmoid(chosenScore - rejectedScore);
          const loss = -Math.log(Math.max(probability, 1e-12)) * weight;
          batchLoss += loss;
          if (probability > 0.5) correct++;

          backpropagateNetwork(this.network, [(probability - 1) * weight], {
            gradient,
            apply: false,
          });
          backpropagateNetwork(this.network, [(1 - probability) * weight], {
            gradient,
            apply: false,
          });
        }

        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.network, gradient, {
          optimizer: this.network.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }

      const average = epochLoss / pairs.length;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
      lastAccuracy = correct / pairs.length;
    }

    return {
      epochs,
      steps,
      samples: pairs.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { accuracy: lastAccuracy },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá accuracy của cặp ưu tiên. */
  public evaluate(pairs: readonly PreferencePair[]): { loss: number; accuracy: number } {
    if (pairs.length === 0) return { loss: 0, accuracy: 0 };
    let loss = 0;
    let correct = 0;
    for (const pair of pairs) {
      const probability = this.preferenceProbability(pair.chosen, pair.rejected);
      loss -= Math.log(Math.max(probability, 1e-12));
      if (probability > 0.5) correct++;
    }
    return { loss: loss / pairs.length, accuracy: correct / pairs.length };
  }

  /** Xếp hạng danh sách trạng thái theo điểm giảm dần. */
  public rank(states: readonly NumericVector[]): { state: NumericVector; score: number }[] {
    return states
      .map((state) => ({ state, score: this.score(state) }))
      .sort((a, b) => b.score - a.score);
  }

  public snapshot(): RewardModelSnapshot {
    return { config: { ...this.config }, network: this.network.snapshot() };
  }

  public static fromSnapshot(snapshot: RewardModelSnapshot): RewardModelTrainer {
    const trainer = new RewardModelTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.network, trainer.network);
    return trainer;
  }
}

/** Cấu hình RLHF. */
export interface RLHFConfig {
  policy: PPOConfig;
  /** Mô hình thưởng; mặc định tạo mới cùng inputSize với policy. */
  rewardModel?: RewardModelConfig;
  /** Reference policy cho KL; mặc định bản sao đóng băng của policy ban đầu. */
  referencePolicy?: NeuralNetwork;
  /** Hệ số nhân điểm thưởng mô hình. */
  rewardScale?: number;
  /** Hệ số phạt KL mỗi bước. */
  klCoef?: number;
}

/** Rollout RLHF có thể kèm trạng thái kế tiếp để chấm thưởng. */
export interface RLHFRolloutStep extends PPORolloutStep {
  nextState?: NumericVector;
}

/** Kết quả một vòng RLHF. */
export interface RLHFTrainResult {
  policy: PPOTrainResult;
  meanReward: number;
  meanKL: number;
}

/** Ảnh chụp RLHF. */
export interface RLHFSnapshot {
  config: Omit<RLHFConfig, 'referencePolicy'>;
  policy: PPOSnapshot;
  rewardModel: RewardModelSnapshot;
  referencePolicy: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * RLHF: PPO tối ưu policy theo `reward môi trường + β·reward model − λ·KL`.
 *
 * KL được đo giữa policy hiện tại và reference policy đóng băng tại thời điểm
 * khởi tạo, đúng tinh thần RLHF tiêu chuẩn.
 */
export class RLHFTrainer {
  public readonly policy: PPOTrainer;
  public readonly rewardModel: RewardModelTrainer;
  public readonly referencePolicy: NeuralNetwork;
  public readonly rewardScale: number;
  public readonly klCoef: number;

  private readonly config: RLHFConfig;

  constructor(config: RLHFConfig) {
    this.config = {
      ...config,
      policy: { ...config.policy, actions: [...config.policy.actions] },
    };
    this.policy = new PPOTrainer(config.policy);
    this.rewardModel = new RewardModelTrainer(
      config.rewardModel ?? { inputSize: config.policy.inputSize, seed: config.policy.seed },
    );
    if (this.rewardModel.network.inputSize !== config.policy.inputSize) {
      throw new RangeError('Reward model và policy khác inputSize');
    }
    this.referencePolicy = config.referencePolicy ?? this.policy.policy.clone();
    this.rewardScale = config.rewardScale ?? 1;
    this.klCoef = Math.max(0, config.klCoef ?? 0.01);
  }

  /** Huấn luyện reward model từ cặp ưu tiên. */
  public trainRewardModel(
    pairs: readonly PreferencePair[],
    options: LearningOptions = {},
  ): LearningReport {
    return this.rewardModel.fit(pairs, options);
  }

  /**
   * Một vòng RLHF.
   *
   * Reward từng bước = reward gốc + `rewardScale·r_model(nextState)` −
   * `klCoef·(logπ_old − logπ_ref)`. Sau đó PPO cập nhật policy/critic.
   */
  public train(
    rollout: readonly RLHFRolloutStep[],
    options: PPOUpdateOptions = {},
  ): RLHFTrainResult {
    if (rollout.length === 0) {
      return {
        policy: {
          policyLoss: 0,
          valueLoss: 0,
          entropy: 0,
          approxKL: 0,
          clipFraction: 0,
          meanReturn: 0,
          epochs: 0,
          samples: 0,
        },
        meanReward: 0,
        meanKL: 0,
      };
    }

    let totalReward = 0;
    let totalKL = 0;
    const augmented: RLHFRolloutStep[] = rollout.map((step) => {
      const action = clampRange(step.action, 0, this.policy.actions.length - 1);
      const logits = this.policy.policy.predict(step.state);
      const logProbability = logSoftmaxVector(logits)[action] ?? Math.log(1e-12);
      const referenceLogits = this.referencePolicy.predict(step.state);
      const referenceLogProbability =
        logSoftmaxVector(referenceLogits)[action] ?? Math.log(1e-12);
      const kl = logProbability - referenceLogProbability;
      const modelReward = this.rewardModel.score(step.nextState ?? step.state);
      totalReward += modelReward;
      totalKL += kl;
      return {
        ...step,
        state: [...step.state],
        reward: step.reward + this.rewardScale * modelReward - this.klCoef * kl,
      };
    });

    return {
      policy: this.policy.train(augmented, options),
      meanReward: totalReward / augmented.length,
      meanKL: totalKL / augmented.length,
    };
  }

  /** Cập nhật reference policy (ví dụ sau khi chuyển sang giai đoạn mới). */
  public updateReferencePolicy(network: NeuralNetwork = this.policy.policy): void {
    restoreWeightsFromSnapshot(network.snapshot(), this.referencePolicy);
  }

  public snapshot(): RLHFSnapshot {
    const { referencePolicy: _reference, ...config } = this.config;
    return {
      config: {
        ...config,
        policy: { ...this.config.policy, actions: [...this.policy.actions] },
      },
      policy: this.policy.snapshot(),
      rewardModel: this.rewardModel.snapshot(),
      referencePolicy: this.referencePolicy.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: RLHFSnapshot): RLHFTrainer {
    const trainer = new RLHFTrainer({
      ...snapshot.config,
      referencePolicy: NeuralNetwork.fromSnapshot(snapshot.referencePolicy),
    });
    restoreWeightsFromSnapshot(snapshot.policy.policy, trainer.policy.policy);
    restoreWeightsFromSnapshot(snapshot.policy.critic, trainer.policy.critic);
    restoreWeightsFromSnapshot(snapshot.rewardModel.network, trainer.rewardModel.network);
    return trainer;
  }
}

/** Cấu hình DPO. */
export interface DPOConfig {
  inputSize: number;
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  learningRate?: number;
  /** Hệ số β điều chỉnh độ mạnh tín hiệu ưu tiên. */
  beta?: number;
  seed?: number;
  /** Reference policy; mặc định bản sao đóng băng của policy khởi tạo. */
  reference?: NeuralNetwork;
}

/** Một cặp hành động ưu tiên cho DPO. */
export interface DPOActionPair {
  state: NumericVector;
  chosen: number;
  rejected: number;
  weight?: number;
}

/** Ảnh chụp DPO. */
export interface DPOSnapshot {
  config: Omit<DPOConfig, 'reference'>;
  policy: ReturnType<NeuralNetwork['snapshot']>;
  reference: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Direct Preference Optimization rời rạc.
 *
 * `L = −log σ(β[(logπ(c)−logπ_ref(c)) − (logπ(r)−logπ_ref(r))])`.
 * Gradient theo logits policy là `(σ−1)·β·(e_c − e_r)`; reference không cập nhật.
 */
export class DPOTrainer {
  public readonly actions: readonly string[];
  public readonly policy: NeuralNetwork;
  public readonly reference: NeuralNetwork;
  public readonly beta: number;

  private readonly config: DPOConfig;
  private readonly random: DeepRandom;

  constructor(config: DPOConfig) {
    if (config.actions.length === 0) throw new RangeError('DPO cần ít nhất một hành động');
    this.config = { ...config, actions: [...config.actions] };
    this.actions = [...config.actions];
    this.beta = Math.max(1e-6, config.beta ?? 0.1);
    this.random = new DeepRandom(config.seed ?? 1);
    this.policy = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: this.actions.length,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.0005,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
    this.reference = config.reference ?? this.policy.clone();
    if (
      this.reference.inputSize !== this.policy.inputSize ||
      this.reference.outputSize !== this.policy.outputSize
    ) {
      throw new RangeError('Reference policy khác kiến trúc với policy DPO');
    }
  }

  /** Xác suất hành động của policy. */
  public probabilities(state: NumericVector): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Huấn luyện DPO từ các cặp ưu tiên. */
  public fit(pairs: readonly DPOActionPair[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 16));
    const order = Array.from({ length: pairs.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;
    let lastAccuracy = 0;

    if (pairs.length === 0) return emptyLearningReport(startedAt);

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      let correct = 0;

      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.policy);
        let batchLoss = 0;

        for (const index of batch) {
          const pair = pairs[index];
          const chosen = clampRange(Math.floor(pair.chosen), 0, this.actions.length - 1);
          const rejected = clampRange(Math.floor(pair.rejected), 0, this.actions.length - 1);
          const weight = Math.max(0, pair.weight ?? 1);
          const policyLogProbabilities = logSoftmaxVector(this.policy.forward(pair.state, true));
          const referenceLogProbabilities = logSoftmaxVector(this.reference.predict(pair.state));
          const delta =
            this.beta *
            ((policyLogProbabilities[chosen] ?? 0) -
              (referenceLogProbabilities[chosen] ?? 0) -
              (policyLogProbabilities[rejected] ?? 0) +
              (referenceLogProbabilities[rejected] ?? 0));
          const probability = sigmoid(delta);
          const loss = -Math.log(Math.max(probability, 1e-12)) * weight;
          batchLoss += loss;
          if (probability > 0.5) correct++;

          const gradLogits = new Array<number>(this.actions.length).fill(0);
          const coefficient = (probability - 1) * this.beta * weight;
          gradLogits[chosen] += coefficient;
          gradLogits[rejected] -= coefficient;
          backpropagateNetwork(this.policy, gradLogits, {
            gradient,
            skipOutputActivation: true,
            apply: false,
          });
        }

        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.policy, gradient, {
          optimizer: this.policy.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }

      const average = epochLoss / pairs.length;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
      lastAccuracy = correct / pairs.length;
    }

    return {
      epochs,
      steps,
      samples: pairs.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { accuracy: lastAccuracy, beta: this.beta },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Đánh giá nhanh accuracy ưu tiên. */
  public evaluate(pairs: readonly DPOActionPair[]): { loss: number; accuracy: number } {
    if (pairs.length === 0) return { loss: 0, accuracy: 0 };
    let loss = 0;
    let correct = 0;
    for (const pair of pairs) {
      const policyLogs = logSoftmaxVector(this.policy.predict(pair.state));
      const referenceLogs = logSoftmaxVector(this.reference.predict(pair.state));
      const delta =
        this.beta *
        ((policyLogs[pair.chosen] ?? 0) -
          (referenceLogs[pair.chosen] ?? 0) -
          (policyLogs[pair.rejected] ?? 0) +
          (referenceLogs[pair.rejected] ?? 0));
      const probability = sigmoid(delta);
      loss -= Math.log(Math.max(probability, 1e-12));
      if (probability > 0.5) correct++;
    }
    return { loss: loss / pairs.length, accuracy: correct / pairs.length };
  }

  public snapshot(): DPOSnapshot {
    const { reference: _reference, ...config } = this.config;
    return {
      config: { ...config, actions: [...this.actions] },
      policy: this.policy.snapshot(),
      reference: this.reference.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: DPOSnapshot): DPOTrainer {
    const trainer = new DPOTrainer({
      ...snapshot.config,
      reference: NeuralNetwork.fromSnapshot(snapshot.reference),
    });
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    restoreWeightsFromSnapshot(snapshot.reference, trainer.reference);
    return trainer;
  }
}

// ---------------------------------------------------------------------------
// MCTS / AlphaZero
// ---------------------------------------------------------------------------

/** Môi trường có mô hình cho MCTS. */
export interface MCTSEnvironment<TState> {
  actions(state: TState): readonly number[];
  step(state: TState, action: number): { state: TState; reward: number; done: boolean };
  /** Giá trị ước lượng tại trạng thái (heuristic hoặc value network). */
  evaluate(state: TState): number;
  isTerminal?(state: TState): boolean;
  /** Rollout ngẫu nhiên tùy chọn; nếu có sẽ thay cho `evaluate` tại leaf. */
  rollout?(state: TState, random: DeepRandom): number;
}

/** Cấu hình MCTS. */
export interface MCTSConfig {
  simulations?: number;
  /** Hằng số khám phá UCT. */
  exploration?: number;
  discount?: number;
  maxDepth?: number;
  seed?: number;
}

/** Kết quả tìm kiếm MCTS. */
export interface MCTSResult {
  /** Hành động tốt nhất; `-1` nếu không có hành động. */
  action: number;
  actions: number[];
  visitCounts: number[];
  visitDistribution: number[];
  rootValue: number;
  simulations: number;
  bestSequence: number[];
}

/** Node MCTS nội bộ. */
interface MCTSNode<TState> {
  state: TState;
  action: number;
  reward: number;
  children: Map<number, MCTSNode<TState>>;
  untried: number[];
  visits: number;
  value: number;
}

/**
 * Monte Carlo Tree Search với UCT.
 *
 * Mỗi simulation gồm selection theo UCB, expansion một hành động chưa thử,
 * đánh giá leaf và backprop return chiết khấu. Không cần mạng nơ-ron; có thể
 * dùng world model hoặc mô phỏng game làm môi trường.
 */
export class MonteCarloTreeSearch<TState> {
  public readonly environment: MCTSEnvironment<TState>;
  public readonly simulations: number;
  public readonly exploration: number;
  public readonly discount: number;
  public readonly maxDepth: number;

  private readonly random: DeepRandom;

  constructor(environment: MCTSEnvironment<TState>, config: MCTSConfig = {}) {
    this.environment = environment;
    this.simulations = Math.max(1, Math.floor(config.simulations ?? 256));
    this.exploration = Math.max(0, config.exploration ?? 1.4);
    this.discount = clampRange(config.discount ?? 0.99, 0, 1);
    this.maxDepth = Math.max(1, Math.floor(config.maxDepth ?? 64));
    this.random = new DeepRandom(config.seed ?? 1);
  }

  /** Tìm hành động tốt nhất từ trạng thái. */
  public search(state: TState): MCTSResult {
    const root = this.createNode(state, -1, 0);
    for (let i = 0; i < this.simulations; i++) this.simulate(root);

    const rootActions = [...root.children.keys()];
    const visitCounts = rootActions.map((action) => root.children.get(action)?.visits ?? 0);
    const totalVisits = visitCounts.reduce((sum, value) => sum + value, 0) || 1;
    let bestIndex = 0;
    for (let i = 1; i < visitCounts.length; i++) {
      if (visitCounts[i] > visitCounts[bestIndex]) bestIndex = i;
    }
    const action = rootActions[bestIndex] ?? -1;
    return {
      action,
      actions: rootActions,
      visitCounts,
      visitDistribution: visitCounts.map((count) => count / totalVisits),
      rootValue: root.visits > 0 ? root.value / root.visits : 0,
      simulations: this.simulations,
      bestSequence: this.bestSequence(root),
    };
  }

  /** Chạy một simulation từ root. */
  private simulate(root: MCTSNode<TState>): void {
    const path: MCTSNode<TState>[] = [root];
    let node = root;
    let depth = 0;

    while (
      node.untried.length === 0 &&
      node.children.size > 0 &&
      depth < this.maxDepth &&
      !this.isTerminal(node.state)
    ) {
      node = this.selectChild(node);
      path.push(node);
      depth++;
    }

    if (
      node.untried.length > 0 &&
      depth < this.maxDepth &&
      !this.isTerminal(node.state)
    ) {
      const index = this.random.int(0, node.untried.length - 1);
      const action = node.untried.splice(index, 1)[0];
      const transition = this.environment.step(node.state, action);
      const child = this.createNode(transition.state, action, transition.reward);
      node.children.set(action, child);
      node = child;
      path.push(node);
    }

    let leafValue = this.evaluateLeaf(node.state);
    if (!Number.isFinite(leafValue)) leafValue = 0;
    let running = leafValue;
    for (let i = path.length - 1; i >= 0; i--) {
      const current = path[i];
      if (i > 0) running = current.reward + this.discount * running;
      current.visits++;
      current.value += running;
    }
  }

  /** Chọn con theo UCB1. */
  private selectChild(node: MCTSNode<TState>): MCTSNode<TState> {
    const logVisits = Math.log(Math.max(1, node.visits));
    let best = [...node.children.values()][0];
    let bestScore = -Infinity;
    for (const child of node.children.values()) {
      const exploitation = child.value / Math.max(1, child.visits);
      const exploration = this.exploration * Math.sqrt(logVisits / Math.max(1, child.visits));
      const score = exploitation + exploration;
      if (score > bestScore) {
        bestScore = score;
        best = child;
      }
    }
    return best;
  }

  /** Tạo node với danh sách hành động chưa thử. */
  private createNode(
    state: TState,
    action: number,
    reward: number,
  ): MCTSNode<TState> {
    const actions = [...new Set(this.environment.actions(state))];
    return {
      state,
      action,
      reward,
      children: new Map(),
      untried: actions,
      visits: 0,
      value: 0,
    };
  }

  /** Đánh giá leaf bằng rollout hoặc heuristic. */
  private evaluateLeaf(state: TState): number {
    if (this.environment.rollout) return this.environment.rollout(state, this.random);
    return this.environment.evaluate(state);
  }

  /** Trạng thái kết thúc do môi trường hoặc không còn hành động. */
  private isTerminal(state: TState): boolean {
    if (this.environment.isTerminal) return this.environment.isTerminal(state);
    return this.environment.actions(state).length === 0;
  }

  /** Chuỗi hành động tham lam theo visit count. */
  private bestSequence(root: MCTSNode<TState>): number[] {
    const sequence: number[] = [];
    let node = root;
    while (node.children.size > 0 && sequence.length < this.maxDepth) {
      let best: MCTSNode<TState> | null = null;
      for (const child of node.children.values()) {
        if (!best || child.visits > best.visits) best = child;
      }
      if (!best) break;
      sequence.push(best.action);
      node = best;
    }
    return sequence;
  }
}

/** Một mẫu huấn luyện AlphaZero. */
export interface AlphaZeroSample {
  state: NumericVector;
  /** Phân phối thăm của MCTS theo thứ tự hành động. */
  visitDistribution: readonly number[];
  /** Kết quả cuối episode, thường trong `[-1, 1]`. */
  outcome: number;
}

/** Cấu hình AlphaZero. */
export interface AlphaZeroConfig {
  inputSize: number;
  actionCount: number;
  hiddenSizes?: readonly number[];
  policyLearningRate?: number;
  valueLearningRate?: number;
  seed?: number;
}

/** Ảnh chụp AlphaZero. */
export interface AlphaZeroSnapshot {
  config: AlphaZeroConfig;
  policy: ReturnType<NeuralNetwork['snapshot']>;
  value: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * AlphaZero: policy học phân phối thăm MCTS, value học kết quả episode.
 *
 * Trainer chỉ học từ mẫu; hàm `createAlphaZeroSamples` bên dưới tạo mẫu tự chơi
 * bằng MCTS trên một môi trường bất kỳ.
 */
export class AlphaZeroTrainer {
  public readonly policy: NeuralNetwork;
  public readonly value: NeuralNetwork;

  private readonly config: AlphaZeroConfig;
  private readonly random: DeepRandom;

  constructor(config: AlphaZeroConfig) {
    if (config.inputSize <= 0) throw new RangeError('AlphaZero cần inputSize dương');
    if (config.actionCount <= 0) throw new RangeError('AlphaZero cần actionCount dương');
    this.config = { ...config };
    this.random = new DeepRandom(config.seed ?? 1);
    this.policy = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: config.actionCount,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.policyLearningRate ?? 0.001,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
    this.value = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.valueLearningRate ?? 0.001,
        weightDecay: 0.0001,
      },
      seed: (config.seed ?? 1) + 1,
    });
  }

  /** Huấn luyện policy/value từ mẫu MCTS. */
  public fit(samples: readonly AlphaZeroSample[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 32));
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    if (samples.length === 0) return emptyLearningReport(startedAt);

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const policyGradient = createNetworkGradient(this.policy);
        const valueGradient = createNetworkGradient(this.value);
        let batchLoss = 0;

        for (const index of batch) {
          const sample = samples[index];
          const logits = this.policy.forward(sample.state, true);
          const policyLoss = softmaxCrossEntropyGradient(logits, sample.visitDistribution);
          batchLoss += policyLoss.loss;
          backpropagateNetwork(this.policy, policyLoss.gradLogits, {
            gradient: policyGradient,
            skipOutputActivation: true,
            apply: false,
          });

          const predicted = this.value.forward(sample.state, true);
          const error = (predicted[0] ?? 0) - sample.outcome;
          batchLoss += error * error;
          backpropagateNetwork(this.value, [2 * error], {
            gradient: valueGradient,
            apply: false,
          });
        }

        if (options.gradientClip) {
          clipNetworkGradient(policyGradient, options.gradientClip);
          clipNetworkGradient(valueGradient, options.gradientClip);
        }
        applyNetworkGradient(this.policy, policyGradient, {
          optimizer: this.policy.optimizer,
          batchSize: batch.length,
        });
        applyNetworkGradient(this.value, valueGradient, {
          optimizer: this.value.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }
      const average = epochLoss / samples.length;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: {},
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Xác suất policy (softmax). */
  public probabilities(state: NumericVector): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Giá trị trạng thái dự đoán. */
  public stateValue(state: NumericVector): number {
    return this.value.predict(state)[0] ?? 0;
  }

  public snapshot(): AlphaZeroSnapshot {
    return {
      config: { ...this.config },
      policy: this.policy.snapshot(),
      value: this.value.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: AlphaZeroSnapshot): AlphaZeroTrainer {
    const trainer = new AlphaZeroTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    restoreWeightsFromSnapshot(snapshot.value, trainer.value);
    return trainer;
  }
}

/**
 * Sinh mẫu tự chơi bằng MCTS.
 *
 * Mỗi bước, phân phối thăm MCTS (có nhiệt độ) được lưu làm target policy; kết
 * quả episode là tổng thưởng chiết khấu và được gán cho mọi mẫu.
 */
export function createAlphaZeroSamples<TState extends NumericVector>(
  environment: MCTSEnvironment<TState>,
  search: MonteCarloTreeSearch<TState>,
  createInitial: () => TState,
  episodes = 1,
  options: {
    temperature?: number;
    maxSteps?: number;
    discount?: number;
    seed?: number;
    outcomeScale?: number;
  } = {},
): AlphaZeroSample[] {
  const temperature = Math.max(1e-4, options.temperature ?? 1);
  const maxSteps = Math.max(1, Math.floor(options.maxSteps ?? 128));
  const discount = clampRange(options.discount ?? 0.99, 0, 1);
  const outcomeScale = options.outcomeScale ?? 1;
  const random = new DeepRandom(options.seed ?? 1);
  const samples: AlphaZeroSample[] = [];

  for (let episode = 0; episode < Math.max(1, Math.floor(episodes)); episode++) {
    let state = createInitial();
    const episodeSamples: AlphaZeroSample[] = [];
    let outcome = 0;
    let weight = 1;

    for (let step = 0; step < maxSteps; step++) {
      if (environment.isTerminal?.(state)) break;
      const result = search.search(state);
      if (result.action < 0) break;
      const distribution = applyTemperature(result.visitDistribution, temperature);
      episodeSamples.push({
        state: [...state],
        visitDistribution: distribution,
        outcome: 0,
      });
      const action = sampleCategorical(distribution, random);
      const transition = environment.step(state, action);
      outcome += weight * transition.reward;
      weight *= discount;
      state = transition.state;
      if (transition.done) break;
    }

    const scaled = clampRange(outcome * outcomeScale, -1, 1);
    for (const sample of episodeSamples) sample.outcome = scaled;
    samples.push(...episodeSamples);
  }
  return samples;
}

/** Áp nhiệt độ lên phân phối thăm; T→0 trở thành argmax. */
export function applyTemperature(
  distribution: readonly number[],
  temperature: number,
): number[] {
  if (distribution.length === 0) return [];
  if (temperature <= 1e-4) return oneHot(argmaxIndex(distribution), distribution.length);
  let max = -Infinity;
  for (const value of distribution) max = Math.max(max, value);
  const powered = distribution.map((value) => Math.pow(Math.max(value, 1e-12), 1 / temperature));
  const total = powered.reduce((sum, value) => sum + value, 0) || 1;
  return powered.map((value) => value / total);
}

// ---------------------------------------------------------------------------
// STaR / PRM
// ---------------------------------------------------------------------------

/** Môi trường suy luận cho STaR: bước rời rạc + verifier. */
export interface ReasoningEnvironment {
  initial(input: NumericVector): NumericVector;
  step(state: NumericVector, action: number): { state: NumericVector; done: boolean };
  verify(input: NumericVector, trajectory: readonly number[]): boolean;
}

/** Cấu hình STaR. */
export interface STaRConfig {
  inputSize: number;
  actionCount: number;
  hiddenSizes?: readonly number[];
  learningRate?: number;
  maxSteps?: number;
  seed?: number;
}

/** Kết quả một vòng STaR. */
export interface STaRResult {
  report: LearningReport;
  attempted: number;
  accepted: number;
  rationalized: number;
  acceptanceRate: number;
}

/** Ảnh chụp STaR. */
export interface STaRSnapshot {
  config: STaRConfig;
  policy: ReturnType<NeuralNetwork['snapshot']>;
  samples: SupervisedSample[];
}

/**
 * Self-Taught Reasoning (STaR).
 *
 * Policy sinh chuỗi bước suy luận; verifier chấm đúng/sai. Chỉ các chuỗi được
 * verifier chấp nhận mới được thêm vào tập huấn luyện. Nếu thất bại và có
 * `rationalize`, trainer thử lại với gợi ý của chuyên gia (rationale) rồi mới
 * quyết định thêm mẫu.
 */
export class STaRTrainer {
  public readonly policy: NeuralNetwork;
  public readonly environment: ReasoningEnvironment;
  public readonly maxSteps: number;

  private readonly config: STaRConfig;
  private readonly trainer: SupervisedTrainer;
  private readonly random: DeepRandom;
  private readonly samples: SupervisedSample[] = [];

  constructor(config: STaRConfig, environment: ReasoningEnvironment) {
    if (config.inputSize <= 0) throw new RangeError('STaR cần inputSize dương');
    if (config.actionCount <= 0) throw new RangeError('STaR cần actionCount dương');
    this.config = { ...config };
    this.environment = environment;
    this.maxSteps = Math.max(1, Math.floor(config.maxSteps ?? 16));
    this.random = new DeepRandom(config.seed ?? 1);
    this.policy = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: config.actionCount,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.001,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
    this.trainer = new SupervisedTrainer(this.policy, { loss: 'crossEntropy' });
  }

  /** Số mẫu suy luận đã tích lũy. */
  public get sampleCount(): number {
    return this.samples.length;
  }

  /** Một vòng STaR trên danh sách input. */
  public trainRound(
    inputs: readonly NumericVector[],
    options: {
      /** Sinh chuỗi gợi ý khi policy thất bại; trả `null` nếu không có. */
      rationalize?: (input: NumericVector, policy: NeuralNetwork) => readonly number[] | null;
      learning?: LearningOptions;
    } = {},
  ): STaRResult {
    let accepted = 0;
    let rationalized = 0;

    for (const input of inputs) {
      const trajectory = this.sampleTrajectory(input);
      if (this.environment.verify(input, trajectory)) {
        this.addTrajectory(input, trajectory);
        accepted++;
        continue;
      }
      const hint = options.rationalize?.(input, this.policy);
      if (hint && this.environment.verify(input, hint)) {
        this.addTrajectory(input, hint);
        rationalized++;
      }
    }

    const report = this.samples.length > 0
      ? this.trainer.fit(this.samples, options.learning)
      : emptyLearningReport(Date.now());
    return {
      report,
      attempted: inputs.length,
      accepted,
      rationalized,
      acceptanceRate: inputs.length > 0 ? (accepted + rationalized) / inputs.length : 0,
    };
  }

  /** Xác suất bước kế tiếp. */
  public probabilities(state: NumericVector): number[] {
    return softmaxVector(this.policy.predict(state));
  }

  /** Chọn bước suy luận. */
  public selectAction(state: NumericVector, explore = true): number {
    const probabilities = this.probabilities(state);
    return explore ? sampleCategorical(probabilities, this.random) : argmaxIndex(probabilities);
  }

  /** Sinh chuỗi hành động từ policy hiện tại. */
  public sampleTrajectory(input: NumericVector): number[] {
    let state = this.environment.initial(input);
    const trajectory: number[] = [];
    for (let step = 0; step < this.maxSteps; step++) {
      const action = this.selectAction(state, true);
      trajectory.push(action);
      const transition = this.environment.step(state, action);
      state = transition.state;
      if (transition.done) break;
    }
    return trajectory;
  }

  /** Lưu các cặp (state, action) của một chuỗi đã được chấp nhận. */
  public addTrajectory(input: NumericVector, trajectory: readonly number[]): void {
    let state = this.environment.initial(input);
    for (const action of trajectory) {
      if (action < 0 || action >= this.config.actionCount) break;
      this.samples.push({
        input: [...state],
        target: oneHot(action, this.config.actionCount),
      });
      const transition = this.environment.step(state, action);
      state = transition.state;
      if (transition.done) break;
    }
  }

  /** Huấn luyện trên toàn bộ mẫu đã tích lũy. */
  public fit(options: LearningOptions = {}): LearningReport {
    return this.samples.length > 0 ? this.trainer.fit(this.samples, options) : emptyLearningReport(Date.now());
  }

  public snapshot(): STaRSnapshot {
    return {
      config: { ...this.config },
      policy: this.policy.snapshot(),
      samples: this.samples.map((sample) => ({
        input: [...sample.input],
        target: [...sample.target],
        weight: sample.weight,
      })),
    };
  }

  public static fromSnapshot(
    snapshot: STaRSnapshot,
    environment: ReasoningEnvironment,
  ): STaRTrainer {
    const trainer = new STaRTrainer(snapshot.config, environment);
    restoreWeightsFromSnapshot(snapshot.policy, trainer.policy);
    trainer.samples.push(...snapshot.samples);
    return trainer;
  }
}

/** Một bước suy luận có nhãn đúng/sai cho PRM. */
export interface ProcessStepSample {
  state: NumericVector;
  /** 1 = bước đúng/hữu ích, 0 = bước sai. */
  label: number;
  weight?: number;
}

/** Cấu hình process reward model. */
export interface PRMConfig {
  inputSize: number;
  hiddenSizes?: readonly number[];
  learningRate?: number;
  seed?: number;
}

/** Ảnh chụp PRM. */
export interface PRMSnapshot {
  config: PRMConfig;
  network: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * Process Reward Model: chấm xác suất một bước suy luận là đúng.
 *
 * Khác với reward model cuối chuỗi, PRM cho tín hiệu dày đặc theo từng bước,
 * hữu ích để beam search, MCTS hoặc chọn trajectory tốt nhất.
 */
export class ProcessRewardModelTrainer {
  public readonly network: NeuralNetwork;

  private readonly config: PRMConfig;
  private readonly random: DeepRandom;

  constructor(config: PRMConfig) {
    if (config.inputSize <= 0) throw new RangeError('PRM cần inputSize dương');
    this.config = { ...config };
    this.random = new DeepRandom(config.seed ?? 1);
    this.network = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: {
        kind: 'adam',
        learningRate: config.learningRate ?? 0.001,
        weightDecay: 0.0001,
      },
      seed: config.seed ?? 1,
    });
  }

  /** Xác suất bước đúng. */
  public score(state: NumericVector): number {
    return sigmoid(this.network.predict(state)[0] ?? 0);
  }

  /** Huấn luyện PRM bằng BCE trên nhãn từng bước. */
  public fit(
    samples: readonly ProcessStepSample[],
    options: LearningOptions = {},
  ): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 10));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 32));
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;
    let lastAccuracy = 0;

    if (samples.length === 0) return emptyLearningReport(startedAt);

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      let correct = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const gradient = createNetworkGradient(this.network);
        let batchLoss = 0;
        for (const index of batch) {
          const sample = samples[index];
          const weight = Math.max(0, sample.weight ?? 1);
          const logit = this.network.forward(sample.state, true);
          const result = binaryCrossEntropyGradient(logit, [clamp01(sample.label)], weight);
          batchLoss += result.loss;
          const predictedPositive = (logit[0] ?? 0) > 0;
          const actualPositive = sample.label >= 0.5;
          if (predictedPositive === actualPositive) correct++;
          backpropagateNetwork(this.network, result.gradLogits, {
            gradient,
            skipOutputActivation: true,
            apply: false,
          });
        }
        if (options.gradientClip) clipNetworkGradient(gradient, options.gradientClip);
        applyNetworkGradient(this.network, gradient, {
          optimizer: this.network.optimizer,
          batchSize: batch.length,
        });
        epochLoss += batchLoss;
        steps++;
      }
      const average = epochLoss / samples.length;
      lossHistory.push(average);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
      bestLoss = Math.min(bestLoss, average);
      lastAccuracy = correct / samples.length;
    }

    return {
      epochs,
      steps,
      samples: samples.length,
      initialLoss,
      finalLoss,
      bestLoss: Number.isFinite(bestLoss) ? bestLoss : 0,
      lossHistory,
      metrics: { accuracy: lastAccuracy },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Điểm trung bình/bảo thủ của một trajectory các bước. */
  public scoreTrajectory(
    states: readonly NumericVector[],
    aggregation: 'mean' | 'min' | 'last' = 'mean',
  ): number {
    if (states.length === 0) return 0;
    const scores = states.map((state) => this.score(state));
    if (aggregation === 'min') return Math.min(...scores);
    if (aggregation === 'last') return scores[scores.length - 1];
    return scores.reduce((sum, value) => sum + value, 0) / scores.length;
  }

  /** Xếp hạng nhiều trajectory theo điểm PRM. */
  public rankTrajectories(
    trajectories: readonly (readonly NumericVector[])[],
  ): { index: number; score: number }[] {
    return trajectories
      .map((trajectory, index) => ({ index, score: this.scoreTrajectory(trajectory) }))
      .sort((a, b) => b.score - a.score);
  }

  public snapshot(): PRMSnapshot {
    return { config: { ...this.config }, network: this.network.snapshot() };
  }

  public static fromSnapshot(snapshot: PRMSnapshot): ProcessRewardModelTrainer {
    const trainer = new ProcessRewardModelTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.network, trainer.network);
    return trainer;
  }
}

/** Alias ngắn cho PRM. */
export { ProcessRewardModelTrainer as PRMTrainer };

/** Sigmoid ổn định. */
function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-clampRange(value, -60, 60)));
}


