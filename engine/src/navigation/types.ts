/**
 * @file types.ts
 * @module @aetheria/engine/navigation/types
 * @description Shared contracts for grid navigation, A* pathfinding and
 * path-following agents.
 */

/** Structural 3D point used by navigation (y is height). */
export interface NavVec3 {
  x: number;
  y: number;
  z: number;
}

/** A cell coordinate on the navigation grid. */
export interface NavCell {
  x: number;
  z: number;
}

/** Reason a path request finished without a route. */
export type NavPathFailure =
  | 'invalid-grid'
  | 'start-outside'
  | 'goal-outside'
  | 'start-blocked'
  | 'goal-blocked'
  | 'no-path'
  | 'iteration-limit';

/** Result of one A* request. */
export interface NavPath {
  success: boolean;
  /** Smoothed or raw waypoints, from start to goal. */
  points: NavVec3[];
  /** Grid cells visited by the search. */
  visited: number;
  /** Accumulated movement cost (diagonal = sqrt(2)). */
  cost: number;
  /** Geometric length of the returned waypoints. */
  length: number;
  start: NavCell;
  goal: NavCell;
  reason?: NavPathFailure;
}

export interface NavGridConfig {
  /** Number of cells on the X axis. */
  width: number;
  /** Number of cells on the Z axis. */
  height: number;
  /** World size of one cell (default 1). */
  cellSize?: number;
  /** World position of cell (0, 0), including the ground height. */
  origin?: NavVec3;
  /** Optional terrain sampler; overrides `origin.y` for every cell center. */
  heightAt?: (x: number, z: number) => number;
  /** Initial walkability (default true). */
  walkable?: boolean;
  /** Extra movement multiplier applied on top of the base cost. */
  cost?: number;
}

export interface NavPathOptions {
  /** Allow 8-way movement (default true). */
  allowDiagonal?: boolean;
  /** Remove redundant waypoints with a line-of-sight pass (default true). */
  smooth?: boolean;
  /** Hard search budget; defaults to `width * height * 4`. */
  maxIterations?: number;
  /** Extra heuristic weight for faster, slightly suboptimal paths (default 1). */
  heuristicWeight?: number;
}

export interface NavUpdateOptions {
  /** Current destination used for optional automatic repathing. */
  destination?: NavVec3;
  /** Grid used when `destination` is supplied. */
  grid?: NavGridLike;
  /** Recompute the route after this many seconds (0 disables). */
  repathInterval?: number;
}

/** Minimal structural grid surface accepted by {@link NavAgent}. */
export interface NavGridLike {
  findPath(start: NavVec3, goal: NavVec3, options?: NavPathOptions): NavPath;
}

export interface NavAgentConfig {
  /** Maximum movement speed in world units per second (default 4). */
  speed?: number;
  /** Acceleration in world units per second squared (default 16). */
  acceleration?: number;
  /** Distance at which a waypoint is considered reached (default 0.2). */
  arriveRadius?: number;
  /** Start slowing down within this distance of the final waypoint (default 1.5). */
  slowRadius?: number;
  /** Seconds without meaningful movement before `stuck` becomes true (default 1). */
  stuckTimeout?: number;
  /** Minimum speed considered meaningful (default 0.05). */
  minSpeed?: number;
}

/** Result of one path-following update. */
export interface NavAgentUpdate {
  arrived: boolean;
  moved: boolean;
  speed: number;
  waypoint: number;
  waypointCount: number;
  distanceToGoal: number;
  stuck: boolean;
  /** True when the agent needs a new route (stuck or exhausted path). */
  needsRepath: boolean;
}
