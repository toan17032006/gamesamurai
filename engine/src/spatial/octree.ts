/**
 * @file octree.ts
 * @module @aetheria/engine/spatial/octree
 * @description Dynamic loose octree for real-time spatial queries, with insert,
 * remove, update, overlap, radius, ray and nearest-neighbour operations.
 */

import { AABB, Sphere } from './bounds.js';
import { EPSILON, Vec3, Vec3Like, type RayLike, type SpatialHit } from './math.js';

export interface OctreeItem<T> {
  id: string;
  bounds: AABB;
  data: T;
}

export interface OctreeOptions {
  maxDepth?: number;
  maxItemsPerNode?: number;
  /** Looseness factor (1 = exact octants, 1.25-2 = looser, fewer migrations). */
  looseness?: number;
}

export interface OctreeNode<T> {
  id: string;
  bounds: AABB;
  depth: number;
  items: OctreeItem<T>[];
  children?: OctreeNode<T>[];
  leaf: boolean;
}

export interface OctreeStats {
  nodes: number;
  leaves: number;
  items: number;
  maxDepth: number;
}

/**
 * Dynamic octree. Items are stored in the deepest node whose (loosened) bounds
 * fully contain their AABB. When the root does not cover a new item, the root
 * grows and the tree is rebuilt.
 */
export class Octree<T> {
  public bounds: AABB;
  public root: OctreeNode<T>;
  public readonly maxDepth: number;
  public readonly maxItemsPerNode: number;
  public readonly looseness: number;
  private items = new Map<string, OctreeItem<T>>();
  private nextNodeId = 1;

  constructor(bounds: AABB = new AABB(new Vec3(-64, -64, -64), new Vec3(64, 64, 64)), options: OctreeOptions = {}) {
    this.bounds = bounds.clone();
    this.maxDepth = Math.max(1, Math.floor(options.maxDepth ?? 6));
    this.maxItemsPerNode = Math.max(1, Math.floor(options.maxItemsPerNode ?? 8));
    this.looseness = Math.max(1, options.looseness ?? 1);
    this.root = this.createNode(this.bounds, 0);
  }

  private createNode(bounds: AABB, depth: number): OctreeNode<T> {
    return {
      id: `oct_${this.nextNodeId++}`,
      bounds: bounds.clone(),
      depth,
      items: [],
      leaf: true,
    };
  }

  public get size(): number {
    return this.items.size;
  }

  public insert(item: OctreeItem<T>): void {
    if (this.items.has(item.id)) {
      this.remove(item.id);
    }

    if (!this.bounds.containsAABB(item.bounds)) {
      this.growToContain(item.bounds);
    }

    this.items.set(item.id, item);
    this.insertInto(this.root, item);
  }

  public insertMany(items: Iterable<OctreeItem<T>>): void {
    for (const item of items) this.insert(item);
  }

  public remove(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    if (this.removeFrom(this.root, item)) {
      this.items.delete(id);
      return true;
    }
    return false;
  }

  public update(item: OctreeItem<T>): void {
    if (this.items.has(item.id)) this.remove(item.id);
    this.insert(item);
  }

  public get(id: string): OctreeItem<T> | undefined {
    return this.items.get(id);
  }

  public getAll(): OctreeItem<T>[] {
    return Array.from(this.items.values());
  }

  public clear(): void {
    this.items.clear();
    this.nextNodeId = 1;
    this.root = this.createNode(this.bounds, 0);
  }

  private growToContain(box: AABB): void {
    const current = this.bounds;
    const min = Vec3.min(current.min, box.min);
    const max = Vec3.max(current.max, box.max);
    const center = Vec3.lerp(min, max, 0.5);
    const size = Vec3.sub(max, min);
    const maxExtent = Math.max(size.x, size.y, size.z, 1);
    this.bounds = new AABB(
      new Vec3(center.x - maxExtent / 2, center.y - maxExtent / 2, center.z - maxExtent / 2),
      new Vec3(center.x + maxExtent / 2, center.y + maxExtent / 2, center.z + maxExtent / 2),
    );
    this.rebuild();
  }

  private rebuild(): void {
    const all = Array.from(this.items.values());
    this.root = this.createNode(this.bounds, 0);
    for (const item of all) this.insertInto(this.root, item);
  }

  private insertInto(node: OctreeNode<T>, item: OctreeItem<T>): void {
    if (!node.leaf) {
      const child = this.childContaining(node, item.bounds);
      if (child) {
        this.insertInto(child, item);
        return;
      }
      node.items.push(item);
      return;
    }

    node.items.push(item);
    if (node.items.length > this.maxItemsPerNode && node.depth < this.maxDepth) {
      this.subdivide(node);
      const remaining: OctreeItem<T>[] = [];
      for (const existing of node.items) {
        const child = this.childContaining(node, existing.bounds);
        if (child) {
          this.insertInto(child, existing);
        } else {
          remaining.push(existing);
        }
      }
      node.items = remaining;
    }
  }

  private removeFrom(node: OctreeNode<T>, item: OctreeItem<T>): boolean {
    const index = node.items.findIndex((existing) => existing.id === item.id);
    if (index >= 0) {
      node.items.splice(index, 1);
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (child.bounds.intersects(item.bounds) && this.removeFrom(child, item)) return true;
      }
    }
    return false;
  }

  private childContaining(node: OctreeNode<T>, box: AABB): OctreeNode<T> | null {
    if (!node.children) return null;
    for (const child of node.children) {
      if (child.bounds.containsAABB(box)) return child;
    }
    return null;
  }

  private subdivide(node: OctreeNode<T>): void {
    node.leaf = false;
    const b = node.bounds;
    const center = b.center;
    const h = b.halfExtents;
    const depth = node.depth + 1;

    // Looseness expands child bounds around their octant centers.
    const childHalf = new Vec3(h.x * 0.5 * this.looseness, h.y * 0.5 * this.looseness, h.z * 0.5 * this.looseness);

    node.children = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const childCenter = new Vec3(
            center.x + sx * h.x * 0.5,
            center.y + sy * h.y * 0.5,
            center.z + sz * h.z * 0.5,
          );
          const childBounds = new AABB(
            new Vec3(childCenter.x - childHalf.x, childCenter.y - childHalf.y, childCenter.z - childHalf.z),
            new Vec3(childCenter.x + childHalf.x, childCenter.y + childHalf.y, childCenter.z + childHalf.z),
          );
          node.children.push(this.createNode(childBounds, depth));
        }
      }
    }
  }

  public queryAABB(box: AABB): T[] {
    const results: T[] = [];
    this.traverseAABB(this.root, box, (item) => results.push(item.data));
    return results;
  }

  public queryAABBItems(box: AABB): OctreeItem<T>[] {
    const results: OctreeItem<T>[] = [];
    this.traverseAABB(this.root, box, (item) => results.push(item));
    return results;
  }

  private traverseAABB(node: OctreeNode<T>, box: AABB, visit: (item: OctreeItem<T>) => void): void {
    if (!node.bounds.intersects(box)) return;
    for (const item of node.items) {
      if (item.bounds.intersects(box)) visit(item);
    }
    if (node.children) {
      for (const child of node.children) this.traverseAABB(child, box, visit);
    }
  }

  public querySphere(sphere: Sphere): T[] {
    const results: T[] = [];
    const traverse = (node: OctreeNode<T>): void => {
      if (node.bounds.distanceToPoint(sphere.center) > sphere.radius) return;
      for (const item of node.items) {
        if (item.bounds.distanceToPoint(sphere.center) <= sphere.radius) results.push(item.data);
      }
      if (node.children) for (const child of node.children) traverse(child);
    };
    traverse(this.root);
    return results;
  }

  public queryRadius(center: Vec3Like, radius: number): T[] {
    return this.querySphere(new Sphere(center, radius));
  }

  public raycast(ray: RayLike, options: { maxDistance?: number; predicate?: (item: OctreeItem<T>) => boolean } = {}): (SpatialHit & { item: OctreeItem<T> }) | null {
    let best: (SpatialHit & { item: OctreeItem<T> }) | null = null;
    let far = options.maxDistance ?? ray.maxDistance ?? Infinity;

    const traverse = (node: OctreeNode<T>): void => {
      const nodeHit = node.bounds.rayIntersection({ ...ray, maxDistance: far });
      if (!nodeHit.hit) return;
      for (const item of node.items) {
        if (options.predicate && !options.predicate(item)) continue;
        const hit = item.bounds.rayIntersection({ ...ray, maxDistance: far });
        if (hit.hit && hit.distance < far) {
          far = hit.distance;
          best = { ...hit, item };
        }
      }
      if (node.children) {
        for (const child of node.children) traverse(child);
      }
    };

    traverse(this.root);
    return best;
  }

  public nearest(point: Vec3Like, maxDistance = Infinity): OctreeItem<T> | null {
    let best: OctreeItem<T> | null = null;
    let bestDistSq = maxDistance === Infinity ? Infinity : maxDistance * maxDistance;

    const traverse = (node: OctreeNode<T>): void => {
      if (node.bounds.distanceSqToPoint(point) > bestDistSq) return;
      for (const item of node.items) {
        const d = item.bounds.distanceSqToPoint(point);
        if (d < bestDistSq) {
          bestDistSq = d;
          best = item;
        }
      }
      if (node.children) {
        for (const child of node.children) traverse(child);
      }
    };

    traverse(this.root);
    return best;
  }

  public getStats(): OctreeStats {
    let nodes = 0;
    let leaves = 0;
    let maxDepth = 0;
    const traverse = (node: OctreeNode<T>): void => {
      nodes += 1;
      maxDepth = Math.max(maxDepth, node.depth);
      if (node.leaf) leaves += 1;
      if (node.children) for (const child of node.children) traverse(child);
    };
    traverse(this.root);
    return { nodes, leaves, items: this.items.size, maxDepth };
  }
}
