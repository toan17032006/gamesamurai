/**
 * @file render-agents.ts
 * @module @aetheria/engine/worldview/render-agents
 * @description Agent hệ thống vs Agent trong game — hai vai trò RỜI RẠC:
 *
 * - **SystemRenderAgent** (agent hệ thống): trực tiếp tham gia render sự kiện
 *   hệ thống sao cho chuẩn xác — học tăng cường (RL: đề xuất chỉnh → nhận
 *   reward từ ground truth → cập nhật mạng), học sâu (mạng nơ-ron chấm điểm bố
 *   cục), **hiểu điểm ảnh** (perception từ pixel buffer raster hoá), và được
 *   train từ **dữ liệu mẫu bên ngoài**. Chỉ role 'system' mới được render
 *   sự kiện hệ thống.
 * - **GameNPCPixelSkill** (agent trong game/npc): học sâu hiểu điểm ảnh để
 *   xây dựng, phá hủy, tái tạo — chất lượng công trình của NPC được tính từ
 *   perception điểm ảnh, nhưng **KHÔNG tham gia render sự kiện hệ thống**
 *   (`canRenderSystemEvents()` luôn false).
 *
 * Kèm lớp sắp xếp điểm ảnh: `PixelGrid` (xếp đặt/chiếm chỗ) và `sortPixels`
 * (generic, nhiều chiến lược: depth/color/coverage/so sánh tuỳ chỉnh).
 */

import { NeuralNetwork, type TrainingReport } from '../deeplearning/nn.js';
import { DeepRandom, clamp01, clampRange, hashSeed } from '../deeplearning/random.js';
import type { SceneNode, Shape, Vec2 } from './types.js';

// ===========================================================================
// Điểm ảnh — buffer, raster hoá, xếp đặt
// ===========================================================================

/** Một điểm ảnh trong grid thế giới. */
export interface Pixel {
  x: number;
  y: number;
  /** Lớp sâu — quyết định điểm nào đè lên điểm nào khi sắp. */
  z: number;
  /** Node sở hữu pixel (ai vẽ ra). */
  ownerId: string;
  /** Mã màu (hex hoặc rgb). */
  color: string;
}

/** Grid điểm ảnh — xếp đặt, chiếm chỗ, truy vấn theo toạ độ. */
export class PixelGrid {
  public readonly width: number;
  public readonly height: number;
  private readonly cells = new Map<string, Pixel>();

  constructor(width: number, height: number) {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
  }

  private key(x: number, y: number): string {
    return `${Math.round(x)},${Math.round(y)}`;
  }

  /** Ô đã có người chiếm chưa. */
  public occupied(x: number, y: number): boolean {
    return this.cells.has(this.key(x, y));
  }

  public get(x: number, y: number): Pixel | undefined {
    return this.cells.get(this.key(x, y));
  }

  /** Xếp đặt một điểm: từ chối nếu đã chiếm (trừ khi overwrite). */
  public place(pixel: Pixel, options: { overwrite?: boolean } = {}): boolean {
    const key = this.key(pixel.x, pixel.y);
    if (this.cells.has(key) && !options.overwrite) return false;
    this.cells.set(key, pixel);
    return true;
  }

  /** Lấy điểm ra khỏi grid (tháo dỡ). */
  public take(x: number, y: number): Pixel | undefined {
    const key = this.key(x, y);
    const pixel = this.cells.get(key);
    this.cells.delete(key);
    return pixel;
  }

  /** Toàn bộ điểm ảnh đang chiếm chỗ. */
  public all(): Pixel[] {
    return [...this.cells.values()];
  }

  /** Độ phủ `[0, 1]`. */
  public coverage(): number {
    return clamp01(this.cells.size / (this.width * this.height));
  }
}

/** Raster hoá một Shape thành danh sách điểm ảnh (scanline + midpoint circle). */
export function rasterizeShape<T extends Shape>(
  shape: T,
  options: { ownerId: string; color: string; z: number; grid: PixelGrid },
): Pixel[] {
  const pixels: Pixel[] = [];
  const bounds = shapeBoundsLocal(shape);
  const push = (x: number, y: number) => {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px >= 0 && py >= 0 && px < options.grid.width && py < options.grid.height) {
      pixels.push({ x: px, y: py, z: options.z, ownerId: options.ownerId, color: options.color });
    }
  };

  switch (shape.kind) {
    case 'rect': {
      for (let y = Math.round(shape.topLeft.y); y < shape.topLeft.y + shape.height; y++) {
        for (let x = Math.round(shape.topLeft.x); x < shape.topLeft.x + shape.width; x++) push(x, y);
      }
      break;
    }
    case 'circle': {
      const r = Math.max(0.5, shape.radius);
      for (let y = Math.floor(bounds.minY); y <= Math.ceil(bounds.maxY); y++) {
        for (let x = Math.floor(bounds.minX); x <= Math.ceil(bounds.maxX); x++) {
          if ((x - shape.center.x) ** 2 + (y - shape.center.y) ** 2 <= r * r) push(x, y);
        }
      }
      break;
    }
    case 'ellipse': {
      for (let y = Math.floor(bounds.minY); y <= Math.ceil(bounds.maxY); y++) {
        for (let x = Math.floor(bounds.minX); x <= Math.ceil(bounds.maxX); x++) {
          const dx = (x - shape.center.x) / Math.max(0.5, shape.rx);
          const dy = (y - shape.center.y) / Math.max(0.5, shape.ry);
          if (dx * dx + dy * dy <= 1) push(x, y);
        }
      }
      break;
    }
    case 'polygon':
    case 'path': {
      const points = shape.kind === 'path' && !shape.closed
        ? thickPoints(shape.points)
        : scanlinePolygon(shape.points);
      for (const p of points) push(p.x, p.y);
      break;
    }
    case 'line': {
      // Bresenham đơn giản hoá: nội suy tuyến tính.
      const steps = Math.max(1, Math.ceil(Math.hypot(shape.to.x - shape.from.x, shape.to.y - shape.from.y)));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        push(shape.from.x + (shape.to.x - shape.from.x) * t, shape.from.y + (shape.to.y - shape.from.y) * t);
      }
      break;
    }
  }
  void bounds;
  return pixels;
}

function shapeBoundsLocal(shape: Shape): { minX: number; minY: number; maxX: number; maxY: number } {
  switch (shape.kind) {
    case 'circle':
      return { minX: shape.center.x - shape.radius, maxX: shape.center.x + shape.radius, minY: shape.center.y - shape.radius, maxY: shape.center.y + shape.radius };
    case 'ellipse':
      return { minX: shape.center.x - shape.rx, maxX: shape.center.x + shape.rx, minY: shape.center.y - shape.ry, maxY: shape.center.y + shape.ry };
    case 'rect':
      return { minX: shape.topLeft.x, maxX: shape.topLeft.x + shape.width, minY: shape.topLeft.y, maxY: shape.topLeft.y + shape.height };
    case 'line':
      return {
        minX: Math.min(shape.from.x, shape.to.x), maxX: Math.max(shape.from.x, shape.to.x),
        minY: Math.min(shape.from.y, shape.to.y), maxY: Math.max(shape.from.y, shape.to.y),
      };
    case 'polygon':
    case 'path': {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of shape.points) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      return { minX, minY, maxX, maxY };
    }
  }
}

/** Scanline fill đa giác — trả tâm mỗi hàng quét. */
function scanlinePolygon(points: Vec2[]): Vec2[] {
  if (points.length < 3) return points;
  const ys = points.map((p) => p.y);
  const minY = Math.ceil(Math.min(...ys));
  const maxY = Math.floor(Math.max(...ys));
  const out: Vec2[] = [];
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
        xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
      }
    }
    xs.sort((m, n) => m - n);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]); x++) out.push({ x, y });
    }
  }
  return out;
}

/** Path mở → nét dày 1px dọc từng đoạn. */
function thickPoints(points: Vec2[]): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sắp xếp điểm ảnh — generic, nhiều chiến lược
// ---------------------------------------------------------------------------

export type PixelSortStrategy = 'depth' | 'color' | 'coverage' | 'z_desc' | 'custom';

/**
 * Sắp xếp điểm ảnh generic:
 * - `depth`: z tăng dần (painter's algorithm — xa vẽ trước);
 * - `z_desc`: z giảm dần (gần đè xa);
 * - `color`: nhóm theo màu (bucket) rồi theo toạ độ — dồn màu liền khối;
 * - `coverage`: quét theo hàng rồi cột (raster order);
 * - `custom`: dùng `compare` do agent (npc hoặc hệ thống) quy định.
 */
export function sortPixels<T extends Pixel>(
  pixels: readonly T[],
  strategy: PixelSortStrategy = 'depth',
  compare?: (a: T, b: T) => number,
): T[] {
  const sorted = [...pixels];
  switch (strategy) {
    case 'depth':
      sorted.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
      break;
    case 'z_desc':
      sorted.sort((a, b) => b.z - a.z || b.y - a.y || b.x - a.x);
      break;
    case 'color':
      sorted.sort((a, b) => a.color.localeCompare(b.color) || a.y - b.y || a.x - b.x);
      break;
    case 'coverage':
      sorted.sort((a, b) => a.y - b.y || a.x - b.x);
      break;
    case 'custom':
      if (!compare) throw new RangeError('chiến lược custom cần hàm so sánh');
      sorted.sort(compare);
      break;
  }
  return sorted;
}

// ===========================================================================
// Nhận thức điểm ảnh — hiểu buffer
// ===========================================================================

/** Đặc trưng perception trích từ pixel buffer — đầu vào mạng học sâu. */
export interface PixelPerception {
  totalPixels: number;
  coverage: number;
  /** Phương sai mật độ theo hàng — bố cục đều hay dồn cục. */
  densityVariance: number;
  /** Độ đối xứng trái/phải `[0, 1]`. */
  horizontalSymmetry: number;
  /** Số màu khác biệt. */
  colorDiversity: number;
  /** Phần trăm pixel thuộc owner đa số `[0, 1]`. */
  dominantOwnerShare: number;
}

/** Trích perception từ một tập pixel — "hiểu điểm ảnh". */
export function perceivePixels(pixels: readonly Pixel[], gridWidth: number, gridHeight: number): PixelPerception {
  if (pixels.length === 0) {
    return { totalPixels: 0, coverage: 0, densityVariance: 0, horizontalSymmetry: 0, colorDiversity: 0, dominantOwnerShare: 0 };
  }
  // Mật độ theo hàng.
  const rowCounts = new Array(Math.max(1, gridHeight)).fill(0);
  const colors = new Set<string>();
  const owners = new Map<string, number>();
  const cellSet = new Set(pixels.map((p) => `${p.x},${p.y}`));
  for (const p of pixels) {
    if (p.y >= 0 && p.y < gridHeight) rowCounts[Math.floor(p.y)]++;
    colors.add(p.color);
    owners.set(p.ownerId, (owners.get(p.ownerId) ?? 0) + 1);
  }
  const mean = pixels.length / Math.max(1, gridHeight);
  const variance = rowCounts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / Math.max(1, gridHeight);
  // Đối xứng trái/phải: tỉ lệ pixel có mirror.
  let mirrored = 0;
  for (const p of pixels) {
    if (cellSet.has(`${gridWidth - 1 - p.x},${p.y}`)) mirrored++;
  }
  const dominant = Math.max(0, ...owners.values());
  return {
    totalPixels: pixels.length,
    coverage: clamp01(pixels.length / Math.max(1, gridWidth * gridHeight)),
    densityVariance: Math.round(variance * 100) / 100,
    horizontalSymmetry: clamp01(mirrored / Math.max(1, pixels.length)),
    colorDiversity: colors.size,
    dominantOwnerShare: clamp01(dominant / pixels.length),
  };
}

/** Perception → vector 6 chiều cho mạng học sâu. */
function perceptionVector(p: PixelPerception): number[] {
  return [
    clamp01(p.coverage),
    clamp01(p.densityVariance / 50),
    p.horizontalSymmetry,
    clamp01(p.colorDiversity / 12),
    p.dominantOwnerShare,
    clamp01(p.totalPixels / Math.max(1, gridRef * gridRef)),
  ];
}

let gridRef = 64; // chuẩn hoá kích thước grid gần nhất — cập nhật khi raster.

// ===========================================================================
// SystemRenderAgent — agent hệ thống trực tiếp render sự kiện hệ thống
// ===========================================================================

/** Vai trò agent render. */
export type RenderAgentRole = 'system' | 'game';

/** Kết quả một episode học tăng cường. */
export interface ReinforcementEpisode {
  episode: number;
  reward: number;
  /** Điểm chất lượng mạng dự đoán trước khi học. */
  predicted: number;
  /** Sai số |predicted - reward|. */
  error: number;
}

/** Đề xuất hiệu chỉnh bố cục do agent hệ thống đưa ra. */
export interface LayoutAdjustment {
  /** Nới khoảng cách phần tử (spread). */
  spread: number;
  /** Dịch tâm ngang [-1, 1]. */
  centerXShift: number;
  /** Cân đối xứng đề xuất `[0, 1]`. */
  symmetryTarget: number;
  reason: string;
}

/** Mẫu train từ BÊN NGOÀI — nạp để agent hiểu form/màu/bố cục chuẩn. */
export interface RenderTrainingSample {
  source: string;
  perception: PixelPerception;
  /** Chất lượng chuẩn do nguồn ngoài gán `[0, 1]`. */
  groundTruthQuality: number;
}

/**
 * Agent hệ thống: trực tiếp tham gia render sự kiện hệ thống.
 * - Học sâu: mạng nơ-ron chấm điểm chất lượng bố cục từ perception điểm ảnh.
 * - Học tăng cường: mỗi episode đề xuất hiệu chỉnh → nhận reward từ ground
 *   truth (ngoài hoặc từ FormCognition verify) → train lại mạng.
 * - Được nạp dữ liệu mẫu bên ngoài để hiểu chuẩn trước khi tự chạy.
 */
export class SystemRenderAgent {
  public readonly id: string;
  public readonly role: RenderAgentRole = 'system';
  public readonly specialization: string;
  /** Số episode RL đã trải. */
  public episodes = 0;
  /** Reward trung bình gần nhất. */
  public averageReward = 0;
  private readonly net: NeuralNetwork;
  private readonly random: DeepRandom;
  private rewardHistory: number[] = [];

  constructor(options: { id?: string; specialization?: string; seed?: number | string } = {}) {
    this.id = options.id ?? 'system_render_agent';
    this.specialization = options.specialization ?? 'layout';
    this.random = new DeepRandom(`${this.id}:render-agent`);
    this.net = new NeuralNetwork({
      inputSize: 6,
      hiddenSizes: [12, 8],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'sigmoid',
      optimizer: { kind: 'adam', learningRate: 0.02 },
      seed: hashSeed(this.id) % 2147483647,
    });
  }

  /** Chỉ agent hệ thống mới được tham gia render sự kiện hệ thống. */
  public canRenderSystemEvents(): boolean {
    return this.role === 'system';
  }

  /** Chấm điểm chất lượng bố cục từ perception điểm ảnh (học sâu forward). */
  public evaluateQuality(perception: PixelPerception): number {
    return clamp01(this.net.predict(perceptionVector(perception))[0] ?? 0.5);
  }

  /** Học từ dữ liệu mẫu BÊN NGOÀI — supervised: target là ground truth. */
  public trainFromExternal(samples: readonly RenderTrainingSample[]): TrainingReport {
    gridRef = 64;
    const training = samples.map((sample) => ({
      input: perceptionVector(sample.perception),
      target: [clamp01(sample.groundTruthQuality)],
    }));
    return this.net.trainBatch(training, { epochs: 30, loss: 'huber' });
  }

  /**
   * Học tăng cường một episode: agent đề xuất hiệu chỉnh dựa trên perception
   * → hệ thống chấm reward (khớp ground truth / verify) → mạng học từ reward.
   */
  public reinforceEpisode(perception: PixelPerception, reward: number): ReinforcementEpisode {
    this.episodes++;
    gridRef = 64;
    const vector = perceptionVector(perception);
    const predicted = clamp01(this.net.predict(vector)[0] ?? 0.5);
    const cleanReward = clamp01(reward);
    // Trộn reward thật với exploration noise nhỏ — epsilon-greedy tinh thần.
    const noisyTarget = clamp01(cleanReward + this.random.gaussian(0, 0.03 * Math.max(0.05, 1 - this.episodes / 200)));
    this.net.trainSample({ input: vector, target: [noisyTarget] }, 'huber');
    this.rewardHistory.push(cleanReward);
    if (this.rewardHistory.length > 100) this.rewardHistory.shift();
    this.averageReward = this.rewardHistory.reduce((sum, r) => sum + r, 0) / this.rewardHistory.length;
    return {
      episode: this.episodes,
      reward: Math.round(cleanReward * 1000) / 1000,
      predicted: Math.round(predicted * 1000) / 1000,
      error: Math.round(Math.abs(predicted - cleanReward) * 1000) / 1000,
    };
  }

  /**
   * Đề xuất hiệu chỉnh bố cục từ perception: density dồn cục → nới spread;
 * lệch tâm → dịch centre; mất đối xứng → đề xuất mirror. Đề xuất được kiểm
   * chứng lại bằng evaluateQuality trước khi áp.
   */
  public proposeAdjustment(perception: PixelPerception): LayoutAdjustment {
    const spread = clampRange(perception.densityVariance / 40, 0, 1);
    const symmetryTarget = clamp01(perception.horizontalSymmetry < 0.5 ? 0.8 : perception.horizontalSymmetry);
    const reason =
      perception.densityVariance > 20
        ? 'mật độ dồn cục — nới spacing để bố cục thở'
        : perception.horizontalSymmetry < 0.5
          ? 'lệch tâm — đề xuất cân đối xứng'
          : 'bố cục ổn định — giữ nguyên tỉ lệ';
    return {
      spread: Math.round(spread * 100) / 100,
      centerXShift: clampRange((0.5 - perception.horizontalSymmetry) * 0.5, -1, 1),
      symmetryTarget,
      reason,
    };
  }

  /** Áp hiệu chỉnh: dàn lại pixel theo spread quanh tâm — trả buffer mới. */
  public applyAdjustment(pixels: readonly Pixel[], adjustment: LayoutAdjustment, gridWidth: number, gridHeight: number): Pixel[] {
    const centerX = gridWidth / 2;
    const centerY = gridHeight / 2;
    return pixels.map((p) => ({
      ...p,
      x: clampRange(Math.round(centerX + (p.x - centerX) * (1 + adjustment.spread * 0.5) + adjustment.centerXShift * 2), 0, gridWidth - 1),
      y: clampRange(Math.round(centerY + (p.y - centerY) * (1 + adjustment.spread * 0.25)), 0, gridHeight - 1),
    }));
  }
}

// ===========================================================================
// GameNPCPixelSkill — NPC học sâu điểm ảnh để xây/phá/tái tạo (KHÔNG render hệ thống)
// ===========================================================================

/** Hành động NPC tác động lên pixel thế giới. */
export type NPCPixelAction = 'build' | 'destroy' | 'recreate' | 'arrange';

/** Kết quả NPC tác động lên pixel. */
export interface NPCPixelActionResult {
  npcId: string;
  action: NPCPixelAction;
  /** Chất lượng thao tác `[0, 1]` — do mạng học sâu chấm sau khi học. */
  quality: number;
  pixelsAffected: number;
  note: string;
}

/**
 * Kỹ năng điểm ảnh của NPC trong game: học sâu hiểu pixel buffer để xây/đập/
 * tái tạo — nhưng NPC KHÔNG tham gia render sự kiện hệ thống (`role='game'`).
 */
export class GameNPCPixelSkill {
  public readonly npcId: string;
  public readonly role: RenderAgentRole = 'game';
  private readonly net: NeuralNetwork;
  public trainSessions = 0;

  constructor(options: { npcId?: string; seed?: number | string } = {}) {
    this.npcId = options.npcId ?? 'npc_pixel';
    this.net = new NeuralNetwork({
      inputSize: 6,
      hiddenSizes: [8],
      outputSize: 1,
      hiddenActivation: 'tanh',
      outputActivation: 'sigmoid',
      optimizer: { kind: 'adam', learningRate: 0.03 },
      seed: hashSeed(this.npcId) % 2147483647,
    });
  }

  /** NPC trong game KHÔNG THỂ render sự kiện hệ thống — vai trò tách biệt cứng. */
  public canRenderSystemEvents(): false {
    return false;
  }

  /**
   * Học sâu từ pixel buffer: NPC quan sát kết quả thao tác của chính mình
   * (pixel trước/sau) và chất lượng thực tế đạt được — mỗi lần làm là một mẫu.
   */
  public learnFromAction(perception: PixelPerception, actualQuality: number): TrainingReport {
    this.trainSessions++;
    return this.net.trainBatch(
      [{ input: perceptionVector(perception), target: [clamp01(actualQuality)] }],
      { epochs: 5, loss: 'huber' },
    );
  }

  /** Chấm chất lượng một thao tác trước khi làm — NPC tự biết tay nghề mình. */
  public estimateQuality(perception: PixelPerception): number {
    return clamp01(this.net.predict(perceptionVector(perception))[0] ?? 0.5);
  }

  /**
   * Thực hiện thao tác trên pixel grid: đặt/xoá/đổi màu từng điểm — chất lượng
   * quyết định số pixel thực hiện trọn vẹn (tay nghè làm lệch nhiều hơn).
   */
  public act(
    action: NPCPixelAction,
    targetPixels: readonly Pixel[],
    grid: PixelGrid,
    worldTime: number,
  ): NPCPixelActionResult {
    const perception = perceivePixels(targetPixels, grid.width, grid.height);
    const quality = this.estimateQuality(perception);
    let affected = 0;
    for (const pixel of targetPixels) {
      if (action === 'destroy') {
        if (grid.take(pixel.x, pixel.y)) affected++;
      } else if (action === 'build' || action === 'recreate') {
        if (grid.place({ ...pixel, ownerId: this.npcId }, { overwrite: action === 'recreate' })) affected++;
      } else if (action === 'arrange') {
        const jitter = (1 - quality) * 1.5;
        const placed = grid.place({ ...pixel, ownerId: this.npcId, y: pixel.y + Math.round(Math.sin(worldTime + pixel.x) * jitter) }, { overwrite: true });
        if (placed) affected++;
      }
    }
    // Mạng học từ chính kết quả: chất lượng đạt được = tỉ lệ pixel trọn vẹn.
    const achieved = clamp01(affected / Math.max(1, targetPixels.length));
    this.learnFromAction(perception, achieved);
    return {
      npcId: this.npcId,
      action,
      quality: Math.round(achieved * 100) / 100,
      pixelsAffected: affected,
      note:
        action === 'destroy'
          ? `đập phá ${affected} điểm ảnh`
          : action === 'arrange'
            ? `xếp đặt ${affected} điểm ảnh (tay nghề ${Math.round(quality * 100)}%)`
            : `${action === 'build' ? 'xây' : 'tái tạo'} ${affected} điểm ảnh (ước lượng tay nghề ${Math.round(quality * 100)}%)`,
    };
  }
}

// tiện ích
export function rasterizeSceneNode(node: SceneNode, grid: PixelGrid): Pixel[] {
  const pixels: Pixel[] = [];
  for (const shape of node.shapes) {
    pixels.push(...rasterizeShape(shape, { ownerId: node.id, color: node.style.fill ?? '#888', z: node.z, grid }));
  }
  return pixels;
}
