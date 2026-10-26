/**
 * @file usd-parser.ts
 * @module @aetheria/engine/asset-parser/usd-parser
 * @description Bóc tách USD — ASCII (`.usda`) và crate nhị phân (`.usdc` / `.usd`).
 *
 * Cả hai định dạng đều được chuẩn hoá về cùng cấu trúc `UsdSpec[]`, rồi một
 * bộ dựng scene dùng chung biến prim thành cây `THREE.Object3D`:
 *   - prim có `points` + `faceVertexIndices`  → Mesh
 *   - prim có `xformOp:transform`             → transform 4x4
 *   - `xformOpOrder` xác định thứ tự phép biến đổi
 *   - `primvars:displayColor`                 → màu vật liệu
 */

import * as THREE from 'three';
import type { UsdSpec } from './usdc-parser.js';
import { parseUsdc } from './usdc-parser.js';
import { parseUsda } from './usda-parser.js';

export interface UsdParseOptions {
  name?: string;
  /** Đơn vị scene (metersPerUnit). Mặc định 0.01 như USD. */
  metersPerUnit?: number;
}

export interface UsdParseResult {
  scene: THREE.Group;
  /** Số prim đã đọc. */
  primCount: number;
  /** Số mesh đã dựng. */
  meshCount: number;
  version: string;
  warnings: string[];
  /** Đường dẫn asset được tham chiếu (texture, asset). */
  dependencies: string[];
}

const USDC_MAGIC = 'PXR-USDC';

/** Chuyển mảng phẳng (mảng của mảng) thành mảng số. */
function flattenNumbers(value: unknown): number[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'number') return [value];
  if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Int32Array || value instanceof Uint32Array) {
    return Array.from(value as ArrayLike<number>);
  }
  if (Array.isArray(value)) {
    const out: number[] = [];
    for (const item of value) out.push(...flattenNumbers(item));
    return out;
  }
  return [];
}

/** Đọc ma trận 4x4 từ thuộc tính USD (row-major). */
function readMatrix(value: unknown): number[] | null {
  const flat = flattenNumbers(value);
  if (flat.length < 16) return null;
  // USD lưu ma trận theo hàng; three.js cần cột → chuyển thứ tự.
  const m = new THREE.Matrix4();
  m.set(
    flat[0], flat[4], flat[8], flat[12],
    flat[1], flat[5], flat[9], flat[13],
    flat[2], flat[6], flat[10], flat[14],
    flat[3], flat[7], flat[11], flat[15],
  );
  return m.elements;
}

/** Dựng scene từ danh sách prim đã chuẩn hoá. */
export function buildUsdScene(specs: UsdSpec[], options: UsdParseOptions = {}): UsdParseResult {
  const warnings: string[] = [];
  const dependencies: string[] = [];
  const root = new THREE.Group();
  root.name = options.name ?? 'UsdScene';

  const nodes = new Map<string, THREE.Object3D>();
  let meshCount = 0;

  const ordered = [...specs].sort((a, b) => {
    const depthDiff = a.path.split('/').length - b.path.split('/').length;
    return depthDiff !== 0 ? depthDiff : a.path.localeCompare(b.path);
  });

  for (const spec of ordered) {
    if (spec.path === '/') continue;
    const name = spec.path.split('/').pop() ?? spec.path;
    const parentPath = spec.path.slice(0, spec.path.lastIndexOf('/')) || '/';

    const node = new THREE.Group();
    node.name = name;
    node.userData.usdPath = spec.path;
    node.userData.specType = spec.specType;

    // ---- Transform ------------------------------------------------------
    const transformOrder = spec.fields['xformOpOrder'];
    const order: string[] = Array.isArray(transformOrder)
      ? (transformOrder as unknown[]).map((v) => String(v))
      : [];

    const matrixElements = readMatrix(spec.fields['xformOp:transform']);
    if (matrixElements) {
      node.applyMatrix4(new THREE.Matrix4().fromArray(matrixElements));
    } else {
      // Dựng transform từ các op riêng lẻ theo đúng thứ tự.
      const local = new THREE.Matrix4();
      let hasOp = false;
      for (const op of order) {
        if (op === 'xformOp:transform') {
          const m = readMatrix(spec.fields[op]);
          if (m) {
            local.multiply(new THREE.Matrix4().fromArray(m));
            hasOp = true;
          }
          continue;
        }
        if (op === 'xformOp:translate') {
          const t = flattenNumbers(spec.fields[op]);
          if (t.length >= 3) {
            local.multiply(new THREE.Matrix4().makeTranslation(t[0], t[1], t[2]));
            hasOp = true;
          }
          continue;
        }
        if (op === 'xformOp:scale') {
          const s = flattenNumbers(spec.fields[op]);
          if (s.length >= 3) {
            local.multiply(new THREE.Matrix4().makeScale(s[0], s[1], s[2]));
            hasOp = true;
          }
          continue;
        }
        if (op === 'xformOp:rotateXYZ' || op === 'xformOp:rotateXZY' || op === 'xformOp:rotateYXZ') {
          const r = flattenNumbers(spec.fields[op]);
          if (r.length >= 3) {
            const rad = (v: number) => THREE.MathUtils.degToRad(v);
            const euler = new THREE.Euler(rad(r[0]), rad(r[1]), rad(r[2]), op.slice('xformOp:rotate'.length) as THREE.EulerOrder);
            local.multiply(new THREE.Matrix4().makeRotationFromEuler(euler));
            hasOp = true;
          }
          continue;
        }
        if (op === 'xformOp:orient') {
          const q = flattenNumbers(spec.fields[op]);
          if (q.length >= 4) {
            local.multiply(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion(q[0], q[1], q[2], q[3])));
            hasOp = true;
          }
          continue;
        }
        warnings.push(`USD: chưa hỗ trợ phép biến đổi "${op}" — bỏ qua.`);
      }
      if (hasOp) node.applyMatrix4(local);
    }

    // ---- Hình học --------------------------------------------------------
    const points = flattenNumbers(spec.fields['points']);
    const faceVertexCounts = flattenNumbers(spec.fields['faceVertexCounts']);
    const faceVertexIndices = flattenNumbers(spec.fields['faceVertexIndices']);

    if (points.length >= 9 && faceVertexIndices.length >= 3) {
      const positionArray = new Float32Array(points);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

      // Dựng chỉ mục từ faceVertexCounts (số đỉnh mỗi mặt).
      const indices: number[] = [];
      let cursor = 0;
      for (const count of faceVertexCounts) {
        const n = Math.max(0, Math.round(count));
        for (let i = 1; i < n - 1; i++) {
          indices.push(
            Math.round(faceVertexIndices[cursor]),
            Math.round(faceVertexIndices[cursor + i]),
            Math.round(faceVertexIndices[cursor + i + 1]),
          );
        }
        cursor += n;
      }
      if (indices.length === 0) {
        // Không có faceVertexCounts — coi toàn bộ chỉ mục là tam giác.
        for (let i = 0; i + 2 < faceVertexIndices.length; i += 3) {
          indices.push(
            Math.round(faceVertexIndices[i]),
            Math.round(faceVertexIndices[i + 1]),
            Math.round(faceVertexIndices[i + 2]),
          );
        }
      }
      if (indices.length >= 3) geometry.setIndex(indices);

      // Normal
      const normals = flattenNumbers(spec.fields['normals']);
      if (normals.length === positionArray.length) {
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
      } else {
        geometry.computeVertexNormals();
      }

      // UV
      const uvs = flattenNumbers(spec.fields['primvars:st']);
      if (uvs.length === (positionArray.length / 3) * 2) {
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
      }

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      // Màu hiển thị
      const displayColor = flattenNumbers(spec.fields['primvars:displayColor']);
      const material = new THREE.MeshStandardMaterial();
      if (displayColor.length >= 3) {
        material.color = new THREE.Color(displayColor[0], displayColor[1], displayColor[2]);
      }
      const opacity = flattenNumbers(spec.fields['primvars:displayOpacity']);
      if (opacity.length >= 1) {
        material.opacity = opacity[0];
        material.transparent = opacity[0] < 1;
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${name}_mesh`;
      node.add(mesh);
      meshCount++;
    }

    // ---- Asset tham chiếu -------------------------------------------------
    for (const [key, value] of Object.entries(spec.fields)) {
      if (value && typeof value === 'object' && 'assetPath' in (value as Record<string, unknown>)) {
        const assetPath = String((value as { assetPath: unknown }).assetPath);
        if (assetPath) dependencies.push(assetPath);
      }
      if (key === 'material:binding') {
        const binding = value as { primPath?: string } | null;
        if (binding?.primPath) dependencies.push(binding.primPath);
      }
    }

    // ---- Gắn vào cây ------------------------------------------------------
    const parent = nodes.get(parentPath) ?? root;
    parent.add(node);
    nodes.set(spec.path, node);
  }

  return {
    scene: root,
    primCount: specs.length,
    meshCount,
    version: '1.0',
    warnings,
    dependencies,
  };
}

/**
 * Bóc tách USD từ byte — tự nhận diện crate nhị phân hay ASCII.
 */
export function parseUsd(bytes: Uint8Array, options: UsdParseOptions = {}): UsdParseResult {
  const magic = new TextDecoder('ascii').decode(bytes.subarray(0, Math.min(bytes.length, 8)));
  if (magic === USDC_MAGIC) {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const result = parseUsdc(buffer);
    const built = buildUsdScene(result.specs, options);
    return {
      ...built,
      version: result.version,
      warnings: [...result.warnings, ...built.warnings],
    };
  }

  // ASCII: banner "#usda" hoặc "#usd"
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  if (!/^\s*#usd/i.test(text)) {
    throw new Error('AssetParser: không phải tệp USD (thiếu banner "#usda"/"#usd" hoặc magic crate)');
  }
  const parsed = parseUsda(text);
  const built = buildUsdScene(parsed.specs, options);
  return {
    ...built,
    version: parsed.version,
    warnings: [...parsed.warnings, ...built.warnings],
    dependencies: [...built.dependencies, ...collectAssetDependencies(parsed.specs)],
  };
}

/** Thu thập đường dẫn asset từ thuộc tính USD. */
function collectAssetDependencies(specs: UsdSpec[]): string[] {
  const out: string[] = [];
  for (const spec of specs) {
    for (const value of Object.values(spec.fields)) {
      if (value && typeof value === 'object' && 'assetPath' in (value as Record<string, unknown>)) {
        const p = String((value as { assetPath: unknown }).assetPath);
        if (p) out.push(p);
      }
    }
  }
  return out;
}
