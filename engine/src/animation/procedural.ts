/**
 * @file procedural.ts
 * @module @aetheria/engine/animation/procedural
 * @description Hoạt ảnh thủ tục (procedural): lò xo-tần số (spring-damper),
 * dao động tắt dần, value-noise đi bộ, look-at mượt, head-bob, đung đưa, chuyển
 * động bậc hai (follow-through) và pulse — kết hợp với clip để NPC sống động
 * mà không cần keyframe thủ công.
 */

import { DeepRandom, clampRange } from '../deeplearning/random.js';

/** Trạng thái lò xo 1D (vị trí + vận tốc). */
export interface SpringState {
  position: number;
  velocity: number;
}

/** Tạo lò xo tại vị trí ban đầu. */
export function createSpring(position = 0): SpringState {
  return { position, velocity: 0 };
}

/**
 * Một bước lò xo bán ẩn (semi-implicit Euler): `stiffness` (k), `damping` (c),
 * khối lượng chuẩn hóa 1. Ổn định khi `dt * sqrt(k) < 2`.
 */
export function updateSpring(
  state: SpringState,
  target: number,
  dt: number,
  stiffness = 120,
  damping = 14,
): number {
  const step = clampRange(dt, 0, 0.1);
  const acceleration = -stiffness * (state.position - target) - damping * state.velocity;
  state.velocity += acceleration * step;
  state.position += state.velocity * step;
  return state.position;
}

/** Dao động tắt dần quanh target (dùng hiệu ứng rung/hit reaction). */
export function dampedOscillation(
  time: number,
  amplitude: number,
  frequencyHz: number,
  decayRate: number,
): number {
  return amplitude * Math.exp(-decayRate * time) * Math.cos(2 * Math.PI * frequencyHz * time);
}

/** Bộ sinh value-noise 1D mượt (nội suy cosine giữa giá trị ngẫu nhiên). */
export class NoiseWalker {
  private readonly random: DeepRandom;
  private readonly values: number[] = [];
  private cursor = 0;

  constructor(seed = 1, private readonly resolution = 32) {
    this.random = new DeepRandom(seed);
    this.values.push(this.random.next() * 2 - 1);
  }

  /** Bước tiếp theo: nội suy mượt giữa hai mốc noise ngẫu nhiên. */
  public next(dt: number, frequencyHz = 1): number {
    this.cursor += Math.max(0, dt) * frequencyHz * this.resolution;
    while (this.cursor >= this.values.length - 1) {
      this.values.push(this.random.next() * 2 - 1);
    }
    const index = Math.floor(this.cursor);
    const alpha = this.cursor - index;
    const a = this.values[index] ?? 0;
    const b = this.values[index + 1] ?? a;
    const smooth = alpha * alpha * (3 - 2 * alpha);
    return a + (b - a) * smooth;
  }

  /** Reset về đầu. */
  public reset(): void {
    this.cursor = 0;
  }
}

/** Head-bob: dao động dọc theo pha di chuyển (sync với footPhase). */
export function headBob(phase: number, amplitude = 0.05, cyclesPerLoop = 2): number {
  return Math.sin(phase * Math.PI * 2 * cyclesPerLoop) * amplitude;
}

/** Sway hông: dao động ngang lệch pha 90° so với head-bob. */
export function hipSway(phase: number, amplitude = 0.04, cyclesPerLoop = 1): number {
  return Math.cos(phase * Math.PI * 2 * cyclesPerLoop) * amplitude;
}

/** Look-at mượt: quay góc hiện tại về mục tiêu với tốc độ giới hạn (rad/s). */
export function smoothLookAt(
  currentAngle: number,
  targetAngle: number,
  maxSpeedRadPerSecond: number,
  dt: number,
): number {
  let delta = targetAngle - currentAngle;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  const step = clampRange(maxSpeedRadPerSecond * Math.max(0, dt), 0, Math.abs(delta));
  return currentAngle + Math.sign(delta) * step;
}

/** Chuyển động bậc hai (follow-through): phần đuôi trễ theo phần đầu. */
export function followThrough(
  leader: number,
  followerState: SpringState,
  dt: number,
  stiffness = 60,
  damping = 10,
): number {
  return updateSpring(followerState, leader, dt, stiffness, damping);
}

/** Pulse nhịp theo thời gian: `0..1` dạng sóng nhịp tim đếm bước. */
export function pulse(time: number, beatsPerSecond: number, duty = 0.35): number {
  if (beatsPerSecond <= 0) return 0;
  const phase = (time * beatsPerSecond) % 1;
  return phase < duty ? 1 - phase / duty : 0;
}

/** Sóng hình học cơ bản: sine/square/triangle/sawtooth theo biên độ. */
export function wave(
  time: number,
  frequencyHz: number,
  amplitude: number,
  shape: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine',
): number {
  if (frequencyHz <= 0) return 0;
  const phase = (time * frequencyHz) % 1;
  switch (shape) {
    case 'square': return phase < 0.5 ? amplitude : -amplitude;
    case 'triangle': return amplitude * (phase < 0.5 ? phase * 4 - 1 : 3 - phase * 4);
    case 'sawtooth': return amplitude * (phase * 2 - 1);
    case 'sine':
    default: return amplitude * Math.sin(phase * Math.PI * 2);
  }
}

/** Hiệu ứng hit-reaction: xung tắt dần theo hướng ngẫu nhiên có seed. */
export function hitReaction(time: number, seed = 1, amplitude = 0.2): number {
  const random = new DeepRandom(seed);
  return dampedOscillation(time, amplitude * (random.next() * 0.5 + 0.75), 8, 6);
}

/** Breathe idle: dao động thở chậm cho trạng thái đứng yên. */
export function breathe(time: number, amplitude = 0.02, breathsPerSecond = 0.25): number {
  return wave(time, breathsPerSecond, amplitude, 'sine');
}

/** Khớp hợp hai nguồn procedural (procedural + clip) bằng trọng số. */
export function blendProcedural(base: number, procedural: number, weight: number): number {
  return base + (procedural - base) * clampRange(weight, 0, 1);
}

/** Tiến trạng thái procedural một frame (helper cho vòng update của NPC). */
export interface ProceduralUpdate {
  bob: number;
  sway: number;
  breathe: number;
}

/** Bộ trạng thái procedural cho một nhân vật. */
export class ProceduralAnimator {
  private readonly walker = new NoiseWalker(7);
  private readonly bobSpring = createSpring();
  private readonly swaySpring = createSpring();

  /** Tiến một bước và trả các thành phần offset (đơn vị tùy game). */
  public update(dt: number, moveSpeed: number, phase: number): ProceduralUpdate {
    const bobTarget = headBob(phase, 0.05 * clampRange(moveSpeed, 0, 2));
    const swayTarget = hipSway(phase, 0.04 * clampRange(moveSpeed, 0, 2)) + this.walker.next(dt, 0.5) * 0.01;
    return {
      bob: updateSpring(this.bobSpring, bobTarget, dt, 90, 12),
      sway: updateSpring(this.swaySpring, swayTarget, dt, 70, 11),
      breathe: breathe(dt, 0.02),
    };
  }
}
