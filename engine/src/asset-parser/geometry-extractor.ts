// engine/src/asset-parser/geometry-extractor.ts — Trích xuất vertices, normals, UVs, tangets, bones từ mesh 3D
import * as THREE from 'three';
import type { GeometryStats, VertexBufferData } from '../types/asset.types';

interface RawBuffers {
  positions: number[];
  normals: number[];
  uvs: number[];
  hasNormals: boolean;
  hasUvs: boolean;
}

export function countTriangles(geometry: THREE.BufferGeometry): number {
  const index = geometry.index;
  if (index) return Math.floor(index.count / 3);
  const pos = geometry.getAttribute('position');
  return pos ? Math.floor(pos.count / 3) : 0;
}

export function collectMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  return meshes;
}

export function collectBones(root: THREE.Object3D): THREE.Bone[] {
  const seen = new Set<number>();
  const bones: THREE.Bone[] = [];
  const push = (b: THREE.Bone) => {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      bones.push(b);
    }
  };
  root.traverse((child) => {
    const skinned = child as THREE.SkinnedMesh;
    if (skinned.isSkinnedMesh && skinned.skeleton) {
      for (const b of skinned.skeleton.bones) push(b);
    }
    if ((child as THREE.Bone).isBone) push(child as THREE.Bone);
  });
  return bones;
}

export function collectMaterials(root: THREE.Object3D): THREE.Material[] {
  const seen = new Set<string>();
  const materials: THREE.Material[] = [];
  for (const mesh of collectMeshes(root)) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (!m) continue;
      if (!seen.has(m.uuid)) {
        seen.add(m.uuid);
        materials.push(m);
      }
    }
  }
  return materials;
}

/**
 * Sao chép một attribute thành mảng float liên tục.
 *
 * Không dùng `new Float32Array(attr.array)` vì geometry có thể interleaved
 * (một buffer dùng chung cho nhiều attribute) — khi đó `attr.array` là cả
 * buffer liền, số phần tử lệch và dữ liệu ra sai.
 */
function copyFloats(
  attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  itemSize: number,
): Float32Array {
  const out = new Float32Array(attr.count * itemSize);
  for (let i = 0; i < attr.count; i++) {
    const base = i * itemSize;
    out[base] = attr.getX(i);
    if (itemSize > 1) out[base + 1] = attr.getY(i);
    if (itemSize > 2) out[base + 2] = attr.getZ(i);
    if (itemSize > 3) out[base + 3] = attr.getW(i);
  }
  return out;
}

/** Sao chép index thành mảng uint32 liên tục. */
function copyIndex(index: THREE.BufferAttribute): Uint32Array {
  const out = new Uint32Array(index.count);
  for (let i = 0; i < index.count; i++) out[i] = index.getX(i);
  return out;
}

export function extractRawBufferData(mesh: THREE.Mesh): VertexBufferData {
  const geo = mesh.geometry;
  const posAttr = geo.getAttribute('position');
  const normAttr = geo.getAttribute('normal');
  const uvAttr = geo.getAttribute('uv');
  const uv2Attr = geo.getAttribute('uv2');
  const colorAttr = geo.getAttribute('color');
  const tangAttr = geo.getAttribute('tangent');
  const skinIdxAttr = geo.getAttribute('skinIndex');
  const skinWeightAttr = geo.getAttribute('skinWeight');

  return {
    positions: posAttr ? new Float32Array(posAttr.array) : new Float32Array(0),
    normals: normAttr ? copyFloats(normAttr, 3) : undefined,
    uvs: uvAttr ? copyFloats(uvAttr, 2) : undefined,
    uv2s: uv2Attr ? copyFloats(uv2Attr, 2) : undefined,
    colors: colorAttr ? copyFloats(colorAttr, colorAttr.itemSize === 4 ? 4 : 3) : undefined,
    tangents: tangAttr ? copyFloats(tangAttr, 4) : undefined,
    skinIndices: skinIdxAttr ? (copyFloats(skinIdxAttr, 4) as Float32Array) : undefined,
    skinWeights: skinWeightAttr ? copyFloats(skinWeightAttr, 4) : undefined,
    indices: geo.index ? copyIndex(geo.index) : undefined,
  };
}

export function extractGeometry(root: THREE.Object3D): THREE.BufferGeometry | null {
  const meshes = collectMeshes(root);
  if (meshes.length === 0) return null;

  root.updateWorldMatrix(true, true);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const localMatrix = new THREE.Matrix4();

  const buffers: RawBuffers = {
    positions: [],
    normals: [],
    uvs: [],
    hasNormals: true,
    hasUvs: true,
  };

  for (const mesh of meshes) {
    localMatrix.multiplyMatrices(rootInverse, mesh.matrixWorld);
    appendMeshGeometry(mesh, localMatrix, buffers);
  }

  if (buffers.positions.length === 0) return null;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(buffers.positions, 3));
  if (buffers.hasNormals && buffers.normals.length === buffers.positions.length) {
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(buffers.normals, 3));
  }
  if (buffers.hasUvs && buffers.uvs.length === (buffers.positions.length / 3) * 2) {
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(buffers.uvs, 2));
  }
  return geo;
}

function appendMeshGeometry(mesh: THREE.Mesh, localMatrix: THREE.Matrix4, out: RawBuffers): void {
  const geo = mesh.geometry;
  const posAttr = geo.getAttribute('position');
  if (!posAttr) return;

  const normAttr = geo.getAttribute('normal');
  const uvAttr = geo.getAttribute('uv');
  if (!normAttr) out.hasNormals = false;
  if (!uvAttr) out.hasUvs = false;

  const normalMatrix = new THREE.Matrix3().getNormalMatrix(localMatrix);
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const index = geo.index;

  const getIdx = (i: number) => (index ? index.getX(i) : i);
  const vertexCount = index ? index.count : posAttr.count;

  for (let i = 0; i < vertexCount; i++) {
    const idx = getIdx(i);
    v.fromBufferAttribute(posAttr, idx).applyMatrix4(localMatrix);
    out.positions.push(v.x, v.y, v.z);

    if (normAttr && out.hasNormals) {
      n.fromBufferAttribute(normAttr, idx).applyMatrix3(normalMatrix).normalize();
      out.normals.push(n.x, n.y, n.z);
    }
    if (uvAttr && out.hasUvs) {
      out.uvs.push(uvAttr.getX(idx), uvAttr.getY(idx));
    }
  }
}

export function extractStats(root: THREE.Object3D): GeometryStats {
  const meshes = collectMeshes(root);
  const bones = collectBones(root);
  const materials = collectMaterials(root);

  let vertices = 0;
  let triangles = 0;
  let hasSkinning = false;
  let hasMorphTargets = false;

  for (const m of meshes) {
    const geo = m.geometry;
    const pos = geo.getAttribute('position');
    if (pos) vertices += pos.count;
    triangles += countTriangles(geo);
    if ((m as THREE.SkinnedMesh).isSkinnedMesh) hasSkinning = true;
    if (geo.morphAttributes && Object.keys(geo.morphAttributes).length > 0) hasMorphTargets = true;
  }

  return {
    meshes: meshes.length,
    vertices,
    triangles,
    materials: materials.length,
    bones: bones.length,
    hasSkinning,
    hasMorphTargets,
  };
}
