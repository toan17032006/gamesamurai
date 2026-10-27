/**
 * @file hyperneat.ts
 * @module @aetheria/engine/learning/hyperneat
 * @description HyperNEAT (Stanley, D'Ambrosio & Gauci 2009) mở rộng từ NEAT:
 *
 * - **CPPN** (Compositional Pattern Producing Network): mạng nơ-ron tiến hóa
 *   bằng `NEATTrainer`, nhận tọa độ hình học của hai node substrate
 *   `(x₁, y₁, x₂, y₂, |Δx|, |Δy|, bias)` và trả về `(trọng số, cổng)`.
 * - **Substrate**: mạng feedforward cố định theo tầng, mỗi node có vị trí hình
 *   học; trọng số kết nối giữa hai tầng liền kề được *tra từ CPPN* — nhờ đó
 *   biểu hiện (phenotype) tận dụng cấu trúc hình học (regularity, symmetry).
 *
 * Phenotype được dựng lại từ CPPN mỗi lần đánh giá; fitness do game cung cấp
 * như NEAT thường. Chú thích tiếng Việt theo quy ước dự án.
 */

import {
  NEATTrainer,
  NeatNetwork,
  type NeatConfig,
  type NeatGenome,
  type NeatSnapshot,
} from './neat.js';

/** Vị trí hình học của một node substrate trong [0, 1]². */
export interface SubstratePosition {
  x: number;
  y: number;
}

/** Định nghĩa substrate cố định. */
export interface SubstrateDefinition {
  /** Số node mỗi tầng; tầng 0 = input, tầng cuối = output. */
  layerSizes: readonly number[];
  /**
   * Vị trí từng node theo tầng; nếu bỏ qua sẽ tự sinh lưới đều
   * (x theo tầng trải đều, y trải đều trong tầng).
   */
  positions?: readonly (readonly SubstratePosition[])[];
  /** Ngưỡng bật kết nối theo |đầu ra trọng số CPPN|; mặc định 0.2. */
  connectionThreshold?: number;
  /** Hệ số nhân trọng số sau khi qua CPPN; mặc định 3. */
  weightScale?: number;
}

/** Cấu hình HyperNEAT. */
export interface HyperNEATConfig {
  substrate: SubstrateDefinition;
  /**
   * Cấu hình NEAT cho CPPN; `inputSize`/`outputSize` bị ghi đè: input = 7
   * (tọa độ + khoảng cách + bias), output = 2 (trọng số, cổng).
   */
  cppn: Omit<NeatConfig, 'inputSize' | 'outputSize'>;
}

/** Kết quả một thế hệ HyperNEAT. */
export interface HyperNEATGenerationResult {
  generation: number;
  bestFitness: number;
  meanFitness: number;
  speciesCount: number;
}

/** Ảnh chụp toàn bộ HyperNEAT (CPPN + substrate). */
export interface HyperNEATSnapshot {
  cppn: NeatSnapshot;
  substrate: {
    layerSizes: number[];
    positions: SubstratePosition[][];
    connectionThreshold: number;
    weightScale: number;
  };
}

/** Mạng substrate đã dựng trọng số từ CPPN. */
export class HyperNEATNetwork {
  public readonly layerSizes: readonly number[];
  /** `weights[layer][from][to]` — trọng số giữa tầng `layer` và `layer+1`. */
  public readonly weights: number[][][];

  constructor(layerSizes: readonly number[], weights: number[][][]) {
    this.layerSizes = [...layerSizes];
    this.weights = weights;
  }

  /** Chạy substrate trên vector input (tầng ẩn/ra dùng tanh). */
  public activate(inputs: readonly number[]): number[] {
    const firstLayer = this.layerSizes[0] ?? 0;
    if (inputs.length !== firstLayer) {
      throw new RangeError(`Substrate cần ${firstLayer} input, nhận ${inputs.length}`);
    }
    let current = [...inputs];
    for (let l = 0; l < this.weights.length; l++) {
      const nextSize = this.layerSizes[l + 1] ?? 0;
      const next = new Array<number>(nextSize).fill(0);
      for (let to = 0; to < nextSize; to++) {
        let sum = 0;
        for (let from = 0; from < current.length; from++) {
          sum += this.weights[l][from][to] * (current[from] ?? 0);
        }
        next[to] = Math.tanh(sum);
      }
      current = next;
    }
    return current;
  }
}

/** Thông tin substrate đã chuẩn hóa (sau khi dựng vị trí mặc định). */
interface NormalizedSubstrate {
  layerSizes: number[];
  positions: SubstratePosition[][];
  connectionThreshold: number;
  weightScale: number;
}

/**
 * HyperNEAT: tiến hóa CPPN rồi biểu hiện thành mạng substrate.
 *
 * Vòng lặp giống NEAT nhưng fitness nhận một `HyperNEATNetwork` (substrate đã
 * dựng) thay vì genome thô — game đánh giá hành vi của phenotype.
 */
export class HyperNEATTrainer {
  public readonly substrate: NormalizedSubstrate;

  private cppn: NEATTrainer;

  constructor(config: HyperNEATConfig) {
    if (config.substrate.layerSizes.length < 2) {
      throw new RangeError('Substrate cần ít nhất 2 tầng');
    }
    if (config.substrate.layerSizes.some((size) => size <= 0)) {
      throw new RangeError('Mỗi tầng substrate phải có ít nhất 1 node');
    }
    const layerSizes = [...config.substrate.layerSizes];
    const positions = config.substrate.positions
      ? config.substrate.positions.map((layer) => layer.map((point) => ({ ...point })))
      : defaultPositions(layerSizes);
    this.substrate = {
      layerSizes,
      positions,
      connectionThreshold: Math.max(0, config.substrate.connectionThreshold ?? 0.2),
      weightScale: Math.max(0, config.substrate.weightScale ?? 3),
    };
    this.cppn = new NEATTrainer({ ...config.cppn, inputSize: 7, outputSize: 2 });
  }

  /** Bộ tiến hóa CPPN bên dưới (để telemetry: generation, bestFitness...). */
  public get cppnTrainer(): NEATTrainer {
    return this.cppn;
  }

  /** Fitness tốt nhất ghi nhận được. */
  public get bestFitness(): number {
    return this.cppn.bestFitness;
  }

  /** Dựng phenotype substrate từ một genome CPPN. */
  public expressPhenotype(genome: NeatGenome): HyperNEATNetwork {
    const cppn = new NeatNetwork(genome, 7, 2);
    const { layerSizes, positions, connectionThreshold, weightScale } = this.substrate;
    const weights: number[][][] = [];
    for (let layer = 0; layer < layerSizes.length - 1; layer++) {
      const fromLayer = positions[layer];
      const toLayer = positions[layer + 1];
      const matrix: number[][] = [];
      for (const from of fromLayer) {
        const row = new Array<number>(toLayer.length).fill(0);
        for (let to = 0; to < toLayer.length; to++) {
          const target = toLayer[to];
          // Đầu vào CPPN: tọa độ hai đầu, khoảng cách và bias.
          const response = cppn.activate([
            from.x,
            from.y,
            target.x,
            target.y,
            Math.abs(from.x - target.x),
            Math.abs(from.y - target.y),
            1,
          ]);
          const rawWeight = response[0] ?? 0;
          row[to] = Math.abs(rawWeight) > connectionThreshold ? rawWeight * weightScale : 0;
        }
        matrix.push(row);
      }
      weights.push(matrix);
    }
    return new HyperNEATNetwork(layerSizes, weights);
  }

  /**
   * Chạy một thế hệ: biểu hiện toàn quần thể thành substrate, gọi `evaluate`
   * cho từng phenotype, rồi tiến hóa CPPN như NEAT thường.
   */
  public runGeneration(
    evaluate: (network: HyperNEATNetwork, index: number) => number,
  ): HyperNEATGenerationResult {
    const result = this.cppn.runGeneration((_cppn, genome, index) => {
      const phenotype = this.expressPhenotype(genome);
      const value = evaluate(phenotype, index);
      return Number.isFinite(value) ? value : 0;
    });
    return {
      generation: result.generation,
      bestFitness: result.bestFitness,
      meanFitness: result.meanFitness,
      speciesCount: result.speciesCount,
    };
  }

  /** Chạy nhiều thế hệ liên tiếp. */
  public run(
    generations: number,
    evaluate: (network: HyperNEATNetwork, index: number) => number,
  ): HyperNEATGenerationResult[] {
    const results: HyperNEATGenerationResult[] = [];
    for (let i = 0; i < Math.max(0, Math.floor(generations)); i++) {
      results.push(this.runGeneration(evaluate));
    }
    return results;
  }

  /** Ảnh chụp toàn bộ trạng thái (NEAT của CPPN + substrate). */
  public snapshot(): HyperNEATSnapshot {
    return {
      cppn: this.cppn.snapshot(),
      substrate: {
        layerSizes: [...this.substrate.layerSizes],
        positions: this.substrate.positions.map((layer) => layer.map((point) => ({ ...point }))),
        connectionThreshold: this.substrate.connectionThreshold,
        weightScale: this.substrate.weightScale,
      },
    };
  }

  /** Khôi phục HyperNEAT từ checkpoint. */
  public static fromSnapshot(snapshot: HyperNEATSnapshot): HyperNEATTrainer {
    const trainer = new HyperNEATTrainer({
      substrate: {
        layerSizes: snapshot.substrate.layerSizes,
        positions: snapshot.substrate.positions,
        connectionThreshold: snapshot.substrate.connectionThreshold,
        weightScale: snapshot.substrate.weightScale,
      },
      cppn: snapshot.cppn.config,
    });
    trainer.cppn = NEATTrainer.fromSnapshot(snapshot.cppn);
    return trainer;
  }
}

/** Tự sinh vị trí lưới đều cho từng tầng. */
function defaultPositions(layerSizes: readonly number[]): SubstratePosition[][] {
  const layerCount = layerSizes.length;
  return layerSizes.map((size, layer) => {
    const x = layerCount > 1 ? layer / (layerCount - 1) : 0.5;
    return Array.from({ length: size }, (_, index) => ({
      x,
      y: (index + 1) / (size + 1),
    }));
  });
}
