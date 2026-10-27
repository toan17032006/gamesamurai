/**
 * @file muzero.ts
 * @module @aetheria/engine/learning/muzero
 * @description MuZero (Schrittwieser et al. 2020) phiên bản gọn cho agent game,
 * cài đủ ba ý tưởng cốt lõi trên lõi MLP hiện có:
 *
 * - **Model trong không gian ẩn**: `representation` nén quan sát thành trạng thái
 *   ẩn; `dynamics` dự đoán `(trạng thái ẩn kế, phần thưởng)` từ
 *   `(trạng thái ẩn, hành động)`; `prediction` dự đoán `(policy, value)` từ
 *   trạng thái ẩn. Không cần mô hình môi trường có sẵn.
 * - **Lập kế hoạch bằng MCTS trên model học được**: mỗi bước hành động, chạy
 *   PUCT-MCTS rollout trong không gian ẩn bằng `dynamics`; phân phối lượt thăm
 *   trở thành policy mục tiêu (policy improvement).
 * - **Huấn luyện bằng unroll K bước**: policy CE với phân phối thăm MCTS, value
 *   MSE với n-step return bootstrap, reward MSE với phần thưởng thật; gradient
 *   chạy ngược qua chuỗi unroll về cả `dynamics` lẫn `representation`.
 *
 * Khác AlphaZero (cần luật chuyển trạng thái của game), MuZero tự học model —
 * phù hợp môi trường game chỉ quan sát được. Chú thích tiếng Việt theo quy ước.
 */

import { NeuralNetwork, type OptimizerConfig } from '../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../deeplearning/random.js';
import {
  applyNetworkGradient,
  backpropagateNetwork,
  clipNetworkGradient,
  createNetworkGradient,
  softmaxCrossEntropyGradient,
  softmaxVector,
} from './network.js';
import { restoreWeightsFromSnapshot } from './internal.js';

/** Cấu hình MuZero. */
export interface MuZeroConfig {
  /** Số chiều quan sát. */
  observationSize: number;
  /** Số hành động rời rạc. */
  actionCount: number;
  /** Số chiều trạng thái ẩn; mặc định 32. */
  hiddenSize?: number;
  /** Số bước unroll khi huấn luyện (K); mặc định 3. */
  unrollSteps?: number;
  /** Hệ số gamma cho n-step return. */
  gamma?: number;
  /** Số mô phỏng MCTS mỗi bước hành động. */
  mctsSimulations?: number;
  /** Hệ số PUCT: c = puctInit + log((N + puctBase + 1)/puctBase). */
  puctInit?: number;
  puctBase?: number;
  /** Nhiệt độ lấy mẫu hành động từ phân phối thăm; 0 = argmax. */
  temperature?: number;
  learningRate?: number;
  policyCoef?: number;
  valueCoef?: number;
  rewardCoef?: number;
  /** Cắt norm gradient; 0 = tắt. */
  gradientClip?: number;
  seed?: number;
}

/** Quyết định hành động kèm phân phối thăm MCTS để làm policy mục tiêu. */
export interface MuZeroDecision {
  action: number;
  /** Phân phối lượt thăm chuẩn hóa (policy mục tiêu sau MCTS). */
  searchPolicy: number[];
  /** Value ước lượng tại gốc. */
  rootValue: number;
}

/** Kết quả một bước huấn luyện MuZero. */
export interface MuZeroTrainResult {
  policyLoss: number;
  valueLoss: number;
  rewardLoss: number;
  unrollSteps: number;
}

/** Một bước trong trajectory self-play. */
interface MuZeroStep {
  observation: number[];
  action: number;
  reward: number;
  done: boolean;
  searchPolicy: number[];
}

/** Ảnh chụp MuZero để lưu checkpoint. */
export interface MuZeroSnapshot {
  config: MuZeroConfig;
  representation: ReturnType<NeuralNetwork['snapshot']>;
  dynamics: ReturnType<NeuralNetwork['snapshot']>;
  prediction: ReturnType<NeuralNetwork['snapshot']>;
}

// ---------------------------------------------------------------------------
// MCTS trong không gian ẩn
// ---------------------------------------------------------------------------

/** Node của cây MCTS latent. */
interface LatentNode {
  hidden: number[];
  /** Prior từ prediction của trạng thái này. */
  prior: number[];
  /** Value dự đoán V(s) của chính trạng thái này. */
  value: number;
  visitCount: number;
  /** Tổng value chiết khấu đi qua cạnh (s, a) — dùng tính Q trung bình. */
  valueSum: number;
  /** Phần thưởng dự đoán khi đi từ cha sang node này. */
  reward: number;
  children: (LatentNode | null)[];
}

/**
 * MuZero-Lite: runtime học model + lập kế hoạch MCTS latent.
 *
 * Vòng lặp game khuyến nghị:
 * 1. `beginStep(observation)` → chọn hành động bằng MCTS trên model.
 * 2. Môi trường thực thi → `endStep(reward, done)`.
 * 3. Định kỳ gọi `trainStep()` để học representation/dynamics/prediction.
 */
export class MuZeroTrainer {
  public readonly actionCount: number;
  public readonly hiddenSize: number;
  public readonly gamma: number;
  public readonly mctsSimulations: number;
  public readonly representation: NeuralNetwork;
  public readonly dynamics: NeuralNetwork;
  public readonly prediction: NeuralNetwork;

  private readonly config: MuZeroConfig;
  private readonly random: DeepRandom;
  private readonly observationSize: number;
  private readonly unrollSteps: number;
  private readonly puctInit: number;
  private readonly puctBase: number;
  private readonly temperature: number;
  private readonly policyCoef: number;
  private readonly valueCoef: number;
  private readonly rewardCoef: number;
  private readonly gradientClip: number;
  /** Trajectory đang ghi (từ bước chưa done gần nhất). */
  private currentTrajectory: MuZeroStep[] = [];
  /** Kho trajectory hoàn chỉnh phục vụ huấn luyện. */
  private readonly completedTrajectories: MuZeroStep[][] = [];
  private readonly capacity: number;
  private pending: MuZeroStep | null = null;

  constructor(config: MuZeroConfig) {
    if (config.observationSize <= 0) throw new RangeError('MuZero cần observationSize dương');
    if (config.actionCount <= 0) throw new RangeError('MuZero cần actionCount dương');
    this.config = { ...config };
    this.observationSize = config.observationSize;
    this.actionCount = config.actionCount;
    this.hiddenSize = Math.max(4, Math.floor(config.hiddenSize ?? 32));
    this.gamma = clampRange(config.gamma ?? 0.99, 0, 0.9999);
    this.mctsSimulations = Math.max(1, Math.floor(config.mctsSimulations ?? 32));
    this.unrollSteps = Math.max(1, Math.floor(config.unrollSteps ?? 3));
    this.puctInit = Math.max(0.1, config.puctInit ?? 1.25);
    this.puctBase = Math.max(1, config.puctBase ?? 19652);
    this.temperature = clampRange(config.temperature ?? 1, 0, 1);
    this.policyCoef = Math.max(0, config.policyCoef ?? 1);
    this.valueCoef = Math.max(0, config.valueCoef ?? 1);
    this.rewardCoef = Math.max(0, config.rewardCoef ?? 1);
    this.gradientClip = Math.max(0, config.gradientClip ?? 1);
    this.capacity = 200;
    this.random = new DeepRandom(config.seed ?? 1);

    const optimizer: Partial<OptimizerConfig> = {
      kind: 'adam',
      learningRate: config.learningRate ?? 0.003,
      weightDecay: 0.0001,
    };
    const seed = config.seed ?? 1;
    this.representation = new NeuralNetwork({
      inputSize: this.observationSize,
      hiddenSizes: [this.hiddenSize],
      outputSize: this.hiddenSize,
      hiddenActivation: 'tanh',
      outputActivation: 'tanh',
      optimizer,
      seed,
    });
    // dynamics: [latent, onehot(action)] → [latent kế, reward dự đoán].
    this.dynamics = new NeuralNetwork({
      inputSize: this.hiddenSize + this.actionCount,
      hiddenSizes: [this.hiddenSize * 2],
      outputSize: this.hiddenSize + 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 1,
    });
    // prediction: latent → [logits policy, value].
    this.prediction = new NeuralNetwork({
      inputSize: this.hiddenSize,
      hiddenSizes: [this.hiddenSize],
      outputSize: this.actionCount + 1,
      hiddenActivation: 'tanh',
      outputActivation: 'linear',
      optimizer,
      seed: seed + 2,
    });
  }

  /** Số trajectory hoàn chỉnh trong replay. */
  public get trajectoryCount(): number {
    return this.completedTrajectories.length;
  }

  /**
   * Bắt đầu một bước: mã hóa quan sát, chạy MCTS latent và chọn hành động.
   * Phân phối lượt thăm được lưu lại làm policy mục tiêu khi huấn luyện.
   */
  public beginStep(observation: readonly number[]): MuZeroDecision {
    if (observation.length !== this.observationSize) {
      throw new RangeError(`Quan sát cần ${this.observationSize} chiều`);
    }
    const rootHidden = this.representation.predict(observation);
    const root = this.createNode(rootHidden);
    const searchPolicy = this.plan(root);
    const action = this.sampleFromPolicy(searchPolicy);
    this.pending = {
      observation: [...observation],
      action,
      reward: 0,
      done: false,
      searchPolicy,
    };
    return { action, searchPolicy, rootValue: root.value };
  }

  /** Kết thúc bước: ghi phần thưởng và cờ kết thúc vào trajectory. */
  public endStep(reward: number, done: boolean): void {
    const step = this.pending;
    if (!step) throw new Error('endStep cần được gọi sau beginStep');
    step.reward = reward;
    step.done = done;
    this.currentTrajectory.push(step);
    this.pending = null;
    if (done && this.currentTrajectory.length > 0) {
      this.completedTrajectories.push(this.currentTrajectory);
      if (this.completedTrajectories.length > this.capacity) {
        this.completedTrajectories.shift();
      }
      this.currentTrajectory = [];
    }
  }

  /**
   * Một bước huấn luyện: lấy ngẫu nhiên một trajectory và một cửa sổ unroll,
   * tối ưu prediction/dynamics/representation bằng policy/value/reward loss.
   *
   * Gradient chạy ngược theo thứ tự cửa sổ: tại mỗi bước, gradient của
   * prediction (theo latent hiện tại) và của dynamics (theo latent trước đó)
   * được cộng dồn rồi lan về `representation` tại latent gốc.
   *
   * Trả `null` nếu chưa có trajectory đủ dài.
   */
  public trainStep(): MuZeroTrainResult | null {
    const usable = this.completedTrajectories.filter((trajectory) => trajectory.length >= 2);
    if (usable.length === 0) return null;
    const trajectory = usable[this.random.int(0, usable.length - 1)];
    const start = this.random.int(0, trajectory.length - 1);
    const horizon = Math.min(this.unrollSteps, trajectory.length - start);

    // 1) Forward-only: tính chuỗi latent của cửa sổ.
    const latents: number[][] = [this.representation.predict(trajectory[start].observation)];
    for (let offset = 1; offset <= horizon; offset++) {
      const previous = latents[offset - 1];
      const step = trajectory[start + offset - 1];
      latents.push(this.dynamicsForward(previous, step.action).slice(0, this.hiddenSize));
    }
    // 2) Mục tiêu value: n-step return bootstrap bằng prediction cuối cửa sổ.
    const bootstrapValue = this.prediction.predict(latents[horizon])[this.actionCount] ?? 0;
    const valueTargets = new Array<number>(horizon).fill(0);
    for (let offset = horizon - 1; offset >= 0; offset--) {
      const step = trajectory[start + offset];
      if (step.done) {
        valueTargets[offset] = step.reward;
        continue;
      }
      const nextValue = offset === horizon - 1 ? bootstrapValue : valueTargets[offset + 1];
      valueTargets[offset] = step.reward + this.gamma * nextValue;
    }

    // 3) Backward theo thứ tự ngược: dồn gradient qua chuỗi latent.
    const representationGradient = createNetworkGradient(this.representation);
    const dynamicsGradient = createNetworkGradient(this.dynamics);
    const predictionGradient = createNetworkGradient(this.prediction);
    let gradLatent = new Array<number>(this.hiddenSize).fill(0);
    // Gradient dồn về latent[offset − 1] từ backprop dynamics của bước hiện tại.
    let pendingPreviousGrad: number[] | null = null;
    let policyLossTotal = 0;
    let valueLossTotal = 0;
    let rewardLossTotal = 0;
    let rewardTerms = 0;

    for (let offset = horizon - 1; offset >= 0; offset--) {
      // Gradient từ bước sau (dynamics tại offset+1) đổ về latent[offset].
      if (pendingPreviousGrad) {
        for (let i = 0; i < this.hiddenSize; i++) {
          gradLatent[i] += pendingPreviousGrad[i] ?? 0;
        }
        pendingPreviousGrad = null;
      }
      const step = trajectory[start + offset];

      // Prediction: policy CE + value MSE tại latent[offset].
      const predictionOut = this.prediction.forward(latents[offset], true);
      const logits = predictionOut.slice(0, this.actionCount);
      const predictedValue = predictionOut[this.actionCount] ?? 0;
      const policyTarget = step.searchPolicy.length === this.actionCount
        ? step.searchPolicy
        : softmaxVector(logits);
      const policyResult = softmaxCrossEntropyGradient(logits, policyTarget, this.policyCoef);
      const valueError = predictedValue - valueTargets[offset];
      policyLossTotal += policyResult.loss;
      valueLossTotal += valueError * valueError * this.valueCoef;
      const gradPrediction = [...policyResult.gradLogits, 2 * this.valueCoef * valueError];
      const gradFromPrediction = backpropagateNetwork(this.prediction, gradPrediction, {
        gradient: predictionGradient,
        skipOutputActivation: true,
        apply: false,
      }).gradInput;
      for (let i = 0; i < this.hiddenSize; i++) {
        gradLatent[i] += gradFromPrediction[i] ?? 0;
      }

      if (offset === 0) {
        // Latent gốc đến từ representation: lan gradient dồn về đó rồi dừng.
        backpropagateNetwork(this.representation, gradLatent, {
          gradient: representationGradient,
          apply: false,
        });
      } else {
        // Dynamics: reward MSE; gradInput phần latent đổ về latent[offset − 1].
        const previous = latents[offset - 1];
        const dynamicsInput = [...previous, ...this.oneHot(step.action)];
        const dynamicsOut = this.dynamics.forward(dynamicsInput, true);
        const rewardError = (dynamicsOut[this.hiddenSize] ?? 0) - step.reward;
        rewardLossTotal += rewardError * rewardError * this.rewardCoef;
        rewardTerms++;
        const gradDynamicsOutput = new Array<number>(this.hiddenSize + 1).fill(0);
        gradDynamicsOutput[this.hiddenSize] = 2 * this.rewardCoef * rewardError;
        const gradFromDynamics = backpropagateNetwork(this.dynamics, gradDynamicsOutput, {
          gradient: dynamicsGradient,
          apply: false,
        }).gradInput;
        pendingPreviousGrad = gradFromDynamics.slice(0, this.hiddenSize);
      }
    }

    if (this.gradientClip > 0) {
      clipNetworkGradient(representationGradient, this.gradientClip);
      clipNetworkGradient(dynamicsGradient, this.gradientClip);
      clipNetworkGradient(predictionGradient, this.gradientClip);
    }
    applyNetworkGradient(this.representation, representationGradient, {
      optimizer: this.representation.optimizer,
      batchSize: horizon,
    });
    applyNetworkGradient(this.dynamics, dynamicsGradient, {
      optimizer: this.dynamics.optimizer,
      batchSize: horizon,
    });
    applyNetworkGradient(this.prediction, predictionGradient, {
      optimizer: this.prediction.optimizer,
      batchSize: horizon,
    });

    return {
      policyLoss: policyLossTotal / horizon,
      valueLoss: valueLossTotal / horizon,
      rewardLoss: rewardLossTotal / Math.max(1, rewardTerms),
      unrollSteps: horizon,
    };
  }

  /** Chạy nhiều bước huấn luyện; trả số bước thực hiện được. */
  public train(steps: number): MuZeroTrainResult[] {
    const results: MuZeroTrainResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(steps)); i++) {
      const result = this.trainStep();
      if (!result) break;
      results.push(result);
    }
    return results;
  }

  /** Dự đoán value của một quan sát (không MCTS). */
  public evaluateValue(observation: readonly number[]): number {
    const hidden = this.representation.predict(observation);
    return this.prediction.predict(hidden)[this.actionCount] ?? 0;
  }

  /** Dự đoán policy trực tiếp (không MCTS) — chế độ nhanh cho NPC phụ. */
  public quickPolicy(observation: readonly number[]): number[] {
    const hidden = this.representation.predict(observation);
    return softmaxVector(this.prediction.predict(hidden).slice(0, this.actionCount));
  }

  /** Ảnh chụp để lưu checkpoint. */
  public snapshot(): MuZeroSnapshot {
    return {
      config: { ...this.config },
      representation: this.representation.snapshot(),
      dynamics: this.dynamics.snapshot(),
      prediction: this.prediction.snapshot(),
    };
  }

  /** Khôi phục MuZero từ checkpoint. */
  public static fromSnapshot(snapshot: MuZeroSnapshot): MuZeroTrainer {
    const trainer = new MuZeroTrainer(snapshot.config);
    restoreWeightsFromSnapshot(snapshot.representation, trainer.representation);
    restoreWeightsFromSnapshot(snapshot.dynamics, trainer.dynamics);
    restoreWeightsFromSnapshot(snapshot.prediction, trainer.prediction);
    return trainer;
  }

  // --- Nội bộ --------------------------------------------------------------

  private oneHot(action: number): number[] {
    const vector = new Array<number>(this.actionCount).fill(0);
    if (action >= 0 && action < this.actionCount) vector[action] = 1;
    return vector;
  }

  /** Forward dynamics: đầu ra gộp [latent kế, reward dự đoán]. */
  private dynamicsForward(
    latent: readonly number[],
    action: number,
  ): number[] {
    return this.dynamics.predict([...latent, ...this.oneHot(action)]);
  }

  /** Tạo node với prior/value từ prediction. */
  private createNode(hidden: number[]): LatentNode {
    const output = this.prediction.predict(hidden);
    return {
      hidden,
      prior: softmaxVector(output.slice(0, this.actionCount)),
      value: output[this.actionCount] ?? 0,
      visitCount: 0,
      valueSum: 0,
      reward: 0,
      children: new Array<LatentNode | null>(this.actionCount).fill(null),
    };
  }

  /** Mở rộng node con bằng dynamics (rollout trong không gian ẩn). */
  private expandChild(parent: LatentNode, action: number): LatentNode {
    const output = this.dynamics.predict([...parent.hidden, ...this.oneHot(action)]);
    const child = this.createNode(output.slice(0, this.hiddenSize));
    child.reward = output[this.hiddenSize] ?? 0;
    parent.children[action] = child;
    return child;
  }

  /** PUCT chọn hành động tại node đã mở rộng. */
  private selectChild(node: LatentNode): number {
    let bestAction = 0;
    let bestScore = -Infinity;
    const sqrtParent = Math.sqrt(Math.max(1, node.visitCount));
    const coefficient =
      this.puctInit + Math.log((node.visitCount + this.puctBase + 1) / this.puctBase);
    for (let action = 0; action < this.actionCount; action++) {
      const child = node.children[action];
      const prior = node.prior[action] ?? 0;
      const visits = child?.visitCount ?? 0;
      const meanValue = visits > 0 ? (child?.valueSum ?? 0) / visits : 0;
      const score = meanValue + (coefficient * prior * sqrtParent) / (visits + 1);
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    return bestAction;
  }

  /**
   * Chạy MCTS từ node gốc và trả phân phối lượt thăm (policy cải thiện).
   *
   * Mỗi mô phỏng: đi xuống theo PUCT, mở rộng node lá bằng `dynamics`, đánh giá
   * bằng `prediction`, backup value + reward chiết khấu dọc đường đi.
   */
  private plan(root: LatentNode): number[] {
    for (let simulation = 0; simulation < this.mctsSimulations; simulation++) {
      const path: Array<{ node: LatentNode; action: number }> = [];
      let node = root;
      // Selection: đi xuống tới node lá chưa được mở rộng.
      while (true) {
        const action = this.selectChild(node);
        path.push({ node, action });
        const child = node.children[action];
        if (!child) {
          this.expandChild(node, action);
          break;
        }
        node = child;
      }
      // Evaluation: value của node lá vừa tạo (prediction khi tạo node).
      const leaf = path[path.length - 1];
      const leafNode = leaf.node.children[leaf.action];
      if (!leafNode) continue;
      // Backup: giá trị tích lũy = V(lá) + reward các cạnh ngược lên gốc.
      let discount = 1;
      let backupValue = leafNode.value;
      for (let i = path.length - 1; i >= 0; i--) {
        const entry = path[i];
        const target = entry.node.children[entry.action];
        if (!target) continue;
        entry.node.visitCount += 1;
        target.visitCount += 1;
        target.valueSum += discount * backupValue;
        backupValue = target.reward + this.gamma * backupValue;
        discount *= this.gamma;
      }
    }
    // Phân phối lượt thăm của gốc (có áp temperature).
    const visits = root.children.map((child) => child?.visitCount ?? 0);
    const total = visits.reduce((sum, value) => sum + value, 0) || 1;
    if (this.temperature <= 1e-6) {
      let best = 0;
      for (let a = 1; a < visits.length; a++) {
        if (visits[a] > visits[best]) best = a;
      }
      const policy = new Array<number>(this.actionCount).fill(0);
      policy[best] = 1;
      return policy;
    }
    const powered = visits.map((count) => Math.pow(count / total, 1 / this.temperature));
    const poweredTotal = powered.reduce((sum, value) => sum + value, 0) || 1;
    return powered.map((value) => value / poweredTotal);
  }

  /** Lấy mẫu hành động theo phân phối (argmax khi temperature 0). */
  private sampleFromPolicy(policy: readonly number[]): number {
    if (this.temperature <= 1e-6) {
      let best = 0;
      for (let a = 1; a < policy.length; a++) {
        if ((policy[a] ?? 0) > (policy[best] ?? 0)) best = a;
      }
      return best;
    }
    const roll = this.random.next();
    let cumulative = 0;
    for (let a = 0; a < policy.length; a++) {
      cumulative += policy[a] ?? 0;
      if (roll <= cumulative) return a;
    }
    let best = 0;
    for (let a = 1; a < policy.length; a++) {
      if ((policy[a] ?? 0) > (policy[best] ?? 0)) best = a;
    }
    return best;
  }
}

