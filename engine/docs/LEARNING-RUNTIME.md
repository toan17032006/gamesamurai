# LEARNING-RUNTIME.md — Hồ sơ kiến trúc runtime học tập

> Phạm vi: `engine/src/learning/` — module huấn luyện, suy luận và tiến hoá dành
> cho agent game. Tài liệu này mô tả ranh giới tầng, hợp đồng công khai, luồng
> điều phối và quy tắc mở rộng. Nó không thay thế `ENGINE.md` (danh mục API sinh
> tự động) mà bổ sung phần kiến trúc và ngữ nghĩa vận hành.

## 1. Mục tiêu và ranh giới

Learning runtime biến các primitive có sẵn của `@aetheria/engine/deeplearning`
thành một bề mặt huấn luyện hoàn chỉnh, có thể import trực tiếp từ game:

```ts
import {
  SupervisedTrainer,
  PPOTrainer,
  DuelingDQNTrainer,
  createDefaultLearningRuntime,
} from '@aetheria/engine/learning';

// Hoặc dùng namespace ở root package để tránh xung đột tên.
import { Learning } from '@aetheria/engine';
```

Nguyên tắc bất biến:

1. **Không phụ thuộc framework hiển thị.** Toàn bộ module chỉ dùng TypeScript
   thuần và các primitive của `deeplearning`; không import DOM, Three.js, React
   hay Next.js. Nhờ vậy cùng một trainer chạy được trong browser, worker, server
   Node.js và bài test.
2. **Không sửa lõi engine theo hướng phá vỡ tương thích.** Learning runtime chỉ
   bổ sung API công khai. Thay đổi duy nhất trên module cũ là phương thức additive
   `ExperienceReplay.refreshPriorities()` để ưu tiên replay cập nhật lại cây
   prefix-sum sau khi trainer ghi đè priority.
3. **Một cửa vào công khai.** Game không deep-import file nội bộ; mọi thứ đi qua
   `@aetheria/engine/learning` hoặc namespace `Learning`.
4. **Không `any`, không ép kiểu mù.** Các ranh giới nhận dữ liệu không tin cậy
   (config, model, checkpoint) dùng type guard và `unknown`; registry chỉ gọi
   adapter sau khi guard xác nhận.

## 2. Sơ đồ phân tầng

```
┌──────────────────────────────────────────────────────────────────┐
│ Next.js UI / Game Application / Application Adapters             │
│  - chỉ thấy SessionSummary, LearningReport, EvaluationResult     │
│  - gửi sample, config, checkpoint id; không thấy chi tiết nội bộ │
└───────────────────────────────┬──────────────────────────────────┘
                                │ @aetheria/engine/learning
┌───────────────────────────────▼──────────────────────────────────┐
│ Interface boundary: learning/index.ts                            │
├──────────────────────────────────────────────────────────────────┤
│ Orchestration (Application)                                      │
│  runtime.ts      registry, session, checkpoint, thinking, PRM    │
│  distributed.ts  parameter server, FedAvg, rehearsal, EWC        │
├──────────────────────────────────────────────────────────────────┤
│ Trainers (Application / Use Cases)                               │
│  supervised.ts       MLP, distillation, MAE, contrastive, LoRA,  │
│                      QLoRA, bottleneck adapter, prefix tuning,   │
│                      FedProx                                     │
│  reinforcement/      DQN, PPO/A2C, REINFORCE, TRPO, DDPG/TD3/SAC,│
│                      Rainbow (n-step + NoisyNet), imitation,     │
│                      model-based, MARL (QMIX/MAPPO/MADDPG)       │
│  alignment.ts        reward model, RLHF, DPO, MCTS, AlphaZero,   │
│                      STaR, PRM                                   │
│  preference.ts       IPO, KTO (mở rộng họ preference của DPO)    │
│  evolution.ts        GA, neuroevolution, ES, CMA-ES, novelty,    │
│                      MAP-Elites                                  │
│  neat.ts             NEAT: topology tăng dần, speciation,        │
│                      historical markings                         │
│  hyperneat.ts        HyperNEAT: CPPN sinh trọng số substrate     │
│  generative.ts       GAN, WGAN-GP, StyleGAN-lite, VAE, diffusion │
│  muzero.ts           MuZero-lite: model ẩn + MCTS latent         │
│  dreamer.ts          Dreamer-lite: RSSM rút gọn + actor-critic   │
│                      trong giấc mơ (lambda-return)               │
│  parallelism.ts      tensor parallel, pipeline (GPipe), ZeRO     │
├──────────────────────────────────────────────────────────────────┤
│ Domain contracts and mechanics                                   │
│  types.ts        sample, dataset, report, history, checkpoint    │
│  network.ts      gradient bridge, loss helpers, parameter utils  │
├──────────────────────────────────────────────────────────────────┤
│ Existing engine primitives (read-only)                           │
│  deeplearning/nn.ts        NeuralNetwork, DenseLayer, optimizer  │
│  deeplearning/random.ts    DeepRandom                           │
│  deeplearning/replay.ts    ExperienceReplay (+ refreshPriorities)│
└──────────────────────────────────────────────────────────────────┘
```

Ánh xạ Clean Architecture:

| Khái niệm | Vị trí trong learning runtime |
| --- | --- |
| Domain | `types.ts`: mẫu, dataset, báo cáo, lịch sử, checkpoint |
| Application | Các trainer thuật toán và `distributed.ts` |
| Interface Adapter | `runtime.ts` (registry, session, policy wrapper), `index.ts` |
| Infrastructure | `network.ts` (cầu nối gradient/parameter), `InMemoryCheckpointStore` |
| External core | `deeplearning/*` — chỉ đọc, không monkey-patch |

## 3. Danh mục API công khai

### 3.1 Hợp đồng dữ liệu — `types.ts`

- `NumericVector`, `MetricMap`, `SupervisedSample`, `ClassificationSample`,
  `RegressionSample`, `SoftTargetSample`.
- `EvaluationResult`, `LearningReport`, `LearningOptions`.
- `ArrayDataset<T>`, `SupervisedDataset`, `TrainingDataset<T>`, `DatasetSplit<T>`.
- `TrainingPoint`, `TrainingHistory`, `TrainingCheckpoint<T>`,
  `InMemoryCheckpointStore<T>`.
- Tiện ích: `normalize01`, `standardize`, `createCheckpointId`.

`LearningReport` là hợp đồng telemetry chung cho mọi thuật toán, gồm loss đầu/cuối,
lịch sử loss, metrics, thời gian chạy và cờ dừng sớm.

### 3.2 Cầu nối mạng và gradient — `network.ts`

- `createNetworkGradient`, `zeroNetworkGradient`, `accumulateNetworkGradient`.
- `backpropagateNetwork`, `applyNetworkGradient`, `clipNetworkGradient`.
- `trainNetworkFromOutputGradient`, `networkInputGradient`.
- `flattenNetworkParameters`, `applyNetworkParameters`, `networkParameterCount`,
  `parameterDistance`, `averageParameters`, `mutateParameters`.
- Loss và xác suất: `softmaxVector`, `logSoftmaxVector`, `argmaxIndex`, `oneHot`,
  `sigmoid`, `categoricalCrossEntropy`, `softmaxCrossEntropyGradient`,
  `meanSquaredErrorGradient`, `huberLossGradient`, `binaryCrossEntropyGradient`,
  `classificationAccuracy`.
- Đóng băng tham số: `trainableLayerMask`, `setLayerFrozen`, `isLayerFrozen`.

Đây là lớp duy nhất được phép đọc/ghi chi tiết `DenseLayer` để phục vụ huấn luyện.
Các trainer cấp cao không tự ý sửa trọng số ngoài các hàm này.

### 3.3 Học có giám sát — `supervised.ts`

- `SupervisedTrainer`: vòng lặp fit/evaluate/predict, hỗ trợ MSE, Huber,
  cross-entropy, binary cross-entropy, gradient clipping và early stopping.
- `DistillationTrainer`: student học phân phối mềm của teacher theo nhiệt độ.
- `MaskedAutoencodingTrainer`: che một phần input và tái tạo.
- `ContrastiveTrainer`: cặp dương/âm, nhiệt độ và embedding.
- `LowRankAdapter`: adapter LoRA trên ma trận trọng số có sẵn.
- `BottleneckAdapter`: adapter cổ chai kiểu Houlsby trên *biểu diễn output* của
  mạng đóng băng (`y = h + scale·up(relu(down(h)))`) — PEFT thích nghi tác vụ
  mới mà không đụng trọng số gốc.
- `PrefixTuner`: prefix tuning cho MLP — học vector prefix nối trước input của
  mạng đóng băng (base phải tạo với `inputSize = inputDim + prefixLength`).
- `QuantizedLowRankAdapter` (QLoRA): base lượng tử hóa k-bit (2/4/8) theo block
  absmax ngay trong bộ nhớ, chỉ adapter LoRA được huấn luyện — mô phỏng ràng
  buộc bộ nhớ khi fine-tune; `quantizationError` báo sai số lượng tử hóa.
- `SupervisedOptions.proximal`: thuật ngữ FedProx `0.5·μ·‖w − w*‖²` cộng vào
  loss/gradient của batch, dùng bởi federated client khi dữ liệu không IID.
- **Train AI hiểu hình ảnh — `vision.ts`:** `VisionImage` + pixel ops
  (grayscale/resize bilinear/nearest, crop/flip/brightness/noise/histogram),
  decoder TGA + BMP thuần TS (không cần DOM/canvas), `ImageFeatureExtractor`
  (mean-pooling lưới n×n + histogram gradient HOG-lite) và `ConvNetwork`
  (Conv2D → ReLU → MaxPool → Flatten → Dense, backprop thủ công trên
  Float32Array) — `VisionClassifierTrainer` train phân loại ảnh end-to-end
  (chế độ `features` hoặc `cnn`), trả `LearningReport` chuẩn của runtime.
- Tiện ích: `classificationSamples`, `supervisedDataset`,
  `createLearningOptimizer`.

### 3.4 Học tăng cường — `reinforcement/`

| File | API chính |
| --- | --- |
| `dqn.ts` | `DuelingDQNTrainer`, `StandardDQNTrainer`, `copyNetworkWeights`, `softCopyNetworkWeights` |
| `ppo.ts` | `PPOTrainer`, `A2CTrainer`, `sampleCategorical`, `categoricalEntropy` |
| `policy-gradient.ts` | `REINFORCETrainer` (vanilla PG + baseline), `TRPOTrainer` (Fisher–CG, ràng buộc KL, line search), `computeMonteCarloReturns` |
| `continuous.ts` | `ContinuousActorCritic`, `DDPGTrainer`, `TD3Trainer`, `SACTrainer`, `scaleRawAction`, `clampAction` |
| `marl.ts` | `QMIXTrainer` (mixing network đơn điệu), `MAPPOTrainer` (critic tập trung), `MADDPGTrainer` (CTDE liên tục) |
| `rainbow.ts` | `RainbowDQNTrainer` (Double + Dueling + prioritized + n-step + NoisyNet), `NStepTransitionBuffer`, `NoisyNetwork` |
| `imitation.ts` | `BehaviorCloningTrainer`, `DAggerTrainer`, `GAILTrainer` |
| `world-model.ts` | `WorldModelTrainer`, `RandomShootingPlanner`, `CEMPlanner`, `DynaDQNTrainer` |

- DQN dùng Double DQN + prioritized replay. Sau khi cập nhật TD priority, trainer
  gọi `replay.refreshPriorities()` trước lần sample kế tiếp.
- Rainbow DQN bổ sung n-step returns (bộ đệm chuyển đổi trực tuyến) và NoisyNet
  (tham số μ học trọng số, σ học độ lệch nhiễu factorized; lúc suy luận dùng μ) —
  thăm dò học được thay epsilon-greedy.
- PPO/A2C có GAE, clipped objective, entropy bonus và chuẩn hoá advantage.
- REINFORCE dùng return Monte-Carlo với baseline trung bình trượt hoặc mạng value.
- TRPO giải hướng tự nhiên bằng Conjugate Gradient trên tích Fisher–vector
  (estimator Gauss–Newton + damping), bước cập nhật thỏa xấp xỉ ràng buộc KL và
  luôn đi qua line search backtracking (chấp nhận chỉ khi KL ≤ δ và surrogate
  cải thiện; thất bại giữ nguyên tham số).
- DDPG/TD3/SAC dùng actor-critic liên tục; TD3 thêm target smoothing và delayed
  policy update; SAC tối ưu entropy tự động.
- MARL theo mô hình CTDE: QMIX bảo toàn tính đơn điệu `∂Q_tot/∂Q_i ≥ 0` bằng
  hypernetwork lấy trị tuyệt đối; MAPPO dùng GAE phần thưởng đội; MADDPG giữ
  hành động chuẩn hóa `[-1, 1]`, tầng game tự ánh xạ sang biên thật.
- Imitation bao phủ hành động rời rạc lẫn vector liên tục.
- World model dự đoán trạng thái/phần thưởng; planner dùng random shooting hoặc
  CEM; Dyna-Q trộn dữ liệu thật với rollout mô hình.

### 3.5 Căn chỉnh, suy luận và tự chơi — `alignment.ts`

- `RewardModelTrainer`: học xếp hạng từ cặp preference.
- `RLHFTrainer`: PPO với reward model và KL penalty.
- `DPOTrainer`: tối ưu trực tiếp từ cặp hành động thắng/thua.
- `MonteCarloTreeSearch<TState>`: UCT, mở rộng, mô phỏng, backpropagation.
- `AlphaZeroTrainer`, `createAlphaZeroSamples`, `applyTemperature`: policy/value
  học từ phân phối thăm MCTS.
- `STaRTrainer`: self-taught reasoning từ các trace đúng.
- `ProcessRewardModelTrainer`: chấm điểm từng bước suy luận, hỗ trợ aggregation
  `mean`, `min`, `last`.

### 3.5.1 Preference mở rộng — `preference.ts`

- `IPOTrainer`: Identity Preference Optimization — loss bình phương
  `(βΔ − 1/(2β))²` thay log-sigmoid của DPO, chặn overfit trên cặp ưu tiên và
  không đẩy xác suất về tích vô hạn; dùng chung kiểu `IPOActionPair` với DPO.
- `KTOTrainer`: Kahneman-Tversky Optimization — học từ *mẫu đơn* (không cần ghép
  cặp) với nhãn `desirable`, trọng số bất đối xứng
  `desirableWeight`/`undesirableWeight` và ước lượng KL trượt làm điểm quy chiếu
  `z_ref`; phù hợp log thưởng game thưa.

### 3.6 Tiến hoá và tìm kiếm không gradient — `evolution.ts`

- `GeneticAlgorithm<TGenome>`: selection, crossover, mutation, elitism.
- `NeuralNetworkEvolution`: tiến hoá trọng số MLP.
- `EvolutionStrategyTrainer`: ES với nhiễu đối xứng.
- `CMAESOptimizer`, `CMAESNetworkTrainer`: CMA-ES tổng quát và cho mạng nơ-ron.
- `NoveltySearch<TGenome>`: tìm kiếm theo độ mới lạ thay vì fitness thuần.
- `MapElites<TGenome>`: lưu trữ elite theo lưới đặc trưng hành vi.

### 3.6.1 NEAT — `neat.ts`

- `NeatGenome`, `NeatNodeGene`, `NeatConnectionGene`: genome node/connection với
  số hiệu innovation toàn cục (historical markings) để căn chéo khi lai.
- `NeatNetwork`: bộ đánh giá feedforward sắp topo (thêm kết nối bị chặn nếu tạo
  chu trình), activation `sigmoid | tanh | relu | linear | gauss`.
- `NEATTrainer`: tiến hóa quần thể genome với speciation theo khoảng cách tương thích,
  fitness sharing, diệt loài đình trệ, elitism và ba đột biến cấu trúc (trọng
  số, thêm kết nối, thêm node tách kết nối). Mỗi loài sống còn luôn giữ tối
  thiểu 2 suất sinh để dòng champion tiếp tục được lai/đột biến.
- `runGeneration(evaluate)` / `run(generations, evaluate)`: fitness do game tự
  định nghĩa (điểm số, thời gian sống...), không cần gradient.
- `snapshot`/`fromSnapshot`: lưu toàn bộ quần thể, loài, bảng innovation và
  bộ đếm id; khôi phục tái lập đúng cùng seed.

### 3.6.2 HyperNEAT — `hyperneat.ts`

- `HyperNEATTrainer`: CPPN tiến hóa bằng `NEATTrainer` (input 7 chiều: tọa độ
  hai đầu, khoảng cách, bias; output: trọng số + cổng).
- `SubstrateDefinition`: substrate cố định theo tầng, mỗi node có vị trí hình
  học trong `[0,1]²` (tự sinh lưới đều nếu bỏ qua); trọng số giữa hai tầng liền
  kề được tra từ CPPN, kết nối bật khi `|w_raw| > connectionThreshold`.
- `HyperNEATNetwork.activate`: feedforward substrate với tanh — phenotype tận
  dụng regularity/symmetry hình học, phù hợp sinh controller cho đội NPC với
  số tham số tiến hóa nhỏ hơn nhiều so với NEAT thuần.
- `snapshot`/`fromSnapshot` lưu cả CPPN và substrate.

### 3.7 Sinh dữ liệu và đối kháng — `generative.ts`

- `GANTrainer`: generator/discriminator, adversarial loss.
- `WGANTrainer` (WGAN-GP): critic tuyến tính Lipschitz bằng gradient penalty
  `λ·(‖∇_x̂ D(x̂)‖ − 1)²` trên điểm nội suy thật/giả (xấp xỉ bậc nhất lên đầu ra
  critic — lõi DenseLayer không hỗ trợ double-backprop). Dữ liệu thật chuẩn hóa
  `[-1, 1]` (generator tanh).
- `StyleGANLiteTrainer`: mapping network `z → w` (style latent tách nhiễu),
  synthesis `f(w)` chỉ thấy style, gate `g(w)` điều biến đầu ra kiểu FiLM
  `sample = P ⊙ (1 + g(w))`; huấn luyện bằng cùng máy WGAN-GP, gradient composite
  chạy critic → gate/synthesis → mapping.
- `VAETrainer`: encoder/decoder, latent sampling, ELBO.
- `DiffusionTrainer`: forward noise và reverse denoising.

### 3.7.1 MuZero-lite — `muzero.ts`

- `MuZeroTrainer`: ba mạng `representation` (quan sát → latent), `dynamics`
  (`(latent, action)` → `(latent kế, reward)`), `prediction` (latent → policy +
  value) — model học được trong không gian ẩn.
- `beginStep(observation)` chạy PUCT-MCTS rollout trên model, trả hành động kèm
  phân phối lượt thăm (policy improvement target); `endStep(reward, done)` ghi
  trajectory.
- `trainStep()`: unroll K bước với policy CE (target = phân phối thăm), value
  MSE (n-step return bootstrap) và reward MSE; gradient chạy ngược qua chuỗi
  latent về cả dynamics lẫn representation.
- `quickPolicy`/`evaluateValue` cho suy luận nhanh không MCTS; snapshot khôi
  phục đủ ba mạng.

### 3.7.2 Dreamer-lite — `dreamer.ts`

- `DreamerTrainer`: world model latent kiểu RSSM rút gọn về phần deterministic —
  `encoder` (quan sát → embedding), `sequence` posterior
  `[s_{t-1}, a_{t-1}, e_t] → s_t`, `imagination` prior `[s_t, a_t] → s_{t+1}`
  được kéo về posterior bằng MSE (thay KL vì bỏ thành phần stochastic), kèm
  `decoder`/`rewardHead`/`continueHead`.
- `trainWorldModel()`: BPTT hai lượt qua chuỗi thời gian — forward-only tính
  trạng thái, lượt ngược dồn gradient qua các đầu đọc → sequence → encoder.
- `trainAgent()`: rollout tưởng tượng H bước bằng imagination + actor; lambda-
  return `G_t = r_{t+1} + γ·cont·((1−λ)V(s_{t+1}) + λG_{t+1})`; critic hồi quy
  `G^λ`, actor tối đa bằng policy gradient có baseline.
- Vòng lặp game: `resetEpisode()` → `act(observation)` → `observe(reward, done)`;
  snapshot lưu cả trạng thái recurrent để suy luận liền mạch sau khôi phục.

### 3.8 Học phân tán và học liên tục — `distributed.ts`

- `ParameterServer`: synchronous/async SGD, weight decay, momentum, staleness
  rejection, snapshot/restore.
- `FederatedClient`, `FederatedLearningServer`: FedAvg và FedProx (`proximalMu`
  phạt client trôi xa tham số toàn cục), client fraction, đánh giá theo trọng số
  mẫu; server không nhận dữ liệu thô.
- `SampleReplayBuffer`: reservoir sampling, snapshot/restore.
- `EWCRegularizer`: Fisher xấp xỉ chéo, penalty và penalty gradient.
- `ContinualLearningTrainer`: trộn task mới với rehearsal, cộng phạt EWC, học
  chuỗi task mà hạn chế quên.

### 3.8.1 Song song hóa mô hình — `parallelism.ts`

- Tensor parallel: `columnParallelOutput`/`rowParallelOutput` chia ma trận trọng
  số theo chiều output/input; `tensorShardParityError` kiểm chứng trùng forward
  nguyên tầng (dùng trong test, sai số < 1e-12).
- Pipeline parallel: `PipelineParallelExecutor` chia mạng thành stage và batch
  thành micro-batch (lịch GPipe), cộng dồn gradient xuyên micro-batch rồi áp
  một lần — kết quả trùng huấn luyện batch nguyên khối (test < 1e-9).
- ZeRO: `ZeROSimulator` mô phỏng stage 1/2/3 (phân mảnh trạng thái Adam,
  gradient, tham số) kèm all-reduce trung bình; tham số cuối khớp Adam chuẩn;
  `memoryReport` ước lượng tiết kiệm bộ nhớ theo số worker.

### 3.9 Điều phối runtime — `runtime.ts`

- `TrainerRegistry`: đăng ký adapter có kiểm tra config/model/snapshot.
- `LearningSession<TModel>`: trạng thái phiên, history, evaluation, checkpoint.
- `LearningRuntime`: tạo/xoá/liệt kê phiên, train, evaluate, checkpoint,
  restore.
- `DiscretePolicy`, `ThinkingEngine<TState>`: kết hợp policy với MCTS.
- `ReasoningController`, `ReasoningTrace`: rerank trace bằng PRM.
- Policy wrapper: `ppoPolicy`, `dqnPolicy`, `behaviorCloningPolicy`,
  `alphaZeroPolicy`.
- Built-in adapter: `neuralNetworkAdapter`, `ppoAdapter`, `duelingDQNAdapter`,
  `behaviorCloningAdapter`, `alphaZeroAdapter`, `reinforceAdapter`,
  `trpoAdapter`, `qmixAdapter`, `mappoAdapter`, `maddpgAdapter`, `ipoAdapter`,
  `ktoAdapter`, `neatAdapter`, `rainbowAdapter`, `hyperneatAdapter`,
  `muzeroAdapter`, `wganAdapter`, `dreamerAdapter`, `styleganAdapter`.
- Factory: `createDefaultLearningRuntime`, `registerDefaultAdapters`.

## 4. Hợp đồng `TrainerAdapter`

Mọi thuật toán muốn đi qua registry/checkpoint phải cung cấp đủ 6 thành phần:

```ts
import type { TrainerAdapter } from '@aetheria/engine/learning';

interface MyConfig {
  inputSize: number;
}

interface MyModel {
  weights: number[];
}

interface MySnapshot {
  weights: number[];
}

const myAdapter: TrainerAdapter<MyConfig, MyModel, MySnapshot> = {
  algorithm: 'my-trainer',
  description: 'Mô tả ngắn cho UI',
  validateConfig(value): value is MyConfig {
    return (
      typeof value === 'object' &&
      value !== null &&
      'inputSize' in value &&
      typeof value.inputSize === 'number'
    );
  },
  validateModel(value): value is MyModel {
    return (
      typeof value === 'object' &&
      value !== null &&
      'weights' in value &&
      Array.isArray(value.weights)
    );
  },
  validateSnapshot(value): value is MySnapshot {
    return (
      typeof value === 'object' &&
      value !== null &&
      'weights' in value &&
      Array.isArray(value.weights)
    );
  },
  create: (config) => ({ weights: new Array(config.inputSize).fill(0) }),
  snapshot: (model) => ({ weights: [...model.weights] }),
  restore: (snapshot) => ({ weights: [...snapshot.weights] }),
};
```

Quy tắc:

1. `validateConfig` là guard thật, không trả `true` cho mọi giá trị.
2. `snapshot` trả dữ liệu thuần, có thể serialize.
3. `restore` chỉ nhận snapshot đã qua `validateSnapshot`.
4. `algorithm` là định danh duy nhất; đăng ký trùng tên bằng đối tượng khác bị
   từ chối.
5. Adapter của bên thứ ba nên được đăng ký qua `runtime.register(adapter)` hoặc
   truyền trực tiếp vào `createSession`.

## 5. Luồng huấn luyện và checkpoint

```ts
import {
  SupervisedTrainer,
  createDefaultLearningRuntime,
  neuralNetworkAdapter,
} from '@aetheria/engine/learning';

const runtime = createDefaultLearningRuntime();

const session = runtime.createSession(neuralNetworkAdapter, {
  inputSize: 4,
  hiddenSizes: [16, 16],
  outputSize: 2,
  hiddenActivation: 'relu',
  outputActivation: 'linear',
  optimizer: { kind: 'adam', learningRate: 0.01 },
});

runtime.trainSupervised(session, samples, {
  epochs: 20,
  batchSize: 16,
  shuffle: true,
});

const evaluator = new SupervisedTrainer(session.model, { loss: 'mse' });
runtime.evaluate(session, () => evaluator.evaluate(validationSamples), 'validation');

const checkpoint = runtime.saveCheckpoint(session.id, { stage: 'trained' });
const restored = runtime.restoreSession(neuralNetworkAdapter, checkpoint.id);
```

Trình tự nội bộ:

1. `createSession` gọi `registry.ensure(adapter)` rồi `adapter.create(config)`.
2. `train` đánh dấu `training`, chạy hàm huấn luyện, ghi `LearningReport` vào
   history; lỗi chuyển phiên sang `failed` và được ném lại.
3. `evaluate` ghi `EvaluationResult` vào phiên.
4. `saveCheckpoint` lấy `adapter.snapshot(model)` và lưu state thuần.
5. `restoreSession` kiểm tra đúng `algorithm`, validate snapshot, gọi
   `adapter.restore`, rồi tạo phiên mới với metadata/history cũ.

Checkpoint mặc định nằm trong `InMemoryCheckpointStore`; game có thể truyền store
khác cùng hợp đồng `save/load/list/remove` khi khởi tạo `LearningRuntime`.

## 6. Suy luận có tìm kiếm

`ThinkingEngine` nhận một `DiscretePolicy` và tùy chọn một `MCTSEnvironment`:

```ts
import {
  ThinkingEngine,
  ppoPolicy,
} from '@aetheria/engine/learning';

const thinker = new ThinkingEngine(ppoPolicy(trainer), {
  simulations: 64,
  exploration: 1.4,
  searchWeight: 0.6,
  temperature: 0,
  environment: myMctsEnvironment,
});

const decision = thinker.think(currentState);
// decision.action, decision.probabilities, decision.confidence,
// decision.entropy, decision.value, decision.source, decision.search
```

- `simulations = 0` hoặc không có environment: chỉ dùng policy.
- Có MCTS: phân phối thăm được trộn với policy theo `searchWeight`.
- `temperature = 0`: chọn argmax; `temperature > 0`: lấy mẫu có điều chỉnh.

`ReasoningController` dùng `ProcessRewardModelTrainer` để chấm từng bước và chọn
trace tốt nhất:

```ts
const controller = new ReasoningController(prm, 'mean');
const best = controller.select(traces);
const shouldContinue = controller.shouldContinue(trace, 0.6);
```

## 7. Học federated và học liên tục

### Federated

`FederatedLearningServer` nhận danh sách `FederatedClientConfig`; mỗi client giữ
dữ liệu riêng và chỉ gửi tham số sau khi huấn luyện cục bộ.

```ts
const server = new FederatedLearningServer({
  clients: [
    { id: 'region-a', network: netA, samples: samplesA, loss: 'crossEntropy' },
    { id: 'region-b', network: netB, samples: samplesB, loss: 'crossEntropy' },
  ],
  localEpochs: 2,
  clientFraction: 1,
});

const report = server.run(5, 1);
const evaluation = server.evaluate();
```

- `ParameterServer` là hạ tầng dùng chung: `submitParameters`, `submitGradient`,
  `flush`, `snapshot`, `reset`.
- Chế độ synchronous gom đủ worker rồi trung bình có trọng số.
- Chế độ asynchronous áp ngay với mixing rate; update vượt `maxStaleness` bị từ
  chối `stale`.
- Buffer không được trộn tham số và gradient trong cùng một vòng.

### Continual

```ts
const trainer = new ContinualLearningTrainer({
  network,
  loss: 'crossEntropy',
  ewc: { lambda: 200, damping: 1e-3, seed: 2 },
  replayCapacity: 128,
  replayRatio: 0.4,
});

trainer.fitTask(taskA, { epochs: 40, batchSize: 8 });
trainer.fitTask(taskB, { epochs: 40, batchSize: 8 });
```

- Rehearsal dùng reservoir sampling để giữ mẫu đại diện qua chuỗi task.
- `fitTask` huấn luyện rồi `consolidate` Fisher/anchor tại tham số hiện tại.
- Penalty EWC được cộng vào gradient theo kích thước batch để không bị chia nhỏ
  bởi `applyNetworkGradient`.

## 8. Quy tắc phụ thuộc và mở rộng

1. **Chỉ import từ `@aetheria/engine/learning`.** Không deep-import
   `src/learning/...` từ game hoặc tầng UI.
2. **Không import Three.js vào learning.** Trainer chỉ làm việc với số, mảng và
   `NeuralNetwork`.
3. **Không tự sửa `engine/src/deeplearning`.** Nếu cần hành vi mới, bọc nó trong
   `learning/network.ts` hoặc thêm phương thức additive có test.
4. **Trainer mới nên tuân thủ mẫu hiện có:**
   - Config interface chỉ chứa tham số thuần.
   - Có snapshot/restore nếu muốn checkpoint.
   - Trả `LearningReport` hoặc kiểu kết quả có `metrics`.
   - Dùng `DeepRandom` với seed để tái lập.
   - Không giữ tham chiếu toàn cục tới dữ liệu người dùng; clone sample khi lưu.
5. **Adapter mới phải có guard thật.** Registry không tin tưởng bất kỳ `unknown`
   nào từ checkpoint hoặc UI.
6. **UI chỉ nên dùng `SessionSummary`, report và checkpoint id.** Không đưa model
   sống qua ranh giới server/client.

## 9. Kiểm chứng

```powershell
cd engine
npx vitest run tests/learning-runtime.test.ts
npx vitest run
npx tsc -p tsconfig.json --noEmit
```

Bộ test tích hợp bao phủ: supervised + distillation, PPO, DQN, behavior cloning,
ThinkingEngine/MCTS, PRM reasoning, runtime checkpoint/registry, federated/FedAvg,
parameter-server staleness, EWC/rehearsal, GA, GAN/VAE, DPO và MCTS. Nhóm bổ
sung nằm ở `tests/learning-extended.test.ts` (25 test): REINFORCE, TRPO (ràng
buộc KL), QMIX/MAPPO/MADDPG, IPO/KTO, NEAT (giải XOR, tăng trưởng topology,
deterministic, snapshot), FedProx (μ lớn giữ client gần toàn cục hơn FedAvg),
PEFT (base không đổi, loss giảm) và 19 adapter registry qua
`createDefaultLearningRuntime`. Nhóm đợt 2 nằm ở `tests/learning-advanced.test.ts`
(29 test): WGAN-GP, Rainbow (n-step + NoisyNet), HyperNEAT, QLoRA, tensor/pipeline/
ZeRO parity, MuZero-lite, Dreamer-lite (world model + actor-critic trong giấc mơ)
và StyleGAN-lite (mapping + gate điều biến).
