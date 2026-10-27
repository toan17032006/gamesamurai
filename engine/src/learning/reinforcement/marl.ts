/**
 * @file marl.ts
 * @module @aetheria/engine/learning/reinforcement/marl
 * @description Multi-Agent Reinforcement Learning cho đội agent trong game:
 *
 * - `QMIXTrainer`: value-based factorization `Q_tot = Mixing(Q_1..Q_n, s)` với
 *   hypernetwork sinh trọng số (lấy trị tuyệt đối để bảo toàn tính đơn điệu),
 *   mỗi agent giữ Q-network cục bộ từ quan sát riêng.
 * - `MAPPOTrainer`: multi-agent PPO — actor phi tập trung (quan sát cục bộ),
 *   critic tập trung (trạng thái toàn cục), GAE dùng chung phần thưởng đội.
 * - `MADDPGTrainer`: actor-critic liên tục đa agent; critic của mỗi agent nhận
 *   trạng thái toàn cục + toàn bộ hành động (CTDE), actor cập nhật qua
 *   deterministic policy gradient đi qua critic.
 *
 * Toàn bộ module thuần TypeScript, không phụ thuộc DOM/Three.js. Chú thích
 * tiếng Việt theo quy ước dự án.
 */

import { NeuralNetwork, type OptimizerConfig } from '../../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../../deeplearning/random.js';
import {
  applyNetworkGradient,
  argmaxIndex,
  backpropagateNetwork,
  clipNetworkGradient,
  createNetworkGradient,
  logSoftmaxVector,
  softmaxVector,
} from '../network.js';
import type { LearningReport, NumericVector } from '../types.js';
import {
  copyNetworkWeights,
  softCopyNetworkWeights,
} from './dqn.js';
import { categoricalEntropy, sampleCategorical } from './ppo.js';
import { restoreWeightsFromSnapshot } from '../internal.js';

// ---------------------------------------------------------------------------
// QMIX
// ---------------------------------------------------------------------------

/** Cấu hình QMIX. */
export interface QMIXConfig {
  /** Số agent trong đội. */
  agentCount: number;
  /** Số chiều quan sát cục bộ của mỗi agent. */
  observationSize: number;
  /** Số chiều trạng thái toàn cục đưa vào mixing network. */
  stateSize: number;
  /** Số hành động (chung cho mọi agent). */
  actionCount: number;
  /** Tầng ẩn của Q-network mỗi agent. */
  hiddenSizes?: readonly number[];
  /** Số chiều embedding của mixing network. */
  mixingEmbeddingSize?: number;
  /** Tầng ẩn của hypernetwork sinh trọng số. */
  mixingHiddenSizes?: readonly number[];
  learningRate?: number;
  gamma?: number;
  epsilon?: number;
  epsilonMin?: number;
  epsilonDecay?: number;
  batchSize?: number;
  capacity?: number;
  /** Khoảng cách đồng bộ mạng target (theo số bước train). */
  targetSyncInterval?: number;
  /** Dùng cập nhật mềm Polyak thay vì đồng bộ cứng. */
  softTargetUpdate?: boolean;
  tau?: number;
  gradientClip?: number;
  seed?: number;
}

/** Một transition đồng đội của QMIX. */
export interface QMIXTransition {
  /** Trạng thái toàn cục. */
  state: NumericVector;
  /** Quan sát cục bộ của từng agent. */
  observations: readonly NumericVector[];
  /** Hành động từng agent. */
  actions: readonly number[];
  /** Phần thưởng đội. */
  reward: number;
  done: boolean;
  nextState: NumericVector;
  nextObservations: readonly NumericVector[];
}

/** Kết quả một bước train QMIX. */
export interface QMIXTrainResult {
  loss: number;
  meanTDError: number;
  batchSize: number;
  epsilon: number;
}

/** Ảnh chụp QMIX để lưu checkpoint. */
export interface QMIXSnapshot {
  config: QMIXConfig;
  agents: ReturnType<NeuralNetwork['snapshot']>[];
  mixingWeights: ReturnType<NeuralNetwork['snapshot']>[];
  targetAgents: ReturnType<NeuralNetwork['snapshot']>[];
  targetMixingWeights: ReturnType<NeuralNetwork['snapshot']>[];
  epsilon: number;
  steps: number;
  transitions: QMIXTransition[];
}

/** ELU và đạo hàm (dùng trong mixing network theo bài báo QMIX). */
function elu(value: number): number {
  return value > 0 ? value : Math.exp(value) - 1;
}

function eluGradient(value: number): number {
  return value > 0 ? 1 : Math.exp(value);
}

/** Trạng thái trung gian của một lần forward mixing network (phục vụ backward). */
interface MixingCache {
  /** Trọng số tầng 1 đã lấy trị tuyệt đối `[agent][embedding]`. */
  w1: number[][];
  /** Bias tầng 1. */
  b1: number[];
  /** Trọng số tầng ra đã lấy trị tuyệt đối. */
  w2: number[];
  /** Bias tầng ra. */
  b2: number;
  /** Đầu vào trước ELU của tầng ẩn. */
  preHidden: number[];
  /** Đầu ra ELU của tầng ẩn. */
  hidden: number[];
  /** Đầu vào trước ELU của tầng ra. */
  preOutput: number;
  /** Q-value per-agent đã forward. */
  q: number[];
}

/**
 * Mixing network đơn điệu của QMIX.
 *
 * `Q_tot = elu(W2·elu(W1·q + b1) + b2)` với `W1, W2` được sinh bởi hypernetwork
 * từ trạng thái toàn cục rồi lấy trị tuyệt đối — nhờ đó `∂Q_tot/∂Q_i ≥ 0`, mọi
 * argmax cục bộ đồng thời là argmax toàn cục.
 *
 * Forward/backward cài thủ công để lấy chính xác `∂Q_tot/∂Q_i` cho agent.
 */
class MonotonicMixingNetwork {
  public readonly hyperW1: NeuralNetwork;
  public readonly hyperB1: NeuralNetwork;
  public readonly hyperW2: NeuralNetwork;
  public readonly hyperB2: NeuralNetwork;

  private readonly agentCount: number;
  private readonly embeddingSize: number;

  constructor(
    agentCount: number,
    stateSize: number,
    embeddingSize: number,
    hiddenSizes: readonly number[],
    learningRate: number,
    seed: number,
  ) {
    this.agentCount = agentCount;
    this.embeddingSize = embeddingSize;
    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate,
      weightDecay: 0,
    };
    this.hyperW1 = new NeuralNetwork({
      inputSize: stateSize,
      hiddenSizes,
      outputSize: agentCount * embeddingSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed,
    });
    this.hyperB1 = new NeuralNetwork({
      inputSize: stateSize,
      hiddenSizes,
      outputSize: embeddingSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 7,
    });
    this.hyperW2 = new NeuralNetwork({
      inputSize: stateSize,
      hiddenSizes,
      outputSize: embeddingSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 13,
    });
    this.hyperB2 = new NeuralNetwork({
      inputSize: stateSize,
      hiddenSizes,
      outputSize: 1,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 17,
    });
  }

  /** Forward `Q_tot` từ per-agent Q và trạng thái toàn cục. */
  public forward(q: readonly number[], state: readonly number[]): { qtot: number; cache: MixingCache } {
    const w1Raw = this.hyperW1.predict(state);
    const b1 = this.hyperB1.predict(state);
    const w2Raw = this.hyperW2.predict(state);
    const b2 = this.hyperB2.predict(state)[0] ?? 0;
    const w1: number[][] = [];
    for (let a = 0; a < this.agentCount; a++) {
      const row: number[] = [];
      for (let e = 0; e < this.embeddingSize; e++) {
        row.push(Math.abs(w1Raw[a * this.embeddingSize + e] ?? 0));
      }
      w1.push(row);
    }
    const w2 = w2Raw.map((value) => Math.abs(value));
    const preHidden: number[] = [];
    const hidden: number[] = [];
    for (let e = 0; e < this.embeddingSize; e++) {
      let sum = b1[e] ?? 0;
      for (let a = 0; a < this.agentCount; a++) sum += w1[a][e] * (q[a] ?? 0);
      preHidden.push(sum);
      hidden.push(elu(sum));
    }
    let preOutput = b2;
    for (let e = 0; e < this.embeddingSize; e++) preOutput += w2[e] * hidden[e];
    return { qtot: elu(preOutput), cache: { w1, b1, w2, b2, preHidden, hidden, preOutput, q: [...q] } };
  }

  /**
   * Lan truyền ngược qua mixing network.
   *
   * @returns `dQ` cho từng agent (để backprop vào Q-network cục bộ) và gradient
   *   đầu ra cho từng hypernetwork; gradient qua phép `abs` do caller xử lý.
   */
  public backward(dQtot: number, cache: MixingCache): {
    dQ: number[];
    gradW1: number[];
    gradB1: number[];
    gradW2: number[];
    gradB2: number[];
  } {
    const { agentCount, embeddingSize } = this;
    const dPreOutput = dQtot * eluGradient(cache.preOutput);
    const dW2 = cache.hidden.map((h) => dPreOutput * h);
    const dHidden = cache.w2.map((w) => dPreOutput * w);
    const dQ = new Array<number>(agentCount).fill(0);
    const gradW1: number[] = new Array<number>(agentCount * embeddingSize).fill(0);
    const gradB1: number[] = new Array<number>(embeddingSize).fill(0);
    for (let e = 0; e < embeddingSize; e++) {
      const dPreHidden = dHidden[e] * eluGradient(cache.preHidden[e]);
      gradB1[e] = dPreHidden;
      for (let a = 0; a < agentCount; a++) {
        gradW1[a * embeddingSize + e] = dPreHidden * (cache.q[a] ?? 0);
        dQ[a] += cache.w1[a][e] * dPreHidden;
      }
    }
    return {
      dQ,
      // Gradient qua phép abs (W = |raw|) được xử lý ở caller qua `absRawGradient`.
      gradW1,
      gradB1,
      gradW2: dW2,
      gradB2: [dPreOutput],
    };
  }

  /** Đồng bộ trọng số từ mixing network khác (hard/soft Polyak). */
  public copyFrom(source: MonotonicMixingNetwork, tau?: number): void {
    if (tau !== undefined) {
      softCopyNetworkWeights(source.hyperW1, this.hyperW1, tau);
      softCopyNetworkWeights(source.hyperB1, this.hyperB1, tau);
      softCopyNetworkWeights(source.hyperW2, this.hyperW2, tau);
      softCopyNetworkWeights(source.hyperB2, this.hyperB2, tau);
      return;
    }
    copyNetworkWeights(source.hyperW1, this.hyperW1);
    copyNetworkWeights(source.hyperB1, this.hyperB1);
    copyNetworkWeights(source.hyperW2, this.hyperW2);
    copyNetworkWeights(source.hyperB2, this.hyperB2);
  }
}

/**
 * QMIX: Q-learning phân rã cho đội agent hợp tác.
 *
 * Vòng lặp khuyến nghị: `selectActions(observations)` → môi trường thực thi →
 * `observe(transition)` → `trainStep()` sau khi replay đủ batch.
 */
export class QMIXTrainer {
  public readonly agentCount: number;
  public readonly actionCount: number;
  public readonly agents: NeuralNetwork[];
  public readonly targetAgents: NeuralNetwork[];
  public readonly mixing: MonotonicMixingNetwork;
  public readonly targetMixing: MonotonicMixingNetwork;
  public readonly gamma: number;
  public epsilon: number;

  private readonly config: QMIXConfig;
  private readonly random: DeepRandom;
  private readonly observationSize: number;
  private readonly stateSize: number;
  private readonly epsilonMin: number;
  private readonly epsilonDecay: number;
  private readonly batchSize: number;
  private readonly targetSyncInterval: number;
  private readonly softTargetUpdate: boolean;
  private readonly tau: number;
  private readonly gradientClip: number;
  private readonly buffer: QMIXTransition[] = [];
  private readonly capacity: number;
  private steps = 0;

  constructor(config: QMIXConfig) {
    if (config.agentCount <= 0) throw new RangeError('QMIX cần agentCount dương');
    if (config.observationSize <= 0) throw new RangeError('QMIX cần observationSize dương');
    if (config.stateSize <= 0) throw new RangeError('QMIX cần stateSize dương');
    if (config.actionCount <= 0) throw new RangeError('QMIX cần actionCount dương');

    this.config = { ...config };
    this.agentCount = config.agentCount;
    this.actionCount = config.actionCount;
    this.observationSize = config.observationSize;
    this.stateSize = config.stateSize;
    this.gamma = clampRange(config.gamma ?? 0.95, 0, 0.9999);
    this.epsilon = clampRange(config.epsilon ?? 1, 0, 1);
    this.epsilonMin = clampRange(config.epsilonMin ?? 0.05, 0, 1);
    this.epsilonDecay = clampRange(config.epsilonDecay ?? 0.995, 0, 1);
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.targetSyncInterval = Math.max(1, Math.floor(config.targetSyncInterval ?? 200));
    this.softTargetUpdate = config.softTargetUpdate ?? false;
    this.tau = clampRange(config.tau ?? 0.005, 0.0001, 1);
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.capacity = Math.max(this.batchSize, Math.floor(config.capacity ?? 20_000));
    this.random = new DeepRandom(config.seed ?? 1);

    const hiddenSizes = config.hiddenSizes ?? [64, 64];
    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    const seed = config.seed ?? 1;
    this.agents = [];
    this.targetAgents = [];
    for (let a = 0; a < this.agentCount; a++) {
      const network = new NeuralNetwork({
        inputSize: this.observationSize,
        hiddenSizes,
        outputSize: this.actionCount,
        hiddenActivation: 'relu',
        outputActivation: 'linear',
        optimizer,
        seed: seed + a * 31,
      });
      this.agents.push(network);
      this.targetAgents.push(network.clone());
    }
    const embeddingSize = Math.max(1, Math.floor(config.mixingEmbeddingSize ?? 32));
    const mixingHidden = config.mixingHiddenSizes ?? [64];
    this.mixing = new MonotonicMixingNetwork(
      this.agentCount,
      this.stateSize,
      embeddingSize,
      mixingHidden,
      config.learningRate ?? 0.001,
      seed + 997,
    );
    this.targetMixing = new MonotonicMixingNetwork(
      this.agentCount,
      this.stateSize,
      embeddingSize,
      mixingHidden,
      config.learningRate ?? 0.001,
      seed + 997,
    );
    this.targetMixing.copyFrom(this.mixing);
  }

  /** Q-value của một agent từ quan sát cục bộ. */
  public agentQValues(agent: number, observation: readonly number[]): number[] {
    return this.agents[agent].predict(observation);
  }

  /** Hành động greedy của một agent. */
  public agentBestAction(agent: number, observation: readonly number[]): number {
    return argmaxIndex(this.agentQValues(agent, observation));
  }

  /** Chọn hành động cho cả đội (epsilon-greedy từng agent). */
  public selectActions(observations: readonly NumericVector[], explore = true): number[] {
    if (observations.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} quan sát, nhận ${observations.length}`);
    }
    return observations.map((observation, agent) => {
      if (explore && this.random.chance(this.epsilon)) {
        return this.random.int(0, this.actionCount - 1);
      }
      return this.agentBestAction(agent, observation);
    });
  }

  /** Ghi transition vào replay và giảm epsilon. */
  public observe(transition: QMIXTransition): void {
    this.validateTransition(transition);
    this.buffer.push({
      state: [...transition.state],
      observations: transition.observations.map((item) => [...item]),
      actions: [...transition.actions],
      reward: transition.reward,
      done: transition.done,
      nextState: [...transition.nextState],
      nextObservations: transition.nextObservations.map((item) => [...item]),
    });
    if (this.buffer.length > this.capacity) this.buffer.shift();
    this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
  }

  /** Số transition trong replay. */
  public get replaySize(): number {
    return this.buffer.length;
  }

  /** Một bước cập nhật từ replay; trả `null` nếu chưa đủ mẫu. */
  public trainStep(): QMIXTrainResult | null {
    if (this.buffer.length < this.batchSize) return null;
    const agentGradients = this.agents.map((network) => createNetworkGradient(network));
    const mixingGradients = [
      createNetworkGradient(this.mixing.hyperW1),
      createNetworkGradient(this.mixing.hyperB1),
      createNetworkGradient(this.mixing.hyperW2),
      createNetworkGradient(this.mixing.hyperB2),
    ];
    let totalLoss = 0;
    let totalTD = 0;

    for (let sample = 0; sample < this.batchSize; sample++) {
      const transition = this.buffer[this.random.int(0, this.buffer.length - 1)];
      // Double-Q: chọn hành động bằng mạng online, đánh giá bằng mạng target.
      const targetActions = transition.nextObservations.map((_, agent) =>
        argmaxIndex(this.agents[agent].predict(transition.nextObservations[agent])),
      );
      let target = transition.reward;
      if (!transition.done) {
        const targetQ = transition.nextObservations.map((observation, agent) =>
          this.targetAgents[agent].predict(observation)[targetActions[agent]] ?? 0,
        );
        target += this.gamma * this.targetMixing.forward(targetQ, transition.nextState).qtot;
      }

      const onlineQ = transition.observations.map((observation, agent) => {
        const action = clampRange(Math.floor(transition.actions[agent]), 0, this.actionCount - 1);
        return this.agents[agent].predict(observation)[action] ?? 0;
      });
      const { qtot, cache } = this.mixing.forward(onlineQ, transition.state);
      const td = qtot - target;
      totalTD += Math.abs(td);
      totalLoss += td * td;
      const dQtot = 2 * td;

      const mixingGrad = this.mixing.backward(dQtot, cache);
      // Gradient hypernetwork: abs đã được xử lý trong backward (gradW đã mang dấu).
      backpropagateNetwork(this.mixing.hyperW1, this.absRawGradient(mixingGrad.gradW1, this.mixing, 0, transition.state), {
        gradient: mixingGradients[0],
        apply: false,
      });
      backpropagateNetwork(this.mixing.hyperB1, mixingGrad.gradB1, {
        gradient: mixingGradients[1],
        apply: false,
      });
      backpropagateNetwork(this.mixing.hyperW2, this.absRawGradient(mixingGrad.gradW2, this.mixing, 2, transition.state), {
        gradient: mixingGradients[2],
        apply: false,
      });
      backpropagateNetwork(this.mixing.hyperB2, mixingGrad.gradB2, {
        gradient: mixingGradients[3],
        apply: false,
      });

      // Gradient per-agent: dQ_i lan vào Q-network tại hành động đã chọn.
      for (let agent = 0; agent < this.agentCount; agent++) {
        const action = clampRange(Math.floor(transition.actions[agent]), 0, this.actionCount - 1);
        const gradOutput = new Array<number>(this.actionCount).fill(0);
        gradOutput[action] = mixingGrad.dQ[agent];
        backpropagateNetwork(this.agents[agent], gradOutput, {
          gradient: agentGradients[agent],
          apply: false,
        });
      }
    }

    for (let agent = 0; agent < this.agentCount; agent++) {
      if (this.gradientClip > 0) clipNetworkGradient(agentGradients[agent], this.gradientClip);
      applyNetworkGradient(this.agents[agent], agentGradients[agent], {
        optimizer: this.agents[agent].optimizer,
        batchSize: this.batchSize,
      });
    }
    for (const gradient of mixingGradients) {
      if (this.gradientClip > 0) clipNetworkGradient(gradient, this.gradientClip);
    }
    applyNetworkGradient(this.mixing.hyperW1, mixingGradients[0], {
      optimizer: this.mixing.hyperW1.optimizer,
      batchSize: this.batchSize,
    });
    applyNetworkGradient(this.mixing.hyperB1, mixingGradients[1], {
      optimizer: this.mixing.hyperB1.optimizer,
      batchSize: this.batchSize,
    });
    applyNetworkGradient(this.mixing.hyperW2, mixingGradients[2], {
      optimizer: this.mixing.hyperW2.optimizer,
      batchSize: this.batchSize,
    });
    applyNetworkGradient(this.mixing.hyperB2, mixingGradients[3], {
      optimizer: this.mixing.hyperB2.optimizer,
      batchSize: this.batchSize,
    });

    this.steps++;
    if (this.softTargetUpdate) {
      this.softUpdateTargets(this.tau);
    } else if (this.steps % this.targetSyncInterval === 0) {
      this.syncTargets();
    }

    return {
      loss: totalLoss / this.batchSize,
      meanTDError: totalTD / this.batchSize,
      batchSize: this.batchSize,
      epsilon: this.epsilon,
    };
  }

  /** Chạy nhiều bước cập nhật liên tiếp. */
  public train(steps: number): QMIXTrainResult[] {
    const results: QMIXTrainResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(steps)); i++) {
      const result = this.trainStep();
      if (!result) break;
      results.push(result);
    }
    return results;
  }

  /** Đồng bộ cứng mạng target. */
  public syncTargets(): void {
    for (let agent = 0; agent < this.agentCount; agent++) {
      copyNetworkWeights(this.agents[agent], this.targetAgents[agent]);
    }
    this.targetMixing.copyFrom(this.mixing);
  }

  /** Cập nhật mềm Polyak toàn bộ mạng target. */
  public softUpdateTargets(tau = this.tau): void {
    for (let agent = 0; agent < this.agentCount; agent++) {
      softCopyNetworkWeights(this.agents[agent], this.targetAgents[agent], tau);
    }
    this.targetMixing.copyFrom(this.mixing, tau);
  }

  /** Ảnh chụp đầy đủ để lưu checkpoint. */
  public snapshot(): QMIXSnapshot {
    return {
      config: { ...this.config },
      agents: this.agents.map((network) => network.snapshot()),
      mixingWeights: [
        this.mixing.hyperW1.snapshot(),
        this.mixing.hyperB1.snapshot(),
        this.mixing.hyperW2.snapshot(),
        this.mixing.hyperB2.snapshot(),
      ],
      targetAgents: this.targetAgents.map((network) => network.snapshot()),
      targetMixingWeights: [
        this.targetMixing.hyperW1.snapshot(),
        this.targetMixing.hyperB1.snapshot(),
        this.targetMixing.hyperW2.snapshot(),
        this.targetMixing.hyperB2.snapshot(),
      ],
      epsilon: this.epsilon,
      steps: this.steps,
      transitions: this.buffer.map((transition) => ({
        state: [...transition.state],
        observations: transition.observations.map((item) => [...item]),
        actions: [...transition.actions],
        reward: transition.reward,
        done: transition.done,
        nextState: [...transition.nextState],
        nextObservations: transition.nextObservations.map((item) => [...item]),
      })),
    };
  }

  /** Khôi phục QMIX từ checkpoint. */
  public static fromSnapshot(snapshot: QMIXSnapshot): QMIXTrainer {
    const trainer = new QMIXTrainer(snapshot.config);
    for (let agent = 0; agent < trainer.agentCount; agent++) {
      restoreWeightsFromSnapshot(snapshot.agents[agent], trainer.agents[agent]);
      restoreWeightsFromSnapshot(snapshot.targetAgents[agent], trainer.targetAgents[agent]);
    }
    const mixingNets = [
      trainer.mixing.hyperW1,
      trainer.mixing.hyperB1,
      trainer.mixing.hyperW2,
      trainer.mixing.hyperB2,
    ];
    const targetMixingNets = [
      trainer.targetMixing.hyperW1,
      trainer.targetMixing.hyperB1,
      trainer.targetMixing.hyperW2,
      trainer.targetMixing.hyperB2,
    ];
    for (let i = 0; i < mixingNets.length; i++) {
      restoreWeightsFromSnapshot(snapshot.mixingWeights[i], mixingNets[i]);
      restoreWeightsFromSnapshot(snapshot.targetMixingWeights[i], targetMixingNets[i]);
    }
    trainer.epsilon = snapshot.epsilon;
    trainer.steps = snapshot.steps;
    for (const transition of snapshot.transitions) trainer.observe(transition);
    return trainer;
  }

  /**
   * Nhân gradient qua phép `abs`: raw = hypernet output, W = |raw| nên
   * `∂W/∂raw = sign(raw)`; hàm này forward lại hypernet để lấy dấu raw.
   */
  private absRawGradient(
    gradientW: readonly number[],
    mixing: MonotonicMixingNetwork,
    hyperIndex: 0 | 2,
    state: readonly number[],
  ): number[] {
    const hyper = hyperIndex === 0 ? mixing.hyperW1 : mixing.hyperW2;
    const raw = hyper.predict(state);
    return gradientW.map((value, index) => value * (raw[index] >= 0 ? 1 : -1));
  }

  /** Kiểm tra chiều dữ liệu của transition. */
  private validateTransition(transition: QMIXTransition): void {
    if (transition.state.length !== this.stateSize) {
      throw new RangeError(`Trạng thái toàn cục cần ${this.stateSize} chiều`);
    }
    if (transition.nextState.length !== this.stateSize) {
      throw new RangeError(`nextState cần ${this.stateSize} chiều`);
    }
    if (transition.observations.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} quan sát`);
    }
    if (transition.nextObservations.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} quan sát kế tiếp`);
    }
    if (transition.actions.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} hành động`);
    }
    for (const observation of [...transition.observations, ...transition.nextObservations]) {
      if (observation.length !== this.observationSize) {
        throw new RangeError(`Quan sát cần ${this.observationSize} chiều`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// MAPPO
// ---------------------------------------------------------------------------

/** Cấu hình MAPPO. */
export interface MAPPOConfig {
  /** Số agent trong đội. */
  agentCount: number;
  /** Số chiều quan sát cục bộ của mỗi agent. */
  observationSize: number;
  /** Số chiều trạng thái toàn cục cho critic tập trung. */
  stateSize: number;
  /** Số hành động (chung cho mọi agent). */
  actionCount: number;
  actorHiddenSizes?: readonly number[];
  criticHiddenSizes?: readonly number[];
  learningRate?: number;
  criticLearningRate?: number;
  gamma?: number;
  gaeLambda?: number;
  clipRatio?: number;
  entropyCoef?: number;
  valueCoef?: number;
  /** Số epoch tối ưu lại trên cùng rollout. */
  epochs?: number;
  miniBatchSize?: number;
  gradientClip?: number;
  seed?: number;
}

/** Dữ liệu từng agent trong một bước rollout của MAPPO. */
export interface MAPPOAgentStep {
  /** Quan sát cục bộ từng agent. */
  observations: readonly NumericVector[];
  /** Hành động từng agent. */
  actions: readonly number[];
  /** Log-probability tại thời điểm thu thập; bỏ trống sẽ tính lại. */
  logProbabilities?: readonly number[];
}

/** Một bước rollout của MAPPO (phần thưởng/done dùng chung cả đội). */
export interface MAPPORolloutStep {
  state: NumericVector;
  agents: MAPPOAgentStep;
  reward: number;
  done: boolean;
}

/** Quyết định hành động của cả đội. */
export interface MAPPODecision {
  actions: number[];
  logProbabilities: number[];
  value: number;
}

/** Kết quả một lần cập nhật MAPPO. */
export interface MAPPOTrainResult {
  policyLoss: number;
  valueLoss: number;
  entropy: number;
  approxKL: number;
  meanReturn: number;
  epochs: number;
  samples: number;
}

/** Ảnh chụp MAPPO để lưu checkpoint. */
export interface MAPPOSnapshot {
  config: MAPPOConfig;
  actors: ReturnType<NeuralNetwork['snapshot']>[];
  critic: ReturnType<NeuralNetwork['snapshot']>;
}

/**
 * MAPPO: PPO đa agent với critic tập trung (CTDE).
 *
 * Advantage GAE dùng chung cho cả đội (phần thưởng đội); mỗi actor được tối ưu
 * bằng clipped surrogate trên quan sát cục bộ của mình.
 */
export class MAPPOTrainer {
  public readonly agentCount: number;
  public readonly actionCount: number;
  public readonly actors: NeuralNetwork[];
  public readonly critic: NeuralNetwork;
  public readonly gamma: number;
  public readonly gaeLambda: number;
  public readonly clipRatio: number;
  public readonly entropyCoef: number;
  public readonly valueCoef: number;
  public readonly epochs: number;
  public readonly miniBatchSize: number;

  private readonly config: MAPPOConfig;
  private readonly random: DeepRandom;
  private readonly observationSize: number;
  private readonly stateSize: number;
  private readonly gradientClip: number;

  constructor(config: MAPPOConfig) {
    if (config.agentCount <= 0) throw new RangeError('MAPPO cần agentCount dương');
    if (config.observationSize <= 0) throw new RangeError('MAPPO cần observationSize dương');
    if (config.stateSize <= 0) throw new RangeError('MAPPO cần stateSize dương');
    if (config.actionCount <= 0) throw new RangeError('MAPPO cần actionCount dương');

    this.config = { ...config };
    this.agentCount = config.agentCount;
    this.actionCount = config.actionCount;
    this.observationSize = config.observationSize;
    this.stateSize = config.stateSize;
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.gaeLambda = clampRange(config.gaeLambda ?? 0.95, 0, 1);
    this.clipRatio = clampRange(config.clipRatio ?? 0.2, 0, 1);
    this.entropyCoef = Math.max(0, config.entropyCoef ?? 0.01);
    this.valueCoef = Math.max(0, config.valueCoef ?? 0.5);
    this.epochs = Math.max(1, Math.floor(config.epochs ?? 4));
    this.miniBatchSize = Math.max(1, Math.floor(config.miniBatchSize ?? 32));
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.random = new DeepRandom(config.seed ?? 1);

    const actorHidden = config.actorHiddenSizes ?? [64, 64];
    const criticHidden = config.criticHiddenSizes ?? [64, 64];
    const actorOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.0003,
      weightDecay: 0.0001,
    };
    const criticOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.criticLearningRate ?? config.learningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    this.actors = [];
    for (let a = 0; a < this.agentCount; a++) {
      this.actors.push(new NeuralNetwork({
        inputSize: this.observationSize,
        hiddenSizes: actorHidden,
        outputSize: this.actionCount,
        hiddenActivation: 'tanh',
        outputActivation: 'linear',
        optimizer: actorOptimizer,
        seed: (config.seed ?? 1) + a * 41,
      }));
    }
    this.critic = new NeuralNetwork({
      inputSize: this.stateSize,
      hiddenSizes: criticHidden,
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer: criticOptimizer,
      seed: (config.seed ?? 1) + 1001,
    });
  }

  /** Xác suất hành động của một agent. */
  public actorProbabilities(agent: number, observation: readonly number[]): number[] {
    return softmaxVector(this.actors[agent].predict(observation));
  }

  /** Giá trị trạng thái toàn cục theo critic tập trung. */
  public value(state: readonly number[]): number {
    return this.critic.predict(state)[0] ?? 0;
  }

  /** Chọn hành động cho cả đội kèm log-probability. */
  public decide(
    state: readonly number[],
    observations: readonly NumericVector[],
    explore = true,
  ): MAPPODecision {
    if (observations.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} quan sát, nhận ${observations.length}`);
    }
    const actions: number[] = [];
    const logProbabilities: number[] = [];
    for (let agent = 0; agent < this.agentCount; agent++) {
      const logits = this.actors[agent].predict(observations[agent]);
      const logs = logSoftmaxVector(logits);
      const probabilities = softmaxVector(logits);
      const action = explore
        ? sampleCategorical(probabilities, this.random)
        : argmaxIndex(probabilities);
      actions.push(action);
      logProbabilities.push(logs[action] ?? Math.log(1e-12));
    }
    return { actions, logProbabilities, value: this.value(state) };
  }

  /**
   * Cập nhật actor/critic từ rollout đồng thời.
   *
   * Mỗi bước rollout cần đúng `agentCount` quan sát/hành động; phần thưởng và
   * `done` dùng chung cho cả đội.
   */
  public train(rollout: readonly MAPPORolloutStep[]): MAPPOTrainResult {
    if (rollout.length === 0) {
      return { policyLoss: 0, valueLoss: 0, entropy: 0, approxKL: 0, meanReturn: 0, epochs: 0, samples: 0 };
    }
    this.validateRollout(rollout);

    const values = rollout.map((step) => this.value(step.state));
    // GAE dùng chung (phần thưởng đội).
    const advantages = new Array<number>(rollout.length).fill(0);
    let nextValue = 0;
    let runningAdvantage = 0;
    for (let i = rollout.length - 1; i >= 0; i--) {
      const step = rollout[i];
      const notDone = step.done ? 0 : 1;
      const delta = step.reward + this.gamma * nextValue * notDone - values[i];
      runningAdvantage = delta + this.gamma * this.gaeLambda * notDone * runningAdvantage;
      advantages[i] = runningAdvantage;
      nextValue = values[i];
    }
    if (rollout.length > 1) {
      const mean = advantages.reduce((sum, value) => sum + value, 0) / advantages.length;
      const variance =
        advantages.reduce((sum, value) => sum + (value - mean) ** 2, 0) / advantages.length;
      const std = Math.sqrt(variance) || 1;
      for (let i = 0; i < advantages.length; i++) advantages[i] = (advantages[i] - mean) / std;
    }
    const returns = advantages.map((advantage, i) => advantage + values[i]);
    const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;

    let policyLossTotal = 0;
    let valueLossTotal = 0;
    let entropyTotal = 0;
    let klTotal = 0;
    let updates = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      // Critic update trên toàn rollout.
      const criticGradient = createNetworkGradient(this.critic);
      for (let i = 0; i < rollout.length; i++) {
        const predicted = this.critic.forward(rollout[i].state, true)[0] ?? 0;
        const valueError = predicted - returns[i];
        valueLossTotal += valueError * valueError;
        backpropagateNetwork(this.critic, [2 * valueError * this.valueCoef], {
          gradient: criticGradient,
          apply: false,
        });
      }
      if (this.gradientClip > 0) clipNetworkGradient(criticGradient, this.gradientClip);
      applyNetworkGradient(this.critic, criticGradient, {
        optimizer: this.critic.optimizer,
        batchSize: rollout.length,
      });
      updates++;

      // Actor update từng agent với clipped surrogate.
      for (let agent = 0; agent < this.agentCount; agent++) {
        const actor = this.actors[agent];
        const order = Array.from({ length: rollout.length }, (_, index) => index);
        this.random.shuffle(order);
        for (let start = 0; start < order.length; start += this.miniBatchSize) {
          const indices = order.slice(start, start + this.miniBatchSize);
          const actorGradient = createNetworkGradient(actor);
          for (const index of indices) {
            const step = rollout[index];
            const oldLogProbability = step.agents.logProbabilities?.[agent]
              ?? logSoftmaxVector(actor.predict(step.agents.observations[agent]))[step.agents.actions[agent]]
              ?? Math.log(1e-12);
            const logits = actor.forward(step.agents.observations[agent], true);
            const logs = logSoftmaxVector(logits);
            const probabilities = softmaxVector(logits);
            const newLogProbability = logs[step.agents.actions[agent]] ?? Math.log(1e-12);
            const ratio = Math.exp(clampRange(newLogProbability - oldLogProbability, -20, 20));
            const advantage = advantages[index];
            const surrogateUnclipped = ratio * advantage;
            const clippedRatio = clampRange(ratio, 1 - this.clipRatio, 1 + this.clipRatio);
            const useUnclipped = surrogateUnclipped <= clippedRatio * advantage;
            policyLossTotal += -Math.min(surrogateUnclipped, clippedRatio * advantage);
            const entropy = categoricalEntropy(probabilities);
            entropyTotal += entropy;
            klTotal += oldLogProbability - newLogProbability;

            const gradLogits = new Array<number>(probabilities.length).fill(0);
            if (useUnclipped || ratio === clippedRatio) {
              const coefficient = -advantage * ratio;
              for (let action = 0; action < gradLogits.length; action++) {
                const indicator = action === step.agents.actions[agent] ? 1 : 0;
                gradLogits[action] += coefficient * (indicator - probabilities[action]);
              }
            }
            for (let action = 0; action < gradLogits.length; action++) {
              gradLogits[action] += this.entropyCoef * probabilities[action] * (logs[action] + entropy);
            }
            backpropagateNetwork(actor, gradLogits, {
              gradient: actorGradient,
              skipOutputActivation: true,
              apply: false,
            });
          }
          if (this.gradientClip > 0) clipNetworkGradient(actorGradient, this.gradientClip);
          applyNetworkGradient(actor, actorGradient, {
            optimizer: actor.optimizer,
            batchSize: indices.length,
          });
        }
      }
    }

    const updateCount = Math.max(1, updates);
    return {
      policyLoss: policyLossTotal / (updateCount * Math.max(1, rollout.length)),
      valueLoss: valueLossTotal / (updateCount * Math.max(1, rollout.length)),
      entropy: entropyTotal / (updateCount * Math.max(1, rollout.length)),
      approxKL: klTotal / (updateCount * Math.max(1, rollout.length)),
      meanReturn,
      epochs: this.epochs,
      samples: rollout.length,
    };
  }

  /** Bọc kết quả thành `LearningReport` cho telemetry dùng chung. */
  public trainReport(rollout: readonly MAPPORolloutStep[]): LearningReport {
    const startedAt = Date.now();
    const result = this.train(rollout);
    return {
      epochs: result.epochs,
      steps: result.samples,
      samples: result.samples,
      initialLoss: result.meanReturn,
      finalLoss: result.policyLoss,
      bestLoss: result.policyLoss,
      lossHistory: [result.policyLoss],
      metrics: {
        valueLoss: result.valueLoss,
        entropy: result.entropy,
        approxKL: result.approxKL,
        meanReturn: result.meanReturn,
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): MAPPOSnapshot {
    return {
      config: { ...this.config },
      actors: this.actors.map((actor) => actor.snapshot()),
      critic: this.critic.snapshot(),
    };
  }

  /** Khôi phục MAPPO từ checkpoint. */
  public static fromSnapshot(snapshot: MAPPOSnapshot): MAPPOTrainer {
    const trainer = new MAPPOTrainer(snapshot.config);
    for (let agent = 0; agent < trainer.agentCount; agent++) {
      restoreWeightsFromSnapshot(snapshot.actors[agent], trainer.actors[agent]);
    }
    restoreWeightsFromSnapshot(snapshot.critic, trainer.critic);
    return trainer;
  }

  /** Kiểm tra chiều dữ liệu rollout. */
  private validateRollout(rollout: readonly MAPPORolloutStep[]): void {
    for (let i = 0; i < rollout.length; i++) {
      const step = rollout[i];
      if (step.state.length !== this.stateSize) {
        throw new RangeError(`Rollout[${i}]: trạng thái toàn cục cần ${this.stateSize} chiều`);
      }
      if (step.agents.observations.length !== this.agentCount) {
        throw new RangeError(`Rollout[${i}]: cần ${this.agentCount} quan sát`);
      }
      if (step.agents.actions.length !== this.agentCount) {
        throw new RangeError(`Rollout[${i}]: cần ${this.agentCount} hành động`);
      }
      for (const observation of step.agents.observations) {
        if (observation.length !== this.observationSize) {
          throw new RangeError(`Rollout[${i}]: quan sát cần ${this.observationSize} chiều`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// MADDPG
// ---------------------------------------------------------------------------

/** Cấu hình MADDPG. */
export interface MADDPGConfig {
  /** Số agent trong đội. */
  agentCount: number;
  /** Số chiều quan sát cục bộ của mỗi agent. */
  observationSize: number;
  /** Số chiều trạng thái toàn cục cho critic. */
  stateSize: number;
  /** Số chiều hành động liên tục của từng agent. */
  actionSizes: readonly number[];
  actorHiddenSizes?: readonly number[];
  criticHiddenSizes?: readonly number[];
  actorLearningRate?: number;
  criticLearningRate?: number;
  gamma?: number;
  tau?: number;
  batchSize?: number;
  capacity?: number;
  gradientClip?: number;
  seed?: number;
}

/** Một transition đồng đội của MADDPG (hành động liên tục trong `[-1, 1]`). */
export interface MADDPGTransition {
  /** Trạng thái toàn cục. */
  state: NumericVector;
  /** Quan sát cục bộ từng agent. */
  observations: readonly NumericVector[];
  /** Hành động từng agent (mỗi cái là vector trong `[-1, 1]`). */
  actions: readonly NumericVector[];
  /** Phần thưởng từng agent (hợp tác: giá trị giống nhau). */
  rewards: readonly number[];
  done: boolean;
  nextState: NumericVector;
  nextObservations: readonly NumericVector[];
}

/** Kết quả một bước train MADDPG. */
export interface MADDPGTrainResult {
  criticLoss: number[];
  actorLoss: number[];
  meanTDError: number;
  batchSize: number;
}

/** Ảnh chụp MADDPG để lưu checkpoint. */
export interface MADDPGSnapshot {
  config: MADDPGConfig;
  actors: ReturnType<NeuralNetwork['snapshot']>[];
  actorTargets: ReturnType<NeuralNetwork['snapshot']>[];
  critics: ReturnType<NeuralNetwork['snapshot']>[];
  criticTargets: ReturnType<NeuralNetwork['snapshot']>[];
  transitions: MADDPGTransition[];
}

/** Cặp mạng của một agent trong MADDPG. */
interface MADDPGAgent {
  actor: NeuralNetwork;
  actorTarget: NeuralNetwork;
  critic: NeuralNetwork;
  criticTarget: NeuralNetwork;
}

/**
 * MADDPG: DDPG đa agent theo mô hình CTDE.
 *
 * Mỗi agent có actor cục bộ (quan sát riêng) và critic toàn cục nhận
 * `[trạng thái toàn cục, toàn bộ hành động]`. Actor cập nhật bằng
 * deterministic policy gradient `∇θ ≈ mean(∂Q/∂a_i · ∂μ/∂θ)`.
 * Hành động được giữ chuẩn hóa trong `[-1, 1]`; tầng game tự ánh xạ sang biên thật.
 */
export class MADDPGTrainer {
  public readonly agentCount: number;
  public readonly stateSize: number;
  public readonly observationSize: number;
  public readonly actionSizes: readonly number[];
  public readonly gamma: number;
  public readonly tau: number;
  public readonly batchSize: number;

  private readonly agents: MADDPGAgent[];
  private readonly config: MADDPGConfig;
  private readonly random: DeepRandom;
  private readonly gradientClip: number;
  private readonly buffer: MADDPGTransition[] = [];
  private readonly capacity: number;

  constructor(config: MADDPGConfig) {
    if (config.agentCount <= 0) throw new RangeError('MADDPG cần agentCount dương');
    if (config.observationSize <= 0) throw new RangeError('MADDPG cần observationSize dương');
    if (config.stateSize <= 0) throw new RangeError('MADDPG cần stateSize dương');
    if (config.actionSizes.length !== config.agentCount) {
      throw new RangeError('actionSizes phải có đúng agentCount phần tử');
    }
    if (config.actionSizes.some((size) => size <= 0)) {
      throw new RangeError('Mỗi chiều hành động phải dương');
    }

    this.config = { ...config, actionSizes: [...config.actionSizes] };
    this.agentCount = config.agentCount;
    this.stateSize = config.stateSize;
    this.observationSize = config.observationSize;
    this.actionSizes = [...config.actionSizes];
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.tau = clampRange(config.tau ?? 0.005, 0.0001, 1);
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.capacity = Math.max(this.batchSize, Math.floor(config.capacity ?? 50_000));
    this.random = new DeepRandom(config.seed ?? 1);

    const seed = config.seed ?? 1;
    const totalActionSize = this.actionSizes.reduce((sum, size) => sum + size, 0);
    this.agents = [];
    for (let a = 0; a < this.agentCount; a++) {
      const actorOptimizer: Partial<OptimizerConfig> = {
        kind: 'adam',
        learningRate: config.actorLearningRate ?? 0.0001,
        weightDecay: 0.0001,
      };
      const criticOptimizer: Partial<OptimizerConfig> = {
        kind: 'adam',
        learningRate: config.criticLearningRate ?? 0.001,
        weightDecay: 0.0001,
      };
      const actor = new NeuralNetwork({
        inputSize: this.observationSize,
        hiddenSizes: config.actorHiddenSizes ?? [64, 64],
        outputSize: this.actionSizes[a],
        hiddenActivation: 'relu',
        outputActivation: 'tanh',
        optimizer: actorOptimizer,
        seed: seed + a * 53,
      });
      const critic = new NeuralNetwork({
        inputSize: this.stateSize + totalActionSize,
        hiddenSizes: config.criticHiddenSizes ?? [64, 64],
        outputSize: 1,
        hiddenActivation: 'relu',
        outputActivation: 'linear',
        optimizer: criticOptimizer,
        seed: seed + a * 53 + 1,
      });
      this.agents.push({
        actor,
        actorTarget: actor.clone(),
        critic,
        criticTarget: critic.clone(),
      });
    }
  }

  /** Hành động tất định của một agent (chuẩn hóa `[-1, 1]`). */
  public agentAction(agent: number, observation: readonly number[]): number[] {
    return this.agents[agent].actor.predict(observation).map((value) => clampRange(value, -1, 1));
  }

  /** Hành động cả đội, thêm nhiễu Gaussian khi thăm dò. */
  public selectActions(
    observations: readonly NumericVector[],
    explore = true,
    noiseScale = 0.1,
  ): number[][] {
    if (observations.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} quan sát, nhận ${observations.length}`);
    }
    return observations.map((observation, agent) => {
      const action = this.agentAction(agent, observation);
      if (!explore || noiseScale <= 0) return action;
      return action.map((value) =>
        clampRange(value + this.random.gaussian(0, noiseScale), -1, 1),
      );
    });
  }

  /** Ghi transition đồng đội vào replay. */
  public observe(transition: MADDPGTransition): void {
    this.validateTransition(transition);
    this.buffer.push({
      state: [...transition.state],
      observations: transition.observations.map((item) => [...item]),
      actions: transition.actions.map((item) => [...item]),
      rewards: [...transition.rewards],
      done: transition.done,
      nextState: [...transition.nextState],
      nextObservations: transition.nextObservations.map((item) => [...item]),
    });
    if (this.buffer.length > this.capacity) this.buffer.shift();
  }

  /** Số transition trong replay. */
  public get replaySize(): number {
    return this.buffer.length;
  }

  /** Một bước cập nhật toàn đội; trả `null` nếu replay chưa đủ batch. */
  public trainStep(): MADDPGTrainResult | null {
    if (this.buffer.length < this.batchSize) return null;
    const actorGradients = this.agents.map((agent) => createNetworkGradient(agent.actor));
    const criticGradients = this.agents.map((agent) => createNetworkGradient(agent.critic));
    const criticLoss = new Array<number>(this.agentCount).fill(0);
    const actorLoss = new Array<number>(this.agentCount).fill(0);
    let totalTD = 0;

    for (let sample = 0; sample < this.batchSize; sample++) {
      const transition = this.buffer[this.random.int(0, this.buffer.length - 1)];

      // Critic update: y_i = r_i + γ(1−done)·Q'_i(s', μ'(o'_1..n)).
      const nextJointActions: number[] = [];
      for (let agent = 0; agent < this.agentCount; agent++) {
        const nextAction = this.agents[agent].actorTarget.predict(transition.nextObservations[agent]);
        nextJointActions.push(...nextAction);
      }
      for (let agent = 0; agent < this.agentCount; agent++) {
        const { critic, criticTarget } = this.agents[agent];
        let target = transition.rewards[agent] ?? 0;
        if (!transition.done) {
          const nextQ = criticTarget.forward(
            [...transition.nextState, ...nextJointActions],
            false,
          )[0] ?? 0;
          target += this.gamma * nextQ;
        }
        const criticInput = [
          ...transition.state,
          ...transition.actions.flat(),
        ];
        const qValue = critic.forward(criticInput, true)[0] ?? 0;
        const td = qValue - target;
        totalTD += Math.abs(td);
        criticLoss[agent] += td * td;
        backpropagateNetwork(critic, [2 * td], {
          gradient: criticGradients[agent],
          apply: false,
        });
      }

      // Actor update: đi gradient qua critic đến phần hành động của agent.
      for (let agent = 0; agent < this.agentCount; agent++) {
        const { actor, critic } = this.agents[agent];
        const policyAction = actor.forward(transition.observations[agent], true);
        const jointActions = [...transition.actions.flat()];
        const offset = this.actionSizes
          .slice(0, agent)
          .reduce((sum, size) => sum + size, 0);
        for (let d = 0; d < this.actionSizes[agent]; d++) {
          jointActions[offset + d] = policyAction[d] ?? 0;
        }
        const criticInput = [...transition.state, ...jointActions];
        critic.forward(criticInput, true);
        const gradInput = backpropagateNetwork(critic, [1], { apply: false }).gradInput;
        const gradAction = gradInput.slice(
          this.stateSize + offset,
          this.stateSize + offset + this.actionSizes[agent],
        );
        actorLoss[agent] -= critic.predict(criticInput)[0] ?? 0;
        backpropagateNetwork(actor, gradAction.map((value) => -value), {
          gradient: actorGradients[agent],
          apply: false,
        });
      }
    }

    for (let agent = 0; agent < this.agentCount; agent++) {
      const { actor, critic } = this.agents[agent];
      if (this.gradientClip > 0) clipNetworkGradient(actorGradients[agent], this.gradientClip);
      if (this.gradientClip > 0) clipNetworkGradient(criticGradients[agent], this.gradientClip);
      applyNetworkGradient(actor, actorGradients[agent], {
        optimizer: actor.optimizer,
        batchSize: this.batchSize,
      });
      applyNetworkGradient(critic, criticGradients[agent], {
        optimizer: critic.optimizer,
        batchSize: this.batchSize,
      });
      softCopyNetworkWeights(actor, this.agents[agent].actorTarget, this.tau);
      softCopyNetworkWeights(critic, this.agents[agent].criticTarget, this.tau);
    }

    return {
      criticLoss: criticLoss.map((value) => value / this.batchSize),
      actorLoss: actorLoss.map((value) => value / this.batchSize),
      meanTDError: totalTD / this.batchSize,
      batchSize: this.batchSize,
    };
  }

  /** Chạy nhiều bước cập nhật liên tiếp. */
  public train(steps: number): MADDPGTrainResult[] {
    const results: MADDPGTrainResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(steps)); i++) {
      const result = this.trainStep();
      if (!result) break;
      results.push(result);
    }
    return results;
  }

  /** Đồng bộ cứng toàn bộ mạng target. */
  public syncTargets(): void {
    for (const { actor, actorTarget, critic, criticTarget } of this.agents) {
      copyNetworkWeights(actor, actorTarget);
      copyNetworkWeights(critic, criticTarget);
    }
  }

  /** Ảnh chụp đầy đủ để lưu checkpoint. */
  public snapshot(): MADDPGSnapshot {
    return {
      config: { ...this.config },
      actors: this.agents.map((agent) => agent.actor.snapshot()),
      actorTargets: this.agents.map((agent) => agent.actorTarget.snapshot()),
      critics: this.agents.map((agent) => agent.critic.snapshot()),
      criticTargets: this.agents.map((agent) => agent.criticTarget.snapshot()),
      transitions: this.buffer.map((transition) => ({
        state: [...transition.state],
        observations: transition.observations.map((item) => [...item]),
        actions: transition.actions.map((item) => [...item]),
        rewards: [...transition.rewards],
        done: transition.done,
        nextState: [...transition.nextState],
        nextObservations: transition.nextObservations.map((item) => [...item]),
      })),
    };
  }

  /** Khôi phục MADDPG từ checkpoint. */
  public static fromSnapshot(snapshot: MADDPGSnapshot): MADDPGTrainer {
    const trainer = new MADDPGTrainer(snapshot.config);
    for (let agent = 0; agent < trainer.agentCount; agent++) {
      restoreWeightsFromSnapshot(snapshot.actors[agent], trainer.agents[agent].actor);
      restoreWeightsFromSnapshot(snapshot.actorTargets[agent], trainer.agents[agent].actorTarget);
      restoreWeightsFromSnapshot(snapshot.critics[agent], trainer.agents[agent].critic);
      restoreWeightsFromSnapshot(snapshot.criticTargets[agent], trainer.agents[agent].criticTarget);
    }
    for (const transition of snapshot.transitions) trainer.observe(transition);
    return trainer;
  }

  /** Kiểm tra chiều dữ liệu của transition. */
  private validateTransition(transition: MADDPGTransition): void {
    if (transition.state.length !== this.stateSize) {
      throw new RangeError(`Trạng thái toàn cục cần ${this.stateSize} chiều`);
    }
    if (transition.nextState.length !== this.stateSize) {
      throw new RangeError(`nextState cần ${this.stateSize} chiều`);
    }
    if (transition.observations.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} quan sát`);
    }
    if (transition.nextObservations.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} quan sát kế tiếp`);
    }
    if (transition.actions.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} hành động`);
    }
    if (transition.rewards.length !== this.agentCount) {
      throw new RangeError(`Cần ${this.agentCount} phần thưởng`);
    }
    transition.actions.forEach((action, agent) => {
      if (action.length !== this.actionSizes[agent]) {
        throw new RangeError(`Hành động agent ${agent} cần ${this.actionSizes[agent]} chiều`);
      }
    });
  }
}

