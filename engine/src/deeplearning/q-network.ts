/**
 * @file q-network.ts
 * @module @aetheria/engine/deeplearning/q-network
 * @description Học tăng cường sâu: Deep Q-Network (DQN, Double DQN, target
 * network, replay ưu tiên) và REINFORCE cho chính sách phân phối. Trạng thái
 * là vector đặc trưng số thực; hành động là chỉ số trong không gian hữu hạn.
 */

import { DeepRandom, clamp01, clampRange } from './random.js';
import { ExperienceReplay, type Transition } from './replay.js';
import { NeuralNetwork, argmax, type NeuralNetworkConfig } from './nn.js';

/** Cấu hình DQN. */
export interface DeepQConfig {
  inputSize: number;
  actions: readonly string[];
  hiddenSizes?: readonly number[];
  learningRate?: number;
  gamma?: number;
  epsilon?: number;
  epsilonMin?: number;
  epsilonDecay?: number;
  batchSize?: number;
  capacity?: number;
  targetSyncInterval?: number;
  doubleQ?: boolean;
  /** Bật cập nhật target mềm (Polyak) thay cho đồng bộ cứng mỗi interval. */
  softTargetUpdate?: boolean;
  /** Hệ số Polyak τ cho soft target update. */
  tau?: number;
  seed?: number;
}

/** Kết quả một bước huấn luyện. */
export interface DQNTrainResult {
  loss: number;
  batchSize: number;
  epsilon: number;
  meanTDError: number;
}

/** Ảnh chụp DQN. */
export interface DeepQSnapshot {
  config: DeepQConfig;
  online: ReturnType<NeuralNetwork['snapshot']>;
  target: ReturnType<NeuralNetwork['snapshot']>;
  epsilon: number;
  steps: number;
  replay: ReturnType<ExperienceReplay<number[], number>['snapshot']>;
}

/** Deep Q-Network. */
export class DeepQNetwork {
  public readonly actions: readonly string[];
  public readonly online: NeuralNetwork;
  public readonly target: NeuralNetwork;
  public readonly replay: ExperienceReplay<number[], number>;
  public readonly gamma: number;
  public readonly batchSize: number;
  public readonly doubleQ: boolean;
  public epsilon: number;

  private readonly epsilonMin: number;
  private readonly epsilonDecay: number;
  private readonly targetSyncInterval: number;
  private readonly softTargetUpdate: boolean;
  private readonly tau: number;
  private readonly random: DeepRandom;
  private steps = 0;
  private readonly config: DeepQConfig;

  constructor(config: DeepQConfig) {
    if (config.actions.length === 0) throw new RangeError('DQN cần ít nhất một hành động');
    this.config = { ...config };
    this.actions = [...config.actions];
    this.gamma = clampRange(config.gamma ?? 0.95, 0, 0.9999);
    this.epsilon = clamp01(config.epsilon ?? 1);
    this.epsilonMin = clamp01(config.epsilonMin ?? 0.05);
    this.epsilonDecay = clampRange(config.epsilonDecay ?? 0.995, 0, 1);
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.targetSyncInterval = Math.max(1, Math.floor(config.targetSyncInterval ?? 50));
    this.doubleQ = config.doubleQ ?? true;
    this.softTargetUpdate = config.softTargetUpdate ?? false;
    this.tau = clampRange(config.tau ?? 0.005, 0.0001, 1);
    this.random = new DeepRandom(config.seed ?? 1);

    const networkConfig: NeuralNetworkConfig = {
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [32, 32],
      outputSize: this.actions.length,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer: { kind: 'adam', learningRate: config.learningRate ?? 0.001 },
      seed: config.seed ?? 1,
    };
    this.online = new NeuralNetwork(networkConfig);
    this.target = this.online.clone();
    this.replay = new ExperienceReplay<number[], number>(config.capacity ?? 10_000, (config.seed ?? 1) + 1);
  }

  /** Số bước đã tương tác. */
  public get interactionCount(): number {
    return this.steps;
  }

  /** Q-value của mọi hành động. */
  public qValues(state: readonly number[]): number[] {
    return this.online.predict(state);
  }

  /** Hành động tốt nhất (không khám phá). */
  public bestAction(state: readonly number[]): number {
    return argmax(this.qValues(state));
  }

  /** Tên hành động tốt nhất. */
  public bestActionName(state: readonly number[]): string {
    return this.actions[this.bestAction(state)] ?? this.actions[0];
  }

  /** Chọn hành động epsilon-greedy. */
  public selectAction(state: readonly number[], explore = true): number {
    if (explore && this.random.chance(this.epsilon)) {
      return this.random.int(0, this.actions.length - 1);
    }
    return this.bestAction(state);
  }

  /** Ghi một bước chuyển vào replay. */
  public observe(transition: Transition<number[], number>): void {
    this.replay.push({ ...transition, priority: Math.abs(transition.reward) });
    this.steps++;
    this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
    if (this.softTargetUpdate) {
      // Soft update mỗi bước giữ target tiến gần online chậm và mượt hơn.
      this.softUpdateTarget(this.tau);
    } else if (this.steps % this.targetSyncInterval === 0) {
      this.syncTarget();
    }
  }

  /** Đồng bộ mạng target từ mạng online. */
  public syncTarget(): void {
    const snapshot = this.online.snapshot();
    for (let l = 0; l < this.target.layers.length; l++) {
      const targetLayer = this.target.layers[l];
      const source = snapshot.layers[l];
      if (!source) continue;
      for (let o = 0; o < targetLayer.outputSize; o++) {
        targetLayer.biases[o] = source.biases[o] ?? 0;
        for (let i = 0; i < targetLayer.inputSize; i++) {
          targetLayer.weights[o][i] = source.weights[o]?.[i] ?? 0;
        }
      }
    }
  }

  /** Cập nhật mềm Polyak: `target = (1 − τ)·target + τ·online`. */
  public softUpdateTarget(tau = this.tau): void {
    const t = clampRange(tau, 0.0001, 1);
    for (let l = 0; l < this.target.layers.length; l++) {
      const targetLayer = this.target.layers[l];
      const onlineLayer = this.online.layers[l];
      if (!onlineLayer) continue;
      for (let o = 0; o < targetLayer.outputSize; o++) {
        targetLayer.biases[o] = (1 - t) * targetLayer.biases[o] + t * onlineLayer.biases[o];
        for (let i = 0; i < targetLayer.inputSize; i++) {
          targetLayer.weights[o][i] = (1 - t) * targetLayer.weights[o][i] + t * onlineLayer.weights[o][i];
        }
      }
    }
  }

  /** Một bước huấn luyện từ replay. Trả `null` nếu chưa đủ mẫu. */
  public trainStep(): DQNTrainResult | null {
    if (this.replay.size < this.batchSize) return null;
    const batch = this.replay.samplePrioritized(this.batchSize);
    let totalLoss = 0;
    let totalTD = 0;

    for (const transition of batch) {
      const qValues = this.online.predict(transition.state);
      const targetValues = [...qValues];
      const action = clampRange(transition.action, 0, this.actions.length - 1);

      if (Number.isFinite(transition.reward) && transition.reward !== 0) {
        let bootstrap = 0;
        if (!transition.done) {
          if (this.doubleQ) {
            const nextAction = argmax(this.online.predict(transition.nextState));
            bootstrap = this.target.predict(transition.nextState)[nextAction] ?? 0;
          } else {
            bootstrap = Math.max(...this.target.predict(transition.nextState));
          }
        }
        const targetValue = transition.reward + this.gamma * bootstrap;
        totalTD += Math.abs(targetValue - qValues[action]);
        targetValues[action] = targetValue;
        transition.priority = Math.abs(targetValue - qValues[action]);
      }

      totalLoss += this.online.trainSample({ input: transition.state, target: targetValues }, 'mse');
    }

    return {
      loss: totalLoss / batch.length,
      batchSize: batch.length,
      epsilon: this.epsilon,
      meanTDError: totalTD / batch.length,
    };
  }

  /** Huấn luyện nhiều bước liên tiếp. */
  public train(steps: number): DQNTrainResult[] {
    const results: DQNTrainResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(steps)); i++) {
      const result = this.trainStep();
      if (!result) break;
      results.push(result);
    }
    return results;
  }

  /** Ảnh chụp để lưu. */
  public snapshot(): DeepQSnapshot {
    return {
      config: { ...this.config },
      online: this.online.snapshot(),
      target: this.target.snapshot(),
      epsilon: this.epsilon,
      steps: this.steps,
      replay: this.replay.snapshot(),
    };
  }

  /** Khôi phục từ ảnh chụp. */
  public static fromSnapshot(snapshot: DeepQSnapshot): DeepQNetwork {
    const network = new DeepQNetwork(snapshot.config);
    const online = NeuralNetwork.fromSnapshot(snapshot.online);
    const target = NeuralNetwork.fromSnapshot(snapshot.target);
    for (let l = 0; l < network.online.layers.length; l++) {
      const source = online.layers[l];
      const destination = network.online.layers[l];
      for (let o = 0; o < destination.outputSize; o++) {
        destination.biases[o] = source.biases[o];
        for (let i = 0; i < destination.inputSize; i++) destination.weights[o][i] = source.weights[o][i];
      }
      const sourceTarget = target.layers[l];
      const destinationTarget = network.target.layers[l];
      for (let o = 0; o < destinationTarget.outputSize; o++) {
        destinationTarget.biases[o] = sourceTarget.biases[o];
        for (let i = 0; i < destinationTarget.inputSize; i++) {
          destinationTarget.weights[o][i] = sourceTarget.weights[o][i];
        }
      }
    }
    network.epsilon = snapshot.epsilon;
    network.steps = snapshot.steps;
    const replay = ExperienceReplay.fromSnapshot(snapshot.replay);
    network.replay.pushMany(replay.latest(replay.size));
    return network;
  }
}

/** Một bước trong episode REINFORCE. */
export interface PolicyStep {
  state: number[];
  action: number;
  reward: number;
}

/** Kết quả cập nhật chính sách. */
export interface PolicyUpdateResult {
  loss: number;
  episodeReturn: number;
  steps: number;
}

/** REINFORCE với baseline trung bình và chuẩn hoá return. */
export class ReinforceAgent {
  public readonly policy: NeuralNetwork;
  public readonly actions: readonly string[];
  private readonly random: DeepRandom;
  private readonly gamma: number;

  constructor(config: {
    inputSize: number;
    actions: readonly string[];
    hiddenSizes?: readonly number[];
    learningRate?: number;
    gamma?: number;
    seed?: number;
  }) {
    if (config.actions.length === 0) throw new RangeError('REINFORCE cần ít nhất một hành động');
    this.actions = [...config.actions];
    this.gamma = clampRange(config.gamma ?? 0.98, 0, 0.9999);
    this.random = new DeepRandom(config.seed ?? 1);
    this.policy = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: config.hiddenSizes ?? [32],
      outputSize: this.actions.length,
      hiddenActivation: 'tanh',
      outputActivation: 'softmax',
      optimizer: { kind: 'adam', learningRate: config.learningRate ?? 0.01 },
      seed: config.seed ?? 1,
    });
  }

  /** Phân phối hành động. */
  public probabilities(state: readonly number[]): number[] {
    return this.policy.probabilities(state);
  }

  /** Lấy mẫu hành động theo chính sách hiện tại. */
  public selectAction(state: readonly number[], explore = true): number {
    const probabilities = this.probabilities(state);
    if (!explore) return argmax(probabilities);
    const roll = this.random.next();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (roll <= cumulative) return i;
    }
    return probabilities.length - 1;
  }

  /** Cập nhật chính sách từ một episode hoàn chỉnh. */
  public learnEpisode(steps: readonly PolicyStep[]): PolicyUpdateResult {
    if (steps.length === 0) return { loss: 0, episodeReturn: 0, steps: 0 };
    const returns: number[] = new Array(steps.length).fill(0);
    let running = 0;
    for (let i = steps.length - 1; i >= 0; i--) {
      running = steps[i].reward + this.gamma * running;
      returns[i] = running;
    }
    const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;
    const std = Math.sqrt(variance) || 1;

    let totalLoss = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const probabilities = this.policy.probabilities(step.state);
      const advantage = (returns[i] - mean) / std;
      // Gradient ascent: target dịch theo hướng (onehot - probs) * advantage.
      const target = probabilities.map((probability, index) => {
        const oneHot = index === step.action ? 1 : 0;
        return clamp01(probability + 0.1 * advantage * (oneHot - probability));
      });
      totalLoss += this.policy.trainSample({ input: step.state, target }, 'crossEntropy');
    }

    return {
      loss: totalLoss / steps.length,
      episodeReturn: returns[0],
      steps: steps.length,
    };
  }
}
