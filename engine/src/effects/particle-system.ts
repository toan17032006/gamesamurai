// engine/src/effects/particle-system.ts — Khởi tạo và quản lý hệ thống hạt 3D (lửa, khói, tuyết, bụi, sét, nổ)
import * as THREE from 'three';
import type { EmitterConfig } from '../types/effects.types';

const PARTICLE_VERT = `
attribute vec3 aVelocity;
attribute float aLife;
attribute float aMaxLife;
attribute float aSize;
uniform float uGravity;
varying float vT;
void main() {
  float age = aMaxLife > 0.0 ? (aMaxLife - aLife) : 0.0;
  float t = aMaxLife > 0.0 ? clamp(age / aMaxLife, 0.0, 1.0) : 1.0;
  vT = t;
  vec3 pos = position + aVelocity * age;
  pos.y -= uGravity * age * age * 0.5;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (1.0 - t) * (300.0 / max(0.001, -mv.z));
  gl_Position = projectionMatrix * mv;
}`;

const PARTICLE_FRAG = `
uniform vec3 uColorFrom;
uniform vec3 uColorTo;
varying float vT;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  if (d > 0.5) discard;
  vec3 color = mix(uColorFrom, uColorTo, vT);
  float alpha = (1.0 - vT) * (1.0 - d * 2.0);
  gl_FragColor = vec4(color, alpha);
}`;

interface EmitterState {
  id: string;
  cfg: EmitterConfig;
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  posAttr: THREE.BufferAttribute;
  velAttr: THREE.BufferAttribute;
  lifeAttr: THREE.BufferAttribute;
  maxLifeAttr: THREE.BufferAttribute;
  sizeAttr: THREE.BufferAttribute;
  cursor: number;
  acc: number;
  stopping: boolean;
  alive: number;
  origin: THREE.Vector3;
}

function randRange(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

function hexToVec3(hex: number): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

export class ParticleSystem {
  readonly group = new THREE.Group();
  private emitters = new Map<string, EmitterState>();
  private seq = 0;

  get emitterCount(): number {
    return this.emitters.size;
  }

  createEmitter(cfg: EmitterConfig): { id: string; setPosition: (x: number, y: number, z: number) => void } {
    const id = this.spawn(cfg, new THREE.Vector3());
    const emitter = this.emitters.get(id);
    return {
      id,
      setPosition: (x: number, y: number, z: number) => {
        if (emitter) {
          emitter.points.position.set(x, y, z);
          emitter.origin.set(x, y, z);
        }
      },
    };
  }

  removeEmitter(id: string): void {
    this.stop(id);
  }

  getActiveParticleCount(): number {
    let total = 0;
    for (const e of this.emitters.values()) total += e.alive;
    return total;
  }

  dispose(): void {
    this.clear();
  }

  spawn(cfg: EmitterConfig, at: THREE.Vector3): string {
    let id = cfg.id;
    if (this.emitters.has(id)) id = `${cfg.id}_${++this.seq}`;

    const max = Math.max(1, Math.floor(cfg.max));
    const geometry = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(new Float32Array(max * 3), 3);
    const velAttr = new THREE.BufferAttribute(new Float32Array(max * 3), 3);
    const lifeAttr = new THREE.BufferAttribute(new Float32Array(max), 1);
    const maxLifeAttr = new THREE.BufferAttribute(new Float32Array(max), 1);
    const sizeAttr = new THREE.BufferAttribute(new Float32Array(max), 1);
    geometry.setAttribute('position', posAttr);
    geometry.setAttribute('aVelocity', velAttr);
    geometry.setAttribute('aLife', lifeAttr);
    geometry.setAttribute('aMaxLife', maxLifeAttr);
    geometry.setAttribute('aSize', sizeAttr);
    geometry.setDrawRange(0, max);
    geometry.boundingSphere = new THREE.Sphere(at.clone(), 1e6);

    const material = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      uniforms: {
        uGravity: { value: cfg.gravity ?? 0 },
        uColorFrom: { value: hexToVec3(cfg.colorFrom) },
        uColorTo: { value: hexToVec3(cfg.colorTo) },
      },
      transparent: true,
      depthWrite: false,
      blending: cfg.blend === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.name = `emitter_${id}`;
    if (!cfg.worldSpace) points.position.copy(at);

    this.group.add(points);

    const state: EmitterState = {
      id,
      cfg,
      points,
      geometry,
      material,
      posAttr,
      velAttr,
      lifeAttr,
      maxLifeAttr,
      sizeAttr,
      cursor: 0,
      acc: 0,
      stopping: false,
      alive: 0,
      origin: at.clone(),
    };

    const initial = Math.min(max, Math.max(1, Math.ceil(cfg.rate)));
    for (let i = 0; i < initial; i++) this.emitOne(state);

    this.emitters.set(id, state);
    return id;
  }

  stop(id: string): void {
    const s = this.emitters.get(id);
    if (s) s.stopping = true;
  }

  stopAll(): void {
    for (const s of this.emitters.values()) s.stopping = true;
  }

  aliveCount(id?: string): number {
    if (id) return this.emitters.get(id)?.alive ?? 0;
    let sum = 0;
    for (const s of this.emitters.values()) sum += s.alive;
    return sum;
  }

  update(dt: number): void {
    const toRemove: string[] = [];
    for (const [id, s] of this.emitters) {
      if (!s.stopping && s.cfg.rate > 0) {
        s.acc += s.cfg.rate * dt;
        const count = Math.floor(s.acc);
        if (count > 0) {
          s.acc -= count;
          const clamped = Math.min(count, s.cfg.max);
          for (let i = 0; i < clamped; i++) this.emitOne(s);
        }
      }

      const life = s.lifeAttr.array as Float32Array;
      let alive = 0;
      for (let i = 0; i < life.length; i++) {
        if (life[i] > 0) {
          life[i] -= dt;
          if (life[i] <= 0) life[i] = 0;
          else alive++;
        }
      }
      s.alive = alive;
      s.lifeAttr.needsUpdate = true;

      if (s.stopping && alive === 0) toRemove.push(id);
    }

    for (const id of toRemove) this.disposeEmitter(id);
  }

  clear(): void {
    for (const id of Array.from(this.emitters.keys())) this.disposeEmitter(id);
  }

  private emitOne(s: EmitterState): void {
    const idx = s.cursor;
    s.cursor = (s.cursor + 1) % s.cfg.max;

    const jitter = s.cfg.velocityJitter ?? [0, 0, 0];
    const vx = s.cfg.velocity[0] + (Math.random() - 0.5) * jitter[0];
    const vy = s.cfg.velocity[1] + (Math.random() - 0.5) * jitter[1];
    const vz = s.cfg.velocity[2] + (Math.random() - 0.5) * jitter[2];

    const maxLife = randRange(s.cfg.lifetime[0], s.cfg.lifetime[1]);
    const size = randRange(s.cfg.size[0], s.cfg.size[1]);

    const pos = s.posAttr.array as Float32Array;
    const vel = s.velAttr.array as Float32Array;
    const life = s.lifeAttr.array as Float32Array;
    const maxL = s.maxLifeAttr.array as Float32Array;
    const sz = s.sizeAttr.array as Float32Array;

    const base = s.cfg.worldSpace ? s.origin : { x: 0, y: 0, z: 0 };
    pos[idx * 3] = base.x;
    pos[idx * 3 + 1] = base.y;
    pos[idx * 3 + 2] = base.z;

    vel[idx * 3] = vx;
    vel[idx * 3 + 1] = vy;
    vel[idx * 3 + 2] = vz;

    life[idx] = maxLife;
    maxL[idx] = maxLife;
    sz[idx] = size;

    s.posAttr.needsUpdate = true;
    s.velAttr.needsUpdate = true;
    s.lifeAttr.needsUpdate = true;
    s.maxLifeAttr.needsUpdate = true;
    s.sizeAttr.needsUpdate = true;
    s.alive = Math.min(s.cfg.max, s.alive + 1);
  }

  private disposeEmitter(id: string): void {
    const s = this.emitters.get(id);
    if (!s) return;
    s.points.removeFromParent();
    s.geometry.dispose();
    s.material.dispose();
    this.emitters.delete(id);
  }
}
