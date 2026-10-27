/**
 * @file player.ts
 * @module @aetheria/engine/animation/player
 * @description Bộ phát hoạt ảnh (animation player/mixer): chơi nhiều clip trên
 * nhiều layer với trọng số, time scale, wrap mode, crossfade có easing, phát
 * event đúng một lần mỗi vòng lặp và ghi pose vào `PoseTarget` để tầng render
 * của thư viện đồ họa áp lên object thật.
 */

import { clampRange } from '../deeplearning/random.js';
import { evaluateTrack } from './curve.js';
import { applyEasing } from './easing.js';
import { blendLayers, dedupeEvents, emptyPose } from './blend.js';
import type { AnimationClip } from './clip.js';
import type {
  AnimationEventKey,
  AnimationPose,
  ClipLayerState,
  PoseTarget,
  TrackEvaluation,
  WrapMode,
} from './types.js';

/** Cấu hình một layer khi thêm vào player. */
export interface PlayerLayerOptions {
  name: string;
  clip: AnimationClip;
  weight?: number;
  blendMode?: 'override' | 'additive';
  mask?: readonly string[];
  timeScale?: number;
  wrapMode?: WrapMode;
}

/** Trạng thái runtime một layer. */
interface PlayerLayer {
  name: string;
  clip: AnimationClip;
  weight: number;
  blendMode: 'override' | 'additive';
  mask?: readonly string[];
  timeScale: number;
  wrapMode: WrapMode;
  paused: boolean;
  time: number;
  /** Chiều ping-pong (1 = xuôi, −1 = ngược). */
  direction: 1 | -1;
  /** Đường crossfade đang thực hiện tới trọng số đích. */
  crossfade: { fromWeight: number; targetWeight: number; elapsed: number; duration: number; easing?: string } | null;
  /** Event đã phát trong vòng lặp hiện tại (theo chỉ số). */
  firedMask: boolean[];
}

/**
 * AnimationPlayer: mixer nhiều layer cho một character/object.
 *
 * Dùng:
 * 1. `registerClip(...)` + `addLayer({ name, clip })` — layer đầu là base (override).
 * 2. `play('run')` / `stopLayer('idle')` / `crossfade('walk', 'run', 0.3)`.
 * 3. Mỗi frame: `update(dt)` → pose; `applyTo(target)` ghi vào object render.
 */
export class AnimationPlayer {
  public timeScale = 1;
  private readonly layers = new Map<string, PlayerLayer>();
  private readonly clipLibrary = new Map<string, AnimationClip>();
  private readonly eventHandlers = new Map<string, Array<(event: AnimationEventKey) => void>>();
  private paused = false;

  /** Đăng ký clip vào thư viện (player tra theo tên). */
  public registerClip(clip: AnimationClip): void {
    this.clipLibrary.set(clip.name, clip);
  }

  /** Tra clip theo tên. */
  public getClip(name: string): AnimationClip | null {
    return this.clipLibrary.get(name) ?? null;
  }

  /** Danh sách layer đang có (theo thứ tự thêm). */
  public layerNames(): string[] {
    return [...this.layers.keys()];
  }

  /** Thêm layer chơi một clip. */
  public addLayer(options: PlayerLayerOptions): void {
    if (this.layers.has(options.name)) {
      throw new RangeError(`Layer "${options.name}" đã tồn tại`);
    }
    this.clipLibrary.set(options.clip.name, options.clip);
    this.layers.set(options.name, {
      name: options.name,
      clip: options.clip,
      weight: clampRange(options.weight ?? 1, 0, 1),
      blendMode: options.blendMode ?? 'override',
      mask: options.mask,
      timeScale: Math.max(0, options.timeScale ?? 1),
      wrapMode: options.wrapMode ?? 'loop',
      paused: false,
      time: 0,
      direction: 1,
      crossfade: null,
      firedMask: new Array<boolean>(options.clip.events.length).fill(false),
    });
  }

  /** Xóa layer. */
  public removeLayer(name: string): boolean {
    return this.layers.delete(name);
  }

  /** Bật layer với trọng số. */
  public play(name: string, weight = 1): void {
    const layer = this.requireLayer(name);
    layer.weight = clampRange(weight, 0, 1);
    layer.paused = false;
  }

  /** Tạm dừng một layer (giữ thời điểm). */
  public pauseLayer(name: string): void {
    this.requireLayer(name).paused = true;
  }

  /** Dừng và reset một layer về thời điểm 0. */
  public stopLayer(name: string): void {
    const layer = this.requireLayer(name);
    layer.paused = true;
    layer.time = 0;
    layer.direction = 1;
    layer.firedMask.fill(false);
  }

  /** Đổi clip của layer (giữ trọng số/thời điểm nếu muốn). */
  public setLayerClip(name: string, clip: AnimationClip, resetTime = true): void {
    const layer = this.requireLayer(name);
    this.clipLibrary.set(clip.name, clip);
    layer.clip = clip;
    layer.firedMask = new Array<boolean>(clip.events.length).fill(false);
    if (resetTime) {
      layer.time = 0;
    }
  }

  /** Crossfade một layer tới trọng số đích với easing. */
  public fadeLayer(name: string, targetWeight: number, duration: number, easing?: string): void {
    const layer = this.requireLayer(name);
    layer.crossfade = {
      fromWeight: layer.weight,
      targetWeight: clampRange(targetWeight, 0, 1),
      elapsed: 0,
      duration: Math.max(0, duration),
      easing,
    };
  }

  /** Crossfade giữa hai layer (fade-out nguồn, fade-in đích). */
  public crossfade(fromLayer: string, toLayer: string, duration: number, easing?: string): void {
    this.fadeLayer(fromLayer, 0, duration, easing);
    this.fadeLayer(toLayer, 1, duration, easing);
    this.play(toLayer);
  }

  /** Đặt time scale của một layer (slow-motion cục bộ). */
  public setLayerTimeScale(name: string, timeScale: number): void {
    this.requireLayer(name).timeScale = Math.max(0, timeScale);
  }

  /** Nhảy tới thời điểm của một layer (giây). */
  public seekLayer(name: string, time: number): void {
    const layer = this.requireLayer(name);
    layer.time = clampRange(time, 0, Math.max(layer.clip.duration, 0));
    layer.firedMask.fill(false);
  }

  /** Pause toàn bộ player. */
  public pause(): void {
    this.paused = true;
  }

  /** Resume toàn bộ player. */
  public resume(): void {
    this.paused = false;
  }

  /** Player có đang pause không. */
  public get isPaused(): boolean {
    return this.paused;
  }

  /** Đăng ký handler cho sự kiện clip (vd 'footstep'). */
  public onEvent(eventName: string, handler: (event: AnimationEventKey) => void): void {
    const handlers = this.eventHandlers.get(eventName) ?? [];
    handlers.push(handler);
    this.eventHandlers.set(eventName, handlers);
  }

  /**
   * Tiến player một bước thời gian và trả pose hợp nhất.
   *
   * Event phát trong khung vừa chơi được gắn vào pose và đẩy tới handler.
   */
  public update(dt: number): AnimationPose {
    const layerPoses: Array<{
      pose: AnimationPose;
      weight: number;
      blendMode: 'override' | 'additive';
      mask?: readonly string[];
    }> = [];
    if (!this.paused) {
      const scaledDt = Math.max(0, dt) * this.timeScale;
      for (const layer of this.layers.values()) {
        this.advanceLayer(layer, scaledDt);
      }
    }
    for (const layer of this.layers.values()) {
      layerPoses.push({
        pose: this.sampleLayer(layer),
        weight: layer.weight,
        blendMode: layer.blendMode,
        mask: layer.mask,
      });
    }
    const pose = blendLayers(layerPoses);
    pose.firedEvents = dedupeEvents(layerPoses.map((entry) => entry.pose));
    this.dispatchEvents(pose.firedEvents);
    return pose;
  }

  /** Ghi pose vào target của tầng render; trả số path áp thành công. */
  public applyTo(target: PoseTarget, dt: number): number {
    const pose = this.update(dt);
    let applied = 0;
    for (const [path, evaluation] of pose.bindings) {
      if (target.apply(path, evaluation.values, evaluation.kind)) applied++;
    }
    return applied;
  }

  /** Snapshot trạng thái player (checkpoint/save). */
  public snapshot(): {
    timeScale: number;
    paused: boolean;
    layers: ClipLayerState[];
    times: Record<string, number>;
  } {
    const times: Record<string, number> = {};
    const layers: ClipLayerState[] = [];
    for (const layer of this.layers.values()) {
      times[layer.name] = layer.time;
      layers.push({
        clipName: layer.clip.name,
        weight: layer.weight,
        blendMode: layer.blendMode,
        mask: layer.mask,
        timeScale: layer.timeScale,
      });
    }
    return { timeScale: this.timeScale, paused: this.paused, layers, times };
  }

  /** Khôi phục thời điểm các layer từ snapshot. */
  public restoreSnapshot(snapshot: { times: Record<string, number> }): void {
    for (const [name, time] of Object.entries(snapshot.times)) {
      const layer = this.layers.get(name);
      if (layer) {
        layer.time = time;
        layer.firedMask.fill(false);
      }
    }
  }

  // --- Nội bộ ---------------------------------------------------------------

  private requireLayer(name: string): PlayerLayer {
    const layer = this.layers.get(name);
    if (!layer) throw new RangeError(`Layer "${name}" không tồn tại`);
    return layer;
  }

  /** Tiến thời gian một layer theo wrap mode + cập nhật crossfade. */
  private advanceLayer(layer: PlayerLayer, dt: number): void {
    if (layer.crossfade) {
      layer.crossfade.elapsed += dt;
      const alpha = clampRange(
        layer.crossfade.elapsed / Math.max(layer.crossfade.duration, 1e-9),
        0,
        1,
      );
      layer.weight =
        layer.crossfade.fromWeight +
        (layer.crossfade.targetWeight - layer.crossfade.fromWeight) *
        applyEasing(layer.crossfade.easing, alpha);
      if (alpha >= 1) {
        layer.weight = layer.crossfade.targetWeight;
        layer.crossfade = null;
      }
    }
    if (layer.paused) return;
    const previousTime = layer.time;
    const scaled = dt * layer.timeScale;
    layer.time += scaled * layer.direction;
    switch (layer.wrapMode) {
      case 'once':
      case 'clamp':
        layer.time = clampRange(layer.time, 0, layer.clip.duration);
        break;
      case 'ping-pong':
        if (layer.time >= layer.clip.duration) {
          layer.time = Math.max(0, 2 * layer.clip.duration - layer.time);
          layer.direction = -1;
          layer.firedMask.fill(false);
        } else if (layer.time <= 0) {
          layer.time = Math.abs(layer.time);
          layer.direction = 1;
          layer.firedMask.fill(false);
        }
        break;
      case 'loop':
      default:
        if (layer.time > layer.clip.duration) {
          layer.time = layer.time % Math.max(layer.clip.duration, 1e-9);
          layer.firedMask.fill(false);
        }
        break;
    }
    // Đi ngược thời gian (ping-pong) thì event phát theo chiều ngược.
    if (layer.time < previousTime && layer.direction === -1) {
      layer.firedMask.fill(false);
    }
  }

  /** Sample một layer: clip tại thời điểm hiện tại + event vừa tới mốc. */
  private sampleLayer(layer: PlayerLayer): AnimationPose {
    const pose = emptyPose();
    for (const track of layer.clip.tracks) {
      const evaluation: TrackEvaluation = {
        trackName: track.name,
        targetPath: track.targetPath,
        kind: track.kind,
        values: evaluateTrack(track, layer.time),
      };
      pose.bindings.set(track.targetPath, evaluation);
    }
    pose.firedEvents = this.collectDueEvents(layer);
    return pose;
  }

  /** Thu thập event tới mốc trong frame này (mỗi event phát đúng một lần/vòng). */
  private collectDueEvents(layer: PlayerLayer): AnimationEventKey[] {
    const due: AnimationEventKey[] = [];
    layer.clip.events.forEach((event, index) => {
      if (layer.firedMask[index]) return;
      const reached = layer.direction === 1
        ? event.time <= layer.time
        : event.time >= layer.time;
      if (reached) {
        layer.firedMask[index] = true;
        due.push({ ...event });
      }
    });
    return due.sort((a, b) => a.time - b.time);
  }

  /** Đẩy event tới các handler đã đăng ký. */
  private dispatchEvents(events: readonly AnimationEventKey[]): void {
    for (const event of events) {
      const handlers = this.eventHandlers.get(event.name);
      if (!handlers) continue;
      for (const handler of handlers) handler(event);
    }
  }
}
