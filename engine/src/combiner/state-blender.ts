// engine/src/combiner/state-blender.ts — Pha trộn hoạt ảnh đa tầng (Animation Blending, Upper/Lower body mask)
//
// Trước đây module có 3 lỗi ảnh hưởng trực tiếp tới chất lượng hoạt ảnh:
//   1. `mixer.clipAction(clip)` **chia sẻ action theo clip** → 2 layer dùng cùng một
//      clip (vd mọi combiner `*AndWalk` đều lấy clip "Idle") sẽ dùng chung một
//      action, `setEffectiveWeight` của layer sau ghi đè layer trước.
//   2. Mode **additive kèm mask** làm mất `AdditiveAnimationBlendMode` (nhánh `else if`),
//      nên lớp additive bị đổi thành override → pose cộng sai.
//   3. Không có báo cáo trạng thái: không biết layer nào đang chạy, chạy tới đâu,
//      clip nào đang phát, trọng số hiệu dụng ra sao.
//
// Nay mỗi layer có **clip riêng** (nên có action riêng), additive luôn giữ blendMode,
// và bổ sung `getState()` / `getLayerState()` trả về đầy đủ trạng thái runtime.
import * as THREE from 'three';
import type { BlendMode, BlendMask } from '../types/transform.types';
import { normalizeBoneName } from './socket-binder';

/** Pattern bone thuộc nửa trên người dùng (khớp mờ theo contains). */
export const UPPER_BODY_PATTERNS: readonly string[] = [
  'spine', 'chest', 'torso', 'neck', 'head', 'arm', 'hand', 'shoulder', 'clavicle', 'finger', 'thumb',
];

/** Pattern bone thuộc nửa dưới người dùng. */
export const LOWER_BODY_PATTERNS: readonly string[] = [
  'leg', 'foot', 'toe', 'hip', 'knee', 'ankle', 'ball', 'shin', 'thigh', 'calf',
];

export interface BlenderLayerOptions {
  mode?: BlendMode;
  mask?: BlendMask;
  weight?: number;
  timeScale?: number;
  /** Chế độ lặp của action (mặc định LoopRepeat). */
  loop?: THREE.AnimationActionLoopStyles;
  /** Số lần lặp (mặc định Infinity). */
  repetitions?: number;
  /** Giữ pose cuối khi hết clip. */
  clampWhenFinished?: boolean;
}

/** Trạng thái runtime của một layer — đầy đủ field để debug / HUD / telemetry. */
export interface LayerState {
  /** Tên layer. */
  name: string;
  /** Layer đang được bật hay không. */
  enabled: boolean;
  /** Chế độ pha trộn. */
  mode: BlendMode;
  /** Trọng số đã cấu hình (0..1). */
  weight: number;
  /** Trọng số hiệu dụng sau khi áp dụng enable (0 nếu disabled). */
  effectiveWeight: number;
  /** Tốc độ phát. */
  timeScale: number;
  /** Tên clip đang phát. */
  clipName: string | null;
  /** Action đang chạy hay chưa. */
  running: boolean;
  /** Thời gian hiện tại của action (giây). */
  actionTime: number;
  /** Thời lượng clip (giây). */
  actionDuration: number;
  /** Tiến độ 0..1 của clip. */
  actionProgress: number;
  /** Chế độ lặp. */
  loop: THREE.AnimationActionLoopStyles;
  /** Số track của clip đang chạy. */
  trackCount: number;
  /** Clip của layer có bị lọc theo mask hay không. */
  masked: boolean;
  /** Clip của layer có dùng blendMode additive hay không. */
  additive: boolean;
}

/** 1 layer = 1 action + trọng số + mode. Layer không có action hoặc disabled đóng góp 0. */
export class BlenderLayer {
  readonly name: string;
  mode: BlendMode = 'override';
  mask?: BlendMask;
  weight = 1;
  timeScale = 1;
  /** false khi clip không tìm thấy hoặc đã stop — layer bị bỏ qua khi update. */
  enabled = true;
  action: THREE.AnimationAction | null = null;
  clipName: string | null = null;
  /** Chế độ lặp của action. */
  loop: THREE.AnimationActionLoopStyles = THREE.LoopRepeat;
  /** Số lần lặp (Infinity = lặp vô hạn). */
  repetitions: number = Infinity;
  /** Giữ pose cuối khi hết clip. */
  clampWhenFinished = false;
  /** Layer tạm dừng (vẫn giữ weight nhưng không tiến thời gian). */
  paused = false;

  constructor(name: string) {
    this.name = name;
  }

  /** Action đang chạy thật (không phải null). */
  get isRunning(): boolean {
    return this.enabled && this.action !== null && !this.paused;
  }
}

/**
 * Kiểm tra bone có khớp mask hay không.
 * Khớp chính xác, khớp "bone chứa pattern" (vd `LeftArm` ⊃ `arm`), và khớp
 * "pattern chứa bone" chỉ khi pattern dài hơn bone (tránh `leg` khớp nhầm `l`).
 */
export function boneMatchesMask(boneName: string, mask: BlendMask): boolean {
  const n = normalizeBoneName(boneName);
  if (!n) return false;
  for (const raw of mask.bones) {
    const b = normalizeBoneName(raw.replace(/\*+$/, ''));
    if (!b) continue;
    if (n === b || n.includes(b)) return true;
    if (b.length > n.length && b.includes(n)) return true;
  }
  return false;
}

/** Lọc tracks của clip theo mask bone names (dùng cho mode masked/upperBody/lowerBody). */
export function filterClipByMask(clip: THREE.AnimationClip, mask: BlendMask): THREE.AnimationClip {
  const kept = clip.tracks.filter((t) => {
    let node = t.name;
    try {
      node = (THREE.PropertyBinding.parseTrackName(t.name) as { nodeName?: string }).nodeName ?? t.name;
    } catch {
      // giữ node = full name
    }
    return boneMatchesMask(node, mask);
  });
  return new THREE.AnimationClip(`${clip.name}#masked`, clip.duration, kept, clip.blendMode);
}

/** Lọc clip theo mask + báo cáo track giữ / bị loại. */
export function filterClipByMaskDetailed(
  clip: THREE.AnimationClip,
  mask: BlendMask,
): { clip: THREE.AnimationClip; keptTracks: string[]; droppedTracks: string[]; keepRatio: number } {
  const keptTracks: string[] = [];
  const droppedTracks: string[] = [];
  const kept = clip.tracks.filter((t) => {
    let node = t.name;
    try {
      node = (THREE.PropertyBinding.parseTrackName(t.name) as { nodeName?: string }).nodeName ?? t.name;
    } catch {
      // giữ node = full name
    }
    const match = boneMatchesMask(node, mask);
    if (match) keptTracks.push(t.name);
    else droppedTracks.push(t.name);
    return match;
  });
  const filtered = new THREE.AnimationClip(`${clip.name}#masked`, clip.duration, kept, clip.blendMode);
  return {
    clip: filtered,
    keptTracks,
    droppedTracks,
    keepRatio: clip.tracks.length > 0 ? keptTracks.length / clip.tracks.length : 0,
  };
}

function maskForMode(mode: BlendMode, explicit?: BlendMask): BlendMask | undefined {
  if (mode === 'masked') return explicit;
  if (mode === 'upperBody') return { bones: [...UPPER_BODY_PATTERNS] };
  if (mode === 'lowerBody') return { bones: [...LOWER_BODY_PATTERNS] };
  return explicit;
}

/**
 * StateBlender — wrapper đa layer quanh 1 AnimationMixer.
 * Mỗi layer play 1 clip (đã lọc theo mask nếu mode là masked/upperBody/lowerBody);
 * crossFade giữa 2 layer = fadeOut/fadeIn chuẩn three (override mode dùng 2 action chạy song song).
 */
export class StateBlender {
  readonly mixer: THREE.AnimationMixer;
  private layersByName = new Map<string, BlenderLayer>();
  private clipIndex = new Map<string, THREE.AnimationClip>();
  /** Clip riêng theo layer — đảm bảo mỗi layer có action riêng, không đụng nhau. */
  private layerClipCache = new Map<string, THREE.AnimationClip>();
  private warned = new Set<string>();
  /** Tổng thời gian đã mô phỏng (giây). */
  private elapsed = 0;

  constructor(root: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(root);
  }

  /** Đăng ký clips để findClip tra theo tên. */
  registerClips(clips: readonly THREE.AnimationClip[]): void {
    for (const c of clips) {
      if (!this.clipIndex.has(c.name)) this.clipIndex.set(c.name, c);
    }
  }

  /** Gỡ clip khỏi registry theo tên (dùng khi asset được unload). */
  unregisterClips(names: readonly string[]): boolean {
    let removed = false;
    for (const name of names) {
      if (this.clipIndex.delete(name)) removed = true;
    }
    return removed;
  }

  /** Clip có tồn tại trong registry hay không. */
  hasClip(name: string): boolean {
    return this.findClip(name) !== undefined;
  }

  /** Tra clip: chính xác → case-insensitive → contains. */
  findClip(name: string): THREE.AnimationClip | undefined {
    if (!name) return undefined;
    const exact = this.clipIndex.get(name);
    if (exact) return exact;
    const lower = name.toLowerCase();
    for (const [key, clip] of this.clipIndex) {
      if (key.toLowerCase() === lower) return clip;
    }
    for (const [key, clip] of this.clipIndex) {
      if (key.toLowerCase().includes(lower)) return clip;
    }
    return undefined;
  }

  get clipCount(): number {
    return this.clipIndex.size;
  }

  /** Danh sách tên clip đã đăng ký. */
  listClipNames(): string[] {
    return Array.from(this.clipIndex.keys());
  }

  /** Lấy hoặc tạo layer; opts chỉ áp khi tạo lần đầu (giữ state crossfade giữa các lần gọi). */
  layer(name: string, opts: BlenderLayerOptions = {}): BlenderLayer {
    let l = this.layersByName.get(name);
    if (!l) {
      l = new BlenderLayer(name);
      this.layersByName.set(name, l);
    }
    if (opts.mode) l.mode = opts.mode;
    if (opts.mask) l.mask = opts.mask;
    if (opts.weight !== undefined) l.weight = opts.weight;
    if (opts.timeScale !== undefined) l.timeScale = opts.timeScale;
    if (opts.loop !== undefined) l.loop = opts.loop;
    if (opts.repetitions !== undefined) l.repetitions = opts.repetitions;
    if (opts.clampWhenFinished !== undefined) l.clampWhenFinished = opts.clampWhenFinished;
    return l;
  }

  getLayer(name: string): BlenderLayer | undefined {
    return this.layersByName.get(name);
  }

  get layers(): BlenderLayer[] {
    return Array.from(this.layersByName.values());
  }

  get layerCount(): number {
    return this.layersByName.size;
  }

  /** Số layer đang chạy thật (có action + enabled + không paused). */
  get activeLayerCount(): number {
    let count = 0;
    for (const l of this.layersByName.values()) if (l.isRunning) count++;
    return count;
  }

  /** Tổng thời gian đã mô phỏng (giây). */
  get time(): number {
    return this.elapsed;
  }

  /**
   * Play 1 clip trên layer. Clip thiếu → layer disabled (không crash) + warn 1 lần.
   * Mỗi layer dùng clip riêng nên action không bị chia sẻ giữa các layer.
   */
  play(layer: BlenderLayer | string, clip: THREE.AnimationClip | string | undefined): BlenderLayer {
    const l = typeof layer === 'string' ? this.layer(layer) : layer;
    if (!clip) {
      this.warnOnce(`no-clip:${l.name}`, `StateBlender: không có clip cho layer "${l.name}" → layer disabled`);
      l.enabled = false;
      l.action?.stop();
      l.action = null;
      return l;
    }
    const resolved = typeof clip === 'string' ? this.findClip(clip) : clip;
    if (!resolved) {
      // key theo tên clip → warn đúng 1 lần cho mỗi clip thiếu, bất kể layer nào gọi
      this.warnOnce(`missing-clip:${String(clip)}`, `StateBlender: clip "${String(clip)}" không tồn tại → layer "${l.name}" disabled`);
      l.enabled = false;
      l.action?.stop();
      l.action = null;
      return l;
    }
    l.enabled = true;
    l.paused = false;
    l.clipName = resolved.name;

    const isAdditive = l.mode === 'additive' || l.mode === 'additiveBase';
    const mask = maskForMode(l.mode, l.mask);
    const useClip = this.layerClip(l.name, resolved, mask, isAdditive);

    l.action = this.mixer.clipAction(useClip);
    l.action.setLoop(l.loop, l.repetitions);
    l.action.clampWhenFinished = l.clampWhenFinished;
    l.action.enabled = true;
    l.action.reset().play();
    l.action.setEffectiveWeight(l.enabled ? l.weight : 0);
    l.action.setEffectiveTimeScale(l.timeScale);
    return l;
  }

  /** Dừng layer: action stop + disabled. Trả về true nếu layer tồn tại. */
  stop(layer: BlenderLayer | string): boolean {
    const l = typeof layer === 'string' ? this.layersByName.get(layer) : layer;
    if (!l) return false;
    l.action?.stop();
    l.enabled = false;
    l.action = null;
    return true;
  }

  /** Dừng toàn bộ layer. */
  stopAll(): number {
    let count = 0;
    for (const l of this.layersByName.values()) {
      if (l.action) {
        l.action.stop();
        l.action = null;
      }
      l.enabled = false;
      count++;
    }
    return count;
  }

  /** Bật/tắt layer mà không mất action. Trả về trạng thái mới. */
  setEnabled(layer: BlenderLayer | string, enabled: boolean): boolean {
    const l = typeof layer === 'string' ? this.layersByName.get(layer) : layer;
    if (!l) return false;
    l.enabled = enabled;
    l.action?.setEffectiveWeight(enabled ? l.weight : 0);
    return l.enabled;
  }

  /** Đặt trọng số layer (giới hạn 0..1). Trả về trọng số đã áp dụng. */
  setWeight(layer: BlenderLayer | string, weight: number): number {
    const l = typeof layer === 'string' ? this.layersByName.get(layer) : layer;
    if (!l) return 0;
    l.weight = Math.max(0, Math.min(1, Number.isFinite(weight) ? weight : 0));
    l.action?.setEffectiveWeight(l.enabled ? l.weight : 0);
    return l.weight;
  }

  /** Đặt tốc độ phát của layer. Trả về tốc độ đã áp dụng. */
  setTimeScale(layer: BlenderLayer | string, timeScale: number): number {
    const l = typeof layer === 'string' ? this.layersByName.get(layer) : layer;
    if (!l) return 0;
    l.timeScale = Number.isFinite(timeScale) ? timeScale : 1;
    l.action?.setEffectiveTimeScale(l.timeScale);
    return l.timeScale;
  }

  /** Đổi chế độ pha trộn của layer. Trả về mode mới. */
  setMode(layer: BlenderLayer | string, mode: BlendMode): BlendMode {
    const l = typeof layer === 'string' ? this.layersByName.get(layer) : layer;
    if (!l) return 'override';
    l.mode = mode;
    return l.mode;
  }

  /** Tạm dừng / tiếp tục layer mà không bỏ action. */
  setPaused(layer: BlenderLayer | string, paused: boolean): boolean {
    const l = typeof layer === 'string' ? this.layersByName.get(layer) : layer;
    if (!l) return false;
    l.paused = paused;
    l.action?.setEffectiveTimeScale(paused ? 0 : l.timeScale);
    return l.paused;
  }

  /**
   * Crossfade 2 layer: from fadeOut + to fadeIn (reset) trong `duration` giây.
   * Chỉ có tác dụng khi cả hai layer đều có action; thiếu 1 bên thì chỉ fadeIn bên còn lại.
   * Trả về layer đích (hoặc undefined nếu tên không tồn tại).
   */
  crossFade(from: BlenderLayer | string, to: BlenderLayer | string, duration = 0.25): BlenderLayer | undefined {
    const f = typeof from === 'string' ? this.layersByName.get(from) : from;
    const t = typeof to === 'string' ? this.layersByName.get(to) : to;
    if (f?.action) f.action.fadeOut(duration);
    if (t?.action) t.action.reset().fadeIn(duration).play();
    return t;
  }

  /** Trạng thái runtime đầy đủ của một layer. */
  getLayerState(name: string): LayerState | undefined {
    const l = this.layersByName.get(name);
    return l ? this.describeLayer(l) : undefined;
  }

  /** Trạng thái runtime của toàn bộ layer. */
  getState(): LayerState[] {
    return this.layers.map((l) => this.describeLayer(l));
  }

  /**
   * Trọng số chuẩn hoá của các layer đang chạy (tổng = 1).
   * Trả về map rỗng nếu không có layer đang chạy.
   */
  normalizedWeights(): Record<string, number> {
    const out: Record<string, number> = {};
    const active = this.layers.filter((l) => l.isRunning && l.weight > 0);
    const total = active.reduce((sum, l) => sum + l.weight, 0);
    if (total <= 0) return out;
    for (const l of active) out[l.name] = l.weight / total;
    return out;
  }

  /** Áp weight/timeScale mọi layer rồi bọc mixer.update. Trả về mixer.time. */
  update(dt: number): number {
    const delta = Number.isFinite(dt) && dt > 0 ? dt : 0;
    for (const l of this.layersByName.values()) {
      if (!l.action) continue;
      l.action.setEffectiveWeight(l.enabled ? l.weight : 0);
      l.action.setEffectiveTimeScale(l.paused ? 0 : l.timeScale);
    }
    if (delta > 0) {
      this.mixer.update(delta);
      this.elapsed += delta;
    }
    return this.mixer.time;
  }

  dispose(): void {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.mixer.getRoot() as THREE.Object3D);
    this.layersByName.clear();
    this.layerClipCache.clear();
    this.clipIndex.clear();
    this.warned.clear();
    this.elapsed = 0;
  }

  /** Mô tả trạng thái runtime của một layer. */
  private describeLayer(l: BlenderLayer): LayerState {
    const action = l.action;
    const clip = action?.getClip();
    const duration = clip?.duration ?? 0;
    const time = action?.time ?? 0;
    return {
      name: l.name,
      enabled: l.enabled,
      mode: l.mode,
      weight: l.weight,
      effectiveWeight: l.enabled ? l.weight : 0,
      timeScale: l.timeScale,
      clipName: l.clipName,
      running: l.isRunning,
      actionTime: time,
      actionDuration: duration,
      actionProgress: duration > 0 ? Math.min(1, time / duration) : 0,
      loop: l.loop,
      trackCount: clip?.tracks.length ?? 0,
      masked: Boolean(l.mask && l.mask.bones.length > 0) ||
        l.mode === 'upperBody' ||
        l.mode === 'lowerBody',
      additive: l.mode === 'additive' || l.mode === 'additiveBase',
    };
  }

  /**
   * Clip riêng cho từng layer — `mixer.clipAction` cache action theo clip nên
   * nếu 2 layer dùng chung một clip, chúng sẽ dùng chung action và trọng số
   * của layer sau ghi đè layer trước. Mỗi layer nhận một bản clone riêng.
   */
  private layerClip(
    layerName: string,
    clip: THREE.AnimationClip,
    mask: BlendMask | undefined,
    additive: boolean,
  ): THREE.AnimationClip {
    const masked = Boolean(mask && mask.bones.length > 0);
    const maskKey = masked ? (mask as BlendMask).bones.join(',') : '-';
    const key = `${layerName}|${clip.uuid}|${maskKey}|${additive ? 'add' : 'norm'}`;
    const cached = this.layerClipCache.get(key);
    if (cached) return cached;

    let out: THREE.AnimationClip;
    if (masked) {
      out = filterClipByMask(clip, mask as BlendMask);
    } else {
      out = clip.clone();
      // clone() không mang theo blendMode → giữ lại blendMode gốc.
      out.blendMode = clip.blendMode;
    }
    // Additive luôn giữ blendMode — kể cả khi clip đã bị lọc theo mask.
    if (additive) out.blendMode = THREE.AdditiveAnimationBlendMode;

    this.layerClipCache.set(key, out);
    return out;
  }

  private warnOnce(key: string, msg: string): void {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    console.warn('[state-blender]', msg);
  }
}
