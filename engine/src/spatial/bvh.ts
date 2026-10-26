/**
 * @file bvh.ts
 * @module @aetheria/engine/spatial/bvh
 * @description Generic surface-area-heuristic bounding volume hierarchy with
 * overlap, sphere, ray and nearest queries plus a triangle-specialised variant.
 */

import { AABB, Sphere } from './bounds.js';
import { Triangle, type TriangleHit } from './primitives.js';
import {
  EPSILON,
  Vec3,
  Vec3Like,
  type RayLike,
  type SpatialHit,
} from './math.js';

/** Item stored in a generic BVH. */
export interface BVHItem<T> {
  id?: string;
  bounds: AABB;
  data: T;
}

/** Node of a generic BVH. */
export interface BVHNode<T> {
  bounds: AABB;
  left?: BVHNode<T>;
  right?: BVHNode<T>;
  items?: BVHItem<T>[];
  leaf: boolean;
  depth: number;
}

export interface BVHOptions {
  /** Maximum number of items in a leaf. */
  maxLeafSize?: number;
  /** Hard recursion cap (defaults to 32). */
  maxDepth?: number;
  /** Number of SAH bins per axis (defaults to 12). */
  bins?: number;
}

export interface BVHStats {
  nodes: number;
  leaves: number;
  items: number;
  maxDepth: number;
  surfaceArea: number;
}

export interface BVHHit<T> extends SpatialHit {
  item: BVHItem<T>;
}

export interface BVHRayOptions<T> {
  maxDistance?: number;
  predicate?: (item: BVHItem<T>) => boolean;
  sort?: boolean;
}

function boundsOfItems<T>(items: readonly BVHItem<T>[]): AABB {
  const box = AABB.empty();
  for (const item of items) box.union(item.bounds);
  return box;
}

function centroidOf<T>(item: BVHItem<T>, axis: 'x' | 'y' | 'z'): number {
  return item.bounds.min[axis] + (item.bounds.max[axis] - item.bounds.min[axis]) * 0.5;
}

/**
 * Static SAH BVH. Construction copies the item array; bounds are not mutated.
 */
export class BVH<T> {
  public root: BVHNode<T>;
  public readonly maxLeafSize: number;
  public readonly maxDepth: number;
  public readonly bins: number;
  private readonly items: BVHItem<T>[];
  private nodeCount = 0;
  private leafCount = 0;
  private builtDepth = 0;

  constructor(items: readonly BVHItem<T>[], options: BVHOptions = {}) {
    this.items = items.slice();
    this.maxLeafSize = Math.max(1, Math.floor(options.maxLeafSize ?? 4));
    this.maxDepth = Math.max(1, Math.floor(options.maxDepth ?? 32));
    this.bins = Math.max(2, Math.floor(options.bins ?? 12));
    this.root = this.build(this.items.slice(), 0);
  }

  private build(items: BVHItem<T>[], depth: number): BVHNode<T> {
    this.nodeCount += 1;
    this.builtDepth = Math.max(this.builtDepth, depth);
    const bounds = boundsOfItems(items);

    if (items.length <= this.maxLeafSize || depth >= this.maxDepth) {
      this.leafCount += 1;
      return { bounds, items, leaf: true, depth };
    }

    const split = this.findSplit(items, bounds);
    if (!split) {
      this.leafCount += 1;
      return { bounds, items, leaf: true, depth };
    }

    const leftItems = items.slice(0, split.index);
    const rightItems = items.slice(split.index);
    if (leftItems.length === 0 || rightItems.length === 0) {
      this.leafCount += 1;
      return { bounds, items, leaf: true, depth };
    }

    return {
      bounds,
      left: this.build(leftItems, depth + 1),
      right: this.build(rightItems, depth + 1),
      leaf: false,
      depth,
    };
  }

  /** Binned SAH split. Returns the sorted array boundary. */
  private findSplit(
    items: BVHItem<T>[],
    bounds: AABB,
  ): { axis: 'x' | 'y' | 'z'; index: number; cost: number } | null {
    if (items.length < 2) return null;

    const extents = bounds.size;
    const axes: Array<'x' | 'y' | 'z'> = extents.y > extents.x && extents.y >= extents.z
      ? ['y', 'x', 'z']
      : extents.z > extents.x && extents.z > extents.y
        ? ['z', 'x', 'y']
        : ['x', 'y', 'z'];

    let best: { axis: 'x' | 'y' | 'z'; index: number; cost: number } | null = null;

    for (const axis of axes) {
      const sorted = items.slice().sort((a, b) => centroidOf(a, axis) - centroidOf(b, axis));
      const count = sorted.length;

      if (count <= this.maxLeafSize * 2) {
        // Try every split for small leaves (better quality).
        const prefix = new Array<AABB>(count);
        const suffix = new Array<AABB>(count);
        const p = AABB.empty();
        for (let i = 0; i < count; i += 1) {
          p.union(sorted[i].bounds);
          prefix[i] = p.clone();
        }
        const s = AABB.empty();
        for (let i = count - 1; i >= 0; i -= 1) {
          s.union(sorted[i].bounds);
          suffix[i] = s.clone();
        }
        for (let i = 1; i < count; i += 1) {
          const cost = prefix[i - 1].surfaceArea * i + suffix[i].surfaceArea * (count - i);
          if (!best || cost < best.cost) best = { axis, index: i, cost };
        }
      } else {
        const binCount = Math.min(this.bins, count);
        const minC = centroidOf(sorted[0], axis);
        const maxC = centroidOf(sorted[count - 1], axis);
        const scale = maxC - minC;
        if (scale < EPSILON) continue;
        const binBounds = Array.from({ length: binCount }, () => AABB.empty());
        const binCounts = new Array<number>(binCount).fill(0);
        for (const item of sorted) {
          let bin = Math.floor(((centroidOf(item, axis) - minC) / scale) * binCount);
          bin = Math.max(0, Math.min(binCount - 1, bin));
          binBounds[bin].union(item.bounds);
          binCounts[bin] += 1;
        }

        const leftArea = new Array<number>(binCount).fill(0);
        const leftCount = new Array<number>(binCount).fill(0);
        const rightArea = new Array<number>(binCount).fill(0);
        const rightCount = new Array<number>(binCount).fill(0);
        const leftBox = AABB.empty();
        let leftTotal = 0;
        for (let i = 0; i < binCount; i += 1) {
          if (binCounts[i] > 0) leftBox.union(binBounds[i]);
          leftTotal += binCounts[i];
          leftArea[i] = leftBox.surfaceArea;
          leftCount[i] = leftTotal;
        }
        const rightBox = AABB.empty();
        let rightTotal = 0;
        for (let i = binCount - 1; i >= 0; i -= 1) {
          if (binCounts[i] > 0) rightBox.union(binBounds[i]);
          rightTotal += binCounts[i];
          rightArea[i] = rightBox.surfaceArea;
          rightCount[i] = rightTotal;
        }
        for (let i = 1; i < binCount; i += 1) {
          if (leftCount[i - 1] === 0 || rightCount[i] === 0) continue;
          const cost = leftArea[i - 1] * leftCount[i - 1] + rightArea[i] * rightCount[i];
          if (!best || cost < best.cost) {
            const splitCentroid = minC + (i / binCount) * scale;
            const index = sorted.findIndex((item) => centroidOf(item, axis) >= splitCentroid);
            if (index > 0 && index < count) best = { axis, index, cost };
          }
        }
      }
    }

    if (!best) {
      // Degenerate centroid distribution: median split on the largest extent.
      const axis = axes[0];
      items.sort((a, b) => centroidOf(a, axis) - centroidOf(b, axis));
      return { axis, index: Math.floor(items.length / 2), cost: Infinity };
    }

    items.sort((a, b) => centroidOf(a, best.axis) - centroidOf(b, best.axis));
    return best;
  }

  public get stats(): BVHStats {
    return {
      nodes: this.nodeCount,
      leaves: this.leafCount,
      items: this.items.length,
      maxDepth: this.builtDepth,
      surfaceArea: this.root.bounds.surfaceArea,
    };
  }

  public queryAABB(box: AABB): T[] {
    const results: T[] = [];
    this.traverseAABB(this.root, box, (item) => results.push(item.data));
    return results;
  }

  public queryAABBItems(box: AABB): BVHItem<T>[] {
    const results: BVHItem<T>[] = [];
    this.traverseAABB(this.root, box, (item) => results.push(item));
    return results;
  }

  private traverseAABB(node: BVHNode<T>, box: AABB, visit: (item: BVHItem<T>) => void): void {
    if (!node.bounds.intersects(box)) return;
    if (node.leaf) {
      for (const item of node.items ?? []) {
        if (item.bounds.intersects(box)) visit(item);
      }
      return;
    }
    if (node.left) this.traverseAABB(node.left, box, visit);
    if (node.right) this.traverseAABB(node.right, box, visit);
  }

  public querySphere(sphere: Sphere): T[] {
    const results: T[] = [];
    this.traverseSphere(this.root, sphere, (item) => results.push(item.data));
    return results;
  }

  public querySphereItems(sphere: Sphere): BVHItem<T>[] {
    const results: BVHItem<T>[] = [];
    this.traverseSphere(this.root, sphere, (item) => results.push(item));
    return results;
  }

  private traverseSphere(node: BVHNode<T>, sphere: Sphere, visit: (item: BVHItem<T>) => void): void {
    if (!node.bounds.toSphere().intersects(sphere)) return;
    if (node.leaf) {
      for (const item of node.items ?? []) {
        if (item.bounds.distanceToPoint(sphere.center) <= sphere.radius) visit(item);
      }
      return;
    }
    if (node.left) this.traverseSphere(node.left, sphere, visit);
    if (node.right) this.traverseSphere(node.right, sphere, visit);
  }

  public raycastBounds(ray: RayLike, options: BVHRayOptions<T> = {}): BVHHit<T>[] {
    const far = options.maxDistance ?? ray.maxDistance ?? Infinity;
    const hits: BVHHit<T>[] = [];
    this.traverseRay(this.root, ray, far, options.predicate, (item, hit) => {
      hits.push({ ...hit, item });
    });
    if (options.sort !== false) hits.sort((a, b) => a.distance - b.distance);
    return hits;
  }

  public raycastFirst(ray: RayLike, options: BVHRayOptions<T> = {}): BVHHit<T> | null {
    const hits = this.raycastBounds(ray, { ...options, sort: true });
    return hits.length > 0 ? hits[0] : null;
  }

  private traverseRay(
    node: BVHNode<T>,
    ray: RayLike,
    maxDistance: number,
    predicate: ((item: BVHItem<T>) => boolean) | undefined,
    visit: (item: BVHItem<T>, hit: SpatialHit) => void,
  ): void {
    const nodeHit = node.bounds.rayIntersection({ ...ray, maxDistance });
    if (!nodeHit.hit) return;
    if (node.leaf) {
      for (const item of node.items ?? []) {
        if (predicate && !predicate(item)) continue;
        const hit = item.bounds.rayIntersection({ ...ray, maxDistance });
        if (hit.hit) visit(item, hit);
      }
      return;
    }
    if (node.left) this.traverseRay(node.left, ray, maxDistance, predicate, visit);
    if (node.right) this.traverseRay(node.right, ray, maxDistance, predicate, visit);
  }

  public queryNearest(point: Vec3Like, maxDistance = Infinity): BVHItem<T> | null {
    let best: BVHItem<T> | null = null;
    let bestDistSq = maxDistance === Infinity ? Infinity : maxDistance * maxDistance;

    const traverse = (node: BVHNode<T>): void => {
      if (node.bounds.distanceSqToPoint(point) > bestDistSq) return;
      if (node.leaf) {
        for (const item of node.items ?? []) {
          const d = item.bounds.distanceSqToPoint(point);
          if (d < bestDistSq) {
            bestDistSq = d;
            best = item;
          }
        }
        return;
      }
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    };

    traverse(this.root);
    return best;
  }
}

export interface TriangleBVHHit extends TriangleHit {
  triangle: Triangle;
  triangleIndex: number;
}

/** BVH specialised for triangle meshes with exact raycast and nearest queries. */
export class TriangleBVH {
  public readonly bvh: BVH<{ triangle: Triangle; index: number }>;
  public readonly triangles: readonly Triangle[];

  constructor(triangles: readonly Triangle[], options: BVHOptions = {}) {
    this.triangles = triangles.slice();
    const items: BVHItem<{ triangle: Triangle; index: number }>[] = this.triangles.map((triangle, index) => ({
      id: `tri_${index}`,
      bounds: triangle.aabb,
      data: { triangle, index },
    }));
    this.bvh = new BVH(items, options);
  }

  public get stats(): BVHStats {
    return this.bvh.stats;
  }

  public raycast(ray: RayLike, maxDistance = Infinity): TriangleBVHHit | null {
    let best: TriangleBVHHit | null = null;
    let far = maxDistance;

    const traverse = (node: BVHNode<{ triangle: Triangle; index: number }>): void => {
      const nodeHit = node.bounds.rayIntersection({ ...ray, maxDistance: far });
      if (!nodeHit.hit) return;
      if (node.leaf) {
        for (const item of node.items ?? []) {
          const hit = item.data.triangle.rayIntersection({ ...ray, maxDistance: far });
          if (hit.hit && hit.distance < far) {
            far = hit.distance;
            best = {
              ...hit,
              triangle: item.data.triangle,
              triangleIndex: item.data.index,
            };
          }
        }
        return;
      }
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    };

    traverse(this.bvh.root);
    return best;
  }

  public raycastAll(ray: RayLike, maxDistance = Infinity): TriangleBVHHit[] {
    const hits: TriangleBVHHit[] = [];
    const traverse = (node: BVHNode<{ triangle: Triangle; index: number }>): void => {
      if (!node.bounds.rayIntersection({ ...ray, maxDistance }).hit) return;
      if (node.leaf) {
        for (const item of node.items ?? []) {
          const hit = item.data.triangle.rayIntersection({ ...ray, maxDistance });
          if (hit.hit) hits.push({ ...hit, triangle: item.data.triangle, triangleIndex: item.data.index });
        }
        return;
      }
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    };
    traverse(this.bvh.root);
    return hits.sort((a, b) => a.distance - b.distance);
  }

  public queryAABB(box: AABB): Triangle[] {
    return this.bvh.queryAABB(box).map((entry) => entry.triangle);
  }

  public closestPoint(point: Vec3Like): { point: Vec3; distance: number; triangle: Triangle; triangleIndex: number } | null {
    let bestPoint = new Vec3();
    let bestDistance = Infinity;
    let bestTriangle: Triangle | null = null;
    let bestIndex = -1;

    const traverse = (node: BVHNode<{ triangle: Triangle; index: number }>): void => {
      if (node.bounds.distanceSqToPoint(point) > bestDistance * bestDistance) return;
      if (node.leaf) {
        for (const item of node.items ?? []) {
          const candidate = item.data.triangle.closestPoint(point);
          const distance = candidate.distanceTo(point);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestPoint = candidate;
            bestTriangle = item.data.triangle;
            bestIndex = item.data.index;
          }
        }
        return;
      }
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    };

    traverse(this.bvh.root);
    return bestTriangle ? { point: bestPoint, distance: bestDistance, triangle: bestTriangle, triangleIndex: bestIndex } : null;
  }
}

export { TriangleHit };
