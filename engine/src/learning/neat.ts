/**
 * @file neat.ts
 * @module @aetheria/engine/learning/neat
 * @description NeuroEvolution of Augmenting Topologies (Stanley & Miikkulainen
 * 2002) cho agent game, cài đặt tự chứa không phụ thuộc `NeuralNetwork` vì
 * quần thể có cấu trúc topology biến đổi:
 *
 * - Genome gồm node gene (input/hidden/output + activation) và connection gene
 *   có số hiệu innovation toàn cục (historical markings) để căn chéo khi lai.
 * - Đột biến: trọng số (perturb/reset), thêm kết nối (chặn chu trình), thêm
 *   node (tách kết nối hiện có).
 * - Lai căn chỉnh theo innovation: gene trùng số hiệu lấy ngẫu nhiên từ cha/mẹ,
 *   gene disjoint/excess lấy từ cha khỏe hơn.
 * - Speciation theo khoảng cách tương thích + fitness sharing + diệt loài
 *   đình trệ.
 *
 * Dùng cho bài toán không có gradient (fitness do game tự định nghĩa: điểm số,
 * thời gian sống, nhiệm vụ hoàn thành...). Chú thích tiếng Việt theo quy ước.
 */

import { DeepRandom, clampRange } from '../deeplearning/random.js';

/** Loại node trong genome NEAT. */
export type NeatNodeKind = 'input' | 'hidden' | 'output';

/** Activation hỗ trợ cho node NEAT. */
export type NeatActivation = 'sigmoid' | 'tanh' | 'relu' | 'linear' | 'gauss';

/** Một node gene. */
export interface NeatNodeGene {
  id: number;
  kind: NeatNodeKind;
  activation: NeatActivation;
}

/** Một connection gene; `innovation` là số hiệu toàn cục của cấu trúc này. */
export interface NeatConnectionGene {
  innovation: number;
  from: number;
  to: number;
  weight: number;
  enabled: boolean;
}

/** Genome NEAT: tập node + tập kết nối. */
export interface NeatGenome {
  nodes: NeatNodeGene[];
  connections: NeatConnectionGene[];
}

/** Cấu hình NEAT. */
export interface NeatConfig {
  inputSize: number;
  outputSize: number;
  /** Kích thước quần thể; mặc định 150. */
  populationSize?: number;
  /** Tỉ lệ genome khỏe nhất được làm cha mẹ; mặc định 0.4. */
  survivalRate?: number;
  /** Số cá thể ưu tú chép nguyên mỗi loài mỗi thế hệ; mặc định 1. */
  elitismPerSpecies?: number;
  /** Xác suất con sinh ra bằng lai (ngược lại là nhân bản + đột biến); mặc định 0.75. */
  crossoverRate?: number;
  /** Xác suất đột biến trọng số mỗi gene; mặc định 0.8. */
  weightMutationRate?: number;
  /** Độ lệch chuẩn perturb trọng số; mặc định 0.5. */
  weightMutationPower?: number;
  /** Xác suất reset trọng số về giá trị ngẫu nhiên khi đột biến; mặc định 0.1. */
  weightResetRate?: number;
  /** Xác suất đột biến thêm kết nối mỗi cá thể; mặc định 0.05. */
  addConnectionRate?: number;
  /** Xác suất đột biến thêm node mỗi cá thể; mặc định 0.03. */
  addNodeRate?: number;
  /** Ngưỡng khoảng cách tương thích để vào cùng loài; mặc định 3. */
  compatibilityThreshold?: number;
  /** Hệ số excess/disjoint/weight trong khoảng cách tương thích. */
  excessCoef?: number;
  disjointCoef?: number;
  weightCoef?: number;
  /** Số thế hệ không cải thiện trước khi bị giải thể; mặc định 15. */
  maxStagnation?: number;
  seed?: number;
}

/** Kết quả một thế hệ tiến hóa. */
export interface NeatGenerationResult {
  generation: number;
  bestFitness: number;
  meanFitness: number;
  speciesCount: number;
  /** Genome tốt nhất thế hệ (đã đánh giá). */
  bestGenome: NeatGenome;
}

/** Trạng thái một loài (dùng nội bộ và snapshot). */
export interface NeatSpeciesState {
  id: number;
  representative: NeatGenome;
  bestFitness: number;
  stagnation: number;
  memberIds: number[];
}

/** Snapshot toàn bộ trạng thái NEAT để lưu checkpoint. */
export interface NeatSnapshot {
  config: NeatConfig;
  population: NeatGenome[];
  fitness: number[];
  species: NeatSpeciesState[];
  innovations: Array<{ key: string; innovation: number }>;
  nextNodeId: number;
  nextInnovation: number;
  nextSpeciesId: number;
  generation: number;
  bestFitness: number;
  bestGenome: NeatGenome | null;
}

/** Áp activation cho giá trị trước activation. */
function applyNeatActivation(value: number, activation: NeatActivation): number {
  switch (activation) {
    case 'tanh':
      return Math.tanh(value);
    case 'relu':
      return value > 0 ? value : 0;
    case 'linear':
      return value;
    case 'gauss':
      return Math.exp(-value * value);
    case 'sigmoid':
    default:
      return 1 / (1 + Math.exp(-clampRange(value, -60, 60)));
  }
}

/**
 * Bộ đánh giá feedforward của một genome NEAT.
 *
 * Thứ tự tính được sắp topo mỗi lần cấu trúc đổi; NEAT chuẩn chỉ sinh mạng
 * feedforward (thêm kết nối bị chặn nếu tạo chu trình) nên thứ tự topo luôn tồn tại.
 */
export class NeatNetwork {
  public readonly genome: NeatGenome;
  public readonly inputSize: number;
  public readonly outputSize: number;

  private evaluationOrder: number[] | null = null;
  private readonly incoming = new Map<number, NeatConnectionGene[]>();

  constructor(genome: NeatGenome, inputSize: number, outputSize: number) {
    this.genome = genome;
    this.inputSize = inputSize;
    this.outputSize = outputSize;
  }

  /** Chạy mạng trên vector input; trả vector output. */
  public activate(inputs: readonly number[]): number[] {
    if (inputs.length !== this.inputSize) {
      throw new RangeError(`NEAT cần ${this.inputSize} input, nhận ${inputs.length}`);
    }
    this.ensureOrder();
    const values = new Map<number, number>();
    const nodeById = new Map<number, NeatNodeGene>();
    for (const node of this.genome.nodes) nodeById.set(node.id, node);
    for (let i = 0; i < this.inputSize; i++) {
      const nodeId = this.genome.nodes[i]?.id ?? i;
      values.set(nodeId, inputs[i] ?? 0);
    }

    for (const nodeId of this.evaluationOrder ?? []) {
      const node = nodeById.get(nodeId);
      if (!node || node.kind === 'input') continue;
      let sum = 0;
      for (const connection of this.incoming.get(nodeId) ?? []) {
        if (!connection.enabled) continue;
        sum += connection.weight * (values.get(connection.from) ?? 0);
      }
      values.set(nodeId, applyNeatActivation(sum, node.activation));
    }

    const outputs: number[] = [];
    for (let o = 0; o < this.outputSize; o++) {
      const node = this.genome.nodes[this.inputSize + o];
      outputs.push(node ? (values.get(node.id) ?? 0) : 0);
    }
    return outputs;
  }

  /** Hành động argmax (tiện cho policy rời rạc). */
  public bestAction(inputs: readonly number[]): number {
    const outputs = this.activate(inputs);
    let best = 0;
    for (let i = 1; i < outputs.length; i++) {
      if ((outputs[i] ?? 0) > (outputs[best] ?? 0)) best = i;
    }
    return best;
  }

  /** Dựng thứ tự topo và danh sách kết nối vào nếu genome vừa đổi. */
  private ensureOrder(): void {
    if (this.evaluationOrder) return;
    this.incoming.clear();
    for (const connection of this.genome.connections) {
      if (!connection.enabled) continue;
      const list = this.incoming.get(connection.to) ?? [];
      list.push(connection);
      this.incoming.set(connection.to, list);
    }
    // Kahn topological sort trên đồ thị node.
    const inDegree = new Map<number, number>();
    const outgoing = new Map<number, number[]>();
    for (const node of this.genome.nodes) {
      inDegree.set(node.id, 0);
      outgoing.set(node.id, []);
    }
    for (const connection of this.genome.connections) {
      if (!connection.enabled) continue;
      if (!inDegree.has(connection.from) || !inDegree.has(connection.to)) continue;
      inDegree.set(connection.to, (inDegree.get(connection.to) ?? 0) + 1);
      outgoing.get(connection.from)?.push(connection.to);
    }
    const queue = [...inDegree.entries()]
      .filter(([, degree]) => degree === 0)
      .map(([id]) => id);
    const order: number[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift() ?? 0;
      order.push(nodeId);
      for (const next of outgoing.get(nodeId) ?? []) {
        const degree = (inDegree.get(next) ?? 0) - 1;
        inDegree.set(next, degree);
        if (degree === 0) queue.push(next);
      }
    }
    // Node không tới được do chu trình (không thể xảy ra với đột biến an toàn)
    // vẫn được thêm cuối để không mất output.
    for (const node of this.genome.nodes) {
      if (!order.includes(node.id)) order.push(node.id);
    }
    this.evaluationOrder = order;
  }
}

/**
 * NEAT: tiến hóa quần thể genome với speciation và historical markings.
 *
 * Vòng lặp: `runGeneration(evaluate)` — hàm `evaluate` do game cung cấp, nhận
 * `NeatNetwork` và trả fitness. Sau đánh giá, quần thể được phân loài, chọn lọc
 * theo fitness chia sẻ, lai và đột biến cho thế hệ kế tiếp.
 */
export class NEATTrainer {
  public readonly config: Required<
    Pick<
      NeatConfig,
      | 'inputSize'
      | 'outputSize'
      | 'populationSize'
      | 'survivalRate'
      | 'elitismPerSpecies'
      | 'crossoverRate'
      | 'weightMutationRate'
      | 'weightMutationPower'
      | 'weightResetRate'
      | 'addConnectionRate'
      | 'addNodeRate'
      | 'compatibilityThreshold'
      | 'excessCoef'
      | 'disjointCoef'
      | 'weightCoef'
      | 'maxStagnation'
    >
  >;

  public generation = 0;
  public bestFitness = -Infinity;
  public bestGenome: NeatGenome | null = null;

  private population: NeatGenome[];
  private fitness: number[];
  private species: NeatSpeciesState[] = [];
  private readonly innovationMap = new Map<string, number>();
  private nextInnovation = 0;
  private nextNodeId: number;
  private nextSpeciesId = 0;
  private readonly random: DeepRandom;

  constructor(config: NeatConfig) {
    if (config.inputSize <= 0) throw new RangeError('NEAT cần inputSize dương');
    if (config.outputSize <= 0) throw new RangeError('NEAT cần outputSize dương');
    this.random = new DeepRandom(config.seed ?? 1);
    this.config = {
      inputSize: config.inputSize,
      outputSize: config.outputSize,
      populationSize: Math.max(4, Math.floor(config.populationSize ?? 150)),
      survivalRate: clampRange(config.survivalRate ?? 0.4, 0.05, 1),
      elitismPerSpecies: Math.max(0, Math.floor(config.elitismPerSpecies ?? 1)),
      crossoverRate: clampRange(config.crossoverRate ?? 0.75, 0, 1),
      weightMutationRate: clampRange(config.weightMutationRate ?? 0.8, 0, 1),
      weightMutationPower: Math.max(0, config.weightMutationPower ?? 0.5),
      weightResetRate: clampRange(config.weightResetRate ?? 0.1, 0, 1),
      addConnectionRate: clampRange(config.addConnectionRate ?? 0.05, 0, 1),
      addNodeRate: clampRange(config.addNodeRate ?? 0.03, 0, 1),
      compatibilityThreshold: Math.max(0.1, config.compatibilityThreshold ?? 3),
      excessCoef: Math.max(0, config.excessCoef ?? 1),
      disjointCoef: Math.max(0, config.disjointCoef ?? 1),
      weightCoef: Math.max(0, config.weightCoef ?? 0.4),
      maxStagnation: Math.max(1, Math.floor(config.maxStagnation ?? 15)),
    };
    this.nextNodeId = this.config.inputSize + this.config.outputSize;
    this.population = Array.from({ length: this.config.populationSize }, () =>
      this.createMinimalGenome(),
    );
    this.fitness = new Array<number>(this.config.populationSize).fill(0);
  }

  /** Số cá thể hiện tại. */
  public get populationSize(): number {
    return this.population.length;
  }

  /** Quan sát quần thể hiện tại (bất biến đối với người gọi). */
  public currentPopulation(): readonly NeatGenome[] {
    return this.population;
  }

  /** Fitness lần đánh giá gần nhất theo chỉ số cá thể. */
  public currentFitness(): readonly number[] {
    return this.fitness;
  }

  /**
   * Chạy một thế hệ: đánh giá toàn quần thể, phân loài, chọn lọc, sinh thế hệ mới.
   *
   * @param evaluate Hàm fitness do game cung cấp; được gọi đúng một lần mỗi cá thể.
   */
  public runGeneration(
    evaluate: (network: NeatNetwork, genome: NeatGenome, index: number) => number,
  ): NeatGenerationResult {
    for (let i = 0; i < this.population.length; i++) {
      const genome = this.population[i];
      const network = new NeatNetwork(genome, this.config.inputSize, this.config.outputSize);
      const value = evaluate(network, genome, i);
      this.fitness[i] = Number.isFinite(value) ? value : 0;
    }

    // Cập nhật kỷ lục toàn cục.
    let bestIndex = 0;
    let mean = 0;
    for (let i = 0; i < this.population.length; i++) {
      mean += this.fitness[i];
      if (this.fitness[i] > this.fitness[bestIndex]) bestIndex = i;
    }
    mean /= Math.max(1, this.population.length);
    const bestFitness = this.fitness[bestIndex] ?? 0;
    if (bestFitness > this.bestFitness) {
      this.bestFitness = bestFitness;
      this.bestGenome = this.cloneGenome(this.population[bestIndex]);
    }

    this.speciate();
    const speciesCount = this.species.length;
    this.reproduce();
    this.generation++;

    return {
      generation: this.generation,
      bestFitness,
      meanFitness: mean,
      speciesCount,
      bestGenome: this.cloneGenome(this.population[bestIndex]),
    };
  }

  /** Chạy nhiều thế hệ liên tiếp. */
  public run(generations: number, evaluate: (network: NeatNetwork, genome: NeatGenome, index: number) => number): NeatGenerationResult[] {
    const results: NeatGenerationResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(generations)); i++) {
      results.push(this.runGeneration(evaluate));
    }
    return results;
  }

  /** Ảnh chụp toàn bộ trạng thái để lưu checkpoint. */
  public snapshot(): NeatSnapshot {
    return {
      config: { ...this.config },
      population: this.population.map((genome) => this.cloneGenome(genome)),
      fitness: [...this.fitness],
      species: this.species.map((species) => ({
        ...species,
        representative: this.cloneGenome(species.representative),
        memberIds: [...species.memberIds],
      })),
      innovations: [...this.innovationMap.entries()].map(([key, innovation]) => ({ key, innovation })),
      nextNodeId: this.nextNodeId,
      nextInnovation: this.nextInnovation,
      nextSpeciesId: this.nextSpeciesId,
      generation: this.generation,
      bestFitness: this.bestFitness,
      bestGenome: this.bestGenome ? this.cloneGenome(this.bestGenome) : null,
    };
  }

  /** Khôi phục NEAT từ checkpoint. */
  public static fromSnapshot(snapshot: NeatSnapshot): NEATTrainer {
    const trainer = new NEATTrainer(snapshot.config);
    trainer.population = snapshot.population.map((genome) => trainer.cloneGenome(genome));
    trainer.fitness = [...snapshot.fitness];
    trainer.species = snapshot.species.map((species) => ({
      ...species,
      representative: trainer.cloneGenome(species.representative),
      memberIds: [...species.memberIds],
    }));
    for (const entry of snapshot.innovations) {
      trainer.innovationMap.set(entry.key, entry.innovation);
    }
    trainer.nextNodeId = snapshot.nextNodeId;
    trainer.nextInnovation = snapshot.nextInnovation;
    trainer.nextSpeciesId = snapshot.nextSpeciesId;
    trainer.generation = snapshot.generation;
    trainer.bestFitness = snapshot.bestFitness;
    trainer.bestGenome = snapshot.bestGenome ? trainer.cloneGenome(snapshot.bestGenome) : null;
    return trainer;
  }

  /** Genome tối giản: input nối thẳng output, không hidden. */
  private createMinimalGenome(): NeatGenome {
    const nodes: NeatNodeGene[] = [];
    for (let i = 0; i < this.config.inputSize; i++) {
      nodes.push({ id: i, kind: 'input', activation: 'linear' });
    }
    for (let o = 0; o < this.config.outputSize; o++) {
      nodes.push({
        id: this.config.inputSize + o,
        kind: 'output',
        activation: 'sigmoid',
      });
    }
    const connections: NeatConnectionGene[] = [];
    for (let i = 0; i < this.config.inputSize; i++) {
      for (let o = 0; o < this.config.outputSize; o++) {
        connections.push({
          innovation: this.claimInnovation(i, this.config.inputSize + o),
          from: i,
          to: this.config.inputSize + o,
          weight: this.random.gaussian(0, 0.5),
          enabled: true,
        });
      }
    }
    return { nodes, connections };
  }

  /** Lấy số hiệu innovation cho cặp (from, to); tạo mới nếu chưa có. */
  private claimInnovation(from: number, to: number): number {
    const key = `${from}->${to}`;
    const existing = this.innovationMap.get(key);
    if (existing !== undefined) return existing;
    const innovation = this.nextInnovation++;
    this.innovationMap.set(key, innovation);
    return innovation;
  }

  /** Phân loài theo khoảng cách tương thích, cập nhật đình trệ. */
  private speciate(): void {
    for (const species of this.species) {
      species.memberIds = [];
    }
    for (let i = 0; i < this.population.length; i++) {
      const genome = this.population[i];
      let assigned = false;
      for (const species of this.species) {
        if (this.compatibilityDistance(genome, species.representative) < this.config.compatibilityThreshold) {
          species.memberIds.push(i);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        this.species.push({
          id: this.nextSpeciesId++,
          representative: this.cloneGenome(genome),
          bestFitness: -Infinity,
          stagnation: 0,
          memberIds: [i],
        });
      }
    }
    // Cập nhật đình trệ: loài không vượt kỷ lục cũ thì tăng bộ đếm.
    for (const species of this.species) {
      if (species.memberIds.length === 0) continue;
      let best = -Infinity;
      for (const memberId of species.memberIds) {
        best = Math.max(best, this.fitness[memberId] ?? 0);
      }
      if (best > species.bestFitness + 1e-9) {
        species.bestFitness = best;
        species.stagnation = 0;
      } else {
        species.stagnation++;
      }
    }
    // Loài đình trệ bị giải thể (nếu còn loài khác sống).
    this.species = this.species.filter(
      (species) => species.stagnation < this.config.maxStagnation || this.species.length === 1,
    );
  }

  /** Sinh thế hệ mới từ các loài theo fitness sharing. */
  private reproduce(): void {
    const alive = this.species.filter((species) => species.memberIds.length > 0);
    if (alive.length === 0) {
      // Bất thường: phục hồi bằng cách phân loài lại từ quần thể hiện tại.
      this.species = [];
      this.speciate();
      return;
    }
    // Loại loài chỉ còn số lượng quá nhỏ và kém nhất nếu dư.
    alive.sort((a, b) => b.bestFitness - a.bestFitness);

    const adjustedTotal = alive.reduce(
      (sum, species) => sum + species.memberIds.reduce((s, id) => s + (this.fitness[id] ?? 0), 0) / species.memberIds.length,
      0,
    );
    const target = this.config.populationSize;
    const offspring: NeatGenome[] = [];

    for (const species of alive) {
      const speciesMean =
        species.memberIds.reduce((sum, id) => sum + (this.fitness[id] ?? 0), 0) / species.memberIds.length;
      // Chia suất theo fitness sharing; làm tròn thay vì floor và giữ tối thiểu
      // 2 suất để loài chứa champion luôn có con lai/đột biến cải thiện thay vì
      // chỉ clone ưu tú rồi đứng yên.
      const rawShare = adjustedTotal > 0
        ? (speciesMean / adjustedTotal) * target
        : target / alive.length;
      const share = Math.max(2, Math.round(rawShare));
      const ranked = [...species.memberIds].sort(
        (a, b) => (this.fitness[b] ?? 0) - (this.fitness[a] ?? 0),
      );
      const survivors = Math.max(
        1,
        Math.ceil(ranked.length * this.config.survivalRate),
      );
      const parents = ranked.slice(0, survivors);

      // Ưu tú: chép nguyên cá thể khỏe nhất.
      let produced = 0;
      while (produced < this.config.elitismPerSpecies && produced < share && produced < parents.length) {
        offspring.push(this.cloneGenome(this.population[parents[produced]]));
        produced++;
      }
      while (produced < share) {
        const parentA = parents[this.random.int(0, parents.length - 1)];
        const useCrossover = parents.length > 1 && this.random.chance(this.config.crossoverRate);
        const child = useCrossover
          ? this.crossover(
              this.population[parentA],
              this.population[parents[this.random.int(0, parents.length - 1)]],
            )
          : this.cloneGenome(this.population[parentA]);
        this.mutate(child);
        offspring.push(child);
        produced++;
      }
    }

    // Bổ sung/thu hẹp về đúng kích thước quần thể.
    while (offspring.length < target) {
      const fallbackSpecies = alive[0];
      const parent = fallbackSpecies.memberIds[this.random.int(0, fallbackSpecies.memberIds.length - 1)];
      const child = this.cloneGenome(this.population[parent]);
      this.mutate(child);
      offspring.push(child);
    }
    this.population = offspring.slice(0, target);
    this.fitness = new Array<number>(this.population.length).fill(0);
  }

  /** Khoảng cách tương thích giữa hai genome. */
  private compatibilityDistance(a: NeatGenome, b: NeatGenome): number {
    const maxInnovationA = Math.max(-1, ...a.connections.map((gene) => gene.innovation));
    const maxInnovationB = Math.max(-1, ...b.connections.map((gene) => gene.innovation));
    const matchingA = new Map<number, NeatConnectionGene>();
    for (const gene of a.connections) matchingA.set(gene.innovation, gene);

    let disjoint = 0;
    let excess = 0;
    let weightDiffSum = 0;
    let matching = 0;
    for (const gene of b.connections) {
      const other = matchingA.get(gene.innovation);
      if (other === undefined) {
        if (gene.innovation > maxInnovationA) excess++;
        else disjoint++;
        continue;
      }
      matching++;
      weightDiffSum += Math.abs(other.weight - gene.weight);
    }
    for (const gene of a.connections) {
      const existsInB = b.connections.some((item) => item.innovation === gene.innovation);
      if (!existsInB) {
        if (gene.innovation > maxInnovationB) excess++;
        else disjoint++;
      }
    }
    const maxSize = Math.max(a.connections.length, b.connections.length, 1);
    const meanWeightDiff = matching > 0 ? weightDiffSum / matching : 0;
    return (
      (this.config.excessCoef * excess) / maxSize +
      (this.config.disjointCoef * disjoint) / maxSize +
      this.config.weightCoef * meanWeightDiff
    );
  }

  /** Lai hai genome theo innovation alignment. */
  private crossover(a: NeatGenome, b: NeatGenome): NeatGenome {
    const byInnovationA = new Map<number, NeatConnectionGene>();
    const byInnovationB = new Map<number, NeatConnectionGene>();
    for (const gene of a.connections) byInnovationA.set(gene.innovation, gene);
    for (const gene of b.connections) byInnovationB.set(gene.innovation, gene);
    const allInnovations = [...new Set([...byInnovationA.keys(), ...byInnovationB.keys()])].sort(
      (x, y) => x - y,
    );
    const maxInnovationA = Math.max(-1, ...a.connections.map((gene) => gene.innovation));

    const connections: NeatConnectionGene[] = [];
    for (const innovation of allInnovations) {
      const geneA = byInnovationA.get(innovation);
      const geneB = byInnovationB.get(innovation);
      if (geneA && geneB) {
        const source = this.random.chance(0.5) ? geneA : geneB;
        // Gene bị tắt chỉ di truyền nếu cả hai cùng tắt (quy ước NEAT chuẩn).
        const enabled = geneA.enabled && geneB.enabled ? true : this.random.chance(0.75);
        connections.push({ ...source, enabled });
      } else if (geneA && maxInnovationA >= innovation) {
        connections.push({ ...geneA });
      } else if (geneA) {
        // Gene excess của a (a khỏe hơn theo cách gọi hiện tại).
        connections.push({ ...geneA });
      } else if (geneB) {
        // Gene chỉ có ở b: giữ nếu b khỏe hơn được quyết định tại caller —
        // ở đây an toàn là bỏ qua gene excess của bố yếu hơn.
        continue;
      }
    }
    // Node: hợp các node được tham chiếu.
    const nodeById = new Map<number, NeatNodeGene>();
    for (const gene of [a, b]) {
      for (const node of gene.nodes) {
        if (!nodeById.has(node.id)) nodeById.set(node.id, node);
      }
    }
    const used = new Set<number>();
    for (const gene of connections) {
      used.add(gene.from);
      used.add(gene.to);
    }
    const nodes = [...nodeById.values()]
      .filter((node) => node.kind !== 'hidden' || used.has(node.id))
      .sort((x, y) => x.id - y.id);
    return { nodes, connections };
  }

  /** Đột biến genome tại chỗ: trọng số, thêm kết nối, thêm node. */
  private mutate(genome: NeatGenome): void {
    // Đột biến trọng số.
    for (const gene of genome.connections) {
      if (!this.random.chance(this.config.weightMutationRate)) continue;
      if (this.random.chance(this.config.weightResetRate)) {
        gene.weight = this.random.gaussian(0, this.config.weightMutationPower);
      } else {
        gene.weight += this.random.gaussian(0, this.config.weightMutationPower);
      }
    }
    // Thêm kết nối mới (chặn chu trình và trùng lặp).
    if (this.random.chance(this.config.addConnectionRate)) {
      this.mutateAddConnection(genome);
    }
    // Thêm node: tách một kết nối enabled thành hai qua node mới.
    if (this.random.chance(this.config.addNodeRate)) {
      this.mutateAddNode(genome);
    }
  }

  /** Thêm một kết nối không tạo chu trình. */
  private mutateAddConnection(genome: NeatGenome): void {
    const nonInput = genome.nodes.filter((node) => node.kind !== 'input');
    const candidates = genome.nodes.filter((node) => node.kind !== 'output');
    if (nonInput.length === 0 || candidates.length === 0) return;
    for (let attempt = 0; attempt < 12; attempt++) {
      const from = candidates[this.random.int(0, candidates.length - 1)];
      const to = nonInput[this.random.int(0, nonInput.length - 1)];
      if (from.id === to.id) continue;
      const exists = genome.connections.some(
        (gene) => gene.from === from.id && gene.to === to.id,
      );
      if (exists) continue;
      if (this.wouldCreateCycle(genome, from.id, to.id)) continue;
      genome.connections.push({
        innovation: this.claimInnovation(from.id, to.id),
        from: from.id,
        to: to.id,
        weight: this.random.gaussian(0, 0.5),
        enabled: true,
      });
      return;
    }
  }

  /** Tách một kết nối enabled bằng node mới. */
  private mutateAddNode(genome: NeatGenome): void {
    const enabled = genome.connections.filter((gene) => gene.enabled);
    if (enabled.length === 0) return;
    const target = enabled[this.random.int(0, enabled.length - 1)];
    target.enabled = false;
    const newNode: NeatNodeGene = {
      id: this.nextNodeId++,
      kind: 'hidden',
      activation: 'sigmoid',
    };
    genome.nodes.push(newNode);
    genome.connections.push({
      innovation: this.claimInnovation(target.from, newNode.id),
      from: target.from,
      to: newNode.id,
      weight: 1,
      enabled: true,
    });
    genome.connections.push({
      innovation: this.claimInnovation(newNode.id, target.to),
      from: newNode.id,
      to: target.to,
      weight: target.weight,
      enabled: true,
    });
  }

  /** Kiểm tra thêm cạnh from→to có tạo chu trình trong đồ thị hiện tại không. */
  private wouldCreateCycle(genome: NeatGenome, from: number, to: number): boolean {
    if (from === to) return true;
    const outgoing = new Map<number, number[]>();
    for (const gene of genome.connections) {
      if (!gene.enabled) continue;
      const list = outgoing.get(gene.from) ?? [];
      list.push(gene.to);
      outgoing.set(gene.from, list);
    }
    // DFS từ `to`: nếu chạm được `from` thì thêm cạnh from→to tạo chu trình.
    const stack = [to];
    const visited = new Set<number>();
    while (stack.length > 0) {
      const node = stack.pop() ?? 0;
      if (node === from) return true;
      if (visited.has(node)) continue;
      visited.add(node);
      for (const next of outgoing.get(node) ?? []) stack.push(next);
    }
    return false;
  }

  /** Bản sao sâu genome. */
  private cloneGenome(genome: NeatGenome): NeatGenome {
    return {
      nodes: genome.nodes.map((node) => ({ ...node })),
      connections: genome.connections.map((gene) => ({ ...gene })),
    };
  }
}
