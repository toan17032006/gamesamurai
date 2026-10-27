/**
 * @file physics-gravity-objects.ts
 * @module @aetheria/engine/objects/physics-gravity-objects
 * @description Physics-enabled entities, custom gravity modifiers, buoyancy volumes, and destructible bodies.
 */

export type PhysicsBodyType = 'dynamic' | 'static' | 'kinematic';
export type ColliderShape = 'box' | 'sphere' | 'capsule' | 'cylinder' | 'mesh' | 'plane';

/**
 * Generic Physics-enabled object integrating velocity, forces, and collisions.
 */
export class PhysicsObject<TBody = unknown, TCollider = unknown> {
  public bodyType: PhysicsBodyType;
  public mass: number;
  public friction: number;
  public restitution: number; // bounciness (0 to 1)

  public position: [number, number, number] = [0, 0, 0];
  public velocity: [number, number, number] = [0, 0, 0];
  public acceleration: [number, number, number] = [0, 0, 0];
  public forces: [number, number, number] = [0, 0, 0];

  public bodyHandle?: TBody;
  public colliderHandle?: TCollider;

  constructor(
    bodyType: PhysicsBodyType = 'dynamic',
    mass = 1.0,
    friction = 0.5,
    restitution = 0.2
  ) {
    this.bodyType = bodyType;
    this.mass = Math.max(0.001, mass);
    this.friction = friction;
    this.restitution = restitution;
  }

  public applyForce(fx: number, fy: number, fz: number): void {
    if (this.bodyType !== 'dynamic') return;
    this.forces[0] += fx;
    this.forces[1] += fy;
    this.forces[2] += fz;
  }

  public applyImpulse(ix: number, iy: number, iz: number): void {
    if (this.bodyType !== 'dynamic') return;
    this.velocity[0] += ix / this.mass;
    this.velocity[1] += iy / this.mass;
    this.velocity[2] += iz / this.mass;
  }

  public setVelocity(vx: number, vy: number, vz: number): void {
    this.velocity = [vx, vy, vz];
  }

  public updatePhysics(dt: number, globalGravity: [number, number, number] = [0, -9.81, 0]): void {
    if (this.bodyType !== 'dynamic') return;

    // a = F / m + g
    const invMass = 1.0 / this.mass;
    this.acceleration[0] = this.forces[0] * invMass + globalGravity[0];
    this.acceleration[1] = this.forces[1] * invMass + globalGravity[1];
    this.acceleration[2] = this.forces[2] * invMass + globalGravity[2];

    // Euler integration
    this.velocity[0] += this.acceleration[0] * dt;
    this.velocity[1] += this.acceleration[1] * dt;
    this.velocity[2] += this.acceleration[2] * dt;

    // Apply linear damping
    const damping = Math.max(0, 1.0 - this.friction * dt);
    this.velocity[0] *= damping;
    this.velocity[2] *= damping;

    // Position update
    this.position[0] += this.velocity[0] * dt;
    this.position[1] += this.velocity[1] * dt;
    this.position[2] += this.velocity[2] * dt;

    // Clear accumulated forces
    this.forces = [0, 0, 0];
  }
}

/**
 * Gravity Modifier zone altering gravitational acceleration locally.
 */
export class GravityModifier {
  public readonly id: string;
  public center: [number, number, number];
  public radius: number;
  public direction: [number, number, number];
  public strength: number;
  public isRadial: boolean;

  constructor(
    id: string,
    center: [number, number, number],
    radius = 20,
    direction: [number, number, number] = [0, -9.81, 0],
    isRadial = false
  ) {
    this.id = id;
    this.center = center;
    this.radius = radius;
    this.direction = direction;
    this.strength = Math.sqrt(
      direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2]
    );
    this.isRadial = isRadial;
  }

  public calculateGravityAt(pos: [number, number, number]): [number, number, number] | null {
    const dx = pos[0] - this.center[0];
    const dy = pos[1] - this.center[1];
    const dz = pos[2] - this.center[2];
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq > this.radius * this.radius) return null; // Outside zone

    if (this.isRadial) {
      const dist = Math.sqrt(distSq);
      if (dist < 0.001) return [0, 0, 0];
      // Point towards center
      const factor = -this.strength / dist;
      return [dx * factor, dy * factor, dz * factor];
    }

    return [...this.direction];
  }
}

/**
 * Buoyancy Volume simulating water displacement, drag, and floating physics.
 */
export class BuoyancyVolume {
  public waterLevel: number;
  public fluidDensity: number;
  public linearDrag: number;

  constructor(waterLevel = 0, fluidDensity = 1000, linearDrag = 2.0) {
    this.waterLevel = waterLevel;
    this.fluidDensity = fluidDensity;
    this.linearDrag = linearDrag;
  }

  public applyBuoyancy(physicsObj: PhysicsObject, objectVolume = 0.1): void {
    const submergedDepth = this.waterLevel - physicsObj.position[1];
    if (submergedDepth <= 0) return; // Above water

    // Archimedes buoyant force = rho * V_submerged * g
    const submergedFraction = Math.min(1.0, submergedDepth / 1.0);
    const buoyantForce = this.fluidDensity * objectVolume * submergedFraction * 9.81 * 0.01;

    physicsObj.applyForce(0, buoyantForce, 0);

    // Apply water drag
    physicsObj.velocity[0] *= Math.max(0, 1.0 - this.linearDrag * 0.016);
    physicsObj.velocity[1] *= Math.max(0, 1.0 - this.linearDrag * 0.016);
    physicsObj.velocity[2] *= Math.max(0, 1.0 - this.linearDrag * 0.016);
  }
}

/**
 * Destructible Rigid Body that breaks apart when subjected to threshold forces.
 */
export class DestructibleRigidBody extends PhysicsObject {
  public fractureForceThreshold: number;
  public isFractured = false;
  public fragments: PhysicsObject[] = [];

  constructor(mass = 10, fractureForceThreshold = 500) {
    super('dynamic', mass);
    this.fractureForceThreshold = fractureForceThreshold;
  }

  public checkImpact(impactForce: number): boolean {
    if (this.isFractured) return false;

    if (impactForce >= this.fractureForceThreshold) {
      this.fracture();
      return true;
    }
    return false;
  }

  public fracture(fragmentCount = 5): PhysicsObject[] {
    this.isFractured = true;
    this.bodyType = 'static';
    this.fragments = [];

    const fragmentMass = this.mass / fragmentCount;
    for (let i = 0; i < fragmentCount; i++) {
      const frag = new PhysicsObject('dynamic', fragmentMass);
      frag.position = [
        this.position[0] + (Math.random() - 0.5) * 0.4,
        this.position[1] + (Math.random() - 0.5) * 0.4,
        this.position[2] + (Math.random() - 0.5) * 0.4,
      ];
      frag.applyImpulse(
        (Math.random() - 0.5) * 15,
        Math.random() * 10 + 2,
        (Math.random() - 0.5) * 15
      );
      this.fragments.push(frag);
    }

    return this.fragments;
  }
}
