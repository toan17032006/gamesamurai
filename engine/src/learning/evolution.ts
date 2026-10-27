/**
 * @file evolution.ts
 * @module @aetheria/engine/learning/evolution
 * @description Tìm kiếm tiến hoá và gradient-free cho agent:
 *
 * - `GeneticAlgorithm`: GA tổng quát với tournament, elitism, crossover, mutation.
 * - `NeuralNetworkEvolution`: GA trên vector tham số mạng nơ-ron.
 * - `EvolutionStrategyTrainer`: OpenAI-ES với rank normalization.
 * - `CMAESOptimizer` / `CMAESNetworkTrainer`: CMA-ES đầy đủ (covariance + Jacobi).
 * - `NoveltySearch`: tìm kiếm theo độ mới lạ thay vì chỉ fitness.
 * - `MapElites`: lưu trữ elite theo ô hành vi (quality-diversity).
 *
 * Mọi thuật toán coi genome là bất biến: toán tử sinh genome mới, không sửa
 * genome đầu vào. Nhờ vậy archive/checkpoint không bị aliasing ngoài ý muốn.
 */

import { NeuralNetwork } from '../deeplearning/nn.js';
import { DeepRandom, clampRange } from '../deeplearning/random.js';
import {
  applyNetworkParameters,
  flattenNetworkParameters,
  mutateParameters,
  networkParameterCount,
} from './network.js';

/** Một thế hệ trong lịch sử tiến hoá. */
export interface EvolutionGeneration {
  generation: number;
  bestFitness: number;
  meanFitness: number;
  /** Độ đa dạng trung bình theo khoảng cách genome (nếu tính được). */
  diversity: number;
}

/** Kết quả chạy tiến hoá. */
export interface EvolutionResult<TGenome> {
  best: TGenome;
  bestFitness: number;
  history: EvolutionGeneration[];
  generations: number;
  population: TGenome[];
}

/** Cấu hình GA tổng quát. */
export interface GeneticAlgorithmOptions<TGenome> {
  populationSize: number;
  generations: number;
  eliteCount?: number;
  tournamentSize?: number;
  crossoverRate?: number;
  mutationRate?: number;
  seed?: number;
  /** Tạo cá thể ngẫu nhiên. */
  createInitial: (random: DeepRandom) => TGenome;
  /** Fitness càng cao càng tốt. */
  fitness: (genome: TGenome) => number;
  crossover: (a: TGenome, b: TGenome, random: DeepRandom) => TGenome;
  mutate: (genome: TGenome, random: DeepRandom) => TGenome;
  /** Khoảng cách genome để đo diversity; mặc định 0. */
  distance?: (a: TGenome, b: TGenome) => number;
}

/**
 * Genetic Algorithm tổng quát.
 *
 * Mỗi thế hệ: đánh giá toàn bộ quần thể, giữ elite, chọn cha mẹ bằng tournament,
 * lai ghép và đột biến để lấp đầy quần thể mới.
 */
export class GeneticAlgorithm<TGenome> {
  private readonly options: Required<
    Pick<
      GeneticAlgorithmOptions<TGenome>,
      'populationSize' | 'generations' | 'eliteCount' | 'tournamentSize' | 'crossoverRate' | 'mutationRate'
    >
  > &
    GeneticAlgorithmOptions<TGenome>;
  private readonly random: DeepRandom;
  private population: TGenome[] = [];

  constructor(options: GeneticAlgorithmOptions<TGenome>) {
    if (options.populationSize <= 0) throw new RangeError('populationSize phải dương');
    if (options.generations <= 0) throw new RangeError('generations phải dương');
    this.options = {
      ...options,
      populationSize: Math.max(2, Math.floor(options.populationSize)),
      generations: Math.max(1, Math.floor(options.generations)),
      eliteCount: Math.max(1, Math.floor(options.eliteCount ?? 2)),
      tournamentSize: Math.max(2, Math.floor(options.tournamentSize ?? 3)),
      crossoverRate: clampRange(options.crossoverRate ?? 0.8, 0, 1),
      mutationRate: clampRange(options.mutationRate ?? 0.2, 0, 1),
    };
    this.options.eliteCount = Math.min(this.options.eliteCount, this.options.populationSize);
    this.random = new DeepRandom(options.seed ?? 1);
  }

  /** Quần thể hiện tại (bản sao nông). */
  public getPopulation(): readonly TGenome[] {
    return [...this.population];
  }

  /** Chạy `generations` thế hệ (hoặc số thế hệ truyền vào). */
  public run(generations = this.options.generations): EvolutionResult<TGenome> {
    if (this.population.length === 0) {
      this.population = Array.from({ length: this.options.populationSize }, () =>
        this.options.createInitial(this.random),
      );
    }

    const history: EvolutionGeneration[] = [];
    let best = this.population[0];
    let bestFitness = -Infinity;

    for (let generation = 0; generation < Math.max(1, generations); generation++) {
      const fitness = this.population.map((genome) => this.options.fitness(genome));
      const order = fitness
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value);

      if (order[0].value > bestFitness) {
        bestFitness = order[0].value;
        best = this.population[order[0].index];
      }

      const meanFitness = fitness.reduce((sum, value) => sum + value, 0) / fitness.length;
      history.push({
        generation,
        bestFitness: order[0].value,
        meanFitness,
        diversity: this.diversity(this.population),
      });

      const next: TGenome[] = order
        .slice(0, this.options.eliteCount)
        .map((entry) => this.population[entry.index]);

      while (next.length < this.options.populationSize) {
        const parentA = this.tournament(fitness);
        const parentB = this.tournament(fitness);
        let child =
          this.random.chance(this.options.crossoverRate)
            ? this.options.crossover(parentA, parentB, this.random)
            : parentA;
        if (this.random.chance(this.options.mutationRate)) {
          child = this.options.mutate(child, this.random);
        }
        next.push(child);
      }
      this.population = next;
    }

    return {
      best,
      bestFitness,
      history,
      generations: history.length,
      population: [...this.population],
    };
  }

  /** Chọn một cá thể bằng tournament. */
  private tournament(fitness: readonly number[]): TGenome {
    let bestIndex = this.random.int(0, this.population.length - 1);
    for (let i = 1; i < this.options.tournamentSize; i++) {
      const index = this.random.int(0, this.population.length - 1);
      if (fitness[index] > fitness[bestIndex]) bestIndex = index;
    }
    return this.population[bestIndex];
  }

  /** Độ đa dạng trung bình; 0 nếu không có hàm khoảng cách. */
  private diversity(population: readonly TGenome[]): number {
    const distance = this.options.distance;
    if (!distance || population.length < 2) return 0;
    let total = 0;
    let pairs = 0;
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        total += distance(population[i], population[j]);
        pairs++;
      }
    }
    return pairs > 0 ? total / pairs : 0;
  }
}

/** Cấu hình tiến hoá mạng nơ-ron. */
export interface NeuralNetworkEvolutionConfig {
  template: NeuralNetwork;
  /** Fitness nhận bản sao mạng đã nạp genome; càng cao càng tốt. */
  fitness: (network: NeuralNetwork) => number;
  populationSize?: number;
  generations?: number;
  eliteCount?: number;
  tournamentSize?: number;
  crossoverRate?: number;
  mutationRate?: number;
  mutationScale?: number;
  /** Độ lệch khởi tạo quanh template. */
  initialScale?: number;
  seed?: number;
}

/** Kết quả tiến hoá mạng. */
export interface NeuralNetworkEvolutionResult {
  bestNetwork: NeuralNetwork;
  bestParameters: number[];
  bestFitness: number;
  history: EvolutionGeneration[];
  generations: number;
}

/**
 * Tiến hoá trọng số mạng bằng GA trên vector tham số phẳng.
 *
 * Crossover đồng nhất từng gene; mutation dùng `mutateParameters` để giữ tần
 * suất đột biến theo từng trọng số thay vì toàn vector.
 */
type ResolvedNeuralEvolutionConfig = NeuralNetworkEvolutionConfig &
  Required<
    Pick<
      NeuralNetworkEvolutionConfig,
      | 'populationSize'
      | 'generations'
      | 'eliteCount'
      | 'tournamentSize'
      | 'crossoverRate'
      | 'mutationRate'
      | 'mutationScale'
      | 'initialScale'
    >
  >;

export class NeuralNetworkEvolution {
  public readonly template: NeuralNetwork;

  private readonly config: ResolvedNeuralEvolutionConfig;
  private readonly random: DeepRandom;

  constructor(config: NeuralNetworkEvolutionConfig) {
    this.template = config.template;
    this.config = {
      ...config,
      populationSize: Math.max(2, Math.floor(config.populationSize ?? 32)),
      generations: Math.max(1, Math.floor(config.generations ?? 20)),
      eliteCount: Math.max(1, Math.floor(config.eliteCount ?? 2)),
      tournamentSize: Math.max(2, Math.floor(config.tournamentSize ?? 3)),
      crossoverRate: clampRange(config.crossoverRate ?? 0.8, 0, 1),
      mutationRate: clampRange(config.mutationRate ?? 0.2, 0, 1),
      mutationScale: Math.max(0, config.mutationScale ?? 0.05),
      initialScale: Math.max(0, config.initialScale ?? 0.1),
    };
    this.random = new DeepRandom(config.seed ?? 1);
  }

  /** Chạy tiến hoá và trả mạng tốt nhất. */
  public run(generations = this.config.generations): NeuralNetworkEvolutionResult {
    const dimension = networkParameterCount(this.template);
    const templateParameters = flattenNetworkParameters(this.template);
    const algorithm = new GeneticAlgorithm<number[]>({
      populationSize: this.config.populationSize,
      generations,
      eliteCount: this.config.eliteCount,
      tournamentSize: this.config.tournamentSize,
      crossoverRate: this.config.crossoverRate,
      mutationRate: this.config.mutationRate,
      seed: this.config.seed,
      createInitial: (random) => {
        const genome = [...templateParameters];
        return mutateParameters(genome, 1, this.config.initialScale, random);
      },
      fitness: (genome) => this.config.fitness(this.networkFrom(genome)),
      crossover: (a, b, random) => {
        const child = new Array<number>(dimension);
        for (let i = 0; i < dimension; i++) child[i] = random.chance(0.5) ? a[i] : b[i];
        return child;
      },
      mutate: (genome, random) => {
        const child = [...genome];
        return mutateParameters(child, 1, this.config.mutationScale, random);
      },
      distance: (a, b) => {
        let sum = 0;
        for (let i = 0; i < dimension; i++) sum += (a[i] - b[i]) ** 2;
        return Math.sqrt(sum);
      },
    });
    const result = algorithm.run(generations);
    return {
      bestNetwork: this.networkFrom(result.best),
      bestParameters: [...result.best],
      bestFitness: result.bestFitness,
      history: result.history,
      generations: result.generations,
    };
  }

  /** Nạp genome vào bản sao template. */
  public networkFrom(parameters: readonly number[]): NeuralNetwork {
    const network = this.template.clone();
    applyNetworkParameters(network, parameters);
    return network;
  }
}

/** Cấu hình Evolution Strategies. */
export interface EvolutionStrategyConfig {
  network: NeuralNetwork;
  fitness: (network: NeuralNetwork) => number;
  populationSize?: number;
  sigma?: number;
  learningRate?: number;
  generations?: number;
  /** Dùng cặp nhiễu đối xứng ±ε để giảm phương sai (mặc định bật). */
  antithetic?: boolean;
  seed?: number;
}

/** Kết quả ES. */
export interface EvolutionStrategyResult {
  bestNetwork: NeuralNetwork;
  bestFitness: number;
  history: EvolutionGeneration[];
  generations: number;
}

/**
 * OpenAI Evolution Strategies.
 *
 * Mỗi thế hệ lấy mẫu nhiễu Gaussian, đánh giá fitness, chuẩn hoá hạng rồi cập
 * nhật `θ += α/(nσ)·Σ u_i ε_i`. ES không cần lan truyền ngược, phù hợp khi
 * fitness là kết quả mô phỏng game không khả vi.
 */
type ResolvedEvolutionStrategyConfig = EvolutionStrategyConfig &
  Required<
    Pick<
      EvolutionStrategyConfig,
      'populationSize' | 'sigma' | 'learningRate' | 'generations' | 'antithetic'
    >
  >;

export class EvolutionStrategyTrainer {
  public readonly network: NeuralNetwork;

  private readonly config: ResolvedEvolutionStrategyConfig;
  private readonly random: DeepRandom;

  constructor(config: EvolutionStrategyConfig) {
    this.network = config.network;
    this.config = {
      ...config,
      populationSize: Math.max(2, Math.floor(config.populationSize ?? 32)),
      sigma: Math.max(1e-6, config.sigma ?? 0.05),
      learningRate: Math.max(1e-6, config.learningRate ?? 0.02),
      generations: Math.max(1, Math.floor(config.generations ?? 50)),
      antithetic: config.antithetic ?? true,
    };
    this.random = new DeepRandom(config.seed ?? 1);
  }

  /** Chạy ES, cập nhật trọng số mạng gốc. */
  public run(generations = this.config.generations): EvolutionStrategyResult {
    const dimension = networkParameterCount(this.network);
    let parameters = flattenNetworkParameters(this.network);
    let bestParameters = [...parameters];
    let bestFitness = this.config.fitness(this.network.clone());
    const history: EvolutionGeneration[] = [];
    const populationSize = this.config.populationSize;

    for (let generation = 0; generation < Math.max(1, generations); generation++) {
      const noise: number[][] = [];
      const fitness: number[] = [];
      const half = Math.ceil(populationSize / 2);
      for (let i = 0; i < populationSize; i++) {
        const epsilon = new Array<number>(dimension).fill(0).map(() =>
          this.random.gaussian(0, 1),
        );
        if (this.config.antithetic && i < half) {
          // Sinh cặp ±ε: nửa đầu dương, nửa sau âm của cùng vector.
          const pair = epsilon;
          const opposite = pair.map((value) => -value);
          noise.push(pair);
          fitness.push(this.evaluate(parameters, pair));
          if (noise.length < populationSize) {
            noise.push(opposite);
            fitness.push(this.evaluate(parameters, opposite));
          }
        } else if (!this.config.antithetic) {
          noise.push(epsilon);
          fitness.push(this.evaluate(parameters, epsilon));
        }
      }

      // Nếu số mẫu vượt population do cặp đối xứng, cắt bớt.
      noise.length = Math.min(noise.length, populationSize);
      fitness.length = Math.min(fitness.length, populationSize);

      const order = fitness
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value);
      const utilities = new Array<number>(fitness.length).fill(0);
      for (let rank = 0; rank < order.length; rank++) {
        utilities[order[rank].index] = order.length > 1 ? rank / (order.length - 1) - 0.5 : 0;
      }

      const gradient = new Array<number>(dimension).fill(0);
      for (let i = 0; i < noise.length; i++) {
        for (let d = 0; d < dimension; d++) {
          gradient[d] += utilities[i] * noise[i][d];
        }
      }
      const scale = this.config.learningRate / (noise.length * this.config.sigma);
      parameters = parameters.map((value, index) => value + scale * gradient[index]);

      const meanFitness = fitness.reduce((sum, value) => sum + value, 0) / Math.max(1, fitness.length);
      const generationBest = order[0]?.value ?? -Infinity;
      history.push({
        generation,
        bestFitness: generationBest,
        meanFitness,
        diversity: this.config.sigma,
      });

      const candidate = this.networkFrom(parameters);
      const candidateFitness = this.config.fitness(candidate);
      if (candidateFitness > bestFitness) {
        bestFitness = candidateFitness;
        bestParameters = [...parameters];
      }
    }

    applyNetworkParameters(this.network, bestParameters);
    return {
      bestNetwork: this.network.clone(),
      bestFitness,
      history,
      generations: history.length,
    };
  }

  /** Đánh giá `θ + σ·ε`. */
  private evaluate(parameters: readonly number[], epsilon: readonly number[]): number {
    const candidate = parameters.map(
      (value, index) => value + this.config.sigma * (epsilon[index] ?? 0),
    );
    return this.config.fitness(this.networkFrom(candidate));
  }

  private networkFrom(parameters: readonly number[]): NeuralNetwork {
    const network = this.network.clone();
    applyNetworkParameters(network, parameters);
    return network;
  }
}

/** Cấu hình CMA-ES. */
export interface CMAESConfig {
  dimension: number;
  /** Kích thước quần thể; mặc định `4 + floor(3·ln n)`. */
  populationSize?: number;
  sigma?: number;
  /** Trung bình khởi tạo; mặc định 0. */
  initialMean?: readonly number[];
  seed?: number;
}

/** Một lời giải CMA-ES. */
export interface CMAESSolution {
  parameters: number[];
  fitness: number;
}

/** Kết quả CMA-ES. */
export interface CMAESResult {
  best: number[];
  bestFitness: number;
  history: EvolutionGeneration[];
  generations: number;
}

/**
 * CMA-ES đầy đủ với cập nhật hiệp phương sai và phân rã Jacobi.
 *
 * Sử dụng chiến lược chuẩn (Hansen): rank-μ update, evolution paths, step-size
 * adaptation. Phù hợp cho không gian tham số vài trăm chiều — vượt xa GA thường
 * khi fitness trơn nhưng không khả vi.
 */
export class CMAESOptimizer {
  public readonly dimension: number;
  public readonly populationSize: number;
  public readonly mu: number;
  public readonly weights: number[];
  public sigma: number;
  public mean: number[];
  public generation = 0;

  private covariance: number[][];
  private invSqrtCovariance: number[][];
  private basis: number[][];
  private eigenValues: number[];
  private pathSigma: number[];
  private pathCovariance: number[];
  private readonly mueff: number;
  private readonly cc: number;
  private readonly cs: number;
  private readonly c1: number;
  private readonly cmu: number;
  private readonly damps: number;
  private readonly chiN: number;
  private readonly random: DeepRandom;
  private pending: { parameters: number[]; y: number[] }[] = [];

  constructor(config: CMAESConfig) {
    if (config.dimension <= 0) throw new RangeError('CMA-ES cần dimension dương');
    this.dimension = Math.floor(config.dimension);
    const n = this.dimension;
    this.populationSize = Math.max(
      4,
      Math.floor(config.populationSize ?? 4 + Math.floor(3 * Math.log(n))),
    );
    this.mu = Math.floor(this.populationSize / 2);
    const rawWeights = Array.from({ length: this.mu }, (_, index) => Math.log(this.mu + 0.5) - Math.log(index + 1));
    const weightSum = rawWeights.reduce((sum, value) => sum + value, 0);
    this.weights = rawWeights.map((value) => value / weightSum);
    this.mueff = 1 / this.weights.reduce((sum, value) => sum + value * value, 0);
    this.cc = 4 / (n + 4);
    this.cs = (this.mueff + 2) / (n + this.mueff + 3);
    this.c1 = 2 / ((n + 1.3) ** 2 + this.mueff);
    this.cmu = Math.min(
      1 - this.c1,
      (2 * (this.mueff - 2 + 1 / this.mueff)) / ((n + 2) ** 2 + this.mueff),
    );
    this.damps = 1 + 2 * Math.max(0, Math.sqrt((this.mueff - 1) / (n + 1)) - 1) + this.cs;
    this.chiN = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));
    this.sigma = Math.max(1e-8, config.sigma ?? 0.5);
    this.random = new DeepRandom(config.seed ?? 1);

    this.mean = config.initialMean
      ? normalizeVector(config.initialMean, n, 0)
      : new Array<number>(n).fill(0);
    this.covariance = identityMatrix(n);
    this.invSqrtCovariance = identityMatrix(n);
    this.basis = identityMatrix(n);
    this.eigenValues = new Array<number>(n).fill(1);
    this.pathSigma = new Array<number>(n).fill(0);
    this.pathCovariance = new Array<number>(n).fill(0);
  }

  /** Lấy mẫu `populationSize` lời giải mới. */
  public ask(): number[][] {
    this.pending = [];
    const solutions: number[][] = [];
    for (let i = 0; i < this.populationSize; i++) {
      const z = new Array<number>(this.dimension).fill(0).map(() => this.random.gaussian(0, 1));
      const y = this.transform(z);
      const parameters = this.mean.map((value, index) => value + this.sigma * y[index]);
      this.pending.push({ parameters, y });
      solutions.push(parameters);
    }
    return solutions;
  }

  /**
   * Cập nhật phân phối từ lời giải đã đánh giá.
   *
   * Fitness càng cao càng tốt. Nếu truyền ít hơn `populationSize`, các lời giải
   * thiếu sẽ bị bỏ qua và trọng số được chuẩn hoá lại.
   */
  public tell(solutions: readonly CMAESSolution[]): void {
    if (solutions.length === 0) throw new RangeError('CMA-ES cần ít nhất một lời giải');
    const sorted = [...solutions].sort((a, b) => b.fitness - a.fitness).slice(0, this.mu);
    const count = sorted.length;

    const oldMean = [...this.mean];
    const nextMean = new Array<number>(this.dimension).fill(0);
    let weightTotal = 0;
    for (let i = 0; i < count; i++) {
      const weight = this.weights[i];
      weightTotal += weight;
      for (let d = 0; d < this.dimension; d++) {
        nextMean[d] += weight * sorted[i].parameters[d];
      }
    }
    for (let d = 0; d < this.dimension; d++) nextMean[d] /= weightTotal || 1;
    this.mean = nextMean;

    const yWeighted = nextMean.map(
      (value, index) => (value - oldMean[index]) / this.sigma,
    );
    const invSqrtY = matVec(this.invSqrtCovariance, yWeighted);
    const psScale = Math.sqrt(this.cs * (2 - this.cs) * this.mueff);
    this.pathSigma = this.pathSigma.map(
      (value, index) => (1 - this.cs) * value + psScale * invSqrtY[index],
    );
    const psNorm = vectorNorm(this.pathSigma);
    const hsig =
      psNorm /
        Math.sqrt(1 - (1 - this.cs) ** (2 * (this.generation + 1))) <
      (1.4 + 2 / (this.dimension + 1)) * this.chiN
        ? 1
        : 0;

    const pcScale = hsig * Math.sqrt(this.cc * (2 - this.cc) * this.mueff);
    this.pathCovariance = this.pathCovariance.map(
      (value, index) => (1 - this.cc) * value + pcScale * yWeighted[index],
    );

    const rankMu = zeroMatrix(this.dimension);
    for (let i = 0; i < count; i++) {
      const y = sorted[i].parameters.map(
        (value, index) => (value - oldMean[index]) / this.sigma,
      );
      const weight = this.weights[i];
      for (let r = 0; r < this.dimension; r++) {
        for (let c = 0; c < this.dimension; c++) {
          rankMu[r][c] += weight * y[r] * y[c];
        }
      }
    }
    const oldFactor = 1 - this.c1 - this.cmu;
    const pcOuter = outerProduct(this.pathCovariance);
    const correction = 1 - hsig;
    for (let r = 0; r < this.dimension; r++) {
      for (let c = 0; c < this.dimension; c++) {
        this.covariance[r][c] =
          oldFactor * this.covariance[r][c] +
          this.c1 *
            (pcOuter[r][c] + correction * this.cc * (2 - this.cc) * this.covariance[r][c]) +
          this.cmu * rankMu[r][c];
      }
    }

    this.sigma *= Math.exp((this.cs / this.damps) * (psNorm / this.chiN - 1));
    this.sigma = clampRange(this.sigma, 1e-12, 1e6);
    this.updateEigen();
    this.generation++;
    this.pending = [];
  }

  /** Chạy CMA-ES với hàm đánh giá. */
  public run(
    evaluate: (parameters: readonly number[]) => number,
    generations: number,
  ): CMAESResult {
    let best = [...this.mean];
    let bestFitness = -Infinity;
    const history: EvolutionGeneration[] = [];
    for (let generation = 0; generation < Math.max(1, generations); generation++) {
      const candidates = this.ask();
      const solutions: CMAESSolution[] = candidates.map((parameters) => ({
        parameters,
        fitness: evaluate(parameters),
      }));
      const generationBest = solutions.reduce(
        (bestSolution, solution) =>
          solution.fitness > bestSolution.fitness ? solution : bestSolution,
        solutions[0],
      );
      if (generationBest.fitness > bestFitness) {
        bestFitness = generationBest.fitness;
        best = [...generationBest.parameters];
      }
      const meanFitness =
        solutions.reduce((sum, solution) => sum + solution.fitness, 0) / solutions.length;
      history.push({
        generation,
        bestFitness: generationBest.fitness,
        meanFitness,
        diversity: this.sigma,
      });
      this.tell(solutions);
    }
    return { best, bestFitness, history, generations: history.length };
  }

  /** Lấy mẫu `y = B·D·z` (phân phối N(0, C)). */
  private transform(z: readonly number[]): number[] {
    const scaled = z.map((value, index) => value * Math.sqrt(Math.max(this.eigenValues[index], 1e-12)));
    return matVec(this.basis, scaled);
  }

  /** Phân rã Jacobi của covariance, sắp xếp trị riêng giảm dần. */
  private updateEigen(): void {
    const { values, vectors } = jacobiEigen(this.covariance);
    const order = values
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value);
    this.eigenValues = order.map((entry) => Math.max(entry.value, 1e-12));
    this.basis = Array.from({ length: this.dimension }, (_, row) =>
      order.map((entry) => vectors[row][entry.index]),
    );
    const invSqrt = this.eigenValues.map((value) => 1 / Math.sqrt(value));
    this.invSqrtCovariance = Array.from({ length: this.dimension }, (_, row) =>
      Array.from({ length: this.dimension }, (_, column) =>
        this.basis[row].reduce(
          (sum, value, index) => sum + value * invSqrt[index] * this.basis[column][index],
          0,
        ),
      ),
    );
  }
}

/** Cấu hình CMA-ES cho mạng. */
export interface CMAESNetworkConfig {
  network: NeuralNetwork;
  fitness: (network: NeuralNetwork) => number;
  populationSize?: number;
  sigma?: number;
  generations?: number;
  seed?: number;
}

/**
 * CMA-ES trên vector tham số mạng.
 *
 * Sau khi chạy, trọng số tốt nhất được nạp ngược vào `network` và trả về.
 */
export class CMAESNetworkTrainer {
  public readonly network: NeuralNetwork;

  private readonly config: CMAESNetworkConfig;

  constructor(config: CMAESNetworkConfig) {
    this.network = config.network;
    this.config = { ...config };
  }

  public run(generations = this.config.generations ?? 50): CMAESResult {
    const initialMean = flattenNetworkParameters(this.network);
    const optimizer = new CMAESOptimizer({
      dimension: initialMean.length,
      populationSize: this.config.populationSize,
      sigma: this.config.sigma ?? 0.05,
      initialMean,
      seed: this.config.seed ?? 1,
    });
    const scratch = this.network.clone();
    const result = optimizer.run((parameters) => {
      applyNetworkParameters(scratch, parameters);
      return this.config.fitness(scratch);
    }, generations);
    applyNetworkParameters(this.network, result.best);
    return result;
  }
}

/** Cấu hình novelty search. */
export interface NoveltySearchOptions<TGenome> {
  populationSize: number;
  generations: number;
  /** Số láng giềng gần nhất dùng tính novelty. */
  k?: number;
  /** Ngưỡng đưa vào archive. */
  archiveThreshold?: number;
  /** Trọng số fitness cộng vào novelty (mặc định 0 = thuần novelty). */
  fitnessWeight?: number;
  seed?: number;
  createInitial: (random: DeepRandom) => TGenome;
  mutate: (genome: TGenome, random: DeepRandom) => TGenome;
  behavior: (genome: TGenome) => readonly number[];
  fitness?: (genome: TGenome) => number;
}

/** Kết quả novelty search. */
export interface NoveltySearchResult<TGenome> {
  best: TGenome;
  bestNovelty: number;
  archive: TGenome[];
  history: EvolutionGeneration[];
}

/**
 * Novelty search: thưởng cho hành vi khác biệt thay vì chỉ điểm cao.
 *
 * Khoảng cách hành vi dùng Euclidean; novelty của cá thể là khoảng cách trung
 * bình tới `k` láng giềng gần nhất trong quần thể + archive.
 */
type ResolvedNoveltySearchOptions<TGenome> = NoveltySearchOptions<TGenome> &
  Required<
    Pick<
      NoveltySearchOptions<TGenome>,
      'populationSize' | 'generations' | 'k' | 'archiveThreshold' | 'fitnessWeight'
    >
  >;

export class NoveltySearch<TGenome> {
  private readonly options: ResolvedNoveltySearchOptions<TGenome>;
  private readonly random: DeepRandom;
  private readonly archive: TGenome[] = [];

  constructor(options: NoveltySearchOptions<TGenome>) {
    if (options.populationSize <= 0) throw new RangeError('populationSize phải dương');
    this.options = {
      ...options,
      populationSize: Math.max(2, Math.floor(options.populationSize)),
      generations: Math.max(1, Math.floor(options.generations)),
      k: Math.max(1, Math.floor(options.k ?? 5)),
      archiveThreshold: Math.max(0, options.archiveThreshold ?? 0.5),
      fitnessWeight: Math.max(0, options.fitnessWeight ?? 0),
    };
    this.random = new DeepRandom(options.seed ?? 1);
  }

  /** Toàn bộ cá thể trong archive. */
  public getArchive(): readonly TGenome[] {
    return [...this.archive];
  }

  public run(generations = this.options.generations): NoveltySearchResult<TGenome> {
    let population = Array.from({ length: this.options.populationSize }, () =>
      this.options.createInitial(this.random),
    );
    const history: EvolutionGeneration[] = [];
    let best = population[0];
    let bestNovelty = -Infinity;

    for (let generation = 0; generation < Math.max(1, generations); generation++) {
      const behaviors = population.map((genome) => [...this.options.behavior(genome)]);
      const novelty = behaviors.map((behavior, index) => {
        const distances = behaviors
          .map((other, otherIndex) => (otherIndex === index ? Infinity : distance(behavior, other)))
          .concat(this.archive.map((genome) => distance(behavior, this.options.behavior(genome))))
          .filter((value) => Number.isFinite(value) && value < Infinity)
          .sort((a, b) => a - b)
          .slice(0, this.options.k);
        const mean =
          distances.length > 0
            ? distances.reduce((sum, value) => sum + value, 0) / distances.length
            : 0;
        const fitness = this.options.fitness ? this.options.fitness(population[index]) : 0;
        return mean + this.options.fitnessWeight * fitness;
      });

      for (let i = 0; i < population.length; i++) {
        if (novelty[i] > bestNovelty) {
          bestNovelty = novelty[i];
          best = population[i];
        }
        if (novelty[i] >= this.options.archiveThreshold) {
          this.archive.push(population[i]);
        }
      }

      const order = novelty
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value);
      history.push({
        generation,
        bestFitness: order[0].value,
        meanFitness: novelty.reduce((sum, value) => sum + value, 0) / novelty.length,
        diversity: this.archive.length,
      });

      const next: TGenome[] = order
        .slice(0, Math.max(1, Math.floor(population.length / 2)))
        .map((entry) => population[entry.index]);
      while (next.length < this.options.populationSize) {
        const parent = population[this.random.int(0, population.length - 1)];
        next.push(this.options.mutate(parent, this.random));
      }
      population = next;
    }

    return { best, bestNovelty, archive: [...this.archive], history };
  }
}

/** Cấu hình MAP-Elites. */
export interface MapElitesOptions<TGenome> {
  behaviors: number;
  bins: readonly number[];
  /** Biên của từng chiều hành vi. */
  bounds?: readonly { min: number; max: number }[];
  iterations: number;
  seed?: number;
  createInitial: (random: DeepRandom) => TGenome;
  mutate: (genome: TGenome, random: DeepRandom) => TGenome;
  behavior: (genome: TGenome) => readonly number[];
  fitness: (genome: TGenome) => number;
}

/** Một elite trong archive. */
export interface MapElite<TGenome> {
  genome: TGenome;
  fitness: number;
  behavior: number[];
  key: string;
}

/** Kết quả MAP-Elites. */
export interface MapElitesResult<TGenome> {
  best: MapElite<TGenome> | null;
  archive: MapElite<TGenome>[];
  coverage: number;
  iterations: number;
}

/**
 * MAP-Elites: lưu cá thể tốt nhất cho mỗi ô hành vi, cân bằng chất lượng và đa
 * dạng. Mỗi vòng chọn ngẫu nhiên một elite (hoặc cá thể mới), đột biến và thay
 * thế nếu fitness cao hơn trong cùng ô.
 */
type ResolvedMapElitesOptions<TGenome> = MapElitesOptions<TGenome> &
  Required<Pick<MapElitesOptions<TGenome>, 'iterations'>>;

export class MapElites<TGenome> {
  private readonly options: ResolvedMapElitesOptions<TGenome>;
  private readonly random: DeepRandom;
  private readonly archive = new Map<string, MapElite<TGenome>>();

  constructor(options: MapElitesOptions<TGenome>) {
    if (options.behaviors <= 0) throw new RangeError('behaviors phải dương');
    if (options.iterations <= 0) throw new RangeError('iterations phải dương');
    if (options.bins.length !== options.behaviors) {
      throw new RangeError('bins phải khớp số chiều hành vi');
    }
    this.options = {
      ...options,
      iterations: Math.max(1, Math.floor(options.iterations)),
    };
    this.random = new DeepRandom(options.seed ?? 1);
  }

  /** Archive hiện tại. */
  public getArchive(): MapElite<TGenome>[] {
    return [...this.archive.values()];
  }

  public run(iterations = this.options.iterations): MapElitesResult<TGenome> {
    // Khởi tạo archive bằng một số cá thể ngẫu nhiên.
    const initialCount = Math.max(this.options.behaviors * 4, 8);
    for (let i = 0; i < initialCount; i++) {
      this.consider(this.options.createInitial(this.random));
    }

    for (let iteration = 0; iteration < Math.max(1, iterations); iteration++) {
      const elites = [...this.archive.values()];
      const parent =
        elites.length > 0 && this.random.chance(0.9)
          ? elites[this.random.int(0, elites.length - 1)].genome
          : this.options.createInitial(this.random);
      this.consider(this.options.mutate(parent, this.random));
    }

    let best: MapElite<TGenome> | null = null;
    for (const elite of this.archive.values()) {
      if (!best || elite.fitness > best.fitness) best = elite;
    }
    const capacity = this.options.bins.reduce((product, value) => product * Math.max(1, value), 1);
    return {
      best,
      archive: this.getArchive(),
      coverage: capacity > 0 ? this.archive.size / capacity : 0,
      iterations,
    };
  }

  /** Thêm genome vào archive nếu nó cải thiện ô tương ứng. */
  private consider(genome: TGenome): void {
    const behavior = [...this.options.behavior(genome)];
    if (behavior.length !== this.options.behaviors) {
      throw new RangeError('Vector hành vi không khớp số chiều');
    }
    const key = this.behaviorKey(behavior);
    const fitness = this.options.fitness(genome);
    const existing = this.archive.get(key);
    if (!existing || fitness > existing.fitness) {
      this.archive.set(key, { genome, fitness, behavior, key });
    }
  }

  /** Tính khóa ô từ hành vi. */
  private behaviorKey(behavior: readonly number[]): string {
    const indices: number[] = [];
    for (let i = 0; i < behavior.length; i++) {
      const binCount = Math.max(1, Math.floor(this.options.bins[i]));
      const bounds = this.options.bounds?.[i] ?? { min: 0, max: 1 };
      const span = bounds.max - bounds.min || 1;
      const normalized = clampRange((behavior[i] - bounds.min) / span, 0, 1);
      indices.push(Math.min(binCount - 1, Math.floor(normalized * binCount)));
    }
    return indices.join(',');
  }
}

// ---------------------------------------------------------------------------
// Tiện ích đại số tuyến tính
// ---------------------------------------------------------------------------

/** Chuẩn hóa vector về đúng số chiều. */
function normalizeVector(values: readonly number[], size: number, fallback: number): number[] {
  return Array.from({ length: size }, (_, index) =>
    typeof values[index] === 'number' ? values[index] : fallback,
  );
}

/** Ma trận đơn vị. */
function identityMatrix(size: number): number[][] {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => (row === column ? 1 : 0)),
  );
}

/** Ma trận 0. */
function zeroMatrix(size: number): number[][] {
  return Array.from({ length: size }, () => new Array<number>(size).fill(0));
}

/** Nhân ma trận với vector. */
function matVec(matrix: readonly (readonly number[])[], vector: readonly number[]): number[] {
  return matrix.map((row) =>
    row.reduce((sum, value, index) => sum + value * (vector[index] ?? 0), 0),
  );
}

/** Tích ngoài `v·vᵀ`. */
function outerProduct(vector: readonly number[]): number[][] {
  return vector.map((row) => vector.map((column) => row * column));
}

/** Chuẩn Euclid. */
function vectorNorm(vector: readonly number[]): number {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

/** Khoảng cách Euclid. */
function distance(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

/**
 * Phân rã trị riêng ma trận đối xứng bằng phép quay Jacobi.
 *
 * Trả `values` và `vectors` sao cho cột `vectors[*][i]` là vector riêng ứng với
 * `values[i]`. Độ chính xác đủ cho covariance CMA-ES vài trăm chiều.
 */
function jacobiEigen(matrix: readonly (readonly number[])[]): {
  values: number[];
  vectors: number[][];
} {
  const size = matrix.length;
  const a = matrix.map((row) => [...row]);
  const v = identityMatrix(size);
  const maxSweeps = 50;

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let offDiagonal = 0;
    for (let p = 0; p < size; p++) {
      for (let q = p + 1; q < size; q++) offDiagonal += a[p][q] * a[p][q];
    }
    if (offDiagonal < 1e-18) break;

    for (let p = 0; p < size - 1; p++) {
      for (let q = p + 1; q < size; q++) {
        if (Math.abs(a[p][q]) < 1e-18) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t =
          Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;

        for (let k = 0; k < size; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < size; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < size; k++) {
          const vkp = v[k][p];
          const vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }

  return { values: a.map((row, index) => row[index]), vectors: v };
}
