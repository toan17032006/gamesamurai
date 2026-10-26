// engine/src/types/physics.types.ts — Kiểu dữ liệu vật lý, va chạm, trọng lực & ragdoll
import type { Vec3 } from './transform.types';

export interface PhysicsMaterial {
  friction: number;
  restitution: number;
  density: number;
}

export interface PhysicsBody {
  id: string;
  mass: number;
  position: Vec3;
  velocity: Vec3;
  angularVelocity?: Vec3;
  restitution?: number;
  friction?: number;
  /** Gia tốc cộng thêm (thrust, gió, từ trường) */
  force?: Vec3;
  torque?: Vec3;
  drag?: number;
  angularDrag?: number;
  gravityScale?: number;
  shape: CollisionShape;
  material?: PhysicsMaterial;
  isStatic?: boolean;
  isTrigger?: boolean;
  collisionLayer?: number;
  collisionMask?: number;
  centerOfMassOffset?: Vec3;
  lockRotationX?: boolean;
  lockRotationY?: boolean;
  lockRotationZ?: boolean;
}

export type CollisionShape =
  | { kind: 'sphere'; radius: number; center?: Vec3 }
  | { kind: 'box'; half: Vec3; center?: Vec3 }
  | { kind: 'capsule'; radius: number; height: number; center?: Vec3; axis?: 'x' | 'y' | 'z' }
  | { kind: 'cylinder'; radius: number; height: number; center?: Vec3 }
  | { kind: 'mesh'; vertices: Float32Array; indices?: Uint32Array; isConvex?: boolean }
  | { kind: 'compound'; children: Array<{ shape: CollisionShape; offset: Vec3 }> };

export interface HitResult {
  hit: boolean;
  point?: Vec3;
  normal?: Vec3;
  distance?: number;
  bodyId?: string;
  colliderShape?: CollisionShape['kind'];
  impactVelocity?: Vec3;
  material?: PhysicsMaterial;
}

export interface Ray {
  origin: Vec3;
  direction: Vec3;
  maxDistance: number;
}

export interface RagdollJoint {
  bone: string;
  parentBone: string;
  limits?: {
    min: Vec3;
    max: Vec3;
  };
  stiffness?: number;
  damping?: number;
  twistLimit?: number;
  swingLimit?: number;
}

export interface RagdollConfig {
  bones: string[];
  joints: RagdollJoint[];
  totalMass: number;
  damping: number;
  enableSelfCollision?: boolean;
}

export interface FluidVolume {
  id: string;
  density: number;
  viscosity?: number;
  drag?: number;
  bounds: {
    min: Vec3;
    max: Vec3;
  };
  surfaceY?: number;
  waterLevel?: number;
  flowVelocity?: Vec3;
}

export interface ForceField {
  id: string;
  type: 'directional' | 'point' | 'vortex' | 'turbulence';
  origin: Vec3;
  direction?: Vec3;
  radius?: number;
  strength: number;
  falloff?: 'linear' | 'inverseSquare' | 'none';
}

export interface DestructionShard {
  id: string;
  meshId: string;
  position: Vec3;
  velocity: Vec3;
  angularVelocity: Vec3;
  mass: number;
  lifetime: number;
}
