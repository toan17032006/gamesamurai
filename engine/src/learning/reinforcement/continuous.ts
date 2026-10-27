/**
 * @file continuous.ts
 * @module @aetheria/engine/learning/reinforcement/continuous
 * @description Học tăng cường cho không gian hành động liên tục:
 *
 * - `DDPGTrainer`: actor deterministic + critic Q + target networks.
 * - `TD3Trainer`: twin critic, target policy smoothing và delayed policy update.
 * - `SACTrainer`: policy Gaussian squash qua tanh, twin critic, entropy tuning.
 *
 * Hành động chuẩn hóa trong `[-1, 1]` rồi ánh xạ tuyến tính sang `[low, high]`;
 * nhờ vậy cùng một actor có thể điều khiển khớp quay, lực đẩy hoặc vận tốc.
 *
 * Gradient được tính giải tích qua `backpropagateNetwork` và
 * `networkInputGradient`, không cần thư viện autograd ngoài.
 */

import {
  NeuralNetwork,
  type ActivationName,
  type OptimizerConfig,
} from '../../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../../deeplearning/random.js';
import { ExperienceReplay, type Transition } from '../../deeplearning/replay.js';
import {
  applyNetworkGradient,
  backpropagateNetwork,
  clipNetworkGradient,
  createNetworkGradient,
  networkInputGradient,
} from '../network.js';
import { copyNetworkWeights, softCopyNetworkWeights } from './dqn.js';
import { restoreWeightsFromSnapshot } from '../internal.js';

/** Cấu hình chung cho agent điều khiển liên tục. */
export interface ContinuousRLConfig {
  /** Số chiều trạng thái. */
  stateSize: number;
  /** Số chiều hành động. */
  actionSize: number;
  /** Giá trị thấp nhất từng chiều hành động; mặc định -1. */
  actionLow?: readonly number[];
  /** Giá trị cao nhất từng chiều hành động; mặc định 1. */
  actionHigh?: readonly number[];
  actorHiddenSizes?: readonly number[];
  criticHiddenSizes?: readonly number[];
  actorLearningRate?: number;
  criticLearningRate?: number;
  gamma?: number;
  /** Hệ số Polyak cho target network. */
  tau?: number;
  batchSize?: number;
  capacity?: number;
  /** Cắt norm gradient; 0 = tắt. */
  gradientClip?: number;
  seed?: number;
}

/** Kết quả một bước cập nhật liên tục. */
export interface ContinuousTrainResult {
  actorLoss: number;
  criticLoss: number;
  meanTDError: number;
  batchSize: number;
  policyUpdated: boolean;
  /** Nhiệt độ entropy hiện tại (chỉ SAC). */
  alpha?: number;
}

/** Một mẫu hành động liên tục kèm log xác suất (SAC). */
export interface SquashedGaussianSample {
  /** Hành động đã ánh xạ sang `[low, high]`. */
  action: number[];
  /** Hành động chuẩn hóa sau tanh trong `[-1, 1]`. */
  normalized: number[];
  mean: number[];
  std: number[];
  logProbability: number;
}

/** Ảnh chụp DDPG. */
export interface DDPGSnapshot {
  config: ContinuousRLConfig;
  actor: ReturnType<NeuralNetwork['snapshot']>;
  actorTarget: ReturnType<NeuralNetwork['snapshot']>;
  critic: ReturnType<NeuralNetwork['snapshot']>;
  criticTarget: ReturnType<NeuralNetwork['snapshot']>;
  replay: ReturnType<ExperienceReplay<number[], number[]>['snapshot']>;
}

/** Ảnh chụp TD3. */
export interface TD3Snapshot extends Omit<DDPGSnapshot, 'config'> {
  config: TD3Config;
  q1: ReturnType<NeuralNetwork['snapshot']>;
  q2: ReturnType<NeuralNetwork['snapshot']>;
  q1Target: ReturnType<NeuralNetwork['snapshot']>;
  q2Target: ReturnType<NeuralNetwork['snapshot']>;
  actorSteps: number;
}

/** Ảnh chụp SAC. */
export interface SACSnapshot {
  config: SACConfig;
  actor: ReturnType<NeuralNetwork['snapshot']>;
  q1: ReturnType<NeuralNetwork['snapshot']>;
  q2: ReturnType<NeuralNetwork['snapshot']>;
  q1Target: ReturnType<NeuralNetwork['snapshot']>;
  q2Target: ReturnType<NeuralNetwork['snapshot']>;
  logAlpha: number;
  replay: ReturnType<ExperienceReplay<number[], number[]>['snapshot']>;
}

/** Cấu hình TD3 bổ sung. */
export interface TD3Config extends ContinuousRLConfig {
  /** Độ lệch nhiễu Gaussian trên hành động target (trong `[-1,1]`). */
  targetNoise?: number;
  /** Biên clip nhiễu target. */
  noiseClip?: number;
  /** Cập nhật actor mỗi `policyDelay` bước critic. */
  policyDelay?: number;
}

/** Cấu hình SAC bổ sung. */
export interface SACConfig extends ContinuousRLConfig {
  /** Nhiệt độ entropy khởi tạo. */
  alpha?: number;
  /** Entropy mục tiêu; mặc định `-actionSize`. */
  targetEntropy?: number;
  /** Learning rate cho log-alpha. */
  alphaLearningRate?: number;
  /** Tự động điều chỉnh alpha (mặc định bật). */
  autoTemperature?: boolean;
}

/**
 * Lớp cơ sở cho actor-critic liên tục.
 *
 * Actor dùng `tanh` cho DDPG/TD3 để đầu ra nằm sẵn trong `[-1, 1]`. SAC kế
 * thừa nhưng cấu hình actor tuyến tính vì cần giữ mean của phân phối Gaussian.
 */
export abstract class ContinuousActorCritic {
  public readonly stateSize: number;
  public readonly actionSize: number;
  public readonly actionLow: number[];
  public readonly actionHigh: number[];
  public readonly actor: NeuralNetwork;
  public readonly actorTarget: NeuralNetwork;
  public readonly replay: ExperienceReplay<number[], number[]>;
  public readonly gamma: number;
  public readonly tau: number;
  public readonly batchSize: number;
  public readonly gradientClip: number;

  protected readonly config: ContinuousRLConfig;
  protected readonly random: DeepRandom;
  private readonly actionScale: number[];

  protected constructor(
    config: ContinuousRLConfig,
    actorActivation: ActivationName = 'tanh',
  ) {
    if (config.stateSize <= 0) throw new RangeError('stateSize phải dương');
    if (config.actionSize <= 0) throw new RangeError('actionSize phải dương');

    this.config = {
      ...config,
      actionLow: config.actionLow ? [...config.actionLow] : undefined,
      actionHigh: config.actionHigh ? [...config.actionHigh] : undefined,
    };
    this.stateSize = config.stateSize;
    this.actionSize = config.actionSize;
    this.actionLow = normalizeBounds(config.actionLow, config.actionSize, -1);
    this.actionHigh = normalizeBounds(config.actionHigh, config.actionSize, 1);
    for (let i = 0; i < this.actionSize; i++) {
      if (this.actionHigh[i] < this.actionLow[i]) {
        throw new RangeError(`Biên hành động ${i} không hợp lệ`);
      }
    }
    this.actionScale = this.actionHigh.map(
      (high, index) => (high - this.actionLow[index]) / 2,
    );
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.tau = clampRange(config.tau ?? 0.005, 0.0001, 1);
    this.batchSize = Math.max(1, Math.floor(config.batchSize ?? 32));
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.random = new DeepRandom(config.seed ?? 1);

    const actorOptimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.actorLearningRate ?? 0.0001,
      weightDecay: 0.0001,
    };
    this.actor = new NeuralNetwork({
      inputSize: config.stateSize,
      hiddenSizes: config.actorHiddenSizes ?? [64, 64],
      outputSize: config.actionSize,
      hiddenActivation: 'relu',
      outputActivation: actorActivation,
      optimizer: actorOptimizer,
      seed: config.seed ?? 1,
    });
    this.actorTarget = this.actor.clone();
    this.replay = new ExperienceReplay<number[], number[]>(
      config.capacity ?? 50_000,
      (config.seed ?? 1) + 101,
    );
  }

  /** Hành động tất định từ actor, đã ánh xạ sang biên hành động. */
  public policyAction(state: readonly number[], training = false): number[] {
    return scaleRawAction(this.actor.forward(state, training), this.actionLow, this.actionHigh);
  }

  /**
   * Chọn hành động để tương tác.
   * @param noiseScale độ lệch nhiễu theo đơn vị chuẩn hóa `[-1,1]`.
   */
  public selectAction(state: readonly number[], explore = true, noiseScale = 0.1): number[] {
    const action = this.policyAction(state, false);
    if (!explore || noiseScale <= 0) return action;
    return action.map((value, index) => {
      const noise = this.random.gaussian(0, noiseScale) * this.actionScale[index];
      return clampRange(value + noise, this.actionLow[index], this.actionHigh[index]);
    });
  }

  /** Ghi transition vào replay. */
  public observe(transition: Transition<number[], number[]>): void {
    this.replay.push({
      ...transition,
      state: [...transition.state],
      nextState: [...transition.nextState],
      action: [...transition.action],
    });
  }

  /** Số mẫu đã thu thập. */
  public get replaySize(): number {
    return this.replay.size;
  }

  /** Một bước cập nhật; `null` nếu replay chưa đủ batch. */
  public abstract trainStep(): ContinuousTrainResult | null;

  /** Áp gradient actor đã tích lũy. */
  protected applyActorGradient(
    actorGradient: ReturnType<typeof createNetworkGradient>,
    batchSize: number,
    actorNetwork: NeuralNetwork = this.actor,
  ): void {
    if (this.gradientClip > 0) clipNetworkGradient(actorGradient, this.gradientClip);
    applyNetworkGradient(actorNetwork, actorGradient, {
      optimizer: actorNetwork.optimizer,
      batchSize,
    });
  }

  /** Actor target theo chính sách tất định. */
  protected targetPolicyAction(state: readonly number[]): number[] {
    return scaleRawAction(
      this.actorTarget.forward(state, false),
      this.actionLow,
      this.actionHigh,
    );
  }

  /** Ánh xạ hành động chuẩn hóa sang biên thật. */
  protected actionFromNormalized(normalized: readonly number[]): number[] {
    return normalized.map((value, index) =>
      this.actionLow[index] + ((clampRange(value, -1, 1) + 1) / 2) * (this.actionHigh[index] - this.actionLow[index]),
    );
  }

  /** Nhân gradient theo hành động đã scale về actor raw. */
  protected scaleActionGradient(gradient: readonly number[]): number[] {
    return gradient.map((value, index) => value * this.actionScale[index]);
  }

  /** Nối state + action cho critic. */
  protected criticInput(state: readonly number[], action: readonly number[]): number[] {
    return [...state, ...action];
  }

  /** Đồng bộ cứng target actor. */
  protected syncActorTarget(): void {
    copyNetworkWeights(this.actor, this.actorTarget);
  }
}

/**
 * Deep Deterministic Policy Gradient.
 *
 * Critic học `Q(s,a)` bằng TD(0); actor tối đa hóa `Q(s, π(s))` bằng gradient
 * đi qua critic. Target network cập nhật Polyak mỗi bước.
 */
export class DDPGTrainer extends ContinuousActorCritic {
  public readonly critic: NeuralNetwork;
  public readonly criticTarget: NeuralNetwork;

  constructor(config: ContinuousRLConfig) {
    super(config);
    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.criticLearningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    this.critic = new NeuralNetwork({
      inputSize: config.stateSize + config.actionSize,
      hiddenSizes: config.criticHiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: (config.seed ?? 1) + 1,
    });
    this.criticTarget = this.critic.clone();
  }

  public trainStep(): ContinuousTrainResult | null {
    if (this.replay.size < this.batchSize) return null;
    const batch = this.replay.sample(this.batchSize);
    const actorGradient = createNetworkGradient(this.actor);
    const criticGradient = createNetworkGradient(this.critic);
    let actorLoss = 0;
    let criticLoss = 0;
    let totalTD = 0;

    for (const transition of batch) {
      const action = clampAction(transition.action, this.actionLow, this.actionHigh);
      const qValue = this.critic.forward(this.criticInput(transition.state, action), true)[0] ?? 0;

      let target = transition.reward;
      if (!transition.done) {
        const nextAction = this.targetPolicyAction(transition.nextState);
        const nextQ =
          this.criticTarget.forward(this.criticInput(transition.nextState, nextAction), false)[0] ?? 0;
        target += this.gamma * nextQ;
      }
      const td = qValue - target;
      totalTD += Math.abs(td);
      criticLoss += td * td;
      backpropagateNetwork(this.critic, [2 * td], {
        gradient: criticGradient,
        apply: false,
      });

      // Actor: cực đại Q(s, π(s)). Forward actor trước để cache khớp backprop.
      const policyAction = this.policyAction(transition.state, true);
      const policyQ =
        this.critic.forward(this.criticInput(transition.state, policyAction), true)[0] ?? 0;
      actorLoss -= policyQ;
      const gradAction = this.criticActionGradient(transition.state, policyAction);
      const gradRaw = this.scaleActionGradient(gradAction).map((value) => -value);
      backpropagateNetwork(this.actor, gradRaw, {
        gradient: actorGradient,
        apply: false,
      });
    }

    this.applyActorGradient(actorGradient, batch.length);
    if (this.gradientClip > 0) clipNetworkGradient(criticGradient, this.gradientClip);
    applyNetworkGradient(this.critic, criticGradient, {
      optimizer: this.critic.optimizer,
      batchSize: batch.length,
    });
    this.softUpdateTargets();

    return {
      actorLoss: actorLoss / batch.length,
      criticLoss: criticLoss / batch.length,
      meanTDError: totalTD / batch.length,
      batchSize: batch.length,
      policyUpdated: true,
    };
  }

  /** Đồng bộ cứng toàn bộ target. */
  public syncTargets(): void {
    copyNetworkWeights(this.actor, this.actorTarget);
    copyNetworkWeights(this.critic, this.criticTarget);
  }

  /** Cập nhật Polyak target. */
  public softUpdateTargets(tau = this.tau): void {
    softCopyNetworkWeights(this.actor, this.actorTarget, tau);
    softCopyNetworkWeights(this.critic, this.criticTarget, tau);
  }

  public snapshot(): DDPGSnapshot {
    return {
      config: snapshotConfig(this.config),
      actor: this.actor.snapshot(),
      actorTarget: this.actorTarget.snapshot(),
      critic: this.critic.snapshot(),
      criticTarget: this.criticTarget.snapshot(),
      replay: this.replay.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: DDPGSnapshot): DDPGTrainer {
    const trainer = new DDPGTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.actor, trainer.actor);
    restoreWeightsFromSnapshot(snapshot.actorTarget, trainer.actorTarget);
    restoreWeightsFromSnapshot(snapshot.critic, trainer.critic);
    restoreWeightsFromSnapshot(snapshot.criticTarget, trainer.criticTarget);
    restoreReplay(snapshot.replay, trainer.replay);
    return trainer;
  }

  /** Gradient `∂Q/∂a` tại hành động đã cho (dùng lại cache critic). */
  protected criticActionGradient(state: readonly number[], action: readonly number[]): number[] {
    const input = this.criticInput(state, action);
    // Nếu cache chưa phải input này (lần gọi độc lập), forward lại để an toàn.
    this.critic.forward(input, true);
    const gradInput = networkInputGradient(this.critic, [1]);
    return gradInput.slice(state.length);
  }

}

/**
 * Twin Delayed DDPG.
 *
 * Hai critic giảm over-estimation; target action được làm mượt bằng nhiễu
 * Gaussian bị clip; actor cập nhật chậm hơn critic `policyDelay` bước.
 */
export class TD3Trainer extends ContinuousActorCritic {
  public readonly q1: NeuralNetwork;
  public readonly q2: NeuralNetwork;
  public readonly q1Target: NeuralNetwork;
  public readonly q2Target: NeuralNetwork;
  public readonly policyDelay: number;
  public readonly targetNoise: number;
  public readonly noiseClip: number;

  private actorSteps = 0;

  constructor(config: TD3Config) {
    super(config);
    this.policyDelay = Math.max(1, Math.floor(config.policyDelay ?? 2));
    this.targetNoise = Math.max(0, config.targetNoise ?? 0.2);
    this.noiseClip = Math.max(0, config.noiseClip ?? 0.5);
    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.criticLearningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    const criticConfig = {
      inputSize: config.stateSize + config.actionSize,
      hiddenSizes: config.criticHiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'relu' as const,
      outputActivation: 'linear' as const,
      optimizer,
    };
    this.q1 = new NeuralNetwork({ ...criticConfig, seed: (config.seed ?? 1) + 1 });
    this.q2 = new NeuralNetwork({ ...criticConfig, seed: (config.seed ?? 1) + 2 });
    this.q1Target = this.q1.clone();
    this.q2Target = this.q2.clone();
  }

  public trainStep(): ContinuousTrainResult | null {
    if (this.replay.size < this.batchSize) return null;
    const batch = this.replay.sample(this.batchSize);
    const actorGradient = createNetworkGradient(this.actor);
    const q1Gradient = createNetworkGradient(this.q1);
    const q2Gradient = createNetworkGradient(this.q2);
    let actorLoss = 0;
    let criticLoss = 0;
    let totalTD = 0;

    for (const transition of batch) {
      const action = clampAction(transition.action, this.actionLow, this.actionHigh);
      const input = this.criticInput(transition.state, action);
      const q1Value = this.q1.forward(input, true)[0] ?? 0;
      const q2Value = this.q2.forward(input, true)[0] ?? 0;

      let target = transition.reward;
      if (!transition.done) {
        const nextActionRaw = this.actorTarget.forward(transition.nextState, false).map((value) => {
          const noise = clampRange(
            this.random.gaussian(0, this.targetNoise),
            -this.noiseClip,
            this.noiseClip,
          );
          return clampRange(value + noise, -1, 1);
        });
        const nextAction = scaleRawAction(nextActionRaw, this.actionLow, this.actionHigh);
        const nextInput = this.criticInput(transition.nextState, nextAction);
        const nextQ1 = this.q1Target.forward(nextInput, false)[0] ?? 0;
        const nextQ2 = this.q2Target.forward(nextInput, false)[0] ?? 0;
        target += this.gamma * Math.min(nextQ1, nextQ2);
      }

      const td1 = q1Value - target;
      const td2 = q2Value - target;
      totalTD += (Math.abs(td1) + Math.abs(td2)) / 2;
      criticLoss += td1 * td1 + td2 * td2;
      backpropagateNetwork(this.q1, [2 * td1], { gradient: q1Gradient, apply: false });
      backpropagateNetwork(this.q2, [2 * td2], { gradient: q2Gradient, apply: false });
    }

    const updated = this.actorSteps % this.policyDelay === 0;
    if (updated) {
      for (const transition of batch) {
        const policyAction = this.policyAction(transition.state, true);
        const policyQ = this.q1.forward(this.criticInput(transition.state, policyAction), true)[0] ?? 0;
        actorLoss -= policyQ;
        const gradAction = this.criticActionGradient(this.q1, transition.state, policyAction);
        const gradRaw = this.scaleActionGradient(gradAction).map((value) => -value);
        backpropagateNetwork(this.actor, gradRaw, {
          gradient: actorGradient,
          apply: false,
        });
      }
      if (this.gradientClip > 0) clipNetworkGradient(actorGradient, this.gradientClip);
      applyNetworkGradient(this.actor, actorGradient, {
        optimizer: this.actor.optimizer,
        batchSize: batch.length,
      });
      this.softUpdateActor(this.tau);
    }

    if (this.gradientClip > 0) {
      clipNetworkGradient(q1Gradient, this.gradientClip);
      clipNetworkGradient(q2Gradient, this.gradientClip);
    }
    applyNetworkGradient(this.q1, q1Gradient, {
      optimizer: this.q1.optimizer,
      batchSize: batch.length,
    });
    applyNetworkGradient(this.q2, q2Gradient, {
      optimizer: this.q2.optimizer,
      batchSize: batch.length,
    });
    this.softUpdateCritics(this.tau);
    this.actorSteps++;

    return {
      actorLoss: updated ? actorLoss / batch.length : 0,
      criticLoss: criticLoss / batch.length,
      meanTDError: totalTD / batch.length,
      batchSize: batch.length,
      policyUpdated: updated,
    };
  }

  /** Cập nhật Polyak chỉ actor target. */
  public softUpdateActor(tau = this.tau): void {
    softCopyNetworkWeights(this.actor, this.actorTarget, tau);
  }

  /** Cập nhật Polyak hai critic target. */
  public softUpdateCritics(tau = this.tau): void {
    softCopyNetworkWeights(this.q1, this.q1Target, tau);
    softCopyNetworkWeights(this.q2, this.q2Target, tau);
  }

  public snapshot(): TD3Snapshot {
    const base = {
      config: snapshotConfig(this.config),
      actor: this.actor.snapshot(),
      actorTarget: this.actorTarget.snapshot(),
      replay: this.replay.snapshot(),
      actorSteps: this.actorSteps,
      q1: this.q1.snapshot(),
      q2: this.q2.snapshot(),
      q1Target: this.q1Target.snapshot(),
      q2Target: this.q2Target.snapshot(),
    };
    // DDPGSnapshot yêu cầu critic/criticTarget; dùng q1 làm đại diện để tương
    // thích ngược khi công cụ chỉ đọc một critic.
    return {
      ...base,
      critic: this.q1.snapshot(),
      criticTarget: this.q1Target.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: TD3Snapshot): TD3Trainer {
    const trainer = new TD3Trainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.actor, trainer.actor);
    restoreWeightsFromSnapshot(snapshot.actorTarget, trainer.actorTarget);
    restoreWeightsFromSnapshot(snapshot.q1, trainer.q1);
    restoreWeightsFromSnapshot(snapshot.q2, trainer.q2);
    restoreWeightsFromSnapshot(snapshot.q1Target, trainer.q1Target);
    restoreWeightsFromSnapshot(snapshot.q2Target, trainer.q2Target);
    restoreReplay(snapshot.replay, trainer.replay);
    trainer.actorSteps = snapshot.actorSteps;
    return trainer;
  }

  private criticActionGradient(
    critic: NeuralNetwork,
    state: readonly number[],
    action: readonly number[],
  ): number[] {
    critic.forward(this.criticInput(state, action), true);
    return networkInputGradient(critic, [1]).slice(state.length);
  }
}

/**
 * Soft Actor-Critic (SAC) rời rạc liên tục:
 *
 * - Policy squashed Gaussian: `a = tanh(μ + σ⊙ε)`.
 * - Twin critic, target entropy tự động.
 * - Actor loss `α·logπ − Q`, critic target có entropy bonus.
 *
 * `logStd` là vector tham số độc lập với trạng thái; lựa chọn này giữ cài đặt
 * gọn và ổn định cho không gian hành động nhỏ trong game.
 */
export class SACTrainer extends ContinuousActorCritic {
  public readonly q1: NeuralNetwork;
  public readonly q2: NeuralNetwork;
  public readonly q1Target: NeuralNetwork;
  public readonly q2Target: NeuralNetwork;
  public readonly autoTemperature: boolean;
  public readonly targetEntropy: number;
  public readonly alphaLearningRate: number;

  private logStd: number[];
  private logAlpha: number;

  constructor(config: SACConfig) {
    super(config, 'linear');
    this.autoTemperature = config.autoTemperature ?? true;
    this.targetEntropy = config.targetEntropy ?? -config.actionSize;
    this.alphaLearningRate = Math.max(1e-6, config.alphaLearningRate ?? 0.0003);
    this.logStd = new Array<number>(config.actionSize).fill(-0.5);
    this.logAlpha = Math.log(Math.max(1e-6, config.alpha ?? 0.2));

    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.criticLearningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    const criticConfig = {
      inputSize: config.stateSize + config.actionSize,
      hiddenSizes: config.criticHiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'relu' as const,
      outputActivation: 'linear' as const,
      optimizer,
    };
    this.q1 = new NeuralNetwork({ ...criticConfig, seed: (config.seed ?? 1) + 1 });
    this.q2 = new NeuralNetwork({ ...criticConfig, seed: (config.seed ?? 1) + 2 });
    this.q1Target = this.q1.clone();
    this.q2Target = this.q2.clone();
  }

  /** Nhiệt độ entropy hiện tại. */
  public get alpha(): number {
    return Math.exp(this.logAlpha);
  }

  /** Độ lệch chuẩn Gaussian hiện tại. */
  public get standardDeviation(): number[] {
    return this.logStd.map((value) => Math.exp(value));
  }

  public trainStep(): ContinuousTrainResult | null {
    if (this.replay.size < this.batchSize) return null;
    const batch = this.replay.sample(this.batchSize);
    const actorGradient = createNetworkGradient(this.actor);
    const q1Gradient = createNetworkGradient(this.q1);
    const q2Gradient = createNetworkGradient(this.q2);
    let actorLoss = 0;
    let criticLoss = 0;
    let totalTD = 0;
    let alphaGradient = 0;
    const alpha = this.alpha;

    for (const transition of batch) {
      // Critic target: a' ~ π(·|s'), cộng entropy bonus.
      const nextSample = this.sampleGaussian(transition.nextState, false);
      const nextInput = this.criticInput(transition.nextState, nextSample.action);
      const nextQ1 = this.q1Target.forward(nextInput, false)[0] ?? 0;
      const nextQ2 = this.q2Target.forward(nextInput, false)[0] ?? 0;
      let target = transition.reward;
      if (!transition.done) {
        target += this.gamma * (Math.min(nextQ1, nextQ2) - alpha * nextSample.logProbability);
      }

      const action = clampAction(transition.action, this.actionLow, this.actionHigh);
      const input = this.criticInput(transition.state, action);
      const q1Value = this.q1.forward(input, true)[0] ?? 0;
      const q2Value = this.q2.forward(input, true)[0] ?? 0;
      const td1 = q1Value - target;
      const td2 = q2Value - target;
      totalTD += (Math.abs(td1) + Math.abs(td2)) / 2;
      criticLoss += td1 * td1 + td2 * td2;
      backpropagateNetwork(this.q1, [2 * td1], { gradient: q1Gradient, apply: false });
      backpropagateNetwork(this.q2, [2 * td2], { gradient: q2Gradient, apply: false });

      // Actor: tái tham số hóa a = tanh(μ + σε), tối đa Q − α logπ.
      const sample = this.sampleGaussian(transition.state, true);
      const policyQ = this.q1.forward(this.criticInput(transition.state, sample.action), true)[0] ?? 0;
      actorLoss += alpha * sample.logProbability - policyQ;
      alphaGradient += alpha * (sample.logProbability + this.targetEntropy);

      const gradAction = this.criticActionGradient(this.q1, transition.state, sample.action);
      const gradMu = gradAction.map((value, index) => {
        const normalized = sample.normalized[index] ?? 0;
        const tanhDerivative = 1 - normalized * normalized;
        return (
          -value * this.actionScaleAt(index) * tanhDerivative +
          alpha * 2 * normalized
        );
      });
      backpropagateNetwork(this.actor, gradMu, {
        gradient: actorGradient,
        skipOutputActivation: true,
        apply: false,
      });
    }

    this.applyActorGradient(actorGradient, batch.length);
    this.applyCriticGradient(this.q1, q1Gradient, batch.length);
    this.applyCriticGradient(this.q2, q2Gradient, batch.length);
    this.softUpdateTargets(this.tau);

    if (this.autoTemperature) {
      this.logAlpha = clampRange(
        this.logAlpha + (this.alphaLearningRate * alphaGradient) / batch.length,
        -20,
        10,
      );
    }

    return {
      actorLoss: actorLoss / batch.length,
      criticLoss: criticLoss / batch.length,
      meanTDError: totalTD / batch.length,
      batchSize: batch.length,
      policyUpdated: true,
      alpha: this.alpha,
    };
  }

  /** Chọn hành động theo policy ngẫu nhiên (hoặc tất định nếu `explore=false`). */
  public override selectAction(
    state: readonly number[],
    explore = true,
    _noiseScale = 0.1,
  ): number[] {
    if (!explore) return this.policyAction(state, false);
    return this.sampleGaussian(state, false).action;
  }

  /** Hành động tất định dùng mean (không lấy mẫu). */
  public override policyAction(state: readonly number[], training = false): number[] {
    const mean = this.actor.forward(state, training);
    return this.actionFromNormalized(mean.map((value) => Math.tanh(value)));
  }

  /** Lấy mẫu squashed Gaussian và log-probability tương ứng. */
  public sampleGaussian(state: readonly number[], training = false): SquashedGaussianSample {
    const mean = this.actor.forward(state, training);
    const std = this.standardDeviation;
    const epsilon = mean.map(() => this.random.gaussian(0, 1));
    const z = mean.map((value, index) => value + std[index] * epsilon[index]);
    const normalized = z.map((value) => Math.tanh(value));
    const action = this.actionFromNormalized(normalized);
    let logProbability = 0;
    for (let i = 0; i < this.actionSize; i++) {
      const raw = normalized[i];
      const squashed = Math.max(1 - raw * raw, 1e-8);
      logProbability +=
        -0.5 * (epsilon[i] * epsilon[i] + LOG_TWO_PI) -
        this.logStd[i] -
        Math.log(squashed);
      const scale = this.actionScaleAt(i);
      if (scale > 0) logProbability -= Math.log(scale);
    }
    return { action, normalized, mean, std, logProbability };
  }

  /** Đồng bộ cứng toàn bộ target. */
  public syncTargets(): void {
    copyNetworkWeights(this.q1, this.q1Target);
    copyNetworkWeights(this.q2, this.q2Target);
    copyNetworkWeights(this.actor, this.actorTarget);
  }

  /** Cập nhật Polyak target critic (và actor nếu có dùng). */
  public softUpdateTargets(tau = this.tau): void {
    softCopyNetworkWeights(this.q1, this.q1Target, tau);
    softCopyNetworkWeights(this.q2, this.q2Target, tau);
    softCopyNetworkWeights(this.actor, this.actorTarget, tau);
  }

  public snapshot(): SACSnapshot {
    return {
      config: {
        ...snapshotConfig(this.config),
        alpha: this.alpha,
        targetEntropy: this.targetEntropy,
        alphaLearningRate: this.alphaLearningRate,
        autoTemperature: this.autoTemperature,
      },
      actor: this.actor.snapshot(),
      q1: this.q1.snapshot(),
      q2: this.q2.snapshot(),
      q1Target: this.q1Target.snapshot(),
      q2Target: this.q2Target.snapshot(),
      logAlpha: this.logAlpha,
      replay: this.replay.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: SACSnapshot): SACTrainer {
    const trainer = new SACTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.actor, trainer.actor);
    restoreWeightsFromSnapshot(snapshot.q1, trainer.q1);
    restoreWeightsFromSnapshot(snapshot.q2, trainer.q2);
    restoreWeightsFromSnapshot(snapshot.q1Target, trainer.q1Target);
    restoreWeightsFromSnapshot(snapshot.q2Target, trainer.q2Target);
    restoreReplay(snapshot.replay, trainer.replay);
    trainer.logAlpha = clampRange(snapshot.logAlpha, -20, 10);
    return trainer;
  }

  private criticActionGradient(
    critic: NeuralNetwork,
    state: readonly number[],
    action: readonly number[],
  ): number[] {
    critic.forward(this.criticInput(state, action), true);
    return networkInputGradient(critic, [1]).slice(state.length);
  }

  private actionScaleAt(index: number): number {
    return (this.actionHigh[index] - this.actionLow[index]) / 2;
  }

  private applyCriticGradient(
    network: NeuralNetwork,
    gradient: ReturnType<typeof createNetworkGradient>,
    batchSize: number,
  ): void {
    if (this.gradientClip > 0) clipNetworkGradient(gradient, this.gradientClip);
    applyNetworkGradient(network, gradient, {
      optimizer: network.optimizer,
      batchSize,
    });
  }
}

/** Alias ngắn cho DDPG. */
export { DDPGTrainer as ContinuousDDPGTrainer };
/** Alias ngắn cho TD3. */
export { TD3Trainer as ContinuousTD3Trainer };
/** Alias ngắn cho SAC. */
export { SACTrainer as ContinuousSACTrainer };

const LOG_TWO_PI = Math.log(2 * Math.PI);

/** Ánh xạ hành động thô `[-1,1]` sang biên thật. */
export function scaleRawAction(
  raw: readonly number[],
  low: readonly number[],
  high: readonly number[],
): number[] {
  return raw.map(
    (value, index) => low[index] + ((clampRange(value, -1, 1) + 1) / 2) * (high[index] - low[index]),
  );
}

/** Kẹp hành động vào biên. */
export function clampAction(
  action: readonly number[],
  low: readonly number[],
  high: readonly number[],
): number[] {
  return action.map((value, index) => clampRange(value, low[index], high[index]));
}

/** Chuẩn hóa mảng biên với giá trị mặc định. */
function normalizeBounds(
  values: readonly number[] | undefined,
  size: number,
  fallback: number,
): number[] {
  const result = new Array<number>(size).fill(fallback);
  if (!values) return result;
  for (let i = 0; i < size; i++) {
    const value = values[i];
    result[i] = typeof value === 'number' ? value : fallback;
  }
  return result;
}

/** Bản sao cấu hình không chia sẻ mảng biên. */
function snapshotConfig(config: ContinuousRLConfig): ContinuousRLConfig {
  return {
    ...config,
    actionLow: config.actionLow ? [...config.actionLow] : undefined,
    actionHigh: config.actionHigh ? [...config.actionHigh] : undefined,
  };
}


/** Nạp replay từ snapshot mà không tạo replay tạm. */
function restoreReplay(
  snapshot: ReturnType<ExperienceReplay<number[], number[]>['snapshot']>,
  target: ExperienceReplay<number[], number[]>,
): void {
  target.clear();
  target.pushMany(snapshot.items);
}


