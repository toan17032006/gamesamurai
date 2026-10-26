/**
 * @file gltf-parser.ts
 * @module @aetheria/engine/asset-parser/gltf-parser
 * @description Parser glTF 2.0 / GLB tự viết — không phụ thuộc DOM hay loader của three.js.
 *
 * Vì sao tự viết:
 *  • `GLTFLoader` của three.js gọi `fetch`/`XHR` cho buffer và texture nên không
 *    chạy được ở môi trường headless (Node) — trong khi Engine cần bóc tách tài
 *    sản ở cả server lẫn trình duyệt;
 *  • parser tự viết cho quyền kiểm soát `dependencies` (buffer `.bin`, texture
 *    ngoài) và các trường bắt buộc mà Engine nạp vào.
 *
 * Hỗ trợ: GLB (container nhị phân) và `.gltf` (JSON), buffer nhúng bằng data
 * URI, accessor thưa (sparse), bufferView xen kẽ (byteStride), vật liệu PBR,
 * skin (xương), animation clip, node dạng TRS hoặc ma trận.
 */

import * as THREE from 'three';
import { decodeBase64 } from './base64.js';
import { readImageInfo, detectImageFormat } from './image-parser.js';
import type { ImageFormat } from './image-parser.js';

/** Mảng số dùng được cho accessor glTF. */
type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Uint32Array
  | Float32Array;

/** Constructor tương ứng với `TypedArray`. */
type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor;

// ---------------------------------------------------------------------------
// Kiểu dữ liệu glTF
// ---------------------------------------------------------------------------

interface GltfBuffer {
  uri?: string;
  byteLength: number;
  name?: string;
}

interface GltfBufferView {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: number;
}

interface GltfSparseIndices {
  bufferView: number;
  byteOffset?: number;
  componentType: number;
}

interface GltfSparseValues {
  bufferView: number;
  byteOffset?: number;
}

interface GltfSparse {
  count: number;
  indices: GltfSparseIndices;
  values: GltfSparseValues;
}

interface GltfAccessor {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  normalized?: boolean;
  count: number;
  type: string;
  min?: number[];
  max?: number[];
  sparse?: GltfSparse;
}

interface GltfPrimitive {
  attributes: Record<string, number>;
  indices?: number;
  material?: number;
  mode?: number;
}

interface GltfMesh {
  primitives: GltfPrimitive[];
  name?: string;
  weights?: number[];
}

interface GltfNode {
  children?: number[];
  mesh?: number;
  skin?: number;
  matrix?: number[];
  translation?: number[];
  rotation?: number[];
  scale?: number[];
  name?: string;
}

interface GltfTextureRef {
  index: number;
  texCoord?: number;
}

interface GltfMaterial {
  name?: string;
  pbrMetallicRoughness?: {
    baseColorFactor?: number[];
    baseColorTexture?: GltfTextureRef;
    metallicFactor?: number;
    roughnessFactor?: number;
    metallicRoughnessTexture?: GltfTextureRef;
  };
  normalTexture?: GltfTextureRef & { scale?: number };
  emissiveTexture?: GltfTextureRef;
  occlusionTexture?: GltfTextureRef;
  emissiveFactor?: number[];
  alphaMode?: string;
  alphaCutoff?: number;
  doubleSided?: boolean;
}

interface GltfSkin {
  joints: number[];
  inverseBindMatrices?: number;
  skeleton?: number;
  name?: string;
}

interface GltfAnimationSampler {
  input: number;
  output: number;
  interpolation?: string;
}

interface GltfAnimationChannel {
  sampler: number;
  target: { node?: number; path: string };
}

interface GltfAnimation {
  channels: GltfAnimationChannel[];
  samplers: GltfAnimationSampler[];
  name?: string;
}

interface GltfTexture {
  source?: number;
  sampler?: number;
  name?: string;
}

interface GltfImage {
  uri?: string;
  bufferView?: number;
  mimeType?: string;
  name?: string;
}

interface GltfSampler {
  magFilter?: number;
  minFilter?: number;
  wrapS?: number;
  wrapT?: number;
}

interface GltfDocument {
  asset?: { version?: string; generator?: string };
  scene?: number;
  scenes?: Array<{ nodes?: number[]; name?: string }>;
  nodes?: GltfNode[];
  meshes?: GltfMesh[];
  materials?: GltfMaterial[];
  accessors?: GltfAccessor[];
  bufferViews?: GltfBufferView[];
  buffers?: GltfBuffer[];
  skins?: GltfSkin[];
  animations?: GltfAnimation[];
  textures?: GltfTexture[];
  images?: GltfImage[];
  samplers?: GltfSampler[];
}

// ---------------------------------------------------------------------------
// Hằng số spec
// ---------------------------------------------------------------------------

/** Component type của glTF → mảng typed tương ứng. */
const COMPONENT_TYPES: Record<number, { ctor: TypedArrayConstructor; size: number }> = {
  5120: { ctor: Int8Array, size: 1 },
  5121: { ctor: Uint8Array, size: 1 },
  5122: { ctor: Int16Array, size: 2 },
  5123: { ctor: Uint16Array, size: 2 },
  5125: { ctor: Uint32Array, size: 4 },
  5126: { ctor: Float32Array, size: 4 },
};

/** Kiểu accessor → số thành phần. */
const TYPE_COMPONENTS: Record<string, number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

/** Chế độ vẽ primitive (glTF spec §3.7.2.1). */
const PRIMITIVE_MODES = new Set([0, 1, 2, 3, 4, 5, 6]);

/** Bộ giải mã ảnh nhúng — chỉ đọc được kích thước, không giải mã pixel. */
const EMBEDDED_IMAGE_MIME: Record<string, ImageFormat> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

// ---------------------------------------------------------------------------
// Kiểu trả về
// ---------------------------------------------------------------------------

export interface GltfParseOptions {
  /** Tên gốc của asset (dùng cho node gốc). */
  name?: string;
  /**
   * Nạp buffer ngoài (`.bin`) — trả về `undefined` nếu không nạp được.
   * Không có callback thì buffer ngoài bị bỏ qua và ghi vào `dependencies`.
   */
  loadExternal?: (uri: string) => Promise<Uint8Array | undefined>;
}

export interface GltfParseResult {
  /** Cảnh dựng từ cây node. */
  scene: THREE.Object3D;
  /** Animation clip (sampler/channel → track). */
  animations: THREE.AnimationClip[];
  /** Vật liệu theo tên (hoặc theo index dạng chuỗi). */
  materials: Record<string, THREE.Material>;
  /** Texture đã tạo (ảnh ngoài được ghi URI để nạp sau). */
  textures: THREE.Texture[];
  /** Tài nguyên ngoài phải nạp thêm (buffer `.bin`, texture). */
  dependencies: string[];
  /** Cảnh báo khi bóc tách (thiếu dữ liệu, giải mã giới hạn…). */
  warnings: string[];
  nodeCount: number;
  meshCount: number;
  triangleCount: number;
  skinCount: number;
  animationCount: number;
  /** Định dạng container đã đọc. */
  container: 'glb' | 'gltf';
}

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------

/** Đọc chữ ký GLB (magic 'glTF' = 0x46546C67). */
export function isGlb(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x67 &&
    bytes[1] === 0x6c &&
    bytes[2] === 0x54 &&
    bytes[3] === 0x46
  );
}

/** Tách container GLB thành JSON và chunk BIN. */
function readGlbContainer(
  bytes: Uint8Array,
  warnings: string[],
): { json: GltfDocument; bin?: Uint8Array } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(4, true);
  const declaredLength = view.getUint32(8, true);

  if (version !== 2) {
    warnings.push(`GLB: phiên bản container ${version} không được hỗ trợ (mong đợi 2).`);
  }
  if (declaredLength !== bytes.byteLength) {
    warnings.push(
      `GLB: kích thước khai báo ${declaredLength} khác kích thước thật ${bytes.byteLength}.`,
    );
  }

  let json: GltfDocument | undefined;
  let bin: Uint8Array | undefined;

  let offset = 12;
  while (offset + 8 <= bytes.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLength;
    if (dataEnd > bytes.byteLength) {
      warnings.push('GLB: chunk bị cắt cụt — bỏ qua phần dư.');
      break;
    }

    if (chunkType === 0x4e4f534a) {
      // 'JSON'
      const text = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd));
      try {
        json = JSON.parse(text) as GltfDocument;
      } catch (error) {
        throw new Error(`GLB: JSON chunk không hợp lệ — ${(error as Error).message}`);
      }
    } else if (chunkType === 0x004e4942) {
      // 'BIN\0'
      bin = bytes.subarray(dataStart, dataEnd);
    }

    offset = dataEnd;
  }

  if (!json) throw new Error('GLB: không tìm thấy JSON chunk.');
  return { json, bin };
}

/** Giải mã một URI data: base64. */
function decodeDataUri(uri: string): Uint8Array | undefined {
  const comma = uri.indexOf(',');
  if (comma < 0) return undefined;
  const header = uri.slice(0, comma);
  const payload = uri.slice(comma + 1);
  if (!header.includes(';base64')) return undefined;
  return decodeBase64(payload);
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Bóc tách một tài sản glTF 2.0 / GLB.
 *
 * @param bytes - nội dung tệp (GLB nhị phân hoặc JSON của `.gltf`)
 * @param options - tuỳ chọn nạp và tên gốc
 */
export async function parseGltf(
  bytes: Uint8Array,
  options: GltfParseOptions = {},
): Promise<GltfParseResult> {
  const warnings: string[] = [];
  const dependencies: string[] = [];
  /** Ghi phụ thuộc ngoài, không trùng lặp. */
  const addDependency = (uri: string): void => {
    if (!dependencies.includes(uri)) dependencies.push(uri);
  };

  // ---- 1. Tách container ------------------------------------------------
  let json: GltfDocument;
  let binChunk: Uint8Array | undefined;
  let container: 'glb' | 'gltf';

  if (isGlb(bytes)) {
    container = 'glb';
    const parsed = readGlbContainer(bytes, warnings);
    json = parsed.json;
    binChunk = parsed.bin;
  } else {
    container = 'gltf';
    const text = new TextDecoder().decode(bytes);
    try {
      json = JSON.parse(text) as GltfDocument;
    } catch (error) {
      throw new Error(`glTF: JSON không hợp lệ — ${(error as Error).message}`);
    }
  }

  if (json.asset?.version && !json.asset.version.startsWith('2')) {
    warnings.push(`glTF: phiên bản "${json.asset.version}" khác 2 — có thể thiếu trường.`);
  }

  // ---- 2. Nạp buffer ----------------------------------------------------
  const bufferData: Array<Uint8Array | undefined> = [];
  const buffers = json.buffers ?? [];

  for (let i = 0; i < buffers.length; i++) {
    const buffer = buffers[i];
    if (!buffer.uri) {
      // Không có URI → dữ liệu nằm ở chunk BIN của GLB.
      bufferData[i] = binChunk;
      if (!binChunk) warnings.push(`glTF: buffer ${i} không có URI nhưng tệp không có chunk BIN.`);
      continue;
    }

    const embedded = decodeDataUri(buffer.uri);
    if (embedded) {
      bufferData[i] = embedded;
      continue;
    }

    // Buffer ngoài — phải nạp riêng.
    addDependency(buffer.uri);
    if (options.loadExternal) {
      try {
        const loaded = await options.loadExternal(buffer.uri);
        if (loaded) bufferData[i] = loaded;
        else warnings.push(`glTF: không nạp được buffer ngoài "${buffer.uri}".`);
      } catch (error) {
        warnings.push(`glTF: lỗi khi nạp buffer "${buffer.uri}" — ${(error as Error).message}`);
      }
    } else {
      warnings.push(`glTF: buffer ngoài "${buffer.uri}" chưa được nạp.`);
    }
  }

  // ---- 3. Truy cập bufferView -------------------------------------------
  const bufferViews = json.bufferViews ?? [];

  const viewBytes = (viewIndex: number): Uint8Array | undefined => {
    const view = bufferViews[viewIndex];
    if (!view) return undefined;
    const buffer = bufferData[view.buffer];
    if (!buffer) return undefined;
    const start = (view.byteOffset ?? 0) + 0;
    const end = start + view.byteLength;
    if (end > buffer.byteLength) return undefined;
    return buffer.subarray(start, end);
  };

  // ---- 4. Đọc accessor ---------------------------------------------------
  interface AccessorData {
    values: TypedArray;
    componentType: number;
    components: number;
    count: number;
    normalized: boolean;
  }

  const readAccessor = (index: number): AccessorData | undefined => {
    const accessor = json.accessors?.[index];
    if (!accessor) return undefined;

    const spec = COMPONENT_TYPES[accessor.componentType];
    if (!spec) {
      warnings.push(`glTF: componentType ${accessor.componentType} không hỗ trợ (accessor ${index}).`);
      return undefined;
    }
    const components = TYPE_COMPONENTS[accessor.type] ?? 1;

    const values = new spec.ctor(accessor.count * components);

    const viewIndex = accessor.bufferView;
    const view = viewIndex !== undefined ? bufferViews[viewIndex] : undefined;
    if (viewIndex !== undefined && view) {
      const raw = viewBytes(viewIndex);
      if (!raw) {
        warnings.push(`glTF: bufferView ${viewIndex} không đọc được (accessor ${index}).`);
        return undefined;
      }

      const base = accessor.byteOffset ?? 0;
      const stride = view.byteStride ?? components * spec.size;

      if (stride === components * spec.size) {
        // Liên tục — có thể tạo view trực tiếp trên buffer.
        const src = new spec.ctor(raw.buffer as ArrayBuffer, raw.byteOffset + base, accessor.count * components);
        values.set(src);
      } else {
        // Xen kẽ — phải giải xen kẽ vào mảng liên tục.
        const src = new spec.ctor(raw.buffer as ArrayBuffer, raw.byteOffset);
        for (let i = 0; i < accessor.count; i++) {
          for (let c = 0; c < components; c++) {
            values[i * components + c] = src[base + i * stride + c * spec.size];
          }
        }
      }
    }

    // Accessor thưa (sparse) — ghi đè các phần tử được chỉ định.
    if (accessor.sparse) {
      const sparse = accessor.sparse;
      const indexSpec = COMPONENT_TYPES[sparse.indices.componentType];
      const indexRaw = viewBytes(sparse.indices.bufferView);
      const valueRaw = viewBytes(sparse.values.bufferView);
      if (indexSpec && indexRaw && valueRaw) {
        const indices = new indexSpec.ctor(
          indexRaw.buffer as ArrayBuffer,
          indexRaw.byteOffset + (sparse.indices.byteOffset ?? 0),
          sparse.count,
        );
        const valueOffset = sparse.values.byteOffset ?? 0;
        for (let i = 0; i < sparse.count; i++) {
          const target = indices[i];
          for (let c = 0; c < components; c++) {
            values[target * components + c] = valueRaw[valueOffset + i * components * spec.size + c * spec.size];
          }
        }
      } else {
        warnings.push(`glTF: accessor ${index} có dữ liệu sparse nhưng không đọc được.`);
      }
    }

    return {
      values,
      componentType: accessor.componentType,
      components,
      count: accessor.count,
      normalized: accessor.normalized === true,
    };
  };

  /** Chuyển accessor thành mảng float (dùng cho phép tính). */
  const readFloats = (index: number): Float32Array | undefined => {
    const data = readAccessor(index);
    if (!data) return undefined;
    const out = new Float32Array(data.count * data.components);
    const max = data.componentType === 5121 ? 255 : data.componentType === 5123 ? 65535 : 1;
    for (let i = 0; i < out.length; i++) {
      const raw = Number(data.values[i]);
      out[i] = data.normalized && data.componentType !== 5126 ? raw / max : raw;
    }
    return out;
  };

  // ---- 5. Texture & vật liệu --------------------------------------------
  const textures: THREE.Texture[] = [];
  const textureCache = new Map<number, THREE.Texture>();

  const buildTexture = (textureIndex: number): THREE.Texture | undefined => {
    if (textureCache.has(textureIndex)) return textureCache.get(textureIndex);
    const gltfTexture = json.textures?.[textureIndex];
    if (!gltfTexture) return undefined;

    const image = gltfTexture.source !== undefined ? json.images?.[gltfTexture.source] : undefined;
    if (!image) {
      warnings.push(`glTF: texture ${textureIndex} không có ảnh nguồn.`);
      return undefined;
    }

    const sampler = gltfTexture.sampler !== undefined ? json.samplers?.[gltfTexture.sampler] : undefined;
    const texture = new THREE.Texture();
    texture.name = image.name ?? gltfTexture.name ?? '';
    texture.wrapS = (sampler?.wrapS ?? THREE.RepeatWrapping) as THREE.Wrapping;
    texture.wrapT = (sampler?.wrapT ?? THREE.RepeatWrapping) as THREE.Wrapping;
    if (sampler?.magFilter === 9728) texture.magFilter = THREE.NearestFilter;
    if (sampler?.minFilter === 9728) texture.minFilter = THREE.NearestFilter;

    if (image.uri) {
      // Ảnh ngoài — ghi URI để pipeline nạp sau (trình duyệt tự tải được).
      const embedded = decodeDataUri(image.uri);
      if (embedded) {
        const info = readImageInfo(embedded, detectImageFormat(embedded) ?? 'png');
        texture.image = { src: image.uri, width: info?.width ?? 0, height: info?.height ?? 0 };
        warnings.push(
          `glTF: ảnh nhúng dạng data URI chưa được giải mã thành texture — cần nạp lại từ URI.`,
        );
      } else {
        texture.image = { src: image.uri };
        addDependency(image.uri);
      }
    } else if (image.bufferView !== undefined) {
      // Ảnh nhúng trong buffer — đọc được kích thước, chưa giải mã được pixel.
      const raw = viewBytes(image.bufferView);
      const format = EMBEDDED_IMAGE_MIME[image.mimeType ?? ''];
      if (raw && format) {
        const info = readImageInfo(raw, format);
        texture.image = { width: info?.width ?? 0, height: info?.height ?? 0 };
        warnings.push(
          `glTF: ảnh nhúng (${image.mimeType}) chưa được giải mã thành texture — chỉ giữ kích thước.`,
        );
      } else {
        texture.image = { width: 0, height: 0 };
        warnings.push(`glTF: ảnh nhúng không đọc được kích thước.`);
      }
    }

    textureCache.set(textureIndex, texture);
    textures.push(texture);
    return texture;
  };

  const materials: Record<string, THREE.Material> = {};
  const materialList: THREE.Material[] = [];

  const buildMaterial = (materialIndex: number): THREE.Material | undefined => {
    const gltfMaterial = json.materials?.[materialIndex];
    if (!gltfMaterial) return undefined;

    const pbr = gltfMaterial.pbrMetallicRoughness ?? {};
    const baseColor = pbr.baseColorFactor ?? [1, 1, 1, 1];

    const material = new THREE.MeshStandardMaterial({
      name: gltfMaterial.name ?? `Material_${materialIndex}`,
      color: new THREE.Color(baseColor[0] ?? 1, baseColor[1] ?? 1, baseColor[2] ?? 1),
      metalness: pbr.metallicFactor ?? 1,
      roughness: pbr.roughnessFactor ?? 1,
      opacity: baseColor[3] ?? 1,
      transparent: gltfMaterial.alphaMode === 'BLEND' || (baseColor[3] ?? 1) < 1,
      side: gltfMaterial.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    });

    if (gltfMaterial.emissiveFactor) {
      material.emissive = new THREE.Color(
        gltfMaterial.emissiveFactor[0] ?? 0,
        gltfMaterial.emissiveFactor[1] ?? 0,
        gltfMaterial.emissiveFactor[2] ?? 0,
      );
    }

    const baseColorTexture = pbr.baseColorTexture ? buildTexture(pbr.baseColorTexture.index) : undefined;
    if (baseColorTexture) material.map = baseColorTexture;

    const normalTexture = gltfMaterial.normalTexture ? buildTexture(gltfMaterial.normalTexture.index) : undefined;
    if (normalTexture) material.normalMap = normalTexture;

    const emissiveTexture = gltfMaterial.emissiveTexture ? buildTexture(gltfMaterial.emissiveTexture.index) : undefined;
    if (emissiveTexture) material.emissiveMap = emissiveTexture;

    const occlusionTexture = gltfMaterial.occlusionTexture ? buildTexture(gltfMaterial.occlusionTexture.index) : undefined;
    if (occlusionTexture) material.aoMap = occlusionTexture;

    material.name = gltfMaterial.name ?? `Material_${materialIndex}`;
    materials[material.name] = material;
    materialList.push(material);
    return material;
  };

  // ---- 6. Dựng hình học --------------------------------------------------
  const buildGeometry = (primitive: GltfPrimitive): THREE.BufferGeometry | undefined => {
    const mode = primitive.mode ?? 4;
    if (!PRIMITIVE_MODES.has(mode)) {
      warnings.push(`glTF: chế độ primitive ${mode} không hỗ trợ — bỏ qua.`);
      return undefined;
    }

    const geometry = new THREE.BufferGeometry();

    const position = readAccessor(primitive.attributes.POSITION);
    if (!position) {
      warnings.push('glTF: primitive thiếu accessor POSITION — bỏ qua.');
      return undefined;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(position.values as Float32Array, 3));

    const normal = readAccessor(primitive.attributes.NORMAL);
    if (normal) geometry.setAttribute('normal', new THREE.BufferAttribute(normal.values as Float32Array, 3));

    const tangent = readAccessor(primitive.attributes.TANGENT);
    if (tangent) geometry.setAttribute('tangent', new THREE.BufferAttribute(tangent.values as Float32Array, 4));

    const uv = readAccessor(primitive.attributes.TEXCOORD_0);
    if (uv) geometry.setAttribute('uv', new THREE.BufferAttribute(uv.values as Float32Array, 2));

    const uv2 = readAccessor(primitive.attributes.TEXCOORD_1);
    if (uv2) geometry.setAttribute('uv2', new THREE.BufferAttribute(uv2.values as Float32Array, 2));

    const color = readAccessor(primitive.attributes.COLOR_0);
    if (color) {
      geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(color.values as Float32Array, color.components, color.normalized),
      );
    }

    const joints = readAccessor(primitive.attributes.JOINTS_0);
    if (joints) geometry.setAttribute('skinIndex', new THREE.BufferAttribute(joints.values as Uint16Array, 4));

    const weights = readAccessor(primitive.attributes.WEIGHTS_0);
    if (weights) geometry.setAttribute('skinWeight', new THREE.BufferAttribute(weights.values as Float32Array, 4));

    if (primitive.indices !== undefined) {
      const indices = readAccessor(primitive.indices);
      if (indices) {
        geometry.setIndex(new THREE.BufferAttribute(indices.values as Uint32Array, 1));
      }
    }

    const accessorSpec = json.accessors?.[primitive.attributes.POSITION];
    if (accessorSpec?.min && accessorSpec?.max) {
      geometry.boundingBox = new THREE.Box3(
        new THREE.Vector3(accessorSpec.min[0], accessorSpec.min[1], accessorSpec.min[2]),
        new THREE.Vector3(accessorSpec.max[0], accessorSpec.max[1], accessorSpec.max[2]),
      );
    }
    geometry.computeBoundingSphere();

    return geometry;
  };

  // ---- 7. Dựng cây node --------------------------------------------------
  const nodeDefinitions = json.nodes ?? [];
  const jointNodeIndices = new Set<number>();
  for (const skin of json.skins ?? []) {
    for (const joint of skin.joints) jointNodeIndices.add(joint);
  }

  const root = new THREE.Group();
  root.name = options.name ?? 'gltf-root';

  const nodeObjects: THREE.Object3D[] = [];

  const buildNode = (nodeIndex: number): THREE.Object3D => {
    const definition = nodeDefinitions[nodeIndex];
    const isJoint = jointNodeIndices.has(nodeIndex);
    const object: THREE.Object3D = isJoint ? new THREE.Bone() : new THREE.Object3D();
    object.name = definition?.name ?? `node_${nodeIndex}`;

    if (definition?.matrix) {
      // Ma trận glTF là cột chính (column-major) — khớp với THREE.Matrix4.
      const matrix = new THREE.Matrix4();
      matrix.fromArray(definition.matrix);
      matrix.decompose(object.position, object.quaternion, object.scale);
    } else {
      if (definition?.translation) {
        object.position.fromArray(definition.translation);
      }
      if (definition?.rotation) {
        object.quaternion.fromArray(definition.rotation);
      }
      if (definition?.scale) {
        object.scale.fromArray(definition.scale);
      }
    }

    const meshDefinition = definition?.mesh !== undefined ? json.meshes?.[definition.mesh] : undefined;
    if (meshDefinition) {
      const geometry = buildGeometry(meshDefinition.primitives[0]);
      if (geometry) {
        const material =
          meshDefinition.primitives[0].material !== undefined
            ? buildMaterial(meshDefinition.primitives[0].material)
            : undefined;
        const mesh = new THREE.Mesh(geometry, material ?? new THREE.MeshStandardMaterial());
        mesh.name = meshDefinition.name ?? object.name;
        object.add(mesh);
      }
    }

    nodeObjects[nodeIndex] = object;
    return object;
  };

  const sceneRoots: THREE.Object3D[] = [];
  const sceneIndex = json.scene ?? 0;
  const sceneDefinition = json.scenes?.[sceneIndex] ?? json.scenes?.[0];

  const buildSubtree = (nodeIndex: number, parent: THREE.Object3D): void => {
    const object = buildNode(nodeIndex);
    parent.add(object);
    const definition = nodeDefinitions[nodeIndex];
    for (const childIndex of definition?.children ?? []) {
      buildSubtree(childIndex, object);
    }
  };

  if (sceneDefinition?.nodes?.length) {
    for (const nodeIndex of sceneDefinition.nodes) {
      const object = buildNode(nodeIndex);
      root.add(object);
      sceneRoots.push(object);
      const definition = nodeDefinitions[nodeIndex];
      for (const childIndex of definition?.children ?? []) {
        buildSubtree(childIndex, object);
      }
    }
  } else {
    // Không có `scenes` — dựng mọi node gốc (không phải con của node nào).
    const isChild = new Set<number>();
    for (const definition of nodeDefinitions) {
      for (const childIndex of definition.children ?? []) isChild.add(childIndex);
    }
    for (let i = 0; i < nodeDefinitions.length; i++) {
      if (isChild.has(i)) continue;
      const object = buildNode(i);
      root.add(object);
      sceneRoots.push(object);
      for (const childIndex of nodeDefinitions[i].children ?? []) {
        buildSubtree(childIndex, object);
      }
    }
  }

  // ---- 8. Skin (xương) ---------------------------------------------------
  const skins = json.skins ?? [];
  let skinCount = 0;

  for (let skinIndex = 0; skinIndex < skins.length; skinIndex++) {
    const skin = skins[skinIndex];
    const jointObjects = skin.joints
      .map((jointIndex) => nodeObjects[jointIndex])
      .filter((object): object is THREE.Bone => object instanceof THREE.Bone);
    if (jointObjects.length === 0) continue;

    const boneInverses: THREE.Matrix4[] = [];
    if (skin.inverseBindMatrices !== undefined) {
      const matrices = readFloats(skin.inverseBindMatrices);
      if (matrices) {
        for (let i = 0; i + 16 <= matrices.length; i += 16) {
          boneInverses.push(new THREE.Matrix4().fromArray(matrices.subarray(i, i + 16)));
        }
      }
    }
    while (boneInverses.length < jointObjects.length) {
      boneInverses.push(new THREE.Matrix4());
    }

    const skeleton = new THREE.Skeleton(jointObjects, boneInverses);

    // Gắn skeleton vào các mesh có thuộc tính skin của skin này.
    for (let nodeIndex = 0; nodeIndex < nodeDefinitions.length; nodeIndex++) {
      if (nodeDefinitions[nodeIndex].skin !== skinIndex) continue;
      const object = nodeObjects[nodeIndex];
      if (!object) continue;

      // Gom mesh trước rồi mới thay — tránh sửa cây trong lúc đang duyệt.
      const targets: THREE.Mesh[] = [];
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.geometry.getAttribute('skinIndex')) targets.push(mesh);
      });

      for (const mesh of targets) {
        const skinned = new THREE.SkinnedMesh(mesh.geometry, mesh.material);
        skinned.name = mesh.name;
        skinned.position.copy(mesh.position);
        skinned.quaternion.copy(mesh.quaternion);
        skinned.scale.copy(mesh.scale);
        mesh.parent?.add(skinned);
        mesh.parent?.remove(mesh);
        skinned.bind(skeleton);
      }
    }
    skinCount++;
  }

  // ---- 9. Animation ------------------------------------------------------
  const animations: THREE.AnimationClip[] = [];

  for (const animation of json.animations ?? []) {
    const tracks: THREE.KeyframeTrack[] = [];

    for (const channel of animation.channels ?? []) {
      const sampler = animation.samplers?.[channel.sampler];
      if (!sampler) continue;
      const nodeIndex = channel.target?.node;
      if (nodeIndex === undefined) continue;

      const nodeDefinition = nodeDefinitions[nodeIndex];
      const nodeName = nodeDefinition?.name ?? `node_${nodeIndex}`;
      // Track của xương dùng đúng tên bone: three tự tra `root.skeleton.getBoneByName(nodeName)`
      // khi binding, nên không cần thuộc tính `bones` thủ công.

      const times = readFloats(sampler.input);
      const values = readFloats(sampler.output);
      if (!times || !values) {
        warnings.push(`glTF: animation "${animation.name ?? ''}" có kênh thiếu dữ liệu.`);
        continue;
      }

      const path = channel.target.path;
      if (path === 'translation' || path === 'scale') {
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${nodeName}.${path}`,
            Array.from(times),
            Array.from(values),
          ),
        );
      } else if (path === 'rotation') {
        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            `${nodeName}.quaternion`,
            Array.from(times),
            Array.from(values),
          ),
        );
      } else if (path === 'weights') {
        warnings.push(
          `glTF: animation "${animation.name ?? ''}" dùng morph weights — chưa hỗ trợ trong bản bóc tách này.`,
        );
      }
    }

    if (tracks.length > 0) {
      const clip = new THREE.AnimationClip(animation.name ?? 'animation', -1, tracks);
      animations.push(clip);
    }
  }

  // ---- 10. Phụ thuộc ảnh ngoài --------------------------------------------
  // Mọi ảnh trong tài liệu đều là phụ thuộc của tệp — kể cả ảnh không mesh
  // nào dùng tới, vì pipeline vẫn phải nạp chúng nếu muốn tài sản đầy đủ.
  for (const image of json.images ?? []) {
    if (!image.uri) continue;
    if (decodeDataUri(image.uri)) continue; // ảnh nhúng — không phải tệp ngoài.
    addDependency(image.uri);
  }

  // ---- 11. Thống kê ------------------------------------------------------
  let triangleCount = 0;
  let meshCount = 0;
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshCount++;
    const index = mesh.geometry.getIndex();
    if (index) triangleCount += index.count / 3;
    else triangleCount += mesh.geometry.getAttribute('position')?.count / 3 || 0;
  });

  root.updateMatrixWorld(true);

  return {
    scene: root,
    animations,
    materials,
    textures,
    dependencies,
    warnings,
    nodeCount: nodeDefinitions.length,
    meshCount,
    triangleCount,
    skinCount,
    animationCount: animations.length,
    container,
  };
}
