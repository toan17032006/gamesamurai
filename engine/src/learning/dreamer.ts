/**
 * @file dreamer.ts
 * @module @aetheria/engine/learning/dreamer
 * @description DreamerV3-lite (Hafner et al. 2023) trên lõi MLP hiện có — world
 * model latent kiểu RSSM **rút gọn về phần deterministic**:
 *
 * - **Model học thế giới**: `encoder` nén quan sát thành embedding; `sequence`
 *   (posterior) cập nhật trạng thái ẩn `s_t = f([s_{t-1}, a_{t-1}, e_t])`;
 *   `imagination` (prior) dự đoán `s_{t+1} = g([s_t, a_t])` không cần quan sát —
 *   hai đầu này được kéo lại gần nhau bằng MSE (thay KL của RSSM gốc vì bỏ
 *   thành phần stochastic). Ba đầu đọc: `decoder` (tái tạo quan sát),
 *   `rewardHead`, `continueHead` (logit xác suất episode còn tiếp).
 * - **Huấn luyện world model**: BPTT hai lượt qua chuỗi thời gian — lượt
 *   forward-only tính toàn bộ trạng thái, lượt ngược dồn gradient qua decoder/
   reward/continue → sequence → encoder (giống kỹ thuật unroll của muzero.ts).
 * - **Actor-critic trong tưởng tượng**: rollout H bước bằng `imagination` +
 *   actor; trả về lambda-return `G_t = r_{t+1} + γ·cont·((1−λ)V(s_{t+1}) + λG_{t+1})`;
 *   critic hồi quy về `G^λ` (detached), actor tối đa hóa bằng policy gradient
 *   có baseline `−(G^λ − V)·∇logπ` (REINFORCE trong giấc mơ).
 *
 * Không sửa lõi `NeuralNetwork`/`DenseLayer`; mọi mạng dùng optimizer Adam sẵn
 * có. Chú thích tiếng Việt theo quy ước dự án.
 */

import { NeuralNetwork, type OptimizerConfig } from '../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../deeplearning/random.js';
import {
  applyNetworkGradient,
  backpropagateNetwork,
  binaryCrossEntropyGradient,
  clipNetworkGradient,
  createNetworkGradient,
  meanSquaredErrorGradient,
  softmaxVector,
  type NetworkGradient,
} from './network.js';
import { restoreWeightsFromSnapshot } from './internal.js';

/** Cấu hình Dreamer-lite. */
export interface DreamerConfig {
  /** Số chiều quan sát. */
  observationSize: number;
  /** Số hành động rời rạc. */
  actionCount: number;
  /** Số chiều trạng thái ẩn recurrent; mặc định 16. */
  stateSize?: number;
  /** Số chiều embedding của encoder; mặc định 16. */
  embedSize?: number;
  /** Độ dài rollout tưởng tượng (H); mặc định 8. */
  horizon?: number;
  gamma?: number;
  /** Hệ số λ của lambda-return; mặc định 0.95. */
  returnLambda?: number;
  learningRate?: number;
  /** Hệ số loss tái tạo quan sát; mặc định 1. */
  reconstructionCoef?: number;
  /** Hệ số loss dự đoán phần thưởng; mặc định 1. */
  rewardCoef?: number;
  /** Hệ số loss đầu continue; mặc định 0.5. */
  continueCoef?: number;
  /** Hệ số loss kéo prior (imagination) về posterior; mặc định 0.5. */
  priorCoef?: number;
  /** Số trạng thái khởi đầu mỗi lần trainAgent; mặc định 8. */
  imaginationBatch?: number;
  /** Số sequence giữ trong replay; mặc định 100. */
  capacity?: number;
  /** Cắt norm gradient; 0 = tắt. */
  gradientClip?: number;
  seed?: number;
}

/** Quyết định hành động kèm log-probability để telemetry. */
export interface DreamerDecision {
  action: number;
  logProbability: number;
  /** Trạng thái ẩn sau khi mã hóa quan sát (dùng cho telemetry/debug). */
  state: number[];
}

/** Kết quả một lần trainWorldModel. */
export interface DreamerWorldModelResult {
  reconstructionLoss: number;
  rewardLoss: number;
  continueLoss: number;
  priorLoss: number;
  sequenceLength: number;
}

/** Kết quả một lần trainAgent. */
export interface DreamerAgentResult {
  criticLoss: number;
  actorLoss: number;
  meanImaginedReturn: number;
  rollouts: number;
}

/** Kết quả một vòng train() kết hợp. */
export interface DreamerTrainResult extends DreamerWorldModelResult, DreamerAgentResult {}

/** Ảnh chụp Dreamer-lite để lưu checkpoint. */
export interface DreamerSnapshot {
  config: DreamerConfig;
  encoder: ReturnType<NeuralNetwork['snapshot']>;
  sequence: ReturnType<NeuralNetwork['snapshot']>;
  imagination: ReturnType<NeuralNetwork['snapshot']>;
  decoder: ReturnType<NeuralNetwork['snapshot']>;
  rewardHead: ReturnType<NeuralNetwork['snapshot']>;
  continueHead: ReturnType<NeuralNetwork['snapshot']>;
  actor: ReturnType<NeuralNetwork['snapshot']>;
  critic: ReturnType<NeuralNetwork['snapshot']>;
  /** Trạng thái recurrent nội bộ (phục vụ suy luận liền mạch sau khôi phục). */
  internalState: number[];
  lastActionOneHot: number[];
}

/** Một bước trong sequence thực tế đã thu thập. */
interface DreamerStep {
  observation: number[];
  action: number;
  reward: number;
  done: boolean;
}

/**
 * Dreamer-lite: world model latent + actor-critic học trong giấc mơ.
 *
 * Vòng lặp game khuyến nghị:
 * 1. `resetEpisode()` đầu mỗi episode.
 * 2. `act(observation)` → hành động (mạng actor trên trạng thái ẩn recurrent).
 * 3. Môi trường thực thi → `observe(observation, action, reward, done)`.
 * 4. Định kỳ `train()` — một bước world model + một bước agent trong giấc mơ.
 */
export class DreamerTrainer {
  public readonly actionCount: number;
  public readonly stateSize: number;
  public readonly embedSize: number;
  public readonly gamma: number;
  public readonly returnLambda: number;
  public readonly horizon: number;
  public readonly encoder: NeuralNetwork;
  public readonly sequence: NeuralNetwork;
  public readonly imagination: NeuralNetwork;
  public readonly decoder: NeuralNetwork;
  public readonly rewardHead: NeuralNetwork;
  public readonly continueHead: NeuralNetwork;
  public readonly actor: NeuralNetwork;
  public readonly critic: NeuralNetwork;

  private readonly config: DreamerConfig;
  private readonly random: DeepRandom;
  private readonly observationSize: number;
  private readonly reconstructionCoef: number;
  private readonly rewardCoef: number;
  private readonly continueCoef: number;
  private readonly priorCoef: number;
  private readonly imaginationBatch: number;
  private readonly capacity: number;
  private readonly gradientClip: number;
  /** Sequence đang ghi. */
  private currentSequence: DreamerStep[] = [];
  /** Kho sequence hoàn chỉnh (bộ đệm vòng). */
  private readonly completedSequences: DreamerStep[][] = [];
  /** Trạng thái recurrent nội bộ phục vụ suy luận. */
  private internalState: number[] = [];
  private lastActionOneHot: number[] = [];
  private pendingObservation: number[] | null = null;
  private pendingAction = 0;

  constructor(config: DreamerConfig) {
    if (config.observationSize <= 0) throw new RangeError('Dreamer cần observationSize dương');
    if (config.actionCount <= 0) throw new RangeError('Dreamer cần actionCount dương');
    this.config = { ...config };
    this.observationSize = config.observationSize;
    this.actionCount = config.actionCount;
    this.stateSize = Math.max(4, Math.floor(config.stateSize ?? 16));
    this.embedSize = Math.max(4, Math.floor(config.embedSize ?? 16));
    this.horizon = Math.max(1, Math.floor(config.horizon ?? 8));
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.returnLambda = clampRange(config.returnLambda ?? 0.95, 0, 1);
    this.reconstructionCoef = Math.max(0, config.reconstructionCoef ?? 1);
    this.rewardCoef = Math.max(0, config.rewardCoef ?? 1);
    this.continueCoef = Math.max(0, config.continueCoef ?? 0.5);
    this.priorCoef = Math.max(0, config.priorCoef ?? 0.5);
    this.imaginationBatch = Math.max(1, Math.floor(config.imaginationBatch ?? 8));
    this.capacity = Math.max(2, Math.floor(config.capacity ?? 100));
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.random = new DeepRandom(config.seed ?? 1);
    this.resetEpisode();

    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.003,
      weightDecay: 0.0001,
    };
    const seed = config.seed ?? 1;
    this.encoder = new NeuralNetwork({
      inputSize: this.observationSize,
      hiddenSizes: [this.embedSize],
      outputSize: this.embedSize,
      hiddenActivation: 'tanh',
      outputActivation: 'tanh',
      optimizer,
      seed,
    });
    // sequence: [s_{t-1}, a_{t-1}, e_t] → s_t (posterior recurrent).
    this.sequence = new NeuralNetwork({
      inputSize: this.stateSize + this.actionCount + this.embedSize,
      hiddenSizes: [this.stateSize],
      outputSize: this.stateSize,
      hiddenActivation: 'tanh',
      outputActivation: 'tanh',
      optimizer,
      seed: seed + 1,
    });
    // imagination (prior): [s_t, a_t] → s_{t+1} — không cần quan sát.
    this.imagination = new NeuralNetwork({
      inputSize: this.stateSize + this.actionCount,
      hiddenSizes: [this.stateSize],
      outputSize: this.stateSize,
      hiddenActivation: 'tanh',
      outputActivation: 'tanh',
      optimizer,
      seed: seed + 2,
    });
    this.decoder = new NeuralNetwork({
      inputSize: this.stateSize,
      hiddenSizes: [this.stateSize],
      outputSize: this.observationSize,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 3,
    });
    this.rewardHead = new NeuralNetwork({
      inputSize: this.stateSize,
      hiddenSizes: [this.stateSize],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 4,
    });
    this.continueHead = new NeuralNetwork({
      inputSize: this.stateSize,
      hiddenSizes: [this.stateSize],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 5,
    });
    this.actor = new NeuralNetwork({
      inputSize: this.stateSize,
      hiddenSizes: [this.stateSize],
      outputSize: this.actionCount,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 6,
    });
    this.critic = new NeuralNetwork({
      inputSize: this.stateSize,
      hiddenSizes: [this.stateSize],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 7,
    });
  }

  // --- Thu thập dữ liệu ----------------------------------------------------

  /** Reset trạng thái recurrent đầu mỗi episode. */
  public resetEpisode(): void {
    this.internalState = new Array<number>(this.stateSize).fill(0);
    this.lastActionOneHot = new Array<number>(this.actionCount).fill(0);
  }

  /**
   * Mã hóa quan sát qua recurrent state và chọn hành động bằng actor.
   *
   * Ghi nhớ quan sát/hành động để `observe` đóng bước sau khi môi trường phản hồi.
   */
  public act(observation: readonly number[]): DreamerDecision {
    if (observation.length !== this.observationSize) {
      throw new RangeError(`Quan sát cần ${this.observationSize} chiều`);
    }
    const embedding = this.encoder.predict(observation);
    const state = this.sequence.predict([
      ...this.internalState,
      ...this.lastActionOneHot,
      ...embedding,
    ]);
    this.internalState = state;
    const logits = this.actor.predict(state);
    const probabilities = softmaxVector(logits);
    const roll = this.random.next();
    let action = probabilities.length - 1;
    let cumulative = 0;
    for (let a = 0; a < probabilities.length; a++) {
      cumulative += probabilities[a] ?? 0;
      if (roll <= cumulative) {
        action = a;
        break;
      }
    }
    this.lastActionOneHot = this.oneHot(action);
    this.pendingObservation = [...observation];
    this.pendingAction = action;
    return {
      action,
      logProbability: Math.log(Math.max(probabilities[action] ?? 1e-12, 1e-12)),
      state: [...state],
    };
  }

  /**
   * Đóng một bước tương tác vào sequence: dùng quan sát/hành động đã ghi lúc
   * `act()` kèm phần thưởng và cờ kết thúc từ môi trường. `done` lưu sequence
   * hoàn chỉnh vào replay.
   */
  public observe(reward: number, done: boolean): void {
    const observation = this.pendingObservation;
    if (!observation) {
      throw new Error('observe cần được gọi sau act()');
    }
    this.pendingObservation = null;
    this.currentSequence.push({
      observation,
      action: this.pendingAction,
      reward,
      done,
    });
    if (done && this.currentSequence.length > 0) {
      this.completedSequences.push(this.currentSequence);
      if (this.completedSequences.length > this.capacity) {
        this.completedSequences.shift();
      }
      this.currentSequence = [];
    }
  }

  /** Số sequence hoàn chỉnh trong replay. */
  public get sequenceCount(): number {
    return this.completedSequences.length;
  }

  // --- Huấn luyện world model ---------------------------------------------

  /**
   * Một bước huấn luyện world model trên một sequence ngẫu nhiên.
   *
   * Hai lượt: forward-only tính chuỗi trạng thái; lượt ngược dồn gradient
   * qua các đầu đọc → sequence → encoder, kèm loss kéo prior về posterior.
   * Trả `null` nếu chưa có sequence đủ dài.
   */
  public trainWorldModel(): DreamerWorldModelResult | null {
    const usable = this.completedSequences.filter((sequence) => sequence.length >= 2);
    if (usable.length === 0) return null;
    const sequenceData = usable[this.random.int(0, usable.length - 1)];
    const length = sequenceData.length;

    // Lượt 1: forward-only — embeddings và chuỗi trạng thái.
    const embeddings = sequenceData.map((step) => this.encoder.predict(step.observation));
    const states: number[][] = [new Array<number>(this.stateSize).fill(0)];
    for (let t = 0; t < length; t++) {
      const previous = states[t];
      const actionOneHot = this.oneHot(sequenceData[t].action);
      states.push(this.sequence.predict([...previous, ...actionOneHot, ...embeddings[t]]));
    }
    // states[t + 1] là trạng thái sau khi mã hóa bước t.

    const encoderGradient = createNetworkGradient(this.encoder);
    const sequenceGradient = createNetworkGradient(this.sequence);
    const imaginationGradient = createNetworkGradient(this.imagination);
    const decoderGradient = createNetworkGradient(this.decoder);
    const rewardGradient = createNetworkGradient(this.rewardHead);
    const continueGradient = createNetworkGradient(this.continueHead);
    let reconstructionLossTotal = 0;
    let rewardLossTotal = 0;
    let continueLossTotal = 0;
    let priorLossTotal = 0;
    // Gradient dồn về s_t từ các bước tương lai (sequence/prior của bước t+1).
    let pendingStateGrad: number[] | null = null;

    for (let t = length - 1; t >= 0; t--) {
      const state = states[t + 1];
      const gradState = new Array<number>(this.stateSize).fill(0);
      if (pendingStateGrad) {
        for (let i = 0; i < this.stateSize; i++) gradState[i] += pendingStateGrad[i] ?? 0;
        pendingStateGrad = null;
      }
      const step = sequenceData[t];

      // Decoder: tái tạo quan sát.
      const decoded = this.decoder.forward(state, true);
      const reconstruction = meanSquaredErrorGradient(decoded, step.observation, this.reconstructionCoef);
      reconstructionLossTotal += reconstruction.loss;
      const gradFromDecoder = backpropagateNetwork(this.decoder, reconstruction.gradOutput, {
        gradient: decoderGradient,
        apply: false,
      }).gradInput;
      for (let i = 0; i < this.stateSize; i++) gradState[i] += gradFromDecoder[i] ?? 0;

      // Reward head: dự đoán phần thưởng thật của bước.
      const rewardOut = this.rewardHead.forward(state, true);
      const rewardResult = meanSquaredErrorGradient(rewardOut, [step.reward], this.rewardCoef);
      rewardLossTotal += rewardResult.loss;
      const gradFromReward = backpropagateNetwork(this.rewardHead, rewardResult.gradOutput, {
        gradient: rewardGradient,
        apply: false,
      }).gradInput;
      for (let i = 0; i < this.stateSize; i++) gradState[i] += gradFromReward[i] ?? 0;

      // Continue head: logit xác suất episode còn tiếp (target = 1 − done).
      const continueOut = this.continueHead.forward(state, true);
      const continueResult = binaryCrossEntropyGradient(
        continueOut,
        [step.done ? 0 : 1],
        this.continueCoef,
      );
      continueLossTotal += continueResult.loss;
      const gradFromContinue = backpropagateNetwork(this.continueHead, continueResult.gradLogits, {
        gradient: continueGradient,
        apply: false,
      }).gradInput;
      for (let i = 0; i < this.stateSize; i++) gradState[i] += gradFromContinue[i] ?? 0;

      // Prior: imagination([s_{t-1}, a_{t-1}]) kéo về posterior s_{t} (target).
      if (t >= 1) {
        const previous = states[t];
        const previousAction = this.oneHot(sequenceData[t - 1].action);
        const imagined = this.imagination.forward([...previous, ...previousAction], true);
        const priorResult = meanSquaredErrorGradient(imagined, state, this.priorCoef);
        priorLossTotal += priorResult.loss;
        const gradFromPrior = backpropagateNetwork(this.imagination, priorResult.gradOutput, {
          gradient: imaginationGradient,
          apply: false,
        }).gradInput;
        // Gradient theo s_{t-1} dồn về bước kế tiếp trong vòng ngược.
        if (!pendingStateGrad) pendingStateGrad = new Array<number>(this.stateSize).fill(0);
        for (let i = 0; i < this.stateSize; i++) {
          pendingStateGrad[i] += gradFromPrior[i] ?? 0;
        }
      }

      // Sequence: [s_{t-1}, a_{t-1}, e_t] → s_t với gradient dồn gradState.
      const previousState = states[t];
      const previousAction = this.oneHot(sequenceData[t].action);
      const sequenceInput = [...previousState, ...previousAction, ...embeddings[t]];
      this.sequence.forward(sequenceInput, true);
      const gradFromSequence = backpropagateNetwork(this.sequence, gradState, {
        gradient: sequenceGradient,
        apply: false,
      }).gradInput;
      // Tách gradient: phần s_{t-1} gửi lại bước trước; phần e_t cho encoder.
      if (t >= 1) {
        if (!pendingStateGrad) pendingStateGrad = new Array<number>(this.stateSize).fill(0);
        for (let i = 0; i < this.stateSize; i++) {
          pendingStateGrad[i] += gradFromSequence[i] ?? 0;
        }
      }
      const gradEmbedding = gradFromSequence.slice(this.stateSize + this.actionCount);
      this.encoder.forward(sequenceData[t].observation, true);
      backpropagateNetwork(this.encoder, gradEmbedding, {
        gradient: encoderGradient,
        apply: false,
      });
    }

    if (this.gradientClip > 0) {
      clipNetworkGradient(encoderGradient, this.gradientClip);
      clipNetworkGradient(sequenceGradient, this.gradientClip);
      clipNetworkGradient(imaginationGradient, this.gradientClip);
      clipNetworkGradient(decoderGradient, this.gradientClip);
      clipNetworkGradient(rewardGradient, this.gradientClip);
      clipNetworkGradient(continueGradient, this.gradientClip);
    }
    applyNetworkGradient(this.encoder, encoderGradient, { optimizer: this.encoder.optimizer, batchSize: length });
    applyNetworkGradient(this.sequence, sequenceGradient, { optimizer: this.sequence.optimizer, batchSize: length });
    applyNetworkGradient(this.imagination, imaginationGradient, { optimizer: this.imagination.optimizer, batchSize: Math.max(1, length - 1) });
    applyNetworkGradient(this.decoder, decoderGradient, { optimizer: this.decoder.optimizer, batchSize: length });
    applyNetworkGradient(this.rewardHead, rewardGradient, { optimizer: this.rewardHead.optimizer, batchSize: length });
    applyNetworkGradient(this.continueHead, continueGradient, { optimizer: this.continueHead.optimizer, batchSize: length });

    return {
      reconstructionLoss: reconstructionLossTotal / length,
      rewardLoss: rewardLossTotal / length,
      continueLoss: continueLossTotal / length,
      priorLoss: priorLossTotal / Math.max(1, length - 1),
      sequenceLength: length,
    };
  }

  // --- Huấn luyện actor-critic trong giấc mơ --------------------------------

  /**
   * Một bước actor-critic trên rollout tưởng tượng.
   *
   * Roll H bước bằng imagination + actor từ các trạng thái thật ngẫu nhiên;
   * tính lambda-return `G^λ` với value bootstrap của critic; critic hồi quy về
   * `G^λ`, actor tối đa bằng policy gradient có baseline.
   * Trả `null` nếu chưa có sequence đủ dài.
   */
  public trainAgent(): DreamerAgentResult | null {
    const usable = this.completedSequences.filter((sequence) => sequence.length >= 1);
    if (usable.length === 0) return null;
    const rollouts = this.imaginationBatch;
    const horizon = this.horizon;
    const actorGradient = createNetworkGradient(this.actor);
    const criticGradient = createNetworkGradient(this.critic);
    let criticLossTotal = 0;
    let actorLossTotal = 0;
    let returnTotal = 0;
    let terms = 0;

    for (let rollout = 0; rollout < rollouts; rollout++) {
      // Trạng thái khởi đầu: chạy world model forward trên một sequence thật.
      const sequenceData = usable[this.random.int(0, usable.length - 1)];
      const start = this.random.int(0, sequenceData.length - 1);
      let state = new Array<number>(this.stateSize).fill(0);
      for (let t = 0; t <= start; t++) {
        const embedding = this.encoder.predict(sequenceData[t].observation);
        state = this.sequence.predict([
          ...state,
          ...this.oneHot(sequenceData[t].action),
          ...embedding,
        ]);
      }

      // Rollout tưởng tượng: lưu trạng thái, hành động, phần thưởng, continue.
      const imaginedStates: number[][] = [state];
      const actions: number[] = [];
      const rewards: number[] = [];
      const continues: number[] = [];
      for (let h = 0; h < horizon; h++) {
        const logits = this.actor.predict(state);
        const probabilities = softmaxVector(logits);
        const action = this.sampleIndex(probabilities);
        actions.push(action);
        const next = this.imagination.predict([...state, ...this.oneHot(action)]);
        imaginedStates.push(next);
        rewards.push(this.rewardHead.predict(next)[0] ?? 0);
        const continueLogit = this.continueHead.predict(next)[0] ?? 0;
        continues.push(clampRange(1 / (1 + Math.exp(-clampRange(continueLogit, -30, 30))), 0.01, 1));
        state = next;
      }
      // Value bootstrap tại trạng thái cuối.
      const bootstrapValue = this.critic.predict(imaginedStates[horizon])[0] ?? 0;

      // Lambda-return ngược: G_{H-1} = r_H + γ·c_H·V_H;
      // G_t = r_{t+1} + γ·c_{t+1}·((1−λ)V(s_{t+1}) + λG_{t+1}).
      const lambdaReturns = new Array<number>(horizon).fill(0);
      for (let h = horizon - 1; h >= 0; h--) {
        const nextStateValue = this.critic.predict(imaginedStates[h + 1])[0] ?? 0;
        const continuation = h === horizon - 1
          ? bootstrapValue
          : (1 - this.returnLambda) * nextStateValue + this.returnLambda * lambdaReturns[h + 1];
        lambdaReturns[h] = rewards[h] + this.gamma * continues[h] * continuation;
      }

      // Cập nhật critic (hồi quy G^λ) và actor (policy gradient có baseline).
      for (let h = 0; h < horizon; h++) {
        const imaginedState = imaginedStates[h];
        const target = lambdaReturns[h];
        returnTotal += target;
        terms++;

        const predicted = this.critic.forward(imaginedState, true)[0] ?? 0;
        const valueError = predicted - target;
        criticLossTotal += valueError * valueError;
        backpropagateNetwork(this.critic, [2 * valueError], {
          gradient: criticGradient,
          apply: false,
        });

        // REINFORCE: ∇loss = −A·(onehot(a) − π) với A = G^λ − V(s) (detached).
        const logits = this.actor.forward(imaginedState, true);
        const probabilities = softmaxVector(logits);
        const advantage = clampRange(target - (this.critic.predict(imaginedState)[0] ?? 0), -50, 50);
        actorLossTotal += -advantage * Math.log(
          Math.max(probabilities[actions[h]] ?? 1e-12, 1e-12),
        );
        const gradLogits = probabilities.map(
          (probability, index) => -advantage * ((index === actions[h] ? 1 : 0) - probability),
        );
        backpropagateNetwork(this.actor, gradLogits, {
          gradient: actorGradient,
          skipOutputActivation: true,
          apply: false,
        });
      }
    }

    if (this.gradientClip > 0) {
      clipNetworkGradient(actorGradient, this.gradientClip);
      clipNetworkGradient(criticGradient, this.gradientClip);
    }
    const sampleCount = Math.max(1, rollouts * horizon);
    applyNetworkGradient(this.actor, actorGradient, {
      optimizer: this.actor.optimizer,
      batchSize: sampleCount,
    });
    applyNetworkGradient(this.critic, criticGradient, {
      optimizer: this.critic.optimizer,
      batchSize: sampleCount,
    });

    return {
      criticLoss: criticLossTotal / sampleCount,
      actorLoss: actorLossTotal / sampleCount,
      meanImaginedReturn: returnTotal / Math.max(1, terms),
      rollouts,
    };
  }

  /** Một bước kết hợp: world model + agent trong giấc mơ. */
  public train(): DreamerTrainResult | null {
    const world = this.trainWorldModel();
    const agent = this.trainAgent();
    if (!world && !agent) return null;
    return {
      reconstructionLoss: world?.reconstructionLoss ?? 0,
      rewardLoss: world?.rewardLoss ?? 0,
      continueLoss: world?.continueLoss ?? 0,
      priorLoss: world?.priorLoss ?? 0,
      sequenceLength: world?.sequenceLength ?? 0,
      criticLoss: agent?.criticLoss ?? 0,
      actorLoss: agent?.actorLoss ?? 0,
      meanImaginedReturn: agent?.meanImaginedReturn ?? 0,
      rollouts: agent?.rollouts ?? 0,
    };
  }

  /** Chạy nhiều bước kết hợp; trả số bước thực hiện được. */
  public trainSteps(steps: number): DreamerTrainResult[] {
    const results: DreamerTrainResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(steps)); i++) {
      const result = this.train();
      if (!result) break;
      results.push(result);
    }
    return results;
  }

  /** Value ước lượng của một quan sát (không cần MCTS/hành động). */
  public evaluateValue(observation: readonly number[]): number {
    const embedding = this.encoder.predict(observation);
    const state = this.sequence.predict([
      ...this.internalState,
      ...this.lastActionOneHot,
      ...embedding,
    ]);
    return this.critic.predict(state)[0] ?? 0;
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): DreamerSnapshot {
    return {
      config: { ...this.config },
      encoder: this.encoder.snapshot(),
      sequence: this.sequence.snapshot(),
      imagination: this.imagination.snapshot(),
      decoder: this.decoder.snapshot(),
      rewardHead: this.rewardHead.snapshot(),
      continueHead: this.continueHead.snapshot(),
      actor: this.actor.snapshot(),
      critic: this.critic.snapshot(),
      internalState: [...this.internalState],
      lastActionOneHot: [...this.lastActionOneHot],
    };
  }

  /** Khôi phục Dreamer-lite từ checkpoint. */
  public static fromSnapshot(snapshot: DreamerSnapshot): DreamerTrainer {
    const trainer = new DreamerTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.encoder, trainer.encoder);
    restoreWeightsFromSnapshot(snapshot.sequence, trainer.sequence);
    restoreWeightsFromSnapshot(snapshot.imagination, trainer.imagination);
    restoreWeightsFromSnapshot(snapshot.decoder, trainer.decoder);
    restoreWeightsFromSnapshot(snapshot.rewardHead, trainer.rewardHead);
    restoreWeightsFromSnapshot(snapshot.continueHead, trainer.continueHead);
    restoreWeightsFromSnapshot(snapshot.actor, trainer.actor);
    restoreWeightsFromSnapshot(snapshot.critic, trainer.critic);
    if (snapshot.internalState?.length === trainer.stateSize) {
      trainer.internalState = [...snapshot.internalState];
    }
    if (snapshot.lastActionOneHot?.length === trainer.actionCount) {
      trainer.lastActionOneHot = [...snapshot.lastActionOneHot];
    }
    return trainer;
  }

  // --- Nội bộ ---------------------------------------------------------------

  private oneHot(action: number): number[] {
    const vector = new Array<number>(this.actionCount).fill(0);
    if (action >= 0 && action < this.actionCount) vector[action] = 1;
    return vector;
  }

  private sampleIndex(probabilities: readonly number[]): number {
    const roll = this.random.next();
    let cumulative = 0;
    for (let a = 0; a < probabilities.length; a++) {
      cumulative += probabilities[a] ?? 0;
      if (roll <= cumulative) return a;
    }
    let best = 0;
    for (let a = 1; a < probabilities.length; a++) {
      if ((probabilities[a] ?? 0) > (probabilities[best] ?? 0)) best = a;
    }
    return best;
  }
}

