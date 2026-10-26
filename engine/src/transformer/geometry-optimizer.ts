// engine/src/transformer/geometry-optimizer.ts — Gộp mesh (Merge), tối ưu draw calls và sinh LODs
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { LODLevel } from '../types/transform.types';
import { collectMeshes, countTriangles } from '../asset-parser/geometry-extractor';
import { invalidateBounds } from './bounds-calculator';

const MERGE_ATTRIBUTES = ['position', 'normal', 'uv', 'color'] as const;

export function mergeStatic(root: THREE.Object3D, opts: { computeNormals?: boolean } = {}): THREE.Object3D {
  const meshes = collectMeshes(root);
  if (meshes.length === 0) {
    const empty = new THREE.Group();
    empty.name = `${root.name || 'asset'}_merged`;
    return empty;
  }

  root.updateWorldMatrix(true, true);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const localMatrix = new THREE.Matrix4();

  const groups = new Map<string, { material: THREE.Material; geos: THREE.BufferGeometry[] }>();
  for (const mesh of meshes) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const material = mats[0];
    if (!material) continue;
    const geo = toNonIndexedLocal(mesh.geometry, localMatrix.multiplyMatrices(rootInverse, mesh.matrixWorld));
    const group = groups.get(material.uuid);
    if (group) group.geos.push(geo);
    else groups.set(material.uuid, { material, geos: [geo] });
  }

  for (const group of groups.values()) {
    alignAttributes(group.geos);
  }

  const merged = new THREE.Group();
  merged.name = `${root.name || 'asset'}_merged`;
  for (const { material, geos } of groups.values()) {
    const mergedGeo = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!mergedGeo) continue;
    if (opts.computeNormals !== false && !mergedGeo.getAttribute('normal')) {
      mergedGeo.computeVertexNormals();
    }
    merged.add(new THREE.Mesh(mergedGeo, material));
  }

  invalidateBounds(merged);
  return merged;
}

export function simplifyGeometry(src: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
  const r = Math.min(1, Math.max(0.05, ratio));
  const position = src.getAttribute('position');
  if (!position) return src;

  const totalTris = countTriangles(src);
  if (totalTris <= 1 || r >= 1) return src.clone();

  let indexArray: ArrayLike<number>;
  if (src.index) {
    indexArray = src.index.array;
  } else {
    const sequential = new Uint32Array(totalTris * 3);
    for (let i = 0; i < sequential.length; i++) sequential[i] = i;
    indexArray = sequential;
  }

  const keep = Math.max(1, Math.floor(totalTris * r));
  const step = totalTris / keep;
  const newIndex = totalTris * keep <= 65535 ? new Uint16Array(keep * 3) : new Uint32Array(keep * 3);

  for (let i = 0; i < keep; i++) {
    const tri = Math.min(totalTris - 1, Math.floor(i * step));
    newIndex[i * 3] = indexArray[tri * 3];
    newIndex[i * 3 + 1] = indexArray[tri * 3 + 1];
    newIndex[i * 3 + 2] = indexArray[tri * 3 + 2];
  }

  const out = new THREE.BufferGeometry();
  for (const name of Object.keys(src.attributes)) {
    out.setAttribute(name, src.getAttribute(name));
  }
  out.setIndex(new THREE.BufferAttribute(newIndex, 1));
  out.morphAttributes = src.morphAttributes;
  return out;
}

export function buildLOD(root: THREE.Object3D, levels: LODLevel[]): THREE.LOD {
  const sorted = [...levels].sort((a, b) => a.distance - b.distance);
  const meshes = collectMeshes(root);
  const totalTris = meshes.reduce((sum, m) => sum + countTriangles(m.geometry), 0);

  root.updateWorldMatrix(true, true);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const localMatrix = new THREE.Matrix4();

  const lod = new THREE.LOD();
  lod.name = `${root.name || 'asset'}_lod`;
  lod.position.copy(root.position);
  lod.quaternion.copy(root.quaternion);
  lod.scale.copy(root.scale);

  for (const level of sorted) {
    const ratio = resolveRatio(level.detail, totalTris);
    const node = buildLevelNode(meshes, rootInverse, localMatrix, ratio);
    lod.addLevel(node, level.distance);
  }

  invalidateBounds(lod);
  return lod;
}

export function simplifyObject(root: THREE.Object3D, ratio: number): THREE.Object3D {
  const lod = buildLOD(root, [{ distance: 0, detail: ratio }]);
  return lod.levels[0]?.object ?? lod;
}

export function computeVertexNormals(root: THREE.Object3D): void {
  for (const mesh of collectMeshes(root)) {
    mesh.geometry.computeVertexNormals();
  }
}

function resolveRatio(detail: number, totalTris: number): number {
  if (detail <= 1) return Math.min(1, Math.max(0.05, detail));
  if (totalTris <= 0) return 1;
  return Math.min(1, Math.max(0.05, detail / totalTris));
}

function buildLevelNode(
  meshes: THREE.Mesh[],
  rootInverse: THREE.Matrix4,
  tmpMatrix: THREE.Matrix4,
  ratio: number,
): THREE.Object3D {
  const node = new THREE.Group();
  for (const mesh of meshes) {
    tmpMatrix.multiplyMatrices(rootInverse, mesh.matrixWorld);
    const geo = mesh.geometry.clone().applyMatrix4(tmpMatrix);
    const simplified = ratio >= 1 ? geo : simplifyGeometry(geo, ratio);
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    node.add(new THREE.Mesh(simplified, mats[0]));
  }
  if (node.children.length === 1) {
    const only = node.children[0];
    only.removeFromParent();
    return only;
  }
  return node;
}

function toNonIndexedLocal(src: THREE.BufferGeometry, matrix: THREE.Matrix4): THREE.BufferGeometry {
  const geo = (src.index ? src.toNonIndexed() : src.clone()).applyMatrix4(matrix);
  const keep = new Set<string>(MERGE_ATTRIBUTES);
  for (const name of Object.keys(geo.attributes)) {
    if (!keep.has(name)) geo.deleteAttribute(name);
  }
  return geo;
}

function alignAttributes(geos: THREE.BufferGeometry[]): void {
  if (geos.length <= 1) return;
  let common: Set<string> | null = null;
  for (const geo of geos) {
    const names = new Set(Object.keys(geo.attributes));
    if (common === null) {
      common = names;
    } else {
      for (const name of common) {
        if (!names.has(name)) common.delete(name);
      }
    }
  }
  if (!common) return;
  for (const geo of geos) {
    for (const name of Object.keys(geo.attributes)) {
      if (!common.has(name)) geo.deleteAttribute(name);
    }
  }
}

export function mergeMeshes(meshes: THREE.Mesh[]): THREE.Mesh | null {
  if (meshes.length === 0) return null;
  if (meshes.length === 1) return meshes[0].clone();

  const geos: THREE.BufferGeometry[] = [];
  for (const m of meshes) {
    if (m.geometry) geos.push(m.geometry.clone().applyMatrix4(m.matrixWorld));
  }
  const mergedGeo = mergeGeometries(geos, false);
  if (!mergedGeo) return null;

  return new THREE.Mesh(mergedGeo, meshes[0].material);
}

export const GeometryOptimizer = {
  mergeStatic,
  mergeMeshes,
  simplifyGeometry,
  buildLOD,
};

