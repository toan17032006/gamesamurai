// engine/src/physics/rigid-body.ts — Mô phỏng động lực học vật rắn (Mass, velocity, forces) & mặt phẳng
import type { PhysicsBody } from '../types/physics.types';
import { GravityEngine, type GravityConfig } from './gravity-engine';

export interface GroundConfig {
  y?: number;
  restitution?: number;
  friction?: number;
}

export function bottomOffset(shape: PhysicsBody['shape']): number {
  if (shape.kind === 'sphere') return shape.radius;
  if (shape.kind === 'box') return shape.half.y;
  if (shape.kind === 'capsule') {
    // Capsule nằm ngang (axis x/z): đáy = radius, không phải height/2.
    return shape.axis === 'x' || shape.axis === 'z' ? shape.radius : shape.height / 2;
  }
  if (shape.kind === 'cylinder') return shape.height / 2;
  return 0.5;
}

/** Khoảng cách từ body.position tới đáy VA CHẠM (đã gồm shape.center offset). */
export function collisionBottomOffset(shape: PhysicsBody['shape']): number {
  const centerY = 'center' in shape && shape.center ? shape.center.y : 0;
  return bottomOffset(shape) - centerY;
}

export function resolveGround(body: PhysicsBody, cfg: GroundConfig = {}): boolean {
  if (body.isStatic) return false;
  const groundY = cfg.y ?? 0;
  const restitution = cfg.restitution ?? 0.2;
  const friction = cfg.friction ?? 0.85;
  // Dùng đáy VA CHẠM (gồm shape.center offset) — trước đây bỏ qua center
  // khiến vật có tâm va chạm lệch bị kéo lên/lún sai (lệch tâm).
  const bottom = body.position.y - collisionBottomOffset(body.shape);
  if (bottom >= groundY) return false;
  body.position.y += groundY - bottom;
  if (body.velocity.y < 0) {
    body.velocity.y = -body.velocity.y * restitution;
    if (Math.abs(body.velocity.y) < 0.5) body.velocity.y = 0;
  }
  body.velocity.x *= friction;
  body.velocity.z *= friction;
  return true;
}

export interface RigidBodyOptions {
  /** Ngưỡng tốc độ (đơn vị/giây) dưới đó body bắt đầu ngủ. */
  sleepLinearThreshold?: number;
  /** Số frame liên tiếp chậm trước khi ngủ. */
  sleepFrames?: number;
  /** Số bước tích phân con mỗi frame — ổn định hơn với dt lớn. */
  substeps?: number;
}

export class RigidBody {
  readonly body: PhysicsBody;
  readonly gravity: GravityEngine;
  /** Body đang ngủ: không tích phân cho đến khi được đánh thức. */
  public isSleeping = false;
  private readonly sleepLinearThreshold: number;
  private readonly sleepFramesNeeded: number;
  private readonly substeps: number;
  private slowFrames = 0;

  constructor(body: PhysicsBody, gravityCfg: GravityConfig = {}, options: RigidBodyOptions = {}) {
    this.body = body;
    this.gravity = new GravityEngine(gravityCfg);
    this.sleepLinearThreshold = Math.max(0, options.sleepLinearThreshold ?? 0.05);
    this.sleepFramesNeeded = Math.max(1, options.sleepFrames ?? 30);
    this.substeps = clamp(Math.floor(options.substeps ?? 1), 1, 8);
  }

  get id(): string {
    return this.body.id;
  }

  get speedSquared(): number {
    const v = this.body.velocity;
    return v.x * v.x + v.y * v.y + v.z * v.z;
  }

  /** Đánh thức body ngủ (sau khi bị va chạm hoặc nhận lực). */
  wake(): void {
    this.isSleeping = false;
    this.slowFrames = 0;
  }

  /** Thêm xung lượng trực tiếp vào vận tốc (khối lượng đơn vị). Tự đánh thức. */
  applyImpulse(ix: number, iy: number, iz: number): void {
    if (this.body.isStatic) return;
    this.body.velocity.x += ix;
    this.body.velocity.y += iy;
    this.body.velocity.z += iz;
    this.wake();
  }

  /**
   * Tích phân với substeps và hệ ngủ: body chậm liên tiếp `sleepFrames` frame
   * đi vào ngủ, bỏ qua tích phân cho tới khi được đánh thức — tiết kiệm lớn khi
   * thế giới có hàng nghìn vật nằm yên.
   */
  integrate(dt: number): void {
    if (this.body.isStatic) return;
    if (this.isSleeping) {
      if (this.speedSquared > this.sleepLinearThreshold * this.sleepLinearThreshold) this.wake();
      else return;
    }
    const steps = this.substeps;
    const sub = dt / steps;
    for (let i = 0; i < steps; i++) this.gravity.integrate(this.body, sub);

    if (this.speedSquared < this.sleepLinearThreshold * this.sleepLinearThreshold) {
      this.slowFrames++;
      if (this.slowFrames >= this.sleepFramesNeeded) this.isSleeping = true;
    } else {
      this.slowFrames = 0;
    }
  }

  resolveGround(cfg: GroundConfig = {}): boolean {
    const resolved = resolveGround(this.body, cfg);
    if (resolved) this.wake();
    return resolved;
  }
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}
