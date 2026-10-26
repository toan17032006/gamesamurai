/**
 * @file collada-parser.ts
 * @module @aetheria/engine/asset-parser/collada-parser
 * @description Parser Collada (`.dae`) tự viết — chạy được cả headless.
 *
 * `ColladaLoader` của three.js cần `DOMParser` nên không chạy được ở Node.
 * Parser này đọc trực tiếp XML bằng `xml-lite` nên dùng được ở cả server lẫn
 * trình duyệt.
 *
 * Hỗ trợ: `library_geometries` (source/vertices/triangles/polylist/polygons),
 * `library_visual_scenes` (node + matrix/translate/rotate/scale),
 * `library_materials` + `library_effects` (màu diffuse cơ bản),
 * `instance_geometry` với `bind_material`.
 */

import * as THREE from 'three';
import { parseXml, findChild, findChildren, findDescendant } from './xml-lite.js';
import type { XmlNode } from './xml-lite.js';

// ---------------------------------------------------------------------------
// Kiểu trả về
// ---------------------------------------------------------------------------

export interface ColladaParseOptions {
  /** Tên gốc của asset. */
  name?: string;
}

export interface ColladaParseResult {
  /** Cảnh dựng từ cây node. */
  scene: THREE.Object3D;
  /** Vật liệu theo id. */
  materials: Record<string, THREE.Material>;
  /** Tệp ngoài được tham chiếu (texture). */
  dependencies: string[];
  /** Cảnh báo khi bóc tách. */
  warnings: string[];
  nodeCount: number;
  meshCount: number;
  triangleCount: number;
}

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------

/** Đọc danh sách số trong nội dung văn bản của một phần tử. */
function readNumbers(node: XmlNode | undefined): number[] {
  if (!node) return [];
  const values: number[] = [];
  for (const token of node.text.split(/\s+/)) {
    if (token.length === 0) continue;
    const value = Number(token);
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}

/** Đọc danh số số nguyên từ chuỗi (dùng cho `<p>` và `<vcount>`). */
function readIntList(text: string): number[] {
  const values: number[] = [];
  for (const token of text.split(/\s+/)) {
    if (token.length === 0) continue;
    const value = Number.parseInt(token, 10);
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}

/** Chuyển `#id` thành `id`. */
function refId(url: string | undefined): string {
  if (!url) return '';
  return url.startsWith('#') ? url.slice(1) : url;
}

/** Tích luỹ ma trận 4x4 theo thứ tự Collada (column-major). */
function applyTransform(object: THREE.Object3D, node: XmlNode): void {
  const matrixNode = findChild(node, 'matrix');
  if (matrixNode) {
    const values = readNumbers(matrixNode);
    if (values.length >= 16) {
      const matrix = new THREE.Matrix4().fromArray(values);
      matrix.decompose(object.position, object.quaternion, object.scale);
    }
    return;
  }

  const translateNode = findChild(node, 'translate');
  if (translateNode) {
    const values = readNumbers(translateNode);
    if (values.length >= 3) object.position.set(values[0], values[1], values[2]);
  }

  const scaleNode = findChild(node, 'scale');
  if (scaleNode) {
    const values = readNumbers(scaleNode);
    if (values.length >= 3) object.scale.set(values[0], values[1], values[2]);
  }

  // `rotate` là chuỗi nhiều phép quay — nhân dồn theo thứ tự khai báo.
  for (const rotateNode of findChildren(node, 'rotate')) {
    const values = readNumbers(rotateNode);
    if (values.length < 4) continue;
    const [x, y, z, angle] = values;
    const axis = new THREE.Vector3(x, y, z);
    if (axis.lengthSq() < 1e-12) continue;
    axis.normalize();
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      axis,
      THREE.MathUtils.degToRad(angle),
    );
    object.quaternion.premultiply(quaternion);
  }
}

/** Đọc nguồn dữ liệu (`<source>`) — mảng số + accessor. */
interface ColladaSource {
  values: number[];
  count: number;
  stride: number;
  offset: number;
}

function readSource(node: XmlNode): ColladaSource | undefined {
  const floatArray = findChild(node, 'float_array');
  const values = readNumbers(floatArray);
  if (values.length === 0) return undefined;

  const accessor = findDescendant(node, 'accessor');
  const count = accessor ? Number.parseInt(accessor.attrs.count ?? '0', 10) : values.length;
  const stride = accessor ? Number.parseInt(accessor.attrs.stride ?? '3', 10) : 3;
  const offset = accessor ? Number.parseInt(accessor.attrs.offset ?? '0', 10) : 0;

  return {
    values,
    count: Number.isFinite(count) && count > 0 ? count : values.length / Math.max(1, stride),
    stride: Number.isFinite(stride) && stride > 0 ? stride : 3,
    offset: Number.isFinite(offset) ? offset : 0,
  };
}

/** Tìm `source` theo id trong toàn bộ tài liệu. */
function findSourceById(sources: Map<string, ColladaSource>, id: string): ColladaSource | undefined {
  return sources.get(id);
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Bóc tách tài sản Collada (`.dae`).
 *
 * @param bytes - nội dung tệp `.dae` (UTF-8)
 * @param options - tuỳ chọn tên gốc
 */
export function parseCollada(
  bytes: Uint8Array,
  options: ColladaParseOptions = {},
): ColladaParseResult {
  const warnings: string[] = [];
  const dependencies: string[] = [];

  const text = new TextDecoder().decode(bytes);
  const document = parseXml(text);
  const collada = findChild(document, 'COLLADA');
  if (!collada) {
    throw new Error('Collada: không tìm thấy phần tử gốc <COLLADA>.');
  }

  // ---- 1. Vật liệu -------------------------------------------------------
  const materials: Record<string, THREE.Material> = {};

  // Hiệu ứng → màu diffuse / độ nhám / độ kim loại.
  const effectColors = new Map<string, { color: THREE.Color; roughness: number; metalness: number }>();

  const effects = findDescendant(collada, 'library_effects');
  for (const effect of effects ? findChildren(effects, 'effect') : []) {
    const effectId = effect.attrs.id ?? '';
    const color = new THREE.Color(0.8, 0.8, 0.8);
    let roughness = 0.6;
    let metalness = 0.1;

    const colorNode = findDescendant(effect, 'color');
    if (colorNode) {
      const values = readNumbers(colorNode);
      if (values.length >= 3) color.setRGB(values[0], values[1], values[2]);
    }
    const roughnessNode = findDescendant(effect, 'roughness');
    if (roughnessNode) {
      const values = readNumbers(roughnessNode);
      if (values.length >= 1) roughness = values[0];
    }
    const metallicNode = findDescendant(effect, 'metallic');
    if (metallicNode) {
      const values = readNumbers(metallicNode);
      if (values.length >= 1) metalness = values[0];
    }

    effectColors.set(effectId, { color, roughness, metalness });
  }

  const materialLibrary = findDescendant(collada, 'library_materials');
  for (const materialNode of materialLibrary ? findChildren(materialLibrary, 'material') : []) {
    const materialId = materialNode.attrs.id ?? `material_${Object.keys(materials).length}`;
    const instanceEffect = findChild(materialNode, 'instance_effect');
    const effectId = refId(instanceEffect?.attrs.url);
    const effect = effectColors.get(effectId);

    const material = new THREE.MeshStandardMaterial({
      name: materialNode.attrs.name ?? materialId,
      color: effect?.color ?? new THREE.Color(0.8, 0.8, 0.8),
      roughness: effect?.roughness ?? 0.6,
      metalness: effect?.metalness ?? 0.1,
    });
    materials[materialId] = material;
  }

  // ---- 2. Hình học -------------------------------------------------------
  const sources = new Map<string, ColladaSource>();
  const geometries = new Map<string, XmlNode>();

  const geometryLibrary = findDescendant(collada, 'library_geometries');
  for (const geometryNode of geometryLibrary ? findChildren(geometryLibrary, 'geometry') : []) {
    const geometryId = geometryNode.attrs.id ?? '';
    geometries.set(geometryId, geometryNode);

    const mesh = findChild(geometryNode, 'mesh');
    if (!mesh) continue;
    for (const sourceNode of findChildren(mesh, 'source')) {
      const sourceId = sourceNode.attrs.id ?? '';
      const source = readSource(sourceNode);
      if (source) sources.set(sourceId, source);
    }
  }

  /** Dựng BufferGeometry từ một `<mesh>` trong geometry. */
  const buildGeometry = (geometryId: string): THREE.BufferGeometry | undefined => {
    const geometryNode = geometries.get(geometryId);
    if (!geometryNode) return undefined;
    const mesh = findChild(geometryNode, 'mesh');
    if (!mesh) return undefined;

    // `<vertices>` ánh xạ semantic POSITION sang một `<source>`.
    const verticesNode = findChild(mesh, 'vertices');
    const vertexInput = verticesNode ? findChild(verticesNode, 'input') : undefined;
    const positionSourceId = refId(vertexInput?.attrs.source);
    const positionSource = findSourceById(sources, positionSourceId);
    if (!positionSource) {
      warnings.push(`Collada: geometry "${geometryId}" không tìm thấy nguồn vị trí.`);
      return undefined;
    }

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (const primitive of [...findChildren(mesh, 'triangles'), ...findChildren(mesh, 'polylist'), ...findChildren(mesh, 'polygons')]) {
      const inputs = findChildren(primitive, 'input');
      const vertexInputIndex = inputs.findIndex((input) => input.attrs.semantic === 'VERTEX');
      const vertexOffset = Number.parseInt(inputs[vertexInputIndex]?.attrs.offset ?? '0', 10) || 0;

      // Nguồn phụ (NORMAL, TEXCOORD) gắn theo offset.
      const normalSourceId = refId(inputs.find((input) => input.attrs.semantic === 'NORMAL')?.attrs.source);
      const uvSourceId = refId(inputs.find((input) => input.attrs.semantic === 'TEXCOORD')?.attrs.source);
      const normalSource = findSourceById(sources, normalSourceId);
      const uvSource = findSourceById(sources, uvSourceId);

      const pNode = findChild(primitive, 'p');
      const pValues = readIntList(pNode?.text ?? '');
      const vcountNode = findChild(primitive, 'vcount');
      const vcounts = vcountNode ? readIntList(vcountNode.text) : [];

      // `polylist`/`polygons` có thể chia thành nhiều mặt — `vcount` cho biết
      // số đỉnh của từng mặt; `triangles` thì mỗi 3 đỉnh là một mặt.
      const faces: number[][] = [];
      if (vcounts.length > 0) {
        let cursor = 0;
        for (const count of vcounts) {
          faces.push(pValues.slice(cursor, cursor + count));
          cursor += count;
        }
      } else {
        const perFace = primitive.name.toLowerCase() === 'triangles' ? 3 : pValues.length;
        for (let i = 0; i + perFace <= pValues.length; i += perFace) {
          faces.push(pValues.slice(i, i + perFace));
        }
      }

      for (const face of faces) {
        if (face.length < 3) continue;
        // Fan-triangulate mặt n-gon.
        for (let i = 1; i + 1 < face.length; i++) {
          const triangle = [face[0], face[i], face[i + 1]];
          for (const raw of triangle) {
            const vertexOffsetInStream = raw - vertexOffset;
            const sourceIndex = Math.floor(vertexOffsetInStream / Math.max(1, inputs.length));
            const local = vertexOffsetInStream - sourceIndex * Math.max(1, inputs.length);

            const px = positionSource.values[sourceIndex * positionSource.stride];
            const py = positionSource.values[sourceIndex * positionSource.stride + 1];
            const pz = positionSource.values[sourceIndex * positionSource.stride + 2];
            if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(pz)) continue;

            positions.push(px, py, pz);

            if (normalSource) {
              const n = normalSource.values[local * normalSource.stride];
              const n2 = normalSource.values[local * normalSource.stride + 1];
              const n3 = normalSource.values[local * normalSource.stride + 2];
              if (Number.isFinite(n) && Number.isFinite(n2) && Number.isFinite(n3)) {
                normals.push(n, n2, n3);
              }
            }

            if (uvSource) {
              const u = uvSource.values[local * uvSource.stride];
              const v = uvSource.values[local * uvSource.stride + 1];
              if (Number.isFinite(u) && Number.isFinite(v)) uvs.push(u, v);
            }

            indices.push(indices.length);
          }
        }
      }
    }

    if (positions.length === 0) return undefined;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (normals.length === positions.length) {
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    }
    if (uvs.length === (positions.length / 3) * 2) {
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
  };

  // ---- 3. Cây cảnh -------------------------------------------------------
  const root = new THREE.Group();
  root.name = options.name ?? 'collada-root';

  const visualScenes = findDescendant(collada, 'library_visual_scenes');
  const sceneNodes = visualScenes ? findChildren(visualScenes, 'visual_scene') : [];

  let nodeCount = 0;
  let meshCount = 0;
  let triangleCount = 0;

  /** Dựng một `<node>` và các con. */
  const buildNode = (node: XmlNode, parent: THREE.Object3D): void => {
    nodeCount++;

    const object = new THREE.Object3D();
    object.name = node.attrs.name ?? node.attrs.id ?? `node_${nodeCount}`;
    applyTransform(object, node);
    parent.add(object);

    // `<instance_geometry>` — gắn hình học và vật liệu.
    for (const instance of findChildren(node, 'instance_geometry')) {
      const geometryId = refId(instance.attrs.url);
      const geometry = buildGeometry(geometryId);
      if (!geometry) {
        warnings.push(`Collada: geometry "${geometryId}" không dựng được.`);
        continue;
      }

      // Vật liệu gắn theo `bind_material` (symbol → target).
      let material: THREE.Material | undefined;
      const bindMaterial = findDescendant(instance, 'bind_material');
      for (const instanceMaterial of bindMaterial ? findChildren(bindMaterial, 'instance_material') : []) {
        const symbol = instanceMaterial.attrs.symbol;
        const target = refId(instanceMaterial.attrs.target);
        const bound = target ? materials[target] : undefined;
        if (bound && (!symbol || symbol === 'material' || symbol === 'default')) {
          material = bound;
          break;
        }
      }
      if (!material) {
        // Không có bind → dùng vật liệu đầu tiên nếu chỉ có một.
        const all = Object.values(materials);
        material = all.length === 1 ? all[0] : new THREE.MeshStandardMaterial();
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = object.name;
      object.add(mesh);
      meshCount++;
      triangleCount += geometry.getIndex()!.count / 3;
    }

    for (const child of findChildren(node, 'node')) {
      buildNode(child, object);
    }
  };

  for (const visualScene of sceneNodes) {
    for (const node of findChildren(visualScene, 'node')) {
      buildNode(node, root);
    }
  }

  // Nếu không có `library_visual_scenes`, dựng trực tiếp từ `library_geometries`.
  if (meshCount === 0) {
    for (const [geometryId] of geometries) {
      const geometry = buildGeometry(geometryId);
      if (!geometry) continue;
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = geometryId;
      root.add(mesh);
      meshCount++;
      triangleCount += geometry.getIndex()!.count / 3;
      nodeCount++;
    }
    if (meshCount === 0) {
      warnings.push('Collada: không tìm thấy hình học nào để dựng.');
    }
  }

  // Texture nhúng trong hiệu ứng được ghi nhận là phụ thuộc ngoài.
  if (effects) {
    for (const effect of findChildren(effects, 'effect')) {
      for (const imageNode of findDescendant(effect, 'init_from') ? [findDescendant(effect, 'init_from')!] : []) {
        const texture = findChild(imageNode, 'texture');
        const file = texture?.attrs.file;
        if (file) dependencies.push(file);
      }
    }
  }

  root.updateMatrixWorld(true);

  return {
    scene: root,
    materials,
    dependencies,
    warnings,
    nodeCount,
    meshCount,
    triangleCount,
  };
}
