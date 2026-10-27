/**
 * @file nav-agent.ts
 * @module @aetheria/engine/navigation/nav-agent
 * @description Lightweight path-following agent with acceleration, arrival
 * slowdown, stuck detection and optional periodic repathing.
 */

import type {
  NavAgentConfig,
  NavAgentUpdate,
  NavGridLike,
  NavPath,
  NavPathOptions,
  NavUpdateOptions,
  NavVec3,
} from './types.js';

const DEFAULTS: Required<NavAgentConfig> = {
  speed: 4,
  acceleration: 16,
  arriveRadius: 0.2,
  slowRadius: 1.5,
  stuckTimeout: 1,
  minSpeed: 0.05,
};

function copyPoint(point: NavVec3): NavVec3 {
  return { x: point.x, y: point.y, z: point.z };
}

function length2D(x: number, z: number): number {
  return Math.hypot(x, z);
}

/** Moves an agent along a navigation path. */
export class NavAgent {
  public readonly config: Required<NavAgentConfig>;
  public position: NavVec3;
  public velocity: NavVec3 = { x: 0, y: 0, z: 0 };
  public path: NavVec3[] = [];
  public waypointIndex = 0;
  public lastPath: NavPath | null = null;

  private stuckTime = 0;
  private repathTimer = 0;
  private lastPosition: NavVec3;

  constructor(position: NavVec3, config: NavAgentConfig = {}) {
    this.position = copyPoint(position);
    this.lastPosition = copyPoint(position);
    this.config = {
      speed: Math.max(0, config.speed ?? DEFAULTS.speed),
      acceleration: Math.max(1e-4, config.acceleration ?? DEFAULTS.acceleration),
      arriveRadius: Math.max(0, config.arriveRadius ?? DEFAULTS.arriveRadius),
      slowRadius: Math.max(0, config.slowRadius ?? DEFAULTS.slowRadius),
      stuckTimeout: Math.max(0, config.stuckTimeout ?? DEFAULTS.stuckTimeout),
      minSpeed: Math.max(0, config.minSpeed ?? DEFAULTS.minSpeed),
    };
  }

  public get hasPath(): boolean {
    return this.waypointIndex < this.path.length;
  }

  public get destination(): NavVec3 | undefined {
    const last = this.path[this.path.length - 1];
    return last ? copyPoint(last) : undefined;
  }

  public get remainingWaypoints(): NavVec3[] {
    return this.path.slice(this.waypointIndex).map(copyPoint);
  }

  public get isStuck(): boolean {
    return this.stuckTime >= this.config.stuckTimeout && this.config.stuckTimeout > 0;
  }

  public setPath(points: readonly NavVec3[], path?: NavPath): NavAgent {
    this.path = points.map(copyPoint);
    this.waypointIndex = 0;
    this.lastPath = path ?? null;
    this.stuckTime = 0;
    return this;
  }

  public clearPath(): void {
    this.path = [];
    this.waypointIndex = 0;
    this.lastPath = null;
    this.velocity = { x: 0, y: 0, z: 0 };
  }

  /** Compute and install a route using the supplied grid. */
  public setDestination(
    grid: NavGridLike,
    destination: NavVec3,
    options: NavPathOptions = {},
  ): NavPath {
    const path = grid.findPath(this.position, destination, options);
    this.lastPath = path;
    if (path.success) {
      this.setPath(path.points, path);
    } else {
      this.path = [];
      this.waypointIndex = 0;
    }
    return path;
  }

  /** Force a route recomputation to the current destination. */
  public repath(grid: NavGridLike, options: NavPathOptions = {}): NavPath | null {
    const destination = this.destination;
    if (!destination) return null;
    return this.setDestination(grid, destination, options);
  }

  public teleport(position: NavVec3): void {
    this.position = copyPoint(position);
    this.lastPosition = copyPoint(position);
    this.velocity = { x: 0, y: 0, z: 0 };
    this.stuckTime = 0;
  }

  /**
   * Advance along the current path. The optional `destination`/`grid` pair
   * enables periodic repathing for moving goals.
   */
  public update(dt: number, options: NavUpdateOptions = {}): NavAgentUpdate {
    const delta = Math.max(0, Number.isFinite(dt) ? dt : 0);
    const startX = this.position.x;
    const startZ = this.position.z;

    if (this.waypointIndex >= this.path.length) {
      this.velocity.x = 0;
      this.velocity.z = 0;
      return {
        arrived: true,
        moved: false,
        speed: 0,
        waypoint: this.waypointIndex,
        waypointCount: this.path.length,
        distanceToGoal: 0,
        stuck: false,
        needsRepath: false,
      };
    }

    const finalPoint = this.path[this.path.length - 1];
    let target = this.path[this.waypointIndex];
    let dx = target.x - this.position.x;
    let dz = target.z - this.position.z;
    let distance = length2D(dx, dz);

    // Consume every waypoint reached this tick (handles very dense paths).
    while (distance <= this.config.arriveRadius && this.waypointIndex < this.path.length - 1) {
      this.waypointIndex++;
      target = this.path[this.waypointIndex];
      dx = target.x - this.position.x;
      dz = target.z - this.position.z;
      distance = length2D(dx, dz);
    }

    const distanceToGoal = Math.hypot(
      finalPoint.x - this.position.x,
      finalPoint.z - this.position.z,
    );
    const lastWaypoint = this.waypointIndex === this.path.length - 1;
    if (lastWaypoint && distance <= Math.max(this.config.arriveRadius, 1e-4)) {
      this.position.x += finalPoint.x - this.position.x;
      this.position.z += finalPoint.z - this.position.z;
      this.position.y = finalPoint.y;
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.waypointIndex = this.path.length;
      this.stuckTime = 0;
      return {
        arrived: true,
        moved: true,
        speed: 0,
        waypoint: this.waypointIndex,
        waypointCount: this.path.length,
        distanceToGoal: 0,
        stuck: false,
        needsRepath: false,
      };
    }

    const slowFactor =
      this.config.slowRadius > 0 ? Math.min(1, distanceToGoal / this.config.slowRadius) : 1;
    const desiredSpeed = this.config.speed * Math.max(0.15, slowFactor);
    const inverse = distance > 1e-6 ? 1 / distance : 0;
    const desiredX = dx * inverse * desiredSpeed;
    const desiredZ = dz * inverse * desiredSpeed;
    const maxDelta = this.config.acceleration * delta;
    const diffX = desiredX - this.velocity.x;
    const diffZ = desiredZ - this.velocity.z;
    const diffLength = length2D(diffX, diffZ);
    if (diffLength > maxDelta && diffLength > 1e-9) {
      this.velocity.x += (diffX / diffLength) * maxDelta;
      this.velocity.z += (diffZ / diffLength) * maxDelta;
    } else {
      this.velocity.x = desiredX;
      this.velocity.z = desiredZ;
    }

    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;
    // Blend height toward the active waypoint so slopes remain smooth.
    const heightBlend = Math.min(1, delta * 8);
    this.position.y += (target.y - this.position.y) * heightBlend;

    const movedDistance = Math.hypot(this.position.x - startX, this.position.z - startZ);
    const speed = delta > 0 ? movedDistance / delta : 0;
    if (desiredSpeed > this.config.minSpeed && speed < this.config.minSpeed * 0.5) {
      this.stuckTime += delta;
    } else {
      this.stuckTime = 0;
    }

    let repathed = false;
    if (options.destination && options.grid && this.config.stuckTimeout > 0) {
      this.repathTimer += delta;
      const interval = Math.max(0, options.repathInterval ?? 0);
      if (this.isStuck && interval > 0) {
        const path = this.setDestination(options.grid, options.destination);
        repathed = path.success;
        if (repathed) this.repathTimer = 0;
      } else if (interval > 0 && this.repathTimer >= interval) {
        this.setDestination(options.grid, options.destination);
        this.repathTimer = 0;
      }
    }

    this.lastPosition = { x: startX, y: this.position.y, z: startZ };
    return {
      arrived: false,
      moved: movedDistance > 1e-7,
      speed,
      waypoint: this.waypointIndex,
      waypointCount: this.path.length,
      distanceToGoal,
      stuck: this.isStuck,
      needsRepath: this.isStuck && !repathed,
    };
  }

  /** Last displacement, useful for animation blending. */
  public get lastMovement(): number {
    return Math.hypot(this.position.x - this.lastPosition.x, this.position.z - this.lastPosition.z);
  }
}

/** Convenience factory mirroring the engine's other create* helpers. */
export function createNavAgent(position: NavVec3, config?: NavAgentConfig): NavAgent {
  return new NavAgent(position, config);
}
