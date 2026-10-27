/**
 * @file dataset.ts
 * @module @aetheria/engine/training/dataset
 * @description Folder dữ liệu học cho AGENT trong game: registry các category
 * (tree, volcano, npc, monster, clothing, weapon, player, house, water, food…)
 * ánh xạ 1-1 với thư mục `assets/training/<category>/`. Game designer chỉ cần
 * thả file JSON mẫu vào đúng thư mục — loader tự quét, tự validate schema, tự
 * phân loại (shape-perception / pixel-grid / reward / creativity-seed) và trả
 * dataset sẵn sàng cho trainer.
 *
 * Định dạng file mẫu (`<anything>.json`):
 * ```json
 * {
 *   "source": "nguon_cua_ban",
 *   "kind": "shape" | "pixel" | "reward" | "creativity",
 *   "samples": [ ... tuỳ kind ... ]
 * }
 * ```
 * - `shape`:   { label, aspectRatio, relativeArea, vertexCount, centerHeightRatio, solidity, groundTruth }
 * - `pixel`:   { width, height, cells: [{x, y, color}], groundTruthQuality }
 * - `reward`:  { perception: {coverage, densityVariance, horizontalSymmetry, colorDiversity, dominantOwnerShare, totalPixels}, groundTruthQuality }
 * - `creativity`: { seed: string, domain: string } — tên gợi ý cho sáng chế.
 */

import fs from 'node:fs';
import path from 'node:path';
import { clamp01, clampRange } from '../deeplearning/random.js';

/** Các category dữ liệu huấn luyện hỗ trợ — mỗi category một thư mục. */
export type TrainingCategory =
  | 'tree'
  | 'volcano'
  | 'npc'
  | 'monster'
  | 'clothing'
  | 'weapon'
  | 'player'
  | 'house'
  | 'water'
  | 'food'
  | 'rice_field'
  | 'cave'
  | 'animal'
  | 'event'
  | 'dragon'
  | 'weather'
  | 'supernatural'
  | 'grass'
  | 'forest'
  | 'emotion'
  | 'language'
  | 'knowledge';

/** Registry: tên thư mục → mô tả + khái niệm form agent sẽ học. */
export const TRAINING_CATEGORIES: Readonly<Record<TrainingCategory, { folder: string; label: string; conceptName: string }>> = Object.freeze({
  tree: { folder: 'tree', label: 'Cây cối', conceptName: 'cái cây' },
  volcano: { folder: 'volcano', label: 'Núi lửa', conceptName: 'núi lửa' },
  npc: { folder: 'npc', label: 'NPC', conceptName: 'nhân vật npc' },
  monster: { folder: 'monster', label: 'Quái thú', conceptName: 'quái vật' },
  clothing: { folder: 'clothing', label: 'Quần áo', conceptName: 'trang phục' },
  weapon: { folder: 'weapon', label: 'Vũ khí', conceptName: 'vũ khí' },
  player: { folder: 'player', label: 'Player', conceptName: 'người chơi' },
  house: { folder: 'house', label: 'Nhà cửa', conceptName: 'cái nhà' },
  water: { folder: 'water', label: 'Nước', conceptName: 'mặt nước' },
  food: { folder: 'food', label: 'Đồ ăn', conceptName: 'đồ ăn' },
  rice_field: { folder: 'rice_field', label: 'Ruộng đồng', conceptName: 'ruộng lúa' },
  cave: { folder: 'cave', label: 'Hang động', conceptName: 'cái hang' },
  animal: { folder: 'animal', label: 'Động vật', conceptName: 'động vật' },
  event: { folder: 'event', label: 'Sự kiện hệ thống', conceptName: 'sự kiện hệ thống' },
  dragon: { folder: 'dragon', label: 'Rồng', conceptName: 'con rồng' },
  weather: { folder: 'weather', label: 'Hiện tượng thời tiết', conceptName: 'hiện tượng thời tiết' },
  supernatural: { folder: 'supernatural', label: 'Siêu nhiên', conceptName: 'hiện tượng siêu nhiên' },
  grass: { folder: 'grass', label: 'Đồng cỏ', conceptName: 'đồng cỏ' },
  forest: { folder: 'forest', label: 'Rừng', conceptName: 'khu rừng' },
  emotion: { folder: 'emotion', label: 'Cảm xúc', conceptName: 'phản ứng cảm xúc' },
  language: { folder: 'language', label: 'Ngôn ngữ', conceptName: 'ngôn ngữ' },
  knowledge: { folder: 'knowledge', label: 'Tri thức', conceptName: 'tri thức' },
});

/** Danh sách category hợp lệ. */
export function isTrainingCategory(value: string): value is TrainingCategory {
  return value in TRAINING_CATEGORIES;
}

// ---------------------------------------------------------------------------
// Các loại mẫu
// ---------------------------------------------------------------------------

/** Mẫu nhận thức hình dạng (train FormCognitionEngine). */
export interface ShapeSample {
  label: string;
  aspectRatio: number;
  relativeArea: number;
  vertexCount: number;
  centerHeightRatio: number;
  solidity: number;
  groundTruth: string;
}

/** Một điểm ảnh trong mẫu pixel. */
export interface PixelCell {
  x: number;
  y: number;
  color: string;
}

/** Mẫu pixel grid (train GameNPCPixelSkill / SystemRenderAgent RL). */
export interface PixelSample {
  width: number;
  height: number;
  cells: PixelCell[];
  /** Chất lượng chuẩn `[0, 1]` do nguồn ngoài gán. */
  groundTruthQuality: number;
  /** Hành động gắn với mẫu (build/destroy/recreate/arrange). */
  action?: 'build' | 'destroy' | 'recreate' | 'arrange';
}

/** Vector perception cho RL (train SystemRenderAgent). */
export interface RewardSample {
  perception: {
    totalPixels: number;
    coverage: number;
    densityVariance: number;
    horizontalSymmetry: number;
    colorDiversity: number;
    dominantOwnerShare: number;
  };
  groundTruthQuality: number;
}

/** Mẫu hạt giống sáng tạo — nuôi phân hệ phát minh. */
export interface CreativitySample {
  seed: string;
  domain: string;
}

/** Mẫu cảm xúc: phản ứng theo sự kiện. */
export interface EmotionSampleFileEntry {
  eventKind: string;
  reactions: Array<{ emotion: string; intensityMultiplier: number; decayRate?: number }>;
}

/** Mẫu ngôn ngữ: một mẫu câu. */
export interface LanguageSampleFileEntry {
  intent: string;
  template: string;
  tone: string;
  formality?: number;
}

/** Mẫu tri thức: một fact. */
export interface KnowledgeSampleFileEntry {
  name: string;
  domain: string;
  description: string;
  complexity?: number;
  baseUtility?: number;
  era?: string;
}

export type SampleFileKind = 'shape' | 'pixel' | 'reward' | 'creativity' | 'emotion' | 'language' | 'knowledge';

/** Một file dữ liệu mẫu (đúng schema). */
export interface TrainingSampleFile {
  source: string;
  kind: SampleFileKind;
  samples: Array<ShapeSample | PixelSample | RewardSample | CreativitySample | EmotionSampleFileEntry | LanguageSampleFileEntry | KnowledgeSampleFileEntry>;
}

/** Dataset đã load và validate cho một category. */
export interface LoadedDataset {
  category: TrainingCategory;
  /** Số file hợp lệ / bị bỏ qua. */
  filesLoaded: number;
  filesSkipped: number;
  shapeSamples: ShapeSample[];
  pixelSamples: PixelSample[];
  rewardSamples: RewardSample[];
  creativitySamples: CreativitySample[];
  emotionSamples: EmotionSampleFileEntry[];
  languageSamples: LanguageSampleFileEntry[];
  knowledgeSamples: KnowledgeSampleFileEntry[];
  /** Lỗi validate từng file (nếu có). */
  errors: Array<{ file: string; reason: string }>;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validate một file JSON có đúng schema mẫu không — trả lỗi nếu sai. */
export function validateSampleFile(data: unknown): { valid: boolean; reason?: string; kind?: SampleFileKind } {
  if (!isRecord(data)) return { valid: false, reason: 'file không phải JSON object' };
  const { source, kind, samples } = data;
  if (typeof source !== 'string' || source.length === 0) return { valid: false, reason: 'thiếu "source" (chuỗi)' };
  const VALID_KINDS: readonly string[] = ['shape', 'pixel', 'reward', 'creativity', 'emotion', 'language', 'knowledge'];
  if (typeof kind !== 'string' || !VALID_KINDS.includes(kind)) {
    return { valid: false, reason: `"kind" phải là ${VALID_KINDS.join('|')}, nhận "${String(kind)}"` };
  }
  if (!Array.isArray(samples) || samples.length === 0) return { valid: false, reason: '"samples" phải là mảng khác rỗng' };
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    if (!isRecord(sample)) return { valid: false, reason: `samples[${i}] không phải object`, kind: kind as SampleFileKind };
    if (kind === 'shape') {
      const s = sample as unknown as ShapeSample;
      if (typeof s.label !== 'string' || typeof s.groundTruth !== 'string') return { valid: false, reason: `shape samples[${i}] thiếu label/groundTruth`, kind: kind as SampleFileKind };
      for (const field of ['aspectRatio', 'relativeArea', 'vertexCount', 'centerHeightRatio', 'solidity'] as const) {
        if (typeof s[field] !== 'number' || !Number.isFinite(s[field])) return { valid: false, reason: `shape samples[${i}].${field} phải là số`, kind };
      }
    } else if (kind === 'pixel') {
      const p = sample as unknown as PixelSample;
      if (typeof p.width !== 'number' || typeof p.height !== 'number' || !Array.isArray(p.cells)) {
        return { valid: false, reason: `pixel samples[${i}] thiếu width/height/cells`, kind };
      }
      if (p.groundTruthQuality === undefined || typeof p.groundTruthQuality !== 'number') {
        return { valid: false, reason: `pixel samples[${i}] thiếu groundTruthQuality`, kind };
      }
      for (const cell of p.cells) {
        if (!isRecord(cell) || typeof cell.x !== 'number' || typeof cell.y !== 'number' || typeof cell.color !== 'string') {
          return { valid: false, reason: `pixel samples[${i}].cells phần tử phải có x/y/color`, kind };
        }
      }
    } else if (kind === 'reward') {
      const r = sample as unknown as RewardSample;
      if (!isRecord(r.perception)) return { valid: false, reason: `reward samples[${i}] thiếu perception`, kind };
      if (typeof r.groundTruthQuality !== 'number') return { valid: false, reason: `reward samples[${i}] thiếu groundTruthQuality`, kind };
    } else if (kind === 'creativity') {
      const c = sample as unknown as CreativitySample;
      if (typeof c.seed !== 'string' || typeof c.domain !== 'string') return { valid: false, reason: `creativity samples[${i}] thiếu seed/domain`, kind };
    } else if (kind === 'emotion') {
      const e = sample as unknown as { eventKind?: string; reactions?: unknown };
      if (typeof e.eventKind !== 'string' || !Array.isArray(e.reactions)) {
        return { valid: false, reason: `emotion samples[${i}] thiếu eventKind/reactions`, kind };
      }
    } else if (kind === 'language') {
      const l = sample as unknown as { intent?: string; template?: string; tone?: string; formality?: number };
      if (typeof l.intent !== 'string' || typeof l.template !== 'string' || typeof l.tone !== 'string') {
        return { valid: false, reason: `language samples[${i}] thiếu intent/template/tone`, kind };
      }
    } else {
      const k = sample as unknown as { name?: string; domain?: string; description?: string };
      if (typeof k.name !== 'string' || typeof k.domain !== 'string' || typeof k.description !== 'string') {
        return { valid: false, reason: `knowledge samples[${i}] thiếu name/domain/description`, kind: kind as SampleFileKind };
      }
    }
  }
  return { valid: true, kind: kind as SampleFileKind };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

/** Đường dẫn thư mục training mặc định. */
export const DEFAULT_TRAINING_ROOT = path.resolve('assets/training');

/**
 * Load dữ liệu mẫu cho một category từ thư mục `root/<category>/`.
 * Mỗi file JSON hợp lệ được parse + validate; file sai bị bỏ qua (ghi errors)
 * — dữ liệu designer đưa vào không bao giờ làm engine sập.
 */
export function loadCategoryDataset(category: TrainingCategory, root: string = DEFAULT_TRAINING_ROOT): LoadedDataset {
  const folder = path.join(root, TRAINING_CATEGORIES[category].folder);
  const dataset: LoadedDataset = {
    category,
    filesLoaded: 0,
    filesSkipped: 0,
    shapeSamples: [],
    pixelSamples: [],
    rewardSamples: [],
    creativitySamples: [],
    emotionSamples: [],
    languageSamples: [],
    knowledgeSamples: [],
    errors: [],
  };
  if (!fs.existsSync(folder)) {
    dataset.errors.push({ file: folder, reason: 'thư mục chưa tồn tại — chờ designer thả dữ liệu' });
    return dataset;
  }
  for (const fileName of fs.readdirSync(folder).sort()) {
    if (!fileName.endsWith('.json')) continue;
    const filePath = path.join(folder, fileName);
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const verdict = validateSampleFile(parsed);
      if (!verdict.valid || !verdict.kind) {
        dataset.filesSkipped++;
        dataset.errors.push({ file: fileName, reason: verdict.reason ?? 'schema không hợp lệ' });
        continue;
      }
      const kind = verdict.kind as SampleFileKind;
      const file = parsed as unknown as TrainingSampleFile;
      dataset.filesLoaded++;
      for (const sample of file.samples) {
        if (kind === 'shape') dataset.shapeSamples.push(sample as ShapeSample);
        else if (kind === 'pixel') dataset.pixelSamples.push(clampPixelSample(sample as PixelSample));
        else if (kind === 'reward') dataset.rewardSamples.push(sample as RewardSample);
        else if (kind === 'creativity') dataset.creativitySamples.push(sample as CreativitySample);
        else if (kind === 'emotion') dataset.emotionSamples.push(sample as EmotionSampleFileEntry);
        else if (kind === 'language') dataset.languageSamples.push(sample as LanguageSampleFileEntry);
        else if (kind === 'knowledge') dataset.knowledgeSamples.push(sample as KnowledgeSampleFileEntry);
      }
    } catch (error) {
      dataset.filesSkipped++;
      dataset.errors.push({ file: fileName, reason: `JSON lỗi: ${String(error).slice(0, 80)}` });
    }
  }
  return dataset;
}

/** Kẹp giá trị pixel sample vào biên an toàn. */
function clampPixelSample(sample: PixelSample): PixelSample {
  return {
    ...sample,
    width: clampRange(Math.floor(sample.width), 1, 512),
    height: clampRange(Math.floor(sample.height), 1, 512),
    groundTruthQuality: clamp01(sample.groundTruthQuality),
    cells: sample.cells.map((cell) => ({ x: Math.max(0, Math.round(cell.x)), y: Math.max(0, Math.round(cell.y)), color: cell.color })),
  };
}

/** Quét toàn bộ các category có thư mục trong root — báo cáo tổng quan. */
export function scanTrainingRoot(root: string = DEFAULT_TRAINING_ROOT): Array<{ category: TrainingCategory; exists: boolean; jsonFiles: number }> {
  const report: Array<{ category: TrainingCategory; exists: boolean; jsonFiles: number }> = [];
  for (const category of Object.keys(TRAINING_CATEGORIES) as TrainingCategory[]) {
    const folder = path.join(root, TRAINING_CATEGORIES[category].folder);
    const exists = fs.existsSync(folder);
    const jsonFiles = exists ? fs.readdirSync(folder).filter((f: string) => f.endsWith('.json')).length : 0;
    report.push({ category, exists, jsonFiles });
  }
  return report;
}
