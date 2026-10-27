/**
 * @file dqn.ts
 * @module @aetheria/engine/learning/reinforcement/dqn
 * @description DQN nâng cao cho agent trong game:
 *
 * - Double DQN: chọn hành động bằng mạng online, đánh giá bằng mạng target.
 * - Dueling DQN: tách giá trị trạng thái `V(s)` và lợi thế hành động `A(s,a)`.
 * - Prioritized replay + target network + soft update (tái sử dụng replay có sẵn).
 *
 * Cài đặt dùng ba mạng MLP nhỏ (trunk/value/advantage) thay vì sửa lõi
 * `NeuralNetwork`, nhờ đó vẫn tương thích hoàn toàn với engine hiện tại.
 */

import { NeuralNetwork, type OptimizerConfig } from '../../deeplearning/nn.js';
import { DeepQNetwork, type DeepQConfig, type DQNTrainResult } from '../../deeplearning/q-network.js';
import { ExperienceReplay, type Transition } from '../../deeplearning/replay.js';
import { DeepRandom, clamp01, clampRange } from '../../deeplearning/random.js';
import {
  applyNetworkGradient,
  argmaxIndex,
  backpropagateNetwork,
  clipNetworkGradient,
  createNetworkGradient,
} from '../network.js';
import { restoreWeightsFromSnapshot } from '../internal.js';

/** Cấu hình Dueling Double DQN. */
export interface DuelingDQNConfig {
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
  softTargetUpdate?: boolean;
  tau?: number;
  /** Dùng prioritized replay thay vì lấy mẫu đều. */
  prioritized?: boolean;
  /** Cắt norm gradient; 0 = tắt. */
  gradientClip?: number;
  seed?: number;
}

/** Ảnh chụp Dueling DQN để lưu checkpoint. */
export interface DuelingDQNSnapshot {
  config: DuelingDQNConfig;
  trunk: ReturnType<NeuralNetwork['snapshot']>;
  value: ReturnType<NeuralNetwork['snapshot']>;
  advantage: ReturnType<NeuralNetwork['snapshot']>;
  targetTrunk: ReturnType<NeuralNetwork['snapshot']>;
  targetValue: ReturnType<NeuralNetwork['snapshot']>;
  targetAdvantage: ReturnType<NeuralNetwork['snapshot']>;
  epsilon: number;
  steps: number;
  replay: ReturnType<ExperienceReplay<number[], number>['snapshot']>;
}

/**
 * Dueling Double DQN với replay ưu tiên.
 *
 * `Q(s,a) = V(s) + A(s,a) - mean(A(s,·))`, nhờ đó mạng không phải học lại giá
 * trị trạng thái cho từng hành động. Mạng trunk dùng ReLU; value/advantage dùng
 * output tuyến tính.
 */
export class DuelingDQNTrainer {
  public readonly actions: readonly string[];
  public readonly trunk: NeuralNetwork;
  public readonly value: NeuralNetwork;
  public readonly advantage: NeuralNetwork;
  public readonly targetTrunk: NeuralNetwork;
  public readonly targetValue: NeuralNetwork;
  public readonly targetAdvantage: NeuralNetwork;
  public readonly replay: ExperienceReplay<number[], number>;
  public readonly gamma: number;
  public readonly batchSize: number;
  public readonly doubleQ: boolean;
  public epsilon: number;

  private readonly config: DuelingDQNConfig;
  private readonly random: DeepRandom;
  private readonly epsilonMin: number;
  private readonly epsilonDecay: number;
  private readonly targetSyncInterval: number;
  private readonly softTargetUpdate: boolean;
  private readonly tau: number;
  private readonly prioritized: boolean;
  private readonly gradientClip: number;
  private steps = 0;

  constructor(config: DuelingDQNConfig) {
    if (config.inputSize <= 0) throw new RangeError('Dueling DQN cần inputSize dương');
    if (config.actions.length === 0) throw new RangeError('Dueling DQN cần ít nhất một hành động');
    this.config = { ...config };
    this.actions = [...config.actions];
    this.gamma = clampRange(config.gamma ?? 0.95, 0, 0.9999);
    this.epsilon = clamp01(config.epsilon ?? 1);
    this.epsilonMin = clamp01(config.epsilonMin ?? 0.05);
    this.epsilonDecay = clampRange(config.epsilonDecay ?? 0.995, 0, 1);
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.targetSyncInterval = Math.max(1, Math.floor(config.targetSyncInterval ?? 50));
    this.softTargetUpdate = config.softTargetUpdate ?? false;
    this.tau = clampRange(config.tau ?? 0.005, 0.0001, 1);
    this.doubleQ = config.doubleQ ?? true;
    this.prioritized = config.prioritized ?? true;
    this.gradientClip = Math.max(0, config.gradientClip ?? 0);
    this.random = new DeepRandom(config.seed ?? 1);

    const hidden = config.hiddenSizes ?? [48, 32];
    const hiddenActivation = 'relu' as const;
    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    const seed = config.seed ?? 1;
    this.trunk = new NeuralNetwork({
      inputSize: config.inputSize,
      hiddenSizes: hidden,
      outputSize: hidden[hidden.length - 1] ?? 32,
      hiddenActivation,
      outputActivation: 'relu',
      optimizer,
      seed,
    });
    const featureSize = this.trunk.outputSize;
    this.value = new NeuralNetwork({
      inputSize: featureSize,
      hiddenSizes: [Math.max(8, Math.floor(featureSize / 2))],
      outputSize: 1,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 1,
    });
    this.advantage = new NeuralNetwork({
      inputSize: featureSize,
      hiddenSizes: [Math.max(8, Math.floor(featureSize / 2))],
      outputSize: this.actions.length,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 2,
    });
    this.targetTrunk = this.trunk.clone();
    this.targetValue = this.value.clone();
    this.targetAdvantage = this.advantage.clone();
    this.replay = new ExperienceReplay<number[], number>(
      config.capacity ?? 10_000,
      (config.seed ?? 1) + 3,
    );
  }

  /** Số bước tương tác đã ghi. */
  public get interactionCount(): number {
    return this.steps;
  }

  /** Q-value của mạng online. */
  public qValues(state: readonly number[]): number[] {
    return this.composeQ(this.trunk, this.value, this.advantage, state, false);
  }

  /** Q-value của mạng target. */
  public targetQValues(state: readonly number[]): number[] {
    return this.composeQ(this.targetTrunk, this.targetValue, this.targetAdvantage, state, false);
  }

  /** Hành động tốt nhất theo mạng online. */
  public bestAction(state: readonly number[]): number {
    return argmaxIndex(this.qValues(state));
  }

  /** Chọn hành động epsilon-greedy. */
  public selectAction(state: readonly number[], explore = true): number {
    if (explore && this.random.chance(this.epsilon)) {
      return this.random.int(0, this.actions.length - 1);
    }
    return this.bestAction(state);
  }

  /** Ghi transition vào replay, giảm epsilon và đồng bộ target. */
  public observe(transition: Transition<number[], number>): void {
    this.replay.push({ ...transition, priority: Math.abs(transition.reward) });
    this.steps++;
    this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
    if (this.softTargetUpdate) {
      this.softUpdateTarget(this.tau);
    } else if (this.steps % this.targetSyncInterval === 0) {
      this.syncTarget();
    }
  }

  /** Một bước cập nhật từ replay; trả `null` nếu chưa đủ mẫu. */
  public trainStep(): DQNTrainResult | null {
    if (this.replay.size < this.batchSize) return null;
    const batch = this.prioritized
      ? this.replay.samplePrioritized(this.batchSize)
      : this.replay.sample(this.batchSize);
    let totalLoss = 0;
    let totalTD = 0;

    const trunkGradient = createNetworkGradient(this.trunk);
    const valueGradient = createNetworkGradient(this.value);
    const advantageGradient = createNetworkGradient(this.advantage);

    for (const transition of batch) {
      const action = clampRange(transition.action, 0, this.actions.length - 1);

      // Tính target trước để các lần forward mạng target/next-state không ghi đè
      // cache của trạng thái hiện tại trước khi lan truyền ngược.
      let target = transition.reward;
      if (!transition.done) {
        let bootstrap: number;
        if (this.doubleQ) {
          const nextAction = argmaxIndex(this.qValues(transition.nextState));
          bootstrap = this.targetQValues(transition.nextState)[nextAction] ?? 0;
        } else {
          bootstrap = Math.max(...this.targetQValues(transition.nextState));
        }
        target += this.gamma * bootstrap;
      }

      // Forward cuối cùng trên trạng thái hiện tại — cache này được dùng trực
      // tiếp cho backprop bên dưới.
      const qValues = this.qValues(transition.state);
      const td = target - qValues[action];
      totalTD += Math.abs(td);
      totalLoss += td * td;
      transition.priority = Math.abs(td);

      // dL/dQ(a) = 2·(Q(a) − target) cho loss bình phương; chỉ hành động đã chọn
      // nhận gradient. Sau đó tách về V và A theo quy tắc dueling:
      //   dQ/dV = 1, dQ/dA(b) = δ(a,b) − 1/|A|.
      const gradQ = new Array<number>(this.actions.length).fill(0);
      gradQ[action] = 2 * (qValues[action] - target);
      const gradValue = [gradQ.reduce((sum, value) => sum + value, 0)];
      const meanGrad = gradValue[0] / this.actions.length;
      const gradAdvantage = gradQ.map((value) => value - meanGrad);

      // Cache forward hiện tại của trunk/value/advantage khớp đúng với Q vừa
      // tính vì `qValues` dùng training=false và các mạng không bật dropout.
      const valueBackprop = backpropagateNetwork(this.value, gradValue, {
        gradient: valueGradient,
        apply: false,
      });
      const advantageBackprop = backpropagateNetwork(this.advantage, gradAdvantage, {
        gradient: advantageGradient,
        apply: false,
      });
      const gradFeatures = valueBackprop.gradInput.map(
        (value, index) => value + (advantageBackprop.gradInput[index] ?? 0),
      );
      backpropagateNetwork(this.trunk, gradFeatures, {
        gradient: trunkGradient,
        apply: false,
      });
    }

    // Ưu tiên replay đã đổi sau mỗi TD error — buộc dựng lại prefix-sum.
    this.replay.refreshPriorities();
    if (this.gradientClip > 0) {
      clipNetworkGradient(trunkGradient, this.gradientClip);
      clipNetworkGradient(valueGradient, this.gradientClip);
      clipNetworkGradient(advantageGradient, this.gradientClip);
    }
    applyNetworkGradient(this.trunk, trunkGradient, {
      optimizer: this.trunk.optimizer,
      batchSize: batch.length,
    });
    applyNetworkGradient(this.value, valueGradient, {
      optimizer: this.value.optimizer,
      batchSize: batch.length,
    });
    applyNetworkGradient(this.advantage, advantageGradient, {
      optimizer: this.advantage.optimizer,
      batchSize: batch.length,
    });

    return {
      loss: totalLoss / batch.length,
      batchSize: batch.length,
      epsilon: this.epsilon,
      meanTDError: totalTD / batch.length,
    };
  }

  /** Chạy nhiều bước cập nhật liên tiếp. */
  public train(steps: number): DQNTrainResult[] {
    const results: DQNTrainResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(steps)); i++) {
      const result = this.trainStep();
      if (!result) break;
      results.push(result);
    }
    return results;
  }

  /** Đồng bộ cứng mạng target. */
  public syncTarget(): void {
    copyNetworkWeights(this.trunk, this.targetTrunk);
    copyNetworkWeights(this.value, this.targetValue);
    copyNetworkWeights(this.advantage, this.targetAdvantage);
  }

  /** Cập nhật mềm Polyak. */
  public softUpdateTarget(tau = this.tau): void {
    const factor = clampRange(tau, 0.0001, 1);
    softCopyNetworkWeights(this.trunk, this.targetTrunk, factor);
    softCopyNetworkWeights(this.value, this.targetValue, factor);
    softCopyNetworkWeights(this.advantage, this.targetAdvantage, factor);
  }

  /** Ảnh chụp đầy đủ. */
  public snapshot(): DuelingDQNSnapshot {
    return {
      config: { ...this.config, actions: [...this.actions] },
      trunk: this.trunk.snapshot(),
      value: this.value.snapshot(),
      advantage: this.advantage.snapshot(),
      targetTrunk: this.targetTrunk.snapshot(),
      targetValue: this.targetValue.snapshot(),
      targetAdvantage: this.targetAdvantage.snapshot(),
      epsilon: this.epsilon,
      steps: this.steps,
      replay: this.replay.snapshot(),
    };
  }

  /** Khôi phục từ checkpoint. */
  public static fromSnapshot(snapshot: DuelingDQNSnapshot): DuelingDQNTrainer {
    const trainer = new DuelingDQNTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.trunk, trainer.trunk);
    restoreWeightsFromSnapshot(snapshot.value, trainer.value);
    restoreWeightsFromSnapshot(snapshot.advantage, trainer.advantage);
    restoreWeightsFromSnapshot(snapshot.targetTrunk, trainer.targetTrunk);
    restoreWeightsFromSnapshot(snapshot.targetValue, trainer.targetValue);
    restoreWeightsFromSnapshot(snapshot.targetAdvantage, trainer.targetAdvantage);
    trainer.epsilon = snapshot.epsilon;
    trainer.steps = snapshot.steps;
    const replay = ExperienceReplay.fromSnapshot(snapshot.replay);
    trainer.replay.pushMany(replay.latest(replay.size));
    return trainer;
  }

  private composeQ(
    trunk: NeuralNetwork,
    value: NeuralNetwork,
    advantage: NeuralNetwork,
    state: readonly number[],
    training: boolean,
  ): number[] {
    const features = trunk.forward(state, training);
    const valueOutput = value.forward(features, training);
    const advantageOutput = advantage.forward(features, training);
    return composeFromOutputs(valueOutput, advantageOutput);
  }
}

/** Alias rõ nghĩa cho cấu hình mặc định double + dueling. */
export { DuelingDQNTrainer as DuelingDoubleDQNTrainer };

/** Bọc DQN cổ điển để runtime có thể chọn thuật toán mà không đổi API. */
export class StandardDQNTrainer {
  public network: DeepQNetwork;

  constructor(config: DeepQConfig) {
    this.network = new DeepQNetwork(config);
  }

  public get actions(): readonly string[] {
    return this.network.actions;
  }

  public selectAction(state: readonly number[], explore = true): number {
    return this.network.selectAction(state, explore);
  }

  public observe(transition: Transition<number[], number>): void {
    this.network.observe(transition);
  }

  public trainStep(): DQNTrainResult | null {
    return this.network.trainStep();
  }

  public train(steps: number): DQNTrainResult[] {
    return this.network.train(steps);
  }

  public snapshot(): ReturnType<DeepQNetwork['snapshot']> {
    return this.network.snapshot();
  }

  public static fromSnapshot(snapshot: ReturnType<DeepQNetwork['snapshot']>): StandardDQNTrainer {
    const trainer = new StandardDQNTrainer(snapshot.config);
    trainer.network = DeepQNetwork.fromSnapshot(snapshot);
    return trainer;
  }
}

/** Ghép V + A - mean(A). */
function composeFromOutputs(value: readonly number[], advantage: readonly number[]): number[] {
  if (advantage.length === 0) return [];
  const mean = advantage.reduce((sum, item) => sum + item, 0) / advantage.length;
  const stateValue = value[0] ?? 0;
  return advantage.map((item) => stateValue + item - mean);
}

/** Sao chép cứng trọng số giữa hai mạng cùng cấu trúc. */
export function copyNetworkWeights(source: NeuralNetwork, target: NeuralNetwork): void {
  for (let l = 0; l < target.layers.length; l++) {
    const sourceLayer = source.layers[l];
    const targetLayer = target.layers[l];
    if (!sourceLayer) continue;
    for (let o = 0; o < targetLayer.outputSize; o++) {
      targetLayer.biases[o] = sourceLayer.biases[o] ?? 0;
      for (let i = 0; i < targetLayer.inputSize; i++) {
        targetLayer.weights[o][i] = sourceLayer.weights[o]?.[i] ?? 0;
      }
    }
  }
}

/** Sao chép mềm Polyak giữa hai mạng cùng cấu trúc. */
export function softCopyNetworkWeights(
  source: NeuralNetwork,
  target: NeuralNetwork,
  tau: number,
): void {
  for (let l = 0; l < target.layers.length; l++) {
    const sourceLayer = source.layers[l];
    const targetLayer = target.layers[l];
    if (!sourceLayer) continue;
    for (let o = 0; o < targetLayer.outputSize; o++) {
      targetLayer.biases[o] = (1 - tau) * targetLayer.biases[o] + tau * (sourceLayer.biases[o] ?? 0);
      for (let i = 0; i < targetLayer.inputSize; i++) {
        targetLayer.weights[o][i] =
          (1 - tau) * targetLayer.weights[o][i] + tau * (sourceLayer.weights[o]?.[i] ?? 0);
      }
    }
  }
}

