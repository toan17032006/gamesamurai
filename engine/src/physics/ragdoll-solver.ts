// engine/src/physics/ragdoll-solver.ts — Giải quyết khớp nối xương vật lý khi ngã/chết (Verlet constraint solver)
import * as THREE from 'three';
import type { RagdollJoint } from '../types/physics.types';
import { findBone } from '../combiner/socket-binder';

export interface RagdollPoint {
  bone: string;
  pos: THREE.Vector3;
  position: THREE.Vector3;
  prev: THREE.Vector3;
  pinned: boolean;
}

export interface RagdollConstraint {
  a: number;
  b: number;
  rest: number;
  stiffness: number;
}

export interface RagdollOptions {
  stiffness?: number;
  gravity?: number;
  damping?: number;
  defaultRestLength?: number;
  iterations?: number;
}

export class RagdollSolver {
  readonly joints: readonly RagdollJoint[];
  points: RagdollPoint[] = [];
  constraints: RagdollConstraint[] = [];
  gravity: number;
  damping: number;
  iterations: number;
  private stiffness: number;
  private defaultRestLength: number;
  private pointIndex = new Map<string, number>();
  private seeded = false;

  constructor(
    jointsOrConfig: readonly RagdollJoint[] | { points?: Array<{ id: string; position: THREE.Vector3; mass?: number }>; constraints?: Array<{ a: string; b: string; distance?: number; stiffness?: number }>; rootPosition?: THREE.Vector3 },
    opts: RagdollOptions = {}
  ) {
    if (Array.isArray(jointsOrConfig)) {
      this.joints = jointsOrConfig;
    } else {
      this.joints = [];
      const cfg = jointsOrConfig as {
        points?: Array<{ id: string; position: THREE.Vector3; mass?: number }>;
        constraints?: Array<{ a: string; b: string; distance?: number; stiffness?: number }>;
        rootPosition?: THREE.Vector3;
      };
      if (cfg.points) {
        for (const pt of cfg.points) {
          const idx = this.points.length;
          const pos = pt.position.clone();
          this.points.push({
            bone: pt.id,
            pos,
            position: pos,
            prev: pt.position.clone(),
            pinned: false,
          });
          this.pointIndex.set(pt.id, idx);
        }
      }
      if (cfg.constraints) {
        for (const c of cfg.constraints) {
          const ia = this.pointIndex.get(c.a) ?? 0;
          const ib = this.pointIndex.get(c.b) ?? 0;
          const rest = c.distance ?? (this.points[ia] && this.points[ib] ? this.points[ia].pos.distanceTo(this.points[ib].pos) : 0.15);
          this.constraints.push({ a: ia, b: ib, rest, stiffness: c.stiffness ?? 0.9 });
        }
      }
      this.seeded = true;
    }
    this.stiffness = opts.stiffness ?? 0.9;
    this.gravity = opts.gravity ?? -9.81;
    this.damping = opts.damping ?? 0.98;
    this.iterations = opts.iterations ?? 3;
    this.defaultRestLength = opts.defaultRestLength ?? 0.15;
  }

  getPoint(bone: string): RagdollPoint | undefined {
    const idx = this.pointIndex.get(bone);
    return idx !== undefined ? this.points[idx] : undefined;
  }

  seed(rig?: THREE.Object3D): void {
    this.points = [];
    this.constraints = [];
    this.pointIndex.clear();
    const indexOf = (bone: string): number => {
      const existing = this.pointIndex.get(bone);
      if (existing !== undefined) return existing;
      const idx = this.points.length;
      const v = new THREE.Vector3();
      const p: RagdollPoint = {
        bone,
        pos: v,
        position: v,
        prev: new THREE.Vector3(),
        pinned: false,
      };
      this.points.push(p);
      this.pointIndex.set(bone, idx);
      return idx;
    };
    for (const j of this.joints) {
      const ia = indexOf(j.bone);
      const ib = indexOf(j.parentBone);
      let rest = this.defaultRestLength;
      if (rig) {
        const ba = findBone(rig, j.bone);
        const bb = findBone(rig, j.parentBone);
        if (ba && bb) {
          const pa = new THREE.Vector3();
          const pb = new THREE.Vector3();
          ba.getWorldPosition(pa);
          bb.getWorldPosition(pb);
          const d = pa.distanceTo(pb);
          if (d > 1e-6) rest = d;
        }
      }
      this.constraints.push({ a: ia, b: ib, rest, stiffness: j.stiffness ?? this.stiffness });
    }
    this.seeded = true;
  }

  syncFromRig(rig: THREE.Object3D): void {
    if (!this.seeded) this.seed(rig);
    for (const p of this.points) {
      const b = findBone(rig, p.bone);
      if (b) {
        b.getWorldPosition(p.pos);
        p.prev.copy(p.pos);
      }
    }
  }

  step(dt: number, groundY = 0): void {
    if (!this.seeded) return;
    const g = new THREE.Vector3(0, this.gravity * dt * dt, 0);

    for (const p of this.points) {
      if (p.pinned) continue;
      const vel = p.pos.clone().sub(p.prev).multiplyScalar(this.damping);
      p.prev.copy(p.pos);
      p.pos.add(vel).add(g);
      if (p.pos.y < groundY) {
        p.pos.y = groundY;
        p.prev.y = groundY;
      }
    }

    for (let it = 0; it < this.iterations; it++) {
      for (const c of this.constraints) {
        const pA = this.points[c.a];
        const pB = this.points[c.b];
        const delta = pB.pos.clone().sub(pA.pos);
        const dist = delta.length();
        if (dist < 1e-6) continue;
        const diff = (dist - c.rest) / dist;
        const offset = delta.multiplyScalar(diff * 0.5 * c.stiffness);
        if (!pA.pinned) pA.pos.add(offset);
        if (!pB.pinned) pB.pos.sub(offset);
      }
    }
  }

  applyToBones(rig: THREE.Object3D, blend = 1.0): void {
    if (!this.seeded) return;
    const inv = new THREE.Matrix4().copy(rig.matrixWorld).invert();
    const local = new THREE.Vector3();

    for (const p of this.points) {
      const b = findBone(rig, p.bone);
      if (!b) continue;
      local.copy(p.pos).applyMatrix4(inv);
      if (blend >= 1) {
        b.position.copy(local);
      } else {
        b.position.lerp(local, blend);
      }
    }
  }
}
