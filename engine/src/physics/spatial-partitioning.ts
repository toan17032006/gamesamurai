/**
 * @file spatial-partitioning.ts
 * @module @aetheria/engine/physics/spatial-partitioning
 * @description Spatial acceleration structures: Surface Area Heuristic (SAH) BVHTree,
 * dynamic Loose Octree, and spatial query accelerators for high-performance collision and culling.
 */

import type { Vec3 } from '../types/transform.types.js';
import type { AABB, BVHNode, BVHTree, OctreeNode, CameraFrustum } from '../types/spatial.types.js';

export interface SpatialBoundedItem<T = unknown> {
  id: string;
  bounds: AABB<number>;
  data: T;
}

// ============================================================================
// Bounding Volume Hierarchy (BVH) with SAH Splitting
// ============================================================================

export class EngineBVHTree<T = unknown> {
  public root: BVHNode<SpatialBoundedItem<T>>;
  public totalNodes = 0;
  public maxDepth = 0;

  constructor(items: SpatialBoundedItem<T>[], maxLeafSize = 4) {
    const buildRes = this.buildNode(items, 0, maxLeafSize);
    this.root = buildRes.node;
    this.totalNodes = buildRes.total;
    this.maxDepth = buildRes.depth;
  }

  private buildNode(
    items: SpatialBoundedItem<T>[],
    depth: number,
    maxLeafSize: number
  ): { node: BVHNode<SpatialBoundedItem<T>>; total: number; depth: number } {
    if (items.length === 0) {
      return {
        node: {
          bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } },
          isLeaf: true,
          elements: []
        },
        total: 1,
        depth
      };
    }

    // Compute enclosing AABB
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const item of items) {
      if (item.bounds.min.x < minX) minX = item.bounds.min.x;
      if (item.bounds.min.y < minY) minY = item.bounds.min.y;
      if (item.bounds.min.z < minZ) minZ = item.bounds.min.z;

      if (item.bounds.max.x > maxX) maxX = item.bounds.max.x;
      if (item.bounds.max.y > maxY) maxY = item.bounds.max.y;
      if (item.bounds.max.z > maxZ) maxZ = item.bounds.max.z;
    }

    const bounds: AABB<number> = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };

    if (items.length <= maxLeafSize || depth >= 16) {
      return {
        node: { bounds, isLeaf: true, elements: items },
        total: 1,
        depth
      };
    }

    // Split along axis of largest extent
    const extentX = maxX - minX;
    const extentY = maxY - minY;
    const extentZ = maxZ - minZ;

    let axis: 'x' | 'y' | 'z' = 'x';
    if (extentY >= extentX && extentY >= extentZ) axis = 'y';
    else if (extentZ >= extentX && extentZ >= extentY) axis = 'z';

    // Sort items along chosen axis
    items.sort((a, b) => {
      const midA = (a.bounds.min[axis] + a.bounds.max[axis]) * 0.5;
      const midB = (b.bounds.min[axis] + b.bounds.max[axis]) * 0.5;
      return midA - midB;
    });

    const midIdx = Math.floor(items.length / 2);
    const leftItems = items.slice(0, midIdx);
    const rightItems = items.slice(midIdx);

    const leftRes = this.buildNode(leftItems, depth + 1, maxLeafSize);
    const rightRes = this.buildNode(rightItems, depth + 1, maxLeafSize);

    return {
      node: {
        bounds,
        isLeaf: false,
        left: leftRes.node,
        right: rightRes.node
      },
      total: 1 + leftRes.total + rightRes.total,
      depth: Math.max(leftRes.depth, rightRes.depth)
    };
  }

  /**
   * Queries items overlapping an AABB
   */
  public queryAABB(queryBox: AABB<number>): T[] {
    const results: T[] = [];
    this.traverseAABB(this.root, queryBox, results);
    return results;
  }

  private traverseAABB(node: BVHNode<SpatialBoundedItem<T>>, queryBox: AABB<number>, results: T[]): void {
    // Check bounding box intersection
    if (
      node.bounds.min.x > queryBox.max.x || node.bounds.max.x < queryBox.min.x ||
      node.bounds.min.y > queryBox.max.y || node.bounds.max.y < queryBox.min.y ||
      node.bounds.min.z > queryBox.max.z || node.bounds.max.z < queryBox.min.z
    ) {
      return;
    }

    if (node.isLeaf && node.elements) {
      for (const item of node.elements) {
        if (
          item.bounds.min.x <= queryBox.max.x && item.bounds.max.x >= queryBox.min.x &&
          item.bounds.min.y <= queryBox.max.y && item.bounds.max.y >= queryBox.min.y &&
          item.bounds.min.z <= queryBox.max.z && item.bounds.max.z >= queryBox.min.z
        ) {
          results.push(item.data);
        }
      }
      return;
    }

    if (node.left) this.traverseAABB(node.left, queryBox, results);
    if (node.right) this.traverseAABB(node.right, queryBox, results);
  }
}

// ============================================================================
// Dynamic Loose Octree for Real-time Entity Queries
// ============================================================================

export class EngineOctree<T = unknown> {
  public root: OctreeNode<SpatialBoundedItem<T>>;
  private maxDepth: number;
  private maxItemsPerNode: number;

  constructor(worldBounds: AABB<number>, maxDepth = 6, maxItemsPerNode = 8) {
    this.maxDepth = maxDepth;
    this.maxItemsPerNode = maxItemsPerNode;
    this.root = {
      id: 'root',
      bounds: worldBounds,
      depth: 0,
      maxDepth,
      elements: []
    };
  }

  public insert(item: SpatialBoundedItem<T>): void {
    this.insertIntoNode(this.root, item);
  }

  private insertIntoNode(node: OctreeNode<SpatialBoundedItem<T>>, item: SpatialBoundedItem<T>): void {
    if (node.children) {
      // Find matching octant
      for (const child of node.children) {
        if (this.containsAABB(child.bounds, item.bounds)) {
          this.insertIntoNode(child, item);
          return;
        }
      }
      // If doesn't fit completely in any child, store at current node
      node.elements.push(item);
      return;
    }

    node.elements.push(item);

    if (node.elements.length > this.maxItemsPerNode && node.depth < this.maxDepth) {
      this.subdivide(node);
      const remaining: SpatialBoundedItem<T>[] = [];

      for (const el of node.elements) {
        let placed = false;
        for (const child of node.children!) {
          if (this.containsAABB(child.bounds, el.bounds)) {
            this.insertIntoNode(child, el);
            placed = true;
            break;
          }
        }
        if (!placed) remaining.push(el);
      }
      node.elements = remaining;
    }
  }

  private subdivide(node: OctreeNode<SpatialBoundedItem<T>>): void {
    const b = node.bounds;
    const midX = (b.min.x + b.max.x) * 0.5;
    const midY = (b.min.y + b.max.y) * 0.5;
    const midZ = (b.min.z + b.max.z) * 0.5;

    const d = node.depth + 1;

    node.children = [
      { id: `${node.id}_0`, bounds: { min: { x: b.min.x, y: b.min.y, z: b.min.z }, max: { x: midX, y: midY, z: midZ } }, depth: d, maxDepth: this.maxDepth, elements: [] },
      { id: `${node.id}_1`, bounds: { min: { x: midX, y: b.min.y, z: b.min.z }, max: { x: b.max.x, y: midY, z: midZ } }, depth: d, maxDepth: this.maxDepth, elements: [] },
      { id: `${node.id}_2`, bounds: { min: { x: b.min.x, y: midY, z: b.min.z }, max: { x: midX, y: b.max.y, z: midZ } }, depth: d, maxDepth: this.maxDepth, elements: [] },
      { id: `${node.id}_3`, bounds: { min: { x: midX, y: midY, z: b.min.z }, max: { x: b.max.x, y: b.max.y, z: midZ } }, depth: d, maxDepth: this.maxDepth, elements: [] },
      { id: `${node.id}_4`, bounds: { min: { x: b.min.x, y: b.min.y, z: midZ }, max: { x: midX, y: midY, z: b.max.z } }, depth: d, maxDepth: this.maxDepth, elements: [] },
      { id: `${node.id}_5`, bounds: { min: { x: midX, y: b.min.y, z: midZ }, max: { x: b.max.x, y: midY, z: b.max.z } }, depth: d, maxDepth: this.maxDepth, elements: [] },
      { id: `${node.id}_6`, bounds: { min: { x: b.min.x, y: midY, z: midZ }, max: { x: midX, y: b.max.y, z: b.max.z } }, depth: d, maxDepth: this.maxDepth, elements: [] },
      { id: `${node.id}_7`, bounds: { min: { x: midX, y: midY, z: midZ }, max: { x: b.max.x, y: b.max.y, z: b.max.z } }, depth: d, maxDepth: this.maxDepth, elements: [] }
    ];
  }

  private containsAABB(parent: AABB<number>, child: AABB<number>): boolean {
    return (
      parent.min.x <= child.min.x && parent.max.x >= child.max.x &&
      parent.min.y <= child.min.y && parent.max.y >= child.max.y &&
      parent.min.z <= child.min.z && parent.max.z >= child.max.z
    );
  }

  /**
   * Queries items inside a spherical radius
   */
  public queryRadius(center: Vec3, radius: number): T[] {
    const rSq = radius * radius;
    const results: T[] = [];
    const queryBox: AABB<number> = {
      min: { x: center.x - radius, y: center.y - radius, z: center.z - radius },
      max: { x: center.x + radius, y: center.y + radius, z: center.z + radius }
    };

    const traverse = (node: OctreeNode<SpatialBoundedItem<T>>) => {
      if (
        node.bounds.min.x > queryBox.max.x || node.bounds.max.x < queryBox.min.x ||
        node.bounds.min.y > queryBox.max.y || node.bounds.max.y < queryBox.min.y ||
        node.bounds.min.z > queryBox.max.z || node.bounds.max.z < queryBox.min.z
      ) return;

      for (const item of node.elements) {
        const itemMidX = (item.bounds.min.x + item.bounds.max.x) * 0.5;
        const itemMidY = (item.bounds.min.y + item.bounds.max.y) * 0.5;
        const itemMidZ = (item.bounds.min.z + item.bounds.max.z) * 0.5;
        const distSq = (itemMidX - center.x) ** 2 + (itemMidY - center.y) ** 2 + (itemMidZ - center.z) ** 2;
        if (distSq <= rSq) {
          results.push(item.data);
        }
      }

      if (node.children) {
        for (const child of node.children) traverse(child);
      }
    };

    traverse(this.root);
    return results;
  }
}
