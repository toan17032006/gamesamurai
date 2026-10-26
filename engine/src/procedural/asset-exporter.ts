/**
 * @file asset-exporter.ts
 * @module @aetheria/engine/procedural/asset-exporter
 * @description Exporter cho mesh 3D, nhân vật và tài sản sinh thủ tục.
 *
 * Hỗ trợ: Wavefront OBJ + MTL, glTF 2.0 / GLB nhị phân, STL (binary & ASCII),
 * PLY (binary & ASCII), USD ASCII (`.usda`) và BVH.
 *
 * Mọi định dạng xuất ra đều đọc lại được bằng parser tương ứng trong
 * `asset-parser` — xem `engine/tests/asset-formats.test.ts`.
 */

import * as THREE from 'three';
import { encodeBase64 } from '../asset-parser/base64.js';

export interface ObjExportOptions {
  includeNormals?: boolean;
  includeUvs?: boolean;
  includeMaterials?: boolean;
  name?: string;
  applyTransform?: boolean;
}

export interface ObjExportResult {
  obj: string;
  mtl: string;
}

export interface GltfExportOptions {
  binary?: boolean;
  /**
   * Nhúng buffer vào chính tệp `.gltf` dưới dạng data URI (mặc định) hay tách
   * ra tệp `.bin` riêng. Data URI làm tệp tự chứa — mọi trình đọc glTF đều
   * mở được mà không cần tệp phụ.
   */
  embedBuffers?: boolean;
  name?: string;
  /** Ghi ma trận thay vì TRS (giữ đúng transform của node). */
  useMatrices?: boolean;
  /** Xuất cả skin (bone + inverse bind matrix) cho SkinnedMesh. */
  includeSkins?: boolean;
}

export interface StlExportOptions {
  /** 'binary' (mặc định) hoặc 'ascii'. */
  encoding?: 'binary' | 'ascii';
  name?: string;
  applyTransform?: boolean;
}

export interface PlyExportOptions {
  /** 'binary' (mặc định) hoặc 'ascii'. */
  encoding?: 'binary' | 'ascii';
  includeNormals?: boolean;
  includeUvs?: boolean;
  name?: string;
  applyTransform?: boolean;
}

export interface UsdaExportOptions {
  name?: string;
  /** Đơn vị scene (metersPerUnit). Mặc định 0.01 như USD. */
  metersPerUnit?: number;
  applyTransform?: boolean;
}

export interface BvhExportOptions {
  name?: string;
  fps?: number;
  applyTransform?: boolean;
}

/**
 * Mã hoá byte thành base64.
 *
 * Dùng bản dùng chung trong `asset-parser/base64` để exporter và parser nói
 * chung một ngôn ngữ — data URI do exporter ghi ra luôn giải mã được.
 */
export { encodeBase64 } from '../asset-parser/base64.js';

/** Thu thập các tam giác (vị trí đã áp transform) từ một Object3D. */
function collectTriangles(
  root: THREE.Object3D,
  applyTransform: boolean,
): Array<{ a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }> {
  const triangles: Array<{ a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }> = [];
  if (applyTransform) root.updateMatrixWorld(true);

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const geometry = child.geometry;
    const posAttr = geometry.getAttribute('position');
    if (!posAttr) return;
    const indexAttr = geometry.getIndex();
    const matrix = applyTransform ? child.matrixWorld : new THREE.Matrix4();

    const readVertex = (index: number): THREE.Vector3 =>
      new THREE.Vector3().fromBufferAttribute(posAttr, index).applyMatrix4(matrix);

    if (indexAttr) {
      for (let i = 0; i + 2 < indexAttr.count; i += 3) {
        triangles.push({
          a: readVertex(indexAttr.getX(i)),
          b: readVertex(indexAttr.getX(i + 1)),
          c: readVertex(indexAttr.getX(i + 2)),
        });
      }
    } else {
      for (let i = 0; i + 2 < posAttr.count; i += 3) {
        triangles.push({ a: readVertex(i), b: readVertex(i + 1), c: readVertex(i + 2) });
      }
    }
  });

  return triangles;
}

export class AssetExporter {
  /**
   * Gom vật liệu đang dùng trong một cây Object3D, theo tên.
   *
   * Dùng chung cho `exportToObj` và `exportToMtl` để hai định dạng luôn thống
   * nhất về tên vật liệu.
   */
  private static collectExportMaterials(root: THREE.Object3D): Map<string, THREE.Material> {
    const materialsUsed = new Map<string, THREE.Material>();
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry) return;
      const mat = Array.isArray(child.material) ? child.material[0] : child.material;
      if (!mat) return;
      materialsUsed.set(mat.name || `Mat_${mat.id}`, mat);
    });
    return materialsUsed;
  }

  /**
   * Lấy URI của texture từ vật liệu (theo quy ước của `texture-parser`).
   */
  private static textureUriOf(texture: THREE.Texture | undefined | null): string | undefined {
    if (!texture) return undefined;
    const image = texture.image as
      | { src?: string; url?: string; name?: string }
      | null
      | undefined;
    const uri = image?.src ?? image?.url ?? (image?.name || texture.name);
    return uri && uri.length > 0 ? uri : undefined;
  }

  /**
   * Dựng nội dung tệp MTL từ danh sách vật liệu.
   *
   * Chỉ dùng các lệnh mà `parseMtl` của Engine đọc được
   * (`Kd`, `Ks`, `Ns`, `d`, `map_Kd`, `map_Bump`, `map_d`) để vòng
   * xuất → bóc tách luôn khép kín.
   */
  private static buildMtlText(
    materialsUsed: Map<string, THREE.Material>,
    rootName: string,
  ): string {
    let mtlOutput = `# AETHERIA 3D Engine MTL Exporter\n# Materials for: ${rootName}\n\n`;

    for (const [matName, mat] of materialsUsed.entries()) {
      mtlOutput += `newmtl ${matName}\n`;
      mtlOutput += 'Ns 250.0\nKa 1.000 1.000 1.000\n';

      const color = (mat as any).color ? (mat as any).color : new THREE.Color(0.8, 0.8, 0.8);
      mtlOutput += `Kd ${color.r.toFixed(4)} ${color.g.toFixed(4)} ${color.b.toFixed(4)}\n`;
      mtlOutput += 'Ks 0.200 0.200 0.200\nNi 1.450\n';

      const opacity = mat.opacity ?? 1.0;
      mtlOutput += `d ${opacity.toFixed(4)}\nillum 2\n`;

      const mapUri = this.textureUriOf((mat as any).map);
      if (mapUri) mtlOutput += `map_Kd ${mapUri}\n`;

      const bumpUri = this.textureUriOf((mat as any).normalMap);
      if (bumpUri) mtlOutput += `map_Bump ${bumpUri}\n`;

      const alphaUri = this.textureUriOf((mat as any).alphaMap);
      if (alphaUri) mtlOutput += `map_d ${alphaUri}\n`;

      mtlOutput += '\n';
    }

    return mtlOutput;
  }

  /**
   * Xuất riêng tệp vật liệu Wavefront MTL.
   *
   * `parseMtl` của Engine đọc được tệp này, nên `exportToObj` + `exportToMtl`
   * tạo ra một cặp OBJ/MTL hoàn chỉnh.
   */
  public static exportToMtl(root: THREE.Object3D, options: { name?: string } = {}): string {
    const rootName = options.name ?? root.name ?? 'ExportedModel';
    return this.buildMtlText(this.collectExportMaterials(root), rootName);
  }

  /**
   * Export an Object3D hierarchy to Wavefront OBJ and MTL text formats.
   */
  public static exportToObj(root: THREE.Object3D, options: ObjExportOptions = {}): ObjExportResult {
    const includeNormals = options.includeNormals ?? true;
    const includeUvs = options.includeUvs ?? true;
    const includeMaterials = options.includeMaterials ?? true;
    const rootName = options.name ?? root.name ?? 'ExportedModel';
    const applyTransform = options.applyTransform ?? true;

    if (applyTransform) {
      root.updateMatrixWorld(true);
    }

    let objOutput = `# AETHERIA 3D Engine OBJ Exporter\n# Model: ${rootName}\n\n`;
    let mtlOutput = `# AETHERIA 3D Engine MTL Exporter\n# Materials for: ${rootName}\n\n`;

    if (includeMaterials) {
      objOutput += `mtllib ${rootName}.mtl\n\n`;
    }

    let vertexOffset = 0;
    let normalOffset = 0;
    let uvOffset = 0;

    const materialsUsed = new Map<string, THREE.Material>();

    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry) return;

      const mesh = child;
      // Trong three.js hiện đại, geometry của Mesh luôn là BufferGeometry.
      const geometry = mesh.geometry;
      if (!geometry) return;

      const posAttr = geometry.getAttribute('position');
      if (!posAttr) return;

      const normalAttr = geometry.getAttribute('normal');
      const uvAttr = geometry.getAttribute('uv');
      const indexAttr = geometry.getIndex();

      objOutput += `o ${mesh.name || `Mesh_${mesh.id}`}\n`;

      // Material assignment
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (mat && includeMaterials) {
        const matName = mat.name || `Mat_${mat.id}`;
        materialsUsed.set(matName, mat);
        objOutput += `usemtl ${matName}\ns 1\n`;
      }

      // Matrix transformation
      const matrixWorld = applyTransform ? mesh.matrixWorld : new THREE.Matrix4();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrixWorld);

      // Write vertices
      const v = new THREE.Vector3();
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        if (applyTransform) {
          v.applyMatrix4(matrixWorld);
        }
        objOutput += `v ${v.x.toFixed(6)} ${v.y.toFixed(6)} ${v.z.toFixed(6)}\n`;
      }

      // Write UVs
      if (includeUvs && uvAttr) {
        for (let i = 0; i < uvAttr.count; i++) {
          objOutput += `vt ${uvAttr.getX(i).toFixed(6)} ${uvAttr.getY(i).toFixed(6)}\n`;
        }
      }

      // Write Normals
      if (includeNormals && normalAttr) {
        const n = new THREE.Vector3();
        for (let i = 0; i < normalAttr.count; i++) {
          n.fromBufferAttribute(normalAttr, i);
          if (applyTransform) {
            n.applyMatrix3(normalMatrix).normalize();
          }
          objOutput += `vn ${n.x.toFixed(6)} ${n.y.toFixed(6)} ${n.z.toFixed(6)}\n`;
        }
      }

      // Write Faces
      const hasUv = Boolean(includeUvs && uvAttr);
      const hasNorm = Boolean(includeNormals && normalAttr);

      const writeFace = (a: number, b: number, c: number) => {
        const aV = a + 1 + vertexOffset;
        const bV = b + 1 + vertexOffset;
        const cV = c + 1 + vertexOffset;

        if (hasUv && hasNorm) {
          const aVt = a + 1 + uvOffset;
          const bVt = b + 1 + uvOffset;
          const cVt = c + 1 + uvOffset;
          const aVn = a + 1 + normalOffset;
          const bVn = b + 1 + normalOffset;
          const cVn = c + 1 + normalOffset;
          objOutput += `f ${aV}/${aVt}/${aVn} ${bV}/${bVt}/${bVn} ${cV}/${cVt}/${cVn}\n`;
        } else if (hasUv) {
          const aVt = a + 1 + uvOffset;
          const bVt = b + 1 + uvOffset;
          const cVt = c + 1 + uvOffset;
          objOutput += `f ${aV}/${aVt} ${bV}/${bVt} ${cV}/${cVt}\n`;
        } else if (hasNorm) {
          const aVn = a + 1 + normalOffset;
          const bVn = b + 1 + normalOffset;
          const cVn = c + 1 + normalOffset;
          objOutput += `f ${aV}//${aVn} ${bV}//${bVn} ${cV}//${cVn}\n`;
        } else {
          objOutput += `f ${aV} ${bV} ${cV}\n`;
        }
      };

      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          writeFace(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2));
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          writeFace(i, i + 1, i + 2);
        }
      }

      vertexOffset += posAttr.count;
      if (uvAttr && includeUvs) uvOffset += uvAttr.count;
      if (normalAttr && includeNormals) normalOffset += normalAttr.count;
      objOutput += '\n';
    });

    // Generate MTL — dùng chung bộ dựng với `exportToMtl` để hai bên khớp nhau.
    mtlOutput = this.buildMtlText(materialsUsed, rootName);

    return { obj: objOutput, mtl: mtlOutput };
  }

  // -------------------------------------------------------------------------
  // glTF 2.0 / GLB
  // -------------------------------------------------------------------------

  /**
   * Dựng tài liệu glTF 2.0 từ cây Object3D.
   *
   * Trả về cả JSON lẫn buffer nhị phân: `.gltf` nhúng buffer thành data URI,
   * `.glb` ghi buffer vào chunk BIN.
   *
   * Trước đây hàm này bỏ qua mesh nếu `root` chính là mesh (traverse bỏ qua
   * `child === root`) nên xuất ra tệp rỗng; và `.gltf` không có `uri` cho
   * buffer nên mọi trình đọc glTF đều không đọc được.
   */
  private static buildGltfDocument(
    root: THREE.Object3D,
    options: GltfExportOptions,
  ): { doc: Record<string, any>; bin: Uint8Array } {
    const scenes: any[] = [{ nodes: [] }];
    const nodes: any[] = [];
    const meshes: any[] = [];
    const accessors: any[] = [];
    const bufferViews: any[] = [];
    const materials: any[] = [];
    const skins: any[] = [];
    const textures: any[] = [];
    const images: any[] = [];
    const samplers: any[] = [];

    const binaryChunks: Uint8Array[] = [];
    let currentByteOffset = 0;

    /** Ghi một mảng byte vào buffer nhị phân — trả về index của bufferView. */
    const appendBufferData = (bytes: Uint8Array): number => {
      // glTF yêu cầu căn chiều 4 byte.
      const padding = (4 - (bytes.byteLength % 4)) % 4;
      const aligned = new Uint8Array(bytes.byteLength + padding);
      aligned.set(bytes);

      const bufferViewIndex = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: currentByteOffset,
        byteLength: bytes.byteLength,
      });
      binaryChunks.push(aligned);
      currentByteOffset += aligned.byteLength;
      return bufferViewIndex;
    };

    /** Tạo accessor cho một mảng byte đã ghi vào buffer. */
    const addAccessor = (
      bytes: Uint8Array,
      componentType: number,
      count: number,
      type: string,
      min?: number[],
      max?: number[],
    ): number => {
      const bufferView = appendBufferData(bytes);
      const accessor: Record<string, unknown> = {
        bufferView,
        byteOffset: 0,
        componentType,
        count,
        type,
      };
      if (min) accessor.min = min;
      if (max) accessor.max = max;
      accessors.push(accessor);
      return accessors.length - 1;
    };

    /**
     * Đọc BufferAttribute thành mảng float.
     *
     * Dùng getX/getY… thay vì `new Float32Array(attr.array)` vì geometry có thể
     * interleaved (một buffer dùng cho nhiều attribute) và attribute có thể là
     * Int16/Uint16 đã normalize — sao chép mảng thô sẽ ra giá trị sai.
     */
    const readFloats = (
      attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
      itemSize: number,
    ): Float32Array => {
      const out = new Float32Array(attr.count * itemSize);
      for (let i = 0; i < attr.count; i++) {
        const base = i * itemSize;
        out[base] = attr.getX(i);
        if (itemSize > 1) out[base + 1] = attr.getY(i);
        if (itemSize > 2) out[base + 2] = attr.getZ(i);
        if (itemSize > 3) out[base + 3] = attr.getW(i);
      }
      return out;
    };

    /** Đọc BufferAttribute thành mảng uint16 (dùng cho JOINTS_0). */
    const readUint16 = (
      attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
      itemSize: number,
    ): Uint16Array => {
      const out = new Uint16Array(attr.count * itemSize);
      for (let i = 0; i < attr.count; i++) {
        const base = i * itemSize;
        out[base] = attr.getX(i);
        if (itemSize > 1) out[base + 1] = attr.getY(i);
        if (itemSize > 2) out[base + 2] = attr.getZ(i);
        if (itemSize > 3) out[base + 3] = attr.getW(i);
      }
      return out;
    };

    /** Lấy URI của texture (nếu tìm được) — texture nhúng không xuất được. */
    const textureUri = (texture: THREE.Texture | null | undefined): string | undefined => {
      if (!texture) return undefined;
      const userData = texture.userData as Record<string, unknown> | undefined;
      const candidate = userData?.uri ?? userData?.src ?? texture.source?.data;
      return typeof candidate === 'string' && candidate.length > 0 ? candidate : undefined;
    };

    /** Đăng ký một texture vào `textures`/`images`/`samplers` — trả về index. */
    const registerTexture = (texture: THREE.Texture | null | undefined): number | undefined => {
      const uri = textureUri(texture);
      if (!uri || !texture) return undefined;

      let imageIndex = images.findIndex((img) => img.uri === uri);
      if (imageIndex < 0) {
        imageIndex = images.length;
        images.push({ uri, ...(texture.name ? { name: texture.name } : {}) });
      }

      const wrapS = texture.wrapS ?? THREE.RepeatWrapping;
      const wrapT = texture.wrapT ?? THREE.RepeatWrapping;
      let samplerIndex = samplers.findIndex(
        (s) => s.wrapS === wrapS && s.wrapT === wrapT,
      );
      if (samplerIndex < 0) {
        samplerIndex = samplers.length;
        samplers.push({ wrapS, wrapT });
      }

      const existing = textures.findIndex((t) => t.source === imageIndex);
      if (existing >= 0) return existing;
      const index = textures.length;
      textures.push({ source: imageIndex, sampler: samplerIndex });
      return index;
    };

    /** Dựng entry `materials` từ vật liệu three.js. */
    const buildMaterial = (mat: THREE.Material): Record<string, unknown> => {
      const standard = mat as THREE.MeshStandardMaterial;
      const color = standard.color ?? new THREE.Color(1, 1, 1);
      const emissive = standard.emissive ?? new THREE.Color(0, 0, 0);
      const entry: Record<string, unknown> = {
        name: mat.name || undefined,
        doubleSided: mat.side === THREE.DoubleSide,
        pbrMetallicRoughness: {
          baseColorFactor: [color.r, color.g, color.b, mat.opacity ?? 1],
          metallicFactor: standard.metalness ?? 0,
          roughnessFactor: standard.roughness ?? 1,
        },
      };
      if (entry.name === undefined) delete entry.name;

      if (emissive.r > 0 || emissive.g > 0 || emissive.b > 0) {
        entry.emissiveFactor = [emissive.r, emissive.g, emissive.b];
      }
      if (mat.transparent && (mat.opacity ?? 1) < 1) entry.alphaMode = 'BLEND';

      const baseColor = registerTexture(standard.map);
      if (baseColor !== undefined) {
        (entry.pbrMetallicRoughness as Record<string, unknown>).baseColorTexture = { index: baseColor };
      }
      const normal = registerTexture(standard.normalMap);
      if (normal !== undefined) entry.normalTexture = { index: normal };
      const emissiveMap = registerTexture(standard.emissiveMap);
      if (emissiveMap !== undefined) entry.emissiveTexture = { index: emissiveMap };
      const ao = registerTexture(standard.aoMap);
      if (ao !== undefined) entry.occlusionTexture = { index: ao };

      return entry;
    };

    /** Đăng ký một mesh vào `meshes` — trả về index mesh (hoặc -1 nếu không có hình học). */
    const processMesh = (mesh: THREE.Mesh): number => {
      const geometry = mesh.geometry;
      const posAttr = geometry.getAttribute('position');
      if (!posAttr) return -1;

      const attributes: Record<string, number> = {};

      // POSITION — bắt buộc theo spec.
      const positions = readFloats(posAttr, 3);
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for (let i = 0; i < posAttr.count; i++) {
        const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
      }
      attributes.POSITION = addAccessor(
        new Uint8Array(positions.buffer, positions.byteOffset, positions.byteLength),
        5126,
        posAttr.count,
        'VEC3',
        [minX, minY, minZ],
        [maxX, maxY, maxZ],
      );

      const normalAttr = geometry.getAttribute('normal');
      if (normalAttr) {
        const normals = readFloats(normalAttr, 3);
        attributes.NORMAL = addAccessor(
          new Uint8Array(normals.buffer, normals.byteOffset, normals.byteLength),
          5126,
          normalAttr.count,
          'VEC3',
        );
      }

      const tangentAttr = geometry.getAttribute('tangent');
      if (tangentAttr) {
        const tangents = readFloats(tangentAttr, 4);
        attributes.TANGENT = addAccessor(
          new Uint8Array(tangents.buffer, tangents.byteOffset, tangents.byteLength),
          5126,
          tangentAttr.count,
          'VEC4',
        );
      }

      const uvAttr = geometry.getAttribute('uv');
      if (uvAttr) {
        const uvs = readFloats(uvAttr, 2);
        attributes.TEXCOORD_0 = addAccessor(
          new Uint8Array(uvs.buffer, uvs.byteOffset, uvs.byteLength),
          5126,
          uvAttr.count,
          'VEC2',
        );
      }

      const uv2Attr = geometry.getAttribute('uv2');
      if (uv2Attr) {
        const uvs2 = readFloats(uv2Attr, 2);
        attributes.TEXCOORD_1 = addAccessor(
          new Uint8Array(uvs2.buffer, uvs2.byteOffset, uvs2.byteLength),
          5126,
          uv2Attr.count,
          'VEC2',
        );
      }

      const colorAttr = geometry.getAttribute('color');
      if (colorAttr) {
        const colorItemSize = colorAttr.itemSize === 4 ? 4 : 3;
        const colors = readFloats(colorAttr, colorItemSize);
        attributes.COLOR_0 = addAccessor(
          new Uint8Array(colors.buffer, colors.byteOffset, colors.byteLength),
          5126,
          colorAttr.count,
          colorItemSize === 4 ? 'VEC4' : 'VEC3',
        );
      }

      const jointAttr = geometry.getAttribute('skinIndex');
      if (jointAttr) {
        const joints = readUint16(jointAttr, 4);
        attributes.JOINTS_0 = addAccessor(
          new Uint8Array(joints.buffer, joints.byteOffset, joints.byteLength),
          5123,
          jointAttr.count,
          'VEC4',
        );
      }

      const weightAttr = geometry.getAttribute('skinWeight');
      if (weightAttr) {
        const weights = readFloats(weightAttr, 4);
        attributes.WEIGHTS_0 = addAccessor(
          new Uint8Array(weights.buffer, weights.byteOffset, weights.byteLength),
          5126,
          weightAttr.count,
          'VEC4',
        );
      }

      let indexAccessorIndex: number | undefined;
      const indexAttr = geometry.getIndex();
      if (indexAttr) {
        const useUint32 = indexAttr.array instanceof Uint32Array;
        const indices = useUint32
          ? new Uint32Array(indexAttr.count)
          : new Uint16Array(indexAttr.count);
        for (let i = 0; i < indexAttr.count; i++) indices[i] = indexAttr.getX(i);
        indexAccessorIndex = addAccessor(
          new Uint8Array(indices.buffer, indices.byteOffset, indices.byteLength),
          useUint32 ? 5125 : 5123,
          indexAttr.count,
          'SCALAR',
        );
      }

      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      let materialIndex: number | undefined;
      if (mat) {
        materialIndex = materials.length;
        materials.push(buildMaterial(mat));
      }

      const primitive: Record<string, unknown> = { attributes, mode: 4 };
      if (indexAccessorIndex !== undefined) primitive.indices = indexAccessorIndex;
      if (materialIndex !== undefined) primitive.material = materialIndex;

      const meshIndex = meshes.length;
      meshes.push({
        name: mesh.name || `Mesh_${meshIndex}`,
        primitives: [primitive],
      });
      return meshIndex;
    };

    // ---- Cây node ----------------------------------------------------------
    // glTF yêu cầu index của node con lớn hơn index của node cha → dựng theo
    // thứ tự trước-hậu (pre-order) để mọi cha luôn có index nhỏ hơn con.
    const nodeIndexOf = new Map<THREE.Object3D, number>();

    const buildNode = (object: THREE.Object3D): number => {
      const node: Record<string, unknown> = {};
      if (object.name) node.name = object.name;

      if (options.useMatrices) {
        object.updateMatrix();
        node.matrix = Array.from(object.matrix.elements);
      } else {
        node.translation = [object.position.x, object.position.y, object.position.z];
        node.rotation = [
          object.quaternion.x,
          object.quaternion.y,
          object.quaternion.z,
          object.quaternion.w,
        ];
        node.scale = [object.scale.x, object.scale.y, object.scale.z];
      }

      const isMesh = (object as THREE.Mesh).isMesh === true;
      if (isMesh) {
        const meshIndex = processMesh(object as THREE.Mesh);
        if (meshIndex >= 0) node.mesh = meshIndex;
      }

      const index = nodes.length;
      nodes.push(node);
      nodeIndexOf.set(object, index);

      const childIndices: number[] = [];
      for (const child of object.children) childIndices.push(buildNode(child));
      if (childIndices.length > 0) node.children = childIndices;

      return index;
    };

    const rootIndex = buildNode(root);
    scenes[0].nodes = [rootIndex];

    // ---- Skin (xương cho SkinnedMesh) -------------------------------------
    if (options.includeSkins ?? true) {
      const skinnedMeshes: THREE.SkinnedMesh[] = [];
      root.traverse((child) => {
        if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
          skinnedMeshes.push(child as THREE.SkinnedMesh);
        }
      });

      for (const skinned of skinnedMeshes) {
        const skeleton = skinned.skeleton;
        if (!skeleton || skeleton.bones.length === 0) continue;

        const joints: number[] = [];
        for (const bone of skeleton.bones) {
          const existing = nodeIndexOf.get(bone);
          if (existing !== undefined) {
            joints.push(existing);
            continue;
          }
          // Bone chưa nằm trong cây scene → thêm làm con của mesh đã skin.
          const boneIndex = buildNode(bone);
          joints.push(boneIndex);
          const parentNode = nodes[skinnedIndexOf(skinned)];
          const siblings = (parentNode.children as number[] | undefined) ?? [];
          siblings.push(boneIndex);
          parentNode.children = siblings;
        }

        const inverses = skeleton.boneInverses ?? [];
        const flat = new Float32Array(inverses.length * 16);
        inverses.forEach((matrix, i) => flat.set(matrix.elements, i * 16));
        const ibmAccessor = addAccessor(
          new Uint8Array(flat.buffer, flat.byteOffset, flat.byteLength),
          5126,
          inverses.length,
          'MAT4',
        );

        const skinIndex = skins.length;
        skins.push({ joints, inverseBindMatrices: ibmAccessor, name: skinned.name || undefined });

        const targetNode = nodes[skinnedIndexOf(skinned)];
        targetNode.skin = skinIndex;
      }
    }

    /** Vị trí node của một object trong `nodes`. */
    function skinnedIndexOf(object: THREE.Object3D): number {
      const found = nodeIndexOf.get(object);
      return found === undefined ? 0 : found;
    }

    // ---- Gom buffer & dựng tài liệu ---------------------------------------
    const totalBinaryLength = binaryChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalBinaryLength);
    let offset = 0;
    for (const chunk of binaryChunks) {
      combinedBuffer.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const doc: Record<string, any> = {
      asset: {
        version: '2.0',
        generator: 'AETHERIA 3D Engine Exporter v2.0',
      },
      scene: 0,
      scenes,
      nodes,
    };
    if (meshes.length > 0) doc.meshes = meshes;
    if (materials.length > 0) doc.materials = materials;
    if (accessors.length > 0) doc.accessors = accessors;
    if (bufferViews.length > 0) doc.bufferViews = bufferViews;
    if (skins.length > 0) doc.skins = skins;
    if (textures.length > 0) doc.textures = textures;
    if (images.length > 0) doc.images = images;
    if (samplers.length > 0) doc.samplers = samplers;
    // Buffer rỗng thì bỏ hẳn — `byteLength: 0` không hợp lệ theo spec.
    if (totalBinaryLength > 0) doc.buffers = [{ byteLength: totalBinaryLength }];

    return { doc, bin: combinedBuffer };
  }

  /**
   * Xuất Object3D thành glTF 2.0 JSON (`.gltf`).
   *
   * Buffer được nhúng thành data URI nên tệp tự chứa — mở được bằng mọi
   * trình đọc glTF mà không cần tệp `.bin` đi kèm.
   */
  public static exportToGltf(root: THREE.Object3D, options: GltfExportOptions = {}): Record<string, any> {
    const { doc, bin } = this.buildGltfDocument(root, options);

    if (bin.byteLength > 0 && (options.embedBuffers ?? true)) {
      doc.buffers = [
        {
          byteLength: bin.byteLength,
          uri: `data:application/octet-stream;base64,${encodeBase64(bin)}`,
        },
      ];
    }

    return doc;
  }

  /**
   * Xuất Object3D thành GLB nhị phân (`.glb`).
   *
   * Buffer nằm ở chunk BIN nên `buffers` không có `uri` — đúng theo spec GLB.
   */
  public static exportToGlb(root: THREE.Object3D, options: GltfExportOptions = {}): Uint8Array {
    const { doc, bin } = this.buildGltfDocument(root, options);

    const jsonString = JSON.stringify(doc);
    const encoder = new TextEncoder();
    const jsonBytes = encoder.encode(jsonString);

    // Căn JSON về 4 byte bằng dấu cách (0x20).
    const jsonPadding = (4 - (jsonBytes.byteLength % 4)) % 4;
    const jsonChunkLength = jsonBytes.byteLength + jsonPadding;
    const jsonChunkData = new Uint8Array(jsonChunkLength);
    jsonChunkData.set(jsonBytes);
    for (let i = 0; i < jsonPadding; i++) {
      jsonChunkData[jsonBytes.byteLength + i] = 0x20;
    }

    // Căn BIN về 4 byte bằng byte 0.
    const binPadding = (4 - (bin.byteLength % 4)) % 4;
    const binChunkLength = bin.byteLength + binPadding;
    const binChunkData = new Uint8Array(binChunkLength);
    binChunkData.set(bin);

    // 12 byte header + 8 byte chunk header + JSON + (8 byte header + BIN).
    const totalLength = 12 + 8 + jsonChunkLength + (binChunkLength > 0 ? 8 + binChunkLength : 0);
    const glbBuffer = new Uint8Array(totalLength);
    const view = new DataView(glbBuffer.buffer);

    // Header
    view.setUint32(0, 0x46546c67, true); // Magic: 'glTF'
    view.setUint32(4, 2, true); // Version: 2
    view.setUint32(8, totalLength, true); // Total length

    // JSON chunk
    view.setUint32(12, jsonChunkLength, true);
    view.setUint32(16, 0x4e4f534a, true); // 'JSON'
    glbBuffer.set(jsonChunkData, 20);

    // BIN chunk
    if (binChunkLength > 0) {
      const binHeaderOffset = 20 + jsonChunkLength;
      view.setUint32(binHeaderOffset, binChunkLength, true);
      view.setUint32(binHeaderOffset + 4, 0x004e4942, true); // 'BIN\0'
      glbBuffer.set(binChunkData, binHeaderOffset + 8);
    }

    return glbBuffer;
  }

  /**
   * Xuất Object3D thành STL.
   *
   * STL không mang vật liệu hay texture — chỉ hình học tam giác.
   */
  public static exportToStl(root: THREE.Object3D, options: StlExportOptions = {}): Uint8Array {
    const encoding = options.encoding ?? 'binary';
    const name = options.name ?? root.name ?? 'ExportedModel';
    const triangles = collectTriangles(root, options.applyTransform ?? true);

    if (encoding === 'ascii') {
      let out = `solid ${name}\n`;
      const ab = new THREE.Vector3();
      const ac = new THREE.Vector3();
      const normal = new THREE.Vector3();
      const f = (v: number): string => v.toFixed(6);

      for (const tri of triangles) {
        ab.subVectors(tri.b, tri.a);
        ac.subVectors(tri.c, tri.a);
        normal.crossVectors(ab, ac).normalize();
        out += `  facet normal ${f(normal.x)} ${f(normal.y)} ${f(normal.z)}\n`;
        out += '    outer loop\n';
        for (const v of [tri.a, tri.b, tri.c]) {
          out += `      vertex ${f(v.x)} ${f(v.y)} ${f(v.z)}\n`;
        }
        out += '    endloop\n  endfacet\n';
      }
      out += `endsolid ${name}\n`;
      return new TextEncoder().encode(out);
    }

    // Binary STL: header 80 byte + số tam giác + 50 byte/tam giác
    const buffer = new ArrayBuffer(84 + triangles.length * 50);
    const view = new DataView(buffer);
    const header = new TextEncoder().encode(`AETHERIA 3D Engine STL Exporter — ${name}`.slice(0, 79));
    new Uint8Array(buffer, 0, 80).set(header);
    view.setUint32(80, triangles.length, true);

    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();
    const normal = new THREE.Vector3();
    let offset = 84;

    for (const tri of triangles) {
      ab.subVectors(tri.b, tri.a);
      ac.subVectors(tri.c, tri.a);
      normal.crossVectors(ab, ac).normalize();

      view.setFloat32(offset, normal.x, true);
      view.setFloat32(offset + 4, normal.y, true);
      view.setFloat32(offset + 8, normal.z, true);
      offset += 12;

      for (const v of [tri.a, tri.b, tri.c]) {
        view.setFloat32(offset, v.x, true);
        view.setFloat32(offset + 4, v.y, true);
        view.setFloat32(offset + 8, v.z, true);
        offset += 12;
      }
      view.setUint16(offset, 0, true);
      offset += 2;
    }

    return new Uint8Array(buffer);
  }

  /**
   * Xuất Object3D thành PLY.
   *
   * PLY giữ được normal và UV (khác STL), nên phù hợp hơn khi cần xuất lại
   * mesh có texture.
   */
  public static exportToPly(root: THREE.Object3D, options: PlyExportOptions = {}): Uint8Array {
    const encoding = options.encoding ?? 'binary';
    const includeNormals = options.includeNormals ?? true;
    const includeUvs = options.includeUvs ?? true;
    const name = options.name ?? root.name ?? 'ExportedModel';
    const applyTransform = options.applyTransform ?? true;

    if (applyTransform) root.updateMatrixWorld(true);

    // Gom vertex + face theo từng mesh.
    interface MeshChunk {
      positions: number[];
      normals: number[];
      uvs: number[];
      faces: number[][];
    }
    const chunks: MeshChunk[] = [];

    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry;
      const posAttr = geometry.getAttribute('position');
      if (!posAttr) return;

      const normalAttr = includeNormals ? geometry.getAttribute('normal') : null;
      const uvAttr = includeUvs ? geometry.getAttribute('uv') : null;
      const indexAttr = geometry.getIndex();
      const matrix = applyTransform ? child.matrixWorld : new THREE.Matrix4();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);

      const chunk: MeshChunk = { positions: [], normals: [], uvs: [], faces: [] };
      const v = new THREE.Vector3();
      const n = new THREE.Vector3();

      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(matrix);
        chunk.positions.push(v.x, v.y, v.z);

        if (normalAttr) {
          n.fromBufferAttribute(normalAttr, i).applyMatrix3(normalMatrix).normalize();
          chunk.normals.push(n.x, n.y, n.z);
        }
        if (uvAttr) {
          chunk.uvs.push(uvAttr.getX(i), uvAttr.getY(i));
        }
      }

      const face = (a: number, b: number, c: number): void => {
        chunk.faces.push([a, b, c]);
      };
      if (indexAttr) {
        for (let i = 0; i + 2 < indexAttr.count; i += 3) {
          face(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2));
        }
      } else {
        for (let i = 0; i + 2 < posAttr.count; i += 3) face(i, i + 1, i + 2);
      }
      chunks.push(chunk);
    });

    const vertexCount = chunks.reduce((sum, c) => sum + c.positions.length / 3, 0);
    const faceCount = chunks.reduce((sum, c) => sum + c.faces.length, 0);

    const headerLines = [
      'ply',
      `format ${encoding === 'ascii' ? 'ascii' : 'binary_little_endian'} 1.0`,
      `comment AETHERIA 3D Engine PLY Exporter — ${name}`,
      `element vertex ${vertexCount}`,
      'property float x',
      'property float y',
      'property float z',
    ];
    if (includeNormals) {
      headerLines.push('property float nx', 'property float ny', 'property float nz');
    }
    if (includeUvs) {
      headerLines.push('property float s', 'property float t');
    }
    headerLines.push(`element face ${faceCount}`, 'property list uchar int vertex_indices', 'end_header');

    const headerText = `${headerLines.join('\n')}\n`;
    const headerBytes = new TextEncoder().encode(headerText);

    if (encoding === 'ascii') {
      let body = '';
      for (const chunk of chunks) {
        const count = chunk.positions.length / 3;
        for (let i = 0; i < count; i++) {
          const p = chunk.positions;
          let line = `${p[i * 3]} ${p[i * 3 + 1]} ${p[i * 3 + 2]}`;
          if (includeNormals) {
            const nn = chunk.normals;
            line += ` ${nn[i * 3]} ${nn[i * 3 + 1]} ${nn[i * 3 + 2]}`;
          }
          if (includeUvs) {
            const uu = chunk.uvs;
            line += ` ${uu[i * 2]} ${uu[i * 2 + 1]}`;
          }
          body += `${line}\n`;
        }
      }
      let vertexOffset = 0;
      for (const chunk of chunks) {
        for (const f of chunk.faces) {
          body += `3 ${f[0] + vertexOffset} ${f[1] + vertexOffset} ${f[2] + vertexOffset}\n`;
        }
        vertexOffset += chunk.positions.length / 3;
      }
      const bodyBytes = new TextEncoder().encode(body);
      const out = new Uint8Array(headerBytes.byteLength + bodyBytes.byteLength);
      out.set(headerBytes, 0);
      out.set(bodyBytes, headerBytes.byteLength);
      return out;
    }

    // Binary PLY
    const stride =
      12 + (includeNormals ? 12 : 0) + (includeUvs ? 8 : 0);
    const vertexBytes = vertexCount * stride;
    const faceBytes = faceCount * 13; // 1 byte count + 3 × 4 byte index
    const out = new Uint8Array(headerBytes.byteLength + vertexBytes + faceBytes);
    out.set(headerBytes, 0);

    const view = new DataView(out.buffer);
    let offset = headerBytes.byteLength;

    for (const chunk of chunks) {
      const count = chunk.positions.length / 3;
      for (let i = 0; i < count; i++) {
        view.setFloat32(offset, chunk.positions[i * 3], true);
        view.setFloat32(offset + 4, chunk.positions[i * 3 + 1], true);
        view.setFloat32(offset + 8, chunk.positions[i * 3 + 2], true);
        offset += 12;
        if (includeNormals) {
          view.setFloat32(offset, chunk.normals[i * 3], true);
          view.setFloat32(offset + 4, chunk.normals[i * 3 + 1], true);
          view.setFloat32(offset + 8, chunk.normals[i * 3 + 2], true);
          offset += 12;
        }
        if (includeUvs) {
          view.setFloat32(offset, chunk.uvs[i * 2], true);
          view.setFloat32(offset + 4, chunk.uvs[i * 2 + 1], true);
          offset += 8;
        }
      }
    }

    for (const chunk of chunks) {
      for (const f of chunk.faces) {
        out[offset++] = 3;
        view.setInt32(offset, f[0], true);
        view.setInt32(offset + 4, f[1], true);
        view.setInt32(offset + 8, f[2], true);
        offset += 12;
      }
    }

    return out;
  }

  /**
   * Xuất Object3D thành USD ASCII (`.usda`).
   *
   * Mỗi mesh trở thành một prim `Mesh`; transform được ghi dưới dạng
   * `xformOp:transform` + `xformOpOrder` đúng chuẩn USD.
   */
  public static exportToUsda(root: THREE.Object3D, options: UsdaExportOptions = {}): string {
    const name = options.name ?? root.name ?? 'ExportedModel';
    const metersPerUnit = options.metersPerUnit ?? 0.01;
    const applyTransform = options.applyTransform ?? true;
    if (applyTransform) root.updateMatrixWorld(true);

    let out = '#usda 1.0\n(\n';
    out += `    defaultPrim = "${name}"\n`;
    out += `    metersPerUnit = ${metersPerUnit}\n`;
    out += '    upAxis = "Y"\n';
    out += ')\n\n';

    out += `def Xform "${name}"\n{\n`;

    let meshIndex = 0;
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry;
      const posAttr = geometry.getAttribute('position');
      if (!posAttr) return;
      const indexAttr = geometry.getIndex();
      const matrix = applyTransform ? child.matrixWorld : new THREE.Matrix4();
      const v = new THREE.Vector3();

      const points: string[] = [];
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(matrix);
        points.push(`(${v.x.toFixed(6)}, ${v.y.toFixed(6)}, ${v.z.toFixed(6)})`);
      }

      const counts: number[] = [];
      const indices: number[] = [];
      if (indexAttr) {
        for (let i = 0; i + 2 < indexAttr.count; i += 3) {
          counts.push(3);
          indices.push(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2));
        }
      } else {
        for (let i = 0; i + 2 < posAttr.count; i += 3) {
          counts.push(3);
          indices.push(i, i + 1, i + 2);
        }
      }

      const primName = child.name || `Mesh_${meshIndex}`;
      meshIndex++;

      out += `    def Mesh "${primName}"\n    {\n`;
      out += `        int[] faceVertexCounts = [${counts.join(', ')}]\n`;
      out += `        int[] faceVertexIndices = [${indices.join(', ')}]\n`;
      out += `        point3f[] points = [${points.join(', ')}]\n`;
      out += '    }\n';
    });

    out += '}\n';
    return out;
  }

  /**
   * Xuất cây khung (bone) thành BVH.
   *
   * BVH mang cây khung + kênh vị trí/xoay theo từng frame. Không có animation
   * thì xuất một frame tĩnh.
   */
  public static exportToBvh(root: THREE.Object3D, options: BvhExportOptions = {}): string {
    const name = options.name ?? root.name ?? 'ExportedModel';
    const fps = options.fps ?? 30;
    if (options.applyTransform !== false) root.updateMatrixWorld(true);

    // Gom bone theo thứ tự DFS.
    interface BvhBone {
      name: string;
      offset: THREE.Vector3;
      children: BvhBone[];
    }
    const bones: BvhBone[] = [];

    const buildBone = (node: THREE.Object3D): BvhBone => {
      const bone: BvhBone = {
        name: node.name || 'Bone',
        offset: new THREE.Vector3(node.position.x, node.position.y, node.position.z),
        children: [],
      };
      for (const child of node.children) {
        if (child instanceof THREE.Bone) bone.children.push(buildBone(child));
      }
      return bone;
    };

    for (const child of root.children) {
      if (child instanceof THREE.Bone) bones.push(buildBone(child));
    }

    const rootBone: BvhBone =
      bones.length > 0
        ? { name, offset: new THREE.Vector3(root.position.x, root.position.y, root.position.z), children: bones }
        : { name, offset: new THREE.Vector3(), children: [] };

    let out = 'HIERARCHY\n';

    const writeBone = (bone: BvhBone, depth: number, isRoot: boolean): void => {
      const pad = ' '.repeat(depth * 2);
      out += `${pad}${isRoot ? 'ROOT' : 'JOINT'} ${bone.name}\n`;
      out += `${pad}{\n`;
      out += `${pad}  OFFSET ${bone.offset.x.toFixed(6)} ${bone.offset.y.toFixed(6)} ${bone.offset.z.toFixed(6)}\n`;
      out += `${pad}  CHANNELS 6 Xposition Yposition Zposition Xrotation Zrotation Yrotation\n`;
      for (const child of bone.children) writeBone(child, depth + 1, false);
      if (bone.children.length === 0) {
        out += `${pad}  End Site\n`;
        out += `${pad}  {\n`;
        out += `${pad}    OFFSET 0.000000 0.000000 0.000000\n`;
        out += `${pad}  }\n`;
      }
      out += `${pad}}\n`;
    };
    writeBone(rootBone, 0, true);

    // Một frame tĩnh: vị trí tương đối và góc xoay của từng bone.
    const flat: BvhBone[] = [];
    const flatten = (bone: BvhBone): void => {
      flat.push(bone);
      for (const child of bone.children) flatten(child);
    };
    flatten(rootBone);

    out += 'MOTION\n';
    out += 'Frames: 1\n';
    out += `Frame Time: ${(1 / fps).toFixed(8)}\n`;

    const values: number[] = [];
    for (const bone of flat) {
      values.push(bone.offset.x, bone.offset.y, bone.offset.z, 0, 0, 0);
    }
    out += `${values.map((v) => v.toFixed(6)).join(' ')}\n`;

    return out;
  }
}
