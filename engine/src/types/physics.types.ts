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

// ============================================================================
// Enhanced RigidBody, Manifold, GJK/EPA & Impulse Contracts
// ============================================================================

export interface MassProperties {
  mass: number;
  inverseMass: number;
  centerOfMass: Vec3;
  /** 3x3 inertia tensor matrix (elements in row-major or column-major [ixx, ixy, ixz, iyx, iyy, iyz, izx, izy, izz]) */
  inertiaTensor: [number, number, number, number, number, number, number, number, number];
  inverseInertiaTensor: [number, number, number, number, number, number, number, number, number];
  principalInertia: Vec3;
}

export interface RaycastHit {
  hit: boolean;
  distance: number;
  point: Vec3;
  normal: Vec3;
  uv?: { u: number; v: number };
  triangleIndex?: number;
  bodyId?: string;
  colliderShape?: CollisionShape['kind'];
  material?: PhysicsMaterial;
}

export interface ContactPoint {
  position: Vec3;
  normal: Vec3; // Points from body A to body B
  penetrationDepth: number;
  normalImpulse?: number;
  tangentImpulse1?: number;
  tangentImpulse2?: number;
}

export interface ContactManifold {
  bodyIdA: string;
  bodyIdB: string;
  points: ContactPoint[];
  normal: Vec3;
  tangent1: Vec3;
  tangent2: Vec3;
  isColliding: boolean;
}

export interface SimplexVertex {
  point: Vec3; // Minkowski difference point (A - B)
  pointA: Vec3; // Support point on shape A
  pointB: Vec3; // Support point on shape B
}

export interface Simplex {
  vertices: SimplexVertex[];
  count: number;
}

export interface GJKResult {
  intersecting: boolean;
  distance: number;
  closestPointA: Vec3;
  closestPointB: Vec3;
  iterations: number;
  simplex: Simplex;
}

export interface EPAResult {
  normal: Vec3; // Penetration normal
  penetrationDepth: number;
  contactPointA: Vec3;
  contactPointB: Vec3;
  iterations: number;
}

export interface ImpulseResolution {
  linearImpulseA: Vec3;
  linearImpulseB: Vec3;
  angularImpulseA: Vec3;
  angularImpulseB: Vec3;
  appliedRestitution: number;
  appliedFriction: number;
}

export interface SweepHit {
  hit: boolean;
  timeOfImpact: number; // 0 to 1
  point: Vec3;
  normal: Vec3;
  distance: number;
}

export interface IRigidBody<T = unknown> extends PhysicsBody {
  massProps: MassProperties;
  linearDamping: number;
  angularDamping: number;
  sleepThreshold: number;
  isSleeping: boolean;
  userData: T;
}

export type RigidBodyDescriptor<T = unknown> = IRigidBody<T>;

