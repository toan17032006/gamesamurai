/**
 * @file asset-forge.ts
 * @module @aetheria/engine/procedural/asset-forge
 * @description End-to-end procedural asset forge:
 *
 *   recipe → design → create → analyze → spatial calculations →
 *   collision/sockets/LOD planning → optimize → export + manifest
 *
 * The forge composes the existing factory/designer/analyzer/optimizer modules
 * with the spatial math module, so generated assets arrive in the runtime with
 * production-ready bounds, physics proxies, attachment sockets and an asset
 * manifest instead of raw meshes only.
 */

import * as THREE from 'three';
import { AssetFactory, type ExportableFormat, type ExportResult } from './asset-factory.js';
import { designAsset, type AssetDesignPart, type AssetDesignResult, type AssetDesignSpec } from './asset-designer.js';
import { analyzeScene } from '../asset-parser/asset-analyzer.js';
import type { AssetAnalysisReport, AssetBudget } from '../asset-parser/asset-analyzer.js';
import { computeHullBounds, type AABB, type OBB, type Sphere, type HullBounds, type Vec3Like } from '../spatial/index.js';
import { mergeStatic } from '../transformer/geometry-optimizer.js';
import type { AssetCategory, RigKind, SocketDefinition } from '../types/asset.types.js';
import type { CollisionShape, PhysicsMaterial } from '../types/physics.types.js';

export type ForgeCollisionMode = 'auto' | 'none' | 'box' | 'sphere' | 'capsule' | 'convexMesh';

export interface ForgePhysicsSpec {
  mass?: number;
  friction?: number;
  restitution?: number;
  density?: number;
  gravityScale?: number;
  isStatic?: boolean;
  collision?: ForgeCollisionMode;
}

export interface ForgeLodSpec {
  /** Distance at which this level activates. */
  distance: number;
  /** Target triangle ratio in `(0, 1]`. */
  ratio: number;
  targetTriangles?: number;
}

export interface ForgeSocketSpec {
  name: string;
  /** Optional bone to attach the socket to. */
  parentBone?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  categoryAllowed?: AssetCategory[];
}

export interface ForgeRecipe extends AssetDesignSpec {
  /** Stable asset id (defaults to the name). */
  id?: string;
  tags?: string[];
  rig?: RigKind;
  physics?: ForgePhysicsSpec;
  sockets?: ForgeSocketSpec[];
  lods?: ForgeLodSpec[];
  /** Free-form custom metadata preserved through the pipeline. */
  custom?: Record<string, unknown>;
}

export interface ForgeBounds {
  aabb: { min: [number, number, number]; max: [number, number, number] };
  obb: {
    center: [number, number, number];
    halfExtents: [number, number, number];
    orientation: [number, number, number, number];
  };
  sphere: { center: [number, number, number]; radius: number };
  volume: number;
  surfaceArea: number;
  centerOfMass: [number, number, number];
}

export interface ForgeCollision {
  shape: CollisionShape;
  /** World-space spawn position for a `PhysicsBody` using this shape. */
  position: [number, number, number];
  mass: number;
  material: PhysicsMaterial;
  isStatic: boolean;
  gravityScale: number;
}

export interface ForgeSocket {
  name: string;
  parentBone?: string;
  offset: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  categoryAllowed?: AssetCategory[];
}

export interface ForgeLodPlan {
  level: number;
  distance: number;
  ratio: number;
  targetTriangles: number;
  reason: string;
}

export interface ForgeStatistics {
  meshes: number;
  triangles: number;
  vertices: number;
  materials: number;
  drawCalls: number;
  bytes: number;
  formattedBytes: string;
  score: number;
  withinBudget: boolean;
}

export interface ForgeResult {
  id: string;
  name: string;
  category: AssetCategory;
  tags: string[];
  rig: RigKind;
  root: THREE.Group;
  design: AssetDesignResult;
  analysis: AssetAnalysisReport;
  bounds: ForgeBounds;
  hull: HullBounds;
  collision: ForgeCollision | null;
  sockets: ForgeSocket[];
  lods: ForgeLodPlan[];
  statistics: ForgeStatistics;
  custom: Record<string, unknown>;
}

export interface ForgeOptimizeOptions {
  /** Merge static meshes by material to reduce draw calls. */
  mergeDrawCalls?: boolean;
  /** Recompute normals on merged geometry. */
  computeNormals?: boolean;
}

export interface ForgeOptimizeResult {
  root: THREE.Group;
  drawCallsBefore: number;
  drawCallsAfter: number;
  trianglesBefore: number;
  trianglesAfter: number;
  lods: ForgeLodPlan[];
}

export interface ForgeExportBundle {
  asset: ForgeResult;
  optimized: ForgeOptimizeResult;
  exports: ExportResult[];
  manifest: ForgeManifest;
}

export interface ForgeManifest {
  version: 1;
  generator: 'aetheria.asset-forge';
  generatedAt: string;
  asset: {
    id: string;
    name: string;
    category: AssetCategory;
    rig: RigKind;
    tags: string[];
    format: 'procedural';
  };
  bounds: ForgeBounds;
  collision: {
    kind: CollisionShape['kind'] | 'none';
    mass: number;
    friction: number;
    restitution: number;
    isStatic: boolean;
  };
  sockets: ForgeSocket[];
  lods: ForgeLodPlan[];
  metrics: ForgeStatistics;
  exports: Array<{ format: ExportableFormat; extension: string; bytes: number }>;
  custom: Record<string, unknown>;
}

function toTuple(v: Vec3Like): [number, number, number] {
  return [v.x, v.y, v.z];
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

/** Collect world-space vertices from every mesh in a scene. */
export function collectWorldVertices(root: THREE.Object3D): Vec3Like[] {
  root.updateMatrixWorld(true);
  const points: Vec3Like[] = [];
  const vertex = new THREE.Vector3();
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const position = mesh.geometry.getAttribute('position');
    if (!position) return;
    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      points.push({ x: vertex.x, y: vertex.y, z: vertex.z });
    }
  });
  return points;
}

/** Serialise a spatial hull into a stable, JSON-friendly record. */
export function boundsToForgeRecord(hull: HullBounds): ForgeBounds {
  return {
    aabb: {
      min: toTuple(hull.aabb.min),
      max: toTuple(hull.aabb.max),
    },
    obb: {
      center: toTuple(hull.obb.center),
      halfExtents: toTuple(hull.obb.halfExtents),
      orientation: [hull.obb.orientation.x, hull.obb.orientation.y, hull.obb.orientation.z, hull.obb.orientation.w],
    },
    sphere: {
      center: toTuple(hull.sphere.center),
      radius: hull.sphere.radius,
    },
    volume: hull.volume,
    surfaceArea: hull.surfaceArea,
    centerOfMass: toTuple(hull.centroid),
  };
}

/** Recalculate bounds from the current scene graph. */
export function calculateForgeBounds(root: THREE.Object3D): { hull: HullBounds; bounds: ForgeBounds } {
  const points = collectWorldVertices(root);
  const hull = computeHullBounds(points);
  return { hull, bounds: boundsToForgeRecord(hull) };
}

function defaultCollisionForCategory(category: AssetCategory): ForgeCollisionMode {
  switch (category) {
    case 'character':
    case 'monster':
    case 'boss':
    case 'npc':
    case 'mount':
      return 'capsule';
    case 'rock':
    case 'tree':
    case 'prop':
      return 'convexMesh';
    default:
      return 'box';
  }
}

function defaultMassForCategory(category: AssetCategory): number {
  switch (category) {
    case 'character':
    case 'npc':
      return 70;
    case 'monster':
    case 'boss':
      return 220;
    case 'mount':
      return 400;
    case 'weapon':
    case 'shield':
    case 'armor':
    case 'helmet':
    case 'accessory':
      return 4;
    default:
      return 20;
  }
}

/** Build a physics proxy from computed hull bounds and the recipe spec. */
export function calculateForgeCollision(
  recipe: ForgeRecipe,
  hull: HullBounds,
  points: readonly Vec3Like[],
): ForgeCollision | null {
  const mode = recipe.physics?.collision ?? defaultCollisionForCategory(recipe.category);
  if (mode === 'none') return null;

  const aabb: AABB = hull.aabb;
  const center = aabb.center;
  const half = aabb.halfExtents;
  let shape: CollisionShape;

  switch (mode) {
    case 'sphere':
      shape = { kind: 'sphere', radius: Math.max(0.01, hull.sphere.radius) };
      break;
    case 'capsule': {
      const radius = Math.max(0.01, Math.max(half.x, half.z));
      shape = {
        kind: 'capsule',
        radius,
        height: Math.max(half.y * 2, radius * 2),
        axis: 'y',
      };
      break;
    }
    case 'convexMesh': {
      const vertices = new Float32Array(points.length * 3);
      for (let i = 0; i < points.length; i += 1) {
        vertices[i * 3] = points[i].x - center.x;
        vertices[i * 3 + 1] = points[i].y - center.y;
        vertices[i * 3 + 2] = points[i].z - center.z;
      }
      shape = points.length >= 4
        ? { kind: 'mesh', vertices, isConvex: true }
        : { kind: 'sphere', radius: Math.max(0.01, hull.sphere.radius) };
      break;
    }
    case 'box':
    case 'auto':
    default:
      shape = {
        kind: 'box',
        half: {
          x: Math.max(0.01, half.x),
          y: Math.max(0.01, half.y),
          z: Math.max(0.01, half.z),
        },
      };
      break;
  }

  return {
    shape,
    position: toTuple(center),
    mass: recipe.physics?.mass ?? defaultMassForCategory(recipe.category),
    material: {
      friction: recipe.physics?.friction ?? 0.7,
      restitution: recipe.physics?.restitution ?? 0.15,
      density: recipe.physics?.density ?? 1,
    },
    isStatic: recipe.physics?.isStatic ?? false,
    gravityScale: recipe.physics?.gravityScale ?? 1,
  };
}

/** Generate the default attachment sockets from bounds. */
export function calculateForgeSockets(recipe: ForgeRecipe, hull: HullBounds): ForgeSocket[] {
  const provided = recipe.sockets ?? [];
  const size = hull.aabb.size;
  const defaults: ForgeSocketSpec[] = [
    { name: 'root', position: [0, 0, 0] },
    { name: 'top', position: [0, size.y / 2, 0] },
    { name: 'bottom', position: [0, -size.y / 2, 0] },
    { name: 'left', position: [-size.x / 2, 0, 0] },
    { name: 'right', position: [size.x / 2, 0, 0] },
    { name: 'front', position: [0, 0, size.z / 2] },
    { name: 'back', position: [0, 0, -size.z / 2] },
  ];

  const merged = new Map<string, ForgeSocketSpec>();
  for (const socket of [...defaults, ...provided]) {
    if (!merged.has(socket.name)) merged.set(socket.name, socket);
  }

  return Array.from(merged.values()).map((socket) => ({
    name: socket.name,
    parentBone: socket.parentBone,
    offset: socket.position ?? [0, 0, 0],
    rotation: socket.rotation ?? [0, 0, 0],
    scale: socket.scale ?? 1,
    categoryAllowed: socket.categoryAllowed,
  }));
}

/** Convert generated sockets to the public `SocketDefinition` contract. */
export function forgeSocketsToDefinitions(sockets: readonly ForgeSocket[]): SocketDefinition[] {
  return sockets.map((socket) => ({
    name: socket.name,
    parentBone: socket.parentBone ?? 'root',
    offset: {
      position: { x: socket.offset[0], y: socket.offset[1], z: socket.offset[2] },
      rotation: { x: socket.rotation[0], y: socket.rotation[1], z: socket.rotation[2] },
      scale: socket.scale,
    },
    categoryAllowed: socket.categoryAllowed,
  }));
}

/** Plan LOD levels from explicit specs or the analyzer suggestions. */
export function calculateForgeLods(recipe: ForgeRecipe, analysis: AssetAnalysisReport): ForgeLodPlan[] {
  if (recipe.lods && recipe.lods.length > 0) {
    return recipe.lods.map((lod, index) => ({
      level: index,
      distance: Math.max(0, lod.distance),
      ratio: Math.max(0.01, Math.min(1, lod.ratio)),
      targetTriangles: lod.targetTriangles ?? Math.max(1, Math.round(analysis.triangles * lod.ratio)),
      reason: 'recipe',
    }));
  }

  return analysis.lodSuggestions.map((suggestion) => ({
    level: suggestion.level,
    distance: suggestion.level === 0 ? 0 : 15 * 2 ** (suggestion.level - 1),
    ratio: suggestion.reduction,
    targetTriangles: suggestion.targetTriangles,
    reason: suggestion.reason,
  }));
}

function statisticsOf(analysis: AssetAnalysisReport): ForgeStatistics {
  return {
    meshes: analysis.meshes,
    triangles: analysis.triangles,
    vertices: analysis.vertices,
    materials: analysis.materials,
    drawCalls: analysis.drawCalls,
    bytes: analysis.totalBytes,
    formattedBytes: formatBytes(analysis.totalBytes),
    score: analysis.score,
    withinBudget: analysis.withinBudget,
  };
}

/**
 * High-level asset creation/design/analysis/calculation pipeline.
 */
export class AssetForge {
  /** Build a complete forge result from a recipe. */
  public static create(recipe: ForgeRecipe): ForgeResult {
    const design = designAsset(recipe);
    const root = design.root;
    root.name = recipe.name;

    const points = collectWorldVertices(root);
    const hull = computeHullBounds(points);
    const bounds = boundsToForgeRecord(hull);
    const analysis = analyzeScene(root, recipe.category, { budget: recipe.budget });
    const collision = calculateForgeCollision(recipe, hull, points);
    const sockets = calculateForgeSockets(recipe, hull);
    const lods = calculateForgeLods(recipe, analysis);

    return {
      id: recipe.id ?? recipe.name,
      name: recipe.name,
      category: recipe.category,
      tags: recipe.tags ?? [],
      rig: recipe.rig ?? 'static',
      root,
      design,
      analysis,
      bounds,
      hull,
      collision,
      sockets,
      lods,
      statistics: statisticsOf(analysis),
      custom: recipe.custom ?? {},
    };
  }

  /** Re-analyze and re-calculate a forged asset after external edits. */
  public static analyze(asset: ForgeResult, recipe: ForgeRecipe): ForgeResult {
    const points = collectWorldVertices(asset.root);
    const hull = computeHullBounds(points);
    const analysis = analyzeScene(asset.root, asset.category, { budget: recipe.budget });
    return {
      ...asset,
      analysis,
      hull,
      bounds: boundsToForgeRecord(hull),
      collision: calculateForgeCollision(recipe, hull, points),
      sockets: calculateForgeSockets(recipe, hull),
      lods: calculateForgeLods(recipe, analysis),
      statistics: statisticsOf(analysis),
    };
  }

  /** Merge static meshes and report the draw-call/triangle deltas. */
  public static optimize(asset: ForgeResult, options: ForgeOptimizeOptions = {}): ForgeOptimizeResult {
    const before = analyzeScene(asset.root, asset.category);
    let root = asset.root;

    if (options.mergeDrawCalls !== false && before.meshes > 1) {
      const merged = mergeStatic(asset.root, { computeNormals: options.computeNormals });
      if (merged.children.length > 0) {
        merged.name = asset.root.name;
        merged.userData = { ...asset.root.userData, mergedFrom: before.meshes };
        root = merged;
      }
    }

    const after = analyzeScene(root, asset.category);
    return {
      root,
      drawCallsBefore: before.drawCalls,
      drawCallsAfter: after.drawCalls,
      trianglesBefore: before.triangles,
      trianglesAfter: after.triangles,
      lods: calculateForgeLods({
        name: asset.name,
        category: asset.category,
        parts: [],
        lods: asset.lods.map((lod) => ({ distance: lod.distance, ratio: lod.ratio, targetTriangles: lod.targetTriangles })),
      }, after),
    };
  }

  /** Export a forged asset to one format with a generated manifest entry. */
  public static export(
    asset: ForgeResult,
    format: ExportableFormat,
  ): { exported: ExportResult; manifest: ForgeManifest } {
    const exported = AssetFactory.export(asset.root, format, asset.name);
    const byteLength = exported.bytes?.byteLength ?? new TextEncoder().encode(exported.text ?? '').byteLength;
    const manifest: ForgeManifest = {
      version: 1,
      generator: 'aetheria.asset-forge',
      generatedAt: new Date().toISOString(),
      asset: {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        rig: asset.rig,
        tags: asset.tags,
        format: 'procedural',
      },
      bounds: asset.bounds,
      collision: {
        kind: asset.collision?.shape.kind ?? 'none',
        mass: asset.collision?.mass ?? 0,
        friction: asset.collision?.material.friction ?? 0,
        restitution: asset.collision?.material.restitution ?? 0,
        isStatic: asset.collision?.isStatic ?? true,
      },
      sockets: asset.sockets,
      lods: asset.lods,
      metrics: asset.statistics,
      exports: [{ format, extension: exported.extension, bytes: byteLength }],
      custom: asset.custom,
    };
    return { exported, manifest };
  }

  /** Full recipe → optimize → multi-format export pipeline. */
  public static pipeline(
    recipe: ForgeRecipe,
    formats: readonly ExportableFormat[] = ['glb', 'gltf', 'obj', 'stl', 'ply', 'usda'],
    options: ForgeOptimizeOptions = {},
  ): ForgeExportBundle {
    const asset = AssetForge.create(recipe);
    const optimized = AssetForge.optimize(asset, options);
    const optimizedAsset: ForgeResult = {
      ...asset,
      root: optimized.root,
      statistics: {
        ...asset.statistics,
        drawCalls: optimized.drawCallsAfter,
        triangles: optimized.trianglesAfter,
      },
      lods: optimized.lods,
    };

    const exports: ExportResult[] = [];
    for (const format of formats) {
      exports.push(AssetFactory.export(optimized.root, format, recipe.name));
    }

    const manifest = AssetForge.export(optimizedAsset, formats[0] ?? 'glb').manifest;
    manifest.exports = exports.map((entry) => ({
      format: entry.format,
      extension: entry.extension,
      bytes: entry.bytes?.byteLength ?? new TextEncoder().encode(entry.text ?? '').byteLength,
    }));

    return {
      asset: optimizedAsset,
      optimized,
      exports,
      manifest,
    };
  }
}

/** Functional alias matching the engine's other `create*` helpers. */
export function forgeAsset(recipe: ForgeRecipe): ForgeResult {
  return AssetForge.create(recipe);
}

/** Functional alias for the full pipeline. */
export function forgeAndExport(
  recipe: ForgeRecipe,
  formats: readonly ExportableFormat[] = ['glb', 'obj'],
): ForgeExportBundle {
  return AssetForge.pipeline(recipe, formats);
}
