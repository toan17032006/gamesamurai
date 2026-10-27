/**
 * @file world-model.ts
 * @module @aetheria/engine/learning/reinforcement/world-model
 * @description Học mô hình thế giới (model-based RL) cho agent game:
 *
 * - `WorldModelTrainer`: học động học `s' − s` và phần thưởng `r` từ transition.
 * - `RandomShootingPlanner`: lập kế hoạch bằng bắn mẫu ngẫu nhiên.
 * - `CEMPlanner`: cross-entropy method tối ưu chuỗi hành động trong mô hình.
 * - `DynaDQNTrainer`: bổ sung transition tưởng tượng vào replay của DQN (Dyna-Q).
 *
 * Mô hình thế giới không thay thế môi trường thật; nó chỉ là bộ dự đoán một
 * bước. Game vẫn chịu trách nhiệm phát hiện mô hình sai lệch và huấn luyện lại.
 */

import { NeuralNetwork, type OptimizerConfig } from '../../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../../deeplearning/random.js';
import {
  applyNetworkGradient,
  backpropagateNetwork,
  createNetworkGradient,
  meanSquaredErrorGradient,
  oneHot,
} from '../network.js';
import type { LearningOptions, LearningReport, NumericVector } from '../types.js';
import { DuelingDQNTrainer } from './dqn.js';
import { restoreWeightsFromSnapshot } from '../internal.js';

/** Hành động trong mô hình thế giới: id rời rạc hoặc vector liên tục. */
export type WorldModelAction = number | readonly number[];

/** Một transition dùng để học mô hình. */
export interface WorldModelSample {
  state: NumericVector;
  action: WorldModelAction;
  reward: number;
  nextState: NumericVector;
  done?: boolean;
}

/** Cấu hình mô hình thế giới. */
export interface WorldModelConfig {
  stateSize: number;
  mode: 'discrete' | 'continuous';
  /** Số hành động rời rạc. */
  actionCount?: number;
  /** Số chiều hành động liên tục. */
  actionSize?: number;
  hiddenSizes?: readonly number[];
  learningRate?: number;
  seed?: number;
}

/** Ảnh chụp mô hình thế giới. */
export interface WorldModelSnapshot {
  config: WorldModelConfig;
  dynamics: ReturnType<NeuralNetwork['snapshot']>;
  reward: ReturnType<NeuralNetwork['snapshot']>;
}

/** Kết quả dự đoán một bước. */
export interface WorldPrediction {
  nextState: number[];
  reward: number;
  delta: number[];
}

/**
 * Mô hình thế giới xác định (deterministic).
 *
 * Dynamics dự đoán `Δs = s' − s` thay vì `s'` trực tiếp: với trạng thái biến
 * thiên chậm trong game, học phần dư giúp mạng nhỏ hội tụ nhanh và ổn định hơn.
 */
export class WorldModelTrainer {
  public readonly dynamics: NeuralNetwork;
  public readonly reward: NeuralNetwork;
  public readonly actionVectorSize: number;

  private readonly config: WorldModelConfig;
  private readonly random: DeepRandom;

  constructor(config: WorldModelConfig) {
    if (config.stateSize <= 0) throw new RangeError('World model cần stateSize dương');
    if (config.mode === 'discrete' && (!config.actionCount || config.actionCount <= 0)) {
      throw new RangeError('World model rời rạc cần actionCount dương');
    }
    if (config.mode === 'continuous' && (!config.actionSize || config.actionSize <= 0)) {
      throw new RangeError('World model liên tục cần actionSize dương');
    }
    this.config = { ...config };
    this.actionVectorSize =
      config.mode === 'discrete' ? config.actionCount ?? 0 : config.actionSize ?? 0;
    this.random = new DeepRandom(config.seed ?? 1);

    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.001,
      weightDecay: 0.0001,
    };
    const inputSize = config.stateSize + this.actionVectorSize;
    this.dynamics = new NeuralNetwork({
      inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: config.stateSize,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: config.seed ?? 1,
    });
    this.reward = new NeuralNetwork({
      inputSize,
      hiddenSizes: config.hiddenSizes ?? [64, 64],
      outputSize: 1,
      hiddenActivation: 'relu',
      outputActivation: 'linear',
      optimizer,
      seed: (config.seed ?? 1) + 1,
    });
  }

  /** Kích thước trạng thái. */
  public get stateSize(): number {
    return this.config.stateSize;
  }

  /** Không gian hành động của mô hình. */
  public get mode(): 'discrete' | 'continuous' {
    return this.config.mode;
  }

  /** Dự đoán một bước từ state + action gốc. */
  public predict(state: NumericVector, action: WorldModelAction): WorldPrediction {
    return this.predictFromVector(state, this.encodeAction(action));
  }

  /** Dự đoán một bước từ vector hành động đã mã hóa. */
  public predictFromVector(state: NumericVector, actionVector: NumericVector): WorldPrediction {
    if (state.length !== this.config.stateSize) {
      throw new RangeError(`World model cần state ${this.config.stateSize} chiều`);
    }
    if (actionVector.length !== this.actionVectorSize) {
      throw new RangeError(`World model cần action ${this.actionVectorSize} chiều`);
    }
    const input = [...state, ...actionVector];
    const delta = this.dynamics.predict(input);
    const reward = this.reward.predict(input)[0] ?? 0;
    return {
      nextState: state.map((value, index) => value + (delta[index] ?? 0)),
      reward,
      delta,
    };
  }

  /** Mã hóa hành động gốc thành vector đầu vào. */
  public encodeAction(action: WorldModelAction): number[] {
    if (this.config.mode === 'discrete') {
      if (typeof action !== 'number') {
        throw new TypeError('World model rời rạc cần action id');
      }
      return oneHot(
        clampRange(Math.floor(action), 0, Math.max(0, this.actionVectorSize - 1)),
        this.actionVectorSize,
      );
    }
    if (typeof action === 'number') {
      throw new TypeError('World model liên tục cần action vector');
    }
    if (action.length !== this.actionVectorSize) {
      throw new RangeError(`Action cần ${this.actionVectorSize} chiều`);
    }
    return [...action];
  }

  /** Huấn luyện động học + phần thưởng từ transition thật. */
  public fit(samples: readonly WorldModelSample[], options: LearningOptions = {}): LearningReport {
    const startedAt = Date.now();
    const epochs = Math.max(1, Math.floor(options.epochs ?? 20));
    const batchSize = Math.max(1, Math.floor(options.batchSize ?? 32));
    const order = Array.from({ length: samples.length }, (_, index) => index);
    const lossHistory: number[] = [];
    let initialLoss = 0;
    let finalLoss = 0;
    let bestLoss = Infinity;
    let steps = 0;

    if (samples.length === 0) {
      return {
        epochs: 0,
        steps: 0,
        samples: 0,
        initialLoss: 0,
        finalLoss: 0,
        bestLoss: 0,
        lossHistory: [],
        metrics: {},
        elapsedMs: 0,
        stoppedEarly: false,
      };
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (options.shuffle !== false) this.random.shuffle(order);
      let epochLoss = 0;
      for (let start = 0; start < order.length; start += batchSize) {
        const batch = order.slice(start, start + batchSize);
        const dynamicsGradient = createNetworkGradient(this.dynamics);
        const rewardGradient = createNetworkGradient(this.reward);
        let batchLoss = 0;

        for (const index of batch) {
          const sample = samples[index];
          const targetDelta = sample.nextState.map(
            (value, stateIndex) => value - (sample.state[stateIndex] ?? 0),
          );
          const input = [...sample.state, ...this.encodeAction(sample.action)];
          const predictedDelta = this.dynamics.forward(input, true);
          const deltaLoss = meanSquaredErrorGradient(predictedDelta, targetDelta);
          batchLoss += deltaLoss.loss;
          backpropagateNetwork(this.dynamics, deltaLoss.gradOutput, {
            gradient: dynamicsGradient,
            apply: false,
          });

          const predictedReward = this.reward.forward(input, true);
          const rewardLoss = meanSquaredErrorGradient(predictedReward, [sample.reward]);
          batchLoss += rewardLoss.loss;
          backpropagateNetwork(this.reward, rewardLoss.gradOutput, {
            gradient: rewardGradient,
            apply: false,
          });
        }

        applyNetworkGradient(this.dynamics, dynamicsGradient, {
          optimizer: this.dynamics.optimizer,
          batchSize: batch.length,
        });
        applyNetworkGradient(this.reward, rewardGradient, {
          optimizer: this.reward.optimizer,
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
      metrics: {
        actionVectorSize: this.actionVectorSize,
        parameters:
          this.dynamics.layers.reduce(
            (sum, layer) => sum + layer.inputSize * layer.outputSize + layer.outputSize,
            0,
          ) +
          this.reward.layers.reduce(
            (sum, layer) => sum + layer.inputSize * layer.outputSize + layer.outputSize,
            0,
          ),
      },
      elapsedMs: Date.now() - startedAt,
      stoppedEarly: false,
    };
  }

  /** Mô phỏng chuỗi hành động và trả chuỗi dự đoán. */
  public rollout(
    state: NumericVector,
    actions: readonly WorldModelAction[],
  ): WorldPrediction[] {
    const predictions: WorldPrediction[] = [];
    let current = [...state];
    for (const action of actions) {
      const prediction = this.predict(current, action);
      predictions.push(prediction);
      current = prediction.nextState;
    }
    return predictions;
  }

  public snapshot(): WorldModelSnapshot {
    return {
      config: { ...this.config },
      dynamics: this.dynamics.snapshot(),
      reward: this.reward.snapshot(),
    };
  }

  public static fromSnapshot(snapshot: WorldModelSnapshot): WorldModelTrainer {
    const trainer = new WorldModelTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.dynamics, trainer.dynamics);
    restoreWeightsFromSnapshot(snapshot.reward, trainer.reward);
    return trainer;
  }

}

/** Cấu hình planner. */
export interface PlannerConfig {
  /** Số bước dự báo. */
  horizon?: number;
  /** Số chuỗi hành động mỗi vòng. */
  candidates?: number;
  /** Hệ số chiết khấu. */
  gamma?: number;
  /** Biên dưới hành động liên tục. */
  actionLow?: readonly number[];
  /** Biên trên hành động liên tục. */
  actionHigh?: readonly number[];
  /** Số vòng CEM. */
  iterations?: number;
  /** Tỉ lệ elite giữ lại. */
  eliteRatio?: number;
  seed?: number;
}

/** Kết quả lập kế hoạch. */
export interface PlanResult {
  actions: number[][];
  predictedReturn: number;
  predictedRewards: number[];
  states: number[][];
}

/**
 * Random shooting: lấy mẫu nhiều chuỗi hành động, mô phỏng bằng world model và
 * chọn chuỗi có tổng thưởng chiết khấu cao nhất.
 */
export class RandomShootingPlanner {
  public readonly model: WorldModelTrainer;
  public readonly horizon: number;
  public readonly candidates: number;
  public readonly gamma: number;
  public readonly actionLow: number[];
  public readonly actionHigh: number[];

  protected readonly random: DeepRandom;

  constructor(model: WorldModelTrainer, config: PlannerConfig = {}) {
    this.model = model;
    this.horizon = Math.max(1, Math.floor(config.horizon ?? 8));
    this.candidates = Math.max(1, Math.floor(config.candidates ?? 128));
    this.gamma = clampRange(config.gamma ?? 0.95, 0, 0.9999);
    this.actionLow = normalizeBounds(config.actionLow, model.actionVectorSize, -1);
    this.actionHigh = normalizeBounds(config.actionHigh, model.actionVectorSize, 1);
    this.random = new DeepRandom(config.seed ?? 1);
  }

  /** Lập kế hoạch từ trạng thái hiện tại. */
  public plan(state: NumericVector): PlanResult {
    let best: PlanResult = emptyPlan(state);
    for (let candidate = 0; candidate < this.candidates; candidate++) {
      const actions = Array.from({ length: this.horizon }, () => this.sampleAction());
      const result = this.evaluate(state, actions);
      if (result.predictedReturn > best.predictedReturn) best = result;
    }
    return best;
  }

  /** Đánh giá một chuỗi hành động. */
  public evaluate(state: NumericVector, actions: readonly (readonly number[])[]): PlanResult {
    const states: number[][] = [[...state]];
    const rewards: number[] = [];
    let predictedReturn = 0;
    let current = [...state];
    let discount = 1;
    for (const action of actions) {
      const prediction = this.model.predictFromVector(current, action);
      current = prediction.nextState;
      states.push([...current]);
      rewards.push(prediction.reward);
      predictedReturn += discount * prediction.reward;
      discount *= this.gamma;
    }
    return {
      actions: actions.map((action) => [...action]),
      predictedReturn,
      predictedRewards: rewards,
      states,
    };
  }

  /** Lấy mẫu một vector hành động ngẫu nhiên trong biên. */
  protected sampleAction(): number[] {
    if (this.model.mode === 'discrete') {
      return oneHot(
        this.random.int(0, Math.max(0, this.model.actionVectorSize - 1)),
        this.model.actionVectorSize,
      );
    }
    return this.actionLow.map((low, index) =>
      this.random.range(low, this.actionHigh[index]),
    );
  }
}

/**
 * Cross-Entropy Method planner: lặp lại lấy mẫu theo Gaussian, giữ elite và
 * cập nhật mean/std để tập trung vào vùng hành động tốt.
 */
export class CEMPlanner extends RandomShootingPlanner {
  public readonly iterations: number;
  public readonly eliteRatio: number;

  constructor(model: WorldModelTrainer, config: PlannerConfig = {}) {
    super(model, config);
    this.iterations = Math.max(1, Math.floor(config.iterations ?? 5));
    this.eliteRatio = clampRange(config.eliteRatio ?? 0.2, 0.01, 1);
  }

  public override plan(state: NumericVector): PlanResult {
    // CEM liên tục không áp dụng trực tiếp cho one-hot; dùng random shooting.
    if (this.model.mode === 'discrete') return super.plan(state);
    const dimensions = this.horizon * this.model.actionVectorSize;
    let mean = new Array<number>(dimensions).fill(0);
    let std = new Array<number>(dimensions).fill(1);
    let best: PlanResult = emptyPlan(state);

    for (let iteration = 0; iteration < this.iterations; iteration++) {
      const candidates: { actions: number[][]; result: PlanResult }[] = [];
      for (let candidate = 0; candidate < this.candidates; candidate++) {
        const flat = mean.map((value, index) =>
          clampRange(value + this.random.gaussian(0, std[index]), -1, 1),
        );
        const actions = this.reshapeActions(flat);
        const result = this.evaluate(state, actions);
        candidates.push({ actions, result });
        if (result.predictedReturn > best.predictedReturn) best = result;
      }

      candidates.sort((a, b) => b.result.predictedReturn - a.result.predictedReturn);
      const eliteCount = Math.max(1, Math.floor(candidates.length * this.eliteRatio));
      const elite = candidates.slice(0, eliteCount);
      const flattened = elite.map((entry) => entry.actions.flat());
      mean = new Array<number>(dimensions).fill(0).map((_, index) =>
        flattened.reduce((sum, flat) => sum + (flat[index] ?? 0), 0) / flattened.length,
      );
      std = new Array<number>(dimensions).fill(0).map((_, index) => {
        const variance =
          flattened.reduce((sum, flat) => sum + ((flat[index] ?? 0) - mean[index]) ** 2, 0) /
          flattened.length;
        return Math.max(0.02, Math.sqrt(variance) + 0.01);
      });
    }
    return best;
  }

  /** Chuyển vector phẳng thành chuỗi hành động. */
  private reshapeActions(flat: readonly number[]): number[][] {
    const actionSize = this.model.actionVectorSize;
    return Array.from({ length: this.horizon }, (_, step) =>
      flat.slice(step * actionSize, (step + 1) * actionSize).map((value, index) =>
        clampRange(value, this.actionLow[index], this.actionHigh[index]),
      ),
    );
  }
}

/** Cấu hình Dyna. */
export interface DynaConfig {
  /** Số transition tưởng tượng thêm vào replay mỗi bước. */
  imaginationSteps?: number;
  /** Xác suất dùng mô hình thay vì dữ liệu thật. */
  imaginationProbability?: number;
  seed?: number;
}

/**
 * Dyna-Q: kết hợp DQN thật với transition do world model sinh ra.
 *
 * Mỗi bước, sau khi cập nhật DQN từ replay thật, trainer lấy một trạng thái
 * thật, chọn hành động ngẫu nhiên, dự đoán `(s', r)` bằng mô hình rồi đẩy vào
 * replay. Đây là replay tưởng tượng có kiểm soát, không thay thế dữ liệu thật.
 */
export class DynaDQNTrainer {
  public readonly dqn: DuelingDQNTrainer;
  public readonly worldModel: WorldModelTrainer;
  public readonly imaginationSteps: number;
  public readonly imaginationProbability: number;

  private readonly random: DeepRandom;

  constructor(
    dqn: DuelingDQNTrainer,
    worldModel: WorldModelTrainer,
    config: DynaConfig = {},
  ) {
    this.dqn = dqn;
    this.worldModel = worldModel;
    this.imaginationSteps = Math.max(0, Math.floor(config.imaginationSteps ?? 4));
    this.imaginationProbability = clampRange(config.imaginationProbability ?? 0.5, 0, 1);
    this.random = new DeepRandom(config.seed ?? 1);
  }

  /** Ghi transition thật vào DQN. */
  public observe(transition: {
    state: number[];
    action: number;
    reward: number;
    nextState: number[];
    done: boolean;
  }): void {
    this.dqn.observe(transition);
  }

  /** Huấn luyện một bước DQN + sinh replay tưởng tượng. */
  public trainStep(): ReturnType<DuelingDQNTrainer['trainStep']> {
    const result = this.dqn.trainStep();
    for (let i = 0; i < this.imaginationSteps; i++) {
      if (!this.random.chance(this.imaginationProbability)) continue;
      this.imagineOne();
    }
    return result;
  }

  /** Sinh một transition tưởng tượng từ mẫu thật gần nhất. */
  public imagineOne(): void {
    const real = this.dqn.replay.latest(1)[0];
    if (!real) return;
    const action = this.random.int(0, this.dqn.actions.length - 1);
    const prediction = this.worldModel.predict(real.state, action);
    this.dqn.replay.push({
      state: [...real.state],
      action,
      reward: prediction.reward,
      nextState: prediction.nextState,
      done: false,
      priority: Math.abs(prediction.reward),
    });
  }
}

/** Planner rỗng khi chưa tìm được chuỗi tốt hơn. */
function emptyPlan(state: NumericVector): PlanResult {
  return {
    actions: [],
    predictedReturn: -Infinity,
    predictedRewards: [],
    states: [[...state]],
  };
}

/** Chuẩn hóa biên hành động. */
function normalizeBounds(
  values: readonly number[] | undefined,
  size: number,
  fallback: number,
): number[] {
  const result = new Array<number>(size).fill(fallback);
  if (!values) return result;
  for (let i = 0; i < size; i++) {
    result[i] = typeof values[i] === 'number' ? values[i] : fallback;
  }
  return result;
}

