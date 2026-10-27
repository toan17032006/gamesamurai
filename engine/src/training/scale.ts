/**
 * @file scale.ts
 * @module @aetheria/engine/training/scale
 * @description Runner chiến dịch train QUY MÔ LỚN — mục tiêu hàng tỉ lượt,
 * KHÔNG ăn bớt quy trình:
 *
 * - Chạy theo **batch**: mỗi batch N iterations qua MassTrainingLoop (full
 *   noise filters + blueprint retrain + statistical verify) — hết ngân sách
 *   thời gian batch thì dừng, persist, batch sau chạy tiếp.
 * - **Persist sau mỗi batch**: checkpoint + dataset chunk ghi ra
 *   `assets/training/_optimized/` — tắt engine mất điện cũng resume được.
 * - **Resume**: `restoreFromRoot(root)` đọc checkpoint, tổng iteration cộng
 *   dồn, train tiếp đúng nơi dừng — hàng tỉ lượt là tổng cộng nhiều phiên.
 * - Toàn bộ quy trình được đếm: accepted + rejected == iterations, filters
 *   áp mỗi iteration, blueprint retrain có log — kiểm chứng được bằng số.
 */

import fs from 'node:fs';
import path from 'node:path';
import { MassTrainingLoop, type MassCheckpoint, type MassRunReport } from './mass-training.js';
import { loadCategoryDataset, type TrainingCategory, type PixelSample } from './dataset.js';

/** Tuỳ chọn chiến dịch. */
export interface MassiveCampaignOptions {
  /** Mục tiêu tổng iteration (mặc định 10^15 — "hàng tỉ" là cột mốc đầu). */
  totalTargetIterations?: number;
  /** Số iteration mỗi batch. */
  batchIterations?: number;
  /** Ngân sách thời gian mỗi batch (ms). */
  maxMsPerBatch?: number;
  /** Số batch tối đa mỗi lần gọi runCampaign (an toàn CI). */
  maxBatches?: number;
  /** Gốc dữ liệu assets/training. */
  root?: string;
  /** Category tham gia chiến dịch (mặc định: mọi category có dữ liệu). */
  categories?: readonly TrainingCategory[];
}

/** Báo cáo một batch. */
export interface BatchReport {
  batchIndex: number;
  report: MassRunReport;
  /** Tổng iteration tích luỹ của chiến dịch sau batch này. */
  campaignTotal: number;
  /** Các file đã persist. */
  persisted: string[];
}

/** Kết quả chiến dịch. */
export interface CampaignResult {
  batches: BatchReport[];
  /** Tổng iteration thực chạy trong lần gọi này. */
  iterationsThisRun: number;
  /** Tổng iteration tích luỹ qua mọi phiên (đọc từ checkpoint). */
  campaignTotal: number;
  targetReached: boolean;
  /** Dataset đã persist ở đâu. */
  optimizedRoot: string;
}

const OPTIMIZED_DIR = '_optimized';

/** Đường dẫn thư mục optimized của root. */
export function optimizedRootOf(root: string): string {
  return path.join(root, OPTIMIZED_DIR);
}

/** Ghi checkpoint ra đĩa (thay thế file cũ an toàn). */
export function saveCheckpointFile(root: string, checkpoint: MassCheckpoint): string {
  const dir = optimizedRootOf(root);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'checkpoint.json');
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(checkpoint));
  fs.renameSync(tmp, filePath);
  return filePath;
}

/** Đọc checkpoint từ đĩa; chưa có → null. */
export function loadCheckpointFile(root: string): MassCheckpoint | null {
  const filePath = path.join(optimizedRootOf(root), 'checkpoint.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as MassCheckpoint;
  } catch {
    return null;
  }
}

/** Persist dataset tích luỹ của một category thành chunk JSON mới. */
export function persistDatasetChunk(root: string, category: string, batchIndex: number, pool: ReadonlyArray<{
  aspectRatio: number; relativeArea: number; vertexCount: number; centerHeightRatio: number; solidity: number;
}>): string {
  const dir = path.join(optimizedRootOf(root), category);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `dataset_${String(batchIndex).padStart(4, '0')}.json`);
  fs.writeFileSync(filePath, JSON.stringify({
    source: 'engine_optimized',
    kind: 'shape',
    samples: pool.map((s) => ({
      label: `gen_${batchIndex}_${s.vertexCount}`,
      aspectRatio: s.aspectRatio,
      relativeArea: s.relativeArea,
      vertexCount: s.vertexCount,
      centerHeightRatio: s.centerHeightRatio,
      solidity: s.solidity,
      groundTruth: category,
    })),
  }));
  return filePath;
}

/**
 * Runner chiến dịch quy mô lớn.
 * ```
 * const runner = new MassiveTrainingRunner({ totalTargetIterations: 1e15 });
 * const result = runner.runCampaign(); // chạy theo batch tới target/hết ngân sách
 * // Lần sau: tự resume từ checkpoint — tổng iteration cộng dồn.
 * ```
 */
export class MassiveTrainingRunner {
  public readonly totalTargetIterations: number;
  public readonly batchIterations: number;
  public readonly maxMsPerBatch: number;
  public readonly maxBatches: number;
  public readonly root: string;
  public readonly loop: MassTrainingLoop;
  public campaignTotal = 0;

  constructor(options: MassiveCampaignOptions = {}) {
    this.totalTargetIterations = Math.max(1, Math.floor(options.totalTargetIterations ?? 1e15));
    this.batchIterations = Math.max(100, Math.floor(options.batchIterations ?? 100_000));
    this.maxMsPerBatch = Math.max(100, Math.floor(options.maxMsPerBatch ?? 4000));
    this.maxBatches = Math.max(1, Math.floor(options.maxBatches ?? 64));
    this.root = options.root ?? 'assets/training';
    // Khởi tạo loop + resume từ checkpoint nếu có.
    const saved = loadCheckpointFile(this.root);
    this.loop = new MassTrainingLoop({ seed: 'massive-campaign', retrainEvery: Math.max(1000, Math.floor(this.batchIterations / 10)) });
    if (saved) {
      this.loop.restoreCheckpoint(saved);
      this.campaignTotal = saved.totalIterations;
    }
    // Seed categories từ assets (bổ sung category chưa có trong checkpoint).
    for (const category of this.listSeededCategories(options.categories)) {
      if (this.loop.states.has(category)) continue;
      const dataset = loadCategoryDataset(category, this.root);
      if (dataset.shapeSamples.length > 0) this.loop.seedCategory(category, dataset.shapeSamples);
    }
    // Validate pixel dataset (điểm ảnh đúng) — không ăn bớt quy trình.
    const pixelSamples = options.categories
      ? options.categories.flatMap((c) => loadCategoryDataset(c, this.root).pixelSamples)
      : this.allPixelSamples();
    if (pixelSamples.length > 0) this.loop.addPixelSamples(pixelSamples);
  }

  private allPixelSamples(): PixelSample[] {
    const out: PixelSample[] = [];
    for (const dirEntry of fs.existsSync(this.root) ? fs.readdirSync(this.root, { withFileTypes: true }) : []) {
      if (!dirEntry.isDirectory() || dirEntry.name.startsWith('_')) continue;
      out.push(...loadCategoryDataset(dirEntry.name as TrainingCategory, this.root).pixelSamples);
    }
    return out;
  }

  private listSeededCategories(explicit?: readonly TrainingCategory[]): TrainingCategory[] {
    if (explicit) return [...explicit];
    // Mọi category có thư mục JSON trong assets.
    const out: TrainingCategory[] = [];
    if (fs.existsSync(this.root)) {
      for (const entry of fs.readdirSync(this.root, { withFileTypes: true })) {
        if (entry.isDirectory() && !entry.name.startsWith('_')) out.push(entry.name as TrainingCategory);
      }
    }
    return out;
  }

  /**
   * Chạy chiến dịch: lặp batch tới khi đạt target (campaignTotal ≥ target),
   * hết maxBatches, hoặc hết thời gian batch. Persist sau mỗi batch.
   */
  public runCampaign(): CampaignResult {
    const batches: BatchReport[] = [];
    let iterationsThisRun = 0;
    let batchIndex = Math.floor(this.campaignTotal / this.batchIterations);
    let targetReached = this.campaignTotal >= this.totalTargetIterations;

    for (let b = 0; b < this.maxBatches && !targetReached; b++) {
      const report = this.loop.runIterations(this.batchIterations, this.maxMsPerBatch, 1 + batchIndex);
      this.campaignTotal = this.loop.totalIterations;
      iterationsThisRun += report.iterations;
      batchIndex++;

      // Persist sau MỖI batch — không bao giờ mất công đã train.
      const persisted: string[] = [];
      persisted.push(saveCheckpointFile(this.root, this.loop.saveCheckpoint()));
      for (const [category, state] of this.loop.states) {
        if (state.pool.length > 0) {
          persisted.push(persistDatasetChunk(this.root, category, batchIndex, state.pool));
        }
      }

      batches.push({
        batchIndex: b + 1,
        report,
        campaignTotal: this.campaignTotal,
        persisted,
      });
      targetReached = this.campaignTotal >= this.totalTargetIterations;
    }

    return {
      batches,
      iterationsThisRun,
      campaignTotal: this.campaignTotal,
      targetReached,
      optimizedRoot: optimizedRootOf(this.root),
    };
  }
}
