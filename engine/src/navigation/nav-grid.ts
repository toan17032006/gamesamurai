/**
 * @file nav-grid.ts
 * @module @aetheria/engine/navigation/nav-grid
 * @description Cost-aware 2.5D navigation grid with deterministic A*, binary
 * heap frontier, corner-cut prevention and line-of-sight path smoothing.
 */

import type {
  NavCell,
  NavGridConfig,
  NavPath,
  NavPathFailure,
  NavPathOptions,
  NavVec3,
} from './types.js';

interface QueueNode {
  index: number;
  priority: number;
  sequence: number;
}

/** Small deterministic binary min-heap used by A*. */
class MinHeap {
  private readonly items: QueueNode[] = [];
  private sequence = 0;

  public get size(): number {
    return this.items.length;
  }

  public push(index: number, priority: number): void {
    const node: QueueNode = { index, priority, sequence: this.sequence++ };
    this.items.push(node);
    this.up(this.items.length - 1);
  }

  public pop(): QueueNode | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last) {
      this.items[0] = last;
      this.down(0);
    }
    return top;
  }

  private less(a: QueueNode, b: QueueNode): boolean {
    return a.priority < b.priority || (a.priority === b.priority && a.sequence < b.sequence);
  }

  private up(index: number): void {
    let child = index;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      if (!this.less(this.items[child], this.items[parent])) break;
      [this.items[child], this.items[parent]] = [this.items[parent], this.items[child]];
      child = parent;
    }
  }

  private down(index: number): void {
    let parent = index;
    for (;;) {
      const left = parent * 2 + 1;
      const right = left + 1;
      let smallest = parent;
      if (left < this.items.length && this.less(this.items[left], this.items[smallest])) {
        smallest = left;
      }
      if (right < this.items.length && this.less(this.items[right], this.items[smallest])) {
        smallest = right;
      }
      if (smallest === parent) break;
      [this.items[parent], this.items[smallest]] = [this.items[smallest], this.items[parent]];
      parent = smallest;
    }
  }
}

function cellKey(x: number, z: number): number {
  // Safe for grids up to 2^26 x 2^26; far beyond practical world chunk dimensions.
  return x * 67_108_864 + z;
}

function distance(a: NavVec3, b: NavVec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** Serializable nav-grid payload. */
export interface NavGridSnapshot {
  width: number;
  height: number;
  cellSize: number;
  origin: NavVec3;
  walkable: number[];
  costs: number[];
}

/**
 * A rectangular navigation grid on the X/Z plane. The grid is independent from
 * rendering and physics, so the same structure runs in workers or on a server.
 */
export class NavGrid {
  public readonly width: number;
  public readonly height: number;
  public readonly cellSize: number;
  public readonly origin: NavVec3;
  private readonly walkable: Uint8Array;
  private readonly costs: Float32Array;
  private readonly heightAt?: (x: number, z: number) => number;

  constructor(config: NavGridConfig) {
    this.width = Math.max(0, Math.floor(config.width));
    this.height = Math.max(0, Math.floor(config.height));
    this.cellSize = Math.max(1e-3, config.cellSize ?? 1);
    this.origin = {
      x: config.origin?.x ?? 0,
      y: config.origin?.y ?? 0,
      z: config.origin?.z ?? 0,
    };
    this.heightAt = config.heightAt;
    this.walkable = new Uint8Array(this.width * this.height);
    this.walkable.fill(config.walkable === false ? 0 : 1);
    this.costs = new Float32Array(this.width * this.height);
    this.costs.fill(Math.max(0.01, config.cost ?? 1));
  }

  /** Build a grid from ASCII rows ('#'/'X' blocked, digits = cost, else open). */
  public static fromAscii(
    rows: readonly string[],
    options: Omit<NavGridConfig, 'width' | 'height'> = {},
  ): NavGrid {
    const height = rows.length;
    const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const grid = new NavGrid({ ...options, width, height });
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const ch = rows[z][x] ?? ' ';
        grid.setWalkableCell(x, z, ch !== '#' && ch !== 'X');
        if (ch >= '1' && ch <= '9') grid.setCostCell(x, z, Number(ch));
      }
    }
    return grid;
  }

  public toAscii(): string[] {
    const rows: string[] = [];
    for (let z = 0; z < this.height; z++) {
      let row = '';
      for (let x = 0; x < this.width; x++) {
        if (!this.isWalkableCell(x, z)) row += '#';
        else if (this.costAtCell(x, z) > 1) row += String(Math.min(9, Math.round(this.costAtCell(x, z))));
        else row += '.';
      }
      rows.push(row);
    }
    return rows;
  }

  public get cellCount(): number {
    return this.width * this.height;
  }

  public inBoundsCell(x: number, z: number): boolean {
    return x >= 0 && z >= 0 && x < this.width && z < this.height;
  }

  public indexOf(x: number, z: number): number {
    return z * this.width + x;
  }

  public isWalkableCell(x: number, z: number): boolean {
    return this.inBoundsCell(x, z) && this.walkable[this.indexOf(x, z)] === 1;
  }

  public isWalkable(point: NavVec3): boolean {
    const cell = this.worldToCell(point);
    return this.isWalkableCell(cell.x, cell.z);
  }

  public costAtCell(x: number, z: number): number {
    if (!this.inBoundsCell(x, z)) return 1;
    return this.costs[this.indexOf(x, z)];
  }

  public setWalkableCell(x: number, z: number, value = true): boolean {
    if (!this.inBoundsCell(x, z)) return false;
    this.walkable[this.indexOf(x, z)] = value ? 1 : 0;
    return true;
  }

  public setCostCell(x: number, z: number, cost: number): boolean {
    if (!this.inBoundsCell(x, z)) return false;
    this.costs[this.indexOf(x, z)] = Math.max(0.01, Number.isFinite(cost) ? cost : 1);
    return true;
  }

  public setWalkable(point: NavVec3, value = true): boolean {
    const cell = this.worldToCell(point);
    return this.setWalkableCell(cell.x, cell.z, value);
  }

  public setCost(x: number, z: number, cost: number): boolean {
    return this.setCostCell(x, z, cost);
  }

  public getCost(x: number, z: number): number {
    return this.costAtCell(x, z);
  }

  public worldToCell(point: NavVec3): NavCell {
    return {
      x: Math.floor((point.x - this.origin.x) / this.cellSize),
      z: Math.floor((point.z - this.origin.z) / this.cellSize),
    };
  }

  public cellToWorld(x: number, z: number, y?: number): NavVec3 {
    const wx = this.origin.x + (x + 0.5) * this.cellSize;
    const wz = this.origin.z + (z + 0.5) * this.cellSize;
    return {
      x: wx,
      y: y ?? this.heightAt?.(wx, wz) ?? this.origin.y,
      z: wz,
    };
  }

  /** Mark every walkable cell whose center lies inside the circle as blocked. */
  public blockCircle(center: NavVec3, radius: number, value = false): number {
    return this.setCircle(center, radius, value);
  }

  public setCircle(center: NavVec3, radius: number, value = true, cost?: number): number {
    let changed = 0;
    const r = Math.max(0, radius);
    const min = this.worldToCell({ x: center.x - r, y: center.y, z: center.z - r });
    const max = this.worldToCell({ x: center.x + r, y: center.y, z: center.z + r });
    for (let z = Math.max(0, min.z); z <= Math.min(this.height - 1, max.z); z++) {
      for (let x = Math.max(0, min.x); x <= Math.min(this.width - 1, max.x); x++) {
        const centerPoint = this.cellToWorld(x, z);
        if (Math.hypot(centerPoint.x - center.x, centerPoint.z - center.z) > r + this.cellSize * 0.5) {
          continue;
        }
        const walkChanged = this.setWalkableCell(x, z, value);
        if (cost !== undefined) this.setCostCell(x, z, cost);
        if (walkChanged) changed++;
      }
    }
    return changed;
  }

  public setRect(min: NavVec3, max: NavVec3, value = false, cost?: number): number {
    const a = this.worldToCell(min);
    const b = this.worldToCell(max);
    let changed = 0;
    for (let z = Math.max(0, a.z); z <= Math.min(this.height - 1, b.z); z++) {
      for (let x = Math.max(0, a.x); x <= Math.min(this.width - 1, b.x); x++) {
        const walkChanged = this.setWalkableCell(x, z, value);
        if (cost !== undefined) this.setCostCell(x, z, cost);
        if (walkChanged) changed++;
      }
    }
    return changed;
  }

  public clear(value = true): void {
    this.walkable.fill(value ? 1 : 0);
  }

  /**
   * Find the closest walkable cell using expanding Chebyshev rings. Returns
   * `null` when the requested cap is exhausted.
   */
  public findNearestWalkableCell(
    point: NavVec3 | NavCell,
    maxRadius = 16,
    cellSpace = 'world',
  ): NavCell | null {
    const cell =
      cellSpace === 'cell'
        ? ({ x: Math.round((point as NavCell).x), z: Math.round((point as NavCell).z) } as NavCell)
        : this.worldToCell(point as NavVec3);
    if (this.isWalkableCell(cell.x, cell.z)) return cell;
    const cap = Math.max(0, Math.floor(maxRadius));
    for (let radius = 1; radius <= cap; radius++) {
      for (let dz = -radius; dz <= radius; dz++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;
          const x = cell.x + dx;
          const z = cell.z + dz;
          if (this.isWalkableCell(x, z)) return { x, z };
        }
      }
    }
    return null;
  }

  /** Street-fighting heuristic: octile distance on the grid. */
  private heuristic(x: number, z: number, gx: number, gz: number, weight: number): number {
    const dx = Math.abs(gx - x);
    const dz = Math.abs(gz - z);
    const diagonal = Math.min(dx, dz);
    const straight = Math.max(dx, dz) - diagonal;
    return (straight + diagonal * Math.SQRT2) * this.cellSize * weight;
  }

  /**
   * Compute an A* route. The result is deterministic for a given grid and
   * request; ties are broken by insertion order.
   */
  public findPath(
    start: NavVec3,
    goal: NavVec3,
    options: NavPathOptions = {},
  ): NavPath {
    const empty = (reason: NavPathFailure, startCell?: NavCell, goalCell?: NavCell): NavPath => ({
      success: false,
      points: [],
      visited: 0,
      cost: 0,
      length: 0,
      start: startCell ?? this.worldToCell(start),
      goal: goalCell ?? this.worldToCell(goal),
      reason,
    });

    if (this.width === 0 || this.height === 0) return empty('invalid-grid');
    const rawStart = this.worldToCell(start);
    const rawGoal = this.worldToCell(goal);
    if (!this.inBoundsCell(rawStart.x, rawStart.z)) return empty('start-outside', rawStart, rawGoal);
    if (!this.inBoundsCell(rawGoal.x, rawGoal.z)) return empty('goal-outside', rawStart, rawGoal);

    const startCell = this.isWalkableCell(rawStart.x, rawStart.z)
      ? rawStart
      : this.findNearestWalkableCell(rawStart, 16, 'cell');
    const goalCell = this.isWalkableCell(rawGoal.x, rawGoal.z)
      ? rawGoal
      : this.findNearestWalkableCell(rawGoal, 16, 'cell');
    if (!startCell) return empty('start-blocked', rawStart, rawGoal);
    if (!goalCell) return empty('goal-blocked', rawStart, rawGoal);

    if (startCell.x === goalCell.x && startCell.z === goalCell.z) {
      const points = [{ ...start }, { ...goal }];
      return {
        success: true,
        points,
        visited: 1,
        cost: distance(start, goal),
        length: distance(start, goal),
        start: startCell,
        goal: goalCell,
      };
    }

    const allowDiagonal = options.allowDiagonal !== false;
    const heuristicWeight = Math.max(1, options.heuristicWeight ?? 1);
    const maxIterations = Math.max(
      1,
      Math.floor(options.maxIterations ?? this.cellCount * 4),
    );

    const total = this.cellCount;
    const gScore = new Float64Array(total);
    gScore.fill(Number.POSITIVE_INFINITY);
    const cameFrom = new Int32Array(total);
    cameFrom.fill(-1);
    const closed = new Uint8Array(total);
    const open = new MinHeap();
    const startIndex = this.indexOf(startCell.x, startCell.z);
    const goalIndex = this.indexOf(goalCell.x, goalCell.z);
    gScore[startIndex] = 0;
    open.push(startIndex, this.heuristic(startCell.x, startCell.z, goalCell.x, goalCell.z, heuristicWeight));

    const offsets: ReadonlyArray<readonly [number, number, number, boolean]> = allowDiagonal
      ? [
          [1, 0, 1, false],
          [-1, 0, 1, false],
          [0, 1, 1, false],
          [0, -1, 1, false],
          [1, 1, Math.SQRT2, true],
          [1, -1, Math.SQRT2, true],
          [-1, 1, Math.SQRT2, true],
          [-1, -1, Math.SQRT2, true],
        ]
      : [
          [1, 0, 1, false],
          [-1, 0, 1, false],
          [0, 1, 1, false],
          [0, -1, 1, false],
        ];

    let visited = 0;
    let found = false;
    while (open.size > 0) {
      if (visited++ > maxIterations) {
        return { ...empty('iteration-limit', startCell, goalCell), visited };
      }
      const current = open.pop();
      if (!current) break;
      if (closed[current.index] === 1) continue;
      closed[current.index] = 1;
      if (current.index === goalIndex) {
        found = true;
        break;
      }
      const cx = current.index % this.width;
      const cz = Math.floor(current.index / this.width);
      for (const [dx, dz, step, diagonal] of offsets) {
        const nx = cx + dx;
        const nz = cz + dz;
        if (!this.isWalkableCell(nx, nz)) continue;
        // Prevent cutting through the corner between two blocked cells.
        if (diagonal && (!this.isWalkableCell(cx + dx, cz) || !this.isWalkableCell(cx, cz + dz))) {
          continue;
        }
        const neighborIndex = this.indexOf(nx, nz);
        if (closed[neighborIndex] === 1) continue;
        const tentative = gScore[current.index] + step * this.cellSize * this.costAtCell(nx, nz);
        if (tentative >= gScore[neighborIndex]) continue;
        cameFrom[neighborIndex] = current.index;
        gScore[neighborIndex] = tentative;
        open.push(
          neighborIndex,
          tentative + this.heuristic(nx, nz, goalCell.x, goalCell.z, heuristicWeight),
        );
      }
    }

    if (!found) return { ...empty('no-path', startCell, goalCell), visited };

    const cells: NavCell[] = [];
    let cursor = goalIndex;
    const guard = total + 1;
    let steps = 0;
    while (cursor !== -1 && steps++ <= guard) {
      cells.push({ x: cursor % this.width, z: Math.floor(cursor / this.width) });
      if (cursor === startIndex) break;
      cursor = cameFrom[cursor];
    }
    cells.reverse();
    if (cells.length === 0 || cells[0].x !== startCell.x || cells[0].z !== startCell.z) {
      return { ...empty('no-path', startCell, goalCell), visited };
    }

    let points: NavVec3[] = cells.map((cell) => this.cellToWorld(cell.x, cell.z));
    points[0] = { ...start };
    if (this.isWalkableCell(rawGoal.x, rawGoal.z)) points[points.length - 1] = { ...goal };
    if (options.smooth !== false) points = this.smoothPath(points);

    return {
      success: true,
      points,
      visited,
      cost: gScore[goalIndex],
      length: this.pathLength(points),
      start: startCell,
      goal: goalCell,
    };
  }

  /** Geometric length of a waypoint list. */
  public pathLength(points: readonly NavVec3[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) length += distance(points[i - 1], points[i]);
    return length;
  }

  /**
   * True when the straight segment between two world points only crosses
   * walkable cells. Uses grid traversal (Amanatides & Woo) so every cell the
   * segment touches is tested, including exact diagonal corner crossings.
   */
  public hasLineOfSight(a: NavVec3, b: NavVec3): boolean {
    let x = Math.floor((a.x - this.origin.x) / this.cellSize);
    let z = Math.floor((a.z - this.origin.z) / this.cellSize);
    const endX = Math.floor((b.x - this.origin.x) / this.cellSize);
    const endZ = Math.floor((b.z - this.origin.z) / this.cellSize);
    if (!this.isWalkableCell(x, z) || !this.isWalkableCell(endX, endZ)) return false;
    if (x === endX && z === endZ) return true;

    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const stepZ = dz > 0 ? 1 : dz < 0 ? -1 : 0;
    const tDeltaX = stepX !== 0 ? this.cellSize / Math.abs(dx) : Number.POSITIVE_INFINITY;
    const tDeltaZ = stepZ !== 0 ? this.cellSize / Math.abs(dz) : Number.POSITIVE_INFINITY;
    const boundaryX = this.origin.x + (x + (stepX > 0 ? 1 : 0)) * this.cellSize;
    const boundaryZ = this.origin.z + (z + (stepZ > 0 ? 1 : 0)) * this.cellSize;
    let tMaxX = stepX !== 0 ? (boundaryX - a.x) / dx : Number.POSITIVE_INFINITY;
    let tMaxZ = stepZ !== 0 ? (boundaryZ - a.z) / dz : Number.POSITIVE_INFINITY;

    const maxSteps = this.width + this.height + 4;
    for (let step = 0; step < maxSteps; step++) {
      if (x === endX && z === endZ) return true;
      if (
        stepX !== 0 &&
        stepZ !== 0 &&
        Math.abs(tMaxX - tMaxZ) <= 1e-9
      ) {
        // The segment passes exactly through a corner: reject corner cutting.
        if (!this.isWalkableCell(x + stepX, z) || !this.isWalkableCell(x, z + stepZ)) {
          return false;
        }
        x += stepX;
        z += stepZ;
        tMaxX += tDeltaX;
        tMaxZ += tDeltaZ;
      } else if (tMaxX < tMaxZ) {
        x += stepX;
        tMaxX += tDeltaX;
      } else {
        z += stepZ;
        tMaxZ += tDeltaZ;
      }
      if (!this.isWalkableCell(x, z)) return false;
    }
    return false;
  }

  /** Greedy line-of-sight simplification of a waypoint list. */
  public smoothPath(points: readonly NavVec3[]): NavVec3[] {
    if (points.length <= 2) return points.map((point) => ({ ...point }));
    const result: NavVec3[] = [{ ...points[0] }];
    let anchor = 0;
    while (anchor < points.length - 1) {
      let candidate = anchor + 1;
      for (let next = points.length - 1; next > anchor + 1; next--) {
        if (this.hasLineOfSight(points[anchor], points[next])) {
          candidate = next;
          break;
        }
      }
      result.push({ ...points[candidate] });
      anchor = candidate;
    }
    return result;
  }

  /** Snapshot every cell for save games or network transfer. */
  public toJSON(): NavGridSnapshot {
    return {
      width: this.width,
      height: this.height,
      cellSize: this.cellSize,
      origin: { ...this.origin },
      walkable: Array.from(this.walkable),
      costs: Array.from(this.costs),
    };
  }

  public static fromJSON(snapshot: NavGridSnapshot, heightAt?: (x: number, z: number) => number): NavGrid {
    const grid = new NavGrid({
      width: snapshot.width,
      height: snapshot.height,
      cellSize: snapshot.cellSize,
      origin: snapshot.origin,
      heightAt,
    });
    const count = Math.min(grid.walkable.length, snapshot.walkable.length);
    for (let i = 0; i < count; i++) grid.walkable[i] = snapshot.walkable[i] ? 1 : 0;
    const costCount = Math.min(grid.costs.length, snapshot.costs.length);
    for (let i = 0; i < costCount; i++) {
      const cost = snapshot.costs[i];
      grid.costs[i] = Number.isFinite(cost) && cost > 0 ? cost : 1;
    }
    return grid;
  }

  public clone(heightAt?: (x: number, z: number) => number): NavGrid {
    return NavGrid.fromJSON(this.toJSON(), heightAt);
  }

  /** Debug helper: checksum of the walkability bitmap. */
  public checksum(): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < this.walkable.length; i++) {
      hash ^= this.walkable[i];
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  /**
   * Kept private only for API stability; exposes the internal key helper to
   * tests without leaking a second cell representation.
   */
  public static key(x: number, z: number): number {
    return cellKey(x, z);
  }
}
