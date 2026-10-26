/**
 * @file index.ts
 * @module @aetheria/engine/spatial
 * @description Dependency-free spatial math, bounding volumes, BVH/Octree
 * acceleration structures, raycasts and continuous collision sweeps.
 *
 * Import this module under the `SpatialMath` namespace from the package root to
 * avoid clashing with the structural `AABB`/`OBB` interfaces in `types/spatial`.
 */

export * from './math.js';
export * from './bounds.js';
export * from './primitives.js';
export * from './bvh.js';
export * from './octree.js';
export * from './sweep.js';
